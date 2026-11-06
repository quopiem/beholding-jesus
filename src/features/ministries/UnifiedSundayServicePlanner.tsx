import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Circle, Clock, Users, Music, 
  Video, Shield, AlertCircle, Save, Sparkles, ChevronRight,
  UserCheck, Sliders, ChevronDown, Check, ArrowRight
} from 'lucide-react';
import { 
  MinistryStore, UnifiedServicePlan, MinistryItem 
} from '../../services/ministryStore';
import { UserProfile } from '../../types';

interface UnifiedSundayServicePlannerProps {
  currentUser?: UserProfile | null;
  onNavigateToMinistry?: (ministryId: string) => void;
  onOpenWorshipHub?: () => void;
}

export const UnifiedSundayServicePlanner: React.FC<UnifiedSundayServicePlannerProps> = ({
  currentUser,
  onNavigateToMinistry,
  onOpenWorshipHub
}) => {
  const [availableDates] = useState<string[]>([
    '2026-11-08',
    '2026-11-15',
    '2026-11-22',
    '2026-11-29',
    '2026-12-06'
  ]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-08');
  const [currentPlan, setCurrentPlan] = useState<UnifiedServicePlan>(() => 
    MinistryStore.getServicePlanByDate('2026-11-08')
  );
  const [activeTab, setActiveTab] = useState<'all' | 'worship' | 'ushering' | 'multimedia'>('all');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    const plan = MinistryStore.getServicePlanByDate(selectedDate);
    setCurrentPlan(plan);
  }, [selectedDate]);

  // Permission evaluation
  const userRole = currentUser?.role || 'member';
  const isAdmin = ['super_admin', 'church_admin', 'pastor'].includes(userRole);
  const isMinistryLeader = userRole === 'ministry_leader' || isAdmin;

  // Calculate readiness percentages
  const worshipChecklistValues = Object.values(currentPlan.worship.checklist);
  const worshipPercent = Math.round(
    (worshipChecklistValues.filter(Boolean).length / worshipChecklistValues.length) * 100
  );

  const usheringChecklistValues = Object.values(currentPlan.ushering.checklist);
  const usheringPercent = Math.round(
    (usheringChecklistValues.filter(Boolean).length / usheringChecklistValues.length) * 100
  );

  const multimediaChecklistValues = Object.values(currentPlan.multimedia.checklist);
  const multimediaPercent = Math.round(
    (multimediaChecklistValues.filter(Boolean).length / multimediaChecklistValues.length) * 100
  );

  const totalChecks = worshipChecklistValues.length + usheringChecklistValues.length + multimediaChecklistValues.length;
  const completedChecks = 
    worshipChecklistValues.filter(Boolean).length +
    usheringChecklistValues.filter(Boolean).length +
    multimediaChecklistValues.filter(Boolean).length;
  const overallPercent = Math.round((completedChecks / totalChecks) * 100);

  // Handlers for checklist toggles
  const handleToggleWorshipCheck = (key: keyof UnifiedServicePlan['worship']['checklist']) => {
    const updated = {
      ...currentPlan.worship.checklist,
      [key]: !currentPlan.worship.checklist[key]
    };
    MinistryStore.updateWorshipPrep(selectedDate, { checklist: updated });
    setCurrentPlan(MinistryStore.getServicePlanByDate(selectedDate));
    showSaveToast();
  };

  const handleToggleUsheringCheck = (key: keyof UnifiedServicePlan['ushering']['checklist']) => {
    const updated = {
      ...currentPlan.ushering.checklist,
      [key]: !currentPlan.ushering.checklist[key]
    };
    MinistryStore.updateUsheringPrep(selectedDate, { checklist: updated });
    setCurrentPlan(MinistryStore.getServicePlanByDate(selectedDate));
    showSaveToast();
  };

  const handleToggleMultimediaCheck = (key: keyof UnifiedServicePlan['multimedia']['checklist']) => {
    const updated = {
      ...currentPlan.multimedia.checklist,
      [key]: !currentPlan.multimedia.checklist[key]
    };
    MinistryStore.updateMultimediaPrep(selectedDate, { checklist: updated });
    setCurrentPlan(MinistryStore.getServicePlanByDate(selectedDate));
    showSaveToast();
  };

  const showSaveToast = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Planner Header with Date Selector */}
      <div className="rounded-3xl bg-gradient-to-br from-[#12141D] via-[#1A1D2B] to-[#12141D] text-white p-6 sm:p-8 border border-white/10 shadow-elevated relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Centralized Service Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Unified Sunday Service Planner
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Connect Worship, Ushering, and Multimedia teams to prepare every Sunday worship service with excellence, harmony, and mutual accountability.
            </p>
          </div>

          {/* Date Selector Pill */}
          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Select Service Sunday
            </label>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
              <Calendar className="w-4 h-4 text-gold ml-2" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-xs sm:text-sm font-semibold pr-4 py-1 outline-none cursor-pointer"
              >
                {availableDates.map(d => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {formatDate(d)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[10px] text-stone-400">
              Live synchronized across all ministry leaders
            </span>
          </div>
        </div>

        {/* Global Preparedness Progress Meter */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div className="sm:col-span-1">
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Overall Preparedness</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-gold">{overallPercent}%</span>
              <span className="text-xs text-stone-400">{completedChecks} / {totalChecks} Tasks Ready</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-gold to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          <div className="sm:col-span-3 grid grid-cols-3 gap-3">
            {/* Worship progress */}
            <div 
              onClick={() => setActiveTab('worship')}
              className={`p-3 rounded-2xl border cursor-pointer transition ${
                activeTab === 'worship' ? 'bg-gold/20 border-gold/60' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-gold" /> Worship
                </span>
                <span className="font-bold text-gold">{worshipPercent}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all" style={{ width: `${worshipPercent}%` }} />
              </div>
            </div>

            {/* Ushering progress */}
            <div 
              onClick={() => setActiveTab('ushering')}
              className={`p-3 rounded-2xl border cursor-pointer transition ${
                activeTab === 'ushering' ? 'bg-emerald-500/20 border-emerald-500/60' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> Ushering
                </span>
                <span className="font-bold text-emerald-400">{usheringPercent}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${usheringPercent}%` }} />
              </div>
            </div>

            {/* Multimedia progress */}
            <div 
              onClick={() => setActiveTab('multimedia')}
              className={`p-3 rounded-2xl border cursor-pointer transition ${
                activeTab === 'multimedia' ? 'bg-indigo-500/20 border-indigo-500/60' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-indigo-400" /> Multimedia
                </span>
                <span className="font-bold text-indigo-400">{multimediaPercent}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${multimediaPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'all' 
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft' 
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          All 3 Teams (Unified View)
        </button>
        <button
          onClick={() => setActiveTab('worship')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'worship' 
              ? 'bg-amber-600 text-white shadow-soft' 
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          Worship Team ({worshipPercent}%)
        </button>
        <button
          onClick={() => setActiveTab('ushering')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ushering' 
              ? 'bg-emerald-600 text-white shadow-soft' 
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Ushering Team ({usheringPercent}%)
        </button>
        <button
          onClick={() => setActiveTab('multimedia')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'multimedia' 
              ? 'bg-indigo-600 text-white shadow-soft' 
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          Multimedia Team ({multimediaPercent}%)
        </button>

        {isSavedNotice && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> Changes saved
          </span>
        )}
      </div>

      {/* 3-COLUMN / ACCORDION UNIFIED GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========================================================= */}
        {/* 1. WORSHIP TEAM PANEL                                     */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === 'worship') && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white text-base">
                      Worship Team
                    </h3>
                    <div className="text-[11px] text-stone-500">
                      Leader: <strong className="text-stone-800 dark:text-stone-200">{currentPlan.worship.worshipLeader}</strong>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  {worshipPercent}% Ready
                </span>
              </div>

              {/* Roster & Assignments */}
              <div className="space-y-2 text-xs bg-stone-50 dark:bg-stone-800/50 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Rehearsal Status:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{currentPlan.worship.rehearsalStatus}</span>
                </div>
                <div>
                  <span className="text-stone-500">Assigned Vocalists:</span>
                  <div className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                    {currentPlan.worship.singers.length > 0 ? currentPlan.worship.singers.join(', ') : 'Not assigned yet'}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">Band / Instrumentalists:</span>
                  <div className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                    {currentPlan.worship.instrumentalists.length > 0 ? currentPlan.worship.instrumentalists.join(', ') : 'Not assigned yet'}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">Sunday Setlist & Keys:</span>
                  <ul className="mt-1 space-y-1 font-semibold text-stone-700 dark:text-stone-300 list-disc list-inside">
                    {currentPlan.worship.songsSummary.map((s, idx) => (
                      <li key={idx} className="truncate">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 8-Item Worship Preparation Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Worship Preparation Checklist
                </div>
                <div className="space-y-1.5">
                  {[
                    { key: 'songsSelected', label: '1. Sunday Songs Selected' },
                    { key: 'keysConfirmed', label: '2. Vocal & Band Keys Confirmed' },
                    { key: 'worshipLeaderAssigned', label: '3. Worship Leader Assigned' },
                    { key: 'vocalistsAssigned', label: '4. Vocalists & Backing Assigned' },
                    { key: 'instrumentalistsAssigned', label: '5. Band / Instrumentalists Ready' },
                    { key: 'harmoniesPrepared', label: '6. Vocal Harmonies Prepared' },
                    { key: 'rehearsalScheduled', label: '7. Saturday Rehearsal Scheduled' },
                    { key: 'finalSetlistApproved', label: '8. Final Setlist Approved' }
                  ].map(item => {
                    const isChecked = currentPlan.worship.checklist[item.key as keyof UnifiedServicePlan['worship']['checklist']];
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleToggleWorshipCheck(item.key as keyof UnifiedServicePlan['worship']['checklist'])}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer text-left ${
                          isChecked 
                            ? 'bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold' 
                            : 'bg-stone-50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action Button to Worship Module */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  if (onOpenWorshipHub) onOpenWorshipHub();
                  else if (onNavigateToMinistry) onNavigateToMinistry('ministry-worship');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft"
              >
                <span>Open Song & Vocal Key Manager</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. USHERING TEAM PANEL                                    */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === 'ushering') && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white text-base">
                      Ushering Team
                    </h3>
                    <div className="text-[11px] text-stone-500">
                      Lead Usher: <strong className="text-stone-800 dark:text-stone-200">{currentPlan.ushering.seatingLead}</strong>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {usheringPercent}% Ready
                </span>
              </div>

              {/* Roster & Assignments */}
              <div className="space-y-2 text-xs bg-stone-50 dark:bg-stone-800/50 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800">
                <div>
                  <span className="text-stone-500">Welcome Team (Foyer / Entrance):</span>
                  <div className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                    {currentPlan.ushering.welcomeTeam.length > 0 ? currentPlan.ushering.welcomeTeam.join(', ') : 'Not assigned'}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">Assigned Sanctuary Ushers:</span>
                  <div className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                    {currentPlan.ushering.assignedUshers.length > 0 ? currentPlan.ushering.assignedUshers.join(', ') : 'Not assigned'}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500">Tithes & Offering Stewards:</span>
                  <div className="font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                    {currentPlan.ushering.offeringTeam.length > 0 ? currentPlan.ushering.offeringTeam.join(', ') : 'Not assigned'}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-stone-500">Sunday Bulletins Ready:</span>
                  <span className={`font-bold ${currentPlan.ushering.bulletinsReady ? 'text-emerald-600' : 'text-stone-400'}`}>
                    {currentPlan.ushering.bulletinsReady ? 'Printed & Staged' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* 6-Item Ushering Preparation Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Ushering Service Checklist
                </div>
                <div className="space-y-1.5">
                  {[
                    { key: 'entranceAreaPrepared', label: '1. Entrance & Foyer Area Prepared' },
                    { key: 'seatingAreaOrganized', label: '2. Sanctuary Seating Organized' },
                    { key: 'welcomeTeamAssigned', label: '3. Welcome & Greeting Team Assigned' },
                    { key: 'guestAssistanceReady', label: '4. Guest Packets & Visitor Cards Ready' },
                    { key: 'serviceMaterialsPrepared', label: '5. Offering Buckets & Materials Ready' },
                    { key: 'finalCoordinationDone', label: '6. Pre-Service Team Prayer & Briefing Done' }
                  ].map(item => {
                    const isChecked = currentPlan.ushering.checklist[item.key as keyof UnifiedServicePlan['ushering']['checklist']];
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleToggleUsheringCheck(item.key as keyof UnifiedServicePlan['ushering']['checklist'])}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer text-left ${
                          isChecked 
                            ? 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-semibold' 
                            : 'bg-stone-50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action Button to Ushering Module */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => onNavigateToMinistry && onNavigateToMinistry('ministry-usher')}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft"
              >
                <span>Open Ushering Duty & Welcome Hub</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. MULTIMEDIA TEAM PANEL                                  */}
        {/* ========================================================= */}
        {(activeTab === 'all' || activeTab === 'multimedia') && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white text-base">
                      Multimedia Team
                    </h3>
                    <div className="text-[11px] text-stone-500">
                      Status: <strong className="text-stone-800 dark:text-stone-200">{currentPlan.multimedia.presentationStatus}</strong>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {multimediaPercent}% Ready
                </span>
              </div>

              {/* Roster & Technical Crew */}
              <div className="space-y-2 text-xs bg-stone-50 dark:bg-stone-800/50 p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Audio / Sound Operator:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{currentPlan.multimedia.soundOperator}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Presentation / Slides:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{currentPlan.multimedia.presentationOperator}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Camera & Switcher:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{currentPlan.multimedia.cameraOperator}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Livestream Operator:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{currentPlan.multimedia.livestreamOperator}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Photographer:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{currentPlan.multimedia.photographer}</span>
                </div>
              </div>

              {/* 6-Item Multimedia Technical Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Technical & Media Checklist
                </div>
                <div className="space-y-1.5">
                  {[
                    { key: 'soundChecked', label: '1. Sound Board & Microphones Checked' },
                    { key: 'projectorScreensReady', label: '2. Projector & TV Screens Calibrated' },
                    { key: 'lyricsVersesSynced', label: '3. Worship Lyrics & Bible Verses Loaded' },
                    { key: 'camerasPositioned', label: '4. Stage Cameras Aligned & Focused' },
                    { key: 'livestreamTested', label: '5. Stream Health & Audio Feed Tested' },
                    { key: 'cablesSecured', label: '6. Stage Cables Taped & Safety Verified' }
                  ].map(item => {
                    const isChecked = currentPlan.multimedia.checklist[item.key as keyof UnifiedServicePlan['multimedia']['checklist']];
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleToggleMultimediaCheck(item.key as keyof UnifiedServicePlan['multimedia']['checklist'])}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer text-left ${
                          isChecked 
                            ? 'bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 font-semibold' 
                            : 'bg-stone-50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action Button to Multimedia Module */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => onNavigateToMinistry && onNavigateToMinistry('ministry-multimedia')}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-soft"
              >
                <span>Open Multimedia Equipment & Slide Hub</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};