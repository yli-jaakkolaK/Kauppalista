-- Web push -tilaukset: perusta muistutuksille ja tuleville ominaisuuksille,
-- ei sidottu mihinkään yksittäiseen käyttötarkoitukseen. Yksi rivi per
-- laite/selainprofiili jonka käyttäjä on hyväksynyt ilmoitukset (yhdellä
-- käyttäjällä voi olla useita rivejä, esim. oma + puolison puhelin ovat eri
-- käyttäjätunnuksia joten eivät sekoitu keskenään RLS:n ansiosta).
--
-- Lähetys tapahtuu AINA palvelimelta (api/push-*.js) service_role-avaimella,
-- joka ohittaa RLS:n — normaali käyttäjä ei koskaan lähetä pushia suoraan
-- selaimesta, vain hallinnoi omaa tilaustaan.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table push_tilaukset (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  failed_count int not null default 0
);

alter table push_tilaukset enable row level security;

create policy "push_tilaukset_select_own" on push_tilaukset for select using (auth.uid() = user_id);
create policy "push_tilaukset_insert_own" on push_tilaukset for insert with check (auth.uid() = user_id);
-- update-policy tarvitaan koska frontend käyttää upsertia (uusi laite vs.
-- sama laite tilaa uudelleen) — ilman tätä upsertin UPDATE-haara torjuttaisiin RLS:ssä
create policy "push_tilaukset_update_own" on push_tilaukset for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_tilaukset_delete_own" on push_tilaukset for delete using (auth.uid() = user_id);

commit;
