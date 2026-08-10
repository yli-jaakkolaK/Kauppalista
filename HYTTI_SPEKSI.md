# Hytti — speksi

**Versio:** 2026-08-09 (c)
**Status:** ainoa voimassa oleva Hytti-speksi

---

## 0. Miten tätä dokumenttia luetaan

- **Tavallinen teksti** = päätetty. Tähän saa nojata rakennettaessa.
- **AUKKO-lohkot** = ratkaisematta. Jokaisessa on Clauden ehdotus merkittynä `Ehdotus — EI HYVÄKSYTTY`. **Näitä ei toteuteta ilman Katrin kuittausta.**

Aukkojen yhteenveto: **§11**. Rakennusjärjestys: **§13**.

**Muotokieli** on tiedostossa `satama-design-kuvaus.md`. Tässä vain Hyttiä koskevat päätökset (§9).

**Menetelmän tietopohja** on tiedostossa `sung-metodi.md`. Se on väliaikainen tietopohja kunnes Laiturin materiaalin sisääntulo on rakennettu.

**Toteutettu mockup:** `satama-hytti-v3.html` — ajantasainen paitsi §4.3 (ajastin), §4.8 (boost) ja §6 (kartan väriskaala), jotka on korjattu tässä versiossa mockupia myöhemmin.

**Lähteenä EI käytetä:** `satama-ruori.html`.

**Korvaa:** `HYTTI_SPEKSI_2026-08-05.md`, `HYTTI_SPEKSI_taydennykset.md`. Molemmat voi poistaa.

---

## 1. Termistö

Käyttöliittymässä ja kaikessa puheessa käytetään oikeanpuoleista saraketta. **Kannan ja koodin nimiä ei muuteta.**

| Kannassa / koodissa | Termi | Mikä se on |
|---|---|---|
| `opinto_aiheet` | **solmu** | Kurssin yksi teema. 8 teemaa = 8 solmua. |
| `taitosolmut` | **silta** | Lähes sama teema kahdessa eri kurssissa, ja niiden suhde. |
| `taito_kaaret` | **solmun kaari** | Mitkä solmut liittyvät toisiinsa ja miten; mitä pitää osata ennen kuin seuraavan voi ymmärtää. |
| `taitosolmu_viittaukset` | **sillan viittaus** | Mihin solmuihin silta liittyy. |

**Kanvaasi ei ole `kasitekartta`.** Tämä oli virhe aiemmassa versiossa. Ne ovat kaksi eri asiaa:

| Mikä | Missä | Tila |
|---|---|---|
| `taitosolmut.kasitekartta` + `kasitekartta_tekstit` | sarake `taitosolmut`-taulussa | **Olemassa oleva** oma canvas-editori: base64 PNG + kelluvat tekstilaatikot, yksi per silta. Toimii. |
| **kanvaasi** | Miro | **Ei vielä olemassa.** Yksi taulu, oma framework per kurssi. Rakennetaan vaiheessa 5. |

Termi **kanvaasi** tarkoittaa aina Miro-taulua. Vanhaan canvas-editoriin ei viitata sanalla kanvaasi.

**Poistuneet nimet:** taitosolmu (→ silta), opinto_aihe (→ solmu), taulu (→ kanvaasi), Kokonaiskartta (→ Missä menen). Näitä ei käytetä missään käyttöliittymätekstissä eikä keskustelussa.

---

## 2. Tavoite

Käyttäjän ei tarvitse miettiä mitä opiskella, missä vaiheessa tai miten. Suunnitelma on realistinen kuormitus huomioiden.

Suurin yksittäinen kitka: **ei tiedä mitä konkreettisesti tehdä missäkin vaiheessa.** "Aloita encoding quadraticsista" ei kerro mitään tekemistä. Tämän poistaminen on projektin ydin.

Kaksi tilaa jotka erotetaan fyysisesti:

- **Tekeminen** — päivittäistä, tapahtuu väsyneenä, ei saa sisältää yhtään valintaa
- **Katsominen** — viikoittaista, tapahtuu virkeänä, on silmäilyä

**Projektin tunnettu epäonnistumistapa:** ensin rakennetaan, sitten mietitään. 95 siltaa rakennettiin 2026-08-04 ja kumottiin seuraavana päivänä. Siksi rakentaminen alkaa auditoinnista.

---

## 3. Informaatioarkkitehtuuri

```
Hytti
├── Nyt      · tekeminen — yksi asia jonka voi tehdä
├── Reitti   · katsominen — viikko, kurssit, ylläpito
└── Kartta   · katsominen — kaksi näkymää kertyneestä
```

Välilehdet renderöidään listasta, ei kovakoodattuina nappeina.

**Kuormamittaria ei ole missään näkymässä.** Kuorma näkyy vain viikkokalenterin sarakkeen sävynä.

---

## 4. Nyt-välilehti

### 4.1 Rakenne

