// E3 mid-tier V1: "AI proposes, human supervises" nightly job.
//
// Reads unplaced Laituri notes (murut) per user, asks the AI pipeline in
// ONE batched call per user which of three things each note is (ks.
// api/_lib/aly-classify.js — "Yksi luukku", extended 2026-07-19 with the
// "kauppa" category alongside the original "hetki"/"ikkuna"), and — for
// matches — either creates an anchor CANDIDATE (hetki/ikkuna) or writes a
// grocery-suggestion directly onto the Laituri row (kauppa). Never edits/
// deletes anything the user wrote. This file is new code, written in
// English per the house rule (ks. COPILOT.md "Koodikieli") — all
// user-facing strings remain Finnish, and the Finnish-named existing
// tables/columns (laituri, ankkurit, asetukset, muru content) are
// referenced as-is.
//
// "Murun säie" (2026-07-20/21, ks. muistiinpanot.md "Murun säie") — a note
// with follow-up thread lines (laituri_jatkorivit, sql/079) is classified
// using its LATEST thread line as the effective content/written_on instead
// of the original muru (ks. effectiveContent()/effectiveWrittenAt() below)
// — "äly lukee säikeen viimeisintä riviä tilana". The original laituri.content
// itself is NEVER touched by this, only the read-side interpretation used
// for eligibility/prompt-building.
//
// "Hetki vs. ikkuna" (ks. muistiinpanot.md, added 2026-07-16 after the
// first real night): every hetki/ikkuna match is classified as a single
// MOMENT ("hetki" — surfaced once, never again once its candidate expires
// unclaimed) or a WINDOW towards a deadline ("ikkuna" — allowed to
// re-surface once per day until the deadline passes). Uncertain
// classification always defaults to "hetki", the more conservative
// option. "kauppa" (2026-07-19) has no candidate lifecycle at all — it's
// suggested once (immediately marked evaluated) and the user acts or
// doesn't, ks. handler below for the full reasoning.
//
// *** SAFETY INVARIANT: AI ONLY ADDS/SUGGESTS. It never modifies or
// deletes a Laituri row's CONTENT, and never touches an existing anchor
// the user created. *** It only ever INSERTs new `ankkurit` rows (source
// ='aly', is_candidate=true), writes `laituri.ai_kauppa_ehdotus` (a
// suggestion field, not the row's content), and inserts `aly_log` rows —
// plus DELETEs its OWN previously unclaimed hetki/ikkuna candidates on
// expiry. Laituri notes' own content stays untouched forever, and nothing
// is EVER moved to Kauppalista without the user's own approval (ks.
// script.js hyvaksyKauppaEhdotus() — "Kolmiporras": äly ehdottaa, ihminen
// kuittaa, sama koskee kauppatavaraa kuin muutakin).
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

const { isoDate, parseAiJson, buildClassifyPrompt, normalizeMatch, laskeHetkiNakyvyys, onkoHetkiMennytOhi } = require('./aly-classify');

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 600; // moderate — slightly higher than before to leave room for "items" arrays (kauppa)
const MIN_HOURS_BETWEEN_RUNS = 20;
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

// === SILTASOLMUJEN AUTOMAATTINEN ESKALAATIO (2026-08-16, Katrin pyyntö) ===
// EI toistuva viikkokello — kertaluontoinen eskalaatio PER KURSSI: jos kurssi
// on ollut aktiivinen `sillat_auto_paivia` päivää (oletus 7, ks. asetukset)
// ilman että YHTÄÄN siltahakua (käsin tai automaattista) on tehty sen
// lisäyksen jälkeen, järjestelmä tekee YHDEN AI-kutsun kaikista aktiivisista
// kursseista kerralla (silta on määritelmällisesti usean kurssin yhteinen,
// ei löydettävissä yhdestä) ja tallentaa tuloksen käyttäjän hyväksyttäväksi
// — EI KOSKAAN kirjoita taitosolmuja suoraan ("äly ehdottaa, ihminen
// kuittaa" koskee tätäkin). Katrin oma rajaus: "should happen only 4 times
// if 4 courses are added... other times should be just reminders, no AI
// needed" — muistutus on script.js:n paivitaSiltaOdotusIlmoitus(), TÄYSIN
// ilmainen, ei kosketa tätä tiedostoa. `opinto_kurssit.silta_katsottu_at`
// (sql/120) on ainoa tila: NULL = ei koskaan tarkistettu, ei-NULL = pysyvästi
// selvä (ei koskaan nollaudu takaisin paitsi uuden kurssin oletusarvona).
//
// Ei omaa Vercel-funktiota (12 funktion Hobby-katto täynnä, ks.
// muistiinpanot.md "Deploy-pipeline korjattu") — kytketty tämän jo 5 min
// välein pyörivän endpointin alkuun, OMALLA riippumattomalla portillaan
// (ei aly_yoajo-kytkintä eikä sen 20h-väliä, eri ominaisuus eri kellolla).
const SILTA_MATERIAALI_KATKAISU = 3000; // sama raja kuin script.js:n kokoaAktiivistenKurssienMateriaali()

