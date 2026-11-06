import React, { useState } from 'react';
import { 
  Music, Mic, CheckCircle2, Circle, Clock, Calendar, 
  ExternalLink, Sparkles, ChevronRight, User, ListMusic,
  Sliders, ShieldCheck, Play, ArrowRight
} from 'lucide-react';
import { 
  MinistryStore, UnifiedServicePlan 
} from '../../services/ministryStore';
import { ChurchDataStore } from '../../services/churchDataStore';
import { UserProfile } from '../../types';

interface WorshipTeamWorkspaceProps {
  currentUser?: UserProfile | null;
  onOpenFullWorshipHub: () => void;
}

export const WorshipTeamWorkspace: React.FC<WorshipTeamWorkspaceProps> = ({
  currentUser,
  onOpenFullWorshipHub
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-08');
  const [currentPlan, setCurrentPlan] = useState<UnifiedServicePlan>(() => 
    MinistryStore.getServicePlanByDate('2026-11-08')
  );
  const songs = ChurchDataStore.getSongs();
  const singers = ChurchDataStore.getSingers();

  const handleToggleCheck = (key: keyof UnifiedServicePlan['worship']['checklist']) => {
    const updated = {
      ...currentPlan.worship.checklist,
      [key]: !currentPlan.worship.checklist[key]
    };
    MinistryStore.updateWorshipPrep(selectedDate, { checklist: updated });
    setCurrentPlan(MinistryStore.getServicePlanByDate(selectedDate));
  };

  const checklistItems: { key: keyof UnifiedServicePlan['worship']['checklist']; label: string; desc: string }[] = [
    { key: 'songsSelected', label: '1. Songs Selected for Corporate Worship', desc: 'Curated 3-4 songs aligned with the Sunday sermon theme.' },
    { key: 'keysConfirmed', label: '2. Song & Vocal Keys Confirmed', desc: 'Matched songs to lead vocalist key and verified band chords.' },
    { key: 'worshipLeaderAssigned', label: '3. Worship Leader Assigned', desc: 'Designated lead singer for invocational and praise sets.' },
    { key: 'vocalistsAssigned', label: '4. Vocalists & Backing Assigned', desc: 'Confirmed soprano, alto, and tenor vocal section.' },
    { key: 'instrumentalistsAssigned', label: '5. Instrumentalists / Band Ready', desc: 'Acoustic, electric guitar, keys, bass, and drums confirmed.' },
    { key: 'harmoniesPrepared', label: '6. Harmonies & Dynamics Arranged', desc: 'Vocal blending, transitions, and prayer cues reviewed.' },
    { key: 'rehearsalScheduled', label: '7. Saturday Rehearsal Held', desc: 'Sound check and set rehearsal completed at 3:00 PM.' },
    { key: 'finalSetlistApproved', label: '8. Final Setlist Approved', desc: 'Setlist signed off by Pastoral & Music Director.' }
  ];

  const completedCount = Object.values(currentPlan.worship.checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#2A1E14] via-[#1E1610] to-[#140F0A] text-white p-6 sm:p-8 border border-amber-900/40 shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Music className="w-3.5 h-3.5 text-gold" />
              <span>Praise & Music Ministry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Worship Team Operations
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Leading the congregation in beholding the matchless beauty of Jesus Christ. Manage service setlists, vocal key charts, band rosters, and rehearsal readiness.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
            <button
              onClick={onOpenFullWorshipHub}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#C5A46D] to-[#B59157] hover:from-[#d8b883] hover:to-[#c5a46d] text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-900/30 transition transform active:scale-95"
            >
              <Music className="w-4 h-4" />
              <span>Open Song & Vocal Key Manager</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-stone-400">
              Access 50+ songs, vocal transpositions & audio tones
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Preparation Checklist + Live Sunday Setlist Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 8-Item Sunday Preparation Checklist */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Sunday Worship Preparation Checklist
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Service Date: <strong>{selectedDate}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{progressPercent}% Ready</span>
              <div className="text-[10px] text-stone-400">{completedCount} of 8 Items</div>
            </div>
          </div>

          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {checklistItems.map(item => {
              const isChecked = currentPlan.worship.checklist[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleCheck(item.key)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 select-none ${
                    isChecked
                      ? 'bg-amber-500/10 border-amber-500/30 text-stone-900 dark:text-white shadow-soft'
                      : 'bg-stone-50 dark:bg-stone-800/40 border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100/80'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600" />
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className={`text-xs font-bold leading-tight ${isChecked ? 'text-amber-900 dark:text-amber-200' : 'text-stone-800 dark:text-stone-200'}`}>
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Directory: Song Library & Vocal Key Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-white text-sm flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-amber-600" />
                Live Sunday Setlist
              </h3>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                {currentPlan.worship.songsSummary.length} Songs
              </span>
            </div>

            <div className="space-y-2.5">
              {currentPlan.worship.songsSummary.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {item}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenFullWorshipHub}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>Manage Setlists & Pitch Keys</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Vocalists in Ministry */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-white text-sm flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-600" />
                Vocalist Roster
              </h3>
              <span className="text-[11px] text-stone-400">{singers.length} Registered</span>
            </div>

            <div className="space-y-2">
              {singers.slice(0, 4).map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gold/20 text-gold-700 dark:text-gold-300 font-bold flex items-center justify-center text-[10px]">
                      {s.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{s.name}</span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">{s.vocalRange || s.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};