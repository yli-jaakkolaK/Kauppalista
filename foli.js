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
    const hakemisto = await fetch('https://data.foli.fi/gtfs/stops');
    if (!hakemisto.ok) return null;
    const meta = await hakemisto.json();
    if (!meta.go) return null;
    const vastaus = await fetch('https:' + meta.go);
    if (!vastaus.ok) return null;
    const pysakit = await vastaus.json();
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

// SIRI Stop Monitoring -haku yhdelle pysäkille — reaaliaikaiset ennustetut
// lähtöajat (expecteddeparturetime, unix-aikaleima). EI välimuistiteta (§8.1
// sanoo "älä pollaa tiheästi", mutta data ITSESSÄÄN on reaaliaikaista —
// data.foli.fi:n oma palvelin jo välimuistittaa 15-30s, ks. sen dokumentaatio).
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

// === UUDET OSOITTEET (2026-08-31, ks. muistin project_foli_itinerary_idea)
// === Katrin pyyntö: "if she has an appointment at a brand-new address...
// it should compute travel time" — TÄMÄ on vain ensimmäinen, tietoisesti
// rajattu pala siitä. Ei ristiriidassa yllä olevan 18.8. päätöksen kanssa
// (EI geokoodausta tunnettuihin matkoihin) — tämä koskee VAIN osoitteita
// joita FOLI_TUNNETUT_MATKAT ei tunnista, eikä sekään laske kestoa: SIRI ei
// tee reititystä mielivaltaiselle pysäkkiparille (sama rajoitus kuin
// tunnetuissa matkoissa, ei mitenkään kierretty). Näytetään VAIN lähin
// pysäkki + Google Maps -linkki todellista reittiä/kestoa varten — Katrin
// oma päätös 31.8.: "build first what you recommended but then in next
// build add some system so that you can check from google maps or such for
// how long actual travel time is" — tämä linkki ei ole se järjestelmä,
// vain väliaikainen manuaalinen silta siihen asti.
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
// (503) TAI mikä tahansa muu virhe — kutsuja (haeFoliUusiOsoiteRivi) näyttää
// silloin vaiheen 1 "lähin pysäkki" -tiedot ilman kestoa, ei kaadu. Kun
// avain joskus lisätään, tämä alkaa palauttaa oikean keston ilman uutta
// pushia — pelkkä ympäristömuuttuja aktivoi sen.
async function haeDigitransitKesto(fromLat, fromLon, toLat, toLon) {
  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    if (!token) return null;
    const url = '/api/geocode?reitti=1&fromLat=' + fromLat + '&fromLon=' + fromLon + '&toLat=' + toLat + '&toLon=' + toLon;
    const vastaus = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (!vastaus.ok) return null; // 503 = ei vielä avainta, muu virhe = ei reittiä juuri nyt
    const tulos = await vastaus.json();
    if (!tulos.kestoS) return null;
    const linja = (tulos.legit || []).find(function(l) { return l.mode === 'BUS'; });
    return { kestoMin: Math.round(tulos.kestoS / 60), linja: linja && linja.route ? linja.route.shortName : null };
  } catch (e) {
    return null;
  }
}

// Lähin pysäkki tapahtuman osoitteelle + Maps-linkki, PLUS oikea kesto jos
// Digitransit-avain on jo asetettu (ks. haeDigitransitKesto). Palauttaa
// yhden rivin tai [] jos osoitetta ei ole, geokoodaus epäonnistuu, tai
// pysäkkilistaa ei saada.
async function haeFoliUusiOsoiteRivi(tapahtuma) {
  const osoiteTeksti = tapahtumanSijaintiteksti(tapahtuma);
  if (!osoiteTeksti || !tapahtuma.event_time) return [];
  const [sijainti, pysakit] = await Promise.all([geokoodaaOsoite(osoiteTeksti), haeFoliPysakit()]);
  if (!sijainti || !pysakit) return [];
  const pysakkiId = lahinFoliPysakki(pysakit, sijainti.lat, sijainti.lon);
  if (!pysakkiId) return [];
  const p = pysakit[pysakkiId];
  const kotiPysakki = pysakit[FOLI_OLETUSPYSAKKI];
  const etaisyysM = Math.round(haversineMetria(sijainti.lat, sijainti.lon, p.stop_lat, p.stop_lon));
  const alku = aikaMinuutteina(tapahtuma.event_time.slice(0, 5));
  const mapsUrl = 'https://www.google.com/maps/dir/?api=1'
    + '&origin=' + encodeURIComponent(FOLI_KOTIOSOITE)
    + '&destination=' + encodeURIComponent(osoiteTeksti)
    + '&travelmode=transit';

  const kesto = kotiPysakki
    ? await haeDigitransitKesto(kotiPysakki.stop_lat, kotiPysakki.stop_lon, sijainti.lat, sijainti.lon)
    : null;

  return [{
    tyyppi: 'siirtyma-uusi', alku: alku, loppu: alku,
    pysakkiNimi: p.stop_name, etaisyysM: etaisyysM, mapsUrl: mapsUrl,
    kestoMin: kesto ? kesto.kestoMin : null, linja: kesto ? kesto.linja : null,
  }];
}

