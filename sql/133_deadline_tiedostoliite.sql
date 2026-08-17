-- Deadline-rivin tiedostoliite (VAIHE2_JA_LISAYKSET_CODELLE.md, kohta 2 /
-- Reitti-välilehden kalenterilogiikka, 2026-08-17). opinto_deadlinet
-- (sql/083) on olemassa. Sama malli kuin materiaali_kurssi_id (sql/117):
-- nullable viite laituri-tauluun, kohteena deadline-rivi eikä kurssi/solmu.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table laituri add column if not exists materiaali_deadline_id bigint references opinto_deadlinet(id) on delete cascade;

commit;
