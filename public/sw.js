// =========================================================================
// BEHOLDING JESUS CHURCH (BJC) — SERVICE WORKER
// Supports Web Push, Background Alerts, Lock Screen & Home Screen PWA Notifications
// =========================================================================

const CACHE_NAME = 'bjc-pwa-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// -------------------------------------------------------------------------
// PUSH EVENT LISTENER
// Fired when an incoming Web Push message arrives from the push service
// -------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Beholding Jesus Church',
    body: 'New update from your church community!',
    url: '/',
    tag: 'bjc-notification',
    category: 'feed',
    notification_id: `push-${Date.now()}`
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  // Ensure safe URL
  const targetUrl = (payload.url && payload.url.startsWith('/') && !payload.url.startsWith('//'))
    ? payload.url
    : '/';

  const options = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/church-logo.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: targetUrl,
      notification_id: payload.notification_id,
      category: payload.category || 'feed',
      timestamp: Date.now()
    },
    tag: payload.tag || payload.notification_id || `bjc-${payload.category || 'general'}`,
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open BJC' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// -------------------------------------------------------------------------
// NOTIFICATION CLICK LISTENER
// Handles user tapping on notification banner or action button
// Focuses or navigates the app window to the deep-linked destination
// -------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If an existing window client is open, focus it and dispatch navigation message
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          // Post message to client so SPA can transition tab without reload if already at root
          if ('postMessage' in client) {
            client.postMessage({
              type: 'BJC_PUSH_NAVIGATE',
              url: targetUrl,
              data: notificationData
            });
          }
          if ('navigate' in client && targetUrl !== '/') {
            return client.navigate(targetUrl);
          }
          return;
        }
      }

      // 2. If no window is currently open, open a new window at the target destination
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// -------------------------------------------------------------------------
// PUSH SUBSCRIPTION CHANGE LISTENER
// Handles automatic key rotation or renewal from the browser push service
// -------------------------------------------------------------------------
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription ? event.oldSubscription.options.applicationServerKey : undefined
    }).then((newSubscription) => {
      // Broadcast subscription refresh to active app clients
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('postMessage' in client) {
            client.postMessage({
              type: 'BJC_PUSH_SUBSCRIPTION_CHANGED',
              subscription: newSubscription ? newSubscription.toJSON() : null
            });
          }
        }
      });
    }).catch((err) => {
      console.warn('[BJC ServiceWorker] pushsubscriptionchange renewal failed:', err);
    })
  );
});
