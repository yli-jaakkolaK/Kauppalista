// Siri/pikakomento-reitti Laituriin (2026-07-18, ks. muistiinpanot.md
// "Laukaisusana Laiturissa"). api/add.js kirjoittaa VAIN Kauppalistalle eikä
// tarvitse tietää käyttäjää (Kauppalista-rivi on jaettu, user_id nullable) —
// Laituri on HENKILÖKOHTAINEN (laituri.user_id NOT NULL), joten tämä
// endpoint tarvitsee identiteetin: kumpikin perheenjäsen kutsuu tätä OMALLA
// Shortcutillaan, joka lähettää aina saman kiinteän "henkilo"-arvon
// ('katri'/'juha') pyynnön mukana — ei erillistä salaisuutta/tokenia, sama
// tietoinen valinta kuin api/add.js:ssä ("Siri API jätetään tarkoituksella
// ilman autentikointia"), koska osoitetta ei ole linkitetty julkisesti eikä
// väärinkäyttö tee mitään palautumatonta.
//
// Laukaisusana ("Juhalle:"/"laita Juhalle:", vastaavasti "Katrille:"
// toisinpäin) tunnistetaan TÄSMÄLLEEN samalla logiikalla kuin script.js:n
// tunnistaEhdotusLaukaisu() — ei jaettua moduulia selaimen ja Vercel-funktion
// välillä tässä projektissa, pidä nämä kaksi synkassa jos logiikka muuttuu.
// Osuma ohjaa murun ehdokkaaksi (uusi laituri-rivi lähettäjän kotina +
// ankkurit-ehdokas vastaanottajalle, sama kaksivaiheinen kirjoitus kuin
// ehdotaSisaltoToiselle() asiakaspuolella) — EI KOSKAAN suoraa "oikeaa"
// ankkuria toisen listaan, sama raja kuin napeilla tehdyssä ehdotuksessa.
//
// Heti-luokittelu (2026-07-19, ks. muistiinpanot.md "Laiturin äly-lajittelu"
// — "Yksi luukku" erä 1): Siri-murulle ei sovi odottaa yöajoa asti (kaupan
// tarvike ei odota yötä yli). Siksi TÄSSÄ endpointissa tehdään VÄLITTÖMÄSTI,
// heti murun tallennuksen jälkeen, sama luokittelu yhdellä murulla mitä
// api/aly-nightly.js tekee erässä — jaettu prompti/normalisointi tulee
// api/_lib/aly-classify.js:stä (ks. sen oma header-kommentti "miksi jaettu
// moduuli tässä yhdessä tapauksessa on OK"). Käytetään VAIN kun laukaisusana
// EI osunut (!ehdotusSisalto) — "laukaisusana VOITTAA": jos rivi meni jo
// delegointiputkeen, älyluokittelua ei edes yritetä sille. Luokittelun
// epäonnistuminen (verkko, Anthropic-virhe, jäsennysvirhe) EI SAA estää
// murun tallennuksen onnistumista käyttäjälle — muru on jo turvassa ennen
// luokittelua, joten virhe vain lokitetaan ja luokittelu jää tekemättä
// (muru pysyy silloin normaalisti kelvollisena seuraavalle yöajolle).

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 600;
// Sama oletus kuin api/aly-nightly.js:ssä (HETKI_ENNAKKO_PAIVAT_OLETUS) —
// säädettävä ilman koodimuutosta asetukset-taulun avaimella
// "hetki_ennakkopaivat", ks. laskeHetkiNakyvyys().
const HETKI_ENNAKKO_PAIVAT_OLETUS = 0;

const {
  buildClassifyPrompt,
  parseAiJson,
  normalizeMatch,
  laskeHetkiNakyvyys,
  onkoHetkiMennytOhi,
} = require('./_lib/aly-classify');

const HENKILO_ALLATIIVI = { katri: 'Katrille', juha: 'Juhalle' };

