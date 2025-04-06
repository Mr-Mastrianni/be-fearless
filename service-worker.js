// Service Worker for Be Courageous website
const CACHE_NAME = 'be-courageous-cache-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/og-image.png',
  '/robots.txt',
  '/sitemap.xml'
];

// Cache names for different types of assets
const STATIC_CACHE = 'be-courageous-static-v1';
const IMAGES_CACHE = 'be-courageous-images-v1';
const FONTS_CACHE = 'be-courageous-fonts-v1';
const SCRIPTS_CACHE = 'be-courageous-scripts-v1';
const STYLES_CACHE = 'be-courageous-styles-v1';

// Cache durations (in seconds)
const STATIC_CACHE_DURATION = 60 * 60 * 24 * 7; // 1 week
const IMAGES_CACHE_DURATION = 60 * 60 * 24 * 30; // 30 days
const FONTS_CACHE_DURATION = 60 * 60 * 24 * 365; // 1 year
const SCRIPTS_CACHE_DURATION = 60 * 60 * 24 * 7; // 1 week
const STYLES_CACHE_DURATION = 60 * 60 * 24 * 7; // 1 week

// Install event - precache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine cache and expiration based on request URL
function getCacheDetails(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  // Image files
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    return { cacheName: IMAGES_CACHE, expiration: IMAGES_CACHE_DURATION };
  }
  // Font files
  else if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
    return { cacheName: FONTS_CACHE, expiration: FONTS_CACHE_DURATION };
  }
  // JavaScript files
  else if (pathname.match(/\.(js)$/i)) {
    return { cacheName: SCRIPTS_CACHE, expiration: SCRIPTS_CACHE_DURATION };
  }
  // CSS files
  else if (pathname.match(/\.(css)$/i)) {
    return { cacheName: STYLES_CACHE, expiration: STYLES_CACHE_DURATION };
  }
  // Default - static assets
  else {
    return { cacheName: STATIC_CACHE, expiration: STATIC_CACHE_DURATION };
  }
}

// Fetch event - serve from cache or network with improved strategies
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = event.request.url;
  const { cacheName, expiration } = getCacheDetails(url);

  // For HTML pages - network first, then cache
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For images - cache first, network as fallback (cache-first strategy)
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    event.respondWith(
      caches.open(cacheName).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise fetch from network
          return fetch(event.request).then(networkResponse => {
            // Add the new response to the cache
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // For other assets - stale-while-revalidate strategy
  event.respondWith(
    caches.open(cacheName).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Create a promise to update the cache
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
