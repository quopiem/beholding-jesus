import React, { useState } from 'react';
import { 
  Users, Sparkles, MapPin, Clock, CheckCircle2, ChevronRight, 
  Send, FileText, ArrowRight, X, ShieldAlert 
} from 'lucide-react';
import { ChurchDataStore } from '../../services/churchDataStore';
import { Ministry, MinistryJoinRequest, UserProfile } from '../../types';

export const MinistriesView: React.FC = () => {
  const [ministries, setMinistries] = useState<Ministry[]>(ChurchDataStore.getMinistries());
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(ministries[0] || null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [experienceText, setExperienceText] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  
  const currentUser: UserProfile = ChurchDataStore.getCurrentUser();
  const joinRequests = ChurchDataStore.getJoinRequests();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinistry) return;
    ChurchDataStore.submitJoinRequest(selectedMinistry.id, experienceText);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsJoinModalOpen(false);
      setExperienceText('');
    }, 1500);
  };

  const isMember = selectedMinistry?.memberIds?.includes(currentUser.id);
  const pendingRequest = joinRequests.find(r => r.ministryId === selectedMinistry?.id && r.userId === currentUser.id && r.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-primary text-white border border-slate-800 p-6 sm:p-8 shadow-elevated relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-gold" />
            <span>Serve with Purpose</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Church Ministry Teams & Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Discover opportunities to exercise your spiritual gifts, build discipleship bonds, and advance the Kingdom of God in Beholding Jesus Church.
          </p>
        </div>
      </div>

      {/* Grid: Ministries Cards (3-Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {ministries.map(m => {
          const isSelected = selectedMinistry?.id === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedMinistry(m)}
              className={`rounded-2xl p-5 border cursor-pointer transition flex flex-col justify-between h-56 ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-soft ring-2 ring-gold/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-gold/50 shadow-card'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isSelected ? 'bg-gold/20 text-gold-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {m.category || 'Ministry'}
                  </span>
                  <span className="text-[11px] opacity-75">{m.membersCount || 10} members</span>
                </div>

                <h3 className="font-bold text-base leading-snug">
                  {m.name}
                </h3>

                <p className={`text-xs line-clamp-3 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {m.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-medium truncate opacity-80">
                  Lead: {m.leaderName || 'Pastoral Team'}
                </span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Ministry Details Canvas */}
      {selectedMinistry && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-card space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-gold">
                Department Overview
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                {selectedMinistry.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedMinistry.description}
              </p>
            </div>

            {/* Join / Status Action */}
            <div className="shrink-0">
              {isMember ? (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Assigned Ministry Member</span>
                </div>
              ) : pendingRequest ? (
                <div className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-bold text-xs flex items-center gap-2 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-4 h-4" />
                  <span>Join Request Pending Leader Review</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-slate-800 font-bold text-xs shadow-soft transition"
                >
                  Request to Join Ministry
                </button>
              )}
            </div>
          </div>

          {/* Details Row: Meeting & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Regular Meeting</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold" />
                <span>{selectedMinistry.meetingTime || selectedMinistry.meetingSchedule || 'Weekly Service Meetings'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Location / Venue</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span>{selectedMinistry.location || 'Church Main Campus'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Leadership Oversight</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gold" />
                <span>{selectedMinistry.leaderName || 'Mica Ramos'} ({selectedMinistry.leaderTitle || 'Ministry Lead'})</span>
              </div>
            </div>
          </div>

          {/* Activities List */}
          {selectedMinistry.activities && (
            <div className="space-y-3 pt-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Core Activities & Responsibilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedMinistry.activities.map((act, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Join Ministry Modal */}
      {isJoinModalOpen && selectedMinistry && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Join {selectedMinistry.name}
              </h3>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm">Request Submitted!</h4>
                <p className="text-xs text-slate-500">
                  Your request has been forwarded to the ministry leader and pastor.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Please share any relevant experience, instruments played, or your heart for serving in this area.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Your Experience & Ministry Heart
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. I have served on praise and worship teams for 2 years as alto / acoustic..."
                    value={experienceText}
                    onChange={(e) => setExperienceText(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Submit Request
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
