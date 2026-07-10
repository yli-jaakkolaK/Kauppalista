const CACHE = 'kauppalista-v38';
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

// Yleiskäyttöinen push-käsittelijä — ei sidottu mihinkään yksittäiseen
// ominaisuuteen (testipush, tulevat muistutukset ym. käyttävät samaa).
// Payload on aina JSON: { title, body }. Jos jäsennys epäonnistuu jostain
// syystä, näytetään silti geneerinen ilmoitus ettei push katoa hiljaa.
self.addEventListener('push', event => {
  let data = { title: 'Satama', body: '' };
  try {
    if (event.data) data = Object.assign(data, event.data.json());
  } catch (e) {
    data.body = event.data ? event.data.text() : '';
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      badge: '/icon.png',
    })
  );
});

// Ilmoituksen napautus: fokusoi jo auki oleva PWA-ikkuna jos sellainen on,
// muuten avaa uuden.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
