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

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const HENKILO_ALLATIIVI = { katri: 'Katrille', juha: 'Juhalle' };

function tunnistaEhdotusLaukaisu(teksti, kohdeHenkilo) {
  const allatiivi = HENKILO_ALLATIIVI[kohdeHenkilo];
  if (!allatiivi) return null;
  const kuvio = new RegExp('^(?:laita\\s+)?' + allatiivi + '\\s*:\\s*(.+)$', 'is');
  const osuma = teksti.match(kuvio);
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

  return res.status(200).json({ success: true, ehdotettu: ehdotettu });
};
