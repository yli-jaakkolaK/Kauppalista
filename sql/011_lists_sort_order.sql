-- Manuaalinen järjestys Muistilaput/Varasto-näkymien listariveille (raahaus
-- pitkällä painalluksella), sama periaate kuin tuotteet.sort_order (007).
-- Oletusarvo on kellonaika sekunteina, joten uusi lista menee aina loppuun
-- ilman että sovelluksen tarvitsee asettaa arvoa erikseen.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table lists add column if not exists sort_order double precision;

update lists l
set sort_order = sub.rn
from (
  select id, row_number() over (partition by category order by created_at) as rn
  from lists
) sub
where l.id = sub.id and l.sort_order is null;

alter table lists alter column sort_order set not null;
alter table lists alter column sort_order set default extract(epoch from clock_timestamp());

commit;
