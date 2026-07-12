/* Cobras PWA service worker — offline shell cache */
const CACHE = 'cobras-shell-v8';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './cobras-lib.js',
  './arabic.js',
  './site.js',
  './game.js',
  './game.html',
  './race-day.html',
  './manifest.webmanifest',
  './cobra-race-mark.png',
  './favicon.png',
  './car-rear.png',
  './cobra-front.png',
  './battery-perspective.png',
  './dubai-pixel-skyline.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Prefer network for every document navigation—including clean, extensionless URLs—so updates land immediately.
  const isNetworkFirst = req.mode === 'navigate' || req.destination === 'document' || /\.(js|css|webmanifest|html?)$/i.test(url.pathname) || url.pathname.endsWith('/') || url.pathname.endsWith('/sw.js');
  if (isNetworkFirst && url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        if (res.ok) caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        const copy = res.clone();
        if (res.ok && url.origin === self.location.origin) {
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
