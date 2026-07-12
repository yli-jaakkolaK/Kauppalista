# Paluu tauolta — tee nämä järjestyksessä

Tervetuloa takaisin! Tässä kaikki mitä pitää tehdä käsin ennen kuin testaat mitään. Tehty työ: Muistutukset v1 (push-muistutukset), Hytti v1 + opiskelulaajennus + ICS-syötekoneisto, Ankkurit henkilökohtaisiksi, Juhan kalenteritilin syöterivit, varmuuskopiointi, ja äly-putken runko — kaikki on rakennettu valmiiksi koodiin, mutta Supabase/Vercel/GitHub-puolen asetukset ja migraatiot pitää tehdä käsin, koska Claude ei koskaan aja niitä itse.

---

## OSA 0 — Ota ENSIMMÄINEN varmuuskopio ENNEN mitään muuta

Tee tämä ihan ensimmäisenä, ennen kuin ajat yhtäkään migraatiota tai testaat mitään — jos jokin seuraavista askelista menisi jotenkin pieleen, haluat pystyä palaamaan tähän hetkeen.

Täysi ohje (kertaluontoinen asennus + mistä yhteysosoite löytyy + itse komento) on **BACKUP.md**-tiedostossa — tässä vain lyhyt tiivistelmä:

1. Asenna `pg_dump` (vain kerran, ks. BACKUP.md "Kertaluontoinen asennus"): `brew install libpq && brew link --force libpq`
2. Hae tietokannan yhteysosoite Supabasesta (ks. BACKUP.md "Mistä SUPABASE_DB_URL löytyy") — Project Settings → Database → Connection string → URI.
3. Aja projektin juuresta:
   ```
   SUPABASE_DB_URL="liimaa_osoite_tähän" ./scripts/varmuuskopio.sh
   ```
4. Tarkista tulostuksesta minne kopio tallentui (iCloud Drive -kansioon jos sellainen löytyy koneelta, muuten `~/Documents/Satama-varmuuskopiot/` — jälkimmäisessä tapauksessa siirrä kansio itse johonkin pilveen, ks. BACKUP.md).

Kun ensimmäinen kopio on olemassa, jatka alla oleviin osiin. Ota uusi kopio myös aina kun olet ajanut ison joukon migraatioita (esim. tämän listan lopuksi, kun kaikki alla on tehty ja testattu).

---

## OSA A — Muistutukset-ominaisuuden käyttöönotto (4 askelta)

### 1. Lisää salaisuus Verceliin

Tämä on valmiiksi generoitu satunnainen merkkijono — kopioi se tarkalleen tällaisenaan, älä muokkaa:

```
357795b83db8f8e0b40dc091a907005c62f4b3f1cc9150171b890a4a50d0d3bb
```

- Mene osoitteeseen vercel.com ja kirjaudu sisään.
- Avaa Kauppalista-projekti.
- Yläpalkista: **Settings**.
- Vasemmalta: **Environment Variables**.
- Kenttään **Key** (tai "Name"): kirjoita tarkalleen `MUISTUTUKSET_CRON_SECRET`
- Kenttään **Value**: liimaa yllä oleva merkkijono.
- Ympäristöt ("Environment"): jätä kaikki kolme rastia päälle (Production, Preview, Development) — oletusarvo, ei tarvitse koskea.
- Paina **Save**.

### 2. Lisää SAMA salaisuus GitHubiin (uusi paikka, tässä tarkka reitti)

GitHub-repo on eri paikka kuin Vercel — sinne pitää laittaa TÄSMÄLLEEN sama merkkijono uudestaan, koska GitHub Actions -robotti (joka herättää muistutukset) ei näe Vercelin asetuksia.

