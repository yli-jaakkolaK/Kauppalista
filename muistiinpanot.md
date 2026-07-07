# Kauppalista / Satama — projektimuistiinpanot

## Mistä on kyse

Katrin opetusprojekti: jaettu kauppalista hänen ja miehensä välillä. Toimii PWA:na iPhonessa.
Projekti on myös **Satama-sovelluksen vaihe 1** — myöhemmin kasvaa isommaksi perheen toiminnanohjaussovellukseksi.

**Julkaistu:** https://kauppalista-nine.vercel.app
**Repo:** https://github.com/yli-jaakkolaK/Kauppalista (main-haara → auto-deploy Verceliin)
**Supabase projekti:** https://uctmxxeewoeydabuepye.supabase.co

---

## Tekninen kokonaisuus

- **Frontend:** Vanilla HTML/CSS/JS (ei frameworkia), PWA
- **Tietokanta:** Supabase (PostgreSQL), taulukko `tuotteet`
- **Hosting:** Vercel (staattiset tiedostot + serverless funktio)
- **Reaaliaikaisuus:** Supabase Realtime (postgres_changes)
- **Auth:** Supabase Auth, Google OAuth (lisätty 2025-07-06)
- **Git:** GitHub, `git config user.email = ylijaakkolak@gmail.com`

---

## Tietokannan rakenne

**Taulu: `tuotteet`**
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| id | int8 | pääavain, autoincrement |
| nimi | text | tuotteen nimi |
| tehty | bool | onko merkitty tehdyksi |
| bought_at | timestamptz | milloin merkittiin tehdyksi (null jos ei tehty) |
| list_id | uuid | viittaa `lists.id` — lisätty 2026-07-06 (Satama vaihe 1) |

**Taulu: `lists`** (lisätty 2026-07-06)
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| id | uuid | pääavain, default gen_random_uuid() |
| name | text | listan nimi |
| type | text | default 'checklist' |
| owner_id | uuid | viittaa auth.users, nullable |
| created_at | timestamptz | default now() |

Kauppalista-rivi on olemassa alusta asti (nimi tarkalleen `'Kauppalista'`) — Siri-API ja "ei voi poistaa" -logiikka tunnistavat sen tästä nimestä, ei erillisellä flagilla.

**Taulu: `list_members`** (lisätty 2026-07-06, ei vielä käytössä koodissa — jakamista varten myöhemmin)
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| list_id | uuid | viittaa lists.id, osa PK:ta |
| user_id | uuid | viittaa auth.users, osa PK:ta |
| role | text | default 'member' |
| created_at | timestamptz | default now() |

**Taulu: `events`** — tapahtumaloki (lisätty 2026-07-06)
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| id | bigint | pääavain, identity |
| created_at | timestamptz | default now() |
| user_id | uuid | nullable (null jos Siri tai lista poistettu) |
| action | text | 'added' / 'checked' / 'unchecked' / 'deleted' / 'created' |
| target_type | text | 'item' / 'list' |
| target_id | text | poistetun/muokatun rivin id merkkijonona |
| target_name | text | nimi talteen tekstinä (säilyy vaikka kohde poistetaan) |
| list_id | uuid | viittaa lists.id, **ei ON DELETE CASCADE/SET NULL** — ks. alla |
| duration_seconds | int | ei vielä käytössä |

⚠️ **FK-ansa:** `events.list_id` viittaa `lists(id)` ilman ON DELETE -sääntöä. Kun lista poistetaan, sovellus poistaa ensin sen `events`-rivit manuaalisesti (`poistaLista()` script.js:ssä) — muuten Postgres estäisi listan poiston FK-rikkomuksena. "Poistettu"-tapahtuma itse kirjataan `list_id: null`, koska sitä ei voi enää viitata olemattomaan listaan.

RLS ei ole käytössä yhdelläkään taululla — tarkoituksella (Siri API:n takia). **TODO: tämä pitää korjata ennen vaihe 1:n julkista käyttöä**, ks. lista lopussa.

---

## Tiedostorakenne

