-- Lokin tietokohde (2026-08-11, CODE_vaihe1b.md §8b) — EI Loki-välilehteä,
-- EI editoria, EI selattavaa näkymää (ne pysyvät Vaihe 5:ssä,
-- HYTTI_SPEKSI.md §6b, muuttumattomina). VAIN yksityinen tietokannan
-- landing-paikka: sisältö vain kertyy tähän, ei omaa käyttöliittymää vielä.
--
-- Syy: Ruori-speksin §4.5 mukaan etusivulta lisätty ankkuri (source='etusivu')
-- ei voi laskeutua Laituriin (jaettu näkymä, Juha näkisi sen — yksityisyys-
-- kysymys, ei makuasia) eikä sillä ollut mitään muuta kotia, joten lasku-
-- toiminto jätettiin pois käytöstä (ks. script.js:n irrotaNappi-käsittelijä,
-- kommentoitu "Odottaa Hytin Loki-välilehteä"). Tämä taulu on se koti — ei
-- Loki-välilehti itse, vain sen ensimmäinen, minimaalinen tietokerros.
--
-- Sama täysin yksityinen, owner_id-suodatettu RLS-malli kuin hytti_kortit
-- (sql/016) — ei jakokytkintä, ei shared-haaraa.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table loki_merkinnat (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table loki_merkinnat enable row level security;

create policy "loki_merkinnat_all" on loki_merkinnat for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

commit;
