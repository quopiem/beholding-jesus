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

    // 1. Verify against Supabase Cloud (Single Source of Truth)
    if (supabase) {
      try {
        const { data: member, error } = await supabase
          .from('church_members_auth')
          .select('*')
          .or(`username.eq.${identifier},email.eq.${identifier}`)
          .maybeSingle();

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

    // 2. Offline / local fallback check for designated Super Admin (johnmiko / Password123!)
    const isDesignatedUsername = identifier === DESIGNATED_SUPER_ADMIN_USERNAME || identifier === DESIGNATED_SUPER_ADMIN_EMAIL;
    if (isDesignatedUsername && (rawPassword === 'Password123!' || rawPassword === 'SuperAdmin2026!')) {
      const fallbackUser: AdminUser = {
        id: 'usr-owner-001',
        name: 'John Miko Sarsalijo',
        username: 'johnmiko',
        email: 'johnmiko@beholdingjesus.org',
        role: 'super_admin',
        role_title: 'App Owner & Finance Manager',
        avatar: '/images/avatar-john-miko.png'
      };

      this.saveAdminSession(fallbackUser);
      return { success: true, user: fallbackUser };
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
