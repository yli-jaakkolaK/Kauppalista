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
| list_id | uuid | viittaa `lists.id` |
| is_header | bool | default false — väliotsikko (`#`-etuliite lisättäessä), ei checkboxia, ei osu jäljellä/ostettu-laskuriin (002) |
| sort_order | double precision | manuaalinen järjestys, oletus = kellonaika sekunteina (uusi rivi menee aina loppuun) (007) |

**Taulu: `lists`**
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| id | uuid | pääavain, default gen_random_uuid() |
| name | text | listan nimi |
| type | text | default 'checklist' |
| owner_id | uuid | viittaa auth.users |
| created_at | timestamptz | default now() |
| visibility | text | 'private' (oletus) / 'shared' — ks. Pääsynhallinta-osio (003) |
| category | text | 'muistilaput' (oletus) / 'varasto' — sama lists/tuotteet-rakenne molemmille, vain suodatus eri (010) |
| sort_order | double precision | manuaalinen järjestys Muistilaput/Varasto-näkymissä, sama periaate kuin tuotteet.sort_order (011) |

Kauppalista-rivi on olemassa alusta asti (nimi tarkalleen `'Kauppalista'`) — Siri-API ja "ei voi poistaa/nimetä uudelleen" -logiikka tunnistavat sen tästä nimestä, ei erillisellä flagilla.

**Taulu: `list_members`** (ei vielä käytössä koodissa — kolmansien osapuolten jakamista varten myöhemmin, EI kuulu E1:een)
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| list_id | uuid | viittaa lists.id, osa PK:ta |
| user_id | uuid | viittaa auth.users, osa PK:ta |
| role | text | default 'member' |
| created_at | timestamptz | default now() |

**Taulu: `events`** — tapahtumaloki
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| id | bigint | pääavain, identity |
| created_at | timestamptz | default now() |
| user_id | uuid | nullable (null jos Siri tai lista poistettu) |
| action | text | 'added' / 'checked' / 'unchecked' / 'deleted' / 'created' / 'renamed' / 'shared' / 'unshared' / 'moved_to_varasto' / 'moved_to_muistilaput' |
| target_type | text | 'item' / 'list' / 'header' |
| target_id | text | poistetun/muokatun rivin id merkkijonona |
| target_name | text | nimi talteen tekstinä (säilyy vaikka kohde poistetaan) |
| list_id | uuid | viittaa lists.id, **ei ON DELETE CASCADE/SET NULL** — ks. alla |
| duration_seconds | int | ei vielä käytössä |

⚠️ **FK-ansa:** `events.list_id` viittaa `lists(id)` ilman ON DELETE -sääntöä. Kun lista poistetaan, sovellus poistaa ensin sen `events`-rivit manuaalisesti (`poistaLista()` script.js:ssä) — muuten Postgres estäisi listan poiston FK-rikkomuksena. "Poistettu"-tapahtuma itse kirjataan `list_id: null`.

**Taulu: `laituri`** — yhteinen muistilista (004), ks. Laituri-osio alla.

**Taulu: `home_sections`** — navigointiruudukon rivit (008), ks. Etusivu-osio alla.

**Taulu: `ankkurit`** — päivän tärkeimmät (009, 013), ks. Etusivu-osio alla.

**Taulu: `kalenteri_tapahtumat`** — oma sisäinen kalenteri (012), ks. Kalenteri-osio alla.

RLS on käytössä KAIKILLA tauluilla (kytketty 2026-07-07, ks. Pääsynhallinta-osio). Siri-API käyttää service_role-avainta joka ohittaa RLS:n kokonaan.

---

## Tiedostorakenne

