// Couple time proposal — accept/reject/edit, yhdistetty (2026-08-12) kolmesta
// erillisestä tiedostosta (parisuhdeaika-hyvaksy.js/-hylkaa.js/-muokkaa.js)
// Vercelin Hobby-tason 12 Serverless Function -rajan vuoksi (ks.
// muistiinpanot.md "Deploy-pipeline korjattu" 2026-08-12) — 13. funktio
// (laituri-tiedosto-poiminta.js) esti KAIKKI deployt yli viikon ajan. Kolme
// erillistä action-haaraa tässä yhdessä tiedostossa on nyt ainoa muutos,
// itse toiminnallisuus (kirjoitukset, tarkistukset, virheviestit) on
// koskematon kopio kolmesta alkuperäisestä.
//
// Kaikilla kolmella sama syy service_rolelle: ankkurit RLS (sql/029)
// rajoittaa select/update/delete-oikeudet `user_id = auth.uid()`:iin, joten
// käyttäjä ei voi koskaan lukea/kirjoittaa kumppaninsa riviä suoraan
// selaimesta — palvelin validoi kutsujan OMAN Supabase-session ensin, sitten
// käyttää service_rolea vain siihen mihin kutsuja on oikeutettu (sama kaava
// kuin api/aly.js:ssä).

const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PVM_RE = /^\d{4}-\d{2}-\d{2}$/;
const AIKA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

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

async function getUserId(userToken) {
  const res = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id || null;
}

// --- hyväksy (ent. parisuhdeaika-hyvaksy.js) ---
// Mutual-acceptance: kirjaa kutsujan oman hyväksynnän, tarkistaa onko
// kumppanin rivi (sama parisuhde_ryhma) jo hyväksytty. Ei KOSKAAN kirjoita
// kalenteriin itse (Periaate 8, "Yksi totuus, kaksi ikkunaa") — kertoo vain
// onko molemmat sanoneet kyllä, ja jos on, palauttaa saman
// {content, event_date, event_time} -muodon jonka client jo osaa muuttaa
// tapautettavaksi "vie kalenteriin" -linkiksi (kalenterisiltaUrl()).
async function hyvaksy(req, res, userId) {
  const { ankkuri_id } = req.body || {};
  if (!ankkuri_id) return res.status(400).json({ error: 'ankkuri_id puuttuu' });

  const rowRes = await supabaseFetch('ankkurit?select=id,user_id,source,parisuhde_ryhma,content,event_date,event_time&id=eq.' + ankkuri_id);
  const rows = await rowRes.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row || row.user_id !== userId || row.source !== 'parisuhdeaika') {
    return res.status(403).json({ error: 'Ei oikeutta tähän riviin' });
  }

  const markRes = await supabaseFetch('ankkurit?id=eq.' + ankkuri_id, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ parisuhde_hyvaksytty: true }),
  });
  if (!markRes.ok) {
    console.error('[parisuhdeaika/hyvaksy] Acceptance write failed id=' + ankkuri_id + ':', markRes.status, await markRes.text());
    return res.status(500).json({ error: 'Hyväksynnän tallennus epäonnistui' });
  }

  const partnerRes = await supabaseFetch('ankkurit?select=id,parisuhde_hyvaksytty&parisuhde_ryhma=eq.' + row.parisuhde_ryhma + '&user_id=neq.' + userId);
  const partnerRows = await partnerRes.json();
  const partner = Array.isArray(partnerRows) ? partnerRows[0] : null;

  if (!partner || !partner.parisuhde_hyvaksytty) {
    return res.status(200).json({ mutual: false });
  }

  // Molemmat hyväksyivät — suljetaan molemmat rivit erikseen (ei yhtenä
  // yhteisenä PATCHina) jotta kutsuja NÄKEE kalenterisilta-kortin heti
  // (parisuhde_kalenteri_nahty=true), mutta kumppani (jos hyväksyi
  // ENSIN) näkee sen script.js:n naytaOdottavatParisuhdeaikaKalenterit():n
  // kautta seuraavalla latauksella, ks. sql/114.
  const nytIso = new Date().toISOString();
  const [omaCloseRes, kumppaninCloseRes] = await Promise.all([
    supabaseFetch('ankkurit?id=eq.' + ankkuri_id, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ is_candidate: false, done: true, done_at: nytIso, parisuhde_kalenteri_nahty: true }),
    }),
    supabaseFetch('ankkurit?id=eq.' + partner.id, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ is_candidate: false, done: true, done_at: nytIso }),
    }),
  ]);
  const omaClosed = await omaCloseRes.json();
  const kumppaninClosed = await kumppaninCloseRes.json();
  if (!omaCloseRes.ok || !kumppaninCloseRes.ok || !Array.isArray(omaClosed) || omaClosed.length !== 1 || !Array.isArray(kumppaninClosed) || kumppaninClosed.length !== 1) {
    console.error('[parisuhdeaika/hyvaksy] Closing both rows after mutual acceptance did not affect exactly 1+1 rows, group=' + row.parisuhde_ryhma, omaCloseRes.status, kumppaninCloseRes.status, JSON.stringify(omaClosed), JSON.stringify(kumppaninClosed));
    // Hyväksyntä itsessään ONNISTUI ja ON molemminpuolinen — vain siivous jäi
    // kesken, joten mutual:true palautetaan silti (kalenterilinkki tulee joka
    // tapauksessa, jäljelle jäänyt candidate-rivi on harmiton jäänne).
  }

  return res.status(200).json({
    mutual: true,
    calendar: { content: row.content, event_date: row.event_date, event_time: row.event_time },
  });
}

