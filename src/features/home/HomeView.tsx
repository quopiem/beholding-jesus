import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Bell, Heart, BookOpen, Music, Users, Calendar, 
  Filter, Plus, RefreshCw, X, Shield, ArrowUp, ChevronRight,
  Clock, MapPin, Smartphone, Download
} from 'lucide-react';
import { UserProfile, FeedPost, FeedReactionType } from '../../types';
import { ChurchDataStore } from '../../services/churchDataStore';
import { ChurchFeedStore, isChurchAdmin } from '../../services/churchFeedStore';
import { AdminAnnouncementService } from '../../admin/services/adminAnnouncementService';
import { PinnedAnnouncementHero } from './PinnedAnnouncementHero';
import { CreatePostComposer } from './CreatePostComposer';
import { FeedPostCard } from './FeedPostCard';
import { FeedSidebarLeft } from './FeedSidebarLeft';
import { FeedSidebarRight } from './FeedSidebarRight';
import { WhoReactedModal } from './WhoReactedModal';
import { ReportPostModal } from './ReportPostModal';
import { AdminModerationModal } from './AdminModerationModal';
import { DownloadAppModal } from '../../components/DownloadAppModal';
import { CHURCH_INFO } from '../../services/churchInfo';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAction?: (action: string) => void;
  currentUser?: UserProfile;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onNavigate, 
  onOpenQuickAction, 
  currentUser: userProp 
}) => {
  const currentUser: UserProfile = userProp || ChurchDataStore.getCurrentUser() || ChurchDataStore.getRequiredCurrentUser();
  const isAdmin = isChurchAdmin(currentUser);

  // Feed State
  const [posts, setPosts] = useState<FeedPost[]>(() => ChurchFeedStore.getFeedPosts(currentUser));
  const [activeFilter, setActiveFilter] = useState<'all' | 'announcements' | 'testimonies' | 'reflections' | 'my_posts'>('all');
  const [displayCount, setDisplayCount] = useState<number>(8);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Lightbox State
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<string | null>(null);
  const [whoReactedPost, setWhoReactedPost] = useState<FeedPost | null>(null);
  const [reportingPostInfo, setReportingPostInfo] = useState<{
    postId: string;
    commentId?: string | null;
    authorName?: string;
  } | null>(null);
  const [isAdminModerationOpen, setIsAdminModerationOpen] = useState(false);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Sync and Realtime Listener
  const refreshFeed = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await ChurchFeedStore.fetchFeedPostsFromCloud(currentUser);
      setPosts(fresh);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch from Supabase cloud
    ChurchFeedStore.fetchFeedPostsFromCloud(currentUser).then(p => {
      if (p) setPosts(p);
    });

    const handleFeedChange = () => {
      setPosts(ChurchFeedStore.getFeedPosts(currentUser));
      ChurchFeedStore.fetchFeedPostsFromCloud(currentUser).then(p => {
        if (p) setPosts(p);
      });
    };

    const handleWindowFocus = () => {
      ChurchFeedStore.fetchFeedPostsFromCloud(currentUser).then(p => {
        if (p) setPosts(p);
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        ChurchFeedStore.fetchFeedPostsFromCloud(currentUser).then(p => {
          if (p) setPosts(p);
        });
      }
    };

    // 1. Local event & storage listeners
    window.addEventListener('bjc_feed_change', handleFeedChange);
    window.addEventListener('storage', handleFeedChange);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 2. Realtime WebSocket subscription to Supabase cloud
    const unsubscribeRealtime = ChurchFeedStore.subscribeToFeedRealtime((fresh) => {
      if (fresh) setPosts(fresh);
    });

    // 3. 12-second background polling to ensure 100% accuracy across mobile & PC
    const pollTimer = setInterval(() => {
      ChurchFeedStore.fetchFeedPostsFromCloud(currentUser).then(p => {
        if (p) setPosts(p);
      });
    }, 12000);

    return () => {
      window.removeEventListener('bjc_feed_change', handleFeedChange);
      window.removeEventListener('storage', handleFeedChange);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribeRealtime();
      clearInterval(pollTimer);
    };
  }, [currentUser]);

  // Handle Reactions smoothly without full page reload
  const handleReact = (postId: string, reactionType: FeedReactionType) => {
    const updated = ChurchFeedStore.reactToPost(postId, currentUser, reactionType);
    if (updated) {
      setPosts(ChurchFeedStore.getFeedPosts(currentUser));
    }
  };

  // Moderation & Post Actions
  const handleTogglePin = async (post: FeedPost) => {
    if (!isAdmin) return;
    const nextPinned = !post.isPinned;
    await ChurchFeedStore.togglePinAnnouncement(post.id, nextPinned, currentUser);
    try {
      await AdminAnnouncementService.togglePin(post.id, nextPinned);
    } catch {}
    setPosts(ChurchFeedStore.getFeedPosts(currentUser));
  };

  const handleToggleHide = async (post: FeedPost) => {
    if (!isAdmin) return;
    await ChurchFeedStore.setPostHidden(post.id, !post.isHidden, currentUser);
    setPosts(ChurchFeedStore.getFeedPosts(currentUser));
  };

  const handleToggleCommentsEnabled = async (post: FeedPost) => {
    if (!isAdmin) return;
    await ChurchFeedStore.setPostCommentsEnabled(post.id, !post.commentsEnabled, currentUser);
    setPosts(ChurchFeedStore.getFeedPosts(currentUser));
  };

  const handleDeletePost = async (post: FeedPost) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await ChurchFeedStore.deletePost(post.id, currentUser);
      setPosts(ChurchFeedStore.getFeedPosts(currentUser));
    }
  };

  const handleOpenEditModal = (post: FeedPost) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditTitle(post.announcementTitle || '');
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    await ChurchFeedStore.editPost(
      editingPost.id, 
      editContent, 
      undefined, 
      editingPost.postType === 'announcement' ? editTitle : undefined,
      currentUser
    );
    setEditingPost(null);
    setPosts(ChurchFeedStore.getFeedPosts(currentUser));
  };

  // Filter Posts: Strictly pinned announcements only
  const pinnedAnnouncements = posts.filter(p => !p.isHidden && p.postType === 'announcement' && p.isPinned === true && p.announcementPriority === 'pinned');

  const filteredPosts = posts.filter(p => {
    // If regular member, hide hidden posts
    if (!isAdmin && p.isHidden) return false;

    if (activeFilter === 'announcements') {
      return p.postType === 'announcement';
    }
    if (activeFilter === 'testimonies') {
      return p.category === 'Testimony';
    }
    if (activeFilter === 'reflections') {
      return p.category === 'Scripture Reflection' || p.category === 'Bible Verse Reflection';
    }
    if (activeFilter === 'my_posts') {
      return p.authorId === currentUser.id;
    }
    return true; // 'all'
  });

  const visiblePosts = filteredPosts.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B111E] text-stone-900 dark:text-stone-100 transition-colors">
      
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Responsive 3-Column Grid on Desktop / 1-Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ============================================================== */}
          {/* LEFT SIDEBAR (Desktop lg:col-span-3)                           */}
          {/* ============================================================== */}
          <div className="hidden lg:block lg:col-span-3">
            <FeedSidebarLeft 
              currentUser={currentUser}
              onNavigate={onNavigate}
              onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
              onOpenAdminModeration={isAdmin ? () => setIsAdminModerationOpen(true) : undefined}
            />
          </div>

          {/* ============================================================== */}
          {/* CENTER COMMUNITY FEED (lg:col-span-6)                          */}
          {/* ============================================================== */}
          <main className="lg:col-span-6 space-y-6">
            
            {/* MODERN COMMUNITY FEED HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-stone-200/80 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-gold to-amber-200 p-0.5 shadow-sm flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-black text-base sm:text-lg text-stone-900 dark:text-white tracking-wide">
                      Community Feed
                    </h2>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Fellowship
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Testimonies, prayer needs, and pastoral encouragement
                  </p>
                </div>
              </div>

              {/* View Church Landing Page pill */}
              <button
                onClick={() => onNavigate('home')}
                className="px-3.5 py-1.5 rounded-xl border border-gold/30 bg-gold/10 hover:bg-gold/20 text-gold-dark dark:text-gold text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0 shadow-xs active:scale-95"
              >
                <span>Church Home</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. PINNED ANNOUNCEMENT HERO SECTION */}
            <PinnedAnnouncementHero
              pinnedPosts={pinnedAnnouncements}
              currentUser={currentUser}
              onNavigate={onNavigate}
              onOpenCreateAnnouncement={() => setIsCreateAnnouncementOpen(true)}
              onEditPost={handleOpenEditModal}
              onDeletePost={handleDeletePost}
              onTogglePin={handleTogglePin}
              onOpenImageLightbox={(url) => setSelectedLightboxImage(url)}
              onOpenComments={(post) => {
                const el = document.getElementById(`post-${post.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenWhoReacted={(post) => setWhoReactedPost(post)}
              onReact={handleReact}
            />

            {/* 2. CREATE POST COMPOSER */}
            <CreatePostComposer
              currentUser={currentUser}
              onPostCreated={() => {
                setPosts(ChurchFeedStore.getFeedPosts(currentUser));
              }}
            />

            {/* 3. FEED CONTROLS & FILTER TABS */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All Feed', icon: Sparkles },
                  { id: 'announcements', label: 'Announcements', icon: Bell },
                  { id: 'testimonies', label: 'Testimonies', icon: Heart },
                  { id: 'reflections', label: 'Scriptures', icon: BookOpen },
                  { id: 'my_posts', label: 'My Posts', icon: Users }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeFilter === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id as any)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-stone-900 dark:bg-gold text-white dark:text-slate-950 shadow-sm ring-1 ring-gold/40'
                          : 'bg-white/90 dark:bg-slate-900/90 border border-stone-200/80 dark:border-slate-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 hover:border-gold/30'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold dark:text-slate-950' : 'text-stone-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Refresh Button */}
              <button
                onClick={refreshFeed}
                disabled={isRefreshing}
                className="p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-stone-200/80 dark:border-slate-800 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:border-gold/30 transition cursor-pointer shrink-0 shadow-xs active:scale-95"
                title="Refresh Feed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-gold' : ''}`} />
              </button>
            </div>

            {/* 4. DYNAMIC FEED POST LIST */}
            <div className="space-y-4">
              {visiblePosts.length > 0 ? (
                visiblePosts.map(post => (
                  <div key={post.id} id={`post-${post.id}`}>
                    <FeedPostCard
                      post={post}
                      currentUser={currentUser}
                      onReact={handleReact}
                      onOpenImageLightbox={(url) => setSelectedLightboxImage(url)}
                      onOpenWhoReacted={(p) => setWhoReactedPost(p)}
                      onOpenReportModal={(postId, commentId, authorName) => {
                        setReportingPostInfo({ postId, commentId, authorName });
                      }}
                      onEditPost={handleOpenEditModal}
                      onDeletePost={handleDeletePost}
                      onTogglePin={handleTogglePin}
                      onToggleHide={handleToggleHide}
                      onToggleCommentsEnabled={handleToggleCommentsEnabled}
                      onCommentAdded={() => {
                        setPosts(ChurchFeedStore.getFeedPosts(currentUser));
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-stone-200 dark:border-slate-800 p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-stone-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                    No posts in this category yet
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    Share a personal testimony, prayer encouragement, or reflection above to encourage your church family.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination / Load More Posts */}
            {filteredPosts.length > visiblePosts.length && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setDisplayCount(prev => prev + 6)}
                  className="px-6 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-stone-700 dark:text-stone-300 hover:border-gold text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Load More Posts</span>
                  <span className="text-[10px] opacity-70">
                    ({visiblePosts.length} of {filteredPosts.length})
                  </span>
                </button>
              </div>
            )}

          </main>

          {/* ============================================================== */}
          {/* RIGHT SIDEBAR (Desktop lg:col-span-3)                          */}
          {/* ============================================================== */}
          <div className="hidden lg:block lg:col-span-3">
            <FeedSidebarRight 
              onNavigate={onNavigate}
              onOpenBanner={(url) => setSelectedLightboxImage(url)}
            />
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 5. GRAND SACRED FOOTER (Preserved with Institutional Details)   */}
      {/* ============================================================== */}
      <footer className="mt-16 bg-gradient-to-b from-[#111c2e] via-[#0c121e] to-[#070b12] text-white pt-12 pb-16 px-6 sm:px-10 border-t border-[#C5A46D]/30 shadow-2xl">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-8 border-b border-white/10 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-[#C5A46D] via-[#E6CA92] to-[#99793D] shadow-lg shrink-0">
                <img 
                  src="/icons/church-logo.png" 
                  alt="Beholding Jesus Church" 
                  className="w-full h-full rounded-full object-cover bg-white" 
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h3 className="font-serif font-black text-xl sm:text-2xl tracking-wider text-white">
                    BEHOLDING JESUS CHURCH
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#C5A46D]/20 text-[#EADBB8] border border-[#C5A46D]/40 text-[9px] font-bold tracking-widest uppercase hidden sm:inline-block">
                    SANCTUARY
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans tracking-wide max-w-md">
                  &ldquo;And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image.&rdquo; — 2 Cor 3:18
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button 
                onClick={() => onNavigate('bible')}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-gold" />
                <span>Read Scripture</span>
              </button>
              <button 
                onClick={() => onNavigate('community')}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-gold" />
                <span>Messenger Chat</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-300">
            
            {/* Col 1 */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-gold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Mission</span>
              </h4>
              <p className="leading-relaxed text-slate-400">
                To love God passionately, build up one another in grace and truth, and make disciples of all nations through Christ Jesus.
              </p>
              <div className="pt-1 flex items-center gap-2 text-stone-300">
                <span className="text-[11px] font-semibold text-white">Senior Pastor:</span>
                <span className="text-[11px] text-[#EADBB8] font-medium">John Eric Manjares</span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-gold uppercase tracking-wider">
                Explore Sanctuary
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('home')} className="hover:text-gold transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-gold/60" /> Home Sanctuary Feed
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('bible')} className="hover:text-gold transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-gold/60" /> Holy Bible & Audio
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('songs')} className="hover:text-gold transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-gold/60" /> Worship Songs & Chords
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('community')} className="hover:text-gold transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-gold/60" /> Messenger & Groups
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('events')} className="hover:text-gold transition flex items-center gap-1.5 cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-gold/60" /> Events & Gatherings
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-gold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Gathering Times</span>
              </h4>
              <div className="space-y-2 text-slate-400">
                <div>
                  <div className="font-semibold text-white">Sunday Worship Gathering</div>
                  <div>9:00 AM – 11:30 AM • Main Sanctuary</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Youth & NextGen Service</div>
                  <div>Saturday • 4:00 PM</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Midweek Prayer & Intercession</div>
                  <div>Wednesday • 7:00 PM</div>
                </div>
              </div>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-gold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Visit Us</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Beholding Jesus Church Sanctuary<br />
                2nd Flr. MV Villar Ave. Ph2 Central Camella Springville Molino 3, Bacoor, Cavite
              </p>
              <a 
                href="https://maps.google.com/?q=Beholding+Jesus+Church+Camella+Springville+Molino+3+Bacoor+Cavite"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gold border border-gold/30 text-[11px] font-semibold transition"
              >
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span>Open in Google Maps</span>
              </a>
              <div className="pt-1">
                <button
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold hover:bg-[#b09058] text-slate-950 text-[11px] font-bold transition shadow-xs cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Get Mobile App</span>
                </button>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 Beholding Jesus Church. All rights reserved. Built with grace for the body of Christ.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1 text-gold">
                <span>✝️</span> Soli Deo Gloria
              </span>
              <span>•</span>
              <span>Version 3.0.0</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ============================================================== */}
      {/* 6. MODALS & LIGHTBOXES                                          */}
      {/* ============================================================== */}
      
      {/* Image Lightbox Modal */}
      {selectedLightboxImage && (
        <div 
          onClick={() => setSelectedLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = selectedLightboxImage;
                  a.download = `bjc-photo-${Date.now()}.jpg`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#C5A46D] hover:bg-[#d8b982] text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer"
                title="Save Photo to Device"
              >
                <Download className="w-4 h-4" />
                <span>Save Photo</span>
              </button>
              <button
                onClick={() => setSelectedLightboxImage(null)}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={selectedLightboxImage} 
              alt="Full view" 
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Who Reacted Modal */}
      <WhoReactedModal
        post={whoReactedPost}
        onClose={() => setWhoReactedPost(null)}
      />

      {/* Report Post Modal */}
      <ReportPostModal
        reportInfo={reportingPostInfo}
        currentUser={currentUser}
        onClose={() => setReportingPostInfo(null)}
      />

      {/* Admin Moderation Modal */}
      <AdminModerationModal
        currentUser={currentUser}
        isOpen={isAdminModerationOpen}
        onClose={() => setIsAdminModerationOpen(false)}
        onRefreshFeed={() => setPosts(ChurchFeedStore.getFeedPosts(currentUser))}
      />

      {/* Admin Create Announcement Modal */}
      {isCreateAnnouncementOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsCreateAnnouncementOpen(false)}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CreatePostComposer
              currentUser={currentUser}
              isOpenAsModal={true}
              initialPostType="announcement"
              onCloseModal={() => setIsCreateAnnouncementOpen(false)}
              onPostCreated={() => {
                setIsCreateAnnouncementOpen(false);
                setPosts(ChurchFeedStore.getFeedPosts(currentUser));
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingPost(null)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                Edit {editingPost.postType === 'announcement' ? 'Announcement' : 'Post'}
              </h3>
              <button 
                onClick={() => setEditingPost(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editingPost.postType === 'announcement' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Post Content
              </label>
              <textarea
                rows={5}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm text-stone-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-slate-800">
              <button
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-gold text-slate-950 font-bold text-xs shadow-gold hover:bg-gold-light transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download App Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

    </div>
  );
};
