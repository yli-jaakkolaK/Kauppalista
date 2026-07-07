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

const input = document.querySelector('#app-view .add-item input');
const button = document.querySelector('#app-view .add-item button');
const list = document.querySelector('#app-view .list');

let historyOpen = false;
let cachedTuotteet = [];
let currentUserId = null;
let currentList = null;
let aktiivinenOtsikkoId = null;
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
  document.getElementById('settings-btn').textContent = currentList.visibility === 'shared' ? '⚓' : '🔒';
}

// Lataa etusivun: navigointiruudukko, Ankkurit ja päivämäärä.
// Listat (nyk. "Muistilaput") EIVÄT enää ole suoraan etusivulla, ks. lataaMuistilaput()
async function lataaKotinakyma() {
  lataaOsiot();
  lataaAnkkurit();
  paivitaPaivamaara();
}

// Hakee kaikki listat ja piirtää ne Muistilaput-näkymään
async function lataaMuistilaput() {
  const { data } = await db.from('lists').select().order('created_at');
  const muistilaputList = document.getElementById('muistilaput-list');
  muistilaputList.innerHTML = '';

  (data || []).forEach(function(lista) {
    const item = document.createElement('li');
    item.addEventListener('click', function() { avaaLista(lista); });

    const teksti = document.createElement('span');
    teksti.textContent = lista.name;
    item.appendChild(teksti);

    if (lista.name !== 'Kauppalista') {
      const muokkausNappi = document.createElement('button');
      muokkausNappi.textContent = '✎';
      muokkausNappi.className = 'edit-btn';
      muokkausNappi.addEventListener('click', function(e) {
        e.stopPropagation();
        aloitaListanMuokkaus(teksti, lista);
      });
      item.appendChild(muokkausNappi);

      const poistoNappi = document.createElement('button');
      poistoNappi.textContent = '×';
      poistoNappi.className = 'delete-btn';
      poistoNappi.addEventListener('click', function(e) {
        e.stopPropagation();
        poistaLista(lista);
      });
      item.appendChild(poistoNappi);
    }

    muistilaputList.appendChild(item);
  });
}

// Näyttää tämänpäiväisen päivämäärän suomeksi etusivun yläosassa
function paivitaPaivamaara() {
  const paivat = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];
  const kuukaudet = ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta', 'kesäkuuta', 'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta'];
  const nyt = new Date();
  document.getElementById('home-date').textContent = paivat[nyt.getDay()] + ' ' + nyt.getDate() + '. ' + kuukaudet[nyt.getMonth()];
}

