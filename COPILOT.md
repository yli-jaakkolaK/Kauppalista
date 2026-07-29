# COPILOT.md — tekninen jatko-opas

Tämä tiedosto on eri asia kuin **muistiinpanot.md** (projektin historia, päätökset, konteksti — "miksi asiat ovat kuten ovat", sisältää myös kesken olevan testauslistan) ja **BACKUP.md** (kertaluontoiset käsintehtävät toimenpiteet). COPILOT.md on paikka jonne kirjataan **"miten tähän järjestelmään lisätään uutta"** -tyyppinen tekninen ohjeistus — kirjoita tänne kun rakennat jotain jonka päälle ODOTETAAN rakennettavan lisää myöhemmin (kuten äly-putki alla). Jos vain korjaat bugin tai lisäät kertaluontoisen ominaisuuden, se kuuluu muistiinpanot.md:hen, ei tänne. **(PALUU.md poistettu 2026-07-17 — sisältö siirretty muistiinpanot.md:n "Testauslista — kesken" -osioon.)**

**Lue myös KONSEPTIKIRJA.md** — se kertoo miksi asiat ovat niin kuin ovat ja mitä on suunniteltu rakentamatta.

---

## Koodikieli: uusi koodi englanniksi (talon sääntö, kirjattu 2026-07-13)

**Tästä eteenpäin uusi koodi kirjoitetaan englanniksi** — funktioiden ja muuttujien nimet SEKÄ koodikommentit. Kolme rajausta:

1. **EI massauudelleennimeämistä olemassa olevalle koodille.** Tietokannan taulut/sarakkeet (`tuotteet`, `lists`, `nimi`, `tehty`, `list_id` ym.) ja toimivat, koskemattomat funktiot pysyvät nykyisissä suomenkielisissä nimissään. Nimeä olemassa oleva koodi uudelleen VAIN jos se muutenkin kirjoitetaan kokonaan uusiksi samassa työssä (esim. bugikorjaus joka jo muutti funktion sisältöä merkittävästi — silloin on järkevää nimetä se englanniksi SAMALLA). Sekakielisyys (osa suomeksi, osa englanniksi, rinnakkain samassa tiedostossa) on HYVÄKSYTTY, tarkoituksellinen välitila — raja kulkee "uusi = englanti", ei "kaikki heti englanniksi".
2. **Käyttäjälle näkyvät tekstit ovat AINA suomeksi** — UI-tekstit, virheilmoitukset, toastit, push-ilmoitukset, kaikki mitä Katri tai Juha lukevat sovelluksessa. Tämä sääntö koskee VAIN koodin omaa kieltä (nimet, kommentit), ei koskaan käyttöliittymän kieltä.
3. **Tietokannan skeeman nimet pysyvät suomeksi historiallisista syistä** — uusi koodi viittaa niihin sellaisenaan, ei käännetä kutsuhetkellä. Esimerkki: `deleteList()` (englanninkielinen funktio) operoi silti `tuotteet`-taulua ja sen `list_id`-saraketta — tämä on OK, ei ristiriita.

**Miksi tämä on kirjattu, ei vain hiljainen tapa:** englanti ei ole vain tekoälytyökaluja varten. Repo on julkisessa palvelussa (GitHub) — yleisesti ymmärretyt nimet tekevät koodista luettavaa, kommentoitavaa ja autettavaa KENELLE TAHANSA (issueiden kirjoittaminen, koodiesimerkkien jakaminen, virheviestien googlaus, tulevat avustajat jotka eivät osaa suomea). Suomenkielinen koodi rajaisi kaiken tulevan yhteistyön ja avunsaannin vain suomenkielisiin. Tarkoitus on että koodi muuttuu englanninkieliseksi AJAN SAATOSSA, sitä mukaa kun tiedostoihin muutenkin kosketaan — ei kertarysäyksellä, ei koskaan koskematta koodiin jota ei olisi muutenkaan tarvinnut muuttaa.

---

## Uusi testattava toiminnallisuus → aina myös testirivit apin omalle listalle (talon sääntö, kirjattu 2026-07-18)

**Aina kun rakennat uutta testattavaa toiminnallisuutta, tuota SAMASSA ERÄSSÄ myös migraatio joka lisää sitä vastaavat testirivit Sataman OMALLE "Testipäivä to 16.7." -listalle** (Muistilaput, ks. sql/036 alkuperäinen luonti + sql/054/057/060/064 mallit myöhemmästä lisäyksestä). Ei koskaan pelkkä muistiinpanot.md-merkintä yksinään.

**Miksi:** Katri testaa konkreettisesti puhelimella (mm. bussimatkalla, yhdellä peukalolla täppäillen) — apin oma lista ON se todellinen testauskäyttöliittymä, ei muistiinpanot.md jota ei lueta puhelimella kesken arjen. Kaksi eri roolia, molemmat pidettävä ajan tasalla SAMALLA työllä:
- **muistiinpanot.md:n "Testauslista — kesken"** = Copilotin/Claude Coden oma tekninen työmuistio (mitä pitää muistaa tutkia/korjata, viitaten koodiin ja bugeihin).
- **Sataman oma lista** = Katrin käytännön täppäyskäyttöliittymä (mitä pitää kokeilla kädessä, rivi kerrallaan).

**Malli (idempotentti, KRIITTINEN):**
1. Hae listan id nimellä `'Testipäivä to 16.7.'` — jos ei löydy, `raise exception`.
2. Idempotenssitarkistus YHDELLÄ tunnistettavalla rivinimellä (`exists (select 1 from tuotteet where list_id = v_list_id and nimi = ...)`) — jos jo olemassa, `return` heti tekemättä mitään.
3. Hae `coalesce(max(sort_order), 0)` ja lisää KAIKKI uudet rivit sen jälkeen (`+10`, `+20`, ...) — EI KOSKAAN toisteta koko listaa (kuten sql/036 tekee kertaluontoisesti), EI KOSKAAN nollata jo täpättyjä rivejä.
4. Ryhmittele uusi `'OSA <seuraava kirjain> · <kuvaus>'` -otsikkoriviksi (`is_header:true`) ennen sen alle kuuluvia testirivejä (`is_header:false`) — tarkista aina VIIMEISIN käytetty OSA-kirjain (`grep -rho "OSA [A-Z]* ·" sql/*.sql`) ettei kirjaimia törmää.
5. Jos testi vaatii kahden käyttäjän session tai vuorokauden yli menevän odotuksen, mainitse se rivissä/otsikossa eksplisiittisesti (sama käytäntö kuin OSA L/M/R/S:ssä).

---

## Uusi kirjoituspolku → nämä 4 asiaa aina (talon sääntö, kirjattu 2026-07-19 kirjoituspolkujen auditoinnin jälkeen)

**Tausta:** projekti on kärsinyt VIIDESTI "success:true joka valehteli" -bugista ennen tätä kirjausta (pahin: `caldav-sync.js`:n eräkirjoitus kaatui kokonaan duplikaatti-`ical_uid`:iin viikkojen ajan ilman että kukaan koodissa tarkisti vastausta). 2026-07-19 tehty koko koodikannan auditointi (kaksi rinnakkaista tutkimusagenttia, ~104 kirjoitus-/lähetyskutsua käytiin läpi `script.js`:ssä ja kaikissa `api/*.js`-tiedostoissa) löysi saman virhemallin ~14 KOKONAAN tarkistamattomasta kirjoituksesta lisäksi kymmeniä joissa virhe kirjattiin konsoliin muttei koskaan käyttäjälle — ks. muistiinpanot.md "Kirjoituspolkujen auditointi" täydelle raportille.

**Jokainen uusi Supabase-kirjoitus (insert/update/upsert/delete) tai lähetys (push, ulkoinen API) tarkistaa NÄMÄ NELJÄ asiaa, aina — ei koskaan poikkeuksena "tämä on niin pieni kirjoitus ettei sillä ole väliä":**

1. **Tarkista `error`/`response.ok` JOKA kerta.** Supabase-js EI HEITÄ poikkeusta tietokantatason virheestä (RLS, rajoite-rikkomus, "cannot affect row a second time" -tyyppinen eräkirjoitusvirhe) — se palauttaa VAIN `error`-kentän. `try/catch` ei riitä yksinään, sama koskee raakoja `fetch()`-kutsuja `api/`-funktioissa (`response.ok`).
2. **Käyttäjälle näkyvä, rehellinen virhe — ei koskaan hiljainen console.error yksin.** Käytä `script.js`:ssä jaettua `ilmoitaKirjoitusvirheesta(error, 'Konteksti')`-funktiota (palauttaa `true` jos virhe, näyttää sekä konsolilokin että `naytaIlmoitus()`-toastin). Palvelinpuolella (`api/*.js`) vähintään selkeä `console.error()` jonka Vercel Logs näyttää — käyttäjä näkee joka tapauksessa cronin oman lopputuloksen kautta (ks. kohta 4).
3. **Älä jatka kuin kirjoitus olisi onnistunut.** Jos toiminto koostuu USEASTA peräkkäisestä kirjoituksesta (esim. sisältö + tilamerkintä, tai poisto + siivous), TARKISTA ensimmäinen ENNEN kuin teet toisen — epäonnistunut ensimmäinen ei saa koskaan johtaa toiseen kirjoitukseen joka olettaa sen onnistuneen (esimerkki: `dismissButton`-hylkäyksessä `merkitseAlyMuruKasitellyksi()` ei saa suorittua jos itse ankkurin poisto epäonnistui — se estäisi murun uudelleenarvioinnin ikuisesti vaikka ehdokas jäi elämään).
4. **Eräkirjoitusten (batch insert/update/upsert usealle riville) JA cron-/endpoint-vastausten pitää raportoida TODELLINEN määrä, ei yritetty määrä.** `matchesCreated++`/`poistettuja`/`kirjoitettuja`-tyyppiset laskurit kasvavat VASTA kun vastaava kirjoitus on VARMISTETTU onnistuneeksi — ei ennen sitä, ei oletuksena.

