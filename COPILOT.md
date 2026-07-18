# COPILOT.md — tekninen jatko-opas

Tämä tiedosto on eri asia kuin **muistiinpanot.md** (projektin historia, päätökset, konteksti — "miksi asiat ovat kuten ovat", sisältää myös kesken olevan testauslistan) ja **BACKUP.md** (kertaluontoiset käsintehtävät toimenpiteet). COPILOT.md on paikka jonne kirjataan **"miten tähän järjestelmään lisätään uutta"** -tyyppinen tekninen ohjeistus — kirjoita tänne kun rakennat jotain jonka päälle ODOTETAAN rakennettavan lisää myöhemmin (kuten äly-putki alla). Jos vain korjaat bugin tai lisäät kertaluontoisen ominaisuuden, se kuuluu muistiinpanot.md:hen, ei tänne. **(PALUU.md poistettu 2026-07-17 — sisältö siirretty muistiinpanot.md:n "Testauslista — kesken" -osioon.)**

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
