import React, { useState, useEffect } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { HomeView } from './features/home/HomeView';
import { BibleView } from './features/bible/BibleView';
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
import { UserProfile } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => ChurchDataStore.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authViewMode, setAuthViewMode] = useState<'landing' | 'auth'>('landing');

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

  // For unauthenticated visitors: Show the official Church Landing Page
  // or the Sign In / Registration portal
  if (!currentUser) {
    if (authViewMode === 'auth') {
      return (
        <AuthPage 
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setCurrentTab('home');
            setAuthViewMode('landing');
          }} 
          onBackToLanding={() => setAuthViewMode('landing')}
        />
      );
    }

    return (
      <LandingPageView
        onNavigate={(tab) => {
          if (tab === 'home') {
            setAuthViewMode('auth');
          } else {
            setAuthViewMode('auth');
          }
        }}
        onOpenAuth={() => setAuthViewMode('auth')}
      />
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <LandingPageView onNavigate={setCurrentTab} currentUser={currentUser} />;
      case 'feed':
        return <HomeView onNavigate={setCurrentTab} onOpenQuickAction={() => setCurrentTab('worship')} currentUser={currentUser} />;
      case 'landing':
        return <LandingPageView onNavigate={setCurrentTab} currentUser={currentUser} />;
      case 'bible':
        return <BibleView onNavigate={setCurrentTab} />;
      case 'worship':
        return <WorshipView />;
      case 'community':
        return <CommunityView currentUser={currentUser} />;
      case 'ministries':
        return <MinistriesView />;
      case 'events':
        return <EventsView />;
      case 'prayer':
        return <PrayerFaithView />;
      case 'admin':
        return <AdminDashboardView />;
      case 'profile':
        return <ProfileView currentUser={currentUser} />;
      case 'bjc-ai':
        return <BjcAiView onNavigate={setCurrentTab} currentUser={currentUser} />;
      default:
        return <LandingPageView onNavigate={setCurrentTab} currentUser={currentUser} />;
    }
  };

  return (
    <AppLayout 
      currentTab={currentTab} 
      onTabChange={setCurrentTab}
      onOpenQuickAction={() => setCurrentTab('worship')}
      currentUser={currentUser}
      onLogout={() => {
        AuthService.logout();
        setCurrentUser(null);
      }}
    >
      {renderContent()}
      {/* Floating BJC AI Assistant Button & Widget (Movable & Unobstructive) */}
      {currentTab !== 'bjc-ai' && (
        <BjcAiFloatingButton onOpenFullView={() => setCurrentTab('bjc-ai')} currentTab={currentTab} />
      )}
    </AppLayout>
  );
}

export default App;