// === TUNNETUT MATKAT (2026-08-18, Katrin täsmennykset) === EI geokoodausta
// eikä pysäkin arvausta osoitetekstistä — tarkistettu suoraan livenä 18.8.
// ettei Marsukatu-Kupittaa-välillä ole suoraa (vaihdotonta) ajovuoroa, joten
// SIRI:stä ei voi laskea luotettavaa kokonaiskestoa vaihdolliselle matkalle
// (§8.1:n oma rajaus: "ei ovelta ovelle -reititystä"). Sen sijaan Katrin oma
// kokemusperäinen kesto pysäkkiparille + hänen pyytämänsä hosumispuskuri.
// EI tekoälyä tässä — pelkkää suoraa API-dataa ja laskentaa (Katrin pyyntö).
// Uusi tunnettu matka lisätään tähän listaan sitä mukaa kun niitä tulee.
const FOLI_TUNNETUT_MATKAT = [
  {
    tunnistin: 'joukahaisenkatu', // tapahtuman location-tekstin osamerkkijono (pieninä kirjaimina)
    kotiPysakki: '6011', // Marsukatu
    kohdePysakit: ['499', '130', '134', '162', '1685'], // Kupittaan jäähalli / Uudenmaantulli
    kestoMin: 45,
    hosumisPuskuriMin: 10,
    // Katrin täsmennys 18.8.: kalenterin alkuaika (12:00) EI ole todellinen
    // tarve olla paikalla — koululounas ennen tapaamista ("lunch at school")
    // ei ole omana kalenterimerkintänään, samaan tapaan kuin päiväkotivienti
    // ei näy kalenterissa. "I need to be at school at 11" — todellinen
    // saapumistarve on 60min ENNEN kalenterin alkuaikaa.
    saavuEnnenTapahtumaaMin: 60,
  },
];

// KORJAUS (2026-08-30, Katrin löytö: "no travel time is showing") — käytti
// aiemmin VAIN tapahtuma.location:ia. Lukkarikone-luennoilla ON oma
// location (huoneen tunnus, esim. "ICT_B1033 - Oppimistila - ICT-City"),
// joten se EI ollut tyhjä eikä siis "location || _osoite" -korjaus (aiempi
// yritys) auttanut — huonetunnus ei vain koskaan sisällä sanaa
// "joukahaisenkatu". Todellinen katuosoite on syötteen OMASSA osoite-
// kentässä (t._osoite, "Joukahaisenkatu 3-5, Turku" Lukkarikoneelle).
// Katrin vahvistus: "everything from Lukkarikone should be potential one"
// — siis TARKISTETAAN MOLEMMAT (huone JA syötteen osoite) yhdessä, ei
// jompikumpi varalla, koska tunnistin voi osua kumpaan tahansa.
function etsiTunnettuFoliMatka(tapahtuma) {
  const teksti = ((tapahtuma.location || '') + ' ' + (tapahtuma._osoite || '')).toLowerCase();
  if (!teksti.trim()) return null; // ei sijaintia lainkaan = ei matkaa (esim. "meillä")
  return FOLI_TUNNETUT_MATKAT.find(function(m) { return teksti.indexOf(m.tunnistin) !== -1; }) || null;
}

