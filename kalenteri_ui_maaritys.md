# Kalenteri UI — kolme muutosta

## 1. Kuukausinäkymä: pelkät viivapalkit, ei tekstiä

Jokainen kalenterisolu (52px korkea ≈ 1cm puhelimella) näyttää:
- Päivän numeron (10px, vasemmassa yläkulmassa)
- Viivapalkkeja kellonajan mukaan — ei tekstiä, ei tapahtumanimiä

### Viivapalkin logiikka

Aikajana: 07:00–23:00 (16h) vaakatasolla. Vasen reuna = aamu,
oikea reuna = ilta.

Laskukaavat:
  left%  = (alku_h - 7) / 16 * 100
  width% = kesto_h / 16 * 100   (min 4% ettei katoa)
  height = 5px, border-radius: 2.5px

Päällekkäiset tapahtumat siirretään eri korkeudelle:
  Ensimmäinen: top: 12px
  Toinen:      top: 20px
  Kolmas:      top: 28px

### Yön yli / koko päivä -tapahtumat

Sama logiikka, mutta viiva ulottuu solun reunaan asti:
- Lähtöpäivä (yo-lahto): ulottuu oikeaan reunaan, oikea reuna suora
  (border-top-right-radius:0; border-bottom-right-radius:0; right:0)
- Jatkopäivä (yo-keski): left:0; right:0; border-radius:0
- Saapumispäivä (yo-tulo): alkaa vasemmasta reunasta, vasen reuna suora
  (border-top-left-radius:0; border-bottom-left-radius:0; left:0)

EI VÄLEJÄ viikonvaihteessa. Viiva on yksi yhtenäinen elementti per
tapahtuma per solu — ei katkea, ei rako, ei uusi elementti joka päivälle.

### Värit

Katri: #a855c7 (lila/pinkki)
Juha: #3b82d6 (sininen)
Molemmat: #7b5ea7 (tumma lila)
Lapset (hoito, kuljetus): #6b6660 (harmaa)
Muu/Katri lapsi: #e05555 (punainen — Katrin meno johon lapsi liittyy)

### Merkit

⚠️ ristiriita: 8px, oikea yläkulma (position:absolute; top:2px; right:2px)
🟠 huolilippu: 5px pyöreä piste, oikea yläkulma (jos ⚠️ myös, piste sen viereen)

### Päivän kuorma taustavärinä

Kuormavahdin laskema tulos näkyy solun taustavärinä — ei pilleriä,
ei tekstiä, pelkkä sävy. Se lukee nopeammin kuin mikään teksti ja
vie nolla tilaa viivapalkkien alta.

Toteutus: lisää CSS-luokka .pv-elementin päälle sen mukaan mitä
opintoPaivanKuorma() palauttaa kyseiselle päivälle:

Tumma tila:
  kevyt  → #12201d (ei muutosta)
  keski  → #1c3028
  raskas → #2a4a38

Vaalea tila:
  kevyt  → #f2f0ec (ei muutosta)
  keski  → #f5d8c8
  raskas → #e8a090

Keski ei tarvitse olla selvästi kevyempi kuin raskas —
porrastus on tarkoituksella pehmeä.

Sama logiikka kuin Hytin Tänään-kortin kuormamerkintä, mutta
visuaalisena taustana tekstin sijaan. Kuorma ei koskaan kilpaile
viivapalkkien kanssa koska se on eri visuaalinen kerros.

### Napahtus

Päivää napauttamalla aukeaa päivänäkymä jossa kaikki tapahtumat
teksteineen. Kuukausi on tilannekatsaus, ei luettelo.

---

## 2. Viikkonäkymä: yhdistetty henkilömerkki

### Nykyinen ongelma
Jokaisella rivillä on sekä värillinen pallo (11px) ETTÄ iso soikio
kirjaimella (150px leveä). Sama tieto kahdesti, ~170px hukkaan,
otsikot katkeavat kuuteen merkkiin.

### Korjaus
Poistetaan soikio kokonaan. Tilalle yksi 19×19px ympyrä jossa:
- taustaväri = henkilön väri (sama kuin kuukausinäkymässä)
- sisällä kirjain (P/J/K/yht) 10px bold, tumma

Otsikko saa nyt ~30 merkkiä leveyttä soikion poistuttua.

---

## 3. Viikkonäkymä: aikajananäkymä

Viikkonäkymä muutetaan listasta aikajanaksi.

Rakenne per päiväsarake:
- Yläosa: kokonaispäivän tapahtumat (yön yli, koko päivä) omalla
  kapealla rivillään — sama yo-lahto/yo-keski/yo-tulo -logiikka kuin
  kuukausinäkymässä. Ei kilpaile kellonaika-alueen kanssa.
- Kellonaika-alue: tuntiruudukko, 07:00–23:00. Tapahtumat sijoitetaan
  absoluuttisesti top/height kellonajan mukaan.
  top%   = (alku_h - 7) / 16 * 100
  height% = kesto_h / 16 * 100

Tapahtumapalkki viikkonäkymässä:
- Vasemmassa reunassa 3px värillinen border-left (henkilön väri)
- Taustaväri: sama väri 15% opasiteetti
- Teksti: merkki (19px ympyrä) + nimi. Nimi näkyy jos palkki on
  tarpeeksi korkea (≥28px); alle sen vain merkki.

Päällekkäiset tapahtumat samana päivänä: vierekkäin (50%/50% leveydestä),
ei päällekkäin.

---

## 4. Kuorma päivä- ja viikkonäkymässä

### Viikkonäkymä
Sama taustasävy-logiikka kuin kuukaudessa — joka päiväsarakkeen
tausta muuttuu kuormatason mukaan. Tuttu käyttäjälle joka siirtyy
kuukaudesta viikkoon: sama visuaalinen kieli, sama CSS-luokka.

  kevyt  → ei muutosta
  keski  → tumma #1c3028 / vaalea #f5d8c8
  raskas → tumma #2a4a38 / vaalea #e8a090

### Päivänäkymä
Päivänäkymässä tilaa on enemmän — kuorma näkyy näkymän yläreunassa
omana tilarivityksenä, ei piilotettuna taustaan:

  "● kevyt"  /  "●● keski"  /  "●●● raskas"

ja perässä lyhyt selitys mistä koostuu:
  "2 merkintää"  tai  "3 merkintää + 🟠"  (jos huolilippu vaikuttaa)

Tämä on ainoa paikka koko kalenterissa jossa kuorman syy näkyy
tekstinä — muualla pelkkä sävy riittää.

---

## Ei muuteta

- Päivänäkymä pysyy ennallaan (lista, täydet nimet, kellonajat)
- Kuukausinäkymän solujen koko pysyy ~52px
- Värit pysyvät samoina kaikissa näkymissä
