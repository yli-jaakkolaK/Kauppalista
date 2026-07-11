-- Hytti v1 -respeksaus (2026-07-11 lopullinen speksi, ks. muistiinpanot.md
-- "Hytti v1 + opiskelulaajennus + ICS-syötekoneisto"): kaksi pientä,
-- toisistaan riippumatonta ALTERia.
--
-- 1) hytti_kortit.kalenterisuodatin: kortin oma "Kortin kalenteri" -osio
--    (korttinäkymän uusi kohta 2) näyttää tulevat hytti-scopen tapahtumat
--    joiden OTSIKKO sisältää tämän merkkijonon (case-insensitive, ei älyä).
--    Tyhjä/null = osio ei näy kortilla.
--
-- 2) muistutukset.source-rajoite laajenee kattamaan Hytin rivit — kello-nappi
--    Hytin Tehtävät-koosteessa/kortin sisällä käyttää source='hytti_rivi'.
--    Constraint-nimi 'muistutukset_source_check' on Postgresin oletusnimi
--    nimeämättömälle inline-check-rajoitteelle (sql/025:ssä), DROP IF EXISTS
--    tekee tästä turvallisen ajaa uudelleenkin jos nimi joskus poikkeaisi.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table hytti_kortit add column if not exists kalenterisuodatin text;

alter table muistutukset drop constraint if exists muistutukset_source_check;
alter table muistutukset add constraint muistutukset_source_check
  check (source in ('rivi', 'kalenteri', 'ankkuri', 'hytti_rivi'));

commit;
