-- TASO 2 perusta (2026-07-21, ks. KONSEPTIKIRJA.md 4.10b, muistiinpanot.md
-- "Keskusteluteema" / "Vahdittu lepo"): kaksi uutta Varasto-sivutyyppiä
-- lisätään OLEMASSA OLEVAAN `lists`-tauluun uudella `list_type`-erottimella,
-- ei uusina rinnakkaisina taulurakenteina — Varaston koko olemassa oleva
-- infra (raahausjärjestys, ✎/× -napit, sort_order, RLS-perusta) toimii
-- suoraan molemmille, vain rivin NAPAUTUS reitittää eri näkymään list_type:n
-- mukaan (ks. script.js).
--
-- list_type:
--   'normal'  — nykyinen käytös, ei muutu mitenkään (oletusarvo, kaikki
--               olemassa olevat listat pysyvät tässä backfill-rivillä).
--   'teema'   — Keskusteluteema: ei tuotteet-rivejä, säikeelliset murut
--               (laituri.teema_id, ks. alla) SIIRRETÄÄN tänne Laiturista.
--   'vahdittu' — Vahdittu lepo: tavalliset tuotteet-rivit (samat kuin
--               normaali lista), mutta jos rivi on yhä kuittaamatta
--               (tehty=false) `vahdittu_raja_paivia` päivän jälkeen
--               luonnista, cron (api/muistutukset-laheta.js) nostaa sen
--               ankkuriehdokkaaksi ("anna arjen yrittää ensin" -periaate).
--
-- sovittu_linja/sovittu_linja_pvm: VAIN 'teema'-tyypille — kiinnitetty
-- "viimeisin yhteinen päätös" erillään murujen historiasta (2b). Kun arvo
-- päivitetään, VANHA arvo kirjoitetaan uudeksi laituri-riviksi samaan
-- teemaan (script.js) ennen ylikirjoitusta — "vanha valuu historiaan",
-- ei erillistä historiataulua tarvita.
--
-- priority: VAIN 'teema'-tyypille (2d-2, "painava-vihje, ei tähti") —
-- kaksitasoinen NOSTOMEKANISMIN vihje ("tavallinen"/"painava"), EI
-- ihmiselle näkyvä pysyvä leima. Ohjaa vain luoteen (2c) ja kevyen päivän
-- ehdotuksen (2d) omaa poimintajärjestystä.
--
-- vahdittu_raja_paivia: VAIN 'vahdittu'-tyypille, oletus 14 (dataohjattu,
-- säädettävissä per lista ilman koodimuutosta).
--
-- laituri.teema_id: muru "kuuluu" teemaan kun tämä on asetettu — EI erillistä
-- kopiointia/siirtoa, pelkkä uudelleenluokittelu (sama kevyt malli kuin
-- status='sijoitettu'). "on delete cascade" tekee teeman POISTOSTA (2a:n
-- turvainvariantin ainoa hyväksytty poikkeus, "lapsen yksityisyys > arkisto")
-- todella täydellisen — murut JA niiden jatkorivit (sql/079:n oma cascade)
-- katoavat teeman mukana, ei jää orpoja.
--
-- RLS: kaksi UUTTA sallivaa policya lisätty (eivät korvaa/poista vanhoja,
-- Postgres OR:aa saman komennon policyt) — vain 'teema'/'vahdittu'-tyyppisille
-- JAETUILLE listoille kuka tahansa kirjautunut saa päivittää/poistaa (sama
-- "jaettu = molemmat muokkaavat kokonaan" -periaate kuin tuotteet/laituri/
-- kalenteri_tapahtumat jo noudattavat) — normaalien listojen (Muistilaput/
-- Varasto/Kauppalista) omistajarajoitettu muokkaus/poisto EI muutu mitenkään.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table lists add column if not exists list_type text not null default 'normal'
  check (list_type in ('normal', 'teema', 'vahdittu'));

alter table lists add column if not exists sovittu_linja text;
alter table lists add column if not exists sovittu_linja_pvm date;
alter table lists add column if not exists priority text not null default 'tavallinen'
  check (priority in ('tavallinen', 'painava'));
alter table lists add column if not exists vahdittu_raja_paivia int not null default 14;

alter table laituri add column if not exists teema_id uuid references lists(id) on delete cascade;

-- Idempotentti (drop+create policy, sama malli kuin sql/063/sql/072).
drop policy if exists "lists_update_shared_teema" on lists;
create policy "lists_update_shared_teema" on lists for update
  using (visibility = 'shared' and list_type in ('teema', 'vahdittu'));

drop policy if exists "lists_delete_shared_teema" on lists;
create policy "lists_delete_shared_teema" on lists for delete
  using (visibility = 'shared' and list_type in ('teema', 'vahdittu'));

commit;