**Poikkeus, tietoinen:** puhtaasti sisäinen "nähty"-bookkeeping (esim. `laituri_nahty`, `aly_log_seen`) jolla ei ole käyttäjälle näkyvää seurausta jos se epäonnistuu satunnaisesti — riittää että virhe on checked+logged (kohdat 1-2), ei tarvitse omaa toast-viestiä (kohta 2:n "näkyvä" on tarkoituksella höllempi tälle luokalle, muuten jokainen taustapäivitys ränkyttäisi käyttäjää turhaan — ks. "Satama ei ränkytä" -periaate muualla tässä dokumentaatiossa).

---

## Äly-putki (`api/aly.js`, rakennettu 2026-07-11, todistettu + ensimmäinen oikea ominaisuus 2026-07-12)

### Mikä tämä on

Yksi endpoint (`POST /api/aly`) joka kutsuu Anthropicin Messages API:a ja palauttaa vastauksen. Putki todistettu "Testaa äly" -napilla Asetukset → Sovellus-osiossa (sama todistusrooli kuin push-testinapilla oli push-infralle, ks. muistiinpanot.md "Push-ilmoitukset"-osio) 2026-07-12. Ensimmäinen oikea älyominaisuus (Laituri-avustaja) rakennettu heti perään, ks. alla.

Jokainen tuleva älyominaisuus (Siri-tulkinta, jääkaappikuvan tulkinta, ym.) rakentuu TÄMÄN päälle — ei omaa erillistä Anthropic-integraatiotaan.

### *** PERIAATE: ÄLY EHDOTTAA, IHMINEN KUITTAA ***

Tämä on talon periaate kaikelle mitä äly-putken päälle rakennetaan, ei vain tekninen yksityiskohta:

- **Äly ei koskaan kirjoita dataa suoraan** mihinkään Supabase-tauluun ilman että käyttäjä on ensin nähnyt ja hyväksynyt sen. `/api/aly` itsessään EI kirjoita mitään — se vain palauttaa tekstiä kutsujalle.
- Jokainen tuleva ominaisuus jonka äly "tekee" (esim. ehdottaa mihin kategoriaan Laiturin rivi kuuluu, tulkitsee mitä Siri-komento tarkoitti) esitetään käyttäjälle EHDOTUKSENA jonka voi hyväksyä sellaisenaan, muokata, tai hylätä — sama malli kuin kuittausjonolla on jo kalenterisynkalle (ks. muistiinpanot.md "Kalenterin periaate: yksi totuus, kaksi ikkunaa") ja kuin Vaihe 2:n loma-aikojen automaattitäytöllä on suunniteltu toimimaan (ks. "Loma-aikojen täyttö" -osio: "EI KIRJOITA suoraan ilman vahvistusta").
- Kun rakennat uutta älyominaisuutta: jos suunnittelet UI:ta joka tallentaa älyn vastauksen tietokantaan ILMAN välikätistä hyväksyntävaihetta, pysähdy — se rikkoo tätä periaatetta, suunnittele uudelleen.

### *** PERIAATE: MAKSIMIAUTOMAATIO, MINIMIKUSTANNUS *** (sisarperiaate edelliselle — tämä koskee KUINKA USEIN ja MILLÄ tavalla, "Äly ehdottaa" koskee MITÄ)

Kaikki mikä voi tapahtua automaattisesti, tapahtuu automaattisesti — mutta halvimmalla toimivalla tavalla. Neljä sääntöä ennen kuin rakennat mitään uutta äly-putken päälle:

1. **Äly VAIN siihen mihin logiikka ei taivu.** Jos asia voidaan ilmaista säännöksi, laskennaksi tai ajastukseksi — tee se koodilla/datalla, ei älykutsulla. Kuormavahti, Ristiriitamerkki ja kuittausjono ovat kaikki puhdasta laskentaa, ei yhtäkään älykutsua — pidä se niin.
2. **Älykutsut ERISSÄ ja TAPAHTUMISTA** (napin painallus, yöajo, uusi data) — EI KOSKAAN silmukassa, ei jokaisella näkymän avauksella, ei uudelleen samalle jo arvioidulle datalle. Jos ominaisuus voisi tarvita saman kutsun toistuvasti samalle riville/datalle, lisää käsitelty-merkintä (esim. oma sarake tai status-arvo) joka estää turhan uusintakutsun.
3. **Halvin malli joka riittää tehtävään** — ks. "Kustannusnäkökulma" alla, `ALY_MALLI`-arkkitehtuuri on juuri tätä varten.
4. **Usage-lokitus jokaisesta kutsusta pysyy** — ks. "Kustannusnäkökulma" alla, kustannuksen on oltava aina nähtävissä.

**Kysy tämä ENNEN kuin rakennat uuden älyominaisuuden:** *"Voiko tämän tehdä ilman älykutsua — ja jos ei, kuinka harvoin kutsu riittää?"* Täysi tausta ja Katrin kiteytykset: muistiinpanot.md, "Design-periaate: MAKSIMIAUTOMAATIO, MINIMIKUSTANNUS".

### Miten lisäät uuden älyominaisuuden

Kaksi tapaa, valitse sen mukaan kuinka erilainen uusi tarve on olemassa olevaan `/api/aly`-rajapintaan verrattuna:

**A) Sama endpoint, uusi prompti kutsuvasta koodista** (oletustapa, käytä tätä ellei ole hyvää syytä muuhun). `/api/aly` on tarkoituksella geneerinen — `{ prompt, max_tokens }` sisään, `{ text }` ulos. Uusi ominaisuus on tyypillisesti VAIN uusi `fetch('/api/aly', {...})`-kutsu `script.js`:ssä jollain toisella promptilla, ja UI joka näyttää vastauksen ehdotuksena (ks. periaate yllä).

**Oikea, toteutettu esimerkki: Laituri-avustaja (2026-07-12, ensimmäinen oikea älyominaisuus).** ✨-nappi Laiturin rivillä kysyy äly-putkelta ehdotuksen mihin muru kuuluisi. Rakenne kannattaa kopioida sellaisenaan uuteen "tapa A" -ominaisuuteen:

```js
// 1) Kohteet DYNAAMISESTI kutsuhetkellä — EI kovakoodattua listaa.
const { data: listat } = await db.from('lists').select('name');
const kohteet = (listat || []).map(l => l.name)
  .concat(['kalenteriin (päivämäärällinen asia)', 'hytin kortille', 'ei mikään näistä']);

// 2) Prompti pyytää AINA puhtaan JSON:in, ei muuta tekstiä.
const prompti = 'Tässä on lyhyt muistiinpano ...: "' + rivi.content + '"\n\n' +
  'Mahdolliset sijoituskohteet: ' + kohteet.map(k => '"' + k + '"').join(', ') + '.\n\n' +
  'Ehdota YKSI näistä. Vastaa VAIN JSON-muodossa, ei mitään muuta tekstiä, ei markdown-koodilohkoja:\n' +
  '{"ehdotus": "<kohteen nimi tarkalleen listalta>", "perustelu": "<max 10 sanaa suomeksi>"}';

// 3) Kutsu /api/aly TÄSMÄLLEEN kuten "Testaa äly" (Authorization: Bearer <access_token>).

// 4) JSON-jäsennys TURVALLISESTI — mallit lisäävät joskus ```-aitoja pyynnöstä
//    huolimatta, ja jäsennys voi epäonnistua. EI KOSKAAN kaadu, palauta null.
function jasennaAlyJSON(teksti) {
  if (!teksti) return null;
  const siivottu = teksti.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(siivottu); } catch (e) { return null; }
}

