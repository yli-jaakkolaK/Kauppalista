# Kauppalista / Satama — projektimuistiinpanot

## Mistä on kyse

Katrin opetusprojekti: jaettu kauppalista hänen ja miehensä välillä. Toimii PWA:na iPhonessa.
Projekti on myös **Satama-sovelluksen vaihe 1** — myöhemmin kasvaa isommaksi perheen toiminnanohjaussovellukseksi.

**Julkaistu:** https://kauppalista-nine.vercel.app
**Repo:** https://github.com/yli-jaakkolaK/Kauppalista (main-haara → auto-deploy Verceliin)
**Supabase projekti:** https://uctmxxeewoeydabuepye.supabase.co

---

## Muutosloki (mitä tehty minäkin päivänä)

Tämä osio on lyhyt päiväkirjamainen kooste — tarkka sisältö löytyy aina viitatusta osiosta alempaa. Pidetään ajan tasalla jatkossa jokaisen työskentelykerran lopuksi, jotta kuka tahansa (myös Copilot ilman pääsyä tähän keskusteluun) näkee nopeasti missä järjestyksessä asiat on rakennettu.

- **2026-06-09 – 2026-07-01:** Projektin aloitus, ensimmäinen toimiva versio kauppalistasta
- **2026-07-02:** Siirto Supabaseen (oli aluksi localStorage), kuitti-ilme, PWA-tuki (asennettava kotinäytölle), offline-toiminta, Siri-integraatio (`/api/add`)
- **2026-07-03:** Korjattu Realtime-yhteyden katkeaminen kun PWA on ollut taustalla, kirjattu Satama 2.0 -kokonaisvisio
- **2026-07-06:** Google-kirjautuminen, monilistatuki (voi luoda useita listoja pelkän Kauppalistan lisäksi), tapahtumaloki, oma vahvistusdialogi (ei enää selaimen ponnahdusikkunaa)
- **2026-07-07 (iso päivä):** Väliotsikot listoihin, rivien raahausjärjestys, näkyvyysmalli + tietoturva (RLS) käyttöön KAIKILLE tauluille, Laituri (yhteinen muistilappu), koko etusivu suunniteltu uusiksi (Ankkurit + Horisontissa + navigointiruudukko), Varasto-näkymä, oma sisäinen Kalenteri (päivä/viikko/kuukausi), ⚓-ankkurointinappi, kalenteri ja ankkurit yhdistetty samaan "tänään"-näkymään — ks. "Kalenteri"-osio
- **2026-07-08:** Isommat kuvakkeet etusivun ruudukossa + kalenterikuvake näyttää päivän numeron, ja iso uusi ominaisuus: ulkoisen kalenterin (iCloud tms.) tuonti Satamaan hyväksyntäjonon kautta — ks. "Kalenterisyötteet"-osio. Kirjattu (ei toteutettu) täydet suunnitelmat kahdelle tulevalle ominaisuudelle: Horisontti (ks. "Horisontti — suunnitelma") ja Ohjebanneri-järjestelmä (ks. "Ohjebanneri-järjestelmä — suunnitelma", toteutetaan Hytin yhteydessä). Toteutettu pakkauslistojen automaattinollaus — ks. "Pakkauslistan automaattinollaus" -osio, ja lisätty ensimmäinen yleiskäyttöinen toast-ilmoitusmekanismi (`naytaIlmoitus()`). Toteutettu web push -infra (VAPID-avaimet, tilaus, testilähetys, ensimmäinen kevyt Asetukset-näkymä) — ks. "Push-ilmoitukset"-osio, valmisteltu illan kahden puhelimen testisessiota varten. **Sama päivä, myöhemmin:** rakennettu Oma Hytti v1 (henkilökohtainen työtila, casekortit + automaattinen tehtäväkooste, täysin yksityinen) — ks. "Oma Hytti"-osio. `sql/016_hytti.sql` AJETTU Supabasessa. Lisätty vielä Hytin tänään-erääntyvien tehtävien näkyminen Kalenterin päivänäkymän tänään-agendassa (pois/päälle-kytkin Asetuksissa, oletus päällä) — ks. "Oma Hytti"-osion "Kalenteri-integraatio"-kappale. **Sama ilta, vielä myöhemmin:** Katri testasi kalenterisyötteet-ominaisuuden oikealla datalla ja löysi puutteen — osa perheen tapahtumista elää Juhan henkilökohtaisissa kalentereissa joita Katrin iCloud-tunnukset eivät näe. Lisätty tuki toiselle CalDAV-tilille (`sql/017_kalenteri_tilit.sql`, `kalenteri_syotteet.account_key`) — ks. "Kalenterisyötteet"-osion "Useampi CalDAV-tili"-kappale. **Sama ilta, vielä myöhemmin:** rakennettu Kalenterin kuukausinäkymälle oikea 7-sarakkeinen ruudukko (korvasi aiemman pelkän päivälistauksen) ja tuki usean päivän kestäville tapahtumille (esim. lomaviikko) — nämä näkyvät nyt värillisenä palkkina jokaisen kattamansa päivän kohdalla pallukan toistamisen sijaan, sekä päivä- että viikkonäkymässä myös joka päivänä jonka tapahtuma kattaa. `sql/018_kalenteri_monipaivainen.sql`. **Sama ilta, vielä myöhemmin:** Katri testasi kalenterisyötteet-ominaisuuden — löytyi ja korjattiin `ICLOUD_APP_PASSWORD`-virhe (401), lisätty `?listaa=katri`/`?listaa=juha`-diagnostiikkaparametri kalenterien näyttönimien selvittämiseen, ja huomattu että `kalenteri_syotteet`-taulu oli koko ajan TYHJÄ — synkka ei koskaan ollut oikeasti epäonnistunut, sille ei vain ollut annettu mitään syötettä. Korjattu `sql/019_kalenteri_syotteet_data.sql`:llä (kolme syöterivia Katrin tilille) ja kirjattu uusi pysyvä periaate: kaikki Supabase-data, myös syötteet, kulkee versioituna migraationa, ei ikinä irtokomentona SQL Editoriin — ks. "Tiedostorakenne"-osion PERIAATE-huomautus. Migraatiot 017–019 AJAMATTA. Tämä muistiinpanot.md-tiedosto päätetty pitää jatkossa niin tarkkana että Copilot pystyy jatkamaan projektia pelkän tämän tiedoston varassa, koska kehityskone palautuu 2026-07-23

---

## Sanasto — Saman omat käsitteet

Näitä nimiä käytetään ympäri tätä tiedostoa ilman että niitä aina selitetään uudelleen — jos joku (Copilot mukaan lukien) törmää johonkin näistä ensimmäistä kertaa, tästä löytyy nopea selitys. Tarkempi kuvaus löytyy aina omasta osiostaan.

- **Satama** — koko projektin lopullinen nimi/visio: perheen toiminnanohjaussovellus. Tämä repo (`kauppalista`) on sen **vaihe 1 (E1)**.
- **Muistilaput** — käyttäjän omat/jaetut tekstilistat (entinen "Listat"), esim. Kauppalista. Oma näkymänsä, ei enää suoraan etusivulla.
- **Varasto** — samat kuin Muistilaput teknisesti, mutta harvemmin tarvittavat listat (esim. pakkauslistat). Listan voi siirtää näiden kahden välillä.
- **Laituri** — yhteinen "keskeneräisten ajatusten" muistilista, aina näkyvissä molemmille perheenjäsenille.
- **Ankkurit** — etusivun "tämän päivän 3 tärkeintä" -lohko. Rivit voivat tulla käsin kirjoitettuna, Muistilapuilta tai Kalenterista ⚓-napilla nostettuna.
- **Horisontissa** — etusivun lohko "asioille jotka alkavat kaivata huomiota" (esim. milloin joku kotityö viimeksi tehty). Ei vielä toiminnallinen, vain paikkavaraus — täysi suunnitelma ks. "Horisontti — suunnitelma" -osio.
- **Nosto/Nostot** — yksittäinen toistuva kotihomma (esim. "imuroi", "pakastimen sulatus") jonka rytmiä Horisontti seuraa; myös tulevan Satama-vaiheen "Nostot" (kodin huoltokirja) nimi — sama data, kaksi eri käyttöliittymää.
- **Kalenterisyöte** — yksi ulkoinen kalenteri (esim. yksi iCloud-kalenteri tai yksi julkaistu .ics-linkki) jonka Satama lukee sisään. Jokainen syöte on yksi rivi `kalenteri_syotteet`-taulussa, ks. "Kalenterisyötteet"-osio.
- **E1** — lyhenne "Etapista 1" eli tästä ensimmäisestä rakennusvaiheesta (Listat/Muistilaput-keskeinen), määräaika 23.7.2026.
- **Oma Hytti** — henkilökohtainen, TÄYSIN yksityinen työtila (casekortit + automaattinen tehtäväkooste). Toteutettu 2026-07-08, ks. "Oma Hytti"-osio.
- **Nostot, Odottaa** — muiden tulevien Satama-vaiheiden nimiä, EI vielä rakennettu mitään näistä, ks. "Satama 2.0 — seuraavat vaiheet" -osio.
- **Ohjebanneri** — suunniteltu (ei toteutettu) osioiden sisäänrakennettu ohjeteksti-mekanismi, kuittaus tietokantaan, sama sisältö aina myös Asetuksista löydettävissä. Täysi suunnitelma ks. "Ohjebanneri-järjestelmä" -osio.
- **VAPID-avaimet** — web push -ilmoitusten vaatima avainpari (julkinen avain koodissa, yksityinen Vercelin ympäristömuuttujissa), todistaa push-palvelulle että viesti tulee oikealta lähettäjältä. Ks. "Push-ilmoitukset" -osio.

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

