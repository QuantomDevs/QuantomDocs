// Service Worker for QuantomDocs
// Provides offline functionality and caching for better performance

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `quantom-docs-${CACHE_VERSION}`;

// Static assets to cache on installation
const STATIC_ASSETS = [
    '/main/index.html',
    '/main/downloads.html',
    '/main/404.html',
    '/docs/index.html',
    '/components/css/common.css',
    '/components/css/mobile-menu.css',
    '/main/css/index.css',
    '/main/css/downloads.css',
    '/docs/css/docs.css',
    '/docs/css/docs-search.css',
    '/components/js/common.js',
    '/components/js/mobile-menu.js',
    '/components/js/lazy-loader.js',
    '/main/js/index.js',
    '/main/js/downloads.js',
    '/docs/js/docs-products.js',
    '/docs/js/docs.js',
    '/docs/js/docs-search.js',
    '/docs/js/marked-extension.js',
    '/images/favicon/favicon.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker...', CACHE_NAME);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Static assets cached successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('[Service Worker] Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating Service Worker...', CACHE_NAME);

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('quantom-docs-') && cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Service Worker activated');
                return self.clients.claim(); // Take control of all pages
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip API requests (always fetch fresh)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request));
        return;
    }

    // Network First strategy for HTML pages and markdown files
    // This ensures docs are always up-to-date when online
    if (
        request.headers.get('accept').includes('text/html') ||
        url.pathname.endsWith('.md') ||
        url.pathname.startsWith('/docs/')
    ) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Cache First strategy for static assets (CSS, JS, images)
    // Faster loading for assets that don't change often
    event.respondWith(cacheFirstStrategy(request));
});

// Network First Strategy
// Try network first, fallback to cache if offline
async function networkFirstStrategy(request) {
    try {
        // Try to fetch from network
        const networkResponse = await fetch(request);

        // If successful, cache the response and return it
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        console.log('[Service Worker] Network failed, trying cache for:', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // If both fail, return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/404.html');
        }

        throw error;
    }
}

// Cache First Strategy
// Try cache first, fallback to network if not cached
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        // Return cached version
        return cachedResponse;
    }

    try {
        // Not in cache, fetch from network
        const networkResponse = await fetch(request);

        // Cache the new resource
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Failed to fetch:', request.url, error);
        throw error;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Clear all caches on demand
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});
