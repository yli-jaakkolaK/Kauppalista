# Paluu tauolta — testipäivän ajolista

**Päivitetty 2026-07-13 illalla, Katrin käsityöpäivän jälkeen: asennusvaihe on VALMIS.** Kaikki Supabase/Vercel/GitHub-puolen asetukset ja migraatiot (paitsi mahdollisesti sql/035, ks. alla) on nyt tehty käsin — tämä tiedosto on siis enää TESTIPÄIVÄN AJOLISTA, ei asennusohje. Jos joskus tarvitset asennusaskeleet uudelleen (esim. avain vaihtuu, uusi kehityskone), yksityiskohdat on säilytetty kunkin osion sisällä.

**Yksi totuus -huomautus (päivitetty):** aiemmin täällä kysyttiin erillisen kahden puhelimen testilista-tiedoston perään — se oli itse asiassa tämä sama lista, nyt viety Satamaan itseensä. **Itse torstain testit täpätään Sataman jaetusta "Testipäivä to 16.7." -listasta** (Muistilaput, `sql/036_testipaiva_lista.sql`) — se on lyhyt, rivi per tarkistuskohta, väliotsikoin osittain. **PALUU.md pysyy tämän RINNALLA yksityiskohtaisena teknisenä referenssinä** (tarkat askeleet per testi) — jos Satama-listan rivi ei täsmää tai jää epäselväksi, tarkista sama asia täältä täydellä kuvauksella.

---

## OSA 0 — Varmuuskopiot

**✓ Ensimmäinen varmuuskopio otettu 2026-07-13** (`scripts/varmuuskopio.sh`, iCloud Drive).

**Suositus juuri nyt:** koko migraatioerä 001–034 ja paljon oikeaa dataa (330 kalenteritapahtumaa ym.) kirjoitettiin tietokantaan tänään samana päivänä — tämän tiedoston oma periaate ("ota uusi kopio aina kun olet ajanut ison joukon migraatioita") osuu juuri tähän hetkeen. Kannattaa ottaa TOINEN kopio ennen kuin aloitat huomisen/torstain testauksen:
```
SUPABASE_DB_URL="liimaa_osoite_tähän" ./scripts/varmuuskopio.sh
```
Täysi ohje (asennus, mistä yhteysosoite löytyy) on **BACKUP.md**:ssä.

**Ennen testauksen aloittamista, tarkista molempien puhelinten sovellusversio:** Asetukset → Sovellus → "Versio: kauppalista-vNN". Monta `sw.js`-päivitystä on tullut tämän päivän aikana (uusimman numeron näkee suoraan `sw.js`-tiedostosta, ei kirjattu tähän kiinteänä koska se muuttuu joka kerta) — jos jommankumman puhelimen versio näyttää vanhemmalta, paina "Päivitä sovellus" ennen kuin luotat testitulokseen.

---

## Migraatiot — tila 2026-07-13

**✓ sql/001–034 KAIKKI AJETTU Supabasessa** (Katri, käsityöpäivä) — ei enää mitään ajettavaa tästä välistä normaalilla testauskierroksella.

**⚠ sql/035_ohjeet_vinkit.sql — EI VARMISTETTU AJETUKSI.** Tämä on uusin (rakennettu samaan aikaan kun 001–034 ajettiin käsin, joten saattoi jäädä väliin). Tarkista: avaa Asetukset → "💡 Vinkit" -osio. Jos siellä on 10 riviä (viimeisenä "tarkista iPhonen oletuskalenteri..."), 035 on jo ajettu — ei tarvitse tehdä mitään. Jos siellä ei näy MITÄÄN riviä (tyhjä), aja `sql/035_ohjeet_vinkit.sql` SQL Editorista, ks. myös OSA K alla.

**⚠ sql/036_testipaiva_lista.sql — UUSI, AJA ENNEN TORSTAITA.** Luo jaetun "Testipäivä to 16.7." -listan Muistilappuihin (Satamaan itseensä, ei vain tähän tiedostoon) — ks. yllä oleva "Yksi totuus" -huomautus. Idempotentti, voi ajaa uudelleen jos sanamuotoja pitää korjata (poistaa+luo listan puhtaana joka kerta — HUOM: nollaa myös mahdolliset täpätyt rivit, älä siis aja uudelleen kesken testipäivän).

**⚠ sql/037_telttaretki_pakkauslista_sisalto.sql — UUSI.** Täyttää "Telttaretken pakkauslista" (93 riviä, 6 väliotsikkoa: Yhteiset varusteet/Jamiel/Rebekka/Katri/Juha/Ruoka) sisällöllä Katrin toimittamasta luonnoksesta. Idempotentti eri tavalla kuin 036: täyttää VAIN jos lista on tyhjä, EI poista/korvaa olemassa olevaa.

**⚠ sql/038_viikkopakkaus_sisalto.sql — UUSI, NIMIHUOMAUTUS.** Täyttää "Viikon reissun pakkauslista" (38 riviä, ei väliotsikoita) sisällöllä. **Katrin antamassa otsikossa listan nimi oli "Viikon pakkauslista leirikeskukseen"** — ERI TEKSTI kuin tietokannassa jo oleva nimi. Migraatio hakee listan sen NYKYISELLÄ tallennetulla nimellä ("Viikon reissun pakkauslista"), koska tehtävä oli täyttää olemassa oleva lista, ei luoda uutta. **Jos haluat kuvaavamman nimen käyttöön, vaihda se itse ✎-napista Muistilaput/Varasto-näkymässä** — ei tehty automaattisesti tässä.

