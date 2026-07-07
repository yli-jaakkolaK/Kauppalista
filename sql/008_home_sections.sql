-- Etusivun navigointiruudukko (2x3) data-ohjatusti: nimi, ikoni, reitti ja
-- järjestys taulussa, ei kovakoodattuina HTML-lohkoina. sort_order mahdollistaa
-- myöhemmän raahausjärjestyksen samalla periaatteella kuin tuotteet-taulussa.
--
-- Ankkurit ja Horisontissa EIVÄT ole tässä taulussa — ne ovat etusivun omia
-- kiinteitä sisältölohkoja (näyttävät dataa, eivät ole linkkejä), eivät
-- navigointiruudukon osia. "Listat" pysyy toistaiseksi suoraan etusivulla.
--
-- Vain "laituri" on tällä hetkellä toiminnallinen; loput näkyvät "tulossa
-- pian" -paikanpitäjinä kunnes ne rakennetaan.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table home_sections (
  id bigint generated always as identity primary key,
  key text not null unique,
  name text not null,
  icon text not null,
  route text not null,
  enabled boolean not null default true,
  sort_order double precision not null
);

alter table home_sections enable row level security;

create policy "home_sections_select" on home_sections for select using (auth.uid() is not null);
create policy "home_sections_insert" on home_sections for insert with check (auth.uid() is not null);
create policy "home_sections_update" on home_sections for update using (auth.uid() is not null);
create policy "home_sections_delete" on home_sections for delete using (auth.uid() is not null);

-- 2x3-ruudukon täyttöjärjestys (vasemmalta oikealle, riviltä riville):
-- Laituri | Muistilaput
-- Varasto | Oma Hytti
-- Kalenteri | Asetukset
insert into home_sections (key, name, icon, route, enabled, sort_order) values
  ('laituri', 'Laituri', '🛟', 'laituri', true, 1),
  ('muistilaput', 'Muistilaput', '🗒️', 'muistilaput', true, 2),
  ('varasto', 'Varasto', '📦', 'varasto', true, 3),
  ('hytti', 'Oma Hytti', '🚪', 'hytti', true, 4),
  ('kalenteri', 'Kalenteri', '🗓️', 'kalenteri', true, 5),
  ('asetukset', 'Asetukset', '⚙️', 'asetukset', true, 6);

commit;
