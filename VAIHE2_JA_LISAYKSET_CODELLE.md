# Vaihe 2 + tämän päivän lisäykset — koottu Codelle (17.8.2026)

## Kolmiportainen kadenssi — MVP-scope Reitin taustalogiikalle (18.8.2026, korjattu 18.8.)

**Korjaus samana päivänä: "ei sisältöpäätöksiä ilman keskustelua" -sääntöä sovellettiin liian laajasti.** Katrin täsmennys: hän EI halua itse päättää mitä opiskella milloin — koko sovelluksen tarkoitus on että systeemi päättää sen puolesta, jotta ei tarvitse ajatella sitä eikä ehdi paniikkiin. Sääntö koskee kahta ERI asiaa, jotka on syytä pitää erillään jatkossa:

1. **Panokselliset päätökset — pysyvät kysy-ensin:** uusien aiheiden/solmujen keksiminen joita ei ole oikeasti kursseilla, `hoitotaso`-tason laskeminen (kurssin tietoinen alibudjetointi), tehtävien sisällön generointi, osaamisen merkitseminen valmiiksi.
2. **Sijoittelu olemassa olevasta datasta — EI tarvitse kysyä, tämä on koko moottorin tarkoitus:** minkä JO OLEMASSA OLEVAN, jo kursseille syötetyn aiheen vuoro on tänään ja missä järjestyksessä. Tämä on laskentaa jo hyväksytyillä säännöillä (perustussolmu, tavoiteikkuna, interleaving, kertausjono, kuorma, boost-jatkuvuus) — ei sisällön keksimistä. Taso 1 alla on päivitetty tämän mukaisesti: ei enää pelkkä kapasiteettinäkymä vaan oikea päiväkohtainen sijoittelu.

Alla scope kolmelle tasolle. Tarkistettu suoraan tietokannasta ennen kirjoittamista — suurin osa tarvittavasta datasta on jo olemassa, tässä ei tarvita paljon uutta rakennetta.

**Jo olemassa, käytettävissä suoraan:**
- `opinto_aiheet`: `tavoiteikkuna` (tavoitepäivä), `viimeksi_kosketettu`, `tuntemus` (kuorma/hallinta-%), `perustussolmu`, `pero_vaihe`, `kertausjonossa`, `sr_interval_index`/`sr_next_review` (kertausjonon ajastus on jo olemassa, ei tarvitse keksiä uutta 1/3/7/21-mekanismia — tämä ON se)
- `opinto_kurssit.hoitotaso` (CHECK: `taysi`/`kevyt`/`vain_deadlinet`) — tämä ON jo se mekanismi jolla kurssia "kevennetään", kysyttiin 17.8. ikään kuin puuttuvana, mutta se on jo skeemassa. `tavoite` (`lapaisy`/`kunnollinen_osaaminen`/`perusta_jatkolle`) kertoo tarvittavan syvyyden.
- `opinto_sessiot` (alkoi_at/loppui_at/vaihe/taitosolmu_id) — todellisen tehdyn työn loki, tämä on "totuus" jota vasten suunnitelma tarkistetaan
- `hytti_opiskeluaika` (viikonpaiva + alkaa/paattyy) — viikoittain toistuvat käytettävissä olevat opiskeluikkunat
- `hytti_suljetut_ikkunat` (viikonpaiva + alkaa/paattyy + syy) — pysyvästi suljetut ikkunat (esim. 15.30–17)

### Taso 1 — kerran syksylle: laskee tavoitetahdin jokaiselle aiheelle

Tämä on nyt oikea sijoittelija, ei pelkkä kapasiteettinäkymä. Laskee jokaiselle aktiiviselle kurssille karkean tuntitarpeen `op_maara`-kentästä (1 op ≈ 27h, josta aikataulutetut Lukkarikone-luennot vähennetään = itsenäisen opiskelun tarve), jakaa tämän kurssin aiheille painottaen `perustussolmu`/`tavoite`-kentillä, ja **asettaa/tarkistaa jokaiselle aiheelle `tavoiteikkuna`-arvon** niin että koko kurssi mahtuu `hytti_opiskeluaika` miinus `hytti_suljetut_ikkunat` -kapasiteettiin ennen kurssin päättymistä. Jos kokonaiskuorma ei mahdu käytettävissä olevaan aikaan, tämä NÄKYY (varoitus, ei hiljainen ylikuormitus) — se on ainoa kohta jossa tämä taso puhuu Katrille sen sijaan että vain laskisi.

