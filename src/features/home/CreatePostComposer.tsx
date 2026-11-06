import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, Sparkles, X, Plus, Send, Heart, BookOpen, 
  MessageSquare, Bell, Calendar, MapPin, Pin, AlertCircle, ShieldAlert
} from 'lucide-react';
import { UserProfile, FeedPostType } from '../../types';
import { isChurchAdmin, ChurchFeedStore } from '../../services/churchFeedStore';

interface CreatePostComposerProps {
  currentUser: UserProfile;
  isOpenAsModal?: boolean;
  initialPostType?: FeedPostType;
  onCloseModal?: () => void;
  onPostCreated: () => void;
}

export const CreatePostComposer: React.FC<CreatePostComposerProps> = ({
  currentUser,
  isOpenAsModal = false,
  initialPostType = 'community',
  onCloseModal,
  onPostCreated
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpenAsModal);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('Personal Update');
  const [postType, setPostType] = useState<FeedPostType>(initialPostType);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Announcement fields (Admin exclusive)
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'pinned' | 'high' | 'normal'>('normal');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [actionButtonLabel, setActionButtonLabel] = useState('');
  const [actionButtonUrl, setActionButtonUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = isChurchAdmin(currentUser);

  const CATEGORIES = [
    { label: 'Personal Update', emoji: '💬' },
    { label: 'Scripture Reflection', emoji: '📖' },
    { label: 'Testimony', emoji: '✝️' },
    { label: 'Prayer Encouragement', emoji: '🙏' },
    { label: 'Ministry Activity', emoji: '🎵' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Basic size check (15MB)
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 15MB. Please choose a smaller image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const raw = event.target?.result as string;
        if (!raw) return;

        const img = new Image();
        img.onload = () => {
          const maxDim = 850;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            setImageUrls(prev => [...prev, canvas.toDataURL('image/jpeg', 0.7)]);
          } else {
            setImageUrls(prev => [...prev, raw]);
          }
        };
        img.onerror = () => setImageUrls(prev => [...prev, raw]);
        img.src = raw;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && imageUrls.length === 0) {
      setErrorMessage('Please enter some text or add an image to share.');
      return;
    }

    if (postType === 'announcement' && !announcementTitle.trim()) {
      setErrorMessage('Please provide a title for this official announcement.');
      return;
    }

    if (currentUser.isSuspended) {
      setErrorMessage('Your account posting privileges are currently suspended.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      await ChurchFeedStore.createPost({
        author: currentUser,
        content,
        imageUrls,
        category,
        postType: isAdmin ? postType : 'community',
        announcementTitle: isAdmin && postType === 'announcement' ? announcementTitle : undefined,
        announcementPriority: isAdmin && postType === 'announcement' ? announcementPriority : undefined,
        eventDate: eventDate.trim() || undefined,
        eventTime: eventTime.trim() || undefined,
        eventLocation: eventLocation.trim() || undefined,
        actionButtonLabel: actionButtonLabel.trim() || undefined,
        actionButtonUrl: actionButtonUrl.trim() || undefined
      });

      // Reset
      setContent('');
      setImageUrls([]);
      setAnnouncementTitle('');
      setEventDate('');
      setEventTime('');
      setEventLocation('');
      setActionButtonLabel('');
      setActionButtonUrl('');
      setIsExpanded(false);

      if (onCloseModal) onCloseModal();
      onPostCreated();
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setErrorMessage(err.message || 'An error occurred while publishing your post.');
    } finally {
      setIsUploading(false);
    }
  };

  const firstName = currentUser.name.split(' ')[0] || 'believer';

  return (
    <div className={
      isOpenAsModal
        ? "w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-800 flex flex-col max-h-[calc(100dvh-2.5rem)] sm:max-h-[88vh] overflow-hidden transition-colors"
        : "rounded-none sm:rounded-xl bg-white dark:bg-slate-900 border-y sm:border border-stone-200/90 dark:border-slate-800/90 shadow-none sm:shadow-2xs p-3.5 sm:p-4 transition-colors"
    }>
      
      {/* Top collapsed row */}
      {!isExpanded ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gold/40 shadow-xs">
            <img 
              src={currentUser.avatar || '/icons/church-logo.png'} 
              alt={currentUser.name} 
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 bg-stone-100 hover:bg-stone-200/70 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 text-left px-4 py-2.5 rounded-full text-xs sm:text-sm text-stone-500 dark:text-stone-400 border border-transparent hover:border-gold/20 transition cursor-pointer"
          >
            What would you like to share with the church, {firstName}?
          </button>

          <button
            onClick={() => {
              setIsExpanded(true);
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
            className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-600 dark:text-stone-300 transition cursor-pointer shrink-0"
            title="Attach Photo"
          >
            <ImageIcon className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      ) : (
        /* Expanded Composer Form */
        <form 
          onSubmit={handleSubmit} 
          className={isOpenAsModal ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "space-y-4 animate-in fade-in duration-200"}
        >
          
          {/* Header */}
          <div className={
            isOpenAsModal
              ? "shrink-0 px-4 py-3.5 border-b border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between z-10"
              : "flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800"
          }>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gold/40">
                <img 
                  src={currentUser.avatar || '/icons/church-logo.png'} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-sm text-stone-900 dark:text-white">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  {currentUser.roleTitle || 'Church Member'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                if (onCloseModal) onCloseModal();
              }}
              className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form scrollable body */}
          <div className={isOpenAsModal ? "flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain" : "space-y-4"}>

          {/* Admin Post Type Toggle: Official Announcement vs Community Post */}
          {isAdmin && (
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-100 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPostType('community')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition text-center cursor-pointer ${
                  postType === 'community' 
                    ? 'bg-white dark:bg-slate-700 text-stone-900 dark:text-white shadow-xs' 
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Community Post
              </button>
              <button
                type="button"
                onClick={() => setPostType('announcement')}
                className={`flex-1 py-1.5 rounded-xl font-bold transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  postType === 'announcement' 
                    ? 'bg-gradient-to-r from-gold to-amber-200 text-slate-950 shadow-xs' 
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Official Announcement</span>
              </button>
            </div>
          )}

          {/* If Announcement: Title & Priority Controls */}
          {postType === 'announcement' && isAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Bell className="w-4 h-4" />
                <span>OFFICIAL CHURCH ANNOUNCEMENT DETAILS</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Upcoming Sunday Expository Series, Church Fasting, etc."
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Priority & Pin Status
                  </label>
                  <select
                    value={announcementPriority}
                    onChange={(e: any) => setAnnouncementPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="pinned">📌 Pinned Hero (Top of Home)</option>
                    <option value="high">High Priority</option>
                    <option value="normal">Normal Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Event Date (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. This Sunday, Nov 10"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Event Time (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9:00 AM – 11:30 AM"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BJC Main Sanctuary, Molino 3"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. View Details, Register"
                    value={actionButtonLabel}
                    onChange={(e) => setActionButtonLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Button URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #worship, https://..."
                    value={actionButtonUrl}
                    onChange={(e) => setActionButtonUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category Pills (Community Post) */}
          {postType === 'community' && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                Post Category:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      category === cat.label
                        ? 'bg-gold text-slate-950 font-bold shadow-xs'
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            rows={4}
            placeholder={`What would you like to share with the church, ${firstName}? (Bible verse reflection, testimony, prayer encouragement...)`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none leading-relaxed"
            autoFocus
          />

          {/* Attached Images Preview Grid */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-black/10 border border-stone-200 dark:border-slate-700 group">
                  <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-black/90 text-white transition cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Error notice */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          </div>

          {/* Footer controls: Attachments + Cancel + Post Button */}
          <div className={
            isOpenAsModal
              ? "shrink-0 p-3.5 border-t border-stone-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between z-10"
              : "flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800"
          }>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span>Add Photos</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  if (onCloseModal) onCloseModal();
                }}
                className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUploading || (!content.trim() && imageUrls.length === 0)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-[#b09058] hover:brightness-105 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-gold flex items-center gap-2 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Publishing...' : 'Post to Church'}</span>
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
};