```
kauppalista/
├── index.html        — sovelluksen pohja, PWA meta-tagit
├── style.css         — kuitti-tyyli, tumma/vaalea automaattisesti
├── script.js         — kaikki logiikka (Supabase, listat, auth, offline)
├── manifest.json     — PWA: nimi "Kauppalista", teema #C9A84C, icon.png, orientation "portrait"
├── sw.js             — service worker, välimuisti v24, offline-tuki, auto-reload uudesta versiosta
├── icon.png          — 512×512 PWA-ikoni
├── api/
│   └── add.js        — Vercel serverless, lisää tuotteen Kauppalistaan (service_role-avain)
├── sql/
│   ├── 001_multilist_and_events.sql   — lists/list_members/events + tuotteet.list_id
│   ├── 002_item_headers.sql           — tuotteet.is_header (väliotsikot)
│   ├── 003_row_level_security.sql     — näkyvyysmalli + RLS + backfill
│   ├── 004_laituri.sql                — laituri-taulu
│   ├── 005_fix_rls_recursion.sql      — korjaa lists<->list_members-rekursion
│   ├── 006_fix_shared_requires_auth.sql — korjaa shared-näkyvyyden anon-vuodon
│   ├── 007_sort_order.sql             — tuotteet.sort_order (raahaus)
│   ├── 008_home_sections.sql          — navigointiruudukon rivit
│   ├── 009_ankkurit.sql               — ankkurit-taulu
│   ├── 010_varasto.sql                — lists.category + 2 esimerkkilistaa
│   ├── 011_lists_sort_order.sql       — lists.sort_order (raahaus)
│   ├── 012_kalenteri.sql              — kalenteri_tapahtumat-taulu
│   └── 013_ankkuri_aika.sql           — ankkurit.event_time
└── muistiinpanot.md  — tämä tiedosto
```

SQL-migraatiot ajetaan aina käsin Supabasen SQL Editorissa — Claude ei aja niitä itse, vain kirjoittaa tiedoston. Numerointi on ajojärjestyksen ehdotus, ei aina pakollinen riippuvuus — esim. 011 ja 012 eivät riipu toisistaan.

---

## index.html — rakenne

Yhdeksän näkymää/elementtiä, kaikki `display:none` alussa. Yksi yhteinen apufunktio piilottaa kaikki (`piilotaKaikkiNakymat()`), ja jokainen `showXView()` kutsuu sitä ja näyttää vain omansa — helpompi pitää synkassa kuin toistaa piilotuslogiikka joka funktiossa:

1. `#login-view` — kirjautumaton, "Kirjaudu Googlella"
2. `#home-view` — etusivu: päivämäärä, Ankkurit, Horisontissa, navigointiruudukko (`#sections-list`). Listat EIVÄT ole täällä (ks. Etusivu-osio)
3. `#muistilaput-view` — listojen (category='muistilaput') listaus + uuden luonti
4. `#varasto-view` — sama kuin Muistilaput mutta category='varasto'
5. `#kalenteri-view` — päivä/viikko/kuukausinäkymät
6. `#laituri-view` — yhteinen muistilista
7. `#app-view` — geneerinen listanäkymä, toimii millä tahansa list_id:llä (Kauppalista, Siivouslista, mikä tahansa Muistilaput/Varasto-lista)
8. `#dialog-overlay` — kuitti-tyylinen vahvistusdialogi (poistot)
9. `#settings-overlay` — listan omat asetukset (näkyvyyskytkin + kategorian vaihto)

⚠️ **DOM-järjestys on merkityksellinen:** useat näkymät jakavat samoja CSS-luokkia (`.add-item`, `.list`). `script.js` hakee `app-view`:n input/button/list-elementit `document.querySelector('#app-view .add-item input')` -tyylillä (rajattu kontekstiin) — jos rajaus joskus katoaa refaktoroinnissa, valitsin osuu vahingossa väärän näkymän ensimmäiseen samannimiseen elementtiin (tämä oli oikea bugi 2026-07-06, ks. historia-osio). Muiden näkymien omat listat/inputit on nimetty uniikeilla id:illä (`#muistilaput-list`, `#varasto-list`, `#ankkurit-list`, `#laituri-list`) juuri tämän luokkatörmäyksen välttämiseksi.

