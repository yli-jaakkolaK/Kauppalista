-- Kaksi muutosta harjoitustehtävägeneraattoriin (2026-08-29, Katrin pyyntö
-- "minimising API calls and using no new serverless functions"):
--
-- 1) opinto_aiheet.miro_priming_ohje — suomenkielinen Miro-kehote priming-
--    vaiheeseen, kirjoitettu KÄSIN kymmenelle fysiikan aiheelle suoraan
--    tässä migraatiossa. EI KOSKAAN tekoälykutsua tälle — käyttöliittymä
--    lukee sarakkeen suoraan Supabase-clientilla ja näyttää sen priming-
--    näkymässä Miro-kehyksen yläpuolella (ks. script.js:n
--    paivitaOpintoTehtavaPriming).
--
-- 2) harjoitustehtavat.jonossa — yksi api/luo-harjoitustehtava.js-kutsu
--    generoi nyt 10 tehtävää kerralla (aiemmin 1), kaikki tallennetaan heti
--    jonossa=true, ensimmäinen merkitään jonossa=false ja palautetaan
--    käyttäjälle. Seuraavat "Uusi tehtävä" -napautukset tarkistavat ENSIN
--    Supabase-clientilla onko tälle aihe+vaihe-parille jonossa=true rivejä
--    - jos on, käytetään sitä eikä kutsuta funktiota ollenkaan. Vasta kun
--    jono on tyhjä, kutsutaan funktiota uudelleen seuraavaa 10 kpl -erää
--    varten. Ei muuta RLS-käytäntöä — sama owner_id=auth.uid()-sääntö
--    (sql/143) kattaa jo sekä palvelimen service role -kirjoitukset että
--    selaimen suorat jonossa-päivitykset.
--
-- Idempotentti (add column/index if not exists). Ajettu jo suoraan MCP:n
-- kautta 29.8.2026 - tämä tiedosto on historiakirjaus (ks. sql/138:n
-- vastaava malli).

begin;

alter table opinto_aiheet add column if not exists miro_priming_ohje text;
alter table harjoitustehtavat add column if not exists jonossa boolean not null default true;
create index if not exists harjoitustehtavat_jono_idx on harjoitustehtavat (aihe_id, pacer_vaihe, jonossa);

update opinto_aiheet set miro_priming_ohje = v.ohje
from (values
  (126, 'Piirrä kartalle nämä neljä palikkaa ja niiden suhteet: yhtälön ratkaisu, SI-yksiköt ja muunnossäännöt, skalaari vs. vektori, sekä suuruusluokka-arviointi. Älä ratkaise vielä yhtään tehtävää — hahmottele vain mistä kukin aihe kertoo ja miksi tarvitset sitä myöhemmin.'),
  (127, 'Piirrä kartalle työn, kineettisen energian ja potentiaalienergian väliset yhteydet — miten voima muuttuu työksi, ja miten energia muuttaa muotoaan ilman että se katoaa. Ei kaavoja vielä, vain käsitteiden suhteet.'),
  (128, 'Hahmottele kartalle teho, lämpö ja lämpötila omina käsitteinään ja niiden suhteet toisiinsa — mikä on nopeutta, mikä energiaa, mikä ei kumpaakaan. Lisää mukaan säteily, johtuminen ja konvektio kolmena eri tapana siirtää lämpöä.'),
  (129, 'Piirrä kartalle kolme lämmönsiirtotapaa (johtuminen, konvektio, säteily) ja yksi tosielämän esimerkki kustakin — mikä niistä tarvitsee ainetta välissä, mikä ei.'),
  (130, 'Hahmottele kartalle ICT-alan kestävyysvaikutukset kolmena ryhmänä: ympäristö, talous ja sosiaalinen — ja kummaltakin puolelta sekä hyviä että huonoja esimerkkejä. Ei oikeita tai vääriä vastauksia, tarkoitus on jäsentää omaa ajattelua.'),
  (121, 'Piirrä kartalle siirtymä, nopeus ja kiihtyvyys sekä niiden suhteet toisiinsa (mikä on minkäkin muutosnopeus). Merkitse myös mitkä niistä ovat vektoreita ja mitkä skalaareja.'),
  (122, 'Hahmottele kartalle miten x- ja y-suunnan liike käsitellään erikseen ja yhdistetään lopuksi — käytä heittoliikettä esimerkkinä. Ei laskukaavoja, vain ajatuskulku.'),
  (123, 'Piirrä kartalle Newtonin kolme lakia yhtenä kokonaisuutena — mikä laki selittää minkäkin arkipäivän tilanteen (esim. turvavyö, potku, raketti).'),
  (124, 'Hahmottele kartalle voimakuvion (free-body diagram) rakentamisen vaiheet järjestyksessä — mitä teet ensin, toiseksi, kolmanneksi. Ei vielä yhtään numeroa, vain menettely.'),
  (125, 'Piirrä kartalle liikemäärän säilyminen ja kolme törmäystyyppiä (täysin kimmoisa, osittain kimmoisa, täysin kimmoton) — mikä säilyy kussakin ja mikä ei.')
) as v(id, ohje)
where opinto_aiheet.id = v.id;

commit;
