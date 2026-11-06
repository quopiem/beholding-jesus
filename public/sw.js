// Beholding Jesus Church - Service Worker for Lock Screen & Home Screen Push Notifications
const CACHE_NAME = 'bjc-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Beholding Jesus Church',
    body: 'New update from your church community!',
    url: '/'
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/church-logo.png',
    vibrate: [200, 100, 200],
    data: { url: payload.url || '/' },
    tag: payload.tag || 'bjc-notification',
    renotify: true,
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});