**Navigointipolku:** Etusivu → (ruudukon laatta) → Muistilaput/Varasto/Laituri/Kalenteri → (listarivi) → yksittäinen lista (`app-view`). `app-view`:n takaisin-nuoli palaa sinne mistä lista avattiin (`listanAvausLahde`-muuttuja, arvo 'muistilaput' tai 'varasto'), ei aina etusivulle.

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
- `lataaLista()` — hakee `currentList.id`:n tuotteet Supabasesta (`.eq('list_id', currentList.id).order('sort_order')`), päivittää cachedTuotteet. Palaa heti jos `currentList` on null TAI raahaus on kesken (`raahattavaRivi`). Tarkistaa `error`-kentän ja pysyy ennallaan virhetilanteessa (ei kutsu `paivitaNaytto(null)`, joka kaataisi sovelluksen — tämä oli oikea bugi, ks. historia)
- `paivitaNaytto(tuotteet)` — renderöi listan, huomioi historyOpen-tilan ja väliotsikot (is_header). Palaa heti jos raahaus on kesken
- `paivitaFooter(tuotteet)` — päivittää subtitlen ja footer-counterin, ei laske väliotsikoita mukaan
- `showHistory()` — hakee ostetut bought_at-järjestyksessä samalta listalta (dead code, ei kutsuta mistään toistaiseksi)
- `laskeLisaysJarjestys()` / `valitseLisaysKohde(tuote)` — otsikon alle kohdistettu lisäys: napauta väliotsikkoa → `aktiivinenOtsikkoId` asettuu, uudet rivit saavat `sort_order`-arvon otsikon ja seuraavan rivin välistä (midpoint-laskenta)

### Yleistetty raahauslogiikka (pitkä painallus + siirto)
`alustaRaahaus(li, kohde, asetukset)` missä `asetukset = {container, cache, taulu, jalkeenPaivitys}` — SAMA koodi toimii kaikkialla missä on `sort_order`-sarake:
- Listan tuoterivit (`tuotteet`-taulu, `#app-view .list`)
- Ankkurit (`ankkurit`-taulu, `#ankkurit-list`)
- Muistilaput/Varasto-listarivit (`lists`-taulu, `#muistilaput-list`/`#varasto-list`)
- Navigointiruudukon laatat (`home_sections`-taulu, `#sections-list`)

Tekniset yksityiskohdat:
- Kosketus (touch) "lukittuu" alkuperäiseen elementtiin automaattisesti; hiiri EI, joten hiirellä `mousemove`/`mouseup` kuunnellaan `document`:sta raahauksen ajan (lisätty jälkikäteen kun havaittiin ettei raahaus toiminut ollenkaan tietokoneen selaimessa)
- 450ms pitkän painalluksen kynnys, 10px liike ennen kynnystä tulkitaan skrollaukseksi ja peruu ajastimen
- `estaKlikkausJosRaahattiin` käyttää `stopImmediatePropagation()`:ia (ei pelkkää `stopPropagation()`:ia) — muuten sama-elementin muut klikkauskuuntelijat (esim. otsikon valinta) laukeaisivat raahauksen jälkeenkin
- Globaali `raahattavaRivi`-muuttuja: kun se on asetettu, `paivitaNaytto`/`lataaAnkkurit`/`lataaOsiot`/`lataaListatNakymaan` palaavat heti eivätkä piirrä mitään uudelleen — estää esim. Realtime-päivitystä pyyhkimästä kesken olevaa raahausta

