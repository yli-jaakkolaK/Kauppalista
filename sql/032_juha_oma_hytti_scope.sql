-- Juhan "Oma" kalenteri Hytin scopeen (2026-07-13). Sama malli kuin Katrin
-- Itslearning/Lukkarikone-syötteillä (sql/028): scope='hytti' tarkoittaa
-- että tämän syötteen tapahtumat näkyvät VAIN omistajan omassa Hytissä
-- (tänään-kaista + korttien "Kortin kalenteri" -osio), eivät koskaan
-- perheen agendassa/kuittausjonossa/Kuormavahdissa eivätkä toiselle
-- käyttäjälle — RLS (kalenteri_tapahtumat_select-policy, sql/027) suojaa
-- tämän jo tietokantatasolla `henkilo` -> `hytti_omistajat`-kartan kautta.
--
-- henkilo on JO 'juha' tällä rivillä (asetettu sql/031:ssä kun rivi
-- luotiin) — tarvitaan vain scope-muutos, EI erillistä 'owner'-saraketta
-- (sama päätös kuin sql/027:n yläkommentissa: henkilo kattaa tämän tarpeen
-- jo, uusi sarake olisi duplikaatti).
--
-- *** VAATII ENNEN TESTAUSTA: hytti_omistajat-taulussa on rivi
-- henkilo='juha' -> Juhan OIKEA auth-tunniste (PALUU.md ohjeisti lisäämään
-- tämän Table Editorista sql/027:n jälkeen). Ilman sitä Juha ei näkisi
-- omaa Oma-kalenteriaan MISSÄÄN, ei edes omassa Hytissään, koska RLS-
-- policy ei löytäisi vastaavuutta henkilo='juha':lle. Tarkista Table
-- Editorista ETTÄ tämä rivi on olemassa ennen kuin oletat testin
-- epäonnistuvan koodivirheenä. ***
--
-- Idempotentti (plain UPDATE, turvallinen ajaa uudelleen).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

update kalenteri_syotteet
set scope = 'hytti'
where account_key = 'juha' and tunniste = 'Oma';

commit;
