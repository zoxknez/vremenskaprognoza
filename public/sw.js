/// <reference lib="webworker" />

const CACHE_NAME = 'air-quality-v4';
const RUNTIME_CACHE = 'air-quality-runtime-v4';

// Resursi koji se keširaju pri instalaciji
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];

// API URL-ovi koji se keširaju sa network-first strategijom
const API_URLS = [
  '/api/air-quality',
  '/api/stations',
  '/api/weather',
  '/api/forecast',
];

// Instalacija service workera
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Aktiviraj odmah
  self.skipWaiting();
});

// Aktivacija - čišćenje starih keš verzija
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Preuzmi kontrolu nad svim klijentima
  self.clients.claim();
});

// Fetch strategije
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Preskoči non-GET zahteve
  if (request.method !== 'GET') return;

  // Preskoči Vercel Analytics i druge interne rute koje ne treba keširati
  if (url.pathname.startsWith('/_vercel/') || url.pathname.startsWith('/api/auth/')) {
    return;
  }

  // Preskoči cross-origin zahteve (osim API-ja)
  if (url.origin !== self.location.origin) {
    // Dozvoli externe API pozive ali bez keširanja
    return;
  }

  // API zahtevi - Network first, fallback to cache
  if (API_URLS.some((apiUrl) => url.pathname.startsWith(apiUrl))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Statički resursi - Cache first, fallback to network
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigacija - Network first sa offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request).catch(() => {
        return caches.match('/offline') || caches.match('/');
      })
    );
    return;
  }

  // Default - Network first
  event.respondWith(networkFirst(request));
});

// Cache-first strategija
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Don't log errors for known blocked resources or analytics
    if (!request.url.includes('_vercel') && !request.url.includes('google-analytics')) {
      console.error('[SW] Cache-first failed:', error);
    }
    throw error;
  }
}

// Network-first strategija
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Proveri da li je statički resurs
function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/images/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.woff2')
  );
}

// Push notifikacije
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Novi podaci o kvalitetu vazduha',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/dashboard',
        dateOfArrival: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: 'Pogledaj',
        },
        {
          action: 'close',
          title: 'Zatvori',
        },
      ],
      tag: data.tag || 'air-quality-alert',
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Upozorenje o kvalitetu vazduha',
        options
      )
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

// Klik na notifikaciju
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Ako je aplikacija već otvorena, fokusiraj je
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Inače otvori novi tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Background sync za offline podatke
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-air-quality') {
    event.waitUntil(syncAirQualityData());
  }
});

async function syncAirQualityData() {
  try {
    const response = await fetch('/api/air-quality');
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put('/api/air-quality', response);
      console.log('[SW] Air quality data synced');
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Periodic background sync (Chrome only)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-air-quality') {
    event.waitUntil(syncAirQualityData());
  }
});
