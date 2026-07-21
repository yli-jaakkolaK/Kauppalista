// Käy läpi kaikki päättämättömät muistutukset (sent_at NULL) ja lähettää
// web-pushin jokaisen omistajan KAIKKIIN push-tilauksiin. Sama lähetyslogiikka
// kuin api/push-test.js, mutta tämä käy läpi USEAN käyttäjän rivejä kerralla
// eikä vaadi kutsujan omaa kirjautumista — sen sijaan pieni jaettu salaisuus
// URL:ssa (?avain=...), koska kutsuja on ajastettu GitHub Actions -cron
// (ks. .github/workflows/), ei kirjautunut selainkäyttäjä. Kutsutaan 5 min
// välein — tarkkuus ±5 min on hyväksytty reunaehto (ks. muistiinpanot.md
// "Muistutukset"-osio).
//
// Neljä muistutuslajia (ks. muistiinpanot.md "Sinnikäs muistutus" ja
// "Toistuva muistutus"):
// (1) kertaluontoinen (oletus): lähtee KERRAN kun remind_at <= nyt, sent_at
//     merkitään heti.
// (2) sinnikäs/"tärähdyssarja" (persistent=true): remind_at on KOHDEHETKI,
//     tärähdykset lähtevät window_minutes/frequency-minuutin välein ennen
//     sitä. sent_at pysyy NULLINA koko sarjan ajan, sent_count laskee
//     lähetetyt. Kuittaus (acked_at) TAI kohdehetken ohitus TAI kaikki
//     tärähdykset lähetetty päättää sarjan.
// (3) toistuva (recurring=true): YKSI rivi edustaa loputonta SÄÄNTÖÄ, ei
//     yhtä kertaa. remind_at on SEURAAVAN laukaisun ajankohta — kun se
//     erääntyy, muistutus lähtee JA remind_at päivitetään ATOMISESTI
//     seuraavaan lasketun säännön mukaan (recurrence_type: 'weekday'
//     [weekdays int[] ISO 1=ma..7=su + time_of_day] tai 'interval'
//     [interval_n × interval_unit + time_of_day]). sent_at pysyy NULLINA
//     IKUISESTI niin kauan kuin sääntö on aktiivinen — TÄRKEÄ ERO
//     sinnikkääseen: kuittaus (jos sellainen joskus rakennetaan) koskisi
//     VAIN yhtä kertaa, ei koskaan pysäytä sääntöä — tässä erässä ei ole
//     edes erillistä kuittaus-UI:ta, koska rivi etenee seuraavaan kertaan
//     AINA automaattisesti heti lähetyksen jälkeen riippumatta mistään
//     käyttäjän teosta (ks. testitapaus "kuittaamaton kerta ei estä
//     seuraavaa"). Sääntö päättyy VAIN poistamalla rivi (×) tai `ends_at`
//     -päivän umpeutuessa. DST-turvallinen: kaikki päivä/viikko/kuukausi/
//     vuosi-laskenta tehdään Europe/Helsinki-seinäkellonajan komponenteilla
//     (ei UTC-millisekunteina), ks. helsinkiWallClockToUtc()/isoDate()-oppi
//     5b83ed9:stä — "joka päivä klo 8" pysyy klo 8:ssa DST-siirtymän ylikin.
//     Yhteispeli valmistautumisvaiheen (parent_id) kanssa: kun toistuva
//     rivi etenee, sen mahdollisen valmistautumis-lapsen remind_at siirtyy
//     SAMALLA suhteellisella etäisyydellä ja sent_at nollataan — "jokainen
//     kerta saa esitönäisyn". Yhteispeli SINNIKKÄÄN kanssa EI ole tuettu
//     tässä erässä (tietoinen rajaus, ks. muistiinpanot.md) — UI estää
//     molempien valinnan yhtä aikaa.
//
// TASO 2 (2026-07-21, ks. muistiinpanot.md "Vahdittu lepo Varastossa" /
// "Keskusteluteema Varastossa", KONSEPTIKIRJA.md 4.10b) — tämä tiedosto
// hoitaa myös kaksi TÄYSIN ERILLISTÄ, MUISTUTUKSIIN LIITTYMÄTÖNTÄ
// deterministista tarkistusta (ei älykutsua, puhdasta laskentaa), koska ne
// tarvitsevat saman ~5 min cron-kadenssin eikä ole syytä rekisteröidä uutta
// cron-job.org-työtä pelkän ajoituksen jakamiseksi: (a) Vahdittu lepo —
// kuittaamaton vahdittu-listan rivi nousee ankkuriehdokkaaksi X päivän
// jälkeen ("anna arjen yrittää ensin"), (b) Kevyen päivän ehdotus — jos
// huominen on kalenterin mukaan tapahtumaton, ehdottaa YHDEN painavan/vanhan
// avoimen teeman nostoa. Ks. tarkistaVahdittuLepo()/tarkistaKevyenPaivanEhdotus().
//
// Vaatii Vercelin ympäristömuuttujat:
//   SUPABASE_SERVICE_KEY, VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT
//   (samat kuin api/push-test.js:ssä) + MUISTUTUKSET_CRON_SECRET