⚠️ **`events`-taulua EI SAA KOSKAAN tyhjentää/arkistoida/siivota vanhoja rivejä pois** (esim. "siivotaan yli vuoden vanhat tapahtumat" -tyylinen kevennys), vaikka se voisi joskus houkutella taulun kasvaessa. Syy: tuleva **Horisontti**-ominaisuus (ks. "Horisontti — suunnitelma" -osio) laskee kotihommien rytmin NIMENOMAAN tästä historiasta (`action='checked'`-rivien aikaleimoista, `target_name`-täsmäyksellä) — historian menettäminen tarkoittaisi ettei rytmiä voisi enää koskaan oppia uudelleen.

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
├── sw.js             — service worker, välimuisti v29, offline-tuki, auto-reload uudesta versiosta, push-käsittelijät
├── icon.png          — 512×512 PWA-ikoni
├── package.json      — VAIN api/-kansion serverless-funktioiden npm-riippuvuudet (tsdav, ical.js, web-push). Etusivun vanilla-JS-puoli (index.html/script.js) EI käytä näitä eikä vaadi build-vaihetta — Vercel asentaa nämä automaattisesti vain funktioita ajaessaan.
├── api/
│   ├── add.js          — Vercel serverless, lisää tuotteen Kauppalistaan (service_role-avain), Siri-Shortcutin käyttämä
│   ├── caldav-sync.js  — Vercel serverless, geneerinen kalenterisyötteiden veto (ks. "Kalenterisyötteet"-osio alla)
│   └── push-test.js    — Vercel serverless, lähettää testi-push-ilmoituksen kirjautuneen käyttäjän tilauksiin (ks. "Push-ilmoitukset"-osio alla)
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
│   ├── 013_ankkuri_aika.sql           — ankkurit.event_time
│   ├── 014_kalenteri_syotteet.sql     — kalenteri_syotteet-taulu (geneerinen ulkoisen kalenterin veto) + kalenteri_tapahtumat.syote_id/ical_uid/event_end_time + kalenteri_odottavat-taulu
│   ├── 015_push_tilaukset.sql         — push_tilaukset-taulu (web push -tilaukset)
│   ├── 016_hytti.sql                  — hytti_kortit + hytti_rivit -taulut (Oma Hytti)
│   ├── 017_kalenteri_tilit.sql        — kalenteri_syotteet.account_key (tuki useammalle CalDAV-tilille)
│   ├── 018_kalenteri_monipaivainen.sql — kalenteri_tapahtumat/kalenteri_odottavat.event_end_date (usean päivän tapahtumat)
│   └── 019_kalenteri_syotteet_data.sql — syöterivit Katrin tilin kalentereille (Perhekalenteri/Juha/Katri) + uniikki-rajoite
└── muistiinpanot.md  — tämä tiedosto
```

SQL-migraatiot ajetaan aina käsin Supabasen SQL Editorissa — Claude ei aja niitä itse, vain kirjoittaa tiedoston. Numerointi on ajojärjestyksen ehdotus, ei aina pakollinen riippuvuus — esim. 011 ja 012 eivät riipu toisistaan.

**PERIAATE (kirjattu 2026-07-08, syy: `kalenteri_syotteet` jäi tyhjäksi koska syöterivit eivät olleet missään migraatiossa):** EI KOSKAAN irtokomentoja Supabasen SQL Editoriin ohi git-historian — myös SYÖTE-/SIEMENDATA (esim. `kalenteri_syotteet`-rivit) kuuluu AINA omaan numeroituun migraatioonsa, ei vain skeemamuutokset. Jos Katri tarvitsee jonkin datarivin lisäystä, se kirjoitetaan `sql/0XX_....sql`-tiedostoon (idempotentiksi, esim. `on conflict do nothing`), EI koskaan pelkkänä ohjeena "aja tämä SQL Editorissa" ilman että se on myös tiedostona.

---

## index.html — rakenne

Yksitoista näkymää/elementtiä, kaikki `display:none` alussa. Yksi yhteinen apufunktio piilottaa kaikki (`piilotaKaikkiNakymat()`), ja jokainen `showXView()` kutsuu sitä ja näyttää vain omansa — helpompi pitää synkassa kuin toistaa piilotuslogiikka joka funktiossa:

1. `#login-view` — kirjautumaton, "Kirjaudu Googlella"
2. `#home-view` — etusivu: päivämäärä, Ankkurit, Horisontissa, navigointiruudukko (`#sections-list`). Listat EIVÄT ole täällä (ks. Etusivu-osio)
3. `#muistilaput-view` — listojen (category='muistilaput') listaus + uuden luonti
4. `#varasto-view` — sama kuin Muistilaput mutta category='varasto'
5. `#kalenteri-view` — päivä/viikko/kuukausinäkymät
6. `#laituri-view` — yhteinen muistilista
7. `#app-view` — geneerinen listanäkymä, toimii millä tahansa list_id:llä (Kauppalista, Siivouslista, mikä tahansa Muistilaput/Varasto-lista)
8. `#dialog-overlay` — kuitti-tyylinen vahvistusdialogi (poistot)
9. `#settings-overlay` — listan omat asetukset (näkyvyyskytkin + kategorian vaihto)
10. `#kalenteri-hyvaksynta-overlay` — kalenterisyötteistä tulleiden tapahtumien hyväksyntäkortit (ks. "Kalenterisyötteet"-osio), sama dialog-overlay/dialog-box-rakenne kuin kohdilla 8-9, mutta sisältää dynaamisesti piirretyn listan kortteja yhden kiinteän tekstin sijaan
11. `#asetukset-view` — ensimmäinen kevyt Asetukset-runko (2026-07-08), toistaiseksi vain Ilmoitukset-lohko (ks. "Push-ilmoitukset"-osio)

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
- `.toast` — itsestään katoava ilmoitusbanneri ruudun alareunassa (lisätty 2026-07-08, `naytaIlmoitus()` script.js:ssä luo elementin dynaamisesti, ei valmiina HTML:ssä), `.nakyva`-luokka ohjaa fade in/out -siirtymän
- `.settings-action-btn` — täysleveä toimintonappi Asetukset-näkymässä (lisätty 2026-07-08), käytetään yhdessä `.login-btn`:n kanssa (`class="login-btn settings-action-btn"`) samalla ulkoasulla mutta koko leveydellä pinottuna

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
- sw.js: cache version **v29** (2026-07-08) — nostettava aina kun index.html/style.css/script.js/icon.png muuttuu. **HUOM:** `/api/`-polut on tietoisesti jätetty POIS cachesta kokonaan (ks. "Kalenterisyötteet"-osio, "sw.js piti korjata tätä varten") — vain APP_FILES-listan tiedostot ja muut samaperäiset staattiset pyynnöt cachetetaan.
- sw.js sisältää myös `push`- ja `notificationclick`-tapahtumankuuntelijat (2026-07-08) — ks. "Push-ilmoitukset"-osio.
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

**Muistiinpanot (E8) — alustava ideahuomio (kirjattu 2026-07-08, EI suunniteltu tarkemmin, EI toteutettu):** Katrin huomio "muistiinpanot (=varasto)" viittaa siihen että tämä tuleva osio muistuttaa käyttötarkoitukseltaan nykyistä Varastoa (harvemmin tarvittava, elävä sisältö) — ei tarkoita että ne yhdistettäisiin samaksi tekniseksi ratkaisuksi, vaan on vertailukohta. Toivelistalla ainakin: **kopiointitoiminto** (rivin/koko muistiinpanon sisällön kopiointi leikepöydälle) ja **kuvasta tekstiksi** (OCR — esim. valokuva kuitista/lapusta muuttuu muokattavaksi tekstiksi). Katri pyysi myös yleisesti käymään läpi mitä Applen Notes (Muistiinpanot-appi) nykyään osaa ja poimimaan siitä sopivia ideoita tähän osioon ennen kuin sitä aletaan suunnitella tarkemmin — EI ole vielä tehty, tee tämä selvitys ENNEN kuin Muistiinpanot (E8) -osion tarkempaa speksausta aloitetaan.

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
3. **Horisontissa** — "asiat jotka alkavat kaivata huomiota" (EI kalenterin erääntymislista). Toistaiseksi vain tyhjä tila (`#horisontissa-empty`), koska syöttävät järjestelmät (vuosikello, siivoussuunnitelma) eivät ole vielä älykkäitä. **Täysi toteutussuunnitelma valmiina** (tietomalli, mediaanilaskenta, ehdotuslogiikka, V1–V4-vaiheistus) omassa "Horisontti — suunnitelma"-osiossaan alempana, EI vielä toteutettu koodissa.
4. **Navigointiruudukko (2×3)**, data-ohjattu taulusta `home_sections` (key, name, icon, route, enabled, sort_order) — EI kovakoodattuja HTML-lohkoja, raahattavissa (sama yleistetty logiikka). Täyttöjärjestys: Laituri | Muistilaput / Varasto | Oma Hytti / Kalenteri / Asetukset. Kaikki kuusi laattaa ovat nyt toiminnallisia (`hytti` ja `asetukset` olivat pitkään "tulossa pian" -paikanpitäjiä, molemmat rakennettu 2026-07-08 — ks. "Oma Hytti"- ja "Push-ilmoitukset"-osiot).

**Tärkeä nimikkeistömuutos:** "Listat" ei ole enää oma käsitteensä — se on **Muistilaput**, oma näkymänsä, EI enää suoraan etusivulla. `lataaKotinakyma()` lataa vain etusivun; `lataaListatNakymaan(containerId, kategoria)` on yleinen funktio jota sekä Muistilaput (`lataaMuistilaput()`) että Varasto (`lataaVarasto()`) käyttävät eri `category`-suodatuksella. Navigointipolku: Etusivu → Muistilaput/Varasto → yksittäinen lista, ja listanäkymän takaisin-nuoli muistaa kummasta tultiin (`listanAvausLahde`).

Ankkurit/Horisontissa-otsikot ovat toistaiseksi kiinteitä koodissa (ei omaa data-riviä) — voidaan muuttaa muokattaviksi myöhemmin jos tarpeen, ei ole ison lisätyön takana.

## Varasto (2026-07-07)

Harvemmin tarvittavat listat (pakkauslistat, toistuvat pohjat) — käyttää TÄSMÄLLEEN samaa `lists`/`tuotteet`-rakennetta kuin Muistilaput, vain `category='varasto'` erottaa ne. Ei siis omaa taulua eikä omaa toiminnallisuutta — kaikki (rastitus, väliotsikot, jako, raahaus, ankkurointi) toimii identtisesti.

**Listan siirto Muistilaput ↔ Varasto:** listan omista asetuksista (🔒/👥-napin takana) "Siirrä Varastoon"/"Siirrä Muistilappuihin" -nappi vaihtaa `category`-kentän. Käyttötapaus: pakkauslista siirtyy Varastosta Muistilappuihin viikkoa ennen reissua kun siitä tulee aktiivisesti hoidettava asia, takaisin Varastoon kun reissu on ohi.

Esimerkkilistat siemennetty (010): Telttaretken pakkauslista, Viikon reissun pakkauslista (molemmat jaettuja, omistaja Katri).

## Pakkauslistan automaattinollaus (2026-07-08)

Kun minkä tahansa listan (Muistilaput TAI Varasto, sama `tuotteet`-rakenne) nimessä on sana "pakkauslista" missä tahansa muodossa (isot/pienet kirjaimet ei väliä, sana voi olla osana pidempää nimeä kuten "Telttaretken pakkauslista") JA käyttäjä täppää listan viimeisenkin rivin valmiiksi niin että KAIKKI ei-otsikkorivit ovat nyt `tehty=true`, lista nollautuu automaattisesti n. 1,5 sekunnin kuluttua takaisin tyhjäksi (`tehty=false`, `bought_at=null` kaikilla riveillä). Käyttötapaus: pakkauslistaa käytetään uudelleen joka reissulla, ei haluta täpätä kaikkea auki käsin ennen seuraavaa matkaa.

**Toteutus (`script.js`):**
- `naytaIlmoitus(teksti)` — yleiskäyttöinen, itsestään katoava ilmoitusbanneri ruudun alareunassa (`.toast`-luokka, kuitti-tyylinen). Ensimmäinen kerta kun tällainen "toast"-mekanismi on lisätty sovellukseen — voi käyttää myöhemminkin muualla, ei sidottu pakkauslistoihin.
- `tarkistaPakkauslistanNollaus()` — kutsutaan `checkNappi`:n click-handlerista (listan tuoteriveillä, `#app-view`) HETI kun `lataaLista()` on ehtinyt päivittää `cachedTuotteet`:n tuoreella datalla. Tarkistaa nimiehdon (`currentList.name.toLowerCase().indexOf('pakkauslista') !== -1`) ja että kaikki ei-otsikko (`is_header=false`) rivit ovat `tehty=true`. Jos molemmat ehdot täyttyvät: näyttää ilmoituksen, odottaa 1500ms (`setTimeout`), sitten päivittää KAIKKI listan rivit kerralla (`.update({tehty:false, bought_at:null}).in('id', idt)`).
- **Tarkoituksellinen suunnitteluvalinta:** laukaisu tapahtuu VIIMEISEN TÄPÄN PAINANEEN käyttäjän omassa selaimessa/koodipolussa, EI Realtime-kuuntelijana. Jos nollaus laukeaisi Realtime-tapahtumasta, KAIKKI avoinna olevat laitteet/välilehdet (myös toisen perheenjäsenen) yrittäisivät nollata saman listan samaan aikaan, ja käyttäjä voisi nähdä nollauksen tapahtuvan laitteellaan ilman että hän itse teki mitään sillä hetkellä. Nyt nollaus tapahtuu vain sen yhden käyttäjän toimesta joka fyysisesti täppäsi viimeisen rivin.
- **Rajaus:** toimii vain, kun laite on online (`navigator.onLine`) — offline-jonon kautta tehty viimeinen täppäys ei laukaise nollausta, koska nollauksen DB-kirjoitus vaatisi oman jonologiikkansa eikä sitä ole toteutettu. Realistisesti pakkauslistaa täytetään kotona verkon kanssa, joten tätä ei pidetty tärkeänä rajoittaa enempää.
- Väliotsikkorivit (`is_header=true`) EIVÄT lasketa mukaan "onko kaikki täpätty" -tarkistukseen eivätkä nollaudu (niillä ei ole checkboxia ollenkaan).

## Kalenteri (2026-07-07, iCloud-synkka lisätty 2026-07-08, kuukausiruudukko + monipäiväiset tapahtumat lisätty 2026-07-08 illalla)

Oma sisäinen kalenteri Satamassa. Taulu `kalenteri_tapahtumat` (title, event_date, event_time — ei timestamptz, ei aikavyöhykemonimutkaisuutta; `syote_id`/`ical_uid`/`event_end_time` lisätty 014:ssä, `event_end_date` lisätty 018:ssa, ks. "Kalenterisyötteet"- ja "Monipäiväiset tapahtumat"-osiot alla).

- **Kolme näkymää** (`kalenteriTila`: 'paiva'/'viikko'/'kuukausi'). Päivä ja viikko ovat agenda-tyylisiä listoja (EI ruudukkoa — sopii kapealle puhelinnäytölle paremmin). **Kuukausi on 2026-07-08 illasta lähtien OIKEA 7-sarakkeinen ruudukko** (maanantai ensin, täydennetty edellisen/seuraavan kuukauden päivillä täysiin viikkoihin) — ks. oma kappale alla.
- Päivänäkymässä voi lisätä tapahtumia; viikko on selailunäkymä joka ryhmittää päivän mukaan
- ‹ › -napit siirtävät edelliseen/seuraavaan päivään/viikkoon/kuukauteen. **Kuukausiruudukon minkä tahansa päivän napautus avaa sen päivän päivänäkymän** — ainoa tapa muokata/poistaa/ankkuroida yksittäisiä tapahtumia kuukausinäkymästä käsin, koska ruudukon solu on liian pieni omille napeille
- **Vaakatilan CSS** (ei JS-pakotus): viikkonäkymä näyttää 7 pystysaraketta rinnakkain vaakatilassa (`@media (orientation: landscape)`, `grid-template-columns: repeat(7, 1fr)`), kuukausi käyttää samaa `#kalenteri-view`-leveyskasvua koska se on jo pystyasennossakin ruudukko. Käyttäjän pitää itse kääntää puhelin — **iOS Safari ei tue `screen.orientation.lock()`:ia**, joten automaattista per-näkymä-suunnanlukitusta ei voi toteuttaa luotettavasti (tunnettu, pitkäaikainen WebKit-puute)
- **Yhdistetty tänään-agenda:** kun päivänäkymässä katsotaan TÄTÄ päivää, näkyvät sekä oikeat kalenteritapahtumat että kaikki aktiiviset (done=false) ankkurit että Oma Hytin tänään erääntyvät tehtävät yhdessä, ajan mukaan järjestettynä (`jarjestaAjanMukaan()`, ei-ajalliset viimeisenä). Muut päivät näyttävät vain oikeat tapahtumat. Kalenteritapahtumilla on oma ⚓-nappi joka nostaa/poistaa ne Ankkureihin samalla `vaihdaAnkkurointiYleinen()`-mekanismilla kuin Muistilaput-rivit