**⚠ sql/039_events_delete_policy.sql — UUSI, TÄRKEÄ, AJA ENSIN.** Korjaa bugin jonka takia listan poisto ei tehnyt mitään (ks. OSA M alla) — `events`-taululta puuttui delete-RLS-policy kokonaan. Ilman tätä listan poisto ("Poista lista") ei toimi millään listalla jolla on tapahtumahistoriaa, eli käytännössä ei yhdelläkään oikeasti käytetyllä listalla.

**⚠ sql/040_laituri_nahty.sql — UUSI, AJA ENNEN Laituri-palluran testausta.** Luo `laituri_nahty`-taulun (per-käyttäjä "viimeksi avattu" -aikaleima) — korjaa bugin jossa Laituri-pallura ei koskaan sammunut pysyvästi (ks. OSA N alla).

**⚠ sql/041–045 — UUSIA, E3-KESKIPORRAS, AJA ENNEN OSA O:ta (VIIMEISENÄ testattava, ei kiireellinen ennen sitä).** `041_aly_nightly_setup.sql` (asetukset.aly_yoajo-kytkin + ankkurit.is_candidate), `042_aly_log_evaluated.sql` (aly_log + aly_evaluated -taulut), `043_aly_log_seen.sql` (Asetukset-laatan pallura), `044_aly_evaluated_content.sql` (aly_evaluated.content — bugikorjaus 16.7., muokkaus vapauttaa uudelleenarvioinnin), `045_aly_log_category.sql` (aly_log.category/deadline — "Hetki vs. ikkuna" -luokittelu, sama bugikorjaus). Viisi erillistä tiedostoa, aja järjestyksessä 041→042→043→044→045 (ei riippuvuutta väliltä paitsi että kaikki viisi tarvitaan ennen OSA O:n testausta).

**⚠ sql/046_testipaiva_uiremontti_rivi.sql — UUSI, AJA ENNEN OSA P:tä.** Lisää "Testipäivä to 16.7." -listalle uuden "OSA G" -väliotsikon + yhden uusintatestirivin Rivien UI-remonttia (ks. OSA P alla) varten. EI toista koko listaa (toisin kuin sql/036) — turvallinen ajaa vaikka muita rivejä on jo täpätty.

**⚠ sql/047–049 — UUSIA, KESKIVIIKON LÖYDÖKSET (17.7.), AJA ENNEN OSA Q:ta.** `047_laituri_kalenteri_itseilmoitus_korjaus.sql` (palauttaa kaikki virheellisesti "kalenteriin"-kohteella sijoitetuksi merkityt Laiturin rivit sijoittamattomiksi, sisältää RAISE NOTICE -diagnostiikan), `048_aly_log_undo_reason.sql` (aly_log.undo_reason-sarake — kertoo raukesiko ehdotus hiljaa vai peruttiinko se), `049_testipaiva_keskiviikon_loydokset_rivit.sql` (uusi "OSA H" -väliotsikko + uusintatestirivit, ei toista koko listaa). Aja järjestyksessä 047→048→049.

---

## OSA A — Muistutusten ajastin

**✓ KÄYTTÖÖNOTTO VALMIS 2026-07-13:** `MUISTUTUKSET_CRON_SECRET` asetettu SEKÄ Verceliin ETTÄ GitHub-repon Secrets-kohtaan, ajastin-workflow ("Muistutusten ja kalenterisynkan ajastin") laukaistu käsin GitHub Actionsista → VIHREÄ ✓. Ajastin pyörii nyt automaattisesti 5 minuutin välein (muistutukset + kalenterisynkka).

Alkuperäiset asennusaskeleet säilytetty tässä referenssiksi, jos avain joskus pitää vaihtaa tai ajastin pitää pystyttää uudelle Vercel/GitHub-tilille uudelleen:

<details>
<summary>Asennusaskeleet (avaa vain jos tarvitset uudelleenasennuksen)</summary>

### 1. Lisää salaisuus Verceliin

- Vercel → Kauppalista-projekti → **Settings** → **Environment Variables**.
- **Key**: `MUISTUTUKSET_CRON_SECRET`, **Value**: satunnainen generoitu merkkijono (Katrin käyttämä arvo on jo asetettu, ei tarvitse toistaa ellei avain vaihdu).
- Kaikki kolme ympäristöä ("Environment") päälle, **Save**.

### 2. Lisää SAMA salaisuus GitHubiin

- github.com → repo **Kauppalista** (yli-jaakkolaK/Kauppalista) → **Settings** (repon oma) → **Secrets and variables** → **Actions** → **New repository secret**.
- **Name**: `MUISTUTUKSET_CRON_SECRET` (täsmälleen sama), **Secret**: sama arvo kuin Vercelissä → **Add secret**.

### 3. Käynnistä ajastin ja tarkista että se näkyy

- GitHub-repo → **Actions** → "Muistutusten ja kalenterisynkan ajastin" → **Run workflow** (pudotusvalikko) → **Run workflow** (vihreä nappi).
- Odota puoli minuuttia, päivitä sivu — pitäisi näkyä uusi ajo vihreällä täpällä (✓).

</details>

---

## OSA F — Äly-putki

**✓ TEHTY JA TODISTETTU 2026-07-12** — "Testaa äly" vastasi järkevästi, `ANTHROPIC_API_KEY` paikallaan Vercelissä.

**Turvahuomio:** ensimmäinen avain vuoti vahingossa chattiin käyttöönoton yhteydessä, kierrätettiin heti (vanha kumottu, uusi generoitu). Muistutus: tarkista Anthropic Consolen avainlista 21.–22.7. rauhoitusjakson yhteydessä (ks. muistiinpanot.md "Äly-putki"-osion "Turvahuomio").

<details>
<summary>Asennusaskeleet (avaa vain jos avain joskus pitää vaihtaa)</summary>

