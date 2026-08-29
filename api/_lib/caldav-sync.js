// Geneerinen kalenterisyöte-synkka: käy läpi kaikki kalenteri_syotteet-taulun
// enabled=true-rivit ja tuo niiden tapahtumat Satamaan. YKSI yhteinen
// koneisto KOLMELLE syötetyypille (icloud/ics_url/ics, ks. haeSyoteTekstit())
// ja kahdelle tilalle (taysi/vain_varattu) — uusi kalenteri lisätään Table
// Editorista, ei tähän tiedostoon koodaamalla. Ks. sql/014_kalenteri_syotteet.sql
// yläkommentti ja muistiinpanot.md "Kalenterisyötteet"-, "Kalenterin
// periaate: yksi totuus, kaksi ikkunaa"- ja "Hytti v1 + opiskelulaajennus +
// ICS-syötekoneisto" -osiot täydelle selitykselle.
//
// scope-sarake (kalenteri_syotteet, sql/027) ratkaisee näkyykö syötteen data
// perheen yhteisessä agendassa ('perhe', oletus) vai vain yhden henkilön
// Hytissä ('hytti') — tämä TIEDOSTO ei tarvitse tietää eroa ollenkaan, koska
// scope vain OHJAA CLIENT-PUOLEN kyselyitä (script.js) sekä RLS:ää
// (kalenteri_tapahtumat_select-policy, sql/027) — synkka kirjoittaa
// kaikki syötteet samalla tavalla riippumatta niiden scopesta.
//
// ARKKITEHTUURI 2026-07-08 illasta: "yksi totuus, kaksi ikkunaa". Kaikki
// synkatut tapahtumat kirjoitetaan SUORAAN kalenteri_tapahtumat-tauluun —
// EI enää erillistä hyväksyntäjonoa (kalenteri_odottavat, käytöstä poistunut,
// jätetty tauluna paikoillaan mutta ei enää kirjoiteta). Toisen käyttäjän
// lisäämät saavat "uusi"-merkinnän UI:ssa (kalenteri_kuittaukset-taulu,
// script.js) kunnes KUITATAAN — kuittaus on "nähty", ei portti, EI koskaan
// poista tapahtumaa. mode='taysi'/'vain_varattu' vaikuttaa VAIN siihen
// riisutaanko tapahtuman tiedot (ks. varattuTapahtumaksi()), ei enää siihen
// näkyykö tapahtuma ollenkaan.
//
// PEILISÄÄNTÖ: yksisuuntainen pull (iCloud/ics-url -> Satama), EI kirjoiteta
// mitään takaisin iCloudiin — MUTTA muutokset/poistot iCloudin päässä PITÄÄ
// peilautua Satamaan, muuten "kaksi ikkunaa" eriävät ajan myötä:
//   - MUUTOS: kirjoitus kalenteri_tapahtumat-tauluun käyttää
//     `resolution=merge-duplicates` (ei enää `ignore-duplicates`) — sama
//     ical_uid PÄIVITTÄÄ olemassa olevan rivin, ei vain ohita sitä.
//   - POISTO: joka synkkauskerta laskee per syöte MITKÄ ical_uid:t löytyivät
//     TÄLLÄ kertaa haetulta aikaväliltä, ja poistaa kalenteri_tapahtumat-
//     riveistä (samalta syötteeltä, samalta aikaväliltä) ne joita EI löytynyt
//     — ks. siivoaPoistetut(). Rajattu tarkistetun aikavälin sisään, jottei
//     poisteta rivejä joita ei tällä kertaa edes yritetty hakea.
//
// Kutsutaan sovelluksesta aina kun Kalenteri-näkymä avataan
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
//   ITSLEARNING_ICS_KATRI       (tyyppi='ics'-syötteen ENV-nimi, Katrin
//                                Itslearning-kalenterin .ics-linkki tokenin
//                                kanssa — ks. sql/028_hytti_ics_syotteet_data.sql)
//   LUKKARIKONE_ICS_KATRI       (sama periaate, Lukkarikone-lukujärjestys,
//                                http://-alkuinen, hyväksytty tälle tyypille)
//
// Useampi tili tarvitaan koska osa perheen tapahtumista elää Juhan
// henkilökohtaisissa kalentereissa, joita Katrin tunnukset eivät näe.
// kalenteri_syotteet.account_key ('katri'/'juha', ks. sql/017_kalenteri_tilit.sql)
// kertoo per syöte kumman tilin tunnuksilla se haetaan — itse salasanat
// pysyvät AINA ympäristömuuttujissa, tauluun tulee vain viittausavain.
// tyyppi='ics'-syötteillä account_key on muodollinen täyte (ei CalDAV-
// kirjautumista), tunniste on ITSE ympäristömuuttujan NIMI (ei URL) samasta
// syystä kuin ICLOUD_*-salasanatkin pysyvät ympäristömuuttujissa: nämä
// .ics-linkit sisältävät henkilökohtaisen tokenin URL:ssaan.

const { DAVClient } = require('tsdav');
const ICAL = require('ical.js');

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const TILIT = {
  katri: { username: process.env.ICLOUD_USERNAME, password: process.env.ICLOUD_APP_PASSWORD },
  juha: { username: process.env.ICLOUD_USERNAME_JUHA, password: process.env.ICLOUD_APP_PASSWORD_JUHA },
};

// Hakuikkuna: kuinka pitkälle taaksepäin/eteenpäin tapahtumia haetaan.
// Säädettävä tästä — EI haudattu syvemmälle koodiin. Aiemmin haku alkoi
// suoraan nyt-hetkestä (ei taaksepäin ollenkaan) ja ulottui vain 30 päivää
// eteenpäin, minkä takia kauempana tulevaisuudessa olevat tapahtumat
// (esim. joulukuun tapahtuma heinäkuussa haettuna) jäivät kokonaan
// löytymättä — korjattu 2026-07-08 illalla laajemmaksi.
const PAIVIA_TAAKSEPAIN = 30;   // ~1 kk
const PAIVIA_ETEENPAIN = 365;   // ~12 kk

