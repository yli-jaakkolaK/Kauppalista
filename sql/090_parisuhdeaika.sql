-- Parisuhdeaika-ehdotus (2026-08-04, Katrin pyyntö) — kaksi uutta saraketta
-- ankkurit-tauluun molemminpuolisen hyväksynnän seurantaan. Sama rivimalli
-- kuin muillakin ehdotuslajeilla (source='parisuhdeaika', is_candidate=true,
-- yksi rivi per käyttäjä) — VAIN nämä kaksi uutta saraketta tarvitaan koska
-- kaksi eri käyttäjän riviä pitää linkittää toisiinsa ja kummankin oma
-- hyväksyntä pitää tietää erikseen ristikkäistarkistusta varten.
--
-- parisuhde_ryhma: sama uuid molemmilla saman ehdotuksen riveillä (yksi per
-- käyttäjä) — RLS (sql/029) rajaa jokaisen käyttäjän omaan riviinsä, joten
-- ristiin lukeminen/kirjoitus tehdään AINA service_role-palvelinreitillä
-- (api/parisuhdeaika-hyvaksy.js, api/parisuhdeaika-hylkaa.js), ei suoraan
-- selaimesta.
--
-- parisuhde_hyvaksytty: tämän KÄYTTÄJÄN oma hyväksyntä. Kun molempien
-- riveillä tämä on true, palvelin sulkee molemmat rivit kerralla
-- (is_candidate=false, done=true) samassa pyynnössä joka sen havaitsi.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table ankkurit add column if not exists parisuhde_ryhma uuid;
alter table ankkurit add column if not exists parisuhde_hyvaksytty boolean not null default false;

commit;
