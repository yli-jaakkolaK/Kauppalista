# Sung-metodi — Sataman opiskelumoottorin tietopohja

**Tarkoitus:** tähän tiedostoon kerätään kaikki Justin Sungin metodiin liittyvä tieto,
jota Satama käyttää ohjeiden generointiin. Väliaikainen ratkaisu, kunnes Laiturin
materiaalin sisääntulo on rakennettu ja tieto tulee sisään sitä kautta.

**Lisäysohje:** uudet faktat lisätään oikean otsikon alle merkinnällä `[S]` tai `[A]`.
Ristiriitaista tietoa ei korvata äänettömästi — merkitse molemmat ja lisää huomautus.

**Merkintätapa:**
- `[S]` = Sungin omasta materiaalista
- `[A]` = arvaus tai yleisen oppimistutkimuksen konventio, ei Sungilta

Päivitetty: 9.8.2026 (Report on Learning, elokuu 2022, luettu kokonaan)

---

## 1. Kolme eri kehystä — älä sekoita

**PACER = tietotyyppiluokittelu.** Viisi rinnakkaista tyyppiä, joihin sisältö
luokitellaan. Ei vaiheistus. `[S]`

**PERO = vaiheistus.** Sungin oma nimi opiskeluprosessilleen: priming, encoding,
reference, retrieval, overlearning. `[S]`

**BHS (Bear Hunter System) = encoding-vaiheen varsinainen menettely.** Viisi askelta,
kuvattu Report on Learningissa. Tämä on se konkretia jota ohjeisiin tarvitaan. `[S]`

Satamassa: solmulla on **tyyppi** (pysyy samana) ja **vaihe** (etenee). Ohje syntyy
näiden ristitulosta, ja encoding-vaiheen ohje on BHS:n askeleet.

---

## 2. PACER — tietotyypit ja niiden tekniikat

| Tyyppi | Mitä se on | Tekniikka | Lähde |
|---|---|---|---|
| **P**rocedural | Miten jokin tehdään: askeleet, suoritus | Harjoittele heti, älä pelkästään lue | `[S]` |
| **A**nalogous | Liittyy johonkin jonka jo tiedät | Luo analogia ja kritisoi sitä | `[S]` |
| **C**onceptual | Mitä jokin on: teoriat, suhteet, periaatteet | Kartoita (GRINDE / BHS) | `[S]` |
| **E**vidence | Faktat, luvut, päivämäärät, esimerkit jotka tukevat käsitettä | Säilö lukiessa, kertaa myöhemmin soveltamalla | `[S]` |
| **R**eference | Suoraan muistettava data, ei vaadi syvää ymmärrystä | Toistokortit + välistetty kertaus | `[S]` |

**Sataman v1:ssä tuetaan vain P, A ja C.** Päätös 8.8.2026.

**Kaksi tyyppiä yhtä aikaa (päätös 9.8.2026).** Solmulla on **päätyyppi** ja
valinnainen **sivutyyppi**. Kenttä on olemassa alusta asti, vaikka v1 käyttää vain
päätyyppiä — näin myöhempi laajennus ei vaadi rakennemuutosta. Ohje muodostuu niin
että päätyyppi antaa koko ohjeen ja sivutyyppi lisää **korkeintaan yhden askeleen**.
Kahta täyttä ohjesarjaa ei koskaan yhdistetä: se kaksinkertaistaisi kuormituksen
juuri siinä vaiheessa jossa kuormituksen pitäisi olla optimialueella.

**Extraction course kerää tiedon myös Evidencestä ja Referencestä**, vaikka v1 ei
niitä toteuta — jotta ne voidaan ottaa käyttöön varsinaisissa kursseissa ilman uutta
materiaalikierrosta.

**Vahva tuki päätökselle `[S]`.** Sungin järjestelmä nimenomaan lykkää irralliset,
ulkoa opeteltavat elementit viimeiseksi. BHS:n askel 5 erottaa ne omaksi prosessikseen
vasta sen jälkeen kun rakenne on kunnossa. Hän kutsuu tätä "käänteiseksi ajatteluksi":
korkeamman asteen oppiminen tulee kronologisesti ennen alemman asteen ulkoa
opettelua, ja tämä järjestys tuottaa tehokkuutta ilman että alemman tason osaaminen
kärsii. Evidence ja Reference eivät siis ole v1:stä puuttuva palanen vaan
menetelmän mukaan viimeisenä tuleva palanen.

**Luokittelu:** äly ehdottaa tyypin kerran kurssin sisääntulossa. Käyttäjä kuittaa
**ohjeen**, ei tyyppiä. Tyypin voi vaihtaa kesken kaiken; vaihe ei nollaudu, mutta
vaihdos merkitään muistiin (toistuvat vaihdokset kertovat että luokittelukehote
kaipaa korjausta).

---

## 3. PERO — vaiheet

**Sungin oma järjestys `[S]`:** Priming → Encoding → Reference → Retrieval → Overlearning.

**Sataman toteutus (päätös 9.8.2026):** sama viisi vaihetta. Erillinen "ylläpito"
poistuu — se ei ollut oma vaihe vaan välistetty kertaus, joka kuuluu retrievalin
sisään (SIR = spaced interleaved retrieval). Kenttien nimet: `pero_vaihe` ja
`pacer_tyyppi`.

