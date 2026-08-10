# Sataman design system — merikartta & loki

## Perusidea

Satama on nimetty kuin rustiikkinen merellinen kalastajakylä: hytti, ruori,
varasto, solmu, silta. Kuittiteema (mikä oli alkuperäinen suunta) tulee
väärästä maailmasta — kauppa ja transaktio, ei satama. Nimistö ja pinta
eivät olleet sukua toisilleen, ja siksi kokonaisuus ei tuntunut eheältä.

Uusi suunta on **merikartta ja laivan loki**. Ei ranta, ei aallot, ei
ankkurikoristeita — merikartta informaatiomuotoilun perinteenä: tehty
luettavaksi yhdellä silmäyksellä huonossa valossa kun on kiire, jokainen
merkki tarkoittaa yhtä asiaa, mikään ei ole koristeeksi. Silti kaunis.
Se on "toimiva ja selkeä, joka näyttää sairaan hyvältä" — ei tarvitse
valita kumpaa.

Tavoitefiilis: kun sovelluksen avaa, pitäisi tulla olo *"joku on oikeasti
miettinyt miten nämä asiat ovat täällä"* — että kaikki on yhtä
kokonaisuutta, ei kokoelma irrallisia näkymiä.

---

## Paletti

Lopullinen, korjattu kierroksen 2 palautteen jälkeen:

| Nimi | Hex | Käyttö |
|---|---|---|
| Paperi | `#EAE6DC` | tausta |
| Muste | `#221F1A` | teksti |
| Matalikko | `#F0C79E` | < 50% vahvuus / raskas kuorma |
| Karikko | `#E0A46F` | hyvin matala / SOS |
| Syvänne | `#3F5F53` | ≥ 50% vahvuus, "tämä on hallussa" |
| Messinki | `#9C7A43` | **KAIKKI kosketettava** — napit, kehykset, valitsimet |
| Sinappi | `#C29A2E` | **koriste** — helmen kiilto, korostukset. EI kosketus |
| Vaara | `#B8433A` | huolilippu, ristiriita (Ruorin oma, ei muuteta) |

Sininen on pysyvästi varattu Juhan kalenterille — ei käytetä mihinkään
muuhun koko systeemissä.

**Kaksi väriä, kaksi eri tehtävää — ei sekoiteta:** messinki ja sinappi
näyttävät samantyyppisiltä (molemmat lämpimän kullanruskeita), mutta niillä
on tarkasti eri työ. Messinki = "tätä voi painaa". Sinappi = "tämä on
kaunista katsottavaa mutta ei tee mitään". Jos joskus epäselvää kumpi
sopii, kysymys on: reagoiko tämä kosketukseen? Jos kyllä → messinki.

Matalikko ei ole varoitusväri. Merikartassa matala vesi on täysin
normaali, neutraali asia jonka pitää näkyä jotta tietää missä kulkee —
ei punainen, ei huutomerkki. Sama periaate pätee kaikkeen mikä kuvaa
osaamisen tasoa: heikko taito näytetään heikkona, rehellisesti, ilman
että siitä tehdään moitetta.

---

## Typografia

**Yksi ainoa fontti koko systeemiin: Courier Prime.** Ei fonttiparia
(esim. display-fontti + leipätekstifontti). Tämä on tietoinen, kurinalainen
valinta: koko, paino ja harvennus tekevät hierarkian — kuten oikeissa
merikartoissa, joissa kaikki teksti on samaa käsialaa mutta eri kokoista.
Fontti itsessään on Sataman "sielu" eikä sitä vaihdeta.

Asteikko (viitteellinen, ei tyhjentävä):
- **Syvyysluku** — 46px, paino 700, harvennus -0.03em. Tämä on merikartan
  tapa esittää tärkein numero: paljas luku pinnalla, ei laatikkoa, ei
  selitettä. Käytetään kellonajoille, boost-minuuteille, keskeisille luvuille.
