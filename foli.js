// === FÖLI (2026-08-17, SATAMA_SPEKSI.md §8.1) ===
// data.foli.fi on julkinen, ei rekisteröitymistä vaativa, ja lähettää
// Access-Control-Allow-Origin: * — KAIKKI tämä toimii suoraan selaimesta,
// EI tarvita uutta Vercel-funktiota (varmistettu suoraan kokeilemalla
// 17.8.2026, ei oletettu). Riittää "järkevin pysäkki käyttäjän sijaintiin
// perustuen" (spekin oma rajaus) — EI ovelta ovelle -reititystä, EI
// useamman vaihdon yhdistelyä.
//
// Lähde vaadittu lisenssiehdoin (CC BY 4.0): "Lähde: Turun seudun
// joukkoliikenteen liikennöinti- ja aikatauludata, Turun kaupungin
// joukkoliikennetoimisto, data.foli.fi, CC BY 4.0."
//
// SIIRRETTY OMAKSI TIEDOSTOKSEEN (2026-08-30, script.js:n pilkkomisen askel
// 3, ks. muistin project_scriptjs_split_plan) — pelkkä fyysinen siirto, ei
// sisällöllistä muutosta. Kaksi ulkoista kutsupaikkaa script.js:ssä
// (etsiTunnettuFoliMatka, haeFoliSiirtymatTapahtumalle) toimivat globaalin
// scopen kautta riippumatta tiedostojen latausjärjestyksestä, koska
// kumpikin kutsutaan vasta myöhemmin suoritettavien funktioiden sisältä,
// ei heti latautuessa.

// Kotipysäkin oletus kun sijaintilupaa ei ole/saada (Katrin päätös
// 17.8.2026): Marsukatu, PIISPANRISTILLE PÄIN — vahvistettu suoraan SIRI:n
// destinationdisplay-kentistä ("Sorro-Piispanristi-Keskusta"), EI stop_id
// 6010 joka on sama katu vastakkaiseen suuntaan (Naantali). Katrin toinen
// tuttu pysäkki (Oskarinaukio, Kaarinan keskusta) ei ole tässä koodissa
// erikseen — sijaintiin perustuva haku (lahinPysakki) löytää sen luonnostaan
// kun ollaan lähempänä sitä, "95% jompikumpi näistä kahdesta" -tilanteessa.
const FOLI_OLETUSPYSAKKI = '6011';

// Kotiosoite luettavaa tekstiä varten (2026-08-30, Katrin ohje: "if it is so
// difficult to see where i am located then expect it to be our home
// address erkkilänkatu 5, kaarina") — käytetään paluumatkan näyttötekstissä
// SIRI:n oman (usein vaikeasti tulkittavan bussilinjan pääteaseman nimen,
// esim. "Sorro-Piispanristi-Keskusta") sijaan, ei muuta pysäkkilogiikkaa:
// FOLI_OLETUSPYSAKKI (Marsukatu) on jo käytännössä lähin pysäkki tälle
// osoitteelle.
const FOLI_KOTIOSOITE = 'Erkkilänkatu 5, Kaarina';

const FOLI_PYSAKIT_KEY = 'kauppalista_foli_pysakit';
const FOLI_PYSAKIT_MAX_IKA_MS = 24 * 3600000; // 1 vrk — "älä pollaa tiheästi" (§8.1), pysäkit eivät muutu usein