- Mene osoitteeseen github.com, kirjaudu sisään.
- Avaa repo **Kauppalista** (yli-jaakkolaK/Kauppalista).
- Yläpalkista: **Settings** (repon oma Settings, EI oma profiilisi — tämä on tärkeä ero, jos näet "Danger Zone" tms. listaa alaosassa, olet oikeassa paikassa).
- Vasemmalta valikosta: **Secrets and variables** (klikkaa auki, se laajenee) → **Actions**.
- Näet sivun jossa lukee "Repository secrets". Paina vihreää nappia **New repository secret**.
- Kenttään **Name**: kirjoita tarkalleen `MUISTUTUKSET_CRON_SECRET` (täsmälleen sama nimi kuin Vercelissä, isot/pienet kirjaimet väliä).
- Kenttään **Secret**: liimaa sama merkkijono kuin yllä:
  ```
  357795b83db8f8e0b40dc091a907005c62f4b3f1cc9150171b890a4a50d0d3bb
  ```
- Paina **Add secret**.

### 3. Aja tietokantamigraatiot Supabasessa (järjestyksessä)

Supabase-projektin sivulta: vasemmalta **SQL Editor** → **New query** → liimaa tiedoston koko sisältö → **Run**. Yksi tiedosto kerrallaan, tässä järjestyksessä:

1. `sql/025_muistutukset.sql` — muistutukset-taulu
2. `sql/026_hytti_v1_respec.sql` — Hytin uusi kalenterisuodatin-kenttä + muistutukset laajennettu koskemaan Hytin rivejä
3. `sql/027_kalenteri_syotteet_scope.sql` — kalenterisyötteiden perhe/hytti-erottelu + yksityisyyssuoja tietokantatasolla
4. `sql/028_hytti_ics_syotteet_data.sql` — Itslearning + Lukkarikone -syötteet Hyttiin
5. `sql/029_ankkurit_henkilokohtaiset.sql` — tekee Ankkureista henkilökohtaisia (ks. OSA D alla) — TÄYSIN ERILLINEN Muistutuksista/Hytistä, voit ajaa tämän vaikka jättäisit muut väliin
6. `sql/030_kalenteri_syotteet_data_juha.sql` — Juhan CalDAV-tilin syöterivit (ks. OSA E alla) — **TARKISTA ENSIN** `GET /api/caldav-sync?listaa=juha` selaimessa (korvaa domain: `https://kauppalista-nine.vercel.app/api/caldav-sync?listaa=juha`) ja vertaa tulosta migraatiotiedoston `tunniste`-arvoihin (Perhekalenteri/Juha/Katri) — jos nimet eivät täsmää kirjain kirjaimelta, älä aja migraatiota vielä, kerro Claudelle/Copilotille mitkä nimet oikeasti tulivat
7. `sql/031_kalenteri_juha_nimikorjaus.sql` — korjaa 030:n jälkeen löytyneen nimiongelman (jaettu kalenteri näkyy Juhan tilillä nimellä "Yhteinen kalenteri", ei "Perhekalenteri" + Juhan oma yksityinen kalenteri nimetty "Oma") — ks. OSA E, tavoite synkan jälkeen: JSON näyttää 8 syötettä, 0 virhettä

**Tärkeä käsin täytettävä kohta migraation 027 jälkeen:** se luo uuden `hytti_omistajat`-taulun jonka pitää tietää KUKA on 'katri' ja KUKA on 'juha' (oikeat käyttäjätunnukset). Katrin rivi on jo mukana valmiina migraatiossa. **Juhan rivi puuttuu — lisää se itse Table Editorista:**
- Supabase → **Table Editor** → etsi taulu `hytti_omistajat`
- **Insert row** → `henkilo` = `juha`, `user_id` = Juhan oma kirjautumistunniste (löytyy Supabase → **Authentication** → **Users** -listalta, kopioi Juhan rivin UUID-sarake)
- Tallenna.

Ilman tätä Juhan opiskelu-/työkalenteri (kun se joskus lisätään samaan koneistoon) ei toimisi — Katrin oma opiskelukalenteri (Itslearning/Lukkarikone) toimii jo ilman tätä, koska Katrin rivi on migraatiossa valmiina.

### 4. Käynnistä ajastin ja tarkista että se näkyy

