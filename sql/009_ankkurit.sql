-- Ankkurit: päivän kolme tärkeintä. Kevyt oma taulu, ei vielä täyttä
-- Tehtävät-järjestelmää (tulee vaiheessa 2). source/source_ref valmiina
-- tulevaa automaattista poimintaa varten (Wilma-sähköposti, kalenteri, ym,
-- vaihe 3 / Siri-äly) — nyt käytössä vain source='manual'.
--
-- Aina näytä 3 tekemätöntä tärkeysjärjestyksessä; kun yksi merkitään tehdyksi,
-- seuraava nousee automaattisesti näkyviin koska kysely suodattaa done=false.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table ankkurit (
  id bigint generated always as identity primary key,
  content text not null,
  done boolean not null default false,
  sort_order double precision not null default extract(epoch from clock_timestamp()),
  source text not null default 'manual',
  source_ref text,
  user_id uuid,
  created_at timestamptz not null default now(),
  done_at timestamptz
);

alter table ankkurit enable row level security;

create policy "ankkurit_all" on ankkurit for all using (auth.uid() is not null);

commit;