// Koko pysäkkilista (~1600 kpl, nimi+koordinaatit) — välimuistitetaan
// localStorageen 1 vrk:ksi. Käytetään sekä sijaintipohjaiseen lähimmän
// pysäkin hakuun että kalenteritapahtuman location-tekstin täsmäykseen.
async function haeFoliPysakit() {
  try {
    const tallennettu = JSON.parse(localStorage.getItem(FOLI_PYSAKIT_KEY) || 'null');
    if (tallennettu && Date.now() - tallennettu.haettu < FOLI_PYSAKIT_MAX_IKA_MS) {
      return tallennettu.pysakit;
    }
  } catch (e) { /* korruptoitunut välimuisti — haetaan tuoreena alla */ }

  try {
    // KORJATTU 2026-08-18: /gtfs/stops palauttaa nykyään hakemisto-
    // olion ({datasets, latest, go}) eikä enää suoraan pysäkkidataa —
    // tarkistettu suoraan livenä API:sta. Oikea data on go-kentän
    // osoittamassa versioidussa polussa. Koko Föli-ominaisuus oli tämän
    // takia hiljaa rikki siitä asti kun se rakennettiin (17.8.).
    // Nama kolme paluuta EIVAT heittaneet poikkeusta ennen (2026-08-31,
    // Katrin loyto: koko FOLI-putki pysahtyi tahan ilman YHTAAN konsoli-
    // virhetta) - nyt nakyvia jotta ei-2xx-tila/puuttuva go-kentta erottuu
    // verkkovirheesta eika jaa hiljaiseksi.
    const hakemisto = await fetch('https://data.foli.fi/gtfs/stops');
    if (!hakemisto.ok) { console.warn('Föli-pysäkkihakemisto vastasi', hakemisto.status); return null; }
    const meta = await hakemisto.json();

    // Katrin selaimessa 2026-08-31 tama ensimmainen kutsu palautti jo
    // OIKEAN taydellisen pysakkilistan suoraan (ei pientä {datasets,
    // latest, go} -ohjausoliota) - jonkin selaimen/valikerroksen takia,
    // syyta ei selvitetty tarkemmin. Ei enaa oleteta kumpaakaan muotoa:
    // jos go-kenttaa ei ole mutta olio nayttaa jo pysakkidatalta (jokin
    // avain jolla stop_lat), kaytetaan sita suoraan sen sijaan etta
    // heitettaisiin pois oikea data pelkan muotoerheen takia.
    let pysakit;
    if (meta.go) {
      const vastaus = await fetch('https:' + meta.go);
      if (!vastaus.ok) { console.warn('Föli-pysäkkilista vastasi', vastaus.status); return null; }
      pysakit = await vastaus.json();
    } else if (Object.keys(meta).some(function(id) { return meta[id] && typeof meta[id].stop_lat === 'number'; })) {
      pysakit = meta;
    } else {
      console.warn('Föli-pysäkkihakemistolla ei go-kenttää eikä tunnistettavaa pysäkkidataa:', JSON.stringify(meta).slice(0, 300));
      return null;
    }
    try {
      localStorage.setItem(FOLI_PYSAKIT_KEY, JSON.stringify({ haettu: Date.now(), pysakit: pysakit }));
    } catch (e) { /* localStorage täynnä tms — jatketaan silti muistivaraisena */ }
    return pysakit;
  } catch (e) {
    console.error('Föli-pysäkkien haku epäonnistui:', e.message);
    return null;
  }
}

