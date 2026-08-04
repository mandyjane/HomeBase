// HomeBase service worker — handles push notifications and PWA caching
// v481

// Push event — fires when the server sends a push notification
self.addEventListener("push", (event) => {
  let data = { title: "HomeBase", body: "You have a notification" };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    // If JSON parse fails, try text
    try {
      data = { title: "HomeBase", body: event.data.text() };
    } catch {}
  }

  const options = {
    body: data.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
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

// Notification click — open or focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});

// Activate — take control of all pages immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Install — skip waiting so updates take effect immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
