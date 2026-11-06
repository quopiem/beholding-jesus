export type UserRole = 
  | 'super_admin'
  | 'church_admin'
  | 'pastor'
  | 'ministry_leader'
  | 'ministry_member'
  | 'regular_member'
  | string;

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  bio?: string;
  phone?: string;
  ministryIds?: string[];
  joinedDate?: string;
  isSuspended?: boolean;
  ministryLabel?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  username: string;
  role: UserRole;
  expiresAt: string;
  createdAt: string;
}

export interface AuthCredential {
  userId: string;
  username: string;
  salt: string;
  passwordHash: string;
  failedAttempts: number;
  lockoutUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordRecoveryRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  status: 'pending' | 'resolved' | 'rejected';
  requestReason: string;
  adminNotes?: string;
  temporaryPassword?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: UserProfile;
  session?: AuthSession;
}

export interface RegistrationData {
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
}

// -------------------------------------------------------------
// WORSHIP & SONG VOCAL KEY TYPES (Exact Flowchart & Requirements)
// -------------------------------------------------------------
export type MusicalKey = 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export interface KeyNotationInfo {
  key: MusicalKey;
  name: string;
  alt: string;
  semitone: number;
}

export interface SingerKeyEntry {
  id?: string;
  key: MusicalKey | string;
  notation: string;
  range?: string; // e.g. "C3 – C5"
  notes?: string;
}

export interface SingerSongAssignment {
  id?: string;
  singerId?: string;
  singerName: string;
  role?: string;
  keys: SingerKeyEntry[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  composer?: string;
  genre: string;
  tempo: string; // BPM
  originalKey: MusicalKey | string;
  mood?: string;
  notes?: string;
  lyrics?: string;
  audioUrl?: string;
  youtubeUrl?: string;
  chordSheetUrl?: string;
  createdAt?: string;
  createdBy?: string;
  singers: SingerSongAssignment[];
  [key: string]: any;
}

export interface Singer {
  id: string;
  name: string;
  profilePicture?: string;
  defaultRole?: string;
  role?: string;
  voiceType?: string;
  vocalRange?: string; // e.g. "C3 – C5", "F3 – F5"
  notes?: string;
  assignedSongsCount?: number;
  assignedSongs?: any[];
}

export interface WorshipSetlistItem {
  id?: string;
  songId: string;
  songTitle: string;
  segment?: string;
  leadSinger?: string;
  singerName?: string;
  backups?: string;
  chosenKey: MusicalKey | string;
  role?: string;
  tempo?: string;
  notes?: string;
}

export interface WorshipSetlist {
  id: string;
  title: string;
  serviceDate?: string;
  date?: string;
  rehearsalDate?: string;
  worshipLeader?: string;
  musicians?: string;
  multimediaOperator?: string;
  notes?: string;
  items: WorshipSetlistItem[];
}

// -------------------------------------------------------------
// BIBLE TYPES
// -------------------------------------------------------------
export type BibleTranslationCode = 'KJV' | 'WEB' | 'ASV' | 'NIV' | 'ESV' | 'NLT' | 'NKJV' | 'NASB' | 'FSV';

export interface BibleTranslation {
  code: BibleTranslationCode;
  name: string;
  description: string;
  isAvailableOffline: boolean;
  copyright: string;
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chaptersCount: number;
  category: 'Law' | 'History' | 'Poetry' | 'Prophets' | 'Gospels' | 'Epistles' | 'Apocalypse';
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: BibleTranslationCode;
  sectionTitle?: string;
  isJesusWords?: boolean;
  redSegments?: string[];
  hasNote?: boolean;
  footnote?: string;
  [key: string]: any;
}

export interface BibleHighlight {
  id: string;
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  color: 'yellow' | 'green' | 'cyan' | 'peach' | 'pink' | 'gold' | 'sage' | 'lavender' | 'amber' | 'rose' | 'sky';
  createdAt: string;
}

export interface BibleBookmark {
  id: string;
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  label?: string;
  createdAt: string;
}

export interface BibleNote {
  id: string;
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
  title: string;
  content: string;
  topic?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  coverImage?: string;
  currentDay: number;
  totalDays: number;
  completedDays: number[];
  todayPassage: string;
}

// -------------------------------------------------------------
// COMMUNITY CHAT TYPES
// -------------------------------------------------------------
export type ChatType = 'direct' | 'group' | 'ministry' | 'bible_study';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  content: string;
  mediaUrl?: string;
  replyToId?: string;
  replyToText?: string;
  replyToSender?: string;
  reactions: Record<string, string[]>; // emoji -> array of userIds
  isReadBy: string[]; // array of userIds
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatType;
  description?: string;
  avatar?: string;
  ministryId?: string;
  memberIds: string[];
  unreadCount?: number;
  lastMessage?: {
    text: string;
    senderName: string;
    timestamp: string;
  };
}

