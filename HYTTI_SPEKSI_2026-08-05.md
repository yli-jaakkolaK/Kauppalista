# Hytti — informaatioarkkitehtuuri ja opiskelumoottori

**Päivätty:** 2026-08-05
**Status:** speksi, ei vielä toteutettu
**Pohjautuu:** Hytti/Opintopolku-auditointiin (2 tutkimusajoa, koodi + migraatiot) sekä tämän päivän suunnittelukeskusteluun

---

## 0. Miksi tämä dokumentti on olemassa

Hyttiä on rakennettu niin, että ensin on rakennettu ja sitten mietitty. Auditointi vahvisti tämän konkreettisesti: 95 taitosolmua rakennettiin 2026-08-04 ja kumottiin seuraavana päivänä väärän mallin takia. Tämä dokumentti on se "mietitään ensin" -vaihe, joka olisi pitänyt tehdä ennen sitä.

Kolme asiaa, jotka auditointi osoitti vääriksi aiemmista oletuksista:

1. **Ei ollut kahta rinnakkaista solmudataa.** Yksi ainoa AI-generoitu migraatio (sql/095, commit 5ac1f27), 62 koodaus + 33 matikka = 95, kumottu seuraavana päivänä. Ei erillistä käsin lisättyä erää.
2. **Hytin "neljä peruskysymystä" (mitä nyt / miten liittyy / pienin askel / onko liikaa) ei esiinny missään repon dokumentissa.** Se ei ole dokumentoitu periaate.
3. **Toisto-/välistysmoottori on jo rakennettu** (`sr_interval_index`, `sr_next_review`, välit [1,3,7,21], sitten ylläpito). Ei puuttuva ominaisuus. Ainoa puute: ylläpito toistuu tasaisella 60 päivän syklillä eikä pitene.

Iso oivallus: **suuri osa siitä mitä on suunniteltu on jo olemassa eri nimellä.** `opinto_aiheet` *on* se väliotsikkotason opiskelusolmu — kurssikohtainen, PACER-vaihe olemassa, kulkee moottorissa. Siitä puuttuu kaksi saraketta. Ei uutta taulua, ei uutta kerrosta.

---

## 1. Tavoite

Käyttäjän ei tarvitse miettiä mitä opiskella, missä vaiheessa tai miten. Suunnitelma on realistinen kuormitus huomioiden. Kitka opiskelun aloituksessa minimoidaan. Tavoite: se mihin ennen meni 20 h opitaan huomattavasti tiiviimmässä ajassa.

Suurin yksittäinen kitka jonka käyttäjä on nimennyt: **ei tiedä mitä konkreettisesti tehdä missäkin PACER-vaiheessa.** Esim. "aloita encoding quadraticsista" ei kerro mitään tekemistä. Tämän poistaminen on projektin ydin, ei sivutuote.

---

## 2. Informaatioarkkitehtuuri

Hytissä on kaksi eri tilaa, jotka pitää erottaa fyysisesti:

- **Tekeminen** — päivittäistä, tapahtuu väsyneenä, ei saa sisältää yhtään valintaa
- **Katsominen** — viikoittaista tai harvempaa, tapahtuu virkeänä, on nimenomaan silmäilyä

Näiden sekoittaminen on "dashboard-ansa", joka on jo kertaalleen dokumentoitu repossa perusteluna sille miksi Kokonaiskartta pidettiin erillään päivänäkymästä. Sama logiikka pätee kurssilistaan.

### Etusivu = Tänään

Ei mitään muuta. Jos avaat Hytin väsyneenä, näet yhden asian jonka voi tehdä.

1. **Opiskelukalenteri** (Tänään-osion alla, ks. §3)
2. **Yksi ehdotus:** mikä, mikä PACER-vaihe, mitä konkreettisesti teet, ja **perustelurivi** ("tämä nyt, koska …")
3. **"Näytä vaihtoehtoja"** -nappi (muut vaihtoehdot vain jos haluaa valita itse)
4. **Boosti-ikkunat** 15 / 30 / 45 min
5. **Kuormatila** pienenä
6. **Kortit** alhaalla — epämuodolliset muistiinpanot

Ei kurssilistaa. Ei karttoja. Ei ylläpitolistaa etusivulla.

Perustelu: kurssilista etusivulla palauttaa juuri sen valinnan, jonka koko Hytti on rakennettu poistamaan, ja antaa mahdollisuuden liikkua sivusuunnassa tuntien silti tekevänsä jotain.

Perustelurivi on lisäksi ainoa kohta jossa käyttäjä oppii menetelmän — ei ohjeista vaan siitä että näkee perustelun sata kertaa.

