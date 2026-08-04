# Satama — Konseptikirja

> **Mikä tämä dokumentti on:** Sataman suunnittelun muisti. Kirjoitettu heinäkuussa 2026, kun kehitys siirtyi Claude Codesta Copilot-avusteiseen ylläpitoon.
> **Kenelle:** Katrille itselleen ja mille tahansa tekoälylle (Copilot tms.) jonka kanssa Satamaa jatketaan.
> **Suhde muihin dokumentteihin:** `muistiinpanot.md` = tekninen historia, bugiloki, rakennettujen osien yksityiskohdat. `COPILOT.md` = tekninen työskentelyohje. **Tämä kirja** = periaatteet, rakentamattomien konseptien täydet speksit, ja miksi asiat ovat niin kuin ovat. Jos tämä kirja ja muistiinpanot ovat ristiriidassa, tuoreempi voittaa — ja tämä kirja on kirjoitettu 17.–23.7.2026.

---

## OSA 1: PERIAATTEET

Nämä eivät ole koristeita vaan päätössääntöjä. Kun uusi ominaisuus tai korjaus on vaakalaudalla, se testataan näitä vasten. Jokainen on syntynyt oikeasta tilanteesta — syntytarina on mukana, koska se kertoo *miksi* sääntö on olemassa.

### 1. Vilkaisuarvo
Yhdellä silmäyksellä pitää nähdä olennainen. Mittari: **väsynyt käyttäjä ohikulkevalla vilkaisulla** — jos hän ei saa tiedosta kiinni sekunnissa, näkymä on liian täynnä tai merkki liian epäselvä.
*Seurauksia:* pallurat kertovat "täällä on jotain" ilman avaamista · kuormapilleri kertoo päivän raskauden yhdellä värillä · hitaus tappaa vilkaisuarvon yhtä varmasti kuin sotku (30 s latausviive teki kalenterista käyttökelvottoman).

### 2. Maksimiautomaatio, minimikustannus
Kaikki mikä voidaan päätellä, päätellään — käyttäjältä ei koskaan vaadita ylläpitorutiinia jonka kone voi hoitaa. Jos ominaisuus vaatii "muista tehdä X säännöllisesti", se kuolee (todistettu: "käytä minut ensin" -hylly, leikkuulautakattaus — molemmat hyviä käytäntöjä jotka kuolivat käsityövaatimukseen).
*Seurauksia:* kuittikuvaus yhdellä eleellä kävellessä, ei kirjaamista · reseptit täydentyvät elämällä, ei urakalla · jos käyttäjä ei tee mitään, järjestelmä degradoituu kauniisti (arvaukset epävarmistuvat, mikään ei hajoa).

### 3. Kolmiporras: äly ehdottaa, ihminen kuittaa
Tekoäly ei koskaan tee peruuttamatonta päätöstä yksin. Se saa lisätä ehdokkaita (katkoviivakehys), ihminen hyväksyy, hylkää tai siirtää. Korkein porras (automaattinen toiminta) vain asioissa joissa virhe on halpa ja peruttavissa.
*Seurauksia:* ✨-ehdokkaat · 💬-ehdotukset toiselle · Ruoan "lisää Kauppalistalle" -ehdotukset aina kuitattavia · ei koskaan automaattisia ostoksia, poistoja tai kalenterikirjoituksia.

### 4. Turvainvariantti: mikään kirjoitettu ei katoa
Käyttäjän kirjoittama sisältö ei koskaan tuhoudu järjestelmän toimesta. Poisto ankkureista palauttaa Laituriin. Siirto piilottaa, ei poista. Äly saa lisätä, ei koskaan muokata tai poistaa käyttäjän tekstiä.
*Syntytarina:* neljä kadonnutta ankkuria yhtenä tiistaina — pahin mahdollinen luottamusrikko työkalulle jonka koko tehtävä on "asiat eivät katoa täältä".

### 5. Vahvistus seuraa todellisuutta, ei aikomusta
Järjestelmä ei koskaan merkitse mitään tehdyksi/onnistuneeksi ennen kuin se on todistetusti tapahtunut. Kirjoituksen vastaus tarkistetaan. `success:true` ilman varmistusta on valhe.
*Syntytarina:* **VIISI** erillistä hiljaista epäonnistumista, joista pahin oli kalenterisynkka joka raportoi onnistumista viikkoja samalla kun yksikään uusi tapahtuma ei tullut kantaan (duplikaatti-ical_uid kaatoi koko kirjoituserän, kukaan ei katsonut vastausta). Tämä on kallein oppi koko projektissa. **Jokainen uusi kirjoituspolku: tarkista vastaus, ja epäonnistuminen ei saa näyttää tulokselta.**
*Auditointi 18.7.2026 (28789b5):* KAIKKI kirjoitus-/lähetyskohdat luettiin (103 kpl: 83 script.js + ~20 api/), ei otantaa. Löytyi 23 täysin tarkistamatonta + kymmeniä osittaisia → ~60 korjattu yhdellä kertaa. Vakavimmat: (a) **Laiturin pikakirjaus pyyhki localStorage-varmuuskopion vaikka kantakirjoitus epäonnistui** — turvainvariantti petti juuri virhetilanteessa jota varten se on olemassa; (b) yöajon tarkistamaton DELETE saattoi jättää haamuehdokkaan elämään samalla kun lähdemuru lukittui ikuisesti "käsitellyksi"; (c) offline-jono hävitti Postgres-tason virheet jonosta kuin ne olisivat synkanneet (try/catch ei nappaa niitä!); (d) kuittaus päivitti paikallisen näkymän kirjoituksen onnistumisesta riippumatta. Korjausmalli: jaettu ilmoitaKirjoitusvirheesta()-apuri (loki + toast + keskeytys) client-puolella, eksplisiittiset .ok-tarkistukset api-puolella. **Tarkat opit + 4 kohdan tarkistuslista uusille kirjoituspoluille: muistiinpanot.md "Kirjoituspolkujen auditointi" + COPILOT.md.** Opetus periaatteeksi: try/catch EI riitä (ei nappaa tietokantatason virheitä vastauksessa) — error-/ok-kenttä on katsottava AINA, ja paikallista tilaa (cache, localStorage, jono, laskurit) saa muuttaa vasta vahvistuksen jälkeen.

### 6. Hetki vs. ikkuna
Ajallisilla asioilla on kaksi luonnetta: **hetki** (kertaluontoinen, tietty aika — "palaveri ti klo 14" — nousee kerran kohdepäivänä, raukeaa illalla reagoimatta) ja **ikkuna** (takaraja — "osta liput 20.7. mennessä" — saa nousta kerran/päivä takarajaan asti). Näitä ei saa sekoittaa: hetki joka nousee joka päivä on kohinaa, ikkuna joka nousee kerran on riski.
*Lisäsääntö (17.7.):* **suhteellinen aika jäädytetään kirjoitushetkellä.** "Huomenna" tarkoittaa kirjoituspäivää+1 ikuisesti — ei "aina lukuhetkeä seuraava päivä". Muuten "huomenna" ei koskaan tule (todistettu: muru nousi kolmena aamuna koska kohde karkasi aina päivän edellä).
*Aika-auditointi 19.7. (5b83ed9):* neljäs saman perheen bugi löytyi ja korjattu — `isoDate()` laski "tänään" palvelimen UTC-kellosta, jolloin Helsinki-yön klo ~00–03 "tänään" oli EILINEN (kirjoitushetken jäädytys ja "jo mennyt" -tarkistukset päivän väärässä joka yö siinä ikkunassa). **Sääntö: "tänään" lasketaan AINA käyttäjän aikavyöhykkeessä (Europe/Helsinki), ei koskaan UTC-slicellä.** Aikakäsittelyn täydet säännöt + kesäajan päättymisen (25.10.2026) tarkistuslista: muistiinpanot.md.

### 7. Varastossa lista nukkuu
Varasto-osion listat ovat luettavaa referenssiä (reseptit, vakioluettelot), eivät suoritettavia tehtäviä — ei täppiä, ei kuittauksia. Lista herätetään käyttöön kopioimalla se elävksi.
*Toteumamerkintä 2026-08-03:* tämä on nykyisin osittain toteutettu. Varasto-listan asetuksista löytyy jo "Luo kopio" -toiminto, joka monistaa listan riveet uuteen listaan ja jättää alkuperäisen Varastoon koskemattomaksi malliksi. Tästä seuraa, että periaate 7 on käytännössä jo osittain implementoitu, mutta sitä kannattaa pitää silmällä vielä yhtenäisenä käyttäjäkokemuksena eikä vain erillisenä kopiointinappina.

### 7b. Laiturin säikeet ja koti
Muru + siihen liittyvät jatkoviestit muodostavat ketjun. Ketjun logiikka on rajattu vain saman murun sisäiseen ketjuun, ja Laiturin näkymä näyttää aina vain ketjun uusimman osan. Vanhempi osa valuu automaattisesti kotiin (teema, Vahdittu lepo, tavallinen lista tai Hytin kortti — mikä tahansa näistä) oikeassa aikajärjestyksessä. Jos ketju kasvaa 3 säikeen mittaiseksi ilman että murulle on valittu koti, ketjun jatkaminen estyy kunnes koti on valittu — tietoinen poikkeus "ei koskaan pakota" -periaatteesta.
*Toteumamerkintä 2026-08-03 (rakennettu):* korjattu ja yleistetty yhdeksi mekanismiksi. Vanha "Siirrä teemaan" (teema_id, koko ketju kerralla) korvattu "🏠 Aseta koti" -toiminnolla (`laituri.koti_tyyppi/koti_kohde_id/koti_kohde_nimi`, ks. sql/087): koti on kevyt osoitin, ei välitön siirto. Aina kun uusi jatkorivi tallentuu murulle jolla on koti, edellinen uusin segmentti kirjoitetaan kotiin KOHTEEN OMALLA kirjoitusreitillä (teema → uusi laituri-rivi teema_id:llä, sama "vanha valuu historiaan" -kaava kuin Sovitulla linjalla; lista/vahdittu → tuotteet-rivi; hytti → hytti_rivit-rivi) ja merkitään valuneeksi VASTA onnistuneen kirjoituksen jälkeen (`koti_segmentti_valunut`/`laituri_jatkorivit.valunut_kotiin`). Alkuperäinen sisältö ei koskaan poistu — valuminen on aina kopio, turvainvariantti säilyy. 3 säikeen kova raja + kirjoitetun tekstin säilyminen kentässä torjuttaessa toteutettu (script.js `jatkorivi-tallenna`-käsittelijä). Vanhat, ennen tätä päivää teema_id:llä siirretyt murut pysyvät koskemattomina (ei takautuvaa muutosta).

### 7c. "Ei tarvitse näkyä Laiturissa" -täppä
Erillinen oma täppä ohjaa murun/säikeen pois Laiturin näkymästä ilman että se tulkitaan valmiiksi käsitellyksi. Tuki sekä kertaluontoiselle käytölle että teemakohtaiselle oletukselle on tavoite. Säädön sijainti on Asetuksissa nykyisen `asetukset`-taulun avain-arvo-arkkitehtuurin jatkona.
*Toteumamerkintä 2026-08-03 (rakennettu):* kertaluontoinen täppä ⋯-valikossa ("🙈 Ei tarvitse näkyä Laiturissa", `laituri.piilota_laiturista`) — rivi ei poistu eikä arkistoidu, vain suodattuu aktiivisesta Laituri-näkymästä; palautus omasta "🙈 Piilotetut" -osiosta (sama malli kuin Arkisto). Kohdekohtainen oletus toteutettu Asetukset → 🛟 Laituri -osiossa (`asetukset`-avain `laituri_piilota_oletus_kohteet`, JSON-lista `{tyyppi,id}`-pareja) — kun murulle asetetaan koti joka on tällä listalla, piilotus tapahtuu automaattisesti SAMALLA kirjoituksella kuin koti (ei kahta peräkkäistä kirjoitusta).

### 7d. Versionumero ja PWA-cache
Versionumero on osa julkaisutietoa, ei käsin tehtävä lisätoimenpide. Uudet ominaisuudet ja korjaukset nostavat version automaattisesti, myös PWA/manifest/cache-versio päivittyy osana deploy-prosessia.
*Toteumamerkintä 2026-08-03:* nykytilassa tämä EI ole automaattinen eikä sitä automatisoitu tässä erässä (vaatisi oman päätöksen siitä miten se kytketään deploy-prosessiin, jota ei ole — Vercel deployaa suoraan `git push`:sta ilman build-askelta). Havaittiin ja korjattiin käsin unohtunut nosto (`sw.js` oli yhä `kauppalista-v90` kahden appitiedostoja muuttaneen committin jälkeen) → nostettu `v91`:ksi, ja uudelleen `v92`:ksi tämän erän omien muutosten jälkeen. Versionnosto on siis edelleen erillinen käsin tehtävä askel — muista se jatkossakin jokaisen `index.html`/`script.js`/`style.css`-muutoksen yhteydessä.

### 8. Yksi totuus, kaksi ikkunaa (kalenteri)
iCloud on kalenterin ainoa totuus. Satama peilaa sitä (lukee ~5 min välein), **ei koskaan kirjoita iCloudiin.** Kuratoituja kopioita ei tehdä — kopio joka ei päivity valehtelee. Jos jokin pitää saada kalenteriin, se lisätään iCalissa.

### 9. "Se vain on siinä"
Vaikuttaminen tapahtuu tarjonnalla, ei sanoilla. Kasvislauta pöydällä ilman kommenttia siitä kuka ottaa — ja kaikki ottivat. Sovellettuna: appi ehdottaa ja helpottaa, mutta **ei koskaan kommentoi toteumaa** — ei "otitko?", ei "hyvin meni!", ei laskureita, ei streakkeja. Positiivinenkin palaute on palautetta, ja palaute muuttaa laudan valvonnaksi. Koskee kaikkia tavoiteominaisuuksia (kasvikset, punaisen lihan vähennys, läheisyys).

### 10. Arki-minälle, ei ideaaliminälle
Mitoituskäyttäjä on se joka avaa jääkaapin väsyneenä — ei se joka meal-preppaisi sunnuntaisin. Testikysymys jokaiselle ominaisuudelle: **"toimiiko tämä sinä iltana kun kukaan ei jaksa mitään?"** Jos ei, se on ideaaliminän ominaisuus ja karsitaan.

### 11. Keskustelupyyntöä ei voi ohittaa
Ristiriidasta lähetetty keskusteluehdotus on eri laji kuin tavallinen delegointiehdotus: **sitä ei voi hylätä, vain kuitata (keskusteltu ✓) tai siirtää (⏭ myöhemmäksi).** Appi ei saa tarjota teknistä tapaa väistää puolison keskustelupyyntöä jälkiä jättämättä. Tavallisella 💬-ehdotuksella hylkäys säilyy, ja hylkäys ei koskaan näy lähettäjälle (RLS estää rakenteellisesti — ehdotusjärjestelmä jossa hylkäys raportoituu muuttuu velvoitejärjestelmäksi).
*Perheen oma sääntö tämän rinnalla:* "jos toinen ehdottaa keskustelua, molemmat nostavat sen ankkureihin, no questions."

