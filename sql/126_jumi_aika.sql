-- OSA B1 (rakennusjärjestys-dokumentti 17.8.2026): "Epäonnistuminen,
-- ratkaisematta jättäminen ja niihin käytetty aika ovat tärkeää dataa."
-- opinto_jumi_merkinnat (sql/124) tallensi jo tapahtuman, muttei kestoa.
-- Lisätään kesto sekunteina siitä hetkestä kun tehtävänäkymä avattiin
-- ("En pääse alkuun" -painallukseen asti) — ei erillistä UI:ta, pelkkä
-- talteenotto (B1: "Lokinäkymää ei tarvita heti — riittää että data
-- tallentuu").
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table opinto_jumi_merkinnat add column if not exists aika_kaytetty_s int;

commit;
