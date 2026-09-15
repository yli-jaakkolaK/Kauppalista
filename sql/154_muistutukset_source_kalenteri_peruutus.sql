-- Korjaa muistutukset_source_check-rajoite hyväksymään 'kalenteri_peruutus'
-- (2026-09-15, Katrin löytö: Vercelin Fluid CPU 75% -varoitus paljasti
-- caldav-sync.js:n loki-virheet). sql/139 (29.8.2026) lisäsi peruutettujen
-- tapahtumien ilmoituskoneiston — api/_lib/caldav-sync.js:n
-- kasitteleUudetPeruutukset() kirjoittaa muistutukset-riviin
-- source: 'kalenteri_peruutus' (script.js:7524 lukee saman arvon kuittausta
-- varten) — MUTTA muistutukset_source_check-rajoitetta ei koskaan
-- laajennettu hyväksymään sitä. JOKA peruutusilmoitus on siis epäonnistunut
-- rajoitevirheeseen sql/139:n ajosta asti (~2.5 viikkoa), ja koska
-- caldav-sync.js yrittää tätä uudelleen JOKAISELLA cron-ajolla samoille jo
-- peruutetuille tapahtumille, se on kuluttanut turhaa CPU-aikaa jatkuvasti.
--
-- Postgres ei salli CHECK-rajoitteen muokkausta paikan päällä — pudotetaan
-- vanha ja luodaan uusi laajennetulla listalla, muut arvot koskemattomina.
--
-- Ajettu suoraan Supabase MCP:n kautta 2026-09-15 — tämä tiedosto on
-- historiakirjaus (ks. sql/151:n vastaava malli).

begin;

alter table muistutukset drop constraint muistutukset_source_check;
alter table muistutukset add constraint muistutukset_source_check
  check (source = any (array['rivi', 'kalenteri', 'ankkuri', 'hytti_rivi', 'laituri', 'kalenteri_peruutus']));

commit;
