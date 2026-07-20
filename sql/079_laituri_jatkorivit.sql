-- Murun säie (2026-07-20/21, ks. muistiinpanot.md "Murun säie" / KONSEPTIKIRJA.md
-- 4.10 jatko) — keskeneräisen keskustelun muisti: murulle voi lisätä
-- JATKORIVEJÄ ("Jatka säiettä" ⋯-valikosta), vapaa teksti + automaattinen
-- aikaleima, kertyvät murun alle aikajärjestyksessä. EI muokkausta olemassa
-- oleville riveille (turvainvariantti, sama henki kuin muualla Laiturissa) —
-- ainoa toiminto on lisäys, rivejä ei koskaan päivitetä tai poisteta yksitellen
-- (koko säie poistuu automaattisesti vain jos ITSE MURU poistetaan, ks. cascade).
--
-- muru_id: viittaus laituri-tauluun, ei erillistä user_id-saraketta —
-- Laituri on jaettu (ei henkilökohtainen, ks. sql/004), joten sama RLS-
-- avoimuus kuin itse laituri-taulussa riittää tälläkin (kumpi tahansa
-- kirjautunut saa lisätä/lukea säikeen jatkorivit, sama periaate kuin
-- hytti_rivit-taulun "omistajuus tulee aina parentin kautta" -mallissa,
-- ks. sql/016 — täällä vain parentin oma policy on jo alusta asti avoin
-- eikä omistajarajoitteinen).
--
-- heratys_pvm (date, nullable): jos asetettu, sovellus (script.js) luo
-- SAMALLA HETKELLÄ tavallisen ankkurit-ehdokasrivin jonka visible_from
-- vastaa tätä päivää — EI UUTTA MEKANISMIA, sama olemassa oleva
-- visible_from-koneisto jota jo käyttävät ⏭-siirto (sql/056) ja "hetki"-
-- ehdokkaan viivästetty näkyvyys (sql/067, laskeHetkiNakyvyys()). Tämä
-- taulu itsessään ei siis "herätä" mitään suoraan — se on vain säikeen oma
-- muisti siitä että herätys on pyydetty, ankkurit-taulun oma candidate-rivi
-- on se joka oikeasti nousee esiin.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists laituri_jatkorivit (
  id bigint generated always as identity primary key,
  muru_id bigint not null references laituri(id) on delete cascade,
  teksti text not null,
  created_at timestamptz not null default now(),
  heratys_pvm date
);

alter table laituri_jatkorivit enable row level security;

create policy "laituri_jatkorivit_all" on laituri_jatkorivit for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

commit;