1. Hae Anthropic-avain: console.anthropic.com → **API Keys** → luo uusi avain → kopioi se (näkyy vain kerran).
2. Vercel → Kauppalista-projekti → **Settings** → **Environment Variables** → **Key** = `ANTHROPIC_API_KEY`, **Value** = kopioitu avain → **Save**.
3. (Valinnainen) `ALY_MALLI`-muuttuja jos haluat vaihtaa mallia ilman koodimuutosta.
4. Asetukset → Sovellus → "Testaa äly" — järkevä suomenkielinen vastaus = putki toimii.

</details>

---

# VAIHE 1 — Katrin soolotestit (tee nämä ensin, milloin vain ennen torstaita)

Kaikki tämän vaiheen osiot voi testata YKSIN, ei vaadi Juhan puhelinta. Looginen järjestys: Hytti ensin (isoin kokonaisuus), sitten pienemmät uudemmat ominaisuudet.

## OSA C — Testaa Hytti v1 + opiskelulaajennus

Täysi tausta muistiinpanot.md:n osiossa **"Hytti v1 + opiskelulaajennus + ICS-syötekoneisto"** — tässä lyhyt testipolku. **Kohta 8 vaatii Juhan tiliä — siirretty VAIHE 2:een, tee tämän osion kohdat 1–7 nyt yksin.**

1. Avaa Oma Hytti. Luo kortti "Projektikurssi", aseta sille kalenterisuodatin (esim. sana joka esiintyy jonkin oikean kurssitapahtuman nimessä — kesällä voi olla tyhjä, se on odotettua).
2. Lisää muistiinpanoja + 2 tehtävää eräpäivillä kortin sisälle (☑-nappi rivin oikealla puolella merkitsee sen tehtäväksi).
3. Tarkista Tehtävät-koosteessa että molemmat näkyvät päivinä laskettuna.
4. Täppää yksi koosteesta — tarkista että se näkyy täpättynä myös kortin sisällä.
5. Nosta toinen ⚓-napilla Ankkureihin — tarkista se näkyy etusivulla.
6. Aseta kello-muistutus jollain hytti-rivillä — tarkista että push tulee (todistaa Muistutukset laajeni oikein Hyttiin).
7. Käännä Työ/vapaa-kytkin pois — tarkista opiskelu katoaa Etusivulta/perhekalenterista mutta näkyy yhä Hytin sisällä.
8. **(→ VAIHE 2) Kirjaudu Juhan tilillä** — Juha EI saa nähdä MITÄÄN Katrin Hytistä: ei korttia, ei tehtävää, ei Itslearning/Lukkarikone-tapahtumia missään.
9. **Kausiluontoinen muistutus:** Itslearning/Lukkarikone ovat kesällä todennäköisesti tyhjiä — testaa vain että haku ei kaadu virheeseen (0 tapahtumaa on hyväksytty tulos nyt). Oikea sisältötesti UUDELLEEN elokuussa.

---

## OSA G — Testaa Laituri-avustaja (ensimmäinen oikea älyominaisuus)

Ei vaadi mitään uutta migraatiota tai asetusta — käyttää samaa `ANTHROPIC_API_KEY`:tä kuin OSA F.

1. Avaa Laituri, lisää muutama ajatus jos listalla ei ole yhtään sijoittamatonta riviä.
2. Paina jonkin rivin ✨-nappia (näkyy vain sijoittamattomilla riveillä, samassa kohdassa kuin →-nappi).
3. **Ehdotus ilmestyy** rivin alle muutaman sekunnin sisällä: "→ <kohde> · <lyhyt perustelu>" + [Sopii] [Ei] -napit.
4. Paina **Sopii** — pitäisi avautua sama "Minne sijoitit tämän?" -kysymys jota →-nappikin käyttää, mutta äly-ehdotus jo kirjoitettuna kenttään valmiiksi. **Mikään ei siirry mihinkään automaattisesti**, vasta kun painat OK.
5. Kokeile myös **Ei** — kortti katoaa, rivi pysyy sijoittamattomana, ei mitään tallenneta.
6. Tarkista ettei ✨-nappia paina mikään AUTOMAATTISESTI — sen pitäisi reagoida VAIN suoraan napin painallukseen.

---

## OSA I — Testaa ulkokäytettävyys, toinen kierros

Katrin palaute 2026-07-10 johti ensimmäiseen korjaukseen, mutta se laski värit vain juuri AA-rajan (4,5:1) yläpuolelle — ei riittänyt käytännössä. Toinen kierros (2026-07-13) tummensi värit reilummalla marginaalilla (n. 6-6,5:1) ja korjasi Kuormavahdin kuukausinäkymän pisteen näyttämään numeron pelkän hover-vihjeen sijaan.

1. Vie puhelin ulos aurinkoiseen paikkaan, avaa Kalenteri käsivarren mitalta.
2. Päivä- ja viikkonäkymä: tarkista Kuormavahdin "N menoa" -pilleri, kellonajat ja otsikot — pitäisi olla luettavissa siristämättä silmiä.
3. Kuukausinäkymä: tarkista että kuormittuneen päivän kohdalla näkyy pieni meripihkanvärinen numeromerkki (esim. "6") päivänumeron vieressä, EI enää pelkkä väripiste ilman selitystä.
4. Käännä puhelin vaakatilaan viikkonäkymässä — pilleri EI saa olla enää silmin nähden pienempi kuin muu teksti ympärillä.
5. Jos JOKIN näistä on edelleen vaikealukuinen: kerro Claudelle/Copilotille TARKKA elementti + valo-olosuhde.

---

## OSA J — Testaa Varaston "Luo kopio"