### Monipäiväiset tapahtumat (lisätty 2026-07-08 illalla, `sql/018_kalenteri_monipaivainen.sql`)

**Havainto/pyyntö:** yön-yli-tapahtuma (esim. "lapsen loma", viikon mittainen) näkyi ennen vain pallukkana/tekstirivinä sen ALKUPÄIVÄNÄ, koska `kalenteri_tapahtumat`-taulussa oli vain yksi `event_date`-sarake — tapahtuman todellinen loppupäivä katosi jo tuonnissa (`event_end_time` tallensi vain kellonajan, ei päivää).

- **`kalenteri_tapahtumat.event_end_date`** (nullable date) — NULL = tavallinen yksipäiväinen tapahtuma (valtaosa). Kun asetettu ja eri kuin `event_date`, tapahtuma kattaa koko sen välin päivineen molempine päineen mukaan lukien. Sama sarake lisätty myös `kalenteri_odottavat`-tauluun (hyväksyntäjono).
- **`api/caldav-sync.js`** laskee tämän jo tuontivaiheessa `event.endDate`:stä (sekä kertaluontoisille että jokaiselle toistuvan tapahtuman esiintymälle erikseen, koska esiintymän oma kesto lasketaan `event.duration`:sta) — EI vaadi mitään UI-muutosta käsin lisätyille tapahtumille (ne pysyvät aina yksipäiväisinä, `kalenteri-add-btn` ei aseta `event_end_date`:a, koska pyyntö koski nimenomaan iCalista kopioituvia tapahtumia, ei Satamassa itse luotuja).
- **`script.js`: `tapahtumaKattaaPaivan(t, isoPaiva)`** — yleinen apufunktio joka päättää kattaako tapahtuma annetun päivän (`event_date`...`event_end_date`, ISO-merkkijonot vertailukelpoisia sellaisenaan). KAIKKI kolme näkymää (päivä/viikko/kuukausi) käyttävät tätä saman tapahtuman näyttämiseen JOKAISENA päivänä jonka se kattaa, ei vain `event_date`-päivänä.
- **Hakupuskuri:** koska päivä-/viikkonäkymä saattaa näyttää päivän joka on ennen jonkin monipäiväisen tapahtuman `event_date`:a (mutta silti tapahtuman kattama), haku hakee `MONIPAIVAINEN_PUSKURI_PV = 60` päivää taaksepäin näkyvän välin alusta — reilusti mitoitettu, ei tarkkuutta vaativa turvamarginaali, ei mikään tarkka bisneslogiikan raja. Tarkka näyttörajaus tehdään aina asiakaspuolella `tapahtumaKattaaPaivan()`:lla riippumatta siitä kuinka paljon dataa haettiin.
- **Kuukausiruudukon palkit:** monipäiväinen tapahtuma EI toistu pallukkana joka päivässä, vaan näkyy yhtenäisenä värillisenä palkkina (`kalenteri_syotteet.vari` tai `var(--accent)`) jokaisen kattamansa päivän solun yläosassa, teksti näkyy vain palkin ensimmäisessä näkyvässä ruudussa (joko todellinen alkupäivä tai kyseisen viikon maanantai jos tapahtuma alkoi jo edellisellä viikolla). Päällekkäisten monipäiväisten tapahtumien pystysijainti ("linja") lasketaan `laskeViikonLinjat()`:lla AHNEELLA aikavälialgoritmilla — **erikseen JOKA VIIKOLLE**, ei koko kuukaudelle kerralla, jotta viikot joilla ei ole päällekkäisyyksiä eivät varaa turhaa tyhjää tilaa. Tietoinen, dokumentoitu epätarkkuus: sama tapahtuma voi teoriassa saada eri linjan eri viikoilla — ei haittaa, koska pyyntö oli nimenomaan "ei tarvii mitää mm tarkkuutta mut vähän sinnepäin".
- **Ei tehty / tietoisesti rajattu:** käsin lisätyille tapahtumille ei UI:ta usean päivän valintaan, tarkkaa tuntimäärän mukaista palkin pituutta (vain kokopäivän ruutu per kattama päivä, ei osapäivän murto-osaa), palkkien raahausta/venytystä.
- **Ei testattu vielä oikealla datalla** — testaa seuraavan kerran kun `sql/018_kalenteri_monipaivainen.sql` on ajettu ja kalenterissa on/synkataan oikea monipäiväinen tapahtuma, ks. "Testattavaa seuraavaksi".

## Kalenterisyötteet — geneerinen ulkoisen kalenterin veto (2026-07-08, uudelleensuunniteltu samana päivänä)

**HUOM tälle osiolle on ollut kaksi eri suunnitelmaa saman päivän aikana** — ensimmäinen versio (kahden Apple-tilin CalDAV-pull, kolme hardkoodattua kalenterinimeä "Yhteinen"/"Sininen"/"Punainen") korvattiin heti alla kuvatulla geneerisellä syötemallilla ennen kuin ensimmäistä versiota ehdittiin ajaa Supabaseen asti. Jos jostain vanhasta muistista/viestistä löytyy mainintoja `icloud_odottavat`-taulusta, `lahde_kalenteri`-sarakkeesta tai kahdesta erillisestä Apple-tunnuksesta (APPLE_EMAIL_KATRI/APPLE_EMAIL_JUHA) — ne ovat VANHENTUNEITA, ei näy koodissa enää.

**Tausta** (kontekstiksi jos joku myöhemmin miettii miksi ulkoinen kalenteriveto on ylipäätään tarpeen): perhe käyttää iCloud-kalenteria arjessa, ja siihen on ollut satunnaisia synkkakatkoja toisen lisäyksen näkymisessä toiselle. Todennäköisin syy: Katrin iCloud-tallennustila on toistuvasti lähes täynnä (kasvavat kuvat), ja Apple dokumentoi että "iCloud Calendar requires free storage before it can sync your calendar's data". Tätä ei ratkaista koodilla — ratkaisu on tallennustilan hallinta Katrin puolelta, tietoisesti jätetty auki, ei pakollinen ehto tälle ominaisuudelle.

**Valittu arkkitehtuuri: YKSI yleinen syötekoneisto, ei erillisiä himmeleitä per kalenteri.** Uusi taulu `kalenteri_syotteet` listaa jokaisen ulkoisen kalenterin DATANA (nimi, tyyppi, tunniste, tila, väri, enabled) — uuden kalenterin lisääminen on Table Editor -rivinlisäys, EI koodimuutos. Tämä on tietoisesti tehty ennen kaikkea siksi että kehityskone palautuu 23.7.2026, jonka jälkeen projektia jatketaan pelkällä Copilotilla eikä sen pitäisi tarvita koskaan koskea `api/caldav-sync.js`-tiedostoon uutta kalenteria lisätessä.

**Kaksi syötetyyppiä** (`kalenteri_syotteet.tyyppi`):
- `'icloud'` — haetaan CalDAV:illa. `tunniste`-sarake on CalDAV-kalenterin TARKKA näyttönimi iCloudissa (esim. "Yhteinen") — täytyy täsmätä kirjain kirjaimelta. **Minkä tilin tunnuksilla haetaan, kertoo `account_key`-sarake** (`'katri'`/`'juha'`, ks. "Useampi CalDAV-tili" alla) — TÄRKEÄ MUUTOS 2026-07-08 illalla, ks. sen osion tausta.
- `'ics_url'` — haetaan suoraan HTTP GET:llä julkaistusta `.ics`-tiedostosta, EI vaadi mitään kirjautumista, `account_key` ei koske tätä tyyppiä ollenkaan. `tunniste`-sarake on tällöin se https-osoite. Tätä käytetään mm. testaamiseen (ks. alla).

**Kaksi tilaa** (`kalenteri_syotteet.mode`):
- `'taysi'` — koko tapahtuma (nimi + aika) menee AINA hyväksyntäjonoon (`kalenteri_odottavat`-tauluun), ei koskaan suoraan läpi. **Tietoinen yksinkertaistus:** ensimmäisessä (hylätyssä) suunnitelmassa oli VEVENTin ORGANIZER-kenttään perustuva automaattihyväksyntä omille tapahtumille — tämä poistettiin, koska "yksi yleinen koneisto" -periaate voitti. Jos myöhemmin halutaan jonkun oman kalenterin ohittavan hyväksynnän aina, looginen tapa olisi lisätä kolmas mode-arvo (esim. `'taysi_auto'`) — EI ole tehty, ei pyydetty.
- `'vain_varattu'` — yksityisyyssuoja esim. toisen työkalenterille: KAIKKI paitsi alku/loppuaika riisutaan JO TUONNISSA `api/caldav-sync.js`:ssä (funktio `varattuTapahtumaksi()`) — otsikko, paikka, osallistujat eivät koskaan päädy edes väliaikaiseen muuttujaan saati tietokantaan. Tallennettu tapahtuma näkyy agendassa suoraan tekstillä `"🔒 Varattu 18–20"` (tai `"🔒 Varattu (koko päivä)"` koko päivän tapahtumille). Ohittaa hyväksyntäjonon kokonaan koska mitään hyväksyttävää sisältöä ei ole — menee suoraan `kalenteri_tapahtumat`-tauluun.

**Tietokanta (`sql/014_kalenteri_syotteet.sql`):**
- Uusi taulu `kalenteri_syotteet` (id, name, tyyppi, tunniste, mode, vari, enabled, last_synced_at, created_at) — `vari` on hex-merkkijono (esim. `'#9B7FD4'`) jota käytetään agendan värimerkintään; jos null, JS käyttää `var(--muted)`-oletusta
- `kalenteri_tapahtumat.syote_id` — viittaa `kalenteri_syotteet(id)`:hen, NULL jos käsin lisätty Satamassa suoraan
- `kalenteri_tapahtumat.ical_uid` (text, unique, nullable) — iCalendarin UID (+ `#`-liite toistuvan tapahtuman yksittäiselle esiintymälle, ks. alla), estää saman tapahtuman tuomisen kahdesti. Nimetty `ical_uid` eikä `icloud_uid`, koska UID on iCalendar-formaatin oma kenttä, ei icloud-spesifinen — sama pätee ics_url-syötteisiin.
- `kalenteri_tapahtumat.event_end_time` — tarvitaan `vain_varattu`-tilan "18–20"-näytölle, mutta käytettävissä yleisemminkin
- Uusi taulu `kalenteri_odottavat` (id, ical_uid, syote_id, title, event_date, event_time, event_end_time, status `'odottaa'`/`'hylatty'`) — hyväksyntää odottavat `taysi`-tilan tuonnit. Pidetty ERILLÄÄN `kalenteri_tapahtumat`-taulusta, jottei tarvinnut koskea mihinkään jo toimivaan agendan hakulogiikkaan (`lataaKalenteri()` script.js:ssä suodattaa aina vain `kalenteri_tapahtumat`-taulua).
- **(`sql/017_kalenteri_tilit.sql`, lisätty 2026-07-08 illalla, AJETTAVA):** `kalenteri_syotteet.account_key` (`'katri'`/`'juha'`, oletus `'katri'`) — ks. "Useampi CalDAV-tili" alla.

