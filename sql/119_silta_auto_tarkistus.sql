-- Siltasolmujen aikapohjainen eskalaatio (2026-08-16, Katrin pyyntö):
-- "ei tarvita AI-kutsua joka kerta, kysy aina kun uusi kurssi lisätään, jos
-- ei silti tehty viikossa (muokattavissa) niin yksi automaattinen AI-kutsu
-- joka kattaa kaikki tähän mennessä tuodut kurssit". Sama "äly ehdottaa,
-- ihminen kuittaa" -periaate koskee TÄTÄKIN — automaattinen ajo vain
-- TÄYTTÄÄ tämän taulun ehdotuksilla, EI KOSKAAN kirjoita taitosolmuja
-- suoraan. Katri hyväksyy rivi kerrallaan samalla esikatseludialogilla kuin
-- manuaalisessakin haussa (script.js naytaSiltaEhdotukset()).
--
-- Ei uutta Vercel-funktiota (12 funktion Hobby-katto täynnä, ks.
-- muistiinpanot.md "Deploy-pipeline korjattu") — logiikka lisätään
-- OLEMASSA OLEVAAN api/aly-nightly.js:ään, joka jo pyörii 5 min välein ja
-- portittaa oman raskaan työnsä asetukset-tauluun tallennetulla
-- viimeisimmällä ajolla + atomisella compare-and-swap-väitöllä (sama malli
-- kopioidaan tälle, eri asetukset-avaimilla, jotta kaksi ominaisuutta eivät
-- jaa samaa porttia/kilpaehtoa).
--
-- asetukset-avaimet (data ei koodia -periaate, muokattavissa Table
-- Editorista ilman koodimuutosta):
--   sillat_auto_paivia        — kuinka monta päivää odotetaan käsin tehtyä
--                                tarkistusta ennen automaattista ajoa (oletus 7).
--   sillat_viimeisin_tarkistus — ISO-aikaleima, päivittyy sekä käsin tehdystä
--                                (script.js etsiSiltoja()) että automaattisesta
--                                ajosta — kumpikin nollaa saman kellon, koska
--                                molemmat todella "tarkistivat sillat".
--                                Alustetaan NYT (ei koskaan-arvoon) jotta
--                                ensimmäinen automaattiajo ei laukea heti
--                                seuraavana yönä — Katri tekee tämän viikon
--                                tarkistuksen todennäköisesti käsin nyt kun
--                                scroll-bugi on korjattu.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

insert into asetukset (key, value) values ('sillat_auto_paivia', '7')
  on conflict (key) do nothing;
insert into asetukset (key, value) values ('sillat_viimeisin_tarkistus', now()::text)
  on conflict (key) do nothing;

-- Automaattiajon TULOS odottaa täällä käsin hyväksyntää — sama rakenne kuin
-- naytaSiltaEhdotukset()-funktion parametrit (script.js), tallennettu jsonb-
-- snapshotina jotta esikatseludialogi voidaan avata myöhemmin ilman uutta
-- AI-kutsua tai uutta kurssi-/aihehakua.
create table if not exists silta_ehdotukset_odottavat (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  ehdotukset jsonb not null,
  aihe_kartta jsonb not null,
  kurssi_kartta jsonb not null,
  created_at timestamptz not null default now()
);

alter table silta_ehdotukset_odottavat enable row level security;

drop policy if exists "silta_ehdotukset_odottavat_all" on silta_ehdotukset_odottavat;
create policy "silta_ehdotukset_odottavat_all" on silta_ehdotukset_odottavat for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

commit;