1. Avaa mikä tahansa lista (Muistilaput TAI Varasto) jolla on ainakin yksi väliotsikko ja muutama rivi, osa täpättynä.
2. Avaa listan asetukset (🔒/👥-nappi ylhäältä), paina "Luo kopio".
3. Ehdotetun nimen ("{alkuperäinen} (kopio)") pitäisi näkyä valmiiksi kentässä — muokkaa sitä halutessasi, hyväksy OK:lla.
4. Palaa listan omaan näkymään — uuden kopion pitäisi näkyä listassa.
5. Avaa kopio: kaikki rivit + väliotsikot samassa järjestyksessä, MUTTA kaikki täpät auki.
6. Tarkista että kopio on YKSITYINEN oletuksena, vaikka alkuperäinen olisi ollut jaettu.
7. Kokeile myös peruuttaa — mitään ei pitäisi syntyä.

---

## OSA K — Testaa Vinkit ohjeet-taulusta

**Tarkista ensin migraatiot-tila yllä** — jos "💡 Vinkit" on tyhjä, aja `sql/035_ohjeet_vinkit.sql` ensin.

1. Avaa Asetukset — "💡 Vinkit" -osiossa pitäisi näkyä 10 riviä (9 vanhaa + uusi "tarkista iPhonen oletuskalenteri" -vinkki, viimeisenä).
2. Table Editorista `ohjeet`-tauluun: lisää uusi rivi, `content` = mikä tahansa teksti, `sort_order` = esim. 105. Avaa Asetukset uudelleen — uuden rivin pitäisi näkyä listan lopussa, EI vaadi koodimuutosta/deploytä.
3. Muuta jonkin rivin `sort_order`-arvoa — järjestyksen pitäisi muuttua vastaavasti.
4. Tarkista että "Missä muokataan mitäkin" -alaotsikon 5 riviä näkyvät ENNALLAAN (pysyivät tietoisesti staattisina).

---

## OSA L — Testaa Ruoka-välivaihe "Siirrä valitut Kauppalistalle"

1. Tee testiksi lista Varastoon (esim. "Resepti: lohikeitto") 3-4 rivillä.
2. Avaa lista, paina otsikkorivin ☑-nappia — jokaisen rivin eteen pitäisi ilmestyä oma valintaruutu, ja listan alle palkki "0 valittu" + [Peruuta] [Kauppalistalle] (jälkimmäinen harmaana).
3. Valitse 2 riviä — laskurin pitäisi näyttää "2 valittu" ja Kauppalistalle-nappi aktivoitua.
4. Paina "Kauppalistalle" — toast-ilmoitus, valintatila sulkeutuu.
5. Avaa Kauppalista — kahden valitun rivin nimet pitäisi näkyä siellä UUSINA, täppäämättöminä riveinä.
6. **Tärkein tarkistus:** avaa alkuperäinen "Resepti: lohikeitto" -lista uudelleen — sen pitäisi olla TÄYSIN ENNALLAAN.
7. Testaa myös "Peruuta", ja tarkista ettei ☑-nappi näy kun avaat itse Kauppalista-listan.

---

## OSA M — Testaa listan poisto (bugikorjaus)

Katrin raportoima bugi: "jäätelökakku"-listan (Muistilaput) poisto ei tehnyt mitään, toistettavasti. Juurisyy: `events`-taululta puuttui delete-RLS-policy kokonaan — korjattu `sql/039_events_delete_policy.sql`:llä (**aja tämä ensin**, ks. Migraatiot-tila yllä) + `deleteList()`-koodikorjauksella (funktio, aiemmin `poistaLista()`) joka nyt näyttää AINA selkokielisen virheen jos jokin poistovaihe epäonnistuu, sen sijaan että jatkaisi/nielaisisi hiljaa.

1. Luo testiksi uusi lista Muistilappuihin, lisää pari riviä, täppää yksi.
2. Avaa listan asetukset, paina "Poista lista" (tai vastaava poistoreitti kotinäkymän ×-napista) — vahvista dialogissa.
3. **Listan pitäisi kadota OIKEASTI** — ei jää näkyviin, ei ilmesty takaisin seuraavalla sivun päivityksellä. Onnistuneen poiston jälkeen pitäisi näkyä "Lista poistettu" -toast.
4. Kokeile myös poistaa lista jolla EI ole yhtään riviä (nopeampi reitti sama koodi, mutta hyvä varmistaa ettei tyhjä lista käyttäydy eri tavalla) — tämä vastaa myös Katrin havaintoa että bugi toistui sekä vanhalla listalla ("jäätelökakku") että ihan juuri luodulla tuoreella ("mansikkahillo"), eli ei ollut sidottu listan ikään.
5. **Jos poisto EI edelleenkään toimi:** nyt pitäisi näkyä selkokielinen suomenkielinen virhetoast (esim. "Listan poisto epäonnistui (tapahtumat): ..."), EI hiljaisuutta. Kerro Claudelle/Copilotille tarkka virheteksti jos näin käy — se kertoo tarkalleen missä vaiheessa (tuotteet/tapahtumat/lista itse) se kaatuu.
6. Varmista myös että YKSITTÄISEN RIVIN poisto (× listan sisällä) toimi jo ENNEN tätä korjausta ja toimii yhä — tämä bugi koski VAIN koko listan poistoa, ei yksittäisiä rivejä.

---

## OSA N — Testaa Laituri-pallura ja pitkän rivin ×-nappi (bugikorjaukset)

Kaksi erillistä löydöstä arkikäytöstä, korjattu samassa erässä. Aja `sql/040_laituri_nahty.sql` ensin (ks. Migraatiot-tila yllä).

