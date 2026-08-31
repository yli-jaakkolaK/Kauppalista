const CACHE = 'kauppalista-v264';
const APP_FILES = ['/', '/index.html', '/style.css', '/script.js', '/harjoittele.js', '/ruori-saa.js', '/foli.js', '/opinto-miro.js', '/opinto-ai-prompti.js', '/tauko.js', '/manifest.json', '/icon.png'];

// Sama julkinen avain kuin script.js:ssä (VAPID_PUBLIC_KEY) — kaksi kopiota
// koska service worker ei voi importata script.js:ää. Julkinen avain saa
// näkyä tässä (ks. script.js:n kommentti samasta vakiosta).
const VAPID_PUBLIC_KEY = 'BBnARMtYtTabRROSxmKux3RG3LBcWsWTBhFB805RJgUKcROtJFdX6mQfUa1U2jxXBDcHK4GgkI9ZkJ8o_udhspg';
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

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
        // KORJATTU 2026-08-31: clone() PITÄÄ kutsua SYNKRONISESTI heti kun
        // response saadaan, ei myöhemmin caches.open().then()-lohkon sisällä
        // (kuten ennen) — jos clone() viivästyy, sivu (esim. <script>-tagin
        // lataus) ehtii jo alkaa lukea vastauksen bodya ennen clonea, jolloin
        // clone() heittää "Response body is already used" ja SW:n oma
        // fetch-käsittely voi jäädä kesken sen tiedoston kohdalla — Katrin
        // löytämä bugi: satunnainen tiedosto (esim. saa-widget.js, foli.js)
        // jäi tämän takia joskus lataamatta kokonaan, näkyi mm. "lataaRuoriSaa
        // is not defined" -virheenä ja FÖLI-siirtymien puuttumisena.
        if (response.ok) {
          const cachettava = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, cachettava));
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

// Selain voi vaihtaa tilauksen endpointin ilman käyttäjän tekemistä (esim.
// push-palvelun sisäinen kierrätys) — ilman tätä kuuntelijaa tilaus katoaa
// hiljaa ja ilmoitukset lakkaavat tulematta kunnes käyttäjä huomaa ja painaa
// "Salli ilmoitukset" uudelleen (Katrin toistuva ongelma 2026-08-26).
// Tilataan heti uudelleen samalla avaimella, ja pyydetään auki olevaa
// sivua tallentamaan uusi endpoint Supabaseen (service workerilla ei ole
// kirjautuneen käyttäjän tunnistetta/tokenia, joten kirjoitus tehdään aina
// sivun puolelta — ks. script.js:n 'push-resubscribed'-viestin käsittely).
// Jos sivu ei ole auki juuri sillä hetkellä, script.js:n oma itsekorjaus
// (paivitaPushTila, ajetaan joka avauksella/fokusoinnilla) huomaa ja korjaa
// tilanteen seuraavan kerran kun appi avataan.
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }).then(() => self.clients.matchAll())
      .then(clientList => clientList.forEach(client => client.postMessage({ type: 'push-resubscribed' })))
      .catch(err => console.error('Push-uudelleentilaus epäonnistui:', err))
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
