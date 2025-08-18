// SW cache-first con precache básico y runtime cache
const CACHE = 'f5-cache-v9';
const PRECACHE = ['./']; // raíz

self.addEventListener('install', (e)=>{
  e.waitUntil((async()=>{
    const c = await caches.open(CACHE);
    await c.addAll(PRECACHE);
    // Intento de cachear el fondo si existe (no falla si falta)
    try{ const r1 = await fetch('./assets/cesped-vert.webp', {cache:'no-cache'}); if(r1.ok) await c.put('./assets/cesped-vert.webp', r1.clone()); }catch{}
    try{ const r2 = await fetch('./assets/cesped-horiz.webp', {cache:'no-cache'}); if(r2.ok) await c.put('./assets/cesped-horiz.webp', r2.clone()); }catch{}
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  const req=e.request;
  e.respondWith((async()=>{
    const hit=await caches.match(req);
    if(hit) return hit; // cache-first
    try{
      const res=await fetch(req);
      const c=await caches.open(CACHE);
      // Evitar cachear solicitudes no GET
      if(req.method==='GET') c.put(req, res.clone());
      return res;
    }catch{
      return hit || Response.error();
    }
  })());
});
