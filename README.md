# Satama 🌊

> Perheen yhteinen arjenhallinta-sovellus, jonka rakensin itse.
> Tämä on samalla kirje itselleni: näin tämä matka alkoi.

---

## Dokumentaatio ja ympäristö

- README.md = yleiskuvaus, tavoitteet, käyttötarve ja pääasiallinen onboarding-dokumentti.
- KONSEPTIKIRJA.md = suunnitteluperiaatteet, arkkitehtuuri ja pitkän aikavälin suunta.
- muistiinpanot.md = nykyinen työn muisti, tunnetut ongelmat, päätökset ja testauslista.
- COPILOT.md = tekniset käytännöt, koodauskonventiot ja agentin ohjeet.
- BACKUP.md = varmuuskopiointi ja palautusohjeet.

### Lukemisjärjestys
1. README.md
2. KONSEPTIKIRJA.md, osat 1–3
3. COPILOT.md
4. muistiinpanot.md vain tarvittaessa

### Ympäristömuuttujat

| Muuttuja | Käyttötarkoitus |
|---|---|
| SUPABASE_SERVICE_KEY | palvelinpuolen kirjoitukset ja käyttäjän JWT:n validointi |
| ANTHROPIC_API_KEY | Claude API -kutsut |
| ALY_MALLI | valinnainen malli- ja kustannusvalinta ilman koodimuutosta |
| VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT | web-push-allekirjoitus |
| MUISTUTUKSET_CRON_SECRET | cron-endpointtien suojaus ja GitHub/cron-job.org-kutsut |
| ICLOUD_USERNAME / ICLOUD_APP_PASSWORD | CalDAV-synkkaus |
| ICLOUD_USERNAME_JUHA / ICLOUD_APP_PASSWORD_JUHA | Juhan CalDAV-synkkaus |
| ITSLEARNING_ICS_KATRI / LUKKARIKONE_ICS_KATRI | opiskelukalenterien .ics-syötteet |

## Mikä Satama on

Satama on sovellus, jonka rakensin perheelleni. Se auttaa pitämään arjen langat käsissä, kun elämässä on paljon liikkuvia osia ja kaksi aikuista, joiden tulee olla samalla kartalla kalenterin ja noh elämän kanssa ylipäätään.

Yksinkertaisesta jaetusta kauppalistasta kasvoi vähitellen kokonainen kodin hallintapaikka: jaetut listat, yhteinen kalenteri, muistutukset, tehtävät, oma yksityinen työtila, ja pieni tekoälyavustaja joka auttaa nostamaan tärkeät asiat esiin.

Nimi *Satama* kuvaa sitä mitä halusin: paikan, johon arjen asiat voivat rantautua turvaan, ettei niitä tarvitse kantaa päässä.

---

## Miksi rakensin sen

Halusin työkalun, joka sopii **oikeaan arkeen** — ei sellaista jota pitää jaksaa ylläpitää täydellisesti, vaan sellainen joka toimii silloinkin kun kukaan ei jaksa mitään.

Yksi periaate ohjasi kaikkea: **rakennetaan arki-minälle, ei ideaaliminälle.** Ideaaliminä pilkkoisi viikon vihannekset valmiiksi lasikulhoihin sunnuntaina. Arki-minä avaa jääkaapin väsyneenä tiistai-iltana. Sovellus on tehty sille jälkimmäiselle.

Toinen kantava ajatus oli **vilkaisuarvo**: yhdellä silmäyksellä pitää nähdä se mikä on tärkeää, ilman että joutuu kaivamaan tai miettimään.

---

## Mitä se osaa

- **Jaetut listat** — kauppalista, muistilaput, tarkistuslistat. Kun toinen lisää jotain, se näkyy toisen puhelimessa heti, sekunneissa.
- **Yhteinen kalenteri** — molempien menot samassa näkymässä, sekä oma että perheen. Kalenteri huomaa, jos kahdella asialla on päällekkäisyys, ja ehdottaa keskustelua sen sijaan että vain valittaisi ristiriidasta.
- **Muistutukset** — pörähtävät puhelimeen ajallaan, myös silloin kun sovellus ei ole auki.
- **Laituri** — paikka johon voi heittää ajatuksen talteen ennen kuin se ehtii kadota. Pieni tekoälyavustaja auttaa nostamaan niistä tärkeimmät esiin.
- **Hytti** — jokaisen oma yksityinen työtila. Sen sisältö ei näy toiselle, koskaan.