1. **Deadline-rivi** (vain 1–2 pv ennen palautusta, §7.3)
2. **Nyt-kortti** — päivän seuraava asia
3. **Perustelurivi** — miksi juuri tämä nyt
4. **Loput päivästä**
5. **Boost**

**Päivän tason perustelua ei ole.** Ainoa perustelu on §4.4:n lyhyt rivi Nyt-kortin alla, ja se koskee vain sitä yhtä asiaa joka on juuri nyt tehtävänä. Koko päivän asettelua ei selitetä.

Ei kurssilistaa, ei karttoja, ei ylläpitolistaa.

### 4.2 Nyt = päivän seuraava asia

Nyt-kortti näyttää aina sen mikä tapahtuu seuraavaksi, riippumatta tyypistä. Luentopäivänä liveluento, lounasaikaan lounas, muuten solmu.

Ainoa poikkeus: **suljettu ikkuna ei voi olla Nyt-kortti.** Suojattu ruokailu voi.

**Menneet katoavat.** Kun loppuaika on ohitettu tai asia on merkitty tehdyksi, se poistuu näkymästä kokonaan.

### 4.3 Ajanotto

**Ei näkyvää edistymisviivaa. Ei laskuria jota pitää katsoa.**

Ajanotto alkaa kun käyttäjä avaa tehtäväkortin ja **päättyy itsestään kun hän poistuu siitä**. Käyttäjän ei tarvitse muistaa painaa mitään lopettaessaan — se on juuri se asia jonka väsynyt ihminen unohtaa ja joka pilaa datan.

Todellinen tekemisaika voidaan tarvittaessa tarkistaa myös **kanvaasin muokkauslokista** (Miro), joka kertoo milloin solmua on oikeasti työstetty.

### 4.4 Perustelurivi

**Ainoa kohta jossa käyttäjä oppii menetelmän** — ei ohjeista vaan siitä että näkee perustelun sata kertaa.

**Tiivis, yksi lause, ei selittelyä:**

| Ehto | Rivi |
|---|---|
| Silta, jota toinen kurssi tarvitsee | "Silta — Tietoverkot tarvitsee tätä ensi viikolla." |
| Kertausväli umpeutumassa | "Unohtuu kolmessa päivässä." |
| Palautus 3–5 pv päässä | "Palautus perjantaina, tämä on esitieto." |
| Päivän kuorma kevyt | "Tänään on tilaa." |
| Suojattu ikkuna | "Ruoka varattiin ennen opiskelua." |
| Luento tai meno | "Luento ei siirry." |

Jos mikään ehto ei täyty, rivi jätetään pois.

### 4.5 Suojatut ikkunat

Suojatut ikkunat ovat **generaattorin rajoite, eivät käyttöliittymän elementti.** Ne vaikuttavat siihen mitä päivään sijoitetaan, mutta niitä ei selitetä käyttäjälle näkymässä.

**Ruokailu.** Yksi suojattu ateria per päivä, oletuksena **11:00–13:00** väliin. Jos luennot menevät niin ettei se sovi, ateria sijoitetaan sinne mihin se saadaan — myös 14:00 tai 14:30. **Ateriaa ei jätetä pois.**

Näkymässä lukee **vain "Lounas"** — ei leimaa "Suojattu", ei selitystä siitä miksi se on siinä. Se on tavallinen rivi päivässä. Lounas **voi olla Nyt-kortti**, mutta siitä ei käynnisty ajanottoa.

Aterian **kesto on säädettävissä asetuksista**. Oletus 30 min.

**Suljetut ikkunat.** Asetetaan asetuksista: viikonpäivä + kellonaikaväli. Esim. lapset kotona 15:30–17:00.

**Suljettua ikkunaa ei renderöidä lainkaan.** Sen kohdalla ei vain lue mitään — ei laatikkoa, ei leimaa, ei selitystä. Käyttäjä tietää itse miksi siinä ei ole mitään.

### 4.5b Päivän opiskeluaika

Kunkin päivän opiskeluaika on **säädettävissä asetuksista**. Jos mitään ei ole säädetty, oletus on **09:00–15:30**.

Generaattori ei sijoita opiskelupätkiä tämän ikkunan ulkopuolelle. Illan satunnaiset hetket hoidetaan boostilla (§4.8), ei suunnittelemalla.

### 4.6 Generaattorin sijoittelujärjestys

1. **Liveluennot ja kiinteät menot** — eivät väisty. Lähtöaika varataan menon eteen (§8.1).
2. **Suojatut ikkunat** — ruokailu ja suljetut ikkunat.
3. **Opiskelupätkät** — siihen mitä jää jäljelle.

**Järjestys on toteutuksen ydin.** Jos opiskelupätkät sijoitetaan ensin ja ruokailu sovitetaan rakoihin, ruokailu häviää aina.

Jos päivä ei vedä, generaattori **pudottaa opiskelupätkän, ei suojattua ikkunaa.**