// 5) Näytä ehdotus kuittikorttina (EI koskaan automaattista tallennusta):
//    "→ <ehdotus> · <perustelu>" + [Sopii] [Ei]. "Sopii" avaa OLEMASSA OLEVAN
//    manuaalisen toiminnon (tässä: sijoitusdialogi) esitäytettynä ehdotuksella
//    — käyttäjä vahvistaa/muokkaa, äly ei kirjoita tietokantaan mitään suoraan.
//    "Ei" vain poistaa kortin.
```

Täysi toteutus: `script.js`:n `pyydaLaituriEhdotus()`/`piirraLaituriEhdotusKortti()`/`jasennaAlyJSON()`/`sijoitaLaituriRivi()` (ks. myös muistiinpanot.md "Laituri-avustaja"-osio). Poimi tästä kolme toistuvaa kaavaa aina kun rakennat uuden "tapa A" -ominaisuuden:
1. Kutsutaan VAIN eksplisiittisestä käyttäjän napin painalluksesta, EI koskaan automaattisesti/taustalla — ei yllätyskuluja.
2. JSON-vastaukset jäsennetään AINA `jasennaAlyJSON()`-tyylisellä turvallisella funktiolla, ei koskaan suoralla `JSON.parse()`:lla ilman try/catchia — malli voi palauttaa mitä tahansa.
3. Ehdotus esitetään AINA kuittikorttina jonka voi hyväksyä/hylätä, "hyväksy" käyttää AINA olemassa olevaa manuaalista toimintopolkua (esitäytettynä) sen sijaan että äly kirjoittaisi suoraan uuteen tauluun/kenttään.

**B) Uusi endpoint**, jos tarve on rakenteellisesti erilainen eikä taivu `{prompt, max_tokens}`-muotoon — esim.:
- **System-prompt-tuki** (kiinteä rooliohje jokaiselle kutsulle, esim. "Olet Sataman ystävällinen avustaja, vastaa aina suomeksi ja lyhyesti") — voisi lisätä `/api/aly`:iin uutena valinnaisena `system`-parametrina (Anthropic Messages APIn oma `system`-kenttä), EI vaadi uutta endpointtia.
- **Kuvatuki** (jääkaappikuva, kuitin kuvantulkinta) — Anthropic Messages API tukee kuvia `content`-kentän lohkoina (`{type: 'image', source: {type:'base64', media_type:'image/jpeg', data:'...'}}` VIEREKKÄIN tekstilohkon kanssa) — tämä muuttaisi `/api/aly`:n `prompt`-kentän rakennetta merkittävästi (yksinkertaisesta stringistä lohko-listaksi). Kun tähän tullaan: joko laajenna `/api/aly`:n sisäänmenoa hyväksymään VALINNAINEN `images`-taulukko (taaksepäinyhteensopiva, `prompt` pysyy stringinä oletuksena), tai jos rakenne alkaa tuntua liian erilaiselta, harkitse omaa `/api/aly-kuva.js`-endpointtia joka jakaa saman auth-/virhekaavan kopioimalla (ks. alla) mutta ei pakota kuvatonta polkua mutkikkaammaksi.

Kummassakin tapauksessa: **kopioi auth-kaava ja virheenkäsittely `api/aly.js`:stä sellaisenaan**, älä keksi niitä uudelleen.

**C) Ajastettu (cron-pohjainen) taustatyö**, jos ominaisuus EI reagoi käyttäjän omaan napin painallukseen vaan ajaa itsestään taustalla (esim. yöllinen haku) — TOTEUTETTU ensimmäisen kerran `api/aly-nightly.js`:ssä (E3-keskiporras, ks. muistiinpanot.md). Eri auth-malli kuin A/B, koska kutsuja on GitHub Actions -cron, ei kirjautunut selainkäyttäjä:
- **EI JWT-validointia** (`haeKayttajaId()`) — sen sijaan jaettu salaisuus URL:ssa (`?key=...`), sama kaava kuin `api/muistutukset-laheta.js`:ssä. Käytä olemassa olevaa `MUISTUTUKSET_CRON_SECRET`-salaisuutta uudelleen jos mahdollista (yksi salaisuus vähemmän Katrin ylläpidettäväksi) sen sijaan että loisit uuden joka kerta.
- **`SUPABASE_SERVICE_KEY` (service_role) suoraan REST-kutsuissa**, ei supabase-js-kirjastoa — sama `supabaseFetch()`-helperi-kaava kuin `muistutukset-laheta.js`:ssä, kopioi sieltä.
- **Kutsu SAMASTA GitHub Actions -ajastimesta** (`.github/workflows/muistutukset-cron.yml`, 5 min välein) lisäämällä uusi `curl`-askel — ÄLÄ luo uutta erillistä workflow-tiedostoa jollei ajastustarve genuinesti eroa (esim. eri aikaväli).
- **Jos ominaisuuden pitää tapahtua harvemmin kuin 5 min välein** (esim. kerran vrk:ssa): ÄLÄ yritä säätää GitHub Actionsin omaa cron-aikataulua tarkaksi (se on "parhaan yrityksen" periaatteella, ei tarkka). Sen sijaan tallenna oma "viimeksi ajettu" -tila `asetukset`-tauluun ja tarkista se endpointin ALUSSA (`if (tunnit_edellisestä < N) return`) — endpoint itse päättää onko sen aika toimia, ajastin vain "pingaa" usein. Tämä on kevyempi kuin oman cron-aikataulun rakentaminen ja toimii samalla ajastimella kuin kaikki muukin.
- **Kytkin datana on suositeltava** jos taustatyö voi joskus tarvita sammuttamisen käytöksen yllättäessä (`asetukset`-taulun rivi, esim. `'on'`/`'off'`) — ei UI:ta pakosti, Table Editor -hallinnointi riittää useimmiten.

### Auth-kaava (kopioi tämä aina)

```js
async function haeKayttajaId(userToken) {
  const vastaus = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + userToken },
  });
  if (!vastaus.ok) return null;
  const data = await vastaus.json();
  return data.id || null;
}
```
Sama malli kuin `api/push-test.js`:ssä — validoi kutsujan Supabase-istunnon `access_token` `/auth/v1/user`-endpointilla ennen kuin tehdään mitään maksullista. **Ilman tätä JOKAINEN uusi äly-endpoint on avoin kenelle tahansa netissä, joka polttaisi Anthropic-saldoa.** Ei poikkeuksia — jos joskus tarvitaan endpoint joka EI vaadi Satama-kirjautumista (esim. Siri Shortcut suoraan puhelimelta ilman selainistuntoa, kuten `api/add.js` käyttää `service_role`-avainta Siriä varten), se on eri, tietoinen päätös joka pitää perustella erikseen — ei oletus.

### Kustannusnäkökulma

- `max_tokens`: aina oletus + kova yläraja (`api/aly.js`: oletus 500, katto 2000) — kutsuja EI voi pyytää rajatonta vastausta.
- `ALY_MALLI`-ympäristömuuttuja: mallin vaihto (esim. halvempaan/nopeampaan malliin luokittelutehtäville) on Vercel-kentän muutos, ei koodimuutos. **Harkitse halvempaa/nopeampaa mallia kevyille, toistuville tehtäville** (esim. Laituri-rivin luokittelu — lyhyt prompti, lyhyt vastaus, ei vaadi raskainta mallia) — vaihda vain kyseisen kutsun `ALY_MALLI`-arvoa jos/kun useampi malli pitää olla käytössä rinnakkain (silloin tarvitaan oma ympäristömuuttuja per käyttötarkoitus, esim. `ALY_MALLI_LUOKITTELU`).
- **Ajantasainen mallilista ja hinnoittelu:** docs.claude.com → Models. Tarkista aina ennen kuin vaihdat mallia tuotannossa.
- Kevyt kustannusseuranta: `console.log('[aly', ...)` jokaisesta kutsusta (user_id, malli, input/output-tokenit, aika) — luettavissa Vercelin Logs-välilehdeltä. EI omaa tietokantataulua vielä (olemassa oleva `events`-taulu on rakennettu listat/tuotteet-toiminnoille, ei sopinut sellaisenaan) — jos kutsumäärä kasvaa niin että lokien selaaminen käsin ei riitä, harkitse silloin omaa `aly_kaytto`-taulua.

### Virheenkäsittelymalli

`api/aly.js` kääntää Anthropic API:n virhetyypit (`data.error.type`) selkokielisiksi suomenkielisiksi viesteiksi ennen kuin ne palautetaan kutsujalle:
- `authentication_error` → "ANTHROPIC_API_KEY on virheellinen tai vanhentunut"
- `rate_limit_error` → "Liikaa pyyntöjä juuri nyt, yritä hetken päästä uudelleen"
- `overloaded_error` → "Claude API on ruuhkautunut, yritä hetken päästä uudelleen"
- `invalid_request_error` jossa viesti mainitsee mallin → "Mallitunniste ei kelvannut..." (ohjaa tarkistamaan `ALY_MALLI`)
- Muu → Anthropicin oma `error.message` sellaisenaan, tai geneerinen "Äly-pyyntö epäonnistui" jos mitään ei löydy

**Kopioi tämä kaava uusiin endpointteihin** — käyttäjä ei koskaan näe raakaa HTTP-statuskoodia tai Anthropicin sisäistä JSON-rakennetta, aina selkokielinen suomenkielinen syy.

### Testaus

"Testaa äly" -nappi Asetukset → Sovellus-osiossa lähettää kiinteän testipromptin ja näyttää vastauksen napin alla. Jos tämä toimii, koko putki (kirjautuminen → JWT-validointi → Anthropic-kutsu → vastaus takaisin puhelimeen) on todistettu — uusi ominaisuus voi luottaa siihen ilman uutta putkitestiä.

---

## GitHub Actions -ajastin: mihin se vaikuttaa ja miten se voi hiljentyä

Muistutukset (`api/muistutukset-laheta.js`), kalenterisynkka (`api/caldav-sync.js`) ja E3:n yöajo (`api/aly-nightly.js`) EIVÄT käynnisty itsestään Vercel Hobby -tasolla (ei omaa cron-tukea) — kaikki kolme riippuivat alunperin kokonaan `.github/workflows/muistutukset-cron.yml`:stä, jonka piti herätä 5 minuutin välein.

**Jos muistutukset tai kalenterisynkka lakkaavat toimimasta yhtäkkiä ilman koodimuutosta, tarkista ENSIN GitHub-repon Actions-välilehti ennen kuin epäilet koodivikaa.** GitHub pysäyttää ajastetut (`schedule`-tyyppiset) workflowt automaattisesti jos repoon ei ole tullut yhtään committia noin 60 päivään — tästä lähtee sähköposti-ilmoitus repon omistajalle, ja Actions-välilehdellä workflow-listan vieressä näkyy silloin "Enable"-nappi joka käynnistää sen uudelleen yhdellä painalluksella. Tämä ei ole koskaan lähikuukausien huoli Copilot-aikana (committeja tulee luonnostaan jatkuvasta kehityksestä), mutta jos projektiin joskus tulee pitkä hiljainen jakso, tämä on ensimmäinen paikka tarkistaa.

### BUGIKORJAUS/OPPI (2026-07-15): "GitHub Actions schedule ei ole kello vaan arpa"

Todistettu 2026-07-14/15 illan diagnoosissa ("Ajastetut muistutukset eivät tule perille" -bugi, ks. muistiinpanot.md): `cron: '*/5 * * * *'` EI tarkoita että workflow todella herää 5 min välein. GitHub Actionsin `schedule`-triggerit ovat matalan prioriteetin jono — havaitut toteuma-aikaleimat olivat 60–180 min välein, ei 5 min. Tämä EI ollut koodivika (muistutus tallentui, cron poimi sen, push lähti — kaikki todistettu toimivaksi kun ajo vihdoin pyörähti), vain väärä LAUKAISIJA aikakriittiselle työlle.

**Korjaus: ulkoinen cron-palvelu (cron-job.org) ensisijaiseksi laukaisijaksi, GitHub Actions jää varalaukaisijaksi (ei poisteta — ilmainen, ei haittaa, molemmat kutsuvat samoja idempotentteja endpointteja turvallisesti päällekkäinkin).** Katrin oma asennusaskel (vaatii ulkoisen tilin, ei tehtävissä koodista) — jo tehty ja vahvistettu (ks. muistiinpanot.md 2026-07-15).

**Yleistettävä oppi:** jos rakennat JATKOSSA jotain aikakriittistä (esim. Viikkokatsaus, Horisontti-rytmioppija) tämän saman `muistutukset-cron.yml`-workflow'n varaan, MUISTA että sen toteuma-aikataulu on suuntaa-antava, ei taattu — 20h+ -välein tapahtuvalle työlle (kuten E3:n yöajo) tämä on lähes huomaamaton, mutta minuuttitason tarkkuutta vaativalle (muistutukset) se on merkittävä riski jota ei näy testauksessa ellei nimenomaan mittaa toteuma-aikaleimoja.

---

## Project Memory and Documentation Workflow

### Documentation Roles

Use the existing documentation structure as follows:

- README.md = project overview, goals, user value and onboarding.
- KONSEPTIKIRJA.md = source of truth for product vision, architecture principles, design decisions and long-term direction.
- COPILOT.md = source of truth for development workflow, coding conventions and agent behavior.
- muistiinpanot.md = project working memory containing recent work, decisions, known issues, lessons learned and next steps.
- BACKUP.md = backup and recovery procedures.

Do not create alternative documentation files that duplicate these responsibilities unless explicitly requested.

### Before Starting Work

Before making changes:

1. Read muistiinpanot.md to understand:
   - recent work
   - current state
   - open issues
   - planned next steps

2. If additional context is needed, read KONSEPTIKIRJA.md.

3. Follow all rules and conventions defined in COPILOT.md.

Do not generate project summaries unless explicitly requested.

### During Development

- Follow the architecture and design direction defined in KONSEPTIKIRJA.md.
- Prefer extending existing solutions over introducing new patterns or frameworks.
- Avoid unnecessary refactoring.
- Keep implementations simple and maintainable.
- Preserve existing functionality unless the task specifically requires changes.

### After Completing Work

Before creating a commit:

Update muistiinpanot.md with:

- completed work
- important decisions
- architectural changes
- discovered bugs or risks
- lessons learned
- unresolved issues
- recommended next steps

Keep entries concise, practical and chronological.

Do not duplicate information already documented in KONSEPTIKIRJA.md or COPILOT.md.

### Commits

Documentation updates should be included in the same commit as the related code changes whenever practical.

Commit checklist:

1. Update muistiinpanot.md with completed work, important decisions, next steps and risks.
2. If the change affects data, migrations, user-visible behavior or architecture, review BACKUP.md and add a backup reminder in muistiinpanot.md when relevant.
3. Keep documentation concise and practical; do not duplicate information already documented in KONSEPTIKIRJA.md or COPILOT.md.
4. Before finishing, confirm that the current work state is understandable from the latest notes.

When work is complete:

- provide a short summary of what was done
- identify any remaining issues
- suggest logical next tasks

---

## Repon kokonaiskuva ja lukemisjärjestys (kirjattu 2026-07-20, Claude Coden ja Copilotin vaihdon kynnyksellä)

Tämä osio on eri asia kuin kaikki yllä oleva: yllä on **kertyneitä sääntöjä ja oppeja** (luettava kokonaan, mutta ei tarvitse ymmärtää koko koodikantaa lukeakseen niitä). Tämä osio on **kartta koko repoon** — kirjoitettu siksi että Copilot ei näe koko repoa kerralla eikä sillä ole Claude Coden keskusteluhistoriaa. Lue tämä osio ENSIN jos tämä on ensimmäinen kerta tässä projektissa.

### Projektin yleiskuva

**Mikä Satama on:** perheen (Katri + Juha) yhteinen arjenhallintasovellus — jaetut listat, yhteinen kalenteri (peilattu iCloudista), push-muistutukset, henkilökohtainen "Laituri" (ajatusten talteenottopaikka jota pieni tekoälyavustaja lajittelee), henkilökohtainen "Hytti" (yksityinen työtila/opiskelukalenteri), ja kasvava äly-putki joka EHDOTTAA muttei koskaan kirjoita mitään ilman ihmisen hyväksyntää. Ks. README.md kokonaiskuvan tarina-versiolle ja KONSEPTIKIRJA.md OSA 1:n periaatteille (vilkaisuarvo, maksimiautomaatio/minimikustannus, kolmiporras, turvainvariantti — nämä periaatteet OHJAAVAT jokaista suunnittelupäätöstä tässä repossa, lue ne ennen kuin lisäät mitään uutta).

**Teknologiapino ja miksi:**
- **Vanilla HTML/CSS/JS** (`index.html` + `script.js` + `style.css`) — EI frameworkkia (ei Reactia/Vueta), EI bundleria, EI build-askelta. Yksi tiedosto per kerros, ladataan suoraan selaimeen `<script src="script.js">`:lla. Valinta on tietoinen: projekti alkoi kolme viikkoa sitten ilman aiempaa web-kehityskokemusta (ks. README.md "Matka: mistä lähdin") — vanilla-JS pitää koko pinon ymmärrettävänä ilman rakennusputken tai frameworkin opetteluakin.
- **Supabase** — Postgres-tietokanta + autentikointi (Google OAuth) + Realtime (websocket-pohjainen live-synkka) + Row Level Security (RLS, "portsari" joka päättää rivikohtaisesti kuka näkee/kirjoittaa mitä). Yhteys avataan `script.js`:n alussa (`createClient(...)`), projektin URL ja julkinen **anon key** ovat suoraan koodissa (tämä on TARKOITUKSELLISTA — anon-avain on suunniteltu julkiseksi, RLS on se mikä oikeasti suojaa dataa, ei avaimen salaisuus).
- **Vercel** — hostaa staattiset tiedostot JA `api/`-kansion serverless-funktiot (Node.js). **Ei `vercel.json`-tiedostoa** — projekti käyttää Vercelin zero-config-tunnistusta (staattinen juuri + `api/*.js` → automaattisesti serverless-funktioita). Ei build-komentoa (`package.json`:n `dependencies` ovat VAIN `api/`-funktioiden Node-riippuvuuksia — `tsdav`, `ical.js`, `web-push` — selainpuoli ei tarvitse `npm install`:ia ollenkaan).
- **GitHub** — koodi + `.github/workflows/muistutukset-cron.yml` (varalaukaisijana ulkoiselle cron-job.org-palvelulle, ks. "GitHub Actions -ajastin" -osio yllä).

**Deploy-osoite:** `https://kauppalista-nine.vercel.app` (ks. `.github/workflows/muistutukset-cron.yml`, jossa tämä osoite näkyy cron-kutsujen kohteena). **Miten deploy tapahtuu:** Vercel on kytketty suoraan GitHub-repoon — `git push` `main`-haaraan päivittää tuotannon automaattisesti, ei erillistä deploy-komentoa. PWA-puolella tämä tarkoittaa: aina kun `index.html`/`script.js`/`style.css` muuttuu, **`sw.js`:n `CACHE`-vakio pitää nostaa** (esim. `kauppalista-v86` → `v87`), muuten käyttäjän puhelin näyttää vanhaa cachettua versiota eikä uusi koodi tule voimaan itsestään (ks. `sw.js`, cache-first-strategia appitiedostoille).

### Lukemisjärjestys

Nopein reitti kokonaiskuvaan — lue tässä järjestyksessä:

1. **README.md** — mikä Satama on ja miksi, ihmisen kielellä (5 min).
2. **KONSEPTIKIRJA.md OSA 1–3** — periaatteet, käyttäjät, tiivis kartta jo rakennetuista kokonaisuuksista. Tämä on paras "mitä täällä ylipäätään on" -yleiskatsaus, tiiviimpi kuin muistiinpanot.md.
3. **Tämä tiedosto (COPILOT.md) kokonaan** — talon säännöt joita jokainen uusi rivi koodia noudattaa (kirjoituspolkujen 4 tarkistusta, testirivikäytäntö, koodikielisääntö, äly-putken periaatteet).
4. **`index.html`** — kaikki näkymät ("view") ovat SAMASSA tiedostossa, päällekkäin, `display:none`/`display:block`-vaihdolla näytettynä (ei reititintä, ei useaa HTML-sivua). Etsi `id="...-view"` -divit saadaksesi täyden näkymälistan: `login-view`, `home-view`, `app-view` (yksittäinen lista, esim. Kauppalista), `muistilaput-view`, `varasto-view`, `teema-view`, `vahdittu-view` (kaksi viimeistä lisätty 2026-07-21, ks. KONSEPTIKIRJA.md 4.10b), `kalenteri-view`, `hytti-view`, `hytti-kortti-view`, `opinto-kurssi-view`, `opinto-kartta-view` (Opintopolku, ks. KONSEPTIKIRJA.md 4.11), `asetukset-view`, `laituri-view`. Lisäksi joukko `dialog-overlay`-luokan modaaleja (muistutuspaneeli, ristiriitakuittaus, hytin arkisto, listan asetukset, luote-katselmus, ym.) — nekin ovat aina DOM:issa, vain piilossa kunnes avataan.
5. **`script.js`** (n. 7400 riviä, kasvaa — tarkista `wc -l script.js` jos tarkka luku merkitsee) — EI moduulitiedostoja, kaikki yhdessä tiedostossa jaoteltuna `// === OTSIKKO ===` -bannerikommentein (`grep -n "^// ==="` löytää ne kaikki nopeasti, järjestys EI ole aina kronologinen — uusia osioita on lisätty väliin sinne minne aihe loogisesti kuuluu). Todellinen järjestys (tarkista aina `grep -n "^// ==="` jos tämä ehtii vanhentua): tiedoston ALKU (Supabase-yhteys, näkymänvaihtofunktiot `showXView()`, ankkurointi/delegointi-logiikka, ydin-kauppalistatoiminnot `poistaTuote()`/`paivitaNaytto()`/`deleteList()` — vanhinta koodia, ei omaa otsikkoaan) → `// === KESKUSTELUTEEMA ===` → `// === VAHDITTU LEPO ===` → `// === OPINTOPOLKU VAIHE 1 ===` → `// === OPINTOPOLKU VAIHE 2: KOLMEN VOIMAN MOOTTORI ===` (nämä neljä lisätty 2026-07-21, KONSEPTIKIRJA.md 4.10b/4.11) → `// === KALENTERI ===` → `// === YLEISET ASETUKSET ===` → `// === PÄÄLLEKKÄISYYSMERKKI ===` → `// === KUUKAUSINÄKYMÄ ===` → `// === KALENTERIN KUITTAUSJONO ===` → `// === OMA HYTTI ===` → `// === HUOMIOPALLURAT ===` → `// === LAITURIN LUOTE ===` (2026-07-21) → `// === OFFLINE-JONO ===` → `// === RAAHAUS ===` → `// === MUISTUTUSPANEELIN NAPIT JA RULLAT ===` → `// === PUSH-ILMOITUKSET ===` → `// === MUISTUTUKSET ===` → `// === ASETUKSET: TILI + SOVELLUS ===` → `// === AUTH ===` (tiedoston loppu — kirjautumisen kuuntelija joka päättää mikä view näytetään).
6. **`style.css`** (n. 2750 riviä) — yksi tiedosto, ei esikäsittelijää (ei Sass/Less). CSS custom properties (`:root { --ground; --text; --accent; ... }`) määrittelevät koko väripaletin, `@media (prefers-color-scheme: dark)` toistaa saman listan tumman teeman arvoilla — EI JS-pohjaista teemanvaihtoa, selain/käyttöjärjestelmä päättää.
7. **`api/*.js`** — kahdeksan itsenäistä serverless-funktiota, ei jaettuja moduuleja (yksi tarkoituksellinen poikkeus, ks. `api/_lib/aly-classify.js` alla). Lue `api/aly.js` ensin (lyhyin, selkein esimerkki auth-kaavasta), sitten muut tarpeen mukaan (ks. "Moduulit yksitellen" alla per-endpoint kuvaukset).
8. **`sql/*.sql`** (86 migraatiota tätä kirjoitettaessa 2026-07-21, numero kasvaa jatkuvasti — `ls sql/ | tail` näyttää tuoreimmat) — ÄLÄ lue kaikkia läpi, ne ovat historiaa. Sen sijaan: (a) uusimmat 5-10 kertovat mitä on VIIMEKSI rakennettu, (b) `grep -l "create table X"` löytää minkä migraation joku taulu syntyi jos tarvitset sen tarkan skeeman. Taulun `tuotteet` (Kauppalistan rivit) loi jokin AIKAISEMPI, migraatiojärjestelmän ulkopuolinen käsinluonti — se ei löydy mistään `sql/*.sql`-tiedostosta, tarkista sen skeema suoraan Supabasen Table Editorista.
9. **muistiinpanot.md** (n. 3200 riviä) — LUE VASTA TARVITTAESSA, ei kertalukuun. Tämä on projektin täysi historia, päätökset ja "Testauslista — kesken" -osio ("mitä pitää vielä tutkia/korjata"). Käytä sitä hakuteoksena (`grep` otsikon/aiheen mukaan), älä yritä lukea kokonaan — se on kirjoitettu kronologisena päiväkirjana, ei viitteenä.
10. **KONSEPTIKIRJA.md OSA 4** — kun aloitat UUDEN, rakentamattoman ominaisuuden: jokainen konsepti tässä on täysi speksi (tarve, torjutut ratkaisut, rakennusjärjestys) valmiiksi mietittynä, ei tarvitse suunnitella tyhjästä.

### Arkkitehtuuri

**Ei reititintä, ei komponenttikehystä.** `index.html` sisältää KAIKKI näkymät kerralla DOM:issa; `piilotaKaikkiNakymat()` + `showXView()`-funktiot (script.js:n alussa) vaihtavat mikä on `display:block` vs `display:none`. Navigointi on siis puhdasta DOM-manipulaatiota, ei URL-tilaa (selaimen "takaisin"-nappi ei toimi sovelluksen sisäisenä navigointina — tietoinen, ei rikki).

**Tila (state) elää kolmessa kerroksessa:**
1. **Supabase-tietokanta on ainoa pysyvä totuus.** Ei omaa client-puolen tietovarastoa (ei Reduxia/Piniaa) — jokainen näkymä LATAA oman datansa suoraan Supabasesta avattaessa (`lataaLista()`, `lataaKalenteri()`, `lataaAnkkurit()`, `lataaHyttiRivit()` jne.), muokkaa DOM:ia suoraan tuloksen perusteella.
2. **Muutamat pienet, kertaluvun globaalit muuttujat** (esim. `currentList`, `currentUserId`, `kalenteriTila`, `muistutusKohde`, `muistuksetKartta`) pitävät kirjaa "missä ollaan nyt" -tilasta yhden näkymän sisällä — EI kertaluontoista sovellustilaa (esim. `currentUserId` asetetaan kirjautumisen yhteydessä ja pysyy koko istunnon).
3. **Realtime-kanavat** (`db.channel(...)`) pitävät auki olevan näkymän tuoreena ilman käsinpäivitystä — jokainen kanava kuuntelee TIETTYÄ taulua/tapahtumaa ja kutsuu vastaavaa `lataaX()`-funktiota kun jotain muuttuu (ks. `script.js`:n loppupuoli, `realtimeChannel`/`laituriRealtimeChannel`/`kalenteriPalluraChannel`). Vaatii Replication-julkaisun päälle kyseiselle taululle Supabasen puolella (ks. `sql/034_realtime_huomiopallurat.sql` mallina uudelle taululle).

**Supabase-yhteys:** `script.js`:n aivan ensimmäiset rivit (`createClient(SUPABASE_URL, ANON_KEY)`) — `db`-muuttuja on globaali, jokainen näkymäfunktio kutsuu `db.from('taulu').select/insert/update/delete(...)`. `api/`-funktiot EIVÄT käytä tätä samaa client-kirjastoa — ne tekevät raakoja `fetch()`-kutsuja Supabasen REST-rajapintaan (`/rest/v1/...`) `SUPABASE_SERVICE_KEY`:llä (service_role, ohittaa RLS:n), koska ne ajavat palvelimella ilman käyttäjän omaa selainistuntoa.

**Autentikointi:** Google OAuth Supabase Authin kautta (`db.auth.signInWithOAuth({provider:'google'})`, ks. `// === AUTH ===` -osio `script.js`:n lopussa). Kirjautumisen jälkeen `db.auth.getSession()` antaa käyttäjän JWT:n, jota selainpuoli käyttää automaattisesti jokaisessa `db.from(...)`-kutsussa (supabase-js hoitaa tämän itse) — RLS-policyt (`sql/003_row_level_security.sql` ja myöhemmät korjaukset/laajennukset) päättävät rivitasolla mitä käyttäjä näkee/muokkaa `auth.uid()`:n perusteella. `api/`-funktiot jotka VAATIVAT kirjautuneen käyttäjän identiteetin (esim. `api/aly.js`, `api/push-test.js`) validoivat kutsujan lähettämän `access_token`:in `/auth/v1/user`-endpointilla (ks. "Äly-putki"-osion "Auth-kaava" yllä) — ne EIVÄT luota client-puolen väitteeseen kuka käyttäjä on.

**Kaksi käyttäjää, ei rooleja:** koko sovellus on rakennettu kahdelle nimetylle käyttäjälle (Katri + Juha) — ei yleiskäyttöistä moniperhe-/monikäyttäjätukea, ei käyttäjähallintaa. `henkiloNimi()`/`henkiloAllatiivi()`-funktiot (script.js) ja `HENKILO_ALLATIIVI`-taulukko kääntävät `user_id`:n ihmisluettavaksi nimeksi taivutettuna.

### Moduulit yksitellen

**Listat (Kauppalista / Muistilaput / Varasto / Keskusteluteema / Vahdittu lepo)**
- Mitä tekee: jaettuja tai henkilökohtaisia tarkistuslistoja (`lists`-taulun rivi = yksi lista, `tuotteet`-taulun rivi = yksi listan tuote/rivi). Kauppalista on kotinäkymän oma kiinteä pikakuvake, Muistilaput/Varasto ovat käyttäjän itse luomia listoja kahdessa eri "kategoriassa" (aktiivinen vs. "nukkuva" varasto, ks. KONSEPTIKIRJA.md periaate 7). **2026-07-21 lisätty (KONSEPTIKIRJA.md 4.10b, sql/081) kaksi uutta `lists.list_type`-arvoa Varaston sisään:** `'teema'` (Keskusteluteema — jaettu, murun voi siirtää tänne säikeineen `laituri.teema_id`:n kautta, `sovittu_linja`/`sovittu_linja_pvm`/`priority`-sarakkeet) ja `'vahdittu'` (Vahdittu lepo — `vahdittu_raja_paivia`: rivi nousee ankkuriehdokkaaksi jos kuittaamatta X päivän jälkeen, ks. `api/muistutukset-laheta.js`:n `tarkistaVahdittuLepo()`). **HUOM 2026-07-21 konsistenssi-auditointi: `sql/081` sisälsi bugin (`teema_id bigint references lists(id)` — pitäisi olla `uuid`, koska `lists.id` on uuid) joka olisi kaatanut koko migraation transaktiona; korjattu paikoilleen ennen kuin migraatiota oli ajettu Supabaseen. Jos luet tämän ennen kuin migraatio on ajettu: se pitäisi nyt olla ajokelpoinen, mutta EI ole vielä varmistettu ajamalla oikeaa Supabasea vasten — aja ja tarkista sql/082:n testirivit ensimmäisenä.**
- Tiedostot: `index.html` (`app-view`, `muistilaput-view`, `varasto-view`, `teema-view`, `vahdittu-view`), `script.js` (`lataaLista()`, `paivitaNaytto()`, `poistaTuote()`, `deleteList()`, raahaus-osio raahausjärjestykselle, `// === KESKUSTELUTEEMA ===`, `// === VAHDITTU LEPO ===`).
- Taulut: `tuotteet` (id, list_id, nimi, tehty, sort_order, is_header), `lists` (id, name, kategoria/varasto-lippu, jaettu-lippu, `list_type`, `sovittu_linja`, `sovittu_linja_pvm`, `priority`, `vahdittu_raja_paivia`), `list_members`, `laituri.teema_id` (murun linkki teemaan).
- Tunnettu keskeneräisyys: listan kokonaispoisto ei siivoa sen riveihin liitettyjä `muistutukset`-rivejä (jäisi orpoja, harvinainen reunatapaus, ei ratkaistu — ks. muistiinpanot.md "Muistutukset"-osio). Teema/vahdittu-lepo-ominaisuudet EIVÄT ole testattu oikealla cron-ajolla/kahdella tilillä ajan yli (ks. KONSEPTIKIRJA.md 4.10b).

**Kalenteri**
- Mitä tekee: perheen yhteinen ja henkilökohtainen kalenterinäkymä (päivä/viikko/kuukausi), peilattu iCloudista/ICS-syötteistä yksisuuntaisesti ("yksi totuus, kaksi ikkunaa" -arkkitehtuuri). Toisen lisäämät tapahtumat odottavat kuittausta (ei estä näkymistä, vain merkitsee "uusi"). Ristiriitapaketti tunnistaa päällekkäisyydet kolmiportaisella vakavuudella ja tarjoaa "Ehdota keskustelua"-toiminnon riidan sijaan.
- Tiedostot: `index.html` (`kalenteri-view` + `kalenteri-kuittaus-overlay` + `ristiriita-overlay`), `script.js` (`// === KALENTERI ===`, `// === PÄÄLLEKKÄISYYSMERKKI ===`, `// === KUUKAUSINÄKYMÄ ===`, `// === KALENTERIN KUITTAUSJONO ===`), `api/caldav-sync.js` (varsinainen synkka), `api/ics.js` (kalenterisilta-vientinappi).
- Taulut: `kalenteri_tapahtumat`, `kalenteri_kuittaukset`, `kalenteri_syotteet` (syötteiden asetukset, uusi syöte lisätään TÄNNE Table Editorista, ei koodiin), `kalenteri_tekijat`, `kalenteri_ristiriita_kuittaukset`. `kalenteri_odottavat` on VANHENTUNUT (vanha hyväksyntäjono-arkkitehtuuri, taulu on yhä olemassa mutta käytöstä poistunut — älä kirjoita siihen).
- Tunnettu keskeneräisyys: kuukausinäkymän vaihto hidas (~3s, syy: verkkohaku ilman välimuistia, hyväksytty toistaiseksi) · värimaailma jakaa mielipiteitä (Copilot-hionta) · monipäiväisen tapahtuman pikanapit laskevat ajan alkuperäisestä alkupäivästä eivätkä näytettävästä (harvinainen reunatapaus).

**Muistutukset**
- Mitä tekee: henkilökohtainen push-muistutus listan riville/kalenteritapahtumalle/ankkurille — neljä lajia: kertaluontoinen, valmistaudu (toinen aikaisempi tönäisy), sinnikäs ("tärähdyssarja" — tiheä pushisarja ennen kohdehetkeä, kuittaus tappaa sarjan), toistuva (yksi ikuinen sääntö, itsenäisesti etenevä, ei kuittausta). Ks. muistiinpanot.md "Muistutukset"/"Valmistautumisvaihe"/"Sinnikäs muistutus"/"Toistuva muistutus" -osiot täydelle tekniselle kuvaukselle jokaisesta.
- Tiedostot: `index.html` (`muistutus-overlay`), `script.js` (`// === MUISTUTUSPANEELIN NAPIT JA RULLAT ===`, `// === MUISTUTUKSET ===`), `api/muistutukset-laheta.js` (cron-lähetys, kaikkien neljän lajin atominen claim-logiikka).
- Taulut: `muistutukset` (yksi taulu kaikille neljälle lajille, kasvavalla sarakejoukolla — `persistent`/`window_minutes`/`frequency`/`sent_count`/`acked_at` sinnikkäälle, `recurring`/`recurrence_type`/`weekdays`/`interval_n`/`interval_unit`/`time_of_day`/`ends_at` toistuvalle, `parent_id` valmistaudulle).
- Tunnettu keskeneräisyys: "kuittaa suoraan push-ilmoituksesta" (natiivi action-nappi) ei ole rakennettu (vaatisi Service Workerin oman autentikoinnin) · toistuva+sinnikäs-yhdistelmä ei ole tuettu (UI piilottaa toisen kun toinen on päällä) · EI mitään neljästä lajista ole testattu oikealla ~5 min cron-ajolla/oikealla laitteella pidemmän ajan yli, vain Node-simulaatioilla.

**Laituri**
- Mitä tekee: nopea ajatusten/murujen talteenottopaikka ("heitä tänne ennen kuin unohtuu") — hakutoiminto, arkisto (kokoontaitettava, ei poisto), ja äly-lajittelu joka ehdottaa (EI koskaan päätä itse) mihin muru kuuluisi: ankkuriehdokas ("hetki"/"ikkuna"), kauppatavara-ehdotus, tai delegointi toiselle henkilölle laukaisusanalla ("Juhalle: ...").
- Tiedostot: `index.html` (`laituri-view`), `script.js` (Laituri-osio ydintiedoston keskivaiheilla — `pyydaLaituriEhdotus()`, `piirraLaituriEhdotusKortti()`, `piirraKauppaEhdotusKortti()`, `piirraHetkiSiltaKortti()`, `ehdotaSisaltoToiselle()`, `tunnistaEhdotusLaukaisu()`), `api/laituri-add.js` (Siri-pikakomentoreitti + välitön äly-luokittelu), `api/aly-nightly.js` (yöajo, sama luokittelu erässä), `api/_lib/aly-classify.js` (JAETTU prompti/normalisointi näiden kahden API-reitin välillä — repon AINOA jaettu moduuli, ks. sen oma yläkommentti miksi juuri tämä on poikkeus).
- Taulut: `laituri`, `laituri_nahty`, `aly_log`, `aly_log_seen`, `aly_evaluated`.
- Tunnettu keskeneräisyys: `api/laituri-add.js`:n `henkilo`-parametrin todennus on tietoisesti auki (ei salaisuutta/tokenia — päätös perusteltu tiedoston omassa yläkommentissa) · **PÄIVITYS 2026-07-21: KONSEPTIKIRJA.md 4.10 kerrokset 1-2 ON NYT rakennettu** (`// === LAITURIN LUOTE ===`, script.js — pehmeä oletusikkuna ajattomille tehtäville + viikoittainen "luode"-katselmus, laajennettu kattamaan myös teemat/säikeet, ks. KONSEPTIKIRJA.md 4.10b) — EI kuitenkaan testattu oikealla ajalla/cronilla/kahdella tilillä, ja riippuu `sql/081`:n ajamisesta (ks. Listat-osio yllä sen tunnetusta bugista, joka on korjattu koodissa mutta ei vielä ajettu).

**Ankkurit**
- Mitä tekee: kotinäkymän "päivän kärjet" — henkilökohtaiset, jokaisella on "koti" (ei kelluvia). Äly voi ehdottaa ankkuriehdokkaita Laiturin muruista (ks. yllä); ehdokas voidaan hyväksyä omaksi, siirtää (⏭) tai hylätä. Toiselle voi ehdottaa ankkuria valmiin toiminnon kautta (ei enää erillistä "kenelle"-kohdevalintaa etusivulla, poistettu 2026-07-19 design-kritiikin jälkeen).
- Tiedostot: `index.html` (`home-view`:n `ankkurit-list`/`anchor-candidates-list`), `script.js` (`vaihdaAnkkurointiYleinen()`, `paivitaAnkkuroidutAvaimet()`, koodin alkuosassa).
- Taulut: `ankkurit` (source: `'manuaalinen'`/`'aly'`/`'ehdotus'`, `is_candidate`, `event_date`/`event_time`, `visible_from`).

**Oma Hytti**
- Mitä tekee: jokaisen OMA yksityinen työtila (RLS-suojattu molempiin suuntiin, todistettu auditoinnissa) — kortit (jatkuva/päättyvä), tehtävät jotka kokoontuvat kortilta ylös, 7 päivän kalenteri-ikkuna, ICS-syötteet opiskelukalentereille (Lukkarikone/Itslearning).
- Tiedostot: `index.html` (`hytti-view`, `hytti-kortti-view`), `script.js` (`// === OMA HYTTI ===`).
- Taulut: `hytti_kortit`, `hytti_rivit`, `hytti_omistajat`, jaettu käyttö `kalenteri_syotteet`-taulusta (`scope='hytti'`).

**Opintopolku** (2026-07-21, ks. KONSEPTIKIRJA.md 4.11 — puuttui tästä tiedostosta kokonaan ennen 2026-07-21 konsistenssi-auditointia, lisätty tässä)
- Mitä tekee: Katrin yksityinen opiskelusuunnitelmamoduuli Hytin sisällä. Kurssi → aiheet (PACER-vaihetila `priming`/`encoding`/`retrieval`/`reference`/`yllapito`) → deadlinet kurssi- tai aihetasolla → kevyt materiaali-tekstikenttä kurssilla. "Kolmen voiman moottori" (puhdas laskenta, EI älykutsua) punnitsee deadlinea + PACER-järjestystä + Kuormavahtia ja tarjoaa 1-2 päivän askelta ohjaavassa ikkunassa Hytin yläosassa (`#opinto-tanaan-osio`), tallennettu idempotentisti (`unique(owner_id, aihe_id, pvm)`). "Tehty" etenee PACERia ja ajastaa spaced repetitionin (1/3/7/21pv → pysyvä 60pv ylläpitosykli). `reference`-vaihe on TIETOISESTI moottorin ulkopuolella (vain käsin asetettava). Kokonaiskartta-näkymä on puhtaasti luettava (ei klikattavia toimintoja).
- Tiedostot: `index.html` (`opinto-kurssi-view`, `opinto-kartta-view`), `script.js` (`// === OPINTOPOLKU VAIHE 1 ===`, `// === OPINTOPOLKU VAIHE 2: KOLMEN VOIMAN MOOTTORI ===`).
- Taulut: `opinto_kurssit`, `opinto_aiheet`, `opinto_deadlinet`, `opinto_paivan_askeleet` — kaikki owner_id-RLS samalla kaavalla kuin `hytti_kortit`.
- Tunnettu keskeneräisyys: ei "aikaikkuna/vuorokaudenaika"-metodiprofiilia (vain staattiset Sung-vaiheohjeet) · moottorin todellinen tarjonta usealla oikealla kurssilla EI ole testattu arjessa, vain Node-logiikkatestein · ei repoon commitoitua Node-testitiedostoa näille logiikkatesteille (ajettu kertaluontoisesti, ei toistettavissa suoraan reposta).

**Asetukset**
- Mitä tekee: kokoelma HARVOIN kosketettavia asetuksia — tili/uloskirjautuminen, push-lupa+testi, vinkit (dataohjattu), sovellusversio+päivitys, kalenterin manuaalisynkka, äly-testi, Kuormavahti-raja, "Mitä äly on tehnyt" -loki.
- Tiedostot: `index.html` (`asetukset-view`), `script.js` (`// === ASETUKSET: TILI + SOVELLUS ===`).
- Taulut: `asetukset` (yleinen avain-arvo-taulu, käytetään myös moduulien välisenä "kytkeytynä tilana", esim. `aly_yoajo`, `aly_yoajo_last_run`, `hetki_ennakkopaivat`, `kuormaraja`), `ohjeet` (Vinkit-osion sisältö), `push_tilaukset`.

**Äly-putki**
- Ks. tämän tiedoston OMA "Äly-putki"-osio yllä täydelle kuvaukselle — sitä ei toisteta tässä. Lyhyesti: `api/aly.js` on geneerinen `{prompt}→{text}`-endpoint jonka päälle jokainen älyominaisuus (Laituri-lajittelu, tuleva Siri-tulkinta) rakentuu joko uudella promptilla samaan endpointiin tai kokonaan uudella endpointilla.

### Konventiot ja tyyli

- **Koodikieli:** uusi koodi englanniksi (nimet + kommentit), olemassa oleva suomenkielinen koodi jätetään koskemattomaksi ellei sitä muutenkin kirjoiteta uusiksi — ks. tämän tiedoston OMA "Koodikieli"-osio yllä täydelle säännölle. Käyttäjälle näkyvä teksti on AINA suomeksi, poikkeuksetta.
- **Ei build-askelta, ei linteriä, ei muotoilijaa (Prettier/ESLint) määriteltynä** — koodityyli on epävirallinen mutta johdonmukainen: 2 välilyönnin sisennys, puolipisteet, `function`-avainsana (ei nuolifunktioita valtaosassa vanhempaa koodia, uudempi koodi käyttää molempia sekaisin), yksinkertaiset `if`-vartiolauseet mieluummin kuin syvä sisennys.
- **Funktionimeämiskaava:** `lataaX()` (hakee datan + piirtää), `piirraX()` (pelkkä DOM-rakennus datasta), `avaaXPaneeli()`/`suljeXPaneeli()` (modaalien avaus/sulku), `paivitaX()` (olemassa olevan näkymän virkistys ilman uutta hakua tarvittaessa).
- **Kommentointitapa:** kommentti selittää MIKSI, ei MITÄ — erityisesti bugikorjaukset kirjoitetaan muotoon `// BUGIKORJAUS (päivämäärä, "lyhyt nimi"): mikä meni rikki, miksi, miten korjattu, ks. muistiinpanot.md`. Isot rakenteelliset kommentit (tiedoston/osion alussa) selittävät arkkitehtuurin, ei rivikohtaista logiikkaa.
- **Virheenkäsittely on PAKOLLINEN kaava, ei tyylikysymys** — ks. tämän tiedoston "Uusi kirjoituspolku → nämä 4 asiaa aina" -osio yllä. Tätä EI saa ohittaa uudessa koodissa.
- **CSS-rakenne:** yksi `style.css`, CSS custom properties (`--ground`, `--text`, `--accent`, `--accent-text`, `--muted`, `--border`, `--border-dash`, `--huomio`, `--vaara`, `--vaara-ground`) määrittelevät koko väripaletin `:root`:issa + `@media (prefers-color-scheme: dark)` -kopio. Luokkanimet ovat suomenkielisiä ja ominaisuuskohtaisia (esim. `.muistutus-sinnikas-rivi`, `.hytti-tyyppi-btn`, `.kalenteri-tila-btn` — jälkimmäistä UUDELLEENKÄYTETÄÄN välilehti-/tyyppivalitsimena monessa eri moduulissa, ei omaa luokkaa jokaiselle). Kontrastisuhteet (WCAG AA, ≥4.5:1, tavoiteltu ~6:1 "luettava ulkona auringossa" -vaatimuksesta) on tarkistettu erikseen `--muted`/`--accent-text`/`--huomio`-väreille, ÄLÄ hämärrä niitä ilman kontrastintarkistusta.
- **ADHD-/arkiystävälliset suunnitteluperiaatteet** (KONSEPTIKIRJA.md OSA 1, kannattaa lukea kokonaan ennen UI-muutoksia): **vilkaisuarvo** (tärkein asia näkyy yhdellä silmäyksellä, ei kaivamista); **maksimiautomaatio, minimikustannus** (äly vain siihen mihin logiikka ei taivu, ei koskaan silmukassa/joka avauksella); **kolmiporras** (äly ehdottaa → ihminen kuittaa → ei koskaan suoraa kirjoitusta ilman hyväksyntää); **turvainvariantti** (mikään kirjoitettu ei koskaan katoa hiljaa — poisto on aina käyttäjän oma, eksplisiittinen teko); **vahvistus seuraa todellisuutta** (UI ei koskaan väitä jotain tehdyksi mitä ei ole tehty — tämän rikkomisesta on maksettu viisi kertaa, ks. "Uusi kirjoituspolku" -osio yllä); **arki-minälle, ei ideaaliminälle** (suunnittele sille joka avaa jääkaapin väsyneenä tiistai-iltana, ei sille joka jaksaisi täydellisen järjestelmän); **Satama ei ränkytä** (taustapäivitykset/sisäinen bookkeeping eivät vaadi käyttäjän huomiota, vain käyttäjää oikeasti koskevat asiat nousevat esiin).

### Ympäristö ja salaisuudet

Kaikki alla ovat Vercelin projektikohtaisia ympäristömuuttujia (Vercel-dashboard → Settings → Environment Variables) — **ÄLÄ KOSKAAN kirjoita niiden ARVOJA mihinkään repon tiedostoon**, vain nimet ja käyttötarkoitus:

| Muuttuja | Käyttötarkoitus | Käyttävät tiedostot |
|---|---|---|
| `SUPABASE_SERVICE_KEY` | service_role-avain, ohittaa RLS:n — palvelinpuolen kirjoitukset JA kutsujan JWT:n validointi | kaikki `api/*.js` paitsi `api/ics.js` |
| `ANTHROPIC_API_KEY` | Claude API -kutsut | `api/aly.js`, `api/aly-nightly.js`, `api/laituri-add.js` |
| `ALY_MALLI` | valinnainen, mallin vaihto ilman koodimuutosta (oletus koodissa) | `api/aly.js`, `api/aly-nightly.js`, `api/laituri-add.js` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | web-push-allekirjoitus | `api/push-test.js`, `api/muistutukset-laheta.js` |
| `MUISTUTUKSET_CRON_SECRET` | jaettu salaisuus cron-endpointtien suojaukseen (URL-parametrina) — SAMA arvo myös GitHub-reposecrettinä ja cron-job.orgin kutsu-URL:issa | `api/muistutukset-laheta.js`, `api/caldav-sync.js`, `api/aly-nightly.js` |
| `ICLOUD_USERNAME` / `ICLOUD_APP_PASSWORD` | Katrin iCloud CalDAV-tunnus (sovelluskohtainen salasana, EI oikea iCloud-salasana) | `api/caldav-sync.js` |
| `ICLOUD_USERNAME_JUHA` / `ICLOUD_APP_PASSWORD_JUHA` | sama, Juhan tili | `api/caldav-sync.js` |
| `ITSLEARNING_ICS_KATRI` / `LUKKARIKONE_ICS_KATRI` | opiskelukalentereiden .ics-linkit (token URL:ssa, siksi ympäristömuuttujina eikä `kalenteri_syotteet`-taulun rivinä) | `api/caldav-sync.js` |

Lisäksi: **cron-job.org** (ulkoinen ilmaispalvelu, ei Vercel-muuttuja) on ENSISIJAINEN laukaisija kolmelle cron-endpointille, GitHub Actions on varalaukaisija — molempien tilaa ja lokeja pääsee tarkistamaan omilta dashboardeiltaan jos ajastettu työ vaikuttaa lakanneen toimimasta (ks. "GitHub Actions -ajastin" -osio yllä).

**Miten projekti ajetaan lokaalisti:** koska ei ole build-askelta, staattiset tiedostot (`index.html`/`script.js`/`style.css`) toimivat sellaisenaan miltä tahansa staattiselta palvelimelta (esim. `python3 -m http.server` tai `npx serve`) — mutta Supabase-kirjautuminen (Google OAuth) vaatii että käytetty osoite on lisätty Supabasen Auth-asetusten "Redirect URLs" -listaan, muuten kirjautuminen ohjautuu väärään paikkaan (ks. muistiinpanot.md, tunnettu sudenkuoppa: `localhost:3000`-osoite ei toiminut ilman tätä). `api/`-serverless-funktioiden ajamiseen lokaalisti käytä `vercel dev` (lukee `.env`-tiedoston tai kysyy Vercel-projektin ympäristömuuttujat) — pelkkä staattinen palvelin EI aja `api/*.js`-tiedostoja.

### Seuraavat askeleet / keskeneräiset asiat

**Aikataulu (alun perin kirjattu 2026-07-08):** 21.–22.7.2026 oli tarkoitus rauhoittaa KOKONAAN uusilta ominaisuuksilta (vain testauslista + turvasiivous). **Todellisuudessa 2026-07-20/21 rakennettiin silti Katrin omasta, eksplisiittisestä pyynnöstä laaja yön-yli-erä uusia ominaisuuksia** (Keskusteluteema, Vahdittu lepo, Laiturin luote, koko Opintopolku-moduuli) — ks. muistiinpanot.md kyseisiltä päivämääriltä täydelle kuvaukselle miksi rauhoitusjaksosta poikettiin. **23.7.2026 kehityskone palautuu ja Copilot ottaa jatkokehityksen.**

**Työn alla Claude Coden viimeisillä päivillä (19.–21.7.2026):**
- Neljäs ja viimeinen muistutuslaji, **Toistuva muistutus**, valmistui (ks. muistiinpanot.md "Toistuva muistutus" -osio + KONSEPTIKIRJA.md 4.8) — kaikki neljä muistutuslajia (kertaluontoinen/valmistaudu/sinnikäs/toistuva) ovat rakennettu, mutta EI YHTÄÄN niistä ole testattu oikealla cron-ajolla/oikealla laitteella pidemmän ajan yli.
- Keskusteluteema + Vahdittu lepo + Laiturin luote (KONSEPTIKIRJA.md 4.10b) ja koko Opintopolku-moduuli (KONSEPTIKIRJA.md 4.11) rakennettu 2026-07-20/21 — EI testattu oikealla ajalla/cronilla/kahdella tilillä, ks. Listat/Opintopolku-osiot yllä.
- Viisi auditointia (idempotenssi/toisto, riippuvuudet/rajat, aikakäsittely, XSS/renderöinti, ja 2026-07-21 **konsistenssi-auditointi** — tämä viimeinen ennen luovutusta) on nyt tehty. Konsistenssi-auditoinnin löydökset ja korjaukset: ks. muistiinpanot.md:n alussa oleva numeroitu yhteenveto (haku "KONSISTENSSI-AUDITOINTI"). Tärkein sieltä: **`sql/081` sisälsi tyyppibugin (`teema_id bigint` piti olla `uuid`) joka olisi estänyt koko TASO 2 -migraation onnistumisen — korjattu koodissa, mutta migraatiota EI ollut vielä ajettu Supabaseen auditoinnin aikaan.** Aja se ja sql/082 ensimmäisenä jos jatkat TASO 2 -ominaisuuksien parissa.

**Suunniteltu mutta EI VIELÄ toteutettu (täydet speksit KONSEPTIKIRJA.md OSA 4:ssä, rakennusjärjestys per konsepti on jo mietitty valmiiksi):**
- 4.1 Ruoka-moduuli (Juhan moduuli, konsepti ~95 % valmis)
- 4.2 Päivän askel (Juhan oma toiminnanohjaus)
- 4.3 Tiivistä sovitut / purkusanelu
- 4.4 Kalenterin kerrosarkkitehtuurin jatkot
- 4.5 Siirtymäkerros
- 4.6 Herätyspäivä + Horisontti + Kalenterisilta (kalenterisilta on osittain jo rakennettu, ks. muistiinpanot.md)
- 4.7 Yksi luukko — Laituri Sirin sisääntulona (osittain jo rakennettu: äly-lajittelu erä 1, sanelun tiivistys ja Oivallukset-reititys ovat vielä spekseinä, ei koodina)
- 4.9 Jakoluukku (Wilma-poiminta laajennettu käsittämään myös kuitit/liput, ks. KONSEPTIKIRJA.md 4.9)

4.10 ("Laiturin luode + arkisto") ja 4.11 ("Opintopolku") ovat NYT rakennettu — ks. Laituri/Opintopolku-osiot yllä, eivät enää kuulu tähän listaan.
