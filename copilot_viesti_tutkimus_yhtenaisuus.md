# Tutkimuspyyntö Codelle — Kalenterin pinta-tilanne + koko Sataman visuaalinen yhtenäisyys + kalenterin toimintalogiikka

Ei rakennuspyyntö vielä — tämä on tutkimus-/raportointipyyntö. Kolme asiaa, kaikki liittyvät toisiinsa.

## 1. Onko kalenterin merikartta-pinta oikeasti deployattu?

Muistiinpanot.md:n 24.8.2026-merkinnän mukaan `#kalenteri-view` sai `.ruori`-luokan reseptin ja `.kalenteri-tila-btn` sai `.saadin`-reseptin (2. rakennusviestini mukaisesti). Kävin juuri läpi tuoreen `style.css`:n enkä löydä tätä: `.kalenteri-tila-btn` (rivit ~301–320) käyttää yhä `font-family: 'Courier New'`, `border: 1px dashed var(--border-dash)`, `color: var(--muted)`/`var(--accent)` — ei messinkiä, ei `--r-kosketettava`, ei lasitaustaa. `#kalenteri-view` esiintyy CSS:ssä vain yhdessä kohdassa (maisematilan `max-width`-sääntö), ei missään tausta/fontti-ylikirjoitusta. Body peritty fontti on siis edelleen `Courier New`.

**Kysymys:** onko tämä muutos tehty jossain haarassa/committissa mutta ei mergetty/deployattu, jäikö se kesken, vai kirjoititko muistiinpanon suunnitelmana ennen toteutusta? Tarvitsen tarkan tilannekuvan ennen kuin annan lisää kalenteripyyntöjä, jotta emme rakenna tekemättömän työn päälle. Jos muutos on tehty jossain mutta ei näy Katrin repo-kopiossa, kerro missä se on ja mitä täytyy tehdä jotta se saadaan livenä toimimaan (deploy, migraatio, tms).

Samalla: muistiinpanot mainitsevat myös poistaneenne `.kalenteri-viikko-merkki`-luokan orpona — se on kuitenkin yhä `style.css`:ssä (rivit ~679–690). Tarkista tämäkin samalla.

## 2. Koko Sataman visuaalinen yhtenäisyys — kartoitus

Tässä on isompi, pidempiaikainen tavoite: Ruori-etusivu on nyt siinä pisteessä että se tuntuu omalta, yhtenäiseltä, "Satamalta" — mutta muut osiot eivät vielä tunnu samalta sovellukselta. Konkreettinen esimerkki: Laituri sai jo paperi-taustan (`#laituri-view { background: var(--paperi); --ground: var(--paperi); ... }`, style.css ~1086) mutta tämä on vain tausta+reunaväri — ei fonttia (peritty `Courier New` jos ei muuta ylikirjoitusta), ei nappien/korttien muotokieltä (`--r-kosketettava`, messinki, lasitausta), ei liikettä. Tämä selittää miksi Laituri tuntuu edelleen "eri maailmasta" vaikka jokin osa siitä on jo korjattu — se on puolivälissä eikä kokonaan.

**Pyyntö:** käy läpi kaikki sovelluksen näkymät (index.html: `#app-view`, `#asetukset-view`, `#hytti-view`, `#hytti-kortti-view`, `#kalenteri-view`, `#laituri-view`, `#lapsi-view`, `#muistilaput-view`, `#opinto-kurssi-view`, `#opinto-tehtava-view`, `#taitosolmu-view`, `#teema-view`, `#vahdittu-view`, `#varasto-view`, `#editori-view`) ja raportoi per näkymä:

- Onko fontti Courier Prime vai peritty Courier New?
- Onko tausta/teksti merikartta-tokeneita (`--paperi`/`--muste`) vai vanhoja (`--ground`/`--text` ilman skoopattua ylikirjoitusta)?
- Ovatko napit/kortit/valitsimet `.saadin`/`.arkki`/`--r-kosketettava`/`--r-luettava`-reseptillä, vai vanhalla katkoviiva+`--accent`-tyylillä?
- Onko liike (hover/active) `--keski`/`--kelluu`-resepti käytössä, vai ei liikettä ollenkaan / vanha tyyli?

## Mitä tästä halutaan lopulta

Tavoite EI ole tehdä kaikkea kerralla — tämä tutkimus on pohja sille että voidaan tehdä sama systemaattinen siirto muillekin osioille, samaan tapaan kuin kalenterille juuri pyydettiin, yksi kerrallaan. Mutta ennen listaa rakennuspyyntöjä halutaan ensin tarkka, rehellinen tilannekuva: mitä on jo tehty (kuten Laiturin osittainen taustakorjaus), mitä ei ole koskettu ollenkaan, ja onko jossain (kuten kalenterissa nyt) ristiriita sen välillä mitä muistiinpanot väittävät ja mitä koodi oikeasti tekee.

**Ei pyydetä rakentamaan mitään tässä viestissä — vain raportti.** Seuraava viesti (kun raportti on saatu) sisältää priorisoidun listan mitä osioita korjataan seuraavaksi ja missä järjestyksessä.

## Lisäksi kaksi pidempään avoinna ollutta kalenteriasiaa (muistutuksena, ei koske tätä tutkimusta)

- Ristiriitapaketti v2 (hoivaikkunat, huolilippu) on rakennettu tietokantaan mutta ei koskaan testattu oikealla käytöllä.
- Laituri-jäsennys kalenterimerkintöihin (vapaan tekstin tulkinta rakenteelliseksi merkinnäksi, esim. "mummi hakee Rebekan") ei ole vielä rakennettu.