**AVOIN ARVOKYSYMYS — ehdotuksen tila lähettäjälle (ratkaistava Juhan kanssa, EI lukittu):** jännite kahden huonon ääripään välissä: liika näkyvyys tuntuu Juhasta kontrollilta/vahtimiselta (tappaa työkalun minimalistilta), mutta täysi hiljaisuus tarkoittaa että delegoiduksi luultu asia voi kadota huomaamatta ("luulin että Juha ostaa laturin"). Ehdotettu ratkaisu joka välttää molemmat: lähettäjä näkee oman ehdotuksensa tilan KARKEASTI (avoin / käsitelty) muttei koskaan sitä MITÄ vastaanottaja teki. Kolme tilaa vastaanottajalla: (1) ottaa → hoidossa, (2) hylkää tietoisesti → *päätös, terve*, (3) ei tee mitään → vaarallinen hiljainen roikkuminen. Lähettäjä erottaa vain "avoin" vs. "käsitelty" (otto ja hylkäys näyttävät SAMALTA "käsitelty" — valinta ei paljastu), ja pitkään avoimena ollut ehdotus tuottaa lähettäjälle hiljaisen muistutuksen ("odottaa vielä") → hän voi nostaa asian puheeksi ihmisten kesken tai hoitaa itse. Näin kontrollin raja säilyy (ei näe päätöksiä) mutta hiljainen katoaminen estyy. **Ratkaistava Juhan kanssa ennen rakentamista** — kysymys hänelle: "sopiiko että näen onko ehdotus sulla auki vai käsitelty (en mitä päätit, vain ettei se katoa) — vai tuntuuko sekin liikaa?". Hänen rajansa ratkaisee. Koskee tavallista delegointiehdotusta; keskusteluehdotuksella tila on jo luonnostaan näkyvä (kalenterin ristiriitamerkki + no questions -sääntö).
*Juhan vastaus 17.7.: "harkitaan" — ei ei eikä kyllä, vaan rehellinen "en tiedä miltä tuo tuntuisi ennen kuin näen sen arjessa". → Ominaisuus JÄÄ LEPÄÄMÄÄN, ei rakenneta arvauksella. Oikea ratkaisuhetki tulee kokemuksesta: jos arjessa törmätään "ehdotin ja se katosi hiljaa" -tilanteeseen, tarve on todistettu ja rakennetaan; jos ei koskaan törmätä, ei tarvita. Arki vastaa paremmin kuin ennakkoarvaus.*

*PÄIVITYS 19.7. — arki todisti tarpeen, ja malli tarkentui kapeammaksi: Katrin tilanne "laita Juhalle: hae Rebekka päiväkodista tänään" → ilman kuittausta joutuu laittamaan viestin perään ("näitkö?"), eli appi ei säästä sitä viestiä joka sen piti säästää. Tarkennus jota tilanne vaatii on HYVÄKSYNTÄNÄKYVYYS, ei täysi tila: (1) **hyväksyntä NÄKYY lähettäjälle** ("Juha nosti ankkuriin ✓") — vastaanotto ei ole yksityisasia samalla tavalla kuin hylkäys; vastaanottaja nimenomaan haluaa lähettäjän tietävän ettei tarvitse hätäillä; (2) **hylkäys EI näy koskaan** (RLS, rakennettu, kiistaton); (3) auki/käsitelty-yleisnäkyvyys jää yhä "harkitaan"-tilaan — ja hyväksyntänäkyvyys vähentää sen tarvetta (jos kuittausta ei kuulu kohtuuajassa → tiedät ettei ole perillä → varmistat ihmisenä). Vahvista vielä Juhalta hyväksyntänäkyvyys erikseen (kevyempi kysymys kuin edellinen: "sopiiko että kun otat ehdotukseni ankkuriin, mä nään sen — ettei mun tarvii kysellä perään?") — todennäköisesti helppo kyllä, koska se palvelee myös häntä (vähemmän "näitkö?"-viestejä).*

### 12. Sosiaalinen ratkaisu voittaa teknisen
Ennen kuin rakennat ominaisuuden, kysy: ratkeaisiko tämä sopimuksella ihmisten välillä? (Esim. ehdokkaiden löydettävyysongelma ratkesi "no questions" -säännöllä, ei etusivunostolla.) Appi kuljettaa tiedon; ihmiset käyvät keskustelun.

### 13. Natiivi siellä missä käyttäjä syöttää, oma ilme siellä missä te rakennatte
**Natiivikomponentteja (iOS-rulla ajanvalinnassa, jakovalikot, tiedostovalitsimet, päivämäärävalinnat) käytetään niin paljon kuin mahdollista** — ei vain sallita vaan suositaan: ne ovat käyttäjälle valmiiksi tuttuja joka muusta appista, alusta ylläpitää ne, ne ovat esteettömiä ja luotettavia, ja niiden kustomointi rikkoo sekä tuttuuden että usein toiminnan (custom-ajanvalitsimet ym. ovat bugialtis laji — säästä se vaiva). Rakennusohje: ennen kuin rakennat oman UI-komponentin, tarkista onko natiivi joka tekee saman. Sataman oma visuaalinen kieli (tunnistettava look) pätee siellä missä SISÄLTÖ luodaan ja katsotaan; syöttö- ja järjestelmäkomponentit saavat olla natiiveja. Se pieni visuaalinen sauma natiivin ja oman ilmeen välillä EI ole vika — Applen omat apitkin tekevät niin.
*Syntytarina (18.7.):* iOS-natiivi aikarulla toi Katrin mieleen ristiriidan "kuittilookin" kanssa ja houkutuksen muuttaa koko ilme. Linjaus: natiivia käytetään auliisti, sauma on sallittu, koko ilmettä EI revitä auki. Visuaalisen yhtenäisyyden pohdinta (jos oma ilme tuntuu epäyhtenäiseltä ITSENSÄ kanssa) jää Katrin myöhempään harkintaan Copilot-aikana — mahdollinen työkalu silloin: kevyt design-kieli-dokumentti (värit, fontit, kulmat, välit, painiketyylit) jota vasten yhtenäistetään PIKKUHILJAA, ei kertaremonttina. "Kirjaa tyyli, korjaa kohti sitä ajan kanssa" — ei "muuta kaikki nyt".

---

## OSA 2: KÄYTTÄJÄT

### Katri
Rakentaja ja pääkäyttäjä. ADHD-arki: asiat katoavat päästä ellei niitä saa heti talteen → **Laituri** (nollakitkainen talteenotto) ja **ankkurit** (päivän valitut kärjet) ovat hänen ydintyökalunsa. Opiskelee ICT:tä (Turun AMK, aloitus elokuussa 2026 — Lukkarikone-lukujärjestys tulee silloin oikeasti käyttöön). Oppii ymmärtämällä: haluaa tietää mitä koodi tekee ja miksi.

### Juha
Minimalisti — käyttää työkalua vain jos se maksaa itsensä heti eikä vaadi opettelua. **Keittiön pääkäyttäjä** → Ruoka-moduuli mitoitetaan hänen kynnyksellään. Oma sanoitus toiminnanohjauksen haasteesta: *"epämääräisessä tilanteessa erityisen haastavaa priorisoida ja strukturoida"* + ympäristön havainnointi vaikeaa (roska lattialla ei "kilahda" tehtäväksi). Haluaa: **yksi selkeä seuraava askel, ei valintaa** — äly ehdottaa, hän kuittaa. Kiinteä ennakoitava hetki > satunnainen tönäisy. Hytin yksityisyys on hänelle ehdoton (kalenterimenojen näkyminen toiselle ei haittaa — hytin sisällön näkyminen on luottamusrikko).
Sisäänajo onnistui heinäkuussa 2026: hän siirtyi testattavasta suunnittelijaksi ja tuottaa itse ominaisuustoiveita (delegointi, sanelu, läheisyys, Päivän askel).

### Perheen sopimuksia (käyttökulttuuri, ei koodia)
- Keskusteluehdotus → molemmat nostavat ankkureihin, no questions.
- Kuittikuvaus kaupasta bussille kävellessä; jääkaappikuva kauppapäivänä, muulloin plussaa.
- Ruokahuollon sydän: maanantain -60%-jahti → pakastus → sulatus edellisiltana.

---

## OSA 3: RAKENNETUT KOKONAISUUDET (tiivis kartta — yksityiskohdat muistiinpanot.md:ssä)

- **Listat** (Kauppalista, muistilaput, tarkistuslistat, Varasto) — realtime molempiin suuntiin (sekunteja)
- **Kalenteri** — iCloud-peili (~5 min synkka, cron-job.org), kerrosarkkitehtuuri (hytti-tapahtumat perheelle kevyemmällä ilmeellä, "▫N"-niputus kuukaudessa), Kuormavahti, ristiriitapaketti (kolmiportainen vakavuus, keskusteltu-kuittaus, pallurakytkentä, K/J/P-omistajamerkit)
- **Muistutukset** — push molemmille, cron-toimitus ~5 min tarkkuudella
- **Laituri** — murut talteen, ✨-äly nostaa ehdokkaita, 💬-ehdotus toiselle (delegointi + keskustelulaji)
- **Ankkurit** — päivän kärjet, ⏭-siirto, "jokaisella ankkurilla on koti"
- **Hytti** — yksityinen työtila (RLS-suojattu molempiin suuntiin, todistettu), kortit, 7 pv -kalenteri-ikkuna, ICS-syötteet (Lukkarikone 201 tapahtumaa, Itslearning)
- **E3-yöajo** — äly käy murut läpi ~20 h välein, hetki/ikkuna-nostot, toistolukko
- **Parisuhdeaika-ehdotus** (2026-08-04) — Kuormavahti+kalenteri tunnistaa rauhallisen päivän (sama laukaisin kuin Kevyen päivän ehdotuksella), ehdottaa vapaan iltahetken loppuviikosta/seuraavalta viikolta MOLEMMILLE samanaikaisesti, molemminpuolinen hyväksyntä ennen kalenterisiltaa
- **Infra** — Supabase (data + RLS + realtime), Vercel (appi + API-endpointit), cron-job.org (3 työtä à 5 min), GitHub (koodi + Actions-varalaukaisija)

**Uudelleenkäytettävä malli — "molemminpuolinen hyväksyntä"** (syntyi Parisuhdeaika-ehdotuksessa, 2026-08-04): jos JATKOSSA rakennetaan toinen ominaisuus jossa KUMMANKIN pitää erikseen hyväksyä sama asia ennen kuin se astuu voimaan, älä suunnittele uutta mekanismia tyhjästä — kopioi tämä malli (ks. `api/parisuhdeaika-hyvaksy.js`/`api/parisuhdeaika-hylkaa.js`, sql/090): (1) jaettu ryhmä-uuid samalla arvolla molempien käyttäjien omilla riveillä samassa taulussa, (2) oma boolean-sarake per käyttäjän oma hyväksyntä, (3) service_role-endpoint joka merkitsee kutsujan oman hyväksynnän JA tarkistaa kumppanin tilan SAMASSA pyynnössä (RLS estää tämän suoraan clientistä per-omistaja-rajatuilla tauluilla, ks. COPILOT.md "Auth-kaava"), (4) aktiivinen hylkäys poistaa/peruu MOLEMMAT puolet, passiivinen huomiotta jättäminen ei tee mitään.

**Tunnetut avoimet asiat (vientihetki 19.7.2026, tarkin tila muistiinpanot.md:n testauslistassa):** kalenterin ~3 s kuukausivaihtolagi (syy analysoitu: verkkohaku ilman välimuistia — hyväksytty toistaiseksi, Copilot-hiontaa) · feed-tuplahaku (harmiton dedupin jälkeen — päätös turvasiivouksessa) · värimaailma kalenterissa jakaa mielipiteet (Copilot-hiontaa) · laituri-add:n henkilo-parametrin todennus (tietoisesti auki, päätös turvasiivouksessa) · PWA-kuvakkeen nimi yhä "Kauppalista" (manifest.json → "Satama", Copilot) · ~~PIKA-aikavalitsimen toimimattomuus~~ **tarkistettu 2026-07-20:** koodikatselmus + Playwright-simulaatio (rulla-arvot → summaus → Aseta-klikkaus → tallennusyritys → virheenkäsittely) läpäisi puhtaasti, ei JS-virheitä, ei hiljaista epäonnistumista — vaikuttaa jo korjatulta 2026-07-17 aikavalitsin-uusinnasta lähtien eikä Sinnikäs/Toistuva-lisäykset (07-19/20) ole rikkoneet sitä. EI silti vahvistettu oikealla laitteella — jos oire toistuu kädessä, kyse on jostain muusta kuin tässä katselmoidusta polusta. RAKENNETTU MYÖHÄIS-CODE-KAUDELLA (17.–19.7., testaustila muistiinpanoissa): aikavalitsimen iOS-rulla ✓ · huomenna-jäädytys · ristiriitapaketti · ehdotusreitit (napit + laukaisusana ml. saneltu muoto ✓) · Siri→Laituri (api/laituri-add + Shortcut ✓) · äly-lajittelu erä 1 (kauppa ✓/hetki/delegointi ✓) · arkisto ✓ · valmistautumisvaihe 🎒 · kalenterisilta (aikaistettu; iOS .ics-avaus yhä testaamatta) · 7 auditointia korjauksineen (hiljaisuus ~60, RLS 5+caldav-auth, toisto 3 racea, aika UTC-bugi, XSS puhdas, riippuvuuskartta; konsistenssi-auditointi tehdään viimeisenä ennen luovutusta).

---

## OSA 4: RAKENTAMATTOMAT KONSEPTIT — TÄYDET SPEKSIT

Nämä ovat Copilot-ajan rakennusprojekteja. Järjestys on suositus: pienestä isoon, ja jokainen on itsenäinen.

---

### 4.1 RUOKA-MODUULI (konsepti ~95 % valmis — Juhan moduuli)

**Pääkäyttäjä: Juha.** Kaikki virtaukset mitoitetaan minimalistin kynnyksellä: nolla asetuksia, nolla ylläpitoa, yksi ele per toiminto.

**Neljä kysymystä joihin moduuli vastaa:** Mitä tänään/huomenna syödään? · Onko meillä X:ää? · Mitä pitää hakea? · Mitä pitäisi käyttää pois?

**Kolme datakerrosta:**
1. **Pysyvä tieto** (käsin, muuttuu harvoin): Vakioruoat-luettelo (Juhan 12: makaroonilaatikko, kalakeitto, rakettispagetti + jauhelihakastike, kasvissosekeitto, tortillat, hedelmäinen salaatti + uuniperunat, kanakiusaus, pyttipannu, lämppärit, riisinuudelit, kalapuikot + muusi) · reseptit ainesriveinä Varaston nukkuvina listoina (2–3 ensin, loput elämällä) · viikkorytmi sääntönä (**ti = kala, to = kana, la/su = kasvis**) · Perustarvikkeet-lista. Äly lukee tätä kerrosta, ei koskaan muokkaa.
2. **Hetken totuus** (kuvista, vanhenee luvan kanssa): kaappi-/kuittikuvat → tekstiloki aikaleimoin → **kuva hävitetään heti purun jälkeen.** Kukaan ei ylläpidä inventaariota.
3. **Johdettu arvaus** (lasketaan lennossa, EI tallenneta totuutena): "mitä kaapissa todennäköisesti on" = viimeisin skannaus + sen jälkeiset kuitit − aika. **Rehellinen epävarmuus aikaleimoineen**: "maanantain skannauksessa oli 1 l maitoa, kuiteissa ei uutta — todennäköisesti vähissä." Ei koskaan "teillä on maitoa".

**Kolme varastoa, kolme aikajännettä:**
- **Jääkaappi** (päiviä) — kuva kauppapäivänä, muulloin plussaa
- **Pakastin** (viikkoja) — **ruokahuollon sydän**: ma -60%-lihajahti → pakastus → pääkysymys on "mitä otetaan sulamaan", ILTAEHDOTUKSENA huomiselle (ei "mitä nyt" — sulatus vaatii ennakointia). Kuittiloki + sulatuskuittaukset pitävät arvauskirjaa ilman inventointia.
- **Hyllyvarannot** (kuukausia) — lahjakorttiostot: murokaappi, tomaattimurskakaappi, kaurahiutaleet. Ehdotuksiin **"käytä varastoa" -paino**: suosi reseptejä jotka syövät varantoa.