**Useampi CalDAV-tili (lisätty 2026-07-08 illalla, `sql/017_kalenteri_tilit.sql`):** testissä havaittiin ettei kaikki perheen tapahtumat ole jaetussa kalenterissa — osa elää Juhan HENKILÖKOHTAISISSA kalentereissa, joita Katrin iCloud-tunnukset eivät näe ollenkaan. Siksi synkka tukee nyt kahta iCloud-tiliä:
- Uusi sarake `kalenteri_syotteet.account_key` (`'katri'`/`'juha'`, oletus `'katri'`, koskee vain `tyyppi='icloud'`-rivejä) kertoo MINKÄ tilin tunnuksilla syöte haetaan. **Salasanat pysyvät AINA ympäristömuuttujissa** — tauluun tulee vain viittausavain, ei koskaan mitään salaista ("kaikki säädettävä on dataa" -periaate ilman että se koskaan tarkoittaisi salaisuuksia tietokannassa).
- `api/caldav-sync.js`:n `TILIT`-map yhdistää `account_key`-arvon oikeaan ympäristömuuttujapariin. Puuttuvat tunnukset validoidaan VASTA `haeIcloudSyote()`:n sisällä (per syöte), EI koko funktion alussa — jos vain Juhan tunnukset puuttuisivat, Katrin syötteet synkkautuisivat silti normaalisti, virhe näkyisi vain sen yhden syötteen kohdalla vastauksen `syotteet`-listassa.
- **Duplikaattisuoja jaetulle kalenterille:** jos sama jaettu perhekalenteri näkyy MOLEMMILLA tileillä, sama tapahtuma ei saa tulla tuotua/jonoon kahdesti. Tämä oli jo valmiiksi ratkaistu ennen tätä muutosta: `ical_uid`-sarakkeen UNIQUE-rajoite + `on_conflict=ical_uid&resolution=ignore-duplicates` (ks. "Tekniset kiemurat" alla) toimii identtisesti riippumatta siitä tuliko tapahtuma yhdeltä vai kahdelta tilarilta samanaikaisesti — ei vaatinut mitään uutta koodia, vain testi tälle nimenomaiselle tapaukselle (ks. "Testattavaa seuraavaksi").
- **Per-syöte kalenterivalinta** (mistä useamman kalenterin tililtä haetaan juuri oikea) hoituu jo ennestään `tunniste`-sarakkeella (CalDAV-näyttönimi) — ei vaatinut uutta saraketta, koska tämä oli jo rakennettu geneeriseksi ennen tätä muutosta.

**Ympäristömuuttujat** (Vercel Project Settings → Environment Variables, Production + Preview):
- `SUPABASE_SERVICE_KEY` — sama kuin `api/add.js`:llä jo on. **Jo asetettu.**
- `ICLOUD_USERNAME` / `ICLOUD_APP_PASSWORD` — Katrin tili. Käyttäjätunnus on Apple ID -kirjautumisosoite (**jos CalDAV-login palauttaa 401:** ensimmäinen kokeiltava korjaus on vaihtaa `@icloud.com`-muotoon), salasana appleid.apple.com:ista (Kirjautuminen ja suojaus → Sovelluskohtaiset salasanat) luotu sovelluskohtainen salasana, EI oikea iCloud-salasana. Merkitty Vercelissä sensitiiviseksi. **Jo asetettu ja TOIMII 2026-07-08 illasta lähtien** — ensimmäinen `ICLOUD_APP_PASSWORD`-arvo oli väärin (401), korjattu ja redeployattu, `?listaa=katri` (ks. alla) vahvisti toimivaksi.
- `ICLOUD_USERNAME_JUHA` / `ICLOUD_APP_PASSWORD_JUHA` — Juhan tili, sama periaate kuin yllä. **Katrin mukaan jo asetettu Verceliin 2026-07-08 illalla**, EI VIELÄ vahvistettu toimivaksi (`?listaa=juha` testaamatta) — jos synkka valittaa puuttuvista/virheellisistä Juhan tunnuksista, tarkista Vercelin ympäristömuuttujista että nimet ovat TÄSMÄLLEEN nämä (helppo kirjoitusvirhepaikka, esim. `_JUHA`-pääte unohtuu) ja että salasana on oikea (samantyyppinen 401 kuin Katrin tilillä ensin oli mahdollinen).

**Diagnostiikka kalenterien nimien selvittämiseen (lisätty 2026-07-08 illalla):** `GET /api/caldav-sync?listaa=katri` (tai `?listaa=juha`) palauttaa JSON:ina sen tilin kalentereiden TÄSMÄLLISET näyttönimet synkkaamatta mitään — esim. `{"tili":"katri","kalenterit":["Perhekalenteri","Juha","Katri"]}`. Tarpeen koska `kalenteri_syotteet.tunniste` (icloud-tyyppisillä syötteillä) pitää täsmätä CalDAV-näyttönimeen kirjain kirjaimelta, eikä sitä voi arvata. Toteutettu `api/caldav-sync.js`:n `listaaKalenterit()`/`kirjauduIcloudiin()`-funktioilla (jälkimmäinen erotettu omaksi, jotta kirjautumislogiikka ei toistu `haeIcloudSyote()`:ssa).

**Manuaalinen synkan laukaisu selaimesta (ei vaadi kirjautumista Satamaan):** `GET /api/caldav-sync` (ei parametreja) — sama endpointti jota sovellus kutsuu automaattisesti Kalenteri-näkymän avautuessa, mutta voi kutsua myös suoraan URL-osoitteella jos haluaa varmistaa synkan onnistumisen näkemättä selaimen kehittäjätyökaluja.

**Aikabudjetti ja tietoiset rajaukset** (max 4 päivää koko tälle ominaisuudelle sovittu, "toimiva suppea voittaa keskeneräisen täydellisen"):
- Haetaan vain seuraavat `PAIVIA_ETEENPAIN = 30` päivää (vakio `api/caldav-sync.js`:n alussa, helppo säätää)
- **Toistuvat tapahtumat (RRULE) puretaan itse ICAL.js:n `event.iterator()`:lla**, EI luoteta CalDAV-palvelimen valinnaiseen server-side expand -ominaisuuteen (joka oli ensimmäisessä suunnitelmassa, mutta ei toimisi `ics_url`-syötteillä joissa ei ole CalDAV-palvelinta ollenkaan) — tämä toimii YHTENÄISESTI molemmilla syötetyypeillä. Testattu käsin ennen tätä kirjoitusta esimerkki-ICS:llä (kertaluontoinen + koko päivän + viikoittain toistuva tapahtuma) — kaikki kolme tapausta tuottivat oikeat päivämäärät/kellonajat.
- Turvaraja `MAX_ESIINTYMAA_SARJASSA = 60` per toistuva sarja, ettei viallinen/loputon RRULE voi jumittaa funktiota
- **Ei kirjoiteta mitään takaisin iCloudiin** (pull-only) — kaksisuuntaisuus vasta kun yksisuuntainen veto on todistetusti luotettava, tämä oli eksplisiittinen päätös

**Tekniset kiemurat:**
- `api/caldav-sync.js` käyttää kirjastoja `tsdav` (CalDAV-yhteys) ja `ical.js` (iCal-jäsennys + toistuvuuden purku) — ensimmäiset npm-riippuvuudet koko projektissa, siksi `package.json`/`package-lock.json` ovat nyt olemassa juuressa. Koskevat VAIN Vercelin serverless-funktioita, eivät etusivun vanilla-JS-koodia (ei build-vaihetta index.html/script.js/style.css:lle).
- **Aikavyöhyke hoidettu tarkoituksella erikoistapauksena:** Vercel ajaa funktiot UTC-aikavyöhykkeellä. Koko päivän tapahtumille (`ICAL.Time.isDate === true`) päivämäärä luetaan suoraan `.year`/`.month`/`.day`-kentistä, EI koskaan `toJSDate()` + paikallinen `getDate()`-reitin kautta, koska se siirtäisi päivän yhdellä taaksepäin UTC-palvelimella (todennettu käsin testillä ennen koodin kirjoittamista). Ajallisille tapahtumille kellonaika muunnetaan `Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', hourCycle: 'h23' })`:lla — HUOM `hourCycle: 'h23'` eikä `hour12: false`, koska jälkimmäinen tuottaa joissain ICU-versioissa "24" eikä "00" keskiyöllä.
- `on_conflict=ical_uid` + `Prefer: resolution=ignore-duplicates` Supabase-lisäyksissä tekevät synkasta turvallisen ajaa useasti peräkkäin/päällekkäin ilman virheitä.
- **sw.js piti korjata tätä varten:** service workerin cache-first-logiikka olisi cachennut `/api/caldav-sync`:n GET-vastauksen ensimmäisen kutsun jälkeen ja tarjoillut täsmälleen saman vastauksen ikuisesti sen jälkeen (GET-pyynnöt jäävät kiinni `caches.match()`:iin, POST-pyynnöt eivät — siksi `api/add.js` ei koskaan kärsinyt tästä). Korjattu lisäämällä `/api/`-polut samaan poikkeukseen kuin `supabase.co`-kutsuilla jo oli (`sw.js`, `fetch`-tapahtumankuuntelija) — kattaa automaattisesti kaikki tulevatkin `/api/`-endpointit.
- **Vercel Cron ei ole käytössä:** Hobby-tason cron-jobit toimivat vain kerran vuorokaudessa eivätkä täsmällisesti (Vercel voi ajaa milloin tahansa ilmoitetun tunnin sisällä) — liian harvoin. Sen sijaan `/api/caldav-sync` kutsutaan sovelluksesta (`script.js`: `synkkaaICloud()`) aina kun Kalenteri-näkymä avataan. Jos Verceliin joskus lisätään Pro-taso ja halutaan taustalla ajastettu varmistus (esim. 5 min välein), se vaatisi `vercel.json`:iin cron-määrityksen — EI tehty, koska ei ole varmuutta onko Vercel-tilaus Pro-tasolla.

**UI:**
- Kalenteri-laatan merkki etusivulla (`.tile-badge[data-osio-key="kalenteri"]`, sama yleinen mekanismi kuin Laiturin uusien-merkillä) näyttää `kalenteri_odottavat`-rivien määrän (`status='odottaa'`), päivittyy `paivitaKalenteriBadge()`:llä
- Kalenteri-näkymän yläosaan ilmestyy "⏳ N odottaa hyväksyntää — näytä" -linkki (`#kalenteri-odottaa-linkki`) kun jotain odottaa
- Linkin klikkaus avaa `#kalenteri-hyvaksynta-overlay`-dialogin: yksi kortti per odottava tapahtuma, värillinen pallo (`kalenteri_syotteet.vari`, haettu FK-yhdistelmällä) kertoo lähdesyötteen, Ok siirtää `kalenteri_tapahtumat`-tauluun (ja pois odottavista), Hylkää merkitsee `status='hylatty'` — EI POISTETA, muuten sama tapahtuma tuotaisiin seuraavassa synkkauksessa uudelleen koska `ical_uid` unohtuisi
- Agendan riveillä (`piirraKalenteriRivi()`) sama värillinen pallo (`rivi._vari`, inline `style.backgroundColor`, EI kovakoodattuja väriluokkia) kertoo minkä syötteen tapahtuma on — `lataaKalenteri()` hakee värin `kalenteri_syotteet(vari)`-upotuksella samassa kyselyssä (`select('*, kalenteri_syotteet(vari)')`)

**Testaus ilman oikeaa työkalenteria — todistettu putki ennen oikeaa dataa:** koska Juhan oikeaa työkalenteria ei ole vielä olemassa/tiedossa, koko `vain_varattu`-anonymisointiputki voidaan todistaa toimivaksi jo etukäteen: luo mikä tahansa testikalenteri (iCloud tai Google Kalenteri käy), julkaise se julkiseksi ICS-linkiksi, lisää se `kalenteri_syotteet`-tauluun `tyyppi='ics_url'`, `mode='vain_varattu'`. Kun oikea työkalenteri joskus tulee, jäljellä on vain yksi datarivin lisäys — EI koodimuutosta.

**Varasuunnitelma jos työnantajan kalenteri ei tue ICS-julkaisua:** monet yritykset käyttävät Microsoft Exchange/Outlookia, joka ei aina salli julkisen ICS-linkin julkaisua. Jos näin käy, vaihtoehto on Microsoft Graph API -integraatio (OAuth-kirjautuminen Juhan työtilille, ei julkinen linkki) — tämä on selvästi isompi työ (OAuth-flow, tokenin uusinta, eri API-muoto kokonaan) eikä kuulu tähän E1-versioon. Kirjattu tähän ettei unohdu jos ICS-linkki osoittautuu mahdottomaksi saada.

**Tunnetut rajoitukset / ei tehty tässä vaiheessa:**
- Ei kirjoiteta mitään takaisin iCloudiin (pull-only), ks. yllä
- Ei organizer-pohjaista automaattihyväksyntää (tietoinen yksinkertaistus, ks. yllä "Kaksi tilaa")
- Katrin oman iCloud-tilan täyttymisen aiheuttamaa katkoa ei ratkaista koodilla
- **Testattu 2026-07-08 illalla** (`sql/014_kalenteri_syotteet.sql` ajettu) — tästä testistä löytyi kaksi asiaa: 1) kaikki perheen tapahtumat eivät olleet jaetussa kalenterissa, osa eli Juhan henkilökohtaisissa kalentereissa joita Katrin tunnukset eivät nähneet (korjattu: tuki toiselle CalDAV-tilille, ks. "Useampi CalDAV-tili" yllä), 2) **`kalenteri_syotteet`-taulu oli tosiasiassa TYHJÄ koko ajan** — synkka ei koskaan tuonut mitään koska mitään syöteriviä ei ollut olemassa, ei koodivirhe. Korjattu siirtämällä syötedatan lisäys omaksi versioiduksi migraatiokseen (`sql/019_kalenteri_syotteet_data.sql`) — ks. **PERIAATE**-huomautus yllä "Tiedostorakenne"-osion lopussa: kaikki data, myös syötteet, kulkee migraationa, ei koskaan irtokomentona SQL Editoriin.