const webpush = require('web-push');

// --- Aikavyöhykeapurit toistuvien muistutusten laskentaan (2026-07-19,
// ks. muistiinpanot.md "Toistuva muistutus") — Vercel ajaa funktiot UTC:ssa,
// joten kaikki "seuraava kerta" -laskenta pitää tehdä Helsingin
// seinäkellonajan komponenteilla, ei raa'alla UTC-millisekuntiaritmetiikalla
// (muuten "joka päivä klo 8" siirtyisi DST-siirtymän yli, sama bugiluokka
// kuin isoDate()-korjauksessa 5b83ed9). ---

// UTC-hetki -> Helsingin seinäkellonajan komponentit.
function helsinkiParts(date) {
  const osat = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Helsinki', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(date).reduce(function(acc, o) { acc[o.type] = o.value; return acc; }, {});
  return {
    year: parseInt(osat.year, 10),
    month: parseInt(osat.month, 10),
    day: parseInt(osat.day, 10),
    hour: osat.hour === '24' ? 0 : parseInt(osat.hour, 10),
    minute: parseInt(osat.minute, 10),
  };
}

// Helsingin seinäkellonajan komponentit -> todellinen UTC-hetki. Kahden
// kierroksen temppu: rakenna ALUSTAVA arvaus (komponentit sellaisenaan
// UTC:na), katso Intl:llä mitä kellonaikaa se arvaus OIKEASTI näyttäisi
// Helsingissä, ja korjaa erotuksella — riittää yksi kierros koska Helsingin
// poikkeama UTC:sta on aina täysiä tunteja (+2/+3), ei koskaan puolikkaita.
function helsinkiWallClockToUtc(year, month, day, hour, minute) {
  const arvaus = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const osat = helsinkiParts(arvaus);
  const arvausUtcNa = Date.UTC(osat.year, osat.month - 1, osat.day, osat.hour, osat.minute, 0);
  const erotus = arvaus.getTime() - arvausUtcNa;
  return new Date(arvaus.getTime() + erotus);
}

// ISO-viikonpäivä (1=maanantai .. 7=sunnuntai) annetulle Y/M/D-kolmikolle.
function isoViikonpaiva(year, month, day) {
  const jsPaiva = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=su..6=la
  return jsPaiva === 0 ? 7 : jsPaiva;
}

