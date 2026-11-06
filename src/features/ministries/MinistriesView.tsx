import React, { useState } from 'react';
import { 
  Users, Sparkles, MapPin, Clock, CheckCircle2, ChevronRight, 
  Send, FileText, ArrowRight, X, ShieldAlert, Music, Video,
  Calendar, Layers, ShieldCheck, Heart, UserPlus, ExternalLink
} from 'lucide-react';
import { ChurchDataStore } from '../../services/churchDataStore';
import { 
  MinistryStore, MinistryItem, MinistryId 
} from '../../services/ministryStore';
import { UserProfile } from '../../types';
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
  
  // Volunteer join request modal
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [targetMinistryForJoin, setTargetMinistryForJoin] = useState<MinistryItem | null>(null);
  const [experienceText, setExperienceText] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleOpenJoinModal = (m: MinistryItem) => {
    setTargetMinistryForJoin(m);
    setIsJoinModalOpen(true);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMinistryForJoin) return;
    ChurchDataStore.submitJoinRequest(targetMinistryForJoin.id, experienceText);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsJoinModalOpen(false);
      setExperienceText('');
      setTargetMinistryForJoin(null);
    }, 1500);
  };

  // If a ministry workspace is active, render the dedicated workspace
  if (activeWorkspaceMinistry) {
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
            if (m) setActiveWorkspaceMinistry(m);
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

          {/* Quick Trigger to Unified Sunday Planner */}
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

      {/* 3 MINISTRY CARDS (Worship Team, Ushering Team, Multimedia Team) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-white">
              The Three Core Ministry Teams
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Select a ministry to access schedules, rosters, tasks, attendance, and team resources.
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
            const isWorship = m.id === 'ministry-worship';
            const isUsher = m.id === 'ministry-usher';

            return (
              <div
                key={m.id}
                className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-gold/60 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden"
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
                    <button
                      onClick={() => setActiveWorkspaceMinistry(m)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft cursor-pointer active:scale-95"
                    >
                      <span>View Ministry</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenJoinModal(m)}
                      title="Request to volunteer"
                      className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center justify-center transition cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volunteer Modal */}
      {isJoinModalOpen && targetMinistryForJoin && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  Volunteer for {targetMinistryForJoin.name}
                </h3>
                <p className="text-xs text-stone-500">
                  Lead: {targetMinistryForJoin.leaderName}
                </p>
              </div>
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Request sent! The ministry leader will contact you.</span>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={currentUser.name} 
                    disabled 
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    Your Heart to Serve / Relevant Experience
                  </label>
                  <textarea 
                    value={experienceText} 
                    onChange={e => setExperienceText(e.target.value)} 
                    placeholder="Tell us what instruments you play, your passion for greeting, or technical background..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white h-24"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsJoinModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-xl bg-primary text-white font-bold"
                  >
                    Send Volunteer Application
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