function haversineMetria(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = function(d) { return d * Math.PI / 180; };
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function lahinFoliPysakki(pysakit, lat, lon) {
  let paras = null, parasEtaisyys = Infinity;
  Object.keys(pysakit).forEach(function(id) {
    const p = pysakit[id];
    const d = haversineMetria(lat, lon, p.stop_lat, p.stop_lon);
    if (d < parasEtaisyys) { parasEtaisyys = d; paras = id; }
  });
  return paras;
}

// Kalenteritapahtuman location-tekstin (sql/129, caldav-sync.js) täsmäys
// pysäkin nimeen — pelkkä tekstihaku, EI älyä (kustannuskuri, Katrin oma
// periaate: "äly vain siellä missä se oikeasti tuo lisäarvoa"). Palauttaa
// ensimmäisen osuman, ei parhaan — riittävä koska sama rakennus/alue
// mainitaan yleensä vain kerran pysäkkilistassa.
function etsiFoliPysakkiNimella(pysakit, sijaintiTeksti) {
  if (!sijaintiTeksti || !pysakit) return null;
  const normalisoitu = sijaintiTeksti.toLowerCase();
  let osuma = null;
  Object.keys(pysakit).some(function(id) {
    const nimi = (pysakit[id].stop_name || '').toLowerCase();
    if (nimi && normalisoitu.indexOf(nimi) !== -1) { osuma = id; return true; }
    return false;
  });
  return osuma;
}

// Selaimen sijainti (foreground, kertakysely) — EI taustaseurantaa: iOS
// Safari PWA ei salli luotettavaa taustapaikannusta, eikä sitä pyydetty
// (Katrin oma rajaus 17.8.2026: "at any given moment" tarkoitti käytännössä
// "kun sovellus on auki"). Palauttaa null hiljaa jos lupaa ei ole/saada —
// kutsuja käyttää silloin FOLI_OLETUSPYSAKKIÄ.
function haeSelaimenSijainti() {
  return new Promise(function(resolve) {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      function(pos) { resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
      function() { resolve(null); },
      { timeout: 5000, maximumAge: 300000 }
    );
  });
}

// Lähtöpysäkki juuri nyt: sijaintiluvalla LÄHIN pysäkki KOKO verkosta (ei
// rajattu Katrin kahteen tuttuun — kattaa "joskus ihan muualla" -tilanteen
// luonnostaan), ilman lupaa/dataa FOLI_OLETUSPYSAKKI.
async function haeFoliLahtoPysakki() {
  const pysakit = await haeFoliPysakit();
  if (!pysakit) return FOLI_OLETUSPYSAKKI;
  const sijainti = await haeSelaimenSijainti();
  if (!sijainti) return FOLI_OLETUSPYSAKKI;
  return lahinFoliPysakki(pysakit, sijainti.lat, sijainti.lon) || FOLI_OLETUSPYSAKKI;
}

// === GEOKOODAUS + REITITYS (2026-08-31, ks. muistin project_foli_itinerary_idea)
const FOLI_GEOKOODI_KEY = 'kauppalista_foli_geokoodi';

// Osoitteet eivät liiku — välimuisti EI vanhene (toisin kuin pysäkkilista
// yllä, joka voi teoriassa muuttua).
async function geokoodaaOsoite(osoiteTeksti) {
  let valimuisti = {};
  try { valimuisti = JSON.parse(localStorage.getItem(FOLI_GEOKOODI_KEY) || '{}'); } catch (e) { /* korruptoitunut, jatketaan tyhjällä */ }
  const avain = osoiteTeksti.trim().toLowerCase();
  if (valimuisti[avain]) return valimuisti[avain];

  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    if (!token) return null;
    const vastaus = await fetch('/api/geocode?osoite=' + encodeURIComponent(osoiteTeksti), {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!vastaus.ok) return null;
    const tulos = await vastaus.json();
    const sijainti = { lat: tulos.lat, lon: tulos.lon };
    valimuisti[avain] = sijainti;
    try { localStorage.setItem(FOLI_GEOKOODI_KEY, JSON.stringify(valimuisti)); } catch (e) { /* täynnä tms, jatketaan silti */ }
    return sijainti;
  } catch (e) {
    console.error('Geokoodaus epäonnistui:', e.message);
    return null;
  }
}

// VAIHE 2 (2026-08-31, Katrin pyyntö: "start building what you can without
// key") — oikea kesto Digitransitin kautta (ks. api/geocode.js:n haeReitti).
// Palauttaa null HILJAA jos DIGITRANSIT_KEY ei ole vielä asetettu Verceliin
// (503) TAI mikä tahansa muu virhe — kutsuja näyttää silloin lähimmän
// pysäkin ilman kestoa, ei kaadu. Kun avain joskus lisätään, tämä alkaa
// palauttaa oikean keston ilman uutta pushia — pelkkä ympäristömuuttuja
// aktivoi sen.
//
// Välimuistitettu (2026-08-31, Katrin pyyntö: "how to build it so that it
// uses as little as possible API credits") — sama reitti (esim. koti ->
// Joukahaisenkatu) kysyttäisiin muuten UUDESTAAN joka ikinen kerta kun
// Hytti/kalenteri piirretään, käytännössä joka päivä sama kysely. Koordinaatit
// pyöristetään ~100m tarkkuuteen avaimessa (4 desimaalia) jotta pienet
// GPS/geokoodaus-eroavaisuudet samalle osoitteelle osuvat samaan
// välimuistimerkintään. 24h TTL — sama periaate kuin pysäkkilistan
// välimuistilla (FOLI_PYSAKIT_MAX_IKA_MS): reitin kesto ei muutu tunneittain.
const FOLI_REITTI_KEY = 'kauppalista_foli_reitti';
const FOLI_REITTI_MAX_IKA_MS = 24 * 3600000;

async function haeDigitransitKesto(fromLat, fromLon, toLat, toLon) {
  const avain = fromLat.toFixed(4) + ',' + fromLon.toFixed(4) + '->' + toLat.toFixed(4) + ',' + toLon.toFixed(4);
  let valimuisti = {};
  try { valimuisti = JSON.parse(localStorage.getItem(FOLI_REITTI_KEY) || '{}'); } catch (e) { /* korruptoitunut, jatketaan tyhjällä */ }
  const tallennettu = valimuisti[avain];
  if (tallennettu && Date.now() - tallennettu.haettu < FOLI_REITTI_MAX_IKA_MS) {
    return tallennettu.kesto;
  }

  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    if (!token) return null;
    const url = '/api/geocode?reitti=1&fromLat=' + fromLat + '&fromLon=' + fromLon + '&toLat=' + toLat + '&toLon=' + toLon;
    const vastaus = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (!vastaus.ok) return null; // 503 = ei vielä avainta, muu virhe = ei reittiä juuri nyt — EI välimuistiteta virhettä, yritetään uudelleen ensi kerralla
    const tulos = await vastaus.json();
    if (!tulos.kestoS) return null;
    const linja = (tulos.legit || []).find(function(l) { return l.mode === 'BUS'; });
    const kesto = { kestoMin: Math.round(tulos.kestoS / 60), linja: linja && linja.route ? linja.route.shortName : null };
    valimuisti[avain] = { haettu: Date.now(), kesto: kesto };
    try { localStorage.setItem(FOLI_REITTI_KEY, JSON.stringify(valimuisti)); } catch (e) { /* täynnä tms, jatketaan silti */ }
    return kesto;
  } catch (e) {
    return null;
  }
}