// --- hylkää (ent. parisuhdeaika-hylkaa.js) ---
// Kummankaan puolelta tehty AKTIIVINEN hylkäys peruu ehdotuksen MOLEMMILTA —
// seuraava ehdotus nousee vasta kun rauhallisen päivän triggeri laukeaa
// luonnostaan uudelleen, ei heti. Passiivinen huomiotta jättäminen (ei
// hyväksyntää eikä hylkäystä) ei tee täällä mitään — tähän päädytään vain
// eksplisiittisestä napautuksesta.
async function hylkaa(req, res, userId) {
  const { ankkuri_id } = req.body || {};
  if (!ankkuri_id) return res.status(400).json({ error: 'ankkuri_id puuttuu' });

  const rowRes = await supabaseFetch('ankkurit?select=id,user_id,source,parisuhde_ryhma&id=eq.' + ankkuri_id);
  const rows = await rowRes.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row || row.user_id !== userId || row.source !== 'parisuhdeaika') {
    return res.status(403).json({ error: 'Ei oikeutta tähän riviin' });
  }

  const deleteRes = await supabaseFetch('ankkurit?parisuhde_ryhma=eq.' + row.parisuhde_ryhma, {
    method: 'DELETE',
    headers: { Prefer: 'return=representation' },
  });
  const deleted = await deleteRes.json();
  if (!deleteRes.ok) {
    console.error('[parisuhdeaika/hylkaa] Rejection delete failed group=' + row.parisuhde_ryhma + ':', deleteRes.status, JSON.stringify(deleted));
    return res.status(500).json({ error: 'Hylkäys epäonnistui' });
  }

  return res.status(200).json({ deleted: Array.isArray(deleted) ? deleted.length : 0 });
}

