import React, { useState } from 'react';
import { 
  Heart, CheckCircle2, Copy, Check, ExternalLink, 
  MapPin, Clock, ShieldCheck, ArrowRight, Sparkles, HelpCircle 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PublicPageHero } from '../components/PublicPageHero';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicFirstTimePageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenRegister: () => void;
}

export const PublicFirstTimePage: React.FC<PublicFirstTimePageProps> = ({
  onNavigate,
  onOpenRegister
}) => {
  const { firstTime } = PUBLIC_CHURCH_DATA;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PUBLIC_CHURCH_DATA.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero */}
      <PublicPageHero
        badge={firstTime.heroTag}
        title="First Time Visiting?"
        subtitle="We cannot wait to welcome you this Sunday into our church family!"
        onNavigateHome={() => onNavigate('home')}
      />

      {/* Warm Handwritten Invitation Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-500/15 via-gold/20 to-transparent border-2 border-gold/40 shadow-xl space-y-5 text-center">
          <div className="w-14 h-14 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-7 h-7 text-gold fill-gold/20" />
          </div>

          <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
            You Belong Here
          </h2>

          <p className="font-serif italic text-base sm:text-xl text-stone-800 dark:text-stone-100 max-w-2xl mx-auto leading-relaxed">
            &ldquo;{firstTime.welcomeQuote}&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto font-sans leading-relaxed">
            {firstTime.intro}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 rounded-2xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <span>Get Directions to Sanctuary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 hover:border-gold text-stone-800 dark:text-stone-100 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-stone-400" />}
              <span>{copied ? 'Address Copied!' : 'Copy Church Address'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* What to Expect (5 Steps) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            Step by Step
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            What Your Sunday Looks Like
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            From the moment you step out of your car until the benediction prayer.
          </p>
        </div>

        <div className="space-y-4">
          {firstTime.steps.map((st, sIdx) => (
            <div
              key={sIdx}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm flex items-start gap-4 sm:gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center font-serif font-black text-lg shrink-0">
                {st.num}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mx-auto">
            <HelpCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            Common Questions
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            First-Time Visitor FAQs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {firstTime.faqs.map((faq, fIdx) => (
            <div
              key={fIdx}
              className="p-6 rounded-3xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700/70 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-gold uppercase tracking-wider">
                  Q: {faq.q}
                </span>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sanctuary Address Card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-stone-900 text-white border border-gold/30 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
                Sanctuary Address
              </span>
              <h3 className="font-serif font-bold text-xl text-white">
                Beholding Jesus Church Sanctuary
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                {PUBLIC_CHURCH_DATA.address}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-gold text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <a
                href={PUBLIC_CHURCH_DATA.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
