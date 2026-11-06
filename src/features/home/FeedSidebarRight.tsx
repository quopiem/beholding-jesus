import React from 'react';
import { 
  Calendar, Clock, MapPin, BookOpen, Heart, ArrowRight, 
  Sparkles, ExternalLink, PhoneCall, ChevronRight
} from 'lucide-react';
import { ChurchDataStore } from '../../services/churchDataStore';
import { CHURCH_INFO } from '../../services/churchInfo';

interface FeedSidebarRightProps {
  onNavigate: (tab: string) => void;
  onOpenBanner?: (imageUrl: string) => void;
}

export const FeedSidebarRight: React.FC<FeedSidebarRightProps> = ({
  onNavigate,
  onOpenBanner
}) => {
  const events = ChurchDataStore.getEvents().slice(0, 3);

  return (
    <aside className="space-y-4 sticky top-20">
      
      {/* 1. Weekly Gathering Times & Church Sanctuary */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-4 sm:p-5 shadow-card space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                Gathering Times
              </h3>
              <p className="text-[10px] text-gold font-medium">Beholding Jesus Church</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="text-[11px] font-semibold text-stone-500 hover:text-gold transition cursor-pointer flex items-center gap-0.5"
          >
            <span>All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-100 dark:border-slate-700/60">
            <div className="font-bold text-stone-900 dark:text-white flex items-center justify-between">
              <span>Sunday Worship Service</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gold/20 text-gold-dark dark:text-gold font-mono font-bold">Main</span>
            </div>
            <div className="text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3 h-3 text-gold" />
              <span>Sundays • 9:00 AM – 11:30 AM</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-100 dark:border-slate-700/60">
            <div className="font-bold text-stone-900 dark:text-white flex items-center justify-between">
              <span>NextGen Youth Fellowship</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono font-bold">Youth</span>
            </div>
            <div className="text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3 h-3 text-gold" />
              <span>Saturdays • 4:00 PM – 6:30 PM</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-100 dark:border-slate-700/60">
            <div className="font-bold text-stone-900 dark:text-white flex items-center justify-between">
              <span>Midweek Prayer & Study</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono font-bold">Prayer</span>
            </div>
            <div className="text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3 h-3 text-gold" />
              <span>Wednesdays • 7:00 PM</span>
            </div>
          </div>
        </div>

        {/* Location & Map Link */}
        <div className="pt-2 border-t border-stone-100 dark:border-slate-800">
          <div className="flex items-start gap-2 text-[11px] text-stone-600 dark:text-stone-300">
            <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
            <span className="leading-tight">
              2nd Flr. MV Villar Ave. Ph2 Central Camella Springville Molino 3, Bacoor, Cavite
            </span>
          </div>
          <a
            href="https://maps.google.com/?q=Beholding+Jesus+Church+Camella+Springville+Molino+3+Bacoor+Cavite"
            target="_blank"
            rel="noreferrer"
            className="mt-2 text-[11px] font-bold text-gold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 2. Verse of the Day Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1C1616] via-[#2A1F1F] to-[#120F0F] text-white p-4 sm:p-5 border border-gold/30 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gold" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
              Daily Scripture
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">Today</span>
        </div>

        <p className="font-serif italic text-sm text-stone-200 leading-relaxed">
          &ldquo;And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image from one degree of glory to another.&rdquo;
        </p>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
          <span className="font-bold text-gold">2 Corinthians 3:18</span>
          <button
            onClick={() => onNavigate('bible')}
            className="text-[11px] text-stone-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Read Chapter</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. Upcoming Church Events */}
      {events.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white">
              Upcoming Events
            </h4>
            <button
              onClick={() => onNavigate('events')}
              className="text-[11px] font-semibold text-gold hover:underline cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="space-y-2.5">
            {events.map(ev => (
              <div 
                key={ev.id}
                onClick={() => onNavigate('events')}
                className="p-2.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-slate-800/60 transition cursor-pointer flex items-center gap-3 border border-transparent hover:border-stone-200 dark:hover:border-slate-700"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex flex-col items-center justify-center shrink-0 leading-none">
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {ev.date ? new Date(ev.date).toLocaleDateString(undefined, { month: 'short' }) : 'NOV'}
                  </span>
                  <span className="text-sm font-black mt-0.5">
                    {ev.date ? new Date(ev.date).getDate() : '17'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-stone-900 dark:text-white truncate">
                    {ev.title}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                    {ev.time} • {ev.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Pastoral Care & Prayer Request Prompt */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-4 shadow-card space-y-2">
        <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
          <Heart className="w-4 h-4 fill-current" />
          <span>Need Prayer or Counseling?</span>
        </div>
        <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
          Our pastoral team and intercessors are standing by to pray with you and your family.
        </p>
        <button
          onClick={() => onNavigate('prayer')}
          className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition cursor-pointer"
        >
          Submit a Prayer Request
        </button>
      </div>

    </aside>
  );
};
