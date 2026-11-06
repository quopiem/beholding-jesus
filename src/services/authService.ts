import { 
  UserProfile, UserRole, AuthCredential, AuthSession, 
  PasswordRecoveryRequest, AuthResult, RegistrationData 
} from '../types';
import { ChurchDataStore } from './churchDataStore';
import { supabase } from '../lib/supabase';

const STORAGE_CREDENTIALS = 'bjc_auth_credentials_v1';
const STORAGE_SESSION = 'bjc_auth_session_v1';
const STORAGE_RECOVERY = 'bjc_auth_recovery_v1';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export class AuthService {
  // -------------------------------------------------------------
  // 1. CRYPTOGRAPHIC HELPERS (Web Crypto API SHA-256 + Salt)
  // -------------------------------------------------------------
  static generateSalt(): string {
    const array = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 16; i++) array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password + 'bjc_salt_key_2026');
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // -------------------------------------------------------------
  // 2. CREDENTIAL STORAGE & INITIAL SEEDING
  // -------------------------------------------------------------
  static getCredentials(): AuthCredential[] {
    try {
      const raw = localStorage.getItem(STORAGE_CREDENTIALS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  }

  private static saveCredentials(creds: AuthCredential[]): void {
    localStorage.setItem(STORAGE_CREDENTIALS, JSON.stringify(creds));
  }

  // Seed default credentials for existing church demo users on first load
  static async initializeDefaultCredentials(): Promise<void> {
    // If Supabase is connected, do NOT seed mock demo accounts!
    if (supabase) return;

    const existing = this.getCredentials();
    if (existing.length === 0) {
      const defaultPasswords: Record<string, string> = {
        johnmiko: 'Password123!'
      };

      const users = ChurchDataStore.getUsers();
      const initialCreds: AuthCredential[] = [];

      for (const u of users) {
        const uname = (u.username || u.name.toLowerCase().replace(/[^a-z0-9]/g, '')).toLowerCase();
        const pwd = defaultPasswords[uname] || 'Member2026!';
        const salt = this.generateSalt();
        const passwordHash = await this.hashPassword(pwd, salt);

        initialCreds.push({
          userId: u.id,
          username: uname,
          salt,
          passwordHash,
          failedAttempts: 0,
          lockoutUntil: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      this.saveCredentials(initialCreds);
    }
  }

  // Auto-sync all local users and accounts into Supabase Cloud
  static async syncLocalUsersToCloud(): Promise<void> {
    // No-op: Supabase Cloud is the single source of truth for accounts.
    return;
  }

  // -------------------------------------------------------------
  // 3. VALIDATION & USERNAME AVAILABILITY
  // -------------------------------------------------------------
  static checkUsernameAvailability(rawUsername: string): { available: boolean; error?: string } {
    const username = rawUsername.trim().toLowerCase();

    if (!username) {
      return { available: false, error: 'Username is required.' };
    }

    if (username.length < 3 || username.length > 20) {
      return { available: false, error: 'Username must be between 3 and 20 characters.' };
    }

    const validPattern = /^[a-z0-9_.]+$/;
    if (!validPattern.test(username)) {
      return { available: false, error: 'Username can only contain letters, numbers, underscores, and periods.' };
    }

    const users = ChurchDataStore.getUsers();
    const isTaken = users.some(u => u.username?.toLowerCase() === username);

    if (isTaken) {
      return { available: false, error: 'This username is already taken. Please choose another.' };
    }

    return { available: true };
  }

  static validateRegistration(data: RegistrationData): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your real full name (at least 2 characters).';
    }

    const usernameCheck = this.checkUsernameAvailability(data.username);
    if (!usernameCheck.available) {
      errors.username = usernameCheck.error!;
    }

    if (!data.password || data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(data.password)) {
      errors.password = 'Password must contain both letters and numbers.';
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  // -------------------------------------------------------------
  // 4. REGISTRATION WORKFLOW
  // -------------------------------------------------------------
  static async register(data: RegistrationData): Promise<AuthResult> {
    const validation = this.validateRegistration(data);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError };
    }

    const username = data.username.trim().toLowerCase();
    const salt = this.generateSalt();
    const passwordHash = await this.hashPassword(data.password, salt);
    const newUserId = `user-${Date.now()}`;

    // Security: Default role is strictly 'regular_member' with 'Church Member' title.
    // Regular members cannot self-assign administrator or pastor roles.
    const newProfile: UserProfile = {
      id: newUserId,
      name: data.fullName.trim(),
      username,
      email: data.email?.trim() || `${username}@beholdingjesus.org`,
      role: 'regular_member',
      roleTitle: 'Church Member',
      avatar: '/icons/church-logo.png',
      bio: 'Faithful member of Beholding Jesus Church.',
      ministryIds: [],
      joinedDate: new Date().toISOString().split('T')[0]
    };

    // Store in credential database
    const creds = this.getCredentials();
    creds.push({
      userId: newUserId,
      username,
      salt,
      passwordHash,
      failedAttempts: 0,
      lockoutUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    this.saveCredentials(creds);

    // Sync to Supabase Cloud Database so account works on mobile and all devices
    if (supabase) {
      try {
        await supabase.from('church_members_auth').insert({
          id: newUserId,
          username,
          name: data.fullName.trim(),
          email: newProfile.email,
          role: 'regular_member',
          role_title: 'Church Member',
          avatar: newProfile.avatar,
          bio: newProfile.bio,
          salt,
          password_hash: passwordHash,
          failed_attempts: 0,
          lockout_until: null
        });
      } catch (err) {
        console.warn('Supabase cloud registration fallback:', err);
      }
    }

    // Save profile in user store
    ChurchDataStore.addUser(newProfile);

    // Auto-create a welcome notification
    ChurchDataStore.addNotification({
      userId: newUserId,
      type: 'system',
      title: 'Welcome to Beholding Jesus Church!',
      message: `Praise God! Your account @${username} is registered. You can now access Scripture, prayer chain, and community features.`,
      linkRoute: 'home'
    });

    return {
      success: true,
      user: newProfile
    };
  }

  // -------------------------------------------------------------
  // 5. LOGIN WORKFLOW (With Rate Limiting & Lockout & Cloud Supabase Sync)
  // -------------------------------------------------------------
  static async login(rawUsername: string, rawPassword: string): Promise<AuthResult> {
    await this.initializeDefaultCredentials();

    const username = rawUsername.trim().toLowerCase();
    let credential: AuthCredential | null = null;
    let cloudUserObj: UserProfile | null = null;

    // 1. First check Supabase Cloud Database (for accounts registered on mobile/PC)
    if (supabase) {
      try {
        const { data: cloudMember, error } = await supabase
          .from('church_members_auth')
          .select('*')
          .eq('username', username)
          .maybeSingle();

        if (cloudMember && !error) {
          credential = {
            userId: cloudMember.id,
            username: cloudMember.username,
            salt: cloudMember.salt,
            passwordHash: cloudMember.password_hash,
            failedAttempts: cloudMember.failed_attempts || 0,
            lockoutUntil: cloudMember.lockout_until || null,
            createdAt: cloudMember.created_at,
            updatedAt: cloudMember.updated_at
          };
          cloudUserObj = {
            id: cloudMember.id,
            name: cloudMember.name,
            username: cloudMember.username,
            email: cloudMember.email,
            role: cloudMember.role,
            roleTitle: cloudMember.role_title,
            avatar: cloudMember.avatar || '/icons/church-logo.png',
            bio: cloudMember.bio || 'Faithful member of Beholding Jesus Church.',
            ministryIds: [],
            joinedDate: cloudMember.created_at ? cloudMember.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
          };
        }
      } catch (err) {
        console.warn('Cloud login fetch error:', err);
      }
    }

    // 2. If not found in cloud, fall back to local credentials (for demo users / offline)
    if (!credential) {
      const creds = this.getCredentials();
      credential = creds.find(c => c.username === username) || null;
    }

    // Rate Limiting & Account Lockout Check
    if (credential && credential.lockoutUntil) {
      const lockoutTime = new Date(credential.lockoutUntil).getTime();
      const now = Date.now();
      if (now < lockoutTime) {
        const remainingMinutes = Math.ceil((lockoutTime - now) / 60000);
        return {
          success: false,
          error: `Account temporarily locked due to multiple failed attempts. Please try again in ${remainingMinutes} minute(s) or request administrator assistance.`
        };
      } else {
        // Lockout expired, reset
        credential.lockoutUntil = null;
        credential.failedAttempts = 0;
        const creds = this.getCredentials();
        const idx = creds.findIndex(c => c.username === username);
        if (idx >= 0) {
          creds[idx].failedAttempts = 0;
          creds[idx].lockoutUntil = null;
          this.saveCredentials(creds);
        }
      }
    }

    if (!credential) {
      // Prevent username enumeration by using generic error message
      return {
        success: false,
        error: 'Invalid username or password. Please try again.'
      };
    }

    // Verify Password Hash
    const testHash = await this.hashPassword(rawPassword, credential.salt);
    if (testHash !== credential.passwordHash) {
      credential.failedAttempts = (credential.failedAttempts || 0) + 1;

      if (credential.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutDate = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        credential.lockoutUntil = lockoutDate.toISOString();
        
        if (supabase && cloudUserObj) {
          supabase.from('church_members_auth').update({
            failed_attempts: credential.failedAttempts,
            lockout_until: credential.lockoutUntil
          }).eq('username', username).then();
        }

        return {
          success: false,
          error: `Account locked for ${LOCKOUT_MINUTES} minutes due to ${MAX_FAILED_ATTEMPTS} failed attempts. Please contact a church administrator for password recovery.`
        };
      }

      if (supabase && cloudUserObj) {
        supabase.from('church_members_auth').update({
          failed_attempts: credential.failedAttempts
        }).eq('username', username).then();
      }

      const attemptsLeft = MAX_FAILED_ATTEMPTS - credential.failedAttempts;
      return {
        success: false,
        error: `Invalid username or password. (${attemptsLeft} attempt(s) remaining)`
      };
    }

    // Successful Login: Reset failed attempts
    credential.failedAttempts = 0;
    credential.lockoutUntil = null;
    if (supabase && cloudUserObj) {
      supabase.from('church_members_auth').update({
        failed_attempts: 0,
        lockout_until: null
      }).eq('username', username).then();
    }

    // Resolve user profile
    let user: UserProfile;
    if (cloudUserObj) {
      user = cloudUserObj;
      ChurchDataStore.addUser(cloudUserObj);
    } else {
      const users = ChurchDataStore.getUsers();
      user = users.find(u => u.id === credential!.userId || u.username === username) || users[0];

      // Auto-sync demo user / App Owner to Supabase so they can log in from mobile too!
      if (supabase && credential) {
        supabase.from('church_members_auth').upsert({
          id: user.id,
          username: credential.username,
          name: user.name,
          email: user.email,
          role: user.role,
          role_title: user.roleTitle,
          avatar: user.avatar,
          bio: user.bio,
          salt: credential.salt,
          password_hash: credential.passwordHash,
          failed_attempts: 0,
          lockout_until: null
        }).then();
      }
    }

    // Create Secure Session
    const sessionToken = `bjc_sess_${Date.now()}_${this.generateSalt()}`;
    const session: AuthSession = {
      token: sessionToken,
      userId: user.id,
      username: credential.username,
      role: user.role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
    ChurchDataStore.setCurrentUser(user.id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_auth_change'));
    }

    return {
      success: true,
      user,
      session
    };
  }

  // -------------------------------------------------------------
  // 6. SESSION MANAGEMENT & LOGOUT
  // -------------------------------------------------------------
  static getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION);
      if (!raw) return null;
      const sess: AuthSession = JSON.parse(raw);
      if (new Date(sess.expiresAt).getTime() < Date.now()) {
        this.logout();
        return null;
      }
      return sess;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_SESSION);
    localStorage.removeItem('bjc_current_user_id_v2');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_auth_change'));
    }
  }

  // -------------------------------------------------------------
  // 7. ADMINISTRATOR-ASSISTED ACCOUNT RECOVERY
  // -------------------------------------------------------------
  static getRecoveryRequests(): PasswordRecoveryRequest[] {
    try {
      const raw = localStorage.getItem(STORAGE_RECOVERY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: 'rec-sample-1',
        userId: 'user-member-kyle',
        username: 'kyle',
        fullName: 'Kyle Evangelista',
        status: 'pending',
        requestReason: 'Forgot password after mobile phone switch. Need access for youth worship rehearsal.',
        createdAt: '2026-11-03T18:00:00.000Z'
      }
    ];
  }

  private static saveRecoveryRequests(reqs: PasswordRecoveryRequest[]): void {
    localStorage.setItem(STORAGE_RECOVERY, JSON.stringify(reqs));
  }

  static requestAccountRecovery(username: string, reason: string): { success: boolean; message: string } {
    const uname = username.trim().toLowerCase();
    const users = ChurchDataStore.getUsers();
    const found = users.find(u => u.username?.toLowerCase() === uname);

    if (!found) {
      // Don't leak whether username exists or not
      return {
        success: true,
        message: 'If the username exists in our church directory, your recovery request has been submitted to church leadership.'
      };
    }

    const reqs = this.getRecoveryRequests();
    const newReq: PasswordRecoveryRequest = {
      id: `rec-${Date.now()}`,
      userId: found.id,
      username: uname,
      fullName: found.name,
      status: 'pending',
      requestReason: reason || 'Password reset requested by member.',
      createdAt: new Date().toISOString()
    };

    reqs.unshift(newReq);
    this.saveRecoveryRequests(reqs);

    return {
      success: true,
      message: 'Your account recovery request has been securely submitted to the church administration team.'
    };
  }

  static async adminResolveRecovery(
    requestId: string,
    adminUserId: string,
    newTempPassword?: string
  ): Promise<{ success: boolean; tempPassword?: string; error?: string }> {
    const admin = ChurchDataStore.getCurrentUser();
    if (!admin) {
      return { success: false, error: 'Unauthorized: No active admin session found.' };
    }
    const allowed = ['super_admin', 'church_admin', 'pastor'];
    if (!allowed.includes(admin.role)) {
      return { success: false, error: 'Unauthorized: Only pastors and church administrators can perform account recovery.' };
    }

    const reqs = this.getRecoveryRequests();
    const req = reqs.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Recovery request not found.' };

    const tempPassword = newTempPassword || `Bjc${Math.floor(100000 + Math.random() * 900000)}!`;
    const creds = this.getCredentials();
    const cred = creds.find(c => c.userId === req.userId || c.username === req.username);

    if (cred) {
      const newSalt = this.generateSalt();
      cred.salt = newSalt;
      cred.passwordHash = await this.hashPassword(tempPassword, newSalt);
      cred.failedAttempts = 0;
      cred.lockoutUntil = null;
      cred.updatedAt = new Date().toISOString();
      this.saveCredentials(creds);
    }

    req.status = 'resolved';
    req.temporaryPassword = tempPassword;
    req.resolvedAt = new Date().toISOString();
    req.resolvedBy = admin.name;
    this.saveRecoveryRequests(reqs);

    return { success: true, tempPassword };
  }
}
