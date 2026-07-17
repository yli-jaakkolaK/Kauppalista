-- Yhtenäistää Sataman kalenterivärit iCloudissa jo käytössä oleviin
-- väreihin (2026-07-17, Katrin ohje): yhteinen/perhekalenteri = liila,
-- Katrin oma kalenteri = punainen, Juhan oma kalenteri = sininen. Sama
-- fyysinen kalenteri saa saman värin riippumatta kumman tilin kautta se on
-- haettu (ks. "Kalenterisynkan kirjoitus kaatui hiljaa" -bugikorjaus,
-- Bugi 23, jossa nämä duplikaattiparit tunnistettiin).
--
-- Hytti-scopen opiskelu-/työsyötteet (Lukkarikone, Itslearning, Oma) EIVÄT
-- muutu — niillä on oma aiheen mukainen värinsä, tämä koskee vain kolmea
-- henkilö-/perheidentiteettiä.
--
-- Idempotentti (plain UPDATE, turvallinen ajaa uudelleen).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

update kalenteri_syotteet set vari = '#8E44AD'
  where name in ('Perhekalenteri', 'Yhteinen kalenteri (Juhan tili)');

update kalenteri_syotteet set vari = '#D32F2F'
  where name in ('Katri', 'Katri (Juhan tilin kautta)');

update kalenteri_syotteet set vari = '#1976D2'
  where name in ('Juha', 'Juha (Juhan tili)');

commit;