**Perustamisskannaus (käyttöönotossa, KERRAN):** pakastin JA hyllyvarannot kuvataan kertaalleen kun moduuli otetaan käyttöön (kuva per kaappi/laatikko → äly kirjaa lokiin lähtötilanteen määrineen). Siitä eteenpäin kuittiloki + sulatus-/käyttökuittaukset päivittävät — ei toistuvaa inventointia koskaan. Perustamiskuvan ansiosta äly tuntee myös sen mitä varastoissa JO on (aiemmat pakastesaaliit, vanhat säilykkeet) eikä vain jatkossa ostettua — ja hävikkivahti voi nostaa myös vanhat löydöt ("pakastimessa pitäisi olla helmikuun lohifileitä — käyttöpäässä?").

**Virtaukset:**
- **Iltaehdotus huomiselle**: rytmi (to → kana) + vakioruoat + kerros 3:n arvaus → 2–3 ehdotusta päätöskorttina: *"Kanakiusaus — fileet pakastimessa (ma kuitissa), ota sulamaan illalla · kerma puuttunee → [Lisää Kauppalistalle]"*. Haudutuspata-merkintä resepteissä (molempien lempiväline) → pataruoat ehdotetaan edellisiltana (aamualoitus).
- **Kysy kaapilta**: vapaa kysymys kaupassa ("onko riisiä?") → kerros 3 vastaa epävarmuuksineen.
- **Kuittiputki**: kuva kaupasta bussille kävellessä → **bussipysäkkitesti: yksi ele, yhdellä kädellä, käsittely taustalla, ei tarkistusdialogia siinä hetkessä.**
  **Tavoitetila (Katrin idea 17.7.): kuitit suoraan S-mobiilista** — ~97 % perheen ruokaostoksista on S-ryhmästä, joten automaattinen kuittihaku poistaisi kuvauseleen kokonaan (Maksimiautomaatio). Todellisuus: S-ryhmällä ei (tiettävästi, tarkista ajantasainen tilanne) ole julkista rajapintaa kuittien hakuun ulkopuolisesta sovelluksesta. Välimuodot paremmuusjärjestyksessä: (1) **S-mobiilin kuitin jako Satamaan** puhelimen jakovalikosta (PDF/teksti — yksi ele ilman kuvausta, ja digitaalinen kuitti on älylle helpompi lukea kuin paperikuvan tulkinta), (2) sähköpostikuitin välitys jos kauppa sellaisen tarjoaa, (3) virallinen API jos/kun tulee — digikuittisääntely etenee, tarkista puolivuosittain. Kuvausputki säilyy aina varareittinä (muut kaupat, torit, käteisostot).
- **Hävikkivahti** = "käytä minut ensin" -hyllyn digitaalinen henkiinherätys ilman siirtelyä: loki ~2 vk taakse → *"kermaviili nähty 1.7., ei kuiteissa sen jälkeen → [pannukakut?]"*. Pallura vain jos jotain on pelastettavissa.
- **Kasvislauta**: perheen kuollut hyvä käytäntö henkiin — ~joka 2. päivä lisukerivinä iltaruokaehdotuksessa (*"kasvislauta: kurkkua, paprikaa, rypäleitä"*), sisältö lokin ja hävikkivahdin mukaan (nahistuva paprika → laudalle). **Ei koskaan erillistä nalkutusta, ei seurantaa, ei raportointia** (periaate 9). Salaattioppi: leikatut palat kuluvat, lehtisalaatti ei. (Laakea tiivisrasia hankittu/hankittavana — yksi leikkuu kattaa kaksi lautaa.)

**Rajaukset (yhtä tärkeitä kuin ominaisuudet):** EI ylläpidettävää inventaariota · EI pakollisia rutiineja (degradoituu kauniisti) · EI ruokapäiväkirjaa, kaloreita, ravintoarvoja — logistiikkaa, ei terveysappia · EI budjettiominaisuutta (300 €/kk-budjetti hyötyy koko moduulista sivutuotteena: varannonsyönti, hävikin esto, sulatusehdotus estää "tilataan valmista" -kalleimman skenaarion) · EI automaattisia ostoksia · terveystavoitteet (Juhan oma: vähemmän punaista lihaa ja prosessoitua, lisää kasviksia ja marjoja) hoidetaan **tarjontapainotuksella**, ei kommenteilla.

**Avoimet UI-päätökset (kysy Juhalta rakentaessa):** laatan lepotila (ehdotus: huomisen tilanne — "to: kana 🐔 · ota sulamaan illalla" + hävikkipallura) · nalkutusraja (aktiivinen iltaehdotus/pallura vai vain avattaessa — hänen moduulinsa, hänen rajansa).

**Rakennusjärjestys:** (1) Vakioruoat + 2–3 reseptiä Varastoon dataksi (voi tehdä heti käsin) → (2) kuittiputki + tekstiloki → (3) Kysy kaapilta → (4) iltaehdotus → (5) hävikkivahti + kasvislauta → (6) hyllyvarantojen perustamisskannaus.

---

### 4.2 PÄIVÄN ASKEL (konsepti ~60 % — Juhan ensimmäinen oma ominaisuus)

**Ydin (Juhan omin sanoin speksattu):** käyttäjän itse valitsemaan kiinteään kellonaikaan (esim. 6.45 tai 21.15 — vapaa valinta, dataa, vaihdettavissa milloin vain) appi nostaa **YHDEN seuraavan askeleen** ja käyttäjä kuittaa: **joo / ei nyt / myöhemmin.** Ei tyhjästä valintaa, ei möykkyä, ei satunnaista tönäisyä. Olennaista ei ole aamu vai ilta vaan **kiinteys ja ennakoitavuus**: sama tuttu hetki joka päivä tekee askeleesta osan päivän rakennetta.

**Miksi (Juhan profiili):** epämääräisessä tilanteessa priorisointi ja strukturointi lukkiutuu; ympäristö ei "kilahda" tehtäviksi. Kone tekee jäsennyksen ja ensimmäisen siirron (kolmiporras), ennakoitava rytmi pitää työkalun elossa (väärään hetkeen osuva tönäisy tapetaan).

**Laajuus: koko elämä, ei vain kotityöt.** Rutiinit (imurointi/tiskit/pyykki rytmillä), kertajutut, toisen pyynnöt, JA ihmissuhde — **"pusuttele vaimoa" on Juhan oma esimerkki ja jää konseptiin hengen kiteytyksenä**: työkalu ei ole suoritustehdas.

**Läheisyys-linjaus (Juhan idea "läheisyysaika management"):** EI omaa kalenteria, EI seurantaa/kuittausta/laskuria (velvoitettu läheisyys on läheisyyden vastakohta — sama myrkky kuin "hyvin meni!" kasvislaudalla). Läheisyys on yksi Päivän askel -syöte muiden joukossa. **Raja ehdoton: muistaminen kyllä, mittaaminen ei koskaan.**

**Avoimet kysymykset (puolituntinen Juhan kanssa ennen rakentamista):**
1. Mistä askeleet tulevat? (käyttäjän omat syötteet varmasti; rutiinit rytmisääntöinä?; toisen ehdotukset 💬-putkea pitkin?)
2. Miten priorisoituvat keskenään? (yksinkertaisin: käyttäjän oma järjestys + rytmivuorot)
3. Mitä "myöhemmin" tekee? (sukua ⏭-siirrolle — sama mekanismi?)
4. Mikä kellonaika Juhalle? (vapaa valinta rakennetaan joka tapauksessa — hän kokeilee ja vaihtaa kunnes löytää omansa)

**Jäädytetty (EI rakenneta ilman uutta näyttöä):** ajanmittaus / kestoarvio+toteuma / "Päivän mitta" -kuormalaskenta. Se oli suunnittelijan arvaus jota Juhan oma keskustelu EI vahvistanut — hän puhui priorisoinnista, ei arvioiden pettämisestä. Jos hän joskus itse sanoo "arvioni menevät aina pieleen", palaa tähän; muuten se on ideaaliminän ominaisuus.

---

### 4.3 TIIVISTÄ SOVITUT / PURKUSANELU (konsepti ~85 % — rakennuskelpoinen)

**Käyttötapaus (Juhan oma toive, keksi saman itse tietämättä aiemmasta speksistä = kaksoisvalidointi):** keskustelun/palaverin JÄLKEEN höpötellään sovitut talteen.

**Virtaus:** hytti → valitse KORTTI → "🎙 Tiivistä sovitut" → iso tekstikenttä (iOS-natiivisanelu mikrofoninapista TAI liimaus) → äly poimii rakenteen: päätökset, päivämäärät, vastuut, hankinnat → **esikatselu päätöskorttina (ei koskaan katkaistu teksti)** → [Tallenna kortille] → rivit kortin muistiinpanoiksi/tehtäviksi. Aikamääreelliset rivit saavat muistutusehdotuksen ("asia ankkuriin, hetki muistutukseen").

**Tärkeät rajat:** raakateksti (sanelu) hävitetään tallennuksen jälkeen — vain jäsennelty tulos jää · tallentuu VALITULLE kortille, ei yleiseen kasaan (keskustelu kuuluu projektilleen) · hytti-yksityisyys kattaa kaiken (RLS jo olemassa).

**Tekninen huomio:** käyttää samaa äly-putkea kuin ✨ (Claude API -kutsu Vercel-endpointista) — ei uutta infraa, vain uusi prompti + UI.

---

### 4.4 KALENTERIN KERROSARKKITEHTUURIN JATKOT

**Kurssisuodatin (elokuu 2026, kun Katri ilmoittautuu kursseille):** Lukkarikone-syöte tuo koko toteutuksen (201 tapahtumaa, myös B/C-rinnakkaisryhmät). Ratkaisu EI ole tapahtumakohtainen poiminta (ylläpitohelvetti) vaan **kurssitason monivalinta**: syötteen asetuksiin lista syötteen eri kursseista/ryhmistä (distinct otsikoista, ~10 riviä) → käyttäjä täppää omansa → kerros näyttää vain valitut, uudet valituilta automaattisesti. Valinta on dataa. Oletus ennen valintaa: näytä kaikki. Kerran lukukaudessa, nolla ylläpitoa välissä.

**Nosto perheelle (ei kiire):** hytti-tapahtuman voi nostaa täyden perhetapahtuman ilmeeseen (tentti-ilta jonka ympärille perhe järjestäytyy). Nosto = **osoitin, ei kopio** — synkan muutokset seuraavat, lasku poistaa vain noston. Puhtaasti korostus-ele (kuorma laskee jo kaiken).

**Juhan työkalenteri Satamaan (Copilot-kokoinen, koneisto valmis):** kalenterisynkka on geneerinen ICS-koneisto — työkalenteri on vain uusi rivi `kalenteri_syotteet`-tauluun (scope=hytti, henkilo=juha, näkyvyys Juhan valinta: vain hänelle / perheelle). **Ehto:** työnantajan järjestelmästä (Outlook/M365 tai Google) pitää saada ICS-julkaisuosoite ulos — monessa organisaatiossa IT on estänyt tämän; Juha kokeilee/kysyy. Toteutus mallin mukaan (ks. miten Lukkarikone/Juhan kalenterit lisättiin, sql/030–033): ICS-osoite ympäristömuuttujaan Verceliin → migraatio joka lisää syöterivin → Redeploy → synkka poimii automaattisesti. Tietoturva: oletuksena vain Juhalle -näkyvyys (työn tiedot eivät leviä — kuorma näkyy silti Kuormavahdissa), ja Juha varmistaa ettei työnantajalla ole estävää linjausta. **HUOM (arki-minä-testi): käsiylläpito EI ole varareitti** — "nostetaan tärkeät käsin perhekalenteriin" ei tapahdu koskaan (5 v kokemusta asiasta). Jos ICS-haku ei onnistu, työkalenteri jää Sataman ulkopuolelle kunnes onnistuu — ei rakenneta mitään mikä olettaa käsirutiinia.

**Syötetapahtumien rikastuskerros (työkalenterin kylkiäinen, koskee kaikkia ICS-syötteitä):** syötteestä tulleita tapahtumia ei koskaan muokata suoraan (yksi totuus — synkka ylikirjoittaisi tai syntyisi kaksi totuutta), MUTTA Satama voi tallentaa **oman kerroksensa tapahtuman päälle** — ja työkalentereissa tämä on erityisen tärkeää, koska niistä tuleva data on usein RIISUTTUA (pelkkä otsikko+aika, työjärjestelmä karsii paikan ja yksityiskohdat ICS-julkaisusta):
- **(a) Tiedon LISÄYS — tärkein:** käyttäjä voi rikastaa tapahtumaa omilla kentillä: **paikka** (jotta "monelta pitää lähteä?" ratkeaa), muistiinpano ("ota läppäri"), matkatapa. Lähde pysyy totuutena ajasta ja olemassaolosta; oma kerros lisää sen minkä lähde riisui.
- **(b) LÄHTÖAIKA-PÄÄTTELY (rikastuksen varsinainen palkinto):** kun tapahtumalla on aika (syötteestä) + paikka (rikastettu), appi laskee lähtöhetken (aika − matka-arvio − puskuri) ja tarjoaa sen **hetki-tyyppisenä muistutuksena** ("lähde 13.10" pörähtää) — olemassa oleva muistutuskoneisto, ei uutta infraa. Toiminnanohjausarvo Juhalle suuri: siirtymien ajoitus on juuri sitä epämääräisen jäsentämistä jota hän toivoi — kone laskee, ihminen lähtee kun pörähtää. Kolmiporras: lähtöaika on EHDOTUS jonka käyttäjä kuittaa muistutukseksi, ei automaattinen.
- **(c) Uudelleennimeäminen** — "PROJ-4521 sync" → näytetään "Palaveri (etä)", lähde ennallaan.
- **(d) Piilotus** — turha rutiinimerkintä pois näkyvistä poistamatta mitään.
- **(e) Nosto perheelle** (jo speksattu).
Tekninen malli: rikastustaulu avaimella ical_uid (sama osoitin-malli kuin nostossa) — synkan muutokset eivät riko rikastuksia (tapahtuman siirtyessä lähtöaika lasketaan uudelleen!), ja lähteen kadotessa rikastus raukeaa siivotusti.

**Symmetriaperiaate — ei rooleja, vain omistajia:** hytti ja sen kaikki työkalut ovat geneerisiä henkilökohtaisia, eivät "Juhan työosio" tai "Katrin opiskeluosio". Purkusanelu, työkalenterisyöte, Päivän askel, kortit — kaikki rakennetaan kerran ja ne ovat automaattisesti molempien käytössä omalla puolellaan (scope+omistaja hoitaa erottelun, RLS todistettu molempiin suuntiin). Kun Katri joskus on töissä, hänen työkalenterinsa on vain uusi syöterivi — mitään uutta osiota ei rakenneta.

**Rauhoitusikkuna — HUOM SUUNTA KÄÄNTYI (Katrin linjaus 16.7. illalla):** alkuperäinen speksi oli "rauhoita kouluvuosi". Oikea logiikka on **käänteinen**: arjen koulupäivärutiini (esim. 9–15) on rauhallista normaalitilaa, ja **loma-ajat ovat ne jolloin päällekkäisyydet oikeasti kirpaisevat** (kuka on lasten kanssa kun koulua ei ole?). Eli: syötetään koulujen loma-ajat järjestelmään (dataa, jokasyksyinen päivitysrutiini) → rutiinipäällekkäisyydet hälyttävät VAIN loma-aikoina täydellä painolla. Tarkista mikä versio ehdittiin rakentaa (sql/059–060, asetukset-avaimet) ja käännä logiikka tarvittaessa.

**Ristiriita × 💬 -jatkot:** ehdotuksen elinkaari (juuriviite ankkurissa, kuittaus ankkurista kuittaa kalenterinkin) rakennettiin viimeisinä Code-päivinä — tarkista testauslista ja viimeistele testaamattomat.

---

### 4.5 SIIRTYMÄKERROS (Juhan validoima kokonaisuus — kolme palaa jotka kuuluvat yhteen)