Näihin ei pyydetä toimenpiteitä nyt — vain merkitään ettei niitä ole unohdettu.

## 3. Isompi kysymys: ei vain UI vaan koko kalenterin toimintalogiikka konseptin valossa

Tämä on tärkein osa tätä tutkimuspyyntöä, joten pysäytä hetkeksi pelkkä CSS-ajattelu. Vilkaisuarvo on minulle koko Saman tärkein yksittäinen mittari (KONSEPTIKIRJA.md periaate 1: *"yhdellä silmäyksellä pitää nähdä olennainen. Mittari: väsynyt käyttäjä ohikulkevalla vilkaisulla — jos hän ei saa tiedosta kiinni sekunnissa, näkymä on liian täynnä tai merkki liian epäselvä."*). Haluan tietää, missä kalenteri TÄLLÄ HETKELLÄ pettää tämän mittarin — ei pelkkä väri/fontti, vaan rakenne ja toimintalogiikka. Käy läpi konseptikirja ja SATAMA_SPEKSI kalenterin osalta ja raportoi rehellisesti seuraavista, per kohta kyllä/ei/osittain + lyhyt selitys mitä koodissa oikeasti tapahtuu:

**a) Kerrosarkkitehtuuri ja niputus.** Konseptikirja mainitsee kalenterin kerrosarkkitehtuurin: "hytti-tapahtumat perheelle kevyemmällä ilmeellä" ja "▫N-niputus kuukaudessa". Onko tämä toteutunut kuukausinäkymässä — eli näkyykö esim. moni pieni opiskeluun liittyvä tapahtuma yhtenä niputettuna merkintänä ("▫3") sen sijaan että jokainen vie oman rivin/palkin? Jos ei ole toteutunut, mikä nyt tapahtuu sen sijaan — tuleeko kaikki tapahtumat samalla painoarvolla riippumatta siitä ovatko ne isoja perhemenoja vai pieniä yksityisiä opiskelumerkintöjä? Tämä on suoraan vilkaisuarvo-kysymys: liikaa samanarvoista tietoa tappaa vilkaisun yhtä varmasti kuin sotkuinen ulkoasu.

**b) K/J/P-omistajamerkit.** Konseptikirja mainitsee "K/J/P-omistajamerkit" osana ristiriitapakettia — onko näitä käytössä, ja jos on, miten ne näkyvät nyt vs. miten niiden pitäisi näkyä uudessa merikartta-pinnassa? Onko tämä sama asia kuin `.kalenteri-omistaja`-luokka jonka löysin style.css:stä (vanha `--border-dash`/`--muted`-pari)?

**c) Kuormavahti-kytkentä.** Kuorma näkyy jo taustavärinä (toimii hyvin, ei muuteta) — mutta konseptikirjan mukaan Kuormavahti kytkeytyy myös muihin toimintoihin: Kevyen päivän ehdotus, Parisuhdeaika-ehdotus, opiskelun kolmen voiman moottori. Näkyvätkö nämä kytkennät kalenterinäkymässä millään tavalla juuri nyt (esim. ehdotus kevyestä päivästä), vai ovatko ne olemassa vain muualla sovelluksessa? Ei pyydetä rakentamaan mitään — vain kartoitus mikä on kalenterin JA näiden ominaisuuksien rajapinnalla juuri nyt.

**d) Rikastuskerros ja lähtöaika-päättely.** Konseptikirjan kohta 4.4 kuvaa syötetapahtumien rikastuskerroksen (paikka, muistiinpano, matkatapa lisätään oman kerroksen kautta lähdettä muokkaamatta) ja siitä syntyvän lähtöaika-päättelyn ("lähde 13.10" -muistutus aika − matka-arvio − puskuri perusteella). Onko tätä sovellettu Lukkarin luentoihin, vai onko rikastus toistaiseksi vain konsepti/rakennettu muille syötteille? Tämä on suoraan relevantti sille mitä juuri pyysin (koulun osoite luentoihin) — jos rikastuskerros on jo yleiskäyttöinen koneisto, osoitteen lisäys pitäisi olla sen soveltamista, ei uusi erillinen ratkaisu.

**e) Tunnettu avoin asia: "värimaailma kalenterissa jakaa mielipiteet".** Konseptikirjan tunnettujen avointen asioiden listalla (19.7.2026-tilanne) on maininta "värimaailma kalenterissa jakaa mielipiteet (Copilot-hiontaa)". Onko tästä lisätietoa muistiinpanot.md:ssä — mitä mieltä joku (Katri tai Juha) on ollut väreistä, ja onko tämä yhä avoin vai ratkaistu jossain vaiheessa? Haluan tietää oliko tässä joku konkreettinen ongelma jota en enää muista.

**f) Symmetriaperiaate kalenterissa.** "Ei rooleja, vain omistajia" — pätevätkö kalenterin kaikki UI-ratkaisut (nappien sijoittelu, näkymien oletukset) molemmille käyttäjille symmetrisesti, vai onko kalenterissa jäänyt Katri-keskeisiä oletuksia (esim. oletusnäkymä, oletusomistaja uutta tapahtumaa lisättäessä) jotka pitäisi tarkistaa?

**Mitä tästä osiosta halutaan:** sama kuin osiosta 2 — rehellinen tilannekuva, ei rakennustyötä. Tarkoitus on että kun seuraavaksi kirjoitan priorisoidun rakennuspyynnön, se ei koske vain sitä miltä kalenteri NÄYTTÄÄ vaan myös sitä miten se TOIMII suhteessa koko Sataman periaatteisiin — erityisesti vilkaisuarvoon, joka on minulle tärkein yksittäinen mittari koko sovelluksessa.