**Aiempi ristiriita ratkesi.** Lista "priming, reference, retrieval/interleaving,
overlearning, encoding" on **opetusjärjestys**. Sung opettaa ensin SIR:n (spaced
interleaved retrieval), koska laadukas encoding vaatii monimutkaisemman taitosarjan. `[S]`

**Vaiheiden sisältö:**

- **Priming** — Sung perustelee tämän ohimenevän tiedon ilmiöllä: luennolla tieto
  kulkee ohi eikä oppija voi säädellä sen tahtia. Kirjoitetussa muodossa tietoa voisi
  koodata rauhassa, mutta luennolla se ei ole oppijan hallinnassa. Semanttisella
  primingilla oppija kasvattaa etukäteisasiantuntemustaan ja ohittaa tämän
  rajoitteen. `[S]`
- **Encoding** — mikä tahansa prosessi joka siirtää tiedon pitkäkestoiseen muistiin,
  laadusta riippumatta. Jos tieto haihtuu nopeasti, se encodattiin heikommin. Mitä
  korkeamman asteinen ja relationaalisempi rakenne, sitä pitkäkestoisempi muisti.
  Vaikeus ei ole encodingissa vaan **laadukkaassa** encodingissa. Menettely = BHS. `[S]`
- **Reference** — omien muistiinpanojen ja hakumateriaalin luominen. Reportin
  muistiinpanotutkimus valaisee tätä: sanatarkat muistiinpanot korreloivat heikomman
  muistamisen kanssa, jäsennellyt ja käsitellyt muistiinpanot ovat parempia. Määrä ei
  ole hyve. `[S]`
- **Retrieval** — mieleenpalautus. Sungin muoto on SIR: välistetty ja lomitettu. `[S]`
  **Tämä vaihe toistuu.** Kertausvälit elävät retrievalin sisällä, eivät erillisenä
  vaiheena. Solmu voi olla valmis ja silti olla kertausjonossa.
- **Overlearning** — tarkoituksellista oppimista enemmän ja korkeammalle tasolle kuin
  on tarpeen. `[S]` **Vapaaehtoinen:** solmu valmistuu ilman tätä vaihetta. Overlearning
  on syvennys, ei vaatimus. Päätös 9.8.2026.

**AUKKO:** kulkevatko kaikki tietotyypit samojen vaiheiden läpi.
**AUKKO:** vaiheiden kestot.

---

## 4. BHS — encoding-vaiheen viisi askelta

Sungin oma järjestelmä, nimeltään Bear Hunter System. `[S]`

1. **Tunnista avainsanat ja termistö** aiheesta. Kerätään yhteen paikkaan, mikä
   vähentää työmuistin kuormaa (hajautetun huomion ilmiö).
2. **Rajattu kysely (restricted inquiry)**, jonka avulla muodostat pääryhmät.
   Kysymykset jakautuvat kahteen: (a) millainen suhde käsitteillä on toisiinsa,
   (b) mikä on tämän käsitteen toiminnallinen tai käsitteellinen tärkeys. "Rajattu"
   tarkoittaa että kysymyksiä on vain muutama ja ne toimivat kaikilla aihealueilla.
3. **Sama kysely uudelleen** suhteiden tunnistamiseen ryhmien ja käsitteiden välillä,
   ja suhteille annetaan **tiukka keskinäinen tärkeysjärjestys**.
4. **Ei-lineaarinen esitys** ideoista ja suhteista, kuvat täydentämässä sanoja siellä
   missä se sopii.
5. **Kysely vielä kerran**, ja irralliset elementit erotetaan omaan prosessiinsa
   (välistetty kertaus tai ulkoa opettelu).

**Huomionarvoista:** tieto opitaan siinä järjestyksessä joka tuntuu oppijasta
kiinnostavimmalta, ei materiaalin järjestyksessä. Sung perustelee: vaikka järjestys
poikkeaa materiaalista, se on oikea järjestys suhteessa siihen mikä juuri nyt
todennäköisimmin koodautuu. `[S]`

**BHS ja GRINDE ovat sama asia eri kulmasta.** BHS on prosessi, GRINDE on tarkistus
lopputulokselle: ryhmät (askel 2), suhteet (3), yhteydet ryhmien välillä (3),
sanattomuus (4), suunta ja korostus (3–4).

---

## 5. GRRINDE — encoding-vaiheen tarkistuslista

**Sataman oma laajennus (päätös 9.8.2026).** Lähteet olivat eri mieltä siitä onko R
"Relational" vai "Reflective". Ratkaisu: molemmat. Ne ovat eri tekemistä ja kumpikin
on tarpeellinen. Merkitse omaksi laajennukseksi, Sungin oma akronyymi on GRINDE.

- **G**rouping — ryhmittele. 10 erillisen asian sijaan 3 ryhmää joiden välillä näet yhtäläisyyksiä
- **R**elational — merkitse suhteet käsitteiden välille
- **R**eflective — kartta heijastaa sitä miten ajattelusi kulki, ei lineaarista tekstiä
- **I**nterconnected — yhdistä ryhmät toisiinsa syy-seuraussuhteilla. Eristetty tieto unohtuu helpoiten
- **N**on-verbal — kuvia ja symboleja. Käytännössä: mahdollisimman vähän sanoja
- **D**irectional — anna yhteyksille suunta, syy ja seuraus tai tärkeysjärjestys näkyviin
- **E**mphasized — korosta tärkein