**Laituri-pallura ("nähty", ei "sijoittamatta"):**
1. Kirjoita Laituriin uusi rivi (esim. TOISELLA tilillä/puhelimella, tai jos yksin testaat, tarkkaile että OMA lisäys ei koskaan sytytä omaa palluraa — se on jo tuttu sääntö).
2. Avaa Etusivu toisella tilillä — Laituri-laattaan pitäisi ilmestyä kultainen (EI punainen) pallura.
3. Avaa Laituri-näkymä (ÄLÄ sijoita riviä, jätä se sijoittamattomaksi tietoisesti).
4. Palaa Etusivulle — palluran pitäisi olla POISSA, vaikka rivi on YHÄ sijoittamaton.
5. Sulje sovellus kokonaan, avaa uudelleen, päivitä sivu useaan kertaan — palluran pitäisi PYSYÄ poissa niin kauan kuin mitään UUTTA (nähdyn hetken jälkeen lisättyä) ei ole tullut, riippumatta kuinka moneen kertaan Etusivu avataan.
6. Lisää TOINEN uusi rivi toiselta tililtä — palluran pitäisi syttyä UUDELLEEN vain tämän uuden rivin takia, ei vanhan (jo nähdyn) takia.
7. **Väri:** tarkista että pallura on selvästi kultainen/oranssinsävyinen, EI punainen, sekä Laituri- että Kalenteri-laatalla. Jos näkyy edelleen punaisena version päivityksen (Asetukset → "Päivitä sovellus") jälkeenkin, ota kuvakaappaus ja kerro Claudelle/Copilotille — koodista ei löytynyt mitään korjattavaa tälle, joten jos ongelma toistuu, tarvitaan lisätietoa.

**Pitkän rivin ×-nappi:**
1. Lisää Muistilappuihin (tai mihin tahansa listaan) rivi jolla on TODELLA PITKÄ nimi (esim. "Tämä on todella pitkä tuotteen nimi joka aiemmin työnsi poistonapin pois näkyvistä kokonaan").
2. Tarkista että teksti katkeaa siististi kolmella pisteellä (…) rivin lopussa, EIKÄ vaadi vaakarullausta — ×-napin (ja ⚓-napin) pitäisi näkyä KOKONAAN ilman rullaamista.
3. Toista sama testi Kalenterissa (pitkä tapahtuman nimi) ja Hytissä (pitkä tehtävän/rivin nimi) — molemmissa sama korjaus pitäisi päteä.
4. Laituriin EI pitäisi tarvita erillistä testiä tälle — se toimi jo ennenkin oikein (rivittyy tarvittaessa sen sijaan että katkeaisi).

---

# VAIHE 2 — Torstain testit Juhan kanssa

Nämä vaativat MOLEMMAT tilit yhtä aikaa (kaksi puhelinta) — todistavat yksityisyyden/erottelun oikeasti toimivaksi kahden ihmisen välillä, ei vain teoriassa.

## OSA C, kohta 8 — Hytin yksityisyys

Jatkoa yllä olevan OSA C:n kohtaan 8: **kirjaudu Juhan tilillä** — Juha EI saa nähdä MITÄÄN Katrin Hytistä: ei korttia, ei tehtävää, ei Itslearning/Lukkarikone-tapahtumia missään, ei edes jos hän yrittäisi kalenterinäkymän kautta.

---

## OSA D — Testaa Ankkurit henkilökohtaisina

Ankkurit olivat tähän asti käytännössä yhteiset — korjattu `sql/029`:llä (jo ajettu).

1. Kirjaudu Katrin tilillä — kaikki Katrin VANHAT ankkurit näkyvät edelleen hänellä ennallaan.
2. Kirjaudu Juhan tilillä — hänen ankkurinsa alkavat TYHJÄSTÄ.
3. Juha nostaa jonkin listarivin tai kalenteritapahtuman ⚓-napilla Ankkureihin — se näkyy VAIN Juhan etusivulla.
4. Kirjaudu takaisin Katrin tilillä samaan aikaan (toisella puhelimella) — Katri EI näe Juhan äsken nostamaa ankkuria ollenkaan.
5. Kumpikin täppää oman ankkurinsa valmiiksi — tarkista ettei kumpikaan vahingossa täppää tai poista toisen ankkuria.

**Ei vielä tässä paketissa:** ankkurin lähettäminen toiselle käyttäjälle, ristiriitalipun automaattiset ankkuriehdotukset — molemmat myöhemmin.

---

## OSA E — Testaa Juhan kalenteritilin syöterivit + Oma-scope

**✓ Migraatiot ja datatasoinen synkka jo VAHVISTETTU 2026-07-13** (`sql/030`–`033`, ks. muistiinpanot.md "Kalenterisyötteet"-osio): synkka-JSON näytti 9 syötettä, 0 virhettä, 330 tapahtumaa, ei tuplia. Yhteinen kalenteri (Juhan tili) löysi 45/45 samat tapahtumat kuin Perhekalenteri (Katrin tili) — UID-duplikaattisuoja todistettu datalla. **Jäljellä on VAIN elävä käyttöliittymätesti:**

1. **Tärkein tarkistus — ei tuplia agendassa:** avaa Kalenteri-näkymä molemmilla tileillä, tarkista SILMIN että jaettu "Yhteinen kalenteri"/"Perhekalenteri" -tapahtumat näkyvät TÄSMÄLLEEN KERRAN kummallakin tilillä, ei kahdesti.
2. **Juhan "Oma"-kalenteri (tällä hetkellä tyhjä):** kirjaudu Juhan tilillä, lisää testitapahtuma "Oma"-kalenteriin (esim. iPhonen Kalenterista). Sen pitäisi ilmestyä Juhan Tänään-kaistalle/Hyttiin. Kirjaudu Katrin tilillä — **sama tapahtuma EI SAA näkyä missään Katrin näkymässä** (ei agendassa, ei kuittausjonossa, ei Kuormavahdissa).
3. **Tunnettu, ei-huolestuttava sivuhavainto:** jaetun "Juha"-kalenterin (henkilökohtaiset menot, EI "Oma") tapahtumamäärä näytti erisuurena kahden tilin välillä tänään (10 Juhan tililtä, 3 Katrin tililtä) — todennäköisesti iCloudin oma jakosynkka on vielä tasoittumassa. Ei toimenpidettä, seurataan; jos ero ei tasoitu muutaman päivän sisällä, kerro Claudelle/Copilotille.
4. Jos jokin tapahtuma NÄKYY kahdesti agendassa (poikkeaisi yllä kuvatusta data-todennuksesta): kerro tarkka tapahtuman nimi + päivä.