### Ajolista 2026-07-08 illalle (aja Supabasessa TÄSSÄ JÄRJESTYKSESSÄ)

1. **`sql/017_kalenteri_tilit.sql`** — lisää `kalenteri_syotteet.account_key`-sarakkeen. VAADITAAN ennen kohtaa 3. **Ei turvallinen ajaa uudelleen** jos on jo ajettu (`alter table add column` kaataa virheellä "column already exists") — jos epävarma onko jo ajettu, tarkista ensin: `select column_name from information_schema.columns where table_name='kalenteri_syotteet' and column_name='account_key';` (jos palauttaa rivin, on jo ajettu, ohita).
2. **`sql/018_kalenteri_monipaivainen.sql`** — lisää `event_end_date`-sarakkeen (`kalenteri_tapahtumat`/`kalenteri_odottavat`). RIIPPUMATON kohdista 1 ja 3, voi ajaa missä välissä tahansa. Samat "ei turvallinen ajaa uudelleen" -ehdot kuin kohdassa 1 (tarkistus: `select column_name from information_schema.columns where table_name='kalenteri_tapahtumat' and column_name='event_end_date';`).
3. **`sql/019_kalenteri_syotteet_data.sql`** — lisää kolme syöterivia Katrin tilille (Perhekalenteri/Juha/Katri, `mode='taysi'`) + uniikki-rajoite. VAATII kohdan 1 (`account_key`-sarakkeen) olevan olemassa, epäonnistuu selkeällä virheellä jos ei ole. **Turvallinen ajaa uudelleen** — `on conflict (tunniste, account_key) do nothing` estää tuplarivit, mutta uniikki-rajoitteen LUONTI itsessään (`add constraint`) kaatuu jos rajoite on jo olemassa edellisestä ajosta — jos näin käy, poista se rivi (`alter table ... add constraint ...`) tiedostosta käsin ennen uudelleenajoa TAI jätä koko migraatio ajamatta jos se on jo onnistuneesti ajettu kerran.

**Sen jälkeen:** avaa Sataman Kalenteri-näkymä (käynnistää synkan automaattisesti) TAI avaa selaimessa `https://kauppalista-nine.vercel.app/api/caldav-sync` suoraan nähdäksesi onnistumisen JSON-vastauksena. "laivatesti joulukuussa" (Perhekalenterissa) pitäisi nousta "⏳ N odottaa hyväksyntää" -jonoon.

**Juhan tili on OMA, myöhempi vaihe** — ei tässä ajolistassa, ks. "Testattavaa seuraavaksi" -osion vastaava kohta.

## Push-ilmoitukset (2026-07-08)

Yleiskäyttöinen web push -infra — EI sidottu mihinkään yksittäiseen ominaisuuteen, vaan perusta kaikelle tulevalle joka tarvitsee ilmoituksia (muistutukset, Horisontti-ehdotukset, kalenterisyötteiden hyväksyntäjonon herätteet ym.). Tässä vaiheessa rakennettu VAIN tilaus + manuaalinen testilähetys — AJASTETTUA lähetystä (esim. cron joka tarkistaa erääntyviä muistutuksia) EI ole vielä, se tulee omana myöhempänä palasenaan kun ensimmäinen oikea muistutusominaisuus rakennetaan.

**VAPID-avainpari** generoitu `web-push`-kirjastolla 2026-07-08. Julkinen avain on suoraan `script.js`:ssä koodissa (`VAPID_PUBLIC_KEY`-vakio) — tämä on tarkoituksellista, julkinen avain SAA näkyä selaimelle, vain yksityinen avain on salainen. Yksityinen avain on Vercelin ympäristömuuttujissa:
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (sensitive) / `VAPID_SUBJECT` (muotoa `mailto:joku@osoite.fi` — mikä tahansa toimiva sähköposti kelpaa, push-palvelut käyttävät tätä vain hätätapauksessa ottaakseen yhteyttä lähettäjään)
- **Nämä on jo asetettu Vercelin puolella 2026-07-08** — jos joskus generoidaan uusi avainpari (esim. vanha vuotaa), KAIKKI olemassa olevat `push_tilaukset`-rivit lakkaavat toimimasta ja käyttäjien pitää tilata ilmoitukset uudelleen, koska selaimen tilaus on sidottu siihen avainpariin jolla se luotiin.

**Tietokanta (`sql/015_push_tilaukset.sql`):** taulu `push_tilaukset` (user_id, endpoint UNIQUE, p256dh, auth, failed_count). RLS: käyttäjä hallitsee vain omia rivejään (select/insert/update/delete kaikki `auth.uid() = user_id`) — UPDATE-policy tarvitaan koska frontend käyttää `upsert`:ia (sama laite voi tilata uudelleen, silloin `ON CONFLICT (endpoint) DO UPDATE` -haara vaatii UPDATE-oikeuden RLS:ssä, ei riitä pelkkä INSERT-policy). Itse lähetys (`api/push-test.js`) käyttää service_role-avainta ja ohittaa RLS:n kokonaan — tavallinen käyttäjä ei koskaan lähetä pushia suoraan.

**sw.js:** kaksi uutta tapahtumankuuntelijaa:
- `push` — näyttää ilmoituksen (`self.registration.showNotification`). Payload on aina JSON `{title, body}`; jos JSON-jäsennys epäonnistuu, näytetään silti geneerinen ilmoitus tekstillä ettei push katoa täysin hiljaa.
- `notificationclick` — sulkee ilmoituksen ja joko fokusoi jo auki olevan PWA-ikkunan tai avaa uuden. Ei reititä mihinkään tiettyyn näkymään (esim. suoraan Kalenteriin) — tämä on tarkoituksellista yksinkertaisuutta ensimmäisessä versiossa, voidaan tarkentaa myöhemmin jos tarpeen.

**Frontend (`script.js`, uusi "PUSH-ILMOITUKSET"-osio):**
- `paivitaPushTila()` — tarkistaa selaintuen, `Notification.permission`-tilan (`'granted'`/`'denied'`/`'default'`) ja onko `pushManager.getSubscription()` jo olemassa, päivittää Asetukset-näkymän tekstin ja nappien näkyvyyden sen mukaan
- `pyydaIlmoitusLupa()` — kutsutaan VAIN "Salli ilmoitukset" -napin klikkauksesta, EI koskaan automaattisesti sivun latautuessa. Tämä on iOS:n vaatimus: `Notification.requestPermission()` pitää laueta suoraan käyttäjän omasta napinpainalluksesta, muuten selain hylkää pyynnön hiljaisesti. Onnistuneen luvan jälkeen tilataan `pushManager.subscribe(...)` ja tallennetaan tilaus (`endpoint`/`p256dh`/`auth`) Supabaseen `upsert`:illa (`onConflict: 'endpoint'`, jottei sama laite luo tuplariviä jos se tilaa uudelleen).
- `laheteTestipush()` — "Lähetä testi-ilmoitus" -napin handleri, hakee oman istunnon `access_token`:n (`db.auth.getSession()`) ja lähettää sen `Authorization: Bearer`-headerissa `/api/push-test`:lle, joka tunnistaa käyttäjän sillä (ks. alla). Tulos näytetään `naytaIlmoitus()`-toastilla (sama mekanismi kuin pakkauslistan nollauksessa).
- `urlBase64ToUint8Array()` — vakioapufunktio VAPID-julkisen avaimen muuntamiseksi `pushManager.subscribe()`:n vaatimaan `Uint8Array`-muotoon, ei mitään Satama-spesifistä.

**Asetukset-näkymä (`#asetukset-view`, UUSI, `index.html`):** ensimmäinen kevyt runko Asetukset-osiolle (aiemmin pelkkä "tulossa pian" -alert). Toistaiseksi vain "🔔 Ilmoitukset" -lohko: tilateksti + "Salli ilmoitukset" / "Lähetä testi-ilmoitus" -napit (`.settings-action-btn`-luokka, täysleveä nappi, tyylillisesti sama kuin `.login-btn`). `avaaOsio()`:n `route === 'asetukset'` -haara avaa tämän näkymän `alert()`:n sijaan.

**`api/push-test.js`:** tunnistaa kutsujan `Authorization: Bearer <access_token>` -headerista kutsumalla Supabasen `/auth/v1/user`-endpointia (EI service_role-tunnistusta, oikea käyttäjä-JWT) — näin funktio ei koskaan voi vahingossa lähettää pushia väärälle käyttäjälle. Hakee vain SEN käyttäjän `push_tilaukset`-rivit, lähettää jokaiseen `web-push`:lla. Jos push-palvelu vastaa 404/410 (tilaus ei ole enää voimassa, esim. appi poistettu laitteelta), rivi poistetaan automaattisesti `push_tilaukset`-taulusta. Muun virheen sattuessa `failed_count`-sarake kasvaa (ei vielä käytössä mihinkään logiikkaan, kerää dataa mahdollista myöhempää "poista jos epäonnistunut N kertaa" -siivousta varten).

**iOS-reunaehdot (tärkeitä muistaa testatessa):**
- Push toimii VAIN kotinäytölle asennetussa PWA:ssa, ei tavallisessa Safari-välilehdessä, ja vaatii iOS 16.4+
- Ilmoitus on tavallinen järjestelmäilmoitus, EI herätyskellomainen kriittinen hälytys (ei toimi jos puhelin on Älä häiritse -tilassa/mykistetty, ei omaa erillistä lupatasoa)
- Jos käyttäjä on joskus evännyt luvan, sitä EI voi enää kysyä uudelleen `Notification.requestPermission()`:lla — täytyy mennä puhelimen omiin asetuksiin (Safarin PWA-asetukset per sivusto) ja sallia sieltä käsin. `paivitaPushTila()` näyttää tästä selkeän tekstin (`Notification.permission === 'denied'` -haara) sen sijaan että nappi vain ei tekisi mitään

**Ei vielä tehty / seuraava askel (oma myöhempi työnsä, ei tässä):**
- Ajastettu lähetys (esim. Vercel-funktio joka tarkistaa erääntyviä muistutuksia ja lähettää automaattisesti) — vaatii saman Hobby-cron-rajoitteen huomioimisen kuin Kalenterisyötteissä (ks. sen osion "Vercel Cron ei ole käytössä" -kohta)
- Ilmoituksen napautuksen reitittäminen tiettyyn näkymään (nyt vain fokusoi/avaa appin etusivulle)
- `failed_count`:in käyttö automaattiseen tilauksen poistoon toistuvien epäonnistumisten jälkeen

## Oma Hytti (2026-07-08)

Henkilökohtainen työtila — Juhalle työasiat (papin caset), Katrille opiskelu. **TÄYSIN yksityinen: EI jakokytkintä, EI shared-haaraa ollenkaan** (poikkeaa siis Muistilapuista/Varastosta, joissa on näkyvyysvalinta) — RLS suodattaa aina vain kirjautuneen omat rivit, kumpikin näkee vain omansa vaikka näkymä ja koodi on yksi ja sama molemmille käyttäjille. Sama yksinkertaisin mahdollinen policy-malli kuin `ankkurit`-taulussa, mutta ei-jaettu versio siitä.

**Tietomalli (`sql/016_hytti.sql`, AJETTU Supabasessa 2026-07-08):**
- `hytti_kortit`: `id`, `owner_id`, `name`, `card_type` (`'paattyva'` = valmistuu ja arkistoituu / `'jatkuva'` = elää pitkään, ei koskaan arkistoida), `status` (`'aktiivinen'`/`'arkistoitu'`), `seuraava_askel` (text, näkyy kortin avatessa heti mistä jatkaa), `sort_order`
- `hytti_rivit`: `id`, `kortti_id` (FK), `content`, `is_header` (toimii täysin kuten `tuotteet.is_header` — `#`-etuliite lisäyskentässä tekee väliotsikon), `is_task`, `done`, `done_at`, `due_date` (nullable), `sort_order`
- RLS: `hytti_kortit_all` suoraan `owner_id = auth.uid()`. `hytti_rivit_all` kortin omistajuuden kautta (`exists`-alikysely) — rivit eivät kanna omaa `owner_id`:tä.

**Navigointi:** etusivun "Oma Hytti" -laatta (`home_sections.key = 'hytti'`, oli aina olemassa mutta osoitti `alert()`:iin) avaa nyt oikean näkymän — `avaaOsio()` `route === 'hytti'` -haara.

