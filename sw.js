// sw.js — PWA para GitHub Pages (scope relativo)
// - Evita 404 en addAll
// - Controla la página (skipWaiting + clients.claim)
// - Navegación SPA: fallback a index.html
const CACHE = "f5c-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",        // <= si usas .webmanifest
  "./assets/cesped-vert.webp",
  "./assets/cesped-horiz.webp",
  "./assets/cancha.png",           // <= añádelo si existe
  "./icons/icon-192.png",          // <= ponlos si existen
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // addAll falla si alguno 404; cargamos uno por uno
    await Promise.all(ASSETS.map(async (u) => {
      try {
        const r = await fetch(u, { cache: "no-cache" });
        if (r.ok) await c.put(u, r.clone());
      } catch {}
    }));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

// HTML: network-first con fallback a cache; estáticos: cache-first
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.origin !== location.origin) return;

  // Navegaciones (SPA)
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        // Guarda copia
        const copy = net.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return net;
      } catch {
        const c = await caches.open(CACHE);
        return (await c.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  // Estáticos
  event.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req);
    if (hit) return hit;
    try {
      const net = await fetch(req);
      if (net && net.status === 200) c.put(req, net.clone());
      return net;
    } catch {
      return hit || Response.error();
    }
  })());
});
