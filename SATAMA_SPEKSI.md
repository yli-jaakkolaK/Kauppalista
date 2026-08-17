# Satama — speksi

**Versio:** 2026-08-16
**Status:** ainoa voimassa oleva speksi koko sovellukselle (Hytti + Ruori + Laituri + periaatteet)

**Tämä tiedosto korvaa ja kokoaa yhteen:** `HYTTI_SPEKSI.md`, `CODE_ruori.md`, `CODE_vaihe1b.md`, `CODE_ruori_korjaukset.md`. Nimi vaihtui Hytistä Satamaan koska sisältö on jo pitkään kattanut koko sovelluksen, ei vain Hyttiä.

**16.8.2026 — `HYTTI_SPEKSI.md` yhdistetty tähän kokonaan ja poistettu.** Se oli erillinen, tästä tiedostosta haarautunut versio joka sai oman "Täydennykset Satama-speksiin" -yhdistelynsä eri keskustelussa 16.8. — vain osa sitä yhdistelyä ehti tähän tiedostoon asti. Katrin ohje: satama_speksi on tästä eteenpäin AINOA seurattava tiedosto, hytti_speksi ei enää ole olemassa. Delta tarkistettu kohta kohdalta molemmista tiedostoista ennen poistoa — ks. muutokset §4.1, §7.1, §7.2, §8.1, §8.3b, §11.

**16.8.2026, toinen erä — Cowork-keskustelusta relayattu täydennys yhdistetty.** Suurin osa oli jo tässä tiedostossa (toinen keskustelu oli ehtinyt ennen tätä). Uusi sisältö merkitty **(relay 16.8.)** kohdissaan: §5.1, §5.2, §6.2, §6.3, §9, §10.1, §16.5b, §17, §18, §20 (uusi), §13. Huom: Coden deploy-yhteenveto (`e7b55b0`, materiaalilistan uudistus + sillasolmu-moottorin tiedostoyhteys) on jo kirjattu §7.2:een ja §8.3b:hen aiemmin 16.8. — ei toisteta täällä, RAKENNETTU-tila on jo ajan tasalla. **Katrin ohje 16.8.:** rakennettu-status kuuluu jatkossa `muistiinpanot.md`:hen, ei tähän speksiin — tästä eteenpäin tämä tiedosto pyritään pitämään puhtaana päätöksinä/konsepteina, ei build-lokina, vaikka aiempi RAKENNETTU-merkintäkäytäntö (§0) jää voimaan olemassa olevaan sisältöön koska sen purkaminen nyt olisi iso erillinen työ.

---

## 0. Miten tätä dokumenttia luetaan

- **Tavallinen teksti** = päätetty. Tähän saa nojata rakennettaessa.
- **AUKKO-lohkot** = ratkaisematta. Jokaisessa on Clauden ehdotus merkittynä `Ehdotus — EI HYVÄKSYTTY`. **Näitä ei toteuteta ilman Katrin kuittausta.**
- **RAKENNETTU-merkintä** = toteutettu ja pushattu jo, kirjattu tähän referenssiksi eikä uudeksi tehtäväksi.

Aukkojen yhteenveto: **§11**. Rakennusjärjestys: **§13**.

**Muotokieli** on tiedostossa `satama-design-kuvaus.md`. Tässä vain sovelluskohtaiset päätökset.

**Menetelmän tietopohja** on tiedostossa `sung-metodi.md`.

**Mockup-tiedostot (aina kirjaimellista koodia, ei vain chat-esikatselua):** `satama-hytti-v4.html` (Hytti/Reitti), `satama-ruori-header-v2.html` (Ruorin otsake, kello, sääkuvakkeet), `satama-kartta-v6.html` (Kartta-pohja).

**Lähteenä EI käytetä:** `satama-ruori.html` (vanha, ei edusta haluttua muotokieltä).

**Toimintatapa (lisää `copilot.md`:hen jos ei jo siellä):** visuaaliset päätökset viedään aina tiedostoksi jonka Code voi avata suoraan, ei koskaan pelkäksi chat-esikatseluksi. Vercel Hobby -tason 12 serverless functionin raja on standing-rajoite, tarkista ennen uusia API-reittejä (§8.3b).

**Oma ohje Claudelle (13.8.), koskee kaikkia keskusteluja jatkossa — ei vain tätä:** kaikki ohimenevät, keskeneräiset ajatukset mistä tahansa Sataman osa-alueesta — nousivat ne kumman tahansa Katrin omasta viestistä, Cowork/chat-keskustelusta, tai Coden puolelta relayattuna — tallennetaan tähän tiedostoon heti kun ne nousevat esiin, riippumatta siitä liittyvätkö ne juuri käsillä olevaan tehtävään. Jos aihe ei istu mihinkään olemassa olevaan osioon, **luo uusi osio** sen sijaan että jätetään kirjaamatta. Ei tarvitse olla valmiiksi mietittyjä tai viimeisteltyjä, kunhan eivät huku keskusteluihin.

---

## 1. Termistö

Käyttöliittymässä ja kaikessa puheessa käytetään oikeanpuoleista saraketta. **Kannan ja koodin nimiä ei muuteta.**

| Kannassa / koodissa | Termi | Mikä se on |
|---|---|---|
| `opinto_aiheet` | **solmu** | Kurssin yksi teema. 8 teemaa = 8 solmua. |
| `taitosolmut` | **silta** | Lähes sama teema kahdessa eri kurssissa, ja niiden suhde. |
| `taito_kaaret` | **solmun kaari** | Mitkä solmut liittyvät toisiinsa ja miten; mitä pitää osata ennen kuin seuraavan voi ymmärtää. |
| `taitosolmu_viittaukset` | **sillan viittaus** | Mihin solmuihin silta liittyy. |

**Kanvaasi ei ole `kasitekartta`.** Ne ovat kaksi eri asiaa:

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

**Ydinkuvaus (relay 16.8.):** "Kannustava toiminnanohjauksen keskus omille henkilökohtaisille asioille jotka eivät kuulu muun vastuulle tai halutaan pitää omana." Tämä puoltaa sitä että kortit/materiaalit joita ei ole tarkoitus jakaa kuuluvat Hyttiin, ei jaettuihin näkymiin.

---

## 3. Informaatioarkkitehtuuri

```
Hytti
├── Nyt      · tekeminen — yksi asia jonka voi tehdä
├── Reitti   · katsominen — viikko, kurssit, kertausjono
├── Kartta   · katsominen — kaksi näkymää kertyneestä
└── Loki     · kirjoittaminen — omat muistiinpanot
```

Välilehdet renderöidään listasta, ei kovakoodattuina nappeina. **Välilehtirakenne on RAKENNETTU** (vaihe 1b, §16.1) — Nyt ja Kartta siirtyivät sellaisenaan, Reitti sai kurssiosion uudella muotokielellä.

**Kuormamittaria ei ole missään näkymässä.** Kuorma näkyy vain viikkokalenterin sarakkeen sävynä.

---

## 4. Nyt-välilehti

### 4.1 Rakenne

**Layout kumottu ja korvattu (9.8.2026, ratkaisu vahvistettu ja yhdistetty tähän 16.8.2026).** Aiempi versio — Nyt-kortti ylimpänä, kalenteri vasemmalla, Boost oikealla — ei ole enää voimassa. Se sanoi saman asian kahdesti (kortti + kalenteririvi olisivat molemmat päivän tilannetta).

Voimassa oleva rakenne:

1. **Deadline-rivi** (vain 1–2 pv ennen palautusta, §7.3)
2. **Päivän loki ylimpänä** — aikajärjestyksessä kirjoitettu merkintä päivän kulusta, ajat omalla kapealla palstallaan vasemmassa reunassa
3. **Käynnissä oleva kohta korostettuna, toimien samalla Nyt-korttina** — ei erillistä elementtiä lokin päällä. Merikartan syvyyslogiikka (§6) on käytössä myös täällä: käynnissä oleva kohta on syvintä vettä, myöhemmät asteittain matalampia — tämä antaa Nyt-kortille painon ilman että sen tarvitsee olla iso
4. **Perustelurivi** — miksi juuri tämä nyt (§4.4)
5. **Boost-rivi alimpana** (§4.8)

**Kalenterimerkinnät eivät ole kortteja** vaan viivalla merkittyjä rivejä lokissa. Ero näkyy kulmasilmäyksellä: kortti on tekemistä, merkintä on jotain jonka ympäri opiskelu kiertää.