**Kartta ei ole päämäärä.** Tarkoitus on pakottaa aivot oikeisiin
ajatteluprosesseihin. `[S]`

**Satamassa:** käyttäjä täppää kohdat itse. Ei automaattista tunnistusta Miron datasta.

---

## 6. Ohjematriisi (vaihe × tietotyyppi)

### Priming — sama kaikille tyypeille

0. Säädä tuntemustaso **ennen kuin selaat mitään** `[A]`
1. Selaa materiaalin rakenne läpi lukematta `[S]`
2. Kirjoita 3 kysymystä joihin haluat vastauksen `[A]` (määrä arvaus)

### Encoding

| Tyyppi | Ohje | Lähde |
|---|---|---|
| Conceptual | BHS:n viisi askelta: kerää termit → kysele suhteita ja tärkeyttä → muodosta ryhmät → priorisoi suhteet → piirrä ei-lineaarisesti symbolein. Tarkista GRINDEllä | `[S]` |
| Procedural | Käy ensin läpi **useita valmiiksi ratkaistuja esimerkkejä** ja selitä itsellesi miksi kukin askel tehdään. Kirjoita sitten oma toimiva esimerkki. Piirrä lopuksi haarat kartaksi | `[S]` |
| Analogous | Kirjoita analogia auki ja etsi kolme kohtaa joissa se pettää | `[S]` |

**Proseduraalisen perustelu `[S]`:** valmiiksi ratkaistut esimerkit olivat
katsauksessa selvästi tehokkaampia ja aikataloudellisempia kuin mallista oppiminen tai
analoginen ongelmanratkaisu. Ratkaiseva ehto on että oppija selittää ratkaisut
itselleen — ne jotka selittävät itselleen ratkaisevat uusia ongelmia paremmin, ja
oma-aloitteinen selittäminen on tehokkaampaa kuin kehotettu.

**Proseduraalisen oma vaiheistus `[S]`:** taitojen hankinnan vaiheet ovat
(a) periaatteen koodaus, (b) ongelmanratkaisun opettelu ja tietoaukkojen korjaus,
(c) automatisointi. Tämä on lupaava vastaus siihen kulkevatko tyypit eri polkuja —
proseduraalisella on oma sisäinen etenemisensä.

### Reference

Kokoa encoding-vaiheen tuotoksesta se muoto johon palaat myöhemmin. **Ei sanatarkkaa
kopiointia** — jäsennelty ja käsitelty muoto. `[S]` periaate, `[A]` toteutus.

**Toteutus (päätös 9.8.2026):** Reference ei ole erillinen muistiinpano vaan
**tarkennuksia olemassa olevaan käsitekarttaan**. Kartta on jo se rakenne johon
palataan; yksityiskohdat kiinnitetään siihen sen sijaan että ne asuisivat toisaalla.
Tämä on myös menetelmän mukaista: Sungilla yksityiskohdat kiinnittyvät siihen
käsitteeseen jota ne tukevat, eivät irralleen.

### Retrieval

| Tyyppi | Ohje | Lähde |
|---|---|---|
| Conceptual | Tyhjä sivu. Piirrä kartta muistista ilman materiaalia. Korjaa vasta sitten materiaalia vasten eri värillä | `[S]` |
| Procedural | Ratkaise yksi tehtävä ilman muistiinpanoja **ja ilman tekoälyä** | `[A]` |
| Analogous | Rakenna analogia uudestaan muistista | `[A]` |

**Kanvaasi (päätös 9.8.2026):** jokainen retrieval-kierros saa **oman tyhjän
Framen**. Tyhjyys on koko pointti — vanhaa ei jatketa. Aiemmat kierrokset säilyvät,
jolloin kierros 1 ja kierros 3 voi asettaa vierekkäin ja nähdä mitä on kertynyt.

**Free recall tarkemmin `[S]`:** tyhjä sivu, palauta mieleen niin paljon kuin pystyt
käsitekarttana katsomatta lähdettä. Ääretön kanvaasi on hyvä alusta. Tee kartasta niin
sanaton kuin pystyt — kuvia, ikoneita, värejä. Ryhmittele loogisesti, käytä
suuntanuolia. Vasta sen jälkeen palaa materiaaliin korjaamaan. Ohjeessa pitää lukea
että kyse on free recallista.

**Retrievalin laatu `[S]`:** mieleenpalautus hyödyttää enemmän kun se on kognitiivisesti
kuormittavampaa. Palauttaminen hyödyttää riippumatta siitä meniko oikein. Viivästetty
palaute voi olla parempi kuin välitön, mutta vain jos sen käy huolella läpi.

### Retrievalin kertausvälit

**Tärkeä korjaus aiempaan `[S]`.** Report sanoo suoraan: laajenevat välit eivät
selvästi paranna tuloksia kiinteisiin verrattuna, ja tutkimus on ristiriitaista.
Tarkkoja aikataulusuosituksia ei voi antaa. Jos tieto pitää säilyttää pidempään,
pidemmät välit voivat auttaa. Sataman [1,3,7,21] on siis yhtä perusteltu kuin mikä
tahansa muu — ei kannata hienosäätää, koska tutkimus ei tue hienosäätöä.

