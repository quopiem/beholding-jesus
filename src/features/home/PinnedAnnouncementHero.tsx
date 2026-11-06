import React, { useState } from 'react';
import { 
  Bell, Pin, Calendar, Clock, MapPin, ArrowRight, Maximize2, 
  Plus, Edit3, Trash2, PinOff, Heart, MessageSquare, ChevronLeft, ChevronRight,
  ShieldCheck, Share2, Sparkles
} from 'lucide-react';
import { FeedPost, UserProfile, FEED_REACTIONS, FeedReactionType } from '../../types';
import { isChurchAdmin, ChurchFeedStore } from '../../services/churchFeedStore';

interface PinnedAnnouncementHeroProps {
  pinnedPosts: FeedPost[];
  currentUser: UserProfile;
  onNavigate: (tab: string) => void;
  onOpenCreateAnnouncement: () => void;
  onEditPost: (post: FeedPost) => void;
  onDeletePost: (post: FeedPost) => void;
  onTogglePin: (post: FeedPost) => void;
  onOpenImageLightbox: (imageUrl: string) => void;
  onOpenComments: (post: FeedPost) => void;
  onOpenWhoReacted: (post: FeedPost) => void;
  onReact: (postId: string, reactionType: FeedReactionType) => void;
}

export const PinnedAnnouncementHero: React.FC<PinnedAnnouncementHeroProps> = ({
  pinnedPosts,
  currentUser,
  onNavigate,
  onOpenCreateAnnouncement,
  onEditPost,
  onDeletePost,
  onTogglePin,
  onOpenImageLightbox,
  onOpenComments,
  onOpenWhoReacted,
  onReact
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReactionHovered, setIsReactionHovered] = useState(false);
  const isAdmin = isChurchAdmin(currentUser);

  if (pinnedPosts.length === 0) {
    if (!isAdmin) return null;

    // Admin empty state prompt to pin an announcement
    return (
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#1C1616] via-[#2A1F1F] to-[#120F0F] text-white border border-[#C5A46D]/30 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/40">
            <Pin className="w-6 h-6 rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                Pastoral Administration
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-white">
              No Pinned Announcement Active
            </h3>
            <p className="text-xs text-stone-300">
              Pin an official pastoral message, upcoming church event, or sermon series to highlight it here.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateAnnouncement}
          className="px-4 py-2 rounded-xl bg-gold text-slate-950 font-bold text-xs hover:bg-gold-light transition shadow-gold flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Publish Pinned Announcement</span>
        </button>
      </div>
    );
  }

  const activeIndex = Math.min(currentIndex, pinnedPosts.length - 1);
  const currentAnnouncement = pinnedPosts[activeIndex];
  const coverImage = currentAnnouncement.imageUrls && currentAnnouncement.imageUrls.length > 0 
    ? currentAnnouncement.imageUrls[0] 
    : undefined;

  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % pinnedPosts.length);
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + pinnedPosts.length) % pinnedPosts.length);

  const userReactionMeta = currentAnnouncement.userReaction ? FEED_REACTIONS[currentAnnouncement.userReaction] : null;

  return (
    <section className="relative group/hero">
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[32px] p-6 sm:p-8 bg-gradient-to-br from-[#1A1414] via-[#261C1C] to-[#110E0E] text-white border-2 border-[#C5A46D]/50 shadow-2xl">
        
        {/* Background Atmospheric Glows */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#8C5858]/20 blur-3xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 w-80 h-80 rounded-full bg-[#C5A46D]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          
          {/* Top Bar: PINNED Label, Admin Controls & Multi-post Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#C5A46D] to-[#E6CA92] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                <Pin className="w-3.5 h-3.5 rotate-45 fill-current" />
                <span>PINNED ANNOUNCEMENT</span>
              </span>

              <span className="text-xs text-gold/90 font-medium hidden sm:inline">
                Official Pastoral Word
              </span>

              {pinnedPosts.length > 1 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-mono">
                  {activeIndex + 1} of {pinnedPosts.length}
                </span>
              )}
            </div>

            {/* Right Header: Admin actions & Slide arrows */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => onTogglePin(currentAnnouncement)}
                    className="p-1 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer"
                    title="Unpin Announcement"
                  >
                    <PinOff className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEditPost(currentAnnouncement)}
                    className="p-1 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer"
                    title="Edit Announcement"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePost(currentAnnouncement)}
                    className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {pinnedPosts.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevSlide}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="Previous Pinned"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="Next Pinned"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Hero Body: Split Layout with Cover Image and Announcement Text */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Content (Title, Description, Event Metadata, Author) */}
            <div className={`${coverImage ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
              
              {/* Author & Publication Timestamp */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-gold to-amber-200 shrink-0 shadow-md">
                  <img
                    src={currentAnnouncement.authorAvatar || '/icons/church-logo.png'}
                    alt={currentAnnouncement.authorName}
                    className="w-full h-full rounded-full object-cover bg-stone-900"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">{currentAnnouncement.authorName}</span>
                    <ShieldCheck className="w-4 h-4 text-gold fill-gold/20" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-300">
                    <span className="text-gold font-medium">{currentAnnouncement.authorRole}</span>
                    <span>•</span>
                    <span>{new Date(currentAnnouncement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-serif font-black text-xl sm:text-2xl lg:text-3xl tracking-tight text-white leading-snug">
                {currentAnnouncement.announcementTitle || currentAnnouncement.content.slice(0, 80)}
              </h2>

              {/* Description Content */}
              <p className="text-sm text-stone-200/90 leading-relaxed line-clamp-4 whitespace-pre-line font-sans">
                {currentAnnouncement.content}
              </p>

              {/* Optional Event Details (Date, Time, Location) */}
              {(currentAnnouncement.eventDate || currentAnnouncement.eventLocation) && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-200">
                  {currentAnnouncement.eventDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold shrink-0" />
                      <span>{currentAnnouncement.eventDate} {currentAnnouncement.eventTime && `• ${currentAnnouncement.eventTime}`}</span>
                    </div>
                  )}
                  {currentAnnouncement.eventLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gold shrink-0" />
                      <span className="truncate">{currentAnnouncement.eventLocation}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons & Interactions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {currentAnnouncement.actionButtonLabel && (
                  <button
                    onClick={() => {
                      if (currentAnnouncement.actionButtonUrl?.startsWith('#')) {
                        onNavigate('events');
                      } else if (currentAnnouncement.actionButtonUrl) {
                        window.open(currentAnnouncement.actionButtonUrl, '_blank');
                      } else {
                        onNavigate('events');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-[#d4b57e] to-[#b8955c] text-slate-950 font-bold text-xs hover:brightness-110 transition shadow-gold flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentAnnouncement.actionButtonLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Comment / Discuss trigger */}
                <button
                  onClick={() => onOpenComments(currentAnnouncement)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition border border-white/15 flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-gold" />
                  <span>Discussion ({currentAnnouncement.commentsCount || 0})</span>
                </button>
              </div>

            </div>

            {/* Right Media (Cover Image with Click to Lightbox) */}
            {coverImage && (
              <div className="lg:col-span-5 relative group/img">
                <div 
                  onClick={() => onOpenImageLightbox(coverImage)}
                  className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-4/3 cursor-pointer shadow-2xl border border-white/20 bg-black/40"
                >
                  <img
                    src={coverImage}
                    alt={currentAnnouncement.announcementTitle || 'Announcement cover'}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/30">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Full View</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Interaction Bar (Reactions & Comments Summary) */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-300">
            
            {/* Reaction counts breakdown (clickable to view who reacted) */}
            <div 
              onClick={() => onOpenWhoReacted(currentAnnouncement)}
              className="flex items-center gap-2 cursor-pointer hover:text-white transition"
              title="View reactions breakdown"
            >
              <div className="flex -space-x-1 items-center">
                <span className="text-sm">🙏</span>
                <span className="text-sm">❤️</span>
                <span className="text-sm">🎉</span>
              </div>
              <span className="font-semibold text-white">
                {Object.values(currentAnnouncement.reactionCounts).reduce((a, b) => a + b, 0)} reactions
              </span>
            </div>

            {/* Quick React Picker */}
            <div className="flex items-center gap-1 relative">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
                {(['pray', 'love', 'celebrate', 'like', 'care'] as FeedReactionType[]).map(type => {
                  const meta = FEED_REACTIONS[type];
                  const hasReacted = currentAnnouncement.userReaction === type;

                  return (
                    <button
                      key={type}
                      onClick={() => onReact(currentAnnouncement.id, type)}
                      className={`px-2 py-1 rounded-full transition cursor-pointer flex items-center gap-1 text-xs hover:scale-110 active:scale-95 ${
                        hasReacted ? 'bg-gold text-slate-950 font-bold shadow-xs' : 'text-stone-300 hover:text-white'
                      }`}
                      title={meta.label}
                    >
                      <span>{meta.emoji}</span>
                      <span className="hidden sm:inline text-[11px]">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
