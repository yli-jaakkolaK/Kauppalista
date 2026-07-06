-- Satama vaihe 1: listat, list_members, tapahtumaloki (events)
-- Aja tämä Supabasen SQL Editorissa. RLS jätetään tarkoituksella pois päältä.

begin;

create table lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'checklist',
  owner_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table lists disable row level security;

create table list_members (
  list_id uuid not null references lists(id),
  user_id uuid not null references auth.users(id),
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (list_id, user_id)
);
alter table list_members disable row level security;

create table events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid,
  action text not null,
  target_type text not null,
  target_id text,
  target_name text,
  list_id uuid references lists(id),
  duration_seconds int
);
alter table events disable row level security;

insert into lists (name, type) values ('Kauppalista', 'checklist');

alter table tuotteet add column list_id uuid references lists(id);

update tuotteet
set list_id = (select id from lists where name = 'Kauppalista')
where list_id is null;

commit;