### Ovi 1 — Kurssit

- Kaikki meneillään olevat kurssit ja niiden vaiheet
- Kurssia painamalla: sen solmut PACER-tiloineen
- Alla: ylläpidossa olevat asiat
- Pääsy kurssin omaan kanvaasiin (katselua varten)
- **Ei prosenttipalkkeja eikä pisteitä.** Tila on eri asia kuin edistyminen: "kertauksessa" kertoo mitä tehdä, "68 % valmis" ei kerro mitään ja tuottaa vain ahdistusta. Yksittäisen kurssin edistymistä ei tarvitse nähdä missään.

Nykyinen `opinto-kartta-view` (Kokonaiskartta) sulautuu tähän, ei jää erilliseksi näkymäksi.

### Ovi 2 — Taitokartta

Laajeneva kanvaasi + automaattisesti valuvat taidot. Tämä on sama asia kuin aiemmin toivottu "koko opiskeluajan / haluan muistaa vielä valmistuttuani" -taulu — ei kaksi ominaisuutta vaan yksi.

- Käyttäjä kirjoittaa tänne havaintoja ja oppimisia
- Taidot valuvat sinne automaattisesti sitä mukaa kun asioita merkitään tehdyksi
- Ei kurssikohtainen, elää kurssien yli, jää kun kurssit päättyvät
- Siltojen edistyminen näkyy täällä

Tämä ratkaisee samalla arkistointiongelman: kun kurssi arkistoituu, sen ylläpitovaiheen asiat eivät katoa vaan valuvat Taitokarttaan.

---

## 3. Opiskelukalenteri

**Sijainti: Hytissä, Tänään-osion alla.** Ehdoton. (Riisuttu opiskeluaika-versio voi myöhemmin mennä perhekalenteriin — ei päätetä nyt.)

Äly rakentaa opiskelukalenterin **live-luentojen ympärille**: milloin, kuinka kauan, mitä. Tämä on varsinainen suunnitelma.

**Toiminta:**
- Kun suunniteltu slotti (esim. 2 h) alkaa, se **ilmestyy ehdotukseksi**
- Ehdotusta painamalla näkee mitä nyt opiskellaan
- Samasta paikasta **aukeaa oikean kurssin kanvaasi**

**Syvä flow-jakso ei ole oma tilansa** — se on vain pitkä kalenterilohko. Kun opiskelukalenteri varaa kahden tunnin lohkon, se on flow-jakso. Käyttäjän ei tarvitse valita "pitkää tilaa" mistään.

**15/30/45 min on boosti, ei suunnitelman perusta.** Se on täydennys: satunnainen vapaa hetki, jonka Hytti täyttää järkevimmällä pienellä palalla. Tämä kääntää aiemman mallin, jossa aikaikkuna oli perusyksikkö.

**Toteutus:** ei uutta logiikkaa. Sama moottori (`laskeOpintoPaivanAskeleet`) ajettuna eteenpäin viikoksi kerrallaan kalenterin vapaisiin kohtiin luentojen ympärille.

---

## 4. Kaksi kanvaasia

Sekaannus on ollut siinä, että kanvaaseja luultiin yhdeksi. Niitä on kaksi, eri tarkoituksiin.

### Työkanvaasi (kurssikohtainen taulu)

- **Yksi taulu per kurssi**
- Väliotsikot liittyvät samaan tauluun kurssin edetessä → käsitesuhteet syntyvät
- **Ei etsitä mistään:** avautuu suoraan Tänään-ehdotuksesta / opiskelukalenterin slotista / boosti-valinnasta
- Kanvaasi tulee käyttäjälle, käyttäjä ei navigoi kanvaasille
- Kurssit-näkymästä pääsee samaan kanvaasiin jos haluaa vain katsella

Perustelu: sekunti jossa pitäisi keksiä "minne minä nyt menen piirtämään" on juuri se sekunti jossa aloitus kariutuu.

### Taitokanvaasi (Taitokartta)

Ks. §2, Ovi 2.

### KORJATTAVA VIKA: kanvaasi ei laajene

Nykyinen käsitekartta-editori on **kiinteä ruutu joka ei laajene mihinkään.** Koko taulu-ajatus kaatuu ilman korjausta.

Vaatimus (koskee molempia kanvaaseja):
- Rajaton tai hyvin suuri piirtoalue
- Panorointi ja zoom
- Tekstilaatikoiden koordinaatit suhteessa **tauluun**, ei ruutuun
- Puhelimella panorointi ja piirto erotettava toisistaan — tämä on se kohta joka menee helposti pieleen ja **pitää testata oikealla laitteella, ei staattisesti**

