import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Megaphone, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Plus, 
  ArrowRight, 
  Eye, 
  Edit3, 
  Sparkles, 
  TrendingUp,
  AlertTriangle,
  Layers,
  FileText
} from 'lucide-react';
import { AdminAnnouncement, AdminAuditLog, AdminDashboardStats } from '../types';
import { AdminAnnouncementService } from '../services/adminAnnouncementService';

interface AdminDashboardHomeProps {
  onNavigateToAnnouncements: () => void;
  onNavigateToMembers: () => void;
  onNavigateToAudit: () => void;
  onOpenCreateModal: () => void;
  onEditAnnouncement: (announcement: AdminAnnouncement) => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  onNavigateToAnnouncements,
  onNavigateToMembers,
  onNavigateToAudit,
  onOpenCreateModal,
  onEditAnnouncement
}) => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalMembers: 0,
    totalAnnouncements: 0,
    publishedCount: 0,
    draftCount: 0,
    scheduledCount: 0,
    upcomingEventsCount: 0
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [recentLogs, setRecentLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, allAnnouncements, logsData] = await Promise.all([
        AdminAnnouncementService.getDashboardStats(),
        AdminAnnouncementService.getAllAnnouncements(),
        AdminAnnouncementService.getAuditLogs()
      ]);
      setStats(statsData);
      setRecentAnnouncements(allAnnouncements.slice(0, 5));
      setRecentLogs(logsData.slice(0, 6));
    } catch (err) {
      console.error('Error loading dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (item: AdminAnnouncement) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    await AdminAnnouncementService.saveAnnouncement({
      id: item.id,
      status: nextStatus
    });
    await loadData();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8C5858] via-[#754444] to-[#4A2B2B] text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-medium border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Official BJC Super Admin Console</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, Super Admin
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Manage announcements, media, and member broadcasts for the Beholding Jesus Church community. Any changes you publish will immediately synchronize to the member application landing page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#8C5858] hover:bg-[#F8F3F0] font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Announcement</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Members */}
        <div 
          onClick={onNavigateToMembers}
          className="bg-white p-5 rounded-2xl border border-[#E8DBD4] shadow-xs hover:border-[#8C5858]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#78716E] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Members</span>
            <div className="p-2 rounded-xl bg-[#F8F3F0] text-[#8C5858] group-hover:bg-[#8C5858] group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1D1D]">
            {loading ? '-' : stats.totalMembers}
          </div>
          <div className="text-[11px] text-[#78716E] mt-1 flex items-center gap-1">
            <span>Registered in Supabase</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Total Announcements */}
        <div 
          onClick={onNavigateToAnnouncements}
          className="bg-white p-5 rounded-2xl border border-[#E8DBD4] shadow-xs hover:border-[#8C5858]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#78716E] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <div className="p-2 rounded-xl bg-[#F8F3F0] text-[#8C5858] group-hover:bg-[#8C5858] group-hover:text-white transition-colors">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1D1D]">
            {loading ? '-' : stats.totalAnnouncements}
          </div>
          <div className="text-[11px] text-[#78716E] mt-1 flex items-center gap-1">
            <span>All Announcements</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Published */}
        <div 
          onClick={onNavigateToAnnouncements}
          className="bg-white p-5 rounded-2xl border border-[#E8DBD4] shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#78716E] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-800">
            {loading ? '-' : stats.publishedCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Live on Landing Page
          </div>
        </div>

        {/* Drafts */}
        <div 
          onClick={onNavigateToAnnouncements}
          className="bg-white p-5 rounded-2xl border border-[#E8DBD4] shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#78716E] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-800">
            {loading ? '-' : stats.draftCount}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Hidden from Members
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-[#E8DBD4] shadow-xs">
          <div className="flex items-center justify-between text-[#78716E] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Events</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-sky-900">
            {loading ? '-' : stats.upcomingEventsCount}
          </div>
          <div className="text-[11px] text-[#78716E] mt-1">
            Sunday & Ministry Dates
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Announcements + Audit Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Announcements Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1F1D1D]">Recent Announcements</h2>
              <p className="text-xs text-[#78716E]">Fast publish/unpublish toggle or edit</p>
            </div>
            <button
              onClick={onNavigateToAnnouncements}
              className="text-xs font-semibold text-[#8C5858] hover:text-[#5F3A3A] flex items-center gap-1"
            >
              <span>View All ({stats.totalAnnouncements})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DBD4] shadow-xs divide-y divide-[#EFE6E1] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#78716E]">
                <div className="w-6 h-6 border-2 border-[#8C5858] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading announcements...
              </div>
            ) : recentAnnouncements.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <Megaphone className="w-10 h-10 text-[#C4B7B0] mx-auto" />
                <div className="text-sm font-semibold text-[#1F1D1D]">No announcements yet</div>
                <p className="text-xs text-[#78716E] max-w-sm mx-auto">
                  Click the button below to create your very first church announcement with cover photo.
                </p>
                <button
                  onClick={onOpenCreateModal}
                  className="px-4 py-2 bg-[#8C5858] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Create Announcement
                </button>
              </div>
            ) : (
              recentAnnouncements.map((item) => {
                const isPublished = item.status === 'published';
                const hasCover = !!(item.image_url || item.cover_image);

                return (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF6F3] transition-colors">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#F5ECE8] border border-[#E8DBD4] shrink-0 overflow-hidden flex items-center justify-center">
                        {hasCover ? (
                          <img 
                            src={item.image_url || item.cover_image} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Megaphone className="w-6 h-6 text-[#8C5858]/60" />
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {isPublished ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                            {item.status}
                          </span>

                          <span className="text-[10px] font-semibold text-[#8C5858] bg-[#F5ECE8] px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>

                          {item.priority === 'pinned' && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                              Pinned
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-sm text-[#1F1D1D] truncate">
                          {item.title}
                        </h3>

                        <p className="text-xs text-[#78716E] line-clamp-1">
                          {item.description || item.content}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isPublished
                            ? 'bg-white hover:bg-amber-50 text-[#78716E] hover:text-amber-700 border-[#E8DBD4]'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                        }`}
                        title={isPublished ? 'Unpublish and set to draft' : 'Publish immediately to landing page'}
                      >
                        {isPublished ? 'Set to Draft' : 'Publish Now'}
                      </button>

                      <button
                        onClick={() => onEditAnnouncement(item)}
                        className="p-1.5 rounded-lg text-[#5C5654] hover:text-[#1F1D1D] hover:bg-[#EBDCD5]/40 border border-[#E8DBD4]"
                        title="Edit Announcement"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Admin Activities / Audit Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1F1D1D]">Admin Audit Logs</h2>
              <p className="text-xs text-[#78716E]">Recorded administrative actions</p>
            </div>
            <button
              onClick={onNavigateToAudit}
              className="text-xs font-semibold text-[#8C5858] hover:text-[#5F3A3A] flex items-center gap-1"
            >
              <span>View Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DBD4] shadow-xs p-4 sm:p-5 space-y-4">
            {recentLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#78716E]">
                No recent activity logged.
              </div>
            ) : (
              recentLogs.map((log) => {
                const timeAgo = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <div key={log.id} className="flex items-start gap-3 text-xs pb-3 border-b border-[#F5ECE8] last:border-0 last:pb-0">
                    <div className="w-7 h-7 rounded-lg bg-[#FAF6F3] border border-[#E8DBD4] text-[#8C5858] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1F1D1D] truncate">
                        {log.details}
                      </div>
                      <div className="text-[11px] text-[#8C8380] flex items-center justify-between mt-0.5">
                        <span>by {log.performed_by_name}</span>
                        <span>{dateStr} &bull; {timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Help Box */}
          <div className="p-4 rounded-2xl bg-[#FAF6F3] border border-[#EBDCD5] space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-xs text-[#8C5858]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Landing Page Sync</span>
            </div>
            <p className="text-[11px] text-[#6B6360] leading-relaxed">
              When you publish an announcement, regular members visiting <strong className="text-[#1F1D1D]">bjcchurch.com</strong> will see it immediately without refreshing. Drafts remain securely visible only to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
