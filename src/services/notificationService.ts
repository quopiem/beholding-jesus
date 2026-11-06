/**
 * Beholding Jesus Church - Push & Lock Screen Notification Service
 * Supports Web Notifications API and Service Worker for lock screen & home screen alerts.
 */

export class NotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static isInitialized = false;

  /**
   * Initializes Service Worker for background and lock screen notifications
   */
  static async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = reg;
        console.log('[BJC Notifications] Service Worker registered successfully.');
      } catch (err) {
        console.warn('[BJC Notifications] Service Worker registration failed:', err);
      }
    }
  }

  /**
   * Checks if browser supports notifications
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Returns current notification permission state
   */
  static getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Requests permission to send lock screen & device notifications
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      alert('Your browser does not support web notifications.');
      return false;
    }

    try {
      await this.init();
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Send welcoming lock screen confirmation
        await this.showNotification(
          '🔔 BJC Notifications Activated',
          'You will now receive message alerts and announcements even on your lock screen!',
          {
            tag: 'bjc-welcome-notification',
            badge: '/icons/church-logo.png',
            icon: '/icons/icon-192.png'
          }
        );
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Notification permission request error:', err);
      return false;
    }
  }

  /**
   * Displays a notification across Lock Screen, Home Screen, and system notification bar
   */
  static async showNotification(
    title: string,
    body: string,
    options?: {
      tag?: string;
      icon?: string;
      badge?: string;
      url?: string;
      silent?: boolean;
    }
  ): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    const notifOptions: any = {
      body,
      icon: options?.icon || '/icons/icon-192.png',
      badge: options?.badge || '/icons/church-logo.png',
      tag: options?.tag || `bjc-${Date.now()}`,
      renotify: true,
      data: { url: options?.url || '/' },
      silent: options?.silent || false
    };

    // If service worker is ready, use it to ensure visibility on phone lock screens
    if (this.swRegistration && 'showNotification' in this.swRegistration) {
      try {
        await this.swRegistration.showNotification(title, notifOptions);
        return;
      } catch (e) {
        console.warn('SW showNotification error, falling back to window Notification:', e);
      }
    }

    // Direct fallback for desktop / non-SW
    try {
      const n = new Notification(title, notifOptions);
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.warn('Desktop notification error:', e);
    }
  }

  /**
   * Triggers a notification for a new community chat message
   */
  static async notifyNewMessage(
    senderName: string,
    content: string,
    options?: { roomId?: string; isDirect?: boolean }
  ): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    // Do not pop up if user is actively looking at the window and focused
    if (document.hasFocus && document.hasFocus() && document.visibilityState === 'visible') {
      return;
    }

    let cleanText = content;
    if (content.startsWith('[PHOTO:')) {
      const match = content.match(/\[PHOTO:[^\]]+\]\s*(.*)/s);
      cleanText = '📷 Sent a photo' + (match?.[1] ? `: ${match[1]}` : '');
    } else if (content.startsWith('[VIDEO:')) {
      const match = content.match(/\[VIDEO:[^\]]+\]\s*(.*)/s);
      cleanText = '🎥 Sent a video' + (match?.[1] ? `: ${match[1]}` : '');
    }

    const title = options?.isDirect 
      ? `💬 Private Message from ${senderName}`
      : `💬 ${senderName} • BJC Community`;

    await this.showNotification(title, cleanText, {
      tag: `msg-${senderName}`,
      url: '/?tab=community'
    });
  }

  /**
   * Triggers a notification for a new church announcement
   */
  static async notifyNewAnnouncement(
    title: string,
    description: string,
    priority: string = 'normal'
  ): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    const emoji = priority === 'pinned' ? '📌' : '📢';
    const notifTitle = `${emoji} Church Announcement: ${title}`;

    await this.showNotification(notifTitle, description, {
      tag: `announcement-${title.slice(0, 15)}`,
      url: '/'
    });
  }
}
