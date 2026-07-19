// Käy läpi kaikki päättämättömät muistutukset (sent_at NULL) ja lähettää
// web-pushin jokaisen omistajan KAIKKIIN push-tilauksiin. Sama lähetyslogiikka
// kuin api/push-test.js, mutta tämä käy läpi USEAN käyttäjän rivejä kerralla
// eikä vaadi kutsujan omaa kirjautumista — sen sijaan pieni jaettu salaisuus
// URL:ssa (?avain=...), koska kutsuja on ajastettu GitHub Actions -cron
// (ks. .github/workflows/), ei kirjautunut selainkäyttäjä. Kutsutaan 5 min
// välein — tarkkuus ±5 min on hyväksytty reunaehto (ks. muistiinpanot.md
// "Muistutukset"-osio).
//
// Kaksi muistutuslajia (2026-07-19, ks. muistiinpanot.md "Sinnikäs muistutus"):
// (1) kertaluontoinen (persistent=false, oletus): sama kuin ennen — lähtee
//     KERRAN kun remind_at <= nyt, sent_at merkitään heti.
// (2) sinnikäs/"tärähdyssarja" (persistent=true): remind_at on KOHDEHETKI,
//     ei ensimmäisen lähetyksen aika — tärähdykset lähtevät
//     window_minutes/frequency-minuutin välein alkaen (remind_at -
//     window_minutes) asti (remind_at - askel). sent_at pysyy NULLINA koko
//     sarjan ajan (rivi näkyy yhä aktiivisena muistutuspaneelissa),
//     sent_count laskee lähetetyt tärähdykset. Sarja PÄÄTTYY (sent_at
//     asetetaan) kun KUKA TAHANSA näistä toteutuu: käyttäjä kuittasi
//     (acked_at), kaikki tärähdykset lähetetty, TAI kohdehetki (remind_at)
//     on ohitettu — viimeinen takaa ettei sarja koskaan hakkaa ikuisesti.
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

