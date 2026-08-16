-- Yksityisyyskorjaus (2026-08-16, Katrin löydös elävässä testauksessa):
-- kurssikontekstinen materiaalintuonti ("+ Lisää materiaalia") kirjoittaa
-- laituri-tauluun, jonka RLS on TARKOITUKSELLA avoin molemmille kirjautuneille
-- (sql/004: "Näkyy AINA molemmille"). Tämä tarkoitti että Katrin yksityinen
-- Opintopolku-materiaali (koko muu Opintopolku on owner_id-rajattu, ks.
-- sql/083) näkyi Juhan Laiturissa siitä hetkestä kun rivi tallentui siihen
-- asti kun Katri ehti luokitella sen — `piilota_laiturista` on VAIN
-- client-puolen näkymäsuodatin, ei RLS-tason suoja.
--
-- Katrin oma ratkaisu (2026-08-16 keskustelu): EI uutta erillistä taulua,
-- vaan sama visibility-malli kuin lists-taululla jo on (sql/003) — koska
-- Laituri ollaan joka tapauksessa uudistamassa seuraavaksi laajemminkin niin
-- että rivin voi laskea joko jaettuna tai vain itselle. Tämä migraatio
-- rakentaa sen kentän + RLS:n nyt, ja kurssikontekstin materiaali on
-- ensimmäinen käyttäjä sille (script.js: materiaaliKohdeKurssi asettaa
-- visibility='private' insert-hetkellä).
--
-- OLETUS 'shared' (ei 'private' kuten lists-taululla!) — Laiturin ydinluonne
-- on jaettu tulopiste, olemassa olevat/tulevat tavalliset murut eivät saa
-- muuttua näkymättömiksi. VAIN eksplisiittisesti yksityiseksi merkityt rivit
-- piiloutuvat toiselta.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table laituri add column if not exists visibility text not null default 'shared'
  check (visibility in ('private', 'shared'));

drop policy if exists "laituri_select" on laituri;
create policy "laituri_select" on laituri for select
  using (auth.uid() is not null and (visibility = 'shared' or user_id = auth.uid()));

drop policy if exists "laituri_update" on laituri;
create policy "laituri_update" on laituri for update
  using (auth.uid() is not null and (visibility = 'shared' or user_id = auth.uid()));

drop policy if exists "laituri_delete" on laituri;
create policy "laituri_delete" on laituri for delete
  using (auth.uid() is not null and (visibility = 'shared' or user_id = auth.uid()));

commit;
