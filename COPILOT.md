# COPILOT.md — tekninen jatko-opas

Tämä tiedosto on eri asia kuin **muistiinpanot.md** (projektin historia, päätökset, konteksti — "miksi asiat ovat kuten ovat") ja **PALUU.md**/**BACKUP.md** (kertaluontoiset käsintehtävät toimenpiteet). COPILOT.md on paikka jonne kirjataan **"miten tähän järjestelmään lisätään uutta"** -tyyppinen tekninen ohjeistus — kirjoita tänne kun rakennat jotain jonka päälle ODOTETAAN rakennettavan lisää myöhemmin (kuten äly-putki alla). Jos vain korjaat bugin tai lisäät kertaluontoisen ominaisuuden, se kuuluu muistiinpanot.md:hen, ei tänne.

---

## Äly-putki (`api/aly.js`, rakennettu 2026-07-11)

### Mikä tämä on

Yksi endpoint (`POST /api/aly`) joka kutsuu Anthropicin Messages API:a ja palauttaa vastauksen. Ensimmäinen kerros — todistettu putki puhelimesta Claude API:in ja takaisin, EI mitään oikeaa älyominaisuutta vielä. Todistettu "Testaa äly" -napilla Asetukset → Sovellus-osiossa (sama todistusrooli kuin push-testinapilla oli push-infralle, ks. muistiinpanot.md "Push-ilmoitukset"-osio).

Jokainen tuleva älyominaisuus (Siri-tulkinta, Laituri-luokittelu, jääkaappikuvan tulkinta, ym.) rakentuu TÄMÄN päälle — ei omaa erillistä Anthropic-integraatiotaan.

### *** PERIAATE: ÄLY EHDOTTAA, IHMINEN KUITTAA ***

Tämä on talon periaate kaikelle mitä äly-putken päälle rakennetaan, ei vain tekninen yksityiskohta:

- **Äly ei koskaan kirjoita dataa suoraan** mihinkään Supabase-tauluun ilman että käyttäjä on ensin nähnyt ja hyväksynyt sen. `/api/aly` itsessään EI kirjoita mitään — se vain palauttaa tekstiä kutsujalle.
- Jokainen tuleva ominaisuus jonka äly "tekee" (esim. ehdottaa mihin kategoriaan Laiturin rivi kuuluu, tulkitsee mitä Siri-komento tarkoitti) esitetään käyttäjälle EHDOTUKSENA jonka voi hyväksyä sellaisenaan, muokata, tai hylätä — sama malli kuin kuittausjonolla on jo kalenterisynkalle (ks. muistiinpanot.md "Kalenterin periaate: yksi totuus, kaksi ikkunaa") ja kuin Vaihe 2:n loma-aikojen automaattitäytöllä on suunniteltu toimimaan (ks. "Loma-aikojen täyttö" -osio: "EI KIRJOITA suoraan ilman vahvistusta").
- Kun rakennat uutta älyominaisuutta: jos suunnittelet UI:ta joka tallentaa älyn vastauksen tietokantaan ILMAN välikätistä hyväksyntävaihetta, pysähdy — se rikkoo tätä periaatetta, suunnittele uudelleen.

### Miten lisäät uuden älyominaisuuden

Kaksi tapaa, valitse sen mukaan kuinka erilainen uusi tarve on olemassa olevaan `/api/aly`-rajapintaan verrattuna:

**A) Sama endpoint, uusi prompti kutsuvasta koodista** (oletustapa, käytä tätä ellei ole hyvää syytä muuhun). `/api/aly` on tarkoituksella geneerinen — `{ prompt, max_tokens }` sisään, `{ text }` ulos. Uusi ominaisuus on tyypillisesti VAIN uusi `fetch('/api/aly', {...})`-kutsu `script.js`:ssä jollain toisella promptilla, ja UI joka näyttää vastauksen ehdotuksena (ks. periaate yllä). Esimerkki (konseptuaalinen, EI toteutettu): Laituri-rivin luokittelu voisi rakentua näin:
```js
const vastaus = await fetch('/api/aly', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
  body: JSON.stringify({
    prompt: 'Luokittele tämä lyhyt ajatus yhteen sanaan (esim. "osto", "idea", "muistettava"): "' + rivi.content + '"',
    max_tokens: 20,
  }),
});
const { text } = await vastaus.json();
// Näytä `text` käyttäjälle EHDOTUKSENA (esim. pieni nappi "merkitse: <text>?")
// — EI koskaan tallenna suoraan tähän kohtaan.
```

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