// === TUNNETUT KOHTEET (uudistettu 2026-08-31, korvaa vanhan
// FOLI_TUNNETUT_MATKAT-mallin — Katrin oma löytö ja pyyntö samana päivänä:
// "it's showing 00.00 6A Kaarina before lectures" + "I don't want to build
// this so that these are too hardcoded, but flexibly system should know if
// I'm somewhere else". Vanha malli kysyi raakaa SIRI-pysäkkihakua
// (haeFoliLahdot) joka EI tiennyt suuntaa — pysäkki 6011 palvelee busseja
// MOLEMPIIN suuntiin (Kupittaalle JA Kaarinaan), ja koodi hyväksyi minkä
// tahansa suunnan kunhan ajoitus sopi. Digitransit sen sijaan REITITTÄÄ
// oikeasti pisteestä toiseen (ks. haeDigitransitKesto) — ei voi koskaan
// ehdottaa väärään suuntaan menevää bussia, koska se laskee oikean reitin,
// ei vain lue pysäkin koko lähtötaulua.
//
// "Joukahaisenkatu" on edelleen tunnistettava AVAINSANA, koska Lukkarikoneen
// oma location-kenttä on huonekoodi (esim. "ICT_B1033 - Oppimistila -
// ICT-City"), ei geokoodattava katuosoite — tarvitaan siis kiinteä tunnettu
// osoite tälle. Mutta KESTO/LINJA ei ole enää käsin ylläpidetty (vrt. vanha
// kestoMin: 45, hosumisPuskuriMin: 10) — ne lasketaan nyt AINA tuoreena
// Digitransitista, samalla yleiskäyttöisellä putkella kuin täysin uudetkin
// osoitteet (esim. Kiesikatu 4). Yksi järjestelmä kahden sijaan.
const FOLI_TUNNETUT_KOHTEET = [
  {
    tunnistin: 'joukahaisenkatu', // tapahtuman location-/osoite-tekstin osamerkkijono (pieninä kirjaimina)
    osoite: 'Joukahaisenkatu 3-5, Turku',
    // Katrin täsmennys 18.8.: kalenterin alkuaika (esim. luennon 12:00) EI ole
    // todellinen tarve olla paikalla — koululounas ennen tuntia ei ole omana
    // kalenterimerkintänään. "I need to be at school at 11" — todellinen
    // saapumistarve on 60min ENNEN kalenterin alkuaikaa. Uusille/muille
    // tunnetuille kohteille tämä on 0 (oletus: saavu tasan tapahtuman alkuun).
    saavuEnnenTapahtumaaMin: 60,
  },
];

