// Geokoodaus + reititys (2026-08-31, FÖLI-sijaintitietoisuuden vaiheet 1-2,
// ks. muistin project_foli_itinerary_idea). KAKSI toimintoa SAMASSA
// funktiossa (?osoite=... vs ?reitti=1&...) — EI kahta erillistä api/-
// tiedostoa, koska Vercelin Hobby-planin 12 funktion katto oli jo 11/12
// tämän tiedoston luonnin jälkeen (ks. muistin
// project_vercel_function_limit_deploy_break — sama "1 konsolidoitu
// endpoint" -ratkaisu kuin Miron kanssa aiemmin).
//
// ?osoite=... (vaihe 1, 18.8.2026 asti tehty): osoite -> koordinaatit,
// Nominatim (OpenStreetMap). Palvelimen kautta koska Nominatimin
// käyttöehdot vaativat oikean User-Agentin jota selain ei salli asettaa.
//
// ?reitti=1&fromLat&fromLon&toLat&toLon (vaihe 2, 2026-08-31, Katrin pyyntö
// "start building what you can without key"): oikea kesto/reitti
// mielivaltaiselle koordinaattiparille Digitransitin (HSL:n reititys-API,
// OpenTripPlanner) kautta — SIRI ei tähän pysty (ks. foli.js:n
// FOLI_TUNNETUT_MATKAT-kommentti). Palauttaa 503:n selkeällä
// "ei vielä avainta" -viestillä kunnes DIGITRANSIT_KEY on asetettu
// Verceliin — EI kaadu, client (foli.js) tulkitsee tämän hiljaiseksi
// epäonnistumiseksi ja jatkaa vaiheen 1 "lähin pysäkki" -näytöllä. Kun
// avain lisätään, tämä alkaa toimia ilman uutta pushia.
// Endpoint+header+kysely tarkistettu Digitransitin omasta ajantasaisesta
// dokumentaatiosta 31.8.2026 (digitransit.fi/en/developers/apis/
// 1-routing-api/), ei arvattu:
//   POST https://api.digitransit.fi/routing/v2/finland/gtfs/v1
//   header: digitransit-subscription-key
//   Content-Type: application/json, GraphQL-kysely bodyssä
const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DIGITRANSIT_KEY = process.env.DIGITRANSIT_KEY;
const DIGITRANSIT_URL = 'https://api.digitransit.fi/routing/v2/finland/gtfs/v1';

async function haeKayttajaId(userToken) {
  const vastaus = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!vastaus.ok) return null;
  const data = await vastaus.json();
  return data.id || null;
}

async function haeOsoite(req, res) {
  const osoite = (req.query.osoite || '').trim();
  if (!osoite) return res.status(400).json({ error: 'osoite puuttuu' });
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=fi&q=' + encodeURIComponent(osoite);
    const vastaus = await fetch(url, {
      // Nominatimin käyttöehdot: yksilöivä User-Agent, ei anonyymi/oletus.
      headers: { 'User-Agent': 'Satama-perhesovellus (yksityiskäyttö, ei julkinen palvelu)' },
    });
    if (!vastaus.ok) return res.status(502).json({ error: 'Nominatim vastasi ' + vastaus.status });
    const tulokset = await vastaus.json();
    if (!Array.isArray(tulokset) || tulokset.length === 0) {
      return res.status(404).json({ error: 'Osoitetta ei löytynyt' });
    }
    return res.status(200).json({
      lat: parseFloat(tulokset[0].lat),
      lon: parseFloat(tulokset[0].lon),
      nimi: tulokset[0].display_name,
    });
  } catch (e) {
    console.error('[geocode] Haku epäonnistui:', e.message);
    return res.status(502).json({ error: 'Geokoodaus epäonnistui' });
  }
}

async function haeReitti(req, res) {
  if (!DIGITRANSIT_KEY) {
    // EI virhe sovelluslogiikan kannalta — client tulkitsee tämän "ei vielä
    // saatavilla" -tilaksi ja näyttää silti vaiheen 1 tiedot.
    return res.status(503).json({ error: 'DIGITRANSIT_KEY puuttuu — rekisteröidy portal-api.digitransit.fi:ssä ja lisää avain Verceliin' });
  }
  const fromLat = parseFloat(req.query.fromLat), fromLon = parseFloat(req.query.fromLon);
  const toLat = parseFloat(req.query.toLat), toLon = parseFloat(req.query.toLon);
  if ([fromLat, fromLon, toLat, toLon].some(function(n) { return !isFinite(n); })) {
    return res.status(400).json({ error: 'fromLat/fromLon/toLat/toLon puuttuu tai virheellinen' });
  }
  const kysely = 'query { planConnection('
    + 'origin: {location: {coordinate: {latitude: ' + fromLat + ', longitude: ' + fromLon + '}}}, '
    + 'destination: {location: {coordinate: {latitude: ' + toLat + ', longitude: ' + toLon + '}}}, '
    + 'modes: {transit: {transit: [{mode: BUS}]}}, '
    + 'first: 1'
    + ') { edges { node { duration legs { mode duration route { shortName } } } } } }';
  try {
    const vastaus = await fetch(DIGITRANSIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'digitransit-subscription-key': DIGITRANSIT_KEY },
      body: JSON.stringify({ query: kysely }),
    });
    if (!vastaus.ok) return res.status(502).json({ error: 'Digitransit vastasi ' + vastaus.status });
    const data = await vastaus.json();
    const reitti = data.data && data.data.planConnection && data.data.planConnection.edges[0]
      ? data.data.planConnection.edges[0].node : null;
    if (!reitti) return res.status(404).json({ error: 'Reittiä ei löytynyt' });
    return res.status(200).json({ kestoS: reitti.duration, legit: reitti.legs });
  } catch (e) {
    console.error('[geocode/reitti] Haku epäonnistui:', e.message);
    return res.status(502).json({ error: 'Reitityshaku epäonnistui' });
  }
}

module.exports = async function handler(req, res) {
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Ei kirjautunut' });
  const userId = await haeKayttajaId(token);
  if (!userId) return res.status(401).json({ error: 'Virheellinen tai vanhentunut kirjautuminen' });

  if (req.query.reitti) return haeReitti(req, res);
  return haeOsoite(req, res);
};
