// Konsolidoitu dispatcher (2026-08-17, Katrin pyyntö: "voiko jotain noista
// functions yhdistää yhdeksi") neljälle aiemmin ERILLISELLE Vercel-
// funktiolle: muistutukset-laheta, caldav-sync, aly-nightly, push-test.
// Vercel Hobby-taso sallii vain 12 serverless functionia — nämä neljä
// olivat 4 erillistä reittiä vaikka kolmea niistä (muistutukset-laheta,
// caldav-sync, aly-nightly) jo kutsuttiin SAMASTA GitHub Actions -cronista
// 5 min välein samalla jaetulla MUISTUTUKSET_CRON_SECRET:illä (ks.
// .github/workflows/muistutukset-cron.yml) — ei siis mitään syytä pitää
// niitä erillisinä deploymentteina. push-test liitettiin mukaan koska sillä
// on jo lähes identtinen push-lähetyskoodi muistutukset-laheta.js:n kanssa
// (ks. sen oma yläkommentti "Sama lähetyslogiikka kuin api/push-test.js").
//
// Itse toteutukset EIVÄT muuttuneet — vain FYYSINEN SIJAINTI muuttui
// (api/*.js -> api/_lib/*.js, alaviiva-etuliite jättää ne pois Vercelin
// automaattisesta reitityksestä, sama konventio kuin api/_lib/aly-classify.js
// jo käyttää). Tämä tiedosto on OHUT ohjaaja: lukee ?task=-parametrin ja
// kutsuu oikeaa handleria muuttumattomana. Jos jokin neljästä pitää joskus
// eriyttää takaisin omaksi funktiokseen (esim. suorituskykysyistä), se
// onnistuu siirtämällä sen tiedosto takaisin api/-juureen ilman että sen
// SISÄLTÖÄ tarvitsee koskea.
//
// Reitit (task-parametri):
//   ?task=muistutukset  — entinen api/muistutukset-laheta.js (GET, ?avain=)
//   ?task=caldav        — entinen api/caldav-sync.js (GET, ?avain= TAI käyttäjän oma Bearer-token)
//   ?task=aly-nightly   — entinen api/aly-nightly.js (GET, ?avain=)
//   ?task=push-test     — entinen api/push-test.js (POST, käyttäjän oma Bearer-token)

const muistutuksetHandler = require('./_lib/muistutukset-laheta');
const caldavHandler = require('./_lib/caldav-sync');
const alyNightlyHandler = require('./_lib/aly-nightly');
const pushTestHandler = require('./_lib/push-test');

const TASKIT = {
  muistutukset: muistutuksetHandler,
  caldav: caldavHandler,
  'aly-nightly': alyNightlyHandler,
  'push-test': pushTestHandler,
};

module.exports = async function handler(req, res) {
  const task = (req.query || {}).task;
  const kohde = TASKIT[task];
  if (!kohde) {
    return res.status(400).json({ error: 'Tuntematon tai puuttuva ?task= (sallitut: ' + Object.keys(TASKIT).join(', ') + ')' });
  }
  return kohde(req, res);
};
