-- Laituri: yhteinen "keskeneräisten ajatusten" muistilista. Näkyy AINA
-- molemmille kirjautuneille, ei näkyvyyskytkintä (toisin kuin listat).
-- Rivin kategorisointi ei poista sitä — se merkitään 'sijoitettu'-tilaan ja
-- himmenee näkymässä.
--
-- Aja tämä Supabasen SQL Editorissa (aja migraatio 003 ensin jos et ole vielä).

begin;

create table laituri (
  id bigint generated always as identity primary key,
  user_id uuid,
  content text not null,
  status text not null default 'uusi' check (status in ('uusi', 'sijoitettu')),
  placed_where text,
  created_at timestamptz not null default now()
);

alter table laituri enable row level security;

create policy "laituri_select" on laituri for select using (auth.uid() is not null);
create policy "laituri_insert" on laituri for insert with check (auth.uid() is not null);
create policy "laituri_update" on laituri for update using (auth.uid() is not null);
create policy "laituri_delete" on laituri for delete using (auth.uid() is not null);

commit;
