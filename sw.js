// sw.js — cache con bust y control inmediato
const CACHE = 'f5c-v25'; // <- súbelo cuando cambies assets
const ASSETS = [
  './',
  './index.html',
  './assets/cesped-vert.webp',
  './assets/cesped-horiz.webp',
  './assets/cancha.png?v=4',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const u of ASSETS) {
      try {
        const r = await fetch(u, {cache:'no-cache'});
        if (r.ok) await c.put(u, r.clone());
      } catch {}
    }
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// network-first con fallback a cache e index
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const r = await fetch(e.request, {cache:'no-store'});
      if (r && r.status === 200) c.put(e.request, r.clone());
      return r;
    } catch {
      return (await c.match(e.request)) || (await c.match('./index.html'));
    }
  })());
});
