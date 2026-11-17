import React from 'react';
import { 
  Heart, BookOpen, Music, Users, ArrowRight, ShieldCheck, 
  Sparkles, Quote, MapPin, CheckCircle2 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PublicPageHero } from '../components/PublicPageHero';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicAboutPageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PublicAboutPage: React.FC<PublicAboutPageProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenRegister
}) => {
  const { about, seniorPastor } = PUBLIC_CHURCH_DATA;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero */}
      <PublicPageHero
        badge={about.heroTag}
        title="About Beholding Jesus Church"
        subtitle="A Christ-exalting, grace-filled spiritual family in Bacoor City, Cavite."
        onNavigateHome={() => onNavigate('home')}
        scriptureText="And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image..."
        scriptureRef="2 Corinthians 3:18"
      />

      {/* Main Story & Introduction */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-gold shrink-0" />
            <span>Our Founding Heart</span>
          </div>

          <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
            {about.title}
          </h2>

          <div className="space-y-4 text-stone-600 dark:text-stone-300 font-sans leading-relaxed text-sm sm:text-base">
            <p className="font-semibold text-stone-800 dark:text-stone-100 text-base sm:text-lg">
              {about.intro}
            </p>
            {about.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs font-bold text-gold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Gospel of Grace</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Expository Scripture</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Covenant Family</span>
            </span>
          </div>
        </div>

      </section>

      {/* Senior Pastor Profile */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-slate-950 text-white border border-gold/40 shadow-2xl space-y-8">
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border-2 border-gold/70 overflow-hidden shadow-2xl bg-gold/10 shrink-0 p-1">
              <img 
                src={seniorPastor.avatar} 
                alt={seniorPastor.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icons/church-seal-gold.png';
                }}
              />
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-widest border border-gold/30">
                <span>Pastoral Leadership</span>
              </div>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-white">
                {seniorPastor.name}
              </h3>
              <p className="text-xs sm:text-sm text-gold font-bold uppercase tracking-wider">
                {seniorPastor.title} • Beholding Jesus Church
              </p>
              <div className="relative pl-4 border-l-2 border-gold/50 text-left">
                <p className="font-serif italic text-stone-200 text-sm sm:text-base leading-relaxed">
                  &ldquo;{seniorPastor.quote}&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-stone-300 leading-relaxed space-y-2">
            <p>
              Pastor John Eric has shepherded Beholding Jesus Church with a heart of fatherly love, unwavering conviction in the inerrancy of Scripture, and an infectious passion to see lives transformed by the grace of Christ.
            </p>
            <p>
              Under his pastoral leadership, BJC has grown into a multigenerational church family with thriving youth, vibrant life groups across Bacoor and Cavite, and faithful outreach to families.
            </p>
          </div>

        </div>
      </section>

      {/* 4 Pillars of BJC */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            Our Foundation
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            The Pillars of Our Church Life
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {about.pillars.map((pillar, i) => (
            <div 
              key={i}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-md space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                {pillar.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Buttons to Beliefs & Ministries */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 rounded-3xl bg-stone-100 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 text-center space-y-4">
          <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
            Want to learn more about what we believe and how we serve?
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('vision-mission')}
              className="px-5 py-2.5 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Explore Vision & Mission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('beliefs')}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Read Statement of Faith</span>
              <BookOpen className="w-3.5 h-3.5 text-gold" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