- **Otsake** — 22px, paino 700
- **Leipäteksti** — 15px
- **Merkintä/pieni** — 12.5px, harvennus 0.16em, VERSAALI, vaimea väri —
  osioiden otsikot ja toissijainen tieto

---

## Muotokieli — kuitti vs. iOS ei enää päde, uusi jako:

**Kaksi pintaa, kaksi eri pyöristystä, kaksi eri roolia:**

- **Luettava pinta** (`--r-luettava: 3px`) — lähes suora kulma, hyvin
  hienovarainen pyöristys. Kaikki mitä *luetaan*: kortit, paneelit, arkit,
  kalenteririvit. Tausta on hieman läpikuultava paperi
  (`rgba(255,253,248,.5)`), reunaviiva on ohut ja vaimea.
- **Kosketettava pinta** (`--r-kosketettava: 13px`) — selvästi pyöristetty,
  liquid glass -henkinen. Kaikki mitä *painetaan*: napit, valitsimet,
  vaihtimet. Messinkireunus, hienovarainen lasimainen tausta
  (`backdrop-filter: blur`), sisävalo (`inset shadow`).

**Tärkeä periaate: "mitä painetaan" ja "mitä luetaan" ovat kaksi eri
akselia, eivät sama asia.** Nyt-kortti on kokonaan painettava (koko
laatikko vie sisälle, ei erillistä nuoli-nappia), mutta se käyttää silti
**luettavan pinnan pyöristystä**, ei kosketettavan. Se on tarkoituksellinen
poikkeus: kortti on ensisijaisesti jotain mitä luetaan, ja sen
painettavuus on toissijainen ominaisuus. Tätä ei pidä yleistää — jos jokin
on ensisijaisesti *toiminto* (nappi, kytkin, valitsin), se saa
kosketettavan pinnan.

**Merikartan viivakieli** korvaa kuitin perforoinnit: hiusviivat
(`rgba(34,31,26,.16)`), pisteviivat erottimina (esim. ylläpitolistan
solmujen välissä), ohuet kehykset. Tausta saa hyvin hienovaraisen
rakeisuuden (radial-gradient-pistekuvio, 3px ruudukko) — ei
tekstuuritapetti, vain aavistus paperia.

---

## Liike

**Kuin veden alla — kannateltua ja rauhallista.**

- Kestot: 500–850ms (`--keski: 520ms`, `--hidas: 820ms`). Ei koskaan
  nopeita napsahduksia.
- Easing: `cubic-bezier(.24,.72,.30,1)` — pehmeä kiihdytys, kevyt
  asettuminen loppuun. Ei pomppuja, ei jousto-efektejä.
- `prefers-reduced-motion: reduce` ohittaa aina kaiken liikkeen — tämä on
  ehdoton, ei säädettävä asetus.

---

## Haptiikka

**Vain siellä missä käyttäjältä halutaan toimintaa.** Ei väkisin keksittyä
haptiikkaa joka paikkaan. Tähän mennessä nimetyt kohdat:

- iOS-natiivi rullavalitsin (esim. boost-minuutin tarkka syöttö) — kevyt
  naps jokaisella pykälän kohdalla
- Boost-napit kosketettaessa

Jos jollekin komponentille ei ole selvää syytä haptiikalle, sitä ei lisätä.

---

## iOS-natiivi kontrolli merikartan päällä

Kriittinen vaatimus: **iOS-natiivi valitsin ei saa näyttää siltä että se
on "eksynyt väärältä planeetalta."** Ratkaisu on kehystää se
navigaatio-instrumenttina kartan päällä — viivoitin, harppi, suurennuslasi
asetettuna merikartalle:

- Lasi on aina **lämpimästi sävytettyä**, ei koskaan neutraalin harmaata
  (`linear-gradient` paperinsävyisistä läpikuultavista väreistä)
