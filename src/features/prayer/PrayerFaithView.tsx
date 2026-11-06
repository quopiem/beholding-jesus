import React, { useState, useEffect } from 'react';
import { 
  Heart, Sparkles, CheckCircle2, Lock, Globe, Users, 
  Plus, Search, MessageSquare, Share2, X, PartyPopper 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChurchDataStore } from '../../services/churchDataStore';
import { PrayerRequest, PrayerVisibility, UserProfile } from '../../types';

export const PrayerFaithView: React.FC = () => {
  const [prayers, setPrayers] = useState<PrayerRequest[]>(ChurchDataStore.getPrayerRequests());
  const [activeTab, setActiveTab] = useState<'requests' | 'answered'>('requests');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [activePrayerForAnswer, setActivePrayerForAnswer] = useState<PrayerRequest | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Healing & Health');
  const [visibility, setVisibility] = useState<PrayerVisibility>('public');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [testimonyText, setTestimonyText] = useState('');

  const currentUser: UserProfile = ChurchDataStore.getCurrentUser();

  // Cloud Sync with Supabase (Cross-device PC & Mobile)
  useEffect(() => {
    let isMounted = true;
    const loadPrayers = async () => {
      const cloudPrayers = await ChurchDataStore.fetchPrayerRequestsFromCloud();
      if (isMounted && cloudPrayers) {
        setPrayers(cloudPrayers);
      }
    };
    loadPrayers();
    const interval = setInterval(loadPrayers, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleTogglePraying = (prayerId: string) => {
    ChurchDataStore.togglePraying(prayerId);
    setPrayers(ChurchDataStore.getPrayerRequests());
  };

  const handleSubmitPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    ChurchDataStore.submitPrayerRequest({
      title,
      description,
      category,
      visibility,
      isAnonymous
    });

    setPrayers(ChurchDataStore.getPrayerRequests());
    setIsSubmitModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleMarkAnswered = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePrayerForAnswer || !testimonyText.trim()) return;

    ChurchDataStore.markPrayerAnswered(activePrayerForAnswer.id, testimonyText.trim());
    setPrayers(ChurchDataStore.getPrayerRequests());

    // Trigger celebratory praise confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsAnswerModalOpen(false);
    setTestimonyText('');
    setActivePrayerForAnswer(null);
  };

  const filteredPrayers = prayers.filter(p => {
    if (activeTab === 'answered') return p.isAnswered;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-primary text-white border border-slate-800 p-6 sm:p-8 shadow-elevated relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Intercession & Testimonies</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Prayer Chain & Praise Testimonies
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              “Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.” — James 5:16
            </p>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs sm:text-sm shadow-gold hover:bg-gold-dark hover:text-white transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Prayer Request</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'requests' ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Active Prayer Chain ({prayers.length})
          </button>
          <button
            onClick={() => setActiveTab('answered')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'answered' ? 'bg-primary text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Answered Prayers ({prayers.filter(p => p.isAnswered).length})</span>
          </button>
        </div>
      </div>

      {/* Prayers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrayers.map(p => {
          const hasPrayed = p.prayingUserIds?.includes(currentUser.id);
          const isMyRequest = p.userId === currentUser.id;

          return (
            <div
              key={p.id}
              className={`rounded-3xl border p-6 shadow-card space-y-4 flex flex-col justify-between transition ${
                p.isAnswered 
                  ? 'bg-emerald-50/40 dark:bg-slate-900/90 border-emerald-300 dark:border-emerald-800' 
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-sage-50 text-sage-700 dark:bg-slate-800 dark:text-sage-300">
                      {p.category}
                    </span>
                    {p.visibility === 'private' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    )}
                  </div>

                  {p.isAnswered ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Answered by God
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white leading-snug">
                  {p.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {p.description}
                </p>

                {/* Answered Praise Testimony Banner */}
                {p.isAnswered && p.testimonyText && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-900/60 text-xs text-slate-700 dark:text-slate-200 space-y-1">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Praise Report & Answered Testimony</span>
                    </div>
                    <p className="italic leading-relaxed">“{p.testimonyText}”</p>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-1">
                  Submitted by {p.isAnonymous ? 'Church Brethren (Anonymous)' : p.authorName}
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleTogglePraying(p.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                    hasPrayed 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasPrayed ? 'fill-rose-500' : ''}`} />
                  <span>{hasPrayed ? 'I Prayed for This' : 'Pray for This'} ({p.prayingCount || 0})</span>
                </button>

                {!p.isAnswered && isMyRequest && (
                  <button
                    onClick={() => {
                      setActivePrayerForAnswer(p);
                      setIsAnswerModalOpen(true);
                    }}
                    className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Answered</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Prayer Request Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Submit Prayer Request
              </h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPrayer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Prayer Need Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete healing and strength for father"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none font-semibold"
                  >
                    <option value="Healing & Health">Healing & Health</option>
                    <option value="Spiritual Growth">Spiritual Growth</option>
                    <option value="Family & Marriage">Family & Marriage</option>
                    <option value="Guidance & Direction">Guidance & Direction</option>
                    <option value="Youth & Campus">Youth & Campus</option>
                    <option value="Financial & Work">Financial & Work</option>
                    <option value="Outreach & Missions">Outreach & Missions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Privacy Option *
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as PrayerVisibility)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none font-semibold"
                  >
                    <option value="public">Church Community (Shared)</option>
                    <option value="ministry">Selected Ministry Only</option>
                    <option value="private">Only Me / Pastoral Oversight</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Prayer Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Share details so our church family can pray specifically and with biblical alignment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-gold focus:ring-gold"
                />
                <label htmlFor="anonCheck" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  Submit anonymously (author name will not be shown)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Post Prayer Need
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Answered Modal */}
      {isAnswerModalOpen && activePrayerForAnswer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-emerald-500" />
                <span>Mark Prayer as Answered</span>
              </h3>
              <button onClick={() => setIsAnswerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkAnswered} className="space-y-3">
              <p className="text-xs text-slate-500">
                Praise the Lord! Share how God answered this prayer request so the church can rejoice together.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Testimony / Praise Report *
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. God miraculously guided the physicians and the recovery was swift! Thank you church family for your prayers..."
                  value={testimonyText}
                  onChange={(e) => setTestimonyText(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAnswerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  Publish Praise Testimony
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
