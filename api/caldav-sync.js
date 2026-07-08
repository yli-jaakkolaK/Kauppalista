// Geneerinen kalenterisyöte-synkka: käy läpi kaikki kalenteri_syotteet-taulun
// enabled=true-rivit ja tuo niiden tapahtumat Satamaan. YKSI yhteinen
// koneisto kahdelle syötetyypille (icloud/ics_url) ja kahdelle tilalle
// (taysi/vain_varattu) — uusi kalenteri lisätään Table Editorista, ei tähän
// tiedostoon koodaamalla. Ks. sql/014_kalenteri_syotteet.sql yläkommentti ja
// muistiinpanot.md "Kalenterisyötteet"-osio täydelle selitykselle.
//
// Yksisuuntainen pull (iCloud/ics-url -> Satama), EI kirjoiteta mitään
// takaisin. Kutsutaan sovelluksesta aina kun Kalenteri-näkymä avataan
// (script.js: synkkaaICloud()) — EI Vercel Cronia, koska Hobby-tason cron
// toimii vain kerran vuorokaudessa eikä täsmällisesti (jos päädytään
// lisäämään Cron-varmistus, se vaatii Vercel Pro -tason, ks. muistiinpanot.md).
//
// Vaatii Vercelin ympäristömuuttujat:
//   SUPABASE_SERVICE_KEY        (sama kuin api/add.js:ssä, ohittaa RLS:n)
//   ICLOUD_USERNAME             (Katrin Apple ID -kirjautumisosoite — jos
//                                CalDAV-login palauttaa 401, kokeile
//                                @icloud.com-muotoa)
//   ICLOUD_APP_PASSWORD         (Katrin sovelluskohtainen salasana,
//                                appleid.apple.com:ista, EI oikea iCloud-salasana)
//   ICLOUD_USERNAME_JUHA        (sama periaate, Juhan tili)
//   ICLOUD_APP_PASSWORD_JUHA    (sama periaate, Juhan tili)
//
// Useampi tili tarvitaan koska osa perheen tapahtumista elää Juhan
// henkilökohtaisissa kalentereissa, joita Katrin tunnukset eivät näe.
// kalenteri_syotteet.account_key ('katri'/'juha', ks. sql/017_kalenteri_tilit.sql)
// kertoo per syöte kumman tilin tunnuksilla se haetaan — itse salasanat
// pysyvät AINA ympäristömuuttujissa, tauluun tulee vain viittausavain.

const { DAVClient } = require('tsdav');
const ICAL = require('ical.js');

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const TILIT = {
  katri: { username: process.env.ICLOUD_USERNAME, password: process.env.ICLOUD_APP_PASSWORD },
  juha: { username: process.env.ICLOUD_USERNAME_JUHA, password: process.env.ICLOUD_APP_PASSWORD_JUHA },
};

// Kuinka monta päivää eteenpäin haetaan, ja kuinka moneksi yksittäiseksi
// esiintymäksi yksi toistuva tapahtuma puretaan enintään (aikabudjetin
// turvaraja — viallinen/loputon RRULE ei saa jumittaa funktiota).
const PAIVIA_ETEENPAIN = 30;
const MAX_ESIINTYMAA_SARJASSA = 60;

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

