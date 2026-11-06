import React, { useState, useEffect } from 'react';
import { 
  KeyRound, CheckCircle2, Clock, ShieldCheck, 
  Sparkles, RefreshCw, Copy, Check, Lock, AlertTriangle, User
} from 'lucide-react';
import { AuthService } from '../../services/authService';
import { ChurchDataStore } from '../../services/churchDataStore';
import { PasswordRecoveryRequest, UserProfile } from '../../types';

export const AdminAccountRecoveryView: React.FC = () => {
  const [requests, setRequests] = useState<PasswordRecoveryRequest[]>(() =>
    AuthService.getRecoveryRequests()
  );
  const [users, setUsers] = useState<UserProfile[]>(() =>
    ChurchDataStore.getUsers()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resolvedCard, setResolvedCard] = useState<{ id: string; username: string; tempPass: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [manualUser, setManualUser] = useState('');
  const [manualPass, setManualPass] = useState('');
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [cloudReqs, cloudUsers] = await Promise.all([
        AuthService.fetchRecoveryRequestsFromCloud(),
        ChurchDataStore.fetchUsersFromCloud()
      ]);
      if (cloudReqs) setRequests(cloudReqs);
      if (cloudUsers) setUsers(cloudUsers);
    } catch (err) {
      console.warn('AdminAccountRecoveryView refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 20000);

    const unsubRec = AuthService.subscribeToRecoveryRequests((fresh) => {
      setRequests(fresh);
    });

    const handleSync = () => {
      setRequests(AuthService.getRecoveryRequests());
      setUsers(ChurchDataStore.getUsers());
    };

    window.addEventListener('bjc_recovery_change', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      clearInterval(interval);
      unsubRec();
      window.removeEventListener('bjc_recovery_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleResolve = async (req: PasswordRecoveryRequest) => {
    const admin = ChurchDataStore.getCurrentUser();
    const res = await AuthService.adminResolveRecovery(req.id, admin.id);
    if (res.success && res.tempPassword) {
      setResolvedCard({
        id: req.id,
        username: req.username,
        tempPass: res.tempPassword
      });
      await refreshData();
    } else {
      alert(res.error || 'Failed to resolve recovery request.');
    }
  };

  const handleCopyPassword = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleManualReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUser) return;
    setIsManualSubmitting(true);
    try {
      const tempPass = manualPass.trim() || `Bjc${Math.floor(100000 + Math.random() * 900000)}!`;
      const admin = ChurchDataStore.getCurrentUser();
      
      // Submit a synthetic request and immediately resolve it
      const rec = await AuthService.requestAccountRecovery(manualUser, 'Direct Super Admin Password Reset');
      const latestReqs = await AuthService.fetchRecoveryRequestsFromCloud();
      const match = latestReqs.find(r => r.username.toLowerCase() === manualUser.toLowerCase() && r.status === 'pending');
      
      if (match) {
        await AuthService.adminResolveRecovery(match.id, admin.id, tempPass);
      }
      
      setManualSuccess(`Password for @${manualUser} successfully reset to: ${tempPass}`);
      setResolvedCard({ id: 'manual', username: manualUser, tempPass });
      setManualPass('');
      await refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to reset password.');
    } finally {
      setIsManualSubmitting(false);
    }
  };

  const pendingList = requests.filter(r => r.status === 'pending');
  const resolvedList = requests.filter(r => r.status === 'resolved');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#1F1D1D]">
              Account Recovery & Security Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8C5858]/10 text-[#8C5858] border border-[#8C5858]/20">
              {pendingList.length} Pending
            </span>
          </div>
          <p className="text-xs text-[#78716E] mt-1">
            Review member password reset requests, unlock locked accounts, and securely issue temporary credentials.
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

      {/* REVEALED TEMPORARY PASSWORD BANNER */}
      {resolvedCard && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="font-serif font-bold text-sm">Temporary Password Generated & Account Unlocked!</span>
            </div>
            <button
              onClick={() => setResolvedCard(null)}
              className="text-xs text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed">
            The account for <span className="font-bold">@{resolvedCard.username}</span> has been unlocked in Supabase Cloud. Share this temporary password securely with the member so they can log in:
          </p>

          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-amber-200">
            <code className="text-base font-mono font-bold text-[#8C5858] tracking-wider flex-1">
              {resolvedCard.tempPass}
            </code>
            <button
              onClick={() => handleCopyPassword(resolvedCard.tempPass)}
              className="px-3 py-1.5 rounded-xl bg-[#8C5858] hover:bg-[#754444] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied!' : 'Copy Password'}</span>
            </button>
          </div>
        </div>
      )}

      {/* PENDING REQUESTS LIST */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-base text-[#1F1D1D] flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Pending Password Recovery Requests ({pendingList.length})</span>
        </h3>

        {pendingList.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-[#EBDCD5] text-center space-y-2 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="font-serif font-bold text-base text-[#1F1D1D]">
              No Pending Account Recovery Requests
            </div>
            <p className="text-xs text-[#78716E] max-w-sm mx-auto">
              All member password recovery submissions have been resolved and accounts are in good standing.
            </p>
          </div>
        ) : (
          pendingList.map((req) => (
            <div
              key={req.id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-[#EBDCD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-[#1F1D1D]">{req.fullName}</span>
                  <span className="text-xs font-mono text-[#8C5858] bg-[#F5ECE8] px-2 py-0.5 rounded-md">
                    @{req.username}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Awaiting Reset
                  </span>
                </div>

                <div className="text-xs text-[#5C5654] italic bg-[#F8F3F0] p-3 rounded-2xl border border-[#EBDCD5]">
                  <span className="font-semibold text-[#1F1D1D] not-italic">Member's Reason: </span>
                  "{req.requestReason}"
                </div>

                <div className="text-[11px] text-[#78716E]">
                  Requested: {new Date(req.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleResolve(req)}
                  className="px-4 py-2.5 rounded-xl bg-[#8C5858] hover:bg-[#754444] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Generate Temp Password & Unlock</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DIRECT EMERGENCY PASSWORD RESET TOOL */}
      <div className="p-6 rounded-3xl bg-white border border-[#EBDCD5] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-[#8C5858]">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="font-serif font-bold text-base text-[#1F1D1D]">
            Direct Member Password Reset Tool
          </h3>
        </div>
        <p className="text-xs text-[#78716E]">
          If a congregation member reaches out to you directly by phone, SMS, or in person, select their account to reset their password immediately without waiting for a form submission.
        </p>

        {manualSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {manualSuccess}
          </div>
        )}

        <form onSubmit={handleManualReset} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#5C5654]">Select Member *</label>
            <select
              required
              value={manualUser}
              onChange={(e) => setManualUser(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#EBDCD5] bg-[#F8F3F0] text-xs text-[#1F1D1D] focus:outline-none focus:ring-1 focus:ring-[#8C5858]"
            >
              <option value="">-- Choose Member Account --</option>
              {users.map(u => (
                <option key={u.id} value={u.username}>
                  {u.name} (@{u.username}) - {u.roleTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#5C5654]">Custom Password (Optional)</label>
            <input
              type="text"
              value={manualPass}
              onChange={(e) => setManualPass(e.target.value)}
              placeholder="Leave blank to auto-generate"
              className="w-full px-3 py-2 rounded-xl border border-[#EBDCD5] bg-[#F8F3F0] text-xs text-[#1F1D1D] focus:outline-none focus:ring-1 focus:ring-[#8C5858]"
            />
          </div>

          <button
            type="submit"
            disabled={isManualSubmitting || !manualUser}
            className="w-full py-2 px-4 rounded-xl bg-[#8C5858] hover:bg-[#754444] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isManualSubmitting ? 'Resetting...' : 'Reset Password Now'}</span>
          </button>
        </form>
      </div>

      {/* RESOLVED HISTORY */}
      {resolvedList.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#EBDCD5]">
          <h3 className="font-serif font-bold text-sm text-[#78716E]">
            Resolved Recovery History ({resolvedList.length})
          </h3>
          <div className="divide-y divide-[#EBDCD5] bg-white rounded-3xl border border-[#EBDCD5] p-4 shadow-xs">
            {resolvedList.map((req) => (
              <div key={req.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-[#1F1D1D]">{req.fullName}</span>
                  <span className="text-[#78716E]"> (@{req.username})</span>
                  {req.resolvedBy && (
                    <span className="text-[11px] text-[#78716E] ml-2">
                      • Resolved by {req.resolvedBy} on {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : 'Recently'}
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