```
kauppalista/
├── index.html        — sovelluksen pohja, PWA meta-tagit
├── style.css         — kuitti-tyyli, tumma/vaalea automaattisesti
├── script.js         — kaikki logiikka (Supabase, listat, auth, offline)
├── manifest.json     — PWA: nimi "Kauppalista", teema #C9A84C, icon.png
├── sw.js             — service worker, välimuisti v9, offline-tuki
├── icon.png          — 512×512 PWA-ikoni
├── api/
│   └── add.js        — Vercel serverless, lisää tuotteen Kauppalistaan ILMAN autentikointia
├── sql/
│   └── 001_multilist_and_events.sql  — lists/list_members/events + tuotteet.list_id-migraatio
└── muistiinpanot.md  — tämä tiedosto
```

SQL-migraatiot ajetaan aina käsin Supabasen SQL Editorissa — Claude ei aja niitä itse, vain kirjoittaa tiedoston.

---

## index.html — rakenne

Neljä näkymää/elementtiä, kaikki `display:none` alussa paitsi dialogi joka on aina piilossa kunnes JS avaa sen. JS päättää kumpi kolmesta pääasettelusta näytetään (`showLoginView` / `showHomeView` / `showAppView`):

```html
<!-- 1. Kirjautumaton -->
<div id="login-view" style="display:none">
  <h1>✱ SATAMA ✱</h1>
  <hr class="divider">
  <button class="login-btn" id="login-btn">Kirjaudu Googlella</button>
</div>

<!-- 2. Kotinäkymä: kaikki listat (lisätty 2026-07-06) -->
<div class="container" id="home-view" style="display:none">
  <h1>✱ SATAMA ✱</h1>
  <hr class="divider">
  <ul class="list" id="home-list"></ul>
  <hr class="divider">
  <div class="add-item">
    <span class="prefix">›</span>
    <input type="text" id="new-list-input" placeholder="uusi lista...">
    <button id="new-list-btn">+</button>
  </div>
  <button id="signout-link">kirjaudu ulos</button>
</div>

<!-- 3. Listanäkymä: geneerinen, toimii millä tahansa list_id:llä -->
<div class="container" id="app-view" style="display:none">
  <div class="list-header">
    <button class="back-btn" id="back-btn">‹</button>
    <h1 id="list-title">✱ kauppalista ✱</h1>
  </div>
  <div class="subtitle" id="subtitle">ladataan...</div>
  <hr class="divider">
  <div class="add-item">
    <span class="prefix">›</span>
    <input type="text" placeholder="lisää tuote...">
    <button>+</button>
  </div>
  <ul class="list"></ul>
  <hr class="divider" id="footer-divider" style="display:none">
  <div class="list-footer" id="list-footer" style="display:none">
    <div class="footer-row">
      <div class="count" id="footer-count"></div>
      <button class="eye-btn" id="eye-btn" style="display:none"></button>
    </div>
  </div>
</div>

<!-- 4. Kuitti-tyylinen vahvistusdialogi (listan/tuotteen poisto), aina viimeisenä bodyssa -->
<div class="dialog-overlay" id="dialog-overlay" style="display:none">
  <div class="dialog-box">
    <p class="dialog-title" id="dialog-title"></p>
    <p class="dialog-body" id="dialog-body" style="display:none"></p>
    <div class="dialog-buttons">
      <button class="dialog-btn dialog-btn-cancel" id="dialog-cancel">Peru</button>
      <button class="dialog-btn dialog-btn-danger" id="dialog-confirm">Poista</button>
    </div>
  </div>
</div>
```

⚠️ **DOM-järjestys on merkityksellinen tässä:** `home-view` tulee HTML:ssä ennen `app-view`:ta, ja molemmilla on sama `.add-item`/`.list`-luokka. `script.js` hakee listanäkymän input/button/list-elementit `document.querySelector('#app-view .add-item input')` -tyylillä (rajattu `#app-view`-kontekstiin) — jos rajaus joskus katoaa refaktoroinnissa, valitsin osuu vahingossa kotinäkymän ensimmäiseen samannimiseen elementtiin eikä mikään Enter/+ -toiminto listanäkymässä toimi (tämä oli oikea bugi 2026-07-06, ks. historia-osio).

