import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Clock, MapPin, Heart, BookOpen, Music, 
  Users, ArrowRight, ShieldCheck, ExternalLink, Copy, Check, 
  ChevronRight, Compass, Camera, Quote, Play, ArrowDown
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';
import { CHURCH_MOMENT_PHOTOS } from '../../features/landing/churchMomentsData';
import { WhoWeAreSection } from '../components/WhoWeAreSection';

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

  const handleScrollDown = () => {
    const target = document.getElementById('sunday-gatherings-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Redesigned strictly matching reference image) */}
      {/* Constraint: Strictly keeps /images/bjc-sanctuary-worship-bg.jpg */}
      {/* ============================================================== */}
      <section className="relative min-h-[720px] sm:min-h-[820px] lg:min-h-[880px] flex items-center justify-center overflow-hidden text-white pt-28 sm:pt-36 pb-24 px-4 sm:px-6">
        
        {/* Sanctuary Worship Background Photo */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/images/bjc-sanctuary-worship-bg.jpg" 
            alt="Beholding Jesus Church Sanctuary Worship"
            className="w-full h-full object-cover object-center filter brightness-[0.44] contrast-[1.14] saturate-[1.18] scale-105 transform motion-safe:animate-pulse duration-[10000ms]"
          />
          {/* Layered dark gradients for pristine text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/85 via-stone-950/65 to-[#0E0C0A]" />
          <div className="absolute inset-0 bg-radial from-amber-500/12 via-transparent to-black/80 pointer-events-none" />
        </div>

        {/* Ambient Stage Cross Glow on Right Stage (matching mockup composition) */}
        <div className="absolute top-1/4 right-[8%] sm:right-[14%] pointer-events-none opacity-85 z-1 hidden sm:block">
          <div className="relative flex flex-col items-center">
            {/* Cross vertical beam */}
            <div className="w-2.5 sm:w-3.5 h-48 sm:h-64 bg-gradient-to-b from-[#FFF2B2] via-[#E8B868] to-amber-900/40 rounded-xs shadow-[0_0_55px_rgba(255,215,100,0.9)]" />
            {/* Cross horizontal beam */}
            <div className="absolute top-12 sm:top-16 w-24 sm:w-36 h-2.5 sm:h-3.5 bg-gradient-to-r from-amber-900/40 via-[#FFF2B2] to-amber-900/40 rounded-xs shadow-[0_0_55px_rgba(255,215,100,0.9)]" />
            {/* Cross radiant halo glow */}
            <div className="absolute top-8 sm:top-12 w-44 sm:w-64 h-44 sm:h-64 rounded-full bg-amber-400/25 blur-3xl" />
          </div>
        </div>

        {/* Subtle Decorative Golden Arc in Upper Left */}
        <div className="absolute top-8 left-0 w-80 sm:w-96 h-80 sm:h-96 pointer-events-none opacity-40 z-1 hidden md:block">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" aria-hidden="true">
            <path d="M -50,60 Q 200,80 180,380" stroke="url(#goldDecorativeArc)" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M -80,120 Q 240,150 140,420" stroke="url(#goldDecorativeArc)" strokeWidth="1" />
            <defs>
              <linearGradient id="goldDecorativeArc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DDA74F" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#FFE899" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7E6334" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Cinematic Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-30 z-1">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#DDA74F] blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-600 blur-[160px]" />
        </div>

        {/* Hero Content Container */}
        <div className="relative max-w-4xl mx-auto text-center space-y-5 sm:space-y-6 z-10">
          
          {/* Top Welcome Pill: ✦ WELCOME TO BEHOLDING JESUS CHURCH */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-[#DDA74F]/45 text-[#DDA74F] text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] shadow-md">
            <span className="text-xs">✦</span>
            <span>Welcome to Beholding Jesus Church</span>
          </div>

          {/* Main Title: FIX YOUR EYES / ON JESUS CHRIST with golden flourish */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="font-serif font-black text-4xl sm:text-6xl md:text-7xl lg:text-[5.2rem] text-white tracking-tight leading-[1.05] uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
              Fix Your Eyes
            </h1>
            
            <div className="relative inline-block">
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[4.75rem] tracking-tight leading-[1.1] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                <span className="font-black text-white mr-2 sm:mr-3">ON</span>
                <span className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#DDA74F] via-[#FFE58F] to-[#CE8C29]">
                  JESUS CHRIST
                </span>
              </h2>

              {/* Dynamic Curved Golden Flourish / Underline Stroke */}
              <svg 
                className="w-72 sm:w-96 md:w-[480px] max-w-full mx-auto -mt-1 sm:-mt-2 drop-shadow-[0_2px_14px_rgba(221,167,79,0.7)]" 
                viewBox="0 0 460 32" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path 
                  d="M 16 18 C 110 8, 260 5, 444 12 C 340 24, 170 23, 16 18 Z" 
                  fill="url(#goldSwooshGrad)" 
                />
                <path 
                  d="M 50 23 C 160 16, 280 15, 410 19" 
                  stroke="url(#goldSwooshGrad2)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  opacity="0.9" 
                />
                <defs>
                  <linearGradient id="goldSwooshGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C5A46D" stopOpacity="0.2" />
                    <stop offset="20%" stopColor="#DE9F35" />
                    <stop offset="55%" stopColor="#FFE899" />
                    <stop offset="85%" stopColor="#DE9F35" />
                    <stop offset="100%" stopColor="#7E6334" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="goldSwooshGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DE9F35" stopOpacity="0" />
                    <stop offset="30%" stopColor="#FFE899" />
                    <stop offset="70%" stopColor="#DE9F35" />
                    <stop offset="100%" stopColor="#DE9F35" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Scripture Subtitle */}
            <p className="font-serif italic text-sm sm:text-base md:text-lg text-stone-200/90 max-w-2xl mx-auto leading-relaxed drop-shadow pt-2">
              &ldquo;Looking unto Jesus the author and finisher of our faith...&rdquo;
              <span className="whitespace-nowrap not-italic font-sans text-xs sm:text-sm font-medium text-stone-400 block sm:inline sm:ml-2">
                — Hebrews 12:2
              </span>
            </p>
          </div>

          {/* Golden Latin Cross Separator */}
          <div className="flex items-center justify-center pt-1 pb-1">
            <span className="text-[#DDA74F] text-2xl sm:text-3xl select-none drop-shadow-[0_0_16px_rgba(221,167,79,0.95)] animate-pulse">
              †
            </span>
          </div>

          {/* Welcoming Heading */}
          <p className="font-sans font-bold text-sm sm:text-lg md:text-xl text-stone-100 tracking-wide drop-shadow-sm">
            You are welcome at our Sunday Services
          </p>

          {/* Sunday Gathering Dual Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-black/45 backdrop-blur-md border border-[#DDA74F]/40 text-[#DDA74F] font-bold text-xs sm:text-[13px] tracking-wider uppercase shadow-inner hover:border-[#DDA74F] transition-colors">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DDA74F] shrink-0" />
              <span>9:00 AM SUNDAY WORSHIP</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-black/45 backdrop-blur-md border border-[#DDA74F]/40 text-[#DDA74F] font-bold text-xs sm:text-[13px] tracking-wider uppercase shadow-inner hover:border-[#DDA74F] transition-colors">
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#DDA74F] fill-[#DDA74F] shrink-0" />
              <span>1:00 PM JESUS GEN YOUTH</span>
            </div>
          </div>

          {/* Sanctuary Location Line */}
          <div className="text-xs sm:text-sm text-stone-300/90 max-w-2xl mx-auto leading-relaxed flex items-center justify-center gap-1.5 drop-shadow-sm px-3">
            <MapPin className="w-4 h-4 text-[#DDA74F] shrink-0" />
            <span>2nd Flr. B15 L39 MVillar Avenue Ph2 Central Camella Springville, Molino 3, Bacoor City, Cavite</span>
          </div>

          {/* Live Stream CTA: Gold Gradient Pill Button */}
          <div className="pt-2 sm:pt-3 space-y-3.5">
            <a
              href="https://www.facebook.com/beholdingjesuschurch"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#DDA74F] via-[#F4C978] to-[#DDA74F] hover:from-[#F4C978] hover:to-[#DDA74F] text-stone-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_8px_25px_rgba(221,167,79,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Join us LIVE on Facebook & YouTube</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {/* Circular Social Buttons: Facebook Blue & YouTube Red */}
            <div className="flex items-center justify-center gap-3.5">
              {/* Facebook Button */}
              <a
                href="https://www.facebook.com/beholdingjesuschurch"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-[0_0_20px_rgba(24,119,242,0.6)] transition-all duration-300 transform hover:scale-115 active:scale-95 border-2 border-white/20 cursor-pointer"
                aria-label="Join Beholding Jesus Church on Facebook Live"
                title="Join us on Facebook Live"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* YouTube Button */}
              <a
                href="https://www.youtube.com/@beholdingjesuschurch"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FF0000] hover:bg-[#E60000] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.6)] transition-all duration-300 transform hover:scale-115 active:scale-95 border-2 border-white/20 cursor-pointer"
                aria-label="Watch Beholding Jesus Church on YouTube"
                title="Watch us on YouTube Live"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Left Corner: Scroll Down Pill ( ↓ ) */}
        <div className="absolute left-4 sm:left-8 bottom-6 sm:bottom-8 hidden md:flex flex-col items-center gap-2 z-20">
          <button 
            onClick={handleScrollDown}
            className="w-8 h-12 rounded-full border border-white/20 bg-black/35 backdrop-blur-sm flex flex-col items-center justify-center text-white/70 hover:text-[#DDA74F] hover:border-[#DDA74F] transition-all cursor-pointer group shadow-md"
            title="Scroll to weekly services"
            aria-label="Scroll down"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#DDA74F] animate-bounce mb-1" />
            <ArrowDown className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#DDA74F]" />
          </button>
        </div>

        {/* Bottom Right Corner: "All for His Glory" Script Calligraphy */}
        <div className="absolute right-4 sm:right-10 bottom-6 sm:bottom-8 z-20 pointer-events-none select-none text-right">
          <span 
            style={{ fontFamily: "'Alex Brush', 'Dancing Script', cursive" }}
            className="text-4xl sm:text-6xl text-white/95 drop-shadow-[0_2px_16px_rgba(221,167,79,0.7)] transform -rotate-6 inline-block tracking-wide"
          >
            All for His Glory
          </span>
        </div>

        {/* Bottom Wave / Ribbon Accent transitioning into content */}
        <div className="absolute -bottom-[1px] left-0 right-0 pointer-events-none z-10 overflow-hidden leading-none">
          <svg 
            className="w-full h-16 sm:h-24 md:h-28 text-stone-50 dark:text-slate-950" 
            viewBox="0 0 1440 120" 
            fill="none" 
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path 
              d="M 0,85 Q 360,135 760,65 T 1440,85 L 1440,120 L 0,120 Z" 
              fill="url(#goldWaveRibbon)" 
              opacity="0.95" 
            />
            <path 
              d="M 0,102 Q 420,138 880,80 T 1440,104 L 1440,120 L 0,120 Z" 
              fill="currentColor" 
            />
            <defs>
              <linearGradient id="goldWaveRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9E7634" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#E2A944" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#FFE899" stopOpacity="1" />
                <stop offset="85%" stopColor="#DE9F35" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#5E441A" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </section>

      {/* ============================================================== */}
      {/* 2. SUNDAY GATHERINGS HIGHLIGHT                                 */}
      {/* ============================================================== */}
      <section id="sunday-gatherings-section" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl space-y-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#DDA74F]">
                Join Us In Person
              </div>
              <h2 className="font-serif font-black text-xl sm:text-3xl text-slate-900 dark:text-white">
                Weekly Church Gatherings
              </h2>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-bold text-[#DDA74F] hover:underline flex items-center gap-1 cursor-pointer"
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
                    ? 'bg-gradient-to-br from-[#DDA74F]/15 via-[#DDA74F]/5 to-transparent border-[#DDA74F]/40 shadow-sm'
                    : 'bg-stone-50 dark:bg-slate-800/60 border-stone-200/80 dark:border-slate-700/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#DDA74F]/20 text-[#9E7634] dark:text-[#FFE58F]">
                      {item.badge}
                    </span>
                    <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      {item.dayAbbr}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#DDA74F]">
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

      {/* ============================================================== */}
      {/* 3. SENIOR PASTOR MESSAGE                                       */}
      {/* ============================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-slate-950 text-white border border-[#DDA74F]/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            <div className="md:col-span-1 flex flex-col items-center text-center space-y-3">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-[#DDA74F]/60 overflow-hidden shadow-xl bg-[#DDA74F]/10 p-1">
                <img 
                  src={PUBLIC_CHURCH_DATA.seniorPastor.avatar} 
                  alt={PUBLIC_CHURCH_DATA.seniorPastor.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icons/church-seal-gold.png';
                  }}
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">
                  {PUBLIC_CHURCH_DATA.seniorPastor.name}
                </h3>
                <p className="text-xs text-[#DDA74F] font-semibold uppercase tracking-wider">
                  {PUBLIC_CHURCH_DATA.seniorPastor.title}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#DDA74F]/15 flex items-center justify-center text-[#DDA74F]">
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
                  className="px-5 py-2.5 rounded-xl bg-[#DDA74F] hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <span>Read Pastor&apos;s Welcome & Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('beliefs')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Our Statement of Faith</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#DDA74F]" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. OUR VOCATION & MINISTRIES                                   */}
      {/* ============================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#DDA74F]">
            Active Church Life
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
            Our Vocation
          </h2>
          <div className="h-0.5 w-16 bg-[#DDA74F] mx-auto rounded-full" />
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 pt-1 font-medium">
            Serving God and people through different gifts according to the grace He has given us.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Track 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-[#DDA74F]/40 transition">
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
              className="text-[11px] font-bold text-[#DDA74F] hover:underline flex items-center gap-1 pt-2 cursor-pointer border-t border-stone-100 dark:border-slate-800"
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
              className="text-[11px] font-bold text-blue-400 hover:underline flex items-center gap-1 pt-2 cursor-pointer border-t border-stone-100 dark:border-slate-800"
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
              className="text-[11px] font-bold text-rose-400 hover:underline flex items-center gap-1 pt-2 cursor-pointer border-t border-stone-100 dark:border-slate-800"
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
              className="text-[11px] font-bold text-purple-400 hover:underline flex items-center gap-1 pt-2 cursor-pointer border-t border-stone-100 dark:border-slate-800"
            >
              <span>Core Ministries</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Callout Banner: Have the heart to serve */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-slate-900 border border-[#DDA74F]/30 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#DDA74F] flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#DDA74F]" />
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
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#DDA74F] via-[#F4C978] to-[#DDA74F] hover:from-[#F4C978] hover:to-[#DDA74F] text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <span>Check Church Ministry Teams</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. WHO WE ARE - Signature Ministry Photo Showcase             */}
      {/* ============================================================== */}
      <WhoWeAreSection onNavigate={onNavigate} showExploreButton={true} />

      {/* ============================================================== */}
      {/* 6. VISITING & SANCTUARY LOCATION                              */}
      {/* ============================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 sm:p-10 shadow-lg space-y-6 sm:space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-slate-800">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DDA74F] uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#DDA74F] shrink-0" />
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
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-[#DDA74F] text-stone-700 dark:text-stone-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95"
              >
                {copiedAddress ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-stone-400" />}
                <span>{copiedAddress ? 'Address Copied!' : 'Copy'}</span>
              </button>

              <a
                href={PUBLIC_CHURCH_DATA.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#DDA74F] dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span>Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-100 dark:border-slate-700/60 space-y-1">
                <div className="text-[11px] font-bold text-[#DDA74F] uppercase tracking-wider">
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
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#DDA74F]/12 to-transparent border border-[#DDA74F]/30 text-center space-y-3 flex flex-col justify-center items-center">
              <div className="w-12 h-12 rounded-full bg-[#DDA74F]/15 flex items-center justify-center mb-1">
                <Heart className="w-5 h-5 text-[#DDA74F]" />
              </div>
              <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                First Time Visiting?
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-sm">
                Come join us this Sunday. Everyone will happily greet you and find a seat. Wear whatever you&apos;re comfortable in. We are just glad you&apos;re here!
              </p>
              <button
                onClick={() => onNavigate('first-time')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#DDA74F] via-[#F4C978] to-[#DDA74F] hover:from-[#F4C978] hover:to-[#DDA74F] text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer mt-1 hover:scale-105 active:scale-95"
              >
                <span>Read First-Time Visitor Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. PHOTO GALLERY PREVIEW                                       */}
      {/* ============================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#DDA74F]">
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
                <span className="text-[10px] font-bold text-[#DDA74F] uppercase tracking-wider">
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
