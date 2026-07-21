-- Opintopolku VAIHE 2 (2026-07-21, ks. KONSEPTIKIRJA.md 4.11 — sama huomio
-- kuin sql/083: 4.11 puuttuu edelleen repon konseptikirjasta, rakennettu
-- Katrin chat-pyynnön verbatim-spesifikaatiosta, ks. muistiinpanot.md
-- "Opintopolku VAIHE 2" täydelle kuvaukselle).
--
-- Kolmen voiman moottori: PUHDAS LASKENTA (ei älykutsua) joka punnitsee
-- DEADLINEA + PACER-järjestystä + päivän KUORMAA valitakseen 1-2 aihetta
-- tälle päivälle. Laskenta on TALLENNETTU (opinto_paivan_askeleet), ei
-- laskettu uudelleen joka latauksella — sama "claim/tallenna kerran"
-- -periaate kuin muillakin idempotenteilla cron-/kertalaskuilla tässä
-- projektissa (vrt. Toistuvan muistutuksen remind_at-CAS).
--
-- opinto_aiheet-laajennus spaced repetitionille:
--   sr_interval_index: monesko kertausväli menossa (0 = ei vielä SR-kierrossa).
--   sr_next_review: seuraava kertaushetki (VAIN retrieval-vaiheen aiheille
--     merkityksellinen — moottori ei ehdota retrieval-kertausta ennen tätä
--     päivää, "PACER jäsentää" -periaate kertaustiheydelle).
--
-- opinto_paivan_askeleet: yksi rivi = yksi moottorin tarjoama askel yhdelle
-- päivälle. tila 'tarjolla' (odottaa), 'tehty' (kuitattu, PACER+SR etenivät),
-- 'ohitettu' ("en ehtinyt", EI etene mihinkään, ei rangaistusta — sama
-- periaate kuin toistuvan muistutuksen kuittaamaton kerta ei estä seuraavaa).
-- UNIQUE(owner_id, aihe_id, pvm) estää saman aiheen tuplavalinnan samalle
-- päivälle — idempotenssin toinen puolisko (ensimmäinen on sovellustason
-- "onko tälle päivälle jo rivejä" -tarkistus ennen laskentaa, ks. script.js).
--
-- Aja tämä Supabasen SQL Editorissa sql/083:n jälkeen.

begin;

alter table opinto_aiheet add column if not exists sr_interval_index int not null default 0;
alter table opinto_aiheet add column if not exists sr_next_review date;

create table if not exists opinto_paivan_askeleet (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  aihe_id bigint not null references opinto_aiheet(id) on delete cascade,
  pvm date not null,
  tila text not null default 'tarjolla' check (tila in ('tarjolla', 'tehty', 'ohitettu')),
  created_at timestamptz not null default now(),
  unique (owner_id, aihe_id, pvm)
);

alter table opinto_paivan_askeleet enable row level security;

drop policy if exists "opinto_paivan_askeleet_all" on opinto_paivan_askeleet;
create policy "opinto_paivan_askeleet_all" on opinto_paivan_askeleet for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

commit;