**Huom:** nykyinen editori on rasteripiirros (PNG + kelluvat tekstilaatikot), sidottu yhteen `taitosolmut`-riviin, ilman kurssiviittausta. Kanvaskoodi siirtyy sellaisenaan, mutta **ei taitosolmujen päälle** — `taitosolmut`-taululla ei ole eikä pidä olla `kurssi_id`:tä. Kurssikohtainen taulu tarvitsee oman pienen taulunsa (`kurssi_id` + sama `kasitekartta`/`kasitekartta_tekstit` -muoto).

---

## 5. Opiskelusolmut

**Kurssin väliotsikko = yksi opiskelusolmu.** Otsikot ovat annettuja, ei keksittyjä — ne ovat jo materiaalissa. Poiminta on mekaanista, ei tulkintaa.

Perustelu rakeisuudelle: koko kurssi on liian iso (vaihe ei tarkoita mitään), yksittäinen käsite liian pieni (satoja kappaleita). Väliotsikko on luonnollinen istunnon kokoinen pala.

**Tämä on jo olemassa:** `opinto_aiheet` on kurssikohtainen ja siinä on `vaihe`. Tarvitaan **kaksi uutta saraketta:**
- `viimeksi_kosketettu` (timestamp)
- `materiaali` (per-otsikko materiaalilinkki — nyt materiaali on vain kurssitasolla yhtenä isona tekstikenttänä)

Ei uutta taulua.

**Tärkeä rajaus:** äly EI generoi valmiita muistiinpanoja eikä käsitekarttoja. Käyttäjä tekee ne itse. Rakenne on tyhjä kehikko kunnes käyttäjä täyttää sen — se vaiva *on* oppimisen mekanismi, ei sivutuote.

---

## 6. Sillat (taitosolmut)

**Malli säilyy ennallaan, se on oikein.** Ei litigoida uudelleen.

- Taitosolmu = **vain silta**: käsite joka toistuu kahdessa tai useammassa **samanaikaisesti aktiivisessa** kurssissa
- Ei koskaan yhden kurssin sisäistä rakennetta
- "Silta" on rooli, ei oma tietue
- `taito_kaari` = suunnattu yhteys kahden solmun välillä (esitietojärjestys)
- **Siltasolmu pitää olla opiskeltu ENNEN kuin asia tulee vastaan kurssimateriaalissa**
- Solmukohtien etsintä on käyttäjän opiskelun ydin — älyn pitää käyttää tähän enemmän kuin minimipanostuksen, eikä sekoittaa aiheeseen liittymättömiä kursseja mukaan

**Sillat eivät ole oma näkymä.** Poistetaan Taitosolmut-lista Hytin etusivulta. Sillat näkyvät:
- perustelurivinä Tänään-kortissa
- merkintöinä kurssitaululla
- edistymisenä Taitokartassa

Perustelu: selattava graafi houkuttelee puutarhanhoitoon — solmujen järjestelystä tulee tuottavalta tuntuvaa lykkäämistä. Sillan yksityiskohtasivu jää, mutta sinne mennään ehdotuksesta, ei listasta. Tämä tekee myös rakentamattomasta Taitokartta-graafivisualisoinnista tarpeettoman.

**Niitä 62 koodaussolmua ei herätetä henkiin.** Ne ovat jo oikeassa paikassa `opinto_aiheet`-radalla (sql/100).

---

## 7. Priorisointilogiikka

Konkreettiset aikarajat:

| Tilanne | Sääntö |
|---|---|
| Koe | Alkaa painaa merkittävästi vähintään **3 viikkoa** ennen |
| Viikkotehtävä | **3–5 päivää** ennen deadlinea: tarkista liittyykö tehtävään solmukohta jota kannattaisi edistää ensin |
| Tehtävän aloitus | Ainakin ensimmäinen osa **vähintään 3 päivää** ennen deadlinea |

Yleisperiaate: mieluummin hieman etukenoisesti, ei liikaa.

**Siltasolmun painon aikakäyrä:** paino nousee lähestyttäessä tarvehetkeä, mutta **laskee taas juuri ennen sitä** (1–2 pv sisällä). Silta on parhaimmillaan hieman etukäteen opiskeltuna, ei viime tingassa.

**Sillan kertautuva vaikutus:** jos siltaan nojaa useampi tuleva kurssideadline, sen kokonaispaino voi ylittää yksittäisen tavallisen tehtävän deadlinen vaikka tehtävä olisi lähempänä. Paino kasvaa sen mukaan moneenko myöhempään asiaan solmu vaikuttaa — ei pelkkä silta/ei-silta-lippu.

