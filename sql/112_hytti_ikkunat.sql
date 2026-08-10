-- Hytin viikkopohjaiset ikkunat (2026-08-10, ks. HYTTI_SPEKSI.md §4.5/§4.5b,
-- Vaihe 1a §6) — kaksi taulua, sama malli kuin lapsi_viikkopohja (sql/105):
-- viikonpaiva 0=su...6=la (JS:n Date.getDay()-numerointi, sama kuin
-- lapsi_viikkopohjassa — ei muunneta toiseen numerointiin).
--
-- hytti_suljetut_ikkunat: "generaattorin rajoite, ei käyttöliittymän
-- elementti" (§4.5) — ei renderöidä päivänäkymään, vaikuttaa vain
-- generaattoriin (Vaihe 3, ei vielä olemassa). Useampi ikkuna per viikonpäivä
-- sallittu (esim. aamurutiini + iltahaku eri aikoihin), siksi EI unique-
-- rajoitetta viikonpaivalle.
--
-- hytti_opiskeluaika: yksi ikkuna per viikonpäivä (oletus 09:00-15:30 jos
-- rivi puuttuu — sovelletaan koodissa, ei kannassa, koska "ei mitään
-- säädetty" pitää voida erottaa "säädetty tyhjäksi"-tapauksesta myöhemmin).
--
-- Molemmat owner_id-scopettuja SAMALLA "vain omistaja näkee" -periaatteella
-- kuin muu Hytti (ks. sql/016 hytti_kortit) — EI jaettu perheen data kuten
-- lapset/henkselit, koska nämä ovat Katrin oman opiskeluajan asetuksia.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists hytti_suljetut_ikkunat (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  viikonpaiva int not null check (viikonpaiva between 0 and 6),
  alkaa time not null,
  paattyy time not null,
  syy text,
  created_at timestamptz not null default now(),
  constraint hytti_suljetut_ikkunat_jarjestys check (alkaa < paattyy)
);
create index if not exists hytti_suljetut_ikkunat_owner_idx on hytti_suljetut_ikkunat (owner_id);

create table if not exists hytti_opiskeluaika (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  viikonpaiva int not null check (viikonpaiva between 0 and 6),
  alkaa time not null,
  paattyy time not null,
  unique (owner_id, viikonpaiva),
  constraint hytti_opiskeluaika_jarjestys check (alkaa < paattyy)
);

alter table hytti_suljetut_ikkunat enable row level security;
alter table hytti_opiskeluaika enable row level security;

create policy "hytti_suljetut_ikkunat_all" on hytti_suljetut_ikkunat for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "hytti_opiskeluaika_all" on hytti_opiskeluaika for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

commit;
