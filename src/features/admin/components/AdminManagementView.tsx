import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Shield, 
  Users, 
  Clock, 
  UserPlus, 
  UserX, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Key, 
  Lock, 
  Trash2, 
  Ban, 
  Check, 
  Info,
  Calendar,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { UserProfile, AdminAccessRequest, SystemAdminAuditLog } from '../../../types';
import { AdminService, DESIGNATED_SUPER_ADMIN_ID } from '../../../services/adminService';
import { ChurchDataStore } from '../../../services/churchDataStore';

interface AdminManagementViewProps {
  currentUser: UserProfile;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({ currentUser }) => {
  const [subTab, setSubTab] = useState<'overview' | 'requests' | 'admins' | 'logs' | 'security'>('overview');
  
  const [requests, setRequests] = useState<AdminAccessRequest[]>(() => AdminService.getAdminRequests());
  const [adminAccounts, setAdminAccounts] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAdminAuditLog[]>(() => AdminService.getAuditLogs());
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal / Confirm States
  const [selectedRequest, setSelectedRequest] = useState<AdminAccessRequest | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState<UserProfile | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const isSuperAdmin = AdminService.isSuperAdmin(currentUser);

  const loadData = async () => {
    setLoading(true);
    try {
      const [freshReqs, freshAdmins, freshLogs] = await Promise.all([
        AdminService.fetchAdminRequestsFromCloud(),
        AdminService.getAdminAccounts(),
        AdminService.fetchAuditLogsFromCloud()
      ]);
      setRequests(freshReqs);
      setAdminAccounts(freshAdmins);
      setAuditLogs(freshLogs);
    } catch (err) {
      console.warn('Failed to load admin management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleReqChange = () => {
      setRequests(AdminService.getAdminRequests());
    };
    const handleUserChange = async () => {
      const admins = await AdminService.getAdminAccounts();
      setAdminAccounts(admins);
    };
    const handleAuditChange = () => {
      setAuditLogs(AdminService.getAuditLogs());
    };

    window.addEventListener('bjc_admin_requests_change', handleReqChange);
    window.addEventListener('bjc_users_change', handleUserChange);
    window.addEventListener('bjc_admin_audit_change', handleAuditChange);

    return () => {
      window.removeEventListener('bjc_admin_requests_change', handleReqChange);
      window.removeEventListener('bjc_users_change', handleUserChange);
      window.removeEventListener('bjc_admin_audit_change', handleAuditChange);
    };
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // 1. APPROVE REQUEST
  const handleApprove = async (req: AdminAccessRequest) => {
    const confirmed = window.confirm(
      `Approve ${req.userName} (@${req.userUsername || 'member'}) as an official Church Administrator?\n\nThey will gain access to the regular Admin Dashboard.`
    );
    if (!confirmed) return;

    const res = await AdminService.approveAdminRequest(req.id, currentUser);
    if (res.success) {
      showFeedback('success', `Approved ${req.userName} as Church Administrator.`);
      await loadData();
    } else {
      showFeedback('error', res.error || 'Failed to approve request.');
    }
  };

  // 2. REJECT REQUEST
  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;
    const res = await AdminService.rejectAdminRequest(selectedRequest.id, currentUser, rejectNote);
    if (res.success) {
      showFeedback('success', `Rejected Admin access request for ${selectedRequest.userName}.`);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      setRejectNote('');
      await loadData();
    } else {
      showFeedback('error', res.error || 'Failed to reject request.');
    }
  };

  // 3. SUSPEND / REACTIVATE
  const handleToggleSuspend = async (admin: UserProfile) => {
    if (admin.isSuspended) {
      const res = await AdminService.reactivateAdmin(admin.id, currentUser);
      if (res.success) {
        showFeedback('success', `Reactivated administrator account for ${admin.name}.`);
        await loadData();
      } else {
        showFeedback('error', res.error || 'Failed to reactivate account.');
      }
    } else {
      const reason = window.prompt(`Enter suspension reason for ${admin.name}:`) || 'Administrative discretion.';
      const res = await AdminService.suspendAdmin(admin.id, currentUser, reason);
      if (res.success) {
        showFeedback('success', `Suspended administrator account for ${admin.name}. Access to Admin Dashboard is blocked.`);
        await loadData();
      } else {
        showFeedback('error', res.error || 'Failed to suspend account.');
      }
    }
  };

  // 4. OPTION A: REMOVE ADMIN ACCESS (REVERT TO REGULAR MEMBER)
  const handleRemoveRole = async (admin: UserProfile) => {
    const confirmed = window.confirm(
      `[Option A: Remove Admin Access]\n\nRevoke administrator privileges for "${admin.name}" (@${admin.username})?\n\nThey will return to regular member status. Their profile, posts, and historical contributions will be preserved.`
    );
    if (!confirmed) return;

    const res = await AdminService.removeAdminRole(admin.id, currentUser);
    if (res.success) {
      showFeedback('success', `Revoked Admin role for ${admin.name}. Account returned to regular member.`);
      await loadData();
    } else {
      showFeedback('error', res.error || 'Failed to revoke admin role.');
    }
  };

  // 5. OPTION B: PERMANENTLY DELETE ADMIN ACCOUNT
  const handleConfirmPermanentDelete = async () => {
    if (!targetToDelete) return;
    if (deleteConfirmationText !== targetToDelete.username && deleteConfirmationText !== 'DELETE') {
      showFeedback('error', `Confirmation mismatched. Please type "${targetToDelete.username}" to confirm deletion.`);
      return;
    }

    const res = await AdminService.deleteAdminAccount(targetToDelete.id, currentUser);
    if (res.success) {
      showFeedback('success', `Permanently deleted account for ${targetToDelete.name}. Historical church content preserved.`);
      setIsDeleteModalOpen(false);
      setTargetToDelete(null);
      setDeleteConfirmationText('');
      await loadData();
    } else {
      showFeedback('error', res.error || 'Failed to delete account.');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Access Restricted: Super Admin Only
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The Admin Management console is strictly reserved for the single designated Beholding Jesus Church Super Admin. Regular administrators cannot manage accounts or view administrative audit controls.
        </p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeAdmins = adminAccounts.filter(a => !a.isSuspended && (a.role === 'super_admin' || a.role === 'church_admin'));
  const suspendedAdmins = adminAccounts.filter(a => a.isSuspended);

  return (
    <div className="space-y-6">
      {/* Top Banner / Security Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-slate-900 to-amber-950 text-white shadow-card border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Admin Management • Exclusive Authority</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Administrator Governance & Role Control
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Exclusively review admin applications, promote trusted members, manage administrative lifecycles, and monitor full audit logs.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-300 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Feedback */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold transition ${
          actionMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
            : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
        }`}>
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setSubTab('overview')}
          className={`px-4 py-2 rounded-xl transition ${
            subTab === 'overview' ? 'bg-purple-900 text-white shadow-soft font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setSubTab('requests')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            subTab === 'requests' ? 'bg-purple-900 text-white shadow-soft font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Pending Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px]">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('admins')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            subTab === 'admins' ? 'bg-purple-900 text-white shadow-soft font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Admin Accounts</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px]">
            {adminAccounts.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('logs')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            subTab === 'logs' ? 'bg-purple-900 text-white shadow-soft font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Activity Logs</span>
        </button>

        <button
          onClick={() => setSubTab('security')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            subTab === 'security' ? 'bg-purple-900 text-white shadow-soft font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Security & Protection</span>
        </button>
      </div>

      {/* 1. OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Admins</span>
              <div className="text-3xl font-serif font-bold text-slate-900 dark:text-white">{adminAccounts.length}</div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">1 Super Admin &bull; {adminAccounts.length - 1} Admins</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Admins</span>
              <div className="text-3xl font-serif font-bold text-emerald-600 dark:text-emerald-400">{activeAdmins.length}</div>
              <div className="text-[11px] text-emerald-600/80">Authorized & Operational</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Suspended Admins</span>
              <div className="text-3xl font-serif font-bold text-rose-600 dark:text-rose-400">{suspendedAdmins.length}</div>
              <div className="text-[11px] text-rose-600/80">Access Denied</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Requests</span>
              <div className="text-3xl font-serif font-bold text-amber-600 dark:text-amber-400">{pendingRequests.length}</div>
              <div className="text-[11px] text-amber-600/80">Awaiting Super Admin Decision</div>
            </div>
          </div>

          {/* Quick Actions & Recent Approvals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Requests Preview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-500" />
                  <span>Pending Applications</span>
                </h3>
                <button
                  onClick={() => setSubTab('requests')}
                  className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                >
                  View All ({pendingRequests.length})
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No pending Admin applications at this time.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map(req => (
                    <div key={req.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {req.userName} <span className="text-slate-400 font-normal">(@{req.userUsername})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          "{req.reason}"
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleApprove(req)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Audit Actions Preview */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span>Recent Administrative Activity</span>
                </h3>
                <button
                  onClick={() => setSubTab('logs')}
                  className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                >
                  View All Logs ({auditLogs.length})
                </button>
              </div>

              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No administrative actions recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 4).map(log => (
                    <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {log.performedByName}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                          {log.details}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PENDING REQUESTS */}
      {subTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-500" />
              <span>Admin Access Applications ({requests.length})</span>
            </h3>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-white">All Clear</h4>
              <p className="text-xs text-slate-400">There are no pending or archived Admin Access Requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';

                return (
                  <div 
                    key={req.id} 
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <img 
                        src={req.userAvatar || '/icons/church-logo.png'} 
                        alt={req.userName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/20 shadow-xs shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/icons/church-logo.png';
                        }}
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {req.userName}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            @{req.userUsername}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPending 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                              : isApproved 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {req.userEmail || `${req.userUsername}@beholdingjesus.org`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200 mt-2">
                          <span className="font-semibold text-slate-500 dark:text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                            Reason for Application:
                          </span>
                          "{req.reason}"
                        </div>

                        {req.resolvedAt && (
                          <div className="text-[11px] text-slate-400 pt-1">
                            Resolved on {new Date(req.resolvedAt).toLocaleDateString()} by {req.resolvedBy}
                            {req.rejectionReason && ` (Note: ${req.rejectionReason})`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => handleApprove(req)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-soft cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Admin</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsRejectModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition border border-rose-200 dark:border-rose-800 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. ADMIN ACCOUNTS */}
      {subTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>Authorized Administrator Accounts ({adminAccounts.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {adminAccounts.map(admin => {
              const isSuper = AdminService.isSuperAdmin(admin);
              const isSuspended = Boolean(admin.isSuspended);

              return (
                <div 
                  key={admin.id} 
                  className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSuper 
                      ? 'border-purple-300 dark:border-purple-800/80 bg-purple-50/20 dark:bg-purple-950/10' 
                      : isSuspended 
                        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                        : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img 
                      src={admin.avatar || '/icons/church-logo.png'} 
                      alt={admin.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/20 shadow-xs shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/icons/church-logo.png';
                      }}
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {admin.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          @{admin.username || 'admin'}
                        </span>
                        
                        {/* Role Indicator Badge */}
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white shadow-xs">
                            <ShieldCheck className="w-3 h-3" />
                            Super Admin (Highest Authority)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            <Shield className="w-3 h-3 text-amber-600" />
                            Church Administrator
                          </span>
                        )}

                        {/* Suspension Badge */}
                        {isSuspended && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white">
                            <Ban className="w-3 h-3" />
                            Suspended
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {admin.email}
                        </span>
                        <span>&bull;</span>
                        <span>{admin.roleTitle || 'Administrator'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {isSuper ? (
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
                        Protected Account &bull; Owner
                      </span>
                    ) : (
                      <>
                        {/* Suspend / Reactivate */}
                        <button
                          onClick={() => handleToggleSuspend(admin)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1 transition cursor-pointer ${
                            isSuspended 
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                          title={isSuspended ? "Reactivate Administrator" : "Suspend Administrator Access"}
                        >
                          {isSuspended ? <Check className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
                        </button>

                        {/* Option A: Revoke Admin Role */}
                        <button
                          onClick={() => handleRemoveRole(admin)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                          title="Revoke Admin Access (Return to Regular Member)"
                        >
                          <UserX className="w-3.5 h-3.5 text-slate-500" />
                          <span>Remove Admin Role</span>
                        </button>

                        {/* Option B: Permanently Delete */}
                        <button
                          onClick={() => {
                            setTargetToDelete(admin);
                            setDeleteConfirmationText('');
                            setIsDeleteModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center gap-1 transition border border-rose-200 dark:border-rose-800 cursor-pointer"
                          title="Permanently Delete Admin Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ACTIVITY LOGS */}
      {subTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>Administrative Audit Trail ({auditLogs.length})</span>
            </h3>
            <span className="text-xs text-slate-400">
              Immutable Records &bull; Tamper-Protected
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-400">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-card">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map(log => {
                  const getActionBadge = (action: string) => {
                    switch (action) {
                      case 'APPROVE_ADMIN':
                        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
                      case 'REJECT_ADMIN':
                        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
                      case 'SUSPEND_ADMIN':
                        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
                      case 'REACTIVATE_ADMIN':
                        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
                      case 'REMOVE_ADMIN_ROLE':
                        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
                      case 'DELETE_ADMIN_ACCOUNT':
                        return 'bg-rose-600 text-white';
                      default:
                        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
                    }
                  };

                  return (
                    <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${getActionBadge(log.action)}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {log.performedByName}
                          </span>
                          <span className="text-slate-400">
                            affecting <span className="font-semibold text-slate-700 dark:text-slate-300">{log.targetUserName}</span>
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-xs">
                          {log.details}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-400 shrink-0 sm:text-right">
                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                        <div>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SECURITY & PROTECTION */}
      {subTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Hierarchical Administration Architecture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-2">
                <div className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Super Admin Tier (Highest Authority)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Exactly ONE designated Super Admin account controls user promotions, removals, suspensions, deletions, and administrative audit trails.
                </p>
                <div className="pt-1 text-[11px] font-mono text-purple-700 dark:text-purple-400">
                  Account: John Miko Sarsalijo (@johnmiko &bull; usr-owner-001)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Admin Tier (Content Management)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Approved Admins manage website CMS, announcements, events, and ministries, but are strictly prohibited from approving, creating, or removing other Admins.
                </p>
                <div className="pt-1 text-[11px] font-mono text-amber-700 dark:text-amber-400">
                  Status: Backend-Enforced RBAC Protected
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs text-slate-500">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Core Security Invariants Enforced:
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Two Super Admin accounts can NEVER exist simultaneously.</li>
                <li>Admins cannot promote themselves or other members to Super Admin.</li>
                <li>Admins cannot approve or reject Admin Access Requests.</li>
                <li>Admins cannot delete or modify the Super Admin account.</li>
                <li>Removing an Admin preserves their profile and historical church content.</li>
                <li>Direct URL entry validates user clearance on the backend before rendering.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REQUEST MODAL */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-elevated border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              <span>Reject Admin Access Request</span>
            </h3>
            <p className="text-xs text-slate-500">
              You are rejecting the request from <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.userName}</span> (@{selectedRequest.userUsername}). They will remain an ordinary member.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Optional Note / Reason for Applicant:
              </label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="e.g. Please gain more ministry experience before requesting admin access."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-soft"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE ADMIN ACCOUNT MODAL */}
      {isDeleteModalOpen && targetToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-elevated border border-rose-300 dark:border-rose-900/60 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-7 h-7" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Permanently Delete Admin Account
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This is a <strong className="text-rose-600">permanent destructive action</strong>. The account credentials, profile, and active login sessions for <strong className="text-slate-900 dark:text-white">{targetToDelete.name}</strong> (@{targetToDelete.username}) will be permanently deleted.
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Historical Content Protection</span>
              </div>
              <p>
                Shared church announcements, events, and community posts previously created by this administrator will be safely preserved.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Type <strong className="text-rose-600 font-mono">{targetToDelete.username}</strong> or <strong className="text-rose-600 font-mono">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder={targetToDelete.username}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTargetToDelete(null);
                  setDeleteConfirmationText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                disabled={deleteConfirmationText !== targetToDelete.username && deleteConfirmationText !== 'DELETE'}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-soft disabled:opacity-50 cursor-pointer"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
