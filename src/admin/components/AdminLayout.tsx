import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Database, 
  Menu, 
  X, 
  ShieldCheck,
  Calendar,
  Sparkles,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { AdminUser } from '../types';
import { ChurchDataStore } from '../../services/churchDataStore';
import { AuthService } from '../../services/authService';

export type AdminViewType = 'dashboard' | 'announcements' | 'members' | 'requests' | 'recovery' | 'audit' | 'setup';

interface AdminLayoutProps {
  currentAdmin: AdminUser;
  currentView: AdminViewType;
  onSelectView: (view: AdminViewType) => void;
  onLogout: () => void;
  onGoToMemberApp: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdmin,
  currentView,
  onSelectView,
  onLogout,
  onGoToMemberApp,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingMinistryCount, setPendingMinistryCount] = useState(0);
  const [pendingRecoveryCount, setPendingRecoveryCount] = useState(0);

  const updateCounts = async () => {
    try {
      const [joins, users, recs] = await Promise.all([
        ChurchDataStore.fetchJoinRequestsFromCloud(),
        ChurchDataStore.fetchUsersFromCloud(),
        AuthService.fetchRecoveryRequestsFromCloud()
      ]);
      const pendingReg = ChurchDataStore.getPendingMinistryRegistrations().length;
      const pendingJoin = joins ? joins.filter(j => j.status === 'pending').length : 0;
      setPendingMinistryCount(pendingReg + pendingJoin);

      const pendingRec = recs ? recs.filter(r => r.status === 'pending').length : 0;
      setPendingRecoveryCount(pendingRec);
    } catch {
      // fallback
      const pendingReg = ChurchDataStore.getPendingMinistryRegistrations().length;
      const pendingJoin = ChurchDataStore.getJoinRequests().filter(j => j.status === 'pending').length;
      setPendingMinistryCount(pendingReg + pendingJoin);
      setPendingRecoveryCount(AuthService.getRecoveryRequests().filter(r => r.status === 'pending').length);
    }
  };

  useEffect(() => {
    updateCounts();
    const interval = setInterval(updateCounts, 20000);

    const handleSync = () => updateCounts();
    window.addEventListener('bjc_join_requests_change', handleSync);
    window.addEventListener('bjc_recovery_change', handleSync);
    window.addEventListener('bjc_users_change', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('bjc_join_requests_change', handleSync);
      window.removeEventListener('bjc_recovery_change', handleSync);
      window.removeEventListener('bjc_users_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const navItems: { id: AdminViewType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { 
      id: 'requests', 
      label: 'Ministry Approvals', 
      icon: <UserCheck className="w-4 h-4" />,
      badge: pendingMinistryCount > 0 ? pendingMinistryCount : undefined
    },
    { 
      id: 'recovery', 
      label: 'Account Recovery', 
      icon: <KeyRound className="w-4 h-4" />,
      badge: pendingRecoveryCount > 0 ? pendingRecoveryCount : undefined
    },
    { id: 'announcements', label: 'Announcements CMS', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'members', label: 'Church Members', icon: <Users className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Trail', icon: <FileText className="w-4 h-4" /> },
    { id: 'setup', label: 'Cloud & Netlify Setup', icon: <Database className="w-4 h-4" /> }
  ];

  const handleNavClick = (view: AdminViewType) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F3F0] text-[#1F1D1D] flex flex-col font-sans selection:bg-[#EBDCD5] selection:text-[#1F1D1D]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EBDCD5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#5C5654] hover:bg-[#F5ECE8]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectView('dashboard')}>
              <img 
                src="/icons/icon-192.png" 
                alt="BJC Logo" 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#8C5858]/30 shadow-xs"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif tracking-wide font-bold text-sm sm:text-base text-[#1F1D1D]">
                    Beholding Jesus Church
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8C5858]/10 text-[#8C5858] border border-[#8C5858]/20">
                    <ShieldCheck className="w-3 h-3" />
                    Super Admin
                  </span>
                </div>
                <div className="text-[11px] text-[#78716E] hidden sm:block">
                  Dedicated Administrator Console &bull; Supabase Cloud
                </div>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Supabase Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Connected</span>
            </div>

            {/* Visit Member App Link */}
            <button
              onClick={onGoToMemberApp}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5654] hover:text-[#1F1D1D] px-3 py-1.5 rounded-lg border border-[#EBDCD5] hover:bg-[#FDFBF9] transition-all"
              title="Open the Member Application Landing Page"
            >
              <span>Member App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Admin Profile & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#EBDCD5]">
              <div className="w-8 h-8 rounded-full bg-[#EBDCD5] text-[#8C5858] flex items-center justify-center font-bold text-xs border border-[#D9C4BA] overflow-hidden">
                {currentAdmin.avatar ? (
                  <img src={currentAdmin.avatar} alt={currentAdmin.name} className="w-full h-full object-cover" />
                ) : (
                  currentAdmin.name.charAt(0)
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-[#1F1D1D] truncate max-w-[130px]">
                  {currentAdmin.name}
                </div>
                <div className="text-[10px] text-[#78716E]">
                  @{currentAdmin.username}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 text-[#78716E] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-1"
                title="Sign out of Admin Dashboard"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Sub-Nav Header Tabs */}
        <div className="hidden md:block border-t border-[#EFE6E1] bg-[#FAF6F3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 py-1">
            {navItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-[#8C5858] shadow-xs border border-[#E8DBD4]'
                      : 'text-[#6B6360] hover:text-[#1F1D1D] hover:bg-white/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#8C5858] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EBDCD5] px-4 py-3 space-y-1 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  active
                    ? 'bg-[#F5ECE8] text-[#8C5858]'
                    : 'text-[#5C5654] hover:bg-[#F8F3F0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#8C5858] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#EFE6E1]">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-[#EBDCD5] bg-white py-4 text-center text-xs text-[#78716E]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} Beholding Jesus Church &mdash; Designated Super Admin Console
          </div>
          <div className="text-[11px] text-[#A09894]">
            Connected to Supabase Project: <code className="bg-[#FAF7F5] px-1.5 py-0.5 rounded border border-[#EBDCD5] text-[#5C5654]">szsjuyncsmiliatuvnsf</code>
          </div>
        </div>
      </footer>
    </div>
  );
};
