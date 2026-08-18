-- Kurssin tasokuvaus tekoälykehotteen kalibrointia varten (SATAMA_SPEKSI.md
-- §7.6, "harjoitustehtävien kolmas lähde: Sataman näyttämä valmis prompti
-- jonka käyttäjä kopioi Copilotille" — rakennettu 2026-08-18, Katrin pyyntö:
-- "it should give me copy paste prompt i can give ai phrased so that right
-- level of challenge appears from the start not 8th grade trigonometry or
-- precalculus").
--
-- Lyhyt, käyttäjän itse kirjoitettu kuvaus siitä millä tasolla kurssin
-- pitäisi tuntua (ei automaattisesti pääteltävissä esim. materiaali-
-- kentästä, joka on pitkä epäjäsentynyt tekstimöykky useasta kurssista).
-- Käytetään script.js:n rakennaOpintoAiPrompti()-funktiossa.
--
-- Idempotentti (plain UPDATE, turvallinen ajaa uudelleen). Ajettu jo
-- suoraan MCP:n kautta 2026-08-18 — tämä tiedosto on historiakirjaus.

begin;

alter table opinto_kurssit add column if not exists taso_kuvaus text;

update opinto_kurssit set taso_kuvaus = 'AMK-tason insinöörimatematiikan perusteet (5 op, esitietovaatimus: lukion LYHYT matematiikka, ei pitkä). Kalibroi tälle tasolle: ei yläasteen/8. luokan tasoa, mutta ei myöskään täyttä yliopistotason todistuspohjaista tarkkuutta.' where id = 2;

update opinto_kurssit set taso_kuvaus = 'AMK-tason Engineering Physics -kurssi (5 op, TE00DH09, esitiedot: lukion pitkä TAI lyhyt matematiikka). Esiopiskelu ennen oikean kurssin alkua 1.9.2026.' where id = 9;

commit;
