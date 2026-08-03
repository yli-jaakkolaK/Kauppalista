// Couple time proposal — accept (2026-08-04, Katri's request, ks.
// muistiinpanot.md "Parisuhdeaika-ehdotus"). Mutual-acceptance endpoint:
// records THIS user's own acceptance on their ankkuri row, then checks
// whether the partner's row (same parisuhde_ryhma) is already accepted too.
//
// Needs service_role because ankkurit RLS (sql/029) restricts select/
// update/delete to `user_id = auth.uid()` — a user can never read or write
// their partner's row directly from the browser client. This is a genuine
// case for a privileged server route (same auth-kaava as api/aly.js:
// validate the caller's own Supabase session token first, THEN use
// service_role only for what the caller is authorized to trigger).
//
// Principle 8 ("Yksi totuus, kaksi ikkunaa"): this endpoint NEVER writes to
// the calendar itself — it only tells the caller whether both people have
// now said yes, and if so returns the same {content, event_date, event_time}
// shape the client's existing kalenterisiltaUrl() already knows how to turn
// into a real, tappable "add to calendar" link (same mechanism as reminders'
// calendar bridge — the human still does the actual export tap).

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

// Auth-kaava copied from api/aly.js — validates the caller's own Supabase
// session via /auth/v1/user before anything else runs.
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

  const rowRes = await supabaseFetch('ankkurit?select=id,user_id,source,parisuhde_ryhma,content,event_date,event_time&id=eq.' + ankkuri_id);
  const rows = await rowRes.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  // Ownership + source check — a caller may only accept THEIR OWN couple
  // time proposal row, never an arbitrary ankkuri id.
  if (!row || row.user_id !== userId || row.source !== 'parisuhdeaika') {
    return res.status(403).json({ error: 'Ei oikeutta tähän riviin' });
  }

  const markRes = await supabaseFetch('ankkurit?id=eq.' + ankkuri_id, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ parisuhde_hyvaksytty: true }),
  });
  if (!markRes.ok) {
    console.error('[parisuhdeaika-hyvaksy] Acceptance write failed id=' + ankkuri_id + ':', markRes.status, await markRes.text());
    return res.status(500).json({ error: 'Hyväksynnän tallennus epäonnistui' });
  }

  const partnerRes = await supabaseFetch('ankkurit?select=id,parisuhde_hyvaksytty&parisuhde_ryhma=eq.' + row.parisuhde_ryhma + '&user_id=neq.' + userId);
  const partnerRows = await partnerRes.json();
  const partner = Array.isArray(partnerRows) ? partnerRows[0] : null;

  if (!partner || !partner.parisuhde_hyvaksytty) {
    // Still waiting on the other person — nothing more to do.
    return res.status(200).json({ mutual: false });
  }

  // Both accepted — close out both rows so this proposal stops showing up
  // as an active candidate for either person. Kirjoituspolkujen rule 4:
  // verify the ACTUAL affected count, don't assume the PATCH touched both.
  const closeRes = await supabaseFetch('ankkurit?parisuhde_ryhma=eq.' + row.parisuhde_ryhma, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ is_candidate: false, done: true, done_at: new Date().toISOString() }),
  });
  const closed = await closeRes.json();
  if (!closeRes.ok || !Array.isArray(closed) || closed.length !== 2) {
    console.error('[parisuhdeaika-hyvaksy] Closing both rows after mutual acceptance did not affect exactly 2 rows, group=' + row.parisuhde_ryhma, closeRes.status, JSON.stringify(closed));
    // The acceptance itself DID succeed and IS mutual — only the cleanup is
    // incomplete, so we still report mutual:true (the caller gets their
    // calendar link either way — a stray still-candidate row is a harmless
    // leftover, not a lost proposal).
  }

  return res.status(200).json({
    mutual: true,
    calendar: { content: row.content, event_date: row.event_date, event_time: row.event_time },
  });
};