// ICAL.Time -> { event_date, event_time }. Koko päivän tapahtumille (isDate)
// luetaan vuosi/kk/pv suoraan ICAL.Time-komponenteista, EI JS Dateksi
// muunnettuna — Vercel ajaa funktiot UTC-aikavyöhykkeellä, joten paikallinen
// getDate()-haku siirtäisi päivämäärän yhdellä taaksepäin (todennettu käsin
// ennen tämän tiedoston kirjoittamista). Ajallisille tapahtumille kellonaika
// muunnetaan Suomen aikaan Intl:llä, ei palvelimen omalla aikavyöhykkeellä.
function pvmJaAika(hetki) {
  if (hetki.isDate) {
    return {
      event_date: hetki.year + '-' + String(hetki.month).padStart(2, '0') + '-' + String(hetki.day).padStart(2, '0'),
      event_time: null,
    };
  }
  const jsHetki = hetki.toJSDate();
  const osat = new Intl.DateTimeFormat('fi-FI', {
    timeZone: 'Europe/Helsinki',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(jsHetki).reduce(function(acc, o) { acc[o.type] = o.value; return acc; }, {});
  return {
    event_date: osat.year + '-' + osat.month + '-' + osat.day,
    event_time: osat.hour + ':' + osat.minute + ':00',
  };
}

// Jäsentää yhden .ics-tekstin (joko yksittäinen CalDAV-objekti tai koko
// ics_url-tiedosto, jossa voi olla monta VEVENTiä) ja palauttaa listan
// { uid, title, event_date, event_time, event_end_time, organizer }.
// Toistuvat tapahtumat (RRULE) puretaan itse ICAL.js:n iteraattorilla
// annetulle aikavälille — EI luoteta CalDAV-palvelimen valinnaiseen
// server-side expand -tukeen, koska sitä ei voitu varmistaa ilman oikeaa
// dataa (ics_url-syötteillä ei ole CalDAV-palvelinta ollenkaan, joten tämä
// on ainoa tapa joka toimii molemmilla syötetyypeillä yhtenäisesti).
function jasennaTapahtumat(icsTeksti, alkuRaja, loppuRaja) {
  const jcal = ICAL.parse(icsTeksti);
  const comp = new ICAL.Component(jcal);
  const tapahtumat = [];

  comp.getAllSubcomponents('vevent').forEach(function(vevent) {
    try {
      const event = new ICAL.Event(vevent);
      const organizerRaaka = vevent.getFirstPropertyValue('organizer');
      const organizer = organizerRaaka ? String(organizerRaaka).replace(/^mailto:/i, '').toLowerCase() : null;

      if (!event.isRecurring()) {
        const pvmAika = pvmJaAika(event.startDate);
        const loppuAika = event.endDate ? pvmJaAika(event.endDate) : { event_time: null, event_date: pvmAika.event_date };
        tapahtumat.push({
          uid: event.uid,
          title: event.summary || '(nimetön)',
          event_date: pvmAika.event_date,
          event_time: pvmAika.event_time,
          event_end_time: loppuAika.event_time,
          // NULL kun kestää vain yhden päivän — koodi (script.js:n
          // tapahtumaKattaaPaivan()) kohtelee NULLia samana kuin event_date.
          event_end_date: loppuAika.event_date !== pvmAika.event_date ? loppuAika.event_date : null,
          organizer: organizer,
        });
        return;
      }

      const iteraattori = event.iterator();
      let esiintyma = iteraattori.next();
      let turvalaskuri = 0;
      while (esiintyma && turvalaskuri < MAX_ESIINTYMAA_SARJASSA) {
        turvalaskuri++;
        if (esiintyma.compare(loppuRaja) > 0) break;
        if (esiintyma.compare(alkuRaja) >= 0) {
          const loppuHetki = esiintyma.clone();
          loppuHetki.addDuration(event.duration);
          const pvmAika = pvmJaAika(esiintyma);
          const loppuAika = pvmJaAika(loppuHetki);
          tapahtumat.push({
            // Sama UID toistuu joka esiintymällä — yhdistetään esiintymän
            // omaan alkuhetkeen uniikin avaimen saamiseksi.
            uid: event.uid + '#' + esiintyma.toString(),
            title: event.summary || '(nimetön)',
            event_date: pvmAika.event_date,
            event_time: pvmAika.event_time,
            event_end_time: loppuAika.event_time,
            event_end_date: loppuAika.event_date !== pvmAika.event_date ? loppuAika.event_date : null,
            organizer: organizer,
          });
        }
        esiintyma = iteraattori.next();
      }
    } catch (e) {
      console.error('Yhden VEVENTin käsittely epäonnistui:', e.message);
    }
  });

  return tapahtumat;
}

// accountKey ('katri'/'juha') valitsee minkä tilin ympäristömuuttujilla
// kirjaudutaan — validoidaan tässä (per syöte, ei koko funktion alussa)
// jotta yhden tilin puuttuvat tunnukset näkyvät VAIN sen syötteen omana
// virheenä (Promise.allSettled) eivätkä kaada koko synkkausta.
async function haeIcloudSyote(kalenterinNimi, alkuISO, loppuISO, accountKey) {
  const tili = TILIT[accountKey];
  if (!tili || !tili.username || !tili.password) {
    throw new Error('Tilin "' + accountKey + '" iCloud-tunnukset (ICLOUD_USERNAME' + (accountKey === 'juha' ? '_JUHA' : '') + '/ICLOUD_APP_PASSWORD' + (accountKey === 'juha' ? '_JUHA' : '') + ') puuttuvat Vercelin ympäristömuuttujista');
  }
  const client = new DAVClient({
    serverUrl: 'https://caldav.icloud.com',
    credentials: { username: tili.username, password: tili.password },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });
  await client.login();

  const kalenterit = await client.fetchCalendars();
  const kalenteri = kalenterit.find(function(k) { return k.displayName === kalenterinNimi; });
  if (!kalenteri) {
    throw new Error('Kalenteria "' + kalenterinNimi + '" ei löytynyt iCloud-tililtä');
  }

  const objektit = await client.fetchCalendarObjects({
    calendar: kalenteri,
    timeRange: { start: alkuISO, end: loppuISO },
  });

  return objektit.map(function(o) { return o.data; });
}

async function haeIcsUrlSyote(url) {
  const vastaus = await fetch(url);
  if (!vastaus.ok) {
    throw new Error('ICS-osoitteen haku epäonnistui: HTTP ' + vastaus.status);
  }
  return [await vastaus.text()];
}

// Riisuu vain_varattu-tilan tapahtuman kaikesta paitsi ajasta jo tässä
// vaiheessa — nimi/paikka/osallistujat eivät koskaan päädy tämän jälkeen
// mihinkään muuttujaan eivätkä tietokantaan.
function varattuTapahtumaksi(t) {
  let aikateksti;
  if (!t.event_time) {
    aikateksti = '(koko päivä)';
  } else {
    aikateksti = t.event_time.slice(0, 5) + (t.event_end_time ? '–' + t.event_end_time.slice(0, 5) : '');
  }
  return {
    title: '🔒 Varattu ' + aikateksti,
    event_date: t.event_date,
    event_time: t.event_time,
    event_end_time: t.event_end_time,
    event_end_date: t.event_end_date,
    ical_uid: t.uid,
  };
}

module.exports = async function handler(req, res) {
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }
  // Tilikohtaiset ICLOUD_*-muuttujat validoidaan per syöte haeIcloudSyote():ssa,
  // EI tässä — jos vain toisen tilin tunnukset puuttuvat, toisen tilin
  // syötteet silti synkkautuvat normaalisti (Promise.allSettled alla).

  const syotteetVastaus = await supabaseFetch('kalenteri_syotteet?select=*&enabled=eq.true');
  const syotteet = await syotteetVastaus.json();

  if (!Array.isArray(syotteet) || syotteet.length === 0) {
    return res.status(200).json({ success: true, viesti: 'Ei aktiivisia kalenteri_syotteet-rivejä.', syotteita: 0 });
  }

  const alku = new Date();
  const loppu = new Date();
  loppu.setDate(loppu.getDate() + PAIVIA_ETEENPAIN);
  const alkuISO = alku.toISOString();
  const loppuISO = loppu.toISOString();
  const alkuRaja = ICAL.Time.fromJSDate(alku, true);
  const loppuRaja = ICAL.Time.fromJSDate(loppu, true);

  // Sama UID-pohjainen tunnetut-joukko toimii myös monen tilin duplikaattisuojana:
  // jaettu perhekalenteri voi näkyä sekä Katrin että Juhan tilillä, mutta koska
  // molemmat syötteet tuottavat saman tapahtuman UID:n, se tallentuu vain kerran
  // — ical_uid-sarakkeen UNIQUE-rajoite + "ignore-duplicates" varmistaa tämän
  // tietokantatasolla vaikka kaksi syötettä käsiteltäisiin samanaikaisesti.
  const tunnetutVastaus = await Promise.all([
    supabaseFetch('kalenteri_tapahtumat?select=ical_uid&ical_uid=not.is.null').then(function(r) { return r.json(); }),
    supabaseFetch('kalenteri_odottavat?select=ical_uid').then(function(r) { return r.json(); }),
  ]);
  const tunnetut = new Set();
  tunnetutVastaus.forEach(function(rivit) { (rivit || []).forEach(function(r) { tunnetut.add(r.ical_uid); }); });

  const uudetHyvaksytyt = [];
  const uudetOdottavat = [];
  const tulokset = [];

  const kaikki = await Promise.allSettled(syotteet.map(async function(syote) {
    let icsTekstit;
    if (syote.tyyppi === 'icloud') {
      icsTekstit = await haeIcloudSyote(syote.tunniste, alkuISO, loppuISO, syote.account_key || 'katri');
    } else if (syote.tyyppi === 'ics_url') {
      icsTekstit = await haeIcsUrlSyote(syote.tunniste);
    } else {
      throw new Error('Tuntematon syotteen tyyppi: ' + syote.tyyppi);
    }

    let tapahtumat = [];
    icsTekstit.forEach(function(teksti) {
      tapahtumat = tapahtumat.concat(jasennaTapahtumat(teksti, alkuRaja, loppuRaja));
    });

    let uusia = 0;
    tapahtumat.forEach(function(t) {
      if (tunnetut.has(t.uid)) return;
      tunnetut.add(t.uid); // sama syöte voi muuten palauttaa saman esiintymän kahdesti
      uusia++;

      if (syote.mode === 'vain_varattu') {
        const varattu = varattuTapahtumaksi(t);
        varattu.syote_id = syote.id;
        uudetHyvaksytyt.push(varattu);
      } else {
        uudetOdottavat.push({
          ical_uid: t.uid,
          syote_id: syote.id,
          title: t.title,
          event_date: t.event_date,
          event_time: t.event_time,
          event_end_time: t.event_end_time,
          event_end_date: t.event_end_date,
          status: 'odottaa',
        });
      }
    });

    await supabaseFetch('kalenteri_syotteet?id=eq.' + syote.id, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_synced_at: new Date().toISOString() }),
    });

    return { syote: syote.name, loydettyja: tapahtumat.length, uusia: uusia };
  }));

  kaikki.forEach(function(tulos, i) {
    if (tulos.status === 'fulfilled') {
      tulokset.push(tulos.value);
    } else {
      console.error('Syötteen "' + syotteet[i].name + '" synkkaus epäonnistui:', tulos.reason && tulos.reason.message);
      tulokset.push({ syote: syotteet[i].name, virhe: tulos.reason ? tulos.reason.message : 'tuntematon virhe' });
    }
  });

  // on_conflict + ignore-duplicates: jos synkka juoksee päällekkäin (esim.
  // kalenteri avataan kahdesti nopeasti), sama ical_uid ei kaadu koko
  // lisäykseen vaan hypätään yli hiljaisesti.
  if (uudetHyvaksytyt.length) {
    await supabaseFetch('kalenteri_tapahtumat?on_conflict=ical_uid', {
      method: 'POST',
      headers: { Prefer: 'return=minimal,resolution=ignore-duplicates' },
      body: JSON.stringify(uudetHyvaksytyt),
    });
  }
  if (uudetOdottavat.length) {
    await supabaseFetch('kalenteri_odottavat?on_conflict=ical_uid', {
      method: 'POST',
      headers: { Prefer: 'return=minimal,resolution=ignore-duplicates' },
      body: JSON.stringify(uudetOdottavat),
    });
  }

  return res.status(200).json({
    success: true,
    syotteet: tulokset,
    suoraanLapi: uudetHyvaksytyt.length,
    odottamaan: uudetOdottavat.length,
  });
};
