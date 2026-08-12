// Couple time proposal — edit the proposed time (2026-08-11, Katrin pyyntö).
// Jos ehdotettu aika ei sovi kummallekaan, muokkaus TÄSSÄ SAMASSA lapussa
// (ei erillistä kalenterinäkymää) on vaihtoehto pelkälle hyväksy/hylkää-
// parille. Muokkaus EI ole hiljainen korvaus — se on toiminnallisesti
// "hylkää vanha aika, ehdota uutta": kumppanin oma hyväksyntä nollataan aina
// (heidän pitää nähdä ja hyväksyä UUSI aika erikseen), ja muokkaajan oma
// hyväksyntä asetetaan todeksi (Katrin oma päätös: muokkaus = samalla oma
// hyväksyntä uudelle ajalle, jottei tarvitse painaa sekä Tallenna että
// Hyväksy erikseen).
//
// Sama service_role-syy kuin api/parisuhdeaika-hyvaksy.js/-hylkaa.js:
// ankkurit RLS (sql/029) estää kumppanin rivin lukemisen/kirjoituksen
// suoraan selaimesta.

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PVM_RE = /^\d{4}-\d{2}-\d{2}$/;
const AIKA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

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
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Ei kirjautunut' });
  const userId = await getUserId(token);
  if (!userId) return res.status(401).json({ error: 'Virheellinen tai vanhentunut kirjautuminen' });

  const { ankkuri_id, event_date, event_time } = req.body || {};
  if (!ankkuri_id) return res.status(400).json({ error: 'ankkuri_id puuttuu' });
  if (!PVM_RE.test(event_date || '') || !AIKA_RE.test(event_time || '')) {
    return res.status(400).json({ error: 'Virheellinen päivä tai kellonaika' });
  }

  const rowRes = await supabaseFetch('ankkurit?select=id,user_id,source,parisuhde_ryhma,done&id=eq.' + ankkuri_id);
  const rows = await rowRes.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  // Sama omistus+lähdetarkistus kuin hyväksynnässä/hylkäyksessä — ja lisäksi
  // vahvistetuksi (done=true) mennyttä ehdotusta ei voi enää muokata, se on
  // jo kalenterisiltavaiheessa.
  if (!row || row.user_id !== userId || row.source !== 'parisuhdeaika') {
    return res.status(403).json({ error: 'Ei oikeutta tähän riviin' });
  }
  if (row.done) {
    return res.status(409).json({ error: 'Ehdotus on jo vahvistettu, ei voi enää muokata' });
  }

  const partnerRes = await supabaseFetch('ankkurit?select=id&parisuhde_ryhma=eq.' + row.parisuhde_ryhma + '&user_id=neq.' + userId);
  const partnerRows = await partnerRes.json();
  const partner = Array.isArray(partnerRows) ? partnerRows[0] : null;

  const omaRes = await supabaseFetch('ankkurit?id=eq.' + ankkuri_id, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ event_date: event_date, event_time: event_time, parisuhde_hyvaksytty: true }),
  });
  const oma = await omaRes.json();
  if (!omaRes.ok || !Array.isArray(oma) || oma.length !== 1) {
    console.error('[parisuhdeaika-muokkaa] Oman rivin päivitys epäonnistui id=' + ankkuri_id + ':', omaRes.status, JSON.stringify(oma));
    return res.status(500).json({ error: 'Muokkauksen tallennus epäonnistui' });
  }

  if (partner) {
    const kumppaninRes = await supabaseFetch('ankkurit?id=eq.' + partner.id, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ event_date: event_date, event_time: event_time, parisuhde_hyvaksytty: false }),
    });
    const kumppanin = await kumppaninRes.json();
    if (!kumppaninRes.ok || !Array.isArray(kumppanin) || kumppanin.length !== 1) {
      // Oma rivi ehti jo päivittyä — kumppanin rivi jää tässä tapauksessa
      // vanhaan aikaan/hyväksyntätilaan, mikä on epäjohdonmukainen mutta ei
      // vaarallinen (ei kadonnutta dataa, ei väärää "molemmat hyväksyivät"-
      // tilaa) — lokitetaan näkyväksi, ei kaadeta koko pyyntöä siitä.
      console.error('[parisuhdeaika-muokkaa] Kumppanin rivin päivitys epäonnistui id=' + partner.id + ':', kumppaninRes.status, JSON.stringify(kumppanin));
    }
  }

  return res.status(200).json({ ok: true });
};
