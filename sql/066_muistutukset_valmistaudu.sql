-- Valmistautumisvaihe muistutuksille (2026-07-18, ks. muistiinpanot.md
-- "Valmistautumisvaihe muistutuksille") — lähtemisen kaaos on usein
-- VALMISTAUTUMISEN ongelma, ei ajoituksen: pelkkä "lähde nyt" -muistutus
-- pörähtää väärässä tilassa. Valinnainen toinen, aikaisempi tönäisy
-- ("🎒 Valmistaudu: ...") joka kytkeytyy varsinaiseen muistutukseen
-- parent_id-viitteellä.
--
-- "on delete cascade" tekee siivouksesta ilmaisen: kun päämuistutus
-- poistetaan (× yksittäin TAI siivoaMuistutuksetKumottavasti()-erässä kun
-- itse kohde poistuu/valmistuu, ks. script.js), valmistautumis-tönäisy
-- katoaa AUTOMAATTISESTI mukana ilman erillistä sovelluskoodia — sama
-- "syntyy ja poistuu päämuistutuksen mukana" -vaatimus kuin Katri pyysi.
--
-- Oletusminuuttimäärä (30) EI ole oma asetukset-rivinsä tässä migraatiossa —
-- sama "data ei koodia" -periaate kuin hetki_ennakkopaivat/rauhoitus-ikkuna,
-- mutta ilman pakollista siemenriviä: script.js:n haeAsetusNumero()
-- palauttaa 30 jos asetukset.valmistaudu_oletus_min puuttuu, joten rivi on
-- valinnainen lisäys (Table Editorista tai tulevasta migraatiosta) vasta
-- jos oletus halutaan muuttaa.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table muistutukset add column if not exists parent_id bigint references muistutukset(id) on delete cascade;

commit;
