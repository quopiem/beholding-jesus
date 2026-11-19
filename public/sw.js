// =========================================================================
// BEHOLDING JESUS CHURCH (BJC) — BACKGROUND SERVICE WORKER
// Supports Web Push, Background Alerts, Lock Screen & iOS Home Screen PWA Notifications
// =========================================================================

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Receive background push notification from Apple APNs / Google FCM
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Notification', body: event.data.text() };
    }
  }

  const title = data.title || 'Beholding Jesus Church';
  const targetUrl = data.url && data.url.startsWith('/') && !data.url.startsWith('//')
    ? data.url
    : '/';

  const options = {
    body: data.body || 'You have a new notification in Beholding Jesus Church.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.tag || 'bjc-push-' + Date.now(),
    data: {
      url: targetUrl
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Open or focus the app when user clicks the notification banner
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