function buildSiltaPrompt(kurssit, aiheet) {
  const aiheetPerKurssi = {};
  aiheet.forEach(function(a) { (aiheetPerKurssi[a.kurssi_id] = aiheetPerKurssi[a.kurssi_id] || []).push(a); });

  const kurssiLohkot = kurssit.map(function(k) {
    const omatAiheet = (aiheetPerKurssi[k.id] || []).map(function(a) { return '  ' + a.id + ': ' + a.name; }).join('\n');
    return 'KURSSI: ' + k.name + ' (kurssi_id: ' + k.id + ')\nMateriaali: ' + k.materiaali + '\nAiheet (aihe_id: nimi):\n' + omatAiheet;
  }).join('\n\n');

  return 'Tässä on kaikki tällä hetkellä AKTIIVISET opiskelukurssit materiaaleineen ja aiheineen.\n\n' + kurssiLohkot + '\n\n' +
    'Etsi KÄSITTEET jotka TOISTUVAT kahdessa tai useammassa kurssissa YHTÄ AIKAA ("siltasolmut", engl. bridge nodes) — ' +
    'ÄLÄ ehdota käsitettä joka esiintyy vain yhden kurssin sisällössä, vaikka se olisi tärkeä. ' +
    'Silta voi olla myös KAHDEN käsitteen suhde (esim. "ohjelman kulku" = funktiot + ehtolauseet yhdessä) — tällöin kuvaa se yhtenä siltana jolla on liittyy-kaaret molempiin komponentteihin.\n\n' +
    'Odotettu määrä on PIENI, suuruusluokkaa 10-20 koko lukukaudelle — jos löydät paljon enemmän, karsi vain VAHVIMMAT ' +
    '(käsite joka aidosti auttaa toisen kurssin ymmärtämisessä), älä pintapuolisia sanayhteyksiä.\n\n' +
    'Vastaa VAIN JSON-muodossa, ei mitään muuta tekstiä, ei markdown-koodilohkoja:\n' +
    '{"sillat": [{"nimi": "<käsitteen nimi>", "perustelu": "<max 20 sanaa suomeksi, miksi tämä on silta>", ' +
    '"viittaa_aihe_id": [<väh. kaksi aihe_id-numeroa YLLÄ OLEVALTA LISTALTA, ERI kursseilta>], ' +
    '"kaaret": [{"tyyppi": "tarvitsee tai liittyy", "kohde_nimi": "<toisen TÄSSÄ SAMASSA sillat-listassa ehdotetun sillan nimi TARKALLEEN, tai jätä kaaret tyhjäksi listaksi jos ei sovellu>"}]}]}\n' +
    'Jos et löydä yhtään aitoa siltaa, palauta {"sillat": []}.';
}

