import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Search, Video, MoreHorizontal, Paperclip, 
  Smile, Send, CheckCheck, Pin, SquarePen, Heart, 
  Sparkles, CheckCircle2, X, Plus, PhoneCall, ChevronLeft, ChevronDown,
  Trash2, Image as ImageIcon, Camera, MessageSquare, User, Mail, Phone, ExternalLink, Shield, Maximize2,
  CornerUpLeft, Reply, Film, Download, ZoomIn, ZoomOut, Bell, BellRing, Play, Pause, Circle,
  ThumbsUp, Mic, Forward
} from 'lucide-react';
import { ChurchDataStore } from '../../services/churchDataStore';
import { UserProfile } from '../../types';
import { supabase } from '../../lib/supabase';
import { NotificationService } from '../../services/notificationService';
import { PresenceService, formatLastSeenTimestamp } from '../../services/presenceService';

// Available faith & community reaction emojis
const COMMUNITY_EMOJIS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🙏', label: 'Amen / Prayer' },
  { emoji: '👍', label: 'Agree' },
  { emoji: '🔥', label: 'Holy Spirit / Fire' },
  { emoji: '✝️', label: 'Cross / Faith' },
  { emoji: '🙌', label: 'Praise' },
  { emoji: '😊', label: 'Blessing' },
  { emoji: '🕊️', label: 'Peace / Dove' }
];

interface ReactionItem {
  emoji: string;
  count: number;
  reacted: boolean;
  userIds?: string[];
}

interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  isMe: boolean;
  content: string;
  timestamp: string;
  isDelivered?: boolean;
  reactions?: ReactionItem[];
}

interface ParsedMessage {
  reply: {
    id: string;
    senderName: string;
    text: string;
  } | null;
  photoUrl: string | null;
  videoUrl: string | null;
  caption: string;
}

// Clean preview snippet from media/reply prefixes for lobby
function cleanPreviewText(raw: string): string {
  if (!raw) return '';
  if (raw.includes('[PHOTO:')) return '📷 Photo';
  if (raw.includes('[VIDEO:')) return '🎥 Video';
  if (raw.startsWith('[REPLY:')) {
    const afterReply = raw.replace(/^\[REPLY:[^\]]+\]\s*/, '');
    if (afterReply.includes('[PHOTO:')) return '📷 Photo';
    if (afterReply.includes('[VIDEO:')) return '🎥 Video';
    return afterReply || 'Replied to a message';
  }
  return raw;
}

// Format human-friendly Messenger timestamps (e.g., Just now, 5m, 1:25 PM, Yesterday, Wed, Nov 2)
function formatMessengerTimestamp(dateInput: number | string | Date): string {
  if (!dateInput) return 'Just now';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return typeof dateInput === 'string' ? dateInput : 'Just now';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  
  const isToday = now.toDateString() === d.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === d.toDateString()) {
    return 'Yesterday';
  }

  if (diffHours < 24 * 6) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }

  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Gentle pleasant sacred audio chime via Web Audio API (cross-platform, zero external files)
const playAestheticMessageChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // Tone 1: 659.25 Hz (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: 880 Hz (A5 - harmonious fifth above)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08);
    gain2.gain.setValueAtTime(0.09, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.55);
  } catch (_) {}
};

interface ConversationItem {
  id: string;
  title: string;
  symbol?: string;
  avatar: string;
  isOnline?: boolean;
  type: 'group' | 'direct';
  lastMessage: string;
  timestamp: string;
  lastMessageTimestamp: number;
  unreadCount?: number;
  isDirectCheck?: boolean;
  memberCountText?: string;
  otherUserId?: string;
}

const KEY_CACHED_CONVERSATIONS = 'bjc_cached_conversations_v3';
const KEY_CACHED_MESSAGES = 'bjc_cached_room_messages_v3';

const INITIAL_DEFAULT_FELLOWSHIP: ConversationItem = {
  id: 'fellowship',
  title: 'Church-Wide Fellowship',
  symbol: '💬',
  avatar: '/icons/church-logo.png',
  type: 'group',
  lastMessage: 'Welcome to Beholding Jesus Church community!',
  timestamp: 'Just now',
  lastMessageTimestamp: Date.now(),
  unreadCount: 0,
  isDirectCheck: false,
  memberCountText: 'Church Fellowship Group',
  isOnline: true
};