// Sama nimi kuin ennen (script.js:n opintoPaivanKuorma käyttää tätä
// pelkkänä totuusarvona, "onko tälle jotain FÖLI-käsittelyä ylipäätään" —
// ei riipu palautetun olion muodosta, joten uudistus ei riko sitä kutsua).
// Syötteen oletusosoite (kalenteri_syotteet.osoite) LUETAAN SUORAAN
// liitetystä olioista jos t._osoite ei ole erikseen esikäsitelty (2026-08-31,
// löytö: Reitin viikkokalenterin oma kysely ei koskaan hakenut osoite-
// kenttää eikä siis _osoite-esikäsittelyä ollut edes mahdollista tehdä —
// sama "Joukahaisenkatu ei täsmää huonekoodiin" -bugiluokka kuin 30.8.
// korjattiin Nyt-lokille, nyt eri näkymässä). Keskitetty TÄHÄN yhteen
// paikkaan (EI enää erillistä _osoite-esikäsittelyaskelta jokaisessa
// kutsujassa muistettavaksi) — jos SELECT joskus unohtaa osoite-kentän
// kokonaan, palautuu vain hiljaa null:iin, ei kaadu.
function haeTapahtumanOsoiteTeksti(tapahtuma) {
  return tapahtuma._osoite || (tapahtuma.kalenteri_syotteet ? tapahtuma.kalenteri_syotteet.osoite : null) || '';
}

function etsiTunnettuFoliMatka(tapahtuma) {
  const teksti = ((tapahtuma.location || '') + ' ' + haeTapahtumanOsoiteTeksti(tapahtuma)).toLowerCase();
  if (!teksti.trim()) return null; // ei sijaintia lainkaan = ei matkaa (esim. "meillä")
  return FOLI_TUNNETUT_KOHTEET.find(function(k) { return teksti.indexOf(k.tunnistin) !== -1; }) || null;
}

// Peräkkäisten SAMAAN kohteeseen menevien tapahtumien ryhmittely
// (2026-08-31, Katrin löytö: kaksi peräkkäistä samaan luokkaan menevää
// luentoa — esim. 10-12 ja 12-14 — tuottivat 4 FÖLI-merkkiä kun piti olla
// 2, koska molemmat laskivat oman meno+paluu-parinsa vaikka hän ei
// koskaan poistunut paikalta niiden välissä). Ryhmä muodostuu peräkkäisistä
// (seuraava alkaa viimeistään edellisen loppuessa, ei aukkoa välissä)
// tapahtumista joilla SAMA FÖLI-kohde — koko ryhmälle lasketaan yksi meno
// ENNEN ensimmäistä ja yksi paluu VIIMEISEN jälkeen, ei per-tapahtuma.
function foliKohdeAvain(tapahtuma) {
  const tunnettu = etsiTunnettuFoliMatka(tapahtuma);
  return tunnettu ? tunnettu.tunnistin : (tapahtumanSijaintiteksti(tapahtuma) || '').toLowerCase();
}

