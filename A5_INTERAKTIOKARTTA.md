# A5 — Nyt-välilehti + Tehtävänäkymä: interaktiokartta

17.8.2026. Kaikki painettavat elementit ja mitä tapahtuu painettaessa, koottuna yhteen ennen Codelle lähettämistä. Lähde: `nyt-valilehti-mockup-v1.html` + tämän päivän päätökset `SATAMA_SPEKSI.md`:ssä.

## Nyt-välilehti

**`.nyt`-kortti (käynnissä/seuraava asia).** Koko kortti on yksi painike, ei erillistä nuolta. Painallus avaa Tehtävänäkymän tälle solmulle+vaiheelle ja käynnistää ajanoton äänettömästi (§4.3 — ei näkyvää laskuria, päättyy kun palaa Satamaan tai Miron Frame viimeksi muokattu, kumpi tuoreempi). Mitä avautuu, riippuu vaiheesta — ks. taulukko alla.

**"Muut vaihtoehdot" -nappi.** Kompakti kosketettava nappi perustelurivin alla. Painallus avaa/sulkee listan 1-2 vaihtoehtoista kohdetta, jokainen omana kosketettavana laatikkonaan (ei pudotusvalikko). Vaihtoehdon painallus avaa Tehtävänäkymän SILLE kohteelle, samalla logiikalla kuin `.nyt`-kortti.

**Boost-napit (15 / 30 / 60 / ··).** 15/30/60: poimii tehtäviä päivän jonosta kestolla suodatettuna (§4.6), ei omaa erillistä lähdettä. `··`: avaa iOS-natiivin rullavalitsimen (10–120 min, kevyt haptiikka jokaisesta arvosta, §4.8).

**Loki-rivit (tulevat opiskelupätkät, Lounas, Lähtö, liveluento).** EI painettavia. Nyt-näkymän periaate on yksi seuraava asia kerrallaan (§4.2) — tulevaan ei hypätä koskettamalla riviä, vaan Boostin tai Muut vaihtoehdot -reitin kautta.

**Deadline-rivi.** Ei painike, pelkkä tieto. Näkyy vain 1–2 pv ennen palautusta, `--vaara`-värillä (§7.3, päätetty tänään).

## Tehtävänäkymä — mitä .nyt-kortin painallus avaa, vaiheittain

| Vaihe | Miro? | Mitä näkyy |
|---|---|---|
| Priming | Ei | Ohje (3 askelta, vain nykyinen auki) + kysymyskenttä (askel 3:n ohje viittaa suoraan "kenttä alla" -tekstillä, siis pakollinen kenttä ei vapaaehtoinen) |
| Encoding | Kyllä | YKSI jaettu Miro-taulu koko käyttäjälle (ei per kurssi — Miron ilmaistaso antaa vain 3 taulua, ei riittäisi useammalle kurssille), kurssi on oma framework/Frame siinä. Solmu avautuu työstettävästä kohdasta. Ohje risteää vaihe×PACER-tyyppi (GRIND konseptuaaliselle, muut proseduraaliselle/analogiselle) |
| Reference | Ei | Erillinen yksinkertainen varasto/lista (ei kartta) — pikkuyksityiskohdat siirretään pois encoding-kartalta tänne |
| Retrieval | Kyllä | Oma tyhjä Frame per kierros, vanhoja ei poisteta — kierros 1 ja 3 rinnakkain näkyvissä. Konseptuaalinen kierros 1: piirrä muistista, korjaa sitten eri värillä materiaalia vasten |
| Overlearning | Riippuu tyypistä | Konseptuaalinen: laajentaa SAMAA encoding-taulua. Proseduraalinen: erillinen (vaikeampi) tehtävä, ei taulua. Analoginen: sisältö päätetty (`sql/128`), kanvaasitarve auki |

**"En pääse alkuun" -nappi.** Tarjoaa pienemmän askeleen samasta vaiheesta, kirjaa merkinnän + käytetyn ajan (`aika_kaytetty_s`, jo rakennettu).

