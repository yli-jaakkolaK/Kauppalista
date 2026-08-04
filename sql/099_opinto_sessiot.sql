-- Session-loki todellisen aktiivisen työajan mittaamiseen (2026-08-05, ks.
-- muistiinpanot.md "Session-loki"). Katrin oma korjaus alkuperäiseen
-- ehdotukseeni (kalenteripäivien erotus aloitus/valmistumishetken välillä):
-- kalenteripäivät sekoittavat "kuinka iso osio oli" ja "kuinka moneen
-- päivään elämä sen venytti" — ▶ Aloita/⏸ Lopeta -täppäpari mittaa oikeaa
-- asiaa. Yksi rivi per aloita/lopeta-kerta, EI kahta aikaleimaa taito-
-- solmuissa/aiheissa — istunnot kertyvät samalle solmulle/aiheelle usealta
-- päivältä, ja PACER-vaihe napataan AUTOMAATTISESTI istunnon alkaessa
-- (kohteen oma `vaihe`-kenttä sillä hetkellä) jotta esim. encoding-työn
-- todellinen kesto erottuu priming-työstä kalibrointia varten myöhemmin.
--
-- Kaksoisvanhempi (aihe_id/taitosolmu_id, tarkalleen yksi) — SAMA malli kuin
-- opinto_paivan_askeleet (sql/093) ja opinto_deadlinet (sql/083). Katrin
-- päätös: koskee sekä uusia taitosolmuja ETTÄ vanhoja opinto_aiheita, ei vain
-- toista.
--
-- loppui_at NULL = istunto kesken (sovellus suljettu/puhelin lukossa kesken
-- session — ei erillistä "unohdettu"-tilaa, VAIN yksi rivi per käyttäjä voi
-- olla kerrallaan auki, sovelluskoodi tarkistaa tämän ennen uuden aloitusta).
--
-- sessio_jarkevyys_tunnit: kynnys jonka ylittävä istunto kysyy lopettaessa
-- "kesti oikeasti näin kauan, vai unohtuiko täppä?" — EI estä tallennusta,
-- vain kysyy (Katrin oma rajaus).
--
-- Aja tämä Supabasen SQL Editorissa sql/092/097:n jälkeen.

begin;

create table if not exists opinto_sessiot (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  aihe_id bigint references opinto_aiheet(id) on delete cascade,
  taitosolmu_id bigint references taitosolmut(id) on delete cascade,
  vaihe text not null check (vaihe in ('priming', 'encoding', 'retrieval', 'reference', 'yllapito')),
  alkoi_at timestamptz not null default now(),
  loppui_at timestamptz,
  constraint opinto_sessiot_tasmalleen_yksi check (
    ((aihe_id is not null)::int + (taitosolmu_id is not null)::int) = 1
  )
);

create index if not exists opinto_sessiot_aihe_idx on opinto_sessiot (aihe_id);
create index if not exists opinto_sessiot_taitosolmu_idx on opinto_sessiot (taitosolmu_id);
-- Yksi kesken oleva istunto per käyttäjä kerrallaan (osittainen uniikki-
-- indeksi vain loppui_at is null -riveille) — sovelluskoodi tarkistaa tämän
-- ennen uuden aloitusta, mutta indeksi tekee siitä myös tietokantatasolla
-- mahdotonta jos kaksi välilehteä yrittäisi samaan aikaan.
create unique index if not exists opinto_sessiot_yksi_kesken_per_kayttaja
  on opinto_sessiot (owner_id) where loppui_at is null;

alter table opinto_sessiot enable row level security;

drop policy if exists "opinto_sessiot_all" on opinto_sessiot;
create policy "opinto_sessiot_all" on opinto_sessiot for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

insert into asetukset (key, value) values
  ('sessio_jarkevyys_tunnit', '3')
on conflict (key) do nothing;

commit;