// -------------------------------------------------------------
// CHURCH ANNOUNCEMENTS
// -------------------------------------------------------------
export type AnnouncementPriority = 'pinned' | 'high' | 'normal';
export type AnnouncementCategory = 
  | 'General Church'
  | 'Sunday Services'
  | 'Youth Ministry'
  | 'Worship Ministry'
  | 'Bible Studies'
  | 'Prayer Meetings'
  | 'Special Events'
  | 'Ministry Activities'
  | string;

export interface Announcement {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  date: string;
  authorName: string;
  authorRole: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  targetAudience?: 'all' | string;
  isImportant?: boolean;
  isRead?: boolean;
}

// -------------------------------------------------------------
// MINISTRY MANAGEMENT
// -------------------------------------------------------------
export interface Ministry {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  description: string;
  leaderName?: string;
  leaderTitle?: string;
  leaderId?: string;
  leader?: string;
  leaderAvatar?: string;
  coverImage?: string;
  icon?: string;
  color?: string;
  meetingSchedule?: string;
  meetingTime?: string;
  location?: string;
  membersCount?: number;
  memberIds?: string[];
  activities?: string[];
  resources?: { name: string; type: string; url?: string }[];
  [key: string]: any;
}

export interface MinistryJoinRequest {
  id: string;
  ministryId: string;
  ministryName: string;
  userId: string;
  userName: string;
  userEmail: string;
  experience?: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: string;
}

// -------------------------------------------------------------
// EVENTS & SCHEDULES
// -------------------------------------------------------------
export type EventCategory = 
  | 'Sunday Worship Service'
  | 'Youth Service'
  | 'Bible Study'
  | 'Prayer Meeting'
  | 'Fellowship'
  | 'Outreach'
  | 'Discipleship'
  | 'Special Church Events'
  | string;

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category?: EventCategory;
  ministryId?: string;
  ministryName?: string;
  coverImage?: string;
  image?: string;
  organizerName?: string;
  requiresRegistration?: boolean;
  capacity?: number;
  registeredUserIds: string[];
  attendeesCount: number;
  [key: string]: any;
}

// -------------------------------------------------------------
// PRAYER REQUESTS & TESTIMONIES
// -------------------------------------------------------------
export type PrayerVisibility = 'private' | 'ministry' | 'group' | 'public';

export interface PrayerRequest {
  id: string;
  userId: string;
  authorName: string;
  isAnonymous: boolean;
  category: string;
  title: string;
  description: string;
  visibility: PrayerVisibility;
  targetMinistryId?: string;
  prayingCount: number;
  prayingUserIds: string[];
  isAnswered: boolean;
  testimonyText?: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  likedUserIds: string[];
  commentsCount: number;
  createdAt: string;
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
export type NotificationType = 'message' | 'announcement' | 'event' | 'prayer' | 'ministry' | 'worship' | 'system';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkRoute?: string;
  isRead: boolean;
  createdAt: string;
}

// -------------------------------------------------------------
// FACEBOOK-STYLE COMMUNITY FEED & REACTION TYPES
// -------------------------------------------------------------
export type FeedReactionType = 'like' | 'love' | 'care' | 'celebrate' | 'pray';

export interface FeedReactionMeta {
  type: FeedReactionType;
  emoji: string;
  label: string;
  color: string;
}

export const FEED_REACTIONS: Record<FeedReactionType, FeedReactionMeta> = {
  like: { type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-500' },
  love: { type: 'love', emoji: '❤️', label: 'Love', color: 'text-rose-500' },
  care: { type: 'care', emoji: '🤗', label: 'Care', color: 'text-amber-500' },
  celebrate: { type: 'celebrate', emoji: '🎉', label: 'Celebrate', color: 'text-emerald-500' },
  pray: { type: 'pray', emoji: '🙏', label: 'Pray', color: 'text-[#C5A46D]' }
};

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  reactionType: FeedReactionType;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole?: string;
  parentCommentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PostReport {
  id: string;
  postId: string;
  commentId?: string | null;
  reportedBy: string;
  reporterName: string;
  reason: 'inappropriate_language' | 'false_doctrine' | 'spam_advertising' | 'harassment' | 'other';
  reasonText?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface ModerationAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'delete_post' | 'hide_post' | 'restore_post' | 'delete_comment' | 'disable_comments' | 'enable_comments' | 'pin_announcement' | 'unpin_announcement' | 'suspend_user' | 'reinstate_user';
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  reason?: string;
  createdAt: string;
}

export type FeedPostType = 'community' | 'announcement';

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  ministryLabel?: string;
  content: string;
  postType: FeedPostType;
  category?: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt?: string;
  isHidden: boolean;
  commentsEnabled: boolean;
  
  // Announcement specific properties
  announcementTitle?: string;
  announcementPriority?: 'pinned' | 'high' | 'normal';
  isPinned?: boolean;
  pinnedAt?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  actionButtonLabel?: string;
  actionButtonUrl?: string;

  // Realtime reactions & comments
  reactions: PostReaction[];
  reactionCounts: Record<FeedReactionType, number>;
  userReaction?: FeedReactionType | null;
  comments: PostComment[];
  commentsCount: number;
}
