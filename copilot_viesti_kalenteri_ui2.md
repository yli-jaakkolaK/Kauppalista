# Rakennusviesti Codelle — Kalenteri: kuittiteemasta merikartta-designiin (jäi tekemättä edellisessä erässä)

Edellinen deploy (sw.js v181) teki oikein kaiken datan/sisällön puolen: värit, viikkonäkymän tekstibugin, osoitteet. Kiitos siitä. Mutta yksi asia jäi kokonaan tekemättä eikä se ollut Coden virhe — edellinen viestini oli liian epätarkka siitä kohdasta. Tässä sama asia täsmällisemmin.

## Mistä on kyse

Kalenterinäkymät (kuukausi/viikko/päivä, `#kalenteri-view`) käyttävät edelleen vanhaa kuittiteeman pintaa: `--ground`/`--text`/`--accent`/`--border`-tokeneita ja `Courier New` (ks. style.css rivit ~25–48 ja `.kalenteri-*`-luokat ~295–520). Ruori-etusivu (`.ruori`-luokka) on jo kokonaan uudessa merikartta/loki-designissa (`--paperi`/`--muste`/`--messinki`/`--sinappi`/`--syvanne`/`--r-luettava`/`--r-kosketettava`, Courier Prime, `satama-design-system.css`). Kalenterinäkymän pitää siirtyä samaan pintaan — tämä ei koske värejä (ne pysyvät, ks. edellinen viesti) vaan taustaa, fonttia, kortin/napin muotokieltä ja liikettä.

## Konkreettiset muutokset per elementti