---

## OSA H — Testaa Huomiopallurat

Vaatii `sql/034_realtime_huomiopallurat.sql` ajettuna (✓ tehty).

1. Kahdella tilillä yhtä aikaa: Juha lisää menon kalenteriin → Katrin Etusivun Kalenteri-laattaan pitäisi ilmestyä kultainen pallura muutaman sekunnin sisällä, ILMAN että Katri päivittää sivua.
2. Katri avaa Kalenterin ja painaa "Kuittaa kaikki" → pallura katoaa Kalenteri-laatasta.
3. Juha kirjoittaa uuden ajatuksen Laituriin → Katrin Laituri-laattaan ilmestyy pallura. **Juhan OMALLE etusivulle EI ilmesty palluraa** hänen omasta lisäyksestään.
4. Katri sijoittaa sen rivin → pallura pienenee/katoaa Laituri-laatasta.
5. Kun molemmat luvut ovat nollassa, tarkista ettei laatoissa näy palluraa OLLENKAAN.
6. Jos puhelin on kotinäytöllä (iOS 16.4+): tarkista että sovelluskuvakkeen numero seuraa summaa ja katoaa kun kuitattu/sijoitettu.
7. **Tunnettu rajaus, ei bugi:** taustalla saapuva push EI päivitä sovelluskuvakkeen numeroa itsestään — vasta kun joku avaa sovelluksen.

---

## OSA B — Testaa Muistutukset

Ajastin (OSA A) on jo VIHREÄ ja pyörii — tämä testaa itse push-ilmoituksen saapumisen.

1. Avaa Satama puhelimella (kotinäytöltä asennettuna). Paina jollain listarivillä ⏰-nappia, aseta "5 min" -muistutus. Sulje sovellus KOKONAAN. Odota 5-10 min — pushin pitäisi tulla ilmoituskeskukseen.
2. Aseta samalle rivillle toinen muistutus — molempien pitäisi tulla.
3. Kalenteritapahtumalla jolla on kellonaika: kokeile "1 h ennen" -pikanappia, tarkista laskettu aika on oikea.
4. Aseta muistutus ja poista se × -napilla ennen erääntymistä — pushia EI pitäisi tulla.
5. Poista rivi/tapahtuma jolla oli muistutus — tarkista Table Editorista (`muistutukset`-taulu) että sen rivi katosi mukana.
6. Laitteella jolla push EI ole käytössä: ⏰-paneelin pitäisi näyttää ohje + "Asetuksiin"-nappi lomakkeen sijaan.
7. Testaa MOLEMMILLA puhelimilla erikseen — kummankin pitäisi saada oma muistutuksensa riippumatta toisesta.

---

## OSA O — Testaa E3-keskiporras V1 "Äly toimii, ihminen valvoo" (VIIMEISENÄ — vasta kun VAIHE 2:n muut osat on kuitattu)

Rakennettu ja pushattu 15.7., ensimmäinen oikea yöajo 16.7. paljasti uudelleennostosilmukka-bugin ja korjattu samana päivänä ("Hetki vs. ikkuna" -luokittelu, ks. muistiinpanot.md "Bugikorjaus: E3-yöajon uudelleennostosilmukka + Hetki vs. ikkuna"). Aja **`sql/041`–`045`** ennen tätä (ks. Migraatiot-tila yllä). Tämä ei aiheuta mitään ilman että Laiturissa on ainakin yksi selvästi tähän-päivään/huomiseen viittaava, sijoittamaton muru JA yöajo on ehtinyt käydä (ajastin pyörii 5 min välein mutta yöajo itse tekee työtä vain ~20h välein — voit laukaista sen käsin heti testiä varten, ks. kohta 1).