Juha nosti itse esiin siirtymät ("tarvii miettiä miten työmatkat/siirtymät vois hyödyntää") — ja kolme erikseen syntynyttä konseptia muodostavat yhdessä siirtymän koko kaaren tuen:

**1. ENNEN — lähtöaika-päättely** (ks. rikastuskerros 4.4): tapahtuman aika + rikastettu paikka → "lähde 13.10" -hetki-muistutus. Ratkaisee ajoituksen jonka laskeminen päässä on toiminnanohjaukselle kuormittavinta. Kolmiporras: ehdotus, käyttäjä kuittaa muistutukseksi.
**1b. VALMISTAUTUMISVAIHE (Katrin havainto — kriittinen lisä):** lähtemisen kaaos ei ole ajoituksen vaan VALMISTAUTUMISEN ongelma — lähtöhetkellä puuttuu puolet tavaroista, on nälkä ja vessahätä. Pelkkä "lähde nyt" -muistutus pörähtää väärässä tilassa. Siksi lähtöaika saa esivaiheen: **"valmistaudu"-tönäisy ~20–30 min ennen** (aika säädettävissä, dataa): *"Lähtö 13.10 → nyt: tavarat, vessa, välipala."* Ja toistuvia lähtöjä varten olemassa oleva tarkistuslistakoneisto: **lähtölista** (avaimet, läppäri, eväät...) joka voidaan kytkeä valmistaudu-vaiheeseen — "puolet tavaroista puuttuu" on kirjaimellisesti tarkistuslistan tehtävä, ei uutta rakennetta. Kaksi muistutusta per lähtö on maksimi (valmistaudu + lähde) — ei porrastettua nalkutusta.

**2. AIKANA — siirtymätaskut:** tehtäville kevyt kontekstimerkki "🚗 sopii siirtymään" (kädet varattu, pää vapaa: puhelut, kuunneltavat, mietittävät, sanelut). Kun lähtömuistutus pörähtää tai siirtymä alkaa, appi voi tarjota sopivat: "25 min matka — nämä sopisivat." HUOM: tämä EI ole jäädytettyä Päivän mitta -materiaalia — siirtymien hyödyntäminen oli Juhan oma, validoitu toive (ajanmittaus/kestoarviot pysyvät jäädytettyinä erikseen).

**3. JÄLKEEN — purkusanelu** (ks. 4.3): palaverin jälkeen siirtymässä/perillä sovitut talteen kortille. Siirtymä on sanelun luonnollinen käyttöhetki.

**Turvaraja (ehdoton):** ei näpelöintiä ajossa — ehdotukset ennen lähtöä tai kuunneltavina, sanelu vasta pysähdyksissä/perillä. Bussissa/junassa vapaampaa.

**Rakennusjärjestys:** lähtöaika ensin (isoin arkihyöty, rakentuu rikastuskerroksen päälle), taskut toisena (pieni: yksi merkki + suodatettu lista), sanelu omana projektinaan (4.3).

### 4.6 HERÄTYSPÄIVÄ + HORISONTTI + KALENTERISILTA

**"Lisää kalenteriin" -silta (Katrin tarve: "kampaaja huomenna klo 13" Laiturista kalenteriin asti):** Satama ei kirjoita iCloudiin (yksi totuus) — mutta se voi ESITÄYTTÄÄ tapahtuman ja antaa Applen + ihmisen hoitaa kirjoituksen: kun muru sisältää selkeän ajanvarauksen (aika + aihe), äly tarjoaa muistutusehdotuksen rinnalla napin **"➕ Lisää kalenteriin"** → Satama generoi murusta valmiin tapahtuman (.ics-tiedosto/data-linkki: otsikko, pvm jäädytettynä, kellonaika) → napautus avaa **iOS:n oman uuden tapahtuman -näkymän kentät täytettyinä** → käyttäjä tarkistaa, valitsee kalenterin ja painaa Applen Lisää → tapahtuma syntyy iCloudiin → Sataman synkka poimii sen takaisin ~5 min. Periaatteet säilyvät täydellisesti: Satama ei kirjoita lähteeseen (Apple kirjoittaa käyttäjän eleellä), kolmiporras (äly esitäyttää → ihminen kuittaa → järjestelmä toteuttaa), yksi totuus (syntyy suoraan iCloudiin, ei kopiota). Ele: muru → napautus → Applen Lisää → valmis. Copilot-kokoinen toteutus; HUOM iOS:n .ics-käsittely vaihtelee versioittain — vaatii kokeilua oikealla laitteella (avautuuko esikatselu suoraan). Älyn raja ennallaan: EI koskaan lisää eikä poista kalenterista mitään itse — tämä silta vain lyhentää ihmisen matkan kolmeen napautukseen.

**"Aseta hälytys" -silta (Katrin idea 18.7. — pohdittava myöhemmin):** PWA EI voi tehdä aitoa herätyskello-tyyppistä hälytystä (pitkään soiva, äänettömän tilan läpäisevä) — se on alustan raja, vain natiivit apit + iOS:n oma Kello pääsevät siihen; web-appi saa vain lyhyen ilmoitusäänen (varmista Asetukset → Ilmoitukset → Satama → äänet päällä). Kun asia tarvitsee AIDON hälytyksen (ehdoton herätys/lähtö), ratkaisu on sama siltamalli kuin kalenterisillassa: Satama tarjoaa napin **"⏰ Aseta hälytys"** → avaa iOS:n Kello-apin esitäytetyllä hälytyksellä → käyttäjä vahvistaa → Kello hoitaa aidon hälytyksen. Kolmiporras säilyy, Satama ei tee hälytystä itse (ei voisikaan). Katri pohtii myöhemmin tarvitaanko — moni tapaus hoituu ilmoitusäänellä tai sinnikkäällä muistutuksella (4.8), aito hälytys on harvinaisempi tarve.

**Laukaisusana-ehdotus (Katrin idea, syntyi aidosta hetkestä: Juhan akku loppu ja hän pyysi kirjaamaan puolestaan):** kirjoitettu teksti joka alkaa täsmällisellä laukaisulla — **"Juhalle:"** tai **"laita Juhalle:"** (vain nämä, tiukka tunnistus — pelkkä nimen maininta tekstissä EI laukaise) — ohjautuu suoraan toisen EHDOKKAAKSI ilman valitsimen koskemista. Sama putki kuin napeilla (muru kodiksi + katkoviivaehdokas vastaanottajalle), vain kirjoittaminen laukaisimena. Erityisarvo: toimii Sirin/sanelun kautta — asia valuu oikealle ihmiselle puhumalla. **RAJA EHDOTON: laukaisusana tuottaa aina EHDOKKAAN, ei koskaan valmista ankkuria** — kukaan ei kirjoita toisen ankkureihin suoraan, ei edes pyynnöstä (vastaanottaja kuittaa yhdellä napautuksella kun laite herää — se yksi ele säilyttää rajan jonka takaovi rikkoisi). *Suora kirjoitus (B-malli) harkittiin ja hylättiin tietoisesti 17.7.: pyytäjän arjessa ero on olematon ("pyysin ja se hoitui"), mutta raja suojaa molempien listoja siinä vaiheessa kun ehdotuksia liikkuu enemmän — oma lista pysyy omana, kukaan ei työnnä sinne mitään ohi omistajan.*

**Herätyspäivä (E3-laajennus):** muru voi kantaa "nouse aikaisintaan" -päivän — "hammaslääkäri 20.7. klo 14" makaa Laiturissa hiljaa ja nousee ankkuriehdokkaaksi **vasta 20.7. aamuna, kerran.** Äly poimii päivän tekstistä (jäädytettynä, periaate 6) tai käsin asetettuna. Tämä on Horisontin siemen ja käytännössä "kevyt kalenteritapahtuma ilman kalenteria".

**Horisontti (vanha suunnitelma, muistiinpanoissa):** tulevien asioiden kerros — asiat jotka eivät ole vielä tänään relevantteja mutta nousevat aikanaan. Rakennetaan herätyspäivän päälle kun se on olemassa.

---

### 4.7 YKSI LUUKKU — Laituri Sirin sisääntulona (Katrin suuntapäätös, vaiheessa — Copilot-aikaa)

**Visio:** kaikki Sirillä/sanelulla lisätty tulee **yhteen luukkuun (Laituri)**, ja äly päättelee minne kukin kuuluu — käyttäjän ei tarvitse hetkessä tietää oikeaa kohdetta, vain saada ajatus ulos päästä. Tämä on Laiturin alkuperäinen henki ("talteen ennen kuin katoaa") laajennettuna koko elämään, ja äly-putken luonnollinen huipentuma.

**Reititys (kolmiporras — äly ehdottaa, ihminen kuittaa):**
- "maito" → Kauppalista-ehdotus
- "kampaaja huomenna 13" → kalenterisilta (4.6) + muistutusehdotus
- "laita Juhalle: X" → ehdotus toiselle (laukaisusana, jo rakennettu)
- "muista soittaa äidille" → ankkuri/muistutus
- epäselvä → jää Laituriin muruna, nousee ✨-ehdokkaana normaalisti

**SANELUN TIIVISTYS — raaka on väline, ei arvo (Katrin linjaus 20.7., koskee oivalluksia, hyttikortteja, sovittua linjaa):** saneltu teksti tulee rönsyilevänä (toistoa, täytesanoja, "öö") — säilytettävä arvo on MERKITYS, ei raakasotku. Äly tiivistää sanellun yksityiskohtaiseksi tiivistelmäksi siitä mitä tarkoitettiin/sovittiin. Sama liike kuin "keskusteltu ✓" tai "sovittu linja": tallennetaan tulos, ei raakaa tapahtumaa.
*ANSA + suoja:* tiivistäminen on TULKINTAA — väärä tiivistys muuttaa merkitystä HILJAA (kortissa asia jota et tarkoittanut, luulet sen olevan mitä sanoit — pahempi kuin rönsyinen mutta tarkka raaka). Erityisen herkkää kasvatus-/parisuhdeasioissa jossa vivahde ON koko asia (väärä tiivistys = "sovittu linja" jota kukaan ei sopinut). Suoja on sama kolmiporras: (1) äly näyttää tiivistyksen heti ("näin ymmärsin: ..."), (2) käyttäjä vilkaisee → hyväksyy tai korjaa, (3) RAAKA säilyy kunnes vahvistus — jos tiivistys meni pieleen, alkuperäinen on tallessa; vasta hyväksynnän jälkeen raaka poistuu. ARKALUONTOISISSA (sovittu linja, kasvatusteema) raaka säilyy pidempään / tiivistys vaatii tarkemman vahvistuksen — virheen hinta korkein siellä. Ei koskaan hiljaista automaattitiivistystä ilman vahvistusmahdollisuutta.

