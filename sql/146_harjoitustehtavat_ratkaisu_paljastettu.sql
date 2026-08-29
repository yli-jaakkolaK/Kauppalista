-- PACER-vaiheen automaattisen etenemisen mittari (2026-08-29, Katrin pyyntö):
-- "Use solution reveals (calls to nayta-ratkaisu for this topic) as the
-- advancement trigger, not problem generations. Threshold is 5 reveals
-- within the current phase." api/nayta-ratkaisu.js merkitsee tämän true:ksi
-- joka kerta kun ratkaisu palautetaan; script.js laskee tosiaikaisesti
-- Supabase-clientilla montako on merkitty tälle aihe+vaihe-parille, ja
-- vaihtaa opinto_aiheet.pacer_vaihe_nyt:n (sql/145) seuraavaan kun raja (5)
-- täyttyy — ei uutta serverless-funktiota tähänkään, kaikki suoraan
-- Supabase JS:llä.
--
-- Idempotentti (add column if not exists). Ajettu jo suoraan MCP:n kautta
-- 29.8.2026 - tämä tiedosto on historiakirjaus (ks. sql/138:n vastaava malli).

begin;

alter table harjoitustehtavat add column if not exists ratkaisu_paljastettu boolean not null default false;

commit;
