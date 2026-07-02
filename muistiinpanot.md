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
- supabase.com password: AS@m9+vh2-vi-ne
- anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG14eGVld29leWRhYnVlcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjI1NDYsImV4cCI6MjA5ODQ5ODU0Nn0.oJLbtc2BDTqwKu-Ih8ahZMM-s-XpqGvULV5ENGhDYJU

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
