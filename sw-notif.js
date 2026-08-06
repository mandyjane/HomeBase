// HomeBase service worker — push notifications + versioned PWA caching
// v559 — bump this version with every deploy to force cache refresh

const CACHE_NAME = 'hb-v559';

// ── INSTALL: pre-cache the app shell, skip waiting ──────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(['./', './index.html']))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: delete old caches, claim all clients ──────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => clients.claim())
  );
});

// ── FETCH: network-first for navigation, pass-through for everything else ───
// When online: always fetches the latest index.html from GitHub Pages and
// updates the cache. When offline: serves from the versioned cache.
// Non-navigation requests (fonts, APIs, etc.) go straight to network.
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone and cache the fresh response for offline use
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  // Everything else: network only (Supabase, push, etc.)
});

// ── PUSH: show notification when server sends one ───────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "HomeBase", body: "You have a notification" };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    try {
      data = { title: "HomeBase", body: event.data.text() };
    } catch {}
  }

  const options = {
    body: data.body || "",
    icon: "icon-192.png",
    badge: "badge-96.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "hb-" + Date.now(),
    renotify: true,
    requireInteraction: false,
    data: { url: self.registration.scope },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "HomeBase", options)
  );
});

// ── NOTIFICATION CLICK: open or focus the app ───────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
