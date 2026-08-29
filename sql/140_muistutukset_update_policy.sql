-- muistutukset-taululla oli RLS päällä mutta EI UPDATE-käytäntöä lainkaan
-- (vain SELECT/INSERT/DELETE omalle riville) — löytyi vahingossa 2026-08-29
-- kun peruutusilmoituksen "✓ Nähty" -kuittausta rakennettiin (ks.
-- api/_lib/caldav-sync.js:n kasitteleUudetPeruutukset ja script.js:n
-- kalenteri-peruttu-poista-btn). Tämä tarkoittaa että myös jo OLEMASSA
-- OLEVA "✓ Hoidettu" -nappi sinnikkäälle muistutukselle (script.js, rivi
-- ~15010: db.from('muistutukset').update({acked_at,...})) on ollut
-- toimimaton koko ajan — päivitys ei osunut yhteenkään riviin RLS:n takia,
-- eikä virhettä näkynyt koska PostgREST ei raportoi "0 riviä osui" omana
-- virheenään. Sama user_id=auth.uid()-kaava kuin muillakin tämän taulun
-- käytännöillä.
--
-- Ajettu jo suoraan MCP:n kautta 29.8.2026 — tämä tiedosto on
-- historiakirjaus (ks. sql/138:n vastaava malli). EI idempotentti
-- (create policy ei tue "if not exists" -muotoa ennen PG15:tä), mutta
-- turvallinen ajaa vain kerran; uudelleenajo tuottaisi virheen "already
-- exists" eikä hiljaista kaksoiskappaletta.

begin;

create policy muistutukset_update_own on muistutukset
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

commit;
