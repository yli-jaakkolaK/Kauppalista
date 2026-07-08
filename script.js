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
// Avain on "lähde:tunniste" (esim. "muistilaput:42"), koska sama tunniste
// voi periaatteessa esiintyä eri lähteissä (tuotteet.id vs. kalenterin id)
let ankkuroidutAvaimet = new Set();

// Hakee mitkä rivit (mistä tahansa lähteestä) on jo nostettu Ankkureihin
async function paivitaAnkkuroidutAvaimet() {
  const { data, error } = await db.from('ankkurit').select('source, source_ref').not('source_ref', 'is', null);
  if (error) {
    console.error('Ankkurointitilan haku epäonnistui:', error);
    return;
  }
  ankkuroidutAvaimet = new Set((data || []).map(function(rivi) { return rivi.source + ':' + rivi.source_ref; }));
}

// Nostaa/poistaa rivin ankkuroinnin lähteestä riippumatta (Muistilaput-tuote,
// kalenteritapahtuma, ym. — kaikki käyttävät samaa mekanismia)
async function vaihdaAnkkurointiYleinen(source, id, content, jalkeenPaivitys) {
  const idStr = String(id);
  if (ankkuroidutAvaimet.has(source + ':' + idStr)) {
    const { error } = await db.from('ankkurit').delete().eq('source', source).eq('source_ref', idStr);
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
const LAST_LIST_KEY = 'kauppalista_viimeisin_lista';

// Avaa valitun listan ja muistaa sen seuraavaa käynnistystä varten
function avaaLista(lista) {
  currentList = lista;
  historyOpen = false;
  aktiivinenOtsikkoId = null;
  localStorage.setItem(LAST_LIST_KEY, lista.id);
  document.getElementById('list-title').textContent = '✱ ' + lista.name + ' ✱';
  paivitaNakyvyysIkoni();
  paivitaLisaysKohde();
  showAppView();
  lataaLista();
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
        poistaLista(lista, paivitaNakyma);
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
// muutkaan tämän appin laitekohtaiset asetukset) — kytkin Asetukset-näkymässä.
// Oletus päällä, koska tämä on nimenomaan mitä pyydettiin: näkyy kunnes
// erikseen laitetaan pois.
const HYTTI_KALENTERISSA_KEY = 'kauppalista_hytti_kalenterissa';
function hyttiNakyyKalenterissa() {
  return localStorage.getItem(HYTTI_KALENTERISSA_KEY) !== 'false';
}

function paivamaaraISO(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
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

  const ankkurointiNappi = document.createElement('button');
  ankkurointiNappi.textContent = '⚓';
  ankkurointiNappi.className = 'anchor-btn' + (ankkuroidutAvaimet.has('kalenteri:' + rivi.id) ? ' active' : '');
  ankkurointiNappi.addEventListener('click', async function() {
    await vaihdaAnkkurointiYleinen('kalenteri', rivi.id, rivi.title, function() {});
    lataaKalenteri();
  });
  li.appendChild(ankkurointiNappi);

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
    lataaKalenteri();
  });
  li.appendChild(poistoNappi);

  return li;
}

function piirraKalenteriPaivaRyhma(container, rivit, otsikkoTeksti) {
  const ryhma = document.createElement('div');
  ryhma.className = 'kalenteri-paiva-ryhma';

  if (otsikkoTeksti) {
    const otsikko = document.createElement('div');
    otsikko.className = 'kalenteri-paiva-otsikko';
    otsikko.textContent = otsikkoTeksti;
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

  // kalenteri_syotteet(vari) hakee liitetyn syötteen värin FK-suhteen
  // (syote_id) kautta samassa kyselyssä — null jos käsin lisätty tapahtuma.
  const { data: haetut, error } = await db.from('kalenteri_tapahtumat')
    .select('*, kalenteri_syotteet(vari)')
    .gte('event_date', paivamaaraISO(alku))
    .lte('event_date', paivamaaraISO(loppu))
    .order('event_date')
    .order('event_time', { nullsFirst: false });

  if (error) {
    console.error('Kalenterin haku epäonnistui:', error);
    return;
  }

  const data = (haetut || []).map(function(t) {
    return Object.assign({}, t, { _vari: t.kalenteri_syotteet ? t.kalenteri_syotteet.vari : null });
  });

  await paivitaAnkkuroidutAvaimet();

  const sisalto = document.getElementById('kalenteri-sisalto');
  sisalto.innerHTML = '';

  if (kalenteriTila === 'paiva') {
    let rivit = (data || []).map(function(t) {
      return { _tyyppi: 'tapahtuma', id: t.id, title: t.title, event_time: t.event_time, _vari: t._vari };
    });

    if (paivamaaraISO(kalenteriPvm) === paivamaaraISO(new Date())) {
      const { data: ankkuridata, error: ankkuriError } = await db.from('ankkurit').select().eq('done', false);
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

  const ryhmat = {};
  (data || []).forEach(function(t) {
    (ryhmat[t.event_date] = ryhmat[t.event_date] || []).push(t);
  });

  if (kalenteriTila === 'viikko') {
    for (let i = 0; i < 7; i++) {
      const pvm = new Date(alku);
      pvm.setDate(pvm.getDate() + i);
      const iso = paivamaaraISO(pvm);
      const otsikkoTeksti = KALENTERI_PAIVAT[pvm.getDay()] + ' ' + pvm.getDate() + '.' + (pvm.getMonth() + 1) + '.';
      piirraKalenteriPaivaRyhma(sisalto, ryhmat[iso] || [], otsikkoTeksti);
    }
  } else {
    const avaimet = Object.keys(ryhmat).sort();
    if (avaimet.length === 0) {
      piirraKalenteriPaivaRyhma(sisalto, [], null);
    } else {
      avaimet.forEach(function(iso) {
        const pvm = new Date(iso + 'T00:00:00');
        const otsikkoTeksti = KALENTERI_PAIVAT[pvm.getDay()] + ' ' + pvm.getDate() + '.' + (pvm.getMonth() + 1) + '.';
        piirraKalenteriPaivaRyhma(sisalto, ryhmat[iso], otsikkoTeksti);
      });
    }
  }
}

// === KALENTERISYÖTTEIDEN HYVÄKSYNTÄJONO ===
// Geneerinen kalenteri_syotteet-pohjainen pull (icloud/ics_url, taysi/vain_varattu),
// ks. api/caldav-sync.js ja sql/014_kalenteri_syotteet.sql. Kutsutaan aina kun
// Kalenteri-näkymä avataan — EI Vercel Cronia, koska Hobby-tason cron toimii
// vain kerran vuorokaudessa. Virheet vaietaan (fire-and-forget, kuten
// logEvent()) — synkan epäonnistuminen ei saa koskaan estää kalenterin käyttöä.
function synkkaaICloud() {
  fetch('/api/caldav-sync').then(function() {
    paivitaOdottaaLinkki();
    paivitaKalenteriBadge();
  }).catch(function() {});
}

// Hakee kalenteri_odottavat-taulusta hyväksyntää odottavat rivit (+ liitetyn
// syötteen väri/nimi FK:n kautta) ja päivittää Kalenteri-näkymän yläosan
// linkin ("N odottaa hyväksyntää")
async function paivitaOdottaaLinkki() {
  const linkki = document.getElementById('kalenteri-odottaa-linkki');
  const { data, error } = await db.from('kalenteri_odottavat')
    .select('*, kalenteri_syotteet(vari, name)')
    .eq('status', 'odottaa')
    .order('event_date');
  if (error) {
    console.error('Odottavien kalenteritapahtumien haku epäonnistui:', error);
    return;
  }
  if (!data || data.length === 0) {
    linkki.style.display = 'none';
    return;
  }
  linkki.style.display = 'block';
  linkki.textContent = '⏳ ' + data.length + ' odottaa hyväksyntää — näytä';
  linkki.onclick = function() { avaaHyvaksyntaOverlay(data); };
}

// Hakee etusivun Kalenteri-laatan merkin (odottavien määrä), sama mekanismi
// kuin paivitaLaituriBadge()
async function paivitaKalenteriBadge() {
  const badge = document.querySelector('.tile-badge[data-osio-key="kalenteri"]');
  if (!badge) return;
  const { count } = await db.from('kalenteri_odottavat').select('id', { count: 'exact', head: true }).eq('status', 'odottaa');
  if (count) {
    badge.textContent = count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// Piirtää hyväksyntäkortit (otsikko + pvm/aika + värillinen lähdemerkintä +
// Ok/Hylkää) ja avaa overlayn
function avaaHyvaksyntaOverlay(rivit) {
  const lista = document.getElementById('kalenteri-hyvaksynta-lista');
  lista.innerHTML = '';

  rivit.forEach(function(rivi) {
    const kortti = document.createElement('div');
    kortti.className = 'kalenteri-kortti';

    const vari = document.createElement('span');
    vari.className = 'kalenteri-kortti-vari';
    vari.style.backgroundColor = rivi.kalenteri_syotteet ? (rivi.kalenteri_syotteet.vari || 'var(--muted)') : 'var(--muted)';
    kortti.appendChild(vari);

    const teksti = document.createElement('div');
    teksti.className = 'kalenteri-kortti-teksti';
    const pvm = new Date(rivi.event_date + 'T00:00:00');
    const pvmTeksti = pvm.getDate() + '.' + (pvm.getMonth() + 1) + '.' + (rivi.event_time ? ' klo ' + rivi.event_time.slice(0, 5) : '');
    const otsikkoRivi = document.createElement('strong');
    otsikkoRivi.textContent = rivi.title;
    const pvmRivi = document.createElement('span');
    pvmRivi.className = 'kalenteri-kortti-pvm';
    pvmRivi.textContent = pvmTeksti;
    teksti.appendChild(otsikkoRivi);
    teksti.appendChild(document.createElement('br'));
    teksti.appendChild(pvmRivi);
    kortti.appendChild(teksti);

    const napit = document.createElement('div');
    napit.className = 'kalenteri-kortti-napit';

    const okNappi = document.createElement('button');
    okNappi.className = 'dialog-btn dialog-btn-cancel';
    okNappi.textContent = 'Ok';
    okNappi.addEventListener('click', async function() {
      await db.from('kalenteri_tapahtumat').insert({
        title: rivi.title,
        event_date: rivi.event_date,
        event_time: rivi.event_time,
        event_end_time: rivi.event_end_time,
        ical_uid: rivi.ical_uid,
        syote_id: rivi.syote_id,
      });
      await db.from('kalenteri_odottavat').delete().eq('id', rivi.id);
      kortti.remove();
      paivitaOdottaaLinkki();
      paivitaKalenteriBadge();
      lataaKalenteri();
    });
    napit.appendChild(okNappi);

    const hylkaaNappi = document.createElement('button');
    hylkaaNappi.className = 'dialog-btn';
    hylkaaNappi.textContent = 'Hylkää';
    hylkaaNappi.addEventListener('click', async function() {
      const { error } = await db.from('kalenteri_odottavat').update({ status: 'hylatty' }).eq('id', rivi.id);
      if (error) console.error('Kalenteritapahtuman hylkäys epäonnistui:', error);
      kortti.remove();
      paivitaOdottaaLinkki();
      paivitaKalenteriBadge();
    });
    napit.appendChild(hylkaaNappi);

    kortti.appendChild(napit);
    lista.appendChild(kortti);
  });

  document.getElementById('kalenteri-hyvaksynta-overlay').style.display = 'flex';
}

document.getElementById('kalenteri-hyvaksynta-sulje').addEventListener('click', function() {
  document.getElementById('kalenteri-hyvaksynta-overlay').style.display = 'none';
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

// Lataa avoinna olevan kortin rivit ja piirtää koko korttinäkymän
async function lataaHyttiKortti() {
  if (!currentHyttiKortti || raahattavaRivi) return;
  const { data, error } = await db.from('hytti_rivit').select().eq('kortti_id', currentHyttiKortti.id).order('sort_order');
  if (error) {
    console.error('Hytti-kortin rivien haku epäonnistui:', error);
    return;
  }
  cachedHyttiRivit = data || [];
  piirraHyttiKorttiUI();
  piirraHyttiRivit();
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

// Hakee päivän tärkeimmät tekemättömät ankkurit järjestyksessä. Oletuksena
// vain 3 näkyy (loput piilossa "+ N muuta" -linkin takana), mutta käyttäjä
// voi laajentaa näkymän nähdäkseen ja priorisoidakseen kaikki raahaamalla.
// Kun yksi merkitään tehdyksi, seuraava nousee automaattisesti näkyviin
// koska kysely suodattaa done=false — ei tarvita erillistä "ylennyslogiikkaa".
async function lataaAnkkurit() {
  if (raahattavaRivi) return;
  const { data, error } = await db.from('ankkurit').select().eq('done', false).order('sort_order');
  if (error) {
    console.error('Ankkureiden haku epäonnistui:', error);
    return;
  }

  cachedAnkkurit = data || [];
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
        lataaAnkkurit();
      }, 250);
    });
    li.appendChild(irrotaNappi);

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
  paivitaKalenteriBadge();
}

// Avaa osion sen route-kentän mukaan. Vain 'laituri' on toistaiseksi toiminnallinen.
function avaaOsio(osio) {
  if (osio.route === 'laituri') {
    showLaituriView();
    lataaLaituri();
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
    paivitaOdottaaLinkki();
    synkkaaICloud();
  } else if (osio.route === 'asetukset') {
    showAsetuksetView();
    paivitaPushTila();
    document.getElementById('hytti-kalenteri-toggle').checked = hyttiNakyyKalenterissa();
  } else if (osio.route === 'hytti') {
    showHyttiView();
    lataaHyttiPaanakyma();
  } else {
    alert(osio.name + ' tulossa pian.');
  }
}

// Hakee Laiturin uusien (ei vielä sijoitettujen) rivien määrän kotinäkymän merkkiä varten
async function paivitaLaituriBadge() {
  const badge = document.querySelector('.tile-badge[data-osio-key="laituri"]');
  if (!badge) return;
  const { count } = await db.from('laituri').select('id', { count: 'exact', head: true }).eq('status', 'uusi');
  if (count) {
    badge.textContent = count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// Hakee ja piirtää Laiturin rivit, valinnaisesti hakusanalla suodatettuna
async function lataaLaituri(hakusana) {
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
      const sijoitaNappi = document.createElement('button');
      sijoitaNappi.className = 'place-btn';
      sijoitaNappi.textContent = '→';
      sijoitaNappi.addEventListener('click', async function() {
        const minne = prompt('Minne sijoitit tämän?');
        if (!minne || !minne.trim()) return;
        const { error } = await db.from('laituri').update({ status: 'sijoitettu', placed_where: minne.trim() }).eq('id', rivi.id);
        if (error) {
          console.error('Sijoitus epäonnistui:', error);
        }
        lataaLaituri(document.getElementById('laituri-search').value.trim());
        paivitaLaituriBadge();
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

async function poistaLista(lista, paivitaNakyma) {
  const { count } = await db.from('tuotteet').select('id', { count: 'exact', head: true }).eq('list_id', lista.id);
  const teksti = count > 0 ? 'Listalla on ' + count + ' asiaa — nekin poistuvat.' : null;
  const vahvistus = await naytaVahvistus('Poistetaanko ' + lista.name + '?', teksti, 'Poista lista');
  if (!vahvistus) return;

  const del1 = await db.from('tuotteet').delete().eq('list_id', lista.id);
  if (del1.error) console.error('Listan tuotteiden poisto epäonnistui:', del1.error);
  const del2 = await db.from('events').delete().eq('list_id', lista.id);
  if (del2.error) console.error('Listan tapahtumien poisto epäonnistui:', del2.error);
  const del3 = await db.from('lists').delete().eq('id', lista.id);
  if (del3.error) console.error('Listan poisto epäonnistui:', del3.error);
  logEvent('deleted', 'list', lista.id, lista.name, null);

  if (currentList && currentList.id === lista.id) {
    localStorage.removeItem(LAST_LIST_KEY);
    currentList = null;
  }
  paivitaNakyma();
}

// Kirjautumisen jälkeen: palataan viimeisimpään listaan tai näytetään koti
async function siirryKirjautumisenJalkeen() {
  const viimeisinId = localStorage.getItem(LAST_LIST_KEY);
  if (viimeisinId) {
    const { data } = await db.from('lists').select().eq('id', viimeisinId).single();
    if (data) {
      listanAvausLahde = data.category || 'muistilaput';
      avaaLista(data);
      return;
    }
    localStorage.removeItem(LAST_LIST_KEY);
  }
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
  lataaLaituri(document.getElementById('laituri-search').value.trim());
});

document.getElementById('laituri-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('laituri-add-btn').click();
  }
});

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
  naytaIlmoitus(e.target.checked ? 'Hytin tehtävät näkyvät nyt Kalenterissa' : 'Hytin tehtävät piilotettu Kalenterista');
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
