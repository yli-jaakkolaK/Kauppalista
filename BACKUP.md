# Varmuuskopiot — koko perheen data yhdessä paikassa ilman turvaverkkoa asti nyt

Koko Sataman data (kauppalistat, kalenteri, Laituri, Hytti, kaikki) on tässä yhdessä Supabase-projektissa. Tähän asti ilman minkäänlaista palautussuunnitelmaa — jos joku vahingossa tyhjentäisi taulun SQL Editorista, tai Supabase-projekti katoaisi jostain syystä, ei olisi mitään mistä palauttaa. Tämä korjaa sen.

**Menetelmä: `pg_dump`.** Tämä on Postgresin OMA, vuosikymmeniä testattu varmuuskopiotyökalu — ei mitään itse kirjoitettua taikaa joka voisi hajota hiljaa. Se ottaa talteen KIRJAIMELLISESTI KAIKEN: kaikki taulut, kaikki rivit, kaikki tietotyypit, kaikki riippuvuudet oikeassa järjestyksessä — ei tarvitse ylläpitää mitään "muista lisätä uusi taulu tähän listaan" -tyyppistä muistilistaa, koska se lukee suoraan tietokannan omasta rakenteesta.

---

## Kertaluontoinen asennus (tee tämä VAIN ensimmäisellä kerralla)

`pg_dump`/`pg_restore`-työkalut eivät ole Macissa valmiiksi asennettuna. Asenna Homebrew'lla (jos Homebrew ei ole vielä asennettu, käy ensin osoitteessa brew.sh ja aja sivun ohje):

```
brew install libpq
brew link --force libpq
```

(`libpq` on kevyt "vain työkalut" -paketti — EI asenna kokonaista Postgres-palvelinta koneellesi, vain tarvittavat komentorivityökalut.)

Tarkista että asennus onnistui:

```
pg_dump --version
```

Pitäisi tulostaa jokin versionumero virheen sijaan.

---

## Mistä SUPABASE_DB_URL löytyy

1. Mene supabase.com, kirjaudu, avaa Kauppalista-projekti.
2. Vasemmalta: **Project Settings** (rattaan kuva alhaalla) → **Database**.
3. Etsi otsikko **Connection string**.
4. Valitse välilehdeltä **URI** (EI "Transaction pooler" tai "Session pooler" — pg_dump toimii luotettavimmin suoralla yhteydellä).
5. Kopioi näkyvä osoite. Se näyttää tältä (esimerkki, EI oikea):
   ```
   postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-xx-xxxx-1.pooler.supabase.com:5432/postgres
   ```
6. **Korvaa `[YOUR-PASSWORD]` oikealla tietokannan salasanalla** (EI Supabase-tilisi kirjautumissalasana — tämä on erillinen tietokannan oma salasana, joka näkyy samalla Database-sivulla, tai jos et muista sitä, sivulla on "Reset database password" -nappi).

Tämä koko osoite on **arkaluontoinen** — se on avain suoraan koko perheen tietokantaan, ohittaen kaikki normaalit rajoitukset (RLS). Älä liitä sitä mihinkään pysyvään tiedostoon tässä repossa, älä keskusteluihin, älä muistilapuille. Käytä sitä VAIN hetkellisesti terminaalissa (ks. alla).

---

## Varmuuskopion ottaminen (yhdellä komennolla)

Terminaalissa, tämän projektin kansiossa:

```
SUPABASE_DB_URL="liimaa_osoite_tähän" ./scripts/varmuuskopio.sh
```

Tämä:
- tallentaa kopion `.sql`-tiedostona, nimessä päivämäärä+kellonaika
- jos koneella on iCloud Drive käytössä (todennäköistä, koska iCloud-kalenteri on jo käytössä), kopio menee automaattisesti iCloud-synkattuun kansioon `~/Library/Mobile Documents/com~apple~CloudDocs/Satama-varmuuskopiot/` — **säilyy siis pilvessä ilman että sinun tarvitsee tehdä mitään erikseen**
- jos iCloud Drive -kansiota ei löydy, kopio menee `~/Documents/Satama-varmuuskopiot/` — **tässä tapauksessa SIIRRÄ kansio itse johonkin pilvipalveluun** (Google Drive, Dropbox, tai mikä tahansa jota käytät) — pelkkä paikallinen kopio EI riitä, koska koko kehityskone palautuu 23.7.2026 eikä kopio saa jäädä sen mukana pois käytöstä

Terminaali sulkee itsestään yhteyden komennon jälkeen, salasana ei jää mihinkään talteen (paitsi jos käytät komentohistoriaa — voit tyhjentää sen `history -c` jos haluat olla tarkka).

**Milloin ottaa uusi kopio:** aina kun on tehty jotain isoa (uusi ominaisuus, iso datamuutos), ja muutenkin säännöllisin väliajoin (esim. kerran kuussa). Ei ole vielä ajastettu automaattiseksi — ks. alla.

---

## Voiko tämän ajastaa automaattiseksi?

Kyllä, myöhemmin jos haluat — ei ole pakko tehdä nyt. Kaksi vaihtoehtoa jos joskus haluat tämän tapahtuvan itsestään:

