// Home Base — notification service worker (Phase 2a)
// Deploy alongside index.html on GitHub Pages.

self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(cl) {
      for (var i = 0; i < cl.length; i++) {
        if (cl[i].url.indexOf("mandyjane.github.io") !== -1 && "focus" in cl[i]) {
          return cl[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});

// Minimal fetch handler required for PWA installability
self.addEventListener("fetch", function(e) {
  // Pass through — no caching
});
