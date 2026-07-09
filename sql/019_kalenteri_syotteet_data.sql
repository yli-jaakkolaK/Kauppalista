-- Syöterivit Katrin iCloud-tilin kalentereille. Ilman tätä kalenteri_syotteet
-- on tyhjä ja /api/caldav-sync ei tiedä mitä hakea (koodi on kunnossa, data
-- puuttui — tästä syystä tämä on OMA migraationsa, ei irtokomento SQL
-- Editoriin: kaikki syöte-/siemendata kuuluu versioituna tähän kansioon,
-- ei koskaan käsin ajettuna ohi git-historian).
--
-- Nimet ('Perhekalenteri','Juha','Katri') on selvitetty etukäteen
-- /api/caldav-sync?listaa=katri -diagnostiikalla — tunniste-sarake täsmää
-- niihin kirjain kirjaimelta. mode='taysi' = kaikki tapahtumat menevät
-- ensin hyväksyntäjonoon (kalenteri_odottavat), ei suoraan agendaan.
--
-- VAATII: sql/017_kalenteri_tilit.sql AJETTU ENSIN (luo account_key-sarakkeen
-- jota tämä migraatio käyttää) — muuten tämä epäonnistuu virheellä
-- "column account_key does not exist".
--
-- Idempotentti: uniikki-rajoite (tunniste, account_key) + on conflict do
-- nothing, jotta tämän voi ajaa uudelleenkin vahingossa aiheuttamatta tuplia.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table kalenteri_syotteet
  add constraint kalenteri_syotteet_tunniste_tili_uniikki unique (tunniste, account_key);

insert into kalenteri_syotteet (name, tyyppi, tunniste, mode, account_key, enabled) values
  ('Perhekalenteri', 'icloud', 'Perhekalenteri', 'taysi', 'katri', true),
  ('Juha', 'icloud', 'Juha', 'taysi', 'katri', true),
  ('Katri', 'icloud', 'Katri', 'taysi', 'katri', true)
on conflict (tunniste, account_key) do nothing;

commit;