### 4.7 Opiskelupätkien järjestys — interleaving

Peräkkäiset pätkät ovat **eri kursseilta tai eri aiheista**.

- Taylor & Rohrer (2010): sekoitettu harjoittelu tuotti seuraavan päivän kokeessa 77 % vs. lohkoharjoittelun 38 %. Välistys pidettiin vakiona — hyöty tuli aiheen vaihtelusta, ei tauoista.
- Välistys (spacing) on erillinen mekanismi ja koskee päivien välisiä taukoja.

**30 minuuttia ei ole tutkimuksesta johdettu luku.** Sääntö on "vaihda aihetta noin puolen tunnin välein".

**Käyttöliittymäseuraus:** interleaving tuntuu tehdessä huonommalta. Se on tarkoituksellinen vaikeus, ja se kannattaa sanoa ääneen ettei käyttäjä tulkitse takkuamista epäonnistumiseksi.

### 4.8 Boost

Napit **15 / 30 / 60 / ··**.

`··` avaa rullavalitsimen, arvot: **10, 20, 25, 35, 40, 45, 50, 55, 70, 80, 90, 100, 110, 120**.

Rulla noudattaa `satama-komponentit.html`:n muotokieltä: lämpimään taittava lasipinta, messinkikehys — mutta **toteutukseltaan iOS-natiivi valitsin**, ei omatekoinen. **Jokaisesta arvosta kevyt haptinen palaute.**

Boost on täydennys, ei suunnitelman perusta. Illan satunnaiset hetket hoidetaan tästä eikä niitä suunnitella kalenteriin.

**"Ehtii"-merkintää ei rakenneta.**

---

## 5. Reitti-välilehti

**Reitti täydennetään ja rakennetaan pääosin myöhemmin.** Poikkeus: **materiaalin sisääntulo rakennetaan ensimmäisessä vaiheessa**, koska ilman sitä yksikään testikurssi ei voi toimia.

> **Tämä ei tarkoita että Reitti-välilehti rakennetaan vaiheessa 1.** Kurssien lisäys ja kurssin sisänäkymä ovat **jo olemassa** `hytti-view`-sivulla ("📚 Opinnot" -lista ja "uuden kurssin nimi..." -rivi) sekä `opinto-kurssi-view`:ssä. Vaiheessa 1 niitä **laajennetaan siellä missä ne jo ovat** — "+ Lisää materiaalia" -nappi menee olemassa olevaan kurssinäkymään. Kun välilehtirakenne rakennetaan vaiheessa 4, kurssilista **siirtyy** Reitin alle. Se on siirto, ei uudelleenrakennus.

Rakenne: **Viikko** → **Kurssit** → **Ylläpito**.

### 5.1 Viikkokalenteri

Päivät ovat **pystysarakkeita**, kussakin näkyy päivän mahdollinen kuorma.

- Luennot haetaan **lukkarikoneesta**
- Kalenterin alle **3 seuraavaa palautusta** deadlinen mukaan (itslearningistä)

**Kuorman tasot ovat kolme.** `opintoPaivanKuorma()` palauttaa jo täsmälleen nämä — kyse on vain esitysnimistä ja väreistä, ei uudesta logiikasta.

| `opintoPaivanKuorma()` | Esitysnimi | Väri |
|---|---|---|
| `kevyt` | normaali | ei muutosta |
| `keski` | matalikko | `--matalikko` |
| `raskas` | karikko | `--karikko` |

**Vaara pysyy paletissa mutta ei ole kuorman taso.** Se on huolilipun ja ristiriidan väri.

**Kuorma ei tule itslearningin tehtävistä.** Kuorma on yleiskuorma: perhekalenteri + opiskelukalenteri. Tehtävien painoarvo on eri logiikka (§7.3).

### 5.2 Kurssit

Kurssi avautuu haitarina. Otsikkorivillä nimi, vaihe ja **jäljellä-palkki**.

Jäljellä perustuu **menneisiin luentoihin ja palautettuihin tehtäviin**. Ei prosenttia näkyvissä, **vain palkki, eikä siihen tarvita selitettä**.

Kurssin sisällä:

- **kaikki kurssilla näkyvissä olevat deadlinet** (itslearningistä)
- ladatut materiaalit **solmuihin jaoteltuina**
- **solmulista, jossa jokaisella solmulla on täppä "jää ylläpitoon"** (§7.5)
- **"+ Lisää kurssimateriaalia"** → vie uudistettuun Laituri-näkymään (§8.3)

**Kurssi lisätään Reitti-välilehdeltä.**

**Kurssidata menee tästä generaattorille.** Reitin kurssit ja generaattorin syöte ovat sama data.

### 5.3 Ylläpito

Kurssien alla näkyvät solmut jotka ovat **ylläpidossa tai kertauksessa**, ja nappi jolla voi kertoa *"en muista tätä enää kovin hyvin"*.