// Lähettää pushin muistutuksen omistajan KAIKKIIN tilauksiin, jaettu sekä
// kertaluontoisen että sinnikkään polun käyttöön. Palauttaa {joku,
// eiRetryttavaa} — kutsuja päättää näiden perusteella pitääkö "lähetetyksi"
// merkintä perua (ks. palautaSentAt/revertSentCount alla).
async function sendPushToOwner(muistutus, bodyText) {
  const tilausVastaus = await supabaseFetch('push_tilaukset?select=*&user_id=eq.' + muistutus.user_id);
  const tilaukset = await tilausVastaus.json();
  const payload = JSON.stringify({ title: 'Satama ⏰', body: bodyText });

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

  return { joku: joku, eiRetryttavaa: !Array.isArray(tilaukset) || tilaukset.length === 0 };
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

  // BUGIKORJAUS/LAAJENNUS (2026-07-19, "Sinnikäs muistutus", ks.
  // muistiinpanot.md): haetaan KAIKKI päättämättömät rivit (sent_at IS
  // NULL) ilman remind_at-suodatinta — kertaluontoinen erääntyy vasta
  // remind_at:ssa (suodatetaan JS:ssä alla), mutta sinnikkään ENSIMMÄINEN
  // tärähdys erääntyy JO ENNEN remind_at:ia (remind_at - window_minutes),
  // joten PostgREST-tason "remind_at <= nyt" -suodatin olisi sulkenut sen
  // pois liian aikaisin. Perheen käyttömäärällä (muutama muistutus
  // kerrallaan, ks. "Riippuvuudet ja rajat" -kiintiöauditointi) kaikkien
  // päättämättömien rivien haku ja ajoituksen laskenta JS:ssä on
  // yksinkertaisempaa ja yhtä halpaa kuin yrittää koodata koko sinnikkään
  // aikataulu PostgREST-suodattimiksi.
  const nyt = new Date();
  const nytMs = nyt.getTime();
  const kaikkiVastaus = await supabaseFetch('muistutukset?select=*&sent_at=is.null');
  const kaikki = await kaikkiVastaus.json();

  console.log('[muistutukset-laheta] ' + nyt.toISOString() + ': ' + (Array.isArray(kaikki) ? kaikki.length : 0) + ' päättämätöntä riviä tarkistettavana.');

  if (!Array.isArray(kaikki) || kaikki.length === 0) {
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

  // Merkitsee sinnikkään sarjan PÄÄTTYNEEKSI (sent_at) — sama atominen
  // compare-and-swap-periaate kuin kertaluontoisen claim (vain YKSI
  // rinnakkainen kutsuja voi koskaan onnistua, loput ohittavat hiljaa).
  // Kutsutaan kun kuittaus/kohdehetki/täysi tärähdysmäärä päättää sarjan.
  async function paataPersistentti(id) {
    const res = await supabaseFetch('muistutukset?id=eq.' + id + '&sent_at=is.null', {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ sent_at: new Date().toISOString() }),
    });
    if (!res.ok) {
      console.error('[muistutukset-laheta] id=' + id + ': sinnikkään sarjan päättäminen epäonnistui:', res.status);
    }
  }

  // Palauttaa sent_count:n takaisin edelliseen arvoon — käytetään kun YHDEN
  // tärähdyksen claim otettiin mutta lähetys sittenkin epäonnistui kokonaan,
  // jotta seuraava ajo yrittää SAMAA tärähdystä uudelleen sen sijaan että
  // hyppäisi seuraavaan (sama "vahvistus seuraa todellisuutta" -periaate).
  async function palautaSentCount(id, vanhaArvo) {
    const res = await supabaseFetch('muistutukset?id=eq.' + id, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ sent_count: vanhaArvo }),
    });
    if (!res.ok) {
      console.error('[muistutukset-laheta] id=' + id + ': sent_count-palautus epäonnistui epäonnistuneen tärähdyksen jälkeen.');
    }
  }

  let lahetetty = 0;
  let jatetaanYrittamaan = 0;
  let tarkistettu = 0;

  for (const muistutus of kaikki) {
    if (!muistutus.persistent) {
      // Kertaluontoinen — TÄYSIN ENNALLAAN (regressio: 2026-07-19 lisäys ei
      // saa muuttaa tätä polkua millään tavalla, ks. testitapaus 3).
      if (new Date(muistutus.remind_at).getTime() > nytMs) continue;
      tarkistettu++;

      // BUGIKORJAUS (2026-07-21, "Toisto-/idempotenssiauditointi", ks.
      // muistiinpanot.md): cron-job.org ja GitHub Actions pingaavat molemmat
      // tätä endpointia, tarkoituksellisesti mahdollisesti limittäin — ilman
      // atomista "claim"-vaihetta molemmat rinnakkaiset ajot näkisivät saman
      // sent_at=null-rivin JA molemmat lähettäisivät saman muistutuksen
      // KAHDESTI. Ehdollinen PATCH ...&sent_at=is.null on Postgresissa
      // atominen rivitason operaatio — vain YKSI rinnakkainen kutsuja voi
      // koskaan saada rivin takaisin, loput ohittavat hiljaa.
      const claimRes = await supabaseFetch('muistutukset?id=eq.' + muistutus.id + '&sent_at=is.null', {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ sent_at: new Date().toISOString() }),
      });
      const claimatut = claimRes.ok ? await claimRes.json() : [];
      if (!Array.isArray(claimatut) || claimatut.length === 0) continue;

      try {
        const { joku, eiRetryttavaa } = await sendPushToOwner(muistutus, muistutus.content);
        // BUGIKORJAUS (2026-07-14, ks. muistiinpanot.md "Ajastetut
        // muistutukset eivät tule perille"): jos KAIKKI yritykset
        // epäonnistuivat eikä ollut yhtään tilausta, sent_at PALAUTETAAN
        // nulliksi jotta seuraava ~5 min kuluttua ajava kierros yrittää
        // automaattisesti uudelleen.
        if (!joku && !eiRetryttavaa) {
          jatetaanYrittamaan++;
          await palautaSentAt(muistutus.id);
          console.error('[muistutukset-laheta] id=' + muistutus.id + ' (source=' + muistutus.source + ', source_ref=' + muistutus.source_ref + ') EI lähtenyt yhteenkään tilaukseen — jätetään uudelleenyritettäväksi.');
        }
        if (joku) lahetetty++;
      } catch (e) {
        console.error('[muistutukset-laheta] id=' + muistutus.id + ': odottamaton virhe lähetyskäsittelyssä, palautetaan sent_at:', e.message);
        await palautaSentAt(muistutus.id);
      }
      continue;
    }

    // Sinnikäs/"tärähdyssarja" (2026-07-19, ks. muistiinpanot.md "Sinnikäs
    // muistutus"). Kuittaus tarkistetaan AINA ensin — pysäyttää sarjan
    // riippumatta siitä paljonko ikkunaa on jäljellä.
    if (muistutus.acked_at) {
      await paataPersistentti(muistutus.id);
      continue;
    }

    const remindAtMs = new Date(muistutus.remind_at).getTime();
    const frequency = muistutus.frequency || 0;
    const windowMinutes = muistutus.window_minutes || 0;
    // Kohdehetki ohitettu TAI kaikki tärähdykset jo lähetetty TAI
    // virheellinen (nollattu) aikataulu — päätä sarja äläkä koskaan hakkaa
    // ikuisesti, riippumatta kuittauksesta.
    if (nytMs >= remindAtMs || frequency <= 0 || windowMinutes <= 0 || muistutus.sent_count >= frequency) {
      await paataPersistentti(muistutus.id);
      continue;
    }

    const askelMs = (windowMinutes * 60000) / frequency;
    const seuraavaTarahdys = remindAtMs - windowMinutes * 60000 + muistutus.sent_count * askelMs;
    if (nytMs < seuraavaTarahdys) continue; // ei vielä due, odota seuraavaa ajoa

    tarkistettu++;

    // Atominen claim YHDELLE tärähdykselle — compare-and-swap sent_count-
    // sarakkeella (EI sent_at, joka pysyy nullina koko ikkunan ajan jotta
    // rivi näkyy yhä aktiivisena muistutuspaneelin listassa). Sama
    // rinnakkaisuussuoja kuin kertaluontoisen claim, vain eri sarake.
    const claimRes = await supabaseFetch('muistutukset?id=eq.' + muistutus.id + '&sent_count=eq.' + muistutus.sent_count, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ sent_count: muistutus.sent_count + 1 }),
    });
    const claimatut = claimRes.ok ? await claimRes.json() : [];
    if (!Array.isArray(claimatut) || claimatut.length === 0) continue; // toinen ajo ehti jo

    const uusiLaskuri = muistutus.sent_count + 1;
    try {
      const bodyText = '🔁 ' + uusiLaskuri + '/' + frequency + ' — ' + muistutus.content;
      const { joku, eiRetryttavaa } = await sendPushToOwner(muistutus, bodyText);
      if (!joku && !eiRetryttavaa) {
        jatetaanYrittamaan++;
        await palautaSentCount(muistutus.id, muistutus.sent_count);
        console.error('[muistutukset-laheta] id=' + muistutus.id + ': sinnikäs tärähdys ' + uusiLaskuri + '/' + frequency + ' EI lähtenyt yhteenkään tilaukseen — jätetään uudelleenyritettäväksi.');
        continue;
      }
      if (joku) lahetetty++;
      // Viimeinen tärähdys lähetetty — päätä sarja heti (ei odoteta
      // kohdehetkeä), sama "rivi katoaa listasta kun se on käsitelty"
      // -käytös kuin kertaluontoisella muistutuksella.
      if (uusiLaskuri >= frequency) await paataPersistentti(muistutus.id);
    } catch (e) {
      console.error('[muistutukset-laheta] id=' + muistutus.id + ': odottamaton virhe sinnikkään tärähdyksen käsittelyssä, palautetaan sent_count:', e.message);
      await palautaSentCount(muistutus.id, muistutus.sent_count);
    }
  }

  return res.status(200).json({ success: true, lahetetty: lahetetty, tarkistettu: tarkistettu, uudelleenyritetaan: jatetaanYrittamaan });
};
