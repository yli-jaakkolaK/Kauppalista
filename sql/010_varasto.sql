-- Varasto: harvemmin tarvittavat listat (pakkauslistat, toistuvat pohjat ym.)
-- omana kategorianaan samassa lists/tuotteet-rakenteessa kuin Muistilaput —
-- ei tarvita erillistä taulua, koska listat/tuotteet-toiminnallisuus
-- (rastitus, väliotsikot, jako, raahaus) on jo täysin valmis ja yhteinen.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table lists add column if not exists category text not null default 'muistilaput'
  check (category in ('muistilaput', 'varasto'));

-- Esimerkkilistat Varastoon (omistaja Katri, jaettu molemmille) — ei lisätä
-- uudelleen jos samanniminen varasto-lista on jo olemassa
insert into lists (name, type, owner_id, visibility, category)
select v.name, 'checklist', 'd646881e-0ab8-4351-aae1-3e92678c8432', 'shared', 'varasto'
from (values
  ('Telttaretken pakkauslista'),
  ('Viikon reissun pakkauslista')
) as v(name)
where not exists (
  select 1 from lists l where l.name = v.name and l.category = 'varasto'
);

commit;
