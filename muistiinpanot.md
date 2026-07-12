# Kauppalista / Satama — projektimuistiinpanot

## Mistä on kyse

Katrin opetusprojekti: jaettu kauppalista hänen ja miehensä välillä. Toimii PWA:na iPhonessa.
Projekti on myös **Satama-sovelluksen vaihe 1** — myöhemmin kasvaa isommaksi perheen toiminnanohjaussovellukseksi.

**Julkaistu:** https://kauppalista-nine.vercel.app
**Repo:** https://github.com/yli-jaakkolaK/Kauppalista (main-haara → auto-deploy Verceliin)
**Supabase projekti:** https://uctmxxeewoeydabuepye.supabase.co

---

## Design-periaate: VILKAISUARVO (konseptikirjattu 2026-07-13, koskee KOKO Satamaa)

**Sataman onnistumisen mittari on tapahtuiko elämä, ei käytettiinkö appia.** Jokainen pinta suunnitellaan antamaan arvonsa YHDELLÄ VILKAISULLA, ilman napautuksia — kotinäytön pallura voi hoitaa koko tehtävänsä vaikka appia ei avata koko päivänä. Kuittaukset ja täppäykset ovat KIRJANPITOA, eivät EDELLYTYS: mikään ei rankaise sitä joka vilkaisee mutta ei täppää. Sovellus ei vaadi vuorovaikutusta todistaakseen arvonsa — riittää että tieto oli näkyvissä oikealla hetkellä.

**Katrin kiteytys, joka synnytti tämän periaatteen:** *"lapsi on käyty hammaslääkärissä ehkä juuri siksi että se pallura oli siellä — vaikken painanut mitään."*

**Mitä tämä tarkoittaa käytännössä suunnittelupäätöksissä:**
- Etusivun/kotinäytön huomiopallurat (ks. "Huomiopallurat"-osio) ovat tämän periaatteen konkreettisin nykyinen toteutuma — pallura + iOS-kotinäytön kuvakenumero välittävät koko tarvittavan tiedon ILMAN että appia tarvitsee koskaan avata, saati napauttaa mitään.
- Kun suunnittelet UUTTA pintaa (uusi laatta, uusi merkki, uusi ilmoitus): kysy ensin "mitä käyttäjä tietää TÄSTÄ pinnasta jos hän VAIN vilkaisee, ei kosketa mitään?" — jos vastaus on "ei mitään hyödyllistä", pinta ei täytä Vilkaisuarvoa vielä.
- Kuittaus/täppäys EI OLE onnistumisen mittari — sen puuttuminen ei tarkoita että asia jäi hoitamatta, vain ettei sitä kirjattu. Älä koskaan rakenna logiikkaa joka OLETTAA "ei kuitattu = ei tehty".
- Yhdistyy jo kirjattuun Huomiopallurat-periaatteeseen ("pallura vain reaktiota odottaville asioille") — Vilkaisuarvo on se SYVEMPI miksi: pallura on olemassa jotta VILKAISU riittää, ei jotta käyttäjä pakotetaan sisään appiin täppäämään.

---

## Design-periaate: MAKSIMIAUTOMAATIO, MINIMIKUSTANNUS (konseptikirjattu 2026-07-13, koskee kaikkea automaatiota ja äly-putkea)

**Kaikki mikä voi tapahtua automaattisesti, tapahtuu automaattisesti — mutta halvimmalla toimivalla tavalla.** Automaatio on tavoite (ks. Vilkaisuarvo yllä: elämän pitää tapahtua ilman että käyttäjän tarvitsee vääntää sitä käsin), mutta jokainen automaation lisäkerros maksaa jotain (rahaa, viivettä, ylläpitoa) — se maksu pitää aina minimoida, ei vain hyväksyä sivuvaikutuksena.

**Neljä käytännön sääntöä:**
1. **Äly VAIN siihen mihin logiikka ei taivu.** Ajastukset, säännöt, laskennat ja siirtymät tehdään AINA koodilla/datalla ilman älykutsua, jos ne vain voidaan ilmaista sellaisina — äly on viimeinen keino, ei oletustyökalu. Esim. Kuormavahti, Ristiriitamerkki ja kuittausjono ovat kaikki puhdasta laskentaa, ei yhtäkään älykutsua niissä, eikä pidäkään olla.
2. **Älykutsut ERISSÄ ja TAPAHTUMISTA** (napin painallus, yöajo, uusi data) — EI KOSKAAN silmukassa, ei jokaisella avauksella, ei uudelleen samalle jo arvioidulle datalle. Käsitelty-merkinnät (esim. "jo luokiteltu", "jo tarkistettu tälle riville") estävät saman kutsun toistamisen turhaan.
3. **Halvin malli joka riittää tehtävään.** `ALY_MALLI`-arkkitehtuuri (ks. Äly-putki-osio ja COPILOT.md) mahdollistaa mallin vaihdon PER käyttötarkoitus ilman koodimuutosta — kevyt luokittelutehtävä (esim. Laituri-avustajan ehdotus) ei tarvitse samaa mallia kuin monimutkaisempi päättely joskus tulevaisuudessa.
4. **Usage-lokitus jokaisesta kutsusta pysyy AINA** — kustannus on oltava nähtävissä (Vercelin Logs, `console.log('[aly]', ...)`-kirjaus token-määrineen), ei koskaan piilossa.

**Copilot-ajan suunnittelukysymys JOKAISELLE uudelle älyominaisuudelle ennen rakentamista:** *"Voiko tämän tehdä ilman älykutsua — ja jos ei, kuinka harvoin kutsu riittää?"*

---

## Jatka tästä (päivitetty 2026-07-15)

**Asennusvaihe on VALMIS** — kaikki migraatiot (001–034, ks. tila alempana), Vercel/GitHub-secretit ja äly-putken avain on käsin asennettu 2026-07-13. **PALUU.md on nyt testipäivän ajolista**, jaettu kahteen vaiheeseen: VAIHE 1 (Katrin soolotestit, tehtävissä milloin vain) ja VAIHE 2 (torstain testit Juhan kanssa — kalenterisyötteiden symmetria, Ankkurit-peilikuva, Huomiopallurat, push-muistutukset).

**Pikkutyöjono (2–5 tehty, ks. Muutosloki) on VALMIS** — Huomiopallurat, Kuormavahdin toinen kontrastikierros, Vinkit ohjeet-tauluna, Varaston "Luo kopio", Ruoka-välivaihe. Kaikki EI TESTATTU KÄYTTÖLIITTYMÄSTÄ vielä, ks. PALUU.md.

**Iso ristiriitapaketti odottaa yhä porttinsa takana** — EI aloitettu, testit sille (ja muulle VAIHE 2:lle) torstaina 16.7.2026.

**Testipäivän tarkistuslista (`sql/036_testipaiva_lista.sql`) elää nyt Satamassa itsessään** (jaettu Muistilaput-lista "Testipäivä to 16.7.") — täpätään sieltä torstaina, PALUU.md on rinnalla tekninen referenssi per testi.

**Pakkauslistojen sisältö saatiin ja kirjoitettu** (`sql/037`, `sql/038`) — EI VIELÄ AJETTU Supabasessa, ei kiireellinen, ei estä torstain testejä. `sql/038` sisältää nimihuomautuksen (ks. "Varasto"-osio) jos halutaan kuvaavampi listan nimi.

**BUGI KORJATTU: listan poisto ei toiminut** (`sql/039` + `deleteList()`-koodikorjaus, funktio nimetty uudelleen englanniksi `poistaLista()`:sta samassa työssä — ks. "Koodikieli"-osio COPILOT.md:ssä) — ks. "Bugikorjaus: Listan poisto ei toiminut" -osio. AJA `sql/039` ennen kuin testaat listan poistoa. EI TESTATTU vielä oikealla laitteella.

**BUGIPAKETTI KORJATTU (2 lisää):** Laituri-pallura ei sammunut (`sql/040` + koodikorjaus, "nähty" ei "sijoittamatta" -periaate) ja pitkän rivin ×-nappi karkasi ruudun ulkopuolelle (CSS-korjaus, ei migraatiota). Palluran raportoitu punainen väri tutkittu, ei löytynyt koodivikaa — todennäköisesti laitteen vanha välimuisti. AJA `sql/040` ennen Laituri-testejä. Ks. "Bugikorjaus: Laituri-pallura" ja "Bugikorjaus: pitkän rivin ×-nappi" -osiot. EI TESTATTU vielä oikealla laitteella.

**E3-keskiporras V1 "Äly toimii, ihminen valvoo" VALMIS ja pushattu** keskiviikkoiltaan mennessä (ks. "E3-keskiporras V1" -osio) — kolme uutta migraatiota (`sql/041`–`043`), uusi yöajo-endpoint (`api/aly-nightly.js`), ankkuriehdotukset etusivulle, "Mitä äly on tehnyt" -loki Asetuksiin. AJA `sql/041`–`043` ennen torstain testejä. **EI TESTATTU vielä** — testataan torstaina VIIMEISENÄ (ks. PALUU.md OSA O), vasta kun VAIHE 2:n perusosat on ensin kuitattu. Ei koskettu odottavaan pakettiin (ristiriitalippu, ankkurilähetys toiselle).

Jos joudut päättämään mistä jatkat: aja ensin PALUU.md:n VAIHE 1 -testit läpi (täppäys Satama-listalta), sitten torstaina VAIHE 2 Juhan kanssa, sitten E3-keskiportaan OSA O viimeisenä, ja vasta sen jälkeen aloita ristiriitapaketti.

---

## Muutosloki (mitä tehty minäkin päivänä)

Tämä osio on lyhyt päiväkirjamainen kooste — tarkka sisältö löytyy aina viitatusta osiosta alempaa. Pidetään ajan tasalla jatkossa jokaisen työskentelykerran lopuksi, jotta kuka tahansa (myös Copilot ilman pääsyä tähän keskusteluun) näkee nopeasti missä järjestyksessä asiat on rakennettu.

- **2026-06-09 – 2026-07-01:** Projektin aloitus, ensimmäinen toimiva versio kauppalistasta
- **2026-07-02:** Siirto Supabaseen (oli aluksi localStorage), kuitti-ilme, PWA-tuki (asennettava kotinäytölle), offline-toiminta, Siri-integraatio (`/api/add`)
- **2026-07-03:** Korjattu Realtime-yhteyden katkeaminen kun PWA on ollut taustalla, kirjattu Satama 2.0 -kokonaisvisio
- **2026-07-06:** Google-kirjautuminen, monilistatuki (voi luoda useita listoja pelkän Kauppalistan lisäksi), tapahtumaloki, oma vahvistusdialogi (ei enää selaimen ponnahdusikkunaa)
- **2026-07-07 (iso päivä):** Väliotsikot listoihin, rivien raahausjärjestys, näkyvyysmalli + tietoturva (RLS) käyttöön KAIKILLE tauluille, Laituri (yhteinen muistilappu), koko etusivu suunniteltu uusiksi (Ankkurit + Horisontissa + navigointiruudukko), Varasto-näkymä, oma sisäinen Kalenteri (päivä/viikko/kuukausi), ⚓-ankkurointinappi, kalenteri ja ankkurit yhdistetty samaan "tänään"-näkymään — ks. "Kalenteri"-osio
- **2026-07-08:** Isommat kuvakkeet etusivun ruudukossa + kalenterikuvake näyttää päivän numeron, ja iso uusi ominaisuus: ulkoisen kalenterin (iCloud tms.) tuonti Satamaan hyväksyntäjonon kautta — ks. "Kalenterisyötteet"-osio. Kirjattu (ei toteutettu) täydet suunnitelmat kahdelle tulevalle ominaisuudelle: Horisontti (ks. "Horisontti — suunnitelma") ja Ohjebanneri-järjestelmä (ks. "Ohjebanneri-järjestelmä — suunnitelma", toteutetaan Hytin yhteydessä). Toteutettu pakkauslistojen automaattinollaus — ks. "Pakkauslistan automaattinollaus" -osio, ja lisätty ensimmäinen yleiskäyttöinen toast-ilmoitusmekanismi (`naytaIlmoitus()`). Toteutettu web push -infra (VAPID-avaimet, tilaus, testilähetys, ensimmäinen kevyt Asetukset-näkymä) — ks. "Push-ilmoitukset"-osio, valmisteltu illan kahden puhelimen testisessiota varten. **Sama päivä, myöhemmin:** rakennettu Oma Hytti v1 (henkilökohtainen työtila, casekortit + automaattinen tehtäväkooste, täysin yksityinen) — ks. "Oma Hytti"-osio. `sql/016_hytti.sql` AJETTU Supabasessa. Lisätty vielä Hytin tänään-erääntyvien tehtävien näkyminen Kalenterin päivänäkymän tänään-agendassa (pois/päälle-kytkin Asetuksissa, oletus päällä) — ks. "Oma Hytti"-osion "Kalenteri-integraatio"-kappale. **Sama ilta, vielä myöhemmin:** Katri testasi kalenterisyötteet-ominaisuuden oikealla datalla ja löysi puutteen — osa perheen tapahtumista elää Juhan henkilökohtaisissa kalentereissa joita Katrin iCloud-tunnukset eivät näe. Lisätty tuki toiselle CalDAV-tilille (`sql/017_kalenteri_tilit.sql`, `kalenteri_syotteet.account_key`) — ks. "Kalenterisyötteet"-osion "Useampi CalDAV-tili"-kappale. **Sama ilta, vielä myöhemmin:** rakennettu Kalenterin kuukausinäkymälle oikea 7-sarakkeinen ruudukko (korvasi aiemman pelkän päivälistauksen) ja tuki usean päivän kestäville tapahtumille (esim. lomaviikko) — nämä näkyvät nyt värillisenä palkkina jokaisen kattamansa päivän kohdalla pallukan toistamisen sijaan, sekä päivä- että viikkonäkymässä myös joka päivänä jonka tapahtuma kattaa. `sql/018_kalenteri_monipaivainen.sql`. **Sama ilta, vielä myöhemmin:** Katri testasi kalenterisyötteet-ominaisuuden — löytyi ja korjattiin `ICLOUD_APP_PASSWORD`-virhe (401), lisätty `?listaa=katri`/`?listaa=juha`-diagnostiikkaparametri kalenterien näyttönimien selvittämiseen, ja huomattu että `kalenteri_syotteet`-taulu oli koko ajan TYHJÄ — synkka ei koskaan ollut oikeasti epäonnistunut, sille ei vain ollut annettu mitään syötettä. Korjattu `sql/019_kalenteri_syotteet_data.sql`:llä (kolme syöterivia Katrin tilille) ja kirjattu uusi pysyvä periaate: kaikki Supabase-data, myös syötteet, kulkee versioituna migraationa, ei ikinä irtokomentona SQL Editoriin — ks. "Tiedostorakenne"-osion PERIAATE-huomautus. **Sama ilta, vielä myöhemmin:** laajennettu Asetukset-näkymä v1:ksi (Tili/Ilmoitukset/Vinkit/Sovellus — versionäyttö, "Päivitä sovellus" -hätävara, "Hae kalenteri nyt" -käsinlaukaisin), ks. "Asetukset"-osio. **Sama ilta, VIELÄ myöhemmin — ensimmäinen oikea synkkatesti:** 017/018/019 ajettiin, synkka toimi (15 riviä jonoon) mutta paljasti kaksi bugia, molemmat korjattu: BUGI A (hakuikkuna ei ulottunut riittävän pitkälle tulevaisuuteen, `PAIVIA_TAAKSEPAIN`/`PAIVIA_ETEENPAIN`-vakiot laajennettu) ja BUGI B (toistuvan tapahtuman siirretty/peruttu yksittäinen kerta tuotti haamuesiintymän — `getOccurrenceDetails()` otettu käyttöön, testattu paikallisesti oikeaa `ical.js`-kirjastoa vasten synteettisellä RRULE-esimerkillä ennen käyttöönottoa). `sql/020_tyhjenna_kalenteri_odottavat.sql` tyhjentää korjausta edeltäneet virheelliset jonorivit. Ks. "Ensimmäisen testin löydökset" Kalenterisyötteet-osiossa. **Sama ilta, VIELÄ myöhemmin — arkkitehtuuripäätös "yksi totuus, kaksi ikkunaa":** Katri päätti poistaa hyväksyntäjonon (`kalenteri_odottavat`) käytöstä kokonaan — kaikki synkatut tapahtumat näkyvät nyt suoraan agendassa, toisen käyttäjän lisäämät saavat "uusi"-tagin joka KUITATAAN (ei hyväksytä/hylätä). Rakennettu: `kalenteri_tekijat`/`kalenteri_kuittaukset`-taulut (`sql/021`), organizer-pohjainen tekijätunnistus + kevyt varasuunnitelma jos se ei toimi, PEILISÄÄNTÖ synkkaan (muutokset päivittyvät `merge-duplicates`-upsertilla, poistot havaitaan ja poistetaan `siivoaPoistetut()`:llä), `?esikatsele=1`-diagnostiikka organizerin testaamiseen, uusi kuittausjono-UI (badge, linkki, overlay, "Kuittaa kaikki", inline "uusi"-tagi agendassa), Asetusten Vinkkeihin "Missä muokataan mitäkin" -osio, ja suunnitelma (ei toteutettu) Sataman omalle ICS-julkaisulle. `sql/022_kalenteri_puhdas_alku.sql` puhdistaa vanhan mallin datan. Ks. kokonaisuudessaan "Kalenterin periaate: yksi totuus, kaksi ikkunaa" -osio. **Sama ilta, VIELÄ myöhemmin — Kuormavahti:** lisätty automaattinen neutraali varoitusmerkki päivälle jolla on paljon kellonaikamenoja (agenda + viikkonäkymä), raja säädettävissä Asetuksista koodimuutoksetta uuden yleisen `asetukset`-avainarvotaulun (`sql/023_asetukset.sql`) ansiosta. Kuittausjonon kortit näyttävät myös lisähuomion jos uusi tapahtuma osuu jo kuormitetulle päivälle. Todettu samalla että `sql/020` on jäänyt tarpeettomaksi arkkitehtuurimuutoksen myötä — EI TARVITSE AJAA, `022` kattaa sen kokonaan. Ks. "Kuormavahti"-osio. Tämä muistiinpanot.md-tiedosto päätetty pitää jatkossa niin tarkkana että Copilot pystyy jatkamaan projektia pelkän tämän tiedoston varassa, koska kehityskone palautuu 2026-07-23
- **2026-07-10:** Kahden puhelimen testisessio (Katri + Juha) — ks. "Kahden puhelimen testisessio" -osio. Synkka, kuittausmalli ja BUGI A/B -korjaukset todistettu toimiviksi (huom: vain Juha→Katri-suuntaan, peilikuva testaamatta). Organizer-diagnostiikka ajettu oikealla datalla: kenttä on käytännössä aina tyhjä → varasuunnitelma ("kaikki uutena kaikille" + Kuittaa kaikki) vahvistettu pysyväksi ratkaisuksi. Kolme löydöstä: (1) epäily että Satama kirjoittaisi iCloudiin poistettaessa — koodista varmistettu ettei näin ole (ei yhtäkään CalDAV-kirjoituskutsua koko koodikannassa), poistonappi silti piilotettu synkatuilta riveiltä arkkitehtuurin selkeyttämiseksi; (2) Laituriin kirjoitettu teksti katosi näytön kääntyessä (kahdesti, kahdella puhelimella) — todennäköinen syy iOS:n oma PWA-uudelleenlataus kääntyessä, korjattu varmuusverkolla (`localStorage`-luonnos, ei koskaan katoa jatkossa); (3) "Laivatesti" näkyi vain Juhan Satamassa, ei Katrin — jäi selvittämättä, epäilys Katrin puhelimen vanhentuneesta sovellusversiosta (cache). `sw.js` v36. **Sama päivä, vielä myöhemmin:** Katri huomasi ettei Laiturin etusivupallukka nollaantunut näkymän avaamisesta — korjattu erottamalla kaksi eri lukua: etusivun pallukka on nyt laitekohtainen "nähty"-laskuri (`localStorage`, nollaantuu avattaessa), ja uusi teksti Laituri-näkymän sisällä ("N sijoittamatta") näyttää edelleen käsittelemättömien kokonaismäärän. Ks. "Laituri"-osio. `sw.js` v37. **Sama päivä, vielä myöhemmin:** poistettu vanha "muista viimeisin lista ja avaa se suoraan käynnistyksessä" -mekanismi (`LAST_LIST_KEY`, peräisin ajalta ennen Etusivua) — sovellus avautuu nyt AINA Etusivulle kirjautumisen jälkeen, ei koskaan suoraan johonkin yksittäiseen listaan. Ks. "Etusivu"-osio. `sw.js` v38. **Sama päivä, vielä myöhemmin — kalenterin merkkikieli + hionta, testipalautteesta:** kirjattu kolmiportainen väriperiaate kaikille kalenterin päivätason merkeille (kulta=neutraali, meripihka=huomaa tämä, punainen=mahdotonta/vaatii reaktion — vain päällekkäisyysmerkille), ks. "Kalenterin merkkikieli"-osio. Kuormavahdin merkki isonnettu itsensä selittäväksi tekstipilleriksi ("N menoa") ja lisätty PUUTTUNUT kuukausinäkymä (pieni piste). Rakennettu KOKONAAN UUSI päällekkäisyysmerkki (ristiriitalippu): `kalenteri_syotteet.henkilo`-sarake (`sql/024`) erottaa jaetun perhekalenterin henkilökohtaisista, kolme sääntöä (saman kalenterin sisäinen aina, eri henkilöiden kalenterit ei koskaan, muu tapaus rauhoitetun ikkunan mukaan), rauhoitettu ikkuna (kouluvuosi+arkipäivät+klo 9-15+loma-poikkeukset) täysin dataohjattu `asetukset`-taulussa. Korjattu myös WCAG-kontrastia (`--muted`/`--accent-text` tummennettu molemmissa teemoissa, laskettu käsin) ja kalenterin fonttikokoja ulkokäytettävyyden vuoksi. Loma-aikojen automaattitäyttö (koulun lomasivun luku+ehdotus) kirjattu suunnitelmana, EI toteutettu. Ks. "Kuormavahti", "Ristiriitamerkki", "Ulkokäytettävyys ja kontrasti", "Loma-aikojen täyttö" -osiot. `sw.js` v39. **Sama päivä, vielä myöhemmin — Muistutukset v1:** rakennettu henkilökohtainen push-muistutus listan riville/kalenteritapahtumalle/ankkurille (⏰-nappi, `sql/025_muistutukset.sql`, `api/muistutukset-laheta.js`). Ratkaistu samalla pitkäaikainen puute: Vercel Hobby-cron ei riittänyt ajastettuun taustatoimintaan, joten rakennettu ilmainen GitHub Actions -ajastin (`.github/workflows/muistutukset-cron.yml`, 5 min välein) joka kutsuu SEKÄ muistutusten lähetystä ETTÄ kalenterisynkkaa — kalenterisynkka pysyy nyt tuoreena myös taustalla. Ks. "Muistutukset"-osio. **EI TESTATTU LAINKAAN**, vaatii `MUISTUTUKSET_CRON_SECRET`-ympäristömuuttujan asettamisen sekä Verceliin että GitHub-reposecrettinä. `sw.js` v40.
- **2026-07-11:** `d3bac23` (Muistutukset v1) committoitu paikallisesti mutta PUSH EPÄONNISTUI — käytössä olevalta GitHub-tokenilta (klassinen PAT, `osxkeychain`-credential-helper) puuttuu `workflow`-oikeus jota `.github/workflows/`-tiedoston push vaatii. Odottaa Katrin uutta tokenia (rastitettava `repo`+`workflow`-scopet). Samaan aikaan kirjattu (EI RAKENNETTU) täysi lopullinen speksi seuraavalle isolle paketille: Hytti v1 -respeksaus (opiskelulaajennus, kortin oma kalenteri, uusi tyhjätilateksti) + ICS-syötekoneisto (Itslearning/Lukkarikone, `scope='perhe'|'hytti'`) + koko sovellusta koskeva uusi värisääntö "väri koristaa, musta kertoo". Ks. "Hytti v1 + opiskelulaajennus + ICS-syötekoneisto" -osio. **Eksplisiittinen porttiehto: ei aloiteta ennen kuin token-ongelma on ratkaistu, muistutukset pushattu+deployattu, migraatio ajettu JA muistutustesti läpäisty oikealla laitteella.** **Sama päivä, myöhemmin:** token korjattu, `d3bac23` ja Hytti-speksi (`a26b01a`) pushattu onnistuneesti. **Sama päivä, VIELÄ myöhemmin:** Katri purki porttiehdon omalla päätöksellään ennen testausta ("rakenna kaikki valmiiksi, minä testaan kaiken kerralla tiistaina") — koko Hytti v1 + ICS-paketti rakennettu samana päivänä (`sql/026`–`028`, `api/caldav-sync.js`:n uusi `'ics'`-tyyppi, kriittinen RLS-yksityisyyskorjaus `kalenteri_tapahtumat`-tauluun, koko Hytti-UI respeksattu). Uusi PALUU.md kirjoitettu kokoamaan kaikki käsintehtävät askeleet (ympäristömuuttujat, migraatiot, GitHub-secretit, testiohjeet) yhteen paikkaan tiistaita varten. Ks. "Hytti v1 + opiskelulaajennus + ICS-syötekoneisto" -osio täydelle kuvaukselle. **EI TESTATTU LAINKAAN**, sama koskee myös Muistutuksia. `sw.js` v41. **Sama päivä, VIELÄ myöhemmin — Ankkurit henkilökohtaisiksi:** irrotettu omaksi erilliseksi, täysin riippumattomaksi palaseksi (ei odota kalenteritestejä) — ankkurit olivat käytännössä yhteiset (RLS + kyselyt eivät suodattaneet omistajan mukaan), mikä olisi estänyt Juhaa aloittamasta Sataman oikeaa käyttöä. `sql/029_ankkurit_henkilokohtaiset.sql` (backfill + not null + FK + policyt) ja neljä korjattua kyselyä `script.js`:ssä. Lähetys toiselle käyttäjälle ja ristiriitalipun ankkuriehdokkaat jätetty tietoisesti odottavaan pakettiin. Ks. "Etusivu"-osion "Ankkurit henkilökohtaiset" -kappale. `sw.js` v42. **Sama päivä, VIELÄ myöhemmin — kaksi itsenäistä palaa:** (1) **Varmuuskopiot** — koko perheen data oli ilman palautussuunnitelmaa, korjattu `pg_dump`-pohjaisella ratkaisulla (`scripts/varmuuskopio.sh` + `BACKUP.md`), tietoisesti EI hand-rolled JSON-vientiä (identity-sarakkeiden id-arvot eivät kirjoitu tavallisella INSERTillä, JSON-palautus olisi rikkonut FK-suhteet hiljaa). Tallentuu automaattisesti iCloud Driveen jos sellainen löytyy koneelta. (2) **Juhan CalDAV-tilin syöterivit** — sovittu aiemmin, nyt toteutettu: `sql/030_kalenteri_syotteet_data_juha.sql` (Perhekalenteri/Juha/Katri, `account_key='juha'`, `henkilo` asetettu kalenterin identiteetin mukaan). UID-duplikaattisuoja kahden tilin välillä VERIFIOITU lukemalla koodi (ei muutettu) — `event.uid` ei koskaan sisällä syote-/tilikohtaista lisäystä, joten jaettu kalenteri tuottaa saman `ical_uid`:n riippumatta kumman tilin kautta se haetaan. Ks. "Varmuuskopiot"-osio ja "Kalenterisyötteet"-osion Ajolista #1 päivitys. **EI TESTATTU KUMPAAKAAN**, ks. PALUU.md OSA 0 ja OSA E. **Sama päivä, VIELÄ myöhemmin — Äly-putken runko:** ensimmäinen kerros tulevalle älylle (`api/aly.js`, kutsuu Claude API:a, pakollinen JWT-validointi, kustannussuoja `max_tokens`-rajoilla, malli säädettävä `ALY_MALLI`-muuttujasta), "Testaa äly" -nappi Asetuksiin, uusi COPILOT.md (tekninen jatko-opas: miten uusi älyominaisuus lisätään, auth-kaava, kustannusnäkökulma, virheenkäsittely) ja periaate kirjattu: "äly ehdottaa, ihminen kuittaa" — äly ei koskaan kirjoita dataa suoraan ilman käyttäjän hyväksyntää. Mallitunniste (`claude-sonnet-4-6`) Katrin eksplisiittisen ohjeen mukaan, ristiriidassa istunnon oman (vanhentuneeksi todetun) mallilistan kanssa — tehty säädettäväksi juuri tämän epävarmuuden vuoksi. EI yhtään oikeaa älyominaisuutta vielä. Ks. "Äly-putki"-osio ja COPILOT.md. **EI TESTATTU**, vaatii `ANTHROPIC_API_KEY`:n Verceliin, ks. PALUU.md OSA F. `sw.js` v43.
- **2026-07-12:** Äly-putki todistettu — "Testaa äly" vastasi järkevästi oikealla laitteella, `ANTHROPIC_API_KEY` oikein Vercelissä (PALUU.md OSA F merkitty tehdyksi). Heti perään rakennettu ensimmäinen oikea älyominaisuus: **Laituri-avustaja** (✨-nappi sijoittamattomilla Laituri-riveillä, kysyy äly-putkelta ehdotuksen mihin muru kuuluisi käyttäen dynaamisesti haettuja listanimiä + kiinteitä vaihtoehtoja, näyttää ehdotuksen kuittikorttina Sopii/Ei-napeilla). "Sopii" EI siirrä mitään automaattisesti — avaa olemassa olevan sijoitusdialogin esitäytettynä, käyttäjä vahvistaa itse. Periaate "äly ehdottaa, ihminen kuittaa" nyt konkreettisesti totta ensimmäisessä ominaisuudessa. COPILOT.md päivitetty: konseptuaalinen "tapa A" -esimerkki korvattu tällä oikealla, toteutetulla toteutuksella. Ks. "Laituri-avustaja"-osio. **EI TESTATTU VIELÄ**, ks. PALUU.md OSA G. `sw.js` v44. **Sama päivä, VIELÄ myöhemmin — Juhan tilin kalenterisotku ratkaistu:** `sql/030` ajettiin, synkka löysi kaksi nimiongelmaa Juhan iCloud-tilin kalenterien näyttönimissä (jaettu kalenteri eri nimellä kuin Katrin tilillä + kaksi samannimistä "Juha"-kalenteria) — korjattu NIMEÄMÄLLÄ kalenterit selkeiksi iCloudissa (ei koodilla) ja kirjoittamalla `sql/031_kalenteri_juha_nimikorjaus.sql` (UPDATE olemassa olevaan riviin + yksi uusi rivi Juhan uudelleennimetylle "Oma"-kalenterille). Periaate kirjattu: nimitörmäys korjataan AINA nimeämällä iCloudissa ensin, ei koodattua erikoistapausta. Ks. "Kalenterisyötteet"-osio. **EI TESTATTU**, odottaa Katrin ajoa. **Sama päivä, vielä myöhemmin — scope-symmetria valmis:** Juhan uuden "Oma"-kalenterin scope päivitetty `'hytti'`:ksi (`sql/032_juha_oma_hytti_scope.sql`) samalla mekanismilla kuin Katrin opiskelusyötteillä — ei vaatinut mitään uutta koodia tai UUID:tä, vain plain UPDATE + olemassa oleva `henkilo`→`hytti_omistajat`-RLS. Molempien käyttäjien henkilökohtaiset kalenterit nyt symmetrisesti vain omissa Hyteissään. Ks. "Kalenterisyötteet"-osio. **EI TESTATTU.** **Sama päivä, vielä myöhemmin:** Katri huomasi `hytti_omistajat`-taulusta puuttuvan Juhan rivin (alunperin ohjeistettu Table Editor -käsinlisäys, ei vielä tehty) ja pyysi turvallisemman tavan — `sql/033_hytti_omistajat_juha.sql` hakee Juhan auth-tunnisteen `auth.users`-taulusta sähköpostilla (`ylijaakkolaj@gmail.com`) `INSERT ... SELECT`-lauseella, ei koskaan käsinkopioitua UUID:ta. Kaatuu selkeään virheeseen jos sähköpostia ei löydy. **AJETTAVA ENNEN `sql/032`:ta.** Ks. "Kalenterisyötteet"-osio. **EI TESTATTU.** **Sama päivä, vielä myöhemmin:** Katri tarkisti Table Editorista ja vahvisti `hytti_omistajat`-taulusta puuttuvan Juhan rivin todella (ennakkoehto oli aiheellinen — 032 oli jo ehditty ajaa ilman 033:a, mutta harmitonta koska "Oma"-kalenteri oli vielä tyhjä). Pyysi laajemman auditoinnin: onko muita vastaavia "lisää käsin Table Editorista" -asennusaukkoja. Käyty läpi kaikki Table Editor -viittaukset koko dokumentaatiosta — EI löytynyt muita: `kalenteri_tekijat` ja `ristiriita_loma_valit` ovat tietoisesti tyhjänä-turvallisia (ei riko mitään, valinnaisia lisäominaisuuksia), `ohjeet`-taulu ei ole vielä edes rakennettu. Kirjattu talon säännöksi: "lisää käsin Table Editorista" EI OLE hyväksytty asennusaskel millekään pakolliselle riville — ks. "Tiedostorakenne"-osion PERIAATE-laajennus.
- **2026-07-13 — Huomiopallurat:** irrotettu omaksi itsenäiseksi palaseksi Ankkurit-erottelun tapaan (ei riipu kesken olevista testeistä). Etusivun laattojen pallurat uudistettu periaatteella "pallura VAIN käyttäjän reaktiota odottavista asioista" — vanha Laiturin "nähty"-aikaleimapohjainen pallura (`LAITURI_NAHTY_KEY`) POISTETTU KOKONAAN ja korvattu: Kalenteri-laatta käyttää samaa lukua kuin kalenterin oma kuittausjonopallura, Laituri-laatta laskee VAIN toisen käyttäjän `uusi`-tilaiset rivit (oma lisäys ei kerrytä omaa palluraa). Pallura elää reaaliaikaisesti kahden uuden Supabase Realtime -kanavan kautta (`laituri`, `kalenteri_tapahtumat`+`kalenteri_kuittaukset`) — tämä paljasti vielä yhden asennusaukon: Realtime vaatii Replication-julkaisun näille tauluille, joten kirjoitettu `sql/034_realtime_huomiopallurat.sql` (idempotentti) juuri äsken kirjatun "kaikki asennusaskeleet migraationa" -säännön mukaisesti sen sijaan että se jätettäisiin käsin tehtäväksi dashboard-toggleksi. Lisätty myös iOS-kotinäytön kuvakenumero (`navigator.setAppBadge`, Badging API) samaan laskentaan, feature-detected. Push-käsittelijän (sw.js) taustapäivitys jätettiin tietoisesti tekemättä — vaatisi Supabase-istunnon/kyselylogiikan kahdentamisen service workeriin, ei ollut "kevyttä" niin kuin speksin pehmeä toive edellytti. Ks. "Huomiopallurat"-osio. `sw.js` v45. **EI TESTATTU**, ks. PALUU.md. **Sama päivä, myöhemmin — pienten töiden jono aloitettu (kaikki riippumattomia rästitesteistä):** Kuormavahdin näkyvyys + ulkokäytettävyys, toinen kierros: Katrin uusi testipalaute samalla kriteerillä kuin 2026-07-10 ("luettavissa ulkona auringossa käsivarren mitalta") — ensimmäinen korjaus jäi juuri ja juuri AA-rajan (4,5:1) yläpuolelle, ei riittänyt käytännössä. `--muted`/`--accent-text`/`--huomio` tummennettu vaaleassa teemassa VIELÄ KERRAN n. 6-6,5:1:een (tumma teema jo riittävä, ei koskettu). Kuormavahdin merkki isonnettu edelleen (`.paiva-merkki` 12→13px) ja erityisesti viikkonäkymän vaakatila-ylikirjoitus joka oli jäänyt "mikroskooppiseksi" (10px→12px). **Kuukausiruudukon piste sai näkyvän lukeman** (esim. "6") pelkän `title`-hover-vihjeen sijaan, joka ei toiminut kosketusnäytöllä — tekninen elementti oli siis olemassa muttei käytännössä selittänyt itseään mobiilissa. Visuaalisesti tarkistettu Playwrightilla molemmissa teemoissa ennen committia. Ks. "Ulkokäytettävyys ja kontrasti" -osion "Toinen kierros" -alaosio. **EI VIELÄ TESTATTU OIKEASTI ulkona.** `sw.js` v46. **Sama päivä, vielä myöhemmin — Vinkit ohjeet-tauluun:** Asetusten 9 kovakoodattua vinkkiriviä (aiemmin suoraan `index.html`:ssä) siirretty uuteen `ohjeet`-tauluun (`sql/035_ohjeet_vinkit.sql`), `lataaVinkit()` piirtää ne `sort_order`-järjestyksessä Asetusten avautuessa — uuden vinkin voi nyt lisätä Table Editorista ilman koodimuutosta. Samalla lisätty UUSI 10. vinkki: tarkista iPhonen oletuskalenteri on Perhekalenteri, muuten pikalisäykset karkaavat Sataman ulottumattomiin (löydös joka selitti Juhan "satunnaisesti toimivan" kalenterijaon). Tämä on SAMA `ohjeet`-taulu jonka Ohjebanneri-suunnitelma jo ennakoi — laajennetaan myöhemmin `section_key`/`title`-sarakkeilla, ei rakenneta rinnakkaista taulua. "Missä muokataan mitäkin" -alilista (5 riviä) jätetty tietoisesti staattiseksi, pyyntö koski vain päävinkkejä. Ks. Asetukset- ja "Ohjebanneri-järjestelmä"-osiot. **EI TESTATTU.** `sw.js` v47. **Sama päivä, vielä myöhemmin — Varaston "Luo kopio":** listan asetuksiin uusi nappi (`#copy-list-btn`) joka monistaa listan rivit+väliotsikot uudeksi itsenäiseksi listaksi samaan kategoriaan, täpät/ostoajat nollattuina, nimi kysytään `prompt()`:illa ehdotuksella "{nimi} (kopio)". Ei uutta taulua, käyttää samaa `lists`/`tuotteet`-rakennetta kuin muukin. Käyttötapaus: juhla-/kausipohjat (synttärit, joulu) pysyvät Varastossa koskemattomina, kopiosta tulee sen kerran elävä versio. Ks. "Varasto"-osio. **EI TESTATTU.** `sw.js` v48. **Sama päivä, vielä myöhemmin — Ruoka-välivaihe:** listan sisään uusi valintatila (☑-nappi otsikkorivillä, EI pitkä painallus koska se on jo varattu raahaukselle) jolla useita rivejä voi kerralla kopioida Kauppalistalle — käyttötapaus reseptilista Varastossa → puuttuvat ainekset kauppalistalle. Kopioi (ei siirrä/poista alkuperäisestä), sama periaate kuin "Luo kopio". Ei uutta taulua/migraatiota. Ks. "Ruoka-välivaihe"-osio. **EI TESTATTU.** `sw.js` v49. **Sama päivä, vielä myöhemmin — Testipäivä-lista Satamaan:** Katri kirjoitti torstain 16.7. testauslistan suoraan SQL-luonnoksena (aiemmin kysytty "erillinen kahden puhelimen testilista-tiedosto" OLI itse asiassa tämä). Luonnos käytti vääriä taulu-/sarakenimiä (`list_items`+`done`, ei ole olemassa — oikeat ovat `tuotteet`+`tehty`) ja väärää `lists.type`-arvoa (`'muistilaput'` pitää olla `'checklist'`, Muistilaput/Varasto-ero tulee `category`-sarakkeesta) — korjattu skeemaa vasten ja numeroitu `sql/036_testipaiva_lista.sql`:ksi, lisätty myös puuttuva `events`-taulun siivous idempotenssin FK-turvallisuuteen (sama 3-taulun poistojärjestys kuin `poistaLista()`:ssa). Lista elää nyt Satamassa itsessään (jaettu Muistilaput-lista "Testipäivä to 16.7.") — PALUU.md viittaa siihen sen sijaan että toistaisi sisällön. Samassa pyynnössä pyydettiin täyttämään myös kahden tyhjän pakkauslistan (Telttaretki, Viikkopakkaus) rivit — **EI TEHTY, viitatut lähdetiedostot (`telttaretken_pakkauslista.sql`/`viikon_pakkauslista.sql`) eivät löytyneet tästä repositoriosta eikä koneelta**, odottaa Katrin antamaa rivisisältöä, ks. PALUU.md "Pakkauslistat — odottaa sisältöä". **Sama päivä, vielä myöhemmin — pakkauslistojen sisältö saatiin:** Katri löysi alkuperäiset luonnokset Claude-keskustelusta ja liitti rivit suoraan. Kirjoitettu `sql/037_telttaretki_pakkauslista_sisalto.sql` (93 riviä, 6 väliotsikkoa) ja `sql/038_viikkopakkaus_sisalto.sql` (38 riviä) — molemmat idempotentteja "täytä vain jos tyhjä" -periaatteella (EI korvaa/poista, toisin kuin sql/036:n "poista ja luo puhtaana" -malli, koska tässä nimenomaan haluttiin säilyttää mahdolliset käsin tehdyt lisäykset). Huomattu ja kirjattu nimiepäsuhta: sql/038:n kohdeotsikoksi annettiin "Viikon pakkauslista leirikeskukseen", mutta tietokannan listan nimi on yhä "Viikon reissun pakkauslista" — migraatio hakee listan nykyisellä nimellä, nimenvaihto jätetty Katrin päätettäväksi (ei tehty automaattisesti). **EI TESTATTU/AJETTU vielä.** **Sama päivä, vielä myöhemmin — Bugi 1: listan poisto ei toiminut, juurisyy löydetty:** Katri raportoi ettei "jäätelökakku"-listan (Muistilaput) poisto tehnyt mitään, TOISTETTAVASTI (ei kertaluontoinen). Tutkittu `poistaLista()`-ketju päästä päähän: `events`-taululta puuttui delete-RLS-policy KOKONAAN (vain select+insert oli koskaan lisätty) — poisto suodatti hiljaa 0 riviä, minkä jälkeen `lists`-rivin poisto kaatui FK-rajoitteeseen, ja tämä virhe päätyi vain konsoliin, ei koskaan käyttäjälle. Sama bugi oli itse asiassa jo kerran "korjattu" 2026-07-06 (oikea poistojärjestys koodissa) mutta REGRESSOITUI HILJAA kun RLS otettiin käyttöön myöhemmin samana päivänä ilman events-delete-policya. Korjattu kahdessa osassa: `sql/039_events_delete_policy.sql` (puuttuva policy) + `poistaLista()` pysähtyy nyt AINA näkyvään suomenkieliseen virheeseen jos jokin vaihe epäonnistuu, eikä koskaan enää jatka/nielaise hiljaa. Yksittäisen rivin poisto (`poistaTuote()`) EI kärsinyt tästä — eri koodipolku, ei koske events-tauluun. Ks. "Bugikorjaus: Listan poisto ei toiminut" -osio. **EI TESTATTU.** `sw.js` v50. **Sama päivä, vielä myöhemmin — bugipaketti kolmesta arkikäytön löydöksestä:** (1) Laituri-pallura ei sammunut — laskettiin "sijoittamatta"-tilan mukaan, korjattu "nähty"-pohjaiseksi per-käyttäjä-aikaleimalla (`sql/040_laituri_nahty.sql`), Kalenteri-laatta pysyy reagointi-pohjaisena ennallaan. Palluran väri (raportoitu punaisena) tutkittu perin pohjin — koodi on ja on aina ollut kulta/`--accent`, ei löytynyt korjattavaa, todennäköisin selitys laitteen vanhentunut PWA-välimuisti. (2) Pitkä rivin nimi työnsi ×-napin ruudun ulkopuolelle KAIKISSA rivityypeissä (listat/kalenteri/hytti, sama `.list li`-rakenne) — klassinen flexbox min-width:auto-ansa, korjattu `min-width:0`+ellipsis-katkaisulla, tarkistettu visuaalisesti Playwrightilla. Laituri ei tarvinnut korjausta (oli jo oikein rakennettu). Ks. "Bugikorjaus: Laituri-pallura" ja "Bugikorjaus: pitkän rivin ×-nappi" -osiot. **EI TESTATTU.** `sw.js` v51. **Sama päivä, vielä myöhemmin — kaksi pysyvää käytäntöä kirjattu:** (1) **"Löydetyt bugit ja opit"** -osio lisätty (ks. oma osionsa yllä) — jokainen löydetty bugi kirjataan tästä eteenpäin sinne AINA, vaikka korjattaisiin heti, ettei korjattu bugi näytä siltä ettei sitä koskaan ollut. Kirjattu takautuvasti tämän viikon kolmikko (listan poisto, Laituri-pallura, ×-napin karkaus) + kaksi yleistettyä oppia. (2) **Uusi koodi kirjoitetaan englanniksi** (funktioiden/muuttujien nimet + kommentit) — ei massauudelleennimeämistä olemassa olevalle, käyttäjälle näkyvät tekstit pysyvät AINA suomeksi, tietokannan skeeman nimet pysyvät suomeksi. Kirjattu talon säännöksi COPILOT.md:hen, perusteluna paitsi tekoälytyökalut myös se että repo on julkisessa GitHub-palvelussa ja englanti tekee koodista autettavaa kenelle tahansa. **Ensimmäinen soveltaminen:** juuri korjattu `poistaLista()` nimettiin `deleteList()`:ksi (koodi oli jo kertaalleen uudelleenkirjoitettu tässä samassa työssä, joten rename oli sääntöjen mukainen — ei erillinen, perusteeton nimenmuutos). Pelkkä nimi+kommentit+lokaalit muuttujat, ei behaviorimuutosta — diff tarkistettu rivi riviltä puhtaaksi nimenvaihdoksi ennen committia. `sw.js` v52. **Sama päivä, vielä myöhemmin — konseptikirjattu Vilkaisuarvo:** koko Satamaa koskeva design-periaate ("onnistumisen mittari on tapahtuiko elämä, ei käytettiinkö appia") kirjattu omaksi osiokseen dokumentin alkuun, Katrin kiteytyksellä ("lapsi on käyty hammaslääkärissä ehkä juuri siksi että se pallura oli siellä — vaikken painanut mitään"). Huomiopallurat todettu tämän periaatteen konkreettisimmaksi nykyiseksi toteutumaksi, ristiviitattu. Ei koodimuutoksia, pelkkä konsepti. **Sama päivä, vielä myöhemmin — konseptikirjattu Maksimiautomaatio, minimikustannus:** toinen koko Satamaa (erityisesti automaatiota ja äly-putkea) koskeva design-periaate kirjattu omaksi osiokseen Vilkaisuarvon viereen: kaikki mikä voi tapahtua automaattisesti tapahtuu automaattisesti, mutta halvimmalla toimivalla tavalla. Neljä käytännön sääntöä (äly vain kun logiikka ei riitä, kutsut erissä tapahtumista ei silmukassa, halvin riittävä malli `ALY_MALLI`:n kautta, usage-lokitus aina näkyvissä) + Copilot-ajan suunnittelukysymys jokaiselle uudelle älyominaisuudelle. Ristiviitattu Äly-putki-osioon (sisarperiaate "ÄLY EHDOTTAA IHMINEN KUITTAA":lle — tämä koskee KUINKA USEIN kutsutaan, tuo periaate koskee MITÄ äly saa tehdä) ja lisätty COPILOT.md:hen. Ei koodimuutoksia, pelkkä konsepti.
- **2026-07-15 — E3-keskiporras V1 "Äly toimii, ihminen valvoo":** rakennettu kokonaisuudessaan keskiviikkoillan määräaikaan mennessä (torstai 16.7. on VAIHE 2:n testipäivä, ei vastaanota keskeneräistä). Yöllinen äly-haku (`api/aly-nightly.js`, uusi endpoint, kutsutaan samasta 5 min -ajastimesta kuin muistutukset mutta tekee itse työtä vain ~20h välein) käy läpi käyttäjän sijoittamattomat Laiturin murut ja kysyy äly-putkelta ERÄSSÄ (yksi kutsu per käyttäjä per yö) viittaako mikään niistä tähän päivään/huomiseen kellonajan kanssa — epävarma = ei osumaa. Osumat → ankkuriehdokkaat (`ankkurit.is_candidate=true`, `source='aly'`, uusi sarake `sql/041`), ✨-merkillä etusivun ankkurien alla, EI "3 tärkeintä" -rajan sisällä — kolme reaktiota (täppää/ota omaksi/poista). **Turvainvariantti joka ohjasi kaikkea:** äly VAIN LISÄÄ, ei koskaan muokkaa/poista Laiturin murua — tekee "Kumoa"-napista aina turvallisen. Uusi "Mitä äly on tehnyt" -loki Asetuksiin (`aly_log`, `sql/042`) jokaiselle ehdotukselle, [Kumoa]-nappi poistaa ankkuririvin (missä tahansa tilassa) + merkitsee `undone_at` — rivit eivät koskaan katoa lokista. `aly_evaluated`-taulu (`sql/042`, ei RLS-policyja, vain service_role) estää saman "ei osumaa" -murun kysymisen joka yö uudelleen, MUTTA murut jotka tuottivat ehdokkaan eivät päädy sinne — jos ehdotus puretaan, muru vapautuu uudelleenarvioitavaksi. Asetukset-laatta sai uuden huomiopalluran (`aly_log_seen`, `sql/043`, sama "nähty"-aikaleimamalli kuin Laiturilla) — ensimmäinen laajennus `huomioPallurat`-karttaan. `aly_yoajo`-kytkin (`asetukset`-taulu, 'on'/'off') sammuttaa yöajon ilman koodimuutosta, ei UI:ta sille (Table Editor -hallinnoitu, tietoinen rajaus). Kaikki uusi koodi/skeema englanniksi (talon sääntö), käyttöliittymäteksti suomeksi. **Huomautus:** Katri viittasi speksiin "aiemmin tänään kirjattuna", mutta sitä ei löytynyt mistään tässä tiedostossa — kirjattu nyt kokonaisuudessaan Katrin viestistä, ks. "E3-keskiporras V1" -osio täydelle kuvaukselle. Ei koskettu odottavaan pakettiin (ristiriitalippu, ankkurilähetys). Tarkistettu visuaalisesti Playwrightilla (etusivun ehdokasrivi + Asetusten loki, molemmat teemat) ennen committia. **EI TESTATTU vielä oikealla laitteella/datalla** — ks. PALUU.md OSA O, testataan torstaina VIIMEISENÄ. `sw.js` v53.

---

## Löydetyt bugit ja opit (pysyvä käytäntö, kirjattu 2026-07-13)

**Käytäntö tästä eteenpäin:** JOKAINEN löydetty bugi kirjataan tähän osioon, VAIKKA se korjattaisiin välittömästi — mikä oireili, mikä oli juurisyy, miten korjattiin (migraationumero ja/tai commit), ja mitä opittiin JOS kuvio on yleistettävä muualle koodikantaan. Korjattu bugi ei saa näyttää siltä ettei sitä koskaan ollut — historia on diagnoosityökalu, ja Copilot-ajalle tämä tiedosto on ainoa muisti joka on olemassa. Ei riitä että korjaus näkyy vain Muutoslokin ohimenevänä mainintana tai commit-viestissä — tämä osio on pysyvä, hakukelpoinen paikka jota tarkistaa ENSIN kun jokin näyttää tutulta.

### Yleistetyt opit (koskee koko koodikantaa, ei vain yksittäistä bugia)

- **"Hiljaa epäonnistuminen on AINA oma buginsa oireen rinnalla."** Kun jokin toiminto "ei tee mitään" ilman virhettä, siinä on KAKSI korjattavaa asiaa, ei yhtä: (1) miksi se ei toiminut, JA (2) miksi käyttäjä ei saanut tietää siitä. Pelkkä (1):n korjaaminen ei riitä — jos (2) jää korjaamatta, seuraava samankaltainen vika toistaa saman "ei tapahdu mitään, ei tiedä miksi" -kokemuksen jostain muusta syystä.
- **"RLS-käyttöönotossa tarkista KAIKKI NELJÄ policya (select/insert/update/delete) joka taululle."** Ei riitä tarkistaa mitä sovellus JUURI NYT tekee kyseiselle taululle — `events`-taulu tarvitsi vain select+insertin kun RLS ensin kytkettiin, mutta myöhemmin lisätty poisto-ominaisuus (listan poisto) tarvitsi myös deletea, eikä kukaan huomannut puutetta ennen kuin se rikkoi jotain kuukausia myöhemmin. Kun RLS otetaan käyttöön tai taulu saa RLS:n, käy läpi kaikki neljä operaatiota eksplisiittisesti, älä oleta.

### Bugi 1 — Listan poisto ei toiminut (löydetty/korjattu 2026-07-13)

**Oire:** "Poista lista" -vahvistusdialogi kysyi, käyttäjä hyväksyi, mitään ei tapahtunut — EI virheilmoitusta. Toistettava sekä vanhalla käsin luodulla listalla ("jäätelökakku") että juuri luodulla tuoreella ("mansikkahillo"), eli ei sidottu listan ikään. Yksittäisen rivin poisto toimi normaalisti — vika oli rajattu nimenomaan koko listan poistoon.

**Juurisyy:** `events`-taululla oli RLS päällä mutta EI KOSKAAN delete-policya (vain select+insert). `deleteList()` (tuolloin vielä `poistaLista()`, ks. alla nimenvaihto) poisti oikeassa FK-turvallisessa järjestyksessä (tuotteet → events → lists), mutta events-poisto suodatti hiljaa 0 riviä RLS:n takia (ei virhettä — politiikan puuttuminen tarkoittaa "ei näkyviä rivejä sille komennolle"). Seuraava `lists`-rivin poisto kaatui FK-rajoitteeseen, ja tämä TODELLINEN virhe päätyi vain `console.error`:iin, ei koskaan käyttäjälle asti. Historiallinen kerros: sama bugi "korjattiin" jo 2026-07-06 oikealla poistojärjestyksellä, mutta RLS:n käyttöönotto samana päivänä REGRESSOI sen hiljaa ilman että kukaan huomasi kuukausiin.

**Korjaus:** `sql/039_events_delete_policy.sql` (lisää puuttuva policy) + commit `11908e5` (funktio pysähtyy nyt aina näkyvään suomenkieliseen virheeseen jos jokin vaihe epäonnistuu, ei koskaan jatka/nielaise hiljaa; onnistunut poisto vahvistaa myös oman toastinsa). **Nimetty samana päivänä myöhemmin `poistaLista()`:stä `deleteList()`:ksi** englanninkielisen koodikäytännön ensimmäisenä sovelluksena (ks. "Koodikieli"-osio COPILOT.md:ssä) — pelkkä nimi+kommentit, ei behaviorimuutosta.

**Opittu:** ks. molemmat yleistetyt opit yllä — tämä bugi on niiden alkuperäinen esimerkkitapaus.

### Bugi 2 — Laituri-pallura: väri + väärä "uusi"-määritelmä (löydetty/korjattu 2026-07-13)

**Oire (kaksiosainen):** (a) pallura raportoitu punaisena kotiruudukossa (rikkoisi merkkikieltä: pallurat aina kulta, punainen varattu mahdottomalle). (b) Pallura ei koskaan sammunut pysyvästi — pari päivää vanha, jo kertaalleen nähty mutta yhä sijoittamaton Laituri-rivi sytytti palluran uudelleen JOKA Etusivun avauksella.

**Juurisyy:** (a) EI löytynyt koodivikaa — `.tile-badge`-luokka on käyttänyt kultaa (`--accent`) siitä lähtien kun se luotiin (2026-07-07), koko git-historia tarkistettu `git log -S`:llä, ei yhtään punaista versiota koskaan. Todennäköisin selitys: laitteen vanhentunut PWA-välimuisti. (b) Pallura laski "sijoittamatta"-tilaa (`status='uusi'`) "nähty"-tilan sijaan — ristiriidassa Laiturin oman periaatteen kanssa ("asiat odottavat häpeättä ja hälyttä": sijoittamattomuus ei ole hälytettävä tila, vain näkemättä jääminen on).

**Korjaus:** (a) ei koodimuutosta — ei ollut mitään korjattavaa, kirjattu tähän siltä varalta että sama raportti toistuu. (b) `sql/040_laituri_nahty.sql` (per-käyttäjä "viimeksi avattu" -aikaleima, tietokantarivi EI localStorage — kevyin KESTÄVÄ vaihtoehto, säilyy PWA:n uudelleenasennuksen yli) + commit `3302726` (`paivitaLaituriBadge()` laskee nyt `created_at > oma_viimeksi_avattu`, riippumatta rivin `status`:sta; Kalenteri-laatta pysyy ennallaan reagointi-pohjaisena, koska sille se ON oikea malli).

**Opittu:** "Reagointi" ja "nähty" ovat kaksi ERI semantiikkaa huomiomerkinnälle, eivätkä ne ole vaihtokelpoisia — kumpi on oikea riippuu siitä onko kyseessä aidosti KESKEN OLEVA asia (kuittaamaton kalenteritapahtuma, reagointi on oikea malli) vai VAPAAEHTOINEN, ei-kiireellinen asia (Laiturin muistilappu, jonka voi tietoisesti jättää odottamaan — nähty on oikea malli). Kun rakennat uuden huomiomerkinnän, kysy ensin kumpi tämä on.

### Bugi 3 — Pitkän rivin ×-nappi karkasi ruudun ulkopuolelle (löydetty/korjattu 2026-07-13)

**Oire:** pitkä rivin nimi (tuote, kalenteritapahtuma, hytin tehtävä) työnsi toimintonapit (×, ⚓, ⏰) ruudun oikean reunan ulkopuolelle — piti rullata riviä sivulle päästäkseen niihin käsiksi. Toistui kaikissa `.list li`-rakennetta käyttävissä näkymissä (Muistilaput/Varasto/Kauppalista, Kalenteri, Hytti).

**Juurisyy:** klassinen flexbox-ansa: `.list li span`:lla oli `flex: 1` mutta ei koskaan `min-width: 0`. Flex-lapsen oletus `min-width: auto` estää sitä koskaan kutistumasta sisältönsä (pisimmän katkeamattoman sanan) leveyttä pienemmäksi — pitkä nimi pakotti koko rivin, ja siis myös sen jälkeiset napit, näytön leveyttä leveämmäksi.

**Korjaus:** commit `3302726` (`style.css`: `min-width:0` + yksirivinen ellipsis-katkaisu `.list li span`:iin, rajattu `:not()`-poissuluilla kiinteän levyisiltä metatiedoilta kuten kellonaika/eräpäivä/väripallo). Ei migraatiota (pelkkä CSS). Laituri ei tarvinnut korjausta — `.laituri-content`/`.laituri-text` oli rakennettu `min-width:0` + `word-break:break-word` -periaatteella jo alusta asti.

**Opittu:** flex-lapsen `min-width: auto` -oletus on yleinen, helposti unohtuva ansa aina kun rivi yhdistää kasvavan tekstin (`flex:1`) JA kiinteän levyisiä nappeja/merkintöjä samassa flex-rivissä. Jos rakennat UUDEN rivityypin (uusi näkymä, uusi lista) joka noudattaa tätä kaavaa, tarkista `min-width:0` kasvavalta tekstielementiltä heti alusta, älä odota että pitkä syöte paljastaa puutteen myöhemmin.

---

## Sanasto — Saman omat käsitteet

Näitä nimiä käytetään ympäri tätä tiedostoa ilman että niitä aina selitetään uudelleen — jos joku (Copilot mukaan lukien) törmää johonkin näistä ensimmäistä kertaa, tästä löytyy nopea selitys. Tarkempi kuvaus löytyy aina omasta osiostaan.

- **Satama** — koko projektin lopullinen nimi/visio: perheen toiminnanohjaussovellus. Tämä repo (`kauppalista`) on sen **vaihe 1 (E1)**.
- **Vilkaisuarvo** — koko Satamaa koskeva design-periaate: onnistumisen mittari on tapahtuiko elämä, ei käytettiinkö appia. Jokainen pinta antaa arvonsa yhdellä vilkaisulla ilman napautuksia, kuittaus on kirjanpitoa ei edellytys. Ks. dokumentin alun oma osio.
- **Maksimiautomaatio, minimikustannus** — design-periaate kaikelle automaatiolle ja äly-putkelle: kaikki mikä voi tapahtua automaattisesti tapahtuu automaattisesti, mutta halvimmalla toimivalla tavalla (äly vain kun logiikka ei riitä, kutsut erissä ei silmukassa, halvin riittävä malli, kustannus aina näkyvissä). Ks. dokumentin alun oma osio.
- **Muistilaput** — käyttäjän omat/jaetut tekstilistat (entinen "Listat"), esim. Kauppalista. Oma näkymänsä, ei enää suoraan etusivulla.
- **Varasto** — samat kuin Muistilaput teknisesti, mutta harvemmin tarvittavat listat (esim. pakkauslistat). Listan voi siirtää näiden kahden välillä.
- **Laituri** — yhteinen "keskeneräisten ajatusten" muistilista, aina näkyvissä molemmille perheenjäsenille.
- **Ankkurit** — etusivun "tämän päivän 3 tärkeintä" -lohko. Rivit voivat tulla käsin kirjoitettuna, Muistilapuilta tai Kalenterista ⚓-napilla nostettuna.
- **Horisontissa** — etusivun lohko "asioille jotka alkavat kaivata huomiota" (esim. milloin joku kotityö viimeksi tehty). Ei vielä toiminnallinen, vain paikkavaraus — täysi suunnitelma ks. "Horisontti — suunnitelma" -osio.
- **Nosto/Nostot** — yksittäinen toistuva kotihomma (esim. "imuroi", "pakastimen sulatus") jonka rytmiä Horisontti seuraa; myös tulevan Satama-vaiheen "Nostot" (kodin huoltokirja) nimi — sama data, kaksi eri käyttöliittymää.
- **Kalenterisyöte** — yksi ulkoinen kalenteri (esim. yksi iCloud-kalenteri tai yksi julkaistu .ics-linkki) jonka Satama lukee sisään. Jokainen syöte on yksi rivi `kalenteri_syotteet`-taulussa, ks. "Kalenterisyötteet"-osio.
- **Kuittausjono / kuittaus** — "yksi totuus, kaksi ikkunaa" -periaatteen mekanismi (ks. oma osio): toisen käyttäjän lisäämä kalenteritapahtuma näkyy AINA agendassa, mutta saa "uusi"-merkinnän kunnes se kuitataan. Kuittaus = "nähty", EI hyväksyntä eikä koskaan poista tapahtumaa — eri asia kuin vanha (käytöstä poistunut) hyväksyntäjono.
- **Kuormavahti** — automaattinen neutraali (meripihka) merkki päivälle jolla on paljon kellonaikaan sidottuja tapahtumia (raja säädettävissä Asetuksista, `asetukset`-taulun `paivan_menoraja`), ks. oma osio.
- **Ristiriitamerkki / päällekkäisyysmerkki** — punainen merkki kun kaksi kellonaikaan sidottua tapahtumaa menee päällekkäin samana päivänä. Ainoa merkki jolla on lupa käyttää punaista (ks. "Kalenterin merkkikieli"), koulupäivien klo 9-15 kalentereiden VÄLISET päällekkäisyydet on rauhoitettu (ei sytytä). Ks. oma osio.
- **Kalenterin merkkikieli** — design-periaate: kulta=neutraali tieto, meripihka=huomaa tämä, punainen=mahdotonta/vaatii reaktion (vain päällekkäisyysmerkki). Ks. oma osio.
- **E1** — lyhenne "Etapista 1" eli tästä ensimmäisestä rakennusvaiheesta (Listat/Muistilaput-keskeinen), määräaika 23.7.2026.
- **Oma Hytti** — henkilökohtainen, TÄYSIN yksityinen työtila (casekortit + automaattinen tehtäväkooste). Toteutettu 2026-07-08, laajennettu opiskelukalenterilla 2026-07-11, ks. "Oma Hytti"- ja "Hytti v1 + opiskelulaajennus + ICS-syötekoneisto" -osiot.
- **scope (kalenteri_syotteet)** — `'perhe'` (oletus, näkyy kaikille) tai `'hytti'` (näkyy VAIN omistajan omassa Hytissä, ei koskaan perheen agendassa/kuittausjonossa/Kuormavahdissa eikä toiselle käyttäjälle — suojattu myös RLS:llä, ei vain käyttöliittymässä). Ks. "Hytti v1 + opiskelulaajennus + ICS-syötekoneisto" -osio.
- **hytti_omistajat** — kevyt henkilo→user_id-kartta jota `kalenteri_tapahtumat`-taulun RLS-policy käyttää päättämään kenen Hyttiin `scope='hytti'`-rivi kuuluu. Ks. sama osio.
- **Nostot, Odottaa** — muiden tulevien Satama-vaiheiden nimiä, EI vielä rakennettu mitään näistä, ks. "Satama 2.0 — seuraavat vaiheet" -osio.
- **Ohjebanneri** — suunniteltu (ei toteutettu) osioiden sisäänrakennettu ohjeteksti-mekanismi, kuittaus tietokantaan, sama sisältö aina myös Asetuksista löydettävissä. Täysi suunnitelma ks. "Ohjebanneri-järjestelmä" -osio.
- **VAPID-avaimet** — web push -ilmoitusten vaatima avainpari (julkinen avain koodissa, yksityinen Vercelin ympäristömuuttujissa), todistaa push-palvelulle että viesti tulee oikealta lähettäjältä. Ks. "Push-ilmoitukset" -osio.
- **Muistutukset** — henkilökohtainen ajastettu push-ilmoitus listan riville/kalenteritapahtumalle/ankkurille, ⏰-napista asetettuna. Ks. oma osio.
- **Äly-putki** — `api/aly.js`, todistettu kerros joka kutsuu Claude API:a. Periaate: "äly ehdottaa, ihminen kuittaa". Ks. oma osio ja COPILOT.md.
- **Laituri-avustaja** — ✨-nappi Laiturin rivillä, ensimmäinen oikea äly-putken päälle rakennettu ominaisuus. Ehdottaa mihin muru kuuluisi, ei koskaan siirrä mitään ilman kuittausta. Ks. oma osio.
- **Huomiopallurat** — etusivun laattojen numeropallurat, näyttävät VAIN käyttäjän reaktiota odottavia asioita (ei kaikkea uutta). Ks. oma osio.
- **Ruoka-välivaihe** — listan sisäinen valintatila jolla useita rivejä voi kopioida kerralla Kauppalistalle (esim. reseptilistalta puuttuvat ainekset). Ks. oma osio.
- **E3-keskiporras** — Satama 2.0:n Tehtävät-vaiheen kolmas taso ("äly toimii, ihminen valvoo"): yöllinen äly-haku ehdottaa ankkuriehdokkaita Laiturin muruista, ei koskaan kirjoita/muokkaa mitään käyttäjän omaa suoraan. Ks. "E3-keskiporras V1" -osio.
- **Ankkuriehdokas** — E3-keskiportaan äly-ehdottama ankkuri (`ankkurit.is_candidate=true`, `source='aly'`), ✨-merkillä etusivulla normaalien ankkurien alla, EI "3 tärkeintä" -rajan sisällä. Kolme reaktiota: täppää/ota omaksi/poista.
- **Kolme opasdokumenttia, kolme eri roolia:** `muistiinpanot.md` (tämä tiedosto — projektin narratiivi, päätökset, "miksi") / `COPILOT.md` (tekninen "miten lisään uutta" -jatko-opas) / `PALUU.md` (kertaluontoiset käsintehtävät migraatiot+testit tulevalle palaamiselle) / `BACKUP.md` (varmuuskopiointi- ja palautusohje). Jos et tiedä kumpaan jotain kirjoitetaan, ks. kunkin tiedoston oma yläkommentti.

---

## Tekninen kokonaisuus

- **Frontend:** Vanilla HTML/CSS/JS (ei frameworkia), PWA
- **Tietokanta:** Supabase (PostgreSQL), taulukko `tuotteet`
- **Hosting:** Vercel (staattiset tiedostot + serverless funktio)
- **Reaaliaikaisuus:** Supabase Realtime (postgres_changes)
- **Auth:** Supabase Auth, Google OAuth (lisätty 2025-07-06)
- **Git:** GitHub, `git config user.email = ylijaakkolak@gmail.com`

---

## Varmuuskopiot (2026-07-11)

Koko perheen data oli yhdessä Supabase-projektissa ilman minkäänlaista palautussuunnitelmaa — korjattu. Täysi ohje on **BACKUP.md**-tiedostossa (kertaluontoinen `pg_dump`-työkalujen asennus, mistä yhteysosoite löytyy, itse komento, palautusohje askel askeleelta) — tässä vain tekniset perustelut.

**Menetelmä: `pg_dump`/`psql`, EI itse kirjoitettu JSON-vientiskripti.** Harkittiin myös vaihtoehtoa jossa jokainen taulu haetaan Supabasen REST-rajapinnasta ja tallennetaan JSON-tiedostoiksi — hylätty, koska siinä on todellinen tekninen ansa: kaikki tämän appin taulut käyttävät `generated always as identity` -sarakkeita (`id`), ja Postgres KIELTÄYTYY hyväksymästä eksplisiittistä `id`-arvoa tällaiseen sarakkeeseen tavallisella INSERTillä (vaatisi `OVERRIDING SYSTEM VALUE`, jota PostgRESTin normaali insert ei lähetä). Käytännössä tämä tarkoittaa: JSON-vienti olisi helppo tehdä, mutta JSON-**palautus** joko (a) epäonnistuisi id-sarakkeisiin kokonaan, tai (b) antaisi kaikille riveille UUDET id:t palautuksessa, jolloin kaikki viittaussuhteet (esim. `tuotteet.list_id` → `lists.id`) hajoaisivat hiljaa ilman FK-uudelleenkirjoitusta. `pg_dump`/`psql` ei kärsi tästä — se on Postgresin oma, vuosikymmeniä testattu työkalu joka käsittelee identity-sarakkeet, riippuvuusjärjestyksen ja sekvenssit automaattisesti oikein. **Tietoinen päätös valita järeämpi mutta OIKEIN toimiva ratkaisu sen sijaan että rakennettaisiin nopeampi mutta hienovaraisesti rikkinäinen.**

**`scripts/varmuuskopio.sh`** — yhden komennon wrapper `pg_dump`:lle. Vaatii `SUPABASE_DB_URL`-ympäristömuuttujan annettuna joka ajokerralla (EI tallenneta pysyvästi mihinkään tiedostoon — se on täyden pääsyn yhteysosoite tietokantaan, ohittaa RLS:n kokonaan, huomattavasti arkaluontoisempi kuin mikään tähän mennessä käytetty avain). Tallennuspaikka valitaan automaattisesti: jos koneella on iCloud Drive (`~/Library/Mobile Documents/com~apple~CloudDocs/`), kopio menee sinne — synkkautuu pilveen ITSESTÄÄN ilman erillistä siirtoa, koska Katri käyttää jo iCloudia (kalenteri). Muuten `~/Documents/Satama-varmuuskopiot/` paikallisesti, jolloin käyttäjän pitää itse siirtää kansio pilveen (ohjeistettu BACKUP.md:ssä) — kehityskone palautuu 23.7.2026, pelkkä paikallinen kopio EI riitä pitkällä tähtäimellä.

**Ajastus (GitHub Actions) EI rakennettu automaattiseksi tietoisesti**, vaikka sama tekniikka on jo käytössä Muistutusten cronille (`.github/workflows/muistutukset-cron.yml`) — tietokannan täysi yhteysosoite on niin paljon arkaluontoisempi salaisuus (täysi luku+kirjoitusoikeus ohi RLS:n) kuin `MUISTUTUKSET_CRON_SECRET`, että sen tallentaminen GitHub-secretiksi ansaitsee oman erillisen, tietoisen päätöksen käyttäjältä eikä pidä tulla hiljaisena oletuksena. BACKUP.md mainitsee vaihtoehdot (macOS `launchd` tai GitHub Actions) jos Katri joskus haluaa tämän automaattiseksi.

**`.gitignore`:** lisätty `Satama-varmuuskopiot/`, `varmuuskopiot/`, `*.sql.dump` — varmuuskopiot sisältävät oikeaa perheen dataa, eivät koskaan kuulu versionhallintaan.

**EI TESTATTU LAINKAAN vielä (skripti kirjoitettu, ei ajettu kertaakaan oikeasti)** — ks. PALUU.md OSA 0, ensimmäinen kopio pitää ottaa ennen kuin mitään muuta testataan tulevalla kerralla.

---

## Äly-putki (rakennettu 2026-07-11, TODISTETTU 2026-07-12 oikealla laitteella)

Todistettu putki puhelimesta Claude API:iin ja takaisin, jonka päälle jokainen tuleva älyominaisuus (Siri-tulkinta, jääkaappikuva) rakentuu — sama kaava kuin push-infrassa (ks. "Push-ilmoitukset"-osio): putki todistetaan ensin erikseen, ominaisuudet perässä. **"Testaa äly" vastasi järkevästi 2026-07-12** — putki toimii, `ANTHROPIC_API_KEY` on oikein Vercelissä. Ensimmäinen oikea ominaisuus (Laituri-avustaja) rakennettu heti perään, ks. oma osio alla. **Täysi tekninen kuvaus ja "miten lisään uuden ominaisuuden" -ohje on COPILOT.md:ssä** — tämä on uusi tiedosto nimenomaan tätä tarkoitusta varten (tekninen jatko-opas, eri asia kuin tämä narratiivinen muistiinpanot.md), lue sen oma yläkommentti erosta.

**`api/aly.js`:** `POST /api/aly`, `{prompt, max_tokens?}` sisään → `{text}` ulos. Kutsuu Anthropicin Messages API:a. **Pakollinen JWT-validointi** (`haeKayttajaId()`, sama kaava kuin `api/push-test.js`:ssä) — ilman kirjautumista 401, avoin endpoint polttaisi Anthropic-saldoa keneltä tahansa. Kustannussuoja: `max_tokens` oletus 500, kova katto 2000. Mallitunniste luetaan `ALY_MALLI`-ympäristömuuttujasta (oletus koodissa jos muuttujaa ei aseteta) — mallin vaihto on siis Vercel-kentän muutos, ei koodimuutos.

**Mallitunniste-huomautus:** Katrin ohjeen mukaan käytetty tunniste on `claude-sonnet-4-6` — tämä EI täsmää siihen mallilistaan joka oli tämän istunnon omassa järjestelmäkontekstissa (jossa uusin Sonnet oli nimetty `claude-sonnet-5`). Katri vahvisti eksplisiittisesti että `claude-sonnet-4-6` on oikea käypä tunniste ja että istunnon oma mallilista on vanhentunut — noudatettu Katrin ohjetta, mutta tehty tunnisteesta säädettävä (`ALY_MALLI`) juuri tämän epävarmuuden vuoksi, jotta virheellinen tunniste on yhden Vercel-kentän korjaus eikä koodimuutos. Jos "Testaa äly" -nappi palauttaa mallivirheen, tarkista ajantasainen mallilista docs.claude.com → Models ja aseta oikea tunniste `ALY_MALLI`-muuttujaan.

**PERIAATE (koskee KAIKKEA mitä äly-putken päälle rakennetaan jatkossa): ÄLY EHDOTTAA, IHMINEN KUITTAA.** Äly ei koskaan kirjoita dataa suoraan Supabaseen — jokainen älyn "tekemä" asia (luokittelu, tulkinta, ehdotus) näytetään käyttäjälle ensin, hyväksytään/muokataan/hylätään, ei koskaan automaattista tallennusta. Sama periaate kuin kuittausjonolla jo on kalenterisynkalle, ja sama kuin Loma-aikojen täytön Vaihe 2:lle oli jo aiemmin suunniteltu ("EI KIRJOITA suoraan ilman vahvistusta", ks. "Loma-aikojen täyttö" -osio).

**Toinen periaate, sisarperiaate edelliselle: MAKSIMIAUTOMAATIO, MINIMIKUSTANNUS** (ks. dokumentin alun oma osio) — koskee sitä KUINKA USEIN ja MILLÄ tavalla äly-putkea kutsutaan, ei mitä se saa tehdä. Ennen uuden älyominaisuuden rakentamista, kysy aina: "voiko tämän tehdä ilman älykutsua — ja jos ei, kuinka harvoin kutsu riittää?"

**Testinappi:** Asetukset → Sovellus → "Testaa äly" — lähettää kiinteän testipromptin ("Vastaa yhdellä lauseella suomeksi: mikä on hyvän sataman tärkein ominaisuus?"), näyttää vastauksen napin alla. Sama todistusrooli kuin push-testinapilla.

**Kevyt kustannusseuranta:** `console.log('[aly]', ...)` per kutsu (user_id, malli, input/output-tokenit) — luettavissa Vercelin Logs-välilehdeltä. EI omaa tietokantataulua vielä — olemassa oleva `events`-taulu on rakennettu listat/tuotteet-toiminnoille (action/target_type/target_id/list_id) eikä sopinut token-laskentaan ilman hankalaa kenttien uudelleenkäyttöä, joten valittiin yksinkertaisempi console.log tähän ensimmäiseen kerrokseen.

**Alkuperäinen "ei tähän kerrokseen" -rajaus (2026-07-11):** ei yhtään oikeaa älyominaisuutta, ei prompteja datalle, ei kuvatukea. **Ensimmäinen näistä (Laituri-avustaja) rakennettu 2026-07-12** heti kun putki oli todistettu, ks. oma osio alla — kuvatuki ja muut ominaisuudet ovat yhä avoinna.

**TESTATTU 2026-07-12** — ks. PALUU.md OSA F (todistettu, merkitty tehdyksi).

**Turvahuomio (2026-07-12/13):** ensimmäinen `ANTHROPIC_API_KEY` vuoti vahingossa chattiin käyttöönoton yhteydessä — KIERRÄTETTY HETI Anthropic Consolessa (vanha avain kumottu, uusi generoitu ja päivitetty Verceliin). Ei tiedossa olevaa väärinkäyttöä, mutta muistutus talteen: **tarkista Anthropic Consolen (console.anthropic.com → API Keys) avainlista 21.–22.7.2026 rauhoitusjakson yhteydessä** — ei pitäisi olla ylimääräisiä/tuntemattomia avaimia, ja vanhan kumotun avaimen pitäisi näkyä poistettuna/pois käytöstä.

## Laituri-avustaja (2026-07-12, ensimmäinen oikea älyominaisuus)

Ensimmäinen ominaisuus rakennettu äly-putken päälle heti kun se oli todistettu — "tapa A" COPILOT.md:n mallin mukaan (sama `/api/aly`, uusi prompti). ✨-nappi Laiturin rivillä (näkyy vain sijoittamattomilla riveillä, `rivi.status !== 'sijoitettu'`, sama ehto kuin →-napilla).

**Toiminta (`pyydaLaituriEhdotus()`, script.js):**
1. Hakee käyttäjän näkyvissä olevien listojen (`lists`-taulu, Muistilaput + Varasto) nimet DYNAAMISESTI joka kutsulla — EI kovakoodattua listaa. Yhdistää kiinteät vaihtoehdot: "kalenteriin (päivämäärällinen asia)", "hytin kortille", "ei mikään näistä".
2. Lähettää promptin joka listaa nämä vaihtoehdot ja pyytää mallia vastaamaan VAIN JSON:na `{"ehdotus": "...", "perustelu": "..."}` (`max_tokens: 100`, muuten ei omaa mallia/parametrointia — `ALY_MALLI`-oletus).
3. **Jäsennys turvallisesti** (`jasennaAlyJSON()`): siivoaa mahdolliset ```-koodilohkoaidat ennen `JSON.parse()`:ia, `try/catch` — palauttaa `null` jos epäonnistuu, EI KAADU. Virhe tai epäonnistunut jäsennys → näyttää "Äly ei osannut tätä, kokeile myöhemmin" -viestin rivin alla.
4. **Ehdotus kuittikorttina** (`piirraLaituriEhdotusKortti()`): "→ <ehdotus> · <perustelu>" + [Sopii] [Ei] -napit, ilmestyy uutena `<li class="laituri-ehdotus-rivi">`-rivinä sijoittamattoman rivin alle (`insertAdjacentElement('afterend', ...)`- ei kortin pinoamista, vanha poistetaan ennen uuden piirtämistä).
5. **"Sopii" EI SIIRRÄ MITÄÄN AUTOMAATTISESTI** — avaa saman `sijoitaLaituriRivi()`-funktion jota →-nappikin käyttää (`prompt('Minne sijoitit tämän?', ehdotus)`), vain ehdotuksella esitäytettynä. Käyttäjä vahvistaa/muokkaa itse OK:lla — tämä on koko ominaisuuden tärkein toteutusyksityiskohta, koska se pitää periaatteen "äly ehdottaa, ihminen kuittaa" konkreettisesti totta: `/api/aly` EI KOSKAAN kosketa `laituri`-taulua, vain olemassa oleva manuaalinen toiminto tekee sen.
6. **"Ei"** poistaa kortin, ei tallenna mitään.
7. Kutsutaan VAIN ✨-napin painalluksesta — EI koskaan automaattisesti/eräajona kaikille riveille (ei yllätyskuluja).

**RAJAUS V1 (tietoinen, kirjattu):** ei suoraa siirtoa listalle/kortille (vain sijoitusdialogin esitäyttö), ei eräajoa kaikille riveille kerralla, ei oppimista aiemmista hyväksynnöistä/hylkäyksistä, ei omaa mallia/ALY_MALLI-muuttujaa tälle ominaisuudelle erikseen. Laajennetaan jos osoittautuu arjessa hyödylliseksi.

**EI TESTATTU VIELÄ** — ks. PALUU.md OSA G.

---

## Huomiopallurat (2026-07-13)

Etusivun laattojen numeropallurat (`.tile-badge`) uudistettu yhtenäisen periaatteen mukaan — irrotettu omaksi paketiksi Ankkurit-erottelun tapaan, koska ei riipu kesken olevista testeistä.

**Tämä on VILKAISUARVO-periaatteen (ks. dokumentin alku) konkreettisin nykyinen toteutuma** — pallura + iOS-kotinäytön kuvakenumero antavat koko tarvittavan tiedon ilman että appia tarvitsee avata.

**PERIAATE (kirjattu, ohjaa kaikkia tulevia palluralähteitä):** pallura näkyy VAIN asioista jotka odottavat käyttäjän REAKTIOTA — ei kaikesta uudesta. Aina palava pallura lakkaa merkitsemästä mitään. Jokainen uusi palluralähde perustellaan erikseen ennen lisäämistä, ei lisätä automaattisesti kaikelle uudelle datalle.

**V1-lähteet (`huomioPallurat`-tila, script.js, laajennettavissa per-laatta-funktioilla):**
- **Kalenteri-laatta** = kirjautuneen käyttäjän kuittaamattomat `uusi`-tilaiset tapahtumat — SAMA luku jonka kalenterinäkymän oma pallura jo näyttää (`paivitaKuittausTila()`, `kuittausjonoUudet.length`), ei kahta laskentaa samasta asiasta.
- **Laituri-laatta** = TOISEN käyttäjän lisäämät rivit joita EI OLE VIELÄ NÄHTY (ks. "Bugikorjaus: Laituri-pallura" alla — muutettu 2026-07-13, oli alunperin `status='uusi'`-pohjainen) — oma lisäys EI kerrytä omaa palluraa, koska ei tarvitse muistutusta omasta juuri kirjoittamastaan rivistä.
- Muille laatoille EI palluraa v1:ssä. Rakenne on tarkoituksella laajennettavissa: kun ristiriitalippu-ominaisuus rakennetaan, sen kesken-oleva-tila lisätään samaan `huomioPallurat`-karttaan, ei uutta rinnakkaista mekanismia.

**Reagointi ≠ nähty — VAIN Kalenteri-laatalle enää (Laiturille korjattu takaisin 2026-07-13, ks. alla):** Kalenteri-laatan pallura katoaa kun asiaan REAGOIDAAN (kuittaus), ei kun laatta/näkymä vain avataan — tämä pysyy ennallaan ja on oikea malli Kalenterille, koska "kuittaamaton tapahtuma" on aidosti kesken oleva asia joka VAATII kuittauksen jossain vaiheessa. **Laiturille sama "reagointi"-malli osoittautui vääräksi käytännössä** — ks. "Bugikorjaus: Laituri-pallura" alla, koska Laiturissa asian voi tietoisesti jättää sijoittamatta pitkäksikin aikaa ilman että se on "kesken oleva ongelma."

**Toteutus:**
- Laskenta ajetaan etusivun avauksessa (`lataaOsiot()` kutsuu `paivitaLaituriBadge()` + `paivitaKuittausTila()`) JA reaaliaikaisesti Supabase Realtimen kautta — pallura elää ilman sivun päivitystä, sama mekanismi kuin `tuotteet`-kanavalla. Kaksi uutta kanavaa (`laituri-pallura` taululle `laituri`, `kalenteri-pallura` tauluille `kalenteri_tapahtumat`+`kalenteri_kuittaukset`) kuuntelevat GLOBAALISTI (top-level tilaus), joten pallura päivittyy vaikka käyttäjä ei ole juuri sillä hetkellä Etusivulla.
- **Realtime vaatii Replication-julkaisun** näille kolmelle taululle — sama tunnettu vaatimus kuin `tuotteet`-taululla aikanaan (ks. Sanasto). Koska "lisää käsin dashboardista" ei ole enää hyväksytty asennusaskel (ks. Tiedostorakenne-osion LAAJENNUS-periaate), tämä on nyt migraationa: `sql/034_realtime_huomiopallurat.sql` (idempotentti, tarkistaa `pg_publication_tables`-näkymästä ennen `alter publication`-kutsua).
- Tyyli: pieni pyöreä pallura laatan kulmassa, `--accent` (kulta) tausta EI punainen — pallura on "odottaa sinua" -tieto, ei hälytys (sama merkkikieliperiaate kuin kalenterin ristiriitamerkeissä, ks. "Kalenterin merkkikieli"). Nolla = ei näytetä palluraa ollenkaan (ei "0"-tekstiä). CSS (`.tile-badge`) oli jo olemassa entuudestaan, ei muutoksia.

**BONUS: iOS-kotinäytön kuvakenumero** (`paivitaSovelluskuvakeBadge()`, Badging API, iOS 16.4+) — `navigator.setAppBadge(kalenteri+laituri-summa)` / `navigator.clearAppBadge()` kun summa on 0, feature-detect (`'setAppBadge' in navigator`) + try/catch niin että vanhemmilla alustoilla ei tapahdu mitään näkyvää. Kutsutaan aina kun jompikumpi pallura päivittyy (myös Realtime-tapahtumasta).
- **EI toteutettu: push-ilmoituksen saapuessa service workerissä (sw.js) päivittäminen taustalla.** Speksissä tämä oli tietoisesti pehmeä vaatimus ("jos kevyesti mahdollista"). Se ei ole kevyttä: sw.js:n push-käsittelijällä ei ole pääsyä käyttäjän Supabase-istuntoon/tokeniin eikä valmista kyselylogiikkaa — tarkan pallurasumman laskeminen siellä vaatisi joko istunnon tallentamista service workerin ulottuville tai koko laskentalogiikan kahdentamisen, molemmat oma pieni projektinsa. Jätetty tietoisesti rakentamatta, kirjattu tähän ettei unohdu jos joskus halutaan. Sovelluksen ollessa auki (selain/PWA-ikkuna) pallura ja kuvakenumero päivittyvät joka tapauksessa Realtime-kanavien kautta — tämä kattaa pääasiallisen käyttötapauksen.

**RAJAUS v1 (tietoinen):** ei ristiriitalippu-lähdettä vielä (lisätään kun se paketti rakennetaan), ei muita laattoja, ei asetusta palluran piilottamiseksi.

**EI TESTATTU VIELÄ** — ks. PALUU.md.

---

## Bugikorjaus: Laituri-pallura (kaksi löydöstä arkikäytöstä, 2026-07-13)

Katri raportoi kaksi ongelmaa Laituri-huomiopallurassa käytön aikana.

**(a) Väri — EI KOODIVIKA, tulos on epäselvä.** Katri raportoi palluran näkyvän PUNAISENA sekä Laituri- että Kalenteri-laatalla — rikkoisi merkkikieltä (pallurat AINA kulta/`--accent`, punainen `--vaara` varattu YKSINOMAAN päällekkäisyysmerkille). **Koodi tutkittu perin pohjin: `.tile-badge`-luokka (ainoa CSS-sääntö koko tiedostossa jonka nimessä on "badge") on käyttänyt `background: var(--accent)`:ia SIITÄ LÄHTIEN kun se luotiin (2026-07-07, ennen Huomiopalluroitakin) — `git log -S`-haku koko historiasta löytää vain YHDEN version tästä säännöstä, ei koskaan punaista.** Script.js:ssä ei myöskään aseteta badge-elementin väriä koskaan inline-tyylillä. En löytänyt yhtään koodipolkua, historiallista tai nykyistä, joka selittäisi punaisen. **Todennäköisin selitys: laitteen PWA-välimuisti on vanhentunut** (tarkista Asetukset → Sovellus → Versio molemmilla puhelimilla, ks. PALUU.md OSA 0) — EI tehty koodimuutosta tälle osalle, koska mitään rikki olevaa ei löytynyt korjattavaksi. Jos punainen näkyy edelleen version päivityksen jälkeenkin, tarvitaan kuvakaappaus tai selaimen "Inspect element" -tulos jatkotutkimukseen.

**(b) Ei sammu — TODELLINEN BUGI, korjattu.** Ensimmäinen Huomiopallurat-versio (ks. yllä) laski Laituri-palluran "reagointi"-periaatteella: pallura näkyi niin kauan kuin toisen käyttäjän rivi oli `status='uusi'` (sijoittamaton), riippumatta siitä oliko sitä jo NÄHTY. Käytännössä: Juhan pari päivää vanha muru sytytti Katrin palluran UUDELLEEN joka kerta kun Etusivu avattiin (esim. kotikuvakkeen poisto/uudelleenasennus, versiopäivitys) — vaikka Katri oli jo nähnyt sen useaan otteeseen eikä vain sattunut vielä sijoittamaan sitä. Tämä on ristiriidassa Laiturin oman filosofian kanssa: "asiat odottavat häpeättä ja hälyttä" — sijoittamattomuus EI ole hälytettävä tila, vain NÄKEMÄTTÄ jääminen on.

**Määrittely korjattu:** Laituri-laatan "uusi" = "en ole vielä NÄHNYT tätä", EI "ei ole vielä sijoitettu". Kalenteri-laatta pysyy ennallaan (reagointi-pohjainen, oikea malli sille — ks. yllä).

**Toteutus (`laituri_nahty`-taulu, `sql/040_laituri_nahty.sql`):** per-käyttäjä rivi (`user_id` primary key, `viimeksi_avattu` timestamptz), päivitetään upsertilla `merkitseLaituriNahdyksi()`:llä joka kerta kun Laituri avataan (`avaaOsio()`). **Valittu tietokantarivi laitekohtaisen `localStorage`:n sijaan — "kevyin KESTÄVÄ" vaihtoehto** (pyydetty eksplisiittisesti): säilyy PWA:n uudelleenasennuksen tai puhelimen vaihdon yli, toisin kuin laitekohtainen selainmuisti. `paivitaLaituriBadge()` laskee nyt toisen käyttäjän rivit joiden `created_at > oma_viimeksi_avattu` (oletus epoch jos ei koskaan avattu — kaikki nykyiset rivit näkyvät kertaalleen "uusina" ensimmäisellä avauskerralla tämän muutoksen jälkeen, sama hyväksytty kertaluontoinen sivuvaikutus kuin alkuperäisessä 2026-07-10 "nähty"-mallissa). **Tila ei riipu `status`:sta ollenkaan** — jo sijoitettu mutta näkemätön rivi laskee silti kunnes se nähdään, ja nähty mutta yhä sijoittamaton rivi EI enää laske uudelleen.

**EI TESTATTU VIELÄ oikealla laitteella** — ks. PALUU.md.

---

## Bugikorjaus: pitkän rivin ×-nappi karkasi ruudun ulkopuolelle (2026-07-13)

**Oire:** pitkä rivin nimi (tuote, kalenteritapahtuma, hytin tehtävä) työnsi toimintonapit (×, ⚓, ⏰) ruudun oikean reunan ulkopuolelle — piti rullata riviä sivulle päästäkseen niihin käsiksi. Mobiili-UX-ongelma, ei tietoturva-/dataongelma.

**Juurisyy:** klassinen flexbox-ansa. `.list li span` (rivin pääteksti — käytetään Muistilaput/Varasto/Kauppalista-tuoteriveillä, Kalenterin agendariveillä JA Hytin riveillä, kaikki jakavat saman `.list li`-rakenteen) oli `flex: 1` mutta EI koskaan asetettu `min-width: 0`:aa. Flex-lapsen oletusarvo `min-width: auto` tarkoittaa ettei se KOSKAAN kutistu sisältönsä (pisimmän katkeamattoman sanan) leveyttä pienemmäksi — pitkä nimi pakotti koko rivin, ja siis myös sen jälkeiset napit, näytön leveyttä leveämmäksi.

**Korjaus (`style.css`):** lisätty `.list li span`:iin `min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` — teksti katkeaa nyt yksiriviseen ellipsikseen (`...`), toimintonapit pysyvät AINA näkyvissä oikeassa reunassa. **Rajattu POIS `:not()`-poissuluilla** kiinteän levyisiltä metatiedoilta jotka EIVÄT saa kutistua/katketa (`.kalenteri-aika`, `.kalenteri-vari`, `.kalenteri-uusi-merkki`, `.hytti-tanaan-aika`, `.hytti-tehtava-erapaiva`, `.hytti-rivi-erapaiva`, `.history-time`, `.muistutus-aika`) — jos JATKOSSA lisätään uusi pieni kiinteän-levyinen merkintä `.list li`:n sisään, sen luokka pitää lisätä samaan poissulkulistaan tai se alkaa turhaan kutistua/katketa.

**Laituri EI tarvinnut korjausta** — `.laituri-content`/`.laituri-text` oli rakennettu `min-width:0` + `word-break:break-word` -periaatteella jo alusta asti (eri ratkaisu: sallii rivityksen sen sijaan että katkaisisi, koska Laiturin tekstit ovat luonteeltaan pidempiä vapaamuotoisia ajatuksia eikä lyhyitä tuotenimiä).

**Tarkistettu visuaalisesti Playwrightilla** (pitkä teksti + kalenteri-aika-yhdistelmä + hytti-eräpäivä-yhdistelmä, kaikki kolme) ennen committia molemmissa teemoissa — ei enää horisontaalista ylivuotoa, napit pysyvät näkyvissä. **EI TESTATTU vielä oikealla laitteella/oikealla datalla.**

---

## E3-keskiporras V1: "Äly toimii, ihminen valvoo" (rakennettu 2026-07-14/15)

**Huomautus kirjoitushetkellä:** Katri viittasi tähän speksiin "aiemmin tänään kirjattuna" — sitä ei kuitenkaan löytynyt mistään tästä tiedostosta ennen tätä kirjausta (haettu läpi koko dokumentti). Todennäköisesti keskusteltu jossain muualla eikä koskaan päätynyt tänne asti. Koko speksi kirjattu nyt tästä viestistä täydellisenä, ettei sama katoa uudelleen — tästä eteenpäin tämä ON ainoa totuus tälle ominaisuudelle.

**Konteksti:** ensimmäinen oikea toteutus Satama 2.0:n "Tehtävät"-vaiheen E3-tasosta (ks. "Satama 2.0 — seuraavat vaiheet" -osio: "Vaihe 2 (E3, Claude-äly): ajastettu haku... äly EHDOTTAA... EI KIRJOITA suoraan"). Määräaika oli tiukka: valmis ja pushattu keskiviikkoiltaan (15.7.) mennessä tai lykätty — torstai on VAIHE 2:n testipäivä, ei vastaanota keskeneräistä. Rakennettu kokonaisuudessaan, pushattu ajoissa. **Ei koskettu odottavan paketin asioihin** (ristiriitalippu, ankkurin lähetys toiselle) — nämä pysyvät erillään, VAIHE 2:n jälkeen.

### Idea ja turvainvariantti

Yöllinen (kerran ~vrk) haku käy läpi käyttäjän Laiturin sijoittamattomat murut ja kysyy äly-putkelta ERÄSSÄ (yksi kutsu per käyttäjä, ei per muru) viittaako mikään niistä selvästi tähän päivään/huomiseen kellonajan tai muun yksiselitteisen ajanmääreen kanssa. Osumat muuttuvat ANKKURIEHDOKKAIKSI (✨-merkki, etusivun ankkurien alla, EI "3 tärkeintä" -rajan sisällä) joita käyttäjä täppää/ottaa omakseen/poistaa — koskaan ei tule automaattista, kuittaamatonta ankkuria.

**TURVAINVARIANTTI, joka ohjasi kaikkia toteutuspäätöksiä: äly VAIN LISÄÄ.** Se ei koskaan muokkaa eikä poista mitään käyttäjän kirjoittamaa. Laiturin murut pysyvät koskemattomina IKUISESTI — äly ei koskaan UPDATE/DELETE-komennolla kosketa `laituri`-tauluun. Tämä invariantti tekee "Kumoa"-napista aina turvallisen (ks. alla): koska äly on VOINUT vain LISÄTÄ (uusi ankkuririvi + lokirivi), sen poistaminen ei koskaan voi hävittää mitään mitä käyttäjä itse teki.

### Tietomalli (kolme uutta migraatiota, kaikki idempotentteja)

- **`sql/041_aly_nightly_setup.sql`** — `asetukset`-tauluun `aly_yoajo` = `'on'` (kytkin datana, ei koodimuutosta jos pitää sammuttaa) + `ankkurit`-tauluun uusi sarake `is_candidate boolean not null default false`. `is_candidate=true` = AI-ehdotus odottaa reagointia, ei näy "3 tärkeintä" -haussa eikä laske sen rajaan.
- **`sql/042_aly_log_evaluated.sql`** — kaksi uutta taulua:
  - `aly_log` — "Mitä äly on tehnyt" -lokin tietolähde (Asetukset). Yksi rivi per yöajon tekemä ehdotus (`user_id, action, description, source_ref, anchor_id, created_at, undone_at`). Rivit EIVÄT KOSKAAN poistu — loki on pysyvä historia, myös kumotut/rauenneet ehdotukset jäävät näkyviin yliviivattuina.
  - `aly_evaluated` — puhtaasti sisäinen kirjanpito yöajolle (`laituri_id, evaluated_at`), EI RLS-policyja lainkaan (vain service_role koskee siihen). Merkitsee mitkä murut on todettu EI-päivämääräviitteisiksi, jottei samaa murua kysytä joka yö uudelleen. **Murut jotka TUOTTIVAT ehdokkaan EIVÄT päädy tähän tauluun** — jos ehdotus myöhemmin puretaan (poistetaan/raukeaa), sama muru on taas vapaa uudelleenarvioitavaksi seuraavana yönä, jos yhä ajankohtainen.
- **`sql/043_aly_log_seen.sql`** — `aly_log_seen` (`user_id` PK, `last_seen`) — Asetukset-laatan huomiopalluran "nähty"-aikaleima, sama malli kuin `laituri_nahty` (sql/040).

Kaikki uudet taulut/sarakkeet nimetty ENGLANNIKSI (talon uusi sääntö, ks. COPILOT.md "Koodikieli") — `ankkurit`/`asetukset`/`laituri` itse pysyvät suomenkielisinä (olemassa olevia, ei kosketa).

### Yöajo (`api/aly-nightly.js`, uusi tiedosto, englanniksi)

Kutsutaan SAMASTA GitHub Actions -ajastimesta (`.github/workflows/muistutukset-cron.yml`, 5 min välein) kuin muistutukset ja kalenterisynkka — sama jaettu `MUISTUTUKSET_CRON_SECRET`, ei uutta salaisuutta. Endpoint itse tekee TYÖTÄ vain kerran ~20h välein (tila `asetukset.aly_yoajo_last_run`), joten ~vrk-kadenssi saavutetaan ilman omaa cron-aikataulua.

**Ajon kulku:**
1. Tarkista `aly_yoajo`-kytkin ('on'/'off') ja onko ≥20h edellisestä ajosta — jos ei, palauta heti tekemättä mitään.
2. **Raukeaminen ensin:** poista KAIKKI `ankkurit`-rivit joilla `source='aly' AND is_candidate=true AND done=false` (= edellisen yön ehdotus jota ei reagoitu mitenkään) + merkitse vastaavan `aly_log`-rivin `undone_at`. Muru itse EI KOSKAAN kosketa.
3. Hae kelvolliset murut: `laituri`-rivit joilla `status='uusi'`, EI `aly_evaluated`-taulussa, EI jo olemassa olevaa `aly`-lähtöistä ankkuria viittaamassa niihin (missä tahansa tilassa — jos vanha ehdotus poistui, muru vapautuu uudelleen).
4. Ryhmittele käyttäjittäin, YKSI äly-kutsu per käyttäjä jolla on kelvollisia muruja (EI kutsua jos ei mitään uutta — "Maksimiautomaatio, minimikustannus" -periaate konkreettisesti).
5. Prompti antaa tämän päivän/huomisen päivämäärän + murujen tekstit, pyytää JSON-vastauksen osumista. **Epävarma = ei osumaa, äly ei koskaan arvaa** (kirjoitettu eksplisiittisesti promptiin).
6. Osumat → uusi `ankkurit`-rivi (`source='aly', is_candidate=true, source_ref=<murun id>`) + `aly_log`-rivi. Ei-osumat → `aly_evaluated`-riville, ei kysytä enää koskaan uudelleen (koska tekstillä ei ole koskaan päivämääräviitettä, se ei muutu).
7. Usage-lokitus (`console.log('[aly-nightly]', ...)`, malli+tokenit) jokaisesta kutsusta — sama kaava kuin `api/aly.js`:ssä.

### Käyttöliittymä

- **Etusivu:** uusi `<ul id="anchor-candidates-list">` normaalien Ankkurien alla. Jokainen ehdokas: ○ (täppää tehdyksi, sama semantiikka kuin ankkurilla), ✨-etuliite tekstissä, ⚓ (ottaa omakseen — `is_candidate → false`, muuttuu tavalliseksi ankkuriksi, EI näy "active"-tyylillä ennen hyväksyntää), × (poistaa — sekä ankkuririvi ETTÄ vastaava `aly_log.undone_at`).
- **Asetukset, "✨ Mitä äly on tehnyt":** lista kaikista `aly_log`-riveistä uusin ensin, kukin rivi teksti+suhteellinen aika (`suhteellinenAika()`, uudelleenkäytetty) + [Kumoa]-nappi (näkyy vain jos `undone_at` on tyhjä). Kumoa poistaa ankkuririvin (jos yhä olemassa, missä tahansa tilassa — myös jo hyväksytyn/tehdyn) ja merkitsee `undone_at`:n. Kumottu rivi jää lokiin yliviivattuna, ei katoa.
- **Asetukset-laatan pallura:** sama "nähty"-aikaleimamalli kuin Laiturilla (`aly_log_seen`, ei localStorage) — ensimmäinen laajennus `huomioPallurat`-karttaan Kalenterin/Laiturin jälkeen, PWA-kuvakesummaan mukaan.

### Tietoiset rajaukset (ei tehty, ei tarpeen V1:lle)

- **Ei Realtime-kanavaa** ankkuriehdokkaille/lokille — päivittyy sivun/näkymän avauksella, ei live-päivity toisen käyttäjän/laitteen kautta. Ei ollut spekissä eksplisiittinen vaatimus, ja "Maksimiautomaatio, minimikustannus" -periaatteen mukaisesti ei rakennettu ilman selvää tarvetta (yöajon tulos katsotaan seuraavana aamuna, ei reaaliajassa).
- **Ei UI-kytkintä `aly_yoajo`:lle** — pysyy Table Editor -hallinnoituna dataohjattuna asetuksena, kuten muutkin `asetukset`-taulun rivit joilla ei ole omaa käyttöliittymää.

**EI TESTATTU vielä oikealla laitteella/datalla** — ks. PALUU.md OSA O, testataan torstaina VIIMEISENÄ vasta kun VAIHE 2:n perusosat on kuitattu.

---

## Tietokannan rakenne

**Taulu: `tuotteet`**
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| id | int8 | pääavain, autoincrement |
| nimi | text | tuotteen nimi |
| tehty | bool | onko merkitty tehdyksi |
| bought_at | timestamptz | milloin merkittiin tehdyksi (null jos ei tehty) |
| list_id | uuid | viittaa `lists.id` |
| is_header | bool | default false — väliotsikko (`#`-etuliite lisättäessä), ei checkboxia, ei osu jäljellä/ostettu-laskuriin (002) |
| sort_order | double precision | manuaalinen järjestys, oletus = kellonaika sekunteina (uusi rivi menee aina loppuun) (007) |

**Taulu: `lists`**
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| id | uuid | pääavain, default gen_random_uuid() |
| name | text | listan nimi |
| type | text | default 'checklist' |
| owner_id | uuid | viittaa auth.users |
| created_at | timestamptz | default now() |
| visibility | text | 'private' (oletus) / 'shared' — ks. Pääsynhallinta-osio (003) |
| category | text | 'muistilaput' (oletus) / 'varasto' — sama lists/tuotteet-rakenne molemmille, vain suodatus eri (010) |
| sort_order | double precision | manuaalinen järjestys Muistilaput/Varasto-näkymissä, sama periaate kuin tuotteet.sort_order (011) |

Kauppalista-rivi on olemassa alusta asti (nimi tarkalleen `'Kauppalista'`) — Siri-API ja "ei voi poistaa/nimetä uudelleen" -logiikka tunnistavat sen tästä nimestä, ei erillisellä flagilla.

**Taulu: `list_members`** (ei vielä käytössä koodissa — kolmansien osapuolten jakamista varten myöhemmin, EI kuulu E1:een)
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| list_id | uuid | viittaa lists.id, osa PK:ta |
| user_id | uuid | viittaa auth.users, osa PK:ta |
| role | text | default 'member' |
| created_at | timestamptz | default now() |

**Taulu: `events`** — tapahtumaloki
| sarake | tyyppi | kuvaus |
|--------|--------|--------|
| id | bigint | pääavain, identity |
| created_at | timestamptz | default now() |
| user_id | uuid | nullable (null jos Siri tai lista poistettu) |
| action | text | 'added' / 'checked' / 'unchecked' / 'deleted' / 'created' / 'renamed' / 'shared' / 'unshared' / 'moved_to_varasto' / 'moved_to_muistilaput' |
| target_type | text | 'item' / 'list' / 'header' |
| target_id | text | poistetun/muokatun rivin id merkkijonona |
| target_name | text | nimi talteen tekstinä (säilyy vaikka kohde poistetaan) |
| list_id | uuid | viittaa lists.id, **ei ON DELETE CASCADE/SET NULL** — ks. alla |
| duration_seconds | int | ei vielä käytössä |

⚠️ **FK-ansa:** `events.list_id` viittaa `lists(id)` ilman ON DELETE -sääntöä. Kun lista poistetaan, sovellus poistaa ensin sen `events`-rivit manuaalisesti (`poistaLista()` script.js:ssä) — muuten Postgres estäisi listan poiston FK-rikkomuksena. "Poistettu"-tapahtuma itse kirjataan `list_id: null`.

⚠️ **`events`-taulua EI SAA KOSKAAN tyhjentää/arkistoida/siivota vanhoja rivejä pois** (esim. "siivotaan yli vuoden vanhat tapahtumat" -tyylinen kevennys), vaikka se voisi joskus houkutella taulun kasvaessa. Syy: tuleva **Horisontti**-ominaisuus (ks. "Horisontti — suunnitelma" -osio) laskee kotihommien rytmin NIMENOMAAN tästä historiasta (`action='checked'`-rivien aikaleimoista, `target_name`-täsmäyksellä) — historian menettäminen tarkoittaisi ettei rytmiä voisi enää koskaan oppia uudelleen.

**Taulu: `laituri`** — yhteinen muistilista (004), ks. Laituri-osio alla.

**Taulu: `home_sections`** — navigointiruudukon rivit (008), ks. Etusivu-osio alla.

**Taulu: `ankkurit`** — päivän tärkeimmät (009, 013), ks. Etusivu-osio alla.

**Taulu: `kalenteri_tapahtumat`** — oma sisäinen kalenteri (012), ks. Kalenteri-osio alla.

RLS on käytössä KAIKILLA tauluilla (kytketty 2026-07-07, ks. Pääsynhallinta-osio). Siri-API käyttää service_role-avainta joka ohittaa RLS:n kokonaan.

---

## Tiedostorakenne

```
kauppalista/
├── index.html        — sovelluksen pohja, PWA meta-tagit
├── style.css         — kuitti-tyyli, tumma/vaalea automaattisesti
├── script.js         — kaikki logiikka (Supabase, listat, auth, offline)
├── manifest.json     — PWA: nimi "Kauppalista", teema #C9A84C, icon.png, orientation "portrait"
├── sw.js             — service worker, offline-tuki, auto-reload uudesta versiosta, push-käsittelijät (versionumero `CACHE`-vakiossa, muuttuu joka muutoksella — älä kirjoita sitä tähän tiedostoon kiinteänä, tarkista aina suoraan sw.js:stä)
├── icon.png          — 512×512 PWA-ikoni
├── package.json      — VAIN api/-kansion serverless-funktioiden npm-riippuvuudet (tsdav, ical.js, web-push). Etusivun vanilla-JS-puoli (index.html/script.js) EI käytä näitä eikä vaadi build-vaihetta — Vercel asentaa nämä automaattisesti vain funktioita ajaessaan.
├── api/
│   ├── add.js                    — Vercel serverless, lisää tuotteen Kauppalistaan (service_role-avain), Siri-Shortcutin käyttämä
│   ├── caldav-sync.js            — Vercel serverless, geneerinen kalenterisyötteiden veto (ks. "Kalenterisyötteet"-osio alla)
│   ├── push-test.js              — Vercel serverless, lähettää testi-push-ilmoituksen kirjautuneen käyttäjän tilauksiin (ks. "Push-ilmoitukset"-osio alla)
│   ├── muistutukset-laheta.js    — Vercel serverless, lähettää erääntyneet muistutukset (ks. "Muistutukset"-osio alla), suojattu ?avain=-salaisuudella
│   ├── aly.js                    — Vercel serverless, äly-putken runko (ks. "Äly-putki"-osio ja COPILOT.md), vaatii kirjautumisen (JWT)
│   └── aly-nightly.js            — Vercel serverless, E3-keskiportaan yöajo (ks. "E3-keskiporras V1" -osio), suojattu ?key=-salaisuudella (sama MUISTUTUKSET_CRON_SECRET kuin muistutuksissa), englanniksi kirjoitettu (uusi koodi, ks. COPILOT.md "Koodikieli")
├── .github/workflows/
│   └── muistutukset-cron.yml     — GitHub Actions -ajastin (5 min välein), kutsuu muistutukset-laheta.js:ää, caldav-sync.js:ää JA aly-nightly.js:ää (ks. "Muistutukset"- ja "E3-keskiporras V1" -osiot)
├── scripts/
│   └── varmuuskopio.sh           — yhden komennon pg_dump-wrapper, ks. "Varmuuskopiot"-osio ja BACKUP.md
├── BACKUP.md  — varmuuskopiointi- ja palautusohje (kertaluontoinen asennus, komento, palautus askel askeleelta) — kirjoitettu 2026-07-11
├── sql/
│   ├── 001_multilist_and_events.sql   — lists/list_members/events + tuotteet.list_id
│   ├── 002_item_headers.sql           — tuotteet.is_header (väliotsikot)
│   ├── 003_row_level_security.sql     — näkyvyysmalli + RLS + backfill
│   ├── 004_laituri.sql                — laituri-taulu
│   ├── 005_fix_rls_recursion.sql      — korjaa lists<->list_members-rekursion
│   ├── 006_fix_shared_requires_auth.sql — korjaa shared-näkyvyyden anon-vuodon
│   ├── 007_sort_order.sql             — tuotteet.sort_order (raahaus)
│   ├── 008_home_sections.sql          — navigointiruudukon rivit
│   ├── 009_ankkurit.sql               — ankkurit-taulu
│   ├── 010_varasto.sql                — lists.category + 2 esimerkkilistaa
│   ├── 011_lists_sort_order.sql       — lists.sort_order (raahaus)
│   ├── 012_kalenteri.sql              — kalenteri_tapahtumat-taulu
│   ├── 013_ankkuri_aika.sql           — ankkurit.event_time
│   ├── 014_kalenteri_syotteet.sql     — kalenteri_syotteet-taulu (geneerinen ulkoisen kalenterin veto) + kalenteri_tapahtumat.syote_id/ical_uid/event_end_time + kalenteri_odottavat-taulu
│   ├── 015_push_tilaukset.sql         — push_tilaukset-taulu (web push -tilaukset)
│   ├── 016_hytti.sql                  — hytti_kortit + hytti_rivit -taulut (Oma Hytti)
│   ├── 017_kalenteri_tilit.sql        — kalenteri_syotteet.account_key (tuki useammalle CalDAV-tilille)
│   ├── 018_kalenteri_monipaivainen.sql — kalenteri_tapahtumat/kalenteri_odottavat.event_end_date (usean päivän tapahtumat)
│   ├── 019_kalenteri_syotteet_data.sql — syöterivit Katrin tilin kalentereille (Perhekalenteri/Juha/Katri) + uniikki-rajoite
│   ├── 020_tyhjenna_kalenteri_odottavat.sql — **EI TARVITSE AJAA**, jäänyt tarpeettomaksi (022 tekee saman + enemmän, ks. sen kuvaus)
│   ├── 021_kalenteri_kuittausjono.sql — kalenteri_tekijat + kalenteri_kuittaukset -taulut ("yksi totuus, kaksi ikkunaa" -arkkitehtuuri)
│   ├── 022_kalenteri_puhdas_alku.sql — poistaa vanhan mallin synkkausdatan, puhdas pöytä uudelle mallille
│   ├── 023_asetukset.sql — yleinen avain-arvo-asetustaulu (Kuormavahdin paivan_menoraja ensimmäisenä)
│   ├── 024_kalenteri_ristiriita.sql — kalenteri_syotteet.henkilo + ristiriita_*-asetukset (Ristiriitamerkin rauhoitettu ikkuna)
│   ├── 025_muistutukset.sql — muistutukset-taulu (henkilökohtaiset push-muistutukset)
│   ├── 026_hytti_v1_respec.sql — hytti_kortit.kalenterisuodatin + muistutukset.source laajennettu 'hytti_rivi':lle
│   ├── 027_kalenteri_syotteet_scope.sql — kalenteri_syotteet.scope + hytti_omistajat-taulu + kalenteri_tapahtumat-RLS-korjaus (kriittinen yksityisyys)
│   ├── 028_hytti_ics_syotteet_data.sql — Itslearning/Lukkarikone-syöterivit Katrin Hyttiin
│   ├── 029_ankkurit_henkilokohtaiset.sql — ankkurit-taulun RLS henkilökohtaiseksi (user_id not null + FK + policyt)
│   ├── 030_kalenteri_syotteet_data_juha.sql — Juhan CalDAV-tilin syöterivit (Perhekalenteri/Juha/Katri, account_key='juha')
│   ├── 031_kalenteri_juha_nimikorjaus.sql — korjaa Juhan tilin kalenterinimet (Perhekalenteri→Yhteinen kalenteri, uusi Oma-syöte)
│   ├── 032_juha_oma_hytti_scope.sql — Juhan "Oma"-kalenteri Hytin scopeen (scope='hytti'), scope-symmetria valmis
│   ├── 033_hytti_omistajat_juha.sql — lisää Juhan rivin hytti_omistajat-tauluun automaattisesti (haku auth.users:sta sähköpostilla, ei UUID:n käsinkopiointia) — AJETTAVA ENNEN 032:ta
│   ├── 034_realtime_huomiopallurat.sql — ottaa Supabase Realtime -Replication-julkaisun käyttöön laituri/kalenteri_tapahtumat/kalenteri_kuittaukset-tauluille (Huomiopallurat-ominaisuuden reaaliaikapäivitys)
│   ├── 035_ohjeet_vinkit.sql — ohjeet-taulu (sisältö+järjestys) + 10 Vinkki-riviä, korvaa index.html:n 9 kovakoodattua vinkkiä data-ohjatulla listalla
│   ├── 036_testipaiva_lista.sql — jaettu "Testipäivä to 16.7." -tarkistuslista Muistilappuihin (rivi per testikohta, väliotsikoin) — sisältömigraatio, ei skeemamuutos
│   ├── 037_telttaretki_pakkauslista_sisalto.sql — täyttää tyhjän "Telttaretken pakkauslista" -listan (93 riviä, 6 väliotsikkoa)
│   ├── 038_viikkopakkaus_sisalto.sql — täyttää tyhjän "Viikon reissun pakkauslista" -listan (38 riviä)
│   ├── 039_events_delete_policy.sql — lisää puuttuneen events_delete-RLS-policyn (bugikorjaus: listan poisto ei toiminut, ks. "Bugikorjaus: Listan poisto ei toiminut" -osio)
│   ├── 040_laituri_nahty.sql — laituri_nahty-taulu (per-käyttäjä "viimeksi avattu" -aikaleima), bugikorjaus Laituri-pallurallle (ei sammunut, ks. "Bugikorjaus: Laituri-pallura" -osio)
│   ├── 041_aly_nightly_setup.sql — asetukset.aly_yoajo-kytkin + ankkurit.is_candidate-sarake (E3-keskiporras)
│   ├── 042_aly_log_evaluated.sql — aly_log ("Mitä äly on tehnyt" -loki) + aly_evaluated (sisäinen kirjanpito) -taulut (E3-keskiporras)
│   └── 043_aly_log_seen.sql — aly_log_seen-taulu (Asetukset-laatan pallura, sama malli kuin laituri_nahty) (E3-keskiporras)
├── PALUU.md  — käsintehtävät askeleet paluun jälkeen (ympäristömuuttujat, migraatiot, testiohjeet) — kirjoitettu 2026-07-11
├── COPILOT.md  — tekninen jatko-opas ("miten lisään uutta" -ohjeistus, alkaa äly-putkesta) — kirjoitettu 2026-07-11
└── muistiinpanot.md  — tämä tiedosto
```

SQL-migraatiot ajetaan aina käsin Supabasen SQL Editorissa — Claude ei aja niitä itse, vain kirjoittaa tiedoston. Numerointi on ajojärjestyksen ehdotus, ei aina pakollinen riippuvuus — esim. 011 ja 012 eivät riipu toisistaan.

**PERIAATE (kirjattu 2026-07-08, syy: `kalenteri_syotteet` jäi tyhjäksi koska syöterivit eivät olleet missään migraatiossa):** EI KOSKAAN irtokomentoja Supabasen SQL Editoriin ohi git-historian — myös SYÖTE-/SIEMENDATA (esim. `kalenteri_syotteet`-rivit) kuuluu AINA omaan numeroituun migraatioonsa, ei vain skeemamuutokset. Jos Katri tarvitsee jonkin datarivin lisäystä, se kirjoitetaan `sql/0XX_....sql`-tiedostoon (idempotentiksi, esim. `on conflict do nothing`), EI koskaan pelkkänä ohjeena "aja tämä SQL Editorissa" ilman että se on myös tiedostona.

**LAAJENNUS (kirjattu 2026-07-13, syy: `hytti_omistajat`-taulusta puuttui Juhan rivi — `sql/027` loi VAIN Katrin rivin ja jätti Juhan ohjeeksi "lisää itse Table Editorista", mikä unohtui ja olisi jättänyt Juhan Hytin/Oma-kalenterin tyhjäksi ilman että Katri huomasi ajoissa):** sama periaate koskee YHTÄ LAILLA Table Editor -rivinlisäystä kuin SQL Editorin irtokomentoja. **"Lisää käsin Table Editorista" EI OLE hyväksytty asennusaskel** millekään riville jota jokin RAKENNETTU (ei suunniteltu, ei vielä toteutettu) ominaisuus tarvitsee TOIMIAKSEEN. Jos rivi on välttämätön, se kirjoitetaan migraationa joka hakee tarvittavan tunnisteen TURVALLISESTI datasta itsestään (esim. `auth.users`-taulusta sähköpostilla, kuten `sql/033_hytti_omistajat_juha.sql`) — EI koskaan käsinkopioitua UUID:ta tai muuta arvoa jonka joku voisi unohtaa täyttää.
**Poikkeus tästä säännöstä** (ei asennusaukko vaan tietoinen, dokumentoitu jatkuva ylläpito): asetukset joilla ei ole yhtä oikeaa arvoa jota voisi johtaa datasta automaattisesti, esim. `ristiriita_loma_valit` (koulujen loma-ajat, muuttuvat vuosittain, ei mistään pääteltävissä ilman Vaihe 2:n äly-avusteista hakua, ks. "Loma-aikojen täyttö" -osio) tai `kalenteri_tekijat` (organizer-kartta, tarkoituksella tyhjä koska organizer-diagnostiikka osoitti sen tarpeettomaksi V1:ssä). Näissä TYHJÄ on hyväksytty, turvallinen oletustila jonka sovellus on suunniteltu sietämään — ero "asennusaukkoon" on että puuttuva rivi ei riko mitään, se vain jättää valinnaisen lisäominaisuuden pois päältä.

---

## index.html — rakenne

Yksitoista näkymää/elementtiä, kaikki `display:none` alussa. Yksi yhteinen apufunktio piilottaa kaikki (`piilotaKaikkiNakymat()`), ja jokainen `showXView()` kutsuu sitä ja näyttää vain omansa — helpompi pitää synkassa kuin toistaa piilotuslogiikka joka funktiossa:

1. `#login-view` — kirjautumaton, "Kirjaudu Googlella"
2. `#home-view` — etusivu: päivämäärä, Ankkurit, Horisontissa, navigointiruudukko (`#sections-list`). Listat EIVÄT ole täällä (ks. Etusivu-osio)
3. `#muistilaput-view` — listojen (category='muistilaput') listaus + uuden luonti
4. `#varasto-view` — sama kuin Muistilaput mutta category='varasto'
5. `#kalenteri-view` — päivä/viikko/kuukausinäkymät
6. `#laituri-view` — yhteinen muistilista
7. `#app-view` — geneerinen listanäkymä, toimii millä tahansa list_id:llä (Kauppalista, Siivouslista, mikä tahansa Muistilaput/Varasto-lista)
8. `#dialog-overlay` — kuitti-tyylinen vahvistusdialogi (poistot)
9. `#settings-overlay` — listan omat asetukset (näkyvyyskytkin + kategorian vaihto)
10. `#kalenteri-kuittaus-overlay` (ent. `#kalenteri-hyvaksynta-overlay`) — kalenterisyötteistä tulleiden "uusien" tapahtumien kuittauskortit (ks. "Kalenterin periaate: yksi totuus, kaksi ikkunaa" -osio), sama dialog-overlay/dialog-box-rakenne kuin kohdilla 8-9, mutta sisältää dynaamisesti piirretyn listan kortteja yhden kiinteän tekstin sijaan
11. `#asetukset-view` — ensimmäinen kevyt Asetukset-runko (2026-07-08), toistaiseksi vain Ilmoitukset-lohko (ks. "Push-ilmoitukset"-osio)

⚠️ **DOM-järjestys on merkityksellinen:** useat näkymät jakavat samoja CSS-luokkia (`.add-item`, `.list`). `script.js` hakee `app-view`:n input/button/list-elementit `document.querySelector('#app-view .add-item input')` -tyylillä (rajattu kontekstiin) — jos rajaus joskus katoaa refaktoroinnissa, valitsin osuu vahingossa väärän näkymän ensimmäiseen samannimiseen elementtiin (tämä oli oikea bugi 2026-07-06, ks. historia-osio). Muiden näkymien omat listat/inputit on nimetty uniikeilla id:illä (`#muistilaput-list`, `#varasto-list`, `#ankkurit-list`, `#laituri-list`) juuri tämän luokkatörmäyksen välttämiseksi.

**Navigointipolku:** Etusivu → (ruudukon laatta) → Muistilaput/Varasto/Laituri/Kalenteri → (listarivi) → yksittäinen lista (`app-view`). `app-view`:n takaisin-nuoli palaa sinne mistä lista avattiin (`listanAvausLahde`-muuttuja, arvo 'muistilaput' tai 'varasto'), ei aina etusivulle.

---

## style.css — design-systeemi

Kuitti-tyyli (Courier New), automaattinen tumma/vaalea `prefers-color-scheme`-mediakyselyn kautta.

**CSS-muuttujat:**
```css
/* Vaalea */
--ground: #F8F5EF;   /* tausta */
--text: #1A1A1A;     /* teksti */
--accent: #C8941A;   /* kulta, korostukset */
--muted: #B0AA9E;    /* harmaa, toissijainen teksti */
--border: #E0DDD6;   /* lista-erottimet */
--border-dash: #C8C3B8; /* katkoviiva-erottimet */

/* Tumma */
--ground: #1A2928;
--text: #F0EDE8;
--accent: #E8B84B;
--muted: #4D6B69;
--border: #2D4140;
--border-dash: #3A5250;
```

**Tärkeät luokat:**
- `.container` — max-width 400px, kaikki sisältö tässä
- `h1` — 26px, letter-spacing 0.24em, text-indent 0.24em (tasaus), accent-väri
- `.subtitle` — 14px, muted-väri, päivittyy JS:stä ("x jäljellä · y ostettu")
- `.sync-indicator` — offline/synk-tila, JS luo dynaamisesti divider-elementin eteen
- `.divider` — 1px dashed border-dash
- `.add-item` — lisäysrivi, input + + -nappi, min-height 52px
- `.list li` — jokainen tuote: check-btn (vasen) + span (teksti, keski) + delete-btn (oikea), min-height 52px
- `.check-btn` — ○/✓, 52×52px, muted/accent
- `.delete-btn` — ×, 52×52px, opacity 0.5
- `.edit-input` — inline muokkaus, border-bottom accent
- `.done` — yliviivaus + muted-väri
- `.history-time` — timestamp, 12px, muted
- `.list-footer .count` — "x KPL JÄLJELLÄ", accent, padding-left 24px
- `.eye-btn` — 52×52px SVG-silmäikoni, accent
- `.login-btn` — kirjautumisnappi, dashed border accent, hover täyttää
- `#signout-link` — "kirjaudu ulos", 11px, muted, opacity 0.5
- `.toast` — itsestään katoava ilmoitusbanneri ruudun alareunassa (lisätty 2026-07-08, `naytaIlmoitus()` script.js:ssä luo elementin dynaamisesti, ei valmiina HTML:ssä), `.nakyva`-luokka ohjaa fade in/out -siirtymän
- `.settings-action-btn` — täysleveä toimintonappi Asetukset-näkymässä (lisätty 2026-07-08), käytetään yhdessä `.login-btn`:n kanssa (`class="login-btn settings-action-btn"`) samalla ulkoasulla mutta koko leveydellä pinottuna

---

## script.js — logiikka pääpiirteittäin

### Supabase-yhteys
```js
const db = createClient('https://uctmxxeewoeydabuepye.supabase.co', ANON_KEY);
```

### Näkymänvaihto (ylhäällä, heti db:n jälkeen)
```js
function showLoginView()  // login-view näkyy, home-view+app-view piilossa
function showHomeView()   // home-view näkyy, login-view+app-view piilossa
function showAppView()    // app-view näkyy, login-view+home-view piilossa
```

### Monilista-navigointi (lisätty 2026-07-06)
- `currentList` — muuttuja, sisältää avoinna olevan listan `{id, name, ...}`-olion, `null` jos ei mitään auki
- `LAST_LIST_KEY = 'kauppalista_viimeisin_lista'` localStorage:ssa — muistaa viimeksi avatun listan id:n
- `avaaLista(lista)` — asettaa currentList:n, kirjoittaa localStorageen, päivittää `#list-title`:n, kutsuu showAppView()+lataaLista()
- `lataaKotinakyma()` — hakee kaikki `lists`-rivit, piirtää ne `#home-list`:iin. Kauppalista-rivillä ei ole ×-poistonappia (tunnistetaan nimestä `'Kauppalista'`)
- `poistaLista(lista)` — hakee ensin tuotemäärän (count), näyttää vahvistusdialogin, ja **vasta hyväksynnän jälkeen** poistaa: tuotteet → events-rivit (FK-ansa, ks. tietokanta-osio) → itse lista. Kirjaa lopuksi `'deleted'/'list'`-tapahtuman `list_id: null`
- `siirryKirjautumisenJalkeen()` — kirjautumisen jälkeen: jos localStoragessa on viimeisin lista ja se löytyy DB:stä → avaaLista() suoraan; muuten showHomeView()
- `back-btn` (‹) palaa kotinäkymään, ei tyhjennä `currentList`/localStoragea — vain PWA:n uudelleenkäynnistys nollaa näkymän takaisin viimeisimpään listaan

### Vahvistusdialogi (lisätty 2026-07-06)
- `naytaVahvistus(otsikko, teksti, poistaTeksti)` — palauttaa `Promise<boolean>`. `teksti` näytetään vain jos annettu (esim. "Listalla on 3 asiaa — nekin poistuvat."), `poistaTeksti` on vahvistusnapin teksti ("Poista lista" / "Poista tuote"). Ulkopuolelle klikkaus tai Peru-nappi → `false`, Poista-nappi → `true`
- Käytössä sekä `poistaLista()`:ssa (listan poisto kotinäkymässä) että tuotteen delete-btn:n click-handlerissa (listan sisällä) — molemmat kysyvät ennen poistoa, kumpikaan ei enää poista suoraan

### Offline-jono
- `QUEUE_KEY = 'kauppalista_jono'` localStorage:ssa
- `addToQueue(action)` — lisää `{ type: 'insert'|'update'|'delete', data: {...} }` — insert-actionit kantavat mukanaan oikean `list_id`:n
- `processQueue()` — ajaa jonon läpi kun online tulee takaisin
- `updateSyncIndicator()` — näyttää/piilottaa "● ei yhteyttä" / "● synkronoidaan...". Kohdistaa hakunsa `#app-view .divider`-elementtiin (ei pelkkään `.divider`), koska login-view/home-view sisältävät myös `.divider`-elementtejä

### Tapahtumaloki (lisätty 2026-07-06)
- `logEvent(action, targetType, targetId, targetName, listId)` — fire-and-forget insert `events`-tauluun, virheet vaietaan (`.then(ok, virhe)`). `user_id` otetaan `currentUserId`-muuttujasta (päivittyy auth-tilan mukana)
- Kutsutaan: tuote lisätty/checked/unchecked/poistettu, lista luotu/poistettu

### Lista-funktiot
- `lataaLista()` — hakee `currentList.id`:n tuotteet Supabasesta (`.eq('list_id', currentList.id).order('sort_order')`), päivittää cachedTuotteet. Palaa heti jos `currentList` on null TAI raahaus on kesken (`raahattavaRivi`). Tarkistaa `error`-kentän ja pysyy ennallaan virhetilanteessa (ei kutsu `paivitaNaytto(null)`, joka kaataisi sovelluksen — tämä oli oikea bugi, ks. historia)
- `paivitaNaytto(tuotteet)` — renderöi listan, huomioi historyOpen-tilan ja väliotsikot (is_header). Palaa heti jos raahaus on kesken
- `paivitaFooter(tuotteet)` — päivittää subtitlen ja footer-counterin, ei laske väliotsikoita mukaan
- `showHistory()` — hakee ostetut bought_at-järjestyksessä samalta listalta (dead code, ei kutsuta mistään toistaiseksi)
- `laskeLisaysJarjestys()` / `valitseLisaysKohde(tuote)` — otsikon alle kohdistettu lisäys: napauta väliotsikkoa → `aktiivinenOtsikkoId` asettuu, uudet rivit saavat `sort_order`-arvon otsikon ja seuraavan rivin välistä (midpoint-laskenta)

### Yleistetty raahauslogiikka (pitkä painallus + siirto)
`alustaRaahaus(li, kohde, asetukset)` missä `asetukset = {container, cache, taulu, jalkeenPaivitys}` — SAMA koodi toimii kaikkialla missä on `sort_order`-sarake:
- Listan tuoterivit (`tuotteet`-taulu, `#app-view .list`)
- Ankkurit (`ankkurit`-taulu, `#ankkurit-list`)
- Muistilaput/Varasto-listarivit (`lists`-taulu, `#muistilaput-list`/`#varasto-list`)
- Navigointiruudukon laatat (`home_sections`-taulu, `#sections-list`)

Tekniset yksityiskohdat:
- Kosketus (touch) "lukittuu" alkuperäiseen elementtiin automaattisesti; hiiri EI, joten hiirellä `mousemove`/`mouseup` kuunnellaan `document`:sta raahauksen ajan (lisätty jälkikäteen kun havaittiin ettei raahaus toiminut ollenkaan tietokoneen selaimessa)
- 450ms pitkän painalluksen kynnys, 10px liike ennen kynnystä tulkitaan skrollaukseksi ja peruu ajastimen
- `estaKlikkausJosRaahattiin` käyttää `stopImmediatePropagation()`:ia (ei pelkkää `stopPropagation()`:ia) — muuten sama-elementin muut klikkauskuuntelijat (esim. otsikon valinta) laukeaisivat raahauksen jälkeenkin
- Globaali `raahattavaRivi`-muuttuja: kun se on asetettu, `paivitaNaytto`/`lataaAnkkurit`/`lataaOsiot`/`lataaListatNakymaan` palaavat heti eivätkä piirrä mitään uudelleen — estää esim. Realtime-päivitystä pyyhkimästä kesken olevaa raahausta

### Ankkurointi (⚓-nappi, lisätty 2026-07-07)
- `ankkuroidutAvaimet` — Set jonka avaimet ovat `"lähde:tunniste"` (esim. `"muistilaput:42"`, `"kalenteri:7"`) — sallii saman tunnisteen esiintyä eri lähteissä ilman törmäystä
- `vaihdaAnkkurointiYleinen(source, id, content, jalkeenPaivitys)` — nostaa/poistaa minkä tahansa rivin (Muistilaput-tuote, kalenteritapahtuma) Ankkureihin. `vaihdaAnkkurointi(tuote)` on tämän ohut kääre listan tuoteriveille
- ⚓-nappi näkyy sekä listan tuoteriveillä (`#app-view`) että kalenteritapahtumien riveillä — korostuu (`active`-luokka) kun rivi on jo ankkuroitu

### Realtime
```js
const realtimeChannel = db.channel('tuotteet')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tuotteet' }, () => {
    if (currentList) lataaLista();
  })
  .subscribe();
```
Ei suodateta list_id:n mukaan kanavatasolla — mikä tahansa muutos triggeröi `lataaLista()`:n, joka itse suodattaa oikean listan. Yksinkertainen mutta toimiva niin kauan kuin listoja on vähän. PWA-taustatila -korjaus: `visibilitychange`-kuuntelija re-subscribee jos yhteys katki.

### Auth (lopussa)
```js
db.auth.getSession()          // tarkistaa session sivun latautuessa
db.auth.onAuthStateChange()   // reagoi kirjautumiseen/uloskirjautumiseen
// login-nappi: signInWithOAuth({ provider: 'google', redirectTo: window.location.origin })
// signout-linkki: signOut()
```
Molemmat kutsuvat `siirryKirjautumisenJalkeen()`:ää (ei enää suoraan `showAppView()`:ta) — reitittää kotiin tai viimeisimpään listaan.

---

## api/add.js — Siri-integraatio

Vercel serverless -funktio, ei vaadi autentikointia (tarkoituksella):

```
POST /api/add
Body: { "nimi": "maito" }
Response: { "success": true }
```

Käyttää Supabase REST API:a suoraan (ei supabase-js:ää). CORS kaikille (`*`).
Siri Shortcut kutsuu tätä endpointia puhekomennolla.

Hakee ensin Kauppalistan id:n (`GET /rest/v1/lists?name=eq.Kauppalista`) ja asettaa sen lisättävän tuotteen `list_id`:ksi, sitten kirjaa `'added'/'item'`-tapahtuman `events`-tauluun `user_id: null`:lla (Siri ei tiedä käyttäjää). Tapahtumakirjaus on `try/catch`:n sisällä — jos se epäonnistuu, itse lisäys onnistuu silti.

**2026-07-07: vaihdettu service_role-avaimeen.** RLS on päällä kaikilla tauluilla, joten vanha anon-avain ei enää riitä kirjoituksiin. `SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY` — avain on Vercelin ympäristömuuttuja (Production + Preview), EI koodissa. Jos tämä puuttuu, endpoint palauttaa selkeän 500-virheen sen sijaan että epäonnistuisi hämärästi.

---

## Google OAuth -konfigurointi

Tehty 2025-07-06:
- Supabase: Authentication → Providers → Google → enabled
- Google Cloud -projekti: "Satama"
- Callback URL Supabasesta lisätty Google Cloud Consoleen
- Authorized origin: https://kauppalista-nine.vercel.app

---

## Toiminnot käyttäjälle

**Etusivu:** päivämäärä, Ankkurit (+ tämän päivän kalenteritapahtumat samassa jos tänään), Horisontissa (tyhjä toistaiseksi), navigointiruudukko. Ei enää listoja suoraan — ks. Etusivu-osio.

**Muistilaput/Varasto** (listojen listaus, ks. Etusivu-osio):
- Rivin napautus avaa listan, pitkä painallus raahaa järjestystä
- ✎ (paitsi Kauppalistalla) → nimen muokkaus inline
- × (paitsi Kauppalistalla) → vahvistusdialogi → poistaa listan tuotteineen

**Lista** (toimii millä tahansa listalla):
- ‹-nuoli → takaisin sinne mistä lista avattiin (Muistilaput tai Varasto)
- 🔒/👥-nappi otsikkorivin oikeassa reunassa → listan asetukset: näkyvyyskytkin + "Siirrä Varastoon/Muistilappuihin"
- ○ vasemmalla → merkitsee tehdyksi (tuntopalaute-värinä + bought_at-leima)
- Tekstitappi → inline muokkaus, Enter tallentaa, Esc peruuttaa
- ⚓ → nostaa/poistaa rivin päivän Ankkureihin (korostuu jos jo ankkuroitu)
- × oikealla → vahvistusdialogi ("Poistetaanko [nimi]?") → vasta hyväksynnän jälkeen poistaa
- `#`-etuliite lisättäessä → väliotsikko (lihavoitu, ei checkboxia). Napauta otsikkoa → uudet rivit menevät sen alle
- Pitkä painallus + raahaus → järjestyksen muutos
- Ostetut näkyvät yliviivattuna aikaleimojen kera, silmänappi footerissa näyttää/piilottaa

**Vahvistusdialogi** (korvasi selaimen natiivin `confirm()`:n):
- Kuitti-tyylinen overlay: katkoviivareunat, teeman taustaväri, Peru (turvallinen, dashed-aksentti) + punainen Poista-nappi
- Ulkopuolelle klikkaus = peru
- Käytössä listan ja yksittäisen tuotteen poistossa (EI Ankkurin irrotuksessa — se on kevyt, tiheä toiminto eikä tarvitse vahvistusta)

**Auth:**
- Kirjautumaton: näkee "✱ SATAMA ✱" + "Kirjaudu Googlella"
- Kirjautunut: näkee etusivun (tai viimeisimmän listan jos sellainen muistissa)
- "kirjaudu ulos" -linkki etusivun alalaidassa

**Offline:**
- Muutokset menevät jonoon, näyttää "● ei yhteyttä"
- Yhteyden palautuessa synkkaa automaattisesti

---

## PWA

- manifest.json: name "Kauppalista", theme_color "#C9A84C", `orientation: "portrait"` (2026-07-07 — iOS Safari ei kuitenkaan tue suunnan ohjelmallista lukitusta luotettavasti, joten tämä ei ole taattu toimimaan)
- sw.js: `CACHE`-vakio (versionumero, EI kirjata tähän tiedostoon kiinteänä koska se nousee joka muutoksella — tarkista aina suoraan sw.js:stä tai Asetukset → Sovellus -näkymän versioteksti) — nostettava aina kun index.html/style.css/script.js/icon.png muuttuu. **HUOM:** `/api/`-polut on tietoisesti jätetty POIS cachesta kokonaan (ks. "Kalenterisyötteet"-osio, "sw.js piti korjata tätä varten") — vain APP_FILES-listan tiedostot ja muut samaperäiset staattiset pyynnöt cachetetaan.
- sw.js sisältää myös `push`- ja `notificationclick`-tapahtumankuuntelijat (2026-07-08) — ks. "Push-ilmoitukset"-osio.
- **Automaattinen päivitys** (2026-07-07): kun uusi service worker aktivoituu (`controllerchange`-tapahtuma), sivu lataa itsensä kerran uudelleen — ei enää tarvitse sulkea/avata PWA:ta moneen kertaan nähdäkseen uusimman version
- iPhone: kotinäytöltä aukeaa kuin natiivi appi

---

## Satama 2.0 — seuraavat vaiheet

Isompi visio: ADHD-päin rakennettu perheen toiminnanohjausjärjestelmä.

**Lukittu rakennusjärjestys:**
1. **Listat** (nyk. nimeltään "Muistilaput", oma näkymä — ei enää suoraan etusivulla, ks. "Etusivu"-osio) ← TÄSSÄ NYT
   - Kirjautuminen ✓
   - Monikko (koti + useita listoja, luonti/poisto) ✓ (2026-07-06)
   - Tapahtumaloki ✓ (2026-07-06)
   - Uudelleennimeäminen (✎ kotinäkymässä, ei Kauppalistalle) ✓ (2026-07-06)
   - Väliotsikot listan sisällä (`#`-etuliite tuotteen nimessä → lihavoitu, ei checkboxia, ei osu jäljellä/ostettu-laskuriin) ✓ (2026-07-07)
   - Rivien raahausjärjestys (pitkä painallus, sort_order-sarake) ✓ (2026-07-07)
   - Otsikon alle kohdistettu lisäys (napauta otsikkoa → uudet rivit sen alle) ✓ (2026-07-07)
   - Näkyvyysmalli + RLS ✓ koodissa ja ajettu Supabasessa (2026-07-07)
   - Laituri (yhteinen muistilista, oma näkymä kotinäkymän kautta) ✓ koodissa, ⏳ SQL ajamatta (008/009, ks. TODO)
   - Etusivun uudelleensuunnittelu: Ankkurit + Horisontissa + 2×3-navigointiruudukko ✓ koodissa, ⏳ SQL ajamatta — ks. "Etusivu"-osio alla
   - Jakaminen kolmansille (list_members + kutsulinkki) — taulu valmiina, EI kuulu E1:n valmiusehtoihin, ei UI:ta vielä
2. Tehtävät + push-ilmoitukset + kiertoseuranta
3. Siri-äly (Claude API)
4. Nostot / Odottaa / Ruoka
5. Muistiinpanot / Opiskelu-AI / Palautuminen

**Seitsemän "paikkaa" lopullisessa Satamassa:**
1. Laituri — keskeneräiset ajatukset (yhteinen)
2. Listat — kauppalista ym., listakohtainen jako
3. Tehtävät — hoidettavat, Ankkurit ⚓ ylimpänä
4. Nostot — kodin huoltokirja + vuosikello
5. Ruoka — reseptipankki, viikkorytmi, hävikkivahti
6. Odottaa vastaustani — paluukyselyt
7. Muistiinpanot — elävät muistiinpanot

**Muistiinpanot (E8) — alustava ideahuomio (kirjattu 2026-07-08, EI suunniteltu tarkemmin, EI toteutettu):** Katrin huomio "muistiinpanot (=varasto)" viittaa siihen että tämä tuleva osio muistuttaa käyttötarkoitukseltaan nykyistä Varastoa (harvemmin tarvittava, elävä sisältö) — ei tarkoita että ne yhdistettäisiin samaksi tekniseksi ratkaisuksi, vaan on vertailukohta. Toivelistalla ainakin: **kopiointitoiminto** (rivin/koko muistiinpanon sisällön kopiointi leikepöydälle) ja **kuvasta tekstiksi** (OCR — esim. valokuva kuitista/lapusta muuttuu muokattavaksi tekstiksi). Katri pyysi myös yleisesti käymään läpi mitä Applen Notes (Muistiinpanot-appi) nykyään osaa ja poimimaan siitä sopivia ideoita tähän osioon ennen kuin sitä aletaan suunnitella tarkemmin — EI ole vielä tehty, tee tämä selvitys ENNEN kuin Muistiinpanot (E8) -osion tarkempaa speksausta aloitetaan.

---

## Tunnettuja asioita / historiaa

- Vercel-deployt vaativat `git config user.email = ylijaakkolak@gmail.com`
- Supabase Realtime vaatii Replication päällä tuotteet-taululle (jo tehty)
- PWA-välimuisti: service workerin cache-versio pitää bumppata kun tekee isoja muutoksia
- Poisto- ja checkmark-nappien `appearance: none; -webkit-appearance: none` tärkeä mobiililla
- `letter-spacing` lisää tilaa viimeisen merkin jälkeen → `text-indent` samalla arvolla korjaa h1:n ja subtitlen keskityksen optisesti
- Siri API jätetään tarkoituksella ilman autentikointia, vaikka muu sovellus vaatii kirjautumisen

**2026-07-06, Satama vaihe 1 -sessio:**
- Google-kirjautumisen redirect meni väärään osoitteeseen (`localhost:3000`) koska Supabasen Site URL / Redirect URLs -asetukset eivät sisältäneet Vercel-osoitetta — korjattava Supabasen dashboardista, ei koodista
- **Vakava DOM-valitsinbugi:** kun kotinäkymä (`home-view`) lisättiin HTML:ään ennen listanäkymää (`app-view`), rajaamattomat `document.querySelector('.add-item input')` ym. -haut osuivat vahingossa kotinäkymän elementteihin. Seuraus: Enter/+ eivät toimineet YHDELLÄKÄÄN listalla, myös Kauppalistalla, koska koko lisäysrivi ja itemlista renderöityivät piilotettuun kotinäkymän elementtiin. Korjaus: kaikki listanäkymän DOM-haut rajattava `#app-view`-kontekstiin. Opetus: kun UI:hin lisätään useita näkymiä samoilla CSS-luokilla, KAIKKI `document.querySelector`-haut pitää tarkistaa/rajata, ei vain uusia lisättäessä
- **FK-ansa listan poistossa (2026-07-06, REGRESSOITUI HILJAA ja korjattu uudelleen 2026-07-13, ks. alla "Bugikorjaus: Listan poisto ei toiminut"):** `events.list_id` viittaa `lists(id)` ilman ON DELETE -sääntöä → listan poisto epäonnistui heti kun sillä oli lokitapahtumia (aina, koska jo listan luonti kirjaa tapahtuman). Tuolloin korjattu sovelluskoodin poistojärjestyksellä (tuotteet → events → lists) — RIITTI SILLOIN, koska RLS ei ollut vielä käytössä. Kun RLS otettiin käyttöön (sql/003, samana päivänä myöhemmin) `events`-taululle EI KOSKAAN lisätty delete-policya (vain select+insert) — poistojärjestys pysyi oikeana koodissa, mutta events-poisto alkoi hiljaa epäonnistua RLS:n takia siitä lähtien, ja kukaan ei huomannut kuukausiin koska virhe meni vain konsoliin. Todellinen korjaus (policy + käyttäjälle näkyvä virhe) vasta 2026-07-13.
- Testausmenetelmä joka löysi molemmat yllä olevat bugit: Playwright + headless Chromium ajettuna oikeaa tuotanto-Supabasea vasten (samat anon-oikeudet kuin sovelluksella itsellään, koska RLS pois päältä), testidata siivottu jälkikäteen REST-kutsuilla. Pelkkä koodin lukeminen / staattinen analyysi ei olisi löytänyt kumpaakaan
- Kaksi eri ×-nappia sovelluksessa (listan poisto kotinäkymässä vs. tuotteen poisto listan sisällä) käyttävät samaa symbolia ja delete-btn-luokkaa — helposti sekoittuvat kun keskustellaan "×:stä" ilman tarkennusta kummasta puhutaan
- PWA:n service worker -välimuisti pitää bumpata JOKA KERTA kun index.html/style.css/script.js/icon.png muuttuu — unohtuu helposti, tuli vastaan monta kertaa tässä sessiossa (v4 → v9)

## Bugikorjaus: Listan poisto ei toiminut (löydetty ja korjattu 2026-07-13)

**Oire:** Katri yritti poistaa käsin luotua listaa ("jäätelökakku", Muistilaput) — vahvistusdialogi kysyi, hän hyväksyi, mitään ei tapahtunut. Toistettavissa, ei kertaluontoinen: sama tulos aiemminkin. Katrin pyynnöstä tutkittu `deleteList()`-ketju (tuolloin vielä `poistaLista()`, nimetty uudelleen samana päivänä myöhemmin — ks. "Koodikieli"-osio COPILOT.md:ssä) päästä päähän eikä vain oletettu regressioksi.

**Juurisyy (kaksi kerrosta):**
1. `deleteList()` (script.js) poistaa oikeassa FK-turvallisessa järjestyksessä: `tuotteet` → `events` → `lists` (sama järjestys jo kirjattu 2026-07-06, ks. "Tunnettuja asioita" yllä).
2. MUTTA `events`-taululla EI OLE KOSKAAN OLLUT delete-policya — vain `events_select` (sql/003/005/006) ja `events_insert` (sql/003). RLS on päällä, joten ilman delete-policya `db.from('events').delete()...` suodattaa POIS KAIKKI rivit hiljaa (0 riviä poistuu, EI virhettä — Postgresin RLS toimii näin: politiikan puuttuminen = ei näkyviä rivejä sille komennolle, ei poikkeusta). Koska events-rivi jää elämään, seuraava `lists`-rivin poisto KAATUU foreign key -rajoitteeseen (`events.list_id` viittaa yhä olemassa olevaan listaan) — TÄMÄ virhe tulee oikeasti Supabasesta ja `del3.error` sisälsi sen, mutta koodi teki vain `console.error(...)`, ei koskaan näyttänyt mitään käyttäjälle. **Käytännössä JOKAINEN appin kautta luotu lista** kaatuu tähän, koska jo listan luonti kirjaa `events`-rivin (`logEvent('created', ...)`) — bugi ei ollut jäätelökakku-listan erikoisuus, vaan universaali.

**Miksi tämä ei ollut regressio eilisestä:** tämä on itse asiassa SAMA bugi joka löydettiin ja "korjattiin" jo 2026-07-06 (ks. "Tunnettuja asioita" yllä) — mutta se korjaus (oikea poistojärjestys koodissa) riitti VAIN niin kauan kuin RLS ei ollut käytössä. Kun RLS kytkeytyi päälle myöhemmin samana päivänä (sql/003) ilman että `events`-taululle lisättiin delete-policya, sama bugi palasi HILJAA — kukaan ei huomannut kuukausiin, koska virhe ei koskaan näkynyt käyttöliittymässä.

**Rajattu erikseen (Katrin pyynnöstä):** yksittäisen RIVIN poisto (`poistaTuote()`) toimii ERI reittiä — se poistaa vain `tuotteet`-rivin (policy `tuotteet_all`, "for all", kunnossa) ja `muistutukset`-rivit (`muistutukset_delete_own`-policy, kunnossa) — EI koske `events`-tauluun poistavasti ollenkaan. **Yksittäisen rivin poisto ei siis kärsi tästä bugista**, vain KOKO LISTAN poisto.

**Korjaus, kaksi osaa:**
1. **`sql/039_events_delete_policy.sql`** — lisää puuttuvan `events_delete`-policyn, sama näkyvyysehto kuin `events_select`:llä (owns_list/list_visibility/is_list_member-apufunktiot, sql/005). Kuka tahansa joka näkee listan (omistaja/jaettu/jäsen) saa nyt myös poistaa sen tapahtumat — sama periaate kuin `tuotteet_all` jo antaa tuotteille.
2. **`deleteList()` (script.js) ei enää koskaan nielaise virhettä hiljaa.** Jokainen kolmesta poistovaiheesta (tuotteet/events/lists) tarkistetaan erikseen — jos JOKIN epäonnistuu, funktio PYSÄHTYY heti ja näyttää `naytaIlmoitus()`-toastilla selkokielisen suomenkielisen virheen (esim. "Listan poisto epäonnistui (tapahtumat): ... — kerro tämä Claudelle/Copilotille") sen sijaan että jatkaisi seuraaviin vaiheisiin tai palauttaisi näennäisen onnistumisen. Onnistunut poisto näyttää nyt myös vahvistavan "Lista poistettu" -toastin — aiemmin ei ollut MITÄÄN palautetta onnistuneestakaan poistosta, mikä osaltaan teki hiljaisesta epäonnistumisesta vaikeamman huomata.

**Opetus kirjattu:** hiljaa nielty virhe on pahempi kuin näkyvä virhe — tämä bugi söi käyttäjän luottamusta KAHDESTI (kaksi eri kertaa yritetty, molemmilla kerroilla "ei tapahdu mitään" ilman selitystä) ennen kuin sitä tutkittiin juureen asti sen sijaan että oletettaisiin ohimeneväksi kummallisuudeksi.

**EI TESTATTU vielä oikealla laitteella** — ks. PALUU.md.

## Pääsynhallinta (2026-07-07)

**Malli:** yksityinen oletuksena, tietoinen jako. `lists.visibility` = `'private'` (oletus, uusi lista syntyy AINA näin, ei valintaa luontihetkellä) tai `'shared'` (näkyy koko perheelle — käytännössä Katri + Juha). Jako tapahtuu listan asetuksista (🔒/⚓-nappi listanäkymän otsikkorivillä oikealla) — iOS-tyylinen vihreä kytkin, ei mitään muuta valintaa.

- Yhteisessä listassa KUKA TAHANSA näkevä saa lisätä/täpätä/muokata/poistaa RIVEJÄ. Vain listan omistaja hallinnoi listaa itseään (nimi, näkyvyys, poisto).
- Kolmansien osapuolten kutsuminen (`list_members` + kutsulinkki/koodi) EI kuulu E1:een — taulu ja RLS-policyt ovat valmiina sitä varten, mutta ei UI:ta eikä kutsulogiikkaa vielä.
- Backfill-periaate: kaikki jo olemassa olevat listat (Kauppalista, Siivouslista, Vuosikello) merkitään `visibility='shared'` migraatiossa 003, jotta mikään ei katoa Juhalta RLS:n kytkeytyessä.
- Sama näkyvyysperiaate tulee myöhemmin muihinkin osioihin: Laituri = aina yhteinen (ei kytkintä), Ruoka = aina yhteinen, Muistiinpanot (E8) = kuten listat (omat + jaetut), Hytti (opiskelu/työ-muistiinpanot, myöhempi osio) = aina yksityinen omistajalleen.
- **Testaa ehdottomasti molemmilla tileillä RLS:n käyttöönoton jälkeen:** yhteinen lista näkyy molemmille, yksityinen EI näy toiselle. Claude ei pysty testaamaan tätä itse (ei pääsyä kahteen oikeaan Google-tiliin).

## Laituri (2026-07-07, badge-semantiikka + luonnos-varmuusverkko korjattu 2026-07-10, äly-avustaja lisätty 2026-07-12)

Yhteinen "keskeneräisten ajatusten" muistilista, aina näkyvissä molemmille (ei näkyvyyskytkintä). Oma taulu `laituri` (id, user_id, content, status 'uusi'/'sijoitettu', placed_where, created_at). Kategorisointi ei poista riviä — se himmenee (`.laituri-row.sijoitettu`, `opacity:0.5`) ja saa merkinnän "→ [minne]". Tekstihaku `ilike`-kyselyllä, 250ms debounce. **✨-nappi** sijoittamattomilla riveillä kysyy äly-putkelta ehdotuksen mihin muru kuuluisi — ks. "Laituri-avustaja"-osio yllä täydelle kuvaukselle, EI toisteta tähän.

E1-versio on kevyt: yksi kenttä + tallennus, lista alle, ei vielä sijoitus-kohteen valintaa listasta (käytetään `prompt()`:ia "minne sijoitit" -kysymykseen). Voi tarkentaa myöhemmin.

**Kaksi ERI lukua, kaksi eri kysymystä.** Etusivun laatan pallura ja Laituri-näkymän sisäinen teksti vastaavat kahteen eri kysymykseen — älä sekoita niitä:
- **Etusivun pallura = "mitä TOINEN käyttäjä on jättänyt minulle, johon en ole vielä reagoinut"** — ks. "Huomiopallurat"-osio alempana täydelle kuvaukselle. (Historiaa: 2026-07-10 – 2026-07-13 tämä oli "mitä en ole vielä NÄHNYT" -laskuri, laitekohtainen localStorage-aikaleima (`satama_laituri_viimeksi_avattu`) joka nollautui pelkästä Laiturin avaamisesta. Korvattu 2026-07-13 Huomiopallurat-periaatteella, koska "nähty" ja "reagoitu" ovat eri asioita — pelkkä avaaminen ei ollut oikea nollaushetki.)
- **Laituri-näkymän sisäinen teksti (`#laituri-sijoittamatta`) = "mitä ei ole vielä KÄSITELTY"** — laskee edelleen KAIKKI `status='uusi'`-rivit (myös omat), riippumatta kuka ne on jättänyt, näkyy hakukentän alla tekstinä ("N sijoittamatta" / "kaikki sijoitettu"), päivittyy joka kerta kun `lataaLaituri()` ajetaan (myös hakusuodatuksesta riippumatta — laskee AINA kokonaismäärän, ei suodatettua listaa). Rivien oma tummennus (opacity 0.5) + "→ minne"-teksti näyttävät saman tiedon myös rivikohtaisesti.

**Laituri-luonnoksen varmuusverkko (2026-07-10, ks. Löydös 2 "Kahden puhelimen testisessio" -osiossa):** `laituri-input`-kentän sisältö tallentuu `localStorage`-avaimeen `satama_laituri_luonnos` joka näppäinpainalluksella ja palautuu kenttään aina kun Laituri-näkymä avataan (`palautaLaituriLuonnos()`), tyhjentyy onnistuneen lisäyksen jälkeen. Suojaa tilannetta jossa näytön kääntyminen (todennäköinen syy: iOS:n oma PWA-uudelleenlataus) tyhjentäisi kesken kirjoituksen olevan tekstin.

## Etusivu (2026-07-07, uudelleensuunniteltu; käynnistyskäyttäytyminen korjattu 2026-07-10)

Etusivu EI ole navigointivalikko vaan päivittäinen komentokeskus. Rakenne ylhäältä alas:

**Sovellus avautuu AINA Etusivulle (korjattu 2026-07-10).** Aiemmin `siirryKirjautumisenJalkeen()` (kutsutaan `db.auth.getSession()`/`onAuthStateChange`:sta kirjautumisen jälkeen) tarkisti `localStorage`-avaimen `kauppalista_viimeisin_lista` ja hyppäsi tarvittaessa SUORAAN viimeksi avattuun Muistilaput/Varasto-listaan Etusivun ohittaen — peräisin ajalta jolloin sovellus oli pelkkä yksittäinen kauppalista eikä Etusivu-käsitettä ollut vielä olemassa. Katrin havainto: enää tätä ei haluta, koska Etusivu (Ankkurit + Horisontissa + navigointiruudukko) on nyt sovelluksen todellinen aloitusnäkymä. Koko "muista viimeisin lista" -mekanismi (`LAST_LIST_KEY`, sen kirjoitus `avaaLista()`:ssa, poisto `poistaLista()`:ssa) poistettu kokonaan — `siirryKirjautumisenJalkeen()` kutsuu nyt suoraan `showHomeView(); lataaKotinakyma();`. Yksittäisen listan sisällä navigointi (esim. Muistilaput → jokin lista) toimii ennallaan, tämä koskee VAIN sovelluksen käynnistys-/kirjautumishetkeä.

1. **Otsikko + päivämäärä** (`paivitaPaivamaara()`, suomeksi, ei kellonaikaa/säätä — säätä ei tarkoituksella ole ollenkaan, ks. alkuperäinen visio "EI pysyvää sääruutua")
2. **Ankkurit** — päivän 3 tärkeintä, **henkilökohtaiset alkaen 2026-07-11** (ks. alla). Oma kevyt taulu `ankkurit` (content, done, sort_order, event_time, `source`/`source_ref`, `user_id`). Kysely `done=false AND user_id=oma order by sort_order limit 3` — kun yksi merkitään tehdyksi, seuraava nousee näkyviin ilman erillistä "ylennyslogiikkaa". Jos aktiivisia on yli 3, "+N muuta odottaa — näytä kaikki" -linkki laajentaa näkymän täyteen listaan jota voi raahata priorisoidakseen (sama yleistetty raahauslogiikka). Rivit voivat tulla kolmesta lähteestä (`source`-kenttä): `'manual'` (kirjoitettu suoraan), `'muistilaput'` (nostettu listan riviltä ⚓-napilla), `'kalenteri'` (nostettu kalenteritapahtumasta ⚓-napilla). `'hytti'` (nostettu Hytin tehtävästä ⚓-napilla) lisätty 2026-07-08.

**Ankkurit henkilökohtaiset alkaen 2026-07-11 (`sql/029_ankkurit_henkilokohtaiset.sql`).** Aiemmin ankkurit olivat KÄYTÄNNÖSSÄ yhteiset — `user_id`-sarake oli jo olemassa ja koodi kirjoitti sen oikein (`vaihdaAnkkurointiYleinen()`, manuaalilisäys), mutta MIKÄÄN lukukysely ei suodattanut sen mukaan ja RLS-policy (`ankkurit_all`) päästi kenet tahansa kirjautuneen näkemään/muokkaamaan kaikkia rivejä. Tämä esti Juhaa aloittamasta Sataman oikeaa käyttöä — hänen ⚓-nostonsa olisivat sotkeneet Katrin päivän agendan ja päinvastoin. Korjattu:
- Migraatio backfillaa mahdolliset NULL-`user_id`-rivit Katrin tunnisteelle, asettaa sarakkeen `not null` + FK-viittauksen `auth.users(id)`, ja jakaa vanhan "for all" -policyn erillisiksi select/insert/update/delete-policyiksi (kaikki `user_id = auth.uid()`).
- `script.js`: kaikki neljä lukukyselyä (`paivitaAnkkuroidutAvaimet()`, `lataaAnkkurit()`, kalenterin tänään-agendan ankkurihaku) saivat `.eq('user_id', currentUserId)`-suodattimen. `vaihdaAnkkurointiYleinen()`:n poisto-haara sai saman suodattimen, jottei sama `source`/`source_ref` (esim. kaksi käyttäjää nostaa saman kalenteritapahtuman) voi koskaan poistaa TOISEN käyttäjän ankkuria.
- `service_role` (Vercel-funktiot, tulevat "moottorit") ohittaa RLS:n kuten aina — ei vaatinut mitään erikoiskäsittelyä.

**Lähetys toiselle tulee myöhemmin odottavassa paketissa** — tietoisesti EI rakennettu nyt: (1) ankkurin lähettäminen toiselle käyttäjälle ("Katrilta"-merkintä neljäntenä rivinä + push-ilmoitus vastaanottajalle), (2) ristiriitalipun automaattiset ankkuriehdokkaat (`source='ristiriita'`, tulevaisuudessa kalenterin päällekkäisyysmerkistä nostettava ankkuri). Molemmat rakentuvat TÄMÄN henkilökohtaisen mallin päälle — kirjattu tänne ettei unohdu.
3. **Horisontissa** — "asiat jotka alkavat kaivata huomiota" (EI kalenterin erääntymislista). Toistaiseksi vain tyhjä tila (`#horisontissa-empty`), koska syöttävät järjestelmät (vuosikello, siivoussuunnitelma) eivät ole vielä älykkäitä. **Täysi toteutussuunnitelma valmiina** (tietomalli, mediaanilaskenta, ehdotuslogiikka, V1–V4-vaiheistus) omassa "Horisontti — suunnitelma"-osiossaan alempana, EI vielä toteutettu koodissa.
4. **Navigointiruudukko (2×3)**, data-ohjattu taulusta `home_sections` (key, name, icon, route, enabled, sort_order) — EI kovakoodattuja HTML-lohkoja, raahattavissa (sama yleistetty logiikka). Täyttöjärjestys: Laituri | Muistilaput / Varasto | Oma Hytti / Kalenteri / Asetukset. Kaikki kuusi laattaa ovat nyt toiminnallisia (`hytti` ja `asetukset` olivat pitkään "tulossa pian" -paikanpitäjiä, molemmat rakennettu 2026-07-08 — ks. "Oma Hytti"- ja "Push-ilmoitukset"-osiot).

**Tärkeä nimikkeistömuutos:** "Listat" ei ole enää oma käsitteensä — se on **Muistilaput**, oma näkymänsä, EI enää suoraan etusivulla. `lataaKotinakyma()` lataa vain etusivun; `lataaListatNakymaan(containerId, kategoria)` on yleinen funktio jota sekä Muistilaput (`lataaMuistilaput()`) että Varasto (`lataaVarasto()`) käyttävät eri `category`-suodatuksella. Navigointipolku: Etusivu → Muistilaput/Varasto → yksittäinen lista, ja listanäkymän takaisin-nuoli muistaa kummasta tultiin (`listanAvausLahde`).

Ankkurit/Horisontissa-otsikot ovat toistaiseksi kiinteitä koodissa (ei omaa data-riviä) — voidaan muuttaa muokattaviksi myöhemmin jos tarpeen, ei ole ison lisätyön takana.

## Varasto (2026-07-07)

Harvemmin tarvittavat listat (pakkauslistat, toistuvat pohjat) — käyttää TÄSMÄLLEEN samaa `lists`/`tuotteet`-rakennetta kuin Muistilaput, vain `category='varasto'` erottaa ne. Ei siis omaa taulua eikä omaa toiminnallisuutta — kaikki (rastitus, väliotsikot, jako, raahaus, ankkurointi) toimii identtisesti.

**Listan siirto Muistilaput ↔ Varasto:** listan omista asetuksista (🔒/👥-napin takana) "Siirrä Varastoon"/"Siirrä Muistilappuihin" -nappi vaihtaa `category`-kentän. Käyttötapaus: pakkauslista siirtyy Varastosta Muistilappuihin viikkoa ennen reissua kun siitä tulee aktiivisesti hoidettava asia, takaisin Varastoon kun reissu on ohi.

Esimerkkilistat siemennetty (010): Telttaretken pakkauslista, Viikon reissun pakkauslista (molemmat jaettuja, omistaja Katri). **Rivit jätettiin tietoisesti tyhjäksi tuolloin** (priorisointi) — **täytetty 2026-07-13** (`sql/037_telttaretki_pakkauslista_sisalto.sql`: 93 riviä, 6 väliotsikkoa; `sql/038_viikkopakkaus_sisalto.sql`: 38 riviä, ei väliotsikoita) Katrin toimittamasta luonnossisällöstä, joka löytyi lopulta Claude-keskustelusta (ei koskaan päätynyt tiedostoksi koneelle). Molemmat idempotentteja eri periaatteella kuin sql/036: täyttävät VAIN jos lista on tyhjä, EIVÄT poista/korvaa mitään olemassa olevaa. **Nimihuomautus:** sql/038:n kohdelistaksi annettu otsikko oli "Viikon pakkauslista leirikeskukseen", mutta tietokannassa listan nimi on edelleen "Viikon reissun pakkauslista" (sql/010) — migraatio hakee listan NYKYISELLÄ nimellä, kuvaavampi nimi pitää vaihtaa käsin ✎-napista jos halutaan, ei tehty automaattisesti.

**"Luo kopio" (2026-07-13):** listan asetuksissa (🔒/👥-napin takana, `#copy-list-btn`) uusi nappi joka monistaa koko listan (rivit + väliotsikot, `sort_order` säilyen) uudeksi ITSENÄISEKSI listaksi samaan kategoriaan — täpät ja ostoajat NOLLATTUINA (`tehty:false, bought_at:null`), kopio on aina uusi yksityinen lista (sama oletus kuin uutta listaa luodessa, `owner_id=currentUserId`, ei visibility-arvoa asetettu → oletus). Nimi kysytään `prompt()`:illa, valmiiksi ehdotettuna `"{alkuperäinen} (kopio)"`, muokattavissa ennen hyväksyntää; tyhjä/peruttu nimi ei tee mitään. Käyttötapaus: juhla-/kausipohjat (esim. "Joulun pakkauslista") pysyvät Varastossa koskemattomina mallipohjina, kopiosta tehdään sen kerran/vuoden elävä versio (joka voi sitten liikkua Varasto↔Muistilaput-napilla normaalisti). Ei rajattu vain Varasto-kategorian listoihin — sama nappi toimii identtisesti Muistilaput-listalla, koska mekanismi (kopioi rivit, nollaa täpät) on yhtä hyödyllinen kummassakin, eikä rajoitusta ollut syytä rakentaa. **EI TESTATTU.**

## Ruoka-välivaihe: "Siirrä valitut Kauppalistalle" (2026-07-13)

Listan sisällä (Muistilaput TAI Varasto, sama jaettu `#app-view` kummallakin) voi valita useita rivejä kerralla ja kopioida niiden nimet uusiksi riveiksi Kauppalistaan. Käyttötapaus: reseptilista Varastossa → puuttuvat ainekset Kauppalistalle yhdellä eleellä, resepti pysyy Varastossa käytettävissä seuraavallakin kerralla.

**Miksi ei pitkä painallus:** listan rivit käyttävät jo pitkää painallusta raahausjärjestyksen aloittamiseen (`alustaRaahaus()`) — sama ele olisi ristiriidassa valintatilan kanssa (kumpi voittaisi, raahaus vai valinta?). Sen sijaan kevyt erillinen tila: otsikkorivin uusi ☑-nappi (`#valinta-toggle-btn`, listan asetusten 🔒-napin vieressä, samassa `.list-header-actions`-flex-konttissa) kytkee valintatilan päälle/pois.

**Toteutus (`script.js`):**
- `valintatilaPaalla` (boolean) + `valitutTuoteIdt` (Set, tuotteet.id) — moduulitason tila, nollautuu aina uutta listaa avattaessa (`avaaLista()` kutsuu `poistuValintatilasta()`).
- Valintatilassa jokainen ei-otsikkorivi saa oman `<input type="checkbox" class="valinta-checkbox">`-elementin ENNEN tavallista ✓/○-täppäysnappia — ERI elementti kuin "tehty"-täppäys, joten kumpaakin voi käyttää samaan aikaan sekoittamatta niitä keskenään. Valittu rivi saa `.valinta-valittu`-korostuksen (`--border`-tausta).
- Palkki (`#valinta-palkki`) ilmestyy listan alle vain valintatilan ajaksi: "N valittu" + [Peruuta] [Kauppalistalle] -napit. "Kauppalistalle" on pois käytöstä (`disabled`) kun mikään ei ole valittuna.
- "Kauppalistalle"-nappi hakee Kauppalista-listan `id`:n NIMELLÄ (`lists.name = 'Kauppalista'`) — SAMA hakutapa jota `api/add.js` (Siri-integraatio) jo käyttää, ei uutta tunnistetta. Kopioi valittujen rivien `nimi`-kentät uusiksi `tuotteet`-riveiksi Kauppalistaan (`tehty:false, is_header:false`) — **KOPIOI, EI SIIRRÄ/POISTA** alkuperäisestä listasta, sama periaate kuin "Luo kopio" -napissa (ks. "Varasto"-osio yllä): reseptilista on uudelleenkäytettävä pohja, ei kertakäyttöinen.
- ☑-nappi PIILOTETAAN Kauppalista-listalla itsellään (`lista.name === 'Kauppalista'`) — ei järkeä kopioida Kauppalistan rivejä Kauppalistalle.
- Ei uutta taulua, ei migraatiota — pelkkä UI+kysely, kevyin toimiva toteutus pyydetyn mukaisesti.

**EI TESTATTU.**

## Pakkauslistan automaattinollaus (2026-07-08)

Kun minkä tahansa listan (Muistilaput TAI Varasto, sama `tuotteet`-rakenne) nimessä on sana "pakkauslista" missä tahansa muodossa (isot/pienet kirjaimet ei väliä, sana voi olla osana pidempää nimeä kuten "Telttaretken pakkauslista") JA käyttäjä täppää listan viimeisenkin rivin valmiiksi niin että KAIKKI ei-otsikkorivit ovat nyt `tehty=true`, lista nollautuu automaattisesti n. 1,5 sekunnin kuluttua takaisin tyhjäksi (`tehty=false`, `bought_at=null` kaikilla riveillä). Käyttötapaus: pakkauslistaa käytetään uudelleen joka reissulla, ei haluta täpätä kaikkea auki käsin ennen seuraavaa matkaa.

**Toteutus (`script.js`):**
- `naytaIlmoitus(teksti)` — yleiskäyttöinen, itsestään katoava ilmoitusbanneri ruudun alareunassa (`.toast`-luokka, kuitti-tyylinen). Ensimmäinen kerta kun tällainen "toast"-mekanismi on lisätty sovellukseen — voi käyttää myöhemminkin muualla, ei sidottu pakkauslistoihin.
- `tarkistaPakkauslistanNollaus()` — kutsutaan `checkNappi`:n click-handlerista (listan tuoteriveillä, `#app-view`) HETI kun `lataaLista()` on ehtinyt päivittää `cachedTuotteet`:n tuoreella datalla. Tarkistaa nimiehdon (`currentList.name.toLowerCase().indexOf('pakkauslista') !== -1`) ja että kaikki ei-otsikko (`is_header=false`) rivit ovat `tehty=true`. Jos molemmat ehdot täyttyvät: näyttää ilmoituksen, odottaa 1500ms (`setTimeout`), sitten päivittää KAIKKI listan rivit kerralla (`.update({tehty:false, bought_at:null}).in('id', idt)`).
- **Tarkoituksellinen suunnitteluvalinta:** laukaisu tapahtuu VIIMEISEN TÄPÄN PAINANEEN käyttäjän omassa selaimessa/koodipolussa, EI Realtime-kuuntelijana. Jos nollaus laukeaisi Realtime-tapahtumasta, KAIKKI avoinna olevat laitteet/välilehdet (myös toisen perheenjäsenen) yrittäisivät nollata saman listan samaan aikaan, ja käyttäjä voisi nähdä nollauksen tapahtuvan laitteellaan ilman että hän itse teki mitään sillä hetkellä. Nyt nollaus tapahtuu vain sen yhden käyttäjän toimesta joka fyysisesti täppäsi viimeisen rivin.
- **Rajaus:** toimii vain, kun laite on online (`navigator.onLine`) — offline-jonon kautta tehty viimeinen täppäys ei laukaise nollausta, koska nollauksen DB-kirjoitus vaatisi oman jonologiikkansa eikä sitä ole toteutettu. Realistisesti pakkauslistaa täytetään kotona verkon kanssa, joten tätä ei pidetty tärkeänä rajoittaa enempää.
- Väliotsikkorivit (`is_header=true`) EIVÄT lasketa mukaan "onko kaikki täpätty" -tarkistukseen eivätkä nollaudu (niillä ei ole checkboxia ollenkaan).

## Kalenteri (2026-07-07, iCloud-synkka lisätty 2026-07-08, kuukausiruudukko + monipäiväiset tapahtumat lisätty 2026-07-08 illalla)

Oma sisäinen kalenteri Satamassa. Taulu `kalenteri_tapahtumat` (title, event_date, event_time — ei timestamptz, ei aikavyöhykemonimutkaisuutta; `syote_id`/`ical_uid`/`event_end_time` lisätty 014:ssä, `event_end_date` lisätty 018:ssa, ks. "Kalenterisyötteet"- ja "Monipäiväiset tapahtumat"-osiot alla).

- **Kolme näkymää** (`kalenteriTila`: 'paiva'/'viikko'/'kuukausi'). Päivä ja viikko ovat agenda-tyylisiä listoja (EI ruudukkoa — sopii kapealle puhelinnäytölle paremmin). **Kuukausi on 2026-07-08 illasta lähtien OIKEA 7-sarakkeinen ruudukko** (maanantai ensin, täydennetty edellisen/seuraavan kuukauden päivillä täysiin viikkoihin) — ks. oma kappale alla.
- Päivänäkymässä voi lisätä tapahtumia; viikko on selailunäkymä joka ryhmittää päivän mukaan
- ‹ › -napit siirtävät edelliseen/seuraavaan päivään/viikkoon/kuukauteen. **Kuukausiruudukon minkä tahansa päivän napautus avaa sen päivän päivänäkymän** — ainoa tapa muokata/poistaa/ankkuroida yksittäisiä tapahtumia kuukausinäkymästä käsin, koska ruudukon solu on liian pieni omille napeille
- **Vaakatilan CSS** (ei JS-pakotus): viikkonäkymä näyttää 7 pystysaraketta rinnakkain vaakatilassa (`@media (orientation: landscape)`, `grid-template-columns: repeat(7, 1fr)`), kuukausi käyttää samaa `#kalenteri-view`-leveyskasvua koska se on jo pystyasennossakin ruudukko. Käyttäjän pitää itse kääntää puhelin — **iOS Safari ei tue `screen.orientation.lock()`:ia**, joten automaattista per-näkymä-suunnanlukitusta ei voi toteuttaa luotettavasti (tunnettu, pitkäaikainen WebKit-puute)
- **Yhdistetty tänään-agenda:** kun päivänäkymässä katsotaan TÄTÄ päivää, näkyvät sekä oikeat kalenteritapahtumat että kaikki aktiiviset (done=false) ankkurit että Oma Hytin tänään erääntyvät tehtävät yhdessä, ajan mukaan järjestettynä (`jarjestaAjanMukaan()`, ei-ajalliset viimeisenä). Muut päivät näyttävät vain oikeat tapahtumat. Kalenteritapahtumilla on oma ⚓-nappi joka nostaa/poistaa ne Ankkureihin samalla `vaihdaAnkkurointiYleinen()`-mekanismilla kuin Muistilaput-rivit

### Monipäiväiset tapahtumat (lisätty 2026-07-08 illalla, `sql/018_kalenteri_monipaivainen.sql`)

**Havainto/pyyntö:** yön-yli-tapahtuma (esim. "lapsen loma", viikon mittainen) näkyi ennen vain pallukkana/tekstirivinä sen ALKUPÄIVÄNÄ, koska `kalenteri_tapahtumat`-taulussa oli vain yksi `event_date`-sarake — tapahtuman todellinen loppupäivä katosi jo tuonnissa (`event_end_time` tallensi vain kellonajan, ei päivää).

- **`kalenteri_tapahtumat.event_end_date`** (nullable date) — NULL = tavallinen yksipäiväinen tapahtuma (valtaosa). Kun asetettu ja eri kuin `event_date`, tapahtuma kattaa koko sen välin päivineen molempine päineen mukaan lukien. Sama sarake lisätty myös `kalenteri_odottavat`-tauluun (hyväksyntäjono).
- **`api/caldav-sync.js`** laskee tämän jo tuontivaiheessa `event.endDate`:stä (sekä kertaluontoisille että jokaiselle toistuvan tapahtuman esiintymälle erikseen, koska esiintymän oma kesto lasketaan `event.duration`:sta) — EI vaadi mitään UI-muutosta käsin lisätyille tapahtumille (ne pysyvät aina yksipäiväisinä, `kalenteri-add-btn` ei aseta `event_end_date`:a, koska pyyntö koski nimenomaan iCalista kopioituvia tapahtumia, ei Satamassa itse luotuja).
- **`script.js`: `tapahtumaKattaaPaivan(t, isoPaiva)`** — yleinen apufunktio joka päättää kattaako tapahtuma annetun päivän (`event_date`...`event_end_date`, ISO-merkkijonot vertailukelpoisia sellaisenaan). KAIKKI kolme näkymää (päivä/viikko/kuukausi) käyttävät tätä saman tapahtuman näyttämiseen JOKAISENA päivänä jonka se kattaa, ei vain `event_date`-päivänä.
- **Hakupuskuri:** koska päivä-/viikkonäkymä saattaa näyttää päivän joka on ennen jonkin monipäiväisen tapahtuman `event_date`:a (mutta silti tapahtuman kattama), haku hakee `MONIPAIVAINEN_PUSKURI_PV = 60` päivää taaksepäin näkyvän välin alusta — reilusti mitoitettu, ei tarkkuutta vaativa turvamarginaali, ei mikään tarkka bisneslogiikan raja. Tarkka näyttörajaus tehdään aina asiakaspuolella `tapahtumaKattaaPaivan()`:lla riippumatta siitä kuinka paljon dataa haettiin.
- **Kuukausiruudukon palkit:** monipäiväinen tapahtuma EI toistu pallukkana joka päivässä, vaan näkyy yhtenäisenä värillisenä palkkina (`kalenteri_syotteet.vari` tai `var(--accent)`) jokaisen kattamansa päivän solun yläosassa, teksti näkyy vain palkin ensimmäisessä näkyvässä ruudussa (joko todellinen alkupäivä tai kyseisen viikon maanantai jos tapahtuma alkoi jo edellisellä viikolla). Päällekkäisten monipäiväisten tapahtumien pystysijainti ("linja") lasketaan `laskeViikonLinjat()`:lla AHNEELLA aikavälialgoritmilla — **erikseen JOKA VIIKOLLE**, ei koko kuukaudelle kerralla, jotta viikot joilla ei ole päällekkäisyyksiä eivät varaa turhaa tyhjää tilaa. Tietoinen, dokumentoitu epätarkkuus: sama tapahtuma voi teoriassa saada eri linjan eri viikoilla — ei haittaa, koska pyyntö oli nimenomaan "ei tarvii mitää mm tarkkuutta mut vähän sinnepäin".
- **Ei tehty / tietoisesti rajattu:** käsin lisätyille tapahtumille ei UI:ta usean päivän valintaan, tarkkaa tuntimäärän mukaista palkin pituutta (vain kokopäivän ruutu per kattama päivä, ei osapäivän murto-osaa), palkkien raahausta/venytystä.
- **Ei testattu vielä oikealla datalla** — testaa seuraavan kerran kun `sql/018_kalenteri_monipaivainen.sql` on ajettu ja kalenterissa on/synkataan oikea monipäiväinen tapahtuma, ks. "Testattavaa seuraavaksi".

## Kalenterin periaate: yksi totuus, kaksi ikkunaa (kirjattu 2026-07-08 illalla, Katrin arkkitehtuuripäätös)

**HUOM tämä osio korvaa/päivittää "Kalenterisyötteet"-osion (alla) monilta osin.** Kalenterisyötteet-osiossa on runsaasti historiallista kontekstia (mode='taysi' oli ennen hyväksyntäportti, ei enää) jota EI ole käyty läpi rivi riviltä — jos joku kohta tuntuu ristiriitaiselta tämän osion kanssa, TÄMÄ osio on ajantasainen totuus.

**Periaate:** iPhonen Kalenteri ja Sataman kalenteri ovat kaksi IKKUNAA samaan kokonaisuuteen — niiden pitää AINA näyttää sama. Koko suunnittelu tämän ehdolla, kahdessa osassa:

### 1. Yksi koti per asia

- **Tapahtumat** (menot, tapaamiset): koti on iCloud. Muokkaus ja lisäys AINA iPhonen Kalenterissa. **Satama EI KOSKAAN kirjoita iCloudiin** — kaksisuuntaista synkkaa ei rakenneta, ei nyt eikä myöhemmin. Tämä on tietoinen, pysyvä päätös (ei väliaikainen rajaus): yhden kodin mallissa kaksisuuntaisuutta ei tarvita, ja se lisäisi valtavasti monimutkaisuutta (konfliktien ratkonta, kirjoitusoikeudet CalDAV:iin) vastineeksi hyödystä jota ei ole.
- **Sataman omat aikasidonnaiset** (muistutukset, ankkurit, Hytin deadlinet): koti on Satama. Luodaan ja muokataan aina Satamassa.

### 2. Hyväksyntäjono → kuittausjono

**Vanha malli (ennen 2026-07-08 iltaa) rikkoi "yksi totuus" -periaatteen:** `mode='taysi'`-syötteen tapahtuma meni `kalenteri_odottavat`-jonoon ja pysyi POISSA agendasta kunnes käsin hyväksyttiin — jolloin iPhonen Kalenteri näytti tapahtuman mutta Satama ei, ja "Hylkää" ei tehnyt mitään iCloudin päässä (pysyvä, korjaantumaton ero syntyi jos kukaan ei koskaan hyväksynyt/hylännyt).

**Uusi malli:**
- **KAIKKI synkatut tapahtumat kirjoitetaan SUORAAN `kalenteri_tapahtumat`-tauluun**, näkyvät agendassa välittömästi. `mode` (`'taysi'`/`'vain_varattu'`) vaikuttaa VAIN siihen riisutaanko tapahtuman tiedot (ks. "Kalenterisyötteet"-osio) — EI enää siihen näkyykö tapahtuma ollenkaan.
- Toisen käyttäjän lisäämä tapahtuma saa **"uusi"-merkinnän** (badge "N uutta", pieni "uusi"-tagi agendan rivillä) kunnes se **KUITATAAN**.
- **Kuittaus = "nähty", EI portti.** Kuittaus ei koskaan poista tapahtumaa eikä muuta sen sisältöä — se on puhtaasti "olen huomannut tämän" -loki per käyttäjä. EI Hylkää-nappia: jos tapahtuma on väärässä kalenterissa, se SIIRRETÄÄN iPhonen Kalenterissa, ja Satama peilaa muutoksen seuraavassa synkassa (ks. peilisääntö alla).
- **"Kuittaa kaikki"** -nappi kuittaa kaikki näkyvillä olevat uudet kerralla.
- Tietokanta: `kalenteri_kuittaukset` (ical_uid, user_id, kuitattu_at) — per-käyttäjä loki. `kalenteri_odottavat` on käytöstä poistunut (EI pudotettu tietokannasta, jätetty inertiksi), ei enää kirjoiteta eikä luettu. Ks. `sql/021_kalenteri_kuittausjono.sql`.

### 3. Tekijän tunnistus

`kalenteri_tapahtumat.user_id` kertoo KUKA Satama-käyttäjä loi tapahtuman (samaa sarakettahan käyttää myös käsin lisätty tapahtuma — `kalenteri-add-btn` asettaa sen aina). Synkatulle tapahtumalle tämä ratkaistaan tapahtuman ICS-`ORGANIZER`-kentästä uuden **`kalenteri_tekijat`**-taulun (organizer_tunniste -> user_id, Table Editor -täytettävä, "data ei koodia" -periaate) kautta.

**EI TIEDOSSA KIRJOITUSHETKELLÄ toimiiko tämä oikeasti jaetuissa iCloud-perhekalentereissa** — henkilökohtaisilla kalenterimerkinnöillä (ei kokousta, ei kutsuttuja) ORGANIZER-kenttää ei iCalendar-standardin mukaan välttämättä ole ollenkaan, koska se on alunperin kokousten kutsu/vastaus-mekanismin (iTIP) kenttä, ei "kuka omistaa tämän kalenterimerkinnän" -kenttä. Katrin oma ohje: **"testaa oikealla datalla, jos EI toimi käytä kevyttä varasuunnitelmaa."**

**Varasuunnitelma (rakennettu jo valmiiksi, aktiivinen oletus):** jos organizeria ei löydy `kalenteri_tekijat`-kartasta, `user_id` jää NULLiksi → tapahtuma näkyy "uutena" KAIKILLE käyttäjille (ei vain toiselle). Tämä ON turvallinen ja toimiva lopputulos jo sellaisenaan, EI vaadi mitään organizer-tunnistusta toimiakseen — "Kuittaa kaikki" tekee siitä kivuttoman käytännössä (yksi napautus per käynti, jos jompikumpi on lisännyt jotain).

**Testaustapa ilman koodimuutosta:** `GET /api/caldav-sync?esikatsele=1` (Vercel-osoitteella) hakee+jäsentää kaikki aktiiviset syötteet ja palauttaa JSON:ina `{syote, tapahtumat: [{title, event_date, organizer, uid}]}` — EI KIRJOITA MITÄÄN tietokantaan. Jos `organizer`-kenttä on aina `null` tuloksessa (todennäköinen lopputulos henkilökohtaisille kalenterimerkinnöille), tekijätunnistus ei ole käytettävissä ja varasuunnitelma on pysyvä ratkaisu, ei väliaikainen. Jos organizer-arvoja LÖYTYY (esim. sähköpostiosoite tai `urn:x-uid:...`-tunniste), lisää löydetyt arvot `kalenteri_tekijat`-tauluun (Table Editorista, `organizer_tunniste` = tarkalleen se arvo, `user_id` = oikean Satama-käyttäjän auth-tunniste — Katrin oma on `d646881e-0ab8-4351-aae1-3e92678c8432`, ks. sql/003) — EI vaadi koodimuutosta, seuraava synkka alkaa käyttää sitä automaattisesti (myös taannehtivasti olemassa oleville riveille, koska kirjoitus on `merge-duplicates`-upsert).

### 4. Peilisääntö: muutokset ja poistot

**Aiemmin puuttui kokonaan** — synkka vain LISÄSI uusia tapahtumia (`ignore-duplicates`: jos sama `ical_uid` oli jo tietokannassa, ei tehty mitään, EI PÄIVITETTY vaikka iCloudissa oleva tieto olisi muuttunut), ja poistoja ei havaittu ollenkaan (jos tapahtuma poistettiin iCloudista, se jäi ikuisesti Satamaan). Molemmat korjattu `api/caldav-sync.js`:ssä 2026-07-08 illalla:

- **Muutos:** kirjoitus käyttää `Prefer: resolution=merge-duplicates` (ei enää `ignore-duplicates`) — sama `ical_uid` PÄIVITTÄÄ olemassa olevan rivin kaikkine kentineen (otsikko, aika, `user_id`) jokaisella synkkauksella.
- **Poisto:** `siivoaPoistetut(syoteId, alkuPvm, loppuPvm, nahdytUidit)` — per syöte, joka synkkauskerta: hakee olemassa olevat `kalenteri_tapahtumat`-rivit SAMALTA syötteeltä SAMALTA tarkistetulta aikaväliltä, ja poistaa ne joiden `ical_uid` EI löytynyt tällä kertaa haetusta datasta. Rajattu tarkistettuun aikaväliin (ei koko historiaan) — rivi jonka päivä on puskurin ulkopuolella säilyy koskemattomana, koska sitä ei tällä kertaa edes yritetty hakea (ei tulkita poistoksi).
- **Ei kata:** jos tapahtuma SIIRRETÄÄN iCloudissa niin kauas ettei kumpikaan (vanha eikä uusi päivä) ole enää hakuikkunan (`PAIVIA_TAAKSEPAIN`/`PAIVIA_ETEENPAIN`) sisällä, se ei päivity eikä poistu — tietoinen, matalan riskin rajoitus (12 kk ikkuna kattaa käytännössä kaiken relevantin).

### 5. ICS-julkaisu Sataman omalle datalle (SUUNNITELMA, EI TOTEUTETTU — Copilot-aikaan, ei kiire ennen työkalenterin ICS-integraatiota)

Idea: `/api/kalenteri.ics?avain=PITKÄ_SATUNNAINEN_MERKKIJONO` palauttaisi ICS-muotoisen syötteen Sataman OMISTA aikasidonnaisista (muistutukset, myöhemmin Hytin deadlinet, ja aikanaan työkalenterin `vain_varattu`-palkit) — molemmat käyttäjät tilaisivat tämän omaan iPhonen Kalenteriinsa (Asetukset → Kalenteri → Tilattu kalenteri). Tarkoitus: Sataman puoli näkyisi MYÖS iCalissa, jolloin mikään ei jäisi vain toiseen ikkunaan — täydentäisi "yksi totuus, kaksi ikkunaa" -periaatteen molempiin suuntiin (nyt vain iCloud→Satama, tämä lisäisi Satama→iCloud-näkyvyyden LUKUsuuntaan, ei kirjoitussuuntaan — pysyisi silti aina yksisuuntaisena pull/julkaisu-pareina, ei koskaan kaksisuuntaisena synkkana samalle datalle). `avain`-parametri (ei kirjautumista, koska iOS:n "tilattu kalenteri" -toiminto ei tue autentikointia) toimisi salaisuutena URL:ssa, riittävä tälle uhkamallille (ei arkaluontoista tietoa, vain kalenterimerkintöjä). EI kiire — kirjattu talteen ettei unohdu, rakennetaan kun oikea työkalenteri-integraatio tulee ajankohtaiseksi.

## Kalenterin merkkikieli (kirjattu 2026-07-10, testipalautteesta)

Kolmiportainen väriperiaate KAIKILLE kalenterin päivätason merkeille (Kuormavahti, päällekkäisyysmerkki, tuleva "keskustellaan"-lippu) — sovi tähän ENNEN kuin lisäät uuden merkin, älä keksi uutta sävyä:

- **KULTA / `--accent`** = neutraali tieto. Ei vaadi reaktiota, vain kertoo jotain ("uusi"-tagi, kuittaukset, tuleva "keskustellaan"-lippu).
- **MERIPIHKA / `--huomio`** (lämmin oranssi) = huomaa tämä. Raskas mutta täysin mahdollinen tilanne (Kuormavahti: täysi päivä). EI KOSKAAN syyllistävä sävy/teksti.
- **PUNAINEN / `--vaara`** = mahdotonta, vaatii reaktion. **Varattu YKSINOMAAN päällekkäisyysmerkille** — se on ainoa tilanne joka on aidosti mahdoton (ei voi olla kahdessa paikassa yhtä aikaa). Punaista EI käytetä koskaan kuormalle tai myöhästymisille — se pitäisi tuntua faktan toteamiselta, ei syyttämiseltä.

**Yhtenäinen komponentti:** kaikki päivätason merkit jakavat saman CSS-pohjan `.paiva-merkki` (+ `--kuorma`/`--ristiriita`/`--keskustellaan`-sävymodifikaattori), ks. style.css. Kuukausiruudukko on liian pieni täydelle tekstipillerille — siellä sama väriohjaus tiivistyy pieneksi pisteeksi päivänumeron viereen (`.kalenteri-kuukausi-piste--*`), dokumentoitu tietoinen poikkeus "yhtenäisyys"-vaatimukseen tilanpuutteen vuoksi.

## Kuormavahti (2026-07-08 illalla; näkyvyys+kokoparannettu 2026-07-10)

Automaattinen, neutraali varoitusmerkki päivälle jolla on paljon menoja — tarkoitus huomata kuormittunut päivä ETUKÄTEEN kalenteria selatessa, ei vasta sitä päivää elettäessä.

**Yleinen `asetukset`-avainarvotaulu (`sql/023_asetukset.sql`):** `key text primary key, value text, updated_at`. Tarkoituksella yleiskäyttöinen — EI vain Kuormavahdille, myös Ristiriitamerkin rauhoitettu ikkuna (ks. alla) käyttää samaa taulua. Ensimmäinen rivi: `paivan_menoraja = '5'`. `value` on aina text, koodi tulkitsee (`parseInt`/`JSON.parse` tarpeen mukaan) — ei erillisiä sarakkeita eri tyypeille tässä mittakaavassa. RLS: `for all using (auth.uid() is not null)`, sama yksinkertainen malli kuin `kalenteri_syotteet`.

**Laskenta (`script.js`):**
- `paivitaAsetukset()` hakee koko `asetukset`-taulun kerran per Kalenteri-näkymän lataus välimuistiin (`asetuksetKartta`), `haeAsetusNumero(key, oletus)`/`haeAsetusTeksti(key, oletus)`/`haeAsetusJSON(key, oletus)` lukevat ja parsivat sen tarvittavaan muotoon.
- `laskeMenoja(rivit)` laskee KELLONAIKAAN SIDOTUT tapahtumat annetulta riviltä (`event_time` asetettu) — koko päivän tapahtumat (synttarit, liputuspäivät) EIVÄT kerrytä, koska niillä ei ole `event_time`:a. **Ankkurit ja Hytin tehtävät EIVÄT myöskään kerrytä** — tietoinen tulkinta: Kuormavahti mittaa kalenterin (kiinteiden ulkoisten menojen) kuormaa, ei omia tehtävälistoja, vaikka ne näkyvät samassa agendassa (`laskeMenoja` suodattaa `_tyyppi === 'ankkuri'`/`'hytti'` pois).
- Ei uutta taulua laskennalle — lasketaan aina suoraan siitä agendadatasta joka on jo haettu näyttöä varten (`lataaKalenteri()`).

**Näkyvyys (korjattu 2026-07-10 — Katrin testipalaute: aiempi `.kalenteri-kuorma-merkki` "⚑ N" oli liian huomaamaton, "miköhän turhakuvio", ja puuttui kokonaan kuukausinäkymästä):**
- Päivä- ja viikkonäkymässä: `#kalenteri-otsikko`/`.kalenteri-paiva-otsikko` saa perään isomman, itsensä selittävän pillerin — teksti "N menoa" (ei enää pelkkä lippusymboli), meripihka/`--huomio`-väri, ks. `paivitaPaivanOtsikko()` ja `luoPaivaMerkki()`.
- **Kuukausiruudukko saa nyt MYÖS merkin** (aiemmin puuttui kokonaan — juuri se näkymä jossa tulevaa silmäillään): pieni meripihkanvärinen piste päivänumeron vieressä (`.kalenteri-kuukausi-piste--kuorma`) jos päivän kellonaikamenojen määrä ≥ raja. Jos päivällä on SEKÄ kuorma ETTÄ ristiriita, näytetään vain ristiriitapiste (vakavampi, ei molempia yhtä aikaa pienessä ruudussa).
- Tyyli: `.paiva-merkki--kuorma` (dashed-reunus, meripihka teksti, EI täytetty tausta, EI punaista, EI syyllistävää tekstiä) — ks. "Kalenterin merkkikieli" yllä.

**Asetukset-näkymä:** "🚦 Kuormavahti" -osio (`#kuormaraja-input`, numerokenttä, `min=1`). Tallentuu `asetukset`-tauluun `change`-tapahtumassa (ei jokaisesta näppäinpainalluksesta) — **YHTEINEN koko perheelle** (ei laitekohtainen `localStorage`, toisin kuin Hytti-kalenteri-kytkin), koska kyse on kalenterin yhteisestä kuormasta jonka molempien pitää nähdä samana.

**Kuittausjono-kytkös:** `avaaKuittausOverlay()` laskee JOKA RIVILLE (kun overlay avataan, ei synkkauksen aikana palvelimella) kuinka monta MUUTA kellonaikamenoa samalla `event_date`:llä on (`laskeMuutaMenoaPaivalle()`, yksi kysely per rivi, rinnakkain `Promise.all`:lla — pieni perhemittakaavan taulu, ei suorituskykyongelmaa). Jos määrä ≥ raja, kortille lisätään pieni huomiorivi `"huom: päivällä jo N muuta menoa"` (`.kalenteri-kortti-kuorma`, accent-väri). **Tietoinen suunnittelupäätös:** laskettu AINA TUOREENA overlayn avaushetkellä, ei tallennettu synkkaushetken tilaa erikseen.
- **Ei estämistä, ei lisäyshetken varoitusta:** lisäys tapahtuu iCalissa jota Satama ei voi keskeyttää — vahti toimii pelkän näkyvyyden kautta.

**Testitulos 2026-07-10:** ❕-merkki ei näkynyt testipäivälle 11.7. vaikka päivällä oli 6 menoa — todennäköinen syy: testimenot lisätty ilman kellonaikaa (koko päivän tapahtumat eivät kerrytä, tarkoituksellista). Testaa uudelleen KELLONAIKAAN sidotuilla tapahtumilla. Uuden ison pillerin ja kuukausinäkymän pisteen toimivuutta ei ole vielä testattu oikealla laitteella.

## Ristiriitamerkki (kirjattu ja toteutettu 2026-07-10, ks. "Kalenterin merkkikieli" yllä)

Kaksi kellonaikaan sidottua tapahtumaa menevät päällekkäin samana päivänä — ainoa merkki jolla on lupa käyttää punaista (`--vaara`/`--vaara-ground`), koska se on ainoa AIDOSTI MAHDOTON tilanne kalenterissa.

**Kenen kalenterista tapahtuma tuli — `kalenteri_syotteet.henkilo` (`sql/024_kalenteri_ristiriita.sql`):** uusi nullable sarake, `NULL` = jaettu perhekalenteri, `'katri'`/`'juha'` = henkilön OMA henkilökohtainen kalenteri. Olemassa olevat 3 syöterivia (sql/019) päivitetty: "Perhekalenteri" pysyy NULL:na, "Katri"→`henkilo='katri'`, "Juha"→`henkilo='juha'`. **Miksi oma sarake eikä nimivertailu** ("jos tunniste === 'Perhekalenteri'"): nimivertailu olisi hauras/kovakoodattu — data ratkaisee, ei koodi, sama periaate kuin `kalenteri_tekijat`-taulussa.

**Kolme sääntöä (`paallekkaisyysVakavuus(a, b, isoPvm)`, script.js):**
1. **Saman syötteen (`syote_id`) sisäinen päällekkäisyys → merkki AINA**, myös rauhoitetun ikkunan aikana (Poikkeus A, ei koskaan hiljennettävissä).
2. **Kaksi ERI henkilön OMAA henkilökohtaista kalenteria** (esim. Katri-kalenterin meno vs. Juha-kalenterin meno, `henkilo` eri) **→ EI KOSKAAN automaattimerkkiä**, ei edes rauhoitetun ikkunan ulkopuolella — kaksi aikuista, kaksi paikkaa on normaalia. Tuleva "keskustellaan"-lippu (kulta, EI vielä toteutettu) on tarkoitettu juuri näille tapauksille, ei tämä merkki.
3. **Kaikki muu** (jaettu perhekalenteri mukana kummalla puolella tahansa, TAI käsin lisätty tapahtuma jolla ei ole syötettä/henkiloa) **→ merkitään, PAITSI rauhoitetun ikkunan aikana** (ks. alla).

**Käsin lisätyt tapahtumat** (ei `syote_id`, ei `henkilo`) osuvat oletuksena sääntöön 3 (suodatettavissa rauhoitetulla ikkunalla) — tietoinen yksinkertaistus. Kaksi käsin lisättyä, saman ihmisen tekemää päällekkäistä merkintää VOISI teoriassa jäädä hiljaiseksi rauhoitetun ikkunan aikana, koska emme tiedä olivatko ne saman vai eri henkilön — harvinainen reunatapaus, ei erikseen ratkaistu.

**Rauhoitettu ikkuna (data, `sql/024`, ei mitään kovakoodattua):**
- `ristiriita_kausi_alkaa`/`ristiriita_kausi_loppuu` (MM-DD, oletus `08-01`–`05-31`, kausi SAA kiertää vuodenvaihteen yli — tarkistettu koodissa erikseen molemmille suunnille)
- `ristiriita_viikonpaivat` (ISO-viikonpäivät pilkulla eroteltuna, 1=ma...7=su, oletus `1,2,3,4,5`)
- `ristiriita_klo_alkaa`/`ristiriita_klo_loppuu` (oletus `09:00`/`15:00`) — **tarkistetaan PÄÄLLEKKÄISYYDEN OMALLE ajanjaksolle** (kahden tapahtuman leikkauskohta), ei koko päivälle: jos päällekkäisyys ulottuu vaikka vain hetkeksi ikkunan ulkopuolelle (esim. 14:00–16:00 vs. 15:30–17:00), se silti MERKITÄÄN — turvallisempi oletus kuin hiljentää osittain kello 15 jälkeen ulottuva ristiriita.
- `ristiriita_loma_valit` (JSON-lista `{"alku":"VVVV-KK-PP","loppu":"VVVV-KK-PP"}` -pareja, oletus tyhjä `[]`) — koulujen loma-aikoina ikkuna EI ole voimassa (Poikkeus B), täytetään käsin Table Editorista vuosittain (ks. "Loma-aikojen täyttö" alla, automaatio EI TOTEUTETTU).
- Kaikki säädettävissä Table Editorista ilman koodimuutosta — ei vielä omaa Asetukset-UI:ta (ei pyydetty erikseen tälle kierrokselle, vain Kuormavahdin menoraja on Asetuksissa).

**Näkyvyys (kaikissa kolmessa näkymässä, "Kalenterin merkkikieli" -periaatteen mukaan):**
- Päivä/viikko: `.paiva-merkki--ristiriita` (punainen, täytetty tausta + yhtenäinen reunus — vahvempi kuin muut, "ei saa mennä ohi silmää"), teksti "PÄÄLLEKKÄIN".
- Kuukausi: `.kalenteri-kuukausi-piste--ristiriita` (punainen piste päivänumeron vieressä). Jos päivällä on sekä ristiriita että kuormaraja ylittynyt, näytetään VAIN ristiriitapiste (vakavampi).

**Kontrastilaskettu** `--vaara`/`--vaara-ground`-parivärit (ks. "Ulkokäytettävyys ja kontrasti" alla) — molemmat teemat >4,3:1 WCAG-suhteessa, tarkistettu käsin laskien, ei automaattityökalulla.

**EI VIELÄ TESTATTU oikealla datalla** (kirjoitettu ja logiikka yksikkötestattu käsin node-skriptillä 7 eri tapauksella ennen käyttöönottoa — sama kalenteri/koulupäivä, eri henkilöt/koulupäivä, eri henkilöt/ilta, perhe vs. henkilö/koulupäivä, perhe vs. henkilö/ilta, ei päällekkäisyyttä, osittain ikkunan ulkopuolella — kaikki menivät odotetusti). Testauslistalle: lisää/synkkaa kaksi oikeasti päällekkäistä tapahtumaa (a) samaan kalenteriin, (b) Perhekalenteriin + henkilökohtaiseen, koulupäivän klo 9-15 sisällä JA sen ulkopuolella, (c) Katrin ja Juhan henkilökohtaisiin kalentereihin — tarkista että vain (a) ja koulupäivän-ulkopuolinen (b) sytyttävät merkin, (c) ei koskaan.

## Ulkokäytettävyys ja kontrasti (kirjattu 2026-07-10, Katrin testipalaute: "testattu ulkona auringossa, kontrasti ei riitä")

**Väriskorjaus (`style.css` `:root`):** aiempi `--muted` (vaaleassa `#B0AA9E`) laskettiin käsin WCAG-kaavalla n. 2,1:1 -kontrastiksi `--ground`-taustaa vasten — reilusti alle AA-vaatimuksen (4,5:1 leipätekstille). Sama ongelma tummassa teemassa (`#4D6B69`, n. 2,6:1). Molemmat tummennettu/kirkastettu tavoitteeseen: **vaalea `--muted` `#756F62` (n. 4,6:1), tumma `#7FA19E` (n. 5,4:1)**. Koska `--muted` on jaettu design-systeemin muuttuja, korjaus vaikuttaa KOKO sovellukseen (kaikki "muted"-tekstit, ei vain kalenteri) — tarkoituksella, parannus on aina hyvä eikä rajattu pelkkään kalenteriin.

**Uusi `--accent-text`:** `--accent` itse (vaaleassa `#C8941A`) laskettiin n. 2,5:1 -kontrastiksi — riittää isoihin/lihavoituihin otsikkoihin ja ikoneihin (lievemmät vaatimukset) muttei leipätekstiin. Uusi tummempi `--accent-text` (`#8C6512` vaaleassa, n. 4,8:1) otettu käyttöön VAIN kalenterin kellonaika-tekstissä (`.kalenteri-aika`, "ajalle oma väri" -pyyntö) — muita `--accent`-käyttöjä (napit, otsikot, badget) EI käyty läpi tässä kierroksessa, koska pyyntö oli rajattu kalenterin luettavuuteen. Tummassa teemassa `--accent-text` = sama kuin `--accent` (jo n. 8,2:1, ei tarvinnut erillistä).

**Kaikki hex-arvot laskettu käsin WCAG-suhteen kaavalla** (relatiivinen luminanssi + kontrastisuhde), EI automaattisella kontrastityökalulla — jos joskus tuntuu väärältä silmämääräisesti, tarkista oikealla työkalulla (esim. selaimen DevTools-kontrastitarkistin) ja säädä.

**Fonttikoot (`style.css`):** `.kalenteri-paiva-otsikko` 13→15px, `.kalenteri-aika`/`.kalenteri-tyhja` 13/13→14/14px, kuukausiruudukko `.kalenteri-kuukausi-pvm` 12→13px, `.kalenteri-kuukausi-tapahtuma` 8→9px, `.kalenteri-kuukausi-viikonpaivat span` 10→11px, viikkonäkymän vaakatila-ylikirjoitukset (`@media (orientation: landscape)`) `.kalenteri-paiva-otsikko` 10→12px ja `.list li` 12→14px (oli alle 13px-lattian). Tapahtuman OTSIKKO (`.list li`, 22px, ei muutettu) oli jo ennestään iso — pienuus oli nimenomaan pvm/kellonaika/otsikkorivi-teksteissä, ei tapahtuman nimessä.

**Ei vielä testattu ulkona oikeasti** tämän korjauksen jälkeen — testikriteeri: luettavissa aurinkoisena päivänä käsivarren mitalta.

### Toinen kierros (2026-07-13, Katrin uusi testipalaute samalla kriteerillä)

Ensimmäinen korjaus (yllä) laski värit juuri ja juuri AA-rajan (4,5:1) yläpuolelle, ei kauas siitä — käytännössä auringossa/kiillossa se ei riittänyt, sama palaute toistui. Kaikki kolme vaaleaa väriä tummennettu VIELÄ KERRAN, tällä kertaa reilulla marginaalilla n. 6-6,5:1:een (ei enää rajalla tasapainoilua):
- `--muted` vaaleassa: `#756F62` (4,6:1) → **`#5F5A4F` (6,3:1)**
- `--accent-text` vaaleassa: `#8C6512` (4,8:1) → **`#73530F` (6,5:1)**
- `--huomio` vaaleassa: `#A85A1A` (4,7:1) → **`#8C4A16` (6,2:1)**
- Tumma teema EI koskettu — oli jo valmiiksi 5,4–8,2:1 -haarukassa, riittävä marginaali todettiin laskennallisesti eikä pelkkää rajan ylitystä.
- `--vaara` (punainen, päällekkäisyysmerkki) EI koskettu — jo ennestään n. 6,0:1, riittävä.

**Kuormavahdin näkyvyys korjattu KAIKISSA kolmessa näkymässä** (aiempi väite "kuukausinäkymä sai merkin" piti paikkansa TEKNISESTI mutta ei KÄYTÄNNÖSSÄ — piste oli olemassa mutta sen selitys oli vain `title`-attribuutissa, joka vaatii hoveria eikä toimi kosketusnäytöllä; käytännössä siis "näkymätön" merkitys mobiilissa vaikka väripiste näkyikin):
- `.paiva-merkki` (päivä/viikkonäkymän "N menoa" -pilleri): 12px→13px, padding 3px 7px→4px 8px.
- Viikkonäkymän vaakatila-ylikirjoitus oli jäänyt erityisen pieneksi (10px, "mikroskooppinen"): 10px→12px.
- **Kuukausiruudukon piste sai NÄKYVÄN LUKEMAN** (esim. "6") pelkän värillisen pisteen sijaan — pieni täytetty meripihka-pilleri (`min-width 14px, border-radius 6px`) tekstillä `var(--ground)`, joka toimii KONTRASTILTAAN yhtä hyvin molemmissa teemoissa (ground on vaaleassa teemassa vaalea, tummassa tumma — sama pari kääntyy automaattisesti oikein ilman uutta muuttujaa). Ristiriitapiste pysyy pelkkänä pisteenä (aina sama merkitys, ei tarvitse numeroa).

**Visuaalisesti tarkistettu** Playwrightilla (ei oikealla laitteella, ei ulkona) molemmissa teemoissa ennen committia — pillerit ja kuukausipiste luettavissa, värit erottuvat toisistaan. **Ei vielä testattu OIKEASTI ulkona auringossa** — tämä on toinen yritys samaan kriteeriin, jos vieläkään ei riitä, seuraava kierros pitää ehkä harkita täytettyä taustaa myös kuormamerkille (nyt yhä dashed-reunus, ei täytetty — "täytetty tausta vain punaiselle" -periaatetta ei rikottu).

## Loma-aikojen täyttö — EI TOTEUTETTU, vain kirjattu (2026-07-10)

Osa Ristiriitamerkin "rauhoitettu ikkuna" -logiikkaa (Poikkeus B, ks. yllä) — `ristiriita_loma_valit` on tällä hetkellä aina käsin täytettävä JSON Table Editorista. Tuleva automaatio, EI rakennettu nyt:

- **Asetuksiin aikanaan** (EI nyt): kenttä koulun lomasivun osoitteelle, vaihdettavissa kun koulu/sivu vaihtuu.
- **Vaihe 1 (Nostot-vaiheessa, ks. "Horisontti — suunnitelma"):** elokuussa muistutus "lomavälit täyttämättä" + linkki lomasivulle, Katri/Juha täyttävät käsin.
- **Vaihe 2 (E3, Claude-äly):** ajastettu haku lukee sivun, äly (ei perinteinen skreippaus) poimii lomavälit ja EHDOTTAA push-ilmoituksella + kuittauksella — EI KIRJOITA suoraan tietokantaan ilman vahvistusta.
- **Miksi ei perinteistä skreippausta ilman älyä:** hauras, hajoaa hiljaa sivu-uudistuksissa ilman että kukaan huomaa — vain "äly lukee ja ehdottaa" -malli on riittävän kestävä.

## Kahden puhelimen testisessio (2026-07-10)

Ensimmäinen oikea käyttötesti "yksi totuus, kaksi ikkunaa" -mallille ja Kuormavahdille, Katri ja Juha yhtä aikaa omilla puhelimillaan.

**TÄRKEÄ RAJOITUS koko testisessiolle: kaikki testattiin vain YHTEEN SUUNTAAN** (Juha teki muutokset/lisäykset, Katri havainnoi tuloksen). Peilikuva — Katri tekee muutoksen, Juha havainnoi — jäi kokonaan testaamatta. Tämä koskee kaikkea alla "TESTATTU JA TOIMII" -kohdassa mainittua: synkka on todistettu toimivaksi vain Juha→Katri-suuntaan, ei Katri→Juha. Sama koskee Löydös 1:n symmetriaa (poistaako myös KATRIN Satama-poisto jotain iCloudista — ei testattu, korjaus tehty ennen kuin ehdittiin testata tätä suuntaa) ja saattaa liittyä Löydös 3:een (kaikki mikä on "todettu toimivaksi" on toistaiseksi todettu vain yhdestä suunnasta/yhdeltä puhelimelta). **Älä tulkitse alla olevaa "toimii"-listaa kaksisuuntaisesti todistetuksi ennen vastakkaisen suunnan testiä.**

### TESTATTU JA TOIMII ✓
- Synkka päästä päähän: Juha lisäsi tapahtuman iPhonen Kalenterissa → näkyi Katrin Satamassa n. 5 min sisällä.
- Kuittausmalli: "uusi"-tagi näkyi, badge näkyi, "Kuittaa kaikki" tyhjensi molemmat kerralla.
- BUGI A / BUGI B (ks. "Ensimmäisen testin löydökset" alempana) todistettu korjatuiksi oikealla `?esikatsele=1`-datalla: joulukuun testitapahtuma mukana haussa (hakuikkuna kunnossa), "Ilmoittaudu kouluun" täsmälleen 2× 6.8. ilman 8.8.-haamua (RRULE-poikkeus kunnossa). **Huom:** nuo kaksi 6.8.-riviä ovat oikeasti kaksi ERI merkintää kahdessa eri kalenterissa — tuplarivi agendassa on OIKEIN, ei bugi.
- Organizer-diagnostiikka (`?esikatsele=1`) ajettu oikealla datalla: **organizer-kenttä on käytännössä aina `null`** (3 poikkeusta, kaikissa sama anonyymi principal-osoite, ei käyttökelpoinen). **Tulos: varasuunnitelma on PYSYVÄ ratkaisu, ei väliaikainen** — `kalenteri_tekijat`-taulua ei täytetä, kaikki synkatut tapahtumat näkyvät "uusina" molemmille käyttäjille, "Kuittaa kaikki" hoitaa loput. Tämä on tarkoituksella suunniteltu toimimaan juuri näin (ks. "Kalenterin periaate" -osion kohta 3), joten mitään ei tarvitse korjata koodissa. Mahdollinen kevyt parannus MYÖHEMMIN (EI nyt): syötekohtainen oletustekijä datana (esim. "Katri"-kalenterin menot tagataan uutena vain Juhalle, "Juha"-kalenterin vain Katrille, "Perhekalenteri" molemmille) — vaatisi vain uuden sarakkeen `kalenteri_syotteet`-tauluun + pienen koodimuutoksen, ei kiire.

### LÖYDÖS 1 — kriittinen kysymys: kirjoittaako Satama iCloudiin poistettaessa? SELVITETTY: EI, korjattu silti varmuuden vuoksi

Juha poisti Satamasta (vahingossa) yhden esiintymän toistuvasta "Ilmoittaudu kouluun" -tapahtumasta × -napilla, ja tapahtuma katosi myös hänen iPhonensa Kalenterista. Vahvistettu käyttäjältä kahdesti — huolestuttavaa, koska sovittu arkkitehtuuri on "Satama EI KOSKAAN kirjoita iCloudiin".

**Koodi käyty läpi rivi riviltä, varmuus 100%: Satamassa EI OLE mitään CalDAV-kirjoitusreittiä.**
- `api/caldav-sync.js` tuo kirjaston `tsdav`:sta vain `DAVClient`:in, ja siitä kutsutaan koko koodikannassa AINOASTAAN `client.login()`, `client.fetchCalendars()`, `client.fetchCalendarObjects()` — kaikki kolme LUKU-operaatioita. Ei ainuttakaan `createCalendarObject`/`updateCalendarObject`/`deleteCalendarObject`-kutsua missään.
- Kalenterin × -poistonappi (`script.js`, `piirraKalenteriRivi()`) teki AINOASTAAN `db.from('kalenteri_tapahtumat').delete().eq('id', rivi.id)` — pelkkä Supabase-rivin poisto, ei kosketa iCloudia millään tavalla.
- Synkan oma poisto-koodi (peilisääntö, `siivoaPoistetut()`) tekee saman: pelkkä Supabasen REST-DELETE `kalenteri_tapahtumat`-tauluun, ei koskaan CalDAV-kirjoitusta.

**Siis (a):** ei, poistonapissa ei ole eikä ole koskaan ollut CalDAV-kirjoitusta iCloudiin. **(b) todennäköisin selitys** miksi tapahtuma silti katosi iCloudistakin: Juha (tai joku muu jaetun kalenterin käyttöoikeuksilla) poisti saman esiintymän myös suoraan iPhonen Kalenteri-sovelluksessa, todennäköisesti lähellä samaa hetkeä eikä sitä muistettu erikseen — toistuvan tapahtuman yksittäisen kerran poisto natiivissa Kalenterissa on helppo tehdä vahingossa (pyyhkäisy/pitkä painallus), ja koska kyse on JAETUSTA perhekalenterista, poisto näkyy heti kaikilla joilla on siihen pääsy. Tämä ei ole koodin todistamaa vaan päättelyä poissulkemalla — ainoa asia joka on 100% varmaa on ettei Satama voinut tehdä sitä.

**Katrin puolella tapahtuma näkyi EDELLEEN sekä Satamassa että iCalissa** — tämä ei sovi yhteen "poisto tapahtui oikeasti iCloudissa" -selityksen kanssa yksinkertaisesti (jaetun kalenterin poiston pitäisi näkyä kaikilla saman tien). Todennäköisin selitys kytkeytyy LÖYDÖS 3:een alla: jos Katrin puhelin ajaa vanhentunutta cachetettua sovellusversiota (`sw.js`:n cache-first-logiikka), hänen näkymänsä voi olla useita synkkauskertoja jäljessä todellisesta tilanteesta. **Tarkista ensin:** Asetukset → Sovellus-osio → versioteksti Katrin puhelimella verrattuna `sw.js`:n `CACHE`-vakioon (nyt `kauppalista-v36`) — jos ei täsmää, paina "Päivitä sovellus" (tyhjentää cachen + rekisteröi service workerin uudelleen + lataa sivun) ja testaa uudelleen ennen kuin oletetaan varsinaista datavirhettä.

**KORJAUS TEHTY sovitun mallin mukaisesti (2026-07-10), riippumatta yllä olevasta selityksestä** — koska poistonappi oli joka tapauksessa arkkitehtuurin vastainen (koodin oma kommentti yläpuolella jo sanoi "EI koskaan poista tapahtumaa... siirretään iPhonen Kalenterissa", mutta itse nappi ei tarkistanut tätä mitenkään): **× -poistonappi piilotetaan kokonaan riveiltä joilla `ical_uid` on asetettu** (eli kaikki synkatut, ulkoisesta kalenterista tulleet tapahtumat) — niillä näkyy enää vain ⚓-nappi ja "uusi"-tagi (jos koskematon). Käsin lisätyt tapahtumat (`ical_uid` null) säilyttävät normaalin poistonapin + vahvistusdialogin. `script.js`, `piirraKalenteriRivi()`.

### LÖYDÖS 2 — Laituriin kirjoitettu teksti katosi näytön kääntyessä: KORJATTU (varmuusverkko)

Toistunut kahdesti, kahdella eri puhelimella (Juha 2026-07-10, Katri 2026-07-09) — teksti hävisi Laiturin syöttökentästä ennen tallennusta kun näyttö käännettiin sivuttain.

**Koodista käyty läpi kaikki mahdolliset omat re-render-laukaisijat** (`resize`/`orientationchange`/`visibilitychange`-kuuntelijat) — löytyi vain `visibilitychange` (päivittää KAUPPALISTAN, ei Laituria) ja `focus` (sama). Kumpikaan ei kohdistu Laituri-näkymään eikä tyhjennä syöttökenttää suoraan. `laituri-input` ei myöskään ole `<form>`-elementin sisällä (poissuljettu: ei native-lomakelähetystä kääntyessä).

**Todennäköisin juurisyy: iOS Safari saattaa ladata kotinäytölle asennetun PWA:n (standalone-tila) kokonaan uudelleen näytön kääntyessä**, tunnettu WebKit-käytös erityisesli muistipaineen alla — tämä on selaimen/käyttöjärjestelmän oma toiminta, ei mikään Sataman JS-koodin laukaisema tapahtuma, joten sitä ei voi "korjata" sovelluskoodista käsin.

**Korjattu silti (b-osa Katrin pyynnöstä): varmuusverkko joka toimii riippumatta juurisyystä.** `script.js`: `laituri-input`-kentän jokainen näppäinpainallus (`input`-tapahtuma) tallentaa luonnoksen `localStorage`-avaimeen `satama_laituri_luonnos`. Luonnos palautetaan kenttään aina kun Laituri-näkymä avataan uudelleen (`palautaLaituriLuonnos()`, kutsutaan `avaaOsio()`:n laituri-haarasta), ja tyhjennetään onnistuneen lisäyksen jälkeen (`tyhjennaLaituriLuonnos()`). **Laituriin kirjoitettu ei siis enää katoa** vaikka sivu latautuisi kokonaan uudelleen kesken kirjoituksen — pahimmillaan käyttäjä joutuu avaamaan Laiturin uudelleen nähdäkseen luonnoksen, muttei menetä sitä.

### LÖYDÖS 3 — "Laivatesti" näkyi vain Juhan Satamassa, ei Katrin: SELVITTÄMÄTTÄ, jää testauslistalle

Sama tietokanta, sama rivi `kalenteri_tapahtumat`-taulussa (Perhekalenteri, synkataan Katrin CalDAV-tililtä) — silti eri lopputulos kahden käyttäjän näkymissä. Versiovertailu jäi tekemättä kesken.

**Todennäköisin selitys, ei vielä vahvistettu:** Katrin puhelin ajaa vanhentunutta cachetettua sovellusversiota (ks. myös LÖYDÖS 1:n Katrin-puolen epäjohdonmukaisuus yllä — sama juurisyy selittäisi molemmat havainnot yhdellä kertaa). `sw.js`:n cache-first-strategia tarjoilee vanhaa `script.js`/`index.html`-versiota kunnes service worker ehtii päivittyä; jos Katrin puhelimella on ollut auki vanha PWA-instanssi pidempään, se saattaa yhä ajaa koodia joka on peräisin ennen jotain aiempaa muutosta (esim. vanha jono-piilotuslogiikka joka on sittemmin poistettu "yksi totuus, kaksi ikkunaa" -arkkitehtuurissa).

**Testauslistalle:** avaa Katrin puhelimella Asetukset → Sovellus → tarkista versioteksti, vertaa Juhan puhelimeen ja `sw.js`:n `CACHE`-vakioon (nyt `kauppalista-v36`). Jos eroa, paina "Päivitä sovellus" ja katso ilmestyykö "Laivatesti" sen jälkeen. Jos versiot täsmäävät eikä tapahtuma silti näy, kyseessä on oikea datan näkyvyys-/kyselyongelma eikä cache — palaa tähän erikseen.

### Jäi testaamatta → testauslistalle (2026-07-10 session lopussa)
- **Peilikuvatesti vastakkaiseen suuntaan (TÄRKEIN puuttuva testi, ks. rajoitushuomautus yllä):** Katri tekee lisäyksen/muutoksen/poiston, Juha havainnoi. Koko 2026-07-10 sessio testasi vain Juha→Katri-suuntaa — mitään ei ole vielä todistettu toimivaksi Katri→Juha-suuntaan (mukaan lukien: näkyykö Katrin lisäys Juhan Satamassa ~5 min sisällä samoin kuin toisinpäin, saako Juha "uusi"-tagin+badge:n+Kuittaa kaikki -toiminnon Katrin lisäyksestä, ja onko Löydös 1:n poisto-kysymys symmetrinen — poistaako Katrin oma Satama-poisto jotain iCloudista samoin kuin epäiltiin Juhan kohdalla). Tee tämä testi KOKONAAN uudelleen ennen kuin "toimii"-listaa pidetään lopullisena.
- Laivatesti Katrin näkymässä versiovertailun kera (Löydös 3)
- Poistotesti puhtaana: poista tapahtuma iPhonen Kalenterista → katoaako Satamasta seuraavassa synkassa (keskeytyi Löydös 1:n vuoksi, testaa uudelleen nyt kun poistonappi on piilotettu synkatuilta riveiltä)
- Muokkaustesti: nimen/ajan muutos iPhonen Kalenterissa → päivittyykö Satamassa (peilisääntö, muutos-osuus)
- Kuormavahti: ❕/⚑-merkki ei näkynyt 11.7. kohdalla vaikka päivällä oli 6 menoa — todennäköinen syy: testimenot lisätty ilman kellonaikaa (koko päivän tapahtumat eivät kerrytä laskuria, tarkoituksellista, ks. "Kuormavahti"-osio) — testaa uudelleen KELLONAIKAAN sidotuilla tapahtumilla ennen kuin oletetaan bugiksi. Myös rajan muutos Asetuksista vielä testaamatta.
- Push Juhan puhelimella: "Salli ilmoitukset" → testinappi → appi kokonaan suljettuna
- Siri-lisäys regressiona (`/api/add`), Juhan ⚓-nosto, `#`-väliotsikko Juhan tilillä
- `sql/023_asetukset.sql`:n näkyminen Asetuksissa (menoraja-kenttä oikealla oletusarvolla)

## Kalenterisyötteet — geneerinen ulkoisen kalenterin veto (2026-07-08, uudelleensuunniteltu samana päivänä, arkkitehtuuri päivitetty illalla — ks. "Kalenterin periaate: yksi totuus, kaksi ikkunaa" yllä ajantasaiselle mallille)

**HUOM tälle osiolle on ollut kaksi eri suunnitelmaa saman päivän aikana** — ensimmäinen versio (kahden Apple-tilin CalDAV-pull, kolme hardkoodattua kalenterinimeä "Yhteinen"/"Sininen"/"Punainen") korvattiin heti alla kuvatulla geneerisellä syötemallilla ennen kuin ensimmäistä versiota ehdittiin ajaa Supabaseen asti. Jos jostain vanhasta muistista/viestistä löytyy mainintoja `icloud_odottavat`-taulusta, `lahde_kalenteri`-sarakkeesta tai kahdesta erillisestä Apple-tunnuksesta (APPLE_EMAIL_KATRI/APPLE_EMAIL_JUHA) — ne ovat VANHENTUNEITA, ei näy koodissa enää.

**Tausta** (kontekstiksi jos joku myöhemmin miettii miksi ulkoinen kalenteriveto on ylipäätään tarpeen): perhe käyttää iCloud-kalenteria arjessa, ja siihen on ollut satunnaisia synkkakatkoja toisen lisäyksen näkymisessä toiselle. Todennäköisin syy: Katrin iCloud-tallennustila on toistuvasti lähes täynnä (kasvavat kuvat), ja Apple dokumentoi että "iCloud Calendar requires free storage before it can sync your calendar's data". Tätä ei ratkaista koodilla — ratkaisu on tallennustilan hallinta Katrin puolelta, tietoisesti jätetty auki, ei pakollinen ehto tälle ominaisuudelle.

**Valittu arkkitehtuuri: YKSI yleinen syötekoneisto, ei erillisiä himmeleitä per kalenteri.** Uusi taulu `kalenteri_syotteet` listaa jokaisen ulkoisen kalenterin DATANA (nimi, tyyppi, tunniste, tila, väri, enabled) — uuden kalenterin lisääminen on Table Editor -rivinlisäys, EI koodimuutos. Tämä on tietoisesti tehty ennen kaikkea siksi että kehityskone palautuu 23.7.2026, jonka jälkeen projektia jatketaan pelkällä Copilotilla eikä sen pitäisi tarvita koskaan koskea `api/caldav-sync.js`-tiedostoon uutta kalenteria lisätessä.

**Kaksi syötetyyppiä** (`kalenteri_syotteet.tyyppi`):
- `'icloud'` — haetaan CalDAV:illa. `tunniste`-sarake on CalDAV-kalenterin TARKKA näyttönimi iCloudissa (esim. "Yhteinen") — täytyy täsmätä kirjain kirjaimelta. **Minkä tilin tunnuksilla haetaan, kertoo `account_key`-sarake** (`'katri'`/`'juha'`, ks. "Useampi CalDAV-tili" alla) — TÄRKEÄ MUUTOS 2026-07-08 illalla, ks. sen osion tausta.
- `'ics_url'` — haetaan suoraan HTTP GET:llä julkaistusta `.ics`-tiedostosta, EI vaadi mitään kirjautumista, `account_key` ei koske tätä tyyppiä ollenkaan. `tunniste`-sarake on tällöin se https-osoite. Tätä käytetään mm. testaamiseen (ks. alla).

**Kaksi tilaa** (`kalenteri_syotteet.mode`) — **MERKITYS MUUTTUI 2026-07-08 illalla, ks. "Kalenterin periaate" yllä:**
- `'taysi'` — koko tapahtuma (nimi + aika) näkyy TÄYDELLISENÄ agendassa. **VANHENTUNUT KUVAUS ALLA, säilytetty historiana:** ~~menee AINA hyväksyntäjonoon (`kalenteri_odottavat`-tauluun), ei koskaan suoraan läpi~~ — tämä poistui käytöstä, kaikki näkyy suoraan. Toisen käyttäjän lisäämä täysi tapahtuma saa "uusi"-merkinnän kuittausjonossa (ks. "Kalenterin periaate" -osio), mutta on silti näkyvissä agendassa välittömästi.
- `'vain_varattu'` — yksityisyyssuoja esim. toisen työkalenterille: KAIKKI paitsi alku/loppuaika riisutaan JO TUONNISSA `api/caldav-sync.js`:ssä (funktio `varattuTapahtumaksi()`) — otsikko, paikka, osallistujat eivät koskaan päädy edes väliaikaiseen muuttujaan saati tietokantaan. Tallennettu tapahtuma näkyy agendassa suoraan tekstillä `"🔒 Varattu 18–20"` (tai `"🔒 Varattu (koko päivä)"` koko päivän tapahtumille).

**Tietokanta (`sql/014_kalenteri_syotteet.sql`):**
- Uusi taulu `kalenteri_syotteet` (id, name, tyyppi, tunniste, mode, vari, enabled, last_synced_at, created_at) — `vari` on hex-merkkijono (esim. `'#9B7FD4'`) jota käytetään agendan värimerkintään; jos null, JS käyttää `var(--muted)`-oletusta
- `kalenteri_tapahtumat.syote_id` — viittaa `kalenteri_syotteet(id)`:hen, NULL jos käsin lisätty Satamassa suoraan
- `kalenteri_tapahtumat.ical_uid` (text, unique, nullable) — iCalendarin UID (+ `#`-liite toistuvan tapahtuman yksittäiselle esiintymälle, ks. alla), estää saman tapahtuman tuomisen kahdesti. Nimetty `ical_uid` eikä `icloud_uid`, koska UID on iCalendar-formaatin oma kenttä, ei icloud-spesifinen — sama pätee ics_url-syötteisiin.
- `kalenteri_tapahtumat.event_end_time` — tarvitaan `vain_varattu`-tilan "18–20"-näytölle, mutta käytettävissä yleisemminkin
- `kalenteri_tapahtumat.user_id` (olemassa jo taulun perustamisesta, `sql/012_kalenteri.sql`) — käytetään NYT (2026-07-08 illasta) myös synkatuille tapahtumille "tekijänä" (ks. "Kalenterin periaate" -osion "Tekijän tunnistus"), ei enää vain käsin lisätyille.
- Taulu `kalenteri_odottavat` (id, ical_uid, syote_id, title, event_date, event_time, event_end_time, status) — **KÄYTÖSTÄ POISTUNUT 2026-07-08 illalla, ks. "Kalenterin periaate" -osio.** EI pudotettu tietokannasta, EI enää kirjoiteta eikä luettu koodista.
- **(`sql/017_kalenteri_tilit.sql`, lisätty 2026-07-08 illalla):** `kalenteri_syotteet.account_key` (`'katri'`/`'juha'`, oletus `'katri'`) — ks. "Useampi CalDAV-tili" alla.
- **(`sql/021_kalenteri_kuittausjono.sql`, lisätty 2026-07-08 illalla myöhemmin):** uudet taulut `kalenteri_tekijat` (organizer_tunniste -> user_id, Table Editor -täytettävä) ja `kalenteri_kuittaukset` (ical_uid, user_id, kuitattu_at) — ks. "Kalenterin periaate" -osio.

**Useampi CalDAV-tili (lisätty 2026-07-08 illalla, `sql/017_kalenteri_tilit.sql`):** testissä havaittiin ettei kaikki perheen tapahtumat ole jaetussa kalenterissa — osa elää Juhan HENKILÖKOHTAISISSA kalentereissa, joita Katrin iCloud-tunnukset eivät näe ollenkaan. Siksi synkka tukee nyt kahta iCloud-tiliä:
- Uusi sarake `kalenteri_syotteet.account_key` (`'katri'`/`'juha'`, oletus `'katri'`, koskee vain `tyyppi='icloud'`-rivejä) kertoo MINKÄ tilin tunnuksilla syöte haetaan. **Salasanat pysyvät AINA ympäristömuuttujissa** — tauluun tulee vain viittausavain, ei koskaan mitään salaista ("kaikki säädettävä on dataa" -periaate ilman että se koskaan tarkoittaisi salaisuuksia tietokannassa).
- `api/caldav-sync.js`:n `TILIT`-map yhdistää `account_key`-arvon oikeaan ympäristömuuttujapariin. Puuttuvat tunnukset validoidaan VASTA `haeIcloudSyote()`:n sisällä (per syöte), EI koko funktion alussa — jos vain Juhan tunnukset puuttuisivat, Katrin syötteet synkkautuisivat silti normaalisti, virhe näkyisi vain sen yhden syötteen kohdalla vastauksen `syotteet`-listassa.
- **Duplikaattisuoja jaetulle kalenterille:** jos sama jaettu perhekalenteri näkyy MOLEMMILLA tileillä, sama tapahtuma ei saa tulla tuotua/jonoon kahdesti. Tämä oli jo valmiiksi ratkaistu ennen tätä muutosta: `ical_uid`-sarakkeen UNIQUE-rajoite + `on_conflict=ical_uid&resolution=ignore-duplicates` (ks. "Tekniset kiemurat" alla) toimii identtisesti riippumatta siitä tuliko tapahtuma yhdeltä vai kahdelta tilarilta samanaikaisesti — ei vaatinut mitään uutta koodia, vain testi tälle nimenomaiselle tapaukselle (ks. "Testattavaa seuraavaksi").
- **Per-syöte kalenterivalinta** (mistä useamman kalenterin tililtä haetaan juuri oikea) hoituu jo ennestään `tunniste`-sarakkeella (CalDAV-näyttönimi) — ei vaatinut uutta saraketta, koska tämä oli jo rakennettu geneeriseksi ennen tätä muutosta.

**Ympäristömuuttujat** (Vercel Project Settings → Environment Variables, Production + Preview):
- `SUPABASE_SERVICE_KEY` — sama kuin `api/add.js`:llä jo on. **Jo asetettu.**
- `ICLOUD_USERNAME` / `ICLOUD_APP_PASSWORD` — Katrin tili. Käyttäjätunnus on Apple ID -kirjautumisosoite (**jos CalDAV-login palauttaa 401:** ensimmäinen kokeiltava korjaus on vaihtaa `@icloud.com`-muotoon), salasana appleid.apple.com:ista (Kirjautuminen ja suojaus → Sovelluskohtaiset salasanat) luotu sovelluskohtainen salasana, EI oikea iCloud-salasana. Merkitty Vercelissä sensitiiviseksi. **Jo asetettu ja TOIMII 2026-07-08 illasta lähtien** — ensimmäinen `ICLOUD_APP_PASSWORD`-arvo oli väärin (401), korjattu ja redeployattu, `?listaa=katri` (ks. alla) vahvisti toimivaksi.
- `ICLOUD_USERNAME_JUHA` / `ICLOUD_APP_PASSWORD_JUHA` — Juhan tili, sama periaate kuin yllä. **Katrin mukaan jo asetettu Verceliin 2026-07-08 illalla**, EI VIELÄ vahvistettu toimivaksi (`?listaa=juha` testaamatta) — jos synkka valittaa puuttuvista/virheellisistä Juhan tunnuksista, tarkista Vercelin ympäristömuuttujista että nimet ovat TÄSMÄLLEEN nämä (helppo kirjoitusvirhepaikka, esim. `_JUHA`-pääte unohtuu) ja että salasana on oikea (samantyyppinen 401 kuin Katrin tilillä ensin oli mahdollinen).

**Diagnostiikka kalenterien nimien selvittämiseen (lisätty 2026-07-08 illalla):** `GET /api/caldav-sync?listaa=katri` (tai `?listaa=juha`) palauttaa JSON:ina sen tilin kalentereiden TÄSMÄLLISET näyttönimet synkkaamatta mitään — esim. `{"tili":"katri","kalenterit":["Perhekalenteri","Juha","Katri"]}`. Tarpeen koska `kalenteri_syotteet.tunniste` (icloud-tyyppisillä syötteillä) pitää täsmätä CalDAV-näyttönimeen kirjain kirjaimelta, eikä sitä voi arvata. Toteutettu `api/caldav-sync.js`:n `listaaKalenterit()`/`kirjauduIcloudiin()`-funktioilla (jälkimmäinen erotettu omaksi, jotta kirjautumislogiikka ei toistu `haeIcloudSyote()`:ssa).

**Manuaalinen synkan laukaisu selaimesta (ei vaadi kirjautumista Satamaan):** `GET /api/caldav-sync` (ei parametreja) — sama endpointti jota sovellus kutsuu automaattisesti Kalenteri-näkymän avautuessa, mutta voi kutsua myös suoraan URL-osoitteella jos haluaa varmistaa synkan onnistumisen näkemättä selaimen kehittäjätyökaluja.

**Juhan tilin nimikorjaus (2026-07-12, `sql/031_kalenteri_juha_nimikorjaus.sql`):** kun `sql/030` ajettiin ja synkattiin ensimmäistä kertaa oikeasti, `?listaa=juha`-diagnostiikka + puhelimista käsin varmistaminen paljasti kaksi asiaa:
1. **Jaettu perhekalenteri näkyy Juhan iCloud-tilillä ERI näyttönimellä** kuin Katrin tilillä — "Yhteinen kalenteri", ei "Perhekalenteri". Koska `tunniste` on CalDAV:in tarkka näyttönimi kirjain kirjaimelta (sama kalenteri, kaksi eri nimeä eri tileiltä katsottuna — normaalia iCloudissa, ei bugi), `sql/030`:n rivi ei koskaan löytänyt kalenteria, synkka-JSON:issa virhe "Kalenteria Perhekalenteri ei löytynyt iCloud-tilitä". Korjattu UPDATElla (sama syöte, väärä tunniste — EI uusi rivi).
2. **Juhan tilillä oli KAKSI kalenteria nimellä "Juha"** (jaettu + hänen oma yksityisensä) — moniselitteinen tunnisteelle. Ratkaistu nimeämällä yksityinen kalenteri iCloudissa uudelleen "Oma"-nimiseksi, minkä jälkeen `sql/031` lisää sille oman syöterivin (`account_key='juha'`, `henkilo='juha'`) — sieltä tulevat todennäköisesti perjantain "kadonneiksi" havaitut Juhan omat menot.
3. Vanha tupla-jaettu kalenteri ("Katri Rantanen" -niminen jäänne) poistettiin Juhan tililtä kokonaan — jos synkka ehti tuoda siitä jotain aiemmin Satamaan, peilisääntö (`siivoaPoistetut()`) siivoaa ne pois automaattisesti seuraavalla synkkauskerralla, ei vaatinut mitään SQL-siivousta.

**PERIAATE JATKOA VARTEN:** jos nimipohjainen tunniste törmää tulevaisuudessa taas tuplanimeen tai väärään näyttönimeen, ENSISIJAINEN korjaus on nimetä kalenteri selkeäksi iCloudissa ja päivittää `tunniste` vastaamaan (kuten tässä) — EI koodata ohitusta/erikoistapausta `api/caldav-sync.js`:ään ellei se ole aidosti pakollista. Sama "data ei koodia" -periaate kuin muuallakin tässä projektissa.

**✓ VAHVISTETTU 2026-07-13 (Katri, käsityöpäivä):** `sql/031` ajettu, synkka-JSON näyttää **9 syötettä, 0 virhettä** (aiempi "8"-arvio oli väärä laskuvirhe — oikea määrä on 3 Katrin tililtä + 2 Katrin Hytti-ICS-syötettä (sql/028) + 3 Juhan tililtä + 1 Juhan "Oma" = 9). 330 tapahtumaa kirjoitettu, EI tuplia. **Yhteinen kalenteri (Juhan tili) löytää 45/45 samat tapahtumat kuin Perhekalenteri (Katrin tili)** — UID-duplikaattisuoja pitää kahden tilin välillä, todistettu datalla. Lukkarikone 201 tapahtumaa (scope hytti/katri), Itslearning 0 (kesä, sisältötesti UUDELLEEN elokuussa, ks. yllä kausiluontoinen-huomautus).

**Juhan "Oma" Hytin scopeen (2026-07-13, `sql/032_juha_oma_hytti_scope.sql`):** yksinkertainen jatko edelliseen — Juhan yksityinen "Oma"-kalenteri (juuri lisätty `sql/031`:ssä, `henkilo='juha'` jo silloin) päivitetään `scope='hytti'`, sama malli kuin Katrin Itslearning/Lukkarikone-syötteillä (`sql/028`). Ei tarvinnut erillistä `owner`-saraketta eikä Juhan UUID:tä tähän migraatioon lainkaan — RLS-policy (`kalenteri_tapahtumat_select`, sql/027) ratkaisee omistajuuden jo olemassa olevan `henkilo`→`hytti_omistajat`-kartan kautta. **VAATII ETUKÄTEEN:** `hytti_omistajat`-taulussa oleva rivi `henkilo='juha'` → Juhan oikea auth-tunniste. **Alunperin ohjeistettu lisättäväksi käsin Table Editorista** (`sql/027`:n jälkeen) — Katri huomasi rivin puuttuvan ja pyysi turvallisemman tavan (ei UUID:n käsinkopiointia). Korjattu `sql/033_hytti_omistajat_juha.sql`:llä, joka hakee Juhan `auth.users`-rivin SÄHKÖPOSTILLA (`ylijaakkolaj@gmail.com`) `INSERT ... SELECT`-lauseella — ei koskaan käsin kopioitua UUID:ta mistään. Migraatio kaatuu selkeään virheeseen jos sähköpostia ei löydy (esim. kirjoitusvirhe), sen sijaan että hiljaa lisäisi nolla riviä. **033 on ajettava ENNEN 032:ta**, koska 032 tarvitsee tämän rivin toimiakseen.

**✨ SCOPE-SYMMETRIA VALMIS ✨** — kaunis lopputila johon päädyttiin: Katrin henkilökohtaiset opiskelusyötteet (Itslearning, Lukkarikone) näkyvät VAIN hänen omassa Hytissään; Juhan henkilökohtainen "Oma"-kalenteri näkyy VAIN hänen omassa Hytissään; jaetut perhekalenterit (Perhekalenteri/Yhteinen kalenteri, ja kummankin tilin "Juha"/"Katri"-nimiset jaetut kalenterit) näkyvät kaikille perheen agendassa normaalisti. Sama `scope`-mekanismi (yksi sarake, yksi RLS-policy) palvelee molempia käyttäjiä symmetrisesti — ei tarvinnut mitään käyttäjäkohtaista erikoiskoodia, koko rakenne oli jo geneerinen kun se rakennettiin ensimmäistä kertaa Katrille (sql/027-028).

**✓ Migraatiot ajettu 2026-07-13** (`sql/032`, `sql/033` — 033 ennen 032:ta kuten ohjeistettu). Synkka-JSON vahvistaa "Oma" löytyy 9 syötteen joukosta virheettä. **"Oma" on TÄLLÄ HETKELLÄ TYHJÄ kalenteri** — Juha ei ole vielä siirtänyt mitään omia menojaan sinne, se on tarkoituksella hänen TULEVA yksityinen tilansa. Hänen nykyiset henkilökohtaiset menonsa elävät toistaiseksi JAETUSSA "Juha"-kalenterissa (10 kpl nähtynä hänen omalta tililtään, 3 kpl nähtynä Katrin tililtä samasta kalenterista — **tunnettu, ei-toimenpidettä-vaativa epäsynkka**: iCloudin oma jakosynkka tasoittaa tämän eron ajan myötä, ei Sataman bugi, ei RLS/UID-ongelma — seurataan, ei koodimuutosta). **Live-käyttöliittymätesti (Juha lisää tapahtuman "Oma"-kalenteriin → näkyy vain hänen Hytissään, ei Katrille) ON VIELÄ TEKEMÄTTÄ** — ks. PALUU.md.

**Aikabudjetti ja tietoiset rajaukset** (max 4 päivää koko tälle ominaisuudelle sovittu, "toimiva suppea voittaa keskeneräisen täydellisen"):
- **Hakuikkuna (korjattu 2026-07-08 illalla, ks. "BUGI A" alla):** `PAIVIA_TAAKSEPAIN = 30` (~1 kk) ja `PAIVIA_ETEENPAIN = 365` (~12 kk), molemmat vakioina `api/caldav-sync.js`:n alussa, helppo säätää. Alkuperäinen versio ei hakenut taaksepäin ollenkaan ja ulottui vain 30 päivää eteenpäin — kauempana tulevaisuudessa olevat tapahtumat jäivät kokonaan löytymättä.
- **Toistuvat tapahtumat (RRULE) puretaan itse ICAL.js:n `event.iterator()`:lla**, EI luoteta CalDAV-palvelimen valinnaiseen server-side expand -ominaisuuteen (joka oli ensimmäisessä suunnitelmassa, mutta ei toimisi `ics_url`-syötteillä joissa ei ole CalDAV-palvelinta ollenkaan) — tämä toimii YHTENÄISESTI molemmilla syötetyypeillä. Ks. "BUGI B" alla poikkeus-/peruutuskäsittelyn korjauksesta.
- Turvaraja `MAX_ESIINTYMAA_SARJASSA = PAIVIA_TAAKSEPAIN + PAIVIA_ETEENPAIN + 30` per toistuva sarja (skaalautuu automaattisesti hakuikkunan mukaan, kattaa PÄIVITTÄISEN toiston koko ikkunan ajalta), ettei viallinen/loputon RRULE voi jumittaa funktiota
- **Ei kirjoiteta mitään takaisin iCloudiin** (pull-only) — kaksisuuntaisuus vasta kun yksisuuntainen veto on todistetusti luotettava, tämä oli eksplisiittinen päätös

**Tekniset kiemurat:**
- `api/caldav-sync.js` käyttää kirjastoja `tsdav` (CalDAV-yhteys) ja `ical.js` (iCal-jäsennys + toistuvuuden purku) — ensimmäiset npm-riippuvuudet koko projektissa, siksi `package.json`/`package-lock.json` ovat nyt olemassa juuressa. Koskevat VAIN Vercelin serverless-funktioita, eivät etusivun vanilla-JS-koodia (ei build-vaihetta index.html/script.js/style.css:lle).
- **Aikavyöhyke hoidettu tarkoituksella erikoistapauksena:** Vercel ajaa funktiot UTC-aikavyöhykkeellä. Koko päivän tapahtumille (`ICAL.Time.isDate === true`) päivämäärä luetaan suoraan `.year`/`.month`/`.day`-kentistä, EI koskaan `toJSDate()` + paikallinen `getDate()`-reitin kautta, koska se siirtäisi päivän yhdellä taaksepäin UTC-palvelimella (todennettu käsin testillä ennen koodin kirjoittamista). Ajallisille tapahtumille kellonaika muunnetaan `Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', hourCycle: 'h23' })`:lla — HUOM `hourCycle: 'h23'` eikä `hour12: false`, koska jälkimmäinen tuottaa joissain ICU-versioissa "24" eikä "00" keskiyöllä.
- `on_conflict=ical_uid` + `Prefer: resolution=merge-duplicates` (ent. `ignore-duplicates` — muutettu 2026-07-08 illalla peilisäännön vaatimana, ks. "Kalenterin periaate" -osio) Supabase-lisäyksissä tekevät synkasta turvallisen ajaa useasti peräkkäin/päällekkäin, ja PÄIVITTÄVÄT olemassa olevan rivin jos iCloudissa muokattu.
- **sw.js piti korjata tätä varten:** service workerin cache-first-logiikka olisi cachennut `/api/caldav-sync`:n GET-vastauksen ensimmäisen kutsun jälkeen ja tarjoillut täsmälleen saman vastauksen ikuisesti sen jälkeen (GET-pyynnöt jäävät kiinni `caches.match()`:iin, POST-pyynnöt eivät — siksi `api/add.js` ei koskaan kärsinyt tästä). Korjattu lisäämällä `/api/`-polut samaan poikkeukseen kuin `supabase.co`-kutsuilla jo oli (`sw.js`, `fetch`-tapahtumankuuntelija) — kattaa automaattisesti kaikki tulevatkin `/api/`-endpointit.
- **Vercel Cron ei ole käytössä** (Hobby-tason cron-jobit toimivat vain kerran vuorokaudessa eivätkä täsmällisesti). Sen sijaan `/api/caldav-sync` kutsutaan sovelluksesta (`script.js`: `synkkaaICloud()`) aina kun Kalenteri-näkymä avataan. **Ratkaistu 2026-07-10 Muistutukset-ominaisuuden yhteydessä:** `.github/workflows/muistutukset-cron.yml` on ilmainen GitHub Actions -ajastettu workflow joka kutsuu `/api/caldav-sync`:ia JA `/api/muistutukset-laheta`:a 5 min välein — ei vaadi Vercel Pro -tasoa. Ks. "Muistutukset"-osio täydelle selitykselle.

**UI (päivitetty kuittausjonolle 2026-07-08 illalla, ks. "Kalenterin periaate" -osio täydelle selitykselle):**
- Kalenteri-laatan merkki etusivulla (`.tile-badge[data-osio-key="kalenteri"]`, sama yleinen mekanismi kuin Laiturin uusien-merkillä) näyttää "uudet minulle" -tapahtumien määrän (`onkoUusiMinulle()`-suodatus, EI enää `kalenteri_odottavat`-rivien laskenta), päivittyy `paivitaKuittausTila()`:llä
- Kalenteri-näkymän yläosaan ilmestyy "🆕 N uutta — näytä" -linkki (`#kalenteri-kuittaus-linkki`, ent. `#kalenteri-odottaa-linkki`) kun jotain on kuittaamatta
- Linkin klikkaus avaa `#kalenteri-kuittaus-overlay`-dialogin (ent. `#kalenteri-hyvaksynta-overlay`): yksi kortti per uusi tapahtuma, värillinen pallo (`kalenteri_syotteet.vari`) kertoo lähdesyötteen, YKSI "✓ Kuittaa" -nappi per kortti (EI Hylkää-nappia enää — kuittaus ei koskaan poista mitään) + "Kuittaa kaikki" -nappi dialogin alaosassa
- Agendan riveillä (`piirraKalenteriRivi()`) sama värillinen pallo kertoo syötteen; LISÄKSI pieni `.kalenteri-uusi-merkki` ("uusi") -tagi näkyy suoraan agendan rivillä (ei tarvitse avata erillistä overlayä), napautus kuittaa suoraan siitä
- `lataaKalenteri()` hakee värin `kalenteri_syotteet(vari)`-upotuksella samassa kyselyssä (`select('*, kalenteri_syotteet(vari)')`) — `*` tuo mukana myös `ical_uid`/`user_id` jotka `onkoUusiMinulle()` tarvitsee

**Testaus ilman oikeaa työkalenteria — todistettu putki ennen oikeaa dataa:** koska Juhan oikeaa työkalenteria ei ole vielä olemassa/tiedossa, koko `vain_varattu`-anonymisointiputki voidaan todistaa toimivaksi jo etukäteen: luo mikä tahansa testikalenteri (iCloud tai Google Kalenteri käy), julkaise se julkiseksi ICS-linkiksi, lisää se `kalenteri_syotteet`-tauluun `tyyppi='ics_url'`, `mode='vain_varattu'`. Kun oikea työkalenteri joskus tulee, jäljellä on vain yksi datarivin lisäys — EI koodimuutosta.

**Varasuunnitelma jos työnantajan kalenteri ei tue ICS-julkaisua:** monet yritykset käyttävät Microsoft Exchange/Outlookia, joka ei aina salli julkisen ICS-linkin julkaisua. Jos näin käy, vaihtoehto on Microsoft Graph API -integraatio (OAuth-kirjautuminen Juhan työtilille, ei julkinen linkki) — tämä on selvästi isompi työ (OAuth-flow, tokenin uusinta, eri API-muoto kokonaan) eikä kuulu tähän E1-versioon. Kirjattu tähän ettei unohdu jos ICS-linkki osoittautuu mahdottomaksi saada.

**Tunnetut rajoitukset / ei tehty tässä vaiheessa:**
- Ei kirjoiteta mitään takaisin iCloudiin (pull-only, PYSYVÄ päätös — ks. "Kalenterin periaate" -osio kohta 1), MUTTA muutokset/poistot iCloudin päässä peilautuvat Satamaan (ks. "Kalenterin periaate" -osio kohta 4)
- Organizer-pohjainen tekijätunnistus EPÄVARMA henkilökohtaisilla kalenterimerkinnöillä (ks. "Kalenterin periaate" -osio kohta 3) — varasuunnitelma (kaikille "uusi", "Kuittaa kaikki") on aktiivinen oletus toistaiseksi
- Katrin oman iCloud-tilan täyttymisen aiheuttamaa katkoa ei ratkaista koodilla
- **Testattu 2026-07-08 illalla** (`sql/014_kalenteri_syotteet.sql` ajettu) — tästä testistä löytyi kaksi asiaa: 1) kaikki perheen tapahtumat eivät olleet jaetussa kalenterissa, osa eli Juhan henkilökohtaisissa kalentereissa joita Katrin tunnukset eivät nähneet (korjattu: tuki toiselle CalDAV-tilille, ks. "Useampi CalDAV-tili" yllä), 2) **`kalenteri_syotteet`-taulu oli tosiasiassa TYHJÄ koko ajan** — synkka ei koskaan tuonut mitään koska mitään syöteriviä ei ollut olemassa, ei koodivirhe. Korjattu siirtämällä syötedatan lisäys omaksi versioiduksi migraatiokseen (`sql/019_kalenteri_syotteet_data.sql`) — ks. **PERIAATE**-huomautus yllä "Tiedostorakenne"-osion lopussa: kaikki data, myös syötteet, kulkee migraationa, ei koskaan irtokomentona SQL Editoriin.

### Ajolista #1 — AJETTU 2026-07-08 illalla (historiaa, säilytetty kontekstiksi)

1. **`sql/017_kalenteri_tilit.sql`** — lisää `kalenteri_syotteet.account_key`-sarakkeen. VAADITAAN ennen kohtaa 3. **Ei turvallinen ajaa uudelleen** jos on jo ajettu (`alter table add column` kaataa virheellä "column already exists") — jos epävarma onko jo ajettu, tarkista ensin: `select column_name from information_schema.columns where table_name='kalenteri_syotteet' and column_name='account_key';` (jos palauttaa rivin, on jo ajettu, ohita).
2. **`sql/018_kalenteri_monipaivainen.sql`** — lisää `event_end_date`-sarakkeen (`kalenteri_tapahtumat`/`kalenteri_odottavat`). RIIPPUMATON kohdista 1 ja 3, voi ajaa missä välissä tahansa. Samat "ei turvallinen ajaa uudelleen" -ehdot kuin kohdassa 1 (tarkistus: `select column_name from information_schema.columns where table_name='kalenteri_tapahtumat' and column_name='event_end_date';`).
3. **`sql/019_kalenteri_syotteet_data.sql`** — lisää kolme syöterivia Katrin tilille (Perhekalenteri/Juha/Katri, `mode='taysi'`) + uniikki-rajoite. VAATII kohdan 1 (`account_key`-sarakkeen) olevan olemassa, epäonnistuu selkeällä virheellä jos ei ole. **Turvallinen ajaa uudelleen** — `on conflict (tunniste, account_key) do nothing` estää tuplarivit, mutta uniikki-rajoitteen LUONTI itsessään (`add constraint`) kaatuu jos rajoite on jo olemassa edellisestä ajosta — jos näin käy, poista se rivi (`alter table ... add constraint ...`) tiedostosta käsin ennen uudelleenajoa TAI jätä koko migraatio ajamatta jos se on jo onnistuneesti ajettu kerran.

**Sen jälkeen:** avaa Sataman Kalenteri-näkymä (käynnistää synkan automaattisesti) TAI avaa selaimessa `https://kauppalista-nine.vercel.app/api/caldav-sync` suoraan nähdäksesi onnistumisen JSON-vastauksena. "laivatesti joulukuussa" (Perhekalenterissa) pitäisi nousta "⏳ N odottaa hyväksyntää" -jonoon.

~~Juhan tili on OMA, myöhempi vaihe~~ — **TOTEUTETTU 2026-07-11**, ks. `sql/030_kalenteri_syotteet_data_juha.sql` ja "Testattavaa seuraavaksi" -osion vastaava kohta.

### Ensimmäisen testin löydökset (2026-07-08 illalla): BUGI A ja BUGI B

**HUOM tämän jälkeen ("Ajolista #2" alla) rakennettiin lisäksi koko "yksi totuus, kaksi ikkunaa" -arkkitehtuuri** — hyväksyntäjono poistui käytöstä kokonaan, ks. "Kalenterin periaate" -osio. Tekstit alla (mm. "⏳ N odottaa hyväksyntää") kuvaavat sitä hetkeä kun tämä testi tehtiin, EIVÄT nykyistä toteutusta.

Kun 017–019 oli ajettu ja synkka käynnistettiin, jonoon tuli 15 tapahtumaa — synkka TOIMI (siis 017–019-vaiheen jälkeen data ei ollut enää ongelma), mutta paljasti kaksi erillistä bugia molemmat liittyen siihen "miten synkka käsittelee päivämääriä":

**BUGI A — hakuikkuna liian lyhyt:** "laivatesti joulukuussa" (Perhekalenterissa) EI tullut jonoon ollenkaan, koska haku ei ulottunut niin pitkälle tulevaisuuteen. Syy: `alku` oli suoraan nyt-hetki (EI taaksepäin ollenkaan) ja `loppu` vain `PAIVIA_ETEENPAIN = 30` päivää eteenpäin — heinäkuussa haettuna joulukuu oli reilusti ikkunan ulkopuolella. **Korjattu:** `PAIVIA_TAAKSEPAIN = 30` + `PAIVIA_ETEENPAIN = 365`, molemmat nimettyinä vakioina `api/caldav-sync.js`:n alussa (ei haudattuna syvemmälle). `MAX_ESIINTYMAA_SARJASSA`-turvaraja skaalautuu automaattisesti näiden mukaan (`= PAIVIA_TAAKSEPAIN + PAIVIA_ETEENPAIN + 30`), koska kiinteä 60:n raja olisi katkaissut päivittäiset toistot kesken 12 kk ikkunaa.

**BUGI B — toistuvat tapahtumat purkautuivat väärin (haamuesiintymä):** 'Ilmoittaudu kouluun' tuli jonoon 3 kertaa: 2× oikein 6.8. (iCloudissa on todella 2 erillistä merkintää) + 1× VIRHEELLISESTI 8.8., jolle ei ole mitään oikeaa tapahtumaa. **Syy:** toistuva tapahtuma (RRULE) voi sisältää yksittäisen kerran POIKKEUKSEN — erillinen VEVENT samalla UID:llä mutta omalla RECURRENCE-ID:llä, joka kertoo että TÄMÄ nimenomainen kerta on siirretty toiseen päivään (tai peruttu, `STATUS:CANCELLED`). `ical.js` liittää tällaiset poikkeukset automaattisesti masterin `ICAL.Event`-olioon (koska `vevent.parent` osoittaa koko kalenteriin), MUTTA vain jos niitä käytetään `event.getOccurrenceDetails(esiintymä)`:n kautta. Aiempi koodi käytti iteraattorin RAAKAA (aina alkuperäistä, ei koskaan korvattua) aikaa suoraan — jolloin siirretty kerta tuotti haamuesiintymän vanhaan päivään SEN LISÄKSI että korvaava VEVENT muutenkin tuotiin omana tapahtumanaan.

**Korjaus (`jasennaTapahtumat()`, `api/caldav-sync.js`):**
1. Poikkeus-VEVENTejä (`vevent.hasProperty('recurrence-id')`) ei enää käsitellä erikseen omana tapahtumanaan — ne tulevat AINA sisään masterin iteroinnin kautta.
2. Masterin iteroinnissa kutsutaan JOKAISELLE iteraattorin palauttamalle ajalle `event.getOccurrenceDetails(esiintyma)` ja käytetään SEN palauttamaa (mahdollisesti korvattua) `startDate`/`endDate`/`item.summary`:a — ei raakaa `esiintyma`:a. UID:n loppuosana pysyy AINA alkuperäinen `esiintyma` (recurrence-id), ei korvattu aika, jotta samasta kerrasta ei syntyisi uutta UID:tä jos se joskus siirretään uudelleen.
3. Jos poikkeuksen `STATUS` on `CANCELLED`, kerta jätetään kokonaan tuomatta (peruttu yksittäinen kerta toistuvasta sarjasta).

**Testattu paikallisesti ennen käyttöönottoa** (ei vain koodin lukemalla): kirjoitettu synteettinen testi-ICS jossa viikoittainen 4 kerran sarja, yksi kerta siirretty ja yksi peruttu, ajettu oikeaa `ical.js`-kirjastoa (v2.2.1) vasten Node:lla. Tulos täsmäsi odotukseen (3 oikeaa tapahtumaa, ei haamuja, siirretty kerta oikealla päivällä ja otsikolla, peruttu kerta puuttuu kokonaan).

**Tunnettu jäljelle jäävä rajoitus (tietoinen, ei korjattu — matala riski):** jos poikkeuksen ALKUPERÄINEN ajankohta (recurrence-id) on hakuikkunan ULKOPUOLELLA mutta sen SIIRRETTY ajankohta on ikkunan SISÄPUOLELLA, tätä kertaa ei löydy — koska iteraattori käy läpi vain RRULE:n omia (alkuperäisiä) aikoja hakuikkunan sisällä, ei koskaan poikkeuksen uutta aikaa jos alkuperäinen olisi jäänyt ikkunan ulkopuolelle. Katrin oma ohje sovellettu tähän: "parempi jättää tuomatta kuin tuoda haamuja" — tämä on olemassa oleva, dokumentoitu rajoitus, ei uusi bugi.

**Jonon tyhjennys — `sql/020_tyhjenna_kalenteri_odottavat.sql` EI TARVITSE AJAA OLLENKAAN:** tämä migraatio kirjoitettiin alunperin poistamaan 15 BUGI A/B:tä edeltävää virheellistä jonoriviä `kalenteri_odottavat`-taulusta. Sitten arkkitehtuuri muuttui koko lailla ("yksi totuus, kaksi ikkunaa") ennen kuin Katri ehti ajaa sitä — `sql/022_kalenteri_puhdas_alku.sql` (ks. Ajolista #2 alla) tekee TÄSMÄLLEEN saman `kalenteri_odottavat`-tyhjennyksen JA lisäksi siivoaa `kalenteri_tapahtumat`-taulun synkatun datan. **Aja siis suoraan 021→022→023, OHITA 020 kokonaan** — tiedosto on jätetty `sql/`-kansioon historiaksi/numerojärjestyksen säilyttämiseksi, mutta sen ajaminen ei ole tarpeen (eikä haittaisi jos joku ajaisi sen vahingossa, koska 022 kattaa sen).

### Ajolista #2 — arkkitehtuurimuutos "yksi totuus, kaksi ikkunaa" (kirjattu 2026-07-08 illalla, AJETTU — todistettu toimivaksi 2026-07-10 testisessiossa, ks. "Kahden puhelimen testisessio" -osio. **Migraatiot ovat sittemmin jatkuneet paljon pidemmälle (024-030+) — ajantasainen, konsolidoitu ajolista on AINA PALUU.md:ssä, ei tässä historiallisessa osiossa.**)

1. **`sql/021_kalenteri_kuittausjono.sql`** — uudet taulut `kalenteri_tekijat` ja `kalenteri_kuittaukset`. RIIPPUMATON muista, ei muuta olemassa olevaa skeemaa.
2. **`sql/022_kalenteri_puhdas_alku.sql`** — poistaa KAIKKI aiemmin synkatut rivit (`kalenteri_tapahtumat` where `syote_id is not null`) ja tyhjentää `kalenteri_odottavat`-taulun kokonaan. EI KOSKE käsin lisättyihin tapahtumiin. **Turvallinen ajaa uudelleen** (tyhjän datan poistaminen on no-op). Tarkoitus: puhdas pöytä uudelle mallille — vanhan mallin (hyväksyntäjono) aikana syntynyt data ei ole enää relevanttia. **Korvaa/sisältää `sql/020_tyhjenna_kalenteri_odottavat.sql`:n koko toiminnan — 020:tä EI TARVITSE AJAA ENÄÄ OLLENKAAN, vaikka sitä ei olisi ehtinyt ajaa aiemmin.** Jos 020 sattui tulla ajettua välissä, se ei haittaa (yhteensopiva, molemmat tyhjentävät samaa taulua).
3. **`sql/023_asetukset.sql`** — RIIPPUMATON, luo yleisen `asetukset`-avainarvotaulun + siemenrivin `paivan_menoraja=5` (Kuormavahti, ks. oma osio). Voi ajaa missä välissä tahansa 1–2:n kanssa.

**Sen jälkeen:** avaa Kalenteri-näkymä (käynnistää synkan uudella koodilla — suora kirjoitus `kalenteri_tapahtumat`-tauluun, ei enää jonoa) TAI `GET /api/caldav-sync`. Testaa: 1) tapahtumat näkyvät agendassa VÄLITTÖMÄSTI (ei enää "N odottaa hyväksyntää" -viivettä), 2) toisen lisäämät (tai tekijättömät, ks. varasuunnitelma) saavat "uusi"-tagin agendassa + nousevat "🆕 N uutta" -linkin taakse, 3) "✓ Kuittaa" ja "Kuittaa kaikki" toimivat, tagi häviää kuittauksen jälkeen, 4) muokkaa/poista testitapahtuma iPhonen Kalenterista ja synkkaa uudelleen — muutoksen/poiston pitäisi näkyä Satamassa (peilisääntö). Suosittelen myös ajamaan `GET /api/caldav-sync?esikatsele=1` ainakin kerran ja tarkistamaan näkyykö `organizer`-kentässä mitään — kerro tulos, siitä päätetään täytetäänkö `kalenteri_tekijat`-taulua.

**Hionta myöhemmin (Copilot-aikaan, ei kiire — Katrin oma lista 2026-07-08):**
- Kuukausiruudukon monipäiväisen tapahtuman palkki kapeammaksi ja visuaalisesti yhtenäiseksi päivien yli (nyt jokainen päivän palkkisegmentti on oma laatikkonsa — ks. "Oma Hytti"-osion... ei, ks. tämän osion "Monipäiväiset tapahtumat"-kappale yllä, `.kalenteri-kuukausi-palkki`)
- ~~Kalenterin otsikko + päivämäärä isommaksi mobiilissa~~ — TEHTY 2026-07-10, ks. "Ulkokäytettävyys ja kontrasti"-osio (`.kalenteri-paiva-otsikko` 13→15px ym.)
- ~~Päivämäärälle/kellonajalle oma erottuva väri agendassa (nyt `var(--muted)`, sama kuin muu toissijainen teksti)~~ — TEHTY 2026-07-10: `.kalenteri-aika` sai oman `--accent-text`-värinsä, ks. "Ulkokäytettävyys ja kontrasti"-osio

## Push-ilmoitukset (2026-07-08)

Yleiskäyttöinen web push -infra — EI sidottu mihinkään yksittäiseen ominaisuuteen, vaan perusta kaikelle tulevalle joka tarvitsee ilmoituksia (muistutukset, Horisontti-ehdotukset, kalenterin kuittausjonon herätteet ym.). Tässä vaiheessa rakennettu VAIN tilaus + manuaalinen testilähetys — AJASTETTUA lähetystä (esim. cron joka tarkistaa erääntyviä muistutuksia) EI ole vielä, se tulee omana myöhempänä palasenaan kun ensimmäinen oikea muistutusominaisuus rakennetaan.

**VAPID-avainpari** generoitu `web-push`-kirjastolla 2026-07-08. Julkinen avain on suoraan `script.js`:ssä koodissa (`VAPID_PUBLIC_KEY`-vakio) — tämä on tarkoituksellista, julkinen avain SAA näkyä selaimelle, vain yksityinen avain on salainen. Yksityinen avain on Vercelin ympäristömuuttujissa:
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (sensitive) / `VAPID_SUBJECT` (muotoa `mailto:joku@osoite.fi` — mikä tahansa toimiva sähköposti kelpaa, push-palvelut käyttävät tätä vain hätätapauksessa ottaakseen yhteyttä lähettäjään)
- **Nämä on jo asetettu Vercelin puolella 2026-07-08** — jos joskus generoidaan uusi avainpari (esim. vanha vuotaa), KAIKKI olemassa olevat `push_tilaukset`-rivit lakkaavat toimimasta ja käyttäjien pitää tilata ilmoitukset uudelleen, koska selaimen tilaus on sidottu siihen avainpariin jolla se luotiin.

**Tietokanta (`sql/015_push_tilaukset.sql`):** taulu `push_tilaukset` (user_id, endpoint UNIQUE, p256dh, auth, failed_count). RLS: käyttäjä hallitsee vain omia rivejään (select/insert/update/delete kaikki `auth.uid() = user_id`) — UPDATE-policy tarvitaan koska frontend käyttää `upsert`:ia (sama laite voi tilata uudelleen, silloin `ON CONFLICT (endpoint) DO UPDATE` -haara vaatii UPDATE-oikeuden RLS:ssä, ei riitä pelkkä INSERT-policy). Itse lähetys (`api/push-test.js`) käyttää service_role-avainta ja ohittaa RLS:n kokonaan — tavallinen käyttäjä ei koskaan lähetä pushia suoraan.

**sw.js:** kaksi uutta tapahtumankuuntelijaa:
- `push` — näyttää ilmoituksen (`self.registration.showNotification`). Payload on aina JSON `{title, body}`; jos JSON-jäsennys epäonnistuu, näytetään silti geneerinen ilmoitus tekstillä ettei push katoa täysin hiljaa.
- `notificationclick` — sulkee ilmoituksen ja joko fokusoi jo auki olevan PWA-ikkunan tai avaa uuden. Ei reititä mihinkään tiettyyn näkymään (esim. suoraan Kalenteriin) — tämä on tarkoituksellista yksinkertaisuutta ensimmäisessä versiossa, voidaan tarkentaa myöhemmin jos tarpeen.

**Frontend (`script.js`, uusi "PUSH-ILMOITUKSET"-osio):**
- `paivitaPushTila()` — tarkistaa selaintuen, `Notification.permission`-tilan (`'granted'`/`'denied'`/`'default'`) ja onko `pushManager.getSubscription()` jo olemassa, päivittää Asetukset-näkymän tekstin ja nappien näkyvyyden sen mukaan
- `pyydaIlmoitusLupa()` — kutsutaan VAIN "Salli ilmoitukset" -napin klikkauksesta, EI koskaan automaattisesti sivun latautuessa. Tämä on iOS:n vaatimus: `Notification.requestPermission()` pitää laueta suoraan käyttäjän omasta napinpainalluksesta, muuten selain hylkää pyynnön hiljaisesti. Onnistuneen luvan jälkeen tilataan `pushManager.subscribe(...)` ja tallennetaan tilaus (`endpoint`/`p256dh`/`auth`) Supabaseen `upsert`:illa (`onConflict: 'endpoint'`, jottei sama laite luo tuplariviä jos se tilaa uudelleen).
- `laheteTestipush()` — "Lähetä testi-ilmoitus" -napin handleri, hakee oman istunnon `access_token`:n (`db.auth.getSession()`) ja lähettää sen `Authorization: Bearer`-headerissa `/api/push-test`:lle, joka tunnistaa käyttäjän sillä (ks. alla). Tulos näytetään `naytaIlmoitus()`-toastilla (sama mekanismi kuin pakkauslistan nollauksessa).
- `urlBase64ToUint8Array()` — vakioapufunktio VAPID-julkisen avaimen muuntamiseksi `pushManager.subscribe()`:n vaatimaan `Uint8Array`-muotoon, ei mitään Satama-spesifistä.

**Asetukset-näkymä (`#asetukset-view`, `index.html`):** "🔔 Ilmoitukset" on yksi neljästä osiosta — koko näkymä laajennettu v1:ksi 2026-07-08 illalla, ks. oma "## Asetukset" -osio alempana täydelle kuvaukselle.

**`api/push-test.js`:** tunnistaa kutsujan `Authorization: Bearer <access_token>` -headerista kutsumalla Supabasen `/auth/v1/user`-endpointia (EI service_role-tunnistusta, oikea käyttäjä-JWT) — näin funktio ei koskaan voi vahingossa lähettää pushia väärälle käyttäjälle. Hakee vain SEN käyttäjän `push_tilaukset`-rivit, lähettää jokaiseen `web-push`:lla. Jos push-palvelu vastaa 404/410 (tilaus ei ole enää voimassa, esim. appi poistettu laitteelta), rivi poistetaan automaattisesti `push_tilaukset`-taulusta. Muun virheen sattuessa `failed_count`-sarake kasvaa (ei vielä käytössä mihinkään logiikkaan, kerää dataa mahdollista myöhempää "poista jos epäonnistunut N kertaa" -siivousta varten).

**iOS-reunaehdot (tärkeitä muistaa testatessa):**
- Push toimii VAIN kotinäytölle asennetussa PWA:ssa, ei tavallisessa Safari-välilehdessä, ja vaatii iOS 16.4+
- Ilmoitus on tavallinen järjestelmäilmoitus, EI herätyskellomainen kriittinen hälytys (ei toimi jos puhelin on Älä häiritse -tilassa/mykistetty, ei omaa erillistä lupatasoa)
- Jos käyttäjä on joskus evännyt luvan, sitä EI voi enää kysyä uudelleen `Notification.requestPermission()`:lla — täytyy mennä puhelimen omiin asetuksiin (Safarin PWA-asetukset per sivusto) ja sallia sieltä käsin. `paivitaPushTila()` näyttää tästä selkeän tekstin (`Notification.permission === 'denied'` -haara) sen sijaan että nappi vain ei tekisi mitään

**Ei vielä tehty / seuraava askel (oma myöhempi työnsä, ei tässä):**
- ~~Ajastettu lähetys~~ — TEHTY 2026-07-10 Muistutukset-ominaisuuden yhteydessä, ks. "Muistutukset"-osio (GitHub Actions -cron, `api/muistutukset-laheta.js`)
- Ilmoituksen napautuksen reitittäminen tiettyyn näkymään (nyt vain fokusoi/avaa appin etusivulle)
- `failed_count`:in käyttö automaattiseen tilauksen poistoon toistuvien epäonnistumisten jälkeen

## Muistutukset (v1, 2026-07-10)

Henkilökohtainen push-muistutus listan riville, kalenteritapahtumalle tai ankkurille. Rakentuu kokonaan valmiin push-infran päälle (ks. "Push-ilmoitukset"-osio yllä) — ei kosketa kalenterisynkan logiikkaan.

**Tietomalli (`sql/025_muistutukset.sql`):** `muistutukset (id, user_id, source 'rivi'|'kalenteri'|'ankkuri', source_ref text, content text, remind_at timestamptz, sent_at timestamptz|null, created_at)`. `source_ref` on TEXT eikä oikea FK, koska sama taulu palvelee kolmea eri lähdetaulua — sama malli kuin `ankkurit`-taulun oma `source`/`source_ref`-pari. `content` on TEKSTIKOPIO asetushetkeltä (ei viittaus alkuperäiseen riviin), jotta push toimii vaikka rivi muuttuisi/katoaisi ennen erääntymistä. RLS: vain omat rivit (select/insert/delete) — **ei update-policya**, koska muistutusta ei muokata (poisto+uusi riittää, EI V1:EEN). `sent_at` asetetaan AINOASTAAN palvelimelta `service_role`-avaimella, joka ohittaa RLS:n.

**Kello-nappi (⏰) kolmessa paikassa** — listarivit (`paivitaNaytto()`), kalenteritapahtuman rivi (`piirraKalenteriRivi()`, ei Hytti/ankkuri-rivit kalenterin sisällä), etusivun Ankkurit (`lataaAnkkurit()`). Yhtenäinen `luoMuistutusNappi(source, sourceRef, content, eventDate, eventTime, jalkeenPaivitys)` — sama malli kuin ⚓-napin `vaihdaAnkkurointiYleinen()`. Ontto/muted = ei muistutusta; kulta (`--accent`) + pieni aikamerkki oikealla puolella = asetettu (yhden muistutuksen aika "N.K. klo HH:MM", useamman "×N").

**Muistutuksien "kartta" (`muistutuksetKartta`, `paivitaMuistutuksetKartta()`):** sama Set/Map-pohjainen "mitä on jo asetettu" -kuvio kuin `ankkuroidutAvaimet`/`kuitatutUidt` — haetaan kerran per näkymän lataus (`lataaLista()`, `lataaKalenteri()`, `lataaAnkkurit()`), avain `source:source_ref`.

**Muistutuspaneeli (`#muistutus-overlay`, `avaaMuistutusPaneeli()`):** avautuu kellon napautuksesta.
- Jos push EI ole käytössä TÄLLÄ laitteella (`onkoPushKaytossa()`: lupa myönnetty JA aktiivinen tilaus), koko lomake piilotetaan ja näytetään sen sijaan ohje + "Asetuksiin"-nappi (`avaaOsio({route:'asetukset'})`, sama reitti kuin etusivun ruudukosta) — muistutuksen asettaminen ilman pushia olisi näennäinen ominaisuus joka ei koskaan herättäisi ketään.
- Olemassa olevat muistutukset listattuna (× poistaa), "lisää toinen" on aina mahdollista — useita muistutuksia samalle asialle kuten herätyskellossa.
- **Rulla-valitsin:** kaksi natiivia `<select>`-elementtiä (numero 1-59 + yksikkö min/tunti/vrk/viikko) — natiivi select renderöityy iOS Safarissa/PWA:ssa rullana ilmaiseksi, ei tarvinnut mitään erillistä kirjastoa. Aika lasketaan SUHTEESSA NYT-HETKEEN (asetushetkeen), ei tapahtuman aikaan.
- **Pikanapit** ("15 min ennen"/"1 h ennen"/"1 vrk ennen") näkyvät VAIN kun lähde on `'kalenteri'` JA tapahtumalla on kellonaika — laskevat `remind_at`:n suoraan tapahtuman `event_date`+`event_time`:stä miinus offset. **Tunnettu reunatapaus:** viikkonäkymässä monipäiväinen tapahtuma jonka `event_date` on eri kuin näytettävä päivä (esim. 3 pv kestävän tapahtuman 2. päivä) laskisi pikanapin ajan tapahtuman ALKUPERÄISESTÄ alkupäivästä, ei näytettävästä päivästä — harvinainen yhdistelmä (monipäiväinen tapahtuma jolla on myös kellonaika), ei erikseen ratkaistu.

**Lähetys (`api/muistutukset-laheta.js`):** hakee KAIKKI käyttäjät joiden `remind_at <= nyt AND sent_at IS NULL`, lähettää web-pushin jokaisen omistajan kaikkiin `push_tilauksiin` (sama lähetyslogiikka kuin `api/push-test.js`, mutta monelle käyttäjälle kerralla — ei siis kirjautuneen käyttäjän oman tokenin varassa). Suojattu jaetulla salaisuudella URL:ssa (`?avain=...`, verrataan `MUISTUTUKSET_CRON_SECRET`-ympäristömuuttujaan) koska kutsuja on ajastettu cron, ei kirjautunut selain — ilman tätä kuka tahansa netistä voisi laukaista massapushin. Merkitään `sent_at` VAIKKA lähetys epäonnistuisi kaikkiin tilauksiin (ei retry/backoff-järjestelmää V1:ssä, tietoinen yksinkertaistus).

**Ajastin (`.github/workflows/muistutukset-cron.yml`):** koska Vercel Hobby-cron ei riitä (ks. "Push-ilmoitukset"-osion päivitetty huomautus), ulkoinen laukaisin on ilmainen GitHub Actions -scheduled workflow (`cron: '*/5 * * * *'`), joka kutsuu SEKÄ `/api/muistutukset-laheta` ETTÄ `/api/caldav-sync`:ia samalla ajolla — kalenterisynkka pysyy nyt tuoreena myös silloin kun kukaan ei avaa sovellusta, sivuvaikutuksena. **HUOM GitHub Actionsin cron on "parhaan yrityksen" periaatteella** — GitHub voi viivästyttää ajoa ruuhka-aikoina, ±5 min tarkkuus on siis suuntaa-antava eikä taattu (hyväksytty reunaehto speksin mukaan).

**Kohteen poisto siivoaa sen muistutukset** — `poistaTuote()`, `piirraKalenteriRivi()`:n poistonappi ja `lataaAnkkurit()`:n irrotusnappi poistavat vastaavan `source`+`source_ref`-parin `muistutukset`-taulusta ennen päivitystä. **Tunnettu rajoitus:** kokonaisen LISTAN poisto (`deleteList()`, aiemmin `poistaLista()`) poistaa sen `tuotteet`-rivit suoraan `list_id`:n perusteella koskematta `muistutukset`-tauluun — jäisi orpoja rivejä jos listalla sattuisi olemaan aktiivisia muistutuksia, harvinainen reunatapaus, ei ratkaistu V1:ssä.

**Käytös:**
- Muistutukset ovat HENKILÖKOHTAISIA — jaetun listan rivin muistutus herättää vain sen asettajan (RLS: `user_id = auth.uid()`).
- Täppäämätön rivi/tapahtuma EI aiheuta uutta pushia — asia pysyy listalla luonnostaan, ei ränkytystä.
- EI V1:EEN (tietoisesti rajattu): toistuvat muistutukset, muistutuksen muokkaus (poisto+uusi riittää), äänivalinnat, "muistuta molempia".

**Ympäristömuuttujat tarvittu (Vercel):** `MUISTUTUKSET_CRON_SECRET` (uusi, sama arvo myös GitHub-reposecrettinä `MUISTUTUKSET_CRON_SECRET` .github-workflow'ta varten) — muut (VAPID_*, SUPABASE_SERVICE_KEY) ovat jo olemassa Push-ilmoitukset-ominaisuudesta.

**EI TESTATTU LAINKAAN** — aja `sql/025_muistutukset.sql`, aseta Vercelin ja GitHub-reposecretin `MUISTUTUKSET_CRON_SECRET` samaksi satunnaiseksi merkkijonoksi, tarkista että GitHub Actions -workflow näkyy reposikirjaston Actions-välilehdellä ja käynnistyy (voi laukaista käsin "Run workflow" -napista `workflow_dispatch`-liipaisimen ansiosta odottamatta 5 min). Testauslista: (1) listarivin kellosta "5 min" → push sulkeutuneeseen puhelimeen n. 5-10 min sisällä (cron-viive + tarkkuus huomioiden); (2) samalle riville kaksi muistutusta, molemmat tulevat; (3) kalenteritapahtuman "1 h ennen" laskee oikean ajan; (4) muistutuksen × poistaa sen ennen erääntymistä eikä pushia tule; (5) rivin/tapahtuman poisto tyhjentää sen muistutukset (Table Editorista tarkistettavissa); (6) laitteella jolla push ei ole käytössä, paneeli näyttää "Asetuksiin"-ohjeen eikä lomaketta.

## Asetukset (v1, laajennettu 2026-07-08 illalla)

**Periaate Katrilta:** Asetuksiin kuuluu vain se, mitä kosketaan HARVOIN — päivittäiset toiminnot pysyvät omissa näkymissään (esim. listan jako-kytkin pysyy listan omassa asetusdialogissa, ei tässä). Neljä osiota, katkoviivaerottimin (`<hr class="divider">`), tässä järjestyksessä:

1. **👤 Tili** — `#tili-sposti` näyttää kirjautuneen sähköpostin (`db.auth.getSession()`, päivittyy `paivitaTiliTiedot()`:lla). "Kirjaudu ulos" -nappi (`#asetukset-signout-btn`) kutsuu samaa `db.auth.signOut()`:ia kuin kotinäkymän alareunan `#signout-link` — **molemmat pidetty**, ei poistettu vanhaa, koska duplikaatti on halvempi kuin totuttujen paikkojen rikkominen.
2. **🔔 Ilmoitukset** — ennallaan, ks. "Push-ilmoitukset"-osio yllä.
3. **💡 Vinkit** — **dataohjattu 2026-07-13** (`sql/035_ohjeet_vinkit.sql`, `ohjeet`-taulu: `content`, `sort_order`), oli aiemmin 9 kovakoodattua `.vinkki-rivi`-diviä suoraan `index.html`:ssä. `lataaVinkit()` (script.js) hakee kaikki rivit `sort_order`-järjestyksessä ja piirtää ne `#vinkki-lista-data`-konttiin joka kerta kun Asetukset avataan — uuden vinkin voi nyt lisätä Table Editorista ilman koodimuutosta. Sama `ohjeet`-taulu on TARKOITUKSELLA sama jonka muistiinpanot.md:n Ohjebanneri-suunnitelma jo ennakoi ("kun Ohjebanneri-järjestelmä joskus rakennetaan, sama sisältö siirtyy ohjeet-tauluun") — kun Ohjebanneri joskus rakennetaan, tätä taulua LAAJENNETAAN nullable-sarakkeilla (`section_key`, `title`, ks. "Ohjebanneri-järjestelmä"-osio), ei tehdä rinnakkaista taulua. **"Missä muokataan mitäkin" -alaotsikon 5 riviä JÄTETTIIN TIETOISESTI ennalleen staattisina** — pyyntö koski nimenomaan yhdeksää päävinkkiä, ei tätä erillistä alilistaa.
4. **📱 Sovellus** — kaksi riippumatonta toimintoa:
   - **Versio + "Päivitä sovellus":** `paivitaSovellusTiedot()` lukee käytössä olevan service worker -välimuistin nimen `caches.keys()`:llä (EI kovakoodattua versionumeroa script.js:ssä — yksi totuuden lähde, `sw.js`:n `CACHE`-vakio). "Päivitä sovellus" -nappi (`paivitaSovellusValimuisti()`) tyhjentää KAIKKI cache-avaimet ja poistaa service workerin rekisteröinnin ennen uudelleenlatausta — järeämpi hätävara kuin passiivinen versionvaihto, tarkoitettu PWA-jumitilanteisiin.
   - **Kalenterisynkan tila + "Hae kalenteri nyt":** näyttää uusimman `kalenteri_syotteet.last_synced_at`:n suhteellisena aikana (`suhteellinenAika()`, esim. "14 min sitten"). Nappi (`synkkaaKalenteriNyt()`) kutsuu `/api/caldav-sync`:ia suoraan ja näyttää tuloksen `naytaIlmoitus()`-toastilla — säästää "odotellaanko cronia" -epätietoisuuden, koska Vercel Hobby-cron ei ole käytössä (ks. "Kalenterisyötteet"-osio).
~~5. 🚪 Oma Hytti~~ — **SIIRRETTY POIS Asetuksista 2026-07-11** (Hytti v1 -respeksaus): Kalenteri-integraation pois/päälle-kytkin (sama `localStorage`-avain/logiikka) elää nyt Hytin OMASSA päänäkymässä ("Opiskelu näkyvissä/piilossa" -tekstinä), ks. "Hytti v1 + opiskelulaajennus + ICS-syötekoneisto" -osio. Asetukset-näkymässä on nyt taas vain neljä osiota, alkuperäisen speksin mukaisesti.

**EI Asetuksiin** (kirjattu tietoisesti ettei kukaan lisää vahingossa myöhemmin): teemavalinta (automaattinen tumma/vaalea riittää), listakohtaiset asetukset (pysyvät listan omassa dialogissa), kieli/fonttikoko (iOS hoitaa).

**Myöhemmin tänne** (ei toteutettu, ei placeholder-riviä — kirjattu vain muistiin): aamukoosteen/sääilmoituksen ajastukset (tulevan "moottorit"-käsitteen myötä), Nostot-hallinta, osiokohtaiset ohjeet (Ohjebanneri-koneisto), Hytin nimen vaihto.

**Ei testattu ollenkaan tätä kirjoittaessa.**

## Oma Hytti (2026-07-08)

Henkilökohtainen työtila — Juhalle työasiat (papin caset), Katrille opiskelu. **TÄYSIN yksityinen: EI jakokytkintä, EI shared-haaraa ollenkaan** (poikkeaa siis Muistilapuista/Varastosta, joissa on näkyvyysvalinta) — RLS suodattaa aina vain kirjautuneen omat rivit, kumpikin näkee vain omansa vaikka näkymä ja koodi on yksi ja sama molemmille käyttäjille. Sama yksinkertaisin mahdollinen policy-malli kuin `ankkurit`-taulussa, mutta ei-jaettu versio siitä.

**Tietomalli (`sql/016_hytti.sql`, AJETTU Supabasessa 2026-07-08):**
- `hytti_kortit`: `id`, `owner_id`, `name`, `card_type` (`'paattyva'` = valmistuu ja arkistoituu / `'jatkuva'` = elää pitkään, ei koskaan arkistoida), `status` (`'aktiivinen'`/`'arkistoitu'`), `seuraava_askel` (text, näkyy kortin avatessa heti mistä jatkaa), `sort_order`
- `hytti_rivit`: `id`, `kortti_id` (FK), `content`, `is_header` (toimii täysin kuten `tuotteet.is_header` — `#`-etuliite lisäyskentässä tekee väliotsikon), `is_task`, `done`, `done_at`, `due_date` (nullable), `sort_order`
- RLS: `hytti_kortit_all` suoraan `owner_id = auth.uid()`. `hytti_rivit_all` kortin omistajuuden kautta (`exists`-alikysely) — rivit eivät kanna omaa `owner_id`:tä.

**Navigointi:** etusivun "Oma Hytti" -laatta (`home_sections.key = 'hytti'`, oli aina olemassa mutta osoitti `alert()`:iin) avaa nyt oikean näkymän — `avaaOsio()` `route === 'hytti'` -haara.

**HYTTI-PÄÄNÄKYMÄ (`#hytti-view`, `lataaHyttiPaanakyma()`):**
1. **Tehtävät-kooste** — kaikkien AKTIIVISTEN korttien avoimet (`is_task=true, done=false`) tehtävärivit yhtenä listana, järjestys eräpäivän mukaan nousevasti (deadlinettomat viimeisenä, `nullsFirst: false`). Haku käyttää `hytti_rivit!inner(...)`-embedausta jotta `hytti_kortit.status='aktiivinen'`-suodatus rajaa myös itse tehtävärivejä, ei vain sisäkkäistä objektia. Rivillä: teksti + eräpäivä päivinä ("4 pv" / "tänään" / "3 pv sitten" — AINA muted-värillä, EI punaista edes ylittyneelle, tietoinen valinta ettei lista näytä stressaavalta) + kortin nimi pienellä perässä. **Täppäys tässä täppää saman tietueen kortillakin — ei kopiota**, koska molemmat näkymät lukevat/kirjoittavat samaa `hytti_rivit`-riviä. ⚓-nappi nostaa/irrottaa Ankkureihin samalla yleisellä mekanismilla kuin Muistilaput/Kalenteri (`vaihdaAnkkurointiYleinen('hytti', rivi.id, ...)`) — Ankkurin täppäys etusivulla EI täppää alkuperäistä hytti-riviä (sama toteutunut käytös kuin muillakin ankkuroitavilla lähteillä, ei Hytti-spesifinen poikkeama).
2. **Kortit-listaus** — aktiiviset kortit, nimi + `seuraava_askel` pienellä sen alla. Raahausjärjestys (`alustaRaahaus`, taulu `hytti_kortit`). Napautus avaa korttinäkymän.
3. **Uusi kortti** -lisäysrivi: nimi-kenttä + tyyppivalinta (Jatkuva/Päättyvä-painikkeet, sama `.kalenteri-tila-btn`-tyyli kuin Kalenterin päivä/viikko/kuukausi-valitsimessa) + lyhyt selite tekstinä alla.
4. **Arkisto-linkki** alhaalla, näkyy vain jos arkistoituja kortteja on ≥1. Avaa overlay-listan joista klikkaus avaa kortin lukutilaan.

Jos aktiivisia kortteja ei ole yhtään, Tehtävät- ja Kortit-osiot piilotetaan kokonaan ja tilalla näkyy muted-tekstinä: *"Yksi kortti per tilaisuus tai kokonaisuus. Kirjoita muistiinpanot riveiksi, merkkaa toimintaa vaativat tehtäviksi — ne kokoontuvat itsestään ylös Tehtäviin. Ideat kuuluvat Laituriin, työn alla olevat tänne."*

**KORTTINÄKYMÄ (`#hytti-kortti-view`, `avaaHyttiKortti()` → `lataaHyttiKortti()`):**
- Otsikko + `seuraava_askel`-kenttä heti alla, napautus → inline-muokkaus (sama tekniikka kuin listan rivin nimen muokkaus: `<input>` korvaa `<span>`:n, `blur`/`Enter` tallentaa).
- Rivit lisätään kuten Muistilapuilla: `#`-etuliite tekee väliotsikon (`is_header`), otsikon napautus kohdistaa seuraavat lisäykset sen alle (`aktiivinenHyttiOtsikkoId`, sama periaate kuin `aktiivinenOtsikkoId`). Inline-muokkaus ja poisto (vahvistuksella) kaikilla riveillä.
- Jokaisella EI-otsikkorivillä on tehtävätoggle-nappi (☑, tyyliltään sama kuin ⚓-nappi): päälle kytkettynä rivi saa checkboxin (○/✓) ja eräpäivä-linkin ("+ eräpäivä" / "N pv"), napautus avaa `prompt()`-kentän päivämäärälle (VVVV-KK-PP, tyhjä poistaa). Pois kytkettäessä `done`/`due_date`/`done_at` nollautuvat.
- **"Arkistoi"-nappi** (📦, otsikkorivin oikeassa yläkulmassa) näkyy VAIN päättyvillä (`card_type='paattyva'`) aktiivisilla korteilla — jatkuvilla ei näy ollenkaan. Vahvistuksen jälkeen kortti siirtyy `status='arkistoitu'` ja näkymä palaa päänäkymään.
- **Lukutila:** kun avataan arkistoitu kortti (arkisto-overlaysta), sama näkymä renderöityy read-only-tilassa — ei lisäysriviä, ei muokkaus-/poisto-/tehtävänappeja, checkboxit disabloitu. Otsikkorivin nappi näyttää silloin "↩ Palauta" -toiminnon, joka vie kortin takaisin `status='aktiivinen'`ksi ilman erillistä vahvistusta (ei-destruktiivinen teko).

**EI V1:ssä (kirjattu, ei rakennettu — samat rajaukset kuin Katrin alkuperäisessä speksissä):** Ohjebanneri-koneisto (oma myöhempi osio, ks. "Ohjebanneri-järjestelmä — suunnitelma"), haku, rivien siirto korttien välillä, Laituri→Hytti-sijoitus, muistutukset tehtäville (tulee push+muistutukset-vaiheen yhteydessä samalla mekanismilla kuin muuallekin), Opiskelu-AI-kytkökset, hytin nimen vaihto (laatan nimi "Oma Hytti" riittää nyt).

**Kalenteri-integraatio (lisätty samana päivänä, Katrin pyynnöstä):** Kalenterin päivänäkymän tänään-agendaan (sama paikka johon aktiiviset Ankkuritkin sulautuvat) nostetaan nyt myös kaikki Oma Hytin tänään erääntyvät (`due_date` = tänään, `is_task=true`, `done=false`, kortti aktiivinen) tehtävät, tekstin edessä 🚪-ikoni. Rivillä on täppäysnappi (täppää saman `hytti_rivit`-tietueen, näkyy myös kortin sisällä) ja ⚓-nappi Ankkureihin nostoa varten (`vaihdaAnkkurointiYleinen('hytti', ...)`, sama mekanismi kuin Hytin omassa Tehtävät-koosteessa). Kytkin (`#hytti-kalenteri-toggle`, sama iOS-tyylinen `.toggle`-komponentti kuin listan jako-kytkimessä) — pois päältä kytkettynä Hytin tehtävät eivät nouse Kalenteriin ollenkaan. Kytkimen tila on **laitekohtainen** (`localStorage`-avain `kauppalista_hytti_kalenterissa`, oletus päällä), EI synkattu Supabaseen — sama periaate kuin muillakin tämän appin laitekohtaisilla asetuksilla (esim. `kauppalista_viimeisin_lista`). **SIIRRETTY 2026-07-11 Asetuksista Hytin omaan päänäkymään** (Hytti v1 -respeksaus, Katrin oma linjaus) — sama avain/logiikka, vain UI-sijainti ja teksti muuttuivat ("Opiskelu näkyvissä"/"Opiskelu piilossa", `paivitaHyttiTyoVapaaLabel()`). Ks. "Hytti v1 + opiskelulaajennus + ICS-syötekoneisto" -osio täydelle kuvaukselle.

**Testattu:** `sql/016_hytti.sql` on ajettu Supabasessa 2026-07-08. Kahden tilin testi (Katri + Juha, ettei kumpikaan näe toisen kortteja/tehtäviä missään näkymässä — ei päänäkymässä, ei Ankkureissa, ei Tehtävät-koosteessa, ei Kalenterin tänään-agendassa) on VIELÄ TEKEMÄTTÄ, ks. "Testattavaa seuraavaksi".

## Hytti v1 + opiskelulaajennus + ICS-syötekoneisto (speksattu 2026-07-11, RAKENNETTU 2026-07-11 samana päivänä)

**Alkuperäinen porttiehto purettu Katrin omalla päätöksellä samana päivänä** ("portti on purettu... rakenna kaikki valmiiksi, minä testaan kaiken kerralla tiistaina") — muistutustestiä EI ollut vielä ajettu läpi kun tämä rakennettiin, koska Katri lähti tauolle ja halusi kaiken valmiina yhteen testauskertaan tiistaiksi. Tämä oli tietoinen, eksplisiittinen käyttäjän päätös, ei hiljainen oikaisu — molempien pakettien (Muistutukset + Hytti/ICS) testaus on nyt yhtä lailla tekemättä, ks. PALUU.md.

### Migraatiot (ajojärjestys, ks. myös PALUU.md)

1. `sql/026_hytti_v1_respec.sql` — `hytti_kortit.kalenterisuodatin` (uusi sarake) + `muistutukset`-taulun check-rajoite laajennettu sallimaan `source='hytti_rivi'`.
2. `sql/027_kalenteri_syotteet_scope.sql` — `kalenteri_syotteet.scope` (`'perhe'`/`'hytti'`, oletus `'perhe'`) + **uusi `hytti_omistajat`-taulu** (henkilo→user_id-kartta, Katrin rivi valmiina inline) + **`kalenteri_tapahtumat`-taulun RLS-politiikan korjaus** (ks. alla, kriittinen yksityisyyskorjaus jota alkuperäinen speksi ei vielä eritellyt). ~~Juhan rivi lisättävä Table Editorista~~ — tämä oli asennusaukko (ks. "Kaikki data migraatioina" -periaate alla), korjattu `sql/033`:lla.
3. `sql/028_hytti_ics_syotteet_data.sql` — Itslearning + Lukkarikone -syöterivit Katrin Hyttiin.

### Kaksi suunnittelupäätöstä jotka poikkesivat alkuperäisestä speksistä

- **EI erillistä `owner`-saraketta.** Alkuperäinen speksi hahmotteli oman `owner`-kentän `kalenteri_syotteet`-tauluun. Toteutuksessa käytettiin sen sijaan JO OLEMASSA OLEVAA `henkilo`-saraketta (`sql/024`, Ristiriitamerkkiä varten rakennettu) — se ratkaisee saman kysymyksen ("kenen henkilökohtainen data tämä on") täydellisesti, uusi sarake olisi ollut suora duplikaatti. `henkilo='katri'`/`'juha'` toimii identtisesti molempiin tarkoituksiin.
- **EI pitkä painallus -valikkoa tehtäväksi merkitsemiseen.** Speksi antoi tämän "Coden harkintaan" esimerkkinä, ei vaatimuksena. Olemassa oleva ☑-nappi (`piirraHyttiRivi()`) täyttää jo vaatimuksen (checkbox + valinnainen eräpäivä, ei häiritse kirjoittamista) — pitkä painallus -valikko olisi lisännyt monimutkaisuutta (kosketuseleiden ristiriita vierityksen/tekstin valinnan kanssa) ilman selvää käyttäjähyötyä. Nappi säilytetty ennallaan.

### *** KRIITTINEN YKSITYISYYSKORJAUS: RLS tietokantatasolla, ei vain käyttöliittymässä ***

Alkuperäinen speksi kuvasi scope-säännöt käyttöliittymän tasolla ("EI toisen käyttäjän mihinkään näkymään") mutta `kalenteri_tapahtumat`-taulun ainoa policy (`kalenteri_all`, sql/012) päästi KENET TAHANSA kirjautuneen näkemään KAIKKI rivit suoralla kyselyllä — Juha olisi teknisesti voinut nähdä Katrin kurssiaikataulun Supabase-kyselyllä vaikka käyttöliittymä ei sitä koskaan näyttäisi. Tämä olisi rikkonut Hytin oman "TÄYSIN YKSITYINEN" -periaatteen (joka JO koskee `hytti_kortit`/`hytti_rivit`-tauluja) heti kun sama periaate ulottui uuteen tauluun (`kalenteri_tapahtumat`) jota se ei alunperin koskenut.

**Korjattu `sql/027`:ssä:** vanha "for all" -policy jaettu erillisiksi select/insert/update/delete-policyiksi. VAIN select on rajattu: rivi näkyy jos (a) ei syote_id:tä (käsin lisätty perheen tapahtuma), TAI (b) syote ei ole `scope='hytti'`, TAI (c) syote ON hytti-scopessa JA `auth.uid()` täsmää sen `henkilo`-arvoon `hytti_omistajat`-kartan kautta. Insert/update/delete pysyvät ennallaan (koko perhe voi yhä kirjoittaa perhekalenteriin normaalisti).

### Client-puolen scope-suodatus (script.js)

- `lataaKalenteri()`: select laajennettu hakemaan myös `kalenteri_syotteet.scope`, ja `data`-taulukko suodattaa `scope==='hytti'`-rivit pois heti haun jälkeen — perheen agenda/viikko/kuukausi/Kuormavahti/Ristiriitamerkki eivät koskaan näe niitä (Kuormavahti laskee siis automaattisesti VAIN perhe-scopen, ei vaatinut erillistä koodimuutosta koska se laskee suoraan jo-suodatetusta `rivit`-taulukosta).
- `paivitaKuittausTila()`: sama suodatus ennen `onkoUusiMinulle()`-suodatusta — opiskelu ei koskaan päädy kuittausjonoon.
- Hytin omat kyselyt (`lataaHyttiTanaanKaista()`, `lataaHyttiKorttiKalenteri()`) hakevat PÄINVASTOIN vain `scope='hytti'`-rivejä `kalenteri_syotteet!inner(scope)`-embedauksella — RLS rajaa nämä automaattisesti kirjautuneen omaan Hyttiin, ei tarvinnut suodattaa "onko tämä minun" erikseen client-koodissa.

### Hytti-päänäkymän muutokset (ks. "Oma Hytti"-osio yllä perustaksi)

- **Työ/vapaa-kytkin siirretty Asetuksista Hytin päänäkymän yläreunaan** — SAMA `localStorage`-avain/logiikka (`kauppalista_hytti_kalenterissa`, `hyttiNakyyKalenterissa()`), vain UI-sijainti ja teksti muuttuivat ("Opiskelu näkyvissä"/"Opiskelu piilossa", `paivitaHyttiTyoVapaaLabel()`). Koskee edelleen VAIN Hytin tehtävien näkymistä Kalenterin päivänäkymässä — ICS-tapahtumat eivät koskaan näy perheen puolella riippumatta kytkimestä (scope-suodatus hoitaa sen pysyvästi).
- **"Tänään"-kaista** (`lataaHyttiTanaanKaista()`): päivän hytti-scopen kalenteritapahtumat, kellonaika+nimi. Tyhjänä koko osio piilotettu kokonaan (`display:none`), ei tyhjätilatekstiä.
- **Tehtävät-koosteen rivit** saivat ⏰-napin (`luoMuistutusNappi('hytti_rivi', ...)`) ⚓-napin viereen.
- **Uusi tyhjätilateksti** (kun ei yhtään aktiivista korttia) päivitetty Katrin tarkalla sanamuodolla.
- **Kortin lisäys -selite** järjestys vaihdettu ("Päättyvä = valmistuu ja arkistoituu. Jatkuva = elää pitkään.").

### Korttinäkymän uusi järjestys

1. Otsikko + tyyppi (`#hytti-kortti-tyyppi`, "Jatkuva"/"Päättyvä" tekstinä).
2. **"Kortin kalenteri"** (`#hytti-kortti-kalenteri-osio`, `lataaHyttiKorttiKalenteri()`): tulevat 7 päivää, hytti-scopen tapahtumat joiden otsikko `ilike`-osuu kortin `kalenterisuodatin`-arvoon. Tyhjä suodatin tai ei osumia = osio piilossa. Suodatin itse asetetaan/muutetaan klikkaamalla `#hytti-kortti-suodatin`-riviä (`muokkaaHyttiKalenterisuodatin()`, kevyt `prompt()`-muokkaus samaan tapaan kuin rivin eräpäivä) — TÄTÄ EI ollut eksplisiittisesti alkuperäisessä speksissä, lisätty koska suodattimelle piti olla jokin tapa asettaa arvo.
3. **Seuraava askel** uudessa ulkoasussa: `.hytti-seuraava-askel-laatikko` (kulta-reunus, kehystetty), sama inline-muokkauslogiikka kuin ennen.
4. Rivit ennallaan — ☑-nappi tehtäväksi-merkintään säilytetty (ks. yllä oleva päätös), tehtäväriveillä nyt myös ⏰-nappi, tehty tehtävä jää näkyviin yliviivattuna kuten aiemminkin.
5. "Arkistoi kortti" ennallaan.

### OSA 3 sovellettu: "väri koristaa, musta kertoo"

Sovellettu TÄYSILLÄ vain UUTEEN Hytti-UI:hin (kuten speksi ohjeisti): Tänään-kaistan kellonaika (`.hytti-tanaan-aika`), Kortin kalenterin päivämäärä/kellonaika (`.hytti-kortti-kalenteri-pvm`), kortin tyyppi (`.hytti-kortti-tyyppi`) ja kalenterisuodatin-rivi (`.hytti-kortti-suodatin`) käyttävät kaikki täyttä `var(--text)`-väriä. Seuraava askel -laatikko tunnistuu MUODOSTA (kulta-reunus), ei väristä.

**EI retroaktiivisesti muutettu** olemassa olevia due-date-badgeja (`.hytti-tehtava-erapaiva`, `.hytti-rivi-erapaiva`, `.hytti-tehtava-kortti`, `.hytti-kortti-askel`) — nämä pysyvät `--muted`-värisinä, koska niiden mutedius oli ALUNPERIN tietoinen "ei stressaava/syyllistävä" -valinta (dokumentoitu 2026-07-08: "AINA muted-värillä, EI punaista edes ylittyneelle"), eri syystä kuin OSA 3:n koristelu-vastaan-informaatio-periaate. Sama avoin ristiriita kuin `.kalenteri-aika`/`--accent-text`:llä (ks. "Ulkokäytettävyys ja kontrasti" -osio) — EI ratkaistu tässä, koskee vain kun näihin elementteihin palataan muusta syystä.

### EI V1:EEN (ei rakennettu, kirjattu vain)

Ohjebanneri-koneisto, haku, rivien siirto korttien välillä, Laituri→Hytti-sijoitus, Opiskelu-AI-toiminnot, hytin nimenvaihto, pitkä painallus -tehtävävalikko (ks. yllä oleva päätös).

**Juhan työkalenteri** samaan `tyyppi='ics'`-koneistoon (mode='vain_varattu' perheelle + täydet tiedot hänen Hytissään) — kirjattu myöhemmäksi, vaatisi kahden rivin mallin (yksi per scope samalle URL:lle) jota ei ratkaistu tässä.

### Testaus — EI TEHTY, ks. PALUU.md OSA C

Täysi testipolku (kortin luonti, tehtävät, muistutus, työ/vapaa-kytkin, Juhan-tilin yksityisyystesti) on kirjoitettu PALUU.md:hen tarkkana askel-askeleelta-ohjeena Katrille tiistaiksi. **Kausiluonteisuus:** Itslearning/Lukkarikone ovat kesällä todennäköisesti tyhjiä — putkitesti (haku ei kaadu, 0-N tapahtumaa) riittää nyt, sisältötesti pitää tehdä UUDELLEEN elokuussa lukukauden alkaessa.

## Horisontti — suunnitelma (kirjattu 2026-07-08, EI TOTEUTETTU, tarkoitus rakentaa Copilot-ajalla 23.7.2026 jälkeen)

**Tämä on suunnitelma, ei koodia.** Mitään tästä osiosta ei ole vielä toteutettu — ei taulua, ei UI:ta, ei laskentaa. Katri saneli tämän tarkkana ohjeistuksena tulevaa toteutusta varten, koska hän ei itse enää ole rakentamassa tätä (kehityskone palautuu 23.7., loppuosa tehdään Copilotilla). Kirjattu tähän sanasta sanaan säilyttäen, jotta yksikään yksityiskohta (varsinkaan "MITÄ EI TEHDÄ" -kohta) ei katoa matkalla.

**Yhteys "Nostot"-visioon:** taulun nimi on tarkoituksella `nostot`, ei `horisontti_ehdotukset` tms. — tämä sama data on myös se pohja jolle Satama 2.0:n tuleva **Nostot**-osio (koko "kodin huoltokirja + vuosikello", ks. "Satama 2.0 — seuraavat vaiheet" -osio, kohta 4 seitsemän paikan listassa) rakentuu myöhemmin. Horisontti (etusivun ehdotuslohko) on siis vain tämän saman datan yksi näkymä/käyttöliittymä, ei erillinen järjestelmä.

**Tavoite:** Horisontti näyttää etusivulla enintään YHDEN lempeän ehdotuksen kerrallaan asiasta joka alkaa kaivata huomiota. Ehdottaa, ei vaadi — sävy on "voisiko tänään olla hyvä hetki...", EI KOSKAAN "myöhässä" tai punaista väriä. Vertailukohta on perheen oma toteutunut rytmi (opittu datasta), ei mikään ulkoinen ideaali tai siivousoppaan suositus.

**Tietomalli — uusi taulu `nostot`:**
- `id`
- `name` (text) — TÄMÄ on avain `events`-dataan: rytmi ketjutetaan täsmäyksellä `events.target_name = nostot.name`
- `oletus_vali_pv` (int) — siemenarvaus päivinä, käytössä kunnes dataa kertyy tarpeeksi
- `kasin_vali_pv` (int, null = ei asetettu) — jos käyttäjä asettaa tämän käsin, se YLIKIRJOITTAA opitun välin, EIKÄ data koskaan ylikirjoita tätä takaisin
- `kausi_alku_kk` / `kausi_loppu_kk` (int, null = ympärivuotinen) — esim. pakastimen sulatus vain syys–huhtikuu; jos jokin homma pitää tehdä kahdesti eri kausina (esim. renkaanvaihto keväällä JA syksyllä), siitä tehdään KAKSI ERI RIVIÄ, ei yhtä kahden kauden riviä
- `snoozed_until` (date) — asetetaan kun käyttäjä painaa "ei nyt"
- `hylkaykset_putkeen` (int, default 0)
- `enabled` (bool)
- ei tarvita erillistä järjestys-saraketta, Horisontti valitsee itse mikä näytetään (ks. alla)

**Rytmilaskenta:**
- Lähdedata: `events` -taulun rivit joilla `action='checked' AND target_name = nostot.name`, lasketaan peräkkäisten aikaleimojen välit päivinä
- Opittu väli = näiden välien **MEDIAANI**, EI keskiarvo — yksi unohtunut täppäys tai poikkeuksellisen pitkä väli ei saa vääristää koko rytmiä
- Opittu väli astuu voimaan vasta kun välejä (datapisteitä) on vähintään **3** — sitä ennen käytetään `oletus_vali_pv`:tä
- Voimassa oleva väli = `kasin_vali_pv` ?? opittu väli ?? `oletus_vali_pv` (ensimmäinen joka ei ole null, tässä järjestyksessä)
- **Tärkeä periaate:** kirjaamattomuus ei ole signaali mistään. Satama oppii VAIN siitä minkä se näkee (eli minkä käyttäjä on täpännyt Satamassa) eikä koskaan tulkitse hiljaisuutta "ei ole tehty" -merkiksi. Arki joka elää sovelluksen ulkopuolella on täysin ok, ei syyllistetä siitä.

**Ehdotuslogiikka (etusivun Horisontti-lohko):**
- Ehdokas = `enabled=true`, kausi voimassa (jos asetettu), ei snoozattu (`snoozed_until` mennyt tai null), kulunut aika ≥ 80 % voimassa olevasta välistä
- Näytetään VAIN YKSI kerrallaan: se jolla `kulunut/väli`-suhde on suurin
- **Armollisuussääntö:** jos yli n. 70 % KAIKISTA aktiivisista hommista on ylittänyt oman välinsä samaan aikaan (esim. koko perhe on ollut lomalla tai sairaana) → Horisontti hiljenee kokonaan, näyttää tyhjän tilan ilman mitään syyllistävää viestiä. Tämä estää sen että lomalta paluu näyttäisi 10 hälytystä kerralla.
- Rivin toiminnot: ⚓ (nostaa päivän Ankkuriksi, `source='horisontti'` samalla yleisellä ankkurointimekanismilla kuin muillakin lähteillä) | "ei nyt" (snooze: siirtää `snoozed_until`:n +25 % välistä eteenpäin, minimissään 3 päivää, `hylkaykset_putkeen += 1`) | täppäys tehdyksi (kirjaa `events`-riviin `action='checked'`, jolloin rytmi karttuu ja `hylkaykset_putkeen` nollautuu)
- Jos jokin homma saa **3 hylkäystä putkeen** ilman yhtään välissä ollutta täppäystä → se hiljenee kokonaan ehdotuksista (`enabled=false` automaattisesti), näkyy sen jälkeen VAIN Nostot-hallintanäkymässä josta sen voi herättää takaisin

**Nostot-hallintanäkymä** (ei omaa etusivunappia — pääsy esim. Asetusten kautta): lista kaikista hommista, kunkin kohdalla näkyy nimi, voimassa oleva väli JA sen lähde tekstinä ("arvaus" / "opittu ~X pv" / "asetettu X pv"), kausi, enabled-kytkin. Käsin annetun välin kentän tyhjentäminen palauttaa takaisin opittuun (tai arvaukseen jos opittua ei vielä ole). Uusien hommien lisäys tässä vaiheessa VAIN tämän hallintanäkymän kautta käsin — automaattinen tunnistus (ks. V4 alla) on myöhempi asia.

**Siemenpankki** (dataa, ei koodia): SQL-migraatio joka lisää n. 10–20 yleistä kotihommaa oletusväleineen ja kausineen — KAIKKI `enabled=false` OLETUKSENA, käyttäjä herättää hallintanäkymästä ne jotka koskevat omaa kotia. EI yhtään valmiiksi asetettua käsin annettua väliä (`kasin_vali_pv` aina null siemendatassa).

**Peilaus, ei häpeä:** kun opittu ja käsin annettu väli eroavat selvästi toisistaan (esim. toteuma 12 päivää, käsin asetettu tavoite 7 päivää) — harvakseltaan, enintään kerran kuussa per homma — näytetään neutraali kysymys: "Tavoite X, toteuma noin Y — säädetäänkö tavoitetta vai pidetäänkö ennallaan?" Tavoite on peili johon arkea verrataan, ei häpeäkeppi jolla sitä lyödään.

**Toteutusjärjestys (Copilot-vaiheistus — pieninä erillisinä paloina, tässä järjestyksessä):**
- **V1:** `nostot`-taulu + hallintanäkymä + pelkkä "X pv edellisestä" -näyttö (ei vielä mitään ehdotuslogiikkaa etusivulla)
- **V2:** mediaanilaskenta `events`-datasta + 80 %:n kynnyksellä ehdotus etusivun Horisontti-lohkoon + ⚓/"ei nyt"/täppäys-toiminnot
- **V3:** siemenpankki + kausisäännöt + armollisuussääntö + 3 hylkäyksen automaattihiljennys
- **V4** (vaatii E3:n Claude-älyn, EI tehdä ennen sitä): Laituri-kautta tulevat säännöt/kuittausmurut ("imuroin tänään" tekstinä → tunnistetaan sumealla nimiyhdistyksellä oikeaksi `nostot`-riviksi ja kirjataan `events`-tapahtumaksi automaattisesti). Jos äly on epävarma osumasta, se EI ARVAA — murun jää `'uusi'`-tilaan ihmisen käsiteltäväksi, ei koskaan väärää automaattista kirjausta.

**MITÄ EI TEHDÄ TÄSSÄ OMINAISUUDESSA MISSÄÄN VAIHEESSA** (tietoisia rajoja, ei unohduksia):
- Ei "myöhässä"-punaista tai mitään häpeämittaria
- Ei koskaan useampaa kuin yksi ehdotus kerralla etusivulla
- Ei pakollista kirjaamista — käyttäjä ei ole velvollinen käyttämään Horisonttia
- Ei keskiarvoa rytmilaskennassa, aina mediaani
- Ei koskaan käyttäjän puolesta automaattisesti asetettuja käsin-tavoitevälejä (`kasin_vali_pv` on AINA käyttäjän oma tietoinen valinta)

**Mitä tämä vaatii NYKYISELTÄ (jo olemassa olevalta) koodilta jo nyt, ennen kuin Horisontti itse rakennetaan:** `events`-tauluun kirjataan edelleen kattavasti kaikki `'checked'`-tapahtumat eikä sitä KOSKAAN tyhjennetä/arkistoida — se on Horisontin ainoa mahdollinen datalähde tulevaisuudessa, ja historian menettäminen tarkoittaisi ettei rytmiä voisi enää koskaan oppia. Toistuvat kotihommat (esim. pakkauslistojen automaattinollaus, ks. "Pakkauslistan automaattinollaus"-osio — jo toteutettu juuri tällä periaatteella) tulee toteuttaa niin että RIVI PYSYY SAMANA ja vain täpätään/nollataan uudelleen — EI poisteta ja luoda uutta riviä — koska `events`-ketjun eheys (`target_name`-täsmäys) nojaa tähän.

## Ohjebanneri-järjestelmä — suunnitelma (kirjattu 2026-07-08, EI TOTEUTETTU, toteutetaan aikaisintaan Hytin yhteydessä)

**Tämä on suunnitelma, ei koodia** — sama periaate kuin "Horisontti — suunnitelma" -osiolla yllä: ei kuulu 23.7.2026-määräaikaan ELLEI Oma Hytti -runko ehdi mukaan sitä ennen. Kirjattu talteen Copilot-aikaa varten.

**Idea:** kun käyttäjä avaa jonkin osion (esim. Oma Hytti, tai vaikka Kalenterin kuittausnäkymän) ensimmäistä kertaa, näkyy kuitti-tyylinen ohjebanneri sisällön yläpuolella (katkoviivalaatikko), jonka voi sulkea ×:llä. Kerran suljettu banneri ei ponnahda enää itsestään uudelleen — mutta sama teksti löytyy aina myös pysyvästi Asetuksista ("Ohjeet"-osio, listattuna per osio). EI modaali, EI pakota mitään lukemaan — banneri väistyy sisällön tieltä kiltisti eikä esimerkiksi estä muun sisällön näkemistä tai käyttöä sillä aikaa kun se on näkyvissä.

**PÄIVITYS 2026-07-13: `ohjeet`-taulu ON JO OLEMASSA** (`sql/035_ohjeet_vinkit.sql`), mutta suppeampana kuin tässä suunnitelmassa — vain `content`+`sort_order`, käytössä Asetusten Vinkit-listan dataohjaukseen (ks. Asetukset-osio yllä). Kun tämä Ohjebanneri-paketti joskus rakennetaan, taulua LAAJENNETAAN alla kuvatuilla `section_key`/`title`-sarakkeilla (molemmat nullable) sen sijaan että tehtäisiin rinnakkainen taulu — olemassa olevat Vinkki-rivit pysyvät `section_key IS NULL` (= "ei banneri, vain pysyvä lista"), eivät koskaan laukaise banneria millekään osiolle.

**Tietomalli:**
- `ohjeet`-taulu (olemassa, laajennetaan): + `section_key` (esim. `'hytti'`, `'kalenteri_hyvaksynta'` — vapaamuotoinen tunniste, ei viittaa mihinkään toiseen tauluun FK:lla, NULL nykyisille Vinkki-riveille), + `title`. RLS: kaikki kirjautuneet saavat lukea (ei kirjoitusta UI:sta, ylläpidetään Table Editorista käsin — sama "dataa, ei koodia" -periaate kuin muuallakin Satamassa).
- Uusi taulu `ohje_kuittaukset`: `user_id`, `section_key`, `dismissed_at`. Kuittaus tallennetaan TIETOKANTAAN, EI localStorageen — jottei kuittaus katoa kun PWA asennetaan uudelleen tai vaihdetaan puhelinta.

**Näyttölogiikka:** osion avaus → jos `ohjeet`-taulussa on rivi kyseiselle `section_key`:lle EIKÄ kirjautuneella käyttäjällä ole vastaavaa riviä `ohje_kuittaukset`-taulussa → näytä banneri. ×-napin painallus kirjoittaa uuden `ohje_kuittaukset`-rivin (`dismissed_at = now()`), jonka jälkeen banneri ei näy enää sille käyttäjälle.

**Ohjeen päivittäminen jälkikäteen:** jos `ohjeet`-rivin sisältöä muutetaan merkittävästi ja halutaan että käyttäjät näkevät sen uudelleen, poistetaan käsin vastaavat `ohje_kuittaukset`-rivit Table Editorista — banneri palaa näkyviin kerran. Tietoinen yksinkertaistus: EI rakenneta erillistä versionumerointia ohjeille, tämä riittää harvoin tapahtuvaan tarpeeseen.

**Asetukset-näkymä:** uusi "Ohjeet"-osio joka listaa KAIKKI `ohjeet`-taulun rivit (riippumatta kuittauksista), napautus avaa sisällön luku­tilassa. Tämä on sama sisältö minkä banneritkin näyttävät — pysyvä paikka johon ohjeen voi aina palata riippumatta siitä onko banneri joskus suljettu.

**Ensimmäinen käyttökohde:** Oma Hytin ohje (`section_key` esim. `'hytti_juha'` tai vastaava per-hytti-tunniste, jos hytin käsite on henkilökohtainen). Sisältö otetaan erillisestä "Juhan hytin ohjekortti" -tekstistä (Katrilla olemassa erikseen) — käytetään tätä oikeaa sisältöä banneriin JA Asetusten ohjelistaan, EI mitään placeholder-/siemenkorttia.

**Miksi tämä on hyvä Copilot-kokoinen pala:** pieni, itsenäinen kokonaisuus (kaksi taulua + yksi geneerinen banner-komponentti + yksi Asetukset-alaosio), ei kosketa mihinkään olemassa olevaan toimivaan koodiin, ja sen voi rakentaa ja testata erillään muusta Satamasta. Sopii siis rakennettavaksi silloin kun Oma Hytti muutenkin aloitetaan, ei tarvitse tehdä etukäteen.

## Sovittu järjestys 23.7.2026 asti (kirjattu 2026-07-08, Katrin oma priorisointi)

**HUOM (2026-07-11): tämä lista on kirjoitettu 2026-07-08 eikä ole enää ajantasainen prioriteettijärjestys** — sen jälkeen on rakennettu paljon lisää (Muistutukset, Hytti v1 -respeksaus + ICS, Ankkurit henkilökohtaisiksi, Varmuuskopiot, Äly-putken runko), ks. Muutosloki ylhäällä ajantasaiselle tapahtumajärjestykselle. Säilytetty tässä historiallisena kontekstina siitä miten alkuperäinen suunnitelma näytti — EI käytetä enää "mitä tehdä seuraavaksi" -päätöksentekoon, sen sijaan katso Muutosloki + kunkin osion oma tila-merkintä (TESTATTU/EI TESTATTU).

1. **Kahden tilin RLS-testi (Katri + Juha)** + koko "Testattavaa seuraavaksi" -lista alta — ennen tai rinnan seuraavan kanssa, EI SAA UNOHTUA
2. **Kalenterisyötteet** (tämä osio, yllä) — max 4 päivää aikabudjetti. 017/018/019 ajettu, ensimmäinen oikea synkka onnistui (15 riviä jonoon) mutta paljasti BUGI A (hakuikkuna) ja BUGI B (RRULE-poikkeukset) — molemmat korjattu. Sen jälkeen Katri päätti koko arkkitehtuurin uusiksi: hyväksyntäjono pois käytöstä, "yksi totuus, kaksi ikkunaa" -malli (ks. oma osio) — todistettu toimivaksi 2026-07-10 testisessiossa (huom vain yhteen suuntaan, ks. "Kahden puhelimen testisessio").
3. **Pakkauslistojen automaattinollaus** — ✓ TOTEUTETTU 2026-07-08, ks. "Pakkauslistan automaattinollaus"-osio alempana täydelle kuvaukselle.
4. **Push-ilmoitusinfra** — ✓ TOTEUTETTU 2026-07-08 (tilaus + manuaalinen testilähetys, ks. "Push-ilmoitukset"-osio). EI vielä testattu oikeilla laitteilla.
5. **Muistutusten perusversio** — ✓ TOTEUTETTU 2026-07-10 push-infran päälle (⏰-nappi + GitHub Actions -ajastin), ks. "Muistutukset"-osio. EI vielä testattu.
6. **Oma Hytti -runko** — ✓ TOTEUTETTU 2026-07-08 v1, **respeksattu ja laajennettu opiskelukalenterilla 2026-07-11** (ks. "Hytti v1 + opiskelulaajennus + ICS-syötekoneisto" -osio). EI testattu ollenkaan vielä (myös kahden tilin RLS-testi Hytille erikseen kohdassa 1 mainitun lisäksi).

**Sittemmin lisätty, ei ollut mukana alkuperäisessä listassa (kirjattu 2026-07-11):** Ankkurit henkilökohtaisiksi (✓ toteutettu), Varmuuskopiointi pg_dump:lla (✓ toteutettu), Juhan CalDAV-tilin syöterivit (✓ toteutettu), Äly-putken runko (✓ toteutettu) — kaikki EI TESTATTU vielä, ks. omat osionsa ja PALUU.md.

**21.–22.7.2026 rauhoitetaan kokonaan:** ei enää uusia ominaisuuksia, pelkkä koko testauslistan läpikäynti MOLEMMILLA tileillä (Katri + Juha) + tämän muistiinpanot.md-tiedoston loppupäivitys niin että Copilot pystyy jatkamaan siitä ilman mitään muuta kontekstia. **Sama jakso, turvasiivous:** tarkista Anthropic Consolen API-avainlista (ks. "Äly-putki"-osion "Turvahuomio" — ensimmäinen avain vuoti kerran chattiin, kierrätettiin heti, muistutus tarkistaa ettei jäänyt roskaa).

## TODO ennen etapin 1 valmistumista (määräaika 23.7.2026 — kehityskone palautuu silloin)

- [x] RLS + näkyvyysmalli (003, 005, 006) — ajettu, korjattu rekursio ja anon-vuoto
- [x] service_role-avain Verceliin, Siri vahvistettu toimivaksi RLS:n kanssa
- [x] Raahausjärjestys: tuotteet (007), lists (011) — molemmat ajettu
- [x] Laituri (004), navigointiruudukko (008), Ankkurit (009, 013), Varasto (010), Kalenteri (012) — kaikki ajettu
- [ ] **Testaa molemmilla tileillä (Katri + Juha)** — tämä on ollut TODO-listalla koko session ajan, ei vielä vahvistettu. Ks. tarkka testauslista alta
- [ ] Suunnitteluperiaate koko loppuprojektille: kaikki säädettävä dataan/tauluihin, EI kovakoodata — pääosin toteutunut (home_sections, ankkurit, kalenteri_syotteet ovat data-ohjattuja), mutta pidä mielessä jatkossakin
- [ ] Horisontissa: oikea päättelylogiikka events-datasta — täysi suunnitelma valmiina "Horisontti — suunnitelma"-osiossa (tietomalli, mediaanilaskenta, V1–V4-vaiheistus), EI aloitettu koodissa. Tarkoitus toteuttaa Copilot-ajalla 23.7. jälkeen, ei kuulu 23.7. mennessä valmistuvaan E1-versioon.
- [x] **Oma Hytti** — toteutettu 2026-07-08 v1 (casekortit + tehtäväkooste + Kalenteri-integraatio, täysin yksityinen), ks. "Oma Hytti"-osio. `sql/016_hytti.sql` AJETTU, EI vielä testattu. Ohjebanneri-järjestelmä (oma täysi suunnitelma valmiina, tarkoitettu nimenomaan Hytin ensimmäiseksi käyttökohteeksi) EI ole vielä mukana — jäi tietoisesti pois v1:stä, rakennetaan myöhemmin päälle
- [x] **Asetukset**-näkymä — ✓ laajennettu v1:ksi 2026-07-08 illalla (Tili/Ilmoitukset/Vinkit/Sovellus, ks. oma "Asetukset"-osio), EI vielä testattu
- [ ] Kalenteritapahtuman muokkaus jälkikäteen (nyt voi vain lisätä/poistaa, ei muuttaa nimeä/aikaa)
- [x] **Pakkauslistojen automaattinollaus** — toteutettu 2026-07-08, ks. "Pakkauslistan automaattinollaus"-osio, EI vielä testattu oikealla laitteella (ks. "Testattavaa seuraavaksi")
- [x] **Push-ilmoitusinfra** (tilaus + testilähetys) — toteutettu 2026-07-08, ks. "Push-ilmoitukset"-osio, EI vielä testattu oikeilla laitteilla (ks. "Testattavaa seuraavaksi")
- [x] **Muistutukset** (ajastettu push push-infran päälle) — TOTEUTETTU 2026-07-10, ks. "Muistutukset"-osio. **Käyttöönotto VALMIS 2026-07-13:** `MUISTUTUKSET_CRON_SECRET` asetettu Verceliin JA GitHubiin, ajastin laukaistu käsin Actionsista → VIHREÄ ✓, pyörii nyt automaattisesti 5 min välein. **Itse push-ilmoituksen saapuminen (OSA B) EI vielä testattu oikealla laitteella.**
- [x] **Ulkoisen kalenterin tuonti Satamaan** — `sql/014`/`017`–`019` AJETTU, ensimmäinen oikea synkka onnistui 2026-07-08 illalla (15 riviä) ja "yksi totuus, kaksi ikkunaa" -malli todistettu toimivaksi 2026-07-10 testisessiossa (huom vain Juha→Katri-suuntaan, ks. "Kahden puhelimen testisessio"). Juhan CalDAV-tilin omat syöterivit + nimikorjaus + Oma-scope (`sql/030`–`033`) **KAIKKI AJETTU ja datatasolla VAHVISTETTU 2026-07-13**: synkka-JSON 9 syötettä, 0 virhettä, 330 tapahtumaa, ei tuplia — ks. "Kalenterisyötteet"-osio. Elävä UI-symmetriatesti (Juhan "Oma") vielä tekemättä.
- [x] **Ankkurit henkilökohtaisiksi** — TOTEUTETTU 2026-07-11 (`sql/029`), ajettu 2026-07-13. Ks. "Etusivu"-osion "Ankkurit henkilökohtaiset" -kappale. EI vielä testattu käyttöliittymästä.
- [x] **Varmuuskopiointi** — TOTEUTETTU 2026-07-11 (`pg_dump`-pohjainen, ks. "Varmuuskopiot"-osio ja BACKUP.md). **ENSIMMÄINEN VARMUUSKOPIO OTETTU 2026-07-13** (iCloud Drive).
- [x] **Äly-putken runko** — TOTEUTETTU 2026-07-11, TESTATTU JA TODISTETTU 2026-07-12 (ks. alla). Ensimmäinen oikea älyominaisuus (Laituri-avustaja) rakennettu heti perään.
- [x] **Huomiopallurat** — TOTEUTETTU 2026-07-13 (`sql/034`, ks. "Huomiopallurat"-osio). EI vielä testattu.

## Testattavaa seuraavaksi (koottu 2026-07-07 session lopussa)

Iso liuta uutta toiminnallisuutta kasautunut ilman kattavaa käsin-testausta oikealla laitteella/tilillä. Käy läpi:

- [x] **Äly-putken runko** — TESTATTU 2026-07-12, "Testaa äly" vastasi järkevästi oikealla laitteella. Ks. "Äly-putki"-osio.
- [ ] **UUSI, tekemättä: Laituri-avustaja (aja PALUU.md OSA G) — EI TESTATTU LAINKAAN.** Avaa Laituri, paina jonkin sijoittamattoman rivin ✨-nappia — ehdotus ("→ kohde · perustelu") pitäisi ilmestyä rivin alle muutaman sekunnin sisällä. Paina "Sopii" — pitäisi avautua sama sijoitusdialogi kuin →-napilla, mutta ehdotus jo esitäytettynä kenttään; **mikään ei saa siirtyä ennen kuin painat OK tässä dialogissa**. Paina "Ei" jollain toisella rivillä — kortti katoaa, ei tallennu mitään. Tarkista ettei ✨ koskaan laukea automaattisesti (vain suoraan napin painalluksesta).
- [ ] **UUSI, tekemättä: Ankkurit henkilökohtaisiksi (aja `sql/029_ankkurit_henkilokohtaiset.sql`, ks. PALUU.md OSA D) — EI TESTATTU LAINKAAN, riippumaton kalenteritesteistä.** Katrin vanhat ankkurit säilyvät hänellä (backfill), Juhan ankkurit alkavat tyhjästä, Juhan ⚓-nosto näkyy VAIN hänen etusivullaan eikä Katrilla, kummankin täppäys/poisto koskee vain omaa. Lähetys toiselle ja ristiriitalipun ankkuriehdokkaat EIVÄT ole vielä mukana (odottavassa paketissa).
- [ ] **UUSI, tekemättä: Hytti v1 + opiskelulaajennus + ICS-syötekoneisto (aja `sql/026`→`027`→`028` järjestyksessä, ks. PALUU.md OSA A/C) — EI TESTATTU LAINKAAN.** Täysi askel-askeleelta-testiohje on PALUU.md:ssä (OSA C) — tärkeimmät kohdat: (1) kortin kalenterisuodatin + "Kortin kalenteri" -osio näyttää osumat; (2) tehtävän ⏰-muistutus toimii (todistaa `muistutukset.source='hytti_rivi'` check-rajoitteen laajennuksen); (3) työ/vapaa-kytkin piilottaa opiskelun perhenäkymistä muttei Hytistä; (4) **KRIITTISIN:** Juhan tilillä ei näy MITÄÄN Katrin Hytistä missään, ei edes suoralla yrityksellä — todistaa RLS-korjauksen (sql/027) toimivan oikeasti, ei vain käyttöliittymän piilotuksen varassa. Muista lisätä Juhan rivi `hytti_omistajat`-tauluun ennen testausta (PALUU.md kohta A.3). Kausiluonteisuus: Itslearning/Lukkarikone ovat kesällä todennäköisesti tyhjiä — putkitesti (haku ei kaadu) riittää nyt, sisältötesti UUDELLEEN elokuussa.
- [ ] **UUSI, tekemättä: Muistutukset v1 (aja `sql/025_muistutukset.sql` ensin) — EI TESTATTU LAINKAAN.** ENSIN: aseta `MUISTUTUKSET_CRON_SECRET`-ympäristömuuttuja Verceliin JA sama arvo GitHub-repon Settings → Secrets → Actions -kohtaan samalla nimellä. Tarkista GitHub-repon Actions-välilehdeltä että "Muistutusten ja kalenterisynkan ajastin" -workflow näkyy, laukaise se kerran käsin "Run workflow" -napista (ei tarvitse odottaa 5 min). Testaa sitten: (1) paina ⏰ jollain listarivillä, aseta "5 min" -muistutus roolista — push pitäisi tulla suljettuun puhelimeen n. 5-10 min sisällä; (2) aseta samalle rivillle TOINEN muistutus ("lisää toinen") — molemmat pitäisi tulla; (3) kalenteritapahtumalla jolla on kellonaika, kokeile "1 h ennen" -pikanappia, tarkista laskettu aika on oikea; (4) aseta muistutus ja poista se × -napilla ennen erääntymistä — pushia EI pitäisi tulla; (5) poista rivi/tapahtuma jolla oli muistutus, tarkista Table Editorista että `muistutukset`-rivi katosi mukana; (6) laitteella jolla push EI ole käytössä (ei koskaan painettu "Salli ilmoitukset"), tarkista että ⏰-paneeli näyttää ohjeen + "Asetuksiin"-napin lomakkeen sijaan. Tarkista lopuksi myös että kalenterisynkka (`GET /api/caldav-sync`) näyttää päivittyvän itsestään ilman että kukaan avaa sovellusta (uusi sivuvaikutus samasta cronista).

- [ ] **UUSI, tekemättä: Kalenterin merkkikieli + Ristiriitamerkki (aja `sql/024_kalenteri_ristiriita.sql` ensin) — EI TESTATTU OIKEALLA DATALLA.** Avaa Kalenteri kaikissa kolmessa tilassa (päivä/viikko/kuukausi), tarkista että Kuormavahdin merkki näkyy nyt isompana tekstipillerinä ("N menoa", meripihka) päivä/viikkonäkymässä JA uutena pienenä meripihkanvärisenä pisteenä kuukausiruudukossa. Lisää/synkkaa kaksi OIKEASTI päällekkäistä (limittyvää kellonaikaa) tapahtumaa: (a) samaan syötteeseen — punainen "PÄÄLLEKKÄIN"-pilleri pitäisi näkyä AINA, myös koulupäivän klo 9-15 sisällä; (b) Perhekalenteriin + jompaankumpaan henkilökohtaiseen kalenteriin ARKIPÄIVÄNÄ klo 9-15 sisällä — EI merkkiä (rauhoitettu ikkuna); (c) sama pari mutta ILTA-ajalle (esim. klo 19) — merkki pitäisi näkyä; (d) Katrin ja Juhan henkilökohtaisiin kalentereihin mihin tahansa aikaan — EI KOSKAAN merkkiä. Tarkista myös kuukausiruudukon piste samoilla tapauksilla.
- [ ] **UUSI, tekemättä: Ulkokäytettävyys, toinen kierros (2026-07-13) — EI TESTATTU ULKONA.** Vie puhelin ulos aurinkoiseen paikkaan, avaa Kalenteri käsivarren mitalta. Tarkista päivä-, viikko- JA kuukausinäkymä: (1) Kuormavahdin "N menoa" -pilleri (kaikissa kolmessa, myös kuukausiruudukon pieni pilleri jossa nyt näkyy numero eikä pelkkä väripiste) luettavissa ilman silmien siristämistä; (2) kellonajat (`--accent-text`) ja toissijaiset tekstit (`--muted`, esim. otsikot/tyhjä-tekstit) erottuvat taustasta selvästi; (3) viikkonäkymä käännettynä vaakatilaan (puhelin kyljellään) — pilleri EI ole enää "mikroskooppinen". Jos vieläkään ei riitä, kerro Claudelle/Copilotille tarkka tilanne (mikä elementti, missä valossa) — seuraava kierros voisi harkita täytettyä taustaa myös kuormamerkille.
- [ ] **UUSI, tekemättä: käynnistys avautuu aina Etusivulle (korjattu 2026-07-10).** Avaa jokin lista (esim. Kauppalista) Muistilapuista, sulje sovellus kokonaan (poistu taustaltakin, esim. pyyhkäise pois sovellusvaihtajasta), avaa uudelleen kotinäytön kuvakkeesta — pitäisi näkyä Etusivu, EI palata suoraan Kauppalistaan. Testaa myös uudelleenlataus selaimessa (F5/pull-to-refresh) samalla logiikalla.
- [ ] **UUSI, tekemättä: Laiturin kaksi eri lukua (korjattu 2026-07-10, ei vielä testattu).** Avaa Laituri, tarkista että hakukentän alla näkyy "N sijoittamatta" (tai "kaikki sijoitettu" jos ei mitään käsittelemätöntä). Palaa etusivulle, tarkista pallukka — sen pitäisi olla POISSA heti (koska juuri avasit Laiturin). Lisää uusi ajatus TOISELLA puhelimella, tarkista että pallukka ilmestyy ENSIMMÄISEN puhelimen etusivulla. Avaa Laituri ensimmäisellä puhelimella — pallukka etusivulla nollaantuu, mutta "N sijoittamatta" -teksti Laiturin sisällä EI muutu pelkästä avaamisesta (vain kun rivi sijoitetaan tai poistetaan). Sijoita yksi rivi ("→"-nappi) — tarkista että "sijoittamatta"-luku pienenee ja rivi himmenee + saa "→ minne"-tekstin.
- [ ] **Push-ilmoitukset, illan pääkohde:** aja `sql/015_push_tilaukset.sql` ensin. Avaa Satama molemmilla puhelimilla (KOTINÄYTÖLLE ASENNETTUNA, ei Safarissa suoraan — muuten ei toimi). Avaa Asetukset-osio (etusivun ruudukko), paina "Salli ilmoitukset" — iOS kysyy luvan, hyväksy. Napin pitäisi vaihtua "Lähetä testi-ilmoitus" -napiksi. Paina sitä ja tarkista että ilmoitus tulee näkyviin PUHELIMEN ILMOITUSKESKUKSEEN, myös kun sovellus on kokonaan suljettu taustalla (ei vain auki selaimessa). Testaa molemmilla puhelimilla erikseen — kummankin pitäisi saada oma ilmoituksensa riippumatta toisesta. Jos "Salli ilmoitukset" ei tee mitään tai virhe tulee, tarkista onko puhelimen omissa asetuksissa (Asetukset → Safari → [sivuston] ilmoitukset tai kotinäytön appin omat asetukset) ilmoitukset jo aiemmin evätty — silloin täytyy sallia sieltä käsin ensin
- [ ] **Pakkauslistan automaattinollaus:** avaa "Telttaretken pakkauslista" tai "Viikon reissun pakkauslista" (molemmat valmiina, ks. Varasto-osio), täppää KAIKKI rivit valmiiksi — viimeisen täpän jälkeen pitäisi näkyä ruudun alareunassa ilmoitusbanneri, ja n. 1,5 sekunnin päästä kaikkien rivien pitäisi palautua täppäämättömäksi automaattisesti. Testaa myös ettei tavallinen lista (esim. Kauppalista) nollaudu vaikka kaikki täpättäisiin
- [ ] **Kahden tilin testi** (Katri + Juha): yhteinen lista näkyy molemmille, yksityinen lista EI näy toiselle, Kauppalista/Siivouslista/Vuosikello näkyvät kummallekin
- [ ] **Oma Hytti, koko putki läpi** (`sql/016_hytti.sql` on jo ajettu): avaa etusivulta "Oma Hytti". Luo kortti (esim. "Työnhaku", tyyppi Jatkuva) — tarkista että se ilmestyy Kortit-listaan. Avaa kortti, kirjoita muutama rivi muistiinpanoksi, merkkaa kaksi riviä tehtäviksi (☑-nappi) ja aseta kummallekin eräpäivä (yhdelle tämä päivä). Palaa päänäkymään — molempien pitäisi näkyä Tehtävät-koosteessa päivinä laskettuna ("N pv"/"tänään"), kortin nimi pienellä perässä. Täppää yksi tehtävistä koosteesta — tarkista että se näkyy täpättynä myös kortin sisällä. Nosta toinen ⚓-napilla Ankkureihin, tarkista että se ilmestyy etusivun Ankkureihin. Luo myös Päättyvä-tyyppinen kortti, tarkista että sillä NÄKYY "📦 Arkistoi" -nappi kortin sisällä mutta Jatkuva-kortilla EI näy. Arkistoi se, tarkista että se katoaa Kortit-listasta ja ilmestyy "Arkisto"-linkin taakse; avaa se sieltä ja tarkista lukutila (ei lisäysriviä, ei muokkausta), palauta "↩"-napilla ja tarkista että se on taas Kortit-listassa. **Tärkein tarkistus:** kirjaudu Juhan tilillä samaan aikaan — Juha EI saa nähdä Katrin kortteja/tehtäviä missään (ei päänäkymässä, ei Ankkureissa), ja toisinpäin
- [ ] **Oma Hytti Kalenterissa:** aseta jonkin Hytti-tehtävän eräpäiväksi tämä päivä, avaa Kalenteri-näkymä päivätilassa (oletuksena tänään) — tehtävän pitäisi näkyä agendassa 🚪-etuliitteellä täppäysnapin ja ⚓-napin kanssa, samassa listassa Ankkureiden ja kalenteritapahtumien kanssa. Täppää se sieltä, tarkista että se häviää myös Hytin Tehtävät-koosteesta ja on täpätty kortin sisällä. Mene Asetuksiin, käännä "Näytä tänään erääntyvät Kalenterin päivänäkymässä" pois päältä, avaa Kalenteri uudelleen — Hytti-tehtävien pitäisi hävitä agendasta kokonaan (kalenteritapahtumat ja Ankkurit näkyvät yhä). Käännä takaisin päälle, tarkista että palautuvat näkyviin
- [ ] **Asetukset v1, koko näkymä läpi:** avaa Asetukset etusivun ruudukosta. **Tili:** oma sähköposti näkyy oikein, "Kirjaudu ulos" toimii (ja vie login-näkymään). **Vinkit:** yhdeksän riviä näkyvissä, luettavissa. **Sovellus:** versioteksti näyttää jonkin "vNN"-arvon (verrattavissa siihen mikä `sw.js`:ssä on koodissa — pitäisi täsmätä). Paina "Päivitä sovellus" — sivun pitäisi latautua uudelleen, ja jos joskus on ollut jumiutunut vanha versio näkyvissä, sen pitäisi hävitä. Paina "Hae kalenteri nyt" — pitäisi näkyä "Haetaan..." hetken ja sitten toast-ilmoitus tuloksesta, ja synkka-tilateksti päivittyy ("N min sitten"). **Huom: Oma Hytti -kytkin ei ole enää täällä** — se siirtyi 2026-07-11 Hytin omaan päänäkymään, testaa se sieltä (ks. Hytti-testauskohta).
- [ ] Muistilaput/Varasto-listarivien raahaus (011) — pitkä painallus, järjestys pysyy uudelleenkäynnistyksen jälkeen
- [ ] Listan siirto Muistilaput ↔ Varasto asetuksista, ja että takaisin-nuoli osuu oikeaan näkymään siirron jälkeen
- [ ] Kalenteri: lisää/poista tapahtuma päivänäkymässä, selaa viikko/kuukausi, ‹ › -navigointi, vaakatilan 7-sarakenäkymä viikossa (käännä puhelin oikeasti)
- [ ] Ankkurin nosto kalenteritapahtumasta (⚓) → näkyy sekä etusivun Ankkureissa että pysyy kalenterin tänään-agendassa merkittynä
- [ ] Ankkurin nosto Muistilaput-rivistä (⚓) → sama tarkistus
- [ ] Ankkurin irrotus (⚓ uudelleen) EI poista alkuperäistä riviä/tapahtumaa, vain itse ankkurin
- [ ] Ankkureiden ylivuoto: lisää 4+, tarkista "+N muuta odottaa" -linkki ja sen sisällä raahaus
- [ ] Navigointiruudukon laattojen raahaus (järjestys home_sections.sort_order:iin)
- [ ] Tuntopalaute (värinä) rastittaessa tuote/ankkuri valmiiksi — vaatii oikean puhelimen, ei näy selaimessa
- [ ] Automaattinen sivun päivitys uuden servicewaorkerin jälkeen — ei enää tarvitse sulkea/avata PWA:ta moneen kertaan
- [ ] Väliotsikot + otsikon-alle-kohdistettu lisäys (`#`-etuliite, napauta otsikkoa) — testattu kerran aiemmin, hyvä varmistaa ettei mikään myöhempi muutos rikkonut
- [ ] Siri-lisäys (`/api/add`) toimii yhä RLS:n ja service_role-avaimen kanssa oikeasta puhelimesta (Shortcut), ei vain curlilla
- [ ] Etusivun Kalenteri-laatta: isompi kuvake (34px) ja kuukausi+päivänumero näkyy oikein, myös kuun vaihtuessa
- [ ] **Ulkoisen kalenterin tuonti, koko putki läpi — EI TODELLISUUDESSA TESTATTU vielä uudella "yksi totuus, kaksi ikkunaa" -mallilla.** Käytä "Ajolista #2" ja sitä seuraavaa tarkistuslistaa Kalenterisyötteet-osion lopussa — se on ajantasainen. Vaiheet 0–4 alla ovat VANHENTUNEET (kuvaavat käytöstä poistunutta hyväksyntäjonoa, "⏳ N odottaa hyväksyntää" / Ok/Hylkää-napit eivät enää ole olemassa), säilytetty vain historiallisena muistina siitä miten `ics_url`+`vain_varattu`-testi tehtiin alunperin:
  - **Vaihe 0 — pohjatyö:** aja `sql/014_kalenteri_syotteet.sql` Supabasen SQL Editorissa, jos ei vielä tehty. ✓ AJETTU.
  - **Vaihe 1 — turvallinen testi ilman oikeaa dataa:** luo mikä tahansa testikalenteri (esim. uusi kalenteri omaan iCloudiin tai Google Kalenteriin), julkaise se ("Julkinen kalenteri" / "Jaa julkinen linkki" -asetus, tuottaa nettiosoitteen joka päättyy `.ics`). Lisää Supabasen Table Editorista `kalenteri_syotteet`-tauluun uusi rivi: `name` = vapaa nimi (esim. "Testi"), `tyyppi` = `ics_url`, `tunniste` = se .ics-osoite, `mode` = `vain_varattu`, `enabled` = tosi/true. Avaa sovelluksessa Kalenteri-näkymä (tämä käynnistää haun automaattisesti) ja tarkista että testikalenterin tapahtuma ilmestyy agendaan tekstillä "🔒 Varattu 18–20" (tai vastaava kellonaika) — EI näy otsikkoa, paikkaa eikä mitään muuta tietoa, vain kellonaika. **Tämä vaihe pätee edelleen sellaisenaan** — `vain_varattu` toimii samoin kuin ennen.
  - **Vaihe 2 (VANHENTUNUT):** ~~lisää toinen rivi `mode='taysi'` ja tarkista että se menee hyväksyntäjonoon~~ — `taysi`-tapahtuma näkyy nyt suoraan agendassa, mahdollisesti "uusi"-tagilla, ei minkäänlaista jonoa/viivettä.
  - **Vaihe 3 (VANHENTUNUT):** ~~hyväksyntä Ok/Hylkää-napeilla~~ — korvattu "✓ Kuittaa"/"Kuittaa kaikki" -napeilla, ks. "Kalenterin periaate" -osio.
  - **Vaihe 4 — toistuva tapahtuma:** jos jommassakummassa testikalenterissa on viikoittain toistuva tapahtuma (esim. harrastus), tarkista että KAIKKI hakuikkunan kerrat näkyvät kalenterissa erikseen, ei vain ensimmäinen kerta. **Pätee edelleen.**
  - **Jos mikään ei toimi / kirjautuminen epäonnistuu:** avaa selaimen kehittäjätyökaluista tai Vercelin lokeista virheilmoitus. Jos virhe mainitsee "401" (kirjautuminen hylätty), kokeile ensin vaihtaa Vercelin `ICLOUD_USERNAME`-arvo muotoon joka päättyy `@icloud.com`.
- [ ] **UUSI, tekemättä: Kuukausiruudukko + monipäiväiset tapahtumat (aja `sql/018_kalenteri_monipaivainen.sql` ensin).** Avaa Kalenteri, vaihda "Kuukausi"-tilaan — pitäisi näkyä oikea 7-sarakkeinen ruudukko (MA–SU-otsikkorivi, kuluva kuukausi + haaleampana edellisen/seuraavan kuukauden täyttöpäivät, tämä päivä korostettuna). Napauta mitä tahansa päivää — pitäisi avautua sen päivän päivänäkymä. Lisää testiksi (joko käsin `kalenteri_tapahtumat`-tauluun Table Editorista TAI oikean iCloud-kalenterin kautta) tapahtuma jolla `event_end_date` on eri kuin `event_date` (esim. 3 päivää kestävä) — tarkista että kuukausiruudukossa näkyy YHTENÄINEN VÄRILLINEN PALKKI kaikkien kolmen päivän kohdalla (ei kolmea erillistä pallukkaa), ja että teksti näkyy vain palkin alkupäässä. Tarkista sama tapahtuma myös viikko- ja päivänäkymässä keskimmäisenä päivänä — pitäisi näkyä siellä normaalina rivinä (ei siis vain tapahtuman `event_date`-päivänä). Jos tapahtuma osuu kahden viikon väliin kuukausiruudukossa, tarkista että palkki jatkuu järkevästi myös seuraavalla rivillä.
- [x] **Katrin tilin syötteet** — 017/018/019 ajettu 2026-07-08 illalla, synkka TOIMII (tuotti 15 riviä jonoon) — mutta paljasti BUGI A (liian lyhyt hakuikkuna) ja BUGI B (RRULE-poikkeusten haamuesiintymät), molemmat korjattu samana iltana, ks. "Ensimmäisen testin löydökset" Kalenterisyötteet-osiossa.
- [x] **Uusintasynkka "yksi totuus, kaksi ikkunaa" -mallilla — OSITTAIN TESTATTU 2026-07-10** (021/022 ajettu, ks. "Kahden puhelimen testisessio" -osio). 1) "laivatesti joulukuussa" AGENDASSA SUORAAN ✓ (BUGI A todistettu korjatuksi `?esikatsele=1`-datalla). 2) 'Ilmoittaudu kouluun' TÄSMÄLLEEN 2× ilman haamua ✓ (BUGI B todistettu korjatuksi). 3) "uusi"-tagi + badge ✓, 4) "Kuittaa kaikki" ✓ — **mutta VAIN Juha→Katri-suuntaan testattu, Katri→Juha-suunta puuttuu kokonaan.** 5) Muokkaus-/poistotesti iPhonen Kalenterista EI TEHTY (poistotesti keskeytyi Löydös 1:n selvitykseen, ks. testisessio-osio — tee UUDELLEEN nyt kun poistonappi on piilotettu synkatuilta riveiltä). 6) `?esikatsele=1` ajettu — **organizer on käytännössä aina null**, varasuunnitelma ("kaikki uutena kaikille") vahvistettu pysyväksi, `kalenteri_tekijat`-taulua ei täytetä.
- [ ] **UUSI, tekemättä: Kuormavahti (aja `sql/023_asetukset.sql` ensin, riippumaton muista) — EI VIELÄ VARSINAISESTI TODISTETTU 2026-07-10, ks. testisessio-osio.** ❕/⚑-merkki ei näkynyt 11.7. kohdalla vaikka päivällä oli 6 menoa — todennäköinen syy: testimenot olivat koko päivän tapahtumia (eivät kerrytä laskuria, tarkoituksellista). Avaa Asetukset, tarkista että "🚦 Kuormavahti" -kentässä näkyy oletusarvo 5. Lisää/synkkaa (tai käsin `kalenteri_tapahtumat`-tauluun) 5 **KELLONAIKAAN SIDOTTUA** (`event_time` asetettu) tapahtumaa samalle päivälle — avaa Kalenteri päivänäkymässä, tarkista että päiväotsikon perässä näkyy "⚑ 5" -merkki. Vaihda Kalenteria viikkotilaan, tarkista että sama päivä saa merkin siellä (muut päivät ei). Lisää koko päivän tapahtuma (esim. syntymäpäivä) samalle päivälle — tarkista että se EI nosta laskuria (pysyy "⚑ 5", ei "⚑ 6"). Vaihda raja Asetuksista esim. 3:een, tarkista että merkki nyt näkyy myös harvemmilla päivillä ilman koodimuutosta/uudelleenkäynnistystä. Synkkaa uusi tapahtuma kuormitetulle päivälle (5+) ja avaa kuittausjono — kortilla pitäisi näkyä "huom: päivällä jo N muuta menoa".
- [x] **Juhan CalDAV-tilin syöterivit — `sql/030` ajettu, paljasti kaksi nimiongelmaa** (jaettu kalenteri eri nimellä Juhan tilillä + kaksi samannimistä "Juha"-kalenteria), korjattu `sql/031_kalenteri_juha_nimikorjaus.sql`:llä + kalentereiden uudelleennimeämisellä iCloudissa. Ks. "Kalenterisyötteet"-osio.
- [x] **Juhan tilin nimikorjaus + Oma-kalenterin Hytti-scope — migraatiot AJETTU ja datatasolla VAHVISTETTU 2026-07-13** (`sql/031`→`033`→`032`, ks. PALUU.md OSA E). Synkka-JSON: 9 syötettä, 0 virhettä, 330 tapahtumaa, ei tuplia. Yhteinen kalenteri (Juha) löytää 45/45 samat kuin Perhekalenteri (Katri) — UID-suoja todistettu datalla. **Jäljellä VIELÄ ELÄVÄ KÄYTTÖLIITTYMÄTESTI:** Juha lisää testimenon "Oma"-kalenteriinsa (se on tällä hetkellä tyhjä) → tarkista että se näkyy HÄNEN Hytissään/kalenterissaan mutta EI NÄY Katrin missään näkymässä (scope-symmetria). Tunnettu, ei-huolestuttava sivuhavainto: jaetun "Juha"-kalenterin tapahtumamäärä näkyy erisuurena kahden tilin välillä (10 vs 3) — iCloudin oma jakosynkka tasoittaa tämän itsestään, ei toimenpidettä.
- [ ] **UUSI, tekemättä: Ruoka-välivaihe "Siirrä valitut Kauppalistalle" — EI TESTATTU.** Avaa mikä tahansa lista (esim. tee testiksi "Resepti: lohikeitto" Varastoon, 3-4 riviä). Paina otsikkorivin ☑-nappia — jokaisen rivin eteen pitäisi ilmestyä oma valintaruutu (eri asia kuin ✓/○-täppäysnappi), ja listan alle palkki "0 valittu" + [Peruuta] [Kauppalistalle] (jälkimmäinen harmaana/pois käytöstä). Valitse 2 riviä — laskurin pitäisi päivittyä "2 valittu" ja Kauppalistalle-nappi aktivoitua. Paina "Kauppalistalle" — toast-ilmoitus, ja Kauppalistassa (avaa se Muistilapuista) pitäisi näkyä 2 UUTTA riviä samoilla nimillä. **Tärkein tarkistus:** alkuperäinen lista (Resepti: lohikeitto) pysyy TÄYSIN ENNALLAAN — rivit EIVÄT poistuneet/siirtyneet, vain kopioituivat. Testaa myös Peruuta-nappi (sulkee valintatilan tallentamatta mitään) ja tarkista ettei ☑-nappi näy ollenkaan kun avaat Kauppalista-listan itsensä.
- [ ] **UUSI, tekemättä: Varaston "Luo kopio" — EI TESTATTU.** Avaa mikä tahansa lista (Muistilaput tai Varasto) jolla on ainakin yksi väliotsikko ja muutama rivi (osa täpättynä). Avaa listan asetukset (🔒/👥-nappi), paina "Luo kopio". Tarkista ehdotettu nimi ("{alkuperäinen} (kopio)"), muokkaa sitä ja hyväksy. Avaa uusi lista (samasta kategoriasta, esim. Muistilaput-näkymän kautta jos alkuperäinen oli siellä) — kaikki rivit ja väliotsikot pitäisi olla mukana SAMASSA järjestyksessä, mutta KAIKKI täpät auki ja ostoajat tyhjänä, vaikka alkuperäisessä osa oli täpättynä. Tarkista että uusi lista on YKSITYINEN oletuksena (ei jaettu, vaikka alkuperäinen olisi ollut jaettu). Peruuta kopiointi (paina peruuta/tyhjennä nimikenttä `prompt()`:issa) — mitään ei pitäisi syntyä.
- [ ] **UUSI, tekemättä: Vinkit ohjeet-taulusta (aja `sql/035_ohjeet_vinkit.sql` ensin) — EI TESTATTU.** Avaa Asetukset, tarkista että "💡 Vinkit" -osiossa näkyy 10 riviä (9 vanhaa + uusi "oletuskalenteri"-vinkki) OIKEASSA järjestyksessä. Lisää Table Editorista `ohjeet`-tauluun uusi rivi (`content`, `sort_order` esim. 105) — avaa Asetukset uudelleen, uuden rivin pitäisi näkyä ilman koodimuutosta/deployta. "Missä muokataan mitäkin" -alilista (5 riviä otsikon alla) pysyy ennallaan, EI ole osa tätä muutosta.
- [ ] **UUSI, tekemättä: Huomiopallurat (aja `sql/034_realtime_huomiopallurat.sql` ensin, ks. PALUU.md) — EI TESTATTU LAINKAAN.** Kahdella tilillä yhtä aikaa: Juha lisää menon → Katrin Kalenteri-laattaan pitäisi ilmestyä pallura ILMAN sivun päivitystä (odota muutama sekunti, Realtime). Kuittaa kaikki Katrin kalenterista → pallura katoaa. Juha kirjoittaa uuden ajatuksen Laituriin → Katrin Laituri-laattaan pitäisi ilmestyä pallura, Juhan OMALLE etusivulle EI (oma lisäys ei kerrytä omaa palluraa). Sijoita rivi ("→"-nappi) → pallura pienenee/katoaa. Tarkista että pallura on kokonaan POISSA (ei "0"-tekstiä) kun molemmat lähteet ovat nollassa. Jos puhelin on lisätty kotinäytölle (iOS 16.4+), tarkista että sovelluskuvakkeen oikeassa yläkulmassa näkyy numero joka seuraa palluroiden summaa, ja katoaa kun molemmat on kuitattu/sijoitettu.
