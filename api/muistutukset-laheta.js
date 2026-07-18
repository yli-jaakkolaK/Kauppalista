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

  let lahetetty = 0;
  let jatetaanYrittamaan = 0;
  for (const muistutus of erapaivat) {
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
    // ilman uudelleenyritystä — täsmälleen "tilamerkintä ei seurannut
    // todellisuutta" -luonnevika. Nyt: merkitään lähetetyksi VAIN jos joku
    // onnistui TAI tilauksia ei ollut yhtään (ei mitään yritettävää, ei siis
    // retryttävää). Muutoin sent_at jää tyhjäksi — SEURAAVA ~5 min kuluttua
    // ajava kierros yrittää automaattisesti uudelleen, kunnes onnistuu tai
    // tilaus todetaan pysyvästi vanhentuneeksi (404/410, siivotaan yllä).
    const eiRetryttavaa = !Array.isArray(tilaukset) || tilaukset.length === 0;
    if (joku || eiRetryttavaa) {
      const merkintaRes = await supabaseFetch('muistutukset?id=eq.' + muistutus.id, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ sent_at: new Date().toISOString() }),
      });
      // BUGIKORJAUS (2026-07-19, ks. muistiinpanot.md "Kirjoituspolkujen
      // auditointi"): jos TÄMÄ merkintä epäonnistuu, push meni jo perille
      // mutta rivi näyttää yhä lähettämättömältä — sama muistutus lähtisi
      // uudelleen (tupla-push) seuraavalla ~5 min kierroksella ilman että
      // kukaan huomaisi miksi. Lokitetaan nyt selkeästi.
      if (!merkintaRes.ok) {
        console.error('[muistutukset-laheta] id=' + muistutus.id + ': push lähti mutta sent_at-merkintä epäonnistui (' + merkintaRes.status + ') — sama muistutus voi lähteä uudelleen.');
      }
    } else {
      jatetaanYrittamaan++;
      console.error('[muistutukset-laheta] id=' + muistutus.id + ' (source=' + muistutus.source + ', source_ref=' + muistutus.source_ref + ') EI lähtenyt yhteenkään tilaukseen — jätetään uudelleenyritettäväksi.');
    }
    if (joku) lahetetty++;
  }

  return res.status(200).json({ success: true, lahetetty: lahetetty, tarkistettu: erapaivat.length, uudelleenyritetaan: jatetaanYrittamaan });
};