**OIVALLUKSET — neljäs reititys, "second brain" Laiturin kautta (Katrin idea 20.7.):** tarve: kerätä puolikkaita ajatuksia ja oivalluksia (esim. kirjaa lukiessa "ahaa"), löytää ne teemoittain, jakaa yksittäinen Juhalle. RATKAISU ei ole erillinen keräyspaikka (se kilpailisi Laiturin kanssa = päätöskuorma "kumpaan tämä menee", ja paisuisi keräämisen hautausmaaksi = luoteen vastainen). Sen sijaan: **oivallus on NELJÄS reititys äly-lajittelussa** (kauppa/hetki/delegointi/oivallus) — sama ovi (Siri→Laituri), sama moottori. Miksi tämä on oikea IA: oivallus on ERI LAJI kuin tehtävä — tehtävä virtaa pois (hoituu), oivallus KERTYY ja kypsyy (tietoa, ei toimintaa) — mutta se ei ansaitse omaa oveaan, koska ajatus ei tiedä lajiaan syntyessään. Yksi ovi, äly reitittää.
*Toiminta:* sanele "oivallus että spaced repetition on vain pieni osa Sungin metodia" → äly tunnistaa oivallukseksi + **poimii HASHTAGIT AUTOMAATTISESTI sisällön sanoista** (ei sinun tarvitse sanella tägejä — nolla kaappauskitkaa; "Sung", "metodi", "spaced repetition" → `#opiskelu #sung`). Äly myös normalisoi tägit (tunnistaa että #opinnot/#koulu/#opiskelu ovat sama) → haku ei hajoa synonyymeihin. Oivallus siirtyy **Oivallukset-kotiin** ehdotetuilla tägeillä NÄKYVISSÄ ("#opiskelu #sung — muokkaa?"). KOLMIPORRAS (kuten kaikkialla): äly ehdottaa, sinä voit korjata/lisätä, mutta et JOUDU koskemaan. Miksi ei täysautomaatiota: väärä tägi = oivallus katoaa hakuun hiljaa (etsit väärästä paikasta, luulet ettet kirjannut) — se rikkoisi "luotettavan löytämisen" lupauksen (sama hiljaisen epäonnistumisen laji jota auditoinnit torjuvat). Automaattinen oletuksena + korjattavissa aina = vähäinen kitka JA luotettava haku, kumpikaan ei uhraa toista.
Haku tägeittäin ("näytä #kasvatus"). Jaa yksittäinen Juhalle (⋯, sama ehdotuskoneisto). Oivallus ei vaadi mitään — saa olla, kypsyä, löytyä; äly voi ammentaa siitä (kuten arkistosta): "kirjasit tästä oivalluksen kuukausi sitten". Jos "oivallus"-sanaa ei sanota, teksti on tavallinen muru — tunnistus on lisä ei pakko. Copilot-aikaa; rakentuu äly-lajittelun (4.7) neljäntenä haarana + kevyt Oivallukset-näkymä hyttiin.

**Tärkeä rajaus (Katrin linjaus): vanhaa ei pureta.** Suora Kauppalista-Siri-reitti (`api/add.js`) jää RINNALLE — "lisää kauppalistaan maito" toimii kuten ennen niille joilla se on lihasmuistissa. Yksi luukku on OLETUS ja suositus, ei pakotettu ainoa tapa. Ei rikota toimivaa vaikka rakennetaan parempi.

**PUHEKUITTAUS (Katrin idea 19.7. — lajittelun jatkokerros, EI rakennettu):** koko putki puheella: sanele "maito" → endpoint luokittelee SYNKRONISESTI ja palauttaa ehdotuksen Shortcutille → Siri LUKEE kysymyksen ääneen ("Kuulostaa kauppatavaralta, lisätäänkö Kauppalistalle?") ja kuuntelee vastauksen (iOS: Ask for Input/valikot toimivat äänellä Sirin kautta ajettaessa) → "joo" → Shortcut kutsuu vahvistusendpointtia → siirto tapahtuu. Kädet vapaana koko ketjun. KOLMIPORRAS SÄILYY: puhekuittaus on yhä ihmisen kuittaus — vain kanava vaihtuu. Vaatii: luokittelu synkroniseksi vastaukseen (viive ~2-3 s, Siri odottaa), kevyt vahvistusendpoint, Shortcuttiin If-haara + toinen kutsu (monimutkaistaa Shortcutia selvästi — dokumentoi tarkasti). EHTO: rakennetaan vasta kun peruslajittelun osumatarkkuus on todistettu arjessa — väärin lajitteleva äly + puhekuittaus = vääriä siirtoja äänellä. Code-aikana jos aikaa jää, muuten Copilot (Shortcut-osuus on käsityötä joka tapauksessa).

**Tila:** ERÄ 1 RAKENNETTU (b730b73): kolme reititystä (kauppa/hetki/delegointi) jaetulla luokittelumoduulilla. **Kaksi kaistaa (tietoinen työnjako):** Siri-sanelu → HETI-luokittelu (ehdotus sekunneissa — sanelijan kädet ovat varatut ja asia usein kiireinen), apissa kirjoitettu → YÖAJO (kirjoittaja on jo apin äärellä ja voi siirtää kiireisen itse; yöajo niputtaa loput ilmaiseksi — Maksimiautomaatio-Minimikustannus). Jos arki osoittaa että kirjoitetutkin kaipaavat heti-luokittelua, se on pieni muutos (sama kutsu kirjoituspolkuun) — hinta: API-kutsu per kirjaus.

### 4.8 TOISTUVAT MUISTUTUKSET (Copilot-kokoinen — tietomalli päätettävä ensin)

**Tila:** Code jätti tietoisesti rakentamatta (aikavalitsin-erä) koska tietomallia ei oltu määritelty — ei arvaa. Koneisto muuten valmis (push, cron, ajastus, iOS-rulla) → **hyvä Copilot-projekti heti kun Katri päättää tietomallin.** HUOM: PIKA-tilan "ei tapahdu mitään" -bugi on eri asia (ks. testauslista) — se koskee kertamuistutuksen pikavalintaa, ei toistoa.

**Tietomalli (Katrin linjaus 18.7. — joustava mutta jäsennelty, EI yksi sekava lomake):** toisto koostuu TYYPPI + parametrit, käyttäjä valitsee ensin tyypin:
- **TYYPPI 1 — Viikonpäivät** (monivalinta ma–su): kattaa "ma+ke+pe", "joka tiistai", "arkisin", "joka päivä". Pysyvä sääntö (A), ei viikkokohtaisia poikkeuksia alkuun.
- **TYYPPI 2 — Intervalli** [joka N] × [tuntia / päivää / viikkoa / kuukautta / vuotta]: kattaa "joka 4. päivä", "joka 3. viikko", "joka 2. tunti", "kerran 4 kk" — ja pitkät harvat: "kerran vuodessa", "joka 3. vuosi" (Katrin lisäys 19.7.: esim. katsastukset, sopimusten kilpailutukset, huollot — juuri ne jotka varmimmin unohtuvat koska mikään arki ei muistuta niistä). Huom tunti-taso mukana (eri aikaskaala kuin päivä/viikko).
- Molempiin: kellonaika (iOS-rulla, tunti-intervallilla ei erillistä kellonaikaa), loppu (ei koskaan / pvm:ään asti), kuittaus (kuitataan vain toteutunut kerta — vahvistus seuraa todellisuutta).

Avain: **kaksi selkeää polkua, ei yhtä 20-kenttäistä lomaketta.** Joustavuus tulee tyyppivalinnasta + harvoista parametreista — arki-minälle, ei ideaaliminälle. Viikkokohtaiset poikkeukset (B: "vain tällä viikolla ma+ke+pe") jätetään pois alkuun (harvinainen + monimutkainen).

**EI kuulu tähän — esimuistutus toisen tapahtuman suhteen:** "uikkarimuistutus koulu-uintiaamuna 15 min ennen" EI ole toistuva muistutus vaan **esimuistutus kalenteritapahtumaan** (sama kuin lähtöaika-päättely, 4.5/4.6): uintitunti on lukujärjestyksessä → siihen liitetään esimuistutus "uikkarit" → toistuu automaattisesti koska tunti toistuu, ei erillistä toistosääntöä. Ratkaistaan rikastuskerroksella/esimuistutuksella, ei toistuvilla muistutuksilla.

**SINNIKÄS MUISTUTUS / tärähdyssarja (Katrin idea 18.7. — kolmas muistutuslaji, ADHD-tietoinen):** eri kuin kerta- tai toistuva muistutus. Tarve: aamutohinassa YKSI muistutus katoaa (pörähtää kun kädet ovat saippuassa / lapsi huutaa → ohi ennen kuin rekisteröi). Ratkaisu: sama muistutus **hakkaa tiheästi rajatun ikkunan ajan** (esim. 4 kertaa tunnin aikana lähdön alla) → todennäköisyys että edes yksi osuu silmään toimintakelpoisella hetkellä. Suunnittelun ydin — **loppuu kun kuittaa "hoidettu ✓", ei kun kello sanoo** (vahvistus seuraa todellisuutta): jos uikkarit jo laukussa ja kuittaat, sarja hiljenee heti; muuten se muuttuu piinaksi ja käyttäjä oppii ohittamaan. Parametrit: kohdehetki (esim. lähtö 8:00) + ikkuna (kuinka kauan ennen alkaa, esim. 60 min) + tiheys (montako kertaa / väli). Kytkeytyy luontevasti lähtöaika-päättelyyn (4.5): "valmistaudu"-vaihe voi olla sinnikäs jos käyttäjä niin haluaa. EI oletuksena päällä — valinta per muistutus (useimmat eivät tarvitse tätä; se on niitä hetkiä varten jotka OIKEASTI katoavat tohinaan).

**Suositeltu rakennusjärjestys (arki testaa loput):** (1) Viikonpäivät-tyyppi ensin — kattaa yleisimmät ja on yksinkertaisin. (2) Intervalli-tyyppi toisena. (3) Esimuistutus tapahtumiin omana työnään (kytkeytyy kalenterin rikastukseen). Aikavalinnassa aina iOS-natiivi rulla (periaate 13).

### 4.9 JAKOLUUKKU: Wilma, kuitit, liput — "jaa dokumentti → äly poimii" (yksi koneisto, kolme käyttötapausta)

Koulun Wilma-viestit ovat perheen suurin yksittäinen "asioita hukkuu" -lähde — mutta sama tarve toistuu muuallakin, ja oikea rakenne on YKSI yleinen jakoluukku: **PWA share target** (Satama näkyy iOS:n jakovalikossa) + äly poimii jaetusta sisällöstä (teksti/kuva/PDF) toimenpiteet → ehdokkaiksi oikeisiin paikkoihin. Sama kolmiporras, sama äly-putki.

**Käyttötapaukset (sama koneisto):**
1. **Wilma-viesti** (teksti) → päivämäärät, maksut, varusteet, luvat → muistutus/Kauppalista/kalenterisilta-ehdokkaita
2. **Kauppakuitti** (kuva/PDF/S-mobiilin jako) → Ruoan kuittiloki (4.1) — jakoluukku ON kuittiputken tekninen toteutus
3. **Junalippu/varausvahvistus** (Katrin tarve 19.7.: VR:llä ei aina "lisää kalenteriin" -nappia) → äly poimii ajan+lähdön+määränpään → kalenterisilta-esitäyttö → matka Applen kalenteriin → Satama peilaa
**Rajaus lipuille:** Satama EI säilytä itse lippua (QR-koodin pitää löytyä junassa sekunneissa → Apple Wallet / VR-appi / sähköposti on lipun koti; Satamassa ei ole kuvasäilytystä, tietoinen valinta). Sataman rooli: matka NÄKYVIIN kalenteriin + halutessa hytti-kortti matkalle muistiinpanoineen. Työnjako, ei kaikki yhteen.

Rakennetaan Copilot-aikana: share target ensin, sitten poiminta-promptit käyttötapaus kerrallaan (liput yksinkertaisin aloitus, Wilma kun koulu alkaa elokuussa, kuitit Ruoan mukana).

### 4.10 LAITURIN LUODE + ARKISTO — "mikään ei unohdu hiljaa" (Katrin kysymys 18.7., konseptoitu yhdessä)

**Ongelma:** muru joka EI ole kauppaostos, kalenterimerkintä eikä ikkuna-asia — miten se ei unohdu hiljaa? Kolme eri "unohtumisen" lajia joilla on ERI oikea kohtalo: (1) **ajaton tehtävä** ("korjaa jarru") — pitää nousta esiin joskus; (2) **idea** ("kasvislauta arkeen") — EI kuulu nousta, kuuluu säilyä löydettävänä; (3) **epämääräinen möykky** — tarvitsee ihmisen katseen jäsentyäkseen. Yksi mekanismi kaikille tuottaisi joko nalkuttajan tai hautausmaan.

**Torjutut ratkaisut:** "nosta vanhat säännöllisesti" (kohinaa, opettaa ohittamaan, kohtelee ideoita tehtävinä) · "pakota luokittelu kirjatessa" (tappaa nollakitkaisen talteenoton — kuorma juuri siihen hetkeen jossa sitä vähiten on).

**KOLME KERROSTA:**

**Kerros 1 — pehmeä oletusikkuna ajattomille tehtäville:** yöajo tunnistaa kolmannen lajin hetkien ja ikkunoiden rinnalle: "tehtävä ilman aikaa" (verbi + konkretia). Se saa lempeän oletusikkunan (~2 vk, dataa/säädettävä): jos yhä Laiturissa koskemattomana ikkunan umpeutuessa → nousee ehdokkaaksi KERRAN, inventaariokysymyksenä ei nalkutuksena: *"tämä on odottanut hetken — vieläkö ajankohtainen? [ankkuriin] [idea, anna olla] [ei enää, arkistoi]"*. Yksi nousu, kolme ulospääsyä, jokainen on PÄÄTÖS — ei hiljaista vajoamista. Kolmiporras säilyy.

**Kerros 2 — luode (tarjottu vuorovesi-katselmus):** kerran viikossa-parissa (rytmi dataa; sopisi Päivän askel -tyyppiseksi omaksi hetkeksi, esim. su-ilta) appi TARJOAA vanhan kerrostuman kevyen läpikäynnin: murut yksi kerrallaan, kolme pyyhkäisyä — ankkuriin / anna olla / arkistoi. EI pakollinen, EI pörise — tarjottu rituaali. Psykologinen ydin: **muuttaa unohtamisen aktiiviseksi valinnaksi** ("anna olla" on päätös; hiljainen vajoaminen ei ole). Väliin jättäminen ei riko mitään (kerros 1 nappaa tehtävät silti).

**Kerros 3 — arkisto (löydettävä takahuone, ei hautausmaa):** arkistoitu muru EI näy aktiivisessa Laiturissa EIKÄ älyn nostokandidaateissa (ei kohise koskaan), mutta ON luettavissa arkistonäkymässä, haettavissa, ja **älyn ammennettavissa ehdotuksiin** ("kirjasit kesällä idean kasvislaudasta — nyt olisi paprikat käyttöpäässä" — idea ei unohtunut, se odotti oikeaa hetkeä). Turvainvariantti: arkistointi on TILA, ei delete.
*UI-linjaus (Katri 19.7.):* arkisto asuu LAITURIN SISÄLLÄ kokoontaitettavana osiona aktiivisten alla ("🗄 Arkisto (N)", oletuksena kiinni) — avattuna rivit näkyvät HARMAINA ("nämä vain ovat täällä, eivät action itemejä"). Ei erillistä paikkaa jonne pitää muistaa mennä; mutta ei myöskään harmaita rivejä levällään aktiivisten seassa (vilkaisuarvo — 50 harmaan jälkeen "se vain on siinä" muuttuu kohinaksi).
*Copilot-idea — arkisto älyn kalibrointidatana:* arkistointi on käyttäjän signaali "tällaisia en tarvitse nostoina" → pitkällä aikavälillä äly voi oppia arkistohistoriasta (esim. promptiin esimerkkejä käyttäjän arkistoimista lajeista) ja parantaa nosto-osumatarkkuutta. Ei rakenneta nyt — kirjattu kun arkistodataa on kertynyt.

**Arkistoon kolme reittiä (Katrin täydennys — käsireitti arkisin):**
1. **🗄 Arkistoi-nappi murun kohdalla, milloin vain** — kun itse näet että asia on vanhentunut ("osta 2 makuualustaa telttaretkelle" viikko retken jälkeen): pois aktiivisesta heti, luettavissa aina. Toiminto sinne missä havainto syntyy.
2. Kerros 1:n inventaariokysymyksen [ei enää, arkistoi]
3. Luode-pyyhkäisy

**Filosofia:** unohtaminen ei ole vihollinen — HILJAINEN, VALITSEMATON unohtaminen on. Terve järjestelmä antaa päättää unohtaa, ja se on keventävää. ("Taas unohdit" → "tässä ne ovat, sinä valitset.")

**MURUN SÄIE — keskeneräisen ASIAN muisti (Katrin tarve 19.7., Copilot-aikaa):** arjen tilanne: keskustelu lapsen kanssa jäi kohtaan "mieti miten voidaan auttaa sua asiassa x" → pallo jäi lapselle → palaamisen hetki katoaa päästä ("piti kysyä oletko miettinyt" — kolme viikkoa myöhemmin). Keskeneräinen keskustelu on LUPAUS, ja se ansaitsee saman turvaverkon kuin kauppatavara.
*Ei vain lastenkasvatus — AVOIN LANKA yleisesti (Katrin laajennus 19.7.):* lapsi oli vain esimerkki josta konsepti syntyi. Säie + herätys palvelee mitä tahansa avointa lankaa jolla on sama DNA: TÄRKEÄ, EI KIIREELLINEN, EI LUONNOLLISTA MUISTIKOUKKUA, ja unohtaminen maksaa hiljaa. Samat: parisuhde ("sovittiin että puhutaan rahasta joskus"), oma terveys ("seuraa tätä oiretta pari viikkoa"), ihmissuhteet ("ystävä mainitsi vaikeaa, lupasin kysellä"), työ/ura ("esihenkilö sanoi palataan palkkaan syksyllä"), talous ("kilpailuta vakuutukset, ei kiire mutta ei koskaan sovi"), itsensä kanssa ("pohdin alanvaihtoa — palaa kun on tilaa"). Mekanismia ei tarvitse laajentaa — sitä vain KÄYTETÄÄN laajemmin. Sama työkalu, sama turvaverkko, mikä tahansa elämänalue.
*Miksi juuri kasvatusasiat vaativat tämän (Katrin kiteytys):* kasvatuskeskustelut jäävät käymättä/jatkamatta ei vähäpätöisyyttään vaan koska niiltä puuttuvat KAIKKI muistikoukut — kauppatavaralla on lista, menolla kalenteri, laskulla eräpäivä, mutta "pitäisi jatkaa sitä keskustelua x:stä" ei kilahda missään: se elää vain kahden ihmisen muistissa ja kumpikin toivoo hiljaa että toinen muistaa. Lisäkierre: keskeneräisen keskustelun uudelleenavaaminen on epämukavaa ("mihin jäätiinkään...") → muistamattomuus antaa tekosyyn antaa liueta. Panos on korkein mahdollinen: unohtunut maito maksaa kauppareissun; kesken jäänyt kasvatuskeskustelu maksaa lapsen kokemuksen "kysyi, muttei koskaan palannut". Säie + herätys poistaa sekä muistikuorman että uudelleenavaamisen kitkan (viimeisin rivi kertoo täsmälleen mihin jäätiin). Ratkaisu kolmessa osassa: (1) **murulle voi lisätä jatkorivejä aikaleimoin** ("18.7. kysyin, sanoin että mieti" → "21.7. palasi itse, ehdotti y") — ei chat-UI:ta, vain kertyvät rivit jotka pitävät langan; äly lukee säikeen VIIMEISINTÄ riviä (tila aina tuorein); (2) **herätyspäivä säikeelle**: jatkoriville voi asettaa "palaa ~viikon päästä" → muru makaa hiljaa ja nousee ehdokkaaksi juuri sinä aamuna ("lapsen x-asia — oletteko palanneet?") — olemassa oleva visible_from-koneisto sovellettuna keskusteluihin; (3) **nosto TEEMAAN kun asia kasvaa** (Katrin jatkojalostus 19.7.): pitkäikäinen keskustelu tarvitsee kodin, ja kohde valitaan jaettavuuden mukaan — **perheasia → KESKUSTELUTEEMA VARASTOSSA** ("Lapsen x-asia", "Mökkiprojekti": jaettu, molempien luettavissa ja kartutettavissa — istuu Varaston periaatteeseen 7 täydellisesti: teema NUKKUU kuten reseptikin, ei täppiä, herää vain lisäyksestä tai herätyspäivästä; teemat ovat keskustelujen pysyvää perhetietoa kuten reseptit ruoan) / **yksityinen asia → hyttikortti** (oma pohdinta, työasia). Tämä paikkaa aiemman aukon: jaettu pitkäikäinen asia-koti puuttui (kortit ovat hytissä = yksityisiä). Säikeen kaari siirtyy teeman historiaksi; äly saa teemasta kontekstin ammentaa ("tästä puhuitte viimeksi 3 vk sitten, auki jäi y"). Laituri pysyy läpikulkupaikkana (luode-filosofia ei sekoitu: säikeellinen muru on yhä muru). Yksityisyys: säie perii murun omistajan; Varasto-teema on jaettu tietoisesti (perheasiat).

**MITEN TÄRKEÄ-EI-KIIREELLINEN PRIORISOITUU (Katrin kysymys 19.7. — rakenteellinen vastaus):** kiireellinen voittaa aina tärkeän koska kiireellisellä on päivämäärä — kasvatusasia ei koskaan "eräänny", joten se häviää maidolle joka päivä ellei rakenne puutu. Kolme otetta:
1. Säikeen herätys + vahdittu lepo = palaamisen TAKUU (ei katoa) — mutta eivät vielä priorisoi.
2. **KEVYEN PÄIVÄN EHDOTUS (opportunistinen bonus):** kasvatuskeskustelu ei tarvitse kiireellisyyttä vaan OIKEAN HETKEN (rauhaa, jaksamista) — ja Satama on ainoa työkalu joka tietää milloin se on: **Kuormavahti näkee kevyet päivät.** Kun päivän/huomisen kuorma on kevyt, äly voi ehdottaa ankkuriehdokkaaksi yhden auki olevista teemoista/säikeistä ("torstai näyttää rauhalliselta — se lapsen x-asia?"). Kääntää logiikan: kiireellinen täyttää raskaat päivät, TÄRKEÄ SAA KEVYET. **MUTTA tämä on opportunistinen — nousee vain jos kevyt hetki SATTUU tulemaan, ei riitä yksin takuuksi** (kiireelliset täyttävät kalenterin ahkerammin kuin kevyet päivät ehtivät ilmestyä).
2b. **TAATTU PERÄLAUTA — Luoteen laajennus (Katrin täsmennys 19.7.):** siksi tarvitaan myös mekanismi joka EI riipu kuormasta — laajenna Laiturin luode (4.10, viikoittainen tarjottu katselmus) kattamaan myös avoimet teemat/säikeet: sama rytmi käy joka tapauksessa läpi ("su-illan luote: 3 muruteemaa vahtiin + 1 avoin säie 'lapsen x-asia, jäi 12.7.' — jatketaanko, annetaanko olla, vai nostetaanko?"). Ero ehdotukseen: kevyen päivän ehdotus on MAHDOLLISUUS (aikaistaa jos onni suo), luoteen katselmus on TAKUU (tulee joka tapauksessa, ei jää koskaan kokonaan käymättä vaikka viikko olisi pelkkää kiirettä). Molempia tarvitaan yhdessä — pelkkä opportunistinen ei riitä takuuksi.
3. **Päivän askel -syöte:** kasvatusteemat/säikeet kuuluvat Päivän askeleen syötteisiin (Juhan oma "pusuttele vaimoa" -esimerkki osoitti jo suunnan: elämän askel voi olla ihmissuhdeasia) — "palaa lapsen x-asiaan" yhtenä kuitattavana askeleena, jäsennettynä ei möykkynä.
4. **PAINAVA-VIHJE, ei tärkeä-tähti (Katrin kysymys 19.7. — "tärkeä, nostettava erityisesti, en osaa sitoa päivään"):** EI erillistä tähti-/tärkeä-merkintää asialle. Perustelu (informaatioarkkitehtuuri): "tärkeä + ei aikaa" on määritelmällisesti se kategoria joka ei koskaan pääse toiminnan kärkeen — tähditettyjen lista on lykkäyksen arkistointia, joka TUNTUU priorisoinnilta mutta ei nosta mitään, ja on vaarallisempi kuin tavallinen unohtaminen koska tuntuu että asialle tehtiin jotain. Sama oppi kuin poistettu Itselle/Juhalle-valitsin: **tärkeys on suhde hetkeen, ei leima jonka asia kantaa** — staattinen tähti jäätyttää dynaamisen asian. SEN SIJAAN kaksitasoinen PRIORITEETTIVIHJE NOSTOMEKANISMILLE (säie/teema/vahdittu rivi): "tavallinen" vs. **"painava"** (nousee herkemmin — ensimmäisenä kevyenä päivänä 2d:ssä, luoteen katselmuksessa 2b kärjessä). Ratkaiseva ero: tähti odottaa IHMISEN aloitetta (ja unohtuu listaksi), painava-vihje ohjaa JÄRJESTELMÄN tuottamaan aloitteen aiemmin. "Tämä erityisesti kun tilaa tulee" — ilman että ihmisen tarvitsee muistaa katsoa mitään. Maksimiautomaatio: ihminen ei ole se joka muistaa katsoa.

**MAHDOLLINEN TASO 3 — avointen lankojen tasapaino (Katrin kysymys 19.7., AVOIN — arki ratkaisee tarvitaanko):** kun säiettä käytetään yli elämänalueiden (kasvatus, parisuhde, terveys, työ, ihmissuhteet), syntyy tarve jota T1/T2 eivät kata: "mitä kaikkea on auki ja mille alueelle se kasautuu?" — EI yksittäisen langan hoito vaan kokonaiskuva. Kaksi muotoa:
- **ANSA-muoto (ei rakenneta):** dashboard/lista kaikesta keskeneräisestä = juuri se ahdistava kasa jota Kuormavahti torjuu. Kokonaislista avoimista asioista lisää kuormaa, ei vähennä.
- **Arvokas muoto (ehkä):** HILJAINEN TASAPAINON TUNNISTUS — ei lista vaan havainto: jos avoimet langat kasautuvat yhdelle alueelle (viisi työsäiettä, nolla ihmissuhteisiin), äly voi HYVIN HARKITEN tarjota ("työhön liittyvät ovat kasautuneet — katsotaanko yhdessä?") — ei syyllistäen ("olet laiminlyönyt x"). Kuormavahdin serkku: Kuormavahti näkee kalenterin kuorman, tämä näkisi avointen lankojen jakauman alueittain.
- **Edellytys + varaus:** vaatii että langoilla on elämänalue (teema/kategoria, syntyy vasta T2:ssa), JA arki näyttää kertyykö lankoja tarpeeksi että jakauma olisi signaali eikä kohinaa. EI rakenneta ennen kuin T2 on käytössä ja tarve todistettu arjessa. Riski: tämä lähestyy "profiilin rakentamista" ja itsearvioinnin aluetta — pidettävä ehdottomasti tarjoavana ja kevyenä, ei mittaavana. Jos tuntuu edes vähän arvostelevalta, ei rakenneta.

**TEEMAN "SOVITTU LINJA" (konseptoitu 19.7.):** teemalla on kertyvän historian LISÄKSI kiinnitetty ydin — **viimeisin yhteinen päätös** ("ruutuaika: 1h arkisin, sovittu 12.7.") teeman yläreunassa. Miksi: kasvatustilanteet tulevat päälle YLLÄTTÄEN, ja yhteinen linja pitää muistaa kesken tilanteen ilman "hetkinen, kysyn isältä" -murtumaa — vilkaisu teemaan → linja tiedossa → yhtenäinen vastaus. Linjan päivittyessä vanha valuu historiaan (ei katoa). Vilkaisuarvo sovellettuna vanhemmuuteen: teema on työkalu, ei vain arkisto.

**KIRJAAMISEN RAJA — lapsen suoja perheen tietokannalta (arvoperiaate, kirjattava ENNEN teemojen rakentamista):** Satama tukee vanhempien muistia — **se ei rakenna profiilia lapsesta.** Kirjataan: asiat, sovitut linjat, palaamiset ("jäi kesken, palaa viikon päästä"). EI kirjata: luonnearvioita, diagnoosispekulaatioita, "mustaa kirjaa" lapsen teoista. Ajallinen ulottuvuus: lapsen kasvaessa hänen asiansa ovat yhä enemmän hänen omiaan — eletty teema pitää voida sulkea arvokkaasti (arkistoon), ja tämä on se harvinainen paikka jossa TIETOINEN POISTO voi olla oikein turvainvariantista huolimatta: lapsen yksityisyys > vanhempien arkisto. Ja tietoisesti konseptoimatta jätetty: puheeksiottamisen tuki ("miten avaan vaikean keskustelun") — ylittäisi apin roolin (periaate 12: appi kuljettaa tiedon ja muistaa mihin jäätiin; MITEN kuuluu ihmisille).

**VARASTON KAKSI SIVUTYYPPIÄ + VAHDITTU LEPO (Katrin jatkojalostus 19.7., Copilot-aikaa):** teema/kokoelma EI ole editoitava dokumentti vaan **muruja allekkain, aikajärjestyksessä, koskemattomina** (ei muokkaus-UI:ta — murut ovat mitä olivat, teema vain kokoaa; ja riviltä voi aina NOSTAA asian takaisin aktiiviseksi — Varasto on lepopaikka, ei hautausmaa). Sivutyyppi valitaan luodessa:
- **LUETTAVA** = periaate 7 sellaisenaan: nukkuu, ei täppiä (reseptit, keskusteluteemat, referenssit).
- **VAHDITTU** = uusi mekanismi, "anna arjen yrittää ensin": asiat jotka EHKÄ hoituvat luontaisesti (hana jonka Juha ehkä korjaa ohimennen) mutta joita ei saa päästää unohtumaan — rivillä aikaraja, ja **jos rivi on yhä kuittaamatta X ajan päästä → nousee ankkuriehdokkaaksi.** Hoitui itsestään → kuittaus pois (yksi täppä — appi ei voi tietää hoituiko hana, kuittaus on se kevyin ele), ei koskaan noussut, nolla kohinaa. Ei hoitunut → järjestelmä nostaa, ei ihmisen muisti. Täyttää aukon jota mikään laji ei kata: ankkuri=tänään, muistutus=hetki, ikkuna=kova takaraja, luode=yleisesto — **vahdittu lepo = "kokeillaan ensin ilman minua"** (Maksimiautomaatio sovellettuna omaan puuttumiseen). Tekninen pohja: sama visible_from/herätyskoneisto kuin luoteen kerros 1:ssä — vahdittu rivi on käytännössä käyttäjän itse asettama pehmeä ikkuna Varastossa.

**Rakennusjärjestys:** arkisto-tila + käsinappi ENSIN (kevyt, ja kytkeytyy äly-lajitteluerän tilakoneistoon — sama tilakenttä kuin "siirretty Kauppalistalle", rakennetaan yhdessä ettei synny kahta mekanismia) → kerros 1 (yöajon kolmas tunnistus) → luode viimeisenä (oma UI-hetki, Copilot-aikaa).

*Alla oleva 4.10b kuvaa mitä tästä speksistä TODELLISUUDESSA rakennettiin 2026-07-20/21 — speksi yllä on säilytetty muuttumattomana historiallisena viitteenä (kirjoitettu ennen rakentamista), 4.10b on tuoreempi ja kertoo toteuman.*

---

### 4.10b MURUN SÄIE + JATKO-OSAT (Katrin priorisoitu rakennuspyyntö 2026-07-20/21, jatkaa 4.10:tä)

**TASO 1 (murun säie + herätys) RAKENNETTU 2026-07-20/21** — täysi tekninen kuvaus muistiinpanot.md:n "Murun säie" -osiossa, ei toisteta tässä. Lyhyesti: jatkorivit murulle (⋯ → "🧵 Jatka säiettä"), valinnainen herätyspäivä olemassa olevalla `visible_from`-koneistolla, äly lukee säikeen viimeisintä riviä tilana. `sql/079`+`080`, `laituri_jatkorivit`-taulu.

**TASO 2 RAKENNETTU 2026-07-21** (yön yli -erä, kaikki 2a-2e + kohta 1:n luote-peruste) — täysi tekninen kuvaus muistiinpanot.md:n "Laiturin luote + Keskusteluteema + Vahdittu lepo" -osiossa, ei toisteta tässä. EI TESTATTU oikealla ajalla/cronilla/kahdella tilillä (ks. muistiinpanot.md "☀️ HERÄTESSÄSI LUE TÄMÄ ENSIN"). Alkuperäinen speksi säilytetty alla sellaisenaan historiallisena viitteenä siitä mitä pyydettiin:

Arvoperiaate joka koskee KAIKKEA alla olevaa: *"Satama tukee vanhempien muistia — ei rakenna profiilia lapsesta."* Ei koskaan luonnearvio-/diagnoosikenttiä millekään teemalle/säikeelle.

**2a. Keskusteluteema Varastossa:** LUETTAVA-tyyppinen sivu jolle voi SIIRTÄÄ murun säikeineen (poistuu Laiturista siirrettynä, turvainvariantti — ei koskaan häviä, vain siirtyy). Teema = muruja allekkain aikajärjestyksessä, EI editoitava dokumentti. Rivin voi nostaa takaisin aktiiviseksi (Varasto on lepopaikka, ei hautausmaa, ks. periaate 7). Jaettu (molemmat näkevät ja kartuttavat). **Poikkeus turvainvariantista:** teeman voi sulkea JA POISTAA kokonaan tietoisesti — AINOA paikka jossa poisto on oikein huolimatta muualla vallitsevasta "mikään ei koskaan katoa" -periaatteesta, koska lapsen yksityisyys > arkisto.

**2b. Sovittu linja:** teemalla kiinnitetty ydin-kenttä ERI historian LISÄKSI — "viimeisin yhteinen päätös" (esim. "ruutuaika 1h arkisin, sovittu 12.7.") näkyvissä teeman yläreunassa kiinteänä, ei historian seassa. Syy: kasvatustilanne tulee päälle yllättäen, linjan pitää löytyä VILKAISULLA ilman "kysyn isältä" -murtumaa keskellä tilannetta. Päivittyessä vanha linja valuu historiaan (ei häviä, vain ei ole enää ylhäällä).

**2c. Luoteen laajennus (TAE, ei vain mahdollisuus):** laajenna olemassa oleva/suunniteltu Laiturin luode (4.10:n Kerros 2, viikoittainen tarjottu katselmus) kattamaan MYÖS avoimet teemat/säikeet samassa kierroksessa. Tämä tulee JOKA TAPAUKSESSA riippumatta kuormasta — erotuksena 2d:hen joka on vain opportunistinen bonus.

**2d. Kevyen päivän ehdotus (opportunistinen bonus, EI korvaa 2c:tä):** kytke Kuormavahdin kevyt-päivä-tunnistukseen — kun huominen/tänään on kevyt, äly voi ehdottaa YHDEN auki olevan teeman/säikeen nostoa ankkuriehdokkaaksi ("torstai näyttää rauhalliselta — se lapsen x-asia?"). Ei koskaan raskaana päivänä, max yksi kerrallaan, aina ehdokas (kolmiporras).

**2d-2. Painava-vihje, EI tähti (täsmennys, tärkeä pitää mielessä koko 2d:n/2c:n rakennuksen ajan):** ÄLÄ rakenna erillistä "tärkeä-tähti" -merkintää millekään asialle — se loisi tähditettyjen kasan jota koko appi vastustaa (staattinen tähti odottaa ihmisen aloitetta ja unohtuu, sama oppi kuin poistettu Itselle/Juhalle-kohdevalinta ankkureista 2026-07-19: tärkeys on suhde HETKEEN, ei pysyvä leima). SEN SIJAAN säikeellä/teemalla/vahditulla rivillä on kaksitasoinen PRIORITEETTIVIHJE nostomekanismille ITSELLEEN (ei ihmiselle näkyvä muistilippu): "tavallinen" vs. "painava" — painava nousee herkemmin (ensimmäisenä kevyenä päivänä 2d:ssä, luoteen katselmuksessa 2c:n kärjessä). Vihje ohjaa JÄRJESTELMÄN omaa aloitetta koska/missä järjestyksessä nostaa, ei ole ihmisen muistiapu sinänsä.

**2e. Vahdittu lepo Varastossa (oma pieni mekanisminsa, matalin prioriteetti TASO 2:ssa):** uusi sivutyyppi Varastoon jolla rivi nousee ankkuriehdokkaaksi jos kuittaamatta X päivän jälkeen ("anna arjen yrittää ensin ennen kuin järjestelmä puuttuu") — sama `visible_from`-pohja kuin muuallakin, käyttäjän itse asettama pehmeä ikkuna per rivi.

**Rakennusjärjestys (Katrin oma, jos/kun jatketaan):** 2a ensin (perusta jolle 2b/2c/2d rakentuvat), 2b samassa erässä jos mahtuu (pieni, sama taulu), 2c on TAE joten se pitää rakentaa ennen kuin ominaisuus on "valmis" siinä mielessä että Katri sen speksasi, 2d on erillinen bonus joka voi jäädä myöhemmäksi ilman että 2c:n lupaus rikkoutuu, 2e on oma erillinen matalan prioriteetin mekanisminsa eikä riipu muista.

---

### 4.11 OPINTOPOLKU — RAKENNETTU 2026-07-21 (VAIHE 1 + VAIHE 2, kirjattu retroaktiivisesti)

**⚠️ Tämä osio EI ollut olemassa kun Vaihe 1:tä ja Vaihe 2:ta pyydettiin rakennettavaksi** — molemmat rakennettiin suoraan Katrin chat-pyyntöjen verbatim-tekstistä (ks. molempien oma huomio muistiinpanot.md:ssä). Kirjattu tähän VASTA JÄLKIKÄTEEN, "elävä dokumentti" -periaatteen mukaisesti ("kun konsepti rakentuu, siirrä sen speksi tänne rakennettujen joukkoon") — ei siis alkuperäinen suunnitelma, vaan tiivistys siitä mitä oikeasti syntyi. Täysi tekninen kuvaus: muistiinpanot.md:n "Opintopolku VAIHE 1" ja "Opintopolku VAIHE 2: kolmen voiman moottori" -osiot.

**Mikä:** yksityinen opiskelumoduuli Hytin sisällä (sama owner_id-RLS kuin muu Hytti). Kurssi → aiheet (PACER-vaihetila: priming/encoding/retrieval/reference/yllapito) → deadlinet (koe/palautus, kurssi- tai aihetasolla) → kevyt materiaali-tekstikenttä. Kolmen voiman moottori (puhdas laskenta, ei älyä) punnitsee deadlinea+PACERia+Kuormavahtia ja tarjoaa 1-2 päivän askelta arjen ohjaavassa ikkunassa Hytin yläosassa, idempotentisti tallennettuna. "Tehty" etenee PACERia ja ajastaa spaced repetitionin (1/3/7/21pv → pysyvä 60pv ylläpitosykli). Kokonaiskartta-näkymä (luettava, ei ohjaava) näyttää kaikki kurssit väripalkkeina.

**Tulkintapäätös kirjattu (ei yksiselitteisesti spesifioitu alkuperäisessä pyynnössä):** `reference`-vaihe on moottorin ULKOPUOLELLA — vain käsin asetettava, ei koskaan osa automaattista PACER-kiertoa.

**EI rakennettu, tietoinen rajaus:** "aikaikkuna/vuorokaudenaika"-metodiprofiili (vain Sung-vaiheiden ohjetekstit rakennettu). Ei mitään älykutsua ollenkaan (arvoperiaatteen mukaisesti).

**EI TESTATTU oikealla käytöllä:** moottorin todellinen tarjonta usealla oikealla kurssilla/deadlinella — puhdas logiikka on Node-testattu, mutta Katrin oma huomio pyynnössä oli täsmälleen oikea: "moottorin tarjonta on vaikea todentaa ilman todellista dataa". Tämä on ensimmäinen asia mitä kannattaa seurata oikeassa käytössä.

**Alkuperäinen speksi säilytetty alla sellaisenaan historiallisena viitteenä siitä mitä pyydettiin (kirjoitettu ENNEN rakentamista, ei siis suunnitelma joka toteutui sellaisenaan — ks. yllä mitä oikeasti syntyi).** HUOM numerointi: tämän speksin sisäinen "VAIHE 1/2/3" ja "TASO 1/2/3" viittaavat materiaalianalyysin ja moottorin kunnianhimon TASOIHIN (spekulatiivinen rakennussuositus), EIVÄT samaa tarkoita kuin yllä mainitut TODELLISET rakennusvaiheet "VAIHE 1" (perusta, rakennettu) ja "VAIHE 2" (kolmen voiman moottori, rakennettu) — kaksi eri numerointijärjestelmää samassa dokumentissa, ei pidä sekoittaa.

**ALKUPERÄINEN SPEKSI: "OPINTOPOLKU — kuormatietoinen opiskelusuunnitelma omaan tyyliin" (Katrin moduuli, konseptoitu 19.7., iso — vaiheistettu)**

**Ydintarve (Katrin kiteytys):** "kun minulla on se harvinainen opiskeluikkuna, tiedän heti MITÄ ja MITEN teen — ei arpomista, ei jumia." Ongelma on sama kuin koko Sataman ydin sovellettuna opiskeluun: ADHD-arjessa arvokas opiskelutunti menee siihen että PÄÄTÄT mitä tehdä, ja päätöskuorma syö energian ennen aloitusta. Ratkaisu: päätös tehty ennalta → istuessa vain tekeminen. TÄRKEÄ RAJAUS: EI raskasta materiaalin tekoälyanalyysia (ei "niele luentovideo ja ymmärrä puolestani") — Katri karsi sen tietoisesti. Materiaali on VIITE ja pilkottava, ei nieltävä.

**Kolme kevyttä sisääntuloa:**
1. **Kurssimateriaali viitteeksi** → pilkotaan PALIKOIKSI (mitä + karkea kesto): "Luku 3: tietokannat ~2h", "Harjoitustyö osa 1 ~90min", "Kertaa luvut 1–4 tenttiin, 3×45min". Äly voi auttaa pilkkomisessa materiaalin sisällysluettelosta/rakenteesta, karkeasti — ei täydellisesti.
   **MATERIAALIN SISÄÄNTULO — kolme tasoa (Katrin kysymys 20.7., tärkeä rajanveto):** kurssikortissa on LAATIKKO johon voi raahata materiaalin (PDF/PowerPoint/kuvat). Mitä sen jälkeen tapahtuu, kolme kunnianhimon tasoa:
   - **TASO 1 (rakennetaan): liite/viite** — materiaali tallentuu kurssikortin liitteeksi, avattavissa sieltä (ei enää sähköpostien seasta etsimistä). Appi ei "lue" sitä, mutta se on tallessa oikeassa paikassa ja palikat voivat viitata siihen ("silmäile diat 12–20").
   - **TASO 2 (kevyt, jos toimii): rakenteen poiminta** — äly lukee materiaalin RAKENTEEN (diojen otsikot, sisällysluettelo) ja ehdottaa AIHEJAON ("6 osiota, teenkö aiheet?") → Katri hyväksyy/muokkaa. Poimii jäsennyksen, ei ymmärrä sisältöä. Jakoluukun (4.9) serkku.
   - **TASO 3 (EI rakenneta — periaatteellinen kielto): sisällön ymmärtäminen** — äly nielee materiaalin ja rakentaa käsitekartan/oppimispolun sisällön perusteella. Karsittu KAHDESTA syystä: (a) epäluotettava ja raskas (video ≠ jäsennelty teksti), (b) SUNG-METODIN VASTAINEN — Sungin koko ydin on että käsitekartan rakentaminen ja hierarkisointi ON se oppiminen (encoding). Jos appi jäsentää puolestasi, se tekee arvokkaimman kognitiivisen työn sinun sijastasi ja jättää sinut low-order-tasolle jota metodi välttää. Appi tuo materiaalin käden ulottuville ja jäsentää MILLOIN/MITEN työskentelet; YMMÄRRYSTÄ se ei koskaan ulkoista.
2. **OPISKELUMETODI = JUSTIN SUNG (systeemin äly — Katri toimitti metodin vaiheet 19.7., käytä näitä, älä johda muistista):** metodi EI ole pintatyyli vaan kognitiivisen työn JÄRJESTYS — prosessointi ennen keräämistä, ymmärrys ennen yksityiskohtaa (sama henki kuin Sataman "toiminto sinne missä ajatus syntyy"). Ydin: low-order (pänttäys, irralliset faktat, unohtuu) → high-order (käsitteiden suhteet, hierarkia, analogiat, verkosto — muisti syntyy ymmärryksen sivutuotteena). Kuusi osa-aluetta joiden mukaan palikat ja "miten"-kortit rakennetaan:
   - **PRIMING (ennen opiskelua):** silmäile otsikot/kaaviot/sisällys, mieti mitä jo tiedät, muodosta kysymyksiä, ennusta. Vähentää ylikuormaa, luo kiinnityskohdat.
   - **ENCODING (ydin):** hierarkisointi (mikä pääajatus / mikä yksityiskohta), chunking (20 faktaa → 3–5 kokonaisuutta), relational learning (syy-seuraus, osa-kokonaisuus, analogia). Sung: useimmat lukevat liikaa, prosessoivat liian vähän.
   - **KONSEPTIKARTAT ajattelutyökaluna** (EI kaunis kopio kirjasta — ryhmittely/vertailu/yhteyksien etsintä ON se oppiminen).
   - **RETRIEVAL:** sulje kirja, muistele/selitä ääneen/opeta/vastaa kysymyksiin. Välttämätön.
   - **INTERLEAVING:** sekoita aiheita (ei 4h yhtä, vaan vuorotellen) → aivot oppivat valitsemaan menetelmän.
   - **REFERENCE + OVERLEARNING:** tarkat faktat/kaavat lähteeksi (ei opiskelun pääasia), ja hieman yli tenttivaatimuksen.
   - **PACER (ymmärryksen tasot, oikea järjestys):** Procedural → Analogous → Conceptual → Evidence → Reference. Sungin ydinvaroitus: älä aloita Reference-tasolta (faktat) ennen Conceptual-tasoa (miksi ilmiö toimii) — useimmat aloittavat väärästä päästä.
   HUOM: spaced repetition on VAIN pieni osa (ei ydin — Katri korosti tätä). Metodi on TAITO joka kehittyy kuukausia; suunnitelman pitää tukea sen HARJOITTELUA, ei olettaa sitä valmiiksi.
3. **Kalenteri + Kuormavahti (JO OLEMASSA)** → ajastus todellisiin sopiviin ikkunoihin.

**Ulos — palikat kalenterissa, kaksi kenttää kussakin:**
- **MITÄ:** se palikka ("Luku 3.1–3.2")
- **MITEN:** konkreettinen aloitusohje profiilin mukaan ("45min: lue kynä kädessä → sulje kirja → kirjoita muistista 3 pääkohtaa → tarkista") — TÄMÄ poistaa arpomisen/jumin: et mieti miten aloitat, teet mitä kortti sanoo. Tehokkaat opiskelumetodit (aktiivinen kertaus, testautuminen, spaced repetition, Pomodoro) SISÄÄNRAKENNETTU palikoiden muotoon, ei erillisenä oppituntina.
*Sung-tarkennus (Katri):* palikka EI ole "Luku 3, 2h" vaan METODIN VAIHE aiheeseen — sama materiaali tuottaa useita eri palikoita eri kognitiivisella toiminnalla, PACER-järjestyksessä: (1) priming-palikka ("silmäile luku 3, muodosta 5 kysymystä, ~15min"), (2) encoding-palikka ("rakenna käsitekartta luvun 3 suhteista — ei kaunista, vaan yhteydet, ~45min"), (3) retrieval-palikka ("sulje materiaali, selitä ääneen luvun 3 pääidea + miten liittyy lukuun 2, ~20min"), (4) interleaving (sekoita luku 3 aiempiin sopivin välein), (5) reference/overlearning vasta lopuksi (tarkat faktat kun ymmärrys valmis). "Miten"-kortti = sen vaiheen konkreettinen ohje. NÄIN suunnitelma ei ole "lue X tuntia" vaan "prosessoi X oikeassa järjestyksessä" — juuri se mitä Sung tarkoittaa. Koska metodi on harjoiteltava taito, kortit voivat myös OPETTAA vaihetta ensi kerroilla ("tällä kertaa keskity vain yhteyksien etsintään, ei ulkonäköön").

**Kuormatietoisuus + jousto:** ajastus katsoo mihin kalenterissa mahtuu oikeaa opiskeluaikaa (ei täysiä päiviä, ei lasten aikaa illoin), raskaan päivän jälkeen kevyt kertaus ei uutta raskasta. Kertauspalikat spaced repetition -välein ennen tenttiä. Jos palikka jää tekemättä → ei katoa, ei nalkuta (turvainvariantti), siirtyy seuraavaan ikkunaan, suunnitelma laskee uudelleen ("arki testaa" myös tässä).

**Sukulaisuus olemassa olevaan:** jakoluukun (4.9) kevyt serkku (palikoiden syöttö) + kalenterisilta + Kuormavahti (rakennettu) + "miten"-kortit (uusi, mutta sisältöä ei koneistoa). Yksityinen (Katrin hytti — vastasi "vain minulle").

**MONTA KURSSIA YHTÄ AIKAA + KAKSI NÄKYMÄÄ (Katrin ratkaiseva tarkennus 20.7.):** 3–4 kurssia rinnakkain muuttaa systeemin luonteen — se ei ole "kurssi jolla on suunnitelma" vaan YKSI moottori joka näkee kaikki kurssit ja päättää niiden VÄLILLÄ (= Sungin interleaving kurssitasolla). Katri EI halua tietää mitä kurssia milloin — juuri se päätös on se kuorma joka halutaan pois.
*Moottori punnitsee KOLMEA voimaa:* (1) **DEADLINE vetää** — kokeet/palautukset kalenterissa, painovoima KASVAA ajan myötä (koe 3 vk = painaa vähän, 3 pv = painaa paljon) → priorisoi sen kurssin aiheita; (2) **PACER jäsentää** — ei koskaan encodingia ennen primingiä, oikea vaihe seuraavaksi kurssista riippumatta; (3) **KUORMA rajoittaa** — Kuormavahti kertoo paljonko ja minkä painoista tänään voi tarjota (raskas päivä → kevyt SR-kertaus, kevyt → uusi encoding). Risteyksestä syntyy "tänään": 1–2 konkreettista askelta eri kursseilta, Katrin tietämättä että jokin valittiin.
*KAKSI NÄKYMÄÄ (tärkein IA-päätös — eivät saa sekoittua):*
- **NÄKYMÄ 1 — arjen ikkuna (appi avautuu tähän):** EI kurssivalikkoa vaan tämän päivän 1–2 askelta (mitä + miten + vaihe + kuittaus [tehty]/[en ehtinyt]/[näytä ohje]). Sinä vain teet mitä lukee.
- **NÄKYMÄ 2 — kokonaiskartta (vilkaistavissa, ei ohjata):** kurssit palkkeina, väri = vaihe (hallussa/työn alla/edessä), deadline näkyvissä. "Olen tässä" -vilkaisu, EI tehtävälista. Rauhoittava, ei ahdistava.
- Miksi erillään: jos kartta olisi etusivu → näkisit joka aamu kaiken keskeneräisen = ahdistus (dashboard-ansa jota Kuormavahti torjuu). Jos ohjausta ei olisi → joutuisit itse päättämään = se kuorma jonka halusit pois. Molemmat tarvitaan, erillään.
*"Näytä ohje" -nappi* kussakin askeleessa: avaa metodiprofiilin mukaisen konkreettisen ohjeen sille vaiheelle (alussa opettaa vaihetta, myöhemmin muistuttaa).

 Katri tarvitsee OPETUSTA metodin tekemiseen samalla kun oikea koulu pyörii täydellä vauhdilla — ei kuukausia rauhassa harjoitella (Sung: taito kehittyy kuukausia–vuosia, mutta tentit ovat NYT). Tämä on eri asia kuin vaiheiden ajastaminen: appi/ohjaaja ei vain sano "tee priming" vaan NÄYTTÄÄ miten, elävällä kurssimateriaalilla, vähitellen. Toteutus kaksitasoinen: (1) **käsin, heti (ei vaadi appia):** Claude/ohjaaja ohjaa Katrin läpi metodin oikealla kurssimateriaalilla vaihe vaiheelta — opit kurssin sisällön JA metodin teon samaan aikaan; (2) **appiin myöhemmin:** "miten"-kortit opettavat vaihetta ensi kerroilla ("tällä kertaa keskity vain yhteyksiin, ei ulkonäköön"), ja vaikeustaso nousee kun taito karttuu (aluksi enemmän ohjausta, myöhemmin vain muistutus). Periaate: metodia ei oleteta osatuksi vaan rakennetaan taidoksi tekemisen kautta, oikean opiskelun lomassa — ei erillisenä harjoitteluna jolle ei ole aikaa.

**OHJAAVA MOOTTORI — appi tietää missä menet ja tarjoaa seuraavan (Katrin ratkaiseva linjaus 20.7.):** Katri EI halua valita palikoita itse — appi OHJAA. Tämä kääntää arkkitehtuurin: et syötä palikoita kalenteriin, vaan MOOTTORI laskee tilasta mitä sinun pitäisi opiskella ja tarjoaa YHDEN seuraavan askeleen (kuten Päivän askel, opiskelulle). Kolme osaa:
- **Kurssikortti pitää kirjaa TILASTA:** aihe ei ole "tehty/tekemättä" vaan MISSÄ PACER-VAIHEESSA se on (luku 3 = encoding kesken, luku 4 = priming tehty, luvut 1–2 = ylläpidossa). Tämä tila on systeemin äly. Varastointivaiheeseen (kun kurssi lepää) riittää TIIVISTELMÄ tilasta.
- **Moottori katsoo neljää yhdessä:** aiheiden tila + Kuormavahti (onko tänään tilaa) + PACER-järjestys (looginen seuraava vaihe) + SR-eräpäivät (mikä opittu kaipaa kertausta) → tarjoaa yhden askeleen ("tänään: rakenna luvun 3 käsitekartta, ~45 min, keskity yhteyksiin"). Ei valikkoa.
- **Kierto — mikään ei "valmistu":** "tehty" → aiheen tila etenee (encoding → retrieval) JA opittu putoaa SPACED REPETITION -kiertoon joka palaa kevenevällä tahdilla. "Kaiken jo opiskellun SR" ei ole erillinen ominaisuus vaan SAMA moottori joka tarjoaa retrieval-palikoita vanhoista aiheista uusien lomassa — mikä on samalla Sungin INTERLEAVING (vanha+uusi sekaisin). Aihe ei pääty, se siirtyy ylläpitoon.
Näin systeemi vastaa Katrin ydintarpeeseen: "en halua arpoa mitä opiskella — appi kertoo missä menen, mitä on jäljellä, ja mitä teen nyt."

- **VAIHE 1:** manuaalinen palikointi + opiskelutyyliprofiili + "miten"-kortit + ajastus kalenteriin Kuormavahtia kunnioittaen. Toimii ilman muuta. Tämä yksin ratkaisee ydintarpeen (ei arpomista arvokkaalla ajalla).
- **VAIHE 2:** äly auttaa pilkkomisessa (materiaalin rakenteesta palikat automaattisemmin) + spaced repetition -automaatti.
- **VAIHE 3 (raskain, ehkä ei koskaan):** materiaalin syvempi jäsennys. Vain jos vaihe 1–2 osoittavat tarpeen — todennäköisesti ei, koska ydin on suunnittelu ei sisällöntuotanto.

Copilot-aikaa (iso). Vaihe 1 on itsenäinen ja rakennuskelpoinen heti kun aika sallii.

**4.11-LISÄYS: TAITOSOLMUT — RAKENNETTU 2026-08-04, TÄSMENNETTY SILTASOLMUIKSI 2026-08-05.** Alkuperäinen 2026-08-04-versio mallinsi taitosolmut väärin (koko kahden kurssin sisältönä) — Katri täsmensi: taitosolmu on VAIN silta, käsite joka toistuu kahdessa tai useammassa AKTIIVISESSA kurssissa yhtä aikaa, ei koskaan yksittäisen kurssin sisältö (se kuuluu `opinto_kurssit`/`opinto_aiheet`-radalle, ennallaan). `taitosolmut`/`taito_kaaret`-datamalli (owner_id+RLS, sama PACER-vaihe) pysyy, `tarvitsee`-kaari on edelleen portinvartija AND-semantiikalla, `liittyy`-kaari vain lukua varten — mutta KÄYTTÖ kutistui 95 solmusta odotettuun ~10-20 aitoon siltaan/lukukausi. Uutta: siltasolmun paino on KÄÄNTEINEN kurssitehtävään verrattuna (korkein heti ikkunan auettua, laskee kohti sulkeutumista — sillan arvo on siinä että se on hallussa ENNEN tarvetta), kiireellisyys leviää vaimennettuna tarvitsee-kaarten yli, ja moottori on nyt KAKSITASOINEN — umpeutuva kurssitehtävän deadline voittaa AINA sillan, koodissa rikkomattomasti. Samassa erässä myös Huolilippu (ennallaan, ERI mekanismi kuin ristiriitapaketti), käsitekartta-editori (ennallaan, TIETOISESTI ilman käsialantunnistusta/tekoälyä), sekä UUSI AI-avusteinen siltatunnistus (kertaluontoinen, käyttäjän hyväksymä rivi kerrallaan, käyttää olemassa olevaa `/api/aly`-putkea) ja session-loki (todellinen aktiivinen työaika ▶/⏸, ei kalenteripäivät). Täysi tekninen kuvaus: muistiinpanot.md "Siltasolmut" -osio (ja "Taitosolmut + Huolilippu" -osion oma varoitus superseded-osista).

**RISTIRIITAPAKETTI v2 — RAKENNETTU 2026-08-06.** Korvaa `ristiriitapaketti`-kohdan (yllä, OSA 3) `onkoRauhoitettuPaiva()`-osan: vanha YKSI jaettu "kouluaika klo 9-15" -sääntö kaikille lapsille korvattu lapsikohtaisella hoivaikkuna-mallilla (`lapset`+`lapsi_viikkopohja`+`lukuvuosijaksot`+`lapsi_paivapoikkeus`, sql/105-108). Full-taso (sama henkilö kahdessa paikassa) EI RIIPU LAPSISTA — hoivaikkuna vaikuttaa VAIN attention-tasoon. `onkoRauhoitusIkkunassa()` (Hytin rutiinipäällekkäisyyksien vaimennus) EI kosketettu, eri mekanismi samannimisestä huolimatta. Uutta myös: `kattaa_lapset`-kenttä kalenteritapahtumalle (yksi kenttä, kolme käyttötapausta), huolilipun valinnainen tapahtuma-ankkurointi (päivämäärän LISÄKSI), siirtymäpuskuri+vähimmäispäällekkäisyys-kynnykset (vaikuttavat kaikkiin tasoihin). Ristiriitamerkin symboli (⚠️, korvaa vanhan tekstipillerin) rakennettiin jo etukäteen 2026-08-05. Laituri-jäsennys (AI-avusteinen vapaan tekstin → rakenteellinen tulkinta) TIETOISESTI seuraavaan vaiheeseen — isoin pala, ei rakennettu vielä. Täysi kuvaus: muistiinpanot.md "Ristiriitapaketti v2" -osio.

---

## OSA 5: MITEN TÄTÄ KEHITETÄÄN COPILOTIN KANSSA

### Katrin työskentelytapa (todistetusti toimiva)
1. **Arki testaa, ei testilistat.** Käytä appia oikeasti; kirjaa havainnot heti kun huomaat ("pötkönä"). Paras löydös on epäjohdonmukaisuus ("toimii tuolla muttei täällä") — se johtaa aina tarkempaan korjaukseen kuin "ei toimi".
2. **Yksi asia kerrallaan Copilotille.** Rajattu oire + toivottu käytös + testikriteeri. Malli: *"OIRE: X tapahtuu kun Y. ODOTUS: Z. TESTI: kun teen Y, näen Z."*
3. **Migraatiokäytäntö säilyy:** numeroidut idempotentit tiedostot sql/-kansiossa, ajetaan Supabase SQL Editorissa järjestyksessä. Copilot kirjoittaa, sinä ajat.
4. **sw.js-versio ylös aina kun client-koodi muuttuu** — muuten puhelin näyttää vanhaa (se "sulje ja avaa" -ilmiö).
5. **Vahvistus seuraa todellisuutta** — vaadi jokaiselta uudelta kirjoituspolulta vastauksen tarkistus. Tämä on se sääntö jonka rikkomisesta maksettiin viidesti.
6. **Dokumentoi opit muistiinpanot.md:hen** samalla kaavalla kuin ennenkin (bugi + juurisyy + korjaus + oppi). Se loki on Copilotin paras opettaja.
7. **Testirivit apin listalle jokaisesta uudesta ominaisuudesta.** Aina kun rakennat uutta testattavaa toiminnallisuutta, tuota samassa erässä myös idempotentti migraatio joka lisää sitä vastaavat testirivit apin sisäiselle "Testipäivä"-listalle (sql/054-malli: lisää loppuun, älä nollaa täpättyjä). Syy: Katri testaa konkreettisesti puhelimessa (bussimatkalla, yhdellä peukalolla), joten **apin lista on se todellinen testauskäyttöliittymä** — ei muistiinpanot.md, jota ei lueta puhelimella. Roolit erillään: muistiinpanot.md:n "Testauslista — kesken" = koneen/Copilotin työmuistio; apin "Testipäivä"-lista = Katrin täppäyskäyttöliittymä. Pidä molemmat ajan tasalla samalla työllä, älä jätä apin listaa jälkeen.

### Mihin Copilot pystyy hyvin
Rajatut bugikorjaukset ("nappi ei reagoi", "kenttä ei tallennu") · olemassa olevan laajennukset samalla kaavalla (uusi lista-tyyppi, uusi asetus) · CSS/ulkoasu · SQL-migraatiot mallin mukaan · selitykset ("mitä tämä funktio tekee").

### Mihin Copilot EI pysty samalla tavalla kuin Code
Kokonaisen moduulin arkkitehtuuri tyhjästä yhdellä kertaa · monen tiedoston läpileikkaavat muutokset · itsenäinen tutkiminen ja commit-ketjut. **Siksi isot konseptit (osa 4) rakennetaan paloina**: yksi virtaus kerrallaan, tämä kirja speksinä, ja jokainen pala testataan ennen seuraavaa.

### Jos jokin menee pahasti rikki
1. Git on turvaverkko: `git log` näyttää historian, `git revert <commit>` peruu muutoksen rikkomatta historiaa.
2. Varmuuskopiot: ks. muistiinpanot.md "Varmuuskopiot"-osio.
3. Data on Supabasessa — appin rikkoutuminen ei kadota dataa. Pahimmassakin tapauksessa listat ja kalenteri ovat tallessa kannassa.

### Hiljaiset sammumiset — kaksi ansaa jotka laukeavat juuri kun kehitys hidastuu
1. **GitHubin 60 päivän sääntö:** privaattirepon ajastetut Actions-työt (muistutusten varalaukaisija!) sammuvat automaattisesti ja hiljaa 60 commit-vapaan päivän jälkeen. Eli juuri kun Satama on "valmis" eikä committeja tule → varalaukaisija kuolee huomaamatta. Torjunta: mikä tahansa commit nollaa laskurin (pieninkin dokumenttipäivitys riittää) — tai käy hyväksymässä workflow uudelleen GitHubissa jos se on ehtinyt sammua.
2. **cron-job.org on ulkoinen ilmaispalvelu** jonka tilaa kukaan ei vahdi — jos työt sammuvat (tilin nukkuminen, palvelumuutos), muistutukset ja synkka hidastuvat/lakkaavat hiljaa. Torjunta: jos muistutukset alkavat myöhästellä, tarkista ENSIN cron-job.orgin dashboard (toimivatko työt, 200-vastaukset). Riippuvuuskartta + oireet-taulukko: muistiinpanot.md "Riippuvuudet ja rajat".

---

## OSA 6: MITÄ TÄMÄ PROJEKTI ON OPETTANUT (säilytettävät opit)

1. **Hiljainen epäonnistuminen on pahin vika.** Viisi kertaa järjestelmä väitti onnistuneensa valehdellen. Jokainen niistä söi luottamusta enemmän kuin näkyvä kaatuminen olisi syönyt.
2. **Oikea käyttö löytää viat joita mikään testilista ei löydä.** "Huomenna"-bugi vaati kolme aamua arkea. Kalenterin kirjoitusbugi vaati kaksi käyttäjää ja aitoja tapahtumia.
3. **Käyttäjän arki voittaa suunnittelijan kategoriat.** Kuormavahti, keskustelun hylkäys, luentojen näkyvyys — jokaisessa siisti abstraktio hävisi todelliselle elämälle, ja hyvä niin.
4. **Paras ominaisuus on joskus se jota ei rakenneta.** No questions -sääntö, kielenvaihdon tekemättä jättäminen, ajanmittauksen jäädytys.
5. **Kaksi käyttäjää samassa taloudessa tarvitsevat eri työkalut samaan ongelmaan.** Katrin Laituri ja Juhan Päivän askel ratkovat molemmat toiminnanohjausta — täysin eri muodoilla. Sama talo, kaksi huonetta, yhteinen perustus.
6. **Yksityisyys vuotaa kirjoituspolusta, ei vain lukupolusta.** RLS-auditointi 19.7. (7228987): kalenterisyötteiden LUKU oli suojattu oikein (UI-testit eivät ikinä paljastaneet mitään) — mutta KIRJOITUS oli auki: kuka tahansa kirjautunut olisi voinut kääntää hytti-syötteen näkyvyysasetuksen ja paljastaa sen sitä kautta. Oppi: RLS-policyt tarkistetaan KAIKILLE operaatioille (select/insert/update/delete) joka taululle — "luku suojattu" ei riitä, koska asetuksen muuttaminen on epäsuora lukureitti. Ja: UI-testaus todistaa vain kokeillut reitit; kokonaiskatselmus löytää loput. Sama auditointi sulki myös täysin autentikoimattoman caldav-endpointin (paljasti syöteotsikot URL:n tietäjälle).
7. **Rinnakkaiset ajot vaativat atomisen varauksen.** Toisto-auditointi 19.7. (5b83ed9): kolme aitoa racea — pahin push-tuplalähetys (kaksi limittäistä cron-ajoa olisi voinut lähettää saman muistutuksen kahdesti). Oppi ja pysyvä sääntö: jokainen ajastettu/toistuva polku tekee ATOMISEN varauksen ("claim") ennen toimintoa — pelkkä "tarkista onko tehty → tee" jättää raon kahden ajon väliin. Cron-job.org + GitHub Actions pingaavat molemmat, joten limittäiset ajot ovat todellisuutta, eivät teoriaa.
8. **Syöte DOM:iin vain textContentina.** XSS-auditointi 19.7.: puhdas tulos — koko koodikanta käyttää jo textContent/createElement-mallia, myös autentikoimaton laituri-add-kirjoituspolku. Sääntö kirjattu jotta se säilyy: käyttäjä- tai ulkosyöte (murut, ICS-otsikot, push-tekstit) ei koskaan mene innerHTML:ään.

---

*Tämä kirja on elävä dokumentti. Kun konsepti rakentuu, siirrä sen speksi muistiinpanot.md:hen rakennettujen joukkoon ja merkitse tähän valmiiksi. Kun uusi konsepti syntyy, kirjaa se tänne samalla kaavalla: miksi, kenelle, virtaukset, rajaukset, avoimet kysymykset.*