Nappi **aikaistaa seuraavan kertauksen** — enintään **5 päivän päähän painamisesta**. Se **ei pyyhi mitään historiaa** eikä nollaa väliä. Mahdollinen lisäkertaus harkitaan myöhemmin; **sitä ei rakenneta nyt.**

---

## 6. Kartta-välilehti

Kaksi näkymää, vaihdettavissa näkymänvaihtimella. Molemmissa **sama visuaalinen logiikka**:

Taustalla **liukuvärjäys**, jonka päällä **verkko** joka kommunikoi samaa asiaa. Kaksi merkkiä samasta, jotta sen näkee nopealla vilkaisulla.

**Väriskaala: tummanvihreä (`--syvanne`) → taustapaperin väri (`--paperi`).** Tummuus kertoo taitavuudesta ja oppimisen syvyydestä.

**Ei palkkeja. Ei prosentteja. Ei pistemääriä. Ei tehtävämääriä.**

Heikkojen kohtien pitää näkyä — ne näkyvät **taustapaperin värisinä**, eli tyhjänä vetenä, eivät erillisellä varoitusvärillä.

Referenssi: `satama-kartta-v6.html`.

Kartta **ei koskaan avaa Miroa** — se piirtää oman näkymänsä Sataman visuaalisella kielellä.

### 6.1 Näkymä 1 — Opiskelu

Solmutasoinen eteneminen. Paljon harjoiteltujen solmujen kohta on liukuvärimäisesti tummempi.

Data tulee **suoraan kurssimateriaaleista ja niissä etenemisestä**.

Näkyvissä ovat **kaikki suoritetut kurssit**, mutta **ei lineaarisesti** — myös tämä on käsitekartta.

### 6.2 Näkymä 2 — Työelämä

**Ei rakenneta ensimmäisellä kierroksella.**

Ajatus: Satama rakentaa Sungin tyylistä käsitekarttaa nimeltä **"Katri IT-alan ammattilaisena"**.

- **Ei yhtäkään kurssin nimeä.** Sanasto on työelämän: service design, concept design, stakeholder facilitation, project management — ei "Introduction to Project Management"
- Pohjana kurssien **sisällöt**, vahvuus- ja heikkousalueet, työelämän nimeämiskäytännöt, ja Sataman keräämä data siitä miten käyttäjä toimii
- Sama liukuvärjäys: vahvat taidot tummempana
- Näkyvissä myös **mistä osataidoista isommat käsitteet koostuvat**

### 6.3 Helmi

**Ei rakenneta ensimmäisellä kierroksella.** Helmi mietitään tarkemmin yhdessä Työelämä-näkymän kanssa, koska se kiinnittyy siihen.

---

## 7. Opiskelumoottori

### 7.1 Solmut ja kurssin sisääntulo

**Kurssin yksi teema = yksi solmu.** Teemat ovat **yleensä valmiina kurssimateriaalissa** — poiminta on mekaanista, ei tulkintaa.

Sisään tulevat materiaalit ovat **useimmiten kurssikohtaisia**. Joissain tapauksissa materiaali koskee tiettyä teemaa ja julkaistaan esimerkiksi viikko kerrallaan.

**Äly poimii teemat kurssista ja asettelee materiaalit järkevästi. Ihminen kuittaa.**

Kurssi lisätään **Reitti-välilehdeltä**. Kurssin sisälle mennessä näkyy:

- itslearningistä haetut deadlinet
- ladatut materiaalit **solmuihin jaoteltuina**
- **"+ Lisää materiaalia"** -nappi

**Ei uutta taulua.** `opinto_aiheet` on kurssikohtainen.

`viimeksi_kosketettu` ja `materiaali` **ovat jo olemassa** (sql/110, ajettu 10.8. todennettu). Puuttuvat vain §7.4:n kentät.

Äly **ei** generoi valmiita muistiinpanoja eikä käsitekarttoja. Rakenne on tyhjä kehikko kunnes käyttäjä täyttää sen — se vaiva *on* oppimisen mekanismi.

Jos poimintaa tai solmuja ei ole käsitelty **3 päivän kuluessa** kurssin lisäämisestä, systeemi muistuttaa.

### 7.2 Sillat

Silta etsii **lähes samanlaisia teemoja eri kursseista**. Tavoite on oppia **miten ne liittyvät toisiinsa** — esimerkiksi miten koodaamisen ja matematiikan funktiot liittyvät toisiinsa, mitä eroja niillä on, mitkä asiat kuuluvat yhteen, ja voiko sen visualisoida. Työtapa muistuttaa encoding-vaihetta.

**Sillat ovat koko syksyn keskeisiä käsitteitä.** Ne pitää olla opiskeltu **ennen kuin ne alkavat varsinaisen kurssin materiaaleissa.**

**Vaiheet sillalle:** PER-vaiheet (priming, encoding, reference) normaalisti. **Retrieval riittää 2 kertausta. Overlearningia ei tarvita.**

