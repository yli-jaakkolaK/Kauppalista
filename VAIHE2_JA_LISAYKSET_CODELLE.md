# Vaihe 2 + tämän päivän lisäykset — koottu Codelle (17.8.2026)

## Vaihe 2 — menetelmä, tila tarkistettu koodista

7. **PERO/PACER-ristitulo ja ohjeiden generointi (§7.4)** — VALMIS. A3/A4 rakennettu tänään, `ohjematriisi` luetaan livenä Tehtävänäkymässä.
8. **Vaiheensiirtymät ja kehote** — RAKENNETAAN NYT (Katrin vahvistus 17.8.). Ks. laajennettu speksi alla — ei enää pelkkä yksittäisen solmun kyllä/ei-kehote, vaan kurssirajat ylittävä versio.
9. **Ylläpidon korjaukset (§7.5)** — SUURELTA OSIN VALMIS. `yllapidonSeuraavaVali()` (21–28pv × 1,5) ja `kertausjonossa`-ryhmittely/merkki ovat livenä. **Tarkistettava:** onko "jää ylläpitoon" -täppä olemassa solmurivillä — ei löytynyt koodista, saattaa puuttua.

## Uusi: Vaiheensiirtymän kehote, kurssirajat ylittävä (§7.4-lisäys)

Kehote näkyy edelleen kun solmu avataan (ei istunnon lopussa). Uutta: priorisointi lukee KAIKKIEN aktiivisten kurssien `opinto_aiheet.tavoiteikkuna`-kenttiä yhdessä, ei kurssikohtaisena siilona — sama painotusmekanismi kuin §7.3, vain laajennettu kurssirajan yli. Estää yhden solmun jumiutumisen kun muut kurssit etenevät, ja pitää opiskelun luentoja edellä koska `tavoiteikkuna` on jo asetettu ennakoivasti.

## Uusi: Retrieval, Frame per kierros (§10.1)

Vahvistettu rakennettavaksi. Yksi jaettu Miro-board (ei per kurssi), joka retrieval-kierros saa oman uuden Framen automaattisesti — ei manuaalista tyhjennystä. Osittain päällekkäin encodingin kanssa (sama board/embed-infra).

## Uusi: Deadline-rivin tiedostoliite

`opinto_deadlinet` (sql/083) on olemassa. Lisää `laituri`-tauluun nullable `materiaali_deadline_id`, sama malli kuin `materiaali_kurssi_id` (sql/117). Deadline-riville raahattu tiedosto kulkee olemassa olevan editorin/tiedostoputken kautta (§16.3), vain uudella kohdekentällä — ei uutta infraa.

## Miro — RAKENNETAAN NYT, suositeltu toteutustapa

REST API sisältyy Miron ilmaistasoon (tarkistettu miro.com/pricing 17.8.2026) — ei vaadi maksullista tilausta.

**Kaksi taulua, ei yksi (Katrin täsmennys 17.8.):** Board A = encoding + overlearning, kaikki kurssit samalla taululla omina frameworkeina. Board B = retrieval, kaikki kurssit samalla mutta ERI taululla, Frame per kierros nimettynä `{kurssi} · {solmu} · kierros {n}`.

**Korjaus samana päivänä: Helmi EI ole kolmas Miro-board.** Se toimii kokonaan Sataman omassa editorissa, ei Mirossa — aiempi maininta "helmiboard omana taulunaan" oli virheellinen tulkinta. **Ilmaistason 3 boardista käytössä siis vain 2 (A, B) — kolmas jätetään tarkoituksella tyhjäksi/varaan**, ei täytetä millään nyt.

**Miksi tämä reitti, ei monimutkaisempaa:** Satamalla on käytännössä 2 käyttäjää (Katri + Juha) yhdellä Supabase-projektilla, ei julkinen monivuokralainen palvelu. Täyttä OAuth-asennusvirtaa (jonka Miro-appit yleensä tarvitsevat uusille käyttäjille) ei tarvita — riittää KERTALUONTOINEN valtuutus, jonka jälkeen palvelin pitää tokenit hengissä itse.

**1. Katrin kertaluonteinen askel (ei koodia):**
- Luo Miro-appi osoitteessa developers.miro.com ("Build an app", ilmaistilillä).
- Käynnistä appin OAuth-asennus kerran omalle tilille (Miro näyttää valtuutusnäytön, hyväksy).
- Miro palauttaa `access_token` + `refresh_token` — nämä kopioidaan Vercelin ympäristömuuttujiin (`MIRO_ACCESS_TOKEN`, `MIRO_REFRESH_TOKEN`, `MIRO_CLIENT_ID`, `MIRO_CLIENT_SECRET`), EI koskaan clientille asti.

**2. Palvelinpuolen proxy (Coden työ), uudet Vercel-funktiot `api/miro-*.js`:**
- Kaikki Miro-kutsut kulkevat palvelimen kautta, token ei koskaan selaimeen.
- `access_token` vanhenee ~1h — pieni refresh-funktio joka uusii sen `refresh_token`:lla automaattisesti ennen jokaista kutsua tai kun 401 tulee vastaan.

**3. Kertaluonteinen board-setup, KAKSI boardia:**
- Yksi funktio joka luo Board A:n (encoding+overlearning) ja Board B:n (retrieval) kerran, tallentaa molempien `board_id`:t Supabaseen (esim. `asetukset`-tauluun, sama malli kuin muut yksittäiset asetusarvot — kaksi riviä, ei yhtä).

