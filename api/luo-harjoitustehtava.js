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

const { haeOpenstaxOsio, haeLuvunHarjoitussivut, jaaOsio } = require('./_lib/openstax-osiot');

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
  return 'You are a STEM tutor (mathematics and physics) generating practice problems\n' +
    'for an ICT engineering student (Finnish, adult learner).\n\n' +
    'The student is in the ' + pacerVaihe + ' phase:\n' +
    '- ' + PACER_KUVAUKSET.priming + '\n' +
    '- ' + PACER_KUVAUKSET.encoding + '\n' +
    '- ' + PACER_KUVAUKSET.retrieval + '\n' +
    '- ' + PACER_KUVAUKSET.connection + '\n\n' +
    'Generate TEN distinct problems at the appropriate level, batched into one\n' +
    'response (this minimizes API calls — the student works through them one at\n' +
    'a time over the following days/weeks).\n' +
    'The textbook sections and end-of-chapter problem sets provided below are for\n' +
    'CONTEXT ONLY — never copy an existing problem verbatim or reuse its exact\n' +
    'numbers. Always invent new scenarios and new numeric values, distinct from\n' +
    'both the source material and the "already generated" list below, AND\n' +
    'distinct from each other within this batch of ten.\n' +
    'Respond in JSON: { "ongelmat": [ { "skenaario": "...", "kysymys": "...", "ratkaisu": "...", "vihje": "..." }, ... ] }\n' +
    'with exactly 10 items in the ongelmat array.\n' +
    '- skenaario: 8-12 words capturing the scenario/setup and key numbers\n' +
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
      for (const merkinta of sections) {
        if (!cache[merkinta]) {
          const teksti = await haeOpenstaxOsio(merkinta);
          cache[merkinta] = teksti || '';
          cacheMuuttui = true;
        }
        if (cache[merkinta]) kontekstiPalat.push(cache[merkinta]);
      }
      // Ryhmitellään kirja+luku-pareittain (esim. "college-algebra-2e:ch2"),
      // koska useampi kirja voi käyttää samaa lukunumeroa (ks. jaaOsio).
      const lukuAvaimet = new Map();
      sections.forEach(function(merkinta) {
        const { kirja, osio } = jaaOsio(merkinta);
        const luku = osio.split('.')[0];
        lukuAvaimet.set(kirja + ':ch' + luku, { kirja, luku });
      });
      for (const [avain, tiedot] of lukuAvaimet) {
        if (!(avain in cache)) {
          const teksti = await haeLuvunHarjoitussivut(tiedot.kirja, tiedot.luku);
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
        max_tokens: 8000, // 10 tehtävää + täydet ratkaisut per erä (ks. yläkommentti)
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
    const vastaus = parseAiJson(raakaTeksti);
    const ongelmat = (vastaus && Array.isArray(vastaus.ongelmat)) ? vastaus.ongelmat.filter(function(o) { return o && o.kysymys && o.ratkaisu; }) : [];
    if (ongelmat.length === 0) {
      console.error('[luo-harjoitustehtava] Vastauksen jäsennys epäonnistui:', raakaTeksti.slice(0, 500));
      return res.status(502).json({ error: 'Tehtävän luonti epäonnistui — yritä uudelleen' });
    }

    // Koko 10 kpl -erä (tai vähemmän jos malli palautti harvemman) tallennetaan
    // KERRALLA jonossa=true (sarakkeen oletusarvo, ks. sql/144) — vain
    // ensimmäinen merkitään heti jonossa=false ja palautetaan käyttäjälle.
    // Loput odottavat seuraavia "Uusi tehtävä" -napautuksia (script.js hakee
    // ne suoraan Supabase-clientilla, ei tätä funktiota uudelleen kutsumalla).
    const insertRes = await supabaseFetch('harjoitustehtavat', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(ongelmat.map(function(o) {
        return {
          aihe_id: aiheId,
          kurssi_id: aihe.kurssi_id,
          pacer_vaihe: pacerVaihe,
          kysymys: o.kysymys,
          ratkaisu: o.ratkaisu,
          vihje: o.vihje || null,
          skenaario: o.skenaario || null,
          owner_id: userId,
        };
      })),
    });
    const insertRows = await insertRes.json();
    if (!insertRes.ok || !Array.isArray(insertRows) || insertRows.length === 0) {
      console.error('[luo-harjoitustehtava] Tallennus epäonnistui:', JSON.stringify(insertRows));
      return res.status(500).json({ error: 'Tehtävän tallennus epäonnistui' });
    }

    const jarjestetyt = insertRows.slice().sort(function(a, b) { return a.id - b.id; });
    const ensimmainen = jarjestetyt[0];
    const paivitysRes = await supabaseFetch('harjoitustehtavat?id=eq.' + ensimmainen.id, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ jonossa: false }),
    });
    if (!paivitysRes.ok) {
      console.error('[luo-harjoitustehtava] Ensimmäisen tehtävän jono-merkinnän poisto epäonnistui:', ensimmainen.id);
    }

    return res.status(200).json({ id: ensimmainen.id, kysymys: ensimmainen.kysymys, vihje: ensimmainen.vihje });
  } catch (e) {
    console.error('[luo-harjoitustehtava] Odottamaton virhe:', e.message);
    return res.status(500).json({ error: 'Tehtävän luonti epäonnistui' });
  }
};