**Silta tulee opiskeluun vain päiväsuunnitelman kautta.** Se on ainoa reitti: sillalla ei ole omaa sivua eikä selattavaa listaa, joten jos generaattori ei nosta sitä, sitä ei opiskella koskaan. Silta ilmestyy siis Nyt-osioon generaattorin nostamana, edistää niitä kursseja joita se koskee, ja syventää kanvaasia.

> **Tämä kumoaa `sung-metodi.md` §11:n lauseen** *"Sillat eivät nosta solmua päiväsuunnitelmaan."* Se lause on virheellinen: jos sillat eivät nouse päiväsuunnitelmaan, ne eivät tule käsittelyyn lainkaan. Korjaa lause sung-metodi.md:hen. Sillan vaikutus kertausjonoon (solmu jää jonoon jos silta osoittaa tulevaan kurssiin) säilyy sellaisenaan — se on eri asia.

**Silta on oma tietue** (`taitosolmut` jää). Perustelu: sillalla on omaa sisältöä jota millään yksittäisellä solmulla ei ole — se kuvaa kurssien *välisen* suhteen, sillä on omat vaiheensa ja oma poikkeava retrieval-määränsä. Pelkkä lippu solmun päällä ei riittäisi. `taitosolmu_viittaukset` kertoo mihin solmuihin silta liittyy.

**Niitä 62 koodaussolmua ei herätetä henkiin.**

### 7.3 Painoarvot

**Koe:** alkaa painaa vähintään **3 viikkoa** ennen, ja painoarvo **kasvaa mitä lähemmäs koe tulee**.

**Viikkotehtävät.** Tavoite on saada tehtävä palautetuksi **3–5 pv ennen deadlinea**.

| Aika deadlineen | Mitä tapahtuu |
|---|---|
| 10–6 pv | painoarvo kasvaa vähitellen — tai heti kun tehtävä on saatavilla |
| tässä kohtaa | voi nostaa kertaukseen ne solmut joita tuleva tehtävä tarvitsee |
| 5 pv | painoarvo pomppaa |
| 4 pv | vähän isompi |
| 3 pv | vielä vähän isompi |
| alle 3 pv, ei palautettu | painoarvo **ei enää kasva**, mutta **pysyy korkealla** |
| 1–2 pv | **rivi Nyt-laatikon yläpuolelle** huomiovärillä: tehtävä ja montako päivää |

**Priming ajoissa:** aiheesta josta ei tiedä mitään priming olisi hyvä olla aiemmin kuin edellisenä iltana.

**Sillan aikakäyrä:** paino nousee lähestyttäessä tarvehetkeä mutta laskee juuri ennen sitä (1–2 pv sisällä). Silta on parhaimmillaan hieman etukäteen opittuna.

**Kertautuva vaikutus:** paino kasvaa sen mukaan moneenko myöhempään asiaan silta vaikuttaa.

**Kuorma rajaa vaihetta:**

| Kuorma | Mitä ehdotetaan |
|---|---|
| normaali | encoding |
| matalikko | retrieval, ehkä priming |
| karikko | overlearning tai kevyt retrieval |

### 7.4 Menetelmäohjaus

Käyttäjä ei ole opiskellut Sungin menetelmällä aiemmin. Priming on luontevin (tykkää kysyä kysymyksiä), encoding on tuntematon.

**Menetelmässä on kaksi erillistä akselia, joita ei saa sekoittaa.**

> **Tiedossa oleva sekaannus:** nykyinen koodi kutsuu vaihetta PACERiksi (Ruorin Hytti-segmentti näyttää "PACER-askeleen" jossa on vaihe). Kenttä on siis PERO-akselilla mutta väärällä nimellä. Korjataan vaiheessa 1 migraationa, ks. `CODE_vaihe1.md` §3.2.

- **PERO** on vaiheistus: priming → encoding → reference → retrieval → overlearning. Kenttä `pero_vaihe`.
- **PACER** on tietotyyppiluokittelu: procedural, analogous, conceptual, evidence, reference. Kenttä `pacer_tyyppi`.

**V1 tukee tietotyypeistä vain proceduralin, analogousin ja conceptualin.**

