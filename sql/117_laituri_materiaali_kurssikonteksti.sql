-- Bugikorjaus (2026-08-16, Katrin löydös elävässä katselmoinnissa):
-- kurssikontekstinen materiaalintuonti (HYTTI_SPEKSI.md §8.3/CODE_vaihe1b.md
-- §3) merkitsi "tämä rivi kuuluu tunnettuun kurssiin, ohita heuristiikka"
-- VAIN client-muistivaraiseen `materiaaliKohdeUudetRivit`-Settiin (script.js).
-- Tallennuksen jälkeen `peruLaiturinMateriaaliKonteksti()` tyhjentää saman
-- Setin ENNEN kuin Laiturin näkymä (ja sen tarkistuskortit) ehtii koskaan
-- piirtyä uudelleen — merkintä ei siis KOSKAAN ehtinyt vaikuttaa mihinkään,
-- eikä sama data selviä sivun uudelleenlatauksestakaan. Data itse (laituri +
-- laituri_tiedostot -rivit) tallentui aina oikein, ei kadonnut mitään
-- (turvainvariantti säilyi) — vika oli vain ettei käyttäjä koskaan nähnyt
-- tarkistuskorttia eikä kurssin nimeä esitäytettynä/lukittuna jäsennys-
-- dialogissa.
--
-- Korjaus: sama "kevyt osoitin" -malli kuin Laiturin kodilla
-- (koti_tyyppi/koti_kohde_id/koti_kohde_nimi, sql/087) — id+denormalisoitu
-- nimi TALLENNETAAN SUORAAN riville insert-hetkellä, ei client-muistiin.
-- `on delete set null` (EI cascade): jos kurssi poistetaan, alkuperäinen
-- Laituri-rivi ei saa kadota mukana — se vain palaa tavallisen
-- naytaakoKurssimateriaalilta()-heuristiikan varaan.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table laituri add column if not exists materiaali_kurssi_id bigint references opinto_kurssit(id) on delete set null;
alter table laituri add column if not exists materiaali_kurssi_nimi text;

commit;
