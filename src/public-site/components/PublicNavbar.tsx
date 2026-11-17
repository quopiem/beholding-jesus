import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Sun, Moon, LogIn, UserPlus, ChevronDown, 
  MapPin, Calendar, Heart, BookOpen, Users, Compass, Sparkles, ArrowRight
} from 'lucide-react';
import { PublicPageId } from '../types';
import { PUBLIC_CHURCH_DATA } from '../data/publicChurchData';

interface PublicNavbarProps {
  currentPage: PublicPageId;
  onNavigate: (page: PublicPageId) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isLoggedIn?: boolean;
  onGoToApp?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  isDarkMode,
  onToggleTheme,
  isLoggedIn = false,
  onGoToApp
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isMinistriesDropdownOpen, setIsMinistriesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePageSelect = (page: PublicPageId) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    setIsAboutDropdownOpen(false);
    setIsMinistriesDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-md border-b border-stone-200/80 dark:border-slate-800/80' 
          : 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-stone-200/50 dark:border-slate-800/50'
      }`}
    >
      {/* Top Banner Notice: Sunday Gathering */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-slate-900 text-stone-100 text-[10px] sm:text-[11px] py-1.5 px-3 sm:px-4 text-center border-b border-gold/30">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 font-medium">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gold animate-pulse shrink-0" />
          <span className="truncate max-w-[280px] min-[400px]:max-w-none">
            Sunday Worship: <strong className="text-gold font-bold">9:00 AM</strong> • Camella Springville Molino 3, Bacoor
          </span>
          <button 
            onClick={() => handlePageSelect('first-time')}
            className="hidden md:inline-flex items-center gap-1 text-gold hover:text-amber-300 font-bold ml-2 underline underline-offset-2 cursor-pointer transition-colors"
          >
            <span>Plan Your Visit</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-16 sm:h-20">
          
          {/* Logo & Church Name */}
          <button
            onClick={() => handlePageSelect('home')}
            className="flex items-center gap-2 sm:gap-3 text-left cursor-pointer group min-w-0 shrink-0 select-none"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-gold/25 via-gold/15 to-transparent border border-gold/40 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <img 
                src="/icons/church-seal-gold.png" 
                alt="Beholding Jesus Church" 
                className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-xs" 
              />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="font-serif font-black text-xs min-[380px]:text-[13px] sm:text-base text-slate-900 dark:text-white uppercase tracking-wider group-hover:text-gold transition-colors whitespace-nowrap leading-tight">
                Beholding Jesus
              </div>
              <div className="text-[8.5px] sm:text-[10px] text-amber-700/80 dark:text-gold/80 font-bold tracking-widest uppercase leading-none mt-0.5">
                Church • Cavite
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-2" aria-label="Public website navigation">
            <button
              onClick={() => handlePageSelect('home')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'home'
                  ? 'text-gold bg-gold/10 font-black'
                  : 'text-stone-700 dark:text-stone-200 hover:text-gold hover:bg-stone-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>

            {/* About Dropdown */}
            <div className="relative" onMouseLeave={() => setIsAboutDropdownOpen(false)}>
              <button
                onMouseEnter={() => setIsAboutDropdownOpen(true)}
                onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  ['about', 'vision-mission', 'beliefs'].includes(currentPage)
                    ? 'text-gold bg-gold/10 font-black'
                    : 'text-stone-700 dark:text-stone-200 hover:text-gold hover:bg-stone-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>About Us</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-gold" />
              </button>

              {isAboutDropdownOpen && (
                <div className="absolute top-full left-0 w-60 py-2 mt-1 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handlePageSelect('about')}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-slate-800 text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-gold" />
                    <div>
                      <div>Our Story & Pastors</div>
                      <div className="text-[10px] text-stone-400">Heart and history of BJC</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePageSelect('vision-mission')}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-slate-800 text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-gold" />
                    <div>
                      <div>Vision & Mission</div>
                      <div className="text-[10px] text-stone-400">God-given calling & values</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePageSelect('beliefs')}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-slate-800 text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-gold" />
                    <div>
                      <div>Our Beliefs</div>
                      <div className="text-[10px] text-stone-400">Biblical statement of faith</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Ministries Dropdown */}
            <div className="relative" onMouseLeave={() => setIsMinistriesDropdownOpen(false)}>
              <button
                onMouseEnter={() => setIsMinistriesDropdownOpen(true)}
                onClick={() => setIsMinistriesDropdownOpen(!isMinistriesDropdownOpen)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  ['ministries', 'life-groups', 'prayer'].includes(currentPage)
                    ? 'text-gold bg-gold/10 font-black'
                    : 'text-stone-700 dark:text-stone-200 hover:text-gold hover:bg-stone-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>Ministries & Fellowship</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {isMinistriesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 py-2 mt-1 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handlePageSelect('ministries')}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-slate-800 text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-purple-500" />
                    <div>
                      <div>Our Ministries</div>
                      <div className="text-[10px] text-stone-400">Worship, Youth, Media, Service</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePageSelect('life-groups')}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-slate-800 text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-amber-500" />
                    <div>
                      <div>Life Groups & Fellowship</div>
                      <div className="text-[10px] text-stone-400">Small groups across Cavite</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePageSelect('prayer')}
                    className="w-full text-left px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-slate-800 text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <div>
                      <div>Prayer & Intercession</div>
                      <div className="text-[10px] text-stone-400">Corporate prayer & requests</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handlePageSelect('events')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'events'
                  ? 'text-gold bg-gold/10 font-black'
                  : 'text-stone-700 dark:text-stone-200 hover:text-gold hover:bg-stone-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Church Events
            </button>

            <button
              onClick={() => handlePageSelect('first-time')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'first-time'
                  ? 'text-gold bg-gold/10 font-black'
                  : 'text-stone-700 dark:text-stone-200 hover:text-gold hover:bg-stone-100 dark:hover:bg-slate-800/60'
              }`}
            >
              First Time Visiting?
            </button>

            <button
              onClick={() => handlePageSelect('contact')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPage === 'contact'
                  ? 'text-gold bg-gold/10 font-black'
                  : 'text-stone-700 dark:text-stone-200 hover:text-gold hover:bg-stone-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Contact & Location
            </button>
          </nav>

          {/* Right Action Controls: Theme + Member Login / Register */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-stone-200/70 dark:border-slate-800 bg-stone-100/90 dark:bg-slate-900 text-stone-600 dark:text-stone-300 hover:text-gold transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600" />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={onGoToApp}
                className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <span className="hidden sm:inline">Back to Member App</span>
                <span className="sm:hidden">App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                {/* Existing Login Button */}
                <button
                  onClick={onOpenLogin}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-stone-300 dark:border-slate-700 hover:border-gold text-stone-800 dark:text-stone-100 font-bold text-xs transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95 shadow-xs shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>Login</span>
                </button>

                {/* Existing Register / Join Us Button (shown on tablet & desktop) */}
                <button
                  onClick={onOpenRegister}
                  className="hidden sm:flex px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold hover:from-amber-400 hover:to-gold text-slate-950 font-extrabold text-xs transition-all items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-95 shadow-sm shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                  <span>Join Us</span>
                </button>
              </>
            )}

            {/* Mobile / Tablet Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-stone-200/70 dark:border-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-900 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-gold" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-b border-stone-200 dark:border-slate-800 bg-white/98 dark:bg-slate-950/98 backdrop-blur-xl px-4 py-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top duration-200">
          
          {/* Top Quick Actions in Drawer */}
          {!isLoggedIn && (
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-stone-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="py-2.5 px-3 rounded-xl border border-stone-300 dark:border-slate-700 font-bold text-xs text-stone-800 dark:text-stone-100 flex items-center justify-center gap-1.5 hover:border-gold transition shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-gold" />
                <span>Member Login</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                <span>Join Church</span>
              </button>
            </div>
          )}
          <div className="space-y-1">
            <button
              onClick={() => handlePageSelect('home')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                currentPage === 'home' ? 'bg-gold/15 text-gold' : 'text-stone-700 dark:text-stone-200'
              }`}
            >
              <span>Home</span>
              <Compass className="w-4 h-4 text-gold" />
            </button>

            <div className="pt-2 pb-1 px-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              About Beholding Jesus
            </div>
            <button
              onClick={() => handlePageSelect('about')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'about' ? 'bg-gold/15 text-gold font-bold' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              About Us & Pastors
            </button>
            <button
              onClick={() => handlePageSelect('vision-mission')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'vision-mission' ? 'bg-gold/15 text-gold font-bold' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Vision and Mission
            </button>
            <button
              onClick={() => handlePageSelect('beliefs')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'beliefs' ? 'bg-gold/15 text-gold font-bold' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Our Beliefs & Doctrine
            </button>

            <div className="pt-2 pb-1 px-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Ministries & Community
            </div>
            <button
              onClick={() => handlePageSelect('ministries')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'ministries' ? 'bg-gold/15 text-gold font-bold' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Our Ministries (Worship, Youth, Media)
            </button>
            <button
              onClick={() => handlePageSelect('life-groups')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'life-groups' ? 'bg-gold/15 text-gold font-bold' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Life Groups & Fellowship
            </button>
            <button
              onClick={() => handlePageSelect('prayer')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'prayer' ? 'bg-gold/15 text-gold font-bold' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Prayer & Intercession
            </button>

            <div className="pt-2 pb-1 px-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Visiting & Location
            </div>
            <button
              onClick={() => handlePageSelect('events')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'events' ? 'bg-gold/15 text-gold font-bold' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Church Events & Schedules
            </button>
            <button
              onClick={() => handlePageSelect('first-time')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'first-time' ? 'bg-gold/15 text-gold font-bold' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              First Time Visiting?
            </button>
            <button
              onClick={() => handlePageSelect('contact')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'contact' ? 'bg-gold/15 text-gold font-bold' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Contact & Location (Cavite)
            </button>
          </div>

          <div className="pt-4 border-t border-stone-200 dark:border-slate-800 space-y-2">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-3 rounded-xl border border-stone-300 dark:border-slate-700 font-bold text-xs text-stone-800 dark:text-stone-100 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-gold" />
                  <span>Member Login</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenRegister();
                  }}
                  className="w-full py-3 rounded-xl bg-gold text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <UserPlus className="w-4 h-4 text-slate-950" />
                  <span>Join Church Family (Register)</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onGoToApp?.();
                }}
                className="w-full py-3 rounded-xl bg-gold text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Go to Member App Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
