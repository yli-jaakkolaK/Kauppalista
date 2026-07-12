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
8. `sql/033_hytti_omistajat_juha.sql` — lisää Juhan rivin `hytti_omistajat`-tauluun AUTOMAATTISESTI (hakee hänen auth-tunnisteensa sähköpostilla `auth.users`-taulusta, ei vaadi UUID:n kopiointia) — **AJA TÄMÄ ENNEN kohtaa 9** (`sql/032`), koska 032 tarvitsee tämän rivin toimiakseen
9. `sql/032_juha_oma_hytti_scope.sql` — Juhan "Oma"-kalenteri Hytin scopeen (ks. OSA E)
10. `sql/034_realtime_huomiopallurat.sql` — ottaa Supabase Realtime -Replication-julkaisun käyttöön `laituri`/`kalenteri_tapahtumat`/`kalenteri_kuittaukset`-tauluille (ks. OSA H) — TÄYSIN ERILLINEN muista, voit ajaa tämän vaikka jättäisit muut väliin
11. `sql/035_ohjeet_vinkit.sql` — luo `ohjeet`-taulun ja siirtää Asetusten 9 vinkkiä sinne + lisää 1 uuden (ks. OSA K) — TÄYSIN ERILLINEN muista

~~Tärkeä käsin täytettävä kohta migraation 027 jälkeen~~ — **KORVATTU 2026-07-13:** `hytti_omistajat`-taulu vaati Juhan rivin (`henkilo='juha'` → hänen auth-tunnisteensa), mutta `sql/027` loi vain Katrin rivin valmiiksi. Alunperin ohjeistettu lisäämään käsin Table Editorista, mutta tämä korvattiin `sql/033`:lla joka hakee tunnisteen automaattisesti sähköpostilla — ei tarvitse enää kopioida mitään UUID:ta käsin.

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

Ennen migraatiota: tarkista `?listaa=juha` (ks. yllä kohta A.3, rivi 6) että kalenterien nimet täsmäävät. Aja JÄRJESTYKSESSÄ: `sql/030_kalenteri_syotteet_data_juha.sql`, `sql/031_kalenteri_juha_nimikorjaus.sql`, `sql/033_hytti_omistajat_juha.sql`, JA VIIMEISENÄ `sql/032_juha_oma_hytti_scope.sql` (031 korjaa nimiongelman joka löytyi ensimmäisestä synkkayrityksestä, 033 lisää Juhan rivin `hytti_omistajat`-tauluun automaattisesti sähköpostilla, 032 tekee Juhan omasta kalenterista Hytti-scopen — ks. muistiinpanot.md "Kalenterisyötteet"- ja "Hytti v1..."-osiot). **033 on ajettava ennen 032:ta**, muuten Juha ei näkisi omaa kalenteriaan omassa Hytissäänkään.

1. Avaa Kalenteri-näkymä (käynnistää synkan) tai `GET /api/caldav-sync` suoraan selaimessa — **tavoite: JSON näyttää 8 syötettä, 0 virhettä.** Jos virheitä näkyy, lue tarkka virheteksti per syöte (yleensä "Kalenteria X ei löytynyt" = tunniste ei täsmää `?listaa=juha`:n näyttönimeen kirjain kirjaimelta — kerro Claudelle/Copilotille tarkka virhe).
2. **Tärkein tarkistus — ei tuplia:** jaettu "Yhteinen kalenteri" näkyy MOLEMPIEN tilien kautta (Katrin tililtä nimellä "Perhekalenteri", Juhan tililtä nimellä "Yhteinen kalenteri" — SAMA kalenteri, kaksi eri näyttönimeä eri tileillä), sen tapahtumien pitää näkyä agendassa TÄSMÄLLEEN KERRAN per tapahtuma, ei kahdesti. (Tekniikka: sama tapahtuma tuottaa saman `ical_uid`:n riippumatta kumman tilin kautta se haettiin, joten tietokannan `unique`-rajoite + päivitys-upsert pitävät sen yhtenä rivinä automaattisesti.)
3. Jos jokin tapahtuma NÄKYY kahdesti agendassa, se on todellinen bugi — kerro Claudelle/Copilotille tarkka tapahtuman nimi + päivä, jotta sitä voi tutkia.
4. **Juhan OMAN yksityisen kalenterin ("Oma") tapahtumat EIVÄT enää näy perheen agendassa/kuittausjonossa** (032:n jälkeen scope='hytti') — sen sijaan ne näkyvät VAIN Juhan omassa Hytissä (Tänään-kaista + hänen korttiensa "Kortin kalenteri", jos hän asettaa sopivan kalenterisuodattimen). Kirjaudu Juhan tilillä, avaa hänen Hyttinsä, lisää testiksi tapahtuma "Oma"-kalenteriin (esim. iPhonen Kalenteri-sovelluksesta) — sen pitäisi ilmestyä Juhan Tänään-kaistalle. Kirjaudu Katrin tilillä — **sama tapahtuma EI SAA näkyä missään Katrin näkymässä** (ei agendassa, ei kuittausjonossa, ei Kuormavahdissa).
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

