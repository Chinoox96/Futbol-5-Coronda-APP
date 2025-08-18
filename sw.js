(()=>{
  const CACHE = 'f5-cache-v15';
  const PRECACHE = ['./','./index.html','./assets/cesped-vert.webp','./assets/cesped-horiz.webp'];

  self.addEventListener('install', (e) => {
    e.waitUntil((async () => {
      const c = await caches.open(CACHE);
      await Promise.all(PRECACHE.map(async (u) => {
        try {
          const r = await fetch(u, { cache: 'no-cache' });
          if (r && r.ok) await c.put(u, r.clone());
        } catch {}
      }));
      self.skipWaiting && self.skipWaiting();
    })());
  });

  self.addEventListener('activate', (e) => {
    e.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
      self.clients && self.clients.claim && self.clients.claim();
    })());
  });

  self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    if (url.origin !== location.origin) return;

    // Navigations: network-first with offline fallback
    if (e.request.mode === 'navigate') {
      e.respondWith((async () => {
        try {
          const r = await fetch(e.request);
          const copy = r.clone();
          const c = await caches.open(CACHE);
          c.put('./index.html', copy);
          return r;
        } catch {
          const cached = await caches.match('./index.html');
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })());
      return;
    }

    // Other GET: stale-while-revalidate
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const cached = await c.match(e.request);
      const network = fetch(e.request).then(r => {
        if (r && r.status === 200) c.put(e.request, r.clone());
        return r;
      }).catch(() => cached);
      return cached || network;
    })());
  });
})();