- GitHub-repo → yläpalkki **Actions**.
- Vasemmalta pitäisi näkyä workflow nimeltä **"Muistutusten ja kalenterisynkan ajastin"**.
- Klikkaa sitä auki → oikealta yläkulmasta **Run workflow** -nappi (pudotusvalikko) → **Run workflow** (vihreä nappi) — tämä laukaisee sen HETI, ei tarvitse odottaa 5 minuuttia.
- Odota puoli minuuttia, päivitä sivu — pitäisi näkyä uusi ajo vihreällä täpällä (✓). Jos punainen rasti, klikkaa ajoa auki ja katso virheteksti (todennäköisin syy: joku ympäristömuuttuja väärin kirjoitettu).

---

## OSA B — Testaa Muistutukset (vasta kun OSA A on tehty kokonaan)

1. Avaa Satama puhelimella (kotinäytöltä asennettuna). Paina jollain listarivillä ⏰-nappia, aseta "5 min" -muistutus. Sulje sovellus KOKONAAN (ei vain taustalle, pyyhkäise pois). Odota 5-10 min (cron-viive huomioiden) — pushin pitäisi tulla ilmoituskeskukseen.
2. Aseta samalle rivillle toinen muistutus ("lisää toinen") — molempien pitäisi tulla.
3. Kalenteritapahtumalla jolla on kellonaika: kokeile "1 h ennen" -pikanappia, tarkista laskettu aika on oikea.
4. Aseta muistutus ja poista se × -napilla ennen erääntymistä — pushia EI pitäisi tulla.
5. Poista rivi/tapahtuma jolla oli muistutus — tarkista Table Editorista (`muistutukset`-taulu) että sen rivi katosi mukana.
6. Laitteella jolla push EI ole käytössä (ei koskaan painettu "Salli ilmoitukset"): ⏰-paneelin pitäisi näyttää ohje + "Asetuksiin"-nappi lomakkeen sijaan.

---

## OSA C — Testaa Hytti v1 + opiskelulaajennus (kun OSA B on läpäisty)

Täysi tausta ja tekniset yksityiskohdat ovat muistiinpanot.md:n osiossa **"Hytti v1 + opiskelulaajennus + ICS-syötekoneisto"** — tässä vain lyhyt testipolku:

1. Avaa Oma Hytti. Luo kortti "Projektikurssi", aseta sille kalenterisuodatin (esim. sana joka esiintyy jonkin oikean kurssitapahtuman nimessä, jos sellainen on lukujärjestyksessä — kesällä voi olla tyhjä, se on odotettua).
2. Lisää muistiinpanoja + 2 tehtävää eräpäivillä kortin sisälle (☑-nappi rivin oikealla puolella merkitsee sen tehtäväksi, sama nappi kuin ennenkin — pitkä painallus -valikkoa ei rakennettu, olemassa oleva nappi riitti).
3. Tarkista Tehtävät-koosteessa että molemmat näkyvät päivinä laskettuna.
4. Täppää yksi koosteesta — tarkista että se näkyy täpättynä myös kortin sisällä (ei katoa, jää yliviivattuna).
5. Nosta toinen ⚓-napilla Ankkureihin — tarkista se näkyy etusivulla.
6. Aseta kello-muistutus jollain hytti-rivillä — tarkista että push tulee (todistaa Muistutukset laajeni oikein Hyttiin).
7. Käännä Työ/vapaa-kytkin pois — tarkista opiskelu katoaa Etusivulta/perhekalenterista mutta näkyy yhä Hytin sisällä.
8. **Kirjaudu Juhan tilillä** — Juha EI saa nähdä MITÄÄN Katrin Hytistä: ei korttia, ei tehtävää, ei Itslearning/Lukkarikone-tapahtumia missään, ei edes jos hän yrittäisi kalenterinäkymän kautta.
9. **Kausiluontoinen muistutus:** Itslearning/Lukkarikone ovat kesällä todennäköisesti tyhjiä tai lähes tyhjiä — tämä on odotettua, testaa vain että haku ei kaadu virheeseen (0 tapahtumaa on hyväksytty tulos nyt). Oikea sisältötesti pitää tehdä UUDELLEEN elokuussa kun lukukausi on käynnissä.

