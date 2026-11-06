import React, { useState } from 'react';
import { 
  Sparkles, Calendar, Clock, MapPin, Heart, BookOpen, Music, 
  Users, ArrowRight, ShieldCheck, ExternalLink, Copy, Check, 
  Smartphone, Moon, Sun, ChevronRight
} from 'lucide-react';
import { CHURCH_INFO } from '../../services/churchInfo';
import { UserProfile } from '../../types';
import { DownloadAppModal } from '../../components/DownloadAppModal';

interface LandingPageViewProps {
  onNavigate: (tab: string) => void;
  currentUser?: UserProfile | null;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigate,
  currentUser
}) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('bjc_theme') === 'dark';
  });

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bjc_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bjc_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const churchAddress = "2nd Flr. B15 L35 MVillar Ave PH2 central Camella Springville Molino 3, Bacoor City, Cavite";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Beholding Jesus Church 2nd Flr B15 L35 MVillar Ave PH2 central Camella Springville Molino 3 Bacoor City Cavite'
  )}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(churchAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleEnterFeed = () => {
    onNavigate('feed');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0C0E14] text-stone-800 dark:text-stone-100 font-sans transition-colors duration-300 pb-28 md:pb-12">
      
      {/* ============================================================== */}
      {/* 1. TOP SACRED NAVBAR (Aesthetic, Responsive, No Overlaps)      */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/92 dark:bg-[#0C0E14]/92 backdrop-blur-xl border-b border-stone-200/70 dark:border-slate-800/80 px-3 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white dark:bg-slate-900 border border-gold/40 p-1 shadow-xs shrink-0 flex items-center justify-center">
              <img 
                src="/icons/church-seal-gold.png" 
                alt="Beholding Jesus Church" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-serif font-black text-xs sm:text-base tracking-wider text-slate-900 dark:text-white uppercase truncate">
                  Beholding Jesus
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-gold/15 text-gold-dark dark:text-gold font-bold uppercase tracking-wider border border-gold/30 shrink-0">
                  Church
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 font-medium truncate hidden xs:block">
                {CHURCH_INFO.primaryMotto}
              </p>
            </div>
          </div>

          {/* Quick Anchor Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-600 dark:text-stone-300">
            <a href="#gatherings" className="hover:text-gold transition">Gatherings</a>
            <a href="#pastor" className="hover:text-gold transition">Pastoral Word</a>
            <a href="#ministries" className="hover:text-gold transition">Ministries</a>
            <a href="#sanctuary" className="hover:text-gold transition">Sanctuary Location</a>
          </nav>

          {/* Right Controls: Theme Toggle & Community Feed Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-600 dark:text-stone-300 transition cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={handleEnterFeed}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 dark:from-gold dark:to-amber-400 text-white dark:text-slate-950 font-bold text-xs hover:shadow-md transition flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 shrink-0 shadow-xs"
            >
              <span className="hidden sm:inline">Community Feed</span>
              <span className="sm:hidden">Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. GRAND HERO SECTION                                          */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-20 sm:pb-24">
        
        {/* Ambient Glow Elements (pointer-events-none to prevent touch/click blocking) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-amber-500/10 via-gold/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-5 w-60 h-60 rounded-full bg-gold/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8 z-10">
          
          {/* Welcome Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 dark:bg-gold/20 border border-gold/40 text-gold-dark dark:text-gold text-xs font-bold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse shrink-0" />
            <span>Welcome in the Name of Jesus</span>
          </div>

          {/* Majestic Hero Headline */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="font-serif font-black text-2xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight uppercase leading-tight sm:leading-tight">
              Beholding The Glory <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-gold via-amber-400 to-amber-600 bg-clip-text text-transparent">
                Of The Lord
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-xs sm:text-base lg:text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-sans px-2">
              A Christ-centered sanctuary in Cavite dedicated to deep worship, life-giving fellowship, and spirit-led discipleship.
            </p>
          </div>

          {/* Scripture Callout Card */}
          <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-gold/30 shadow-card backdrop-blur-md text-center mx-2 sm:mx-auto">
            <p className="font-serif italic text-xs sm:text-sm text-stone-700 dark:text-amber-100/90 leading-relaxed">
              "And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image from one degree of glory to another. For this comes from the Lord who is the Spirit."
            </p>
            <div className="mt-2 text-[10px] sm:text-[11px] font-bold tracking-widest text-gold uppercase">
              2 Corinthians 3:18 • Church Foundation Scripture
            </div>
          </div>

          {/* Action Buttons: Responsive & No Overlaps */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md sm:max-w-none mx-auto">
            <button
              onClick={handleEnterFeed}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-stone-900 to-[#1e293b] dark:from-gold dark:to-amber-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Community Feed</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#gatherings"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 hover:border-gold text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-gold" />
              <span>Sunday Gatherings</span>
            </a>

            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>Mobile App</span>
            </button>
          </div>

          {/* Live Status Pill Row */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-slate-800/80 border border-stone-200/60 dark:border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Sanctuary Fellowship Active</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Camella Springville Molino 3</span>
            <span className="hidden sm:inline">•</span>
            <span>Bacoor City, Cavite</span>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. WEEKLY GATHERINGS & WORSHIP SCHEDULES                       */}
      {/* ============================================================== */}
      <section id="gatherings" className="py-12 sm:py-20 bg-stone-100/60 dark:bg-slate-900/40 border-y border-stone-200/70 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
          
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Times of Fellowship
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
              Weekly Gatherings
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
              You are warmly invited to worship, fellowship, and dive into God’s Living Word with us every week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            
            {/* Card 1: Sunday Worship Service */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-gold/40 p-6 sm:p-7 shadow-elevated relative overflow-hidden flex flex-col justify-between group hover:border-gold transition-all duration-300">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-gold/20 text-gold-dark dark:text-gold text-[10px] font-black uppercase tracking-wider">
                    Primary Service
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    Sunday Worship Service
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gold font-bold">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Sundays • 9:00 AM – 11:30 AM</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  Passionate praise and worship, holy communion, corporate prayer, and transformative preaching from God's Holy Word.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Main Sanctuary & Online</span>
                <span className="text-gold font-bold">All Are Welcome</span>
              </div>
            </div>

            {/* Card 2: NextGen Youth Fellowship */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 sm:p-7 shadow-card flex flex-col justify-between group hover:border-purple-400 transition-all duration-300">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
                    Youth & Students
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    NextGen Youth Fellowship
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Saturdays • 4:00 PM – 6:30 PM</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  High-energy worship, life-group discussions, youth discipleship, and passionate pursuit of Jesus for the next generation.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Youth Sanctuary</span>
                <span className="text-purple-500 font-bold">Ages 12 – 25</span>
              </div>
            </div>

            {/* Card 3: Midweek Prayer & Study */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 sm:p-7 shadow-card flex flex-col justify-between group hover:border-emerald-400 transition-all duration-300">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    Prayer & Word
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    Midweek Prayer & Study
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Wednesdays • 7:00 PM – 8:30 PM</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  Deep theological study, corporate intercessory prayer, and personal encouragement for your spiritual walk throughout the week.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400">Prayer Hall & Online</span>
                <span className="text-emerald-500 font-bold">Open to All</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. PASTORAL WORD & VISION (Aesthetic & Safe Layout)            */}
      {/* ============================================================== */}
      <section id="pastor" className="py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-stone-900 via-stone-900 to-[#221814] text-white p-6 sm:p-10 border border-gold/30 shadow-2xl relative overflow-hidden">
            
            {/* Ambient gold glow */}
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-gold/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              
              {/* Pastor Portrait */}
              <div className="md:col-span-4 text-center space-y-2.5">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden mx-auto border-2 border-gold/50 shadow-elevated p-1 bg-gradient-to-tr from-gold to-amber-200">
                  <img
                    src="/images/pastor-john-eric-manjares.png"
                    alt="Senior Pastor John Erick Manjares"
                    className="w-full h-full rounded-2xl object-cover bg-stone-950"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/icons/church-logo.png';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100">
                    John Erick Manjares
                  </h3>
                  <p className="text-xs text-gold font-bold uppercase tracking-wider">
                    Senior Pastor
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">
                    Beholding Jesus Church
                  </p>
                </div>
              </div>

              {/* Pastor's Message */}
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-gold shrink-0" />
                  <span>A Pastoral Welcome</span>
                </div>

                <h2 className="font-serif font-bold text-xl sm:text-2xl text-amber-50 leading-snug">
                  "You are loved, valued, and welcome in the house of the Lord."
                </h2>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                  "Grace and peace be multiplied to you! At Beholding Jesus Church, our deepest prayer is that every soul who steps through our doors—or joins us through our community platform—experiences the tangible, transforming presence of our Lord Jesus Christ. We believe in living out the Gospel with authenticity: loving God wholeheartedly, making faithful disciples, and walking alongside one another in genuine grace."
                </p>

                {/* Safe Flex Box: No Overlapping on Mobile */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-gold uppercase tracking-wider">
                      Our Guiding Motto
                    </div>
                    <div className="text-xs text-stone-200 font-serif mt-0.5 leading-snug">
                      {CHURCH_INFO.primaryMotto} • {CHURCH_INFO.secondaryMotto}
                    </div>
                  </div>
                  <button
                    onClick={handleEnterFeed}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-slate-950 font-bold text-xs transition shadow-xs shrink-0 cursor-pointer text-center"
                  >
                    Enter Church Feed
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. MINISTRIES SHOWCASE                                          */}
      {/* ============================================================== */}
      <section id="ministries" className="py-12 sm:py-20 bg-stone-100/50 dark:bg-slate-900/30 border-y border-stone-200/70 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
          
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Active Church Life
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
              Our Ministries
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
              Find your spiritual family and utilize your God-given gifts to serve and glorify Christ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
            
            {/* Ministry 1: Worship */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-card space-y-3 hover:border-gold transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  Worship & Creative Arts
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  Ushering the congregation into God's presence through Spirit-led music, vocal keys, choir, and audio-visual media.
                </p>
              </div>
            </div>

            {/* Ministry 2: NextGen Youth */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-card space-y-3 hover:border-gold transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  NextGen Youth Ministry
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  Raising up young disciples equipped to stand strong in their faith, lead in their schools, and impact the world for Jesus.
                </p>
              </div>
            </div>

            {/* Ministry 3: Prayer */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-card space-y-3 hover:border-gold transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  Prayer & Intercession
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  A committed army of prayer warriors standing in the gap for families, the sick, church leadership, and our nation.
                </p>
              </div>
            </div>

            {/* Ministry 4: Discipleship */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-card space-y-3 hover:border-gold transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  Life Groups & Discipleship
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  Small group gatherings across Cavite for Bible study, intimate prayer, mutual accountability, and Christ-like growth.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. SANCTUARY LOCATION & DIRECTIONS                             */}
      {/* ============================================================== */}
      <section id="sanctuary" className="py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 sm:p-10 shadow-card space-y-6 sm:space-y-8">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-gold shrink-0" />
                  <span>Sanctuary Location</span>
                </div>
                <h2 className="font-serif font-bold text-xl sm:text-3xl text-slate-900 dark:text-white">
                  Visit Us in Cavite
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  Join us in person for an uplifting Sunday worship experience.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleCopyAddress}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-gold text-stone-700 dark:text-stone-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {copiedAddress ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-stone-400" />}
                  <span>{copiedAddress ? 'Address Copied!' : 'Copy Address'}</span>
                </button>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-gold dark:hover:bg-gold-light text-white dark:text-slate-950 font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Google Maps</span>
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
                    {churchAddress}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
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

              {/* Call to Action Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-gold/15 to-transparent border border-gold/30 text-center space-y-3 flex flex-col justify-center items-center">
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  First Time Visiting?
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-sm">
                  Our welcoming ushering and hospitality team will greet you at the door. There is no dress code—come as you are!
                </p>
                <button
                  onClick={handleEnterFeed}
                  className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-slate-950 font-bold text-xs shadow-gold transition inline-flex items-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>Connect In Fellowship Feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. FOOTER                                                      */}
      {/* ============================================================== */}
      <footer className="bg-white dark:bg-slate-950 border-t border-stone-200 dark:border-slate-800 py-10 px-4 sm:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex items-center gap-3">
            <img 
              src="/icons/church-seal-gold.png" 
              alt="Beholding Jesus Church" 
              className="w-10 h-10 object-contain drop-shadow-sm shrink-0" 
            />
            <div>
              <div className="font-serif font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Beholding Jesus Church
              </div>
              <div className="text-[10px] text-gold font-bold uppercase tracking-wider">
                {CHURCH_INFO.primaryMotto} • {CHURCH_INFO.secondaryMotto}
              </div>
            </div>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 font-sans">
            © {new Date().getFullYear()} Beholding Jesus Church. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-stone-600 dark:text-stone-400 flex-wrap justify-center">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-gold transition cursor-pointer">
              Back to Top ↑
            </button>
            <button onClick={handleEnterFeed} className="hover:text-gold transition cursor-pointer">
              Community Feed
            </button>
            <button onClick={() => setIsDownloadModalOpen(true)} className="hover:text-gold transition cursor-pointer">
              Download App
            </button>
          </div>

        </div>
      </footer>

      {/* Download App Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

    </div>
  );
};
