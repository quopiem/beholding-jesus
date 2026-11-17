import React from 'react';
import { 
  Heart, BookOpen, Users, ShieldCheck, MapPin, 
  Clock, Sparkles, CheckCircle2, ArrowRight, UserPlus 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PublicPageHero } from '../components/PublicPageHero';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicLifeGroupsPageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const PublicLifeGroupsPage: React.FC<PublicLifeGroupsPageProps> = ({
  onNavigate,
  onOpenRegister,
  onOpenLogin
}) => {
  const { lifeGroups } = PUBLIC_CHURCH_DATA;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-5 h-5 text-rose-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-gold" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'Users': return <Users className="w-5 h-5 text-blue-500" />;
      default: return <Sparkles className="w-5 h-5 text-gold" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero */}
      <PublicPageHero
        badge={lifeGroups.heroTag}
        title="Life Groups & Fellowship"
        subtitle="Where the church gathers in homes and around tables—growing deeper in Christ together."
        onNavigateHome={() => onNavigate('home')}
        scriptureText="And day by day, attending the temple together and breaking bread in their homes, they received their food with glad and generous hearts..."
        scriptureRef="Acts 2:46"
      />

      {/* Intro Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl space-y-5 text-center sm:text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-gold">
            Doing Life Together
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
            {lifeGroups.title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            {lifeGroups.intro}
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-stone-700 dark:text-stone-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Small, Intimate Groups</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Weekly Bible Application</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Personal Prayer & Accountability</span>
            </span>
          </div>
        </div>
      </section>

      {/* 4 Benefits of Life Groups */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            Why Join a Life Group?
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Four Reasons to Connect
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {lifeGroups.benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center">
                {renderIcon(benefit.icon)}
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                {benefit.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Life Group Clusters in Cavite */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            Locations & Clusters
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Active Life Groups in Cavite
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
            Find a group that fits your schedule, age bracket, and location.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {lifeGroups.clusters.map((cluster, cIdx) => (
            <div
              key={cIdx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-full bg-gold/15 text-gold-dark dark:text-gold text-[10px] font-black uppercase tracking-wider">
                  {cluster.target}
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                  {cluster.name}
                </h3>
                <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold shrink-0" />
                    <span>{cluster.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold shrink-0" />
                    <span>{cluster.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
                <button
                  onClick={onOpenRegister}
                  className="w-full py-2.5 rounded-xl bg-gold/15 hover:bg-gold hover:text-slate-950 text-gold-dark dark:text-gold font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Request to Join This Cluster</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-slate-950 text-white border border-gold/40 shadow-xl text-center space-y-4">
          <h3 className="font-serif font-black text-2xl sm:text-3xl text-white">
            Don&apos;t Walk Alone in Your Faith
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            God created us for community, encouragement, and iron-sharpening-iron discipleship. Connect with a BJC Life Group today.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onOpenRegister}
              className="px-6 py-3.5 rounded-2xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer shadow-md hover:scale-[1.02]"
            >
              <span>Join Church Family to Connect</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              <span>Inquire About Locations</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
