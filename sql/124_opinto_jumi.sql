-- Opiskelumoottori A4 "En pääse alkuun" -nappi (rakennusjärjestys-dokumentti
-- 17.8.2026 + sung-metodi.md §8: "tarjoaa pienemmän askeleen samasta
-- vaiheesta ja tallentaa merkinnän. Merkinnöistä näkee myöhemmin ovatko
-- tietyt vaiheet tai tietotyypit systemaattisesti hankalia — sama data
-- paljastaa myös valikoivan oppimisen."). Kevyt loki, ei näkymää tässä
-- erässä (B1:n "datan talteenotto alkaa heti, näkymä voi tulla myöhemmin"
-- -periaate).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists opinto_jumi_merkinnat (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  aihe_id bigint not null references opinto_aiheet(id) on delete cascade,
  pero_vaihe text not null,
  pacer_tyyppi text,
  created_at timestamptz not null default now()
);

alter table opinto_jumi_merkinnat enable row level security;
drop policy if exists "opinto_jumi_merkinnat_all" on opinto_jumi_merkinnat;
create policy "opinto_jumi_merkinnat_all" on opinto_jumi_merkinnat for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

commit;
