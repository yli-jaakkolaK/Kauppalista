-- Siltasolmun viittaukset lähdekursseihin (2026-08-05, ks. muistiinpanot.md
-- "Siltasolmut"). Puuttunut linkki taitosolmusta takaisin niihin
-- opinto_aiheet-riveihin jotka siihen viittaavat — taito_kaaret (sql/092)
-- yhdistää vain taitosolmu↔taitosolmu, ei taitosolmu↔aihe. Tästä lasketaan
-- sillan ikkuna (aukeaa kun viittaava aihe koskettaa käsitettä, sulkeutuu
-- ennen aikaisinta viittaavien aiheiden deadlinea) — ks.
-- siltaOmaPaino/siltaPaivaaSulkeutumiseen script.js:ssä.
--
-- Täyttyy AI-avusteisen siltatunnistuksen hyväksyntävaiheessa (ei koskaan
-- automaattisesti ilman käyttäjän vahvistusta) — sama "äly ehdottaa, ihminen
-- kuittaa" -periaate kuin muuallakin.
--
-- silta_puskuri_paivia: kuinka monta päivää ENNEN aikaisinta viittaavaa
-- deadlinea ikkuna sulkeutuu (arvo ehditty käyttää ennen kuin deadline
-- koittaa). silta_leviamissyvyys: kuinka monta tarvitsee-kaari-askelta
-- kiireellisyys leviää taaksepäin (ei kovakoodattu — tiheämpi graafi useamman
-- kurssin välillä voi tarvita matalamman arvon kuin harva graafi).
--
-- Aja tämä Supabasen SQL Editorissa sql/092:n jälkeen.

begin;

create table if not exists taitosolmu_viittaukset (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  taitosolmu_id bigint not null references taitosolmut(id) on delete cascade,
  aihe_id bigint not null references opinto_aiheet(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (taitosolmu_id, aihe_id)
);

create index if not exists taitosolmu_viittaukset_solmu_idx on taitosolmu_viittaukset (taitosolmu_id);
create index if not exists taitosolmu_viittaukset_aihe_idx on taitosolmu_viittaukset (aihe_id);

alter table taitosolmu_viittaukset enable row level security;

drop policy if exists "taitosolmu_viittaukset_all" on taitosolmu_viittaukset;
create policy "taitosolmu_viittaukset_all" on taitosolmu_viittaukset for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

insert into asetukset (key, value) values
  ('silta_puskuri_paivia', '7'),
  ('silta_leviamissyvyys', '2')
on conflict (key) do nothing;

commit;
