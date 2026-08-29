// Harjoitustehtävägeneraattori (2026-08-29, Katrin build brief "Practice
// Problem Generator"). Ratkaisee kaksi ongelmaa jotka Katri nosti esiin
// fysiikan kurssilla: (1) 1800-sivuista/255MB PDF-oppikirjaa ei voi eikä
// tarvitse syöttää yhtenä palana tekoälylle — kirja on vapaasti luettavissa
// osoitteessa openstax.org (College Physics for AP® Courses 2e), joten
// haetaan VAIN ne osiot jotka opettaja on jo merkinnyt aiheen otsikkoon
// (opinto_aiheet.openstax_sections, ks. api/_lib/openstax-osiot.js) — ei
// koskaan koko kirjaa. (2) "Copilot" (api/aly.js) on tilaton eikä muista
// mitä tehtävää opiskelija juuri ratkaisi — tässä jokainen luotu tehtävä
// tallennetaan (skenaario-kenttä) ja viimeisimmät 20 annetaan seuraavalle
// generointikutsulle "älä toista näitä" -listana.
//
// Ratkaisu (ratkaisu-kenttä) EI KOSKAAN palaudu tästä reitistä — vain
// api/nayta-ratkaisu.js palauttaa sen, erikseen pyydettäessä (script.js:n
// "Näytä ratkaisu" -nappi).

const { haeOpenstaxOsio, haeLuvunHarjoitussivut } = require('./_lib/openstax-osiot');

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ALY_MALLI || 'claude-sonnet-4-6';
const PACER_VAIHEET = ['priming', 'encoding', 'retrieval', 'connection'];

async function supabaseFetch(path, options) {
  options = options || {};
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + path, Object.assign({}, options, {
    headers: Object.assign({
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
    }, options.headers),
  }));
  return res;
}

async function getUserId(userToken) {
  const res = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id || null;
}