---

## style.css — design-systeemi

Kuitti-tyyli (Courier New), automaattinen tumma/vaalea `prefers-color-scheme`-mediakyselyn kautta.

**CSS-muuttujat:**
```css
/* Vaalea */
--ground: #F8F5EF;   /* tausta */
--text: #1A1A1A;     /* teksti */
--accent: #C8941A;   /* kulta, korostukset */
--muted: #B0AA9E;    /* harmaa, toissijainen teksti */
--border: #E0DDD6;   /* lista-erottimet */
--border-dash: #C8C3B8; /* katkoviiva-erottimet */

/* Tumma */
--ground: #1A2928;
--text: #F0EDE8;
--accent: #E8B84B;
--muted: #4D6B69;
--border: #2D4140;
--border-dash: #3A5250;
```

**Tärkeät luokat:**
- `.container` — max-width 400px, kaikki sisältö tässä
- `h1` — 26px, letter-spacing 0.24em, text-indent 0.24em (tasaus), accent-väri
- `.subtitle` — 14px, muted-väri, päivittyy JS:stä ("x jäljellä · y ostettu")
- `.sync-indicator` — offline/synk-tila, JS luo dynaamisesti divider-elementin eteen
- `.divider` — 1px dashed border-dash
- `.add-item` — lisäysrivi, input + + -nappi, min-height 52px
- `.list li` — jokainen tuote: check-btn (vasen) + span (teksti, keski) + delete-btn (oikea), min-height 52px
- `.check-btn` — ○/✓, 52×52px, muted/accent
- `.delete-btn` — ×, 52×52px, opacity 0.5
- `.edit-input` — inline muokkaus, border-bottom accent
- `.done` — yliviivaus + muted-väri
- `.history-time` — timestamp, 12px, muted
- `.list-footer .count` — "x KPL JÄLJELLÄ", accent, padding-left 24px
- `.eye-btn` — 52×52px SVG-silmäikoni, accent
- `.login-btn` — kirjautumisnappi, dashed border accent, hover täyttää
- `#signout-link` — "kirjaudu ulos", 11px, muted, opacity 0.5

---

## script.js — logiikka pääpiirteittäin

### Supabase-yhteys
```js
const db = createClient('https://uctmxxeewoeydabuepye.supabase.co', ANON_KEY);
```

### Näkymänvaihto (ylhäällä, heti db:n jälkeen)
```js
function showLoginView()  // login-view näkyy, home-view+app-view piilossa
function showHomeView()   // home-view näkyy, login-view+app-view piilossa
function showAppView()    // app-view näkyy, login-view+home-view piilossa
```

### Monilista-navigointi (lisätty 2026-07-06)
- `currentList` — muuttuja, sisältää avoinna olevan listan `{id, name, ...}`-olion, `null` jos ei mitään auki
- `LAST_LIST_KEY = 'kauppalista_viimeisin_lista'` localStorage:ssa — muistaa viimeksi avatun listan id:n
- `avaaLista(lista)` — asettaa currentList:n, kirjoittaa localStorageen, päivittää `#list-title`:n, kutsuu showAppView()+lataaLista()
- `lataaKotinakyma()` — hakee kaikki `lists`-rivit, piirtää ne `#home-list`:iin. Kauppalista-rivillä ei ole ×-poistonappia (tunnistetaan nimestä `'Kauppalista'`)
- `poistaLista(lista)` — hakee ensin tuotemäärän (count), näyttää vahvistusdialogin, ja **vasta hyväksynnän jälkeen** poistaa: tuotteet → events-rivit (FK-ansa, ks. tietokanta-osio) → itse lista. Kirjaa lopuksi `'deleted'/'list'`-tapahtuman `list_id: null`
- `siirryKirjautumisenJalkeen()` — kirjautumisen jälkeen: jos localStoragessa on viimeisin lista ja se löytyy DB:stä → avaaLista() suoraan; muuten showHomeView()
- `back-btn` (‹) palaa kotinäkymään, ei tyhjennä `currentList`/localStoragea — vain PWA:n uudelleenkäynnistys nollaa näkymän takaisin viimeisimpään listaan

