const CACHE='lgmk-v8-1-semester-research-20260728';
const ASSETS=['./','./index.html','./assets/css/style.css?v=810','./assets/js/data-core.js?v=810','./assets/js/data-language.js?v=810','./assets/js/data-learning.js?v=810','./assets/js/data-merge.js?v=810','./assets/js/app-core.js?v=810','./assets/js/app-views1.js?v=810','./assets/js/app-views2.js?v=810','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(x=>x||caches.match('./index.html'))))});
