-- Kalenterisilta ("➕ Lisää kalenteriin", 2026-07-18, ks. muistiinpanot.md) —
-- tarvitsee ✨-ehdokkaan ABSOLUUTTISEN kohdepäivän .ics-tapahtuman
-- generointiin, mutta sitä ei tähän asti tallennettu mihinkään: `event_time`
-- (kellonaika) oli jo ankkurit-taulussa, mutta itse päivämäärä (`resolvedDate`
-- api/aly-nightly.js:ssä) käytettiin vain hetkellisesti visible_from- ja
-- "jo mennyt ohi" -laskuihin eikä koskaan päätynyt mihinkään pysyvään
-- sarakkeeseen.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table ankkurit add column if not exists event_date date;

commit;
