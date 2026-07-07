-- Ankkurille valinnainen kellonaika, jotta se voi näkyä oikeassa kohtaa
-- Kalenterin päivänäkymän yhdistetyssä listassa (kalenteritapahtumat +
-- aktiiviset ankkurit samassa agendassa).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table ankkurit add column if not exists event_time time;

commit;