// Laskee toistuvan säännön SEURAAVAN laukaisuhetken (todellinen UTC-hetki)
// annetun edellisen laukaisuhetken jälkeen. Palauttaa null jos sääntö on
// rakenteellisesti virheellinen (ei koskaan pitäisi tapahtua UI:n kautta
// luoduille riveille, mutta cron ei saa kaatua siihen jos näin käy).
function laskeSeuraavaToisto(rule, edellinenHetki) {
  if (rule.recurrence_type === 'weekday') {
    if (!Array.isArray(rule.weekdays) || rule.weekdays.length === 0 || !rule.time_of_day) return null;
    const aikaOsat = rule.time_of_day.split(':').map(function(s) { return parseInt(s, 10); });
    const edellinen = helsinkiParts(edellinenHetki);
    for (let lisays = 1; lisays <= 7; lisays++) {
      const ehdokasUtcNa = new Date(Date.UTC(edellinen.year, edellinen.month - 1, edellinen.day + lisays));
      const ehdokasViikonpaiva = isoViikonpaiva(ehdokasUtcNa.getUTCFullYear(), ehdokasUtcNa.getUTCMonth() + 1, ehdokasUtcNa.getUTCDate());
      if (rule.weekdays.indexOf(ehdokasViikonpaiva) !== -1) {
        return helsinkiWallClockToUtc(ehdokasUtcNa.getUTCFullYear(), ehdokasUtcNa.getUTCMonth() + 1, ehdokasUtcNa.getUTCDate(), aikaOsat[0], aikaOsat[1]);
      }
    }
    return null;
  }

  if (rule.recurrence_type === 'interval') {
    const n = rule.interval_n;
    if (!n || n <= 0) return null;
    if (rule.interval_unit === 'hour') {
      return new Date(edellinenHetki.getTime() + n * 3600000);
    }
    if (!rule.time_of_day) return null;
    const aikaOsat = rule.time_of_day.split(':').map(function(s) { return parseInt(s, 10); });
    const edellinen = helsinkiParts(edellinenHetki);
    let y = edellinen.year, m = edellinen.month, d = edellinen.day;
    if (rule.interval_unit === 'day') d += n;
    else if (rule.interval_unit === 'week') d += n * 7;
    else if (rule.interval_unit === 'month') m += n;
    else if (rule.interval_unit === 'year') y += n;
    else return null;
    // Date.UTC normalisoi ylivuodon (esim. päivä 35 -> seuraava kuukausi)
    // automaattisesti — luetaan normalisoidut komponentit takaisin ennen
    // Helsinki-muunnosta.
    const normalisoitu = new Date(Date.UTC(y, m - 1, d));
    return helsinkiWallClockToUtc(normalisoitu.getUTCFullYear(), normalisoitu.getUTCMonth() + 1, normalisoitu.getUTCDate(), aikaOsat[0], aikaOsat[1]);
  }

  return null;
}

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

// Vahdittu lepo (2026-07-21, TASO 2e, ks. muistiinpanot.md "Vahdittu lepo
// Varastossa" / KONSEPTIKIRJA.md 4.10b) — PUHDAS LASKENTA, ei älykutsua
// ("maksimiautomaatio, minimikustannus": jos asia voidaan ilmaista säännöksi,
// ei älyä). Jaettu-tyyppinen lista, joten EI tiedetä kenelle yksittäinen rivi
// "kuuluu" — ankkuriehdokas luodaan JOKAISELLE push-tilauksen omaavalle
// käyttäjälle (samat kaksi henkilöä koko sovelluksessa), sama "jaettu =
// molemmat näkevät" -periaate kuin muuallakin. Idempotenssi: source='vahdittu'
// + source_ref=<tuoterivin id> uniikki löydös estää saman rivin nostamisen
// uudelleen riippumatta siitä onko edellinen ehdokas yhä pending/hyväksytty/
// hylätty — sama malli kuin muillakin ankkuriehdotusreiteillä.
async function tarkistaVahdittuLepo() {
  let nostettu = 0;
  const listatRes = await supabaseFetch('lists?select=id,name,vahdittu_raja_paivia&list_type=eq.vahdittu');
  const listat = await listatRes.json();
  if (!Array.isArray(listat) || listat.length === 0) return nostettu;

  const kayttajatRes = await supabaseFetch('push_tilaukset?select=user_id');
  const kayttajaRivit = await kayttajatRes.json();
  const userIds = Array.from(new Set((Array.isArray(kayttajaRivit) ? kayttajaRivit : []).map(function(r) { return r.user_id; })));
  if (userIds.length === 0) return nostettu;

  for (const lista of listat) {
    const rajaPaivia = lista.vahdittu_raja_paivia || 14;
    const rajaHetkiIso = new Date(Date.now() - rajaPaivia * 86400000).toISOString();
    const rivitRes = await supabaseFetch('tuotteet?select=id,nimi&list_id=eq.' + lista.id + '&tehty=eq.false&created_at=lt.' + encodeURIComponent(rajaHetkiIso));
    const rivit = await rivitRes.json();
    if (!Array.isArray(rivit)) continue;

    for (const rivi of rivit) {
      const olemassaRes = await supabaseFetch('ankkurit?select=id&source=eq.vahdittu&source_ref=eq.' + rivi.id);
      const olemassa = await olemassaRes.json();
      if (Array.isArray(olemassa) && olemassa.length > 0) continue;

      for (const userId of userIds) {
        const luontiRes = await supabaseFetch('ankkurit', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            content: rivi.nimi + ' (' + lista.name + ') — ei hoitunut itsestään, ankkuriin?',
            source: 'vahdittu',
            source_ref: String(rivi.id),
            user_id: userId,
            is_candidate: true,
          }),
        });
        if (!luontiRes.ok) {
          console.error('[muistutukset-laheta] Vahdittu-ehdokkaan luonti epäonnistui rivi=' + rivi.id + ' user=' + userId + ':', luontiRes.status, await luontiRes.text());
          continue;
        }
        nostettu++;
      }
    }
  }
  return nostettu;
}

