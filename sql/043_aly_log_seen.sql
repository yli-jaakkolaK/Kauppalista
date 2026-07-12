-- E3-keskiportaan V1 — Asetukset-laatan huomiopallura "Mitä äly on tehnyt"
-- -lokille. Sama malli kuin laituri_nahty (sql/040): per-käyttäjä
-- "viimeksi nähty" -aikaleima, EI laitekohtainen localStorage — kevyin
-- kestävä ratkaisu, säilyy PWA:n uudelleenasennuksen yli.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists aly_log_seen (
  user_id uuid primary key references auth.users(id),
  last_seen timestamptz not null default now()
);

alter table aly_log_seen enable row level security;

drop policy if exists "aly_log_seen_select" on aly_log_seen;
create policy "aly_log_seen_select" on aly_log_seen for select using (user_id = auth.uid());

drop policy if exists "aly_log_seen_insert" on aly_log_seen;
create policy "aly_log_seen_insert" on aly_log_seen for insert with check (user_id = auth.uid());

drop policy if exists "aly_log_seen_update" on aly_log_seen;
create policy "aly_log_seen_update" on aly_log_seen for update using (user_id = auth.uid()) with check (user_id = auth.uid());

commit;