- Lyhyet vaihekuvaukset säilyvät
- **Konkreettinen ohje syntyy ristitulosta vaihe × tietotyyppi.** Sama vaihe tuottaa eri ohjeen riippuen siitä minkälaista tietoa solmu sisältää: konseptuaalisessa encodingissa tehdään **GRRINDE-kartta**, proseduraalisessa käydään ensin läpi **valmiiksi ratkaistuja esimerkkejä**
- Vaiheen koko ohje näkyy kerralla, mutta **vain käsillä oleva vaihe on täpättävänä**
- Käyttäjä voi ladata lisämateriaalia josta systeemi oppii tarkemmin mitä missäkin vaiheessa tehdään. Tällä hetkellä tieto on `sung-metodi.md`-tiedostossa, joka toimii väliaikaisena tietopohjana kunnes Laiturin materiaalin sisääntulo on rakennettu
- **Ydintoiminto on ohje, ei ehdotus.** Ohje generoidaan kerran per solmu ja vaihe, tallennetaan riviksi, eikä sitä voi kytkeä pois
- **Systeemi ei koskaan päätä vaihetta käyttäjän puolesta**
- Suurin osa vaiheensiirtymistä **ei tarvitse älyä lainkaan**: priming→encoding on täppä, encoding→retrieval on GRRINDE-täpät, retrieval→kertaus on välilaskentaa. Äly tarvitaan vain nopeaan vilkaisuun joka auttaa liikkumaan encodingin ja retrievalin välillä, tarvittaessa edestakaisin
- **Kehote** ("siirrytäänkö seuraavaan vaiheeseen?") näkyy **kun solmu avataan, ei istunnon lopussa** — istunnon lopussa päätöspyyntö kuittautuu pois miettimättä
- **Vain tämä kehote-mekanismi** voidaan kytkeä pois asetuksista. Se ei ole mukavuusominaisuus vaan menetelmän vaatimus: ohjaus joka auttaa aloittelijaa haittaa edistynyttä
- **Solmu on valmis** kun priming (käyttäjän täppä), encoding, retrieval × kertaa (oletus 3) ja reference (käyttäjän täppä) on tehty. **Overlearning on vapaaehtoinen.** Valmistuminen ei ole lopullinen — retrieval-kierroksia saa palauttaa lisää
- **Tietotyypin luokittelu:** äly ehdottaa tyypin kerran kurssin sisääntulossa, mutta **käyttäjä ei kuittaa tyyppiä vaan ohjeen**. Taksonomiaa ei voi arvioida, ohjetta voi. Tyypin voi vaihtaa kesken kaiken eikä vaihe nollaudu

### 7.5 Ylläpito

Solmu **poistuu retrieval-vaiheesta** kun jompikumpi täyttyy:

- kurssi päättyy, **tai**
- **3 peräkkäistä kertausta** joissa käyttäjä on muistanut olennaisimmat asiat

**Kertausvälien ei tarvitse olla tasaisia.** Ei haittaa vaikka ne olisivat 3 pv, 10 pv ja 28 pv — pääasia että ne tulevat kerratuiksi.

**Ylläpidossa** väli pitenee: noin **21–28 pv** ensimmäisen ylläpitokertauksen kohdalla, ja siitä eteenpäin **päivien määrä kerrotaan 1,5:llä** joka kertauskerralla.

**Käyttäjä valitsee itse mitkä solmut jäävät ylläpitoon.** Valinta tehdään **kurssin sisällä, siellä missä solmut ovat** (§5.2): jokaisen solmun rivillä on täppä *"jää ylläpitoon"*.

Esimerkki miksi: joulukuussa päättyvän matematiikan kurssin jälkeinen joululoma on parasta aikaa tahkoa seuraavaksi tulevia precalculuksen asioita, jolloin ne solmut kannattaa jättää kertaukseen. Ajatus on että kevään matematiikan kurssilla kerrataan syksyn asioita — ei enää edellisen kevään.

---

## 8. Ulkoiset rajapinnat

### 8.1 Föli — lähtöajat

**Riittää että näyttää lähtöajan järkevimmältä pysäkiltä käyttäjän sijaintiin perustuen.** Ovelta ovelle -reititystä ei tarvita tässä vaiheessa.

**`data.foli.fi`** — julkinen, ei rekisteröitymistä.

- **GTFS** — pysäkit, linjat, suunnitellut aikataulut
- **SIRI** — reaaliaikainen ennuste
- **ALERTS** — häiriöt (näytä jos koskee käyttäjän lähtöä)

Lisenssi CC BY 4.0 — lähde on mainittava: *"Lähde: Turun seudun joukkoliikenteen liikennöinti- ja aikatauludata, Turun kaupungin joukkoliikennetoimisto, data.foli.fi, CC BY 4.0."*

Välimuistita, älä pollaa tiheästi.

### 8.2 itslearning ja lukkarikone

- **Deadlinet** haetaan itslearningistä
- **Luennot** haetaan lukkarikoneesta

Integraatiotapa: aloitetaan **ICS-viennistä**, koska se on lähes varmasti saatavilla ja riittää deadlineihin ja luentoihin. Jos tehtävien nimiä ja kuvauksia ei saa, käyttäjä liittää kurssisivun sisällön Laituriin ja äly poimii ne (§8.3).

Osa tästä on jo rakennettu — **auditoi ennen kuin rakennat uutta.**

### 8.3 Materiaalin sisääntulo Laiturin kautta

Kurssin sisällä oleva **"+ Lisää materiaalia"** vie **uudistettuun Laituri-näkymään**, johon materiaalit tiputetaan.

