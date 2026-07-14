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
  document.getElementById('muistilaput-view').style.display = 'none';
  document.getElementById('varasto-view').style.display = 'none';
  document.getElementById('kalenteri-view').style.display = 'none';
  document.getElementById('asetukset-view').style.display = 'none';
  document.getElementById('hytti-view').style.display = 'none';
  document.getElementById('hytti-kortti-view').style.display = 'none';
}

function showLoginView() {
  piilotaKaikkiNakymat();
  document.getElementById('login-view').style.display = 'flex';
}

function showHomeView() {
  piilotaKaikkiNakymat();
  document.getElementById('home-view').style.display = 'block';
}

function showAppView() {
  piilotaKaikkiNakymat();
  document.getElementById('app-view').style.display = 'block';
}

function showLaituriView() {
  piilotaKaikkiNakymat();
  document.getElementById('laituri-view').style.display = 'block';
}

function showMuistilaputView() {
  piilotaKaikkiNakymat();
  document.getElementById('muistilaput-view').style.display = 'block';
}

function showVarastoView() {
  piilotaKaikkiNakymat();
  document.getElementById('varasto-view').style.display = 'block';
}

function showKalenteriView() {
  piilotaKaikkiNakymat();
  document.getElementById('kalenteri-view').style.display = 'block';
}

function showAsetuksetView() {
  piilotaKaikkiNakymat();
  document.getElementById('asetukset-view').style.display = 'block';
}

function showHyttiView() {
  piilotaKaikkiNakymat();
  document.getElementById('hytti-view').style.display = 'block';
}