### Ankkurointi (⚓-nappi, lisätty 2026-07-07)
- `ankkuroidutAvaimet` — Set jonka avaimet ovat `"lähde:tunniste"` (esim. `"muistilaput:42"`, `"kalenteri:7"`) — sallii saman tunnisteen esiintyä eri lähteissä ilman törmäystä
- `vaihdaAnkkurointiYleinen(source, id, content, jalkeenPaivitys)` — nostaa/poistaa minkä tahansa rivin (Muistilaput-tuote, kalenteritapahtuma) Ankkureihin. `vaihdaAnkkurointi(tuote)` on tämän ohut kääre listan tuoteriveille
- ⚓-nappi näkyy sekä listan tuoteriveillä (`#app-view`) että kalenteritapahtumien riveillä — korostuu (`active`-luokka) kun rivi on jo ankkuroitu

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

Hakee ensin Kauppalistan id:n (`GET /rest/v1/lists?name=eq.Kauppalista`) ja asettaa sen lisättävän tuotteen `list_id`:ksi, sitten kirjaa `'added'/'item'`-tapahtuman `events`-tauluun `user_id: null`:lla (Siri ei tiedä käyttäjää). Tapahtumakirjaus on `try/catch`:n sisällä — jos se epäonnistuu, itse lisäys onnistuu silti.

**2026-07-07: vaihdettu service_role-avaimeen.** RLS on päällä kaikilla tauluilla, joten vanha anon-avain ei enää riitä kirjoituksiin. `SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY` — avain on Vercelin ympäristömuuttuja (Production + Preview), EI koodissa. Jos tämä puuttuu, endpoint palauttaa selkeän 500-virheen sen sijaan että epäonnistuisi hämärästi.

---

## Google OAuth -konfigurointi

Tehty 2025-07-06:
- Supabase: Authentication → Providers → Google → enabled
- Google Cloud -projekti: "Satama"
- Callback URL Supabasesta lisätty Google Cloud Consoleen
- Authorized origin: https://kauppalista-nine.vercel.app

---

## Toiminnot käyttäjälle

**Etusivu:** päivämäärä, Ankkurit (+ tämän päivän kalenteritapahtumat samassa jos tänään), Horisontissa (tyhjä toistaiseksi), navigointiruudukko. Ei enää listoja suoraan — ks. Etusivu-osio.

**Muistilaput/Varasto** (listojen listaus, ks. Etusivu-osio):
- Rivin napautus avaa listan, pitkä painallus raahaa järjestystä
- ✎ (paitsi Kauppalistalla) → nimen muokkaus inline
- × (paitsi Kauppalistalla) → vahvistusdialogi → poistaa listan tuotteineen

**Lista** (toimii millä tahansa listalla):
- ‹-nuoli → takaisin sinne mistä lista avattiin (Muistilaput tai Varasto)
- 🔒/👥-nappi otsikkorivin oikeassa reunassa → listan asetukset: näkyvyyskytkin + "Siirrä Varastoon/Muistilappuihin"
- ○ vasemmalla → merkitsee tehdyksi (tuntopalaute-värinä + bought_at-leima)
- Tekstitappi → inline muokkaus, Enter tallentaa, Esc peruuttaa
- ⚓ → nostaa/poistaa rivin päivän Ankkureihin (korostuu jos jo ankkuroitu)
- × oikealla → vahvistusdialogi ("Poistetaanko [nimi]?") → vasta hyväksynnän jälkeen poistaa
- `#`-etuliite lisättäessä → väliotsikko (lihavoitu, ei checkboxia). Napauta otsikkoa → uudet rivit menevät sen alle
- Pitkä painallus + raahaus → järjestyksen muutos
- Ostetut näkyvät yliviivattuna aikaleimojen kera, silmänappi footerissa näyttää/piilottaa

**Vahvistusdialogi** (korvasi selaimen natiivin `confirm()`:n):
- Kuitti-tyylinen overlay: katkoviivareunat, teeman taustaväri, Peru (turvallinen, dashed-aksentti) + punainen Poista-nappi
- Ulkopuolelle klikkaus = peru
- Käytössä listan ja yksittäisen tuotteen poistossa (EI Ankkurin irrotuksessa — se on kevyt, tiheä toiminto eikä tarvitse vahvistusta)

