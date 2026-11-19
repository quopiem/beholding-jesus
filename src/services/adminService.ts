import { 
  UserProfile, 
  AdminAccessRequest, 
  SystemAdminAuditLog, 
  AdminAuditAction 
} from '../types';
import { AdminUser } from '../admin/types';
import { ChurchDataStore } from './churchDataStore';
import { AuthService } from './authService';
import { supabase } from '../lib/supabase';
import { StorageManager } from './storageManager';
import { PushNotificationService } from './pushNotificationService';

const STORAGE_ADMIN_REQUESTS = 'bjc_admin_requests_v1';
const STORAGE_ADMIN_AUDIT_LOGS = 'bjc_admin_audit_logs_v1';

// Strict Designated Super Admin Identity
export const DESIGNATED_SUPER_ADMIN_ID = 'usr-owner-001';
export const DESIGNATED_SUPER_ADMIN_USERNAME = 'johnmiko';
export const DESIGNATED_SUPER_ADMIN_EMAIL = 'johnmiko@beholdingjesus.org';

export class AdminService {
  // -------------------------------------------------------------
  // 1. ROLE & IDENTITY VERIFICATION (STRICT SINGLE SUPER ADMIN)
  // -------------------------------------------------------------

  /**
   * Strictly determines whether the given user is the one and only Super Admin.
   * Enforces backend/code-level rule: There must NEVER be two active Super Admins.
   * No user can promote themselves or another user to Super Admin.
   */
  static isSuperAdmin(user?: UserProfile | AdminUser | null): boolean {
    if (!user) return false;
    if (user.role !== 'super_admin') return false;
    
    // Only the designated Super Admin identity can hold super_admin authority
    const idMatch = user.id === DESIGNATED_SUPER_ADMIN_ID;
    const usernameMatch = user.username?.toLowerCase() === DESIGNATED_SUPER_ADMIN_USERNAME;
    const emailMatch = user.email?.toLowerCase() === DESIGNATED_SUPER_ADMIN_EMAIL;

    const isDesignated = idMatch || usernameMatch || emailMatch;
    if (!isDesignated) {
      console.warn('Security Violation: Unauthorized super_admin attempt by user:', user.id, user.username);
      return false;
    }

    if ((user as UserProfile).isSuspended) return false;
    return true;
  }

  /**
   * Checks whether the user is an active Administrator (Super Admin or Approved Admin).
   */
  static isAdmin(user?: UserProfile | AdminUser | null): boolean {
    if (!user) return false;
    if ((user as UserProfile).isSuspended) return false;
    if (this.isSuperAdmin(user)) return true;
    return user.role === 'church_admin' || user.role === 'admin';
  }

  /**
   * Determines if user has clearance to enter the Admin Dashboard.
   * Suspended admins, removed admins, and regular members return false.
   */
  static canAccessAdminDashboard(user?: UserProfile | AdminUser | null): boolean {
    if (!user) return false;
    if ((user as UserProfile).isSuspended) return false;
    if (this.isSuperAdmin(user)) return true;
    if (user.role === 'church_admin' || user.role === 'admin') return true;
    if (user.role === 'pastor') return true;
    return false;
  }

  // -------------------------------------------------------------
  // 2. AUDIT LOGGING (IMMUTABLE ADMINISTRATIVE RECORDS)
  // -------------------------------------------------------------