1. **macOS `launchd`** (koneesi oma ajastin, kuten cron mutta Applen versio) — vaatisi pienen konfigurointitiedoston joka ajaa `varmuuskopio.sh`:n esim. kerran viikossa. Toimii vain kun kone on päällä ja käynnissä.
2. **GitHub Actions** (sama tekniikka jota jo käytetään Muistutusten ajastukseen, ks. `.github/workflows/muistutukset-cron.yml`) — toimisi myös kun kone on kiinni, mutta vaatisi `SUPABASE_DB_URL`:n tallentamisen GitHub-secretiksi. **Tätä EI ole rakennettu tarkoituksella** — tietokannan täysi yhteysosoite on paljon arkaluontoisempi kuin muut tähän mennessä käytetyt salaisuudet (se ohittaa RLS:n kokonaan), joten sen tallentaminen ulkopuoliseen palveluun ansaitsee oman tietoisen päätöksen, ei hiljaista oletusta.

Jos haluat jommankumman näistä, pyydä erikseen.

---

## Palautus (askel askeleelta) — VAIN jos jotain oikeasti menee pieleen

**Tämä on harvinainen, huolellisuutta vaativa toimenpide — lue koko ohje läpi ENNEN kuin ajat mitään.** Palautus voi ylikirjoittaa nykyistä dataa, joten varmista ensin ettei nykyisessä tietokannassa ole jotain uutta jota et halua menettää.

1. Selvitä mitä oikeasti tarvitset palauttaa: KOKO tietokanta (esim. jos koko projekti piti luoda uudestaan) vai vain YKSI taulu (esim. joku vahingossa tyhjensi yhden taulun)?

2. **Koko tietokannan palautus** (harvinaisin, järein tapaus — esim. täysin uusi tyhjä Supabase-projekti):
   ```
   psql "$SUPABASE_DB_URL" -f polku/varmuuskopiotiedostoon.sql
   ```
   Tämä ajaa koko varmuuskopiotiedoston sellaisenaan uutta/tyhjää tietokantaa vasten. **ÄLÄ aja tätä tietokantaa vasten jossa on jo dataa** — `pg_dump`in oletustuloste EI tyhjennä tauluja ensin, joten tuloksena olisi virheitä (rivit joilla on jo sama `id`) tai pahimmillaan tupla-dataa.

3. **Yhden taulun/muutaman rivin palautus** (todennäköisempi tarve): varmuuskopiotiedosto on tavallinen SQL-tiedosto, luettavissa millä tahansa tekstieditorilla. Etsi siitä oikea `COPY tablename ...` tai `INSERT INTO tablename ...` -kohta (tiedostossa on selkeät `--` -kommentit taulujen välissä), kopioi VAIN se osuus, ja aja se erikseen Supabasen SQL Editorissa TAI `psql`:llä. Tarkista ensin SELECT-kyselyllä mitä tauluun tällä hetkellä on, jotta tiedät mitä olisit korvaamassa.

4. **Jos et ole varma kumpi tapaus on kyseessä, tai pelkäät tekeväsi virheen:** älä arvaile — kysy Claudelta/Copilotilta ensin, näytä varmuuskopiotiedosto ja tilanne, ja pyydä tarkka komento juuri siihen tilanteeseen ennen kuin ajat mitään.

---

## Muista

- Varmuuskopiotiedostot EIVÄT mene gittiin (`.gitignore` estää tämän jo) — ne sisältävät oikeaa perheen dataa, ei kuulu versionhallintaan.
- `SUPABASE_DB_URL` on arkaluontoinen — käytä sitä vain hetkellisesti komentoriviltä, älä tallenna sitä pysyvästi mihinkään tiedostoon.
- Supabase saattaa myös itse ottaa automaattisia varmuuskopioita riippuen tilaustasosta (Pro-tason projekteilla on usein point-in-time-recovery) — tarkista Project Settings → Database jos haluat tietää onko tämä käytössä. Tämä käsin ajettava kopio on siitä riippumaton lisäturva, ei korvaa sitä eikä ole sen korvaama.

---

## Varmuuskopiohistoria

Loki jokaisesta käsin ajetusta `varmuuskopio.sh`-ajosta: päivämäärä, mitä kopio kattoi, minne tallentui. Uusi rivi jokaisen ajon jälkeen — vanhoja ei muokata.

- **2026-07-20 klo 14:35 — ensimmäinen käsin ajettu varmuuskopio.** Koko Supabase-tietokanta `pg_dump`-muodossa (kaikki 65 taulua sellaisenaan, mukaan lukien Toistuva-muistutus-featuren tuore skeema `sql/077`/`sql/078`:sta — `muistutukset`-taulun `recurring`/`recurrence_type`/`weekdays`/`interval_n`/`interval_unit`/`time_of_day`/`ends_at`-sarakkeet vahvistettu mukana). Tallennuspaikka: iCloud Drive, `~/Library/Mobile Documents/com~apple~CloudDocs/Satama-varmuuskopiot/satama_varmuuskopio_2026-07-20_14-35-13.sql` (472 KB, synkkautuu pilveen automaattisesti). Ensimmäinen kerta kun tämä ohje otettiin oikeasti käyttöön — `pg_dump`/`libpq` asennettiin samalla kertaa tälle koneelle (ks. "Kertaluontoinen asennus" yllä).
