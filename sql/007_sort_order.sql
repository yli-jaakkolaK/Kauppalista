-- Manuaalinen järjestys listan riveille (raahaus pitkällä painalluksella).
-- Oletusarvo on kellonaika sekunteina, joten uudet rivit menevät aina loppuun
-- ilman että sovelluksen tarvitsee asettaa arvoa erikseen (koskee myös
-- Siri-lisäyksiä, jotka eivät aseta sort_orderia).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table tuotteet add column sort_order double precision;

update tuotteet t
set sort_order = sub.rn
from (
  select id, row_number() over (partition by list_id order by id) as rn
  from tuotteet
) sub
where t.id = sub.id;

alter table tuotteet alter column sort_order set not null;
alter table tuotteet alter column sort_order set default extract(epoch from clock_timestamp());

commit;