> **Värit — RATKAISTU, ja osittain jo rakennettu ennen tätäkin keskustelua.** Tarkistettu suoraan tietokannasta (`kalenteri_syotteet`, `sql/061`, 2026-07-17): Juha = `#1976D2`, Katri = `#D32F2F`, Perhekalenteri/Yhteinen = `#8E44AD` (liila) — kaikki kolme jo live'ssä, eivät enää avoimia päätöksiä. Nämä ovat henkilöidentiteettivärejä ("kuka menee minne") — ei sama järjestelmä kuin Kuormavahti tai `--vaara`.
>
> **Todellinen ristiriita löytyi ja MITATTIIN 17.8.2026: Katrin `#D32F2F` on käytännössä sama väri kuin `--vaara` (#B8433A).** Kontrastisuhde 1,08:1, sävyero ~4° — silmälle identtinen punainen. Tummennus ei auta, koska ongelma on sävy, ei vaaleus. **Ratkaisu: `--vaara` pysyy koskemattomana** (sen ainoa tehtävä riippuu siitä että se tunnistaa itsensä välittömästi), ja Katrin punainen saa jäädä omaksi, 10+ vuotta käytössä olleeksi tunnistevärikseen — MUTTA deadline-rivit (jotka käyttävät `--vaara`:a) saavat lisäksi ei-väripohjaisen merkin (ikoni tai paksu reunaviiva), jotta merkitys ei koskaan riipu pelkästä punaisen sävystä kun molemmat sattuvat näkymään samalla Reitti-näkymällä.
>
> **Lukkarikone (luennot) päätetty 17.8.: sama punainen kuin Katrin oma kalenteri (`#D32F2F`)** — aiemmin värittämätön (`vari` oli NULL), nyt yhtenäistetty koska luennotkin ovat "Katrin omaa". Itslearning ja Juhan Oma-syöte pysyvät koskemattomina (oma aiheen mukainen värinsä, ei osa tätä identiteettijärjestelmää).
>
> **Uusi, erillinen väri: Sataman itse generoimat opiskelulohkot ("oppimissessiot").** Nämä eivät ole henkilöidentiteettejä vaan Sataman omaa ehdotusta — oma väri, "keltaisen sävyinen" Katrin toiveesta. Ongelma: mikään kellertävä ei erotu Kuormavahdin `matalikko`/`karikko`-taustasta riittävästi (mitattu kontrasti ~1,0–1,4:1 useilla kokeilluilla sävyillä — sama ilmiö kuin punaisella, mutta tässä sävykin on lähellä). Ratkaisu ei ole väriä hienosäätää vaan lisätä 2px `--muste`-reunaviiva lohkon ympärille — reunaviiva pitää muodon luettavana taustan kuormatasosta riippumatta. Väri: `#E3A62F`.
>
> **Kuormavahti-tausta:** ei uutta väriä — käyttää `matalikko`/`karikko`/`paperi` täsmälleen samalla merkityksellä kuin muuallakin (kevyt/raskas kuorma, SOS), vain sovellettuna päivän/viikon taustaväriksi eikä prosenttiympyrään.
>
> **Siirtymäblokit (§8.1 Föli) tulevat samaan yhteyteen** — reaaliaikainen, ei paikkamerkki (Föli ei ole vielä rakennettu, ks. §8.1).

**Tehty kohta katoaa näkymästä kokonaan** — ei himmene, ei jää yliviivattuna. Näkymän pitää palkita etenemistä eikä listata jäljellä olevaa; päivä näyttää konkreettisesti kevenevän. Reitin puolella kaikki näkyy edelleen, myös menneet.

**Päivän tason perustelua ei ole.** Ainoa perustelu on §4.4:n lyhyt rivi Nyt-kortin alla, ja se koskee vain sitä yhtä asiaa joka on juuri nyt tehtävänä. Koko päivän asettelua ei selitetä.

Ei kurssilistaa, ei karttoja, ei ylläpitolistaa.

**Huom:** Nyt-välilehden ulkoasu ei ole vielä saanut uutta muotokieltä (vaihe 4, §13) — sisältö siirtyi vaiheessa 1b sellaisenaan, layout yllä on hyväksytty päätös mutta ei vielä toteutunut koodissa.

**Boost-rivi — tarkennuksia §4.8:ään:** Boost ottaa tehtävät **saman päivän jonosta kestolla suodatettuna** — ei tarvitse omaa erillistä tehtävälähdettä. Boost on myös **päiväkaton ylitysmekanismi**; erillistä "jatka"-nappia ei tule, koska rajaton jatko olisi väärä ylitysmuoto (ks. myös §18 päiväkatosta).

**Flow voittaa suunnitelman.** Jos Boost on vienyt flow-tilaan ja suunnitelman mukaan toinen aihe olisi juuri alkamassa, **mitään ei tapahdu** — työtä voi jatkaa keskeytyksettä. Kun käyttäjä on valmis, päivä laskee seuraavan askeleen uudelleen siitä hetkestä.

**Kiinteät menot (liveluennot ym.) — lisäys 17.8.2026.** Lokissa kiinteä meno ei saa näyttää samalta kuin siirrettävä opiskelupätkä eikä himmentyä kuten tulevat pätkät (§4.1 syvyyslogiikka koskee vain opiskelupätkiä). Kiinteä meno tarvitsee oman, selkeän merkin että se on live eikä siirry (ks. §4.6 "eivät väisty").

**"Muut vaihtoehdot" — uusi lisäys 17.8.2026, ei aiemmin speksattu.** Kompakti, kosketettava nappi (ei pudotusvalikko, ei omaa tilaansa vievä kortti). Avattaessa vaihtoehdot renderöityvät itse kosketettavana pintana (`--r-kosketettava`, messinki-kehys) — ei vaimeana listana. **Huom korjaus samana päivänä:** kosketettavalla pinnalla pitää olla riittävä padding, muuten `--r-kosketettava` (13px) pienellä napilla näyttää täydeltä pillimuodolta eikä pyöristetyltä suorakulmiolta kuten Boost-napeissa.

**Boost-jatkuvuus (päätetty 17.8.2026).** Boostilla tehty työ ei saa koskaan nousta seuraavan päivän ykkösehdotukseksi uudelleen niin kuin sitä ei olisi tehty. Generaattori laskee seuraavan askeleen aina solmun **senhetkisestä tilasta** (`pero_vaihe`, `retrieval_kierrokset`, `kertausjonossa` — samat kentät jotka Boostin kuittaus jo päivittää), ei kiinteästä suunnitelmasta joka ei tiedä Boostista mitään. Käytännössä: kun päivä lasketaan uudelleen (joko yöllä tai kun käyttäjä palaa Boostin jälkeen, §4.1), sen pitää lukea sama tila josta Boost kuittasi edistymisen — ei erillistä, Boostista tietämätöntä jonoa.

### 4.2 Nyt = päivän seuraava asia

Nyt-kortti näyttää aina sen mikä tapahtuu seuraavaksi, riippumatta tyypistä. Luentopäivänä liveluento, lounasaikaan lounas, muuten solmu.

Ainoa poikkeus: **suljettu ikkuna ei voi olla Nyt-kortti.** Suojattu ruokailu voi.

**Menneet katoavat.** Kun loppuaika on ohitettu tai asia on merkitty tehdyksi, se poistuu näkymästä kokonaan.

### 4.3 Ajanotto

**Ei näkyvää edistymisviivaa. Ei laskuria jota pitää katsoa.**

Ajanotto alkaa kun käyttäjä avaa tehtäväkortin ja **päättyy itsestään kun hän poistuu siitä**. Käyttäjän ei tarvitse muistaa painaa mitään lopettaessaan — se on juuri se asia jonka väsynyt ihminen unohtaa ja joka pilaa datan.

Todellinen tekemisaika voidaan tarvittaessa tarkistaa myös **kanvaasin muokkauslokista** (Miro), joka kertoo milloin solmua on oikeasti työstetty.

**Tarkennus 9.8.2026 (toinen keskustelu):** loppu = paluu Satamaan **tai** Miron Framen viimeisin muokkausaika, **kumpi tuoreempi**. Näytön pimeneminen ei yksin riitä tulkinnaksi — se tarkoittaa yhtä hyvin taukoa kuin siirtymistä puhelimeen. Yhdistettynä muokkausaikoihin ero näkyy: jos Frameen tuli muutoksia pimeyden aikana, työtä tehtiin.

> **AUKKO — varmistettava ennen toteutusta:** Miron API:n muokkausaikojen tarkkuus ja ilmaisen tason kutsurajat. **Varasuunnitelma jos ei toimi:** pelkkä paluu-Satamaan-hetki, kuten alkuperäisessä kuvauksessa.

**Nousemismuistutus on erillinen ja yksinkertainen ominaisuus, ei liity ajanottoon:** laskuri aktiivisesta ajasta, muistutus 2 h kohdalla (säädettävissä, ks. §17 Asetukset). Taukojen syyn voi halutessaan kirjata, ei pakollista.

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

### 4.7 Opiskelupätkien järjestys — interleaving (korjattu 17.8.2026)

**Korjaus:** alla ollut kuvaus ("peräkkäiset pätkät eri kursseilta/aiheista", Taylor & Rohrer -sitaatti) kuvasi väärää määritelmää. `sung-metodi.md` §27 (korjattu 17.8.2026): **"Interleaving ≠ aiheiden vaihtelu. Se on saman aiheen sisäistä variaatioiden vertailua."** Yksi opiskelupätkä — tai aamun 2–3 lyhyempää settiä peräkkäin — saa siis käsitellä **samaa solmua/teemaa eri kulmista**; se EI ole virhe eikä vaadi poikkeuslupaa §4.7:stä, se on §4.7:n oikea muoto.

**Taylor & Rohrer -sitaatti pudotettu 17.8.2026** — koski eri, yleisempää tutkimuskirjallisuuden "interleaving"-käsitettä (aiheenvaihto), ei Sungin määritelmää. Ei korvaavaa lähdettä; sääntö nojaa `sung-metodi.md`:hen sellaisenaan.

**Erillinen, rinnakkainen vaatimus (ei sama asia kuin interleaving):** päivän aikana kosketetaan silti **2–3 eri kurssia**, ei koko päivää yhdestä kurssista putkeen. Tämä on kurssien välisen vaihtelun/tasapainon periaate päivätasolla; interleaving taas koskee sitä miten YHTÄ aihetta työstetään kussakin pätkässä.

**Käyttöliittymäseuraus:** interleaving (oikeana, sisäisenä variaationa) voi silti tuntua tehdessä huonommalta kuin suora toisto. Sanotaan ääneen ettei käyttäjä tulkitse sitä epäonnistumiseksi.

**Flow-tarkennus (17.8.2026, säilyy):** kumpikaan sääntö (interleaving pätkän sisällä, 2–3 kurssia päivässä) ei ole pakollinen kesken flow-tilan — §4.1:n "Flow voittaa suunnitelman" on aina voimassa. Nämä ovat generaattorin suunnitteluperiaatteita jonon rakentamiseen, eivät istunnon aikaisia pakotteita.

### 4.8 Boost

Napit **15 / 30 / 60 / ··**.

`··` avaa rullavalitsimen, arvot: **10, 20, 25, 35, 40, 45, 50, 55, 70, 80, 90, 100, 110, 120**.

Rulla noudattaa `satama-komponentit.html`:n muotokieltä: lämpimään taittava lasipinta, messinkikehys — mutta **toteutukseltaan iOS-natiivi valitsin**, ei omatekoinen. **Jokaisesta arvosta kevyt haptinen palaute.**

Boost on täydennys, ei suunnitelman perusta. Illan satunnaiset hetket hoidetaan tästä eikä niitä suunnitella kalenteriin.

**"Ehtii"-merkintää ei rakenneta.**

### 4.9 Tehtävänäkymä (uusi osio, toisesta keskustelusta 9.8.2026)

Nyt-kortista/lokista avautuva näkymä yhdelle tehtävälle. **Sisältö ylhäältä alas:**

1. ohje siitä mitä tässä vaiheessa tehdään
2. vaiheen ohjelista täpättävänä
3. Miro-embed (vain kun sitä tarvitaan, esim. encoding ja retrieval)
4. kurssin materiaalit tai linkki niihin

**Solmun kohta pitää voida luoda kurssin Framen sisälle tästä näkymästä.** Miksi tätä tarvitaan (Katrin kysymys 17.8., vastaus): §10.1:n mallissa koko kurssi on YKSI iso käsitekartta, ja "kukin solmu avautuu siitä kohdasta jota on tarkoitus työstää" — eli jotta uuden solmun encoding voi ylipäätään avautua johonkin, sillä pitää ensin OLLA paikka isolla kartalla. Tämä nappi luo sen paikan (uuden alueen/section) kartalle ensimmäisellä kerralla kun solmua aletaan encodata — ilman tätä ei olisi mihin "avautua".

**Ohjeen esitystapa:** koko vaiheen ohje näkyy kerralla, mutta **vain käsillä oleva vaihe on täpättävänä**. Nykyinen vaihe auki, muut kutistettuina — neljän vaiheen ohjeet yhtä aikaa ruudulla olisi juuri sitä hajautettua huomiota jota menetelmä varoittaa välttämään.

**Muokkaus tapahtuu Sataman sisällä** Miron live-embedin kautta (Miron oma editori upotettuna, ei omaa editoria) — tämä on linjassa §10.1:n kanssa ("Muokkaus tapahtuu Satamassa").

**"En pääse alkuun" -nappi:** tarjoaa pienemmän askeleen samasta vaiheesta ja tallentaa merkinnän. Merkinnöistä näkee myöhemmin ovatko tietyt vaiheet tai tietotyypit systemaattisesti hankalia — sama data paljastaa myös valikoivan oppimisen (ks. §18 Data ja logitus).

**Vaiheensiirtymän kehote näkyy kun solmu avataan**, ei istunnon lopussa (jo linjassa §7.4:n kanssa).

**Laajennus 17.8.2026 — kehote tulee tietoiseksi kaikista käynnissä olevista kursseista.** Katrin vaatimus: yksittäinen solmu ei saa jumittaa 2 kuukautta kun muut kurssit etenevät — kehotteen pitää huomioida kaikki aktiiviset kurssit, ei vain sitä yhtä jota ollaan avaamassa. **Ei tarvita uutta rinnakkaista mekanismia:** `opinto_aiheet.tavoiteikkuna` (jo olemassa, jo seedattu esim. Algebra 2:lle, sql/100) on jo se yhteinen valuutta jolla eri kurssien aiheiden kiireellisyyttä voi verrata suoraan — päivämäärä on päivämäärä riippumatta kurssista. Kehotteen/jonon priorisointi laajenee lukemaan KAIKKIEN aktiivisten kurssien `tavoiteikkuna`-kenttiä yhdessä (ei kurssikohtaisena siilona), samalla painotuslogiikalla kuin §7.3:n painoarvot muutenkin — ei erillistä uutta laskentaa, sama mekanismi laajennettuna kurssirajan yli. **Tämä ratkaisee myös "muutama viikko etuajassa ennen luentoa" -toiveen:** koska `tavoiteikkuna` on jo asetettu ennakoivasti (ei luennon päivälle vaan sitä ennen), sen noudattaminen automaattisesti pitää opiskelun luentoja edellä — ei tarvita erillistä lukkarikone-teema-täsmäystä.

---

## 5. Reitti-välilehti

**Kurssiosio on RAKENNETTU** (vaihe 1b, §16). Viikkokalenteri, deadline-lista ja kertausjono ovat yhä myöhemmässä vaiheessa (§13).

Rakenne: **Viikko** → **Kurssit** → **Ylläpito**.

### 5.1 Viikkokalenteri

**Ei vielä rakennettu.**

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

**Täydennykset 9.8.2026 (toinen keskustelu):**

- **Perhekalenteri ja opiskelu samassa listassa** — ne vievät samaa aikaa, joten kuuluvat samaan näkymään. Live-asioissa näkyy matka-aika ja lähtöaika (Föli, §8.1).
- **Luennot laukaisevat primingin.** Luento kalenterissa → priming-tehtävä nousee edellisenä päivänä. Kalenterimerkintä on laukaisin, ei erillinen muistutus.
- **Toteutuneet opiskelut näkyvät Reitin kalenterissa** samassa näkymässä kuin live-luennot — tämä on päivän kertymän paikka, ei tarvita erillistä laskuria Nyt-välilehdelle.
- **Kurssien välinen tauko on suunniteltu ikkuna.** Solmut joilla on silta tulevaan kurssiin jäävät kertausjonoon kurssin päätyttyä (esim. syksyn potenssit → tammikuun precalculus, ks. §7.2, §7.5). Tauko on optimaalinen hetki nostaa ne kertaukseen ennen kuin ne tulevat vastaan "uusina".
- **Satama kysyy tulevat kurssit noin kuukautta ennen kurssin päättymistä**, jotta se tietää mitkä solmut jäävät jonoon.

**Täydennykset 17.8.2026 (Katrin kuvaus koko Reitin rakenteesta):**

> **Ei ristiriita, korjattu 17.8.2026 — oma virhe merkitä tämä ristiriidaksi.** "Päivät ovat pystysarakkeita" ja Katrin kuvaus ovat sama asetus: standardi iCal-viikkoruudukko. **7 päivää vierekkäin (vaakaan) yli viikon**, kukin päivä omana **pystysuuntaisena sarakkeena** jossa tunnit juoksevat ylhäältä alas, aamu ylimpänä. Koko viikko kerralla näkyvissä: luennot, opiskelusuunnitelma, hammaslääkäriajat ym. samassa ruudukossa, realistinen siirtymäaika paikasta toiseen mukaan laskettuna (Föli, §8.1). Tiedot suoraan lukkarikoneesta (luennot) — jo linjassa §5.1:n kanssa.

Katrin kuvaus ylhäältä alas:

1. **Viikkokalenteri (vaakaan), selvästi näkyvät luennot.** Sama rivi/näkymä säilyttää ja näyttää myös **mitä oikeasti opiskeltiin**, ei vain suunnitelmaa — luennot haetaan lukkarikoneesta (jo linjassa yllä olevan "toteutuneet opiskelut näkyvät" -kohdan kanssa, ei uusi päätös, vain sijainnin vahvistus).
2. **Sen alla itslearningistä haetut tehtävät/palautukset/deadlinet.**
   - **Uusi kysymys, ratkaistava ennen rakentamista:** voiko käyttäjä raahata tehtävänannon tiedoston itse siihen riviin jossa kyseinen palautus näkyy? Järkevä vastaus: kyllä — sama tiedostomekanismi kuin materiaalilla (§16.3, monta-moneen-suhde), kohteena tämä deadline-rivi eikä solmu. Ei rakennettu, ei speksattu tarkemmin.
3. **Kurssit** (jo rakennettu, §16.4/§5.2).
4. **Kertausjono kunkin kurssin alla.** Täpättävä lista solmuista jotka ovat unohtumisvaarassa. **Sung ei anna kiinteitä päiviä, mutta systeemin kannalta yksinkertaisin tavoiteväli on 1/3/7/21 päivää** — ei haittaa jos jollekin solmulle toteutuu vain 3 (lyhyttä) kertausta koko välillä, tavoite on suuntaa-antava, ei pakollinen täsmäys.

**Suunnittelun kolmiportainen kadenssi (uusi, 17.8.2026):**

1. **Kerran, koko syksylle:** täysi opiskelusuunnitelma tehdään kerralla niin että näkee miten kaikki mahtuu kalenteriin.
2. **Kerran 2 viikossa:** tarkistus tarvitseeko muuttaa jotain — lähinnä onko kaikki kurssit "ajan tasalla" vai pitäisikö ehdottaa jotain kurssia kevennettäväksi.
3. **Joka yö:** ajetaan uudelleenlaskenta joka näkee mitä oikeasti tehtiin (buusti käytetty vai ei, jäikö jotain kesken) — niin että aamulla on tuore suunnitelma valmiina herätessä. **Tämä on myös vastaus aiemmin avoimeksi jääneeseen kysymykseen "milloin päivä lasketaan uudelleen Boostin jälkeen" (A5_INTERAKTIOKARTTA.md kohta 4) — yöllä, ei käyttäjän paluun laukaisemana.**

**Lisäys (relay 16.8.):**

- **Live-tapahtuma (täytetty merkki) vs. oma opiskelu (avoin merkki).** Visuaalinen ero kalenteririvillä sen lisäksi että live huomioi matka-ajat (§8.1).
- **Opiskeluehdotukset väistävät uusia kalenterimerkintöjä.** Jos käyttäjä lisää uuden menon kalenteriin sen jälkeen kun päivä on jo suunniteltu, aiemmin sijoitettu opiskelupätkä väistyy eikä jää päällekkäin — sama periaate kuin §4.6:n sijoittelujärjestys, mutta koskee jälkikäteen tulevaa muutosta.
- **AUKKO — idea, ei päätetty:** manuaalinen ohitus kuormaväriin (käyttäjä voisi itse merkitä päivän raskaammaksi/kevyemmäksi kuin laskennallinen kuorma näyttää).

### 5.2 Kurssit — muotokieli RAKENNETTU (§16.4)

Kurssi avautuu haitarina. Otsikkorivillä nimi, vaihe ja **jäljellä-palkki**.

Jäljellä perustuu **menneisiin luentoihin ja palautettuihin tehtäviin**. Ei prosenttia näkyvissä, **vain palkki, eikä siihen tarvita selitettä**.

Kurssin sisällä:

- **kaikki kurssilla näkyvissä olevat deadlinet** (itslearningistä) — *deadline-lista ei vielä rakennettu*
- ladatut materiaalit **solmuihin jaoteltuina**
- **solmulista, jossa jokaisella solmulla on täppä "jää ylläpitoon"** (§7.5)
- **"+ Lisää kurssimateriaalia"** → vie Laituri-näkymään kurssikontekstilla (§8.3, §16)

**Kurssi lisätään Reitti-välilehdeltä.**

**Kurssidata menee tästä generaattorille.** Reitin kurssit ja generaattorin syöte ovat sama data.

**Uudet kentät (toinen keskustelu, 9.8.2026) — ei vielä rakennettu:**

| Kenttä | Arvot | Muuttuu |
|---|---|---|
| op-määrä | | ei |
| tavoite | läpäisy / kunnollinen osaaminen / perusta jatkolle | asetetaan alussa, pysyy |
| hoitotaso | täysi / kevyt / vain deadlinet | elää viikoittain |
| oma aikataulu | aihe/viikko-ohjelmasta; jos puuttuu, solmut jaetaan tasan jäljellä oleville viikoille | |

**Tavoite ja hoitotaso ovat eri kentät.** Tavoite = miksi tämä kurssi. Hoitotaso = kuinka paljon kapasiteettia juuri nyt. Tavoite määrää hoitotason oletuksen ja sen mikä kurssi kevenee ensimmäisenä kun viikko ei mahdu. Jos nämä olisivat sama kenttä, tiukalla viikolla joutuisi muuttamaan sitä mitä kurssi merkitsee — väärä kysymys väärällä hetkellä.

**Kevyt hoitotaso käyttää samoja vaiheita, vain vähempää niistä** (priming + yksi retrieval, ei kertausjonoa, ei overlearningia). Ei erillistä moottoria, ei erillistä datamallia.

**Hoitotaso on se vipu jolla kuormaan vastataan**, koska kurssimäärä ei ole vapaasti valittavissa. Muutettavissa kesken lukukauden: kurssi voi pudota kevyeksi siksi viikoksi kun kotona on kaaos ja palata takaisin.

**Lisäys (relay 16.8.):**

- **Solmut kanvaasilla pvm-järjestyksessä**, kukin omalla PACER-vaiheellaan; solmu avaa Miro-taulun solmun omasta kohdasta (jo linjassa §10.1:n kanssa).
- **Kortit kurssikanvaasilla nojaavat samaan muistiinpanokomponenttiin** kuin muualla sovelluksessa — ei erillistä korttityyliä vain kanvaasille.
- **"Tämä alkaa unohtua" -nappi (§5.3) opettaa käyttäjän oman henkilökohtaisen harvennustahdin** — ei kiinteää kaavaa, vaan kertyy siitä milloin käyttäjä oikeasti painaa nappia.
- **AUKKO — migraation/käsin lisätyn datan idempotenssi:** varmistettava ettei kurssidatan uudelleenajo ylikirjoita jo kertynyttä PACER-edistystä.
- **AUKKO — idea, ei päätetty: subcourse.** Miten käsitellä esim. Khan Academy -harjoittelu vs. varsinainen kurssi samassa rakenteessa — oma alikurssi vai osa samaa?
- **Katrin oma epävarmuus, ei tekninen kysymys:** soveltuuko Sung-metodi hyvin Low Code/No Code- ja Intro to Programming -tyyppisille kursseille yhtä hyvin kuin käsitteellisemmille (Tietoverkot ja tietoturva vaikuttaa lupaavammalta) — selviää vasta käytössä, ei ratkaista etukäteen.

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

**Lisäys (relay 16.8.):** työelämätaitojen lähteet tarkemmin eriteltynä — kurssi, harjoittelu, ohjaajan palaute, käyttäytymisdata. Visualisoinnissa taitojen nimet **sanapilvenä**, ei listana, kiristyvän verkon + syvenevän meren päällä.

### 6.3 Helmi

**Ei rakenneta ensimmäisellä kierroksella.** Helmi mietitään tarkemmin yhdessä Työelämä-näkymän kanssa, koska se kiinnittyy siihen.

**Täsmennys (relay 16.8.):** Kartan data on kahta tyyppiä — automaattisesti kertyvä (kurssit, käyttäytyminen) ja **helmi = itse kirjoitettu päiväkirjamerkintä**, käyttäjän oma huomio joka ei synny mistään mittarista.

---

## 6b. Loki-välilehti

**Ei rakenneta vielä kokonaisuudessaan.** Päätökset kirjattu 10.8. ettei niitä menetetä.

**Poikkeus: minimaalinen tietokohde on RAKENNETTU vaiheessa 1b** (§16.6). Syy: ankkureissa (§15.4.5) etusivulta lisätyn ankkurin laskeminen oli pois käytöstä koska sillä ei ollut minne laskeutua yksityisesti. Vaihe 1b toi **pelkän tietokannan landing-paikan** (`loki_merkinnat`, ei näkymää, ei editoria, ei välilehteä). Koko Loki — editori, selattava näkymä, Hytti-korttien korvaus — pysyy vaiheessa 5.

> **AUKKO — löydös 13.8.: erillinen `loki_merkinnat`-taulu voi olla tarpeeton.** Kun Laiturin RLS-korjaus (§8.3b) toi `laituri.visibility`-kentän (`'shared'`/`'private'`, per rivi), Katrin oma huomio: jos jaettu/yksityinen-näkyvyys rakennetaan kunnolla olemassa oleviin tauluihin (ankkurit, Laituri), **erillistä landing-paikkaa ei ehkä tarvita lainkaan** — yksityinen ankkuri/materiaali voisi vain jäädä samaan tauluun `visibility='private'`-merkittynä, RLS hoitaa loput. Tämä olisi yksinkertaisempi kuin uusi rinnakkainen taulu. **Ei vielä päätetty** — Code arvioitava: onko tämä toteutettavissa siististi (esim. ankkurien oma visibility-kenttä samalla periaatteella kuin Laiturissa) vai onko `loki_merkinnat` silti tarpeen jollekin tapaukselle jolla ei ole muuta luontevaa kotitaulua. Jos tämä osoittautuu paremmaksi, `loki_merkinnat` ja siihen kirjoittava reititys (§16.6) puretaan pois ja korvataan `visibility`-kentän yleistämisellä.

Nimi tulee design-kuvauksen teemasta *"merikartta ja laivan loki"*. Kartta oli olemassa, loki puuttui. Laivan loki on se mihin kirjoitetaan.

**Loki korvaa Hytti-kortit** (`hytti-kortti-view`, vanhassa speksissä "epämuodolliset muistiinpanot"). Ei rinnakkaista järjestelmää.

### Mitä Lokissa asuu

Pysyviä, otsikollisia muistiinpanoja joihin palataan. Ne eivät ole kaappausta eivätkä katoa käsittelyssä.

- luennolla syntyneet kysymykset joita jatkotyöstetään
- sijoitussuunnitelma, hakemukset ja muut pitkäikäiset omat tekstit
- kouluun liittyvät tiedot

**Loki on yksityinen eikä vaadi uutta oikeusjärjestelmää.** Yksityisyys tulee jo rakenteesta: toisen hyttiin ei ole näkymää lainkaan (`sung-metodi.md` §6d). Siksi esimerkiksi yllätyksen suunnittelu voi asua täällä.

> **Huomio salasanoista.** Jos Lokiin tallennetaan salasanoja, ne ovat tietokannassa selkokielisenä ja näkyvät kaikille joilla on pääsy kantaan. Se ei korvaa puhelimen salasanaholvia. Tietoinen valinta, ei suositus.

### Editori — jaettu, RAKENNETTU vaiheessa 1b (§16.2)

**Yksi editorikomponentti koko sovellukseen.** Sama pinta ja tuntuma joka paikassa, iOS-muistiinpanojen tapaan.

Editori avautuu monesta paikasta ja **kohde määräytyy siitä mistä sen avasi**:

| Mistä avattu | Mihin teksti menee | Elinkaari |
|---|---|---|
| Laituri | Laiturin muru | käsitellään ja katoaa |
| kurssin "+ Lisää materiaalia", solmu | siihen kohteeseen | elää kohteen mukana |
| Loki *(ei vielä olemassa)* | oma muistiinpano | jää, otsikollinen, löydettävissä |

**Opiskelumuistiinpanot eivät tule tänne.** Reference-vaihe on tarkennuksia kanvaasille (`sung-metodi.md` §6), ei erillinen teksti. Tätä ei muuteta.

### Sanelu ja ääni

- **Puheesta tekstiksi tulee ilmaiseksi.** iOS:n järjestelmäsanelu toimii minkä tahansa tekstikentän kanssa — kunnollinen editori saa sen rakentamatta mitään. **RAKENNETTU** (editori käyttää järjestelmän näppäimistöä, ei omaa sanelua).
- **Äänen tallennus tiedostona** on eri asia ja vaatii saman tallennuskerroksen kuin tiedostoliitteet. **Ei vielä rakennettu** — sillä ei ole kotia ennen Lokia.
- **Tarkistettava ennen sitoutumista:** äänen nauhoitus PWA:ssa iOS-Safarilla.

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

`viimeksi_kosketettu` ja `materiaali` **ovat jo olemassa** (sql/110, ajettu 10.8., todennettu). Puuttuvat vain §7.4:n kentät.

Äly **ei** generoi valmiita muistiinpanoja eikä käsitekarttoja. Rakenne on tyhjä kehikko kunnes käyttäjä täyttää sen — se vaiva *on* oppimisen mekanismi.

Jos poimintaa tai solmuja ei ole käsitelty **3 päivän kuluessa** kurssin lisäämisestä, systeemi muistuttaa.

### 7.2 Sillat

Silta etsii **lähes samanlaisia teemoja eri kursseista**. Tavoite on oppia **miten ne liittyvät toisiinsa** — esimerkiksi miten koodaamisen ja matematiikan funktiot liittyvät toisiinsa, mitä eroja niillä on, mitkä asiat kuuluvat yhteen, ja voiko sen visualisoida. Työtapa muistuttaa encoding-vaihetta.

**Sillat ovat koko syksyn keskeisiä käsitteitä.** Ne pitää olla opiskeltu **ennen kuin ne alkavat varsinaisen kurssin materiaaleissa.**

**Vaiheet sillalle:** PER-vaiheet (priming, encoding, reference) normaalisti. **Retrieval riittää 2 kertausta. Overlearningia ei tarvita.**

**Silta tulee opiskeluun vain päiväsuunnitelman kautta.** Se on ainoa reitti: sillalla ei ole omaa sivua eikä selattavaa listaa, joten jos generaattori ei nosta sitä, sitä ei opiskella koskaan.

> **Korjaus tarvitaan `sung-metodi.md` §11:een.** Sen lause *"Sillat eivät nosta solmua päiväsuunnitelmaan"* on virheellinen — jos sillat eivät nouse päiväsuunnitelmaan, ne eivät tule käsittelyyn lainkaan (ks. edellinen kappale). Sillan vaikutus kertausjonoon (solmu jää jonoon jos silta osoittaa tulevaan kurssiin) säilyy sellaisenaan — se on eri asia. **Ei vielä korjattu `sung-metodi.md`:ään.**

**Silta on oma tietue** (`taitosolmut` jää). `taitosolmu_viittaukset` kertoo mihin solmuihin silta liittyy.

**Niitä 62 koodaussolmua ei herätetä henkiin.**

> **RATKAISTU 16.8.2026 — sillasolmu-moottorin ja tiedostoputken irrallisuus, molemmat aiemmat AUKOT tässä kappaleessa.** Elävä testi (Katri latasi PDF:n, siltahaku ei huomioinut sitä ollenkaan) paljasti juuri sen minkä 13.8. AUKKO ennusti. Ratkaisu: **vanhaa `materiaali`-kenttää EI poistettu** (vaihtoehto (a) kahdesta silloin tarjotusta) — moottori (`kokoaAktiivistenKurssienMateriaali()` script.js:ssä, ja palvelinpuolen kaksonen `gatherActiveCoursesForOwner()` `api/aly-nightly.js`:ssä) lukee nyt YHDISTETYN materiaalin: vanha kenttä + kaikki kurssiin tuodut `laituri`-rivit (`materiaali_kurssi_id`, sql/117) yhteen liitettynä, per tuotu rivi katkaistuna 3000 merkkiin ettei promptin koko karkaa käsistä. Solmutason (per-`opinto_aiheet`) rakeisuuteen kytkentä — alkuperäisen AUKKO-ehdotuksen tarkka muoto — jää edelleen vaiheeseen 2, mutta karkeampi "koko tuotu materiaali per kurssi" -taso riittää nyt siihen että tiedostontuontiputki EDES vaikuttaa siltahakuun. Ks. `muistiinpanot.md` "Materiaalilista + siltasolmujen aikapohjainen eskalaatio" 16.8.2026.

**Siltatunnistuksen ajoitus — RAKENNETTU 16.8.2026 (Katrin täsmällinen määrittely, ei arvattu):** ei AI-kutsua joka kerta ja ei toistuva kello. Per kurssi kertaalleen: kun kurssi on ollut aktiivinen `sillat_auto_paivia` päivää (asetukset, oletus 7, editoitavissa) ilman että YHTÄÄN siltahakua (käsin tai auto) on tehty sen lisäyksen jälkeen, JÄRJESTELMÄ tekee yhden AI-kutsun kaikista aktiivisista kursseista kerralla. Muina aikoina pelkkä ilmainen muistutus näkymässä, ei AI-kutsua ("jos 4 kurssia lisätään, tapahtuu korkeintaan 4 kertaa — ei toistuvasti"). Tila `opinto_kurssit.silta_katsottu_at` (NULL = ei koskaan tarkistettu). Tulos odottaa AINA käsin hyväksyntää samalla esikatseludialogilla kuin manuaalinenkin haku ("äly ehdottaa, ihminen kuittaa" koskee automaattista ajoakin) — `silta_ehdotukset_odottavat`-taulu (sql/119). Kytketty olemassa olevaan `aly-nightly.js`-croniin, ei uuteen Vercel-funktioon (12 funktion Hobby-katto, ks. §8.3b). Ks. `muistiinpanot.md` 16.8.2026 tekniselle kuvaukselle.

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

**Huomioväri 1–2 pv -rivillä (päätetty 17.8.2026): `--vaara`.** Tähän yhteen, tarkasti rajattuun kohtaan (§4.1:n deadline-rivi, tehtävä 1–2 pv päässä) saa käyttää `--vaara`-väriä. **Lisäys 17.8.: koska Katrin oma kalenteripunainen (`#D32F2F`) mitattiin lähes identtiseksi `--vaara`:n kanssa (ks. §4.1), tämä rivi tarvitsee myös ei-väripohjaisen merkin (ikoni/paksu reunaviiva)** — muuten kahden identtisen punaisen esiintyessä samalla Reitti-näkymällä merkitys ei erotu pelkästä väristä.

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

- **PERO** on vaiheistus: priming → encoding → reference → retrieval → overlearning. Kenttä `pero_vaihe`.
- **PACER** on tietotyyppiluokittelu: procedural, analogous, conceptual, evidence, reference. Kentät `pacer_paatyyppi` + `pacer_sivutyyppi`.

**V1 tukee tietotyypeistä vain proceduralin, analogousin ja conceptualin.**

- Lyhyet vaihekuvaukset säilyvät
- **Konkreettinen ohje syntyy ristitulosta vaihe × tietotyyppi.** Sama vaihe tuottaa eri ohjeen riippuen siitä minkälaista tietoa solmu sisältää: konseptuaalisessa encodingissa tehdään **GRRINDE-kartta**, proseduraalisessa käydään ensin läpi **valmiiksi ratkaistuja esimerkkejä**
- Vaiheen koko ohje näkyy kerralla, mutta **vain käsillä oleva vaihe on täpättävänä**
- **Ydintoiminto on ohje, ei ehdotus.** Ohje generoidaan kerran per solmu ja vaihe, tallennetaan riviksi, eikä sitä voi kytkeä pois
- **Systeemi ei koskaan päätä vaihetta käyttäjän puolesta**
- Suurin osa vaiheensiirtymistä **ei tarvitse älyä lainkaan**: priming→encoding on täppä, encoding→retrieval on GRRINDE-täpät, retrieval→kertaus on välilaskentaa. Äly tarvitaan vain nopeaan vilkaisuun joka auttaa liikkumaan encodingin ja retrievalin välillä, tarvittaessa edestakaisin
- **Kehote** ("siirrytäänkö seuraavaan vaiheeseen?") näkyy **kun solmu avataan, ei istunnon lopussa**
- **Vain tämä kehote-mekanismi** voidaan kytkeä pois asetuksista
- **Solmu on valmis** kun priming (käyttäjän täppä), encoding, retrieval × kertaa (oletus 3) ja reference (käyttäjän täppä) on tehty. **Overlearning on vapaaehtoinen.** Valmistuminen ei ole lopullinen — retrieval-kierroksia saa palauttaa lisää
- **Tietotyypin luokittelu:** äly ehdottaa tyypin kerran kurssin sisääntulossa, mutta **käyttäjä ei kuittaa tyyppiä vaan ohjeen**. Tyypin voi vaihtaa kesken kaiken eikä vaihe nollaudu

**Ei vielä rakennettu** (vaihe 2, §13).

**Täydennykset 9.8.2026 (toinen keskustelu):**

- **Uudet kentät:** `retrieval_kierrokset` (kuinka monta kierrosta tehty), `perustussolmu` (boolean). `pacer_sivutyyppi` on jo olemassa v1:ssä muttei käytössä — konsistentti nykyisen §7.4:n `pacer_paatyyppi`/`pacer_sivutyyppi`-jaon kanssa.
- **Perustussolmut:** 1–3 lukukaudessa merkittävissä. Näiden päälle tulevat kurssit rakentuvat, ja ne saavat enemmän aikaa — tämä on se poikkeus jonka takia äly saa antaa yhden solmun viedä tavallista enemmän kapasiteettia (ks. §7.6 Älyn käyttö).
- **Väärä tyyppi paljastuu oireesta** ("tämä ohje ei sovi tähän"), ei taksonomian arvioinnista.
- **Tyypin vaihdos merkitään muistiin.** Priming on tyypistä riippumaton, encodingissa tehty työ ei katoa vaihdoksessa. Toistuvat vaihdokset kertovat että luokittelukehote kaipaa korjausta (data: §18).

**Täydennys 17.8.2026 — Miro proseduraaliselle/analogiselle vs. konseptuaaliselle.** Vahvistettu (Katri): Miro-taulu on käytössä konseptuaaliselle ja analogiselle tyypille. Proseduraaliselle (matikka/koodaus/fysiikka-tehtävät) EI — korjattu encoding/procedural-ohje (sql/125) ei enää edes mainitse karttaa, se on "sovella todellisuudessa" -tyyppinen. **Mihin proseduraalinen työ sitten menee:** ei omaa uutta editoria — tehtävä ratkaistaan paperilla/koodiympäristössä kuten flashcardit-päätöksessä (§7.6-alue), tulos raportoidaan Satamaan lyhyenä täppäyksenä/tekstinä, ei täyttä ratkaisua tallenneta.

**"Jäin jumiin kohtaan X" — proseduraaliselle jo olemassa oleva mekanismi.** Katrin kysymys vaikeuden kirjaamisesta ratkeaa jo rakennetulla `opinto_jumi_merkinnat`-taulukolla ("En pääse alkuun" -nappi, §4.9, `aika_kaytetty_s` lisätty tänään aiemmin) — sama mekanismi toimii tässä, ei tarvitse uutta.

**Overlearning-kutsu, sijainti (uusi, 17.8.2026):** koska overlearning on vapaaehtoinen ja tulee vasta kun solmu on jo "valmis" (priming+encoding+retrieval×kertaa+reference tehty), luonteva paikka lyhyelle kutsulauseelle ("jos haluat haastaa itseäsi...") on juuri siinä valmistumishetkellä — kutsuvana, ei velvoittavana. Ei tarkkaa sanamuotoa vielä, vain sijainti.

Solmu **poistuu retrieval-vaiheesta** kun jompikumpi täyttyy:

- kurssi päättyy, **tai**
- **3 peräkkäistä kertausta** joissa käyttäjä on muistanut olennaisimmat asiat

**Kertausvälien ei tarvitse olla tasaisia.**

**Ylläpidossa** väli pitenee: noin **21–28 pv** ensimmäisen ylläpitokertauksen kohdalla, ja siitä eteenpäin **päivien määrä kerrotaan 1,5:llä** joka kertauskerralla.

**Käyttäjä valitsee itse mitkä solmut jäävät ylläpitoon.** Valinta tehdään **kurssin sisällä, siellä missä solmut ovat** (§5.2): jokaisen solmun rivillä on täppä *"jää ylläpitoon"*.

**Kertausjonossa on erillinen boolean-kenttä** (`kertausjonossa`), eriytetty `pero_vaihe`:sta. Solmu voi olla `valmis` ja silti kertausjonossa yhtä aikaa. Vanhat `yllapito`-rivit migroitiin `pero_vaihe = 'retrieval'` + `kertausjonossa = true` (sql/111, ajettu).

### 7.6 Älyn käyttö (uusi osio, toinen keskustelu 9.8.2026) — ei vielä rakennettu

Äly kutsutaan **täsmälleen kolmessa kohdassa:**

1. materiaalin sisääntulo
2. ohjeen generointi solmulle ja vaiheelle — **kerran, tallennettuna** (§7.4)
3. sisällöllinen vertailu (Miron recall-kartta vs. materiaali, §10.1)

Kaikki muu on laskentaa. **Suurin osa vaiheensiirtymistä ei tarvitse älyä lainkaan:** priming→encoding on täppä ja laskuri, encoding→retrieval on GRRINDE-täpät, retrieval→kertaus on välilaskentaa.

**Ohje generoidaan kerran ja tallennetaan riviksi.** Jos se generoitaisiin joka avauksella, kustannus karkaa ja ohje muuttuu käsiin kesken vaiheen.

**Kohta 3 on ainoa toistuva ja ainoa jonka voi kytkeä pois** (§7.4:n kehote-asetus). Ohjeet eivät katoa silloinkaan — ne ovat ydintoiminto.

**Äly huomioi aikataulun** eikä saa jäädä hinkkaamaan yhtä solmua kun muuta on menossa. **Poikkeus: perustussolmut** (§7.1) saavat viedä tavallista enemmän kapasiteettia.

**Harjoitustehtävien lähteet järjestyksessä:** kurssin omat tehtävät → ulkoiset lähteet (esim. Khan Academy) → Sataman näyttämä valmis prompti jonka käyttäjä kopioi Copilotille. Kolmas ei vaadi API-kutsua eikä maksa mitään. Promptipohja on rivi kannassa per (tyyppi, vaihe), joten automatisointi myöhemmin ei vaadi rakennemuutosta.

**Huomio 17.8.2026 — matikkamerkintä promptipohjissa, päivitetty samana päivänä.** Kolmannen lähteen (kopioitava Copilot-prompti) ongelma erityisesti proseduraalisille/matemaattisille solmuille: yleiskäyttöinen AI kirjoittaa murtoluvut/potenssit/juuret oletuksena koodimerkinnällä (`x**2`, `sqrt(x)`), ei tavallisella matikkamerkinnällä. **Katrin elävä kokemus: pelkkä sanallinen pyyntö ("kirjoita tavallisella matikkamerkinnällä") ei ole luotettava — vaatinut jopa kymmenen uudelleenyritystä.** Ei siis nojata siihen, että Copilot totteleen muotoiluohjetta.

**Ratkaisu: pyydä rakenteellista muotoa, ei vapaamuotoista.** Promptipohja pyytää matemaattinen sisältö LaTeX-merkinnällä (`$...$`) — tätä muotoa yleiskäyttöiset AI:t tuottavat huomattavasti luotettavammin kuin epämääräistä "lukukelpoista" merkintää, koska se on tarkkaan määritelty formaatti eikä tulkinnanvarainen pyyntö. Satama renderöi liitetyn tekstin **KaTeX**illä (kevyt, ilmainen, client-side kirjasto, ei API-kutsua — sama "ei maksa mitään" -periaate kuin §7.6:n kolmannessa lähteessä muutenkin). Jos Copilot silti joskus jättää LaTeXin pois, tulos on raakaa `$x^2$`-tekstiä eikä sekoitettua koodimerkintää — harvinaisempi ja lievempi virhetilanne kuin nykyinen. Ei rakennettu vielä (odottaa koko promptipohja-mekanismia, kuten yllä).

### 7.7 Menetelmämateriaali ja Learning Framework Extraction Course (relay 16.8., ei vielä rakennettu, ei vielä konseptoitu loppuun)

**Menetelmämateriaali (PACERin/Sungin oma materiaali) on piilotettu "kurssi" Hytissä**, suodatetaan pois tavallisista kurssilistauksista (§5.2, §7.1). Tekninen syy: sama sisääntuloputki (materiaali → äly poimii → solmuiksi) toimii sille jo, ei tarvita rinnakkaista rakennetta — vain listauksesta piilotus.

**Menetelmä (miten opiskellaan) ja kurssi (mitä opiskellaan) ovat eri asioita eivätkä koskaan sekoitu.** Tehtäväkohtaiset ohjeet (§7.4:n vaihe×tietotyyppi-ristitulo) generoidaan menetelmämateriaalia vasten — menetelmämateriaali on se tietopohja josta ohjeteksti syntyy, ei itse opiskeltavaa ainesta millekään kurssille.

**Tavoite on opettaa käsitekarttamaista ajattelua lineaaristen muistiinpanojen sijaan** — sama periaate kuin §10.1:n "ei kaunis kopio kirjasta, ryhmittely/vertailu/yhteyksien etsintä ON se oppiminen", sovellettuna nyt myös itse menetelmän oppimiseen.

**Idea, laajempi ja EI vielä konseptoitu loppuun — "Learning Framework Extraction Course":** kurssityyppi joka opettaisi menetelmän sekä käyttäjälle että Satamalle itselleen samanaikaisesti; jäisi arkistoon mutta sen tietomalli (vaiheiden välinen riippuvuusverkko) jäisi pysyväksi osaksi Satamaa. Jos rakennetaan, Sataman pitäisi osata: tunnistaa missä vaiheessa käyttäjä on, ehdottaa harjoituksia, arvioida osaamista (ymmärrystä, ei sanamuotojen täsmäystä), ja löytää epäonnistumisten juurisyitä. **Tärkein puuttuva tieto on vaiheiden VÄLINEN riippuvuusverkko**, ei yksittäiset vaihekuvaukset.

**AUKKO — vaihemäärä epäselvä (7 vai 5):** ei rakenneta ennen kuin tämä on konseptoitu loppuun `sung-metodi.md`:n pohjalta. Idea myös auki: kurssin sisältönä voisi olla itse Sung-metodi.

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

Integraatiotapa: **ICS-vienti**. Jos tehtävien nimiä ja kuvauksia ei saa, käyttäjä liittää kurssisivun sisällön Laituriin ja äly poimii ne (§8.3).

### 8.3 Materiaalin sisääntulo Laiturin kautta — RAKENNETTU (§16)

Kurssin sisällä oleva **"+ Lisää materiaalia"** vie Laituri-näkymään, johon materiaalit tiputetaan.

**Kurssi tulee kontekstina napista.** Kun materiaali lisätään kurssin sisältä, putki **tietää jo mihin se menee**:

- kurssin nimen kirjoittaminen tekstikenttään jää pois
- tunnistusheuristiikka joka arvaa onko Laiturin muru kurssimateriaalia jää pois

Jäljelle jää **vain solmujako**: äly ehdottaa miten materiaali jakautuu kurssin solmuihin, ihminen hyväksyy.

Materiaalit **eivät jää näkyville Laituriin** — `piilota_laiturista`-lippu, sama mekanismi kaikilla kohdetyypeillä.

**Tuetut tyypit:** ppt/pptx, pdf, kuvat, koodi/teksti (py/js/json/md/csv ym.), linkit videoihin. **Ei:** doc/docx (kopioidaan tekstinä), zip-arkistot, `.ipynb` (auki, ks. §11).

**Videot kaksitasoisesti:** jos videolla on valmis kopioitava transkripti, käyttäjä kopioi sen tekstinä — ei kuluta älyresursseja. Jos ei ole, käytetään älyä purkuun. Puhtaasti visuaalinen sisältö ei tavoitu — hyväksyttävä rajoite.

**Vapaamuotoinen muokkaus ("varaa enemmän aikaa teemaan X") ei ole rakennettu.**

> **RATKAISTU 16.8.2026 (Katrin päätös, täsmennetty) — `piilota_laiturista`-kaksoiskäytön ristiriita.** Katrin oma täsmennys `piilota_laiturista`:n alkuperäisestä, yleisestä tarkoituksesta: se on **yleinen "ei tarvitse näkyä Laiturissa juuri nyt" -täppä**, ei sama asia kuin "valmis/käsitelty" — esimerkki: vahdittu-listalle lisätty "muuta pankkitilin nostorajaa" voidaan täpätä pois Laiturin näkyvistä heti, vaikka se ei ole tehty — se ponnahtaa esiin myöhemmin vahdittu-lepo-mekanismin kautta (§ristiriita eri asia). Sama malli koskee jo teema/lista/hytti-kohteita (`koti_tyyppi`, sql/087): kun kohde tunnetaan, `piilota_laiturista` asetetaan todeksi HETI, ei vasta jonkin erillisen "valmis"-tilan jälkeen.
>
> **Juurisyy oli siis se että kurssimateriaali EI noudattanut tätä samaa, jo olemassa olevaa mallia.** `e7b55b0` asetti `piilota_laiturista`:n todeksi vasta AI-jäsennyksen jälkeen (käytti sitä väärin "käsitelty"-statuksena), jolloin odottavat kurssimateriaalit — toisin kuin kaikki muut kontekstuaaliset kohteet — jäivät näkyviin Laiturin yleiseen listaan siihen asti.
>
> **Korjaus: yhdenmukaista kurssimateriaali muiden kohdetyyppien kanssa.** `piilota_laiturista` asetetaan todeksi HETI kun materiaali lisätään kurssikontekstista (samalla kirjoituksella kuin `materiaali_kurssi_id`), täsmälleen kuten teema/lista/vahdittu/hytti jo tekevät. Kurssisivun oma "⏳ odottaa / ✓ käsitelty" -tila (§7.2, §11) tarvitsee OMAN erillisen kentän (esim. `kasitelty` boolean tai päätellään siitä onko solmujako tehty) — ei enää lainaa `piilota_laiturista`:a siihen tarkoitukseen. **Ei vielä korjattu koodissa** — relayattava Codelle.
>
> **Liittyvä, samalla vahvistettu:** arkistoitu kurssi ei enää laukaise muistutuksia/hälytyksiä (esim. §7.1:n "3 päivän käsittelemättä" -muistutus) — looginen, Katrin vahvistama 16.8. Tämä on ERI asia kuin §10.2:n vika #3 (arkistoitu kurssi poistaa kertausjonon solmut moottorista kokonaan, joka on edelleen ei-toivottu ja korjaamaton) — muistutusten sammuminen on haluttua, kertausjonon katoaminen ei.

### 8.3b Opittua vaihe 1b:n rakentamisesta ja elävästä testauksesta (12.–13.8.)

- **Kurssikonteksti on vahvistettu oikea prioriteetti**, ei vain oletus. Todellinen käyttö kulkee lähes aina "+ Lisää materiaalia" -napin kautta, kurssikontekstilla. Yleinen Laituri-triage on olemassa mutta harvinaisempi reitti.
- **Jaettu vs. yksityinen on yleinen periaate, ei vain ankkuri-kohtainen sääntö.** `loki_merkinnat`-ratkaisu (§6b) koskee mitä tahansa jaettua pintaa (Laituri, kauppalista, mahdolliset tulevat). Tila tallennetaan luontihetkellä (`lahde_jaettu`), ei lueta uudestaan käyttöhetkellä, koska jaettu/yksityinen-tila on käyttäjän muutettavissa.
- **Editorin kolme muistettavaa bugia** (löytyi elävässä testauksessa): kontrasti kirjoitushetkellä, muokkaus kursorilla ei koko rivin valintana, rivitys pitkälle tekstille. Sama virhe toistui 7 paikassa ennen kuin korjattiin kerralla kaikkialle — tarkista nämä aina kun uusi tekstikenttä rakennetaan.
- **Yksityisyysvuoto löytyi 13.8:n kirjauksessa, mutta EI TOSIASIASSA korjattu silloin — korjattu vasta 16.8.** Tämä rivi väitti aiemmin virheellisesti menneessä aikamuodossa että `laituri.visibility` oli jo lisätty ja kolme riviä korjattu — git-historia todistaa ettei näin ollut: ensimmäinen commit joka koskaan koski `laituri.visibility`-saraketta tai sql/117/118-tiedostoja on 16.8. (`177ce7f`, `e7b55b0`), ei 13.8. Kirjaus oli siis suunnitelma/aikomus joka kirjattiin toteutuneena ilman että se koskaan ajettiin kantaan — juuri se virhe jota `muistiinpanot.md`:n oma sääntö "migraatiokieli ei mennyttä aikamuotoa ennen ajoa" varoittaa. Todellinen tapahtumaketju: `laituri`-taulun RLS oli auki molemmille käyttäjille (sql/004, tarkoituksellista Laiturin ydinluonnetta), joten kurssimateriaali näkyi Juhan Laiturissa ennen luokittelua — Katri löysi tämän uudelleen elävässä testauksessa 16.8. Lisätty `laituri.visibility` (`'shared'`/`'private'`, mirroroi `lists.visibility`, sql/118), kurssimateriaali kirjoittaa `'private'`. Kolme jo tallennettua riviä korjattiin retroaktiivisesti kannassa MCP:llä 16.8. Ks. `muistiinpanot.md` "Kurssimateriaalin kolme bugia elävässä testauksessa" 16.8.2026.
- **Offline-jono ei kata Laituria.** Se kattaa vain kauppalistan (`tuotteet`).
- **Vaakatila puuttuu kokonaan**, Laituri kärsii kapeudesta eniten.
- **Infra-rajoite:** Vercel Hobby-tason 12 serverless functionin raja. Tarkista funktioiden määrä ennen uusia palvelinreittejä.
- ~~Sillasolmu-moottori ja tiedostoputki eivät vielä puhu keskenään~~ **RATKAISTU 16.8.2026** — ks. §7.2:n oma RATKAISTU-merkintä (karkealla kurssitasolla korjattu, hienompi solmutason kytkentä jää Vaihe 2:een tietoisesti, ei enää AUKKO).

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

**Haptiikka sinne mitä Satama haluaa käyttäjän tekevän** — ei joka paikkaan: boost-napit, boostin rullan jokainen arvo, generoidut tehtävät, se mikä tehtävästä aukeaa. **Ei navigaatiossa.**

**Liveluennon merkintä:** 6 px pyöreä piste `--vaara`, hidas hehku, teksti `LIVELUENTO`. Ainoa paikka Hytissä jossa `--vaara` esiintyy ilman ristiriitaa tai huolilippua.

**Liquid glass -efekti (kosketettavan pinnan lasi/hämärrys) saa ulottua laajemmalle** kuin alun perin, kunhan se pysyy loogisena sääntönä: näkyy siellä missä jotain oikeasti painetaan tai korostetaan, ei koristeena kaikkialla. (Vahvistettu Ruorin yhteydessä, §15.)

**Täydennykset — Visuaalinen suunta (toinen keskustelu 9.8.2026):**

- **Merikartta/loki-metafora tarkentuu kirjaimelliseksi lokinäkymäksi:** ajatuksena rivi riville etenevä loki jossa syvyys (väri, `--syvanne`-suuntaan) kertoo kuinka pitkälle asia on viety — ei erillinen kortti + kalenteririvi -rakenne vaan yksi yhtenäinen loki jossa nykyinen/käynnissä oleva asia näyttäytyy Nyt-korttina. **Tämä on ristiriidassa §4.1:n nykyisen kortti+kalenteririvi-rakenteen kanssa** — merkitty jo §4.1:n AUKKO-lohkona, ei toisteta tässä uudelleen.
- **Messinki/sinappi-erottelu vahvistuu käytännössä:** messinki = kaikki kosketettava, sinappi = pelkkä koriste, ei koskaan tap-kohde. Sääntö ei ole muuttunut, mutta elävä käyttö on osoittanut sen tärkeäksi pitää tiukasti — sekoittuminen näkyy heti käyttäjälle vääränä signaalina.
- **Kalenteri-/identiteettivärit ratkaistu 17.8.2026, ks. §4.1.** (Vanha huomautus tästä koski "sinistä"/"persikkaa"/punaista avoimina kysymyksinä — vanhentunut, korvattu §4.1:n mitatulla ratkaisulla.)
- **Mockup-tiedostojen (esim. `satama-ruori-header-v2.html`) hex-arvot ja `--font-ui` ovat paikanpitäjiä**, ei lopullisia päätöksiä — Coden ei pidä olettaa niitä sellaisenaan lopullisiksi ilman erillistä vahvistusta, vaikka tiedosto muuten onkin sitova visuaalinen speksi (§0).
- **Liike (relay 16.8.):** siirtymät "veden alla" -tuntuisia, 500–850ms — hitaampia kuin tavallinen UI-animaatio, tarkoituksella. Haptiikka vain aidosti kosketettavissa kohdissa (jo §9:n sääntö, ei uusi).

---

## 10. Kanvaasi ja korjattavat viat

### 10.1 Kanvaasi — upotettu Miro

**Omaa kanvaasia ei rakenneta.**

**Kaksi taulua, päätetty 17.8.2026 (korvaa aiemman "yksi taulu kaikelle" -mallin):**

- **Board A — Encoding + Overlearning.** Kaikki kurssit samalla taululla, kukin kurssi omana frameworkina/Framena. Kurssin eri solmuista rakennetaan yhtä isoa käsitekarttaa koko kurssista. Kukin solmu avautuu siitä kohdasta jota on tarkoitus työstää. Overlearning täydentää SAMAA kurssin Framea laajemmalla näkökulmalla (ei erillistä kohdetta, jo linjassa aiemman overlearning-päätöksen kanssa).
- **Board B — Retrieval.** Kaikki kurssit samalla, mutta ERI taululla kuin encoding. Jokainen retrieval-kierros saa oman tyhjän Framen (sung-metodi §6d), nimeämiskäytäntö `{kurssi} · {solmu} · kierros {n}` jotta kierrokset pysyvät löydettävissä hakemalla kun niitä kertyy paljon (ei erillistä visuaalista ryhmittelyä tarvita boardin sisällä, nimeäminen riittää).
- **Korjaus 17.8.2026 — Helmi EI ole Miro-board.** Aiempi "helmiboard on oma erillinen taulunsa" -kirjaus luki harhaanjohtavasti "taulu" kirjaimellisena Miro-boardina. Helmi toimii kokonaan Satamassa, käyttää samaa hiljattain päivitettyä jaettua editoria (§16.2/§6.3) kuin muukin teksti — ei Miro-upotusta, ei omaa boardia. Myöhemmin (ei nyt) tulee kerros joka yhdistää helmiä muihin teemoihin/helmiin — sekin rakennetaan Sataman omana rakenteena, ei Miron kautta, ellei erikseen toisin päätetä silloin.
- **Miron ilmaistasolla on siis 3 boardia käytettävissä, tässä käytössä vain 2 (A, B).** Kolmas jätetään TIETOISESTI varaan — ei täytetä millään nyt, jos myöhemmin ilmenee hyvä käyttötarkoitus.
- Muokkausloki toimii ajanoton varmistuksena (§4.3), luetaan kummastakin taulusta tarpeen mukaan.

**Muokkaus tapahtuu Satamassa**, ei ulkoisessa Mirossa katselukuvana.

**Tämä korvaa olemassa olevan canvas-editorin** (`taitosolmut.kasitekartta`) — se jää käyttöön kunnes Miro-upotus on olemassa, sen päälle ei rakenneta mitään uutta.

**Ei vielä rakennettu** (vaihe 5, §13).

**Täydennykset 9.8.2026 (toinen keskustelu):**

- **Retrieval-kanvaasi: oma Frame per kierros.** Hytistä nappi → Miro sen solmun recall-Frameen → tallennus näkyy Hytissä. Jokainen kierros alkaa **täysin tyhjältä** — tyhjyys on free recallin pointti. Vanhoja ei poisteta: kierros 1 ja kierros 3 voi asettaa vierekkäin ja nähdä mitä on kertynyt.

  **Vastaus Katrin 17.8. kysymykseen ("pitääkö rakentaa oma editori"):** ei tarvitse. Tämä Frame-per-kierros-malli ratkaisee juuri sen ongelman jota hän epäili — ei tarvitse manuaalisesti tyhjentää yhteistä taulua joka kierroksella, koska jokainen kierros SAA oman uuden Framen automaattisesti. Ei oma Satama-editori — sama Miro-upotus, vain uusi Frame per kierros. (Tarkennus: taulu tässä on Board B, retrieval-taulu — ks. kaksi-taulu-päätös yllä.)
- **Yksityisyys ratkeaa olemassa olevalla rakenteella.** Kohdevalinta ohjaa suoraan omaan hyttiin eikä toisen hyttiin ole näkymää — recall-kartta ei kulje jaetun näkymän kautta missään vaiheessa.
- **Sisällöllisen vertailun raja:** Miron API palauttaa tekstilaatikoiden sisällön, joten äly näkee mitkä käsitteet muistettiin ja voi verrata materiaaliin. Se **ei näe piirroksia eikä symboleja**. Käytännössä riittää: kattavuus on se mitä siirtymäpäätökseen tarvitaan, ja rakenteen laadun käyttäjä täppää itse.

  **Tarkennus 17.8.2026 (Katrin havainto, tarkistettu Miron dokumentaatiosta):** yllä oleva "ei näe kartan rakennetta" on tarpeettoman varovainen. REST API v2:n jokainen item sisältää `position` (x/y) ja `geometry` (leveys/korkeus/kierto), ja connectorit palautetaan `startItem`/`endItem`-viittauksin — jos käyttäjä piirtää yhteysviivan kahden käsitteen välille, se on luettavissa API:sta, ei vain irrallinen tekstisisältö. Sijaintiklusterointi + connector-data antaisivat todellisen rakennesignaalin pelkän tekstivastaavuuden lisäksi. **Ei vielä hyödynnetty päätöksenteossa** — vaatisi oman harkinnan kuinka paljon tälle antaa painoa vs. käyttäjän oma täppäys. **Tunnettu varaus:** Miron yhteisöfoorumilla raportoitu bugi, jossa "card"-tyyppiset itemit eivät palauta position/geometry-tietoa REST API:n kautta — testattava oikealla item-tyypillä (teksti/sticky note vs. card) ennen kuin tähän nojataan.

**Lisäys (relay 16.8., päivitetty 17.8.):** kurssidatalle Board A + Board B (ks. kaksi-taulu-päätös yllä, korvaa alkuperäisen "yksi jättiboard" -kuvauksen). Helmi EI ole Miro-board (ks. korjaus yllä) — kolmas ilmaistason board pysyy tarkoituksella käyttämättömänä. **Arkistointi on aikapohjaista** (§16.3:n "poistoa ei mietitä ennen kuin pari vuotta kurssin päättymisestä" -periaate koskee Miro-tauluja samoin) — ei ajankohtaista ennen kuin ensimmäinen kurssi on ollut valmis ~2 vuotta.

### 10.2 Korjattavat viat

1. ~~Moottorin ehdoton riippuvuus siltatauluihin~~ — **JO KORJATTU**, todennettu koodista.
2. Ylläpidon väli ei pitene (§7.5)
3. Arkistoitu kurssi poistaa kertausjonossa olevat solmut moottorista kokonaan — vastoin haluttua
4. Raskaana päivänä moottori rajaa ehdotukset yhteen; se yksi paikka suosisi kertausta uuden aloittamisen sijaan (§7.3 kuormataulukko)

`COPILOT.md` on agentin ohjeistus — pidä ajan tasalla, ks. §0.

**Migraatioiden tila:** sql/111 ja sql/117/118 ajettu. **sql/113 (vanhan `vaihe`-sarakkeen pudotus) ei ajeta** — vanha sarake on paluutie eikä sen säilyttäminen maksa mitään.

---

## 11. Aukot

**Kaikki alkuperäiset (9.8.) aukot on ratkaistu.** Alla kaksi kategoriaa uusia: ensimmäiseltä rakennuskierrokselta pois jätetyt (tarkoituksella, ei kiireellisiä), ja elävästä käytöstä nousseet avoimet kysymykset.

**Ensimmäiseltä rakennuskierrokselta jätetään pois:**

- Reitti-välilehti kokonaisuudessaan **paitsi** kurssien lisäys ja materiaalin sisääntulo (nyt tehty)
- Kartan Työelämä-näkymä
- Helmi
- itslearning-integraation laajennus
- Sillan mahdollinen lisäkertaus
- Vapaamuotoinen muokkaus materiaalin poiminnassa

**Matikkasuunnitelman pilkkomiseen ei kosketa.**

### Avoimet kysymykset elävästä käytöstä (13.8. →)

Kokoontuu näkymä kerrallaan. Laituri ensin, Asetukset ja Kalenteri seuraavaksi.

**Laituri — päätetty 13.8.:**

- **Jatkosäie: pysyy manuaalisena.** Ei automaattista valumista Varastoon. Toistaiseksi käsin asetettu koti toimii, ja siitä eteenpäin yhden säikeen muru valuu asetettuun kotiin. **Mutta:** Laituriuudistuksessa pitää selkeyttää itse valintakohtaa (kodin asettamisen UI on tällä hetkellä epäselvä) — tämä on oma pieni UX-siivous, ei uutta logiikkaa.
- `.ipynb` ja zip-tiedostotyypit: **rakennetaan varoiksi, jos ei ole iso työ.** Code arvioi ensin laajuuden (samaan tapaan kuin pptx aiemmin) ja rakentaa jos halpaa. `.ipynb`-ehdotus: puretaan vain koodi+markdown-solut, tulokset (usein base64-kuvia) pois. Zip: pura arkisto ja käsittele sisältö tiedostoina yksitellen samalla putkella kuin muutkin tyypit.
- **Vaakatila: rakennetaan Laiturille JA Muistilapuille**, ei vain Laiturille. Laajuus laajenee hieman aiemmasta arviosta, mutta molemmat kärsivät samasta kapeudesta.
- **Offline-jono: kriittisin Laiturille ja Muistilapuille.** Nykyinen jono kattaa vain kauppalistan — tämä on seuraava prioriteetti kun jonoa laajennetaan.
- Onko Laiturissa muuta oletuksena jaettua sisältöä joka pitäisi olla yksityistä (RLS-löydöksen 13.8. jälkeen ei tarkistettu systemaattisesti kaikkea, vain se yksi kohta) — **yhä auki.**

**Ruori:**

- §4.6-tyyppinen älyn ehdotusten kortti (sillasolmu-kandidaatit) ei täysin vastaa tavallisten rivien ulkoasua — kevyt korjaus tehty, täysi ⚓/⋯-rakenne siirretty myöhempään, Katrin oma päätös.
- Rivin tap → lähdesivulle -toiminto sään tuntiennusteessa: tarpeeton nyt kun koko päivä näkyy suoraan. Ehdotus (EI HYVÄKSYTTY): poista.
- Leimasin-sanan valintasääntö (Sateenvarjo/Pipo/Aurinkorasva/Hattu, §15.2): ehdotettu kynnysarvoin, ei vahvistettu.
- Alapalkin "Ruori aina paikka 1" -lukitus menee hieman pidemmälle kuin oli pakko (perusteltu sisällöltään, laajuudeltaan ei varmistettu) — voisi löysätä "aina jossain neljästä näkyvästä" -tasolle.
- Haptiikka-selitys ("iOS Safari ei tue Vibration APIa lainkaan") on ristiriidassa aiemman havainnon kanssa että haptiikka toimi — ei varmistettu kumpi pitää paikkansa.

**Muualta löytyneet, ei vielä käsitelty:**

- Kalenterin kuittaus omilla riveillä — todennäköisesti `kalenteri_tekijat`-mappausaukko.
- ~~Varasto/"vahdittu" uudelleenajattelu aikaleimatuksi lokiksi.~~ **RATKAISTU 16.8.2026** (KONSEPTIKIRJA.md 4.12, "Muistikirja"): kaikkiin kolmeen Varaston listatyyppiin (Muistikirja/Teema/Vahdittu) sama aikaleimanäyttö. Täppä oli jo poistettu Varaston normal-tyypin riveiltä ennestään category-pohjaisella `isVarasto`-portilla — ei tarvinnut uutta lippua, vain UI-näyttöä puuttui.
- ~~**Coden kysymys "solmut kurssin sisällä" -näkymästä jää auki.**~~ **RATKAISTU 16.8.2026.** Kurssisivun "📎 Materiaali" uudistettu status-tietoiseksi listaksi (odottaa/käsitelty per tuotu rivi), ja "🌉 Tarkista sillat (tämä kurssi)" -linkki lisätty samalle sivulle — haku kattaa edelleen kaikki aktiiviset kurssit (silta on väistämättä usean kurssin yhteinen), mutta tulos suodatetaan tähän kurssiin. Ks. `muistiinpanot.md` 16.8.2026.

**Avoimet kohdat (lisäykset, toinen keskustelu 9.8.2026):**

- **Miron API:n aikaleimatarkkuus ja rate limit** — tarkentaa jo §4.3:ssa mainittua AUKKOa (ajanoton lopetussääntö nojaa Miron muokkauslokiin). Ei varmistettu kuinka tarkkaa Miron API antama viimeisimmän muokkauksen aikaleima on, eikä API:n kutsurajaa jatkuvalle pollaukselle.
- **Rajatun kyselyn tarkat kysymykset** (Priming-vaiheen menetelmäosa) ovat `sung-metodi.md`:n videoissa, ei vielä poimittu tekstiksi speksiin.
- **Overlearning-näkymä tarkentuu vasta testikurssin jälkeen** — ei rakenneta yksityiskohtia etukäteen ilman oikeaa käyttödataa.
- ~~GRRINDE:n toinen R on tulkinnanvarainen — Relational vai Reflective?~~ **RATKAISTU 16.8.2026 (Katrin päätös): molemmat.** Ei valita jompaakumpaa — ohjeteksti kattaa sekä Relational että Reflective, ei tulkintaerimielisyyttä joka pitäisi ratkaista videosta.
- **Reference-vaiheen täsmäohje puuttuu** — muille PACER/PERO-vaiheille on ohjeteksti, Referencelle ei vielä ole muotoiltu vastaavaa.
- **Fontti ja tarkat hex-arvot mockupiin** — ks. myös §9:n uusi huomautus: mockup-tiedostojen värit/fontti ovat paikanpitäjiä, lopulliset arvot pitää sopia `satama-design-kuvaus.md`:n kanssa erikseen.

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
- Nosto-ominaisuus alapalkkiin/ankkureihin (ei sääntöä sille mikä on kiireellisintä)
- docx/doc-purku, OCR skannatuille pdf:ille, oma sanelu, muotoiluvalikot editoriin
- Mitään AUKKO-lohkojen ehdotuksista ilman kuittausta

---

## 13. Rakennusjärjestys

**Vaihe 1 — perusta ja kurssin sisääntulo** — **VALMIS**

1. ~~Auditointi~~
2. ~~§10.2 vika 1~~
3. ~~Skeema: `pero_vaihe`, `pacer_paatyyppi`, `pacer_sivutyyppi`, `kertausjonossa`~~
4. ~~Kurssin lisäys Reitti-välilehdeltä~~
5. ~~Materiaalin sisääntulo Laiturin kautta + älyn solmuehdotus~~
6. ~~Asetukset: suljetut ikkunat, päivän opiskeluaika, aterian kesto~~

**Vaihe 1b — Laiturin sisääntulo ja välilehdet** — **VALMIS** (§16)

Sisälsi jaetun editorin, tiedostojen tuonnin (pdf/kuva/pptx/koodi), kurssiosion uuden muotokielen, kurssikontekstin, ja Lokin minimaalisen tietokohteen.

**Ruori — visuaalinen uudistus** — **VALMIS** (§15), useampi bugikorjauskierros elävästä testauksesta.

**Konteksti (relay 16.8.):** ~5 h/pv käytettävissä rakentamiseen, kova raja koulun alkaessa elo-syyskuun vaihteessa. Aiemmassa keskustelussa oli tavoite saada Sung-metodi valmiiksi 7–11 päivässä — **tämä aikamääre on todennäköisesti vanhentunut** (ei tiedetä mistä päivästä laskettuna), ei oteta sitovana ilman uutta tarkistusta.

**Priority-muutos 16.8.2026 (Katrin päätös):** Laiturin kontekstuaaliset sisäänmenot (§16.5b) rakennetaan seuraavaksi, ENNEN Vaihe 2:ta — perusteena mm. se että kurssimateriaalin sisääntulo voi sitten kulkea saman, korjatun putken kautta. Vaihe 2 pysyy dokumentoituna, ei poistu jonosta, vain siirtyy myöhemmäksi.

**Jonossa Laiturin jälkeen, ei vielä yksityiskohtia (16.8.):** Nyt-näkymässä (§4) on Katrin mukaan "ylimääräisiä asioita" jotka kaipaavat siivousta — ei täsmennetty mitä, käsitellään omana eränään Laiturin valmistuttua, ei nyt.

**Seuraavana:**

**Laituri-uudistus (§16.5b)** — kontekstuaaliset sisäänmenot, kohdevalinnan laajennus, kaksitasoinen kotivalinta. Ks. myös §8.3:n AUKKO (`piilota_laiturista`-kaksoiskäyttö) joka pitää ratkaista samassa yhteydessä.

**Vaihe 2 — menetelmä**

7. PERO/PACER-ristitulo ja ohjeiden generointi (§7.4) — sisältää sillasolmu-moottorin uudelleenkytkennän solmutason sisältöön (§7.2 AUKKO)
8. Vaiheensiirtymät ja kehote
9. Ylläpidon korjaukset (§7.5)

**Vaihe 3 — generaattori**

10. Sijoittelija: liveluennot → suojatut ikkunat → opiskelupätkät (§4.6)
11. Interleaving (§4.7), painoarvot (§7.3)
12. Perustelurivit (§4.4)

**Vaihe 4 — näkymät**

13. Nyt-välilehden sisältö uudella muotokielellä (§4)
14. Kartta, Opiskelu-näkymä (§6.1)
15. Reitti loppuun: viikkokalenteri, deadline-lista, kertausjono (§5)

**Vaihe 5 — myöhemmin**

16. Sillat käytäntöön (§7.2)
17. Miro-upotus (§10.1)
18. Kartan Työelämä-näkymä ja helmi (§6.2, §6.3)
19. Loki-välilehti kokonaisuudessaan (§6b)

---

## 14. Periaatteet KONSEPTIKIRJA.md:hen

1. **"Rakenna aina olemassa olevan päälle, älä rinnakkaista konetta."**
2. **"Kaikella on yksi koti."**
3. **"Tila on eri asia kuin edistyminen."** Osaamista ei mitata prosenteilla. Jäljellä olevaa työtä saa mitata.
4. **"Suojattu varataan ensin."** Se mistä kiireessä nipistetään ensimmäisenä varataan ennen muuta.
5. **"Ei englantia."** Satama, Laituri, Hytti, Kuormavahti, henkselit, ankkurit.
6. **"Käyttäjän ei tarvitse muistaa lopettaa."** Mittaus päättyy itsestään.
7. **"Järjestys on raahattavissa aina kun se on järkevää."** Käyttäjäkohtainen, ei sovelluksen oletus. Poikkeus vaatii perustelun, ei toisin päin.

---

## 15. Ruori — visuaalinen uudistus (RAKENNETTU)

**Koskee:** `#home-view`. Perusta: `satama-design-kuvaus.md`. Mockup-referenssi: `satama-ruori-header-v2.html`.

### 15.0 Yksi sääntö joka rikkoutui joka paikassa

**Symboli piirretään niin isona kuin se mahtuu kehykseensä.** Yleisin virhe: SVG-elementillä ei ole `width`/`height`, jolloin se putoaa oletuskokoonsa. Jos kehys on olemassa vain siksi että symboli on liian pieni, **kehys poistetaan** eikä symbolia jätetä pieneksi. Tämä koski kelloa ja alapalkin kuvakkeita, molemmat korjattu useammalla kierroksella.

### 15.1 Otsake

**Kuormitustila on pelkkä kytkin**, ei tekstiä eikä laatikkoa ympärillä. `--r-kosketettava`, lämmin lasi, messinkikehys. Päällä: koko kytkin `--vaara`, nuppi vaalea. **Ylävasemmassa nurkassa.**

**SATAMA** kytkimen oikealla puolella samalla rivillä, ~22–23 px, harvennus, paino 700, riittävän tiivis ettei mene kellon päälle.

**Päivämäärää ei ole otsakkeessa** — se on alapalkin kalenterikuvakkeessa (§15.5).

### 15.2 Sää

**Datalähde: Open-Meteo** (`https://api.open-meteo.com/v1/forecast`) — ilmainen, ei API-avainta, antaa suoraan `apparent_temperature`, `precipitation_probability`, `weather_code`. Kutsu palvelimen kautta (`api/saa.js`), **30 min välimuisti**, kiinteät koordinaatit asetuksista (ei selaimen paikannuslupaa).

**Virhekäsittely — TÄSMENNETTY 16.8.2026 (aiempi sääntö oli epätarkka ja aiheutti todellisen bugin).** Katri näki lämpötilana "0" kun yhteys oli poikki — vanha sääntö ("piilota koko sääosio, älä näytä vanhaa dataa tuoreena") ei estänyt tätä, koska virhe ei näy piilotuksena vaan `0`/`null`-arvon renderöitymisenä kuin se olisi kelvollinen lukema. Korjattu sääntö: **jos haku epäonnistuu tai palauttaa tyhjän, säilytä VIIMEISIN onnistuneesti haettu arvo näkymässä** (mieluiten kuin täysi piilotus) sen sijaan että näytettäisiin nollaa tai muuta oletusarvoa todellisena lukemana. **Piilota koko sääosio vain kahdessa tapauksessa (täsmennetty 16.8.):** (a) edellistä onnistunutta arvoa ei ole koskaan ollut, tai (b) myös aiemman tallennetun lukeman hakeminen epäonnistuu jostain syystä (esim. paikallinen tallennus rikki). Kun yhteys palautuu, tuore arvo korvaa vanhan normaalisti. **Ei vielä korjattu koodissa** — relayattava Codelle.

**Sää-laatikko poistettu kokonaan** — ei kehystä, elementit kelluvat otsakkeen päällä.

**Päälämpötila** on "tuntuu kuin" -arvo, ~52 px, ei selittävää tekstiä.

**Leimasimet** (Sateenvarjo, Pipo, Aurinkorasva, Hattu) lämpötilan oikealla puolella, tekstinä ei prosenttina — leiman valinta ehdotettu kynnysarvoin (§11 AUKKO), musteenreuna epätasainen SVG-turbulenssisuotimella:

```svg
<filter id="leimasin">
  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="1.3"
                     xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

**Tuntiennuste-strippi:** kaikki 24 tuntia (00–23), ei joka toinen, vaakaan vieritettävä, nykyinen tunti korostettu (liquid glass -tausta kelpaa). Sadeprosentti kuvakkeen alla, 10 %:n tarkkuudella.

**Sääkuvakkeet — WMO-koodista:**

| Koodi | Kuvake |
|---|---|
| 0 | aurinko |
| 1–2 | puolipilvinen (aurinko pilkistää pilven takaa, samat säteet kuin selkeä-kuvakkeessa, ei kevyempi versio) |
| 3 | pilvinen |
| 45, 48 | sumu (vaakaviivat) |
| 51, 53 | tihku, 1 pisara |
| 55, 57 | tihku, 2 pisaraa |
| 61, 63 | vesisade, 1–2 pisaraa |
| 65, 67 | vesisade, 3 pisaraa |
| 71, 73, 85 | lumi, 1 hiutale |
| 75, 77, 86 | lumi, 2 hiutaletta (**ei koskaan 3** — meni epäselväksi pienessä kuvakkeessa) |
| 80–81 | kuurot, 1–2 pisaraa |
| 82 | kuurot, 3 pisaraa |
| 95, 96, 99 | ukkonen (ei jätetä pois vaikka hankalampi piirtää) |

Mittasuhteet: **pilvi pieni**, sade-/lumi-/salamamerkit **2–3× isompia** kuin pilvi — ne ovat kuvakkeen tärkein tieto. Värit saa taittaa harmahtavaan, ei pakollista. Tuuli ei ole osa `weather_code`:a, vaatisi oman kentän jos halutaan.

**Liukuva tuntivalitsin** (scrubber): vedettävä kahva koko vuorokauden yli, lämpötila/aika/kuvake päivittyvät reaaliaikaisesti vedon mukana. Eri ominaisuus kuin vieritettävä strippi, molemmat voivat olla olemassa.

Tarkka SVG-koodi kellolle, sääkuvakkeille ja strippille: `satama-ruori-header-v2.html`.

### 15.3 Kello

**Pelkkä ympyrä, ei kehystä.** Kaikki 12 numeroa selvästi, laskettu trigonometrialla (kulma = tunti × 30° − 90°, säde 49 kehyksessä r=66):

```svg
<svg viewBox="0 0 140 140">
  <circle cx="70" cy="70" r="66" fill="#FBF9F3"/>
  <circle cx="70" cy="70" r="66" fill="none" stroke="rgba(34,31,26,.16)" stroke-width="1"/>
  <g font-size="12" font-weight="700" fill="#221F1A" text-anchor="middle" font-family="'Courier Prime',monospace">
    <text x="70" y="21" dy=".32em">12</text>
    <text x="94.5" y="27.6" dy=".32em">1</text>
    <text x="112.4" y="45.5" dy=".32em">2</text>
    <text x="119" y="70" dy=".32em">3</text>
    <text x="112.4" y="94.5" dy=".32em">4</text>
    <text x="94.5" y="112.4" dy=".32em">5</text>
    <text x="70" y="119" dy=".32em">6</text>
    <text x="45.5" y="112.4" dy=".32em">7</text>
    <text x="27.6" y="94.5" dy=".32em">8</text>
    <text x="21" y="70" dy=".32em">9</text>
    <text x="27.6" y="45.5" dy=".32em">10</text>
    <text x="45.5" y="27.6" dy=".32em">11</text>
  </g>
  <line x1="70" y1="70" x2="70" y2="36" stroke="#221F1A" stroke-width="3" stroke-linecap="round"/>
  <line x1="70" y1="70" x2="93" y2="82" stroke="#221F1A" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="70" cy="70" r="3" fill="#221F1A"/>
</svg>
```

**Minuuttiviivat:** 60 hiusviivaa generoituna silmukalla (ei käsin), joka viides vahvempi:

```js
for (let i = 0; i < 60; i++) {
  const isHour = i % 5 === 0;
  const angle = (i * 6 - 90) * Math.PI / 180;
  const rOuter = 64, rInner = isHour ? 55 : 60;
  const x1 = 70 + rOuter * Math.cos(angle), y1 = 70 + rOuter * Math.sin(angle);
  const x2 = 70 + rInner * Math.cos(angle), y2 = 70 + rInner * Math.sin(angle);
}
```

Kellotaulun pohja vaaleampi kuin paperi (`#FBF9F3`). **Painettava: vie kellosovellukseen.**

### 15.4 Ankkurit

Ankkurit ovat se mistä koko Satama lähti liikkeelle.

**15.4.1 Kuvake — natiivi emoji + grayscale-suodin.** Kokeiltiin ensin SVG-korviketta (koska emoji renderöityi sinisenä alustasta riippuen), mutta muoto ei täsmännyt — Katrin diagnoosi: alkuperäinen ⚓ on "Sataman sielu". Ratkaisu: `filter: grayscale(1)` natiivin emoji-glyfin päällä, muoto säilyy, väri hallinnassa.

**15.4.2 Rivin rakenne:**

```
[ täppä ]  [ teksti, saa rivittyä ]  [ ⚓ ]
                                     [ ⋯ ]
```

Ankkuri ja ⋯ allekkain, molemmat ~30 px näkyvä pinta, **44 px kosketusalue** (aiemmin kaksi 44 px -aluetta ylittivät toisensa 8 px:n välissä — korjattu).

**15.4.3 Muotokieli ja tila:** molemmat napit kosketettavaa pintaa. Tila näkyy vain taustasta (reunaväri + sisähehko, ei täyttöä), ei merkistä: ei ankkurissa = lämmin lasi, ankkuri nostettu = `--messinki`.

**15.4.4 Kolmen pisteen valikko:** hälytys, siirrä eteenpäin, ehdota Juhalle.

**15.4.5 Laskeutumislogiikka — yleistetty jaettu/yksityinen-periaatteeksi.** Ankkurin painaminen uudestaan laskee sen pois. Jos lisätty **jaetusta paikasta** (Laituri, kauppalista, tai muu jaettu näkymä), laskeutuu takaisin sinne. Jos lisätty **paikasta jonka vain Katri näkee**, laskeutuu `loki_merkinnat`-tietokohteeseen (§6b, §16.6) — ei vielä selattavaa näkymää. Tila (`lahde_jaettu`) tallennetaan ankkurin **luontihetkellä**, ei lueta uudestaan laskuhetkellä, koska listan jaettu/yksityinen-tila on käyttäjän muutettavissa. **Tehdyksi täppääminen ei laskeuta mihinkään.**

**15.4.6 Älyn ehdotukset:** samat kuvakkeet ja rakenne kuin käyttäjän omissa ankkureissa.

### 15.5 Alapalkki

**Neljä kiinnitettyä + ⋯.** Oletuksena: Ruori, Laituri, Kalenteri, Hytti. Pisteiden takana: Muistilaput, Varasto, Asetukset. **Palkki identtinen kaikissa näkymissä** — muscle memory, ja kuormitustila piilottaa Hytti-kortin etusivulta joten Hytti-kuvake ei voi olla vain kortin takana.

**Järjestys käyttäjän muutettavissa:** ⋯ avaa arkin jossa kaikki seitsemän listana raahattavassa järjestyksessä. **Ruori on lukittu aina palkin ensimmäiseksi kuvakkeeksi** riippumatta järjestyksestä (korjaus kun raahaus vei sen pisteiden taakse) — ks. §11 AUKKO laajuudesta.

**Kuvakkeet värillisiä** (poikkeus design-kuvauksen "ei kahta väripintaa samalle roolille" -sääntöön, koska nämä ovat esineitä maailmassa, ei tilaa — poikkeus lisätty `satama-design-kuvaus.md`:hen):

| Kohde | Kuvake | Väri |
|---|---|---|
| Ruori | laivan ruori | `--messinki` |
| Laituri | pelastusrengas (säteittäiset lohkot, ei vinoviivat) | `--vaara` + valkoinen |
| Kalenteri | kalenterilehti, elävä päivämäärä | paperi + muste |
| Hytti | laivan hytin ovi | `--karikko` puu |
| Muistilaput | to-do-lista rasteineen | paperi + messinki |
| Varasto | lastilaatikko | `--matalikko` |
| Asetukset | ratas | harmaa |

Kuvakkeet ~52 px (nostettu useaan kertaan alkuperäisestä 34 px:stä). **Aktiivinen välilehti:** lyhyt musteviiva kuvakkeen alla, ei väriä.

**Vanha navigaatioruudukko poistettiin vasta kun ⋯-valikko toimi** — muuten Muistilaput/Varasto/Asetukset olisivat hetkellisesti tavoittamattomissa.

### 15.6 Ei rakennettu / ei rakenneta

- **Nosto** — ei sääntöä sille mikä on kiireellisintä.
- Ankkurin laskeminen Lokin selattavaan näkymään ennen kuin Loki on olemassa (§6b).

### 15.7 Tunnetut alustarajoitteet

- **Haptiikka raahatessa:** Coden mukaan iOS Safari ei tue Vibration APIa lainkaan — mutta tämä on ristiriidassa aiemman havainnon kanssa (haptiikka toimi muualla). Ei varmistettu, ks. §11.
- Kosketusalueet, leimasimen turbulenssisuodin ja sään verkkokatko-piilotus testattu ja toimivat oikealla laitteella.

---

## 16. Laituri ja jaettu editori (RAKENNETTU, vaihe 1b)

### 16.1 Välilehtirakenne — siirto, ei uutta rakentamista

```
Hytti
├── Nyt     · nykyinen päivän ehdotus — siirretty sellaisenaan
├── Reitti  · kurssit ja materiaalin lisääminen — uusi muotokieli
└── Kartta  · nykyinen opinto-kartta-view — siirretty sellaisenaan
```

Reittiin tuli toistaiseksi vain kurssiosio — viikkokalenteri, deadline-lista ja kertausjono ovat vaiheessa 4 (§13).

### 16.2 Jaettu editori

**Yksi editorikomponentti koko sovellukseen**, korvasi vanhan pienen tekstilaatikon.

**Muoto:** iOS-muistiinpanojen kaltainen. Koko näytön kirjoituspinta, luettavan pinnan muotokieli (`--r-luettava`, paperinsävyinen tausta, hiusviivat), Courier Prime 15 px, ei työkalupalkkia, ei tallennusnappia — tallennus itsestään.

**Sanelu ilmaiseksi** iOS:n järjestelmänäppäimistöltä, ei omaa sanelua.

**Kohde määräytyy avauspaikasta:** Laituri → Laiturin muru (käsitellään ja katoaa); kurssin "+ Lisää materiaalia" tai solmu → siihen kohteeseen kiinnittyvä materiaali. Loki-kohde ei vielä ole olemassa mutta lisääminen on suunniteltu yhdeksi riviksi kun se rakennetaan.

**Kolme bugia löytyi ja korjattiin elävässä testauksessa** (kontrasti kirjoitushetkellä, kursori-muokkaus koko rivin valinnan sijaan, rivitys) — sama virhe toistui 7 paikassa sovelluksessa, korjattiin kerralla kaikkialle.

### 16.3 Tiedostojen tuonti

| Tyyppi | Tuetaan | Käsittely |
|---|---|---|
| pdf | kyllä | teksti suoraan Anthropicin Messages API:lla, max 32 MB / 100 sivua (verifioitu) |
| jpg, png, heic | kyllä | kuvana älylle |
| ppt, pptx | kyllä | jszip purkaa `<a:t>`-tekstirunot `ppt/slides/slideN.xml`:stä, palvelimella |
| doc, docx | ei | käyttäjä liittää tekstinä editoriin |
| koodi/teksti (py, js, ts, java, sql, json, md, csv, ym.) | kyllä | UTF-8-tekstinä suoraan, ei purkua |
| videolinkit | kyllä | transkripti tekstinä jos saatavilla, muuten äly purkaa |

**Anthropic PDF -rajat (verifioitu virallisesta dokumentaatiosta):** 32 MB per pyyntö, 100 sivua (600 vain 1M-context betassa, ei käytössä), ei salasanoja/salausta. API hylkää ylikokoisen pyynnön kokonaan — koko/sivumäärä tarkistetaan ennen lähetystä, virhe kerrotaan käyttäjälle selkeästi.

**Puhelimella ei ole raahausta** — koko alue on painike joka avaa iOS:n valitsimen (Tiedostot/Kuvat/Kamera), ei "raahaa tähän" -tekstiä.

**Tallennus:** Supabase Storage, oma bucket, tiedosto kerran kokonaisena. Suhde tiedosto↔solmu on monta moneen. `piilota_laiturista` sama mekanismi kuin tekstimuruilla.

**Mitä materiaalista tallennetaan:** päivämäärät/deadlinet → `opinto_deadlinet`-riveiksi; kurssitason teksti → älyn käyttöön; solmutason sisältö → tekstinä; kaikki muu (markkinointiteksti, opettajan esittely, Moodle-ohjeet) → ei tallenneta. Tämä on samalla raja jonka jälkeen "ei turhaa tietoa" on tarkistettavissa eikä makuasia.

**Täydennykset 9.8.2026 (toinen keskustelu):**

- **Kohtatieto sivutuotteena.** Solmun kohdalle kirjataan viittaus (esim. "sivut 12–18") silloin kun poiminta sen tietää — osana samaa poimintaa, ei erillisenä älykutsuna.
- **Miksi tiedosto↔solmu on monta moneen:** yhdet kalvot voivat kattaa useita väliotsikoita, ja siltasolmut esiintyvät useassa kurssissa. Jos tiedosto voisi kiinnittyä vain yhteen solmuun, jouduttaisiin valitsemaan kumpi kurssi "omistaa" esim. funktiot — sitä valintaa ei haluta tehdä.
- **Käyttäjä ei kokoa mitään yhteen tiedostoon käsin.** Jokainen Laituriin raahattu tiedosto tallentuu omanaan ja kiinnittyy solmuun erikseen. Sisältövertailu tarvitsee vain yhden solmun tekstin kerrallaan.
- **Kuittaus onnistuu katsomatta**, mutta tarkistettavuus on olemassa: merkkiä painamalla näkee tiedostot ja kohdat.
- **Poistoa ei mietitä ennen kuin pari vuotta kurssin päättymisestä on kulunut** — materiaali säilyy haettavana sitä ennen.

### 16.4 Kurssiosio Reitissä

Kurssilista: luettavan pinnan kortti, nimi + PERO-vaihe messingillä + jäljellä-palkki (neutraali muste, ei syvänne, ei prosentteja).

Kurssin sisällä: solmulista (nimi, tila, tiedostomerkki) + "+ Lisää materiaalia" kosketettavan pinnan tyylillä koko leveydeltä. **Ensimmäisessä läpikäynnissä vain kurssilista sai uuden muotokielen** — nappi ja solmulista jäivät vanhaan tyyliin, korjattu jälkikäteen samaan kosketettavaan/luettavaan tyyliin.

### 16.5 Kurssikonteksti

Kun editori/tiedostotuonti avataan kurssin "+ Lisää materiaalia" -napista, kurssi on jo tiedossa — nimen kirjoittaminen ja tunnistusheuristiikka jäävät pois. Jäljelle jää vain solmujako: äly ehdottaa, ihminen hyväksyy kaksitasoisessa näkymässä (solmulista + tiedostomerkit).

Laajentaa olemassa olevaa 2026-08-05 tekstiputkea, ei rinnakkaista.

### 16.5b Kontekstuaaliset sisäänmenot — yleistys, ei vielä rakennettu (toinen keskustelu, 9.8.2026)

Kurssikonteksti (§16.5) on **yksi tapaus yleisemmästä periaatteesta**: Laituri säilyy sellaisenaan (vapaa kenttä, alussa valinta oma vai yhteinen, kaikki yhtenä päivämääräjärjestyksessä olevana listana), mutta Hyttiin lisätään **nappeja jotka vievät suoraan editoriin kohde valmiiksi täytettynä**: "lisää helmi", "lisää materiaalia" (kurssin kohdalla — jo rakennettu), "lisää muistiinpano", teemaan/listaan lisääminen, "ehdota Juhalle".

**Periaate:** tämä siirtää luokittelun sisääntulosta sisäänmenoon. Konteksti on ilmaista tietoa jota ei tarvitse kysyä eikä päätellä. Yhden oven periaate säilyy — editori on sama, osaan kirjekuorista on vain osoite valmiiksi kirjoitettuna.

**Kontekstista luotu ei käy Laiturin listalla** eikä kohdetta tarvitse voida vaihtaa. Muuten sama asia olisi kahdessa paikassa ja sekavuus palaisi toisesta suunnasta.

**Yksi editori, kaksi tilaa:** kontekstista avattuna ei kohdevalintaa (näin §16.5 jo toimii kurssikontekstissa), Laiturista avattuna on.

**Ulkopuolelta saapuva materiaali** (tiedostot, jaot, pdf:t) ei kulje Hytin nappien kautta ja käyttää edelleen kohdevalintaa. Reitit ovat täydentäviä: napista tulee se minkä luot itse, kohdevalinnasta se mikä saapuu. Laiturista pitää edelleen voida siirtää eteenpäin, jos oksennushetkellä ei tiedä minne asia menee.

**Lisäys (relay 16.8.):**

- **Kohdevalikko — YKSINKERTAISTETTU TOISEEN KERTAAN 16.8. (Katrin oma jatkoajatus, korvaa edellisen version kokonaan).** "Oma hytti" ja "Juhan hytti" **POISTETTU kohdevalikosta kokonaan** — ei tarvita, koska: kurssimateriaalilla on jo oma erillinen putkensa (kurssisivun "+ Lisää materiaalia" -nappi, ei kulje tämän dropdownin kautta), helmi lisätään aina Hytin omasta kontekstista (ei koskaan redirektoinnilla Laiturista), ja Juhalle suuntaaminen hoituu jo olemassa olevalla "ehdota Juhalle" -reitillä (§16.5b yllä). **Vahvistettu myös: yksityisyys on molemminpuolinen** — Katri ei näe Juhan hyttiä, Juha ei näe Katrin.
- **Yksityisyys ilman erillistä hytti-kohdetta:** Katrin oma ratkaisu — muru joko (a) **pysyy Laiturissa**, näkyvyys-toggle suoraan rivillä (oletus jaettu, vaihdettavissa "vain minä"), tai (b) siirretään **yksityiseen Varasto- tai Muistilaput-listaan** jonka Katri on itse luonut yksityiseksi. Olemassa oleva `lists.visibility`-mekanismi (jo käytössä teema/vahdittu-tyypeille) piilottaa yksityisen listan KOKONAAN kumppanilta — ei edes otsikko näy — joten se saa saman lopputuloksen kuin oma erillinen "Hytti"-kohde olisi antanut, ilman uutta erikoistapausta.
- **Kohdevalikko nyt vain kolme riviä:** Varasto / Muistilaput / Poista.
- **Ei valintaa ollenkaan = pysyy Laiturissa**, oma näkyvyys-toggle suoraan rivillä, ei dropdown-kohtana.
- Kontekstista avattuna (Hytin napit: kurssimateriaali, helmi, "ehdota Juhalle") kohde on aina jo tiedossa eikä dropdownia näytetä lainkaan.

**RLS-tarkistus tehty 16.8. (Claude, koodista todennettu) — hyvät ja huonot uutiset:**

**Hyvä uutinen: molemmat visibility-kentät ovat jo OIKEASTI RLS-tasolla suojattuja, ei vain client-suodatusta.**
- `lists.visibility` (sql/003): `lists_select using (owner_id = auth.uid() or visibility = 'shared')` — oletus **'private'** uudelle listalle.
- `laituri.visibility` (sql/118, ajettu 16.8. juuri tämän löydöksen korjaukseksi): `laituri_select using (auth.uid() is not null and (visibility = 'shared' or user_id = auth.uid()))` — oletus **'shared'**, koska Laiturin ydinluonne on jaettu tulopiste. Eri oletus kuin `lists`, tarkoituksella.

**Huono uutinen — todellinen aukko löytyi, korjattava ennen kuin uusi dropdown rakennetaan:** `asetaLaiturinKoti()` (koti-mekanismi, script.js) asettaa TÄLLÄ HETKELLÄ vain `koti_tyyppi`/`koti_kohde_id`/`piilota_laiturista` — **ei koskaan `laituri.visibility`:tä.** Jos muru ohjataan yksityiseen Varasto/Muistilaput-listaan, kopio kohteessa on RLS-suojattu oikein (periytyy `lists.visibility`:stä), mutta **alkuperäinen `laituri`-rivi jää oletusarvoon `'shared'`** — se on siis edelleen Juhan luettavissa RLS:n läpi, vain piilotettu Katrin omasta näkymästä `piilota_laiturista`:lla. Sama virheluokka kuin 13.8./16.8. kurssimateriaalilöydöksessä, ei vielä korjattu tähän. **Korjaus: kun koti asetetaan kohteeseen jonka `lists.visibility='private'`, `asetaLaiturinKoti()`:n pitää SAMALLA kirjoituksella asettaa myös lähde-rivin `laituri.visibility='private'`.**

**Yksinkertaistus vielä pidemmälle: Varasto/Muistilaput-kohteille ei tarvita erillistä näkyvyys-togglea ollenkaan.** Näkyvyys periytyy KOKONAAN siitä mihin listaan muru ohjataan — sama malli kuin kaikkialla muualla `lists.visibility`:n kanssa, ei uutta rinnakkaista käsitettä. Käyttäjä valitsee/luo listan kerran (yksityinen tai jaettu), sen jälkeen kaikki sinne ohjatut murut noudattavat sitä automaattisesti. Toggle tarvitaan VAIN "pysyy Laiturissa" -tapaukselle, koska Laituri itse ei jakaudu nimettyihin listoihin.

**Käytännön aukko joka pitää huomioida rakentaessa:** jos Katrilla ei vielä ole yksityistä Varasto/Muistilaput-listaa kun hän ensimmäistä kertaa haluaa ohjata murun sellaiseen, dropdownissa pitää voida **luoda uusi lista suoraan siitä** (nimi + yksityinen/jaettu), ei vain valita olemassa olevista — muuten koko yksinkertaistus kaatuu ensimmäiseen käyttökertaan.

### 16.5c Laituri-uudistus — KOKONAISSUUNNITELMA (koottu 16.8., valmis vietäväksi Codelle)

**1. Editori ei muutu.** §16.2:n koko näytön kirjoituspinta pysyy täysin sellaisenaan.

**2. Uusi yhtenäinen valikko, sama paikka kuin nykyinen ⋯ (⚓ pysyy koskemattomana vieressä):** kolme riviä — **Varasto / Muistilaput / Poista.** Ei "Hytti"-kohdetta ollenkaan (kurssimateriaalilla oma putki, helmi vain Hytin omasta kontekstista, "ehdota Juhalle" hoitaa loput). Tämä myös poistaa `hytti_kortit`-pohjaisen vanhan koti/sijoitus-järjestelmän käytöstä Laiturin osalta kokonaan — riippumatta siitä oliko alla kuvattu otsikkovuoto oikeasti aktiivinen bugi vai ei, se lakkaa koskemasta Laituria kun tämä on rakennettu.

**2b. Listavalitsin (Varasto/Muistilaput-alivalinta) näyttää oikeat listat automaattisesti, ei erillistä logiikkaa tarvita:** `lists_select`-policy (`owner_id = auth.uid() or visibility = 'shared'`, sql/003) tekee tämän jo — Katrin valikossa näkyvät hänen omat listansa (yksityiset + jaetut) ja Juhan JAETUT listat, mutta EI Juhan yksityisiä. Sama toisin päin. Vahvistettu 16.8., ei vaadi lisätyötä.

**3. Näkyvyys ilman erillistä kysymystä useimmissa tapauksissa:**
- Varasto/Muistilaput → näkyvyys periytyy valitusta/luodusta listasta (`lists.visibility`), ei erillistä togglea.
- Ei valintaa (pysyy Laiturissa) → oma toggle rivillä, oletus jaettu, vaihdettavissa yksityiseksi.
- Jos yksityistä kohdelistaa ei vielä ole, valikosta voi luoda uuden suoraan (nimi + yksityinen/jaettu) — ei vain valita olemassa olevista.

**4. Korjaukset jotka pitää tehdä samassa yhteydessä (ei valinnaisia, kaikki löydettyjä todellisia aukkoja):**
- `asetaLaiturinKoti()` asettaa `laituri.visibility='private'` samalla kirjoituksella kun kohdelista on yksityinen — puuttuu tällä hetkellä, jättää lähderivin RLS:n läpi luettavaksi vaikka UI piilottaa sen.
- `piilota_laiturista` asetetaan HETI kun kohde tunnetaan (sama malli kuin teema/lista/vahdittu/hytti jo tekevät) — kurssimateriaali ei tällä hetkellä tee näin, korjataan yhtenäiseksi. **Täsmennys (Katrin kysymys 16.8.):** tämä tarkoittaa että materiaali katoaa Laiturista HETI kun se lisätään kurssikontekstista — EI vasta kun äly on jakanut sen solmuiksi ja Katri hyväksynyt jaon. Käsittely/hyväksyntä tapahtuu kokonaan kurssisivun omalla materiaalilistalla (⏳/✓), joka on eri asia kuin Laiturista piiloutuminen — sama kuin vahdittu-lepo-esimerkissä alussa: piiloutuminen ja "valmiiksi käsitelty" eivät ole sama hetki.
- Kurssisivun oma käsitelty/odottaa-tila saa OMAN kentän, ei enää lainaa `piilota_laiturista`:a.
- Sää: näytä viimeisin tunnettu arvo yhteyskatkolla, piilota vain jos ei koskaan ollut arvoa TAI edellisenkään hakeminen epäonnistuu.
- Arkistoitu kurssi ei laukaise muistutuksia (vahvistettu haluttuna, jo toimii oikein muuten).

**5. Poistetaan tarpeettomana:** `laituri_piilota_oletus_kohteet`-asetus (Asetukset → 🛟 Laituri) kokonaan. Tarpeeton kun jokainen ei-Laituri-kohde piiloutuu automaattisesti kohdasta 4 mukaisesti — ei jää mitään konfiguroitavaa.

**6. Ei ratkaistu, tarkistettava Coden toimesta ennen kuin käsitellään korjauksena:** Katrin havainto että Hytin projektien otsikot näkyivät koti-valikossa ja Asetuksissa. `haeKotiKohteet()`/`hytti_kortit`-taulun RLS on koodista todennettu oikein (`owner_id = auth.uid()`, sql/016) — juurisyytä ei löytynyt staattisesti. Koden pitäisi tarkistaa onko vanhoilla `hytti_kortit`-riveillä puuttuva/väärä `owner_id`. Muuttuu joka tapauksessa merkityksettömäksi Laiturin osalta kun kohta 2 on rakennettu.

> **VAROITUS 16.8., tärkeä väärinkäsityksen esto:** `hytti_kortit` EI ole vain näiden kahden sijoitusfunktion apu­taulu — se on Hytin **NYKYINEN etusivun kokonaisuus** (kortit, raahausjärjestys, arkistointi, seuraava_askel, kalenterisuodatin — käytössä n. 15 kohdassa script.js:ssä, mm. koko `hytti-kortti-view`). **Sitä EI SAA poistaa/purkaa kokonaan**, koska Loki (§6b) jolle se on tarkoitus jättää paikkansa ei ole vielä rakennettu — Hytin etusivu hajoaisi. **Mitä Katri tarkoitti (täsmennetty):** `hytti_kortit` poistetaan vain KOHDEVAIHTOEHTONA Laiturin ⋯-valikosta (kohta 2, tapahtuu joka tapauksessa) — tämän voi tehdä NYT, ei tarvitse odottaa koko §16.5c-paketin valmistumista, koska se on itsenäinen, pieni muutos kahteen funktioon (`haeSijoitusKohteet`, `haeKotiKohteet`). Itse `hytti_kortit`-taulu ja sen etusivu-UI pysyvät koskemattomina kunnes Loki korvaa ne myöhemmin (§13 Vaihe 5).
- **UI-sijainti vahvistettu 16.8. (Katri):** kohdevalikko ei ole uusi elementti vaan sama paikka missä murun perässä jo näkyy kaksi ikonia — ⚓ (ankkuri) ja ⋯ (kolme pistettä). Kohdevalikko käyttää olemassa olevaa ⋯-rivivalikkoa (`avaaKotivalikko`/`openRowMenu`, script.js), ei omaa uutta nappiaan.
- **Lisäys valikkoon (Katrin pyyntö 16.8.):** "Poista"-toiminto puuttuu tästä samasta ⋯-valikosta tällä hetkellä (on olemassa jossain muualla/eri tavalla) — Katri haluaa sen samaan valikkoon kohdevalintojen rinnalle, ei erilliseksi.
- **AUKKO/UX-korjaus (Katrin havainto 16.8.):** kun murulle asettaa kodin (`asetaLaiturinKoti`), "piilota Laiturista" -kytkin **muuttuu harmaaksi (disabloituu)** kodinasetuksen yhteydessä — nykyinen automaattinen oletus (`kohdeOnOletuksenaPiilotettu`, kohdekohtainen "piilota aina"-asetus) toimii hyvin suurimmassa osassa tapauksia, mutta käyttäjän pitäisi silti VOIDA säätää piilotusta itse manuaalisesti myös sen jälkeen kun koti on asetettu — ei jäädä lukkoon. Koden pitää korjata niin että kytkin pysyy käytettävissä (esitäytettynä automaattioletuksella, mutta ei disabloituna) kodinasetuksen jälkeenkin.
- **Editori itse ei muutu.** §16.2:n koko näytön kirjoituspinta pysyy sellaisenaan — uudistus koskee vain sitä minne ja miten kohde valitaan editorin ympärillä, ei itse kirjoituspintaa.

> **AUKKO — löydös 16.8., tarkistettava kiireellisesti (samaa perhettä kuin §8.3b:n aiempi yksityisyysvuoto):** Katrin havainto: Hytin projektien (kurssien) OTSIKOT näyttävät olevan näkyvissä kaikille, vaikka Hytin pitäisi olla yksityinen (`opinto_kurssit`:n pitäisi olla `owner_id`+RLS-eristetty, ks. KONSEPTIKIRJA.md 4.11). Ei vahvistettu bugiksi, vain havainto ("I guess all") — Coden pitää tarkistaa `opinto_kurssit`-taulun RLS-policyt ja mistä näkymästä otsikot näkyivät, ennen kuin tätä käsitellään korjauksena.
- **Kaksitasoinen sisäänmeno:** (1) pakollinen kotivalinta lisäyshetkellä, (2) vapaaehtoinen tarkennuskerros sen jälkeen (esim. mihin solmuun täsmälleen). Koskee myös helmiä, ei vain kurssimateriaalia.
- **RATKAISTU 16.8.2026 — muistiinpanot eivät kuulu Reittiin.** Katrin vahvistus: muistiinpanot siirrettiin pois Reitti-osiosta juuri siksi että ne eivät oikeastaan kuulu kursseihin — tästä syntyi oma neljäs välilehti Loki (§6b). "Reitti-osiossa näkyvät muistiinpanot" -maininta aiemmassa täydennyksessä oli siis vanhentunut/väärä poluku, ei uusi päätös. Muistiinpanot pysyvät yksinomaan Lokissa.
- **Editorin toteutustapa — vapaa (Katri 16.8.):** ei väliä toteutetaanko kirjaimellisesti sama jaettu komponentti kaikkialla (Laituri, Loki, kurssimateriaali) vai erilliset mutta samalta näyttävät/käyttäytyvät toteutukset — kumpi on Codelle helpompi. Ainoa vaatimus on että käyttäjälle näkyy ja tuntuu samalta kaikkialla (§16.2:n periaate säilyy, vain toteutustapa on vapaa).
- **Idea, ei päätetty:** Laiturin oma arkisto siirrettäisiin Asetuksiin, jos sille osoittautuu tarvetta.
- **Vanhentunut huomio korjattu:** eräässä aiemmassa keskustelussa "kiireellisin rakennuskohde" oli tiedostotyyppien syöttö Laiturista Hyttiin — tämä on jo RAKENNETTU (§16.3), ei enää kiireellisin.

### 16.6 Lokin tietokohde — minimaalinen

Ks. §6b. `loki_merkinnat`-taulu (tai vastaava, nimeä ei lopullisesti vahvistettu) — ei näkymää, ei editoria, data vain kertyy sinne kun yksityisestä paikasta lisätty ankkuri lasketaan.

### 16.7 Ei rakennettu

- docx/doc-purku, äänen tallennus, Loki-välilehti kokonaisuudessaan, OCR skannatuille pdf:ille, oma sanelu, muotoiluvalikot editoriin, solmun oma muistiinpanokenttä, vapaamuotoinen muokkaus poiminnan yhteydessä.

### 16.8 Testaus — vielä osittain varmistamatta

Rakenteellisesti validoitu (syntaksi, CSS-tasapaino, DOM-id-ristiviittaukset) jokaisen erän jälkeen, mutta osaa ei ole vielä varmistettu oikealla laitteella/kirjautumisella: tiedostonvalinta iPhonella, iso pdf, `piilota_laiturista` kahdella laitteella, editori pitkällä tekstillä, sanelu.

---

## 17. Asetukset (uusi osio, toinen keskustelu 9.8.2026) — ei vielä rakennettu

Säädettäviä arvoja, kaikki dataa eikä kovakoodattua:

| Asetus | Oletus |
|---|---|
| Iltatarkistuksen kellonaika | 21.45 |
| Retrieval-kierrosten määrä valmiuteen | 3 (jo §7.4:ssä) |
| Nousemismuistutuksen kynnys | 2 h (§4.3) |
| Raskaan päivän tehtäväkynnys ("pysähdy ja lepää") | 5 tehtävää |
| Vaiheensiirtymän kehote | päällä, voi kytkeä pois (jo §7.4:ssä) |
| Kertausvälit | 1, 3, 7, 21 pv |
| Päiväkatto | ei asetettu v1:ssä, kerätään ensin dataa (§18) |
| Vaiheiden ohjeelliset kestot | ks. `sung-metodi.md` |
| Suljetut ikkunat, päivän opiskeluaika, aterian kesto | jo §4.5/§4.5b:ssä |

**Kehote-mekanismin poiskytkentä ei ole mukavuusominaisuus vaan menetelmän vaatimus:** ohjaus joka auttaa aloittelijaa haittaa edistynyttä. Sama koskee ohjeiden yksityiskohtaisuutta, jonka pitää voida laskea osaamisen kasvaessa.

**Uusi UI-elementti — tuntemus-säädin, ei aiemmin speksattu tarkemmin.** Säädintä (käyttäjä arvioi kuinka tuttu aihe on) **ei saa kysyä usein.** Mitä useammin oppijaa pyydetään arvioimaan vaikeutta, sitä epätarkempia vihjeitä hän käyttää ja sitä huonommin suoriutuu. Kerran solmun alussa, ei joka istunnossa eikä joka vaiheessa.

**Lisäys (relay 16.8.):**

- **Vapaapäiväkytkin ≠ kuormitustila.** Kaksi eri kytkintä, molemmat omassa Hytissä — ei sama asia vaikka molemmat vaikuttavat siihen mitä tarjotaan.
- **Kriittinen: äly ei saa vuotaa tietoa RLS-rajan yli ehdotuksissaan.** Koskee kaikkia älyehdotuksia (sillat, kertaus, tehtävät) — tarkistettava erikseen jokaisen uuden älykutsun yhteydessä, ei kertaluontoinen korjaus.
- **Kuormitustila ei saa poistaa Juhan ankkureita/Hyttiä.** Kuormitustila piilottaa Katrin oman kortin (§15.5), mutta ei saa vaikuttaa toisen käyttäjän sisältöön.
- **"En pysty mitään" -päivänä ei nosteta raskasta tehtävää ensin** — sama henki kuin §19:n kuormataulukko, mutta erikseen mainittu ääripää.
- **AUKKO:** arkistointiin (materiaalin/Miro-taulujen pitkäaikaissäilytys, §16.3, §10.1) tarvitaan tietosuojaselvitys ennen kuin sitä rakennetaan tuotantoon.
- **Idea, ei päätetty:** laitekohtainen näkyvyys (esim. eri sisältöä koti- vs. työpuhelimella).

---

## 18. Data ja logitus (uusi osio, toinen keskustelu 9.8.2026) — ei vielä rakennettu

Tallennettavaa, lisäyksinä aiempaan:

- Boostit ja niiden kestot
- Päiväkaton ylitykset
- "En pääse alkuun" -merkinnät (§4.9)
- Tietotyypin vaihdokset (§7.1)
- Vaihesiirtymät
- Kevyet kertaukset erikseen merkittyinä — kevyt kertaus väsyneenä on parempi kuin ei mitään, mutta se ei saa nollata kertausväliä samalla painolla kuin täysi kertaus

**Lisäys (relay 16.8.):**

- **Kurssi on aina tiedossa käynnistyshetkellä** (§4.3, §7.1) — epävarmuutta voi olla vain solmutasolla, ei koskaan siitä mistä kurssista on kyse.
- **Idea, ei päätetty — kuvaluokittelu:** valokuva paperisesta muistiinpanosta/tehtävästä → äly ehdottaa OCR-tekstin perusteella mihin solmuun se kuuluu, käyttäjä vahvistaa yhdellä napautuksella. Kevennetty versio: yksi kuva koko paperista riittäisi karkeaan kurssitason edistymismerkintään ilman solmutason tarkkuutta.
- **Epäonnistuminen ja käytetty aika ovat tärkeää dataa siinä missä onnistuminenkin** — molempien pitää tallentua, ei vain "tehty"-merkintöjen.

**Datan talteenotto alkaa heti, näkymä voi tulla myöhemmin.**

**Päiväkattoa ei aseteta keksittynä numerona.** V1 näyttää päivän kertymän ilman arvostelua; ylitysmerkintä ilmestyy vasta kun datasta näkyy montako slottia on sopivasti. Ensimmäiset viikot ovat mittausta eivätkä tuomiota.

Katto voi lisäksi johtua opintopisteistä: 15 op = 405 h, 20 op = 540 h, 25 op = 675 h; jaettuna lukukauden viikoille 25/34/42 h viikossa, miinus luennot. Silloin se säätyy itsestään kun kurssimäärä varmistuu.

**Katon tarkoitus ei ole rajoittaa kunnianhimoa vaan pitää opiskelu työpäivän sisällä.** Riski ei ole liian vähäinen opiskelu vaan se että opiskelu valuu iltoihin ja viikonloppuihin.

**Kun deadline-tehtävät ylittävät katon useana päivänä** (3 putkeen tai 5 seitsemästä): suora huomautus, muotoiltuna "tämä ei mahdu, mikä kurssi kevenee tällä viikolla" — ei "olet jäljessä".

---

## 19. Kuormitus ja jaksaminen (uusi osio, toinen keskustelu 9.8.2026)

**Ylikuormitus ei ole hinta paremmista tuloksista vaan syy huonompiin.** Lähdeaineiston mukaan kiirehtijät ja osan väliin jättäjät epäonnistuvat moninkertaisesti todennäköisemmin, ja liiallisella kertauksella on käänteinen U-vaikutus jossa kärsivät sekä tulokset että jaksaminen.

**Tunti päivässä seitsemänä päivänä on parempi kuin seitsemän tuntia yhtenä päivänä.** Tämä ei ole kompromissi perheen hyväksi vaan menetelmän ydin — tehokkuus ja läsnäolo osoittavat samaan suuntaan.

**Aktiivinen lepo ehdotetaan, ei vain sallita.** Päivätasolla se on tärkeämpi kuin istunnon sisällä, koska väite koskee päivien välistä jakaumaa. Istunnon välissä ehdotus tulee tehtävän päätyttyä ("kävele kymmenen minuuttia ennen seuraavaa"), ei ajastimena joka komentaa kesken tekemisen.

**Kertausjonon pituus on encodingin mittari, ei kertaustarpeen mittari.** Jos jono kasvaa pitkäksi, se on merkki keskeneräisestä encodingista — ei syy kerrata enemmän eikä syy lykätä uuden opettelua.

**Vaihe valitaan päivän kuormituksen mukaan** (yhtäpitävä §7.3:n kuormataulukon kanssa, tarkentaa sitä): kevyt päivä → encoding ja priming (uuden opettelu vaatii eniten kapasiteettia), keskitaso → retrieval, raskas päivä → overlearning ja kevyt kertaus, ei uuden opettelua.