// Viimeinen TODELLINEN (SIRI-reaaliaikainen) lähtö kotipysäkiltä joka vielä
// ehtii perille ennen tapahtuman alkua (kesto + hosumispuskuri huomioiden).
// Palauttaa null jos SIRI ei (vielä) näytä yhtään riittävän aikaista lähtöä
// — se ei tarkoita ettei bussia olisi, vain ettei se ole vielä reaaliaika-
// listassa (kaukaisempi lähtö tarkentuu lähempänä).
async function haeFoliLahtoEnnenTapahtumaa(tapahtumaAlkuMs, matka) {
  const lahdot = await haeFoliLahdot(matka.kotiPysakki);
  const tarveOllaPaikallaMs = tapahtumaAlkuMs - (matka.saavuEnnenTapahtumaaMin || 0) * 60000;
  const viimeinenSallittu = tarveOllaPaikallaMs - (matka.kestoMin + matka.hosumisPuskuriMin) * 60000;
  let paras = null;
  lahdot.forEach(function(l) {
    const lahtoMs = l.expecteddeparturetime * 1000;
    if (lahtoMs <= viimeinenSallittu && (!paras || lahtoMs > paras.lahtoMs)) {
      paras = { lahtoMs: lahtoMs, linja: l.lineref, kohde: l.destinationdisplay };
    }
  });
  if (!paras) return null;
  return { lahtoMs: paras.lahtoMs, saapumisMs: paras.lahtoMs + matka.kestoMin * 60000, linja: paras.linja, kohde: paras.kohde };
}

// Ensimmäinen todellinen lähtö jommaltakummalta kohdepysäkiltä tapahtuman
// päättymisen jälkeen — paluumatka.
async function haeFoliPaluuTapahtumanJalkeen(tapahtumaLoppuMs, matka) {
  const kaikki = await Promise.all(matka.kohdePysakit.map(haeFoliLahdot));
  const lahdot = [].concat.apply([], kaikki);
  let paras = null;
  lahdot.forEach(function(l) {
    const lahtoMs = l.expecteddeparturetime * 1000;
    if (lahtoMs >= tapahtumaLoppuMs && (!paras || lahtoMs < paras.lahtoMs)) {
      paras = { lahtoMs: lahtoMs, linja: l.lineref, kohde: l.destinationdisplay };
    }
  });
  if (!paras) return null;
  return { lahtoMs: paras.lahtoMs, saapumisMs: paras.lahtoMs + matka.kestoMin * 60000, linja: paras.linja, kohde: paras.kohde };
}

// Menon + paluun siirtymäpalikat yhdelle kalenteritapahtumalle, minuutti-
// ruudukkoon merkittynä (varattu, sivuvaikutuksena) ja rivilistana
// palautettuna. "Ei vielä tiedossa" -tapauksessa EI varata ruudukosta
// mitään (ei keksitä kestoa) — näytetään vain karkea arvio ajankohdasta.
async function haeFoliSiirtymatTapahtumalle(tapahtuma, paivanIso, varattu) {
  const matka = etsiTunnettuFoliMatka(tapahtuma);
  if (!tapahtuma.event_time) return [];
  if (!matka) return haeFoliUusiOsoiteRivi(tapahtuma);
  const paivaMs = new Date(paivanIso + 'T00:00:00').getTime();
  const alkuMs = paivaMs + aikaMinuutteina(tapahtuma.event_time.slice(0, 5)) * 60000;
  const loppuMs = tapahtuma.event_end_time ? paivaMs + aikaMinuutteina(tapahtuma.event_end_time.slice(0, 5)) * 60000 : alkuMs + 3600000;

  const [meno, paluu] = await Promise.all([
    haeFoliLahtoEnnenTapahtumaa(alkuMs, matka),
    haeFoliPaluuTapahtumanJalkeen(loppuMs, matka),
  ]);

  const rivit = [];
  if (meno) {
    const a = Math.max(0, Math.round((meno.lahtoMs - paivaMs) / 60000));
    const b = Math.min(1439, Math.round((meno.saapumisMs - paivaMs) / 60000));
    for (let m = a; m < b; m++) varattu[m] = true;
    rivit.push({ tyyppi: 'siirtyma', alku: a, loppu: b, linja: meno.linja, kohde: meno.kohde, suunta: 'meno' });
  } else {
    const arvioAlku = aikaMinuutteina(tapahtuma.event_time.slice(0, 5)) - (matka.saavuEnnenTapahtumaaMin || 0) - matka.kestoMin - matka.hosumisPuskuriMin;
    rivit.push({ tyyppi: 'siirtyma-tuntematon', alku: arvioAlku, loppu: arvioAlku, suunta: 'meno' });
  }
  if (paluu) {
    const a = Math.max(0, Math.round((paluu.lahtoMs - paivaMs) / 60000));
    const b = Math.min(1439, Math.round((paluu.saapumisMs - paivaMs) / 60000));
    for (let m = a; m < b; m++) varattu[m] = true;
    rivit.push({ tyyppi: 'siirtyma', alku: a, loppu: b, linja: paluu.linja, kohde: paluu.kohde, suunta: 'paluu' });
  }
  return rivit;
}
