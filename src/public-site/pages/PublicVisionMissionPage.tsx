import React from 'react';
import { 
  Sparkles, Compass, Target, ShieldCheck, Heart, 
  BookOpen, Users, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PublicPageHero } from '../components/PublicPageHero';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicVisionMissionPageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenRegister: () => void;
}

export const PublicVisionMissionPage: React.FC<PublicVisionMissionPageProps> = ({
  onNavigate,
  onOpenRegister
}) => {
  const { visionMission, motto } = PUBLIC_CHURCH_DATA;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero */}
      <PublicPageHero
        badge="Divine Purpose & Direction"
        title="Vision, Mission & Core Values"
        subtitle="Anchored in the supremacy of Jesus Christ and dedicated to making Christ-like disciples."
        onNavigateHome={() => onNavigate('home')}
        scriptureText="Where there is no vision, the people perish: but he that keepeth the law, happy is he."
        scriptureRef="Proverbs 29:18"
      />

      {/* Vision & Mission Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Motto Callout Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-gold/20 to-amber-500/10 border-2 border-gold/40 text-center space-y-2 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-widest text-gold-dark dark:text-gold">
            Our Overarching Mandate
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase tracking-tight">
            {motto}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
            Matthew 22:37-39 • Matthew 28:19-20
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Vision Box */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold">
                Where We Are Heading
              </span>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                Our Vision
              </h3>
              <p className="font-serif italic text-base sm:text-lg text-stone-800 dark:text-stone-100 leading-relaxed border-l-2 border-gold pl-4">
                &ldquo;{visionMission.vision.statement}&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                {visionMission.vision.expansion}
              </p>
            </div>
            <div className="pt-4 border-t border-stone-100 dark:border-slate-800 text-[11px] font-bold text-gold">
              Proverbs 29:18 • Habakkuk 2:2
            </div>
          </div>

          {/* Mission Box */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                What We Do Daily
              </span>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                Our Mission
              </h3>
              <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-relaxed">
                {visionMission.mission.statement}
              </p>
              <div className="space-y-2.5 pt-2">
                {visionMission.mission.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-600 dark:text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 dark:border-slate-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Matthew 28:19-20 • Colossians 1:28
            </div>
          </div>

        </div>

      </section>

      {/* Core Values Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            Kingdom Convictions
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Our Core Values
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
            These biblical values shape our culture, our worship, our decisions, and our relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visionMission.values.map((val, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold text-gold uppercase tracking-wider">
                  Value 0{idx + 1}
                </span>
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  {val.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  {val.desc}
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800 text-[10px] font-bold text-stone-400">
                {val.ref}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-stone-900 text-white text-center space-y-4 border border-gold/30 shadow-xl">
          <h3 className="font-serif font-bold text-xl sm:text-2xl">
            Be Part of Fulfilling This God-Given Vision
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto">
            God has given every believer gifts and a spiritual assignment. Step into your calling and join our church family in Cavite.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenRegister}
              className="px-6 py-3 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md hover:scale-[1.02]"
            >
              <span>Join Church Family (Register)</span>
            </button>
            <button
              onClick={() => onNavigate('ministries')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
            >
              <span>Discover Church Ministries</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