**Auth:**
- Kirjautumaton: näkee "✱ SATAMA ✱" + "Kirjaudu Googlella"
- Kirjautunut: näkee etusivun (tai viimeisimmän listan jos sellainen muistissa)
- "kirjaudu ulos" -linkki etusivun alalaidassa

**Offline:**
- Muutokset menevät jonoon, näyttää "● ei yhteyttä"
- Yhteyden palautuessa synkkaa automaattisesti

---

## PWA

- manifest.json: name "Kauppalista", theme_color "#C9A84C", `orientation: "portrait"` (2026-07-07 — iOS Safari ei kuitenkaan tue suunnan ohjelmallista lukitusta luotettavasti, joten tämä ei ole taattu toimimaan)
- sw.js: cache version **v24** (2026-07-07) — nostettava aina kun index.html/style.css/script.js/icon.png muuttuu
- **Automaattinen päivitys** (2026-07-07): kun uusi service worker aktivoituu (`controllerchange`-tapahtuma), sivu lataa itsensä kerran uudelleen — ei enää tarvitse sulkea/avata PWA:ta moneen kertaan nähdäkseen uusimman version
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

1. **Otsikko + päivämäärä** (`paivitaPaivamaara()`, suomeksi, ei kellonaikaa/säätä — säätä ei tarkoituksella ole ollenkaan, ks. alkuperäinen visio "EI pysyvää sääruutua")
2. **Ankkurit** — päivän 3 tärkeintä. Oma kevyt taulu `ankkurit` (content, done, sort_order, event_time, `source`/`source_ref`). Kysely `done=false order by sort_order limit 3` — kun yksi merkitään tehdyksi, seuraava nousee näkyviin ilman erillistä "ylennyslogiikkaa". Jos aktiivisia on yli 3, "+N muuta odottaa — näytä kaikki" -linkki laajentaa näkymän täyteen listaan jota voi raahata priorisoidakseen (sama yleistetty raahauslogiikka). Rivit voivat tulla kolmesta lähteestä (`source`-kenttä): `'manual'` (kirjoitettu suoraan), `'muistilaput'` (nostettu listan riviltä ⚓-napilla), `'kalenteri'` (nostettu kalenteritapahtumasta ⚓-napilla)
3. **Horisontissa** — "asiat jotka alkavat kaivata huomiota" (EI kalenterin erääntymislista). Toistaiseksi vain tyhjä tila (`#horisontissa-empty`), koska syöttävät järjestelmät (vuosikello, siivoussuunnitelma) eivät ole vielä älykkäitä. **Tärkeä havainto:** raakadata tähän on jo olemassa — jokainen rastitus kirjautuu `events`-tauluun aikaleimalla, joten "milloin jääkaappi viimeksi pyyhitty" on jo laskettavissa. Päättelylogiikka (opitaan toistuva rytmi normaalin arjen mukaan, ei ideaalin mukaan) on oma myöhempi ongelmansa.
4. **Navigointiruudukko (2×3)**, data-ohjattu taulusta `home_sections` (key, name, icon, route, enabled, sort_order) — EI kovakoodattuja HTML-lohkoja, raahattavissa (sama yleistetty logiikka). Täyttöjärjestys: Laituri | Muistilaput / Varasto | Oma Hytti / Kalenteri / Asetukset. Toiminnallisia: `laituri`, `muistilaput`, `varasto`, `kalenteri`. Loput (`hytti`, `asetukset`) näyttävät `alert("X tulossa pian.")`.

**Tärkeä nimikkeistömuutos:** "Listat" ei ole enää oma käsitteensä — se on **Muistilaput**, oma näkymänsä, EI enää suoraan etusivulla. `lataaKotinakyma()` lataa vain etusivun; `lataaListatNakymaan(containerId, kategoria)` on yleinen funktio jota sekä Muistilaput (`lataaMuistilaput()`) että Varasto (`lataaVarasto()`) käyttävät eri `category`-suodatuksella. Navigointipolku: Etusivu → Muistilaput/Varasto → yksittäinen lista, ja listanäkymän takaisin-nuoli muistaa kummasta tultiin (`listanAvausLahde`).