// Sama yhdistetty-materiaali-logiikka kuin script.js:n
// kokoaAktiivistenKurssienMateriaali() — vanha käsin täytetty materiaali-
// kenttä JA "+ Lisää materiaalia" -kautta tuodut, kurssiin merkityt laituri-
// rivit (materiaali_kurssi_id, sql/117) yhdessä. Palauttaa null virheestä.
async function gatherActiveCoursesForOwner(ownerId) {
  const kurssitRes = await supabaseFetch('opinto_kurssit?select=id,name,materiaali&owner_id=eq.' + ownerId + '&status=eq.aktiivinen');
  if (!kurssitRes.ok) return null;
  const kaikki = (await kurssitRes.json()) || [];
  if (kaikki.length === 0) return { kurssit: [], aiheet: [] };

  const ids = kaikki.map(function(k) { return k.id; }).join(',');
  const tuotuRes = await supabaseFetch('laituri?select=materiaali_kurssi_id,content&materiaali_kurssi_id=in.(' + ids + ')');
  if (!tuotuRes.ok) return null;
  const tuodutPerKurssi = {};
  ((await tuotuRes.json()) || []).forEach(function(r) {
    if (!r.materiaali_kurssi_id) return;
    const katkaistu = (r.content || '').slice(0, SILTA_MATERIAALI_KATKAISU);
    (tuodutPerKurssi[r.materiaali_kurssi_id] = tuodutPerKurssi[r.materiaali_kurssi_id] || []).push(katkaistu);
  });

  const kelpaavat = kaikki
    .map(function(k) {
      const yhdistetty = [k.materiaali || ''].concat(tuodutPerKurssi[k.id] || []).filter(function(t) { return t.trim() !== ''; }).join('\n\n');
      return Object.assign({}, k, { materiaali: yhdistetty });
    })
    .filter(function(k) { return k.materiaali.trim() !== ''; });
  if (kelpaavat.length < 2) return { kurssit: kelpaavat, aiheet: [] };

  const aiheRes = await supabaseFetch('opinto_aiheet?select=id,name,kurssi_id&kurssi_id=in.(' + kelpaavat.map(function(k) { return k.id; }).join(',') + ')');
  if (!aiheRes.ok) return null;
  return { kurssit: kelpaavat, aiheet: (await aiheRes.json()) || [] };
}

async function runSiltaAutoCheckForOwner(ownerId, cutoffIso) {
  // Onko tällä omistajalla YHTÄÄN aiemmin tarkistamatonta kurssia joka on
  // ylittänyt kynnyksen? Jos ei, ei tehdä mitään (ei edes AI-kutsua) —
  // vain tämä tarkistus, ei koko koneisto, joten halpa suorittaa joka yö.
  const overdueRes = await supabaseFetch('opinto_kurssit?select=id&owner_id=eq.' + ownerId + '&status=eq.aktiivinen&silta_katsottu_at=is.null&created_at=lte.' + encodeURIComponent(cutoffIso) + '&limit=1');
  if (!overdueRes.ok) return;
  const overdue = await overdueRes.json();
  if (!Array.isArray(overdue) || overdue.length === 0) return;

  // Atominen väite (sama compare-and-swap-periaate kuin claimNightlyRun,
  // ks. alla): PATCH osuu VAIN riveihin jotka ovat YHÄ NULL juuri nyt —
  // kilpaileva rinnakkainen kutsuja joka ehti ensin näkee 0 riviä takaisin
  // ja luovuttaa tekemättä AI-kutsua ollenkaan.
  const nytIso = new Date().toISOString();
  const claimRes = await supabaseFetch('opinto_kurssit?owner_id=eq.' + ownerId + '&status=eq.aktiivinen&silta_katsottu_at=is.null', {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ silta_katsottu_at: nytIso }),
  });
  const claimed = claimRes.ok ? await claimRes.json() : [];
  if (!Array.isArray(claimed) || claimed.length === 0) return;

  // Vain oikea INFRASTRUKTUURIVIRHE (verkko/API/jäsennys) perutaan — "ei
  // tarpeeksi materiaalia" EI ole virhe vaan legitiimi lopputulos, joka
  // pysyy pysyvästi ratkaistuna Katrin oman rajauksen mukaisesti ("korkeintaan
  // kerran per kurssi", ei toistuva uudelleenyritys). Verkkovirhe sen sijaan
  // EI SAA polttaa ainoaa yritystä — kurssi jää silloin yhä NULL:iksi ja
  // yrittää uudelleen seuraavana yönä (sama henki kuin markEvaluated()-
  // suojauksella muualla tässä tiedostossa).
  const claimedIds = claimed.map(function(r) { return r.id; });
  async function peruClaim() {
    await supabaseFetch('opinto_kurssit?id=in.(' + claimedIds.join(',') + ')', {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ silta_katsottu_at: null }),
    });
  }

  const koottu = await gatherActiveCoursesForOwner(ownerId);
  if (!koottu) { await peruClaim(); return; } // hakuvirhe — yritetään uudelleen huomenna
  if (koottu.kurssit.length < 2) return; // ei tarpeeksi materiaalia — pysyvästi ratkaistu, ei uudelleenyritystä

  const prompti = buildSiltaPrompt(koottu.kurssit, koottu.aiheet);
  const jasennetty = await callClaude(prompti, ownerId + ':sillat');
  if (!jasennetty || !Array.isArray(jasennetty.sillat)) { await peruClaim(); return; }

  const aiheKartta = {};
  koottu.aiheet.forEach(function(a) { aiheKartta[a.id] = a; });
  const kurssiKartta = {};
  koottu.kurssit.forEach(function(k) { kurssiKartta[k.id] = k; });

  const kelvolliset = jasennetty.sillat.filter(function(s) {
    if (!s.nimi || !Array.isArray(s.viittaa_aihe_id)) return false;
    const kurssitJoihinViittaa = new Set(s.viittaa_aihe_id.map(function(id) { return aiheKartta[id] ? aiheKartta[id].kurssi_id : null; }).filter(Boolean));
    return kurssitJoihinViittaa.size >= 2;
  });
  if (kelvolliset.length === 0) return;

  // Odottamaan käsin hyväksyntää (silta_ehdotukset_odottavat, sql/119) —
  // EI KOSKAAN kirjoiteta taitosolmuja suoraan tästä.
  const insertRes = await supabaseFetch('silta_ehdotukset_odottavat', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ owner_id: ownerId, ehdotukset: kelvolliset, aihe_kartta: aiheKartta, kurssi_kartta: kurssiKartta }),
  });
  if (!insertRes.ok) {
    // Tallennus epäonnistui — ehdotukset olisivat muuten kadonneet
    // näkymättömiin (AI-kutsu tehty, tulos ei koskaan tavoita käyttäjää).
    // Perutaan väite jotta seuraava yö yrittää uudelleen tuoreella kutsulla.
    console.error('[aly-nightly] Silta-ehdotusten tallennus epäonnistui omistajalle ' + ownerId + ':', insertRes.status, await insertRes.text());
    await peruClaim();
  }
}