- Kehys on messinkiä (`rgba(156,122,67,...)`), ei systeemin oletusharmaata
- `backdrop-filter: blur` antaa lasimaisen syvyyden mutta säilyttää
  lämpimän kokonaisvaikutelman

Tämä yksi sääntö (lämmin sävytys, ei harmaa) ratkaisee suurimman osan
siitä sopiiko natiivi kontrolli kokonaisuuteen vai ei.

---

## Kartta-näkymän erityislogiikka

Kartta ei ole yksi näkymä vaan **kaksi eri näkymää**, vaihdettavissa
näkymänvaihtimella (ei kolme esitystapaa samasta datasta, kuten
aikaisemmassa luonnoksessa harkittiin):

### Näkymä 1: Opiskelu
Kurssien ja solmujen omilla nimillä. Näyttää kuinka vahvasti kutakin
solmua on harjoiteltu, montako harjoitusta on tehty, mitkä solmut ovat
ylläpidossa. Tämä on rehellinen, yksityiskohtainen kuva opiskelusta.

### Näkymä 2: Työelämätaidot
**Ei yhtään kurssin nimeä näy.** Isot nimet ovat taitoja joilla on nimi
työelämässä (esim. "Concept design", "Service design", "Realistisen
aikataulun luominen") — Satama nimeää ne itse siitä mitä osataidoista on
kertynyt. Pienet nimet ovat osataitoja joista isot taidot koostuvat.
Logiikka on aina näkyvissä: *"vahva tämä + vahva tuo → yhdessä ne ovat
taito nimeltä X."*

Osataitojen lähteet, kukin omalla tagillaan:
- **kurssi** — kurssidatasta
- **harjoittelu** — harjoittelun tuotoksista
- **palaute** — ohjaajan antamasta palautteesta
- **käyttäytyminen** — siitä miten käyttäjä toimii, ei mitä hän on
  suorittanut (esim. "puskurien jättäminen" pääteltynä siitä kuinka usein
  tehtävä aloitetaan alle 24h ennen deadlinea)

**Ehdoton vaatimus: kaikki taidot eivät saa näyttää vahvoilta.** Oikeasti
heikommat osataidot näkyvät heikkoina (matalikon värissä), vahvuudet
vahvoina (syvänteen värissä) — molemmista näkyy aina mistä osataidoista/
solmuista ne koostuvat, jotta havainto on perusteltavissa eikä hatusta
temmattu.

Käyttäjän oma vertauskuva koko Kartalle: *ikään kuin Satamalla olisi oma
PACER-kurssi käyttäjästä itsestään, joka tekee jatkuvasti muistiinpanoja
hänen edistymisestään, osaamisestaan, harjoitusten määrästä,
opiskelutavoistaan ja siitä miten hän yleensä toimii.*

Visuaalinen logiikka: verkko kiristyy ja meri syvenee/tummenee siellä
missä yhteyksiä ja vahvuutta on paljon — kaksi merkkiä samasta asiasta,
jotta sen näkee myös nopealla vilkaisulla eikä tarvitse lukea värejä
tarkasti. Kartta-näkymä **ei** koskaan avaa Miroa — se piirtää oman
näkymänsä Sataman omalla visuaalisella kielellä, vaikka kuvaakin
sisällöllisesti samaa riippuvuustietoa mitä Mirossa käsitellään.

---

## Mitä tästä EI pidä yleistää

- Meriteema ei tarkoita että taustalla pitäisi olla aaltoja tai muuta
  koristeellista kuvitusta jonka takia mistään ei saa selvää — teema
  näkyy palettina, nimistönä ja logiikkana, ei pinnan koristeluna.
- Ei kahta väripintaa samalle roolille (esim. messinki JA sinappi
  kosketukselle) — jokainen väri palvelee tarkasti yhtä tarkoitusta.
- Ei haptiikkaa joka paikkaan vain koska se on "kiva lisä."
