/**
 * StorageManager: Hardened, quota-resilient storage utility for Beholding Jesus Church.
 * Prevents and recovers from DOMException QuotaExceededError (5MB browser limit).
 */
export class StorageManager {
  private static readonly CRITICAL_KEYS = new Set([
    'bjc_auth_session_v1',
    'bjc_super_admin_session_v1',
    'bjc_auth_credentials_v1',
    'bjc_saved_username',
    'bjc_remember_me',
    'bjc_current_user_id_v4',
    'bjc_theme'
  ]);

  /**
   * Safe wrapper around localStorage.setItem.
   * If a QuotaExceededError occurs, automatically evicts legacy and transient caches,
   * then retries.
   */
  static safeSetItem(key: string, value: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err: any) {
      if (this.isQuotaError(err)) {
        console.warn(`[StorageManager] Quota exceeded writing "${key}". Running Level 1 cleanup...`);
        this.cleanLegacyAndHeavyCaches();
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (retryErr: any) {
          console.warn(`[StorageManager] Level 1 cleanup insufficient. Running Level 2 Deep Eviction...`);
          this.deepEviction(key);
          try {
            localStorage.setItem(key, value);
            return true;
          } catch (finalErr) {
            console.error(`[StorageManager] CRITICAL: Storage full even after deep eviction for "${key}".`, finalErr);
            return false;
          }
        }
      }
      console.warn(`[StorageManager] Error writing "${key}":`, err);
      return false;
    }
  }

  /**
   * Safe getter with error suppression
   */
  static getItem(key: string): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Safe remove
   */
  static removeItem(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  /**
   * Checks if an error is a browser storage quota exceeded error
   */
  static isQuotaError(err: any): boolean {
    if (!err) return false;
    return (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014 ||
      (typeof err.message === 'string' &&
        (err.message.toLowerCase().includes('quota') ||
          err.message.toLowerCase().includes('storage') ||
          err.message.toLowerCase().includes('exceeded')))
    );
  }

  /**
   * Level 1: Remove old version keys and prune heavy transient arrays
   */
  static cleanLegacyAndHeavyCaches(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const legacyPatterns = [
        /^bjc_feed_posts_v([1-9]|10)$/,
        /^bjc_chat_messages_v[1-3]$/,
        /^bjc_cached_room_messages_v[1-2]$/,
        /^bjc_admin_announcements_cache_v1$/,
        /^bjc_deleted_feed_ids_v[1-9]$/,
        /^bjc_posts_v[1-3]$/,
        /^bjc_users_v[1-3]$/,
        /^bjc_announcements_v[1-3]$/,
        /^bjc_prayers_v[1-3]$/,
        /^bjc_join_requests_v[1-3]$/,
        /^bjc_ministries_v[1-3]$/
      ];

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (legacyPatterns.some(p => p.test(k))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // Prune heavy large strings (anything over 40KB)
      const pruneTargets = [
        'bjc_admin_audit_logs_v2',
        'bjc_cached_room_messages_v3',
        'bjc_feed_posts_v11',
        'bjc_admin_announcements_cache_v2',
        'bjc_ai_chat_history_v1',
        'bjc_bible_history_v1'
      ];

      pruneTargets.forEach(target => {
        try {
          const raw = localStorage.getItem(target);
          if (raw && raw.length > 40000) {
            localStorage.removeItem(target);
          }
        } catch {}
      });
    } catch (e) {
      console.warn('[StorageManager] cleanLegacyAndHeavyCaches error:', e);
    }
  }

  /**
   * Level 2: Deep Eviction — purges all non-critical caches so that auth sessions
   * and login credentials are guaranteed to succeed.
   */
  static deepEviction(preserveKey?: string): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const keysToKeep = new Set(this.CRITICAL_KEYS);
      if (preserveKey) keysToKeep.add(preserveKey);

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !keysToKeep.has(k)) {
          keysToRemove.push(k);
        }
      }

      keysToRemove.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      console.info(`[StorageManager] Deep eviction complete. Removed ${keysToRemove.length} cached keys.`);
    } catch (e) {
      console.warn('[StorageManager] deepEviction error:', e);
    }
  }

  /**
   * Total Safe Reset: clears everything except the saved username and theme.
   */
  static resetToFreshState(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      const savedUser = localStorage.getItem('bjc_saved_username');
      const remember = localStorage.getItem('bjc_remember_me');
      const theme = localStorage.getItem('bjc_theme');

      localStorage.clear();

      if (savedUser) localStorage.setItem('bjc_saved_username', savedUser);
      if (remember) localStorage.setItem('bjc_remember_me', remember);
      if (theme) localStorage.setItem('bjc_theme', theme);
    } catch {}
  }
}