---

## OSA D — Testaa Ankkurit henkilökohtaisina (riippumaton A/B/C:stä, voi tehdä milloin tahansa)

Ankkurit olivat tähän asti käytännössä yhteiset (kumpikin näki ja pystyi täppäämään/poistamaan toisenkin ankkurit) — tämä esti Juhaa aloittamasta Sataman oikeaa käyttöä. Korjattu `sql/029_ankkurit_henkilokohtaiset.sql`:llä (aja se, ks. yllä kohta A.3 lista, sijainti 5).

1. Kirjaudu Katrin tilillä — kaikki Katrin VANHAT ankkurit näkyvät edelleen hänellä ennallaan (ne on automaattisesti merkitty hänen omikseen migraatiossa).
2. Kirjaudu Juhan tilillä — hänen ankkurinsa alkavat TYHJÄSTÄ (ei näy mitään Katrin vanhoista).
3. Juha nostaa jonkin listarivin tai kalenteritapahtuman ⚓-napilla Ankkureihin — se näkyy VAIN Juhan etusivulla.
4. Kirjaudu takaisin Katrin tilillä samaan aikaan (esim. toisella puhelimella) — Katri EI näe Juhan äsken nostamaa ankkuria ollenkaan.
5. Kumpikin täppää oman ankkurinsa valmiiksi — tarkista ettei kumpikaan vahingossa täppää tai poista toisen ankkuria (napit eivät edes näytä toisen ankkureita, joten tätä ei pitäisi voida edes yrittää).

**Ei vielä tässä paketissa (kirjattu myöhemmäksi, älä ihmettele jos puuttuu):** ankkurin lähettäminen toiselle käyttäjälle ("Katrilta"-merkintä + push-ilmoitus), ja ristiriitalipun automaattiset ankkuriehdotukset — molemmat rakentuvat tämän henkilökohtaisen mallin päälle myöhemmin.

---

## OSA E — Testaa Juhan kalenteritilin syöterivit (riippumaton A/B/C/D:stä)

Ennen migraatiota: tarkista `?listaa=juha` (ks. yllä kohta A.3, rivi 6) että kalenterien nimet täsmäävät. Aja `sql/030_kalenteri_syotteet_data_juha.sql` JA `sql/031_kalenteri_juha_nimikorjaus.sql` (031 korjaa nimiongelman joka löytyi ensimmäisestä synkkayrityksestä — ks. muistiinpanot.md "Kalenterisyötteet"-osio).

1. Avaa Kalenteri-näkymä (käynnistää synkan) tai `GET /api/caldav-sync` suoraan selaimessa — **tavoite: JSON näyttää 8 syötettä, 0 virhettä.** Jos virheitä näkyy, lue tarkka virheteksti per syöte (yleensä "Kalenteria X ei löytynyt" = tunniste ei täsmää `?listaa=juha`:n näyttönimeen kirjain kirjaimelta — kerro Claudelle/Copilotille tarkka virhe).
2. **Tärkein tarkistus — ei tuplia:** jaettu "Yhteinen kalenteri" näkyy MOLEMPIEN tilien kautta (Katrin tililtä nimellä "Perhekalenteri", Juhan tililtä nimellä "Yhteinen kalenteri" — SAMA kalenteri, kaksi eri näyttönimeä eri tileillä), sen tapahtumien pitää näkyä agendassa TÄSMÄLLEEN KERRAN per tapahtuma, ei kahdesti. (Tekniikka: sama tapahtuma tuottaa saman `ical_uid`:n riippumatta kumman tilin kautta se haettiin, joten tietokannan `unique`-rajoite + päivitys-upsert pitävät sen yhtenä rivinä automaattisesti.)
3. Jos jokin tapahtuma NÄKYY kahdesti agendassa, se on todellinen bugi — kerro Claudelle/Copilotille tarkka tapahtuman nimi + päivä, jotta sitä voi tutkia.
4. Juhan OMAN yksityisen kalenterin ("Oma") tapahtumat — todennäköisesti niitä perjantain "kadonneita" menoja — pitäisi nyt ilmestyä agendaan "uusi"-merkinnällä (kuittausjono) kunnes joku kuittaa ne.
5. Jos vanha "Katri Rantanen" -niminen tupla-jaettu kalenteri (poistettu Juhan tililtä) on ehtinyt tuoda jotain Satamaan aiemmin, se pitäisi HÄVITÄ agendasta itsestään tämän synkan yhteydessä (peilisääntö) — ei vaadi käsin siivousta.