**Vielä tärkeämpi varoitus `[S]`:** liiallisella välistetyllä kertauksella on
käänteinen U-vaikutus. Sung on havainnut että liian suuri määrä kertausta heikentää
sekä tuloksia että mielenterveyttä, koska se on toistavaa ja aikaa vievää. Hänen
hypoteesinsa on että välistetty kertaus toimii parhaiten **täydentävänä** osana
järjestelmää joka ensisijaisesti optimoi encodingin, ja että se on suorastaan
haitallista jos encoding on jäänyt liian ohueksi.

**Sataman suunnitteluperiaate tästä:** ylläpitokertoja ei pidä maksimoida. Jos
ylläpitojono kasvaa pitkäksi, se on merkki siitä että encoding-vaihe on jäänyt
kesken — ei merkki siitä että pitäisi kerrata enemmän.

**Ehdotus `[A]`, nyt vahvemmalla pohjalla:** kertausväli kytketään encoding-laatuun.
Sung sanoo suoraan että työ encoding-vaiheessa vähentää kertauksen tarvetta. Kaavaa
hän ei anna.

### Overlearning

Vapaaehtoinen syventävä vaihe retrievalin jälkeen. Ei estä solmun valmistumista.
Ehdotetaan kun solmu on ollut valmiina jonkin aikaa ja päivä on rauhallinen.

| Tyyppi | Ohje |
|---|---|
| Conceptual | Piirrä ydinrakenne muistista ja laajenna sitä oman ajattelun suuntaan |
| Procedural | Ratkaise tehtävä joka on vaikeampi kuin kurssin vaatimustaso |

`[A]` molemmat — Sung antaa määritelmän muttei menettelyä.

---

## 6b. Luennot (päätös 9.8.2026)

**Ennen jokaista luentoa ehdotetaan priming.** Laukaisin on kalenterimerkintä:
luento kalenterissa → priming-tehtävä nousee edellisenä päivänä. Perustelu `[S]`:
luennon tieto on ohimenevää eikä oppijan säädeltävissä, ja priming on ainoa keino
ohittaa tämä rajoite.

**Luennolla muistiinpanot ei-lineaarisesti.** Tämä on oma opetettava taito, ei sama
asia kuin encoding. Ohje `[A]`: älä kirjoita lauseita peräkkäin. Kirjaa käsitteitä
laatikoiksi eri puolille sivua ja vedä niiden välille viivoja sitä mukaa kun luennoija
kertoo miten ne liittyvät toisiinsa. Jos et ehdi, kirjaa vain käsitteet ja lisää
suhteet heti luennon jälkeen. Perustelu `[S]`: sanatarkat muistiinpanot korreloivat
heikomman muistamisen kanssa.

## 6c. Mistä harjoitustehtävät tulevat (päätös 9.8.2026)

Kolme lähdettä, tässä järjestyksessä:

1. **Kurssin omat tehtävät** — MOOC sisältää ne valmiina, samoin matikka
2. **Ulkoiset lähteet** — Khan Academy matikassa
3. **Generoidut** — Satama näyttää valmiin promptin johon solmun nimi ja vaihe on
   täytetty, käyttäjä kopioi sen Copilotille. Ei API-kutsua, ei kustannusta.

Promptipohja on rivi kannassa per (tyyppi, vaihe), samalla tavalla kuin ohjeetkin.
Myöhemmin sen voi automatisoida ilman rakennemuutosta.

## 6d. Free recall -kanvaasi (päätös 9.8.2026)

**Toteutus: oma Frame Mirossa per retrieval-kierros.** Ei uutta editoria, ei upotettua
kolmannen osapuolen piirtotyökalua. Hytistä painetaan nappia → aukeaa Miro sen solmun
recall-Frameen → tallennus näkyy Hytissä.

**Yksityisyys ratkeaa jo olemassa olevalla rakenteella:** Laiturin kohdevalinta ohjaa
sisällön suoraan omaan hyttiin, eikä toisen hyttiin ole näkymää lainkaan. Recall-kartta
ei siis kulje jaetun näkymän kautta missään vaiheessa.

**Vertailu on teknisesti mahdollista `[A]`, mutta rajallista.** Miron API palauttaa
tekstilaatikoiden sisällön, joten äly näkee **mitkä käsitteet muistit** ja voi verrata
sitä materiaaliin. Se ei näe piirroksia, symboleja eikä kartan rakennetta. Käytännössä
tämä riittää: kattavuuden arviointi on juuri se mitä siirtymäpäätökseen tarvitaan, ja
rakenteen laadun täppäät itse GRRINDEllä.

## 7. Vaiheen valmius

- **Encoding:** GRINDE-kohdat täpättynä `[S]`
- **Priming:** ohjeen askeleet tehtynä `[A]`
- **Retrieval:** free recall tehty ja korjattu materiaalia vasten; äly vertaa `[A]`
- **Reference:** muistiinpanot koottu jäsennellyssä, ei sanatarkassa muodossa `[A]`
- **Overlearning:** ei valmiuskriteeriä — vaihe on vapaaehtoinen eikä estä valmistumista

