-- Tiedostoliitteet Laituriin (2026-08-11, CODE_vaihe1b.md §3) — sama
-- "jokainen muru mahdollisesti liitetiedosto" -periaate kuin tekstillä,
-- ei rinnakkaista tallennusmallia. Yksi tiedosto tallennetaan KERRAN
-- KOKONAISENA (sung-metodi.md §8) — ei pilkota.
--
-- laituri_tiedostot: metatieto + poimittu teksti (AI-luokittelua varten,
-- ks. api/laituri-tiedosto.js). Suhde muru<->tiedosto on 1:1 TÄSSÄ
-- TAULUSSA (yksi rivi per ladattu tiedosto, oma laituri-rivinsä), mutta
-- suhde tiedosto<->SOLMU on monta moneen ja hoidetaan ERI taulussa vasta
-- kun käyttäjä hyväksyy poimintaehdotuksen (sama malli kuin tekstillä jo
-- on, §3.3: "materiaali kiinnittyy solmuun vasta kun käyttäjä kuittaa").
--
-- RLS TARKOITUKSELLA sama avoimuus kuin itse laituri-taulussa (sql/004:
-- "auth.uid() is not null", EI owner_id-rajoitusta) — Laituri on jaettu
-- näkymä, ja §3.3 vaatii että tiedostot noudattavat SAMAA
-- piilota_laiturista-mekanismia/näkyvyyttä kuin tekstimurut. Yksityisyys
-- ei tule tästä taulusta vaan siitä että tiedosto lakkaa näkymästä
-- Laiturissa piilota_laiturista=true:n jälkeen, sama kuin tekstillä.
--
-- Storage-bucket "materiaali": yksityinen (public=false), pääsy vain
-- kirjautuneelle käyttäjälle policyjen kautta (sama avoimuusperiaate kuin
-- yllä — kumpi tahansa kirjautunut saa lukea/kirjoittaa, koska Laituri on
-- jaettu). Jos bucketin luonti SQL Editorista epäonnistuu (joissain
-- Supabase-projekteissa storage.buckets vaatii Dashboardin kautta luonnin),
-- luo bucket "materiaali" käsin Dashboardista (Storage -> New bucket,
-- Public OFF) ja aja tästä tiedostosta vain policy-osuus.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists laituri_tiedostot (
  id bigint generated always as identity primary key,
  muru_id bigint not null references laituri(id) on delete cascade,
  tiedostonimi text not null,
  storage_polku text not null,
  mime_tyyppi text not null,
  koko_tavua bigint not null,
  poimittu_teksti text,
  created_at timestamptz not null default now()
);

alter table laituri_tiedostot enable row level security;

create policy "laituri_tiedostot_all" on laituri_tiedostot for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

insert into storage.buckets (id, name, public)
values ('materiaali', 'materiaali', false)
on conflict (id) do nothing;

create policy "materiaali_select" on storage.objects for select
  using (bucket_id = 'materiaali' and auth.uid() is not null);
create policy "materiaali_insert" on storage.objects for insert
  with check (bucket_id = 'materiaali' and auth.uid() is not null);
create policy "materiaali_delete" on storage.objects for delete
  using (bucket_id = 'materiaali' and auth.uid() is not null);

commit;
