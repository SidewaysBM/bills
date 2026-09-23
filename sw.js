const CACHE = 'household-bills-banks2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request, { ignoreSearch: true });
    const network = fetch(e.request).then(r => { if (r && r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => null);
    if (e.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
      const r = await Promise.race([network, new Promise(res => setTimeout(() => res(null), 3000))]);
      if (r) return r;
      if (cached) return cached;
      return (await network) || Response.error();
    }
    return cached || (await network) || Response.error();
  })());
});