async function runSiltaAutoCheck() {
  const autoPaivia = parseInt(await getSetting('sillat_auto_paivia'), 10) || 7;
  const cutoffIso = new Date(Date.now() - autoPaivia * 86400000).toISOString();

  const owedRes = await supabaseFetch('opinto_kurssit?select=owner_id&status=eq.aktiivinen&silta_katsottu_at=is.null&created_at=lte.' + encodeURIComponent(cutoffIso));
  if (!owedRes.ok) return;
  const owed = await owedRes.json();
  const ownerIds = Array.from(new Set((owed || []).map(function(r) { return r.owner_id; })));
  for (const ownerId of ownerIds) {
    await runSiltaAutoCheckForOwner(ownerId, cutoffIso);
  }
}

// BUGIKORJAUS (2026-07-21, "Toisto-/idempotenssiauditointi", ks.
// muistiinpanot.md): ~20h-portti oli aiemmin "lue arvo, päättele kelpoisuus,
// kirjoita LOPUKSI vasta koko ajon jälkeen" — kaksi limittäistä kutsua
// (cron-job.org + GitHub Actions pingaavat molemmat samaa endpointia
// tarkoituksella) saattoivat molemmat lukea saman vanhan
// aly_yoajo_last_run-arvon, molemmat päätellä olevansa "due", ja molemmat
// aloittaa KOKO ajon (Anthropic-kutsut per käyttäjä) ennen kuin kumpikaan
// ehti kirjoittaa mitään — tuloksena tupla-ehdokkaat samalle murulle ja
// tupla-API-kulut. Korjattu "claim ensin, tee työ vasta sen jälkeen"
// -periaatteella: portti VÄITETÄÄN atomisesti HETI (compare-and-swap
// ehdollisella PATCH/POST-suodattimella — Postgresin rivitason lukitus
// takaa ettei kaksi rinnakkaista kutsujaa voi koskaan molemmat onnistua)
// ennen yhtäkään Anthropic-kutsua. Häviäjä bailaa heti ulos, tekemättä
// mitään työtä ollenkaan.
async function claimNightlyRun(lastRun) {
  const nytIso = new Date().toISOString();
  if (lastRun) {
    const res = await supabaseFetch('asetukset?key=eq.aly_yoajo_last_run&value=eq.' + encodeURIComponent(lastRun), {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ value: nytIso }),
    });
    const rivit = res.ok ? await res.json() : [];
    return Array.isArray(rivit) && rivit.length > 0;
  }
  // Ei koskaan ajettu aiemmin (tai rivi puuttuu) — "insert vain jos ei jo
  // olemassa" samalla compare-and-swap-periaatteella: ignore-duplicates
  // palauttaa tyhjän jos joku toinen kutsuja ehti jo luoda rivin juuri äsken.
  const res = await supabaseFetch('asetukset?on_conflict=key', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
    body: JSON.stringify({ key: 'aly_yoajo_last_run', value: nytIso }),
  });
  const rivit = res.ok ? await res.json() : [];
  return Array.isArray(rivit) && rivit.length > 0;
}

