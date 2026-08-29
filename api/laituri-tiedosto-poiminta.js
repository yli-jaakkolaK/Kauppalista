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
// pdf: KAKSI reittiä, ei vain yksi (2026-08-29, Katrin tarve: 185-sivuinen
// matikkakirja, ei API-saldoa juuri nyt) —
//   1) PAIKALLINEN (pdf-parse, ei mitään verkkokutsua ulos) — pdf.js:n
//      päälle rakennettu tekstikerroksen poiminta, EI vaadi Anthropic-
//      saldoa eikä ANTHROPIC_API_KEYä ollenkaan. Ei myöskään 100 sivun
//      rajaa (se rajoitus tulee VAIN Anthropicin document-API:n omasta
//      rajasta, ei mistään paikallisesta syystä). Karkeampi kuin Anthropic-
//      reitti monimutkaisen asettelun/kaavojen kanssa (lukee vain tekstin,
//      ei "näe" sivua), mutta riittää tavalliselle leipätekstille.
//   2) ANTHROPIC (Messages API, document-lohko) — parempi laatu (näkee
//      sivun, osaa taulukot/asettelun paremmin), mutta vaatii saldoa ja
//      rajoittuu 100 sivuun (platform.claude.com, tarkistettu 2026-08-11).
// Valinta: jos sivumäärä (pdf-parse kertoo sen ilmaiseksi samalla poiminta-
// ajolla) ylittää 100, mennään SUORAAN paikalliseen — Anthropic-yritys
// epäonnistuisi joka tapauksessa, turha kutsu. Muuten yritetään ensin
// Anthropicia (parempi laatu) ja jos SE epäonnistuu MISTÄ TAHANSA syystä
// (saldo, raja, verkko), pudotaan automaattisesti paikalliseen sen sijaan
// että koko poiminta epäonnistuisi — tiedosto ei silti koskaan jää ilman
// tekstiä pelkän tilapäisen API-ongelman takia. Vastaus kertoo kummalla
// tavalla teksti lopulta saatiin (menetelma), jotta selain voi kertoa
// käyttäjälle jos tulos on karkeampi.
// pptx: jszip purkaa zip-paketin, <a:t>-tekstisolmut jokaisesta
// ppt/slides/slideN.xml:stä, dian numeron mukaan järjestettynä.

const JSZip = require('jszip');
const pdfParse = require('pdf-parse');

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ALY_MALLI || 'claude-sonnet-4-6';
const PDF_MAX_TAVUA = 32 * 1024 * 1024;
const PDF_ANTHROPIC_MAX_SIVUA = 100;

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

async function poimiPdfTekstiAnthropic(tavut) {
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
    throw new Error('Anthropic-poiminta epäonnistui: ' + response.status);
  }
  return (data.content || []).map(function(block) { return block.text || ''; }).join('');
}

// Paikallinen poiminta pdf.js:n päälle rakennetulla pdf-parse-kirjastolla —
// EI mitään verkkokutsua ulos, ei siis Anthropic-saldoa eikä 100 sivun
// rajaa. Karkeampi monimutkaisen asettelun/kaavojen kanssa (lukee vain
// tekstikerroksen) mutta täysin riittävä tavalliselle leipätekstille.
async function poimiPdfTekstiPaikallisesti(tavut) {
  const tulos = await pdfParse(tavut);
  return { teksti: tulos.text, sivuja: tulos.numpages };
}

// Orkestroi kahden PDF-poimintatavan valinnan (ks. tiedoston yläkommentti).
// Palauttaa AINA jotain jos tiedosto ylipäätään on kelvollinen PDF —
// tilapäinen Anthropic-ongelma (saldo/raja/verkko) ei koskaan estä
// paikallista tulosta, koska se on jo laskettu valmiiksi sivumäärän
// selvittämistä varten.
async function poimiPdfTeksti(tavut) {
  if (tavut.length > PDF_MAX_TAVUA) {
    const virhe = new Error('PDF on liian iso (' + Math.round(tavut.length / 1024 / 1024) + ' MB, raja 32 MB)');
    virhe.kayttajalle = true;
    throw virhe;
  }
  const paikallinen = await poimiPdfTekstiPaikallisesti(tavut);

  if (!ANTHROPIC_API_KEY || paikallinen.sivuja > PDF_ANTHROPIC_MAX_SIVUA) {
    return { teksti: paikallinen.teksti, menetelma: 'paikallinen' };
  }
  try {
    const teksti = await poimiPdfTekstiAnthropic(tavut);
    return { teksti: teksti, menetelma: 'anthropic' };
  } catch (e) {
    console.error('[laituri-tiedosto-poiminta] Anthropic epäonnistui, käytetään paikallista poimintaa varalla:', e.message);
    return { teksti: paikallinen.teksti, menetelma: 'paikallinen' };
  }
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
  // ANTHROPIC_API_KEY EI ole enää pakollinen (2026-08-29) — pptx oli aina
  // riippumaton siitä, ja pdf osaa nyt myös paikallisen varareitin (ks.
  // poimiPdfTeksti). Puuttuva avain tarkoittaa vain ettei pdf-poiminta
  // yritä Anthropicia ensin, ei että koko reitti olisi käyttökelvoton.
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelistä' });
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
    if (mime_tyyppi === 'application/pdf') {
      const tulos = await poimiPdfTeksti(tavut);
      return res.status(200).json({ teksti: tulos.teksti, menetelma: tulos.menetelma });
    }
    if (mime_tyyppi === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      const teksti = await poimiPptxTeksti(tavut);
      return res.status(200).json({ teksti: teksti, menetelma: 'paikallinen' });
    }
    return res.status(400).json({ error: 'Tuntematon tiedostotyyppi poiminnalle: ' + mime_tyyppi });
  } catch (e) {
    console.error('[laituri-tiedosto-poiminta] Poiminta epäonnistui:', e.message);
    return res.status(e.kayttajalle ? 422 : 500).json({ error: e.kayttajalle ? e.message : 'Tekstin poiminta epäonnistui' });
  }
};