## OSA H — Testaa Huomiopallurat (riippumaton kaikesta muusta)

Vaatii `sql/034_realtime_huomiopallurat.sql` ajettuna (ks. OSA A kohta 10) — ilman sitä Realtime-päivitykset eivät laukea, vaikka etusivun avaus laskee luvut silti oikein.

1. Kahdella tilillä yhtä aikaa (Katri + Juha): Juha lisää menon kalenteriin → Katrin Etusivun Kalenteri-laattaan pitäisi ilmestyä kultainen pallura muutaman sekunnin sisällä, ILMAN että Katri päivittää sivua.
2. Katri avaa Kalenterin ja painaa "Kuittaa kaikki" → pallura katoaa Kalenteri-laatasta.
3. Juha kirjoittaa uuden ajatuksen Laituriin → Katrin Laituri-laattaan ilmestyy pallura. **Juhan OMALLE etusivulle EI ilmesty palluraa** hänen omasta lisäyksestään.
4. Katri sijoittaa sen rivin ("→"-nappi, mikä tahansa kohde kelpaa) → pallura pienenee/katoaa Laituri-laatasta.
5. Kun molemmat luvut ovat nollassa, tarkista ettei laatoissa näy palluraa OLLENKAAN (ei pyöreää "0"-merkkiä, ei mitään).
6. Jos puhelin on asennettu kotinäytölle (iOS 16.4+): tarkista että sovelluskuvakkeen oikeassa yläkulmassa näkyy numero (kahden palluran summa) kun jompikumpi on > 0, ja katoaa kokonaan kun molemmat on kuitattu/sijoitettu.
7. **Tunnettu rajaus, ei bugi:** jos push-ilmoitus tulee kun sovellus on kokonaan suljettu, sovelluskuvakkeen numero EI päivity siitä pushista itsestään — se päivittyy vasta kun joku avaa sovelluksen (Realtime/lataus laskee sen silloin). Tämä on tietoinen rajaus, ks. muistiinpanot.md "Huomiopallurat"-osio.

---

## OSA I — Testaa ulkokäytettävyys, toinen kierros (ei migraatiota, riippumaton kaikesta muusta)

Katrin palaute 2026-07-10 ("testattu ulkona auringossa, kontrasti ei riitä") johti ensimmäiseen korjaukseen, mutta se laski värit vain juuri AA-rajan (4,5:1) yläpuolelle — ei riittänyt käytännössä. Toinen kierros (2026-07-13) tummensi värit reilummalla marginaalilla (n. 6-6,5:1) ja korjasi Kuormavahdin kuukausinäkymän pisteen näyttämään numeron pelkän hover-vihjeen sijaan (ei toiminut kosketusnäytöllä).

1. Vie puhelin ulos aurinkoiseen paikkaan, avaa Kalenteri käsivarren mitalta (älä pidä puhelinta lähellä kasvoja).
2. Päivä- ja viikkonäkymä: tarkista Kuormavahdin "N menoa" -pilleri, kellonajat ja otsikot — pitäisi olla luettavissa siristämättä silmiä.
3. Kuukausinäkymä: tarkista että kuormittuneen päivän kohdalla näkyy pieni meripihkanvärinen numeromerkki (esim. "6") päivänumeron vieressä, EI enää pelkkä väripiste ilman selitystä.
4. Käännä puhelin vaakatilaan viikkonäkymässä — pilleri EI saa olla enää silmin nähden pienempi kuin muu teksti ympärillä ("mikroskooppinen"-palaute korjattu).
5. Jos JOKIN näistä on edelleen vaikealukuinen: kerro Claudelle/Copilotille TARKKA elementti + valo-olosuhde (esim. "kuormapilleri viikkonäkymässä suorassa auringonpaisteessa") — seuraava kierros voi harkita täytettyä taustaa myös kuormamerkille (nyt yhä dashed-reunus, ei täytetty tausta — se on tarkoituksella varattu vain punaiselle päällekkäisyysmerkille).

