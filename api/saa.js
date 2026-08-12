// Sää-välimuisti (2026-08-11, ks. Ruori-speksi §2) — hakee Open-Meteosta
// (ilmainen, ei API-avainta, CC BY 4.0) ja välimuistittaa Supabaseen
// (asetukset-taulu, sama avain-arvo-kaava kuin muillakin kevyillä
// välimuisteilla, ks. api/aly-nightly.js:n getSetting/supabaseFetch).
// Kolme syytä palvelimen kautta eikä suoraan selaimesta: (1) välimuisti
// jaettu kaikkien laitteiden/istuntojen kesken, (2) palveluntarjoajan voi
// vaihtaa koskematta käyttöliittymään, (3) kohtuullinen käyttö.
//
// Sijainti on KIINTEÄ vakio, ei selaimen paikannuslupa (§2.2 — sijainti ei
// käytännössä vaihdu, Fölikin on jo sidottu Turkuun). Vaihda tähän jos
// sijainti joskus muuttuu — ei vaadi tietokantamuutosta.
const LEVEYSASTE = 60.4518;
const PITUUSASTE = 22.2666;

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const VALIMUISTI_MIN = 30;

async function haeKayttajaId(userToken) {
  const vastaus = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!vastaus.ok) return null;
  const data = await vastaus.json();
  return data.id || null;
}

async function supabaseFetch(path, options) {
  options = options || {};
  return fetch(SUPABASE_URL + '/rest/v1/' + path, Object.assign({}, options, {
    headers: Object.assign({
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
    }, options.headers),
  }));
}

async function getSetting(key) {
  const res = await supabaseFetch('asetukset?select=value&key=eq.' + encodeURIComponent(key));
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0].value : null;
}

async function setSetting(key, value) {
  const res = await supabaseFetch('asetukset?on_conflict=key', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ key: key, value: value }),
  });
  if (!res.ok) console.error('[saa] välimuistin tallennus epäonnistui:', res.status, await res.text());
}

async function haeOpenMeteosta() {
  // wind_speed_10m lisätty (2026-08-11, Katrin pyyntö) — tuuli-leimaa varten
  // (§4b-tyyppinen sääntö, "TUULINEN"). Yksikkö on Open-Meteon oletus km/h.
  const url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + LEVEYSASTE + '&longitude=' + PITUUSASTE
    + '&hourly=apparent_temperature,precipitation_probability,weather_code,wind_speed_10m'
    + '&current=apparent_temperature,weather_code,wind_speed_10m'
    + '&timezone=Europe%2FHelsinki&forecast_days=2';
  const vastaus = await fetch(url);
  if (!vastaus.ok) throw new Error('Open-Meteo vastasi ' + vastaus.status);
  return vastaus.json();
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

  try {
    const [haettuAtRaaka, dataRaaka] = await Promise.all([getSetting('saa_haettu_at'), getSetting('saa_data')]);
    const haettuAt = haettuAtRaaka ? new Date(haettuAtRaaka) : null;
    const tuore = haettuAt && (Date.now() - haettuAt.getTime()) < VALIMUISTI_MIN * 60000;

    if (tuore && dataRaaka) {
      return res.status(200).json({ data: JSON.parse(dataRaaka), haettu_at: haettuAtRaaka, valimuistista: true });
    }

    const data = await haeOpenMeteosta();
    const nytIso = new Date().toISOString();
    await Promise.all([setSetting('saa_data', JSON.stringify(data)), setSetting('saa_haettu_at', nytIso)]);
    return res.status(200).json({ data: data, haettu_at: nytIso, valimuistista: false });
  } catch (e) {
    console.error('[saa] Haku epäonnistui:', e.message);
    // Virhetilanteessa palautetaan viimeisin tunnettu välimuisti jos sellainen
    // on — client päättää itse näyttääkö sen (Ruori-speksi §2.2 vaatii että
    // ETUSIVU piilottaa koko sääosion virhetilanteessa eikä näytä vanhaa
    // dataa tuoreena, mutta se on esityskerroksen päätös, ei tämän
    // endpointin — tämä vain kertoo rehellisesti ettei tuoretta dataa saatu).
    const [haettuAtRaaka, dataRaaka] = await Promise.all([getSetting('saa_haettu_at').catch(function() { return null; }), getSetting('saa_data').catch(function() { return null; })]);
    return res.status(502).json({
      error: 'Säätiedon haku epäonnistui',
      vanha_data: dataRaaka ? JSON.parse(dataRaaka) : null,
      vanha_haettu_at: haettuAtRaaka || null,
    });
  }
};