// Turvaraja kuinka moneksi yksittäiseksi esiintymäksi yksi toistuva
// tapahtuma puretaan enintään (viallinen/loputon RRULE ei saa jumittaa
// funktiota). Mitoitettu kattamaan PÄIVITTÄINEN toistuva tapahtuma koko
// hakuikkunan ajalta + reilu marginaali — jos tätä pienennetään, päivittäiset
// toistot voivat katketa kesken hakuikkunan.
const MAX_ESIINTYMAA_SARJASSA = PAIVIA_TAAKSEPAIN + PAIVIA_ETEENPAIN + 30;

// Todennus (2026-07-20, ks. muistiinpanot.md "RLS-/yksityisyysauditointi") —
// tällä endpointilla ei ollut aiemmin MINKÄÄNLAISTA todennusta, toisin kuin
// muilla cron-poluilla (api/aly-nightly.js, api/muistutukset-laheta.js,
// molemmat vaativat MUISTUTUKSET_CRON_SECRET-avaimen). Tuotannossa elävä
// vakio-URL, jonka ?listaa=/?esikatsele=-diagnostiikkaparametrit paljastivat
// kummankin perheenjäsenen yksityiset kalenterinimet/tapahtumaotsikot+
// organizerit kenelle tahansa URL:n löytävälle — sama "Hytti ei saa vuotaa
// millään reitillä" -invariantti kuin RLS-auditoinnissa muualla.
//
// Kaksi hyväksyttyä reittiä, koska kutsujia on kahta lajia: (a) GitHub
// Actionsin cron (ei kirjautunutta käyttäjää) — sama jaettu
// MUISTUTUKSET_CRON_SECRET ?avain=-parametrissa, uudelleenkäytetty kuten
// muillakin cron-poluilla, ei vaadi uutta salaisuutta; (b) sovelluksen oma
// selainkoodi (script.js, kirjautunut perheenjäsen) — validi Supabase-
// istunnon access_token Authorization-headerissa, sama malli kuin
// api/aly.js:ssä. Kumpi tahansa perheenjäsen kelpaa, koska molemmat ovat
// yhtä luotettuja tämän sovelluksen sisällä — kyse on vain siitä ettei
// tuntematon ulkopuolinen pääse URL:ään käsiksi.
async function onkoValtuutettu(req) {
  const secret = process.env.MUISTUTUKSET_CRON_SECRET;
  if (secret && (req.query || {}).avain === secret) return true;

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const vastaus = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + token },
  });
  return vastaus.ok;
}

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
//
// BUGIKORJAUS (2026-08-27, Katrin löytämä: Lukkarikoneen 10-12/13-15 näkyi
// Satamassa 13-15/16-18, täsmälleen +3h siirtymä): Lukkarikone (ja moni muu
// suomalainen lukujärjestelmä/LMS) ei koskaan merkitse VEVENTin DTSTARTiin
// aikavyöhykettä ollenkaan ("floating" time, ei Z-loppua eikä TZID-viittausta)
// — luvut OVAT jo Suomen kellonaikaa sellaisenaan (RFC 5545: floating time
// tulkitaan "kalenterin käyttäjän omassa aikavyöhykkeessä", ja tämän sovelluksen
// ainoa käyttäjäkunta on Suomessa). ical.js:n toJSDate() EI tiedä tätä —
// floating-ajalle se olettaa luvut ajoympäristön OMAKSI paikalliseksi ajaksi,
// ja koska Vercel ajaa UTC:ssä, "10:00" tulkittiin "10:00 UTC:ssä" ja
// muunnettiin SITTEN vielä +3h (kesäaika) Helsinkiin — todennettu käsin
// pakottamalla TZ=UTC paikallisesti ennen korjausta, täsmäsi bugiin täydellisesti.
// Kehittäjän omalla koneella (Suomen aikavyöhyke) tämä ei koskaan näkynyt,
// koska floating->UTC->Helsinki-kierros sattui menemään oikein vain silloin.
// Korjaus: floating-ajalle luetaan komponentit SUORAAN kuten isDate-haaralla,
// EI reititetä JS Date/Intl:n kautta ollenkaan. Oikeasti aikavyöhykkeellisille
// (Z-loppuinen UTC tai TZID-viitattu, esim. iCloud/Itslearning) alempi
// Intl-muunnos toimii edelleen muuttumattomana — testattu kaikki kolme
// tapausta erikseen ennen käyttöönottoa.
function pvmJaAika(hetki) {
  if (hetki.isDate) {
    return {
      event_date: hetki.year + '-' + String(hetki.month).padStart(2, '0') + '-' + String(hetki.day).padStart(2, '0'),
      event_time: null,
    };
  }
  if (!hetki.zone || hetki.zone.tzid === 'floating') {
    return {
      event_date: hetki.year + '-' + String(hetki.month).padStart(2, '0') + '-' + String(hetki.day).padStart(2, '0'),
      event_time: String(hetki.hour).padStart(2, '0') + ':' + String(hetki.minute).padStart(2, '0') + ':00',
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

// Riisuu Lukkarikone-tyylisen kurssikoodin otsikon lopusta (2026-08-29,
// Katrin pyyntö: "Introduction to mathematical sciences TE00CQ15-3042" ei
// tarvitse näkyä perhekalenterissa, pelkkä kurssin nimi riittää). Koodin
// muoto vaihtelee syötteessä (esim. "TE00CQ15-3042" TAI pelkkä numero-
// muotoinen "5051115-3031"), joten tunnistetaan rakenteen perusteella: väli,
// sitten 5-10 kirjain/numeromerkkiä, viiva, 3-5 numeroa, rivin loppuun asti.
// Ei kosketa otsikkoa jos loppu ei täsmää tähän tarkkaan kuvioon (esim.
// "Practical Training - update" jää koskemattomaksi, koska viivan jälkeinen
// osa ei ole pelkkiä numeroita).
function siistiOtsikko(otsikko) {
  return otsikko.replace(/\s+[A-Za-z0-9]{5,10}-\d{3,5}$/, '');
}

// Jäsentää yhden .ics-tekstin (joko yksittäinen CalDAV-objekti tai koko
// ics_url-tiedosto, jossa voi olla monta VEVENTiä) ja palauttaa listan
// { uid, title, event_date, event_time, event_end_time, organizer }.
// Toistuvat tapahtumat (RRULE) puretaan itse ICAL.js:n iteraattorilla
// annetulle aikavälille — EI luoteta CalDAV-palvelimen valinnaiseen
// server-side expand -tukeen, koska sitä ei voitu varmistaa ilman oikeaa
// dataa (ics_url-syötteillä ei ole CalDAV-palvelinta ollenkaan, joten tämä
// on ainoa tapa joka toimii molemmilla syötetyypeillä yhtenäisesti).
//
// TOISTUVAN TAPAHTUMAN YKSITTÄINEN KERTA VOI OLLA KORVATTU (siirretty toiseen
// päivään tai peruttu) — iCalendarissa tämä näkyy erillisenä VEVENTinä, jolla
// on SAMA UID mutta oma RECURRENCE-ID. ical.js liittää tällaiset "poikkeukset"
// automaattisesti masterin ICAL.Event-olioon konstruktorissa (koska vevent.parent
// osoittaa koko VCALENDAR-komponenttiin) — MUTTA vain jos niitä käytetään
// event.getOccurrenceDetails(esiintymä):n kautta iteroinnissa. Aiemmin tämä
// koodi käytti iteraattorin palauttamaa RAAKAA (aina alkuperäistä, ei koskaan
// korvattua) aikaa suoraan, jolloin siirretty/peruttu kerta tuotti HAAMU-
// esiintymän vanhaan päivään SEN LISÄKSI että korvaava VEVENT muutenkin
// tuotiin omana tapahtumanaan — sama asia näkyi jonossa kahdesti/kolmesti eri
// päivillä. Korjattu 2026-07-08 illalla: poikkeus-VEVENTejä ei enää käsitellä
// erikseen (`vevent.hasProperty('recurrence-id')` ohitetaan yllä), ja masterin
// iteroinnissa käytetään AINA getOccurrenceDetails():n palauttamaa
// (mahdollisesti korvattua) päivää/aikaa/otsikkoa, ei raakaa iteraattorin arvoa.
function jasennaTapahtumat(icsTeksti, alkuRaja, loppuRaja) {
  const jcal = ICAL.parse(icsTeksti);
  const comp = new ICAL.Component(jcal);
  const tapahtumat = [];

  comp.getAllSubcomponents('vevent').forEach(function(vevent) {
    // Poikkeus-VEVENT (siirretty/muokattu yksittäinen kerta) käsitellään
    // AINA masterin getOccurrenceDetails()-kutsun kautta alla, ei erikseen.
    if (vevent.hasProperty('recurrence-id')) return;

    try {
      const event = new ICAL.Event(vevent);
      const organizerRaaka = vevent.getFirstPropertyValue('organizer');
      const organizer = organizerRaaka ? String(organizerRaaka).replace(/^mailto:/i, '').toLowerCase() : null;

      if (!event.isRecurring()) {
        const pvmAika = pvmJaAika(event.startDate);
        const loppuAika = event.endDate ? pvmJaAika(event.endDate) : { event_time: null, event_date: pvmAika.event_date };
        // STATUS:CANCELLED yhden kerran tapahtumalla (2026-08-29, ks.
        // peruttu-kentän yläkommentti) — EI enää ohiteta, tallennetaan
        // peruttu=true jotta se jää näkyviin harmaana katoamisen sijaan.
        const tila = vevent.getFirstPropertyValue('status');
        tapahtumat.push({
          uid: event.uid,
          title: siistiOtsikko(event.summary || '(nimetön)'),
          event_date: pvmAika.event_date,
          event_time: pvmAika.event_time,
          event_end_time: loppuAika.event_time,
          // NULL kun kestää vain yhden päivän — koodi (script.js:n
          // tapahtumaKattaaPaivan()) kohtelee NULLia samana kuin event_date.
          event_end_date: loppuAika.event_date !== pvmAika.event_date ? loppuAika.event_date : null,
          organizer: organizer,
          // Föli-siirtymäblokkien pohjatyö (2026-08-17, sql/129) — ical.js:n
          // ICAL.Event lukee tämän jo lähteen LOCATION-kentästä valmiiksi,
          // vain tallennus puuttui aiemmin. Vapaamuotoinen teksti, täsmäys
          // Föli-pysäkkeihin tehdään sovelluspuolella.
          location: event.location || null,
          cancelled: !!(tila && String(tila).toUpperCase() === 'CANCELLED'),
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
          // esiintyma on AINA RRULE:n alkuperäinen aika — getOccurrenceDetails
          // palauttaa todellisen (mahdollisesti korvatun) päivän/ajan/otsikon
          // jos tälle nimenomaiselle kerralle on poikkeus, muuten palauttaa
          // saman ajan takaisin muuttumattomana.
          const tiedot = event.getOccurrenceDetails(esiintyma);
          // STATUS:CANCELLED (2026-08-29) — EI enää ohiteta (ks. peruttu-
          // kentän yläkommentti): tallennetaan peruttu=true, jää näkyviin
          // harmaana. tiedot.startDate on tässä tapauksessa alkuperäinen
          // (ei-korvattu) aika, koska peruutuksella ei ole uutta aikaa
          // johon siirtyä.
          const tila = tiedot.item.component.getFirstPropertyValue('status');
          const pvmAika = pvmJaAika(tiedot.startDate);
          const loppuAika = tiedot.endDate ? pvmJaAika(tiedot.endDate) : { event_time: null, event_date: pvmAika.event_date };
          tapahtumat.push({
            // Käytetään AINA alkuperäistä (esiintyma), EI korvattua aikaa,
            // UID:n loppuosana — recurrence-id pysyy vakiona vaikka kerta
            // siirtyisi toiseen päivään, muuten samasta kerrasta syntyisi
            // eri UID jokaisella synkkauksella kun se joskus siirretään.
            uid: event.uid + '#' + esiintyma.toString(),
            title: siistiOtsikko(tiedot.item.summary || '(nimetön)'),
            event_date: pvmAika.event_date,
            event_time: pvmAika.event_time,
            event_end_time: loppuAika.event_time,
            event_end_date: loppuAika.event_date !== pvmAika.event_date ? loppuAika.event_date : null,
            organizer: organizer,
            // Luetaan TÄMÄN esiintymän omasta (mahdollisesti korvatusta)
            // komponentista, ei masterin event.location:ista — yksittäinen
            // kerta on voitu siirtää eri paikkaan (samalla periaatteella
            // kuin tila/otsikko-luku yllä).
            location: tiedot.item.component.getFirstPropertyValue('location') || null,
            cancelled: !!(tila && String(tila).toUpperCase() === 'CANCELLED'),
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
async function kirjauduIcloudiin(accountKey) {
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
  return client;
}

// Diagnostiikka kalenteri_syotteet.tunniste-arvon selvittämiseen: palauttaa
// tililtä löytyvien kalenterien TÄSMÄLLISET näyttönimet, ei synkkaa mitään.
// Kutsutaan handlerista ?listaa=katri / ?listaa=juha -parametrilla.
async function listaaKalenterit(accountKey) {
  const client = await kirjauduIcloudiin(accountKey);
  const kalenterit = await client.fetchCalendars();
  return kalenterit.map(function(k) { return k.displayName; });
}

async function haeIcloudSyote(kalenterinNimi, alkuISO, loppuISO, accountKey) {
  const client = await kirjauduIcloudiin(accountKey);

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

// Hakee syötteen ICS-tekstit sen tyypin mukaan — yksi paikka jota sekä
// ?esikatsele=1-diagnostiikka että varsinainen synkka kutsuvat, ettei
// tyyppikohtainen haaroitus toistu kahdessa paikassa.
//
// 'ics'-tyyppi (Hytti v1 + opiskelulaajennus, 2026-07-11): tunniste on
// YMPÄRISTÖMUUTTUJAN NIMI, EI suora URL — nämä .ics-linkit (esim.
// Itslearning/Lukkarikone) sisältävät henkilökohtaisen tokenin itse
// URL:ssaan, joten niitä ei tallenneta suoraan kalenteri_syotteet-tauluun
// samaan tapaan kuin julkisen ics_url-syötteen linkkiä. Sama fetch-logiikka
// kuin ics_url:lla (haeIcsUrlSyote), vain URL:n lähde eroaa.
async function haeSyoteTekstit(syote, alkuISO, loppuISO) {
  if (syote.tyyppi === 'icloud') {
    return haeIcloudSyote(syote.tunniste, alkuISO, loppuISO, syote.account_key || 'katri');
  }
  if (syote.tyyppi === 'ics_url') {
    return haeIcsUrlSyote(syote.tunniste);
  }
  if (syote.tyyppi === 'ics') {
    const url = process.env[syote.tunniste];
    if (!url) {
      throw new Error('Ymparistomuuttuja ' + syote.tunniste + ' puuttuu (syote ' + syote.name + ')');
    }
    return haeIcsUrlSyote(url);
  }
  throw new Error('Tuntematon syotteen tyyppi: ' + syote.tyyppi);
}

// Hakee kalenteri_tekijat-kartan (organizer_tunniste -> Satama-käyttäjän
// user_id) kerran per synkkauskerta. Jos jonkin tapahtuman organizeria ei
// löydy tästä kartasta, sen user_id jää NULLiksi tietokannassa — silloin
// tapahtuma näkyy "uutena" KAIKILLE käyttäjille (turvallinen oletus).
async function haeTekijaKartta() {
  const vastaus = await supabaseFetch('kalenteri_tekijat?select=*');
  const rivit = await vastaus.json();
  const kartta = {};
  (rivit || []).forEach(function(r) { kartta[r.organizer_tunniste] = r.user_id; });
  return kartta;
}

// Muotoilee täyden ('taysi'-tilan) tapahtuman kalenteri_tapahtumat-riviksi —
// symmetrinen varattuTapahtumaksi()-funktion kanssa alla, ei riisu mitään.
function taydeksiTapahtumaksi(t) {
  return {
    title: t.title,
    event_date: t.event_date,
    event_time: t.event_time,
    event_end_time: t.event_end_time,
    event_end_date: t.event_end_date,
    ical_uid: t.uid,
    // Föli-siirtymäblokkien pohjatyö (sql/129) — VAIN taysi-tilassa, sama
    // periaate kuin nimi/osallistujat: vain_varattu-tilan tapahtuma ei saa
    // vuotaa mitään yksityiskohtaa (ks. varattuTapahtumaksi()-kommentti alla).
    location: t.location,
    // ks. sql/139_kalenteri_peruutus.sql yläkommentti.
    peruttu: !!t.cancelled,
  };
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
    peruttu: !!t.cancelled,
  };
}

// PEILISÄÄNTÖ, poisto/peruutus-osuus (laajennettu 2026-08-29, Katrin pyyntö:
// "leave cancelled lecture greyish and point to where it got moved into" —
// ei koskaan enää katoamaan jäljettömiin): hakee TÄMÄN syötteen olemassa
// olevat, EI VIELÄ peruutetuksi merkityt rivit tarkistetulta aikaväliltä ja
// käsittelee ne joiden ical_uid EI löytynyt tällä synkkauskerralla
// (nahdytUidit) — eli tapahtuma on poistunut/siirtynyt pois lähteen päässä
// (esim. Lukkarikone/iCloud).
//   TULEVAT (event_date >= tänään): merkitään peruttu=true, EI poisteta —
//   jäävät näkyviin harmaana Kalenterissa/Hytissä (ks. script.js), eikä
//   ajossa palauteta enää uudelleen koska kysely ottaa mukaan vain
//   peruttu=false-rivit.
//   MENNEET (jo ohi): poistetaan edelleen suoraan kuten ennen tätä
//   laajennusta — jo tapahtuneella peruutuksella ei ole enää käytännön
//   arvoa, eikä taulun haluta kasvaa loputtomiin koko lukuvuoden ajalta
//   kertyvällä harmaalla historialla.
// Rajattu syote_id:hen ja samaan aikaväliin joka tällä kertaa oikeasti
// haettiin, jottei kosketa rivejä joita ei yritetty hakea. LISÄKSI rajattu
// created_at < syncStartedAt (ks. kutsupaikan kommentti) — suojaa
// rinnakkaisen, limittäisen ajon KESKEN tätä ajoa lisäämää riviä tulemasta
// virheellisesti käsitellyksi. Palauttaa juuri peruutetuiksi merkityt rivit
// (id/title/event_date/event_time) — kutsuja käyttää näitä "mihin siirtyi"
// -arvauksen tekemiseen ja peruutusilmoituksen lähettämiseen.
async function siivoaPoistetut(syoteId, alkuPvm, loppuPvm, nahdytUidit, syncStartedAt, tanaanPvm) {
  const vastaus = await supabaseFetch(
    'kalenteri_tapahtumat?select=id,ical_uid,title,event_date,event_time&syote_id=eq.' + syoteId +
    '&event_date=gte.' + alkuPvm + '&event_date=lte.' + loppuPvm + '&ical_uid=not.is.null' +
    '&peruttu=eq.false' +
    '&created_at=lt.' + encodeURIComponent(syncStartedAt)
  );
  const olemassaOlevat = await vastaus.json();
  const poistuneet = (olemassaOlevat || []).filter(function(r) { return !nahdytUidit.has(r.ical_uid); });
  if (poistuneet.length === 0) return { poistettu: 0, peruttu: [] };

  const tulevat = poistuneet.filter(function(r) { return r.event_date >= tanaanPvm; });
  const menneet = poistuneet.filter(function(r) { return r.event_date < tanaanPvm; });

  let peruttuMerkityt = [];
  if (tulevat.length > 0) {
    const idLista = tulevat.map(function(r) { return r.id; }).join(',');
    const merkintaRes = await supabaseFetch('kalenteri_tapahtumat?id=in.(' + idLista + ')', {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ peruttu: true }),
    });
    if (!merkintaRes.ok) {
      console.error('[caldav-sync] Peruutusmerkintä epäonnistui (syote ' + syoteId + '):', merkintaRes.status, await merkintaRes.text());
    } else {
      peruttuMerkityt = tulevat;
    }
  }

  // BUGIKORJAUS (2026-07-19, ks. muistiinpanot.md "Kirjoituspolkujen
  // auditointi" — sama laji virhe kuin historiallinen upsert-duplikaattibugi
  // tässä samassa tiedostossa): palautettu määrä EI SAA väittää poistoa
  // tehdyksi jos DELETE-pyyntö itsessään epäonnistui.
  let poistettuMaara = 0;
  if (menneet.length > 0) {
    const idLista = menneet.map(function(r) { return r.id; }).join(',');
    const poistoRes = await supabaseFetch('kalenteri_tapahtumat?id=in.(' + idLista + ')', {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
    if (!poistoRes.ok) {
      console.error('[caldav-sync] Menneiden poistuneiden tapahtumien siivous epäonnistui (syote ' + syoteId + '):', poistoRes.status, await poistoRes.text());
    } else {
      poistettuMaara = menneet.length;
    }
  }

  return { poistettu: poistettuMaara, peruttu: peruttuMerkityt };
}

// Muotoilee peruutusilmoituksen tekstin — jaettu sekä syote_id:llisen
// (kasitteleUudetPeruutukset) että mahdollisten myöhempien kutsujien kesken.
function muotoilePvm(pvmStr) {
  const d = new Date(pvmStr + 'T00:00:00Z');
  return String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0') + '.';
}
function paivaaSiirretty(pvmStr, n) {
  const d = new Date(pvmStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Uuden peruutuksen käsittely (2026-08-29, Katrin pyyntö) — kaksi asiaa:
// (1) PARAS ARVAUS mihin tunti siirtyi: sama syote, ei (vielä) peruttu, SAMA
//     siivottu otsikko (siistiOtsikko ajettu jo tallennushetkellä, joten
//     suora tasa-täsmäys riittää), enintään 5 päivän päässä alkuperäisestä
//     kumpaankin suuntaan. EI VARMAA tietoa — vain heuristiikka, siksi UI:n
//     (script.js) pitää merkitä se "arvio"/"todennäköisesti" eikä väittää
//     varmaa faktaa.
// (2) VÄLITÖN ilmoitus MYÖS silloin kun kukaan ei ole sillä hetkellä avannut
//     sovellusta: kirjoitetaan muistutukset-riviksi remind_at=nyt, jonka jo
//     olemassa oleva /api/cron?task=muistutukset (SAMA 5 min -GitHub Actions
//     -kadenssi, ks. .github/workflows/) poimii ja lähettää seuraavalla
//     ajollaan — EI rakenneta rinnakkaista push-lähetystä tähän tiedostoon,
//     käytetään jo olemassa olevaa, todistettua claim/retry-putkea.
//     Idempotentti luonnostaan: tämä ajetaan vain juuri nyt peruttu=true:ksi
//     merkityille riveille, eikä sama rivi voi enää löytyä uudelleen
//     seuraavalla kierroksella (ei ole enää peruttu=false-joukossa).
// henkiloKartta: { 'katri': user_id, 'juha': user_id, ... } (hytti_omistajat).
// kohdeHenkilot: syotteen henkilo-kenttä JOS asetettu (henkilökohtainen
// syöte, esim. Lukkarikone) — MUUTEN null, jolloin ilmoitus menee KAIKILLE
// (jaettu perhekalenteri, kuka tahansa voi olla se joka olisi mennyt paikalle).
async function kasitteleUudetPeruutukset(peruutukset, syoteId, henkiloKartta, kohdeHenkilo) {
  const kohdeUserIdt = kohdeHenkilo
    ? (henkiloKartta[kohdeHenkilo] ? [henkiloKartta[kohdeHenkilo]] : [])
    : Object.keys(henkiloKartta).map(function(h) { return henkiloKartta[h]; });

  for (const p of peruutukset) {
    let siirtynyt = null;
    try {
      const alku = paivaaSiirretty(p.event_date, -5);
      const loppu = paivaaSiirretty(p.event_date, 5);
      const ehdokasRes = await supabaseFetch(
        'kalenteri_tapahtumat?select=id,event_date,event_time&syote_id=eq.' + syoteId +
        '&peruttu=eq.false&title=eq.' + encodeURIComponent(p.title) +
        '&event_date=gte.' + alku + '&event_date=lte.' + loppu +
        '&order=event_date.asc&limit=1'
      );
      const ehdokkaat = ehdokasRes.ok ? await ehdokasRes.json() : [];
      siirtynyt = Array.isArray(ehdokkaat) && ehdokkaat[0] ? ehdokkaat[0] : null;
      if (siirtynyt) {
        const paivitysRes = await supabaseFetch('kalenteri_tapahtumat?id=eq.' + p.id, {
          method: 'PATCH', headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ siirtyi_tapahtuma_id: siirtynyt.id }),
        });
        if (!paivitysRes.ok) console.error('[caldav-sync] siirtyi_tapahtuma_id-merkintä epäonnistui (tapahtuma ' + p.id + '):', paivitysRes.status);
      }
    } catch (e) {
      console.error('[caldav-sync] Siirtokohteen haku epäonnistui (tapahtuma ' + p.id + '):', e.message);
    }

    if (kohdeUserIdt.length === 0) continue; // ei tiedetä kenelle ilmoittaa — peruttu=true jäi silti näkyviin kalenteriin

    const aikaTeksti = p.event_time ? ' klo ' + p.event_time.slice(0, 5) : '';
    const siirtoTeksti = siirtynyt
      ? (' — siirtynyt (arvio) ' + muotoilePvm(siirtynyt.event_date) + (siirtynyt.event_time ? ' klo ' + siirtynyt.event_time.slice(0, 5) : ''))
      : '';
    const sisalto = '🚫 Peruttu: ' + p.title + ' (' + muotoilePvm(p.event_date) + aikaTeksti + ')' + siirtoTeksti;

    for (const userId of kohdeUserIdt) {
      const muistutusRes = await supabaseFetch('muistutukset', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          user_id: userId,
          source: 'kalenteri_peruutus',
          source_ref: String(p.id) + ':' + userId,
          content: sisalto,
          remind_at: new Date().toISOString(),
        }),
      });
      if (!muistutusRes.ok) {
        console.error('[caldav-sync] Peruutusilmoituksen luonti epäonnistui (tapahtuma ' + p.id + ', user ' + userId + '):', muistutusRes.status, await muistutusRes.text());
      }
    }
  }
}

async function haeHenkiloKartta() {
  const vastaus = await supabaseFetch('hytti_omistajat?select=henkilo,user_id');
  const rivit = await vastaus.json();
  const kartta = {};
  (rivit || []).forEach(function(r) { kartta[r.henkilo] = r.user_id; });
  return kartta;
}

module.exports = async function handler(req, res) {
  if (!(await onkoValtuutettu(req))) {
    return res.status(401).json({ error: 'Ei valtuutettu' });
  }

  // Diagnostiikka: /api/caldav-sync?listaa=katri (tai ?listaa=juha) palauttaa
  // sen tilin kalentereiden TÄSMÄLLISET näyttönimet, ei synkkaa mitään. Näin
  // saa selville mikä arvo kalenteri_syotteet.tunniste-sarakkeeseen pitää
  // kirjoittaa icloud-tyyppisille syötteille (pitää täsmätä kirjain kirjaimelta).
  if (req.query && req.query.listaa) {
    try {
      const nimet = await listaaKalenterit(req.query.listaa);
      return res.status(200).json({ tili: req.query.listaa, kalenterit: nimet });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }

  // Diagnostiikka: /api/caldav-sync?esikatsele=1 hakee+jäsentää kaikki
  // syötteet ja palauttaa tulokset (title, event_date, organizer, uid) JSON:ina
  // KIRJOITTAMATTA MITÄÄN tietokantaan. Tehty nimenomaan sen selvittämiseksi
  // löytyykö ORGANIZER-kenttä oikeista jaetuista iCloud-kalentereista — jos
  // "organizer" on aina null tuloksessa, kalenteri_tekijat-kartta ei koskaan
  // tunnista tekijää ja kaikki tapahtumat näkyvät "uutena" kaikille (turvallinen
  // varasuunnitelma, ks. muistiinpanot.md "Tekijän tunnistus").
  if (req.query && req.query.esikatsele) {
    try {
      const syotteetVastaus = await supabaseFetch('kalenteri_syotteet?select=*&enabled=eq.true');
      const syotteet = await syotteetVastaus.json();
      const alku = new Date();
      alku.setDate(alku.getDate() - PAIVIA_TAAKSEPAIN);
      const loppu = new Date();
      loppu.setDate(loppu.getDate() + PAIVIA_ETEENPAIN);
      const alkuRaja = ICAL.Time.fromJSDate(alku, true);
      const loppuRaja = ICAL.Time.fromJSDate(loppu, true);

      const tulokset = await Promise.all((syotteet || []).map(async function(syote) {
        const icsTekstit = await haeSyoteTekstit(syote, alku.toISOString(), loppu.toISOString());
        let tapahtumat = [];
        icsTekstit.forEach(function(teksti) { tapahtumat = tapahtumat.concat(jasennaTapahtumat(teksti, alkuRaja, loppuRaja)); });
        return {
          syote: syote.name,
          tapahtumat: tapahtumat.map(function(t) { return { title: t.title, event_date: t.event_date, organizer: t.organizer, uid: t.uid }; }),
        };
      }));
      return res.status(200).json({ esikatselu: true, syotteet: tulokset });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Tilikohtaiset ICLOUD_*-muuttujat validoidaan per syöte haeIcloudSyote():ssa,
  // EI tässä — jos vain toisen tilin tunnukset puuttuvat, toisen tilin
  // syötteet silti synkkautuvat normaalisti (Promise.allSettled alla).

  // BUGIKORJAUS (2026-07-21, "Toisto-/idempotenssiauditointi", ks.
  // muistiinpanot.md): cron-job.org ja GitHub Actions voivat pingata tätä
  // endpointia limittäin — jos rinnakkainen ajo B ehtii kirjoittaa (upsertata)
  // uuden tapahtuman KESKEN tämän ajon (A), ja A:n oma nahdytUidit-joukko on
  // peräisin sitä VANHEMMASTA ICS-hausta, siivoaPoistetut() näkisi B:n juuri
  // lisäämän rivin elävässä kannassa, ei löytäisi sen ical_uid:ia A:n
  // (vanhentuneesta) joukosta, ja POISTAISI sen — vaikka B juuri lisäsi sen
  // oikein. Talteen otettu ajon oma alkuhetki rajaa siivouksen koskemaan vain
  // rivejä jotka olivat jo olemassa ENNEN tätä ajoa (ks. syncStartedAt alla).
  const syncStartedAt = new Date().toISOString();

  const syotteetVastaus = await supabaseFetch('kalenteri_syotteet?select=*&enabled=eq.true');
  const syotteet = await syotteetVastaus.json();

  if (!Array.isArray(syotteet) || syotteet.length === 0) {
    return res.status(200).json({ success: true, viesti: 'Ei aktiivisia kalenteri_syotteet-rivejä.', syotteita: 0 });
  }

  const alku = new Date();
  alku.setDate(alku.getDate() - PAIVIA_TAAKSEPAIN);
  const loppu = new Date();
  loppu.setDate(loppu.getDate() + PAIVIA_ETEENPAIN);
  const alkuISO = alku.toISOString();
  const loppuISO = loppu.toISOString();
  // Päivämäärä-merkkijono siivouksen aikavälirajaukseen — muutaman tunnin
  // epätarkkuus puskurin reunalla ei haittaa (ks. MONIPAIVAINEN_PUSKURI_PV-
  // tyylinen reilu mitoitus), tarkka päivä ratkeaa aina jasennaTapahtumat():ssa.
  const alkuPvm = alkuISO.slice(0, 10);
  const loppuPvm = loppuISO.slice(0, 10);
  // Sama kevyt tarkkuus kuin alkuPvm/loppuPvm:llä yllä (muutaman tunnin
  // epätarkkuus vuorokauden rajalla ei haittaa) — ratkaisee vain merkitäänkö
  // löytymätön tapahtuma peruttu=true (tuleva) vai poistetaanko se suoraan
  // (mennyt), ks. siivoaPoistetut().
  const tanaanPvm = new Date().toISOString().slice(0, 10);
  const alkuRaja = ICAL.Time.fromJSDate(alku, true);
  const loppuRaja = ICAL.Time.fromJSDate(loppu, true);

  const tekijaKartta = await haeTekijaKartta();
  const tulokset = [];
  const kaikkiUudetRivit = [];
  // { syoteId, henkilo, rivit: [...] } per syöte — käsitellään "mihin
  // siirtyi" -arvaus + ilmoitus vasta KAIKKIEN syötteiden upsertin JÄLKEEN
  // (kasitteleUudetPeruutukset), koska siirtokohde-ehdokas voi olla juuri
  // TÄSSÄ samassa ajossa lisätty rivi jonkin toisen syötteen alta.
  const kaikkiPeruutuserat = [];

  const kaikki = await Promise.allSettled(syotteet.map(async function(syote) {
    const icsTekstit = await haeSyoteTekstit(syote, alkuISO, loppuISO);

    let tapahtumat = [];
    icsTekstit.forEach(function(teksti) {
      tapahtumat = tapahtumat.concat(jasennaTapahtumat(teksti, alkuRaja, loppuRaja));
    });

    // "yksi totuus, kaksi ikkunaa": KAIKKI tämän syötteen tapahtumat kirjoitetaan
    // suoraan kalenteri_tapahtumat-tauluun (ei enää hyväksyntäjonoa). mode
    // vaikuttaa VAIN riisutaanko tiedot (vain_varattu) vai ei (taysi).
    // user_id tulee kalenteri_tekijat-kartasta organizerin perusteella — NULL
    // jos organizeria ei löydy kartasta, jolloin tapahtuma näkyy "uutena"
    // kaikille käyttäjille script.js:n kuittausjono-logiikassa.
    const nahdytUidit = new Set();
    const uudetRivit = tapahtumat.map(function(t) {
      nahdytUidit.add(t.uid);
      const rivi = syote.mode === 'vain_varattu' ? varattuTapahtumaksi(t) : taydeksiTapahtumaksi(t);
      rivi.syote_id = syote.id;
      rivi.user_id = t.organizer && tekijaKartta[t.organizer] ? tekijaKartta[t.organizer] : null;
      return rivi;
    });
    kaikkiUudetRivit.push.apply(kaikkiUudetRivit, uudetRivit);

    // PEILISÄÄNTÖ, poisto/peruutus-osuus: tällä kertaa löytymättömät
    // (poistettu/siirtynyt pois lähteen päässä) joko merkitään peruttu=true
    // (tuleva) tai poistetaan (mennyt) — ks. siivoaPoistetut() yläkommentti.
    const poistoTulos = await siivoaPoistetut(syote.id, alkuPvm, loppuPvm, nahdytUidit, syncStartedAt, tanaanPvm);
    if (poistoTulos.peruttu.length > 0) {
      kaikkiPeruutuserat.push({ syoteId: syote.id, henkilo: syote.henkilo, rivit: poistoTulos.peruttu });
    }

    const aikaleimaRes = await supabaseFetch('kalenteri_syotteet?id=eq.' + syote.id, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_synced_at: new Date().toISOString() }),
    });
    if (!aikaleimaRes.ok) {
      console.error('[caldav-sync] last_synced_at-päivitys epäonnistui syötteelle ' + syote.name + ':', aikaleimaRes.status, await aikaleimaRes.text());
    }

    return { syote: syote.name, loydettyja: tapahtumat.length, poistettuja: poistoTulos.poistettu, peruttu_uutena: poistoTulos.peruttu.length };
  }));

  kaikki.forEach(function(tulos, i) {
    if (tulos.status === 'fulfilled') {
      tulokset.push(tulos.value);
    } else {
      console.error('Syötteen "' + syotteet[i].name + '" synkkaus epäonnistui:', tulos.reason && tulos.reason.message);
      tulokset.push({ syote: syotteet[i].name, virhe: tulos.reason ? tulos.reason.message : 'tuntematon virhe' });
    }
  });

  // BUGIKORJAUS (2026-07-17, "Uudet iCal-tapahtumat eivät päädy kantaan" —
  // ks. muistiinpanot.md): kaksi eri syotetta voivat kuvata SAMAA fyysistä
  // iCloud-tapahtumaa (esim. jaettu perhekalenteri haettu SEKÄ Katrin että
  // Juhan tilin kautta, ks. "Yhteinen kalenteri (Juhan tili)" ja
  // "Perhekalenteri" — todistetusti samat ical_uid:t) — tällöin
  // kaikkiUudetRivit sisälsi KAKSI riviä samalla ical_uid:lla SAMASSA
  // POST-pyynnössä. Postgresin "ON CONFLICT DO UPDATE" ei salli saman rivin
  // päivittämistä kahdesti YHDEN lauseen sisällä ("ON CONFLICT DO UPDATE
  // command cannot affect row a second time") — koko 327 rivin bulk-upsert
  // KAATUI kokonaisuudessaan tästä, EIKÄ KUKAAN HUOMANNUT koska paluuarvoa
  // ei koskaan tarkistettu: käyttäjälle raportoitiin silti success:true ja
  // kirjoitettuja=327, vaikka TIETOKANTAAN ei kirjoittunut YHTÄÄN uutta riviä.
  // Näin uudet tapahtumat (esim. 17.–18.7.) katosivat näkymättömiin vaikka
  // syötteet sisälsivät ne oikein — vanhat rivit näkyivät koska ne oli
  // kirjoitettu ONNISTUNEESTI ENNEN kuin kaksoiskappale-UID alkoi esiintyä.
  //
  // Korjattu kahdella riippumattomalla tavalla (defense in depth):
  // 1) Rivit YHDISTETÄÄN ical_uid:n mukaan ennen lähetystä — sama fyysinen
  //    tapahtuma kirjoitetaan vain KERRAN vaikka useampi syöte sen tuottaisi.
  // 2) POST:in vastaus TARKISTETAAN — epäonnistunut kirjoitus näkyy nyt
  //    virheenä paluuarvossa eikä koskaan enää valeonnistumisena ("Vahvistus
  //    seuraa todellisuutta" -periaate, ks. muistiinpanot.md).
  const rivitIcalUidin = new Map();
  kaikkiUudetRivit.forEach(function(rivi) {
    if (!rivi.ical_uid) return;
    const olemassa = rivitIcalUidin.get(rivi.ical_uid);
    // Suositaan riviä jolla on tunnistettu tekijä (user_id), koska se on
    // informatiivisempi kuittausjonon/ristiriitamerkin kannalta — muuten
    // järjestyksellä ei ole väliä, sama fyysinen tapahtuma joka tapauksessa.
    if (!olemassa || (!olemassa.user_id && rivi.user_id)) {
      rivitIcalUidin.set(rivi.ical_uid, rivi);
    }
  });
  const yhdistetytRivit = Array.from(rivitIcalUidin.values());
  const kaksoiskappaleitaPoistettu = kaikkiUudetRivit.length - yhdistetytRivit.length;

  // PEILISÄÄNTÖ, muutos-osuus: merge-duplicates (EI ignore-duplicates) —
  // sama ical_uid PÄIVITTÄÄ olemassa olevan rivin (esim. iCloudissa siirretty
  // aika tai muokattu otsikko), ei vain ohita sitä hiljaa.
  let kirjoitusVirhe = null;
  if (yhdistetytRivit.length) {
    const kirjoitusVastaus = await supabaseFetch('kalenteri_tapahtumat?on_conflict=ical_uid', {
      method: 'POST',
      headers: { Prefer: 'return=minimal,resolution=merge-duplicates' },
      body: JSON.stringify(yhdistetytRivit),
    });
    if (!kirjoitusVastaus.ok) {
      const virheteksti = await kirjoitusVastaus.text();
      console.error('[caldav-sync] Tapahtumien kirjoitus epäonnistui:', kirjoitusVastaus.status, virheteksti);
      kirjoitusVirhe = 'HTTP ' + kirjoitusVastaus.status + ': ' + virheteksti.slice(0, 500);
    }
  }

  // "Mihin siirtyi" -arvaus + peruutusilmoitukset VASTA nyt, kaikkien
  // syötteiden upsertin jälkeen (ks. kaikkiPeruutuserat-kommentti yllä) —
  // yksi jaettu henkilökartta riittää koko ajolle.
  let peruutuksiaIlmoitettu = 0;
  if (kaikkiPeruutuserat.length > 0) {
    try {
      const henkiloKartta = await haeHenkiloKartta();
      for (const era of kaikkiPeruutuserat) {
        await kasitteleUudetPeruutukset(era.rivit, era.syoteId, henkiloKartta, era.henkilo);
        peruutuksiaIlmoitettu += era.rivit.length;
      }
    } catch (e) {
      console.error('[caldav-sync] Peruutusten jälkikäsittely epäonnistui:', e.message);
    }
  }

  return res.status(kirjoitusVirhe ? 500 : 200).json({
    success: !kirjoitusVirhe,
    syotteet: tulokset,
    kirjoitettuja: kirjoitusVirhe ? 0 : yhdistetytRivit.length,
    kaksoiskappaleita_poistettu: kaksoiskappaleitaPoistettu,
    kirjoitusvirhe: kirjoitusVirhe,
    peruutuksia_uutena: peruutuksiaIlmoitettu,
  });
};