### Vahvistusdialogi (lisätty 2026-07-06)
- `naytaVahvistus(otsikko, teksti, poistaTeksti)` — palauttaa `Promise<boolean>`. `teksti` näytetään vain jos annettu (esim. "Listalla on 3 asiaa — nekin poistuvat."), `poistaTeksti` on vahvistusnapin teksti ("Poista lista" / "Poista tuote"). Ulkopuolelle klikkaus tai Peru-nappi → `false`, Poista-nappi → `true`
- Käytössä sekä `poistaLista()`:ssa (listan poisto kotinäkymässä) että tuotteen delete-btn:n click-handlerissa (listan sisällä) — molemmat kysyvät ennen poistoa, kumpikaan ei enää poista suoraan

### Offline-jono
- `QUEUE_KEY = 'kauppalista_jono'` localStorage:ssa
- `addToQueue(action)` — lisää `{ type: 'insert'|'update'|'delete', data: {...} }` — insert-actionit kantavat mukanaan oikean `list_id`:n
- `processQueue()` — ajaa jonon läpi kun online tulee takaisin
- `updateSyncIndicator()` — näyttää/piilottaa "● ei yhteyttä" / "● synkronoidaan...". Kohdistaa hakunsa `#app-view .divider`-elementtiin (ei pelkkään `.divider`), koska login-view/home-view sisältävät myös `.divider`-elementtejä

### Tapahtumaloki (lisätty 2026-07-06)
- `logEvent(action, targetType, targetId, targetName, listId)` — fire-and-forget insert `events`-tauluun, virheet vaietaan (`.then(ok, virhe)`). `user_id` otetaan `currentUserId`-muuttujasta (päivittyy auth-tilan mukana)
- Kutsutaan: tuote lisätty/checked/unchecked/poistettu, lista luotu/poistettu

### Lista-funktiot
- `lataaLista()` — hakee `currentList.id`:n tuotteet Supabasesta (`.eq('list_id', currentList.id)`), päivittää cachedTuotteet. Palaa heti jos `currentList` on null
- `paivitaNaytto(tuotteet)` — renderöi listan, huomioi historyOpen-tilan
- `paivitaFooter(tuotteet)` — päivittää subtitlen ja footer-counterin
- `showHistory()` — hakee ostetut bought_at-järjestyksessä samalta listalta, renderöi historian

### Realtime
```js
const realtimeChannel = db.channel('tuotteet')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tuotteet' }, () => {
    if (currentList) lataaLista();
  })
  .subscribe();
```
Ei suodateta list_id:n mukaan kanavatasolla — mikä tahansa muutos triggeröi `lataaLista()`:n, joka itse suodattaa oikean listan. Yksinkertainen mutta toimiva niin kauan kuin listoja on vähän. PWA-taustatila -korjaus: `visibilitychange`-kuuntelija re-subscribee jos yhteys katki.

### Auth (lopussa)
```js
db.auth.getSession()          // tarkistaa session sivun latautuessa
db.auth.onAuthStateChange()   // reagoi kirjautumiseen/uloskirjautumiseen
// login-nappi: signInWithOAuth({ provider: 'google', redirectTo: window.location.origin })
// signout-linkki: signOut()
```
Molemmat kutsuvat `siirryKirjautumisenJalkeen()`:ää (ei enää suoraan `showAppView()`:ta) — reitittää kotiin tai viimeisimpään listaan.

---

## api/add.js — Siri-integraatio

Vercel serverless -funktio, ei vaadi autentikointia (tarkoituksella):

```
POST /api/add
Body: { "nimi": "maito" }
Response: { "success": true }
```

Käyttää Supabase REST API:a suoraan (ei supabase-js:ää). CORS kaikille (`*`).
Siri Shortcut kutsuu tätä endpointia puhekomennolla.

