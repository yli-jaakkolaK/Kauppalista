// Yhdistetään Supabaseen
const { createClient } = supabase;
const db = createClient(
  'https://uctmxxeewoeydabuepye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG14eGVld29leWRhYnVlcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjI1NDYsImV4cCI6MjA5ODQ5ODU0Nn0.oJLbtc2BDTqwKu-Ih8ahZMM-s-XpqGvULV5ENGhDYJU'
);

function showLoginView() {
  document.getElementById('login-view').style.display = 'flex';
  document.getElementById('app-view').style.display = 'none';
}

function showAppView() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('app-view').style.display = 'block';
}

const input = document.querySelector('.add-item input');
const button = document.querySelector('.add-item button');
const list = document.querySelector('.list');

let historyOpen = false;
let cachedTuotteet = [];

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
    const divider = document.querySelector('.divider');
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
      if (navigator.onLine) {
        await db.from('tuotteet').update(updateData).eq('id', tuote.id);
        lataaLista();
      } else {
        addToQueue({ type: 'update', data: { id: tuote.id, ...updateData } });
        cachedTuotteet = cachedTuotteet.map(t => t.id === tuote.id ? { ...t, ...updateData } : t);
        paivitaNaytto(cachedTuotteet);
        paivitaFooter(cachedTuotteet);
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
      if (navigator.onLine) {
        await db.from('tuotteet').delete().eq('id', tuote.id);
        lataaLista();
      } else {
        addToQueue({ type: 'delete', data: { id: tuote.id } });
        cachedTuotteet = cachedTuotteet.filter(t => t.id !== tuote.id);
        paivitaNaytto(cachedTuotteet);
        paivitaFooter(cachedTuotteet);
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
  if (!navigator.onLine) {
    paivitaNaytto(cachedTuotteet);
    paivitaFooter(cachedTuotteet);
    return;
  }
  const { data } = await db.from('tuotteet').select().order('id');
  cachedTuotteet = data;
  paivitaNaytto(data);
  paivitaFooter(data);
  updateSyncIndicator();
}

// Lisätään uusi tuote Supabaseen
button.addEventListener('click', async function() {
  const teksti = input.value.trim();
  if (teksti === '') return;

  if (navigator.onLine) {
    await db.from('tuotteet').insert({ nimi: teksti, tehty: false });
    lataaLista();
  } else {
    addToQueue({ type: 'insert', data: { nimi: teksti, tehty: false } });
    cachedTuotteet.push({ id: 'temp_' + Date.now(), nimi: teksti, tehty: false, bought_at: null });
    paivitaNaytto(cachedTuotteet);
    paivitaFooter(cachedTuotteet);
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

// Ladataan lista heti kun sivu aukeaa
lataaLista();
updateSyncIndicator();

// Silmänappi — näyttää/piilottaa ostetut tuotteet
document.getElementById('eye-btn').addEventListener('click', function() {
  historyOpen = !historyOpen;
  lataaLista();
});

// Kuunnellaan muutoksia reaaliajassa — päivittyy automaattisesti
const realtimeChannel = db.channel('tuotteet')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tuotteet' }, () => {
    lataaLista();
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
  if (session) {
    showAppView();
  } else {
    showLoginView();
  }
});

db.auth.getSession().then(function(result) {
  if (result.data.session) {
    showAppView();
  } else {
    showLoginView();
  }
});