Ankkurit/Horisontissa-otsikot ovat toistaiseksi kiinteitä koodissa (ei omaa data-riviä) — voidaan muuttaa muokattaviksi myöhemmin jos tarpeen, ei ole ison lisätyön takana.

## Varasto (2026-07-07)

Harvemmin tarvittavat listat (pakkauslistat, toistuvat pohjat) — käyttää TÄSMÄLLEEN samaa `lists`/`tuotteet`-rakennetta kuin Muistilaput, vain `category='varasto'` erottaa ne. Ei siis omaa taulua eikä omaa toiminnallisuutta — kaikki (rastitus, väliotsikot, jako, raahaus, ankkurointi) toimii identtisesti.

**Listan siirto Muistilaput ↔ Varasto:** listan omista asetuksista (🔒/👥-napin takana) "Siirrä Varastoon"/"Siirrä Muistilappuihin" -nappi vaihtaa `category`-kentän. Käyttötapaus: pakkauslista siirtyy Varastosta Muistilappuihin viikkoa ennen reissua kun siitä tulee aktiivisesti hoidettava asia, takaisin Varastoon kun reissu on ohi.

Esimerkkilistat siemennetty (010): Telttaretken pakkauslista, Viikon reissun pakkauslista (molemmat jaettuja, omistaja Katri).

## Kalenteri (2026-07-07)

Oma sisäinen kalenteri, EI ulkoista synkkaa (perhe käyttää iOS/iCloud-kalenteria, mutta sen lukeminen webistä vaatisi CalDAV+sovelluskohtaisen salasanan — päätetty jättää myöhemmäksi, ei osa E1:tä). Taulu `kalenteri_tapahtumat` (title, event_date, event_time — ei timestamptz, ei aikavyöhykemonimutkaisuutta).

- **Kolme näkymää** (`kalenteriTila`: 'paiva'/'viikko'/'kuukausi'), kaikki agenda-tyylisiä listoja (EI perinteistä ruudukkoa — sopii kapealle puhelinnäytölle ja koko sovelluksen kuitti-estetiikkaan paremmin)
- Päivänäkymässä voi lisätä tapahtumia; viikko/kuukausi ovat selailunäkymiä jotka ryhmittävät päivän mukaan (kuukausi näyttää vain päivät joilla on tapahtumia, ei tyhjiä)
- ‹ › -napit siirtävät edelliseen/seuraavaan päivään/viikkoon/kuukauteen
- **Vaakatilan CSS** (ei JS-pakotus): viikkonäkymä näyttää 7 pystysaraketta rinnakkain vaakatilassa (`@media (orientation: landscape)`, `grid-template-columns: repeat(7, 1fr)`), kuukausi kahtena palstana. Käyttäjän pitää itse kääntää puhelin — **iOS Safari ei tue `screen.orientation.lock()`:ia**, joten automaattista per-näkymä-suunnanlukitusta ei voi toteuttaa luotettavasti (tunnettu, pitkäaikainen WebKit-puute)
- **Yhdistetty tänään-agenda:** kun päivänäkymässä katsotaan TÄTÄ päivää, näkyvät sekä oikeat kalenteritapahtumat että kaikki aktiiviset (done=false) ankkurit yhdessä, ajan mukaan järjestettynä (`jarjestaAjanMukaan()`, ei-ajalliset viimeisenä). Muut päivät näyttävät vain oikeat tapahtumat. Kalenteritapahtumilla on oma ⚓-nappi joka nostaa/poistaa ne Ankkureihin samalla `vaihdaAnkkurointiYleinen()`-mekanismilla kuin Muistilaput-rivit