**Fontti ja pohjaväri**
- Koko `#kalenteri-view`: fontti `'Courier Prime', ui-monospace, monospace` (ei `Courier New`), tausta `var(--paperi)` (#EAE6DC), teksti `var(--muste)` (#221F1A). Käytännössä: poista `--ground`/`--text`-tokenien käyttö tässä näkymässä ja korvaa suoraan merikartta-tokeneilla, samaan tapaan kuin `.ruori`-luokka jo tekee omalle juurielementilleen.

**Tilanvaihdin (Päivä/Viikko/Kuukausi-napit, `.kalenteri-tila-btn`)**
- Nykyinen: katkoviivakehys + `--accent`-väri. Muutos: käytä `satama-design-system.css`:n `.saadin`-luokan reseptiä — messinkikehys (`rgba(156,122,67,.5)`), lämmin lasitausta (`linear-gradient` paperinsävyistä + `backdrop-filter: blur(8px)`), `border-radius: var(--r-kosketettava)` (13px). Valittu tila: `aria-pressed="true"` → messinkikehys korostuu + `box-shadow: inset 0 1px 0 rgba(255,255,255,.65), 0 0 0 3px rgba(156,122,67,.15)`, sama kuin `.saadin[aria-pressed=true]`.

**Nav-nuolet (‹ ›) ja otsikko**
- Nuolten väri `var(--messinki)`, ei `--accent`. Otsikkoteksti (esim. "ELOKUU 2026") merkintä-tyylillä: 12.5px, letter-spacing .16em, uppercase, `var(--vaimea)`.

**Kuukausinäkymän ruudukko**
- Solujen reunaviivat: `var(--hius)` (hiusviiva, rgba(34,31,26,.16)) eikä nykyinen `--border`. "Tänään"-solu: ei enää tasaväri koko solussa, vaan pelkkä päivänumero ympyröitynä `var(--muste)`-taustalla (kuten mockupissa) — kuormaväri (kevyt/keski/raskas) on jo oikein tasavärisenä taustana, se säilyy.
- Viikonpäivien lyhenteet (MA TI KE...) yläreunassa: pieni koko, `var(--vaimea)`, ei nykyinen `--muted`-token (sama väri, mutta yhtenäistä muuttujanimeä käyttäen jos mahdollista).
- **Monipäiväiset tapahtumat (esim. "yötä jossain", matka) EIVÄT saa katketa päivä-/viikkorajalla.** Tämä on jo kuvattu `kalenteri_ui_maaritys.md`:ssä ("yo-lahto/yo-keski/yo-tulo" -logiikka) mutta tarkista onko se toteutunut tässä ajossa: yksi tapahtuma joka kestää useita päiviä piirtyy yhtenä yhtenäisenä palkkina koko kestonsa ajan, myös viikonvaihteen yli — ei rakoa, ei uutta erillistä palkkielementtiä joka päivälle. Lähtöpäivänä palkin oikea reuna on suora (ei pyöristystä, koska jatkuu seuraavaan soluun), keskipäivinä molemmat reunat suoria, saapumispäivänä vasen reuna suora. Tarkista tämä sekä kuukausi- että viikkonäkymässä.

**Viikkonäkymän aikajana**
- Sarakkeiden ja tuntiviivojen reunat: `var(--hius)`/`var(--hius-vahva)`, ei `--border`. Tapahtumapalkin tausta on jo oikea (henkilöväri + opasiteetti, edellisessä erässä korjattu) — vain kehysten/taustan harmaasävy vaihtuu paperinsävyiseksi.

**Päivänäkymän lista ja kuormarivi**
- `.kal-rivi`: reunaviiva `var(--hius)`, ei `--border`. `.pv-kuorma` (uusi kuormarivi-kortti, jo rakennettu edellisessä erässä sisällöltään): pinta `.arkki`-luokan resepti — `background: rgba(255,253,248,.5)`, `border: 1px solid var(--hius)`, `border-radius: var(--r-luettava)` (3px, EI 13px — tämä on luettava pinta, ei nappi).
- Huomioitu tietoisesti: mockupin `.pv-kuorma`-pistekortin TARKKAA sisältöä/ristiriitarivin logiikkaa ei tarvitse muuttaa — vain sen ULKOASU (tausta/kehys/pyöristys) siirtyy merikartta-pintaan tässä erässä. Datalogiikka (mitä pisteet tarkoittavat, ristiriidan kuittaus) pysyy koskemattomana.

**Liike / kosketuspalaute**
- Kaikki napit ja klikattavat rivit (tilanvaihdin, nav-nuolet, kalenteripäivät): `transition: transform var(--keski) var(--kelluu), background var(--keski) var(--kelluu), box-shadow var(--keski) var(--kelluu)` — `--keski: 520ms`, `--kelluu: cubic-bezier(.24,.72,.30,1)`. Hover: `translateY(-2px)`. Active/klikkaus: `translateY(0) scale(.996)`. Tämä on sama resepti kuin `.ruori .segmentti` ja etusivun ankkurit jo käyttävät — ei uutta liikekieltä, vain sama sovellettuna kalenterin elementteihin.
- `prefers-reduced-motion: reduce` ohittaa kaiken tämän, kuten muuallakin.

## Mitä EI muuteta tässä erässä
- Henkilövärit (Katri/Juha/yhteinen/Rebekka/Jamiel) — pysyvät edellisen erän mukaisina, ei kosketa.
- Kuukausinäkymän solukoko (~52px), kuorman tasaväritys, ristiriita-/huolilippumerkit (⚠️/🟠) — ennallaan.
- Ristiriidan/huolilipun kuittauslogiikka ja muu datapuoli — ei mitään toiminnallista muutosta, tämä erä on puhtaasti pinta (CSS).
- Viikkonäkymän vaakatila-käyttäytyminen ja tekstin-ei-katkea-korjaus — jo tehty edellisessä erässä, ei kosketa.

## Miksi tämä nyt
Kalenteri on Katrin päivittäin käyttämä osio ja ainoa iso näkymä joka on vielä visuaalisesti "väärässä maailmassa" verrattuna Ruori-etusivuun — koettu "järkyttäväksi" ulkoasultaan ennen tätä koko kierrosta. Mockup hyväksytty pohjaksi: https://claude.ai/code/artifact/6868b897-0c4c-44b3-89a0-45a17951b217 — käytä sitä visuaalisena referenssinä täsmällisten arvojen lisäksi.
