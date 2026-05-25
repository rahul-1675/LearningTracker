/* sw.js - Progressive Web App Service Worker */

const CACHE_NAME = 'edu-pathway-cache-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './pages/login.html',
  './pages/register.html',
  './pages/dashboard.html',
  './pages/tasks.html',
  './pages/goals.html',
  './pages/calendar.html',
  './css/style.css',
  './css/components/pomodoro.css',
  './css/components/toast.css',
  './js/storage.js',
  './js/toast.js',
  './js/theme.js',
  './js/quotes.js',
  './js/pomodoro.js',
  './js/auth.js',
  './js/dashboard.js',
  './js/tasks.js',
  './js/goals.js',
  './js/calendar.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install Event - Pre-cache core structural assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching Core App Assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale cache registries
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing Outdated Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First, Cache-Fallback strategy
// Checks online network first to grab live changes, falling back to cache if offline.
self.addEventListener('fetch', event => {
  // Only handle standard HTTP/HTTPS schemes (ignore chrome-extension, etc.)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://cdn')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache new successful requests dynamically
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Catch block runs if offline -> grab asset from cached registry
        return caches.match(event.request);
      })
  );
});
