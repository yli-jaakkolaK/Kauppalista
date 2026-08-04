-- Taitosolmut + taito_kaaret (2026-08-04, ks. muistiinpanot.md "Taitosolmut"
-- -osio täydelle keskustelulle). Tuo koodauskurssin ja matikkaradan Hyttiin
-- GRAAFINA, ei litteänä listana — opinto_aiheet (sql/083) ei riitä koska
-- näissä kahdessa listassa on aitoja solmujen välisiä riippuvuuksia
-- (koodausprojekti tarvitsee kymmeniä aiempia taitoja) ja risteäviä
-- käsitteitä (esim. "Functions" yhdistää eksponentit/logaritmit/trigonometrian)
-- joita kurssi→aihe-malli ei pysty ilmaisemaan.
--
-- taitosolmut: yksi rivi = yksi pieni, kieliriippumaton käsite. `lahde` on
-- KEVYT TEKSTIKENTTÄ (esim. "Intro to Programming, osa 1.3") — EI erillistä
-- "kurssin osa" -taulua, sama Taso 1 -rajaus kuin opinto_kurssit.materiaali
-- ("älä rakenna raskasta rakennetta"). `vaihe` on sama PACER-enum kuin
-- opinto_aiheet. `kasitekartta` (base64 PNG, kynä+kumi-canvas) ja
-- `kasitekartta_tekstit` (jsonb, raahattavat tekstilaatikot piirroksen päällä,
-- suhteelliset %-koordinaatit jotta sijainti pysyy oikeana puhelin/tietokone-
-- vaihdossa) — EI mitään tekoälyä/OCR:ää, käyttäjä kirjoittaa tekstin ITSE,
-- appi vain tallentaa sijainnin. `muistiinpanot` on vapaa juokseva tekstikenttä
-- (kysymykset primingissä, huomiot, ei sidottu vaiheeseen). `sr_interval_index`/
-- `sr_next_review` ovat sama spaced repetition -pari kuin opinto_aiheet
-- (sql/085) — sama moottori ajastaa taitosolmujen kertaukset identtisesti.
--
-- taito_kaaret: tyypitetty suhde kahden solmun välillä.
--   'opettaa'   — varattu tulevaa käyttöä varten (kurssin osa → käsite oli
--                 alkuperäinen määritelmä, mutta koska "kurssin osa" ei ole
--                 oma entiteettinsä tässä mallissa, tätä tyyppiä EI käytetä
--                 tuontidatassa — provenienssi hoituu `lahde`-kentällä).
--   'tarvitsee' — esitieto, PORTINVARTIJA (AND-semantiikka, ks. alla).
--   'liittyy'   — löyhä yhdistävä suhde (esim. "Functions"-risteyssolmu).
--                 EI KOSKAAN moottorin valintakyselyssä, vain lukunäkymässä.
--
-- PORTTILOGIIKKA (kirjattu tähän ettei se ole yllätys sovelluskoodissa):
-- solmu on tarjottavissa moottorille vain jos KAIKKI sen 'tarvitsee'-kohteet
-- ovat vähintään encoding-vaiheessa — AND, ei OR. Solmu jolla ei ole yhtään
-- tarvitsee-kaarta on aina tarjottavissa (tyhjä joukko läpäisee automaattisesti,
-- oikea käytös juurisolmuille). Toteutus script.js:ssä, ei tässä migraatiossa.
--
-- owner_id suoraan taito_kaaret-taulussa (EI join-vartijointia kahden
-- vanhemman kautta kuten hytti_rivit) — kaarella on kaksi päätä (from/to),
-- yksinkertaisin oikea RLS on oma owner_id samalla "for all" -kaavalla kuin
-- hytti_kortit. Sovelluskoodi vastaa siitä ettei kaari koskaan yhdistä kahden
-- eri käyttäjän solmuja (sama luottamus kuin koti_kohde_id:n polymorfismissa).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists taitosolmut (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  vaihe text not null default 'priming' check (vaihe in ('priming', 'encoding', 'retrieval', 'reference', 'yllapito')),
  lahde text,
  linkki text,
  tavoiteikkuna date,
  muistiinpanot text,
  kasitekartta text,
  kasitekartta_tekstit jsonb,
  sr_interval_index int not null default 0,
  sr_next_review date,
  sort_order double precision not null default extract(epoch from clock_timestamp()),
  created_at timestamptz not null default now()
);

create table if not exists taito_kaaret (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  from_id bigint not null references taitosolmut(id) on delete cascade,
  to_id bigint not null references taitosolmut(id) on delete cascade,
  tyyppi text not null check (tyyppi in ('opettaa', 'tarvitsee', 'liittyy')),
  created_at timestamptz not null default now(),
  constraint taito_kaaret_ei_itseensa check (from_id <> to_id),
  unique (from_id, to_id, tyyppi)
);

create index if not exists taito_kaaret_from_idx on taito_kaaret (from_id);
create index if not exists taito_kaaret_to_idx on taito_kaaret (to_id);

alter table taitosolmut enable row level security;
alter table taito_kaaret enable row level security;

drop policy if exists "taitosolmut_all" on taitosolmut;
create policy "taitosolmut_all" on taitosolmut for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "taito_kaaret_all" on taito_kaaret;
create policy "taito_kaaret_all" on taito_kaaret for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

commit;
