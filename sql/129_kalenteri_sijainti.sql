-- Föli-siirtymäblokkien pohjatyö (2026-08-17, ks. muistiinpanot.md
-- "Föli-integraatio"). Katrin havainto: kalenteritapahtumien lähdedata
-- (iCloud/lukkarikone/itslearning .ics-syötteet) SISÄLTÄÄ jo sijainnin
-- (iCalin standardi LOCATION-kenttä) — caldav-sync.js vain ei ole
-- koskaan lukenut sitä (ical.js:n ICAL.Event-luokka lukee sen jo,
-- event.location, käyttämättömänä). Ei siis tarvita erillistä
-- sijainninsyöttö-UI:ta, vain tallennuspaikka olemassa olevalle datalle.
--
-- location on VAPAAMUOTOINEN TEKSTI suoraan lähteestä (esim. rakennuksen
-- nimi tai osoite) — Föli-pysäkin täsmäys tehdään tekstihaulla GTFS-
-- pysäkkinimiä vasten sovelluspuolella, ei tallenneta valmiiksi pysäkki-
-- tunnisteena tähän (lähdeteksti voi muuttua/tarkentua, täsmäys pitää
-- pystyä laskemaan uudelleen ilman migraatiota).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table kalenteri_tapahtumat add column if not exists location text;

commit;
