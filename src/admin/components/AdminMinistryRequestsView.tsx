import React, { useState, useEffect } from 'react';
import { 
  UserCheck, CheckCircle2, XCircle, Clock, ShieldCheck, 
  Sparkles, RefreshCw, MessageSquare, AlertCircle, Heart
} from 'lucide-react';
import { ChurchDataStore } from '../../services/churchDataStore';
import { UserProfile, MinistryJoinRequest } from '../../types';

export const AdminMinistryRequestsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'registrations' | 'join_requests'>('registrations');
  const [pendingRegistrations, setPendingRegistrations] = useState<UserProfile[]>(() =>
    ChurchDataStore.getPendingMinistryRegistrations()
  );
  const [joinRequests, setJoinRequests] = useState<MinistryJoinRequest[]>(() =>
    ChurchDataStore.getJoinRequests()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [cloudJoin, cloudUsers] = await Promise.all([
        ChurchDataStore.fetchJoinRequestsFromCloud(),
        ChurchDataStore.fetchUsersFromCloud()
      ]);
      if (cloudJoin) setJoinRequests(cloudJoin);
      if (cloudUsers) {
        setPendingRegistrations(ChurchDataStore.getPendingMinistryRegistrations());
      }
    } catch (err) {
      console.warn('AdminMinistryRequestsView refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 20000);

    const unsubJoin = ChurchDataStore.subscribeToJoinRequests((fresh) => {
      setJoinRequests(fresh);
    });

    const handleSync = () => {
      setPendingRegistrations(ChurchDataStore.getPendingMinistryRegistrations());
      setJoinRequests(ChurchDataStore.getJoinRequests());
    };

    window.addEventListener('bjc_users_change', handleSync);
    window.addEventListener('bjc_join_requests_change', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      clearInterval(interval);
      unsubJoin();
      window.removeEventListener('bjc_users_change', handleSync);
      window.removeEventListener('bjc_join_requests_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleApproveRegistration = async (user: UserProfile) => {
    const minId = user.targetMinistryId || 'ministry-worship';
    ChurchDataStore.approveMinistryRegistration(user.id, minId);
    setSuccessMessage(`Verified & approved ${user.name} for ministry service!`);
    await refreshData();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleRejectRegistration = async (user: UserProfile) => {
    const reason = prompt(`Optional reason to reject registration for "${user.name}":`) || undefined;
    ChurchDataStore.rejectMinistryRegistration(user.id, reason);
    await refreshData();
  };

  const handleJoinDecision = async (reqId: string, status: 'approved' | 'declined') => {
    const updated = ChurchDataStore.handleJoinRequest(reqId, status);
    setJoinRequests([...updated]);
    setSuccessMessage(status === 'approved' ? 'Join request approved! Member added to ministry.' : 'Join request declined.');
    await refreshData();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const pendingJoin = joinRequests.filter(r => r.status === 'pending');
  const pastJoin = joinRequests.filter(r => r.status !== 'pending');

  const getMinistryBadgeColor = (minId: string) => {
    if (minId.includes('worship')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (minId.includes('usher')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#1F1D1D]">
              Ministry Approvals & Join Requests
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8C5858]/10 text-[#8C5858] border border-[#8C5858]/20">
              {pendingRegistrations.length + pendingJoin.length} Pending
            </span>
          </div>
          <p className="text-xs text-[#78716E] mt-1">
            Super Admin governance for new ministry registrations and congregation member applications.
          </p>
        </div>

        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EBDCD5] bg-white hover:bg-[#FDFBF9] text-xs font-semibold text-[#5C5654] transition shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#8C5858] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing Cloud...' : 'Sync Cloud Data'}</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-[#EBDCD5] pb-2">
        <button
          onClick={() => setActiveSubTab('registrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'registrations'
              ? 'bg-[#8C5858] text-white shadow-xs'
              : 'text-[#78716E] hover:bg-[#F5ECE8] hover:text-[#1F1D1D]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>New Registrations</span>
          {pendingRegistrations.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeSubTab === 'registrations' ? 'bg-white text-[#8C5858]' : 'bg-[#8C5858] text-white'
            }`}>
              {pendingRegistrations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('join_requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'join_requests'
              ? 'bg-[#8C5858] text-white shadow-xs'
              : 'text-[#78716E] hover:bg-[#F5ECE8] hover:text-[#1F1D1D]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Member Join Requests</span>
          {pendingJoin.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeSubTab === 'join_requests' ? 'bg-white text-[#8C5858]' : 'bg-[#8C5858] text-white'
            }`}>
              {pendingJoin.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: NEW REGISTRATIONS (MINISTRY MEMBERS PENDING) */}
      {activeSubTab === 'registrations' && (
        <div className="space-y-4">
          {pendingRegistrations.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-[#EBDCD5] text-center space-y-2 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-serif font-bold text-base text-[#1F1D1D]">
                No Pending Ministry Registrations
              </div>
              <p className="text-xs text-[#78716E] max-w-sm mx-auto">
                All accounts registered as ministry members have been verified and confirmed.
              </p>
            </div>
          ) : (
            pendingRegistrations.map((user) => (
              <div
                key={user.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-[#EBDCD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#1F1D1D]">{user.name}</span>
                    <span className="text-xs text-[#78716E]">@{user.username}</span>
                    <span className="text-xs text-[#78716E]">• {user.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getMinistryBadgeColor(user.targetMinistryId || '')}`}>
                      {user.targetMinistryId === 'ministry-worship' ? 'Worship Team' :
                       user.targetMinistryId === 'ministry-usher' ? 'Ushering Team' :
                       user.targetMinistryId === 'ministry-multimedia' ? 'Multimedia Team' : 'Ministry Member'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Awaiting Approval
                    </span>
                  </div>

                  {user.ministryMessage && (
                    <div className="text-xs text-[#5C5654] italic bg-[#F8F3F0] p-3 rounded-2xl border border-[#EBDCD5] flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#8C5858] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#1F1D1D] not-italic">Heart to serve: </span>
                        "{user.ministryMessage}"
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-[#78716E]">
                    Registered on: {user.joinedDate || 'Recently'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveRegistration(user)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept & Verify</span>
                  </button>
                  <button
                    onClick={() => handleRejectRegistration(user)}
                    className="px-4 py-2 rounded-xl bg-[#F5ECE8] hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MEMBER JOIN REQUESTS */}
      {activeSubTab === 'join_requests' && (
        <div className="space-y-6">
          {/* Active Pending */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#1F1D1D] flex items-center gap-1.5">
              <span>Pending Church Member Applications ({pendingJoin.length})</span>
            </h3>

            {pendingJoin.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-[#EBDCD5] text-center space-y-2 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <div className="font-serif font-bold text-base text-[#1F1D1D]">
                  No Pending Join Requests
                </div>
                <p className="text-xs text-[#78716E] max-w-sm mx-auto">
                  All requests from church members to join ministry teams have been processed.
                </p>
              </div>
            ) : (
              pendingJoin.map((req) => (
                <div
                  key={req.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-[#EBDCD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-[#1F1D1D]">{req.userName}</span>
                      <span className="text-xs text-[#78716E]">• {req.userEmail}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getMinistryBadgeColor(req.ministryId)}`}>
                        {req.ministryName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    </div>

                    <div className="text-xs text-[#5C5654] italic bg-[#F8F3F0] p-3 rounded-2xl border border-[#EBDCD5] flex items-start gap-2">
                      <Heart className="w-3.5 h-3.5 text-[#8C5858] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#1F1D1D] not-italic">Member Note / Experience: </span>
                        "{req.experience || 'No previous experience noted.'}"
                      </div>
                    </div>

                    <div className="text-[11px] text-[#78716E]">
                      Requested at: {new Date(req.requestedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleJoinDecision(req.id, 'approved')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Assign</span>
                    </button>
                    <button
                      onClick={() => handleJoinDecision(req.id, 'declined')}
                      className="px-4 py-2 rounded-xl bg-[#F5ECE8] hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Past / Processed History */}
          {pastJoin.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#EBDCD5]">
              <h3 className="font-serif font-bold text-sm text-[#78716E]">
                Application History ({pastJoin.length})
              </h3>
              <div className="divide-y divide-[#EBDCD5] bg-white rounded-3xl border border-[#EBDCD5] p-4 shadow-xs">
                {pastJoin.map((req) => (
                  <div key={req.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-[#1F1D1D]">{req.userName}</span>
                      <span className="text-[#78716E]"> applied for {req.ministryName}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
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
  );
};
