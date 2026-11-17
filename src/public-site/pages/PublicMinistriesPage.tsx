import React from 'react';
import { 
  Music, Users, Heart, BookOpen, Camera, ShieldCheck, 
  Sparkles, CheckCircle2, ArrowRight, UserPlus 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PublicPageHero } from '../components/PublicPageHero';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicMinistriesPageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const PublicMinistriesPage: React.FC<PublicMinistriesPageProps> = ({
  onNavigate,
  onOpenRegister,
  onOpenLogin
}) => {
  const { ministries } = PUBLIC_CHURCH_DATA;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Music': return <Music className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero */}
      <PublicPageHero
        badge="Our Calling & Service"
        title="Church Ministry Teams"
        subtitle="Serving God and people through different spiritual gifts according to the grace He has given us."
        onNavigateHome={() => onNavigate('home')}
        scriptureText="As each has received a gift, use it to serve one another, as good stewards of God’s varied grace."
        scriptureRef="1 Peter 4:10"
      />

      {/* Intro Box */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-md space-y-3 text-center sm:text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-gold">
            Every Member a Minister
          </div>
          <h2 className="font-serif font-black text-xl sm:text-3xl text-slate-900 dark:text-white">
            Where Can You Serve?
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            At Beholding Jesus Church, ministry is not reserved for a select few on stage. Every believer is called to be a living stone in God’s house. Whether your gift is musical, administrative, technical, hospitable, or pastoral, there is a meaningful place for you to grow and serve.
          </p>
        </div>
      </section>

      {/* 6 Ministry Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((min) => (
            <div
              key={min.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-gold/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center group-hover:scale-105 transition-transform">
                  {renderIcon(min.icon)}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                    {min.title}
                  </h3>
                  <p className="text-[11px] font-bold text-gold uppercase tracking-wider mt-0.5">
                    {min.tagline}
                  </p>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  {min.desc}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Key Serving Roles:
                  </span>
                  {min.responsibilities.map((resp, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-200 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
                <button
                  onClick={onOpenRegister}
                  className="w-full py-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-gold hover:text-slate-950 font-bold text-xs text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Apply to Serve in {min.title.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Serving Guidelines & Requirements */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-gold">
              Spiritual Posture
            </span>
            <h3 className="font-serif font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
              Serving with Joy & Excellence
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              We uphold high biblical standards of character, humility, and faithfulness for all who serve.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-700 dark:text-stone-300">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-gold block">1. Surrendered Heart</span>
              <p>Committed personal walk with Christ, regular prayer, and living in obedience to God’s Word.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-gold block">2. Regular Fellowship</span>
              <p>Faithful Sunday attendance and active involvement in a local Life Group fellowship.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-gold block">3. Teachable Spirit</span>
              <p>Willingness to receive mentorship, practice with the team, and honor church leadership in unity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-slate-900 border border-gold/30 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Step Up & Serve</span>
            </span>
            <h3 className="font-serif font-black text-xl sm:text-3xl text-white">
              Have the heart to serve and join ministry?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
              Register as a church member or log in to submit your ministry request directly to our pastoral team.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={onOpenRegister}
              className="px-6 py-3 rounded-2xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up to Serve</span>
            </button>
            <button
              onClick={onOpenLogin}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Member Sign In</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
