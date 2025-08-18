(()=>{
  const CACHE='f5-cache-v12';
  self.addEventListener('install',e=>{
    e.waitUntil((async()=>{
      const c=await caches.open(CACHE);
      const put=async u=>{try{const r=await fetch(u,{cache:'no-cache'});if(r.ok)await c.put(u,r.clone())}catch{}};
      await put('./'); await put('./index.html');
      await put('./assets/cesped-vert.webp'); await put('./assets/cesped-horiz.webp');
    })());
  });
  self.addEventListener('activate',e=>{
    e.waitUntil((async()=>{
      const ks=await caches.keys();
      await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    })());
  });
  self.addEventListener('fetch',e=>{
    const url=new URL(e.request.url);
    if(e.request.method!=='GET') return;
    if(url.origin===location.origin){
      e.respondWith((async()=>{
        const c=await caches.open(CACHE);
        try{
          const r=await fetch(e.request);
          if(r&&r.status===200){ c.put(e.request,r.clone()); }
          return r;
        }catch{
          const m=await c.match(e.request);
          return m||c.match('./index.html');
        }
      })());
    }
  });
})();