// KORJAUS (2026-07-19, "Siri-sanelu ei tuota kaksoispistettä" — ks.
// muistiinpanot.md, sama korjaus tehty script.js:n tunnistaEhdotusLaukaisu():iin,
// pidä synkassa): sanelu ei koskaan tuota kaksoispistettä, joten kaksi
// kuviota — kaksoispiste-muoto ennallaan, PLUS "laita "-etuliitteellinen
// muoto ilman kaksoispistettä (etuliite tekee tarkoituksen yksiselitteiseksi).
function tunnistaEhdotusLaukaisu(teksti, kohdeHenkilo) {
  const allatiivi = HENKILO_ALLATIIVI[kohdeHenkilo];
  if (!allatiivi) return null;
  const kaksoispisteKuvio = new RegExp('^(?:laita\\s+)?' + allatiivi + '\\s*:\\s*(.+)$', 'is');
  const ilmanKaksoispistettaKuvio = new RegExp('^laita\\s+' + allatiivi + '\\s+(.+)$', 'is');
  const osuma = teksti.match(kaksoispisteKuvio) || teksti.match(ilmanKaksoispistettaKuvio);
  if (!osuma) return null;
  const loppuosa = osuma[1].trim();
  return loppuosa || null;
}

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

async function markEvaluated(noteId, content) {
  const res = await supabaseFetch('aly_evaluated?on_conflict=laituri_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ laituri_id: noteId, content: content }),
  });
  if (!res.ok) {
    console.error('[laituri-add] Murun ' + noteId + ' merkintä käsitellyksi epäonnistui:', res.status, await res.text());
  }
  return res.ok;
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
    console.error('[laituri-add] Anthropic error:', response.status, JSON.stringify(data.error || {}));
    return null;
  }
  const text = (data.content || []).map(function(block) { return block.text || ''; }).join('');
  return parseAiJson(text);
}

