# Kauppalista-projekti

## Tehty
- Vaihe 1: HTML & CSS - ulkoasu valmis
- Vaihe 2: JavaScript - lisäys, poisto, yliviivaus toimii
- Vaihe 3: localStorage - lista muistaa tuotteet selaimen sulkemisen jälkeen + × nappi poistoon
- Vaihe 4: GitHub - koodi tallessa GitHubissa
- Vaihe 5: Vercel - kauppalista-nine.vercel.app ✓
- Vaihe 6: Supabase - tietokanta luotu, taulukko "tuotteet" valmis
- supabase.com  password AS@m9+vh2-vi-ne
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG14eGVld29leWRhYnVlcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjI1NDYsImV4cCI6MjA5ODQ5ODU0Nn0.oJLbtc2BDTqwKu-Ih8ahZMM-s-XpqGvULV5ENGhDYJU
Project URL: https://uctmxxeewoeydabuepye.supabase.co/

## Tilanne nyt (Claude-muistio)

Supabase-integraatio on tehty ja toimii. localStorage on poistettu kokonaan — kaikki data menee Supabasen `tuotteet`-taulukkoon. Katri ja mies näkevät saman listan reaaliajassa ilman refreshiä (Supabase Realtime päällä).

**Nykytila tiedostoittain:**
- `index.html` — rakenne: otsikko "✱ kauppalista ✱", subtitle (x jäljellä · y ostettu), lisäyskenttä, lista, footer-laskuri
- `style.css` — kuitti-tyyli (Courier New -fontti), automaattinen tumma/vaalea tila (`prefers-color-scheme`), mobiilioptimoitu (napit min 52×52px)
- `script.js` — Supabase-yhteys, lataa/lisää/poista/muokkaa/toggle-tehty, Realtime-subscription

**Jokainen listan rivi:**
- ○/✓ vasemmalla → merkitsee tehdyksi/tekemättömäksi
- teksti keskellä → napautus avaa muokkauksen (inline edit, tallennus Enterillä tai blur)
- × oikealla → poistaa

**Tekninen muistio:**
- git user.email on nyt ylijaakkolak@gmail.com (piti korjata koska Vercel blokkasi väärän emailin)
- Vercel on kytketty GitHub-repoon automaattideployllä (push → Vercel päivittyy ~1min)

## Seuraavaksi

- Vaihe 7: PWA - näyttää oikealta apilta iPhonessa
- Vaihe 8: Shortcuts-automaatiot (sijainti, Siri)
- Vaihe 9: Offline-tuki (tärkeä koska käytän lentokonetilaa!)

## Muistilista myöhemmin
- Historia-toiminto: näkymä ostetuista tuotteista aikajärjestyksessä (vähän niinkuin iphonen muistutukset)

## Tekniset valinnat
- localStorage nyt, Supabase myöhemmin
- PWA eikä natiivi appi
- GitHub + Vercel + Supabase kaikki ilmaisia