### Solmun valmiussääntö (päätös 9.8.2026)

**Solmu on valmis kun:**
1. Priming tehty — käyttäjä täppää itse
2. Encoding tehty
3. Retrieval tehty **x kertaa** (oletus 3, muokattava data)
4. Reference tehty — käyttäjä täppää itse

Sen jälkeen solmu jää kertausjonoon ja voi vapaaehtoisesti siirtyä overlearningiin.

**Valmistuminen ei ole lopullinen.** Jos asia näyttää olevan oppimatta, retrieval
kierroksia saa palauttaa lisää.

**Älyn rooli on rajattu tähän:** se auttaa liikkumaan encodingin ja retrievalin
välillä, tarvittaessa edestakaisin. Priming-vaiheen valmiuden käyttäjä tunnistaa itse.
Riittää nopea vilkaisu, ei huolellista muistiinpanojen analyysiä — ensimmäinen
retrieval kertoo luotettavammin ja nopeammin onko asia opittu kuin encodingin
tuotoksen tarkka arviointi. **Tämä on se ominaisuus jonka voi kytkeä pois** kun
käyttäjä ei enää tarvitse sitä.

**Älyn pitää huomioida aikataulu.** Ei saa jäädä hinkkaamaan yhtä solmua kun muuta
on menossa. Poikkeus: käyttäjä voi merkitä **1–3 perustussolmua** lukukaudessa,
joiden päälle tulevat kurssit rakentuvat — niille annetaan enemmän aikaa.

### Vaiheiden kestot (päätös 9.8.2026)

- **Priming:** ohjeellinen aika näkyviin
- **Muut vaiheet:** ei kestoa, siirtymä tapahtuu kun tehty tai opittu riittävästi,
  huomioiden mitä muuta kursseissa on menossa
- **Overlearning:** jatkuvaa, ei jaksoa x päivää ennen koetta
- Kaikki kestot ovat dataa ja muokattavissa

### Opiskelurytmi (päätös 9.8.2026)

**Mitoitus.** 1 op = 27 h. 20 op lukukaudessa = 540 h, 25 op = 675 h. Noin 16 viikossa
se on 34–42 h viikossa eli käytännössä kokopäivätyö. Kun luennot vievät osan,
itsenäistä opiskelua jää arkipäivälle karkeasti 4–6 h.

**Tästä seuraa katon oikea tarkoitus.** Katto ei rajoita kunnianhimoa vaan pitää
opiskelun työpäivän sisällä. Riski ei ole liian vähäinen opiskelu vaan se että
opiskelu valuu iltoihin ja viikonloppuihin.

**Ei aihepäiviä.** Yksi kurssi per päivä (matikkapäivä, elektroniikkapäivä) on
blocking, ja Sungin SIR (spaced interleaved retrieval) on nimenomaan sen vastakohta.
Päivässä kosketetaan **3–4 kurssia**, ei yhtä eikä kaikkia viittä. Lomittaminen 2–3
aiheen välillä on tehokkaampaa kuin 7–8:n. `[A]` yleisestä tutkimuksesta, `[S]`
lomittamisen periaate.

**Lohkon pituus määräytyy vaiheesta, ei aiheesta.** Tämä on tärkein rytmisääntö:

| Vaihe | Lohko | Perustelu |
|---|---|---|
| Encoding | 60–90 min, yhtenäinen | Vaatii pisimmän yhtäjaksoisen ajan, kuormittavin osa |
| Priming | 15–25 min | Kevyt, tehdään ennen luentoa |
| Retrieval | 20–30 min | Lyhyt ja tiheä, useita eri kursseille samana päivänä |
| Overlearning | 20–45 min | Joustaa, tehdään kun jaksaa |

Tyypillinen arkipäivä: 1–2 pitkää encoding-lohkoa + 2–3 lyhyttä retrieval-lohkoa eri
kursseilta. Sungin omia lukuja lohkojen pituuksista ei löytynyt; nämä ovat `[A]`
yleisestä kirjallisuudesta (30–90 min per aihe, 45 min tavallisin lähtökohta).

**Kattoa ei aseteta keksittynä numerona (päätös 9.8.2026).** V1 kerää dataa: päivän
kertymä näkyy ilman arvostelua, ja ylitysmerkintä ilmestyy vasta kun datasta näkyy
montako slottia on sopivasti. Katto voi lisäksi johtua opintopisteistä (15 op = 405 h,
20 op = 540 h, 25 op = 675 h; jaettuna lukukauden viikoille 25/34/42 h viikossa,
miinus luennot), jolloin se säätyy itsestään kun kurssimäärä varmistuu.

**Ylitys tehdään Boostilla**, ei erillisellä jatka-napilla. Boost on jo olemassa ja se
on määräaikainen (15/30/45 min) — rajaton jatko olisi väärä ylitysmuoto. Boostit
merkitään dataan: jos boostaa joka päivä, katto on liian matala; jos ei koskaan,
liian korkea.

### Aktiivinen lepo (päätös 9.8.2026)

