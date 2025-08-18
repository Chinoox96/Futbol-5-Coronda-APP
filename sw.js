// sw.js
(() => {
  const CACHE = 'f5-cache-v13';
  const ASSETS = [
    './',
    './index.html',
    './assets/cesped-vert.webp',
    './assets/cesped-horiz.webp' // si no existe, no pasa nada
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      // Precache sólo mismo-origen
      await Promise.all(ASSETS.map(async (url) => {
        try {
          const req = new Request(url, { cache: 'no-cache' });
          const res = await fetch(req);
          if (res.ok) await cache.put(req, res.clone());
        } catch (_) { /* ignorar fallos individuales */ }
      }));
      self.skipWaiting();
    })());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
      await self.clients.claim();
    })());
  });

  self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // Sólo GET de mismo origen
    if (req.method !== 'GET' || url.origin !== location.origin) return;

    // Navegación (HTML): network-first con fallback a cache e index.html
    if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        try {
          const res = await fetch(req);
          cache.put(req, res.clone()).catch(() => {});
          return res;
        } catch {
          const cached = await cache.match(req);
          return cached || cache.match('./index.html');
        }
      })());
      return;
    }

    // Otros assets: stale-while-revalidate
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
        return res;
      }).catch(() => null);
      return cached || fetchPromise || (await cache.match('./index.html'));
    })());
  });
})();
