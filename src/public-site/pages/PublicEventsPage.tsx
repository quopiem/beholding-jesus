import React from 'react';
import { 
  Calendar, Clock, MapPin, Sparkles, ArrowRight, 
  CheckCircle2, Users, ExternalLink 
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PublicPageHero } from '../components/PublicPageHero';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicEventsPageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PublicEventsPage: React.FC<PublicEventsPageProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenRegister
}) => {
  const { schedules } = PUBLIC_CHURCH_DATA;

  const upcomingSpecialEvents = [
    {
      title: 'Water Baptism & Holy Consecration Service',
      date: 'Next Scheduled Sunday Celebration',
      time: '11:30 AM (Right after Sunday Service)',
      location: 'Main Sanctuary & Baptismal Pool',
      desc: 'Public testimony of believers declaring their death, burial, and resurrection with Christ in obedience to the Great Commission.',
      badge: 'Holy Ordinance'
    },
    {
      title: 'Jesus Gen Youth Encounter & Camp',
      date: 'Quarterly Youth Gathering',
      time: 'Saturday • 9:00 AM – 5:00 PM',
      location: 'Sanctuary & Fellowship Grounds',
      desc: 'Intensive spiritual awakening, worship, campus leadership training, and fellowship for high school and university students.',
      badge: 'Youth & NextGen'
    },
    {
      title: 'Covenant Family Fellowship Lunch',
      date: 'First Sunday of Every Month',
      time: '11:45 AM',
      location: 'Church Fellowship Hall',
      desc: 'Breaking bread together after the morning service. Bring your family and share a meal with brothers and sisters in Christ.',
      badge: 'Table Fellowship'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero */}
      <PublicPageHero
        badge="Church Life & Gatherings"
        title="Events & Service Schedules"
        subtitle="Gathering together in unity to celebrate the Lord Jesus Christ and build up the saints."
        onNavigateHome={() => onNavigate('home')}
        scriptureText="Not neglecting to meet together, as is the habit of some, but encouraging one another, and all the more as you see the Day drawing near."
        scriptureRef="Hebrews 10:25"
      />

      {/* Weekly Schedule Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            Weekly Rhythms
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Regular Church Gatherings
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
            You are warmly invited to join any of our weekly gatherings in person or connect online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-8 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                item.highlight
                  ? 'bg-gradient-to-br from-gold/15 via-gold/5 to-transparent border-gold/40 shadow-lg'
                  : 'bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/20 text-gold-dark dark:text-gold border border-gold/30">
                    {item.badge}
                  </span>
                  <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                    {item.day}
                  </span>
                </div>
                <h3 className="font-serif font-black text-xl text-slate-900 dark:text-white">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gold">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{item.time}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Main Sanctuary (Bacoor)</span>
                <button
                  onClick={() => onNavigate('first-time')}
                  className="font-bold text-gold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Visitor Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Upcoming Events */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">
            Special Highlights
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Upcoming Milestones & Feasts
          </h2>
        </div>

        <div className="space-y-4">
          {upcomingSpecialEvents.map((ev, i) => (
            <div
              key={i}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    {ev.badge}
                  </span>
                  <span className="text-xs font-semibold text-stone-400">
                    {ev.date}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                  {ev.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  {ev.desc}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400 pt-1">
                  <span className="flex items-center gap-1.5 text-gold font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ev.time}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{ev.location}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-2.5 rounded-xl bg-gold/15 hover:bg-gold hover:text-slate-950 text-gold-dark dark:text-gold font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Inquire & Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sanctuary Directions Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-stone-900 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border border-gold/30 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-serif font-bold text-xl sm:text-2xl">
              Planning to Attend an Event in Person?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Our sanctuary is equipped with air conditioning, comfortable seating, and parking inside Camella Springville Molino 3, Bacoor City.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 rounded-2xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md shrink-0 hover:scale-[1.02]"
          >
            <span>View Maps & Commute Guide</span>
          </button>
        </div>
      </section>

    </div>
  );
};
