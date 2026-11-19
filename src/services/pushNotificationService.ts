// =========================================================================
// BEHOLDING JESUS CHURCH (BJC) — PUSH NOTIFICATION SERVICE
// Complete Web Push API, Subscription Lifecycle, Device Management,
// Server-Enforced Preferences, and Event-Driven Church Notification Dispatch
// =========================================================================

import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export const VAPID_PUBLIC_KEY =
  'BNgC0wpK1EQoeeYg0b-f0_OzNRAVSq6ynFNjvyXGfsSEfUxJkFAn_R0scnytEyoORrRvvUrENi6NwbsLyPrWJ2Q';

export interface IOSSupportStatus {
  isIOSDevice: boolean;
  isStandalonePWA: boolean;
  canReceivePush: boolean;
  message: string;
}

export interface PushCategorySettings {
  feed: boolean;
  chat: boolean;
  events: boolean;
  announcements: boolean;
  ministries: boolean;
  admin: boolean;
}

export interface PushPreferences {
  userId: string;
  pushEnabled: boolean;
  categories: PushCategorySettings;
  updatedAt: string;
}

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  deviceName: string;
  userAgent?: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
}

export interface PushDispatchPayload {
  userId: string;
  notificationId: string;
  title: string;
  body: string;
  url?: string;
  category?: 'feed' | 'chat' | 'events' | 'announcements' | 'ministries' | 'admin' | 'system' | 'test';
  tag?: string;
}

export interface PushDispatchResult {
  success: boolean;
  sentCount: number;
  failedCount?: number;
  status?: string;
  reason?: string;
  error?: string;
}

