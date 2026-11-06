import React, { useState } from 'react';
import { 
  Users, Sparkles, MapPin, Clock, CheckCircle2, ChevronRight, 
  Send, FileText, ArrowRight, X, ShieldAlert, Music, Video,
  Calendar, Layers, ShieldCheck, Heart, UserPlus, ExternalLink,
  Lock, AlertCircle
} from 'lucide-react';
import { ChurchDataStore } from '../../services/churchDataStore';
import { 
  MinistryStore, MinistryItem, MinistryId 
} from '../../services/ministryStore';
import { UserProfile, MinistryJoinRequest } from '../../types';
import { SharedWorkspaceLayout } from './SharedWorkspaceLayout';
import { UnifiedSundayServicePlanner } from './UnifiedSundayServicePlanner';

interface MinistriesViewProps {
  currentUser?: UserProfile | null;
  onNavigate?: (tab: string) => void;
}

export const MinistriesView: React.FC<MinistriesViewProps> = ({
  currentUser: propUser,
  onNavigate
}) => {
  const currentUser: UserProfile = propUser || ChurchDataStore.getCurrentUser();
  const [ministries, setMinistries] = useState<MinistryItem[]>(() => MinistryStore.getMinistries());
  const [activeWorkspaceMinistry, setActiveWorkspaceMinistry] = useState<MinistryItem | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'planner'>('cards');
  
  // Join requests
  const [joinRequests, setJoinRequests] = useState<MinistryJoinRequest[]>(() => ChurchDataStore.getJoinRequests());
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [targetMinistryForJoin, setTargetMinistryForJoin] = useState<MinistryItem>(ministries[0]);
  const [experienceText, setExperienceText] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Role & Permissions check:
  // Church members (regular_member) CANNOT enter the workspace; only view the ministries & request to join.
  // Super Admin, Church Admin, Pastor, Ministry Leader, and active verified Ministry Members can enter.
  const isSuperOrPastor = ['super_admin', 'church_admin', 'pastor'].includes(currentUser.role);
  const isMinistryLeader = currentUser.role === 'ministry_leader';
  const isActiveMinistryMember = currentUser.role === 'ministry_member' && currentUser.approvalStatus !== 'pending';
  const canAccessWorkspaces = isSuperOrPastor || isMinistryLeader || isActiveMinistryMember;

  const handleOpenJoinModal = (m: MinistryItem) => {
    setTargetMinistryForJoin(m);
    setIsJoinModalOpen(true);
    setSubmittedSuccess(false);
  };

  const handleMinistryCardClick = (m: MinistryItem) => {
    if (canAccessWorkspaces) {
      setActiveWorkspaceMinistry(m);
    } else {
      // Church Member: Cannot enter, open Join Request modal
      handleOpenJoinModal(m);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMinistryForJoin) return;
    ChurchDataStore.submitJoinRequest(targetMinistryForJoin.id, experienceText);
    setJoinRequests(ChurchDataStore.getJoinRequests());
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsJoinModalOpen(false);
      setExperienceText('');
    }, 2200);
  };

  // Check if current user has an active pending request for a ministry
  const getPendingRequestForMinistry = (ministryId: string) => {
    return joinRequests.find(r => r.ministryId === ministryId && r.userId === currentUser.id && r.status === 'pending');
  };

  // If a ministry workspace is active, render the dedicated workspace
  if (activeWorkspaceMinistry && canAccessWorkspaces) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SharedWorkspaceLayout
          ministry={activeWorkspaceMinistry}
          currentUser={currentUser}
          onBack={() => setActiveWorkspaceMinistry(null)}
          onOpenWorshipHub={() => onNavigate && onNavigate('worship')}
        />
      </div>
    );
  }

  // If user selected Unified Sunday Service Planner view
  if (viewMode === 'planner') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode('cards')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:border-gold transition shadow-soft cursor-pointer"
          >
            <span>← Back to Ministry Teams</span>
          </button>

          <span className="text-xs text-stone-500 font-semibold">
            Unified Church-Wide Operations
          </span>
        </div>

        <UnifiedSundayServicePlanner
          currentUser={currentUser}
          onNavigateToMinistry={(id) => {
            const m = ministries.find(item => item.id === id);
            if (m) {
              if (canAccessWorkspaces) {
                setActiveWorkspaceMinistry(m);
              } else {
                handleOpenJoinModal(m);
              }
            }
          }}
          onOpenWorshipHub={() => onNavigate && onNavigate('worship')}
        />
      </div>
    );
  }

  // Next Sunday service plan summary for banner
  const nextSundayPlan = MinistryStore.getServicePlanByDate('2026-11-08');
  const worshipDone = Object.values(nextSundayPlan.worship.checklist).filter(Boolean).length;
  const usherDone = Object.values(nextSundayPlan.ushering.checklist).filter(Boolean).length;
  const multiDone = Object.values(nextSundayPlan.multimedia.checklist).filter(Boolean).length;
  const totalChecks = 8 + 6 + 6;
  const prepScore = Math.round(((worshipDone + usherDone + multiDone) / totalChecks) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#12141D] via-[#1B1E2B] to-[#12141D] text-white p-6 sm:p-8 border border-white/10 shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Ministry Management System</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Church Ministry Teams & Workspaces
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Equipping every servant of Beholding Jesus Church to minister with spiritual excellence, coordinated schedules, and shared servant-hearted stewardship.
            </p>
          </div>

          {/* Quick Trigger to Unified Sunday Planner (Available to leaders/members, or preview) */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 w-full md:w-auto shrink-0 space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
                Sunday Prep: Nov 8
              </span>
              <span className="text-xs font-black text-gold">{prepScore}% Ready</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                style={{ width: `${prepScore}%` }}
              />
            </div>
            <button
              onClick={() => setViewMode('planner')}
              className="w-full py-2.5 px-4 rounded-xl bg-gold hover:bg-[#d8b883] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open Sunday Service Planner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* WANT TO JOIN A MINISTRY CALLOUT BANNER (For Church Members) */}
      {!canAccessWorkspaces && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-gold/10 to-amber-500/10 border border-gold/30 p-5 sm:p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Serving at Beholding Jesus Church</span>
            </span>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
              Want to Join a Ministry Team?
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
              Our ministry workspaces, transposed chord charts, rosters, and technical checklists are reserved for active ministry team members. Select a ministry below and request to join with a personal message!
            </p>
          </div>
          <button
            onClick={() => handleOpenJoinModal(ministries[0])}
            className="px-5 py-2.5 rounded-2xl bg-gold hover:bg-[#b08e57] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-soft transition whitespace-nowrap cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Request to Join a Ministry</span>
          </button>
        </div>
      )}

      {/* 3 MINISTRY CARDS (Worship Team, Ushering Team, Multimedia Team) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-white">
              The Three Core Ministry Teams
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {canAccessWorkspaces 
                ? 'Select a ministry to access schedules, rosters, tasks, attendance, and team resources.'
                : 'Browse our church ministries. Click a team to request to join and submit your message to the Admin Dashboard.'}
            </p>
          </div>

          <button
            onClick={() => setViewMode('planner')}
            className="text-xs font-bold text-gold hover:underline flex items-center gap-1"
          >
            <span>View Unified Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ministries.map(m => {
            const Icon = m.icon === 'Music' ? Music : m.icon === 'Users' ? Users : Video;
            const pendingReq = getPendingRequestForMinistry(m.id);

            return (
              <div
                key={m.id}
                onClick={() => handleMinistryCardClick(m)}
                className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-gold/60 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Ministry Cover Header */}
                <div className="relative h-44 overflow-hidden bg-stone-900">
                  <img
                    src={m.coverImage}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {m.category}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md text-gold flex items-center justify-center font-bold border border-white/20">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif font-bold text-xl text-white tracking-wide">
                      {m.name}
                    </h3>
                    <div className="text-[11px] text-stone-300 flex items-center gap-2 mt-0.5">
                      <span>Lead: <strong className="text-white">{m.leaderName}</strong></span>
                      <span>•</span>
                      <span className="text-gold font-semibold">{m.membersCount} Active Members</span>
                    </div>
                  </div>
                </div>

                {/* Ministry Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                      {m.description}
                    </p>

                    {/* Upcoming Schedule Badge */}
                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gold" />
                        <span>Upcoming Schedule</span>
                      </div>
                      <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                        {m.upcomingSchedule}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                    {canAccessWorkspaces ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveWorkspaceMinistry(m);
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft cursor-pointer active:scale-95"
                      >
                        <span>View Ministry Workspace</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenJoinModal(m);
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft cursor-pointer active:scale-95 ${
                          pendingReq 
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800' 
                            : 'bg-gold hover:bg-[#b08e57] text-slate-950'
                        }`}
                      >
                        {pendingReq ? (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>Request Pending Review</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Request to Join Team</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REQUEST TO JOIN MINISTRY MODAL (For Church Members) */}
      {isJoinModalOpen && targetMinistryForJoin && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-gold" />
                  <span>Ministry Application • Church Member</span>
                </span>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-white">
                  Want to Join a Ministry?
                </h3>
                <p className="text-xs text-stone-500">
                  Submit your request to serve. Your application will appear on the Admin Dashboard for Super Admin review.
                </p>
              </div>
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold space-y-2 text-center animate-fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-sm">Praise God! Request Submitted</div>
                <p className="text-[11px] font-normal leading-relaxed text-emerald-700 dark:text-emerald-400">
                  Your request to join the <strong>{targetMinistryForJoin.name}</strong> has been forwarded to the Admin Dashboard for Super Admin confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4 text-xs">
                {/* Ministry Switcher Pills */}
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 dark:text-stone-300 block">
                    1. Choose Which Ministry to Join *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ministries.map(min => {
                      const isSelected = targetMinistryForJoin.id === min.id;
                      return (
                        <button
                          key={min.id}
                          type="button"
                          onClick={() => setTargetMinistryForJoin(min)}
                          className={`p-2.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected 
                              ? 'bg-primary text-white border-primary shadow-soft ring-2 ring-gold/40' 
                              : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 hover:border-gold/50 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <span className="font-bold text-xs truncate w-full">{min.name}</span>
                          <span className={`text-[9.5px] truncate w-full ${isSelected ? 'text-gold' : 'text-stone-400'}`}>
                            {min.category.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Existing Pending Request Check */}
                {getPendingRequestForMinistry(targetMinistryForJoin.id) ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Application Currently Pending</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                      You already submitted an application to join the {targetMinistryForJoin.name}. It is currently awaiting Super Admin review on the Admin Dashboard.
                    </p>
                  </div>
                ) : null}

                {/* 2. Applicant Info */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">Applicant</span>
                    <span className="font-bold text-stone-900 dark:text-white">{currentUser.name}</span>
                    <span className="text-[11px] text-stone-500 block">{currentUser.email}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-stone-200 dark:bg-stone-700 font-bold text-[10px] uppercase text-stone-600 dark:text-stone-300">
                    {currentUser.roleTitle}
                  </span>
                </div>

                {/* 3. Personal Message */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-300 block">
                    2. Why do you want to join this ministry? (Heart to Serve) *
                  </label>
                  <textarea 
                    value={experienceText} 
                    onChange={e => setExperienceText(e.target.value)} 
                    placeholder="Tell leadership why you would like to join, what instruments you play, vocal range, hospitality experience, or technical/AV background..."
                    className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white placeholder:text-stone-400 h-28 outline-none focus:ring-2 focus:ring-gold/40"
                    required 
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsJoinModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 rounded-xl bg-gold hover:bg-[#b08e57] text-slate-950 font-bold shadow-soft transition cursor-pointer"
                  >
                    Submit Join Request to Admin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