---

## OSA J — Testaa Varaston "Luo kopio" (ei migraatiota, riippumaton kaikesta muusta)

1. Avaa mikä tahansa lista (Muistilaput TAI Varasto) jolla on ainakin yksi väliotsikko ja muutama rivi, osa täpättynä.
2. Avaa listan asetukset (🔒/👥-nappi ylhäältä), paina "Luo kopio".
3. Ehdotetun nimen ("{alkuperäinen} (kopio)") pitäisi näkyä valmiiksi kentässä — muokkaa sitä halutessasi, hyväksy OK:lla.
4. Palaa listan omaan näkymään (Muistilaput tai Varasto, sen mukaan missä alkuperäinen oli) — uuden kopion pitäisi näkyä listassa.
5. Avaa kopio: kaikki rivit + väliotsikot samassa järjestyksessä kuin alkuperäisessä, MUTTA kaikki täpät auki (vaikka alkuperäisessä osa oli täpätty).
6. Tarkista että kopio on YKSITYINEN oletuksena, vaikka alkuperäinen olisi ollut jaettu.
7. Kokeile myös peruuttaa (tyhjennä nimikenttä tai paina Peruuta `prompt()`-ikkunassa) — mitään ei pitäisi syntyä.

---

## OSA K — Testaa Vinkit ohjeet-taulusta (aja `sql/035_ohjeet_vinkit.sql` ensin, riippumaton kaikesta muusta)

1. Avaa Asetukset — "💡 Vinkit" -osiossa pitäisi näkyä 10 riviä (9 vanhaa tuttua + uusi "tarkista iPhonen oletuskalenteri" -vinkki, viimeisenä).
2. Supabasen Table Editorista `ohjeet`-tauluun: lisää uusi rivi, `content` = mikä tahansa teksti, `sort_order` = esim. 105. Sulje ja avaa Asetukset uudelleen sovelluksessa — uuden rivin pitäisi näkyä listan lopussa, EI vaadi mitään koodimuutosta tai deploytä.
3. Muuta jonkin rivin `sort_order`-arvoa Table Editorista — järjestyksen pitäisi muuttua vastaavasti seuraavalla avauksella.
4. Tarkista että "Missä muokataan mitäkin" -alaotsikon 5 riviä näkyvät ENNALLAAN (nämä pysyivät tietoisesti staattisina, eivät ole osa tätä muutosta).

---

## OSA L — Testaa Ruoka-välivaihe "Siirrä valitut Kauppalistalle" (ei migraatiota, riippumaton kaikesta muusta)

1. Tee testiksi lista Varastoon (esim. "Resepti: lohikeitto") 3-4 rivillä.
2. Avaa lista, paina otsikkorivin ☑-nappia (settings-napin/lukon vieressä) — jokaisen rivin eteen pitäisi ilmestyä oma valintaruutu, ja listan alle palkki "0 valittu" + [Peruuta] [Kauppalistalle] (jälkimmäinen harmaana).
3. Valitse 2 riviä valintaruuduista — laskurin pitäisi näyttää "2 valittu" ja Kauppalistalle-nappi aktivoitua.
4. Paina "Kauppalistalle" — toast-ilmoitus, valintatila sulkeutuu.
5. Avaa Kauppalista (Muistilaput → Kauppalista) — kahden valitun rivin nimet pitäisi näkyä siellä UUSINA, täppäämättöminä riveinä.
6. **Tärkein tarkistus:** avaa alkuperäinen "Resepti: lohikeitto" -lista uudelleen — sen pitäisi olla TÄYSIN ENNALLAAN, mitään ei poistunut/siirtynyt.
7. Testaa myös "Peruuta" (sulkee valintatilan, ei tallenna mitään) ja tarkista ettei ☑-nappi näy ollenkaan kun avaat itse Kauppalista-listan.

---

Kysy Claudelta jos joku kohta ei täsmää tai jokin näistä napeista/valikoista ei löydy — käyttöliittymät muuttuvat välillä hieman.
