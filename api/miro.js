// Konsolidoitu Miro-endpoint (2026-08-17) — YKSI Vercel-funktio kaikelle
// Miro-liikenteelle, ei useita api/miro-*.js-tiedostoja (Vercel Hobby-tason
// 12 funktion katto, ks. muistiinpanot.md "Konsolidoitu 4 Vercel-funktiota
// yhdeksi"). Dispatch ?action=-parametrilla, sama kuvio kuin api/cron.js:ssä.
//
// Actionit tässä erässä: "callback" (Katrin kertaluonteisen OAuth-asennuksen
// viimeinen puuttuva pala, ks. SATAMA_SPEKSI.md / VAIHE2_JA_LISAYKSET_
// CODELLE.md "Miro") ja "setup-boards" (Board A/B-luonti). Muut toiminnot
// (kurssin Frame, retrieval-kierroksen Frame, muokkausloki) lisätään SAMAAN
// tiedostoon myöhemmin — EI uutta tiedostoa, vain uusi action.
//
// === Miksi tämä endpoint tarvitaan (Coden huomio, 2026-08-17) ===
// OAuth-koodin (authorization code) vaihto access/refresh-tokeneiksi PITÄÄ
// tapahtua palvelimella (vaatii client_secretin, joka ei koskaan saa näkyä
// selaimessa) — Miro ei anna Katrin "vain klikata läpi" ilman että jokin
// palvelin ottaa vastaan sen redirectin ja tekee vaihdon. Tämä tiedosto ON
// se palvelin.
//
// === Katrin asennusvaiheet tämän jälkeen ===
// 1. developers.miro.com → "Build an app" (ilmaistili).
// 2. Sovelluksen asetuksista "Redirect URI" = tämän endpointin osoite:
//      https://kauppalista-nine.vercel.app/api/miro?action=callback
//    (Miro vaatii TÄSMÄLLISEN täsmäyksen tähän — ei kauppatavaraa.)
// 2b. SAMOISSA asetuksissa, "Permissions"-välilehti: rastita VÄHINTÄÄN
//     boards:write (board/frame-luonti) ja boards:read (myöhempi muokkaus-
//     lokin luku ajanoton varmistukseen, §4.3). Puuttuva scope näkyy vasta
//     kun jotain yritetään tehdä ("insufficientPermissions") — tarkista
//     TÄSSÄ VAIHEESSA, ei jälkikäteen (löydetty käytännössä 17.8.2026).
// 3. Kopioi Client ID + Client Secret Vercelin ympäristömuuttujiin:
//      MIRO_CLIENT_ID, MIRO_CLIENT_SECRET
//    ja odota/tee uusi deploy (esim. tyhjä commit) että ne astuvat voimaan.
// 4. Käy selaimessa osoitteessa (korvaa CLIENT_ID omalla arvollasi):
//      https://miro.com/oauth/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=https%3A%2F%2Fkauppalista-nine.vercel.app%2Fapi%2Fmiro%3Faction%3Dcallback
//    Hyväksy valtuutus.
// 5. Miro ohjaa takaisin tähän endpointiin ?code=-parametrilla — tämä
//    tiedosto vaihtaa sen tokeneiksi ja TALLENTAA NE SUORAAN miro_tokens-
//    tauluun (ei manuaalista Vercel-kopiointia, ks. alla). Sivu näyttää
//    myönnetyt scope-oikeudet vahvistukseksi.
// 6. Jos scope-lista puuttuu boards:write:n (tai muun tarvittavan), palaa
//    vaiheeseen 2b, korjaa, ja tee vaihe 4 UUDELLEEN — vanha token ei
//    korjaannu itsestään, uusi valtuutus tarvitaan aina scope-muutoksen
//    jälkeen.
//
// Miksi tokenit tallennetaan SUORAAN eikä näytetä kopioitavaksi: sen sijaan
// että Katrin pitäisi muistaa päivittää sekä Vercelin ympäristömuuttujat
// ETTÄ miro_tokens-taulu joka kerta kun uudelleenvaltuutus tehdään (esim.
// scope-korjauksen jälkeen), tämä sivu ON jo palvelin ja kirjoittaa suoraan.
// Miksi EI asetukset-tauluun: sen RLS on auki KAIKILLE kirjautuneille
// (tarkistettu 17.8.2026) — sopii board_id/frame_id-viitteille (ei
// salaisuuksia) muttei OAuth-tokeneille. Pysyvä säilytys on OMA
// miro_tokens-taulu (sql/130) jonka RLS on päällä ILMAN YHTÄÄN policya —
// vain service-role (SUPABASE_SERVICE_KEY, sama kuin kaikki api/_lib-
// funktiot jo käyttävät) pääsee siihen käsiksi.
//
// Miksi ERI taulu tokeneille kuin Vercelin ympäristömuuttujat, vaikka
// alkuperäinen suunnitelma oli "vain env-muuttujat": Miron refresh_token
// KIERTYY (rotate) JOKA käytöllä — vanha mitätöityy heti kun uusi
// annetaan. Staattinen ympäristömuuttuja EI riitä pitkän aikavälin
// säilytykseen koska käynnissä oleva funktio ei voi kirjoittaa Verceliin.
// Katrin manuaalisesti Verceliin kopioimat MIRO_ACCESS_TOKEN/
// MIRO_REFRESH_TOKEN toimivat vain ALKUSIEMENENÄ (bootstrap) — ensimmäinen
// oikea API-kutsu lukee ne, virkistää tokenin, ja tallentaa tuloksen
// miro_tokens-tauluun, joka on siitä eteenpäin totuuden lähde.

