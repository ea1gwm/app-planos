// Service Worker · DIGI App Planos
// Estrategia "network-first": intenta siempre la red (para tener la última versión);
// si no hay internet, sirve la última copia cacheada (funciona offline).
const CACHE = 'digi-planos-v7.2';

self.addEventListener('install', (e) => {
  self.skipWaiting(); // activa la versión nueva de inmediato
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // No interceptar llamadas a Google (Drive/Auth) ni a otros orígenes externos
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: 'no-store' });
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      throw err;
    }
  })());
});