1. Kirjoita Laituriin ilta-testinä KAKSI murua: (a) yksittäinen ajankohta, esim. **"testi: huomenna klo 15 asia X"** (hetkiasia), ja (b) takaraja, esim. **"testi: osta liput 24.7. mennessä"** (ikkuna-asia). Jätä molemmat sijoittamatta.
2. Laukaise yöajo käsin (ei tarvitse odottaa oikeaa yötä): GitHub-repo → **Actions** → "Muistutusten ja kalenterisynkan ajastin" → **Run workflow**. (Jos edellisestä ajosta on alle 20h, yöajo toteaa "ei vielä ajankohtainen" eikä tee mitään — odota siinä tapauksessa seuraavaan luonnolliseen ajoon, tai kerro Claudelle/Copilotille niin `MIN_HOURS_BETWEEN_RUNS`-arvoa voi tilapäisesti pienentää testiä varten.)
3. **Etusivu:** Ankkurien alle pitäisi ilmestyä KAKSI ✨-merkillä varustettua ehdokasriviä (yksi per testimuru). EI saa näkyä "3 tärkeintä" -rajan sisällä eikä vaikuttaa siihen mitä 3 ankkuria näkyy. "⚓ Ankkurit" -otsikon vieressä pitäisi näkyä uusi pieni pallura joka näyttää reagoimattomien ehdokkaiden määrän (2).
4. **Asetukset → "✨ Mitä äly on tehnyt":** pitäisi näkyä kaksi uutta lokiriviä kuvauksineen + suhteellinen aika + [Kumoa]-nappi. Asetukset-laatan pitäisi näyttää kultainen pallura kotiruudukossa ENNEN kuin avaat Asetukset, ja sammua avaamisen jälkeen (tämä on ERI pallura kuin kohdan 3 Ankkurit-pallura — kirjanpitoa, ei odottavaa reaktiota).
5. Kokeile kaikki kolme reaktiota etusivun ehdokasrivillä ERI testimuruilla (tee tarvittaessa useampi testimuru + yöajo): (a) täppää ○ → rivi merkitään tehdyksi normaalisti; (b) paina ⚓ ("ota omaksi") → rivi katoaa ehdokkaista ja ilmestyy tavallisiin ankkureihin; (c) paina × ("poista") → rivi katoaa kokonaan.
6. **Kumoa-testi:** paina Asetuksista jonkin (yhä aktiivisen, ei-kumotun) lokirivin [Kumoa]-nappia — vastaava ankkuririvi (jos yhä olemassa missä tahansa tilassa) pitäisi kadota, ja lokirivi jää näkyviin yliviivattuna ilman Kumoa-nappia.
7. **Tärkein tarkistus — turvainvariantti:** koko testin ajan molemmat alkuperäiset Laiturin murut pysyvät Laiturissa TÄYSIN KOSKEMATTOMINA (ei muokattu, ei poistettu, ei sijoitettu) riippumatta mitä ehdokkaalle/ankkurille tehtiin.
8. **Raukeamistesti, hetkiasia (vaatii kaksi yöajoa n. vuorokauden välein):** jätä hetkiasia-ehdokas (kohta 1a) täysin reagoimatta. Seuraavan yöajon pitäisi poistaa se hiljaa — muru säilyy Laiturissa, lokirivi jää yliviivattuna, JA sama muru EI SAA nousta uudelleen kolmannessa yöajossa (tämä oli 16.7. bugi). Voit tarkistaa tämän myös suoraan: `aly_evaluated`-taulussa pitäisi näkyä murun `content` täsmälleen sellaisena kuin se oli Laiturissa.
9. **Raukeamistesti, ikkuna-asia (vaatii kaksi yöajoa, voi tehdä samalla kierroksella kuin kohta 8):** jätä ikkuna-asia-ehdokas (kohta 1b) reagoimatta. Seuraavan yöajon pitäisi poistaa ehdokas MUTTA nostaa SAMA muru uudelleen ehdokkaaksi heti samassa ajossa (koska takaraja — 24.7. — ei ole vielä ohi). Testaa tämän jälkeen myös murun MUOKKAUS (muuta tekstiä) — seuraavan yöajon pitäisi arvioida se aivan uutena murun sisältönä.
10. Jos jokin epäonnistuu: tarkista Vercelin Logs-välilehdeltä `/api/aly-nightly`-kutsun vaste ja `[aly-nightly]`-lokirivit — ne kertovat tarkalleen missä vaiheessa (kytkin pois, ei vielä ajankohtainen, ei kelvollisia muruja, Anthropic-virhe) juuttui.

---

## OSA P — Testaa Rivien UI-remontti (2026-07-16, ks. muistiinpanot.md "Rivien UI-remontti")

Korjaa bugin jossa pitkät rivit näkyivät muodossa "tyyny…" edellisen ellipsis-korjauksen (13.7.) jälkeen — ikonikaista vei liikaa tilaa JA kiinteät metatietospanit (kellonaika, muistutusaika ym.) varastivat näkymätöntä flex-tilaa päätekstiltä. Aja **`sql/046`** ennen tätä.

1. **Varasto (pakkauslista):** avaa "Telttaretken pakkauslista" tai "Viikon reissun pakkauslista". Etsi rivit **"Katri: kuulosuojaimet/korvatulpat"** ja **"Uikkarit + uimakengät/sukat/pyyhe"** (tai vastaavat pitkät rivit) — pitäisi näkyä KOKONAAN, rivittyneenä useammalle riville, EI katkaistuna ellipsillä. Ei täppää, ei ⚓ näkyvissä — vain hiljainen "⋯" oikeassa reunassa.
2. Paina Varaston rivin "⋯" — pitäisi avautua pieni valikko: Muokkaa, Poista. Kokeile molemmat (Poista vaatii vahvistuksen kuten ennenkin).
3. **Muistilaput/Kauppalista:** avaa mikä tahansa elävä lista. Rivillä pitäisi näkyä: täppä (○/✓) + teksti + ⚓ (aina näkyvissä) + "⋯". Paina "⋯" — valikossa: ⏰ Muistutus, Muokkaa, Poista. Aseta muistutus jollekin riville — sen pitäisi näkyä pienenä aikatietona tekstin perässä ("huomenna 08:00" tms.), EI omana nappinaan.
4. Kirjoita testiksi pitkä tuotenimi (esim. "Katri: kuulosuojaimet ja varapatterit") Kauppalistalle — pitäisi näkyä selvästi enemmän tekstiä ennen ellipsis-katkaisua kuin ennen tätä korjausta (ei välttämättä täysin kokonaan, elävillä listoilla on edelleen täppä+⚓+⋯ näkyvissä).
5. **Kalenteri:** tarkista tavallisen pituinen tapahtuma (esim. "Vanhempainilta koulussa") — pitäisi näkyä lähes kokonaan. Paina rivin "⋯" — valikossa ⏰ Muistutus + (jos rivi ei ole synkattu iCloudista) Poista. ⚓ pysyy suoraan näkyvänä.
6. **Hytti:** avaa jokin kortti jolla on tehtäväksi merkitty rivi (☑). Tarkista että pidempi tehtävärivi näkyy aiempaa paremmin, ja että rivin "⋯" sisältää ⏰ Muistutus + Poista.
7. **Testipäivä-listan uusi rivi:** täppää "Testipäivä to 16.7." -listan uusi "OSA G" -rivi (ks. sql/046) kun kohdat 1–6 on käyty läpi.
8. Jos jokin rivi näyttää edelleen katkeavan liian aikaisin lyhyellä, tavallisen mittaisella tekstillä (ei keinotekoisen pitkällä), kerro Claudelle tarkka rivin teksti ja näkymä — kyse on todennäköisesti uudesta, vielä löytymättömästä kiinteän-levyisestä elementistä joka pitäisi lisätä `style.css`:n ellipsis-poissulkulistaan tai flex-korjauksen piiriin.

