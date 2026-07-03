# Kauppalista-projekti

## Tehty
- Vaihe 1: HTML & CSS - ulkoasu valmis
- Vaihe 2: JavaScript - lisäys, poisto, yliviivaus toimii
- Vaihe 3: localStorage - lista muistaa tuotteet (poistettu käytöstä Supabasen myötä)
- Vaihe 4: GitHub - koodi tallessa GitHubissa
- Vaihe 5: Vercel - kauppalista-nine.vercel.app ✓
- Vaihe 6: Supabase - jaettu lista reaaliajassa miehen kanssa ✓
- Vaihe 7: PWA - toimii appina iPhonessa, ikoni kotinäytöllä ✓
- Vaihe 8: Offline-tuki - toimii ilman nettiä, synkkaa kun yhteys palaa ✓

## Supabase-tiedot
- Project URL: https://uctmxxeewoeydabuepye.supabase.co/

## Tilanne nyt (Claude-muistio)

Sovellus on valmis peruskäyttöön. Toimii PWA:na iPhonessa, synkkaa reaaliajassa, toimii myös offline.

**Nykytila tiedostoittain:**
- `index.html` — otsikko "✱ kauppalista ✱", subtitle (x jäljellä · y ostettu), lisäyskenttä (› + nappi), lista, footer (x KPL JÄLJELLÄ + silmänappi)
- `style.css` — kuitti-tyyli (Courier New), automaattinen tumma/vaalea tila (prefers-color-scheme), mobiilioptimoitu (52×52px napit)
- `script.js` — Supabase, Realtime, offline-jono (localStorage), lataa/lisää/poista/muokkaa/toggle
- `manifest.json` — PWA-asetukset
- `sw.js` — service worker, välimuisti, offline-tuki
- `icon.png` — sovelluksen ikoni

**Jokainen listan rivi:**
- ○/✓ vasemmalla → merkitsee tehdyksi (tallentaa bought_at-aikaleiman)
- teksti keskellä → napautus avaa muokkauksen (inline edit, Enter tallentaa)
- × oikealla → poistaa

**Silmänappi footerissa:**
- Näyttää/piilottaa ostetut tuotteet aikaleimoilla
- Ostetut näkyvät yliviivattuna kellonajan kera

**Offline:**
- Muutokset jonoon (kauppalista_jono, localStorage)
- "● ei yhteyttä" / "● synkronoidaan..." indikaattori
- Yhteys palaa → automaattinen synkronointi

**Tekninen muistio:**
- git user.email: ylijaakkolak@gmail.com
- Vercel kytketty GitHubiin automaattideployllä (push → päivittyy ~1min)
- Supabase Realtime päällä tuotteet-taulukolle

## Seuraavaksi (ideoita)
- Shortcuts-automaatiot (sijainti, Siri)
- Historia-näkymä ostohistoriasta aikajärjestyksessä

## Tekniset valinnat
- Supabase (PostgreSQL) tietokantana
- PWA eikä natiivi appi
- GitHub + Vercel + Supabase — kaikki ilmaisia

## Muistutukset 2.0 — Suunnitelma

### Perusrakenne
- Useita listoja (luo, nimeä, poista, väri/ikoni)
- Kirjautuminen Google-tilillä
- Jakaminen sähköpostilla

### Muistutukset
- Rulla-systeemi: 15min → 1 vuosi (ei valmiita vaihtoehtoja)
- Oletuksena: siirtyy seuraavaan päivään jos tekemättä
- Voi valita siirtyykö vai toistuuko normaalisti
- Snooze-toiminto
- Prioriteetti

### Kodin huoltokirja
- Lisää tehtäviä suositelulla välillä (esim. jääkaapin takana siivous → 6kk)
- Historia tallentaa milloin tehty
- Sovellus huomaa jos väli ylittyy → ehdottaa lisäämistä listalle
- "Jääkaapin takana siivous — viimeksi 8kk sitten, haluatko lisätä listalle?"
- Jaettu miehen kanssa — molemmat näkee kodin tilanteen

### Vaiheet
1. Kirjautuminen (Google-login Supabasella)
2. Useita listoja
3. Jakaminen
4. Muistutukset + rulla-systeemi
5. Kodin huoltokirja + historia
