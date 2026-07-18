// Shared Laituri classification prompt ("Yksi luukku" — one funnel, ks.
// muistiinpanot.md "Laiturin äly-lajittelu"). Used by BOTH the nightly
// batch job (api/aly-nightly.js) and the Siri immediate-classification
// path (api/laituri-add.js) — extracted here specifically because the
// PROMPT ITSELF must stay identical across both call sites (drift between
// the two would mean the same note gets classified differently depending
// on how it was written in, which is confusing and hard to debug). This
// is the one exception to the project's usual "duplicate small helpers,
// no shared modules between files" convention (ks. COPILOT.md) — that
// convention exists for browser/server boundaries where sharing is
// impossible anyway; here both callers are plain Node files in the same
// Vercel deployment, so a real require() is the lower-risk choice for a
// prompt this large and this easy to get subtly out of sync.
//
// Vercel convention: a folder under api/ prefixed with "_" is bundled with
// the deployment but never itself exposed as a routable endpoint.
//
// Three categories, "korkea kynnys" (high threshold) throughout — wrong
// classification is worse than no classification, ks. design-periaate
// "Kolmiporras" ja Katrin oma linjaus tälle ominaisuudelle:
// - "hetki"   — a single moment in time (existing, ks. Bugi 22/28 history)
// - "ikkuna"  — a deadline being worked towards (existing)
// - "kauppa"  — an unambiguous grocery/shopping-item line, split into
//                individual item strings ("items") for direct insertion
//                as separate Kauppalista rows — NEW 2026-07-19.

