import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Bell, Music, Calendar, CheckCircle2, 
  XCircle, Plus, Edit, Trash2, Database, AlertCircle, 
  Check, ArrowRight, ShieldCheck, Layers, KeyRound, Copy, Lock, RefreshCw
} from 'lucide-react';
import { ChurchDataStore } from '../../services/churchDataStore';
import { AuthService } from '../../services/authService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { UserProfile, UserRole, MinistryJoinRequest, Announcement, PasswordRecoveryRequest } from '../../types';

export const AdminDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'requests' | 'recovery' | 'announcements' | 'system'>('overview');
  
  const [usersList, setUsersList] = useState<UserProfile[]>(() => ChurchDataStore.getUsers());
  const songs = ChurchDataStore.getSongs();
  const singers = ChurchDataStore.getSingers();
  const ministries = ChurchDataStore.getMinistries();
  const events = ChurchDataStore.getEvents();
  const announcements = ChurchDataStore.getAnnouncements();
  const [joinRequests, setJoinRequests] = useState<MinistryJoinRequest[]>(ChurchDataStore.getJoinRequests());
  const [pendingRegistrations, setPendingRegistrations] = useState<UserProfile[]>(() => 
    ChurchDataStore.getPendingMinistryRegistrations()
  );
  const [approvalsSubTab, setApprovalsSubTab] = useState<'registrations' | 'join_requests'>('registrations');
  const [recoveryRequests, setRecoveryRequests] = useState<PasswordRecoveryRequest[]>(AuthService.getRecoveryRequests());
  const [resolvedTempPassword, setResolvedTempPassword] = useState<{ id: string; tempPass: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isRefreshingCloud, setIsRefreshingCloud] = useState(false);

  // Super Admin delete account handler
  const handleDeleteMember = async (targetUser: UserProfile) => {
    if (targetUser.id === currentUser.id) {
      alert("You cannot delete your own Super Admin account.");
      return;
    }
    const confirmed = confirm(
      `[SUPER ADMIN SECURITY ACTION]\n\nAre you sure you want to permanently delete the account of:\n"${targetUser.name}" (@${targetUser.username})?\n\nThis will permanently delete their profile and remove their access.`
    );
    if (!confirmed) return;

    await ChurchDataStore.deleteUser(targetUser.id);
    setUsersList(ChurchDataStore.getUsers());
    setPendingRegistrations(ChurchDataStore.getPendingMinistryRegistrations());
    alert(`Account for "${targetUser.name}" has been permanently deleted.`);
  };

  // Announcement Authoring Form State
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<any>('General Church');
  const [annPriority, setAnnPriority] = useState<any>('normal');
  const [annList, setAnnList] = useState<Announcement[]>(announcements);

  const refreshAllCloudData = async () => {
    setIsRefreshingCloud(true);
    try {
      const [cloudAnn, cloudJoin, cloudRec, cloudUsers] = await Promise.all([
        ChurchDataStore.fetchAnnouncementsFromCloud(),
        ChurchDataStore.fetchJoinRequestsFromCloud(),
        AuthService.fetchRecoveryRequestsFromCloud(),
        ChurchDataStore.fetchUsersFromCloud()
      ]);
      if (cloudAnn) setAnnList(cloudAnn);
      if (cloudJoin) setJoinRequests(cloudJoin);
      if (cloudRec) setRecoveryRequests(cloudRec);
      if (cloudUsers) {
        setUsersList(cloudUsers);
        setPendingRegistrations(ChurchDataStore.getPendingMinistryRegistrations());
      }
    } catch (err) {
      console.warn('Dashboard cloud refresh error:', err);
    } finally {
      setIsRefreshingCloud(false);
    }
  };

  // Cloud Sync for Announcements, Join Requests, Recoveries & Realtime Store Sync
  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch from Supabase
    refreshAllCloudData();
    const interval = setInterval(refreshAllCloudData, 4000);

    // Realtime subscriptions
    const unsubJoin = ChurchDataStore.subscribeToJoinRequests((fresh) => {
      if (isMounted) setJoinRequests(fresh);
    });
    const unsubRec = AuthService.subscribeToRecoveryRequests((fresh) => {
      if (isMounted) setRecoveryRequests(fresh);
    });

    const handleStoreChange = () => {
      setUsersList(ChurchDataStore.getUsers());
      setPendingRegistrations(ChurchDataStore.getPendingMinistryRegistrations());
      setJoinRequests(ChurchDataStore.getJoinRequests());
      setRecoveryRequests(AuthService.getRecoveryRequests());
    };

    window.addEventListener('bjc_users_change', handleStoreChange);
    window.addEventListener('bjc_auth_change', handleStoreChange);
    window.addEventListener('bjc_join_requests_change', handleStoreChange);
    window.addEventListener('bjc_recovery_change', handleStoreChange);
    window.addEventListener('storage', handleStoreChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsubJoin();
      unsubRec();
      window.removeEventListener('bjc_users_change', handleStoreChange);
      window.removeEventListener('bjc_auth_change', handleStoreChange);
      window.removeEventListener('bjc_join_requests_change', handleStoreChange);
      window.removeEventListener('bjc_recovery_change', handleStoreChange);
      window.removeEventListener('storage', handleStoreChange);
    };
  }, []);

  const currentUser: UserProfile = ChurchDataStore.getCurrentUser();

  const handleJoinDecision = (requestId: string, status: 'approved' | 'declined') => {
    const updated = ChurchDataStore.handleJoinRequest(requestId, status);
    setJoinRequests([...updated]);
    setUsersList(ChurchDataStore.getUsers());
    setPendingRegistrations(ChurchDataStore.getPendingMinistryRegistrations());
  };

  const handleApproveRegistration = (userId: string, ministryId?: string) => {
    ChurchDataStore.approveMinistryRegistration(userId, ministryId);
    setUsersList(ChurchDataStore.getUsers());
    setPendingRegistrations(ChurchDataStore.getPendingMinistryRegistrations());
  };

  const handleRejectRegistration = (userId: string) => {
    const reason = prompt('Optional rejection note for applicant:') || undefined;
    ChurchDataStore.rejectMinistryRegistration(userId, reason);
    setUsersList(ChurchDataStore.getUsers());
    setPendingRegistrations(ChurchDataStore.getPendingMinistryRegistrations());
  };

  const handleResolveRecovery = async (requestId: string) => {
    const res = await AuthService.adminResolveRecovery(requestId, currentUser.id);
    if (res.success && res.tempPassword) {
      setResolvedTempPassword({ id: requestId, tempPass: res.tempPassword });
      setRecoveryRequests(AuthService.getRecoveryRequests());
    } else {
      alert(res.error || 'Failed to resolve recovery request.');
    }
  };

  const handleCopyTempPassword = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    const saved = ChurchDataStore.saveAnnouncement({
      title: annTitle,
      content: annContent,
      category: annCategory,
      priority: annPriority,
      date: new Date().toISOString().split('T')[0],
      authorName: currentUser.name,
      authorRole: currentUser.roleTitle,
      targetAudience: 'all'
    });

    setAnnList([saved, ...annList]);
    setIsAnnModalOpen(false);
    setAnnTitle('');
    setAnnContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Admin Header */}
      <div className="rounded-3xl bg-primary text-white border border-slate-800 p-6 sm:p-8 shadow-elevated relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Administrative Console • Role-Based Access Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Church Management & Pastoral Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Oversight for congregation membership, ministry assignments, announcements, worship databases, and Supabase cloud infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAllCloudData}
              disabled={isRefreshingCloud}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-soft"
              title="Refresh and sync all requests from Supabase Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gold-300 ${isRefreshingCloud ? 'animate-spin' : ''}`} />
              <span>{isRefreshingCloud ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs space-y-0.5">
              <div className="font-semibold text-gold-300">Active Operator</div>
              <div className="font-bold text-white">{currentUser.name}</div>
              <div className="text-[10px] text-slate-300">{currentUser.roleTitle}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'overview' ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'requests' ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-gold" />
          <span>Ministry Approvals</span>
          {(pendingRegistrations.length + joinRequests.filter(r => r.status === 'pending').length) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
              {pendingRegistrations.length + joinRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'recovery' ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Account Recovery</span>
          {recoveryRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[10px]">
              {recoveryRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'members' ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Member Directory & RBAC
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'announcements' ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Announcements Publisher
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'system' ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          System & Database
        </button>
      </div>

      {/* OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Songs</span>
              <div className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{songs.length}</div>
              <div className="text-[10px] text-gold">With Vocal Keys</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Singers</span>
              <div className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{singers.length}</div>
              <div className="text-[10px] text-sage-600">Praise Roster</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Ministries</span>
              <div className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{ministries.length}</div>
              <div className="text-[10px] text-slate-500">Departments</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Church Events</span>
              <div className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{events.length}</div>
              <div className="text-[10px] text-blue-500">Upcoming Lineup</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Join Requests</span>
              <div className="text-2xl font-serif font-bold text-amber-500">{joinRequests.filter(r => r.status === 'pending').length}</div>
              <div className="text-[10px] text-slate-500">Pending Review</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Supabase State</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {isSupabaseConfigured ? 'Connected' : 'Offline / Local'}
              </div>
              <div className="text-[10px] text-emerald-600">Schema Ready</div>
            </div>
          </div>
        </div>
      )}

      {/* MINISTRY APPROVALS & JOIN REQUESTS (SUPER ADMIN GOVERNANCE) */}
      {activeTab === 'requests' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                  Ministry Approvals & Service Applications
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Super Admin authorization: verify new ministry member registrations and confirm church member requests to serve.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setApprovalsSubTab('registrations')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  approvalsSubTab === 'registrations' 
                    ? 'bg-primary text-white shadow-soft' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>New Registrations</span>
                {pendingRegistrations.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px]">
                    {pendingRegistrations.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setApprovalsSubTab('join_requests')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  approvalsSubTab === 'join_requests' 
                    ? 'bg-primary text-white shadow-soft' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Member Join Requests</span>
                {joinRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px]">
                    {joinRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: NEW MINISTRY MEMBER REGISTRATIONS (REQUIRES SUPER ADMIN APPROVAL) */}
          {approvalsSubTab === 'registrations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pending Ministry Registrations ({pendingRegistrations.length})
                </h4>
                <span className="text-[11px] text-slate-400">
                  New users waiting for Super Admin confirmation
                </span>
              </div>

              {pendingRegistrations.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    All Ministry Member Registrations Verified
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    There are no pending ministry accounts awaiting confirmation. New signups requesting ministry roles will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRegistrations.map(user => {
                    const targetName = user.targetMinistryId === 'ministry-usher' 
                      ? 'Ushering Team' 
                      : user.targetMinistryId === 'ministry-multimedia' 
                        ? 'Multimedia Team' 
                        : 'Worship Team';

                    return (
                      <div
                        key={user.id}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {user.name}
                            </span>
                            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-gold/15 text-gold font-bold">
                              @{user.username}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                              Pending Admin Verification
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 flex items-center gap-3">
                            <span>Email: <strong className="text-slate-700 dark:text-slate-300">{user.email}</strong></span>
                            <span>•</span>
                            <span>Target: <strong className="text-gold">{targetName}</strong></span>
                            <span>•</span>
                            <span>Registered: {user.joinedDate || 'Recent'}</span>
                          </div>

                          {user.ministryMessage && (
                            <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 italic">
                              "{user.ministryMessage}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleApproveRegistration(user.id, user.targetMinistryId)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept & Verify</span>
                          </button>

                          <button
                            onClick={() => handleRejectRegistration(user.id)}
                            className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                          >
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: CHURCH MEMBER MINISTRY JOIN REQUESTS */}
          {approvalsSubTab === 'join_requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Church Member Applications to Join ({joinRequests.filter(r => r.status === 'pending').length} Pending)
                </h4>
                <span className="text-[11px] text-slate-400">
                  Submitted from the Ministry page
                </span>
              </div>

              {joinRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    All Join Requests Processed
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    No pending join requests from church members at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {joinRequests.filter(r => r.status === 'pending').map(req => (
                    <div
                      key={req.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {req.userName}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {req.userEmail}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                            Pending Review
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-gold">
                          Applying to Serve in: {req.ministryName}
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 italic">
                          "{req.experience || 'Heart to serve in God’s house.'}"
                        </p>

                        <div className="text-[10px] text-slate-400">
                          Submitted: {new Date(req.requestedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleJoinDecision(req.id, 'approved')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Assign</span>
                        </button>

                        <button
                          onClick={() => handleJoinDecision(req.id, 'declined')}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                        >
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resolved Join Requests History */}
              {joinRequests.filter(r => r.status !== 'pending').length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Application History ({joinRequests.filter(r => r.status !== 'pending').length})
                  </h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {joinRequests.filter(r => r.status !== 'pending').map(req => (
                      <div key={req.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{req.userName}</span>
                          <span className="text-slate-400 text-[11px] ml-1.5">• {req.ministryName}</span>
                          <div className="text-[10px] text-slate-400">
                            Requested: {new Date(req.requestedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.status === 'approved' 
                            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200' 
                            : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ACCOUNT RECOVERY MANAGEMENT (Admin & Pastoral Assisted) */}
      {activeTab === 'recovery' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                  Administrator-Assisted Account Recovery
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Pastoral governance: review password recovery submissions, clear brute-force lockouts, and issue secure temporary credentials.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-slate-800 border border-gold/30 text-[11px] font-bold text-gold-dark dark:text-gold flex items-center gap-1.5 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>Authorized: {currentUser.roleTitle}</span>
            </div>
          </div>

          {/* Temporary Password Notification Banner */}
          {resolvedTempPassword && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Temporary Password Generated & Account Lockout Cleared
                </span>
                <button
                  onClick={() => setResolvedTempPassword(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Provide this temporary password directly to the verified church member. Their previous failed attempt count has been reset to 0.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 font-mono font-bold text-sm text-slate-900 dark:text-white tracking-wider">
                  {resolvedTempPassword.tempPass}
                </div>
                <button
                  onClick={() => handleCopyTempPassword(resolvedTempPassword.tempPass)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey ? 'Copied!' : 'Copy Credential'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Pending Recovery Requests */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Pending Recovery Requests ({recoveryRequests.filter(r => r.status === 'pending').length})</span>
              <span className="text-[10px] lowercase text-slate-400 font-normal">requires pastoral verification</span>
            </h4>

            {recoveryRequests.filter(r => r.status === 'pending').length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">All Member Accounts Secure</div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  There are no pending password reset or account recovery requests from congregation members at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recoveryRequests.filter(r => r.status === 'pending').map(req => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {req.fullName}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-gold/15 text-gold-dark dark:text-gold font-bold">
                          @{req.username}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                          Pending Verification
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-700 dark:text-slate-200 font-semibold">Reason:</strong> {req.requestReason}
                      </p>
                      <div className="text-[10px] text-slate-400">
                        Requested: {new Date(req.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveRecovery(req.id)}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-soft"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-gold" />
                        <span>Issue Temp Key & Unlock</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Resolved Requests */}
          {recoveryRequests.filter(r => r.status === 'resolved').length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recovery Audit Log (Resolved)
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {recoveryRequests.filter(r => r.status === 'resolved').map(req => (
                  <div key={req.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{req.fullName}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5">(@{req.username})</span>
                      <div className="text-[10px] text-slate-400">
                        Resolved by {req.resolvedBy || 'Administrator'} • {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Resolved
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
      {activeTab === 'members' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Church Members & Role-Based Permissions
              </h3>
              <p className="text-xs text-slate-500">
                6-tier permission system: Super Admin, Church Admin, Pastor, Ministry Leader, Ministry Member, Regular Member.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-400 uppercase text-[10px]">
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Assigned Ministries</th>
                  <th className="pb-3">Email</th>
                  {currentUser.role === 'super_admin' && (
                    <th className="pb-3 text-right">Super Admin Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-gold/30 object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">Joined {u.joinedDate}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[10px] uppercase text-primary dark:text-gold border border-slate-200 dark:border-slate-700">
                        {u.roleTitle}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {u.ministryIds?.length > 0 ? `${u.ministryIds.length} ministries` : 'General Congregation'}
                    </td>
                    <td className="py-3 text-slate-400 font-mono">
                      {u.email}
                    </td>
                    {currentUser.role === 'super_admin' && (
                      <td className="py-3 text-right">
                        {u.id !== currentUser.id ? (
                          <button
                            onClick={() => handleDeleteMember(u)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 font-bold text-[11px] transition inline-flex items-center gap-1 border border-rose-200 dark:border-rose-900/60 shadow-2xs"
                            title={`Delete ${u.name}'s account`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Account</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-mono">You (Super Admin)</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS PUBLISHER */}
      {activeTab === 'announcements' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Church Announcements Hub
              </h3>
              <p className="text-xs text-slate-500">Publish target announcements to the church family or specific ministry groups.</p>
            </div>

            <button
              onClick={() => setIsAnnModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gold text-slate-950 font-bold text-xs shadow-gold hover:bg-gold-dark hover:text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="space-y-3">
            {annList.map(a => (
              <div key={a.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-gold">
                      {a.category}
                    </span>
                    <span className="text-slate-400">{a.date}</span>
                    {a.priority === 'pinned' && (
                      <span className="text-[10px] font-bold text-amber-600 uppercase">Pinned</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{a.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SYSTEM & SUPABASE STATUS */}
      {activeTab === 'system' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
              Database Architecture & Migration Status
            </h3>
            <p className="text-xs text-slate-500">
              Complete PostgreSQL normalized schema designed for Supabase.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Database className="w-4 h-4 text-gold" />
              <span>Schema File: supabase_schema.sql</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Contains all 28+ tables: profiles, user_roles, ministries, ministry_members, bible_verses, songs, singers, singer_song_keys, worship_setlists, chat_rooms, chat_messages, announcements, events, and prayer_requests, with full Row Level Security (RLS) policies and Supabase Realtime publications.
            </p>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Publish Church Announcement
              </h3>
              <button onClick={() => setIsAnnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Thanksgiving Sunday Celebration"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="General Church">General Church</option>
                    <option value="Sunday Services">Sunday Services</option>
                    <option value="Multi Media">Multi Media</option>
                    <option value="Worship Team">Worship Team</option>
                    <option value="Usher">Usher</option>
                    <option value="Special Events">Special Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="pinned">Pinned to Top</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Announcement Details *
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide clear details and scripture encouragement..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
