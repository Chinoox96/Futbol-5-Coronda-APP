const CACHE='futbol5-cache-v1';
  self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE)); });
  self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
  self.addEventListener('fetch',e=>{ const req=e.request, url=new URL(req.url); if(req.method!=='GET'||url.origin!==location.origin) return; e.respondWith(caches.match(req).then(c=>c||fetch(req).then(r=>{ const copy=r.clone(); caches.open(CACHE).then(cc=>cc.put(req,copy)); return r; }).catch(()=>c))); });
