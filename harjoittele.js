// Harjoittele-tehtävänäkymä (2026-08-29, ks. api/luo-harjoitustehtava.js ja
// api/nayta-ratkaisu.js). PACER-vaihe on toistaiseksi aina "encoding" —
// kytkentä aiheen omaan seurattuun vaiheeseen on myöhempi vaihe (Katrin
// build brief, kohta 6: "wire it to tracked progress later").
//
// SIIRRETTY OMAKSI TIEDOSTOKSEEN (2026-08-30, script.js:n pilkkomisen
// ensimmäinen askel, ks. muistin project_scriptjs_split_plan) — pelkkä
// fyysinen siirto, ei mitään sisällöllistä muutosta. avaaHarjoittele()
// käyttää script.js:ssä määriteltyjä globaaleja (db, naytaIlmoitus,
// ilmoitaKirjoitusvirheesta) samalla tavalla kuin ennenkin; nämä toimivat
// riippumatta siitä missä <script>-tagissa tämä tiedosto ladataan, koska
// funktion RUNKO suoritetaan vasta myöhemmin (käyttäjän avatessa kortin),
// ei heti latautuessa.
async function avaaHarjoittele(aihe) {
  const overlay = document.getElementById('harjoittele-overlay');
  const otsikko = document.getElementById('harjoittele-otsikko');
  const lataus = document.getElementById('harjoittele-lataus');
  const sisalto = document.getElementById('harjoittele-sisalto');
  const kysymysEl = document.getElementById('harjoittele-kysymys');
  const vihjeEl = document.getElementById('harjoittele-vihje');
  const ratkaisuEl = document.getElementById('harjoittele-ratkaisu');
  const vihjeBtn = document.getElementById('harjoittele-vihje-btn');
  const ratkaisuBtn = document.getElementById('harjoittele-ratkaisu-btn');
  const uusiBtn = document.getElementById('harjoittele-uusi-btn');
  const suljeBtn = document.getElementById('harjoittele-sulje-btn');
  const perustaVihje = document.getElementById('harjoittele-perusta-vihje');
  const osasinBtn = document.getElementById('harjoittele-osasin-btn');
  const enOsannutBtn = document.getElementById('harjoittele-en-osannut-btn');
  const tarkkuusEl = document.getElementById('harjoittele-tarkkuus');

  otsikko.textContent = '🧠 ' + aihe.name;
  // Perustaidot-aihe (esim. "1 - Fundamental Physics Skills") — EI "10 –
  // Momentum..." (siksi vaadittu välilyönti/viiva heti "1":n perässä, ei
  // pelkkä startsWith('1')).
  perustaVihje.style.display = /^1[\s\-–]/.test(aihe.name.trim()) ? 'block' : 'none';

  // PACER-vaihe ei ole enää käsin valittavissa (2026-08-29, Katrin pyyntö:
  // "the student never sees or touches it") — luetaan suoraan aiheen omasta
  // pacer_vaihe_nyt-sarakkeesta (ks. sql/145) ja etenee AUTOMAATTISESTI
  // (ks. tarkistaVaiheenEteneminen alla) — siksi let, ei const.
  let valittuVaihe = aihe.pacer_vaihe_nyt || 'encoding';
  const vaiheViestiEl = document.getElementById('harjoittele-vaihe-viesti');

  overlay.style.display = 'flex';

  // 5 ratkaisunpaljastusta nykyisessä vaiheessa -> automaattinen siirtymä
  // seuraavaan (Katrin pyyntö 2026-08-29: paljastukset, ei generointeja,
  // ovat etenemisen mittari — "how many problems you've actually engaged
  // with", ei kuinka monta on luotu). Viimeisessä vaiheessa (connection) ei
  // ole minne edetä, jää hiljaa paikalleen.
  const HARJOITTELE_VAIHE_JARJESTYS = ['priming', 'encoding', 'retrieval', 'connection'];
  async function tarkistaVaiheenEteneminen() {
    const { count, error: laskuError } = await db.from('harjoitustehtavat')
      .select('id', { count: 'exact', head: true })
      .eq('aihe_id', aihe.id)
      .eq('pacer_vaihe', valittuVaihe)
      .eq('ratkaisu_paljastettu', true);
    if (laskuError) { console.error('Paljastusten laskenta epäonnistui:', laskuError); return; }
    if ((count || 0) < 5) return;
    const nykyinenIndeksi = HARJOITTELE_VAIHE_JARJESTYS.indexOf(valittuVaihe);
    if (nykyinenIndeksi === -1 || nykyinenIndeksi === HARJOITTELE_VAIHE_JARJESTYS.length - 1) return;
    const seuraava = HARJOITTELE_VAIHE_JARJESTYS[nykyinenIndeksi + 1];
    const { error: paivitysError } = await db.from('opinto_aiheet').update({ pacer_vaihe_nyt: seuraava }).eq('id', aihe.id);
    if (paivitysError) { console.error('pacer_vaihe_nyt-päivitys epäonnistui:', paivitysError); return; }
    aihe.pacer_vaihe_nyt = seuraava;
    valittuVaihe = seuraava;
    vaiheViestiEl.textContent = 'Hyvä — siirryt seuraavaan vaiheeseen.';
    vaiheViestiEl.style.display = 'block';
  }

  // Itsearvion tarkkuuslukema (sql/151, 2026-08-30) — VAIN näkyvyyttä
  // varten, ei syötä mihinkään logiikkaan. Laskee nykyisen aihe+vaihe-parin
  // yli kaikki tehtävät joihin on annettu itsearvio (jonossa olevat/vielä
  // arvioimattomat eivät vaikuta osoittajaan eivätkä nimittäjään).
  async function paivitaTarkkuus() {
    const { data, error } = await db.from('harjoitustehtavat')
      .select('itse_arvioitu_oikein')
      .eq('aihe_id', aihe.id)
      .eq('pacer_vaihe', valittuVaihe)
      .not('itse_arvioitu_oikein', 'is', null);
    if (error || !data || data.length === 0) { tarkkuusEl.style.display = 'none'; return; }
    const oikein = data.filter(function(r) { return r.itse_arvioitu_oikein === true; }).length;
    tarkkuusEl.textContent = 'Tarkkuus tässä vaiheessa: ' + oikein + '/' + data.length + ' (' + Math.round(100 * oikein / data.length) + ' %)';
    tarkkuusEl.style.display = 'block';
  }

  async function tallennaItsearvio(oikein) {
    const tehtavaId = sisalto.dataset.tehtavaId;
    if (!tehtavaId) return;
    osasinBtn.disabled = true;
    enOsannutBtn.disabled = true;
    const { error } = await db.from('harjoitustehtavat').update({ itse_arvioitu_oikein: oikein }).eq('id', tehtavaId);
    if (ilmoitaKirjoitusvirheesta(error, 'Itsearvion tallennus')) {
      osasinBtn.disabled = false;
      enOsannutBtn.disabled = false;
      return;
    }
    (oikein ? osasinBtn : enOsannutBtn).textContent = oikein ? '✅ Merkitty' : '❌ Merkitty';
    paivitaTarkkuus();
  }
  osasinBtn.onclick = function() { tallennaItsearvio(true); };
  enOsannutBtn.onclick = function() { tallennaItsearvio(false); };

  // Käsin "Vaikeampi"-nappi (2026-08-29, Katrin pyyntö) — sama vaiheketju
  // kuin automaattisessa etenemisessä, mutta laukaistaan heti napautuksesta
  // eikä 5 paljastuksen jälkeen. Hyödyllinen kun aihe tuntuu jo liian
  // helpolta eikä halua odottaa laskuria (esim. helpot matikka-aiheet).
  const vaikeampiBtn = document.getElementById('harjoittele-vaikeampi-btn');
  async function siirrySeuraavaanVaiheeseen() {
    const nykyinenIndeksi = HARJOITTELE_VAIHE_JARJESTYS.indexOf(valittuVaihe);
    if (nykyinenIndeksi === -1 || nykyinenIndeksi === HARJOITTELE_VAIHE_JARJESTYS.length - 1) {
      naytaIlmoitus('Jo vaikeimmassa vaiheessa.');
      return;
    }
    const seuraava = HARJOITTELE_VAIHE_JARJESTYS[nykyinenIndeksi + 1];
    const { error: paivitysError } = await db.from('opinto_aiheet').update({ pacer_vaihe_nyt: seuraava }).eq('id', aihe.id);
    if (ilmoitaKirjoitusvirheesta(paivitysError, 'Vaiheen vaihto')) return;
    aihe.pacer_vaihe_nyt = seuraava;
    valittuVaihe = seuraava;
    await luoUusiTehtava();
  }

  // Käsin "Helpompi"-nappi (2026-08-30, Katrin pyyntö) — symmetrinen
  // Vaikeampi-napin kanssa, siirtää yhden PACER-vaiheen TAAKSEPÄIN heti.
  // Hyödyllinen kun automaattinen eteneminen (5 paljastusta) on vienyt liian
  // vaikeaan vaiheeseen eikä halua odottaa/vaihtaa aihetta kokonaan.
  const helpompiBtn = document.getElementById('harjoittele-helpompi-btn');
  async function siirryEdelliseenVaiheeseen() {
    const nykyinenIndeksi = HARJOITTELE_VAIHE_JARJESTYS.indexOf(valittuVaihe);
    if (nykyinenIndeksi <= 0) {
      naytaIlmoitus('Jo helpoimmassa vaiheessa.');
      return;
    }
    const edellinen = HARJOITTELE_VAIHE_JARJESTYS[nykyinenIndeksi - 1];
    const { error: paivitysError } = await db.from('opinto_aiheet').update({ pacer_vaihe_nyt: edellinen }).eq('id', aihe.id);
    if (ilmoitaKirjoitusvirheesta(paivitysError, 'Vaiheen vaihto')) return;
    aihe.pacer_vaihe_nyt = edellinen;
    valittuVaihe = edellinen;
    await luoUusiTehtava();
  }

  async function luoUusiTehtava() {
    sisalto.style.display = 'none';
    vihjeEl.style.display = 'none';
    ratkaisuEl.style.display = 'none';
    vaiheViestiEl.style.display = 'none';
    vihjeBtn.disabled = false;
    ratkaisuBtn.disabled = false;
    ratkaisuBtn.textContent = '👁 Näytä ratkaisu';
    osasinBtn.disabled = false;
    enOsannutBtn.disabled = false;
    osasinBtn.textContent = '✅ Osasin';
    enOsannutBtn.textContent = '❌ En osannut';
    lataus.style.display = 'block';
    lataus.textContent = 'Haetaan tehtävää...';

    // Jono ensin (2026-08-29, "minimising API calls") — yksi funktiokutsu
    // tuottaa 10 tehtävää kerralla (ks. api/luo-harjoitustehtava.js),
    // suurin osa niistä jää jonossa=true-tilaan odottamaan tulevia
    // napautuksia, jopa päiviä/viikkoja. Ei ratkaisu-saraketta mukaan tähän
    // hakuun — se paljastuu vasta api/nayta-ratkaisu.js:n kautta erikseen.
    const { data: jonorivit, error: jonoError } = await db.from('harjoitustehtavat')
      .select('id, kysymys, vihje')
      .eq('aihe_id', aihe.id)
      .eq('pacer_vaihe', valittuVaihe)
      .eq('jonossa', true)
      .order('id', { ascending: true })
      .limit(1);
    if (jonoError) console.error('Jonotehtävän haku epäonnistui:', jonoError);

    let tulos = null;
    if (jonorivit && jonorivit.length > 0) {
      const jonoRivi = jonorivit[0];
      const { error: jonoPaivitysError } = await db.from('harjoitustehtavat').update({ jonossa: false }).eq('id', jonoRivi.id);
      if (jonoPaivitysError) console.error('Jonotehtävän merkintä epäonnistui:', jonoPaivitysError);
      tulos = { id: jonoRivi.id, kysymys: jonoRivi.kysymys, vihje: jonoRivi.vihje };
    } else {
      lataus.textContent = 'Luodaan uusi tehtäväerä (10 kpl)...';
      const { data: sessionData } = await db.auth.getSession();
      const token = sessionData.session ? sessionData.session.access_token : null;
      try {
        const vastaus = await fetch('/api/luo-harjoitustehtava', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ aihe_id: aihe.id, pacer_vaihe: valittuVaihe }),
        });
        tulos = await vastaus.json();
        if (!vastaus.ok) {
          lataus.textContent = tulos.error || 'Tehtävän luonti epäonnistui';
          return;
        }
      } catch (e) {
        lataus.textContent = 'Tehtävän luonti epäonnistui — yritä uudelleen';
        return;
      }
    }

    lataus.style.display = 'none';
    sisalto.style.display = 'block';
    sisalto.dataset.tehtavaId = tulos.id;
    kysymysEl.textContent = tulos.kysymys;
    vihjeEl.textContent = tulos.vihje || '';
    paivitaTarkkuus();
  }

  vihjeBtn.onclick = function() {
    vihjeEl.style.display = vihjeEl.style.display === 'none' ? 'block' : 'none';
  };

  ratkaisuBtn.onclick = async function() {
    const tehtavaId = sisalto.dataset.tehtavaId;
    if (!tehtavaId) return;
    ratkaisuBtn.disabled = true;
    ratkaisuBtn.textContent = 'Haetaan...';
    const { data: sessionData } = await db.auth.getSession();
    const token = sessionData.session ? sessionData.session.access_token : null;
    try {
      const vastaus = await fetch('/api/nayta-ratkaisu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ tehtava_id: tehtavaId }),
      });
      const tulos = await vastaus.json();
      if (!vastaus.ok) {
        naytaIlmoitus(tulos.error || 'Ratkaisun haku epäonnistui');
        ratkaisuBtn.disabled = false;
        ratkaisuBtn.textContent = '👁 Näytä ratkaisu';
        return;
      }
      ratkaisuEl.textContent = tulos.ratkaisu;
      ratkaisuEl.style.display = 'block';
      ratkaisuBtn.textContent = '✓ Ratkaisu näkyvissä';
      tarkistaVaiheenEteneminen();
    } catch (e) {
      naytaIlmoitus('Ratkaisun haku epäonnistui — yritä uudelleen');
      ratkaisuBtn.disabled = false;
      ratkaisuBtn.textContent = '👁 Näytä ratkaisu';
    }
  };

  uusiBtn.onclick = luoUusiTehtava;
  vaikeampiBtn.onclick = siirrySeuraavaanVaiheeseen;
  helpompiBtn.onclick = siirryEdelliseenVaiheeseen;

  suljeBtn.onclick = function() {
    overlay.style.display = 'none';
  };

  await luoUusiTehtava();
}