Tunti päivässä seitsemänä päivänä on parempi kuin seitsemän tuntia yhtenä päivänä.
Opiskeluehdotusten pitää ottaa aktiivinen lepo huomioon ja **ehdottaa sitä**, ei vain
sallia sitä.

**Kriittinen varoitus `[S]`:** oppijan omat ennusteet muistamisestaan eivät korreloi
todellisen suorituksen kanssa. Uudelleenlukeminen lisää väärää hallinnan tunnetta.
Sekä nuoret että aikuiset oppijat ovat hyvin huonoja tunnistamaan tehokkaita
kertaustapoja, ja pitävät helpompia tapoja tehokkaampina — jopa silloin kun heille on
suoraan kerrottu mikä on objektiivisesti parempi.

**Mitä tämä tarkoittaa Satamalle:** "tuntuu valmiilta" ei kelpaa siirtymäkriteeriksi.
Kelpaavat kriteerit ovat **tekoja** (onko askel tehty, onko nuolet piirretty) tai
**tuotoksen vertailu materiaaliin**. Tämä on samalla vahva peruste sille miksi
moottori ylipäätään on olemassa: ilman ulkoista kriteeriä oppija valitsee
systemaattisesti helpomman ja huonomman tavan.

---

## 8. Arkkitehtuuripäätökset

**Datavetoisuus.** Vaiheet, tietotyypit ja ohjematriisi ovat rivejä tauluissa, eivät
enumeja koodissa. Uusi kehys on uusi rivijoukko, ei purkutyö.

**Jokaisella ohjerivillä on lähdemerkintä kenttänä** (`[S]` / `[A]`), ei tekstinä.

**Äly kutsutaan täsmälleen kolmessa kohdassa:**
1. Materiaalin sisääntulo — kurssi puretaan osioiksi ja solmuiksi, tyyppi tunnistetaan
2. Ohjeen generointi solmulle ja vaiheelle — **kerran**, tallennetaan riviksi
3. Sisällöllinen vertailu — vastaako muistettu sitä mitä materiaalissa oli

Kohta 3 on ainoa toistuva ja ainoa jonka voi kytkeä pois. Ohjeet eivät katoa silloinkaan.

**Vaiheensiirtymän kehote** näkyy kanvaasilla kun solmu avataan, ei istunnon lopussa.

**"En pääse alkuun" -nappi:** tarjoaa pienemmän askeleen samasta vaiheesta ja
tallentaa merkinnän.

### Tehtävien priorisointi ja kuormitus (päätös 9.8.2026)

**Ehdoton ykkösprioriteetti:** kaikki palautukset deadlineen mennessä. Tämä ohittaa
retrievalin aina.

**Kertausvälit saavat joustaa.** [1,3,7,21] ja [3,10,29] ovat käytännössä yhtä hyviä —
Reportin mukaan tarkkoja aikataulusuosituksia ei voi antaa eikä laajenevien välien
paremmuudesta ole näyttöä. Pääasia on että kertaus tulee jollain välillä tehdyksi.
Väli on siis suositus, ei sitoumus, ja se väistää deadlineja.

**Vaihe valitaan päivän kuormituksen mukaan:**

| Kuormitus | Mitä nostetaan |
|---|---|
| Kevyt | Encoding ja priming — uuden opettelu vaatii eniten kapasiteettia |
| Keskitaso | Retrieval |
| Raskas | Overlearning, kevyt retrieval — ei uuden opettelua |

Perustelu `[S]`: encoding on järjestelmän kuormittavin osa, ja se on nimenomaan se
osa jossa kuormituksen pitää olla optimialueella. Uuden opettelun tunkeminen raskaaseen
päivään tuottaa heikkoa encodingia, mikä kostautuu myöhemmin kertaustaakkana.

**Varaus `[S]`:** Report sanoo että retrieval hyödyttää enemmän kun se on
kognitiivisesti kuormittavampaa. "Kevyt retrieval" väsyneenä on siis parempi kuin ei
mitään, mutta ei korvaa kunnollista kertausta.

**Kertaus ei saa syödä uuden opettelua.** Jos kertausjono kasvaa, se ei ole syy
lykätä encodingia — se on merkki siitä että encoding on jäänyt ohueksi.

### Kertausjono kurssin päätyttyä (päätös 9.8.2026)

Kertausjono päättyy lähtökohtaisesti kurssin mukana. **Poikkeus:** solmut joilla on
silta tulevaan kurssiin jäävät jonoon. Esimerkki: syksyn matikan potenssit ja
toisen asteen yhtälöt, kun tammikuussa alkaa precalculus — kurssien välinen tauko on
optimaalinen ikkuna nostaa nämä kertaukseen ennen kuin ne tulevat vastaan "uusina".
Insinöörifysiikka tai Low Code No Code ei tarvitse jäädä jonoon jos mikään ei jatka
niistä.

**Tämä ei vaadi uutta kenttää** — se on seuraus sillasta joka osoittaa eteenpäin.
Satama tarvitsee kuitenkin tiedon tulevista kursseista: kysytään käyttäjältä n
kuukautta ennen kurssin päättymistä mitä seuraavalla lukukaudella on tulossa.

### Kolme uutta suunnitteluperiaatetta Reportista

