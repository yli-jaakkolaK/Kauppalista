-- "Miten hytissä voi laittaa jonkun tehtävän palautetuksi?" (2026-09-01,
-- Katri) — opinto_deadlinet-riveillä (koe/palautus) ei ollut mitään "tehty"-
-- tilaa, ainoa vaihtoehto oli poistaa rivi kokonaan (menettää historian).
-- Lisää vapaaehtoisen suoritus-lipun, joka EI vaikuta rivin näkymiseen
-- deadline-listassa (edelleen näkyy, mutta merkittynä), mutta suljetaan
-- pois kaikista kiireellisyys-/paine-laskuista (kolmiportainen kadenssi
-- ym.) — valmis tehtävä ei saa enää painaa aikataulua.
--
-- Ajettu Katrin toimesta suoraan Supabasen SQL-editorista 2026-09-01
-- (Supabase MCP -yhteys oli poikki kesken istunnon) — tämä tiedosto on
-- historiakirjaus, ks. sql/151:n vastaava malli.

begin;

alter table opinto_deadlinet add column if not exists palautettu boolean not null default false;

commit;
