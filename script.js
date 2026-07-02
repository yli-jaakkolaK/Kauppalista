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

    const teksti = document.createElement('span');
    teksti.textContent = tuote.nimi;
    item.appendChild(teksti);

    const nappi = document.createElement('button');
    nappi.textContent = '×';
    nappi.className = 'delete-btn';
    item.appendChild(nappi);

    if (tuote.tehty) {
      item.classList.add('done');
    }

    // Poistetaan tuote Supabasesta
    nappi.addEventListener('click', async function(event) {
      event.stopPropagation();
      await db.from('tuotteet').delete().eq('id', tuote.id);
      lataaLista();
    });

    // Merkitään tehty/tekemättä Supabasessa
    item.addEventListener('click', async function() {
      await db.from('tuotteet').update({ tehty: !tuote.tehty }).eq('id', tuote.id);
      lataaLista();
    });

    list.appendChild(item);
  });
}

// Haetaan kaikki tuotteet Supabasesta ja näytetään ne
async function lataaLista() {
  const { data } = await db.from('tuotteet').select().order('id');
  paivitaNaytto(data);
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
