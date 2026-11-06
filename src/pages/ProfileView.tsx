import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCircle, Mail, Phone, Calendar, Heart, Bookmark, 
  Users, Music, Bell, Shield, CheckCircle2, Edit3, MapPin, ExternalLink, Compass,
  KeyRound, Lock, UserPlus, LogIn, LogOut, ShieldCheck, Camera, Upload, Check, X, Loader2, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { ChurchDataStore } from '../services/churchDataStore';
import { BibleService } from '../features/bible/bibleService';
import { AuthService } from '../services/authService';
import { CHURCH_INFO } from '../services/churchInfo';
import { AuthModal } from '../features/auth/AuthModal';
import { UserProfile } from '../types';

interface ProfileViewProps {
  currentUser?: UserProfile;
}

const PRESET_AVATARS = [
  { label: 'Church Crest', url: '/icons/church-logo.png' },
  { label: 'Gold Seal', url: '/icons/church-seal-gold.png' },
  { label: 'John Miko (Admin)', url: '/images/avatar-john-miko.png' },
  { label: 'Praise & Worship', url: '/images/chat-worship.png' },
  { label: 'Youth Group', url: '/images/chat-youth.png' },
  { label: 'Prayer & Faith', url: '/images/chat-prayer.png' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser: initialUser }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return initialUser || ChurchDataStore.getCurrentUser() || ChurchDataStore.getRequiredCurrentUser();
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editRoleTitle, setEditRoleTitle] = useState(currentUser.roleTitle);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editEmail, setEditEmail] = useState(currentUser.email || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar || '/icons/church-logo.png');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      const u = ChurchDataStore.getCurrentUser();
      if (u) {
        setCurrentUser(u);
        setEditName(u.name);
        setEditRoleTitle(u.roleTitle);
        setEditBio(u.bio || '');
        setEditPhone(u.phone || '');
        setEditEmail(u.email || '');
        setEditAvatar(u.avatar || '/icons/church-logo.png');
      }
    };
    window.addEventListener('bjc_auth_change', handleAuthChange);
    return () => window.removeEventListener('bjc_auth_change', handleAuthChange);
  }, []);

  const ministries = ChurchDataStore.getMinistries().filter(m => m.memberIds?.includes(currentUser.id));
  const myPrayers = ChurchDataStore.getPrayerRequests().filter(p => p.userId === currentUser.id);
  const myBookmarks = BibleService.getBookmarks();
  const myNotes = BibleService.getNotes();

  const [pushChat, setPushChat] = useState(true);
  const [pushAnnounce, setPushAnnounce] = useState(true);
  const [pushPrayer, setPushPrayer] = useState(true);
  const [pushWorship, setPushWorship] = useState(true);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'recovery'>('login');

  const handleAuthSuccess = (u: UserProfile) => {
    setCurrentUser(u);
    setIsAuthOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setEditAvatar(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await ChurchDataStore.updateProfile({
        id: currentUser.id,
        name: editName.trim(),
        roleTitle: editRoleTitle.trim() || 'Church Member',
        bio: editBio.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        avatar: editAvatar
      });

      setCurrentUser(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(currentUser.name);
    setEditRoleTitle(currentUser.roleTitle);
    setEditBio(currentUser.bio || '');
    setEditPhone(currentUser.phone || '');
    setEditEmail(currentUser.email || '');
    setEditAvatar(currentUser.avatar || '/icons/church-logo.png');
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-soft animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-semibold">Your profile and photo were updated successfully and synced to your cloud account!</span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Card / Edit Form */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card">
        {!isEditing ? (
          /* View Mode */
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group shrink-0">
              <img 
                src={currentUser.avatar || '/icons/church-logo.png'} 
                alt={currentUser.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-gold/40 shadow-soft" 
              />
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary hover:bg-slate-800 text-gold shadow-md border-2 border-white dark:border-slate-900 transition"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h1 className="font-serif font-bold text-2xl text-slate-900 dark:text-white">
                      {currentUser.name}
                    </h1>
                    {currentUser.username && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-gold/15 text-gold-dark dark:text-gold border border-gold/30">
                        @{currentUser.username}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-sage-600 dark:text-sage-400 font-semibold flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{currentUser.roleTitle}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gold/15 text-gold-dark dark:text-gold hover:bg-gold/25 border border-gold/30 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentUser.bio || 'Faithful servant and member of Beholding Jesus Church.'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold" />
                  <span>{currentUser.email || 'member@beholdingjesus.org'}</span>
                </div>
                {currentUser.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span>{currentUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  <span>Joined {currentUser.joinedDate || '2026'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-gold" />
                <h2 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                  Edit Your Member Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <div className="relative shrink-0">
                <img 
                  src={editAvatar} 
                  alt="Avatar Preview" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-gold/50 shadow-md" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-gold border-2 border-white dark:border-slate-900 shadow hover:bg-slate-800 transition"
                  title="Upload from device"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Profile Photo
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upload a photo from your camera or gallery (JPG, PNG, WEBP). It will be saved to your church cloud profile.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-primary hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-gold" />
                    <span>Upload New Photo</span>
                  </button>
                </div>

                {/* Preset Avatars */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                    Or choose a church emblem:
                  </span>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {PRESET_AVATARS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(p.url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition p-0.5 ${
                          editAvatar === p.url ? 'border-gold ring-2 ring-gold/40' : 'border-slate-300 dark:border-slate-600 hover:border-gold'
                        }`}
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover rounded-full" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  required
                  placeholder="e.g. John Miko Sarsalijo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-gold font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ministry Title / Role
                </label>
                <input 
                  type="text" 
                  value={editRoleTitle} 
                  onChange={e => setEditRoleTitle(e.target.value)} 
                  placeholder="e.g. Church Member, Praise Vocalist, Youth Leader"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-gold font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={editEmail} 
                  onChange={e => setEditEmail(e.target.value)} 
                  placeholder="e.g. member@beholdingjesus.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-gold font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  value={editPhone} 
                  onChange={e => setEditPhone(e.target.value)} 
                  placeholder="e.g. 0917-123-4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-gold font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Bio & Ministry Testimony
              </label>
              <textarea 
                rows={3}
                value={editBio} 
                onChange={e => setEditBio(e.target.value)} 
                placeholder="Share a short personal testimony or what God is speaking into your life..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-gold font-medium resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gold hover:bg-[#b08e57] text-slate-950 text-xs font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Church Sanctuary & Gathering Schedule Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-gold" />
              <h2 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Church Home: {CHURCH_INFO.name}
              </h2>
            </div>
            <p className="text-xs text-gold dark:text-gold-300 font-semibold tracking-wide uppercase mt-0.5">
              {CHURCH_INFO.primaryMotto} • <span className="italic normal-case text-slate-400 font-normal">{CHURCH_INFO.secondaryMotto}</span>
            </p>
          </div>
          <a
            href={CHURCH_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition self-start sm:self-auto shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-gold" />
            <span>Open Directions</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {CHURCH_INFO.address}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {CHURCH_INFO.schedules.map((s, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="text-[10px] font-bold uppercase text-gold">{s.dayAbbr} • {s.time}</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ministries & Service Involvements */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gold" />
          <h2 className="font-serif font-bold text-base text-slate-900 dark:text-white">
            Assigned Church Ministries ({ministries.length})
          </h2>
        </div>

        {ministries.length === 0 ? (
          <p className="text-xs text-slate-400">
            You are not officially registered to a ministry yet. Visit the Ministries tab to apply!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ministries.map(m => (
              <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-xs text-slate-900 dark:text-white">{m.name}</div>
                <div className="text-[11px] text-slate-500">Meeting: {m.meetingTime || m.meetingSchedule}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gold" />
          <h2 className="font-serif font-bold text-base text-slate-900 dark:text-white">
            Church Notification Preferences
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Church & Pastoral Announcements</div>
              <div className="text-slate-400 text-[11px]">Receive high-priority updates from church leadership</div>
            </div>
            <input 
              type="checkbox" 
              checked={pushAnnounce} 
              onChange={e => setPushAnnounce(e.target.checked)}
              className="accent-gold rounded cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Prayer Chain Updates</div>
              <div className="text-slate-400 text-[11px]">When someone prays for your request or a testimony is posted</div>
            </div>
            <input 
              type="checkbox" 
              checked={pushPrayer} 
              onChange={e => setPushPrayer(e.target.checked)}
              className="accent-gold rounded cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Worship Team & Vocal Key Alerts</div>
              <div className="text-slate-400 text-[11px]">Setlist updates and key assignment notifications</div>
            </div>
            <input 
              type="checkbox" 
              checked={pushWorship} 
              onChange={e => setPushWorship(e.target.checked)}
              className="accent-gold rounded cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Direct Chat Messages</div>
              <div className="text-slate-400 text-[11px]">Group chat and direct messages from church family</div>
            </div>
            <input 
              type="checkbox" 
              checked={pushChat} 
              onChange={e => setPushChat(e.target.checked)}
              className="accent-gold rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bible Study Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-2">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-gold" />
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Bookmarked Verses</h3>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 dark:text-white">{myBookmarks.length}</div>
          <p className="text-[11px] text-slate-400">Verses saved across KJV, NIV, and WEB translations.</p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Active Prayer Requests</h3>
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 dark:text-white">{myPrayers.length}</div>
          <p className="text-[11px] text-slate-400">Needs currently being lifted up by the church family.</p>
        </div>
      </div>

      {/* Account Security & Authentication Identity */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <h2 className="font-serif font-bold text-base text-slate-900 dark:text-white">
              Account Security & Access Identity
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 font-bold self-start sm:self-auto">
            Identity Authenticated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Username</div>
            <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
              @{currentUser.username || 'member'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Privilege</div>
            <div className="font-bold text-slate-900 dark:text-white">
              {currentUser.roleTitle}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Account Governance</div>
            <div className="font-bold text-slate-900 dark:text-white">
              Active Member
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => { setAuthTab('login'); setIsAuthOpen(true); }}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5 text-gold" />
            <span>Sign In to Another Account</span>
          </button>

          <button
            onClick={() => { setAuthTab('register'); setIsAuthOpen(true); }}
            className="px-4 py-2 rounded-xl bg-gold hover:bg-[#b08e57] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New Member</span>
          </button>

          <button
            onClick={() => { setAuthTab('recovery'); setIsAuthOpen(true); }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-gold" />
            <span>Account Recovery</span>
          </button>

          <button
            onClick={() => {
              AuthService.logout();
              setAuthTab('login');
              setIsAuthOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition border border-rose-200/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authTab}
      />

    </div>
  );
};