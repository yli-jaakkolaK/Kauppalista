// E3 mid-tier V1: "AI proposes, human supervises" nightly job.
//
// Reads unplaced Laituri notes (murut) per user, asks the AI pipeline in
// ONE batched call per user whether any of them clearly refer to today or
// tomorrow with a time reference, and — for matches — creates an anchor
// CANDIDATE (never a real anchor outright, never edits/deletes anything
// the user wrote). This file is new code, written in English per the
// house rule (ks. COPILOT.md "Koodikieli") — all user-facing strings
// remain Finnish, and the Finnish-named existing tables/columns
// (laituri, ankkurit, asetukset, muru content) are referenced as-is.
//
// *** SAFETY INVARIANT: AI ONLY ADDS. It never modifies or deletes a
// Laituri row, and never touches an existing anchor the user created. ***
// It only ever INSERTs new `ankkurit` rows (with source='aly',
// is_candidate=true) and `aly_log` rows, and DELETEs its OWN previously
// unclaimed candidates on expiry. Laituri notes stay untouched forever.
//
// Design principles this implements (ks. muistiinpanot.md):
// - "Maksimiautomaatio, minimikustannus": one AI call per user per night,
//   only when they have unevaluated notes; a settings toggle
//   (aly_yoajo) allows turning this off without a code change.
// - "Äly ehdottaa, ihminen kuittaa": every match becomes a dismissible,
//   editable candidate — never a real, active anchor without a human
//   action (tick it done, "take it as mine", or dismiss it).
//
// Called every 5 minutes by the same GitHub Actions cron as
// muistutukset-laheta.js, but only actually runs its work once roughly
// every ~20h (state kept in asetukset.aly_yoajo_last_run) — this keeps
// the "once nightly" cadence without needing its own cron schedule.
//
// Requires Vercel environment variables:
//   SUPABASE_SERVICE_KEY       (service role key, bypasses RLS — same as
//                                the other cron-driven api/ functions)
//   ANTHROPIC_API_KEY          (same key as api/aly.js)
//   ALY_MALLI                  (optional, same default as api/aly.js)
//   MUISTUTUKSET_CRON_SECRET   (reused from the reminders job — same
//                                shared secret, one less thing to set up)

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 400; // moderate — this only ever returns a short JSON list
const MIN_HOURS_BETWEEN_RUNS = 20;

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
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0].value : null;
}

async function setSetting(key, value) {
  await supabaseFetch('asetukset?on_conflict=key', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key: key, value: value }),
  });
}

// Strips ```-code-fences a model may add despite instructions not to, then
// parses JSON safely — never throws, returns null on any failure.
function parseAiJson(text) {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

async function callClaude(prompt, userIdForLogging) {
  const model = process.env.ALY_MALLI || DEFAULT_MODEL;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('[aly-nightly] Anthropic error:', response.status, JSON.stringify(data.error || {}));
    return null;
  }
  const usage = data.usage || {};
  console.log('[aly-nightly]', JSON.stringify({
    user_id: userIdForLogging,
    model: model,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    time: new Date().toISOString(),
  }));
  const text = (data.content || []).map(function(block) { return block.text || ''; }).join('');
  return parseAiJson(text);
}

function buildPrompt(notes) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isoDate = function(d) { return d.toISOString().slice(0, 10); };

  const noteList = notes.map(function(n) { return { id: n.id, text: n.content }; });

  return 'Tänään on ' + isoDate(today) + ', huomenna on ' + isoDate(tomorrow) + '.\n\n' +
    'Seuraavat ovat käyttäjän kirjoittamia lyhyitä muistilappuja, jotka odottavat vielä sijoittamista jonnekin. ' +
    'Tunnista NÄISTÄ VAIN ne jotka viittaavat SELVÄSTI tähän päivään tai huomiseen JA sisältävät kellonajan tai ' +
    'muun yksiselitteisen ajanmääreen (esim. "huomenna klo 16", "tänään illalla"). Jos olet epävarma, JÄTÄ POIS ' +
    '— älä koskaan arvaa.\n\n' +
    'Muistilaput: ' + JSON.stringify(noteList) + '\n\n' +
    'Vastaa VAIN JSON-muodossa, ei mitään muuta tekstiä, ei markdown-koodilohkoja:\n' +
    '{"matches": [{"id": <muistilapun id numerona>, "content": "<lyhyt suomenkielinen kuvaus ankkurille>", "time": "<HH:MM tai null>"}]}\n' +
    'Jos yhtään ei osu, vastaa {"matches": []}.';
}