**Avoin, ei päätetty puolestasi:** 1 op ≈ 27h on Suomen yliopistojen yleinen nyrkkisääntö, ei tarkistettu sinun kursseiltasi — jos tuntuu väärältä käytännössä, tätä kerrointa pitää säätää, ei kovakoodata lopulliseksi.

### Taso 3 — joka yö: oikea päätösmoottori, tämä syöttää Nyt-kortin

Cron (sama `/api/cron.js?task=` -malli kuin muut ajastetut tehtävät). Lukee eilisen `opinto_sessiot`-rivit + `opinto_jumi_merkinnat`, laskee uudelleen tämän päivän priorisoidun jonon — **tämän tuloksen Nyt-välilehti näyttää suoraan `.nyt`-korttina, Katrin ei tarvitse valita mitään.** Säännöt joita jo käytetään muualla, sovelletaan tässä samoina — ei uusia periaatteita, ei kysytä lupaa jokaiselle sijoitukselle:
- Perustussolmu painottaa, ei pakota kärkeen (vahvistettu 17.8.)
- Interleaving: 2–3 kurssia päivässä kosketettava, ei pakollista 30 min -vaihtoa, flow voittaa
- Boost-jatkuvuus: eilen boostilla tehty ei nouse tänään ykköseksi uudelleen, jatketaan mihin jäätiin
- `tavoiteikkuna` (Taso 1:n asettama) painottaa kurssirajojen yli — mitä lähempänä ja mitä enemmän jäljessä, sitä korkeampi paino
- Kertausjono: `sr_next_review <= tänään` -rivit nostetaan mukaan
- **Ei uutta taulua pakollisena** — riittää funktio joka laskee jonon pyynnöstä, ajetaan cronilla vain lämmittämään/varmistamaan ettei laskenta viivästytä aamun ensimmäistä avausta.

### Taso 2 — kahden viikon välein, ainoa taso joka yhä kysyy

Jokaiselle `status='aktiivinen'` kurssille: vertaa sen aiheiden `tavoiteikkuna`-toteumaa (kuinka moni on `tuntemus`-tasolla joka vastaa aikataulua) todelliseen kalenteripäivään. Jos selvästi jäljessä: **ehdota** `hoitotaso`-muutosta (`kevyt` tai `vain_deadlinet`) — EI vaihda automaattisesti, koska tämä on kategoria 1 -päätös (kurssin tietoinen alibudjetointi vaikuttaa arvosanaan/tutkintoon, ei pelkkää sijoittelua). Näytetään samalla kehote-mekanismilla kuin vaiheensiirtymä (dismissible kortti, ei blokkaa). Katri hyväksyy/hylkää. **Jos tämäkin tuntuu liian raskaalta pyytää joka kerta, sano — voidaan vaihtaa esim. automaattiseksi kevennykseksi jos jälkeenjääneisyys ylittää tietyn kynnyksen, mutta se on eri päätös kuin tämän erän aihe.**

---

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

**1. Katrin kertaluonteinen askel — PÄIVITETTY, callback-endpoint (`/api/miro?action=callback`) on nyt rakennettu ja deployattu:**
- Luo Miro-appi osoitteessa developers.miro.com ("Build an app", ilmaistilillä).
- Redirect URI appin asetuksiin: `https://kauppalista-nine.vercel.app/api/miro?action=callback`
- Client ID + Client Secret Verceliin (`MIRO_CLIENT_ID`, `MIRO_CLIENT_SECRET`), redeploy (tyhjä commit riittää) jotta arvot tulevat voimaan.
- Valtuutuslinkki selaimeen (oma Client ID tilalle): `https://miro.com/oauth/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https%3A%2F%2Fkauppalista-nine.vercel.app%2Fapi%2Fmiro%3Faction%3Dcallback` — hyväksy, sivu näyttää `MIRO_ACCESS_TOKEN`/`MIRO_REFRESH_TOKEN` KERRAN (koodi kertakäyttöinen, sivua ei voi ladata uudelleen) — kopioi molemmat Verceliin.

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

