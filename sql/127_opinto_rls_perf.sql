-- Suorituskykykorjaus, löytyi Supabasen omista security/performance-
-- advisoreista (mcp__Supabase__get_advisors) tämän istunnon migraatioiden
-- (117-126) jälkeisenä tarkistuksena, ei käyttäjän raportoima.
--
-- 1. RLS-policyt jotka kutsuivat auth.uid():ta suoraan WHERE-lausekkeessa
--    (kaavio arvioi sen UUDELLEEN JOKAISELLE RIVILLE). Korjaus: kääri
--    (select auth.uid()) niin että suunnittelija laskee sen kerran per
--    kysely (Postgresin/Supabasen oma dokumentoitu kuvio, ei muuta
--    semantiikkaa). Koskee sekä tässä istunnossa luotuja tauluja
--    (ohjematriisi, opinto_jumi_merkinnat) että olemassa olevia joita
--    Tehtävänäkymä nyt kuormittaa uudella tavalla (opinto_kurssit,
--    opinto_aiheet).
-- 2. Indeksoimattomat foreign keyt samoilla tauluilla.
--
-- Ei muuta mitään käyttäytymistä, pelkkä suorituskykyparannus.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

drop policy if exists "ohjematriisi_select" on ohjematriisi;
create policy "ohjematriisi_select" on ohjematriisi for select
  using ((select auth.uid()) is not null);

drop policy if exists "opinto_jumi_merkinnat_all" on opinto_jumi_merkinnat;
create policy "opinto_jumi_merkinnat_all" on opinto_jumi_merkinnat for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "opinto_kurssit_all" on opinto_kurssit;
create policy "opinto_kurssit_all" on opinto_kurssit for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "opinto_aiheet_all" on opinto_aiheet;
create policy "opinto_aiheet_all" on opinto_aiheet for all
  using (exists (select 1 from opinto_kurssit k where k.id = opinto_aiheet.kurssi_id and k.owner_id = (select auth.uid())))
  with check (exists (select 1 from opinto_kurssit k where k.id = opinto_aiheet.kurssi_id and k.owner_id = (select auth.uid())));

create index if not exists opinto_aiheet_kurssi_id_idx on opinto_aiheet (kurssi_id);
create index if not exists opinto_jumi_merkinnat_aihe_id_idx on opinto_jumi_merkinnat (aihe_id);
create index if not exists opinto_jumi_merkinnat_owner_id_idx on opinto_jumi_merkinnat (owner_id);
create index if not exists opinto_kurssit_owner_id_idx on opinto_kurssit (owner_id);

commit;
