import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Shield, Flag, Eye, EyeOff, Trash2, CheckCircle2, 
  AlertTriangle, Clock, UserX, UserCheck, MessageSquareOff
} from 'lucide-react';
import { UserProfile, FeedPost, PostReport, ModerationAuditLog } from '../../types';
import { ChurchFeedStore } from '../../services/churchFeedStore';
import { ChurchDataStore } from '../../services/churchDataStore';

interface AdminModerationModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onRefreshFeed: () => void;
}

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onRefreshFeed
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'hidden' | 'logs'>('reports');
  const [reports, setReports] = useState<PostReport[]>(() => ChurchFeedStore.getReports());
  const [auditLogs, setAuditLogs] = useState<ModerationAuditLog[]>(() => ChurchFeedStore.getAuditLogs());

  if (!isOpen || typeof document === 'undefined') return null;

  const allPosts = ChurchFeedStore.getFeedPosts(currentUser);
  const hiddenPosts = allPosts.filter(p => p.isHidden);

  const handleDismissReport = (reportId: string) => {
    ChurchFeedStore.updateReportStatus(reportId, 'dismissed', currentUser);
    setReports(ChurchFeedStore.getReports());
  };

  const handleHideReportedPost = (postId: string, reportId: string) => {
    ChurchFeedStore.setPostHidden(postId, true, currentUser, 'Report reviewed by admin');
    ChurchFeedStore.updateReportStatus(reportId, 'reviewed', currentUser);
    setReports(ChurchFeedStore.getReports());
    onRefreshFeed();
  };

  const handleDeleteReportedPost = (postId: string, reportId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this reported post?')) {
      ChurchFeedStore.deletePost(postId, currentUser);
      ChurchFeedStore.updateReportStatus(reportId, 'reviewed', currentUser);
      setReports(ChurchFeedStore.getReports());
      onRefreshFeed();
    }
  };

  const handleRestorePost = (postId: string) => {
    ChurchFeedStore.setPostHidden(postId, false, currentUser, 'Restored by admin');
    onRefreshFeed();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-[max(env(safe-area-inset-top),16px)] pb-[max(env(safe-area-inset-bottom),16px)] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2.5rem)] sm:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                Church Community Moderation Center
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Authorized for Pastoral Leadership & Administrators
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-stone-100 dark:border-slate-800 flex items-center gap-2">
          {[
            { id: 'reports', label: 'Reported Content', count: reports.filter(r => r.status === 'pending').length },
            { id: 'hidden', label: 'Hidden Posts', count: hiddenPosts.length },
            { id: 'logs', label: 'Audit Trail', count: auditLogs.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-gold text-gold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-gold text-slate-950' : 'bg-stone-100 dark:bg-slate-800 text-stone-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          
          {/* TAB 1: REPORTED CONTENT */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {reports.length > 0 ? (
                reports.map(rep => {
                  const targetPost = allPosts.find(p => p.id === rep.postId);
                  const isPending = rep.status === 'pending';

                  return (
                    <div 
                      key={rep.id} 
                      className={`p-4 rounded-2xl border space-y-2.5 transition ${
                        isPending 
                          ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20' 
                          : 'border-stone-200 dark:border-slate-800 bg-stone-50/40 dark:bg-slate-800/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px]">
                            {rep.reason.replace(/_/g, ' ')}
                          </span>
                          <span className="text-stone-400">•</span>
                          <span className="text-stone-500">Reported by {rep.reporterName}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isPending ? 'bg-rose-500 text-white' : 'bg-stone-200 dark:bg-slate-700 text-stone-600 dark:text-stone-300'
                        }`}>
                          {rep.status}
                        </span>
                      </div>

                      {rep.reasonText && (
                        <p className="text-xs text-stone-700 dark:text-stone-300 italic bg-white dark:bg-slate-900 p-2 rounded-xl border border-stone-200 dark:border-slate-700">
                          &ldquo;{rep.reasonText}&rdquo;
                        </p>
                      )}

                      {/* Post Preview */}
                      {targetPost ? (
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs space-y-1">
                          <div className="font-bold text-stone-900 dark:text-white">
                            Post by {targetPost.authorName} ({targetPost.authorRole}):
                          </div>
                          <p className="text-stone-600 dark:text-stone-300 line-clamp-2">
                            {targetPost.content}
                          </p>
                        </div>
                      ) : (
                        <div className="text-xs text-stone-400 italic">
                          (Target post was already deleted)
                        </div>
                      )}

                      {/* Moderation Actions */}
                      {isPending && targetPost && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleDismissReport(rep.id)}
                            className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-600 dark:text-stone-300 text-xs font-semibold cursor-pointer"
                          >
                            Dismiss Report
                          </button>
                          <button
                            onClick={() => handleHideReportedPost(targetPost.id, rep.id)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            Hide Post
                          </button>
                          <button
                            onClick={() => handleDeleteReportedPost(targetPost.id, rep.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Delete Post
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-stone-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-stone-700 dark:text-stone-300">All Clean!</p>
                  <p>No community posts or comments currently reported.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HIDDEN POSTS */}
          {activeTab === 'hidden' && (
            <div className="space-y-3">
              {hiddenPosts.length > 0 ? (
                hiddenPosts.map(post => (
                  <div key={post.id} className="p-4 rounded-2xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 dark:text-white">
                        {post.authorName} ({post.authorRole})
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleRestorePost(post.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Restore to Feed</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-stone-400">
                  No hidden posts.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL */}
          {activeTab === 'logs' && (
            <div className="space-y-2">
              {auditLogs.length > 0 ? (
                auditLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl border border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-white">
                        {log.adminName} performed <span className="text-gold uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</span>
                      </div>
                      {log.reason && (
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                          Reason: {log.reason}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-stone-400">
                  No audit logs recorded yet.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
};
