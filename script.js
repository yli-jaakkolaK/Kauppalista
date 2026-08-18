// Yhdistetään Supabaseen
const { createClient } = supabase;
const db = createClient(
  'https://uctmxxeewoeydabuepye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG14eGVld29leWRhYnVlcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjI1NDYsImV4cCI6MjA5ODQ5ODU0Nn0.oJLbtc2BDTqwKu-Ih8ahZMM-s-XpqGvULV5ENGhDYJU'
);

function piilotaKaikkiNakymat() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'none';
  document.getElementById('laituri-view').style.display = 'none';
  document.getElementById('editori-view').style.display = 'none';
  document.getElementById('muistilaput-view').style.display = 'none';
  document.getElementById('varasto-view').style.display = 'none';
  document.getElementById('kalenteri-view').style.display = 'none';
  document.getElementById('asetukset-view').style.display = 'none';
  document.getElementById('hytti-view').style.display = 'none';
  document.getElementById('hytti-kortti-view').style.display = 'none';
  document.getElementById('teema-view').style.display = 'none';
  document.getElementById('vahdittu-view').style.display = 'none';
  document.getElementById('opinto-kurssi-view').style.display = 'none';
  document.getElementById('opinto-tehtava-view').style.display = 'none';
  document.getElementById('taitosolmu-view').style.display = 'none';
  document.getElementById('lapsi-view').style.display = 'none';
  piilotaAlapalkki();
}

function showLoginView() {
  piilotaKaikkiNakymat();
  document.getElementById('login-view').style.display = 'flex';
}

function showHomeView() {
  piilotaKaikkiNakymat();
  document.getElementById('home-view').style.display = 'block';
  naytaAlapalkki('ruori');
}

function showAppView() {
  piilotaKaikkiNakymat();
  document.getElementById('app-view').style.display = 'block';
}

function showLaituriView() {
  piilotaKaikkiNakymat();
  document.getElementById('laituri-view').style.display = 'block';
  naytaAlapalkki('laituri');
}

function showMuistilaputView() {
  piilotaKaikkiNakymat();
  document.getElementById('muistilaput-view').style.display = 'block';
  naytaAlapalkki('muistilaput');
}

function showVarastoView() {
  piilotaKaikkiNakymat();
  document.getElementById('varasto-view').style.display = 'block';
  naytaAlapalkki('varasto');
}

function showKalenteriView() {
  piilotaKaikkiNakymat();
  document.getElementById('kalenteri-view').style.display = 'block';
  naytaAlapalkki('kalenteri');
}

function showAsetuksetView() {
  piilotaKaikkiNakymat();
  document.getElementById('asetukset-view').style.display = 'block';
  naytaAlapalkki('asetukset');
}

// Hytin välilehdet (2026-08-11, CODE_vaihe1b.md §1b) — renderöidään
// listasta, ei kolmena kovakoodattuna nappina. Nyt/Kartta ovat siirrettyjä
// (sisältö koskematta), Reitti on uusi koti kurssiosiolle. Kartta-lataus
// laukaistaan vasta kun sille tabille SIIRRYTÄÄN (ei jokaisella Hytin
// avauksella) — sama "ei turhaa työtä piilossa olevalle sisällölle"
// -periaate kuin muillakin lazy-ladattavilla osioilla.
const HYTTI_VALILEHDET = [
  { id: 'nyt', nimi: 'Nyt' },
  { id: 'reitti', nimi: 'Reitti' },
  { id: 'loki', nimi: 'Loki' },
  { id: 'kartta', nimi: 'Kartta' },
];
let hyttiAktiivinenValilehti = 'nyt';

function piirraHyttiValilehdet() {
  const kontti = document.getElementById('hytti-valilehdet');
  kontti.innerHTML = '';
  HYTTI_VALILEHDET.forEach(function(v) {
    const nappi = document.createElement('button');
    nappi.className = 'kalenteri-tila-btn hytti-valilehti-btn' + (v.id === hyttiAktiivinenValilehti ? ' active' : '');
    nappi.textContent = v.nimi;
    nappi.addEventListener('click', function() { vaihdaHyttiValilehti(v.id); });
    kontti.appendChild(nappi);
  });
}

function vaihdaHyttiValilehti(id) {
  hyttiAktiivinenValilehti = id;
  piirraHyttiValilehdet();
  document.getElementById('hytti-tabi-nyt').style.display = id === 'nyt' ? 'block' : 'none';
  document.getElementById('hytti-tabi-reitti').style.display = id === 'reitti' ? 'block' : 'none';
  document.getElementById('hytti-tabi-loki').style.display = id === 'loki' ? 'block' : 'none';
  document.getElementById('hytti-tabi-kartta').style.display = id === 'kartta' ? 'block' : 'none';
  // Tehtävät/Sillat/Huoli siirtyivät Nyt-välilehdeltä Reittiin (2026-08-17).
  // Kortit siirtyi omaksi Loki-välilehdekseen (2026-08-18, §6b).
  //
  // Jokainen välilehti lataa NYT vain omansa (2026-08-18 korjaus, Katrin
  // raportoimat tuplat Nyt-sivulla) — lataaHyttiPaanakyma() (Reitin oma
  // lataaja) kutsui aiemmin myös lataaHyttiTanaanKaista():a JA
  // lataaOpintoPaivanAskeleet():ta, jotka MOLEMMAT renderöivät Nyt-tabin
  // omia elementtejä (#hytti-tanaan-osio, #nyt-loki) — se oli AINOA reitti
  // jolla Nyt sai sisältönsä avaaOsio({route:'hytti'}):n oletuspolulla,
  // koska tämä funktio ei aiemmin tehnyt mitään 'nyt':lle. Jos käyttäjä ehti
  // vaihtaa Reitti-tabille ennen tämän ensimmäisen kutsun valmistumista,
  // kaksi päällekkäistä kutsua saattoi renderöidä Nyt-tabin sisällön
  // kahdesti peräkkäin ilman että kumpikaan tyhjensi toisen jälkeä oikeassa
  // järjestyksessä — klassinen "kaksi rinnakkaista tyhjennä+täytä-kutsua"
  // -kilpa-ajo (Katrin raportoimat tuplat Nyt-sivulla).
  if (id === 'nyt') { paivitaHyttiTyoVapaaLabel(); lataaHyttiTanaanKaista(); lataaOpintoPaivanAskeleet(); naytaHuomisenEsikatselu(); }
  if (id === 'reitti') lataaHyttiPaanakyma();
  if (id === 'loki') lataaLoki();
  if (id === 'kartta') lataaOpintoKartta();
}

function showHyttiView(valilehti) {
  piilotaKaikkiNakymat();
  document.getElementById('hytti-view').style.display = 'block';
  naytaAlapalkki('hytti');
  vaihdaHyttiValilehti(valilehti || 'nyt');
}

function showHyttiKorttiView() {
  piilotaKaikkiNakymat();
  document.getElementById('hytti-kortti-view').style.display = 'block';
}

// === ALAPALKKI (2026-08-11, Ruori-speksi §5) === kiinteä, identtinen
// seitsemässä päänäkymässä (Ruori/Laituri/Kalenteri/Hytti/Muistilaput/
// Varasto/Asetukset) — EI syvissä alanäkymissä, niissä on jo oma takaisin-
// nuoli. Neljä ylintä alapalkkiJarjestys-taulukosta ovat kiinnitettyjä,
// loput kolme ⋯:n takana järjestysarkissa (§5.2). Kuvakkeet ovat
// TARKOITUKSELLA värillisiä (poikkeus design-kuvaukseen, ks.
// satama-design-kuvaus.md "Alapalkin poikkeus").
const ALAPALKKI_IKONIT = {
  ruori: '<svg viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="8.5" stroke="var(--messinki)" stroke-width="2.4"/><circle cx="14" cy="14" r="2" fill="var(--messinki)"/><path d="M22.5 14L26 14M20 20L22.5 22.5M14 22.5L14 26M8 20L5.5 22.5M5.5 14L2 14M8 8L5.5 5.5M14 5.5L14 2M20 8L22.5 5.5" stroke="var(--messinki)" stroke-width="2.4" stroke-linecap="round"/></svg>',
  // Alkuperäiset ikonit palautettu käyttöön (2026-08-11, Katrin pyyntö) —
  // samat emoji-merkit kuin vanhassa navigointiruudukossa (ks.
  // sql/008_home_sections.sql:n icon-sarake), ei uusia käsinpiirrettyjä
  // SVG:itä. Ruori ja Kalenteri jätetty ennalleen: Ruorilla ei ole
  // ruudukossa vastinetta (ei linkkaa itseensä) ja aiemmin todettu
  // toimivaksi, Kalenterilla on jo sama elävä päivä-käytös kuin
  // ruudukossakin (ei pelkkä 🗓️-emoji siellä sen enempää).
  laituri: '<span class="alapalkki-emoji">🛟</span>',
  // Korvattu (2026-08-12, Katrin pyyntö: "täsmälleen sama kalenterikuvake
  // kuin ruudukossa") käsinpiirretyllä SVG-versiolla kokeillun sijaan —
  // sama muotokieli kuin ruudukon (nyk. poistettu, ks. §2x3-ruudukon poisto
  // alla) .tile-icon-kalenteri käytti: messinki/sinappi-reunus, KUUKAUDEN
  // lyhenne täyttötaustaisessa yläraidassa (EI viikonpäivä — se oli väärä
  // lukema tähän kuvakkeeseen alunperin), iso päivänumero alla. Arvot
  // täytetään paivitaAlapalkkiKalenteriPaiva():ssa data-role-attribuuttien
  // kautta. Pallura (2026-08-18, ruudukon poiston yhteydessä siirretty tänne
  // ks. paivitaKalenteriBadge()) elää samassa .alapalkki-tabi-pinta-
  // kehyksessä, ei omana elementtinään ALAPALKKI_IKONIT-merkkijonon
  // ulkopuolella — siksi se lisätään erikseen luoAlapalkkiNappi():ssa.
  kalenteri: '<span class="alapalkki-kal-ikoni"><span class="alapalkki-kal-kk" data-role="alapalkki-kal-kk"></span><span class="alapalkki-kal-pv" data-role="alapalkki-kal-pv"></span></span>',
  hytti: '<span class="alapalkki-emoji">🚪</span>',
  muistilaput: '<span class="alapalkki-emoji">🗒️</span>',
  varasto: '<span class="alapalkki-emoji">📦</span>',
  asetukset: '<span class="alapalkki-emoji">⚙️</span>',
  lisaa: '<svg viewBox="0 0 28 28" fill="none"><circle cx="8" cy="14" r="2" fill="var(--vaimea)"/><circle cx="14" cy="14" r="2" fill="var(--vaimea)"/><circle cx="20" cy="14" r="2" fill="var(--vaimea)"/></svg>',
};
const ALAPALKKI_NIMET = { ruori: 'Ruori', laituri: 'Laituri', kalenteri: 'Kalenteri', hytti: 'Hytti', muistilaput: 'Muistilaput', varasto: 'Varasto', asetukset: 'Asetukset' };
const ALAPALKKI_OLETUS_JARJESTYS = ['ruori', 'laituri', 'kalenteri', 'hytti', 'muistilaput', 'varasto', 'asetukset'];
let alapalkkiJarjestys = ALAPALKKI_OLETUS_JARJESTYS.slice();
let alapalkkiAktiivinen = 'ruori';

function alapalkkiSiirry(id) {
  if (id === 'ruori') { showHomeView(); lataaKotinakyma(); } else if (id === 'laituri') avaaOsio({ route: 'laituri' });
  else if (id === 'kalenteri') avaaOsio({ route: 'kalenteri' });
  else if (id === 'hytti') avaaOsio({ route: 'hytti' });
  else if (id === 'muistilaput') { showMuistilaputView(); lataaMuistilaput(); }
  else if (id === 'varasto') { showVarastoView(); lataaVarasto(); }
  else if (id === 'asetukset') avaaOsio({ route: 'asetukset' });
}

// Asetukset-taulun key-value-rivi, sama kaava kuin muuallakin (esim.
// paivan_menoraja) — JSON-taulukko seitsemästä id:stä järjestyksessä.
async function lataaAlapalkkiJarjestys() {
  const { data, error } = await db.from('asetukset').select('value').eq('key', 'alapalkki_jarjestys').maybeSingle();
  if (error) { console.error('Alapalkin järjestyksen haku epäonnistui:', error); return; }
  if (data && data.value) {
    try {
      const jarjestys = JSON.parse(data.value);
      if (Array.isArray(jarjestys) && jarjestys.length === ALAPALKKI_OLETUS_JARJESTYS.length && ALAPALKKI_OLETUS_JARJESTYS.every(function(id) { return jarjestys.indexOf(id) !== -1; })) {
        // Ruori on aina kiinnitetty ensimmäiseksi (ks. piirraAlapalkki-kommentti)
        // — myös silloin kun aiemmin tallennettu järjestys (ennen tätä korjausta)
        // oli raahannut sen pois kiinnitetyistä.
        alapalkkiJarjestys = ['ruori'].concat(jarjestys.filter(function(id) { return id !== 'ruori'; }));
      }
    } catch (e) { /* virheellinen tallennettu JSON — pysytään oletusjärjestyksessä */ }
  }
}

async function tallennaAlapalkkiJarjestys() {
  const { error } = await db.from('asetukset').upsert({ key: 'alapalkki_jarjestys', value: JSON.stringify(alapalkkiJarjestys) }, { onConflict: 'key' });
  if (error) console.error('Alapalkin järjestyksen tallennus epäonnistui:', error);
}

function luoAlapalkkiNappi(id) {
  const nappi = document.createElement('button');
  nappi.className = 'alapalkki-tabi' + (id === alapalkkiAktiivinen ? ' aktiivinen' : '');
  nappi.dataset.id = id;
  nappi.title = ALAPALKKI_NIMET[id];
  nappi.setAttribute('aria-label', ALAPALKKI_NIMET[id]);
  // Painettavan pinnan säilö (2026-08-11, elävä testaus) — kuvake ISTUU
  // lämpimällä lasilla, se ei ole vain palkin tausta koko rivin verran.
  // Kalenterin pallura (2026-08-18) elää tämän pinnan KULMASSA, samalla
  // tavalla kuin poistetun 2x3-ruudukon .tile-badge teki laatan kulmassa —
  // vain kalenterilla toistaiseksi (Katrin päätös: Laituri/Asetukset-
  // pallurat EIVÄT siirry tänne nyt, ks. paivitaKalenteriBadge()).
  const pallura = id === 'kalenteri' ? '<span class="alapalkki-tabi-badge" data-role="alapalkki-badge-kalenteri" style="display:none"></span>' : '';
  nappi.innerHTML = '<span class="alapalkki-tabi-pinta">' + (ALAPALKKI_IKONIT[id] || '') + pallura + '</span><span class="alapalkki-alleviiva"></span>';
  nappi.addEventListener('click', function() { alapalkkiSiirry(id); });
  return nappi;
}

// Täyttää sekä alapalkin että järjestysarkin kalenterikuvakkeet (kaikki
// data-role-osumat dokumentissa, ei vain kiinnitetyt) — sama kuukauden
// lyhenne + päivänumero kuin poistetun 2x3-navigointiruudukon
// .tile-icon-kalenteri käytti, KALENTERI_KUUKAUDET on sama jaettu vakio.
function paivitaAlapalkkiKalenteriPaiva() {
  const nyt = new Date();
  const kk = KALENTERI_KUUKAUDET[nyt.getMonth()].slice(0, 3).toUpperCase();
  const pv = nyt.getDate();
  document.querySelectorAll('[data-role="alapalkki-kal-kk"]').forEach(function(el) { el.textContent = kk; });
  document.querySelectorAll('[data-role="alapalkki-kal-pv"]').forEach(function(el) { el.textContent = pv; });
}

// Ruori on koko sovelluksen "koti" ja siksi AINA näkyvissä alapalkissa
// riippumatta käyttäjän raahaamasta järjestyksestä (2026-08-12, Katrin
// löydös: raahasi Ruorin vahingossa ⋯-arkin taakse eikä päässyt enää
// suoraan kotiin) — kiinnitetty ensimmäiseksi tässä, loput kolme
// kiinnitettyä paikkaa täyttyvät alapalkkiJarjestys-taulukon muista kuudesta.
function piirraAlapalkki() {
  const kontti = document.getElementById('alapalkki-kiinnitetyt');
  if (!kontti) return;
  kontti.innerHTML = '';
  kontti.appendChild(luoAlapalkkiNappi('ruori'));
  alapalkkiJarjestys.filter(function(id) { return id !== 'ruori'; }).slice(0, 3).forEach(function(id) { kontti.appendChild(luoAlapalkkiNappi(id)); });
  const lisaaNappi = document.createElement('button');
  lisaaNappi.className = 'alapalkki-tabi alapalkki-lisaa';
  lisaaNappi.title = 'Lisää';
  lisaaNappi.setAttribute('aria-label', 'Lisää');
  lisaaNappi.innerHTML = ALAPALKKI_IKONIT.lisaa + '<span class="alapalkki-alleviiva"></span>';
  lisaaNappi.addEventListener('click', avaaAlapalkkiArkki);
  kontti.appendChild(lisaaNappi);
  paivitaAlapalkkiKalenteriPaiva();
  paivitaKalenteriBadge();
}

function naytaAlapalkki(aktiivinenId) {
  alapalkkiAktiivinen = aktiivinenId;
  document.body.classList.add('has-alapalkki');
  const el = document.getElementById('alapalkki');
  if (el) el.style.display = 'flex';
  piirraAlapalkki();
}

function piilotaAlapalkki() {
  document.body.classList.remove('has-alapalkki');
  const el = document.getElementById('alapalkki');
  if (el) el.style.display = 'none';
}

// --- Järjestysarkki (§5.2) — raahattava lista kaikista seitsemästä,
// raja neljännen ja viidennen rivin välissä näyttää mikä jää kiinnitetyksi.
// Kevyt oma pointer-event-pohjainen raahaus (ei jaettu alustaRaahaus()-
// apuri, koska tämä ei ole Supabase-taulu-rivilista vaan yhden asetuksen
// paikallinen taulukko — ks. tallennaAlapalkkiJarjestys). ---
function avaaAlapalkkiArkki() {
  piirraAlapalkkiArkki();
  document.getElementById('alapalkki-arkki-overlay').style.display = 'flex';
}

function piirraAlapalkkiArkki() {
  const lista = document.getElementById('alapalkki-arkki-lista');
  lista.innerHTML = '';
  alapalkkiJarjestys.forEach(function(id, index) {
    const li = document.createElement('li');
    li.dataset.id = id;
    li.className = index === 3 ? 'alapalkki-raja-jalkeen' : '';
    // Ruori on kiinnitetty (ks. piirraAlapalkki) — näytetään silti täällä
    // täyden järjestyksen hahmottamiseksi, mutta ei raahattavissa pois
    // ensimmäiseltä paikalta.
    if (id === 'ruori') li.classList.add('alapalkki-kiinnitetty');
    const kuvake = document.createElement('span');
    kuvake.innerHTML = ALAPALKKI_IKONIT[id];
    li.appendChild(kuvake);
    const nimi = document.createElement('span');
    nimi.className = 'alapalkki-arkki-nimi';
    nimi.textContent = ALAPALKKI_NIMET[id];
    li.appendChild(nimi);
    const kahva = document.createElement('span');
    kahva.className = 'alapalkki-arkki-kahva';
    kahva.textContent = id === 'ruori' ? '' : '≡';
    li.appendChild(kahva);
    if (id === 'ruori') {
      li.addEventListener('click', function() {
        document.getElementById('alapalkki-arkki-overlay').style.display = 'none';
        alapalkkiSiirry('ruori');
      });
    } else {
      alustaAlapalkkiRaahaus(li);
    }
    lista.appendChild(li);
  });
  paivitaAlapalkkiKalenteriPaiva();
}

// Raahaus (2026-08-11 korjattu, elävä testaus §1.1) — ALKUPERÄINEN versio
// käytti pelkkää pointerdown/move/up:ia + CSS touch-action:none:ia, mikä ei
// riittänyt oikealla puhelimella: kosketus valitsi tekstiä raahauksen sijaan.
// Korvattu samalla kosketus/hiiri-tekniikalla jota loput sovelluksen
// raahattavat listat käyttävät jo toimivasti (ks. alustaRaahaus() alempana
// script.js:ssä — pitkä painallus ennen raahauksen alkua, passiivinen
// touchstart mutta ei-passiivinen touchmove jossa preventDefault() vasta kun
// raahaus on oikeasti käynnissä). RAAHAUS_VIIVE_MS/RAAHAUS_PERUUTUS_PX ja
// siirraRaahattavaKohtaan() ovat alustaRaahaus():n omia, geneerisiä apuja,
// uudelleenkäytetty sellaisenaan koska ne eivät koske Supabasea.
function alustaAlapalkkiRaahaus(li) {
  let ajastin = null;
  let alkuY = 0;
  let alkuX = 0;
  let raahausKaynnissa = false;
  let sivuutaSeuraavaKlikkaus = false;

  function pisteesta(e) { return e.touches ? e.touches[0] : e; }

  function paivitaRajaviiva() {
    const lista = document.getElementById('alapalkki-arkki-lista');
    Array.from(lista.children).forEach(function(el, i) {
      el.classList.toggle('alapalkki-raja-jalkeen', i === 3);
    });
  }

  function alkaa(e) {
    const piste = pisteesta(e);
    alkuY = piste.clientY;
    alkuX = piste.clientX;
    ajastin = setTimeout(function() {
      raahausKaynnissa = true;
      sivuutaSeuraavaKlikkaus = true;
      li.classList.add('dragging');
      if (navigator.vibrate) navigator.vibrate(15);
    }, RAAHAUS_VIIVE_MS);
    if (!e.touches) {
      document.addEventListener('mousemove', liikkuu);
      document.addEventListener('mouseup', loppuu, { once: true });
    }
  }

  function liikkuu(e) {
    const piste = pisteesta(e);
    const dx = Math.abs(piste.clientX - alkuX);
    const dy = Math.abs(piste.clientY - alkuY);
    if (!raahausKaynnissa && ajastin && (dx > RAAHAUS_PERUUTUS_PX || dy > RAAHAUS_PERUUTUS_PX)) {
      clearTimeout(ajastin);
      ajastin = null;
      return;
    }
    if (raahausKaynnissa) {
      e.preventDefault();
      siirraRaahattavaKohtaan(li, piste.clientY, document.getElementById('alapalkki-arkki-lista'));
      paivitaRajaviiva();
    }
  }

  function loppuu() {
    if (ajastin) { clearTimeout(ajastin); ajastin = null; }
    document.removeEventListener('mousemove', liikkuu);
    if (raahausKaynnissa) {
      raahausKaynnissa = false;
      li.classList.remove('dragging');
      const domJarjestys = Array.from(document.getElementById('alapalkki-arkki-lista').children).map(function(el) { return el.dataset.id; });
      // Ruori pakotetaan takaisin ensimmäiseksi tallennuksessa, vaikka raahaus
      // olisi siirtänyt sen DOM:ssa hetkellisesti muualle (ks. piirraAlapalkki).
      alapalkkiJarjestys = ['ruori'].concat(domJarjestys.filter(function(id) { return id !== 'ruori'; }));
      tallennaAlapalkkiJarjestys();
      piirraAlapalkki();
      piirraAlapalkkiArkki();
    }
  }

  li.addEventListener('touchstart', alkaa, { passive: true });
  li.addEventListener('touchmove', liikkuu, { passive: false });
  li.addEventListener('touchend', loppuu);
  li.addEventListener('touchcancel', loppuu);
  li.addEventListener('mousedown', alkaa);

  // BUGIKORJAUS (2026-08-11, Katrin löydös): arkin rivit vain raahasivat,
  // eivät vieneet mihinkään napautettaessa — Muistilaput/Varasto/Asetukset
  // olivat siis tavoittamattomissa aina kun ne olivat pisteiden takana eikä
  // käyttäjä sattunut järjestelemään palkkia. Napautus (ei raahaus) vie nyt
  // kohteeseen ja sulkee arkin — sama "pitkä painallus voittaa napautuksen"
  // -erottelu kuin alustaRaahaus():ssa (sivuutaSeuraavaKlikkaus).
  li.addEventListener('click', function(e) {
    if (sivuutaSeuraavaKlikkaus) {
      e.preventDefault();
      e.stopImmediatePropagation();
      sivuutaSeuraavaKlikkaus = false;
      return;
    }
    document.getElementById('alapalkki-arkki-overlay').style.display = 'none';
    alapalkkiSiirry(li.dataset.id);
  }, true);
}

document.getElementById('alapalkki-arkki-sulje').addEventListener('click', function() {
  document.getElementById('alapalkki-arkki-overlay').style.display = 'none';
});

// Muistaa mistä näkymästä (kategoriasta) nykyinen lista avattiin, jotta
// listanäkymän takaisin-nuoli palaa oikeaan paikkaan (Muistilaput vs. Varasto)
let listanAvausLahde = 'muistilaput';

const input = document.querySelector('#app-view .add-item input');
const button = document.querySelector('#app-view .add-item button');
const list = document.querySelector('#app-view .list');

let historyOpen = false;
let cachedTuotteet = [];
let currentUserId = null;
let currentList = null;
let aktiivinenOtsikkoId = null;
// Ruoka-välivaihe (2026-07-13): valintatila listan sisällä, jotta useita
// rivejä voi siirtää/kopioida Kauppalistalle kerralla ("Siirrä valitut").
let valintatilaPaalla = false;
let valitutTuoteIdt = new Set();
// Avain on "lähde:tunniste" (esim. "muistilaput:42"), koska sama tunniste
// voi periaatteessa esiintyä eri lähteissä (tuotteet.id vs. kalenterin id)
let ankkuroidutAvaimet = new Set();

// "Ankkurin ehdottaminen toiselle" (2026-07-16, ks. muistiinpanot.md) —
// perheenjäsenten henkilo<->user_id-kartta (sama hytti_omistajat-taulu jota
// kalenterin henkilökohtaiset syötteet jo käyttävät, luettavissa kenelle
// tahansa kirjautuneelle) kevyesti asiakaspuolelle, jotta "ehdota toiselle"
// -toiminto tietää KENELLE ehdottaa ilman kovakoodattua UUID:tä.
let toinenKayttaja = null; // { henkilo, user_id } tai null jos ei löytynyt
// Kirjautuneen OMA henkilo ('katri'/'juha') — lisätty 2026-08-05 Henkseleitä
// varten (script.js: omaHenkilo, käytössä henkselit-lomakkeella ja Hytti-
// eston resolvennissa). Sama hytti_omistajat-haku kuin toinenKayttaja jo
// tekee, ei uutta kyselyä — vain toinen puoli samasta tuloksesta.
let omaHenkilo = null;
async function paivitaHenkiloKartta() {
  const { data, error } = await db.from('hytti_omistajat').select('henkilo, user_id');
  if (error) {
    console.error('Henkilökartan haku epäonnistui:', error);
    return;
  }
  toinenKayttaja = (data || []).find(function(rivi) { return rivi.user_id !== currentUserId; }) || null;
  const omaRivi = (data || []).find(function(rivi) { return rivi.user_id === currentUserId; });
  omaHenkilo = omaRivi ? omaRivi.henkilo : null;
}
function henkiloNimi(henkilo) {
  return henkilo ? henkilo.charAt(0).toUpperCase() + henkilo.slice(1) : 'kumppanille';
}
// Ei-pysyvä muisti tämän istunnon aikana lähetetyistä ehdotuksista — estää
// vahinkokaksoisklikkauksen, EI kysele takaisin onko ehdotus hyväksytty/
// hylätty (ks. "hylkäys ei koskaan raportoidu lähettäjälle" -turvasääntö).
let ehdotetutTassaIstunnossa = new Set();

// BUGIKORJAUS (2026-07-18, "💬-ehdotuksen löydettävyys" — ks. muistiinpanot.md):
// Katri etsi "ehdota toiselle" -toimintoa 15 min Ankkureiden äärellä, koska
// delegointiajatus syntyy siellä ("tämä kuuluu toisen päivään" on ankkuri-ele)
// — mutta toiminto asui vain Laiturin rivikohtaisessa 💬-napissa. Lisätty KAKSI
// uutta lähtöpistettä Ankkureihin (lisäysvaihe + olemassa olevan oman ankkurin
// ⋯-valikko), molemmat kutsuvat tätä samaa jaettua pohjafunktiota. EI muutoksia
// Laiturin omaan 💬-nappiin (se käyttää OLEMASSA OLEVAA laituri-riviä kotina,
// tämä funktio sen sijaan LUO uuden — kaksi eri, molemmat oikeaa, tilannetta).
async function ehdotaSisaltoToiselle(sisalto) {
  if (!toinenKayttaja) return false;
  const { data: muru, error: muruError } = await db.from('laituri')
    .insert({ content: sisalto, user_id: currentUserId, status: 'uusi' })
    .select().single();
  if (muruError) {
    console.error('Ehdotuksen taustamurun luonti epäonnistui:', muruError);
    return false;
  }
  const { error } = await db.from('ankkurit').insert({
    content: sisalto,
    source: 'ehdotus',
    source_ref: String(muru.id),
    user_id: toinenKayttaja.user_id,
    is_candidate: true,
    proposed_by: currentUserId,
  });
  if (error) {
    console.error('Ehdotuksen lähetys epäonnistui:', error);
    return false;
  }
  return true;
}

// Laukaisusana Laiturissa (2026-07-18, ks. muistiinpanot.md "Laukaisusana
// Laiturissa") — "Juhalle:" tai "laita Juhalle:" RIVIN ALUSSA (Katrin päässä
// vastaavasti "Katrille:"/"laita Katrille:") ohjaa murun suoraan toisen
// ankkuriehdokkaaksi ehdotaSisaltoToiselle()-putkea pitkin, ilman että
// 💬-toimintoa tarvitsee koskea. Nimet KOVAKOODATTU allatiivimuotoineen (ei
// yritetä taivuttaa nimiä ohjelmallisesti — kahden hengen perheessä kiinteä
// taulukko on luotettavampi kuin yleinen suomen kielioppi). SAMA logiikka
// toistettu api/laituri-add.js:ssä Siri/pikakomento-reittiä varten (ei
// jaettua moduulia selaimen ja Vercel-funktion välillä tässä projektissa) —
// pidä nämä kaksi synkassa.
const HENKILO_ALLATIIVI = { katri: 'Katrille', juha: 'Juhalle' };

// UI-KORJAUS (2026-07-21, ks. muistiinpanot.md): korvaa väärän
// `henkiloNimi(x) + ':lle'`-kaavan (tuotti "Juha:lle" — kaksoispiste EI ole
// suomen kielioppia, oikea allatiivi on "Juhalle") kaikkialla missä nimi
// pitää taivuttaa ihmiselle näkyvässä viestissä. Käyttää samaa kovakoodattua
// taulukkoa kuin laukaisusanan tunnistus yllä.
function henkiloAllatiivi(henkilo) {
  return HENKILO_ALLATIIVI[henkilo] || (henkiloNimi(henkilo) + 'lle');
}

// Tunnistaa VAIN täsmällisen rivinalkuisen laukaisun — pelkkä nimen maininta
// tekstin sisällä ("juttelin Juhalle eilen") EI SAA osua. Epäselvässä
// tapauksessa (ei täsmää) palautetaan null — mieluummin ohittaa kuin ehdottaa
// väärin. Palauttaa laukaisusanasta riisutun sisällön, tai null.
//
// KORJAUS (2026-07-19, "Siri-sanelu ei tuota kaksoispistettä" — ks.
// muistiinpanot.md): Siri-sanelu ei koskaan tuota kaksoispistettä, joten
// "laita Juhalle vie roskat" ei laukaissut vaikka puhuttu tarkoitus on
// yksiselitteinen. Kaksi erillistä kuviota: (1) kaksoispiste-muoto ENNALLAAN,
// "laita "-etuliite valinnainen ("Juhalle: X" / "laita Juhalle: X"); (2)
// UUSI ilman kaksoispistettä, mutta VAIN kun "laita "-etuliite on mukana —
// juuri etuliite tekee tarkoituksen yksiselitteiseksi, jottei tavallinen
// nimen maininta ("Juhalle terveiset mummolta") ala laukaista.
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


// Hakee mitkä rivit (mistä tahansa lähteestä) KIRJAUTUNUT ITSE on jo
// nostanut Ankkureihin — ankkurit ovat henkilökohtaisia (2026-07-11), joten
// tämä on aina rajattava omaan user_id:hen, muuten toisen käyttäjän ankkuri
// näkyisi virheellisesti "jo nostettuna" ja sen poistonappi poistaisi
// TOISEN käyttäjän rivin.
async function paivitaAnkkuroidutAvaimet() {
  const { data, error } = await db.from('ankkurit').select('source, source_ref').not('source_ref', 'is', null).eq('user_id', currentUserId);
  if (error) {
    console.error('Ankkurointitilan haku epäonnistui:', error);
    return;
  }
  ankkuroidutAvaimet = new Set((data || []).map(function(rivi) { return rivi.source + ':' + rivi.source_ref; }));
}

// Nostaa/poistaa rivin ankkuroinnin lähteestä riippumatta (Muistilaput-tuote,
// kalenteritapahtuma, ym. — kaikki käyttävät samaa mekanismia). Ankkurit ovat
// henkilökohtaisia — poisto rajataan omaan user_id:hen, jottei sama
// source/source_ref (esim. kaksi käyttäjää nostaa saman kalenteritapahtuman)
// voi koskaan poistaa toisen käyttäjän ankkuria.
async function vaihdaAnkkurointiYleinen(source, id, content, jalkeenPaivitys) {
  const idStr = String(id);
  const oliAnkkuroitu = ankkuroidutAvaimet.has(source + ':' + idStr);
  if (oliAnkkuroitu) {
    const { error } = await db.from('ankkurit').delete().eq('source', source).eq('source_ref', idStr).eq('user_id', currentUserId);
    if (ilmoitaKirjoitusvirheesta(error, 'Ankkuroinnin poisto')) return;
  } else {
    const { error } = await db.from('ankkurit').insert({ content: content, source: source, source_ref: idStr, user_id: currentUserId });
    if (ilmoitaKirjoitusvirheesta(error, 'Ankkurointi')) return;
  }
  // Laiturin murut EIVÄT ole pysyvä lista kuten Muistilaput/Kalenteri —
  // Laituri on sisääntulo/triage-pino, ja nostaminen ankkuriksi ON
  // nimenomaan pinosta poistamista (2026-08-18, Katrin pyyntö: "jos nostaa
  // jotain laiturista ankkuriksi sen pitäisi kadota laiturista"). Käyttää
  // samaa piilota_laiturista-lippua kuin muutkin Laiturista-piilotusreitit
  // (koti-valuminen, materiaalin sijoitus, ks. lataaLaituri:n
  // eq('piilota_laiturista', false)) — ei uutta rinnakkaista mekanismia.
  // Käytännössä tämä on aina nosto (true): laskun (release) reitti on eri,
  // ks. Ruorin Ankkurit-listan irrotaNappi-käsittelijä, joka palauttaa
  // liputuksen — Laiturista noussut rivi katoaa Laiturista NÄHTÄVISTÄ heti
  // noustessa, joten sen omaa ⚓-nappia ei enää pääse painamaan uudelleen
  // laskeakseen sitä TÄÄLTÄ käsin.
  if (source === 'laituri') {
    const { error: piilotaError } = await db.from('laituri').update({ piilota_laiturista: !oliAnkkuroitu }).eq('id', id);
    if (piilotaError) console.error('Laiturin piilotuksen päivitys ankkuroinnissa epäonnistui:', piilotaError);
  }
  await paivitaAnkkuroidutAvaimet();
  jalkeenPaivitys();
}

// Nostaa/poistaa listan rivin ankkuroinnin (napautus ⚓-napista listan sisällä)
function vaihdaAnkkurointi(tuote) {
  return vaihdaAnkkurointiYleinen('muistilaput', tuote.id, tuote.nimi, function() { paivitaNaytto(cachedTuotteet); });
}
// Avaa valitun listan
function avaaLista(lista) {
  currentList = lista;
  historyOpen = false;
  aktiivinenOtsikkoId = null;
  document.getElementById('list-title').textContent = '✱ ' + lista.name + ' ✱';
  paivitaNakyvyysIkoni();
  paivitaLisaysKohde();
  poistuValintatilasta();
  // Kauppalistalta itseltään ei voi siirtää Kauppalistalle
  document.getElementById('valinta-toggle-btn').style.display = lista.name === 'Kauppalista' ? 'none' : '';
  showAppView();
  lataaLista();
}

// Sulkee Ruoka-välivaiheen valintatilan (uuden listan avaus, Peruuta-nappi
// tai onnistunut siirto Kauppalistalle kutsuvat tätä).
function poistuValintatilasta() {
  valintatilaPaalla = false;
  valitutTuoteIdt.clear();
  document.getElementById('valinta-toggle-btn').classList.remove('active');
  document.getElementById('valinta-palkki').style.display = 'none';
}

function paivitaValintaMaara() {
  document.getElementById('valinta-maara-teksti').textContent = valitutTuoteIdt.size + ' valittu';
  document.getElementById('valinta-kauppalistalle-btn').disabled = valitutTuoteIdt.size === 0;
}

// Laskee mihin kohtaan uusi rivi asetetaan: aktiivisen otsikon alle jos
// sellainen on valittu, muuten null (jolloin rivi menee listan loppuun)
function laskeLisaysJarjestys() {
  if (!aktiivinenOtsikkoId) return null;
  const jarjestetyt = cachedTuotteet.slice().sort(function(a, b) { return a.sort_order - b.sort_order; });
  const otsikkoIndex = jarjestetyt.findIndex(function(t) { return t.id === aktiivinenOtsikkoId; });
  if (otsikkoIndex === -1) return null;
  const otsikko = jarjestetyt[otsikkoIndex];
  const seuraava = jarjestetyt[otsikkoIndex + 1];
  return seuraava ? (otsikko.sort_order + seuraava.sort_order) / 2 : otsikko.sort_order + 1;
}

// Päivittää lisäyskentän vihjeen näyttämään mihin osioon rivi lisätään
function paivitaLisaysKohde() {
  if (!aktiivinenOtsikkoId) {
    input.placeholder = 'lisää tuote...';
    return;
  }
  const otsikko = cachedTuotteet.find(function(t) { return t.id === aktiivinenOtsikkoId; });
  input.placeholder = otsikko ? 'lisää kohtaan ' + otsikko.nimi + '...' : 'lisää tuote...';
}

// Valitsee/poistaa väliotsikon lisäyskohteeksi napautuksesta
function valitseLisaysKohde(tuote) {
  aktiivinenOtsikkoId = (aktiivinenOtsikkoId === tuote.id) ? null : tuote.id;
  paivitaLisaysKohde();
  paivitaNaytto(cachedTuotteet);
}

// Päivittää listan asetusnapin ikonin nykyisen näkyvyystilan mukaan
function paivitaNakyvyysIkoni() {
  document.getElementById('settings-btn').textContent = currentList.visibility === 'shared' ? '👥' : '🔒';
}

// Lataa etusivun: Ankkurit ja päivämäärä. Navigointi hoituu alapalkista
// (2026-08-18, ks. piirraAlapalkki) — vanha 2x3-navigointiruudukko poistettu,
// sen ainoa vielä tarvittu osa (Kalenterin uusien tapahtumien pallura)
// siirrettiin alapalkin kalenterikuvakkeeseen, ks. paivitaKalenteriBadge().
// Listat (nyk. "Muistilaput") EIVÄT enää ole suoraan etusivulla, ks. lataaMuistilaput()
async function lataaKotinakyma() {
  // Tuore asetuskartta ennen ankkurien piirtoa (ks. ankkurit_nayta_maara,
  // lataaAnkkurit alla) — muuten oletusarvo (3) näkyisi kunnes käyttäjä
  // ehtii käydä Kalenterissa/Asetuksissa samassa istunnossa.
  paivitaAsetukset();
  lataaAnkkurit();
  loadAnchorCandidates();
  paivitaRistiriitaPallura();
  paivitaKuittausTila();
  lataaRuoriKalenteri();
  lataaRuoriHytti();
  lataaRuoriSaa();
  paivitaRuoriNakyvyys();
  lataaAlapalkkiJarjestys().then(piirraAlapalkki);
  naytaOdottavatParisuhdeaikaKalenterit();
}

// BUGIKORJAUS (2026-08-11, Katrin löytämä): kun molemmat hyväksyvät
// parisuhdeajan, kalenterisilta-kortti (showCoupleTimeCalendarCard) näytettiin
// aiemmin VAIN sille jonka hyväksyntä sattui olemaan jälkimmäinen — se joka
// hyväksyi ENSIN ei koskaan nähnyt "vie kalenteriin" -korttia, koska hänen
// rivinsä suljettiin heti eikä se enää tullut ehdokaslistassa vastaan. Ks.
// sql/114 (parisuhde_kalenteri_nahty) + api/parisuhdeaika.js:n hyvaksy() (joka
// merkitsee hyväksyjän oman rivin heti nähdyksi — kumppanin rivi jää
// false:ksi tätä hakua varten). Tämä on käyttäjän OMA rivi, RLS sallii
// suoran haun/kirjoituksen ilman palvelinreittiä.
async function naytaOdottavatParisuhdeaikaKalenterit() {
  const { data, error } = await db.from('ankkurit').select()
    .eq('user_id', currentUserId).eq('source', 'parisuhdeaika')
    .eq('done', true).eq('parisuhde_hyvaksytty', true).eq('parisuhde_kalenteri_nahty', false)
    .limit(1);
  if (error) {
    console.error('Odottavien parisuhdeaika-kalentereiden haku epäonnistui:', error);
    return;
  }
  const rivi = (data || [])[0];
  if (!rivi) return;
  showCoupleTimeCalendarCard({ content: rivi.content, event_date: rivi.event_date, event_time: rivi.event_time });
  const { error: merkintaError } = await db.from('ankkurit').update({ parisuhde_kalenteri_nahty: true }).eq('id', rivi.id);
  if (merkintaError) console.error('Parisuhdeaika-kortin nähdyksi merkintä epäonnistui:', merkintaError);
}

// Hakee kategorian listat ja piirtää ne annettuun säiliöön. Käytetään sekä
// Muistilaput- että Varasto-näkymälle — sama lists/tuotteet-rakenne, eri suodatus.
async function lataaListatNakymaan(containerId, kategoria) {
  if (raahattavaRivi) return;
  const { data, error } = await db.from('lists').select().eq('category', kategoria).order('sort_order');
  if (error) {
    console.error('Listojen haku epäonnistui:', error);
    return;
  }

  const containerEl = document.getElementById(containerId);
  containerEl.innerHTML = '';
  const paivitaNakyma = function() { lataaListatNakymaan(containerId, kategoria); };

  (data || []).forEach(function(lista) {
    const item = document.createElement('li');
    // BUGIKORJAUS (2026-08-03, Katrin löydös): ilman rivin omaa luokkaa
    // listan nimi kaatuu geneeriseen `.list li span`-sääntöön (nowrap +
    // ellipsis) eikä näy kokonaan pysty- eikä vaakasuunnassa millään pitkällä
    // nimellä. 'varasto-rivi' antaa jo olemassa olevan rivitys-CSS:n
    // (white-space:normal, word-break:break-word) — sama luokka toimii
    // Muistilapuille ja Varastolle identtisesti, ei tarvitse uutta sääntöä.
    item.className = 'varasto-rivi';
    item.dataset.tuoteId = lista.id;
    alustaRaahaus(item, lista, { container: containerEl, cache: data, taulu: 'lists', jalkeenPaivitys: paivitaNakyma });
    // TASO 2 (2026-07-21) — teema/vahdittu-tyyppiset rivit avaavat OMAN
    // näkymänsä tavallisen tuotteet-listan (app-view) sijaan.
    item.addEventListener('click', function() {
      if (lista.list_type === 'teema') { avaaTeemaView(lista); return; }
      if (lista.list_type === 'vahdittu') { avaaVahdittuView(lista); return; }
      listanAvausLahde = kategoria;
      avaaLista(lista);
    });

    const teksti = document.createElement('span');
    const varastoMuistikirja = kategoria === 'varasto' && lista.list_type === 'normal';
    teksti.textContent = (lista.list_type === 'teema' ? '🧵 ' : lista.list_type === 'vahdittu' ? '⏳ ' : varastoMuistikirja ? '📓 ' : '') + lista.name;
    item.appendChild(teksti);

    if (lista.name !== 'Kauppalista') {
      // Kategorian vaihto NÄKYVÄKSI listauksessa (2026-08-17, Katrin
      // huomio: "ei käy niin helposti että intuitiivisesti löytäisin
      // mistä se tehdään") — sama toiminto oli aiemmin VAIN listan sisällä
      // ⚙️-asetusten takana (move-category-btn), ei näkynyt mistään ennen
      // kuin lista avasi. VAIN normal-tyyppisille (sama rajaus kuin
      // vanhalla move-category-btn:lla, joka ei koskaan ollut tavoitettavissa
      // teema/vahdittu-listoilta niiden omien, erillisten näkymien takia).
      if (lista.list_type === 'normal') {
        const siirtoNappi = document.createElement('button');
        siirtoNappi.textContent = '⇄';
        siirtoNappi.className = 'edit-btn';
        siirtoNappi.title = kategoria === 'varasto' ? 'Siirrä Muistilappuihin' : 'Siirrä Varastoon';
        siirtoNappi.addEventListener('click', async function(e) {
          e.stopPropagation();
          const uusiKategoria = kategoria === 'varasto' ? 'muistilaput' : 'varasto';
          const { error } = await db.from('lists').update({ category: uusiKategoria }).eq('id', lista.id);
          if (ilmoitaKirjoitusvirheesta(error, 'Kategorian vaihto')) return;
          logEvent(uusiKategoria === 'varasto' ? 'moved_to_varasto' : 'moved_to_muistilaput', 'list', lista.id, lista.name, lista.id);
          naytaIlmoitus('Siirretty: ' + (uusiKategoria === 'varasto' ? 'Varastoon' : 'Muistilappuihin'));
          paivitaNakyma();
        });
        item.appendChild(siirtoNappi);
      }

      const muokkausNappi = document.createElement('button');
      muokkausNappi.textContent = '✎';
      muokkausNappi.className = 'edit-btn';
      muokkausNappi.addEventListener('click', function(e) {
        e.stopPropagation();
        aloitaListanMuokkaus(teksti, lista, paivitaNakyma);
      });
      item.appendChild(muokkausNappi);

      const poistoNappi = document.createElement('button');
      poistoNappi.textContent = '×';
      poistoNappi.className = 'delete-btn';
      poistoNappi.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteList(lista, paivitaNakyma);
      });
      item.appendChild(poistoNappi);
    }

    containerEl.appendChild(item);
  });
}

async function lataaMuistilaput() {
  return lataaListatNakymaan('muistilaput-list', 'muistilaput');
}

async function lataaVarasto() {
  return lataaListatNakymaan('varasto-list', 'varasto');
}

// === KESKUSTELUTEEMA (2026-07-21, ks. KONSEPTIKIRJA.md 4.10b / muistiinpanot.md
// "Keskusteluteema Varastossa") ===
// Arvoperiaate koko tälle osiolle ja Vahditulle levolle alla (Katrin oma
// sanamuoto, TASO 1:ssä jo kirjattu, koskee tätäkin): "Satama tukee
// vanhempien muistia — ei rakenna profiilia lapsesta." Ei koskaan
// luonnearvio-/diagnoosikenttiä millekään teemalle.
function showTeemaView() {
  piilotaKaikkiNakymat();
  document.getElementById('teema-view').style.display = 'block';
}

let currentTeema = null;

async function avaaTeemaView(lista) {
  currentTeema = lista;
  showTeemaView();
  document.getElementById('teema-title').textContent = '✱ ' + lista.name + ' ✱';
  paivitaSovittuLinjaNaytto();
  paivitaTeemaPriorityNapit();
  paivitaTeemaNakyvyysNappi();
  await lataaTeemaSisalto();
}

// Näkyvyystoggeli (2026-08-17, Katrin pyyntö: "varaston listat olis hyvä
// saada myös yksityiseksi") — teema/vahdittu-tyyppisillä listoilla ei ollut
// MITÄÄN tapaa vaihtaa lists.visibility:tä (luodaan aina 'shared':na, ks.
// new-varasto-btn), toisin kuin normaali-tyyppisillä listoilla joilla on jo
// tämä sama toggeli olemassa olevan #settings-btn:n kautta (paivitaNakyvyysIkoni).
// Sama 🔒/👥-merkkikäytäntö kuin siellä.
function paivitaTeemaNakyvyysNappi() {
  const nappi = document.getElementById('teema-nakyvyys-btn');
  const jaettu = currentTeema.visibility === 'shared';
  nappi.textContent = jaettu ? '👥' : '🔒';
  nappi.title = jaettu ? 'Näkyy molemmille — napauta tehdäksesi yksityiseksi' : 'Näkyy vain sinulle — napauta jakaaksesi';
}

document.getElementById('teema-nakyvyys-btn').addEventListener('click', async function() {
  if (!currentTeema) return;
  const uusi = currentTeema.visibility === 'shared' ? 'private' : 'shared';
  const { error } = await db.from('lists').update({ visibility: uusi }).eq('id', currentTeema.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Näkyvyyden muutos')) return;
  currentTeema.visibility = uusi;
  paivitaTeemaNakyvyysNappi();
  naytaIlmoitus(uusi === 'shared' ? 'Näkyy nyt molemmille' : 'Näkyy nyt vain sinulle');
});

function paivitaSovittuLinjaNaytto() {
  const teksti = document.getElementById('teema-sovittu-linja-teksti');
  const pvm = document.getElementById('teema-sovittu-linja-pvm');
  if (currentTeema.sovittu_linja) {
    teksti.textContent = currentTeema.sovittu_linja;
    const d = new Date(currentTeema.sovittu_linja_pvm + 'T00:00:00');
    pvm.textContent = 'sovittu ' + d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
  } else {
    teksti.textContent = 'Ei vielä sovittua linjaa';
    pvm.textContent = '';
  }
}

function paivitaTeemaPriorityNapit() {
  document.querySelectorAll('.teema-priority-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.priority === currentTeema.priority);
  });
}

document.querySelectorAll('.teema-priority-btn').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    if (!currentTeema) return;
    const uusi = btn.dataset.priority;
    const { error } = await db.from('lists').update({ priority: uusi }).eq('id', currentTeema.id);
    if (ilmoitaKirjoitusvirheesta(error, 'Nostoherkkyyden päivitys')) return;
    currentTeema.priority = uusi;
    paivitaTeemaPriorityNapit();
  });
});

// "Sovittu linja" (2b) — päivittyessä VANHA arvo ei häviä, se kirjoitetaan
// uudeksi laituri-riviksi samaan teemaan ("vanha valuu historiaan") ENNEN
// ylikirjoitusta — sama laituri+teema_id-mekanismi kuin murutkin, ei
// erillistä historiataulua tarvita.
document.getElementById('teema-sovittu-linja-muokkaa-btn').addEventListener('click', function() {
  const input = document.getElementById('teema-sovittu-linja-input');
  const napit = document.getElementById('teema-sovittu-linja-napit');
  input.value = currentTeema.sovittu_linja || '';
  input.style.display = 'block';
  napit.style.display = 'none';
  document.getElementById('teema-sovittu-linja-teksti').style.display = 'none';
  input.focus();

  async function tallenna() {
    const uusi = input.value.trim();
    input.removeEventListener('blur', tallenna);
    input.style.display = 'none';
    napit.style.display = 'flex';
    document.getElementById('teema-sovittu-linja-teksti').style.display = 'block';
    if (!uusi || uusi === currentTeema.sovittu_linja) return;

    if (currentTeema.sovittu_linja) {
      const { error: historiaError } = await db.from('laituri').insert({
        content: 'Sovittu (aiempi linja): ' + currentTeema.sovittu_linja,
        teema_id: currentTeema.id,
        status: 'uusi',
      });
      // Vanha linja ei saa hävitä (turvainvariantti): jos historiakirjaus
      // epäonnistuu, EI ylikirjoiteta sovittu_linja-kenttää (korjattu
      // konsistenssi-auditoinnissa 2026-07-21 — aiemmin jatkoi silti).
      if (ilmoitaKirjoitusvirheesta(historiaError, 'Vanhan sovitun linjan historiakirjaus')) return;
    }

    const tanaan = paivamaaraISO(new Date());
    const { error } = await db.from('lists').update({ sovittu_linja: uusi, sovittu_linja_pvm: tanaan }).eq('id', currentTeema.id);
    if (ilmoitaKirjoitusvirheesta(error, 'Sovitun linjan päivitys')) return;
    currentTeema.sovittu_linja = uusi;
    currentTeema.sovittu_linja_pvm = tanaan;
    paivitaSovittuLinjaNaytto();
    await lataaTeemaSisalto();
  }

  input.addEventListener('blur', tallenna);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { input.value = ''; input.blur(); }
  });
});

async function lataaTeemaSisalto() {
  if (!currentTeema) return;
  const { data, error } = await db.from('laituri').select().eq('teema_id', currentTeema.id).order('created_at', { ascending: true });
  if (error) {
    console.error('Teeman sisällön haku epäonnistui:', error);
    return;
  }
  const murut = data || [];

  const jatkorivitKartta = {};
  if (murut.length > 0) {
    const { data: jatkorivit, error: jatkoriviError } = await db.from('laituri_jatkorivit').select()
      .in('muru_id', murut.map(function(r) { return r.id; })).order('created_at', { ascending: true });
    if (jatkoriviError) {
      console.error('Teeman jatkorivien haku epäonnistui:', jatkoriviError);
    } else {
      (jatkorivit || []).forEach(function(jr) {
        if (!jatkorivitKartta[jr.muru_id]) jatkorivitKartta[jr.muru_id] = [];
        jatkorivitKartta[jr.muru_id].push(jr);
      });
    }
  }

  const listEl = document.getElementById('teema-list');
  listEl.innerHTML = '';

  murut.forEach(function(muru) {
    const li = document.createElement('li');
    li.className = 'laituri-row';

    const sisalto = document.createElement('div');
    sisalto.className = 'laituri-content';
    const teksti = document.createElement('span');
    teksti.className = 'laituri-text';
    teksti.textContent = muru.content;
    sisalto.appendChild(teksti);
    const meta = document.createElement('span');
    meta.className = 'laituri-meta';
    meta.textContent = muotoileAikaleima(muru.created_at);
    sisalto.appendChild(meta);
    li.appendChild(sisalto);

    // EI editointia, EI poistoa yksittäiselle riville — VAIN "nosta
    // aktiiviseksi" (turvainvariantti: teeman sisältö on lukittu paitsi
    // kokonaispoistolla, ks. teema-poista-btn).
    const nostaNappi = document.createElement('button');
    nostaNappi.className = 'restore-btn';
    nostaNappi.textContent = '↩';
    nostaNappi.title = 'Nosta takaisin aktiiviseksi Laituriin';
    nostaNappi.addEventListener('click', async function() {
      const { error: nostoError } = await db.from('laituri').update({ teema_id: null }).eq('id', muru.id);
      if (ilmoitaKirjoitusvirheesta(nostoError, 'Nosto aktiiviseksi')) return;
      naytaIlmoitus('Nostettu takaisin Laituriin');
      lataaTeemaSisalto();
    });
    li.appendChild(nostaNappi);

    listEl.appendChild(li);
    piirraJatkorivit(muru, li, jatkorivitKartta[muru.id] || []);
  });
}

document.getElementById('teema-back-btn').addEventListener('click', function() {
  currentTeema = null;
  showVarastoView();
  lataaVarasto();
});

document.getElementById('teema-poista-btn').addEventListener('click', async function() {
  if (!currentTeema) return;
  await deleteList(currentTeema, function() {
    currentTeema = null;
    showVarastoView();
    lataaVarasto();
  });
});

// === VAHDITTU LEPO (2026-07-21, ks. KONSEPTIKIRJA.md 4.10b / muistiinpanot.md
// "Vahdittu lepo Varastossa") ===
// "Anna arjen yrittää ensin" — muuten tavallinen tuotteet-lista (samat
// rivit/täppäys kuin Muistilaput/Varasto), mutta kuittaamaton rivi nousee
// ankkuriehdokkaaksi X päivän jälkeen (ks. api/_lib/muistutukset-laheta.js:n
// uusi tarkistus). Tämä näkymä on VAIN sisällönhallinta + raja-asetus —
// itse nosto tapahtuu palvelimella cronissa, ei täällä.
function showVahdittuView() {
  piilotaKaikkiNakymat();
  document.getElementById('vahdittu-view').style.display = 'block';
}

let currentVahdittu = null;

async function avaaVahdittuView(lista) {
  currentVahdittu = lista;
  showVahdittuView();
  document.getElementById('vahdittu-title').textContent = '✱ ' + lista.name + ' ✱';
  document.getElementById('vahdittu-raja-input').value = lista.vahdittu_raja_paivia;
  paivitaVahdittuNakyvyysNappi();
  await lataaVahdittuSisalto();
}

// Sama näkyvyystoggeli kuin Teemalla — ks. paivitaTeemaNakyvyysNappi()-kommentti.
function paivitaVahdittuNakyvyysNappi() {
  const nappi = document.getElementById('vahdittu-nakyvyys-btn');
  const jaettu = currentVahdittu.visibility === 'shared';
  nappi.textContent = jaettu ? '👥' : '🔒';
  nappi.title = jaettu ? 'Näkyy molemmille — napauta tehdäksesi yksityiseksi' : 'Näkyy vain sinulle — napauta jakaaksesi';
}

document.getElementById('vahdittu-nakyvyys-btn').addEventListener('click', async function() {
  if (!currentVahdittu) return;
  const uusi = currentVahdittu.visibility === 'shared' ? 'private' : 'shared';
  const { error } = await db.from('lists').update({ visibility: uusi }).eq('id', currentVahdittu.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Näkyvyyden muutos')) return;
  currentVahdittu.visibility = uusi;
  paivitaVahdittuNakyvyysNappi();
  naytaIlmoitus(uusi === 'shared' ? 'Näkyy nyt molemmille' : 'Näkyy nyt vain sinulle');
});

async function lataaVahdittuSisalto() {
  if (!currentVahdittu) return;
  const { data, error } = await db.from('tuotteet').select().eq('list_id', currentVahdittu.id).order('sort_order');
  if (error) {
    console.error('Vahditun listan haku epäonnistui:', error);
    return;
  }
  const listEl = document.getElementById('vahdittu-list');
  listEl.innerHTML = '';
  (data || []).forEach(function(tuote) {
    const li = document.createElement('li');

    const check = document.createElement('button');
    check.className = 'check-btn';
    check.textContent = tuote.tehty ? '✓' : '○';
    check.addEventListener('click', async function() {
      const { error: checkError } = await db.from('tuotteet').update({ tehty: !tuote.tehty }).eq('id', tuote.id);
      if (ilmoitaKirjoitusvirheesta(checkError, 'Rivin kuittaus')) return;
      lataaVahdittuSisalto();
    });
    li.appendChild(check);

    const teksti = document.createElement('span');
    teksti.textContent = tuote.nimi;
    li.appendChild(teksti);

    // 4.12: sama aikaleimanäyttö kuin Muistikirjassa/Teemassa — milloin rivi
    // on lisätty (ei vahdittu-mekanismin oma "kuittaamatta X pv" -tila).
    const aikaEl = document.createElement('span');
    aikaEl.textContent = muotoileAikaleima(tuote.created_at);
    aikaEl.className = 'history-time';
    li.appendChild(aikaEl);

    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function() {
      const { error: poistoError } = await db.from('tuotteet').delete().eq('id', tuote.id);
      if (ilmoitaKirjoitusvirheesta(poistoError, 'Rivin poisto')) return;
      lataaVahdittuSisalto();
    });
    li.appendChild(poisto);

    listEl.appendChild(li);
  });
}

document.getElementById('vahdittu-add-btn').addEventListener('click', async function() {
  if (!currentVahdittu) return;
  const input = document.getElementById('vahdittu-input');
  const nimi = input.value.trim();
  if (nimi === '') { input.focus(); return; }
  const { error } = await db.from('tuotteet').insert({ nimi: nimi, tehty: false, list_id: currentVahdittu.id });
  if (ilmoitaKirjoitusvirheesta(error, 'Rivin lisäys')) return;
  input.value = '';
  lataaVahdittuSisalto();
});

document.getElementById('vahdittu-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') document.getElementById('vahdittu-add-btn').click();
});

document.getElementById('vahdittu-raja-input').addEventListener('change', async function(e) {
  if (!currentVahdittu) return;
  // HUOM (korjattu konsistenssi-auditoinnissa 2026-07-21): "|| 14" tulkitsi
  // syötteen 0 falsyksi ja korvasi sen oletuksella — 0 pv pitää kuitenkin
  // olla kelvollinen arvo (testauskäytäntö vaatii sen välitöntä nostoa varten).
  const parsed = parseInt(e.target.value, 10);
  const uusi = Number.isNaN(parsed) || parsed < 0 ? 14 : parsed;
  const { error } = await db.from('lists').update({ vahdittu_raja_paivia: uusi }).eq('id', currentVahdittu.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Rajan päivitys')) return;
  currentVahdittu.vahdittu_raja_paivia = uusi;
});

document.getElementById('vahdittu-back-btn').addEventListener('click', function() {
  currentVahdittu = null;
  showVarastoView();
  lataaVarasto();
});

// === OPINTOPOLKU VAIHE 1 (2026-07-21, ks. muistiinpanot.md "Opintopolku" —
// KONSEPTIKIRJA.md 4.11 puuttuu vielä repon konseptikirjasta, tämä on
// rakennettu suoraan Katrin chat-pyynnön verbatim-spesifikaatiosta) ===
// Arvoperiaate: "Satama tukee oppimista — ei tee oppimista puolesta. Äly voi
// järjestää MILLOIN/MITEN opiskellaan, ei ymmärtää sisältöä puolesta (Sung:
// jäsentäminen ON oppiminen)." Tämä VAIHE 1 ei sisällä mitään älyä
// ollenkaan — pelkkä käsin ylläpidettävä rakenne jonka päälle Vaihe 2:n
// kolmen voiman moottori ja spaced repetition -kierto rakentuvat.
//
// Yksityinen — sama owner_id-RLS-periaate kuin hytti_kortit/hytti_rivit
// (sql/016), EI Katri-kohtaista kovakoodausta koodissa, RLS hoitaa rajauksen.

// yllapito pysyy tässä sanastossa VAIN taitosolmuja varten (vanha malli,
// koskematon Vaihe 5:een asti, ks. HYTTI_SPEKSI.md §13). overlearning on
// opinto_aiheiden (solmujen) uusi, PERO:n oma vapaaehtoinen vaihe
// (sql/111, 2026-08-10).
const OPINTO_VAIHE_NIMET = {
  priming: 'Aloittamatta',
  encoding: 'Opiskelussa',
  retrieval: 'Kertauksessa',
  reference: 'Hallussa',
  yllapito: 'Ylläpidossa',
  overlearning: 'Syventämässä',
};
const OPINTO_VAIHE_JARJESTYS = ['priming', 'encoding', 'retrieval', 'reference', 'yllapito']; // taitosolmut
const PERO_VAIHE_JARJESTYS = ['priming', 'encoding', 'retrieval', 'reference', 'overlearning']; // opinto_aiheet

// Palauttaa kohteen vaihe-arvon riippumatta siitä onko kyseessä opinto_aihe
// (pero_vaihe, sql/111) vai taitosolmu (vaihe, vanha malli, koskematon) —
// näiden kahden kentän nimet eivät koskaan esiinny samalla rivillä, joten
// tarkistus on yksiselitteinen ilman että kutsujan tarvitsee tietää taulua.
function kohdeVaihe(kohde) {
  return kohde.pero_vaihe !== undefined ? kohde.pero_vaihe : kohde.vaihe;
}

// Kokonaiskartan kolme väriryhmää (2c:n speksi: "hallussa/työn alla/edessä").
// kertausjonossa (2026-08-10, vain opinto_aiheet) korvaa vanhan
// "vaihe==='yllapito'"-tarkistuksen tässä — solmu joka on kertausjonossa on
// yhtä lailla "hallussa" riippumatta siitä että pero_vaihe pysyy
// 'retrieval'-arvossa koko ylläpitokierron ajan.
function opintoVaiheRyhma(vaihe, kertausjonossa) {
  if (vaihe === 'reference' || vaihe === 'yllapito' || vaihe === 'overlearning' || kertausjonossa) return 'hallussa';
  if (vaihe === 'encoding' || vaihe === 'retrieval') return 'tyon-alla';
  return 'edessa';
}

// PACER-tietotyyppiluokittelu (sql/111, 2026-08-10, ks. sung-metodi.md §2)
// — ERI akseli kuin PERO-vaihe yllä. evidence/reference ovat kannassa
// sallittuja mutta V1:n käyttöliittymä ei tarjoa niitä vielä valittavaksi
// (PACER_TYYPPI_V1) — ks. HYTTI_SPEKSI.md §7.4.
const PACER_TYYPPI_NIMET = {
  procedural: 'Proseduraalinen (miten tehdään)',
  analogous: 'Analoginen (liittyy tuttuun)',
  conceptual: 'Käsitteellinen (mitä se on)',
  evidence: 'Todiste (faktat)',
  reference: 'Viite (suora muisti)',
};
const PACER_TYYPPI_V1 = ['procedural', 'analogous', 'conceptual'];

// Kurssikortin oma PERO-vaihe (2026-08-11, CODE_vaihe1b.md §4): aikaisin
// vaihe (PERO_VAIHE_JARJESTYS/OPINTO_VAIHE_NIMET, jo olemassa yllä) joka
// löytyy edelleen työn alla (ei hallussa) olevista aiheista — kertoo missä
// kurssin "pullonkaula" on juuri nyt. Jos kaikki on hallussa, "Hallussa".
// Jos ei yhtään aihetta, tyhjä (ei näytetä badgea ollenkaan). Ei sama asia
// kuin opintoVaiheRyhma():n kolme väriryhmää (hallussa/työn-alla/edessä),
// joka on Kartan oma, karkeampi jako.
function kurssinPeroVaihe(aiheet) {
  if (!aiheet || aiheet.length === 0) return null;
  const tyonAlla = aiheet.filter(function(a) { return opintoVaiheRyhma(a.pero_vaihe, a.kertausjonossa) !== 'hallussa'; });
  if (tyonAlla.length === 0) return OPINTO_VAIHE_NIMET.reference;
  for (const vaihe of PERO_VAIHE_JARJESTYS) {
    if (tyonAlla.some(function(a) { return a.pero_vaihe === vaihe; })) return OPINTO_VAIHE_NIMET[vaihe];
  }
  return null;
}

// Kurssiosion muotokieli uusittu (2026-08-11, CODE_vaihe1b.md §4) —
// luettavan pinnan kortti (--r-luettava, paperi, hiusviiva), PERO-vaihe
// messingillä versaalina, jäljellä-palkki. EI prosentteja/pistemääriä —
// palkki näyttää PALJONKO ON JÄLJELLÄ (ei-hallussa-olevien aiheiden osuus),
// ei osaamistasoa, siksi neutraali muste eikä Kartan värikoodattu 3-palkki.
async function lataaOpintoKurssit() {
  const { data, error } = await db.from('opinto_kurssit').select().order('sort_order');
  if (error) {
    console.error('Opintopolun kurssien haku epäonnistui:', error);
    return;
  }
  const kurssit = data || [];
  const listEl = document.getElementById('opinto-kurssi-lista');
  listEl.innerHTML = '';

  for (const kurssi of kurssit) {
    const { data: aiheet, error: aiheError } = await db.from('opinto_aiheet').select('pero_vaihe, kertausjonossa').eq('kurssi_id', kurssi.id);
    if (aiheError) console.error('Kurssin aiheiden haku epäonnistui (kurssikortti):', aiheError);

    const li = document.createElement('li');
    li.className = 'opinto-kurssi-kortti';
    li.addEventListener('click', function() { avaaOpintoKurssi(kurssi); });

    const ylarivi = document.createElement('div');
    ylarivi.className = 'opinto-kurssi-kortti-ylarivi';
    const nimi = document.createElement('span');
    nimi.className = 'opinto-kurssi-kortti-nimi';
    nimi.textContent = kurssi.name + (kurssi.status === 'arkistoitu' ? ' (arkistoitu)' : '');
    ylarivi.appendChild(nimi);
    const vaihe = kurssinPeroVaihe(aiheet);
    if (vaihe) {
      const vaiheEl = document.createElement('span');
      vaiheEl.className = 'opinto-kurssi-kortti-vaihe';
      vaiheEl.textContent = vaihe;
      ylarivi.appendChild(vaiheEl);
    }
    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function(e) {
      e.stopPropagation();
      const vahvistus = await naytaVahvistus('Poistetaanko ' + kurssi.name + '?', 'Kurssin kaikki aiheet ja deadlinet poistuvat mukana.', 'Poista kurssi');
      if (!vahvistus) return;
      const { error: poistoError } = await db.from('opinto_kurssit').delete().eq('id', kurssi.id);
      if (ilmoitaKirjoitusvirheesta(poistoError, 'Kurssin poisto')) return;
      lataaOpintoKurssit();
    });
    ylarivi.appendChild(poisto);
    li.appendChild(ylarivi);

    const maara = (aiheet || []).length;
    if (maara > 0) {
      const jaljellaMaara = aiheet.filter(function(a) { return opintoVaiheRyhma(a.pero_vaihe, a.kertausjonossa) !== 'hallussa'; }).length;
      const palkkiKehys = document.createElement('div');
      palkkiKehys.className = 'opinto-kurssi-kortti-palkki-kehys';
      const palkki = document.createElement('div');
      palkki.className = 'opinto-kurssi-kortti-palkki';
      palkki.style.width = Math.round((jaljellaMaara / maara) * 100) + '%';
      palkkiKehys.appendChild(palkki);
      li.appendChild(palkkiKehys);
    }

    listEl.appendChild(li);
  }
}

document.getElementById('opinto-uusi-kurssi-btn').addEventListener('click', async function() {
  const input = document.getElementById('opinto-uusi-kurssi-input');
  const nimi = input.value.trim();
  if (nimi === '') { input.focus(); return; }
  const { error } = await db.from('opinto_kurssit').insert({ name: nimi, owner_id: currentUserId });
  if (ilmoitaKirjoitusvirheesta(error, 'Kurssin luonti')) return;
  input.value = '';
  lataaOpintoKurssit();
});
document.getElementById('opinto-uusi-kurssi-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') document.getElementById('opinto-uusi-kurssi-btn').click();
});

function showOpintoKurssiView() {
  piilotaKaikkiNakymat();
  document.getElementById('opinto-kurssi-view').style.display = 'block';
}

let currentOpintoKurssi = null;

async function avaaOpintoKurssi(kurssi) {
  currentOpintoKurssi = kurssi;
  showOpintoKurssiView();
  document.getElementById('opinto-kurssi-title').textContent = '✱ ' + kurssi.name + ' ✱';
  piirraOpintoKurssiTilaLinkki();
  piirraOpintoTavoiteHoitotasoNapit();
  piirraOpintoOpMaara();
  piirraOpintoAikataulu();
  await lataaOpintoKurssiMateriaalit();
  await lataaOpintoAiheet();
  await lataaOpintoKurssinDeadlinet();
}

// Opiskelumoottori OSA A1 (2026-08-17): tavoite ja hoitotaso ovat ERI
// kentät ("Tavoite = miksi tämä kurssi. Hoitotaso = kuinka paljon
// kapasiteettia juuri nyt", rakennusjärjestys-dokumentti). Molemmat
// muokattavissa suoraan napista, ei erillistä tallennusnappia — sama
// välitön kirjoitus kuin Teeman Nostoherkkyydellä.
function piirraOpintoTavoiteHoitotasoNapit() {
  document.querySelectorAll('.opinto-tavoite-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.tavoite === currentOpintoKurssi.tavoite);
  });
  document.querySelectorAll('.opinto-hoitotaso-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.hoitotaso === currentOpintoKurssi.hoitotaso);
  });
}

document.querySelectorAll('.opinto-tavoite-btn').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    if (!currentOpintoKurssi) return;
    const uusi = btn.dataset.tavoite;
    const { error } = await db.from('opinto_kurssit').update({ tavoite: uusi }).eq('id', currentOpintoKurssi.id);
    if (ilmoitaKirjoitusvirheesta(error, 'Tavoitteen tallennus')) return;
    currentOpintoKurssi.tavoite = uusi;
    piirraOpintoTavoiteHoitotasoNapit();
  });
});

document.querySelectorAll('.opinto-hoitotaso-btn').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    if (!currentOpintoKurssi) return;
    const uusi = btn.dataset.hoitotaso;
    const { error } = await db.from('opinto_kurssit').update({ hoitotaso: uusi }).eq('id', currentOpintoKurssi.id);
    if (ilmoitaKirjoitusvirheesta(error, 'Hoitotason tallennus')) return;
    currentOpintoKurssi.hoitotaso = uusi;
    piirraOpintoTavoiteHoitotasoNapit();
    naytaIlmoitus('Hoitotaso: ' + (uusi === 'taysi' ? 'täysi' : uusi === 'kevyt' ? 'kevyt' : 'vain deadlinet'));
  });
});

// Kolmiportainen kadenssi Taso 1 -syöte: op_maara oli jo sarakkeena mutta
// ilman UI:ta (VAIHE2_JA_LISAYKSET_CODELLE.md, 18.8.2026). Sama blur-
// tallennus kuin aikataululla, ei erillistä tallennusnappia.
function piirraOpintoOpMaara() {
  const input = document.getElementById('opinto-kurssi-opmaara-input');
  input.value = currentOpintoKurssi.op_maara != null ? currentOpintoKurssi.op_maara : '';
}

document.getElementById('opinto-kurssi-opmaara-input').addEventListener('blur', async function(e) {
  if (!currentOpintoKurssi) return;
  const arvo = e.target.value.trim();
  const uusi = arvo === '' ? null : parseFloat(arvo);
  if (uusi !== null && (isNaN(uusi) || uusi < 0)) { piirraOpintoOpMaara(); return; }
  const { error } = await db.from('opinto_kurssit').update({ op_maara: uusi }).eq('id', currentOpintoKurssi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Opintopistemäärän tallennus')) return;
  currentOpintoKurssi.op_maara = uusi;
});

// A1 aikataulu: "N: aihe" per rivi -> jsonb [{viikko, aihe}]. Rivit joita ei
// tunnisteta (ei "N:"-alkua) jätetään pois tallenteesta, ei virheilmoitusta —
// kenttä on vapaamuotoinen eikä vaadi tarkkaa syntaksia joka rivillä.
function jasennaOpintoAikataulu(teksti) {
  const rivit = teksti.split('\n');
  const tulos = [];
  rivit.forEach(function(rivi) {
    const osuma = rivi.match(/^\s*(\d+)\s*:\s*(.+)$/);
    if (osuma) tulos.push({ viikko: parseInt(osuma[1], 10), aihe: osuma[2].trim() });
  });
  return tulos;
}

function piirraOpintoAikataulu() {
  const aikataulu = currentOpintoKurssi.aikataulu;
  const teksti = Array.isArray(aikataulu)
    ? aikataulu.map(function(r) { return r.viikko + ': ' + r.aihe; }).join('\n')
    : '';
  document.getElementById('opinto-kurssi-aikataulu').value = teksti;
}

document.getElementById('opinto-kurssi-aikataulu').addEventListener('blur', async function(e) {
  if (!currentOpintoKurssi) return;
  const jasennetty = jasennaOpintoAikataulu(e.target.value);
  const uusi = jasennetty.length > 0 ? jasennetty : null;
  const { error } = await db.from('opinto_kurssit').update({ aikataulu: uusi }).eq('id', currentOpintoKurssi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Aikataulun tallennus')) return;
  currentOpintoKurssi.aikataulu = uusi;
});

// Kurssin aktiivinen/arkistoitu-tila (2026-08-05, ks. sql/097, muistiinpanot.md
// "Siltasolmut") — sama malli kuin hytti_kortit. Tarvitaan koska siltatunnistus
// lukee VAIN aktiivisten kurssien materiaalin: arkistoi kurssi kun se on ohi
// eikä sitä enää haluta mukaan "mitkä kurssit ovat käynnissä nyt" -laskentaan
// (moottori JA siltatunnistus molemmat kunnioittavat tätä).
function piirraOpintoKurssiTilaLinkki() {
  const linkki = document.getElementById('opinto-kurssi-tila-linkki');
  const aktiivinen = currentOpintoKurssi.status !== 'arkistoitu';
  linkki.textContent = aktiivinen ? '● Aktiivinen (napauta arkistoidaksesi)' : '○ Arkistoitu (napauta palauttaaksesi)';
  linkki.onclick = async function() {
    const uusi = aktiivinen ? 'arkistoitu' : 'aktiivinen';
    const { error } = await db.from('opinto_kurssit').update({ status: uusi }).eq('id', currentOpintoKurssi.id);
    if (ilmoitaKirjoitusvirheesta(error, 'Kurssin tilan muutos')) return;
    currentOpintoKurssi.status = uusi;
    piirraOpintoKurssiTilaLinkki();
    naytaIlmoitus(uusi === 'arkistoitu' ? 'Kurssi arkistoitu — ei enää mukana tänään-suosituksissa' : 'Kurssi palautettu aktiiviseksi');
  };
}

document.getElementById('opinto-kurssi-back-btn').addEventListener('click', function() {
  currentOpintoKurssi = null;
  showHyttiView('reitti');
});

document.getElementById('opinto-kurssi-poista-btn').addEventListener('click', async function() {
  if (!currentOpintoKurssi) return;
  const vahvistus = await naytaVahvistus('Poistetaanko ' + currentOpintoKurssi.name + '?', 'Kurssin kaikki aiheet ja deadlinet poistuvat mukana.', 'Poista kurssi');
  if (!vahvistus) return;
  const { error } = await db.from('opinto_kurssit').delete().eq('id', currentOpintoKurssi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Kurssin poisto')) return;
  currentOpintoKurssi = null;
  showHyttiView('reitti');
});

// Inline materiaalikenttä (2026-08-18, Katrin palaute — ks. index.html:n
// oma kommentti samasta kohdasta). Sama tallennusydin kuin editori-viewilla
// (suoritaEditorinTallennus + materiaaliKohdeInsertKentat), mutta EI
// koskaan navigoida pois kurssisivulta — konteksti asetetaan juuri ennen
// kirjoitusta ja puretaan heti perään, ei jää roikkumaan globaaliksi tilaksi.
document.getElementById('opinto-kurssi-materiaali-tallenna-btn').addEventListener('click', async function() {
  if (!currentOpintoKurssi) return;
  const pinta = document.getElementById('opinto-kurssi-materiaali-pinta');
  const teksti = pinta.value.trim();
  if (teksti === '') { pinta.focus(); return; }
  materiaaliKohdeKurssi = { id: currentOpintoKurssi.id, name: currentOpintoKurssi.name };
  const onnistui = await suoritaEditorinTallennus(teksti);
  materiaaliKohdeKurssi = null;
  if (!onnistui) return;
  pinta.value = '';
  lataaOpintoKurssiMateriaalit();
});

document.getElementById('opinto-kurssi-materiaali-tiedosto-btn').addEventListener('click', function() {
  document.getElementById('opinto-kurssi-materiaali-tiedosto-input').click();
});

document.getElementById('opinto-kurssi-materiaali-tiedosto-input').addEventListener('change', async function(e) {
  if (!currentOpintoKurssi) return;
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  materiaaliKohdeKurssi = { id: currentOpintoKurssi.id, name: currentOpintoKurssi.name };
  await kasitteleEditoriTiedosto(file, 'opinto-kurssi-materiaali-tiedosto-tila');
  materiaaliKohdeKurssi = null;
  lataaOpintoKurssiMateriaalit();
});

// Materiaali-osio uudistettu (2026-08-16, Katrin pyyntö) — status-tietoinen
// lista vanhan yhden ylikirjoitettavan tekstikentän sijaan. Ei enää erillistä
// tallennusnappia: rivit tulevat AINA "+ Lisää materiaalia" -editorin kautta,
// joka jo tallentaa itsensä sulkeutuessaan (ei kahta eri tallennustapaa
// samalla sivulla).
async function lataaOpintoKurssiMateriaalit() {
  if (!currentOpintoKurssi) return;
  // materiaali_kasitelty (sql/121, EI piilota_laiturista) — piilota_laiturista
  // on nyt AINA true heti insertistä lähtien (§16.5c kohta 4), joten se ei
  // enää kelpaa tämän sivun odottaa/käsitelty-tilaksi.
  const { data, error } = await db.from('laituri').select('id, content, created_at, materiaali_kasitelty')
    .eq('materiaali_kurssi_id', currentOpintoKurssi.id).order('created_at', { ascending: false });
  if (error) {
    console.error('Kurssin materiaalien haku epäonnistui:', error);
    return;
  }
  const rivit = data || [];
  const listEl = document.getElementById('opinto-materiaali-lista');
  listEl.innerHTML = '';
  document.getElementById('opinto-kurssi-silta-linkki').style.display = rivit.length === 0 ? 'none' : 'block';

  let tiedostoKartta = {};
  if (rivit.length > 0) {
    const { data: tiedostot, error: tiedostoError } = await db.from('laituri_tiedostot').select('muru_id, tiedostonimi')
      .in('muru_id', rivit.map(function(r) { return r.id; }));
    if (tiedostoError) {
      console.error('Materiaalien tiedostonimien haku epäonnistui:', tiedostoError);
    } else {
      (tiedostot || []).forEach(function(t) { tiedostoKartta[t.muru_id] = t.tiedostonimi; });
    }
  }

  rivit.forEach(function(rivi) {
    const li = document.createElement('li');
    const teksti = document.createElement('span');
    const nimi = tiedostoKartta[rivi.id] || rivi.content;
    teksti.textContent = nimi.length > 60 ? nimi.slice(0, 60) + '…' : nimi;
    li.appendChild(teksti);

    const tila = document.createElement('span');
    tila.className = 'opinto-materiaali-tila' + (rivi.materiaali_kasitelty ? ' kasitelty' : '');
    tila.textContent = rivi.materiaali_kasitelty ? '✓ käsitelty' : '⏳ odottaa';
    li.appendChild(tila);

    listEl.appendChild(li);
  });

  // Kurssitason yhteinen tarkistus (2026-08-17, Katrin havainto: pitkä
  // materiaali liitetään usein monessa osassa — äly ei saa ehdottaa solmuja
  // yhden osan perusteella, pitää nähdä kaikki odottavat osat yhtenä
  // kokonaisuutena). Korvaa vanhan rivikohtaisen "Tarkista"-napin, joka olisi
  // kutsunut älyä erikseen JOKAISELLE liitetylle osalle. Vanhin ensin
  // (paluujärjestys `.order('created_at', {ascending:false})` yllä on
  // näyttöä varten uusin-ensin — käännetään tässä liittämisjärjestykseen).
  const odottavat = rivit.filter(function(r) { return !r.materiaali_kasitelty; }).slice().reverse();
  const tarkistaKaikkiBtn = document.getElementById('opinto-materiaali-tarkista-kaikki-btn');
  tarkistaKaikkiBtn.style.display = odottavat.length > 0 ? 'block' : 'none';
  tarkistaKaikkiBtn.textContent = odottavat.length > 1 ? ('🧩 Tarkista kaikki odottavat (' + odottavat.length + ' osaa)') : '🧩 Tarkista';
  tarkistaKaikkiBtn.onclick = function() { pyydaMateriaaliJasennys(odottavat, tarkistaKaikkiBtn); };
}

document.getElementById('opinto-kurssi-silta-linkki').addEventListener('click', function() {
  if (currentOpintoKurssi) etsiSiltojaKurssille(currentOpintoKurssi);
});

async function lataaOpintoAiheet() {
  if (!currentOpintoKurssi) return;
  const { data, error } = await db.from('opinto_aiheet').select().eq('kurssi_id', currentOpintoKurssi.id).order('sort_order');
  if (error) {
    console.error('Aiheiden haku epäonnistui:', error);
    return;
  }
  const aiheet = data || [];
  const listEl = document.getElementById('opinto-aihe-lista');
  listEl.innerHTML = '';

  aiheet.forEach(function(aihe) {
    const li = document.createElement('li');

    // Nimi avaa Tehtävänäkymän (opiskelumoottori OSA A4, 2026-08-17) — sama
    // "napauta tekstiä" -kaava kuin Laiturin murun korjausmuokkauksella,
    // erillään rivin muista toiminnoista (vaihe/tyyppi-valitsimet, materiaali,
    // poisto) jotka pysyvät napautettavina ilman navigointia pois.
    const teksti = document.createElement('span');
    teksti.textContent = aihe.name;
    teksti.className = 'opinto-aihe-nimi-linkki';
    teksti.addEventListener('click', function() { avaaOpintoTehtava(aihe); });
    li.appendChild(teksti);

    // VAIHE 1a: käsin vaihdettava PERO-tila, EI automaattista etenemistä
    // (moottori/vaiheensiirtymät ovat Vaihe 2, ks. HYTTI_SPEKSI.md §13).
    // pero_vaihe (sql/111) korvaa vanhan opinto_aiheet.vaihe:n — 2026-08-10.
    const vaiheSelect = document.createElement('select');
    vaiheSelect.className = 'opinto-vaihe-select opinto-vaihe-' + aihe.pero_vaihe;
    PERO_VAIHE_JARJESTYS.forEach(function(v) {
      const optio = document.createElement('option');
      optio.value = v;
      optio.textContent = OPINTO_VAIHE_NIMET[v];
      if (v === aihe.pero_vaihe) optio.selected = true;
      vaiheSelect.appendChild(optio);
    });
    vaiheSelect.addEventListener('change', async function() {
      const uusi = vaiheSelect.value;
      const nytIso = new Date().toISOString();
      const { error: vaiheError } = await db.from('opinto_aiheet').update({ pero_vaihe: uusi, viimeksi_kosketettu: nytIso }).eq('id', aihe.id);
      if (ilmoitaKirjoitusvirheesta(vaiheError, 'Vaiheen päivitys')) return;
      aihe.pero_vaihe = uusi;
      aihe.viimeksi_kosketettu = nytIso;
      vaiheSelect.className = 'opinto-vaihe-select opinto-vaihe-' + uusi;
    });
    li.appendChild(vaiheSelect);

    if (aihe.kertausjonossa) {
      const kertausMerkki = document.createElement('span');
      kertausMerkki.className = 'opinto-kertausjonossa-merkki';
      kertausMerkki.textContent = '↻';
      kertausMerkki.title = 'Kertausjonossa — ylläpitokertaus tulossa';
      li.appendChild(kertausMerkki);
    }

    // PACER-tietotyyppi (sql/111, 2026-08-10, ks. HYTTI_SPEKSI.md §7.4 /
    // sung-metodi.md §2) — käytetään ohjematriisin tarkennukseen
    // (naytaOpintoOhje/kysely.eq('pacer_tyyppi', ...)), EI enää kysytä
    // manuaalisesti joka rivillä. Katrin palaute 18.8.2026: pakotettu
    // "Tyyppi?"-valinta jokaisella rivillä tuntui niin raskaalta että hän
    // sulki koko sivun kesken solmun luonnin — sama "en halua ite päättää"
    // -periaate kuin kolmiportaisella kadenssilla. pacer_paatyyppi jää nyt
    // aina joko tyhjäksi (ohje on silloin geneerinen, ei tyyppikohtainen —
    // jo ennestään tuettu haara) tai äylyn päättelemäksi materiaalin
    // jäsennyksen yhteydessä (ks. rakennaMateriaaliJasennysPrompti).

    // PACER-ohje (2026-08-05, ks. HYTTI_SPEKSI §8) — sama "lue lisää"
    // kuin Tänään-kortilla, saatavilla myös suoraan kurssinäkymästä.
    const ohjeNappi = document.createElement('button');
    ohjeNappi.className = 'link-btn';
    ohjeNappi.textContent = 'ℹ️';
    ohjeNappi.title = 'Mitä tässä vaiheessa konkreettisesti tehdään';
    ohjeNappi.addEventListener('click', function(e) {
      e.stopPropagation();
      naytaOpintoOhje(aihe.pero_vaihe, aihe);
    });
    li.appendChild(ohjeNappi);

    // Materiaalilinkki per opiskelusolmu (2026-08-05, ks. HYTTI_SPEKSI §5) —
    // täydentää kurssitason materiaali-tekstikenttää, ei korvaa. Kevyt
    // prompt() sama malli kuin muillakin yksittäisillä tekstiarvoilla tässä
    // koodikannassa (ks. esim. hytti-kalenterisuodatin-linkki) — ei omaa
    // dialogia tämän kokoiselle tarpeelle.
    const materiaaliNappi = document.createElement('button');
    materiaaliNappi.className = 'link-btn';
    materiaaliNappi.textContent = aihe.materiaali ? '🔗' : '➕🔗';
    materiaaliNappi.title = aihe.materiaali
      ? aihe.materiaali + (aihe.viimeksi_kosketettu ? '\n\nViimeksi kosketettu: ' + new Date(aihe.viimeksi_kosketettu).toLocaleString('fi-FI') : '')
      : 'Lisää materiaalilinkki tälle opiskelusolmulle';
    materiaaliNappi.addEventListener('click', async function(e) {
      e.stopPropagation();
      const uusi = prompt('Materiaalilinkki (' + aihe.name + '):', aihe.materiaali || '');
      if (uusi === null) return;
      const { error: materiaaliError } = await db.from('opinto_aiheet').update({ materiaali: uusi.trim() || null }).eq('id', aihe.id);
      if (ilmoitaKirjoitusvirheesta(materiaaliError, 'Materiaalilinkin tallennus')) return;
      aihe.materiaali = uusi.trim() || null;
      lataaOpintoAiheet();
    });
    li.appendChild(materiaaliNappi);

    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function() {
      const { error: poistoError } = await db.from('opinto_aiheet').delete().eq('id', aihe.id);
      if (ilmoitaKirjoitusvirheesta(poistoError, 'Aiheen poisto')) return;
      lataaOpintoAiheet();
    });
    li.appendChild(poisto);

    listEl.appendChild(li);
  });
}

document.getElementById('opinto-uusi-aihe-btn').addEventListener('click', async function() {
  if (!currentOpintoKurssi) return;
  const input = document.getElementById('opinto-uusi-aihe-input');
  const nimi = input.value.trim();
  if (nimi === '') { input.focus(); return; }
  const { error } = await db.from('opinto_aiheet').insert({ name: nimi, kurssi_id: currentOpintoKurssi.id });
  if (ilmoitaKirjoitusvirheesta(error, 'Aiheen luonti')) return;
  input.value = '';
  lataaOpintoAiheet();
});
document.getElementById('opinto-uusi-aihe-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') document.getElementById('opinto-uusi-aihe-btn').click();
});

// === TEHTÄVÄNÄKYMÄ (opiskelumoottori OSA A4, 2026-08-17, ks. "Sataman
// opiskelumoottori — rakennusjärjestys") ===
// "Ohje ensin → vaiheen ohjelista täpättävänä → materiaalit." Miro-kanvaasi
// TIETOISESTI pois (B6, ei OSA A) — paperi/kuva riittää tässä vaiheessa.
// Ajanotto käynnistyy automaattisesti kun näkymä avataan ja päättyy kun
// siitä poistutaan — EI näkyvää laskuria/edistymisviivaa (B-osan Ajanotto:
// "Ei näkyvää edistymisviivaa. Ei laskuria jota pitää katsoa."), EI erillistä
// lopeta-painallusta. Käyttää olemassa olevaa opinto_sessiot-taulua
// (session-loki) samalla kirjoitusreitillä kuin manuaalinen ▶ Aloita/⏸
// Lopeta -pari muualla, vain laukaisin on nyt näkymän avaus/sulku.

function showOpintoTehtavaView() {
  piilotaKaikkiNakymat();
  document.getElementById('opinto-tehtava-view').style.display = 'block';
}

let currentOpintoAihe = null;
let opintoTehtavaSessioId = null;
let opintoTehtavaAlkoiAt = null;
// Nyt-lokista avattaessa (2026-08-17, §4) välitetään myös tämän päivän
// opinto_paivan_askeleet-rivi mukana — "✓ Merkitse tehdyksi" merkitsee sen
// tehdyksi (katoaa Nyt-lokista, §4.1 "tehty kohta katoaa kokonaan"), riippu-
// matta siirtyikö PERO-vaihe eteenpäin. Reitti-sivulta avattaessa (ei
// paivanAskel-parametria) tätä ei kosketeta — sillä ei ole tämän päivän
// askelriviä.
let currentOpintoTehtavaPaivanAskel = null;

async function avaaOpintoTehtava(aihe, paivanAskel) {
  currentOpintoAihe = aihe;
  currentOpintoTehtavaPaivanAskel = paivanAskel || null;
  showOpintoTehtavaView();
  paivitaOpintoTehtavaOtsikko();
  await paivitaOpintoTehtavaOhje();
  paivitaOpintoTehtavaMiroKoukku();
  paivitaOpintoTehtavaPriming();
  paivitaOpintoTehtavaTuntemus();
  paivitaOpintoTehtavaKierros();
  paivitaOpintoTehtavaMuutVaiheet();
  paivitaOpintoTehtavaMateriaali();
  paivitaOpintoTehtavaPerustussolmuNappi();
  document.getElementById('opinto-tehtava-jumi-vastaus').style.display = 'none';

  // Ajanotto: automaattinen alku. Session-loki EI salli kahta samanaikaista
  // avointa istuntoa (haeKeskenaOlevaSessio-periaate) — jos jokin muu istunto
  // on jäänyt auki (esim. selain suljettiin kesken), lopetetaan se hiljaa
  // ensin ettei ajanotto jää haamuina roikkumaan taustalle.
  const kesken = await haeKeskenaOlevaSessio();
  if (kesken) {
    await db.from('opinto_sessiot').update({ loppui_at: new Date().toISOString() }).eq('id', kesken.id);
  }
  const alkoiAt = new Date().toISOString();
  const { data: uusiSessio, error } = await db.from('opinto_sessiot')
    .insert({ owner_id: currentUserId, vaihe: aihe.pero_vaihe, aihe_id: aihe.id, alkoi_at: alkoiAt })
    .select().single();
  if (error) {
    console.error('Tehtävänäkymän ajanoton aloitus epäonnistui:', error);
    opintoTehtavaSessioId = null;
  } else {
    opintoTehtavaSessioId = uusiSessio.id;
    opintoTehtavaAlkoiAt = alkoiAt;
  }
}

// Pysäyttää ajanoton ja tyhjentää tehtävänäkymän tilan — yhteinen molemmille
// poistumisreiteille (takaisin-nuoli JA "Kurssin materiaalit →") jottei
// kumpikaan unohda lopettaa kesken olevaa sessiota (2026-08-18, eriytetty
// suljeOpintoTehtava():n sisältä kun "Kurssin materiaalit →" -linkin bugi
// korjattiin — ks. alla).
async function lopetaOpintoTehtavaSessioJaTyhjenna() {
  if (opintoTehtavaSessioId) {
    const { error } = await db.from('opinto_sessiot').update({ loppui_at: new Date().toISOString() }).eq('id', opintoTehtavaSessioId);
    if (error) console.error('Tehtävänäkymän ajanoton lopetus epäonnistui:', error);
    opintoTehtavaSessioId = null;
    opintoTehtavaAlkoiAt = null;
  }
  const kurssiId = currentOpintoAihe ? currentOpintoAihe.kurssi_id : null;
  currentOpintoAihe = null;
  return kurssiId;
}

async function suljeOpintoTehtava() {
  await lopetaOpintoTehtavaSessioJaTyhjenna();
  const avattuNytLokista = !!currentOpintoTehtavaPaivanAskel;
  currentOpintoTehtavaPaivanAskel = null;
  if (avattuNytLokista) {
    showHyttiView('nyt');
    await lataaOpintoPaivanAskeleet();
  } else if (currentOpintoKurssi) {
    showOpintoKurssiView();
    await lataaOpintoAiheet();
  } else {
    showHyttiView('reitti');
  }
}

document.getElementById('opinto-tehtava-back-btn').addEventListener('click', function() {
  suljeOpintoTehtava();
});

function paivitaOpintoTehtavaOtsikko() {
  document.getElementById('opinto-tehtava-title').textContent = '✱ ' + currentOpintoAihe.name + ' ✱';
  const tyyppiNimi = currentOpintoAihe.pacer_paatyyppi ? PACER_TYYPPI_NIMET[currentOpintoAihe.pacer_paatyyppi] : 'Tyyppi asettamatta';
  document.getElementById('opinto-tehtava-tyyppi-vaihe').textContent = tyyppiNimi + ' · ' + OPINTO_VAIHE_NIMET[currentOpintoAihe.pero_vaihe];
}

// Retrieval: kierros = tehdyt kierrokset + 1 (seuraava tehtävä kierros),
// katkaistu 3:een koska ohjematriisi kattaa vain 3 kierrosta per tyyppi
// ("kierroksia saa palauttaa lisää" jos yhä oppimatta, sung-metodi.md §7 —
// kierros 4+ toistaa kierroksen 3 ohjeen, ei erillistä riviä per kierros).
function opintoNykyinenKierros(aihe) {
  return Math.min((aihe.retrieval_kierrokset || 0) + 1, 3);
}

// Yleinen varaohje (2026-08-18, korjaa saman päivän regression) — PACER-
// tyypin pakkovalinta poistettiin riviltä aiemmin tänään (Katrin palaute:
// tuntui liian raskaalta), mutta tämä funktio olettI VIELÄ ettei ohjetta
// voida näyttää ollenkaan jos pacer_paatyyppi on tyhjä ("Aseta ensin
// PACER-tyyppi kurssin aihelistalta" — nappia jota ei enää ole). Suurin
// osa OLEMASSA OLEVISTA aiheista jäi tyhjäksi kun poisto tehtiin, joten
// tämä käytännössä hiljensi ohjeen useimmilta vanhoilta aiheilta.
// Yleinen, tyyppiriippumaton OPINTO_VAIHE_OHJE toimii nyt VARMANA
// varaohjeena aina kun tyyppikohtaista ohjematriisia ei löydy — ei
// koskaan enää täysin tyhjää.
async function paivitaOpintoTehtavaOhje() {
  const aihe = currentOpintoAihe;
  const listEl = document.getElementById('opinto-tehtava-ohje-lista');
  const tyhjaEl = document.getElementById('opinto-tehtava-ohje-tyhja');

  const naytaYleisohje = function() {
    listEl.innerHTML = '';
    tyhjaEl.textContent = OPINTO_VAIHE_OHJE[aihe.pero_vaihe] || '';
    tyhjaEl.style.display = 'block';
  };

  if (aihe.pero_vaihe !== 'priming' && aihe.pero_vaihe !== 'reference' && !aihe.pacer_paatyyppi) {
    naytaYleisohje();
    return;
  }

  let kysely = db.from('ohjematriisi').select().eq('pero_vaihe', aihe.pero_vaihe).order('sort_order');
  if (aihe.pero_vaihe === 'priming' || aihe.pero_vaihe === 'reference') {
    kysely = kysely.is('pacer_tyyppi', null);
  } else {
    kysely = kysely.eq('pacer_tyyppi', aihe.pacer_paatyyppi);
  }
  if (aihe.pero_vaihe === 'retrieval') {
    kysely = kysely.eq('kierros_numero', opintoNykyinenKierros(aihe));
  }
  const { data, error } = await kysely;
  if (error) {
    console.error('Ohjematriisin haku epäonnistui:', error);
    naytaYleisohje();
    return;
  }
  const rivit = data || [];
  if (rivit.length === 0) {
    naytaYleisohje();
    return;
  }
  listEl.innerHTML = '';
  tyhjaEl.style.display = 'none';
  rivit.forEach(function(rivi) {
    const li = document.createElement('li');
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'materiaali-jasennys-checkbox';
    li.appendChild(check);
    const teksti = document.createElement('span');
    teksti.textContent = rivi.ohje;
    li.appendChild(teksti);
    listEl.appendChild(li);
  });
}

// §4.9: "Miro-embed vain kun sitä tarvitaan, esim. encoding ja retrieval."
// Board A (encoding+overlearning, kurssikohtainen Frame) / Board B
// (retrieval, kierroskohtainen Frame) — ks. sql/130/131, api/miro.js.
// Ei estä muuta näkymän avautumista jos Miro-osa epäonnistuu (esim. Frame-
// luonti kaatuu verkkovirheeseen) — kutsutaan ilman awaitia avaaOpintoTehtava
// -funktiosta, päivittää vain oman kehyksensä kun/jos valmistuu.
async function paivitaOpintoTehtavaMiroKoukku() {
  const aihe = currentOpintoAihe;
  const vaihe = aihe.pero_vaihe;
  const kehys = document.getElementById('opinto-tehtava-miro-koukku');
  if (vaihe !== 'encoding' && vaihe !== 'overlearning' && vaihe !== 'retrieval') {
    kehys.style.display = 'none';
    kehys.innerHTML = '';
    return;
  }
  kehys.style.display = 'block';
  kehys.innerHTML = '<p class="selite">Ladataan kanvaasia…</p>';

  try {
    const boardId = vaihe === 'retrieval' ? haeAsetusTeksti('miro_board_b_id', null) : haeAsetusTeksti('miro_board_a_id', null);
    const frameId = vaihe === 'retrieval' ? await haeTaiLuoRetrievalMiroFrame(aihe) : await haeTaiLuoKurssinMiroFrame(aihe);
    if (!boardId || !frameId) throw new Error('Board tai Frame puuttuu');
    // Vain currentOpintoAihe on yhä sama kanvaasi auki (käyttäjä ei ole
    // ehtinyt navigoida pois odottaessa) — muuten vanha lataus kirjoittaisi
    // uuden näkymän päälle.
    if (currentOpintoAihe !== aihe) return;
    kehys.innerHTML = '<iframe class="opinto-miro-iframe" src="https://miro.com/app/live-embed/' + encodeURIComponent(boardId) + '/?moveToWidget=' + encodeURIComponent(frameId) + '&embedAutoplay=true" frameborder="0" allow="fullscreen" allowfullscreen></iframe>';
  } catch (e) {
    console.error('Miro-kanvaasin lataus epäonnistui:', e.message);
    if (currentOpintoAihe !== aihe) return;
    kehys.innerHTML = '<p class="section-empty">Kanvaasin lataus epäonnistui — voit silti jatkaa paperilla.</p>';
  }
}

// Board A: YKSI Frame per kurssi, luodaan kerran ja pysyy koko kurssin ajan
// (§10.1: "kukin solmu avautuu siitä kohdasta jota on tarkoitus työstää"
// samalla jaetulla Framella).
async function haeTaiLuoKurssinMiroFrame(aihe) {
  const { data: kurssi, error } = await db.from('opinto_kurssit').select('id, name, miro_frame_id').eq('id', aihe.kurssi_id).single();
  if (error || !kurssi) throw new Error('Kurssin haku epäonnistui Miro-framea varten');
  if (kurssi.miro_frame_id) return kurssi.miro_frame_id;

  const frameId = await luoMiroFrame('a', kurssi.name);
  const { error: tallennusError } = await db.from('opinto_kurssit').update({ miro_frame_id: frameId }).eq('id', kurssi.id);
  if (tallennusError) console.error('Kurssin Miro-framen tallennus epäonnistui (frame silti luotu, käytetään tätä kertaa):', tallennusError);
  return frameId;
}

// Board B: Frame per retrieval-kierros — "jokainen kierros alkaa täysin
// tyhjältä" (sung-metodi §6d). Kierrosta ei ole omana rivinään, joten
// miro_retrieval_frame_kierros muistaa MILLE kierrosnumerolle tallennettu
// frame_id kuuluu; jos retrieval_kierrokset on edennyt sen ohi, vanha ei
// enää täsmää ja uusi Frame luodaan.
async function haeTaiLuoRetrievalMiroFrame(aihe) {
  const nykyinenKierros = opintoNykyinenKierros(aihe);
  if (aihe.miro_retrieval_frame_id && aihe.miro_retrieval_frame_kierros === nykyinenKierros) {
    return aihe.miro_retrieval_frame_id;
  }
  const { data: kurssi } = await db.from('opinto_kurssit').select('name').eq('id', aihe.kurssi_id).single();
  const otsikko = (kurssi ? kurssi.name : '') + ' · ' + aihe.name + ' · kierros ' + nykyinenKierros;
  const frameId = await luoMiroFrame('b', otsikko);
  const { error } = await db.from('opinto_aiheet').update({ miro_retrieval_frame_id: frameId, miro_retrieval_frame_kierros: nykyinenKierros }).eq('id', aihe.id);
  if (error) console.error('Retrieval-Miro-framen tallennus epäonnistui (frame silti luotu, käytetään tätä kertaa):', error);
  aihe.miro_retrieval_frame_id = frameId;
  aihe.miro_retrieval_frame_kierros = nykyinenKierros;
  return frameId;
}

async function luoMiroFrame(board, otsikko) {
  const { data: sessioData } = await db.auth.getSession();
  const token = sessioData.session ? sessioData.session.access_token : null;
  const vastaus = await fetch('/api/miro?action=create-frame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ board: board, title: otsikko }),
  });
  const data = await vastaus.json();
  if (!vastaus.ok) throw new Error(data.error || 'Framen luonti epäonnistui');
  return data.id;
}

// Priming-vaiheessa kirjoitetaan kysymykset; encoding-vaiheesta eteenpäin
// ne näytetään luku-tilassa (sung-metodi.md §6: "nousevat esiin kun
// encoding alkaa").
function paivitaOpintoTehtavaPriming() {
  const aihe = currentOpintoAihe;
  const kirjoitusOsio = document.getElementById('opinto-tehtava-priming-kysymykset-osio');
  const naytto = document.getElementById('opinto-tehtava-priming-kysymykset-nayto');
  if (aihe.pero_vaihe === 'priming') {
    kirjoitusOsio.style.display = 'block';
    naytto.style.display = 'none';
    document.getElementById('opinto-tehtava-priming-kysymykset').value = aihe.priming_kysymykset || '';
  } else if (aihe.priming_kysymykset) {
    kirjoitusOsio.style.display = 'none';
    naytto.style.display = 'block';
    naytto.textContent = '💭 Priming-kysymykset: ' + aihe.priming_kysymykset;
  } else {
    kirjoitusOsio.style.display = 'none';
    naytto.style.display = 'none';
  }
}

document.getElementById('opinto-tehtava-priming-kysymykset').addEventListener('blur', async function(e) {
  if (!currentOpintoAihe || currentOpintoAihe.pero_vaihe !== 'priming') return;
  const uusi = e.target.value.trim() || null;
  if (uusi === currentOpintoAihe.priming_kysymykset) return;
  const { error } = await db.from('opinto_aiheet').update({ priming_kysymykset: uusi }).eq('id', currentOpintoAihe.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Priming-kysymysten tallennus')) return;
  currentOpintoAihe.priming_kysymykset = uusi;
});

// A3 tuntemus-säädin — "priming-vaiheen askel 0" (rakennusjärjestys-
// dokumentti), näytetään siis vain priming-vaiheessa, ei muissa.
function paivitaOpintoTehtavaTuntemus() {
  const aihe = currentOpintoAihe;
  const osio = document.getElementById('opinto-tehtava-tuntemus-osio');
  if (aihe.pero_vaihe !== 'priming') {
    osio.style.display = 'none';
    return;
  }
  osio.style.display = 'flex';
  document.querySelectorAll('.opinto-tuntemus-btn').forEach(function(b) {
    b.classList.toggle('active', parseInt(b.dataset.tuntemus, 10) === aihe.tuntemus);
  });
}

document.querySelectorAll('.opinto-tuntemus-btn').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    if (!currentOpintoAihe) return;
    const uusi = parseInt(btn.dataset.tuntemus, 10);
    const { error } = await db.from('opinto_aiheet').update({ tuntemus: uusi }).eq('id', currentOpintoAihe.id);
    if (ilmoitaKirjoitusvirheesta(error, 'Tuntemuksen tallennus')) return;
    currentOpintoAihe.tuntemus = uusi;
    paivitaOpintoTehtavaTuntemus();
  });
});

// A3 perustussolmu — "1-3 solmua joiden päälle tulevat kurssit rakentuvat,
// näille saa antaa enemmän aikaa". Sama toggeli-kaava kuin näkyvyyskytkimillä
// (paivitaTeemaNakyvyysNappi).
function paivitaOpintoTehtavaPerustussolmuNappi() {
  const nappi = document.getElementById('opinto-tehtava-perustussolmu-btn');
  const paalla = !!currentOpintoAihe.perustussolmu;
  nappi.classList.toggle('active', paalla);
  nappi.title = paalla ? 'Perustussolmu — napauta poistaaksesi merkinnän' : 'Merkitse perustussolmuksi';
}

document.getElementById('opinto-tehtava-perustussolmu-btn').addEventListener('click', async function() {
  if (!currentOpintoAihe) return;
  const uusi = !currentOpintoAihe.perustussolmu;
  const { error } = await db.from('opinto_aiheet').update({ perustussolmu: uusi }).eq('id', currentOpintoAihe.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Perustussolmu-merkinnän tallennus')) return;
  currentOpintoAihe.perustussolmu = uusi;
  paivitaOpintoTehtavaPerustussolmuNappi();
});

function paivitaOpintoTehtavaKierros() {
  const aihe = currentOpintoAihe;
  const el = document.getElementById('opinto-tehtava-kierros-tila');
  if (aihe.pero_vaihe !== 'retrieval') {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  el.textContent = 'Kierros ' + opintoNykyinenKierros(aihe) + ' / ' + aihe.retrieval_tavoite;
}

function paivitaOpintoTehtavaMuutVaiheet() {
  const listEl = document.getElementById('opinto-tehtava-vaihe-lista');
  listEl.innerHTML = '';
  const nykyinenIdx = PERO_VAIHE_JARJESTYS.indexOf(currentOpintoAihe.pero_vaihe);
  PERO_VAIHE_JARJESTYS.forEach(function(v, i) {
    const li = document.createElement('li');
    li.className = 'opinto-tehtava-muu-vaihe' + (v === currentOpintoAihe.pero_vaihe ? ' nykyinen' : '');
    const teksti = document.createElement('span');
    teksti.textContent = (i < nykyinenIdx ? '✓ ' : v === currentOpintoAihe.pero_vaihe ? '▶ ' : '· ') + OPINTO_VAIHE_NIMET[v];
    li.appendChild(teksti);
    // Paluu aiempaan vaiheeseen (2026-08-18, Katrin palaute: "mitä jos
    // vahingossa painaa opiskelluksi? klikkaamalla edellistä vaihetta...
    // vois päästä aiempaan vaiheeseen") — vain MENNEET vaiheet napautettavia,
    // ei tulevat (ei voi hypätä eteenpäin ohittamalla vaiheita täältä).
    if (i < nykyinenIdx) {
      li.classList.add('napautettava');
      li.addEventListener('click', function() { palaaOpintoVaiheeseen(v); });
    }
    listEl.appendChild(li);
  });
}

// Palaa aiempaan PERO-vaiheeseen (2026-08-18) — korjaa vahingossa liian
// pitkälle edenneen aiheen ilman että historiaa tuhotaan tarpeettomasti:
// nollaa VAIN 'reference'-siirtymän liput (reference_tehty/kertausjonossa,
// asetettu etenetaOpintoKohde():ssa juuri reference-vaiheeseen tultaessa)
// jos palataan sitä edeltävään vaiheeseen. retrieval_kierrokset/sr_*-kentät
// jätetään koskematta — ne kuvaavat toteutunutta kertaushistoriaa, joka on
// yhä totta vaikka vaihe palautetaan, ei jotain jota "vahinko" mitätöisi.
async function palaaOpintoVaiheeseen(vaihe) {
  const aihe = currentOpintoAihe;
  if (!aihe) return;
  const vahvistus = await naytaVahvistus(
    'Palataanko vaiheeseen ' + OPINTO_VAIHE_NIMET[vaihe] + '?',
    'Jos aihe eteni tähän vahingossa, tämä palauttaa sen takaisin.',
    'Palaa'
  );
  if (!vahvistus) return;

  const paivitys = { pero_vaihe: vaihe };
  const referenceIdx = PERO_VAIHE_JARJESTYS.indexOf('reference');
  if (PERO_VAIHE_JARJESTYS.indexOf(vaihe) < referenceIdx) {
    paivitys.reference_tehty = false;
    paivitys.kertausjonossa = false;
  }

  const { error } = await db.from('opinto_aiheet').update(paivitys).eq('id', aihe.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Vaiheeseen palaaminen')) return;
  Object.assign(aihe, paivitys);
  naytaIlmoitus('Palautettu vaiheeseen: ' + OPINTO_VAIHE_NIMET[vaihe]);

  paivitaOpintoTehtavaOtsikko();
  await paivitaOpintoTehtavaOhje();
  paivitaOpintoTehtavaPriming();
  paivitaOpintoTehtavaKierros();
  paivitaOpintoTehtavaMuutVaiheet();
}

function paivitaOpintoTehtavaMateriaali() {
  const el = document.getElementById('opinto-tehtava-materiaali');
  if (currentOpintoAihe.materiaali) {
    el.style.display = 'block';
    el.textContent = '🔗 ' + currentOpintoAihe.materiaali;
  } else {
    el.style.display = 'none';
  }
}

// "Kurssin materiaalit →" (2026-08-18 bugikorjaus, Katrin havainto: "ku
// painaa tosta mistä pitäis päästä kurssimateriaaliin ni ei vie mihinkään
// paitsi hytin etusivulle") — kutsui aiemmin VAIN suljeOpintoTehtava():aa,
// joka sulkee näkymän mihin tahansa kontekstista riippuvaan paikkaan (usein
// Nyt-tabille, ei koskaan kurssin materiaalisivulle) — linkin lupaus ja
// toteutus eivät vastanneet toisiaan. Nyt hakee aiheen oman kurssin ja avaa
// SEN sivun (jossa materiaalilista todella on).
document.getElementById('opinto-tehtava-kurssi-materiaali-linkki').addEventListener('click', async function() {
  const kurssiId = await lopetaOpintoTehtavaSessioJaTyhjenna();
  currentOpintoTehtavaPaivanAskel = null;
  if (!kurssiId) { showHyttiView('reitti'); return; }
  const { data: kurssi, error } = await db.from('opinto_kurssit').select().eq('id', kurssiId).single();
  if (error || !kurssi) { console.error('Kurssin haku epäonnistui materiaalilinkiltä:', error); showHyttiView('reitti'); return; }
  await avaaOpintoKurssi(kurssi);
});

// "✓ Merkitse tehdyksi" — käyttäytyy vaiheen mukaan (sung-metodi.md §7):
// priming/reference käyttäjä täppää itse ja vaihe etenee; retrieval laskee
// kierroksen ja etenee vasta kun tavoitemäärä täyttyy; encoding etenee
// suoraan; overlearning on vapaaehtoinen eikä etene mihinkään (jatkuvaa).
document.getElementById('opinto-tehtava-valmis-btn').addEventListener('click', async function() {
  const aihe = currentOpintoAihe;
  if (!aihe) return;
  const nytIso = new Date().toISOString();

  // Nyt-lokin päivän askel merkitään tehdyksi heti kun jotain työtä on
  // tehty tälle solmulle tänään — riippumatta siirtyykö PERO-vaihe eteenpäin
  // (esim. yksi retrieval-kierros riittää, ei tarvitse koko vaihetta
  // valmiiksi). Katoaa Nyt-lokista (§4.1). Ei koske Reitti-sivulta avattuja.
  if (currentOpintoTehtavaPaivanAskel) {
    const { error: askelError } = await db.from('opinto_paivan_askeleet')
      .update({ tila: 'tehty' }).eq('id', currentOpintoTehtavaPaivanAskel.id);
    if (askelError) console.error('Päivän askeleen kuittaus epäonnistui:', askelError);
  }

  if (aihe.pero_vaihe === 'overlearning') {
    naytaIlmoitus('Merkitty — syventäminen on vapaaehtoista, voit palata milloin vain');
    return;
  }

  const paivitys = { viimeksi_kosketettu: nytIso };

  if (aihe.pero_vaihe === 'retrieval') {
    const uusiKierrokset = (aihe.retrieval_kierrokset || 0) + 1;
    paivitys.retrieval_kierrokset = uusiKierrokset;
    if (uusiKierrokset < aihe.retrieval_tavoite) {
      // Ei vielä tavoitteessa — yksi kirjoitus, ei vaiheenvaihtoa.
      const { error } = await db.from('opinto_aiheet').update(paivitys).eq('id', aihe.id);
      if (ilmoitaKirjoitusvirheesta(error, 'Kierroksen tallennus')) return;
      Object.assign(aihe, paivitys);
      naytaIlmoitus('Kierros ' + uusiKierrokset + ' / ' + aihe.retrieval_tavoite + ' tehty');
      paivitaOpintoTehtavaKierros();
      await paivitaOpintoTehtavaOhje();
      return;
    }
    // Tavoitemäärä täynnä — kierroslaskuri ja vaiheenvaihto samassa kirjoituksessa
    // (ei kahta erillistä round-trippia, ettei uusinta-yritys virheen jälkeen
    // pääse laskemaan kierrosta kahdesti).
  }
  if (aihe.pero_vaihe === 'priming') paivitys.priming_tehty = true;
  if (aihe.pero_vaihe === 'reference') { paivitys.reference_tehty = true; paivitys.kertausjonossa = true; }

  const idx = PERO_VAIHE_JARJESTYS.indexOf(aihe.pero_vaihe);
  const seuraava = PERO_VAIHE_JARJESTYS[idx + 1];
  if (seuraava) paivitys.pero_vaihe = seuraava;

  const { error } = await db.from('opinto_aiheet').update(paivitys).eq('id', aihe.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Vaiheen tallennus')) return;
  Object.assign(aihe, paivitys);
  naytaIlmoitus(seuraava ? ('Siirtyi vaiheeseen: ' + OPINTO_VAIHE_NIMET[seuraava]) : 'Tehty');

  paivitaOpintoTehtavaOtsikko();
  await paivitaOpintoTehtavaOhje();
  paivitaOpintoTehtavaPriming();
  paivitaOpintoTehtavaKierros();
  paivitaOpintoTehtavaMuutVaiheet();
});

// "En pääse alkuun" (sung-metodi.md §8: "tarjoaa pienemmän askeleen samasta
// vaiheesta ja tallentaa merkinnän. Merkinnöistä näkee myöhemmin ovatko
// tietyt vaiheet tai tietotyypit systemaattisesti hankalia.") — kevyt loki
// (sql/124), ei älyä. Näkymä/analyysi on B-osan laajuutta, ei tässä.
document.getElementById('opinto-tehtava-jumi-btn').addEventListener('click', async function() {
  const aihe = currentOpintoAihe;
  if (!aihe) return;
  const aikaKaytettyS = opintoTehtavaAlkoiAt ? Math.round((Date.now() - new Date(opintoTehtavaAlkoiAt).getTime()) / 1000) : null;
  const { error } = await db.from('opinto_jumi_merkinnat').insert({
    owner_id: currentUserId, aihe_id: aihe.id, pero_vaihe: aihe.pero_vaihe, pacer_tyyppi: aihe.pacer_paatyyppi,
    aika_kaytetty_s: aikaKaytettyS,
  });
  if (error) console.error('Jumi-merkinnän tallennus epäonnistui:', error);
  const vastaus = document.getElementById('opinto-tehtava-jumi-vastaus');
  vastaus.style.display = 'block';
  vastaus.textContent = 'Tee vain yksi kohta yllä olevasta ohjeesta — ei koko vaihetta kerralla. Pienempikin askel vie eteenpäin.';
});

function muotoileOpintoPvm(pvmStr) {
  const d = new Date(pvmStr + 'T00:00:00');
  return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
}

async function lataaOpintoKurssinDeadlinet() {
  if (!currentOpintoKurssi) return;
  const { data, error } = await db.from('opinto_deadlinet').select().eq('kurssi_id', currentOpintoKurssi.id).order('pvm');
  if (error) {
    console.error('Deadlinejen haku epäonnistui:', error);
    return;
  }
  const listEl = document.getElementById('opinto-kurssi-deadline-lista');
  listEl.innerHTML = '';
  (data || []).forEach(function(dl) {
    const li = document.createElement('li');
    const teksti = document.createElement('span');
    teksti.textContent = (dl.tyyppi === 'koe' ? '📝 Koe' : '📤 Palautus') + ' — ' + muotoileOpintoPvm(dl.pvm);
    li.appendChild(teksti);
    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function() {
      const { error: poistoError } = await db.from('opinto_deadlinet').delete().eq('id', dl.id);
      if (ilmoitaKirjoitusvirheesta(poistoError, 'Deadlinen poisto')) return;
      lataaOpintoKurssinDeadlinet();
    });
    li.appendChild(poisto);
    listEl.appendChild(li);
  });
}

document.getElementById('opinto-kurssi-deadline-lisaa-btn').addEventListener('click', async function() {
  if (!currentOpintoKurssi) return;
  const pvm = document.getElementById('opinto-kurssi-deadline-pvm').value;
  const tyyppi = document.getElementById('opinto-kurssi-deadline-tyyppi').value;
  if (!pvm) {
    naytaIlmoitus('Valitse päivämäärä');
    return;
  }
  const { error } = await db.from('opinto_deadlinet').insert({ kurssi_id: currentOpintoKurssi.id, pvm: pvm, tyyppi: tyyppi });
  if (ilmoitaKirjoitusvirheesta(error, 'Deadlinen lisäys')) return;
  document.getElementById('opinto-kurssi-deadline-pvm').value = '';
  lataaOpintoKurssinDeadlinet();
});

// Kokonaiskartta ("näkymä 2", 2c) — LUETTAVA vilkaisu, EI ohjaava: ei
// toimintonappeja, ei napautettavia rivejä. Väri = aiheiden vaiheiden
// summa, deadline = lähin tuleva (kurssi- TAI aihetasolta). Oli oma
// showOpintoKarttaView()-näkymä, nyt kolmas Hytti-välilehti (§1b) —
// vaihdaHyttiValilehti('kartta') hoitaa näyttämisen ja lataamisen.
async function lataaOpintoKartta() {
  const { data: kurssit, error: kurssiError } = await db.from('opinto_kurssit').select().order('sort_order');
  if (kurssiError) {
    console.error('Kokonaiskartan kurssien haku epäonnistui:', kurssiError);
    return;
  }

  const sisalto = document.getElementById('opinto-kartta-sisalto');
  sisalto.innerHTML = '';
  if (!kurssit || kurssit.length === 0) {
    const tyhja = document.createElement('p');
    tyhja.className = 'section-empty';
    tyhja.textContent = 'Ei vielä kursseja.';
    sisalto.appendChild(tyhja);
    return;
  }

  for (const kurssi of kurssit) {
    const [{ data: aiheet }, { data: kurssiDeadlinet }, { data: aiheDeadlinet }] = await Promise.all([
      db.from('opinto_aiheet').select('pero_vaihe, kertausjonossa').eq('kurssi_id', kurssi.id),
      db.from('opinto_deadlinet').select('pvm').eq('kurssi_id', kurssi.id).gte('pvm', paivamaaraISO(new Date())).order('pvm').limit(1),
      db.from('opinto_deadlinet').select('pvm, aihe_id, opinto_aiheet!inner(kurssi_id)').eq('opinto_aiheet.kurssi_id', kurssi.id).gte('pvm', paivamaaraISO(new Date())).order('pvm').limit(1),
    ]);

    const kortti = document.createElement('div');
    kortti.className = 'opinto-kartta-kurssi';

    const nimi = document.createElement('div');
    nimi.className = 'opinto-kartta-kurssi-nimi';
    nimi.textContent = kurssi.name;
    kortti.appendChild(nimi);

    const palkki = document.createElement('div');
    palkki.className = 'opinto-kartta-palkki';
    const maara = (aiheet || []).length;
    if (maara === 0) {
      const lohko = document.createElement('div');
      lohko.className = 'opinto-kartta-lohko--edessa';
      lohko.style.flex = '1';
      palkki.appendChild(lohko);
    } else {
      ['hallussa', 'tyon-alla', 'edessa'].forEach(function(ryhma) {
        const osuus = aiheet.filter(function(a) { return opintoVaiheRyhma(a.pero_vaihe, a.kertausjonossa) === ryhma; }).length;
        if (osuus === 0) return;
        const lohko = document.createElement('div');
        lohko.className = 'opinto-kartta-lohko--' + ryhma;
        lohko.style.flex = String(osuus);
        palkki.appendChild(lohko);
      });
    }
    kortti.appendChild(palkki);

    // Lähin tuleva deadline joko kurssi- tai aihetasolta — yksinkertainen
    // Math.min kahdesta jo valmiiksi lajitellusta/rajatusta hakutuloksesta.
    const lahimmat = []
      .concat(kurssiDeadlinet || [])
      .concat(aiheDeadlinet || [])
      .sort(function(a, b) { return a.pvm < b.pvm ? -1 : 1; });
    if (lahimmat.length > 0) {
      const deadlineEl = document.createElement('div');
      deadlineEl.className = 'opinto-kartta-deadline';
      deadlineEl.textContent = '📅 Lähin: ' + muotoileOpintoPvm(lahimmat[0].pvm);
      kortti.appendChild(deadlineEl);
    }

    sisalto.appendChild(kortti);
  }
}

// === OPINTOPOLKU VAIHE 2: KOLMEN VOIMAN MOOTTORI (2026-07-21, ks.
// muistiinpanot.md "Opintopolku VAIHE 2" — KONSEPTIKIRJA.md 4.11 puuttuu
// vielä repon konseptikirjasta, sama huomio kuin VAIHE 1:ssä) ===
// Arvoperiaate ennallaan: "Satama tukee oppimista — ei tee oppimista
// puolesta. Äly voi järjestää MILLOIN/MITEN opiskellaan, ei ymmärtää
// sisältöä puolesta." Moottori on PUHDASTA LASKENTAA, ei yhtään älykutsua.
//
// Rakennettu VAIHE 1:n TODELLISEN toteutuksen päälle (ei suunnitellun
// konseptin, jota ei ollut olemassa) — erityisesti opinto_aiheet.vaihe
// (5 arvoa: priming/encoding/retrieval/reference/yllapito) ja
// opintoVaiheRyhma()-jaottelu (hallussa=reference+yllapito, työn alla=
// encoding+retrieval, edessä=priming) ovat VAIHE 1:n omia päätöksiä joita
// tämä moottori kunnioittaa muuttamatta.
//
// TULKINTAPÄÄTÖS (ei yksiselitteisesti spesifioitu, kirjattu näkyväksi):
// 'reference' on VAIN käsin asetettava, moottorin EI KOSKAAN automaattisesti
// asettama tai ehdottama tila — se edustaa "tiedän tämän, en aktiivisesti
// harjoittele" -tyyppistä sisältöä (esim. kertaustaulukko jota vain
// tarvittaessa katsotaan). Moottorin oma automaattinen kierto kulkee
// priming→encoding→retrieval(SR-kierto)→yllapito, EI KOSKAAN reference-tilan
// kautta — reference on käyttäjän oma sivuraide, moottori ohittaa sen
// kokonaan kandidaattijoukosta.

const OPINTO_SR_VALIT_PV = [1, 3, 7, 21]; // kevenevä kertaustahti (spec: "1pv→3pv→7pv→21pv...")
// Ylläpitovälin PITENEMINEN (2026-08-05, ks. HYTTI_SPEKSI_2026-08-05.md §10/§12
// kohta 3 — "korjattava vika": väli toisti aiemmin tasaista 60pv-sykliä
// ikuisesti, speksi vaatii pitenemisen). Ensimmäinen ylläpitokierros pysyy
// 60pv:ssä (ei muutosta vanhaan käyttäytymiseen sillä hetkellä), sen jälkeen
// kerroin 1.5 per kierros, katto 365pv ettei väli karkaa käytännössä
// ikuisuuteen. sr_interval_index jatkaa kasvamistaan retrieval-taulukon
// (OPINTO_SR_VALIT_PV) jälkeenkin — indeksi taulukon pituus = ylläpidon
// ensimmäinen kierros (kierros 0), +1 joka seuraava, ks. yllapidonSeuraavaVali.
const OPINTO_YLLAPITO_ALKUVALI_PV = 60;
const OPINTO_YLLAPITO_KERROIN = 1.5;
const OPINTO_YLLAPITO_MAX_PV = 365;
function yllapidonSeuraavaVali(yllapitoKierros) {
  return Math.min(Math.round(OPINTO_YLLAPITO_ALKUVALI_PV * Math.pow(OPINTO_YLLAPITO_KERROIN, yllapitoKierros)), OPINTO_YLLAPITO_MAX_PV);
}

const OPINTO_VAIHE_OHJE = {
  priming: 'Silmäile aihe kokonaan läpi ilman että pysähdyt yksityiskohtiin. Kysy itseltäsi: mistä tässä on kyse, mitkä ovat pääkohdat? Keskity VAIN kokonaiskuvan hahmottamiseen — et vielä opettele mitään ulkoa.',
  encoding: 'Rakenna käsitekartta tai luettelo siitä miten aiheen osat liittyvät toisiinsa ja aiemmin opittuun. Keskity YHTEYKSIIN, ei yksityiskohtien ulkoa opetteluun.',
  retrieval: 'Sulje kirja/muistiinpanot kokonaan. Selitä aihe ääneen tai kirjoita omin sanoin ilman apuja. Tarkista vasta jälkeenpäin mitä jäi puuttumaan tai epäselväksi.',
  reference: 'Tämä aihe on merkitty hallussa olevaksi viitetiedoksi — ei aktiivista kertausta, palaa tähän vain tarvittaessa.',
  yllapito: 'Nopea kertaus: käy aihe läpi omin sanoin muutamassa minuutissa, tarkista ettei mikään ole päässyt unohtumaan kokonaan.',
  overlearning: 'Vapaaehtoinen syvennys: piirrä ydinrakenne muistista ja laajenna sitä oman ajattelusi suuntaan, tai ratkaise tehtävä joka on vaikeampi kuin kurssin vaatimustaso. Ei estä aiheen valmistumista.',
};

// Kiinteät PACER-vaihekestot (2026-08-05, ks. muistiinpanot.md "Aikaikkuna")
// — VÄLIRATKAISU ennen kuin session-lokista (ks. sql/099) on kertynyt
// oikeaa dataa. Säädettävissä Asetuksista per vaihe (kesto_<vaihe>_min),
// EI kovakoodattu — kun kalibrointi joskus rakennetaan, nämä oletukset
// voidaan korvata opituilla arvoilla ilman rakennemuutosta.
const OPINTO_KESTO_ASETUS_AVAIN = {
  priming: 'kesto_priming_min',
  encoding: 'kesto_encoding_min',
  retrieval: 'kesto_retrieval_min',
  reference: 'kesto_reference_min',
  yllapito: 'kesto_yllapito_min',
  overlearning: 'kesto_overlearning_min',
};
const OPINTO_KESTO_OLETUS = { priming: 15, encoding: 45, retrieval: 20, reference: 5, yllapito: 10, overlearning: 30 };
function haeOpintoKestoMinuutteina(vaihe) {
  return haeAsetusNumero(OPINTO_KESTO_ASETUS_AVAIN[vaihe], OPINTO_KESTO_OLETUS[vaihe]);
}

function opintoTanaanPvm() {
  return paivamaaraISO(new Date());
}

function opintoEilinenPvm() {
  return paivamaaraISO(new Date(Date.now() - 86400000));
}

// Yleinen "päivä ennen X" (2026-08-18, ks. laskeOpintoPaivanAskeleet:n
// kohdePvm-parametri) — opintoEilinenPvm() on aina suhteessa OIKEAAN
// tähän hetkeen, mutta huomisen esikatselussa "eilinen" tarkoittaa TÄNÄÄN,
// ei kahta päivää sitten. Otetaan mikä tahansa ISO-päivä ja palautetaan
// sitä edeltävä.
function paivaaEnnen(pvmIso) {
  return paivamaaraISO(new Date(new Date(pvmIso + 'T00:00:00').getTime() - 86400000));
}

// KUORMA rajoittaa: sama Kuormavahdin "kellonaikameno"-määritelmä ja
// paivan_menoraja-asetus kuin muualla sovelluksessa (ks. laskeMenoja(),
// haeAsetusNumero('paivan_menoraja', 5)) — ei uutta kynnysarvoa keksitty.
//
// Huolilippu (2026-08-04, ks. muistiinpanot.md "Huolilippu") lisää TÄHÄN
// SAMAAN funktioon toisen syötteen kalenterilaskennan rinnalle — OMA, ERI
// mekanismi kuin ristiriitapaketin päällekkäisyysmerkki (sql/024,
// analysoiPaivanRistiriidat, tekstienum full/attention/none, punainen
// varattu yksinomaan sille) — huolilippu ei kosketa sitä koodia mitenkään.
// Ennakoiva, KAKSISUUNTAINEN (mennyt/tuleva ±14pv) merkintä: "tiedän että
// tästä tulee kuormaa vaikka kalenteri näyttää rauhalliselta". Paino kasvaa
// mitä lähempänä tätä päivää ja mitä vakavampi väri (🟡1 🟠2 🔴3 🏴4).
// Nostaa VAIN kuormatasoa ylöspäin, ei koskaan laske — kalenterin oma
// laskenta on aina vähintään yhtä painava lähtökohta.
// Puhdas, parametrisoitu versio huolipainon päiväkohtaisesta laskennasta
// (irrotettu 2026-08-05 kalenterin kuukausi/viikkonäkymän taustaväriä
// varten, ks. computeVisibleDayLoadLevels alempana) — sama ±14pv painotettu
// summa kuin ennenkin, mutta ottaa kohdepäivän JA valmiiksi haetun
// huoli-taulukon parametrina, jotta koko taulun voi hakea KERRAN ja laskea
// monelle päivälle sen sijaan että joka päivä tekisi oman kyselynsä.
function computeConcernWeightForDate(isoPvm, huolet) {
  const kohde = new Date(isoPvm + 'T00:00:00');
  return (huolet || []).reduce(function(summa, h) {
    const paivaEro = Math.round(Math.abs(new Date(h.pvm + 'T00:00:00') - kohde) / 86400000);
    if (paivaEro > 14) return summa;
    return summa + (15 - paivaEro) * h.vakavuus;
  }, 0);
}

async function huolienPaivanPaino(kohdePvm) {
  const { data: huolet, error } = await db.from('paivan_huolet').select('pvm, vakavuus');
  if (error) {
    console.error('Huolilippujen haku epäonnistui:', error);
    return 0;
  }
  return computeConcernWeightForDate(kohdePvm || opintoTanaanPvm(), huolet);
}

// Puhdas kynnyslogiikka irrotettu tästä samasta syystä kuin yllä
// (computeConcernWeightForDate) — ottaa valmiiksi lasketun ajallisten
// tapahtumien määrän ja huolipainon parametrina.
function deriveDayLoadLevel(ajallistenMaara, huoliPaino) {
  const raja = haeAsetusNumero('paivan_menoraja', 5);
  // KORJATTU 2026-08-18 (Katrin palaute: "pohja vois olla normaalisti ihan
  // taustan värinen") — VANHA logiikka nosti minkä tahansa nollasta
  // poikkeavan päivän vähintään 'keski'-tasolle, jolloin lähes jokainen
  // päivä näytti värillisenä. Nyt 'kevyt' kattaa alle puolet katosta —
  // aidosti rauhallinen päivä pysyy taustavärisenä, vain oikeasti
  // keskiraskas/raskas päivä erottuu.
  const keskiRaja = Math.max(1, Math.ceil(raja / 2));
  let taso = ajallistenMaara >= raja ? 'raskas' : (ajallistenMaara >= keskiRaja ? 'keski' : 'kevyt');
  const huoliRaskasKynnys = haeAsetusNumero('huoli_raskas_kynnys', 30);
  const huoliKeskiKynnys = haeAsetusNumero('huoli_keski_kynnys', 10);
  if (huoliPaino >= huoliRaskasKynnys) taso = 'raskas';
  else if (huoliPaino >= huoliKeskiKynnys && taso === 'kevyt') taso = 'keski';
  return taso;
}

async function opintoPaivanKuorma(kohdePvm) {
  const tanaan = kohdePvm || opintoTanaanPvm();
  // KORJATTU 2026-08-18: laski aiemmin KAIKKI päivän kellonaikamenot
  // riippumatta kenen kalenterissa ne ovat — Katrin täsmennys (ks.
  // piirraNytLoki-osion henkilö-suodatin) on että Juhan omassa
  // kalenterissa oleva meno ei ole hänen kuormaansa. Sama suodatin tähän,
  // muuten kuormataso (ja siten PACER-vaihesuositus/tavoiteaskelmäärä)
  // vääristyi menoista jotka eivät oikeasti koske Katria.
  const { data: tapahtumat } = await db.from('kalenteri_tapahtumat')
    .select('event_time, location, kalenteri_syotteet!inner(henkilo)')
    .eq('event_date', tanaan).not('event_time', 'is', null);
  const omat = (tapahtumat || []).filter(function(t) {
    const h = t.kalenteri_syotteet ? t.kalenteri_syotteet.henkilo : null;
    return h === omaHenkilo || h === null;
  });
  // Bussilla kulkeminen on omaa kuormaansa kalenterimenon lisäksi (Katrin
  // pyyntö 18.8.: "if i need to use bus add 1 to calendar event count just
  // for using bus besides events that are already in calendar"). +1 per
  // tapahtuma jolla on TUNNETTU Föli-matka — ei per bussietappi, meno+paluu
  // yhdessä on yksi lisäkuorma.
  const bussiLisa = omat.filter(function(t) { return !!etsiTunnettuFoliMatka(t); }).length;
  const omienMaara = omat.length + bussiLisa;
  const huoliPaino = await huolienPaivanPaino(tanaan);
  return deriveDayLoadLevel(omienMaara, huoliPaino);
}

// === REITIN VIIKKOKALENTERI (SATAMA_SPEKSI.md §5.1, 2026-08-17) ===
// Uudelleenkäyttää OLEMASSA OLEVAN Kalenteri-sivun viikko-ruudukkoa
// (piirraViikkoAikajana + apufunktiot, script.js:n Kalenteri-osio) sen
// sijaan että rakentaisi rinnakkaisen — sama 07-23-aikajana, sama
// päällekkäisyyskäsittely, sama kuormavärjäys. Ainoa uusi kytkentä on
// opinto_sessiot-toteumamerkit (paivanSessiot-parametri, valinnainen —
// EI riko vanhaa Kalenteri-sivun kutsua, ks. sen oma kommentti).
//
// Selattavissa viikko kerrallaan (Katrin pyyntö 18.8.2026: "voi kliksutella
// vaikka monen kuukauden päädänkin" — tarkistaakseen että Lukkarikoneen
// luennot näkyvät myös tulevilla viikoilla). Oma reittiViikkoPvm, EI jaettu
// Kalenteri-sivun kalenteriPvm:n kanssa — eri välilehti, eri selailutila.
let reittiViikkoPvm = new Date();

function siirraReittiViikkoa(suunta) {
  reittiViikkoPvm.setDate(reittiViikkoPvm.getDate() + suunta * 7);
  lataaReittiViikko();
}

async function lataaReittiViikko() {
  const sisalto = document.getElementById('reitti-viikko-sisalto');
  if (!sisalto) return;
  const alku = viikonAlku(reittiViikkoPvm);
  const loppu = new Date(alku);
  loppu.setDate(loppu.getDate() + 6);
  const alkuIso = paivamaaraISO(alku);
  const loppuIso = paivamaaraISO(loppu);
  const otsikkoEl = document.getElementById('reitti-viikko-otsikko');
  if (otsikkoEl) otsikkoEl.textContent = alku.getDate() + '.' + (alku.getMonth() + 1) + '. – ' + loppu.getDate() + '.' + (loppu.getMonth() + 1) + '.';
  const isoPaivat = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(alku);
    d.setDate(d.getDate() + i);
    isoPaivat.push(paivamaaraISO(d));
  }

  await paivitaAsetukset();

  const tanaanIso = opintoTanaanPvm();
  const [{ data: haetut, error }, henkselitLista, { data: sessiot }, { data: suunnitellut }] = await Promise.all([
    db.from('kalenteri_tapahtumat').select('*, kalenteri_syotteet(vari, henkilo, scope)')
      .gte('event_date', alkuIso).lte('event_date', loppuIso)
      .order('event_date').order('event_time', { nullsFirst: false }),
    fetchVisibleHenkselit(alkuIso, loppuIso),
    db.from('opinto_sessiot').select('aihe_id, alkoi_at, loppui_at')
      .gte('alkoi_at', alkuIso + 'T00:00:00').lte('alkoi_at', loppuIso + 'T23:59:59').not('loppui_at', 'is', null),
    // Kolmiportainen kadenssi Taso 1:n asettama tavoiteikkuna (18.8.2026) —
    // EI näytetä menneille päiville (ei koskaan fiktiivistä "olisi pitänyt"),
    // vain tänään/tulevaisuudessa. Rajaus tehdään piirraViikkoAikajanassa
    // per-päivä (tanaanIso saatavilla siellä), tässä haetaan koko näkyvä
    // väli kerralla.
    db.from('opinto_aiheet').select('id, name, tavoiteikkuna, opinto_kurssit!inner(owner_id, status, name)')
      .eq('opinto_kurssit.owner_id', currentUserId).eq('opinto_kurssit.status', 'aktiivinen')
      .gte('tavoiteikkuna', alkuIso >= tanaanIso ? alkuIso : tanaanIso).lte('tavoiteikkuna', loppuIso),
  ]);
  if (error) {
    console.error('Reitin viikkokalenterin haku epäonnistui:', error);
    return;
  }

  const data = (haetut || []).map(function(t) {
    return Object.assign({}, t, {
      _vari: t.kalenteri_syotteet ? t.kalenteri_syotteet.vari : null,
      _henkilo: t.kalenteri_syotteet ? t.kalenteri_syotteet.henkilo : null,
      _scope: t.kalenteri_syotteet ? t.kalenteri_syotteet.scope : null,
    });
  });
  const suunnitellutAiheet = (suunnitellut || []).map(function(a) {
    return { id: a.id, name: a.name, tavoiteikkuna: a.tavoiteikkuna, kurssiNimi: a.opinto_kurssit.name };
  });

  const signaalit = await computeVisibleDaySignals(data, isoPaivat);
  sisalto.innerHTML = '';
  piirraViikkoAikajana(sisalto, data, alku, signaalit.kuormaTasot, henkselitLista, sessiot || [], suunnitellutAiheet);
}

// === LÄHESTYVÄT MÄÄRÄAJAT (§5.1 kohta 2: "3 seuraavaa palautusta") ===
// itslearning-integraatiota ei ole (§8.2, ei rakennettu) — ainoa
// sisääntulo tälle on opinto_deadlinet, joko käsin lisätty tai äylyn
// materiaalinjäsennyksestä poimittu (§8.3). Vain aktiivisten kurssien
// TULEVAT deadlinet, lähin ensin, enintään 3 (spekin oma raja).
async function lataaReittiDeadlinet() {
  const listEl = document.getElementById('reitti-deadline-lista');
  if (!listEl) return;
  const tanaan = opintoTanaanPvm();

  const { data: kurssit, error: kurssiError } = await db.from('opinto_kurssit').select('id, name').eq('owner_id', currentUserId).eq('status', 'aktiivinen');
  if (kurssiError) { console.error('Kurssien haku deadline-listaa varten epäonnistui:', kurssiError); return; }
  const kurssiKartta = {};
  (kurssit || []).forEach(function(k) { kurssiKartta[k.id] = k.name; });
  const kurssiIdt = (kurssit || []).map(function(k) { return k.id; });

  listEl.innerHTML = '';
  if (kurssiIdt.length === 0) {
    paivitaTehtavatMaaraajatNakyvyys();
    return;
  }

  const [{ data: kurssiDl }, { data: aiheDl }] = await Promise.all([
    db.from('opinto_deadlinet').select('id, kurssi_id, pvm, tyyppi').in('kurssi_id', kurssiIdt).gte('pvm', tanaan),
    db.from('opinto_deadlinet').select('id, pvm, tyyppi, opinto_aiheet!inner(name, kurssi_id)').in('opinto_aiheet.kurssi_id', kurssiIdt).gte('pvm', tanaan),
  ]);

  const kaikki = []
    .concat((kurssiDl || []).map(function(d) { return { id: d.id, pvm: d.pvm, teksti: kurssiKartta[d.kurssi_id] + ', ' + (d.tyyppi === 'koe' ? 'koe' : 'palautus') }; }))
    .concat((aiheDl || []).map(function(d) { return { id: d.id, pvm: d.pvm, teksti: kurssiKartta[d.opinto_aiheet.kurssi_id] + ' — ' + d.opinto_aiheet.name + ', ' + (d.tyyppi === 'koe' ? 'koe' : 'palautus') }; }))
    .sort(function(a, b) { return a.pvm < b.pvm ? -1 : 1; })
    .slice(0, 3);

  kaikki.forEach(function(d) {
    const li = document.createElement('li');
    const teksti = document.createElement('span');
    teksti.textContent = d.teksti;
    li.appendChild(teksti);
    const pvmSpan = document.createElement('span');
    pvmSpan.className = 'pieni';
    pvmSpan.textContent = muotoileOpintoPvm(d.pvm);
    li.appendChild(pvmSpan);

    // Tiedostoliite (VAIHE2_JA_LISAYKSET_CODELLE.md kohta 2, sql/133) — sama
    // editorin-kautta-liittäminen kuin kurssimateriaalilla, kohteena tämä
    // deadline-rivi. "+" jos ei vielä liitetty, muuten pelkkä ilmoitus
    // lukumäärästä (ei erillistä listausta tässä tiiviissä näkymässä).
    const liiteNappi = document.createElement('button');
    liiteNappi.className = 'link-btn';
    liiteNappi.textContent = '📎';
    liiteNappi.title = 'Liitä tiedosto tähän määräaikaan';
    liiteNappi.addEventListener('click', function(e) {
      e.stopPropagation();
      materiaaliKohdeDeadline = { id: d.id, teksti: d.teksti };
      avaaJaettuEditori({ tyyppi: 'laituri', otsikko: '✱ LIITE ✱' });
    });
    li.appendChild(liiteNappi);

    listEl.appendChild(li);
  });
  paivitaTehtavatMaaraajatNakyvyys();
}

// Tehtävät+määräajat-kortin näkyvyys (2026-08-18, ks. index.html:n oma
// kommentti) — kaksi eri lataajaa (lataaHyttiPaanakyma tehtäville,
// lataaReittiDeadlinet määräajoille) päivittävät saman kortin näkyvyyden
// itsenäisesti, kumpi tahansa valmistuu ensin — funktio tarkistaa AINA
// molempien listojen SEN HETKISEN DOM-tilan, ei jää kiinni suoritusjärjestykseen.
function paivitaTehtavatMaaraajatNakyvyys() {
  const osio = document.getElementById('hytti-tehtavat-osio');
  const divider = document.getElementById('hytti-tehtavat-divider');
  if (!osio) return;
  const tehtavia = document.getElementById('hytti-tehtavat-list').children.length;
  const maaraaikoja = document.getElementById('reitti-deadline-lista').children.length;
  const nayta = (tehtavia + maaraaikoja) > 0;
  osio.style.display = nayta ? 'block' : 'none';
  if (divider) divider.style.display = nayta ? 'block' : 'none';
}

// === KERTAUSJONO (§5.3) — RAKENNETTU. Kurssien alla näkyvät solmut jotka
// ovat ylläpidossa/kertauksessa, täpättävä "tämä alkaa unohtua" -nappi
// aikaistaa seuraavan kertauksen enintään 5 päivän päähän (ei pyyhi
// historiaa, ei nollaa väliä — VAIN sr_next_review lyhenee tarvittaessa). ===
async function lataaReittiKertausjono() {
  const listEl = document.getElementById('reitti-kertausjono-lista');
  const osioEl = document.getElementById('reitti-kertausjono-osio');
  if (!listEl) return;

  const { data: aiheet, error } = await db.from('opinto_aiheet')
    .select('id, name, sr_next_review, opinto_kurssit!inner(name, status)')
    .eq('kertausjonossa', true).eq('opinto_kurssit.status', 'aktiivinen').eq('opinto_kurssit.owner_id', currentUserId)
    .order('sr_next_review', { nullsFirst: true });
  if (error) { console.error('Kertausjonon haku epäonnistui:', error); return; }

  listEl.innerHTML = '';
  const rivit = aiheet || [];
  // Koko osio pois näkyvistä kun tyhjä, ei "ei kertausjonossa olevia
  // solmuja" -tekstiä (Katrin yleissääntö 2026-08-18).
  osioEl.style.display = rivit.length === 0 ? 'none' : 'block';

  rivit.forEach(function(aihe) {
    const li = document.createElement('li');
    const teksti = document.createElement('span');
    teksti.textContent = aihe.name + ' · ' + aihe.opinto_kurssit.name;
    li.appendChild(teksti);

    const unohtuuNappi = document.createElement('button');
    unohtuuNappi.className = 'unohtuu';
    unohtuuNappi.textContent = 'Tämä alkaa unohtua';
    unohtuuNappi.addEventListener('click', async function() {
      const viiden_pv_paasta = paivamaaraISO(new Date(Date.now() + 5 * 86400000));
      // Vain AIKAISTAA — ei koskaan siirrä myöhemmäksi jos kertaus on jo
      // lähempänä kuin 5 pv (§5.3: "enintään 5 päivän päähän painamisesta").
      const nykyinen = aihe.sr_next_review;
      if (nykyinen && nykyinen <= viiden_pv_paasta) {
        naytaIlmoitus('Kertaus on jo lähempänä kuin 5 päivän päässä.');
        return;
      }
      const { error: paivitysError } = await db.from('opinto_aiheet').update({ sr_next_review: viiden_pv_paasta }).eq('id', aihe.id);
      if (ilmoitaKirjoitusvirheesta(paivitysError, 'Kertauksen aikaistus')) return;
      naytaIlmoitus('Kertaus siirretty ' + muotoileOpintoPvm(viiden_pv_paasta) + ' -päivään.');
      lataaReittiKertausjono();
    });
    li.appendChild(unohtuuNappi);

    listEl.appendChild(li);
  });
}

// === KOLMIPORTAINEN KADENSSI, TASO 1 (VAIHE2_JA_LISAYKSET_CODELLE.md,
// 18.8.2026) — "kerran syksylle, manuaalisesti käynnistettävä". EI
// sisältöpäätös (doc:n oma jaottelu): sijoittelee JO OLEMASSA OLEVAT
// aiheet aikajanalle jo hyväksytyillä säännöillä, ei keksi mitään uutta.
// ===

// Viikon opiskelukapasiteetti tunteina — sama minuuttiruudukko-blokkaus
// kuin piirraNytLoki:ssä (hytti_opiskeluaika miinus hytti_suljetut_ikkunat),
// mutta KAIKILLE seitsemälle viikonpäivälle kerralla. Rakenteellinen
// yläraja ("mahtuuko ylipäätään"), ei ota huomioon jo aikataulutettuja
// yksittäisiä kalenteritapahtumia (ne vaihtelevat viikoittain).
async function laskeViikonOpiskeluKapasiteettiTunteina() {
  const [{ data: opiskeluajat }, { data: suljetut }] = await Promise.all([
    db.from('hytti_opiskeluaika').select('viikonpaiva, alkaa, paattyy').eq('owner_id', currentUserId),
    db.from('hytti_suljetut_ikkunat').select('viikonpaiva, alkaa, paattyy').eq('owner_id', currentUserId),
  ]);
  let minuutteja = 0;
  for (let vp = 0; vp < 7; vp++) {
    const paivan = (opiskeluajat || []).filter(function(o) { return o.viikonpaiva === vp; });
    if (paivan.length === 0) continue;
    const varattu = new Array(1440).fill(true);
    paivan.forEach(function(ikkuna) {
      const a = aikaMinuutteina(ikkuna.alkaa.slice(0, 5)), b = aikaMinuutteina(ikkuna.paattyy.slice(0, 5));
      for (let m = a; m < b; m++) varattu[m] = false;
    });
    (suljetut || []).filter(function(s) { return s.viikonpaiva === vp; }).forEach(function(ikkuna) {
      const a = aikaMinuutteina(ikkuna.alkaa.slice(0, 5)), b = aikaMinuutteina(ikkuna.paattyy.slice(0, 5));
      for (let m = a; m < b; m++) varattu[m] = true;
    });
    for (let m = 0; m < 1440; m++) { if (!varattu[m]) minuutteja++; }
  }
  return minuutteja / 60;
}

// Kurssin "loppupvm" ei ole oma kenttä missään skeemassa — käytetään
// kurssin MYÖHÄISINTÄ tunnettua deadlinea (kurssi- TAI aihetasoinen)
// proxyna ("mihin mennessä tämän pitää olla valmis"). Kurssi jolla ei ole
// yhtään deadlinea ei voi saada tavoitetahtia — ei tiedetä mihin mennessä.
//
// Luentotuntien vähennys (spekin oma maininta, "josta aikataulutetut
// Lukkarikone-luennot vähennetään") JÄTETTY POIS: Lukkarikoneen
// kalenteritapahtumilla ei ole mitään linkkiä opinto_kurssit-riveihin (eri
// järjestelmät, ei yhteistä avainta) — automaattinen vähennys vaatisi
// hauraan nimenperusteisen täsmäytyksen kurssin nimen ja tapahtuman
// title-tekstin välillä. tuntitarve on siis TÄYSI op_maara × tuntia_per_op
// -arvio, kerrottu Katrille tuloksessa, ei piiloteltu.
async function suoritaOpintoTavoitetahtiLaskenta() {
  const tanaan = opintoTanaanPvm();
  const tanaanD = new Date(tanaan + 'T00:00:00');
  const tuntiaPerOp = haeAsetusNumero('tuntia_per_op', 27);

  const { data: kurssit, error: kurssiError } = await db.from('opinto_kurssit')
    .select('id, name, op_maara').eq('owner_id', currentUserId).eq('status', 'aktiivinen');
  if (kurssiError) { console.error('Kurssien haku tavoitetahtia varten epäonnistui:', kurssiError); return null; }
  if ((kurssit || []).length === 0) return { tulokset: [], kapasiteettiTunteja: 0, tarveTunteja: 0, ylitysTunteja: 0 };

  const kurssiIdt = kurssit.map(function(k) { return k.id; });
  const [{ data: kurssiDl, error: kurssiDlError }, { data: aiheDl, error: aiheDlError }, { data: aiheet, error: aiheetError }, kapasiteettiTunteja] = await Promise.all([
    db.from('opinto_deadlinet').select('kurssi_id, pvm').in('kurssi_id', kurssiIdt),
    db.from('opinto_deadlinet').select('pvm, opinto_aiheet!inner(kurssi_id)').in('opinto_aiheet.kurssi_id', kurssiIdt),
    db.from('opinto_aiheet').select('id, kurssi_id, sort_order, perustussolmu, reference_tehty').in('kurssi_id', kurssiIdt),
    laskeViikonOpiskeluKapasiteettiTunteina(),
  ]);
  if (kurssiDlError || aiheDlError || aiheetError) {
    console.error('Deadline/aihe-datan haku tavoitetahtia varten epäonnistui:', kurssiDlError || aiheDlError || aiheetError);
    return null;
  }

  const loppupvmKartta = {};
  (kurssiDl || []).forEach(function(d) {
    if (!loppupvmKartta[d.kurssi_id] || d.pvm > loppupvmKartta[d.kurssi_id]) loppupvmKartta[d.kurssi_id] = d.pvm;
  });
  (aiheDl || []).forEach(function(d) {
    const kid = d.opinto_aiheet.kurssi_id;
    if (!loppupvmKartta[kid] || d.pvm > loppupvmKartta[kid]) loppupvmKartta[kid] = d.pvm;
  });

  const aiheetKurssilla = {};
  (aiheet || []).forEach(function(a) { (aiheetKurssilla[a.kurssi_id] = aiheetKurssilla[a.kurssi_id] || []).push(a); });

  const tulokset = [];
  let tarveTunteja = 0;

  for (const kurssi of kurssit) {
    if (kurssi.op_maara == null) { tulokset.push({ kurssi: kurssi, tila: 'ei_op_maaraa' }); continue; }
    const loppupvm = loppupvmKartta[kurssi.id];
    if (!loppupvm) { tulokset.push({ kurssi: kurssi, tila: 'ei_deadlinea' }); continue; }

    const viikkojaJaljella = Math.max(1, (new Date(loppupvm + 'T00:00:00') - tanaanD) / (7 * 86400000));
    const tuntitarve = kurssi.op_maara * tuntiaPerOp;
    const tuntiaViikossa = tuntitarve / viikkojaJaljella;
    tarveTunteja += tuntiaViikossa;

    // Jäljellä olevat aiheet: reference_tehty merkitsee PACER-kierroksen
    // valmiiksi (viimeinen vaihe ennen ylläpitoa) — nämä eivät enää
    // tarvitse uutta tavoiteikkunaa.
    const jaljella = (aiheetKurssilla[kurssi.id] || [])
      .filter(function(a) { return !a.reference_tehty; })
      .sort(function(a, b) {
        // Perustussolmut ETUKÄTEEN (etupainotteinen aikajana — perustussolmu
        // opitaan ensin, sama periaate kuin moottorin muualla soveltama
        // "perustussolmu painottaa"), sort_order toissijaisena.
        if (a.perustussolmu !== b.perustussolmu) return a.perustussolmu ? -1 : 1;
        return a.sort_order - b.sort_order;
      });

    if (jaljella.length === 0) { tulokset.push({ kurssi: kurssi, tila: 'ei_jaljella_olevia_aiheita' }); continue; }

    // Tasainen jako aikajanalle tänään→loppupvm — ei yritä painottaa
    // aihekohtaista laajuutta, sitä ei ole tietona (ei arviointikenttää
    // per aihe tässä vaiheessa).
    const paiviaJaljella = Math.max(jaljella.length, Math.round((new Date(loppupvm + 'T00:00:00') - tanaanD) / 86400000));
    const askel = paiviaJaljella / jaljella.length;
    for (let i = 0; i < jaljella.length; i++) {
      const pvm = new Date(tanaanD.getTime() + Math.round((i + 1) * askel) * 86400000);
      const { error } = await db.from('opinto_aiheet').update({ tavoiteikkuna: paivamaaraISO(pvm) }).eq('id', jaljella[i].id);
      if (error) console.error('Tavoiteikkunan tallennus epäonnistui (aihe ' + jaljella[i].id + '):', error);
    }

    tulokset.push({ kurssi: kurssi, tila: 'laskettu', tuntiaViikossa: tuntiaViikossa, loppupvm: loppupvm, aiheitaPaivitetty: jaljella.length });
  }

  return { tulokset: tulokset, kapasiteettiTunteja: kapasiteettiTunteja, tarveTunteja: tarveTunteja, ylitysTunteja: Math.max(0, tarveTunteja - kapasiteettiTunteja) };
}

function piirraOpintoTavoitetahtiTulos(tulos) {
  const kotelo = document.getElementById('opinto-tavoitetahti-tulos');
  kotelo.innerHTML = '';
  kotelo.style.display = 'block';

  if (tulos.tulokset.length === 0) {
    kotelo.textContent = 'Ei aktiivisia kursseja.';
    return;
  }

  const yhteenveto = document.createElement('p');
  yhteenveto.className = 'opinto-tavoitetahti-yhteenveto' + (tulos.ylitysTunteja > 0 ? ' ylittaa' : '');
  yhteenveto.textContent = 'Tarve ' + tulos.tarveTunteja.toFixed(1) + ' h/vko · Kapasiteetti ' + tulos.kapasiteettiTunteja.toFixed(1) + ' h/vko'
    + (tulos.ylitysTunteja > 0 ? ' — ei mahdu, ylitys ' + tulos.ylitysTunteja.toFixed(1) + ' h/vko' : ' — mahtuu');
  kotelo.appendChild(yhteenveto);

  const TILA_TEKSTI = {
    ei_op_maaraa: 'ei opintopistemäärää — täytä kurssin sivulla',
    ei_deadlinea: 'ei yhtään deadlinea — ei voida asettaa tavoitetahtia',
    ei_jaljella_olevia_aiheita: 'kaikki aiheet jo kierroksen loppupäässä',
  };
  tulos.tulokset.forEach(function(r) {
    const rivi = document.createElement('p');
    rivi.className = 'opinto-tavoitetahti-rivi';
    if (r.tila === 'laskettu') {
      rivi.textContent = r.kurssi.name + ': ' + r.tuntiaViikossa.toFixed(1) + ' h/vko, ' + r.aiheitaPaivitetty + ' aihetta aikataulutettu ' + muotoileOpintoPvm(r.loppupvm) + ' asti';
    } else {
      rivi.textContent = r.kurssi.name + ': ' + (TILA_TEKSTI[r.tila] || r.tila);
      rivi.classList.add('ohitettu');
    }
    kotelo.appendChild(rivi);
  });
}

document.getElementById('opinto-tavoitetahti-btn').addEventListener('click', async function() {
  const nappi = this;
  const alkuperainenTeksti = nappi.textContent;
  nappi.textContent = 'Lasketaan…';
  try {
    const tulos = await suoritaOpintoTavoitetahtiLaskenta();
    if (!tulos) { naytaIlmoitus('Tavoitetahdin laskenta epäonnistui.'); return; }
    piirraOpintoTavoitetahtiTulos(tulos);
    naytaIlmoitus('Tavoitetahti laskettu.');
  } finally {
    nappi.textContent = alkuperainenTeksti;
  }
});

// === KOLMIPORTAINEN KADENSSI, TASO 2 (VAIHE2_JA_LISAYKSET_CODELLE.md,
// 18.8.2026) — "kahden viikon välein, ainoa taso joka yhä kysyy". Kategoria
// 1 -päätös (doc:n oma jaottelu): kurssin tietoinen alibudjetointi vaikuttaa
// arvosanaan/tutkintoon, joten EHDOTTAA, ei vaihda itse. Sama malli kuin
// silta_ehdotukset_odottavat: moottori kirjoittaa rivin, Katri hyväksyy/
// hylkää dismissible-kortilla. ===

// Kadenssi (2 viikkoa) ilman cronia — sama periaate kuin Taso 3:n päätös
// tänään (ei kahta rinnakkaista laskijaa): asetukset-taulun aikaleima
// riittää, tarkistetaan luonnollisesti kun Reitti-välilehti muutenkin
// ladataan, ei tarvitse omaa ajastustaan.
async function suoritaHoitotasoDiagnoosiJosAika() {
  const viimeksi = haeAsetusTeksti('taso2_viimeksi_ajettu', null);
  const tanaan = opintoTanaanPvm();
  if (viimeksi) {
    const paiviaSitten = Math.round((new Date(tanaan + 'T00:00:00') - new Date(viimeksi + 'T00:00:00')) / 86400000);
    if (paiviaSitten < 14) return;
  }
  await suoritaHoitotasoDiagnoosi();
  await db.from('asetukset').upsert({ key: 'taso2_viimeksi_ajettu', value: tanaan }, { onConflict: 'key' });
  asetuksetKartta['taso2_viimeksi_ajettu'] = tanaan;
}

// Jälkeenjäänti = aihe jonka tavoiteikkuna (Taso 1:n asettama) on jo
// mennyt UMPEEN eikä aihe ole silti reference_tehty (PACER-kierros ei
// valmis). Vain aiheet joilla on ylipäätään tavoiteikkuna lasketaan mukaan
// nimittäjään — Taso 1:tä ei ole vielä ajettu -> ei diagnoosia, ei väärää
// hälytystä tyhjästä datasta.
async function suoritaHoitotasoDiagnoosi() {
  const tanaan = opintoTanaanPvm();
  const kynnys = haeAsetusNumero('hoitotaso_jalkeenjaanti_kynnys', 40);

  const { data: kurssit, error: kurssiError } = await db.from('opinto_kurssit')
    .select('id, name').eq('owner_id', currentUserId).eq('status', 'aktiivinen').eq('hoitotaso', 'taysi');
  if (kurssiError) { console.error('Kurssien haku hoitotaso-diagnoosia varten epäonnistui:', kurssiError); return; }
  if ((kurssit || []).length === 0) return;

  const { data: aiheet, error: aiheError } = await db.from('opinto_aiheet')
    .select('kurssi_id, tavoiteikkuna, reference_tehty').in('kurssi_id', kurssit.map(function(k) { return k.id; })).not('tavoiteikkuna', 'is', null);
  if (aiheError) { console.error('Aihedatan haku hoitotaso-diagnoosia varten epäonnistui:', aiheError); return; }

  const { data: odottavat, error: odottavatError } = await db.from('opinto_hoitotaso_ehdotukset')
    .select('kurssi_id').eq('owner_id', currentUserId).eq('kasitelty', false);
  if (odottavatError) { console.error('Odottavien ehdotusten haku epäonnistui:', odottavatError); return; }
  const jollaJoOdottaa = new Set((odottavat || []).map(function(r) { return r.kurssi_id; }));

  const ryhmat = {};
  (aiheet || []).forEach(function(a) { (ryhmat[a.kurssi_id] = ryhmat[a.kurssi_id] || []).push(a); });

  for (const kurssi of kurssit) {
    if (jollaJoOdottaa.has(kurssi.id)) continue;
    const omat = ryhmat[kurssi.id] || [];
    if (omat.length === 0) continue;
    const jaljessa = omat.filter(function(a) { return a.tavoiteikkuna < tanaan && !a.reference_tehty; });
    const prosentti = Math.round((jaljessa.length / omat.length) * 100);
    if (prosentti < kynnys) continue;

    const perustelu = jaljessa.length + '/' + omat.length + ' aihetta (' + prosentti + ' %) on jäljessä tavoitetahdista.';
    const { error: insertError } = await db.from('opinto_hoitotaso_ehdotukset').insert({
      owner_id: currentUserId, kurssi_id: kurssi.id, ehdotettu_hoitotaso: 'kevyt', perustelu: perustelu,
    });
    if (insertError) console.error('Hoitotasoehdotuksen tallennus epäonnistui:', insertError);
  }
}

async function lataaHoitotasoEhdotukset() {
  const kontti = document.getElementById('opinto-hoitotaso-ehdotukset');
  if (!kontti) return;
  const { data, error } = await db.from('opinto_hoitotaso_ehdotukset')
    .select('*, opinto_kurssit(name)').eq('owner_id', currentUserId).eq('kasitelty', false).order('luotu_at');
  if (error) { console.error('Hoitotasoehdotusten haku epäonnistui:', error); return; }

  kontti.innerHTML = '';
  (data || []).forEach(function(ehdotus) {
    const kortti = document.createElement('div');
    kortti.className = 'opinto-hoitotaso-kortti';

    const otsikko = document.createElement('p');
    otsikko.className = 'opinto-hoitotaso-otsikko';
    otsikko.textContent = (ehdotus.opinto_kurssit ? ehdotus.opinto_kurssit.name : 'Kurssi') + ' jää jälkeen';
    kortti.appendChild(otsikko);

    const perustelu = document.createElement('p');
    perustelu.className = 'opinto-hoitotaso-perustelu';
    perustelu.textContent = ehdotus.perustelu + ' Kevennetäänkö hoitotaso kevyeksi?';
    kortti.appendChild(perustelu);

    const napit = document.createElement('div');
    napit.className = 'opinto-hoitotaso-napit';

    const hyvaksy = document.createElement('button');
    hyvaksy.className = 'opinto-hoitotaso-hyvaksy';
    hyvaksy.textContent = 'Kevennä';
    hyvaksy.addEventListener('click', async function() {
      const { error: paivitysError } = await db.from('opinto_kurssit').update({ hoitotaso: ehdotus.ehdotettu_hoitotaso }).eq('id', ehdotus.kurssi_id);
      if (ilmoitaKirjoitusvirheesta(paivitysError, 'Hoitotason kevennys')) return;
      await db.from('opinto_hoitotaso_ehdotukset').update({ kasitelty: true }).eq('id', ehdotus.id);
      naytaIlmoitus('Hoitotaso kevennetty.');
      lataaHoitotasoEhdotukset();
    });
    napit.appendChild(hyvaksy);

    const hylkaa = document.createElement('button');
    hylkaa.className = 'opinto-hoitotaso-hylkaa';
    hylkaa.textContent = 'Ei nyt';
    hylkaa.addEventListener('click', async function() {
      await db.from('opinto_hoitotaso_ehdotukset').update({ kasitelty: true }).eq('id', ehdotus.id);
      lataaHoitotasoEhdotukset();
    });
    napit.appendChild(hylkaa);

    kortti.appendChild(napit);
    kontti.appendChild(kortti);
  });
}

// PACER jäsentää: aihe on ylipäätään kandidaatti VAIN jos sen nykyinen vaihe
// sallii toiminnan juuri nyt. priming/encoding ovat AINA valmiita (ei SR-
// ajastusta, ensikertaista työtä). retrieval/yllapito vaativat että
// sr_next_review on jo koittanut (ei ehdoteta kertausta ennen aikaansa).
// reference EI OLE KOSKAAN kandidaatti (ks. tulkintapäätös yllä).
function opintoOnkoRipe(aihe, tanaan) {
  const vaihe = kohdeVaihe(aihe);
  if (vaihe === 'priming' || vaihe === 'encoding' || vaihe === 'overlearning') return true;
  if (vaihe === 'retrieval' || vaihe === 'yllapito') {
    return !aihe.sr_next_review || aihe.sr_next_review <= tanaan;
  }
  return false;
}

// DEADLINE vetää: lähin tuleva deadline (kurssi- TAI aihetasolta, kumpi
// tahansa lähempänä) kasvattaa painoarvoa käänteisesti päivien määrään —
// mitä lähempänä, sitä suurempi pisteet. Ei deadlinea → pieni tasapaino
// (silti kelpaa, interleaving muiden kurssien kanssa ei tyrehdy).
function opintoDeadlinePaino(aihe, kurssienDeadlinet, aiheidenDeadlinet, tanaan) {
  const omat = (aiheidenDeadlinet[aihe.id] || []).map(function(d) { return d.pvm; });
  const kurssin = (kurssienDeadlinet[aihe.kurssi_id] || []).map(function(d) { return d.pvm; });
  const kaikki = omat.concat(kurssin).filter(function(pvm) { return pvm >= tanaan; }).sort();
  if (kaikki.length === 0) return 1;
  const paivia = Math.round((new Date(kaikki[0] + 'T00:00:00') - new Date(tanaan + 'T00:00:00')) / 86400000);
  return 1000 / (paivia + 1);
}

// KUORMA rajoittaa (osa 2): raskaana päivänä VAIN kevyt kertaus (retrieval/
// yllapito) kelpaa ollenkaan — uusi encoding/priming suodatetaan kokonaan
// pois (iso negatiivinen pistemäärä, suodatetaan alempana). Kevyenä päivänä
// uusi työ saa pienen bonuksen ("kevyt päivä → raskaampi encoding sallitaan").
function opintoKuormaBonus(vaihe, kuormaTaso) {
  const kevytTyo = vaihe === 'retrieval' || vaihe === 'yllapito' || vaihe === 'overlearning';
  if (kuormaTaso === 'raskas') return kevytTyo ? 50 : -1000;
  if (kuormaTaso === 'kevyt') return kevytTyo ? 0 : 20;
  return 0;
}

// "Boost-jatkuvuus" (Kolmiportainen kadenssi, Taso 3, VAIHE2_JA_LISAYKSET_
// CODELLE.md 18.8.2026): eilen 'tehty'-tilaan merkitty aihe/solmu ei saa
// automaattisesti kruunautua tämän päivän ykköseksi uudelleen — PIENI
// SAKKO (ei poissulkeminen, ei koskaan tier1:n kova deadline-etusija, joka
// ei edes katso pisteet-kenttää). Useimmiten tämä ei edes laukea, koska
// 'tehty' vie PACER-vaiheen eteenpäin (etenetaOpintoKohde) ja seuraava
// vaihe pisteytyy jo eri tavalla — sakko koskee vain tapausta jossa sama
// rivi on silti tänäänkin kelvollinen ehdokas (esim. sama päivä useampi
// encoding-osa, tai retrieval jonka sr_next_review sattuu olemaan tänään
// heti eilisen jälkeen).
function opintoEilenTehtyPaino(id, eilenTehdytIdt) {
  return eilenTehdytIdt.has(id) ? -30 : 0;
}

// Ikkunan hyödyntämisbonus (2026-08-18, Katrin havainto Boost-napeista:
// "boost is locked in one theme only minutes change, isn't it so that if
// you have 60min would be best tackle different job than in 15min"). Ennen
// tätä ikkunaMin toimi VAIN kattona (ks. aiheEhdokkaat/solmuEhdokkaat-
// suodatus) — kaikki ikkunaan mahtuvat kohteet olivat pisteytyksessä
// samanarvoisia riippumatta siitä käyttikö kohde 15 vai 60 minuuttia
// ikkunasta, joten sama lyhyt kohde (esim. 15min retrieval) saattoi voittaa
// pisteillä JOKA ikkunakoolla eikä 60min-ikkuna koskaan päätynyt eri,
// isompaan tekemiseen (esim. 45min encoding) vaikka aikaa olisi riittänyt.
// Pieni bonus (max 12) joka kasvaa sitä mukaa kun kohde käyttää suuremman
// osan ikkunasta — tarkoituksella PIENI verrattuna deadline-painoihin
// (opintoDeadlinePaino voi olla satoja pisteitä), jotta oikea kiireellisyys
// voittaa aina, mutta muuten samanarvoisten ehdokkaiden välillä isompi
// ikkuna suosii isompaa tekemistä pelkän "mahtuuko" sijaan. Ei vaikuta
// tavalliseen päivän täyttöön (ikkunaMin=null silloin, bonus 0).
function opintoIkkunaSopivuusBonus(kohteenKestoMin, ikkunaMin) {
  if (!ikkunaMin) return 0;
  return Math.round((Math.min(kohteenKestoMin, ikkunaMin) / ikkunaMin) * 12);
}

// Jumi-merkintä (sung-metodi.md §8, "En pääse alkuun") tarkoittaa "yritin,
// en päässyt eteenpäin" — EI "vältä tätä". Pieni POSITIIVINEN paino eilisen
// jumin jälkeen pitää aiheen näkyvillä sen sijaan että pisteytys hautaisi
// sen hiljaa — sama periaate kuin §19:n kertausjono-huomautus ("keskeneräinen
// encoding ei ole syy lykätä"). Tulkintapäätös, ei Katrin eksplisiittisesti
// vahvistama arvo — helppo säätää jos tuntuu väärältä käytännössä.
function opintoJumiPaino(aiheId, eilenJumitAiheIdt) {
  return eilenJumitAiheIdt.has(aiheId) ? 15 : 0;
}

// Taitosolmujen AND-portti (2026-08-04/05, ks. sql/092, muistiinpanot.md
// "Taitosolmut"/"Siltasolmut"): solmu on kandidaatti vain jos KAIKKI sen
// 'tarvitsee'-kohteet ovat vähintään encoding-vaiheessa (tyhjä esitietolista
// läpäisee automaattisesti — juurisolmu on aina tarjottavissa). 'liittyy'-
// kaaret EIVÄT koskaan vaikuta porttiin. Ottaa solmut/kaaret PARAMETRINA
// (ei omaa fetchiä) — sama data tarvitaan myös kiireellisyyden leviämiseen
// (ks. levitaSiltaKiireellisyys), haettu kerran laskeOpintoPaivanAskeleet:ssä.
function taitosolmuOnValmis(solmu, tarvitseeKaaret, vaiheKartta) {
  const kohteet = tarvitseeKaaret.filter(function(k) { return k.from_id === solmu.id; }).map(function(k) { return k.to_id; });
  return kohteet.every(function(kohdeId) { return vaiheKartta[kohdeId] !== 'priming'; });
}

// Sama jatkuva deadline-painokaava kuin opintoDeadlinePaino(), mutta yhdelle
// tavoiteikkuna-kentälle (ei kurssi/aihe-deadline-listaa) — käytössä nyt
// opinto_aiheiden pehmeän kuukausitavoitteen pisteytykseen (ks.
// laskeOpintoPaivanAskeleet). Ei tavoiteikkunaa/mennyt jo ohi → pieni
// tasapainopaino, sama käytös kuin deadlinettomalla aiheella.
function opintoDeadlinePainoSolmu(kohde, tanaan) {
  if (!kohde.tavoiteikkuna || kohde.tavoiteikkuna < tanaan) return 1;
  const paivia = Math.round((new Date(kohde.tavoiteikkuna + 'T00:00:00') - new Date(tanaan + 'T00:00:00')) / 86400000);
  return 1000 / (paivia + 1);
}

// Ryhmäavain interleaving-suosintaa varten: opinto_aiheet ryhmittyy kurssin
// mukaan, taitosolmut karkeasti `lahde`-kentän alkuosan mukaan — kevyt
// heuristiikka, ei vaadi omaa kurssikäsitettä.
function opintoRyhmaAvain(ehdokas) {
  if (ehdokas.tyyppi === 'aihe') return 'aihe:' + ehdokas.item.kurssi_id;
  const lahde = ehdokas.item.lahde || '';
  return 'solmu:' + lahde.split(',')[0].split('–')[0].trim();
}

// === SILTASOLMUJEN IKKUNAPAINO (2026-08-05, ks. muistiinpanot.md
// "Siltasolmut") === Siltasolmulla (taitosolmu joka viittaa >=1 opinto_
// aiheeseen taitosolmu_viittaukset-taulun kautta) EI ole omaa deadlinea —
// paino on KÄÄNTEINEN kurssitehtävään verrattuna: korkein HETI kun ikkuna
// aukeaa, laskee kohti sulkeutumista. Peruste: sillan arvo on siinä että se
// on hallussa ENNEN kuin sitä tarvitaan, ei koetta edeltävänä iltana opittuna.
//
// Ikkuna AUKEAA kun jokin viittaava aihe on koskettanut käsitettä (vaihe !=
// priming) — pelkkä tila-tarkistus, ei tarvitse tallentaa "milloin aukesi":
// kaava käyttää vain jäljellä olevia päiviä sulkeutumiseen, joten muoto on jo
// oikea (suuri heti alussa, pieni lopussa) ilman erillistä aikaleimaa.
function siltaOnAuki(viittaavatAiheet) {
  return viittaavatAiheet.length > 0 && viittaavatAiheet.some(function(a) { return a.pero_vaihe !== 'priming'; });
}

// Sulkeutuminen = aikaisin viittaavien aiheiden deadline (kurssi/aihe-taso
// TAI aiheen oma pehmeä tavoiteikkuna) MIINUS puskuri (asetus
// silta_puskuri_paivia) — riittävästi ennen deadlinea että ehtii KÄYTTÄÄ
// opittua, ei vain lukea sitä viime hetkellä. Palauttaa null jos viittaavilla
// aiheilla ei ole tiedossa yhtään deadlinea (silloin käytetään matalaa
// tasapainopainoa, ks. siltaOmaPaino).
function siltaPaivaaSulkeutumiseen(viittaavatAiheet, kurssienDeadlinet, aiheidenDeadlinet, tanaan, puskuriPaivia) {
  let lahin = null;
  viittaavatAiheet.forEach(function(a) {
    const omat = (aiheidenDeadlinet[a.id] || []).map(function(d) { return d.pvm; });
    const kurssin = (kurssienDeadlinet[a.kurssi_id] || []).map(function(d) { return d.pvm; });
    const pehmea = a.tavoiteikkuna ? [a.tavoiteikkuna] : [];
    const kaikki = omat.concat(kurssin).concat(pehmea).filter(function(pvm) { return pvm >= tanaan; }).sort();
    if (kaikki.length && (lahin === null || kaikki[0] < lahin)) lahin = kaikki[0];
  });
  if (lahin === null) return null;
  return Math.round((new Date(lahin + 'T00:00:00') - new Date(tanaan + 'T00:00:00')) / 86400000) - puskuriPaivia;
}

// Solmun OMA paino — lasketaan JOKAISELLE solmulle riippumatta siitä onko se
// itse tänään tarjottavissa (AND-porttia EI tarkisteta tässä), koska
// kiireellisyyden leviäminen (levitaSiltaKiireellisyys) tarvitsee lukossa
// olevankin solmun oman painon vetämään sen esitietoja kärkeen.
// Kaava on ensimmäinen versio, ei kalibroitu oikealla datalla — säädettävissä
// kun nähdään miltä oikea tarjonta tuntuu (sama "arki testaa" -periaate kuin
// muillakin tämän moottorin vakioilla).
function siltaOmaPaino(solmu, viittaukset, aiheKartta, kurssienDeadlinet, aiheidenDeadlinet, tanaan, puskuriPaivia) {
  const viittaavatAiheet = (viittaukset[solmu.id] || []).map(function(aiheId) { return aiheKartta[aiheId]; }).filter(Boolean);
  if (!siltaOnAuki(viittaavatAiheet)) return 0;
  const paivia = siltaPaivaaSulkeutumiseen(viittaavatAiheet, kurssienDeadlinet, aiheidenDeadlinet, tanaan, puskuriPaivia);
  if (paivia === null) return 20; // ikkuna auki mutta ei tiedossa olevaa deadlinea — matala tasapainopaino
  if (paivia <= 0) return 1; // sulkeutunut — ei häviä, putoaa normaaliin PACER/SR-ylläpitokiertoon kuten mikä tahansa solmu
  return paivia * 10;
}

// Kiireellisyyden leviäminen tarvitsee-kaarten yli (2026-08-05, Katrin
// esimerkki: koe nojaa X:ään, X tarvitsee Y:tä → Y:n pitää nousta NYT, ei
// vasta kun X itse tulee ajankohtaiseksi). Vaimennettuna, syvyys asetuksesta
// (silta_leviamissyvyys) — MAX per kohde, ei summa, jottei tiheä graafi
// räjäytä painoja kertymällä useasta lähteestä. Toimii VAIN taitosolmujen
// omassa tarvitsee-graafissa (opinto_aiheilla ei ole kaaria toisiinsa).
const SILTA_VAIMENNUS_PER_ASKEL = 0.5;
function levitaSiltaKiireellisyys(omatPainot, tarvitseeKaaret, syvyys) {
  const lopulliset = new Map(omatPainot);
  let rintama = new Map(omatPainot);
  for (let askel = 0; askel < syvyys && rintama.size > 0; askel++) {
    const uusiRintama = new Map();
    rintama.forEach(function(paino, fromId) {
      tarvitseeKaaret.filter(function(k) { return k.from_id === fromId; }).forEach(function(k) {
        const peritty = paino * SILTA_VAIMENNUS_PER_ASKEL;
        if (peritty > (lopulliset.get(k.to_id) || 0)) lopulliset.set(k.to_id, peritty);
        if (peritty > (uusiRintama.get(k.to_id) || 0)) uusiRintama.set(k.to_id, peritty);
      });
    });
    rintama = uusiRintama;
  }
  return lopulliset;
}

// Päivien määrä lähimpään KOVAAN kurssideadlineen (opinto_deadlinet — EI
// aiheen pehmeää tavoiteikkunaa, ks. alla miksi) — käytetään VAIN TASO 1:n
// kovan etusijan tunnistukseen. Tietoinen rajaus: pehmeä tavoiteikkuna ei saa
// laukaista "myöhässä oleva pakollinen palautus" -tason etusijaa, koska se ei
// ole todellinen deadline vaan ohjaava tavoite — sekoittaisi kaksi eri
// vakavuustasoa yhteen.
function opintoPaivaaDeadlineen(aihe, kurssienDeadlinet, aiheidenDeadlinet, tanaan) {
  const omat = (aiheidenDeadlinet[aihe.id] || []).map(function(d) { return d.pvm; });
  const kurssin = (kurssienDeadlinet[aihe.kurssi_id] || []).map(function(d) { return d.pvm; });
  const kaikki = omat.concat(kurssin).sort();
  if (kaikki.length === 0) return null;
  return Math.round((new Date(kaikki[0] + 'T00:00:00') - new Date(tanaan + 'T00:00:00')) / 86400000);
}

// Kolmen voiman moottori — palauttaa 1-2 { tyyppi, item }-kandidaattia
// tälle päivälle, tyyppi 'aihe' (opinto_aiheet) tai 'taitosolmu' (taitosolmut/
// sillat). SAMA moottori molemmille, ei rinnakkaista konetta.
//
// KAKSITASOINEN valinta (2026-08-05, Katrin kova sääntö: "umpeutuva
// kurssitehtävän deadline voittaa AINA siltaehdotuksen"):
//   TASO 1 — aloittamattomat (vaihe=priming) kurssitehtävät joiden KOVA
//   deadline on lähellä/mennyt (kurssi_kiireellisyys_paivia-asetus) menevät
//   AINA ensin, silta ei pääse edes kilpailemaan samalla kierroksella.
//   TASO 2 — normaali pisteytys (deadline-paino + PACER-kuormabonus,
//   interleaving eri ryhmien välillä) lopulle tilalle, kurssit+sillat yhdessä.
// Tämä on koodissa rikkomaton sääntö, ei vain todennäköinen pistelaskun
// lopputulos.
// poissuljetutAiheIdt/poissuljetutSolmuIdt (Set, valinnainen) — käytössä
// täydennyskutsuissa (ks. tayttaOpintoPaivanAskeleet) jottei sama aihe/
// taitosolmu tarjoudu uudelleen samana päivänä jo tarjottujen rinnalle.
// maxAskeliaYlikirjoitus (valinnainen) — täydennyskutsu pyytää täsmälleen
// sen verran kuin puuttuu, ei aina koko päivän oletusmäärää uudelleen.
// ikkunaMin (valinnainen, ks. muistiinpanot.md "Aikaikkuna") — kun asetettu,
// suodattaa POIS kandidaatit joiden vaihekohtainen kestoarvio (ks.
// haeOpintoKestoMinuutteina) ei mahdu ikkunaan — koskee myös TASO 1:tä
// (jos ei mahdu aikaan, ei näytetä vaikka olisi kiireellinen — aikaikkunan
// koko pointti on ettei näytetä mitään mikä ei mahdu).

// Päivän tavoiteaskelmäärä (2026-08-18, Katrin pyyntö: "9.15-15.30 täytä
// koko se aika, jotta ei tarvis tehdä illalla" — tietoinen käännös pois
// aiemmasta "1-2 asiaa/pv" -oletuksesta, ks. suodataNakyvatAskeleet-
// kommentin historia). EI muuta itse pisteytys/suodatuslogiikkaa —
// raskaana päivänä kelpaavat silti VAIN kevyet vaiheet (opintoKuormaBonus
// palauttaa -1000 raskaalle uudelle työlle, suodattuu pois automaattisesti),
// joten katon nosto ei riko olemassa olevaa kuormasuojaa. Todellinen
// sijoittelu (mahtuuko oikeasti tänään) tapahtuu piirraNytLoki:ssa, joka
// JÄTTÄÄ POIS kaiken mikä ei mahdu vapaaseen aikaan — tämä on vain
// yläraja kuinka montaa ehdokasta ylipäätään pyydetään, ei tae että
// kaikki näytetään.
function opintoPaivanTavoiteAskelmaara(kuormaTaso) {
  return kuormaTaso === 'raskas' ? 3 : 8;
}
// kohdePvm (2026-08-18, ks. muistiinpanot.md "Huomisen esikatselu") —
// valinnainen ISO-päivä, oletus tänään (opintoTanaanPvm()) jos ei annettu.
// Mahdollistaa SAMAN moottorin ajamisen "kuin se olisi kohdePvm" ilman
// rinnakkaista laskukonetta — kaikki päivämäärään sidotut osat (kuorma,
// eilinen/jumi-haku, deadline-etäisyys) käyttävät tätä, eivät kovakoodattua
// "oikeaa nyt":ää.
async function laskeOpintoPaivanAskeleet(maxAskeliaYlikirjoitus, poissuljetutAiheIdt, poissuljetutSolmuIdt, ikkunaMin, kohdePvm) {
  // Henkselit-esto (2026-08-05, ks. muistiinpanot.md "Henkselit") — YKSI
  // choke point kaikille kolmelle kutsupaikalle (lataaOpintoPaivanAskeleet,
  // tayttaOpintoPaivanAskeleet, etsiIkkunaanSopivaAskel), ks. Henkselit-speksi
  // "seuraavaa opiskeluaskelta ei ehdoteta oletuksena". Per-henkilö
  // ohitettavissa (henkselit-esta-hytti-toggle asetuksissa) — oletus PÄÄLLÄ.
  if (omaHenkilo && henkselitEstaaHytin(omaHenkilo) && await onkoOmaHenkselitAktiivinenNyt()) {
    return [];
  }
  const tanaan = kohdePvm || opintoTanaanPvm();

  const [{ data: aiheet, error: aiheError }, { data: solmut, error: solmutError }, { data: kaaret, error: kaaretError }, { data: viittausRivit, error: viittausError }] = await Promise.all([
    db.from('opinto_aiheet').select('*, opinto_kurssit!inner(owner_id, name, status)').eq('opinto_kurssit.owner_id', currentUserId).eq('opinto_kurssit.status', 'aktiivinen'),
    db.from('taitosolmut').select().eq('owner_id', currentUserId),
    db.from('taito_kaaret').select('from_id, to_id, tyyppi').eq('owner_id', currentUserId),
    db.from('taitosolmu_viittaukset').select('taitosolmu_id, aihe_id').eq('owner_id', currentUserId),
  ]);
  // Armollinen virheenkäsittely (2026-08-05, ks. HYTTI_SPEKSI_2026-08-05.md
  // §12 kohta 1 / §16 kohta 3, korjaa auditissa löydetyn kriittisen vian):
  // opinto_aiheet on pakollinen (VARSINAINEN kurssirata, ei mitään
  // ehdotuksia ilman sitä) — aiheError on siis edelleen fataali. MUTTA
  // silta-puoli (taitosolmut/taito_kaaret/taitosolmu_viittaukset) on
  // VALINNAINEN LISÄKERROS, ei koskaan saa hiljentää KOKO moottoria jos se
  // yksin epäonnistuu (esim. migraatio ajamatta) — pelkkiä opinto_aiheet-
  // käyttäjiä ei saa jättää tyhjän päälle. Alempana kaikki silta-muuttujat
  // (kaikkiSolmut/tarvitseeKaaret/viittausRivit) käyttävät jo `|| []`
  // -oletusta, joten pelkkä virheen kirjaus + tyhjä data riittää.
  if (aiheError) {
    console.error('Moottorin aihe-datan haku epäonnistui:', aiheError);
    return [];
  }
  if (solmutError || kaaretError || viittausError) {
    console.error('Moottorin silta-datan haku epäonnistui (jatketaan silti pelkillä opinto_aiheilla):', solmutError || kaaretError || viittausError);
  }
  const kaikkiAiheet = aiheet || [];
  const kaikkiSolmut = solmut || [];
  const tarvitseeKaaret = (kaaret || []).filter(function(k) { return k.tyyppi === 'tarvitsee'; });

  const kurssiIdt = Array.from(new Set(kaikkiAiheet.map(function(a) { return a.kurssi_id; })));
  const aiheIdt = kaikkiAiheet.map(function(a) { return a.id; });

  const eilen = paivaaEnnen(tanaan);
  const [{ data: kurssiDl }, { data: aiheDl }, { data: eilenAskeleet }, { data: eilenJumit }] = await Promise.all([
    db.from('opinto_deadlinet').select('kurssi_id, pvm').in('kurssi_id', kurssiIdt.length ? kurssiIdt : [-1]),
    db.from('opinto_deadlinet').select('aihe_id, pvm').in('aihe_id', aiheIdt.length ? aiheIdt : [-1]),
    db.from('opinto_paivan_askeleet').select('aihe_id, taitosolmu_id').eq('owner_id', currentUserId).eq('pvm', eilen).eq('tila', 'tehty'),
    db.from('opinto_jumi_merkinnat').select('aihe_id').eq('owner_id', currentUserId).gte('created_at', eilen + 'T00:00:00').lt('created_at', tanaan + 'T00:00:00'),
  ]);
  const kurssienDeadlinet = {};
  (kurssiDl || []).forEach(function(d) { if (!d.kurssi_id) return; (kurssienDeadlinet[d.kurssi_id] = kurssienDeadlinet[d.kurssi_id] || []).push(d); });
  const aiheidenDeadlinet = {};
  (aiheDl || []).forEach(function(d) { if (!d.aihe_id) return; (aiheidenDeadlinet[d.aihe_id] = aiheidenDeadlinet[d.aihe_id] || []).push(d); });
  const eilenTehdytAiheIdt = new Set((eilenAskeleet || []).filter(function(r) { return r.aihe_id; }).map(function(r) { return r.aihe_id; }));
  const eilenTehdytSolmuIdt = new Set((eilenAskeleet || []).filter(function(r) { return r.taitosolmu_id; }).map(function(r) { return r.taitosolmu_id; }));
  const eilenJumitAiheIdt = new Set((eilenJumit || []).map(function(r) { return r.aihe_id; }));

  const kuormaTaso = await opintoPaivanKuorma(tanaan);
  const maxAskelia = maxAskeliaYlikirjoitus != null ? maxAskeliaYlikirjoitus : opintoPaivanTavoiteAskelmaara(kuormaTaso);

  // --- Siltojen ikkunapaino + kiireellisyyden leviäminen (KAIKILLE
  // solmuille, ei vain tänään valmiille — ks. siltaOmaPaino-kommentti) ---
  const aiheKartta = {};
  kaikkiAiheet.forEach(function(a) { aiheKartta[a.id] = a; });
  const viittaukset = {};
  (viittausRivit || []).forEach(function(v) { (viittaukset[v.taitosolmu_id] = viittaukset[v.taitosolmu_id] || []).push(v.aihe_id); });
  const puskuriPaivia = haeAsetusNumero('silta_puskuri_paivia', 7);
  const leviamisSyvyys = haeAsetusNumero('silta_leviamissyvyys', 2);

  const omatSiltaPainot = new Map();
  kaikkiSolmut.forEach(function(s) {
    omatSiltaPainot.set(s.id, siltaOmaPaino(s, viittaukset, aiheKartta, kurssienDeadlinet, aiheidenDeadlinet, tanaan, puskuriPaivia));
  });
  const lopullisetSiltaPainot = levitaSiltaKiireellisyys(omatSiltaPainot, tarvitseeKaaret, leviamisSyvyys);

  // --- AND-portti + PACER-valmius: mitkä solmut ovat TÄNÄÄN tarjottavissa ---
  const vaiheKartta = {};
  kaikkiSolmut.forEach(function(s) { vaiheKartta[s.id] = s.vaihe; });
  const taitosolmuKandidaatit = kaikkiSolmut.filter(function(s) {
    if (poissuljetutSolmuIdt && poissuljetutSolmuIdt.has(s.id)) return false;
    if (ikkunaMin && haeOpintoKestoMinuutteina(s.vaihe) > ikkunaMin) return false;
    return taitosolmuOnValmis(s, tarvitseeKaaret, vaiheKartta) && opintoOnkoRipe(s, tanaan);
  });

  // --- Kurssin sisäinen esitietojärjestys (sort_order), 2026-08-18, Katrin
  // pyyntö: Math Roadmap -kurssille tuotiin 22 uutta opinto_aiheet-riviä
  // sort_order-kentällä loogiseen esitietojärjestykseen (esim. "Right
  // triangle trigonometry" ennen "Unit circle & radians"), mutta mikään ei
  // aiemmin estänyt moottoria ehdottamasta myöhempää aihetta ennen
  // aiempaa. Taitosolmut/taito_kaaret ovat LUKITULLA päätöksellä varattu
  // usean SAMANAIKAISEN kurssin yhteisille silta-käsitteille (ei tämän
  // saman-kurssin-sisäisen järjestyksen mallintamiseen) — siksi kevyt oma
  // sort_order-esto tässä, ei uusi taito_kaaret-käyttötapa.
  //
  // "Estävä" aihe = sama kurssi, PIENEMPI sort_order, !reference_tehty
  // (= sama "PACER-kierros kesken" -lippu jota "Laske tavoitetahti"
  // -ominaisuus jo käyttää "jäljellä olevat aiheet" -suodattimena yllä,
  // ei uutta rinnakkaista valmius-käsitettä). Jousto: jos estävä aihe on
  // PAHASTI myöhässä (oma tavoiteikkuna yli SORT_ORDER_JOUSTO_PAIVIA
  // päivää sitten) EIKÄ sillä ole minkäänlaista edistystä (yhä priming-
  // vaiheessa, ei siis edes aloitettu) se lakkaa estämästä — muuten yksi
  // jumiutunut aihe tukkisi koko kurssin loputtomiin. Sama kynnys ei koske
  // encoding/retrieval-vaiheessa jo olevaa aihetta: sillä ON edistystä,
  // joten se saa jatkaa estämistä vaikka olisi myöhässä — vain "ei
  // mitään edistystä" -tapaus vapautetaan.
  const SORT_ORDER_JOUSTO_PAIVIA = haeAsetusNumero('sort_order_jousto_paivia', 14);
  const pienimmatEstavatSortOrderit = new Map();
  kaikkiAiheet.forEach(function(a) {
    if (a.sort_order == null || a.kurssi_id == null) return;
    if (a.reference_tehty) return;
    const paivaaMyohassa = a.tavoiteikkuna
      ? Math.round((new Date(tanaan + 'T00:00:00') - new Date(a.tavoiteikkuna + 'T00:00:00')) / 86400000)
      : -1;
    const pahastiMyohassaEikaEdistysta = a.pero_vaihe === 'priming' && paivaaMyohassa > SORT_ORDER_JOUSTO_PAIVIA;
    if (pahastiMyohassaEikaEdistysta) return;
    const nykyinenRaja = pienimmatEstavatSortOrderit.get(a.kurssi_id);
    if (nykyinenRaja === undefined || a.sort_order < nykyinenRaja) pienimmatEstavatSortOrderit.set(a.kurssi_id, a.sort_order);
  });
  function aiheenSortOrderEstaa(a) {
    if (a.sort_order == null || a.kurssi_id == null) return false;
    const estavaRaja = pienimmatEstavatSortOrderit.get(a.kurssi_id);
    return estavaRaja !== undefined && estavaRaja < a.sort_order;
  }

  // --- Pisteytys: aiheen paino = suurempi kovasta opinto_deadlinet-listasta
  // TAI omasta pehmeästä tavoiteikkunasta (opintoDeadlinePaino-kaava toimii
  // sellaisenaan tavoiteikkunalle koska se on samanmuotoinen yhden-kentän
  // deadline kuin taitosolmuilla) ---
  const aiheEhdokkaat = kaikkiAiheet
    .filter(function(a) {
      if (poissuljetutAiheIdt && poissuljetutAiheIdt.has(a.id)) return false;
      if (ikkunaMin && haeOpintoKestoMinuutteina(a.pero_vaihe) > ikkunaMin) return false;
      if (aiheenSortOrderEstaa(a)) return false;
      return opintoOnkoRipe(a, tanaan);
    })
    .map(function(a) {
      const kovaPaino = opintoDeadlinePaino(a, kurssienDeadlinet, aiheidenDeadlinet, tanaan);
      const pehmeaPaino = opintoDeadlinePainoSolmu(a, tanaan);
      const pisteet = Math.max(kovaPaino, pehmeaPaino) + opintoKuormaBonus(a.pero_vaihe, kuormaTaso)
        + opintoEilenTehtyPaino(a.id, eilenTehdytAiheIdt) + opintoJumiPaino(a.id, eilenJumitAiheIdt)
        + opintoIkkunaSopivuusBonus(haeOpintoKestoMinuutteina(a.pero_vaihe), ikkunaMin);
      return { tyyppi: 'aihe', item: a, pisteet: pisteet };
    });
  const solmuEhdokkaat = taitosolmuKandidaatit.map(function(s) {
    const pisteet = (lopullisetSiltaPainot.get(s.id) || 0) + opintoKuormaBonus(s.vaihe, kuormaTaso)
      + opintoEilenTehtyPaino(s.id, eilenTehdytSolmuIdt)
      + opintoIkkunaSopivuusBonus(haeOpintoKestoMinuutteina(s.vaihe), ikkunaMin);
    return { tyyppi: 'taitosolmu', item: s, pisteet: pisteet };
  });

  const ehdokkaat = aiheEhdokkaat.concat(solmuEhdokkaat)
    .filter(function(e) { return e.pisteet > -500; })
    .sort(function(a, b) { return b.pisteet - a.pisteet; });

  // --- TASO 1: kova etusija ---
  const kurssiKiireellisyysPaivia = haeAsetusNumero('kurssi_kiireellisyys_paivia', 3);
  const tier1 = aiheEhdokkaat.filter(function(e) {
    if (e.item.pero_vaihe !== 'priming') return false;
    const d = opintoPaivaaDeadlineen(e.item, kurssienDeadlinet, aiheidenDeadlinet, tanaan);
    return d !== null && d <= kurssiKiireellisyysPaivia;
  });

  const valitut = [];
  const kaytetytRyhmat = new Set();
  for (const e of tier1) {
    if (valitut.length >= maxAskelia) break;
    valitut.push(e);
    kaytetytRyhmat.add(opintoRyhmaAvain(e));
  }

  // --- TASO 2: normaali pisteytys + interleaving lopulle tilalle ---
  if (valitut.length < maxAskelia) {
    const loput = ehdokkaat.filter(function(e) { return tier1.indexOf(e) === -1; });
    for (const e of loput) {
      if (valitut.length >= maxAskelia) break;
      const ryhma = opintoRyhmaAvain(e);
      const onkoMuitaRyhmia = loput.some(function(muu) { return !kaytetytRyhmat.has(opintoRyhmaAvain(muu)); });
      if (valitut.length > tier1.length && kaytetytRyhmat.has(ryhma) && onkoMuitaRyhmia) continue;
      valitut.push(e);
      kaytetytRyhmat.add(ryhma);
    }
    // Interleaving-suosinta voi jättää paikkoja täyttämättä — täytetään
    // loput ilman rajoitusta.
    if (valitut.length < maxAskelia) {
      for (const e of loput) {
        if (valitut.length >= maxAskelia) break;
        if (valitut.indexOf(e) === -1) valitut.push(e);
      }
    }
  }
  return valitut;
}

// Idempotenssi (testivaatimus: "sama päivä ladattuna kahdesti ei tuplaa
// ehdotuksia"): lasketaan VAIN jos tälle päivälle ei jo ole tallennettuja
// askelia — muuten luetaan aiemmin tallennettu tulos sellaisenaan. Sama
// "laske kerran, tallenna, lue sen jälkeen" -periaate kuin muillakin
// idempotenteilla kertalaskuilla tässä projektissa.
async function lataaOpintoPaivanAskeleet() {
  if (!currentUserId) return;
  const tanaan = opintoTanaanPvm();
  const { data: olemassa, error: olemassaError } = await db.from('opinto_paivan_askeleet')
    .select('*, opinto_aiheet(*, opinto_kurssit(name)), taitosolmut(*)').eq('owner_id', currentUserId).eq('pvm', tanaan).order('created_at');
  if (olemassaError) {
    console.error('Päivän askelten haku epäonnistui:', olemassaError);
    return;
  }

  let askeleet = olemassa || [];
  if (askeleet.length === 0) {
    const valitut = await laskeOpintoPaivanAskeleet();
    if (valitut.length > 0) {
      const { error: insertError } = await db.from('opinto_paivan_askeleet').insert(
        valitut.map(function(e) {
          return e.tyyppi === 'aihe'
            ? { owner_id: currentUserId, aihe_id: e.item.id, pvm: tanaan }
            : { owner_id: currentUserId, taitosolmu_id: e.item.id, pvm: tanaan };
        })
      );
      // Uniikkirajoite (owner_id, aihe_id/taitosolmu_id, pvm) voi hylätä
      // insertin jos toinen välilehti/lataus ehti jo kirjoittaa saman päivän
      // rivit juuri äsken — ei virhe, seuraava haku alla lukee joka
      // tapauksessa sen mikä kannassa oikeasti on (kumpi tahansa ehti ensin).
      if (insertError) console.error('Päivän askelten tallennus epäonnistui (voi olla harmiton kilpa-ajo):', insertError);
      const { data: uudet } = await db.from('opinto_paivan_askeleet')
        .select('*, opinto_aiheet(*, opinto_kurssit(name)), taitosolmut(*)').eq('owner_id', currentUserId).eq('pvm', tanaan).order('created_at');
      askeleet = uudet || [];
    }
  }
  await piirraOpintoTanaanOsio(askeleet);
}

// Lähes-reaaliaikainen täydennys (2026-08-05, Katrin eksplisiittinen pyyntö
// rikkoa "kerran per päivä" -idempotenssi tässä kohtaa): kun askel merkitään
// tehdyksi/ohitetuksi, tarjolla-paikka vapautuu — täytetään se HETI eikä
// odoteta huomiseen. Poissulkee tälle päivälle jo tarjotut aiheet/taitosolmut
// (poissuljetutAiheIdt/poissuljetutSolmuIdt, ks. laskeOpintoPaivanAskeleet)
// jottei sama asia tarjoudu kahdesti samana päivänä.
async function tayttaOpintoPaivanAskeleet() {
  if (!currentUserId) return;
  const tanaan = opintoTanaanPvm();
  const { data: nykyiset, error } = await db.from('opinto_paivan_askeleet')
    .select('aihe_id, taitosolmu_id, tila').eq('owner_id', currentUserId).eq('pvm', tanaan);
  if (error) {
    console.error('Täydennystä varten päivän askelten haku epäonnistui:', error);
    return;
  }
  const rivit = nykyiset || [];
  const tarjollaMaara = rivit.filter(function(r) { return r.tila === 'tarjolla'; }).length;
  const kuormaTaso = await opintoPaivanKuorma();
  const tavoiteMaara = opintoPaivanTavoiteAskelmaara(kuormaTaso);
  const puuttuu = tavoiteMaara - tarjollaMaara;
  if (puuttuu <= 0) return;

  const poissuljetutAiheIdt = new Set(rivit.filter(function(r) { return r.aihe_id; }).map(function(r) { return r.aihe_id; }));
  const poissuljetutSolmuIdt = new Set(rivit.filter(function(r) { return r.taitosolmu_id; }).map(function(r) { return r.taitosolmu_id; }));

  const uudet = await laskeOpintoPaivanAskeleet(puuttuu, poissuljetutAiheIdt, poissuljetutSolmuIdt);
  if (uudet.length === 0) return;
  const { error: insertError } = await db.from('opinto_paivan_askeleet').insert(
    uudet.map(function(e) {
      return e.tyyppi === 'aihe'
        ? { owner_id: currentUserId, aihe_id: e.item.id, pvm: tanaan }
        : { owner_id: currentUserId, taitosolmu_id: e.item.id, pvm: tanaan };
    })
  );
  if (insertError) console.error('Täydennysaskelten tallennus epäonnistui:', insertError);
}

// kohde (valinnainen, 2026-08-05, ks. HYTTI_SPEKSI_2026-08-05.md §8) —
// "tehtäväkohtainen 'lue lisää' -taso: mitä juuri tälle tehtävälle
// konkreettisesti tehdään". Ei älyä (tietoinen rajaus, ks. Opintopolun
// oma "ei mitään älykutsua" -periaate) — konkretisointi tulee TOISTAISEKSI
// vain kohteen omasta materiaali/linkki-kentästä (opinto_aiheet.materiaali,
// sql/110; taitosolmut.linkki, sql/092), jos sellainen on annettu.
// Materiaalista todella oppiva ohjaus ("systeemi oppii tarkemmin mitä
// missäkin vaiheessa pitäisi tehdä") on speksin oma myöhempi vaihe, ei
// tässä.
function naytaOpintoOhje(vaihe, kohde) {
  const linkki = kohde ? (kohde.materiaali || kohde.linkki) : null;
  const teksti = OPINTO_VAIHE_OHJE[vaihe] + (linkki ? '\n\nMateriaali tähän: ' + linkki : '');
  naytaVahvistus('🎯 ' + OPINTO_VAIHE_NIMET[vaihe], teksti, 'Selvä');
}

// "Minulla on N minuuttia" -moottori (2026-08-05) — UI (§4:n vanha "Minulla
// on aikaa" -osio) POISTETTU Nyt-välilehdeltä 2026-08-17, Boost (§4.8)
// korvaa saman tarpeen paremmalla muotokielellä. Itse hakufunktio säilyy —
// Boost (suoritaNytBoost) käyttää sitä edelleen samalla moottorilla
// (TASO 1 + deadline + kuorma). EI tallennu opinto_paivan_askeleet-tauluun.
//
// Kolmiportainen varmuusketju (2026-08-18, Katrin kaksi palautetta samasta
// napista): (1) "boosti 30/60 sanoo vaan et tee sitä mikä näkyy nyt
// sivulla" — vanha versio ei koskaan poissulkenut jo tänään tarjottuja
// askeleita, joten pisteytys palautti lähes aina saman kuin Nyt-kortilla jo
// oli. (2) "en halua että boosti sanoo ei oo mitään mitä 15min voi tehdä,
// voin sen ajan doomscrollata" — tarkka ikkunarajoitus saattoi jättää
// KAIKEN pois jos päivän ainoat ripeät aiheet sattuivat olemaan pidempiä.
// Ratkaisu: yritä ensin jotain UUTTA joka mahtuu tarkasti, sitten jotain
// UUTTA vaikka ei täysin mahtuisi (parempi aloittaa kesken jäävä kuin ei
// mitään), vasta viimeisenä hyväksy toisto jo näkyvästä — ei koskaan tyhjää
// jos ylipäätään mitään ripeää on tarjolla.
async function etsiIkkunaanSopivaAskel(ikkunaMin) {
  const { data: nykyiset } = await db.from('opinto_paivan_askeleet')
    .select('aihe_id, taitosolmu_id').eq('owner_id', currentUserId).eq('pvm', opintoTanaanPvm()).eq('tila', 'tarjolla');
  const poissuljetutAiheIdt = new Set((nykyiset || []).filter(function(r) { return r.aihe_id; }).map(function(r) { return r.aihe_id; }));
  const poissuljetutSolmuIdt = new Set((nykyiset || []).filter(function(r) { return r.taitosolmu_id; }).map(function(r) { return r.taitosolmu_id; }));

  const tarkka = await laskeOpintoPaivanAskeleet(1, poissuljetutAiheIdt, poissuljetutSolmuIdt, ikkunaMin);
  if (tarkka.length > 0) return tarkka[0];

  const loysa = await laskeOpintoPaivanAskeleet(1, poissuljetutAiheIdt, poissuljetutSolmuIdt, null);
  if (loysa.length > 0) return loysa[0];

  const mikaTahansa = await laskeOpintoPaivanAskeleet(1, null, null, ikkunaMin);
  return mikaTahansa.length > 0 ? mikaTahansa[0] : null;
}

// === SESSION-LOKI (2026-08-05, ks. sql/099, muistiinpanot.md "Session-
// loki") === todellinen aktiivinen työaika, ▶ Aloita/⏸ Lopeta -pari. EI
// kalenteripäivien erotus (Katrin oma korjaus alkuperäiseen ehdotukseeni) —
// mittaa oikeaa asiaa, ei sitä miten moneen päivään elämä venytti työn.
// PACER-vaihe napataan automaattisesti istunnon alkaessa kohteen SEN
// HETKISESTÄ `vaihe`-kentästä, jotta esim. encoding-työn kesto erottuu
// priming-työstä myöhempää kalibrointia varten.
async function haeKeskenaOlevaSessio() {
  if (!currentUserId) return null;
  const { data, error } = await db.from('opinto_sessiot').select().eq('owner_id', currentUserId).is('loppui_at', null).limit(1);
  if (error) {
    console.error('Kesken olevan session haku epäonnistui:', error);
    return null;
  }
  return (data && data[0]) || null;
}

async function aloitaOpintoSessio(askel, kohde) {
  const rivi = { owner_id: currentUserId, vaihe: kohdeVaihe(kohde) };
  rivi[askel.opinto_aiheet ? 'aihe_id' : 'taitosolmu_id'] = kohde.id;
  const { error } = await db.from('opinto_sessiot').insert(rivi);
  if (ilmoitaKirjoitusvirheesta(error, 'Session aloitus')) return;
  lataaOpintoPaivanAskeleet();
}

// Järkevyystarkistus (Katrin oma rajaus): EI estä tallennusta, vain kysyy —
// istunto tallennetaan joka tapauksessa, dialogi on pelkkä huomautus.
async function lopetaOpintoSessio(sessioId, alkoiAt) {
  const kestoMs = Date.now() - new Date(alkoiAt).getTime();
  const kynnysTuntia = haeAsetusNumero('sessio_jarkevyys_tunnit', 3);
  if (kestoMs > kynnysTuntia * 3600000) {
    await naytaVahvistus('Kesti oikeasti näin kauan?', 'Istunto on ollut käynnissä yli ' + kynnysTuntia + ' tuntia — vai unohtuiko täppä? Tallennetaan joka tapauksessa, voit korjata Table Editorista jos tämä oli virhe.', 'Selvä');
  }
  const { error } = await db.from('opinto_sessiot').update({ loppui_at: new Date().toISOString() }).eq('id', sessioId);
  if (ilmoitaKirjoitusvirheesta(error, 'Session lopetus')) return;
  naytaIlmoitus('Istunto tallennettu');
  lataaOpintoPaivanAskeleet();
}

// Häivytys (2026-08-05, täsmennetty 2026-08-06 oikean käytön perusteella,
// päiväkatto nostettu 1-2:sta 8:aan 2026-08-18 — ks. opintoPaivanTavoite-
// Askelmaara): tehty/ohitettu-kortti pysyy näkyvissä kunnes tehdyn_nakyvyys_
// maara UUTTA askelta on tullut sen JÄLKEEN samana päivänä. Oletus 0: heti
// kun jokin merkitään tehdyksi/ohitetuksi, se häviää näkyvistä VÄLITTÖMÄSTI
// ja tayttaOpintoPaivanAskeleet() tuo tilalle uuden samalla hetkellä — ei
// mitään "viimeisimmät N tehtyä" -jälkinäkymää. `jarjestetyt` on jo
// created_at-järjestyksessä (ks. lataaOpintoPaivanAskeleet-kysely). Arvo
// säädettävissä Asetuksista jos joku myöhemmin haluaa lyhyen historiajäljen.
function suodataNakyvatAskeleet(jarjestetyt) {
  const nakyvyysMaara = haeAsetusNumero('tehdyn_nakyvyys_maara', 0);
  return jarjestetyt.filter(function(askel, index) {
    if (askel.tila === 'tarjolla') return true;
    const uudempiaJalkeen = jarjestetyt.length - 1 - index;
    return uudempiaJalkeen < nakyvyysMaara;
  });
}

// === NYT-VÄLILEHTI (SATAMA_SPEKSI.md §4, uudistettu 17.8.2026) ===
// Korvaa vanhan erillisen kortti+painike-listan yhdellä aikajärjestykseen
// asetetulla päivän lokilla. §4.1: "Kalenterimerkinnät eivät ole kortteja
// vaan viivalla merkittyjä rivejä lokissa" — vain opiskelupätkät saavat
// ison .nyt-kortin, kalenteri/lounas ovat aina rivejä. §4.2: Nyt = päivän
// seuraava asia riippumatta tyypistä — tämä koskee SIJAINTIA (ensimmäisenä
// lokissa), ei ulkoasua.

function kelloMinuuteista(min) {
  min = ((min % 1440) + 1440) % 1440;
  return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
}

async function piirraOpintoTanaanOsio(kaikkiAskeleet) {
  const osio = document.getElementById('opinto-tanaan-osio');
  const askeleet = suodataNakyvatAskeleet(kaikkiAskeleet || []);
  if (!askeleet || askeleet.length === 0) {
    osio.style.display = 'none';
    return;
  }
  osio.style.display = 'block';
  await paivitaAsetukset();
  await piirraNytDeadlineRivi();
  await piirraNytLoki(askeleet);
  piirraNytBoost(askeleet);
}

// Deadline-rivi (§4.1/§7.3): vain 1-2 pv ennen palautusta, `--vaara`.
async function piirraNytDeadlineRivi() {
  const rivi = document.getElementById('nyt-deadline-rivi');
  const tanaan = opintoTanaanPvm();
  const tanaanD = new Date(tanaan + 'T00:00:00');

  const { data: kurssit } = await db.from('opinto_kurssit').select('id, name').eq('owner_id', currentUserId).eq('status', 'aktiivinen');
  const kurssiIdt = (kurssit || []).map(function(k) { return k.id; });
  if (kurssiIdt.length === 0) { rivi.style.display = 'none'; return; }
  const kurssiKartta = {};
  (kurssit || []).forEach(function(k) { kurssiKartta[k.id] = k.name; });

  const [{ data: kurssiDl }, { data: aiheDl }] = await Promise.all([
    db.from('opinto_deadlinet').select('kurssi_id, pvm, tyyppi').in('kurssi_id', kurssiIdt),
    db.from('opinto_deadlinet').select('pvm, tyyppi, opinto_aiheet!inner(name, kurssi_id)').in('opinto_aiheet.kurssi_id', kurssiIdt),
  ]);

  const ehdokkaat = [];
  (kurssiDl || []).forEach(function(d) {
    const paivia = Math.round((new Date(d.pvm + 'T00:00:00') - tanaanD) / 86400000);
    ehdokkaat.push({ paivia: paivia, teksti: kurssiKartta[d.kurssi_id] + ', ' + (d.tyyppi === 'koe' ? 'koe' : 'palautus') });
  });
  (aiheDl || []).forEach(function(d) {
    const paivia = Math.round((new Date(d.pvm + 'T00:00:00') - tanaanD) / 86400000);
    ehdokkaat.push({ paivia: paivia, teksti: kurssiKartta[d.opinto_aiheet.kurssi_id] + ' — ' + d.opinto_aiheet.name + ', ' + (d.tyyppi === 'koe' ? 'koe' : 'palautus') });
  });

  const kiireisin = ehdokkaat.filter(function(e) { return e.paivia >= 1 && e.paivia <= 2; }).sort(function(a, b) { return a.paivia - b.paivia; })[0];
  if (kiireisin) {
    rivi.style.display = 'block';
    rivi.textContent = kiireisin.teksti + ' ' + kiireisin.paivia + ' pv päässä';
  } else {
    rivi.style.display = 'none';
  }
}

// Sijoittelujärjestys §4.6: 1) kiinteät menot (eivät väisty) 2) suojatut
// ikkunat (ateria, suljetut) 3) opiskelupätkät täyttävät loput. Yksinker-
// tainen minuuttiruudukko (0-1439) koko vuorokaudelle — laskennallisesti
// kevyt (kerran per Nyt-näkymän avaus), helppo perustella oikeaksi.
async function piirraNytLoki(askeleet) {
  const lokiEl = document.getElementById('nyt-loki');
  lokiEl.innerHTML = '';

  const nyt = new Date();
  const tanaan = opintoTanaanPvm();
  const viikonpaiva = nyt.getDay();
  const nytMin = nyt.getHours() * 60 + nyt.getMinutes();

  const [{ data: tapahtumat }, { data: suljetut }, { data: opiskeluajat }] = await Promise.all([
    // KORJATTU 2026-08-18: suodatti aiemmin kalenteri_tapahtumat.user_id:llä
    // — tarkistettu suoraan kannasta että tämä sarake on käytännössä AINA
    // tyhjä, joten suodatus ei koskaan täsmännyt mihinkään: kiinteät menot
    // eivät koskaan näkyneet Nyt-lokin sijoittelussa. Oikea suodatin on
    // liitetyn syötteen henkilo. Katrin täsmennys samana päivänä: Juhan
    // OMASSA kalenterissa oleva meno (esim. "Sulkapallo", "Perhetyö meillä")
    // EI koske Katria vaikka olisikin perhetapahtuma — ratkaiseva on kumman
    // kalenterissa se on, ei tapahtuman scope. Vain jaettu perhekalenteri
    // (henkilo=null) tai Katrin oma (henkilo=katri) laskee hänen esteekseen.
    db.from('kalenteri_tapahtumat').select('title, event_time, event_end_time, kalenteri_syotteet!inner(henkilo)').eq('event_date', tanaan).order('event_time'),
    db.from('hytti_suljetut_ikkunat').select('alkaa, paattyy').eq('owner_id', currentUserId).eq('viikonpaiva', viikonpaiva),
    db.from('hytti_opiskeluaika').select('alkaa, paattyy').eq('owner_id', currentUserId).eq('viikonpaiva', viikonpaiva),
  ]);
  const omatTapahtumat = (tapahtumat || []).filter(function(t) {
    const h = t.kalenteri_syotteet ? t.kalenteri_syotteet.henkilo : null;
    return h === omaHenkilo || h === null;
  });
  const opiskeluIkkuna = (opiskeluajat && opiskeluajat[0]) || { alkaa: '09:00', paattyy: '15:30' };
  const ikkunaAlku = aikaMinuutteina(opiskeluIkkuna.alkaa.slice(0, 5));
  const ikkunaLoppu = aikaMinuutteina(opiskeluIkkuna.paattyy.slice(0, 5));

  const varattu = new Array(1440).fill(true);
  for (let m = ikkunaAlku; m < ikkunaLoppu; m++) varattu[m] = false;
  (suljetut || []).forEach(function(ikkuna) {
    const a = aikaMinuutteina(ikkuna.alkaa.slice(0, 5)), b = aikaMinuutteina(ikkuna.paattyy.slice(0, 5));
    for (let m = a; m < b; m++) varattu[m] = true;
  });

  // Siirtymäpuskuri (2026-08-18, Katrin pyyntö: "voisko ne siirtymäbufferit
  // aktivoida kans tohon" — asetus oli jo olemassa Ristiriitamerkille mutta
  // ei koskenut päivän opiskelusijoittelua). Puskuri varaa ajan kiinteän
  // menon MOLEMMIN PUOLIN opiskelupätkien sijoittelua varten — näytettävä
  // palkki (kiinteatMenot, alla) käyttää silti TODELLISTA aikaa, ei
  // puskuroitua, ettei kalenterissa näytetä väärää kellonaikaa.
  const siirtymaPuskuri = haeAsetusNumero('siirtymapuskuri_min', 30);
  const kiinteatMenot = [];
  omatTapahtumat.forEach(function(t) {
    if (!t.event_time) return; // koko päivän kestävä — ei sijoiteta aikajanalle
    const a = aikaMinuutteina(t.event_time.slice(0, 5));
    const b = Math.min(1439, t.event_end_time ? aikaMinuutteina(t.event_end_time.slice(0, 5)) : a + 60);
    for (let m = Math.max(0, a - siirtymaPuskuri); m < Math.min(1440, b + siirtymaPuskuri); m++) varattu[m] = true;
    kiinteatMenot.push({ alku: a, loppu: b, title: t.title });
  });

  // Föli-siirtymät (2026-08-18, Katrin pyyntö: "joka bussimatka lasketaan
  // kalenteritapahtumaksi") — vain tapahtumille joilla on TUNNETTU matka
  // (etsiTunnettuFoliMatka), esim. sijaintiton "meillä"-tapahtuma ei koskaan
  // laukaise tätä. Varaa ruudukosta todellisen SIRI-lähdön mukaisen ajan.
  const siirtymat = [];
  const siirtymaLuettelot = await Promise.all(
    omatTapahtumat.map(function(t) { return haeFoliSiirtymatTapahtumalle(t, tanaan, varattu); })
  );
  siirtymaLuettelot.forEach(function(lista) { lista.forEach(function(r) { siirtymat.push(r); }); });

  // Pieni tauko kotiin paluun jälkeen (2026-08-18, Katrin pyyntö: "when i
  // come home small break and then studying" — ei ryntäistä opiskeluun heti
  // ovesta astuttua). Koskee vain VARMISTETTUJA paluumatkoja (ei
  // "tarkentuu lähempänä" -arvioita, joilla ei ole todellista loppuaikaa).
  const paluuTauko = haeAsetusNumero('paluutauko_min', 15);
  const taukoRivit = [];
  siirtymat.forEach(function(s) {
    if (s.tyyppi !== 'siirtyma' || s.suunta !== 'paluu') return;
    const a = s.loppu, b = Math.min(1439, s.loppu + paluuTauko);
    for (let m = a; m < b; m++) varattu[m] = true;
    taukoRivit.push({ tyyppi: 'tauko-paluu', alku: a, loppu: b });
  });
  taukoRivit.forEach(function(r) { siirtymat.push(r); });

  // Ateria — suojattu, EI jätetä pois (§4.5): kokeile oletusaikaa, muuten
  // ensimmäinen vapaa rako opiskeluikkunan sisällä.
  const ateriaKesto = haeAsetusNumero('aterian_kesto_min', 30);
  const mahtuuko = function(alku) {
    if (alku < 0 || alku + ateriaKesto > 1440) return false;
    for (let m = alku; m < alku + ateriaKesto; m++) { if (varattu[m]) return false; }
    return true;
  };
  let ateriaAlku = aikaMinuutteina(haeAsetusTeksti('ateria_alku', '11:00'));
  if (!mahtuuko(ateriaAlku)) {
    // Etsi LÄHIN vapaa rako toivotusta ajasta, ei ensimmäistä ikkunan alusta
    // (2026-08-18, Katrin havainto: päivä jossa aamu oli lyhyt matkan/
    // tapaamisen takia näytti vain yhden opiskelupätkän). Vanha koodi haki
    // ensimmäisen vapaan minuutin ikkunan ALUSTA jos oletusaika (klo 11) oli
    // varattu — jos aamu oli lyhyt (esim. 50 min ennen matkaa), 30 min lounas
    // sijoittui sinne ja söi käytännössä koko lyhyen aamu-ikkunan, vaikka
    // iltapäivällä olisi ollut reilusti tilaa. Skannaa nyt ULOSPÄIN
    // toivotusta ajasta (lähempi voittaa) sen sijaan että aina lähdettäisiin
    // päivän alusta.
    let paras = -1;
    for (let etaisyys = 1; etaisyys <= (ikkunaLoppu - ikkunaAlku) && paras < 0; etaisyys++) {
      if (mahtuuko(ateriaAlku - etaisyys)) paras = ateriaAlku - etaisyys;
      else if (mahtuuko(ateriaAlku + etaisyys)) paras = ateriaAlku + etaisyys;
    }
    ateriaAlku = paras;
  }
  let ateriaSijoitus = null;
  if (ateriaAlku >= 0) {
    for (let m = ateriaAlku; m < ateriaAlku + ateriaKesto; m++) varattu[m] = true;
    ateriaSijoitus = { alku: ateriaAlku, loppu: ateriaAlku + ateriaKesto };
  }

  // Opiskelupätkät täyttävät loput — kiinteä kestoarvio per PERO-vaihe
  // (haeOpintoKestoMinuutteina, säädettävissä Asetuksista). Jos jokin ei
  // mahdu enää tänään (täysi päivä), se jää lokista pois — harvinaista
  // 1-2 askeleen päivämäärällä, ei virhetila.
  const opiskelupatkat = [];
  askeleet.forEach(function(askel) {
    const kohde = askel.opinto_aiheet || askel.taitosolmut;
    if (!kohde) return;
    const vaihe = kohdeVaihe(kohde);
    const kesto = haeOpintoKestoMinuutteina(vaihe);
    let loytyi = -1;
    for (let m = ikkunaAlku; m <= ikkunaLoppu - kesto; m++) {
      let vapaa = true;
      for (let k = m; k < m + kesto; k++) { if (varattu[k]) { vapaa = false; break; } }
      if (vapaa) { loytyi = m; break; }
    }
    if (loytyi < 0) return;
    for (let k = loytyi; k < loytyi + kesto; k++) varattu[k] = true;
    opiskelupatkat.push({ askel: askel, kohde: kohde, vaihe: vaihe, kesto: kesto, alku: loytyi, loppu: loytyi + kesto });
  });

  let rivit = kiinteatMenot.map(function(m) { return { tyyppi: 'live', alku: m.alku, loppu: m.loppu, title: m.title }; });
  siirtymat.forEach(function(s) { rivit.push(s); });
  if (ateriaSijoitus) rivit.push({ tyyppi: 'lounas', alku: ateriaSijoitus.alku, loppu: ateriaSijoitus.loppu });
  opiskelupatkat.forEach(function(p) { rivit.push({ tyyppi: 'opiskelu', alku: p.alku, loppu: p.loppu, askel: p.askel, kohde: p.kohde, vaihe: p.vaihe }); });
  rivit.sort(function(a, b) { return a.alku - b.alku; });
  rivit = rivit.filter(function(r) { return r.loppu > nytMin; }); // menneet katoavat (§4.2)

  if (rivit.length === 0) { lokiEl.innerHTML = ''; return; }

  let nytKortinKehys = null;
  rivit.forEach(function(rivi, index) {
    if (index === 0 && rivi.tyyppi === 'opiskelu') {
      nytKortinKehys = piirraNytKortti(rivi);
      lokiEl.appendChild(nytKortinKehys);
    } else {
      lokiEl.appendChild(piirraNytLokiRivi(rivi));
    }
  });
}

function piirraNytLokiRivi(rivi) {
  const el = document.createElement('div');
  if (rivi.tyyppi === 'lounas') {
    el.className = 'nyt-loki-rivi matala';
    el.innerHTML = '<div class="nyt-loki-aika">' + kelloMinuuteista(rivi.alku) + '</div><div class="nyt-loki-teksti">Lounas</div>';
  } else if (rivi.tyyppi === 'tauko-paluu') {
    el.className = 'nyt-loki-rivi matala';
    el.innerHTML = '<div class="nyt-loki-aika">' + kelloMinuuteista(rivi.alku) + '</div><div class="nyt-loki-teksti">☕ Pieni tauko</div>';
  } else if (rivi.tyyppi === 'live') {
    // Kiinteä meno — oma selkeä live-merkki, EI himmennetty (§4.1: "ei saa
    // näyttää samalta kuin siirrettävä opiskelupätkä eikä himmentyä").
    el.className = 'nyt-loki-rivi live';
    el.innerHTML =
      '<div class="nyt-loki-aika">' + kelloMinuuteista(rivi.alku) + '</div>' +
      '<div class="nyt-loki-teksti"><b>' + rivi.title + '</b>' +
      '<span class="nyt-live-merkki"><span class="nyt-live-piste"></span>live — ei siirry</span></div>';
  } else if (rivi.tyyppi === 'siirtyma') {
    el.className = 'nyt-loki-rivi live siirtyma';
    el.innerHTML =
      '<div class="nyt-loki-aika">' + kelloMinuuteista(rivi.alku) + '</div>' +
      '<div class="nyt-loki-teksti"><b>🚌 ' + rivi.linja + ' → ' + rivi.kohde + '</b>' +
      '<span class="nyt-live-merkki"><span class="nyt-live-piste"></span>' + (rivi.suunta === 'paluu' ? 'paluumatka' : 'menomatka') + '</span></div>';
  } else if (rivi.tyyppi === 'siirtyma-tuntematon') {
    el.className = 'nyt-loki-rivi live siirtyma siirtyma-arvio';
    el.innerHTML =
      '<div class="nyt-loki-aika">n. ' + kelloMinuuteista(rivi.alku) + '</div>' +
      '<div class="nyt-loki-teksti"><b>🚌 Bussi</b>' +
      '<span class="pieni">tarkentuu lähempänä lähtöä</span></div>';
  } else {
    const kohde = rivi.kohde;
    const kurssi = rivi.askel.opinto_aiheet ? (kohde.opinto_kurssit ? kohde.opinto_kurssit.name : '') : (kohde.lahde || '');
    // Napautettava (2026-08-18, Katrin pyyntö: "muut vaihtoehdot" -piilotettu
    // lista poistettu yksinkertaisuuden vuoksi — jos ykköskortin aihe ei
    // inspiroi, "En ehtinyt" ja napauta jotain jo NÄKYVISSÄ olevaa
    // myöhempää riviä sen sijaan että avaisi erillisen laajennettavan
    // listan). Täyden päivän täytön myötä näitä on nyt yleensä useampi.
    el.className = 'nyt-loki-rivi matala napautettava';
    el.innerHTML =
      '<div class="nyt-loki-aika">' + kelloMinuuteista(rivi.alku) + '</div>' +
      '<div class="nyt-loki-teksti"><b>' + kohde.name + '</b>' +
      '<span class="pieni">' + kurssi + (kurssi ? ' · ' : '') + OPINTO_VAIHE_NIMET[rivi.vaihe] + '</span></div>';
    el.addEventListener('click', function() { avaaNytKortinKohde(rivi); });
  }
  return el;
}

// === HUOMISEN ESIKATSELU (2026-08-18, Katrin pyyntö: "leikitään et tää
// päivä mikä täs näkyy olis huominen, niin miten laittaisit sen käyt kattoo
// kalenterista ja lasket bufferit ym ja laitat sopivat opiskeluslotit") ===
// SAMA moottori (laskeOpintoPaivanAskeleet, kohdePvm=huomenna) ja SAMA
// minuuttiruudukko-sijoittelutekniikka kuin piirraNytLoki:ssa — EI
// rinnakkaista laskukonetta. Ei tallenna mitään opinto_paivan_askeleet-
// tauluun (se on sidottu tämän päivän pvm:ään) — puhdas esikatselu,
// TIETOISESTI väliaikainen: huomisen todellinen jono lasketaan uudelleen
// huomenna sen mukaan mitä tänään oikeasti ehditään, joten tämä VOI näyttää
// eri asian kuin mitä huomenna oikeasti tapahtuu.
async function naytaHuomisenEsikatselu() {
  const kehys = document.getElementById('nyt-huomenna');
  if (!kehys || !currentUserId) return;

  const huominenD = new Date();
  huominenD.setDate(huominenD.getDate() + 1);
  const huominenIso = paivamaaraISO(huominenD);
  const viikonpaiva = huominenD.getDay();

  const [{ data: tapahtumat }, { data: suljetut }, { data: opiskeluajat }] = await Promise.all([
    // Sama korjaus kuin piirraNytLoki:ssa (2026-08-18) — kalenteri_tapahtumat.
    // user_id on käytännössä aina tyhjä, suodatus liitetyn syötteen
    // henkilo-kentän mukaan (null = jaettu perhekalenteri, kuuluu Katrille).
    db.from('kalenteri_tapahtumat').select('title, event_time, event_end_time, kalenteri_syotteet!inner(henkilo)').eq('event_date', huominenIso).order('event_time'),
    db.from('hytti_suljetut_ikkunat').select('alkaa, paattyy').eq('owner_id', currentUserId).eq('viikonpaiva', viikonpaiva),
    db.from('hytti_opiskeluaika').select('alkaa, paattyy').eq('owner_id', currentUserId).eq('viikonpaiva', viikonpaiva),
  ]);
  const omatTapahtumat = (tapahtumat || []).filter(function(t) {
    const h = t.kalenteri_syotteet ? t.kalenteri_syotteet.henkilo : null;
    return h === omaHenkilo || h === null;
  });
  const opiskeluIkkuna = (opiskeluajat && opiskeluajat[0]) || { alkaa: '09:00', paattyy: '15:30' };
  const ikkunaAlku = aikaMinuutteina(opiskeluIkkuna.alkaa.slice(0, 5));
  const ikkunaLoppu = aikaMinuutteina(opiskeluIkkuna.paattyy.slice(0, 5));

  const varattu = new Array(1440).fill(true);
  for (let m = ikkunaAlku; m < ikkunaLoppu; m++) varattu[m] = false;
  (suljetut || []).forEach(function(ikkuna) {
    const a = aikaMinuutteina(ikkuna.alkaa.slice(0, 5)), b = aikaMinuutteina(ikkuna.paattyy.slice(0, 5));
    for (let m = a; m < b; m++) varattu[m] = true;
  });

  const siirtymaPuskuri = haeAsetusNumero('siirtymapuskuri_min', 30);
  const kiinteatMenot = [];
  omatTapahtumat.forEach(function(t) {
    if (!t.event_time) return;
    const a = aikaMinuutteina(t.event_time.slice(0, 5));
    const b = Math.min(1439, t.event_end_time ? aikaMinuutteina(t.event_end_time.slice(0, 5)) : a + 60);
    for (let m = Math.max(0, a - siirtymaPuskuri); m < Math.min(1440, b + siirtymaPuskuri); m++) varattu[m] = true;
    kiinteatMenot.push({ alku: a, loppu: b, title: t.title });
  });

  const ateriaKesto = haeAsetusNumero('aterian_kesto_min', 30);
  const mahtuuko = function(alku) {
    if (alku < 0 || alku + ateriaKesto > 1440) return false;
    for (let m = alku; m < alku + ateriaKesto; m++) { if (varattu[m]) return false; }
    return true;
  };
  let ateriaAlku = aikaMinuutteina(haeAsetusTeksti('ateria_alku', '11:00'));
  if (!mahtuuko(ateriaAlku)) {
    // Etsi LÄHIN vapaa rako toivotusta ajasta, ei ensimmäistä ikkunan alusta
    // (2026-08-18, Katrin havainto: päivä jossa aamu oli lyhyt matkan/
    // tapaamisen takia näytti vain yhden opiskelupätkän). Vanha koodi haki
    // ensimmäisen vapaan minuutin ikkunan ALUSTA jos oletusaika (klo 11) oli
    // varattu — jos aamu oli lyhyt (esim. 50 min ennen matkaa), 30 min lounas
    // sijoittui sinne ja söi käytännössä koko lyhyen aamu-ikkunan, vaikka
    // iltapäivällä olisi ollut reilusti tilaa. Skannaa nyt ULOSPÄIN
    // toivotusta ajasta (lähempi voittaa) sen sijaan että aina lähdettäisiin
    // päivän alusta.
    let paras = -1;
    for (let etaisyys = 1; etaisyys <= (ikkunaLoppu - ikkunaAlku) && paras < 0; etaisyys++) {
      if (mahtuuko(ateriaAlku - etaisyys)) paras = ateriaAlku - etaisyys;
      else if (mahtuuko(ateriaAlku + etaisyys)) paras = ateriaAlku + etaisyys;
    }
    ateriaAlku = paras;
  }
  let ateriaSijoitus = null;
  if (ateriaAlku >= 0) {
    for (let m = ateriaAlku; m < ateriaAlku + ateriaKesto; m++) varattu[m] = true;
    ateriaSijoitus = { alku: ateriaAlku, loppu: ateriaAlku + ateriaKesto };
  }

  // Kuinka monta ehdokasta kannattaa pyytää moottorilta — vapaiden
  // minuuttien karkea arvio jaettuna kevyellä keskimääräisellä lohkolla,
  // ei tarkka (todellinen sijoittelu alla joka tapauksessa jättää pois
  // sen minkä lohkot eivät oikeasti mahdu).
  let vapaaMin = 0;
  for (let m = ikkunaAlku; m < ikkunaLoppu; m++) { if (!varattu[m]) vapaaMin++; }
  const pyydettavaMaara = Math.min(10, Math.max(1, Math.ceil(vapaaMin / 15)));
  const ehdokkaat = await laskeOpintoPaivanAskeleet(pyydettavaMaara, null, null, null, huominenIso);

  const opiskelupatkat = [];
  ehdokkaat.forEach(function(e) {
    const kohde = e.item;
    const vaihe = kohdeVaihe(kohde);
    const kesto = haeOpintoKestoMinuutteina(vaihe);
    let loytyi = -1;
    for (let m = ikkunaAlku; m <= ikkunaLoppu - kesto; m++) {
      let vapaa = true;
      for (let k = m; k < m + kesto; k++) { if (varattu[k]) { vapaa = false; break; } }
      if (vapaa) { loytyi = m; break; }
    }
    if (loytyi < 0) return;
    for (let k = loytyi; k < loytyi + kesto; k++) varattu[k] = true;
    const kurssi = e.tyyppi === 'aihe' ? (kohde.opinto_kurssit ? kohde.opinto_kurssit.name : '') : (kohde.lahde || '');
    opiskelupatkat.push({ tyyppi: 'opiskelu-esikatselu', nimi: kohde.name, kurssi: kurssi, vaihe: vaihe, alku: loytyi, loppu: loytyi + kesto });
  });

  let rivit = kiinteatMenot.map(function(m) { return { tyyppi: 'live', alku: m.alku, loppu: m.loppu, title: m.title }; });
  if (ateriaSijoitus) rivit.push({ tyyppi: 'lounas', alku: ateriaSijoitus.alku, loppu: ateriaSijoitus.loppu });
  rivit = rivit.concat(opiskelupatkat);
  rivit.sort(function(a, b) { return a.alku - b.alku; });

  kehys.innerHTML = '';
  if (rivit.length === 0) { kehys.style.display = 'none'; return; }
  kehys.style.display = 'block';

  const otsikko = document.createElement('div');
  otsikko.className = 'osio-nimi nyt-huomenna-otsikko';
  otsikko.textContent = '🔮 Huomenna (esikatselu — voi vielä muuttua)';
  kehys.appendChild(otsikko);

  rivit.forEach(function(rivi) {
    const el = document.createElement('div');
    if (rivi.tyyppi === 'lounas') {
      el.className = 'nyt-loki-rivi matala huomenna';
      el.innerHTML = '<div class="nyt-loki-aika">' + kelloMinuuteista(rivi.alku) + '</div><div class="nyt-loki-teksti">Lounas</div>';
    } else if (rivi.tyyppi === 'live') {
      el.className = 'nyt-loki-rivi live huomenna';
      el.innerHTML = '<div class="nyt-loki-aika">' + kelloMinuuteista(rivi.alku) + '</div><div class="nyt-loki-teksti"><b>' + rivi.title + '</b></div>';
    } else {
      el.className = 'nyt-loki-rivi matala huomenna';
      el.innerHTML =
        '<div class="nyt-loki-aika">' + kelloMinuuteista(rivi.alku) + '</div>' +
        '<div class="nyt-loki-teksti"><b>' + rivi.nimi + '</b>' +
        '<span class="pieni">' + rivi.kurssi + (rivi.kurssi ? ' · ' : '') + OPINTO_VAIHE_NIMET[rivi.vaihe] + '</span></div>';
    }
    kehys.appendChild(el);
  });
}

function piirraNytKortti(rivi) {
  const kohde = rivi.kohde;
  const kurssi = rivi.askel.opinto_aiheet ? (kohde.opinto_kurssit ? kohde.opinto_kurssit.name : '') : (kohde.lahde || '');

  const wrap = document.createElement('div');
  wrap.className = 'nyt-kohta';

  const kortti = document.createElement('button');
  kortti.type = 'button';
  kortti.className = 'nyt nouse';
  kortti.innerHTML =
    '<div class="nyt-ylarivi">' +
      '<div><div class="nyt-kurssi">' + kurssi + '</div><div class="nyt-solmu">' + kohde.name + '</div></div>' +
      '<div class="nyt-aika">' + kelloMinuuteista(rivi.alku) + '</div>' +
    '</div>' +
    '<div class="nyt-alarivi"><span class="nyt-vaihe">' + OPINTO_VAIHE_NIMET[rivi.vaihe] + '</span><span class="pieni">' + (rivi.loppu - rivi.alku) + ' min</span></div>';
  kortti.addEventListener('click', function() { avaaNytKortinKohde(rivi); });
  wrap.appendChild(kortti);

  const perustelu = laskeNytPerustelu(rivi);
  if (perustelu) {
    const p = document.createElement('p');
    p.className = 'selite';
    p.textContent = perustelu;
    wrap.appendChild(p);
  }

  // "En ehtinyt" — säilytetty vanhasta kortista, ei mainittu §4:ssä mutta
  // ei myöskään poistettu; sama "ei rangaistusta, ei kertymää" -periaate
  // kuin ennen (merkitseOpintoAskel). Tekstilinkki, ei nappi, ettei riko
  // "koko kortti on painettava" -sääntöä toisella isolla kosketuspinnalla.
  const ohita = document.createElement('p');
  ohita.className = 'selite';
  ohita.textContent = 'En ehdi tähän tänään';
  ohita.style.cursor = 'pointer';
  ohita.style.textDecoration = 'underline';
  ohita.addEventListener('click', function() { merkitseOpintoAskel(rivi.askel, 'ohitettu'); });
  wrap.appendChild(ohita);

  return wrap;
}

// Perustelurivi §4.4 — yksi lause, ehtotaulukon mukaan. Vain ne ehdot jotka
// on luotettavasti laskettavissa nykyisestä datasta on toteutettu; jos
// mikään ei täyty, rivi jätetään pois (spekin oma sääntö), ei arvata.
function laskeNytPerustelu(rivi) {
  if (rivi.askel.taitosolmut) return 'Silta — auttaa tulevia kursseja.';
  return null; // muut ehdot (palautus 3-5pv, kevyt kuorma) lasketaan piirraNytLoki:n kutsujassa tarvittaessa
}

// Kohteen avaus Nyt-lokista — aihe (opinto_aiheet) avaa uuden
// A4-Tehtävänäkymän (§4.9, automaattinen ajanotto). Taitosolmu (silta) EI
// vielä ole siirretty samaan malliin (eri, vanhempi tietomuoto — ei
// pero_vaihe/pacer_paatyyppi/retrieval_kierrokset-kenttiä, ks. sql/092) —
// tarkoituksellinen rajaus, sama kuin muuallakin sovelluksessa (Vaihe 2).
function avaaNytKortinKohde(rivi) {
  if (rivi.askel.opinto_aiheet) {
    avaaOpintoTehtava(rivi.kohde, rivi.askel);
  } else {
    naytaOpintoOhje(rivi.vaihe, rivi.kohde);
  }
}

// Boost (§4.8) — täydennys/päiväkaton ylitysmekanismi, EI suunnitelman
// perusta. Sama moottori (etsiIkkunaanSopivaAskel) kuin "Minulla on aikaa",
// mutta OHITTAA päiväkaton koska maxAskeliaYlikirjoitus=1 kutsutaan aina
// riippumatta tämän päivän jo-tarjotusta määrästä.
const NYT_BOOST_MIN = [15, 30, 60, '··'];
const NYT_BOOST_RULLA_ARVOT = [10, 20, 25, 35, 40, 45, 50, 55, 70, 80, 90, 100, 110, 120];
function piirraNytBoost() {
  const kehys = document.getElementById('nyt-boost');
  kehys.innerHTML = '';
  NYT_BOOST_MIN.forEach(function(m) {
    const nappi = document.createElement('button');
    nappi.type = 'button';
    nappi.className = 'min';
    nappi.innerHTML = '<b>' + m + '</b><span>' + (m === '··' ? 'muu' : 'min') + '</span>';
    nappi.addEventListener('click', function() {
      if (m === '··') { avaaNytBoostRulla(); return; }
      suoritaNytBoost(m);
    });
    kehys.appendChild(nappi);
  });
}
async function suoritaNytBoost(min) {
  const tulos = document.getElementById('nyt-boost-tulos');
  const ehdokas = await etsiIkkunaanSopivaAskel(min);
  if (!ehdokas) {
    tulos.style.display = 'block';
    tulos.textContent = 'Ei mitään mikä mahtuisi ' + min + ' minuuttiin juuri nyt.';
    return;
  }
  const kohde = ehdokas.item;
  tulos.style.display = 'block';
  tulos.textContent = min + ' min: ' + kohde.name + ' — napauta avataksesi.';
  tulos.style.cursor = 'pointer';
  tulos.onclick = function() {
    if (ehdokas.tyyppi === 'aihe') avaaOpintoTehtava(kohde);
    else naytaOpintoOhje(kohdeVaihe(kohde), kohde);
  };
}
function avaaNytBoostRulla() {
  // Natiivi <select>, sama periaate kuin muualla sovelluksessa käytetty
  // rullavalitsin (Toistuva muistutus -kenttä) — ei hand-rolled kosketus-
  // vieritintä, ks. §4.8 "toteutukseltaan iOS-natiivi".
  const rulla = document.getElementById('nyt-boost-rulla');
  if (rulla.options.length === 0) {
    NYT_BOOST_RULLA_ARVOT.forEach(function(m) {
      const optio = document.createElement('option');
      optio.value = m;
      optio.textContent = m + ' min';
      rulla.appendChild(optio);
    });
    rulla.addEventListener('change', function() { suoritaNytBoost(parseInt(rulla.value, 10)); });
  }
  rulla.style.display = rulla.style.display === 'none' ? 'block' : 'none';
}

// "En ehtinyt" -kuittaus EI kosketa kohteen vaihe-/SR-tilaa mitenkään — sama
// "ei rangaistusta, ei kertymää" -periaate kuin Toistuvan muistutuksen
// kuittaamattomalla kerralla. Askel jää vain tälle päivälle 'ohitettu'-
// tilaan historiaan, seuraava päivän moottoriajo laskee tuoreen ehdokasjoukon
// riippumatta tästä.
async function merkitseOpintoAskel(askel, tila) {
  const { error } = await db.from('opinto_paivan_askeleet').update({ tila: tila }).eq('id', askel.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Askeleen kuittaus')) return;

  // BUGIKORJAUS (2026-08-06, ks. samasta syystä korjattu Aikaikkuna-nappi):
  // tila-päivitys YLLÄ on jo onnistunut tässä vaiheessa riippumatta mitä
  // alla tapahtuu — mutta jos etenetaOpintoKohde/tayttaOpintoPaivanAskeleet
  // heittäisi poikkeuksen, lataaOpintoPaivanAskeleet() (näkymän päivitys)
  // EI koskaan suoritu, ja ruutu jäisi näyttämään vanhaa tilaa vaikka
  // tietokannassa oikea tila on jo tallessa — näyttää käyttäjälle siltä
  // että kuittaus "ei mennyt läpi" vaikka meni. try/finally takaa että
  // näkymä päivittyy AINA kun tila-kirjoitus onnistui, virhe alemmissa
  // vaiheissa vain lokitetaan eikä katoa hiljaa.
  try {
    if (tila === 'tehty') {
      if (askel.opinto_aiheet) await etenetaOpintoKohde(askel.opinto_aiheet, 'opinto_aiheet');
      else if (askel.taitosolmut) await etenetaOpintoKohde(askel.taitosolmut, 'taitosolmut');
    }
    // Vapautunut tarjolla-paikka täytetään HETI (ks. tayttaOpintoPaivanAskeleet-
    // kommentti) — koskee sekä tehty ETTÄ ohitettu, molemmat vapauttavat paikan.
    await tayttaOpintoPaivanAskeleet();
  } catch (e) {
    console.error('PACER-eteneminen tai täydennys epäonnistui askeleen kuittauksen jälkeen:', e);
  } finally {
    lataaOpintoPaivanAskeleet();
  }
}

// "Tehty" etenee PACERia JA ajastaa spaced repetitionin — moottorin
// kirjoittava puolisko. HAARAUTUU 2026-08-10 alkaen (sql/111,
// HYTTI_SPEKSI.md §7.4): taitosolmut käyttää YHÄ vanhaa vaihe='yllapito'
// -mallia koskemattomana (Vaihe 5:n asia), opinto_aiheet käyttää UUTTA
// mallia jossa pero_vaihe pysyy 'retrieval'-arvossa pysyvästi SR-kierron
// alettua ja kertausjonossa-lippu (ei vaihearvo) kertoo onko kiinteä
// alkukertaustaulukko (OPINTO_SR_VALIT_PV) käyty läpi. Puhdas "mitä ✓ Tehty
// TEKISI" -ennuste ilman sivuvaikutuksia — peilaa etenetaOpintoKohde():n
// haarautumisen, EI kirjoita mitään. null = kohde ei etene ollenkaan
// (reference-vaihe, tai opinto_aihe joka on jo kertausjonossa — Vaihe 2 tuo
// kehote-mekanismin joka voi tarjota siirtymän overlearningiin, ei tässä).
function seuraavaOpintoVaiheKuvaus(kohde) {
  const onAihe = kohde.pero_vaihe !== undefined;
  const vaihe = kohdeVaihe(kohde);
  if (vaihe === 'priming') return OPINTO_VAIHE_NIMET.encoding;
  if (vaihe === 'encoding') return OPINTO_VAIHE_NIMET.retrieval;
  if (vaihe === 'retrieval') {
    if (onAihe) return null;
    const seuraavaIndeksi = kohde.sr_interval_index + 1;
    return seuraavaIndeksi < OPINTO_SR_VALIT_PV.length ? OPINTO_VAIHE_NIMET.retrieval : OPINTO_VAIHE_NIMET.yllapito;
  }
  if (vaihe === 'yllapito') return OPINTO_VAIHE_NIMET.yllapito;
  return null;
}

async function etenetaOpintoKohde(kohde, taulu) {
  if (!kohde) return;
  let paivitys = null;

  if (taulu === 'opinto_aiheet') {
    if (kohde.pero_vaihe === 'priming') {
      paivitys = { pero_vaihe: 'encoding' };
    } else if (kohde.pero_vaihe === 'encoding') {
      const ensiKertaus = new Date(Date.now() + OPINTO_SR_VALIT_PV[0] * 86400000);
      paivitys = { pero_vaihe: 'retrieval', sr_interval_index: 0, sr_next_review: paivamaaraISO(ensiKertaus) };
    } else if (kohde.pero_vaihe === 'retrieval') {
      const seuraavaIndeksi = kohde.sr_interval_index + 1;
      if (seuraavaIndeksi < OPINTO_SR_VALIT_PV.length) {
        const seuraava = new Date(Date.now() + OPINTO_SR_VALIT_PV[seuraavaIndeksi] * 86400000);
        paivitys = { sr_interval_index: seuraavaIndeksi, sr_next_review: paivamaaraISO(seuraava) };
      } else if (!kohde.kertausjonossa) {
        // Vastaa vanhan mallin "vaihe: yllapito" -siirtymää: EI enää oma
        // vaihearvo, vain lippu — pero_vaihe pysyy 'retrieval'.
        const vali = yllapidonSeuraavaVali(0);
        const seuraava = new Date(Date.now() + vali * 86400000);
        paivitys = { kertausjonossa: true, sr_interval_index: seuraavaIndeksi, sr_next_review: paivamaaraISO(seuraava) };
      } else {
        const yllapitoKierros = seuraavaIndeksi - OPINTO_SR_VALIT_PV.length;
        const vali = yllapidonSeuraavaVali(yllapitoKierros);
        const seuraava = new Date(Date.now() + vali * 86400000);
        paivitys = { sr_interval_index: seuraavaIndeksi, sr_next_review: paivamaaraISO(seuraava) };
      }
    }
    // reference/overlearning: käyttäjä täppää itse (sung-metodi.md §7), ei
    // etene automaattisesti tästä funktiosta.
    if (paivitys) paivitys.viimeksi_kosketettu = new Date().toISOString();
  } else {
    // taitosolmut — VANHA malli koskemattomana (Vaihe 5:n asia, ei kosketa
    // nyt, ks. HYTTI_SPEKSI.md §13).
    if (kohde.vaihe === 'priming') {
      paivitys = { vaihe: 'encoding' };
    } else if (kohde.vaihe === 'encoding') {
      const ensiKertaus = new Date(Date.now() + OPINTO_SR_VALIT_PV[0] * 86400000);
      paivitys = { vaihe: 'retrieval', sr_interval_index: 0, sr_next_review: paivamaaraISO(ensiKertaus) };
    } else if (kohde.vaihe === 'retrieval') {
      const seuraavaIndeksi = kohde.sr_interval_index + 1;
      if (seuraavaIndeksi < OPINTO_SR_VALIT_PV.length) {
        const seuraava = new Date(Date.now() + OPINTO_SR_VALIT_PV[seuraavaIndeksi] * 86400000);
        paivitys = { sr_interval_index: seuraavaIndeksi, sr_next_review: paivamaaraISO(seuraava) };
      } else {
        const vali = yllapidonSeuraavaVali(0);
        const seuraava = new Date(Date.now() + vali * 86400000);
        paivitys = { vaihe: 'yllapito', sr_interval_index: seuraavaIndeksi, sr_next_review: paivamaaraISO(seuraava) };
      }
    } else if (kohde.vaihe === 'yllapito') {
      const yllapitoKierros = kohde.sr_interval_index - OPINTO_SR_VALIT_PV.length + 1;
      const vali = yllapidonSeuraavaVali(yllapitoKierros);
      const seuraava = new Date(Date.now() + vali * 86400000);
      paivitys = { sr_interval_index: kohde.sr_interval_index + 1, sr_next_review: paivamaaraISO(seuraava) };
    }
  }

  if (!paivitys) return;
  const { error } = await db.from(taulu).update(paivitys).eq('id', kohde.id);
  if (error) console.error('PACER/SR-eteneminen epäonnistui (' + taulu + '):', error);
}

// === TAITOSOLMUT (2026-08-04, ks. muistiinpanot.md "Taitosolmut") ===
// Litteä lista Hytin näkymässä (ei omaa kurssikäsitettä, provenienssi
// `lahde`-kentässä) — sama "vain omistaja näkee" RLS kuin muu Hytti.
async function lataaTaitosolmut() {
  const { data, error } = await db.from('taitosolmut').select().order('sort_order');
  if (error) {
    console.error('Taitosolmujen haku epäonnistui:', error);
    return;
  }
  const solmut = data || [];
  const listEl = document.getElementById('taitosolmu-lista');
  listEl.innerHTML = '';

  solmut.forEach(function(solmu) {
    const li = document.createElement('li');
    li.addEventListener('click', function() { avaaTaitosolmu(solmu); });

    const teksti = document.createElement('span');
    teksti.textContent = solmu.name + (solmu.lahde ? ' · ' + solmu.lahde : '');
    li.appendChild(teksti);

    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function(e) {
      e.stopPropagation();
      const vahvistus = await naytaVahvistus('Poistetaanko ' + solmu.name + '?', 'Solmuun osoittavat kaaret poistuvat mukana.', 'Poista');
      if (!vahvistus) return;
      const { error: poistoError } = await db.from('taitosolmut').delete().eq('id', solmu.id);
      if (ilmoitaKirjoitusvirheesta(poistoError, 'Taitosolmun poisto')) return;
      lataaTaitosolmut();
    });
    li.appendChild(poisto);

    listEl.appendChild(li);
  });
}

document.getElementById('taitosolmu-uusi-btn').addEventListener('click', async function() {
  const input = document.getElementById('taitosolmu-uusi-input');
  const nimi = input.value.trim();
  if (nimi === '') { input.focus(); return; }
  const { error } = await db.from('taitosolmut').insert({ name: nimi, owner_id: currentUserId });
  if (ilmoitaKirjoitusvirheesta(error, 'Taitosolmun luonti')) return;
  input.value = '';
  lataaTaitosolmut();
});
document.getElementById('taitosolmu-uusi-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') document.getElementById('taitosolmu-uusi-btn').click();
});

// === SILTATUNNISTUS (2026-08-05, ks. muistiinpanot.md "Siltasolmut") ===
// Kertaluontoinen, käyttäjän käynnistämä älykutsu (EI cron, EI osa
// päivittäistä moottoria — se pysyy puhtaana laskentana ennallaan). Lukee
// KAIKKI aktiiviset kurssit YHTENÄ nippuna (silta on määritelmällisesti se
// mikä toistuu useamman kurssin syötteessä, ei löydettävissä yhtä kurssia
// kerrallaan) ja ehdottaa siltasolmuja + niiden välisiä kaaria. Käyttää
// olemassa olevaa yleiskäyttöistä /api/aly-putkea (ks. api/aly.js) — ei uutta
// endpointtia. "Äly ehdottaa, ihminen kuittaa": EI KOSKAAN kirjoita mitään
// ennen rivikohtaista hyväksyntää esikatseluikkunassa.
// Materiaalin katkaisu per tuotu rivi (2026-08-16) — poimittu pdf-teksti voi
// olla kymmeniä tuhansia merkkejä (nähty: ~41 000), ja moni tuotu rivi per
// kurssi kasvattaisi promptin hallitsemattomaksi. "Materiaali on VIITE, ei
// nieltävä" (alkuperäinen Opintopolku-periaate, ks. KONSEPTIKIRJA.md 4.11)
// koskee tätäkin — silta löytyy toistuvasta KÄSITTEESTÄ, ei koko tekstistä.
const SILTA_MATERIAALI_KATKAISU = 3000;

async function kokoaAktiivistenKurssienMateriaali() {
  const { data: kurssit, error: kurssiError } = await db.from('opinto_kurssit')
    .select('id, name, materiaali').eq('owner_id', currentUserId).eq('status', 'aktiivinen');
  if (kurssiError) {
    console.error('Aktiivisten kurssien haku epäonnistui:', kurssiError);
    return null;
  }
  const kaikki = kurssit || [];
  if (kaikki.length === 0) return { kurssit: [], aiheet: [] };

  // Yhdistetty materiaali (2026-08-16, Katrin elävä testi paljasti aukon):
  // vanha käsin täytetty materiaali-kenttä JA "+ Lisää materiaalia" -kautta
  // tuodut, tähän kurssiin merkityt laituri-rivit (materiaali_kurssi_id,
  // sql/117) — kumpikaan ei syrjäytä toista, molemmat ovat tämän kurssin
  // materiaalia siltahaulle. Ennen tätä siltahaku luki VAIN vanhaa kenttää,
  // joten koko tiedostontuontiputki oli irrallaan siltasolmumoottorista.
  const { data: tuodut, error: tuotuError } = await db.from('laituri')
    .select('materiaali_kurssi_id, content').in('materiaali_kurssi_id', kaikki.map(function(k) { return k.id; }));
  if (tuotuError) {
    console.error('Tuotujen materiaalien haku epäonnistui:', tuotuError);
    return null;
  }
  const tuodutPerKurssi = {};
  (tuodut || []).forEach(function(r) {
    if (!r.materiaali_kurssi_id) return;
    const katkaistu = (r.content || '').slice(0, SILTA_MATERIAALI_KATKAISU);
    (tuodutPerKurssi[r.materiaali_kurssi_id] = tuodutPerKurssi[r.materiaali_kurssi_id] || []).push(katkaistu);
  });

  const kelpaavat = kaikki
    .map(function(k) {
      const yhdistetty = [k.materiaali || ''].concat(tuodutPerKurssi[k.id] || []).filter(function(t) { return t.trim() !== ''; }).join('\n\n');
      return Object.assign({}, k, { materiaali: yhdistetty });
    })
    .filter(function(k) { return k.materiaali.trim() !== ''; });
  if (kelpaavat.length < 2) return { kurssit: kelpaavat, aiheet: [] };

  const { data: aiheet, error: aiheError } = await db.from('opinto_aiheet')
    .select('id, name, kurssi_id').in('kurssi_id', kelpaavat.map(function(k) { return k.id; }));
  if (aiheError) {
    console.error('Aiheiden haku epäonnistui:', aiheError);
    return null;
  }
  return { kurssit: kelpaavat, aiheet: aiheet || [] };
}

function rakennaSiltaPrompti(kurssit, aiheet) {
  const aiheetPerKurssi = {};
  aiheet.forEach(function(a) { (aiheetPerKurssi[a.kurssi_id] = aiheetPerKurssi[a.kurssi_id] || []).push(a); });

  const kurssiLohkot = kurssit.map(function(k) {
    const omatAiheet = (aiheetPerKurssi[k.id] || []).map(function(a) { return '  ' + a.id + ': ' + a.name; }).join('\n');
    return 'KURSSI: ' + k.name + ' (kurssi_id: ' + k.id + ')\nMateriaali: ' + k.materiaali + '\nAiheet (aihe_id: nimi):\n' + omatAiheet;
  }).join('\n\n');

  return 'Tässä on kaikki tällä hetkellä AKTIIVISET opiskelukurssit materiaaleineen ja aiheineen.\n\n' + kurssiLohkot + '\n\n' +
    'Etsi KÄSITTEET jotka TOISTUVAT kahdessa tai useammassa kurssissa YHTÄ AIKAA ("siltasolmut", engl. bridge nodes) — ' +
    'ÄLÄ ehdota käsitettä joka esiintyy vain yhden kurssin sisällössä, vaikka se olisi tärkeä. ' +
    'Silta voi olla myös KAHDEN käsitteen suhde (esim. "ohjelman kulku" = funktiot + ehtolauseet yhdessä) — tällöin kuvaa se yhtenä siltana jolla on liittyy-kaaret molempiin komponentteihin.\n\n' +
    'Odotettu määrä on PIENI, suuruusluokkaa 10-20 koko lukukaudelle — jos löydät paljon enemmän, karsi vain VAHVIMMAT ' +
    '(käsite joka aidosti auttaa toisen kurssin ymmärtämisessä), älä pintapuolisia sanayhteyksiä.\n\n' +
    'Vastaa VAIN JSON-muodossa, ei mitään muuta tekstiä, ei markdown-koodilohkoja:\n' +
    '{"sillat": [{"nimi": "<käsitteen nimi>", "perustelu": "<max 20 sanaa suomeksi, miksi tämä on silta>", ' +
    '"viittaa_aihe_id": [<väh. kaksi aihe_id-numeroa YLLÄ OLEVALTA LISTALTA, ERI kursseilta>], ' +
    '"kaaret": [{"tyyppi": "tarvitsee tai liittyy", "kohde_nimi": "<toisen TÄSSÄ SAMASSA sillat-listassa ehdotetun sillan nimi TARKALLEEN, tai jätä kaaret tyhjäksi listaksi jos ei sovellu>"}]}]}\n' +
    'Jos et löydä yhtään aitoa siltaa, palauta {"sillat": []}.';
}

// Per-kurssi-seuranta (2026-08-16, ks. sql/120, Katrin täsmennys): EI
// toistuva viikkokello vaan "kerran per kurssin lisäys" -eskalaatio. Jokainen
// ONNISTUNUT haku (käsin Nyt-välilehdeltä, kurssisivulta, tai palvelimen
// auto-eskalaatio api/_lib/aly-nightly.js:ssä) kattaa AINA kaikki aktiiviset
// kurssit yhtä aikaa — merkitään siis KAIKKI aktiiviset silta_katsottu_at:iin,
// ei vain kutsujan omaa kurssia.
async function merkitseSillatTarkistetuiksi() {
  const nyt = new Date().toISOString();
  const { error } = await db.from('opinto_kurssit').update({ silta_katsottu_at: nyt }).eq('owner_id', currentUserId).eq('status', 'aktiivinen');
  if (error) console.error('Sillat-tarkistusmerkinnän tallennus epäonnistui:', error);
  piilotaSiltaOdotusIlmoitus();
}

function piilotaSiltaOdotusIlmoitus() {
  const el = document.getElementById('silta-odottaa-ilmoitus');
  if (el) el.style.display = 'none';
}

// Kevyt, ILMAINEN muistutus (EI AI-kutsua) — Katrin oma sanamuoto: "ask
// always as new course is added... other times should be just reminders, no
// AI needed". Näytetään aina kun jokin aktiivinen kurssi ei ole vielä ollut
// mukana yhdessäkään siltahaussa, riippumatta 7 päivän eskalaatiorajasta
// (se koskee VAIN palvelimen automaattista AI-kutsua, ks. api/_lib/aly-nightly.js).
async function paivitaSiltaOdotusIlmoitus() {
  const el = document.getElementById('silta-odottaa-ilmoitus');
  if (!el) return;
  const { data, error } = await db.from('opinto_kurssit').select('id')
    .eq('owner_id', currentUserId).eq('status', 'aktiivinen').is('silta_katsottu_at', null).limit(1);
  if (error || !data || data.length === 0) {
    el.style.display = 'none';
    return;
  }
  el.textContent = 'Uusi kurssi odottaa siltatarkistusta — kannattaisiko tarkistaa sillat?';
  el.style.display = 'block';
}

// Ydinhaku eriytetty (2026-08-16) kahdelle kutsujalle: etsiSiltoja() (Nyt-
// välilehden globaali haku, näyttää KAIKKI ehdotukset) ja
// etsiSiltojaKurssille() (kurssisivun kontekstinen "Tarkista sillat (tämä
// kurssi)" — SAMA haku KAIKISTA aktiivisista kursseista, koska silta on
// määritelmällisesti kahden+ kurssin yhteinen käsite eikä yhdestä kurssista
// löydettävissä, mutta tulos SUODATETAAN näytettäväksi vain kutsujan
// kurssiin liittyvät). Ei UI-tekstinvaihtoa täällä — kutsuja hoitaa sen.
async function suoritaSiltaHaku() {
  const koottu = await kokoaAktiivistenKurssienMateriaali();
  if (!koottu) return { virhe: 'Kurssien haku epäonnistui — yritä uudelleen' };
  if (koottu.kurssit.length < 2) return { virhe: 'Tarvitaan vähintään 2 aktiivista kurssia joilla on materiaalia' };

  const prompti = rakennaSiltaPrompti(koottu.kurssit, koottu.aiheet);
  let tulos = null;
  let virhe = null;
  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    const vastaus = await fetch('/api/aly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ prompt: prompti, max_tokens: 2000 }),
    });
    tulos = await vastaus.json();
    if (!vastaus.ok) virhe = tulos.error || 'Äly ei osannut tätä, kokeile myöhemmin';
  } catch (e) {
    virhe = 'Äly ei osannut tätä, kokeile myöhemmin';
  }
  if (virhe) return { virhe: virhe };

  const jasennetty = jasennaAlyJSON(tulos.text);
  if (!jasennetty || !Array.isArray(jasennetty.sillat)) return { virhe: 'Äly ei osannut tätä, kokeile myöhemmin' };

  const aiheKartta = {};
  koottu.aiheet.forEach(function(a) { aiheKartta[a.id] = a; });
  const kurssiKartta = {};
  koottu.kurssit.forEach(function(k) { kurssiKartta[k.id] = k; });

  // Kelpoisuustarkistus: silta pitää määritelmällisesti viitata VÄHINTÄÄN
  // KAHTEEN ERI kurssiin — hylätään ilman käyttäjän vaivaa jos malli ehdotti
  // jotain yhden kurssin sisäistä (määrittelyn vastaista) huolimatta ohjeesta.
  const kelvolliset = jasennetty.sillat.filter(function(s) {
    if (!s.nimi || !Array.isArray(s.viittaa_aihe_id)) return false;
    const kurssitJoihinViittaa = new Set(s.viittaa_aihe_id.map(function(id) { return aiheKartta[id] ? aiheKartta[id].kurssi_id : null; }).filter(Boolean));
    return kurssitJoihinViittaa.size >= 2;
  });

  merkitseSillatTarkistetuiksi();
  return { kelvolliset: kelvolliset, aiheKartta: aiheKartta, kurssiKartta: kurssiKartta };
}

async function etsiSiltoja() {
  const teksti = document.getElementById('silta-etsi-teksti');
  const alkuperainenTeksti = teksti.textContent;
  teksti.textContent = 'Etsitään...';

  const tulos = await suoritaSiltaHaku();
  teksti.textContent = alkuperainenTeksti;
  if (tulos.virhe) {
    naytaIlmoitus('Siltatunnistus epäonnistui: ' + tulos.virhe);
    return;
  }
  piilotaSiltaOdotusIlmoitus();
  odottavatSiltaRivitIdt = [];
  // Ei avata tyhjää dialogia (2026-08-18, Katrin yleissääntö: "if there is
  // nothing to show, don't show it at all") — sama suora toast-malli kuin
  // kurssikohtaisella haulla jo on (ks. yllä "Ei löytynyt siltoja tälle
  // kurssille tällä kertaa.").
  if (tulos.kelvolliset.length === 0) {
    naytaIlmoitus('Ei löytynyt siltoja tällä kertaa.');
    return;
  }
  naytaSiltaEhdotukset(tulos.kelvolliset, tulos.aiheKartta, tulos.kurssiKartta);
}

// Kurssisivun kontekstinen haku (Katrin pyyntö 2026-08-16: "kurssin solmut
// tulis samalle sivulle hyväksyttäväksi missä materiaalin lisäys tapahtuu").
async function etsiSiltojaKurssille(kurssi) {
  const teksti = document.getElementById('opinto-kurssi-silta-teksti');
  const alkuperainenTeksti = teksti.textContent;
  teksti.textContent = 'Etsitään...';

  const tulos = await suoritaSiltaHaku();
  teksti.textContent = alkuperainenTeksti;
  if (tulos.virhe) {
    naytaIlmoitus('Siltatunnistus epäonnistui: ' + tulos.virhe);
    return;
  }

  const taman_kurssin = tulos.kelvolliset.filter(function(s) {
    return s.viittaa_aihe_id.some(function(id) {
      const aihe = tulos.aiheKartta[id];
      return aihe && aihe.kurssi_id === kurssi.id;
    });
  });
  if (taman_kurssin.length === 0) {
    naytaIlmoitus('Ei löytynyt siltoja tälle kurssille tällä kertaa.');
    return;
  }
  odottavatSiltaRivitIdt = [];
  naytaSiltaEhdotukset(taman_kurssin, tulos.aiheKartta, tulos.kurssiKartta);
}

// Palvelimen auto-eskalaation (api/_lib/aly-nightly.js, ks. sql/119) tallentamat
// ehdotukset — "äly ehdottaa, ihminen kuittaa" koskee myös automaattisesti
// generoituja: SAMA esikatseludialogi, ei mitään kirjoiteta ennen tätä.
// Voi olla useampi odottava rivi jos usea kurssi eskaloitui eri päivinä
// ilman että väliin ehti käsin tehty tarkistus — yhdistetään yhdeksi
// näytöksi. Rivit poistuvat vasta kun dialogi suljetaan/tallennetaan
// (ks. sulje-/tallenna-käsittelijät alla), eivät heti näytettäessä.
let odottavatSiltaRivitIdt = [];
async function naytaOdottavatSiltaEhdotukset() {
  const { data, error } = await db.from('silta_ehdotukset_odottavat').select().eq('owner_id', currentUserId).order('created_at');
  if (error) {
    console.error('Odottavien siltaehdotusten haku epäonnistui:', error);
    return;
  }
  if (!data || data.length === 0) return;

  const kaikkiEhdotukset = [];
  const aiheKartta = {};
  const kurssiKartta = {};
  data.forEach(function(rivi) {
    (rivi.ehdotukset || []).forEach(function(e) { kaikkiEhdotukset.push(e); });
    Object.assign(aiheKartta, rivi.aihe_kartta || {});
    Object.assign(kurssiKartta, rivi.kurssi_kartta || {});
  });
  if (kaikkiEhdotukset.length === 0) return;

  odottavatSiltaRivitIdt = data.map(function(r) { return r.id; });
  naytaIlmoitus('Automaattinen siltatarkistus löysi ' + kaikkiEhdotukset.length + ' ehdotusta — tarkista Kartta-välilehdeltä.');
  naytaSiltaEhdotukset(kaikkiEhdotukset, aiheKartta, kurssiKartta);
}

async function poistaOdottavatSiltaRivit() {
  if (odottavatSiltaRivitIdt.length === 0) return;
  const { error } = await db.from('silta_ehdotukset_odottavat').delete().in('id', odottavatSiltaRivitIdt);
  if (error) console.error('Odottavien siltarivien siivous epäonnistui:', error);
  odottavatSiltaRivitIdt = [];
}

function naytaSiltaEhdotukset(ehdotukset, aiheKartta, kurssiKartta) {
  const overlay = document.getElementById('silta-ehdotus-overlay');
  const lista = document.getElementById('silta-ehdotus-lista');
  lista.innerHTML = '';

  ehdotukset.forEach(function(ehdotus) {
    const li = document.createElement('li');
    li.className = 'silta-ehdotus-rivi';

    const yla = document.createElement('div');
    yla.className = 'silta-ehdotus-yla';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.className = 'silta-ehdotus-checkbox';
    yla.appendChild(checkbox);
    const nimiInput = document.createElement('input');
    nimiInput.type = 'text';
    nimiInput.value = ehdotus.nimi;
    nimiInput.className = 'silta-ehdotus-nimi-input';
    yla.appendChild(nimiInput);
    li.appendChild(yla);

    if (ehdotus.perustelu) {
      const perustelu = document.createElement('div');
      perustelu.className = 'silta-ehdotus-perustelu';
      perustelu.textContent = ehdotus.perustelu;
      li.appendChild(perustelu);
    }

    const viittaukset = document.createElement('div');
    viittaukset.className = 'silta-ehdotus-viittaukset';
    viittaukset.textContent = 'Viittaa: ' + ehdotus.viittaa_aihe_id.map(function(id) {
      const aihe = aiheKartta[id];
      if (!aihe) return '?';
      const kurssi = kurssiKartta[aihe.kurssi_id];
      return aihe.name + ' (' + (kurssi ? kurssi.name : '?') + ')';
    }).join(', ');
    li.appendChild(viittaukset);

    if (Array.isArray(ehdotus.kaaret) && ehdotus.kaaret.length > 0) {
      const kaaret = document.createElement('div');
      kaaret.className = 'silta-ehdotus-kaaret';
      kaaret.textContent = 'Kaaret: ' + ehdotus.kaaret.map(function(k) { return k.tyyppi + ' → ' + k.kohde_nimi; }).join(', ');
      li.appendChild(kaaret);
    }

    // Data talteen DOM-elementtiin tallennusvaihetta varten — kevyempi kuin
    // rinnakkaisen kartan ylläpito, sama "lue DOM:sta" -tapa kuin monessa
    // muussakin esikatseluvaiheessa tässä koodikannassa.
    li._siltaData = ehdotus;
    li._checkbox = checkbox;
    li._nimiInput = nimiInput;

    lista.appendChild(li);
  });

  overlay.style.display = 'flex';
}

document.getElementById('silta-etsi-linkki').addEventListener('click', etsiSiltoja);
document.getElementById('silta-ehdotus-sulje').addEventListener('click', function() {
  document.getElementById('silta-ehdotus-overlay').style.display = 'none';
  poistaOdottavatSiltaRivit();
});

// Tallennusjärjestys: 1) hyväksytyt taitosolmut ensin (kerää nimi->id-kartta
// vastauksesta), 2) taitosolmu_viittaukset jokaiselle, 3) taito_kaaret VAIN
// niille kaarille joiden MOLEMMAT päät ovat hyväksyttyjen joukossa (kaari
// hylättyyn/tuntemattomaan nimeen pudotetaan hiljaisesti — ei virhe, malli on
// voinut ehdottaa kaarta hylättyyn siltaan).
document.getElementById('silta-ehdotus-tallenna-btn').addEventListener('click', async function() {
  const rivit = Array.from(document.getElementById('silta-ehdotus-lista').children).filter(function(li) { return li._checkbox && li._checkbox.checked; });
  if (rivit.length === 0) {
    document.getElementById('silta-ehdotus-overlay').style.display = 'none';
    poistaOdottavatSiltaRivit();
    return;
  }

  const nimiIdKartta = {};
  for (const li of rivit) {
    const nimi = li._nimiInput.value.trim();
    if (!nimi) continue;
    const { data, error } = await db.from('taitosolmut').insert({ owner_id: currentUserId, name: nimi }).select('id').single();
    if (error) {
      console.error('Sillan tallennus epäonnistui (' + nimi + '):', error);
      naytaIlmoitus('"' + nimi + '" tallennus epäonnistui, jatketaan muihin');
      continue;
    }
    nimiIdKartta[li._siltaData.nimi] = data.id;

    const viittausRivit = li._siltaData.viittaa_aihe_id.map(function(aiheId) {
      return { owner_id: currentUserId, taitosolmu_id: data.id, aihe_id: aiheId };
    });
    const { error: viittausError } = await db.from('taitosolmu_viittaukset').insert(viittausRivit);
    if (viittausError) console.error('Viittausten tallennus epäonnistui (' + nimi + '):', viittausError);
  }

  const kaariRivit = [];
  rivit.forEach(function(li) {
    const fromId = nimiIdKartta[li._siltaData.nimi];
    if (!fromId || !Array.isArray(li._siltaData.kaaret)) return;
    li._siltaData.kaaret.forEach(function(k) {
      const toId = nimiIdKartta[k.kohde_nimi];
      const tyyppi = k.tyyppi === 'tarvitsee' ? 'tarvitsee' : 'liittyy';
      if (toId && toId !== fromId) kaariRivit.push({ owner_id: currentUserId, from_id: fromId, to_id: toId, tyyppi: tyyppi });
    });
  });
  if (kaariRivit.length > 0) {
    const { error: kaariError } = await db.from('taito_kaaret').insert(kaariRivit);
    if (kaariError) console.error('Kaarien tallennus epäonnistui:', kaariError);
  }

  document.getElementById('silta-ehdotus-overlay').style.display = 'none';
  poistaOdottavatSiltaRivit();
  naytaIlmoitus(Object.keys(nimiIdKartta).length + ' siltaa tallennettu');
  lataaTaitosolmut();
});

function showTaitosolmuView() {
  piilotaKaikkiNakymat();
  document.getElementById('taitosolmu-view').style.display = 'block';
}

let currentTaitosolmu = null;

async function avaaTaitosolmu(solmu) {
  currentTaitosolmu = solmu;
  showTaitosolmuView();
  document.getElementById('taitosolmu-title').textContent = '✱ ' + solmu.name + ' ✱';
  document.getElementById('taitosolmu-lahde-teksti').textContent = solmu.lahde || '';

  const vaiheSelect = document.getElementById('taitosolmu-vaihe-select');
  vaiheSelect.innerHTML = '';
  OPINTO_VAIHE_JARJESTYS.forEach(function(v) {
    const optio = document.createElement('option');
    optio.value = v;
    optio.textContent = OPINTO_VAIHE_NIMET[v];
    if (v === solmu.vaihe) optio.selected = true;
    vaiheSelect.appendChild(optio);
  });
  vaiheSelect.className = 'opinto-vaihe-select opinto-vaihe-' + solmu.vaihe;

  document.getElementById('taitosolmu-linkki-input').value = solmu.linkki || '';
  document.getElementById('taitosolmu-tavoiteikkuna-input').value = solmu.tavoiteikkuna || '';
  document.getElementById('taitosolmu-muistiinpanot-teksti').value = solmu.muistiinpanot || '';

  lataaKasitekartta(solmu);
  await lataaTaitosolmuKaaret();
}

document.getElementById('taitosolmu-back-btn').addEventListener('click', function() {
  currentTaitosolmu = null;
  // Sillat asuu Reitti-tabilla (2026-08-17 siirto) — paluu 'nyt':iin oli
  // vanha oletus jäänyt siirrosta jäljelle, korjattu 2026-08-18 samassa
  // erässä kuin muu tabikohtainen latausbugi (context-aware return).
  showHyttiView('reitti');
  lataaTaitosolmut();
});

document.getElementById('taitosolmu-poista-btn').addEventListener('click', async function() {
  if (!currentTaitosolmu) return;
  const vahvistus = await naytaVahvistus('Poistetaanko ' + currentTaitosolmu.name + '?', 'Solmuun osoittavat kaaret poistuvat mukana.', 'Poista');
  if (!vahvistus) return;
  const { error } = await db.from('taitosolmut').delete().eq('id', currentTaitosolmu.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Taitosolmun poisto')) return;
  currentTaitosolmu = null;
  // Sillat asuu Reitti-tabilla (2026-08-17 siirto) — paluu 'nyt':iin oli
  // vanha oletus jäänyt siirrosta jäljelle, korjattu 2026-08-18 samassa
  // erässä kuin muu tabikohtainen latausbugi (context-aware return).
  showHyttiView('reitti');
  lataaTaitosolmut();
});

document.getElementById('taitosolmu-vaihe-select').addEventListener('change', async function(e) {
  if (!currentTaitosolmu) return;
  const { error } = await db.from('taitosolmut').update({ vaihe: e.target.value }).eq('id', currentTaitosolmu.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Vaiheen tallennus')) return;
  currentTaitosolmu.vaihe = e.target.value;
  e.target.className = 'opinto-vaihe-select opinto-vaihe-' + e.target.value;
});

// PACER-ohje (2026-08-05, ks. HYTTI_SPEKSI §8) — sama "lue lisää" kuin
// Tänään-kortilla ja kurssinäkymän aihelistalla.
document.getElementById('taitosolmu-ohje-btn').addEventListener('click', function() {
  if (!currentTaitosolmu) return;
  naytaOpintoOhje(currentTaitosolmu.vaihe, currentTaitosolmu);
});

document.getElementById('taitosolmu-tallenna-btn').addEventListener('click', async function() {
  if (!currentTaitosolmu) return;
  const linkki = document.getElementById('taitosolmu-linkki-input').value.trim();
  const tavoiteikkuna = document.getElementById('taitosolmu-tavoiteikkuna-input').value;
  const muistiinpanot = document.getElementById('taitosolmu-muistiinpanot-teksti').value.trim();
  const { error } = await db.from('taitosolmut').update({
    linkki: linkki || null,
    tavoiteikkuna: tavoiteikkuna || null,
    muistiinpanot: muistiinpanot || null,
  }).eq('id', currentTaitosolmu.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Tallennus')) return;
  naytaIlmoitus('Tallennettu');
});

// Kaarien hallinta: haetaan muut solmut + tämän solmun lähtevät kaaret
// erikseen (EI PostgREST-embed-yhdistelmää kahdelle samaan tauluun
// osoittavalle FK:lle — from_id/to_id molemmat -> taitosolmut olisi
// vaatinut FK-nimen eksplisiittistä täsmennystä, yksinkertaisempi ja
// varmempi rakentaa nimikartta client-side kahdesta erillisestä hausta).
async function lataaTaitosolmuKaaret() {
  if (!currentTaitosolmu) return;
  const [{ data: kaikki, error: kaikkiError }, { data: kaaret, error: kaaretError }] = await Promise.all([
    db.from('taitosolmut').select('id, name').neq('id', currentTaitosolmu.id).order('name'),
    db.from('taito_kaaret').select('id, tyyppi, to_id').eq('from_id', currentTaitosolmu.id),
  ]);
  if (kaikkiError || kaaretError) {
    console.error('Kaarien haku epäonnistui:', kaikkiError || kaaretError);
    return;
  }
  const muutSolmut = kaikki || [];
  const nimiKartta = {};
  muutSolmut.forEach(function(s) { nimiKartta[s.id] = s.name; });

  ['tarvitsee', 'liittyy'].forEach(function(tyyppi) {
    const listEl = document.getElementById('taitosolmu-' + tyyppi + '-lista');
    listEl.innerHTML = '';
    (kaaret || []).filter(function(k) { return k.tyyppi === tyyppi; }).forEach(function(k) {
      const li = document.createElement('li');
      const teksti = document.createElement('span');
      teksti.textContent = nimiKartta[k.to_id] || '(poistettu solmu)';
      li.appendChild(teksti);
      const poisto = document.createElement('button');
      poisto.className = 'delete-btn';
      poisto.textContent = '×';
      poisto.addEventListener('click', async function() {
        const { error } = await db.from('taito_kaaret').delete().eq('id', k.id);
        if (ilmoitaKirjoitusvirheesta(error, 'Kaaren poisto')) return;
        lataaTaitosolmuKaaret();
      });
      li.appendChild(poisto);
      listEl.appendChild(li);
    });

    const selectEl = document.getElementById('taitosolmu-' + tyyppi + '-select');
    selectEl.innerHTML = '';
    muutSolmut.forEach(function(s) {
      const optio = document.createElement('option');
      optio.value = s.id;
      optio.textContent = s.name;
      selectEl.appendChild(optio);
    });
  });
}

function sidoKaarenLisays(tyyppi) {
  document.getElementById('taitosolmu-' + tyyppi + '-lisaa-btn').addEventListener('click', async function() {
    if (!currentTaitosolmu) return;
    const selectEl = document.getElementById('taitosolmu-' + tyyppi + '-select');
    const toId = selectEl.value;
    if (!toId) return;
    const { error } = await db.from('taito_kaaret').insert({
      owner_id: currentUserId, from_id: currentTaitosolmu.id, to_id: Number(toId), tyyppi: tyyppi,
    });
    if (ilmoitaKirjoitusvirheesta(error, 'Kaaren lisäys')) return;
    lataaTaitosolmuKaaret();
  });
}
sidoKaarenLisays('tarvitsee');
sidoKaarenLisays('liittyy');

// === KÄSITEKARTTA-EDITORI (2026-08-04, ks. muistiinpanot.md "Taitosolmut")
// === kynä (5 väriä) + kumi + raahattavat/kirjoitettavat tekstilaatikot. EI
// tekoälyä/OCR:ää — teksti on aina käyttäjän itse kirjoittamaa, appi ei
// koskaan tulkitse piirrosta. Tallennus: canvas base64 PNG:nä + tekstilaatikot
// SUHTEELLISINA %-koordinaatteina (pysyvät oikeassa kohdassa puhelimen ja
// tietokoneen välillä, ks. sql/092 yläkommentti).
let kasitekarttaVari = '#000000';
let kasitekarttaTyokalu = 'kyna'; // 'kyna' | 'kumi' | 'teksti'
let kasitekarttaPiirtaa = false;

function kasitekarttaCtx() {
  return document.getElementById('kasitekartta-canvas').getContext('2d');
}

function kasitekarttaTyhjennaCanvas() {
  const canvas = document.getElementById('kasitekartta-canvas');
  const ctx = kasitekarttaCtx();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function kasitekarttaPisteesta(e) {
  const canvas = document.getElementById('kasitekartta-canvas');
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function luoKasitekarttaTekstilaatikko(xProsentti, yProsentti, teksti) {
  const wrap = document.getElementById('kasitekartta-wrap');
  const laatikko = document.createElement('div');
  laatikko.className = 'kasitekartta-teksti-laatikko';
  laatikko.contentEditable = 'true';
  laatikko.textContent = teksti || '';
  laatikko.style.left = xProsentti + '%';
  laatikko.style.top = yProsentti + '%';

  // Raahaus vain kun laatikko EI ole jo fokuksessa kirjoittamassa — sama
  // erottelu kuin useimmissa piirto-appeissa (napautus = raahaa, toinen
  // napautus/fokus = kirjoita). Shift+kaksoisnapautus poistaa.
  let raahataan = false;
  let alkuX = 0, alkuY = 0;
  laatikko.addEventListener('pointerdown', function(e) {
    if (document.activeElement === laatikko) return;
    raahataan = true;
    alkuX = e.clientX;
    alkuY = e.clientY;
    laatikko.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  laatikko.addEventListener('pointermove', function(e) {
    if (!raahataan) return;
    const wrapRect = wrap.getBoundingClientRect();
    const nykyinenLeft = parseFloat(laatikko.style.left) / 100 * wrapRect.width;
    const nykyinenTop = parseFloat(laatikko.style.top) / 100 * wrapRect.height;
    const uusiLeft = nykyinenLeft + (e.clientX - alkuX);
    const uusiTop = nykyinenTop + (e.clientY - alkuY);
    laatikko.style.left = Math.max(0, Math.min(100, uusiLeft / wrapRect.width * 100)) + '%';
    laatikko.style.top = Math.max(0, Math.min(100, uusiTop / wrapRect.height * 100)) + '%';
    alkuX = e.clientX;
    alkuY = e.clientY;
  });
  laatikko.addEventListener('pointerup', function() { raahataan = false; });
  laatikko.addEventListener('dblclick', function(e) { if (e.shiftKey) laatikko.remove(); });

  wrap.appendChild(laatikko);
  return laatikko;
}

function lataaKasitekartta(solmu) {
  kasitekarttaTyhjennaCanvas();
  document.querySelectorAll('.kasitekartta-teksti-laatikko').forEach(function(el) { el.remove(); });
  if (solmu.kasitekartta) {
    const img = new Image();
    img.onload = function() { kasitekarttaCtx().drawImage(img, 0, 0); };
    img.src = solmu.kasitekartta;
  }
  (solmu.kasitekartta_tekstit || []).forEach(function(t) {
    luoKasitekarttaTekstilaatikko(t.x, t.y, t.text);
  });
}

document.querySelectorAll('.kasitekartta-vari-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    kasitekarttaVari = btn.dataset.vari;
    kasitekarttaTyokalu = 'kyna';
    document.querySelectorAll('.kasitekartta-vari-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('kasitekartta-kumi-btn').classList.remove('active');
    document.getElementById('kasitekartta-teksti-btn').classList.remove('active');
  });
});
document.getElementById('kasitekartta-kumi-btn').addEventListener('click', function() {
  kasitekarttaTyokalu = 'kumi';
  document.querySelectorAll('.kasitekartta-vari-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('kasitekartta-kumi-btn').classList.add('active');
  document.getElementById('kasitekartta-teksti-btn').classList.remove('active');
});
document.getElementById('kasitekartta-teksti-btn').addEventListener('click', function() {
  kasitekarttaTyokalu = 'teksti';
  document.querySelectorAll('.kasitekartta-vari-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('kasitekartta-kumi-btn').classList.remove('active');
  document.getElementById('kasitekartta-teksti-btn').classList.add('active');
});
document.getElementById('kasitekartta-tyhjenna-btn').addEventListener('click', async function() {
  const vahvistus = await naytaVahvistus('Tyhjennetäänkö käsitekartta?', 'Piirros ja tekstilaatikot poistuvat (ei tallennu ennen kuin painat "Tallenna käsitekartta").', 'Tyhjennä');
  if (!vahvistus) return;
  kasitekarttaTyhjennaCanvas();
  document.querySelectorAll('.kasitekartta-teksti-laatikko').forEach(function(el) { el.remove(); });
});

const kasitekarttaCanvasEl = document.getElementById('kasitekartta-canvas');
kasitekarttaCanvasEl.addEventListener('pointerdown', function(e) {
  if (kasitekarttaTyokalu === 'teksti') {
    const wrap = document.getElementById('kasitekartta-wrap');
    const wrapRect = wrap.getBoundingClientRect();
    const laatikko = luoKasitekarttaTekstilaatikko(
      (e.clientX - wrapRect.left) / wrapRect.width * 100,
      (e.clientY - wrapRect.top) / wrapRect.height * 100,
      ''
    );
    laatikko.focus();
    return;
  }
  kasitekarttaPiirtaa = true;
  const ctx = kasitekarttaCtx();
  const piste = kasitekarttaPisteesta(e);
  ctx.beginPath();
  ctx.moveTo(piste.x, piste.y);
  ctx.lineWidth = kasitekarttaTyokalu === 'kumi' ? 24 : 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = kasitekarttaTyokalu === 'kumi' ? '#ffffff' : kasitekarttaVari;
  kasitekarttaCanvasEl.setPointerCapture(e.pointerId);
});
kasitekarttaCanvasEl.addEventListener('pointermove', function(e) {
  if (!kasitekarttaPiirtaa) return;
  const ctx = kasitekarttaCtx();
  const piste = kasitekarttaPisteesta(e);
  ctx.lineTo(piste.x, piste.y);
  ctx.stroke();
});
kasitekarttaCanvasEl.addEventListener('pointerup', function() { kasitekarttaPiirtaa = false; });
kasitekarttaCanvasEl.addEventListener('pointercancel', function() { kasitekarttaPiirtaa = false; });

document.getElementById('kasitekartta-tallenna-btn').addEventListener('click', async function() {
  if (!currentTaitosolmu) return;
  const tekstit = Array.from(document.querySelectorAll('.kasitekartta-teksti-laatikko')).map(function(el) {
    return { x: parseFloat(el.style.left), y: parseFloat(el.style.top), text: el.textContent };
  });
  const kuva = document.getElementById('kasitekartta-canvas').toDataURL('image/png');
  const { error } = await db.from('taitosolmut').update({ kasitekartta: kuva, kasitekartta_tekstit: tekstit }).eq('id', currentTaitosolmu.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Käsitekartan tallennus')) return;
  currentTaitosolmu.kasitekartta = kuva;
  currentTaitosolmu.kasitekartta_tekstit = tekstit;
  naytaIlmoitus('Käsitekartta tallennettu');
});

// === HUOLILIPPU pikalisäys (2026-08-04, ks. muistiinpanot.md "Huolilippu")
// === kertaluontoinen merkintä, vaikuttaa opintoPaivanKuorma()-laskentaan.
document.querySelectorAll('.huoli-vakavuus-btn').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    if (!currentUserId) return;
    const pvmInput = document.getElementById('huoli-pvm-input');
    const pvm = pvmInput.value || opintoTanaanPvm();
    const vakavuus = Number(btn.dataset.vakavuus);
    const { error } = await db.from('paivan_huolet').insert({ owner_id: currentUserId, pvm: pvm, vakavuus: vakavuus });
    if (ilmoitaKirjoitusvirheesta(error, 'Huolilipun tallennus')) return;
    document.querySelectorAll('.huoli-vakavuus-btn').forEach(function(b) { b.classList.remove('tallennettu'); });
    btn.classList.add('tallennettu');
    naytaIlmoitus('Huoli merkitty ' + pvm);
    lataaOpintoPaivanAskeleet();
  });
});

// === KALENTERI ===
let kalenteriTila = 'paiva';
let kalenteriPvm = new Date();

const KALENTERI_KUUKAUDET = ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta', 'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta'];
const KALENTERI_PAIVAT = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];

// Näytetäänkö Oma Hytin tänään erääntyvät tehtävät Kalenterin päivänäkymän
// tänään-agendassa. Laitekohtainen asetus (ei synkattu Supabaseen, kuten ei
// muutkaan tämän appin laitekohtaiset asetukset). Kytkin siirretty Asetuksista
// Hytin omaan päänäkymään 2026-07-11 (Hytti v1 -respeksaus) — sama
// localStorage-avain/logiikka, vain sijainti ja teksti muuttuivat. Oletus
// päällä, koska tämä on nimenomaan mitä pyydettiin: näkyy kunnes erikseen
// laitetaan pois. HUOM koskee VAIN perheen näkymiä (etusivu, kalenteri) —
// Hytin OMASSA näkymässä opiskelu näkyy AINA riippumatta tästä kytkimestä.
const HYTTI_KALENTERISSA_KEY = 'kauppalista_hytti_kalenterissa';
function hyttiNakyyKalenterissa() {
  return localStorage.getItem(HYTTI_KALENTERISSA_KEY) !== 'false';
}
function paivitaHyttiTyoVapaaLabel() {
  document.getElementById('hytti-tyo-vapaa-label').textContent = hyttiNakyyKalenterissa() ? 'Opiskelu näkyvissä' : 'Opiskelu piilossa';
  document.getElementById('hytti-kalenteri-toggle').checked = hyttiNakyyKalenterissa();
}

// === YLEISET ASETUKSET (avain-arvo, `asetukset`-taulu, sql/023_asetukset.sql) ===
// Data-ohjattu, uudelleenkäytettävä (Kuormavahdin lisäksi tulevat sääajat ym.)
// — uusi avain on Table Editor -rivinlisäys, ei koodimuutos. Ladataan kerran
// per Kalenteri-näkymän avaus, tarpeeksi tuore pienelle taululle.
let asetuksetKartta = {};
async function paivitaAsetukset() {
  const { data, error } = await db.from('asetukset').select('*');
  if (error) {
    console.error('Asetusten haku epäonnistui:', error);
    return;
  }
  asetuksetKartta = {};
  (data || []).forEach(function(r) { asetuksetKartta[r.key] = r.value; });
}
function haeAsetusNumero(key, oletus) {
  const n = parseInt(asetuksetKartta[key], 10);
  return isNaN(n) ? oletus : n;
}
function haeAsetusTeksti(key, oletus) {
  return asetuksetKartta[key] || oletus;
}
function haeAsetusJSON(key, oletus) {
  try {
    return JSON.parse(asetuksetKartta[key]);
  } catch (e) {
    return oletus;
  }
}

// Kuormavahti: laskee kellonaikaan sidottujen (koko päivän kestävät, esim.
// synttarit, EIVÄT kerrytä) tapahtumien määrän annetulta riviltä. Ankkurit ja
// Hytin tehtävät EIVÄT lasketa mukaan — kyse on kalenterin kuormasta
// (kiinteät ulkoiset menot), ei omista tehtävälistoista. scope='hytti' LASKETAAN
// MUKAAN (Katrin 2026-07-16 korjattu linjaus) — oma opiskelu-/työmeno ON aitoa
// perheen kapasiteetista pois olevaa kuormaa (esim. "koulussa koko päivän").
function laskeMenoja(rivit) {
  return rivit.filter(function(r) { return (!r._tyyppi || r._tyyppi === 'tapahtuma') && r.event_time; }).length;
}

// === PÄÄLLEKKÄISYYSMERKKI (2026-07-10, ks. muistiinpanot.md "Ristiriitamerkki") ===
// Kaksi kellonaikaan sidottua tapahtumaa menevät päällekkäin samana päivänä.
// Vain kalenteritapahtumat (ei ankkurit/Hytti) osallistuvat vertailuun.
//
// Ristiriitapaketti v2 (2026-08-06, ks. muistiinpanot.md "Ristiriitapaketti
// v2"): siirtymapuskuri_min lisätään molempien tapahtumien molempiin päihin
// ENNEN vertailua (matka-aika huomioitu), ja alle min_paallekkainen_min-
// mittainen päällekkäisyys ei laukaise mitään — molemmat asetuksina, ei
// kovakoodattuja (Katrin oma speksi).
function aikaMinuutteina(aika) {
  const osat = aika.split(':');
  return Number(osat[0]) * 60 + Number(osat[1]);
}
function onkoAjallisestiPaallekkainen(a, b) {
  if (!a.event_time || !b.event_time) return false;
  const puskuri = haeAsetusNumero('siirtymapuskuri_min', 30);
  const vahimmaisKesto = haeAsetusNumero('min_paallekkainen_min', 15);
  const aAlku = aikaMinuutteina(a.event_time) - puskuri;
  const aLoppu = aikaMinuutteina(a.event_end_time || a.event_time) + puskuri;
  const bAlku = aikaMinuutteina(b.event_time) - puskuri;
  const bLoppu = aikaMinuutteina(b.event_end_time || b.event_time) + puskuri;
  const paallekkaisAlku = Math.max(aAlku, bAlku);
  const paallekkaisLoppu = Math.min(aLoppu, bLoppu);
  return (paallekkaisLoppu - paallekkaisAlku) >= vahimmaisKesto;
}

// === FÖLI (2026-08-17, SATAMA_SPEKSI.md §8.1) ===
// data.foli.fi on julkinen, ei rekisteröitymistä vaativa, ja lähettää
// Access-Control-Allow-Origin: * — KAIKKI tämä toimii suoraan selaimesta,
// EI tarvita uutta Vercel-funktiota (varmistettu suoraan kokeilemalla
// 17.8.2026, ei oletettu). Riittää "järkevin pysäkki käyttäjän sijaintiin
// perustuen" (spekin oma rajaus) — EI ovelta ovelle -reititystä, EI
// useamman vaihdon yhdistelyä.
//
// Lähde vaadittu lisenssiehdoin (CC BY 4.0): "Lähde: Turun seudun
// joukkoliikenteen liikennöinti- ja aikatauludata, Turun kaupungin
// joukkoliikennetoimisto, data.foli.fi, CC BY 4.0."

// Kotipysäkin oletus kun sijaintilupaa ei ole/saada (Katrin päätös
// 17.8.2026): Marsukatu, PIISPANRISTILLE PÄIN — vahvistettu suoraan SIRI:n
// destinationdisplay-kentistä ("Sorro-Piispanristi-Keskusta"), EI stop_id
// 6010 joka on sama katu vastakkaiseen suuntaan (Naantali). Katrin toinen
// tuttu pysäkki (Oskarinaukio, Kaarinan keskusta) ei ole tässä koodissa
// erikseen — sijaintiin perustuva haku (lahinPysakki) löytää sen luonnostaan
// kun ollaan lähempänä sitä, "95% jompikumpi näistä kahdesta" -tilanteessa.
const FOLI_OLETUSPYSAKKI = '6011';

const FOLI_PYSAKIT_KEY = 'kauppalista_foli_pysakit';
const FOLI_PYSAKIT_MAX_IKA_MS = 24 * 3600000; // 1 vrk — "älä pollaa tiheästi" (§8.1), pysäkit eivät muutu usein

// Koko pysäkkilista (~1600 kpl, nimi+koordinaatit) — välimuistitetaan
// localStorageen 1 vrk:ksi. Käytetään sekä sijaintipohjaiseen lähimmän
// pysäkin hakuun että kalenteritapahtuman location-tekstin täsmäykseen.
async function haeFoliPysakit() {
  try {
    const tallennettu = JSON.parse(localStorage.getItem(FOLI_PYSAKIT_KEY) || 'null');
    if (tallennettu && Date.now() - tallennettu.haettu < FOLI_PYSAKIT_MAX_IKA_MS) {
      return tallennettu.pysakit;
    }
  } catch (e) { /* korruptoitunut välimuisti — haetaan tuoreena alla */ }

  try {
    // KORJATTU 2026-08-18: /gtfs/stops palauttaa nykyään hakemisto-
    // olion ({datasets, latest, go}) eikä enää suoraan pysäkkidataa —
    // tarkistettu suoraan livenä API:sta. Oikea data on go-kentän
    // osoittamassa versioidussa polussa. Koko Föli-ominaisuus oli tämän
    // takia hiljaa rikki siitä asti kun se rakennettiin (17.8.).
    const hakemisto = await fetch('https://data.foli.fi/gtfs/stops');
    if (!hakemisto.ok) return null;
    const meta = await hakemisto.json();
    if (!meta.go) return null;
    const vastaus = await fetch('https:' + meta.go);
    if (!vastaus.ok) return null;
    const pysakit = await vastaus.json();
    try {
      localStorage.setItem(FOLI_PYSAKIT_KEY, JSON.stringify({ haettu: Date.now(), pysakit: pysakit }));
    } catch (e) { /* localStorage täynnä tms — jatketaan silti muistivaraisena */ }
    return pysakit;
  } catch (e) {
    console.error('Föli-pysäkkien haku epäonnistui:', e.message);
    return null;
  }
}

function haversineMetria(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = function(d) { return d * Math.PI / 180; };
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function lahinFoliPysakki(pysakit, lat, lon) {
  let paras = null, parasEtaisyys = Infinity;
  Object.keys(pysakit).forEach(function(id) {
    const p = pysakit[id];
    const d = haversineMetria(lat, lon, p.stop_lat, p.stop_lon);
    if (d < parasEtaisyys) { parasEtaisyys = d; paras = id; }
  });
  return paras;
}

// Kalenteritapahtuman location-tekstin (sql/129, caldav-sync.js) täsmäys
// pysäkin nimeen — pelkkä tekstihaku, EI älyä (kustannuskuri, Katrin oma
// periaate: "äly vain siellä missä se oikeasti tuo lisäarvoa"). Palauttaa
// ensimmäisen osuman, ei parhaan — riittävä koska sama rakennus/alue
// mainitaan yleensä vain kerran pysäkkilistassa.
function etsiFoliPysakkiNimella(pysakit, sijaintiTeksti) {
  if (!sijaintiTeksti || !pysakit) return null;
  const normalisoitu = sijaintiTeksti.toLowerCase();
  let osuma = null;
  Object.keys(pysakit).some(function(id) {
    const nimi = (pysakit[id].stop_name || '').toLowerCase();
    if (nimi && normalisoitu.indexOf(nimi) !== -1) { osuma = id; return true; }
    return false;
  });
  return osuma;
}

// Selaimen sijainti (foreground, kertakysely) — EI taustaseurantaa: iOS
// Safari PWA ei salli luotettavaa taustapaikannusta, eikä sitä pyydetty
// (Katrin oma rajaus 17.8.2026: "at any given moment" tarkoitti käytännössä
// "kun sovellus on auki"). Palauttaa null hiljaa jos lupaa ei ole/saada —
// kutsuja käyttää silloin FOLI_OLETUSPYSAKKIÄ.
function haeSelaimenSijainti() {
  return new Promise(function(resolve) {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      function(pos) { resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
      function() { resolve(null); },
      { timeout: 5000, maximumAge: 300000 }
    );
  });
}

// Lähtöpysäkki juuri nyt: sijaintiluvalla LÄHIN pysäkki KOKO verkosta (ei
// rajattu Katrin kahteen tuttuun — kattaa "joskus ihan muualla" -tilanteen
// luonnostaan), ilman lupaa/dataa FOLI_OLETUSPYSAKKI.
async function haeFoliLahtoPysakki() {
  const pysakit = await haeFoliPysakit();
  if (!pysakit) return FOLI_OLETUSPYSAKKI;
  const sijainti = await haeSelaimenSijainti();
  if (!sijainti) return FOLI_OLETUSPYSAKKI;
  return lahinFoliPysakki(pysakit, sijainti.lat, sijainti.lon) || FOLI_OLETUSPYSAKKI;
}

// SIRI Stop Monitoring -haku yhdelle pysäkille — reaaliaikaiset ennustetut
// lähtöajat (expecteddeparturetime, unix-aikaleima). EI välimuistiteta (§8.1
// sanoo "älä pollaa tiheästi", mutta data ITSESSÄÄN on reaaliaikaista —
// data.foli.fi:n oma palvelin jo välimuistittaa 15-30s, ks. sen dokumentaatio).
async function haeFoliLahdot(pysakkiId) {
  try {
    const vastaus = await fetch('https://data.foli.fi/siri/sm/' + pysakkiId);
    if (!vastaus.ok) return [];
    const data = await vastaus.json();
    if (data.status !== 'OK') return [];
    return Array.isArray(data.result) ? data.result : [];
  } catch (e) {
    console.error('Föli-lähtöjen haku epäonnistui (pysäkki ' + pysakkiId + '):', e.message);
    return [];
  }
}

// === TUNNETUT MATKAT (2026-08-18, Katrin täsmennykset) === EI geokoodausta
// eikä pysäkin arvausta osoitetekstistä — tarkistettu suoraan livenä 18.8.
// ettei Marsukatu-Kupittaa-välillä ole suoraa (vaihdotonta) ajovuoroa, joten
// SIRI:stä ei voi laskea luotettavaa kokonaiskestoa vaihdolliselle matkalle
// (§8.1:n oma rajaus: "ei ovelta ovelle -reititystä"). Sen sijaan Katrin oma
// kokemusperäinen kesto pysäkkiparille + hänen pyytämänsä hosumispuskuri.
// EI tekoälyä tässä — pelkkää suoraa API-dataa ja laskentaa (Katrin pyyntö).
// Uusi tunnettu matka lisätään tähän listaan sitä mukaa kun niitä tulee.
const FOLI_TUNNETUT_MATKAT = [
  {
    tunnistin: 'joukahaisenkatu', // tapahtuman location-tekstin osamerkkijono (pieninä kirjaimina)
    kotiPysakki: '6011', // Marsukatu
    kohdePysakit: ['499', '130', '134', '162', '1685'], // Kupittaan jäähalli / Uudenmaantulli
    kestoMin: 45,
    hosumisPuskuriMin: 10,
    // Katrin täsmennys 18.8.: kalenterin alkuaika (12:00) EI ole todellinen
    // tarve olla paikalla — koululounas ennen tapaamista ("lunch at school")
    // ei ole omana kalenterimerkintänään, samaan tapaan kuin päiväkotivienti
    // ei näy kalenterissa. "I need to be at school at 11" — todellinen
    // saapumistarve on 60min ENNEN kalenterin alkuaikaa.
    saavuEnnenTapahtumaaMin: 60,
  },
];

function etsiTunnettuFoliMatka(tapahtuma) {
  if (!tapahtuma.location) return null; // ei sijaintia = ei matkaa (esim. "meillä")
  const teksti = tapahtuma.location.toLowerCase();
  return FOLI_TUNNETUT_MATKAT.find(function(m) { return teksti.indexOf(m.tunnistin) !== -1; }) || null;
}

// Viimeinen TODELLINEN (SIRI-reaaliaikainen) lähtö kotipysäkiltä joka vielä
// ehtii perille ennen tapahtuman alkua (kesto + hosumispuskuri huomioiden).
// Palauttaa null jos SIRI ei (vielä) näytä yhtään riittävän aikaista lähtöä
// — se ei tarkoita ettei bussia olisi, vain ettei se ole vielä reaaliaika-
// listassa (kaukaisempi lähtö tarkentuu lähempänä).
async function haeFoliLahtoEnnenTapahtumaa(tapahtumaAlkuMs, matka) {
  const lahdot = await haeFoliLahdot(matka.kotiPysakki);
  const tarveOllaPaikallaMs = tapahtumaAlkuMs - (matka.saavuEnnenTapahtumaaMin || 0) * 60000;
  const viimeinenSallittu = tarveOllaPaikallaMs - (matka.kestoMin + matka.hosumisPuskuriMin) * 60000;
  let paras = null;
  lahdot.forEach(function(l) {
    const lahtoMs = l.expecteddeparturetime * 1000;
    if (lahtoMs <= viimeinenSallittu && (!paras || lahtoMs > paras.lahtoMs)) {
      paras = { lahtoMs: lahtoMs, linja: l.lineref, kohde: l.destinationdisplay };
    }
  });
  if (!paras) return null;
  return { lahtoMs: paras.lahtoMs, saapumisMs: paras.lahtoMs + matka.kestoMin * 60000, linja: paras.linja, kohde: paras.kohde };
}

// Ensimmäinen todellinen lähtö jommaltakummalta kohdepysäkiltä tapahtuman
// päättymisen jälkeen — paluumatka.
async function haeFoliPaluuTapahtumanJalkeen(tapahtumaLoppuMs, matka) {
  const kaikki = await Promise.all(matka.kohdePysakit.map(haeFoliLahdot));
  const lahdot = [].concat.apply([], kaikki);
  let paras = null;
  lahdot.forEach(function(l) {
    const lahtoMs = l.expecteddeparturetime * 1000;
    if (lahtoMs >= tapahtumaLoppuMs && (!paras || lahtoMs < paras.lahtoMs)) {
      paras = { lahtoMs: lahtoMs, linja: l.lineref, kohde: l.destinationdisplay };
    }
  });
  if (!paras) return null;
  return { lahtoMs: paras.lahtoMs, saapumisMs: paras.lahtoMs + matka.kestoMin * 60000, linja: paras.linja, kohde: paras.kohde };
}

// Menon + paluun siirtymäpalikat yhdelle kalenteritapahtumalle, minuutti-
// ruudukkoon merkittynä (varattu, sivuvaikutuksena) ja rivilistana
// palautettuna. "Ei vielä tiedossa" -tapauksessa EI varata ruudukosta
// mitään (ei keksitä kestoa) — näytetään vain karkea arvio ajankohdasta.
async function haeFoliSiirtymatTapahtumalle(tapahtuma, paivanIso, varattu) {
  const matka = etsiTunnettuFoliMatka(tapahtuma);
  if (!matka || !tapahtuma.event_time) return [];
  const paivaMs = new Date(paivanIso + 'T00:00:00').getTime();
  const alkuMs = paivaMs + aikaMinuutteina(tapahtuma.event_time.slice(0, 5)) * 60000;
  const loppuMs = tapahtuma.event_end_time ? paivaMs + aikaMinuutteina(tapahtuma.event_end_time.slice(0, 5)) * 60000 : alkuMs + 3600000;

  const [meno, paluu] = await Promise.all([
    haeFoliLahtoEnnenTapahtumaa(alkuMs, matka),
    haeFoliPaluuTapahtumanJalkeen(loppuMs, matka),
  ]);

  const rivit = [];
  if (meno) {
    const a = Math.max(0, Math.round((meno.lahtoMs - paivaMs) / 60000));
    const b = Math.min(1439, Math.round((meno.saapumisMs - paivaMs) / 60000));
    for (let m = a; m < b; m++) varattu[m] = true;
    rivit.push({ tyyppi: 'siirtyma', alku: a, loppu: b, linja: meno.linja, kohde: meno.kohde, suunta: 'meno' });
  } else {
    const arvioAlku = aikaMinuutteina(tapahtuma.event_time.slice(0, 5)) - (matka.saavuEnnenTapahtumaaMin || 0) - matka.kestoMin - matka.hosumisPuskuriMin;
    rivit.push({ tyyppi: 'siirtyma-tuntematon', alku: arvioAlku, loppu: arvioAlku, suunta: 'meno' });
  }
  if (paluu) {
    const a = Math.max(0, Math.round((paluu.lahtoMs - paivaMs) / 60000));
    const b = Math.min(1439, Math.round((paluu.saapumisMs - paivaMs) / 60000));
    for (let m = a; m < b; m++) varattu[m] = true;
    rivit.push({ tyyppi: 'siirtyma', alku: a, loppu: b, linja: paluu.linja, kohde: paluu.kohde, suunta: 'paluu' });
  }
  return rivit;
}

// "Rauhoitus-ikkuna" hytti-melulle (Ristiriitapaketti, kohta 3, 2026-07-17,
// ks. muistiinpanot.md) — YKSINKERTAINEN absoluuttinen päivämääräväli, oma
// pari asetuksia (rauhoitus_alku/rauhoitus_loppu, molemmat YYYY-MM-DD).
// Oletus TYHJÄ = ei rauhoitusta ollenkaan. Tarkoitettu VAIN vaimentamaan
// toistuvia hytti-scopen rutiinipäällekkäisyyksiä (esim. viikoittainen
// luento vs. arjen vakiokuvio) — TÄYSIN ERI mekanismi kuin alla oleva
// lasten hoivaikkuna, ei kosketettu Ristiriitapaketti v2:ssa (Katrin oma
// vahvistus: "onkoRauhoitusIkkunassa() pysyy koskemattomana").
function onkoRauhoitusIkkunassa(isoPvm) {
  const alku = haeAsetusTeksti('rauhoitus_alku', '');
  const loppu = haeAsetusTeksti('rauhoitus_loppu', '');
  if (!alku || !loppu) return false;
  return isoPvm >= alku && isoPvm <= loppu;
}

// === LAPSET / HOIVAIKKUNA (Ristiriitapaketti v2, 2026-08-06, ks. sql/105,
// muistiinpanot.md "Ristiriitapaketti v2") === Korvaa vanhan LITTEÄN,
// kaikille lapsille yhteisen onkoRauhoitettuPaiva()-mallin (kausi+viikon-
// päivät+lomalista+klo 9-15) lapsikohtaisella, todellisilla hoitoajoilla
// lasketulla mallilla. Jaettu perheen data, ei owner_id-rajausta.
let cachedLapset = [];
let cachedLapsiViikkopohja = [];
let cachedLukuvuosijaksot = [];
let cachedLapsiPaivapoikkeus = [];

async function paivitaLapsidata() {
  const [lapsetRes, viikkopohjaRes, lukuvuosiRes, poikkeusRes] = await Promise.all([
    db.from('lapset').select(),
    db.from('lapsi_viikkopohja').select(),
    db.from('lukuvuosijaksot').select(),
    db.from('lapsi_paivapoikkeus').select(),
  ]);
  if (lapsetRes.error) console.error('Lasten haku epäonnistui:', lapsetRes.error);
  if (viikkopohjaRes.error) console.error('Viikkopohjan haku epäonnistui:', viikkopohjaRes.error);
  if (lukuvuosiRes.error) console.error('Lukuvuosijaksojen haku epäonnistui:', lukuvuosiRes.error);
  if (poikkeusRes.error) console.error('Päiväpoikkeusten haku epäonnistui:', poikkeusRes.error);
  cachedLapset = lapsetRes.data || [];
  cachedLapsiViikkopohja = viikkopohjaRes.data || [];
  cachedLukuvuosijaksot = lukuvuosiRes.data || [];
  cachedLapsiPaivapoikkeus = poikkeusRes.data || [];
}

// Postgresin time-sarakkeet tulevat "HH:MM:SS" — normalisoidaan "HH:MM"
// kauttaaltaan ettei merkkijonovertailu sekoa eripituisiin muotoihin.
function aikaHHMM(t) {
  return t ? t.slice(0, 5) : t;
}

function laskeLapsenIka(syntymapaiva, isoPvm) {
  if (!syntymapaiva) return null;
  const s = syntymapaiva.split('-').map(Number);
  const p = isoPvm.split('-').map(Number);
  let ika = p[0] - s[0];
  if (p[1] < s[1] || (p[1] === s[1] && p[2] < s[2])) ika--;
  return ika;
}

function haeViikkopohjaRivi(lapsiId, viikonpaiva) {
  return cachedLapsiViikkopohja.find(function(r) { return r.lapsi_id === lapsiId && r.viikonpaiva === viikonpaiva; }) || null;
}
function haeLukuvuosijaksoPaivalle(lapsiId, isoPvm) {
  return cachedLukuvuosijaksot.find(function(j) { return j.lapsi_id === lapsiId && isoPvm >= j.alkaa && isoPvm <= j.paattyy; }) || null;
}
function haePaivapoikkeusPaivalle(lapsiId, isoPvm) {
  return cachedLapsiPaivapoikkeus.find(function(p) { return p.lapsi_id === lapsiId && p.paiva === isoPvm; }) || null;
}

// Palauttaa taulukon {alkaa,paattyy} ("HH:MM") -ikkunoita joina lapsi
// TARVITSEE valvontaa annettuna päivänä — EI vielä ikäsoftauksia (ks.
// tarvitseeLapsiValvontaa, joka tarvitsee myös päällekkäisyyden KESTON).
// Prioriteetti: päiväpoikkeus > lukuvuosijakso > viikkopohja (sql/105).
// "mukautettu"-poikkeus kattaa VAIN yhden poissaolo-ikkunan (esim. koulu
// 9-14) — mahdollinen aamun hoivaikkuna ENNEN sitä on tietoinen rajaus,
// ei mallinnettu (käyttötapaus on "poikkeava koulupäivä", ei "poikkeava
// aamu").
function haeHoivaikkunat(lapsi, isoPvm) {
  const nukkumaanmeno = aikaHHMM(lapsi.nukkumaanmeno) || '20:30';
  const poikkeus = haePaivapoikkeusPaivalle(lapsi.id, isoPvm);
  if (poikkeus) {
    if (poikkeus.tyyppi === 'poissa') return [];
    if (poikkeus.tyyppi === 'kotona') return [{ alkaa: '00:00', paattyy: nukkumaanmeno }];
    if (poikkeus.tyyppi === 'mukautettu' && poikkeus.alkaa && poikkeus.paattyy) {
      return [
        { alkaa: '00:00', paattyy: aikaHHMM(poikkeus.alkaa) },
        { alkaa: aikaHHMM(poikkeus.paattyy), paattyy: nukkumaanmeno },
      ].filter(function(ikkuna) { return ikkuna.alkaa < ikkuna.paattyy; });
    }
  }

  const osat = isoPvm.split('-').map(Number);
  const viikonpaiva = new Date(osat[0], osat[1] - 1, osat[2]).getDay(); // 0=su...6=la

  const jakso = haeLukuvuosijaksoPaivalle(lapsi.id, isoPvm);
  if (jakso && jakso.tyyppi !== 'koulussa') return [{ alkaa: '00:00', paattyy: nukkumaanmeno }];

  const pohja = haeViikkopohjaRivi(lapsi.id, viikonpaiva);
  if (!pohja) return [{ alkaa: '00:00', paattyy: nukkumaanmeno }]; // ei tietoa -> turvallisin oletus: koko päivä
  return [
    { alkaa: '00:00', paattyy: aikaHHMM(pohja.alkaa) },
    { alkaa: aikaHHMM(pohja.paattyy), paattyy: nukkumaanmeno },
  ].filter(function(ikkuna) { return ikkuna.alkaa < ikkuna.paattyy; });
}

function aikavaliPaallekkain(alku1, loppu1, alku2, loppu2) {
  const alku = alku1 > alku2 ? alku1 : alku2;
  const loppu = loppu1 < loppu2 ? loppu1 : loppu2;
  return alku < loppu ? { alkaa: alku, paattyy: loppu } : null;
}

// Ratkaisee TARVITSEEKO tämä lapsi oikeasti valvontaa annetun päällekkäisyys-
// ikkunan aikana. Ikäsoftaukset (Katrin oma määrittely, kaikki VALINNAISIA
// kynnyksiä — null = kynnystä ei sovelleta):
//  - tarvitsee_valvontaa=false TAI ika >= ika_yksin_illassa -> ei koskaan
//  - ika >= ika_iltaan_asti -> ei ristiriitaa (pärjää koulun jälkeen iltaan)
//  - ika >= ika_yksin_hetkittain JA päällekkäisyys < yksin_hetkittain_raja_min
//    -> ei ristiriitaa (lyhyt "pärjää hetken yksin" -ikkuna)
function tarvitseeLapsiValvontaa(lapsi, isoPvm, paallekkaisAlku, paallekkaisLoppu) {
  if (!lapsi.tarvitsee_valvontaa) return false;
  const ika = laskeLapsenIka(lapsi.syntymapaiva, isoPvm);
  if (ika !== null && lapsi.ika_yksin_illassa != null && ika >= lapsi.ika_yksin_illassa) return false;

  const hoivaikkunat = haeHoivaikkunat(lapsi, isoPvm);
  const osuu = hoivaikkunat.some(function(ikkuna) {
    return aikavaliPaallekkain(paallekkaisAlku, paallekkaisLoppu, ikkuna.alkaa, ikkuna.paattyy) !== null;
  });
  if (!osuu) return false;

  if (ika !== null && lapsi.ika_iltaan_asti != null && ika >= lapsi.ika_iltaan_asti) return false;

  if (ika !== null && lapsi.ika_yksin_hetkittain != null && ika >= lapsi.ika_yksin_hetkittain) {
    const kesto = aikaMinuutteina(paallekkaisLoppu) - aikaMinuutteina(paallekkaisAlku);
    const raja = haeAsetusNumero('yksin_hetkittain_raja_min', 90);
    if (kesto < raja) return false;
  }

  return true;
}

// Kolmiportainen vakavuus kahden päällekkäisen tapahtuman välillä (Ristiriita-
// paketti, 2026-07-17, KORJATTU samana päivänä Katrin OSA X -testilöydöksestä
// — ks. muistiinpanot.md Bugi 25): nyrkkisääntö on "voiko fyysisesti toteutua
// ilman että kukaan on kahdessa paikassa? Jos ei → FULL."
//  - 'full'      saman syötteen sisäinen päällekkäisyys (aina), TAI KUMPI
//                TAHANSA puoli on TUNNISTETTU (oma henkilökohtainen meno
//                `_henkilo`, TAI oikealta kalenterisyötteeltä tuleva
//                `syote_id`). TÄMÄ EI RIIPU LAPSISTA MITENKÄÄN (Katrin
//                vahvistus 2026-08-06: "full = sama henkilö kahdessa
//                paikassa, se on aina mahdotonta lapsista riippumatta").
//  - 'attention' hytti-scopen päällekkäisyys rauhoitus-ikkunan sisällä
//                (muuten olisi 'full'), TAI vähintään yksi lapsi (jota ei
//                ole katettu kummankaan tapahtuman kattaa_lapset-kentässä)
//                tarvitsee valvontaa juuri tällä päällekkäisyysikkunalla
//                (Ristiriitapaketti v2, ks. tarvitseeLapsiValvontaa yllä).
//  - 'none'      kumpikaan tapahtuma ei ole tunnistettu JA joko lapsia ei
//                ole, tai kaikki tarvitsevat-valvontaa-lapset on katettu,
//                tai kukaan lapsi ei ole hoivaikkunassa juuri silloin.
function paallekkaisyysVakavuus(a, b, isoPvm) {
  if (a.syote_id && b.syote_id && a.syote_id === b.syote_id) return 'full';

  const hyttiaMukana = a._scope === 'hytti' || b._scope === 'hytti';
  if (hyttiaMukana && onkoRauhoitusIkkunassa(isoPvm)) return 'attention';

  if (a._henkilo || b._henkilo || a.syote_id || b.syote_id) return 'full';

  const aLoppu = a.event_end_time || a.event_time;
  const bLoppu = b.event_end_time || b.event_time;
  const paallekkaisAlku = aikaHHMM(a.event_time > b.event_time ? a.event_time : b.event_time);
  const paallekkaisLoppu = aikaHHMM(aLoppu < bLoppu ? aLoppu : bLoppu);

  const katetutLapset = new Set((a.kattaa_lapset || []).concat(b.kattaa_lapset || []));
  const tarvitaanVartija = cachedLapset.some(function(lapsi) {
    if (katetutLapset.has(lapsi.id)) return false;
    return tarvitseeLapsiValvontaa(lapsi, isoPvm, paallekkaisAlku, paallekkaisLoppu);
  });
  return tarvitaanVartija ? 'attention' : 'none';
}

// Analysoi annetun päivän KAIKKI päällekkäisyydet kerralla — korvaa aiemman
// pelkän totuusarvon palauttavan onkoPaivanRistiriita():n (Ristiriitapaketti,
// 2026-07-17). Palauttaa { vakavuus: 'full'|'attention'|'none', fullIds }
// — fullIds on JÄRJESTETTY, ainutkertainen taulukko niiden tapahtumien id:istä
// jotka osallistuvat VÄHINTÄÄN yhteen 'full'-tason pariin sinä päivänä.
// fullIds on "Keskusteltu"-lipun allekirjoitus (ks. ristiriitaAvain alla):
// jos allekirjoitus muuttuu (uusi tapahtuma liittyy mukaan), aiempi kuittaus
// ei enää täsmää eikä siis peitä UUTTA päällekkäisyyttä.
function analysoiPaivanRistiriidat(rivit, isoPvm) {
  const tapahtumat = rivit.filter(function(r) { return (!r._tyyppi || r._tyyppi === 'tapahtuma') && r.event_time; });
  let vakavuus = 'none';
  const fullIdSet = new Set();
  for (let i = 0; i < tapahtumat.length; i++) {
    for (let j = i + 1; j < tapahtumat.length; j++) {
      if (!onkoAjallisestiPaallekkainen(tapahtumat[i], tapahtumat[j])) continue;
      const pari = paallekkaisyysVakavuus(tapahtumat[i], tapahtumat[j], isoPvm);
      if (pari === 'full') {
        vakavuus = 'full';
        fullIdSet.add(tapahtumat[i].id);
        fullIdSet.add(tapahtumat[j].id);
      } else if (pari === 'attention' && vakavuus === 'none') {
        vakavuus = 'attention';
      }
    }
  }
  const fullIds = Array.from(fullIdSet).sort(function(x, y) { return x - y; });
  return { vakavuus: vakavuus, fullIds: fullIds };
}

function minutesToHHMM(min) {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

// Henkselit-versio paallekkaisyysVakavuus:sta (2026-08-05, ks.
// muistiinpanot.md "Henkselit") — MOLEMMAT vanhemmat henkselöity SAMANAIKAI-
// SESTI on eri kysymys kuin kaksi kalenteritapahtumaa päällekkäin (ei
// tapahtumapareja, ei syote_id:tä), joten TIETOISESTI OMA, rinnakkainen
// tarkistus — EI ujutettu paallekkaisyysVakavuus/analysoiPaivanRistiriidat:n
// fullIds/kuittaus-koneistoon, joka on suunniteltu nimenomaan VERTAILTAVIEN
// tapahtumaparien varalle (avaaRistiriitaVahvistus odottaa oikeita
// tapahtuma-id:itä, ei henkselit-rivi-id:itä). Sama ⚠️-merkki näkyy
// käyttäjälle kummastakin syystä, ks. paivanRistiriitaTila alempana, mutta
// napautuskäyttäytyminen eroaa (ks. kutsupaikat).
//
// Palauttaa true jos löytyy ajanhetki jolloin SEKÄ katri ETTÄ juha ovat
// henkselöity JA vähintään yksi valvontaa tarvitseva lapsi on hoivaikkunassa
// sillä hetkellä eikä ole katettu minkään sinä päivänä näkyvän tapahtuman
// kattaa_lapset-kentässä (ks. tarvitseeLapsiValvontaa, paallekkaisyysVakavuus
// — sama ikäsoftaus-/hoivaikkunalogiikka, uudelleenkäytetty sellaisenaan).
// Speksin sana on "sallitaan mutta näytetään ristiriitavaroitus" — EI
// koskaan kova esto, pelkkä signaali.
function henkselitAiheuttaaRistiriidan(henkselitSinaPaivana, tapahtumatSinaPaivana, isoPvm) {
  const katrit = henkselitSinaPaivana.filter(function(r) { return r.henkilo === 'katri'; });
  const juhat = henkselitSinaPaivana.filter(function(r) { return r.henkilo === 'juha'; });
  if (katrit.length === 0 || juhat.length === 0) return false;

  const katetutLapset = new Set();
  tapahtumatSinaPaivana.forEach(function(t) { (t.kattaa_lapset || []).forEach(function(id) { katetutLapset.add(id); }); });

  for (let i = 0; i < katrit.length; i++) {
    for (let j = 0; j < juhat.length; j++) {
      const kOsuus = henkselitPaivaosuus(katrit[i], isoPvm);
      const jOsuus = henkselitPaivaosuus(juhat[j], isoPvm);
      if (!kOsuus || !jOsuus) continue;
      const paallekkaisAlkuMin = Math.max(kOsuus.alkuMin, jOsuus.alkuMin);
      const paallekkaisLoppuMin = Math.min(kOsuus.loppuMin, jOsuus.loppuMin);
      if (paallekkaisLoppuMin <= paallekkaisAlkuMin) continue;
      const paallekkaisAlku = minutesToHHMM(paallekkaisAlkuMin);
      const paallekkaisLoppu = minutesToHHMM(paallekkaisLoppuMin);
      const tarvitaanVartija = cachedLapset.some(function(lapsi) {
        if (katetutLapset.has(lapsi.id)) return false;
        return tarvitseeLapsiValvontaa(lapsi, isoPvm, paallekkaisAlku, paallekkaisLoppu);
      });
      if (tarvitaanVartija) return true;
    }
  }
  return false;
}

// Yhdistää tapahtumaparipohjaisen (analysoiPaivanRistiriidat) JA henkselit-
// pohjaisen (henkselitAiheuttaaRistiriidan) ristiriitasignaalin yhdeksi
// näytettäväksi tilaksi kutsupaikkoja varten — KAKSI ERI, RINNAKKAISTA
// mekanismia (eri syyt, eri kuittaustapa: tapahtumapareilla on "keskusteltu"
// kuittaus, henkselit-versiolla ei ole mitään pysyvää kuittaustilaa, koska
// se ei viittaa oikeisiin tapahtuma-id:ihin), mutta käyttäjän silmissä sama
// ⚠️-merkki. henkselitSinaPaivana voi olla undefined kutsupaikoissa jotka
// eivät (vielä) hae henkseleitä — käsitellään silloin tyhjänä listana.
function paivanRistiriitaTila(paivanKaikki, iso, henkselitSinaPaivana) {
  const paivanAjallisiaMaara = paivanKaikki.filter(function(t) { return t.event_time; }).length;
  const tapahtumaRistiriita = paivanAjallisiaMaara > 1 ? analysoiPaivanRistiriidat(paivanKaikki, iso) : { vakavuus: 'none', fullIds: [] };
  const tapahtumaOnRistiriita = tapahtumaRistiriita.vakavuus === 'full' && !onkoRistiriitaKuitattu(iso, tapahtumaRistiriita.fullIds);
  const henkselitOnRistiriita = henkselitAiheuttaaRistiriidan(henkselitSinaPaivana || [], paivanKaikki, iso);
  return {
    vakavuus: tapahtumaRistiriita.vakavuus,
    fullIds: tapahtumaRistiriita.fullIds,
    onRistiriita: tapahtumaOnRistiriita || henkselitOnRistiriita,
    henkselitOnRistiriita: henkselitOnRistiriita,
  };
}

// Rakentaa "Keskusteltu"-kuittauksen allekirjoitusavaimen (event_date +
// osallistuvien tapahtumien id-joukko) — ks. analysoiPaivanRistiriidat.
function ristiriitaAvain(fullIds) {
  return fullIds.join(',');
}

// === LAPSET-HALLINTA UI (Ristiriitapaketti v2, 2026-08-06, ks. sql/105,
// muistiinpanot.md "Ristiriitapaketti v2") === Asetukset-näkymän "👶 Lapset"
// -osiosta avautuva profiili + viikkopohja + lukuvuosijaksot + päivä-
// poikkeukset samalla sivulla. Jaettu perheen data, ei owner_id-rajausta.
async function lataaLapset() {
  const { data, error } = await db.from('lapset').select().order('nimi');
  if (error) {
    console.error('Lasten haku epäonnistui:', error);
    return;
  }
  const lapset = data || [];
  const listEl = document.getElementById('lapset-lista');
  listEl.innerHTML = '';
  lapset.forEach(function(lapsi) {
    const li = document.createElement('li');
    li.addEventListener('click', function() { avaaLapsi(lapsi); });
    const teksti = document.createElement('span');
    teksti.textContent = lapsi.nimi;
    li.appendChild(teksti);
    listEl.appendChild(li);
  });
}

document.getElementById('lapsi-uusi-btn').addEventListener('click', async function() {
  const input = document.getElementById('lapsi-uusi-input');
  const nimi = input.value.trim();
  if (!nimi) { input.focus(); return; }
  const { error } = await db.from('lapset').insert({ nimi: nimi });
  if (ilmoitaKirjoitusvirheesta(error, 'Lapsen lisäys')) return;
  input.value = '';
  lataaLapset();
});
document.getElementById('lapsi-uusi-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('lapsi-uusi-btn').click();
});

function showLapsiView() {
  piilotaKaikkiNakymat();
  document.getElementById('lapsi-view').style.display = 'block';
}

let currentLapsi = null;
const VIIKONPAIVA_NIMET = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'];

async function avaaLapsi(lapsi) {
  currentLapsi = lapsi;
  showLapsiView();
  document.getElementById('lapsi-title').textContent = '✱ ' + lapsi.nimi.toUpperCase() + ' ✱';
  document.getElementById('lapsi-nimi-input').value = lapsi.nimi;
  document.getElementById('lapsi-syntymapaiva-input').value = lapsi.syntymapaiva || '';
  document.getElementById('lapsi-hoitopaikka-select').value = lapsi.hoitopaikka_tyyppi || '';
  document.getElementById('lapsi-nukkumaanmeno-input').value = lapsi.nukkumaanmeno ? lapsi.nukkumaanmeno.slice(0, 5) : '20:30';
  document.getElementById('lapsi-ika-hetkittain-input').value = lapsi.ika_yksin_hetkittain != null ? lapsi.ika_yksin_hetkittain : '';
  document.getElementById('lapsi-ika-iltaan-input').value = lapsi.ika_iltaan_asti != null ? lapsi.ika_iltaan_asti : '';
  document.getElementById('lapsi-ika-illassa-input').value = lapsi.ika_yksin_illassa != null ? lapsi.ika_yksin_illassa : '';
  document.getElementById('lapsi-valvonta-toggle').checked = lapsi.tarvitsee_valvontaa !== false;

  await lataaLapsiViikkopohja();
  await lataaLapsiLukuvuosijaksot();
  await lataaLapsiPaivapoikkeukset();
}

document.getElementById('lapsi-back-btn').addEventListener('click', function() {
  currentLapsi = null;
  showAsetuksetView();
  lataaLapset();
});

document.getElementById('lapsi-poista-btn').addEventListener('click', async function() {
  if (!currentLapsi) return;
  const vahvistus = await naytaVahvistus('Poistetaanko ' + currentLapsi.nimi + '?', 'Viikkopohja, lukuvuosijaksot ja päiväpoikkeukset poistuvat mukana.', 'Poista');
  if (!vahvistus) return;
  const { error } = await db.from('lapset').delete().eq('id', currentLapsi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Lapsen poisto')) return;
  currentLapsi = null;
  showAsetuksetView();
  lataaLapset();
});

document.getElementById('lapsi-tallenna-btn').addEventListener('click', async function() {
  if (!currentLapsi) return;
  const nimi = document.getElementById('lapsi-nimi-input').value.trim();
  if (!nimi) { naytaIlmoitus('Nimi ei voi olla tyhjä'); return; }
  function parseIka(id) {
    const v = document.getElementById(id).value;
    return v === '' ? null : Number(v);
  }
  const paivitys = {
    nimi: nimi,
    syntymapaiva: document.getElementById('lapsi-syntymapaiva-input').value || null,
    hoitopaikka_tyyppi: document.getElementById('lapsi-hoitopaikka-select').value || null,
    nukkumaanmeno: document.getElementById('lapsi-nukkumaanmeno-input').value || '20:30',
    ika_yksin_hetkittain: parseIka('lapsi-ika-hetkittain-input'),
    ika_iltaan_asti: parseIka('lapsi-ika-iltaan-input'),
    ika_yksin_illassa: parseIka('lapsi-ika-illassa-input'),
    tarvitsee_valvontaa: document.getElementById('lapsi-valvonta-toggle').checked,
  };
  const { error } = await db.from('lapset').update(paivitys).eq('id', currentLapsi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Lapsen tiedon tallennus')) return;
  Object.assign(currentLapsi, paivitys);
  document.getElementById('lapsi-title').textContent = '✱ ' + nimi.toUpperCase() + ' ✱';
  naytaIlmoitus('Tallennettu');
});

// Viikkopohja: 7 riviä (Ma-Su näyttöjärjestyksessä, tallennus JS:n omalla
// getDay()-numeroinnilla 0=su...6=la, ks. sql/105 yläkommentti). Tyhjä rivi
// (ei alkaa/paattyy-arvoa tallessa) tarkoittaa "ei koulua/pk tänä päivänä"
// — hoivaikkuna kattaa silloin koko päivän (haeHoivaikkunat()-oletus), mikä
// on jo oikea käytös viikonlopulle ilman erillistä kytkintä.
async function lataaLapsiViikkopohja() {
  if (!currentLapsi) return;
  const { data, error } = await db.from('lapsi_viikkopohja').select().eq('lapsi_id', currentLapsi.id);
  if (error) {
    console.error('Viikkopohjan haku epäonnistui:', error);
    return;
  }
  const rivitKartta = {};
  (data || []).forEach(function(r) { rivitKartta[r.viikonpaiva] = r; });

  const kontti = document.getElementById('lapsi-viikkopohja-rivit');
  kontti.innerHTML = '';
  [1, 2, 3, 4, 5, 6, 0].forEach(function(viikonpaiva) {
    const rivi = rivitKartta[viikonpaiva];
    const div = document.createElement('div');
    div.className = 'opinto-deadline-lisays';

    const label = document.createElement('span');
    label.textContent = VIIKONPAIVA_NIMET[viikonpaiva];
    label.className = 'lapsi-viikkopohja-label';
    div.appendChild(label);

    const alkaaInput = document.createElement('input');
    alkaaInput.type = 'time';
    alkaaInput.value = rivi ? rivi.alkaa.slice(0, 5) : '';
    div.appendChild(alkaaInput);

    const paattyyInput = document.createElement('input');
    paattyyInput.type = 'time';
    paattyyInput.value = rivi ? rivi.paattyy.slice(0, 5) : '';
    div.appendChild(paattyyInput);

    const tallennaNappi = document.createElement('button');
    tallennaNappi.className = 'dialog-btn dialog-btn-cancel';
    tallennaNappi.textContent = rivi ? 'Päivitä' : 'Aseta';
    tallennaNappi.addEventListener('click', async function() {
      const alkaa = alkaaInput.value;
      const paattyy = paattyyInput.value;
      if (!alkaa || !paattyy) { naytaIlmoitus('Anna molemmat kellonajat'); return; }
      const { error: tallennusError } = await db.from('lapsi_viikkopohja')
        .upsert({ lapsi_id: currentLapsi.id, viikonpaiva: viikonpaiva, alkaa: alkaa, paattyy: paattyy }, { onConflict: 'lapsi_id,viikonpaiva' });
      if (ilmoitaKirjoitusvirheesta(tallennusError, 'Viikkopohjan tallennus')) return;
      naytaIlmoitus('Tallennettu');
      lataaLapsiViikkopohja();
    });
    div.appendChild(tallennaNappi);

    if (rivi) {
      const poistoNappi = document.createElement('button');
      poistoNappi.className = 'delete-btn';
      poistoNappi.textContent = '×';
      poistoNappi.addEventListener('click', async function() {
        const { error: poistoError } = await db.from('lapsi_viikkopohja').delete().eq('id', rivi.id);
        if (ilmoitaKirjoitusvirheesta(poistoError, 'Viikkopohjarivin poisto')) return;
        lataaLapsiViikkopohja();
      });
      div.appendChild(poistoNappi);
    }

    kontti.appendChild(div);
  });
}

const LUKUVUOSI_TYYPPI_NIMET = { koulussa: 'Koulussa', loma: 'Loma', suunnittelupaiva: 'Suunnittelupäivä', arkipyha: 'Arkipyhä' };

async function lataaLapsiLukuvuosijaksot() {
  if (!currentLapsi) return;
  const { data, error } = await db.from('lukuvuosijaksot').select().eq('lapsi_id', currentLapsi.id).order('alkaa');
  if (error) {
    console.error('Lukuvuosijaksojen haku epäonnistui:', error);
    return;
  }
  const listEl = document.getElementById('lapsi-lukuvuosi-lista');
  listEl.innerHTML = '';
  (data || []).forEach(function(jakso) {
    const li = document.createElement('li');
    const teksti = document.createElement('span');
    teksti.textContent = jakso.alkaa + ' – ' + jakso.paattyy + ' · ' + (LUKUVUOSI_TYYPPI_NIMET[jakso.tyyppi] || jakso.tyyppi);
    li.appendChild(teksti);
    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function() {
      const { error: poistoError } = await db.from('lukuvuosijaksot').delete().eq('id', jakso.id);
      if (ilmoitaKirjoitusvirheesta(poistoError, 'Lukuvuosijakson poisto')) return;
      lataaLapsiLukuvuosijaksot();
    });
    li.appendChild(poisto);
    listEl.appendChild(li);
  });
}

document.getElementById('lapsi-lukuvuosi-lisaa-btn').addEventListener('click', async function() {
  if (!currentLapsi) return;
  const alkaa = document.getElementById('lapsi-lukuvuosi-alkaa-input').value;
  const paattyy = document.getElementById('lapsi-lukuvuosi-paattyy-input').value;
  const tyyppi = document.getElementById('lapsi-lukuvuosi-tyyppi-select').value;
  if (!alkaa || !paattyy) { naytaIlmoitus('Anna molemmat päivämäärät'); return; }
  if (alkaa > paattyy) { naytaIlmoitus('Alkupäivä on loppupäivän jälkeen'); return; }
  const { error } = await db.from('lukuvuosijaksot').insert({ lapsi_id: currentLapsi.id, alkaa: alkaa, paattyy: paattyy, tyyppi: tyyppi });
  if (ilmoitaKirjoitusvirheesta(error, 'Lukuvuosijakson lisäys')) return;
  document.getElementById('lapsi-lukuvuosi-alkaa-input').value = '';
  document.getElementById('lapsi-lukuvuosi-paattyy-input').value = '';
  lataaLapsiLukuvuosijaksot();
});

document.getElementById('lapsi-poikkeus-tyyppi-select').addEventListener('change', function() {
  document.getElementById('lapsi-poikkeus-aika-rivi').style.display = this.value === 'mukautettu' ? 'flex' : 'none';
});

const PAIVAPOIKKEUS_TYYPPI_NIMET = { kotona: 'Kotona koko päivän', poissa: 'Poissa koko päivän', mukautettu: 'Mukautettu' };

// Näytetään vain tulevat/tämänpäiväiset poikkeukset — menneet eivät ole enää
// toiminnallisesti kiinnostavia (sama "vilkaisuarvo" -periaate kuin muualla).
async function lataaLapsiPaivapoikkeukset() {
  if (!currentLapsi) return;
  const tanaan = paivamaaraISO(new Date());
  const { data, error } = await db.from('lapsi_paivapoikkeus').select().eq('lapsi_id', currentLapsi.id).gte('paiva', tanaan).order('paiva');
  if (error) {
    console.error('Päiväpoikkeusten haku epäonnistui:', error);
    return;
  }
  const listEl = document.getElementById('lapsi-poikkeus-lista');
  listEl.innerHTML = '';
  (data || []).forEach(function(poikkeus) {
    const li = document.createElement('li');
    const teksti = document.createElement('span');
    let kuvaus = poikkeus.paiva + ' · ' + (PAIVAPOIKKEUS_TYYPPI_NIMET[poikkeus.tyyppi] || poikkeus.tyyppi);
    if (poikkeus.tyyppi === 'mukautettu' && poikkeus.alkaa && poikkeus.paattyy) {
      kuvaus += ' (' + poikkeus.alkaa.slice(0, 5) + '–' + poikkeus.paattyy.slice(0, 5) + ' poissa)';
    }
    if (poikkeus.huomio) kuvaus += ' — ' + poikkeus.huomio;
    teksti.textContent = kuvaus;
    li.appendChild(teksti);
    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function() {
      const { error: poistoError } = await db.from('lapsi_paivapoikkeus').delete().eq('id', poikkeus.id);
      if (ilmoitaKirjoitusvirheesta(poistoError, 'Päiväpoikkeuksen poisto')) return;
      lataaLapsiPaivapoikkeukset();
    });
    li.appendChild(poisto);
    listEl.appendChild(li);
  });
}

document.getElementById('lapsi-poikkeus-lisaa-btn').addEventListener('click', async function() {
  if (!currentLapsi) return;
  const paiva = document.getElementById('lapsi-poikkeus-pvm-input').value;
  const tyyppi = document.getElementById('lapsi-poikkeus-tyyppi-select').value;
  const huomio = document.getElementById('lapsi-poikkeus-huomio-input').value.trim();
  if (!paiva) { naytaIlmoitus('Valitse päivä'); return; }
  const rivi = { lapsi_id: currentLapsi.id, paiva: paiva, tyyppi: tyyppi, huomio: huomio || null, alkaa: null, paattyy: null };
  if (tyyppi === 'mukautettu') {
    const alkaa = document.getElementById('lapsi-poikkeus-alkaa-input').value;
    const paattyy = document.getElementById('lapsi-poikkeus-paattyy-input').value;
    if (!alkaa || !paattyy) { naytaIlmoitus('Anna mukautetun ikkunan molemmat kellonajat'); return; }
    rivi.alkaa = alkaa;
    rivi.paattyy = paattyy;
  }
  const { error } = await db.from('lapsi_paivapoikkeus').upsert(rivi, { onConflict: 'lapsi_id,paiva' });
  if (ilmoitaKirjoitusvirheesta(error, 'Päiväpoikkeuksen lisäys')) return;
  document.getElementById('lapsi-poikkeus-pvm-input').value = '';
  document.getElementById('lapsi-poikkeus-huomio-input').value = '';
  lataaLapsiPaivapoikkeukset();
});

// kattaa_lapset-valinta yhdelle kalenteritapahtumalle (Ristiriitapaketti v2,
// 2026-08-06) — "yksi kenttä, kolme käyttötapausta" (Katrin oma rajaus):
// oma meno jossa lapsi mukana, toisen hoitajan hakeva tapahtuma, tai lapsi
// pärjää yksin ilman kuljetusta. cachedLapset on jo ladattu kalenterin
// avatessa (ks. paivitaLapsidata, kutsuttu lataaKalenteri()-ketjussa).
function avaaKattaaLapsetValikko(rivi) {
  const lista = document.getElementById('kattaa-lapset-lista');
  lista.innerHTML = '';
  const katetut = new Set(rivi.kattaa_lapset || []);

  cachedLapset.forEach(function(lapsi) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '8px';
    label.style.width = '100%';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = katetut.has(lapsi.id);
    checkbox.dataset.lapsiId = lapsi.id;
    label.appendChild(checkbox);
    const teksti = document.createElement('span');
    teksti.textContent = lapsi.nimi;
    label.appendChild(teksti);
    li.appendChild(label);
    lista.appendChild(li);
  });

  document.getElementById('kattaa-lapset-tallenna-btn').onclick = async function() {
    const valitut = Array.from(lista.querySelectorAll('input[type="checkbox"]:checked')).map(function(cb) { return Number(cb.dataset.lapsiId); });
    const { error } = await db.from('kalenteri_tapahtumat').update({ kattaa_lapset: valitut.length ? valitut : null }).eq('id', rivi.id);
    if (ilmoitaKirjoitusvirheesta(error, 'Katettujen lasten tallennus')) return;
    rivi.kattaa_lapset = valitut.length ? valitut : null;
    document.getElementById('kattaa-lapset-overlay').style.display = 'none';
    naytaIlmoitus('Tallennettu');
    lataaKalenteri();
  };

  document.getElementById('kattaa-lapset-overlay').style.display = 'flex';
}
document.getElementById('kattaa-lapset-sulje').addEventListener('click', function() {
  document.getElementById('kattaa-lapset-overlay').style.display = 'none';
});

// Huolilippu tapahtuma-ankkuroituna (Ristiriitapaketti v2, sql/107) —
// valinnainen LISÄYS päivämäärä-ankkuroituun huoleen (ei sijasta, Katrin
// oma rajaus): pvm on silti aina mukana (huolienPaivanPaino() käyttää sitä
// riippumatta tapahtuma-ankkurista), kalenteri_tapahtuma_id on vain
// kontekstuaalinen "mihin tämä liittyy" -merkintä.
function avaaHuoliTapahtumaValikko(rivi) {
  document.getElementById('huoli-tapahtuma-overlay').style.display = 'flex';
  document.querySelectorAll('#huoli-tapahtuma-vakavuus-rivi .huoli-vakavuus-btn').forEach(function(btn) {
    btn.onclick = async function() {
      if (!currentUserId) return;
      const vakavuus = Number(btn.dataset.vakavuus);
      const { error } = await db.from('paivan_huolet').insert({
        owner_id: currentUserId,
        pvm: rivi.event_date,
        vakavuus: vakavuus,
        kalenteri_tapahtuma_id: rivi.id,
      });
      if (ilmoitaKirjoitusvirheesta(error, 'Huolilipun tallennus')) return;
      document.getElementById('huoli-tapahtuma-overlay').style.display = 'none';
      naytaIlmoitus('Huoli merkitty: ' + rivi.title);
    };
  });
}
document.getElementById('huoli-tapahtuma-sulje').addEventListener('click', function() {
  document.getElementById('huoli-tapahtuma-overlay').style.display = 'none';
});

// Onko annetun päivän 'full'-tason ristiriita jo kuitattu TÄSMÄLLEEN samalla
// tapahtumajoukolla? Kartta ladataan paivitaRistiriitaKuittaukset():lla.
let ristiriitaKuitatutAvaimet = new Set();
function onkoRistiriitaKuitattu(isoPvm, fullIds) {
  if (fullIds.length === 0) return false;
  return ristiriitaKuitatutAvaimet.has(isoPvm + '|' + ristiriitaAvain(fullIds));
}

async function paivitaRistiriitaKuittaukset() {
  const { data, error } = await db.from('kalenteri_ristiriita_kuittaukset').select('event_date, tapahtuma_avaimet');
  if (error) {
    console.error('Ristiriitakuittausten haku epäonnistui:', error);
    return;
  }
  ristiriitaKuitatutAvaimet = new Set((data || []).map(function(r) { return r.event_date + '|' + r.tapahtuma_avaimet; }));
}

// "Keskusteltu"-vahvistus (Ristiriitapaketti, 2026-07-17, ks. muistiinpanot.md
// "Ristiriitapaketti: Ristiriitalippu 'Keskustellaan'") — napautus ristiriita-
// merkistä avaa tämän. Näyttää kenen menot ovat päällekkäin (aika + henkilö +
// otsikko), tarjoaa "Keskusteltu ✓" -kuittauksen. Kuittaus EI POISTA mitään —
// vain lisää rivin kalenteri_ristiriita_kuittaukset-tauluun, merkki rauhoittuu
// (punainen → kulta "keskustellaan"-tyyli) kunnes päivälle ilmestyy UUSI,
// eri tapahtumajoukolla oleva 'full'-ristiriita (ks. ristiriitaAvain).
// Lyhyt viikonpäivä+pvm ("ke 22.7.") "Ehdota keskustelua" -murun valmiiksi
// täytettyyn sisältöön — eri muoto kuin KALENTERI_PAIVAT (kokonaiset nimet,
// otsikoihin) tai VIIKONPAIVA_LYHENTEET (isot kirjaimet, kuukausiruudukkoon).
const VIIKONPAIVA_LYHYT = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
function lyhytPvmTeksti(isoPvm) {
  const osat = isoPvm.split('-').map(Number);
  const d = new Date(osat[0], osat[1] - 1, osat[2]);
  return VIIKONPAIVA_LYHYT[d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.';
}

function avaaRistiriitaVahvistus(isoPvm, rivit, fullIds) {
  const fullIdSet = new Set(fullIds);
  const osalliset = rivit
    .filter(function(r) { return fullIdSet.has(r.id); })
    .sort(function(a, b) { return (a.event_time || '').localeCompare(b.event_time || ''); });
  // Muoto "Otsikko (omistaja) aika" (2026-07-17, Katrin OSA X -löydös) —
  // omistaja AINA näkyvissä (myös "(perhe)"), koska ristiriidan LUONNE (kuka
  // törmää keneen) ei ollut aiemmin pääteltävissä pelkästä listasta.
  const kuvaus = osalliset.map(function(r) {
    const aika = r.event_time ? r.event_time.slice(0, 5) : '';
    const omistaja = r._henkilo ? henkiloNimi(r._henkilo) : 'perhe';
    return r.title + ' (' + omistaja + ') ' + aika;
  }).join('\n');

  const jo = onkoRistiriitaKuitattu(isoPvm, fullIds);
  document.getElementById('ristiriita-body').textContent = kuvaus;
  const keskusteltuNappi = document.getElementById('ristiriita-keskusteltu-btn');
  keskusteltuNappi.style.display = jo ? 'none' : '';
  const ehdotaNappi = document.getElementById('ristiriita-ehdota-btn');
  ehdotaNappi.style.display = toinenKayttaja ? '' : 'none';
  document.getElementById('ristiriita-overlay').style.display = 'flex';

  keskusteltuNappi.onclick = async function() {
    const { error } = await db.from('kalenteri_ristiriita_kuittaukset').upsert(
      { event_date: isoPvm, tapahtuma_avaimet: ristiriitaAvain(fullIds), acked_by: currentUserId },
      { onConflict: 'event_date,tapahtuma_avaimet', ignoreDuplicates: true }
    );
    document.getElementById('ristiriita-overlay').style.display = 'none';
    if (error) {
      console.error('Ristiriidan kuittaus epäonnistui:', error);
      naytaIlmoitus('Kuittaus epäonnistui — yritä uudelleen');
      return;
    }
    await paivitaRistiriitaKuittaukset();
    lataaKalenteri();
  };

  // "Ehdota keskustelua" (2026-07-17, ks. muistiinpanot.md "Ristiriitapaketti")
  // — EI uusi viestikanava, sama 💬-ehdotusputki kuin Laiturin murujen
  // ehdottamisella (ks. "Ankkurin ehdottaminen toiselle"): luo ensin taustalla
  // muru Laituriin (ehdottajan oma "koti", ei koskaan tyhjän päällä), sitten
  // ankkuriehdokas vastaanottajalle valmiiksi täytetyllä sisällöllä. EI kuittaa
  // ristiriitaa (lippu pysyy punaisena — keskustelu ei ole vielä tapahtunut,
  // vasta "Keskusteltu ✓" merkitsee sen käydyksi).
  ehdotaNappi.onclick = async function() {
    if (!toinenKayttaja) return;
    const teksti = 'Katsotaan yhdessä ' + lyhytPvmTeksti(isoPvm) + ' — päällekkäin: ' + kuvaus.split('\n').join(' + ');
    const { data: muruData, error: muruError } = await db.from('laituri')
      .insert({ content: teksti, user_id: currentUserId, status: 'uusi' })
      .select().single();
    if (muruError) {
      console.error('Ehdotuksen murun luonti epäonnistui:', muruError);
      naytaIlmoitus('Ehdotus epäonnistui — yritä uudelleen');
      return;
    }
    const { error } = await db.from('ankkurit').insert({
      content: teksti,
      source: 'ehdotus',
      source_ref: String(muruData.id),
      user_id: toinenKayttaja.user_id,
      is_candidate: true,
      proposed_by: currentUserId,
      // Keskusteluehdotuksen erityissääntö (2026-07-17, ks. muistiinpanot.md
      // "💬-ehdotuksen elinkaari"): näiden kahden sarakkeen LÄSNÄOLO on
      // ainoa signaali joka erottaa tämän "keskustelulajiksi" tavallisesta
      // delegointiehdotuksesta — ei hylkäystä, vain Keskusteltu/Siirrä.
      ristiriita_pvm: isoPvm,
      ristiriita_avain: ristiriitaAvain(fullIds),
    });
    document.getElementById('ristiriita-overlay').style.display = 'none';
    if (error) {
      console.error('Keskustelun ehdotus epäonnistui:', error);
      naytaIlmoitus('Ehdotus epäonnistui — yritä uudelleen');
      return;
    }
    naytaIlmoitus('Ehdotettu ' + henkiloAllatiivi(toinenKayttaja.henkilo));
  };
}

// Luo yhtenäisen päivätason merkkipillerin (ks. muistiinpanot.md "Kalenterin
// merkkikieli") — savy on 'kuorma' | 'ristiriita' | 'ristiriita-huomio' |
// 'keskustellaan'. onClick on valinnainen (vain napautettavalle ristiriitaliputukselle).
function luoPaivaMerkki(savy, teksti, title, onClick) {
  const merkki = document.createElement('span');
  merkki.className = 'paiva-merkki paiva-merkki--' + savy;
  merkki.textContent = teksti;
  if (title) merkki.title = title;
  if (onClick) {
    merkki.style.cursor = 'pointer';
    merkki.addEventListener('click', onClick);
  }
  return merkki;
}

// BUGIKORJAUS (2026-07-17, "OSA X kohta 2 ei toimi" — ks. muistiinpanot.md):
// napautus TOIMI koodikatselmuksella (merkin oma click-kuuntelija oli oikein
// kiinnitetty), mutta hit-alue oli VAIN pienen pillerin pikselit — helppo
// hipaista ohi puhelimella, varsinkin viikkonäkymän pienemmällä fontilla.
// Ratkaisu: koko otsikkoEl (päivän teksti + kaikki merkit yhdessä) on nyt
// napautettava aina kun vakavuus on 'full', ei enää pelkkä pilleri itse —
// isompi, luotettavampi kosketusalue samalla koodilla. .onclick (ei
// addEventListener) nollataan JOKA piirrolla ettei vanhoja kuuntelijoita jää
// kertymään samaan, uudelleenkäytettyyn otsikkoEl-elementtiin (esim.
// #kalenteri-otsikko pysyy samana DOM-solmuna päivästä toiseen).
// henkselitSinaPaivana (2026-08-05, ks. muistiinpanot.md "Henkselit") on
// VALINNAINEN — kutsujat jotka eivät (vielä) hae henkseleitä toimivat
// ennallaan (oletus tyhjä lista, henkselitAiheuttaaRistiriidan palauttaa
// silloin aina false). Vain 'full' JA 'ei-kuitattu'-tilassa NÄYTETÄÄN
// henkselit-merkki OMANA ⚠️:na jos tapahtumapohjaista full-ristiriitaa ei jo
// ole (muuten kaksi ⚠️-merkkiä samassa otsikossa olisi kohinaa) — sama
// "kaksi eri, rinnakkaista mekanismia" -periaate kuin paivanRistiriitaTila:ssa.
function paivitaPaivanOtsikko(otsikkoEl, teksti, rivit, isoPvm, kuormaraja, henkselitSinaPaivana) {
  otsikkoEl.textContent = teksti;
  otsikkoEl.onclick = null;
  otsikkoEl.style.cursor = '';
  const analyysi = analysoiPaivanRistiriidat(rivit, isoPvm);
  if (analyysi.vakavuus === 'full') {
    const kuitattu = onkoRistiriitaKuitattu(isoPvm, analyysi.fullIds);
    // Ristiriitamerkki (2026-08-05, Katrin päätös 4b): ⚠️-symboli korvaa
    // vanhan tekstipillerin ("päällekkäin") SAMASSA piirtopaikassa —
    // pelkkä pilleri→symboli-vaihto, EI per-rivi-piirtologiikkaa. Kuitattu-
    // tila ("keskusteltu ✓") pysyy tekstinä ennallaan — eri viesti (ratkaistu
    // vs. tarvitsee huomiota), ei sama glyfi.
    otsikkoEl.appendChild(kuitattu
      ? luoPaivaMerkki('keskustellaan', 'keskusteltu ✓', 'Keskusteltu — napauta nähdäksesi kenen menot')
      : luoPaivaMerkki('ristiriita-symboli', '⚠️', 'Kaksi eri henkilön (tai saman syötteen) menoa menee päällekkäin — napauta'));
    otsikkoEl.style.cursor = 'pointer';
    otsikkoEl.onclick = function(e) {
      e.stopPropagation();
      avaaRistiriitaVahvistus(isoPvm, rivit, analyysi.fullIds);
    };
  } else if (analyysi.vakavuus === 'attention') {
    otsikkoEl.appendChild(luoPaivaMerkki('ristiriita-huomio', 'huomaa', 'Kevyt päällekkäisyys tänä päivänä — ei vaadi toimenpidettä'));
  } else if (henkselitAiheuttaaRistiriidan(henkselitSinaPaivana || [], rivit, isoPvm)) {
    otsikkoEl.appendChild(luoPaivaMerkki('ristiriita-symboli', '⚠️', 'Molemmat vanhemmat henkselöity samaan aikaan — lapsi voi jäädä ilman valvontaa', function(e) {
      e.stopPropagation();
      naytaIlmoitus('Molemmat vanhemmat ovat henkselöity samaan aikaan tänä päivänä, eikä kaikkia valvontaa tarvitsevia lapsia ole katettu millään tapahtumalla.');
    }));
  }
  const maara = laskeMenoja(rivit);
  if (maara >= kuormaraja) {
    otsikkoEl.appendChild(luoPaivaMerkki('kuorma', maara + ' menoa', maara + ' kellonaikamenoa tänä päivänä'));
  }
}

function paivamaaraISO(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Sama aikaleimanäyttö (pv.kk.vvvv tt:mm) Varaston kolmelle listatyypille
// (Muistikirja, Teema, Vahdittu) — KONSEPTIKIRJA.md 4.12.
function muotoileAikaleima(isoString) {
  const d = new Date(isoString);
  return d.getDate().toString().padStart(2, '0') + '.' +
         (d.getMonth() + 1).toString().padStart(2, '0') + '.' +
         d.getFullYear() + ' ' +
         d.getHours().toString().padStart(2, '0') + ':' +
         d.getMinutes().toString().padStart(2, '0');
}

// Kuinka pitkälle taaksepäin haetaan tapahtumia, jotta ennen näkyvää
// aikaväliä alkanut monipäiväinen tapahtuma (esim. viikon lomajakso) näkyy
// silti oikein joka päivänä jonka se kattaa, vaikka sen event_date olisi
// ennen näkyvän välin alkua. Reilusti mitoitettu, ei tarkkuutta vaativa.
const MONIPAIVAINEN_PUSKURI_PV = 60;

// Kattaako tapahtuma t annetun ISO-päivän (event_date...event_end_date,
// molemmat päät mukaan lukien)? event_end_date NULL = sama kuin event_date
// eli tavallinen yksipäiväinen tapahtuma. ISO-päivämäärät (VVVV-KK-PP)
// vertautuvat oikein merkkijonoina.
function tapahtumaKattaaPaivan(t, isoPaiva) {
  const loppu = t.event_end_date || t.event_date;
  return isoPaiva >= t.event_date && isoPaiva <= loppu;
}

function onkoMonipaivainen(t) {
  return !!t.event_end_date && t.event_end_date !== t.event_date;
}

// === HENKSELIT-HALLINTA UI (2026-08-05, ks. muistiinpanot.md "Henkselit",
// sql/109) === Asetukset-näkymän "🎗️ Henkselit" -osiosta hallittu per-
// vanhempi "olen poissa laskuista" -aikaikkuna. VAIN luonti/muokkaus/poisto
// — EI mitään kalenterinäkymän puolella (speksin tietoinen rajaus, harvoin
// tarvittava). Merkitsijä on AINA kirjautunut itse (omaHenkilo) — lomakkeella
// ei ole henkilövalitsinta. Kalenterivisualisointi (värit, tasoylivetopalkki)
// ja ristiriita-/Hytti-kytkennät ovat OMISSA osioissaan alempana, tämä on
// pelkkä CRUD.
let currentHenkselitEdit = null; // muokattavan rivin id, tai null = uusi

function nollaaHenkselitLomake() {
  currentHenkselitEdit = null;
  document.getElementById('henkselit-pvm-input').value = paivamaaraISO(new Date());
  document.getElementById('henkselit-alku-input').value = '07:00';
  document.getElementById('henkselit-loppu-input').value = '00:00';
  document.getElementById('henkselit-tallenna-btn').textContent = 'Merkitse henkselit';
  document.getElementById('henkselit-peruuta-btn').style.display = 'none';
}

// "24:00" ihmiselle selkeämpi kuin "seuraavan päivän 00:00" kun kyse on
// "koko illan/yön" -merkinnästä (ks. nollaaHenkselitLomake:n oletusloppu).
function muotoileHenkselitAikavali(alkuISO, loppuISO) {
  const alku = new Date(alkuISO);
  const loppu = new Date(loppuISO);
  const klo = function(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const pvm = function(d) { return d.getDate() + '.' + (d.getMonth() + 1) + '.'; };
  let teksti = pvm(alku) + ' ' + klo(alku) + '–';
  if (paivamaaraISO(alku) !== paivamaaraISO(loppu)) teksti += pvm(loppu) + ' ';
  const loppuKeskiyolla = loppu.getHours() === 0 && loppu.getMinutes() === 0;
  teksti += loppuKeskiyolla ? '24:00' : klo(loppu);
  return teksti;
}

async function lataaHenkselit() {
  const { data, error } = await db.from('henkselit').select().order('alkaa');
  if (error) {
    console.error('Henkseleiden haku epäonnistui:', error);
    return;
  }
  const rivit = data || [];
  const listEl = document.getElementById('henkselit-lista');
  listEl.innerHTML = '';
  rivit.forEach(function(rivi) {
    const li = document.createElement('li');
    li.addEventListener('click', function() { avaaHenkselitMuokkaus(rivi); });

    const teksti = document.createElement('span');
    teksti.textContent = henkiloNimi(rivi.henkilo) + ': ' + muotoileHenkselitAikavali(rivi.alkaa, rivi.paattyy);
    li.appendChild(teksti);

    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function(e) {
      e.stopPropagation();
      const vahvistus = await naytaVahvistus('Poistetaanko henkselit?', henkiloNimi(rivi.henkilo) + ': ' + muotoileHenkselitAikavali(rivi.alkaa, rivi.paattyy), 'Poista');
      if (!vahvistus) return;
      const { error: poistoError } = await db.from('henkselit').delete().eq('id', rivi.id);
      if (ilmoitaKirjoitusvirheesta(poistoError, 'Henkseleiden poisto')) return;
      if (currentHenkselitEdit === rivi.id) nollaaHenkselitLomake();
      lataaHenkselit();
    });
    li.appendChild(poisto);

    listEl.appendChild(li);
  });
}

// Vain oman henkilon rivin voi avata muokkaukseen — muutoin tallennus
// (joka aina kirjoittaa henkilo=omaHenkilo) siirtäisi rivin hiljaa toisen
// nimiin. Poisto (yllä) pysyy sallittuna kummankin riville, kuten muukin
// tämän sovelluksen jaettu perheen data (ei owner_id-rajausta).
function avaaHenkselitMuokkaus(rivi) {
  if (rivi.henkilo !== omaHenkilo) {
    naytaIlmoitus(henkiloNimi(rivi.henkilo) + ' oman henkselin voi muokata vain hän itse — poistaa voi kyllä.');
    return;
  }
  currentHenkselitEdit = rivi.id;
  const alku = new Date(rivi.alkaa);
  const loppu = new Date(rivi.paattyy);
  document.getElementById('henkselit-pvm-input').value = paivamaaraISO(alku);
  document.getElementById('henkselit-alku-input').value = String(alku.getHours()).padStart(2, '0') + ':' + String(alku.getMinutes()).padStart(2, '0');
  document.getElementById('henkselit-loppu-input').value = String(loppu.getHours()).padStart(2, '0') + ':' + String(loppu.getMinutes()).padStart(2, '0');
  document.getElementById('henkselit-tallenna-btn').textContent = 'Tallenna muutos';
  document.getElementById('henkselit-peruuta-btn').style.display = 'block';
}

document.getElementById('henkselit-peruuta-btn').addEventListener('click', nollaaHenkselitLomake);

document.getElementById('henkselit-tallenna-btn').addEventListener('click', async function() {
  if (!omaHenkilo) {
    naytaIlmoitus('Omaa henkilöä ei tunnistettu (hytti_omistajat) — henkseleitä ei voi merkitä.');
    return;
  }
  const pvmStr = document.getElementById('henkselit-pvm-input').value;
  const alkuStr = document.getElementById('henkselit-alku-input').value;
  const loppuStr = document.getElementById('henkselit-loppu-input').value;
  if (!pvmStr || !alkuStr || !loppuStr) { naytaIlmoitus('Täytä päivä, alku ja loppu.'); return; }

  const alku = new Date(pvmStr + 'T' + alkuStr + ':00');
  // Ei erillistä "koko päivä" vs. "aikaikkuna" -valintaa (ks. speksi) — sama
  // rulla kattaa molemmat YHDELLÄ säännöllä: jos loppu <= alku kellonajan
  // mukaan, loppu tulkitaan SEURAAVAN päivän kellonajaksi (oletus 00:00 =
  // puoleenyöhön asti = "koko tämän päivän loppuun").
  const loppu = new Date(pvmStr + 'T' + loppuStr + ':00');
  if (loppu <= alku) loppu.setDate(loppu.getDate() + 1);

  const rivi = { henkilo: omaHenkilo, alkaa: alku.toISOString(), paattyy: loppu.toISOString() };
  const kysely = currentHenkselitEdit
    ? db.from('henkselit').update(rivi).eq('id', currentHenkselitEdit)
    : db.from('henkselit').insert(rivi);
  const { error } = await kysely;
  if (ilmoitaKirjoitusvirheesta(error, 'Henkseleiden tallennus')) return;
  nollaaHenkselitLomake();
  lataaHenkselit();
});

// Henkselit-Hytti-kytkentä (ks. speksi "voi sallia/muokata tämän per
// käyttäjä"): PER HENKILÖ, ei per laite — DB-asetus samalla avain-arvo-
// taululla kuin muutkin (asetukset), avain NAMESPACED henkilon mukaan koska
// taulu on perheen yhteinen, ei per-käyttäjä-rivitetty. Oletus PÄÄLLÄ
// (estää) — turvallisin oletus on "henkselit tarkoittaa oikeasti poissa",
// ei hiljaa jatkaa ehdottamista. Käytetään laskeOpintoPaivanAskeleet():ssä.
function henkselitEstaaHyttinAsetusAvain(henkilo) {
  return 'henkselit_esta_hytti_' + henkilo;
}
function henkselitEstaaHytin(henkilo) {
  return haeAsetusTeksti(henkselitEstaaHyttinAsetusAvain(henkilo), 'true') !== 'false';
}

// Onko OMA (kirjautuneen) henkselit voimassa juuri nyt? Käytössä
// laskeOpintoPaivanAskeleet():n (Hytin kolmen voiman moottori) ja
// lataaAnkkurit():n (Hytti-scopen ankkurit) esto-tarkistuksissa. Erillinen
// pieni kysely eikä osa fetchVisibleHenkselit-kalenterihakua — nämä kaksi
// kutsupaikkaa eivät muuten koskaan lataa kalenterin henkselit-dataa, ja
// tämä on huomattavasti halvempi kuin koko kalenterinäkymän datapolku.
async function onkoOmaHenkselitAktiivinenNyt() {
  if (!omaHenkilo) return false;
  const nytIso = new Date().toISOString();
  const { data, error } = await db.from('henkselit').select('id')
    .eq('henkilo', omaHenkilo)
    .lte('alkaa', nytIso)
    .gte('paattyy', nytIso)
    .limit(1);
  if (error) {
    console.error('Henkseleiden tarkistus (Hytti-esto) epäonnistui:', error);
    return false;
  }
  return (data || []).length > 0;
}
document.getElementById('henkselit-esta-hytti-toggle').addEventListener('change', async function(e) {
  if (!omaHenkilo) return;
  const { error } = await db.from('asetukset').upsert(
    { key: henkselitEstaaHyttinAsetusAvain(omaHenkilo), value: String(e.target.checked) },
    { onConflict: 'key' }
  );
  if (ilmoitaKirjoitusvirheesta(error, 'Henkselit-Hytti-asetuksen tallennus')) return;
  await paivitaAsetukset();
});

// PACER-kehote-kytkin (2026-08-05, ks. HYTTI_SPEKSI §8 — "tämä kehote-
// mekanismi, EI koko PACER-ohjaus, pitää voida kytkeä pois asetuksista").
document.getElementById('pacer-kehote-toggle').addEventListener('change', async function(e) {
  const { error } = await db.from('asetukset').upsert(
    { key: 'pacer_kehote_paalla', value: String(e.target.checked) },
    { onConflict: 'key' }
  );
  if (ilmoitaKirjoitusvirheesta(error, 'PACER-kehotteen asetuksen tallennus')) return;
  await paivitaAsetukset();
});

// === KALENTERIN OMISTAJAVÄRIT (2026-08-05, Kalenteri UI -uudistus) ===
// Kiinteä 4-värinen paletti henkilön mukaan, käytössä kuukausi- ja
// viikkonäkymän palkeissa. EI koske päivänäkymää (piirraKalenteriRivi),
// joka näyttää edelleen syötteen omaa _vari-kenttää koskemattomana — tämä
// on tietoinen rajaus, ei unohdus (ks. Kalenteri UI -speksi "Ei muuteta").
// 'lapset' ei ole tällä hetkellä saavutettavissa mistään oikeasta syötteestä
// (henkilo-sarakkeen check-constraint sallii vain katri/juha/null) — varattu
// tulevaa lapsikohtaista kalenterisyötettä varten.
// Päivitetty 2026-08-17 (Katrin kalenterivärit-päätös, ks. style.css
// --kal-katri/--kal-juha/--kal-yhteinen) — samat arvot molemmissa
// paikoissa (ei luettu CSS-muuttujasta koska EVENT_OWNER_COLORS oli jo
// suora hex-objekti tätä ennenkin, ei muutettu rakennetta).
const EVENT_OWNER_COLORS = { katri: '#D32F2F', juha: '#1976D2', molemmat: '#8E44AD', lapset: '#6b6660' };
function resolveEventOwnerColor(tapahtuma) {
  if (tapahtuma._henkilo === 'katri') return EVENT_OWNER_COLORS.katri;
  if (tapahtuma._henkilo === 'juha') return EVENT_OWNER_COLORS.juha;
  if (tapahtuma._henkilo === 'lapset') return EVENT_OWNER_COLORS.lapset;
  return EVENT_OWNER_COLORS.molemmat;
}
// K/J/Y/L — Y = "Yhteinen" (jaettu/perhe, ei henkilo-tietoa).
function resolveEventOwnerLetter(tapahtuma) {
  if (tapahtuma._henkilo === 'katri') return 'K';
  if (tapahtuma._henkilo === 'juha') return 'J';
  if (tapahtuma._henkilo === 'lapset') return 'L';
  return 'Y';
}

// Muuntaa kellonajan ("HH:MM" tai "HH:MM:SS") prosenttiosuudeksi 07:00–23:00
// -aikajanasta (0-100, päihin leikattuna) — sama akseli kuukausipalkeissa
// JA viikon aikajananäkymässä (ks. Kalenteri UI -speksi).
const KALENTERI_AIKAJANA_ALKU_MIN = 7 * 60;
const KALENTERI_AIKAJANA_PITUUS_MIN = 16 * 60;
function minutesToPercent(min) {
  return Math.max(0, Math.min(100, (min - KALENTERI_AIKAJANA_ALKU_MIN) / KALENTERI_AIKAJANA_PITUUS_MIN * 100));
}
function timeToPercent(hhmm) {
  return minutesToPercent(aikaMinuutteina(hhmm));
}

// === HENKSELIT — HAKU JA ASETTELU KALENTERINÄKYMÄÄN (2026-08-05, ks.
// muistiinpanot.md "Henkselit") === CRUD-puoli asuu HENKSELIT-HALLINTA UI
// -osiossa yllä; tämä osio on pelkkää lukua/asettelua kalenterin kolmelle
// näkymälle (kuukausi/viikko/päivä) JA ristiriitalogiikalle (ks. alempana
// henkselitPaallekkaisyys).
function henkselitVari(henkilo) {
  return henkilo === 'juha' ? 'henkselit-juha' : 'henkselit-katri';
}

// Hakee kaikki henkselit-rivit jotka MENEVÄT PÄÄLLEKKÄIN annetun ISO-
// päivävälin kanssa (sama "hae vähän liikaa, rajaa asiakaspuolella" -periaate
// kuin kalenterin muissakin hauissa, ks. tapahtumaKattaaPaivan).
async function fetchVisibleHenkselit(rangeAlkuIso, rangeLoppuIso) {
  const alkuRaja = new Date(rangeAlkuIso + 'T00:00:00');
  const loppuRaja = new Date(rangeLoppuIso + 'T23:59:59');
  const { data, error } = await db.from('henkselit').select()
    .lte('alkaa', loppuRaja.toISOString())
    .gte('paattyy', alkuRaja.toISOString());
  if (error) {
    console.error('Henkseleiden haku kalenterinäkymään epäonnistui:', error);
    return [];
  }
  return data || [];
}

// Henkselit-rivin osuma annetulle ISO-päivälle minuutteina keskiyöstä
// (0-1440), leikattu päivän rajoihin. null jos rivi ei osu tälle päivälle
// lainkaan (fetchVisibleHenkselit hakee koko näkyvän välin, joten yksittäistä
// päivää kohti pitää vielä suodattaa/leikata erikseen, sama kaksivaiheinen
// malli kuin tapahtumaKattaaPaivan+event_end_date-parilla).
function henkselitPaivaosuus(rivi, iso) {
  const paivanAlku = new Date(iso + 'T00:00:00');
  const alkuMin = (new Date(rivi.alkaa) - paivanAlku) / 60000;
  const loppuMin = (new Date(rivi.paattyy) - paivanAlku) / 60000;
  if (loppuMin <= 0 || alkuMin >= 1440) return null;
  return { alkuMin: Math.max(0, alkuMin), loppuMin: Math.min(1440, loppuMin) };
}

function henkselitKattaaKokoPaivan(osuus) {
  return osuus.alkuMin <= 0 && osuus.loppuMin >= 1440;
}

// Päivänäkymä on tietoisesti muuten koskematon (lista, täydet nimet/kellon-
// ajat, ks. Kalenteri UI -speksi) — Henkselit on ainoa lisäys sinne, JA se on
// tietoisesti VAIN bannereita, ei mitään taustavärikerrosta (päivänäkymässä
// ei ole aikajanaa jota taustalla voisi kellonajallisesti rajata). Piirretään
// listan YLÄPUOLELLE (kutsutaan ennen piirraKalenteriPaivaRyhma:aa).
function piirraHenkselitBanneri(sisalto, henkselitLista, iso) {
  henkselitLista
    .filter(function(rivi) { return henkselitPaivaosuus(rivi, iso) !== null; })
    .forEach(function(rivi) {
      const banneri = document.createElement('div');
      banneri.className = 'henkselit-banneri ' + henkselitVari(rivi.henkilo);
      banneri.textContent = '🎗️ ' + henkiloNimi(rivi.henkilo) + ' henkselöity ' + muotoileHenkselitAikavali(rivi.alkaa, rivi.paattyy);
      sisalto.appendChild(banneri);
    });
}

// Laskee yhden tapahtuman palkin sijainnin annettuna päivänä (iso) — jaettu
// kuukausi- ja viikkonäkymän kokopäivä/yön yli -rivin kesken, ks. Kalenteri
// UI -speksi kohta "Yön yli / koko päivä -tapahtumat". Palauttaa
// {left, right, reunaLuokka} — right on merkkijono ('0' tai undefined),
// jättäen kutsujan päättää käyttääkö left+width vai left+right -paria.
function computeEventBarLayout(tapahtuma, iso) {
  if (onkoMonipaivainen(tapahtuma)) {
    const loppuPvm = tapahtuma.event_end_date || tapahtuma.event_date;
    if (iso === tapahtuma.event_date) {
      const left = tapahtuma.event_time ? timeToPercent(tapahtuma.event_time) : 0;
      return { left: left, right: 0, reunaLuokka: 'kalenteri-palkki--lahto' };
    }
    if (iso === loppuPvm) {
      const oikeaReuna = tapahtuma.event_end_time ? (100 - timeToPercent(tapahtuma.event_end_time)) : 0;
      return { left: 0, right: oikeaReuna, reunaLuokka: 'kalenteri-palkki--tulo' };
    }
    return { left: 0, right: 0, reunaLuokka: 'kalenteri-palkki--keski' };
  }
  if (!tapahtuma.event_time) {
    return { left: 0, right: 0, reunaLuokka: '' };
  }
  const left = timeToPercent(tapahtuma.event_time);
  const kestoMin = tapahtuma.event_end_time
    ? Math.max(aikaMinuutteina(tapahtuma.event_end_time) - aikaMinuutteina(tapahtuma.event_time), 0)
    : 0;
  const width = Math.max(kestoMin / KALENTERI_AIKAJANA_PITUUS_MIN * 100, 10);
  return { left: left, width: width, reunaLuokka: '' };
}

// Kuukausi/viikkonäkymän taustaväri JA huolilippumerkki (2026-08-05, ks.
// Kalenteri UI -speksi "Päivän kuorma taustavärinä" ja "Merkit") — SAMA
// Kuormavahti-kynnyslogiikka kuin opintoPaivanKuorma():ssa
// (deriveDayLoadLevel, computeConcernWeightForDate), mutta laskettuna
// KAIKILLE näkyville päiville kerralla YHDELLÄ huolikyselyllä sen sijaan
// että joka päiväruutu tekisi oman DB-kyselynsä. tapahtumat = jo haettu
// data (lataaKalenteri), ei uutta kalenteri_tapahtumat-kyselyä tarvita —
// ajallisten määrä lasketaan paikallisesti. huoliIsot on erillinen
// TARKKA (ei painotettu) joukko päivistä joilla on vähintään yksi
// huolilippu-rivi — kuormataso saa nostaa itseään huolen painosta, mutta
// itse 🟠-merkki on kyllä/ei sen mukaan onko juuri tälle päivälle lippu.
async function computeVisibleDaySignals(tapahtumat, isoPaivat) {
  const { data: huolet, error } = await db.from('paivan_huolet').select('pvm, vakavuus');
  if (error) console.error('Huolilippujen haku kalenterin taustaväriä/merkkejä varten epäonnistui:', error);

  const ajallistenMaaratPaivittain = new Map();
  tapahtumat.forEach(function(t) {
    if (!t.event_time) return;
    ajallistenMaaratPaivittain.set(t.event_date, (ajallistenMaaratPaivittain.get(t.event_date) || 0) + 1);
  });

  const huoliIsot = new Set((huolet || []).map(function(h) { return h.pvm; }));
  const kuormaTasot = new Map();
  isoPaivat.forEach(function(iso) {
    const huoliPaino = computeConcernWeightForDate(iso, huolet || []);
    kuormaTasot.set(iso, deriveDayLoadLevel(ajallistenMaaratPaivittain.get(iso) || 0, huoliPaino));
  });
  return { kuormaTasot: kuormaTasot, huoliIsot: huoliIsot };
}

function dayLoadCssClass(taso) {
  if (taso === 'raskas') return 'pv-kuorma-raskas';
  if (taso === 'keski') return 'pv-kuorma-keski';
  return '';
}

function viikonAlku(d) {
  const kopio = new Date(d);
  const paiva = kopio.getDay();
  const siirtyma = paiva === 0 ? -6 : 1 - paiva;
  kopio.setDate(kopio.getDate() + siirtyma);
  return kopio;
}

function siirraKalenteria(suunta) {
  if (kalenteriTila === 'paiva') {
    kalenteriPvm.setDate(kalenteriPvm.getDate() + suunta);
  } else if (kalenteriTila === 'viikko') {
    kalenteriPvm.setDate(kalenteriPvm.getDate() + suunta * 7);
  } else {
    kalenteriPvm.setMonth(kalenteriPvm.getMonth() + suunta);
  }
  lataaKalenteri();
}

// Piirtää yhden päivän tapahtumat, valinnaisella päiväotsikolla (viikko/kuukausinäkymä)
// Piirtää yhden rivin: joko oikea kalenteritapahtuma tai tämän päivän
// näkymään yhdistetty aktiivinen ankkuri (ks. rivi._tyyppi)
function piirraKalenteriRivi(rivi) {
  const li = document.createElement('li');

  // Oma Hytin tänään erääntyvä tehtävä, sulautettu tänään-agendaan (ks.
  // hyttiNakyyKalenterissa() -asetuskytkin). Sama tietue kuin kortilla —
  // täppäys tässä täppää sen myös kortin sisällä, ei kopiota.
  if (rivi._tyyppi === 'hytti') {
    const checkNappi = document.createElement('button');
    checkNappi.textContent = '○';
    checkNappi.className = 'check-btn';
    checkNappi.addEventListener('click', async function() {
      tuntopalauteValmis();
      const { error } = await db.from('hytti_rivit').update({ done: true, done_at: new Date().toISOString() }).eq('id', rivi.id);
      if (ilmoitaKirjoitusvirheesta(error, 'Hytti-tehtävän merkintä')) { lataaKalenteri(); return; }
      siivoaMuistutuksetKumottavasti('hytti_rivi', rivi.id);
      lataaKalenteri();
    });
    li.appendChild(checkNappi);

    const teksti = document.createElement('span');
    teksti.textContent = rivi.title;
    li.appendChild(teksti);

    const ankkurointiNappi = document.createElement('button');
    ankkurointiNappi.innerHTML = ANKKURI_SVG;
    ankkurointiNappi.className = 'anchor-btn' + (ankkuroidutAvaimet.has('hytti:' + rivi.id) ? ' active' : '');
    ankkurointiNappi.addEventListener('click', async function() {
      await vaihdaAnkkurointiYleinen('hytti', rivi.id, rivi.title, function() {});
      lataaKalenteri();
    });
    li.appendChild(ankkurointiNappi);
    return li;
  }

  if (rivi._tyyppi === 'ankkuri') {
    const checkNappi = document.createElement('button');
    checkNappi.textContent = '○';
    checkNappi.className = 'check-btn';
    checkNappi.addEventListener('click', async function() {
      tuntopalauteValmis();
      const { error } = await db.from('ankkurit').update({ done: true, done_at: new Date().toISOString() }).eq('id', rivi._ankkuriId);
      if (ilmoitaKirjoitusvirheesta(error, 'Ankkurin merkintä')) { lataaKalenteri(); return; }
      siivoaMuistutuksetKumottavasti('ankkuri', rivi._ankkuriId);
      lataaKalenteri();
    });
    li.appendChild(checkNappi);

    const aika = document.createElement('span');
    aika.className = 'kalenteri-aika';
    aika.textContent = rivi.event_time ? rivi.event_time.slice(0, 5) : '';
    li.appendChild(aika);

    const teksti = document.createElement('span');
    teksti.textContent = rivi.title;
    li.appendChild(teksti);

    const irrotaNappi = document.createElement('button');
    irrotaNappi.innerHTML = ANKKURI_SVG;
    irrotaNappi.className = 'anchor-btn active';
    irrotaNappi.addEventListener('click', async function() {
      await vaihdaAnkkurointiYleinen(rivi._source, rivi._sourceRef, rivi.title, function() {});
      lataaKalenteri();
    });
    li.appendChild(irrotaNappi);
    return li;
  }

  // Hytti-scopen (oma opiskelu/työ) tapahtuma saa toissijaisen ilmeen
  // pääkalenterissa — MUODOLLA (reunapalkki + pieni glyyfi), ei himmeydellä,
  // samaa periaatetta noudattaen kuin ✨-ehdokkaan erottuvuuskorjaus (ks.
  // "Väsynyt käyttäjä ohikulkevalla vilkaisulla" -design-periaate).
  if (rivi._scope === 'hytti') li.classList.add('kalenteri-rivi-hytti');

  const aika = document.createElement('span');
  aika.className = 'kalenteri-aika';
  aika.textContent = rivi.event_time ? rivi.event_time.slice(0, 5) : '';
  li.appendChild(aika);

  if (rivi._scope === 'hytti') {
    const glyyfi = document.createElement('span');
    glyyfi.className = 'kalenteri-hytti-glyyfi';
    glyyfi.textContent = '🚪';
    glyyfi.title = (rivi._henkilo ? rivi._henkilo.charAt(0).toUpperCase() + rivi._henkilo.slice(1) + ': ' : '') + 'opiskelu/työ (hytti)';
    li.appendChild(glyyfi);
  } else if (rivi._vari) {
    const vari = document.createElement('span');
    vari.className = 'kalenteri-vari';
    vari.style.backgroundColor = rivi._vari;
    li.appendChild(vari);
  }

  // Omistajamerkki (2026-07-17, ks. muistiinpanot.md "Ristiriitapaketti" —
  // Katrin OSA X -löydös): väripiste (yllä) kertoo FEEDIN, ei KENEN meno on —
  // käyttäjä ei voinut ennustaa ristiriitalogiikkaa ilman tätä. Kirjain EI
  // luota pelkkään väriin ("muoto kertoo tilan, ei väri yksin") — P=perhe
  // (ei henkilo-tietoa, jaettu/käsin lisätty), muuten henkilön alkukirjain.
  const omistaja = document.createElement('span');
  omistaja.className = 'kalenteri-omistaja';
  omistaja.textContent = rivi._henkilo ? rivi._henkilo.charAt(0).toUpperCase() : 'P';
  omistaja.title = rivi._henkilo ? henkiloNimi(rivi._henkilo) : 'Perhe (kaikille yhteinen)';
  li.appendChild(omistaja);

  li.dataset.tuoteId = rivi.id;

  const teksti = document.createElement('span');
  teksti.textContent = rivi.title;
  li.appendChild(teksti);

  // "Yksi totuus, kaksi ikkunaa": tapahtuma näkyy AINA agendassa, mutta jos
  // sen on tuonut toinen käyttäjä (tai tekijää ei tunnistettu) eikä minä ole
  // vielä kuitannut, pieni merkki muistuttaa siitä — napautus kuittaa suoraan
  // agendasta, ei pakota kuittausjono-overlayn kautta kulkemaan.
  if (onkoUusiMinulle(rivi)) {
    const uusiMerkki = document.createElement('span');
    uusiMerkki.className = 'kalenteri-uusi-merkki';
    uusiMerkki.textContent = 'uusi';
    uusiMerkki.title = 'Kuittaa nähdyksi';
    uusiMerkki.addEventListener('click', async function() {
      await kuittaa(rivi.ical_uid);
      lataaKalenteri();
      paivitaKuittausTila();
    });
    li.appendChild(uusiMerkki);
  }

  const muistutusAika = reminderTimeBadge('kalenteri', rivi.id);
  if (muistutusAika) li.appendChild(muistutusAika);

  const ankkurointiNappi = document.createElement('button');
  ankkurointiNappi.innerHTML = ANKKURI_SVG;
  ankkurointiNappi.className = 'anchor-btn' + (ankkuroidutAvaimet.has('kalenteri:' + rivi.id) ? ' active' : '');
  ankkurointiNappi.addEventListener('click', async function() {
    await vaihdaAnkkurointiYleinen('kalenteri', rivi.id, rivi.title, function() {});
    lataaKalenteri();
  });
  li.appendChild(ankkurointiNappi);

  // Harvemmin tarvitut toiminnot yhden hiljaisen "⋯"-napin taakse (ks.
  // "Rivien UI-remontti" muistiinpanot.md:ssä) — vapauttaa tilaa tapahtuman
  // nimelle samalla periaatteella kuin Muistilaput/Kauppalista.
  // Synkatulla rivillä (ical_uid asetettu) EI näytetä poistoa lainkaan:
  // "yksi totuus, kaksi ikkunaa" -periaatteen mukaan poisto kuuluu tehdä
  // iPhonen Kalenterissa, ja peilisääntö (siivoaPoistetut, api/_lib/caldav-sync.js)
  // poistaa rivin täältä automaattisesti seuraavassa synkassa. Ilman tätä
  // rajausta poisto näytti poistavan tapahtuman "kokonaan", vaikka se vain
  // katosi Satamasta hetkeksi ja synkka olisi tuonut sen takaisin.
  const menuItems = [
    { label: '⏰ Muistutus', onClick: function() { avaaMuistutusPaneeli('kalenteri', rivi.id, rivi.title, rivi.event_date, rivi.event_time, lataaKalenteri); } },
    { label: '👶 Ketkä lapset katettu', onClick: function() { avaaKattaaLapsetValikko(rivi); } },
    { label: '🚩 Merkitse huoli tähän', onClick: function() { avaaHuoliTapahtumaValikko(rivi); } },
  ];
  if (!rivi.ical_uid) {
    menuItems.push({
      label: 'Poista',
      danger: true,
      onClick: async function() {
        const vahvistus = await naytaVahvistus('Poistetaanko ' + rivi.title + '?', null, 'Poista');
        if (!vahvistus) return;
        const { error } = await db.from('kalenteri_tapahtumat').delete().eq('id', rivi.id);
        if (ilmoitaKirjoitusvirheesta(error, 'Tapahtuman poisto')) { lataaKalenteri(); return; }
        siivoaMuistutuksetKumottavasti('kalenteri', rivi.id);
        lataaKalenteri();
      },
    });
  }
  li.appendChild(createOverflowButton(li, menuItems));

  return li;
}

function piirraKalenteriPaivaRyhma(container, rivit, otsikkoTeksti, kuormaraja, isoPvm) {
  const ryhma = document.createElement('div');
  ryhma.className = 'kalenteri-paiva-ryhma';

  if (otsikkoTeksti) {
    const otsikko = document.createElement('div');
    otsikko.className = 'kalenteri-paiva-otsikko';
    paivitaPaivanOtsikko(otsikko, otsikkoTeksti, rivit, isoPvm, kuormaraja || Infinity);
    ryhma.appendChild(otsikko);
  }

  if (rivit.length === 0) {
    const tyhja = document.createElement('p');
    tyhja.className = 'kalenteri-tyhja';
    tyhja.textContent = 'Ei tapahtumia.';
    ryhma.appendChild(tyhja);
    container.appendChild(ryhma);
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'list';
  rivit.forEach(function(rivi) { ul.appendChild(piirraKalenteriRivi(rivi)); });
  ryhma.appendChild(ul);
  container.appendChild(ryhma);
}

function jarjestaAjanMukaan(rivit) {
  rivit.sort(function(a, b) {
    if (!a.event_time && !b.event_time) return 0;
    if (!a.event_time) return 1;
    if (!b.event_time) return -1;
    return a.event_time.localeCompare(b.event_time);
  });
  return rivit;
}

async function lataaKalenteri() {
  let alku, loppu, otsikko;

  if (kalenteriTila === 'paiva') {
    alku = new Date(kalenteriPvm);
    loppu = new Date(kalenteriPvm);
    otsikko = KALENTERI_PAIVAT[kalenteriPvm.getDay()] + ' ' + kalenteriPvm.getDate() + '. ' + KALENTERI_KUUKAUDET[kalenteriPvm.getMonth()];
  } else if (kalenteriTila === 'viikko') {
    alku = viikonAlku(kalenteriPvm);
    loppu = new Date(alku);
    loppu.setDate(loppu.getDate() + 6);
    otsikko = alku.getDate() + '.' + (alku.getMonth() + 1) + '. – ' + loppu.getDate() + '.' + (loppu.getMonth() + 1) + '.';
  } else {
    alku = new Date(kalenteriPvm.getFullYear(), kalenteriPvm.getMonth(), 1);
    loppu = new Date(kalenteriPvm.getFullYear(), kalenteriPvm.getMonth() + 1, 0);
    otsikko = KALENTERI_KUUKAUDET[kalenteriPvm.getMonth()].replace('ta', '') + ' ' + kalenteriPvm.getFullYear();
  }

  document.getElementById('kalenteri-otsikko').textContent = otsikko;
  document.getElementById('kalenteri-view').dataset.tila = kalenteriTila;
  document.getElementById('kalenteri-add-rivi').style.display = kalenteriTila === 'paiva' ? 'flex' : 'none';

  // Haku ulottuu näkyvää väliä laajemmalle kahdesta syystä: 1) MONIPAIVAINEN_PUSKURI_PV
  // taaksepäin, jotta ennen väliä alkanut monipäiväinen tapahtuma näkyy silti
  // oikein; 2) kuukausitilassa ruudukko täydentyy täysiin viikkoihin kuukauden
  // yli, joten haku ulottuu ruudukon viimeiseen näkyvään päivään asti.
  // Tarkka näkyvä rajaus tehdään joka tapauksessa aina asiakaspuolella
  // tapahtumaKattaaPaivan()-funktiolla, joten liikaa haettu data ei haittaa.
  const haunAlku = new Date(alku);
  haunAlku.setDate(haunAlku.getDate() - MONIPAIVAINEN_PUSKURI_PV);
  let haunLoppu = new Date(loppu);
  if (kalenteriTila === 'kuukausi') {
    haunLoppu = viikonAlku(loppu);
    haunLoppu.setDate(haunLoppu.getDate() + 6);
  }

  // kalenteri_syotteet(vari, henkilo, scope) hakee liitetyn syötteen värin,
  // omistajan ja scopen FK-suhteen (syote_id) kautta samassa kyselyssä —
  // kaikki null jos käsin lisätty tapahtuma. henkilo tarvitaan
  // päällekkäisyysmerkin vakavuusluokitteluun (ks. paallekkaisyysVakavuus()).
  // scope='hytti': RLS (sql/027) takaa ettei tänne koskaan tule TOISEN
  // omistajan hytti-riviä, joten sitä ei suodateta client-puolella pois enää
  // (Katrin 2026-07-16 linjaus — KORVAA aiemman "ei koskaan perheen agendaan"
  // -päätöksen: hytti-scopen tapahtumat näkyvät nyt agenda/viikko/kuukausi
  // -näkymässä omistajalleen siinä missä perhekalenterinkin, JA osallistuvat
  // Kuormavahtiin (laskeMenoja) ja ristiriitamerkkiin (onkoPaivanRistiriita)
  // normaalisti — oma opiskelu-/työmeno ON aitoa perheen kapasiteetista pois
  // olevaa kuormaa). AINOA poikkeus: Kuittausjono (paivitaKuittausTila,
  // onkoUusiMinulle) jättää hytti-scopen edelleen erikseen pois — omaa
  // luentoa ei koskaan "kuitata".
  const { data: haetut, error } = await db.from('kalenteri_tapahtumat')
    .select('*, kalenteri_syotteet(vari, henkilo, scope)')
    .gte('event_date', paivamaaraISO(haunAlku))
    .lte('event_date', paivamaaraISO(haunLoppu))
    .order('event_date')
    .order('event_time', { nullsFirst: false });

  if (error) {
    console.error('Kalenterin haku epäonnistui:', error);
    return;
  }

  const data = (haetut || [])
    .map(function(t) {
      return Object.assign({}, t, {
        _vari: t.kalenteri_syotteet ? t.kalenteri_syotteet.vari : null,
        _henkilo: t.kalenteri_syotteet ? t.kalenteri_syotteet.henkilo : null,
        _scope: t.kalenteri_syotteet ? t.kalenteri_syotteet.scope : null,
      });
    });

  await paivitaAnkkuroidutAvaimet();
  await paivitaAsetukset();
  await paivitaLapsidata();
  await paivitaMuistutuksetKartta();
  await paivitaRistiriitaKuittaukset();

  const sisalto = document.getElementById('kalenteri-sisalto');
  sisalto.innerHTML = '';

  if (kalenteriTila === 'paiva') {
    const tanaanIso = paivamaaraISO(kalenteriPvm);
    let rivit = data.filter(function(t) { return tapahtumaKattaaPaivan(t, tanaanIso); }).map(function(t) {
      return {
        _tyyppi: 'tapahtuma', id: t.id, title: t.title, event_date: t.event_date, event_time: t.event_time,
        event_end_time: t.event_end_time, syote_id: t.syote_id, _henkilo: t._henkilo,
        _vari: t._vari, _scope: t._scope, ical_uid: t.ical_uid, user_id: t.user_id,
      };
    });

    const paivanHenkselit = await fetchVisibleHenkselit(tanaanIso, tanaanIso);

    // Kuormavahti + ristiriitamerkki: lasketaan ENNEN ankkurit/Hytti-rivien
    // lisäystä, koska ne eivät kuulu kalenterin kuormaan/ristiriitoihin
    // (molemmat suodattavat ne pois joka tapauksessa, mutta selkeämpi laskea
    // juuri tässä kohdassa).
    paivitaPaivanOtsikko(
      document.getElementById('kalenteri-otsikko'),
      otsikko,
      rivit,
      tanaanIso,
      haeAsetusNumero('paivan_menoraja', 5),
      paivanHenkselit
    );

    if (tanaanIso === paivamaaraISO(new Date())) {
      // Bugi 26 (2026-07-17): puuttui is_candidate+visible_from-suodatus, joten
      // siirretty ("⏭ Siirrä") ankkuri näkyi silti tässä kalenteriagendassa
      // vaikka se katosi jo oikein lataaAnkkurit()-listasta — sama sääntö
      // tähänkin, samat ehdot kuin lataaAnkkurit()/loadAnchorCandidates().
      const nytIso2 = new Date().toISOString();
      const { data: ankkuridata, error: ankkuriError } = await db.from('ankkurit').select()
        .eq('done', false).eq('is_candidate', false).eq('user_id', currentUserId)
        .or('visible_from.is.null,visible_from.lte.' + nytIso2);
      if (ankkuriError) {
        console.error('Ankkureiden haku kalenteriin epäonnistui:', ankkuriError);
      } else {
        (ankkuridata || []).forEach(function(a) {
          rivit.push({ _tyyppi: 'ankkuri', _ankkuriId: a.id, _source: a.source, _sourceRef: a.source_ref, title: a.content, event_time: a.event_time });
        });
      }

      if (hyttiNakyyKalenterissa()) {
        const { data: hyttiTehtavat, error: hyttiError } = await db.from('hytti_rivit')
          .select('*, hytti_kortit!inner(status)')
          .eq('hytti_kortit.status', 'aktiivinen')
          .eq('is_task', true)
          .eq('done', false)
          .eq('due_date', paivamaaraISO(new Date()));
        if (hyttiError) {
          console.error('Hytin tänään-tehtävien haku kalenteriin epäonnistui:', hyttiError);
        } else {
          (hyttiTehtavat || []).forEach(function(r) {
            rivit.push({ _tyyppi: 'hytti', id: r.id, title: '🚪 ' + r.content, event_time: null });
          });
        }
      }
    }

    piirraHenkselitBanneri(sisalto, paivanHenkselit, tanaanIso);
    piirraKalenteriPaivaRyhma(sisalto, jarjestaAjanMukaan(rivit), null);
    return;
  }

  if (kalenteriTila === 'viikko') {
    const viikonIsot = [];
    for (let i = 0; i < 7; i++) {
      const pvm = new Date(alku);
      pvm.setDate(pvm.getDate() + i);
      viikonIsot.push(paivamaaraISO(pvm));
    }
    const signaalit = await computeVisibleDaySignals(data, viikonIsot);
    const viikonHenkselit = await fetchVisibleHenkselit(viikonIsot[0], viikonIsot[6]);
    piirraViikkoAikajana(sisalto, data, alku, signaalit.kuormaTasot, viikonHenkselit);
    return;
  }

  await piirraKuukausiRuudukko(sisalto, data, kalenteriPvm.getMonth());
}

// === KUUKAUSINÄKYMÄ: RUUDUKKO + MONIPÄIVÄISTEN TAPAHTUMIEN PALKIT ===
// Aiempi kuukausitila oli vain sama päivälistaus kuin viikkotilassa, ei
// oikea ruudukko. Nyt oikea 7-sarakkeinen viikkorivi-ruudukko (maanantai
// ensin), täydennettynä edellisen/seuraavan kuukauden päivillä täysiin
// viikkoihin. Monipäiväinen tapahtuma (event_end_date asetettu) EI toistu
// pallukkana joka päivässä vaan näkyy yhtenäisenä värillisenä palkkina
// jokaisen sen kattaman päivän kohdalla — palkkien "linja" (pystysijainti)
// lasketaan ERIKSEEN per viikkorivi, ei koko kuukaudelle, jotta yhden viikon
// päällekkäiset tapahtumat eivät varaa tyhjää tilaa viikoilta joilla ei ole
// mitään — pieni visuaalinen epätarkkuus (sama tapahtuma voi olla eri
// linjalla viikkojen välissä) hyväksytty tietoisesti, ei tarvita pikselintarkkuutta.
const VIIKONPAIVA_LYHENTEET = ['MA', 'TI', 'KE', 'TO', 'PE', 'LA', 'SU'];

// Jakaa annetun viikon (7 Date-oliota) monipäiväiset tapahtumat "linjoihin"
// (rivin sisäisiin pinoihin) ahneella aikavälialgoritmilla: sama linja
// käytetään uudelleen heti kun edellinen sillä linjalla oleva tapahtuma on
// päättynyt. Palauttaa Map:in tapahtuman id -> linjaindeksi (vain viikolla
// näkyville monipäiväisille tapahtumille).
function laskeViikonLinjat(viikonTapahtumat) {
  const linjojenLoppupaivat = [];
  const linjat = new Map();
  viikonTapahtumat
    .slice()
    .sort(function(a, b) { return a.event_date.localeCompare(b.event_date); })
    .forEach(function(t) {
      let linjaIndex = linjojenLoppupaivat.findIndex(function(loppu) { return loppu < t.event_date; });
      if (linjaIndex === -1) linjaIndex = linjojenLoppupaivat.length;
      linjojenLoppupaivat[linjaIndex] = t.event_end_date || t.event_date;
      linjat.set(t.id, linjaIndex);
    });
  return linjat;
}

// Enintään kolme päällekkäistä palkkia per päiväruutu (Kalenteri UI -speksi,
// kiinteät top-arvot). Yhdistää viikkotason monipäiväisten "linjat" (jo
// laskettu laskeViikonLinjat, jatkuvuus viikon yli) ja tämän päivän
// yksipäiväiset (ajalliset + koko päivän) samaan pinoon: yksipäiväiset
// saavat ensimmäisen vapaan linjan alkamisajan mukaisessa järjestyksessä,
// oikeasti päällekkäisiä ajallisia tapahtumia varoen. Jos linjat loppuvat
// kesken, ylimääräiset jätetään hiljaisesti piirtämättä — kuukausiruutu on
// tilannekatsaus, ei täydellinen luettelo (koko sisältö näkyy päivänäkymässä).
// Neljä linjaa (2026-08-05, Katrin korjaus "we are 4") — ohuemmat
// palkit/tiiviimpi pitch (3px korkeus, 7px väli 12px:stä alkaen) jotta
// neljäs linja mahtuu ilman että ruutu kasvaa kohtuuttomasti (ks.
// .kalenteri-kuukausi-palkki/-palkit style.css:ssä, korkeus nostettu samassa
// muutoksessa).
const KUUKAUSI_MAX_LINJOJA = 4;
const KUUKAUSI_LINJA_TOP_PX = [12, 19, 26, 33];

function assignMonthDayLanes(paivanMonipaivaisetKattavat, paivanYksipaivaiset, viikonLinjat) {
  const linjaVapaaAlkaen = new Array(KUUKAUSI_MAX_LINJOJA).fill(-Infinity);
  const tulos = [];

  paivanMonipaivaisetKattavat.forEach(function(t) {
    const linja = viikonLinjat.get(t.id);
    if (linja !== undefined && linja < KUUKAUSI_MAX_LINJOJA) {
      linjaVapaaAlkaen[linja] = Infinity;
      tulos.push({ tapahtuma: t, linja: linja });
    }
  });

  paivanYksipaivaiset
    .slice()
    .sort(function(a, b) { return (a.event_time || '').localeCompare(b.event_time || ''); })
    .forEach(function(t) {
      const alku = t.event_time ? aikaMinuutteina(t.event_time) : -Infinity;
      const loppu = t.event_time ? aikaMinuutteina(t.event_end_time || t.event_time) : Infinity;
      const linja = linjaVapaaAlkaen.findIndex(function(vapaaAlkaen) { return vapaaAlkaen <= alku; });
      if (linja === -1) return;
      linjaVapaaAlkaen[linja] = loppu;
      tulos.push({ tapahtuma: t, linja: linja });
    });

  return tulos;
}

// Piirtää yhden päiväruudun sisällön: päivänumero (vasen yläkulma), enintään
// kaksi merkkiä (⚠️ ristiriita, 🟠 huolilippu, oikea yläkulma) ja
// aikajanapalkit — EI tekstiä, EI tapahtumanimiä (Kalenteri UI -uudistus,
// 2026-08-05, korvaa aiemman tekstipohjaisen ruudun kokonaan). Kuorma näkyy
// pelkkänä solun taustavärinä (ks. dayLoadCssClass), ei enää omana pisteenä.
// SUORITUSKYKYKORJAUS (2026-07-17, ks. muistiinpanot.md "Kuukausinäkymän
// hitaus") — paivittainYksipaivaiset on esilaskettu Map (event_date -> rivit,
// ks. piirraKuukausiRuudukko) ja monipaivaiset on jo valmiiksi suodatettu
// pienempi joukko, joten tämä funktio ei enää tee YHTÄÄN O(n) .filter()-
// läpikäyntiä koko kuukauden datasta per päiväruutu (aiemmin kolme).
function piirraKuukausiPaiva(pvm, paivittainYksipaivaiset, monipaivaiset, viikonLinjat, kuluvaKuukausi, kuormaTasot, huoliIsot, henkselitLista) {
  const iso = paivamaaraISO(pvm);
  const solu = document.createElement('div');
  solu.className = 'kalenteri-kuukausi-paiva';
  if (pvm.getMonth() !== kuluvaKuukausi) solu.classList.add('ulkopuolinen');
  if (iso === paivamaaraISO(new Date())) solu.classList.add('tanaan');
  const kuormaLuokka = dayLoadCssClass(kuormaTasot.get(iso));
  if (kuormaLuokka) solu.classList.add(kuormaLuokka);

  const paivanYksipaivaiset = paivittainYksipaivaiset.get(iso) || [];
  const paivanMonipaivaisetKattavat = monipaivaiset.filter(function(t) { return tapahtumaKattaaPaivan(t, iso); });
  const paivanKaikki = paivanYksipaivaiset.concat(paivanMonipaivaisetKattavat);

  // Henkselit-tausta (2026-08-05, ks. muistiinpanot.md "Henkselit") — oma
  // visuaalinen kerros kuormavärin PÄÄLLÄ mutta päivänumeron/merkkien/
  // palkkien ALLA (ks. .henkselit-tausta z-index style.css:ssä),
  // pointer-events:none jotta koko solun napautus (alla) pysyy täysin
  // käytettävissä sen läpi. Osittainen ikkuna EI saa omaa aikajanaa
  // kuukausiruudussa (ei tunti-granulariteettia täällä toisin kuin viikossa)
  // — merkitään sen sijaan himmeämpänä (--osittainen) koko päivän peittävän
  // version sijaan, ks. henkselitKattaaKokoPaivan.
  henkselitLista
    .map(function(rivi) { return { rivi: rivi, osuus: henkselitPaivaosuus(rivi, iso) }; })
    .filter(function(x) { return x.osuus !== null; })
    .forEach(function(x) {
      const tausta = document.createElement('div');
      tausta.className = 'henkselit-tausta ' + henkselitVari(x.rivi.henkilo) + (henkselitKattaaKokoPaivan(x.osuus) ? '' : ' henkselit-tausta--osittainen');
      tausta.title = henkiloNimi(x.rivi.henkilo) + ' henkselöity ' + muotoileHenkselitAikavali(x.rivi.alkaa, x.rivi.paattyy);
      solu.appendChild(tausta);
    });

  const pvmEl = document.createElement('span');
  pvmEl.className = 'kalenteri-kuukausi-pvm';
  pvmEl.textContent = pvm.getDate();
  solu.appendChild(pvmEl);

  // Vain päivät joilla on vähintään kaksi kellonaikaan sidottua tapahtumaa
  // voivat ylipäätään olla päällekkäin — vältetään O(k²)-parivertailu (ja
  // pelkkä funktiokutsu) turhaan yleisimmässä tapauksessa (0-1 ajallista
  // tapahtumaa päivässä). Kuitattu ("keskusteltu") ristiriita ei enää saa
  // omaa merkkiään täällä — tilannekatsaus näyttää vain vielä avoimet asiat,
  // päivänäkymän oma otsikko (paivitaPaivanOtsikko, koskematon) näyttää
  // kuittaustilan tarkemmin.
  const paivanRistiriita = paivanRistiriitaTila(paivanKaikki, iso, henkselitLista);
  const onRistiriita = paivanRistiriita.onRistiriita;
  const onHuolilippu = huoliIsot.has(iso);

  // Iso merkki (2026-08-05, ks. muistiinpanot.md "Henkselit" — kuukausi-
  // näkymän tilavarausosio): kuukausiruudussa oli n. 2/3 tyhjää tekstitöntä
  // tilaa, otetaan käyttöön kun päivällä on ristiriita TAI huolilippu —
  // "erottuu heti nopealla vilkaisulla" sen sijaan että piilossa 8px/5px
  // nurkkamerkkinä. Ristiriita voittaa jos molemmat (kiireellisempi) — silloin
  // huolilippu jää pieneksi nurkkapisteeksi ristiriitamerkin viereen, EI
  // omaa isoa merkkiä (kaksi isoa merkkiä samassa ruudussa olisi enemmän
  // kohinaa kuin signaalia). Piirretään bareja/pvm-numeroa EDELTÄ DOM:ssa
  // (matalampi z-index, ks. style.css) jotta ne pysyvät täysin luettavina
  // ison merkin päällä — henkselit-taustan tavoin isokaan merkki ei saa
  // hämärtää muuta sisältöä.
  if (onRistiriita) {
    const isoMerkki = document.createElement('span');
    isoMerkki.className = 'kalenteri-kuukausi-iso-merkki';
    isoMerkki.textContent = '⚠️';
    solu.appendChild(isoMerkki);
  } else if (onHuolilippu) {
    const isoMerkki = document.createElement('span');
    isoMerkki.className = 'kalenteri-kuukausi-iso-merkki kalenteri-kuukausi-iso-merkki--huoli';
    isoMerkki.textContent = '🟠';
    solu.appendChild(isoMerkki);
  }

  if (onRistiriita || onHuolilippu) {
    const merkit = document.createElement('div');
    merkit.className = 'kalenteri-kuukausi-merkit';
    if (onRistiriita) {
      const varoitus = document.createElement('span');
      varoitus.className = 'kalenteri-kuukausi-merkki-ristiriita';
      varoitus.textContent = '⚠️';
      varoitus.title = paivanRistiriita.fullIds.length > 0 ? 'Päällekkäin — napauta nähdäksesi kenen menot' : 'Molemmat vanhemmat henkselöity samaan aikaan — lapsi voi jäädä ilman valvontaa';
      varoitus.addEventListener('click', function(e) {
        e.stopPropagation();
        if (paivanRistiriita.fullIds.length > 0) {
          avaaRistiriitaVahvistus(iso, paivanKaikki, paivanRistiriita.fullIds);
        } else {
          naytaIlmoitus('Molemmat vanhemmat ovat henkselöity samaan aikaan tänä päivänä, eikä kaikkia valvontaa tarvitsevia lapsia ole katettu millään tapahtumalla.');
        }
      });
      merkit.appendChild(varoitus);
    }
    if (onHuolilippu) {
      const huoli = document.createElement('span');
      huoli.className = 'kalenteri-kuukausi-merkki-huoli';
      huoli.title = 'Huolilippu tälle päivälle';
      merkit.appendChild(huoli);
    }
    solu.appendChild(merkit);
  }

  const linjoitetut = assignMonthDayLanes(paivanMonipaivaisetKattavat, paivanYksipaivaiset, viikonLinjat);
  if (linjoitetut.length > 0) {
    const palkitEl = document.createElement('div');
    palkitEl.className = 'kalenteri-kuukausi-palkit';
    linjoitetut.forEach(function(kohde) {
      const asettelu = computeEventBarLayout(kohde.tapahtuma, iso);
      const palkki = document.createElement('div');
      palkki.className = 'kalenteri-kuukausi-palkki' + (asettelu.reunaLuokka ? ' ' + asettelu.reunaLuokka : '');
      palkki.style.top = KUUKAUSI_LINJA_TOP_PX[kohde.linja] + 'px';
      palkki.style.left = asettelu.left + '%';
      if (asettelu.width !== undefined) palkki.style.width = asettelu.width + '%';
      else palkki.style.right = asettelu.right + '%';
      palkki.style.backgroundColor = resolveEventOwnerColor(kohde.tapahtuma);
      palkitEl.appendChild(palkki);
    });
    solu.appendChild(palkitEl);
  }

  solu.addEventListener('click', function() {
    kalenteriPvm = new Date(pvm);
    kalenteriTila = 'paiva';
    document.querySelectorAll('.kalenteri-tila-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.tila === 'paiva'); });
    lataaKalenteri();
  });

  return solu;
}

async function piirraKuukausiRuudukko(sisalto, kaikkiTapahtumat, kuluvaKuukausi) {
  const ruudukko = document.createElement('div');
  ruudukko.className = 'kalenteri-kuukausi-ruudukko';

  const otsikkorivi = document.createElement('div');
  otsikkorivi.className = 'kalenteri-kuukausi-viikonpaivat';
  VIIKONPAIVA_LYHENTEET.forEach(function(lyhenne) {
    const span = document.createElement('span');
    span.textContent = lyhenne;
    otsikkorivi.appendChild(span);
  });
  ruudukko.appendChild(otsikkorivi);

  // SUORITUSKYKYKORJAUS (2026-07-17, ks. muistiinpanot.md "Kuukausinäkymän
  // hitaus"): yksipäiväiset tapahtumat ryhmitellään event_date:n mukaan
  // YHDELLÄ läpikäynnillä koko kuukauden datasta, ennen kuin yhtään
  // päiväruutua piirretään — jokainen ruutu tekee sen jälkeen vain yhden
  // O(1) Map-haun 42 erillisen O(n) suodatuksen sijaan. Monipäiväiset
  // tapahtumat (yleensä paljon harvinaisempia) pysyvät omana, jo valmiiksi
  // suodatettuna pienempänä joukkonaan.
  const yksipaivaisetPaivittain = new Map();
  const monipaivaiset = [];
  kaikkiTapahtumat.forEach(function(t) {
    if (onkoMonipaivainen(t)) {
      monipaivaiset.push(t);
      return;
    }
    if (!yksipaivaisetPaivittain.has(t.event_date)) yksipaivaisetPaivittain.set(t.event_date, []);
    yksipaivaisetPaivittain.get(t.event_date).push(t);
  });

  const kuunEnsimmainen = new Date(kalenteriPvm.getFullYear(), kuluvaKuukausi, 1);
  const kuunViimeinen = new Date(kalenteriPvm.getFullYear(), kuluvaKuukausi + 1, 0);
  const ruudukonAlku = viikonAlku(kuunEnsimmainen);
  const ruudukonLoppu = viikonAlku(kuunViimeinen);
  ruudukonLoppu.setDate(ruudukonLoppu.getDate() + 6);

  const ruudukonIsot = [];
  let signaaliPvm = new Date(ruudukonAlku);
  while (signaaliPvm <= ruudukonLoppu) {
    ruudukonIsot.push(paivamaaraISO(signaaliPvm));
    signaaliPvm.setDate(signaaliPvm.getDate() + 1);
  }
  const signaalit = await computeVisibleDaySignals(kaikkiTapahtumat, ruudukonIsot);
  const henkselit = await fetchVisibleHenkselit(ruudukonIsot[0], ruudukonIsot[ruudukonIsot.length - 1]);

  let viikonPvm = new Date(ruudukonAlku);
  while (viikonPvm <= ruudukonLoppu) {
    const viikonPaivat = [];
    for (let i = 0; i < 7; i++) {
      viikonPaivat.push(new Date(viikonPvm));
      viikonPvm.setDate(viikonPvm.getDate() + 1);
    }

    const viikonAlkuIso = paivamaaraISO(viikonPaivat[0]);
    const viikonLoppuIso = paivamaaraISO(viikonPaivat[6]);
    const viikonMonipaivaiset = monipaivaiset.filter(function(t) {
      return t.event_date <= viikonLoppuIso && (t.event_end_date || t.event_date) >= viikonAlkuIso;
    });
    const linjat = laskeViikonLinjat(viikonMonipaivaiset);

    const viikkorivi = document.createElement('div');
    viikkorivi.className = 'kalenteri-kuukausi-viikko';
    viikonPaivat.forEach(function(pvm) {
      viikkorivi.appendChild(piirraKuukausiPaiva(pvm, yksipaivaisetPaivittain, monipaivaiset, linjat, kuluvaKuukausi, signaalit.kuormaTasot, signaalit.huoliIsot, henkselit));
    });
    ruudukko.appendChild(viikkorivi);
  }

  sisalto.appendChild(ruudukko);
}

// === VIIKKONÄKYMÄN AIKAJANA (2026-08-05, Kalenteri UI -uudistus) ===
// Korvaa vanhan listapohjaisen viikkonäkymän (7x piirraKalenteriPaivaRyhma,
// sama rivipiirtäjä kuin päivänäkymässä) omalla aikajanarenderöijällään.
// TIETOISESTI EI kutsu piirraKalenteriRivi():tä — päivänäkymä pysyy täysin
// koskemattomana (ks. Kalenteri UI -speksi "Ei muuteta"), joten tämä on
// oma, rinnakkainen piirtopolku eikä haaroitus jaetussa funktiossa.
//
// Rakenne per päiväsarake: yläosassa kapea "kokopäivä"-rivi (yön yli/koko
// päivä -tapahtumat, sama reunalogiikka kuin kuukausinäkymän palkeissa,
// ks. computeEventBarLayout), sen alla tuntiruudukko jossa ajalliset
// tapahtumat asemoidaan absoluuttisesti top/height-prosentteina samalta
// 07–23-akselilta (KALENTERI_AIKAJANA_*, ks. minutesToPercent).
const VIIKKO_KOKOPAIVA_MAX_LINJOJA = 2;
const VIIKKO_KOKOPAIVA_LINJA_TOP_PX = [0, 8];
// Pidä samassa kuin style.css:n .kalenteri-viikko-tuntialue { height } —
// tarvitaan tässä koska palkin korkeus px:nä ratkaisee näytetäänkö nimi
// (ks. VIIKKO_BADGE_NIMI_RAJA_PX, "≥28px" Kalenteri UI -speksissä).
const VIIKKO_TUNTIALUE_KORKEUS_PX = 400;
const VIIKKO_BADGE_NIMI_RAJA_PX = 28;

function piirraViikkoKokopaivaRivi(paivanKaikki, iso) {
  const rivi = document.createElement('div');
  rivi.className = 'kalenteri-viikko-kokopaiva';
  paivanKaikki
    .filter(function(t) { return onkoMonipaivainen(t) || !t.event_time; })
    .slice(0, VIIKKO_KOKOPAIVA_MAX_LINJOJA)
    .forEach(function(t, i) {
      const asettelu = computeEventBarLayout(t, iso);
      const palkki = document.createElement('div');
      palkki.className = 'kalenteri-viikko-kokopaiva-palkki' + (asettelu.reunaLuokka ? ' ' + asettelu.reunaLuokka : '');
      palkki.style.top = VIIKKO_KOKOPAIVA_LINJA_TOP_PX[i] + 'px';
      palkki.style.left = asettelu.left + '%';
      if (asettelu.width !== undefined) palkki.style.width = asettelu.width + '%';
      else palkki.style.right = asettelu.right + '%';
      palkki.style.backgroundColor = resolveEventOwnerColor(t);
      rivi.appendChild(palkki);
    });
  return rivi;
}

// Ryhmittää päivän ajalliset tapahtumat ketjutetusti päällekkäisiin
// klustereihin (samaan tapaan kuin laskeViikonLinjat, mutta kellonajan
// eikä päivämäärän mukaan) ja jakaa klusterin oman aika-alueen tasan sen
// tapahtumien kesken — "korkeussuunnassa alekkain, 50%/50% korkeudesta"
// kahden päällekkäisen tapauksessa (Kalenteri UI -speksi), yleistettynä
// N:lle tapahtumalle.
function assignWeekOverlapSlots(paivanAjalliset) {
  const klusterit = [];
  paivanAjalliset
    .slice()
    .sort(function(a, b) { return aikaMinuutteina(a.event_time) - aikaMinuutteina(b.event_time); })
    .forEach(function(t) {
      const alku = aikaMinuutteina(t.event_time);
      const loppu = t.event_end_time ? aikaMinuutteina(t.event_end_time) : alku + 30;
      const viimeinen = klusterit[klusterit.length - 1];
      if (viimeinen && alku < viimeinen.klusterinLoppu) {
        viimeinen.tapahtumat.push(t);
        viimeinen.klusterinLoppu = Math.max(viimeinen.klusterinLoppu, loppu);
      } else {
        klusterit.push({ klusterinLoppu: loppu, tapahtumat: [t] });
      }
    });

  const tulos = [];
  klusterit.forEach(function(k) {
    const n = k.tapahtumat.length;
    const alkuMinimit = k.tapahtumat.map(function(t) { return aikaMinuutteina(t.event_time); });
    const loppuMinimit = k.tapahtumat.map(function(t) { return t.event_end_time ? aikaMinuutteina(t.event_end_time) : aikaMinuutteina(t.event_time) + 30; });
    const topPct = minutesToPercent(Math.min.apply(null, alkuMinimit));
    const loppuPct = minutesToPercent(Math.max.apply(null, loppuMinimit));
    const korkeusPct = Math.max(loppuPct - topPct, 0);
    k.tapahtumat.forEach(function(t, i) {
      tulos.push({ tapahtuma: t, topPct: topPct + (i / n) * korkeusPct, heightPct: korkeusPct / n });
    });
  });
  return tulos;
}

// Henkselit-tausta viikon tuntialueella (2026-08-05, ks. muistiinpanot.md
// "Henkselit") — TÄYSIN samat top%/height%-koordinaatit kuin tapahtuma-
// palkeilla (minutesToPercent, sama 07-23-akseli), leikattu automaattisesti
// akselin päihin (ks. henkselitPaivaosuus). Lisätty ENNEN tapahtumapalkkeja
// DOM:ssa (ks. style.css:n .henkselit-tausta z-index) jotta palkit pysyvät
// täysin luettavina taustan päällä — "ei peitä eikä hämärrä alla olevia
// tapahtumia näkyvyydeltään" (speksi).
function piirraViikkoHenkselitTausta(henkselitLista, iso) {
  return henkselitLista
    .map(function(rivi) { return { rivi: rivi, osuus: henkselitPaivaosuus(rivi, iso) }; })
    .filter(function(x) { return x.osuus !== null; })
    .map(function(x) {
      const tausta = document.createElement('div');
      tausta.className = 'henkselit-tausta ' + henkselitVari(x.rivi.henkilo) + (henkselitKattaaKokoPaivan(x.osuus) ? '' : ' henkselit-tausta--osittainen');
      tausta.style.top = minutesToPercent(x.osuus.alkuMin) + '%';
      tausta.style.height = Math.max(minutesToPercent(x.osuus.loppuMin) - minutesToPercent(x.osuus.alkuMin), 0) + '%';
      tausta.style.left = '0';
      tausta.style.right = '0';
      tausta.title = henkiloNimi(x.rivi.henkilo) + ' henkselöity ' + muotoileHenkselitAikavali(x.rivi.alkaa, x.rivi.paattyy);
      return tausta;
    });
}

// Toteutuneen opiskelun ohuet merkit (2026-08-17, Reitti-välilehden
// viikkoruudukko, §5.1: "toteutuneet opiskelut näkyvät Reitin kalenterissa
// samassa näkymässä kuin live-luennot — päivän kertymän paikka"). EI osallistu
// assignWeekOverlapSlots-limitykseen (oma kapea reuna, ei kilpaile
// kalenteripalkkien tilasta) — sama minutesToPercent-akseli, joten
// kohdistuu silti oikein kellonaikaan. Vain PÄÄTTYNEET istunnot (loppui_at
// ei null) — kesken oleva ei tiedä vielä todellista kestoaan.
function piirraViikkoOpiskeluMerkit(paivanSessiot) {
  return paivanSessiot.filter(function(s) { return s.loppui_at; }).map(function(s) {
    const alku = new Date(s.alkoi_at);
    const loppu = new Date(s.loppui_at);
    const merkki = document.createElement('div');
    merkki.className = 'kalenteri-viikko-opiskelu-merkki';
    merkki.style.top = minutesToPercent(alku.getHours() * 60 + alku.getMinutes()) + '%';
    merkki.style.height = Math.max(minutesToPercent(loppu.getHours() * 60 + loppu.getMinutes()) - minutesToPercent(alku.getHours() * 60 + alku.getMinutes()), 1) + '%';
    merkki.title = 'Opiskeltu ' + alku.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }) + '–' + loppu.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
    return merkki;
  });
}

function piirraViikkoTuntialue(paivanAjalliset, henkselitLista, iso, paivanSessiot) {
  const alue = document.createElement('div');
  alue.className = 'kalenteri-viikko-tuntialue';
  piirraViikkoHenkselitTausta(henkselitLista, iso).forEach(function(tausta) { alue.appendChild(tausta); });
  piirraViikkoOpiskeluMerkit(paivanSessiot || []).forEach(function(merkki) { alue.appendChild(merkki); });
  assignWeekOverlapSlots(paivanAjalliset).forEach(function(kohde) {
    const t = kohde.tapahtuma;
    const palkki = document.createElement('div');
    palkki.className = 'kalenteri-viikko-palkki';
    palkki.style.top = kohde.topPct + '%';
    palkki.style.height = kohde.heightPct + '%';
    const vari = resolveEventOwnerColor(t);
    palkki.style.borderLeftColor = vari;
    palkki.style.backgroundColor = vari + '26'; // ~15% peittävyys (hex-alpha)

    const merkki = document.createElement('span');
    merkki.className = 'kalenteri-viikko-merkki';
    merkki.style.backgroundColor = vari;
    merkki.textContent = resolveEventOwnerLetter(t);
    palkki.appendChild(merkki);

    const korkeusPx = kohde.heightPct / 100 * VIIKKO_TUNTIALUE_KORKEUS_PX;
    if (korkeusPx >= VIIKKO_BADGE_NIMI_RAJA_PX) {
      const nimi = document.createElement('span');
      nimi.className = 'kalenteri-viikko-nimi';
      nimi.textContent = t.title;
      palkki.appendChild(nimi);
    } else {
      palkki.title = (t.event_time ? t.event_time.slice(0, 5) + ' ' : '') + t.title;
    }

    alue.appendChild(palkki);
  });
  return alue;
}

// Kolmiportainen kadenssi Taso 1:n suunnitelma viikkoruudukossa (18.8.2026,
// Katrin pyyntö: "biweekly plan should show in calendar once done and day
// by day it gets replaced by actual study session lengths"). Kutsuja
// (piirraViikkoAikajana) rajaa jo pois menneet päivät JA tänään jo tehdyt
// aiheet — tämä piirtää vain sen mitä jää jäljelle.
function piirraViikkoSuunniteltuRivi(paivanSuunnitellut) {
  const rivi = document.createElement('div');
  rivi.className = 'kalenteri-viikko-suunniteltu-rivi';
  paivanSuunnitellut.forEach(function(a) {
    const chip = document.createElement('span');
    chip.className = 'kalenteri-viikko-suunniteltu-chip';
    chip.textContent = a.name;
    chip.title = 'Suunniteltu tavoitepäivä: ' + a.name + ' (' + a.kurssiNimi + ')';
    rivi.appendChild(chip);
  });
  return rivi;
}

function piirraViikkoAikajana(sisalto, data, viikonAlkuPvm, kuormaTasot, henkselitLista, sessiot, suunnitellutAiheet) {
  const aikajana = document.createElement('div');
  aikajana.className = 'kalenteri-viikko-aikajana';

  const tuntiGutter = document.createElement('div');
  tuntiGutter.className = 'kalenteri-viikko-tuntigutter';
  [8, 12, 16, 20].forEach(function(h) {
    const label = document.createElement('span');
    label.className = 'kalenteri-viikko-tuntileima';
    label.style.top = minutesToPercent(h * 60) + '%';
    label.textContent = h;
    tuntiGutter.appendChild(label);
  });
  aikajana.appendChild(tuntiGutter);

  for (let i = 0; i < 7; i++) {
    const pvm = new Date(viikonAlkuPvm);
    pvm.setDate(pvm.getDate() + i);
    const iso = paivamaaraISO(pvm);
    const paivanKaikki = data.filter(function(t) { return tapahtumaKattaaPaivan(t, iso); });
    const paivanAjalliset = paivanKaikki.filter(function(t) { return t.event_time && !onkoMonipaivainen(t); });
    const paivanSessiot = (sessiot || []).filter(function(s) { return paivamaaraISO(new Date(s.alkoi_at)) === iso; });

    const sarake = document.createElement('div');
    sarake.className = 'kalenteri-viikko-paiva';
    const kuormaLuokka = dayLoadCssClass(kuormaTasot.get(iso));
    if (kuormaLuokka) sarake.classList.add(kuormaLuokka);
    if (iso === paivamaaraISO(new Date())) sarake.classList.add('tanaan');

    const otsikko = document.createElement('div');
    otsikko.className = 'kalenteri-viikko-paiva-otsikko';
    otsikko.textContent = VIIKONPAIVA_LYHENTEET[(pvm.getDay() + 6) % 7] + ' ' + pvm.getDate() + '.' + (pvm.getMonth() + 1) + '.';
    otsikko.addEventListener('click', function() {
      kalenteriPvm = new Date(pvm);
      kalenteriTila = 'paiva';
      document.querySelectorAll('.kalenteri-tila-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.tila === 'paiva'); });
      lataaKalenteri();
    });
    sarake.appendChild(otsikko);

    // Suunniteltu-rivi (Kolmiportainen kadenssi Taso 1, 18.8.2026) — "päivä
    // kerrallaan korvautuu toteutuneella": jos aiheelle on jo TÄNÄÄN
    // valmistunut oikea sessio, sitä ei enää näytetä suunniteltuna, koska
    // se on jo totta eikä enää pelkkä tavoite. EI kellonaika-sijoitettu (ei
    // tiedetä milloin päivästä) — kevyt tekstirivi otsikon alla, tuntiruudukko
    // pysyy varattuna vain todelliselle datalle (ei-fake-data-periaate).
    const paivanTehdytAiheIdt = new Set(paivanSessiot.map(function(s) { return s.aihe_id; }).filter(Boolean));
    const paivanSuunnitellut = (suunnitellutAiheet || [])
      .filter(function(a) { return a.tavoiteikkuna === iso && !paivanTehdytAiheIdt.has(a.id); });
    if (paivanSuunnitellut.length > 0) sarake.appendChild(piirraViikkoSuunniteltuRivi(paivanSuunnitellut));

    sarake.appendChild(piirraViikkoKokopaivaRivi(paivanKaikki, iso));
    sarake.appendChild(piirraViikkoTuntialue(paivanAjalliset, henkselitLista, iso, paivanSessiot));

    aikajana.appendChild(sarake);
  }

  sisalto.appendChild(aikajana);
}

// === KALENTERIN KUITTAUSJONO ===
// "Yksi totuus, kaksi ikkunaa" (2026-07-08 illalla, ks. muistiinpanot.md
// omalla otsikolla): kaikki synkatut tapahtumat (icloud/ics_url,
// taysi/vain_varattu) ovat AINA suoraan näkyvissä agendassa — EI enää
// erillistä hyväksyntäjonoa joka piilottaisi ne. Toisen käyttäjän lisäämät
// (tai tekijää ei tunnistettu, ks. sql/021_kalenteri_kuittausjono.sql)
// saavat "uusi"-merkinnän kunnes KUITATAAN — kuittaus on "nähty", ei portti,
// EI koskaan poista tapahtumaa (jos meno on väärässä kalenterissa, se
// siirretään iPhonen Kalenterissa, synkka peilaa muutoksen tänne).
// Lähettää oman istunnon access_tokenin mukana (2026-07-20, ks. muistiinpanot.md
// "RLS-/yksityisyysauditointi") — endpoint vaatii nyt todennuksen, aiemmin
// täysin avoin.
// BUGIKORJAUS (2026-07-21, "Riippuvuudet ja rajat" -auditointi, ks.
// muistiinpanot.md): tämä on Kalenteri-näkymän AUTOMAATTINEN, taustalla
// ajettava synkka (paljon useammin käytetty kuin "Hae kalenteri nyt"
// -käsinappi) — tyhjä `catch(e){}` nieli KAIKKI virheet täysin hiljaa, eikä
// koodi edes tarkistanut `response.ok`:a, joten myös palvelimen omat
// virhevastaukset (esim. 401 puuttuvasta todennuksesta, tai selkeä
// kirjoitusvirhe-viesti) katosivat jäljettömiin. Ei toastia joka
// näkymänavauksella (liian häiritsevä, jos vika on pysyvä — käsinappi
// tarjoaa jo toastin), mutta virhe pitää EDES näkyä konsolissa, ei olla
// todistetusti näkymätön.
async function synkkaaICloud() {
  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    const vastaus = await fetch('/api/cron?task=caldav', { headers: { Authorization: 'Bearer ' + token } });
    if (!vastaus.ok) {
      console.error('Kalenterin taustasynkka epäonnistui:', vastaus.status);
      return;
    }
    paivitaKuittausTila();
  } catch (e) {
    console.error('Kalenterin taustasynkka epäonnistui:', e.message);
  }
}

// Kirjautuneen käyttäjän omat kuittaukset — sama Set-pohjainen kuvio kuin
// ankkuroidutAvaimet.
let kuitatutUidt = new Set();
async function paivitaKuitatutUidt() {
  const { data, error } = await db.from('kalenteri_kuittaukset').select('ical_uid');
  if (error) {
    console.error('Kuittausten haku epäonnistui:', error);
    return;
  }
  kuitatutUidt = new Set((data || []).map(function(r) { return r.ical_uid; }));
}

// Onko tapahtuma "uusi minulle": synkattu (ical_uid asetettu), tekijä on joku
// muu kuin minä TAI tekijää ei tunnistettu (user_id NULL, turvallinen
// oletus), ja en ole vielä kuitannut sitä. Käsin lisätyt (ical_uid null)
// eivät voi olla "uusia" — ne ovat aina omia, kuittausjono ei koske niitä.
// scope='hytti' ei voi olla "uusi" edes rakenteellisesti: organizer-tunnistus
// (kalenteri_tekijat) ei tunne opiskelu-/työsyötteiden organizereita, joten
// user_id jäisi NULLiksi ja rivi näyttäisi väärin "uudelta" omalta
// opiskelutapahtumalta — hytti pysyy täysin kuittausjonon ulkopuolella,
// kuten paivitaKuittausTila() jo tekee erikseen kuittausjonolle itselleen.
function onkoUusiMinulle(rivi) {
  if (!rivi.ical_uid) return false;
  if (rivi._scope === 'hytti') return false;
  if (rivi.user_id === currentUserId) return false;
  return !kuitatutUidt.has(rivi.ical_uid);
}

// Palauttaa true jos kuittaus oikeasti kirjoittui — kutsujien pitää
// tarkistaa tämä ennen kuin ne merkitsevät rivin/badgen kuitatuksi (ks.
// muistiinpanot.md "Kirjoituspolkujen auditointi": kuitatutUidt-välimuistia
// EI SAA päivittää mikäli kirjoitus oikeasti epäonnistui).
async function kuittaa(icalUid) {
  const { error } = await db.from('kalenteri_kuittaukset').upsert(
    { ical_uid: icalUid, user_id: currentUserId },
    { onConflict: 'ical_uid,user_id' }
  );
  if (ilmoitaKirjoitusvirheesta(error, 'Kuittaus')) return false;
  kuitatutUidt.add(icalUid);
  return true;
}

// Kaikki tällä hetkellä "uudet minulle" -rivit — tallennettu tähän "Kuittaa
// kaikki" -napin käyttöön, jottei tarvitse hakea uudelleen.
let kuittausjonoUudet = [];

// Hakee kaikki synkatut tapahtumat, suodattaa "uudet minulle" -rivit ja
// päivittää Kalenteri-näkymän yläosan linkin + etusivun Kalenteri-laatan merkin.
async function paivitaKuittausTila() {
  await paivitaKuitatutUidt();
  const { data, error } = await db.from('kalenteri_tapahtumat')
    .select('*, kalenteri_syotteet(vari, name, scope)')
    .not('ical_uid', 'is', null)
    .order('event_date');
  if (error) {
    console.error('Kuittausjonon haku epäonnistui:', error);
    return;
  }
  // Hytti-scopen tapahtumia (oma opiskelu/työ) ei koskaan kuitata — ne eivät
  // ole "uusia" kenellekään perheenjäsenelle, koska niitä ei näytetä
  // perheen agendassa ollenkaan. Ks. "Hytti v1 + opiskelulaajennus" -osio.
  kuittausjonoUudet = (data || [])
    .filter(function(t) { return !t.kalenteri_syotteet || t.kalenteri_syotteet.scope !== 'hytti'; })
    .filter(onkoUusiMinulle);

  const linkki = document.getElementById('kalenteri-kuittaus-linkki');
  if (kuittausjonoUudet.length === 0) {
    linkki.style.display = 'none';
  } else {
    linkki.style.display = 'block';
    linkki.textContent = '🆕 ' + kuittausjonoUudet.length + ' uutta — näytä';
    linkki.onclick = function() { avaaKuittausOverlay(kuittausjonoUudet); };
  }

  paivitaKalenteriBadge();
}

// Kalenterin pallura = kuittausjono + ristiriitapaketin kuittaamattomat
// 'full'-ristiriidat yhteenlaskettuna (Ristiriitapaketti kohta 4, 2026-07-17,
// ks. muistiinpanot.md) — molemmat ovat "kalenteri kaipaa reaktiota" -signaaleja,
// jaettu yhteen palluraan ettei sovelluksessa näy kahta erillistä
// kalenterimerkkiä. Asui aiemmin 2x3-navigointiruudukon Kalenteri-laatassa,
// siirretty (2026-08-18, ruudukon poiston yhteydessä) alapalkin
// kalenterikuvakkeeseen — sama pallura, uusi paikka, ei uutta logiikkaa.
function paivitaKalenteriBadge() {
  huomioPallurat.kalenteri = kuittausjonoUudet.length + ristiriitaPalluraMaara;
  const badge = document.querySelector('[data-role="alapalkki-badge-kalenteri"]');
  if (badge) {
    if (huomioPallurat.kalenteri) {
      badge.textContent = huomioPallurat.kalenteri;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  paivitaSovelluskuvakeBadge();
}

// Skannaa lähitulevaisuuden (60 pv eteenpäin — mennyttä ristiriitaa ei voi
// enää sopia) VAIN etusivun/laatan palluraa varten, kevyt kysely riippumaton
// siitä onko Kalenteri-näkymä koskaan avattu tällä istunnolla (Vilkaisuarvo:
// väsyneen käyttäjän ei pidä tarvita avata kalenteria nähdäkseen tämän).
const RISTIRIITA_PALLURA_PAIVIA_ETEENPAIN = 60;
let ristiriitaPalluraMaara = 0;
async function paivitaRistiriitaPallura() {
  const tanaan = paivamaaraISO(new Date());
  const loppu = new Date();
  loppu.setDate(loppu.getDate() + RISTIRIITA_PALLURA_PAIVIA_ETEENPAIN);
  const { data, error } = await db.from('kalenteri_tapahtumat')
    .select('id, event_date, event_time, event_end_time, syote_id, kalenteri_syotteet(henkilo, scope)')
    .gte('event_date', tanaan)
    .lte('event_date', paivamaaraISO(loppu))
    .not('event_time', 'is', null);
  if (error) {
    console.error('Ristiriitapalluran haku epäonnistui:', error);
    return;
  }
  const rivitPaivittain = {};
  (data || []).forEach(function(t) {
    const rivi = Object.assign({}, t, {
      _henkilo: t.kalenteri_syotteet ? t.kalenteri_syotteet.henkilo : null,
      _scope: t.kalenteri_syotteet ? t.kalenteri_syotteet.scope : null,
    });
    (rivitPaivittain[t.event_date] = rivitPaivittain[t.event_date] || []).push(rivi);
  });
  await paivitaRistiriitaKuittaukset();
  const henkselit = await fetchVisibleHenkselit(tanaan, paivamaaraISO(loppu));
  let maara = 0;
  Object.keys(rivitPaivittain).forEach(function(pvm) {
    const tila = paivanRistiriitaTila(rivitPaivittain[pvm], pvm, henkselit);
    if (tila.onRistiriita) maara++;
  });
  ristiriitaPalluraMaara = maara;
  paivitaKalenteriBadge();
}

// Piirtää kuittauskortit (otsikko + pvm/aika + värillinen lähdemerkintä +
// yksi "✓ Kuittaa" -nappi, EI Hylkää-nappia — kuittaus ei koskaan poista
// tapahtumaa) ja avaa overlayn.
// Kuormavahti-kytkös kuittausjonoon: kertoo per rivi kuinka monta MUUTA
// kellonaikamenoa samalla päivällä on, jotta uuden tapahtuman kuittaajalle
// näkyy heti jos se osuu jo kuormitetulle päivälle.
async function laskeMuutaMenoaPaivalle(pvm, oma_id) {
  const { count, error } = await db.from('kalenteri_tapahtumat')
    .select('id', { count: 'exact', head: true })
    .eq('event_date', pvm)
    .not('event_time', 'is', null)
    .neq('id', oma_id);
  if (error) {
    console.error('Kuormavahdin laskenta epäonnistui:', error);
    return 0;
  }
  return count || 0;
}

async function avaaKuittausOverlay(rivit) {
  const lista = document.getElementById('kalenteri-kuittaus-lista');
  lista.innerHTML = '';
  const kuormaraja = haeAsetusNumero('paivan_menoraja', 5);
  const muutaMenoa = await Promise.all(rivit.map(function(rivi) { return laskeMuutaMenoaPaivalle(rivi.event_date, rivi.id); }));

  rivit.forEach(function(rivi, index) {
    const kortti = document.createElement('div');
    kortti.className = 'kalenteri-kortti';

    const vari = document.createElement('span');
    vari.className = 'kalenteri-kortti-vari';
    vari.style.backgroundColor = rivi.kalenteri_syotteet ? (rivi.kalenteri_syotteet.vari || 'var(--muted)') : 'var(--muted)';
    kortti.appendChild(vari);

    const teksti = document.createElement('div');
    teksti.className = 'kalenteri-kortti-teksti';
    const pvm = new Date(rivi.event_date + 'T00:00:00');
    let pvmTeksti = pvm.getDate() + '.' + (pvm.getMonth() + 1) + '.' + (rivi.event_time ? ' klo ' + rivi.event_time.slice(0, 5) : '');
    if (rivi.event_end_date && rivi.event_end_date !== rivi.event_date) {
      const loppuPvm = new Date(rivi.event_end_date + 'T00:00:00');
      pvmTeksti = pvm.getDate() + '.' + (pvm.getMonth() + 1) + '. – ' + loppuPvm.getDate() + '.' + (loppuPvm.getMonth() + 1) + '.';
    }
    const otsikkoRivi = document.createElement('strong');
    otsikkoRivi.textContent = rivi.title;
    const pvmRivi = document.createElement('span');
    pvmRivi.className = 'kalenteri-kortti-pvm';
    pvmRivi.textContent = pvmTeksti;
    teksti.appendChild(otsikkoRivi);
    teksti.appendChild(document.createElement('br'));
    teksti.appendChild(pvmRivi);

    if (muutaMenoa[index] >= kuormaraja) {
      const kuormaHuomio = document.createElement('span');
      kuormaHuomio.className = 'kalenteri-kortti-kuorma';
      kuormaHuomio.textContent = 'huom: päivällä jo ' + muutaMenoa[index] + ' muuta menoa';
      teksti.appendChild(document.createElement('br'));
      teksti.appendChild(kuormaHuomio);
    }

    kortti.appendChild(teksti);

    const napit = document.createElement('div');
    napit.className = 'kalenteri-kortti-napit';

    const kuittaaNappi = document.createElement('button');
    kuittaaNappi.className = 'dialog-btn dialog-btn-cancel';
    kuittaaNappi.textContent = '✓ Kuittaa';
    kuittaaNappi.addEventListener('click', async function() {
      await kuittaa(rivi.ical_uid);
      kortti.remove();
      paivitaKuittausTila();
      lataaKalenteri();
    });
    napit.appendChild(kuittaaNappi);

    kortti.appendChild(napit);
    lista.appendChild(kortti);
  });

  document.getElementById('kalenteri-kuittaus-overlay').style.display = 'flex';
}

document.getElementById('kalenteri-kuittaus-sulje').addEventListener('click', function() {
  document.getElementById('kalenteri-kuittaus-overlay').style.display = 'none';
});

document.getElementById('kalenteri-kuittaa-kaikki').addEventListener('click', async function() {
  if (kuittausjonoUudet.length === 0) return;
  const rivitInsert = kuittausjonoUudet.map(function(r) { return { ical_uid: r.ical_uid, user_id: currentUserId }; });
  const { error } = await db.from('kalenteri_kuittaukset').upsert(rivitInsert, { onConflict: 'ical_uid,user_id' });
  if (ilmoitaKirjoitusvirheesta(error, 'Kuittaa kaikki')) return;
  const maara = kuittausjonoUudet.length;
  document.getElementById('kalenteri-kuittaus-overlay').style.display = 'none';
  await paivitaKuittausTila();
  lataaKalenteri();
  naytaIlmoitus('Kuitattu ' + maara + ' merkintää');
});

// === OMA HYTTI ===
// Täysin yksityinen henkilökohtainen työtila — EI jakokytkintä, EI shared-
// haaraa ollenkaan, RLS suodattaa aina vain omistajan rivit (ks.
// sql/016_hytti.sql ja muistiinpanot.md "Oma Hytti" -osio).
let currentHyttiKortti = null;
let cachedHyttiKortit = [];
let cachedHyttiRivit = [];
let aktiivinenHyttiOtsikkoId = null;
let valittuHyttiTyyppi = 'jatkuva';

function hyttiLisaysInput() {
  return document.getElementById('hytti-rivi-input');
}

// Muotoilee eräpäivän "4 pv" / "tänään" / "3 pv sitten" -muotoon, aina
// muted-värillä (EI punaista edes ylittyneelle — tietoinen valinta, jotta
// tehtävälista ei näytä stressaavalta)
function hyttiErapaivaTeksti(erapaiva) {
  if (!erapaiva) return '';
  const tanaan = new Date();
  tanaan.setHours(0, 0, 0, 0);
  const paiva = new Date(erapaiva + 'T00:00:00');
  const eroPaivat = Math.round((paiva - tanaan) / 86400000);
  if (eroPaivat === 0) return 'tänään';
  if (eroPaivat > 0) return eroPaivat + ' pv';
  return Math.abs(eroPaivat) + ' pv sitten';
}

// Hakee arkistoitujen korttien määrän ja näyttää/piilottaa Arkisto-linkin
async function paivitaHyttiArkistoLinkki() {
  const linkki = document.getElementById('hytti-arkisto-linkki');
  const { count } = await db.from('hytti_kortit').select('id', { count: 'exact', head: true }).eq('status', 'arkistoitu');
  linkki.style.display = count ? 'block' : 'none';
}

// Hytin "Tänään"-kaista (2026-07-11, ICS-syötekoneisto): päivän hytti-scopen
// kalenteritapahtumat (kellonaika + nimi). Tyhjänä osio piilotetaan
// KOKONAAN, ei tyhjätilatekstiä tälle yksittäiselle lohkolle. RLS
// (kalenteri_tapahtumat_select-policy, sql/027) rajaa tuloksen jo
// automaattisesti kirjautuneen OMAAN Hyttiin — ei tarvitse suodattaa
// erikseen "onko tämä minun".
async function lataaHyttiTanaanKaista() {
  const osio = document.getElementById('hytti-tanaan-osio');
  const tanaanIso = paivamaaraISO(new Date());
  const { data, error } = await db.from('kalenteri_tapahtumat')
    .select('id, title, event_time, kalenteri_syotteet!inner(scope)')
    .eq('kalenteri_syotteet.scope', 'hytti')
    .eq('event_date', tanaanIso)
    .order('event_time', { nullsFirst: false });

  if (error) {
    console.error('Hytin tänään-kaistan haku epäonnistui:', error);
    osio.style.display = 'none';
    return;
  }
  if (!data || data.length === 0) {
    osio.style.display = 'none';
    return;
  }

  osio.style.display = 'block';
  const listEl = document.getElementById('hytti-tanaan-list');
  listEl.innerHTML = '';
  data.forEach(function(t) {
    const li = document.createElement('li');
    const aika = document.createElement('span');
    aika.className = 'hytti-tanaan-aika';
    aika.textContent = t.event_time ? t.event_time.slice(0, 5) : '';
    li.appendChild(aika);
    const teksti = document.createElement('span');
    teksti.textContent = t.title;
    li.appendChild(teksti);
    listEl.appendChild(li);
  });
}

// Piirtää yhden tehtävärivin Tehtävät-koosteeseen. Sama tietue kuin kortilla
// — täppäys tässä täppää saman rivin kortillakin, ei kopiota.
function piirraHyttiTehtavaRivi(rivi) {
  const li = document.createElement('li');

  const checkNappi = document.createElement('button');
  checkNappi.textContent = '○';
  checkNappi.className = 'check-btn';
  checkNappi.addEventListener('click', async function() {
    tuntopalauteValmis();
    const { error } = await db.from('hytti_rivit').update({ done: true, done_at: new Date().toISOString() }).eq('id', rivi.id);
    if (ilmoitaKirjoitusvirheesta(error, 'Hytti-tehtävän merkintä')) { lataaHyttiPaanakyma(); return; }
    siivoaMuistutuksetKumottavasti('hytti_rivi', rivi.id);
    lataaHyttiPaanakyma();
  });
  li.appendChild(checkNappi);

  const teksti = document.createElement('span');
  teksti.className = 'hytti-tehtava-teksti';
  teksti.textContent = rivi.content;
  li.appendChild(teksti);

  if (rivi.due_date) {
    const erapaiva = document.createElement('span');
    erapaiva.className = 'hytti-tehtava-erapaiva';
    erapaiva.textContent = hyttiErapaivaTeksti(rivi.due_date);
    li.appendChild(erapaiva);
  }

  const kortti = document.createElement('span');
  kortti.className = 'hytti-tehtava-kortti';
  kortti.textContent = rivi.hytti_kortit ? rivi.hytti_kortit.name : '';
  li.appendChild(kortti);

  const ankkurointiNappi = document.createElement('button');
  ankkurointiNappi.innerHTML = ANKKURI_SVG;
  ankkurointiNappi.className = 'anchor-btn' + (ankkuroidutAvaimet.has('hytti:' + rivi.id) ? ' active' : '');
  ankkurointiNappi.addEventListener('click', async function() {
    await vaihdaAnkkurointiYleinen('hytti', rivi.id, rivi.content, function() {});
    lataaHyttiPaanakyma();
  });
  li.appendChild(ankkurointiNappi);

  li.appendChild(luoMuistutusNappi('hytti_rivi', rivi.id, rivi.content, null, null, lataaHyttiPaanakyma));

  return li;
}

// Piirtää yhden kortin Kortit-listaukseen (nimi + seuraava askel pienellä alla)
function piirraHyttiKorttiRivi(kortti) {
  const li = document.createElement('li');
  li.className = 'hytti-kortti-rivi';
  li.dataset.tuoteId = kortti.id;
  alustaRaahaus(li, kortti, { container: document.getElementById('hytti-kortit-list'), cache: cachedHyttiKortit, taulu: 'hytti_kortit', jalkeenPaivitys: lataaLoki });
  li.addEventListener('click', function() { avaaHyttiKortti(kortti); });

  const sisalto = document.createElement('div');
  sisalto.className = 'hytti-kortti-content';

  const nimi = document.createElement('span');
  nimi.className = 'hytti-kortti-nimi';
  nimi.textContent = kortti.name;
  sisalto.appendChild(nimi);

  if (kortti.seuraava_askel) {
    const askel = document.createElement('span');
    askel.className = 'hytti-kortti-askel';
    askel.textContent = kortti.seuraava_askel;
    sisalto.appendChild(askel);
  }

  li.appendChild(sisalto);
  return li;
}

// Lataa Reitin päänäkymän: viikkoruudukko + Tehtävät-kooste + deadlinet +
// kertausjono + kurssit + sillat. Kortit-listaus ERIYTETTY omaksi Loki-
// välilehdekseen 2026-08-18 (ks. lataaLoki alla) — Tehtävät-kooste lukee
// silti hytti_rivit-taulua (kortit ovat yhä sen tallennuspaikka, vain UI:n
// koti vaihtui), joten data-malli ei muuttunut, vain latauksen jako kahteen
// funktioon jotta Reitti ei enää riipu siitä onko kortteja ollenkaan.
async function lataaHyttiPaanakyma() {
  if (raahattavaRivi) return;
  lataaReittiViikko();
  lataaReittiDeadlinet();
  lataaReittiKertausjono();
  lataaOpintoKurssit();
  lataaTaitosolmut();
  suoritaHoitotasoDiagnoosiJosAika().then(lataaHoitotasoEhdotukset);
  paivitaSiltaOdotusIlmoitus();
  naytaOdottavatSiltaEhdotukset();
  document.getElementById('huoli-pvm-input').value = opintoTanaanPvm();

  // hytti_kortit!inner pakottaa inner joinin, jolloin status-suodatus rajaa
  // myös pääkyselyn rivejä (ei vain sisäkkäistä objektia) — pelkkä .select
  // ilman !inner ei suodattaisi arkistoidun kortin tehtäviä pois listalta.
  const { data: tehtavat, error: tehtavaError } = await db.from('hytti_rivit')
    .select('*, hytti_kortit!inner(name, status)')
    .eq('hytti_kortit.status', 'aktiivinen')
    .eq('is_task', true)
    .eq('done', false)
    .order('due_date', { ascending: true, nullsFirst: false });
  if (tehtavaError) {
    console.error('Hytin tehtävien haku epäonnistui:', tehtavaError);
    return;
  }

  const tehtavatListEl = document.getElementById('hytti-tehtavat-list');
  tehtavatListEl.innerHTML = '';
  (tehtavat || []).forEach(function(rivi) { tehtavatListEl.appendChild(piirraHyttiTehtavaRivi(rivi)); });
  paivitaTehtavatMaaraajatNakyvyys();

  await paivitaAnkkuroidutAvaimet();
  await paivitaMuistutuksetKartta();
}

// Loki-välilehti (2026-08-18, §6b — Katrin pyyntö: Kortit-osio omaksi
// näkymäkseen, iOS Muistiinpanot -henkeen). Data-malli EI muuttunut
// (hytti_kortit/hytti_rivit, sama avaaHyttiKortti-yksityiskohtanäkymä jolla
// on jo otsikko, uudelleenavattavuus JA rivikohtaiset tarkistuslistat/
// väliotsikot valmiina) — vain oma välilehti + merikartta-muotokieli.
async function lataaLoki() {
  const { data: kortit, error } = await db.from('hytti_kortit').select().eq('status', 'aktiivinen').order('sort_order');
  if (error) {
    console.error('Hytin korttien haku epäonnistui:', error);
    return;
  }
  cachedHyttiKortit = kortit || [];

  const kortitOsio = document.getElementById('hytti-kortit-osio');

  if (cachedHyttiKortit.length === 0) {
    kortitOsio.style.display = 'none';
    paivitaHyttiArkistoLinkki();
    return;
  }

  kortitOsio.style.display = 'block';

  const kortitListEl = document.getElementById('hytti-kortit-list');
  kortitListEl.innerHTML = '';
  cachedHyttiKortit.forEach(function(kortti) { kortitListEl.appendChild(piirraHyttiKorttiRivi(kortti)); });

  await paivitaAnkkuroidutAvaimet();
  await paivitaMuistutuksetKartta();
  paivitaHyttiArkistoLinkki();
}

// Avaa yhden kortin näkymän (arkistoitu kortti avautuu lukutilaan)
function avaaHyttiKortti(kortti) {
  currentHyttiKortti = kortti;
  aktiivinenHyttiOtsikkoId = null;
  showHyttiKorttiView();
  lataaHyttiKortti();
}

// Laskee mihin kohtaan uusi rivi menee (aktiivisen väliotsikon alle), sama
// periaate kuin Muistilapuilla (ks. laskeLisaysJarjestys)
function laskeHyttiLisaysJarjestys() {
  if (!aktiivinenHyttiOtsikkoId) return null;
  const jarjestetyt = cachedHyttiRivit.slice().sort(function(a, b) { return a.sort_order - b.sort_order; });
  const otsikkoIndex = jarjestetyt.findIndex(function(r) { return r.id === aktiivinenHyttiOtsikkoId; });
  if (otsikkoIndex === -1) return null;
  const otsikko = jarjestetyt[otsikkoIndex];
  const seuraava = jarjestetyt[otsikkoIndex + 1];
  return seuraava ? (otsikko.sort_order + seuraava.sort_order) / 2 : otsikko.sort_order + 1;
}

function paivitaHyttiLisaysKohde() {
  const inputEl = hyttiLisaysInput();
  if (!aktiivinenHyttiOtsikkoId) {
    inputEl.placeholder = 'lisää rivi...';
    return;
  }
  const otsikko = cachedHyttiRivit.find(function(r) { return r.id === aktiivinenHyttiOtsikkoId; });
  inputEl.placeholder = otsikko ? 'lisää kohtaan ' + otsikko.content + '...' : 'lisää rivi...';
}

function valitseHyttiLisaysKohde(rivi) {
  aktiivinenHyttiOtsikkoId = (aktiivinenHyttiOtsikkoId === rivi.id) ? null : rivi.id;
  paivitaHyttiLisaysKohde();
  piirraHyttiRivit();
}

// Poistaa Hytti-rivin vahvistuksen jälkeen
async function poistaHyttiRivi(rivi) {
  const vahvistus = await naytaVahvistus('Poistetaanko ' + rivi.content + '?', null, 'Poista');
  if (!vahvistus) return;
  if (aktiivinenHyttiOtsikkoId === rivi.id) {
    aktiivinenHyttiOtsikkoId = null;
    paivitaHyttiLisaysKohde();
  }
  const { error } = await db.from('hytti_rivit').delete().eq('id', rivi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Hytti-rivin poisto')) { lataaHyttiKortti(); return; }
  siivoaMuistutuksetKumottavasti('hytti_rivi', rivi.id);
  lataaHyttiKortti();
}

// Piirtää yhden rivin korttinäkymään. Lukutilassa (arkistoitu kortti) ei
// liitetä muokkaus-/poisto-/tehtävätoimintoja, vain staattinen tila.
function piirraHyttiRivi(rivi, lukutila) {
  const li = document.createElement('li');
  li.dataset.tuoteId = rivi.id;

  if (rivi.is_header) {
    li.className = 'header-row' + (rivi.id === aktiivinenHyttiOtsikkoId ? ' active' : '');
    if (!lukutila) {
      alustaRaahaus(li, rivi, { container: document.getElementById('hytti-rivit-list'), cache: cachedHyttiRivit, taulu: 'hytti_rivit', jalkeenPaivitys: lataaHyttiKortti });
      li.addEventListener('click', function() { valitseHyttiLisaysKohde(rivi); });
    }

    const spacer = document.createElement('div');
    spacer.className = 'footer-spacer';
    li.appendChild(spacer);

    const teksti = document.createElement('span');
    teksti.textContent = rivi.content;
    li.appendChild(teksti);

    if (!lukutila) {
      const poistoNappi = document.createElement('button');
      poistoNappi.textContent = '×';
      poistoNappi.className = 'delete-btn';
      poistoNappi.addEventListener('click', function(e) { e.stopPropagation(); poistaHyttiRivi(rivi); });
      li.appendChild(poistoNappi);
    }
    return li;
  }

  if (!lukutila) {
    alustaRaahaus(li, rivi, { container: document.getElementById('hytti-rivit-list'), cache: cachedHyttiRivit, taulu: 'hytti_rivit', jalkeenPaivitys: lataaHyttiKortti });
  }

  if (rivi.is_task) {
    const checkNappi = document.createElement('button');
    checkNappi.textContent = rivi.done ? '✓' : '○';
    checkNappi.className = 'check-btn';
    if (lukutila) {
      checkNappi.disabled = true;
    } else {
      checkNappi.addEventListener('click', async function() {
        const updateData = { done: !rivi.done, done_at: !rivi.done ? new Date().toISOString() : null };
        if (updateData.done) tuntopalauteValmis();
        const { error } = await db.from('hytti_rivit').update(updateData).eq('id', rivi.id);
        ilmoitaKirjoitusvirheesta(error, 'Hytti-rivin merkintä');
        lataaHyttiKortti();
      });
    }
    li.appendChild(checkNappi);
    if (rivi.done) li.classList.add('done');
  }

  const teksti = document.createElement('span');
  teksti.textContent = rivi.content;
  li.appendChild(teksti);

  if (!lukutila) {
    teksti.addEventListener('click', function() {
      const inputti = document.createElement('input');
      inputti.type = 'text';
      inputti.value = rivi.content;
      inputti.className = 'edit-input';
      teksti.replaceWith(inputti);
      inputti.focus();
      inputti.setSelectionRange(inputti.value.length, inputti.value.length);

      async function tallenna() {
        const uusi = inputti.value.trim();
        if (uusi && uusi !== rivi.content) {
          const { error } = await db.from('hytti_rivit').update({ content: uusi }).eq('id', rivi.id);
          ilmoitaKirjoitusvirheesta(error, 'Hytti-rivin muokkaus');
        }
        lataaHyttiKortti();
      }

      inputti.addEventListener('blur', tallenna);
      inputti.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') inputti.blur();
        if (e.key === 'Escape') { inputti.value = rivi.content; inputti.blur(); }
      });
    });
  }

  if (rivi.is_task) {
    const erapaiva = document.createElement('span');
    erapaiva.className = 'hytti-rivi-erapaiva';
    erapaiva.textContent = rivi.due_date ? hyttiErapaivaTeksti(rivi.due_date) : (lukutila ? '' : '+ eräpäivä');
    if (!lukutila) {
      erapaiva.addEventListener('click', async function() {
        const syote = prompt('Eräpäivä (VVVV-KK-PP), tyhjä = ei eräpäivää:', rivi.due_date || '');
        if (syote === null) return;
        const uusiPvm = syote.trim() === '' ? null : syote.trim();
        const { error } = await db.from('hytti_rivit').update({ due_date: uusiPvm }).eq('id', rivi.id);
        ilmoitaKirjoitusvirheesta(error, 'Eräpäivän tallennus');
        lataaHyttiKortti();
      });
    }
    li.appendChild(erapaiva);
  }

  if (!lukutila) {
    const tehtavaNappi = document.createElement('button');
    tehtavaNappi.textContent = '☑';
    tehtavaNappi.className = 'anchor-btn' + (rivi.is_task ? ' active' : '');
    tehtavaNappi.title = rivi.is_task ? 'Poista tehtävämerkintä' : 'Merkitse tehtäväksi';
    tehtavaNappi.addEventListener('click', async function() {
      const uusiTila = !rivi.is_task;
      const updateData = uusiTila ? { is_task: true } : { is_task: false, done: false, done_at: null, due_date: null };
      const { error } = await db.from('hytti_rivit').update(updateData).eq('id', rivi.id);
      ilmoitaKirjoitusvirheesta(error, 'Tehtävätilan vaihto');
      lataaHyttiKortti();
    });
    li.appendChild(tehtavaNappi);

    if (rivi.is_task) {
      const muistutusAika = reminderTimeBadge('hytti_rivi', rivi.id);
      if (muistutusAika) li.appendChild(muistutusAika);
    }

    // Harvemmin tarvitut toiminnot yhden hiljaisen "⋯"-napin taakse (ks.
    // "Rivien UI-remontti" muistiinpanot.md:ssä) — sama periaate kuin
    // Muistilaput/Kauppalista/Kalenteri-riveillä.
    const menuItems = [];
    if (rivi.is_task) {
      menuItems.push({ label: '⏰ Muistutus', onClick: function() { avaaMuistutusPaneeli('hytti_rivi', rivi.id, rivi.content, null, null, lataaHyttiKortti); } });
    }
    menuItems.push({ label: 'Poista', danger: true, onClick: function() { poistaHyttiRivi(rivi); } });
    li.appendChild(createOverflowButton(li, menuItems));
  }

  return li;
}

function piirraHyttiRivit() {
  const listEl = document.getElementById('hytti-rivit-list');
  if (!listEl || raahattavaRivi) return;
  const lukutila = currentHyttiKortti.status === 'arkistoitu';
  listEl.innerHTML = '';
  cachedHyttiRivit.forEach(function(rivi) { listEl.appendChild(piirraHyttiRivi(rivi, lukutila)); });
}

// Piirtää korttinäkymän otsikon, seuraava askel -kentän ja arkistoi/palauta-napin
function piirraHyttiKorttiUI() {
  const lukutila = currentHyttiKortti.status === 'arkistoitu';
  document.getElementById('hytti-kortti-title').textContent = '✱ ' + currentHyttiKortti.name.toUpperCase() + ' ✱';
  document.getElementById('hytti-kortti-tyyppi').textContent = currentHyttiKortti.card_type === 'paattyva' ? 'Päättyvä' : 'Jatkuva';

  const suodatinEl = document.getElementById('hytti-kortti-suodatin');
  suodatinEl.textContent = 'kalenterisuodatin: ' + (currentHyttiKortti.kalenterisuodatin || '(ei asetettu)');
  suodatinEl.style.cursor = lukutila ? 'default' : 'pointer';
  suodatinEl.onclick = lukutila ? null : function() { muokkaaHyttiKalenterisuodatin(); };

  const askelEl = document.getElementById('hytti-seuraava-askel');
  askelEl.textContent = currentHyttiKortti.seuraava_askel || (lukutila ? '' : 'seuraava pieni askel...');
  askelEl.onclick = lukutila ? null : function() { muokkaaHyttiSeuraavaAskel(); };
  askelEl.style.cursor = lukutila ? 'default' : 'pointer';

  document.getElementById('hytti-rivi-add-rivi').style.display = lukutila ? 'none' : 'flex';

  // BUGIKORJAUS (2026-08-05, Katrin löytö "Hytin kortteja ei voi poistaa"):
  // arkistointinappi näkyi aiemmin VAIN card_type='paattyva'-korteille —
  // 'jatkuva'-kortit (jotka ovat oletustyyppi uutta korttia luodessa, ks.
  // hytti-tyyppi-valinta) eivät koskaan saaneet mitään poisto-/arkistointi-
  // reittiä, jäivät pysyvästi listalle. Arkistointi/palautus on jo olemassa
  // oleva, turvallinen mekanismi (status-kenttä, ei hard delete, sama
  // periaate kuin muualla Satamassa) — laajennettu koskemaan KAIKKIA
  // kortteja tyypistä riippumatta, ei vain 'paattyvä'-tyyppiä.
  const arkistoiNappi = document.getElementById('hytti-kortti-arkistoi-btn');
  arkistoiNappi.style.display = 'flex';
  if (lukutila) {
    arkistoiNappi.textContent = '↩';
    arkistoiNappi.title = 'Palauta aktiiviseksi';
    arkistoiNappi.onclick = function() { palautaHyttiKortti(); };
  } else {
    arkistoiNappi.textContent = '📦';
    arkistoiNappi.title = 'Arkistoi';
    arkistoiNappi.onclick = function() { arkistoiHyttiKortti(); };
  }
}

// Seuraava askel -kentän inline-muokkaus, sama periaate kuin listan rivin nimen muokkaus
function muokkaaHyttiSeuraavaAskel() {
  const askelEl = document.getElementById('hytti-seuraava-askel');
  const inputti = document.createElement('input');
  inputti.type = 'text';
  inputti.value = currentHyttiKortti.seuraava_askel || '';
  inputti.placeholder = 'seuraava pieni askel...';
  inputti.className = 'edit-input';
  askelEl.replaceWith(inputti);
  inputti.focus();
  inputti.setSelectionRange(inputti.value.length, inputti.value.length);

  async function tallenna() {
    const uusi = inputti.value.trim();
    if (uusi !== (currentHyttiKortti.seuraava_askel || '')) {
      const { error } = await db.from('hytti_kortit').update({ seuraava_askel: uusi || null }).eq('id', currentHyttiKortti.id);
      if (!ilmoitaKirjoitusvirheesta(error, 'Seuraavan askeleen tallennus')) {
        currentHyttiKortti.seuraava_askel = uusi || null;
      }
    }
    inputti.replaceWith(askelEl);
    piirraHyttiKorttiUI();
  }

  inputti.addEventListener('blur', tallenna);
  inputti.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') inputti.blur();
    if (e.key === 'Escape') { inputti.value = currentHyttiKortti.seuraava_askel || ''; inputti.blur(); }
  });
}

// Kalenterisuodattimen asetus (2026-07-11, "Kortin kalenteri" -osio) — kevyt
// prompt()-muokkaus, sama periaate kuin hytti-rivin eräpäivä-kentällä. Ei
// omaa inline-<input>-tekniikkaa koska tämä on harvoin muutettava asetus,
// ei jatkuvasti muokattava sisältörivi.
async function muokkaaHyttiKalenterisuodatin() {
  const syote = prompt('Kalenterisuodatin (sana joka esiintyy kortin kalenteritapahtumien otsikossa), tyhjä = pois käytöstä:', currentHyttiKortti.kalenterisuodatin || '');
  if (syote === null) return;
  const uusi = syote.trim() === '' ? null : syote.trim();
  const { error } = await db.from('hytti_kortit').update({ kalenterisuodatin: uusi }).eq('id', currentHyttiKortti.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Kalenterisuodattimen tallennus')) return;
  currentHyttiKortti.kalenterisuodatin = uusi;
  piirraHyttiKorttiUI();
  lataaHyttiKorttiKalenteri();
}

// Lataa avoinna olevan kortin rivit ja piirtää koko korttinäkymän
async function lataaHyttiKortti() {
  if (!currentHyttiKortti || raahattavaRivi) return;
  const { data, error } = await db.from('hytti_rivit').select().eq('kortti_id', currentHyttiKortti.id).order('sort_order');
  if (error) {
    console.error('Hytti-kortin rivien haku epäonnistui:', error);
    return;
  }
  cachedHyttiRivit = data || [];
  await paivitaMuistutuksetKartta();
  piirraHyttiKorttiUI();
  piirraHyttiRivit();
  lataaHyttiKorttiKalenteri();
}

// Kortin oma "Kortin kalenteri" -osio (2026-07-11, ICS-syötekoneisto):
// tulevat hytti-scopen tapahtumat joiden OTSIKKO sisältää kortin
// kalenterisuodatin-arvon (case-insensitive, ei älyä). Tyhjä suodatin TAI ei
// osumia = osio ei näy ollenkaan. Näyttää 7 päivää eteenpäin, kiinteä ikkuna.
async function lataaHyttiKorttiKalenteri() {
  const osio = document.getElementById('hytti-kortti-kalenteri-osio');
  if (!currentHyttiKortti.kalenterisuodatin) {
    osio.style.display = 'none';
    return;
  }

  const tanaanIso = paivamaaraISO(new Date());
  const loppu = new Date();
  loppu.setDate(loppu.getDate() + 7);
  const loppuIso = paivamaaraISO(loppu);

  const { data, error } = await db.from('kalenteri_tapahtumat')
    .select('id, title, event_date, event_time, kalenteri_syotteet!inner(scope)')
    .eq('kalenteri_syotteet.scope', 'hytti')
    .gte('event_date', tanaanIso)
    .lte('event_date', loppuIso)
    .ilike('title', '%' + currentHyttiKortti.kalenterisuodatin + '%')
    .order('event_date')
    .order('event_time', { nullsFirst: false });

  if (error) {
    console.error('Kortin kalenterin haku epäonnistui:', error);
    osio.style.display = 'none';
    return;
  }
  if (!data || data.length === 0) {
    osio.style.display = 'none';
    return;
  }

  osio.style.display = 'block';
  const listEl = document.getElementById('hytti-kortti-kalenteri-list');
  listEl.innerHTML = '';
  data.forEach(function(t) {
    const li = document.createElement('li');
    const pvm = new Date(t.event_date + 'T00:00:00');
    const pvmEl = document.createElement('span');
    pvmEl.className = 'hytti-kortti-kalenteri-pvm';
    pvmEl.textContent = pvm.getDate() + '.' + (pvm.getMonth() + 1) + '.' + (t.event_time ? ' klo ' + t.event_time.slice(0, 5) : '');
    li.appendChild(pvmEl);
    const teksti = document.createElement('span');
    teksti.textContent = t.title;
    li.appendChild(teksti);
    listEl.appendChild(li);
  });
}

async function arkistoiHyttiKortti() {
  const vahvistus = await naytaVahvistus('Arkistoidaanko ' + currentHyttiKortti.name + '?', null, 'Arkistoi');
  if (!vahvistus) return;
  const { error } = await db.from('hytti_kortit').update({ status: 'arkistoitu' }).eq('id', currentHyttiKortti.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Kortin arkistointi')) return;
  logEvent('archived', 'hytti_kortti', currentHyttiKortti.id, currentHyttiKortti.name, null);
  showHyttiView('loki');
  lataaLoki();
}

async function palautaHyttiKortti() {
  const { error } = await db.from('hytti_kortit').update({ status: 'aktiivinen' }).eq('id', currentHyttiKortti.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Kortin palautus')) return;
  logEvent('restored', 'hytti_kortti', currentHyttiKortti.id, currentHyttiKortti.name, null);
  currentHyttiKortti.status = 'aktiivinen';
  piirraHyttiKorttiUI();
  piirraHyttiRivit();
}

// Näyttää arkistoitujen korttien listan — napautus avaa kortin lukutilaan
async function avaaHyttiArkistoOverlay() {
  const { data, error } = await db.from('hytti_kortit').select().eq('status', 'arkistoitu').order('sort_order');
  if (error) {
    console.error('Arkiston haku epäonnistui:', error);
    return;
  }
  const lista = document.getElementById('hytti-arkisto-lista');
  lista.innerHTML = '';
  (data || []).forEach(function(kortti) {
    const li = document.createElement('li');
    li.className = 'hytti-arkisto-rivi';
    const teksti = document.createElement('span');
    teksti.textContent = kortti.name;
    li.appendChild(teksti);
    li.addEventListener('click', function() {
      document.getElementById('hytti-arkisto-overlay').style.display = 'none';
      avaaHyttiKortti(kortti);
    });
    lista.appendChild(li);
  });
  document.getElementById('hytti-arkisto-overlay').style.display = 'flex';
}

document.getElementById('hytti-back-btn').addEventListener('click', function() {
  showHomeView();
  lataaKotinakyma();
});

document.getElementById('hytti-kortti-back-btn').addEventListener('click', function() {
  showHyttiView('loki');
  lataaLoki();
});

document.querySelectorAll('.hytti-tyyppi-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    valittuHyttiTyyppi = btn.dataset.tyyppi;
    document.querySelectorAll('.hytti-tyyppi-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
  });
});

document.getElementById('hytti-uusi-btn').addEventListener('click', async function() {
  const uusiInput = document.getElementById('hytti-uusi-input');
  const nimi = uusiInput.value.trim();
  if (nimi === '') { uusiInput.focus(); return; }

  const { data, error } = await db.from('hytti_kortit').insert({ name: nimi, card_type: valittuHyttiTyyppi, owner_id: currentUserId }).select().single();
  if (ilmoitaKirjoitusvirheesta(error, 'Kortin luonti')) return;
  logEvent('created', 'hytti_kortti', data.id, nimi, null);
  uusiInput.value = '';
  lataaLoki();
});

document.getElementById('hytti-uusi-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('hytti-uusi-btn').click();
  }
});

document.getElementById('hytti-rivi-add-btn').addEventListener('click', async function() {
  const inputEl = hyttiLisaysInput();
  const raakaTeksti = inputEl.value.trim();
  if (raakaTeksti === '' || !currentHyttiKortti) { inputEl.focus(); return; }

  const onOtsikko = raakaTeksti.startsWith('#');
  const teksti = onOtsikko ? raakaTeksti.slice(1).trim() : raakaTeksti;
  if (teksti === '') { inputEl.focus(); return; }

  const kohdistettuJarjestys = laskeHyttiLisaysJarjestys();
  const uusiRivi = { content: teksti, is_header: onOtsikko, kortti_id: currentHyttiKortti.id };
  if (kohdistettuJarjestys !== null) uusiRivi.sort_order = kohdistettuJarjestys;

  const { data, error } = await db.from('hytti_rivit').insert(uusiRivi).select().single();
  if (ilmoitaKirjoitusvirheesta(error, 'Hytti-rivin lisäys')) { inputEl.focus(); return; }
  logEvent(onOtsikko ? 'created' : 'added', onOtsikko ? 'header' : 'hytti_rivi', data.id, teksti, null);
  inputEl.value = '';
  inputEl.focus();
  lataaHyttiKortti();
});

hyttiLisaysInput().addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('hytti-rivi-add-btn').click();
  }
});

document.getElementById('hytti-arkisto-linkki').addEventListener('click', avaaHyttiArkistoOverlay);
document.getElementById('hytti-arkisto-sulje').addEventListener('click', function() {
  document.getElementById('hytti-arkisto-overlay').style.display = 'none';
});

// === RUORI-KELLO (2026-08-08, uudistettu 2026-08-11 — ks. Ruori-speksi
// §0/§3) === pelkkä ympyrä, ei kehystä (ks. index.html/style.css), täyttää
// koko sille varatun tilan — pohjaympyrä r=54 lähes koko 110-yksikköisestä
// viewBoxista. Tick-viivat/numerot piirretään kerran (eivät muutu),
// viisarit päivittyvät 15s välein — kello ei tarvitse olla sekuntitarkka.
function alustaRuoriKello() {
  const viivat = document.getElementById('ruori-kello-viivat');
  const numerot = document.getElementById('ruori-kello-numerot');
  if (!viivat || !numerot || viivat.childElementCount > 0) return;
  const svgNs = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 60; i++) {
    const kulma = i * 6 * Math.PI / 180, iso = i % 5 === 0;
    const r1 = iso ? 44 : 48, r2 = 52.5;
    const viiva = document.createElementNS(svgNs, 'line');
    viiva.setAttribute('x1', 55 + r1 * Math.sin(kulma));
    viiva.setAttribute('y1', 55 - r1 * Math.cos(kulma));
    viiva.setAttribute('x2', 55 + r2 * Math.sin(kulma));
    viiva.setAttribute('y2', 55 - r2 * Math.cos(kulma));
    viiva.setAttribute('stroke', '#221F1A');
    viiva.setAttribute('stroke-width', iso ? 1.4 : .7);
    viiva.setAttribute('opacity', iso ? 0.9 : 0.4);
    viivat.appendChild(viiva);
  }
  // Kaikki 12 tuntinumeroa samalla painolla/koolla (2026-08-08, Katrin
  // korjaus alkuperäiseen "vain 12/3/6/9" -versioon) — ei himmennettyjä
  // välinumeroita, kello luettava yhdellä vilkaisulla. Säde 38 (2026-08-11,
  // suurennettu ympyrän r=54:n mukana) pitää numerot selvästi tick-viivojen
  // sisäpuolella mutta silti isoina.
  [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(function(h) {
    const kulma = (h % 12) * 30 * Math.PI / 180;
    const teksti = document.createElementNS(svgNs, 'text');
    teksti.setAttribute('x', 55 + 38 * Math.sin(kulma));
    teksti.setAttribute('y', 55 - 38 * Math.cos(kulma));
    teksti.textContent = h;
    numerot.appendChild(teksti);
  });
}

function paivitaRuoriKello() {
  const tuntiviisari = document.getElementById('ruori-tuntiviisari');
  const minuuttiviisari = document.getElementById('ruori-minuuttiviisari');
  if (!tuntiviisari || !minuuttiviisari) return;
  const nyt = new Date(), h = nyt.getHours() % 12, m = nyt.getMinutes();
  const ha = (h + m / 60) * 30 * Math.PI / 180, ma = m * 6 * Math.PI / 180;
  tuntiviisari.setAttribute('x2', 55 + 27 * Math.sin(ha));
  tuntiviisari.setAttribute('y2', 55 - 27 * Math.cos(ha));
  minuuttiviisari.setAttribute('x2', 55 + 40 * Math.sin(ma));
  minuuttiviisari.setAttribute('y2', 55 - 40 * Math.cos(ma));
}

alustaRuoriKello();
paivitaRuoriKello();
setInterval(paivitaRuoriKello, 15000);

// === RUORI: KUORMITUSTILA (2026-08-08) === manuaalinen "olen ylikuormittunut,
// piilota Ankkurit ja Hytti" -kytkin, ks. satama-ruori.html. Puhtaasti
// paikallinen (localStorage) tila — EI Supabase-riviä, koska tämä on
// hetkellinen näkymäsuodatin eikä jaettua/pysyvää dataa muille laitteille.
const RUORI_KUORMITUSTILA_AVAIN = 'ruori_kuormitustila';
let ruoriHyttiOnData = false;

function ruoriKuormitustilaPaalla() {
  return localStorage.getItem(RUORI_KUORMITUSTILA_AVAIN) === '1';
}

// Yhdistää kuormitustilan JA segmentin oman datan saatavuuden yhdeksi
// näkyvyyspäätökseksi Hytille (Ankkurit näkyy aina paitsi kuormitustilassa,
// koska sillä ei ole omaa "ei dataa" -tyhjää tilaa tällä sivulla).
function paivitaRuoriNakyvyys() {
  const paalla = ruoriKuormitustilaPaalla();
  const kytkin = document.getElementById('kuormanappi');
  const rauha = document.getElementById('rauha-osio');
  const ankkuritSegmentti = document.querySelector('#home-view .segmentti.ankkurit');
  const hyttiSegmentti = document.getElementById('ruori-hytti-segmentti');
  if (kytkin) kytkin.classList.toggle('paalla', paalla);
  if (rauha) rauha.style.display = paalla ? 'block' : 'none';
  if (ankkuritSegmentti) ankkuritSegmentti.style.display = paalla ? 'none' : 'block';
  if (hyttiSegmentti) hyttiSegmentti.style.display = (!paalla && ruoriHyttiOnData) ? 'block' : 'none';
}

document.getElementById('kuormanappi').addEventListener('click', function() {
  localStorage.setItem(RUORI_KUORMITUSTILA_AVAIN, ruoriKuormitustilaPaalla() ? '0' : '1');
  paivitaRuoriNakyvyys();
});

// Siltasolmujen oma kuvake (2026-08-16, Katrin väripalettihuomio jatkui —
// "miksi puhelin kun puhutaan sillasta": emoji 🌉 ei renderöidy tunnistettavana
// pienessä koossa. Yksinkertainen silta-pikstogrammi (kansi + kolme pilaria +
// vesiraja), currentColor-yhteensopiva kuten SAA_IKONIT alla, ei emoji.
const SILTA_IKONI_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9h20"/><path d="M5 9v11M12 9v11M19 9v11"/><path d="M2 20h20"/></svg>';
document.querySelectorAll('.silta-ikoni').forEach(function(el) { el.innerHTML = SILTA_IKONI_SVG; });

// === RUORI: SÄÄ-SEGMENTTI (2026-08-11, Ruori-speksi §2) === Open-Meteo
// api/saa.js:n kautta (palvelin välimuistittaa 30 min, ei suoraa selainkutsua
// — ks. api/saa.js:n kommentti). Piilottaa koko segmentin virhetilanteessa:
// "vanhan datan näyttäminen tuoreena on pahempi virhe kuin sään puuttuminen"
// (§2.2) — paketin mahdollista vanha_data-varakenttää ei koskaan renderöidä
// täältä tuoreena datana.
// Yhdistetyt "virallisen näköiset" säämerkit (2026-08-18, Katrin palaute:
// aiempi versio piirsi 2-3 ERILLISTÄ pientä kuvaketta rinnakkain samaan
// soluun — esim. aurinko+pilvi+pisara omina 15px-merkkeinään — mikä ei
// näyttänyt keneltäkään tunnetulta säämerkiltä, vain sekavalta pikselikasalta.
// Jokainen WMO-koodiryhmä saa nyt YHDEN koostetun kuvakkeen samassa
// 24x24-viewBoxissa (aurinko pilven takaa kurkistaen, pilvi+viiva-sade,
// pilvi+hiutale, pilvi+salama) — sama rakenne kuin tunnetuilla sääpalveluilla
// (yr.no, Apple Sää, Ilmatieteenlaitos), ei enää oma sommittelu.
// Värit "virallisten" säämerkkien tapaan (2026-08-18, Katrin palaute:
// aiempi versio oli tasan yksivärinen currentColor-ääriviiva joka ei
// näyttänyt oikealta säämerkiltä — oikeat sääpalvelut käyttävät aina väriä,
// aurinko keltainen/kultainen, pilvi harmaa, sade/lumi sininen, salama
// meripihka). CSS-muuttujina (ei kiinteitä hex-arvoja) jotta tumma teema
// mukautuu automaattisesti kuten muukin sovellus — ei uusia värejä, samat
// jaetut tokenit kuin muualla.
const SAA_VARI_AURINKO = 'var(--sinappi)';
const SAA_VARI_PILVI = 'var(--vaimea)';
const SAA_VARI_SADE = 'var(--syvanne)';
const SAA_VARI_SALAMA = 'var(--huomio)';
const SAA_IKONIT = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="' + SAA_VARI_AURINKO + '" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.6" fill="' + SAA_VARI_AURINKO + '" fill-opacity=".18"/><path d="M12 1.5v2.4M12 20.1v2.4M4.5 4.5l1.7 1.7M17.8 17.8l1.7 1.7M1.5 12h2.4M20.1 12h2.4M4.5 19.5l1.7-1.7M17.8 6.2l1.7-1.7"/></svg>',
  cloud: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 19a4.5 4.5 0 0 1-.4-8.98A5.5 5.5 0 0 1 16.8 9.1 4 4 0 0 1 16.5 19h-10z"/></svg>',
  partlycloudy: '<svg viewBox="0 0 24 24"><g fill="' + SAA_VARI_AURINKO + '" fill-opacity=".18" stroke="' + SAA_VARI_AURINKO + '" stroke-width="1.8" stroke-linecap="round"><circle cx="16.2" cy="7.3" r="3"/><path d="M16.2 1.8v1.6M21.4 4.1l-1.2 1.2M23 7.3h-1.6M19.4 11l-1.3-1.3" fill="none"/></g><path fill="' + SAA_VARI_PILVI + '" d="M6.5 19a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 9.4 3.8 3.8 0 0 1 15.6 19H6.5z"/></svg>',
  fog: '<svg viewBox="0 0 24 24" stroke="' + SAA_VARI_PILVI + '" stroke-width="2" stroke-linecap="round" fill="none"><path d="M3 7.5h18M3 12h18M3 16.5h13"/></svg>',
  drizzle: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 16a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 6.4 3.8 3.8 0 0 1 15.6 16H6.5z"/><g stroke="' + SAA_VARI_SADE + '" stroke-width="1.8" stroke-linecap="round"><path d="M8.5 19.5v1.7M13.5 19.5v1.7"/></g></svg>',
  rain: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 15a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 5.4 3.8 3.8 0 0 1 15.6 15H6.5z"/><g stroke="' + SAA_VARI_SADE + '" stroke-width="1.8" stroke-linecap="round"><path d="M7.5 18l-1.2 3.2M12 18l-1.2 3.2M16.5 18l-1.2 3.2"/></g></svg>',
  rainshower: '<svg viewBox="0 0 24 24"><g fill="' + SAA_VARI_AURINKO + '" fill-opacity=".18" stroke="' + SAA_VARI_AURINKO + '" stroke-width="1.8" stroke-linecap="round"><circle cx="16.2" cy="6.8" r="2.6"/><path d="M16.2 1.9v1.4M20.7 3.9l-1.1 1.1M22.1 6.8h-1.4M18.9 10.1l-1.2-1.2" fill="none"/></g><path fill="' + SAA_VARI_PILVI + '" d="M6 16a4.1 4.1 0 0 1-.4-8.18A5.1 5.1 0 0 1 15.1 6.3 3.6 3.6 0 0 1 14.8 16H6z"/><g stroke="' + SAA_VARI_SADE + '" stroke-width="1.8" stroke-linecap="round"><path d="M8 19l-1 2.7M14 19l-1 2.7"/></g></svg>',
  snow: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 15a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 5.4 3.8 3.8 0 0 1 15.6 15H6.5z"/><g stroke="' + SAA_VARI_SADE + '" stroke-width="1.6" stroke-linecap="round"><path d="M8 18.2v3.4M6.5 20l3-1.8M6.5 18.2l3 1.8M15 18.2v3.4M13.5 20l3-1.8M13.5 18.2l3 1.8"/></g></svg>',
  thunder: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 14a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 4.4 3.8 3.8 0 0 1 15.6 14H6.5z"/><path fill="' + SAA_VARI_SALAMA + '" d="M13.5 12.5l-5 6.5h3.3l-.6 4.3 5-6.8h-3.3l.6-4z"/></svg>',
  // Tuuli (2026-08-11, Katrin pyyntö) — ei omaa leimasinta eikä numeroa,
  // vain kuvake sääkuvakkeen vierellä sinä tuntina kun tuulee. "tuuli" on
  // ohut kaksirivinen versio, "tuuliKova" paksumpi + väritetty --vaara:lla
  // (span-wrapperin kautta) jotta tosi kova tuuli erottuu MYÖS muodosta,
  // ei vain väristä.
  tuuli: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 9h12.5a2.8 2.8 0 1 0-2.3-4.4"/><path d="M3 15h15a2.8 2.8 0 1 1-2.3 4.4"/></svg>',
  tuuliKova: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M2 7h13a3.2 3.2 0 1 0-2.6-5"/><path d="M2 12.5h18"/><path d="M2 18h14a3.2 3.2 0 1 1-2.6 5"/></svg>',
};
const TUULI_KYNNYS = 30;
const TUULI_KOVA_KYNNYS = 50;
// Tuulikuvake sääkuvakkeen viereen sille tunnille jona tuulee (ei numero,
// ei omaa leimasinta) — normaali versio kynnyksen ylittyessä, paksumpi ja
// --vaara-punainen versio kun tuuli on tosi kova.
function saaTuuliIkoni(nopeus) {
  if (typeof nopeus !== 'number') return '';
  if (nopeus >= TUULI_KOVA_KYNNYS) return '<span style="color:var(--vaara)">' + SAA_IKONIT.tuuliKova + '</span>';
  if (nopeus >= TUULI_KYNNYS) return SAA_IKONIT.tuuli;
  return '';
}

// WMO-säätunnus -> YKSI koostettu kuvake (Ruori-speksi §2.3, uudistettu
// 2026-08-18). Aiemmin tämä palautti 1-3 erillistä kuvakeavainta jotka
// aseteltiin rinnakkain — nyt jokainen WMO-ryhmä vastaa suoraan yhtä
// SAA_IKONIT-avainta, koska yhdistelmä on jo piirretty kuvakkeen sisään.
function saaIkoniAvainKoodille(koodi) {
  if (koodi === 0) return 'sun';
  if (koodi === 1 || koodi === 2) return 'partlycloudy';
  if (koodi === 3) return 'cloud';
  if (koodi === 45 || koodi === 48) return 'fog';
  if (koodi >= 51 && koodi <= 57) return 'drizzle';
  if (koodi >= 61 && koodi <= 67) return 'rain';
  if ((koodi >= 71 && koodi <= 77) || (koodi >= 85 && koodi <= 86)) return 'snow';
  if (koodi >= 80 && koodi <= 82) return 'rainshower';
  if (koodi >= 95 && koodi <= 99) return 'thunder';
  return 'cloud';
}
// Sadetodennäköisyyden kynnys — 19 -> 20 (2026-08-18, Katrin pyyntö: "if
// there is 20% or more propability of rain mark it") — sama kynnys sekä
// sadeprosentin näyttämiselle tuntiriveillä ETTÄ ikonin pudotukselle
// sadekuvakkeesta pilviseen vastineeseen alla (2026-08-11, elävä testaus:
// koodi voi teknisesti tarkoittaa "tihkua" mutta jos todennäköisyys on
// silti pieni tälle nimenomaiselle tunnille, sadekuvake harhaanjohtaa) —
// YKSI kynnys, ei kaksi hieman eri arvoa. Aurinkoiset sadekuvakkeet
// (rainshower) tippuvat kirkkaan-pilvisen (partlycloudy) puolelle,
// lumi/ukkonen tavalliseen pilveen — ei koskaan jää sadetta kuvaavaksi
// ilman riittävää todennäköisyyttä.
const SAA_SADE_KYNNYS = 20;
const SAA_SADEIKONI_LASKEUTUU = { drizzle: 'cloud', rain: 'cloud', snow: 'cloud', thunder: 'cloud', rainshower: 'partlycloudy' };
function saaIkoniHtml(koodi, sade) {
  let avain = saaIkoniAvainKoodille(koodi);
  if (typeof sade === 'number' && sade < SAA_SADE_KYNNYS && SAA_SADEIKONI_LASKEUTUU[avain]) {
    avain = SAA_SADEIKONI_LASKEUTUU[avain];
  }
  return SAA_IKONIT[avain];
}
function pyoristaKymmeneen(n) { return Math.round(n / 10) * 10; }

// SATAMA_SPEKSI.md §16.5c kohta 4 (2026-08-16): "näytä viimeisin tunnettu
// arvo yhteyskatkolla, piilota vain jos ei koskaan ollut arvoa TAI
// edellisenkin hakeminen epäonnistui" — sietää YHDEN ohimenevän
// verkkokatkon näyttämällä vanhaa dataa tuoreena hetken, mutta kaksi
// peräkkäistä epäonnistumista piilottaa (data on silloin liian vanhaa
// luotettavaksi). Ei ristiriidassa Ruori-speksin (§15.2) alkuperäisen
// "vanhan datan näyttäminen tuoreena on pahempi kuin sään puuttuminen"
// -periaatteen kanssa, koska KAHDEN peräkkäisen epäonnistumisen jälkeen
// piilotus tapahtuu edelleen — vain YHDEN katkon sieto on uutta.
let saaOnKoskaanOnnistunut = false;
let saaEdellinenOnnistui = true;

async function lataaRuoriSaa() {
  const segmentti = document.getElementById('ruori-saa-segmentti');
  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    if (!token) throw new Error('Ei kirjautunut');
    const vastaus = await fetch('/api/saa', { headers: { Authorization: 'Bearer ' + token } });
    const paketti = await vastaus.json();
    if (!vastaus.ok || !paketti.data) throw new Error(paketti.error || 'Säädatan haku epäonnistui');

    const saa = paketti.data;
    const tunnit = saa.hourly.time;

    // Koko päivä klo 1-23 (2026-08-11, Katrin pyyntö), ei enää vain
    // seuraavat muutama tunti. Merkkijonovertailu, ei new Date(t) — Open-
    // Meteon paikallisaikaleimat ("2026-08-11T14:00") eivät sisällä
    // aikavyöhykettä, ja new Date() tulkitsisi ne selaimen omalla
    // paikallisajalla, mikä on hauras jos se joskus poikkeaa Suomen ajasta.
    const tanaanIso = paivamaaraISO(new Date());
    const nytTunti = new Date().getHours();
    const nakyvat = [];
    let nykyIdx = -1;
    tunnit.forEach(function(t, i) {
      if (t.slice(0, 10) !== tanaanIso) return;
      const tunti = parseInt(t.slice(11, 13), 10);
      if (tunti < 1 || tunti > 23) return;
      if (tunti === nytTunti) nykyIdx = nakyvat.length;
      nakyvat.push(i);
    });
    if (nakyvat.length === 0) throw new Error('Ei tunteja näytettäväksi');
    const nykyAnkkuri = Math.max(nykyIdx, 0);

    const nykyinenLampo = saa.current && typeof saa.current.apparent_temperature === 'number'
      ? saa.current.apparent_temperature
      : saa.hourly.apparent_temperature[nakyvat[nykyAnkkuri]];
    document.getElementById('ruori-saa-lampo').textContent = Math.round(nykyinenLampo) + '°';

    const maxSadeTod = nakyvat.slice(nykyAnkkuri, nykyAnkkuri + 4).reduce(function(max, i) {
      return Math.max(max, saa.hourly.precipitation_probability[i] || 0);
    }, 0);
    const tagit = [];
    if (maxSadeTod >= 40) tagit.push('Sateenvarjo');
    if (nykyinenLampo <= 0) tagit.push('Hattu');
    if (nykyinenLampo >= 25) tagit.push('Aurinkolasit');
    // Tuuli EI ole tässä leimana eikä numerona (Katrin pyyntö) — ks.
    // saaTuuliIkoni() tuntirivin renderöinnissä alempana, kuvake sään
    // vierellä sinä tuntina jona tuulee.
    const tagitEl = document.getElementById('ruori-saa-tagit');
    tagitEl.innerHTML = '';
    tagit.forEach(function(teksti, i) {
      const span = document.createElement('span');
      span.className = 'saa-tagi';
      span.textContent = teksti;
      span.style.transform = 'rotate(' + (-4 + i * 3.5) + 'deg)';
      tagitEl.appendChild(span);
    });

    const tunnitEl = document.getElementById('ruori-saa-tunnit');
    tunnitEl.innerHTML = nakyvat.map(function(i, idx) {
      const sade = saa.hourly.precipitation_probability[i];
      const tuuli = saa.hourly.wind_speed_10m ? saa.hourly.wind_speed_10m[i] : undefined;
      // Tuntukohtainen "tuntuu kuin" -lukema (2026-08-18, Katrin pyyntö) —
      // sama apparent_temperature-sarja jota jo käytetään yläosan isolle
      // lukemalle, nyt myös jokaisella tunnilla erikseen, ei vain nyt-hetkellä.
      const tuntuu = saa.hourly.apparent_temperature ? saa.hourly.apparent_temperature[i] : undefined;
      return '<div class="saa-tunti' + (idx === nykyIdx ? ' saa-tunti-nyt' : '') + '">'
        + '<span class="saa-tunti-aika">' + tunnit[i].slice(11, 13) + '</span>'
        + '<span class="saa-tunti-ikoni">' + saaIkoniHtml(saa.hourly.weather_code[i], sade) + saaTuuliIkoni(tuuli) + '</span>'
        + '<span class="saa-tunti-lampo">' + (typeof tuntuu === 'number' ? Math.round(tuntuu) + '°' : '') + '</span>'
        + '<span class="saa-tunti-sade">' + (sade >= SAA_SADE_KYNNYS ? pyoristaKymmeneen(sade) + '%' : '') + '</span>'
        + '</div>';
    }).join('');
    if (nykyIdx >= 0) {
      const nykySolu = tunnitEl.children[nykyIdx];
      if (nykySolu) nykySolu.scrollIntoView({ inline: 'center', block: 'nearest' });
    }

    segmentti.style.display = 'block';
    saaOnKoskaanOnnistunut = true;
    saaEdellinenOnnistui = true;
  } catch (e) {
    console.error('Ruorin säädatan haku epäonnistui:', e.message);
    if (saaOnKoskaanOnnistunut && saaEdellinenOnnistui) {
      // Ensimmäinen ohimenevä katko onnistuneen datan jälkeen — jätetään
      // vanha, jo näytössä oleva data näkyviin sellaisenaan, ei piilotusta.
      saaEdellinenOnnistui = false;
    } else {
      segmentti.style.display = 'none';
    }
  }
}

// === RUORI: KALENTERI-SEGMENTTI (2026-08-08) === tämän päivän ensimmäinen
// tapahtuma + ristiriita/huolilippu-tila, ks. satama-ruori.html. Käyttää
// TÄSMÄLLEEN samoja ristiriita-/huolilaskentafunktioita kuin oikea
// Kalenteri-näkymä (paivanRistiriitaTila, computeVisibleDaySignals) — ei
// omaa, eriytyvää päättelyä samasta asiasta. Napautus vie oikeaan
// päivänäkymään, sama reitti kuin alapalkin Kalenteri-kuvakkeella.
async function lataaRuoriKalenteri() {
  const tanaanIso = paivamaaraISO(new Date());
  const puskuriAlku = new Date();
  puskuriAlku.setDate(puskuriAlku.getDate() - MONIPAIVAINEN_PUSKURI_PV);

  const segmentti = document.getElementById('ruori-kalenteri-segmentti');
  const tyhja = document.getElementById('ruori-kalenteri-tyhja');

  const { data: haetut, error } = await db.from('kalenteri_tapahtumat')
    .select('*, kalenteri_syotteet(vari, henkilo, scope)')
    .gte('event_date', paivamaaraISO(puskuriAlku))
    .lte('event_date', tanaanIso)
    .order('event_time', { nullsFirst: false });

  if (error) {
    console.error('Ruorin kalenterikatsauksen haku epäonnistui:', error);
    segmentti.style.display = 'none';
    tyhja.style.display = 'none';
    return;
  }

  const rivit = (haetut || [])
    .map(function(t) {
      return Object.assign({}, t, {
        _henkilo: t.kalenteri_syotteet ? t.kalenteri_syotteet.henkilo : null,
        _scope: t.kalenteri_syotteet ? t.kalenteri_syotteet.scope : null,
      });
    })
    .filter(function(t) { return tapahtumaKattaaPaivan(t, tanaanIso); });

  if (rivit.length === 0) {
    segmentti.style.display = 'none';
    tyhja.style.display = 'block';
    return;
  }
  const jarjestetyt = jarjestaAjanMukaan(rivit.slice());
  // "Mitä seuraavaksi", ei "päivän ensimmäinen koko päivän" (2026-08-18,
  // Katrin palaute) — aiemmin tämä näytti aina jarjestetyt[0]:n, eli päivän
  // ENSIMMÄISEN tapahtuman kellonajasta riippumatta, koko loppupäivän
  // vaikka se olisi jo ohi. Pudotetaan pois tapahtumat joiden päättymisaika
  // (event_end_time, tai oletus event_time+60min jos ei tiedossa — sama
  // käytäntö kuin muualla kalenterikoodissa, ks. esim. kalenteri-kuukausi-
  // palkkien layout) on jo mennyt. Koko päivän tapahtuma (ei event_time)
  // pysyy aina relevanttina — jarjestaAjanMukaan lajittelee ne viimeisiksi,
  // joten ne nousevat "seuraavaksi" vain kun mikään ajallinen ei enää ole
  // kesken, mikä on oikea käytös.
  const nytMin = new Date().getHours() * 60 + new Date().getMinutes();
  const seuraavat = jarjestetyt.filter(function(t) {
    if (!t.event_time) return true;
    const loppuMin = t.event_end_time ? aikaMinuutteina(t.event_end_time) : aikaMinuutteina(t.event_time) + 60;
    return loppuMin >= nytMin;
  });
  if (seuraavat.length === 0) {
    segmentti.style.display = 'none';
    tyhja.style.display = 'none';
    return;
  }
  tyhja.style.display = 'none';
  segmentti.style.display = 'block';
  segmentti.onclick = function() { avaaOsio({ route: 'kalenteri' }); };

  const eka = seuraavat[0];
  document.getElementById('ruori-kal-aika').textContent = eka.event_time ? eka.event_time.slice(0, 5) : 'Koko päivä';
  document.getElementById('ruori-kal-lisaa').textContent = seuraavat.length > 1
    ? (eka.title + ' + ' + (seuraavat.length - 1) + ' muuta')
    : eka.title;

  const henkselit = await fetchVisibleHenkselit(tanaanIso, tanaanIso);
  const ristiriita = paivanRistiriitaTila(rivit, tanaanIso, henkselit);
  const signaalit = await computeVisibleDaySignals(rivit, [tanaanIso]);
  const onHuoli = signaalit.huoliIsot.has(tanaanIso);

  const lippu = document.getElementById('ruori-kal-lippu');
  const tagi = document.getElementById('ruori-kal-tagi');
  const syy = document.getElementById('ruori-kal-lippu-syy');
  if (ristiriita.onRistiriita) {
    lippu.style.display = 'block';
    tagi.textContent = '⚠️ RISTIRIITA';
    tagi.classList.add('tagi-ristiriita');
    const nimet = rivit.filter(function(t) { return ristiriita.fullIds.indexOf(t.id) !== -1; }).map(function(t) { return t.title; });
    syy.textContent = nimet.length ? (nimet.join(' · ') + ' menevät päällekkäin') : 'Kaksi menoa päällekkäin tänään';
  } else if (onHuoli) {
    lippu.style.display = 'block';
    tagi.textContent = '🟠 HUOLI';
    tagi.classList.remove('tagi-ristiriita');
    syy.textContent = 'Tälle päivälle on merkitty huolilippu.';
  } else {
    lippu.style.display = 'none';
  }
}

// === RUORI: HYTTI-SEGMENTTI (2026-08-08) === tämän päivän ensimmäinen
// "tarjolla"-tilainen PACER-askel, ks. satama-ruori.html. LUKEE VAIN jo
// olemassa olevia opinto_paivan_askeleet-rivejä (sama kysely kuin
// lataaOpintoPaivanAskeleet(), mutta ilman sen laskenta/insert-sivuvaikutusta)
// — jos päivän askelia ei ole vielä laskettu (Hytti-näkymää ei ole avattu
// tänään), segmentti piiloutuu kuten muutkin tyhjät Ruori-segmentit, EIKÄ
// laukaise laskentaa itse home-sivulta käsin. Ei näytä kellonaikaa: PACER-
// askelilla ei ole kellonaikaa, mockupin "10:15" olisi tässä keksittyä dataa.
async function lataaRuoriHytti() {
  ruoriHyttiOnData = false;
  if (!currentUserId) { paivitaRuoriNakyvyys(); return; }
  const tanaan = opintoTanaanPvm();
  const { data, error } = await db.from('opinto_paivan_askeleet')
    .select('*, opinto_aiheet(*, opinto_kurssit(name)), taitosolmut(*)')
    .eq('owner_id', currentUserId).eq('pvm', tanaan).eq('tila', 'tarjolla')
    .order('created_at').limit(1);

  if (error) {
    console.error('Ruorin Hytti-katsauksen haku epäonnistui:', error);
    paivitaRuoriNakyvyys();
    return;
  }

  const askel = (data || [])[0];
  const kohde = askel && (askel.opinto_aiheet || askel.taitosolmut);
  if (!kohde) { paivitaRuoriNakyvyys(); return; }

  const alaotsikko = askel.opinto_aiheet
    ? (kohde.opinto_kurssit ? kohde.opinto_kurssit.name : '')
    : (kohde.lahde || '');
  document.getElementById('ruori-hytti-kurssi').textContent = alaotsikko;
  document.getElementById('ruori-hytti-aihe').textContent = kohde.name;
  document.getElementById('ruori-hytti-vaihe').textContent = OPINTO_VAIHE_NIMET[kohdeVaihe(kohde)];
  const seuraava = seuraavaOpintoVaiheKuvaus(kohde);
  document.getElementById('ruori-hytti-vihje').textContent = seuraava
    ? ('Ehdotus: "✓ Tehty" siirtää vaiheeseen "' + seuraava + '".')
    : 'Tämä aihe on jo hallussa.';
  document.getElementById('ruori-hytti-segmentti').onclick = function() { avaaOsio({ route: 'hytti' }); };

  ruoriHyttiOnData = true;
  paivitaRuoriNakyvyys();
}

let cachedAnkkurit = [];
let ankkuritKaikkiNakyvissa = false;

// Ankkurikuvake (2026-08-11 korjattu, elävä testaus §2) — ENSIMMÄINEN
// versio (Ruori-speksi §4.1, sama päivä) korvasi ⚓-emojin käsinpiirretyllä
// SVG-polulla, koska emoji-fontti ei noudata CSS:n color/currentColor-
// ohjausta (eri alustoilla ⚓ renderöityi eri väreissä). Katri havaitsi live-
// testissä että tämä MYÖS muutti muodon, ei vain väriä — alkuperäinen ⚓ oli
// hänen mukaansa "Sataman sielu", sama tavalla kuin fontti. Katrin oma
// diagnoosi ja korjausjärjestys: kokeile ENSIN värin pakottamista natiiviin
// ⚓-glyfiin CSS-suotimella ennen kuin muoto vaihdetaan mihinkään muuhun.
// `filter: grayscale(1)` toimii CSS-suotimena myös väri-emoji-fontteihin
// (se operoi rasteroituun kuvaan, ei tekstin color-ominaisuuteen — eri
// mekanismi kuin currentColor, joka ei toiminut), joten sama alkuperäinen
// muoto säilyy JA väri saadaan hallintaan. Toteutettu SVG:n SISÄLLÄ
// (<text>-elementtinä path:ien sijaan) jotta olemassa olevat kokosäännöt
// (esim. .anchor-btn svg { width/height }) toimivat edelleen sellaisenaan
// kaikkialla missä ANKKURI_SVG:tä käytetään (~10 kutsupaikkaa), ei
// vaadi yhdenkään niistä koskemista.
// EI VIELÄ TESTATTU oikealla iOS Safarilla/Androidilla (Katrin oma pyyntö,
// §2) — jos grayscale(1) ei riitä jollain alustalla, seuraava askel on
// contrast()/brightness() -lisäys tähän samaan filter-arvoon, EI paluu
// käsinpiirrettyyn SVG-polkuun (se muutti muotoa, mikä oli alkuperäinen
// valitus).
const ANKKURI_SVG = '<svg viewBox="0 0 24 24"><text x="12" y="12.5" font-size="19" text-anchor="middle" dominant-baseline="central" style="filter:grayscale(1)">⚓</text></svg>';

// Auto-kasvava korkeus ankkurin textarea-kentille (2026-08-11, elävä
// testaus §1.4) — nollataan ensin 'auto' jotta scrollHeight mittaa oikean
// sisällön (muuten se jää edellisen, korkeamman arvon vangiksi kun tekstiä
// poistetaan).
function kasvataTextareaaSisallon(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// Ankkurin ⋯-valikon kuvakkeet (§4.4) — Sataman sävyissä (muste/messinki/
// paperi), ei alustan emoji-fontin varassa.
const ANKKURI_MENU_IKONIT = {
  halytys: '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><circle cx="10" cy="11" r="6" stroke="var(--muste)" stroke-width="1.4"/><path d="M10 8v3l2 1.6" stroke="var(--muste)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.3 5.3L3.3 3.3M14.7 5.3l2-2" stroke="var(--muste)" stroke-width="1.3" stroke-linecap="round"/></svg>',
  siirra: '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M2.5 4.5v11l6-5.5z" fill="var(--muste)"/><path d="M10.5 4.5v11l6-5.5z" fill="var(--muste)"/></svg>',
  ehdota: '<svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M3 4.5h14a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H9.5l-4 3.2V14H3a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z" fill="#fff" stroke="var(--muste)" stroke-width="1.3" stroke-linejoin="round"/></svg>',
};

// Hakee päivän tärkeimmät tekemättömät ankkurit järjestyksessä — VAIN
// kirjautuneen OMAT (ankkurit henkilökohtaisiksi 2026-07-11, ks.
// sql/029_ankkurit_henkilokohtaiset.sql). Oletuksena vain 3 näkyy (loput
// piilossa "+ N muuta" -linkin takana), mutta käyttäjä voi laajentaa
// näkymän nähdäkseen ja priorisoidakseen kaikki raahaamalla. Kun yksi
// merkitään tehdyksi, seuraava nousee automaattisesti näkyviin koska
// kysely suodattaa done=false — ei tarvita erillistä "ylennyslogiikkaa".
// Ankkuriarkkitehtuuri "jokaisella ankkurilla on koti" (2026-07-14, ks.
// muistiinpanot.md): `ankkurit.source` ja `muistutukset.source` käyttävät
// ERI sanastoa SAMALLE kohteelle (esim. Muistilaput-rivi on ankkurissa
// 'muistilaput' mutta rivin OMA ⏰-nappi käyttää muistutuksissa 'rivi') —
// tämä kartta kääntää ankkurin kotilähteen sen kotitaulun OMAAN
// muistutus-sanastoon, jotta ankkurin ⏰:llä asetettu muistutus voidaan
// siirtää kotiin laskun yhteydessä sen sijaan että se katoaisi.
// 'etusivu' lisätty (2026-08-11, CODE_vaihe1b.md §8b) — ks. loki_merkinnat-
// kirjoitus irrotaNappi-käsittelijässä alempana. Muistutus säilyy tietona
// tietokannassa vaikka Lokilla ei vielä ole omaa näkymää (Vaihe 5) — se
// vain ei näytä "löytyy X:stä" -badgea missään ennen kuin Loki rakennetaan,
// samalla tavalla kuin mikä tahansa muu toistaiseksi näkymätön taulu.
const ANKKURI_KOTI_MUISTUTUS_LAHDE = { muistilaput: 'rivi', hytti: 'hytti_rivi', aly: 'laituri', etusivu: 'loki_merkinnat' };
function ankkurinKotiMuistutusLahde(ankkuri) {
  return ANKKURI_KOTI_MUISTUTUS_LAHDE[ankkuri.source] || ankkuri.source;
}
const ANKKURI_KOTI_NIMI = { muistilaput: 'Muistilapuista', kalenteri: 'Kalenterista', hytti: 'Hytistä', laituri: 'Laiturista', aly: 'Laiturista', etusivu: 'Lokista' };

// "Siirrä myöhemmäksi" (2026-07-17, ks. muistiinpanot.md "💬-ehdotuksen
// elinkaari") — yleinen apufunktio KAIKILLE ankkuri-/ehdokasriveille (aiemmin
// vain ihmislähtöisellä ehdotuksella): tarve "en ehdikään tänään" ei katoa
// hyväksynnän jälkeen, joten siirto kuuluu jokaiselle ankkurille. Piilottaa
// rivin nykyisestä näkymästä ja nostaa sen uudelleen valitun tuntimäärän
// päästä (`visible_from`) — EI poista mitään, sisältö säilyy koko ajan.
function siirraNappi(ankkuriId, jalkeenPaivitys, naytaLabel) {
  const nappi = document.createElement('button');
  nappi.textContent = naytaLabel ? '⏭ Siirrä' : '⏭';
  nappi.className = 'postpone-btn';
  nappi.title = 'Siirrä myöhemmäksi';
  nappi.addEventListener('click', async function() {
    const vastaus = prompt('Nouse uudelleen kuinka monen tunnin päästä?', '24');
    if (vastaus === null) return;
    const tunteja = parseInt(vastaus, 10);
    if (!tunteja || tunteja < 1) return;
    const uusiHetki = new Date();
    uusiHetki.setHours(uusiHetki.getHours() + tunteja);
    const { error } = await db.from('ankkurit').update({ visible_from: uusiHetki.toISOString() }).eq('id', ankkuriId);
    ilmoitaKirjoitusvirheesta(error, 'Ankkurin siirto');
    jalkeenPaivitys();
  });
  return nappi;
}

async function lataaAnkkurit() {
  if (raahattavaRivi) return;
  // is_candidate-rivit (E3-keskiportaan AI-ehdotukset, ks. loadAnchorCandidates())
  // EIVÄT kuulu tähän listaan eivätkä "3 tärkeintä" -rajaan — ne näytetään
  // erikseen omana ryhmänään ehdotusten hyväksymistä varten. visible_from
  // suodattaa pois myöhemmäksi siirretyt (ks. siirraNappi yllä).
  const nytIso = new Date().toISOString();
  const { data, error } = await db.from('ankkurit').select().eq('done', false).eq('is_candidate', false).eq('user_id', currentUserId)
    .or('visible_from.is.null,visible_from.lte.' + nytIso)
    .order('sort_order');
  if (error) {
    console.error('Ankkureiden haku epäonnistui:', error);
    return;
  }

  cachedAnkkurit = data || [];
  // Henkselit-esto (2026-08-05, ks. muistiinpanot.md "Henkselit") — VAIN
  // Hytin omat ankkurit piiloon oman henkselöinnin ajaksi, ei koko listaa
  // (esim. Laiturin/kalenterin ankkurit näkyvät edelleen normaalisti).
  if (omaHenkilo && henkselitEstaaHytin(omaHenkilo) && await onkoOmaHenkselitAktiivinenNyt()) {
    cachedAnkkurit = cachedAnkkurit.filter(function(a) { return a.source !== 'hytti'; });
  }
  await paivitaMuistutuksetKartta();
  // Näkyvien ankkureiden määrä on nyt asetus (Asetukset → ⚓ Ankkurit,
  // ankkurit-nayta-maara-input), oletus 3 kuten ennen — 0 on sallittu
  // (kaikki piiloon, "laajenna" tarvitaan aina).
  const raja = haeAsetusNumero('ankkurit_nayta_maara', 3);
  const nayta = ankkuritKaikkiNakyvissa ? cachedAnkkurit : cachedAnkkurit.slice(0, raja);
  const piilossa = cachedAnkkurit.length - nayta.length;

  const listEl = document.getElementById('ankkurit-list');
  listEl.innerHTML = '';

  nayta.forEach(function(ankkuri) {
    const li = document.createElement('li');
    li.className = 'ankkuri-rivi';
    li.dataset.tuoteId = ankkuri.id;
    alustaRaahaus(li, ankkuri, {
      container: listEl,
      cache: cachedAnkkurit,
      taulu: 'ankkurit',
      jalkeenPaivitys: lataaAnkkurit,
    });

    const checkNappi = document.createElement('button');
    checkNappi.textContent = '○';
    checkNappi.className = 'check-btn';
    checkNappi.addEventListener('click', async function() {
      tuntopalauteValmis();
      const { error } = await db.from('ankkurit').update({ done: true, done_at: new Date().toISOString() }).eq('id', ankkuri.id);
      if (ilmoitaKirjoitusvirheesta(error, 'Ankkurin merkintä')) { lataaAnkkurit(); return; }
      siivoaMuistutuksetKumottavasti('ankkuri', ankkuri.id);
      lataaAnkkurit();
    });
    li.appendChild(checkNappi);

    // BUGIKORJAUS (2026-07-17, "Ankkurin muokkaus puuttuu"): napautus avaa
    // inline-muokkauksen kuten kaikkialla muualla — pelkkä poista+lisää-kierto
    // oli riittämätön pienelle korjaukselle ("Ikaalisiin"→"Parkanoon").
    // PÄÄTÖS lähdekytköksestä: muokkaus koskee VAIN tätä ankkuria, EI
    // lähderiviä (Muistilaput/Kalenteri/Hytti) josta ankkuri on mahdollisesti
    // nostettu — `ankkurit.content` on jo arkkitehtuurissa KOPIO otettu
    // ankkurointihetkellä (ks. vaihdaAnkkurointiYleinen), ei elävä viittaus,
    // joten tämä on johdonmukaista olemassa olevan mallin kanssa, ei uusi
    // poikkeus. Kytkös EI saa katketa hiljaa — title-vihje kertoo sen aina.
    const teksti = document.createElement('span');
    teksti.textContent = ankkuri.content;
    teksti.title = 'Muokkaus koskee vain tätä ankkuria, ei alkuperäistä riviä';
    teksti.addEventListener('click', function() {
      // Textarea, ei input (2026-08-11, elävä testaus §1.3/§1.4) — pitkä
      // ankkuriteksti saa nyt rivittyä muokatessa, ei enää tekstin
      // katoamista kentän reunan taakse.
      const inputti = document.createElement('textarea');
      inputti.rows = 1;
      inputti.value = ankkuri.content;
      inputti.className = 'edit-input';
      teksti.replaceWith(inputti);
      inputti.focus();
      inputti.setSelectionRange(inputti.value.length, inputti.value.length);
      kasvataTextareaaSisallon(inputti);
      inputti.addEventListener('input', function() { kasvataTextareaaSisallon(inputti); });

      async function tallenna() {
        const uusi = inputti.value.trim();
        if (uusi && uusi !== ankkuri.content) {
          const { error } = await db.from('ankkurit').update({ content: uusi }).eq('id', ankkuri.id);
          ilmoitaKirjoitusvirheesta(error, 'Ankkurin muokkaus');
        }
        lataaAnkkurit();
      }

      inputti.addEventListener('blur', tallenna);
      inputti.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); inputti.blur(); }
        if (e.key === 'Escape') { inputti.value = ankkuri.content; inputti.blur(); }
      });
    });
    li.appendChild(teksti);

    // Muistutuksen aikamerkki (2026-08-08, Ruori-uudistus): itse ⏰-toiminto
    // asuu nyt ⋯-valikossa (ks. alempana), mutta asetettu aika näkyy silti
    // tekstin perässä — reminderTimeBadge() on rakennettu juuri tätä varten.
    const muistutusBadge = reminderTimeBadge('ankkuri', ankkuri.id);
    if (muistutusBadge) li.appendChild(muistutusBadge);

    // ⋯-valikko (2026-08-08, Ruori-uudistus; ikonisoitu 2026-08-11, Ruori-
    // speksi §4.4) — Siirrä/Muistutus/Ehdota kootaan yhden "⋯"-napin taakse,
    // sama createOverflowButton/openRowMenu-koneisto kuin muualla sovelluksessa
    // (esim. Varasto/elävät rivit), nyt Sataman sävyisillä ikoneilla tekstin
    // lisäksi. Jokaisen kohdan TOIMINNALLISUUS on täsmälleen sama kuin ennen
    // (siirraNappi/luoMuistutusNappi/"Ehdota X:lle" -logiikat sellaisenaan).
    const ankkuriValikko = [
      {
        label: 'Muistutus', icon: ANKKURI_MENU_IKONIT.halytys,
        onClick: function() { avaaMuistutusPaneeli('ankkuri', ankkuri.id, ankkuri.content, null, ankkuri.event_time, lataaAnkkurit); },
      },
      {
        label: 'Siirrä myöhemmäksi', icon: ANKKURI_MENU_IKONIT.siirra,
        onClick: function() {
          const vastaus = prompt('Nouse uudelleen kuinka monen tunnin päästä?', '24');
          if (vastaus === null) return;
          const tunteja = parseInt(vastaus, 10);
          if (!tunteja || tunteja < 1) return;
          const uusiHetki = new Date();
          uusiHetki.setHours(uusiHetki.getHours() + tunteja);
          db.from('ankkurit').update({ visible_from: uusiHetki.toISOString() }).eq('id', ankkuri.id).then(function(res) {
            ilmoitaKirjoitusvirheesta(res.error, 'Ankkurin siirto');
            lataaAnkkurit();
          });
        },
      },
    ];
    // "Ehdota [Nimi]:lle" toiselle lähtöpisteenä (2026-07-18, ks.
    // muistiinpanot.md "💬-ehdotuksen löydettävyys") — tilanne "kirjoitin
    // itselleni, tajusin että kuuluukin hänelle". Luo UUDEN Laituri-murun
    // kotina (ei käytä tämän ankkurin omaa lähdettä — se voi olla mikä
    // tahansa taulu, ei aina laituri), täsmälleen sama koneisto kuin
    // lisäysvaiheen kohdevalinnalla.
    if (toinenKayttaja) {
      const ankkuriAvain = 'ankkuri:' + ankkuri.id;
      ankkuriValikko.push({
        label: 'Ehdota ' + henkiloAllatiivi(toinenKayttaja.henkilo), icon: ANKKURI_MENU_IKONIT.ehdota,
        onClick: async function() {
          if (ehdotetutTassaIstunnossa.has(ankkuriAvain)) {
            naytaIlmoitus('Jo ehdotettu ' + henkiloAllatiivi(toinenKayttaja.henkilo));
            return;
          }
          const onnistui = await ehdotaSisaltoToiselle(ankkuri.content);
          naytaIlmoitus(onnistui ? ('Ehdotettu ' + henkiloAllatiivi(toinenKayttaja.henkilo)) : 'Ehdotuksen lähetys epäonnistui');
          if (onnistui) ehdotetutTassaIstunnossa.add(ankkuriAvain);
        },
      });
    }

    // BUGIKORJAUS (2026-07-14, "Ankkurien hätäkorjaus"): kolme käsin luotua
    // ankkuria katosi vahinkopainalluksista jäljettömiin — käsin luotu ankkuri
    // ON sisältö (ei vain osoitin lähteeseen, ks. "Ankkuriarkkitehtuuri"-
    // suunnitelma), joten sen poisto oli lopullinen data-menetysriski.
    // Poisto EI TAPAHDU heti — 5s kumottava toast ensin, todellinen poisto
    // vasta jos ei kumota. Rivi vain himmenee tänä aikana, ei katoa DOM:ista.
    //
    // KORJATTU 2026-08-11 (CODE_vaihe1b.md §8b): source='etusivu' (käsin
    // kirjoitettu, ei Laituri-kotia, ks. ankkurit-add-btn-käsittelijä yllä)
    // sai nyt oman kotinsa — loki_merkinnat (sql/115), yksityinen taulu Lokin
    // tulevaa näkymää varten (Vaihe 5, ei vielä rakennettu). Muilla lähteillä
    // koti on jo olemassa oleva rivi (Laituri/Muistilaput/Hytti/Kalenteri) —
    // lasku vain poistaa ankkurin, sisältö on jo turvassa alkuperäisellä
    // rivillä. Etusivulla EI ole olemassa olevaa kotia, joten lasku kirjoittaa
    // ensin loki_merkinnat-rivin ja vasta SEN onnistuttua poistaa ankkurin —
    // ei koskaan toisin päin (kirjoituspolkujen sääntö: älä tuhoa ainoaa
    // kopiota ennen kuin uusi koti on varmasti tallessa).
    const irrotaNappi = document.createElement('button');
    irrotaNappi.innerHTML = ANKKURI_SVG;
    irrotaNappi.className = 'anchor-btn active';
    irrotaNappi.addEventListener('click', function() {
      li.style.opacity = '0.3';
      irrotaNappi.disabled = true;
      const kotiNimi = ANKKURI_KOTI_NIMI[ankkuri.source];
      naytaKumottavaIlmoitus(
        kotiNimi ? ('Ankkuri laskettu — löytyy ' + kotiNimi) : 'Ankkuri laskettu',
        async function() {
          let lokiRivi = null;
          if (ankkuri.source === 'etusivu') {
            const { data, error: lokiError } = await db.from('loki_merkinnat')
              .insert({ owner_id: currentUserId, content: ankkuri.content })
              .select().single();
            if (ilmoitaKirjoitusvirheesta(lokiError, 'Lokiin kirjoitus')) {
              li.style.opacity = '';
              irrotaNappi.disabled = false;
              return;
            }
            lokiRivi = data;
          }
          const { error } = await db.from('ankkurit').delete().eq('id', ankkuri.id);
          // Kumottava toasti on jo näytetty/kadonnut tähän mennessä — pysäytys
          // (return) estää seuraavan, RIIPPUVAN muistutus-siirron ajautumasta
          // ankkurin ollessa yhä olemassa, ja uusi toast kertoo epäonnistumisesta.
          if (ilmoitaKirjoitusvirheesta(error, 'Ankkurin irrotus')) return;
          // BUGIKORJAUS ("Ankkuriarkkitehtuuri: jokaisella ankkurilla on
          // koti"): LASKU POISTAA VAIN NOSTON — muistutukset kuuluvat
          // sisällölle, eivät nostolle, joten ne SIIRRETÄÄN kotiin sen
          // sijaan että poistettaisiin. Hyväksytty ihmislähtöinen ehdotus
          // ('ehdotus' — koti on LÄHETTÄJÄN oma Laituri, ei jotain jonne
          // vastaanottaja pääsisi) putoaa varasuunnitelmaan (poisto).
          // etusivu käyttää juuri luotua loki_merkinnat-rivin id:tä
          // source_ref:nä, koska ankkurilla itsellään ei ollut sellaista.
          let muistutusVirhe;
          const kotiSourceRef = ankkuri.source === 'etusivu' ? (lokiRivi ? String(lokiRivi.id) : null) : ankkuri.source_ref;
          if (ankkuri.source && ankkuri.source !== 'ehdotus' && kotiSourceRef) {
            const kotiLahde = ankkurinKotiMuistutusLahde(ankkuri);
            const tulos = await db.from('muistutukset')
              .update({ source: kotiLahde, source_ref: kotiSourceRef })
              .eq('source', 'ankkuri').eq('source_ref', String(ankkuri.id));
            muistutusVirhe = tulos.error;
          } else {
            const tulos = await db.from('muistutukset').delete().eq('source', 'ankkuri').eq('source_ref', String(ankkuri.id));
            muistutusVirhe = tulos.error;
          }
          // Ankkuri on jo poistettu onnistuneesti — muistutuksen siirto/poisto
          // on toissijainen siivous, ei enää perumiskelpoinen tässä vaiheessa,
          // joten vain lokitetaan (ei toista tointa käyttäjälle).
          if (muistutusVirhe) console.error('Muistutuksen siirto/poisto ankkurin irrotuksessa epäonnistui:', muistutusVirhe);
          lataaAnkkurit();
        },
        function() {
          li.style.opacity = '';
          irrotaNappi.disabled = false;
        }
      );
    });

    // Pino oikeassa reunassa (§4.2): ⚓ ja ⋯ allekkain, eivät vierekkäin —
    // tekstit ovat usein monisanaisia ja niiden pitää näkyä kokonaan.
    const toiminnot = document.createElement('div');
    toiminnot.className = 'ankkuri-toiminnot';
    toiminnot.appendChild(irrotaNappi);
    toiminnot.appendChild(createOverflowButton(li, ankkuriValikko));
    li.appendChild(toiminnot);

    listEl.appendChild(li);
  });

  const laajennusLinkki = document.getElementById('ankkurit-laajenna');
  if (ankkuritKaikkiNakyvissa) {
    laajennusLinkki.style.display = cachedAnkkurit.length > raja ? 'block' : 'none';
    laajennusLinkki.textContent = raja > 0 ? ('näytä vain ' + raja + ' tärkeintä') : 'piilota kaikki';
  } else if (piilossa > 0) {
    laajennusLinkki.style.display = 'block';
    laajennusLinkki.textContent = '+ ' + piilossa + ' muuta odottaa — näytä kaikki';
  } else {
    laajennusLinkki.style.display = 'none';
  }
}

// BUGIKORJAUS (2026-07-17, Bugi 27, ks. sql/063 ja design-periaate
// "Suhteellinen aika jäädytetään kirjoitushetkeen" muistiinpanot.md:ssä):
// käyttäjän oma hylkäys (× ehdokaskortilla, "Kumoa" Äly-lokista) ON vastaus
// siinä missä yöajon hiljainen raukeaminenkin (ks. api/_lib/aly-nightly.js) —
// ilman tätä merkintää lähdemuru jäisi arvioitavaksi seuraavana yönä, ja
// koska jäädytetty "huomenna"-hetki saattaa olla vielä sama kalenteripäivä
// hylkäyshetkellä, se saattoi nousta ankkuriehdokkaaksi uudelleen vielä
// kerran ennen kuin "jo mennyt ohi" -tarkistus lopulta pysäytti sen. Koskee
// VAIN source='aly' (koneen omia ehdotuksia) — 'ehdotus' (toisen käyttäjän
// lähettämä) ei koskaan liity aly_evaluated-tauluun.
async function merkitseAlyMuruKasitellyksi(sourceRef) {
  const noteId = Number(sourceRef);
  if (!noteId) return;
  const { data: muru, error: muruError } = await db.from('laituri').select('content').eq('id', noteId).maybeSingle();
  if (muruError || !muru) {
    console.error('Ankkuriehdotuksen käsittelymerkintä epäonnistui (murua ei löytynyt):', muruError);
    return;
  }
  const { error } = await db.from('aly_evaluated').upsert({ laituri_id: noteId, content: muru.content }, { onConflict: 'laituri_id' });
  if (error) console.error('Ankkuriehdotuksen käsittelymerkintä epäonnistui:', error);
}

// Kalenterisilta (2026-07-18, ks. muistiinpanot.md "Kalenterisilta") — Satama
// EI KIRJOITA iCloudiin ("yksi totuus" -periaate, ks. huomio dokumentin
// alussa), mutta voi ESITÄYTTÄÄ Applen oman "uusi tapahtuma" -näkymän: äly
// esitäyttää, ihminen kuittaa Applen omalla Lisää-napilla, järjestelmä
// (iCloud+caldav-sync) toteuttaa lopulta synkkana takaisin. Sataman oma
// koodi ei koskaan lisää/poista mitään kalenterista suoraan.
//
// KORJAUS 1 (2026-07-21, Katrin testilöydös oikealla asennetulla iOS-PWA:lla):
// aiempi data:text/calendar-URI-tekniikka avasi vain tyhjän valkoisen sivun —
// ei Applen tapahtumanäkymää, ei virhettä. .ics-sisällön rakennus ja
// tarjoilu siirretty palvelimelle (api/ics.js, oikea Content-Type:
// text/calendar -otsikko) — perinteisesti luotettavin reitti iOS:n
// natiiviin .ics-käsittelyyn, koska WebKit tunnistaa MIME-tyypin eikä
// data:-skeeman sisältöä. Sama data (content/event_date/event_time) jonka
// tämä funktio jo sai — ei uutta hakua, vain toimitustapa vaihtui.
//
// KORJAUS 2 (2026-07-21, Katrin erottelutesti — endpoint vahvistettu oikeaksi
// Safarissa, ✓✓ hyppäsi suoraan Applen esitäytettyyn näkymään): asennettu
// PWA (standalone-tila) NIELEE `window.location.href`-navigoinnin ei-HTML-
// vastaukseen — nappi näytti aktiivityylin muttei siirtynyt mihinkään.
// Selain (Safari-välilehti) käsittelee saman osoitteen oikein. Korjattu
// avaamalla osoite `window.open(url, '_blank')`:lla — EI RIITTÄNYT
// (ks. KORJAUS 3): Katri vahvisti useilla sulje+avaa-kierroksilla että
// window.open TODELLA avaa uuden ikkunan iOS-PWA:sta, mutta se ikkuna jää
// TYHJÄKSI (valkoinen sivu) — tunnettu iOS-PWA-oikku, `window.open` ei aina
// saa oikeaa selainkontekstia ei-HTML-vastaukselle standalone-tilasta käsin.
//
// KORJAUS 3 (2026-07-21, Katrin jatkodiagnoosi): kumpikaan JS-pohjainen
// navigointitapa (`location.href`, `window.open`) ei toiminut PWA:sta, vain
// KÄSIN Safariin avattu osoite toimi. Johtopäätös: ongelma on nimenomaan
// JS:N KAUTTA laukaistussa navigoinnissa, ei itse osoitteessa/vastauksessa
// (jo todistettu oikeaksi). Korjattu poistamalla JS-navigointi kokonaan —
// ➕-"nappi" on nyt AITO `<a href="...">`-linkkielementti ilman
// target-attribuuttia ja ilman click-käsittelijää, jota selain/PWA käsittelee
// natiivina linkkinä (sama reitti jota iOS jo käsittelee oikein Safarissa).
function kalenterisiltaUrl(candidate) {
  return '/api/ics?otsikko=' + encodeURIComponent(candidate.content) +
    '&pvm=' + encodeURIComponent(candidate.event_date) +
    '&aika=' + encodeURIComponent(candidate.event_time);
}

// E3 mid-tier V1 ("äly toimii, ihminen valvoo", ks. muistiinpanot.md) — AI-
// suggested anchor candidates, shown BELOW the real anchors, never inside
// the "3 most important" limit. New code, English names (house rule, ks.
// COPILOT.md "Koodikieli"). Three reactions: tick done (reuses the anchor
// row's own semantics), take as mine (promotes it to a real anchor,
// is_candidate -> false), or dismiss (deletes it — the underlying Laituri
// note is NEVER touched, ks. safety invariant in api/_lib/aly-nightly.js).
async function loadAnchorCandidates() {
  if (raahattavaRivi) return;
  // source ei enää rajata 'aly':ksi — is_candidate=true kattaa nyt kaksi
  // alkuperää: koneen ehdotus (source='aly', ✨) ja toisen käyttäjän ehdotus
  // (source='ehdotus', ks. "Ankkurin ehdottaminen toiselle" muistiinpanot.md:ssä).
  const { data, error } = await db.from('ankkurit').select()
    .eq('user_id', currentUserId).eq('is_candidate', true).eq('done', false)
    .order('created_at');
  if (error) {
    console.error('Ankkuriehdokkaiden haku epäonnistui:', error);
    return;
  }

  // "Siirrä myöhemmäksi" (ks. alla) suodattaa ehdotuksen pois näkyvistä
  // kunnes visible_from koittaa — ei erillistä kyselyä, suodatetaan
  // asiakaspuolella koska rivimäärä on aina pieni.
  const nyt = new Date();
  const naytettavat = (data || []).filter(function(c) { return !c.visible_from || new Date(c.visible_from) <= nyt; });

  const listEl = document.getElementById('anchor-candidates-list');
  listEl.innerHTML = '';

  // BUGIKORJAUS (2026-07-17, ks. "✨-ehdokkaan erottuvuus"): väsynyt käyttäjä
  // ilman listaa ei rekisteröinyt ehdokasta ollenkaan etusivulla — rivi
  // hukkui muun sisällön joukkoon. Muoto (otsikko + katkoviivakehys alla),
  // ei himmeys — opacity ei viesti mitään saavutettavasti.
  const otsikkoEl = document.getElementById('anchor-candidates-title');
  if (otsikkoEl) otsikkoEl.style.display = naytettavat.length ? 'block' : 'none';

  // BUGIKORJAUS (2026-08-11, Katrin löydös): Kuormitustila piilottaa koko
  // Ankkurit-segmentin CSS:llä (ks. paivitaRuoriNakyvyys), mutta tämä
  // funktio laski ehdokasmäärän AINA riippumatta Kuormitustilasta ja
  // syötti sen puhelimen kotinäytön appikuvakkeen numeroon
  // (paivitaSovelluskuvakeBadge, Badging API) — opiskeluun liittyvät
  // äly-ehdotukset "näkyivät" siis silti pomppivana lukuna kuvakkeessa
  // vaikka sovelluksen sisällä ne olivat piilossa. Pakotettu nollaan
  // Kuormitustilan aikana.
  huomioPallurat.ankkurit = ruoriKuormitustilaPaalla() ? 0 : naytettavat.length;
  const badge = document.getElementById('anchor-candidates-badge');
  if (badge) {
    if (huomioPallurat.ankkurit) {
      badge.textContent = huomioPallurat.ankkurit;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
  paivitaSovelluskuvakeBadge();

  naytettavat.forEach(function(candidate) {
    const li = document.createElement('li');
    li.className = 'anchor-candidate-row';
    // BUGIKORJAUS (2026-07-17, "💬-ehdotuksen elinkaari" — ks. muistiinpanot.md):
    // selkeät tekstilabelit eivät enää mahdu samalle riville tekstin kanssa
    // kapealla näytöllä — sisältö (check+teksti) ja toiminnot ovat nyt omilla
    // riveillään (ks. .anchor-candidate-content/-napit style.css:ssä).
    const sisaltoRivi = document.createElement('div');
    sisaltoRivi.className = 'anchor-candidate-content';
    const napitRivi = document.createElement('div');
    napitRivi.className = 'anchor-candidate-napit';

    // Couple time proposal (2026-08-04, Katri's request, ks.
    // muistiinpanot.md "Parisuhdeaika-ehdotus") — mutual acceptance means
    // this row's own accept action does NOT resolve it locally like a
    // normal candidate; it must go through the server (RLS blocks reading/
    // writing the partner's row from here) which reports back whether both
    // sides have now said yes.
    if (candidate.source === 'parisuhdeaika') {
      const text = document.createElement('span');
      const d = new Date(candidate.event_date + 'T00:00:00');
      const dateText = d.getDate() + '.' + (d.getMonth() + 1) + '.';
      const timeText = candidate.event_time.slice(0, 5);
      text.textContent = candidate.parisuhde_hyvaksytty
        ? '💞 Parisuhdeaikaa ' + dateText + ' klo ' + timeText + ' — odotetaan kumppanin hyväksyntää'
        : '💞 Parisuhdeaikaa ' + dateText + ' klo ' + timeText + '?';
      sisaltoRivi.appendChild(text);
      li.appendChild(sisaltoRivi);

      if (!candidate.parisuhde_hyvaksytty) {
        const acceptButton = document.createElement('button');
        acceptButton.textContent = '💞 Hyväksy';
        acceptButton.className = 'dialog-btn';
        acceptButton.addEventListener('click', async function() {
          // Confirmation gate (2026-08-04, Katri's request): once BOTH
          // people accept, the proposal closes and there is no "peru"
          // option left anywhere — an accidental tap here would be
          // unrecoverable, so a genuine confirm dialog guards it, not just
          // a dismissable toast.
          const confirmed = await naytaVahvistus(
            'Hyväksytäänkö parisuhdeaika ' + dateText + ' klo ' + timeText + '?',
            'Kun kumppanisikin hyväksyy, ehdotus sulkeutuu eikä sitä voi enää perua täältä.',
            'Hyväksy'
          );
          if (!confirmed) return;
          acceptButton.disabled = true;
          acceptCoupleTimeProposal(candidate);
        });
        napitRivi.appendChild(acceptButton);
      }

      const rejectButton = document.createElement('button');
      rejectButton.textContent = candidate.parisuhde_hyvaksytty ? '× Peru' : '× Ei sovi';
      rejectButton.className = 'delete-btn';
      rejectButton.addEventListener('click', async function() {
        // Same confirmation gate as accept — rejecting cancels the proposal
        // for BOTH people, not just this device, so it needs the stronger
        // "are you sure" dialog rather than the lighter undo-toast used for
        // purely personal candidate dismissals elsewhere in this list.
        const confirmed = await naytaVahvistus(
          candidate.parisuhde_hyvaksytty ? 'Perutaanko oma hyväksyntäsi?' : 'Hylätäänkö parisuhdeaika-ehdotus?',
          'Ehdotus perutaan myös kumppanilta. Uusi ehdotus tulee vasta seuraavan kerran kun rauhallinen päivä tunnistetaan uudelleen.',
          candidate.parisuhde_hyvaksytty ? 'Peru' : 'Hylkää'
        );
        if (!confirmed) return;
        rejectButton.disabled = true;
        rejectCoupleTimeProposal(candidate);
      });
      napitRivi.appendChild(rejectButton);

      // Muokkaa aikaa (2026-08-11, Katrin pyyntö) — ei erillistä
      // kalenterinäkymää, pelkkä muokattava laatikko samassa lapussa.
      // Tallennus laskee muokkaajan oman hyväksynnäksi (ks.
      // editCoupleTimeProposal), kumppanin hyväksyntä nollautuu
      // palvelimella — hän näkee ehdotuksen taas uutena, uudella ajalla.
      const muokkausLomake = document.createElement('div');
      muokkausLomake.className = 'parisuhdeaika-muokkaus';
      muokkausLomake.style.display = 'none';
      const pvmInput = document.createElement('input');
      pvmInput.type = 'date';
      pvmInput.value = candidate.event_date;
      const aikaInput = document.createElement('input');
      aikaInput.type = 'time';
      aikaInput.value = candidate.event_time.slice(0, 5);
      const tallennaNappi = document.createElement('button');
      tallennaNappi.textContent = 'Tallenna';
      tallennaNappi.className = 'dialog-btn';
      const peruutaNappi = document.createElement('button');
      peruutaNappi.textContent = 'Peruuta';
      peruutaNappi.className = 'delete-btn';
      muokkausLomake.appendChild(pvmInput);
      muokkausLomake.appendChild(aikaInput);
      muokkausLomake.appendChild(tallennaNappi);
      muokkausLomake.appendChild(peruutaNappi);
      li.appendChild(muokkausLomake);

      const muokkaaNappi = document.createElement('button');
      muokkaaNappi.textContent = '✎ Muokkaa aikaa';
      muokkaaNappi.className = 'dialog-btn dialog-btn-cancel';
      muokkaaNappi.addEventListener('click', function() {
        napitRivi.style.display = 'none';
        muokkausLomake.style.display = 'flex';
      });
      napitRivi.appendChild(muokkaaNappi);

      peruutaNappi.addEventListener('click', function() {
        muokkausLomake.style.display = 'none';
        napitRivi.style.display = '';
      });
      tallennaNappi.addEventListener('click', function() {
        if (!pvmInput.value || !aikaInput.value) return;
        tallennaNappi.disabled = true;
        editCoupleTimeProposal(candidate, pvmInput.value, aikaInput.value);
      });

      li.appendChild(napitRivi);
      listEl.appendChild(li);
      return;
    }

    // Keskusteluehdotuksen erityissääntö (2026-07-17, Katrin linjaus, ks.
    // muistiinpanot.md "💬-ehdotuksen elinkaari"): ristiriidasta lähetetty
    // ehdotus (ristiriita_pvm+ristiriita_avain asetettu) on ERI LAJI kuin
    // tavallinen delegointiehdotus ("osta liput") — hylkäys EI OLE
    // vaihtoehto (keskustelupyyntöä ei voi ohittaa hiljaa). Vain kaksi
    // toimintoa: Keskusteltu ✓ (kuittaa MYÖS kalenterin ristiriitalipun
    // samalla kertaa) tai Siirrä ⏭. Ei check-nappia, ei muokkausta, ei
    // erillistä "hyväksy"-askelta — Keskusteltu ✓ on sekä hyväksyntä että
    // valmistuminen yhdessä eleessä.
    const onKeskustelulaji = candidate.source === 'ehdotus' && candidate.ristiriita_pvm && candidate.ristiriita_avain;

    const text = document.createElement('span');
    text.textContent = candidate.source === 'ehdotus'
      ? '💬 ' + henkiloNimi(toinenKayttaja ? toinenKayttaja.henkilo : null) + ': ' + candidate.content
      : '✨ ' + candidate.content;

    if (onKeskustelulaji) {
      sisaltoRivi.appendChild(text);
      li.appendChild(sisaltoRivi);

      const keskusteltuNappi = document.createElement('button');
      keskusteltuNappi.textContent = 'Keskusteltu ✓';
      keskusteltuNappi.className = 'dialog-btn';
      keskusteltuNappi.addEventListener('click', async function() {
        const { error } = await db.from('ankkurit')
          .update({ is_candidate: false, done: true, done_at: new Date().toISOString() })
          .eq('id', candidate.id);
        if (error) {
          console.error('Keskustelun kuittaus epäonnistui:', error);
          naytaIlmoitus('Kuittaus epäonnistui — yritä uudelleen');
          return;
        }
        const { error: ackError } = await db.from('kalenteri_ristiriita_kuittaukset').upsert(
          { event_date: candidate.ristiriita_pvm, tapahtuma_avaimet: candidate.ristiriita_avain, acked_by: currentUserId },
          { onConflict: 'event_date,tapahtuma_avaimet', ignoreDuplicates: true }
        );
        if (ackError) {
          console.error('Kalenterin ristiriitalipun kuittaus epäonnistui:', ackError);
          naytaIlmoitus('Keskustelu kuitattu, mutta kalenterin ristiriitalippu ei rauhoittunut — tarkista Kalenterista');
        }
        await paivitaRistiriitaKuittaukset();
        loadAnchorCandidates();
        lataaAnkkurit();
        if (document.getElementById('kalenteri-view').style.display !== 'none') lataaKalenteri();
      });
      napitRivi.appendChild(keskusteltuNappi);
      napitRivi.appendChild(siirraNappi(candidate.id, loadAnchorCandidates, true));
      li.appendChild(napitRivi);
      listEl.appendChild(li);
      return;
    }

    // ○-kuittaus siirretty ⋯-valikkoon alla (2026-08-18, Katrin pyyntö:
    // "äly suggestions should have similar 3 dots as anchors and
    // everything else hides behind it except anchor rised or not") — ei
    // enää omana nappinaan sisältörivillä.
    const merkitseValmiiksi = async function() {
      tuntopalauteValmis();
      const { error } = await db.from('ankkurit').update({ done: true, done_at: new Date().toISOString() }).eq('id', candidate.id);
      ilmoitaKirjoitusvirheesta(error, 'Ankkuriehdokkaan merkintä');
      loadAnchorCandidates();
    };

    // BUGIKORJAUS (2026-07-17, "Ankkurin muokkaus puuttuu"): ✨-ehdokkaan
    // muokkaus = "ota omiin + muokattu" — pelkkä tekstin korjaus on jo
    // eksplisiittinen sitoutuminen, ei jätetä sitä silti ehdokastilaan.
    // Sama koskee ihmislähtöistä ehdotusta (source='ehdotus') — ero on vain
    // merkissä: ✨ koneelta, lähettäjän nimi + 💬 ihmiseltä (kahden hengen
    // perheessä lähettäjä on aina "toinenKayttaja", ei tarvitse erillistä
    // proposed_by->henkilo-hakua).
    text.title = 'Muokkaus ottaa ehdotuksen omaksi ankkuriksi';
    text.addEventListener('click', function() {
      let peruttu = false;
      const inputti = document.createElement('input');
      inputti.type = 'text';
      inputti.value = candidate.content;
      inputti.className = 'edit-input';
      text.replaceWith(inputti);
      inputti.focus();
      inputti.setSelectionRange(inputti.value.length, inputti.value.length);

      async function tallenna() {
        if (peruttu) {
          loadAnchorCandidates();
          return;
        }
        const uusi = inputti.value.trim();
        if (uusi) {
          const paivitys = { is_candidate: false };
          if (uusi !== candidate.content) paivitys.content = uusi;
          const { error } = await db.from('ankkurit').update(paivitys).eq('id', candidate.id);
          ilmoitaKirjoitusvirheesta(error, 'Ankkuriehdokkaan muokkaus');
        }
        loadAnchorCandidates();
        lataaAnkkurit();
      }

      inputti.addEventListener('blur', tallenna);
      inputti.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') inputti.blur();
        if (e.key === 'Escape') { peruttu = true; inputti.blur(); }
      });
    });
    sisaltoRivi.appendChild(text);
    li.appendChild(sisaltoRivi);

    // BUGIKORJAUS (2026-07-17, "💬-ehdotuksen elinkaari" — ks. muistiinpanot.md):
    // pelkkä ⚓-ikoni jätti epäselväksi mitä nappi tekee uudelle, vähemmän
    // tutulle 💬-ehdotukselle — käyttäjä painoi arvaamalla ja osui väärään
    // nappiin. Ihmislähtöiselle ehdotukselle napit saavat nyt selkeän
    // tekstilabelin ikonin lisäksi; ✨-koneehdokas pysyy ennallaan (tuttu,
    // ei valitusta).
    // §4.6 (Ruori-speksi, 2026-08-11): ehdokkaan hyväksymisnappi käyttää SAMAA
    // ⚓-SVG:tä ja anchor-btn-tyyliä kuin oma ankkuri, ei erillistä muotoilua —
    // vain ihmislähtöiselle ehdotukselle ('ehdotus') säilyy tekstilabeli
    // (2026-07-17-bugikorjaus, uudelle 💬-ehdotukselle pelkkä merkki oli
    // epäselvä), jolloin nappi levenee tekstin verran (.anchor-btn-labeled).
    const acceptButton = document.createElement('button');
    acceptButton.className = 'anchor-btn';
    if (candidate.source === 'ehdotus') {
      acceptButton.classList.add('anchor-btn-labeled');
      acceptButton.innerHTML = ANKKURI_SVG + '<span>Hyväksy</span>';
    } else {
      acceptButton.innerHTML = ANKKURI_SVG;
    }
    acceptButton.title = 'Ota omaksi ankkuriksi';
    acceptButton.addEventListener('click', async function() {
      const { error } = await db.from('ankkurit').update({ is_candidate: false }).eq('id', candidate.id);
      ilmoitaKirjoitusvirheesta(error, 'Ankkuriehdokkaan hyväksyntä');
      loadAnchorCandidates();
      lataaAnkkurit();
    });

    // Loput toiminnot ⋯-valikkoon (2026-08-18, Katrin pyyntö — ks. yllä
    // merkitseValmiiksi-kommentti): ainoa aina näkyvä toiminto on ⚓-nappi,
    // sama kaksoispino (.ankkuri-toiminnot) kuin oikealla ankkurilla.
    const ehdokasValikko = [
      { label: '○ Merkitse valmiiksi', onClick: merkitseValmiiksi },
    ];
    // Kalenterisilta (2026-07-18, ks. muistiinpanot.md) — vain ✨-koneehdokkaille
    // joilla on SEKÄ päivä ETTÄ kellonaika (= "selkeä ajanvaraus", sama
    // tunnistus joka jo luo tämän ehdokkaan, ks. api/_lib/aly-nightly.js). Ei
    // koskaan 💬-ihmisehdotuksille (niillä ei ole event_date/event_time,
    // eikä äly ole koskaan käsitellyt niiden ajankohtaa).
    if (candidate.event_date && candidate.event_time) {
      ehdokasValikko.push({
        label: '➕ Lisää kalenteriin',
        onClick: function() { window.location.href = kalenterisiltaUrl(candidate); },
      });
    }
    // "Siirrä myöhemmäksi" — nyt KAIKILLE ehdokkaille (✨ ja 💬), ks.
    // "💬-ehdotuksen elinkaira": tarve siirtää ei rajoitu ihmisehdotuksiin.
    // Sama logiikka kuin siirraNappi()-apurissa (script.js:n muut kutsupaikat),
    // ei omaa DOM-nappia täällä koska ⋯-valikko rakentaa napit itse.
    ehdokasValikko.push({
      label: '⏭ Siirrä myöhemmäksi',
      onClick: async function() {
        const vastaus = prompt('Nouse uudelleen kuinka monen tunnin päästä?', '24');
        if (vastaus === null) return;
        const tunteja = parseInt(vastaus, 10);
        if (!tunteja || tunteja < 1) return;
        const uusiHetki = new Date();
        uusiHetki.setHours(uusiHetki.getHours() + tunteja);
        const { error } = await db.from('ankkurit').update({ visible_from: uusiHetki.toISOString() }).eq('id', candidate.id);
        ilmoitaKirjoitusvirheesta(error, 'Ankkurin siirto');
        loadAnchorCandidates();
      },
    });
    // BUGIKORJAUS (2026-07-14, "Ankkurien hätäkorjaus"): sama 5s kumottava
    // toast kuin varsinaisilla ankkureilla, konsistenssin vuoksi ("jokainen
    // ankkurin poistava ele") — vaikka ehdokkaan lähdemuru on jo turvassa
    // Laiturissa (ks. aly_log-linkki), pelkkä yksi yhteinen malli on
    // helpompi muistaa kuin kaksi eri sääntöä.
    ehdokasValikko.push({
      label: candidate.source === 'ehdotus' ? '× Hylkää' : '× Poista ehdotus',
      danger: true,
      onClick: function() {
        li.style.opacity = '0.3';
        naytaKumottavaIlmoitus(
          'Ehdotus poistettu',
          async function() {
            const { error } = await db.from('ankkurit').delete().eq('id', candidate.id);
            // Jos poisto epäonnistuu, ehdokas on TODELLISUUDESSA yhä olemassa —
            // merkitseAlyMuruKasitellyksi() ei saa suorittua tässä tilassa, se
            // estäisi murun uudelleenarvioinnin ikuisesti vaikka ehdokas jäi elämään.
            if (ilmoitaKirjoitusvirheesta(error, 'Ankkuriehdokkaan poisto')) return;
            // aly_log koskee vain koneehdotuksia (source='aly') — ihmislähtöisellä
            // ehdotuksella ei ole aly_log-riviä, eikä lähettäjälle koskaan
            // raportoida hylkäystä (ks. muistiinpanot.md "Ankkurin ehdottaminen
            // toiselle" -turvasäännöt), joten tälle sourcelle ei ole mitään
            // päivitettävää täällä.
            if (candidate.source === 'aly') {
              const { error: logError } = await db.from('aly_log').update({ undone_at: new Date().toISOString(), undo_reason: 'dismissed' }).eq('anchor_id', candidate.id).is('undone_at', null);
              if (logError) console.error('Äly-lokin merkintä hylkäyksestä epäonnistui:', logError);
              // Bugi 27 -korjaus (ks. sql/063): hylkäys on lopullinen vastaus,
              // ei jätä murua odottamaan uutta yöajon arviointia.
              await merkitseAlyMuruKasitellyksi(candidate.source_ref);
            }
            loadAnchorCandidates();
          },
          function() { li.style.opacity = ''; }
        );
      },
    });

    const toiminnot = document.createElement('div');
    toiminnot.className = 'ankkuri-toiminnot';
    toiminnot.appendChild(acceptButton);
    toiminnot.appendChild(createOverflowButton(li, ehdokasValikko));
    li.appendChild(toiminnot);

    listEl.appendChild(li);
  });
}

// Couple time proposal — accept (2026-08-04, ks. muistiinpanot.md
// "Parisuhdeaika-ehdotus"). Calls the server (api/parisuhdeaika.js, action:hyvaksy)
// because RLS blocks reading/writing the partner's own row from here — the
// server is the only place that can tell whether both sides have said yes.
async function acceptCoupleTimeProposal(candidate) {
  const { data: sessionData } = await db.auth.getSession();
  const token = sessionData.session ? sessionData.session.access_token : null;
  let result = null;
  try {
    const response = await fetch('/api/parisuhdeaika', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ action: 'hyvaksy', ankkuri_id: candidate.id }),
    });
    result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Hyväksyntä epäonnistui');
  } catch (e) {
    console.error('Parisuhdeajan hyväksyntä epäonnistui:', e.message);
    naytaIlmoitus('Hyväksyntä epäonnistui — yritä uudelleen');
    loadAnchorCandidates();
    return;
  }
  if (result.mutual) {
    naytaIlmoitus('Molemmat hyväksyivät!');
    showCoupleTimeCalendarCard(result.calendar);
  } else {
    naytaIlmoitus('Hyväksytty — odotetaan kumppanin hyväksyntää');
  }
  loadAnchorCandidates();
}

// Couple time proposal — reject. An ACTIVE reject cancels the proposal for
// BOTH people (server deletes both rows by their shared parisuhde_ryhma) —
// the next proposal only appears the next time the calm-day trigger fires
// naturally, never right away. The caller already ran a confirm dialog (ks.
// above) before this is invoked, so this executes directly — no separate
// undo toast, same "confirm once, then commit" pattern as murun poisto.
async function rejectCoupleTimeProposal(candidate) {
  const { data: sessionData } = await db.auth.getSession();
  const token = sessionData.session ? sessionData.session.access_token : null;
  try {
    const response = await fetch('/api/parisuhdeaika', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ action: 'hylkaa', ankkuri_id: candidate.id }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Hylkäys epäonnistui');
    naytaIlmoitus('Parisuhdeaika-ehdotus hylätty');
  } catch (e) {
    console.error('Parisuhdeaika-ehdotuksen hylkäys epäonnistui:', e.message);
    naytaIlmoitus('Hylkäys epäonnistui — yritä uudelleen');
  }
  loadAnchorCandidates();
}

// Couple time proposal — muokkaa kellonaikaa (2026-08-11, Katrin pyyntö,
// ks. api/parisuhdeaika.js:n muokkaa()). Muokkaus on toiminnallisesti "hylkää
// vanha aika, ehdota uutta": kumppanin hyväksyntä nollataan palvelimella
// (hänen pitää nähdä ja hyväksyä UUSI aika), muokkaajan oma hyväksyntä
// asetetaan todeksi samalla (Katrin oma päätös — muokkaus + tallennus on
// jo riittävä sitoutuminen, ei vaadi erillistä toista Hyväksy-painallusta).
async function editCoupleTimeProposal(candidate, eventDate, eventTime) {
  const { data: sessionData } = await db.auth.getSession();
  const token = sessionData.session ? sessionData.session.access_token : null;
  try {
    const response = await fetch('/api/parisuhdeaika', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ action: 'muokkaa', ankkuri_id: candidate.id, event_date: eventDate, event_time: eventTime }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Muokkaus epäonnistui');
    naytaIlmoitus('Uusi aika tallennettu — odotetaan kumppanin hyväksyntää');
  } catch (e) {
    console.error('Parisuhdeajan muokkaus epäonnistui:', e.message);
    naytaIlmoitus('Muokkaus epäonnistui — yritä uudelleen');
  }
  loadAnchorCandidates();
}

// Shows the "both accepted" confirmation with the real Kalenterisilta link
// (kalenterisiltaUrl(), same mechanism as reminders' calendar bridge) — the
// underlying ankkuri row is already resolved server-side at this point (ks.
// api/parisuhdeaika.js:n hyvaksy()), so it will disappear from the normal
// candidate list on the next reload; this card is the only remaining place
// the person can tap the link, so it stays until manually dismissed.
function showCoupleTimeCalendarCard(calendar) {
  const existing = document.getElementById('couple-time-calendar-card');
  if (existing) existing.remove();

  const card = document.createElement('li');
  card.id = 'couple-time-calendar-card';
  card.className = 'anchor-candidate-row';

  const content = document.createElement('div');
  content.className = 'anchor-candidate-content';
  const text = document.createElement('span');
  text.textContent = '🎉 Molemmat hyväksyivät parisuhdeajan — vie se kalenteriin';
  content.appendChild(text);
  card.appendChild(content);

  const buttons = document.createElement('div');
  buttons.className = 'anchor-candidate-napit';

  const link = document.createElement('a');
  link.textContent = '➕ Lisää kalenteriin';
  link.className = 'dialog-btn dialog-btn-cancel';
  link.title = 'Avaa valmiiksi täytettynä puhelimen omaan Kalenteriin';
  link.href = kalenterisiltaUrl(calendar);
  buttons.appendChild(link);

  const okButton = document.createElement('button');
  okButton.textContent = '✓ Selvä';
  okButton.className = 'delete-btn';
  okButton.addEventListener('click', function() { card.remove(); });
  buttons.appendChild(okButton);

  card.appendChild(buttons);

  const list = document.getElementById('anchor-candidates-list');
  list.insertBefore(card, list.firstChild);
  const title = document.getElementById('anchor-candidates-title');
  if (title) title.style.display = 'block';
}

// Avaa osion sen route-kentän mukaan. Vain 'laituri' on toistaiseksi toiminnallinen.
function avaaOsio(osio) {
  if (osio.route === 'laituri') {
    peruLaiturinMateriaaliKonteksti();
    showLaituriView();
    lataaLaituri();
    merkitseLaituriNahdyksi();
  } else if (osio.route === 'muistilaput') {
    showMuistilaputView();
    lataaMuistilaput();
  } else if (osio.route === 'varasto') {
    showVarastoView();
    lataaVarasto();
  } else if (osio.route === 'kalenteri') {
    showKalenteriView();
    kalenteriTila = 'paiva';
    kalenteriPvm = new Date();
    document.querySelectorAll('.kalenteri-tila-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.tila === 'paiva'); });
    lataaKalenteri();
    paivitaKuittausTila();
    synkkaaICloud();
  } else if (osio.route === 'asetukset') {
    showAsetuksetView();
    lataaLapset();
    nollaaHenkselitLomake();
    lataaHenkselit();
    paivitaTiliTiedot();
    paivitaPushTila();
    paivitaSovellusTiedot();
    lataaVinkit();
    loadAiLog();
    markAiLogSeen();
    paivitaAsetukset().then(function() {
      if (omaHenkilo) document.getElementById('henkselit-esta-hytti-toggle').checked = henkselitEstaaHytin(omaHenkilo);
      document.getElementById('pacer-kehote-toggle').checked = haeAsetusTeksti('pacer_kehote_paalla', 'true') !== 'false';
      document.getElementById('kuormaraja-input').value = haeAsetusNumero('paivan_menoraja', 5);
      document.getElementById('ankkurit-nayta-maara-input').value = haeAsetusNumero('ankkurit_nayta_maara', 3);
      document.getElementById('huoli-keski-kynnys-input').value = haeAsetusNumero('huoli_keski_kynnys', 10);
      document.getElementById('huoli-raskas-kynnys-input').value = haeAsetusNumero('huoli_raskas_kynnys', 30);
      document.getElementById('kurssi-kiireellisyys-input').value = haeAsetusNumero('kurssi_kiireellisyys_paivia', 3);
      document.getElementById('tuntia-per-op-input').value = haeAsetusNumero('tuntia_per_op', 27);
      document.getElementById('hoitotaso-jalkeenjaanti-input').value = haeAsetusNumero('hoitotaso_jalkeenjaanti_kynnys', 40);
      document.getElementById('silta-puskuri-input').value = haeAsetusNumero('silta_puskuri_paivia', 7);
      document.getElementById('silta-leviamissyvyys-input').value = haeAsetusNumero('silta_leviamissyvyys', 2);
      document.getElementById('sillat-auto-paivia-input').value = haeAsetusNumero('sillat_auto_paivia', 7);
      document.getElementById('sessio-jarkevyys-input').value = haeAsetusNumero('sessio_jarkevyys_tunnit', 3);
      document.getElementById('tehdyn-nakyvyys-input').value = haeAsetusNumero('tehdyn_nakyvyys_maara', 0);
      document.getElementById('kesto-priming-input').value = haeAsetusNumero('kesto_priming_min', 15);
      document.getElementById('kesto-encoding-input').value = haeAsetusNumero('kesto_encoding_min', 45);
      document.getElementById('kesto-retrieval-input').value = haeAsetusNumero('kesto_retrieval_min', 20);
      document.getElementById('kesto-yllapito-input').value = haeAsetusNumero('kesto_yllapito_min', 10);
      document.getElementById('siirtymapuskuri-input').value = haeAsetusNumero('siirtymapuskuri_min', 30);
      document.getElementById('min-paallekkainen-input').value = haeAsetusNumero('min_paallekkainen_min', 15);
      document.getElementById('yksin-hetkittain-raja-input').value = haeAsetusNumero('yksin_hetkittain_raja_min', 90);
      document.getElementById('aterian-kesto-input').value = haeAsetusNumero('aterian_kesto_min', 30);
      document.getElementById('aterian-alku-input').value = haeAsetusTeksti('ateria_alku', '11:00');
    });
    lataaHyttiOpiskeluaika();
    lataaHyttiSuljetutIkkunat();
  } else if (osio.route === 'hytti') {
    // showHyttiView() -> vaihdaHyttiValilehti('nyt') lataa nyt itse oman
    // sisältönsä (2026-08-18 korjaus) — ei enää tarvitse kutsua Reitin
    // lataajaa erikseen tässä, ks. vaihdaHyttiValilehti:n oma kommentti.
    showHyttiView();
  } else {
    alert(osio.name + ' tulossa pian.');
  }
}

// === HUOMIOPALLURAT (2026-07-13) ===
// Etusivun laattojen pallura = kuinka moni asia odottaa KÄYTTÄJÄN
// REAKTIOTA — EI kaikkea uutta. Periaate: pallura vain reaktiota
// odottaville asioille, aina palava merkki lakkaa merkitsemästä kun
// käyttäjä on reagoinut (ei kun hän on vain "nähnyt"). Jokainen uusi
// palluralähde perustellaan erikseen tähän — ei automaattisesti kaikelle.
// V1: kalenteri (kuittausjono, ks. paivitaKuittausTila()) + laituri
// (toisen käyttäjän 'uusi'-tilaiset rivit, ks. alla) + asetukset
// (näkemättömät "Mitä äly on tehnyt" -lokirivit, ks. updateSettingsBadge()
// alla — ensimmäinen laajennus tähän karttaan, E3-keskiporras 2026-07-13)
// + ankkurit (reagoimattomat äly-ehdokkaat, ks. loadAnchorCandidates() —
// lisätty 2026-07-16, samalla reagointipohjaisella logiikalla kuin
// kalenteri, ei tarvinnut omaa "nähty"-mekanismia koska ehdokasrivin oma
// tila JO kertoo onko siihen reagoitu). Muille laatoille EI palluraa vielä.
let huomioPallurat = { kalenteri: 0, laituri: 0, asetukset: 0, ankkurit: 0 };

// Päivittää iOS:n kotinäytön PWA-kuvakkeen numeron (Badging API, iOS 16.4+)
// kaikkien huomiopallurien summaksi. Feature-detect — jos API:a ei ole
// (vanhempi iOS, muu selain), ohitetaan hiljaa, ei näytetä virhettä
// käyttäjälle. Kutsutaan aina kun jompikumpi pallura päivittyy.
async function paivitaSovelluskuvakeBadge() {
  if (!('setAppBadge' in navigator)) return;
  const summa = huomioPallurat.kalenteri + huomioPallurat.laituri + huomioPallurat.asetukset + huomioPallurat.ankkurit;
  try {
    if (summa > 0) {
      await navigator.setAppBadge(summa);
    } else {
      await navigator.clearAppBadge();
    }
  } catch (e) {
    // Ei kriittistä (esim. PWA ei asennettu kotinäytölle) — ei näytetä käyttäjälle.
  }
}

// Laituri-laatan pallura: VAIN toisen käyttäjän lisäämät rivit joita EN OLE
// VIELÄ NÄHNYT — "nähty", ei "sijoittamatta" (korjattu 2026-07-13, ks.
// muistiinpanot.md "Bugikorjaus: Laituri-pallura"). Ensimmäinen
// Huomiopallurat-versio laski "sijoittamattomat toisen rivit" — käytännössä
// Laiturin oma filosofia ("asiat odottavat häpeättä ja hälyttä") ja tämä
// laskentatapa olivat ristiriidassa: pari päivää vanha, jo kertaalleen
// nähty mutta yhä sijoittamaton muru sytytti palluran uudelleen JOKA
// avauksella. Nähty rivi saa nyt odottaa Laiturissa ilman palluraa, vaikka
// sitä ei olisi vielä sijoitettu. Oma lisäys ei kerrytä omaa palluraa
// (ennallaan, riippumatta tästä muutoksesta).
//
// "Nähty" tallennetaan `laituri_nahty`-tauluun (per käyttäjä, ei
// laitekohtainen localStorage — kevyin KESTÄVÄ vaihtoehto: säilyy vaikka
// PWA asennetaan uudelleen tai vaihdetaan puhelinta, sql/040). Nollautuu
// `merkitseLaituriNahdyksi()`:llä Laiturin avaushetkellä.
let omaLaituriNahtyAika = null;

async function haeLaituriNahtyAika() {
  const { data, error } = await db.from('laituri_nahty').select('viimeksi_avattu').eq('user_id', currentUserId).maybeSingle();
  if (error) {
    console.error('Laiturin nähty-ajan haku epäonnistui:', error);
    return null;
  }
  return data ? data.viimeksi_avattu : null;
}

async function merkitseLaituriNahdyksi() {
  const nyt = new Date().toISOString();
  const { error } = await db.from('laituri_nahty').upsert({ user_id: currentUserId, viimeksi_avattu: nyt }, { onConflict: 'user_id' });
  if (error) {
    console.error('Laiturin nähty-ajan tallennus epäonnistui:', error);
    return;
  }
  omaLaituriNahtyAika = nyt;
  paivitaLaituriBadge();
}

async function paivitaLaituriBadge() {
  if (omaLaituriNahtyAika === null) {
    omaLaituriNahtyAika = await haeLaituriNahtyAika();
  }
  const raja = omaLaituriNahtyAika || '1970-01-01T00:00:00.000Z';

  const { count } = await db.from('laituri').select('id', { count: 'exact', head: true })
    .neq('user_id', currentUserId).gt('created_at', raja);
  huomioPallurat.laituri = count || 0;

  const badge = document.querySelector('.tile-badge[data-osio-key="laituri"]');
  if (badge) {
    if (huomioPallurat.laituri) {
      badge.textContent = huomioPallurat.laituri;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  paivitaSovelluskuvakeBadge();
}

// Asetukset-laatan pallura: E3-keskiportaan "Mitä äly on tehnyt" -lokirivit
// joita EI OLE VIELÄ NÄHTY — sama "nähty"-aikaleimamalli kuin Laiturin
// pallura (per-käyttäjä tietokantarivi, ei localStorage). Lokiosion avaus
// (Asetukset) nollaa. New code, English names (ks. COPILOT.md "Koodikieli").
let aiLogLastSeen = null;

async function getAiLogLastSeen() {
  const { data, error } = await db.from('aly_log_seen').select('last_seen').eq('user_id', currentUserId).maybeSingle();
  if (error) {
    console.error('Äly-lokin nähty-ajan haku epäonnistui:', error);
    return null;
  }
  return data ? data.last_seen : null;
}

async function markAiLogSeen() {
  const now = new Date().toISOString();
  const { error } = await db.from('aly_log_seen').upsert({ user_id: currentUserId, last_seen: now }, { onConflict: 'user_id' });
  if (error) {
    console.error('Äly-lokin nähty-ajan tallennus epäonnistui:', error);
    return;
  }
  aiLogLastSeen = now;
  updateSettingsBadge();
}

async function updateSettingsBadge() {
  if (aiLogLastSeen === null) {
    aiLogLastSeen = await getAiLogLastSeen();
  }
  const cutoff = aiLogLastSeen || '1970-01-01T00:00:00.000Z';

  const { count } = await db.from('aly_log').select('id', { count: 'exact', head: true })
    .eq('user_id', currentUserId).gt('created_at', cutoff);
  huomioPallurat.asetukset = count || 0;

  const badge = document.querySelector('.tile-badge[data-osio-key="asetukset"]');
  if (badge) {
    if (huomioPallurat.asetukset) {
      badge.textContent = huomioPallurat.asetukset;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  paivitaSovelluskuvakeBadge();
}

// Piirtää "Mitä äly on tehnyt" -lokin Asetuksiin, uusin ensin. Rivit eivät
// koskaan katoa (loki on pysyvä historia) — kumottu rivi jää näkyviin
// yliviivattuna ilman Kumoa-nappia, ei piiloteta.
// Avaa Laituri-näkymän ja hakee suoraan lähdemurun sisällöllä — käytetään
// äly-lokin "→ Laituri" -linkistä (ks. loadAiLog alla), jotta rauenneen/
// kumotun ehdotuksen lähdemuru löytyy heti eikä jää arvailun varaan.
function avaaLaiturinMuru(sisalto) {
  showLaituriView();
  const hakuKentta = document.getElementById('laituri-search');
  if (hakuKentta) hakuKentta.value = sisalto;
  lataaLaituri(sisalto);
  merkitseLaituriNahdyksi();
}

// Äly-lokin rivin TILA (2026-07-17, ks. "Äly-loki on umpikuja" -bugikorjaus):
// invariantti sanoo että äly VAIN LISÄÄ, mutta pelkkä invariantti ei riitä —
// sen pitää myös NÄKYÄ käyttäjälle, muuten rauennut ehdotus on umpikuja
// (käyttäjä ei tiedä onko muru yhä olemassa jossain). Neljä tilaa: aktiivinen
// (odottaa yhä reaktiota), otettu omaksi, tehty, rauennut/kumottu — jälkimmäiselle
// näytetään aina muistutus että LÄHDEMURU on koskematon Laiturissa (turvainvariantti
// pitää tämän aina totena) + suora linkki sinne.
function alyLokiTila(entry, ankkuri) {
  if (!entry.undone_at) {
    if (!ankkuri) return { teksti: 'Tuntematon tila', luokka: '' };
    if (ankkuri.done) return { teksti: 'Tehty', luokka: 'aly-log-tila-tehty' };
    if (ankkuri.is_candidate) return { teksti: 'Odottaa reaktiota', luokka: 'aly-log-tila-aktiivinen' };
    return { teksti: 'Otettu omaksi', luokka: 'aly-log-tila-otettu' };
  }
  if (entry.undo_reason === 'expired') return { teksti: 'Rauennut (ei reagoitu)', luokka: 'aly-log-tila-rauennut' };
  return { teksti: 'Kumottu', luokka: 'aly-log-tila-rauennut' };
}

async function loadAiLog() {
  const { data, error } = await db.from('aly_log').select().eq('user_id', currentUserId).order('created_at', { ascending: false });
  if (error) {
    console.error('Äly-lokin haku epäonnistui:', error);
    return;
  }

  const listEl = document.getElementById('aly-log-list');
  const osioEl = document.getElementById('aly-log-osio');
  const toggleEl = document.getElementById('aly-log-toggle');
  // Kollapsoitu osio (2026-08-11, Katrin pyyntö) — sama "otsikko + laske
  // auki -nappi" -kuvio kuin Laiturin arkistossa (ks. paivitaLaituriArkisto),
  // säilyttää auki/kiinni-tilan istunnon ajan (oliAuki).
  const oliAuki = listEl.style.display !== 'none';
  listEl.innerHTML = '';

  if (!data || data.length === 0) {
    // Koko osio pois näkyvistä kun tyhjä, ei "ei vielä mitään" -tekstiä
    // (Katrin yleissääntö 2026-08-18).
    osioEl.style.display = 'none';
    return;
  }
  osioEl.style.display = 'block';
  toggleEl.style.display = 'block';
  toggleEl.textContent = 'Näytä loki (' + data.length + ')';
  listEl.style.display = oliAuki ? 'block' : 'none';

  // Kaksi kertakyselyä koko listalle (ei per-rivi-kyselyä): ankkurin
  // NYKYINEN tila (tehty/otettu omaksi/yhä odottava) + lähdemurun sisältö
  // "→ Laituri" -linkkiä varten.
  const anchorIds = data.map(function(e) { return e.anchor_id; }).filter(function(id) { return id !== null && id !== undefined; });
  const sourceRefs = data.map(function(e) { return e.source_ref; }).filter(Boolean);
  const [ankkuritTulos, laituriTulos] = await Promise.all([
    anchorIds.length ? db.from('ankkurit').select('id,is_candidate,done').in('id', anchorIds) : Promise.resolve({ data: [] }),
    sourceRefs.length ? db.from('laituri').select('id,content').in('id', sourceRefs) : Promise.resolve({ data: [] }),
  ]);
  const ankkuritKartta = {};
  (ankkuritTulos.data || []).forEach(function(a) { ankkuritKartta[a.id] = a; });
  const laituriKartta = {};
  (laituriTulos.data || []).forEach(function(l) { laituriKartta[l.id] = l; });

  data.forEach(function(entry) {
    const row = document.createElement('div');
    row.className = 'aly-log-rivi' + (entry.undone_at ? ' aly-log-kumottu' : '');

    const text = document.createElement('span');
    text.className = 'aly-log-teksti';
    text.textContent = entry.description;
    row.appendChild(text);

    const tila = alyLokiTila(entry, entry.anchor_id ? ankkuritKartta[entry.anchor_id] : null);
    const tilaEl = document.createElement('span');
    tilaEl.className = 'aly-log-tila ' + tila.luokka;
    tilaEl.textContent = tila.teksti;
    row.appendChild(tilaEl);

    const time = document.createElement('span');
    time.className = 'aly-log-aika';
    time.textContent = suhteellinenAika(entry.created_at);
    row.appendChild(time);

    const laituriRivi = entry.source_ref ? laituriKartta[entry.source_ref] : null;
    if (entry.undone_at && laituriRivi) {
      const linkki = document.createElement('button');
      linkki.className = 'aly-log-linkki';
      linkki.textContent = 'Muru on yhä Laiturissa →';
      linkki.addEventListener('click', function() { avaaLaiturinMuru(laituriRivi.content); });
      row.appendChild(linkki);
    }

    if (!entry.undone_at) {
      const undoButton = document.createElement('button');
      undoButton.textContent = 'Kumoa';
      undoButton.className = 'aly-log-kumoa-btn';
      undoButton.addEventListener('click', async function() {
        if (entry.anchor_id) {
          const { error: poistoError } = await db.from('ankkurit').delete().eq('id', entry.anchor_id);
          // Jos ankkurin poisto epäonnistuu, se on TODELLISUUDESSA yhä
          // olemassa — merkitseAlyMuruKasitellyksi() ei saa suorittua (ks.
          // sama perustelu kuin ehdokaskortin ×-hylkäyksessä).
          if (ilmoitaKirjoitusvirheesta(poistoError, 'Ankkurin poisto')) return;
        }
        const { error } = await db.from('aly_log').update({ undone_at: new Date().toISOString(), undo_reason: 'manual' }).eq('id', entry.id);
        if (ilmoitaKirjoitusvirheesta(error, 'Äly-lokin kumoaminen')) return;
        // Bugi 27 -korjaus (ks. sql/063): sama kuin ehdokaskortin ×-hylkäys —
        // "Kumoa" on lopullinen vastaus, ei jätä murua uuden yöajon varaan.
        if (entry.source_ref) await merkitseAlyMuruKasitellyksi(entry.source_ref);
        loadAiLog();
        loadAnchorCandidates();
        lataaAnkkurit();
      });
      row.appendChild(undoButton);
    }

    listEl.appendChild(row);
  });
}

document.getElementById('aly-log-toggle').addEventListener('click', function() {
  const lista = document.getElementById('aly-log-list');
  lista.style.display = lista.style.display === 'none' ? 'block' : 'none';
});

// Näyttää Laituri-näkymän sisällä kuinka monta riviä odottaa yhä sijoittamista
// (status='uusi') — riippumaton hakusanasuodatuksesta ja etusivun "nähty"-
// pohjaisesta merkistä, koska nämä kaksi lukua vastaavat eri kysymykseen
// ("mitä ei ole vielä nähty" vs. "mitä ei ole vielä käsitelty").
async function paivitaLaituriSijoittamattaTeksti() {
  const teksti = document.getElementById('laituri-sijoittamatta');
  if (!teksti) return;
  const { count } = await db.from('laituri').select('id', { count: 'exact', head: true }).eq('status', 'uusi');
  teksti.textContent = count ? count + ' sijoittamatta' : 'kaikki sijoitettu';
}

// Hakee ja piirtää Laiturin rivit, valinnaisesti hakusanalla suodatettuna.
// Jokainen muru pysyy omana kokonaisuutena ja sen alle voidaan jatkaa
// säiettä. Ketjun kotiin-valuminen (2026-08-03, ks. KONSEPTIKIRJA.md 7b) —
// vain ketjun UUSIN segmentti näkyy täällä, ks. piirraLaituriRivi.
async function lataaLaituri(hakusana) {
  paivitaLaituriSijoittamattaTeksti();
  let kysely = db.from('laituri').select('id, content, created_at, user_id, status, placed_where, teema_id, koti_tyyppi, koti_kohde_id, koti_kohde_nimi, koti_segmentti_valunut, piilota_laiturista, materiaali_kurssi_id, materiaali_kurssi_nimi, visibility').neq('status', 'arkistoitu').is('teema_id', null).eq('piilota_laiturista', false).order('created_at', { ascending: false });
  if (hakusana) {
    kysely = kysely.ilike('content', '%' + hakusana + '%');
  }
  const { data, error } = await kysely;
  if (error) {
    console.error('Laiturin haku epäonnistui:', error);
  }

  // Murun säie (2026-07-20/21, ks. muistiinpanot.md "Murun säie") — yksi
  // erällinen haku KAIKKIEN näytettävien murujen jatkoriveille (ei N+1-
  // kyselyä per rivi). Ryhmitellään muru_id:n mukaan, aikajärjestykseen
  // (order asc) jo kannassa, joten piirtokohdassa ei tarvitse lajitella uudelleen.
  const jatkorivitKartta = {};
  if (data && data.length > 0) {
    const { data: jatkorivit, error: jatkoriviError } = await db.from('laituri_jatkorivit').select()
      .in('muru_id', data.map(function(r) { return r.id; })).order('created_at', { ascending: true });
    if (jatkoriviError) {
      console.error('Säikeiden jatkorivien haku epäonnistui:', jatkoriviError);
    } else {
      (jatkorivit || []).forEach(function(jr) {
        if (!jatkorivitKartta[jr.muru_id]) jatkorivitKartta[jr.muru_id] = [];
        jatkorivitKartta[jr.muru_id].push(jr);
      });
    }
  }

  const listEl = document.getElementById('laituri-list');
  listEl.innerHTML = '';

  (data || []).forEach(function(rivi) {
    const li = document.createElement('li');
    li.className = 'laituri-row' + (rivi.status === 'sijoitettu' ? ' sijoitettu' : '');
    li.dataset.tuoteId = rivi.id;

    // Ketjun kotiin-valuminen (2026-08-03, ks. KONSEPTIKIRJA.md 7b): kun
    // murulla on koti, vain ketjun UUSIN valumaton segmentti (muru itse tai
    // viimeisin jatkorivi) toimii tämän rivin otsikkona — vanhemmat segmentit
    // ovat jo valuneet kotiin eivätkä siksi enää näy täällä ollenkaan.
    // Ilman kotia näytetään koko (korkeintaan 3 säikeen) ketju sellaisenaan.
    const kaikkiJatkorivit = jatkorivitKartta[rivi.id] || [];
    let otsikkoTeksti = rivi.content;
    let otsikkoAika = rivi.created_at;
    let nakyvatJatkorivit = kaikkiJatkorivit;
    let otsikkoOnMuru = true;
    if (rivi.koti_tyyppi) {
      const valumattomat = kaikkiJatkorivit.filter(function(jr) { return !jr.valunut_kotiin; });
      if (valumattomat.length > 0) {
        const uusin = valumattomat[valumattomat.length - 1];
        otsikkoTeksti = uusin.teksti;
        otsikkoAika = uusin.created_at;
        otsikkoOnMuru = false;
      }
      nakyvatJatkorivit = valumattomat;
    }

    const sisalto = document.createElement('div');
    sisalto.className = 'laituri-content';

    const teksti = document.createElement('span');
    teksti.className = 'laituri-text';
    teksti.textContent = otsikkoTeksti;
    sisalto.appendChild(teksti);

    // BUGIKORJAUS ("Laiturin ⚓-tilan näkyvyys"): sijoittamaton ja jo-
    // ankkurina-oleva muru näyttivät identtisiltä — ⚓-napin oma väri/opacity-
    // ero (ks. .anchor-btn.active) ei riittänyt vilkaisulle. Tieto tilasta
    // (ei nappi) lisätty tekstin perässä olevaan meta-riviin — muoto
    // (näkyvä sana) kertoo tilan, ei pelkkä napin väri.
    const onAnkkuroitu = ankkuroidutAvaimet.has('laituri:' + rivi.id);

    // Murun kevyt korjausmuokkaus (2026-07-15, ks. muistiinpanot.md "Laiturin
    // murujen kevyt korjausmuokkaus"): KOROSTETUSTI korjaava käyttötapaus
    // (esim. monitulkintaiseksi jäänyt muru täsmennetään "täytetty [pvm]"),
    // EI jalostava — vanhoja muruja ei ole tarkoitus muuten muokata, sama
    // ele kuin kaikkialla muualla (napautus = inline-muokkaus). Kaksi
    // kytköstä, molemmat jo olemassa olevan arkkitehtuurin ansiosta/mukaan:
    // (1) älyn käsittelymerkintä (aly_evaluated.content, ks. sql/044)
    // vapautuu AUTOMAATTISESTI seuraavana yönä koska yöajo vertaa tallennettua
    // sisältöä NYKYISEEN sisältöön — ei vaadi erillistä nollausta täältä;
    // (2) jos muru on ankkuroitu, korjaus PÄIVITTYY myös ankkuriin ("yksi
    // totuus" tälle nimenomaiselle suunnalle — päinvastoin kuin ankkurin
    // oman muokkauksen kohdalla, ks. Bugi 10, joka tietoisesti EI vaikuta
    // takaisin lähteeseen).
    // Korjausmuokkaus koskee VAIN murun omaa tekstiä — jatkorivit eivät ole
    // koskaan muokattavissa (ks. sql/079), joten kun otsikko näyttää valuneen
    // ketjun uusinta jatkoriviä, napautus ei avaa muokkausta ollenkaan.
    if (otsikkoOnMuru) {
      teksti.title = 'Napauta korjataksesi (esim. epäselväksi jäänyt muru)';
      teksti.addEventListener('click', function() {
        const inputti = document.createElement('input');
        inputti.type = 'text';
        inputti.value = rivi.content;
        inputti.className = 'edit-input';
        teksti.replaceWith(inputti);
        inputti.focus();
        inputti.setSelectionRange(inputti.value.length, inputti.value.length);

        async function tallenna() {
          const uusi = inputti.value.trim();
          if (uusi && uusi !== rivi.content) {
            const { error } = await db.from('laituri').update({ content: uusi }).eq('id', rivi.id);
            if (!ilmoitaKirjoitusvirheesta(error, 'Murun muokkaus') && onAnkkuroitu) {
              const { error: peiliError } = await db.from('ankkurit').update({ content: uusi }).eq('source', 'laituri').eq('source_ref', String(rivi.id));
              if (peiliError) console.error('Ankkurin peilipäivitys epäonnistui:', peiliError);
            }
          }
          lataaLaituri(document.getElementById('laituri-search').value.trim());
        }

        inputti.addEventListener('blur', tallenna);
        inputti.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') inputti.blur();
          if (e.key === 'Escape') { inputti.value = rivi.content; inputti.blur(); }
        });
      });
    }

    const meta = document.createElement('span');
    meta.className = 'laituri-meta';
    const kuka = rivi.user_id === currentUserId ? 'sinä' : 'kumppani';
    const d = new Date(otsikkoAika);
    const aika = d.getDate().toString().padStart(2, '0') + '.' + (d.getMonth() + 1).toString().padStart(2, '0') + '. ' +
                 d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    meta.textContent = kuka + ' · ' + aika +
      (rivi.status === 'sijoitettu' ? ' · → ' + rivi.placed_where : '') +
      (onAnkkuroitu ? ' · ⚓ ankkurissa' : '') +
      (rivi.koti_tyyppi ? ' · 🏠 koti: ' + rivi.koti_kohde_nimi : '') +
      // Yksityisyyskorjaus (2026-08-16, sql/118): merkki näkyy VAIN
      // omistajalle itselleen — kumppani ei koskaan näe riviä ollenkaan
      // (RLS suodattaa sen pois kokonaan), joten sekaannusvaaraa ei ole.
      (rivi.visibility === 'private' ? ' · 🔒 vain sinä' : '');
    sisalto.appendChild(meta);

    li.appendChild(sisalto);

    // UI-BUGI (2026-07-20, Katrin kuvakaappaus): kuusi ikonia (✨⚓→💬⋯×)
    // vei rivin koko leveyden kapealla näytöllä, teksti puristui lähes
    // merkki/rivi lukukelvottomaksi — "vilkaisuarvo": sisältö on rivin
    // pääasia, toiminnot toissijaisia. Sama korjaustapa kuin elävillä
    // listoilla jo aiemmin (Rivien UI-remontti, 2026-07-16): vain kaksi
    // yleisintä/nopeinta tointa (⚓/→) jäävät aina näkyviin, harvemmin
    // tarvitut (✨ kysy ehdotus, 💬 ehdota toiselle) siirretty ⋯-valikkoon
    // 🗄 Arkistoi:n rinnalle.
    // BUGIKORJAUS (2026-08-03, Katrin huomio): napit rivissä yhtenä pitkänä
    // jonona kaventivat tekstisaraketta ikävästi kapealla näytöllä — sama
    // oire kuin Ankkureissa. Napit koottu omaan 2×2-ruudukkoon (ks.
    // .laituri-rivi-toiminnot, style.css) yhden pitkän rivin sijaan.
    const toiminnot = document.createElement('div');
    toiminnot.className = 'laituri-rivi-toiminnot';
    li.appendChild(toiminnot);

    if (rivi.status !== 'sijoitettu') {
      // Suora ⚓-oikotie (2026-07-17, ks. "Kalenteri-sijoitus ei kirjoita
      // mitään" -bugikorjaus): nostaa murun sellaisenaan tälle päivälle
      // ankkuriksi ilman sijoitusvirtaa — sama todistettu, oikeasti
      // tietokantaan kirjoittava mekanismi kuin Muistilappujen ⚓ (ks.
      // vaihdaAnkkurointiYleinen). EI merkitse murua sijoitetuksi (ankkurointi
      // ja sijoitus ovat eri kysymyksiä, sama periaate kuin Muistilapuilla).
      const ankkuriNappi = document.createElement('button');
      ankkuriNappi.className = 'anchor-btn' + (onAnkkuroitu ? ' active' : '');
      ankkuriNappi.innerHTML = ANKKURI_SVG;
      ankkuriNappi.title = onAnkkuroitu ? 'Ankkurissa — napauta laskeaksesi' : 'Nosta tälle päivälle ankkuriksi';
      ankkuriNappi.addEventListener('click', function() {
        vaihdaAnkkurointiYleinen('laituri', rivi.id, rivi.content, function() {
          lataaLaituri(document.getElementById('laituri-search').value.trim());
        });
      });
      toiminnot.appendChild(ankkuriNappi);
      // Erillinen "→ Sijoita" -nappi poistettu (2026-08-16, §16.5c) — kohteen
      // valinta yhtenäistetty ⋯-valikon "🏠"-kohtaan (avaaKohdeValikko), ei
      // enää kahta rinnakkaista mekanismia (sijoitus + koti) samalle asialle.
    } else {
      // "↺ palauta sijoittamattomaksi" (2026-07-17, ks. "Kalenteri-sijoitus
      // ei kirjoita mitään" -bugikorjaus) — sijoitettu-merkintä voi olla
      // virheellinen (esim. vanha "kalenteriin"-itseilmoitus jota mikään ei
      // koskaan toteuttanut), joten palautus pitää olla aina mahdollinen.
      // Aina turvallinen: ei poista mitään, palauttaa vain tilan.
      const palautaNappi = document.createElement('button');
      palautaNappi.className = 'restore-btn';
      palautaNappi.textContent = '↺';
      palautaNappi.title = 'Palauta sijoittamattomaksi';
      palautaNappi.addEventListener('click', function() {
        palautaLaituriSijoittamattomaksi(rivi);
      });
      toiminnot.appendChild(palautaNappi);
    }

    // ⋯-valikko: harvemmin tarvitut toiminnot (ks. UI-BUGI-kommentti yllä).
    // Arkistointi (2026-07-19, ks. muistiinpanot.md "Murun arkistointi") oli
    // täällä ensin — ✨/💬 siirretty mukaan 2026-07-20 rivin ahtauskorjauksessa.
    const menuKohdat = [];
    if (rivi.status !== 'sijoitettu') {
      menuKohdat.push({
        label: '✨ Kysy ehdotus',
        onClick: function() { pyydaLaituriEhdotus(rivi, {}, li); },
      });
      // "Ankkurin ehdottaminen toiselle" (2026-07-16) — vain omalle murulle
      // (ehdotus on ehdottajan OMA ajatus, ei partnerin murun uudelleenehdotus),
      // ja vain jos ei jo ehdotettu tässä istunnossa (ei tarvitse näyttää
      // kuitattua kohtaa valikossa — pois listalta riittää, sama "kevyt"
      // periaate kuin muuallakin tässä erässä).
      if (rivi.user_id === currentUserId && toinenKayttaja && !ehdotetutTassaIstunnossa.has(rivi.id)) {
        menuKohdat.push({
          label: '💬 Ehdota ' + henkiloAllatiivi(toinenKayttaja.henkilo),
          onClick: async function() {
            const { error } = await db.from('ankkurit').insert({
              content: rivi.content,
              source: 'ehdotus',
              source_ref: String(rivi.id),
              user_id: toinenKayttaja.user_id,
              is_candidate: true,
              proposed_by: currentUserId,
            });
            if (ilmoitaKirjoitusvirheesta(error, 'Ehdotuksen lähetys')) return;
            ehdotetutTassaIstunnossa.add(rivi.id);
            lataaLaituri(document.getElementById('laituri-search').value.trim());
          },
        });
      }
    }
    // Murun säie (2026-07-20/21, ks. muistiinpanot.md "Murun säie") — toimii
    // riippumatta sijoitettu-tilasta (keskustelu voi jatkua vaikka muru olisi
    // jo sijoitettu jonnekin), siksi TÄSSÄ eikä yllä olevan sijoittamaton-ehdon sisällä.
    menuKohdat.push({
      label: '🧵 Jatka säiettä',
      onClick: function() { avaaJatkoriviDialog(rivi); },
    });
    // Koti (2026-08-03, ks. KONSEPTIKIRJA.md 7b — korvaa vanhan "Siirrä
    // teemaan" -toiminnon): asettaa vain OSOITTIMEN, ei siirrä mitään heti.
    // Kotia EI koskaan pakoteta paitsi 3 säikeen kovassa rajassa (ks.
    // jatkorivi-tallenna-käsittelijä) — tietoinen poikkeus "ei koskaan
    // pakota" -periaatteesta, perusteltu KONSEPTIKIRJA.md:ssä.
    menuKohdat.push({
      label: rivi.koti_tyyppi ? '🏠 Vaihda kohdetta (' + rivi.koti_kohde_nimi + ')' : '🏠 Siirrä kohteeseen',
      onClick: function() { avaaKohdeValikko(rivi, li); },
    });
    // 7c: "ei tarvitse näkyä Laiturissa" — ERI mekanismi kuin arkistointi,
    // ei tulkita käsitellyksi, vain pois aktiivisesta näkymästä. Turvainvariantti:
    // rivi ei poistu, vain suodattuu (ks. lataaLaituri: eq('piilota_laiturista', false)).
    menuKohdat.push({
      label: '🙈 Ei tarvitse näkyä Laiturissa',
      onClick: function() { piilotaLaiturinRivi(rivi); },
    });
    // Sama laituri.status-tilakenttä kuin OSA A:n "siirretty Kauppalistalle" —
    // "arkistoitu" vain kolmas arvo, ei erillinen mekanismi.
    menuKohdat.push({
      label: '🗄 Arkistoi',
      onClick: function() { arkistoiLaituriRivi(rivi); },
    });
    toiminnot.appendChild(createOverflowButton(li, menuKohdat));
    // Erillinen "×"-poistonappi poistettu (2026-08-16, §16.5c) — sama toiminto
    // (poistaLaiturinMuru) siirretty ⋯-valikkoon kohdevalintojen rinnalle,
    // Katrin oma pyyntö ("ei erilliseksi").

    listEl.appendChild(li);
    piirraJatkorivit(rivi, li, nakyvatJatkorivit);
    piirraKauppaEhdotusKortti(rivi, li);
    piirraHetkiSiltaKortti(rivi, li);
    piirraHoitoJasennysKortti(rivi, li);
    piirraMateriaaliJasennysKortti(rivi, li);
  });

  paivitaLaituriArkisto();
  paivitaLaituriPiilotetut();
  paivitaLuoteLinkki();
}

// Murun säie (2026-07-20/21, ks. muistiinpanot.md "Murun säie" / KONSEPTIKIRJA.md
// 4.10 jatko) — piirtää jatkorivit murun rivin (li) JÄLKEEN omina <li>-
// sisaruksinaan, sama insertAdjacentElement('afterend', ...) -kaava kuin
// piirraHetkiSiltaKortti/piirraKauppaEhdotusKortti. Kutsuttava ENNEN niitä
// (ks. lataaLaituri()) jotta jatkorivit päätyvät VISUAALISESTI ehdotuskorttien
// ALLE — jokainen 'afterend'-lisäys samaan ankkuriin nousee edellisen ohi.
// BUGIKORJAUS (2026-08-03, ks. KONSEPTIKIRJA.md 7b): ei enää sisäistä
// slice(-2)-katkaisua — kutsuja päättää mitkä jatkorivit näytetään.
// Laiturissa kutsuja välittää vain ketjun valumattoman "uusimman osan"
// (koti-mekanismi rajoittaa sen jo pieneksi), Teema-/koti-näkymä välittää
// AINA koko historian sellaisenaan (se ON arkisto).
function piirraJatkorivit(rivi, li, jatkorivit) {
  if (!jatkorivit || jatkorivit.length === 0) return;

  let edellinen = li;
  jatkorivit.forEach(function(jr) {
    const rivEl = document.createElement('li');
    rivEl.className = 'laituri-jatkorivi-rivi';

    const teksti = document.createElement('span');
    teksti.className = 'jatkorivi-rivi-teksti';
    teksti.textContent = '↳ ' + jr.teksti;
    rivEl.appendChild(teksti);

    const aika = document.createElement('span');
    aika.className = 'jatkorivi-aika';
    const d = new Date(jr.created_at);
    let aikaTeksti = d.getDate() + '.' + (d.getMonth() + 1) + '.';
    if (jr.heratys_pvm) {
      const hd = new Date(jr.heratys_pvm + 'T00:00:00');
      aikaTeksti += ' · 🔔 ' + hd.getDate() + '.' + (hd.getMonth() + 1) + '.';
    }
    aika.textContent = aikaTeksti;
    rivEl.appendChild(aika);

    edellinen.insertAdjacentElement('afterend', rivEl);
    edellinen = rivEl;
  });
}

// Dialogin nykyinen kohdemuru — asetetaan avattaessa, tyhjennetään suljettaessa.
let jatkoriviKohdeMuru = null;

function avaaJatkoriviDialog(rivi) {
  jatkoriviKohdeMuru = rivi;
  document.getElementById('jatkorivi-teksti').value = '';
  document.getElementById('jatkorivi-heratys-check').checked = false;
  document.getElementById('jatkorivi-heratys-pvm').disabled = true;
  document.getElementById('jatkorivi-heratys-pvm').value = '';
  document.getElementById('jatkorivi-overlay').style.display = 'flex';
  document.getElementById('jatkorivi-teksti').focus();
}

function suljeJatkoriviDialog() {
  document.getElementById('jatkorivi-overlay').style.display = 'none';
  jatkoriviKohdeMuru = null;
}

document.getElementById('jatkorivi-peruuta').addEventListener('click', suljeJatkoriviDialog);
document.getElementById('jatkorivi-overlay').addEventListener('click', function(e) {
  if (e.target === document.getElementById('jatkorivi-overlay')) suljeJatkoriviDialog();
});
document.getElementById('jatkorivi-heratys-check').addEventListener('change', function(e) {
  document.getElementById('jatkorivi-heratys-pvm').disabled = !e.target.checked;
});

document.getElementById('jatkorivi-tallenna').addEventListener('click', async function() {
  if (!jatkoriviKohdeMuru) return;
  const rivi = jatkoriviKohdeMuru;

  const teksti = document.getElementById('jatkorivi-teksti').value.trim();
  if (!teksti) {
    naytaIlmoitus('Kirjoita jotain ensin');
    return;
  }
  const heratysCheck = document.getElementById('jatkorivi-heratys-check');
  const heratysPvm = document.getElementById('jatkorivi-heratys-pvm').value;
  if (heratysCheck.checked && !heratysPvm) {
    naytaIlmoitus('Valitse herätyspäivä tai poista "Muistuta"-täppä');
    return;
  }

  // Kova raja (2026-08-03, ks. KONSEPTIKIRJA.md 7b): 3 säiettä ilman kotia
  // pysäyttää jatkamisen — tietoinen poikkeus "ei koskaan pakota"
  // -periaatteesta. Turvainvariantti: TARKISTUS ENNEN kirjoitusta, kirjoitettu
  // teksti pysyy kentässä koskemattomana jos torjutaan (ei häviä, käyttäjä
  // voi asettaa kodin ja yrittää tallennusta uudelleen).
  let nykyinenMaara = 0;
  if (!rivi.koti_tyyppi) {
    const { count, error: laskuError } = await db.from('laituri_jatkorivit')
      .select('id', { count: 'exact', head: true }).eq('muru_id', rivi.id);
    if (laskuError) {
      console.error('Jatkorivien laskenta epäonnistui:', laskuError);
    } else {
      nykyinenMaara = count || 0;
    }
    if (nykyinenMaara >= 3) {
      naytaIlmoitus('Ketju on jo 3 säiettä pitkä ilman kotia — valitse ensin koti (⋯ "🏠 Aseta koti") ennen kuin jatkat. Kirjoittamasi teksti säilyy tässä.');
      return;
    }
  }

  const { error } = await db.from('laituri_jatkorivit').insert({
    muru_id: rivi.id,
    teksti: teksti,
    heratys_pvm: heratysCheck.checked ? heratysPvm : null,
  });
  if (ilmoitaKirjoitusvirheesta(error, 'Säikeen jatkorivin tallennus')) return;

  // Ketjun kotiin-valuminen: jos koti on jo asetettu, edellinen uusin
  // segmentti valuu nyt kotiin (tämä uusi jatkorivi on ketjun uusi kärki).
  // Ilman kotia vain PEHMEÄ ehdotus 1. säikeen kohdalla — ei ränkytetä
  // enää toisella tai kolmannella ("Satama ei ränkytä" -periaate).
  if (rivi.koti_tyyppi) {
    await valutaVanhatSegmentitKotiin(rivi);
  }

  // Herätys (ks. yläkommentti tiedoston tässä osiossa) — EI uutta
  // ajastusmekanismia, sama visible_from-koneisto kuin ⏭-siirrolla ja
  // "hetki"-ehdokkaan viivästetyllä näkyvyydellä (ks. laskeHetkiNakyvyys(),
  // api/_lib/aly-classify.js) — sama UTC-puolinaisuus tarkoituksella, ei
  // uusi bugi vaan sama johdonmukaisuus kuin siellä.
  if (heratysCheck.checked) {
    const visibleFrom = new Date(heratysPvm + 'T00:00:00.000Z').toISOString();
    const { error: ankkuriError } = await db.from('ankkurit').insert({
      content: rivi.content + ' — oletteko palanneet?',
      source: 'jatkorivi',
      source_ref: String(rivi.id),
      user_id: currentUserId,
      is_candidate: true,
      visible_from: visibleFrom,
    });
    if (ankkuriError) console.error('Murun säikeen herätysehdokkaan luonti epäonnistui:', ankkuriError);
  }

  suljeJatkoriviDialog();
  const kotiVihje = !rivi.koti_tyyppi && nykyinenMaara === 0 ? ' — harkitse kodin valintaa tälle ketjulle (⋯ "🏠 Aseta koti")' : '';
  naytaIlmoitus((heratysCheck.checked ? 'Jatkorivi + herätys asetettu' : 'Jatkorivi tallennettu') + kotiVihje);
  lataaLaituri(document.getElementById('laituri-search').value.trim());
});

// Kalenterisilta aikaistettu (2026-07-20, Katrin tarkennus, ks. muistiinpanot.md
// "Kalenterisilta aikaistettu") — äly kirjoittaa TÄMÄN suoraan murun omalle
// riville (laituri.ai_hetki_ehdotus, ks. api/_lib/aly-nightly.js ja
// api/laituri-add.js) HETI kun "hetki" tunnistetaan, riippumatta ankkuri-
// ehdokkaan omasta visible_from-viiveestä (ks. Bugi 28) — muuten ajanvaraus
// näkyisi kalenterisiltana vasta lähellä kohdehetkeä. LISÄYS aikaiseen
// siltaan, EI korvaa ankkuriehdokasta (se toimii yhä muistutuksena
// kohdepäivänä ennallaan). Sama .ics-generointi (kalenterisiltaUrl) kuin
// ankkuriehdokkaalla — vain aikaisemmassa vaiheessa putkea.
function piirraHetkiSiltaKortti(rivi, li) {
  const ehdotus = rivi.ai_hetki_ehdotus;
  if (!ehdotus || !ehdotus.date) return;

  const kortti = document.createElement('li');
  kortti.className = 'laituri-ehdotus-rivi';

  const d = new Date(ehdotus.date + 'T00:00:00');
  const pvmTeksti = d.getDate() + '.' + (d.getMonth() + 1) + '.';
  const aikaTeksti = ehdotus.time ? ' klo ' + ehdotus.time.slice(0, 5) : '';
  const teksti = document.createElement('span');
  teksti.textContent = '🕐 ' + pvmTeksti + aikaTeksti;
  kortti.appendChild(teksti);

  // Sama ehto kuin ankkuriehdokkaan omalla ➕-napilla (ks. loadAnchorCandidates):
  // .ics-tapahtuma tarvitsee sekä päivän ETTÄ kellonajan.
  if (ehdotus.time) {
    const napit = document.createElement('span');
    napit.className = 'laituri-ehdotus-napit';
    const kalenteriNappi = document.createElement('a');
    kalenteriNappi.textContent = '➕ Lisää kalenteriin';
    kalenteriNappi.className = 'dialog-btn dialog-btn-cancel';
    kalenteriNappi.title = 'Avaa valmiiksi täytettynä puhelimen omaan Kalenteriin';
    kalenteriNappi.href = kalenterisiltaUrl({ content: ehdotus.content || rivi.content, event_date: ehdotus.date, event_time: ehdotus.time });
    napit.appendChild(kalenteriNappi);
    kortti.appendChild(napit);
  }

  li.insertAdjacentElement('afterend', kortti);
}

// "Yksi luukku" erä 1 — kauppatavaraehdotus (2026-07-19, ks. muistiinpanot.md
// "Laiturin äly-lajittelu"). Äly kirjoittaa TÄMÄN suoraan murun omalle
// riville (laituri.ai_kauppa_ehdotus — ks. api/_lib/aly-nightly.js ja
// api/laituri-add.js), EI candidate-rakennetta kuten hetki/ikkuna, koska
// tuote joko hyväksytään tai ei — ei tarvitse odottaa/vanhentua. "Kolmiporras":
// äly EI KOSKAAN siirrä mitään itse, tämä kortti on AINA vain ehdotus +
// kuittaus, sama .laituri-ehdotus-rivi/-napit-ulkoasu kuin piirraLaituriEhdotusKortti.
function piirraKauppaEhdotusKortti(rivi, li) {
  const items = rivi.ai_kauppa_ehdotus;
  if (!Array.isArray(items) || items.length === 0) return;

  const kortti = document.createElement('li');
  kortti.className = 'laituri-ehdotus-rivi';

  const teksti = document.createElement('span');
  teksti.textContent = 'Näyttää kauppatavaralta (' + items.join(', ') + ')';
  kortti.appendChild(teksti);

  const napit = document.createElement('span');
  napit.className = 'laituri-ehdotus-napit';

  const siirraNappi = document.createElement('button');
  siirraNappi.className = 'dialog-btn dialog-btn-cancel';
  siirraNappi.textContent = 'Siirrä Kauppalistalle';
  siirraNappi.addEventListener('click', function() {
    hyvaksyKauppaEhdotus(rivi, items);
  });
  napit.appendChild(siirraNappi);

  const eiNappi = document.createElement('button');
  eiNappi.className = 'dialog-btn dialog-btn-cancel';
  eiNappi.textContent = 'Ei';
  eiNappi.addEventListener('click', function() {
    hylkaaKauppaEhdotus(rivi);
  });
  napit.appendChild(eiNappi);

  kortti.appendChild(napit);
  li.insertAdjacentElement('afterend', kortti);
}

// Hyväksyntä kirjoittaa OIKEASTI Kauppalistalle (sama malli kuin "Siirrä
// valitut Kauppalistalle" -toiminto), ja merkitsee murun sijoitetuksi vasta
// ONNISTUNEEN kirjoituksen jälkeen ("Vahvistus seuraa todellisuutta").
async function hyvaksyKauppaEhdotus(rivi, items) {
  const { data: kauppalista, error: hakuError } = await db.from('lists').select('id').eq('name', 'Kauppalista').single();
  if (hakuError || !kauppalista) {
    console.error('Kauppalistan haku epäonnistui:', hakuError);
    naytaIlmoitus('Kauppalistaa ei löytynyt — yritä uudelleen');
    return;
  }

  const uudetRivit = items.map(function(nimi) { return { nimi: nimi, tehty: false, list_id: kauppalista.id, is_header: false }; });
  const { error: kirjoitusError } = await db.from('tuotteet').insert(uudetRivit);
  if (ilmoitaKirjoitusvirheesta(kirjoitusError, 'Kauppaehdotuksen siirto')) return;

  const { error } = await db.from('laituri').update({ status: 'sijoitettu', placed_where: 'Kauppalista', ai_kauppa_ehdotus: null }).eq('id', rivi.id);
  // Tuotteet ovat jo kirjoitettu onnistuneesti tässä vaiheessa — jos VAIN
  // tämä merkintä epäonnistuu, muru näyttäytyy yhä sijoittamattomana ja
  // saattaisi tuottaa duplikaattirivit jos ehdotus hyväksyttäisiin uudelleen.
  if (error) {
    console.error('Kauppaehdotuksen merkintä sijoitetuksi epäonnistui:', error);
    naytaIlmoitus('Tuotteet lisätty Kauppalistalle, mutta murun merkintä sijoitetuksi epäonnistui — tarkista Laituri');
  } else {
    naytaIlmoitus(items.length + ' tuotetta siirretty Kauppalistalle');
  }
  lataaLaituri(document.getElementById('laituri-search').value.trim());
  paivitaLaituriBadge();
}

// Hylkäys ei poista mitään — vain tyhjentää ehdotuskentän, muru jää
// Laituriin täysin normaalina. Sama sisältö ei nouse uudelleen ennen kuin
// käyttäjä muokkaa murua (ks. aly_evaluated-merkintä, tehty jo ehdotuksen
// kirjoitushetkellä api/_lib/aly-nightly.js:ssä/api/laituri-add.js:ssä).
async function hylkaaKauppaEhdotus(rivi) {
  const { error } = await db.from('laituri').update({ ai_kauppa_ehdotus: null }).eq('id', rivi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Kauppaehdotuksen hylkäys')) return;
  lataaLaituri(document.getElementById('laituri-search').value.trim());
}

// BUGIKORJAUS (2026-07-17, ks. muistiinpanot.md "Kalenteri-sijoitus ei
// kirjoita mitään"): tämä on VAPAAMUOTOINEN OMA ILMOITUS ("minne sinä itse
// veit tämän"), EI koskaan automaattinen siirto mihinkään — Satama ei
// kirjoita tuotteet/kalenteri_tapahtumat-tauluihin tästä. Tämä on aivan
// oikein listakohteille (Kauppalista, hytin kortti — käyttäjä lisää rivin
// itse sinne, tämä vain kirjaa sen ylös), MUTTA oli aiemmin harhaanjohtava
// "kalenteriin"-kohteelle: SATAMALLA EI OLE KALENTERIKIRJOITUSPOLKUA
// LAINKAAN (ei Sataman omaan kalenterinäkymään, ei tietenkään iCloudiin —
// ks. "Kalenterisyötteet"-osio, synkka on VAIN luku-suuntainen kunnes ICS-
// julkaisu joskus rakennetaan). "Sopii" kalenteri-ehdotukselle merkitsi silti
// murun sijoitetuksi vaikka mitään ei syntynyt minnekään — järjestelmä väitti
// murun olevan perillä paikassa jota ei ole. Korjattu POISTAMALLA "kalenteriin"
// kokonaan äly-ehdotusten kohdevalikoimasta (ks. pyydaLaituriEhdotus) ja
// tarjoamalla sen tilalle KAKSI aidosti toimivaa reittiä ajankohtaan
// sidotulle murulle: (1) muistutus (ks. merkitseLaituriMuistutuksella alla,
// kirjoittaa oikeasti `muistutukset`-tauluun), (2) suora ⚓-ankkurointi
// (ks. lataaLaituri, kirjoittaa oikeasti `ankkurit`-tauluun). Kumpikaan ei
// vaadi tätä prompt()-pohjaista itseilmoitusta ollenkaan.
// BUGIKORJAUS (2026-07-16, ks. muistiinpanot.md kohta 9, "Laiturin 'Sijoita…'
// käsikohdevalinta"): aiempi "Minne sijoitit tämän?" oli VAPAAMUOTOINEN
// itseilmoitus (ei kirjoittanut mitään) — käsipolku on nyt AITO kirjoitustie:
// listat (Muistilaput/Varasto) ja Hytin aktiiviset kortit kirjoitetaan
// tosiasiallisesti, sama periaate kuin ⚓-oikotiellä ("Kalenteri-sijoitus ei
// kirjoita mitään" -bugikorjaus) — ehdotus- ja toteutuskerroksen pitää olla
// samaa mieltä sovelluksen kyvyistä.

// BUGIKORJAUS (2026-07-16, ks. muistiinpanot.md kohta 10, "✨-promptidiagnoosi"):
// pelkkä listan/kortin NIMI ei kerro älylle mitään kohteen LUONTEESTA — alkuperäinen
// oire (kalenteriin-ehdotus aikamäärettömälle ostosmurulle) syntyi juuri tästä
// signaalin puutteesta. Jokainen kohde saa nyt lyhyen luonnehdinnan nimen lisäksi
// (vain kuvaus, ei nimeä — nimi lisätään erikseen promptiin ettei se toistu).
// teema/vahdittu lisätty (2026-08-16, §16.5c) — ✨-ehdotus käyttää nyt samaa
// yhtenäistä kohdejoukkoa (haeKotiKohteet) kuin käsivalikko, ei enää omaa
// suppeampaa listaansa.
function kohteenKuvaus(kohde) {
  if (kohde.tyyppi === 'teema') return 'keskusteluteema Varastossa — muruja kootaan yhteen aiheeseen ajan mittaan';
  if (kohde.tyyppi === 'vahdittu') return 'vahdittu lepo — asia jonka annetaan hoitua itsestään, nousee ehdokkaaksi jos ei kuittausta';
  if (kohde.category === 'varasto') return 'varastopohja — malli/pakkauslista, EI ajankohtainen asia';
  return 'muistilaput/tehtävälista — eläviä muistiinpanoja ja tehtäviä';
}

// === LAITURIN KETJUN KOTI (2026-08-03, ks. KONSEPTIKIRJA.md 7b) ===
// Korvaa vanhan "Siirrä teemaan" -toiminnon (avaaTeemaValikko). Vanha
// mekanismi siirsi teema_id:llä KOKO ketjun kerralla pois Laiturista — liian
// raju, ei vastaa speksiä "Laiturissa näkyy aina vain ketjun uusin osa".
// Uusi malli: koti on KEVYT OSOITIN (koti_tyyppi/koti_kohde_id/koti_kohde_nimi,
// ks. sql/087), ei välitön siirto. Vanhat, jo teema_id:llä siirretyt murut
// (ennen 2026-08-03) pysyvät koskemattomina — ei takautuvaa muutosta.

// Ainoa kohdehaku Laiturille nyt (2026-08-16, §16.5c) — yhdistää vanhan
// "sijoitus"-kohdejoukon tähän: 'teema' MUKANA (koti-mekanismilla on sille
// oma kirjoitusreittinsä, laituri+teema_id, ei tuotteet-rivi, ks. sql/081),
// hytti_kortit POISSA (oma reittinsä kurssimateriaalille/helmelle/"ehdota
// Juhalle", ks. §16.5b). category+visibility mukana (§16.5c kohta 3):
// Varasto/Muistilaput-jaottelu ja näkyvyyden periytyminen tarvitsevat molemmat.
async function haeKotiKohteet() {
  const { data: listat, error: listatError } = await db.from('lists')
    .select('id, name, list_type, category, visibility').in('category', ['muistilaput', 'varasto']);
  if (listatError) console.error('Listojen haku kotivalintaa varten epäonnistui:', listatError);
  return (listat || []).map(function(l) {
    const tyyppi = l.list_type === 'teema' ? 'teema' : l.list_type === 'vahdittu' ? 'vahdittu' : 'lista';
    return { tyyppi: tyyppi, id: l.id, nimi: l.name, category: l.category, visibility: l.visibility };
  });
}

// === YHTENÄINEN KOHDEVALIKKO (2026-08-16, SATAMA_SPEKSI.md §16.5c) ===
// Korvaa VANHAN erillisen "koti"-valikon (avaaKotiValikko) JA erillisen
// "sijoita"-valikon (avaaSijoitaValikko) yhdellä valikolla — Katrin sana:
// "kaikella on yksi koti" koskee myös itse valikkoa, ei vain dataa. Kolme
// riviä: Varasto / Muistilaput / Arkistoi, EI Hytti-kohdetta (kurssimateriaali
// kulkee omaa reittiään, helmi vain Hytin omasta kontekstista, "ehdota
// Juhalle" hoitaa loput — ks. §16.5b). Sama paikka kuin ennen: ⋯-rivivalikko
// (openRowMenu), ei oma nappinsa.
// Kolmas rivi oli alunperin "🗑 Poista" (poistaLaiturinMuru, pysyvä poisto),
// vaihdettu "🗄 Arkistoi":ksi (2026-08-18/19, Katri: "archieve" vastauksena
// kysymykseen kumpi tämä oikeasti oli) — sama palautettavissa oleva
// arkistoiLaituriRivi() jota YLÄPUOLISEN ⋯-valikon oma "🗄 Arkistoi"-rivi jo
// käyttää (ks. alempana script.js:ssä) — tarkoituksellinen KAKSI reittiä
// samaan tointoon (nopea suora oikotie ⋯:stä JA tämä, kun käyttäjä on jo
// kohdevalinnassa eikä halua perua sitä), ei duplikaattivirhe. HUOM
// Katrille: poistaLaiturinMuru() (pysyvä, ei-palautettavissa oleva poisto)
// ei ole enää minkään napin takana — jätetty koodiin koskemattomana siltä
// varalta että pysyvä poisto halutaan myöhemmin esim. Arkisto-näkymän
// omaksi napiksi.
async function avaaKohdeValikko(rivi, li) {
  openRowMenu(li, [
    { label: '📦 Varasto', onClick: function() { avaaKohdeAlivalikko(rivi, li, 'varasto'); } },
    { label: '🗒️ Muistilaput', onClick: function() { avaaKohdeAlivalikko(rivi, li, 'muistilaput'); } },
    { label: '🗄 Arkistoi', onClick: function() { arkistoiLaituriRivi(rivi); } },
  ]);
}

// Alivalikko: kategorian omat listat (RLS näyttää jo oikeat — §16.5c kohta
// 2b, ei erillistä logiikkaa) + "+ Uusi lista" jos yhtään sopivaa ei vielä
// ole tai käyttäjä haluaa uuden.
async function avaaKohdeAlivalikko(rivi, li, kategoria) {
  const kaikki = await haeKotiKohteet();
  const kohteet = kaikki.filter(function(k) { return k.category === kategoria; });
  const ikoni = { teema: '🧵 ', vahdittu: '⏳ ', lista: '📓 ' };
  const items = kohteet.map(function(kohde) {
    return {
      label: (ikoni[kohde.tyyppi] || '') + kohde.nimi + (kohde.visibility === 'private' ? ' 🔒' : ''),
      onClick: function() { asetaLaiturinKoti(rivi, kohde); },
    };
  });
  items.push({ label: '+ Uusi lista', onClick: function() { luoUusiKohdeJaAseta(rivi, li, kategoria); } });
  openRowMenu(li, items);
}

// Kevyt kaksivaiheinen luonti (§16.5c kohta 3: "jos yksityistä kohdelistaa
// ei vielä ole, dropdownissa pitää voida luoda uusi suoraan") — natiivi
// prompt() nimelle (sama malli kuin muualla koodikannassa, esim.
// aihe.materiaali-linkin muokkaus), näkyvyysvalinta omana rivivalikkonaan
// koska openRowMenu ei tue tekstikenttää.
async function luoUusiKohdeJaAseta(rivi, li, kategoria) {
  const nimi = (prompt('Uuden listan nimi:') || '').trim();
  if (!nimi) return;
  openRowMenu(li, [
    { label: '🔒 Yksityinen', onClick: function() { luoListaJaAsetaKoti(rivi, nimi, kategoria, 'private'); } },
    { label: '🌍 Jaettu', onClick: function() { luoListaJaAsetaKoti(rivi, nimi, kategoria, 'shared'); } },
  ]);
}

async function luoListaJaAsetaKoti(rivi, nimi, kategoria, nakyvyys) {
  const { data, error } = await db.from('lists').insert({
    name: nimi, type: 'checklist', owner_id: currentUserId, category: kategoria, visibility: nakyvyys,
  }).select().single();
  if (ilmoitaKirjoitusvirheesta(error, 'Uuden listan luonti')) return;
  await asetaLaiturinKoti(rivi, { tyyppi: 'lista', id: data.id, nimi: data.name, category: kategoria, visibility: nakyvyys });
}

// Murun poisto siirretty tänne (2026-08-16, §16.5c) — sama toteutus kuin
// ennen erillisenä "×"-nappina, nyt osa yhtenäistä kohdevalikkoa (Katrin
// pyyntö: "Poista samaan valikkoon kohdevalintojen rinnalle, ei erilliseksi").
async function poistaLaiturinMuru(rivi) {
  const vahvistus = await naytaVahvistus('Poistetaanko tämä ajatus?', null, 'Poista');
  if (!vahvistus) return;
  const { error } = await db.from('laituri').delete().eq('id', rivi.id);
  // Jos itse murun poisto epäonnistuu, se on TODELLISUUDESSA yhä olemassa —
  // ankkurin siivousta ei saa tehdä silloin, se jättäisi orvon ankkurin
  // murulle joka ei koskaan poistunutkaan.
  if (ilmoitaKirjoitusvirheesta(error, 'Laiturin rivin poisto')) return;
  siivoaMuistutuksetKumottavasti('laituri', rivi.id);
  const { error: ankkuriError } = await db.from('ankkurit').delete().eq('source', 'laituri').eq('source_ref', String(rivi.id));
  if (ankkuriError) console.error('Ankkurin siivous murun poiston yhteydessä epäonnistui:', ankkuriError);
  const { error: jatkoAnkkuriError } = await db.from('ankkurit').delete().eq('source', 'jatkorivi').eq('source_ref', String(rivi.id));
  if (jatkoAnkkuriError) console.error('Säikeen herätysehdokkaan siivous murun poiston yhteydessä epäonnistui:', jatkoAnkkuriError);
  lataaLaituri(document.getElementById('laituri-search').value.trim());
  paivitaLaituriBadge();
}

// §16.5c kohta 3+4 (2026-08-16): näkyvyys PERIYTYY kohteesta (ei enää
// kohdekohtaista piilotus-asetusta, ks. poistettu laituri_piilota_oletus_
// kohteet), ja piilotus on nyt AINA välitön — Katrin sana: "ei tarvitse
// jäädä edes harmaana kummittelemaan vaan voi kokonaan siirtyä listaan tms."
async function asetaLaiturinKoti(rivi, kohde) {
  const nakyvyys = kohde.visibility === 'private' ? 'private' : 'shared';
  const { error } = await db.from('laituri').update({
    koti_tyyppi: kohde.tyyppi,
    koti_kohde_id: String(kohde.id),
    koti_kohde_nimi: kohde.nimi,
    piilota_laiturista: true,
    visibility: nakyvyys,
  }).eq('id', rivi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Kodin asetus')) return;
  rivi.koti_tyyppi = kohde.tyyppi;
  rivi.koti_kohde_id = String(kohde.id);
  rivi.koti_kohde_nimi = kohde.nimi;
  rivi.piilota_laiturista = true;
  rivi.visibility = nakyvyys;
  // Koko ketju (muru + kaikki vielä valumattomat jatkorivit, myös se joka
  // muuten jäisi odottamaan seuraavaa jatkoriviä) valuu NYT kotiin kerralla,
  // koska rivi katoaa Laiturista tässä samassa kirjoituksessa — ei jää
  // dangling-sisältöä piilotetun rivin taakse.
  await valutaKokoKetjuKotiin(rivi);
  naytaIlmoitus('Siirretty: ' + kohde.nimi);
  lataaLaituri(document.getElementById('laituri-search').value.trim());
}

// Kirjoittaa YHDEN valuvan segmentin sisällön kotiin KOHTEEN OMALLA
// olemassa olevalla kirjoitusreitillä — sama kaava kuin "Sovittu linja:
// vanha arvo valuu historiaan" (ks. dokumentoitu yllä KESKUSTELUTEEMA-osiossa).
// Alkuperäinen muru/jatkorivi EI KOSKAAN poistu tai muutu tässä — tämä on
// aina KOPIO, turvainvariantti säilyy.
async function kirjoitaSegmenttiKotiin(rivi, teksti) {
  if (rivi.koti_tyyppi === 'teema') {
    return db.from('laituri').insert({ content: teksti, teema_id: rivi.koti_kohde_id, status: 'uusi' });
  }
  if (rivi.koti_tyyppi === 'hytti') {
    return db.from('hytti_rivit').insert({ content: teksti, kortti_id: Number(rivi.koti_kohde_id) });
  }
  // 'lista' ja 'vahdittu' kirjoittavat molemmat samaan tuotteet-tauluun —
  // täppäysoikeus/-näkymä eroaa vain sen mukaan minkä list_type kohde on.
  return db.from('tuotteet').insert({ nimi: teksti, tehty: false, list_id: rivi.koti_kohde_id });
}

// Ketjun segmenttijono = muru (segmentti 0) + jatkorivit aikajärjestyksessä.
// Kun murulla on koti, VAIN jonon UUSIN elementti saa jäädä Laituriin — kaikki
// sitä VANHEMMAT, vielä valumattomat segmentit kirjoitetaan kotiin ja
// merkitään valuneiksi VASTA onnistuneen kirjoituksen jälkeen (kirjoituspolkujen
// sääntö 3: ei koskaan jatketa kuin kirjoitus olisi onnistunut). Aikajärjestys
// säilytetään: pysähdytään ENSIMMÄISEEN epäonnistumiseen sen sijaan että
// ohitettaisiin se ja valutettaisiin uudempi segmentti sen ohi (muuten "uusin
// valumaton" -päättely Laiturin näytössä menisi väärään segmenttiin).
async function valutaVanhatSegmentitKotiin(rivi) {
  if (!rivi.koti_tyyppi) return;
  const { data: jatkorivit, error } = await db.from('laituri_jatkorivit').select()
    .eq('muru_id', rivi.id).order('created_at', { ascending: true });
  if (error) {
    console.error('Valumista varten jatkorivien haku epäonnistui:', error);
    return;
  }
  const kaikki = jatkorivit || [];

  const vanhemmat = [];
  if (!rivi.koti_segmentti_valunut && kaikki.length > 0) {
    vanhemmat.push({ tyyppi: 'muru', teksti: rivi.content });
  }
  kaikki.forEach(function(jr, i) {
    const onUusin = i === kaikki.length - 1;
    if (!jr.valunut_kotiin && !onUusin) {
      vanhemmat.push({ tyyppi: 'jatkorivi', id: jr.id, teksti: jr.teksti });
    }
  });

  await suoritaSegmenttienValutus(rivi, vanhemmat);
}

// Koti-assignoinnin kertaluontoinen TÄYSI valutus (2026-08-16, Katrin sana:
// "ei tarvitse jäädä edes harmaana kummittelemaan vaan voi kokonaan siirtyä
// listaan tms") — eri kuin valutaVanhatSegmentitKotiin() joka AINA jättää
// uusimman segmentin näkyviin ketjun elävän kärjen ylläpitämiseksi (kutsutaan
// joka jatkorivin saapuessa, rivi pysyy näkyvissä). Tässä KOKO rivi katoaa
// Laiturista SAMALLA kirjoituksella (piilota_laiturista=true,
// asetaLaiturinKoti()), joten myös se muuten dangling jäävä uusin segmentti
// pitää siirtää mukana — muuten sen sisältö jäisi näkymättömäksi kunnes
// seuraava jatkorivi joskus laukaisisi sen.
async function valutaKokoKetjuKotiin(rivi) {
  if (!rivi.koti_tyyppi) return;
  const { data: jatkorivit, error } = await db.from('laituri_jatkorivit').select()
    .eq('muru_id', rivi.id).order('created_at', { ascending: true });
  if (error) {
    console.error('Valumista varten jatkorivien haku epäonnistui:', error);
    return;
  }
  const segmentit = [];
  if (!rivi.koti_segmentti_valunut) segmentit.push({ tyyppi: 'muru', teksti: rivi.content });
  (jatkorivit || []).forEach(function(jr) {
    if (!jr.valunut_kotiin) segmentit.push({ tyyppi: 'jatkorivi', id: jr.id, teksti: jr.teksti });
  });
  await suoritaSegmenttienValutus(rivi, segmentit);
}

// Jaettu kirjoitus+merkintäsilmukka kahdelle valutusmuodolle yllä — sama
// "kirjoitus ensin, merkintä vasta onnistuneen kirjoituksen jälkeen"
// -periaate, pysähtyy ensimmäiseen epäonnistumiseen ettei aikajärjestys
// mene sekaisin.
async function suoritaSegmenttienValutus(rivi, segmentit) {
  for (const segmentti of segmentit) {
    const { error: kirjoitusError } = await kirjoitaSegmenttiKotiin(rivi, segmentti.teksti);
    if (kirjoitusError) {
      console.error('Segmentin valuminen kotiin epäonnistui:', kirjoitusError);
      naytaIlmoitus('Osa ketjusta ei valunut kotiin vielä — yritetään uudelleen seuraavan jatkorivin yhteydessä');
      break;
    }
    if (segmentti.tyyppi === 'muru') {
      const { error: merkintaError } = await db.from('laituri').update({ koti_segmentti_valunut: true }).eq('id', rivi.id);
      if (merkintaError) { console.error('Murun valumismerkintä epäonnistui:', merkintaError); break; }
      rivi.koti_segmentti_valunut = true;
    } else {
      const { error: merkintaError } = await db.from('laituri_jatkorivit').update({ valunut_kotiin: true }).eq('id', segmentti.id);
      if (merkintaError) { console.error('Jatkorivin valumismerkintä epäonnistui:', merkintaError); break; }
    }
  }
}

// 7c: kertaluontoinen "ei tarvitse näkyä Laiturissa" -täppä. Turvainvariantti:
// rivi ei poistu eikä arkistoidu, vain suodattuu Laiturin AKTIIVISESTA
// näkymästä (ks. lataaLaituri: eq('piilota_laiturista', false)) — palautus
// mahdollinen "🙈 Piilotetut" -osiosta samalla mallilla kuin arkisto.
async function piilotaLaiturinRivi(rivi) {
  const { error } = await db.from('laituri').update({ piilota_laiturista: true }).eq('id', rivi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Piilotus')) return;
  naytaIlmoitus('Piilotettu Laiturin näkymästä');
  lataaLaituri(document.getElementById('laituri-search').value.trim());
}

async function palautaLaiturinRivi(rivi) {
  const { error } = await db.from('laituri').update({ piilota_laiturista: false }).eq('id', rivi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Piilotuksen palautus')) return;
  naytaIlmoitus('Näytetään taas Laiturissa');
  lataaLaituri(document.getElementById('laituri-search').value.trim());
  paivitaLaituriPiilotetut();
}

// Kokoontaitettava "🙈 Piilotetut" -osio Laiturin oman listan alle — sama
// UI-malli kuin "🗄 Arkisto" (paivitaLaituriArkisto), OMA mekanisminsa
// (ei tulkita käsitellyksi, ks. sql/087-kommentti).
async function paivitaLaituriPiilotetut() {
  const osio = document.getElementById('laituri-piilotetut-osio');
  const lista = document.getElementById('laituri-piilotetut-lista');
  const oliAuki = lista.style.display !== 'none';

  const { data, error } = await db.from('laituri').select().eq('piilota_laiturista', true).neq('status', 'arkistoitu').order('created_at', { ascending: false });
  if (error) {
    console.error('Piilotettujen haku epäonnistui:', error);
    return;
  }
  const rivit = data || [];

  osio.style.display = rivit.length > 0 ? 'block' : 'none';
  document.getElementById('laituri-piilotetut-toggle').textContent = '🙈 Piilotetut (' + rivit.length + ')';

  lista.innerHTML = '';
  rivit.forEach(function(rivi) {
    const li = document.createElement('li');
    li.className = 'laituri-arkisto-rivi';
    const teksti = document.createElement('span');
    teksti.textContent = rivi.content;
    li.appendChild(teksti);
    const palautaNappi = document.createElement('button');
    palautaNappi.className = 'restore-btn';
    palautaNappi.textContent = '↺';
    palautaNappi.title = 'Näytä taas Laiturissa';
    palautaNappi.addEventListener('click', function() {
      palautaLaiturinRivi(rivi);
    });
    li.appendChild(palautaNappi);
    lista.appendChild(li);
  });
  lista.style.display = oliAuki ? 'block' : 'none';
}

document.getElementById('laituri-piilotetut-toggle').addEventListener('click', function() {
  const lista = document.getElementById('laituri-piilotetut-lista');
  lista.style.display = lista.style.display === 'none' ? 'block' : 'none';
});

// laituri_piilota_oletus_kohteet -asetus POISTETTU kokonaan (2026-08-16,
// SATAMA_SPEKSI.md §16.5c kohta 5: "Tarpeeton kun jokainen ei-Laituri-kohde
// piiloutuu automaattisesti") — piilotus on nyt AINA välitön kun kohde
// asetetaan (ks. asetaLaiturinKoti), ei jää mitään konfiguroitavaa.

// Merkitsee murun sijoitetuksi VASTA kun muistutus on VARMISTETUSTI
// tallentunut (kutsutaan avaaMuistutusPaneelin jalkeenPaivitys-callbackina,
// joka laukeaa vain onnistuneen tallennuksen jälkeen — ks. lisaaMuistutus).
// Tilamerkintä seuraa siis todellisuutta, ei aikomusta.
async function merkitseLaituriMuistutuksella(rivi) {
  const { error } = await db.from('laituri').update({ status: 'sijoitettu', placed_where: 'muistutus asetettu' }).eq('id', rivi.id);
  ilmoitaKirjoitusvirheesta(error, 'Sijoitusmerkintä');
  lataaLaituri(document.getElementById('laituri-search').value.trim());
  paivitaLaituriBadge();
}

// "↺ palauta sijoittamattomaksi" — sijoitetun (tai virheellisesti
// sijoitetuksi merkityn) murun ⋯-valikon toiminto. Aina turvallinen: ei
// koskaan poista mitään, palauttaa vain tilan ja tyhjentää placed_where-
// merkinnän joka ei enää pidä paikkaansa.
async function palautaLaituriSijoittamattomaksi(rivi) {
  const { error } = await db.from('laituri').update({ status: 'uusi', placed_where: null }).eq('id', rivi.id);
  ilmoitaKirjoitusvirheesta(error, 'Palautus sijoittamattomaksi');
  lataaLaituri(document.getElementById('laituri-search').value.trim());
  paivitaLaituriBadge();
}

// Murun arkistointi (2026-07-19, ks. muistiinpanot.md "Murun arkistointi",
// konseptikirja 4.10 "Laiturin luode" — tämä erä VAIN arkistotila + nappi +
// näkymä). Sama tila, ei erillinen mekanismi (ks. OSA A "siirretty
// Kauppalistalle" — myös se on status='sijoitettu'). Turvainvariantti: TILA,
// EI delete — muru pysyy aina luettavana arkistossa, palautus mahdollinen.
async function arkistoiLaituriRivi(rivi) {
  const { error } = await db.from('laituri').update({ status: 'arkistoitu' }).eq('id', rivi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Murun arkistointi')) return;
  lataaLaituri(document.getElementById('laituri-search').value.trim());
}

// "Sama ele toisinpäin" — palautus arkistosta suoraan aktiiviseksi (status
// 'uusi', sama kuin sijoittamattomaksi-palautus yllä; ei säilytetä
// mahdollista aiempaa placed_where-arvoa, palautettu muru näyttäytyy aina
// tuoreena sijoittamattomana ajatuksena).
async function palautaLaituriArkistosta(rivi) {
  const { error } = await db.from('laituri').update({ status: 'uusi', placed_where: null }).eq('id', rivi.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Murun palautus arkistosta')) return;
  lataaLaituri(document.getElementById('laituri-search').value.trim());
}

// UI-PALAUTE (2026-07-20, ks. muistiinpanot.md "Murun arkistointi"): alkuperäinen
// erillinen dialog-overlay-arkisto vaihdettu Katrin testilöydöksen jälkeen
// kokoontaitettavaksi osioksi Laiturin OMAN listan alle — arkisto asuu nyt
// Laiturin sisällä, ei erillisenä "poissa silmistä" -paikkana ("se vain on
// siinä" -periaate). Oletuksena kiinni (vilkaisuarvo: aktiivinen näkymä pysyy
// puhtaana), napautus laajentaa saman näkymän sisällä. Kutsutaan aina
// lataaLaituri()-kutsun yhteydessä, jotta määrä+rivit pysyvät tuoreina —
// säilyttää käyttäjän auki/kiinni-valinnan, jos osio oli jo auki kesken istunnon.
async function paivitaLaituriArkisto() {
  const osio = document.getElementById('laituri-arkisto-osio');
  const lista = document.getElementById('laituri-arkisto-lista');
  const oliAuki = lista.style.display !== 'none';

  const { data, error } = await db.from('laituri').select().eq('status', 'arkistoitu').order('created_at', { ascending: false });
  if (error) {
    console.error('Laiturin arkiston haku epäonnistui:', error);
    return;
  }
  const rivit = data || [];

  osio.style.display = rivit.length > 0 ? 'block' : 'none';
  document.getElementById('laituri-arkisto-toggle').textContent = '🗄 Arkisto (' + rivit.length + ')';

  lista.innerHTML = '';
  rivit.forEach(function(rivi) {
    const li = document.createElement('li');
    li.className = 'laituri-arkisto-rivi';
    const teksti = document.createElement('span');
    teksti.textContent = rivi.content;
    li.appendChild(teksti);
    const palautaNappi = document.createElement('button');
    palautaNappi.className = 'restore-btn';
    palautaNappi.textContent = '↺';
    palautaNappi.title = 'Palauta aktiiviseksi';
    palautaNappi.addEventListener('click', function() {
      palautaLaituriArkistosta(rivi);
    });
    li.appendChild(palautaNappi);
    lista.appendChild(li);
  });
  lista.style.display = oliAuki ? 'block' : 'none';
}

document.getElementById('laituri-arkisto-toggle').addEventListener('click', function() {
  const lista = document.getElementById('laituri-arkisto-lista');
  lista.style.display = lista.style.display === 'none' ? 'block' : 'none';
});

// === LAITURIN LUOTE (2026-07-21, ks. KONSEPTIKIRJA.md 4.10 Kerros 2 / 4.10b,
// muistiinpanot.md "Laiturin luote") ===
// Viikoittainen TARJOTTU katselmus vanhoille/pysähtyneille muruille — EI
// pakollinen, EI pörise, käyttäjä avaa itse "🌊 Luote (N)" -linkistä joka
// näkyy VAIN kun jotain on kertynyt. Kolme pyyhkäisyä murulle (ankkuriin/
// anna olla/arkistoi), kevyempi "avaa/anna olla" avoimelle teemalle (2c:n
// "taattu perälauta" — sama kierros kattaa myös teemat, ei erillistä omaa
// katselmusta niille).
//
// "Pysähtynyt" = tehokas viimeisin aktiviteetti (VIIMEISIN jatkorivi jos
// sellainen on, muuten murun oma created_at — sama periaate kuin äly-yöajon
// effectiveContent()/effectiveWrittenAt()-logiikassa api/_lib/aly-nightly.js:ssä,
// vain client-puolella tässä) on vanhempi kuin `luote_raja_paivia`-asetus
// (oletus 14 pv, dataohjattu — sama "ei koodia" -periaate kuin muillakin
// Sataman kynnysarvoilla).
//
// Painava-vihje (2d-2, "vihje ohjaa JÄRJESTELMÄN aloitetta") nostaa
// priority='painava'-teemat jonon KÄRKEEN riippumatta iästä — muuten
// vanhin ensin.
let luoteJono = [];
let luoteIndeksi = 0;

async function laskeLuoteJono() {
  const rajaPaivia = haeAsetusNumero('luote_raja_paivia', 14);
  const rajaHetkiMs = Date.now() - rajaPaivia * 86400000;

  const { data: murut, error: muruError } = await db.from('laituri').select().neq('status', 'arkistoitu').is('teema_id', null);
  if (muruError) {
    console.error('Luoteen murujen haku epäonnistui:', muruError);
    return [];
  }

  const viimeisinJatkoKartta = {};
  if (murut && murut.length > 0) {
    const { data: jatkorivit } = await db.from('laituri_jatkorivit').select()
      .in('muru_id', murut.map(function(m) { return m.id; })).order('created_at', { ascending: true });
    (jatkorivit || []).forEach(function(jr) { viimeisinJatkoKartta[jr.muru_id] = jr; }); // asc → viimeisin voittaa
  }

  const jono = [];
  (murut || []).forEach(function(muru) {
    const jr = viimeisinJatkoKartta[muru.id];
    const viimeisin = new Date(jr ? jr.created_at : muru.created_at).getTime();
    if (viimeisin < rajaHetkiMs) jono.push({ tyyppi: 'muru', data: muru, viimeisin: viimeisin });
  });

  // 2c: avoimet teemat samaan kierrokseen — "taattu perälauta".
  const { data: teemat, error: teemaError } = await db.from('lists').select().eq('list_type', 'teema');
  if (!teemaError && teemat && teemat.length > 0) {
    for (const teema of teemat) {
      const { data: teemanMurut } = await db.from('laituri').select('id, created_at').eq('teema_id', teema.id);
      if (!teemanMurut || teemanMurut.length === 0) continue; // tyhjä teema — ei mitään katsottavaa
      let viimeisin = Math.max.apply(null, teemanMurut.map(function(m) { return new Date(m.created_at).getTime(); }));
      const { data: teemanJatkorivit } = await db.from('laituri_jatkorivit').select('created_at')
        .in('muru_id', teemanMurut.map(function(m) { return m.id; }));
      (teemanJatkorivit || []).forEach(function(jr) { viimeisin = Math.max(viimeisin, new Date(jr.created_at).getTime()); });
      if (viimeisin < rajaHetkiMs) jono.push({ tyyppi: 'teema', data: teema, viimeisin: viimeisin });
    }
  }

  jono.sort(function(a, b) {
    const aPainava = (a.tyyppi === 'teema' && a.data.priority === 'painava') ? 0 : 1;
    const bPainava = (b.tyyppi === 'teema' && b.data.priority === 'painava') ? 0 : 1;
    if (aPainava !== bPainava) return aPainava - bPainava;
    return a.viimeisin - b.viimeisin;
  });
  return jono;
}

async function paivitaLuoteLinkki() {
  luoteJono = await laskeLuoteJono();
  const linkki = document.getElementById('luote-linkki');
  if (luoteJono.length > 0) {
    linkki.style.display = 'block';
    linkki.textContent = '🌊 Luote (' + luoteJono.length + ')';
  } else {
    linkki.style.display = 'none';
  }
}

function naytaLuoteKohde() {
  const laskuri = document.getElementById('luote-laskuri');
  const sisalto = document.getElementById('luote-sisalto');
  const murunNapit = document.getElementById('luote-murun-napit');
  const murunNapit2 = document.getElementById('luote-murun-napit-2');
  const teemaNapit = document.getElementById('luote-teema-napit');

  if (luoteIndeksi >= luoteJono.length) {
    laskuri.textContent = '';
    sisalto.textContent = 'Ei enää mitään katsottavaa tällä kierroksella. 🌊';
    murunNapit.style.display = 'none';
    murunNapit2.style.display = 'none';
    teemaNapit.style.display = 'none';
    return;
  }

  const kohde = luoteJono[luoteIndeksi];
  laskuri.textContent = (luoteIndeksi + 1) + ' / ' + luoteJono.length;
  const paivia = Math.round((Date.now() - kohde.viimeisin) / 86400000);

  if (kohde.tyyppi === 'muru') {
    sisalto.textContent = kohde.data.content + '\n\n(' + paivia + ' päivää hiljaisuutta)';
    murunNapit.style.display = 'flex';
    murunNapit2.style.display = 'flex';
    teemaNapit.style.display = 'none';
  } else {
    sisalto.textContent = '🧵 ' + kohde.data.name + (kohde.data.sovittu_linja ? '\n📌 ' + kohde.data.sovittu_linja : '') + '\n\n(' + paivia + ' päivää hiljaisuutta)';
    murunNapit.style.display = 'none';
    murunNapit2.style.display = 'none';
    teemaNapit.style.display = 'flex';
  }
}

function luoteSeuraava() {
  luoteIndeksi++;
  naytaLuoteKohde();
}

function suljeLuote() {
  document.getElementById('luote-overlay').style.display = 'none';
  lataaLaituri(document.getElementById('laituri-search').value.trim());
  paivitaLuoteLinkki();
}

document.getElementById('luote-linkki').addEventListener('click', function() {
  luoteIndeksi = 0;
  document.getElementById('luote-overlay').style.display = 'flex';
  naytaLuoteKohde();
});
document.getElementById('luote-sulje').addEventListener('click', suljeLuote);
document.getElementById('luote-overlay').addEventListener('click', function(e) {
  if (e.target === document.getElementById('luote-overlay')) suljeLuote();
});
document.getElementById('luote-anna-olla').addEventListener('click', luoteSeuraava);
document.getElementById('luote-teema-ohita').addEventListener('click', luoteSeuraava);

document.getElementById('luote-arkistoi').addEventListener('click', async function() {
  const kohde = luoteJono[luoteIndeksi];
  if (!kohde || kohde.tyyppi !== 'muru') return;
  const { error } = await db.from('laituri').update({ status: 'arkistoitu' }).eq('id', kohde.data.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Murun arkistointi')) return;
  luoteSeuraava();
});

document.getElementById('luote-ankkuriin').addEventListener('click', async function() {
  const kohde = luoteJono[luoteIndeksi];
  if (!kohde || kohde.tyyppi !== 'muru') return;
  if (ankkuroidutAvaimet.has('laituri:' + kohde.data.id)) {
    naytaIlmoitus('Jo ankkurissa');
    luoteSeuraava();
    return;
  }
  const { error } = await db.from('ankkurit').insert({ content: kohde.data.content, source: 'laituri', source_ref: String(kohde.data.id), user_id: currentUserId });
  if (ilmoitaKirjoitusvirheesta(error, 'Ankkurointi')) return;
  await paivitaAnkkuroidutAvaimet();
  luoteSeuraava();
});

document.getElementById('luote-teema-avaa').addEventListener('click', function() {
  const kohde = luoteJono[luoteIndeksi];
  if (!kohde || kohde.tyyppi !== 'teema') return;
  document.getElementById('luote-overlay').style.display = 'none';
  avaaTeemaView(kohde.data);
});

// Siivoaa rivin (li) jälkeen mahdollisesti jo olevan ehdotuskortin pois
// ennen uuden piirtämistä tai virheen näyttämistä — estää korttien pinoamisen
// jos ✨-nappia painetaan useaan kertaan.
function poistaLaituriEhdotusKortti(li) {
  const seuraava = li.nextElementSibling;
  if (seuraava && seuraava.classList.contains('laituri-ehdotus-rivi')) {
    seuraava.remove();
  }
}

function naytaLaituriEhdotusVirhe(li, viesti) {
  poistaLaituriEhdotusKortti(li);
  const kortti = document.createElement('li');
  kortti.className = 'laituri-ehdotus-rivi laituri-ehdotus-virhe';
  kortti.textContent = viesti;
  li.insertAdjacentElement('afterend', kortti);
}

// Ainoa "kohde" jonka äly saa ehdottaa joka on OIKEASTI toteutettavissa
// automaattisesti (kirjoittaa `muistutukset`-tauluun) — ei vapaamuotoinen
// itseilmoitus kuten muut kohteet. Sama merkkijono kohdeluettelossa
// (pyydaLaituriEhdotus) ja "Sopii"-käsittelyssä alla, ettei kirjoitusvirhe
// pääse eriyttämään niitä toisistaan.
const LAITURI_MUISTUTUS_KOHDE = 'muistutus (ajankohtaan sidottu asia)';

// Piirtää äly-ehdotuksen kuittikorttina rivin alle: "→ <ehdotus> · <perustelu>"
// + Sopii/Ei-napit. "Sopii" kirjoittaa OIKEASTI (ks. asetaLaiturinKoti) jos
// ehdotus täsmää tarkalleen johonkin oikeaan kohteeseen (oikotie — säästää
// käsivalinnan), tai avaa käsikohdevalinnan jos täsmäystä ei löydy (esim.
// äly kirjoitti kohteen nimen hieman eri asussa) — ei koskaan pelkkä
// itseilmoitusdialogi, kaikki tiet johtavat aitoon kirjoitukseen.
function piirraLaituriEhdotusKortti(rivi, li, ehdotus, kohteet) {
  poistaLaituriEhdotusKortti(li);

  const kortti = document.createElement('li');
  kortti.className = 'laituri-ehdotus-rivi';

  const teksti = document.createElement('span');
  teksti.textContent = '→ ' + ehdotus.ehdotus + (ehdotus.perustelu ? ' · ' + ehdotus.perustelu : '');
  kortti.appendChild(teksti);

  const napit = document.createElement('span');
  napit.className = 'laituri-ehdotus-napit';

  const sopiiNappi = document.createElement('button');
  sopiiNappi.className = 'dialog-btn dialog-btn-cancel';
  sopiiNappi.textContent = 'Sopii';
  sopiiNappi.addEventListener('click', function() {
    poistaLaituriEhdotusKortti(li);
    if (ehdotus.ehdotus === LAITURI_MUISTUTUS_KOHDE) {
      avaaMuistutusPaneeli('laituri', rivi.id, rivi.content, null, null, function() {
        merkitseLaituriMuistutuksella(rivi);
      });
      return;
    }
    const kohde = kohteet.find(function(k) { return k.nimi === ehdotus.ehdotus; });
    if (kohde) {
      asetaLaiturinKoti(rivi, kohde);
    } else {
      avaaKohdeValikko(rivi, li);
    }
  });
  napit.appendChild(sopiiNappi);

  const eiNappi = document.createElement('button');
  eiNappi.className = 'dialog-btn dialog-btn-cancel';
  eiNappi.textContent = 'Ei';
  eiNappi.addEventListener('click', function() {
    poistaLaituriEhdotusKortti(li);
  });
  napit.appendChild(eiNappi);

  kortti.appendChild(napit);
  li.insertAdjacentElement('afterend', kortti);
}

// Jäsentää äly-putken palauttaman tekstin JSON:iksi — siivoaa mahdolliset
// ```-koodilohkoaidat jotka mallit joskus lisäävät pyynnöstä huolimatta.
// Palauttaa null (ei kaadu) jos jäsennys epäonnistuu.
function jasennaAlyJSON(teksti) {
  if (!teksti) return null;
  const siivottu = teksti.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(siivottu);
  } catch (e) {
    return null;
  }
}

// === LAITURI-JÄSENNYS (2026-08-05, ks. muistiinpanot.md "Laituri-jäsennys") ===
// Vapaan Laituri-tekstin äly-jäsennys hoito/kuljetus/yöpyminen/päiväpoikkeus
// -merkinnäksi Ristiriitapaketti v2:n tauluihin (kalenteri_tapahtumat.
// kattaa_lapset / lapsi_paivapoikkeus). SAMA /api/aly-putki kuin
// siltatunnistuksella (rakennaSiltaPrompti/etsiSiltoja yllä) — EI uutta
// endpointtia. "Äly ehdottaa, ihminen kuittaa": TUNNISTUS on paikallinen,
// halpa, ei-älyllinen heuristiikka joka VAIN näyttää kortin — itse
// älykutsu laukeaa vasta käyttäjän omasta "Tarkista"-napista, sama
// tietoinen "manuaalinen liipaisin" -periaate kuin ✨ Kysy ehdotus /
// 🌉 Etsi sillat. Ei koskaan automaattista tallennusta — kaikki kentät
// esitäytettyjä mutta muokattavissa dialogissa ennen Tallenna-nappia.

// Kevyt paikallinen tunnistus: löytyykö tekstistä JOKIN tunnettu lapsen
// nimi JA jokin päivä-/aikaviite. Ei älyä eikä väärä positiivinen maksa
// mitään (kortin voi aina ohittaa "Ei liity" -napilla) — tarkoitettu VAIN
// päättämään kannattaako kortti näyttää, ei jäsentämään mitään itse.
const HOITO_PAIVASANAT = ['tänään', 'huomenna', 'ylihuomenna', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai', 'sunnuntai', 'ma', 'ti', 'ke', 'to', 'pe', 'la', 'su'];
function naytaakoHoitomerkinnalta(teksti) {
  if (!teksti || cachedLapset.length === 0) return false;
  const pieni = teksti.toLowerCase();
  const loytyyLapsi = cachedLapset.some(function(lapsi) { return pieni.indexOf(lapsi.nimi.toLowerCase()) !== -1; });
  if (!loytyyLapsi) return false;
  return HOITO_PAIVASANAT.some(function(sana) { return pieni.indexOf(sana) !== -1; }) || /\d{1,2}\.\d{1,2}\.?/.test(pieni);
}

// Ohitetut murut (2026-08-05) muistetaan localStorageen — ilman tätä "Ei
// liity" -napin painallus unohtuisi seuraavalla Laituri-latauksella ja
// kortti tulisi takaisin joka kerta kunnes muru arkistoidaan/sijoitetaan.
// Ei uutta DB-saraketta tälle — kevyt, laitekohtainen riittää (sama
// perustelu kuin HYTTI_KALENTERISSA_KEY:llä).
const LAITURI_HOITO_OHITETUT_KEY = 'kauppalista_laituri_hoito_ohitetut';
function haeHoitoOhitetut() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LAITURI_HOITO_OHITETUT_KEY) || '[]'));
  } catch (e) {
    return new Set();
  }
}
function merkitseHoitoOhitetuksi(muruId) {
  const ohitetut = haeHoitoOhitetut();
  ohitetut.add(muruId);
  localStorage.setItem(LAITURI_HOITO_OHITETUT_KEY, JSON.stringify(Array.from(ohitetut)));
}

// Sama insertAdjacentElement('afterend', ...) -kaava kuin piirraKauppaEhdotusKortti/
// piirraHetkiSiltaKortti — kortti murun OMAN rivin JÄLKEEN sisaruksena.
function piirraHoitoJasennysKortti(rivi, li) {
  if (!naytaakoHoitomerkinnalta(rivi.content) || haeHoitoOhitetut().has(rivi.id)) return;

  const kortti = document.createElement('li');
  kortti.className = 'laituri-ehdotus-rivi';

  const teksti = document.createElement('span');
  teksti.textContent = 'Näyttää hoito-/kuljetusmerkinnältä';
  kortti.appendChild(teksti);

  const napit = document.createElement('span');
  napit.className = 'laituri-ehdotus-napit';

  const tarkistaNappi = document.createElement('button');
  tarkistaNappi.className = 'dialog-btn dialog-btn-cancel';
  tarkistaNappi.textContent = 'Tarkista';
  tarkistaNappi.addEventListener('click', function() { pyydaHoitoJasennys(rivi, tarkistaNappi); });
  napit.appendChild(tarkistaNappi);

  const eiNappi = document.createElement('button');
  eiNappi.className = 'dialog-btn dialog-btn-cancel';
  eiNappi.textContent = 'Ei liity';
  eiNappi.addEventListener('click', function() {
    merkitseHoitoOhitetuksi(rivi.id);
    kortti.remove();
  });
  napit.appendChild(eiNappi);

  kortti.appendChild(napit);
  li.insertAdjacentElement('afterend', kortti);
}

function rakennaHoitoJasennysPrompti(teksti) {
  const tanaan = new Date();
  const tanaanIso = paivamaaraISO(tanaan);
  const viikonpaiva = KALENTERI_PAIVAT[tanaan.getDay()];
  const lapsiNimet = cachedLapset.map(function(l) { return l.nimi; }).join(', ') || '(ei lapsiprofiileja)';
  return 'Tehtäväsi on jäsentää suomenkielinen vapaamuotoinen muistiinpano perheen kalenteria varten.\n' +
    'Tänään on ' + viikonpaiva + ' ' + tanaanIso + '.\n' +
    'Perheen lapset: ' + lapsiNimet + '.\n\n' +
    'Muistiinpano: "' + teksti + '"\n\n' +
    'Palauta VAIN JSON tässä muodossa, ei muuta tekstiä:\n' +
    '{\n' +
    '  "type": "event" tai "paivapoikkeus" tai "unclear",\n' +
    '  "title": "lyhyt suomenkielinen otsikko",\n' +
    '  "date": "VVVV-KK-PP",\n' +
    '  "end_date": "VVVV-KK-PP tai null (vain jos yöpyminen/monipäiväinen)",\n' +
    '  "start_time": "TT:MM tai null",\n' +
    '  "end_time": "TT:MM tai null",\n' +
    '  "children": ["nimi", ...] (vain yllä listatuista lapsista, tarkka kirjoitusasu),\n' +
    '  "event_kind": "hoito" tai "kuljetus" tai "yöpyminen" tai null,\n' +
    '  "paivapoikkeus_kind": "kotona" tai "poissa" tai "mukautettu" tai null\n' +
    '}\n' +
    'Päättele suhteelliset päivämäärät ("huomenna", "ke") tämän päivän mukaan. ' +
    'Jos et pysty päättelemään päivää lainkaan, käytä tämänpäiväistä päivämäärää ja aseta "type" arvoon "unclear".';
}

async function pyydaHoitoJasennys(rivi, nappi) {
  const alkuperainenTeksti = nappi.textContent;
  nappi.disabled = true;
  nappi.textContent = 'Tarkistetaan...';

  const prompti = rakennaHoitoJasennysPrompti(rivi.content);
  let tulos = null;
  let virhe = null;
  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    const vastaus = await fetch('/api/aly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ prompt: prompti, max_tokens: 500 }),
    });
    tulos = await vastaus.json();
    if (!vastaus.ok) virhe = tulos.error || 'Äly ei osannut tätä, kokeile myöhemmin';
  } catch (e) {
    virhe = 'Äly ei osannut tätä, kokeile myöhemmin';
  }

  nappi.disabled = false;
  nappi.textContent = alkuperainenTeksti;
  if (virhe) {
    naytaIlmoitus('Jäsennys epäonnistui: ' + virhe);
    return;
  }

  const jasennetty = jasennaAlyJSON(tulos.text);
  if (!jasennetty || !jasennetty.date) {
    naytaIlmoitus('Äly ei osannut tulkita tätä muistiinpanoa.');
    return;
  }

  avaaHoitoJasennysDialogi(rivi, jasennetty);
}

function paivitaHoitoJasennysKentat() {
  const onEvent = document.getElementById('hoito-jasennys-paatyyppi').value === 'event';
  document.getElementById('hoito-jasennys-event-kentat').style.display = onEvent ? 'block' : 'none';
  document.getElementById('hoito-jasennys-poikkeus-kentat').style.display = onEvent ? 'none' : 'block';
}
document.getElementById('hoito-jasennys-paatyyppi').addEventListener('change', paivitaHoitoJasennysKentat);

// Esitäyttää dialogin äly-jäsennyksen tuloksella — KAIKKI kentät jäävät
// muokattavaksi, mukaan lukien lapsivalinnat (nimi-täsmäytys on karkea
// pieni kirjain -vertailu, ei tarkoitettu 100% luotettavaksi, ks.
// naytaakoHoitomerkinnalta-kommentti samasta periaatteesta).
function avaaHoitoJasennysDialogi(rivi, jasennetty) {
  document.getElementById('hoito-jasennys-alkuperainen').textContent = '"' + rivi.content + '"';

  const paatyyppi = jasennetty.type === 'paivapoikkeus' ? 'paivapoikkeus' : 'event';
  document.getElementById('hoito-jasennys-paatyyppi').value = paatyyppi;
  paivitaHoitoJasennysKentat();

  const tanaanIso = paivamaaraISO(new Date());
  document.getElementById('hoito-jasennys-otsikko').value = jasennetty.title || rivi.content.slice(0, 60);
  document.getElementById('hoito-jasennys-event-laji').value = ['hoito', 'kuljetus', 'yöpyminen'].indexOf(jasennetty.event_kind) !== -1 ? jasennetty.event_kind : 'hoito';
  document.getElementById('hoito-jasennys-pvm').value = jasennetty.date || tanaanIso;
  document.getElementById('hoito-jasennys-loppupvm').value = jasennetty.end_date || '';
  document.getElementById('hoito-jasennys-alku').value = jasennetty.start_time || '';
  document.getElementById('hoito-jasennys-loppu').value = jasennetty.end_time || '';

  document.getElementById('hoito-jasennys-poikkeus-pvm').value = jasennetty.date || tanaanIso;
  document.getElementById('hoito-jasennys-poikkeus-tyyppi').value = ['kotona', 'poissa', 'mukautettu'].indexOf(jasennetty.paivapoikkeus_kind) !== -1 ? jasennetty.paivapoikkeus_kind : 'kotona';
  document.getElementById('hoito-jasennys-poikkeus-alku').value = jasennetty.start_time || '';
  document.getElementById('hoito-jasennys-poikkeus-loppu').value = jasennetty.end_time || '';

  const lista = document.getElementById('hoito-jasennys-lapset-lista');
  lista.innerHTML = '';
  const tunnistetutNimet = new Set((jasennetty.children || []).map(function(n) { return String(n).toLowerCase(); }));
  cachedLapset.forEach(function(lapsi) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '8px';
    label.style.width = '100%';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tunnistetutNimet.has(lapsi.nimi.toLowerCase());
    checkbox.dataset.lapsiId = lapsi.id;
    label.appendChild(checkbox);
    const teksti = document.createElement('span');
    teksti.textContent = lapsi.nimi;
    label.appendChild(teksti);
    li.appendChild(label);
    lista.appendChild(li);
  });

  document.getElementById('hoito-jasennys-tallenna-btn').onclick = function() { tallennaHoitoJasennys(rivi); };
  document.getElementById('hoito-jasennys-overlay').style.display = 'flex';
}

document.getElementById('hoito-jasennys-sulje').addEventListener('click', function() {
  document.getElementById('hoito-jasennys-overlay').style.display = 'none';
});

// Tallennus haarautuu kahteen TÄYSIN ERI tauluun valitun päätyypin mukaan —
// ks. Laituri-jäsennys-speksi ja tutkimusmuistio: hoito/kuljetus/yöpyminen
// ovat kalenteri_tapahtumat-rivejä (kattaa_lapset kertoo ketkä katettu),
// päiväpoikkeus on YKSI lapsi_paivapoikkeus-rivi PER valittu lapsi (upsert
// (lapsi_id,paiva)-uniikin päälle, sama malli kuin avaaLapsi-näkymän oma
// tallennus). Merkitsee murun ohitetuksi VASTA onnistuneen kirjoituksen
// jälkeen ("vahvistus seuraa todellisuutta").
async function tallennaHoitoJasennys(rivi) {
  const valitutLapsetIdt = Array.from(document.getElementById('hoito-jasennys-lapset-lista').querySelectorAll('input[type="checkbox"]:checked')).map(function(cb) { return Number(cb.dataset.lapsiId); });
  const paatyyppi = document.getElementById('hoito-jasennys-paatyyppi').value;

  if (paatyyppi === 'event') {
    const pvm = document.getElementById('hoito-jasennys-pvm').value;
    if (!pvm) { naytaIlmoitus('Anna päivä.'); return; }
    const otsikko = document.getElementById('hoito-jasennys-otsikko').value.trim() || rivi.content.slice(0, 60);
    const { error } = await db.from('kalenteri_tapahtumat').insert({
      title: otsikko,
      event_date: pvm,
      event_end_date: document.getElementById('hoito-jasennys-loppupvm').value || null,
      event_time: document.getElementById('hoito-jasennys-alku').value || null,
      event_end_time: document.getElementById('hoito-jasennys-loppu').value || null,
      user_id: currentUserId,
      kattaa_lapset: valitutLapsetIdt.length ? valitutLapsetIdt : null,
    });
    if (ilmoitaKirjoitusvirheesta(error, 'Kalenterimerkinnän tallennus')) return;
  } else {
    const pvm = document.getElementById('hoito-jasennys-poikkeus-pvm').value;
    if (!pvm) { naytaIlmoitus('Anna päivä.'); return; }
    if (valitutLapsetIdt.length === 0) { naytaIlmoitus('Valitse vähintään yksi lapsi.'); return; }
    const tyyppi = document.getElementById('hoito-jasennys-poikkeus-tyyppi').value;
    const rivit = valitutLapsetIdt.map(function(lapsiId) {
      const poikkeusRivi = { lapsi_id: lapsiId, paiva: pvm, tyyppi: tyyppi, huomio: null, alkaa: null, paattyy: null };
      if (tyyppi === 'mukautettu') {
        poikkeusRivi.alkaa = document.getElementById('hoito-jasennys-poikkeus-alku').value || null;
        poikkeusRivi.paattyy = document.getElementById('hoito-jasennys-poikkeus-loppu').value || null;
      }
      return poikkeusRivi;
    });
    const { error } = await db.from('lapsi_paivapoikkeus').upsert(rivit, { onConflict: 'lapsi_id,paiva' });
    if (ilmoitaKirjoitusvirheesta(error, 'Päiväpoikkeuksen tallennus')) return;
  }

  merkitseHoitoOhitetuksi(rivi.id);
  document.getElementById('hoito-jasennys-overlay').style.display = 'none';
  naytaIlmoitus('Tallennettu kalenteriin.');
  lataaLaituri(document.getElementById('laituri-search').value.trim());
}

// === MATERIAALIN SYÖTTÖPUTKI — TEKSTIOSA (2026-08-05, ks.
// HYTTI_SPEKSI_2026-08-05.md §9) === Sama kolmivaiheinen malli kuin
// Laituri-jäsennyksellä yllä: paikallinen heuristiikka näyttää kortin,
// käyttäjän oma "Tarkista"-napin painallus laukaisee /api/aly-kutsun,
// tulos aukeaa esitäytettynä mutta muokattavana lomakkeena.
//
// TIETOISESTI RAJATTU TÄSSÄ ERÄSSÄ: vain TEKSTI (Laituriin kirjoitettu/
// liitetty kurssimateriaali — esim. syllabus, aikataulu, litteroitu
// videotranskripti). Speksin oma prioriteettijärjestys tukee tätä rajausta
// suoraan: "Ensisijainen: jos videolla on valmis kopioitava transkripti...
// käyttäjä kopioi sen suoraan Laituriin TEKSTINÄ" — tekstipolku on jo
// speksin OMA ensisijainen reitti, ei kiertotie. Liitetiedostojen
// (ppt/pdf/kuvat/doc) raahaus/jäsennys vaatisi kokonaan uutta
// infrastruktuuria (tiedostojen tallennus, uusi /api-reitti joka osaa
// välittää liitteitä Anthropicille, docx/pptx-purku — mikään näistä ei ole
// tällä hetkellä olemassa eikä testattavissa tässä istunnossa ilman oikeaa
// tiedostoa/livepalvelinta) — TIETOINEN, OMA jatkovaihe, ei arvattu tässä.
function naytaakoKurssimateriaalilta(teksti) {
  if (!teksti || teksti.length < 120) return false;
  const paivamaaraosumat = (teksti.match(/\b\d{1,2}\.\d{1,2}\.(?:\d{2,4})?\b|\b\d{4}-\d{2}-\d{2}\b/g) || []).length;
  return paivamaaraosumat >= 3;
}

// Kurssikontekstinen materiaalin sisääntulo (2026-08-10, ks. HYTTI_SPEKSI.md
// §8.3, CODE_vaihe1_vastaukset.md) — "+ Lisää materiaalia" kurssinäkymässä
// vie Laituriin TIETÄEN jo mihin kurssiin materiaali kuuluu. Kun tämä on
// asetettu, jokainen sillä hetkellä lisättävä rivi (teksti TAI tiedosto)
// merkitään SUORAAN TIETOKANTAAN (laituri.materiaali_kurssi_id/_nimi,
// sql/117) — EI enää client-muistivaraiseen Settiin (BUGIKORJAUS
// 2026-08-16: vanha materiaaliKohdeUudetRivit-Set tyhjeni aina
// peruLaiturinMateriaaliKonteksti()-kutsussa JUURI ENNEN kuin Laiturin
// näkymä ehti koskaan piirtyä uudelleen editorin sulkemisen jälkeen, joten
// merkintä ei koskaan ehtinyt vaikuttaa mihinkään — rivit eivät näkyneet
// tarkistusjonossa eikä kurssin nimi esitäyttynyt jäsennysdialogissa,
// vaikka data itse tallentui aina oikein). Tietokantaan tallennettu merkintä
// säilyy sivun uudelleenlatauksen ja näkymänvaihdon yli, kunnes rivi on
// käsitelty (ks. piirraMateriaaliJasennysKortti/avaaMateriaaliJasennysDialogi).
// Samalla merkitään rivi YKSITYISEKSI (visibility='private', sql/118) —
// TOINEN Katrin löytämä bugi: laituri on tarkoituksella jaettu, avoimen
// RLS:n taulu (sql/004), joten kurssikohtainen opiskelumateriaali näkyi
// Juhan Laiturissa asti kunnes Katri ehti luokitella sen. 'private' piilottaa
// rivin RLS-tasolla kaikilta paitsi lisääjältä itseltään.
let materiaaliKohdeKurssi = null;
// Deadline-rivin tiedostoliite (sql/133, 2026-08-17, VAIHE2_JA_LISAYKSET_
// CODELLE.md kohta 2) — SAMA editori/kohdevalinta-kaava kuin kurssimateriaali,
// vain eri kohdekenttä. Ei omaa "tallenna, lisää seuraava osa" -kaavaa
// (yksi deadline saa tyypillisesti yhden tehtävänannon, ei monta osaa).
let materiaaliKohdeDeadline = null;

// Insert-kentät kurssi- TAI deadline-kontekstin materiaalille — sama kolme
// kenttää jokaisessa kolmesta insert-kohdasta (editorin teksti, tekstitiedosto,
// pdf/kuva/pptx), ei toistettu ehtologiikkaa kolmesti. Tarkalleen yksi
// konteksti voi olla auki kerrallaan (avaaJaettuEditori nollaa aina
// edellisen ennen uutta).
function materiaaliKohdeInsertKentat() {
  if (materiaaliKohdeDeadline) {
    return {
      materiaali_deadline_id: materiaaliKohdeDeadline.id,
      visibility: 'private',
      piilota_laiturista: true,
    };
  }
  if (!materiaaliKohdeKurssi) return {};
  return {
    materiaali_kurssi_id: materiaaliKohdeKurssi.id,
    materiaali_kurssi_nimi: materiaaliKohdeKurssi.name,
    visibility: 'private',
    // SATAMA_SPEKSI.md §16.5c kohta 4 (2026-08-16): piilotus HETI kun kohde
    // tunnetaan, sama malli kuin muut koti-kohteet — kurssisivun oma
    // odottaa/käsitelty-tila (materiaali_kasitelty, sql/121) on ERI kenttä,
    // ei tätä. Rivi katoaa Laiturista heti, käsittely näkyy vain kurssisivulla.
    piilota_laiturista: true,
  };
}

function peruLaiturinMateriaaliKonteksti() {
  materiaaliKohdeKurssi = null;
  materiaaliKohdeDeadline = null;
  paivitaLaiturinMateriaaliBanneri();
}

function paivitaLaiturinMateriaaliBanneri() {
  const banneri = document.getElementById('editori-materiaali-banneri');
  if (!banneri) return;
  if (materiaaliKohdeDeadline) {
    banneri.style.display = 'flex';
    document.getElementById('editori-materiaali-banneri-teksti').textContent = 'Liite: ' + materiaaliKohdeDeadline.teksti;
  } else if (materiaaliKohdeKurssi) {
    banneri.style.display = 'flex';
    document.getElementById('editori-materiaali-banneri-teksti').textContent = 'Materiaalia kurssille: ' + materiaaliKohdeKurssi.name;
  } else {
    banneri.style.display = 'none';
  }
}

const LAITURI_MATERIAALI_OHITETUT_KEY = 'kauppalista_laituri_materiaali_ohitetut';
function haeMateriaaliOhitetut() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LAITURI_MATERIAALI_OHITETUT_KEY) || '[]'));
  } catch (e) {
    return new Set();
  }
}
function merkitseMateriaaliOhitetuksi(muruId) {
  const ohitetut = haeMateriaaliOhitetut();
  ohitetut.add(muruId);
  localStorage.setItem(LAITURI_MATERIAALI_OHITETUT_KEY, JSON.stringify(Array.from(ohitetut)));
}

function piirraMateriaaliJasennysKortti(rivi, li) {
  if (haeMateriaaliOhitetut().has(rivi.id)) return;
  // Kurssikontekstissa (kurssisivun oma materiaalikenttä) juuri lisätyt
  // rivit ohittavat heuristiikan kokonaan — kurssi on jo tiedossa, ei
  // tarvitse arvata onko teksti kurssimateriaalia (HYTTI_SPEKSI.md §8.3).
  // Pysyvä tietokantamerkintä (materiaali_kurssi_id, sql/117), EI
  // client-muistivarainen.
  if (!naytaakoKurssimateriaalilta(rivi.content) && !rivi.materiaali_kurssi_id) return;

  const kortti = document.createElement('li');
  kortti.className = 'laituri-ehdotus-rivi';

  const teksti = document.createElement('span');
  // Kurssikontekstissa tämä on TIEDETTY asia, ei heuristiikan arvaus.
  teksti.textContent = rivi.materiaali_kurssi_id
    ? 'Materiaalia kurssille: ' + rivi.materiaali_kurssi_nimi
    : 'Näyttää kurssimateriaalilta (aikataulu/deadlinet)';
  kortti.appendChild(teksti);

  const napit = document.createElement('span');
  napit.className = 'laituri-ehdotus-napit';

  const tarkistaNappi = document.createElement('button');
  tarkistaNappi.className = 'dialog-btn dialog-btn-cancel';
  tarkistaNappi.textContent = 'Tarkista';
  tarkistaNappi.addEventListener('click', function() { pyydaMateriaaliJasennys([rivi], tarkistaNappi); });
  napit.appendChild(tarkistaNappi);

  const eiNappi = document.createElement('button');
  eiNappi.className = 'dialog-btn dialog-btn-cancel';
  eiNappi.textContent = 'Ei liity';
  eiNappi.addEventListener('click', function() {
    merkitseMateriaaliOhitetuksi(rivi.id);
    kortti.remove();
  });
  napit.appendChild(eiNappi);

  kortti.appendChild(napit);
  li.insertAdjacentElement('afterend', kortti);
}

// monessaOsassa (2026-08-17, Katrin havainto: pitkä materiaali liitetään
// usein useassa palassa, "1 osa kerrallaan ku ei aina ehdi koko rimpsua") —
// AI:n pitää käsitellä KAIKKI osat yhtenä kokonaisuutena eikä ehdottaa
// solmuja yhden osan perusteella. Jos materiaalissa on selkeä olemassa
// oleva otsikkojako, sitä noudatetaan; muuten AI pilkkoo järkevästi ikään
// kuin otsikoita ei olisi.
function rakennaMateriaaliJasennysPrompti(teksti, monessaOsassa) {
  const tanaanIso = paivamaaraISO(new Date());
  return 'Tehtäväsi on jäsentää kurssimateriaali (esim. syllabus, aikataulu, litteroitu luento) rakenteeseen jota opiskelun seurantasovellus käyttää.\n' +
    'Tänään on ' + tanaanIso + '.\n\n' +
    (monessaOsassa
      ? 'Materiaali on liitetty useassa osassa peräkkäin (merkitty "--- osa N ---" -väliotsikoin) — käsittele KAIKKI osat yhtenä kokonaisuutena, älä tee ehdotusta minkään yksittäisen osan perusteella.\n\n'
      : '') +
    'Aiheiden rajaus (18.8.2026, tärkeä): jokainen "aihe" vastaa YHTÄ MODUULIA/VIIKKOA/ISOA KOKONAISUUTTA opiskelusuunnitelmassa, EI yksittäistä alaotsikkoa. Jos materiaalissa on kaksitasoinen numerointi (esim. "1.1", "1.2", "2.1", "2.2" tms.), YHDISTÄ kaikki saman ylätason numeron (1.*, 2.* jne.) alaotsikot YHDEKSI aiheeksi — älä tee omaa aihetta jokaisesta alaotsikosta. Tavoite on karkeasti yksi aihe per moduuli (jos materiaalissa on esim. 7 moduulia, tuota noin 7 aihetta, ei 30+). Jos materiaalissa ei ole mitään moduulijakoa, pilko järkeviksi, riittävän isoiksi aihekokonaisuuksiksi ikään kuin otsikoita ei olisi lainkaan — vältä liian pientä pilkontaa (yksittäinen käsite ei ole oma aihe).\n\n' +
    'Materiaali: "' + teksti + '"\n\n' +
    'Palauta VAIN JSON tässä muodossa, ei muuta tekstiä:\n' +
    '{\n' +
    '  "kurssi_nimi": "kurssin nimi jos pääteltävissä, muuten paras arvaus",\n' +
    '  "aiheet": [{ "nimi": "väliotsikon/aiheen nimi", "tavoiteikkuna": "VVVV-KK-PP tai null", "tyyppi": "procedural" tai "analogous" tai "conceptual" }],\n' +
    '  "deadlinet": [{ "pvm": "VVVV-KK-PP", "tyyppi": "koe" tai "palautus" }]\n' +
    '}\n' +
    'Poimi VAIN materiaalissa oikeasti mainitut asiat, älä keksi. Aiheiden pitää olla väliotsikkotason kokonaisuuksia ' +
    '(ei liian pieniä yksittäisiä käsitteitä, ei liian isoja koko-kurssin-kokoisia).\n\n' +
    'Aiheen "tyyppi" kuvaa millaista tietoa aihe pääasiassa sisältää — arvaa paras vaihtoehto äläkä jätä tyhjäksi: ' +
    '"procedural" = miten jokin tehdään (menetelmä, algoritmi, kaava jota sovelletaan), ' +
    '"analogous" = liittyy johonkin jo tuttuun/opittuun ja kannattaa oppia sen kautta, ' +
    '"conceptual" = mitä jokin on (määritelmä, teoria, ilmiö). Jos oikeasti epäselvää, käytä "conceptual".';
}

// rivit (2026-08-17, Katrin havainto: pitkä materiaali liitetään usein
// monessa osassa, äly ei saa nähdä/ehdottaa vain viimeisimmän osan
// perusteella) — AINA taulukko, myös yhden rivin tapauksessa (Laiturin
// yleinen heuristiikkalöydös, ei kurssikontekstia). Rivit yhdistetään
// content-kentistä yhdeksi tekstiksi "--- osa N ---" -väliotsikoin kun
// niitä on useampi.
async function pyydaMateriaaliJasennys(rivit, nappi) {
  const alkuperainenTeksti = nappi.textContent;
  nappi.disabled = true;
  nappi.textContent = 'Tarkistetaan...';

  const monessaOsassa = rivit.length > 1;
  const yhdistettyTeksti = monessaOsassa
    ? rivit.map(function(r, i) { return '--- osa ' + (i + 1) + ' ---\n' + r.content; }).join('\n\n')
    : rivit[0].content;
  const prompti = rakennaMateriaaliJasennysPrompti(yhdistettyTeksti, monessaOsassa);
  let tulos = null;
  let virhe = null;
  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    const vastaus = await fetch('/api/aly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ prompt: prompti, max_tokens: 1500 }),
    });
    tulos = await vastaus.json();
    if (!vastaus.ok) virhe = tulos.error || 'Äly ei osannut tätä, kokeile myöhemmin';
  } catch (e) {
    virhe = 'Äly ei osannut tätä, kokeile myöhemmin';
  }

  nappi.disabled = false;
  nappi.textContent = alkuperainenTeksti;
  if (virhe) {
    naytaIlmoitus('Jäsennys epäonnistui: ' + virhe);
    return;
  }

  const jasennetty = jasennaAlyJSON(tulos.text);
  if (!jasennetty || (!Array.isArray(jasennetty.aiheet) && !Array.isArray(jasennetty.deadlinet))) {
    naytaIlmoitus('Äly ei osannut tulkita tätä materiaalia.');
    return;
  }

  avaaMateriaaliJasennysDialogi(rivit, jasennetty);
}

function avaaMateriaaliJasennysDialogi(rivit, jasennetty) {
  const rivi = rivit[0]; // kurssikontekstissa kaikki rivit jakavat saman kurssin — riittää edustajaksi
  const esikatseluTeksti = rivit.length > 1 ? (rivit.length + ' osaa yhteensä') : rivi.content;
  document.getElementById('materiaali-jasennys-alkuperainen').textContent = '"' + esikatseluTeksti.slice(0, 200) + (esikatseluTeksti.length > 200 ? '…' : '') + '"';
  const kurssiInput = document.getElementById('materiaali-jasennys-kurssi-input');
  // Kurssikontekstissa kurssi on jo tiedossa (kurssisivun oma materiaali-
  // kenttä) — käyttäjän ei tarvitse kirjoittaa/tarkistaa sitä (HYTTI_SPEKSI.md §8.3).
  // Luetaan RIVILTÄ (materiaali_kurssi_nimi, sql/117), ei materiaaliKohdeKurssi-
  // muuttujasta — se on jo nollattu tähän mennessä (rivi voi tulla auki myös
  // myöhemmin, eri istunnossa, kuin milloin se lisättiin).
  kurssiInput.value = rivi.materiaali_kurssi_id ? rivi.materiaali_kurssi_nimi : (jasennetty.kurssi_nimi || '');
  kurssiInput.disabled = !!rivi.materiaali_kurssi_id;

  const aiheLista = document.getElementById('materiaali-jasennys-aihe-lista');
  aiheLista.innerHTML = '';
  const aiheet = Array.isArray(jasennetty.aiheet) ? jasennetty.aiheet : [];
  document.getElementById('materiaali-jasennys-aihe-osio').style.display = aiheet.length === 0 ? 'none' : 'block';
  aiheet.forEach(function(aihe) {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.className = 'materiaali-jasennys-checkbox';
    li.appendChild(checkbox);
    const nimiInput = document.createElement('input');
    nimiInput.type = 'text';
    nimiInput.className = 'jatkorivi-teksti';
    nimiInput.value = aihe.nimi || '';
    li.appendChild(nimiInput);
    const pvmInput = document.createElement('input');
    pvmInput.type = 'date';
    pvmInput.value = aihe.tavoiteikkuna || '';
    li.appendChild(pvmInput);
    li._checkbox = checkbox;
    li._nimiInput = nimiInput;
    li._pvmInput = pvmInput;
    // Äylyn päättelemä PACER-tietotyyppi (18.8.2026, ks. rakennaMateriaali-
    // Jasennysprompti) — kulkee mukana HILJAA, ei omaa valintaelementtiä
    // tässäkään dialogissa (sama periaate kuin listariviltä poistettu
    // pakkovalinta: ei kysytä uudelleen jos joku jo vastasi puolesta).
    li._tyyppi = PACER_TYYPPI_V1.indexOf(aihe.tyyppi) !== -1 ? aihe.tyyppi : null;
    aiheLista.appendChild(li);
  });

  const deadlineLista = document.getElementById('materiaali-jasennys-deadline-lista');
  deadlineLista.innerHTML = '';
  const deadlinet = Array.isArray(jasennetty.deadlinet) ? jasennetty.deadlinet : [];
  document.getElementById('materiaali-jasennys-deadline-osio').style.display = deadlinet.length === 0 ? 'none' : 'block';
  deadlinet.forEach(function(dl) {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.className = 'materiaali-jasennys-checkbox';
    li.appendChild(checkbox);
    const pvmInput = document.createElement('input');
    pvmInput.type = 'date';
    pvmInput.value = dl.pvm || '';
    li.appendChild(pvmInput);
    const tyyppiSelect = document.createElement('select');
    ['koe', 'palautus'].forEach(function(t) {
      const optio = document.createElement('option');
      optio.value = t;
      optio.textContent = t === 'koe' ? 'Koe' : 'Palautus';
      if (t === dl.tyyppi) optio.selected = true;
      tyyppiSelect.appendChild(optio);
    });
    li.appendChild(tyyppiSelect);
    li._checkbox = checkbox;
    li._pvmInput = pvmInput;
    li._tyyppiSelect = tyyppiSelect;
    deadlineLista.appendChild(li);
  });

  document.getElementById('materiaali-jasennys-tallenna-btn').onclick = function() { tallennaMateriaaliJasennys(rivit); };
  document.getElementById('materiaali-jasennys-overlay').style.display = 'flex';
}

document.getElementById('materiaali-jasennys-sulje').addEventListener('click', function() {
  document.getElementById('materiaali-jasennys-overlay').style.display = 'none';
});

// Löytää olemassa olevan AKTIIVISEN kurssin täsmällisellä nimellä, tai luo
// uuden — EI koskaan hiljaista duplikaattia jos nimi jo täsmää (sama "yksi
// koti" -periaate kuin muuallakin).
async function haeTaiLuoOpintoKurssiNimella(nimi) {
  const { data: olemassaOleva, error: hakuError } = await db.from('opinto_kurssit').select().eq('name', nimi).maybeSingle();
  if (hakuError) return { error: hakuError };
  if (olemassaOleva) return { data: olemassaOleva };
  return await db.from('opinto_kurssit').insert({ name: nimi, owner_id: currentUserId }).select().single();
}

async function tallennaMateriaaliJasennys(rivit) {
  const rivi = rivit[0];
  const kurssiNimi = document.getElementById('materiaali-jasennys-kurssi-input').value.trim();
  if (!kurssiNimi) { naytaIlmoitus('Anna kurssin nimi.'); return; }

  // Kurssikontekstissa kurssi on jo TIEDETTY (rivi.materiaali_kurssi_id) —
  // käytetään sitä suoraan, ei nimihakua (kenttä on lukittu eikä käyttäjä
  // voi muuttaa sitä, joten nimi täsmäisi joka tapauksessa, mutta id on
  // täsmällisempi eikä riipu nimen täsmäävyydestä).
  let kurssi;
  if (rivi.materiaali_kurssi_id) {
    kurssi = { id: rivi.materiaali_kurssi_id };
  } else {
    const { data, error: kurssiError } = await haeTaiLuoOpintoKurssiNimella(kurssiNimi);
    if (ilmoitaKirjoitusvirheesta(kurssiError, 'Kurssin haku/luonti')) return;
    kurssi = data;
  }

  const valitutAiheet = Array.from(document.getElementById('materiaali-jasennys-aihe-lista').children)
    .filter(function(li) { return li._checkbox.checked && li._nimiInput.value.trim(); })
    .map(function(li) { return { kurssi_id: kurssi.id, name: li._nimiInput.value.trim(), tavoiteikkuna: li._pvmInput.value || null, pacer_paatyyppi: li._tyyppi || null }; });
  if (valitutAiheet.length > 0) {
    const { error } = await db.from('opinto_aiheet').insert(valitutAiheet);
    if (ilmoitaKirjoitusvirheesta(error, 'Aiheiden tallennus')) return;
  }

  const valitutDeadlinet = Array.from(document.getElementById('materiaali-jasennys-deadline-lista').children)
    .filter(function(li) { return li._checkbox.checked && li._pvmInput.value; })
    .map(function(li) { return { kurssi_id: kurssi.id, pvm: li._pvmInput.value, tyyppi: li._tyyppiSelect.value }; });
  if (valitutDeadlinet.length > 0) {
    const { error } = await db.from('opinto_deadlinet').insert(valitutDeadlinet);
    if (ilmoitaKirjoitusvirheesta(error, 'Deadlinejen tallennus')) return;
  }

  // Hyväksytty materiaali ei jää näkyville Laituriin — sama tietokantalippu
  // kuin muilla kohdetyypeillä (piilota_laiturista, ks. lataaLaituri:n
  // eq('piilota_laiturista', false)), EI selainkohtainen localStorage-
  // merkintä joka ei kulkisi laitteiden välillä. Kurssikontekstissa tämä on
  // jo true insert-hetkellä (§16.5c kohta 4, materiaaliKohdeInsertKentat) —
  // kirjoitus tänne on silti turvallinen (idempotentti) ja PAKOLLINEN
  // Laiturin heuristiikka-löydöille (ei kurssikontekstia), joilla tämä on
  // ensimmäinen piilotushetki. materiaali_kasitelty (sql/121) on ERI kenttä —
  // kurssisivun oma "✓ käsitelty" -tila, ei sama asia kuin Laiturista
  // piiloutuminen. merkitseMateriaaliOhitetuksi() pysyy käytössä VAIN
  // "Ei liity" -hylkäykselle (ks. piirraMateriaaliJasennysKortti) — se on
  // eri asia: ehdotuksen hylkäys, ei sisällön piilotus. Merkitään KAIKKI
  // yhdistetyt rivit (ei vain ensimmäinen) jottei sama osa jää ikuisesti
  // "⏳ odottaa" -tilaan yhdistetyn tarkistuksen jälkeen.
  const { error: piilotaError } = await db.from('laituri').update({ piilota_laiturista: true, materiaali_kasitelty: true }).in('id', rivit.map(function(r) { return r.id; }));
  if (piilotaError) console.error('Materiaalin piilotus/käsittelymerkintä epäonnistui (tallennus onnistui silti):', piilotaError);
  document.getElementById('materiaali-jasennys-overlay').style.display = 'none';
  naytaIlmoitus('Tallennettu Opintopolulle (' + kurssiNimi + ').');
  peruLaiturinMateriaaliKonteksti();
  lataaLaituri(document.getElementById('laituri-search').value.trim());
  // Kurssisivun oma materiaalilista (2026-08-16) — päivitetään SAMALLA jos
  // ollaan parhaillaan sillä sivulla (rivi käsiteltiin joko sieltä tai
  // Laiturin tarkistusjonosta, kumpikin päätyy tänne).
  if (currentOpintoKurssi) lataaOpintoKurssiMateriaalit();
}

// Laituri-avustaja (2026-07-12) — ensimmäinen oikea älyominaisuus äly-putken
// päälle (ks. COPILOT.md "Äly-putki" -osio, "tapa A": sama /api/aly, uusi
// prompti). ÄLY EHDOTTAA, IHMINEN KUITTAA: kysyy äly-putkelta ehdotuksen
// mihin muru kuuluisi, näyttää sen kuittikorttina — EI KOSKAAN siirrä tai
// tallenna mitään automaattisesti. Kutsutaan VAIN napin painalluksesta,
// ei koskaan automaattisesti joka riville (ei yllätyskuluja).
async function pyydaLaituriEhdotus(rivi, nappi, li) {
  nappi.disabled = true;
  const alkuperainenTeksti = nappi.textContent;
  nappi.textContent = '…';

  // Kaikki konkreettiset kohteet (listat, sama yhtenäinen joukko kuin
  // käsivalikossa) DYNAAMISESTI joka kutsulla — EI kovakoodattua listaa,
  // jottei tarvitse muistaa päivittää tätä kun listoja lisätään/poistetaan/
  // nimetään uudelleen. RLS rajaa tuloksen jo automaattisesti kirjautuneen
  // näkyviin listoihin (omat + jaetut).
  const kohteet = await haeKotiKohteet();
  // BUGIKORJAUS (2026-07-17): 'kalenteriin' POISTETTU kohdevalikoimasta —
  // Satamalla EI OLE kalenterikirjoituspolkua (ei omaan kalenterinäkymään,
  // ei tietenkään iCloudiin), joten se oli itseilmoituskohteista ainoa joka
  // näytti tuottavan jotain vaikka ei tuottanut mitään. Tilalla aidosti
  // toteutettavissa oleva muistutus (ks. LAITURI_MUISTUTUS_KOHDE ja
  // piirraLaituriEhdotusKortti) — ehdotus- ja toteutuskerroksen pitää olla
  // samaa mieltä sovelluksen kyvyistä. "Hytin kortille" POISTETTU
  // kokonaan 2026-08-16 (§16.5c) — kurssimateriaalilla/helmellä on omat
  // reittinsä, eivät kulje tämän ehdotuskerroksen kautta.
  const prompti = 'Tässä on lyhyt muistiinpano perheen "Laituri"-muistilistalta: "' + rivi.content + '"\n\n' +
    'Mahdolliset sijoituskohteet (nimi — luonnehdinta kohteen luonteesta):\n' +
    kohteet.map(function(k) { return '- "' + k.nimi + '" — ' + kohteenKuvaus(k); }).join('\n') + '\n' +
    '- "' + LAITURI_MUISTUTUS_KOHDE + '" — ajankohtaan/kellonaikaan sidottu asia (esim. "huomenna klo 16")\n' +
    '- "ei mikään näistä" — jos mikään ei sovi tai olet epävarma\n\n' +
    'Ehdota YKSI näistä kohteista johon tämä muistiinpano todennäköisimmin kuuluisi, kohteen LUONNEHDINNAN perusteella — ' +
    'älä ehdota ajankohtaan sidottua kohdetta ellei muistiinpanossa ole selvä ajanmääre. ' +
    'Vastaa VAIN JSON-muodossa, ei mitään muuta tekstiä, ei markdown-koodilohkoja:\n' +
    '{"ehdotus": "<kohteen nimi TARKALLEEN yllä olevalta listalta, ilman luonnehdintaa>", "perustelu": "<max 10 sanaa suomeksi>"}';

  // Diagnostiikka (2026-07-16, kohta 10): koko lähetetty prompti näkyviin
  // konsoliin joka kutsulla — helpottaa jatkossa sen näkemistä TARKALLEEN
  // mitä äly sai syötteekseen, ei tarvitse arvailla mistä väärä ehdotus johtui.
  console.log('[laituri-ehdotus] prompti:', prompti);

  let tulos = null;
  let virhe = null;
  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    const vastaus = await fetch('/api/aly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ prompt: prompti, max_tokens: 100 }),
    });
    tulos = await vastaus.json();
    if (!vastaus.ok) virhe = tulos.error || 'Äly ei osannut tätä, kokeile myöhemmin';
  } catch (e) {
    virhe = 'Äly ei osannut tätä, kokeile myöhemmin';
  }

  nappi.disabled = false;
  nappi.textContent = alkuperainenTeksti;

  if (virhe) {
    naytaLaituriEhdotusVirhe(li, virhe);
    return;
  }

  const ehdotus = jasennaAlyJSON(tulos.text);
  if (!ehdotus || !ehdotus.ehdotus) {
    naytaLaituriEhdotusVirhe(li, 'Äly ei osannut tätä, kokeile myöhemmin');
    return;
  }

  piirraLaituriEhdotusKortti(rivi, li, ehdotus, kohteet);
}

// Muuttaa listan nimen inline-muokattavaksi kotinäkymässä
function aloitaListanMuokkaus(teksti, lista, paivitaNakyma) {
  const inputti = document.createElement('input');
  inputti.type = 'text';
  inputti.value = lista.name;
  inputti.className = 'edit-input';
  teksti.replaceWith(inputti);
  inputti.focus();
  inputti.setSelectionRange(inputti.value.length, inputti.value.length);
  inputti.addEventListener('click', function(e) { e.stopPropagation(); });

  async function tallenna() {
    const uusi = inputti.value.trim();
    if (uusi && uusi !== lista.name) {
      const { error } = await db.from('lists').update({ name: uusi }).eq('id', lista.id);
      if (!ilmoitaKirjoitusvirheesta(error, 'Listan nimen muokkaus')) {
        logEvent('renamed', 'list', lista.id, uusi, lista.id);
      }
    }
    paivitaNakyma();
  }

  inputti.addEventListener('blur', tallenna);
  inputti.addEventListener('keydown', function(e) {
    e.stopPropagation();
    if (e.key === 'Enter') inputti.blur();
    if (e.key === 'Escape') { inputti.value = lista.name; inputti.blur(); }
  });
}

// Näyttää oman kuitti-tyylisen vahvistusdialogin ja palauttaa Promise<boolean>
function naytaVahvistus(otsikko, teksti, poistaTeksti) {
  return new Promise(function(resolve) {
    const overlay = document.getElementById('dialog-overlay');
    const titleEl = document.getElementById('dialog-title');
    const bodyEl = document.getElementById('dialog-body');
    const peruNappi = document.getElementById('dialog-cancel');
    const poistaNappi = document.getElementById('dialog-confirm');

    titleEl.textContent = otsikko;
    poistaNappi.textContent = poistaTeksti || 'Poista';
    if (teksti) {
      bodyEl.textContent = teksti;
      bodyEl.style.display = 'block';
    } else {
      bodyEl.style.display = 'none';
    }

    function sulje(tulos) {
      overlay.style.display = 'none';
      overlay.removeEventListener('click', ulkopuolelleKlikkaus);
      peruNappi.removeEventListener('click', peru);
      poistaNappi.removeEventListener('click', vahvista);
      resolve(tulos);
    }
    function peru() { sulje(false); }
    function vahvista() { sulje(true); }
    function ulkopuolelleKlikkaus(e) {
      if (e.target === overlay) sulje(false);
    }

    peruNappi.addEventListener('click', peru);
    poistaNappi.addEventListener('click', vahvista);
    overlay.addEventListener('click', ulkopuolelleKlikkaus);

    overlay.style.display = 'flex';
  });
}

// Deletion proceeds in strict FK-safe order (tuotteet -> events -> lists,
// same order as the idempotency comments in sql/036-039) and STOPS at the
// first failed step — it never silently continues to the next step if one
// fails (bug 2026-07-13: the events table was missing a delete policy, so
// its delete silently affected 0 rows due to RLS, and the following lists
// delete then failed on a foreign key violation — the error only reached
// the console, never the user, so "delete" silently did nothing and never
// said why. Fixed on the policy side in sql/039, but this code must never
// swallow an error silently again regardless of what causes it in future).
async function deleteList(list, refreshView) {
  // Keskusteluteema (2026-07-21, ks. muistiinpanot.md "Keskusteluteema
  // Varastossa") — teemalla ei ole tuotteet-rivejä ollenkaan (sisältö on
  // laituri-rivejä teema_id:n kautta), joten vahvistuksen pitää laskea
  // OIKEA taulu jotta käyttäjä näkee mitä on oikeasti katoamassa ennen
  // tietoista poistopäätöstä ("vahvistus seuraa todellisuutta").
  let count;
  if (list.list_type === 'teema') {
    ({ count } = await db.from('laituri').select('id', { count: 'exact', head: true }).eq('teema_id', list.id));
  } else {
    ({ count } = await db.from('tuotteet').select('id', { count: 'exact', head: true }).eq('list_id', list.id));
  }
  const message = count > 0
    ? (list.list_type === 'teema' ? 'Teemassa on ' + count + ' murua säikeineen — nekin poistuvat PYSYVÄSTI, ei arkistoon.' : 'Listalla on ' + count + ' asiaa — nekin poistuvat.')
    : null;
  const confirmed = await naytaVahvistus('Poistetaanko ' + list.name + '?', message, 'Poista lista');
  if (!confirmed) return;

  const deleteItems = await db.from('tuotteet').delete().eq('list_id', list.id);
  if (deleteItems.error) {
    console.error('Listan tuotteiden poisto epäonnistui:', deleteItems.error);
    naytaIlmoitus('Listan poisto epäonnistui (tuotteet): ' + (deleteItems.error.message || 'tuntematon virhe') + ' — kerro tämä Claudelle/Copilotille.');
    return;
  }

  const deleteEvents = await db.from('events').delete().eq('list_id', list.id);
  if (deleteEvents.error) {
    console.error('Listan tapahtumien poisto epäonnistui:', deleteEvents.error);
    naytaIlmoitus('Listan poisto epäonnistui (tapahtumat): ' + (deleteEvents.error.message || 'tuntematon virhe') + ' — kerro tämä Claudelle/Copilotille.');
    return;
  }

  const deleteListRow = await db.from('lists').delete().eq('id', list.id);
  if (deleteListRow.error) {
    console.error('Listan poisto epäonnistui:', deleteListRow.error);
    naytaIlmoitus('Listan poisto epäonnistui: ' + (deleteListRow.error.message || 'tuntematon virhe') + ' — kerro tämä Claudelle/Copilotille.');
    return;
  }

  logEvent('deleted', 'list', list.id, list.name, null);

  if (currentList && currentList.id === list.id) {
    currentList = null;
  }
  refreshView();
  naytaIlmoitus('Lista "' + list.name + '" poistettu.');
}

// Kirjautumisen jälkeen: näytetään aina Etusivu
function siirryKirjautumisenJalkeen() {
  showHomeView();
  paivitaHenkiloKartta();
  // Ladattu tässä (eikä vain lataaKalenteri():ssä kuten ennen Laituri-
  // jäsennystä) koska naytaakoHoitomerkinnalta() (Laituri-jäsennys, ks.
  // muistiinpanot.md) tarvitsee cachedLapset:in jo silloin jos käyttäjä
  // avaa Laiturin ennen Kalenteria koskaan käymättä.
  paivitaLapsidata();
  lataaKotinakyma();
}

// Kirjaa tapahtuman lokiin. Ei koskaan estä käyttöliittymää — virheet vaietaan.
function logEvent(action, targetType, targetId, targetName, listId) {
  db.from('events').insert({
    user_id: currentUserId,
    action: action,
    target_type: targetType,
    target_id: targetId != null ? String(targetId) : null,
    target_name: targetName,
    list_id: listId,
  }).then(function() {}, function() {});
}

// === OFFLINE-JONO ===
const QUEUE_KEY = 'kauppalista_jono';

function getQueue() {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
}

function saveQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  updateSyncIndicator();
}

function addToQueue(action) {
  const q = getQueue();
  q.push(action);
  saveQueue(q);
}

function updateSyncIndicator() {
  let el = document.getElementById('sync-indicator');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sync-indicator';
    el.className = 'sync-indicator';
    const divider = document.querySelector('#app-view .divider');
    divider.parentNode.insertBefore(el, divider);
  }
  const q = getQueue();
  if (!navigator.onLine) {
    el.textContent = '● ei yhteyttä';
    el.style.display = 'block';
  } else if (q.length > 0) {
    el.textContent = '● synkronoidaan...';
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

async function processQueue() {
  const q = getQueue();
  if (q.length === 0) return;
  const remaining = [];
  for (const action of q) {
    try {
      let error;
      if (action.type === 'insert') {
        ({ error } = await db.from('tuotteet').insert(action.data));
      } else if (action.type === 'update') {
        const { id, ...data } = action.data;
        ({ error } = await db.from('tuotteet').update(data).eq('id', id));
      } else if (action.type === 'delete') {
        ({ error } = await db.from('tuotteet').delete().eq('id', action.data.id));
      }
      // BUGIKORJAUS (2026-07-19, ks. muistiinpanot.md "Kirjoituspolkujen
      // auditointi"): supabase-js EI HEITÄ poikkeusta tietokantatason
      // virheestä (esim. RLS/rajoite-rikkomus — sama laji kuin historiallinen
      // caldav-duplikaattibugi) — se VAIN palauttaa error-kentän. Aiemmin
      // tätä ei tarkistettu lainkaan, joten epäonnistunut kirjoitus katosi
      // jonosta ANNETTUNA ONNISTUNEENA. Nyt myös DB-tason virhe pitää
      // toimenpiteen jonossa (retry seuraavalla online-tapahtumalla) ja
      // lokittaa sen näkyväksi kehittäjätyökaluihin.
      if (error) {
        console.error('Offline-jonon toimenpide epäonnistui (' + action.type + '):', error);
        remaining.push(action);
      }
    } catch (e) {
      console.error('Offline-jonon toimenpide heitti poikkeuksen (' + action.type + '):', e);
      remaining.push(action);
    }
  }
  saveQueue(remaining);
  lataaLista();
}

window.addEventListener('online', () => { updateSyncIndicator(); processQueue(); });
window.addEventListener('offline', () => { updateSyncIndicator(); });

const SVG_SILMA_AUKI = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const SVG_SILMA_KIINNI = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

// Poistaa tuotteen tai väliotsikon (yhteinen molemmille)
async function poistaTuote(tuote) {
  const vahvistus = await naytaVahvistus('Poistetaanko ' + tuote.nimi + '?', null, tuote.is_header ? 'Poista' : 'Poista tuote');
  if (!vahvistus) return;

  if (aktiivinenOtsikkoId === tuote.id) {
    aktiivinenOtsikkoId = null;
    paivitaLisaysKohde();
  }

  if (navigator.onLine) {
    const { error } = await db.from('tuotteet').delete().eq('id', tuote.id);
    // Tapahtumaloki EI SAA väittää poistoa tehdyksi jos se ei onnistunut
    // (ks. muistiinpanot.md "Kirjoituspolkujen auditointi").
    if (!ilmoitaKirjoitusvirheesta(error, 'Poisto')) {
      siivoaMuistutuksetKumottavasti('rivi', tuote.id);
      logEvent('deleted', tuote.is_header ? 'header' : 'item', tuote.id, tuote.nimi, tuote.list_id);
    }
    lataaLista();
  } else {
    addToQueue({ type: 'delete', data: { id: tuote.id } });
    cachedTuotteet = cachedTuotteet.filter(t => t.id !== tuote.id);
    paivitaNaytto(cachedTuotteet);
    paivitaFooter(cachedTuotteet);
    logEvent('deleted', tuote.is_header ? 'header' : 'item', tuote.id, tuote.nimi, tuote.list_id);
  }
}

// Pieni tuntopalaute kun jokin merkitään valmiiksi (tuote, ankkuri) — ei
// jokaisesta klikkauksesta, vain onnistumisesta. Ei kaadu jos laite ei tue.
function tuntopalauteValmis() {
  if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
}

// Kirjoituspolkujen auditointi (2026-07-19, ks. muistiinpanot.md) — jaettu
// virheenkäsittelijä useimmille rivikohtaisille täppäys-/muokkauskirjoituksille,
// jotka jakavat saman muodon (kirjoita, sitten lataa näkymä tuoreesta datasta
// uudelleen). Uudelleenlataus itsessään korjaa NÄKYMÄN aina oikein
// (epäonnistunut kirjoitus ei koskaan jää näkyviin), mutta ilman tätä
// käyttäjä ei koskaan saanut selitystä miksi kosketus "ei tehnyt mitään" —
// "vahvistus seuraa todellisuutta" koskee myös EPÄonnistumisen viestimistä,
// ei vain onnistumisen. Palauttaa true jos virhe oli (kutsuja voi silloin
// haluta pysähtyä ennen jatkokirjoituksia/-tilanpäivityksiä).
function ilmoitaKirjoitusvirheesta(error, konteksti) {
  if (!error) return false;
  console.error(konteksti + ' epäonnistui:', error);
  naytaIlmoitus(konteksti + ' epäonnistui — yritä uudelleen');
  return true;
}

// Lyhyt itsestään katoava ilmoitus ruudun alareunassa (kuitti-tyylinen banneri)
function naytaIlmoitus(teksti) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = teksti;
  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.classList.add('nakyva'); });
  setTimeout(function() {
    toast.classList.remove('nakyva');
    setTimeout(function() { toast.remove(); }, 300);
  }, 1800);
}

// BUGIKORJAUS (2026-07-14, ks. muistiinpanot.md "Ankkurien hätäkorjaus"):
// varsinaisToiminto (esim. tietokannasta poisto) suoritetaan VASTA 5s
// kuluttua, EI heti — jos käyttäjä painaa "Kumoa" sitä ennen, toimintoa ei
// koskaan suoriteta. Tämä on tarkoituksella eri malli kuin "poista heti,
// yritä palauttaa jos kumotaan" — deferoitu suoritus ei voi koskaan
// epäonnistua osittain, koska mitään ei ehdi tapahtua ennen kumoamisikkunan
// päättymistä. Käytetään joka kerta kun ele tuhoaa käsin luotua sisältöä.
function naytaKumottavaIlmoitus(teksti, varsinaisToiminto, peruttuCallback) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-kumottava';

  const tekstiEl = document.createElement('span');
  tekstiEl.textContent = teksti;
  toast.appendChild(tekstiEl);

  const kumoaNappi = document.createElement('button');
  kumoaNappi.className = 'toast-kumoa-btn';
  kumoaNappi.textContent = 'Kumoa';
  toast.appendChild(kumoaNappi);

  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.classList.add('nakyva'); });

  function sulje() {
    toast.classList.remove('nakyva');
    setTimeout(function() { toast.remove(); }, 300);
  }

  const ajastin = setTimeout(function() {
    sulje();
    varsinaisToiminto();
  }, 5000);

  kumoaNappi.addEventListener('click', function() {
    clearTimeout(ajastin);
    sulje();
    if (peruttuCallback) peruttuCallback();
  });
}

// BUGIKORJAUS (2026-07-16, ks. muistiinpanot.md kohta 8, "Löydetyt bugit ja
// opit"): rivin täppäys tehdyksi tai poisto ei aiemmin käsitellyt riville
// asetettua elävää muistutusta lainkaan (paitsi muutamassa paikassa, jotka
// siivosivat sen HILJAA) — käyttäjälle ei koskaan kerrottu, ja push joka
// saapuu jo hoidetusta/kadonneesta asiasta opettaa ohittamaan hälytykset.
// Kutsutaan HETI kun rivi on täpätty/poistettu (rivin oma toiminto ei
// odota mitään) — VAIN itse muistutuksen poisto on kumottavissa 5s ajan,
// sama malli kuin muillakin tuhoavilla eleillä.
async function siivoaMuistutuksetKumottavasti(source, sourceRef) {
  const { data, error } = await db.from('muistutukset').select('id')
    .eq('source', source).eq('source_ref', String(sourceRef)).is('sent_at', null);
  if (error || !data || data.length === 0) return;
  const maara = data.length;
  naytaKumottavaIlmoitus(
    'Myös ' + maara + (maara === 1 ? ' muistutus poistetaan' : ' muistutusta poistetaan'),
    async function() {
      const { error: poistoError } = await db.from('muistutukset').delete().eq('source', source).eq('source_ref', String(sourceRef)).is('sent_at', null);
      if (poistoError) console.error('Muistutusten kumottava siivous epäonnistui:', poistoError);
      await paivitaMuistutuksetKartta();
    },
    function() {}
  );
}

// Pakkauslistan automaattinollaus: jos avoinna olevan listan nimessä on
// (missä tahansa muodossa, isoja/pieniä kirjaimia välittämättä) "pakkauslista"
// ja KAIKKI ei-otsikkorivit on juuri täpätty valmiiksi, nollataan koko lista
// hetken kuluttua takaisin tyhjäksi — käyttötapaus on sama pakkauslista
// käytettynä reissu toisensa jälkeen, ei haluta käsin nollata joka kerta.
// Kutsutaan VAIN sen asiakkaan koodista joka juuri täppäsi viimeisen rivin
// (ei Realtime-kuuntelijasta) — muuten kaikki avoinna olevat laitteet/
// välilehdet yrittäisivät nollata saman listan yhtä aikaa.
function tarkistaPakkauslistanNollaus() {
  if (!currentList || !currentList.name || currentList.name.toLowerCase().indexOf('pakkauslista') === -1) return;

  const tarkistettavat = cachedTuotteet.filter(function(t) { return !t.is_header; });
  if (tarkistettavat.length === 0 || !tarkistettavat.every(function(t) { return t.tehty; })) return;

  naytaIlmoitus('✓ ' + currentList.name + ' valmis — nollataan hetken päästä');

  setTimeout(async function() {
    const idt = tarkistettavat.map(function(t) { return t.id; });
    const { error } = await db.from('tuotteet').update({ tehty: false, bought_at: null }).in('id', idt);
    // Aiempi "nollataan hetken päästä" -viesti EI SAA jäädä ainoaksi
    // totuudeksi jos nollaus tosiasiassa epäonnistuu (ks. muistiinpanot.md
    // "Kirjoituspolkujen auditointi").
    if (ilmoitaKirjoitusvirheesta(error, 'Pakkauslistan automaattinollaus')) return;
    if (currentList && currentList.id === tarkistettavat[0].list_id) lataaLista();
  }, 1500);
}

// === RAAHAUS (pitkä painallus + siirto) ===
const RAAHAUS_VIIVE_MS = 450;
const RAAHAUS_PERUUTUS_PX = 10;
let raahattavaRivi = null;

// asetukset = { container, cache, taulu, jalkeenPaivitys } — samaa raahauslogiikkaa
// käytetään sekä listan tuoteriveille että Ankkureille, vain kohdetaulu/säiliö vaihtuu
function alustaRaahaus(li, kohde, asetukset) {
  // Tekstinvalinta pitkän painalluksen aikana korjattu (2026-08-11, elävä
  // testaus: "raahatessa maalautuu koko sivu"). .dragging-luokka lisäsi
  // user-select:none:in vasta KUN raahaus oli jo tunnistettu käynnissä
  // olevaksi — liian myöhään, koska sama ~450ms pitkä painallus joka
  // käynnistää raahauksemme on MYÖS iOS Safarin oma tekstinvalinta/
  // suurennuslasi-eleen kynnys, ja se ehti voittaa. .raahattava-luokka
  // laittaa suojan päälle heti kun rivi rekisteröidään raahattavaksi, ei
  // vasta raahauksen alkaessa. touch-action EI ole mukana tarkoituksella:
  // nämä listat voivat olla pitkiä ja käyttäjä vierittää niitä usein
  // koskettamalla suoraan riviä — touch-action:none estäisi senkin, ei
  // vain tekstinvalinnan (ero alapalkin järjestysarkkiin, joka on lyhyt,
  // oma raahaukseen keskittyvä näkymä eikä tarvitse rivin kautta vieritystä).
  li.classList.add('raahattava');

  let ajastin = null;
  let alkuY = 0;
  let alkuX = 0;
  let raahausKaynnissa = false;
  let sivuutaSeuraavaKlikkaus = false;

  function pisteesta(e) {
    return e.touches ? e.touches[0] : e;
  }

  function alkaa(e) {
    const piste = pisteesta(e);
    alkuY = piste.clientY;
    alkuX = piste.clientX;
    ajastin = setTimeout(function() {
      raahausKaynnissa = true;
      sivuutaSeuraavaKlikkaus = true;
      raahattavaRivi = li;
      li.classList.add('dragging');
      if (navigator.vibrate) navigator.vibrate(15);
    }, RAAHAUS_VIIVE_MS);

    // Hiirellä liike/vapautus pitää kuunnella koko dokumentista, koska
    // hiiri ei "lukitu" alkuperäiseen elementtiin niin kuin kosketus tekee
    if (!e.touches) {
      document.addEventListener('mousemove', liikkuu);
      document.addEventListener('mouseup', loppuu, { once: true });
    }
  }

  function liikkuu(e) {
    const piste = pisteesta(e);
    const dx = Math.abs(piste.clientX - alkuX);
    const dy = Math.abs(piste.clientY - alkuY);

    if (!raahausKaynnissa && ajastin && (dx > RAAHAUS_PERUUTUS_PX || dy > RAAHAUS_PERUUTUS_PX)) {
      clearTimeout(ajastin);
      ajastin = null;
      return;
    }

    if (raahausKaynnissa) {
      e.preventDefault();
      siirraRaahattavaKohtaan(li, piste.clientY, asetukset.container);
    }
  }

  async function loppuu() {
    if (ajastin) {
      clearTimeout(ajastin);
      ajastin = null;
    }
    document.removeEventListener('mousemove', liikkuu);
    if (raahausKaynnissa) {
      raahausKaynnissa = false;
      raahattavaRivi = null;
      li.classList.remove('dragging');
      await tallennaUusiJarjestys(li, kohde, asetukset);
      asetukset.jalkeenPaivitys();
    }
  }

  function estaKlikkausJosRaahattiin(e) {
    if (sivuutaSeuraavaKlikkaus) {
      e.preventDefault();
      e.stopImmediatePropagation();
      sivuutaSeuraavaKlikkaus = false;
    }
  }

  li.addEventListener('touchstart', alkaa, { passive: true });
  li.addEventListener('touchmove', liikkuu, { passive: false });
  li.addEventListener('touchend', loppuu);
  li.addEventListener('touchcancel', loppuu);
  li.addEventListener('mousedown', alkaa);
  li.addEventListener('click', estaKlikkausJosRaahattiin, true);
}

// Siirtää raahattavan rivin DOM:ssa sen mukaan minkä sisarusrivin puolivälin ylitetty
function siirraRaahattavaKohtaan(li, clientY, container) {
  const sisarukset = Array.from(container.children).filter(function(el) { return el !== li; });

  for (const sisarus of sisarukset) {
    const rect = sisarus.getBoundingClientRect();
    const puolivali = rect.top + rect.height / 2;
    if (clientY < puolivali) {
      if (sisarus.previousElementSibling !== li) {
        container.insertBefore(li, sisarus);
      }
      return;
    }
  }

  if (container.lastElementChild !== li) {
    container.appendChild(li);
  }
}

// Laskee uuden sort_order-arvon rivin lopullisen DOM-sijainnin naapureista ja tallentaa sen
async function tallennaUusiJarjestys(li, kohde, asetukset) {
  const kaikki = Array.from(asetukset.container.children);
  const index = kaikki.indexOf(li);
  const edellinen = kaikki[index - 1];
  const seuraava = kaikki[index + 1];

  const edellinenKohde = edellinen ? asetukset.cache.find(function(t) { return String(t.id) === edellinen.dataset.tuoteId; }) : null;
  const seuraavaKohde = seuraava ? asetukset.cache.find(function(t) { return String(t.id) === seuraava.dataset.tuoteId; }) : null;

  let uusiJarjestys;
  if (edellinenKohde && seuraavaKohde) {
    uusiJarjestys = (edellinenKohde.sort_order + seuraavaKohde.sort_order) / 2;
  } else if (edellinenKohde) {
    uusiJarjestys = edellinenKohde.sort_order + 1;
  } else if (seuraavaKohde) {
    uusiJarjestys = seuraavaKohde.sort_order - 1;
  } else {
    uusiJarjestys = 1;
  }

  const { error } = await db.from(asetukset.taulu).update({ sort_order: uusiJarjestys }).eq('id', kohde.id);
  // Välimuistia (kohde.sort_order) EI päivitetä jos kirjoitus epäonnistui —
  // muuten myöhemmät uudelleenjärjestykset laskisivat seuraavan sijainnin
  // väärästä, vain paikallisesti oletetusta arvosta (ks. muistiinpanot.md
  // "Kirjoituspolkujen auditointi"). Rivi palautuu oikealle paikalleen
  // seuraavassa täydessä uudelleenlatauksessa.
  if (ilmoitaKirjoitusvirheesta(error, 'Järjestyksen tallennus')) return;
  kohde.sort_order = uusiJarjestys;
}

// Rivien "⋯"-valikko (2026-07-16, ks. "Rivien UI-remontti" muistiinpanot.md:ssä):
// harvemmin tarvitut rivitoiminnot (muistutus, muokkaus, poisto) siirretty pois
// näkyvästä ikonikaistasta yhteen kompaktiin nappiin, jotta pitkä rivin teksti saa
// enemmän tilaa ennen ellipsis-katkaisua. Vain yksi valikko voi olla auki kerrallaan.
let openRowMenuEl = null;

function closeRowMenu() {
  if (!openRowMenuEl) return;
  if (openRowMenuEl.isConnected) openRowMenuEl.remove();
  document.removeEventListener('click', handleRowMenuOutsideClick, true);
  openRowMenuEl = null;
}

function handleRowMenuOutsideClick(e) {
  if (openRowMenuEl && !openRowMenuEl.contains(e.target)) closeRowMenu();
}

// items: [{ label, danger, onClick }]. li tarvitsee position:relative (ks. style.css)
// jotta valikko ankkuroituu juuri sen rivin alle, ei sivun kulmaan.
function openRowMenu(li, items) {
  const wasOpenForThisRow = openRowMenuEl && openRowMenuEl.dataset.forRow === li.dataset.tuoteId;
  closeRowMenu();
  if (wasOpenForThisRow) return;

  const menu = document.createElement('div');
  menu.className = 'row-menu';
  menu.dataset.forRow = li.dataset.tuoteId || '';
  items.forEach(function(kohta) {
    const nappi = document.createElement('button');
    nappi.type = 'button';
    nappi.className = 'row-menu-item' + (kohta.danger ? ' row-menu-item-danger' : '') + (kohta.icon ? ' row-menu-item-icon' : '');
    // kohta.icon (2026-08-11, Ruori-speksi §4.4) — valinnainen SVG-kuvake
    // ennen tekstiä. Muut kutsupaikat eivät aseta sitä, joten niiden ulkoasu
    // ei muutu (pelkkä textContent kuten ennen).
    if (kohta.icon) {
      nappi.innerHTML = kohta.icon + '<span>' + kohta.label + '</span>';
    } else {
      nappi.textContent = kohta.label;
    }
    nappi.addEventListener('click', function(e) {
      e.stopPropagation();
      closeRowMenu();
      kohta.onClick();
    });
    menu.appendChild(nappi);
  });

  li.appendChild(menu);
  openRowMenuEl = menu;
  // Valikko avautuu oletuksena RIVIN ALLE (.row-menu, top:100%) — lähellä
  // näytön alareunaa (2026-08-18, Katrin löydös: Laiturin alimpien murujen
  // kohdevalikko ei mahtunut auki, osa kohdista jäi ruudun/kiinteän
  // alapalkin alle eikä niitä pystynyt painamaan) tämä työntää valikon
  // osittain näkymättömiin. Käännetään RIVIN YLÄPUOLELLE jos alapuolella ei
  // ole tilaa — yksi korjaus kaikille openRowMenu()-kutsupaikoille kerralla.
  const kaytettavissaAlhaalla = window.innerHeight - (document.body.classList.contains('has-alapalkki') ? 84 : 0);
  const menuKorkeus = menu.getBoundingClientRect().height;
  const liAla = li.getBoundingClientRect().bottom;
  if (liAla + menuKorkeus > kaytettavissaAlhaalla) {
    menu.classList.add('row-menu-ylos');
  }
  setTimeout(function() { document.addEventListener('click', handleRowMenuOutsideClick, true); }, 0);
}

function createOverflowButton(li, items) {
  const nappi = document.createElement('button');
  nappi.type = 'button';
  nappi.textContent = '⋯';
  nappi.className = 'overflow-btn';
  nappi.addEventListener('click', function(e) {
    e.stopPropagation();
    openRowMenu(li, items);
  });
  return nappi;
}

// Pieni oheisteksti asetetusta muistutuksesta (tieto, ei nappi) — näytetään
// rivin tekstin perässä myös silloin kun itse ⏰-toiminto asuu "⋯"-valikossa.
function reminderTimeBadge(source, sourceRef) {
  const omat = muistutuksetKartta[muistutusAvain(source, sourceRef)] || [];
  if (omat.length === 0) return null;
  const aika = document.createElement('span');
  aika.className = 'muistutus-aika';
  aika.textContent = omat.length === 1 ? muotoileMuistutusAika(omat[0].remind_at) : '×' + omat.length;
  return aika;
}

// Piirtää listan näytölle
function paivitaNaytto(tuotteet) {
  if (raahattavaRivi) return;
  closeRowMenu();
  list.innerHTML = '';
  const naytettavat = historyOpen ? tuotteet : tuotteet.filter(t => !t.tehty);

  naytettavat.forEach(function(tuote) {
    const item = document.createElement('li');
    item.dataset.tuoteId = tuote.id;
    alustaRaahaus(item, tuote, { container: list, cache: cachedTuotteet, taulu: 'tuotteet', jalkeenPaivitys: lataaLista });

    // Väliotsikko: ei checkboxia, ei muokkausta, vain teksti + poisto.
    // Napautus valitsee sen lisäyskohteeksi (uudet rivit menevät sen alle).
    if (tuote.is_header) {
      item.className = 'header-row' + (tuote.id === aktiivinenOtsikkoId ? ' active' : '');
      item.addEventListener('click', function() { valitseLisaysKohde(tuote); });

      const spacer = document.createElement('div');
      spacer.className = 'footer-spacer';
      item.appendChild(spacer);

      const otsikkoTeksti = document.createElement('span');
      otsikkoTeksti.textContent = tuote.nimi;
      item.appendChild(otsikkoTeksti);

      const otsikkoPoisto = document.createElement('button');
      otsikkoPoisto.textContent = '×';
      otsikkoPoisto.className = 'delete-btn';
      otsikkoPoisto.addEventListener('click', function(e) {
        e.stopPropagation();
        poistaTuote(tuote);
      });
      item.appendChild(otsikkoPoisto);

      list.appendChild(item);
      return;
    }

    // Ruoka-välivaihe: valintatilassa jokainen rivi saa oman valintaruudun
    // ENNEN tavallista check-nappia — erillinen elementti, ei sekoiteta
    // "tehty"-tilaan, joten kumpaakin voi käyttää samaan aikaan sekaannuksetta.
    if (valintatilaPaalla) {
      item.classList.toggle('valinta-valittu', valitutTuoteIdt.has(tuote.id));
      const valintaRuutu = document.createElement('input');
      valintaRuutu.type = 'checkbox';
      valintaRuutu.className = 'valinta-checkbox';
      valintaRuutu.checked = valitutTuoteIdt.has(tuote.id);
      valintaRuutu.addEventListener('change', function() {
        if (valintaRuutu.checked) {
          valitutTuoteIdt.add(tuote.id);
        } else {
          valitutTuoteIdt.delete(tuote.id);
        }
        item.classList.toggle('valinta-valittu', valintaRuutu.checked);
        paivitaValintaMaara();
      });
      item.appendChild(valintaRuutu);
    }

    // "Varastossa lista nukkuu — toiminnot heräävät kun lista herää" (ks.
    // "Rivien UI-remontti" muistiinpanot.md:ssä): Varaston rivit ovat luettavia
    // pohjia, ei elettyjä listoja — ei täppää, ei ⚓, ei muistutusta, teksti saa
    // koko leveyden. Vain hiljainen "⋯" (muokkaus/poisto) jää, samoin kuin
    // eläville listoille, mutta ilman muita toimintoja.
    const isVarasto = currentList && currentList.category === 'varasto';
    if (isVarasto) {
      item.classList.add('varasto-rivi');
    } else {
      // Rivitys eläville listoille (2026-07-15, koonti 2:n kohta 6, ks.
      // muistiinpanot.md) — sama line-clamp-malli kuin Ankkureilla: teksti
      // saa rivittyä muutamalle riville ennen ellipsis-katkaisua, sen
      // sijaan että katkeaisi heti ensimmäisen rivin jälkeen.
      item.classList.add('elava-rivi');
    }

    // Vasemmalla: yliviivaustoiminto (ei Varastossa)
    if (!isVarasto) {
      const checkNappi = document.createElement('button');
      checkNappi.textContent = tuote.tehty ? '✓' : '○';
      checkNappi.className = 'check-btn';
      item.appendChild(checkNappi);

      checkNappi.addEventListener('click', async function() {
        const updateData = { tehty: !tuote.tehty, bought_at: !tuote.tehty ? new Date().toISOString() : null };
        const eventAction = updateData.tehty ? 'checked' : 'unchecked';
        if (updateData.tehty) tuntopalauteValmis();
        if (navigator.onLine) {
          const { error } = await db.from('tuotteet').update(updateData).eq('id', tuote.id);
          // Tapahtumaloki + jatkotoimet EIVÄT SAA olettaa onnistumista (ks.
          // muistiinpanot.md "Kirjoituspolkujen auditointi").
          if (!ilmoitaKirjoitusvirheesta(error, 'Tuotteen merkintä')) {
            logEvent(eventAction, 'item', tuote.id, tuote.nimi, tuote.list_id);
            if (updateData.tehty) siivoaMuistutuksetKumottavasti('rivi', tuote.id);
          }
          await lataaLista();
          if (!error && updateData.tehty) tarkistaPakkauslistanNollaus();
        } else {
          addToQueue({ type: 'update', data: { id: tuote.id, ...updateData } });
          cachedTuotteet = cachedTuotteet.map(t => t.id === tuote.id ? { ...t, ...updateData } : t);
          paivitaNaytto(cachedTuotteet);
          paivitaFooter(cachedTuotteet);
          logEvent(eventAction, 'item', tuote.id, tuote.nimi, tuote.list_id);
        }
      });
    }

    // Keskellä: teksti, napautus avaa muokkauksen
    const teksti = document.createElement('span');
    teksti.textContent = tuote.nimi;
    item.appendChild(teksti);

    if (isVarasto) {
      // Muistikirja (4.12): ei täppää, joten "tehty" ei koskaan kerro mitään
      // täällä — rivin aikaleima on aina lisäysaika, ei ostoaika.
      const aikaEl = document.createElement('span');
      aikaEl.textContent = muotoileAikaleima(tuote.created_at);
      aikaEl.className = 'history-time';
      item.appendChild(aikaEl);
    } else if (tuote.tehty && tuote.bought_at) {
      const aikaEl = document.createElement('span');
      aikaEl.textContent = muotoileAikaleima(tuote.bought_at);
      aikaEl.className = 'history-time';
      item.appendChild(aikaEl);
    }

    if (!isVarasto) {
      const muistutusAika = reminderTimeBadge('rivi', tuote.id);
      if (muistutusAika) item.appendChild(muistutusAika);
    }

    // Muokkaus: sama toiminto sekä tekstin napautuksesta että "⋯"-valikosta.
    function aloitaMuokkaus() {
      const inputti = document.createElement('input');
      inputti.type = 'text';
      inputti.value = tuote.nimi;
      inputti.className = 'edit-input';
      teksti.replaceWith(inputti);
      inputti.focus();
      inputti.setSelectionRange(inputti.value.length, inputti.value.length);

      async function tallenna() {
        const uusi = inputti.value.trim();
        if (uusi && uusi !== tuote.nimi) {
          if (navigator.onLine) {
            const { error } = await db.from('tuotteet').update({ nimi: uusi }).eq('id', tuote.id);
            ilmoitaKirjoitusvirheesta(error, 'Tuotteen nimen muokkaus');
            lataaLista();
          } else {
            addToQueue({ type: 'update', data: { id: tuote.id, nimi: uusi } });
            cachedTuotteet = cachedTuotteet.map(t => t.id === tuote.id ? { ...t, nimi: uusi } : t);
            paivitaNaytto(cachedTuotteet);
            paivitaFooter(cachedTuotteet);
          }
        } else {
          lataaLista();
        }
      }

      inputti.addEventListener('blur', tallenna);
      inputti.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') inputti.blur();
        if (e.key === 'Escape') { inputti.value = tuote.nimi; inputti.blur(); }
      });
    }

    teksti.addEventListener('click', aloitaMuokkaus);

    // Ankkurointi: nostaa/poistaa rivin päivän Ankkureihin — pysyy suoraan
    // näkyvänä (ei valikon takana), koska se on todistetusti käytetyin ja
    // impulsiivisin ele arkikäytössä (ei Varastossa, ks. yllä).
    if (!isVarasto) {
      const ankkuriNappi = document.createElement('button');
      ankkuriNappi.innerHTML = ANKKURI_SVG;
      ankkuriNappi.className = 'anchor-btn' + (ankkuroidutAvaimet.has('muistilaput:' + tuote.id) ? ' active' : '');
      ankkuriNappi.addEventListener('click', function() { vaihdaAnkkurointi(tuote); });
      item.appendChild(ankkuriNappi);
    }

    // Harvemmin tarvitut toiminnot yhden hiljaisen "⋯"-napin taakse.
    const menuItems = isVarasto
      ? [
          { label: 'Muokkaa', onClick: aloitaMuokkaus },
          { label: 'Poista', danger: true, onClick: function() { poistaTuote(tuote); } },
        ]
      : [
          { label: '⏰ Muistutus', onClick: function() { avaaMuistutusPaneeli('rivi', tuote.id, tuote.nimi, null, null, lataaLista); } },
          { label: 'Muokkaa', onClick: aloitaMuokkaus },
          { label: 'Poista', danger: true, onClick: function() { poistaTuote(tuote); } },
        ];
    item.appendChild(createOverflowButton(item, menuItems));

    if (tuote.tehty) {
      item.classList.add('done');
    }

    list.appendChild(item);
  });
}

function paivitaFooter(tuotteet) {
  const varsinaiset = tuotteet.filter(t => !t.is_header);
  const jaljella = varsinaiset.filter(t => !t.tehty).length;
  const ostettu = varsinaiset.filter(t => t.tehty).length;
  const subtitle = document.getElementById('subtitle');
  const footer = document.getElementById('list-footer');
  const footerDivider = document.getElementById('footer-divider');
  const footerCount = document.getElementById('footer-count');
  const eyeNappi = document.getElementById('eye-btn');

  subtitle.textContent = jaljella + ' jäljellä · ' + ostettu + ' ostettu';

  if (tuotteet.length > 0) {
    footer.style.display = 'block';
    footerDivider.style.display = 'block';
    footerCount.textContent = jaljella + ' KPL JÄLJELLÄ';
  } else {
    footer.style.display = 'none';
    footerDivider.style.display = 'none';
  }

  eyeNappi.style.display = 'flex';
  eyeNappi.innerHTML = historyOpen ? SVG_SILMA_KIINNI : SVG_SILMA_AUKI;
}

async function showHistory() {
  const { data } = await db.from('tuotteet')
    .select()
    .eq('list_id', currentList.id)
    .not('bought_at', 'is', null)
    .order('bought_at', { ascending: false });

  list.innerHTML = '';

  data.forEach(function(tuote) {
    const item = document.createElement('li');
    item.className = 'history-item';

    const spacer = document.createElement('div');
    spacer.className = 'footer-spacer';
    item.appendChild(spacer);

    const teksti = document.createElement('span');
    teksti.textContent = tuote.nimi;
    item.appendChild(teksti);

    const d = new Date(tuote.bought_at);
    const pvm = d.getDate().toString().padStart(2, '0') + '.' +
                (d.getMonth() + 1).toString().padStart(2, '0') + '.' +
                d.getFullYear() + ' ' +
                d.getHours().toString().padStart(2, '0') + ':' +
                d.getMinutes().toString().padStart(2, '0');

    const aika = document.createElement('span');
    aika.textContent = pvm;
    aika.className = 'history-time';
    item.appendChild(aika);

    list.appendChild(item);
  });

  paivitaFooter(cachedTuotteet);
}

// Haetaan kaikki tuotteet Supabasesta ja näytetään ne
async function lataaLista() {
  if (!currentList || raahattavaRivi) return;
  if (!navigator.onLine) {
    paivitaNaytto(cachedTuotteet);
    paivitaFooter(cachedTuotteet);
    return;
  }
  const { data, error } = await db.from('tuotteet').select().eq('list_id', currentList.id).order('sort_order');
  if (error) {
    console.error('Listan haku epäonnistui:', error);
    return;
  }
  cachedTuotteet = data || [];
  await paivitaAnkkuroidutAvaimet();
  await paivitaMuistutuksetKartta();
  paivitaNaytto(cachedTuotteet);
  paivitaFooter(cachedTuotteet);
  updateSyncIndicator();
}

// Lisätään uusi tuote Supabaseen
button.addEventListener('click', async function() {
  const raakaTeksti = input.value.trim();
  if (raakaTeksti === '') { input.focus(); return; }
  if (!currentList) return;
  const listId = currentList.id;

  const onOtsikko = raakaTeksti.startsWith('#');
  const teksti = onOtsikko ? raakaTeksti.slice(1).trim() : raakaTeksti;
  if (teksti === '') { input.focus(); return; }

  const kohdistettuJarjestys = laskeLisaysJarjestys();
  const uusiRivi = { nimi: teksti, tehty: false, list_id: listId, is_header: onOtsikko };
  if (kohdistettuJarjestys !== null) {
    uusiRivi.sort_order = kohdistettuJarjestys;
  }

  if (navigator.onLine) {
    const { data, error } = await db.from('tuotteet').insert(uusiRivi).select().single();
    // Tapahtumaloki EI SAA väittää lisäystä tehdyksi jos se ei onnistunut
    // (ks. muistiinpanot.md "Kirjoituspolkujen auditointi") — tämä on apin
    // yleisin yksittäinen kirjoitus, siksi erityisen tärkeä korjata.
    if (!ilmoitaKirjoitusvirheesta(error, 'Lisäys')) {
      logEvent(onOtsikko ? 'created' : 'added', onOtsikko ? 'header' : 'item', data ? data.id : null, teksti, listId);
    }
    lataaLista();
  } else {
    addToQueue({ type: 'insert', data: uusiRivi });
    cachedTuotteet.push(Object.assign({ id: 'temp_' + Date.now(), bought_at: null }, uusiRivi));
    paivitaNaytto(cachedTuotteet);
    paivitaFooter(cachedTuotteet);
    logEvent(onOtsikko ? 'created' : 'added', onOtsikko ? 'header' : 'item', null, teksti, listId);
  }

  input.value = '';
  input.focus();
});

// Enter-näppäin toimii myös
input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    button.click();
  }
});

updateSyncIndicator();

// Silmänappi — näyttää/piilottaa ostetut tuotteet
document.getElementById('eye-btn').addEventListener('click', function() {
  historyOpen = !historyOpen;
  lataaLista();
});

// Takaisin-nuoli — palaa näkymään josta lista avattiin (Muistilaput tai Varasto)
document.getElementById('back-btn').addEventListener('click', function() {
  if (listanAvausLahde === 'varasto') {
    showVarastoView();
    lataaVarasto();
  } else {
    showMuistilaputView();
    lataaMuistilaput();
  }
});

// Ruoka-välivaihe: valintatilan päälle/pois-kytkin
document.getElementById('valinta-toggle-btn').addEventListener('click', function() {
  valintatilaPaalla = !valintatilaPaalla;
  valitutTuoteIdt.clear();
  this.classList.toggle('active', valintatilaPaalla);
  document.getElementById('valinta-palkki').style.display = valintatilaPaalla ? 'flex' : 'none';
  paivitaValintaMaara();
  paivitaNaytto(cachedTuotteet);
});

document.getElementById('valinta-peruuta-btn').addEventListener('click', function() {
  poistuValintatilasta();
  paivitaNaytto(cachedTuotteet);
});

// "Kauppalistalle" — kopioi valitut rivit (nimi) uusiksi riveiksi
// Kauppalistaan, EI poista/siirrä alkuperäisestä listasta (sama "kopio, ei
// vie alkuperäistä" -periaate kuin Varaston "Luo kopio" -napissa) —
// esim. reseptilistan ainekset pysyvät reseptillä myös ensi kerraksi.
document.getElementById('valinta-kauppalistalle-btn').addEventListener('click', async function() {
  if (valitutTuoteIdt.size === 0) return;

  const { data: kauppalista, error: hakuError } = await db.from('lists').select('id').eq('name', 'Kauppalista').single();
  if (hakuError || !kauppalista) {
    console.error('Kauppalistan haku epäonnistui:', hakuError);
    return;
  }

  const uudetRivit = cachedTuotteet
    .filter(function(t) { return valitutTuoteIdt.has(t.id); })
    .map(function(t) { return { nimi: t.nimi, tehty: false, list_id: kauppalista.id, is_header: false }; });

  const { error: insertError } = await db.from('tuotteet').insert(uudetRivit);
  if (ilmoitaKirjoitusvirheesta(insertError, 'Rivien lisäys Kauppalistalle')) return;

  naytaIlmoitus(uudetRivit.length + ' tuotetta lisätty Kauppalistalle.');
  poistuValintatilasta();
  paivitaNaytto(cachedTuotteet);
});

// Listan asetukset — näkyvyyden vaihto
document.getElementById('settings-btn').addEventListener('click', function() {
  if (!currentList) return;
  const jaettu = currentList.visibility === 'shared';
  document.getElementById('visibility-toggle').checked = jaettu;
  document.getElementById('settings-visibility-label').textContent = jaettu ? 'Näkyy molemmille' : 'Näkyy vain sinulle';
  document.getElementById('move-category-btn').textContent = currentList.category === 'varasto' ? 'Siirrä Muistilappuihin' : 'Siirrä Varastoon';
  document.getElementById('settings-overlay').style.display = 'flex';
});

document.getElementById('move-category-btn').addEventListener('click', async function() {
  const uusiKategoria = currentList.category === 'varasto' ? 'muistilaput' : 'varasto';
  const { error } = await db.from('lists').update({ category: uusiKategoria }).eq('id', currentList.id);
  if (ilmoitaKirjoitusvirheesta(error, 'Kategorian vaihto')) return;
  currentList.category = uusiKategoria;
  listanAvausLahde = uusiKategoria;
  logEvent(uusiKategoria === 'varasto' ? 'moved_to_varasto' : 'moved_to_muistilaput', 'list', currentList.id, currentList.name, currentList.id);
  document.getElementById('move-category-btn').textContent = uusiKategoria === 'varasto' ? 'Siirrä Muistilappuihin' : 'Siirrä Varastoon';
});

// "Luo kopio" — monistaa listan riveineen ja väliotsikoineen (täpät/ostoajat
// nollattuina) uudeksi, itsenäiseksi listaksi samaan kategoriaan. Käyttötapaus:
// juhla-/kausipohjat (esim. "Joulun pakkauslista") Varastossa — pohja säilyy
// koskemattomana, kopiosta tehdään sen vuoden elävä versio.
document.getElementById('copy-list-btn').addEventListener('click', async function() {
  if (!currentList) return;
  const uusiNimi = prompt('Uuden listan nimi', currentList.name + ' (kopio)');
  if (uusiNimi === null || uusiNimi.trim() === '') return;

  const { data: uusiLista, error: listaError } = await db.from('lists')
    .insert({ name: uusiNimi.trim(), type: 'checklist', owner_id: currentUserId, category: currentList.category })
    .select().single();
  if (ilmoitaKirjoitusvirheesta(listaError, 'Kopion luonti')) return;

  const { data: rivit, error: riviError } = await db.from('tuotteet').select().eq('list_id', currentList.id).order('sort_order');
  let rivienKopiointiEpaonnistui = false;
  if (riviError) {
    console.error('Rivien haku kopiointia varten epäonnistui:', riviError);
    rivienKopiointiEpaonnistui = true;
  } else if (rivit && rivit.length > 0) {
    const kopiot = rivit.map(function(r) {
      return { nimi: r.nimi, is_header: r.is_header, sort_order: r.sort_order, list_id: uusiLista.id, tehty: false, bought_at: null };
    });
    const { error: insertError } = await db.from('tuotteet').insert(kopiot);
    if (insertError) {
      console.error('Rivien kopiointi listalle epäonnistui:', insertError);
      rivienKopiointiEpaonnistui = true;
    }
  }

  logEvent('created', 'list', uusiLista.id, uusiLista.name, uusiLista.id);
  document.getElementById('settings-overlay').style.display = 'none';
  // "Luotu"-viesti EI SAA valehdella jos rivien kopiointi epäonnistui — se
  // näyttäisi tyhjän listan täytenä kopiona (ks. muistiinpanot.md
  // "Kirjoituspolkujen auditointi").
  naytaIlmoitus(rivienKopiointiEpaonnistui
    ? ('Lista "' + uusiLista.name + '" luotu, mutta rivien kopiointi epäonnistui — tarkista lista')
    : ('Kopio "' + uusiLista.name + '" luotu.'));
});

document.getElementById('settings-close').addEventListener('click', function() {
  document.getElementById('settings-overlay').style.display = 'none';
});

document.getElementById('settings-overlay').addEventListener('click', function(e) {
  if (e.target === this) this.style.display = 'none';
});

document.getElementById('visibility-toggle').addEventListener('change', async function(e) {
  const uusiTila = e.target.checked ? 'shared' : 'private';
  const { error } = await db.from('lists').update({ visibility: uusiTila }).eq('id', currentList.id);
  if (error) {
    console.error('Näkyvyyden muutos epäonnistui:', error);
    e.target.checked = !e.target.checked;
    return;
  }
  currentList.visibility = uusiTila;
  document.getElementById('settings-visibility-label').textContent = e.target.checked ? 'Näkyy molemmille' : 'Näkyy vain sinulle';
  paivitaNakyvyysIkoni();
  logEvent(uusiTila === 'shared' ? 'shared' : 'unshared', 'list', currentList.id, currentList.name, currentList.id);
});

// Ankkurit
// UI-KORJAUS (2026-07-21, ks. muistiinpanot.md "UI-korjaus ankkurin
// kohdevalitsimeen") — pysyvä "Itselle/[Nimi]:lle"-kohdevalinta poistettu
// kokonaan: rakentaja (Katri) luuli sitä jumiin jääneiksi ehdokaslapuiksi
// (katkoviiva = ehdokaskieli muualla), ja tahmea "Toiselle"-tila oli ansa
// (huolimaton ankkuri lentäisi väärälle ihmiselle). Kohde on nyt ELE, ei
// TILA — sama kieli kuin Laiturin 💬:ssä: uusi ankkuri kirjoitetaan AINA
// itselle (nolla valintaa), delegointi hoituu jälkikäteen ⋯-valikon
// "Ehdota [Nimi]:lle" -toiminnolla (ks. alempana lataaAnkkurit()-listauksessa).
//
// KORJATTU 2026-08-11 (Ruori-speksi §4.5, Katrin yksityisyyshavainto): 2026-
// 07-14 "jokaisella ankkurilla on koti" -korjaus loi taustalla Laituri-
// murun — mutta Laituri on JAETTU näkymä (lataaLaituri() ei suodata
// user_id:n mukaan), joten etusivulla kirjoitettu teksti tuli NÄKYVIIN
// JUHALLE HETI kirjoitushetkellä, ei vasta laskiessa. Käsin kirjoitettu
// ankkuri EI enää luo Laituri-riviä ollenkaan — source='etusivu' erottaa
// sen laituri-lähtöisistä (source='laituri'), sisältö asuu VAIN ankkurit-
// taulussa (henkilökohtainen, RLS user_id-rajattu). Turvainvariantti
// säilyi toisella tavalla: lasku oli POIS KÄYTÖSTÄ source='etusivu'-
// ankkureille kunnes niillä oli koti. KORJATTU 2026-08-11 (CODE_vaihe1b.md
// §8b): loki_merkinnat (sql/115) on nyt se koti — lasku toimii, ks.
// irrotaNappi-käsittelijä lataaAnkkurit()-listauksessa.
document.getElementById('ankkurit-add-btn').addEventListener('click', async function() {
  const ankkuriInput = document.getElementById('ankkurit-input');
  const teksti = ankkuriInput.value.trim();
  if (teksti === '') { ankkuriInput.focus(); return; }

  const { error } = await db.from('ankkurit').insert({ content: teksti, source: 'etusivu', user_id: currentUserId });
  if (ilmoitaKirjoitusvirheesta(error, 'Ankkurin luonti')) return;
  await paivitaAnkkuroidutAvaimet();
  ankkuriInput.value = '';
  kasvataTextareaaSisallon(ankkuriInput);
  lataaAnkkurit();
});

// Enter lähettää kuten aiemmalla <input>:lla, Shift+Enter jättää rivinvaihdon
// (2026-08-11, elävä testaus §1.4) — muuten <textarea> lisäisi rivinvaihdon
// ennen kuin klikkaus ehtii lukea/tyhjentää kentän.
document.getElementById('ankkurit-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    document.getElementById('ankkurit-add-btn').click();
  }
});
document.getElementById('ankkurit-input').addEventListener('input', function() {
  kasvataTextareaaSisallon(this);
});

document.getElementById('ankkurit-laajenna').addEventListener('click', function() {
  ankkuritKaikkiNakyvissa = !ankkuritKaikkiNakyvissa;
  lataaAnkkurit();
});

// Muistilaput (linkki alapalkissa, ks. piirraAlapalkki())
document.getElementById('muistilaput-back-btn').addEventListener('click', function() {
  showHomeView();
  lataaKotinakyma();
});

// Laituri (linkki alapalkissa, ks. piirraAlapalkki())
document.getElementById('laituri-back-btn').addEventListener('click', function() {
  peruLaiturinMateriaaliKonteksti();
  showHomeView();
  lataaKotinakyma();
});

document.getElementById('editori-materiaali-banneri-peruuta').addEventListener('click', function() {
  peruLaiturinMateriaaliKonteksti();
});

// Jaettu editori (2026-08-11, CODE_vaihe1b.md §2) — YKSI täysinäytön
// kirjoituspinta, korvaa aiemman pienen #laituri-input-kentän. "Tallennus
// tapahtuu itsestään, ei tallennusnappia": ei silti jatkuvaa merkki
// merkiltä -tallennusta tietokantaan, koska Laukaisusana-tunnistus
// ("Juhalle:"-alkuinen teksti ohjataan kokonaan ehdotukseksi partnerille,
// ks. alla) on YHDEN KERRAN päätös joka pitää tehdä VALMIILLE tekstille —
// jatkuva tallennus kesken kirjoituksen lähettäisi partnerille puolikkaan,
// alati muuttuvan ehdotuksen. Sen sijaan: localStorage-luonnos joka
// näppäimenpainalluksella (sama turvaverkko kuin ennen, nyt vain isommalla
// pinnalla) + todellinen tallennus kun editori SULJETAAN — ei erillistä
// nappia, sulkeminen ON tallennus, mikä täyttää spekin vaatimuksen ilman
// että Laukaisusana-logiikka rikkoutuu.
let editoriKohde = null;

function avaaJaettuEditori(kohde) {
  editoriKohde = kohde || { tyyppi: 'laituri' };
  const pinta = document.getElementById('editori-pinta');
  pinta.value = '';
  const luonnos = localStorage.getItem(EDITORI_LUONNOS_KEY);
  if (luonnos) pinta.value = luonnos;
  document.getElementById('editori-otsikko').textContent = editoriKohde.otsikko || '✱ UUSI ✱';
  paivitaLaiturinMateriaaliBanneri();
  piilotaKaikkiNakymat();
  document.getElementById('editori-view').style.display = 'block';
  pinta.focus();
}

// Yhteinen tallennuslogiikka (2026-08-17, eriytetty tallennaEditoriJaSulje/
// tallennaEditoriJatka:n yhteiseksi ytimeksi) — laukaisusanan tunnistus +
// varsinainen insert. Palauttaa true jos tekstille TEHTIIN jotain (tallennus
// tai ehdotus), false jos teksti oli tyhjä tai kirjoitus epäonnistui (jolloin
// kutsuja EI saa tyhjentää luonnosta, "ei koskaan kadota ajatusta").
async function suoritaEditorinTallennus(teksti) {
  if (teksti === '') return false;

  // Laukaisusana (2026-07-18, ks. muistiinpanot.md "Laukaisusana Laiturissa"):
  // "Juhalle:"/"laita Juhalle:" rivin alussa ohittaa tavallisen lisäyksen
  // kokonaan ja ohjaa murun suoraan ehdotukseksi, samaa putkea kuin
  // 💬-nappi/kohdevalinta (ehdotaSisaltoToiselle luo kotimurun + ehdokkaan).
  const ehdotusSisalto = toinenKayttaja ? tunnistaEhdotusLaukaisu(teksti, toinenKayttaja.henkilo) : null;
  if (ehdotusSisalto) {
    const onnistui = await ehdotaSisaltoToiselle(ehdotusSisalto);
    naytaIlmoitus(onnistui ? ('Ehdotettu ' + henkiloAllatiivi(toinenKayttaja.henkilo)) : 'Ehdotuksen lähetys epäonnistui');
    return true;
  }

  const { error } = await db.from('laituri').insert(Object.assign(
    { user_id: currentUserId, content: teksti },
    materiaaliKohdeInsertKentat()
  ));
  // "Ei koskaan kadota ajatusta" -periaate koskee myös epäonnistunutta
  // kirjoitusta: luonnosta EI tyhjennetä eikä editoria suljeta jos kirjoitus
  // ei onnistunut, muuten juuri se turvaverkko (localStorage-luonnos)
  // katoaisi samalla hetkellä kun sille olisi eniten tarvetta (ks.
  // muistiinpanot.md "Kirjoituspolkujen auditointi").
  if (ilmoitaKirjoitusvirheesta(error, 'Laituri-lisäys')) return false;
  return true;
}

async function tallennaEditoriJaSulje() {
  const pinta = document.getElementById('editori-pinta');
  const teksti = pinta.value.trim();
  // Kurssikonteksti napattu talteen ENNEN peruLaiturinMateriaaliKonteksti():
  // sen jälkeen palataan kurssisivulle (ei geneeriseen Laituriin) jotta
  // kasvava materiaalilista näkyy heti (Katrin havainto 17.8.2026 — muuten
  // ei tunnu siltä että osat todella kertyvät).
  const kurssiJohonPalataan = materiaaliKohdeKurssi;
  const palaaLaituriin = function() {
    piilotaKaikkiNakymat();
    document.getElementById('laituri-view').style.display = 'block';
    naytaAlapalkki('laituri');
    lataaLaituri(document.getElementById('laituri-search').value.trim());
    merkitseLaituriNahdyksi();
  };
  const palaaKurssille = async function() {
    const { data: kurssi } = await db.from('opinto_kurssit').select().eq('id', kurssiJohonPalataan.id).single();
    if (kurssi) avaaOpintoKurssi(kurssi); else palaaLaituriin();
  };
  if (teksti === '') {
    // Tyhjä editori suljetaan ilman kirjoitusta — ei tyhjää laituri-riviä.
    peruLaiturinMateriaaliKonteksti();
    if (kurssiJohonPalataan) await palaaKurssille(); else palaaLaituriin();
    return;
  }

  const onnistui = await suoritaEditorinTallennus(teksti);
  if (!onnistui) return;
  tyhjennaEditoriLuonnos();
  peruLaiturinMateriaaliKonteksti();
  if (kurssiJohonPalataan) await palaaKurssille(); else palaaLaituriin();
}

document.getElementById('editori-sulje-btn').addEventListener('click', function() {
  tallennaEditoriJaSulje();
});

document.getElementById('laituri-input').addEventListener('click', function() {
  avaaJaettuEditori({ tyyppi: 'laituri' });
});
document.getElementById('laituri-add-btn').addEventListener('click', function() {
  avaaJaettuEditori({ tyyppi: 'laituri' });
});

// Varmuusverkko kesken kirjoituksen tapahtuvaa uudelleenpiirtoa/sivun
// uudelleenlatausta vastaan (havaittu: näytön kääntö saattoi tyhjentää kentän
// ennen tallennusta). Luonnos talteen joka näppäimenpainalluksella, palautus
// kun editori avataan uudelleen (ks. avaaJaettuEditori). Kirjoitettu ei saa
// KOSKAAN kadota, vaikka juurisyytä uudelleenpiirtoon ei korjattaisikaan.
const EDITORI_LUONNOS_KEY = 'satama_editori_luonnos';
document.getElementById('editori-pinta').addEventListener('input', function(e) {
  if (e.target.value) {
    localStorage.setItem(EDITORI_LUONNOS_KEY, e.target.value);
  } else {
    localStorage.removeItem(EDITORI_LUONNOS_KEY);
  }
});

function tyhjennaEditoriLuonnos() {
  localStorage.removeItem(EDITORI_LUONNOS_KEY);
}

// Tiedostoliitteet (2026-08-11, CODE_vaihe1b.md §3) — koko alue on nappi
// joka avaa laitteen oman valitsimen, ei "raahaa tähän" -aluetta (§3.2).
// Jokainen liite luo OMAN riippumattoman laituri-murunsa heti valinnan
// jälkeen (ei odota editorin sulkemista) — sama materiaaliKohdeKurssi-
// lippu koskee sitä kuin editorin omaa tekstiäkin, jos kurssikontekstissa.
const TIEDOSTO_HYLATYT_PAATTEET = ['doc', 'docx', 'zip', 'rar', '7z', 'tar', 'gz', 'ipynb'];
const TIEDOSTO_KUVA_PAATTEET = ['jpg', 'jpeg', 'png', 'heic'];
const TIEDOSTO_PDF_KOKORAJA = 32 * 1024 * 1024;
const TIEDOSTO_MUU_KOKORAJA = 20 * 1024 * 1024;

function tiedostonPaate(nimi) {
  const osat = nimi.split('.');
  return osat.length > 1 ? osat.pop().toLowerCase() : '';
}

// §3.1: pdf/kuva/pptx tunnetuilla tunnisteilla, doc/zip/ipynb hylätään
// eksplisiittisesti, KAIKKI MUU (koodi, tuntematon pääte) yritetään
// tekstinä — "hyväksy mikä tahansa tunnistamaton pääte tekstinä jos
// sisältö on validia UTF-8:aa" (tarkistetaan erikseen luvun yhteydessä).
function tiedostonTyyppi(file) {
  const paate = tiedostonPaate(file.name);
  if (TIEDOSTO_HYLATYT_PAATTEET.indexOf(paate) !== -1) return 'hylatty';
  if (paate === 'pdf' || file.type === 'application/pdf') return 'pdf';
  if (TIEDOSTO_KUVA_PAATTEET.indexOf(paate) !== -1 || /^image\//.test(file.type)) return 'kuva';
  if (paate === 'pptx' || paate === 'ppt' || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'pptx';
  return 'teksti';
}

document.getElementById('editori-tiedosto-btn').addEventListener('click', function() {
  document.getElementById('editori-tiedosto-input').click();
});

document.getElementById('editori-tiedosto-input').addEventListener('change', async function(e) {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  await kasitteleEditoriTiedosto(file);
});

// tilaElId (2026-08-18, ks. lataaOpintoKurssiMateriaalit-alueen inline-
// materiaalikenttä) — sama tiedostonkäsittely toimii nyt kahdesta paikasta
// (editori-view JA kurssisivun oma kenttä), kumpikin näyttää tilan omaan
// elementtiinsä. Oletus säilyttää vanhan editori-viewin käytöksen.
function naytaEditoriTiedostoTila(teksti, onVirhe, tilaElId) {
  const tilaEl = document.getElementById(tilaElId || 'editori-tiedosto-tila');
  tilaEl.textContent = teksti;
  tilaEl.classList.toggle('editori-tiedosto-virhe', !!onVirhe);
  tilaEl.style.display = 'block';
}

async function kasitteleEditoriTiedosto(file, tilaElId) {
  const tyyppi = tiedostonTyyppi(file);

  if (tyyppi === 'hylatty') {
    naytaEditoriTiedostoTila('Tiedostotyyppiä ei tueta (.' + tiedostonPaate(file.name) + ') — liitä sisältö tekstinä.', true, tilaElId);
    return;
  }

  const kokoraja = tyyppi === 'pdf' ? TIEDOSTO_PDF_KOKORAJA : TIEDOSTO_MUU_KOKORAJA;
  if (file.size > kokoraja) {
    naytaEditoriTiedostoTila('Tiedosto on liian iso (' + Math.round(file.size / 1024 / 1024) + ' MB, raja ' + Math.round(kokoraja / 1024 / 1024) + ' MB).', true, tilaElId);
    return;
  }

  naytaEditoriTiedostoTila('Ladataan "' + file.name + '"...', false, tilaElId);

  try {
    if (tyyppi === 'teksti') {
      // Koodi/tuntematon teksti: EI purkua, EI Storage-tallennusta — sama
      // polku kuin liitetty teksti (§3.1). U+FFFD-tarkistus karkeana
      // UTF-8-kelvollisuuden merkkinä: binääritiedosto dekoodautuisi
      // korvausmerkeiksi, ei pitäisi päätyä muruksi sellaisenaan.
      const teksti = await file.text();
      if (teksti.indexOf('�') !== -1) {
        naytaEditoriTiedostoTila('Tiedosto ei näytä olevan tekstiä (binääridataa?) — ei lisätty.', true, tilaElId);
        return;
      }
      const { error } = await db.from('laituri').insert(Object.assign(
        { user_id: currentUserId, content: teksti },
        materiaaliKohdeInsertKentat()
      ));
      if (ilmoitaKirjoitusvirheesta(error, 'Tiedoston lisäys')) return;
      naytaEditoriTiedostoTila('"' + file.name + '" lisätty.', false, tilaElId);
      return;
    }

    // pdf/kuva/pptx: ladataan Storageen SUORAAN selaimesta (ei tämän
    // palvelimen kautta — pyyntökoko olisi liian pieni isolle pdf:lle,
    // ks. api/laituri-tiedosto-poiminta.js:n oma kommentti).
    const polku = currentUserId + '/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const { error: uploadError } = await db.storage.from('materiaali').upload(polku, file, { contentType: file.type || 'application/octet-stream' });
    if (uploadError) {
      console.error('Tiedoston tallennus Storageen epäonnistui:', uploadError);
      naytaEditoriTiedostoTila('Tallennus epäonnistui — yritä uudelleen.', true, tilaElId);
      return;
    }

    let poimittuTeksti = null;
    if (tyyppi === 'pdf' || tyyppi === 'pptx') {
      const { data: sessionData } = await db.auth.getSession();
      const token = sessionData.session ? sessionData.session.access_token : null;
      const mime = tyyppi === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      try {
        const vastaus = await fetch('/api/laituri-tiedosto-poiminta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ storage_polku: polku, mime_tyyppi: mime }),
        });
        const tulos = await vastaus.json();
        if (!vastaus.ok) {
          // Tiedosto ON jo tallessa Storagessa vaikka poiminta epäonnistuisi
          // (esim. liikaa sivuja) — ei hukata koko latausta, jatketaan
          // murun luontiin ilman poimittua tekstiä ja kerrotaan syy.
          console.error('Tekstin poiminta epäonnistui:', tulos.error);
          naytaEditoriTiedostoTila((tulos.error || 'Tekstin poiminta epäonnistui') + ' — tiedosto silti tallennettu.', true, tilaElId);
        } else {
          poimittuTeksti = tulos.teksti;
        }
      } catch (poimintaVirhe) {
        console.error('Poimintapyyntö epäonnistui (verkko?):', poimintaVirhe.message);
        naytaEditoriTiedostoTila('Tekstin poiminta epäonnistui — tiedosto silti tallennettu.', true, tilaElId);
      }
    }

    const muruSisalto = tyyppi === 'kuva' ? '📷 ' + file.name : (poimittuTeksti || '📎 ' + file.name);
    const { data: uusiRivi, error: muruError } = await db.from('laituri').insert(Object.assign(
      { user_id: currentUserId, content: muruSisalto },
      materiaaliKohdeInsertKentat()
    )).select().single();
    if (ilmoitaKirjoitusvirheesta(muruError, 'Tiedoston lisäys')) return;

    const { error: tiedostoError } = await db.from('laituri_tiedostot').insert({
      muru_id: uusiRivi.id,
      tiedostonimi: file.name,
      storage_polku: polku,
      mime_tyyppi: file.type || 'application/octet-stream',
      koko_tavua: file.size,
      poimittu_teksti: poimittuTeksti,
    });
    if (tiedostoError) console.error('Tiedoston metatiedon tallennus epäonnistui (tiedosto silti Storagessa ja murussa):', tiedostoError);

    naytaEditoriTiedostoTila('"' + file.name + '" lisätty' + (poimittuTeksti ? ' ja teksti poimittu' : '') + '.', false, tilaElId);
  } catch (e) {
    console.error('Tiedoston käsittely epäonnistui:', e.message);
    naytaEditoriTiedostoTila('Tiedoston käsittely epäonnistui — yritä uudelleen.', true, tilaElId);
  }
}

let laituriHakuAjastin = null;
document.getElementById('laituri-search').addEventListener('input', function(e) {
  clearTimeout(laituriHakuAjastin);
  const hakusana = e.target.value.trim();
  laituriHakuAjastin = setTimeout(function() { lataaLaituri(hakusana); }, 250);
});

// Uuden listan lisäys Muistilaput-näkymässä
document.getElementById('new-list-btn').addEventListener('click', async function() {
  const listInput = document.getElementById('new-list-input');
  const nimi = listInput.value.trim();
  if (nimi === '') { listInput.focus(); return; }

  const { data, error } = await db.from('lists').insert({ name: nimi, type: 'checklist', owner_id: currentUserId, category: 'muistilaput' }).select().single();
  if (ilmoitaKirjoitusvirheesta(error, 'Listan luonti')) return;
  logEvent('created', 'list', data.id, nimi, data.id);
  listInput.value = '';
  lataaMuistilaput();
});

document.getElementById('varasto-back-btn').addEventListener('click', function() {
  showHomeView();
  lataaKotinakyma();
});

// TASO 2 (2026-07-21, ks. KONSEPTIKIRJA.md 4.10b) — kolme Varasto-sivutyyppiä
// samalla luontilomakkeella, vain napautettu tyyppi vaikuttaa insertiin.
let uusiVarastoTyyppi = 'normal';
document.querySelectorAll('.varasto-tyyppi-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    uusiVarastoTyyppi = btn.dataset.tyyppi;
    document.querySelectorAll('.varasto-tyyppi-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
    const input = document.getElementById('new-varasto-input');
    input.placeholder = uusiVarastoTyyppi === 'teema' ? 'uuden teeman nimi...'
      : uusiVarastoTyyppi === 'vahdittu' ? 'uuden vahditun asian nimi...'
      : 'uuden muistikirjan nimi...';
  });
});

document.getElementById('new-varasto-btn').addEventListener('click', async function() {
  const varastoInput = document.getElementById('new-varasto-input');
  const nimi = varastoInput.value.trim();
  if (nimi === '') { varastoInput.focus(); return; }

  const rivi = { name: nimi, type: 'checklist', owner_id: currentUserId, category: 'varasto', list_type: uusiVarastoTyyppi };
  // Teema/Vahdittu ovat AINA jaettuja (KONSEPTIKIRJA.md 4.10b: "jaettu,
  // molemmat näkevät/kartuttavat") — ei odoteta erillistä jako-tekoa kuten
  // normaaleilla listoilla, koska koko ominaisuuden tarkoitus on kahden
  // vanhemman yhteinen muisti/seuranta.
  if (uusiVarastoTyyppi !== 'normal') rivi.visibility = 'shared';

  const { data, error } = await db.from('lists').insert(rivi).select().single();
  if (ilmoitaKirjoitusvirheesta(error, 'Listan luonti')) return;
  logEvent('created', 'list', data.id, nimi, data.id);
  varastoInput.value = '';
  lataaVarasto();
});

document.getElementById('new-varasto-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('new-varasto-btn').click();
  }
});

// Kalenteri
document.getElementById('kalenteri-back-btn').addEventListener('click', function() {
  showHomeView();
  lataaKotinakyma();
});

// Asetukset
document.getElementById('asetukset-back-btn').addEventListener('click', function() {
  showHomeView();
  lataaKotinakyma();
});
document.getElementById('push-lupa-btn').addEventListener('click', pyydaIlmoitusLupa);
document.getElementById('push-testi-btn').addEventListener('click', laheteTestipush);
document.getElementById('hytti-kalenteri-toggle').addEventListener('change', function(e) {
  localStorage.setItem(HYTTI_KALENTERISSA_KEY, e.target.checked ? 'true' : 'false');
  paivitaHyttiTyoVapaaLabel();
  naytaIlmoitus(e.target.checked ? 'Opiskelu näkyy nyt Kalenterissa' : 'Opiskelu piilotettu Kalenterista');
});

// Kuormavahdin raja tallennetaan koko perheelle yhteiseen `asetukset`-tauluun
// (EI laitekohtaisesti, toisin kuin Hytti-kytkin yllä) — kumpikin käyttäjä
// näkee saman rajan, koska kyse on kalenterin yhteisestä kuormasta.
document.getElementById('kuormaraja-input').addEventListener('change', async function(e) {
  const uusiRaja = parseInt(e.target.value, 10);
  if (isNaN(uusiRaja) || uusiRaja < 1) {
    e.target.value = haeAsetusNumero('paivan_menoraja', 5);
    return;
  }
  const { error } = await db.from('asetukset').upsert({ key: 'paivan_menoraja', value: String(uusiRaja) }, { onConflict: 'key' });
  if (error) {
    console.error('Kuormarajan tallennus epäonnistui:', error);
    return;
  }
  asetuksetKartta.paivan_menoraja = String(uusiRaja);
  naytaIlmoitus('Kuormaraja tallennettu: ' + uusiRaja);
});

// Näkyvien ankkureiden oletusmäärä (2026-08-03, Katrin pyyntö) — sama
// asetus-kaava kuin kuormarajalla, 0 sallittu (min="0" HTML:ssä toistaiseksi
// ainoa paikka missä alaraja poikkeaa kuormarajan >=1:stä).
document.getElementById('ankkurit-nayta-maara-input').addEventListener('change', async function(e) {
  const uusiMaara = parseInt(e.target.value, 10);
  if (isNaN(uusiMaara) || uusiMaara < 0) {
    e.target.value = haeAsetusNumero('ankkurit_nayta_maara', 3);
    return;
  }
  const { error } = await db.from('asetukset').upsert({ key: 'ankkurit_nayta_maara', value: String(uusiMaara) }, { onConflict: 'key' });
  if (error) {
    console.error('Ankkurien näyttömäärän tallennus epäonnistui:', error);
    return;
  }
  asetuksetKartta.ankkurit_nayta_maara = String(uusiMaara);
  naytaIlmoitus('Ankkureita näytetään oletuksena: ' + uusiMaara);
  lataaAnkkurit();
});

// Huolilipun kynnysarvot (2026-08-04, ks. sql/094, opintoPaivanKuorma())
// — sama data-ohjattu säätökaava kuin kuormarajalla, jotta kynnyksiä voi
// tarkentaa oikean käytön perusteella ilman koodimuutosta.
function sidoHuoliKynnysInput(inputId, avain, oletus, nimi) {
  document.getElementById(inputId).addEventListener('change', async function(e) {
    const uusi = parseInt(e.target.value, 10);
    if (isNaN(uusi) || uusi < 0) {
      e.target.value = haeAsetusNumero(avain, oletus);
      return;
    }
    const { error } = await db.from('asetukset').upsert({ key: avain, value: String(uusi) }, { onConflict: 'key' });
    if (error) {
      console.error(nimi + ' tallennus epäonnistui:', error);
      return;
    }
    asetuksetKartta[avain] = String(uusi);
    naytaIlmoitus(nimi + ' tallennettu: ' + uusi);
  });
}
sidoHuoliKynnysInput('huoli-keski-kynnys-input', 'huoli_keski_kynnys', 10, 'Huolen keski-kynnys');
sidoHuoliKynnysInput('huoli-raskas-kynnys-input', 'huoli_raskas_kynnys', 30, 'Huolen raskas-kynnys');
sidoHuoliKynnysInput('kurssi-kiireellisyys-input', 'kurssi_kiireellisyys_paivia', 3, 'Kurssin kiireellisyysraja');
sidoHuoliKynnysInput('tuntia-per-op-input', 'tuntia_per_op', 27, 'Tuntia per opintopiste');
sidoHuoliKynnysInput('hoitotaso-jalkeenjaanti-input', 'hoitotaso_jalkeenjaanti_kynnys', 40, 'Hoitotason jälkeenjääntikynnys');
sidoHuoliKynnysInput('silta-puskuri-input', 'silta_puskuri_paivia', 7, 'Sillan puskuri');
sidoHuoliKynnysInput('silta-leviamissyvyys-input', 'silta_leviamissyvyys', 2, 'Kiireellisyyden leviämissyvyys');
sidoHuoliKynnysInput('sillat-auto-paivia-input', 'sillat_auto_paivia', 7, 'Siltojen auto-tarkistuksen raja');
sidoHuoliKynnysInput('sessio-jarkevyys-input', 'sessio_jarkevyys_tunnit', 3, 'Session järkevyyskynnys');
sidoHuoliKynnysInput('tehdyn-nakyvyys-input', 'tehdyn_nakyvyys_maara', 0, 'Tehdyn kortin näkyvyysmäärä');
sidoHuoliKynnysInput('kesto-priming-input', 'kesto_priming_min', 15, 'Primingin kestoarvio');
sidoHuoliKynnysInput('kesto-encoding-input', 'kesto_encoding_min', 45, 'Encodingin kestoarvio');
sidoHuoliKynnysInput('kesto-retrieval-input', 'kesto_retrieval_min', 20, 'Retrievalin kestoarvio');
sidoHuoliKynnysInput('kesto-yllapito-input', 'kesto_yllapito_min', 10, 'Ylläpidon kestoarvio');
sidoHuoliKynnysInput('siirtymapuskuri-input', 'siirtymapuskuri_min', 30, 'Siirtymäpuskuri');
sidoHuoliKynnysInput('min-paallekkainen-input', 'min_paallekkainen_min', 15, 'Vähimmäispäällekkäisyys');
sidoHuoliKynnysInput('yksin-hetkittain-raja-input', 'yksin_hetkittain_raja_min', 90, 'Yksin hetkittäin -raja');
sidoHuoliKynnysInput('aterian-kesto-input', 'aterian_kesto_min', 30, 'Aterian kesto');

// Aterian alku (2026-08-17, §4.5 suojattu ateria) — aika-kenttä, ei sovi
// sidoHuoliKynnysInput:n numero-oletukseen, siksi oma pieni sidonta.
document.getElementById('aterian-alku-input').addEventListener('change', async function(e) {
  const uusi = e.target.value;
  if (!uusi) {
    e.target.value = haeAsetusTeksti('ateria_alku', '11:00');
    return;
  }
  const { error } = await db.from('asetukset').upsert({ key: 'ateria_alku', value: uusi }, { onConflict: 'key' });
  if (error) {
    console.error('Aterian alun tallennus epäonnistui:', error);
    return;
  }
  asetuksetKartta['ateria_alku'] = uusi;
  naytaIlmoitus('Aterian alku: ' + uusi);
});

// === HYTIN IKKUNAT (2026-08-10, ks. HYTTI_SPEKSI.md §4.5/§4.5b, sql/112) ===
// Vaihe 1a: pelkkä tallennus ja hallinta — generaattori (Vaihe 3) ei vielä
// lue näitä mihinkään. viikonpaiva 0=su...6=la, sama numerointi kuin
// lapsi_viikkopohjassa (sql/105).
const VIIKONPAIVA_NIMET_HYTTI = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'];

async function lataaHyttiOpiskeluaika() {
  if (!currentUserId) return;
  const { data, error } = await db.from('hytti_opiskeluaika').select().eq('owner_id', currentUserId);
  if (error) {
    console.error('Opiskeluajan haku epäonnistui:', error);
    return;
  }
  const kartta = {};
  (data || []).forEach(function(r) { kartta[r.viikonpaiva] = r; });

  const ruudukko = document.getElementById('hytti-opiskeluaika-ruudukko');
  ruudukko.innerHTML = '';
  for (let vp = 0; vp < 7; vp++) {
    const rivi = kartta[vp];
    const el = document.createElement('div');
    el.className = 'hytti-opiskeluaika-rivi';

    const nimi = document.createElement('span');
    nimi.textContent = VIIKONPAIVA_NIMET_HYTTI[vp];
    el.appendChild(nimi);

    const alkuInput = document.createElement('input');
    alkuInput.type = 'time';
    alkuInput.className = 'settings-numero-input';
    alkuInput.value = rivi ? rivi.alkaa.slice(0, 5) : '09:00';
    el.appendChild(alkuInput);

    const loppuInput = document.createElement('input');
    loppuInput.type = 'time';
    loppuInput.className = 'settings-numero-input';
    loppuInput.value = rivi ? rivi.paattyy.slice(0, 5) : '15:30';
    el.appendChild(loppuInput);

    // Kentät ESITÄYTTYVÄT oletusarvolla vaikka mitään ei ole vielä
    // tallennettu — ilman tätä merkkiä se näyttää tallennetulta vaikka ei
    // ole (Katrin havaitsema luottamusaukko 18.8.2026).
    if (!rivi) {
      const merkki = document.createElement('span');
      merkki.className = 'hytti-opiskeluaika-ei-tallennettu';
      merkki.textContent = 'ei tallennettu';
      el.appendChild(merkki);
    }

    async function tallenna() {
      const alku = alkuInput.value, loppu = loppuInput.value;
      if (!alku || !loppu || alku >= loppu) {
        naytaIlmoitus('Alun pitää olla ennen loppua');
        return;
      }
      const { error: tallennusError } = await db.from('hytti_opiskeluaika')
        .upsert({ owner_id: currentUserId, viikonpaiva: vp, alkaa: alku, paattyy: loppu }, { onConflict: 'owner_id,viikonpaiva' });
      if (tallennusError) {
        console.error('Opiskeluajan tallennus epäonnistui:', tallennusError);
        naytaIlmoitus('Tallennus epäonnistui');
        return;
      }
      naytaIlmoitus(VIIKONPAIVA_NIMET_HYTTI[vp] + ': ' + alku + '–' + loppu);
    }
    alkuInput.addEventListener('change', tallenna);
    loppuInput.addEventListener('change', tallenna);

    ruudukko.appendChild(el);
  }
}

// Arkipäivien pikatäyttö (2026-08-18) — täyttää ma–pe (viikonpaiva 1–5)
// yhdellä painalluksella sen sijaan että kaikki viisi päivää pitäisi
// käydä läpi erikseen (ks. index.html:n oma kommentti samasta kohdasta).
document.getElementById('hytti-opiskeluaika-arki-btn').addEventListener('click', async function() {
  if (!currentUserId) return;
  const alku = document.getElementById('hytti-opiskeluaika-arki-alku').value;
  const loppu = document.getElementById('hytti-opiskeluaika-arki-loppu').value;
  if (!alku || !loppu || alku >= loppu) {
    naytaIlmoitus('Alun pitää olla ennen loppua');
    return;
  }
  const rivit = [1, 2, 3, 4, 5].map(function(vp) {
    return { owner_id: currentUserId, viikonpaiva: vp, alkaa: alku, paattyy: loppu };
  });
  const { error } = await db.from('hytti_opiskeluaika').upsert(rivit, { onConflict: 'owner_id,viikonpaiva' });
  if (error) {
    console.error('Arkipäivien opiskeluajan tallennus epäonnistui:', error);
    naytaIlmoitus('Tallennus epäonnistui');
    return;
  }
  naytaIlmoitus('Ma–pe: ' + alku + '–' + loppu);
  lataaHyttiOpiskeluaika();
});

async function lataaHyttiSuljetutIkkunat() {
  if (!currentUserId) return;
  const { data, error } = await db.from('hytti_suljetut_ikkunat').select().eq('owner_id', currentUserId).order('viikonpaiva').order('alkaa');
  if (error) {
    console.error('Suljettujen ikkunoiden haku epäonnistui:', error);
    return;
  }
  const listEl = document.getElementById('hytti-suljetut-ikkunat-lista');
  listEl.innerHTML = '';
  (data || []).forEach(function(ikkuna) {
    const li = document.createElement('li');
    const teksti = document.createElement('span');
    teksti.textContent = VIIKONPAIVA_NIMET_HYTTI[ikkuna.viikonpaiva] + ' ' + ikkuna.alkaa.slice(0, 5) + '–' + ikkuna.paattyy.slice(0, 5) + (ikkuna.syy ? ' — ' + ikkuna.syy : '');
    li.appendChild(teksti);
    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function() {
      const { error: poistoError } = await db.from('hytti_suljetut_ikkunat').delete().eq('id', ikkuna.id);
      if (ilmoitaKirjoitusvirheesta(poistoError, 'Suljetun ikkunan poisto')) return;
      lataaHyttiSuljetutIkkunat();
    });
    li.appendChild(poisto);
    listEl.appendChild(li);
  });
}

const suljettuIkkunaViikonpaivaSelect = document.getElementById('suljettu-ikkuna-viikonpaiva');
VIIKONPAIVA_NIMET_HYTTI.forEach(function(nimi, vp) {
  const optio = document.createElement('option');
  optio.value = String(vp);
  optio.textContent = nimi;
  suljettuIkkunaViikonpaivaSelect.appendChild(optio);
});

document.getElementById('suljettu-ikkuna-lisaa-btn').addEventListener('click', async function() {
  const vp = parseInt(suljettuIkkunaViikonpaivaSelect.value, 10);
  const alku = document.getElementById('suljettu-ikkuna-alku').value;
  const loppu = document.getElementById('suljettu-ikkuna-loppu').value;
  const syy = document.getElementById('suljettu-ikkuna-syy').value.trim();
  if (!alku || !loppu || alku >= loppu) { naytaIlmoitus('Anna kelvollinen aikaväli'); return; }
  const { error } = await db.from('hytti_suljetut_ikkunat').insert({ owner_id: currentUserId, viikonpaiva: vp, alkaa: alku, paattyy: loppu, syy: syy || null });
  if (ilmoitaKirjoitusvirheesta(error, 'Suljetun ikkunan lisäys')) return;
  document.getElementById('suljettu-ikkuna-alku').value = '';
  document.getElementById('suljettu-ikkuna-loppu').value = '';
  document.getElementById('suljettu-ikkuna-syy').value = '';
  lataaHyttiSuljetutIkkunat();
});

// === MUISTUTUSPANEELIN NAPIT JA RULLAT ===
// KORJATTU (2026-07-17, koonti 2 kohta 7 — "yksiköt eivät yhdisty"): vanha
// yksi määrä + yksi yksikkö (min/tunti/vrk/viikko) -pari ei sallinut
// yhdistelmiä ("10 h 13 min") — piti valita jompikumpi. Kolme erillistä
// rullaa (päivää/tuntia/minuuttia) LASKETAAN YHTEEN, natiivit <select>-
// elementit täytetään kerran sivun latauksessa (kevein iOS:ssä rullalta
// tuntuva toteutus, ei mikään erillinen kirjasto).
(function() {
  function taytaRulla(id, maxIncl, oletus) {
    const select = document.getElementById(id);
    for (let i = 0; i <= maxIncl; i++) {
      const optio = document.createElement('option');
      optio.value = i;
      optio.textContent = i;
      if (i === oletus) optio.selected = true;
      select.appendChild(optio);
    }
  }
  taytaRulla('muistutus-paivaa', 14, 0);
  taytaRulla('muistutus-tuntia', 23, 0);
  taytaRulla('muistutus-minuuttia', 59, 15);

  // Toistuva muistutus (2026-07-19) — "Joka N" -rulla alkaa 1:stä (taytaRulla
  // alkaa aina 0:sta, "joka 0." ei ole mielekäs), siksi oma pieni silmukka.
  const toistuvaN = document.getElementById('muistutus-toistuva-n');
  for (let i = 1; i <= 30; i++) {
    const optio = document.createElement('option');
    optio.value = i;
    optio.textContent = i;
    if (i === 3) optio.selected = true;
    toistuvaN.appendChild(optio);
  }
})();

// Kevyt haptiikka rullien pykälille (2026-08-11, Katrin pyyntö: "liquid
// glass & haptiikkaa... ei överisti mut siellä mihin se sopii", ks. myös
// satama-design-kuvaus.md:n oma maininta "iOS-natiivi rullavalitsin...
// kevyt naps jokaisella pykälän kohdalla"). Natiivi <select> ei anna JS:lle
// tapahtumaa JOKAISESTA pykälästä avoinna ollessaan (se on käyttöjärjestelmän
// oma, JS:n ulottumattomissa) — 'change' on ainoa saatavilla oleva koukku,
// eli haptiikka laukeaa kun valinta VAIHTUU, ei jokaisella visuaalisella
// pyörähdyksellä. Lähin mitä web-alustalla saa aikaan.
['muistutus-paivaa', 'muistutus-tuntia', 'muistutus-minuuttia'].forEach(function(id) {
  document.getElementById(id).addEventListener('change', function() {
    if (navigator.vibrate) navigator.vibrate(8);
  });
});

document.getElementById('muistutus-lisaa-btn').addEventListener('click', function() {
  const paivia = parseInt(document.getElementById('muistutus-paivaa').value, 10) || 0;
  const tunteja = parseInt(document.getElementById('muistutus-tuntia').value, 10) || 0;
  const minuutteja = parseInt(document.getElementById('muistutus-minuuttia').value, 10) || 0;
  const ms = paivia * 86400000 + tunteja * 3600000 + minuutteja * 60000;
  if (ms <= 0) {
    naytaIlmoitus('Valitse ainakin yksi arvo (päivä/tunti/minuutti)');
    return;
  }
  tuntopalauteValmis();
  lisaaMuistutus(new Date(Date.now() + ms));
});

document.querySelectorAll('#muistutus-pikanapit button').forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (!muistutusKohde || !muistutusKohde.eventDate || !muistutusKohde.eventTime) return;
    const tapahtumanHetki = new Date(muistutusKohde.eventDate + 'T' + muistutusKohde.eventTime).getTime();
    const offsetMs = parseInt(btn.dataset.min, 10) * 60 * 1000;
    lisaaMuistutus(new Date(tapahtumanHetki - offsetMs));
  });
});

// Aikavalitsin — KELLONAIKA-tila (2026-07-16, ks. muistiinpanot.md kohta 7):
// arjen muistutukset ajatellaan kellonaikoina ("huomenna klo 9"), ei
// minuuttilaskuina — tämä välilehti täydentää PIKA-tilaa (yllä), ei korvaa
// sitä. Välilehtivaihto piilottaa/näyttää sisällön, ei vaadi muuta tilaa.
document.querySelectorAll('.muistutus-tila-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (navigator.vibrate) navigator.vibrate(8);
    document.querySelectorAll('.muistutus-tila-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
    document.getElementById('muistutus-pika-tila').style.display = btn.dataset.tila === 'pika' ? 'block' : 'none';
    document.getElementById('muistutus-kellonaika-tila').style.display = btn.dataset.tila === 'kellonaika' ? 'block' : 'none';
  });
});

// Valmistautumisvaihe (2026-07-18, ks. muistiinpanot.md) — minuuttivalitsin
// aktivoituu vain kun tönäisy on kytketty päälle, sama selkeys-periaate
// kuin muualla (ei koskaan aktiivisen näköinen kontrolli joka ei vaikuta mihinkään).
document.getElementById('muistutus-valmistaudu-check').addEventListener('change', function(e) {
  document.getElementById('muistutus-valmistaudu-min').disabled = !e.target.checked;
});

// Sinnikäs muistutus (2026-07-19, ks. muistiinpanot.md "Sinnikäs muistutus")
// — sama "valinnat aktivoituvat vain kun kytketty päälle" -periaate.
document.getElementById('muistutus-sinnikas-check').addEventListener('change', function(e) {
  document.getElementById('muistutus-sinnikas-ikkuna').disabled = !e.target.checked;
  document.getElementById('muistutus-sinnikas-tiheys').disabled = !e.target.checked;
});

// Toistuva muistutus (2026-07-19, ks. muistiinpanot.md "Toistuva muistutus")
// — täppä vaihtaa koko lomakkeen muodon: #muistutus-normaali-osiot (Pika/
// Kellonaika-välilehdet + Sinnikäs-rivi) piiloon, oma lomake tilalle. Koska
// Sinnikäs-täppä asuu normaali-osioiden SISÄLLÄ, sen piilottaminen riittää
// estämään toistuva+sinnikäs-yhdistelmän (tietoinen rajaus tässä erässä) —
// ei tarvita erillistä poissulkevaa disable-logiikkaa.
document.getElementById('muistutus-toistuva-check').addEventListener('change', function(e) {
  if (navigator.vibrate) navigator.vibrate(8);
  const toistuva = e.target.checked;
  document.getElementById('muistutus-normaali-osiot').style.display = toistuva ? 'none' : 'block';
  document.getElementById('muistutus-toistuva-lomake').style.display = toistuva ? 'block' : 'none';
});

document.querySelectorAll('.muistutus-toistuva-tyyppi-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (navigator.vibrate) navigator.vibrate(8);
    document.querySelectorAll('.muistutus-toistuva-tyyppi-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
    document.getElementById('muistutus-toistuva-viikonpaivat').style.display = btn.dataset.tyyppi === 'weekday' ? 'block' : 'none';
    document.getElementById('muistutus-toistuva-intervalli').style.display = btn.dataset.tyyppi === 'interval' ? 'block' : 'none';
  });
});

document.querySelectorAll('.muistutus-viikonpaiva-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (navigator.vibrate) navigator.vibrate(8);
    btn.classList.toggle('active');
  });
});

// Tunti-intervallilla ei ole erillistä kellonaikaa (spec: "tunti-intervallilla
// ei erillistä kellonaikaa") — se on puhdas kesto, ei kalenterihetki.
document.getElementById('muistutus-toistuva-yksikko').addEventListener('change', function(e) {
  document.getElementById('muistutus-toistuva-intervalli-aika-rivi').style.display = e.target.value === 'hour' ? 'none' : 'flex';
});

document.getElementById('muistutus-toistuva-loppuu-check').addEventListener('change', function(e) {
  document.getElementById('muistutus-toistuva-loppuu-pvm').disabled = !e.target.checked;
});

// Pikanapit säilyttävät jo asetetun kellonajan (jos käyttäjä on jo pyörittänyt
// rullaa) ja vaihtavat vain päivän — muuten "Huomenna"-napin painaminen
// kellonajan valinnan JÄLKEEN nollaisi juuri tehdyn valinnan.
function asetaKellonaikaPikanappiPaiva(paivaOffset) {
  const input = document.getElementById('muistutus-hetki-input');
  const nykyinenKlo = input.value && input.value.indexOf('T') !== -1 ? input.value.split('T')[1] : '09:00';
  const pvm = new Date();
  pvm.setDate(pvm.getDate() + paivaOffset);
  input.value = paivamaaraISO(pvm) + 'T' + nykyinenKlo;
}
document.getElementById('muistutus-pvm-tanaan').addEventListener('click', function() {
  asetaKellonaikaPikanappiPaiva(0);
});
document.getElementById('muistutus-pvm-huomenna').addEventListener('click', function() {
  asetaKellonaikaPikanappiPaiva(1);
});

document.getElementById('muistutus-kellonaika-lisaa-btn').addEventListener('click', function() {
  const hetki = document.getElementById('muistutus-hetki-input').value;
  if (!hetki) {
    naytaIlmoitus('Valitse sekä päivä että kellonaika');
    return;
  }
  tuntopalauteValmis();
  lisaaMuistutus(new Date(hetki));
});

document.getElementById('muistutus-sulje').addEventListener('click', suljeMuistutusPaneeli);
document.getElementById('muistutus-overlay').addEventListener('click', function(e) {
  if (e.target === document.getElementById('muistutus-overlay')) suljeMuistutusPaneeli();
});

function suljeRistiriitaVahvistus() {
  document.getElementById('ristiriita-overlay').style.display = 'none';
}
document.getElementById('ristiriita-sulje').addEventListener('click', suljeRistiriitaVahvistus);
document.getElementById('ristiriita-overlay').addEventListener('click', function(e) {
  if (e.target === document.getElementById('ristiriita-overlay')) suljeRistiriitaVahvistus();
});
document.getElementById('muistutus-asetuksiin-btn').addEventListener('click', function() {
  suljeMuistutusPaneeli();
  avaaOsio({ route: 'asetukset' });
});

document.querySelectorAll('.kalenteri-tila-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    kalenteriTila = btn.dataset.tila;
    document.querySelectorAll('.kalenteri-tila-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
    lataaKalenteri();
  });
});

document.getElementById('kalenteri-edellinen').addEventListener('click', function() { siirraKalenteria(-1); });
document.getElementById('kalenteri-seuraava').addEventListener('click', function() { siirraKalenteria(1); });
document.getElementById('reitti-viikko-edellinen').addEventListener('click', function() { siirraReittiViikkoa(-1); });
document.getElementById('reitti-viikko-seuraava').addEventListener('click', function() { siirraReittiViikkoa(1); });

document.getElementById('kalenteri-add-btn').addEventListener('click', async function() {
  const kalenteriInput = document.getElementById('kalenteri-input');
  const otsikko = kalenteriInput.value.trim();
  if (otsikko === '') { kalenteriInput.focus(); return; }

  const { error } = await db.from('kalenteri_tapahtumat').insert({
    title: otsikko,
    event_date: paivamaaraISO(kalenteriPvm),
    user_id: currentUserId,
  });
  if (ilmoitaKirjoitusvirheesta(error, 'Tapahtuman lisäys')) return;
  kalenteriInput.value = '';
  lataaKalenteri();
});

document.getElementById('kalenteri-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('kalenteri-add-btn').click();
  }
});

document.getElementById('new-list-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('new-list-btn').click();
  }
});

// Kuunnellaan muutoksia reaaliajassa — päivittää auki olevan listan
const realtimeChannel = db.channel('tuotteet')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tuotteet' }, () => {
    if (currentList) lataaLista();
  })
  .subscribe();

// Huomiopallurat elävät ilman sivun päivitystä (2026-07-13) — sama
// Realtime-mekanismi kuin tuotteet-kanavalla. Vaatii Replication päällä
// laituri/kalenteri_tapahtumat/kalenteri_kuittaukset-tauluille
// (sql/034_realtime_huomiopallurat.sql).
const laituriRealtimeChannel = db.channel('laituri-pallura')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'laituri' }, () => {
    paivitaLaituriBadge();
  })
  .subscribe();

const kalenteriPalluraChannel = db.channel('kalenteri-pallura')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'kalenteri_tapahtumat' }, () => {
    paivitaKuittausTila();
    paivitaRistiriitaPallura();
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'kalenteri_kuittaukset' }, () => {
    paivitaKuittausTila();
  })
  // Ristiriitapaketti (2026-07-17): "Keskusteltu"-kuittaus näkyy molemmille
  // reaaliajassa, sama malli kuin kuittausjonolla — kumpi tahansa kuittaa,
  // toisen etusivun pallura/avoin Kalenteri-näkymä rauhoittuu heti.
  .on('postgres_changes', { event: '*', schema: 'public', table: 'kalenteri_ristiriita_kuittaukset' }, () => {
    paivitaRistiriitaPallura();
    if (document.getElementById('kalenteri-view').style.display !== 'none') lataaKalenteri();
  })
  .subscribe();

// Päivitetään lista ja Realtime-yhteys kun appi tulee taustalta etualalle
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    lataaLista();
    if (realtimeChannel.state !== 'joined') {
      realtimeChannel.subscribe();
    }
  }
});

window.addEventListener('focus', function() {
  lataaLista();
});

// === PUSH-ILMOITUKSET ===
// Yleiskäyttöinen web push -infra, ei sidottu mihinkään yksittäiseen
// ominaisuuteen — perusta tuleville muistutuksille. VAPID_PUBLIC_KEY saa
// näkyä tässä suoraan koodissa, koska julkinen avain on tarkoitettu
// julkiseksi — vain yksityinen avain on salainen, se on vain Vercelin
// ympäristömuuttujissa palvelinpuolella (api/_lib/push-test.js).
const VAPID_PUBLIC_KEY = 'BBnARMtYtTabRROSxmKux3RG3LBcWsWTBhFB805RJgUKcROtJFdX6mQfUa1U2jxXBDcHK4GgkI9ZkJ8o_udhspg';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Päivittää Asetukset-näkymän ilmoitustekstin ja nappien näkyvyyden.
async function paivitaPushTila() {
  const teksti = document.getElementById('push-tila-teksti');
  const lupaNappi = document.getElementById('push-lupa-btn');
  const testiNappi = document.getElementById('push-testi-btn');

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    teksti.textContent = 'Tämä selain ei tue ilmoituksia.';
    lupaNappi.style.display = 'none';
    testiNappi.style.display = 'none';
    return;
  }

  if (Notification.permission === 'denied') {
    teksti.textContent = 'Ilmoitukset on estetty. Salli ne puhelimen omista asetuksista (Safari/Satama-appi) ja avaa tämä näkymä uudelleen.';
    lupaNappi.style.display = 'none';
    testiNappi.style.display = 'none';
    return;
  }

  const rekisterointi = await navigator.serviceWorker.ready;
  const tilaus = await rekisterointi.pushManager.getSubscription();

  if (Notification.permission === 'granted' && tilaus) {
    teksti.textContent = 'Ilmoitukset ovat käytössä tällä laitteella.';
    lupaNappi.style.display = 'none';
    testiNappi.style.display = 'block';
  } else {
    teksti.textContent = 'Ilmoitukset eivät ole vielä käytössä tällä laitteella.';
    lupaNappi.style.display = 'block';
    testiNappi.style.display = 'none';
  }
}

// Kutsutaan VAIN napin klikkauksesta — iOS vaatii että lupakysely lähtee
// suoraan käyttäjän omasta eleestä, ei koskaan automaattisesti sivun
// avautuessa (Notification.requestPermission() hylätään hiljaa jos sitä
// yritetään kutsua ilman tuoretta käyttäjän eleitä).
async function pyydaIlmoitusLupa() {
  const lupa = await Notification.requestPermission();
  if (lupa !== 'granted') {
    await paivitaPushTila();
    return;
  }

  // BUGIKORJAUS (2026-07-21, "Riippuvuudet ja rajat" -auditointi, ks.
  // muistiinpanot.md): pushManager.subscribe() voi heittää poikkeuksen (esim.
  // push-palvelun tilapäinen rekisteröintivirhe, epätavallinen PWA-tila
  // iOS Safarissa) — ilman try/catchia koko funktio keskeytyi silloin ennen
  // paivitaPushTila()-kutsua, jolloin nappi ei koskaan piirtynyt uudelleen
  // eikä käyttäjä nähnyt MITÄÄN vahvistusta tai virhettä OS:n lupadialogin
  // hyväksymisen jälkeen. Sama try/catch-malli kuin laheteTestipush()
  // heti alla.
  try {
    const rekisterointi = await navigator.serviceWorker.ready;
    const tilaus = await rekisterointi.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const json = tilaus.toJSON();
    const { error } = await db.from('push_tilaukset').upsert({
      user_id: currentUserId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    }, { onConflict: 'endpoint' });

    if (error) {
      console.error('Push-tilauksen tallennus epäonnistui:', error);
      document.getElementById('push-tila-teksti').textContent = 'Tilauksen tallennus epäonnistui, yritä uudelleen.';
      return;
    }
  } catch (e) {
    console.error('Ilmoitustilauksen luonti epäonnistui:', e.message);
    document.getElementById('push-tila-teksti').textContent = 'Ilmoitusten käyttöönotto epäonnistui, yritä uudelleen.';
    return;
  }

  await paivitaPushTila();
}

async function laheteTestipush() {
  const testiNappi = document.getElementById('push-testi-btn');
  testiNappi.disabled = true;
  const alkuperainenTeksti = testiNappi.textContent;
  testiNappi.textContent = 'Lähetetään...';

  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    const response = await fetch('/api/cron?task=push-test', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    });
    const tulos = await response.json();
    if (!response.ok) {
      naytaIlmoitus('Testipush epäonnistui: ' + (tulos.error || response.status));
    } else {
      naytaIlmoitus('Testipush lähetetty (' + tulos.lahetetty + ' laitteelle)');
    }
  } catch (e) {
    naytaIlmoitus('Testipush epäonnistui: ' + e.message);
  }

  testiNappi.disabled = false;
  testiNappi.textContent = alkuperainenTeksti;
}

// === MUISTUTUKSET (2026-07-10) ===
// Henkilökohtainen push-muistutus listan riville, kalenteritapahtumalle tai
// ankkurille. Rakentuu push-infran päälle (VAPID_PUBLIC_KEY, push_tilaukset
// yllä) — lähetys tapahtuu palvelimella (api/_lib/muistutukset-laheta.js), jota
// kutsuu ulkoinen GitHub Actions -cron 5 min välein (ks. .github/workflows/).
// Ks. muistiinpanot.md "Muistutukset"-osio täydelle suunnittelulle.

// Onko push käytössä TÄLLÄ laitteella (lupa myönnetty + tilaus tallennettu)?
// Käytetään porttina muistutuspaneelissa — muistutuksen asettaminen ilman
// pushia olisi näennäinen ominaisuus joka ei koskaan herättäisi ketään.
async function onkoPushKaytossa() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  if (Notification.permission !== 'granted') return false;
  const rekisterointi = await navigator.serviceWorker.ready;
  const tilaus = await rekisterointi.pushManager.getSubscription();
  return !!tilaus;
}

function muistutusAvain(source, sourceRef) {
  return source + ':' + String(sourceRef);
}

// Kaikki KIRJAUTUNEEN käyttäjän omat, vielä lähettämättömät muistutukset,
// ryhmiteltynä "source:source_ref"-avaimen mukaan — sama Set/Map-pohjainen
// "mitä on jo asetettu" -kuvio kuin ankkuroidutAvaimet ja kuitatutUidt.
let muistutuksetKartta = {};
async function paivitaMuistutuksetKartta() {
  const { data, error } = await db.from('muistutukset').select('id, source, source_ref, remind_at').is('sent_at', null);
  if (error) {
    console.error('Muistutusten haku epäonnistui:', error);
    return;
  }
  muistutuksetKartta = {};
  (data || []).forEach(function(m) {
    const avain = muistutusAvain(m.source, m.source_ref);
    if (!muistutuksetKartta[avain]) muistutuksetKartta[avain] = [];
    muistutuksetKartta[avain].push(m);
  });
}

// "ke 14.7. klo 14:30" -tyylinen lyhyt muotoilu — sama henki kuin
// avaaKuittausOverlay():n pvmTeksti.
function muotoileMuistutusAika(isoAika) {
  const d = new Date(isoAika);
  return d.getDate() + '.' + (d.getMonth() + 1) + '. klo ' +
    d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

// Luo rivin perään liitettävän kello-napin (+ mahdollisen aikamerkin) —
// käytetään identtisesti listariveillä, kalenteritapahtumilla ja
// ankkureilla. eventDate/eventTime annetaan VAIN kalenteritapahtumille
// (pikanappien "N ennen" -laskentaan), muille null.
function luoMuistutusNappi(source, sourceRef, content, eventDate, eventTime, jalkeenPaivitys) {
  const wrap = document.createElement('span');
  wrap.className = 'muistutus-wrap';

  const omat = muistutuksetKartta[muistutusAvain(source, sourceRef)] || [];

  const nappi = document.createElement('button');
  nappi.textContent = '⏰';
  nappi.className = 'reminder-btn' + (omat.length > 0 ? ' active' : '');
  nappi.addEventListener('click', function() {
    avaaMuistutusPaneeli(source, sourceRef, content, eventDate, eventTime, jalkeenPaivitys);
  });
  wrap.appendChild(nappi);

  if (omat.length === 1) {
    const aika = document.createElement('span');
    aika.className = 'muistutus-aika';
    aika.textContent = muotoileMuistutusAika(omat[0].remind_at);
    wrap.appendChild(aika);
  } else if (omat.length > 1) {
    const aika = document.createElement('span');
    aika.className = 'muistutus-aika';
    aika.textContent = '×' + omat.length;
    wrap.appendChild(aika);
  }

  return wrap;
}

// Paneelin nykyinen kohde — asetetaan avattaessa, tyhjennetään suljettaessa.
let muistutusKohde = null;

async function avaaMuistutusPaneeli(source, sourceRef, content, eventDate, eventTime, jalkeenPaivitys) {
  muistutusKohde = {
    source: source, sourceRef: String(sourceRef), content: content,
    eventDate: eventDate, eventTime: eventTime, jalkeenPaivitys: jalkeenPaivitys,
  };
  document.getElementById('muistutus-otsikko').textContent = 'Muistutus: ' + content;

  const pushiaEiOle = !(await onkoPushKaytossa());
  document.getElementById('muistutus-ei-pushia').style.display = pushiaEiOle ? 'block' : 'none';
  document.getElementById('muistutus-lomake').style.display = pushiaEiOle ? 'none' : 'block';
  document.getElementById('muistutus-pikanapit').style.display = (source === 'kalenteri' && eventDate && eventTime) ? 'flex' : 'none';

  // Aina PIKA-tilaan avattaessa (ennustettava oletus, ks. kohta 7) ja
  // KELLONAIKA-tilan päivä esitäytetään tänään:ksi ettei se jää tyhjäksi.
  document.querySelectorAll('.muistutus-tila-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.tila === 'pika'); });
  document.getElementById('muistutus-pika-tila').style.display = 'block';
  document.getElementById('muistutus-kellonaika-tila').style.display = 'none';
  document.getElementById('muistutus-hetki-input').value = paivamaaraISO(new Date()) + 'T09:00';

  // Valmistautumisvaihe (2026-07-18): EI oletuksena päällä, palautuu
  // pois joka avauksella — valinnainen per muistutus, ei pysyvä tila.
  // Oletusminuutit haetaan datasta (asetukset.valmistaudu_oletus_min,
  // fallback 30) vain jos se täsmää yhteen tarjolla olevista optioista.
  const valmistauduCheck = document.getElementById('muistutus-valmistaudu-check');
  const valmistauduMin = document.getElementById('muistutus-valmistaudu-min');
  valmistauduCheck.checked = false;
  valmistauduMin.disabled = true;
  const oletusMin = String(haeAsetusNumero('valmistaudu_oletus_min', 30));
  if (Array.from(valmistauduMin.options).some(function(o) { return o.value === oletusMin; })) {
    valmistauduMin.value = oletusMin;
  }

  // Sinnikäs muistutus (2026-07-19): sama "EI oletuksena päällä, palautuu
  // pois joka avauksella" -periaate — valinnainen per muistutus.
  const sinnikasCheck = document.getElementById('muistutus-sinnikas-check');
  sinnikasCheck.checked = false;
  document.getElementById('muistutus-sinnikas-ikkuna').disabled = true;
  document.getElementById('muistutus-sinnikas-tiheys').disabled = true;

  // Toistuva muistutus (2026-07-19): sama "EI oletuksena päällä" -periaate,
  // palautuu kokonaan alkutilaansa joka avauksella (viikonpäivä-tyyppi,
  // ei valittuja päiviä, klo 08:00, joka 3. päivä, ei loppumispäivää).
  document.getElementById('muistutus-toistuva-check').checked = false;
  document.getElementById('muistutus-normaali-osiot').style.display = 'block';
  document.getElementById('muistutus-toistuva-lomake').style.display = 'none';
  document.querySelectorAll('.muistutus-viikonpaiva-btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.muistutus-toistuva-tyyppi-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.tyyppi === 'weekday'); });
  document.getElementById('muistutus-toistuva-viikonpaivat').style.display = 'block';
  document.getElementById('muistutus-toistuva-intervalli').style.display = 'none';
  document.getElementById('muistutus-toistuva-viikko-aika').value = '08:00';
  document.getElementById('muistutus-toistuva-intervalli-aika').value = '08:00';
  document.getElementById('muistutus-toistuva-intervalli-aika-rivi').style.display = 'flex';
  document.getElementById('muistutus-toistuva-n').value = '3';
  document.getElementById('muistutus-toistuva-yksikko').value = 'day';
  document.getElementById('muistutus-toistuva-loppuu-check').checked = false;
  document.getElementById('muistutus-toistuva-loppuu-pvm').disabled = true;
  document.getElementById('muistutus-toistuva-loppuu-pvm').value = '';

  await paivitaMuistutusLista();
  document.getElementById('muistutus-overlay').style.display = 'flex';
}

function suljeMuistutusPaneeli() {
  document.getElementById('muistutus-overlay').style.display = 'none';
  muistutusKohde = null;
}

// Valmistautumisvaihe (2026-07-18, ks. muistiinpanot.md): sisältöetuliite
// kertoo mini-listassa kumpi rivi on (koska molemmat päämuistutus ja
// valmistautumis-tönäisy jakavat saman source/source_ref:in, ainoa ero on
// sisältö+aika) — sama merkkijono kirjoitetaan INSERTissä (lisaaMuistutus)
// ja luetaan täällä NÄYTTÖÄ varten, pidä nämä synkassa jos joskus muuttuu.
const VALMISTAUDU_ETULIITE = '🎒 Valmistaudu: ';

// Toistuva muistutus (2026-07-19, ks. muistiinpanot.md "Toistuva muistutus")
// — mini-listan kuvausteksti säännölle ("ti+to klo 08:00" / "joka 3. päivä
// klo 18:00"), sama kuvausmuoto käytetään vain näyttöön, ei tallenteta.
const VIIKONPAIVA_LYHENNE = { 1: 'ma', 2: 'ti', 3: 'ke', 4: 'to', 5: 'pe', 6: 'la', 7: 'su' };
const TOISTUVA_YKSIKKO_NIMI = { hour: 'tunnin', day: 'päivän', week: 'viikon', month: 'kuukauden', year: 'vuoden' };

function muotoileToistuvaKuvaus(m) {
  if (m.recurrence_type === 'weekday') {
    const paivat = (m.weekdays || []).slice().sort(function(a, b) { return a - b; })
      .map(function(pv) { return VIIKONPAIVA_LYHENNE[pv]; }).join('+');
    return paivat + ' klo ' + m.time_of_day;
  }
  if (m.recurrence_type === 'interval') {
    const yksikko = TOISTUVA_YKSIKKO_NIMI[m.interval_unit] || m.interval_unit;
    const aika = m.interval_unit === 'hour' ? '' : (' klo ' + m.time_of_day);
    return 'joka ' + m.interval_n + '. ' + yksikko + aika;
  }
  return 'toistuva';
}

async function paivitaMuistutusLista() {
  if (!muistutusKohde) return;
  const { data, error } = await db.from('muistutukset').select('*')
    .eq('source', muistutusKohde.source).eq('source_ref', muistutusKohde.sourceRef)
    .is('sent_at', null).order('remind_at');
  if (error) {
    console.error('Muistutusten haku epäonnistui:', error);
    return;
  }

  const listaEl = document.getElementById('muistutus-lista');
  listaEl.innerHTML = '';

  if (!data || data.length === 0) {
    const tyhja = document.createElement('p');
    tyhja.className = 'section-empty';
    tyhja.textContent = 'Ei muistutuksia vielä.';
    listaEl.appendChild(tyhja);
    return;
  }

  data.forEach(function(m) {
    const rivi = document.createElement('div');
    rivi.className = 'muistutus-rivi';

    const teksti = document.createElement('span');
    if (m.recurring) {
      // Toistuva muistutus (2026-07-19): EI kuittaushetkeä näytettävänä
      // (kuittausta ei ole, rivi elää loputtomiin) — kuvaus + seuraava kerta.
      teksti.textContent = '🔁 ' + muotoileToistuvaKuvaus(m) + ' · seuraava: ' + muotoileMuistutusAika(m.remind_at);
    } else {
      const onValmistautumis = m.content.indexOf(VALMISTAUDU_ETULIITE) === 0;
      // Sinnikäs muistutus (2026-07-19): näyttää tärähdyssarjan etenemisen
      // ("🔁 2/4") ajan sijaan kun sarja on jo alkanut, muuten kohdehetken.
      const etuliite = onValmistautumis ? '🎒 ' : (m.persistent ? '🔁 ' + m.sent_count + '/' + m.frequency + ' · ' : '');
      teksti.textContent = etuliite + muotoileMuistutusAika(m.remind_at);
    }
    rivi.appendChild(teksti);

    const napit = document.createElement('span');

    // "✓ Hoidettu" — VAIN sinnikkäille (kertaluontoisella ei ole mitä
    // kuitata, se joko odottaa tai on jo lähtenyt). Kuittaus pysäyttää
    // tärähdyssarjan HETI: sent_at asetetaan tässä SAMALLA client-puolella
    // (ei vain acked_at) jotta rivi katoaa listasta heti eikä vasta
    // seuraavalla ~5 min cron-kierroksella (ks. api/_lib/muistutukset-laheta.js,
    // joka muuten tarkistaisi/päättäisi sen vasta seuraavalla ajolla).
    if (m.persistent) {
      const hoidettu = document.createElement('button');
      hoidettu.className = 'muistutus-hoidettu-btn';
      hoidettu.textContent = '✓ Hoidettu';
      hoidettu.addEventListener('click', async function() {
        const nytIso = new Date().toISOString();
        const { error: ackError } = await db.from('muistutukset').update({ acked_at: nytIso, sent_at: nytIso }).eq('id', m.id);
        if (ilmoitaKirjoitusvirheesta(ackError, 'Muistutuksen kuittaus')) return;
        await paivitaMuistutuksetKartta();
        await paivitaMuistutusLista();
        if (muistutusKohde && muistutusKohde.jalkeenPaivitys) muistutusKohde.jalkeenPaivitys();
      });
      napit.appendChild(hoidettu);
    }

    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function() {
      const { error: poistoError } = await db.from('muistutukset').delete().eq('id', m.id);
      ilmoitaKirjoitusvirheesta(poistoError, 'Muistutuksen poisto');
      await paivitaMuistutuksetKartta();
      await paivitaMuistutusLista();
      if (muistutusKohde && muistutusKohde.jalkeenPaivitys) muistutusKohde.jalkeenPaivitys();
    });
    napit.appendChild(poisto);
    rivi.appendChild(napit);

    listaEl.appendChild(rivi);
  });
}

async function lisaaMuistutus(remindAtDate) {
  if (!muistutusKohde) return;

  // Sinnikäs muistutus (2026-07-19, ks. muistiinpanot.md "Sinnikäs
  // muistutus") — VAIN päämuistutukselle, EI koskaan valmistautumis-
  // tönäisylle (ks. alempana): remind_at toimii silloin KOHDEHETKENÄ, ei
  // ensimmäisen tärähdyksen ajankohtana (ks. api/_lib/muistutukset-laheta.js).
  const sinnikasCheck = document.getElementById('muistutus-sinnikas-check');
  const paaMuistutusRivi = {
    user_id: currentUserId,
    source: muistutusKohde.source,
    source_ref: muistutusKohde.sourceRef,
    content: muistutusKohde.content,
    remind_at: remindAtDate.toISOString(),
  };
  if (sinnikasCheck && sinnikasCheck.checked) {
    paaMuistutusRivi.persistent = true;
    paaMuistutusRivi.window_minutes = parseInt(document.getElementById('muistutus-sinnikas-ikkuna').value, 10) || 60;
    paaMuistutusRivi.frequency = parseInt(document.getElementById('muistutus-sinnikas-tiheys').value, 10) || 4;
  }

  const { data: paaMuistutus, error } = await db.from('muistutukset').insert(paaMuistutusRivi).select().single();
  if (error) {
    console.error('Muistutuksen tallennus epäonnistui:', error);
    naytaIlmoitus('Muistutuksen tallennus epäonnistui');
    return;
  }

  // Valmistautumisvaihe (2026-07-18, ks. muistiinpanot.md): valinnainen
  // TOINEN, aikaisempi tönäisy — kevyt ensiversio ilman älylaskentaa, VAIN
  // kiinteä minuuttimäärä ennen. parent_id + sql/066:n "on delete cascade"
  // tekee siivouksesta ilmaisen (poistuu automaattisesti kun päämuistutus
  // poistetaan, ei tarvitse omaa sovelluskoodia sille).
  const valmistauduCheck = document.getElementById('muistutus-valmistaudu-check');
  let valmistautumisOnnistui = null;
  if (valmistauduCheck && valmistauduCheck.checked) {
    const minuutit = parseInt(document.getElementById('muistutus-valmistaudu-min').value, 10) || 30;
    const valmistautumisHetki = new Date(remindAtDate.getTime() - minuutit * 60000);
    const { error: valmistautumisError } = await db.from('muistutukset').insert({
      user_id: currentUserId,
      source: muistutusKohde.source,
      source_ref: muistutusKohde.sourceRef,
      content: VALMISTAUDU_ETULIITE + muistutusKohde.content,
      remind_at: valmistautumisHetki.toISOString(),
      parent_id: paaMuistutus.id,
    });
    if (valmistautumisError) console.error('Valmistautumis-tönäisyn tallennus epäonnistui:', valmistautumisError);
    valmistautumisOnnistui = !valmistautumisError;
  }

  const sinnikasPaalla = sinnikasCheck && sinnikasCheck.checked;
  naytaIlmoitus(valmistautumisOnnistui
    ? 'Muistutus + valmistautumistönäisy asetettu'
    : (sinnikasPaalla ? 'Sinnikäs muistutus asetettu' : 'Muistutus asetettu'));
  await paivitaMuistutuksetKartta();
  await paivitaMuistutusLista();
  if (muistutusKohde.jalkeenPaivitys) muistutusKohde.jalkeenPaivitys();
}

// Toistuva muistutus (2026-07-19, ks. muistiinpanot.md "Toistuva muistutus")
// — ENSIMMÄISEN kerran lasketaan tässä client-puolella tavallisella
// paikallisella Date-aritmetiikalla (EI wall-clock-to-UTC-temppua, joka on
// vain palvelinpuolen api/_lib/muistutukset-laheta.js:ssä tarpeen koska Vercel
// ajaa UTC:ssa — selain pyörii jo käyttäjän omassa Helsinki-ajassa, ks.
// aiempi aikakäsittely-auditti). Kaikki SEURAAVAT kerrat laskee cron.
function ensimmainenViikonpaivaHetki(valitutPaivat, aikaStr) {
  const aikaOsat = aikaStr.split(':').map(function(s) { return parseInt(s, 10); });
  const nyt = new Date();
  for (let lisays = 0; lisays <= 7; lisays++) {
    const ehdokas = new Date(nyt.getFullYear(), nyt.getMonth(), nyt.getDate() + lisays, aikaOsat[0], aikaOsat[1], 0, 0);
    const isoPaiva = ehdokas.getDay() === 0 ? 7 : ehdokas.getDay();
    if (valitutPaivat.indexOf(isoPaiva) !== -1 && ehdokas.getTime() > nyt.getTime()) {
      return ehdokas;
    }
  }
  return new Date(nyt.getTime() + 7 * 86400000);
}

function ensimmainenIntervalliHetki(n, yksikko, aikaStr) {
  const nyt = new Date();
  if (yksikko === 'hour') {
    return new Date(nyt.getTime() + n * 3600000);
  }
  const aikaOsat = aikaStr.split(':').map(function(s) { return parseInt(s, 10); });
  const tanaan = new Date(nyt.getFullYear(), nyt.getMonth(), nyt.getDate(), aikaOsat[0], aikaOsat[1], 0, 0);
  if (tanaan.getTime() > nyt.getTime()) return tanaan;
  const seuraava = new Date(tanaan);
  if (yksikko === 'day') seuraava.setDate(seuraava.getDate() + n);
  else if (yksikko === 'week') seuraava.setDate(seuraava.getDate() + n * 7);
  else if (yksikko === 'month') seuraava.setMonth(seuraava.getMonth() + n);
  else if (yksikko === 'year') seuraava.setFullYear(seuraava.getFullYear() + n);
  return seuraava;
}

document.getElementById('muistutus-toistuva-aseta-btn').addEventListener('click', function() {
  tuntopalauteValmis();
  lisaaToistuvaMuistutus();
});

async function lisaaToistuvaMuistutus() {
  if (!muistutusKohde) return;

  const tyyppi = document.querySelector('.muistutus-toistuva-tyyppi-btn.active').dataset.tyyppi;
  const rivi = {
    user_id: currentUserId,
    source: muistutusKohde.source,
    source_ref: muistutusKohde.sourceRef,
    content: muistutusKohde.content,
    recurring: true,
    recurrence_type: tyyppi,
  };
  let ensimmainenHetki;

  if (tyyppi === 'weekday') {
    const valitutPaivat = Array.from(document.querySelectorAll('.muistutus-viikonpaiva-btn.active'))
      .map(function(b) { return parseInt(b.dataset.pv, 10); });
    if (valitutPaivat.length === 0) {
      naytaIlmoitus('Valitse ainakin yksi viikonpäivä');
      return;
    }
    const aika = document.getElementById('muistutus-toistuva-viikko-aika').value || '08:00';
    rivi.weekdays = valitutPaivat;
    rivi.time_of_day = aika;
    ensimmainenHetki = ensimmainenViikonpaivaHetki(valitutPaivat, aika);
  } else {
    const n = parseInt(document.getElementById('muistutus-toistuva-n').value, 10) || 1;
    const yksikko = document.getElementById('muistutus-toistuva-yksikko').value;
    rivi.interval_n = n;
    rivi.interval_unit = yksikko;
    if (yksikko !== 'hour') {
      rivi.time_of_day = document.getElementById('muistutus-toistuva-intervalli-aika').value || '08:00';
    }
    ensimmainenHetki = ensimmainenIntervalliHetki(n, yksikko, rivi.time_of_day);
  }

  const loppuuCheck = document.getElementById('muistutus-toistuva-loppuu-check');
  if (loppuuCheck.checked) {
    const pvm = document.getElementById('muistutus-toistuva-loppuu-pvm').value;
    if (!pvm) {
      naytaIlmoitus('Valitse loppumispäivä tai poista "Loppuu"-täppä');
      return;
    }
    rivi.ends_at = new Date(pvm + 'T23:59:59').toISOString();
  }

  rivi.remind_at = ensimmainenHetki.toISOString();

  const { data: paaMuistutus, error } = await db.from('muistutukset').insert(rivi).select().single();
  if (error) {
    console.error('Toistuvan muistutuksen tallennus epäonnistui:', error);
    naytaIlmoitus('Toistuvan muistutuksen tallennus epäonnistui');
    return;
  }

  // Toistuva + Valmistaudu (sallittu yhdistelmä, ks. muistiinpanot.md) —
  // jokainen kerta saa oman esitönäisyn, ks. api/_lib/muistutukset-laheta.js
  // jossa cron laskee lapsen etäisyyden UUDELLEEN joka kerta parentin
  // edetessä (etäisyys päätellään, ei talleteta erikseen).
  const valmistauduCheck = document.getElementById('muistutus-valmistaudu-check');
  let valmistautumisOnnistui = null;
  if (valmistauduCheck && valmistauduCheck.checked) {
    const minuutit = parseInt(document.getElementById('muistutus-valmistaudu-min').value, 10) || 30;
    const valmistautumisHetki = new Date(ensimmainenHetki.getTime() - minuutit * 60000);
    const { error: valmistautumisError } = await db.from('muistutukset').insert({
      user_id: currentUserId,
      source: muistutusKohde.source,
      source_ref: muistutusKohde.sourceRef,
      content: VALMISTAUDU_ETULIITE + muistutusKohde.content,
      remind_at: valmistautumisHetki.toISOString(),
      parent_id: paaMuistutus.id,
    });
    if (valmistautumisError) console.error('Valmistautumis-tönäisyn tallennus epäonnistui (toistuva):', valmistautumisError);
    valmistautumisOnnistui = !valmistautumisError;
  }

  naytaIlmoitus(valmistautumisOnnistui ? 'Toistuva muistutus + valmistautumistönäisy asetettu' : 'Toistuva muistutus asetettu');
  await paivitaMuistutuksetKartta();
  await paivitaMuistutusLista();
  if (muistutusKohde.jalkeenPaivitys) muistutusKohde.jalkeenPaivitys();
}

// === ASETUKSET: TILI + SOVELLUS (2026-07-08) ===

// Näyttää kirjautuneen käyttäjän sähköpostin Asetusten Tili-osiossa
async function paivitaTiliTiedot() {
  const { data } = await db.auth.getSession();
  const sposti = data.session ? data.session.user.email : null;
  document.getElementById('tili-sposti').textContent = sposti ? 'Kirjautunut: ' + sposti : 'Ei kirjautunut';
}

// Muotoilee ISO-aikaleiman suhteelliseksi ("N min"/"N h"/"N pv") — riittävä
// tarkkuus "milloin viimeksi synkattu" -ilmoitukseen, ei tarvitse tarkkaa kelloa
function suhteellinenAika(isoAika) {
  const eroMs = Date.now() - new Date(isoAika).getTime();
  const minuutit = Math.round(eroMs / 60000);
  if (minuutit < 1) return 'alle minuutti sitten';
  if (minuutit < 60) return minuutit + ' min sitten';
  const tunnit = Math.round(minuutit / 60);
  if (tunnit < 24) return tunnit + ' h sitten';
  const paivat = Math.round(tunnit / 24);
  return paivat + ' pv sitten';
}

// Vinkit-lista (sql/035_ohjeet_vinkit.sql) — dataohjattu 2026-07-13, oli
// aiemmin 9 kovakoodattua diviä index.html:ssä. Uuden vinkin voi lisätä
// Table Editorista (ohjeet-taulu, content+sort_order) ilman koodimuutosta.
async function lataaVinkit() {
  const container = document.getElementById('vinkki-lista-data');
  const { data, error } = await db.from('ohjeet').select('content').order('sort_order');
  if (error) {
    console.error('Vinkkien haku epäonnistui:', error);
    return;
  }
  container.innerHTML = '';
  (data || []).forEach(function(rivi) {
    const div = document.createElement('div');
    div.className = 'vinkki-rivi';
    div.textContent = rivi.content;
    container.appendChild(div);
  });
}

// Näyttää sw-välimuistin version (caches.keys() — ei tarvitse pitää samaa
// versionumeroa käsin synkassa kahdessa eri tiedostossa) ja kalenterisynkan
// viimeisimmän onnistuneen hakuajan (kalenteri_syotteet.last_synced_at)
async function paivitaSovellusTiedot() {
  const versioEl = document.getElementById('sovellus-versio');
  if ('caches' in window) {
    const avaimet = await caches.keys();
    const kauppalistaAvain = avaimet.find(function(k) { return k.indexOf('kauppalista-v') === 0; });
    versioEl.textContent = 'Versio: ' + (kauppalistaAvain ? kauppalistaAvain.replace('kauppalista-', '') : 'tuntematon');
  } else {
    versioEl.textContent = 'Versio: tuntematon';
  }

  const synkkaEl = document.getElementById('sovellus-synkka-tila');
  const { data, error } = await db.from('kalenteri_syotteet')
    .select('last_synced_at')
    .not('last_synced_at', 'is', null)
    .order('last_synced_at', { ascending: false })
    .limit(1);
  if (error) {
    console.error('Synkan tilan haku epäonnistui:', error);
    synkkaEl.textContent = 'Kalenterisynkan tila ei selvinnyt.';
  } else if (!data || data.length === 0) {
    synkkaEl.textContent = 'Kalenteria ei ole vielä synkattu.';
  } else {
    synkkaEl.textContent = 'Kalenteri haettu viimeksi ' + suhteellinenAika(data[0].last_synced_at) + '.';
  }
}

// "Päivitä sovellus" — PWA-jumien hätävara: tyhjentää koko sw-välimuistin ja
// poistaa service workerin rekisteröinnin, jotta uudelleenlataus asentaa
// varmasti tuoreimman version puhtaalta pöydältä
async function paivitaSovellusValimuisti() {
  if ('caches' in window) {
    const avaimet = await caches.keys();
    await Promise.all(avaimet.map(function(k) { return caches.delete(k); }));
  }
  if ('serviceWorker' in navigator) {
    const rekisterointi = await navigator.serviceWorker.getRegistration();
    if (rekisterointi) await rekisterointi.unregister();
  }
  window.location.reload();
}

// "Hae kalenteri nyt" — laukaisee /api/cron?task=caldav:n käsin, säästää
// "odotellaan cronia" -ihmettelyn koska Vercel Hobby-cron ei ole käytössä
// (ks. muistiinpanot.md "Kalenterisyötteet"-osio)
async function synkkaaKalenteriNyt() {
  const nappi = document.getElementById('sovellus-synkkaa-btn');
  nappi.disabled = true;
  const alkuperainenTeksti = nappi.textContent;
  nappi.textContent = 'Haetaan...';
  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    const vastaus = await fetch('/api/cron?task=caldav', { headers: { Authorization: 'Bearer ' + token } });
    const tulos = await vastaus.json();
    if (!vastaus.ok) {
      naytaIlmoitus('Kalenterisynkka epäonnistui: ' + (tulos.error || vastaus.status));
    } else {
      naytaIlmoitus('Kalenterisynkka käyty läpi (' + (tulos.suoraanLapi || 0) + ' uutta, ' + (tulos.odottamaan || 0) + ' odottaa hyväksyntää)');
    }
  } catch (e) {
    naytaIlmoitus('Kalenterisynkka epäonnistui: ' + e.message);
  }
  await paivitaSovellusTiedot();
  nappi.disabled = false;
  nappi.textContent = alkuperainenTeksti;
}

// "Testaa äly" — todistaa äly-putken (puhelin -> /api/aly -> Claude API ja
// takaisin) toimivaksi, sama todistusrooli kuin push-testinapilla oli push-
// infralle. EI vielä yhtään oikeaa älyominaisuutta, vain kiinteä
// testiprompti — ks. COPILOT.md "Äly-putki" -osio miten uusi ominaisuus
// rakennetaan tämän päälle.
async function testaaAly() {
  const nappi = document.getElementById('aly-testi-btn');
  const tulosEl = document.getElementById('aly-testi-tulos');
  nappi.disabled = true;
  const alkuperainenTeksti = nappi.textContent;
  nappi.textContent = 'Kysytään...';
  tulosEl.style.display = 'none';

  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    const response = await fetch('/api/aly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ prompt: 'Vastaa yhdellä lauseella suomeksi: mikä on hyvän sataman tärkein ominaisuus?' }),
    });
    const tulos = await response.json();
    tulosEl.textContent = response.ok ? tulos.text : 'Virhe: ' + (tulos.error || response.status);
  } catch (e) {
    tulosEl.textContent = 'Virhe: ' + e.message;
  }
  tulosEl.style.display = 'block';

  nappi.disabled = false;
  nappi.textContent = alkuperainenTeksti;
}

document.getElementById('asetukset-signout-btn').addEventListener('click', function() {
  db.auth.signOut();
});
document.getElementById('sovellus-paivita-btn').addEventListener('click', paivitaSovellusValimuisti);
document.getElementById('sovellus-synkkaa-btn').addEventListener('click', synkkaaKalenteriNyt);
document.getElementById('aly-testi-btn').addEventListener('click', testaaAly);

// === AUTH ===

document.getElementById('login-btn').addEventListener('click', function() {
  db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
});

document.getElementById('signout-link').addEventListener('click', function() {
  db.auth.signOut();
});

db.auth.onAuthStateChange(function(event, session) {
  currentUserId = session ? session.user.id : null;
  if (session) {
    siirryKirjautumisenJalkeen();
  } else {
    showLoginView();
  }
});

db.auth.getSession().then(function(result) {
  currentUserId = result.data.session ? result.data.session.user.id : null;
  if (result.data.session) {
    siirryKirjautumisenJalkeen();
  } else {
    showLoginView();
  }
});