// --- muokkaa (ent. parisuhdeaika-muokkaa.js) ---
// Toiminnallisesti "hylkää vanha aika, ehdota uutta": kumppanin oma
// hyväksyntä nollataan aina (heidän pitää nähdä ja hyväksyä UUSI aika
// erikseen), muokkaajan oma hyväksyntä asetetaan todeksi (Katrin oma
// päätös: muokkaus = samalla oma hyväksyntä uudelle ajalle, jottei tarvitse
// painaa sekä Tallenna että Hyväksy erikseen).
async function muokkaa(req, res, userId) {
  const { ankkuri_id, event_date, event_time } = req.body || {};
  if (!ankkuri_id) return res.status(400).json({ error: 'ankkuri_id puuttuu' });
  if (!PVM_RE.test(event_date || '') || !AIKA_RE.test(event_time || '')) {
    return res.status(400).json({ error: 'Virheellinen päivä tai kellonaika' });
  }

  const rowRes = await supabaseFetch('ankkurit?select=id,user_id,source,parisuhde_ryhma,done&id=eq.' + ankkuri_id);
  const rows = await rowRes.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  // Sama omistus+lähdetarkistus kuin hyväksynnässä/hylkäyksessä — ja lisäksi
  // vahvistetuksi (done=true) mennyttä ehdotusta ei voi enää muokata, se on
  // jo kalenterisiltavaiheessa.
  if (!row || row.user_id !== userId || row.source !== 'parisuhdeaika') {
    return res.status(403).json({ error: 'Ei oikeutta tähän riviin' });
  }
  if (row.done) {
    return res.status(409).json({ error: 'Ehdotus on jo vahvistettu, ei voi enää muokata' });
  }

  const partnerRes = await supabaseFetch('ankkurit?select=id&parisuhde_ryhma=eq.' + row.parisuhde_ryhma + '&user_id=neq.' + userId);
  const partnerRows = await partnerRes.json();
  const partner = Array.isArray(partnerRows) ? partnerRows[0] : null;

  const omaRes = await supabaseFetch('ankkurit?id=eq.' + ankkuri_id, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ event_date: event_date, event_time: event_time, parisuhde_hyvaksytty: true }),
  });
  const oma = await omaRes.json();
  if (!omaRes.ok || !Array.isArray(oma) || oma.length !== 1) {
    console.error('[parisuhdeaika/muokkaa] Oman rivin päivitys epäonnistui id=' + ankkuri_id + ':', omaRes.status, JSON.stringify(oma));
    return res.status(500).json({ error: 'Muokkauksen tallennus epäonnistui' });
  }

  if (partner) {
    const kumppaninRes = await supabaseFetch('ankkurit?id=eq.' + partner.id, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ event_date: event_date, event_time: event_time, parisuhde_hyvaksytty: false }),
    });
    const kumppanin = await kumppaninRes.json();
    if (!kumppaninRes.ok || !Array.isArray(kumppanin) || kumppanin.length !== 1) {
      // Oma rivi ehti jo päivittyä — kumppanin rivi jää tässä tapauksessa
      // vanhaan aikaan/hyväksyntätilaan, mikä on epäjohdonmukainen mutta ei
      // vaarallinen (ei kadonnutta dataa, ei väärää "molemmat hyväksyivät"-
      // tilaa) — lokitetaan näkyväksi, ei kaadeta koko pyyntöä siitä.
      console.error('[parisuhdeaika/muokkaa] Kumppanin rivin päivitys epäonnistui id=' + partner.id + ':', kumppaninRes.status, JSON.stringify(kumppanin));
    }
  }

  return res.status(200).json({ ok: true });
}

const TOIMINNOT = { hyvaksy: hyvaksy, hylkaa: hylkaa, muokkaa: muokkaa };

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY puuttuu Vercelin ympäristömuuttujista' });
  }

  const toiminto = TOIMINNOT[(req.body || {}).action];
  if (!toiminto) {
    return res.status(400).json({ error: 'Tuntematon tai puuttuva action (hyvaksy/hylkaa/muokkaa)' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Ei kirjautunut' });
  const userId = await getUserId(token);
  if (!userId) return res.status(401).json({ error: 'Virheellinen tai vanhentunut kirjautuminen' });

  return toiminto(req, res, userId);
};
