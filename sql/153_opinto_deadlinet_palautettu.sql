-- "Miten hytissä voi laittaa jonkun tehtävän palautetuksi?" (2026-09-01,
-- Katri) — opinto_deadlinet-riveillä (koe/palautus) ei ollut mitään "tehty"-
-- tilaa, ainoa vaihtoehto oli poistaa rivi kokonaan (menettää historian).
-- Lisää vapaaehtoisen suoritus-lipun, joka EI vaikuta rivin näkymiseen
-- deadline-listassa (edelleen näkyy, mutta merkittynä), mutta suljetaan
-- pois kaikista kiireellisyys-/paine-laskuista (kolmiportainen kadenssi
-- ym.) — valmis tehtävä ei saa enää painaa aikataulua.
--
-- HUOM: tätä tiedostoa EI ole vielä ajettu — Supabase MCP -yhteys katkesi
-- kesken tämän istunnon, joten migraatiota ei voitu ajaa suoraan. Aja
-- tämä Supabasen SQL-editorista TAI pyydä ajamaan seuraavassa istunnossa
-- ennen kuin script.js:n uusi "✅ Palautettu / Suoritettu" -nappi toimii —
-- ilman saraketta kirjoitus epäonnistuu hiljaa (ilmoitaKirjoitusvirheesta
-- näyttää virheen, ei kaadu, mutta toiminto ei tallennu).

begin;

alter table opinto_deadlinet add column if not exists palautettu boolean not null default false;

commit;
