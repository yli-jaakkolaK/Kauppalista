// Lähettää kirjautuneen käyttäjän KAIKKIIN omiin push-tilauksiin (eli
// kaikkiin laitteisiin joilla hän on sallinut ilmoitukset) yhden
// testi-ilmoituksen. Tarkoitettu illan/laitetestaukseen — myöhemmät
// muistutukset käyttävät samaa web-push-lähetyslogiikkaa, vain payload ja
// laukaisin vaihtuvat.
//
// Vaatii Vercelin ympäristömuuttujat:
//   SUPABASE_SERVICE_KEY (sama kuin muillakin api/-funktioilla)
//   VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY (sensitive) / VAPID_SUBJECT (mailto:...)

const webpush = require('web-push');

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabaseFetch(polku, valinnat) {
  valinnat = valinnat || {};
  return fetch(SUPABASE_URL + '/rest/v1/' + polku, Object.assign({}, valinnat, {
    headers: Object.assign({
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
    }, valinnat.headers),
  }));
}

// Tunnistaa kutsujan Supabase-istunnon access_token-arvon perusteella —
// funktio ei koskaan lähetä pushia kenellekään muulle kuin kutsujalle itselleen.
async function haeKayttajaId(userToken) {
  const vastaus = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!vastaus.ok) return null;
  const data = await vastaus.json();
  return data.id || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
    return res.status(500).json({ error: 'VAPID-ympäristömuuttujat (VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT) puuttuvat' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ error: 'Ei kirjautunut' });
  }

  const userId = await haeKayttajaId(token);
  if (!userId) {
    return res.status(401).json({ error: 'Virheellinen tai vanhentunut kirjautuminen' });
  }

  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

  const tilausVastaus = await supabaseFetch('push_tilaukset?select=*&user_id=eq.' + userId);
  const tilaukset = await tilausVastaus.json();

  if (!Array.isArray(tilaukset) || tilaukset.length === 0) {
    return res.status(200).json({ success: true, lahetetty: 0, viesti: 'Ei push-tilauksia tälle käyttäjälle — paina ensin "Salli ilmoitukset".' });
  }

  const payload = JSON.stringify({ title: 'Satama', body: 'Testi-ilmoitus Satamasta ⚓' });

  let lahetetty = 0;
  await Promise.all(tilaukset.map(async function(tilaus) {
    try {
      await webpush.sendNotification({
        endpoint: tilaus.endpoint,
        keys: { p256dh: tilaus.p256dh, auth: tilaus.auth },
      }, payload);
      lahetetty++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        // Tilaus ei ole enää voimassa (esim. appi poistettu laitteelta) — siivotaan pois.
        await supabaseFetch('push_tilaukset?id=eq.' + tilaus.id, { method: 'DELETE' });
      } else {
        console.error('Push-lähetys epäonnistui:', e.message);
        await supabaseFetch('push_tilaukset?id=eq.' + tilaus.id, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ failed_count: (tilaus.failed_count || 0) + 1 }),
        });
      }
    }
  }));

  return res.status(200).json({ success: true, lahetetty: lahetetty, yhteensa: tilaukset.length });
};
