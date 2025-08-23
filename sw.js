// sw.js — cache simple para GitHub Pages
const CACHE = 'f5-cache-v16';

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const safePut = async (u) => {
      try {
        const r = await fetch(u, { cache: 'no-cache' });
        if (r.ok) await c.put(u, r.clone());
      } catch {}
    };
    await safePut('./');
    await safePut('./index.html');
    await safePut('./assets/cesped-vert.webp');
    await safePut('./assets/cesped-horiz.webp');
    // Iconos opcionales si existen
    await safePut('./icons/icon-192.png');
    await safePut('./icons/icon-512.png');
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  if (url.origin === location.origin) {
    // network-first, fallback a cache, luego a index.html
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const r = await fetch(e.request);
        if (r && r.status === 200) c.put(e.request, r.clone());
        return r;
      } catch {
        const m = await c.match(e.request);
        return m || c.match('./index.html');
      }
    })());
  }
});