// BUGIKORJAUS (2026-07-21, "Riippuvuudet ja rajat" -auditointi, ks.
// muistiinpanot.md): `response.ok`-tarkistus kattaa VAIN Anthropicin oman
// HTTP-virhevastauksen (rate limit, auth, ylikuormitus) — se EI kata raakaa
// verkkotason poikkeusta (DNS-virhe, yhteyden katkeaminen, Anthropicin täysi
// tavoittamattomuus), joka aiemmin propagoitui käsittelemättömänä koko
// handler()-funktion läpi ja kaatoi KOKO yöajon kaikilta käyttäjiltä yhden
// verkkohäiriön takia — sen sijaan että vain sen hetken käyttäjä olisi
// jätetty käsittelemättä. `api/laituri-add.js`:n `classifyImmediately()` on
// jo suojattu tältä täsmälleen samalta juurisyyltä — sama suoja tähän.
async function callClaude(prompt, userIdForLogging) {
  try {
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
  } catch (e) {
    console.error('[aly-nightly] Anthropic-kutsu heitti poikkeuksen (verkko?) käyttäjälle ' + userIdForLogging + ':', e.message);
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY puuttuu Vercelistä' });
  }
  // KORJAUS (2026-08-30, tietoturvakierros) — sama fail-open-bugi kuin
  // muistutukset-laheta.js:ssä oli: puuttuva salaisuus jätti reitin täysin
  // auki sen sijaan että hylkäisi. Tämä reitti käsittelee ja luokittelee
  // perheen yksityisiä Laituri-muistiinpanoja tekoälyllä joka yöajolla -
  // fail-open olisi merkittävästi pahempi tässä kuin push-ilmoituksissa.
  const secret = process.env.MUISTUTUKSET_CRON_SECRET;
  if (!secret || (req.query || {}).key !== secret) {
    return res.status(401).json({ error: 'Virheellinen tai puuttuva avain' });
  }

  // Siltasolmujen auto-eskalaatio (ks. yllä oleva selitys) — OMA riippumaton
  // portti, ei aly_yoajo-kytkintä eikä sen 20h-väliä. Virhe täällä EI SAA
  // koskaan estää loppua yöajoa (sama suoja kuin callClaude():n omalla
  // try/catchilla, eri juurisyy: eri ominaisuus, ei saa kaataa toista).
  try {
    await runSiltaAutoCheck();
  } catch (e) {
    console.error('[aly-nightly] Siltasolmujen auto-eskalaatio heitti poikkeuksen:', e.message);
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

  const claimed = await claimNightlyRun(lastRun);
  if (!claimed) {
    // Toinen rinnakkainen kutsuja (cron-job.org/GitHub Actions) ehti juuri
    // väittää tämän ajon ensin — ei virhe, vain hävitty kilpa-ajo.
    return res.status(200).json({ success: true, skipped: 'race_lost' });
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

  // BUGIKORJAUS (2026-07-19, ks. muistiinpanot.md "Kirjoituspolkujen
  // auditointi"): vastausta ei tarkistettu — hiljainen epäonnistuminen
  // johtaa vain saman murun uudelleenarviointiin seuraavana yönä (turvallinen
  // suunta, ei tietovirhettä), mutta pysyy silti näkymättömänä ilman lokia.
  async function markEvaluated(noteId, content) {
    const res = await supabaseFetch('aly_evaluated?on_conflict=laituri_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ laituri_id: noteId, content: content }),
    });
    if (!res.ok) {
      console.error('[aly-nightly] Murun ' + noteId + ' merkintä käsitellyksi epäonnistui:', res.status, await res.text());
    }
    return res.ok;
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
      const deleteRes = await supabaseFetch('ankkurit?id=eq.' + row.id, { method: 'DELETE' });
      // BUGIKORJAUS (2026-07-19, ks. muistiinpanot.md "Kirjoituspolkujen
      // auditointi"): jos poisto epäonnistuu, ehdokas on TODELLISUUDESSA
      // yhä olemassa (näkyy käyttäjälle) — markEvaluated() EI SAA suorittua
      // silloin, se estäisi murun uudelleenarvioinnin ikuisesti vaikka
      // ehdokas jäi elämään. "expired"-laskuri ei myöskään saa kasvaa
      // rivistä jota ei oikeasti poistettu.
      if (!deleteRes.ok) {
        console.error('[aly-nightly] Vanhentuneen ehdokkaan ' + row.id + ' poisto epäonnistui:', deleteRes.status, await deleteRes.text());
        continue;
      }
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
  //
  // BUGIKORJAUS (2026-07-19, "laukaisusana voittaa" — ks. muistiinpanot.md
  // "Laiturin äly-lajittelu"): source=eq.aly ei riittänyt yksinään —
  // laukaisusanalla ("Juhalle:") delegoitu muru saa `ankkurit`-rivin
  // source='ehdotus', EI 'aly', joten se olisi silti jäänyt "eligible"-
  // tilaan ja äly olisi luokitellut sen UUDELLEEN samana yönä, vaikka
  // käyttäjä on jo eksplisiittisesti reitittänyt sen delegoinniksi.
  // Laajennettu kattamaan molemmat lähteet — kumpi tahansa olemassa oleva
  // ankkuri-viittaus (koneen tai ihmisen tekemä) riittää sulkemaan murun
  // pois uudesta luokittelusta.
  const [notesRes, evaluatedRes, suggestedRes] = await Promise.all([
    supabaseFetch('laituri?select=id,user_id,content,created_at&status=eq.uusi'),
    supabaseFetch('aly_evaluated?select=laituri_id,content'),
    supabaseFetch('ankkurit?select=source_ref&source=in.(aly,ehdotus)'),
  ]);
  const notes = (await notesRes.json()) || [];
  const evaluatedContentById = {};
  (await evaluatedRes.json() || []).forEach(function(r) { evaluatedContentById[r.laituri_id] = r.content; });
  const suggestedIds = new Set((await suggestedRes.json() || []).map(function(r) { return Number(r.source_ref); }));

  // Murun säie (2026-07-20/21, ks. muistiinpanot.md "Murun säie"): "äly lukee
  // säikeen VIIMEISINTÄ riviä tilana" — jos murulla on jatkorivejä, kaikki
  // luokitteluun/kelpoisuuteen liittyvä käyttää VIIMEISIMMÄN jatkorivin
  // tekstiä+kirjoitushetkeä alkuperäisen murun sijaan. Alkuperäinen
  // laituri.content EI muutu missään — turvainvariantti (ei koskaan muokata
  // olemassa olevaa riviä), tämä on vain LUKUpuolen tulkinta kelpoisuudesta
  // ja promptin sisällöstä.
  const latestJatkoByNoteId = {};
  if (notes.length > 0) {
    const jatkoRes = await supabaseFetch('laituri_jatkorivit?select=muru_id,teksti,created_at&muru_id=in.(' + notes.map(function(n) { return n.id; }).join(',') + ')&order=created_at.asc');
    (await jatkoRes.json() || []).forEach(function(jr) {
      latestJatkoByNoteId[jr.muru_id] = jr; // asc-järjestyksen ansiosta viimeisin voittaa
    });
  }
  function effectiveContent(note) {
    const jr = latestJatkoByNoteId[note.id];
    return jr ? jr.teksti : note.content;
  }
  function effectiveWrittenAt(note) {
    const jr = latestJatkoByNoteId[note.id];
    return jr ? jr.created_at : note.created_at;
  }

  function isEligible(note) {
    if (suggestedIds.has(note.id)) return false;
    const evaluatedContent = evaluatedContentById[note.id];
    if (evaluatedContent === undefined) return true;
    return evaluatedContent !== effectiveContent(note);
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
  // calendar day, same definition as buildClassifyPrompt()'s today/tomorrow) —
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

  // aly_yoajo_last_run on jo kirjattu atomisesti claimNightlyRun()-kutsussa
  // yllä (run-alkuhetki, ei run-loppuhetki — tämä on tarkoituksellista: se
  // sulkee myös overlap-ikkunan koko ajon keston ajaksi, ei vain sen jälkeen).
  if (eligible.length === 0) {
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
  let kauppaSuggested = 0;

  for (const userId of Object.keys(byUser)) {
    const userNotes = byUser[userId];
    usersChecked++;
    // Murun säie: prompti saa jokaiselle murulle sen EFEKTIIVISEN sisällön
    // (viimeisin jatkorivi jos sellainen on) ja SEN kirjoitushetken — id säilyy
    // alkuperäisen laituri-rivin id:nä, joten matches[].id-täsmäys (rawMatch,
    // ks. alla) toimii muuttumattomana.
    const promptNotes = userNotes.map(function(n) {
      return { id: n.id, content: effectiveContent(n), created_at: effectiveWrittenAt(n) };
    });
    const result = await callClaude(buildClassifyPrompt(promptNotes), userId);

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

    for (const rawMatch of matches) {
      const note = userNotes.find(function(n) { return n.id === rawMatch.id; });
      if (!note) continue;
      // "Korkea kynnys" (ks. muistiinpanot.md "Laiturin äly-lajittelu"):
      // normalizeMatch() palauttaa null jos osuma on rakenteellisesti
      // epäkelpo (esim. kauppa-luokka ilman yhtään validia tuotenimeä) —
      // tällöin osuma ei ole edes yritys, ei matchedIds:iin eikä mitään
      // kirjoitusta, muru jää normaaliin "ei osumaa" -käsittelyyn alla.
      const match = normalizeMatch(rawMatch);
      if (!match) continue;
      matchedIds.add(note.id);

      // Kauppatavara-ehdotus (2026-07-19, "Yksi luukku" erä 1, ks.
      // muistiinpanot.md "Laiturin äly-lajittelu") — EI ankkuriehdokas,
      // EI candidate-lifecycle: kirjoitetaan suoraan murun omalle riville
      // ("ai_kauppa_ehdotus"), näkyy inline-ehdotuksena Laiturissa
      // (ks. piirraKauppaEhdotusKortti() script.js:ssä). Merkitään
      // käsitellyksi HETI ehdotuksen kirjoituksen jälkeen (ei candidate-
      // rakennetta joka muuten estäisi uudelleenkysymisen) — sama sisältö
      // ei siis kysytä uudelleen ennen kuin käyttäjä MUOKKAA murua.
      if (match.category === 'kauppa') {
        const kauppaRes = await supabaseFetch('laituri?id=eq.' + note.id, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ ai_kauppa_ehdotus: match.items }),
        });
        if (!kauppaRes.ok) {
          console.error('[aly-nightly] Kauppaehdotuksen kirjaus epäonnistui murulle ' + note.id + ':', kauppaRes.status, await kauppaRes.text());
          continue;
        }
        await markEvaluated(note.id, effectiveContent(note));
        kauppaSuggested++;
        continue;
      }

      const category = match.category;
      const deadline = match.deadline;
      const resolvedDate = match.resolvedDate;

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
        await markEvaluated(note.id, effectiveContent(note));
        console.log('[aly-nightly] Hetki "' + match.content + '" (id ' + note.id + ') oli jo mennyt ohi arviointihetkellä (' + resolvedDate + ') — ei ehdokasta, merkitty käsitellyksi.');
        continue;
      }

      // BUGIKORJAUS (2026-07-18, "Ankkuri nousee liian aikaisin kaukaiselle
      // hetkelle" — ks. laskeHetkiNakyvyys() yllä): koskee VAIN "hetkeä" —
      // "ikkuna" jätetään tarkoituksella koskematta (visible_from pysyy
      // nullina, näkyy heti kuten ennenkin).
      const visibleFrom = category === 'hetki' && resolvedDate ? laskeHetkiNakyvyys(resolvedDate, ennakkoPaivia) : null;

      // Kalenterisilta aikaistettu (2026-07-20, Katrin tarkennus, ks.
      // muistiinpanot.md "Kalenterisilta aikaistettu"): ankkuriehdokkaan oma
      // ➕-nappi ei näy ennen kuin visible_from koittaa (kohdepäivän lähelle
      // asti "hetkelle") — kalenteriin lisäys saatiin siis usein vasta kun
      // ajanvaraus oli lähes myöhässä. Kirjoitetaan sama {content,date,time}
      // HETI murun omalle riville (ei odota visible_from:ia, ei riipu
      // ankkuriehdokkaan onnistumisesta ollenkaan — riippumaton, aikaisempi
      // silta, EI korvaa ankkuriehdokasta joka toimii yhä muistutuksena
      // kohdepäivänä ennallaan). Vain "hetki", ei "ikkuna" (Katrin rajaus —
      // ikkuna-ehdokas näkyy jo heti ilman viivettä, sillä ei ole tätä
      // ongelmaa). Epäonnistuminen ei saa katkaista tavallista ehdokasvirtaa
      // — vain lokitetaan.
      if (category === 'hetki') {
        const hetkiRes = await supabaseFetch('laituri?id=eq.' + note.id, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ ai_hetki_ehdotus: { content: match.content, date: resolvedDate, time: match.time || null } }),
        });
        if (!hetkiRes.ok) {
          console.error('[aly-nightly] Kalenterisillan varhaismerkinnän kirjaus epäonnistui murulle ' + note.id + ':', hetkiRes.status, await hetkiRes.text());
        }
      }

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
          // Kalenterisilta (2026-07-18, ks. muistiinpanot.md "Kalenterisilta"):
          // tallennetaan absoluuttinen kohdepäivä ensi kertaa pysyvästi (ei
          // vain hetkellisesti visible_from-laskuun) — "➕ Lisää kalenteriin"
          // -nappi tarvitsee tämän .ics-tapahtuman DTSTART/DTEND-kenttiin.
          event_date: resolvedDate || null,
          visible_from: visibleFrom,
        }),
      });
      // BUGIKORJAUS (2026-07-19, ks. muistiinpanot.md "Kirjoituspolkujen
      // auditointi" — sama laji virhe kuin historiallinen caldav-duplikaatti-
      // bugi): jos ehdokkaan INSERT epäonnistuu, EI SAA silti kirjata
      // aly_log-riviä (jäisi haamumerkintä anchor_id:llä null) eikä laskea
      // matchesCreated:iin — vastauksen pitää kertoa TODELLINEN määrä.
      // Muru jää automaattisesti uudelleen arvioitavaksi seuraavana yönä,
      // koska mitään ankkuri-riviä ei syntynyt (isEligible()-tarkistus
      // seuraavassa ajossa ei löydä sitä suggestedIds:stä eikä evaluatedista).
      if (!anchorRes.ok) {
        console.error('[aly-nightly] Ehdokkaan luonti epäonnistui murulle ' + note.id + ':', anchorRes.status, await anchorRes.text());
        continue;
      }
      const anchorRows = await anchorRes.json();
      const anchorId = Array.isArray(anchorRows) && anchorRows[0] ? anchorRows[0].id : null;

      const logRes = await supabaseFetch('aly_log', {
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
      if (!logRes.ok) {
        console.error('[aly-nightly] aly_log-kirjaus epäonnistui ehdokkaalle ' + anchorId + ':', logRes.status, await logRes.text());
      }
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
      await markEvaluated(note.id, effectiveContent(note));
    }
  }

  return res.status(200).json({
    success: true,
    expired: expired,
    users_checked: usersChecked,
    users_failed: usersFailed,
    notes_evaluated: eligible.length,
    held_back_today: suggestedTodayIds.size,
    matches: matchesCreated,
    kauppa_suggested: kauppaSuggested,
  });
};