/**
 * Utility: Convert VAPID Public Key base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export class PushNotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static isInitialized = false;

  // -----------------------------------------------------------------------
  // 1. DEVICE & PWA ENVIRONMENT DETECTION
  // -----------------------------------------------------------------------

  /**
   * Checks whether Web Push and Service Workers are supported by the browser
   */
  static isPushSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Detects whether the app is running as an installed Home Screen PWA (standalone)
   */
  static isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (navigator as any).standalone === true;
    return Boolean(isStandaloneMedia || isIosStandalone);
  }

  /**
   * Detects Apple iOS or iPadOS devices
   */
  static isIos(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua);
    const isAppleTablet = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isAppleDevice || isAppleTablet;
  }

  /**
   * Complete iOS capability and requirement detection (matches Worship Team architecture)
   */
  static getIOSSupportStatus(): IOSSupportStatus {
    const ios = this.isIos();
    const standalone = this.isStandalone();
    const supported = this.isPushSupported();

    if (!ios) {
      return {
        isIOSDevice: false,
        isStandalonePWA: standalone,
        canReceivePush: supported,
        message: supported
          ? 'Web Push is fully supported by your browser.'
          : 'Push notifications are not supported in this browser.',
      };
    }

    if (!supported) {
      return {
        isIOSDevice: true,
        isStandalonePWA: standalone,
        canReceivePush: false,
        message: 'iOS 16.4 or later is required for Web Push. Please verify your iOS version in Settings > General > About.',
      };
    }

    if (!standalone) {
      return {
        isIOSDevice: true,
        isStandalonePWA: false,
        canReceivePush: false,
        message: 'Apple iOS requires installing BJC to your Home Screen from Safari before notifications can be enabled.',
      };
    }

    return {
      isIOSDevice: true,
      isStandalonePWA: true,
      canReceivePush: true,
      message: 'App is running in Home Screen mode. Web Push notifications are fully active and supported!',
    };
  }

  /**
   * Detects if device is iOS 16.4+ which supports Web Push ONLY when installed as a PWA
   */
  static isIosSupported(): boolean {
    if (!this.isIos()) return true; // Non-iOS platforms support Web Push normally
    return this.isStandalone() && 'PushManager' in window;
  }

  /**
   * Determines device operating platform
   */
  static getPlatform(): string {
    if (typeof window === 'undefined') return 'web';
    const ua = navigator.userAgent.toLowerCase();
    if (this.isIos()) return 'ios';
    if (ua.includes('android')) return 'android';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'macos';
    if (ua.includes('windows')) return 'windows';
    if (ua.includes('linux')) return 'linux';
    return 'web';
  }

  /**
   * Generates a friendly, human-readable device name for the user's registered devices list
   */
  static getDeviceName(): string {
    if (typeof window === 'undefined') return 'Web Browser';
    const ua = navigator.userAgent;
    const platform = this.getPlatform();
    const isPwa = this.isStandalone();

    let browserName = 'Browser';
    if (/edg\//i.test(ua)) browserName = 'Edge';
    else if (/chrome|crios/i.test(ua)) browserName = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browserName = 'Firefox';
    else if (/safari/i.test(ua)) browserName = 'Safari';

    switch (platform) {
      case 'ios':
        return isPwa ? `iPhone / iPad (BJC App)` : `iOS Safari (${browserName})`;
      case 'android':
        return isPwa ? `Android (BJC App)` : `Android Device (${browserName})`;
      case 'macos':
        return `Mac (${browserName})`;
      case 'windows':
        return `Windows PC (${browserName})`;
      case 'linux':
        return `Linux PC (${browserName})`;
      default:
        return `Device (${browserName})`;
    }
  }

  // -----------------------------------------------------------------------
  // 2. SERVICE WORKER & SUBSCRIPTION LIFECYCLE
  // -----------------------------------------------------------------------

  /**
   * Registers the service worker and waits for it to become ready
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      // Race navigator.serviceWorker.ready with a 4s timeout to guarantee no indefinite hanging
      const readyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const readyReg = await Promise.race([readyPromise, timeoutPromise]);
      this.swRegistration = readyReg || reg;
      return this.swRegistration;
    } catch (err) {
      console.error('[BJC Push] Service worker registration failed:', err);
      return null;
    }
  }

  /**
   * Retrieves active Service Worker registration
   */
  static async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    if (this.swRegistration) {
      return this.swRegistration;
    }

    try {
      const existing = await navigator.serviceWorker.getRegistration();
      if (existing) {
        this.swRegistration = existing;
        return existing;
      }
      return await this.registerServiceWorker();
    } catch (err) {
      console.warn('[BJC Push] Error fetching SW registration:', err);
      return null;
    }
  }

  /**
   * Initializes background listeners and service worker
   */
  static async init(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    if ('serviceWorker' in navigator) {
      try {
        const reg = await this.registerServiceWorker();
        if (reg) {
          this.swRegistration = reg;
        }

        // Listen for messages from service worker (e.g. push click deep-link navigation)
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'BJC_PUSH_NAVIGATE') {
            const url = event.data.url;
            if (url) {
              window.dispatchEvent(new CustomEvent('bjc_push_navigate', { detail: { url } }));
            }
          }
        });
      } catch (err) {
        console.warn('[BJC Push] SW init error:', err);
      }
    }
  }

  /**
   * Retrieves active push subscription for this browser/device, if any
   * Fast, non-blocking check using navigator.serviceWorker.getRegistration()
   */
  static async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isPushSupported()) return null;
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg || !reg.pushManager) return null;
      return await reg.pushManager.getSubscription();
    } catch (err) {
      console.warn('[BJC Push] Failed to read subscription:', err);
      return null;
    }
  }

  /**
   * Checks whether the current device is actively subscribed to push
   */
  static async isSubscribed(): Promise<boolean> {
    const sub = await this.getSubscription();
    return sub !== null;
  }

  /**
   * Registers this device for Web Push notifications.
   * STRICT REQUIREMENT: Only called after explicit user tap on "Enable Push Notifications"
   */
  static async subscribe(user: UserProfile): Promise<{
    success: boolean;
    status:
      | 'subscribed'
      | 'permission_denied'
      | 'permission_dismissed'
      | 'unsupported'
      | 'ios_pwa_required'
      | 'registration_failed'
      | 'database_error';
    error?: string;
    subscription?: PushSubscription;
  }> {
    // 1. Check browser notification support
    if (!this.isPushSupported()) {
      return {
        success: false,
        status: 'unsupported',
        error: 'Web Push notifications are not supported by this browser.',
      };
    }

    // 2. Check iOS Home Screen PWA constraint
    const iosStatus = this.getIOSSupportStatus();
    if (iosStatus.isIOSDevice && !iosStatus.isStandalonePWA) {
      return {
        success: false,
        status: 'ios_pwa_required',
        error: 'Please add BJC to your Home Screen from Safari first before enabling push notifications.',
      };
    }

    try {
      // 3. Check current permission and request if default
      let permission: NotificationPermission = Notification.permission;
      if (permission === 'denied') {
        return {
          success: false,
          status: 'permission_denied',
          error: 'Notification permission is blocked in your browser settings. Please allow notifications for this site.',
        };
      }

      // Request directly on click interaction
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        return {
          success: false,
          status: permission === 'denied' ? 'permission_denied' : 'permission_dismissed',
          error:
            permission === 'denied'
              ? 'Notification permission was denied. Please allow notifications in your browser settings.'
              : 'Notification permission was dismissed without being allowed.',
        };
      }

      // 4. Ensure Service Worker is registered and active
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = (await this.registerServiceWorker()) || undefined;
      }
      if (!reg || !reg.pushManager) {
        return {
          success: false,
          status: 'registration_failed',
          error: 'Failed to initialize service worker registration.',
        };
      }

      // 5. Obtain Push Subscription with Public VAPID Key
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as any,
        });
      }

      // 6. Extract credentials
      const subJson = sub.toJSON();
      const endpoint = sub.endpoint;
      const p256dh = subJson.keys?.p256dh || '';
      const auth = subJson.keys?.auth || '';

      if (!endpoint || !p256dh || !auth) {
        return {
          success: false,
          status: 'registration_failed',
          error: 'Failed to extract push encryption credentials from browser.',
        };
      }

      // 7. Store / sync subscription in Supabase Cloud database
      if (supabase) {
        const minimalSub = {
          user_id: user.id,
          endpoint,
          p256dh,
          auth,
          user_agent: navigator.userAgent.slice(0, 300),
        };

        // Try with full metadata first
        let { error: dbErr } = await supabase.from('push_subscriptions').upsert(
          {
            ...minimalSub,
            device_name: this.getDeviceName(),
            platform: this.getPlatform(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,endpoint' }
        );

        // Fallback: If any extra column is not in schema cache, upsert minimal working schema
        if (dbErr) {
          console.warn('[BJC Push] Retrying upsert with minimal schema:', dbErr.message);
          const fallback = await supabase.from('push_subscriptions').upsert(
            minimalSub,
            { onConflict: 'user_id,endpoint' }
          );
          dbErr = fallback.error;
        }

        if (dbErr) {
          console.error('[BJC Push] Supabase push_subscriptions upsert error:', dbErr);
          return {
            success: false,
            status: 'database_error',
            error: `Database rejected subscription: ${dbErr.message}`,
          };
        }
      }

      // 8. Ensure default preferences exist for user
      await this.ensureDefaultPreferences(user.id);

      window.dispatchEvent(new CustomEvent('bjc_push_state_change', { detail: { subscribed: true } }));

      return {
        success: true,
        status: 'subscribed',
        subscription: sub,
      };
    } catch (err: any) {
      console.error('[BJC Push] Subscribe error:', err);
      return {
        success: false,
        status: 'registration_failed',
        error: err?.message || 'Failed to activate push notifications.',
      };
    }
  }

  /**
   * Unsubscribes current device from Web Push
   */
  static async unsubscribe(user: UserProfile): Promise<boolean> {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.pushManager) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          const endpoint = sub.endpoint;
          await sub.unsubscribe();

          // Remove from database
          if (supabase) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('user_id', user.id)
              .eq('endpoint', endpoint);
          }
        }
      }

      window.dispatchEvent(new CustomEvent('bjc_push_state_change', { detail: { subscribed: false } }));
      return true;
    } catch (err) {
      console.warn('[BJC Push] Unsubscribe error:', err);
      return false;
    }
  }

  /**
   * Removes a specific device subscription by ID (from device management list)
   */
  static async removeDeviceSubscription(subscriptionId: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('[BJC Push] Remove device error:', err);
      return false;
    }
  }

  /**
   * Fetches all registered device subscriptions for the current member
   */
  static async getRegisteredDevices(userId: string): Promise<PushSubscriptionRecord[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.warn('[BJC Push] Query devices error:', error);
        return [];
      }

      return (data || []).map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        endpoint: d.endpoint,
        p256dh: d.p256dh,
        auth: d.auth,
        deviceName: d.device_name || 'Web Browser',
        userAgent: d.user_agent,
        platform: d.platform || 'web',
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    } catch (err) {
      console.warn('[BJC Push] getRegisteredDevices error:', err);
      return [];
    }
  }

  // -----------------------------------------------------------------------
  // 3. SERVER-ENFORCED NOTIFICATION PREFERENCES
  // -----------------------------------------------------------------------

  private static defaultCategories: PushCategorySettings = {
    feed: true,
    chat: true,
    events: true,
    announcements: true,
    ministries: true,
    admin: true,
  };

  /**
   * Fetches notification preferences for a member
   */
  static async getPreferences(userId: string): Promise<PushPreferences> {
    const fallback: PushPreferences = {
      userId,
      pushEnabled: true,
      categories: { ...this.defaultCategories },
      updatedAt: new Date().toISOString(),
    };

    if (!supabase) {
      try {
        const local = localStorage.getItem(`bjc_push_prefs_${userId}`);
        if (local) return JSON.parse(local);
      } catch {}
      return fallback;
    }

    try {
      const { data, error } = await supabase
        .from('push_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        return fallback;
      }

      return {
        userId: data.user_id,
        pushEnabled: data.push_enabled ?? true,
        categories: {
          ...this.defaultCategories,
          ...(data.categories || {}),
        },
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.warn('[BJC Push] getPreferences error:', err);
      return fallback;
    }
  }

  /**
   * Updates notification preferences in database (server-enforced)
   */
  static async updatePreferences(
    userId: string,
    updates: { pushEnabled?: boolean; categories?: Partial<PushCategorySettings> }
  ): Promise<boolean> {
    const current = await this.getPreferences(userId);
    const updated: PushPreferences = {
      userId,
      pushEnabled: updates.pushEnabled !== undefined ? updates.pushEnabled : current.pushEnabled,
      categories: {
        ...current.categories,
        ...(updates.categories || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    // Cache locally
    try {
      localStorage.setItem(`bjc_push_prefs_${userId}`, JSON.stringify(updated));
    } catch {}

    if (supabase) {
      try {
        const { error } = await supabase.from('push_preferences').upsert(
          {
            user_id: userId,
            push_enabled: updated.pushEnabled,
            categories: updated.categories,
            updated_at: updated.updatedAt,
          },
          { onConflict: 'user_id' }
        );

        if (error) {
          console.warn('[BJC Push] Preferences upsert error:', error);
          return false;
        }
      } catch (err) {
        console.warn('[BJC Push] Preferences cloud error:', err);
        return false;
      }
    }

    window.dispatchEvent(
      new CustomEvent('bjc_push_preferences_change', { detail: updated })
    );
    return true;
  }

  private static async ensureDefaultPreferences(userId: string): Promise<void> {
    if (!supabase) return;
    try {
      await supabase.from('push_preferences').upsert(
        {
          user_id: userId,
          push_enabled: true,
          categories: this.defaultCategories,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch {
      // ignore
    }
  }

  // -----------------------------------------------------------------------
  // 4. PUSH DISPATCH & BACKEND DELIVERY PIPELINE
  // -----------------------------------------------------------------------

  /**
   * Dispatches a Web Push notification (Direct Recipient or Broadcast)
   */
  static async dispatchPush(payload: PushDispatchPayload): Promise<PushDispatchResult> {
    const edgeFunctionPayload = {
      user_id: payload.userId,
      notification_id: payload.notificationId,
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      category: payload.category || 'feed',
      tag: payload.tag || `bjc-${payload.category || 'notification'}`,
    };

    // 1. Primary: /api/send-push endpoint on Vercel serverless (matches Worship Team app)
    try {
      const anonKey = 'sb_publishable_kHVMAKw9XSrvQ69xIH2gmw_9RcvlYO6';
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          'x-bjc-user-id': edgeFunctionPayload.user_id || '',
        },
        body: JSON.stringify(edgeFunctionPayload),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: (data.sent_count || data.sentCount || 0) > 0,
          sentCount: data.sent_count || data.sentCount || 0,
          failedCount: data.failed_count || data.failedCount || 0,
          status: data.status,
          reason: data.reason,
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn('[BJC Push] /api/send-push returned HTTP', res.status, errJson);
      }
    } catch (fetchErr: any) {
      console.warn('[BJC Push] /api/send-push fetch warning:', fetchErr);
    }

    // 2. Secondary fallback: Supabase Edge Function invoke (if deployed)
    if (supabase && supabase.functions) {
      try {
        const { data, error } = await supabase.functions.invoke('push_sender', {
          body: edgeFunctionPayload,
        });

        if (!error && data) {
          return {
            success: (data.sent_count || data.sentCount || 0) > 0,
            sentCount: data.sent_count || data.sentCount || 0,
            failedCount: data.failed_count || 0,
            status: data.status,
            reason: data.reason,
          };
        }
      } catch (invokeErr) {
        console.warn('[BJC Push] Edge function invoke fallback:', invokeErr);
      }
    }

    return {
      success: false,
      sentCount: 0,
      error: 'Unable to reach push dispatch function.',
    };
  }

  /**
   * Broadcasts a Web Push alert to all registered and eligible devices in the church
   * (Matches Worship Team app broadcast behavior)
   */
  static async broadcastPush(payload: {
    title: string;
    body: string;
    url?: string;
    category?: 'feed' | 'chat' | 'events' | 'announcements' | 'ministries' | 'admin' | 'system' | 'test';
    notificationId?: string;
  }): Promise<PushDispatchResult> {
    return this.dispatchPush({
      userId: '', // Empty user_id triggers broadcast to all subscribers in api/send-push
      notificationId: payload.notificationId || `broadcast-${Date.now()}`,
      title: payload.title,
      body: payload.body,
      url: payload.url || '/?tab=feed',
      category: payload.category || 'announcements',
    });
  }

  // -----------------------------------------------------------------------
  // 5. CHURCH EVENT-DRIVEN NOTIFICATION DISPATCH HELPERS
  // -----------------------------------------------------------------------

  /**
   * Community Feed: Post Reaction
   */
  static async notifyFeedReaction(
    authorId: string,
    actorName: string,
    reactionEmoji: string,
    postSnippet: string,
    postId: string
  ): Promise<void> {
    await this.dispatchPush({
      userId: authorId,
      notificationId: `rx-${postId}-${Date.now()}`,
      category: 'feed',
      title: `${actorName} reacted to your post`,
      body: `${actorName} reacted with ${reactionEmoji}: "${postSnippet.slice(0, 80)}"`,
      url: `/?tab=feed&postId=${postId}`,
    });
  }

  /**
   * Community Feed: Comment on Post
   */
  static async notifyFeedComment(
    authorId: string,
    commenterName: string,
    commentSnippet: string,
    postId: string
  ): Promise<void> {
    await this.dispatchPush({
      userId: authorId,
      notificationId: `comm-${postId}-${Date.now()}`,
      category: 'feed',
      title: `${commenterName} commented on your post`,
      body: `${commenterName}: "${commentSnippet.slice(0, 90)}"`,
      url: `/?tab=feed&postId=${postId}`,
    });
  }

  /**
   * Community Feed: Reply to Comment
   */
  static async notifyFeedCommentReply(
    parentAuthorId: string,
    replierName: string,
    replySnippet: string,
    postId: string
  ): Promise<void> {
    await this.dispatchPush({
      userId: parentAuthorId,
      notificationId: `reply-${postId}-${Date.now()}`,
      category: 'feed',
      title: `${replierName} replied to your comment`,
      body: `${replierName}: "${replySnippet.slice(0, 90)}"`,
      url: `/?tab=feed&postId=${postId}`,
    });
  }

  /**
   * Community Feed: Prayer Request Response (Someone is praying)
   */
  static async notifyPrayerResponse(
    authorId: string,
    prayerActorName: string,
    prayerTitle: string,
    postId: string
  ): Promise<void> {
    await this.dispatchPush({
      userId: authorId,
      notificationId: `pray-${postId}-${Date.now()}`,
      category: 'feed',
      title: `🙏 ${prayerActorName} is praying for you`,
      body: `${prayerActorName} lifted your prayer in faith: "${prayerTitle.slice(0, 80)}"`,
      url: `/?tab=feed&postId=${postId}`,
    });
  }

  /**
   * Community Feed: Prayer Request Marked Answered
   */
  static async notifyPrayerAnswered(
    recipientId: string,
    authorName: string,
    testimonyTitle: string,
    postId: string
  ): Promise<void> {
    await this.dispatchPush({
      userId: recipientId,
      notificationId: `answered-${postId}-${recipientId}-${Date.now()}`,
      category: 'feed',
      title: `✨ Answered Prayer! Praise God!`,
      body: `${authorName}'s prayer was answered: "${testimonyTitle.slice(0, 80)}"`,
      url: `/?tab=feed&postId=${postId}`,
    });
  }

  /**
   * Fellowship & Direct Messages: New Direct Message
   */
  static async notifyDirectMessage(
    recipientId: string,
    senderName: string,
    messageSnippet: string,
    roomId: string
  ): Promise<void> {
    await this.dispatchPush({
      userId: recipientId,
      notificationId: `dm-${roomId}-${Date.now()}`,
      category: 'chat',
      title: `💬 New Message from ${senderName}`,
      body: messageSnippet ? `"${messageSnippet.slice(0, 90)}"` : 'Sent an attachment or photo',
      url: `/?tab=messages&room=${roomId}`,
    });
  }

  /**
   * Fellowship: Group Chat Message
   */
  static async notifyGroupMessage(
    recipientIds: string[],
    senderName: string,
    roomTitle: string,
    messageSnippet: string,
    roomId: string
  ): Promise<void> {
    for (const rid of recipientIds) {
      await this.dispatchPush({
        userId: rid,
        notificationId: `grp-${roomId}-${rid}-${Date.now()}`,
        category: 'chat',
        title: `💬 ${roomTitle} • ${senderName}`,
        body: messageSnippet ? `"${messageSnippet.slice(0, 90)}"` : 'Sent an attachment',
        url: `/?tab=fellowship&room=${roomId}`,
      });
    }
  }

  /**
   * Fellowship: Group Chat Invitation
   */
  static async notifyGroupInvitation(
    invitedUserId: string,
    inviterName: string,
    roomTitle: string,
    roomId: string
  ): Promise<void> {
    await this.dispatchPush({
      userId: invitedUserId,
      notificationId: `invite-${roomId}-${invitedUserId}-${Date.now()}`,
      category: 'chat',
      title: `👥 Group Invitation: ${roomTitle}`,
      body: `${inviterName} invited you to join the group fellowship conversation.`,
      url: `/?tab=fellowship&room=${roomId}`,
    });
  }

  /**
   * Chat / Feed: Mention or Tag
   */
  static async notifyMention(
    mentionedUserId: string,
    actorName: string,
    contextSnippet: string,
    url: string,
    isChat?: boolean
  ): Promise<void> {
    await this.dispatchPush({
      userId: mentionedUserId,
      notificationId: `mention-${mentionedUserId}-${Date.now()}`,
      category: isChat ? 'chat' : 'feed',
      title: `@ ${actorName} mentioned you`,
      body: `"${contextSnippet.slice(0, 90)}"`,
      url: url || '/',
    });
  }

  /**
   * Church Events: Announcement, Schedule Change, Reminder, Cancellation
   */
  static async notifyChurchEvent(
    recipientIds: string[],
    eventTitle: string,
    details: string,
    eventId: string,
    actionType: 'new' | 'update' | 'reminder' | 'cancel'
  ): Promise<void> {
    let title = `📅 Upcoming Church Event: ${eventTitle}`;
    if (actionType === 'new') title = `📅 New Church Event: ${eventTitle}`;
    if (actionType === 'update') title = `⚠️ Event Schedule Change: ${eventTitle}`;
    if (actionType === 'reminder') title = `⏰ Event Reminder: ${eventTitle}`;
    if (actionType === 'cancel') title = `❌ Event Cancelled: ${eventTitle}`;

    for (const uid of recipientIds) {
      await this.dispatchPush({
        userId: uid,
        notificationId: `event-${eventId}-${actionType}-${uid}-${Date.now()}`,
        category: 'events',
        title,
        body: details.slice(0, 100),
        url: `/?tab=events&eventId=${eventId}`,
      });
    }
  }

  /**
   * Church Announcements
   */
  static async notifyChurchAnnouncement(
    recipientIds: string[],
    announcementTitle: string,
    content: string,
    isImportant: boolean = false
  ): Promise<void> {
    const emoji = isImportant ? '📌' : '📢';
    const title = `${emoji} Church Announcement: ${announcementTitle}`;

    // Broadcast to all church members across all registered devices (matches Worship Team app)
    await this.broadcastPush({
      title,
      body: content ? content.slice(0, 100) : 'New church announcement posted in Beholding Jesus Church',
      url: '/?tab=feed',
      category: 'announcements',
      notificationId: `announcement-${Date.now()}`,
    });
  }

  /**
   * Ministries: Announcements, Activity Updates, Schedule Changes
   */
  static async notifyMinistry(
    ministryMemberIds: string[],
    ministryName: string,
    title: string,
    details: string,
    ministryId: string
  ): Promise<void> {
    for (const uid of ministryMemberIds) {
      await this.dispatchPush({
        userId: uid,
        notificationId: `min-${ministryId}-${uid}-${Date.now()}`,
        category: 'ministries',
        title: `🏛️ ${ministryName}: ${title}`,
        body: details.slice(0, 100),
        url: `/?tab=ministries&ministryId=${ministryId}`,
      });
    }
  }

  /**
   * Admin: Admin Application Submitted (notifies Super Admin)
   */
  static async notifyAdminApplicationSubmitted(
    applicantName: string,
    applicantUsername: string,
    requestId: string
  ): Promise<void> {
    // Notify designated Super Admin
    await this.dispatchPush({
      userId: 'usr-owner-001',
      notificationId: `admin-req-${requestId}-${Date.now()}`,
      category: 'admin',
      title: `🛡️ New Admin Application`,
      body: `${applicantName} (@${applicantUsername}) submitted an Admin Access Request for review.`,
      url: '/?tab=admin&sub=requests',
    });
  }

  /**
   * Admin: Application Approved or Rejected
   */
  static async notifyAdminApplicationResolved(
    applicantUserId: string,
    status: 'approved' | 'rejected',
    reviewerName: string
  ): Promise<void> {
    const isApproved = status === 'approved';
    await this.dispatchPush({
      userId: applicantUserId,
      notificationId: `admin-resolved-${applicantUserId}-${Date.now()}`,
      category: 'admin',
      title: isApproved ? `🛡️ Admin Access Approved!` : `Admin Access Request Status`,
      body: isApproved
        ? `Your Admin request was approved by ${reviewerName}. You now have access to the Admin Dashboard.`
        : `Your Admin application was reviewed by church leadership.`,
      url: isApproved ? '/?tab=admin' : '/?tab=home',
    });
  }

  /**
   * Admin: Administrative Alerts (authorized admins only)
   */
  static async notifyAdminAlert(
    adminIds: string[],
    alertTitle: string,
    alertDetails: string
  ): Promise<void> {
    for (const aid of adminIds) {
      await this.dispatchPush({
        userId: aid,
        notificationId: `admin-alert-${aid}-${Date.now()}`,
        category: 'admin',
        title: `⚠️ Admin Alert: ${alertTitle}`,
        body: alertDetails.slice(0, 100),
        url: '/?tab=admin',
      });
    }
  }

  /**
   * Sends a real Test Notification to the current user's registered device
   */
  static async sendTestPush(user: UserProfile): Promise<{ success: boolean; message: string }> {
    const isSub = await this.isSubscribed();
    if (!isSub) {
      return {
        success: false,
        message: 'This device is not yet subscribed. Please tap "Enable Push Notifications" first.',
      };
    }

    const result = await this.dispatchPush({
      userId: user.id,
      notificationId: `test-${user.id}-${Date.now()}`,
      category: 'test',
      title: '🔔 BJC Test Notification',
      body: `Praise the Lord, ${user.name}! Web Push Notifications are operating correctly on your ${this.getDeviceName()}.`,
      url: '/?tab=profile',
    });

    if (result.success) {
      return {
        success: true,
        message: 'Test notification sent successfully! Check your device lock screen or banner.',
      };
    } else {
      return {
        success: false,
        message: result.error || result.reason || 'Failed to dispatch test notification.',
      };
    }
  }
}
