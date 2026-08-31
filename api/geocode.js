// Geokoodaus (2026-08-31, FÖLI-sijaintitietoisuuden ensimmäinen vaihe, ks.
// muistin project_foli_itinerary_idea) — muuttaa vapaamuotoisen osoitteen
// koordinaateiksi Nominatimin (OpenStreetMap) kautta. Palvelimen kautta,
// EI suoraan selaimesta: Nominatimin käyttöehdot vaativat oikean,
// sovelluksen tunnistavan User-Agentin — selain ei salli sen asettamista
// itse (turvallisuussyy), joten client-side-kutsu rikkoisi käyttöehtoja
// huomaamatta. Sama Supabase-token-tarkistus kuin api/saa.js:ssä (estää
// funktion väärinkäytön ulkopuolisilta).
//
// EI SIIS "reititystä" — pelkkä osoite -> koordinaatit. Kesto/reitti
// mielivaltaiselle pysäkkiparille on ERI, ei vielä ratkaistu ongelma (ks.
// foli.js:n oma kommentti FOLI_TUNNETUT_MATKAT:n yllä, 18.8.2026: SIRI ei
// tee reititystä). Client (foli.js:n haeFoliUusiOsoiteRivi) käyttää tätä
// vain löytääkseen LÄHIMMÄN pysäkin, ei kestoa.
const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function haeKayttajaId(userToken) {
  const vastaus = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!vastaus.ok) return null;
  const data = await vastaus.json();
  return data.id || null;
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
};
