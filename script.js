// Yhdistetään Supabaseen
const { createClient } = supabase;
const db = createClient(
  'https://uctmxxeewoeydabuepye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG14eGVld29leWRhYnVlcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjI1NDYsImV4cCI6MjA5ODQ5ODU0Nn0.oJLbtc2BDTqwKu-Ih8ahZMM-s-XpqGvULV5ENGhDYJU'
);

function showLoginView() {
  document.getElementById('login-view').style.display = 'flex';
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'none';
}

function showHomeView() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('home-view').style.display = 'block';
  document.getElementById('app-view').style.display = 'none';
}

function showAppView() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'block';
}

const input = document.querySelector('#app-view .add-item input');
const button = document.querySelector('#app-view .add-item button');
const list = document.querySelector('#app-view .list');

let historyOpen = false;
let cachedTuotteet = [];
let currentUserId = null;
let currentList = null;
const LAST_LIST_KEY = 'kauppalista_viimeisin_lista';

// Avaa valitun listan ja muistaa sen seuraavaa käynnistystä varten
function avaaLista(lista) {
  currentList = lista;
  historyOpen = false;
  localStorage.setItem(LAST_LIST_KEY, lista.id);
  document.getElementById('list-title').textContent = '✱ ' + lista.name + ' ✱';
  showAppView();
  lataaLista();
}

// Hakee kaikki listat ja piirtää ne kotinäkymään
async function lataaKotinakyma() {
  const { data } = await db.from('lists').select().order('created_at');
  const homeList = document.getElementById('home-list');
  homeList.innerHTML = '';

  (data || []).forEach(function(lista) {
    const item = document.createElement('li');
    item.addEventListener('click', function() { avaaLista(lista); });

    const teksti = document.createElement('span');
    teksti.textContent = lista.name;
    item.appendChild(teksti);

    if (lista.name !== 'Kauppalista') {
      const poistoNappi = document.createElement('button');
      poistoNappi.textContent = '×';
      poistoNappi.className = 'delete-btn';
      poistoNappi.addEventListener('click', function(e) {
        e.stopPropagation();
        poistaLista(lista);
      });
      item.appendChild(poistoNappi);
    }

    homeList.appendChild(item);
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

  await db.from('tuotteet').delete().eq('list_id', lista.id);
  await db.from('events').delete().eq('list_id', lista.id);
  await db.from('lists').delete().eq('id', lista.id);
  logEvent('deleted', 'list', lista.id, lista.name, null);

  if (currentList && currentList.id === lista.id) {
    localStorage.removeItem(LAST_LIST_KEY);
    currentList = null;
    showHomeView();
  }
  lataaKotinakyma();
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

// Piirtää listan näytölle
function paivitaNaytto(tuotteet) {
  list.innerHTML = '';
  const naytettavat = historyOpen ? tuotteet : tuotteet.filter(t => !t.tehty);

  naytettavat.forEach(function(tuote) {
    const item = document.createElement('li');

    // Vasemmalla: yliviivaustoiminto
    const checkNappi = document.createElement('button');
    checkNappi.textContent = tuote.tehty ? '✓' : '○';
    checkNappi.className = 'check-btn';
    item.appendChild(checkNappi);

    checkNappi.addEventListener('click', async function() {
      const updateData = { tehty: !tuote.tehty, bought_at: !tuote.tehty ? new Date().toISOString() : null };
      const eventAction = updateData.tehty ? 'checked' : 'unchecked';
      if (navigator.onLine) {
        await db.from('tuotteet').update(updateData).eq('id', tuote.id);
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
            await db.from('tuotteet').update({ nimi: uusi }).eq('id', tuote.id);
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

    nappi.addEventListener('click', async function() {
      const vahvistus = await naytaVahvistus('Poistetaanko ' + tuote.nimi + '?', null, 'Poista tuote');
      if (!vahvistus) return;

      if (navigator.onLine) {
        await db.from('tuotteet').delete().eq('id', tuote.id);
        logEvent('deleted', 'item', tuote.id, tuote.nimi, tuote.list_id);
        lataaLista();
      } else {
        addToQueue({ type: 'delete', data: { id: tuote.id } });
        cachedTuotteet = cachedTuotteet.filter(t => t.id !== tuote.id);
        paivitaNaytto(cachedTuotteet);
        paivitaFooter(cachedTuotteet);
        logEvent('deleted', 'item', tuote.id, tuote.nimi, tuote.list_id);
      }
    });

    list.appendChild(item);
  });
}

function paivitaFooter(tuotteet) {
  const jaljella = tuotteet.filter(t => !t.tehty).length;
  const ostettu = tuotteet.filter(t => t.tehty).length;
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
  if (!currentList) return;
  if (!navigator.onLine) {
    paivitaNaytto(cachedTuotteet);
    paivitaFooter(cachedTuotteet);
    return;
  }
  const { data } = await db.from('tuotteet').select().eq('list_id', currentList.id).order('id');
  cachedTuotteet = data;
  paivitaNaytto(data);
  paivitaFooter(data);
  updateSyncIndicator();
}

// Lisätään uusi tuote Supabaseen
button.addEventListener('click', async function() {
  const teksti = input.value.trim();
  if (teksti === '' || !currentList) return;
  const listId = currentList.id;

  if (navigator.onLine) {
    const { data } = await db.from('tuotteet').insert({ nimi: teksti, tehty: false, list_id: listId }).select().single();
    logEvent('added', 'item', data ? data.id : null, teksti, listId);
    lataaLista();
  } else {
    addToQueue({ type: 'insert', data: { nimi: teksti, tehty: false, list_id: listId } });
    cachedTuotteet.push({ id: 'temp_' + Date.now(), nimi: teksti, tehty: false, bought_at: null, list_id: listId });
    paivitaNaytto(cachedTuotteet);
    paivitaFooter(cachedTuotteet);
    logEvent('added', 'item', null, teksti, listId);
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

// Takaisin-nuoli — palaa kotinäkymään
document.getElementById('back-btn').addEventListener('click', function() {
  showHomeView();
  lataaKotinakyma();
});

// Uuden listan lisäys kotinäkymässä
document.getElementById('new-list-btn').addEventListener('click', async function() {
  const listInput = document.getElementById('new-list-input');
  const nimi = listInput.value.trim();
  if (nimi === '') return;

  const { data } = await db.from('lists').insert({ name: nimi, type: 'checklist', owner_id: currentUserId }).select().single();
  if (data) {
    logEvent('created', 'list', data.id, nimi, data.id);
  }
  listInput.value = '';
  lataaKotinakyma();
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
