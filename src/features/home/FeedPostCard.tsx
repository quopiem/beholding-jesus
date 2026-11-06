import React, { useState, useRef } from 'react';
import { 
  MoreHorizontal, Heart, MessageSquare, Share2, Pin, PinOff, 
  Trash2, Edit3, EyeOff, Eye, MessageSquareOff, MessageSquarePlus,
  Flag, Send, CornerDownRight, Check, X, Bell, Clock, Calendar, MapPin, 
  Maximize2, Sparkles, CheckCircle2, ChevronRight, ShieldCheck, Download
} from 'lucide-react';
import { 
  FeedPost, UserProfile, PostComment, FeedReactionType, 
  FEED_REACTIONS 
} from '../../types';
import { isChurchAdmin, ChurchFeedStore } from '../../services/churchFeedStore';

interface FeedPostCardProps {
  post: FeedPost;
  currentUser: UserProfile;
  onReact: (postId: string, reactionType: FeedReactionType) => void;
  onOpenImageLightbox: (imageUrl: string) => void;
  onOpenWhoReacted: (post: FeedPost) => void;
  onOpenReportModal: (postId: string, commentId?: string | null, authorName?: string) => void;
  onEditPost: (post: FeedPost) => void;
  onDeletePost: (post: FeedPost) => void;
  onTogglePin: (post: FeedPost) => void;
  onToggleHide: (post: FeedPost) => void;
  onToggleCommentsEnabled: (post: FeedPost) => void;
  onCommentAdded: () => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  currentUser,
  onReact,
  onOpenImageLightbox,
  onOpenWhoReacted,
  onOpenReportModal,
  onEditPost,
  onDeletePost,
  onTogglePin,
  onToggleHide,
  onToggleCommentsEnabled,
  onCommentAdded
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReactionHovered, setIsReactionHovered] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<PostComment | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = isChurchAdmin(currentUser);
  const isAuthor = currentUser.id === post.authorId;

  // Relative Time helper (e.g. Just now, 25m ago, 2h ago, Yesterday, Oct 24)
  const formatRelativeTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const handleShare = () => {
    const textToCopy = `Beholding Jesus Church Community Post by ${post.authorName}:\n\n${post.content}\n\nJoin us at Beholding Jesus Church!`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      ChurchFeedStore.addComment(post.id, currentUser, commentText.trim(), null);
      setCommentText('');
      setIsCommentsOpen(true);
      onCommentAdded();
    } catch (err: any) {
      alert(err.message || 'Could not submit comment.');
    }
  };

  const handleAddReply = (parentCommentId: string) => {
    if (!replyText.trim()) return;

    try {
      ChurchFeedStore.addComment(post.id, currentUser, replyText.trim(), parentCommentId);
      setReplyText('');
      setReplyingToComment(null);
      onCommentAdded();
    } catch (err: any) {
      alert(err.message || 'Could not submit reply.');
    }
  };

  const handleEditComment = (commentId: string) => {
    if (!editCommentText.trim()) return;
    try {
      ChurchFeedStore.editComment(commentId, editCommentText.trim(), currentUser);
      setEditingCommentId(null);
      setEditCommentText('');
      onCommentAdded();
    } catch (err: any) {
      alert(err.message || 'Could not update comment.');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      ChurchFeedStore.deleteComment(commentId, currentUser);
      onCommentAdded();
    }
  };

  const handleCommentReact = (commentId: string, reactionType: FeedReactionType) => {
    ChurchFeedStore.toggleCommentReaction(commentId, currentUser, reactionType);
    onCommentAdded();
  };

  const handleDownloadImage = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `bjc-church-photo-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalReactions = Object.values(post.reactionCounts).reduce((a, b) => a + b, 0);
  const activeReactionMeta = post.userReaction ? FEED_REACTIONS[post.userReaction] : null;

  // Separate top-level comments and nested replies
  const topLevelComments = post.comments.filter(c => !c.parentCommentId);
  const repliesByParent = new Map<string, PostComment[]>();
  post.comments.filter(c => c.parentCommentId).forEach(r => {
    const parentId = r.parentCommentId!;
    const list = repliesByParent.get(parentId) || [];
    list.push(r);
    repliesByParent.set(parentId, list);
  });

  const isAnnouncement = post.postType === 'announcement';

  return (
    <article className={`rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border transition-all duration-200 ${
      post.isHidden
        ? 'opacity-60 border-rose-300 dark:border-rose-900 bg-rose-50/20'
        : isAnnouncement 
          ? 'border-2 border-gold/40 dark:border-gold/30 shadow-md ring-1 ring-gold/20' 
          : 'border-stone-200/90 dark:border-slate-800/90 shadow-xs hover:shadow-md hover:border-gold/30 dark:hover:border-slate-700'
    }`}>
      
      {/* Post Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
        
        {/* Author info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className={`w-11 h-11 rounded-full p-0.5 overflow-hidden ${
              isAnnouncement ? 'bg-gradient-to-tr from-gold to-amber-300 shadow-xs' : 'bg-stone-200 dark:bg-slate-700'
            }`}>
              <img
                src={post.authorAvatar || '/icons/church-logo.png'}
                alt={post.authorName}
                className="w-full h-full rounded-full object-cover bg-stone-900"
              />
            </div>
            {isAnnouncement && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gold text-slate-950 flex items-center justify-center text-[9px] shadow-xs ring-2 ring-white dark:ring-slate-900">
                ✝️
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-white truncate">
                {post.authorName}
              </span>
              {isAnnouncement && (
                <ShieldCheck className="w-4 h-4 text-gold fill-gold/20 shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 flex-wrap">
              {post.authorRole && (
                <span className={`font-semibold ${isAnnouncement ? 'text-gold' : 'text-stone-600 dark:text-stone-300'}`}>
                  {post.authorRole}
                </span>
              )}
              {post.ministryLabel && (
                <>
                  <span>•</span>
                  <span className="text-[11px] px-2 py-0.2 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300">
                    {post.ministryLabel}
                  </span>
                </>
              )}
              <span>•</span>
              <span title={new Date(post.createdAt).toLocaleString()}>
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Badges & More Options Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {isAnnouncement && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 text-[10px] font-black uppercase tracking-wider">
              <Bell className="w-3 h-3" />
              <span className="hidden sm:inline">ANNOUNCEMENT</span>
            </span>
          )}

          {post.isPinned && (
            <span className="p-1 rounded-full bg-gold/20 text-gold" title="Pinned Post">
              <Pin className="w-3.5 h-3.5 rotate-45 fill-current" />
            </span>
          )}

          {/* More options menu button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
              title="Post Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 z-30 w-52 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                {/* Author options */}
                {isAuthor && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEditPost(post);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit Post</span>
                  </button>
                )}

                {/* Admin announcement Pin/Unpin */}
                {isAdmin && isAnnouncement && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onTogglePin(post);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    {post.isPinned ? <PinOff className="w-3.5 h-3.5 text-gold" /> : <Pin className="w-3.5 h-3.5 text-gold" />}
                    <span>{post.isPinned ? 'Unpin from Top' : 'Pin to Top of Home'}</span>
                  </button>
                )}

                {/* Admin Hide/Restore */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleHide(post);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    {post.isHidden ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{post.isHidden ? 'Restore to Feed' : 'Hide from Feed'}</span>
                  </button>
                )}

                {/* Admin Disable/Enable Comments */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleCommentsEnabled(post);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    {post.commentsEnabled ? <MessageSquareOff className="w-3.5 h-3.5 text-rose-500" /> : <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{post.commentsEnabled ? 'Disable Comments' : 'Enable Comments'}</span>
                  </button>
                )}

                {/* Report post (for all members except author) */}
                {!isAuthor && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenReportModal(post.id, null, post.authorName);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Report Inappropriate Content</span>
                  </button>
                )}

                {/* Save Attached Photo */}
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDownloadImage(post.imageUrls[0]);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                    <span>Save Photo</span>
                  </button>
                )}

                {/* Delete post (Author or Admin) */}
                {(isAuthor || isAdmin) && (
                  <div className="pt-1 border-t border-stone-100 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDeletePost(post);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Post</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcement Title banner if announcement */}
      {isAnnouncement && post.announcementTitle && (
        <div className="px-4 sm:px-5 pb-2">
          <h3 className="font-serif font-black text-lg sm:text-xl text-stone-900 dark:text-white leading-snug">
            {post.announcementTitle}
          </h3>
        </div>
      )}

      {/* Post Text Content */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-sm sm:text-base text-stone-800 dark:text-stone-200 whitespace-pre-line leading-relaxed font-sans">
          {post.content}
        </p>

        {/* Category tag */}
        {post.category && post.category !== 'General' && (
          <div className="pt-2.5 flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-gold bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/20">
              #{post.category.replace(/\s+/g, '')}
            </span>
          </div>
        )}
      </div>

      {/* Optional Event Details Box */}
      {(post.eventDate || post.eventLocation) && (
        <div className="mx-4 sm:mx-5 mb-3 p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300">
          {post.eventDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold shrink-0" />
              <span>{post.eventDate} {post.eventTime && `• ${post.eventTime}`}</span>
            </div>
          )}
          {post.eventLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span className="truncate">{post.eventLocation}</span>
            </div>
          )}
        </div>
      )}

      {/* Image Gallery (Responsive 1-image, 2-images, 3+ Facebook-style collage) */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="px-4 sm:px-5 mb-3">
          <div className="rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 shadow-xs">
            {post.imageUrls.length === 1 ? (
              <div 
                onClick={() => onOpenImageLightbox(post.imageUrls[0])}
                className="relative bg-stone-900/5 dark:bg-black/30 overflow-hidden cursor-pointer group flex items-center justify-center p-1 sm:p-2 min-h-[220px] max-h-[660px]"
              >
                <img
                  src={post.imageUrls[0]}
                  alt="Post attachment"
                  className="w-full max-h-[640px] h-auto object-contain rounded-xl group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                  <span className="px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-md">
                    <Maximize2 className="w-3.5 h-3.5" /> Full View
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadImage(post.imageUrls[0]);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#C5A46D] hover:bg-[#d8b982] text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                    title="Save Photo"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Photo</span>
                  </button>
                </div>
              </div>
            ) : post.imageUrls.length === 2 ? (
              <div className="grid grid-cols-2 gap-1 bg-black/5">
                {post.imageUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onOpenImageLightbox(url)}
                    className="relative aspect-square overflow-hidden cursor-pointer group"
                  >
                    <img src={url} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 bg-black/5">
                <div 
                  onClick={() => onOpenImageLightbox(post.imageUrls[0])}
                  className="relative aspect-square overflow-hidden cursor-pointer group col-span-1 row-span-2"
                >
                  <img src={post.imageUrls[0]} alt="Attachment 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div 
                  onClick={() => onOpenImageLightbox(post.imageUrls[1])}
                  className="relative aspect-square overflow-hidden cursor-pointer group"
                >
                  <img src={post.imageUrls[1]} alt="Attachment 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div 
                  onClick={() => onOpenImageLightbox(post.imageUrls[2])}
                  className="relative aspect-square overflow-hidden cursor-pointer group"
                >
                  <img src={post.imageUrls[2]} alt="Attachment 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {post.imageUrls.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 text-white font-bold text-lg flex items-center justify-center backdrop-blur-xs">
                      +{post.imageUrls.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reaction and Comment Counts Row */}
      <div className="px-4 sm:px-5 py-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-slate-800">
        
        {/* Left: Reaction icons + count (clickable to view who reacted) */}
        <div 
          onClick={() => totalReactions > 0 && onOpenWhoReacted(post)}
          className={`flex items-center gap-1.5 transition ${
            totalReactions > 0 ? 'cursor-pointer hover:underline text-stone-700 dark:text-stone-300 font-medium' : ''
          }`}
          title="See who reacted"
        >
          {totalReactions > 0 ? (
            <>
              <div className="flex -space-x-1 items-center">
                {post.reactionCounts.pray > 0 && <span>🙏</span>}
                {post.reactionCounts.love > 0 && <span>❤️</span>}
                {post.reactionCounts.celebrate > 0 && <span>🎉</span>}
                {post.reactionCounts.like > 0 && <span>👍</span>}
                {post.reactionCounts.care > 0 && <span>🤗</span>}
              </div>
              <span>{totalReactions}</span>
            </>
          ) : (
            <span>Be the first to react</span>
          )}
        </div>

        {/* Right: Comment count */}
        <button
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className="hover:underline font-medium cursor-pointer"
        >
          {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Action Buttons: React, Comment, Share */}
      <div className="px-2 py-1 border-t border-stone-100 dark:border-slate-800 grid grid-cols-3 gap-1 relative">
        
        {/* REACTION BUTTON WITH FLOATING FACEBOOK-STYLE PICKER */}
        <div 
          className="relative"
          onMouseEnter={() => setIsReactionHovered(true)}
          onMouseLeave={() => setIsReactionHovered(false)}
        >
          <button
            onClick={() => onReact(post.id, post.userReaction || 'pray')}
            className={`w-full py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeReactionMeta
                ? `${activeReactionMeta.color} bg-gold/10 font-bold`
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-base">{activeReactionMeta ? activeReactionMeta.emoji : '🙏'}</span>
            <span>{activeReactionMeta ? activeReactionMeta.label : 'Pray / Like'}</span>
          </button>

          {/* Floating Reaction Hover Picker */}
          {isReactionHovered && (
            <div className="absolute left-0 bottom-full mb-1 z-30 p-1.5 rounded-full bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-2xl flex items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-150">
              {(['like', 'love', 'care', 'celebrate', 'pray'] as FeedReactionType[]).map(type => {
                const meta = FEED_REACTIONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onReact(post.id, type);
                      setIsReactionHovered(false);
                    }}
                    className="p-1.5 rounded-full hover:scale-130 active:scale-95 transition-transform cursor-pointer text-lg group/emoji relative"
                    title={meta.label}
                  >
                    <span>{meta.emoji}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COMMENT BUTTON */}
        <button
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className="w-full py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-stone-500" />
          <span>Comment</span>
        </button>

        {/* SHARE BUTTON */}
        <button
          onClick={handleShare}
          className="w-full py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          {copiedShare ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-stone-500" />}
          <span>{copiedShare ? 'Copied!' : 'Share'}</span>
        </button>

      </div>

      {/* Threaded Comments Section */}
      {isCommentsOpen && (
        <div className="p-4 sm:p-5 pt-3 border-t border-stone-100 dark:border-slate-800 space-y-4 bg-stone-50/50 dark:bg-slate-900/60 rounded-b-3xl animate-in fade-in duration-200">
          
          {/* Add Comment Box */}
          {post.commentsEnabled ? (
            <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gold/30">
                <img src={currentUser.avatar || '/icons/church-logo.png'} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder="Write an encouraging comment or prayer..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute right-1.5 p-1.5 rounded-full bg-gold hover:bg-gold-light disabled:opacity-40 text-slate-950 transition cursor-pointer"
                  title="Submit Comment"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-2 text-xs text-stone-400 italic">
              Comments have been disabled for this post by church administration.
            </div>
          )}

          {/* List of Comments */}
          <div className="space-y-3 pt-1">
            {topLevelComments.length > 0 ? (
              topLevelComments.map(comment => {
                const isCommentAuthor = currentUser.id === comment.userId;
                const replies = repliesByParent.get(comment.id) || [];
                const isReplying = replyingToComment?.id === comment.id;

                return (
                  <div key={comment.id} className="space-y-2">
                    
                    {/* Top Level Comment Card */}
                    <div className="flex items-start gap-2.5 group/comment">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-stone-200 dark:border-slate-700 mt-0.5">
                        <img src={comment.userAvatar || '/icons/church-logo.png'} alt={comment.userName} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {editingCommentId === comment.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                            />
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              className="px-2.5 py-1 rounded-lg bg-gold text-slate-950 text-xs font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="text-xs text-stone-400 hover:text-stone-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="inline-block bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700/80 rounded-2xl px-3.5 py-2 max-w-[90%] shadow-2xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-stone-900 dark:text-white">
                                {comment.userName}
                              </span>
                              {comment.userRole && (
                                <span className="text-[10px] text-gold font-medium">
                                  {comment.userRole}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-800 dark:text-stone-200 mt-0.5 leading-relaxed whitespace-pre-line">
                              {comment.content}
                            </p>
                          </div>
                        )}

                        {/* Comment sub-actions */}
                        <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] text-stone-500 dark:text-stone-400 flex-wrap">
                          <span>{formatRelativeTime(comment.createdAt)}</span>

                          {/* Comment React Button with Quick Sacred Reaction Picker */}
                          <div className="relative group/creact">
                            <button
                              type="button"
                              onClick={() => handleCommentReact(comment.id, comment.userReaction === 'pray' ? 'love' : 'pray')}
                              className={`font-semibold hover:underline cursor-pointer flex items-center gap-1 transition ${
                                comment.userReaction ? 'text-[#C5A46D] font-bold' : 'text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              <span>{comment.userReaction ? FEED_REACTIONS[comment.userReaction].emoji : '🙏'}</span>
                              <span>{comment.userReaction ? FEED_REACTIONS[comment.userReaction].label : 'React'}</span>
                            </button>

                            {/* Floating hover sacred reactions bar */}
                            <div className="absolute left-0 bottom-full mb-1 hidden group-hover/creact:flex items-center gap-1 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 shadow-xl rounded-full px-2 py-1 z-30 animate-fadeIn">
                              {(['pray', 'love', 'celebrate', 'like', 'care'] as FeedReactionType[]).map((rType) => (
                                <button
                                  key={rType}
                                  type="button"
                                  onClick={() => handleCommentReact(comment.id, rType)}
                                  className={`p-1 text-sm hover:scale-130 transition-transform ${
                                    comment.userReaction === rType ? 'scale-110 bg-gold/20 rounded-full' : ''
                                  }`}
                                  title={FEED_REACTIONS[rType].label}
                                >
                                  {FEED_REACTIONS[rType].emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Reaction Count Badge on Comment */}
                          {comment.reactionCounts && Object.values(comment.reactionCounts).reduce((a, b) => a + b, 0) > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-slate-700 text-[10px] text-stone-700 dark:text-stone-200 font-semibold shadow-2xs">
                              {comment.reactionCounts.pray > 0 && <span>🙏</span>}
                              {comment.reactionCounts.love > 0 && <span>❤️</span>}
                              {comment.reactionCounts.celebrate > 0 && <span>🎉</span>}
                              {comment.reactionCounts.like > 0 && <span>👍</span>}
                              {comment.reactionCounts.care > 0 && <span>🤗</span>}
                              <span>{Object.values(comment.reactionCounts).reduce((a, b) => a + b, 0)}</span>
                            </span>
                          )}
                          
                          {post.commentsEnabled && (
                            <button
                              onClick={() => setReplyingToComment(isReplying ? null : comment)}
                              className="font-semibold hover:underline cursor-pointer text-stone-600 dark:text-stone-300"
                            >
                              Reply
                            </button>
                          )}

                          {isCommentAuthor && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentText(comment.content);
                                }}
                                className="hover:underline cursor-pointer text-stone-600 dark:text-stone-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="hover:underline text-rose-500 cursor-pointer"
                              >
                                Delete
                              </button>
                            </>
                          )}

                          {!isCommentAuthor && (
                            <button
                              onClick={() => onOpenReportModal(post.id, comment.id, comment.userName)}
                              className="hover:underline text-stone-400 hover:text-rose-500 cursor-pointer"
                            >
                              Report
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                      <div className="pl-9 space-y-2 border-l-2 border-stone-200 dark:border-slate-800 ml-3.5">
                        {replies.map(reply => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-stone-200 dark:border-slate-700">
                              <img src={reply.userAvatar || '/icons/church-logo.png'} alt={reply.userName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="inline-block bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700/80 rounded-2xl px-3 py-1.5 max-w-[90%] shadow-2xs">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-[11px] text-stone-900 dark:text-white">
                                    {reply.userName}
                                  </span>
                                  {reply.userRole && (
                                    <span className="text-[9px] text-gold font-medium">
                                      {reply.userRole}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-800 dark:text-stone-200 mt-0.5 leading-relaxed">
                                  {reply.content}
                                </p>
                              </div>

                              <div className="flex items-center gap-2.5 mt-0.5 ml-2 text-[10px] text-stone-400 flex-wrap">
                                <span>{formatRelativeTime(reply.createdAt)}</span>

                                {/* Reply React Button */}
                                <div className="relative group/rreact">
                                  <button
                                    type="button"
                                    onClick={() => handleCommentReact(reply.id, reply.userReaction === 'pray' ? 'love' : 'pray')}
                                    className={`font-semibold hover:underline cursor-pointer flex items-center gap-1 transition ${
                                      reply.userReaction ? 'text-[#C5A46D] font-bold' : 'text-stone-500 dark:text-stone-300'
                                    }`}
                                  >
                                    <span>{reply.userReaction ? FEED_REACTIONS[reply.userReaction].emoji : '🙏'}</span>
                                    <span>{reply.userReaction ? FEED_REACTIONS[reply.userReaction].label : 'React'}</span>
                                  </button>

                                  <div className="absolute left-0 bottom-full mb-1 hidden group-hover/rreact:flex items-center gap-1 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 shadow-xl rounded-full px-2 py-0.5 z-30 animate-fadeIn">
                                    {(['pray', 'love', 'celebrate', 'like', 'care'] as FeedReactionType[]).map((rType) => (
                                      <button
                                        key={rType}
                                        type="button"
                                        onClick={() => handleCommentReact(reply.id, rType)}
                                        className="p-1 text-xs hover:scale-130 transition-transform"
                                        title={FEED_REACTIONS[rType].label}
                                      >
                                        {FEED_REACTIONS[rType].emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {reply.reactionCounts && Object.values(reply.reactionCounts).reduce((a, b) => a + b, 0) > 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-slate-700 text-[9px] text-stone-700 dark:text-stone-200 font-semibold shadow-2xs">
                                    <span>🙏</span>
                                    <span>{Object.values(reply.reactionCounts).reduce((a, b) => a + b, 0)}</span>
                                  </span>
                                )}

                                {(currentUser.id === reply.userId || isAdmin) && (
                                  <button
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="hover:underline text-rose-500 cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input Box */}
                    {isReplying && (
                      <div className="pl-9 pt-1 flex items-center gap-2">
                        <CornerDownRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <input
                          type="text"
                          placeholder={`Reply to ${comment.userName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddReply(comment.id);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!replyText.trim()}
                          className="px-3 py-1.5 rounded-full bg-gold text-slate-950 font-bold text-xs disabled:opacity-40"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => setReplyingToComment(null)}
                          className="p-1 text-stone-400 hover:text-stone-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            ) : (
              <div className="text-center py-3 text-xs text-stone-400">
                No comments yet. Be the first to share an encouragement!
              </div>
            )}
          </div>

        </div>
      )}

    </article>
  );
};
