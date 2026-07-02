// Yhdistetään Supabaseen
const { createClient } = supabase;
const db = createClient(
  'https://uctmxxeewoeydabuepye.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG14eGVld29leWRhYnVlcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjI1NDYsImV4cCI6MjA5ODQ5ODU0Nn0.oJLbtc2BDTqwKu-Ih8ahZMM-s-XpqGvULV5ENGhDYJU'
);

const input = document.querySelector('.add-item input');
const button = document.querySelector('.add-item button');
const list = document.querySelector('.list');

// Piirtää listan näytölle
function paivitaNaytto(tuotteet) {
  list.innerHTML = '';

  tuotteet.forEach(function(tuote) {
    const item = document.createElement('li');

    // Vasemmalla: yliviivaustoiminto
    const checkNappi = document.createElement('button');
    checkNappi.textContent = tuote.tehty ? '✓' : '○';
    checkNappi.className = 'check-btn';
    item.appendChild(checkNappi);

    checkNappi.addEventListener('click', async function() {
      await db.from('tuotteet').update({ tehty: !tuote.tehty }).eq('id', tuote.id);
      lataaLista();
    });

    // Keskellä: teksti, napautus avaa muokkauksen
    const teksti = document.createElement('span');
    teksti.textContent = tuote.nimi;
    item.appendChild(teksti);

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
          await db.from('tuotteet').update({ nimi: uusi }).eq('id', tuote.id);
        }
        lataaLista();
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
      await db.from('tuotteet').delete().eq('id', tuote.id);
      lataaLista();
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

  subtitle.textContent = jaljella + ' jäljellä · ' + ostettu + ' ostettu';

  if (tuotteet.length > 0) {
    footer.style.display = 'block';
    footerDivider.style.display = 'block';
    footerCount.textContent = jaljella + ' KPL JÄLJELLÄ';
  } else {
    footer.style.display = 'none';
    footerDivider.style.display = 'none';
  }
}

// Haetaan kaikki tuotteet Supabasesta ja näytetään ne
async function lataaLista() {
  const { data } = await db.from('tuotteet').select().order('id');
  paivitaNaytto(data);
  paivitaFooter(data);
}

// Lisätään uusi tuote Supabaseen
button.addEventListener('click', async function() {
  const teksti = input.value.trim();
  if (teksti === '') return;

  await db.from('tuotteet').insert({ nimi: teksti, tehty: false });
  lataaLista();

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

// Kuunnellaan muutoksia reaaliajassa — päivittyy automaattisesti
db.channel('tuotteet')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tuotteet' }, () => {
    lataaLista();
  })
  .subscribe();
