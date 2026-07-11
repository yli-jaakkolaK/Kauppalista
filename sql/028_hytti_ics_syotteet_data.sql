-- Katrin opiskelusyötteet Hyttiin (2026-07-11 lopullinen speksi). tyyppi='ics'
-- -syötteillä tunniste on YMPÄRISTÖMUUTTUJAN NIMI, ei suora URL (nämä .ics-
-- linkit sisältävät henkilökohtaisen tokenin URL:ssaan) — api/caldav-sync.js
-- lukee process.env[tunniste] vasta ajon aikana. Vercelissä jo olemassa
-- (Katrin vahvistama): ITSLEARNING_ICS_KATRI ja LUKKARIKONE_ICS_KATRI
-- (jälkimmäinen http://-alkuinen, hyväksytty tälle syötetyypille).
--
-- account_key='katri' on tässä muodollinen täyte (check-rajoite vaatii
-- jonkin arvon, ks. sql/017) — tyyppi='ics'-syötteet eivät käytä
-- account_key:tä mihinkään, koska ne eivät kirjaudu CalDAV:iin ollenkaan.
--
-- scope='hytti' + henkilo='katri': näkyy VAIN Katrin Hytissä (tänään-kaista
-- + korttien "Kortin kalenteri" -osio), EI koskaan perheen agendassa/
-- kuittausjonossa/Kuormavahdissa eikä Juhan puolella — ks. sql/027:n
-- RLS-korjaus ja muistiinpanot.md "Hytti v1 + opiskelulaajennus" -osio.
--
-- Idempotentti (sama uniikki-rajoite kuin sql/019).
--
-- VAATII: sql/024 (henkilo-sarake), sql/027 (scope-sarake) AJETTU ENSIN.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

insert into kalenteri_syotteet (name, tyyppi, tunniste, mode, account_key, scope, henkilo, enabled) values
  ('Itslearning', 'ics', 'ITSLEARNING_ICS_KATRI', 'taysi', 'katri', 'hytti', 'katri', true),
  ('Lukkarikone', 'ics', 'LUKKARIKONE_ICS_KATRI', 'taysi', 'katri', 'hytti', 'katri', true)
on conflict (tunniste, account_key) do nothing;

commit;
