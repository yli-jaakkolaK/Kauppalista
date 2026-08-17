-- Opiskelumoottori OSA A1+A3 (rakennusjärjestys-dokumentti 17.8.2026) —
-- uudet kentät kurssille ja solmulle. Ei muuteta olemassa olevia sarakkeita,
-- kaikki lisäyksinä (migraation ja käsin lisätyn solmun pitää olla
-- samanarvoisia, A3:n oma reunaehto — lisäys ei koske jo aloitettua dataa).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

-- A1: kurssin tavoite/hoitotaso/aikataulu/laajuus.
alter table opinto_kurssit add column if not exists tavoite text
  check (tavoite in ('lapaisy', 'kunnollinen_osaaminen', 'perusta_jatkolle'));
alter table opinto_kurssit add column if not exists hoitotaso text not null default 'taysi'
  check (hoitotaso in ('taysi', 'kevyt', 'vain_deadlinet'));
alter table opinto_kurssit add column if not exists op_maara numeric;
-- Oma aikataulu (aihe/viikko-ohjelma) — jsonb koska rakenne on vapaamuotoinen
-- kurssikohtainen lista (esim. [{"viikko":1,"aihe":"Luku 1-2"}, ...]), ei
-- kiinteä sarakejoukko. NULL = ei omaa aikataulua, solmut jaetaan tasan
-- jäljellä oleville viikoille (moottorin oletuskäytös, ei erillinen lippu).
alter table opinto_kurssit add column if not exists aikataulu jsonb;

-- A3: solmun uudet kentät.
alter table opinto_aiheet add column if not exists tuntemus int check (tuntemus between 0 and 4);
alter table opinto_aiheet add column if not exists perustussolmu boolean not null default false;
alter table opinto_aiheet add column if not exists retrieval_kierrokset int not null default 0;
alter table opinto_aiheet add column if not exists retrieval_tavoite int not null default 3;
alter table opinto_aiheet add column if not exists priming_kysymykset text;
-- Priming/Reference ovat käyttäjän itse täppäämiä (sung-metodi.md §7:
-- "Priming: ohjeen askeleet tehtynä [A]" / "Reference: käyttäjä täppää
-- itse") — encoding/retrieval-valmius PÄÄTELLÄÄN (encoding: pero_vaihe on
-- ohittanut encodingin; retrieval: retrieval_kierrokset >= retrieval_tavoite),
-- ei omaa boolean-kenttää tarvita niille.
alter table opinto_aiheet add column if not exists priming_tehty boolean not null default false;
alter table opinto_aiheet add column if not exists reference_tehty boolean not null default false;

-- A3 tekninen reunaehto: tyypin vaihdos merkitään muistiin (sung-metodi.md
-- §2: "toistuvat vaihdokset kertovat että luokittelukehote kaipaa
-- korjausta"). Kevyt loki, ei oma taulu — riittää yksinkertainen jsonb-lista
-- {pvm, vanha, uusi} kerryttäen, koska tarkoitus on VAIN havaita toistuvuus,
-- ei rakentaa raportointinäkymää tässä erässä.
alter table opinto_aiheet add column if not exists pacer_vaihdot jsonb not null default '[]'::jsonb;

commit;