// Kevyen päivän ehdotus (2026-07-21, TASO 2d + 2d-2, ks. muistiinpanot.md
// "Keskusteluteema Varastossa" / KONSEPTIKIRJA.md 4.10b) — MYÖS puhdas
// laskenta, ei älykutsua ("kevyt päivä" on pelkkä tapahtumalaskuri, ei vaadi
// tulkintaa). "Max yksi kerrallaan" (spec): jos JOKIN kevyt_paiva-ehdokas on
// yhä pending millä tahansa käyttäjällä, ei ehdoteta uutta. Poimintajärjestys
// painava-vihjeen mukaan (2d-2, "vihje ohjaa järjestelmän aloitetta, ei
// ihmisen muistia") — painava-tyyppiset teemat ensin, sitten vanhin.
async function tarkistaKevyenPaivanEhdotus() {
  const pendingRes = await supabaseFetch('ankkurit?select=id&source=eq.kevyt_paiva&is_candidate=eq.true&done=eq.false');
  const pending = await pendingRes.json();
  if (Array.isArray(pending) && pending.length > 0) return { ehdotettu: false, syy: 'jo_pending' };

  const huominen = new Date(Date.now() + 86400000);
  const huomisenPvm = isoDate(huominen);
  const menotRes = await supabaseFetch('kalenteri_tapahtumat?select=id&event_date=eq.' + huomisenPvm + '&event_time=not.is.null');
  const menot = await menotRes.json();
  const kevyt = Array.isArray(menot) && menot.length === 0;
  if (!kevyt) return { ehdotettu: false, syy: 'ei_kevyt' };

  // HUOM (korjattu konsistenssi-auditoinnissa 2026-07-21): priority on tekstiä
  // ('tavallinen'/'painava'), joten priority.desc lajittelisi aakkosjärjestyksessä
  // väärin päin ('t' > 'p' → tavallinen ensin). asc antaa painava ensin, samoin
  // kuin script.js:n laskeLuoteJono() -erikoiskäsittely (ei aakkosjärjestys).
  const teemaRes = await supabaseFetch('lists?select=id,name,priority&list_type=eq.teema&order=priority.asc,id.asc&limit=1');
  const teemat = await teemaRes.json();
  if (!Array.isArray(teemat) || teemat.length === 0) return { ehdotettu: false, syy: 'ei_teemoja' };
  const teema = teemat[0];

  const kayttajatRes = await supabaseFetch('push_tilaukset?select=user_id');
  const kayttajaRivit = await kayttajatRes.json();
  const userIds = Array.from(new Set((Array.isArray(kayttajaRivit) ? kayttajaRivit : []).map(function(r) { return r.user_id; })));

  let ehdotettu = 0;
  for (const userId of userIds) {
    const luontiRes = await supabaseFetch('ankkurit', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        content: 'Huominen näyttää rauhalliselta — ' + teema.name + '?',
        source: 'kevyt_paiva',
        source_ref: String(teema.id),
        user_id: userId,
        is_candidate: true,
      }),
    });
    if (!luontiRes.ok) {
      console.error('[muistutukset-laheta] Kevyen päivän ehdotuksen luonti epäonnistui teema=' + teema.id + ' user=' + userId + ':', luontiRes.status, await luontiRes.text());
      continue;
    }
    ehdotettu++;
  }
  return { ehdotettu: ehdotettu > 0, syy: 'ehdotettu', teema: teema.name };
}

