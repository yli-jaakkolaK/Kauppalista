// E3 mid-tier V1: "AI proposes, human supervises" nightly job.
//
// Reads unplaced Laituri notes (murut) per user, asks the AI pipeline in
// ONE batched call per user whether any of them clearly refer to a moment
// or a deadline with a time reference, and — for matches — creates an
// anchor CANDIDATE (never a real anchor outright, never edits/deletes
// anything the user wrote). This file is new code, written in English
// per the house rule (ks. COPILOT.md "Koodikieli") — all user-facing
// strings remain Finnish, and the Finnish-named existing tables/columns
// (laituri, ankkurit, asetukset, muru content) are referenced as-is.
//
// "Hetki vs. ikkuna" (ks. muistiinpanot.md, added 2026-07-16 after the
// first real night): every match is classified as a single MOMENT
// ("hetki" — surfaced once, never again once its candidate expires
// unclaimed) or a WINDOW towards a deadline ("ikkuna" — allowed to
// re-surface once per day until the deadline passes). Uncertain
// classification always defaults to "hetki", the more conservative
// option. Ks. buildPrompt() and the expiry logic below for the full
// reasoning.
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
const MAX_TOKENS = 500; // moderate — this only ever returns a short JSON list
const MIN_HOURS_BETWEEN_RUNS = 20;
const VALID_ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// BUGIKORJAUS (2026-07-18, "Ankkuri nousee liian aikaisin kaukaiselle
// hetkelle" — ks. muistiinpanot.md): oletusarvo sille kuinka monta päivää
// ENNEN "hetki"-kohdepäivää ehdokas tulee näkyviin. Katrin oma ehdotus
// ("kohdepäivän aamuna", herätyspäivä-konsepti) = 0 päivää ennalta, ei
// vuorokausia aiemmin. Säädettävä ilman koodimuutosta `asetukset`-taulun
// avaimella `hetki_ennakkopaivat`, sama "data ei koodia" -periaate kuin
// rauhoitus-ikkunalla.
const HETKI_ENNAKKO_PAIVAT_OLETUS = 0;

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

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// BUGIKORJAUS (2026-07-18, "Ankkuri nousee liian aikaisin kaukaiselle
// hetkelle"): ankkurit on TÄMÄN PÄIVÄN kärkilista, ei tulevaisuuden
// muistilista — "hetki" (tarkka, kertaluontoinen ajankohta) ei siis saa
// nousta ehdokkaaksi heti kun äly löytää sen, jos kohdepäivä on viikkojen
// päässä. "ikkuna" (takaraja jota kohti kuljetaan monena päivänä) EI kärsi
// tästä ja jää tarkoituksella koskematta — se HYÖTYY varhaisesta
// näkyvyydestä (tarvitaan aikaa toimia ennen takarajaa), koskee siis VAIN
// kutsujaa jotka käsittelevät "hetkeä".
//
// Uudelleenkäyttää olemassa olevan visible_from-mekanismin (ks. siirraNappi()
// script.js:ssä, sama sarake) sen sijaan että keksisi uuden: ehdokas LUODAAN
// heti kuten ennenkin (ei toisteta samaa äly-kutsua joka yö turhaan
// pelkästään tämän takia, ks. "Maksimiautomaatio, minimikustannus"), mutta
// pysyy PIILOSSA `loadAnchorCandidates()`:n visible_from-suodattimen takana
// kunnes kohdepäivä on lähellä. Palauttaa null (näkyy heti) jos kohde on jo
// lähempänä kuin ennakkopäivien ikkuna, muuten ISO-aikaleiman.
function laskeHetkiNakyvyys(resolvedDate, ennakkoPaivia) {
  const kohde = new Date(resolvedDate + 'T00:00:00.000Z');
  kohde.setUTCDate(kohde.getUTCDate() - ennakkoPaivia);
  return kohde.getTime() > Date.now() ? kohde.toISOString() : null;
}

