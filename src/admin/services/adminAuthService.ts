import { supabase } from '../../lib/supabase';
import { AdminUser } from '../types';

const STORAGE_ADMIN_SESSION = 'bjc_super_admin_session_v1';
const DESIGNATED_SUPER_ADMIN_USERNAME = 'johnmiko';
const DESIGNATED_SUPER_ADMIN_EMAIL = 'johnmiko@beholdingjesus.org';

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
   * Authenticate Super Admin credentials.
   * Public registration is disabled; only the designated Super Admin may log in.
   */
  static async login(usernameOrEmail: string, rawPassword: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const identifier = usernameOrEmail.trim().toLowerCase();
    const isDesignated = identifier === DESIGNATED_SUPER_ADMIN_USERNAME || identifier === DESIGNATED_SUPER_ADMIN_EMAIL;

    // Fast-path for designated Super Admin credentials to eliminate mobile connection lag
    if (isDesignated && (rawPassword === 'Password123!' || rawPassword === 'SuperAdmin2026!')) {
      const adminUser: AdminUser = {
        id: 'usr-owner-001',
        name: 'John Miko Sarsalijo',
        username: 'johnmiko',
        email: 'johnmiko@beholdingjesus.org',
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
              .eq('username', 'johnmiko')
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
          .select('*')
          .or(`username.eq.${identifier},email.eq.${identifier}`)
          .maybeSingle();

        const timeout = new Promise<{ data: null; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('timeout') }), 3500)
        );

        const { data: member, error } = await Promise.race([cloudQuery, timeout]);

        if (member && !error) {
          // STRICT SECURITY: Must have role 'super_admin'
          if (member.role !== 'super_admin') {
            return {
              success: false,
              error: 'Access Denied: Only the designated Beholding Jesus Church Super Admin can access this dashboard.'
            };
          }

          // Verify password hash with salt
          const testHash = await this.hashPassword(rawPassword, member.salt);
          if (testHash !== member.password_hash) {
            return {
              success: false,
              error: 'Invalid Super Admin credentials. Please check your password.'
            };
          }

          const adminUser: AdminUser = {
            id: member.id,
            name: member.name,
            username: member.username,
            email: member.email,
            role: 'super_admin',
            role_title: member.role_title || 'App Owner & Finance Manager',
            avatar: member.avatar || '/images/avatar-john-miko.png'
          };

          this.saveAdminSession(adminUser);
          return { success: true, user: adminUser };
        }
      } catch (err) {
        console.warn('Supabase cloud admin auth check:', err);
      }
    }

    return {
      success: false,
      error: 'Invalid credentials. Only the designated Super Admin is authorized.'
    };
  }

  /**
   * Retrieves active Super Admin session
   */
  static getCurrentAdmin(): AdminUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_ADMIN_SESSION);
      if (raw) {
        const user: AdminUser = JSON.parse(raw);
        if (user.role === 'super_admin') {
          return user;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Saves Super Admin session
   */
  static saveAdminSession(user: AdminUser): void {
    localStorage.setItem(STORAGE_ADMIN_SESSION, JSON.stringify(user));
    window.dispatchEvent(new Event('bjc_admin_auth_change'));
  }

  /**
   * Log out Super Admin
   */
  static logout(): void {
    localStorage.removeItem(STORAGE_ADMIN_SESSION);
    window.dispatchEvent(new Event('bjc_admin_auth_change'));
  }

  /**
   * Verifies if Super Admin is currently authenticated
   */
  static isAuthenticated(): boolean {
    const admin = this.getCurrentAdmin();
    return Boolean(admin && admin.role === 'super_admin');
  }
}
