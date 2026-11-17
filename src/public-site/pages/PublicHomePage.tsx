import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Clock, MapPin, Heart, BookOpen, Music, 
  Users, ArrowRight, ShieldCheck, ExternalLink, Copy, Check, 
  ChevronRight, Compass, Camera, Quote
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';
import { CHURCH_MOMENT_PHOTOS } from '../../features/landing/churchMomentsData';

interface PublicHomePageProps {
  onNavigate: (page: PublicPageId) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenRegister
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);

  // Auto-cycle through moments photos every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMomentIndex(prev => (prev + 1) % CHURCH_MOMENT_PHOTOS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(PUBLIC_CHURCH_DATA.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const activePhoto = CHURCH_MOMENT_PHOTOS[currentMomentIndex] || CHURCH_MOMENT_PHOTOS[0];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] sm:min-h-[680px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-slate-950 text-white pt-10 sm:pt-16 pb-16 px-4 sm:px-6">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-600 blur-[140px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 z-10">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>Welcome to Beholding Jesus Church</span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight sm:leading-none uppercase">
              Fix Your Eyes <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-300 to-amber-200">
                On Jesus Christ
              </span>
            </h1>
            <p className="font-serif italic text-sm sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              &ldquo;Looking unto Jesus the author and finisher of our faith...&rdquo;
              <span className="not-italic font-sans text-xs font-bold text-gold block sm:inline sm:ml-2">
                — Hebrews 12:2
              </span>
            </p>
          </div>

          {/* Intro Description */}
          <p className="text-xs sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed font-sans">
            A Christ-centered, grace-anchored church family in Bacoor City, Cavite. We exist to know Christ and make Him known through passionate worship, sound biblical doctrine, loving fellowship, and intentional discipleship.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('first-time')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold hover:from-amber-400 hover:to-gold text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-95"
            >
              <span>First Time Visiting?</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('events')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Calendar className="w-4 h-4 text-gold" />
              <span>Gathering Schedules</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="px-6 py-3.5 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/70 border border-emerald-500/40 text-emerald-200 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Join Church Family</span>
            </button>
          </div>

          {/* Highlight Badge */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold" />
              <span>Sundays at 9:00 AM</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>Camella Springville Molino 3, Bacoor</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SUNDAY GATHERINGS HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl space-y-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gold">
                Join Us In Person
              </div>
              <h2 className="font-serif font-black text-xl sm:text-3xl text-slate-900 dark:text-white">
                Weekly Church Gatherings
              </h2>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-bold text-gold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Calendar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PUBLIC_CHURCH_DATA.schedules.map((item, idx) => (
              <div 
                key={idx}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  item.highlight
                    ? 'bg-gradient-to-br from-gold/15 via-gold/5 to-transparent border-gold/40 shadow-sm'
                    : 'bg-stone-50 dark:bg-slate-800/60 border-stone-200/80 dark:border-slate-700/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gold/20 text-gold-dark dark:text-gold">
                      {item.badge}
                    </span>
                    <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      {item.dayAbbr}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-gold">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.time}</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-semibold text-stone-500 dark:text-stone-400 border-t border-stone-200/60 dark:border-slate-700/60">
                  Main Sanctuary
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. SENIOR PASTOR MESSAGE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-slate-950 text-white border border-gold/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-3">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-gold/60 overflow-hidden shadow-xl bg-gold/10 p-1">
                <img 
                  src={PUBLIC_CHURCH_DATA.seniorPastor.avatar} 
                  alt={PUBLIC_CHURCH_DATA.seniorPastor.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // Fallback to church seal if avatar image not present
                    (e.target as HTMLImageElement).src = '/icons/church-seal-gold.png';
                  }}
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">
                  {PUBLIC_CHURCH_DATA.seniorPastor.name}
                </h3>
                <p className="text-xs text-gold font-semibold uppercase tracking-wider">
                  {PUBLIC_CHURCH_DATA.seniorPastor.title}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center text-gold">
                <Quote className="w-5 h-5" />
              </div>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-white leading-tight">
                Welcome Home to God&apos;s Grace
              </h2>
              <p className="font-serif italic text-stone-200 text-sm sm:text-base leading-relaxed">
                &ldquo;{PUBLIC_CHURCH_DATA.seniorPastor.quote}&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-sans">
                At Beholding Jesus Church, our door is wide open to people from all backgrounds, regardless of where they are on their spiritual journey. We believe in the power of Jesus Christ to forgive, restore, heal, and lead you into your divine purpose.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('about')}
                  className="px-5 py-2.5 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <span>Read Pastor&apos;s Welcome & Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('beliefs')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Our Statement of Faith</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gold" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. OUR VOCATION & MINISTRIES (Based on user layout diagram) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
            Active Church Life
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
            Our Vocation
          </h2>
          <div className="h-0.5 w-16 bg-gold mx-auto rounded-full" />
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 pt-1 font-medium">
            Serving God and people through different gifts according to the grace He has given us.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Track 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-amber-400/40 transition">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Life Groups and Fellowship
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Small group gatherings across Cavite for Bible study, intimate prayer, mutual care, and Christ-like growth.
              </p>
            </div>
            <button
              onClick={() => onNavigate('life-groups')}
              className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 pt-2 cursor-pointer border-t border-stone-100 dark:border-slate-800"
            >
              <span>Explore Life Groups</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Track 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-blue-400/40 transition">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                NextGen Youth Ministry
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Empowering students and youth to stand strong in faith, lead in their campuses, and impact this generation.
              </p>
            </div>
            <button
              onClick={() => onNavigate('ministries')}
              className="text-[11px] font-bold text-blue-500 hover:underline flex items-center gap-1 pt-2 cursor-pointer border-t border-stone-100 dark:border-slate-800"
            >
              <span>Jesus Gen Youth</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Track 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-rose-400/40 transition">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Prayer and Intercession
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                A committed army of prayer warriors standing in the gap for families, the sick, church leadership, and our nation.
              </p>
            </div>
            <button
              onClick={() => onNavigate('prayer')}
              className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 pt-2 cursor-pointer border-t border-stone-100 dark:border-slate-800"
            >
              <span>Prayer Altar</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Track 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-purple-400/40 transition">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Ministries / Core Ministries
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Worship music, audio-visual multimedia, ushering, hospitality, and sanctuary operational services.
              </p>
            </div>
            <button
              onClick={() => onNavigate('ministries')}
              className="text-[11px] font-bold text-purple-500 hover:underline flex items-center gap-1 pt-2 cursor-pointer border-t border-stone-100 dark:border-slate-800"
            >
              <span>Core Ministries</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Callout Banner: Have the heart to serve */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-slate-900 border border-gold/30 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>God-Given Calling</span>
            </span>
            <h3 className="font-serif font-bold text-lg sm:text-2xl text-white">
              Have the heart to serve and join ministry?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
              Serving God and people through different gifts according to the grace He has given us.
            </p>
          </div>
          <button
            onClick={() => onNavigate('ministries')}
            className="px-6 py-3.5 rounded-2xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-95 shrink-0"
          >
            <span>Check Church Ministry Teams</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5. VISITING & SANCTUARY LOCATION (Exact design from user diagram) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 sm:p-10 shadow-lg space-y-6 sm:space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-slate-800">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span>Sanctuary Location</span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-3xl text-slate-900 dark:text-white">
                Visit Us
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                Come join us this Sunday. Everyone will happily greet you and find a seat. Wear whatever you&apos;re comfortable in. We are just glad you&apos;re here!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-gold text-stone-700 dark:text-stone-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95"
              >
                {copiedAddress ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-stone-400" />}
                <span>{copiedAddress ? 'Address Copied!' : 'Copy'}</span>
              </button>

              <a
                href={PUBLIC_CHURCH_DATA.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-gold dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span>Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-100 dark:border-slate-700/60 space-y-1">
                <div className="text-[11px] font-bold text-gold uppercase tracking-wider">
                  Full Church Address
                </div>
                <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-100 leading-relaxed font-sans">
                  {PUBLIC_CHURCH_DATA.address}
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Safe, family-friendly sanctuary with air conditioning</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Parking space available within Camella Springville</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Accessible public transport routes via Molino Boulevard</span>
                </div>
              </div>
            </div>

            {/* CTA Box: First Time Visiting? */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-gold/12 to-transparent border border-gold/30 text-center space-y-3 flex flex-col justify-center items-center">
              <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center mb-1">
                <Heart className="w-5 h-5 text-gold" />
              </div>
              <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                First Time Visiting?
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-sm">
                Come join us this Sunday. Everyone will happily greet you and find a seat. Wear whatever you&apos;re comfortable in. We are just glad you&apos;re here!
              </p>
              <button
                onClick={() => onNavigate('first-time')}
                className="px-5 py-2.5 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer mt-1 hover:scale-[1.03] active:scale-95"
              >
                <span>Read First-Time Visitor Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 6. PHOTO GALLERY PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gold">
              Church Moments
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
              Life Together in Christ
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            A glimpse into our worship, table fellowship, and youth discipleship.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {CHURCH_MOMENT_PHOTOS.slice(0, 8).map((photo, i) => (
            <div 
              key={photo.id || i}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-900 border border-stone-200 dark:border-slate-800 shadow-sm"
            >
              <img 
                src={photo.imageUrl} 
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                  {photo.categoryLabel}
                </span>
                <span className="text-xs font-bold truncate">
                  {photo.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
