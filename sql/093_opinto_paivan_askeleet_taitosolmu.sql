-- opinto_paivan_askeleet saa kolmannen valinnaisen vanhemman: taitosolmu_id
-- (2026-08-04, ks. sql/092, muistiinpanot.md "Taitosolmut"). Sama moottori
-- (script.js:laskeOpintoPaivanAskeleet, kolmen voiman: deadline+PACER+Kuorma)
-- laajenee valitsemaan tämän päivän 1-2 askelta SEKÄ opinto_aiheet- ETTÄ
-- taitosolmut-kandidaateista samassa ajossa — EI rakenneta rinnakkaista
-- moottoria, sama tarkalleen-yksi-vanhempi-malli kuin opinto_deadlinet
-- (sql/083) jo käyttää kurssi/aihe-parille, nyt sama kolmella vaihtoehdolla.
--
-- Aja tämä Supabasen SQL Editorissa sql/092:n jälkeen.

begin;

alter table opinto_paivan_askeleet alter column aihe_id drop not null;
alter table opinto_paivan_askeleet add column if not exists taitosolmu_id bigint references taitosolmut(id) on delete cascade;

alter table opinto_paivan_askeleet drop constraint if exists opinto_paivan_askeleet_tasmalleen_yksi;
alter table opinto_paivan_askeleet add constraint opinto_paivan_askeleet_tasmalleen_yksi check (
  ((aihe_id is not null)::int + (taitosolmu_id is not null)::int) = 1
);

-- Uniikkirajoite aihe_id:lle on jo olemassa (unique (owner_id, aihe_id, pvm),
-- sql/085) — NULL-arvot eivät törmää keskenään Postgresissa, joten se sallii
-- jo useita taitosolmu-rivejä (joilla aihe_id on NULL) samalle päivälle ilman
-- muutosta. Sama vastinpari taitosolmu_id:lle idempotenssin varmistamiseksi.
create unique index if not exists opinto_paivan_askeleet_taitosolmu_pvm_uniikki
  on opinto_paivan_askeleet (owner_id, taitosolmu_id, pvm);

commit;