Päivitetty 2026-07-06: hakee ensin Kauppalistan id:n (`GET /rest/v1/lists?name=eq.Kauppalista`) ja asettaa sen lisättävän tuotteen `list_id`:ksi, sitten kirjaa `'added'/'item'`-tapahtuman `events`-tauluun `user_id: null`:lla (Siri ei tiedä käyttäjää). Tapahtumakirjaus on `try/catch`:n sisällä — jos se epäonnistuu, itse lisäys onnistuu silti.

---

## Google OAuth -konfigurointi

Tehty 2025-07-06:
- Supabase: Authentication → Providers → Google → enabled
- Google Cloud -projekti: "Satama"
- Callback URL Supabasesta lisätty Google Cloud Consoleen
- Authorized origin: https://kauppalista-nine.vercel.app

---

## Toiminnot käyttäjälle

**Kotinäkymä** (lisätty 2026-07-06):
- Kirjautumisen jälkeen näytetään kaikki listat (paitsi jos localStorage muistaa viimeksi avatun listan → mennään suoraan sinne)
- Rivin napautus avaa listan
- "uusi lista..." + -rivi luo uuden listan
- × listan rivillä (paitsi Kauppalistalla) → vahvistusdialogi → poistaa listan tuotteineen

**Lista** (toimii nyt millä tahansa listalla, ei vain Kauppalistalla):
- ‹-nuoli otsikon vieressä → takaisin kotinäkymään
- ○ vasemmalla → merkitsee tehdyksi (tallentaa bought_at-leiman)
- Tekstitappi → inline muokkaus, Enter tallentaa, Esc peruuttaa
- × oikealla → **vahvistusdialogi** ("Poistetaanko [nimi]?") → vasta hyväksynnän jälkeen poistaa (lisätty 2026-07-06, ennen poisti suoraan)
- Ostetut näkyvät yliviivattuna aikaleimojen kera
- Silmänappi footerissa → näyttää/piilottaa ostetut

**Vahvistusdialogi** (lisätty 2026-07-06, korvasi selaimen natiivin `confirm()`:n):
- Kuitti-tyylinen overlay: katkoviivareunat, teeman taustaväri, Peru (turvallinen, dashed-aksentti) + punainen Poista-nappi
- Ulkopuolelle klikkaus = peru
- Käytössä sekä listan että yksittäisen tuotteen poistossa

**Auth:**
- Kirjautumaton: näkee "✱ SATAMA ✱" + "Kirjaudu Googlella"
- Kirjautunut: näkee koti- tai listanäkymän
- "kirjaudu ulos" -linkki kotinäkymän alalaidassa (siirretty pois listanäkymästä 2026-07-06)

**Offline:**
- Muutokset menevät jonoon, näyttää "● ei yhteyttä"
- Yhteyden palautuessa synkkaa automaattisesti

---

## PWA

- manifest.json: name "Kauppalista", theme_color "#C9A84C"
- sw.js: cache version **v9** (2026-07-06) — nostettava aina kun index.html/style.css/script.js/icon.png muuttuu, muuten käyttäjä näkee vanhaa versiota vielä pitkään
- iPhone: kotinäytöltä aukeaa kuin natiivi appi

---

## Satama 2.0 — seuraavat vaiheet

Isompi visio: ADHD-päin rakennettu perheen toiminnanohjausjärjestelmä.

