-- Laiturin äly-lajittelu ("Yksi luukku" erä 1) + murun arkistointi
-- (2026-07-19, ks. muistiinpanot.md). Kaksi osaa jotka jakavat saman
-- laituri.status-tilakoneiston, siksi samassa migraatiossa:
--
-- (1) status-CHECK laajennettu kattamaan 'arkistoitu' — kolmas arvo
--     olemassa olevan ('uusi', 'sijoitettu') rinnalle, EI erillinen
--     mekanismi/sarake. Postgresin oletusnimi 'laituri_status_check'
--     (ks. sql/004, sama nimeämismalli kuin muistutukset_source_check).
-- (2) ai_kauppa_ehdotus (jsonb, nullable) — äly-lajittelun kauppatavara-
--     ehdotuksen tallennuspaikka: joukko tuotenimiä ("items") joita
--     tarjotaan siirrettäväksi Kauppalistalle. Kolmiporras-periaatteen
--     mukaisesti tämä on VAIN ehdotus — mikään ei siirry Kauppalistalle
--     ilman käyttäjän hyväksyntää (ks. script.js hyvaksyKauppaEhdotus()).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table laituri drop constraint if exists laituri_status_check;
alter table laituri add constraint laituri_status_check check (status in ('uusi', 'sijoitettu', 'arkistoitu'));

alter table laituri add column if not exists ai_kauppa_ehdotus jsonb;

commit;
