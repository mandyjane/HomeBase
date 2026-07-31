// Home Base — notification service worker (Phase 2b)
// Deploy alongside index.html on GitHub Pages.

// Handle incoming server push
self.addEventListener("push", function(e) {
  var data = { title: "Home Base", body: "You have a notification" };
  if (e.data) {
    try { data = e.data.json(); } catch(err) {
      try { data.body = e.data.text(); } catch(err2) {}
    }
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon-192.png",
      badge: "./badge-96.png",
      vibrate: [200, 100, 200],
      renotify: true,
      tag: "hb-push-" + Date.now()
    })
  );
});

// Open the app when notification is tapped
self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(cl) {
      for (var i = 0; i < cl.length; i++) {
        if ("focus" in cl[i]) return cl[i].focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});

// Minimal fetch handler required for PWA installability
self.addEventListener("fetch", function(e) {
  // Pass through — no caching
});