---

## OSA F — Ota äly-putki käyttöön (riippumaton kaikesta yllä olevasta)

**✓ TEHTY JA TODISTETTU 2026-07-12 oikealla laitteella** — "Testaa äly" vastasi järkevästi, `ANTHROPIC_API_KEY` paikallaan Vercelissä. Askeleet 1-5 säilytetty tässä jos joudut joskus tekemään tämän uudelleen (esim. avain vaihtuu):

1. Hae Anthropic-avain: console.anthropic.com → kirjaudu → **API Keys** → luo uusi avain (tai käytä olemassa olevaa jos sinulla on jo Anthropic-tili tälle projektille) → kopioi se (näkyy vain kerran).
2. Vercel → Kauppalista-projekti → **Settings** → **Environment Variables** → uusi muuttuja: **Key** = `ANTHROPIC_API_KEY`, **Value** = kopioitu avain → **Save**.
3. (Valinnainen, ei pakollinen nyt) Jos joskus haluat vaihtaa mallia ilman koodimuutosta: lisää toinen ympäristömuuttuja `ALY_MALLI` haluamallasi mallitunnisteella — jos tätä EI aseteta, käytetään koodissa olevaa oletusta.
4. Avaa Satama, mene **Asetukset → Sovellus** → paina **"Testaa äly"**.
5. **Putki todistettu jos:** napin alle ilmestyy järkevä suomenkielinen vastaus (esim. jokin lause hyvän sataman ominaisuuksista). Jos näkyy virhe:
   - "ANTHROPIC_API_KEY puuttuu Vercelistä" → askel 2 jäi tekemättä tai kirjoitusvirhe muuttujan nimessä.
   - "Mallitunniste ei kelvannut" → tarkista `ALY_MALLI` jos asetit sen, tai kerro Claudelle/Copilotille, koodin oletusmalli saattaa vaatia päivitystä.
   - Muu virhe → lue virheteksti, se on tarkoituksella selkokielinen suomeksi.

---

## OSA G — Testaa Laituri-avustaja (ensimmäinen oikea älyominaisuus, riippumaton kaikesta muusta)

Ei vaadi mitään uutta migraatiota tai asetusta — käyttää samaa `ANTHROPIC_API_KEY`:tä kuin OSA F.

1. Avaa Laituri, lisää muutama ajatus jos listalla ei ole yhtään sijoittamatonta riviä.
2. Paina jonkin rivin ✨-nappia (näkyy vain sijoittamattomilla riveillä, samassa kohdassa kuin →-nappi).
3. **Ehdotus ilmestyy** rivin alle muutaman sekunnin sisällä: "→ <kohde> · <lyhyt perustelu>" + [Sopii] [Ei] -napit.
4. Paina **Sopii** — pitäisi avautua sama "Minne sijoitit tämän?" -kysymys jota →-nappikin käyttää, mutta äly-ehdotus jo kirjoitettuna kenttään valmiiksi. Voit muokata tekstiä tai hyväksyä sellaisenaan — **mikään ei siirry mihinkään automaattisesti**, vasta kun painat OK tässä kysymyksessä.
5. Kokeile myös **Ei** — kortti katoaa, rivi pysyy sijoittamattomana, ei mitään tallenneta.
6. Tarkista ettei ✨-nappia paina mikään AUTOMAATTISESTI (esim. sivun lataus, haku) — sen pitäisi reagoida VAIN suoraan napin painallukseen.

---

Kysy Claudelta jos joku kohta ei täsmää tai jokin näistä napeista/valikoista ei löydy — käyttöliittymät muuttuvat välillä hieman.
