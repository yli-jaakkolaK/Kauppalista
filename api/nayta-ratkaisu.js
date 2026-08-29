// Palauttaa harjoitustehtavan ratkaisun VASTA erikseen pyydettäessä (ks.
// luo-harjoitustehtava.js:n yläkommentti) — script.js:n "Näytä ratkaisu"
// -napin kutsuma. Palvelinavain ohittaa RLS:n, joten omistus tarkistetaan
// tässä käsin ennen palautusta (sama malli kuin luo-harjoitustehtava.js).
//
// ratkaisu_paljastettu (2026-08-29, Katrin pyyntö) merkitään tässä true:ksi —
// tämä on PACER-vaiheen automaattisen etenemisen ainoa totuuslähde (5
// paljastusta nykyisessä vaiheessa -> script.js vaihtaa opinto_aiheet.
// pacer_vaihe_nyt:n seuraavaan, suoraan Supabase-clientilla, EI täältä käsin
// — tämä reitti vain merkitsee YHDEN rivin paljastetuksi, ei laske mitään).

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function getUserId(userToken) {
  const res = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelistä' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Ei kirjautunut' });
  const userId = await getUserId(token);
  if (!userId) return res.status(401).json({ error: 'Virheellinen tai vanhentunut kirjautuminen' });

  const { tehtava_id: tehtavaId } = req.body || {};
  if (!tehtavaId) return res.status(400).json({ error: 'tehtava_id puuttuu' });

  const rowRes = await fetch(SUPABASE_URL + '/rest/v1/harjoitustehtavat?id=eq.' + tehtavaId + '&select=id,ratkaisu,owner_id', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
  });
  const rows = await rowRes.json();
  const rivi = Array.isArray(rows) ? rows[0] : null;
  if (!rivi || rivi.owner_id !== userId) return res.status(404).json({ error: 'Tehtävää ei löytynyt' });

  // Odotetaan tämä ennen vastausta (ei "fire and forget") — script.js laskee
  // paljastusten määrän HETI vastauksen saatuaan edetäkseen vaiheessa, joten
  // merkinnän on oltava tallessa ennen kuin asiakas näkee ratkaisun.
  try {
    await fetch(SUPABASE_URL + '/rest/v1/harjoitustehtavat?id=eq.' + tehtavaId, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ ratkaisu_paljastettu: true }),
    });
  } catch (e) {
    console.error('[nayta-ratkaisu] ratkaisu_paljastettu-merkintä epäonnistui:', e.message);
  }

  return res.status(200).json({ ratkaisu: rivi.ratkaisu });
};