function parseAiJson(text) {
  if (!text) return null;
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

const PACER_KUVAUKSET = {
  priming: '"priming":    recognition/recall — "which formula applies?", "what does X mean?"',
  encoding: '"encoding":   guided calculation — formula given, find the answer',
  retrieval: '"retrieval":  same structure but no formula given; student must recall it',
  connection: '"connection": multi-step or cross-concept; harder numbers; real-world framing',
};

function rakennaSystemPrompti(pacerVaihe) {
  return 'You are a physics tutor generating practice problems for an ICT engineering\n' +
    'student (Finnish, adult learner, no advanced maths background).\n\n' +
    'The student is in the ' + pacerVaihe + ' phase:\n' +
    '- ' + PACER_KUVAUKSET.priming + '\n' +
    '- ' + PACER_KUVAUKSET.encoding + '\n' +
    '- ' + PACER_KUVAUKSET.retrieval + '\n' +
    '- ' + PACER_KUVAUKSET.connection + '\n\n' +
    'Generate ONE problem at the appropriate level.\n' +
    'The textbook sections and end-of-chapter problem sets provided below are for\n' +
    'CONTEXT ONLY — never copy an existing problem verbatim or reuse its exact\n' +
    'numbers. Always invent a new scenario and new numeric values, distinct from\n' +
    'both the source material and the "already generated" list below.\n' +
    'Respond in JSON: { "skenaario": "...", "kysymys": "...", "ratkaisu": "...", "vihje": "..." }\n' +
    '- skenaario: 8-12 words capturing the physical scenario and key numbers\n' +
    '- kysymys:   the problem as the student sees it — no solution, no hint\n' +
    '- ratkaisu:  full worked solution with every step shown\n' +
    '- vihje:     one sentence that nudges without giving the answer\n' +
    'Respond with ONLY the JSON object, no markdown fences, no extra text.';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SUPABASE_KEY || !ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY tai ANTHROPIC_API_KEY puuttuu Vercelistä' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Ei kirjautunut' });
  const userId = await getUserId(token);
  if (!userId) return res.status(401).json({ error: 'Virheellinen tai vanhentunut kirjautuminen' });

  const { aihe_id: aiheId } = req.body || {};
  let pacerVaihe = (req.body || {}).pacer_vaihe || 'encoding';
  if (!aiheId) return res.status(400).json({ error: 'aihe_id puuttuu' });
  if (PACER_VAIHEET.indexOf(pacerVaihe) === -1) pacerVaihe = 'encoding';

  try {
    const aiheRes = await supabaseFetch('opinto_aiheet?id=eq.' + aiheId + '&select=id,name,kurssi_id,openstax_sections,openstax_cache,materiaali_teksti');
    const aiheRows = await aiheRes.json();
    const aihe = Array.isArray(aiheRows) ? aiheRows[0] : null;
    if (!aihe) return res.status(404).json({ error: 'Aihetta ei löytynyt' });

    const kurssiRes = await supabaseFetch('opinto_kurssit?id=eq.' + aihe.kurssi_id + '&select=id,owner_id');
    const kurssiRows = await kurssiRes.json();
    const kurssi = Array.isArray(kurssiRows) ? kurssiRows[0] : null;
    if (!kurssi || kurssi.owner_id !== userId) return res.status(403).json({ error: 'Ei oikeutta tähän aiheeseen' });

    // Kontekstitekstin kokoaminen: joko OpenStax-osiot (+ luvun harjoitukset/
    // test prep) tai, jos opettaja ei ole antanut osionumeroita tälle
    // aiheelle (esim. "1 - Fundamental Physics Skills", "5 – ICT and
    // sustainability" — eivät vastaa mitään yhtä oppikirjan lukua), jo
    // olemassa oleva kalvomateriaali (opinto_aiheet.materiaali_teksti, sama
    // pituusluokka kuin yksi OpenStax-osio, ei koko kirja).
    const cache = Object.assign({}, aihe.openstax_cache || {});
    let cacheMuuttui = false;
    const kontekstiPalat = [];
    const sections = aihe.openstax_sections || [];

    if (sections.length > 0) {
      for (const osio of sections) {
        if (!cache[osio]) {
          const teksti = await haeOpenstaxOsio(osio);
          cache[osio] = teksti || '';
          cacheMuuttui = true;
        }
        if (cache[osio]) kontekstiPalat.push(cache[osio]);
      }
      const luvut = Array.from(new Set(sections.map(function(s) { return s.split('.')[0]; })));
      for (const luku of luvut) {
        const avain = 'ch' + luku;
        if (!(avain in cache)) {
          const teksti = await haeLuvunHarjoitussivut(luku);
          cache[avain] = teksti || '';
          cacheMuuttui = true;
        }
        if (cache[avain]) kontekstiPalat.push(cache[avain]);
      }
    } else if (aihe.materiaali_teksti) {
      kontekstiPalat.push(aihe.materiaali_teksti);
    }

    if (kontekstiPalat.length === 0) {
      return res.status(400).json({ error: 'Tälle aiheelle ei ole materiaalia harjoitustehtävän pohjaksi', kayttajalle: true });
    }

    if (cacheMuuttui) {
      await supabaseFetch('opinto_aiheet?id=eq.' + aiheId, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ openstax_cache: cache }),
      });
    }

    const aiemmatRes = await supabaseFetch('harjoitustehtavat?aihe_id=eq.' + aiheId + '&select=skenaario&order=luotu_at.desc&limit=20');
    const aiemmatRows = await aiemmatRes.json();
    const aiemmatSkenaariot = (Array.isArray(aiemmatRows) ? aiemmatRows : []).map(function(r) { return r.skenaario; }).filter(Boolean);

    const userPrompti = 'Topic: ' + aihe.name + '\n\n' +
      'Relevant textbook sections:\n---\n' + kontekstiPalat.join('\n---\n') + '\n---\n\n' +
      'Problems already generated for this topic (do not repeat these scenarios):\n' +
      (aiemmatSkenaariot.length > 0 ? aiemmatSkenaariot.join('\n') : '(none yet)') + '\n\n' +
      'Generate one new problem.';

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500,
        system: rakennaSystemPrompti(pacerVaihe),
        messages: [{ role: 'user', content: userPrompti }],
      }),
    });
    const anthropicData = await anthropicRes.json();
    if (!anthropicRes.ok) {
      console.error('[luo-harjoitustehtava] Anthropic-virhe:', anthropicRes.status, JSON.stringify(anthropicData.error || {}));
      return res.status(502).json({ error: 'Tehtävän luonti epäonnistui — yritä uudelleen' });
    }
    const raakaTeksti = (anthropicData.content || []).map(function(block) { return block.text || ''; }).join('');
    const tehtava = parseAiJson(raakaTeksti);
    if (!tehtava || !tehtava.kysymys || !tehtava.ratkaisu) {
      console.error('[luo-harjoitustehtava] Vastauksen jäsennys epäonnistui:', raakaTeksti.slice(0, 500));
      return res.status(502).json({ error: 'Tehtävän luonti epäonnistui — yritä uudelleen' });
    }

    const insertRes = await supabaseFetch('harjoitustehtavat', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        aihe_id: aiheId,
        kurssi_id: aihe.kurssi_id,
        pacer_vaihe: pacerVaihe,
        kysymys: tehtava.kysymys,
        ratkaisu: tehtava.ratkaisu,
        vihje: tehtava.vihje || null,
        skenaario: tehtava.skenaario || null,
        owner_id: userId,
      }),
    });
    const insertRows = await insertRes.json();
    const uusi = Array.isArray(insertRows) ? insertRows[0] : null;
    if (!insertRes.ok || !uusi) {
      console.error('[luo-harjoitustehtava] Tallennus epäonnistui:', JSON.stringify(insertRows));
      return res.status(500).json({ error: 'Tehtävän tallennus epäonnistui' });
    }

    return res.status(200).json({ id: uusi.id, kysymys: uusi.kysymys, vihje: uusi.vihje });
  } catch (e) {
    console.error('[luo-harjoitustehtava] Odottamaton virhe:', e.message);
    return res.status(500).json({ error: 'Tehtävän luonti epäonnistui' });
  }
};
