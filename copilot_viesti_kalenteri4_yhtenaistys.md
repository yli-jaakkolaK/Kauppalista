# Rakennusviesti Codelle — Priorisoitu jatko: jaetut komponentit, kuukausinäkymän ▫N-niputus

Kiitos tutkimusraportista — erittäin hyödyllinen ja rehellinen. Kaksi asiaa selveni heti: kalenterin pinta oli jo oikeasti deployattu (minun virheeni, luin vanhaa staged-kopiota kansiosta, ei tuoretta tiedostoa — sori siitä), ja K/J/P-omistajakirjainten poisto päivänäkymästä ei ollut vahinko vaan seurasi omasta pyynnöstäni. Tässä viestissä kolme asiaa, priorisoitu.

## 1. Jaetut komponentit ensin (koko sovellusta koskeva pass)

Raportin mukaan `check-btn`/`anchor-btn`/`overflow-btn`/`row-menu` on tietoisesti jätetty per-näkymä-korjausten ulkopuolelle koska ne ovat jaettuja usean näkymän kesken. Haluan että tämä tehdään ENSIN, ennen kuin kosketaan yksittäisiin näkymiin (Laituri, Hytti, tai koskemattomat 8: Asetukset/Lapsi/Muistilaput/Varasto/Teema/Vahdittu/App-view "Kauppalista"/Taitosolmu/Hytti-kortti). Syy: tämä hyödyttää kaikkia näkymiä kerralla ja välttää saman työn tekemisen moneen kertaan myöhemmin, kun jokainen näkymä siirtyy vuorollaan merikartta-pintaan.

- Siirrä nämä jaetut komponentit kokonaan merikartta/loki-designiin: fontti Courier Prime, `.saadin`-tyyppinen resepti napeille (messinkikehys, lasitausta, `--r-kosketettava`), `--keski`/`--kelluu`-liike (hover `translateY(-2px)`, active `translateY(0) scale(.996)`), samaan tapaan kuin `.ruori .segmentti` ja kalenterin `.saadin`-napit jo tekevät.
- Koska nämä ovat jaettuja komponentteja, muutos näkyy heti kaikissa näkymissä joissa niitä käytetään — tarkista ettei mikään näkymä hajoa visuaalisesti tästä (esim. jos jokin näkymä nojaa vanhaan `--border-dash`/`--accent`-ulkoasuun tavalla joka ei sovi yhteen uuden pinnan kanssa, tarkista tapauskohtaisesti eikä vain kokonaisuutena).
- **Ei koske tässä erässä:** näkymien omia taustoja/fontteja (Laituri, Hytti, koskemattomat näkymät) — ne ovat seuraavan erän asia, tulossa myöhemmin omana pyyntönään.

## 2. Kuukausinäkymän ▫N-niputus — hiljainen datahävikki korjattava

Tämä on tärkein yksittäinen toimintologiikkakorjaus juuri nyt. Raportin mukaan kuukausinäkymässä on kova katto (`KUUKAUSI_MAX_LINJOJA`, 4 linjaa) joka pudottaa ylimenevät tapahtumat kokonaan näkyvistä ilman mitään merkkiä. Tämä rikkoo suoraan vilkaisuarvo-periaatetta (KONSEPTIKIRJA.md periaate 1) — raskas päivä voi näyttää kevyeltä koska osa tapahtumista on hiljaa piilossa. Konseptikirja (kohta 4.4, kerrosarkkitehtuuri) kuvasi tähän jo ratkaisun jota ei ole vielä rakennettu:

- Kun päivän tapahtumia on enemmän kuin mahtuu näkyviin linjoina (nykyinen katto 4), näytä katon jälkeen yksi kompakti niputusmerkintä, esim. **"▫3"** (tarkka ulkoasu/tyyli Coden päätettävissä, sovi merikartta-designiin — pieni, luettava-pintainen, ei kosketettava-kokoinen nappi vaan hillitympi merkintä).
- Niputusmerkintä on napautettava: napautuksesta näkyy loput sen päivän tapahtumat (esim. päivänäkymään siirtymällä, tai pieni ponnahdusluettelo — kumpi on luontevampi olemassa olevaan rakenteeseen).
- Tärkeintä: **mikään tapahtuma ei saa enää kadota kokonaan näkyvistä ilman jälkeä.** Tämä koskee sekä isoja perhemenoja että pieniä hytti-tapahtumia — ei tarvitse (tässä erässä) tehdä erillistä kevyempää ilmettä hytti-tapahtumille (se oli konseptin toinenkin osa, "kevyempi ilme perheelle" — voidaan käsitellä myöhemmin omana pyyntönä jos tarpeen), riittää nyt että mikään ei häviä hiljaa.

## 3. K/J/P-omistajakirjaimet — ei toimenpiteitä nyt, päätös kirjattu

Tämä ei ole rakennuspyyntö, vain kuittaus: K/J/P-kirjainten poisto päivänäkymästä oli tarkoituksellinen (oma pyyntöni ⓘ-tunnisteen yhteydessä), ei jää korjattavaksi. Väri-identiteetti (punainen/sininen/violetti) riittää omistajan tunnistamiseen toistaiseksi. Jos joskus myöhemmin ilmenee tarve muulle tunnistustavalle kuin väri, se on oma erillinen keskustelu — ei nyt.

## Ei tähän erään
- Laituri/Hytti-näkymien täydentäminen, koskemattomat 8 näkymää — tulossa seuraavana omana pyyntönään kun jaetut komponentit (kohta 1) on tehty.
- Rikastuskerroksen yleistäminen (nyt vain Lukkari-kohtainen kovakoodattu ratkaisu) — ei akuutti, ei tässä erässä.
- Kuormavahti-kytkettyjen ehdotusten (parisuhdeaika, kevyen päivän ehdotus) tuominen näkymään #kalenteri-view — avoin, ei päätetty vielä, ei tässä erässä.
- Ristiriitapaketti v2:n testaus livekäytöllä, Laituri-jäsennys — muistutuksena edelleen, ei koske tätä erää.