**Kurssi tulee kontekstina napista.** Tämä on koko pointti: kun materiaali lisätään kurssin sisältä, putki **tietää jo mihin se menee**. Silloin jäävät kokonaan pois:

- kurssin nimen kirjoittaminen tekstikenttään
- tunnistusheuristiikka joka arvaa onko Laiturin muru kurssimateriaalia

Jäljelle jää **vain solmujako**: äly ehdottaa miten materiaali jakautuu kurssin solmuihin, ihminen hyväksyy.

Olemassa oleva tekstipohjainen jäsennysputki (2026-08-05) **laajennetaan** ottamaan vastaan valinnainen kurssikonteksti. Rinnakkaista putkea ei rakenneta.

Materiaalit **eivät jää näkyville Laituriin**. Tämä tehdään tietokantalipulla `piilota_laiturista`, samalla mekanismilla kuin muilla kohdetyypeillä — ei selainkohtaisella localStorage-merkinnällä, koska se ei kulje laitteiden välillä.

Tuetut tyypit: ppt, pdf, kuvat, doc/docx, linkit videoihin.

**Videot kaksitasoisesti:** jos videolla on valmis kopioitava transkripti (useimmiten on), käyttäjä kopioi sen suoraan tekstinä — ei kuluta älyresursseja. Jos ei ole, käytetään älyä purkuun. Puhtaasti visuaalinen sisältö ei tavoitu — hyväksyttävä rajoite.

**Vapaamuotoinen muokkaus ("varaa enemmän aikaa teemaan X") rakennetaan myöhemmin. Ei ensimmäisessä vaiheessa.**

---

## 9. Hytin muotokielipäätökset

Perusta on `satama-design-kuvaus.md`.

**Syvänne `#3F5F53` on varattu sille mikä on hallussa.** Kartassa se on liukuvärjäyksen tumma pää. Nyt-välilehdellä se esiintyy vain kertauksen yhteydessä. Ei Priming-vaiheessa, ei kuormassa, ei lähdemerkeissä.

**Nyt-kortin muotokieli riippuu siitä mikä kortti on:**

| Kortin sisältö | Muotokieli |
|---|---|
| Generaattorin antama tehtävä | **kosketettava** — lasi, messinkikehys, `--r-kosketettava` 13 px |
| Luento tai meno | **luettava** — `--r-luettava` 3 px |

Perustelu: generaattorin tehtävää oikeasti painetaan, luentoa ei. Muotokielen pitää kertoa se johdonmukaisesti.

**Ei "Paina ja aloita" -tekstiä.**

**Haptiikka sinne mitä Satama haluaa käyttäjän tekevän** — ei joka paikkaan:

- boost-napit
- boostin rullan jokainen arvo
- generoidut tehtävät (Nyt-kortti kun se on generaattorin antama)
- se mikä tehtävästä aukeaa

**Ei navigaatiossa** — välilehdet ja Kartan näkymänvaihdin ovat katsomista.

**Liveluennon merkintä:** 6 px pyöreä piste `--vaara`, hidas hehku, teksti `LIVELUENTO`. Tämä on ainoa paikka Hytissä jossa `--vaara` esiintyy ilman ristiriitaa tai huolilippua — liveluento on ainoa asia jota ei voi siirtää.

---

## 10. Kanvaasi ja korjattavat viat

### 10.1 Kanvaasi — upotettu Miro

**Omaa kanvaasia ei rakenneta.** Perustelu: ei kannata rakentaa itse huonompaa kun valmiin voi upottaa.

- **Yksi taulu**, jonne rakennetaan **joka kurssille oma framework**
- Kurssin eri solmuista rakennetaan **yhtä isoa käsitekarttaa koko kurssista**
- **Kukin solmu avautuu siitä kohdasta jota on tarkoitus työstää**
- Jokainen retrieval-kierros saa **oman tyhjän Framen** (sung-metodi §6d)
- Muokkausloki toimii ajanoton varmistuksena (§4.3). API:lta tarvitaan vain Framen olemassaolo ja viimeisin muokkausaika

**Muokkaus tapahtuu Satamassa.** Upotus ei saa olla pelkkä katselukuva josta pomppaa ulos Miroon — käyttäjän pitää voida piirtää ja muokata poistumatta Satamasta.

**Tämä korvaa olemassa olevan canvas-editorin.** `taitosolmut.kasitekartta` / `kasitekartta_tekstit` (base64 PNG + kelluvat tekstilaatikot, yksi per silta) on rakennettu ja toimii, mutta se on **korvattava**, ei jatkokehitettävä:

- se jää käyttöön kunnes Miro-upotus on olemassa
- sen päälle **ei rakenneta mitään uutta** eikä siitä kopioida komponentteja
- kun Miro on käytössä, sarakkeet ja editori siivotaan

### 10.2 Korjattavat viat

