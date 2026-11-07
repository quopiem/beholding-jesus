import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Calendar, Clock, MapPin, Heart, BookOpen, Music, 
  Users, ArrowRight, ShieldCheck, ExternalLink, Copy, Check, 
  Smartphone, Moon, Sun, ChevronRight, ChevronLeft, Maximize2, Download, X, Camera
} from 'lucide-react';
import { CHURCH_INFO } from '../../services/churchInfo';
import { UserProfile } from '../../types';
import { DownloadAppModal } from '../../components/DownloadAppModal';
import { CHURCH_MOMENT_PHOTOS, ChurchMomentPhoto } from './churchMomentsData';
import { ChurchMomentsLightboxModal } from '../../components/ChurchMomentsLightboxModal';

interface LandingPageViewProps {
  onNavigate: (tab: string) => void;
  currentUser?: UserProfile | null;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigate,
  currentUser
}) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedMomentIndex, setSelectedMomentIndex] = useState<number | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Auto-scroll hero background photos to the right every 5 seconds
  useEffect(() => {
    if (isHeroPaused) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % CHURCH_MOMENT_PHOTOS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHeroPaused]);

  const handleNextHero = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % CHURCH_MOMENT_PHOTOS.length);
  };

  const handlePrevHero = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + CHURCH_MOMENT_PHOTOS.length) % CHURCH_MOMENT_PHOTOS.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNextHero();
      else handlePrevHero();
    }
    touchStartXRef.current = null;
  };

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
      {/* GLOBAL KEYFRAMES — injected once at top of component           */}
      {/* ============================================================== */}
      <style>{`
        @keyframes kenBurns {
          0%   { transform: scale(1.00) translate(0%, 0%); }
          50%  { transform: scale(1.06) translate(-1.5%, -1%); }
          100% { transform: scale(1.00) translate(0%, 0%); }
        }
        @keyframes shimmerSlide {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(197, 164, 109, 0); }
          50%       { box-shadow: 0 0 24px 6px rgba(197, 164, 109, 0.22); }
        }
        .animate-ken-burns { animation: kenBurns 14s ease-in-out infinite; }
        .animate-fade-up   { animation: fadeUp 0.65s ease both; }
        .animate-glow-pulse{ animation: glowPulse 3.5s ease-in-out infinite; }
        .nav-link {
          position: relative;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #C5A46D, #E8D4A8);
          border-radius: 9999px;
          transition: width 0.25s ease;
        }
        .nav-link:hover::after { width: 100%; }
        .gold-divider {
          display: block;
          width: 56px;
          height: 3px;
          background: linear-gradient(90deg, #C5A46D, #E8D4A8, #C5A46D);
          border-radius: 9999px;
          margin: 10px auto 0;
        }
        .card-hover {
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -8px rgba(0,0,0,0.13), 0 0 0 1.5px rgba(197,164,109,0.25);
        }
        .shimmer-btn {
          background-size: 200% auto;
          animation: shimmerSlide 2.4s linear infinite;
        }
      `}</style>

      {/* ============================================================== */}
      {/* 1. TOP SACRED NAVBAR                                           */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0C0E14]/95 backdrop-blur-xl border-b border-stone-200/60 dark:border-slate-800/70 px-3 sm:px-8 py-3.5 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0 group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-slate-900 border border-gold/40 p-1 shadow-sm shrink-0 flex items-center justify-center animate-glow-pulse group-hover:border-gold/70 transition-all duration-300">
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
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold-dark dark:text-gold font-bold uppercase tracking-wider border border-gold/30 shrink-0">
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
            <a href="#hero"        className="nav-link hover:text-gold transition-colors">Church Moments</a>
            <a href="#gatherings"  className="nav-link hover:text-gold transition-colors">Gatherings</a>
            <a href="#pastor"      className="nav-link hover:text-gold transition-colors">Pastoral Word</a>
            <a href="#ministries"  className="nav-link hover:text-gold transition-colors">Ministries</a>
            <a href="#sanctuary"   className="nav-link hover:text-gold transition-colors">Sanctuary</a>
          </nav>

          {/* Right Controls */}
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
              className="shimmer-btn px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs text-white dark:text-slate-950 shadow-sm hover:shadow-md transition flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 shrink-0"
              style={{
                background: 'linear-gradient(90deg, #1e293b 0%, #374151 40%, #C5A46D 60%, #1e293b 100%)',
              }}
            >
              <span className="hidden sm:inline">Community Feed</span>
              <span className="sm:hidden">Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. GRAND HERO — Ken Burns + gradient overlays                  */}
      {/* ============================================================== */}
      <section 
        id="hero" 
        className="relative overflow-hidden min-h-[88vh] sm:min-h-[720px] lg:min-h-[840px] flex items-center justify-center pt-16 pb-20 sm:pt-24 sm:pb-28 select-none"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image Carousel with Ken Burns */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="flex w-full h-full transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentHeroIndex * 100}%)` }}
          >
            {CHURCH_MOMENT_PHOTOS.map((photo) => (
              <div key={photo.id} className="relative min-w-full h-full shrink-0 overflow-hidden">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title} 
                  className="w-full h-full object-cover object-center filter brightness-[0.48] contrast-[1.08] saturate-[1.10] animate-ken-burns"
                />
                {/* Rich layered overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/35 to-[#FAF8F5] dark:to-[#0C0E14]" />
                <div className="absolute inset-0 bg-radial from-amber-500/12 via-transparent to-black/60 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Decorative gold shimmer top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        {/* Desktop Arrows */}
        <button
          type="button"
          onClick={handlePrevHero}
          className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white items-center justify-center transition shadow-2xl active:scale-95 cursor-pointer group"
          aria-label="Previous Photo"
        >
          <ChevronLeft className="w-6 h-6 text-gold group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          type="button"
          onClick={handleNextHero}
          className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white items-center justify-center transition shadow-2xl active:scale-95 cursor-pointer group"
          aria-label="Next Photo"
        >
          <ChevronRight className="w-6 h-6 text-gold group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Hero Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8 z-10 w-full animate-fade-up">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-gold/50 text-amber-200 text-xs font-bold tracking-wider uppercase shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse shrink-0" />
            <span>Welcome to Our Church Family</span>
            <span className="text-white/35">•</span>
            <span className="text-gold font-bold">{currentHeroIndex + 1} / {CHURCH_MOMENT_PHOTOS.length}</span>
          </div>

          {/* Headline */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight uppercase leading-tight sm:leading-tight drop-shadow-2xl">
              Beholding The Glory <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#F3E3C3] via-gold to-amber-300 bg-clip-text text-transparent drop-shadow-md">
                Of The Lord
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-xs sm:text-base lg:text-lg text-stone-200 leading-relaxed font-sans px-2 drop-shadow-md">
              A Christ-centered sanctuary in Cavite dedicated to deep worship, life-giving fellowship, and spirit-led discipleship.
            </p>
          </div>

          {/* Scripture Card — refined glassmorphism */}
          <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl border shadow-2xl backdrop-blur-lg text-center mx-2 sm:mx-auto"
            style={{
              background: 'rgba(0,0,0,0.42)',
              borderColor: 'rgba(197,164,109,0.45)',
              borderLeftWidth: '3px',
              borderLeftColor: '#C5A46D',
            }}>
            <p className="font-serif italic text-xs sm:text-sm text-amber-100/95 leading-relaxed">
              "And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image from one degree of glory to another. For this comes from the Lord who is the Spirit."
            </p>
            <div className="mt-2 text-[10px] sm:text-[11px] font-bold tracking-widest text-gold uppercase">
              2 Corinthians 3:18 • Church Foundation Scripture
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md sm:max-w-none mx-auto">
            <button
              onClick={handleEnterFeed}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-gold to-amber-400 hover:from-amber-400 hover:to-gold text-slate-950 font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Community Feed</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#gatherings"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/14 hover:bg-white/24 backdrop-blur-md border border-white/25 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.97]"
            >
              <Calendar className="w-4 h-4 text-gold" />
              <span>Sunday Gatherings</span>
            </a>

            <button
              onClick={() => setSelectedMomentIndex(currentHeroIndex)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-stone-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.97]"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>View Photo Details</span>
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="pt-2 flex items-center justify-center gap-2">
            {CHURCH_MOMENT_PHOTOS.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setCurrentHeroIndex(idx)}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentHeroIndex
                    ? 'w-10 bg-gold shadow-[0_0_8px_2px_rgba(197,164,109,0.5)]'
                    : 'w-2 bg-white/35 hover:bg-white/60'
                }`}
                title={`Photo ${idx + 1}: ${photo.title}`}
              />
            ))}
          </div>

          {/* Live Status Row */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-stone-300 font-medium drop-shadow-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-stone-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Sanctuary Fellowship Active</span>
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span>Camella Springville Molino 3</span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span>Bacoor City, Cavite</span>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. WEEKLY GATHERINGS                                           */}
      {/* ============================================================== */}
      <section id="gatherings" className="py-16 sm:py-24 bg-stone-100/55 dark:bg-slate-900/35 border-y border-stone-200/60 dark:border-slate-800/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14">
          
          {/* Section Header */}
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
              Times of Fellowship
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
              Weekly Gatherings
            </h2>
            <span className="gold-divider" />
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto pt-2">
              You are warmly invited to worship, fellowship, and dive into God's Living Word with us every week.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            
            {/* Card 1: Sunday Worship */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-gold/40 p-6 sm:p-7 shadow-lg relative overflow-hidden flex flex-col justify-between card-hover group">
              {/* Top gradient accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-gold via-amber-300 to-gold opacity-80" />
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-gold/20 text-gold-dark dark:text-gold text-[10px] font-black uppercase tracking-wider">
                    Primary Service
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold/25 to-amber-400/15 text-gold flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-[0_0_16px_4px_rgba(197,164,109,0.25)] transition-shadow duration-300">
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

            {/* Card 2: NextGen Youth */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 sm:p-7 shadow-md flex flex-col justify-between card-hover group hover:border-purple-400/50 dark:hover:border-purple-500/50">
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl bg-gradient-to-r from-transparent via-purple-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
                    Youth & Students
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_16px_4px_rgba(168,85,247,0.2)] transition-shadow duration-300">
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

            {/* Card 3: Midweek Prayer */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 sm:p-7 shadow-md flex flex-col justify-between card-hover group hover:border-emerald-400/50 dark:hover:border-emerald-500/50">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    Prayer & Word
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_16px_4px_rgba(16,185,129,0.2)] transition-shadow duration-300">
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
      {/* 4. PASTORAL WORD                                               */}
      {/* ============================================================== */}
      <section id="pastor" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-[#1a1109] via-stone-900 to-[#221814] text-white p-6 sm:p-10 border border-gold/30 shadow-2xl relative overflow-hidden">
            
            {/* Ambient gold orbs */}
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gold/12 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-amber-900/20 blur-2xl pointer-events-none" />
            {/* Subtle cross-hatch texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C5A46D' fill-opacity='1'%3E%3Cpath d='M0 20h40v1H0zm19 0v20h1V20zm0-20v20h1V0z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              
              {/* Pastor Portrait */}
              <div className="md:col-span-4 text-center space-y-3">
                {/* Decorative ring */}
                <div className="relative inline-block mx-auto">
                  <div className="absolute inset-0 rounded-3xl ring-2 ring-gold/60 blur-sm scale-105 animate-glow-pulse" />
                  <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-3xl overflow-hidden mx-auto border-2 border-gold/55 shadow-2xl p-1 bg-gradient-to-tr from-gold/60 to-amber-200/40">
                    <img
                      src="/images/pastor-john-eric-manjares.png"
                      alt="Senior Pastor John Erick Manjares"
                      className="w-full h-full rounded-2xl object-cover bg-stone-950"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/church-logo.png';
                      }}
                    />
                  </div>
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/25">
                  <Sparkles className="w-3 h-3 text-gold shrink-0" />
                  <span>A Pastoral Welcome</span>
                </div>

                {/* Decorative opening quote */}
                <div className="relative">
                  <span className="absolute -top-3 -left-1 text-5xl text-gold/40 font-serif leading-none select-none">"</span>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-amber-50 leading-snug pl-5">
                    You are loved, valued, and welcome in the house of the Lord.
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans border-l-2 border-gold/40 pl-4">
                  Grace and peace be multiplied to you! At Beholding Jesus Church, our deepest prayer is that every soul who steps through our doors—or joins us through our community platform—experiences the tangible, transforming presence of our Lord Jesus Christ. We believe in living out the Gospel with authenticity: loving God wholeheartedly, making faithful disciples, and walking alongside one another in genuine grace.
                </p>

                {/* Psalm footer */}
                <div className="text-[11px] text-gold/70 font-serif italic text-right">
                  — Psalm 46:10 · "Be still, and know that I am God."
                </div>

                {/* Motto + CTA */}
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
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm shrink-0 cursor-pointer text-center active:scale-95 hover:scale-[1.03]"
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
      {/* 5. MINISTRIES SHOWCASE                                         */}
      {/* ============================================================== */}
      <section id="ministries" className="py-16 sm:py-24 bg-stone-100/50 dark:bg-slate-900/30 border-y border-stone-200/70 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-gold">
              Active Church Life
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
              Our Ministries
            </h2>
            <span className="gold-divider" />
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto pt-2">
              Find your spiritual family and utilize your God-given gifts to serve and glorify Christ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
            
            {/* Ministry 1: Worship */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 card-hover group hover:border-purple-400/40 dark:hover:border-purple-500/40 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:shadow-[0_0_18px_4px_rgba(168,85,247,0.18)] transition-shadow duration-300">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  Worship & Creative Arts
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  Ushering the congregation into God's presence through Spirit-led music, vocal keys, choir, and audio-visual media.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">Creative Arts</span>
              </div>
            </div>

            {/* Ministry 2: NextGen Youth */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 card-hover group hover:border-blue-400/40 dark:hover:border-blue-500/40 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:shadow-[0_0_18px_4px_rgba(59,130,246,0.18)] transition-shadow duration-300">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  NextGen Youth Ministry
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  Raising up young disciples equipped to stand strong in their faith, lead in their schools, and impact the world for Jesus.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Youth Ministry</span>
              </div>
            </div>

            {/* Ministry 3: Prayer */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 card-hover group hover:border-rose-400/40 dark:hover:border-rose-500/40 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:shadow-[0_0_18px_4px_rgba(244,63,94,0.18)] transition-shadow duration-300">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  Prayer & Intercession
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  A committed army of prayer warriors standing in the gap for families, the sick, church leadership, and our nation.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Intercession</span>
              </div>
            </div>

            {/* Ministry 4: Discipleship */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 card-hover group hover:border-amber-400/40 dark:hover:border-amber-500/40 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:shadow-[0_0_18px_4px_rgba(245,158,11,0.18)] transition-shadow duration-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  Life Groups & Discipleship
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  Small group gatherings across Cavite for Bible study, intimate prayer, mutual accountability, and Christ-like growth.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Life Groups</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. SANCTUARY LOCATION & DIRECTIONS                             */}
      {/* ============================================================== */}
      <section id="sanctuary" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 sm:p-10 shadow-lg space-y-6 sm:space-y-8">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-slate-800">
              <div className="space-y-1.5">
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
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-gold text-stone-700 dark:text-stone-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95"
                >
                  {copiedAddress ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-stone-400" />}
                  <span>{copiedAddress ? 'Address Copied!' : 'Copy Address'}</span>
                </button>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-gold dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
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

              {/* CTA Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-gold/12 to-transparent border border-gold/30 text-center space-y-3 flex flex-col justify-center items-center">
                <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center mb-1">
                  <Heart className="w-5 h-5 text-gold" />
                </div>
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  First Time Visiting?
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-sm">
                  Our welcoming ushering and hospitality team will greet you at the door. There is no dress code—come as you are!
                </p>
                <button
                  onClick={handleEnterFeed}
                  className="px-5 py-2.5 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer mt-1 hover:scale-[1.03] active:scale-95"
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
        {/* Top gold shimmer line */}
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-8 rounded-full" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex items-center gap-3">
            <img 
              src="/icons/church-seal-gold.png" 
              alt="Beholding Jesus Church" 
              className="w-10 h-10 object-contain drop-shadow-sm shrink-0 opacity-90" 
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

          <div className="text-xs text-stone-400 dark:text-stone-500 font-sans">
            © {new Date().getFullYear()} Beholding Jesus Church. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500 dark:text-stone-400 flex-wrap justify-center">
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

      {/* High-Resolution Church Moments Lightbox Modal */}
      <ChurchMomentsLightboxModal
        isOpen={selectedMomentIndex !== null}
        photos={CHURCH_MOMENT_PHOTOS}
        currentIndex={selectedMomentIndex ?? 0}
        onClose={() => setSelectedMomentIndex(null)}
        onNavigateIndex={(idx) => setSelectedMomentIndex(idx)}
      />

    </div>
  );
};
