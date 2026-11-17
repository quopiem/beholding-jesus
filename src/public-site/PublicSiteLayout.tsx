import React, { useState, useEffect } from 'react';
import { PublicPageId } from './types';
import { PublicNavbar } from './components/PublicNavbar';
import { PublicFooter } from './components/PublicFooter';

import { PublicHomePage } from './pages/PublicHomePage';
import { PublicAboutPage } from './pages/PublicAboutPage';
import { PublicVisionMissionPage } from './pages/PublicVisionMissionPage';
import { PublicBeliefsPage } from './pages/PublicBeliefsPage';
import { PublicMinistriesPage } from './pages/PublicMinistriesPage';
import { PublicLifeGroupsPage } from './pages/PublicLifeGroupsPage';
import { PublicPrayerPage } from './pages/PublicPrayerPage';
import { PublicEventsPage } from './pages/PublicEventsPage';
import { PublicFirstTimePage } from './pages/PublicFirstTimePage';
import { PublicContactPage } from './pages/PublicContactPage';

interface PublicSiteLayoutProps {
  initialPage?: PublicPageId;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  isLoggedIn?: boolean;
  onGoToApp?: () => void;
}

export const PublicSiteLayout: React.FC<PublicSiteLayoutProps> = ({
  initialPage = 'home',
  onOpenLogin,
  onOpenRegister,
  isLoggedIn = false,
  onGoToApp
}) => {
  const [currentPage, setCurrentPage] = useState<PublicPageId>(initialPage);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('bjc_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bjc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bjc_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleNavigate = (page: PublicPageId) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <PublicHomePage
            onNavigate={handleNavigate}
            onOpenLogin={onOpenLogin}
            onOpenRegister={onOpenRegister}
          />
        );
      case 'about':
        return (
          <PublicAboutPage
            onNavigate={handleNavigate}
            onOpenLogin={onOpenLogin}
            onOpenRegister={onOpenRegister}
          />
        );
      case 'vision-mission':
        return (
          <PublicVisionMissionPage
            onNavigate={handleNavigate}
            onOpenRegister={onOpenRegister}
          />
        );
      case 'beliefs':
        return (
          <PublicBeliefsPage
            onNavigate={handleNavigate}
            onOpenLogin={onOpenLogin}
          />
        );
      case 'ministries':
        return (
          <PublicMinistriesPage
            onNavigate={handleNavigate}
            onOpenRegister={onOpenRegister}
            onOpenLogin={onOpenLogin}
          />
        );
      case 'life-groups':
        return (
          <PublicLifeGroupsPage
            onNavigate={handleNavigate}
            onOpenRegister={onOpenRegister}
            onOpenLogin={onOpenLogin}
          />
        );
      case 'prayer':
        return (
          <PublicPrayerPage
            onNavigate={handleNavigate}
            onOpenRegister={onOpenRegister}
            onOpenLogin={onOpenLogin}
          />
        );
      case 'events':
        return (
          <PublicEventsPage
            onNavigate={handleNavigate}
            onOpenLogin={onOpenLogin}
            onOpenRegister={onOpenRegister}
          />
        );
      case 'first-time':
        return (
          <PublicFirstTimePage
            onNavigate={handleNavigate}
            onOpenRegister={onOpenRegister}
          />
        );
      case 'contact':
        return (
          <PublicContactPage
            onNavigate={handleNavigate}
            onOpenLogin={onOpenLogin}
            onOpenRegister={onOpenRegister}
          />
        );
      default:
        return (
          <PublicHomePage
            onNavigate={handleNavigate}
            onOpenLogin={onOpenLogin}
            onOpenRegister={onOpenRegister}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex flex-col transition-colors duration-200">
      
      {/* Dedicated Public Navbar */}
      <PublicNavbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        isLoggedIn={isLoggedIn}
        onGoToApp={onGoToApp}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {renderActivePage()}
      </main>

      {/* Dedicated Public Footer */}
      <PublicFooter
        onNavigate={handleNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
      />

    </div>
  );
};