module.exports = async function handler(req, res) {
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY puuttuu Vercelistä' });
  }
  const secret = process.env.MUISTUTUKSET_CRON_SECRET;
  if (secret && (req.query || {}).key !== secret) {
    return res.status(401).json({ error: 'Virheellinen tai puuttuva avain' });
  }

  const toggle = await getSetting('aly_yoajo');
  if (toggle !== 'on') {
    return res.status(200).json({ success: true, skipped: 'toggle_off' });
  }

  const lastRun = await getSetting('aly_yoajo_last_run');
  if (lastRun) {
    const hoursSince = (Date.now() - new Date(lastRun).getTime()) / 3600000;
    if (hoursSince < MIN_HOURS_BETWEEN_RUNS) {
      return res.status(200).json({ success: true, skipped: 'not_due', hours_since_last_run: Math.round(hoursSince * 10) / 10 });
    }
  }

  // 1) Expire yesterday's unclaimed candidates first — this is what makes
  // "reagoimaton ehdotus raukeaa seuraavan yöajon alussa" true. Anything
  // the user acted on (ticked done, or took as their own — is_candidate
  // flips to false) is left completely alone.
  const staleRes = await supabaseFetch('ankkurit?select=id&source=eq.aly&is_candidate=eq.true&done=eq.false');
  const stale = await staleRes.json();
  let expired = 0;
  for (const row of (stale || [])) {
    await supabaseFetch('ankkurit?id=eq.' + row.id, { method: 'DELETE' });
    await supabaseFetch('aly_log?anchor_id=eq.' + row.id + '&undone_at=is.null', {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ undone_at: new Date().toISOString() }),
    });
    expired++;
  }

  // 2) Find eligible Laituri notes: unplaced, never ruled out as
  // date-free (aly_evaluated), and not already suggested (an aly-sourced
  // anchor referencing it still exists, in ANY state — pending, accepted,
  // or done). If a past suggestion was dismissed/expired, its source row
  // is gone from `ankkurit`, so the note becomes eligible again.
  const [notesRes, evaluatedRes, suggestedRes] = await Promise.all([
    supabaseFetch('laituri?select=id,user_id,content&status=eq.uusi'),
    supabaseFetch('aly_evaluated?select=laituri_id'),
    supabaseFetch('ankkurit?select=source_ref&source=eq.aly'),
  ]);
  const notes = (await notesRes.json()) || [];
  const evaluatedIds = new Set((await evaluatedRes.json() || []).map(function(r) { return r.laituri_id; }));
  const suggestedIds = new Set((await suggestedRes.json() || []).map(function(r) { return Number(r.source_ref); }));

  const eligible = notes.filter(function(n) { return !evaluatedIds.has(n.id) && !suggestedIds.has(n.id); });

  if (eligible.length === 0) {
    await setSetting('aly_yoajo_last_run', new Date().toISOString());
    return res.status(200).json({ success: true, expired: expired, users_checked: 0, matches: 0 });
  }

  // 3) Group by owner — one batched call per user, never one call per note.
  const byUser = {};
  eligible.forEach(function(n) {
    if (!byUser[n.user_id]) byUser[n.user_id] = [];
    byUser[n.user_id].push(n);
  });

  let usersChecked = 0;
  let matchesCreated = 0;

  for (const userId of Object.keys(byUser)) {
    const userNotes = byUser[userId];
    usersChecked++;
    const result = await callClaude(buildPrompt(userNotes), userId);
    const matches = (result && Array.isArray(result.matches)) ? result.matches : [];
    const matchedIds = new Set();

    for (const match of matches) {
      const note = userNotes.find(function(n) { return n.id === match.id; });
      if (!note || !match.content) continue;
      matchedIds.add(note.id);

      const anchorRes = await supabaseFetch('ankkurit', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          content: match.content,
          source: 'aly',
          source_ref: String(note.id),
          is_candidate: true,
          user_id: userId,
          event_time: match.time || null,
        }),
      });
      const anchorRows = await anchorRes.json();
      const anchorId = Array.isArray(anchorRows) && anchorRows[0] ? anchorRows[0].id : null;

      await supabaseFetch('aly_log', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          user_id: userId,
          action: 'suggest_anchor',
          description: 'Ehdotti ankkuria "' + match.content + '" Laiturin murusta.',
          source_ref: String(note.id),
          anchor_id: anchorId,
        }),
      });
      matchesCreated++;
    }

    // Notes the AI looked at but did NOT match: mark as permanently
    // ruled out so they are never re-asked about (they have no date
    // reference — that never changes for the same text). Matched notes
    // are deliberately NOT marked here — if their candidate is later
    // dismissed, the note becomes eligible for re-evaluation again.
    const noMatch = userNotes.filter(function(n) { return !matchedIds.has(n.id); });
    for (const note of noMatch) {
      await supabaseFetch('aly_evaluated', {
        method: 'POST',
        headers: { Prefer: 'return=minimal,resolution=ignore-duplicates' },
        body: JSON.stringify({ laituri_id: note.id }),
      });
    }
  }

  await setSetting('aly_yoajo_last_run', new Date().toISOString());

  return res.status(200).json({
    success: true,
    expired: expired,
    users_checked: usersChecked,
    notes_evaluated: eligible.length,
    matches: matchesCreated,
  });
};