function showHyttiKorttiView() {
  piilotaKaikkiNakymat();
  document.getElementById('hytti-kortti-view').style.display = 'block';
}

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
  if (ankkuroidutAvaimet.has(source + ':' + idStr)) {
    const { error } = await db.from('ankkurit').delete().eq('source', source).eq('source_ref', idStr).eq('user_id', currentUserId);
    if (error) console.error('Ankkuroinnin poisto epäonnistui:', error);
  } else {
    const { error } = await db.from('ankkurit').insert({ content: content, source: source, source_ref: idStr, user_id: currentUserId });
    if (error) console.error('Ankkurointi epäonnistui:', error);
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

// Lataa etusivun: navigointiruudukko, Ankkurit ja päivämäärä.
// Listat (nyk. "Muistilaput") EIVÄT enää ole suoraan etusivulla, ks. lataaMuistilaput()
async function lataaKotinakyma() {
  lataaOsiot();
  lataaAnkkurit();
  loadAnchorCandidates();
  paivitaPaivamaara();
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
    item.dataset.tuoteId = lista.id;
    alustaRaahaus(item, lista, { container: containerEl, cache: data, taulu: 'lists', jalkeenPaivitys: paivitaNakyma });
    item.addEventListener('click', function() {
      listanAvausLahde = kategoria;
      avaaLista(lista);
    });

    const teksti = document.createElement('span');
    teksti.textContent = lista.name;
    item.appendChild(teksti);

    if (lista.name !== 'Kauppalista') {
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
// (kiinteät ulkoiset menot), ei omista tehtävälistoista.
function laskeMenoja(rivit) {
  return rivit.filter(function(r) { return (!r._tyyppi || r._tyyppi === 'tapahtuma') && r.event_time; }).length;
}

// === PÄÄLLEKKÄISYYSMERKKI (2026-07-10, ks. muistiinpanot.md "Ristiriitamerkki") ===
// Kaksi kellonaikaan sidottua tapahtumaa menevät päällekkäin samana päivänä.
// Vain kalenteritapahtumat (ei ankkurit/Hytti) osallistuvat vertailuun.
function onkoAjallisestiPaallekkainen(a, b) {
  if (!a.event_time || !b.event_time) return false;
  const aLoppu = a.event_end_time || a.event_time;
  const bLoppu = b.event_end_time || b.event_time;
  return a.event_time < bLoppu && b.event_time < aLoppu;
}

// Onko annettu ISO-päivä ylipäätään "rauhoitettu päivä" (kausi + arkipäivä +
// ei loma-aikaa)? Pelkkä päivätason kelpoisuus — kellonaikaikkuna (klo 9-15)
// tarkistetaan ERIKSEEN paallekkaisyysVakavuus():ssa itse päällekkäisyyden
// ajankohdalle, ei koko päivälle. Kaikki asetuksina asetukset-taulussa
// (sql/024), ei mitään kovakoodattua.
function onkoRauhoitettuPaiva(isoPvm) {
  const osat = isoPvm.split('-').map(Number);
  const d = new Date(osat[0], osat[1] - 1, osat[2]);
  const viikonpaivat = haeAsetusTeksti('ristiriita_viikonpaivat', '1,2,3,4,5').split(',').map(Number);
  const isoViikonpaiva = d.getDay() === 0 ? 7 : d.getDay(); // 1=ma...7=su
  if (viikonpaivat.indexOf(isoViikonpaiva) === -1) return false;

  const kausiAlkaa = haeAsetusTeksti('ristiriita_kausi_alkaa', '08-01'); // MM-DD
  const kausiLoppuu = haeAsetusTeksti('ristiriita_kausi_loppuu', '05-31');
  const kkPv = isoPvm.slice(5); // "MM-DD"
  // Kausi voi kiertää vuodenvaihteen yli (esim. elokuusta toukokuuhun).
  const kausiVoimassa = kausiAlkaa <= kausiLoppuu
    ? (kkPv >= kausiAlkaa && kkPv <= kausiLoppuu)
    : (kkPv >= kausiAlkaa || kkPv <= kausiLoppuu);
  if (!kausiVoimassa) return false;

  const lomaValit = haeAsetusJSON('ristiriita_loma_valit', []);
  const lomalla = (lomaValit || []).some(function(vali) { return isoPvm >= vali.alku && isoPvm <= vali.loppu; });
  return !lomalla;
}

// Vakavuus kahden päällekkäisen tapahtuman välillä:
//  - 'aina'       saman syötteen (kalenterin) sisäinen päällekkäisyys —
//                 merkitään AINA, myös rauhoitetun ikkunan aikana (Poikkeus A)
//  - 'ei_koskaan' kaksi ERI henkilön OMAA henkilökohtaista kalenteria (esim.
//                 Katri vs. Juha) — kaksi aikuista, kaksi paikkaa on normaalia,
//                 EI automaattimerkkiä koskaan (tuleva "keskustellaan"-lippu
//                 koskee näitä, ei tätä merkkiä)
//  - 'merkitse'/'rauhoitettu' kaikki muu (jaettu perhekalenteri mukana,
//                 tai käsin lisätty ilman syötettä) — merkitään PAITSI jos
//                 PÄÄLLEKKÄISYYDEN OMA ajanjakso mahtuu kokonaan rauhoitetun
//                 päivän klo 9-15 -ikkunaan (jos päällekkäisyys ulottuu vaikka
//                 vain hetkeksi ikkunan ulkopuolelle, se silti merkitään —
//                 turvallisempi oletus kuin hiljentää osittain).
// Käsin lisätyt tapahtumat (ei syote_id, ei henkilo) osuvat oletuksena
// 'merkitse'/'rauhoitettu'-haaraan — tietoinen yksinkertaistus, ei koskaan
// 'ei_koskaan' koska emme tiedä kenen ne ovat.
function paallekkaisyysVakavuus(a, b, isoPvm) {
  if (a.syote_id && b.syote_id && a.syote_id === b.syote_id) return 'aina';
  if (a._henkilo && b._henkilo && a._henkilo !== b._henkilo) return 'ei_koskaan';
  if (!onkoRauhoitettuPaiva(isoPvm)) return 'merkitse';

  const aLoppu = a.event_end_time || a.event_time;
  const bLoppu = b.event_end_time || b.event_time;
  const paallekkaisAlku = a.event_time > b.event_time ? a.event_time : b.event_time;
  const paallekkaisLoppu = aLoppu < bLoppu ? aLoppu : bLoppu;
  const kloAlkaa = haeAsetusTeksti('ristiriita_klo_alkaa', '09:00');
  const kloLoppuu = haeAsetusTeksti('ristiriita_klo_loppuu', '15:00');
  const kokoPaallekkaisyysIkkunassa = paallekkaisAlku.slice(0, 5) >= kloAlkaa && paallekkaisLoppu.slice(0, 5) <= kloLoppuu;
  return kokoPaallekkaisyysIkkunassa ? 'rauhoitettu' : 'merkitse';
}

// Onko annetulla päivällä vähintään yksi todellinen (ei suodatettu) ristiriita?
function onkoPaivanRistiriita(rivit, isoPvm) {
  const tapahtumat = rivit.filter(function(r) { return (!r._tyyppi || r._tyyppi === 'tapahtuma') && r.event_time; });
  for (let i = 0; i < tapahtumat.length; i++) {
    for (let j = i + 1; j < tapahtumat.length; j++) {
      if (!onkoAjallisestiPaallekkainen(tapahtumat[i], tapahtumat[j])) continue;
      const vakavuus = paallekkaisyysVakavuus(tapahtumat[i], tapahtumat[j], isoPvm);
      if (vakavuus === 'aina' || vakavuus === 'merkitse') return true;
    }
  }
  return false;
}

// Luo yhtenäisen päivätason merkkipillerin (ks. muistiinpanot.md "Kalenterin
// merkkikieli") — savy on 'kuorma' | 'ristiriita' | 'keskustellaan'.
function luoPaivaMerkki(savy, teksti, title) {
  const merkki = document.createElement('span');
  merkki.className = 'paiva-merkki paiva-merkki--' + savy;
  merkki.textContent = teksti;
  if (title) merkki.title = title;
  return merkki;
}

// Piirtää päiväotsikon tekstin ja lisää perään ristiriita- (jos on) ja
// kuorma- (jos raja täyttyy) -merkit tässä järjestyksessä, koska
// päällekkäisyys on kiireellisempi huomata.
function paivitaPaivanOtsikko(otsikkoEl, teksti, rivit, isoPvm, kuormaraja) {
  otsikkoEl.textContent = teksti;
  if (onkoPaivanRistiriita(rivit, isoPvm)) {
    otsikkoEl.appendChild(luoPaivaMerkki('ristiriita', 'päällekkäin', 'Kaksi tapahtumaa menee päällekkäin tänä päivänä'));
  }
  const maara = laskeMenoja(rivit);
  if (maara >= kuormaraja) {
    otsikkoEl.appendChild(luoPaivaMerkki('kuorma', maara + ' menoa', maara + ' kellonaikamenoa tänä päivänä'));
  }
}

function paivamaaraISO(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
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
      if (error) console.error('Hytti-tehtävän merkintä epäonnistui:', error);
      lataaKalenteri();
    });
    li.appendChild(checkNappi);

    const teksti = document.createElement('span');
    teksti.textContent = rivi.title;
    li.appendChild(teksti);

    const ankkurointiNappi = document.createElement('button');
    ankkurointiNappi.textContent = '⚓';
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
      if (error) console.error('Ankkurin merkintä epäonnistui:', error);
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
    irrotaNappi.textContent = '⚓';
    irrotaNappi.className = 'anchor-btn active';
    irrotaNappi.addEventListener('click', async function() {
      await vaihdaAnkkurointiYleinen(rivi._source, rivi._sourceRef, rivi.title, function() {});
      lataaKalenteri();
    });
    li.appendChild(irrotaNappi);
    return li;
  }

  const aika = document.createElement('span');
  aika.className = 'kalenteri-aika';
  aika.textContent = rivi.event_time ? rivi.event_time.slice(0, 5) : '';
  li.appendChild(aika);

  if (rivi._vari) {
    const vari = document.createElement('span');
    vari.className = 'kalenteri-vari';
    vari.style.backgroundColor = rivi._vari;
    li.appendChild(vari);
  }

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

  const ankkurointiNappi = document.createElement('button');
  ankkurointiNappi.textContent = '⚓';
  ankkurointiNappi.className = 'anchor-btn' + (ankkuroidutAvaimet.has('kalenteri:' + rivi.id) ? ' active' : '');
  ankkurointiNappi.addEventListener('click', async function() {
    await vaihdaAnkkurointiYleinen('kalenteri', rivi.id, rivi.title, function() {});
    lataaKalenteri();
  });
  li.appendChild(ankkurointiNappi);

  li.appendChild(luoMuistutusNappi('kalenteri', rivi.id, rivi.title, rivi.event_date, rivi.event_time, lataaKalenteri));

  // Synkatulla rivillä (ical_uid asetettu) EI näytetä poistonappia lainkaan:
  // "yksi totuus, kaksi ikkunaa" -periaatteen mukaan poisto kuuluu tehdä
  // iPhonen Kalenterissa, ja peilisääntö (siivoaPoistetut, api/caldav-sync.js)
  // poistaa rivin täältä automaattisesti seuraavassa synkassa. Ilman tätä
  // rajausta poistonappi näytti poistavan tapahtuman "kokonaan", vaikka se
  // vain katosi Satamasta hetkeksi ja synkka olisi tuonut sen takaisin.
  if (!rivi.ical_uid) {
    const poistoNappi = document.createElement('button');
    poistoNappi.textContent = '×';
    poistoNappi.className = 'delete-btn';
    poistoNappi.addEventListener('click', async function() {
      const vahvistus = await naytaVahvistus('Poistetaanko ' + rivi.title + '?', null, 'Poista');
      if (!vahvistus) return;
      const { error } = await db.from('kalenteri_tapahtumat').delete().eq('id', rivi.id);
      if (error) {
        console.error('Tapahtuman poisto epäonnistui:', error);
      }
      await db.from('muistutukset').delete().eq('source', 'kalenteri').eq('source_ref', String(rivi.id));
      lataaKalenteri();
    });
    li.appendChild(poistoNappi);
  }

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
  // scope='hytti' (Hytti v1 + opiskelulaajennus, 2026-07-11) SUODATETAAN POIS
  // perheen agendasta KOKONAAN heti tässä — hytti-scopen tapahtumat kuuluvat
  // VAIN omistajansa Hytin tänään-kaistalle/korttien kalenteriin, eivät
  // koskaan perheen agendaan/kuittausjonoon/Kuormavahtiin edes omistajalleen
  // itselleen. RLS (sql/027) estää TOISEN käyttäjän pääsyn tietokantatasolla,
  // tämä suodatus on lisäksi UX-siisteyttä omistajan omalle perhenäkymälle.
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
    .filter(function(t) { return !t.kalenteri_syotteet || t.kalenteri_syotteet.scope !== 'hytti'; })
    .map(function(t) {
      return Object.assign({}, t, {
        _vari: t.kalenteri_syotteet ? t.kalenteri_syotteet.vari : null,
        _henkilo: t.kalenteri_syotteet ? t.kalenteri_syotteet.henkilo : null,
      });
    });

  await paivitaAnkkuroidutAvaimet();
  await paivitaAsetukset();
  await paivitaMuistutuksetKartta();

  const sisalto = document.getElementById('kalenteri-sisalto');
  sisalto.innerHTML = '';

  if (kalenteriTila === 'paiva') {
    const tanaanIso = paivamaaraISO(kalenteriPvm);
    let rivit = data.filter(function(t) { return tapahtumaKattaaPaivan(t, tanaanIso); }).map(function(t) {
      return {
        _tyyppi: 'tapahtuma', id: t.id, title: t.title, event_date: t.event_date, event_time: t.event_time,
        event_end_time: t.event_end_time, syote_id: t.syote_id, _henkilo: t._henkilo,
        _vari: t._vari, ical_uid: t.ical_uid, user_id: t.user_id,
      };
    });

    // Kuormavahti + ristiriitamerkki: lasketaan ENNEN ankkurit/Hytti-rivien
    // lisäystä, koska ne eivät kuulu kalenterin kuormaan/ristiriitoihin
    // (molemmat suodattavat ne pois joka tapauksessa, mutta selkeämpi laskea
    // juuri tässä kohdassa).
    paivitaPaivanOtsikko(
      document.getElementById('kalenteri-otsikko'),
      otsikko,
      rivit,
      tanaanIso,
      haeAsetusNumero('paivan_menoraja', 5)
    );

    if (tanaanIso === paivamaaraISO(new Date())) {
      const { data: ankkuridata, error: ankkuriError } = await db.from('ankkurit').select().eq('done', false).eq('user_id', currentUserId);
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

    piirraKalenteriPaivaRyhma(sisalto, jarjestaAjanMukaan(rivit), null);
    return;
  }

  if (kalenteriTila === 'viikko') {
    for (let i = 0; i < 7; i++) {
      const pvm = new Date(alku);
      pvm.setDate(pvm.getDate() + i);
      const iso = paivamaaraISO(pvm);
      const otsikkoTeksti = KALENTERI_PAIVAT[pvm.getDay()] + ' ' + pvm.getDate() + '.' + (pvm.getMonth() + 1) + '.';
      const paivanTapahtumat = data.filter(function(t) { return tapahtumaKattaaPaivan(t, iso); });
      piirraKalenteriPaivaRyhma(sisalto, paivanTapahtumat, otsikkoTeksti, haeAsetusNumero('paivan_menoraja', 5), iso);
    }
    return;
  }

  piirraKuukausiRuudukko(sisalto, data, kalenteriPvm.getMonth());
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

// Piirtää yhden päiväruudun sisällön: päivänumero, monipäiväisten
// tapahtumien palkkirivit (linjan mukaisessa järjestyksessä) ja sen jälkeen
// yksipäiväiset tapahtumat pienenä tekstinä.
function piirraKuukausiPaiva(pvm, kaikkiTapahtumat, linjat, linjojaViikolla, kuluvaKuukausi, kuormaraja) {
  const iso = paivamaaraISO(pvm);
  const solu = document.createElement('div');
  solu.className = 'kalenteri-kuukausi-paiva';
  if (pvm.getMonth() !== kuluvaKuukausi) solu.classList.add('ulkopuolinen');
  if (iso === paivamaaraISO(new Date())) solu.classList.add('tanaan');

  const paivanKaikki = kaikkiTapahtumat.filter(function(t) { return tapahtumaKattaaPaivan(t, iso); });

  const pvmRivi = document.createElement('div');
  pvmRivi.className = 'kalenteri-kuukausi-pvm-rivi';

  const pvmEl = document.createElement('span');
  pvmEl.className = 'kalenteri-kuukausi-pvm';
  pvmEl.textContent = pvm.getDate();
  pvmRivi.appendChild(pvmEl);

  // Kuukausiruutu on liian pieni täydelle merkkipillerille (ks. Kuormavahti/
  // ristiriitamerkki agenda- ja viikkonäkymässä) — sama kolmiportainen
  // väriohjaus tiivistettynä pieneksi pisteeksi päivänumeron viereen.
  if (onkoPaivanRistiriita(paivanKaikki, iso)) {
    const piste = document.createElement('span');
    piste.className = 'kalenteri-kuukausi-piste kalenteri-kuukausi-piste--ristiriita';
    piste.title = 'Päällekkäin';
    pvmRivi.appendChild(piste);
  } else if (laskeMenoja(paivanKaikki) >= kuormaraja) {
    const piste = document.createElement('span');
    piste.className = 'kalenteri-kuukausi-piste kalenteri-kuukausi-piste--kuorma';
    piste.textContent = String(laskeMenoja(paivanKaikki));
    piste.title = laskeMenoja(paivanKaikki) + ' menoa';
    pvmRivi.appendChild(piste);
  }

  solu.appendChild(pvmRivi);

  const paivanMonipaivaiset = kaikkiTapahtumat.filter(function(t) { return onkoMonipaivainen(t) && tapahtumaKattaaPaivan(t, iso); });

  if (linjojaViikolla > 0) {
    const palkitEl = document.createElement('div');
    palkitEl.className = 'kalenteri-kuukausi-palkit';
    for (let linja = 0; linja < linjojaViikolla; linja++) {
      const tapahtuma = paivanMonipaivaiset.find(function(t) { return linjat.get(t.id) === linja; });
      const palkki = document.createElement('div');
      if (tapahtuma) {
        palkki.className = 'kalenteri-kuukausi-palkki';
        palkki.style.backgroundColor = tapahtuma._vari || 'var(--accent)';
        // Teksti näkyy vain palkin ensimmäisessä näkyvässä ruudussa —
        // joko tapahtuman todellisena alkupäivänä tai viikon ensimmäisenä
        // päivänä jos tapahtuma alkoi jo edellisellä viikolla.
        if (iso === tapahtuma.event_date || pvm.getDay() === 1) {
          palkki.textContent = tapahtuma.title;
        }
      } else {
        palkki.className = 'kalenteri-kuukausi-palkki-tyhja';
      }
      palkitEl.appendChild(palkki);
    }
    solu.appendChild(palkitEl);
  }

  const yksipaivaiset = kaikkiTapahtumat.filter(function(t) { return !onkoMonipaivainen(t) && tapahtumaKattaaPaivan(t, iso); });
  if (yksipaivaiset.length > 0) {
    const listaEl = document.createElement('div');
    listaEl.className = 'kalenteri-kuukausi-tapahtumat';
    yksipaivaiset.forEach(function(t) {
      const rivi = document.createElement('div');
      rivi.className = 'kalenteri-kuukausi-tapahtuma';
      if (t._vari) rivi.style.color = t._vari;
      rivi.textContent = (t.event_time ? t.event_time.slice(0, 5) + ' ' : '') + t.title;
      listaEl.appendChild(rivi);
    });
    solu.appendChild(listaEl);
  }

  solu.addEventListener('click', function() {
    kalenteriPvm = new Date(pvm);
    kalenteriTila = 'paiva';
    document.querySelectorAll('.kalenteri-tila-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.tila === 'paiva'); });
    lataaKalenteri();
  });

  return solu;
}

function piirraKuukausiRuudukko(sisalto, kaikkiTapahtumat, kuluvaKuukausi) {
  const kuormaraja = haeAsetusNumero('paivan_menoraja', 5);
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

  const kuunEnsimmainen = new Date(kalenteriPvm.getFullYear(), kuluvaKuukausi, 1);
  const kuunViimeinen = new Date(kalenteriPvm.getFullYear(), kuluvaKuukausi + 1, 0);
  const ruudukonAlku = viikonAlku(kuunEnsimmainen);
  const ruudukonLoppu = viikonAlku(kuunViimeinen);
  ruudukonLoppu.setDate(ruudukonLoppu.getDate() + 6);

  let viikonPvm = new Date(ruudukonAlku);
  while (viikonPvm <= ruudukonLoppu) {
    const viikonPaivat = [];
    for (let i = 0; i < 7; i++) {
      viikonPaivat.push(new Date(viikonPvm));
      viikonPvm.setDate(viikonPvm.getDate() + 1);
    }

    const viikonAlkuIso = paivamaaraISO(viikonPaivat[0]);
    const viikonLoppuIso = paivamaaraISO(viikonPaivat[6]);
    const viikonMonipaivaiset = kaikkiTapahtumat.filter(function(t) {
      return onkoMonipaivainen(t) && t.event_date <= viikonLoppuIso && (t.event_end_date || t.event_date) >= viikonAlkuIso;
    });
    const linjat = laskeViikonLinjat(viikonMonipaivaiset);
    const linjojaViikolla = new Set(linjat.values()).size;

    const viikkorivi = document.createElement('div');
    viikkorivi.className = 'kalenteri-kuukausi-viikko';
    viikonPaivat.forEach(function(pvm) {
      viikkorivi.appendChild(piirraKuukausiPaiva(pvm, kaikkiTapahtumat, linjat, linjojaViikolla, kuluvaKuukausi, kuormaraja));
    });
    ruudukko.appendChild(viikkorivi);
  }

  sisalto.appendChild(ruudukko);
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
function synkkaaICloud() {
  fetch('/api/caldav-sync').then(function() {
    paivitaKuittausTila();
  }).catch(function() {});
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
function onkoUusiMinulle(rivi) {
  if (!rivi.ical_uid) return false;
  if (rivi.user_id === currentUserId) return false;
  return !kuitatutUidt.has(rivi.ical_uid);
}

async function kuittaa(icalUid) {
  const { error } = await db.from('kalenteri_kuittaukset').upsert(
    { ical_uid: icalUid, user_id: currentUserId },
    { onConflict: 'ical_uid,user_id' }
  );
  if (error) console.error('Kuittaus epäonnistui:', error);
  kuitatutUidt.add(icalUid);
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

  // Huomiopallura (2026-07-13, ks. "HUOMIOPALLURAT"-osio): sama luku jota
  // "🆕 N uutta" -linkki jo näyttää, ei duplikoitua laskentaa.
  huomioPallurat.kalenteri = kuittausjonoUudet.length;

  const badge = document.querySelector('.tile-badge[data-osio-key="kalenteri"]');
  if (badge) {
    if (kuittausjonoUudet.length) {
      badge.textContent = kuittausjonoUudet.length;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  paivitaSovelluskuvakeBadge();
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
  if (error) {
    console.error('Kuittaa kaikki epäonnistui:', error);
    return;
  }
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
    if (error) console.error('Hytti-tehtävän merkintä epäonnistui:', error);
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
  ankkurointiNappi.textContent = '⚓';
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
  alustaRaahaus(li, kortti, { container: document.getElementById('hytti-kortit-list'), cache: cachedHyttiKortit, taulu: 'hytti_kortit', jalkeenPaivitys: lataaHyttiPaanakyma });
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

// Lataa Hytin päänäkymän: Tehtävät-kooste + Kortit-listaus. Jos aktiivisia
// kortteja ei ole ollenkaan, näytetään tyhjätila-ohje kummankin osion sijaan.
async function lataaHyttiPaanakyma() {
  if (raahattavaRivi) return;
  paivitaHyttiTyoVapaaLabel();
  lataaHyttiTanaanKaista();

  const { data: kortit, error: korttiError } = await db.from('hytti_kortit').select().eq('status', 'aktiivinen').order('sort_order');
  if (korttiError) {
    console.error('Hytin korttien haku epäonnistui:', korttiError);
    return;
  }
  cachedHyttiKortit = kortit || [];

  const tehtavatOsio = document.getElementById('hytti-tehtavat-osio');
  const kortitOsio = document.getElementById('hytti-kortit-osio');
  const tyhja = document.getElementById('hytti-tyhja');

  if (cachedHyttiKortit.length === 0) {
    tehtavatOsio.style.display = 'none';
    kortitOsio.style.display = 'none';
    tyhja.style.display = 'block';
    paivitaHyttiArkistoLinkki();
    return;
  }

  tehtavatOsio.style.display = 'block';
  kortitOsio.style.display = 'block';
  tyhja.style.display = 'none';

  const kortitListEl = document.getElementById('hytti-kortit-list');
  kortitListEl.innerHTML = '';
  cachedHyttiKortit.forEach(function(kortti) { kortitListEl.appendChild(piirraHyttiKorttiRivi(kortti)); });

  await paivitaAnkkuroidutAvaimet();
  await paivitaMuistutuksetKartta();

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
  document.getElementById('hytti-tehtavat-tyhja').style.display = (tehtavat || []).length === 0 ? 'block' : 'none';

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
  if (error) console.error('Hytti-rivin poisto epäonnistui:', error);
  await db.from('muistutukset').delete().eq('source', 'hytti_rivi').eq('source_ref', String(rivi.id));
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
        if (error) console.error('Hytti-rivin merkintä epäonnistui:', error);
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
      inputti.select();

      async function tallenna() {
        const uusi = inputti.value.trim();
        if (uusi && uusi !== rivi.content) {
          const { error } = await db.from('hytti_rivit').update({ content: uusi }).eq('id', rivi.id);
          if (error) console.error('Hytti-rivin muokkaus epäonnistui:', error);
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
        if (error) console.error('Eräpäivän tallennus epäonnistui:', error);
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
      if (error) console.error('Tehtävätilan vaihto epäonnistui:', error);
      lataaHyttiKortti();
    });
    li.appendChild(tehtavaNappi);

    if (rivi.is_task) {
      li.appendChild(luoMuistutusNappi('hytti_rivi', rivi.id, rivi.content, null, null, lataaHyttiKortti));
    }

    const poistoNappi = document.createElement('button');
    poistoNappi.textContent = '×';
    poistoNappi.className = 'delete-btn';
    poistoNappi.addEventListener('click', function() { poistaHyttiRivi(rivi); });
    li.appendChild(poistoNappi);
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

  const arkistoiNappi = document.getElementById('hytti-kortti-arkistoi-btn');
  if (lukutila) {
    arkistoiNappi.style.display = 'flex';
    arkistoiNappi.textContent = '↩';
    arkistoiNappi.title = 'Palauta aktiiviseksi';
    arkistoiNappi.onclick = function() { palautaHyttiKortti(); };
  } else if (currentHyttiKortti.card_type === 'paattyva') {
    arkistoiNappi.style.display = 'flex';
    arkistoiNappi.textContent = '📦';
    arkistoiNappi.title = 'Arkistoi';
    arkistoiNappi.onclick = function() { arkistoiHyttiKortti(); };
  } else {
    arkistoiNappi.style.display = 'none';
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
  inputti.select();

  async function tallenna() {
    const uusi = inputti.value.trim();
    if (uusi !== (currentHyttiKortti.seuraava_askel || '')) {
      const { error } = await db.from('hytti_kortit').update({ seuraava_askel: uusi || null }).eq('id', currentHyttiKortti.id);
      if (error) console.error('Seuraavan askeleen tallennus epäonnistui:', error);
      currentHyttiKortti.seuraava_askel = uusi || null;
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
  if (error) {
    console.error('Kalenterisuodattimen tallennus epäonnistui:', error);
    return;
  }
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
  if (error) {
    console.error('Kortin arkistointi epäonnistui:', error);
    return;
  }
  logEvent('archived', 'hytti_kortti', currentHyttiKortti.id, currentHyttiKortti.name, null);
  showHyttiView();
  lataaHyttiPaanakyma();
}

async function palautaHyttiKortti() {
  const { error } = await db.from('hytti_kortit').update({ status: 'aktiivinen' }).eq('id', currentHyttiKortti.id);
  if (error) {
    console.error('Kortin palautus epäonnistui:', error);
    return;
  }
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
  showHyttiView();
  lataaHyttiPaanakyma();
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
  if (error) {
    console.error('Kortin luonti epäonnistui:', error);
  } else {
    logEvent('created', 'hytti_kortti', data.id, nimi, null);
  }
  uusiInput.value = '';
  lataaHyttiPaanakyma();
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
  if (error) {
    console.error('Hytti-rivin lisäys epäonnistui:', error);
  } else {
    logEvent(onOtsikko ? 'created' : 'added', onOtsikko ? 'header' : 'hytti_rivi', data.id, teksti, null);
  }
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

// Näyttää tämänpäiväisen päivämäärän suomeksi etusivun yläosassa
function paivitaPaivamaara() {
  const paivat = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];
  const kuukaudet = ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta', 'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta'];
  const nyt = new Date();
  document.getElementById('home-date').textContent = paivat[nyt.getDay()] + ' ' + nyt.getDate() + '. ' + kuukaudet[nyt.getMonth()];
}

let cachedAnkkurit = [];
let ankkuritKaikkiNakyvissa = false;

// Hakee päivän tärkeimmät tekemättömät ankkurit järjestyksessä — VAIN
// kirjautuneen OMAT (ankkurit henkilökohtaisiksi 2026-07-11, ks.
// sql/029_ankkurit_henkilokohtaiset.sql). Oletuksena vain 3 näkyy (loput
// piilossa "+ N muuta" -linkin takana), mutta käyttäjä voi laajentaa
// näkymän nähdäkseen ja priorisoidakseen kaikki raahaamalla. Kun yksi
// merkitään tehdyksi, seuraava nousee automaattisesti näkyviin koska
// kysely suodattaa done=false — ei tarvita erillistä "ylennyslogiikkaa".
async function lataaAnkkurit() {
  if (raahattavaRivi) return;
  // is_candidate-rivit (E3-keskiportaan AI-ehdotukset, ks. loadAnchorCandidates())
  // EIVÄT kuulu tähän listaan eivätkä "3 tärkeintä" -rajaan — ne näytetään
  // erikseen omana ryhmänään ehdotusten hyväksymistä varten.
  const { data, error } = await db.from('ankkurit').select().eq('done', false).eq('is_candidate', false).eq('user_id', currentUserId).order('sort_order');
  if (error) {
    console.error('Ankkureiden haku epäonnistui:', error);
    return;
  }

  cachedAnkkurit = data || [];
  await paivitaMuistutuksetKartta();
  const nayta = ankkuritKaikkiNakyvissa ? cachedAnkkurit : cachedAnkkurit.slice(0, 3);
  const piilossa = cachedAnkkurit.length - nayta.length;

  const listEl = document.getElementById('ankkurit-list');
  listEl.innerHTML = '';

  nayta.forEach(function(ankkuri) {
    const li = document.createElement('li');
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
      if (error) {
        console.error('Ankkurin merkintä epäonnistui:', error);
      }
      lataaAnkkurit();
    });
    li.appendChild(checkNappi);

    const teksti = document.createElement('span');
    teksti.textContent = ankkuri.content;
    li.appendChild(teksti);

    const irrotaNappi = document.createElement('button');
    irrotaNappi.textContent = '⚓';
    irrotaNappi.className = 'anchor-btn active';
    irrotaNappi.addEventListener('click', function() {
      irrotaNappi.classList.add('leaving');
      li.style.opacity = '0.3';
      setTimeout(async function() {
        const { error } = await db.from('ankkurit').delete().eq('id', ankkuri.id);
        if (error) {
          console.error('Ankkurin irrotus epäonnistui:', error);
        }
        await db.from('muistutukset').delete().eq('source', 'ankkuri').eq('source_ref', String(ankkuri.id));
        lataaAnkkurit();
      }, 250);
    });
    li.appendChild(irrotaNappi);

    li.appendChild(luoMuistutusNappi('ankkuri', ankkuri.id, ankkuri.content, null, ankkuri.event_time, lataaAnkkurit));

    listEl.appendChild(li);
  });

  const laajennusLinkki = document.getElementById('ankkurit-laajenna');
  if (ankkuritKaikkiNakyvissa) {
    laajennusLinkki.style.display = cachedAnkkurit.length > 3 ? 'block' : 'none';
    laajennusLinkki.textContent = 'näytä vain 3 tärkeintä';
  } else if (piilossa > 0) {
    laajennusLinkki.style.display = 'block';
    laajennusLinkki.textContent = '+ ' + piilossa + ' muuta odottaa — näytä kaikki';
  } else {
    laajennusLinkki.style.display = 'none';
  }
}

// E3 mid-tier V1 ("äly toimii, ihminen valvoo", ks. muistiinpanot.md) — AI-
// suggested anchor candidates, shown BELOW the real anchors, never inside
// the "3 most important" limit. New code, English names (house rule, ks.
// COPILOT.md "Koodikieli"). Three reactions: tick done (reuses the anchor
// row's own semantics), take as mine (promotes it to a real anchor,
// is_candidate -> false), or dismiss (deletes it — the underlying Laituri
// note is NEVER touched, ks. safety invariant in api/aly-nightly.js).
async function loadAnchorCandidates() {
  if (raahattavaRivi) return;
  const { data, error } = await db.from('ankkurit').select()
    .eq('user_id', currentUserId).eq('source', 'aly').eq('is_candidate', true).eq('done', false)
    .order('created_at');
  if (error) {
    console.error('Ankkuriehdokkaiden haku epäonnistui:', error);
    return;
  }

  const listEl = document.getElementById('anchor-candidates-list');
  listEl.innerHTML = '';

  huomioPallurat.ankkurit = (data || []).length;
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

  (data || []).forEach(function(candidate) {
    const li = document.createElement('li');

    const checkButton = document.createElement('button');
    checkButton.textContent = '○';
    checkButton.className = 'check-btn';
    checkButton.addEventListener('click', async function() {
      tuntopalauteValmis();
      const { error } = await db.from('ankkurit').update({ done: true, done_at: new Date().toISOString() }).eq('id', candidate.id);
      if (error) console.error('Ankkuriehdokkaan merkintä epäonnistui:', error);
      loadAnchorCandidates();
    });
    li.appendChild(checkButton);

    const text = document.createElement('span');
    text.textContent = '✨ ' + candidate.content;
    li.appendChild(text);

    const acceptButton = document.createElement('button');
    acceptButton.textContent = '⚓';
    acceptButton.className = 'anchor-btn';
    acceptButton.title = 'Ota omaksi ankkuriksi';
    acceptButton.addEventListener('click', async function() {
      const { error } = await db.from('ankkurit').update({ is_candidate: false }).eq('id', candidate.id);
      if (error) console.error('Ankkuriehdokkaan hyväksyntä epäonnistui:', error);
      loadAnchorCandidates();
      lataaAnkkurit();
    });
    li.appendChild(acceptButton);

    const dismissButton = document.createElement('button');
    dismissButton.textContent = '×';
    dismissButton.className = 'delete-btn';
    dismissButton.title = 'Poista ehdotus';
    dismissButton.addEventListener('click', async function() {
      const { error } = await db.from('ankkurit').delete().eq('id', candidate.id);
      if (error) console.error('Ankkuriehdokkaan poisto epäonnistui:', error);
      await db.from('aly_log').update({ undone_at: new Date().toISOString() }).eq('anchor_id', candidate.id).is('undone_at', null);
      loadAnchorCandidates();
    });
    li.appendChild(dismissButton);

    listEl.appendChild(li);
  });
}

// Hakee etusivun osiot (Laituri, Ankkurit, ym.) ja piirtää ne geneerisesti —
// osiot tulevat tietokannasta (nimi, ikoni, reitti, järjestys), ei kovakoodattuina
async function lataaOsiot() {
  if (raahattavaRivi) return;
  const { data, error } = await db.from('home_sections').select().eq('enabled', true).order('sort_order');
  if (error) {
    console.error('Osioiden haku epäonnistui:', error);
    return;
  }

  const sectionsGrid = document.getElementById('sections-list');
  sectionsGrid.innerHTML = '';

  (data || []).forEach(function(osio) {
    const tile = document.createElement('div');
    tile.className = 'section-tile';
    tile.dataset.tuoteId = osio.id;
    alustaRaahaus(tile, osio, { container: sectionsGrid, cache: data, taulu: 'home_sections', jalkeenPaivitys: lataaOsiot });
    tile.addEventListener('click', function() { avaaOsio(osio); });

    const ikoni = document.createElement('span');
    ikoni.className = 'tile-icon';
    if (osio.key === 'kalenteri') {
      ikoni.classList.add('tile-icon-kalenteri');
      const tanaan = new Date();
      const kk = KALENTERI_KUUKAUDET[tanaan.getMonth()].slice(0, 3).toUpperCase();
      ikoni.innerHTML = '<span class="kal-kk">' + kk + '</span><span class="kal-pv">' + tanaan.getDate() + '</span>';
    } else {
      ikoni.textContent = osio.icon;
    }
    tile.appendChild(ikoni);

    const nimi = document.createElement('span');
    nimi.className = 'tile-label';
    nimi.textContent = osio.name;
    tile.appendChild(nimi);

    const badge = document.createElement('span');
    badge.className = 'tile-badge';
    badge.dataset.osioKey = osio.key;
    tile.appendChild(badge);

    sectionsGrid.appendChild(tile);
  });

  paivitaLaituriBadge();
  paivitaKuittausTila();
  updateSettingsBadge();
}

// Avaa osion sen route-kentän mukaan. Vain 'laituri' on toistaiseksi toiminnallinen.
function avaaOsio(osio) {
  if (osio.route === 'laituri') {
    showLaituriView();
    lataaLaituri();
    palautaLaituriLuonnos();
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
    paivitaTiliTiedot();
    paivitaPushTila();
    paivitaSovellusTiedot();
    lataaVinkit();
    loadAiLog();
    markAiLogSeen();
    paivitaAsetukset().then(function() {
      document.getElementById('kuormaraja-input').value = haeAsetusNumero('paivan_menoraja', 5);
    });
  } else if (osio.route === 'hytti') {
    showHyttiView();
    lataaHyttiPaanakyma();
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
async function loadAiLog() {
  const { data, error } = await db.from('aly_log').select().eq('user_id', currentUserId).order('created_at', { ascending: false });
  if (error) {
    console.error('Äly-lokin haku epäonnistui:', error);
    return;
  }

  const listEl = document.getElementById('aly-log-list');
  const emptyEl = document.getElementById('aly-log-tyhja');
  listEl.innerHTML = '';

  if (!data || data.length === 0) {
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  data.forEach(function(entry) {
    const row = document.createElement('div');
    row.className = 'aly-log-rivi' + (entry.undone_at ? ' aly-log-kumottu' : '');

    const text = document.createElement('span');
    text.className = 'aly-log-teksti';
    text.textContent = entry.description;
    row.appendChild(text);

    const time = document.createElement('span');
    time.className = 'aly-log-aika';
    time.textContent = suhteellinenAika(entry.created_at);
    row.appendChild(time);

    if (!entry.undone_at) {
      const undoButton = document.createElement('button');
      undoButton.textContent = 'Kumoa';
      undoButton.className = 'aly-log-kumoa-btn';
      undoButton.addEventListener('click', async function() {
        if (entry.anchor_id) {
          await db.from('ankkurit').delete().eq('id', entry.anchor_id);
        }
        const { error } = await db.from('aly_log').update({ undone_at: new Date().toISOString() }).eq('id', entry.id);
        if (error) console.error('Äly-lokin kumoaminen epäonnistui:', error);
        loadAiLog();
        loadAnchorCandidates();
        lataaAnkkurit();
      });
      row.appendChild(undoButton);
    }

    listEl.appendChild(row);
  });
}

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

// Hakee ja piirtää Laiturin rivit, valinnaisesti hakusanalla suodatettuna
async function lataaLaituri(hakusana) {
  paivitaLaituriSijoittamattaTeksti();
  let kysely = db.from('laituri').select().order('created_at', { ascending: false });
  if (hakusana) {
    kysely = kysely.ilike('content', '%' + hakusana + '%');
  }
  const { data, error } = await kysely;
  if (error) {
    console.error('Laiturin haku epäonnistui:', error);
  }

  const listEl = document.getElementById('laituri-list');
  listEl.innerHTML = '';

  (data || []).forEach(function(rivi) {
    const li = document.createElement('li');
    li.className = 'laituri-row' + (rivi.status === 'sijoitettu' ? ' sijoitettu' : '');

    const sisalto = document.createElement('div');
    sisalto.className = 'laituri-content';

    const teksti = document.createElement('span');
    teksti.className = 'laituri-text';
    teksti.textContent = rivi.content;
    sisalto.appendChild(teksti);

    const meta = document.createElement('span');
    meta.className = 'laituri-meta';
    const kuka = rivi.user_id === currentUserId ? 'sinä' : 'kumppani';
    const d = new Date(rivi.created_at);
    const aika = d.getDate().toString().padStart(2, '0') + '.' + (d.getMonth() + 1).toString().padStart(2, '0') + '. ' +
                 d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    meta.textContent = kuka + ' · ' + aika + (rivi.status === 'sijoitettu' ? ' · → ' + rivi.placed_where : '');
    sisalto.appendChild(meta);

    li.appendChild(sisalto);

    if (rivi.status !== 'sijoitettu') {
      const alyNappi = document.createElement('button');
      alyNappi.className = 'aly-ehdotus-btn';
      alyNappi.textContent = '✨';
      alyNappi.title = 'Kysy älyltä ehdotus mihin tämä kuuluisi';
      alyNappi.addEventListener('click', function() {
        pyydaLaituriEhdotus(rivi, alyNappi, li);
      });
      li.appendChild(alyNappi);

      const sijoitaNappi = document.createElement('button');
      sijoitaNappi.className = 'place-btn';
      sijoitaNappi.textContent = '→';
      sijoitaNappi.addEventListener('click', function() {
        sijoitaLaituriRivi(rivi);
      });
      li.appendChild(sijoitaNappi);
    }

    const poistoNappi = document.createElement('button');
    poistoNappi.className = 'delete-btn';
    poistoNappi.textContent = '×';
    poistoNappi.addEventListener('click', async function() {
      const vahvistus = await naytaVahvistus('Poistetaanko tämä ajatus?', null, 'Poista');
      if (!vahvistus) return;
      const { error } = await db.from('laituri').delete().eq('id', rivi.id);
      if (error) {
        console.error('Laiturin rivin poisto epäonnistui:', error);
      }
      lataaLaituri(document.getElementById('laituri-search').value.trim());
      paivitaLaituriBadge();
    });
    li.appendChild(poistoNappi);

    listEl.appendChild(li);
  });
}

// Sijoittaa Laiturin rivin ("minne sijoitit tämän?") — sama toiminto käytössä
// sekä →-napista (tyhjä oletusarvo) että äly-ehdotuksen "Sopii"-napista
// (esitäytetty ehdotettu kohde, jonka käyttäjä voi vielä muokata tai
// hyväksyä sellaisenaan). Ei koskaan siirrä mitään automaattisesti.
async function sijoitaLaituriRivi(rivi, oletusTeksti) {
  const minne = prompt('Minne sijoitit tämän?', oletusTeksti || '');
  if (!minne || !minne.trim()) return;
  const { error } = await db.from('laituri').update({ status: 'sijoitettu', placed_where: minne.trim() }).eq('id', rivi.id);
  if (error) {
    console.error('Sijoitus epäonnistui:', error);
  }
  lataaLaituri(document.getElementById('laituri-search').value.trim());
  paivitaLaituriBadge();
}

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

// Piirtää äly-ehdotuksen kuittikorttina rivin alle: "→ <ehdotus> · <perustelu>"
// + Sopii/Ei-napit. EI KOSKAAN kirjoita tietokantaan mitään itse — "Sopii"
// avaa saman sijoitusdialogin jota →-nappikin käyttää, vain esitäytettynä.
function piirraLaituriEhdotusKortti(rivi, li, ehdotus) {
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
    sijoitaLaituriRivi(rivi, ehdotus.ehdotus);
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

  // Käyttäjän näkyvissä olevien listojen (Muistilaput + Varasto, sama
  // `lists`-taulu) nimet DYNAAMISESTI joka kutsulla — EI kovakoodattua
  // listaa, jottei tarvitse muistaa päivittää tätä kun listoja lisätään/
  // poistetaan/nimetään uudelleen. RLS rajaa tuloksen jo automaattisesti
  // kirjautuneen näkyviin listoihin (omat + jaetut).
  const { data: listat, error: listatError } = await db.from('lists').select('name');
  if (listatError) {
    console.error('Listojen haku ehdotusta varten epäonnistui:', listatError);
  }
  const kohteet = (listat || []).map(function(l) { return l.name; })
    .concat(['kalenteriin (päivämäärällinen asia)', 'hytin kortille', 'ei mikään näistä']);

  const prompti = 'Tässä on lyhyt muistiinpano perheen "Laituri"-muistilistalta: "' + rivi.content + '"\n\n' +
    'Mahdolliset sijoituskohteet: ' + kohteet.map(function(k) { return '"' + k + '"'; }).join(', ') + '.\n\n' +
    'Ehdota YKSI näistä kohteista johon tämä muistiinpano todennäköisimmin kuuluisi. ' +
    'Vastaa VAIN JSON-muodossa, ei mitään muuta tekstiä, ei markdown-koodilohkoja:\n' +
    '{"ehdotus": "<kohteen nimi tarkalleen listalta>", "perustelu": "<max 10 sanaa suomeksi>"}';

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

  piirraLaituriEhdotusKortti(rivi, li, ehdotus);
}

// Muuttaa listan nimen inline-muokattavaksi kotinäkymässä
function aloitaListanMuokkaus(teksti, lista, paivitaNakyma) {
  const inputti = document.createElement('input');
  inputti.type = 'text';
  inputti.value = lista.name;
  inputti.className = 'edit-input';
  teksti.replaceWith(inputti);
  inputti.focus();
  inputti.select();
  inputti.addEventListener('click', function(e) { e.stopPropagation(); });

  async function tallenna() {
    const uusi = inputti.value.trim();
    if (uusi && uusi !== lista.name) {
      const { error } = await db.from('lists').update({ name: uusi }).eq('id', lista.id);
      if (error) {
        console.error('Listan nimen muokkaus epäonnistui:', error);
      } else {
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
  const { count } = await db.from('tuotteet').select('id', { count: 'exact', head: true }).eq('list_id', list.id);
  const message = count > 0 ? 'Listalla on ' + count + ' asiaa — nekin poistuvat.' : null;
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
      if (action.type === 'insert') {
        await db.from('tuotteet').insert(action.data);
      } else if (action.type === 'update') {
        const { id, ...data } = action.data;
        await db.from('tuotteet').update(data).eq('id', id);
      } else if (action.type === 'delete') {
        await db.from('tuotteet').delete().eq('id', action.data.id);
      }
    } catch (e) {
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
    if (error) {
      console.error('Poisto epäonnistui:', error);
    }
    await db.from('muistutukset').delete().eq('source', 'rivi').eq('source_ref', String(tuote.id));
    logEvent('deleted', tuote.is_header ? 'header' : 'item', tuote.id, tuote.nimi, tuote.list_id);
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
    if (error) {
      console.error('Pakkauslistan automaattinollaus epäonnistui:', error);
      return;
    }
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

  kohde.sort_order = uusiJarjestys;
  const { error } = await db.from(asetukset.taulu).update({ sort_order: uusiJarjestys }).eq('id', kohde.id);
  if (error) {
    console.error('Järjestyksen tallennus epäonnistui:', error);
  }
}

// Piirtää listan näytölle
function paivitaNaytto(tuotteet) {
  if (raahattavaRivi) return;
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

    // Vasemmalla: yliviivaustoiminto
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
        if (error) {
          console.error('Tuotteen merkintä epäonnistui:', error);
        }
        logEvent(eventAction, 'item', tuote.id, tuote.nimi, tuote.list_id);
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

    // Keskellä: teksti, napautus avaa muokkauksen
    const teksti = document.createElement('span');
    teksti.textContent = tuote.nimi;
    item.appendChild(teksti);

    if (tuote.tehty && tuote.bought_at) {
      const d = new Date(tuote.bought_at);
      const aika = d.getDate().toString().padStart(2, '0') + '.' +
                   (d.getMonth() + 1).toString().padStart(2, '0') + '.' +
                   d.getFullYear() + ' ' +
                   d.getHours().toString().padStart(2, '0') + ':' +
                   d.getMinutes().toString().padStart(2, '0');
      const aikaEl = document.createElement('span');
      aikaEl.textContent = aika;
      aikaEl.className = 'history-time';
      item.appendChild(aikaEl);
    }

    teksti.addEventListener('click', async function() {
      const inputti = document.createElement('input');
      inputti.type = 'text';
      inputti.value = tuote.nimi;
      inputti.className = 'edit-input';
      teksti.replaceWith(inputti);
      inputti.focus();
      inputti.select();

      async function tallenna() {
        const uusi = inputti.value.trim();
        if (uusi && uusi !== tuote.nimi) {
          if (navigator.onLine) {
            const { error } = await db.from('tuotteet').update({ nimi: uusi }).eq('id', tuote.id);
            if (error) {
              console.error('Tuotteen nimen muokkaus epäonnistui:', error);
            }
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
    });

    // Ankkurointi: nostaa/poistaa rivin päivän Ankkureihin
    const ankkuriNappi = document.createElement('button');
    ankkuriNappi.textContent = '⚓';
    ankkuriNappi.className = 'anchor-btn' + (ankkuroidutAvaimet.has('muistilaput:' + tuote.id) ? ' active' : '');
    ankkuriNappi.addEventListener('click', function() { vaihdaAnkkurointi(tuote); });
    item.appendChild(ankkuriNappi);

    item.appendChild(luoMuistutusNappi('rivi', tuote.id, tuote.nimi, null, null, lataaLista));

    // Oikealla: poistaminen
    const nappi = document.createElement('button');
    nappi.textContent = '×';
    nappi.className = 'delete-btn';
    item.appendChild(nappi);

    if (tuote.tehty) {
      item.classList.add('done');
    }

    nappi.addEventListener('click', function() { poistaTuote(tuote); });

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
    if (error) {
      console.error('Lisäys epäonnistui:', error);
    }
    logEvent(onOtsikko ? 'created' : 'added', onOtsikko ? 'header' : 'item', data ? data.id : null, teksti, listId);
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
  if (insertError) {
    console.error('Rivien lisäys Kauppalistalle epäonnistui:', insertError);
    return;
  }

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
  if (error) {
    console.error('Kategorian vaihto epäonnistui:', error);
    return;
  }
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
  if (listaError) {
    console.error('Kopion luonti epäonnistui:', listaError);
    return;
  }

  const { data: rivit, error: riviError } = await db.from('tuotteet').select().eq('list_id', currentList.id).order('sort_order');
  if (riviError) {
    console.error('Rivien haku kopiointia varten epäonnistui:', riviError);
  } else if (rivit && rivit.length > 0) {
    const kopiot = rivit.map(function(r) {
      return { nimi: r.nimi, is_header: r.is_header, sort_order: r.sort_order, list_id: uusiLista.id, tehty: false, bought_at: null };
    });
    const { error: insertError } = await db.from('tuotteet').insert(kopiot);
    if (insertError) console.error('Rivien kopiointi listalle epäonnistui:', insertError);
  }

  logEvent('created', 'list', uusiLista.id, uusiLista.name, uusiLista.id);
  document.getElementById('settings-overlay').style.display = 'none';
  naytaIlmoitus('Kopio "' + uusiLista.name + '" luotu.');
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
document.getElementById('ankkurit-add-btn').addEventListener('click', async function() {
  const ankkuriInput = document.getElementById('ankkurit-input');
  const teksti = ankkuriInput.value.trim();
  if (teksti === '') { ankkuriInput.focus(); return; }

  const { error } = await db.from('ankkurit').insert({ content: teksti, user_id: currentUserId, source: 'manual' });
  if (error) {
    console.error('Ankkurin lisäys epäonnistui:', error);
  }
  ankkuriInput.value = '';
  lataaAnkkurit();
});

document.getElementById('ankkurit-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('ankkurit-add-btn').click();
  }
});

document.getElementById('ankkurit-laajenna').addEventListener('click', function() {
  ankkuritKaikkiNakyvissa = !ankkuritKaikkiNakyvissa;
  lataaAnkkurit();
});

// Muistilaput (linkki renderöidään dynaamisesti lataaOsiot():ssa)
document.getElementById('muistilaput-back-btn').addEventListener('click', function() {
  showHomeView();
  lataaKotinakyma();
});

// Laituri (linkki renderöidään dynaamisesti lataaOsiot():ssa)
document.getElementById('laituri-back-btn').addEventListener('click', function() {
  showHomeView();
  lataaKotinakyma();
});

document.getElementById('laituri-add-btn').addEventListener('click', async function() {
  const laituriInput = document.getElementById('laituri-input');
  const teksti = laituriInput.value.trim();
  if (teksti === '') { laituriInput.focus(); return; }

  const { error } = await db.from('laituri').insert({ user_id: currentUserId, content: teksti });
  if (error) {
    console.error('Laituri-lisäys epäonnistui:', error);
  }
  laituriInput.value = '';
  tyhjennaLaituriLuonnos();
  lataaLaituri(document.getElementById('laituri-search').value.trim());
});

document.getElementById('laituri-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('laituri-add-btn').click();
  }
});

// Varmuusverkko kesken kirjoituksen tapahtuvaa uudelleenpiirtoa/sivun
// uudelleenlatausta vastaan (havaittu: näytön kääntö saattoi tyhjentää kentän
// ennen tallennusta). Luonnos talteen joka näppäimenpainalluksella, palautus
// kun Laituri-näkymä avataan uudelleen. Laituriin kirjoitettu ei saa KOSKAAN
// kadota, vaikka juurisyytä uudelleenpiirtoon ei korjattaisikaan.
const LAITURI_LUONNOS_KEY = 'satama_laituri_luonnos';
document.getElementById('laituri-input').addEventListener('input', function(e) {
  if (e.target.value) {
    localStorage.setItem(LAITURI_LUONNOS_KEY, e.target.value);
  } else {
    localStorage.removeItem(LAITURI_LUONNOS_KEY);
  }
});

function palautaLaituriLuonnos() {
  const luonnos = localStorage.getItem(LAITURI_LUONNOS_KEY);
  const laituriInput = document.getElementById('laituri-input');
  if (luonnos && !laituriInput.value) {
    laituriInput.value = luonnos;
  }
}

function tyhjennaLaituriLuonnos() {
  localStorage.removeItem(LAITURI_LUONNOS_KEY);
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
  if (error) {
    console.error('Listan luonti epäonnistui:', error);
  }
  if (data) {
    logEvent('created', 'list', data.id, nimi, data.id);
  }
  listInput.value = '';
  lataaMuistilaput();
});

document.getElementById('varasto-back-btn').addEventListener('click', function() {
  showHomeView();
  lataaKotinakyma();
});

document.getElementById('new-varasto-btn').addEventListener('click', async function() {
  const varastoInput = document.getElementById('new-varasto-input');
  const nimi = varastoInput.value.trim();
  if (nimi === '') { varastoInput.focus(); return; }

  const { data, error } = await db.from('lists').insert({ name: nimi, type: 'checklist', owner_id: currentUserId, category: 'varasto' }).select().single();
  if (error) {
    console.error('Listan luonti epäonnistui:', error);
  }
  if (data) {
    logEvent('created', 'list', data.id, nimi, data.id);
  }
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

// === MUISTUTUSPANEELIN NAPIT JA RULLAT ===
// Numerorulla 1-59 täytetään kerran sivun latauksessa — kevein iOS:ssä
// rullalta tuntuva toteutus on natiivi <select>, ei mikään erillinen kirjasto.
(function() {
  const maaraSelect = document.getElementById('muistutus-maara');
  for (let i = 1; i <= 59; i++) {
    const optio = document.createElement('option');
    optio.value = i;
    optio.textContent = i;
    maaraSelect.appendChild(optio);
  }
})();

const MUISTUTUS_YKSIKKO_MS = { min: 60 * 1000, tunti: 60 * 60 * 1000, vrk: 24 * 60 * 60 * 1000, viikko: 7 * 24 * 60 * 60 * 1000 };

document.getElementById('muistutus-lisaa-btn').addEventListener('click', function() {
  const maara = parseInt(document.getElementById('muistutus-maara').value, 10);
  const yksikko = document.getElementById('muistutus-yksikko').value;
  lisaaMuistutus(new Date(Date.now() + maara * MUISTUTUS_YKSIKKO_MS[yksikko]));
});

document.querySelectorAll('#muistutus-pikanapit button').forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (!muistutusKohde || !muistutusKohde.eventDate || !muistutusKohde.eventTime) return;
    const tapahtumanHetki = new Date(muistutusKohde.eventDate + 'T' + muistutusKohde.eventTime).getTime();
    const offsetMs = parseInt(btn.dataset.min, 10) * 60 * 1000;
    lisaaMuistutus(new Date(tapahtumanHetki - offsetMs));
  });
});

document.getElementById('muistutus-sulje').addEventListener('click', suljeMuistutusPaneeli);
document.getElementById('muistutus-overlay').addEventListener('click', function(e) {
  if (e.target === document.getElementById('muistutus-overlay')) suljeMuistutusPaneeli();
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

document.getElementById('kalenteri-add-btn').addEventListener('click', async function() {
  const kalenteriInput = document.getElementById('kalenteri-input');
  const otsikko = kalenteriInput.value.trim();
  if (otsikko === '') { kalenteriInput.focus(); return; }

  const { error } = await db.from('kalenteri_tapahtumat').insert({
    title: otsikko,
    event_date: paivamaaraISO(kalenteriPvm),
    user_id: currentUserId,
  });
  if (error) {
    console.error('Tapahtuman lisäys epäonnistui:', error);
  }
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
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'kalenteri_kuittaukset' }, () => {
    paivitaKuittausTila();
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
// ympäristömuuttujissa palvelinpuolella (api/push-test.js).
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
    const response = await fetch('/api/push-test', {
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
// yllä) — lähetys tapahtuu palvelimella (api/muistutukset-laheta.js), jota
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

  await paivitaMuistutusLista();
  document.getElementById('muistutus-overlay').style.display = 'flex';
}

function suljeMuistutusPaneeli() {
  document.getElementById('muistutus-overlay').style.display = 'none';
  muistutusKohde = null;
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
    teksti.textContent = muotoileMuistutusAika(m.remind_at);
    rivi.appendChild(teksti);

    const poisto = document.createElement('button');
    poisto.className = 'delete-btn';
    poisto.textContent = '×';
    poisto.addEventListener('click', async function() {
      const { error: poistoError } = await db.from('muistutukset').delete().eq('id', m.id);
      if (poistoError) console.error('Muistutuksen poisto epäonnistui:', poistoError);
      await paivitaMuistutuksetKartta();
      await paivitaMuistutusLista();
      if (muistutusKohde && muistutusKohde.jalkeenPaivitys) muistutusKohde.jalkeenPaivitys();
    });
    rivi.appendChild(poisto);

    listaEl.appendChild(rivi);
  });
}

async function lisaaMuistutus(remindAtDate) {
  if (!muistutusKohde) return;
  const { error } = await db.from('muistutukset').insert({
    user_id: currentUserId,
    source: muistutusKohde.source,
    source_ref: muistutusKohde.sourceRef,
    content: muistutusKohde.content,
    remind_at: remindAtDate.toISOString(),
  });
  if (error) {
    console.error('Muistutuksen tallennus epäonnistui:', error);
    naytaIlmoitus('Muistutuksen tallennus epäonnistui');
    return;
  }
  naytaIlmoitus('Muistutus asetettu');
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

// "Hae kalenteri nyt" — laukaisee /api/caldav-sync:n käsin, säästää
// "odotellaan cronia" -ihmettelyn koska Vercel Hobby-cron ei ole käytössä
// (ks. muistiinpanot.md "Kalenterisyötteet"-osio)
async function synkkaaKalenteriNyt() {
  const nappi = document.getElementById('sovellus-synkkaa-btn');
  nappi.disabled = true;
  const alkuperainenTeksti = nappi.textContent;
  nappi.textContent = 'Haetaan...';
  try {
    const vastaus = await fetch('/api/caldav-sync');
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
