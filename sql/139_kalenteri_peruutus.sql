-- Peruutettu tapahtuma jää näkyviin harmaana katoamisen sijaan (Katrin
-- 29.8.2026 pyyntö: "leave cancelled lecture greyish and point to where it
-- got moved into"). Aiemmin api/_lib/caldav-sync.js:n siivoaPoistetut()
-- POISTI rivin kokonaan heti kun sen ical_uid ei enää löytynyt syötteestä
-- (peruttu TAI siirretty eri UID:lle) — mitään jälkeä ei jäänyt, eikä
-- eroa peruutuksen ja siirron välillä voinut nähdä. Nyt rivi jää tauluun
-- peruttu=true-merkinnällä, ja jos vastaava kurssin nimi löytyy uutena
-- lähipäiviltä samasta syötteestä, siirtyi_tapahtuma_id osoittaa siihen
-- (ks. caldav-sync.js:n loytaaSiirtynytTapahtuma()).
--
-- Idempotentti (add column if not exists). Ajettu jo suoraan MCP:n kautta
-- 29.8.2026 — tämä tiedosto on historiakirjaus (ks. sql/138:n vastaava malli).

begin;

alter table kalenteri_tapahtumat add column if not exists peruttu boolean not null default false;
alter table kalenteri_tapahtumat add column if not exists siirtyi_tapahtuma_id bigint references kalenteri_tapahtumat(id) on delete set null;
create index if not exists kalenteri_tapahtumat_peruttu_idx on kalenteri_tapahtumat (peruttu) where peruttu = true;

commit;
