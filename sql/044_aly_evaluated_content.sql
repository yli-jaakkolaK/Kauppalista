-- BUGIKORJAUS (2026-07-16): E3-yöajon ensimmäinen oikea yö paljasti että
-- sama muru ("testi klo 15") nousi ankkuriehdokkaaksi KOLMENA aamuna
-- peräkkäin — raukeaminen (ehdokas poistetaan reagoimattomana) ja
-- uudelleenarviointi silmukoivat: yöajo poisti reagoimattoman ehdokkaan,
-- muru ei ollut koskaan päätynyt `aly_evaluated`-tauluun (tietoinen
-- alkuperäinen suunnittelu, jotta PURETTU ehdotus voisi tulla takaisin
-- jos muru on yhä ajankohtainen) — mutta sama logiikka piti myös
-- RAUENNEEN (reagoimattoman) ehdotuksen avoimena uudelle yritykselle,
-- eikä mikään erottanut "purettu, kokeile uudelleen" -tapausta
-- "rauennut hiljaisuudessa, älä kysy enää" -tapauksesta.
--
-- KORJAUS: hiljaisuus (raukeaminen ilman reagointia) ON vastaus — sama
-- periaate kuin muistutuksissa, Satama ei ränkytä. Kun ehdokas raukeaa
-- reagoimattomana, muru merkitään KÄSITELLYKSI PYSYVÄSTI. POIKKEUS:
-- jos käyttäjä MUOKKAA murun sisältöä myöhemmin, käsittelymerkintä
-- mitätöityy automaattisesti (uusi sisältö = uusi arvio) — tätä varten
-- `aly_evaluated` tallentaa nyt myös sen HETKISEN murun sisällön; yöajo
-- vertaa tallennettua sisältöä murun NYKYISEEN sisältöön, ja jos ne
-- eroavat, muru on taas vapaa arvioitavaksi ilman erillistä koodia joka
-- huomaisi muokkauksen erikseen.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table aly_evaluated add column if not exists content text;

commit;