**Kalenterivärit — KOKONAAN RATKAISTU 17.8., osa jo livenä ennen tätäkin keskustelua. Lopullinen, tarkistettu tietokannasta.**

Kaksi erillistä värijärjestelmää, älä sekoita:

1. **Henkilöidentiteetti ("kuka menee minne")** — `kalenteri_syotteet.vari`, jo täytetty:
   - Katri (`Katri`, `Katri (Juhan tilin kautta)`, ja nyt myös `Lukkarikone`) = `#D32F2F`
   - Juha (`Juha`, `Juha (Juhan tili)`) = `#1976D2`
   - Perhekalenteri / Yhteinen kalenteri (Juhan tili) = `#8E44AD` (liila)
   - Itslearning ja Juhan `Oma`-syöte: EI väriä tässä järjestelmässä, oma aiheen mukainen värinsä myöhemmin, ei koske tätä.
   - **`sql/130` ajettu 17.8.:** Lukkarikone (luennot) yhtenäistettiin Katrin punaiseen — aiemmin `vari` oli NULL.

2. **Sataman itse generoimat opiskelulohkot ("oppimissessiot", esim. boost-varaukset/opiskelusuunnitelma)** — UUSI, ei ole `kalenteri_syotteet`-rivi vaan Satamassa itse piirretty, tarvitsee oman värinsä koska ei tule mistään syötteestä:
   - Täyttöväri `#E3A62F` (keltainen, Katrin toive) + **pakollinen 2px `--muste`-reunaviiva.**
   - Reunaviiva ei ole koriste — se on ainoa keino pitää lohko luettavana kun Kuormavahdin taustaväri (`matalikko`/`karikko`) on päällä. Mitattu: kellertävä täyttöväri vs. `matalikko`/`karikko` antaa kontrastisuhteen ~1,0–1,4:1 (käytännössä näkymätön). Reunaviiva korjaa tämän riippumatta taustasta.

**Mitattu, todellinen ristiriita: Katrin `#D32F2F` ≈ `--vaara` (#B8433A).** Kontrastisuhde 1,08:1, sävyero ~4° — silmälle sama punainen. **Päätös: `--vaara` EI muutu** (koskematon, sen tehtävä riippuu itsensä-tunnistuksesta), Katrin punainen säilyy (10+v tunnistevärinä, ei vaihdeta). **Sen sijaan: deadline-rivi (§4.1, §7.3, käyttää `--vaara`:a) saa ei-väripohjaisen lisämerkin** — pieni ikoni tai paksumpi reunaviiva — jotta kahden identtisen punaisen esiintyessä samalla Reitti-näkymällä merkitys ei riipu pelkästä sävystä. Tämä on Coden toteutettavaksi, ei vielä rakennettu.

**Kuormavahti-tausta (päivän/viikon solun taustaväri kuormatason mukaan):** EI uutta väriä. Käyttää `matalikko` (kohonnut kuorma) / `karikko` (SOS) / `paperi` (normaali) täsmälleen samalla merkityksellä kuin muuallakin sovelluksessa — sama token, uusi käyttöpaikka.

**Alempana samalla välilehdellä (järjestys ylhäältä alas):**
1. itslearningistä haetut tehtävät/palautukset/deadlinet (`opinto_deadlinet`, jo olemassa)
   - Tiedostoliite riville: uusi `materiaali_deadline_id`-sarake `laituri`-tauluun, sama malli kuin `materiaali_kurssi_id` (ks. yllä kohta 12/erillinen osio)
2. Kurssit (jo rakennettu, §16.4/§5.2, ei muutu)
3. Kertausjono kunkin kurssin alla, täpättävä lista. Tavoiteväli 1/3/7/21 pv, suuntaa-antava — ei haittaa jos toteutuu vain 3 lyhyttä kertausta.

**Suunnittelun kadenssi joka syöttää tätä näkymää (§7-lisäys, ei uusi UI vaan taustalogiikka):** kerran syksylle täysi suunnitelma, kahden viikon välein tarkistus, joka yö uudelleenlaskenta edellisen päivän toteuman perusteella.
