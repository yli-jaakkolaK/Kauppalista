-- Opiskelusolmun kaksi puuttuvaa saraketta (2026-08-05, ks.
-- HYTTI_SPEKSI_2026-08-05.md §5) — "iso oivallus" auditista: opinto_aiheet
-- ON jo kurssikohtainen väliotsikkotason opiskelusolmu (kurssi_id, vaihe/
-- PACER, kulkee moottorissa). Siitä puuttui vain kaksi saraketta. EI uutta
-- taulua, ei uutta kerrosta.
--
-- viimeksi_kosketettu: milloin tätä opiskelusolmua viimeksi kosketettiin
-- (avattu/merkitty tehdyksi/kanvaasia muokattu) — puhdas informatiivinen
-- aikaleima, EI vaikuta moottorin PACER/SR-laskentaan (se nojaa edelleen
-- vaihe+sr_next_review-pariin, ks. sql/085).
--
-- materiaali: per-otsikko materiaalilinkki. Ennen materiaali oli VAIN
-- kurssitasolla yhtenä isona tekstikenttänä (opinto_kurssit.materiaali,
-- sql/083) — tämä täydentää, ei korvaa sitä (kurssitason kenttä pysyy
-- siltatunnistuksen syötteenä, HYTTI_SPEKSI §9 puhuu materiaalin
-- POIMINNASTA tähän kenttään väliotsikon yhteyteen).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table opinto_aiheet add column if not exists viimeksi_kosketettu timestamptz;
alter table opinto_aiheet add column if not exists materiaali text;

commit;