**4. Kurssin framework/Frame (Board A):**
- Kun kurssi luodaan tai ensimmäistä solmua aletaan encodata: funktio luo Framen Board A:lle, tallentaa `frame_id`:n `opinto_kurssit`-riville (uusi sarake).

**5. Retrieval-kierroksen oma Frame (Board B):**
- Kun retrieval-kierros alkaa: funktio luo uuden tyhjän Framen Board B:lle, nimeää sen `{kurssi} · {solmu} · kierros {n}` (löydettävyys hakemalla kun kertyy paljon), tallentaa `frame_id`:n kierrosriviin (esim. `opinto_sessiot` tai vastaava, tarkistettava mihin kierrosnumero jo kirjataan).

**6. Upotus Tehtävänäkymään, muokattavana (§10.1:n "muokkaus tapahtuu Satamassa" -vaatimus):**
- Miron Live Embed -iframe (`miro.com/app/live-embed/{board_id}/?moveToWidget={frame_id}`) kohdistettuna oikeaan Frameen.
- **AUKKO, testattava rakentaessa, ei oletettava:** toimiiko muokkaus iframe-upotuksessa suoraan Katrin ollessa kirjautuneena Miroon samassa selaimessa, vai vaatiiko se erillisen kirjautumisnäytön iframen sisällä ensimmäisellä kerralla. Ei tiedossa etukäteen, Coden pitää kokeilla oikeasti eikä olettaa.

**7. Muokkausloki ajanoton varmistukseen (§4.3):**
- REST API:sta luetaan Framen/itemien viimeisin muokkausaika istunnon lopetushetken vertailuun ("paluu Satamaan vai Miron muokkaus, kumpi tuoreempi").

**Ei vielä päätetty, ei tämän erän piirissä:** position/connector-datan (todettu saatavilla, viesti aiemmin) käyttö vaiheensiirtymäpäätöksessä — rakennetaan ensin perusupotus, tämä on erillinen, myöhempi päätös.

## Reitti-välilehden kalenterilogiikka ja UI — RAKENNETAAN NYT

**Layout: standardi iCal-viikkoruudukko.** 7 päivää vierekkäin (vaakaan) yli viikon, kukin päivä omana pystysarakkeenaan jossa tunnit juoksevat ylhäältä alas, aamu ylimpänä. (Ei ristiriita §5.1:n "päivät ovat pystysarakkeita" -kirjauksen kanssa — sama asetus, väärinymmärretty ristiriidaksi aiemmin tässä keskustelussa, ks. korjaus.)

**Sisältö samassa ruudukossa, koko viikko kerralla näkyvissä:**
- Luennot (lukkarikoneesta)
- Opiskelusuunnitelma
- Muut menot (esim. hammaslääkäri, perhekalenterin tapahtumat)
- **Toteutunut opiskelu jää näkyviin samaan ruudukkoon**, ei vain suunnitelma — tämä on päivän kertymän paikka (jo linjassa §5.1:n kanssa)
- **Realistinen siirtymäaika paikasta toiseen**, Föli-pohjainen — **RIIPPUVUUS: vaatii oikean Föli-integraation (§8.1), joka EI ole vielä rakennettu (ei GTFS/SIRI-kutsuja koodissa, tarkistettu 17.8.).** Tämä pitää rakentaa ensin tai samassa yhteydessä, muuten siirtymäblokit jäävät paikkamerkeiksi.

**Kalenterivärit — Katrin päätös 17.8., uudet tokenit `satama-design-kuvaus.md`:hen:**
- Katrin oma = kirkas keltainen (EI `--sinappi`, selvästi erottuva siitä)
- Juhan kalenteri = iCalin oma natiivi sininen, luetaan suoraan syötteestä — todennäköisesti ei tarvitse omaa Satama-tokenia ollenkaan
- Yhteinen = kirkas vihreä (EI `--syvänne` — tiedostettu, hyväksytty riski: "oma väri + Juhan väri = yhteinen väri" -sekoituslogiikka, Katrin oma perustelu, ei virhe)
- **Tarkat hex-arvot vielä vahvistamatta** — älä lyö lukkoon lopullisia sävyjä ilman erillistä pikatarkistusta Katrilta ennen julkaisua, sama periaate kuin muillakin uusilla väreillä (§4.1).

**Alempana samalla välilehdellä (järjestys ylhäältä alas):**
1. itslearningistä haetut tehtävät/palautukset/deadlinet (`opinto_deadlinet`, jo olemassa)
   - Tiedostoliite riville: uusi `materiaali_deadline_id`-sarake `laituri`-tauluun, sama malli kuin `materiaali_kurssi_id` (ks. yllä kohta 12/erillinen osio)
2. Kurssit (jo rakennettu, §16.4/§5.2, ei muutu)
3. Kertausjono kunkin kurssin alla, täpättävä lista. Tavoiteväli 1/3/7/21 pv, suuntaa-antava — ei haittaa jos toteutuu vain 3 lyhyttä kertausta.

**Suunnittelun kadenssi joka syöttää tätä näkymää (§7-lisäys, ei uusi UI vaan taustalogiikka):** kerran syksylle täysi suunnitelma, kahden viikon välein tarkistus, joka yö uudelleenlaskenta edellisen päivän toteuman perusteella.
