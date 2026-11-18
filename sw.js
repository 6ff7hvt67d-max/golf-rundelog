const CACHE="golf-rundelog-v1-31";
const ASSETS=["./","./index.html","./vejledning.html","./manifest.webmanifest","./traening.html","./tips-billeder/over-foedderne.webp","./tips-billeder/under-foedderne.webp","./tips-billeder/op-ad-bakke.webp","./tips-billeder/ned-ad-bakke.webp"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith("golf-rundelog-") && k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("message",event=>{
  if(event.data && event.data.type==="SKIP_WAITING"){
    self.skipWaiting();
  }
});

self.addEventListener("fetch",event=>{
  const req=event.request;

  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req).then(resp=>{
        if(resp && resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
        return resp;
      }).catch(async()=> (await caches.match(req)) || (await caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      const network=fetch(req).then(resp=>{
        if(resp && resp.status===200){
          const copy=resp.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy));
        }
        return resp;
      }).catch(()=>cached);
      return cached || network;
    })
  );
});
