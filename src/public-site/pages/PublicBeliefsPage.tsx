import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle2, ChevronDown, ChevronUp, 
  Sparkles, Heart, ShieldCheck, ArrowRight 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PublicPageHero } from '../components/PublicPageHero';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicBeliefsPageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenLogin: () => void;
}

export const PublicBeliefsPage: React.FC<PublicBeliefsPageProps> = ({
  onNavigate,
  onOpenLogin
}) => {
  const { beliefs } = PUBLIC_CHURCH_DATA;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleArticle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero */}
      <PublicPageHero
        badge="Biblical Statement of Faith"
        title="What We Believe"
        subtitle="Unapologetically anchored in the inerrant Word of God and the gospel of Jesus Christ."
        onNavigateHome={() => onNavigate('home')}
        scriptureText="For I delivered unto you first of all that which I also received, how that Christ died for our sins according to the scriptures..."
        scriptureRef="1 Corinthians 15:3"
      />

      {/* Introduction */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-md space-y-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-gold">
            <BookOpen className="w-4 h-4 text-gold shrink-0" />
            <span>Sound Biblical Doctrine</span>
          </div>
          <h2 className="font-serif font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
            Historical, Evangelical & Reformation Truths
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            At Beholding Jesus Church, our theology is not based on human traditions, cultural trends, or legalistic demands. We stand firmly upon the timeless truths of Holy Scripture: <em>Sola Scriptura</em> (Scripture Alone), <em>Solus Christus</em> (Christ Alone), <em>Sola Gratia</em> (Grace Alone), <em>Sola Fide</em> (Faith Alone), and <em>Soli Deo Gloria</em> (To God Alone Be The Glory).
          </p>
        </div>
      </section>

      {/* 8 Articles of Faith */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        {beliefs.map((article, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-3xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-white dark:bg-slate-900 border-gold/50 shadow-lg'
                  : 'bg-white dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 shadow-sm hover:border-gold/30'
              }`}
            >
              <button
                onClick={() => toggleArticle(idx)}
                className="w-full p-6 text-left flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gold/15 text-gold-dark dark:text-gold">
                      Article 0{idx + 1}
                    </span>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      {article.topic}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">
                    {article.summary}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-500 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-stone-100 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                    {article.detail}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                      Scriptural Foundations:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {article.references.map((ref, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 text-xs font-semibold border border-stone-200/80 dark:border-slate-700"
                        >
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* The Gospel Message / How to be Saved */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-slate-950 text-white border border-gold/40 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-widest border border-gold/30">
            <span>The Heart of the Good News</span>
          </div>

          <h2 className="font-serif font-black text-2xl sm:text-3xl text-white">
            How Can I Be Saved?
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
            <p>
              The Bible teaches that all have sinned and fall short of the glory of God (Romans 3:23). Because of sin, we were spiritually dead and unable to save ourselves.
            </p>
            <p>
              <strong>God demonstrated His love toward us in that while we were still sinners, Christ died for us (Romans 5:8).</strong> On the cross, Jesus bore our sins, took our judgment, and cried, &ldquo;It is finished!&rdquo; He rose again in triumph on the third day and offers eternal life freely to all who believe.
            </p>
            <p>
              If you confess with your mouth that Jesus is Lord and believe in your heart that God raised Him from the dead, you will be saved (Romans 10:9).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs italic text-stone-200 font-serif leading-relaxed">
            &ldquo;Lord Jesus, I acknowledge that I am a sinner in need of Your grace. I believe You died on the cross for my sins and rose again from the grave. Today, I turn away from sin and surrender my life to You. Wash me clean by Your blood and fill me with Your Holy Spirit. Thank You for saving me. In Jesus&apos; Name, Amen.&rdquo;
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <span>Talk to a Pastor or Prayer Leader</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('first-time')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Visit Us This Sunday</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
