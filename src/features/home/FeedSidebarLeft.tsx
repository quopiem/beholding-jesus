import React from 'react';
import { 
  BookOpen, Music, MessageSquare, Heart, Calendar, 
  Smartphone, Shield, Sparkles, ChevronRight, User, ExternalLink
} from 'lucide-react';
import { UserProfile } from '../../types';
import { isChurchAdmin } from '../../services/churchFeedStore';

interface FeedSidebarLeftProps {
  currentUser: UserProfile;
  onNavigate: (tab: string) => void;
  onOpenDownloadModal: () => void;
  onOpenAdminModeration?: () => void;
}

export const FeedSidebarLeft: React.FC<FeedSidebarLeftProps> = ({
  currentUser,
  onNavigate,
  onOpenDownloadModal,
  onOpenAdminModeration
}) => {
  const isAdmin = isChurchAdmin(currentUser);

  const navigationShortcuts = [
    { id: 'bible', label: 'Holy Bible & Audio', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'songs', label: 'Worship Chords & Keys', icon: Music, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'community', label: 'Community & Messenger', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'prayer', label: 'Prayer & Intercession', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'events', label: 'Weekly Gatherings', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  return (
    <aside className="space-y-4 sticky top-20">
      
      {/* 1. Profile Summary Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-4 shadow-card">
        <div 
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-gold shadow-sm group-hover:scale-105 transition-transform">
            <img 
              src={currentUser.avatar || '/icons/church-logo.png'} 
              alt={currentUser.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-stone-900 dark:text-white truncate group-hover:text-gold transition">
              {currentUser.name}
            </div>
            <div className="text-xs text-gold font-medium truncate">
              {currentUser.roleTitle || 'Church Member'}
            </div>
          </div>
        </div>

        {/* Quick Profile View link */}
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <button 
            onClick={() => onNavigate('profile')}
            className="hover:text-gold transition font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-800 font-mono">
            Active
          </span>
        </div>
      </div>

      {/* 2. Church Community Shortcuts */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-3 shadow-card space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Sanctuary Shortcuts
        </div>

        {navigationShortcuts.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-700 dark:text-stone-200 text-xs font-semibold transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-gold group-hover:translate-x-0.5 transition" />
            </button>
          );
        })}
      </div>

      {/* 3. Senior Pastor Leadership Highlight */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1A1414] via-[#2A1F1F] to-[#120F0F] text-white p-4 border border-gold/30 shadow-card space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gold/50 shadow-md">
            <img 
              src="/images/pastor-john-eric-manjares.png" 
              alt="Pastor John Eric Manjares" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gold tracking-wider">
              Senior Pastor
            </div>
            <div className="font-serif font-bold text-sm text-white">
              John Eric Manjares
            </div>
          </div>
        </div>

        <p className="text-[11px] text-stone-300 italic leading-relaxed">
          &ldquo;Beholding the glory of the Lord, we are being transformed into His same image from glory to glory.&rdquo;
        </p>
      </div>

      {/* 4. Admin Moderation Center (Admin exclusive) */}
      {isAdmin && onOpenAdminModeration && (
        <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-4 shadow-card space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Shield className="w-4 h-4" />
            <span>COMMUNITY MODERATION</span>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-stone-300">
            Review reported community posts, audit logs, and manage member privileges.
          </p>
          <button
            onClick={onOpenAdminModeration}
            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer shadow-xs"
          >
            Open Moderation Center
          </button>
        </div>
      )}

      {/* 5. Mobile App Install Promo */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-4 shadow-card space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gold/20 text-gold flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-stone-900 dark:text-white">
              Get the Mobile App
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400">
              iOS & Android PWA
            </div>
          </div>
        </div>
        <button
          onClick={onOpenDownloadModal}
          className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition cursor-pointer"
        >
          Install to Home Screen
        </button>
      </div>

    </aside>
  );
};
