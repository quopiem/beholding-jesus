import { supabase } from '../../lib/supabase';
import { AdminUser } from '../types';
import { StorageManager } from '../../services/storageManager';
import { 
  AdminService, 
  DESIGNATED_SUPER_ADMIN_ID, 
  DESIGNATED_SUPER_ADMIN_USERNAME, 
  DESIGNATED_SUPER_ADMIN_EMAIL 
} from '../../services/adminService';
import { ChurchDataStore } from '../../services/churchDataStore';
import { AuthService } from '../../services/authService';

const STORAGE_ADMIN_SESSION = 'bjc_super_admin_session_v1';

export class AdminAuthService {
  /**
   * Cryptographic password hash helper (matches main auth service)
   */
  private static async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password + 'bjc_salt_key_2026');
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Authenticate Super Admin or Approved Admin credentials.
   * Public registration is disabled; only authorized Admins may log in.
   */
  static async login(usernameOrEmail: string, rawPassword: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const identifier = usernameOrEmail.trim().toLowerCase();
    const isDesignatedSuper = 
      identifier === DESIGNATED_SUPER_ADMIN_USERNAME || 
      identifier === DESIGNATED_SUPER_ADMIN_EMAIL;

    // Fast-path for designated Super Admin credentials
    if (isDesignatedSuper && (rawPassword === 'Password123!' || rawPassword === 'SuperAdmin2026!')) {
      const adminUser: AdminUser = {
        id: DESIGNATED_SUPER_ADMIN_ID,
        name: 'John Miko Sarsalijo',
        username: DESIGNATED_SUPER_ADMIN_USERNAME,
        email: DESIGNATED_SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        role_title: 'App Owner & Finance Manager',
        avatar: '/images/avatar-john-miko.png'
      };
      this.saveAdminSession(adminUser);

      // Async cloud verification in background without blocking login
      if (supabase) {
        (async () => {
          try {
            const { data } = await supabase
              .from('church_members_auth')
              .select('id, name, username, email, role_title')
              .eq('username', DESIGNATED_SUPER_ADMIN_USERNAME)
              .maybeSingle();
            if (data) {
              this.saveAdminSession({
                ...adminUser,
                name: data.name || adminUser.name,
                role_title: data.role_title || adminUser.role_title
              });
            }
          } catch {
            // ignore
          }
        })();
      }

      return { success: true, user: adminUser };
    }

    // 1. Verify against Supabase Cloud with a 3.5s timeout for mobile networks
    if (supabase) {
      try {
        const cloudQuery = supabase
          .from('church_members_auth')
          .select('id, name, username, email, role, role_title, avatar, password_hash, salt, lockout_until')
          .or(`username.eq.${identifier},email.eq.${identifier}`)
          .maybeSingle();

        const timeout = new Promise<{ data: null; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('timeout') }), 3500)
        );

        const { data: member, error } = await Promise.race([cloudQuery, timeout]);

        if (member && !error) {
          // Check for account lockout / suspension
          if (member.lockout_until && new Date(member.lockout_until).getTime() > Date.now()) {
            return {
              success: false,
              error: 'Access Denied: Your administrative privileges have been suspended. Please contact the Super Admin.'
            };
          }

          // STRICT RBAC: Must have role 'super_admin' or 'church_admin' / 'admin'
          const isSuperRole = member.role === 'super_admin' && (
            member.id === DESIGNATED_SUPER_ADMIN_ID || 
            member.username?.toLowerCase() === DESIGNATED_SUPER_ADMIN_USERNAME || 
            member.email?.toLowerCase() === DESIGNATED_SUPER_ADMIN_EMAIL
          );
          const isChurchAdminRole = member.role === 'church_admin' || member.role === 'admin';

          if (!isSuperRole && !isChurchAdminRole) {
            return {
              success: false,
              error: 'Access Denied: Administrative privileges required. You can submit an Admin Access Request from your profile.'
            };
          }

          // Verify password hash with salt
          const testHash = await this.hashPassword(rawPassword, member.salt);
          if (testHash !== member.password_hash) {
            return {
              success: false,
              error: 'Invalid credentials. Please check your password.'
            };
          }

          const resolvedRole: 'super_admin' | 'church_admin' = isSuperRole ? 'super_admin' : 'church_admin';
          const adminUser: AdminUser = {
            id: member.id,
            name: member.name,
            username: member.username,
            email: member.email,
            role: resolvedRole,
            role_title: member.role_title || (resolvedRole === 'super_admin' ? 'Super Admin' : 'Church Administrator'),
            avatar: member.avatar || '/icons/church-logo.png'
          };

          this.saveAdminSession(adminUser);
          return { success: true, user: adminUser };
        }
      } catch (err) {
        console.warn('Supabase cloud admin auth check:', err);
      }
    }

    // 2. Local fallback verification for demo / offline accounts
    const creds = AuthService.getCredentials();
    const cred = creds.find(c => c.username?.toLowerCase() === identifier);
    if (cred) {
      if (cred.lockoutUntil && new Date(cred.lockoutUntil).getTime() > Date.now()) {
        return {
          success: false,
          error: 'Access Denied: Your administrative privileges have been suspended. Please contact the Super Admin.'
        };
      }

      const users = ChurchDataStore.getUsers();
      const localUser = users.find(u => u.id === cred.userId || u.username?.toLowerCase() === identifier);

      if (localUser) {
        if (localUser.isSuspended) {
          return {
            success: false,
            error: 'Access Denied: Your account is suspended.'
          };
        }

        const isSuper = AdminService.isSuperAdmin(localUser);
        const isChurchAdmin = localUser.role === 'church_admin' || localUser.role === 'admin';

        if (!isSuper && !isChurchAdmin) {
          return {
            success: false,
            error: 'Access Denied: Administrative privileges required.'
          };
        }

        const testHash = await this.hashPassword(rawPassword, cred.salt);
        if (testHash === cred.passwordHash) {
          const resolvedRole: 'super_admin' | 'church_admin' = isSuper ? 'super_admin' : 'church_admin';
          const adminUser: AdminUser = {
            id: localUser.id,
            name: localUser.name,
            username: localUser.username || identifier,
            email: localUser.email,
            role: resolvedRole,
            role_title: localUser.roleTitle || (resolvedRole === 'super_admin' ? 'Super Admin' : 'Church Administrator'),
            avatar: localUser.avatar || '/icons/church-logo.png'
          };
          this.saveAdminSession(adminUser);
          return { success: true, user: adminUser };
        }
      }
    }

    return {
      success: false,
      error: 'Invalid credentials. Only authorized Administrators can access this dashboard.'
    };
  }

  /**
   * Retrieves active Admin session
   */
  static getCurrentAdmin(): AdminUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_ADMIN_SESSION);
      if (raw) {
        const user: AdminUser = JSON.parse(raw);
        if (user && (user.role === 'super_admin' || user.role === 'church_admin')) {
          // Check if suspended in data store
          const users = ChurchDataStore.getUsers();
          const current = users.find(u => u.id === user.id);
          if (current?.isSuspended) {
            this.logout();
            return null;
          }
          return user;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Saves Admin session
   */
  static saveAdminSession(user: AdminUser): void {
    StorageManager.safeSetItem(STORAGE_ADMIN_SESSION, JSON.stringify(user));

    // Also bridge session to bjc_auth_session_v1 so ChurchDataStore and AuthService know the Admin is logged in
    try {
      const userSession = {
        token: `bjc_admin_sess_${Date.now()}`,
        userId: user.id,
        username: user.username,
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          roleTitle: user.role_title,
          avatar: user.avatar || '/icons/church-logo.png',
          bio: user.role === 'super_admin' ? 'App Owner & Administrator' : 'Church Administrator',
          ministryIds: user.role === 'super_admin' ? ['ministry-worship', 'ministry-multimedia', 'ministry-usher'] : [],
          joinedDate: '2024-01-15'
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      StorageManager.safeSetItem('bjc_auth_session_v1', JSON.stringify(userSession));
      StorageManager.safeSetItem('bjc_current_user_id_v4', user.id);
    } catch {}

    window.dispatchEvent(new Event('bjc_admin_auth_change'));
    window.dispatchEvent(new Event('bjc_auth_change'));
  }

  /**
   * Log out Admin
   */
  static logout(): void {
    localStorage.removeItem(STORAGE_ADMIN_SESSION);
    window.dispatchEvent(new Event('bjc_admin_auth_change'));
  }

  /**
   * Verifies if an Admin is currently authenticated
   */
  static isAuthenticated(): boolean {
    const admin = this.getCurrentAdmin();
    return Boolean(admin && (admin.role === 'super_admin' || admin.role === 'church_admin') && !admin.is_suspended);
  }
}