**Oppiva signaali:** äly saa oppia käyttäjän todellisesta palautustahdista (kuinka monta päivää etukäteen tehtävät yleensä palautetaan) ja kalibroida ajoitusta sen mukaan.

---

## 8. PACER-ohjaus

Käyttäjä ei ole koskaan opiskellut PACER-metodilla. Priming on luonteva (tykkää kysyä kysymyksiä), mutta encoding on tuntematon eikä vaiheiden nimiä muisteta.

- Nykyiset lyhyet vaihekuvaukset säilyvät
- **Lisäksi tehtäväkohtainen "lue lisää" -taso** (napin takana): mitä juuri tälle tehtävälle konkreettisesti tehdään tässä vaiheessa
- Käyttäjä voi ladata lisämateriaalia josta systeemi oppii tarkemmin mitä missäkin vaiheessa pitäisi tehdä
- **Systeemi ei koskaan päätä vaihetta puolesta, mutta ehdottaa AINA** — tämä on ydintoiminto, ei valinnainen ominaisuus
- Kun data näyttää oikean hetken, näytetään kehote ("siirrytäänkö seuraavaan vaiheeseen?")
- **Tämä kehote-mekanismi** (ei koko PACER-ohjaus) pitää voida kytkeä pois asetuksista myöhemmin

---

## 9. Materiaalin syöttöputki

Käyttäjän ei koskaan tarvitse käsin kirjoittaa tai poimia osioita, aiheita tai päivämääriä.

**Sisäänotto:** materiaali raahataan Laituriin → siirtyy automaattisesti Hyttiin, ei jää näkyviin Laituriin (sama "ei näy Laiturissa" -mekanismi kuin muillakin kohdetyypeillä).

**Tuettavat tyypit:** ppt, pdf, kuvat, doc/docx, linkit videoihin.

**Videot — kaksitasoinen käsittely:**
- Kielimalli ei voi suoraan "katsoa" videota linkistä; tarvitaan aina välivaihe tekstiksi
- **Ensisijainen:** jos videolla on valmis kopioitava transkripti (pätee suurimpaan osaan), käyttäjä kopioi sen suoraan Laituriin tekstinä — ei kuluta älyresursseja
- **Varatapa:** jos transkriptiä ei ole, käytetään älyä purkuun
- Puhtaasti visuaalinen sisältö (esim. taululle kirjoitettu kaava jota ei sanota ääneen) ei tällä tavalla tavoitu — **hyväksyttävä rajoite**

**Poiminta ja hyväksyntä:**
- Äly lukee materiaalin niin huolellisesti kuin tehtävä vaatii — ei pintapuolinen vilkaisu
- Täydentävät lähteet: **luentokalenteri** + **itslearningistä haettavat kaikkien kurssien deadlinet**
- Seuraavan Hytti-avauksen yhteydessä **ponnahdusikkuna** näyttää poimintaehdotuksen
- Käyttäjä voi muokata ja kommunikoida vapaamuotoisesti ("varaa enemmän aikaa aiheeseen X"). **Sama muokkaustapa toimii myös myöhemmin kurssin aikana**, ei vain alkuperäisessä hyväksynnässä
- Jos taitosolmuja ei ole käsitelty X päivän kuluessa kurssin lisäämisestä, systeemi muistuttaa

---

## 10. Toisto ja ylläpito

**Tämä on jo rakennettu** — `sr_interval_index`, `sr_next_review`, välit [1,3,7,21], sitten ylläpito.

**Määritelmät:**
- "Valmis" = **mikään ei koskaan poistu kierrosta**, siirtyy ylläpitoon
- Kurssin päättyessä kurssi arkistoituu, mutta **ylläpito voi valinnaisesti jatkua**

**Korjattavat:**
- Ylläpito toistuu nyt **tasaisella 60 pv syklillä — pitää pidentyä**
- **Arkistoitu kurssi poistaa nyt myös ylläpitovaiheen aiheet moottorista kokonaan.** Tämä on suoraan vastoin haluttua. Ylläpitoaiheiden pitää jäädä kiertoon (tai olla ohitettavissa)

---

## 11. Nimeäminen

**Ei englantia.** Satama, Laituri, Hytti, Kuormavahti, henkselit, ankkurit — metafora on koko sovelluksen selkäranka. Puolienglanti on huonompi kuin kumpikaan puhtaana.

Kolmen kartan ongelma ratkeaa ilman englantia:

