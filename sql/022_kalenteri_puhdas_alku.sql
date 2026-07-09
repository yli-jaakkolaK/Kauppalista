-- Käyttöönotto uudelle mallille ("yksi totuus, kaksi ikkunaa"): siivotaan
-- kaikki vanhan mallin aikana syntynyt synkkausdata pois, jotta ensimmäinen
-- synkka uudella koodilla (aikaikkuna+RRULE-korjaus, suora kirjoitus
-- kalenteri_tapahtumat-tauluun) tuottaa puhtaan, luotettavan tuloksen.
--
-- EI KOSKETA käsin lisättyihin tapahtumiin (syote_id is null) — poistaa
-- vain synkatun datan (syote_id not null) ja tyhjentää kokonaan käytöstä
-- poistuvan kalenteri_odottavat-jonon (ei enää kirjoiteta, ks. 021).
--
-- Turvallinen ajaa uudelleen (tyhjän datan poistaminen on no-op).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

delete from kalenteri_tapahtumat where syote_id is not null;
delete from kalenteri_odottavat;

commit;
