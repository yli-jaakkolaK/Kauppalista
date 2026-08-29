# Rakennusviesti Copilotille — Kalenteri-osio: UI-viimeistely + Lukkarin live-luennot perhekalenteriin

(Korvaa mahdollisen aiemman `copilot_viesti_kalenteri.md`-luonnoksen kokonaan — väreissä oli virhe siinä.)

Kolme asiaa samassa erässä, koska kaikki koskevat samaa kalenterinäkymää. Mockup nähtävissä: https://claude.ai/code/artifact/6868b897-0c4c-44b3-89a0-45a17951b217

## 1. Kalenteri-UI:n visuaalinen viimeistely

Toiminnallisuus (päivä/viikko/kuukausi-näkymät, ristiriitamerkki, huolilippu) on jo pystyssä ja toimii — vain UI on kesken/ei vastaa tavoitetta. Kaksi lähdettä yhdistettynä: `kalenteri_ui_maaritys.md` (rakenne/layout, `Projektit/kauppalista/`-kansiossa) + Sataman merikartta/loki-design system (`satama-design-system.css`, `satama-design-kuvaus.md`) jota Ruori-etusivu jo käyttää kokonaan — kalenterinäkymät eivät vielä ole täysin samassa visuaalisessa kielessä.

- **Värit — EI MUUTETA.** Käytössä on jo oleva iCal-väripaletti (`style.css`: `--kal-katri: #D32F2F`, `--kal-juha: #1976D2`, `--kal-yhteinen: #8E44AD`), ollut käytössä 10+ vuotta — ei vaihdeta mihinkään uuteen palettiin. Rebekka oranssi, Jamiel vihreä lisätään samalla periaatteella (tarkka hex Copilotin päätettävissä, esim. #E07B2B / #4C8C4A). Merikartta-teemaa (paperi/muste/messinki/sinappi) sovelletaan vain kortteihin, kehyksiin, napitukseen ja pyöristyksiin (`--r-luettava: 3px` luettaville riveille, `--r-kosketettava: 13px` napeille/valitsimille) — ei itse tapahtumien henkilöväreihin.
- **Kuukausinäkymä**: pelkät ohuet viivapalkit kellonajan mukaan (07–23, ei tekstiä/nimiä), päivän numero pienenä. Päällekkäiset tapahtumat porrastetaan eri korkeudelle. Kuorma näkyy tasavärisenä taustana solussa (ei pilleriä, ei tekstiä) — sama periaate kuin Ruorin kalenterisegmentissä.
- **Merkit**: ⚠️ ristiriita, 🟠 huolilippu — molemmat jo olemassa, säilytetään sellaisenaan.
- **Viikkonäkymä**: listasta aikajanaksi (07–23 tuntiruudukko, absoluuttinen top/height). Koko päivän tapahtumat omalla rivillä ylhäällä. Tapahtumapalkki: värillinen border-left (3px) + kevyt taustaväri samasta sävystä.
- **Kuorma viikko/päivänäkymässä**: viikossa taustasävy per päiväsarake; päivänäkymässä oma tilarivitys yläreunaan (● kevyt / ●● keski / ●●● raskas) + lyhyt syy tekstinä — ainoa paikka missä kuorman syy näkyy tekstinä.

### Tärkeä korjaus: teksti ei saa koskaan katketa piiloon
Sekä päivä- että viikkonäkymässä täydet nimet, paikat ja selitteet pitää näkyä kokonaan — ei `text-overflow: ellipsis`, ei `overflow: hidden` joka piilottaa tekstiä, ei rivimäärärajaa joka katkaisee pitkän tapahtumanimen tai osoitteen. Jos tila ei riitä, rivi/palkki kasvaa korkeammaksi (`white-space: normal; overflow-wrap: break-word`) mieluummin kuin hukkaa sisältöä. Tämä koski erityisesti viikkonäkymän tapahtumapalkkeja, joissa tähänastisessa luonnoksessa nimi näkyi vain jos palkki oli tarpeeksi korkea — korjataan niin että nimi näkyy AINA.

### Viikkonäkymä vaakatilassa
Kun puhelin käännetään vaakatasoon, viikkonäkymän pitää hyödyntää lisätila järkevästi — koko viikko mahtuu näkyviin ilman vaakavieritystä ja sarakkeet saavat enemmän leveyttä tekstille. Pystyasennossa (kapea näyttö) koko aikajana saa sen sijaan vierityä vaakasuunnassa omassa `overflow-x: auto`-säiliössään, jotta sarakkeet eivät koskaan puristu niin kapeiksi että teksti katkeaa. Sama periaate kuin sovelluksessa on jo käytössä muualla: `style.css`:ssä on jo `@media (orientation: landscape) { #kalenteri-view { max-width: 900px } }` — laajenna tämä koskemaan myös uutta viikon aikajananäkymää.

## 2. Lukkarin live-luennot automaattisesti perhekalenteriin, osoite mukana

Tällä hetkellä Lukkarikoneesta tulevat live-luennot näkyvät vain Katrin omassa Hytti-osiossa. Rakennetaan niin että:

- Luennot tulevat **automaattisesti** näkyviin myös jaettuun perhekalenteriin — ei käsin siirtoa, ei kuittausta, ei erillistä toimintoa Katrilta. Sama periaate kuin muissa ICS-syötteissä (ks. KONSEPTIKIRJA.md kohta "Yksi totuus, kaksi ikkunaa").
- Vain **live-läsnäolopakolliset** luennot tuodaan — tämä on jo valmiiksi ainoa asia mitä Lukkarista Katrin kalenteriin tulee, mitään erillistä suodatusta ei tarvita. Itsenäinen/omaehtoinen opiskeluaika ei tule Lukkarista eikä näy perhekalenterissa, pysyy Hytin sisällä.
- **Koulun osoite pitää olla valmiina mukana** jokaisessa luentotapahtumassa, ei vain otsikko+aika. Jos Lukkarikoneen ICS-/rajapintadata sisältää sijainnin, se poimitaan suoraan; jos ei, tarvitaan rikastuskerros (ks. KONSEPTIKIRJA.md kohta "Syötetapahtumien rikastuskerros" — Satama voi tallentaa oman kerroksensa syötetapahtuman päälle sen sijaan että muokkaa syötettä suoraan). Osoite näkyy päivänäkymässä kokonaan (ks. yllä "teksti ei saa katketa") ja viikkonäkymässä silloin kun tapahtumapalkissa on tilaa.
- Perhekalenterissa luento näkyy **täysin tavallisena Katrin omana tapahtumana** — ei omaa erityismerkintää, ikonia tai "luento"-tagia, ei omaa väriä. Käyttää Katrin väriä (#D32F2F) ja samaa esitystapaa kuin mikä tahansa muu Katrin meno (kuukausi: viivapalkki, viikko: värillinen palkki, päivä: rivi listassa) — tämä on tietoinen päätös 24.8.2026, ei jäänyt auki.
- Tekninen toteutustapa (tallennetaanko luento omana rivinä `kalenteri_tapahtumat`-tauluun Lukkari-synkassa, vai luetaanko se sieltä missä Hytti sen jo pitää) on Copilotin päätettävissä — kunhan lopputulos näkyy sekä Hytissä että perhekalenterissa automaattisesti.
- Huomioi olemassa oleva periaate: live-tapahtumat (täytetty merkki) erotetaan muodolla omasta opiskelusta (avoin merkki), ja live huomioi matka-ajat kuormalaskennassa — koskee myös näitä Lukkarista tuotuja luentoja nyt kun ne ovat osa perhekalenteria.

## Ei tähän erään
- Kalenterikorttien logiikka Ruori-etusivulla ja Nyt-näkymässä on jo lukittu erikseen (ks. ruori-etusivu.md ja nyt-nakyma.md) — ei koske tätä erää, tämä koskee vain itse kalenterinäkymiä (kuukausi/viikko/päivä).