**HYTTI-PÄÄNÄKYMÄ (`#hytti-view`, `lataaHyttiPaanakyma()`):**
1. **Tehtävät-kooste** — kaikkien AKTIIVISTEN korttien avoimet (`is_task=true, done=false`) tehtävärivit yhtenä listana, järjestys eräpäivän mukaan nousevasti (deadlinettomat viimeisenä, `nullsFirst: false`). Haku käyttää `hytti_rivit!inner(...)`-embedausta jotta `hytti_kortit.status='aktiivinen'`-suodatus rajaa myös itse tehtävärivejä, ei vain sisäkkäistä objektia. Rivillä: teksti + eräpäivä päivinä ("4 pv" / "tänään" / "3 pv sitten" — AINA muted-värillä, EI punaista edes ylittyneelle, tietoinen valinta ettei lista näytä stressaavalta) + kortin nimi pienellä perässä. **Täppäys tässä täppää saman tietueen kortillakin — ei kopiota**, koska molemmat näkymät lukevat/kirjoittavat samaa `hytti_rivit`-riviä. ⚓-nappi nostaa/irrottaa Ankkureihin samalla yleisellä mekanismilla kuin Muistilaput/Kalenteri (`vaihdaAnkkurointiYleinen('hytti', rivi.id, ...)`) — Ankkurin täppäys etusivulla EI täppää alkuperäistä hytti-riviä (sama toteutunut käytös kuin muillakin ankkuroitavilla lähteillä, ei Hytti-spesifinen poikkeama).
2. **Kortit-listaus** — aktiiviset kortit, nimi + `seuraava_askel` pienellä sen alla. Raahausjärjestys (`alustaRaahaus`, taulu `hytti_kortit`). Napautus avaa korttinäkymän.
3. **Uusi kortti** -lisäysrivi: nimi-kenttä + tyyppivalinta (Jatkuva/Päättyvä-painikkeet, sama `.kalenteri-tila-btn`-tyyli kuin Kalenterin päivä/viikko/kuukausi-valitsimessa) + lyhyt selite tekstinä alla.
4. **Arkisto-linkki** alhaalla, näkyy vain jos arkistoituja kortteja on ≥1. Avaa overlay-listan joista klikkaus avaa kortin lukutilaan.

Jos aktiivisia kortteja ei ole yhtään, Tehtävät- ja Kortit-osiot piilotetaan kokonaan ja tilalla näkyy muted-tekstinä: *"Yksi kortti per tilaisuus tai kokonaisuus. Kirjoita muistiinpanot riveiksi, merkkaa toimintaa vaativat tehtäviksi — ne kokoontuvat itsestään ylös Tehtäviin. Ideat kuuluvat Laituriin, työn alla olevat tänne."*

**KORTTINÄKYMÄ (`#hytti-kortti-view`, `avaaHyttiKortti()` → `lataaHyttiKortti()`):**
- Otsikko + `seuraava_askel`-kenttä heti alla, napautus → inline-muokkaus (sama tekniikka kuin listan rivin nimen muokkaus: `<input>` korvaa `<span>`:n, `blur`/`Enter` tallentaa).
- Rivit lisätään kuten Muistilapuilla: `#`-etuliite tekee väliotsikon (`is_header`), otsikon napautus kohdistaa seuraavat lisäykset sen alle (`aktiivinenHyttiOtsikkoId`, sama periaate kuin `aktiivinenOtsikkoId`). Inline-muokkaus ja poisto (vahvistuksella) kaikilla riveillä.
- Jokaisella EI-otsikkorivillä on tehtävätoggle-nappi (☑, tyyliltään sama kuin ⚓-nappi): päälle kytkettynä rivi saa checkboxin (○/✓) ja eräpäivä-linkin ("+ eräpäivä" / "N pv"), napautus avaa `prompt()`-kentän päivämäärälle (VVVV-KK-PP, tyhjä poistaa). Pois kytkettäessä `done`/`due_date`/`done_at` nollautuvat.
- **"Arkistoi"-nappi** (📦, otsikkorivin oikeassa yläkulmassa) näkyy VAIN päättyvillä (`card_type='paattyva'`) aktiivisilla korteilla — jatkuvilla ei näy ollenkaan. Vahvistuksen jälkeen kortti siirtyy `status='arkistoitu'` ja näkymä palaa päänäkymään.
- **Lukutila:** kun avataan arkistoitu kortti (arkisto-overlaysta), sama näkymä renderöityy read-only-tilassa — ei lisäysriviä, ei muokkaus-/poisto-/tehtävänappeja, checkboxit disabloitu. Otsikkorivin nappi näyttää silloin "↩ Palauta" -toiminnon, joka vie kortin takaisin `status='aktiivinen'`ksi ilman erillistä vahvistusta (ei-destruktiivinen teko).

**EI V1:ssä (kirjattu, ei rakennettu — samat rajaukset kuin Katrin alkuperäisessä speksissä):** Ohjebanneri-koneisto (oma myöhempi osio, ks. "Ohjebanneri-järjestelmä — suunnitelma"), haku, rivien siirto korttien välillä, Laituri→Hytti-sijoitus, muistutukset tehtäville (tulee push+muistutukset-vaiheen yhteydessä samalla mekanismilla kuin muuallekin), Opiskelu-AI-kytkökset, hytin nimen vaihto (laatan nimi "Oma Hytti" riittää nyt).

**Kalenteri-integraatio (lisätty samana päivänä, Katrin pyynnöstä):** Kalenterin päivänäkymän tänään-agendaan (sama paikka johon aktiiviset Ankkuritkin sulautuvat) nostetaan nyt myös kaikki Oma Hytin tänään erääntyvät (`due_date` = tänään, `is_task=true`, `done=false`, kortti aktiivinen) tehtävät, tekstin edessä 🚪-ikoni. Rivillä on täppäysnappi (täppää saman `hytti_rivit`-tietueen, näkyy myös kortin sisällä) ja ⚓-nappi Ankkureihin nostoa varten (`vaihdaAnkkurointiYleinen('hytti', ...)`, sama mekanismi kuin Hytin omassa Tehtävät-koosteessa). **Asetukset-näkymässä** on uusi "🚪 Oma Hytti" -kytkin ("Näytä tänään erääntyvät Kalenterin päivänäkymässä", sama iOS-tyylinen `.toggle`-komponentti kuin listan jako-kytkimessä) — pois päältä kytkettynä Hytin tehtävät eivät nouse Kalenteriin ollenkaan. Kytkimen tila on **laitekohtainen** (`localStorage`-avain `kauppalista_hytti_kalenterissa`, oletus päällä), EI synkattu Supabaseen — sama periaate kuin muillakin tämän appin laitekohtaisilla asetuksilla (esim. `kauppalista_viimeisin_lista`).

**Testattu:** `sql/016_hytti.sql` on ajettu Supabasessa 2026-07-08. Kahden tilin testi (Katri + Juha, ettei kumpikaan näe toisen kortteja/tehtäviä missään näkymässä — ei päänäkymässä, ei Ankkureissa, ei Tehtävät-koosteessa, ei Kalenterin tänään-agendassa) on VIELÄ TEKEMÄTTÄ, ks. "Testattavaa seuraavaksi".

## Horisontti — suunnitelma (kirjattu 2026-07-08, EI TOTEUTETTU, tarkoitus rakentaa Copilot-ajalla 23.7.2026 jälkeen)

**Tämä on suunnitelma, ei koodia.** Mitään tästä osiosta ei ole vielä toteutettu — ei taulua, ei UI:ta, ei laskentaa. Katri saneli tämän tarkkana ohjeistuksena tulevaa toteutusta varten, koska hän ei itse enää ole rakentamassa tätä (kehityskone palautuu 23.7., loppuosa tehdään Copilotilla). Kirjattu tähän sanasta sanaan säilyttäen, jotta yksikään yksityiskohta (varsinkaan "MITÄ EI TEHDÄ" -kohta) ei katoa matkalla.

**Yhteys "Nostot"-visioon:** taulun nimi on tarkoituksella `nostot`, ei `horisontti_ehdotukset` tms. — tämä sama data on myös se pohja jolle Satama 2.0:n tuleva **Nostot**-osio (koko "kodin huoltokirja + vuosikello", ks. "Satama 2.0 — seuraavat vaiheet" -osio, kohta 4 seitsemän paikan listassa) rakentuu myöhemmin. Horisontti (etusivun ehdotuslohko) on siis vain tämän saman datan yksi näkymä/käyttöliittymä, ei erillinen järjestelmä.

**Tavoite:** Horisontti näyttää etusivulla enintään YHDEN lempeän ehdotuksen kerrallaan asiasta joka alkaa kaivata huomiota. Ehdottaa, ei vaadi — sävy on "voisiko tänään olla hyvä hetki...", EI KOSKAAN "myöhässä" tai punaista väriä. Vertailukohta on perheen oma toteutunut rytmi (opittu datasta), ei mikään ulkoinen ideaali tai siivousoppaan suositus.

**Tietomalli — uusi taulu `nostot`:**
- `id`
- `name` (text) — TÄMÄ on avain `events`-dataan: rytmi ketjutetaan täsmäyksellä `events.target_name = nostot.name`
- `oletus_vali_pv` (int) — siemenarvaus päivinä, käytössä kunnes dataa kertyy tarpeeksi
- `kasin_vali_pv` (int, null = ei asetettu) — jos käyttäjä asettaa tämän käsin, se YLIKIRJOITTAA opitun välin, EIKÄ data koskaan ylikirjoita tätä takaisin
- `kausi_alku_kk` / `kausi_loppu_kk` (int, null = ympärivuotinen) — esim. pakastimen sulatus vain syys–huhtikuu; jos jokin homma pitää tehdä kahdesti eri kausina (esim. renkaanvaihto keväällä JA syksyllä), siitä tehdään KAKSI ERI RIVIÄ, ei yhtä kahden kauden riviä
- `snoozed_until` (date) — asetetaan kun käyttäjä painaa "ei nyt"
- `hylkaykset_putkeen` (int, default 0)
- `enabled` (bool)
- ei tarvita erillistä järjestys-saraketta, Horisontti valitsee itse mikä näytetään (ks. alla)

**Rytmilaskenta:**
- Lähdedata: `events` -taulun rivit joilla `action='checked' AND target_name = nostot.name`, lasketaan peräkkäisten aikaleimojen välit päivinä
- Opittu väli = näiden välien **MEDIAANI**, EI keskiarvo — yksi unohtunut täppäys tai poikkeuksellisen pitkä väli ei saa vääristää koko rytmiä
- Opittu väli astuu voimaan vasta kun välejä (datapisteitä) on vähintään **3** — sitä ennen käytetään `oletus_vali_pv`:tä
- Voimassa oleva väli = `kasin_vali_pv` ?? opittu väli ?? `oletus_vali_pv` (ensimmäinen joka ei ole null, tässä järjestyksessä)
- **Tärkeä periaate:** kirjaamattomuus ei ole signaali mistään. Satama oppii VAIN siitä minkä se näkee (eli minkä käyttäjä on täpännyt Satamassa) eikä koskaan tulkitse hiljaisuutta "ei ole tehty" -merkiksi. Arki joka elää sovelluksen ulkopuolella on täysin ok, ei syyllistetä siitä.

**Ehdotuslogiikka (etusivun Horisontti-lohko):**
- Ehdokas = `enabled=true`, kausi voimassa (jos asetettu), ei snoozattu (`snoozed_until` mennyt tai null), kulunut aika ≥ 80 % voimassa olevasta välistä
- Näytetään VAIN YKSI kerrallaan: se jolla `kulunut/väli`-suhde on suurin
- **Armollisuussääntö:** jos yli n. 70 % KAIKISTA aktiivisista hommista on ylittänyt oman välinsä samaan aikaan (esim. koko perhe on ollut lomalla tai sairaana) → Horisontti hiljenee kokonaan, näyttää tyhjän tilan ilman mitään syyllistävää viestiä. Tämä estää sen että lomalta paluu näyttäisi 10 hälytystä kerralla.
- Rivin toiminnot: ⚓ (nostaa päivän Ankkuriksi, `source='horisontti'` samalla yleisellä ankkurointimekanismilla kuin muillakin lähteillä) | "ei nyt" (snooze: siirtää `snoozed_until`:n +25 % välistä eteenpäin, minimissään 3 päivää, `hylkaykset_putkeen += 1`) | täppäys tehdyksi (kirjaa `events`-riviin `action='checked'`, jolloin rytmi karttuu ja `hylkaykset_putkeen` nollautuu)
- Jos jokin homma saa **3 hylkäystä putkeen** ilman yhtään välissä ollutta täppäystä → se hiljenee kokonaan ehdotuksista (`enabled=false` automaattisesti), näkyy sen jälkeen VAIN Nostot-hallintanäkymässä josta sen voi herättää takaisin

**Nostot-hallintanäkymä** (ei omaa etusivunappia — pääsy esim. Asetusten kautta): lista kaikista hommista, kunkin kohdalla näkyy nimi, voimassa oleva väli JA sen lähde tekstinä ("arvaus" / "opittu ~X pv" / "asetettu X pv"), kausi, enabled-kytkin. Käsin annetun välin kentän tyhjentäminen palauttaa takaisin opittuun (tai arvaukseen jos opittua ei vielä ole). Uusien hommien lisäys tässä vaiheessa VAIN tämän hallintanäkymän kautta käsin — automaattinen tunnistus (ks. V4 alla) on myöhempi asia.

**Siemenpankki** (dataa, ei koodia): SQL-migraatio joka lisää n. 10–20 yleistä kotihommaa oletusväleineen ja kausineen — KAIKKI `enabled=false` OLETUKSENA, käyttäjä herättää hallintanäkymästä ne jotka koskevat omaa kotia. EI yhtään valmiiksi asetettua käsin annettua väliä (`kasin_vali_pv` aina null siemendatassa).

