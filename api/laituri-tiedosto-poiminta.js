// Tiedostoliitteen tekstinpoiminta (2026-08-11, CODE_vaihe1b.md §3.4).
//
// Kutsujärjestys (script.js): (1) selain lataa raakatiedoston SUORAAN
// Supabase Storageen (bucket "materiaali", ks. sql/116) supabase-js:llä,
// EI tämän reitin kautta — Vercelin serverless-funktioiden oletuspyyntökoko
// (~4.5MB) olisi liian pieni 32MB:n pdf:lle. (2) Tämä reitti saa vain
// PIENEN JSON-pyynnön (storage_polku + mime_tyyppi), lataa tiedoston
// service_rolella Storagesta palvelimen puolella, poimii tekstin, ja
// palauttaa VAIN tekstin (pieni vastaus). (3) Selain kirjoittaa laituri/
// laituri_tiedostot-rivit itse (RLS sallii, sama avoimuus kuin muillakin
// Laituri-kirjoituksilla) — tämä reitti ei koske tietokantaa ollenkaan,
// vain lukee Storagesta ja soittaa Anthropicille.
//
// pdf: Anthropicin Messages API, document-lohko, pyydetään koko teksti
// VERBAATIM (ei tiivistelmä — poimittu teksti syötetään myöhemmin AI-
// luokitteluun, joka tarvitsee täyden sisällön). Rajat (platform.claude.com,
// tarkistettu 2026-08-11): 32MB/pyyntö, 100 sivua meidän tasollamme.
// pptx: jszip purkaa zip-paketin, <a:t>-tekstisolmut jokaisesta
// ppt/slides/slideN.xml:stä, dian numeron mukaan järjestettynä.

const JSZip = require('jszip');

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ALY_MALLI || 'claude-sonnet-4-6';
const PDF_MAX_TAVUA = 32 * 1024 * 1024;

async function getUserId(userToken) {
  const res = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id || null;
}

async function lataaStoragesta(polku) {
  const res = await fetch(SUPABASE_URL + '/storage/v1/object/materiaali/' + polku, {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
  });
  if (!res.ok) throw new Error('Tiedoston lataus Storagesta epäonnistui: ' + res.status);
  return Buffer.from(await res.arrayBuffer());
}

async function poimiPdfTeksti(tavut) {
  if (tavut.length > PDF_MAX_TAVUA) {
    const virhe = new Error('PDF on liian iso (' + Math.round(tavut.length / 1024 / 1024) + ' MB, raja 32 MB)');
    virhe.kayttajalle = true;
    throw virhe;
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: tavut.toString('base64') } },
          { type: 'text', text: 'Palauta tämän dokumentin koko tekstisisältö sellaisenaan (verbaatim), ilman tiivistämistä tai kommentointia. Jos dokumentissa on selviä otsikoita/rakenteita, säilytä ne.' },
        ],
      }],
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('[laituri-tiedosto-poiminta] Anthropic PDF-virhe:', response.status, JSON.stringify(data.error || {}));
    const virhe = new Error(
      response.status === 400 && data.error && /page/i.test(data.error.message || '')
        ? 'PDF:ssä on liikaa sivuja (raja 100)'
        : 'PDF:n lukeminen epäonnistui'
    );
    virhe.kayttajalle = true;
    throw virhe;
  }
  return (data.content || []).map(function(block) { return block.text || ''; }).join('');
}

async function poimiPptxTeksti(tavut) {
  const zip = await JSZip.loadAsync(tavut);
  const diaTiedostot = Object.keys(zip.files)
    .filter(function(nimi) { return /^ppt\/slides\/slide\d+\.xml$/.test(nimi); })
    .sort(function(a, b) {
      const na = parseInt(a.match(/slide(\d+)\.xml/)[1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)[1], 10);
      return na - nb;
    });
  const diat = [];
  for (const nimi of diaTiedostot) {
    const xml = await zip.files[nimi].async('string');
    const tekstit = (xml.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [])
      .map(function(m) { return m.replace(/<\/?a:t>/g, ''); })
      .join(' ');
    diat.push(tekstit);
  }
  return diat.map(function(teksti, i) { return 'Dia ' + (i + 1) + ':\n' + teksti; }).join('\n\n');
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

  const { storage_polku, mime_tyyppi } = req.body || {};
  if (!storage_polku || !mime_tyyppi) {
    return res.status(400).json({ error: 'storage_polku tai mime_tyyppi puuttuu' });
  }

  try {
    const tavut = await lataaStoragesta(storage_polku);
    let teksti;
    if (mime_tyyppi === 'application/pdf') {
      teksti = await poimiPdfTeksti(tavut);
    } else if (mime_tyyppi === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      teksti = await poimiPptxTeksti(tavut);
    } else {
      return res.status(400).json({ error: 'Tuntematon tiedostotyyppi poiminnalle: ' + mime_tyyppi });
    }
    return res.status(200).json({ teksti: teksti });
  } catch (e) {
    console.error('[laituri-tiedosto-poiminta] Poiminta epäonnistui:', e.message);
    return res.status(e.kayttajalle ? 422 : 500).json({ error: e.kayttajalle ? e.message : 'Tekstin poiminta epäonnistui' });
  }
};