const MIRO_TOKEN_URL = 'https://api.miro.com/v1/oauth/token';
const MIRO_API_URL = 'https://api.miro.com/v2';
const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabaseFetch(polku, valinnat) {
  valinnat = valinnat || {};
  return fetch(SUPABASE_URL + '/rest/v1/' + polku, Object.assign({}, valinnat, {
    headers: Object.assign({
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
    }, valinnat.headers),
  }));
}

async function haeTallennetutTokenit() {
  const vastaus = await supabaseFetch('miro_tokens?select=*&id=eq.1');
  const rivit = await vastaus.json();
  return Array.isArray(rivit) && rivit[0] ? rivit[0] : null;
}

async function tallennaTokenit(accessToken, refreshToken, expiresInS) {
  const expiresAt = new Date(Date.now() + expiresInS * 1000).toISOString();
  const res = await supabaseFetch('miro_tokens', {
    method: 'POST',
    headers: { Prefer: 'return=minimal,resolution=merge-duplicates' },
    body: JSON.stringify({ id: 1, access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) console.error('[miro] Tokenien tallennus miro_tokens-tauluun epäonnistui:', res.status, await res.text());
}

async function virkistaToken(refreshToken) {
  const clientId = process.env.MIRO_CLIENT_ID;
  const clientSecret = process.env.MIRO_CLIENT_SECRET;
  const vastaus = await fetch(MIRO_TOKEN_URL + '?' + new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  }), { method: 'POST' });
  const data = await vastaus.json();
  if (!vastaus.ok) {
    throw new Error('Miro-tokenin virkistys epäonnistui: ' + JSON.stringify(data));
  }
  await tallennaTokenit(data.access_token, data.refresh_token, data.expires_in);
  return data.access_token;
}

// Palauttaa käyttökelpoisen access_tokenin — lukee miro_tokens-taulusta jos
// olemassa, muuten alustaa sen Vercelin ympäristömuuttujista (ensimmäinen
// kutsu koskaan) ja virkistää heti jos vanhentumassa (< 5 min jäljellä,
// varapuskuri kutsun kestolle).
async function haeToimivaAccessToken() {
  let tallennettu = await haeTallennetutTokenit();
  if (!tallennettu) {
    const envAccess = process.env.MIRO_ACCESS_TOKEN;
    const envRefresh = process.env.MIRO_REFRESH_TOKEN;
    if (!envAccess || !envRefresh) {
      throw new Error('Ei tallennettuja tokeneita eikä MIRO_ACCESS_TOKEN/MIRO_REFRESH_TOKEN-ympäristömuuttujia — tee OAuth-asennus ensin (ks. tiedoston yläkommentti).');
    }
    // Alkusiemen: ei tiedetä tarkkaa vanhenemisaikaa, oletetaan varovasti
    // vanhentuneeksi heti jotta ensimmäinen kutsu virkistää ja tallentaa
    // oikean expires_at:in miro_tokens-tauluun.
    await tallennaTokenit(envAccess, envRefresh, 0);
    tallennettu = { access_token: envAccess, refresh_token: envRefresh, expires_at: new Date(0).toISOString() };
  }

  const jaljellaMs = new Date(tallennettu.expires_at).getTime() - Date.now();
  if (jaljellaMs < 5 * 60000) {
    return await virkistaToken(tallennettu.refresh_token);
  }
  return tallennettu.access_token;
}

// Miro-kutsun kääre: liittää Bearer-tokenin, yrittää kerran uudelleen
// virkistetyllä tokenilla jos vastaus on 401 (esim. toinen rinnakkainen
// kutsuja ehti jo virkistää saman refresh_tokenin, jolloin tämän kutsujan
// muistissa oleva access_token on jo vanhentunut vaikka expires_at näytti
// vielä olevan aikaa jäljellä).
async function miroFetch(polku, valinnat) {
  valinnat = valinnat || {};
  const token = await haeToimivaAccessToken();
  let vastaus = await fetch(MIRO_API_URL + polku, Object.assign({}, valinnat, {
    headers: Object.assign({ Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, valinnat.headers),
  }));
  if (vastaus.status === 401) {
    const tallennettu = await haeTallennetutTokenit();
    const uusiToken = await virkistaToken(tallennettu.refresh_token);
    vastaus = await fetch(MIRO_API_URL + polku, Object.assign({}, valinnat, {
      headers: Object.assign({ Authorization: 'Bearer ' + uusiToken, 'Content-Type': 'application/json' }, valinnat.headers),
    }));
  }
  return vastaus;
}

// Kertaluonteinen board-setup (§10.1, VAIHE2_JA_LISAYKSET_CODELLE.md
// "Miro"): Board A (encoding+overlearning, kaikki kurssit omina
// frameworkeina) + Board B (retrieval, Frame per kierros). Suojattu samalla
// jaetulla salaisuudella kuin muut cron-tyyppiset ylläpitoreitit
// (MUISTUTUKSET_CRON_SECRET, ?avain=) — estää satunnaisen uudelleenlaukaisun
// jos joku löytää URL:n, ei tarkoita että tätä ajettaisiin ajastetusti.
// Idempotentti: jos board_a_id/board_b_id on jo asetukset-taulussa, EI luo
// uusia — palauttaa olemassa olevat.
async function kasitteleSetupBoards(req, res) {
  const salaisuus = process.env.MUISTUTUKSET_CRON_SECRET;
  if (salaisuus && (req.query || {}).avain !== salaisuus) {
    return res.status(401).json({ error: 'Virheellinen tai puuttuva avain' });
  }

  const asetuksetRes = await supabaseFetch('asetukset?select=key,value&key=in.(miro_board_a_id,miro_board_b_id)');
  const olemassaOlevat = await asetuksetRes.json();
  const kartta = {};
  (Array.isArray(olemassaOlevat) ? olemassaOlevat : []).forEach(function(r) { kartta[r.key] = r.value; });

  async function luoTaiHaeBoard(avain, nimi) {
    if (kartta[avain]) return { id: kartta[avain], luotu: false };
    const luontiRes = await miroFetch('/boards', { method: 'POST', body: JSON.stringify({ name: nimi }) });
    const data = await luontiRes.json();
    if (!luontiRes.ok) throw new Error('Boardin "' + nimi + '" luonti epäonnistui: ' + JSON.stringify(data));
    const tallennusRes = await supabaseFetch('asetukset', {
      method: 'POST',
      headers: { Prefer: 'return=minimal,resolution=merge-duplicates' },
      body: JSON.stringify({ key: avain, value: data.id }),
    });
    if (!tallennusRes.ok) console.error('[miro] board_id-tallennus epäonnistui avaimelle ' + avain + ':', tallennusRes.status);
    return { id: data.id, luotu: true };
  }

  try {
    const boardA = await luoTaiHaeBoard('miro_board_a_id', 'Satama — Encoding + Overlearning');
    const boardB = await luoTaiHaeBoard('miro_board_b_id', 'Satama — Retrieval');
    return res.status(200).json({ success: true, board_a: boardA, board_b: boardB });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// Kirjautuneen käyttäjän tunnistus (sama malli kuin api/_lib/push-test.js:n
// haeKayttajaId) — create-frame kutsutaan normaalin sovelluskäytön aikana
// (Tehtävänäkymän avaus), ei admin-salaisuudella kuten setup-boards. Kumpi
// tahansa kirjautunut käyttäjä (Katri/Juha) saa luoda Frameja — ei
// omistajarajattua dataa, sama jaettu Miro-tila molemmille.
async function haeKayttajaId(userToken) {
  const vastaus = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!vastaus.ok) return null;
  const data = await vastaus.json();
  return data.id || null;
}

// Luo uuden Framen Board A:lle tai B:lle. EI idempotentti itsessään —
// kutsujan (script.js) vastuulla tarkistaa onko frame_id jo olemassa
// oikealle kohteelle (kurssi Board A:lla, kierrosnumero Board B:llä) ennen
// kutsua, koska "onko olemassa" -logiikka riippuu kummasta boardista on
// kyse (kurssi- vs. kierrosnumero-avain) — ei yhtä yhteistä sääntöä.
async function kasitteleCreateFrame(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST vaaditaan' });
  }
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const userId = token ? await haeKayttajaId(token) : null;
  if (!userId) {
    return res.status(401).json({ error: 'Ei kirjautunut' });
  }

  const body = req.body || {};
  const boardAvain = body.board === 'b' ? 'miro_board_b_id' : body.board === 'a' ? 'miro_board_a_id' : null;
  const otsikko = (body.title || '').trim();
  if (!boardAvain || !otsikko) {
    return res.status(400).json({ error: 'body.board ("a" tai "b") ja body.title vaaditaan' });
  }

  const boardIdRes = await supabaseFetch('asetukset?select=value&key=eq.' + boardAvain);
  const boardIdRivit = await boardIdRes.json();
  const boardId = Array.isArray(boardIdRivit) && boardIdRivit[0] ? boardIdRivit[0].value : null;
  if (!boardId) {
    return res.status(500).json({ error: 'Board ' + body.board + ' ei ole vielä olemassa — aja ensin ?action=setup-boards' });
  }

  try {
    const luontiRes = await miroFetch('/boards/' + boardId + '/frames', {
      method: 'POST',
      body: JSON.stringify({ data: { title: otsikko }, position: { x: 0, y: 0 } }),
    });
    const data = await luontiRes.json();
    if (!luontiRes.ok) throw new Error(JSON.stringify(data));
    return res.status(200).json({ success: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: 'Framen luonti epäonnistui: ' + e.message });
  }
}

async function kasitteleCallback(req, res) {
  const koodi = (req.query || {}).code;
  const virhe = (req.query || {}).error;

  if (virhe) {
    return res.status(400).send('<h1>Miro-valtuutus epäonnistui</h1><p>' + escapeHtml(String(virhe)) + '</p>');
  }
  if (!koodi) {
    return res.status(400).send('<h1>Ei koodia</h1><p>Tämä sivu on tarkoitettu vain Miron omaksi uudelleenohjaukseksi OAuth-valtuutuksen jälkeen — ei avattavaksi suoraan.</p>');
  }

  const clientId = process.env.MIRO_CLIENT_ID;
  const clientSecret = process.env.MIRO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).send('<h1>Puuttuvat ympäristömuuttujat</h1><p>MIRO_CLIENT_ID / MIRO_CLIENT_SECRET puuttuvat Vercelistä — lisää ne ensin (ks. tämän tiedoston yläkommentin vaihe 3) ja yritä uudelleen (huom: koodi on kertakäyttöinen, tarvitset uuden vaiheen 4 -linkin klikkauksen).</p>');
  }

  // redirect_uri TÄSSÄ pyynnössä pitää täsmätä TARKALLEEN siihen jota
  // käytettiin vaiheen 4 valtuutuslinkissä (Miron oma vaatimus).
  const protokolla = (req.headers['x-forwarded-proto'] || 'https');
  const isanta = req.headers.host;
  const redirectUri = protokolla + '://' + isanta + '/api/miro?action=callback';

  let vastaus, data;
  try {
    vastaus = await fetch(MIRO_TOKEN_URL + '?' + new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: koodi,
      redirect_uri: redirectUri,
    }), { method: 'POST' });
    data = await vastaus.json();
  } catch (e) {
    return res.status(502).send('<h1>Yhteys Miroon epäonnistui</h1><p>' + escapeHtml(e.message) + '</p>');
  }

  if (!vastaus.ok) {
    return res.status(400).send('<h1>Miro hylkäsi vaihdon</h1><pre>' + escapeHtml(JSON.stringify(data, null, 2)) + '</pre><p>Koodi on kertakäyttöinen ja lyhytikäinen — jos tämä epäonnistui, tee vaihe 4 (valtuutuslinkin klikkaus) uudelleen alusta.</p>');
  }

  // Tallennetaan SUORAAN miro_tokens-tauluun (2026-08-17, korjattu ensimmäisen
  // kokeilun jälkeen — alkuperäinen "näytä ruudulla, kopioi Verceliin käsin"
  // -malli olisi vaatinut Katrin muistavan PÄIVITTÄÄ myös miro_tokens-rivi
  // uudestaan joka kerta kun scope-asetuksia korjataan ja uudelleenvaltuutus
  // tehdään, koska haeToimivaAccessToken() lukee sitä ENNEN ympäristö-
  // muuttujia. Suorempi: tämä sivu on jo palvelin, kirjoittaa suoraan.
  await tallennaTokenit(data.access_token, data.refresh_token, data.expires_in || 3599);

  return res.status(200).send(
    '<h1>Valmis</h1>' +
    '<p>Tokenit tallennettu suoraan. Ei tarvitse kopioida mitään Verceliin — voit sulkea tämän välilehden.</p>' +
    '<p style="color:#666">Myönnetyt oikeudet (scope): ' + escapeHtml(data.scope || '(ei ilmoitettu)') + '</p>'
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

const ACTIONS = {
  callback: kasitteleCallback,
  'setup-boards': kasitteleSetupBoards,
  'create-frame': kasitteleCreateFrame,
};

module.exports = async function handler(req, res) {
  const action = (req.query || {}).action;
  const kohde = ACTIONS[action];
  if (!kohde) {
    return res.status(400).json({ error: 'Tuntematon tai puuttuva ?action= (sallitut: ' + Object.keys(ACTIONS).join(', ') + ')' });
  }
  return kohde(req, res);
};
