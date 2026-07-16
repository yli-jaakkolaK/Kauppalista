-- Ristiriitapaketti, kohta 1: "Keskusteltu"-lippu (2026-07-17, ks.
-- muistiinpanot.md "Ristiriitapaketti"). Kuittaa PÄIVÄ+TAPAHTUMAJOUKKO-
-- kohtaisesti että kahden ERI henkilön (tai saman syötteen) päällekkäiset
-- menot on keskusteltu — EI poista tapahtumia eikä ristiriitaa, vain
-- rauhoittaa merkin siihen asti kunnes päivälle ilmestyy UUSI, eri
-- tapahtumajoukolla oleva päällekkäisyys (ks. script.js:n ristiriitaAvain()).
--
-- tapahtuma_avaimet: järjestetty, pilkuin eroteltu lista niiden
-- kalenteri_tapahtumat.id-arvojen jotka osallistuivat KUITTAUSHETKEN
-- 'full'-tason ristiriitaan tälle päivälle (ks. analysoiPaivanRistiriidat()
-- script.js:ssä) — TARKKA allekirjoitus, ei pelkkä päivä, jottei kuittaus
-- peitä myöhemmin ilmestyvää eri tapahtumaparin ristiriitaa.
--
-- Kumpi tahansa perheenjäsen voi kuitata ja nähdä toisen kuittaukset —
-- tämä on jaettua perhetietoa (kalenterin ristiriita), ei henkilökohtaista,
-- joten select/insert ovat avoimia kaikille kirjautuneille (sama malli kuin
-- kalenteri_kuittaukset-taululla). Ei update/delete-policya — kuittaus on
-- pysyvä loki, ei muokattavissa (jos tarve ilmenee myöhemmin, lisätään
-- omana migraationaan).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists kalenteri_ristiriita_kuittaukset (
  id bigint generated always as identity primary key,
  event_date date not null,
  tapahtuma_avaimet text not null,
  acked_by uuid not null references auth.users(id),
  acked_at timestamptz not null default now(),
  unique (event_date, tapahtuma_avaimet)
);

alter table kalenteri_ristiriita_kuittaukset enable row level security;

drop policy if exists "kalenteri_ristiriita_kuittaukset_select" on kalenteri_ristiriita_kuittaukset;
drop policy if exists "kalenteri_ristiriita_kuittaukset_insert" on kalenteri_ristiriita_kuittaukset;

create policy "kalenteri_ristiriita_kuittaukset_select" on kalenteri_ristiriita_kuittaukset
  for select using (auth.uid() is not null);

create policy "kalenteri_ristiriita_kuittaukset_insert" on kalenteri_ristiriita_kuittaukset
  for insert with check (acked_by = auth.uid());

-- Realtime (ks. sql/034_realtime_huomiopallurat.sql samalle mallille) —
-- jotta molemmat käyttäjät näkevät kuittauksen heti ilman sivun päivitystä.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'kalenteri_ristiriita_kuittaukset'
  ) then
    execute 'alter publication supabase_realtime add table public.kalenteri_ristiriita_kuittaukset';
  end if;
end $$;

commit;
