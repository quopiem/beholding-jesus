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

    const isMinistryMember = data.role === 'ministry_member';
    const targetMinId = data.targetMinistryId || 'ministry-worship';
    const targetMinName = targetMinId === 'ministry-worship' 
      ? 'Worship Team' 
      : targetMinId === 'ministry-usher' 
        ? 'Ushering Team' 
        : 'Multimedia Team';

    const newProfile: UserProfile = {
      id: newUserId,
      name: data.fullName.trim(),
      username,
      email: data.email?.trim() || `${username}@beholdingjesus.org`,
      role: isMinistryMember ? 'ministry_member' : 'regular_member',
      roleTitle: isMinistryMember ? 'Ministry Member (Pending Verification)' : 'Church Member',
      avatar: '/icons/church-logo.png',
      bio: isMinistryMember 
        ? `Ministry applicant for ${targetMinName}.`
        : 'Faithful member of Beholding Jesus Church.',
      ministryIds: isMinistryMember ? [targetMinId] : [],
      approvalStatus: isMinistryMember ? 'pending' : 'active',
      targetMinistryId: targetMinId,
      ministryMessage: data.ministryMessage || '',
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
          role: newProfile.role,
          role_title: newProfile.roleTitle,
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
    if (isMinistryMember) {
      ChurchDataStore.addNotification({
        userId: newUserId,
        type: 'system',
        title: 'Ministry Application Submitted',
        message: `Praise God! Your registration for the ${targetMinName} has been submitted. Your account is pending confirmation and verification by the Super Admin.`,
        linkRoute: 'home'
      });
    } else {
      ChurchDataStore.addNotification({
        userId: newUserId,
        type: 'system',
        title: 'Welcome to Beholding Jesus Church!',
        message: `Praise God! Your account @${username} is registered as a Church Member. You can now access Scripture, prayer chain, and community features.`,
        linkRoute: 'home'
      });
    }

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

    // Check verification approval status for Ministry Members
    if (user.role === 'ministry_member' && user.approvalStatus === 'pending') {
      return {
        success: false,
        isPendingApproval: true,
        user,
        error: `Your account registration as a Ministry Member is currently pending confirmation and verification by the Super Admin. You will be able to log in once your account is verified.`
      };
    }

    if (user.approvalStatus === 'rejected') {
      return {
        success: false,
        isRejected: true,
        user,
        error: `Your registration for ministry membership was not confirmed at this time. Please contact church leadership or pastoral directors.`
      };
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
    return [];
  }

  private static _lastRecoveryFetchTime = 0;
  private static _cachedRecoveryReqs: PasswordRecoveryRequest[] = [];

  private static saveRecoveryRequests(reqs: PasswordRecoveryRequest[]): void {
    localStorage.setItem(STORAGE_RECOVERY, JSON.stringify(reqs));
  }

  static async fetchRecoveryRequestsFromCloud(force: boolean = false): Promise<PasswordRecoveryRequest[]> {
    if (!supabase) return this.getRecoveryRequests();
    const now = Date.now();
    if (!force && this._cachedRecoveryReqs.length > 0 && now - this._lastRecoveryFetchTime < 4000) {
      return this._cachedRecoveryReqs;
    }
    try {
      const { data, error } = await supabase
        .from('church_prayer_requests')
        .select('*')
        .eq('category', 'sys_account_recovery')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const cloudRequests: PasswordRecoveryRequest[] = data.map(d => {
          let meta: any = {};
          try { meta = JSON.parse(d.testimony_text || '{}'); } catch {}
          return {
            id: d.id,
            userId: d.user_id,
            username: d.title,
            fullName: d.author_name || d.title,
            status: meta.status || (d.is_answered ? 'resolved' : 'pending'),
            requestReason: d.description || 'Password reset requested by member.',
            temporaryPassword: meta.tempPassword || d.target_ministry_id,
            resolvedBy: meta.resolvedBy,
            resolvedAt: meta.resolvedAt,
            createdAt: d.created_at
          };
        });

        // Merge with any local recovery requests
        const localRequests = this.getRecoveryRequests();
        const mergedMap = new Map<string, PasswordRecoveryRequest>();

        cloudRequests.forEach(r => mergedMap.set(r.id, r));
        localRequests.forEach(r => {
          if (!mergedMap.has(r.id)) {
            mergedMap.set(r.id, r);
            // Push missing local request to cloud
            supabase?.from('church_prayer_requests').upsert({
              id: r.id,
              user_id: r.userId,
              author_name: r.fullName,
              is_anonymous: false,
              category: 'sys_account_recovery',
              title: r.username,
              description: r.requestReason || '',
              visibility: 'admin_only',
              target_ministry_id: r.temporaryPassword || '',
              is_answered: r.status === 'resolved',
              testimony_text: JSON.stringify({
                status: r.status,
                tempPassword: r.temporaryPassword,
                resolvedBy: r.resolvedBy,
                resolvedAt: r.resolvedAt
              }),
              created_at: r.createdAt
            }).then();
          }
        });

        const merged = Array.from(mergedMap.values());
        this.saveRecoveryRequests(merged);
        this._lastRecoveryFetchTime = Date.now();
        this._cachedRecoveryReqs = merged;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('bjc_recovery_change'));
        }
        return merged;
      }
    } catch (e) {
      console.warn('fetchRecoveryRequestsFromCloud error:', e);
    }
    const fallback = this.getRecoveryRequests();
    this._cachedRecoveryReqs = fallback;
    return fallback;
  }

  static subscribeToRecoveryRequests(onUpdate: (reqs: PasswordRecoveryRequest[]) => void) {
    if (!supabase) return () => {};
    const channel = supabase
      .channel('public:sys_account_recovery')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'church_prayer_requests' },
        async (payload: any) => {
          if (payload.new?.category === 'sys_account_recovery' || payload.old?.category === 'sys_account_recovery') {
            const fresh = await AuthService.fetchRecoveryRequestsFromCloud();
            onUpdate(fresh);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  static async requestAccountRecovery(username: string, reason: string): Promise<{ success: boolean; message: string }> {
    const uname = username.trim().toLowerCase();
    const users = ChurchDataStore.getUsers();
    let found = users.find(u => u.username?.toLowerCase() === uname);

    // If not in local cache, check Supabase Cloud
    if (!found && supabase) {
      try {
        const { data } = await supabase
          .from('church_members_auth')
          .select('id, name, username')
          .eq('username', uname)
          .maybeSingle();
        if (data) {
          found = {
            id: data.id,
            name: data.name,
            username: data.username,
            email: `${uname}@beholdingjesus.org`,
            role: 'regular_member',
            roleTitle: 'Church Member',
            avatar: '',
            bio: '',
            joinedDate: '2026-11-04'
          };
        }
      } catch (err) {
        console.warn('Check user for recovery error:', err);
      }
    }

    const reqs = this.getRecoveryRequests();
    const newReq: PasswordRecoveryRequest = {
      id: `rec-${Date.now()}`,
      userId: found ? found.id : `user-${uname}`,
      username: uname,
      fullName: found ? found.name : uname,
      status: 'pending',
      requestReason: reason || 'Password reset requested by member.',
      createdAt: new Date().toISOString()
    };

    reqs.unshift(newReq);
    this.saveRecoveryRequests(reqs);

    // Sync to Supabase Cloud so Super Admin sees it across all devices
    if (supabase) {
      try {
        await supabase.from('church_prayer_requests').upsert({
          id: newReq.id,
          user_id: newReq.userId,
          author_name: newReq.fullName,
          is_anonymous: false,
          category: 'sys_account_recovery',
          title: uname,
          description: newReq.requestReason,
          visibility: 'admin_only',
          target_ministry_id: '',
          is_answered: false,
          testimony_text: JSON.stringify({ status: 'pending' }),
          created_at: newReq.createdAt
        });
      } catch (err) {
        console.warn('Upsert recovery to Supabase fallback:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_recovery_change'));
      window.dispatchEvent(new Event('storage'));
    }

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
    const newSalt = this.generateSalt();
    const newPasswordHash = await this.hashPassword(tempPassword, newSalt);

    const creds = this.getCredentials();
    const cred = creds.find(c => c.userId === req.userId || c.username === req.username);

    if (cred) {
      cred.salt = newSalt;
      cred.passwordHash = newPasswordHash;
      cred.failedAttempts = 0;
      cred.lockoutUntil = null;
      cred.updatedAt = new Date().toISOString();
      this.saveCredentials(creds);
    }

    // Direct Cloud Reset in Supabase so user can log in immediately from mobile or PC
    if (supabase) {
      try {
        await supabase
          .from('church_members_auth')
          .update({
            salt: newSalt,
            password_hash: newPasswordHash,
            failed_attempts: 0,
            lockout_until: null,
            updated_at: new Date().toISOString()
          })
          .or(`username.ilike.${req.username},id.eq.${req.userId}`);

        await supabase
          .from('church_prayer_requests')
          .update({
            is_answered: true,
            target_ministry_id: tempPassword,
            testimony_text: JSON.stringify({
              status: 'resolved',
              tempPassword,
              resolvedBy: admin.name,
              resolvedAt: new Date().toISOString()
            })
          })
          .eq('id', requestId);
      } catch (err) {
        console.warn('Cloud password reset error:', err);
      }
    }

    req.status = 'resolved';
    req.temporaryPassword = tempPassword;
    req.resolvedAt = new Date().toISOString();
    req.resolvedBy = admin.name;
    this.saveRecoveryRequests(reqs);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_recovery_change'));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true, tempPassword };
  }
}