// Sama Helsinki-kalenteripäivä-laskenta kuin api/_lib/aly-classify.js:n
// isoDate()-funktiolla (5b83ed9-oppi: EI UTC-slicellä) — kopioitu tähän
// erikseen koska tämä tiedosto ei jaa moduuleja _lib:n kanssa (eri syy: siellä
// jako on OK koska molemmat kutsujat ovat äly-lajittelun sisällä, tässä ei ole
// vastaavaa perustetta lisätä riippuvuutta).
function isoDate(d) {
  const osat = new Intl.DateTimeFormat('fi-FI', {
    timeZone: 'Europe/Helsinki',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d).reduce(function(acc, o) { acc[o.type] = o.value; return acc; }, {});
  return osat.year + '-' + osat.month + '-' + osat.day;
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

  // TASO 2e + 2d (2026-07-21) — kaksi UUTTA riippumatonta, deterministista
  // tarkistusta jotka jakavat TÄMÄN endpointin valmiin 5 min -cron-kadenssin
  // (ei uutta cron-job.org-rekisteröintiä, ei uutta GitHub Actions -askelta).
  // Molemmat KÄÄRITTY try/catchiin — bugi kummassakaan EI SAA kaataa alla
  // olevaa, jo tuotannossa todistettua muistutuslogiikkaa.
  let vahdittuNostettu = 0;
  let kevytPaivaTulos = null;
  try {
    vahdittuNostettu = await tarkistaVahdittuLepo();
  } catch (e) {
    console.error('[muistutukset-laheta] Vahditun levon tarkistus heitti poikkeuksen:', e.message);
  }
  try {
    kevytPaivaTulos = await tarkistaKevyenPaivanEhdotus();
  } catch (e) {
    console.error('[muistutukset-laheta] Kevyen päivän ehdotuksen tarkistus heitti poikkeuksen:', e.message);
  }

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
    return res.status(200).json({ success: true, lahetetty: 0, tarkistettu: 0, vahdittu_nostettu: vahdittuNostettu, kevyt_paiva: kevytPaivaTulos });
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

  // Palauttaa toistuvan muistutuksen remind_at:n takaisin edelliseen arvoon
  // — käytetään kun tämän kerran claim otettiin mutta lähetys sittenkin
  // epäonnistui kokonaan, jotta seuraava ajo yrittää SAMAA kertaa uudelleen
  // sen sijaan että hyppäisi jo seuraavaan laskettuun ajankohtaan.
  async function palautaRemindAt(id, vanhaArvo) {
    const res = await supabaseFetch('muistutukset?id=eq.' + id, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ remind_at: vanhaArvo }),
    });
    if (!res.ok) {
      console.error('[muistutukset-laheta] id=' + id + ': remind_at-palautus epäonnistui epäonnistuneen toistokerran jälkeen.');
    }
  }

  // Päättää toistuvan säännön kokonaan (sent_at) — kutsutaan kun ends_at on
  // ohitettu tai sääntö on rakenteellisesti virheellinen. Sama
  // compare-and-swap-periaate kuin muuallakin: odotettu remind_at-arvo
  // suodattimessa varmistaa ettei kaksi rinnakkaista ajoa päätä samaa
  // riviä kahdesti eikä ohita toisen jo tekemää edistystä.
  async function paataToistuva(id, odotettuRemindAt) {
    const res = await supabaseFetch('muistutukset?id=eq.' + id + '&remind_at=eq.' + encodeURIComponent(odotettuRemindAt), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ sent_at: new Date().toISOString() }),
    });
    if (!res.ok) {
      console.error('[muistutukset-laheta] id=' + id + ': toistuvan säännön päättäminen epäonnistui:', res.status);
    }
  }

  let lahetetty = 0;
  let jatetaanYrittamaan = 0;
  let tarkistettu = 0;

  for (const muistutus of kaikki) {
    if (muistutus.recurring) {
      const remindAtMs = new Date(muistutus.remind_at).getTime();
      if (remindAtMs > nytMs) continue; // ei vielä due

      // "Loppuu"-tarkistus ENNEN lähetystä — jos tämä erääntynyt kerta on
      // jo eräpäivän jälkeen, sääntö päätetään kokonaan eikä lähetetä
      // tätäkään enää.
      if (muistutus.ends_at && remindAtMs > new Date(muistutus.ends_at).getTime()) {
        await paataToistuva(muistutus.id, muistutus.remind_at);
        continue;
      }

      tarkistettu++;

      const uusiRemindAt = laskeSeuraavaToisto(muistutus, new Date(muistutus.remind_at));
      if (!uusiRemindAt) {
        console.error('[muistutukset-laheta] id=' + muistutus.id + ': seuraavan toistokerran laskenta epäonnistui (virheellinen sääntö?) — sääntö päätetään.');
        await paataToistuva(muistutus.id, muistutus.remind_at);
        continue;
      }

      // Atominen claim: compare-and-swap remind_at:lla itsellään (versioitu
      // kenttä) — sama periaate kuin sinnikkään sent_count-CAS, vain eri
      // sarake, koska toistuvalla ei ole erillistä per-kerta-laskuria (yksi
      // rivi edustaa koko loputonta sääntöä, ei yhtä kertaa).
      const claimRes = await supabaseFetch('muistutukset?id=eq.' + muistutus.id + '&remind_at=eq.' + encodeURIComponent(muistutus.remind_at), {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ remind_at: uusiRemindAt.toISOString() }),
      });
      const claimatut = claimRes.ok ? await claimRes.json() : [];
      if (!Array.isArray(claimatut) || claimatut.length === 0) continue; // toinen ajo ehti jo

      try {
        const { joku, eiRetryttavaa } = await sendPushToOwner(muistutus, '🔁 ' + muistutus.content);
        if (!joku && !eiRetryttavaa) {
          jatetaanYrittamaan++;
          await palautaRemindAt(muistutus.id, muistutus.remind_at);
          console.error('[muistutukset-laheta] id=' + muistutus.id + ': toistuva kerta EI lähtenyt yhteenkään tilaukseen — jätetään uudelleenyritettäväksi (remind_at palautettu).');
          continue;
        }
        if (joku) lahetetty++;

        // Valmistautumisvaihe + toistuva -yhteispeli (ks. muistiinpanot.md
        // "Toistuva muistutus"): jos tällä rivillä on valmistautumis-lapsi
        // (parent_id), sen remind_at siirretään SAMALLA suhteellisella
        // etäisyydellä uuteen kohdehetkeen ja sent_at nollataan — "jokainen
        // kerta saa esitönäisyn". Etäisyys (prep-minuutit) JOHDETAAN
        // olemassa olevasta erotuksesta, ei tallenneta erikseen.
        const lapsetRes = await supabaseFetch('muistutukset?select=*&parent_id=eq.' + muistutus.id);
        const lapset = (await lapsetRes.json()) || [];
        for (const lapsi of lapset) {
          const etaisyysMs = remindAtMs - new Date(lapsi.remind_at).getTime();
          const uusiLapsenHetki = new Date(uusiRemindAt.getTime() - etaisyysMs);
          const lapsiRes = await supabaseFetch('muistutukset?id=eq.' + lapsi.id, {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ remind_at: uusiLapsenHetki.toISOString(), sent_at: null }),
          });
          if (!lapsiRes.ok) {
            console.error('[muistutukset-laheta] id=' + lapsi.id + ': toistuvan valmistautumis-lapsen siirto epäonnistui.');
          }
        }
      } catch (e) {
        console.error('[muistutukset-laheta] id=' + muistutus.id + ': odottamaton virhe toistuvan kerran käsittelyssä, palautetaan remind_at:', e.message);
        await palautaRemindAt(muistutus.id, muistutus.remind_at);
      }
      continue;
    }

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

  return res.status(200).json({ success: true, lahetetty: lahetetty, tarkistettu: tarkistettu, uudelleenyritetaan: jatetaanYrittamaan, vahdittu_nostettu: vahdittuNostettu, kevyt_paiva: kevytPaivaTulos });
};
