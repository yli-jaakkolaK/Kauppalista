// Käy läpi kaikki erääntyneet muistutukset (remind_at <= nyt, sent_at NULL)
// ja lähettää web-pushin jokaisen omistajan KAIKKIIN push-tilauksiin. Sama
// lähetyslogiikka kuin api/push-test.js, mutta tämä käy läpi USEAN
// käyttäjän rivejä kerralla eikä vaadi kutsujan omaa kirjautumista — sen
// sijaan pieni jaettu salaisuus URL:ssa (?avain=...), koska kutsuja on
// ajastettu GitHub Actions -cron (ks. .github/workflows/), ei kirjautunut
// selainkäyttäjä. Kutsutaan 5 min välein — tarkkuus ±5 min on hyväksytty
// reunaehto (ks. muistiinpanot.md "Muistutukset"-osio).
//
// Vaatii Vercelin ympäristömuuttujat:
//   SUPABASE_SERVICE_KEY, VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT
//   (samat kuin api/push-test.js:ssä) + MUISTUTUKSET_CRON_SECRET

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

module.exports = async function handler(req, res) {
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
    return res.status(500).json({ error: 'VAPID-ympäristömuuttujat puuttuvat' });
  }
  const salaisuus = process.env.MUISTUTUKSET_CRON_SECRET;
  if (salaisuus && (req.query || {}).avain !== salaisuus) {
    return res.status(401).json({ error: 'Virheellinen tai puuttuva avain' });
  }

  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

  const nyt = new Date().toISOString();
  const erapaivatVastaus = await supabaseFetch(
    'muistutukset?select=*&sent_at=is.null&remind_at=lte.' + encodeURIComponent(nyt)
  );
  const erapaivat = await erapaivatVastaus.json();

  console.log('[muistutukset-laheta] ' + nyt + ': ' + (Array.isArray(erapaivat) ? erapaivat.length : 0) + ' erääntynyttä.');

  if (!Array.isArray(erapaivat) || erapaivat.length === 0) {
    return res.status(200).json({ success: true, lahetetty: 0, tarkistettu: 0 });
  }

  // Palauttaa muistutuksen sent_at:n takaisin nulliksi — käytetään kun claim
  // otettiin mutta lähetys sittenkin epäonnistui/kaatui kokonaan, jotta
  // seuraava ajo yrittää uudelleen (ks. claim-kommentti alla).
  async function palautaSentAt(id) {
    const res = await supabaseFetch('muistutukset?id=eq.' + id, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ sent_at: null }),
    });
    if (!res.ok) {
      console.error('[muistutukset-laheta] id=' + id + ': sent_at-palautus epäonnistui epäonnistuneen lähetyksen jälkeen — muistutus voi jäädä virheellisesti lähetetyksi merkityksi.');
    }
  }

  let lahetetty = 0;
  let jatetaanYrittamaan = 0;
  for (const muistutus of erapaivat) {
    // BUGIKORJAUS (2026-07-21, "Toisto-/idempotenssiauditointi", ks.
    // muistiinpanot.md): cron-job.org ja GitHub Actions pingaavat molemmat
    // tätä endpointia, tarkoituksellisesti mahdollisesti limittäin — ilman
    // atomista "claim"-vaihetta molemmat rinnakkaiset ajot näkisivät saman
    // sent_at=null-rivin JA molemmat lähettäisivät saman muistutuksen
    // KAHDESTI ennen kuin kumpikaan ehtisi merkitä sitä lähetetyksi.
    // Ehdollinen PATCH ...&sent_at=is.null on Postgresissa atominen rivitason
    // operaatio — vain YKSI rinnakkainen kutsuja voi koskaan saada rivin
    // takaisin (return=representation), loput näkevät tyhjän tuloksen ja
    // ohittavat rivin hiljaa (toinen ajo hoitaa sen jo).
    const claimRes = await supabaseFetch('muistutukset?id=eq.' + muistutus.id + '&sent_at=is.null', {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ sent_at: new Date().toISOString() }),
    });
    const claimatut = claimRes.ok ? await claimRes.json() : [];
    if (!Array.isArray(claimatut) || claimatut.length === 0) {
      continue;
    }

    try {
      const tilausVastaus = await supabaseFetch('push_tilaukset?select=*&user_id=eq.' + muistutus.user_id);
      const tilaukset = await tilausVastaus.json();
      const payload = JSON.stringify({ title: 'Satama ⏰', body: muistutus.content });

      let joku = false;
      await Promise.all((tilaukset || []).map(async function(tilaus) {
        try {
          await webpush.sendNotification({
            endpoint: tilaus.endpoint,
            keys: { p256dh: tilaus.p256dh, auth: tilaus.auth },
          }, payload);
          joku = true;
        } catch (e) {
          if (e.statusCode === 404 || e.statusCode === 410) {
            const poistoRes = await supabaseFetch('push_tilaukset?id=eq.' + tilaus.id, { method: 'DELETE' });
            if (!poistoRes.ok) {
              console.error('[muistutukset-laheta] Vanhentuneen tilauksen ' + tilaus.id + ' poisto epäonnistui:', poistoRes.status);
            }
          } else {
            console.error('Muistutuksen push epäonnistui (id=' + muistutus.id + ', source=' + muistutus.source + '):', e.message);
          }
        }
      }));

      // BUGIKORJAUS (2026-07-14, ks. muistiinpanot.md "Ajastetut muistutukset
      // eivät tule perille"): merkittiin AIEMMIN lähetetyksi VAIKKA KAIKKI
      // yritykset epäonnistuisivat — "tietoinen yksinkertaistus" joka
      // kuitenkin tarkoitti että YKSIKIN ohimenevä push-lähetysvirhe (verkko,
      // tilapäinen 5xx palvelimelta) hävitti muistutuksen PYSYVÄSTI, hiljaa,
      // ilman uudelleenyritystä. Nyt: rivi on jo claimattu (sent_at asetettu
      // yllä) — jos KAIKKI yritykset epäonnistuivat eikä ollut yhtään
      // tilausta, sent_at PALAUTETAAN nulliksi jotta seuraava ~5 min kuluttua
      // ajava kierros yrittää automaattisesti uudelleen.
      const eiRetryttavaa = !Array.isArray(tilaukset) || tilaukset.length === 0;
      if (!joku && !eiRetryttavaa) {
        jatetaanYrittamaan++;
        await palautaSentAt(muistutus.id);
        console.error('[muistutukset-laheta] id=' + muistutus.id + ' (source=' + muistutus.source + ', source_ref=' + muistutus.source_ref + ') EI lähtenyt yhteenkään tilaukseen — jätetään uudelleenyritettäväksi.');
      }
      if (joku) lahetetty++;
    } catch (e) {
      // Odottamaton virhe (esim. verkko) claimin JÄLKEEN — rivi ei saa jäädä
      // virheellisesti "lähetetyksi" merkityksi ilman että mitään oikeasti
      // lähti, sama "vahvistus seuraa todellisuutta" -periaate kuin muualla.
      console.error('[muistutukset-laheta] id=' + muistutus.id + ': odottamaton virhe lähetyskäsittelyssä, palautetaan sent_at:', e.message);
      await palautaSentAt(muistutus.id);
    }
  }

  return res.status(200).json({ success: true, lahetetty: lahetetty, tarkistettu: erapaivat.length, uudelleenyritetaan: jatetaanYrittamaan });
};