function ryhmitaPerakkaisetFoliTapahtumat(tapahtumat) {
  const jarjestetyt = tapahtumat.slice().sort(function(a, b) {
    return aikaMinuutteina(a.event_time.slice(0, 5)) - aikaMinuutteina(b.event_time.slice(0, 5));
  });
  const ryhmat = [];
  jarjestetyt.forEach(function(t) {
    const kohde = foliKohdeAvain(t);
    if (!kohde) return; // ei sijaintia lainkaan — haeFoliSiirtymatTapahtumalle palauttaisi silti [], ei kannata ryhmitellä eri sijaintittomia yhteen
    const alku = aikaMinuutteina(t.event_time.slice(0, 5));
    const loppu = t.event_end_time ? aikaMinuutteina(t.event_end_time.slice(0, 5)) : alku + 60;
    const edellinen = ryhmat[ryhmat.length - 1];
    if (edellinen && edellinen.kohde === kohde && alku <= edellinen.loppu) {
      edellinen.loppu = Math.max(edellinen.loppu, loppu);
    } else {
      ryhmat.push({ kohde: kohde, ensimmainen: t, loppu: loppu });
    }
  });
  return ryhmat.map(function(r) {
    return Object.assign({}, r.ensimmainen, { event_end_time: minutesToHHMM(r.loppu) + ':00' });
  });
}

// SIRI-viivekerros (2026-08-31, Katrin pyyntö: "SIRI layer could be added
// so that I can show if bus is early or late") — EI KOSKAAN perusaikataulun
// lähde (se pysyy Digitransit-reititetystä kestosta, ks.
// haeFoliSiirtymatTapahtumalle) — pelkkä LISÄTIETO päälle kun saatavilla.
// Suodatetaan LINJAN mukaan (Digitransitin jo kertoma oikea linja), EI koko
// pysäkin kaikkia lähtöjä kuten vanha bugillinen järjestelmä teki —
// pienentää mutta ei täysin poista väärän suunnan riskiä jos sama
// linjanumero ajaa molempiin suuntiin (Katrin oma esimerkki: 6A). Katrin
// oma päätös 31.8.: hyväksytty riski yksinkertaisuuden vuoksi — tarkka
// reitti-ID-täsmäys olisi luotettavampi mutta vaatisi vahvistamattoman
// tutkimuksen ensin.
async function haeFoliLahdot(pysakkiId) {
  try {
    const vastaus = await fetch('https://data.foli.fi/siri/sm/' + pysakkiId);
    if (!vastaus.ok) return [];
    const data = await vastaus.json();
    if (data.status !== 'OK') return [];
    return Array.isArray(data.result) ? data.result : [];
  } catch (e) {
    console.error('Föli-lähtöjen haku epäonnistui (pysäkki ' + pysakkiId + '):', e.message);
    return [];
  }
}

// Palauttaa viiveen minuutteina (positiivinen = myöhässä, negatiivinen =
// ajoissa) LÄHIMMÄLLE samaa linjaa ajavalle SIRI-lähdölle annetun
// kohdeajan ±30min sisällä, tai null jos mitään ei löydy riittävän
// läheltä (ei tarkoita ettei bussia olisi — SIRI näyttää vain lähitulevaisuuden).
async function haeFoliViiveMin(pysakkiId, linja, kohdeAikaMin, paivaMs) {
  if (!linja) return null;
  const lahdot = await haeFoliLahdot(pysakkiId);
  const kohdeMs = paivaMs + kohdeAikaMin * 60000;
  let paras = null, parasEro = Infinity;
  lahdot.forEach(function(l) {
    if (l.lineref !== linja) return;
    const ero = Math.abs(l.expecteddeparturetime * 1000 - kohdeMs);
    if (ero < parasEro) { parasEro = ero; paras = l; }
  });
  if (!paras || parasEro > 30 * 60000) return null;
  return typeof paras.delay === 'number' ? Math.round(paras.delay / 60) : null;
}