**a) Älä kysy tuntemusta liian usein `[S]`.** Tutkimus osoitti että mitä useammin
oppijaa pyydettiin arvioimaan vaikeutta, sitä todennäköisemmin hän käytti epätarkkoja
ja epäolennaisia vihjeitä — ja suoriutui huonommin. Sungin johtopäätös: itsearviointi
on hyödyllistä eikä siitä ole näyttöä haitasta, kunhan **tiheys ei ole liiallinen**.
Tarkkaa rajaa ei tiedetä. Satamassa: tuntemus-säädin kerran solmun alussa, ei joka
istunnossa, ei joka vaiheessa.

**b) Ohjeiden pitää haalistua kun osaaminen kasvaa `[S]`.** Asiantuntemuksen
käänteisvaikutus: ohjeistus joka auttaa aloittelijaa haittaa edistynyttä. Ohjaus
hyödyttää kun kuorma on korkea ja haittaa kun kuorma on kevyt. Satamassa: ohjeiden
yksityiskohtaisuuden pitää voida laskea, ja käyttäjän mahdollisuus kytkeä kehotteet
pois ei ole mukavuusominaisuus vaan menetelmän vaatimus.

**c) Kiirehtiminen ja valikoiva oppiminen ovat suurimmat epäonnistumisen syyt `[S]`.**
iCanStudyn omassa datassa oppijat jotka kiirehtivät vaiheiden läpi ilman riittävää
harjoittelua tai jättivät osan tekniikoista väliin epäonnistuivat jopa yhdeksän kertaa
todennäköisemmin. Heidän vastalääkkeensä olivat selkeä viitoitus, tekemiseen perustuva
eteneminen ja sisällön avautuminen ajan myötä. Satamassa: vaiheita ei saa voida
hyppiä ohi ilman merkintää, ja "en pääse alkuun" -merkinnät ovat juuri sitä dataa
josta valikoivan oppimisen näkee.

### Materiaalin tallennus

- Teksti tallennetaan kerran per tiedosto, ei pilkota
- Solmun kohdalle kirjataan kohtatieto (esim. sivut 12–18) kun poiminta sen tietää
- Tiedoston ja solmun suhde on monta moneen molempiin suuntiin
- Materiaali kiinnittyy solmuun poimintaehdotuksen kuittauksen yhteydessä

**Materiaalin neljä kohdetta:**
1. Päivämäärät ja deadlinet → riveiksi, ei tekstivarastoon
2. Kurssitason teksti (arviointiperusteet, kokeen muoto) → tallennetaan, vain älyn käytössä
3. Solmutason sisältö → tekstinä
4. Kaikki muu → ei tallenneta

**Kuittausnäkymä on kaksitasoinen:** lista solmuista aikoineen, jokaisen perässä pieni
merkki liitetyistä tiedostoista.

**Miro:** muokkaus Mirossa, embed Satamassa. API:lta tarvitaan vain Framen olemassaolo
ja viimeisin muokkausaika.

**Ristiriitatilanteet:** arvaus sallittu, mutta merkitään käyttäjälle näkyvästi.

---

## 9. Learning Framework Extraction Course

Työkalu, ei suoritettava kurssi. Testikurssi "Justin Sungin metodi", jolla syötetään
metodimateriaalia sisään ja jota käyttäjä samalla opiskelee. Sen jälkeen
MOOC-koodauskurssi (tekstimuotoinen).

**Kurssin tietotyyppi:** pääosin Procedural, osin Conceptual.

**Testikurssi etenee opetusjärjestyksessä**, koska sen tarkoitus on opettaa metodi
käyttäjälle. Varsinaiset kurssit (MOOC, matikka) noudattavat vaiheiden omaa
järjestystä. Seuraus: vaihemoottorin ensimmäinen oikea koeajo tapahtuu vasta
MOOC-kurssilla.

**Materiaalin muoto:** Report on Learning ensin (tekstiä, tarkempaa kuin videot).
Videot valikoiden, kokonaisina transkripteina, ei etukäteistiivistystä.

---

## 10. Vielä auki

Reportista **ratkennut:** vaiheiden järjestys, encodingin konkreettinen menettely
(BHS), proseduraalisen tietotyypin oma vaiheistus, välien laskenta (ei voi tarkentaa),
overlearningin määritelmä, Reference-vaiheen periaate, valmiuskriteerin luonne.

**Yhä auki:**

- [ ] GRINDEn R: "Relational" vai "Reflective"
- [ ] Mitkä ovat rajatun kyselyn tarkat kysymykset — Report kertoo kysymysten kaksi
      kohdetta (suhteet, tärkeys) muttei sanamuotoja. Tämä on tärkein jäljellä oleva
      aukko, koska se on ohjeen ydin
- [ ] Vaiheiden kestot
- [ ] Reference-vaiheen täsmäohje (periaate on, sanamuoto puuttuu)
- [ ] Milloin overlearning kannattaa tehdä — ennen koetta, vai jatkuvasti
- [ ] Yksi konkreettinen esimerkki alusta loppuun, mieluiten tekninen aihe

