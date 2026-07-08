-- Oma Hytti: täysin yksityinen henkilökohtainen työtila (Juhalle työ/casejt,
-- Katrille opiskelu). EI jakokytkintä, EI shared-haaraa ollenkaan — RLS
-- suodattaa aina vain omistajan rivit, sama yksinkertaisin mahdollinen
-- policy-malli kuin ankkurit-taulussa.
--
-- hytti_kortit = yksi "casen"/kokonaisuuden kortti. card_type 'paattyva'
-- (valmistuu ja arkistoituu) tai 'jatkuva' (elää pitkään, ei arkistointia).
-- hytti_rivit = kortin sisältörivit — joko pelkkä muistiinpano tai tehtävä
-- (is_task=true, jolloin done/due_date käytössä). is_header toimii kuten
-- tuotteet.is_header (rivi joka alkaa #:llä listan lisäyskentässä).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table hytti_kortit (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  card_type text not null check (card_type in ('paattyva', 'jatkuva')),
  status text not null default 'aktiivinen' check (status in ('aktiivinen', 'arkistoitu')),
  seuraava_askel text,
  sort_order double precision not null default extract(epoch from clock_timestamp()),
  created_at timestamptz not null default now()
);

create table hytti_rivit (
  id bigint generated always as identity primary key,
  kortti_id bigint not null references hytti_kortit(id) on delete cascade,
  content text not null,
  is_header boolean not null default false,
  is_task boolean not null default false,
  done boolean not null default false,
  done_at timestamptz,
  due_date date,
  sort_order double precision not null default extract(epoch from clock_timestamp()),
  created_at timestamptz not null default now()
);

alter table hytti_kortit enable row level security;
alter table hytti_rivit enable row level security;

create policy "hytti_kortit_all" on hytti_kortit for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- rivit eivät kanna omaa owner_id:tä — omistajuus tulee aina kortin kautta
create policy "hytti_rivit_all" on hytti_rivit for all
  using (exists (select 1 from hytti_kortit k where k.id = hytti_rivit.kortti_id and k.owner_id = auth.uid()))
  with check (exists (select 1 from hytti_kortit k where k.id = hytti_rivit.kortti_id and k.owner_id = auth.uid()));

commit;
