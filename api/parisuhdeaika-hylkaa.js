// Couple time proposal — reject (2026-08-04, Katri's request, ks.
// muistiinpanot.md "Parisuhdeaika-ehdotus"). An ACTIVE rejection by either
// person cancels the proposal for BOTH — the next proposal only appears the
// next time the calm-day trigger fires naturally, never immediately.
// Passive ignoring (neither accept nor reject) does nothing here at all —
// this endpoint is only reached by an explicit tap.
//
// Same reason as api/parisuhdeaika-hyvaksy.js for needing service_role:
// ankkurit RLS (sql/029) restricts delete to `user_id = auth.uid()`, so a
// user can never delete their partner's row directly from the client.

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

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

  const { ankkuri_id } = req.body || {};
  if (!ankkuri_id) return res.status(400).json({ error: 'ankkuri_id puuttuu' });

  const rowRes = await supabaseFetch('ankkurit?select=id,user_id,source,parisuhde_ryhma&id=eq.' + ankkuri_id);
  const rows = await rowRes.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row || row.user_id !== userId || row.source !== 'parisuhdeaika') {
    return res.status(403).json({ error: 'Ei oikeutta tähän riviin' });
  }

  const deleteRes = await supabaseFetch('ankkurit?parisuhde_ryhma=eq.' + row.parisuhde_ryhma, {
    method: 'DELETE',
    headers: { Prefer: 'return=representation' },
  });
  const deleted = await deleteRes.json();
  if (!deleteRes.ok) {
    console.error('[parisuhdeaika-hylkaa] Rejection delete failed group=' + row.parisuhde_ryhma + ':', deleteRes.status, JSON.stringify(deleted));
    return res.status(500).json({ error: 'Hylkäys epäonnistui' });
  }

  return res.status(200).json({ deleted: Array.isArray(deleted) ? deleted.length : 0 });
};