// BUGIKORJAUS (2026-07-16, "Hetki-muru nousee joka aamu" — ks. muistiinpanot.md):
// aiemmin tämä prompti antoi AINA ajokerran OMAN päivän "tänään"/"huomenna"
// -ankkureiksi, riippumatta siitä milloin muru oikeasti kirjoitettiin. Jos
// muru ("palaveri huomenna klo 14") jäi jostain syystä arvioimatta
// kirjoitusiltaansa myöhemmin (ajo ohitettiin/epäonnistui, tai eligibility
// aktivoitui uudelleen), "huomenna" tulkittiin SEN YÖN mukaan — "huomenna"
// on siis IKUISESTI seuraava päivä suhteessa ajohetkeen, ei koskaan osu
// oikeaan päivään eikä siksi koskaan "vanhene" oikein. Korjattu: jokainen
// muru saa OMAN kirjoituspäivänsä ("written_on", murun created_at) mukaan
// promptiin, ja suhteelliset ajanmääreet JÄÄDYTETÄÄN sen mukaan — "huomenna"
// tarkoittaa AINA "kirjoituspäivä + 1", ei "tämä ajokerta + 1". Äly palauttaa
// nyt myös absoluuttisen "date"-kentän KAIKILLE osumille (ei vain ikkunan
// "deadline"), jotta järjestelmä (ei vain äly) voi tarkistaa onko hetki jo
// mennyt ohi ennen ehdokkaan luomista (ks. handler alla).
function buildPrompt(notes) {
  const today = new Date();

  const noteList = notes.map(function(n) {
    return { id: n.id, text: n.content, written_on: isoDate(new Date(n.created_at)) };
  });

  return 'Tänään on ' + isoDate(today) + '.\n\n' +
    'Seuraavat ovat käyttäjän kirjoittamia lyhyitä muistilappuja, jotka odottavat vielä sijoittamista jonnekin. ' +
    'Jokaisella on "written_on" — päivä jolloin KYSEINEN muistilappu kirjoitettiin. TÄRKEÄÄ: tulkitse ' +
    'suhteelliset ajanmääreet ("huomenna", "ylihuomenna", "ensi tiistaina", "kolmen päivän päästä") AINA ' +
    'SUHTEESSA KYSEISEN MURUN OMAAN written_on-päivään, EI tämänpäiväiseen ("tänään"-kenttään) — "huomenna" ' +
    'tarkoittaa AINA "written_on + 1 päivä", vaikka murun arviointi tapahtuisi vasta myöhemmin. ' +
    'Tunnista NÄISTÄ VAIN ne jotka viittaavat SELVÄSTI johonkin ajankohtaan tai takarajaan JA sisältävät kellonajan ' +
    'tai muun yksiselitteisen ajanmääreen (esim. "huomenna klo 16", "osta liput 24.7. mennessä"). Jos olet ' +
    'epävarma, JÄTÄ POIS — älä koskaan arvaa.\n\n' +
    'Jokaiselle osumalle määritä LAJI ("category") JA absoluuttinen päivämäärä ("date", YYYY-MM-DD, laskettuna ' +
    'written_on-päivästä yllä olevan säännön mukaan):\n' +
    '- "hetki" = yksittäinen ajankohta (esim. "huomenna klo 16 hammaslääkäri", "ti aamulla palautus") — ' +
    '"date" on se päivä jolloin ajankohta on\n' +
    '- "ikkuna" = takaraja jota kohti kuljetaan, toiminta on mahdollinen monena päivänä ennen sitä ' +
    '(esim. "osta liput 24.7. mennessä", "ilmoittaudu perjantaihin mennessä") — "date" ja "deadline" ovat ' +
    'sama päivä (viimeinen päivä, YYYY-MM-DD)\n' +
    'Jos et ole varma kummasta on kyse, käytä "hetki".\n\n' +
    'Muistilaput: ' + JSON.stringify(noteList) + '\n\n' +
    'Vastaa VAIN JSON-muodossa, ei mitään muuta tekstiä, ei markdown-koodilohkoja:\n' +
    '{"matches": [{"id": <muistilapun id numerona>, "content": "<lyhyt suomenkielinen kuvaus ankkurille>", ' +
    '"time": "<HH:MM tai null>", "category": "hetki"|"ikkuna", "date": "<YYYY-MM-DD, absoluuttinen päivä>", ' +
    '"deadline": "<YYYY-MM-DD tai null, VAIN jos category=ikkuna, sama kuin date>"}]}\n' +
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

  const ennakkoPaivia = parseInt(await getSetting('hetki_ennakkopaivat'), 10) || HETKI_ENNAKKO_PAIVAT_OLETUS;

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
  //
  // "Hetki vs. ikkuna" (2026-07-16, refines the same day's earlier "only
  // once" fix — the first real night showed the same note re-suggested
  // three mornings running, an expiry/re-evaluation loop). Every match
  // is classified at suggestion time (ks. buildPrompt) as:
  // - "hetki" — a single point in time ("hammaslääkäri ti klo 15"). If
  //   its candidate expires unclaimed, silence WAS the answer — the note
  //   is marked permanently evaluated (via markEvaluated below), never
  //   re-asked about with the same text.
  // - "ikkuna" — a deadline being worked towards ("osta liput 24.7.
  //   mennessä"). Every day up to the deadline is still a valid day to
  //   act, so an expiring candidate is allowed to re-surface once more
  //   per day (the note is simply left un-evaluated, so it flows back
  //   into "eligible" below and gets asked about again tonight) — UNLESS
  //   the deadline has already passed, in which case it's treated exactly
  //   like "hetki" (marked permanently evaluated).
  // Uncertain classification always defaults to "hetki" (ks. buildPrompt
  // and the match-creation loop below) — the more conservative option.
  // Either way, editing the note's text resets everything automatically
  // (ks. markEvaluated/isEligible — content comparison, no separate edit
  // detection needed).
  const staleRes = await supabaseFetch('ankkurit?select=id,source_ref&source=eq.aly&is_candidate=eq.true&done=eq.false');
  const stale = await staleRes.json();
  let expired = 0;

  async function markEvaluated(noteId, content) {
    await supabaseFetch('aly_evaluated?on_conflict=laituri_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ laituri_id: noteId, content: content }),
    });
  }

  function deadlineHasPassed(deadline) {
    return !!deadline && isoDate(new Date()) > deadline;
  }

  if (stale && stale.length > 0) {
    const staleAnchorIds = stale.map(function(r) { return r.id; });
    const staleNoteIds = stale.map(function(r) { return r.source_ref; }).filter(Boolean);
    const [staleNotesRes, staleLogsRes] = await Promise.all([
      supabaseFetch('laituri?select=id,content&id=in.(' + staleNoteIds.join(',') + ')'),
      supabaseFetch('aly_log?select=anchor_id,category,deadline&anchor_id=in.(' + staleAnchorIds.join(',') + ')&undone_at=is.null'),
    ]);
    const staleNotes = (await staleNotesRes.json()) || [];
    const staleContentById = {};
    staleNotes.forEach(function(n) { staleContentById[n.id] = n.content; });
    const staleLogByAnchorId = {};
    (await staleLogsRes.json() || []).forEach(function(l) { staleLogByAnchorId[l.anchor_id] = l; });

    for (const row of stale) {
      await supabaseFetch('ankkurit?id=eq.' + row.id, { method: 'DELETE' });
      await supabaseFetch('aly_log?anchor_id=eq.' + row.id + '&undone_at=is.null', {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ undone_at: new Date().toISOString(), undo_reason: 'expired' }),
      });

      const noteId = Number(row.source_ref);
      const log = staleLogByAnchorId[row.id];
      const isWindow = log && log.category === 'ikkuna' && !!log.deadline;
      const stillOpen = isWindow && !deadlineHasPassed(log.deadline);
      if (!stillOpen && noteId && staleContentById[noteId] !== undefined) {
        await markEvaluated(noteId, staleContentById[noteId]);
      }
      expired++;
    }
  }

  // 2) Find eligible Laituri notes: unplaced, not already suggested (an
  // aly-sourced anchor referencing it still exists, in ANY state —
  // pending, accepted, or done), and either never evaluated OR evaluated
  // against DIFFERENT text than it currently has (the user edited it
  // since — new content means a fresh chance, ks. bugfix note above).
  const [notesRes, evaluatedRes, suggestedRes] = await Promise.all([
    supabaseFetch('laituri?select=id,user_id,content,created_at&status=eq.uusi'),
    supabaseFetch('aly_evaluated?select=laituri_id,content'),
    supabaseFetch('ankkurit?select=source_ref&source=eq.aly'),
  ]);
  const notes = (await notesRes.json()) || [];
  const evaluatedContentById = {};
  (await evaluatedRes.json() || []).forEach(function(r) { evaluatedContentById[r.laituri_id] = r.content; });
  const suggestedIds = new Set((await suggestedRes.json() || []).map(function(r) { return Number(r.source_ref); }));

  function isEligible(note) {
    if (suggestedIds.has(note.id)) return false;
    const evaluatedContent = evaluatedContentById[note.id];
    if (evaluatedContent === undefined) return true;
    return evaluatedContent !== note.content;
  }

  const eligibleByAge = notes.filter(isEligible);

  // BUGFIX (2026-07-16, "Repeat lock" — ks. muistiinpanot.md): an "ikkuna"
  // (window) item expired and became re-eligible again the SAME night
  // instead of the next one, because the only guard against re-suggesting
  // it was the GLOBAL ~20h gate above (MIN_HOURS_BETWEEN_RUNS) — not a
  // PER-NOTE, CALENDAR-DAY check. If the scheduler (GitHub Actions, ks.
  // "GitHub Actions schedule ei ole kello vaan arpa") pinged more often
  // than once per 20h, or the global gate failed for any reason, the same
  // window item could resurface multiple times on the SAME calendar day —
  // the spec ("once per day until the deadline") never meant that.
  // Fixed by adding an INDEPENDENT, per-note calendar-day lock: check
  // aly_log for whether THIS note already got a suggestion TODAY (UTC
  // calendar day, same definition as buildPrompt()'s today/tomorrow) —
  // regardless of how many times this job has actually run. Covers both
  // silent expiry AND manual dismissal (× on the candidate card): both
  // leave an aly_log row dated today, so neither one "resets" the lock
  // within the same day — only the next calendar day opens it again.
  const todayStartIso = isoDate(new Date()) + 'T00:00:00.000Z';
  const suggestedTodayIds = new Set();
  if (eligibleByAge.length) {
    const idList = eligibleByAge.map(function(n) { return n.id; }).join(',');
    const suggestedTodayRes = await supabaseFetch(
      'aly_log?select=source_ref&source_ref=in.(' + idList + ')&created_at=gte.' + encodeURIComponent(todayStartIso)
    );
    (await suggestedTodayRes.json() || []).forEach(function(r) { suggestedTodayIds.add(Number(r.source_ref)); });
  }

  const eligible = eligibleByAge.filter(function(n) { return !suggestedTodayIds.has(n.id); });

  if (eligible.length === 0) {
    await setSetting('aly_yoajo_last_run', new Date().toISOString());
    return res.status(200).json({ success: true, expired: expired, users_checked: 0, matches: 0, held_back_today: suggestedTodayIds.size });
  }

  // 3) Group by owner — one batched call per user, never one call per note.
  const byUser = {};
  eligible.forEach(function(n) {
    if (!byUser[n.user_id]) byUser[n.user_id] = [];
    byUser[n.user_id].push(n);
  });

  let usersChecked = 0;
  let usersFailed = 0;
  let matchesCreated = 0;

  for (const userId of Object.keys(byUser)) {
    const userNotes = byUser[userId];
    usersChecked++;
    const result = await callClaude(buildPrompt(userNotes), userId);

    // BUGIKORJAUS (2026-07-15, ks. muistiinpanot.md "Yöajo ei tee mitään"):
    // ennen tätä, jos äly-kutsu epäonnistui (Anthropic-virhe TAI vastaus ei
    // jäsentynyt kelvolliseksi JSON:ksi) `callClaude()` palautti `null`, ja
    // se rinnastettiin virheellisesti "äly katsoi eikä löytänyt osumaa"
    // -tulokseen (`matches = []` molemmissa tapauksissa) — KAIKKI käyttäjän
    // murut merkittiin silloin PYSYVÄSTI käsitellyiksi (`markEvaluated`)
    // vaikka äly ei koskaan oikeasti nähnyt niitä. Sama "merkitty tehdyksi
    // vaikkei tehty" -luonnevika kuin muistutus-cronissa (ks. "Ajastetut
    // muistutukset eivät tule perille") — vain hiljaisempi, koska tämä ei
    // näy käyttäjälle MITENKÄÄN (ei virhettä, ei puuttuvaa pushia, pelkkä
    // pysyvä hiljaisuus joka näyttää täsmälleen samalta kuin oikea "ei
    // osumaa"). Korjattu: erotetaan "äly vastasi kelvollisesti, matches on
    // (mahdollisesti tyhjä) taulukko" ja "äly-kutsu epäonnistui/vastaus ei
    // jäsentynyt" toisistaan — jälkimmäisessä TÄMÄN käyttäjän muruja EI
    // merkitä käsitellyiksi ollenkaan, ne jäävät odottamaan seuraavaa ajoa.
    const matches = (result && Array.isArray(result.matches)) ? result.matches : null;
    if (matches === null) {
      usersFailed++;
      console.error('[aly-nightly] Äly-kutsu epäonnistui tai vastaus ei jäsentynyt käyttäjälle ' + userId + ' — ' + userNotes.length + ' murua jätetään EI-käsitellyiksi, yritetään uudelleen seuraavalla ajolla.');
      continue;
    }
    const matchedIds = new Set();

    for (const match of matches) {
      const note = userNotes.find(function(n) { return n.id === match.id; });
      if (!note || !match.content) continue;
      matchedIds.add(note.id);

      // Uncertain or malformed classification defaults to "hetki" — the
      // more conservative option (ks. "hetki vs. ikkuna" note above).
      const isWindow = match.category === 'ikkuna' && typeof match.deadline === 'string' && VALID_ISO_DATE.test(match.deadline);
      const category = isWindow ? 'ikkuna' : 'hetki';
      const deadline = isWindow ? match.deadline : null;
      const resolvedDate = typeof match.date === 'string' && VALID_ISO_DATE.test(match.date) ? match.date : deadline;

      // BUGIKORJAUS (2026-07-16, "Hetki-muru nousee joka aamu"): jos tämän
      // muistilapun arviointi viivästyi (ajo ohitettiin/epäonnistui yhtenä
      // tai useampana yönä) niin paljon että sen OMA, written_on-päivästä
      // jäädytetty hetki on JO MENNYT OHI ennen kuin ehdokas ehdittiin edes
      // luoda, ehdokkaan luominen nyt näyttäisi vanhentunutta tietoa. Silloin
      // hiljaisuus ON vastaus — merkitään suoraan käsitellyksi ilman
      // ehdokasta, ei koskaan luoda ankkuria menneelle hetkelle. Koskee vain
      // "hetkeä" — "ikkuna" saa yhä olla mennyt kokonaan ohi vasta deadlinen
      // jälkeen, sama logiikka kuin osan 1 deadlineHasPassed()-tarkistuksessa.
      if (category === 'hetki' && resolvedDate && resolvedDate < isoDate(new Date())) {
        await markEvaluated(note.id, note.content);
        console.log('[aly-nightly] Hetki "' + match.content + '" (id ' + note.id + ') oli jo mennyt ohi arviointihetkellä (' + resolvedDate + ') — ei ehdokasta, merkitty käsitellyksi.');
        continue;
      }

      // BUGIKORJAUS (2026-07-18, "Ankkuri nousee liian aikaisin kaukaiselle
      // hetkelle" — ks. laskeHetkiNakyvyys() yllä): koskee VAIN "hetkeä" —
      // "ikkuna" jätetään tarkoituksella koskematta (visible_from pysyy
      // nullina, näkyy heti kuten ennenkin).
      const visibleFrom = category === 'hetki' && resolvedDate ? laskeHetkiNakyvyys(resolvedDate, ennakkoPaivia) : null;

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
          visible_from: visibleFrom,
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
          category: category,
          deadline: deadline,
        }),
      });
      matchesCreated++;
    }

    // Notes the AI looked at but did NOT match: mark as evaluated so they
    // are never re-asked about with the SAME text (no date reference —
    // that never changes for identical wording; an edit makes it
    // eligible again, ks. isEligible above). Notes that DID match are
    // deliberately NOT marked here while their candidate is still
    // pending/accepted/done — only once that candidate is gone (dismissed
    // or expired, ks. part 1 above) does the note get marked, because
    // only then do we know the outcome was "no" rather than "not yet".
    const noMatch = userNotes.filter(function(n) { return !matchedIds.has(n.id); });
    for (const note of noMatch) {
      await markEvaluated(note.id, note.content);
    }
  }

  await setSetting('aly_yoajo_last_run', new Date().toISOString());

  return res.status(200).json({
    success: true,
    expired: expired,
    users_checked: usersChecked,
    users_failed: usersFailed,
    notes_evaluated: eligible.length,
    held_back_today: suggestedTodayIds.size,
    matches: matchesCreated,
  });
};