**Vaiheensiirtymä-kehote.** Näkyy kun solmu avataan, ei istunnon lopussa. Ainoa pois kytkettävissä oleva osa (asetuksista) — itse ohjeet eivät katoa.

---

## Avoimet päätökset — nämä Code todennäköisesti kysyy ennen kuin tämä on valmis rakennettavaksi loppuun asti

1. ~~Muut vaihtoehdon valinta~~ — **RATKAISTU 17.8.:** kertaluontoinen ohitus vain tälle istunnolle, ei pysyvä jonon uudelleenjärjestys.
2. ~~Retrieval/encoding-Miro PACER-tyypeittäin~~ — **RATKAISTU 17.8.:** Miro käytössä konseptuaaliselle ja analogiselle. Proseduraalinen (matikka/koodaus/fysiikka) EI Miroa — ratkaistaan paperilla/koodiympäristössä, tulos raportoidaan lyhyenä täppäyksenä. Vaikeuden kirjaus ("jäin jumiin") käyttää jo olemassa olevaa `opinto_jumi_merkinnat`-mekanismia, ei uutta.
3. **Analoginen overlearning, kanvaasitarve:** yhä auki — sisältö päätetty (`sql/128`), tapa (Miro vai teksti) ei.
4. ~~Boost-jatkuvuuden mekanismi~~ — **RATKAISTU 17.8.:** yöllinen ajo, osana laajempaa kolmiportaista kadenssia (kerran syksylle, kahden viikon välein tarkistus, joka yö uudelleenlaskenta) — ks. §5 lisäys.
5. ~~Retrieval-korjauspassin laukaisin~~ — **RATKAISTU 17.8.:** manuaalinen, ei automaattinen — käyttäjä vertaa itse ennen kuin näkee mikä puuttuu (aktiivinen palautus > passiivinen paljastus).
6. ~~Rakennesignaalin käyttö~~ — **RATKAISTU 17.8.:** käytetään kaikkea mitä Miron API antaa (position/connector mukaan lukien), ei rajata pelkkään tekstiin.
7. ~~Priming-kentät, 1 vai 3~~ — **RATKAISTU 17.8.:** Katrin ohje "ratkaise niin kuin parhaaksi näet" — kolme pientä kenttää ehdotuksen mukaisesti.
8. **Kalenterivärit:** osittain ratkaistu 17.8. — punainen (Katri) / sininen (Juha, iCal-natiivi) / liila (yhteinen) valittu, mutta **punainen osuu suoraan `--vaara`:n päälle, uusi ristiriita, ei ratkaistu.** Liilalle ei vielä hex-arvoa.
9. ~~"Luo solmun kohta kurssin Frameen" -nappi~~ — **SELITETTY 17.8.:** koko kurssi on yksi kartta, solmu avautuu omasta kohdastaan — tämä nappi luo sen kohdan ensimmäistä kertaa.
10. ~~Perustussolmun painotus~~ — **VAHVISTETTU 17.8.:** painottaa, ei pakota kärkeen.

**Uudet, tässä keskustelussa esiin tulleet avoimet kohdat:**

11. ~~Reitin viikkokalenterin suunta~~ — **EI OLLUTKAAN RISTIRIITA (oma virhe 17.8.):** standardi iCal-viikkoruudukko, 7 päivää vierekkäin, kukin pystysarakkeena tunneittain. Ratkaistu.
12. **Voiko itslearning-deadline-riville raahata oman tiedoston?** — **TÄSMENNETTY 17.8.:** kyllä. `opinto_deadlinet`-taulu (sql/083) on jo olemassa. Toteutus: uusi nullable `materiaali_deadline_id`-sarake `laituri`-tauluun, tarkalleen sama malli kuin nykyinen `materiaali_kurssi_id` (sql/117) — deadline-rivillä raahattu tiedosto kulkee saman jaetun editorin/tiedostoputken kautta (§16.3, `laituri_tiedostot`) vain eri kohdetunnisteella. Ei uutta infraa, sama putki uudella kohdekentällä.
13. **Kertausjonon tavoiteväli 1/3/7/21 pv** kirjattu — ei vielä toteutettu.