// Yhden murun heti-luokittelu (ks. header-kommentti yllä). Palauttaa
// luokittelun ('kauppa'|'hetki'|'ikkuna'|null) diagnostiikkaa varten —
// koskaan ei heitä poikkeusta ulospäin, virhe vain lokitetaan ja
// palautetaan null, jotta murun tallennuksen onnistuminen ei koskaan
// riipu tästä.
async function classifyImmediately(muru) {
  if (!ANTHROPIC_API_KEY) return null;
  try {
    const prompt = buildClassifyPrompt([{ id: muru.id, content: muru.content, created_at: muru.created_at }]);
    const result = await callClaude(prompt, muru.user_id);
    const matches = (result && Array.isArray(result.matches)) ? result.matches : null;
    if (matches === null) {
      console.error('[laituri-add] Heti-luokittelu epäonnistui tai vastaus ei jäsentynyt murulle ' + muru.id + ' — jää seuraavan yöajon arvioitavaksi.');
      return null;
    }

    const rawMatch = matches.find(function(m) { return m && m.id === muru.id; });
    const match = rawMatch ? normalizeMatch(rawMatch) : null;
    if (!match) {
      await markEvaluated(muru.id, muru.content);
      return null;
    }

    if (match.category === 'kauppa') {
      const kauppaRes = await supabaseFetch('laituri?id=eq.' + muru.id, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ ai_kauppa_ehdotus: match.items }),
      });
      if (!kauppaRes.ok) {
        console.error('[laituri-add] Kauppaehdotuksen kirjaus epäonnistui murulle ' + muru.id + ':', kauppaRes.status, await kauppaRes.text());
        return null;
      }
      await markEvaluated(muru.id, muru.content);
      return 'kauppa';
    }

    const category = match.category;
    const resolvedDate = match.resolvedDate;

    if (category === 'hetki' && onkoHetkiMennytOhi(resolvedDate)) {
      await markEvaluated(muru.id, muru.content);
      return null;
    }

    let visibleFrom = null;
    if (category === 'hetki' && resolvedDate) {
      const ennakkoPaivia = parseInt(await getSetting('hetki_ennakkopaivat'), 10) || HETKI_ENNAKKO_PAIVAT_OLETUS;
      visibleFrom = laskeHetkiNakyvyys(resolvedDate, ennakkoPaivia);
    }

    const anchorRes = await supabaseFetch('ankkurit', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        content: match.content,
        source: 'aly',
        source_ref: String(muru.id),
        is_candidate: true,
        user_id: muru.user_id,
        event_time: match.time || null,
        event_date: resolvedDate || null,
        visible_from: visibleFrom,
      }),
    });
    if (!anchorRes.ok) {
      console.error('[laituri-add] Ehdokkaan luonti epäonnistui murulle ' + muru.id + ':', anchorRes.status, await anchorRes.text());
      return null;
    }
    const anchorRows = await anchorRes.json();
    const anchorId = Array.isArray(anchorRows) && anchorRows[0] ? anchorRows[0].id : null;

    const logRes = await supabaseFetch('aly_log', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        user_id: muru.user_id,
        action: 'suggest_anchor',
        description: 'Ehdotti ankkuria "' + match.content + '" Laiturin murusta (heti-luokittelu).',
        source_ref: String(muru.id),
        anchor_id: anchorId,
        category: category,
        deadline: match.deadline,
      }),
    });
    if (!logRes.ok) {
      console.error('[laituri-add] aly_log-kirjaus epäonnistui ehdokkaalle ' + anchorId + ':', logRes.status, await logRes.text());
    }
    return category;
  } catch (e) {
    console.error('[laituri-add] Heti-luokittelu heitti poikkeuksen murulle ' + muru.id + ':', e);
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }

  const { henkilo, sisalto } = req.body || {};
  if (!henkilo || !sisalto) {
    return res.status(400).json({ error: 'henkilo ja sisalto ovat pakollisia' });
  }
  const teksti = String(sisalto).trim();
  if (!teksti) {
    return res.status(400).json({ error: 'sisalto on tyhjä' });
  }

  const omistajatRes = await supabaseFetch('hytti_omistajat?select=henkilo,user_id');
  if (!omistajatRes.ok) {
    return res.status(500).json({ error: 'Henkilökartan haku epäonnistui' });
  }
  const omistajat = (await omistajatRes.json()) || [];
  const lahettaja = omistajat.find(function(r) { return r.henkilo === henkilo; });
  if (!lahettaja) {
    return res.status(400).json({ error: 'Tuntematon henkilo: ' + henkilo });
  }

  const vastaanottaja = omistajat.find(function(r) { return r.user_id !== lahettaja.user_id; });
  const ehdotusSisalto = vastaanottaja ? tunnistaEhdotusLaukaisu(teksti, vastaanottaja.henkilo) : null;
  const tallennettavaSisalto = ehdotusSisalto || teksti;

  const muruRes = await supabaseFetch('laituri', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ user_id: lahettaja.user_id, content: tallennettavaSisalto, status: 'uusi' }),
  });
  if (!muruRes.ok) {
    return res.status(500).json({ error: 'Murun luonti epäonnistui' });
  }
  const [muru] = await muruRes.json();

  let ehdotettu = false;
  if (ehdotusSisalto && vastaanottaja && muru) {
    const ankkuriRes = await supabaseFetch('ankkurit', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        content: tallennettavaSisalto,
        source: 'ehdotus',
        source_ref: String(muru.id),
        user_id: vastaanottaja.user_id,
        is_candidate: true,
        proposed_by: lahettaja.user_id,
      }),
    });
    ehdotettu = ankkuriRes.ok;
    if (!ankkuriRes.ok) {
      console.error('[laituri-add] Ehdotuksen lähetys epäonnistui, muru tallentui silti kotiin.');
    }
  }

  // Heti-luokittelu (ks. header-kommentti) — VAIN kun laukaisusana ei jo
  // osunut ("laukaisusana voittaa") ja muru todella tallentui.
  let luokittelu = null;
  if (!ehdotusSisalto && muru) {
    luokittelu = await classifyImmediately(muru);
  }

  return res.status(200).json({ success: true, ehdotettu: ehdotettu, luokittelu: luokittelu });
};