---

## Yksityisyys: kuka näkee mitä

Perheen jaetut asiat näkyvät molemmille, mutta jokaisella on myös oma tilansa, jota toinen ei näe.

Tämän takana on **RLS** — ajattele sitä **portsarina**, joka tarkistaa jokaiselta pyynnöltä: *saatko sinä nähdä tämän?* Minun yksityiset asiani eivät näy toiselle, eivätkä hänen minulle. Portsari päättää sen, ei satunnaisuus.

---

## Millä tämä on tehty

- **HTML, CSS ja JavaScript** — itse sovellus
- **Supabase** — tietokanta, jossa data asuu, ja kirjautuminen
- **Vercel** — täällä sovellus on julkaistu nettiin
- **GitHub** — täällä koodi asuu

Muutama asia jonka opin nimeltä matkan varrella:

- Satama on **PWA** — se ei ole sovelluskaupasta ladattava äppi, vaan nettisivu, joka näkyy puhelimen kotivalikossa ja tuntuu oikealta sovellukselta.
- **Realtime** tarkoittaa, että kun toinen lisää jotain, se näkyy toisen puhelimessa heti, sekunneissa.
- **Cron** on kuin postimies, joka noin viiden minuutin välein käy katsomassa onko kalenterissa uutta ja toimittaa tiedot eteenpäin.
- **RLS** on se portsari, joka päättää kuka näkee mitä.

---

## Matka: mistä lähdin

Aloitin tämän projektin **ilman aiempaa kokemusta verkkokehityksestä.** Osasin vähän Pythonia, en juuri muuta. Tästä on nyt kolme viikkoa.

Ja tässä on syytä olla rehellinen: **en ole kirjoittanut tätä koodia itse.** Koodin on kirjoittanut **Claude Code**, tekoälytyökalu, jolle olen kuvannut mitä haluan. Suunnittelukin on syntynyt vuoropuhelussa tekoälyn kanssa: minä olen tuonut arjen, tarpeet ja kysymykset — ja usein myös hyväksynyt ehdotuksen sellaisenaan, kun se on ollut hyvä, tai tyrmännyt sen, kun se ei olisi toiminut meidän oikeassa elämässämme. Minun työtäni on ollut pitää langat käsissä: mitä rakennetaan seuraavaksi, toimiiko se oikeasti, ja jokaisen bugin löytäminen testaamalla oikeilla laitteilla ja oikealla perhe-elämällä.

Opettelin siis kahta asiaa yhtä aikaa: **miten sovellus rakentuu, ja miten tekoälyn kanssa rakennetaan.** Kumpaakaan en osannut kolme viikkoa sitten.

Matkalla opin asioita myös kantapään kautta:

- että **vahvistuksen pitää seurata todellisuutta** — sovellus ei saa näyttää tehdyksi jotain mitä ei ole tehty, edes vahingossa;
- että paras ratkaisu on joskus **sopimus ihmisten välillä**, ei uusi ominaisuus;
- ja että **käyttäjän todellinen arki voittaa aina siistin suunnitelman.**

Osa koodista on suomeksi, osa englanniksi — se kertoo missä vaiheessa matkaa mikäkin osa syntyi. Tämä ei ole valmis kiiltokuva vaan **oppimisen todiste** — ja siksi arvokkaampi minulle sellaisenaan.

Muutamassa viikossa Satama kasvoi yksinkertaisesta jaetusta kauppalistasta perheen yhteiseksi alustaksi, jota molemmat oikeasti käyttävät joka päivä.

---

## Tälle matkalle saa tulla mukaan

Kirjoitin tämän ensisijaisesti itselleni: että voin joskus palata tähän ja nähdä, millaisen matkan olen tehnyt.

Mutta jos sinä — utelias, kollega, ehkä tuleva työnantaja — löysit tänne, olet lämpimästi tervetullut. 🌊
