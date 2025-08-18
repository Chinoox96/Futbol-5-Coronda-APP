/* Fútbol 5 Service Worker - network-first con fallback a cache */
(() => {
  const CACHE = 'f5-cache-v13';

  self.addEventListener('install', (e) => {
    e.waitUntil((async () => {
      const c = await caches.open(CACHE);
      const put = async (u) => {
        try {
          const r = await fetch(u, { cache: 'no-cache' });
          if (r.ok) await c.put(u, r.clone());
        } catch {}
      };
      // Precarga básicos (el resto se cachea on-demand)
      await put('./');
      await put('./index.html');
      await put('./assets/cesped-vert.webp');
      await put('./assets/cesped-horiz.webp');
    })());
    self.skipWaiting();
  });

  self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
      const ks = await caches.keys();
      await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
      await self.clients.claim();
    })());
  });

  self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;

    e.respondWith((async () => {
      const cache = await caches.open(CACHE);

      // Intento online primero
      try {
        const net = await fetch(req);
        if (net && net.status === 200) cache.put(req, net.clone());
        return net;
      } catch {
        // Offline: devolver cache si existe
        const hit = await cache.match(req);
        if (hit) return hit;

        // Si es navegación HTML, devolver index
        const accept = req.headers.get('accept') || '';
        if (accept.includes('text/html')) {
          const idx = await cache.match('./index.html');
          if (idx) return idx;
        }

        // Nada disponible
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
  });
})();
