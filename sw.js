const CACHE = 'kauppalista-v28';
const APP_FILES = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json', '/icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Supabase- ja omat /api/-kutsut: ei cacheta, menee suoraan verkkoon.
  // /api/caldav-sync on GET-pyyntö, joka muuten jäisi kiinni alla olevaan
  // cache-first-logiikkaan ensimmäisen kutsun jälkeen ja tarjoilisi täysin
  // saman vastauksen loputtomiin sen sijaan että hakisi tuoretta dataa.
  if (event.request.url.includes('supabase.co') || event.request.url.includes('/api/')) return;

  // Appitiedostot: cache ensin, verkko varalla
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response.ok) {
          caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      });
    })
  );
});