| Nyt | Jatkossa |
|---|---|
| Kokonaiskartta | **Missä menen** — kaikkien kurssien vaiheet |
| Taitokartta | **Taitokartta** — mitä on kertynyt (nimi säilyy, merkitys tarkentuu) |
| käsitekartta | **Taulu** — kurssin laajeneva kanvaasi |
| opinto_aihe | **opiskelusolmu** (käyttöliittymässä) |
| taitosolmu | **silta** — lopeta sen kutsuminen solmuksi |

**Koodin ja kannan nimiä ei kosketa** — uudelleennimeäminen on migraatioriski ilman vastinetta.

---

## 12. Korjattavat viat (auditista)

1. **Moottorilla on ehdoton riippuvuus** `taitosolmut`/`taito_kaaret`/`taitosolmu_viittaukset` -tauluihin. Jos ne puuttuvat, `laskeOpintoPaivanAskeleet` palauttaa tyhjän eikä **yhtään** ehdotusta näy — ei edes pelkille `opinto_aiheet`-käyttäjille. Ei suojakoodia. **Tämä on se vika joka tekee koko Hytistä hiljaisen tavalla jota ei osaa diagnosoida.**
2. Kanvaasi ei laajene (§4)
3. Ylläpidon väli ei pitene (§10)
4. Arkistoitu kurssi hiljentää ylläpitoaiheet (§10)
5. `taitosolmu_viittaukset` ei näy missään käyttöliittymässä — sillan sivulla ei näe mitä aiheita se yhdistää
6. Raskaana päivänä moottori rajaa ehdotukset yhteen. **Ehdotus:** se yksi paikka suosisi kertausta uuden aloittamisen sijaan
7. `COPILOT.md` on vanhentunut — ei mainitse taitosolmuja, siltoja, sessioita, käsitekarttaa, Huolilippua eikä Henkseleitä

---

## 13. Mitä EI rakenneta

- Taitokartta-graafivisualisointi siltaverkosta (korvautuu §2 Ovi 2:lla)
- Niiden 62 koodaussolmun herättäminen
- Uusi solmutaulu
- Kanvaasi etusivulle (se avautuu ehdotuksesta)

---

## 14. Avoimet kysymykset

1. **Miksi matikkasuunnitelma pilkottiin?** Käyttäjän yksi elokuu 2026 – kesä 2027 -suunnitelma tuli pilkotuksi kolmeksi kurssiksi (Algebra 2 / Algebra 1 Functions / Trigonometry), ja aiheet muuttuivat matkalla. Tätä ei pyydetty. **Selvitettävä ennen kuin muuta rakennetaan.**
   - Seuraus jos yhdistetään yhdeksi: 3 itse lisättyä siltaa lakkaavat määritelmällisesti olemasta siltoja (sääntö vaatii kaksi eri aktiivista kurssia). Ne muuttuisivat kurssin sisäisiksi yhteyksiksi. Ei menetys, mutta tietoinen päätös.
2. **Salliiko Satama pitkien tekstien liittämisen Laituriin** (esim. kopioitu videotranskripti)?
3. Onko `opinto_aiheet` oikea koti opiskelusolmulle vai onko jotain päällekkäisyyttä jota ei ole vielä huomattu?

---

## 15. Periaatteet KONSEPTIKIRJA.md:hen

Käytännössä noudatettu mutta ei koskaan kirjattu numeroituna periaatteena:

1. **"Rakenna aina olemassa olevan päälle, älä rinnakkaista konetta — jos uusi ominaisuus voisi olla toisen jo olemassa olevan muunnos, se on."**
2. **"Kaikella on yksi koti."** (nyt kirjattu vain ankkureille)

**Pysyvä ohje:** kun rakennuspyynnöissä ilmenee yleisiä periaatteita, ne lisätään käyttäjän kuittauksen kautta KONSEPTIKIRJA.md:hen.

---

## 16. Riippuvuudet ja järjestys

1. Selvitä §14 kysymys 1 (kurssien pilkkominen)
2. Aja ajamattomat migraatiot (sql/102–108 Ristiriitapaketti v2, sql/109 henkselit)
3. Korjaa §12 kohta 1 (moottorin suojakoodi) — pieni ja kriittinen
4. Kaksi saraketta `opinto_aiheet`-tauluun (§5)
5. Kanvaasin laajennus (§4)
6. IA-uudelleenjärjestely (§2)
7. Opiskelukalenteri (§3)
8. PACER-ohjaustaso (§8)
9. Syöttöputki (§9)

Henkselit-ominaisuus on erillinen speksi, jo toimitettu Codelle — ei osa tätä dokumenttia mutta kytkeytyy: henkselit-aikana Hytin ankkurit ja seuraava askel eivät näy oletuksena.
