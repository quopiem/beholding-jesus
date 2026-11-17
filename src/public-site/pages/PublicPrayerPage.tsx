import React, { useState } from 'react';
import { 
  Heart, Sparkles, Clock, MapPin, CheckCircle2, 
  Send, ShieldCheck, Quote, ArrowRight, UserPlus 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PublicPageHero } from '../components/PublicPageHero';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicPrayerPageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const PublicPrayerPage: React.FC<PublicPrayerPageProps> = ({
  onNavigate,
  onOpenRegister,
  onOpenLogin
}) => {
  const { prayerMinistry } = PUBLIC_CHURCH_DATA;

  const [prayerName, setPrayerName] = useState('');
  const [prayerContact, setPrayerContact] = useState('');
  const [prayerCategory, setPrayerCategory] = useState('Healing');
  const [prayerText, setPrayerText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;
    setIsSubmitted(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero */}
      <PublicPageHero
        badge={prayerMinistry.heroTag}
        title="Prayer & Intercession"
        subtitle="Standing in the gap for families, the afflicted, our church, and our nation."
        onNavigateHome={() => onNavigate('home')}
        scriptureText="The effective, fervent prayer of a righteous man avails much."
        scriptureRef="James 5:16"
      />

      {/* Intro Box */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl space-y-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <span>The Power of Kneeling</span>
          </div>

          <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
            {prayerMinistry.title}
          </h2>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            {prayerMinistry.intro} We believe in a living God who hears the cries of His children. Whether you are facing physical illness, emotional despair, family hardship, or seeking God&apos;s direction, you do not have to carry the burden alone.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-100 dark:border-slate-800">
            {prayerMinistry.scriptures.map((sc, i) => (
              <div key={i} className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-850 border border-stone-200/70 dark:border-slate-800 space-y-1.5 text-left">
                <span className="text-[11px] font-bold text-gold uppercase tracking-wider">
                  {sc.ref}
                </span>
                <p className="font-serif italic text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  &ldquo;{sc.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Key Prayer Gatherings */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            Join the Altar
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Our Prayer Gatherings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prayerMinistry.gatherings.map((g, gIdx) => (
            <div
              key={gIdx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between hover:border-gold/40 transition"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  {g.title}
                </h3>
                <div className="space-y-1 text-xs text-stone-500 dark:text-stone-400 font-medium">
                  <div className="flex items-center gap-1.5 text-gold font-bold">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{g.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{g.location}</span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans pt-1">
                  {g.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-slate-800 text-[11px] font-bold text-rose-500">
                All Are Welcome to Pray
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Prayer Request Form */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-slate-950 text-white border border-gold/40 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold">
              Confidential Intercession
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-3xl text-white">
              Send Your Prayer Request
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
              Our pastoral staff and intercessors hold your requests in strict confidence and faith.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-serif font-bold text-lg text-white">
                Your Request Has Been Received
              </h4>
              <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out, {prayerName || 'beloved'}. Our intercessory prayer team will bring your petition before the Lord in our prayer watch. May the peace of Christ guard your heart!
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setPrayerText('');
                }}
                className="mt-2 text-xs font-bold text-gold underline cursor-pointer"
              >
                Send Another Prayer Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={prayerName}
                    onChange={(e) => setPrayerName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-hidden focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={prayerCategory}
                    onChange={(e) => setPrayerCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-white/20 text-white text-xs focus:outline-hidden focus:border-gold"
                  >
                    <option value="Healing">Physical Healing & Recovery</option>
                    <option value="Family">Family & Marriage Breakthrough</option>
                    <option value="Financial">Financial & Job Provision</option>
                    <option value="Spiritual">Spiritual Growth & Guidance</option>
                    <option value="Salvation">Salvation of Loved Ones</option>
                    <option value="Thanksgiving">Answered Prayer & Praise</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                  Contact Number or Email (Optional, if you wish for follow-up)
                </label>
                <input
                  type="text"
                  value={prayerContact}
                  onChange={(e) => setPrayerContact(e.target.value)}
                  placeholder="e.g. 0917-xxx-xxxx or email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-hidden focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                  How Can We Pray for You? <span className="text-gold">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  placeholder="Share your burden or praise report with our intercessors..."
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-hidden focus:border-gold leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Prayer Request to Intercessors</span>
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-stone-400">
            For urgent hospital visitations or pastoral emergencies, you may also reach out via{' '}
            <button 
              onClick={() => onNavigate('contact')} 
              className="text-gold font-bold underline cursor-pointer"
            >
              Contact & Sanctuary Location
            </button>.
          </div>
        </div>
      </section>

    </div>
  );
};
