// Digital Calligrapher — Enhanced Service Worker for Offline PWA Support
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `dc-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dc-dynamic-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/offline',
];

// ─── Install: Pre-cache static shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── Activate: Clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch: Strategy per request type ────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // tRPC API calls → network-first, cache fallback
  if (url.pathname.startsWith('/api/trpc/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => {
            if (cached) return cached;
            // Return empty JSON for API failures when offline
            return new Response(JSON.stringify({ error: 'offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          })
        )
    );
    return;
  }

  // Static assets (JS/CSS/fonts/images) → cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|svg|ico|webp)$/) ||
    url.pathname.includes('/_next/static/')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Navigation (HTML pages) → network-first, offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          })
        )
    );
    return;
  }

  // Everything else → stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// ─── Background Sync: Queue review submissions for offline ───────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncPendingReviews());
  }
});

async function syncPendingReviews() {
  try {
    // Read pending reviews from IndexedDB
    const db = await openReviewDB();
    const tx = db.transaction('pending-reviews', 'readonly');
    const store = tx.objectStore('pending-reviews');
    const reviews = await getAllFromStore(store);

    for (const review of reviews) {
      try {
        await fetch('/api/trpc/practice.submitReview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(review.data),
        });

        // Remove successfully synced review
        const deleteTx = db.transaction('pending-reviews', 'readwrite');
        deleteTx.objectStore('pending-reviews').delete(review.id);
      } catch {
        // Will retry on next sync event
        break;
      }
    }
  } catch {
    // IndexedDB not available or other error — silently ignore
  }
}

function openReviewDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('dc-offline-reviews', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('pending-reviews', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── Notification clicks ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});
