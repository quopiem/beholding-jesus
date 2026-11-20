import React, { useState, useEffect } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { HomeView } from './features/home/HomeView';
import { BibleView } from './features/bible/BibleView';
import { BibleStoriesView } from './features/bible/BibleStoriesView';
import { WorshipView } from './features/worship/WorshipView';
import { CommunityView } from './features/chat/CommunityView';
import { MinistriesView } from './features/ministries/MinistriesView';
import { EventsView } from './features/events/EventsView';
import { PrayerFaithView } from './features/prayer/PrayerFaithView';
import { AdminDashboardView } from './features/admin/AdminDashboardView';
import { ProfileView } from './pages/ProfileView';
import { BjcAiView } from './features/ai/BjcAiView';
import { BjcAiFloatingButton } from './features/ai/BjcAiFloatingButton';
import { AuthPage } from './features/auth/AuthPage';
import { PublicSiteLayout } from './public-site';
import { ChurchDataStore } from './services/churchDataStore';
import { AuthService } from './services/authService';
import { PresenceService } from './services/presenceService';
import { UserProfile } from './types';

const MAIN_SWIPE_SECTIONS = ['feed', 'fellowship', 'messages', 'bible', 'stories', 'ministries', 'profile'];

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => ChurchDataStore.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [unauthView, setUnauthView] = useState<'public' | 'login' | 'register'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#login') return 'login';
      if (window.location.hash === '#register') return 'register';
    }
    return 'public';
  });
  const [bibleTarget, setBibleTarget] = useState<{ bookId: string; chapter: number } | null>(null);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(['feed', 'fellowship', 'messages', currentTab]));
  const [isChatConversationOpen, setIsChatConversationOpen] = useState(false);

  useEffect(() => {
    const handleChatState = (e: any) => {
      setIsChatConversationOpen(Boolean(e.detail?.isOpen));
    };
    window.addEventListener('bjc_chat_conversation_view', handleChatState);
    window.addEventListener('bjc_direct_chat_view', handleChatState);
    return () => {
      window.removeEventListener('bjc_chat_conversation_view', handleChatState);
      window.removeEventListener('bjc_direct_chat_view', handleChatState);
    };
  }, []);

  useEffect(() => {
    AuthService.initializeDefaultCredentials();
    ChurchDataStore.fetchUsersFromCloud();
    ChurchDataStore.syncCurrentUserFromCloud();
    ChurchDataStore.fetchJoinRequestsFromCloud(true);

    const handleAuthChange = () => {
      const u = ChurchDataStore.getCurrentUser();
      setCurrentUser(u);
    };

    window.addEventListener('bjc_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('bjc_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Real-Time Online Presence Tracking
  useEffect(() => {
    if (currentUser) {
      PresenceService.init(currentUser);
    }
  }, [currentUser]);

  // Keep track of visited tabs to preserve each page's internal state without reload
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(currentTab)) return prev;
      const next = new Set(prev);
      next.add(currentTab);
      return next;
    });
  }, [currentTab]);

  // Tab change handler with smooth auto-scroll to Web Push Settings
  const handleTabChange = (tab: string) => {
    if (tab === 'web-push' || tab === 'notifications' || tab === 'push-settings') {
      setCurrentTab('profile');
      setTimeout(() => {
        const el = document.getElementById('web-push-settings');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.classList.add('ring-2', 'ring-gold');
        setTimeout(() => el?.classList.remove('ring-2', 'ring-gold'), 2500);
      }, 150);
      return;
    }
    setCurrentTab(tab);
  };

  // Deep-Link URL navigation handler for Push Notifications and internal routes
  const handleNavigateToUrl = (targetUrl: string) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const parsed = new URL(targetUrl, origin);
      const tab = parsed.searchParams.get('tab');
      const room = parsed.searchParams.get('room');
      const postId = parsed.searchParams.get('postId');
      const eventId = parsed.searchParams.get('eventId');

      if (room) {
        try { localStorage.setItem('bjc_last_active_room_id', room); } catch {}
      }
      if (postId) {
        try { localStorage.setItem('bjc_highlight_post_id', postId); } catch {}
      }
      if (eventId) {
        try { localStorage.setItem('bjc_selected_event_id', eventId); } catch {}
      }

      if (tab) {
        handleTabChange(tab);
      } else if (room) {
        setCurrentTab('fellowship');
      }
    } catch {
      // Fallback: simple tab routing
      if (targetUrl.includes('tab=')) {
        const match = targetUrl.match(/tab=([a-z0-9_-]+)/i);
        if (match?.[1]) handleTabChange(match[1]);
      }
    }
  };

  // Push Notification Click & Deep Link Router with Authentication Destination Preservation
  useEffect(() => {
    const handlePushNavigate = (e: any) => {
      const url = e.detail?.url;
      if (!url) return;

      if (!currentUser) {
        try {
          sessionStorage.setItem('bjc_redirect_after_auth', url);
        } catch {}
        setUnauthView('login');
      } else {
        handleNavigateToUrl(url);
      }
    };

    window.addEventListener('bjc_push_navigate', handlePushNavigate);

    // Check deep link parameters in window location on load
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const targetTab = params.get('tab');
      if (targetTab) {
        if (!currentUser) {
          try {
            sessionStorage.setItem('bjc_redirect_after_auth', window.location.search);
          } catch {}
          setUnauthView('login');
        } else {
          handleNavigateToUrl(window.location.search);
        }
      }
    }

    return () => {
      window.removeEventListener('bjc_push_navigate', handlePushNavigate);
    };
  }, [currentUser]);

  // Public Church Website & Authentication Gateway:
  // Unauthenticated visitors land on the Public Church Website (Home, About, Beliefs, etc.).
  // Clicking "Login" or "Join Us" transitions smoothly to the existing AuthPage.
  if (!currentUser) {
    if (unauthView === 'login' || unauthView === 'register') {
      return (
        <AuthPage 
          initialTab={unauthView}
          onBackToPublic={() => setUnauthView('public')}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            // Restore intended destination if arriving from a Push Notification or deep link
            let restoredTab = 'feed';
            try {
              const pendingRedirect = sessionStorage.getItem('bjc_redirect_after_auth');
              if (pendingRedirect) {
                sessionStorage.removeItem('bjc_redirect_after_auth');
                handleNavigateToUrl(pendingRedirect);
                return;
              }
            } catch {}
            setCurrentTab(restoredTab); // Land on Community Feed by default
          }} 
        />
      );
    }

    return (
      <PublicSiteLayout
        onOpenLogin={() => setUnauthView('login')}
        onOpenRegister={() => setUnauthView('register')}
      />
    );
  }

  // Authenticated Member viewing Public Website / Landing Page
  if (currentUser && (currentTab === 'public-website' || currentTab === 'home' || currentTab === 'landing')) {
    return (
      <PublicSiteLayout
        isLoggedIn={true}
        onGoToApp={() => setCurrentTab('feed')}
        onOpenLogin={() => {}}
        onOpenRegister={() => {}}
      />
    );
  }

  const isMainSwipeTab = MAIN_SWIPE_SECTIONS.includes(currentTab);

  const renderContent = () => {
    return (
      <>
        {/* Preserved Main Swipe Sections (State remains intact across tab switches) */}
        {visitedTabs.has('feed') && (
          <div style={{ display: (currentTab === 'feed' || currentTab === 'home' || currentTab === 'landing') ? 'block' : 'none' }}>
            <HomeView onNavigate={setCurrentTab} onOpenQuickAction={() => setCurrentTab('feed')} currentUser={currentUser} />
          </div>
        )}

        {visitedTabs.has('bible') && (
          <div style={{ display: currentTab === 'bible' ? 'block' : 'none' }}>
            <BibleView 
              onNavigate={setCurrentTab} 
              initialBookId={bibleTarget?.bookId}
              initialChapter={bibleTarget?.chapter}
              isActive={currentTab === 'bible'}
            />
          </div>
        )}

        {visitedTabs.has('stories') && (
          <div style={{ display: currentTab === 'stories' ? 'block' : 'none' }}>
            <BibleStoriesView 
              onNavigate={setCurrentTab} 
              onOpenInFullBible={(bookId, chapter) => {
                setBibleTarget({ bookId, chapter });
                setCurrentTab('bible');
              }}
            />
          </div>
        )}

        {(visitedTabs.has('fellowship') || visitedTabs.has('messages') || visitedTabs.has('community')) && (
          <div style={{ display: (currentTab === 'fellowship' || currentTab === 'messages' || currentTab === 'community') ? 'block' : 'none' }}>
            <CommunityView 
              currentUser={currentUser} 
              initialFilter={currentTab === 'fellowship' ? 'groups' : currentTab === 'messages' ? 'direct' : 'all'}
              onDirectChatStateChange={setIsChatConversationOpen}
              onConversationActiveChange={setIsChatConversationOpen}
              onNavigate={setCurrentTab}
            />
          </div>
        )}

        {visitedTabs.has('ministries') && (
          <div style={{ display: currentTab === 'ministries' ? 'block' : 'none' }}>
            <MinistriesView currentUser={currentUser} onNavigate={setCurrentTab} />
          </div>
        )}

        {visitedTabs.has('profile') && (
          <div style={{ display: currentTab === 'profile' ? 'block' : 'none' }}>
            <ProfileView 
              currentUser={currentUser} 
              onNavigate={setCurrentTab}
              onLogout={() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                PresenceService.cleanup();
                AuthService.logout();
                setCurrentUser(null);
              }}
            />
          </div>
        )}

        {/* Specialized Secondary Modules (Rendered when active) */}
        {!isMainSwipeTab && (
          <div className="w-full">
            {(() => {
              switch (currentTab) {
                case 'events': return <EventsView />;
                case 'admin': return <AdminDashboardView />;
                case 'bjc-ai': return <BjcAiView onNavigate={setCurrentTab} currentUser={currentUser} />;
                default: return <HomeView onNavigate={setCurrentTab} onOpenQuickAction={() => setCurrentTab('feed')} currentUser={currentUser} />;
              }
            })()}
          </div>
        )}
      </>
    );
  };

  const isInsideChat = (currentTab === 'community' || currentTab === 'fellowship' || currentTab === 'messages') && isChatConversationOpen;

  return (
    <>
      <AppLayout 
        currentTab={currentTab} 
        onTabChange={handleTabChange}
        onOpenQuickAction={() => setCurrentTab('feed')}
        currentUser={currentUser}
        isChatConversationOpen={isInsideChat}
        onLogout={() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          PresenceService.cleanup();
          AuthService.logout();
          setCurrentUser(null);
        }}
      >
        {renderContent()}
      </AppLayout>

      {/* Floating BJC AI Assistant Button & Widget (Movable across entire screen; accessible throughout authenticated app including Bible, hidden only when inside active 1-on-1 or group chat) */}
      {currentTab !== 'bjc-ai' && !isInsideChat && (
        <BjcAiFloatingButton 
          onOpenFullView={() => setCurrentTab('bjc-ai')} 
          currentTab={currentTab}
          isHiddenInChat={isInsideChat}
        />
      )}
    </>
  );
}

export default App;