---

## OSA Q — Testaa keskiviikon löydökset (2026-07-17, ks. muistiinpanot.md "Keskiviikon löydökset")

Aja **`sql/047`–`049`** ennen tätä. Kolme kokonaisuutta, testaa tässä järjestyksessä (sama kuin korjausjärjestys).

**1. Kalenteri-sijoitus (vakavin korjaus):**
1. Avaa Laituri, kirjoita testimuru selvällä ajanmääreellä ("huomenna klo 15 testi"), jätä sijoittamatta.
2. Paina ✨ — äly-ehdotuksen pitäisi TÄSTÄ ETEENPÄIN olla joko olemassa oleva lista, "muistutus (ajankohtaan sidottu asia)" tai "hytin kortille"/"ei mikään näistä" — **EI KOSKAAN "kalenteriin"**.
3. Jos ehdotus on muistutus: paina Sopii — pitäisi avautua OIKEA muistutuspaneeli (sama kuin ⏰-napista muualla), EI browserin `prompt()`-ikkunaa. Aseta muistutus — rivin pitäisi muuttua "sijoitetuksi" VASTA tämän jälkeen, meta-tekstissä "→ muistutus asetettu".
4. Kokeile myös suoraa ⚓-nappia sijoittamattomalla Laituri-rivillä (uusi, näkyy ✨:n ja →:n välissä) — pitäisi nostaa muru sellaisenaan päivän Ankkureihin ilman sijoitusdialogia, ⚓ jää kultaiseksi/aktiiviseksi.
5. Sijoitetulla rivillä pitäisi näkyä uusi "↺"-nappi (ei enää ✨/→/⚓) — paina sitä, rivin pitäisi palautua sijoittamattomaksi ("N sijoittamatta" -laskuri kasvaa yhdellä).
6. Jos Laiturissa on VANHOJA rivejä joiden kohdalla luki aiemmin "→ kalenteriin..." — tarkista `sql/047`:n jälkeen että ne ovat palautuneet sijoittamattomiksi (Vercel/Supabase SQL Editorin RAISE NOTICE -tulosteesta näkee mitkä rivit korjattiin).

**2. Äly-loki:**
1. Asetukset → "✨ Mitä äly on tehnyt" — jokaisella rivillä pitäisi näkyä pieni TILA-merkintä (Odottaa reaktiota / Otettu omaksi / Tehty / Rauennut / Kumottu) kuvauksen ja ajan lisäksi.
2. Anna jonkin ✨-ehdokkaan raueta (ei reagoida ennen seuraavaa yöajoa, tai testaa käsin painamalla × ehdokaskortilta) — lokirivin pitäisi näyttää "Rauennut (ei reagoitu)" TAI "Kumottu" (× = kumottu tässä versiossa) + muted-linkki "Muru on yhä Laiturissa →". Paina linkkiä — pitäisi avautua Laituri haettuna suoraan sillä murulla.

**3. E3 + Ankkurit:**
1. Etusivu, kun ✨-ehdokkaita on ≥1: pitäisi näkyä pieni "✨ Ehdotukset" -otsikko Ankkurit-lohkon alla, JA ehdokasrivin ympärillä kulta katkoviivakehys (ei pelkkä himmeä/opacity-rivi).
2. Napauta minkä tahansa ANKKURIN (ei ehdokkaan) tekstiä — pitäisi avautua inline-muokkaus kuten kaikkialla muualla. Muokkaa tekstiä, tallenna (Enter/blur) — vain ankkuri muuttuu, alkuperäinen lähderivi (jos ankkuri nostettu Muistilapuilta/Kalenterista/Hytistä) EI muutu.
3. Napauta ✨-ehdokkaan tekstiä ja muokkaa sitä — tallennuksen pitäisi SEKÄ tallentaa uuden tekstin ETTÄ ottaa ehdokkaan omaksi ankkuriksi automaattisesti (katoaa ehdokkaista, ilmestyy tavallisiin ankkureihin).
4. **Pitkät tekstit kaikkialla:** kirjoita pitkä Laiturin muru (yli 40 merkkiä) — tarkista ettei se katkea "…"-merkkiin missään (Laiturin omalla rivillä TAI ✨-ehdotuskortilla TAI E3-ankkuriehdokkaalla). Kaikkien kolmen pitäisi näyttää teksti kokonaan, tarvittaessa monirivisenä.
5. **Testipäivä-listan uudet rivit:** täppää "Testipäivä to 16.7." -listan uusi "OSA H" -osio (ks. sql/049) kun yllä olevat on käyty läpi.
6. Jos jokin kohta ei täsmää: tarkista Vercelin Logs `/api/aly-nightly`-kutsuista ja selaimen konsolista virheitä — kaikki tämän osan toiminnot kirjoittavat `console.error`:iin jos jokin tietokantakutsu epäonnistuu.

---

Kysy Claudelta jos joku kohta ei täsmää tai jokin näistä napeista/valikoista ei löydy — käyttöliittymät muuttuvat välillä hieman.