1. ~~Moottorin ehdoton riippuvuus siltatauluihin~~ — **JO KORJATTU.** Todennettu koodista 10.8.: `opinto_aiheet`-haun virhe on yhä fataali, mutta `taitosolmut` / `taito_kaaret` / `taitosolmu_viittaukset` -virheet vain lokitetaan ja moottori jatkaa `|| []`-oletuksilla. Pelkkä `opinto_aiheet`-käyttäjä saa ehdotuksia normaalisti. *Tämä kohta oli speksissä virheellisesti — se kopioitui vanhasta 5.8. speksistä tarkistamatta koodia.*
2. Ylläpidon väli ei pitene (§7.5)
3. Arkistoitu kurssi poistaa kertausjonossa olevat solmut moottorista kokonaan — vastoin haluttua
4. Raskaana päivänä moottori rajaa ehdotukset yhteen; se yksi paikka suosisi kertausta uuden aloittamisen sijaan (§7.3 kuormataulukko)

`COPILOT.md` on agentin ohjeistus ja pääosin ajan tasalla — tarkistettu 9.8.

**Migraatiot on ajettu.**

---

## 11. Aukot

**Kaikki aukot on ratkaistu 9.8.** Tässä dokumentissa ei ole enää hyväksymättömiä ehdotuksia.

**Ensimmäiseltä rakennuskierrokselta jätetään pois:**

- Reitti-välilehti kokonaisuudessaan **paitsi** kurssien lisäys ja materiaalin sisääntulo
- Kartan Työelämä-näkymä
- Helmi
- itslearning-integraation laajennus (deadlinet riittää siltä osin kuin jo rakennettu)
- Sillan mahdollinen lisäkertaus
- Vapaamuotoinen muokkaus materiaalin poiminnassa

**Matikkasuunnitelman pilkkomiseen ei kosketa.**

---

## 12. Mitä EI rakenneta

- Kuormamittari
- Boostin "ehtii"-merkintä
- Näkyvä ajastimen edistymisviiva tai laskuri
- Manuaalinen ajanoton lopetus
- Tehtävämäärät tai prosentit Kartassa
- Palkit Kartassa
- Selittävä teksti Reitin jäljellä-palkin yhteyteen
- Oma kanvaasi / piirtoalusta (käytetään Miroa)
- Sillan oma sivu tai selattava siltalista
- Niiden 62 koodaussolmun herättäminen
- Uusi solmutaulu
- Vaara kuorman tasona
- Mitään AUKKO-lohkojen ehdotuksista ilman kuittausta

---

## 13. Rakennusjärjestys

**Vaihe 1 — perusta ja kurssin sisääntulo** ← *tämä rakennetaan ensin*

1. Auditoi mitä on oikeasti rakennettu, raportoi, odota kuittaus
2. Korjaa §10.2 vika 1 (moottorin suojakoodi)
3. Skeema: `viimeksi_kosketettu`, `materiaali`, `pero_vaihe`, `pacer_tyyppi`
4. Kurssin lisäys Reitti-välilehdeltä
5. Materiaalin sisääntulo Laiturin kautta + älyn solmuehdotus + ihmisen hyväksyntä
6. Asetukset: suljetut ikkunat, päivän opiskeluaika (oletus 09:00–15:30), aterian kesto

**Vaihe 2 — menetelmä**

7. PERO/PACER-ristitulo ja ohjeiden generointi (§7.4)
8. Vaiheensiirtymät ja kehote
9. Ylläpidon korjaukset (§7.5)

**Vaihe 3 — generaattori**

10. Sijoittelija: liveluennot → suojatut ikkunat → opiskelupätkät (§4.6)
11. Interleaving (§4.7), painoarvot (§7.3)
12. Perustelurivit (§4.4)

**Vaihe 4 — näkymät**

13. Nyt-välilehti (§4)
14. Kartta, Opiskelu-näkymä (§6.1)
15. Reitti loppuun (§5)

**Vaihe 5 — myöhemmin**

16. Sillat käytäntöön (§7.2)
17. Miro-upotus (§10.1)
18. Kartan Työelämä-näkymä ja helmi (§6.2, §6.3)

---

## 14. Periaatteet KONSEPTIKIRJA.md:hen

1. **"Rakenna aina olemassa olevan päälle, älä rinnakkaista konetta."**
2. **"Kaikella on yksi koti."**
3. **"Tila on eri asia kuin edistyminen."** Osaamista ei mitata prosenteilla. Jäljellä olevaa työtä saa mitata.
4. **"Suojattu varataan ensin."** Se mistä kiireessä nipistetään ensimmäisenä varataan ennen muuta.
5. **"Ei englantia."** Satama, Laituri, Hytti, Kuormavahti, henkselit, ankkurit.
6. **"Käyttäjän ei tarvitse muistaa lopettaa."** Mittaus päättyy itsestään. Mikä vaatii muistamista väsyneenä, se jää tekemättä ja pilaa datan.
