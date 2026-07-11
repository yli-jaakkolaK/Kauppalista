// Äly-putken runko (2026-07-11): ENSIMMÄINEN KERROS, EI vielä yhtään oikeaa
// älyominaisuutta — vain todistettu putki puhelimesta Claude API:iin ja
// takaisin. Jokainen tuleva älyominaisuus (Siri-tulkinta, Laituri-luokittelu,
// jääkaappikuva) on tämän päälle "kirjoita prompti ja kytke" -tyylinen
// lisäys, ei oma putkensa. Ks. COPILOT.md "Äly-putki" -osio miten uusi
// ominaisuus lisätään tämän päälle.
//
// *** PERIAATE: ÄLY EHDOTTAA, IHMINEN KUITTAA ***
// Tämä endpoint palauttaa VAIN tekstiä kutsujalle — se EI KOSKAAN kirjoita
// mihinkään Supabase-tauluun suoraan eikä tule koskaan tekemään niin.
// Jokainen tuleva ominaisuus jonka äly "tekee" (esim. luokittelee Laiturin
// rivin, tulkitsee Siri-komennon) näytetään aina ensin käyttäjälle
// ehdotuksena — käyttäjä hyväksyy/muokkaa/hylkää, ei koskaan automaattista
// tallennusta ilman kuittausta.
//
// Vaatii Vercelin ympäristömuuttujat:
//   SUPABASE_SERVICE_KEY  (sama kuin muillakin api/-funktioilla, käytetään
//                          VAIN kutsujan JWT:n validointiin /auth/v1/user:lla,
//                          ei kirjoita Supabaseen mitään)
//   ANTHROPIC_API_KEY     (Anthropic-konsolista, salainen — EI koskaan
//                          selaimeen/koodiin, vain Vercelin ympäristömuuttujiin)
//   ALY_MALLI             (valinnainen, oletus alla — mallin vaihto on
//                          tämän jälkeen yhden Vercel-kentän muutos, ei
//                          koodimuutos. Ajantasainen mallilista:
//                          docs.claude.com → Models.)

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OLETUS_MALLI = 'claude-sonnet-4-6';

// Kustannussuoja: maltillinen oletus, kova yläraja jota kutsuja ei voi ylittää.
const OLETUS_MAX_TOKENS = 500;
const KATTO_MAX_TOKENS = 2000;

// Tunnistaa kutsujan Supabase-istunnon access_token-arvon perusteella — sama
// malli kuin api/push-test.js:ssä. Ilman validia tokenia 401 — avoin
// endpoint polttaisi Anthropic-saldoa kenelle tahansa netissä.
async function haeKayttajaId(userToken) {
  const vastaus = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!vastaus.ok) return null;
  const data = await vastaus.json();
  return data.id || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY puuttuu Vercelistä' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ error: 'Ei kirjautunut' });
  }
  const userId = await haeKayttajaId(token);
  if (!userId) {
    return res.status(401).json({ error: 'Virheellinen tai vanhentunut kirjautuminen' });
  }

  const { prompt, max_tokens } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'prompt puuttuu tai on tyhjä' });
  }

  let maxTokens = parseInt(max_tokens, 10);
  if (isNaN(maxTokens) || maxTokens < 1) maxTokens = OLETUS_MAX_TOKENS;
  if (maxTokens > KATTO_MAX_TOKENS) maxTokens = KATTO_MAX_TOKENS;

  const malli = process.env.ALY_MALLI || OLETUS_MALLI;

  let vastaus;
  try {
    vastaus = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: malli,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (e) {
    console.error('Anthropic-kutsu epäonnistui (verkkovirhe):', e.message);
    return res.status(502).json({ error: 'Yhteys Claude API:iin epäonnistui, yritä uudelleen' });
  }

  const data = await vastaus.json();

  if (!vastaus.ok) {
    const virhe = data.error || {};
    let viesti = 'Äly-pyyntö epäonnistui';
    if (virhe.type === 'authentication_error') {
      viesti = 'ANTHROPIC_API_KEY on virheellinen tai vanhentunut';
    } else if (virhe.type === 'rate_limit_error') {
      viesti = 'Liikaa pyyntöjä juuri nyt, yritä hetken päästä uudelleen';
    } else if (virhe.type === 'overloaded_error') {
      viesti = 'Claude API on ruuhkautunut, yritä hetken päästä uudelleen';
    } else if (virhe.type === 'invalid_request_error' && /model/i.test(virhe.message || '')) {
      viesti = 'Mallitunniste ei kelvannut ("' + malli + '") — tarkista ALY_MALLI-ympäristömuuttuja Vercelissä';
    } else if (virhe.message) {
      viesti = virhe.message;
    }
    console.error('[aly] Anthropic-virhe:', vastaus.status, JSON.stringify(virhe));
    return res.status(vastaus.status >= 400 && vastaus.status < 500 ? vastaus.status : 502).json({ error: viesti });
  }

  const teksti = (data.content || []).map(function(lohko) { return lohko.text || ''; }).join('');
  const kaytto = data.usage || {};

  // Kevyt kustannusseuranta alusta asti — ei omaa taulua vielä (ei
  // sopinut olemassa olevaan events-tauluun, jonka rakenne on
  // listat/tuotteet-toimintoja varten). Vercelin lokeista luettavissa
  // ("Logs"-välilehti) — jos volyymi kasvaa, harkitse omaa taulua.
  console.log('[aly]', JSON.stringify({
    user_id: userId,
    malli: malli,
    input_tokens: kaytto.input_tokens,
    output_tokens: kaytto.output_tokens,
    aika: new Date().toISOString(),
  }));

  return res.status(200).json({ text: teksti, usage: kaytto });
};