**Lukittu rakennusjärjestys:**
1. **Listat** (nyk. nimeltään "Muistilaput", oma näkymä — ei enää suoraan etusivulla, ks. "Etusivu"-osio) ← TÄSSÄ NYT
   - Kirjautuminen ✓
   - Monikko (koti + useita listoja, luonti/poisto) ✓ (2026-07-06)
   - Tapahtumaloki ✓ (2026-07-06)
   - Uudelleennimeäminen (✎ kotinäkymässä, ei Kauppalistalle) ✓ (2026-07-06)
   - Väliotsikot listan sisällä (`#`-etuliite tuotteen nimessä → lihavoitu, ei checkboxia, ei osu jäljellä/ostettu-laskuriin) ✓ (2026-07-07)
   - Rivien raahausjärjestys (pitkä painallus, sort_order-sarake) ✓ (2026-07-07)
   - Otsikon alle kohdistettu lisäys (napauta otsikkoa → uudet rivit sen alle) ✓ (2026-07-07)
   - Näkyvyysmalli + RLS ✓ koodissa ja ajettu Supabasessa (2026-07-07)
   - Laituri (yhteinen muistilista, oma näkymä kotinäkymän kautta) ✓ koodissa, ⏳ SQL ajamatta (008/009, ks. TODO)
   - Etusivun uudelleensuunnittelu: Ankkurit + Horisontissa + 2×3-navigointiruudukko ✓ koodissa, ⏳ SQL ajamatta — ks. "Etusivu"-osio alla
   - Jakaminen kolmansille (list_members + kutsulinkki) — taulu valmiina, EI kuulu E1:n valmiusehtoihin, ei UI:ta vielä
2. Tehtävät + push-ilmoitukset + kiertoseuranta
3. Siri-äly (Claude API)
4. Nostot / Odottaa / Ruoka
5. Muistiinpanot / Opiskelu-AI / Palautuminen

**Seitsemän "paikkaa" lopullisessa Satamassa:**
1. Laituri — keskeneräiset ajatukset (yhteinen)
2. Listat — kauppalista ym., listakohtainen jako
3. Tehtävät — hoidettavat, Ankkurit ⚓ ylimpänä
4. Nostot — kodin huoltokirja + vuosikello
5. Ruoka — reseptipankki, viikkorytmi, hävikkivahti
6. Odottaa vastaustani — paluukyselyt
7. Muistiinpanot — elävät muistiinpanot

---

## Tunnettuja asioita / historiaa

- Vercel-deployt vaativat `git config user.email = ylijaakkolak@gmail.com`
- Supabase Realtime vaatii Replication päällä tuotteet-taululle (jo tehty)
- PWA-välimuisti: service workerin cache-versio pitää bumppata kun tekee isoja muutoksia
- Poisto- ja checkmark-nappien `appearance: none; -webkit-appearance: none` tärkeä mobiililla
- `letter-spacing` lisää tilaa viimeisen merkin jälkeen → `text-indent` samalla arvolla korjaa h1:n ja subtitlen keskityksen optisesti
- Siri API jätetään tarkoituksella ilman autentikointia, vaikka muu sovellus vaatii kirjautumisen

**2026-07-06, Satama vaihe 1 -sessio:**
- Google-kirjautumisen redirect meni väärään osoitteeseen (`localhost:3000`) koska Supabasen Site URL / Redirect URLs -asetukset eivät sisältäneet Vercel-osoitetta — korjattava Supabasen dashboardista, ei koodista
- **Vakava DOM-valitsinbugi:** kun kotinäkymä (`home-view`) lisättiin HTML:ään ennen listanäkymää (`app-view`), rajaamattomat `document.querySelector('.add-item input')` ym. -haut osuivat vahingossa kotinäkymän elementteihin. Seuraus: Enter/+ eivät toimineet YHDELLÄKÄÄN listalla, myös Kauppalistalla, koska koko lisäysrivi ja itemlista renderöityivät piilotettuun kotinäkymän elementtiin. Korjaus: kaikki listanäkymän DOM-haut rajattava `#app-view`-kontekstiin. Opetus: kun UI:hin lisätään useita näkymiä samoilla CSS-luokilla, KAIKKI `document.querySelector`-haut pitää tarkistaa/rajata, ei vain uusia lisättäessä
- **FK-ansa listan poistossa:** `events.list_id` viittaa `lists(id)` ilman ON DELETE -sääntöä → listan poisto epäonnistui heti kun sillä oli lokitapahtumia (aina, koska jo listan luonti kirjaa tapahtuman). Korjaus sovelluskoodissa (poistetaan listan events-rivit ensin), ei tarvinnut uutta SQL-migraatiota
- Testausmenetelmä joka löysi molemmat yllä olevat bugit: Playwright + headless Chromium ajettuna oikeaa tuotanto-Supabasea vasten (samat anon-oikeudet kuin sovelluksella itsellään, koska RLS pois päältä), testidata siivottu jälkikäteen REST-kutsuilla. Pelkkä koodin lukeminen / staattinen analyysi ei olisi löytänyt kumpaakaan
- Kaksi eri ×-nappia sovelluksessa (listan poisto kotinäkymässä vs. tuotteen poisto listan sisällä) käyttävät samaa symbolia ja delete-btn-luokkaa — helposti sekoittuvat kun keskustellaan "×:stä" ilman tarkennusta kummasta puhutaan
- PWA:n service worker -välimuisti pitää bumpata JOKA KERTA kun index.html/style.css/script.js/icon.png muuttuu — unohtuu helposti, tuli vastaan monta kertaa tässä sessiossa (v4 → v9)

