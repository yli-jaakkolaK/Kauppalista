# COPILOT.md — tekninen jatko-opas

Tämä tiedosto on eri asia kuin **muistiinpanot.md** (projektin historia, päätökset, konteksti — "miksi asiat ovat kuten ovat") ja **PALUU.md**/**BACKUP.md** (kertaluontoiset käsintehtävät toimenpiteet). COPILOT.md on paikka jonne kirjataan **"miten tähän järjestelmään lisätään uutta"** -tyyppinen tekninen ohjeistus — kirjoita tänne kun rakennat jotain jonka päälle ODOTETAAN rakennettavan lisää myöhemmin (kuten äly-putki alla). Jos vain korjaat bugin tai lisäät kertaluontoisen ominaisuuden, se kuuluu muistiinpanot.md:hen, ei tänne.

---

## Koodikieli: uusi koodi englanniksi (talon sääntö, kirjattu 2026-07-13)

**Tästä eteenpäin uusi koodi kirjoitetaan englanniksi** — funktioiden ja muuttujien nimet SEKÄ koodikommentit. Kolme rajausta:

1. **EI massauudelleennimeämistä olemassa olevalle koodille.** Tietokannan taulut/sarakkeet (`tuotteet`, `lists`, `nimi`, `tehty`, `list_id` ym.) ja toimivat, koskemattomat funktiot pysyvät nykyisissä suomenkielisissä nimissään. Nimeä olemassa oleva koodi uudelleen VAIN jos se muutenkin kirjoitetaan kokonaan uusiksi samassa työssä (esim. bugikorjaus joka jo muutti funktion sisältöä merkittävästi — silloin on järkevää nimetä se englanniksi SAMALLA). Sekakielisyys (osa suomeksi, osa englanniksi, rinnakkain samassa tiedostossa) on HYVÄKSYTTY, tarkoituksellinen välitila — raja kulkee "uusi = englanti", ei "kaikki heti englanniksi".
2. **Käyttäjälle näkyvät tekstit ovat AINA suomeksi** — UI-tekstit, virheilmoitukset, toastit, push-ilmoitukset, kaikki mitä Katri tai Juha lukevat sovelluksessa. Tämä sääntö koskee VAIN koodin omaa kieltä (nimet, kommentit), ei koskaan käyttöliittymän kieltä.
3. **Tietokannan skeeman nimet pysyvät suomeksi historiallisista syistä** — uusi koodi viittaa niihin sellaisenaan, ei käännetä kutsuhetkellä. Esimerkki: `deleteList()` (englanninkielinen funktio) operoi silti `tuotteet`-taulua ja sen `list_id`-saraketta — tämä on OK, ei ristiriita.

**Miksi tämä on kirjattu, ei vain hiljainen tapa:** englanti ei ole vain tekoälytyökaluja varten. Repo on julkisessa palvelussa (GitHub) — yleisesti ymmärretyt nimet tekevät koodista luettavaa, kommentoitavaa ja autettavaa KENELLE TAHANSA (issueiden kirjoittaminen, koodiesimerkkien jakaminen, virheviestien googlaus, tulevat avustajat jotka eivät osaa suomea). Suomenkielinen koodi rajaisi kaiken tulevan yhteistyön ja avunsaannin vain suomenkielisiin. Tarkoitus on että koodi muuttuu englanninkieliseksi AJAN SAATOSSA, sitä mukaa kun tiedostoihin muutenkin kosketaan — ei kertarysäyksellä, ei koskaan koskematta koodiin jota ei olisi muutenkaan tarvinnut muuttaa.

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

Muistutukset (`api/muistutukset-laheta.js`) ja kalenterisynkka (`api/caldav-sync.js`) EIVÄT käynnisty itsestään Vercel Hobby -tasolla (ei omaa cron-tukea) — molemmat riippuvat kokonaan `.github/workflows/muistutukset-cron.yml`:stä, joka herää 5 minuutin välein ja kutsuu molempia.

**Jos muistutukset tai kalenterisynkka lakkaavat toimimasta yhtäkkiä ilman koodimuutosta, tarkista ENSIN GitHub-repon Actions-välilehti ennen kuin epäilet koodivikaa.** GitHub pysäyttää ajastetut (`schedule`-tyyppiset) workflowt automaattisesti jos repoon ei ole tullut yhtään committia noin 60 päivään — tästä lähtee sähköposti-ilmoitus repon omistajalle, ja Actions-välilehdellä workflow-listan vieressä näkyy silloin "Enable"-nappi joka käynnistää sen uudelleen yhdellä painalluksella. Tämä ei ole koskaan lähikuukausien huoli Copilot-aikana (committeja tulee luonnostaan jatkuvasta kehityksestä), mutta jos projektiin joskus tulee pitkä hiljainen jakso, tämä on ensimmäinen paikka tarkistaa.
