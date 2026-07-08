-- Usean päivän kestävät kalenteritapahtumat (esim. "lapsen loma" viikon
-- mittainen yön-yli-tapahtuma). Tähän asti vain event_date (yksi päivä) +
-- event_end_time (vain kellonaika, ei päivää) tallennettiin — tapahtuman
-- todellinen loppupäivä katosi tuonnissa. event_end_date on NULL kun
-- tapahtuma kestää vain yhden päivän (valtaosa tapahtumista) — koodi
-- kohtelee NULLia aina samana kuin event_date.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table kalenteri_tapahtumat add column event_end_date date;
alter table kalenteri_odottavat add column event_end_date date;

commit;