const VALID_ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Palauttaa YYYY-MM-DD Europe/Helsinki-aikavyöhykkeellä — EI palvelimen omaa
// kalenteripäivää (Vercel ajaa funktiot UTC:ssa). BUGIKORJAUS (2026-07-21,
// "Aikakäsittelyauditointi", ks. muistiinpanot.md): aiempi
// `d.toISOString().slice(0,10)` palautti UTC-kalenteripäivän, joka Helsingin
// puolella yön ~00:00–02:00/03:00 (talvi/kesäaika) välillä on YKSI PÄIVÄ
// JÄLJESSÄ todellista Suomen kalenteripäivää — täsmälleen sama bugiperhe
// kuin Bugi 22/27/28 ("written_on"-jäädytys, "jo mennyt ohi" -tarkistukset),
// vain tässä uudemmassa moduulissa. Tämä yksi funktio ratkaisee KAIKKI
// "mikä päivä nyt on" -kysymykset koko äly-lajittelun putkessa (kutsutaan
// sekä api/aly-nightly.js:stä että api/laituri-add.js:stä), joten yksi
// korjaus tässä korjaa written_on-laskennan JA kaikki "jo mennyt ohi"
// -tarkistukset kerralla. Sama Intl-tekniikka kuin api/caldav-sync.js:n
// pvmJaAika()-funktiossa, joka törmäsi samaan UTC-vs-Helsinki-ongelmaan.
function isoDate(d) {
  const osat = new Intl.DateTimeFormat('fi-FI', {
    timeZone: 'Europe/Helsinki',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d).reduce(function(acc, o) { acc[o.type] = o.value; return acc; }, {});
  return osat.year + '-' + osat.month + '-' + osat.day;
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

// notes: [{ id, content, created_at }] — written_on is computed here from
// created_at so callers never have to remember to do it themselves (ks.
// Bugi 22 "Suhteellinen aika jäädytetään kirjoitushetkeen" — this is the
// exact mechanism that fix depends on, must never regress).
function buildClassifyPrompt(notes) {
  const today = new Date();
  const noteList = notes.map(function(n) {
    return { id: n.id, text: n.content, written_on: isoDate(new Date(n.created_at)) };
  });

  return 'Tänään on ' + isoDate(today) + '.\n\n' +
    'Seuraavat ovat käyttäjän kirjoittamia lyhyitä muistilappuja, jotka odottavat vielä sijoittamista jonnekin. ' +
    'Jokaisella on "written_on" — päivä jolloin KYSEINEN muistilappu kirjoitettiin. TÄRKEÄÄ: tulkitse ' +
    'suhteelliset ajanmääreet ("huomenna", "ylihuomenna", "ensi tiistaina", "kolmen päivän päästä") AINA ' +
    'SUHTEESSA KYSEISEN MURUN OMAAN written_on-päivään, EI tämänpäiväiseen ("tänään"-kenttään) — "huomenna" ' +
    'tarkoittaa AINA "written_on + 1 päivä", vaikka murun arviointi tapahtuisi vasta myöhemmin.\n\n' +
    'Luokittele JOKAINEN muistilappu YHTEEN kolmesta LAJISTA alla, MUTTA VAIN jos olet HYVIN VARMA — väärä ' +
    'luokittelu on PAHEMPI kuin luokittelematta jättäminen. Jos rivi voisi yhtä hyvin olla jokin muu (tehtävä, ' +
    'idea, kysymys, muistiinpano), JÄTÄ SE KOKONAAN POIS matches-listalta — älä koskaan arvaa.\n\n' +
    '- "hetki" = yksittäinen ajankohta, kellonaika tai muu yksiselitteinen ajanmääre (esim. "huomenna klo 16 ' +
    'hammaslääkäri", "ti aamulla palautus", "soita neuvolaan ma") — "date" on se päivä jolloin ajankohta on.\n' +
    '- "ikkuna" = takaraja jota kohti kuljetaan, toiminta on mahdollinen monena päivänä ennen sitä (esim. "osta ' +
    'liput 24.7. mennessä", "ilmoittaudu perjantaihin mennessä") — "date" ja "deadline" ovat sama päivä ' +
    '(viimeinen päivä, YYYY-MM-DD).\n' +
    '- "kauppa" = rivi sisältää VAIN ostettavia kauppatavaroita/elintarvikkeita/tarvikkeita, EI MITÄÄN MUUTA ' +
    '(esim. "maito", "kurkkua ja 2 maitoa", "maitohappobakteerit") — pilko rivi YKSITTÄISIKSI tuotenimiksi ' +
    '"items"-taulukkoon (yksi merkkijono per tuote). ÄLÄ luokittele kauppatavaraksi jos rivillä on tehtävä, ' +
    'kysymys tai idea liitettynä samaan asiaan vaikka se mainitsisi ruokaa tai tavaroita — esim. "muista kysyä ' +
    'äidiltä se resepti" EI OLE kauppatavaraa (se on muistutus kysymisestä), "idea: kasvislauta arkeen" EI OLE ' +
    'kauppatavaraa (se on idea, ei ostoslista).\n\n' +
    'Jos et ole varma "hetki" vs. "ikkuna" välillä, käytä "hetki". Jos et ole varma kuuluuko rivi mihinkään ' +
    'näistä kolmesta lajista, JÄTÄ SE POIS.\n\n' +
    'Muistilaput: ' + JSON.stringify(noteList) + '\n\n' +
    'Vastaa VAIN JSON-muodossa, ei mitään muuta tekstiä, ei markdown-koodilohkoja:\n' +
    '{"matches": [{"id": <muistilapun id numerona>, "category": "hetki"|"ikkuna"|"kauppa", ' +
    '"content": "<lyhyt suomenkielinen kuvaus, VAIN hetki/ikkuna>", "time": "<HH:MM tai null, VAIN hetki/ikkuna>", ' +
    '"date": "<YYYY-MM-DD, VAIN hetki/ikkuna>", "deadline": "<YYYY-MM-DD tai null, VAIN ikkuna, sama kuin date>", ' +
    '"items": ["<tuote1>", "<tuote2>", ...] tai null, VAIN kauppa}]}\n' +
    'Jos yhtään ei osu, vastaa {"matches": []}.';
}

// Normalizes+validates one raw AI match into a safe shape, or returns null
// if it's unusable (missing id, malformed dates, empty item list, etc.) —
// keeps the "never guess, skip on doubt" invariant enforced in CODE too,
// not just in the prompt wording (a model can still misbehave).
function normalizeMatch(match) {
  if (!match || (typeof match.id !== 'number' && typeof match.id !== 'string')) return null;

  if (match.category === 'kauppa') {
    const items = Array.isArray(match.items)
      ? match.items.map(function(s) { return String(s).trim(); }).filter(Boolean)
      : [];
    if (items.length === 0) return null;
    return { id: match.id, category: 'kauppa', items: items };
  }

  // hetki/ikkuna always need actual anchor text — a match with no usable
  // content is not a real match (ks. "korkea kynnys": better no anchor
  // than a broken/empty one, and this avoids a doomed insert against
  // ankkurit.content's NOT NULL constraint).
  const content = typeof match.content === 'string' ? match.content.trim() : '';
  if (!content) return null;

  const isWindow = match.category === 'ikkuna' && typeof match.deadline === 'string' && VALID_ISO_DATE.test(match.deadline);
  const category = isWindow ? 'ikkuna' : 'hetki';
  const deadline = isWindow ? match.deadline : null;
  const resolvedDate = typeof match.date === 'string' && VALID_ISO_DATE.test(match.date) ? match.date : deadline;
  return {
    id: match.id,
    category: category,
    content: content,
    time: typeof match.time === 'string' ? match.time : null,
    deadline: deadline,
    resolvedDate: resolvedDate,
  };
}

// Bugi 28 ("Ankkuri nousee liian aikaisin kaukaiselle hetkelle") — shared
// here because BOTH the nightly batch AND the Siri immediate-classification
// path can produce a "hetki" match with a far-future date, and both must
// apply the SAME visibility delay (a fresh Siri note dated weeks out is
// exactly as premature as one the nightly batch finds late). Returns null
// (visible immediately) if the target is already within the lead window,
// otherwise an ISO timestamp for `ankkurit.visible_from`.
function laskeHetkiNakyvyys(resolvedDate, ennakkoPaivia) {
  const kohde = new Date(resolvedDate + 'T00:00:00.000Z');
  kohde.setUTCDate(kohde.getUTCDate() - ennakkoPaivia);
  return kohde.getTime() > Date.now() ? kohde.toISOString() : null;
}

// True if a "hetki" match's own resolved (written_on-frozen) date is
// strictly before today — the moment has already passed by the time it's
// being evaluated, so silence is the answer (ks. Bugi 22/28 history) —
// never create a candidate for a moment that's already gone.
function onkoHetkiMennytOhi(resolvedDate) {
  return !!resolvedDate && resolvedDate < isoDate(new Date());
}

module.exports = {
  isoDate,
  parseAiJson,
  buildClassifyPrompt,
  normalizeMatch,
  laskeHetkiNakyvyys,
  onkoHetkiMennytOhi,
  VALID_ISO_DATE,
};