**Peilaus, ei häpeä:** kun opittu ja käsin annettu väli eroavat selvästi toisistaan (esim. toteuma 12 päivää, käsin asetettu tavoite 7 päivää) — harvakseltaan, enintään kerran kuussa per homma — näytetään neutraali kysymys: "Tavoite X, toteuma noin Y — säädetäänkö tavoitetta vai pidetäänkö ennallaan?" Tavoite on peili johon arkea verrataan, ei häpeäkeppi jolla sitä lyödään.

**Toteutusjärjestys (Copilot-vaiheistus — pieninä erillisinä paloina, tässä järjestyksessä):**
- **V1:** `nostot`-taulu + hallintanäkymä + pelkkä "X pv edellisestä" -näyttö (ei vielä mitään ehdotuslogiikkaa etusivulla)
- **V2:** mediaanilaskenta `events`-datasta + 80 %:n kynnyksellä ehdotus etusivun Horisontti-lohkoon + ⚓/"ei nyt"/täppäys-toiminnot
- **V3:** siemenpankki + kausisäännöt + armollisuussääntö + 3 hylkäyksen automaattihiljennys
- **V4** (vaatii E3:n Claude-älyn, EI tehdä ennen sitä): Laituri-kautta tulevat säännöt/kuittausmurut ("imuroin tänään" tekstinä → tunnistetaan sumealla nimiyhdistyksellä oikeaksi `nostot`-riviksi ja kirjataan `events`-tapahtumaksi automaattisesti). Jos äly on epävarma osumasta, se EI ARVAA — murun jää `'uusi'`-tilaan ihmisen käsiteltäväksi, ei koskaan väärää automaattista kirjausta.

**MITÄ EI TEHDÄ TÄSSÄ OMINAISUUDESSA MISSÄÄN VAIHEESSA** (tietoisia rajoja, ei unohduksia):
- Ei "myöhässä"-punaista tai mitään häpeämittaria
- Ei koskaan useampaa kuin yksi ehdotus kerralla etusivulla
- Ei pakollista kirjaamista — käyttäjä ei ole velvollinen käyttämään Horisonttia
- Ei keskiarvoa rytmilaskennassa, aina mediaani
- Ei koskaan käyttäjän puolesta automaattisesti asetettuja käsin-tavoitevälejä (`kasin_vali_pv` on AINA käyttäjän oma tietoinen valinta)

**Mitä tämä vaatii NYKYISELTÄ (jo olemassa olevalta) koodilta jo nyt, ennen kuin Horisontti itse rakennetaan:** `events`-tauluun kirjataan edelleen kattavasti kaikki `'checked'`-tapahtumat eikä sitä KOSKAAN tyhjennetä/arkistoida — se on Horisontin ainoa mahdollinen datalähde tulevaisuudessa, ja historian menettäminen tarkoittaisi ettei rytmiä voisi enää koskaan oppia. Toistuvat kotihommat (esim. pakkauslistojen automaattinollaus, ks. "Pakkauslistan automaattinollaus"-osio — jo toteutettu juuri tällä periaatteella) tulee toteuttaa niin että RIVI PYSYY SAMANA ja vain täpätään/nollataan uudelleen — EI poisteta ja luoda uutta riviä — koska `events`-ketjun eheys (`target_name`-täsmäys) nojaa tähän.

## Ohjebanneri-järjestelmä — suunnitelma (kirjattu 2026-07-08, EI TOTEUTETTU, toteutetaan aikaisintaan Hytin yhteydessä)

**Tämä on suunnitelma, ei koodia** — sama periaate kuin "Horisontti — suunnitelma" -osiolla yllä: ei kuulu 23.7.2026-määräaikaan ELLEI Oma Hytti -runko ehdi mukaan sitä ennen. Kirjattu talteen Copilot-aikaa varten.

**Idea:** kun käyttäjä avaa jonkin osion (esim. Oma Hytti, tai vaikka Kalenterin hyväksyntänäkymän) ensimmäistä kertaa, näkyy kuitti-tyylinen ohjebanneri sisällön yläpuolella (katkoviivalaatikko), jonka voi sulkea ×:llä. Kerran suljettu banneri ei ponnahda enää itsestään uudelleen — mutta sama teksti löytyy aina myös pysyvästi Asetuksista ("Ohjeet"-osio, listattuna per osio). EI modaali, EI pakota mitään lukemaan — banneri väistyy sisällön tieltä kiltisti eikä esimerkiksi estä muun sisällön näkemistä tai käyttöä sillä aikaa kun se on näkyvissä.

**Tietomalli:**
- Uusi taulu `ohjeet`: `section_key` (esim. `'hytti'`, `'kalenteri_hyvaksynta'` — vapaamuotoinen tunniste, ei viittaa mihinkään toiseen tauluun FK:lla), `title`, `content` (text, rivinvaihdot säilyttäen), `updated_at`. RLS: kaikki kirjautuneet saavat lukea (ei kirjoitusta UI:sta, ylläpidetään Table Editorista käsin — sama "dataa, ei koodia" -periaate kuin muuallakin Satamassa).
- Uusi taulu `ohje_kuittaukset`: `user_id`, `section_key`, `dismissed_at`. Kuittaus tallennetaan TIETOKANTAAN, EI localStorageen — jottei kuittaus katoa kun PWA asennetaan uudelleen tai vaihdetaan puhelinta.

**Näyttölogiikka:** osion avaus → jos `ohjeet`-taulussa on rivi kyseiselle `section_key`:lle EIKÄ kirjautuneella käyttäjällä ole vastaavaa riviä `ohje_kuittaukset`-taulussa → näytä banneri. ×-napin painallus kirjoittaa uuden `ohje_kuittaukset`-rivin (`dismissed_at = now()`), jonka jälkeen banneri ei näy enää sille käyttäjälle.

**Ohjeen päivittäminen jälkikäteen:** jos `ohjeet`-rivin sisältöä muutetaan merkittävästi ja halutaan että käyttäjät näkevät sen uudelleen, poistetaan käsin vastaavat `ohje_kuittaukset`-rivit Table Editorista — banneri palaa näkyviin kerran. Tietoinen yksinkertaistus: EI rakenneta erillistä versionumerointia ohjeille, tämä riittää harvoin tapahtuvaan tarpeeseen.

**Asetukset-näkymä:** uusi "Ohjeet"-osio joka listaa KAIKKI `ohjeet`-taulun rivit (riippumatta kuittauksista), napautus avaa sisällön luku­tilassa. Tämä on sama sisältö minkä banneritkin näyttävät — pysyvä paikka johon ohjeen voi aina palata riippumatta siitä onko banneri joskus suljettu.

**Ensimmäinen käyttökohde:** Oma Hytin ohje (`section_key` esim. `'hytti_juha'` tai vastaava per-hytti-tunniste, jos hytin käsite on henkilökohtainen). Sisältö otetaan erillisestä "Juhan hytin ohjekortti" -tekstistä (Katrilla olemassa erikseen) — käytetään tätä oikeaa sisältöä banneriin JA Asetusten ohjelistaan, EI mitään placeholder-/siemenkorttia.

**Miksi tämä on hyvä Copilot-kokoinen pala:** pieni, itsenäinen kokonaisuus (kaksi taulua + yksi geneerinen banner-komponentti + yksi Asetukset-alaosio), ei kosketa mihinkään olemassa olevaan toimivaan koodiin, ja sen voi rakentaa ja testata erillään muusta Satamasta. Sopii siis rakennettavaksi silloin kun Oma Hytti muutenkin aloitetaan, ei tarvitse tehdä etukäteen.

## Sovittu järjestys 23.7.2026 asti (kirjattu 2026-07-08, Katrin oma priorisointi)

Tämä on Katrin itsensä sanelema järjestys — jos joku (Copilot mukaan lukien) miettii mitä tehdä seuraavaksi, tämä lista on ensisijainen totuus, ei alempien osioiden TODO-listaus (ne ovat tarkempi sisältö kunkin kohdan alle, ei prioriteetti):

1. **Kahden tilin RLS-testi (Katri + Juha)** + koko "Testattavaa seuraavaksi" -lista alta — ennen tai rinnan seuraavan kanssa, EI SAA UNOHTUA
2. **Kalenterisyötteet** (tämä osio, yllä) — max 4 päivää aikabudjetti. Koodi valmis, EI VIELÄ TODELLISUUDESSA TESTATTU — `kalenteri_syotteet`-taulu oli koko ajan tyhjä (korjattu `sql/019_kalenteri_syotteet_data.sql`:llä), lisäksi tarve toiselle CalDAV-tilille (Juhan henkilökohtaiset kalenterit) huomattu ja korjattu (`sql/017_kalenteri_tilit.sql`). Migraatiot 017–019 AJAMATTA, ks. "Ajolista 2026-07-08 illalle" tarkka järjestys. Ensimmäinen oikea testi vielä edessä.
3. **Pakkauslistojen automaattinollaus** — ✓ TOTEUTETTU 2026-07-08, ks. "Pakkauslistan automaattinollaus"-osio alempana täydelle kuvaukselle.
4. **Push-ilmoitusinfra** — ✓ TOTEUTETTU 2026-07-08 (tilaus + manuaalinen testilähetys, ks. "Push-ilmoitukset"-osio). EI vielä testattu oikeilla laitteilla — tämä on illan testisession pääasia. Ajastettu lähetys (muistutukset) on oma myöhempi työnsä, ei kuulu tähän.
5. **Muistutusten perusversio** push-infran päälle rakennettuna
6. **Oma Hytti -runko** — ✓ TOTEUTETTU 2026-07-08 v1 (casekortit + automaattinen tehtäväkooste + Kalenteri-integraatio, täysin yksityinen), ks. "Oma Hytti"-osio. `sql/016_hytti.sql` AJETTU. EI testattu ollenkaan vielä (myös kahden tilin RLS-testi Hytille erikseen kohdassa 1 mainitun lisäksi)

**21.–22.7.2026 rauhoitetaan kokonaan:** ei enää uusia ominaisuuksia, pelkkä koko testauslistan läpikäynti MOLEMMILLA tileillä (Katri + Juha) + tämän muistiinpanot.md-tiedoston loppupäivitys niin että Copilot pystyy jatkamaan siitä ilman mitään muuta kontekstia.

## TODO ennen etapin 1 valmistumista (määräaika 23.7.2026 — kehityskone palautuu silloin)

- [x] RLS + näkyvyysmalli (003, 005, 006) — ajettu, korjattu rekursio ja anon-vuoto
- [x] service_role-avain Verceliin, Siri vahvistettu toimivaksi RLS:n kanssa
- [x] Raahausjärjestys: tuotteet (007), lists (011) — molemmat ajettu
- [x] Laituri (004), navigointiruudukko (008), Ankkurit (009, 013), Varasto (010), Kalenteri (012) — kaikki ajettu
- [ ] **Testaa molemmilla tileillä (Katri + Juha)** — tämä on ollut TODO-listalla koko session ajan, ei vielä vahvistettu. Ks. tarkka testauslista alta
- [ ] Suunnitteluperiaate koko loppuprojektille: kaikki säädettävä dataan/tauluihin, EI kovakoodata — pääosin toteutunut (home_sections, ankkurit, kalenteri_syotteet ovat data-ohjattuja), mutta pidä mielessä jatkossakin
- [ ] Horisontissa: oikea päättelylogiikka events-datasta — täysi suunnitelma valmiina "Horisontti — suunnitelma"-osiossa (tietomalli, mediaanilaskenta, V1–V4-vaiheistus), EI aloitettu koodissa. Tarkoitus toteuttaa Copilot-ajalla 23.7. jälkeen, ei kuulu 23.7. mennessä valmistuvaan E1-versioon.
- [x] **Oma Hytti** — toteutettu 2026-07-08 v1 (casekortit + tehtäväkooste + Kalenteri-integraatio, täysin yksityinen), ks. "Oma Hytti"-osio. `sql/016_hytti.sql` AJETTU, EI vielä testattu. Ohjebanneri-järjestelmä (oma täysi suunnitelma valmiina, tarkoitettu nimenomaan Hytin ensimmäiseksi käyttökohteeksi) EI ole vielä mukana — jäi tietoisesti pois v1:stä, rakennetaan myöhemmin päälle
- [x] **Asetukset**-näkymä — ✓ toteutettu 2026-07-08 (Push-ilmoitukset-osion yhteydessä)
- [ ] Kalenteritapahtuman muokkaus jälkikäteen (nyt voi vain lisätä/poistaa, ei muuttaa nimeä/aikaa)
- [x] **Pakkauslistojen automaattinollaus** — toteutettu 2026-07-08, ks. "Pakkauslistan automaattinollaus"-osio, EI vielä testattu oikealla laitteella (ks. "Testattavaa seuraavaksi")
- [x] **Push-ilmoitusinfra** (tilaus + testilähetys) — toteutettu 2026-07-08, ks. "Push-ilmoitukset"-osio, EI vielä testattu oikeilla laitteilla (ks. "Testattavaa seuraavaksi")
- [ ] **Muistutukset** (ajastettu push push-infran päälle) — EI aloitettu, ks. "Sovittu järjestys"-osion kohta 5
- [ ] **Ulkoisen kalenterin tuonti Satamaan** — koodi valmis, mutta EI TODELLISUUDESSA VIELÄ TESTATTU: 2026-07-08 illalla kävi ilmi että `kalenteri_syotteet`-taulu oli koko ajan tyhjä (synkka ei koskaan epäonnistunut, sille ei vain ollut annettu mitään syötettä) — aiempi tässä samassa muistiossa ollut "testattu, toimii" -merkintä oli siis virheellinen, korjattu. `sql/014_kalenteri_syotteet.sql` AJETTU, mutta `sql/017`–`019` (account_key-sarake, event_end_date, Katrin syöterivit) AJAMATTA — ks. "Kalenterisyötteet"-osion "Ajolista 2026-07-08 illalle" tarkat ohjeet ja ajojärjestys. Vasta näiden jälkeen ensimmäinen oikea testi.

