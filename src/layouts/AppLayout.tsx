import React, { useState, useEffect } from 'react';
import { 
  Home, BookOpen, MessageSquare, Users, Music, Calendar, 
  Heart, Shield, Bell, Moon, Sun, Search, Menu, X, 
  Sparkles, CheckCircle2, ChevronRight, ChevronDown, MapPin, ExternalLink, Plus,
  UserPlus, LogIn, LogOut, KeyRound, UserCheck, User, HandHeart, Compass
} from 'lucide-react';
import { ChurchDataStore } from '../services/churchDataStore';
import { AuthService } from '../services/authService';
import { CHURCH_INFO } from '../services/churchInfo';
import { AuthModal } from '../features/auth/AuthModal';
import { UserProfile, UserRole, NotificationItem } from '../types';

interface AppLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
  onOpenQuickAction?: (action: string) => void;
  currentUser?: UserProfile;
  onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onTabChange,
  children,
  onOpenQuickAction,
  currentUser: currentUserProp,
  onLogout
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return currentUserProp || ChurchDataStore.getCurrentUser() || ChurchDataStore.getRequiredCurrentUser();
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('bjc_theme') === 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'recovery'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => ChurchDataStore.getNotifications());
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleNotifs = () => {
      setNotifications(ChurchDataStore.getNotifications());
    };
    window.addEventListener('bjc_notifications_change', handleNotifs);
    window.addEventListener('storage', handleNotifs);
    return () => {
      window.removeEventListener('bjc_notifications_change', handleNotifs);
      window.removeEventListener('storage', handleNotifs);
    };
  }, []);

  useEffect(() => {
    if (currentUserProp) {
      setCurrentUser(currentUserProp);
    } else {
      const u = ChurchDataStore.getCurrentUser() || ChurchDataStore.getRequiredCurrentUser();
      setCurrentUser(u);
    }
  }, [currentUserProp]);

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setCurrentUser(authenticatedUser);
    ChurchDataStore.setCurrentUser(authenticatedUser.id);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      AuthService.logout();
    }
    setIsRolePickerOpen(false);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bjc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bjc_theme', 'light');
    }
  }, [isDarkMode]);

  const [unreadChatCount, setUnreadChatCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('bjc_unread_chat_count');
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleCount = (e: any) => {
      setUnreadChatCount(e.detail?.count || 0);
    };
    window.addEventListener('bjc_unread_chat_count', handleCount);
    return () => window.removeEventListener('bjc_unread_chat_count', handleCount);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    const users = ChurchDataStore.getUsers();
    const targetUser = users.find(u => u.role === role) || users[0];
    ChurchDataStore.setCurrentUser(targetUser.id);
    setCurrentUser(targetUser);
    setIsRolePickerOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'feed', label: 'Community Feed', icon: Sparkles },
    { id: 'bjc-ai', label: 'BJC AI', icon: Compass },
    { id: 'bible', label: 'Bible', icon: BookOpen },
    { 
      id: 'community', 
      label: 'Fellowship', 
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? (unreadChatCount > 99 ? '99+' : String(unreadChatCount)) : undefined,
      isCountBadge: true
    },
    { id: 'ministries', label: 'Ministries', icon: Users },
    { id: 'worship', label: 'Worship Hub', icon: Music, badge: 'VOCAL KEYS' },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'prayer', label: 'Prayer & Faith', icon: Heart },
  ];

  const canAccessAdmin = ['super_admin', 'church_admin', 'pastor', 'ministry_leader'].includes(currentUser.role);

  return (
    <div className="min-h-screen bg-[#F6F3EE] dark:bg-[#0c0e14] flex flex-col md:flex-row text-stone-800 dark:text-stone-100 transition-colors duration-200">
      
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR NAVIGATION */}
      {/* ============================================================== */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#FAF8F5] dark:bg-slate-900 border-r border-stone-200/70 dark:border-slate-800 shrink-0 sticky top-0 h-screen z-30">
        
        {/* Church Brand Header with Crest & 3-line Title */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('home')}>
            <img 
              src="/icons/church-seal-gold.png" 
              alt="Beholding Jesus Church" 
              className="w-10 h-10 object-contain drop-shadow-sm shrink-0" 
            />
            <div>
              <h1 className="font-serif font-bold text-sm lg:text-base leading-tight tracking-wider text-[#1e293b] dark:text-white uppercase">
                Beholding Jesus
              </h1>
              <div className="text-[10px] tracking-[0.25em] font-semibold text-slate-400 dark:text-slate-500 uppercase leading-tight">
                Church
              </div>
              <div className="text-[9px] font-bold tracking-wider text-gold dark:text-gold-300 uppercase leading-tight mt-0.5">
                {CHURCH_INFO.primaryMotto}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group relative cursor-pointer active:scale-[0.98] ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#1e293b] to-[#293b54] dark:from-slate-800 dark:to-slate-800/90 text-white shadow-soft font-semibold border-l-[3.5px] border-gold pl-3' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-stone-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${isActive ? 'text-gold' : 'text-slate-400 dark:text-slate-500 group-hover:text-gold'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-transform group-hover:scale-105 ${
                    (item as any).isCountBadge
                      ? 'bg-[#c5a46d] text-slate-950'
                      : isActive 
                        ? 'bg-gold/30 text-gold-200 text-[9px] uppercase' 
                        : 'bg-gold-50 dark:bg-slate-800 text-gold-dark dark:text-gold border border-gold/30 text-[9px] uppercase'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Admin Dashboard Entry */}
          {canAccessAdmin && (
            <div className="pt-3">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Administration
              </div>
              <button
                onClick={() => onTabChange('admin')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  currentTab === 'admin'
                    ? 'bg-[#1e293b] dark:bg-slate-800 text-white shadow-soft font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Admin Console</span>
                </div>
                <span className="text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  RBAC
                </span>
              </button>

              {currentUser.role === 'super_admin' && (
                <a
                  href="/admin.html"
                  className="mt-1.5 w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8C5858] dark:text-[#E8DBD4] bg-[#F8F3F0] dark:bg-slate-800/80 border border-[#EBDCD5] dark:border-slate-700 hover:bg-[#F0E6E1] dark:hover:bg-slate-700 transition-all"
                  title="Open Dedicated Admin Dashboard (admin.bjcchurch.com)"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dedicated Admin Site</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </nav>

        {/* Inspirational Psalm 46:10 Sidebar Card (Exact Match to Screenshot) */}
        <div className="mx-3 mb-2 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-slate-200/80 dark:border-slate-800">
          <img 
            src="/images/sidebar-psalm-card.png" 
            alt="Be still, and know that I am God - Psalm 46:10" 
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" 
          />
        </div>

        {/* User Profile Bar (Exact Match: Avatar with green dot + Name + Active • Member + ChevronDown) */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mx-3 mb-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="relative">
            <button
              onClick={() => setIsRolePickerOpen(!isRolePickerOpen)}
              className="w-full flex items-center justify-between p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="relative shrink-0">
                  <img 
                    src={currentUser.avatar || '/icons/church-logo.png'} 
                    alt={currentUser.name} 
                    className="w-9 h-9 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700" 
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>{currentUser.roleTitle}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Role dropdown switcher & Authentication controls */}
            {isRolePickerOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-700 z-50 text-xs space-y-2.5">
                <div className="px-1 py-0.5 font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider text-[10px] flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-1.5">
                  <span>Current Account</span>
                  <Sparkles className="w-3 h-3 text-gold" />
                </div>

                {/* Authenticated Account Info Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/50 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-gold font-medium">
                    @{currentUser.username || 'member'} • {currentUser.roleTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser.email}
                  </div>
                </div>

                {/* Profile Shortcut */}
                <button
                  onClick={() => { onTabChange('profile'); setIsRolePickerOpen(false); }}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-gold/10 text-slate-800 dark:text-white transition font-medium"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-gold" />
                    <span>View Member Profile</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Auth Actions: Register & Sign In / Sign Out */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                  <button
                    onClick={() => {
                      setIsRolePickerOpen(false);
                      setAuthModalTab('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition text-[11px] font-semibold"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Register New Member</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsRolePickerOpen(false);
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition text-[11px] font-semibold"
                  >
                    <LogIn className="w-3.5 h-3.5 text-gold" />
                    <span>Switch / Sign In Account</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-[11px] font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar (Shown exclusively on Feed as requested to maximize full screen in Bible, Community, etc.) */}
        {currentTab === 'feed' && (
          <header className="sticky top-0 z-20 bg-[#FAF8F5]/90 dark:bg-[#0c0e14]/90 backdrop-blur-xl border-b border-stone-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
            
            {/* Mobile brand & toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-slate-800 text-stone-700 dark:text-stone-300 transition"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 stroke-[2]" />}
              </button>

              <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onTabChange('home')}>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-0.5 bg-gradient-to-tr from-gold to-amber-200 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  <img src="/icons/church-logo.png" alt="BJC" className="w-full h-full rounded-full object-cover bg-white" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-serif font-black text-sm sm:text-base tracking-wider text-slate-900 dark:text-white">
                      BEHOLDING JESUS
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gold/15 text-gold-dark dark:text-gold font-bold tracking-widest uppercase border border-gold/30 hidden sm:inline-block">
                      CHURCH
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-sans tracking-tight mt-0.5 hidden xs:block">
                    Grace • Fellowship • Truth
                  </span>
                </div>
              </div>

              {/* Desktop Status Pill */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100/90 dark:bg-slate-800/70 border border-stone-200/70 dark:border-slate-700/60 text-xs ml-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium text-stone-700 dark:text-stone-300">Sanctuary Fellowship Active</span>
              </div>
            </div>

            {/* Right Controls: Search, Theme, Notifications, Profile (Exact Match to Mockup) */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Search Pill Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-700 transition"
                title="Search"
              >
                <Search className="w-4 h-4 stroke-[2]" />
              </button>

              {/* Dark Mode Moon Button */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-700 transition"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 stroke-[2]" /> : <Moon className="w-4 h-4 stroke-[2]" />}
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    const nextState = !isNotifOpen;
                    setIsNotifOpen(nextState);
                    if (nextState && unreadNotifCount > 0) {
                      ChurchDataStore.markAllNotificationsRead();
                      setNotifications(ChurchDataStore.getNotifications());
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-stone-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-700 relative transition"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 stroke-[2]" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-xs"></span>
                  )}
                </button>

                {/* Notifications Popover */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-semibold text-sm">Notifications</div>
                      <div className="flex items-center gap-3">
                        {unreadNotifCount > 0 && (
                          <button
                            onClick={() => {
                              ChurchDataStore.markAllNotificationsRead();
                              setNotifications(ChurchDataStore.getNotifications());
                            }}
                            className="text-xs text-gold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={() => {
                              ChurchDataStore.clearNotifications();
                              setNotifications([]);
                            }}
                            className="text-xs text-slate-400 hover:text-rose-500 transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No notifications right now.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              if (n.linkRoute) onTabChange(n.linkRoute);
                              setIsNotifOpen(false);
                            }}
                            className={`py-3 px-2 rounded-lg cursor-pointer transition ${n.isRead ? 'opacity-70' : 'bg-gold/5 dark:bg-slate-800/40'}`}
                          >
                            <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                              <span>{n.title}</span>
                              {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Avatar on Far Right */}
              <button
                onClick={() => onTabChange('profile')}
                className="w-9 h-9 rounded-full overflow-hidden border border-stone-300 dark:border-slate-600 shadow-2xs shrink-0 hover:ring-2 hover:ring-gold/40 transition"
                title={`${currentUser.name} (${currentUser.roleTitle})`}
              >
                <img 
                  src={currentUser.avatar || '/icons/church-logo.png'} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover" 
                />
              </button>
            </div>
          </header>
        )}

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                    currentTab === item.id 
                      ? 'bg-[#1e293b] text-white font-semibold' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            {canAccessAdmin && (
              <>
                <button
                  onClick={() => {
                    onTabChange('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Console</span>
                </button>

                {currentUser.role === 'super_admin' && (
                  <a
                    href="/admin.html"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#8C5858] bg-[#F8F3F0] dark:bg-slate-800/80 border border-[#EBDCD5] dark:border-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Dedicated Admin Site</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </>
            )}

            {/* Mobile Sanctuary Info & Sign Out */}
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <a
                href={CHURCH_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    <span>Church Sanctuary</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{CHURCH_INFO.shortAddress}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out (@{currentUser.username || 'member'})</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Global Search Modal */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Bible verses, songs, vocal keys, events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 text-xs text-slate-500 space-y-2">
                <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider px-2">Quick Shortcuts</div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { onTabChange('bible'); setIsSearchOpen(false); }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Bible Reader</div>
                      <div className="text-[10px]">Read Scripture</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => { onTabChange('worship'); setIsSearchOpen(false); }}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center gap-2"
                  >
                    <Music className="w-4 h-4 text-gold" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Song Keys</div>
                      <div className="text-[10px]">Worship songs</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-x-hidden ${currentTab === 'home' || currentTab === 'feed' ? 'pb-24 md:pb-6' : 'pb-16 md:pb-0'}`}>
          <div key={currentTab} className="animate-fade-in">
            {children}
          </div>
        </main>

        {/* ============================================================== */}
        {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom on phones) */}
        {/* ============================================================== */}
        <nav className="fixed bottom-0 left-0 right-0 z-[999999] pointer-events-auto bg-[#FAF8F5]/92 dark:bg-[#0c0e14]/92 backdrop-blur-xl border-t border-stone-200/80 dark:border-slate-800/80 md:hidden flex items-center justify-around px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] safe-bottom">
          {([
            { id: 'home', label: 'Home', icon: Home },
            { id: 'feed', label: 'Feed', icon: Sparkles },
            { id: 'bible', label: 'Bible', icon: BookOpen },
            { 
              id: 'community', 
              label: 'Fellowship', 
              icon: MessageSquare,
              badge: unreadChatCount > 0 ? (unreadChatCount > 99 ? '99+' : String(unreadChatCount)) : undefined
            },
            { id: 'profile', label: 'Profile', icon: User }
          ] as Array<{ id: string; label: string; icon: any; badge?: string }>).map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-300 relative active:scale-90 ${
                  isActive 
                    ? 'text-stone-950 dark:text-gold font-bold bg-stone-900/5 dark:bg-gold/10' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'stroke-[2.5] text-stone-950 dark:text-gold -translate-y-0.5 scale-110' : 'stroke-[1.8]'}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-md shadow-amber-500/30 ring-1 ring-white dark:ring-slate-900 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 font-medium tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-gold mt-0.5 shadow-[0_0_6px_rgba(197,164,109,0.7)] animate-fade-in"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialTab={authModalTab}
        />

      </div>
    </div>
  );
};
