// Konsolidoitu Miro-endpoint (2026-08-17) — YKSI Vercel-funktio kaikelle
// Miro-liikenteelle, ei useita api/miro-*.js-tiedostoja (Vercel Hobby-tason
// 12 funktion katto, ks. muistiinpanot.md "Konsolidoitu 4 Vercel-funktiota
// yhdeksi"). Dispatch ?action=-parametrilla, sama kuvio kuin api/cron.js:ssä.
//
// TÄSSÄ ERÄSSÄ VAIN "callback" — Katrin kertaluonteisen OAuth-asennuksen
// (SATAMA_SPEKSI.md / VAIHE2_JA_LISAYKSET_CODELLE.md "Miro") viimeinen
// puuttuva pala. Muut toiminnot (board/frame-luonti, muokkausloki) lisätään
// SAMAAN tiedostoon myöhemmin kun tunnukset ovat olemassa — EI uutta
// tiedostoa, vain uusi action.
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
// 3. Kopioi Client ID + Client Secret Vercelin ympäristömuuttujiin:
//      MIRO_CLIENT_ID, MIRO_CLIENT_SECRET
//    ja odota/tee uusi deploy (esim. tyhjä commit) että ne astuvat voimaan.
// 4. Käy selaimessa osoitteessa (korvaa CLIENT_ID omalla arvollasi):
//      https://miro.com/oauth/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=https%3A%2F%2Fkauppalista-nine.vercel.app%2Fapi%2Fmiro%3Faction%3Dcallback
//    Hyväksy valtuutus.
// 5. Miro ohjaa takaisin tähän endpointiin ?code=-parametrilla — tämä
//    tiedosto vaihtaa sen tokeneiksi ja NÄYTTÄÄ ne KERRAN ruudulla.
// 6. Kopioi access_token/refresh_token Vercelin muuttujiin:
//      MIRO_ACCESS_TOKEN, MIRO_REFRESH_TOKEN
//    Sulje välilehti heti kopioinnin jälkeen — tokeneita ei tallenneta
//    minnekään tämän palvelimen toimesta, sivu on kertakäyttöinen.
//
// Miksi tokenit NÄYTETÄÄN eikä kirjoiteta suoraan Supabaseen: `asetukset`-
// taulun RLS on auki KAIKILLE kirjautuneille (auth.uid() is not null,
// tarkistettu 17.8.2026) — se sopii board_id/frame_id-viitteille (ei
// salaisuuksia) muttei OAuth-tokeneille, jotka saavat elää VAIN Vercelin
// ympäristömuuttujissa, ei koskaan missään client-luettavassa taulussa.

const MIRO_TOKEN_URL = 'https://api.miro.com/v1/oauth/token';

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

  return res.status(200).send(
    '<h1>Valmis — kopioi nämä Vercelin ympäristömuuttujiin NYT</h1>' +
    '<p>Tätä sivua ei voi avata uudelleen (koodi on jo käytetty). Kopioi molemmat, lisää Verceliin, sulje välilehti.</p>' +
    '<p><b>MIRO_ACCESS_TOKEN</b><br><code>' + escapeHtml(data.access_token || '') + '</code></p>' +
    '<p><b>MIRO_REFRESH_TOKEN</b><br><code>' + escapeHtml(data.refresh_token || '') + '</code></p>' +
    '<p style="color:#666">Voimassa ' + escapeHtml(String(data.expires_in || '?')) + ' sekuntia, mutta se ei haittaa — palvelinpuoli uusii access_tokenin automaattisesti refresh_tokenilla ennen jokaista kutsua kun se osa rakennetaan.</p>'
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

const ACTIONS = {
  callback: kasitteleCallback,
};

module.exports = async function handler(req, res) {
  const action = (req.query || {}).action;
  const kohde = ACTIONS[action];
  if (!kohde) {
    return res.status(400).json({ error: 'Tuntematon tai puuttuva ?action= (sallitut: ' + Object.keys(ACTIONS).join(', ') + ')' });
  }
  return kohde(req, res);
};
