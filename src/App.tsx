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
import { LandingPageView } from './features/landing/LandingPageView';
import { ChurchDataStore } from './services/churchDataStore';
import { AuthService } from './services/authService';
import { PresenceService } from './services/presenceService';
import { UserProfile } from './types';

const MAIN_SWIPE_SECTIONS = ['home', 'feed', 'bible', 'stories', 'community', 'ministries', 'profile'];

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => ChurchDataStore.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [bibleTarget, setBibleTarget] = useState<{ bookId: string; chapter: number } | null>(null);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(['home', 'community', currentTab]));
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

  // Real-Time Online Presence Tracking (Part 7, 9, 10)
  useEffect(() => {
    if (currentUser) {
      PresenceService.init(currentUser);
    }
  }, [currentUser]);

  // Keep track of visited tabs to preserve each page's internal state without reload (Part 6)
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(currentTab)) return prev;
      const next = new Set(prev);
      next.add(currentTab);
      return next;
    });
  }, [currentTab]);

  // Strict Authentication Gate:
  // New or unauthenticated users ONLY see the Login or Registration screen.
  // The landing page is shown immediately AFTER registering or logging in.
  if (!currentUser) {
    return (
      <AuthPage 
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setCurrentTab('home'); // First view after login/register is the Landing Page
        }} 
      />
    );
  }

  const isMainSwipeTab = MAIN_SWIPE_SECTIONS.includes(currentTab);

  const renderContent = () => {
    return (
      <>
        {/* Preserved Main Swipe Sections (State remains intact across tab switches) */}
        {visitedTabs.has('home') && (
          <div style={{ display: (currentTab === 'home' || currentTab === 'landing') ? 'block' : 'none' }}>
            <LandingPageView onNavigate={setCurrentTab} currentUser={currentUser} />
          </div>
        )}

        {visitedTabs.has('feed') && (
          <div style={{ display: currentTab === 'feed' ? 'block' : 'none' }}>
            <HomeView onNavigate={setCurrentTab} onOpenQuickAction={() => setCurrentTab('worship')} currentUser={currentUser} />
          </div>
        )}

        {visitedTabs.has('bible') && (
          <div style={{ display: currentTab === 'bible' ? 'block' : 'none' }}>
            <BibleView 
              onNavigate={setCurrentTab} 
              initialBookId={bibleTarget?.bookId}
              initialChapter={bibleTarget?.chapter}
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

        {visitedTabs.has('community') && (
          <div style={{ display: currentTab === 'community' ? 'block' : 'none' }}>
            <CommunityView 
              currentUser={currentUser} 
              onDirectChatStateChange={setIsChatConversationOpen}
              onConversationActiveChange={setIsChatConversationOpen}
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
                case 'worship': return <WorshipView />;
                case 'events': return <EventsView />;
                case 'prayer': return <PrayerFaithView />;
                case 'admin': return <AdminDashboardView />;
                case 'bjc-ai': return <BjcAiView onNavigate={setCurrentTab} currentUser={currentUser} />;
                default: return <LandingPageView onNavigate={setCurrentTab} currentUser={currentUser} />;
              }
            })()}
          </div>
        )}
      </>
    );
  };

  const isInsideChat = currentTab === 'community' && isChatConversationOpen;

  return (
    <AppLayout 
      currentTab={currentTab} 
      onTabChange={setCurrentTab}
      onOpenQuickAction={() => setCurrentTab('worship')}
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
      {/* Floating BJC AI Assistant Button & Widget (Movable & Unobstructive; hidden when inside conversation with someone or GC) */}
      {currentTab !== 'bjc-ai' && !isInsideChat && (
        <BjcAiFloatingButton onOpenFullView={() => setCurrentTab('bjc-ai')} currentTab={currentTab} />
      )}
    </AppLayout>
  );
}

export default App;