## TODO ennen etapin 1 valmistumista (määräaika 23.7.2026 — kehityskone palautuu silloin)

- [x] RLS + näkyvyysmalli (003, 005, 006) — ajettu, korjattu rekursio ja anon-vuoto
- [x] service_role-avain Verceliin, Siri vahvistettu toimivaksi RLS:n kanssa
- [x] Raahausjärjestys: tuotteet (007), lists (011) — molemmat ajettu
- [x] Laituri (004), navigointiruudukko (008), Ankkurit (009, 013), Varasto (010), Kalenteri (012) — kaikki ajettu
- [ ] **Testaa molemmilla tileillä (Katri + Juha)** — tämä on ollut TODO-listalla koko session ajan, ei vielä vahvistettu. Ks. tarkka testauslista alta
- [ ] Suunnitteluperiaate koko loppuprojektille: kaikki säädettävä dataan/tauluihin, EI kovakoodata — pääosin toteutunut (home_sections, ankkurit ovat data-ohjattuja), mutta pidä mielessä jatkossakin
- [ ] Horisontissa: oikea päättelylogiikka events-datasta (ei aloitettu)
- [ ] Oma Hytti, Asetukset -näkymät (vielä pelkkiä "tulossa pian" -paikanpitäjiä)
- [ ] Kalenteritapahtuman muokkaus jälkikäteen (nyt voi vain lisätä/poistaa, ei muuttaa nimeä/aikaa)

## Testattavaa seuraavaksi (koottu 2026-07-07 session lopussa)

Iso liuta uutta toiminnallisuutta kasautunut ilman kattavaa käsin-testausta oikealla laitteella/tilillä. Käy läpi:

- [ ] **Kahden tilin testi** (Katri + Juha): yhteinen lista näkyy molemmille, yksityinen lista EI näy toiselle, Kauppalista/Siivouslista/Vuosikello näkyvät kummallekin
- [ ] Muistilaput/Varasto-listarivien raahaus (011) — pitkä painallus, järjestys pysyy uudelleenkäynnistyksen jälkeen
- [ ] Listan siirto Muistilaput ↔ Varasto asetuksista, ja että takaisin-nuoli osuu oikeaan näkymään siirron jälkeen
- [ ] Kalenteri: lisää/poista tapahtuma päivänäkymässä, selaa viikko/kuukausi, ‹ › -navigointi, vaakatilan 7-sarakenäkymä viikossa (käännä puhelin oikeasti)
- [ ] Ankkurin nosto kalenteritapahtumasta (⚓) → näkyy sekä etusivun Ankkureissa että pysyy kalenterin tänään-agendassa merkittynä
- [ ] Ankkurin nosto Muistilaput-rivistä (⚓) → sama tarkistus
- [ ] Ankkurin irrotus (⚓ uudelleen) EI poista alkuperäistä riviä/tapahtumaa, vain itse ankkurin
- [ ] Ankkureiden ylivuoto: lisää 4+, tarkista "+N muuta odottaa" -linkki ja sen sisällä raahaus
- [ ] Navigointiruudukon laattojen raahaus (järjestys home_sections.sort_order:iin)
- [ ] Tuntopalaute (värinä) rastittaessa tuote/ankkuri valmiiksi — vaatii oikean puhelimen, ei näy selaimessa
- [ ] Automaattinen sivun päivitys uuden servicewaorkerin jälkeen — ei enää tarvitse sulkea/avata PWA:ta moneen kertaan
- [ ] Väliotsikot + otsikon-alle-kohdistettu lisäys (`#`-etuliite, napauta otsikkoa) — testattu kerran aiemmin, hyvä varmistaa ettei mikään myöhempi muutos rikkonut
- [ ] Siri-lisäys (`/api/add`) toimii yhä RLS:n ja service_role-avaimen kanssa oikeasta puhelimesta (Shortcut), ei vain curlilla