// Menon + paluun siirtymäpalikat yhdelle kalenteritapahtumalle — YKSI
// yleiskäyttöinen putki sekä tunnetuille kohteille (Joukahaisenkatu) että
// täysin uusille osoitteille (esim. Kiesikatu 4): tunnistetaan kohdeosoite
// (kiinteä tunnettu TAI tapahtuman oma location/osoite), geokoodataan,
// lasketaan kesto+linja Digitransitista (ei koskaan SIRI:n raakaa
// pysäkkihakua — ei suunnan sekaannusta). Ajoitus lasketaan AINA
// aritmeettisesti (tapahtuman kellonaika ± kesto ± puskuri), EI reaaliaikaisen
// SIRI-lähtötaulun mukaan — siksi rivi on käytettävissä HETI kun päivä
// piirretään, ei vasta kun oikea bussi sattuu näkymään reaaliaikalistassa
// (Katrin pyyntö: "travel time blocks should be there little earlier...
// travel blocks should be there by then" kun Hytti luo päiväsuunnitelman).
async function haeFoliSiirtymatTapahtumalle(tapahtuma, paivanIso, varattu) {
  if (!tapahtuma.event_time) return [];
  const tunnettu = etsiTunnettuFoliMatka(tapahtuma);
  const osoiteTeksti = tunnettu ? tunnettu.osoite : tapahtumanSijaintiteksti(tapahtuma);
  if (!osoiteTeksti) return [];

  const [sijainti, pysakit] = await Promise.all([geokoodaaOsoite(osoiteTeksti), haeFoliPysakit()]);
  if (!sijainti || !pysakit) return [];
  const pysakkiId = lahinFoliPysakki(pysakit, sijainti.lat, sijainti.lon);
  if (!pysakkiId) return [];
  // Kohde on käytännössä koti itse (2026-08-31, Katrin löytö: "Jamielin
  // kaverisynttärit" jonka location-kenttä ON kotiosoite — synttärit
  // pidettiin kotona, mutta koodi laski silti "matkan" kotoa kotiin).
  // Lähin pysäkki sama kuin kotipysäkki on riittävän luotettava merkki
  // ettei mitään oikeaa matkaa tarvita — ei väärää FÖLI-riviä.
  if (pysakkiId === FOLI_OLETUSPYSAKKI) return [];
  const p = pysakit[pysakkiId];
  const kotiPysakki = pysakit[FOLI_OLETUSPYSAKKI];
  const etaisyysM = Math.round(haversineMetria(sijainti.lat, sijainti.lon, p.stop_lat, p.stop_lon));
  const mapsUrl = 'https://www.google.com/maps/dir/?api=1'
    + '&origin=' + encodeURIComponent(FOLI_KOTIOSOITE)
    + '&destination=' + encodeURIComponent(osoiteTeksti)
    + '&travelmode=transit';

  const kesto = kotiPysakki
    ? await haeDigitransitKesto(kotiPysakki.stop_lat, kotiPysakki.stop_lon, sijainti.lat, sijainti.lon)
    : null;

  const alkuMin = aikaMinuutteina(tapahtuma.event_time.slice(0, 5));
  const loppuMin = tapahtuma.event_end_time ? aikaMinuutteina(tapahtuma.event_end_time.slice(0, 5)) : alkuMin + 60;
  const saavuEnnenMin = tunnettu ? (tunnettu.saavuEnnenTapahtumaaMin || 0) : 0;

  // Meno: jos kesto tiedetään (Digitransit-avain asetettu), lasketaan
  // suositeltu "lähde nyt" -hetki taaksepäin. Jos ei tiedetä, EI keksitä
  // kestoa — sijoitetaan rivi "tarvitset olla paikalla" -hetkeen niin että
  // se silti näkyy oikeassa kohdassa päivää, teksti kertoo vain etäisyyden.
  const menoAlku = kesto
    ? Math.max(0, alkuMin - saavuEnnenMin - kesto.kestoMin)
    : Math.max(0, alkuMin - saavuEnnenMin);
  if (kesto) { for (let m = menoAlku; m < alkuMin - saavuEnnenMin; m++) varattu[m] = true; }

  // SIRI-viive vain TÄNÄÄN (Katrin pyyntö: "SIRI layer... show if bus is
  // early or late" — real-time-tieto on merkityksetön kauas tulevaisuuteen,
  // SIRI ei muutenkaan näytä sitä silloin, ks. haeFoliViiveMin). Kotipysäkki
  // menolle, kohteen lähin pysäkki paluulle — kummallakin oma suunta.
  const onkoTanaan = paivanIso === opintoTanaanPvm();
  const [menoViiveMin, paluuViiveMin] = onkoTanaan && kesto && kotiPysakki
    ? await Promise.all([
        haeFoliViiveMin(FOLI_OLETUSPYSAKKI, kesto.linja, menoAlku, new Date(paivanIso + 'T00:00:00').getTime()),
        haeFoliViiveMin(pysakkiId, kesto.linja, loppuMin, new Date(paivanIso + 'T00:00:00').getTime()),
      ])
    : [null, null];

  // alku/loppu kattavat nyt OIKEAN matka-ajan (ei enää pelkkä piste),
  // kun kesto tiedetään — 2026-08-31, Katrin pyyntö: "it should not be
  // sign but instead block some time right before... so that I get to
  // class on time". Ilman kestoa (ei Digitransit-avainta) pysyy pisteenä,
  // koska todellista kestoa ei silloin tunneta. Väri samasta
  // omistaja-paletista kuin oikeat tapahtumapalkit (resolveEventOwnerColor,
  // script.js) — Katrin pyyntö: "use satama colour schema reddish for me
  // bluish for husband" — sama tapahtuma jolle matka lasketaan kertoo
  // kenen matka se on.
  const vari = resolveEventOwnerColor(tapahtuma);
  const rivit = [{
    tyyppi: 'siirtyma-uusi', suunta: 'meno', alku: menoAlku, loppu: kesto ? (alkuMin - saavuEnnenMin) : menoAlku,
    pysakkiNimi: p.stop_name, etaisyysM: etaisyysM, mapsUrl: mapsUrl, vari: vari,
    kestoMin: kesto ? kesto.kestoMin : null, linja: kesto ? kesto.linja : null, viiveMin: menoViiveMin,
  }];

  // Paluu: heti tapahtuman päätyttyä (ei erillistä saapumistarvetta paluulle).
  if (loppuMin <= 1439) {
    const paluuLoppu = kesto ? Math.min(1439, loppuMin + kesto.kestoMin) : loppuMin;
    rivit.push({
      tyyppi: 'siirtyma-uusi', suunta: 'paluu', alku: loppuMin, loppu: paluuLoppu,
      pysakkiNimi: p.stop_name, etaisyysM: etaisyysM, mapsUrl: mapsUrl, vari: vari,
      kestoMin: kesto ? kesto.kestoMin : null, linja: kesto ? kesto.linja : null, viiveMin: paluuViiveMin,
    });
    if (kesto) { for (let m = loppuMin; m < paluuLoppu; m++) varattu[m] = true; }
  }

  return rivit;
}

// Koko päivän FÖLI-siirtymät kerralla: ryhmittelee peräkkäiset saman-
// kohteiset tapahtumat ENSIN (ks. ryhmitaPerakkaisetFoliTapahtumat), laskee
// sitten meno/paluu per RYHMÄ, ei per raaka kalenteririvi. YKSI yhteinen
// paikka jota kaikki kolme kutsupaikkaa (Nyt-loki, päivänäkymä,
// viikkonäkymä) käyttävät, ettei ryhmittely voi unohtua yhdestä.
async function haeFoliSiirtymatPaivalle(tapahtumat, paivanIso, varattu) {
  const ryhmat = ryhmitaPerakkaisetFoliTapahtumat((tapahtumat || []).filter(function(t) { return t.event_time; }));
  const listat = await Promise.all(ryhmat.map(function(t) { return haeFoliSiirtymatTapahtumalle(t, paivanIso, varattu); }));
  return [].concat.apply([], listat);
}
