import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Sun, Moon, Search, User, ChevronDown, 
  MapPin, Calendar, Heart, BookOpen, Users, Compass, Sparkles, ArrowRight,
  Clock, ShieldCheck
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

interface SearchItem {
  title: string;
  category: string;
  page: PublicPageId;
  keywords: string;
}

const SEARCH_CATALOG: SearchItem[] = [
  { title: 'Home & Welcome', category: 'General', page: 'home', keywords: 'home welcome church services hours cavite' },
  { title: 'About Us & Senior Pastors', category: 'About', page: 'about', keywords: 'pastor story history founders lead' },
  { title: 'Vision and Mission', category: 'About', page: 'vision-mission', keywords: 'vision mission calling values purpose' },
  { title: 'Statement of Faith & Beliefs', category: 'About', page: 'beliefs', keywords: 'beliefs doctrine bible salvation holy spirit jesus' },
  { title: 'Sunday Worship Service (9:00 AM)', category: 'Schedules', page: 'events', keywords: 'sunday worship 9am gathering service morning' },
  { title: 'Jesus Gen Youth (1:00 PM)', category: 'Schedules', page: 'ministries', keywords: 'youth nextgen 1pm students teenagers discipleship' },
  { title: 'Life Groups & Fellowship', category: 'Ministries', page: 'life-groups', keywords: 'life groups cell group small group fellowship families' },
  { title: 'Prayer & Intercession Altar', category: 'Ministries', page: 'prayer', keywords: 'prayer intercession Friday warfare healing request' },
  { title: 'Ministries (Worship, Media, Ushers)', category: 'Ministries', page: 'ministries', keywords: 'ministries music audio video volunteering serve' },
  { title: 'Church Events Calendar', category: 'Events', page: 'events', keywords: 'calendar events schedules upcoming camp anniversary' },
  { title: 'First Time Visiting Guide', category: 'Visitors', page: 'first-time', keywords: 'first time visitor new guest parking what to wear' },
  { title: 'Sanctuary Location & Contact', category: 'Contact', page: 'contact', keywords: 'location address camella springville molino bacoor contact phone map' },
];

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const handlePageSelect = (page: PublicPageId) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    setIsAboutDropdownOpen(false);
    setIsMinistriesDropdownOpen(false);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredSearchResults = searchQuery.trim() === ''
    ? SEARCH_CATALOG.slice(0, 6)
    : SEARCH_CATALOG.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-2 sm:pt-4 px-3 sm:px-6 pointer-events-none transition-all duration-300">
      
      {/* Floating Glassmorphic Capsule Navbar matching Mockup */}
      <div 
        className={`max-w-7xl mx-auto rounded-full pointer-events-auto transition-all duration-300 ${
          isScrolled
            ? 'bg-[#12100E]/90 dark:bg-[#0B0907]/95 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.7)] py-2 sm:py-2.5 px-3 sm:px-6'
            : 'bg-[#12100E]/80 dark:bg-[#0E0C0A]/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.55)] py-2.5 sm:py-3 px-3 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* 1. Left Brand: Circular Church Seal + Name */}
          <button
            onClick={() => handlePageSelect('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group shrink-0 select-none"
            aria-label="Beholding Jesus Church Home"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/15 border border-white/30 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform shrink-0">
              <img 
                src="/icons/church-seal-gold.png" 
                alt="Beholding Jesus Church" 
                className="w-7 h-7 sm:w-8.5 sm:h-8.5 object-contain drop-shadow brightness-110" 
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif font-black text-xs sm:text-[14px] text-white uppercase tracking-wider group-hover:text-amber-300 transition-colors leading-tight whitespace-nowrap">
                Beholding Jesus
              </span>
              <span className="text-[8px] sm:text-[9.5px] text-[#DDA74F] font-bold tracking-[0.22em] uppercase leading-none mt-0.5 whitespace-nowrap">
                Church • Cavite
              </span>
            </div>
          </button>

          {/* 2. Center Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-3 text-stone-200 shrink-0" aria-label="Public website navigation">
            
            {/* Home with Golden Underline Indicator when active */}
            <button
              onClick={() => handlePageSelect('home')}
              className="relative px-3 py-1.5 text-xs sm:text-[13px] font-semibold tracking-wide transition-colors cursor-pointer group whitespace-nowrap"
            >
              <span className={currentPage === 'home' ? 'text-white font-bold' : 'text-stone-300 hover:text-white'}>
                Home
              </span>
              {currentPage === 'home' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent via-[#DDA74F] to-transparent rounded-full shadow-[0_0_8px_#DDA74F]" />
              )}
            </button>

            {/* About Us Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setIsAboutDropdownOpen(true)}
              onMouseLeave={() => setIsAboutDropdownOpen(false)}
            >
              <button
                onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                className={`relative px-3 py-1.5 text-xs sm:text-[13px] font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  ['about', 'vision-mission', 'beliefs'].includes(currentPage)
                    ? 'text-white font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>About Us</span>
                <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-white transition-transform shrink-0" />
                {['about', 'vision-mission', 'beliefs'].includes(currentPage) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent via-[#DDA74F] to-transparent rounded-full shadow-[0_0_8px_#DDA74F]" />
                )}
              </button>

              {isAboutDropdownOpen && (
                <div className="absolute top-full left-0 w-64 py-2 mt-2 rounded-2xl bg-[#161412]/95 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handlePageSelect('about')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-xs font-semibold text-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#DDA74F]" />
                    <div>
                      <div>Our Story & Pastors</div>
                      <div className="text-[10px] text-stone-400">Heart and history of BJC</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePageSelect('vision-mission')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-xs font-semibold text-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#DDA74F]" />
                    <div>
                      <div>Vision & Mission</div>
                      <div className="text-[10px] text-stone-400">God-given calling & values</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePageSelect('beliefs')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-xs font-semibold text-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#DDA74F]" />
                    <div>
                      <div>Our Beliefs</div>
                      <div className="text-[10px] text-stone-400">Biblical statement of faith</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Ministries & Fellowship Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setIsMinistriesDropdownOpen(true)}
              onMouseLeave={() => setIsMinistriesDropdownOpen(false)}
            >
              <button
                onClick={() => setIsMinistriesDropdownOpen(!isMinistriesDropdownOpen)}
                className={`relative px-3 py-1.5 text-xs sm:text-[13px] font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  ['ministries', 'life-groups', 'prayer'].includes(currentPage)
                    ? 'text-white font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>Ministries & Fellowship</span>
                <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-white transition-transform shrink-0" />
                {['ministries', 'life-groups', 'prayer'].includes(currentPage) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent via-[#DDA74F] to-transparent rounded-full shadow-[0_0_8px_#DDA74F]" />
                )}
              </button>

              {isMinistriesDropdownOpen && (
                <div className="absolute top-full left-0 w-70 py-2 mt-2 rounded-2xl bg-[#161412]/95 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handlePageSelect('ministries')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-xs font-semibold text-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    <div>
                      <div>Our Ministries</div>
                      <div className="text-[10px] text-stone-400">Worship, Youth, Media, Service</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePageSelect('life-groups')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-xs font-semibold text-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-[#DDA74F]" />
                    <div>
                      <div>Life Groups & Fellowship</div>
                      <div className="text-[10px] text-stone-400">Small groups across Cavite</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handlePageSelect('prayer')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-xs font-semibold text-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <div>
                      <div>Prayer & Intercession</div>
                      <div className="text-[10px] text-stone-400">Corporate prayer & requests</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Church Events */}
            <button
              onClick={() => handlePageSelect('events')}
              className="relative px-3 py-1.5 text-xs sm:text-[13px] font-semibold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className={currentPage === 'events' ? 'text-white font-bold' : 'text-stone-300 hover:text-white'}>
                Church Events
              </span>
              {currentPage === 'events' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent via-[#DDA74F] to-transparent rounded-full shadow-[0_0_8px_#DDA74F]" />
              )}
            </button>

            {/* First Time Visiting? */}
            <button
              onClick={() => handlePageSelect('first-time')}
              className="relative px-3 py-1.5 text-xs sm:text-[13px] font-semibold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className={currentPage === 'first-time' ? 'text-white font-bold' : 'text-stone-300 hover:text-white'}>
                First Time Visiting?
              </span>
              {currentPage === 'first-time' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent via-[#DDA74F] to-transparent rounded-full shadow-[0_0_8px_#DDA74F]" />
              )}
            </button>

            {/* Contact & Location */}
            <button
              onClick={() => handlePageSelect('contact')}
              className="relative px-3 py-1.5 text-xs sm:text-[13px] font-semibold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className={currentPage === 'contact' ? 'text-white font-bold' : 'text-stone-300 hover:text-white'}>
                Contact & Location
              </span>
              {currentPage === 'contact' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent via-[#DDA74F] to-transparent rounded-full shadow-[0_0_8px_#DDA74F]" />
              )}
            </button>
          </nav>

          {/* 3. Right Action Controls: Search + Login Pill + Join Us Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-stone-200 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Quick Search"
              aria-label="Search website"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Theme Toggle (Subtle Dark/Light switch) */}
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-stone-200 hover:text-amber-300 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-stone-300" />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={onGoToApp}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-[#DDA74F] via-[#F4C978] to-[#DDA74F] hover:from-[#F4C978] hover:to-[#DDA74F] text-stone-950 font-bold text-xs shadow-[0_4px_16px_rgba(221,167,79,0.35)] transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              >
                <span className="hidden sm:inline">Back to Member App</span>
                <span className="sm:hidden">App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                {/* Login Pill matching Mockup (User Icon + "Login") */}
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/12 text-white font-semibold text-xs sm:text-[13px] transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shadow-xs shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-stone-200 shrink-0" />
                  <span>Login</span>
                </button>

                {/* Join Us → Warm Golden Gradient Pill matching Mockup */}
                <button
                  onClick={onOpenRegister}
                  className="px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-gradient-to-r from-[#DDA74F] via-[#F4C978] to-[#DDA74F] hover:from-[#F4C978] hover:to-[#DDA74F] text-stone-950 font-black text-xs sm:text-[13px] transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(221,167,79,0.35)] shrink-0"
                >
                  <span>Join Us</span>
                  <span className="text-xs">→</span>
                </button>
              </>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 bg-white/5 text-stone-200 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-[#DDA74F]" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* Quick Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 pointer-events-auto bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-[#161412] border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#DDA74F] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, ministries, teachings, beliefs, locations..."
                className="w-full bg-transparent text-white placeholder-stone-400 text-sm focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageSelect(item.page)}
                    className="w-full text-left p-3 rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-stone-100 group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-stone-400">{item.category}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-[#DDA74F] group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-stone-400">
                  No matching results found for &ldquo;{searchQuery}&rdquo;. Try another term.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-3 pointer-events-auto rounded-3xl bg-[#12100E]/98 backdrop-blur-2xl border border-white/15 p-5 space-y-4 max-h-[82vh] overflow-y-auto shadow-2xl animate-in slide-in-from-top duration-200">
          
          {!isLoggedIn && (
            <div className="grid grid-cols-2 gap-2.5 pb-3 border-b border-white/10">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="py-2.5 px-3 rounded-full border border-white/20 bg-white/5 font-bold text-xs text-stone-200 flex items-center justify-center gap-1.5 hover:border-[#DDA74F] transition"
              >
                <User className="w-3.5 h-3.5 text-[#DDA74F]" />
                <span>Member Login</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="py-2.5 px-3 rounded-full bg-gradient-to-r from-[#DDA74F] via-[#F4C978] to-[#DDA74F] text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 transition"
              >
                <span>Join Us →</span>
              </button>
            </div>
          )}

          <div className="space-y-1 text-stone-200">
            <button
              onClick={() => handlePageSelect('home')}
              className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between ${
                currentPage === 'home' ? 'bg-white/15 text-[#DDA74F]' : 'hover:bg-white/5'
              }`}
            >
              <span>Home</span>
              <Compass className="w-4 h-4 text-[#DDA74F]" />
            </button>

            <div className="pt-2 pb-1 px-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              About Beholding Jesus
            </div>
            <button
              onClick={() => handlePageSelect('about')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'about' ? 'bg-white/10 text-[#DDA74F]' : 'hover:bg-white/5'
              }`}
            >
              About Us & Pastors
            </button>
            <button
              onClick={() => handlePageSelect('vision-mission')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'vision-mission' ? 'bg-white/10 text-[#DDA74F]' : 'hover:bg-white/5'
              }`}
            >
              Vision and Mission
            </button>
            <button
              onClick={() => handlePageSelect('beliefs')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'beliefs' ? 'bg-white/10 text-[#DDA74F]' : 'hover:bg-white/5'
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
                currentPage === 'ministries' ? 'bg-white/10 text-[#DDA74F]' : 'hover:bg-white/5'
              }`}
            >
              Our Ministries (Worship, Youth, Media)
            </button>
            <button
              onClick={() => handlePageSelect('life-groups')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'life-groups' ? 'bg-white/10 text-[#DDA74F]' : 'hover:bg-white/5'
              }`}
            >
              Life Groups & Fellowship
            </button>
            <button
              onClick={() => handlePageSelect('prayer')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'prayer' ? 'bg-white/10 text-[#DDA74F]' : 'hover:bg-white/5'
              }`}
            >
              Prayer & Intercession Altar
            </button>

            <div className="pt-2 pb-1 px-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Visiting & Location
            </div>
            <button
              onClick={() => handlePageSelect('events')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'events' ? 'bg-white/10 text-[#DDA74F]' : 'hover:bg-white/5'
              }`}
            >
              Church Events & Schedules
            </button>
            <button
              onClick={() => handlePageSelect('first-time')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'first-time' ? 'bg-white/10 text-[#DDA74F]' : 'hover:bg-white/5'
              }`}
            >
              First Time Visiting?
            </button>
            <button
              onClick={() => handlePageSelect('contact')}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-semibold ${
                currentPage === 'contact' ? 'bg-white/10 text-[#DDA74F]' : 'hover:bg-white/5'
              }`}
            >
              Contact & Location (Cavite)
            </button>
          </div>

          <div className="pt-3 border-t border-white/10">
            {isLoggedIn && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onGoToApp?.();
                }}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#DDA74F] via-[#F4C978] to-[#DDA74F] text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <span>Go to Member App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