// Hakee päivän kolme tärkeintä tekemätöntä ankkuria järjestyksessä.
// Kun yksi merkitään tehdyksi, seuraava nousee automaattisesti näkyviin
// koska kysely suodattaa done=false — ei tarvita erillistä "ylennyslogiikkaa".
async function lataaAnkkurit() {
  const { data, error } = await db.from('ankkurit').select().eq('done', false).order('sort_order').limit(3);
  if (error) {
    console.error('Ankkureiden haku epäonnistui:', error);
    return;
  }

  const listEl = document.getElementById('ankkurit-list');
  listEl.innerHTML = '';

  (data || []).forEach(function(ankkuri) {
    const li = document.createElement('li');

    const checkNappi = document.createElement('button');
    checkNappi.textContent = '○';
    checkNappi.className = 'check-btn';
    checkNappi.addEventListener('click', async function() {
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

    const poistoNappi = document.createElement('button');
    poistoNappi.textContent = '×';
    poistoNappi.className = 'delete-btn';
    poistoNappi.addEventListener('click', async function() {
      const vahvistus = await naytaVahvistus('Poistetaanko ' + ankkuri.content + '?', null, 'Poista');
      if (!vahvistus) return;
      const { error } = await db.from('ankkurit').delete().eq('id', ankkuri.id);
      if (error) {
        console.error('Ankkurin poisto epäonnistui:', error);
      }
      lataaAnkkurit();
    });
    li.appendChild(poistoNappi);

    listEl.appendChild(li);
  });
}

// Hakee etusivun osiot (Laituri, Ankkurit, ym.) ja piirtää ne geneerisesti —
// osiot tulevat tietokannasta (nimi, ikoni, reitti, järjestys), ei kovakoodattuina
async function lataaOsiot() {
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
    tile.addEventListener('click', function() { avaaOsio(osio); });

    const ikoni = document.createElement('span');
    ikoni.className = 'tile-icon';
    ikoni.textContent = osio.icon;
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
}

// Avaa osion sen route-kentän mukaan. Vain 'laituri' on toistaiseksi toiminnallinen.
function avaaOsio(osio) {
  if (osio.route === 'laituri') {
    showLaituriView();
    lataaLaituri();
  } else if (osio.route === 'muistilaput') {
    showMuistilaputView();
    lataaMuistilaput();
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
function aloitaListanMuokkaus(teksti, lista) {
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
    lataaMuistilaput();
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

async function poistaLista(lista) {
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
  lataaMuistilaput();
}

// Kirjautumisen jälkeen: palataan viimeisimpään listaan tai näytetään koti
async function siirryKirjautumisenJalkeen() {
  const viimeisinId = localStorage.getItem(LAST_LIST_KEY);
  if (viimeisinId) {
    const { data } = await db.from('lists').select().eq('id', viimeisinId).single();
    if (data) {
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

// === RAAHAUS (pitkä painallus + siirto) ===
const RAAHAUS_VIIVE_MS = 450;
const RAAHAUS_PERUUTUS_PX = 10;
let raahattavaRivi = null;

function alustaRaahaus(li, tuote) {
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
      siirraRaahattavaKohtaan(li, piste.clientY);
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
      await tallennaUusiJarjestys(li, tuote);
      lataaLista();
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
function siirraRaahattavaKohtaan(li, clientY) {
  const sisarukset = Array.from(list.children).filter(function(el) { return el !== li; });

  for (const sisarus of sisarukset) {
    const rect = sisarus.getBoundingClientRect();
    const puolivali = rect.top + rect.height / 2;
    if (clientY < puolivali) {
      if (sisarus.previousElementSibling !== li) {
        list.insertBefore(li, sisarus);
      }
      return;
    }
  }

  if (list.lastElementChild !== li) {
    list.appendChild(li);
  }
}

// Laskee uuden sort_order-arvon rivin lopullisen DOM-sijainnin naapureista ja tallentaa sen
async function tallennaUusiJarjestys(li, tuote) {
  const kaikki = Array.from(list.children);
  const index = kaikki.indexOf(li);
  const edellinen = kaikki[index - 1];
  const seuraava = kaikki[index + 1];

  const edellinenTuote = edellinen ? cachedTuotteet.find(function(t) { return String(t.id) === edellinen.dataset.tuoteId; }) : null;
  const seuraavaTuote = seuraava ? cachedTuotteet.find(function(t) { return String(t.id) === seuraava.dataset.tuoteId; }) : null;

  let uusiJarjestys;
  if (edellinenTuote && seuraavaTuote) {
    uusiJarjestys = (edellinenTuote.sort_order + seuraavaTuote.sort_order) / 2;
  } else if (edellinenTuote) {
    uusiJarjestys = edellinenTuote.sort_order + 1;
  } else if (seuraavaTuote) {
    uusiJarjestys = seuraavaTuote.sort_order - 1;
  } else {
    uusiJarjestys = 1;
  }

  tuote.sort_order = uusiJarjestys;
  const { error } = await db.from('tuotteet').update({ sort_order: uusiJarjestys }).eq('id', tuote.id);
  if (error) {
    console.error('Järjestyksen tallennus epäonnistui:', error);
    lataaLista();
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
    alustaRaahaus(item, tuote);

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
      if (navigator.onLine) {
        const { error } = await db.from('tuotteet').update(updateData).eq('id', tuote.id);
        if (error) {
          console.error('Tuotteen merkintä epäonnistui:', error);
        }
        logEvent(eventAction, 'item', tuote.id, tuote.nimi, tuote.list_id);
        lataaLista();
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

// Takaisin-nuoli — palaa Muistilaput-näkymään (sieltä listat avataan)
document.getElementById('back-btn').addEventListener('click', function() {
  showMuistilaputView();
  lataaMuistilaput();
});

// Listan asetukset — näkyvyyden vaihto
document.getElementById('settings-btn').addEventListener('click', function() {
  if (!currentList) return;
  const jaettu = currentList.visibility === 'shared';
  document.getElementById('visibility-toggle').checked = jaettu;
  document.getElementById('settings-visibility-label').textContent = jaettu ? 'Näkyy molemmille' : 'Näkyy vain sinulle';
  document.getElementById('settings-overlay').style.display = 'flex';
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

  const { data, error } = await db.from('lists').insert({ name: nimi, type: 'checklist', owner_id: currentUserId }).select().single();
  if (error) {
    console.error('Listan luonti epäonnistui:', error);
  }
  if (data) {
    logEvent('created', 'list', data.id, nimi, data.id);
  }
  listInput.value = '';
  lataaMuistilaput();
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
