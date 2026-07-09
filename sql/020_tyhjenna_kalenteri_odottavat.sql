-- Kertaluonteinen siivous: 15 riviä kalenteri_odottavat-taulussa syntyi
-- ENNEN kahden aikaan liittyvän bugin korjausta 2026-07-08 illalla —
-- ks. api/caldav-sync.js ja muistiinpanot.md "Kalenterisyötteet"-osion
-- "BUGI A" / "BUGI B" -diagnoosit. Rivit ovat osin virheellisiä/vaillinaisia
-- (haamuesiintymiä toistuvista tapahtumista + joulukuun tapahtuma puuttuu
-- kokonaan liian lyhyen hakuikkunan takia). Katri ei ole hyväksynyt tai
-- hylännyt yhtäkään näistä riveistä, niin turvallinen poistaa kaikki.
--
-- Tämän jälkeen: avaa Kalenteri-näkymä (käynnistää synkan automaattisesti)
-- tai GET /api/caldav-sync selaimesta — jono täyttyy uudelleen korjatulla
-- logiikalla.
--
-- Turvallinen ajaa uudelleen (tyhjän taulun tyhjentäminen on no-op).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

delete from kalenteri_odottavat;

commit;