// Aggregates all cached messages across versions to guarantee ZERO message loss
function loadAllCachedMessages(currentUserId?: string): Record<string, ChatMessageItem[]> {
  const result: Record<string, ChatMessageItem[]> = {};
  const seenIdsByRoom: Record<string, Set<string>> = {};

  const mergeIn = (rawObj: any) => {
    if (!rawObj || typeof rawObj !== 'object') return;
    for (const roomId of Object.keys(rawObj)) {
      const msgs = rawObj[roomId];
      if (!Array.isArray(msgs)) continue;
      if (!result[roomId]) result[roomId] = [];
      if (!seenIdsByRoom[roomId]) seenIdsByRoom[roomId] = new Set();

      for (const m of msgs) {
        if (!m || !m.id) continue;
        if (!seenIdsByRoom[roomId].has(m.id)) {
          seenIdsByRoom[roomId].add(m.id);
          const senderId = m.senderId || m.sender_id || '';
          result[roomId].push({
            id: m.id,
            senderId,
            senderName: m.senderName || m.sender_name || 'Church Believer',
            senderAvatar: m.senderAvatar || m.sender_avatar || '/icons/church-logo.png',
            senderRole: m.senderRole || m.sender_role || 'Church Member',
            isMe: m.isMe !== undefined ? m.isMe : (currentUserId ? senderId === currentUserId : false),
            content: m.content || '',
            timestamp: m.timestamp || (m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'),
            isDelivered: m.isDelivered ?? m.is_delivered ?? true,
            reactions: Array.isArray(m.reactions) ? m.reactions : []
          });
        }
      }
    }
  };

  try {
    const raw3 = localStorage.getItem(KEY_CACHED_MESSAGES);
    if (raw3) mergeIn(JSON.parse(raw3));

    const rawStore = localStorage.getItem('bjc_chat_messages_v2');
    if (rawStore) mergeIn(JSON.parse(rawStore));

    const raw2 = localStorage.getItem('bjc_cached_room_messages_v2');
    if (raw2) mergeIn(JSON.parse(raw2));

    const raw1 = localStorage.getItem('bjc_chat_messages_v1');
    if (raw1) mergeIn(JSON.parse(raw1));
  } catch (e) {
    console.warn('Error loading cached chat messages:', e);
  }

  // Ensure default fellowship room has inspiring welcome seeds if completely empty
  if (!result['fellowship'] || result['fellowship'].length === 0) {
    result['fellowship'] = [
      {
        id: 'msg-seed-fellowship-1',
        senderId: 'usr-pastor-john-eric',
        senderName: 'John Erick Manjares',
        senderAvatar: '/images/pastor-john-eric-manjares.png',
        senderRole: 'Senior Pastor',
        isMe: currentUserId === 'usr-pastor-john-eric',
        content: 'Welcome to Beholding Jesus Church community fellowship! "Let us consider how we may spur one another on toward love and good deeds." (Hebrews 10:24) Grace and peace to everyone!',
        timestamp: '9:00 AM',
        isDelivered: true,
        reactions: [{ emoji: '🙏', count: 6, reacted: false, userIds: [] }, { emoji: '❤️', count: 4, reacted: false, userIds: [] }]
      }
    ];
  }

  // Sort each room's messages chronologically
  for (const rId of Object.keys(result)) {
    result[rId].sort((a, b) => {
      const tA = a.id.startsWith('msg-') ? parseInt(a.id.replace('msg-', ''), 10) : 0;
      const tB = b.id.startsWith('msg-') ? parseInt(b.id.replace('msg-', ''), 10) : 0;
      return tA - tB;
    });
  }

  return result;
}

interface CommunityViewProps {
  currentUser?: UserProfile;
  onDirectChatStateChange?: (isOpen: boolean) => void;
  onConversationActiveChange?: (isActive: boolean) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ 
  currentUser: userProp,
  onDirectChatStateChange,
  onConversationActiveChange
}) => {
  const currentUser: UserProfile = userProp || ChurchDataStore.getCurrentUser() || ChurchDataStore.getRequiredCurrentUser();
  const [filterTab, setFilterTab] = useState<'all' | 'groups' | 'direct'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('bjc_last_active_room_id');
      if (saved) return saved;
    } catch {}
    return 'fellowship';
  });

  useEffect(() => {
    if (activeRoomId) {
      try {
        localStorage.setItem('bjc_last_active_room_id', activeRoomId);
      } catch {}
    }
  }, [activeRoomId]);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'chat'>('list');
  const [inputText, setInputText] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  
  // Notification State
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => NotificationService.getPermission());
  const [showNotifToast, setShowNotifToast] = useState(false);

  // Replying state
  const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; text: string } | null>(null);

  // Floating reaction picker on message
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);

  // Media attachments
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedVideo, setAttachedVideo] = useState<string | null>(null);
  const [attachedVideoName, setAttachedVideoName] = useState<string | null>(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  // Faith Note state
  const [userFaithNote, setUserFaithNote] = useState<string>(() => {
    try {
      return localStorage.getItem('bjc_my_faith_note') || 'Grace is sufficient';
    } catch {
      return 'Grace is sufficient';
    }
  });
  const [isFaithNoteModalOpen, setIsFaithNoteModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState(userFaithNote);

  // Lightbox Modal for high-resolution photo full view
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Profile Modal & User List
  const [viewingProfileUser, setViewingProfileUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => ChurchDataStore.getUsers());
  const [composeTab, setComposeTab] = useState<'direct' | 'group'>('direct');
  const [directSearchQuery, setDirectSearchQuery] = useState('');

  // Long press conversation management (Delete group chats / conversations)
  const [longPressedConv, setLongPressedConv] = useState<ConversationItem | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const startLongPress = (conv: ConversationItem) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (['super_admin', 'church_admin', 'pastor'].includes(currentUser.role) || conv.type === 'group') {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }
        setLongPressedConv(conv);
      }
    }, 550);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDeleteConversation = async (conv: ConversationItem) => {
    if (conv.id === 'fellowship') {
      alert("The main Fellowship room is a permanent church room and cannot be deleted.");
      return;
    }

    await ChurchDataStore.deleteChatRoom(conv.id);
    setConversations(prev => prev.filter(c => c.id !== conv.id));
    setRoomMessages(prev => {
      const copy = { ...prev };
      delete copy[conv.id];
      return copy;
    });

    if (activeRoomId === conv.id) {
      setActiveRoomId('fellowship');
      setMobileActiveView('list');
    }

    setLongPressedConv(null);
  };

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);

  // Local persistent reaction cache to prevent reaction flickering or wipeout from polling
  const localReactionsRef = useRef<Record<string, ReactionItem[]>>((() => {
    try {
      const raw = localStorage.getItem('bjc_local_reactions');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })());

  // Accurate Active Users Tracking via Supabase Realtime Presence
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(() => PresenceService.getOnlineUserIds());

  useEffect(() => {
    // Initialize presence for current user session
    PresenceService.init(currentUser);
    setOnlineUserIds(PresenceService.getOnlineUserIds());

    const handlePresenceUpdate = () => {
      setOnlineUserIds(PresenceService.getOnlineUserIds());
    };

    window.addEventListener('bjc_presence_change', handlePresenceUpdate);
    return () => {
      window.removeEventListener('bjc_presence_change', handlePresenceUpdate);
    };
  }, [currentUser]);

  // Mobile Visual Viewport Handling for iOS & Android Virtual Keyboard (Part 2 & Part 5)
  const [chatViewportStyle, setChatViewportStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && mobileActiveView === 'chat') {
        const vv = window.visualViewport;
        if (vv) {
          // Precisely pin conversation viewport to the visual viewport above virtual keyboard
          setChatViewportStyle({
            position: 'fixed',
            top: `${vv.offsetTop}px`,
            left: `${vv.offsetLeft}px`,
            width: `${vv.width}px`,
            height: `${vv.height}px`,
            zIndex: 45
          });
        } else {
          setChatViewportStyle({
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100dvh',
            zIndex: 45
          });
        }
      } else {
        setChatViewportStyle({});
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }
    window.addEventListener('resize', updateViewport);
    updateViewport();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
    };
  }, [mobileActiveView]);

  // Auto-scroll to latest message when mobile view or keyboard opens
  useEffect(() => {
    if (mobileActiveView === 'chat') {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 90);
      return () => clearTimeout(timer);
    }
  }, [mobileActiveView, chatViewportStyle.height]);

  // Conversations and Room Messages with instant local-first cache (0ms instant display)
  const [conversations, setConversations] = useState<ConversationItem[]>(() => {
    try {
      const raw = localStorage.getItem(KEY_CACHED_CONVERSATIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [INITIAL_DEFAULT_FELLOWSHIP];
  });

  const [roomMessages, setRoomMessages] = useState<Record<string, ChatMessageItem[]>>(() => {
    return loadAllCachedMessages(currentUser.id);
  });

  const chatHubRef = useRef<any>(null);

  // Persist conversations to cache
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem(KEY_CACHED_CONVERSATIONS, JSON.stringify(conversations));
      } catch {}
    }
  }, [conversations]);

  // Persist up to 200 messages per room to cache & backup store
  useEffect(() => {
    const keys = Object.keys(roomMessages);
    if (keys.length > 0) {
      try {
        const trimmed: Record<string, ChatMessageItem[]> = {};
        for (const k of keys) {
          trimmed[k] = (roomMessages[k] || []).slice(-200);
        }
        localStorage.setItem(KEY_CACHED_MESSAGES, JSON.stringify(trimmed));
        localStorage.setItem('bjc_chat_messages_v2', JSON.stringify(trimmed));
      } catch {}
    }
  }, [roomMessages]);

  // Read state mapping: roomId -> timestamp (ms) of when user last viewed/read messages in that room
  const [readState, setReadState] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(`bjc_chat_read_state_${currentUser.id}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const readStateRef = useRef<Record<string, number>>(readState);
  useEffect(() => {
    readStateRef.current = readState;
  }, [readState]);

  // Incoming message toast alert
  const [incomingAlert, setIncomingAlert] = useState<{
    id: string;
    senderName: string;
    senderAvatar: string;
    roomTitle: string;
    roomId: string;
    preview: string;
  } | null>(null);

  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Mark room as read
  const markRoomAsRead = (roomId: string) => {
    const now = Date.now();
    setReadState(prev => {
      const next = { ...prev, [roomId]: now };
      try {
        localStorage.setItem(`bjc_chat_read_state_${currentUser.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });

    setConversations(prev => prev.map(c => {
      if (c.id === roomId) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    }));
  };

  // Whenever activeRoomId is open or user views chat, mark active room as read
  useEffect(() => {
    if (activeRoomId) {
      markRoomAsRead(activeRoomId);
    }
  }, [activeRoomId, mobileActiveView]);

  // Total unread counts across rooms
  const totalUnreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const groupsUnreadCount = conversations.filter(c => c.type === 'group').reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const directUnreadCount = conversations.filter(c => c.type === 'direct').reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Broadcast unread count to AppLayout
  useEffect(() => {
    try {
      localStorage.setItem('bjc_unread_chat_count', String(totalUnreadCount));
      window.dispatchEvent(new CustomEvent('bjc_unread_chat_count', { detail: { count: totalUnreadCount } }));
    } catch (_) {}
  }, [totalUnreadCount]);

  const activeConversation = conversations.find(c => c.id === activeRoomId) || conversations[0];
  const currentMessages = activeRoomId ? (roomMessages[activeRoomId] || []) : [];

  // Active Conversation Tracker (Hides bottom nav and BJC AI button when inside any conversation: DM or GC)
  useEffect(() => {
    const isChatActive = mobileActiveView === 'chat';
    onConversationActiveChange?.(isChatActive);
    onDirectChatStateChange?.(isChatActive);

    const eventDetail = {
      isOpen: isChatActive,
      isDirect: activeConversation?.type === 'direct',
      isGroup: activeConversation?.type === 'group',
      roomId: activeRoomId
    };

    window.dispatchEvent(new CustomEvent('bjc_chat_conversation_view', { detail: eventDetail }));
    window.dispatchEvent(new CustomEvent('bjc_direct_chat_view', { detail: eventDetail }));

    return () => {
      onConversationActiveChange?.(false);
      onDirectChatStateChange?.(false);
      window.dispatchEvent(new CustomEvent('bjc_chat_conversation_view', { detail: { isOpen: false } }));
      window.dispatchEvent(new CustomEvent('bjc_direct_chat_view', { detail: { isOpen: false } }));
    };
  }, [mobileActiveView, activeConversation?.type, activeRoomId, onConversationActiveChange, onDirectChatStateChange]);

  // Lock background scrolling on mobile when viewing conversation
  useEffect(() => {
    if (mobileActiveView === 'chat' && typeof window !== 'undefined' && window.innerWidth < 768) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileActiveView]);

  // Sync registered users from Supabase Cloud
  useEffect(() => {
    let isMounted = true;
    ChurchDataStore.fetchUsersFromCloud().then(users => {
      if (isMounted && users && users.length > 0) {
        setRegisteredUsers(users);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Filter conversations & STRICT SORTING: Newest chat ALWAYS on top!
  const filteredConversations = conversations
    .filter(c => {
      if (filterTab === 'groups' && c.type !== 'group') return false;
      if (filterTab === 'direct' && c.type !== 'direct') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeRoomId]);

  // Request Lock Screen Notifications
  const handleEnableNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    setNotifPermission(NotificationService.getPermission());
    if (granted) {
      setShowNotifToast(true);
      setTimeout(() => setShowNotifToast(false), 4500);
    }
  };

  // Helper to parse message content for replies, photos, and videos
  const parseMessageContent = (raw: string): ParsedMessage => {
    if (!raw) return { reply: null, photoUrl: null, videoUrl: null, caption: '' };

    let content = raw;
    let reply: { id: string; senderName: string; text: string } | null = null;
    let photoUrl: string | null = null;
    let videoUrl: string | null = null;

    // 1. Check for [REPLY:id|senderName|encodedText]
    const replyMatch = content.match(/^\[REPLY:([^|]+)\|([^|]+)\|([^\]]*)\]\s*(.*)$/s);
    if (replyMatch) {
      let decodedText = replyMatch[3];
      try {
        decodedText = decodeURIComponent(replyMatch[3]);
      } catch {
        decodedText = replyMatch[3];
      }
      reply = {
        id: replyMatch[1],
        senderName: replyMatch[2],
        text: decodedText
      };
      content = replyMatch[4] || '';
    }

    // 2. Check for [PHOTO:url]
    const photoMatch = content.match(/^\[PHOTO:([^\]]+)\]\s*(.*)$/s);
    if (photoMatch) {
      photoUrl = photoMatch[1];
      content = photoMatch[2] || '';
    }

    // 3. Check for [VIDEO:url]
    const videoMatch = content.match(/^\[VIDEO:([^\]]+)\]\s*(.*)$/s);
    if (videoMatch) {
      videoUrl = videoMatch[1];
      content = videoMatch[2] || '';
    }

    return {
      reply,
      photoUrl,
      videoUrl,
      caption: content.trim()
    };
  };

  // Scroll smoothly to a referenced quoted message
  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-gold', 'bg-gold/10', 'rounded-2xl', 'transition-all', 'duration-500');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-gold', 'bg-gold/10');
      }, 2000);
    }
  };

  // Cloud Rooms & Recent Messages Sync with Supabase (Cross-device PC & Mobile)
  useEffect(() => {
    let isMounted = true;
    const loadCloudRooms = async () => {
      try {
        const [cloudRooms, recentActivity] = await Promise.all([
          ChurchDataStore.fetchChatRoomsFromCloud(),
          ChurchDataStore.fetchRecentChatActivity(40)
        ]);
        if (!isMounted) return;

        const allUsers = registeredUsers.length > 0 ? registeredUsers : ChurchDataStore.getUsers();

        // Check for brand new incoming messages to notify (toast + chime + push)
        if (!isInitialLoadRef.current && recentActivity && recentActivity.length > 0) {
          for (const msg of recentActivity) {
            if (!seenMessageIdsRef.current.has(msg.id)) {
              seenMessageIdsRef.current.add(msg.id);

              if (msg.sender_id !== currentUser.id) {
                const isCurrentlyViewing = activeRoomId === msg.room_id && (mobileActiveView === 'chat' || window.innerWidth >= 768);
                if (!isCurrentlyViewing) {
                  playAestheticMessageChime();

                  const roomTitle = cloudRooms?.find((r: any) => r.id === msg.room_id)?.title || 'Community Chat';
                  setIncomingAlert({
                    id: msg.id,
                    senderName: msg.sender_name || 'Church Believer',
                    senderAvatar: msg.sender_avatar || '/icons/church-logo.png',
                    roomTitle,
                    roomId: msg.room_id,
                    preview: cleanPreviewText(msg.content)
                  });

                  setTimeout(() => {
                    setIncomingAlert(prev => (prev?.id === msg.id ? null : prev));
                  }, 5000);

                  NotificationService.showNotification(
                    `💬 ${msg.sender_name || 'New Message'} in ${roomTitle}`,
                    cleanPreviewText(msg.content),
                    {
                      tag: `bjc-msg-${msg.room_id}`,
                      icon: msg.sender_avatar || '/icons/church-logo.png'
                    }
                  ).catch(() => {});
                }
              }
            }
          }
        } else if (recentActivity && recentActivity.length > 0) {
          recentActivity.forEach((m: any) => seenMessageIdsRef.current.add(m.id));
          isInitialLoadRef.current = false;
        }

        // Aggregate room activity map: latestMsg & unreadCount per room
        const roomActivityMap = new Map<string, { latestMsg: any; unreadCount: number }>();
        const currentReadState = readStateRef.current;

        if (recentActivity && recentActivity.length > 0) {
          for (const msg of recentActivity) {
            let entry = roomActivityMap.get(msg.room_id);
            if (!entry) {
              entry = {
                latestMsg: msg,
                unreadCount: 0
              };
              roomActivityMap.set(msg.room_id, entry);
            }

            if (msg.sender_id !== currentUser.id) {
              const lastReadAt = currentReadState[msg.room_id] ?? 0;
              const msgTime = new Date(msg.created_at).getTime();
              if (msgTime > lastReadAt) {
                entry.unreadCount += 1;
              }
            }
          }
        }

        const mapped: ConversationItem[] = [];

        // Fellowship default activity
        const fellowshipActivity = roomActivityMap.get('fellowship');
        const defaultFellowship: ConversationItem = {
          id: 'fellowship',
          title: 'Church-Wide Fellowship',
          symbol: '💬',
          avatar: '/icons/church-logo.png',
          type: 'group',
          lastMessage: fellowshipActivity?.latestMsg ? cleanPreviewText(fellowshipActivity.latestMsg.content) : 'Welcome to Beholding Jesus Church community!',
          timestamp: fellowshipActivity?.latestMsg ? formatMessengerTimestamp(fellowshipActivity.latestMsg.created_at) : 'Just now',
          lastMessageTimestamp: fellowshipActivity?.latestMsg ? new Date(fellowshipActivity.latestMsg.created_at).getTime() : 1,
          unreadCount: (activeRoomId === 'fellowship') ? 0 : (fellowshipActivity?.unreadCount || 0),
          isDirectCheck: fellowshipActivity?.latestMsg ? fellowshipActivity.latestMsg.sender_id === currentUser.id : false,
          memberCountText: 'Church Fellowship Group',
          isOnline: PresenceService.getOnlineCount() > 0
        };

        if (cloudRooms && cloudRooms.length > 0) {
          for (const r of cloudRooms) {
            const isDirect = r.type === 'direct' || r.id.startsWith('dm_');
            const activity = roomActivityMap.get(r.id);
            const isCurrentlyActive = activeRoomId === r.id;
            const unreadCount = isCurrentlyActive ? 0 : (activity?.unreadCount || 0);

            const lastMsgText = activity?.latestMsg 
              ? cleanPreviewText(activity.latestMsg.content) 
              : (r.last_message || (isDirect ? 'Personal message started.' : 'Group chat created.'));
            
            const lastMsgTime = activity?.latestMsg
              ? formatMessengerTimestamp(activity.latestMsg.created_at)
              : (r.last_message_time ? formatMessengerTimestamp(r.last_message_time) : 'Just now');

            const lastTimestampMs = activity?.latestMsg
              ? new Date(activity.latestMsg.created_at).getTime()
              : (r.created_at ? new Date(r.created_at).getTime() : 0);

            const isDirectCheck = activity?.latestMsg ? (activity.latestMsg.sender_id === currentUser.id) : false;

            if (isDirect) {
              const parts = r.id.replace('dm_', '').split('_');
              const [id1, id2] = parts;

              if (currentUser.id !== id1 && currentUser.id !== id2) {
                continue;
              }

              const otherUserId = (currentUser.id === id1) ? id2 : id1;
              const otherUser = allUsers.find(u => u.id === otherUserId);
              const isOtherOnline = otherUserId ? PresenceService.isUserOnline(otherUserId) : false;

              mapped.push({
                id: r.id,
                title: otherUser ? otherUser.name : (r.title && !r.title.includes('&') ? r.title : 'Direct Message'),
                symbol: '💬',
                avatar: otherUser?.avatar || r.avatar || '/icons/church-logo.png',
                type: 'direct',
                lastMessage: lastMsgText,
                timestamp: lastMsgTime,
                lastMessageTimestamp: lastTimestampMs,
                unreadCount,
                isDirectCheck,
                memberCountText: otherUser?.roleTitle || 'Personal Message',
                isOnline: isOtherOnline,
                otherUserId: otherUserId
              });
            } else {
              if (r.id === 'fellowship') {
                mapped.push(defaultFellowship);
                continue;
              }

              mapped.push({
                id: r.id,
                title: r.title,
                symbol: r.symbol || '💬',
                avatar: r.avatar || '/icons/church-logo.png',
                type: 'group',
                lastMessage: lastMsgText,
                timestamp: lastMsgTime,
                lastMessageTimestamp: lastTimestampMs,
                unreadCount,
                isDirectCheck,
                memberCountText: 'Church Group Chat'
              });
            }
          }

          if (!mapped.some(c => c.id === 'fellowship' || c.id === 'gc-1793742695287')) {
            mapped.unshift(defaultFellowship);
          }

          // STRICT ORDER: LATEST CHAT / NEWEST ACTIVITY FIRST AT THE TOP!
          mapped.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

          setConversations(mapped);
          setActiveRoomId(prev => (prev && mapped.some(m => m.id === prev)) ? prev : (mapped[0]?.id || 'fellowship'));
        }
      } catch (err) {
        console.warn('Rooms cloud load error:', err);
      }
    };

    loadCloudRooms();
    const interval = setInterval(loadCloudRooms, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser.id, registeredUsers]);

  // Cloud Message Sync with Supabase (Cross-device PC & Mobile)
  useEffect(() => {
    if (!activeRoomId) return;
    let isMounted = true;

    const loadCloudMessages = async () => {
      try {
        const cloudData = await ChurchDataStore.fetchChatMessagesFromCloud(activeRoomId);
        if (!isMounted) return;

        if (cloudData && cloudData.length > 0) {
          const mapped: ChatMessageItem[] = cloudData.map(d => {
            const cachedReactions = localReactionsRef.current ? localReactionsRef.current[d.id] : undefined;
            const cloudReactions: ReactionItem[] = Array.isArray(d.reactions) ? d.reactions.map((r: any) => ({
              emoji: r.emoji,
              count: r.count || 0,
              reacted: Array.isArray(r.userIds) ? r.userIds.includes(currentUser.id) : (r.reacted || false),
              userIds: r.userIds || []
            })) : [];

            // Robust reaction merge: Never let periodic cloud poll erase user's active reaction
            let effectiveReactions: ReactionItem[] = cloudReactions;
            if (cachedReactions && cachedReactions.length > 0) {
              if (effectiveReactions.length === 0) {
                effectiveReactions = cachedReactions;
              } else {
                const map = new Map<string, ReactionItem>();
                effectiveReactions.forEach(r => map.set(r.emoji, { ...r }));
                cachedReactions.forEach(cr => {
                  const curr = map.get(cr.emoji);
                  if (curr) {
                    if (cr.reacted && !curr.reacted) {
                      curr.reacted = true;
                      curr.count = Math.max(curr.count, cr.count);
                    }
                  } else {
                    map.set(cr.emoji, { ...cr });
                  }
                });
                effectiveReactions = Array.from(map.values());
              }
            }

            return {
              id: d.id,
              senderId: d.sender_id,
              senderName: d.sender_name,
              senderAvatar: d.sender_avatar || '/icons/church-logo.png',
              senderRole: d.sender_role || 'Church Member',
              isMe: d.sender_id === currentUser.id,
              content: d.content,
              timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isDelivered: d.is_delivered ?? true,
              reactions: effectiveReactions
            };
          });

          // Trigger Lock Screen / Push Notification if new message arrived from someone else
          if (mapped.length > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
            const latest = mapped[mapped.length - 1];
            if (latest && !latest.isMe) {
              NotificationService.notifyNewMessage(latest.senderName, latest.content, {
                roomId: activeRoomId,
                isDirect: activeConversation?.type === 'direct'
              });
            }
          }
          prevMessageCountRef.current = mapped.length;

          // Safe non-destructive merge: Never wipe out local or previous messages!
          setRoomMessages(prev => {
            const current = prev[activeRoomId] || [];
            const map = new Map<string, ChatMessageItem>();
            current.forEach(m => map.set(m.id, m));
            mapped.forEach(m => {
              const ex = map.get(m.id);
              if (ex) {
                map.set(m.id, {
                  ...ex,
                  ...m,
                  reactions: m.reactions && m.reactions.length > 0 ? m.reactions : ex.reactions
                });
              } else {
                map.set(m.id, m);
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => {
              const tA = a.id.startsWith('msg-') ? parseInt(a.id.replace('msg-', ''), 10) : 0;
              const tB = b.id.startsWith('msg-') ? parseInt(b.id.replace('msg-', ''), 10) : 0;
              return tA - tB;
            });
            return {
              ...prev,
              [activeRoomId]: merged
            };
          });

          const last = mapped[mapped.length - 1];
          if (last) {
            const parsed = parseMessageContent(last.content);
            let previewSnippet = last.content;
            if (parsed.photoUrl) {
              previewSnippet = '📷 Photo' + (parsed.caption ? `: ${parsed.caption}` : '');
            } else if (parsed.videoUrl) {
              previewSnippet = '🎥 Video' + (parsed.caption ? `: ${parsed.caption}` : '');
            } else if (parsed.caption) {
              previewSnippet = parsed.caption;
            }

            setConversations(prev => prev.map(c => c.id === activeRoomId ? {
              ...c,
              lastMessage: previewSnippet,
              timestamp: last.timestamp
            } : c));
          }
        }
      } catch (err) {
        console.warn('Chat cloud load error:', err);
      }
    };

    loadCloudMessages();
    const interval = setInterval(loadCloudMessages, 12000);

    let channel: any = null;
    if (supabase) {
      try {
        channel = supabase
          .channel(`room-${activeRoomId}`)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'church_chat_messages',
            filter: `room_id=eq.${activeRoomId}` 
          }, () => {
            loadCloudMessages();
          })
          .subscribe();
      } catch {
        // channel error fallback
      }
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (channel && supabase) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, [activeRoomId, currentUser.id, activeConversation?.type]);

  // Global Real-Time Supabase WebSocket Broadcast Channel (Sub-50ms message sync across all devices)
  useEffect(() => {
    if (!supabase) return;
    let isSubscribed = true;

    try {
      const channel = supabase.channel('bjc-community-chat-hub', {
        config: {
          broadcast: { self: false }
        }
      });

      channel.on('broadcast', { event: 'new_chat_message' }, ({ payload }: any) => {
        if (!isSubscribed) return;
        handleIncomingBroadcastMessage(payload);
      });

      channel.on('broadcast', { event: 'chat_reaction' }, ({ payload }: any) => {
        if (!isSubscribed) return;
        handleIncomingBroadcastReaction(payload);
      });

      channel.on('broadcast', { event: 'chat_delete' }, ({ payload }: any) => {
        if (!isSubscribed) return;
        handleIncomingBroadcastDelete(payload);
      });

      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          chatHubRef.current = channel;
        }
      });

      chatHubRef.current = channel;

      return () => {
        isSubscribed = false;
        try {
          supabase.removeChannel(channel);
        } catch (_) {}
      };
    } catch (e) {
      console.warn('Realtime chat hub error:', e);
    }
  }, [currentUser.id]);

  // Handle Real-Time Incoming Message from another user
  const handleIncomingBroadcastMessage = (payload: { message: any; roomId: string; targetUserId?: string }) => {
    if (!payload || !payload.message || !payload.roomId) return;
    const msg = payload.message;

    // Check if seen to prevent duplicate rendering
    if (seenMessageIdsRef.current.has(msg.id)) return;
    seenMessageIdsRef.current.add(msg.id);

    // If direct message, verify if this user is a participant
    if (payload.roomId.startsWith('dm_')) {
      const isParticipant = payload.roomId.includes(currentUser.id) || payload.targetUserId === currentUser.id;
      if (!isParticipant) return;
    }

    // Format to ChatMessageItem
    const formattedMsg: ChatMessageItem = {
      id: msg.id,
      senderId: msg.senderId || msg.sender_id || '',
      senderName: msg.senderName || msg.sender_name || 'Church Believer',
      senderAvatar: msg.senderAvatar || msg.sender_avatar || '/icons/church-logo.png',
      senderRole: msg.senderRole || msg.sender_role || 'Church Member',
      isMe: (msg.senderId || msg.sender_id) === currentUser.id,
      content: msg.content || '',
      timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDelivered: true,
      reactions: msg.reactions || []
    };

    // 1. Append to room messages
    setRoomMessages(prev => {
      const roomList = prev[payload.roomId] || [];
      if (roomList.some(m => m.id === formattedMsg.id)) return prev;
      return {
        ...prev,
        [payload.roomId]: [...roomList, formattedMsg]
      };
    });

    // 2. Preview text for conversation lobby
    const parsed = parseMessageContent(formattedMsg.content);
    let previewSnippet = formattedMsg.content;
    if (parsed.photoUrl) previewSnippet = '📷 Photo' + (parsed.caption ? `: ${parsed.caption}` : '');
    else if (parsed.videoUrl) previewSnippet = '🎥 Video' + (parsed.caption ? `: ${parsed.caption}` : '');
    else if (parsed.caption) previewSnippet = parsed.caption;

    const isCurrentActive = activeRoomId === payload.roomId && (mobileActiveView === 'chat' || window.innerWidth >= 768);

    // 3. If actively in this room: play chime & auto-scroll
    if (isCurrentActive) {
      if (!formattedMsg.isMe) {
        playAestheticMessageChime();
      }
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      // 4. If in another room or lobby: alert, chime, notification, unread count
      if (!formattedMsg.isMe) {
        playAestheticMessageChime();

        setIncomingAlert({
          id: formattedMsg.id,
          senderName: formattedMsg.senderName,
          senderAvatar: formattedMsg.senderAvatar,
          roomTitle: conversations.find(c => c.id === payload.roomId)?.title || 'Fellowship',
          roomId: payload.roomId,
          preview: cleanPreviewText(previewSnippet)
        });

        setTimeout(() => {
          setIncomingAlert(prev => prev?.id === formattedMsg.id ? null : prev);
        }, 5000);

        NotificationService.notifyNewMessage(
          formattedMsg.senderName,
          cleanPreviewText(previewSnippet),
          { roomId: payload.roomId, isDirect: payload.roomId.startsWith('dm_') }
        ).catch(() => {});
      }
    }

    // 5. Update or insert conversation item in lobby
    setConversations(prev => {
      const now = Date.now();
      const existing = prev.find(c => c.id === payload.roomId);

      if (existing) {
        const updated = prev.map(c => {
          if (c.id === payload.roomId) {
            return {
              ...c,
              lastMessage: cleanPreviewText(previewSnippet),
              timestamp: 'Just now',
              lastMessageTimestamp: now,
              unreadCount: isCurrentActive ? 0 : ((c.unreadCount || 0) + 1),
              isDirectCheck: formattedMsg.isMe
            };
          }
          return c;
        });
        return [...updated].sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
      } else if (payload.roomId.startsWith('dm_')) {
        const otherUserId = formattedMsg.isMe ? payload.targetUserId : formattedMsg.senderId;
        const otherUser = registeredUsers.find(u => u.id === otherUserId);
        const newDmConv: ConversationItem = {
          id: payload.roomId,
          title: otherUser?.name || formattedMsg.senderName,
          symbol: '💬',
          avatar: otherUser?.avatar || formattedMsg.senderAvatar,
          type: 'direct',
          lastMessage: cleanPreviewText(previewSnippet),
          timestamp: 'Just now',
          lastMessageTimestamp: now,
          unreadCount: isCurrentActive ? 0 : 1,
          isDirectCheck: formattedMsg.isMe,
          memberCountText: otherUser?.roleTitle || 'Personal Message',
          isOnline: PresenceService.isUserOnline(otherUserId),
          otherUserId
        };
        return [newDmConv, ...prev].sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
      }
      return prev;
    });
  };

  // Handle Real-Time Incoming Reactions
  const handleIncomingBroadcastReaction = (payload: { roomId: string; messageId: string; reactions: ReactionItem[] }) => {
    if (!payload || !payload.roomId || !payload.messageId) return;
    setRoomMessages(prev => {
      const list = prev[payload.roomId] || [];
      const updated = list.map(m => {
        if (m.id === payload.messageId) {
          return {
            ...m,
            reactions: payload.reactions
          };
        }
        return m;
      });
      return {
        ...prev,
        [payload.roomId]: updated
      };
    });
  };

  // Handle Real-Time Incoming Message Deletion
  const handleIncomingBroadcastDelete = (payload: { roomId: string; messageId: string }) => {
    if (!payload || !payload.roomId || !payload.messageId) return;
    setRoomMessages(prev => {
      const list = (prev[payload.roomId] || []).filter(m => m.id !== payload.messageId);
      return {
        ...prev,
        [payload.roomId]: list
      };
    });
  };

  // Photo file picker handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const MAX_SIZE = 1000;
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setAttachedImage(dataUrl);
        setAttachedVideo(null);
        setAttachedVideoName(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Video file picker handler
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideoMime = file.type.startsWith('video/');
    const isVideoExt = file.name.match(/\.(mp4|mov|webm|quicktime|m4v|3gp|avi)$/i);

    if (!isVideoMime && !isVideoExt) {
      alert('Please select a valid video clip (MP4, MOV, WebM, etc.).');
      return;
    }

    // Size limit check: 35MB
    if (file.size > 35 * 1024 * 1024) {
      alert('Video file is larger than 35MB. Please choose a shorter clip for fellowship chat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedVideo(event.target?.result as string);
      setAttachedVideoName(file.name);
      setAttachedImage(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    textareaRef.current?.focus();
  };

  // Auto-expanding message textarea handler (Part 3)
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 112)}px`;
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && typeof window !== 'undefined' && window.innerWidth >= 768) {
      e.preventDefault();
      if (inputText.trim() || attachedImage || attachedVideo) {
        handleSendMessage(e as any);
      }
    }
  };

  // Send message handler with Reply, Photo, and Video support
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedImage && !attachedVideo) return;

    let fullContent = inputText.trim();

    // 1. Attach Video or Photo
    if (attachedVideo) {
      fullContent = `[VIDEO:${attachedVideo}] ${fullContent}`.trim();
    } else if (attachedImage) {
      fullContent = `[PHOTO:${attachedImage}] ${fullContent}`.trim();
    }

    // 2. Attach Quoted Reply
    if (replyingTo) {
      const encodedText = encodeURIComponent(replyingTo.text);
      fullContent = `[REPLY:${replyingTo.id}|${replyingTo.senderName}|${encodedText}] ${fullContent}`.trim();
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgId = `msg-${Date.now()}`;

    const newMsg: ChatMessageItem = {
      id: newMsgId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || '/icons/church-logo.png',
      senderRole: currentUser.roleTitle || 'Church Member',
      isMe: true,
      content: fullContent,
      timestamp: timeString,
      isDelivered: true,
      reactions: []
    };

    // Optimistic local update
    setRoomMessages(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMsg]
    }));

    let previewSnippet = inputText.trim();
    if (attachedVideo) previewSnippet = '🎥 Video' + (previewSnippet ? `: ${previewSnippet}` : '');
    else if (attachedImage) previewSnippet = '📷 Photo' + (previewSnippet ? `: ${previewSnippet}` : '');

    setConversations(prev => {
      const now = Date.now();
      const updated = prev.map(c => {
        if (c.id === activeRoomId) {
          return {
            ...c,
            lastMessage: previewSnippet,
            timestamp: 'Just now',
            lastMessageTimestamp: now,
            isDirectCheck: true,
            unreadCount: 0
          };
        }
        return c;
      });
      return [...updated].sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
    });

    // Reset inputs
    setInputText('');
    setAttachedImage(null);
    setAttachedVideo(null);
    setAttachedVideoName(null);
    setReplyingTo(null);
    setIsEmojiPickerOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);

    // Broadcast immediately over Supabase Realtime WebSocket to all participants (sub-50ms delivery)
    if (chatHubRef.current) {
      chatHubRef.current.send({
        type: 'broadcast',
        event: 'new_chat_message',
        payload: {
          roomId: activeRoomId,
          targetUserId: activeConversation?.otherUserId,
          message: newMsg
        }
      });
    }

    // Persist to Cloud DB & Local Storage
    ChurchDataStore.sendChatMessageToCloud({
      id: newMsgId,
      roomId: activeRoomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || '/icons/church-logo.png',
      senderRole: currentUser.roleTitle || 'Church Member',
      content: fullContent,
      reactions: []
    }).catch(() => {});
  };

  // Messenger-Style Quick Reaction / Like Handler (Thumbs Up / Amen)
  const handleSendQuickLike = (emoji: string = '👍') => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgId = `msg-${Date.now()}`;

    const newMsg: ChatMessageItem = {
      id: newMsgId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || '/icons/church-logo.png',
      senderRole: currentUser.roleTitle || 'Church Member',
      isMe: true,
      content: emoji,
      timestamp: timeString,
      isDelivered: true,
      reactions: []
    };

    setRoomMessages(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMsg]
    }));

    setConversations(prev => {
      const now = Date.now();
      const updated = prev.map(c => {
        if (c.id === activeRoomId) {
          return {
            ...c,
            lastMessage: emoji,
            timestamp: 'Just now',
            lastMessageTimestamp: now,
            isDirectCheck: true,
            unreadCount: 0
          };
        }
        return c;
      });
      return [...updated].sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
    });

    // Broadcast immediately over Supabase Realtime WebSocket
    if (chatHubRef.current) {
      chatHubRef.current.send({
        type: 'broadcast',
        event: 'new_chat_message',
        payload: {
          roomId: activeRoomId,
          targetUserId: activeConversation?.otherUserId,
          message: newMsg
        }
      });
    }

    ChurchDataStore.sendChatMessageToCloud({
      id: newMsgId,
      roomId: activeRoomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || '/icons/church-logo.png',
      senderRole: currentUser.roleTitle || 'Church Member',
      content: emoji,
      reactions: []
    }).catch(() => {});
  };

  // Toggle Reaction on message (Cross-Device Cloud Sync)
  const handleToggleReaction = (msgId: string, emoji: string) => {
    setActiveReactionMsgId(null);

    const list = roomMessages[activeRoomId] || [];
    const targetMsg = list.find(m => m.id === msgId);
    if (!targetMsg) return;

    const reactions: ReactionItem[] = targetMsg.reactions 
      ? targetMsg.reactions.map(r => ({
          emoji: r.emoji,
          count: r.count,
          reacted: r.reacted,
          userIds: r.userIds ? [...r.userIds] : []
        }))
      : [];

    const existing = reactions.find(r => r.emoji === emoji);

    if (existing) {
      const userIds = existing.userIds ? [...existing.userIds] : [];
      if (existing.reacted) {
        existing.count = Math.max(0, existing.count - 1);
        existing.reacted = false;
        existing.userIds = userIds.filter(id => id !== currentUser.id);
      } else {
        existing.count += 1;
        existing.reacted = true;
        if (!userIds.includes(currentUser.id)) userIds.push(currentUser.id);
        existing.userIds = userIds;
      }
    } else {
      reactions.push({ emoji, count: 1, reacted: true, userIds: [currentUser.id] });
    }

    const filteredReactions = reactions.filter(r => r.count > 0);

    // 1. Immediately update React state
    setRoomMessages(prev => {
      const currentList = prev[activeRoomId] || [];
      const updated = currentList.map(msg => {
        if (msg.id !== msgId) return msg;
        return {
          ...msg,
          reactions: filteredReactions
        };
      });
      return {
        ...prev,
        [activeRoomId]: updated
      };
    });

    // 2. Save synchronously to local persistent reaction cache so interval polling never clears it
    if (!localReactionsRef.current) (localReactionsRef as any).current = {};
    localReactionsRef.current[msgId] = filteredReactions;
    try {
      localStorage.setItem('bjc_local_reactions', JSON.stringify(localReactionsRef.current));
    } catch {}

    // 3. Broadcast real-time reaction update over WebSocket
    if (chatHubRef.current) {
      chatHubRef.current.send({
        type: 'broadcast',
        event: 'chat_reaction',
        payload: {
          roomId: activeRoomId,
          messageId: msgId,
          reactions: filteredReactions
        }
      });
    }

    // 4. Sync to Cloud DB
    ChurchDataStore.updateChatReactionsInCloud(msgId, filteredReactions).catch(() => {});
  };

  // Delete message handler
  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    setRoomMessages(prev => {
      const list = (prev[activeRoomId] || []).filter(m => m.id !== msgId);
      return {
        ...prev,
        [activeRoomId]: list
      };
    });

    // Broadcast deletion in real time to all clients
    if (chatHubRef.current) {
      chatHubRef.current.send({
        type: 'broadcast',
        event: 'chat_delete',
        payload: {
          roomId: activeRoomId,
          messageId: msgId
        }
      });
    }

    await ChurchDataStore.deleteChatMessageFromCloud(msgId);
    ChurchDataStore.deleteMessage(activeRoomId, msgId);
  };

  // Start 1-on-1 Direct Message with another member
  const handleStartDirectMessage = async (targetUser: UserProfile) => {
    if (targetUser.id === currentUser.id) {
      alert("You cannot start a direct message with yourself.");
      return;
    }

    const sortedIds = [currentUser.id, targetUser.id].sort();
    const dmRoomId = `dm_${sortedIds.join('_')}`;

    const existing = conversations.find(c => c.id === dmRoomId);
    if (!existing) {
      const newDm: ConversationItem = {
        id: dmRoomId,
        title: targetUser.name,
        symbol: '💬',
        avatar: targetUser.avatar || '/icons/church-logo.png',
        type: 'direct',
        lastMessage: 'Personal message started.',
        timestamp: 'Just now',
        lastMessageTimestamp: Date.now(),
        unreadCount: 0,
        memberCountText: targetUser.roleTitle || 'Personal Message',
        isOnline: PresenceService.isUserOnline(targetUser.id),
        otherUserId: targetUser.id
      };

      setConversations(prev => [newDm, ...prev]);

      await ChurchDataStore.createChatRoomInCloud({
        id: dmRoomId,
        title: `${currentUser.name} & ${targetUser.name}`,
        type: 'direct',
        symbol: '💬',
        avatar: targetUser.avatar || '/icons/church-logo.png',
        createdBy: currentUser.id
      });
    }

    setActiveRoomId(dmRoomId);
    setFilterTab('direct');
    setMobileActiveView('chat');
    setIsComposeModalOpen(false);
    setViewingProfileUser(null);
  };

  // View Member Profile
  const handleViewProfile = (senderId: string, senderName: string, senderAvatar: string, senderRole?: string) => {
    const found = registeredUsers.find(u => u.id === senderId);
    if (found) {
      setViewingProfileUser(found);
    } else {
      setViewingProfileUser({
        id: senderId,
        name: senderName,
        username: senderName.toLowerCase().replace(/\s+/g, ''),
        email: `${senderName.toLowerCase().replace(/\s+/g, '')}@beholdingjesus.org`,
        role: 'member',
        roleTitle: senderRole || 'Church Member',
        avatar: senderAvatar || '/icons/church-logo.png',
        bio: 'Disciple of Christ at Beholding Jesus Church.',
        joinedDate: 'Active Member'
      });
    }
  };

  // Prepare reply to message
  const handleInitiateReply = (msg: ChatMessageItem) => {
    const parsed = parseMessageContent(msg.content);
    let preview = parsed.caption || 'Message';
    if (parsed.photoUrl) preview = '📷 Photo' + (parsed.caption ? `: ${parsed.caption}` : '');
    else if (parsed.videoUrl) preview = '🎥 Video' + (parsed.caption ? `: ${parsed.caption}` : '');

    setReplyingTo({
      id: msg.id,
      senderName: msg.senderName,
      text: preview.slice(0, 80)
    });

    textareaRef.current?.focus();
  };

  // Create new group chat
  const handleCreateNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;

    const newId = `gc-${Date.now()}`;
    const title = newChatTitle.trim();
    const newConv: ConversationItem = {
      id: newId,
      title,
      symbol: '💬',
      avatar: '/icons/church-logo.png',
      type: 'group',
      lastMessage: `Group chat created by ${currentUser.name}.`,
      timestamp: 'Just now',
      lastMessageTimestamp: Date.now(),
      unreadCount: 0,
      memberCountText: 'Church Group Chat'
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveRoomId(newId);
    setNewChatTitle('');
    setIsComposeModalOpen(false);

    await ChurchDataStore.createChatRoomInCloud({
      id: newId,
      title,
      type: 'group',
      avatar: '/icons/church-logo.png',
      createdBy: currentUser.id
    });

    const welcomeMsgId = `msg-${Date.now()}`;
    await ChurchDataStore.sendChatMessageToCloud({
      id: welcomeMsgId,
      roomId: newId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || '/icons/church-logo.png',
      senderRole: currentUser.roleTitle || 'Church Member',
      content: `Welcome to ${title}! May God bless our fellowship and conversations here. 🙏`,
      reactions: []
    });
  };

  // Truly active church members only (verified online presence or current session)
  const activeMembers = registeredUsers
    .filter(u => PresenceService.isUserOnline(u.id))
    .map(user => ({
      ...user,
      isOnline: true,
      activityBadge: user.id === currentUser.id 
        ? 'You (Active)' 
        : (user.role === 'pastor' ? 'Pastor Online' : 'Active Now')
    }));

  // Faith thought note generator for Messenger-style story bubbles
  const getFaithNote = (user: { id: string; role?: string }) => {
    if (user.role === 'pastor') return 'Preaching Grace 📖';
    if (user.role === 'ministry_leader') return 'Serving Christ ✨';
    const notes = ['Blessed 🙏', 'Sunday 9AM 🎶', 'Grace & Peace 🕊️', 'In Prayer ✝️', 'Faithful ❤️', 'Joy in Lord 🙌', 'Love God 👑'];
    const code = user.id.charCodeAt(user.id.length - 1) || 0;
    return notes[code % notes.length];
  };

  const extractUrl = (text: string): string | null => {
    if (!text) return null;
    const match = text.match(/(https?:\/\/[^\s]+)/i);
    return match ? match[0] : null;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-0 md:px-4 lg:px-6 py-0 md:py-2 relative">
      
      {/* Aesthetic In-App Notification Toast */}
      {incomingAlert && (
        <div 
          onClick={() => {
            markRoomAsRead(incomingAlert.roomId);
            setActiveRoomId(incomingAlert.roomId);
            setMobileActiveView('chat');
            setIncomingAlert(null);
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999999] w-[92%] max-w-md bg-[#111c2e]/95 dark:bg-[#0c121e]/95 backdrop-blur-2xl border border-amber-500/50 rounded-2xl shadow-2xl p-3 flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-all duration-300 animate-in slide-in-from-top-6 text-white"
        >
          <div className="relative shrink-0">
            <img 
              src={incomingAlert.senderAvatar || '/icons/church-logo.png'} 
              alt={incomingAlert.senderName} 
              className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400/90 shadow-md"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-xs ring-1 ring-slate-900">
              <Bell className="w-2.5 h-2.5 fill-current" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs gap-1">
              <span className="font-bold text-amber-300 truncate">{incomingAlert.senderName}</span>
              <span className="text-[10px] text-slate-300 px-2 py-0.5 rounded-full bg-white/10 shrink-0 font-medium">
                {incomingAlert.roomTitle}
              </span>
            </div>
            <p className="text-xs text-slate-200 truncate mt-0.5 font-medium">
              {incomingAlert.preview}
            </p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIncomingAlert(null);
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN CHAT SYSTEM LAYOUT (Maximized Screen Height & Messenger UI)*/}
      {/* ============================================================== */}
      <div className="rounded-none md:rounded-3xl bg-white dark:bg-slate-900 border-0 md:border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[calc(100dvh-75px)] md:h-[calc(100vh-120px)] min-h-[500px]">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: MESSENGER INBOX & STORIES                       */}
        {/* ============================================================ */}
        <div className={`${mobileActiveView === 'chat' ? 'hidden md:flex' : 'flex'} md:col-span-5 lg:col-span-4 border-r border-slate-200/80 dark:border-slate-800 flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-slate-900`}>
          
          {/* Top Bar (Messenger style: Avatar, Chats Title, Compose button) */}
          <div className="shrink-0 px-4 pt-3.5 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setViewingProfileUser(currentUser)}
                className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:ring-2 hover:ring-gold/40 transition shrink-0"
                title={`${currentUser.name} (View Profile)`}
              >
                <img 
                  src={currentUser.avatar || '/icons/church-logo.png'} 
                  alt="My Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">
                  Chats
                </h1>
                {totalUnreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-700 dark:text-amber-400 text-[11px] font-black flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    {totalUnreadCount} new
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleEnableNotifications}
                className={`p-2 rounded-full relative transition ${
                  notifPermission === 'granted'
                    ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={notifPermission === 'granted' ? 'Lock Screen Alerts are active' : 'Enable notifications'}
              >
                {notifPermission === 'granted' ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {totalUnreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs animate-pulse">
                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setComposeTab('direct');
                  setIsComposeModalOpen(true);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center transition active:scale-95 shadow-2xs"
                title="New Message or Group"
              >
                <SquarePen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Capsule (Messenger Pill Input) */}
          <div className="shrink-0 px-4 py-1.5">
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-full px-3.5 py-2 transition focus-within:ring-2 focus-within:ring-gold/30">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Ask BJC AI or search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Stories / Active Members Horizontal Tray (Messenger Style) */}
          <div className="shrink-0 px-3 pt-2.5 pb-2.5 flex items-center gap-3.5 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800/60">
            
            {/* 1st Item: Your Story / Faith Note (Compact & Organized) */}
            <div 
              onClick={() => setIsFaithNoteModalOpen(true)}
              className="flex flex-col items-center shrink-0 w-16 cursor-pointer group text-center"
              title="Tap to set your faith note or testimony"
            >
              <div className="relative mb-1 flex flex-col items-center">
                {/* Speech note bubble above head */}
                <div className="mb-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[9px] text-slate-700 dark:text-slate-200 font-semibold max-w-[68px] truncate shadow-xs border border-slate-300/60 dark:border-slate-700">
                  {userFaithNote || 'Faith note...'}
                </div>
                {/* Fixed-size circular avatar container */}
                <div 
                  className="relative rounded-full p-0.5 shrink-0 bg-gradient-to-tr from-gold to-amber-200 shadow-xs"
                  style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', maxWidth: '56px', maxHeight: '56px' }}
                >
                  <img 
                    src={currentUser.avatar || '/icons/church-logo.png'} 
                    alt="You" 
                    className="w-full h-full rounded-full object-cover shrink-0 block border border-white dark:border-slate-900" 
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-gold text-slate-950 flex items-center justify-center text-[11px] font-black border-2 border-white dark:border-slate-900 shadow-xs">
                    +
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[64px]">
                Your note
              </span>
            </div>

            {/* Other Active Members with Thought Bubbles */}
            {activeMembers.filter(m => m.id !== currentUser.id).map(member => (
              <div
                key={member.id}
                onClick={() => handleViewProfile(member.id, member.name, member.avatar, member.roleTitle)}
                className="flex flex-col items-center shrink-0 w-16 cursor-pointer group text-center"
                title={`${member.name} (${member.roleTitle}) - Active now`}
              >
                <div className="relative mb-1 flex flex-col items-center">
                  {/* Speech note bubble above head */}
                  <div className="mb-1 px-2 py-0.5 rounded-full bg-[#1e293b] dark:bg-[#1a2b42] text-[#EADBB8] text-[9px] font-bold max-w-[68px] truncate shadow-xs border border-gold/25">
                    {getFaithNote(member)}
                  </div>
                  {/* Fixed-size circular avatar container */}
                  <div 
                    className="relative rounded-full p-0.5 shrink-0"
                    style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', maxWidth: '56px', maxHeight: '56px' }}
                  >
                    <img 
                      src={member.avatar || '/icons/church-logo.png'} 
                      alt={member.name} 
                      className="w-full h-full rounded-full object-cover border-2 border-emerald-400 group-hover:border-gold transition shadow-xs shrink-0 block" 
                    />
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs"></span>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-gold truncate max-w-[64px]">
                  {member.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Filter Pills (All, Groups, Direct) */}
          <div className="shrink-0 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {[
              { id: 'all', label: 'All', count: totalUnreadCount },
              { id: 'groups', label: 'Groups', count: groupsUnreadCount },
              { id: 'direct', label: 'Direct', count: directUnreadCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3.5 py-1 rounded-full font-bold transition text-xs active:scale-95 flex items-center gap-1.5 ${
                  filterTab === tab.id
                    ? 'bg-slate-900 dark:bg-gold text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                    filterTab === tab.id ? 'bg-amber-400 text-slate-950' : 'bg-amber-500 text-white'
                  }`}>
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Conversations Scroll Area (Messenger Luxury Cards) */}
          <div className="flex-1 min-h-0 overflow-y-auto py-1 px-1.5 space-y-0.5">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Conversations Found</p>
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto">Start a fellowship chat or send a private note to a believer.</p>
                <button 
                  onClick={() => {
                    setComposeTab('direct');
                    setIsComposeModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gold text-slate-950 font-bold text-xs shadow-gold hover:bg-gold-dark hover:text-white transition"
                >
                  + Start a Chat
                </button>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isActive = conv.id === activeRoomId;
                const hasUnread = Boolean(conv.unreadCount && conv.unreadCount > 0);

                return (
                  <div
                    key={conv.id}
                    onTouchStart={() => startLongPress(conv)}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    onMouseDown={() => startLongPress(conv)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (['super_admin', 'church_admin', 'pastor'].includes(currentUser.role) || conv.type === 'group') {
                        setLongPressedConv(conv);
                      }
                    }}
                    onClick={() => {
                      if (isLongPressTriggeredRef.current) {
                        isLongPressTriggeredRef.current = false;
                        return;
                      }
                      markRoomAsRead(conv.id);
                      setActiveRoomId(conv.id);
                      setMobileActiveView('chat');
                    }}
                    className={`px-3 py-2.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3.5 select-none relative ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800/90 shadow-2xs'
                        : hasUnread
                          ? 'bg-amber-500/[0.07] dark:bg-amber-400/[0.08] hover:bg-amber-500/[0.12] border-l-3 border-amber-500 shadow-2xs'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Large circular avatar with online indicator and unread ring */}
                    <div className="relative shrink-0">
                      <img
                        src={conv.avatar}
                        alt={conv.title}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover transition-all ${
                          hasUnread
                            ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-sm'
                            : 'border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                        }`}
                      />
                      {(() => {
                        const directId = conv.type === 'direct'
                          ? (conv.otherUserId || conv.id.replace('dm_', '').split('_').find(id => id !== currentUser.id))
                          : null;
                        const isOnline = conv.type === 'direct'
                          ? PresenceService.isUserOnline(directId)
                          : (PresenceService.getOnlineCount() > 0);
                        return isOnline ? (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs"></span>
                        ) : null;
                      })()}
                    </div>

                    {/* Conversation Title & Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <div className={`flex items-center gap-1.5 text-sm truncate ${
                          hasUnread ? 'font-black text-slate-950 dark:text-white' : 'font-bold text-slate-800 dark:text-slate-100'
                        }`}>
                          <span className="truncate">{conv.title}</span>
                          {conv.id === 'fellowship' && (
                            <Pin className="w-3.5 h-3.5 text-gold shrink-0 rotate-45" />
                          )}
                        </div>
                        <span className={`text-[11px] shrink-0 ml-1 transition-colors ${
                          hasUnread ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-slate-400 font-medium'
                        }`}>
                          {conv.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className={`text-xs truncate flex items-center gap-1 ${
                          hasUnread 
                            ? 'font-bold text-slate-900 dark:text-white' 
                            : 'text-slate-500 dark:text-slate-400 font-normal'
                        }`}>
                          {conv.isDirectCheck && (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          )}
                          <span className="truncate">{conv.lastMessage}</span>
                        </p>

                        {/* Aesthetic Unread Number Badge */}
                        {hasUnread ? (
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="min-w-5 h-5 px-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-md shadow-amber-500/35 ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-75">
                              {conv.unreadCount! > 99 ? '99+' : conv.unreadCount}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: MESSENGER CHAT ROOM (Exact Match to Image 2)  */}
        {/* ============================================================ */}
        <div 
          data-no-swipe="true"
          style={mobileActiveView === 'chat' && typeof window !== 'undefined' && window.innerWidth < 768 ? chatViewportStyle : undefined}
          className={`${
            mobileActiveView === 'list' ? 'hidden md:flex' : 'flex'
          } md:col-span-7 lg:col-span-8 flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-slate-950 ${
            mobileActiveView === 'chat' ? 'fixed inset-0 z-40 md:relative md:inset-auto md:z-auto' : ''
          }`}
        >
          
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 my-auto">
              <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-800 dark:text-white mb-2">Beholding Jesus Church Community</h3>
              <p className="text-sm text-slate-500 max-w-md mb-6">Connect, fellowship, and encourage one another in the faith.</p>
              <button 
                onClick={() => {
                  setComposeTab('direct');
                  setIsComposeModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs shadow-gold hover:bg-gold-dark hover:text-white transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Conversation</span>
              </button>
            </div>
          ) : (
            <>
          {/* Top Chat Header */}
          <div className="shrink-0 p-3 sm:px-6 pt-[max(env(safe-area-inset-top),12px)] bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              
              {/* Back button on mobile */}
              <button
                onClick={() => setMobileActiveView('list')}
                className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 flex items-center gap-1 cursor-pointer"
                title="Back to conversations"
              >
                <ChevronLeft className="w-5 h-5 text-gold" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Back</span>
              </button>

              <div className="relative shrink-0">
                <img
                  src={activeConversation.avatar}
                  alt={activeConversation.title}
                  onClick={() => {
                    if (activeConversation.type === 'direct') {
                      const memberId = activeConversation.otherUserId || activeConversation.id.replace('dm_', '').split('_').find(id => id !== currentUser.id);
                      if (memberId) {
                        const u = registeredUsers.find(ru => ru.id === memberId);
                        if (u) setViewingProfileUser(u);
                      }
                    }
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:ring-2 hover:ring-gold/40 transition"
                />
                {(() => {
                  const directId = activeConversation.type === 'direct'
                    ? (activeConversation.otherUserId || activeConversation.id.replace('dm_', '').split('_').find(id => id !== currentUser.id))
                    : null;
                  const isOnline = activeConversation.type === 'direct'
                    ? PresenceService.isUserOnline(directId)
                    : PresenceService.getOnlineCount() > 0;
                  return (
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}></span>
                  );
                })()}
              </div>

              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h2 
                    onClick={() => {
                      if (activeConversation.type === 'direct') {
                        const memberId = activeConversation.otherUserId || activeConversation.id.replace('dm_', '').split('_').find(id => id !== currentUser.id);
                        if (memberId) {
                          const u = registeredUsers.find(ru => ru.id === memberId);
                          if (u) setViewingProfileUser(u);
                        }
                      }
                    }}
                    className="font-bold text-xs sm:text-base text-slate-900 dark:text-white truncate cursor-pointer hover:text-gold transition"
                  >
                    {activeConversation.title}
                  </h2>
                  {activeConversation.type === 'group' && (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A46D] shrink-0" />
                  )}
                  {activeConversation.type === 'direct' && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold tracking-wide uppercase shrink-0">
                      Direct
                    </span>
                  )}
                </div>
                {(() => {
                  const directId = activeConversation.type === 'direct'
                    ? (activeConversation.otherUserId || activeConversation.id.replace('dm_', '').split('_').find(id => id !== currentUser.id))
                    : null;
                  const isOnline = activeConversation.type === 'direct'
                    ? PresenceService.isUserOnline(directId)
                    : PresenceService.getOnlineCount() > 0;
                  const statusText = activeConversation.type === 'direct'
                    ? (isOnline ? 'Active Now' : PresenceService.getLastSeenText(directId))
                    : `${PresenceService.getOnlineCount()} Active Now • Church Group`;

                  return (
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      <span>{statusText}</span>
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Right Action Icons: Notification Bell, Profile, Video Call */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Lock screen alert quick toggle */}
              <button
                onClick={handleEnableNotifications}
                className={`p-2 rounded-full transition flex items-center gap-1 ${
                  notifPermission === 'granted'
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                }`}
                title={notifPermission === 'granted' ? 'Lock Screen Alerts are active' : 'Click to enable lock screen notifications'}
              >
                {notifPermission === 'granted' ? (
                  <BellRing className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4 animate-bounce" />
                )}
              </button>

              {activeConversation.type === 'direct' && (
                <button
                  onClick={() => {
                    const memberId = activeConversation.id.replace('dm_', '').split('_').find(id => id !== currentUser.id);
                    if (memberId) {
                      const u = registeredUsers.find(ru => ru.id === memberId);
                      if (u) setViewingProfileUser(u);
                    }
                  }}
                  className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="View Member Profile"
                >
                  <User className="w-4 h-4 text-gold" />
                </button>
              )}

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Fellowship Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toast Alert Confirmation */}
          {showNotifToast && (
            <div className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-md transition-all">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4" />
                <span>🔔 Lock Screen Notifications Enabled! You will receive church alerts even when your phone is locked.</span>
              </div>
              <button onClick={() => setShowNotifToast(false)} className="text-white hover:opacity-75">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* MESSENGER PINNED ANNOUNCEMENT / EXHORTATION BANNER           */}
          {/* ============================================================ */}
          <div className="shrink-0 px-4 py-2 bg-slate-900/90 dark:bg-[#0c0e14]/95 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300 shadow-xs">
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 shrink-0 shadow-xs">
                <Pin className="w-3.5 h-3.5 text-gold rotate-45" />
              </span>
              <span className="truncate font-medium text-slate-200">
                {activeConversation.type === 'direct'
                  ? `Direct message thread • ${activeConversation.title}`
                  : 'Weekly Sunday Grace Service @ 10:00 AM • "Beholding the Glory of Christ"'}
              </span>
            </div>
            <button 
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              title="Pinned notice options"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* ============================================================ */}
          {/* MESSAGES SCROLL FEED (Messenger Theme)                       */}
          {/* ============================================================ */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3">
            
            {/* Centered Date Divider */}
            <div className="flex justify-center my-2">
              <span className="px-4 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800/80 text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 tracking-wider uppercase shadow-2xs">
                {activeConversation.type === 'direct' ? `Direct Conversation with ${activeConversation.title}` : 'Church Community Fellowship'}
              </span>
            </div>

            {/* Empty Room State */}
            {currentMessages.length === 0 && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium">No messages yet. Send a greeting, photo, or video to start connecting!</p>
              </div>
            )}

            {/* Render Current Room Messages */}
            {currentMessages.map((msg, index) => {
              const parsed = parseMessageContent(msg.content);
              const canDelete = msg.isMe || ['super_admin', 'church_admin', 'pastor'].includes(currentUser.role);
              const isReactionPickerOpen = activeReactionMsgId === msg.id;
              const isSingleEmoji = parsed.caption && !parsed.photoUrl && !parsed.videoUrl && !parsed.reply && /^[\p{Emoji}\u200d\uFE0F\s]{1,4}$/u.test(parsed.caption.trim());
              const urlMatch = parsed.caption ? parsed.caption.match(/https?:\/\/[^\s]+/) : null;
              const showTimestampDivider = index === 0 || (index > 0 && currentMessages[index - 1].timestamp !== msg.timestamp);

              return (
                <React.Fragment key={msg.id}>
                  {/* Centered Messenger Timestamp Divider (e.g. WED 9:27 PM) */}
                  {showTimestampDivider && (
                    <div className="flex justify-center my-3">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {msg.timestamp.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {msg.isMe ? (
                    // OUTGOING BUBBLE (Messenger Style: Deep Slate #1E293B, curved rounded-[22px] rounded-br-[4px])
                    <div id={`msg-${msg.id}`} className="flex justify-end items-end gap-2 my-2 group relative animate-slide-up">
                      
                      {/* Messenger Forward Share Button for Links/Media */}
                      {(urlMatch || parsed.photoUrl || parsed.videoUrl) && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(urlMatch ? urlMatch[0] : (parsed.photoUrl || parsed.videoUrl || ''));
                            alert('Link copied to clipboard!');
                          }}
                          className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition self-center opacity-0 group-hover:opacity-100 shadow-xs"
                          title="Share / Forward Link"
                        >
                          <Forward className="w-4 h-4" />
                        </button>
                      )}

                      {/* Action Toolbar on Hover (Reaction, Reply, Delete) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-sm">
                        <button
                          onClick={() => setActiveReactionMsgId(isReactionPickerOpen ? null : msg.id)}
                          className="p-1 rounded-full text-slate-500 hover:text-gold transition hover:scale-115"
                          title="Add Reaction"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleInitiateReply(msg)}
                          className="p-1 rounded-full text-slate-500 hover:text-gold transition hover:scale-115"
                          title="Reply to message"
                        >
                          <CornerUpLeft className="w-3.5 h-3.5" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition hover:scale-115"
                            title="Delete Message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Floating Reaction Bar popover */}
                      {isReactionPickerOpen && (
                        <div className="absolute right-12 bottom-full mb-1.5 p-1.5 bg-white dark:bg-slate-800 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-700 flex items-center gap-1 z-30 animate-in fade-in zoom-in-95">
                          {COMMUNITY_EMOJIS.map(em => (
                            <button
                              key={em.emoji}
                              onClick={() => handleToggleReaction(msg.id, em.emoji)}
                              className="p-1.5 text-base hover:scale-130 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                              title={em.label}
                            >
                              {em.emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col items-end max-w-[85%] sm:max-w-[70%]">
                        {isSingleEmoji ? (
                          /* Messenger Giant Emoji Render */
                          <div className="text-4xl sm:text-5xl my-1 select-none hover:scale-110 transition duration-150">
                            {parsed.caption}
                          </div>
                        ) : (
                          /* Messenger Bubble */
                          <div className="bg-[#1E293B] text-white rounded-[22px] rounded-br-[4px] p-3 sm:px-4 sm:py-3 shadow-md text-xs sm:text-[13.5px] leading-relaxed space-y-2 border border-slate-700/60">
                            
                            {/* Quoted Reply Preview Bar */}
                            {parsed.reply && (
                              <div 
                                onClick={() => scrollToMessage(parsed.reply!.id)}
                                className="mb-2 p-2 rounded-xl bg-white/10 border-l-3 border-[#C5A46D] text-xs cursor-pointer hover:bg-white/15 transition text-left"
                                title="Click to view original message"
                              >
                                <div className="flex items-center gap-1 font-bold text-[11px] text-[#C5A46D]">
                                  <CornerUpLeft className="w-3 h-3" />
                                  <span>{parsed.reply.senderName}</span>
                                </div>
                                <p className="text-[11px] opacity-85 truncate mt-0.5">{parsed.reply.text}</p>
                              </div>
                            )}

                            {/* Attached Photo */}
                            {parsed.photoUrl && (
                              <div 
                                onClick={() => {
                                  setLightboxImage(parsed.photoUrl);
                                  setLightboxZoom(1);
                                }}
                                className="rounded-xl overflow-hidden cursor-pointer group/photo relative max-w-sm border border-slate-700 shadow-sm"
                                title="Click for full-screen photo view"
                              >
                                <img
                                  src={parsed.photoUrl}
                                  alt="Attached photo"
                                  className="w-full max-h-72 object-cover rounded-xl group-hover/photo:scale-102 transition duration-200"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 transition flex items-center justify-center gap-1 text-white text-xs font-semibold">
                                  <span className="p-1.5 rounded-full bg-black/60">
                                    <Maximize2 className="w-4 h-4" />
                                  </span>
                                  <span>Full View</span>
                                </div>
                              </div>
                            )}

                            {/* Attached Video Player */}
                            {parsed.videoUrl && (
                              <div className="rounded-xl overflow-hidden max-w-sm border border-slate-700 bg-black shadow-md">
                                <video
                                  src={parsed.videoUrl}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full max-h-80 rounded-xl"
                                />
                              </div>
                            )}

                            {/* Text Caption or Content */}
                            {parsed.caption && (
                              <div className="break-words">
                                {parsed.caption}
                              </div>
                            )}

                            {/* Messenger URL Preview Card */}
                            {urlMatch && (
                              <div className="mt-2 rounded-xl overflow-hidden bg-slate-900/90 border border-slate-700/80 shadow-inner">
                                <a 
                                  href={urlMatch[0]} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="p-2.5 block hover:bg-slate-800/80 transition"
                                >
                                  <div className="text-[11px] font-bold text-slate-200 truncate">
                                    {urlMatch[0].replace(/^https?:\/\//, '')}
                                  </div>
                                  <div className="text-[9.5px] text-slate-400 truncate mt-0.5">
                                    Tap to open secure link
                                  </div>
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Messenger "Sent" status indicator under outgoing bubble */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium pr-1 pt-1">
                          <span>Sent {msg.timestamp}</span>
                          <CheckCheck className="w-3 h-3 text-gold inline" />
                        </div>

                        {/* Reaction Pills below bubble */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex items-center gap-1.5 pr-1 pt-1 flex-wrap justify-end">
                            {msg.reactions.map((react, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleToggleReaction(msg.id, react.emoji)}
                                className={`px-2 py-0.5 rounded-full text-xs border flex items-center gap-1 shadow-2xs transition ${
                                  react.reacted
                                    ? 'bg-[#C5A46D]/25 border-[#C5A46D] text-slate-900 dark:text-white font-bold ring-1 ring-[#C5A46D]/40'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                }`}
                                title={react.reacted ? 'Click to remove reaction' : 'Click to react'}
                              >
                                <span>{react.emoji}</span>
                                <span className="text-[10px] font-semibold">{react.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sender Avatar */}
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        onClick={() => handleViewProfile(msg.senderId, msg.senderName, msg.senderAvatar, msg.senderRole)}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 cursor-pointer hover:ring-2 hover:ring-gold/40 transition"
                        title="View Profile"
                      />
                    </div>
                  ) : (
                    // INCOMING BUBBLE (Messenger Style: White/Dark Slate, curved rounded-[22px] rounded-bl-[4px])
                    <div id={`msg-${msg.id}`} className="flex items-start gap-2.5 my-2 group relative animate-slide-up">
                      
                      {/* Sender Avatar */}
                      <div className="relative shrink-0 mt-1">
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          onClick={() => handleViewProfile(msg.senderId, msg.senderName, msg.senderAvatar, msg.senderRole)}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:ring-2 hover:ring-gold/40 transition"
                          title="View Profile"
                        />
                      </div>

                      <div className="flex flex-col items-start max-w-[85%] sm:max-w-[70%] space-y-1">
                        {/* Sender Name */}
                        <div className="flex items-center gap-2 pl-1">
                          <span 
                            onClick={() => handleViewProfile(msg.senderId, msg.senderName, msg.senderAvatar, msg.senderRole)}
                            className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:underline"
                          >
                            {msg.senderName}
                          </span>
                          {msg.senderRole && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              • {msg.senderRole}
                            </span>
                          )}
                        </div>

                        {isSingleEmoji ? (
                          /* Messenger Giant Emoji Render */
                          <div className="text-4xl sm:text-5xl my-1 select-none hover:scale-110 transition duration-150">
                            {parsed.caption}
                          </div>
                        ) : (
                          /* Messenger Bubble */
                          <div className="bg-white dark:bg-[#1e2330] text-slate-900 dark:text-white rounded-[22px] rounded-bl-[4px] p-3 sm:px-4 sm:py-3 shadow-xs border border-slate-200/80 dark:border-slate-800 text-xs sm:text-[13.5px] leading-relaxed space-y-2">
                            
                            {/* Quoted Reply Preview Bar */}
                            {parsed.reply && (
                              <div 
                                onClick={() => scrollToMessage(parsed.reply!.id)}
                                className="mb-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-l-3 border-[#C5A46D] text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition text-left"
                                title="Click to view original message"
                              >
                                <div className="flex items-center gap-1 font-bold text-[11px] text-[#C5A46D]">
                                  <CornerUpLeft className="w-3 h-3" />
                                  <span>{parsed.reply.senderName}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{parsed.reply.text}</p>
                              </div>
                            )}

                            {/* Attached Photo */}
                            {parsed.photoUrl && (
                              <div 
                                onClick={() => {
                                  setLightboxImage(parsed.photoUrl);
                                  setLightboxZoom(1);
                                }}
                                className="rounded-xl overflow-hidden cursor-pointer group/photo relative max-w-sm border border-slate-200 dark:border-slate-700 shadow-sm"
                                title="Click for full-screen photo view"
                              >
                                <img
                                  src={parsed.photoUrl}
                                  alt="Attached photo"
                                  className="w-full max-h-72 object-cover rounded-xl group-hover/photo:scale-102 transition duration-200"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 transition flex items-center justify-center gap-1 text-white text-xs font-semibold">
                                  <span className="p-1.5 rounded-full bg-black/60">
                                    <Maximize2 className="w-4 h-4" />
                                  </span>
                                  <span>Full View</span>
                                </div>
                              </div>
                            )}

                            {/* Attached Video Player */}
                            {parsed.videoUrl && (
                              <div className="rounded-xl overflow-hidden max-w-sm border border-slate-200 dark:border-slate-700 bg-black shadow-md">
                                <video
                                  src={parsed.videoUrl}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full max-h-80 rounded-xl"
                                />
                              </div>
                            )}

                            {/* Text Content */}
                            {parsed.caption && (
                              <div className="break-words">
                                {parsed.caption}
                              </div>
                            )}

                            {/* Messenger URL Preview Card */}
                            {urlMatch && (
                              <div className="mt-2 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                                <a 
                                  href={urlMatch[0]} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="p-2.5 block hover:bg-slate-200 dark:hover:bg-slate-800/80 transition"
                                >
                                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {urlMatch[0].replace(/^https?:\/\//, '')}
                                  </div>
                                  <div className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    Tap to open secure link
                                  </div>
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reaction Pills below bubble */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex items-center gap-1.5 pl-1 pt-1 flex-wrap">
                            {msg.reactions.map((react, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleToggleReaction(msg.id, react.emoji)}
                                className={`px-2 py-0.5 rounded-full text-xs border flex items-center gap-1 shadow-2xs transition ${
                                  react.reacted
                                    ? 'bg-gold/25 border-[#C5A46D] text-slate-900 dark:text-white font-bold ring-1 ring-[#C5A46D]/40'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                }`}
                                title={react.reacted ? 'Click to remove reaction' : 'Click to react'}
                              >
                                <span>{react.emoji}</span>
                                <span className="text-[10px] font-semibold">{react.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Messenger Forward Share Button for Links/Media */}
                      {(urlMatch || parsed.photoUrl || parsed.videoUrl) && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(urlMatch ? urlMatch[0] : (parsed.photoUrl || parsed.videoUrl || ''));
                            alert('Link copied to clipboard!');
                          }}
                          className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition self-center opacity-0 group-hover:opacity-100 shadow-xs"
                          title="Share / Forward Link"
                        >
                          <Forward className="w-4 h-4" />
                        </button>
                      )}

                      {/* Incoming Action Toolbar on Hover (Reaction, Reply) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-sm">
                        <button
                          onClick={() => setActiveReactionMsgId(isReactionPickerOpen ? null : msg.id)}
                          className="p-1 rounded-full text-slate-500 hover:text-gold transition hover:scale-115"
                          title="Add Reaction"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleInitiateReply(msg)}
                          className="p-1 rounded-full text-slate-500 hover:text-gold transition hover:scale-115"
                          title="Reply to message"
                        >
                          <CornerUpLeft className="w-3.5 h-3.5" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition hover:scale-115"
                            title="Delete Message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Floating Reaction Bar popover */}
                      {isReactionPickerOpen && (
                        <div className="absolute left-12 bottom-full mb-1.5 p-1.5 bg-white dark:bg-slate-800 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-700 flex items-center gap-1 z-30 animate-in fade-in zoom-in-95">
                          {COMMUNITY_EMOJIS.map(em => (
                            <button
                              key={em.emoji}
                              onClick={() => handleToggleReaction(msg.id, em.emoji)}
                              className="p-1.5 text-base hover:scale-130 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                              title={em.label}
                            >
                              {em.emoji}
                            </button>
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </React.Fragment>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* ============================================================ */}
          {/* BOTTOM CHAT INPUT BAR (MESSENGER CAPSULE LAYOUT)             */}
          {/* ============================================================ */}
          <div className="shrink-0 p-2.5 sm:p-3 sm:px-4 pb-[max(env(safe-area-inset-bottom),12px)] bg-white dark:bg-[#0c0e14] border-t border-slate-200/80 dark:border-slate-800/80 relative z-20">
            
            {/* Active Quoted Reply Preview Bar */}
            {replyingTo && (
              <div className="mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-l-4 border-gold border border-slate-200 dark:border-slate-700 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 overflow-hidden text-xs">
                  <CornerUpLeft className="w-4 h-4 text-gold shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-800 dark:text-white">Replying to {replyingTo.senderName}: </span>
                    <span className="text-slate-500 dark:text-slate-400 truncate">{replyingTo.text}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                  title="Cancel reply"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Attached Photo Preview Bar */}
            {attachedImage && (
              <div className="mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img
                    src={attachedImage}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-600 shrink-0"
                  />
                  <div className="text-xs truncate">
                    <div className="font-bold text-slate-800 dark:text-white truncate">Photo ready to send</div>
                    <div className="text-[11px] text-slate-500">Tap Send to share photo with fellowship</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Attached Video Preview Bar */}
            {attachedVideo && (
              <div className="mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center text-white shrink-0">
                    <Film className="w-6 h-6 text-gold" />
                  </div>
                  <div className="text-xs truncate">
                    <div className="font-bold text-slate-800 dark:text-white truncate">
                      {attachedVideoName || 'Video ready to send'}
                    </div>
                    <div className="text-[11px] text-slate-400">Tap Send to share video with fellowship</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedVideo(null);
                    setAttachedVideoName(null);
                  }}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                  title="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Emoji Picker popover */}
            {isEmojiPickerOpen && (
              <div className="absolute bottom-full right-16 mb-2 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 z-30 animate-in fade-in zoom-in-95">
                {COMMUNITY_EMOJIS.map(em => (
                  <button
                    key={em.emoji}
                    onClick={() => {
                      setInputText(prev => prev + ' ' + em.emoji);
                      setIsEmojiPickerOpen(false);
                      textareaRef.current?.focus();
                    }}
                    className="p-1.5 text-lg hover:scale-125 transition"
                    title={em.label}
                  >
                    {em.emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Hidden File Inputs for Photos & Videos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,video/mp4,video/quicktime,video/mov,video/webm"
              className="hidden"
              onChange={handleVideoSelect}
            />

            {/* Messenger Capsule Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2 relative">
              
              {/* Left Action: Messenger '+' Expand Menu for Camera / Video */}
              <div className="flex items-center gap-1 shrink-0 relative">
                {/* '+' Expand Toggle */}
                <button
                  type="button"
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition shrink-0 ${
                    isAttachMenuOpen 
                      ? 'bg-gold text-slate-950 rotate-45 shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Attach media or voice note"
                >
                  <Plus className="w-4 h-4 stroke-[2.5] transition-transform duration-200" />
                </button>

                {/* Direct Camera Button (Always visible on mobile & desktop) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition shrink-0"
                  title="Send Photo"
                >
                  <Camera className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                </button>

                {/* Direct Video Button (Always visible on mobile & desktop) */}
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition shrink-0"
                  title="Send Video Clip"
                >
                  <Film className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                </button>

                {/* Attachment Menu Popover when '+' is clicked */}
                {isAttachMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 p-1.5 bg-white dark:bg-slate-800 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-700 flex flex-col gap-1 z-30 min-w-[175px] animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setIsAttachMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
                    >
                      <Camera className="w-4 h-4 text-gold" />
                      <span>Take / Send Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        videoInputRef.current?.click();
                        setIsAttachMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
                    >
                      <Film className="w-4 h-4 text-sky-500" />
                      <span>Send Video Clip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText(prev => prev + ' 🎙️ [Voice note: God bless you]');
                        setIsAttachMenuOpen(false);
                        textareaRef.current?.focus();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left"
                    >
                      <Mic className="w-4 h-4 text-emerald-500" />
                      <span>Send Voice Note</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Center Pill Capsule with Aa placeholder & inside action icons */}
              <div className="flex-1 min-w-0 flex items-center bg-slate-100 dark:bg-[#1a2332] rounded-2xl sm:rounded-full px-3 sm:px-3.5 py-1 sm:py-1.5 border border-slate-200/80 dark:border-slate-800 focus-within:ring-2 focus-within:ring-gold/40 transition">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder={
                    replyingTo
                      ? `Replying to ${replyingTo.senderName}...`
                      : attachedVideo
                      ? "Add a caption for this video..."
                      : attachedImage
                      ? "Add a caption for this photo..."
                      : "Aa"
                  }
                  className="flex-1 bg-transparent py-1 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none max-h-28 overflow-y-auto leading-relaxed"
                  style={{ minHeight: '26px' }}
                />
                
                {/* Inside Right: Smiley Face */}
                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  className="p-1 text-slate-400 hover:text-gold transition shrink-0"
                  title="Insert Faith Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Inside Right: Mic Button */}
                <button
                  type="button"
                  onClick={() => {
                    setInputText(prev => prev + ' 🎙️ [Voice note: God bless you]');
                    textareaRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-gold transition shrink-0"
                  title="Send Voice Fellowship Note"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Far Right Action Button: Gold Send Button IF typing, or Messenger Gold ThumbsUp IF empty */}
              {inputText.trim() || attachedImage || attachedVideo ? (
                <button
                  type="submit"
                  className="w-9 h-9 rounded-full bg-[#1E293B] dark:bg-gold text-white dark:text-slate-950 flex items-center justify-center transition shadow-md hover:scale-105 active:scale-95 shrink-0"
                  title="Send Message"
                >
                  <Send className="w-4 h-4 stroke-[2.2] translate-x-[-1px] translate-y-[-1px]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendQuickLike('👍')}
                  className="w-9 h-9 rounded-full text-gold hover:scale-125 active:scale-90 transition flex items-center justify-center shrink-0"
                  title="Send Quick Like 👍"
                >
                  <ThumbsUp className="w-5 h-5 fill-current text-gold" />
                </button>
              )}
            </form>
          </div>
            </>
          )}

        </div>

      </div>

      {/* ============================================================== */}
      {/* 3.5 FAITH NOTE / TESTIMONY MODAL                               */}
      {/* ============================================================== */}
      {isFaithNoteModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gold/15 text-gold flex items-center justify-center text-sm font-bold shadow-xs">
                  💭
                </span>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base leading-tight">Your Faith Note</h3>
                  <p className="text-[10px] text-slate-500">Shared with church fellowship</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFaithNoteModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share a scripture, prayer, or encouragement. It displays in a floating bubble above your avatar for fellow believers.
            </p>

            <input
              type="text"
              maxLength={40}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="e.g. Grace is sufficient 🙏"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/40"
            />

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                'Grace is sufficient 🙏',
                'Beholding Jesus ✝️',
                'Praying for youth 🔥',
                'God is good always ❤️',
                'Peace be with you 🕊️'
              ].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setNoteInput(chip)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-gold/15 text-[10px] font-medium text-slate-700 dark:text-slate-300 transition"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setUserFaithNote('');
                  localStorage.removeItem('bjc_my_faith_note');
                  setIsFaithNoteModalOpen(false);
                }}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Clear Note
              </button>
              <button
                type="button"
                onClick={() => {
                  const saved = noteInput.trim() || 'Grace is sufficient';
                  setUserFaithNote(saved);
                  localStorage.setItem('bjc_my_faith_note', saved);
                  setIsFaithNoteModalOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-gold hover:bg-[#b09058] text-slate-950 text-xs font-bold transition shadow-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. HIGH-RESOLUTION PHOTO LIGHTBOX MODAL (Full View & Zoom)     */}
      {/* ============================================================== */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[9999999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4"
        >
          {/* Top Lightbox Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white p-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gold" />
              <span className="text-sm font-semibold">Church Community Photo Viewer</span>
            </div>

            {/* Lightbox Controls: Zoom In, Zoom Out, Download, Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxZoom(z => Math.max(0.5, z - 0.25))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLightboxZoom(1)}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition"
                title="Reset Zoom"
              >
                {Math.round(lightboxZoom * 100)}%
              </button>
              <button
                onClick={() => setLightboxZoom(z => Math.min(3, z + 0.25))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = lightboxImage;
                  a.download = `bjc-community-photo-${Date.now()}.jpg`;
                  a.click();
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                title="Download Photo"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setLightboxImage(null);
                  setLightboxZoom(1);
                }}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image with Zoom */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-4 w-full">
            <img
              src={lightboxImage}
              alt="Enlarged community photo"
              style={{ transform: `scale(${lightboxZoom})` }}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl transition-transform duration-200 select-none"
            />
          </div>

          {/* Bottom helper */}
          <div className="text-slate-400 text-xs text-center pb-2">
            Tip: Use the controls above to zoom or download. Press Close or tap outside to exit.
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. COMPOSE CHAT & DIRECT MESSAGE MODAL                         */}
      {/* ============================================================== */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Start New Conversation
              </h3>
              <button onClick={() => setIsComposeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setComposeTab('direct')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  composeTab === 'direct'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <User className="w-3.5 h-3.5 text-gold" />
                <span>Private Message (1-on-1)</span>
              </button>
              <button
                type="button"
                onClick={() => setComposeTab('group')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  composeTab === 'group'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-gold" />
                <span>Group Chat</span>
              </button>
            </div>

            {composeTab === 'direct' ? (
              /* 1-on-1 Direct Message Member List */
              <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search church members..."
                    value={directSearchQuery}
                    onChange={(e) => setDirectSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                  {registeredUsers
                    .filter(u => u.id !== currentUser.id)
                    .filter(u => !directSearchQuery.trim() || u.name.toLowerCase().includes(directSearchQuery.toLowerCase()) || (u.username || '').toLowerCase().includes(directSearchQuery.toLowerCase()))
                    .map(member => (
                      <div
                        key={member.id}
                        onClick={() => handleStartDirectMessage(member)}
                        className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={member.avatar || '/icons/church-logo.png'}
                              alt={member.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {member.role === 'pastor' && (
                                <span className="px-1.5 py-0.2 rounded-full bg-gold/20 text-gold-dark text-[9px] font-bold">PASTOR</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              @{member.username || 'member'} • {member.roleTitle || 'Church Member'}
                            </div>
                          </div>
                        </div>

                        <button className="px-2.5 py-1 rounded-lg bg-gold/15 text-gold-dark dark:text-gold font-bold text-[11px] hover:bg-gold hover:text-slate-950 transition">
                          Chat
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              /* Group Chat Creation Form */
              <form onSubmit={handleCreateNewChat} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Group or Discussion Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wednesday Prayer Cell, Youth Rehearsal"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/40"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1e293b] text-white hover:bg-slate-800 shadow-soft"
                  >
                    Create Group Chat
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MEMBER PROFILE MODAL                                        */}
      {/* ============================================================== */}
      {viewingProfileUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-center">
            
            <div className="flex justify-end">
              <button 
                onClick={() => setViewingProfileUser(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar */}
            <div className="relative inline-block mx-auto">
              <img
                src={viewingProfileUser.avatar || '/icons/church-logo.png'}
                alt={viewingProfileUser.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-gold/40 shadow-card mx-auto"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>

            {/* Name & Role */}
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                {viewingProfileUser.name}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold/15 text-gold-dark dark:text-gold font-bold text-xs uppercase tracking-wide">
                <Shield className="w-3 h-3" />
                <span>{viewingProfileUser.roleTitle || 'Church Member'}</span>
              </div>
              <p className="text-xs text-slate-400">
                @{viewingProfileUser.username || 'member'}
              </p>
            </div>

            {/* Bio */}
            {viewingProfileUser.bio && (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic px-2 leading-relaxed">
                “{viewingProfileUser.bio}”
              </p>
            )}

            {/* Details */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 text-left">
              {viewingProfileUser.email && (
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span className="truncate">{viewingProfileUser.email}</span>
                </div>
              )}
              {viewingProfileUser.phone && (
                <div className="flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>{viewingProfileUser.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>Beholding Jesus Church Community</span>
              </div>
            </div>

            {/* Direct Message Action */}
            {viewingProfileUser.id !== currentUser.id && (
              <button
                onClick={() => handleStartDirectMessage(viewingProfileUser)}
                className="w-full py-2.5 rounded-xl bg-[#1e293b] text-white hover:bg-black font-bold text-xs shadow-soft transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-gold" />
                <span>Send Private Message</span>
              </button>
            )}

            {/* Super Admin Delete Account Action */}
            {currentUser.role === 'super_admin' && viewingProfileUser.id !== currentUser.id && (
              <button
                onClick={async () => {
                  const confirmed = confirm(
                    `[SUPER ADMIN ACTION]\n\nAre you sure you want to permanently delete the account of "${viewingProfileUser.name}" (@${viewingProfileUser.username})?\n\nThis will remove their profile and all church access.`
                  );
                  if (!confirmed) return;
                  await ChurchDataStore.deleteUser(viewingProfileUser.id);
                  setRegisteredUsers(prev => prev.filter(u => u.id !== viewingProfileUser.id));
                  setViewingProfileUser(null);
                  alert(`Account for "${viewingProfileUser.name}" has been permanently deleted.`);
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Delete Member Account</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6.5 LONG-PRESS CHAT ACTION MODAL (Delete Group Chat / Thread)   */}
      {/* ============================================================== */}
      {longPressedConv && (
        <div 
          onClick={() => setLongPressedConv(null)}
          className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-bottom-4"
          >
            <div className="flex items-center gap-3">
              <img 
                src={longPressedConv.avatar} 
                alt={longPressedConv.title} 
                className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {longPressedConv.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                    {longPressedConv.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {longPressedConv.lastMessage || 'Conversation thread'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Conversation</span>
              </div>
              <p className="text-[11px] text-rose-600/90 dark:text-rose-300/80 leading-relaxed">
                {longPressedConv.id === 'fellowship'
                  ? 'The default church fellowship room cannot be deleted.'
                  : `Are you sure you want to delete "${longPressedConv.title}"? All chat history and messages will be permanently removed.`}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLongPressedConv(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              {longPressedConv.id !== 'fellowship' && (
                <button
                  type="button"
                  onClick={() => handleDeleteConversation(longPressedConv)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. VIDEO CALL MODAL                                            */}
      {/* ============================================================== */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-soft">
              <PhoneCall className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                Church Fellowship Call
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Connecting to <strong>{activeConversation.title}</strong> prayer and fellowship audio/video room.
              </p>
            </div>
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#1e293b] text-white text-xs font-bold hover:bg-slate-800"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
