-- Syötteen oletusosoite (Katrin 24.8.2026 ohje, kalenterin UI-uudistus):
-- Lukkarikoneen live-luennoilla ei aina ole omaa location-tekstiä
-- tapahtumakohtaisesti, ja Katri ei halua geokoodausta/hakua ("no need to
-- fetch it from anywhere") — pelkkä kiinteä osoite riittää. kalenteri_syotteet
-- .osoite toimii varalla script.js:n viikonSijaintiteksti()-funktiossa: jos
-- tapahtumalla itsellään on location, se voittaa; muuten käytetään tätä.
--
-- Idempotentti (add column if not exists + plain update, turvallinen ajaa
-- uudelleen). Ajettu jo suoraan MCP:n kautta 24.8.2026 — tämä tiedosto on
-- historiakirjaus (ks. sql/132:n vastaava malli).

begin;

alter table kalenteri_syotteet add column if not exists osoite text;

update kalenteri_syotteet set osoite = 'Joukahaisenkatu 3-5, Turku' where name = 'Lukkarikone';

commit;