  static getAuditLogs(): SystemAdminAuditLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_ADMIN_AUDIT_LOGS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  }

  private static saveAuditLogs(logs: SystemAdminAuditLog[]): void {
    StorageManager.safeSetItem(STORAGE_ADMIN_AUDIT_LOGS, JSON.stringify(logs));
  }

  static async recordAuditLog(log: Omit<SystemAdminAuditLog, 'id' | 'createdAt'>): Promise<SystemAdminAuditLog> {
    const entry: SystemAdminAuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...log,
      createdAt: new Date().toISOString()
    };

    const logs = this.getAuditLogs();
    logs.unshift(entry);
    this.saveAuditLogs(logs);

    // Sync to Supabase Cloud
    if (supabase) {
      try {
        await supabase.from('church_prayer_requests').insert({
          id: entry.id,
          user_id: entry.performedBy,
          author_name: entry.performedByName,
          is_anonymous: false,
          category: 'sys_admin_audit_log',
          title: `${entry.action}:::${entry.targetUserName}`,
          description: entry.details,
          visibility: 'admin_only',
          target_ministry_id: entry.targetUserId,
          is_answered: true,
          testimony_text: JSON.stringify(entry),
          created_at: entry.createdAt
        });
      } catch (err) {
        console.warn('Audit log cloud sync error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bjc_admin_audit_change', { detail: entry }));
      window.dispatchEvent(new Event('storage'));
    }

    return entry;
  }

  static async fetchAuditLogsFromCloud(): Promise<SystemAdminAuditLog[]> {
    if (!supabase) return this.getAuditLogs();
    try {
      const { data, error } = await supabase
        .from('church_prayer_requests')
        .select('id, category, title, description, user_id, author_name, target_ministry_id, testimony_text, created_at')
        .eq('category', 'sys_admin_audit_log')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && !error) {
        const cloudLogs: SystemAdminAuditLog[] = data.map(d => {
          try {
            return JSON.parse(d.testimony_text || '{}');
          } catch {
            return {
              id: d.id,
              action: (d.title?.split(':::')[0] || 'UPDATE_SYSTEM_SETTINGS') as AdminAuditAction,
              performedBy: d.user_id,
              performedByName: d.author_name || 'Administrator',
              performedByRole: 'super_admin',
              targetUserId: d.target_ministry_id || '',
              targetUserName: d.title?.split(':::')[1] || '',
              details: d.description || '',
              createdAt: d.created_at
            };
          }
        });

        // Merge with local logs
        const local = this.getAuditLogs();
        const map = new Map<string, SystemAdminAuditLog>();
        cloudLogs.forEach(l => map.set(l.id, l));
        local.forEach(l => {
          if (!map.has(l.id)) map.set(l.id, l);
        });

        const merged = Array.from(map.values()).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.saveAuditLogs(merged);
        return merged;
      }
    } catch (e) {
      console.warn('fetchAuditLogsFromCloud error:', e);
    }
    return this.getAuditLogs();
  }

  // -------------------------------------------------------------
  // 3. ADMIN ACCESS REQUESTS (MEMBER WORKFLOW & REVIEW)
  // -------------------------------------------------------------

  static getAdminRequests(): AdminAccessRequest[] {
    try {
      const raw = localStorage.getItem(STORAGE_ADMIN_REQUESTS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  }

  private static saveAdminRequests(requests: AdminAccessRequest[]): void {
    StorageManager.safeSetItem(STORAGE_ADMIN_REQUESTS, JSON.stringify(requests));
  }

  /**
   * Member submits an Admin Access Request.
   * Validates that the user does not have an existing active pending request.
   */
  static async submitAdminRequest(user: UserProfile, reason: string): Promise<{ success: boolean; request?: AdminAccessRequest; error?: string }> {
    if (!user || !user.id) {
      return { success: false, error: 'You must be signed in to submit an Admin Access Request.' };
    }

    if (user.isSuspended) {
      return { success: false, error: 'Your account is suspended. You cannot submit administrative requests.' };
    }

    if (this.isSuperAdmin(user)) {
      return { success: false, error: 'You are already the Super Admin.' };
    }

    if (user.role === 'church_admin') {
      return { success: false, error: 'You already have Church Administrator access.' };
    }

    const cleanReason = reason?.trim();
    if (!cleanReason || cleanReason.length < 10) {
      return { success: false, error: 'Please provide a clear reason for requesting admin access (at least 10 characters).' };
    }

    // Check for existing pending request
    const existing = this.getAdminRequests();
    const activePending = existing.find(r => r.userId === user.id && r.status === 'pending');
    if (activePending) {
      return { 
        success: false, 
        error: 'You already have an active Admin Access Request pending review by the Super Admin.' 
      };
    }

    const newRequest: AdminAccessRequest = {
      id: `admin-req-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userUsername: user.username || user.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      userAvatar: user.avatar || '/icons/church-logo.png',
      reason: cleanReason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    existing.unshift(newRequest);
    this.saveAdminRequests(existing);

    // Sync to Supabase Cloud
    if (supabase) {
      try {
        await supabase.from('church_prayer_requests').upsert({
          id: newRequest.id,
          user_id: user.id,
          author_name: user.name,
          is_anonymous: false,
          category: 'sys_admin_access_request',
          title: `${user.username || user.name}:::Admin Request`,
          description: cleanReason,
          visibility: 'admin_only',
          target_ministry_id: '',
          is_answered: false,
          testimony_text: JSON.stringify(newRequest),
          created_at: newRequest.createdAt
        });
      } catch (err) {
        console.warn('submitAdminRequest cloud sync error:', err);
      }
    }

    // Record audit log
    await this.recordAuditLog({
      action: 'SUBMIT_ADMIN_REQUEST',
      performedBy: user.id,
      performedByName: user.name,
      performedByRole: user.role,
      targetUserId: user.id,
      targetUserName: user.name,
      targetUserEmail: user.email,
      details: `Submitted Admin Access Request: "${cleanReason.substring(0, 100)}${cleanReason.length > 100 ? '...' : ''}"`
    });

    // Notify Super Admin
    ChurchDataStore.addNotification({
      userId: DESIGNATED_SUPER_ADMIN_ID,
      type: 'system',
      title: 'New Admin Access Request',
      message: `${user.name} (@${user.username || 'member'}) requested Admin access: "${cleanReason.substring(0, 80)}..."`,
      linkRoute: 'admin'
    });

    PushNotificationService.notifyAdminApplicationSubmitted(
      user.name,
      user.username || 'member',
      newRequest.id
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_admin_requests_change'));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true, request: newRequest };
  }

  static async fetchAdminRequestsFromCloud(): Promise<AdminAccessRequest[]> {
    if (!supabase) return this.getAdminRequests();
    try {
      const { data, error } = await supabase
        .from('church_prayer_requests')
        .select('id, category, title, description, user_id, author_name, is_answered, testimony_text, created_at')
        .eq('category', 'sys_admin_access_request')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data && !error) {
        const cloudRequests: AdminAccessRequest[] = data.map(d => {
          try {
            return JSON.parse(d.testimony_text || '{}');
          } catch {
            return {
              id: d.id,
              userId: d.user_id,
              userName: d.author_name || 'Member',
              userEmail: '',
              userUsername: d.title?.split(':::')[0] || '',
              reason: d.description || '',
              status: d.is_answered ? 'approved' : 'pending',
              createdAt: d.created_at
            };
          }
        });

        const local = this.getAdminRequests();
        const map = new Map<string, AdminAccessRequest>();
        cloudRequests.forEach(r => map.set(r.id, r));
        local.forEach(r => {
          if (!map.has(r.id)) map.set(r.id, r);
        });

        const merged = Array.from(map.values()).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.saveAdminRequests(merged);
        return merged;
      }
    } catch (e) {
      console.warn('fetchAdminRequestsFromCloud error:', e);
    }
    return this.getAdminRequests();
  }

  // -------------------------------------------------------------
  // 4. SUPER ADMIN APPROVAL / REJECTION & PROMOTION
  // -------------------------------------------------------------

  /**
   * Super Admin approves an applicant to become Admin.
   * Strictly enforces that caller must be the Super Admin.
   */
  static async approveAdminRequest(
    requestId: string, 
    caller: UserProfile | AdminUser
  ): Promise<{ success: boolean; error?: string }> {
    // 1. STRICT BACKEND SECURITY: Only Super Admin can approve
    if (!this.isSuperAdmin(caller)) {
      return { 
        success: false, 
        error: 'Security Violation: Only the Beholding Jesus Church Super Admin can approve Admin accounts.' 
      };
    }

    const requests = this.getAdminRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Admin request not found.' };

    if (req.status === 'approved') {
      return { success: false, error: 'This request has already been approved.' };
    }

    // Update request record
    req.status = 'approved';
    req.resolvedAt = new Date().toISOString();
    req.resolvedBy = caller.name;
    this.saveAdminRequests(requests);

    // Promote target user to church_admin
    const users = ChurchDataStore.getUsers();
    let target = users.find(u => u.id === req.userId || u.username?.toLowerCase() === req.userUsername?.toLowerCase());

    if (target) {
      target.role = 'church_admin';
      target.roleTitle = 'Church Administrator';
      target.isSuspended = false;
      ChurchDataStore.addUser(target);
    }

    // Update Supabase Cloud church_members_auth
    if (supabase) {
      try {
        await supabase
          .from('church_members_auth')
          .update({
            role: 'church_admin',
            role_title: 'Church Administrator',
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${req.userId},username.ilike.${req.userUsername || req.userName}`);

        await supabase
          .from('church_prayer_requests')
          .update({
            is_answered: true,
            testimony_text: JSON.stringify(req)
          })
          .eq('id', requestId);
      } catch (err) {
        console.warn('approveAdminRequest cloud update error:', err);
      }
    }

    // Record audit log
    await this.recordAuditLog({
      action: 'APPROVE_ADMIN',
      performedBy: caller.id,
      performedByName: caller.name,
      performedByRole: caller.role,
      targetUserId: req.userId,
      targetUserName: req.userName,
      targetUserEmail: req.userEmail,
      details: `Approved Admin access request for ${req.userName} (@${req.userUsername}). Promoted to Church Administrator.`
    });

    // Send notification to the promoted member
    ChurchDataStore.addNotification({
      userId: req.userId,
      type: 'system',
      title: 'Admin Access Approved! 🛡️',
      message: `Praise God! Your Admin Access Request has been approved by the Super Admin (${caller.name}). You now have access to the Admin Dashboard.`,
      linkRoute: 'admin'
    });

    PushNotificationService.notifyAdminApplicationResolved(
      req.userId,
      'approved',
      caller.name
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_admin_requests_change'));
      window.dispatchEvent(new Event('bjc_users_change'));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true };
  }

  /**
   * Super Admin rejects an applicant's request.
   */
  static async rejectAdminRequest(
    requestId: string, 
    caller: UserProfile | AdminUser, 
    note?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isSuperAdmin(caller)) {
      return { 
        success: false, 
        error: 'Security Violation: Only the Beholding Jesus Church Super Admin can reject Admin applications.' 
      };
    }

    const requests = this.getAdminRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Admin request not found.' };

    req.status = 'rejected';
    req.rejectionReason = note?.trim() || 'Request was not approved at this time.';
    req.resolvedAt = new Date().toISOString();
    req.resolvedBy = caller.name;
    this.saveAdminRequests(requests);

    if (supabase) {
      try {
        await supabase
          .from('church_prayer_requests')
          .update({
            is_answered: false,
            testimony_text: JSON.stringify(req)
          })
          .eq('id', requestId);
      } catch (err) {
        console.warn('rejectAdminRequest cloud update error:', err);
      }
    }

    await this.recordAuditLog({
      action: 'REJECT_ADMIN',
      performedBy: caller.id,
      performedByName: caller.name,
      performedByRole: caller.role,
      targetUserId: req.userId,
      targetUserName: req.userName,
      targetUserEmail: req.userEmail,
      details: `Rejected Admin access request for ${req.userName}. Note: ${req.rejectionReason}`
    });

    ChurchDataStore.addNotification({
      userId: req.userId,
      type: 'system',
      title: 'Admin Access Request Status',
      message: `Your request for Admin access was reviewed: ${req.rejectionReason}. You remain an active church member.`,
      linkRoute: 'home'
    });

    PushNotificationService.notifyAdminApplicationResolved(
      req.userId,
      'rejected',
      caller.name
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_admin_requests_change'));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true };
  }

  // -------------------------------------------------------------
  // 5. ADMIN ACCOUNT MANAGEMENT (SUSPEND, REACTIVATE, REMOVE, DELETE)
  // -------------------------------------------------------------

  /**
   * Retrieve all administrative accounts for Super Admin management.
   */
  static async getAdminAccounts(): Promise<UserProfile[]> {
    const users = ChurchDataStore.getUsers();
    // Also fetch latest users from cloud if available
    try {
      await ChurchDataStore.fetchUsersFromCloud();
    } catch {}

    const freshUsers = ChurchDataStore.getUsers();
    return freshUsers.filter(u => u.role === 'super_admin' || u.role === 'church_admin');
  }

  /**
   * Suspend an Admin account.
   */
  static async suspendAdmin(
    targetUserId: string, 
    caller: UserProfile | AdminUser, 
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isSuperAdmin(caller)) {
      return { success: false, error: 'Security Violation: Only the Super Admin can suspend Admin accounts.' };
    }

    if (targetUserId === DESIGNATED_SUPER_ADMIN_ID || targetUserId === caller.id) {
      return { success: false, error: 'Security Violation: The Super Admin account cannot be suspended.' };
    }

    const users = ChurchDataStore.getUsers();
    const target = users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Target admin account not found.' };

    target.isSuspended = true;
    ChurchDataStore.addUser(target);

    // Lock account in Supabase
    if (supabase) {
      try {
        await supabase
          .from('church_members_auth')
          .update({
            lockout_until: '2099-01-01T00:00:00.000Z',
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUserId);
      } catch (err) {
        console.warn('suspendAdmin cloud update error:', err);
      }
    }

    await this.recordAuditLog({
      action: 'SUSPEND_ADMIN',
      performedBy: caller.id,
      performedByName: caller.name,
      performedByRole: caller.role,
      targetUserId: target.id,
      targetUserName: target.name,
      targetUserEmail: target.email,
      details: `Suspended Admin account for ${target.name} (@${target.username}). Reason: ${reason || 'Administrative discretion.'}`
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_users_change'));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true };
  }

  /**
   * Reactivate a suspended Admin account.
   */
  static async reactivateAdmin(
    targetUserId: string, 
    caller: UserProfile | AdminUser
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isSuperAdmin(caller)) {
      return { success: false, error: 'Security Violation: Only the Super Admin can reactivate Admin accounts.' };
    }

    const users = ChurchDataStore.getUsers();
    const target = users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Target admin account not found.' };

    target.isSuspended = false;
    ChurchDataStore.addUser(target);

    if (supabase) {
      try {
        await supabase
          .from('church_members_auth')
          .update({
            lockout_until: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUserId);
      } catch (err) {
        console.warn('reactivateAdmin cloud update error:', err);
      }
    }

    await this.recordAuditLog({
      action: 'REACTIVATE_ADMIN',
      performedBy: caller.id,
      performedByName: caller.name,
      performedByRole: caller.role,
      targetUserId: target.id,
      targetUserName: target.name,
      targetUserEmail: target.email,
      details: `Reactivated Admin account for ${target.name} (@${target.username}).`
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_users_change'));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true };
  }

  /**
   * Option A: Remove Admin Access.
   * Revokes the Admin role and returns the user to ordinary member status.
   * Preserves their account, profile, posts, prayers, and historical contributions.
   */
  static async removeAdminRole(
    targetUserId: string, 
    caller: UserProfile | AdminUser
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isSuperAdmin(caller)) {
      return { success: false, error: 'Security Violation: Only the Super Admin can remove Admin roles.' };
    }

    if (targetUserId === DESIGNATED_SUPER_ADMIN_ID || targetUserId === caller.id) {
      return { success: false, error: 'Security Violation: The Super Admin role cannot be removed.' };
    }

    const users = ChurchDataStore.getUsers();
    const target = users.find(u => u.id === targetUserId);
    if (!target) return { success: false, error: 'Target admin account not found.' };

    // Revert to regular member
    target.role = 'regular_member';
    target.roleTitle = 'Church Member';
    target.isSuspended = false;
    ChurchDataStore.addUser(target);

    if (supabase) {
      try {
        await supabase
          .from('church_members_auth')
          .update({
            role: 'regular_member',
            role_title: 'Church Member',
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUserId);
      } catch (err) {
        console.warn('removeAdminRole cloud update error:', err);
      }
    }

    await this.recordAuditLog({
      action: 'REMOVE_ADMIN_ROLE',
      performedBy: caller.id,
      performedByName: caller.name,
      performedByRole: caller.role,
      targetUserId: target.id,
      targetUserName: target.name,
      targetUserEmail: target.email,
      details: `Revoked Admin role for ${target.name} (@${target.username}). Returned to ordinary member access.`
    });

    ChurchDataStore.addNotification({
      userId: target.id,
      type: 'system',
      title: 'Administrative Role Updated',
      message: `Your administrator privileges have been concluded. You retain full access to all standard church member features.`,
      linkRoute: 'home'
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_users_change'));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true };
  }

  /**
   * Option B: Permanently Delete Admin Account.
   * Completely removes authentication account and credentials.
   * Preserves historical shared content (announcements, events, comments remain attributed, no cascade delete).
   */
  static async deleteAdminAccount(
    targetUserId: string, 
    caller: UserProfile | AdminUser
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isSuperAdmin(caller)) {
      return { success: false, error: 'Security Violation: Only the Super Admin can permanently delete accounts.' };
    }

    if (targetUserId === DESIGNATED_SUPER_ADMIN_ID || targetUserId === caller.id) {
      return { success: false, error: 'Security Violation: The Super Admin account cannot be deleted.' };
    }

    const users = ChurchDataStore.getUsers();
    const target = users.find(u => u.id === targetUserId);
    const targetName = target ? target.name : 'Unknown Admin';
    const targetEmail = target ? target.email : '';
    const targetUsername = target?.username || '';

    // Permanently delete user from ChurchDataStore and Supabase
    await ChurchDataStore.deleteUser(targetUserId);

    // Remove from auth credentials
    const creds = AuthService.getCredentials().filter(c => c.userId !== targetUserId && c.username !== targetUsername);
    StorageManager.safeSetItem('bjc_auth_credentials_v1', JSON.stringify(creds));

    await this.recordAuditLog({
      action: 'DELETE_ADMIN_ACCOUNT',
      performedBy: caller.id,
      performedByName: caller.name,
      performedByRole: caller.role,
      targetUserId,
      targetUserName: targetName,
      targetUserEmail: targetEmail,
      details: `Permanently deleted account and credentials for ${targetName} (@${targetUsername}). Shared church content preserved.`
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_users_change'));
      window.dispatchEvent(new Event('storage'));
    }

    return { success: true };
  }
}
