import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export interface PresenceUserPayload {
  userId: string;
  sessionId: string;
  name: string;
  role: string;
  avatar: string;
  onlineAt: string;
  device: 'mobile' | 'desktop';
}

const STORAGE_KEY_LAST_SEEN = 'bjc_user_last_seen_map_v2';
const STORAGE_KEY_SESSION_ID = 'bjc_client_session_id_v2';

// Human-friendly last seen formatting (e.g. Active Now, Active 5m ago, Active 1h ago, Active yesterday)
export function formatLastSeenTimestamp(timestampMs: number | string | Date | undefined | null): string {
  if (!timestampMs) return 'Offline';
  const d = new Date(timestampMs);
  const time = d.getTime();
  if (isNaN(time)) return 'Offline';

  const now = Date.now();
  const diffMs = now - time;
  if (diffMs < 0) return 'Active just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return 'Active just now';
  if (diffMin < 60) return `Active ${diffMin}m ago`;
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  if (diffDays === 1) return 'Active yesterday';
  if (diffDays < 7) return `Active ${diffDays}d ago`;

  return `Active ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

class PresenceServiceImpl {
  private channel: any = null;
  private currentUserId: string | null = null;
  private sessionId: string;
  private onlineUsersMap: Map<string, PresenceUserPayload[]> = new Map();
  private lastSeenMap: Map<string, number> = new Map();
  private isInitialized = false;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.loadLastSeenFromStorage();

    // Listen to network connection changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkReconnect());
      window.addEventListener('offline', () => this.handleNetworkDisconnect());
      window.addEventListener('pagehide', () => this.handlePageUnload());
      window.addEventListener('beforeunload', () => this.handlePageUnload());
    }
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    try {
      let id = sessionStorage.getItem(STORAGE_KEY_SESSION_ID);
      if (!id) {
        id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem(STORAGE_KEY_SESSION_ID, id);
      }
      return id;
    } catch {
      return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  private loadLastSeenFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LAST_SEEN);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([uid, ts]) => {
            if (typeof ts === 'number') this.lastSeenMap.set(uid, ts);
          });
        }
      }
    } catch {}
  }

  private saveLastSeenToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, number> = {};
      this.lastSeenMap.forEach((ts, uid) => {
        obj[uid] = ts;
      });
      localStorage.setItem(STORAGE_KEY_LAST_SEEN, JSON.stringify(obj));
    } catch {}
  }

  /**
   * Initializes real-time presence for the authenticated user.
   * Tracks this tab's unique session under the user's presence key.
   */
  public init(currentUser: UserProfile) {
    if (!currentUser || !currentUser.id) return;

    // If already tracking same user, ensure tracking payload is up to date
    if (this.currentUserId === currentUser.id && this.channel) {
      this.trackCurrentSession(currentUser);
      return;
    }

    this.cleanup();
    this.currentUserId = currentUser.id;
    this.isInitialized = true;

    // Self is always online in this active session
    this.recordSelfPresence(currentUser);

    if (!supabase) {
      this.notifyPresenceChange();
      return;
    }

    try {
      // Connect to Realtime Presence Channel
      this.channel = supabase.channel('bjc-community-presence-hub', {
        config: {
          presence: { key: currentUser.id }
        }
      });

      // SYNC: presence state updated (users joined/left/reconnected)
      this.channel.on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      });

      // JOIN: a user or session joined
      this.channel.on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        if (!key) return;
        const existing = this.onlineUsersMap.get(key) || [];
        const sessionMap = new Map<string, PresenceUserPayload>();
        existing.forEach(p => sessionMap.set(p.sessionId, p));
        (newPresences || []).forEach((p: PresenceUserPayload) => {
          if (p.sessionId) sessionMap.set(p.sessionId, p);
        });
        this.onlineUsersMap.set(key, Array.from(sessionMap.values()));
        this.notifyPresenceChange();
      });

      // LEAVE: a session left or disconnected
      this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        if (!key) return;
        const existing = this.onlineUsersMap.get(key) || [];
        const leftSessionIds = new Set((leftPresences || []).map((p: any) => p.sessionId));
        const remaining = existing.filter(p => !leftSessionIds.has(p.sessionId));

        if (remaining.length > 0) {
          // User is still online on another device / tab!
          this.onlineUsersMap.set(key, remaining);
        } else {
          // All sessions have disconnected -> user is now offline!
          this.onlineUsersMap.delete(key);
          this.lastSeenMap.set(key, Date.now());
          this.saveLastSeenToStorage();
        }
        this.notifyPresenceChange();
      });

      // Subscribe and track
      this.channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await this.trackCurrentSession(currentUser);
        }
      });
    } catch (err) {
      console.warn('PresenceService subscription error:', err);
      this.recordSelfPresence(currentUser);
      this.notifyPresenceChange();
    }
  }

  private recordSelfPresence(currentUser: UserProfile) {
    const selfPayload: PresenceUserPayload = {
      userId: currentUser.id,
      sessionId: this.sessionId,
      name: currentUser.name,
      role: currentUser.roleTitle,
      avatar: currentUser.avatar,
      onlineAt: new Date().toISOString(),
      device: typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    };
    this.onlineUsersMap.set(currentUser.id, [selfPayload]);
  }

  private async trackCurrentSession(currentUser: UserProfile) {
    if (!this.channel) return;
    try {
      const payload: PresenceUserPayload = {
        userId: currentUser.id,
        sessionId: this.sessionId,
        name: currentUser.name,
        role: currentUser.roleTitle,
        avatar: currentUser.avatar,
        onlineAt: new Date().toISOString(),
        device: typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      };
      await this.channel.track(payload);
    } catch (e) {
      console.warn('trackCurrentSession error:', e);
    }
  }

  private handlePresenceSync() {
    if (!this.channel) return;
    try {
      const state = this.channel.presenceState() as Record<string, PresenceUserPayload[]>;
      const newMap = new Map<string, PresenceUserPayload[]>();

      // Preserve self
      if (this.currentUserId) {
        const selfList = state[this.currentUserId] || [];
        if (!selfList.some(p => p.sessionId === this.sessionId)) {
          selfList.push({
            userId: this.currentUserId,
            sessionId: this.sessionId,
            name: '',
            role: '',
            avatar: '',
            onlineAt: new Date().toISOString(),
            device: 'desktop'
          });
        }
        newMap.set(this.currentUserId, selfList);
      }

      // Check all remote users
      Object.entries(state).forEach(([userId, presences]) => {
        if (Array.isArray(presences) && presences.length > 0) {
          newMap.set(userId, presences);
        } else {
          // If a user was previously online and now has 0 presences, update last seen
          if (this.onlineUsersMap.has(userId) && userId !== this.currentUserId) {
            this.lastSeenMap.set(userId, Date.now());
          }
        }
      });

      // For users that were in old map but are missing from new state, mark them offline with timestamp
      this.onlineUsersMap.forEach((_, userId) => {
        if (!newMap.has(userId) && userId !== this.currentUserId) {
          this.lastSeenMap.set(userId, Date.now());
        }
      });

      this.onlineUsersMap = newMap;
      this.saveLastSeenToStorage();
      this.notifyPresenceChange();
    } catch (err) {
      console.warn('handlePresenceSync error:', err);
    }
  }

  private handleNetworkReconnect() {
    if (this.currentUserId && this.channel) {
      this.channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          // Re-track
          const u = { id: this.currentUserId, name: '', roleTitle: '', avatar: '' } as any;
          await this.trackCurrentSession(u);
        }
      });
    }
  }

  private handleNetworkDisconnect() {
    if (this.currentUserId) {
      this.lastSeenMap.set(this.currentUserId, Date.now());
      this.saveLastSeenToStorage();
    }
  }

  private handlePageUnload() {
    if (this.currentUserId) {
      this.lastSeenMap.set(this.currentUserId, Date.now());
      this.saveLastSeenToStorage();
      try {
        if (this.channel) {
          this.channel.untrack();
        }
      } catch {}
    }
  }

  private notifyPresenceChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bjc_presence_change', {
        detail: {
          onlineCount: this.getOnlineCount(),
          onlineUserIds: Array.from(this.onlineUsersMap.keys())
        }
      }));
    }
  }

  /**
   * Check if a specific user is currently active with an established connection.
   */
  public isUserOnline(userId?: string | null): boolean {
    if (!userId) return false;
    // Current user in this active tab is always online
    if (this.currentUserId && userId === this.currentUserId) return true;
    const sessions = this.onlineUsersMap.get(userId);
    return Boolean(sessions && sessions.length > 0);
  }

  /**
   * Get total number of distinct authenticated users currently online.
   */
  public getOnlineCount(): number {
    return this.onlineUsersMap.size;
  }

  /**
   * Get set of distinct online user IDs.
   */
  public getOnlineUserIds(): Set<string> {
    return new Set(this.onlineUsersMap.keys());
  }

  /**
   * Get formatted last-seen text for an offline user.
   */
  public getLastSeenText(userId?: string | null, fallbackDate?: string | number): string {
    if (!userId) return 'Offline';
    if (this.isUserOnline(userId)) {
      return 'Active Now';
    }

    const recordedTime = this.lastSeenMap.get(userId);
    if (recordedTime) {
      return formatLastSeenTimestamp(recordedTime);
    }

    if (fallbackDate) {
      return formatLastSeenTimestamp(fallbackDate);
    }

    return 'Offline';
  }

  /**
   * Records a user's last activity timestamp manually (e.g. from message receipt).
   */
  public recordUserActivity(userId: string, timestampMs: number = Date.now()) {
    if (!userId) return;
    this.lastSeenMap.set(userId, timestampMs);
    this.saveLastSeenToStorage();
  }

  /**
   * Unsubscribe and cleanup presence channel.
   */
  public cleanup() {
    if (this.channel && supabase) {
      try {
        this.channel.untrack();
        supabase.removeChannel(this.channel);
      } catch {}
      this.channel = null;
    }
    this.onlineUsersMap.clear();
    this.currentUserId = null;
    this.isInitialized = false;
  }
}

export const PresenceService = new PresenceServiceImpl();
