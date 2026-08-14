// sw-notif.js — SERVICE WORKER UPDATE
// ─────────────────────────────────────
// Merge these changes into your existing sw-notif.js.
// The key change: read `badge_icon` from the push payload
// and resolve it to a category-specific badge PNG.

const BADGE_BASE = './badges/badge-';
const BADGE_DEFAULT = './badge-96.png';

self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    // Fallback if payload isn't JSON
    const text = event.data.text();
    data = { title: 'Home Base', body: text };
  }

  const title = data.title || 'Home Base';
  const options = {
    body: data.body || '',
    tag: data.tag || 'hb-push',
    icon: './icon-192.png',
    // ── NEW: category-specific badge ──
    badge: data.badge_icon
      ? BADGE_BASE + data.badge_icon + '.png'
      : BADGE_DEFAULT,
    renotify: true,
    vibrate: [200, 100, 200],
    data: data  // stash full payload for notificationclick
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click — open or focus the app
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (const client of clientList) {
          if (client.url.includes('HomeBase') && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow('./');
      })
  );
});
