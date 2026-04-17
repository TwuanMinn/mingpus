// Self-unregistering service worker.
// A previous build installed a caching SW that now serves stale HTML/JS.
// When this version activates, it deletes every cache, unregisters itself,
// and reloads open clients so they fetch fresh assets from the network.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      client.navigate(client.url);
    }
  })());
});

self.addEventListener('fetch', () => {
  // Pass-through: do not intercept. Let the network handle everything.
});