## Pääsynhallinta (2026-07-07)

**Malli:** yksityinen oletuksena, tietoinen jako. `lists.visibility` = `'private'` (oletus, uusi lista syntyy AINA näin, ei valintaa luontihetkellä) tai `'shared'` (näkyy koko perheelle — käytännössä Katri + Juha). Jako tapahtuu listan asetuksista (🔒/⚓-nappi listanäkymän otsikkorivillä oikealla) — iOS-tyylinen vihreä kytkin, ei mitään muuta valintaa.

- Yhteisessä listassa KUKA TAHANSA näkevä saa lisätä/täpätä/muokata/poistaa RIVEJÄ. Vain listan omistaja hallinnoi listaa itseään (nimi, näkyvyys, poisto).
- Kolmansien osapuolten kutsuminen (`list_members` + kutsulinkki/koodi) EI kuulu E1:een — taulu ja RLS-policyt ovat valmiina sitä varten, mutta ei UI:ta eikä kutsulogiikkaa vielä.
- Backfill-periaate: kaikki jo olemassa olevat listat (Kauppalista, Siivouslista, Vuosikello) merkitään `visibility='shared'` migraatiossa 003, jotta mikään ei katoa Juhalta RLS:n kytkeytyessä.
- Sama näkyvyysperiaate tulee myöhemmin muihinkin osioihin: Laituri = aina yhteinen (ei kytkintä), Ruoka = aina yhteinen, Muistiinpanot (E8) = kuten listat (omat + jaetut), Hytti (opiskelu/työ-muistiinpanot, myöhempi osio) = aina yksityinen omistajalleen.
- **Testaa ehdottomasti molemmilla tileillä RLS:n käyttöönoton jälkeen:** yhteinen lista näkyy molemmille, yksityinen EI näy toiselle. Claude ei pysty testaamaan tätä itse (ei pääsyä kahteen oikeaan Google-tiliin).

## Laituri (2026-07-07)

Yhteinen "keskeneräisten ajatusten" muistilista, aina näkyvissä molemmille (ei näkyvyyskytkintä). Oma taulu `laituri` (id, user_id, content, status 'uusi'/'sijoitettu', placed_where, created_at). Kotinäkymässä linkki + merkki (uusien lukumäärä). Kategorisointi ei poista riviä — se himmenee ja saa merkinnän "→ [minne]". Tekstihaku `ilike`-kyselyllä, 250ms debounce.

E1-versio on kevyt: yksi kenttä + tallennus, lista alle, ei vielä sijoitus-kohteen valintaa listasta (käytetään `prompt()`:ia "minne sijoitit" -kysymykseen). Voi tarkentaa myöhemmin.

## Etusivu (2026-07-07, uudelleensuunniteltu)

Etusivu EI ole navigointivalikko vaan päivittäinen komentokeskus. Rakenne ylhäältä alas:

