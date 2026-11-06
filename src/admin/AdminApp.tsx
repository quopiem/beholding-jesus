import React, { useState, useEffect } from 'react';
import { AdminAuthService } from './services/adminAuthService';
import { AdminUser, AdminAnnouncement } from './types';
import { AdminLayout, AdminViewType } from './components/AdminLayout';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminDashboardHome } from './components/AdminDashboardHome';
import { AdminAnnouncementManager } from './components/AdminAnnouncementManager';
import { AdminMembersView } from './components/AdminMembersView';
import { AdminAuditLogsView } from './components/AdminAuditLogsView';
import { AdminSetupView } from './components/AdminSetupView';
import { AdminMinistryRequestsView } from './components/AdminMinistryRequestsView';
import { AdminAccountRecoveryView } from './components/AdminAccountRecoveryView';

export const AdminApp: React.FC = () => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [currentView, setCurrentView] = useState<AdminViewType>('dashboard');
  const [initialEditItem, setInitialEditItem] = useState<AdminAnnouncement | null>(null);
  const [openCreateFlag, setOpenCreateFlag] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check existing Super Admin session
    const active = AdminAuthService.getCurrentAdmin();
    setCurrentAdmin(active);
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentAdmin(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    AdminAuthService.logout();
    setCurrentAdmin(null);
  };

  const handleGoToMemberApp = () => {
    // Navigate to member app root
    window.location.href = '/';
  };

  const handleEditFromDashboard = (item: AdminAnnouncement) => {
    setInitialEditItem(item);
    setCurrentView('announcements');
  };

  const handleCreateFromDashboard = () => {
    setOpenCreateFlag(true);
    setInitialEditItem(null);
    setCurrentView('announcements');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F3F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8C5858] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentAdmin) {
    return (
      <AdminLoginView 
        onLoginSuccess={handleLoginSuccess}
        onGoToMemberApp={handleGoToMemberApp}
      />
    );
  }

  return (
    <AdminLayout
      currentAdmin={currentAdmin}
      currentView={currentView}
      onSelectView={(v) => {
        setCurrentView(v);
        setInitialEditItem(null);
        setOpenCreateFlag(false);
      }}
      onLogout={handleLogout}
      onGoToMemberApp={handleGoToMemberApp}
    >
      {currentView === 'dashboard' && (
        <AdminDashboardHome
          onNavigateToAnnouncements={() => setCurrentView('announcements')}
          onNavigateToMembers={() => setCurrentView('members')}
          onNavigateToAudit={() => setCurrentView('audit')}
          onNavigateToRequests={() => setCurrentView('requests')}
          onNavigateToRecovery={() => setCurrentView('recovery')}
          onOpenCreateModal={handleCreateFromDashboard}
          onEditAnnouncement={handleEditFromDashboard}
        />
      )}

      {currentView === 'requests' && (
        <AdminMinistryRequestsView />
      )}

      {currentView === 'recovery' && (
        <AdminAccountRecoveryView />
      )}

      {currentView === 'announcements' && (
        <AdminAnnouncementManager
          initialEditItem={initialEditItem}
          onClearInitialEdit={() => setInitialEditItem(null)}
          openCreateOnMount={openCreateFlag}
        />
      )}

      {currentView === 'members' && (
        <AdminMembersView />
      )}

      {currentView === 'audit' && (
        <AdminAuditLogsView />
      )}

      {currentView === 'setup' && (
        <AdminSetupView />
      )}
    </AdminLayout>
  );
};