## Testattavaa seuraavaksi (koottu 2026-07-07 session lopussa)

Iso liuta uutta toiminnallisuutta kasautunut ilman kattavaa käsin-testausta oikealla laitteella/tilillä. Käy läpi:

- [ ] **Push-ilmoitukset, illan pääkohde:** aja `sql/015_push_tilaukset.sql` ensin. Avaa Satama molemmilla puhelimilla (KOTINÄYTÖLLE ASENNETTUNA, ei Safarissa suoraan — muuten ei toimi). Avaa Asetukset-osio (etusivun ruudukko), paina "Salli ilmoitukset" — iOS kysyy luvan, hyväksy. Napin pitäisi vaihtua "Lähetä testi-ilmoitus" -napiksi. Paina sitä ja tarkista että ilmoitus tulee näkyviin PUHELIMEN ILMOITUSKESKUKSEEN, myös kun sovellus on kokonaan suljettu taustalla (ei vain auki selaimessa). Testaa molemmilla puhelimilla erikseen — kummankin pitäisi saada oma ilmoituksensa riippumatta toisesta. Jos "Salli ilmoitukset" ei tee mitään tai virhe tulee, tarkista onko puhelimen omissa asetuksissa (Asetukset → Safari → [sivuston] ilmoitukset tai kotinäytön appin omat asetukset) ilmoitukset jo aiemmin evätty — silloin täytyy sallia sieltä käsin ensin
- [ ] **Pakkauslistan automaattinollaus:** avaa "Telttaretken pakkauslista" tai "Viikon reissun pakkauslista" (molemmat valmiina, ks. Varasto-osio), täppää KAIKKI rivit valmiiksi — viimeisen täpän jälkeen pitäisi näkyä ruudun alareunassa ilmoitusbanneri, ja n. 1,5 sekunnin päästä kaikkien rivien pitäisi palautua täppäämättömäksi automaattisesti. Testaa myös ettei tavallinen lista (esim. Kauppalista) nollaudu vaikka kaikki täpättäisiin
- [ ] **Kahden tilin testi** (Katri + Juha): yhteinen lista näkyy molemmille, yksityinen lista EI näy toiselle, Kauppalista/Siivouslista/Vuosikello näkyvät kummallekin
- [ ] **Oma Hytti, koko putki läpi** (`sql/016_hytti.sql` on jo ajettu): avaa etusivulta "Oma Hytti". Luo kortti (esim. "Työnhaku", tyyppi Jatkuva) — tarkista että se ilmestyy Kortit-listaan. Avaa kortti, kirjoita muutama rivi muistiinpanoksi, merkkaa kaksi riviä tehtäviksi (☑-nappi) ja aseta kummallekin eräpäivä (yhdelle tämä päivä). Palaa päänäkymään — molempien pitäisi näkyä Tehtävät-koosteessa päivinä laskettuna ("N pv"/"tänään"), kortin nimi pienellä perässä. Täppää yksi tehtävistä koosteesta — tarkista että se näkyy täpättynä myös kortin sisällä. Nosta toinen ⚓-napilla Ankkureihin, tarkista että se ilmestyy etusivun Ankkureihin. Luo myös Päättyvä-tyyppinen kortti, tarkista että sillä NÄKYY "📦 Arkistoi" -nappi kortin sisällä mutta Jatkuva-kortilla EI näy. Arkistoi se, tarkista että se katoaa Kortit-listasta ja ilmestyy "Arkisto"-linkin taakse; avaa se sieltä ja tarkista lukutila (ei lisäysriviä, ei muokkausta), palauta "↩"-napilla ja tarkista että se on taas Kortit-listassa. **Tärkein tarkistus:** kirjaudu Juhan tilillä samaan aikaan — Juha EI saa nähdä Katrin kortteja/tehtäviä missään (ei päänäkymässä, ei Ankkureissa), ja toisinpäin
- [ ] **Oma Hytti Kalenterissa:** aseta jonkin Hytti-tehtävän eräpäiväksi tämä päivä, avaa Kalenteri-näkymä päivätilassa (oletuksena tänään) — tehtävän pitäisi näkyä agendassa 🚪-etuliitteellä täppäysnapin ja ⚓-napin kanssa, samassa listassa Ankkureiden ja kalenteritapahtumien kanssa. Täppää se sieltä, tarkista että se häviää myös Hytin Tehtävät-koosteesta ja on täpätty kortin sisällä. Mene Asetuksiin, käännä "Näytä tänään erääntyvät Kalenterin päivänäkymässä" pois päältä, avaa Kalenteri uudelleen — Hytti-tehtävien pitäisi hävitä agendasta kokonaan (kalenteritapahtumat ja Ankkurit näkyvät yhä). Käännä takaisin päälle, tarkista että palautuvat näkyviin
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
- [ ] Etusivun Kalenteri-laatta: isompi kuvake (34px) ja kuukausi+päivänumero näkyy oikein, myös kuun vaihtuessa
- [ ] **Ulkoisen kalenterin tuonti, koko putki läpi — EI TODELLISUUDESSA TESTATTU vielä** (aiempi "testattu, toimii" -merkintä tässä oli virheellinen — `kalenteri_syotteet`-taulu oli koko ajan tyhjä, ks. "Ajolista 2026-07-08 illalle" Kalenterisyötteet-osiossa). Vaiheet 1–4 alla ovat silti käyttökelpoinen tarkistuslista, kun 017/018/019 on ajettu:
  - **Vaihe 0 — pohjatyö:** aja `sql/014_kalenteri_syotteet.sql` Supabasen SQL Editorissa, jos ei vielä tehty. ✓ AJETTU.
  - **Vaihe 1 — turvallinen testi ilman oikeaa dataa:** luo mikä tahansa testikalenteri (esim. uusi kalenteri omaan iCloudiin tai Google Kalenteriin), julkaise se ("Julkinen kalenteri" / "Jaa julkinen linkki" -asetus, tuottaa nettiosoitteen joka päättyy `.ics`). Lisää Supabasen Table Editorista `kalenteri_syotteet`-tauluun uusi rivi: `name` = vapaa nimi (esim. "Testi"), `tyyppi` = `ics_url`, `tunniste` = se .ics-osoite, `mode` = `vain_varattu`, `enabled` = tosi/true. Avaa sovelluksessa Kalenteri-näkymä (tämä käynnistää haun automaattisesti) ja tarkista että testikalenterin tapahtuma ilmestyy agendaan tekstillä "🔒 Varattu 18–20" (tai vastaava kellonaika) — EI näy otsikkoa, paikkaa eikä mitään muuta tietoa, vain kellonaika.
  - **Vaihe 2 — oikea iCloud-kalenteri, koko nimellä näkyväksi:** lisää toinen rivi `kalenteri_syotteet`-tauluun: `tyyppi` = `icloud`, `tunniste` = TÄSMÄLLEEN se nimi millä kalenteri näkyy iCloudissa (esim. "Yhteinen"), `mode` = `taysi`. Avaa Kalenteri-näkymä uudelleen. Tapahtuman EI pitäisi ilmestyä suoraan agendaan, vaan Kalenteri-näkymän yläreunaan pitäisi ilmestyä teksti "⏳ 1 odottaa hyväksyntää — näytä", ja etusivun Kalenteri-laatan kulmaan pieni numeromerkki.
  - **Vaihe 3 — hyväksyntä:** paina "näytä"-linkkiä, tarkista että avautuu kortti jossa tapahtuman nimi + aika + Ok/Hylkää-napit. Paina Ok → tapahtuman pitäisi ilmestyä agendaan normaalisti (nimellä, ei "Varattu"-tekstillä) ja hävitä jonosta. Kokeile toisella tapahtumalla Hylkää-nappia → tapahtuma katoaa jonosta EIKÄ saa ilmestyä sinne uudelleen kun avaat Kalenteri-näkymän myöhemmin uudelleen.
  - **Vaihe 4 — toistuva tapahtuma:** jos jommassakummassa testikalenterissa on viikoittain toistuva tapahtuma (esim. harrastus), tarkista että KAIKKI seuraavan 30 päivän kerrat näkyvät kalenterissa erikseen, ei vain ensimmäinen kerta.
  - **Jos mikään ei toimi / kirjautuminen epäonnistuu:** avaa selaimen kehittäjätyökaluista tai Vercelin lokeista virheilmoitus. Jos virhe mainitsee "401" (kirjautuminen hylätty), kokeile ensin vaihtaa Vercelin `ICLOUD_USERNAME`-arvo muotoon joka päättyy `@icloud.com`.
- [ ] **UUSI, tekemättä: Kuukausiruudukko + monipäiväiset tapahtumat (aja `sql/018_kalenteri_monipaivainen.sql` ensin).** Avaa Kalenteri, vaihda "Kuukausi"-tilaan — pitäisi näkyä oikea 7-sarakkeinen ruudukko (MA–SU-otsikkorivi, kuluva kuukausi + haaleampana edellisen/seuraavan kuukauden täyttöpäivät, tämä päivä korostettuna). Napauta mitä tahansa päivää — pitäisi avautua sen päivän päivänäkymä. Lisää testiksi (joko käsin `kalenteri_tapahtumat`-tauluun Table Editorista TAI oikean iCloud-kalenterin kautta) tapahtuma jolla `event_end_date` on eri kuin `event_date` (esim. 3 päivää kestävä) — tarkista että kuukausiruudukossa näkyy YHTENÄINEN VÄRILLINEN PALKKI kaikkien kolmen päivän kohdalla (ei kolmea erillistä pallukkaa), ja että teksti näkyy vain palkin alkupäässä. Tarkista sama tapahtuma myös viikko- ja päivänäkymässä keskimmäisenä päivänä — pitäisi näkyä siellä normaalina rivinä (ei siis vain tapahtuman `event_date`-päivänä). Jos tapahtuma osuu kahden viikon väliin kuukausiruudukossa, tarkista että palkki jatkuu järkevästi myös seuraavalla rivillä.
- [ ] **UUSI, tekemättä: Katrin tilin syötteet (aja `sql/017`, `018`, `019` tässä järjestyksessä ensin — ks. "Ajolista 2026-07-08 illalle" tarkat ohjeet Kalenterisyötteet-osion lopussa).** `sql/019_kalenteri_syotteet_data.sql` lisää kolme syöterivia (`Perhekalenteri`/`Juha`/`Katri`, kaikki `account_key='katri'`, `mode='taysi'`) — TAULU OLI TYHJÄ, tämä on syy siihen ettei mikään synkannut ennen tätä. Avaa Kalenteri-näkymä (käynnistää synkan) tai laukaise käsin `GET /api/caldav-sync` selaimesta — tarkista Vercelin lokeista/vastauksesta onnistuiko. Testaa nimenomaan: "laivatesti joulukuussa" (Perhekalenterissa) nousee hyväksyntäjonoon ("⏳ N odottaa hyväksyntää").
- [ ] **UUSI, tekemättä, VASTA KATRIN TILIN JÄLKEEN: Juhan CalDAV-tili.** Vahvista ensin `?listaa=juha` toimivaksi (voi paljastaa samanlaisen 401-salasanavirheen kuin Katrin tilillä ensin oli). Sitten OMA myöhempi migraatio (`sql/020_...`) samalla `on conflict do nothing` -kaavalla kuin 019:ssä, `account_key='juha'`. Avaa Kalenteri-näkymä, tarkista että Juhan tapahtuma nousee hyväksyntäjonoon täsmälleen kuten Katrinkin syötteet. **Tärkein uusi tarkistus:** jos jaettu perhekalenteri näkyy MOLEMMILLA tileillä (yksi rivi `account_key='katri'`, toinen `account_key='juha'`, molemmat osoittavat samaan jaettuun kalenteriin), sen tapahtumien pitää nousta jonoon/agendaan TÄSMÄLLEEN KERRAN, ei kahdesti. Jos jomman kumman tilin synkka epäonnistuu, tarkista Vercelin lokeista virheilmoitus per syöte — toisen tilin virhe ei saa estää toisen tilin syötteitä synkkautumasta.