**Hyviä lähteitä katsottavaksi:**
- "7 Years of Building a Learning System in 12 minutes" — PERO kokonaisuutena
- "The Ultimate Guide to The Perfect Mindmap (6-Step Checklist)" — GRINDE
- "How to Study With Me (Instructions)" — istunnon läpikäynti: valmistautuminen,
  priming, arviointi, kysymysten esittäminen, aktiivinen lepo, seuraava sykli

---

## 11. Päiväsuunnitelman generaattori (päätös 9.8.2026)

**Horisontti:** viikko tai kaksi eteenpäin. Lyhyempi horisontti ei paljastaisi ajoissa
jos kurssimäärä ei mahdu.

**Iltatarkistus:** edellisenä iltana katsotaan mikä on olennaisinta seuraavaksi. Jos
suunnitelma vastaa suunnilleen sitä, uutta ei tehdä — täydellistä vastaavuutta ei
vaadita. Uusi suunnitelma tehdään vain jos jotain olennaista on muuttunut (yllättävä
deadline).

**Tavoite ja hoitotaso ovat eri kentät.**

| Kenttä | Mikä | Muuttuu |
|---|---|---|
| Tavoite | Miksi tämä kurssi: läpäisy / kunnollinen osaaminen / perusta jatkolle | Asetetaan kurssin alussa, pysyy |
| Hoitotaso | Kuinka paljon kapasiteettia juuri nyt: täysi / kevyt / vain deadlinet | Elää viikoittain |

Tavoite määrää hoitotason oletuksen ja sen, mikä kurssi kevenee ensimmäisenä kun
viikko ei mahdu. Erillisyys on tarkoituksellinen: tiukalla viikolla ei pidä joutua
muuttamaan sitä mitä kurssi merkitsee.

**Päivän täyttöjärjestys:**

1. Deadline-tehtävät
2. Priming huomisen luennoille (aikasidonnaisia, ei voi siirtää)
3. Erääntyvät kertaukset, painotettuna tavoitteen mukaan (syvällisesti opittavan
   kurssin kertaus menee läpäisykurssin edelle)
4. Yksi encoding-lohko kurssilta joka on eniten jäljessä omasta aikataulustaan
5. Overlearning perustussolmuille jos tilaa jää

**Kurssin oma aikataulu** tulee kurssin materiaalista (viikko-ohjelma, aihe/viikko).
Jos sellaista ei ole, solmut jaetaan tasan jäljellä oleville viikoille.

**Rajat:**
- Vähintään 2 eri kurssia päivässä, mieluiten 3, korkeintaan 4
- Korkeintaan 2 encoding-lohkoa päivässä

**Sillisalaattihuoli ratkeaa vaiheiden kautta.** Konteksti ei vaihdu kurssin
vaihtuessa vaan vaiheen vaihtuessa. Yksi pitkä encoding-lohko + kaksi lyhyttä
kertausta muilta kursseilta koskettaa kolmea kurssia mutta sisältää vain yhden syvän
kontekstinvaihdon. Kolme encoding-lohkoa kolmelta kurssilta olisi sillisalaatti.

**Korjattu 10.8.2026 (ks. HYTTI_SPEKSI.md §7.2):** tämä kohta väitti aiemmin virheellisesti
että "sillat eivät nosta solmua päiväsuunnitelmaan" — väärin, koska päiväsuunnitelma on
**ainoa** reitti sillan opiskeluun (sillalla ei ole omaa sivua eikä selattavaa listaa).
**Sillat NOSTAVAT solmun päiväsuunnitelmaan** — generaattori nostaa sillan Nyt-osioon
siinä missä kurssienkin solmut, edistäen niitä kursseja joita silta koskee. Kurssien
sisällöt eivät siis mene siltojen ohi. Sillat vaikuttavat lisäksi siihen jääkö solmu
kertausjonoon kurssin päätyttyä — tämä osa oli ja on ennallaan.

**Jokaisella solmulla on oma PERO-kuvionsa** — generaattori toimii solmutasolla, ei
kurssitasolla.

**Kun päivä ei täyty:** täytteeksi encoding, mutta generaattori saa nostaa sen mikä on
ajankohtaisinta.

**Kun päivä on täynnä pelkistä deadlineista:** sitten se on niin. Ei yritetä
mahduttaa muuta. Boostilla voi tehdä lisää jos jaksaa.

**Boost ottaa saman päivän jonosta**, kestolla suodatettuna: 15 min = kertaus tai
priming, 30 min = kertaus + reference, 60 min = encoding-lohko. Boost ei tarvitse omaa
tehtävälähdettään.

**Boostilla tehty korvataan uudella tehtävällä jonosta** — se ei saa näkyä seuraavan
päivän ensimmäisenä kohtana. Suunnitelman ei tarvitse virrata heti uudelleen;
korvaus tapahtuu iltatarkistuksessa.

**Iltatarkistus klo 21.45 (säädettävissä).** Uusi suunnitelma tehdään jos on
ilmestynyt uusi deadline joka pakottaa muutokseen — kaikki opettajat eivät aseta
deadlineja kurssin alussa vaan kurssin mittaan. Lisäksi boostilla tehdyn tilalle
nostetaan uusi tehtävä jonosta.

**Harjoitustehtävien lähteet** (ennallaan): kurssin omat tehtävät → ulkoiset lähteet →
Sataman näyttämä valmis prompti jonka käyttäjä kopioi Copilotille.
