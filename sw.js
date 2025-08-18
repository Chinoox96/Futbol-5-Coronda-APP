// Service Worker cache-first
const CACHE = 'f5-cache-v2';
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./'])));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  })());
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const req=e.request;
  e.respondWith((async()=>{
    const hit=await caches.match(req);
    if(hit) return hit;
    try{ const res=await fetch(req); const c=await caches.open(CACHE); c.put(req,res.clone()); return res }catch{ return hit||Response.error() }
  })());
});