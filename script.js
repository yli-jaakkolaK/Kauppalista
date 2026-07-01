// Haetaan samat elementit kuin ennenkin
const input = document.querySelector('.add-item input');
const button = document.querySelector('.add-item button');
const list = document.querySelector('.list');

// UUTTA: Ladataan lista localStoragesta kun sivu avataan
// JSON.parse muuttaa tallennetun tekstin takaisin listaksi
// Jos localStoragessa ei ole vielä mitään, käytetään tyhjää listaa []
let tuotteet = JSON.parse(localStorage.getItem('kauppalista')) || [];

// UUTTA: Tämä funktio piirtää listan näytölle aina uudestaan
function paivitaNaytto() {
  list.innerHTML = ''; // Tyhjennetään näytön lista ensin

  tuotteet.forEach(function(tuote, indeksi) {
    const item = document.createElement('li');
    const teksti = document.createElement('span');
    teksti.textContent = tuote.nimi;
    item.appendChild(teksti);

    const nappi = document.createElement('button');
    nappi.textContent = '×';
    nappi.className = 'delete-btn';
    item.appendChild(nappi);

    nappi.addEventListener('click', function(event) {
        event.stopPropagation();
        tuotteet.splice(indeksi, 1);
        tallenna();
    });

    if (tuote.tehty) {
      item.classList.add('done');
    }

    item.addEventListener('click', function() {
      // UUTTA: Muutetaan tuotteen tila ja tallennetaan heti
      tuotteet[indeksi].tehty = !tuotteet[indeksi].tehty;
      tallenna();
    });

    list.appendChild(item);
  });
}

// UUTTA: Tämä funktio tallentaa listan localStorageen
// JSON.stringify muuttaa listan tekstimuotoon jotta se voidaan tallentaa
function tallenna() {
  localStorage.setItem('kauppalista', JSON.stringify(tuotteet));
  paivitaNaytto();
}

// Napin klikkaus — sama logiikka kuin ennen mutta tallennetaan nyt
button.addEventListener('click', function() {
  const teksti = input.value.trim();
  if (teksti === '') return;

  // UUTTA: Lisätään tuote listaan objektina jossa on nimi ja tila
  tuotteet.push({ nimi: teksti, tehty: false });
  tallenna();

  input.value = '';
  input.focus();
});

// Enter-näppäin — sama kuin ennen
input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    button.click();
  }
});

// UUTTA: Näytetään lista heti kun sivu aukeaa
paivitaNaytto();