1. **Otsikko + päivämäärä** (`paivitaPaivamaara()`, suomeksi, ei kovakoodattua kellonaikaa/säätä — säätä ei tarkoituksella ole ollenkaan)
2. **Ankkurit** — päivän 3 tärkeintä. Oma kevyt taulu `ankkurit` (content, done, sort_order, `source`/`source_ref` valmiina tulevaa automaattista poimintaa varten — Wilma-sähköposti/kalenteri, vaihe 3/Siri-äly, EI rakennettu vielä). Kysely on aina `done=false order by sort_order limit 3` — kun yksi merkitään tehdyksi, seuraava nousee näkyviin ilman erillistä "ylennyslogiikkaa", samaan tapaan kuin ostoslistan rastitetut tuotteet katoavat ja paljastavat seuraavat.
3. **Horisontissa** — "asiat jotka alkavat kaivata huomiota" (EI kalenterin erääntymislista). Toistaiseksi vain tyhjä tila (`#horisontissa-empty`), koska syöttävät järjestelmät (vuosikello, siivoussuunnitelma) eivät ole vielä älykkäitä. **Tärkeä havainto:** raakadata tähän on jo olemassa — jokainen rastitus kirjautuu `events`-tauluun aikaleimalla, joten "milloin jääkaappi viimeksi pyyhitty" on jo laskettavissa nykyisestä datasta. Päättelylogiikka (opitaan toistuva rytmi normaalin arjen mukaan, ei ideaalin mukaan) on oma myöhempi ongelmansa.
4. **Navigointiruudukko (2×3)**, data-ohjattu taulusta `home_sections` (key, name, icon, route, enabled, sort_order) — EI kovakoodattuja HTML-lohkoja. Järjestys/nimi/ikoni muutettavissa pelkällä SQL-päivityksellä ilman koodimuutosta. Täyttöjärjestys vasemmalta oikealle, riviltä riville: Laituri | Muistilaput / Varasto | Oma Hytti / Kalenteri | Asetukset. Vain `laituri` ja `muistilaput` ovat toiminnallisia — loput näyttävät `alert("X tulossa pian.")`.

**Tärkeä nimikkeistömuutos:** "Listat" ei ole enää oma käsitteensä — se on nyt **Muistilaput**, oma näkymänsä (`#muistilaput-view`, avataan ruudukon laatasta), EI enää suoraan etusivulla. `lataaKotinakyma()` lataa vain etusivun (ruudukko+Ankkurit+päivämäärä); `lataaMuistilaput()` on eri funktio joka lataa listat Muistilaput-näkymään. Listanäkymän (`app-view`) takaisin-nuoli palaa nyt Muistilaput-näkymään, ei etusivulle — navigointipolku on Etusivu → Muistilaput → yksittäinen lista.

Ankkurit/Horisontissa-otsikot ovat toistaiseksi kiinteitä koodissa (ei omaa data-riviä) — voidaan muuttaa muokattaviksi myöhemmin jos tarpeen, ei ole ison lisätyön takana.

## TODO ennen etapin 1 valmistumista (määräaika 23.7.2026 — kehityskone palautuu silloin)

- [x] Aja `sql/003_row_level_security.sql`, `005_fix_rls_recursion.sql`, `006_fix_shared_requires_auth.sql` (näkyvyysmalli + RLS, korjattu rekursio ja anon-vuoto) — ajettu 2026-07-07
- [x] Hae service_role-avain ja aseta `SUPABASE_SERVICE_KEY` Verceliin — tehty, Siri vahvistettu toimivaksi RLS:n kanssa
- [x] Aja `sql/007_sort_order.sql` (raahausjärjestys) — ajettu
- [ ] Aja `sql/004_laituri.sql` (Laituri-taulu)
- [ ] Aja `sql/008_home_sections.sql` (navigointiruudukko) ja `sql/009_ankkurit.sql` (Ankkurit)
- [ ] Testaa molemmilla tileillä (Katri + Juha): yhteinen lista näkyy kahdelle, yksityinen ei näy toiselle
- [ ] Suunnitteluperiaate koko loppuprojektille: kaikki säädettävä (välit, kellonajat, rajat) dataan/tauluihin, EI kovakoodata — sovellusta pitää voida muokata ilman koodimuutoksia 23.7. jälkeen
- [ ] Raahausjärjestys navigointiruudukolle itselleen (home_sections.sort_order on jo olemassa, mutta raahaus-UI on toteutettu toistaiseksi vain listan sisäisille riveille)