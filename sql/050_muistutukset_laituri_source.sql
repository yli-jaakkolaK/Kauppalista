-- BUGIKORJAUS (2026-07-14, löydetty koodikatselmuksessa "Ajastetut
-- muistutukset eivät tule perille" -tutkinnan yhteydessä): 'source'-rajoite
-- (sql/025, laajennettu sql/026:ssa kattamaan 'hytti_rivi') EI koskaan
-- sisältänyt 'laituri'-arvoa, vaikka 17.7. lisätty ominaisuus (ks.
-- "Kalenteri-sijoitus ei kirjoita mitään" -bugikorjaus) käyttää
-- `avaaMuistutusPaneeli('laituri', ...)`:ta Laiturin murun muistutus-
-- kohteelle. Jokainen yritys asettaa muistutus Laiturin murulle olisi
-- kaatunut tämän CHECK-rajoitteen taakse (näkyvänä virheenä käyttäjälle,
-- ei hiljaa — `lisaaMuistutus()` näyttää "Muistutuksen tallennus
-- epäonnistui" -toastin insert-virheestä).
--
-- Sama nimeämismalli kuin sql/026:ssa: constraint-nimi
-- 'muistutukset_source_check' on Postgresin oletusnimi, DROP IF EXISTS
-- tekee tästä turvallisen ajaa uudelleen jos nimi joskus poikkeaisi.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table muistutukset drop constraint if exists muistutukset_source_check;
alter table muistutukset add constraint muistutukset_source_check
  check (source in ('rivi', 'kalenteri', 'ankkuri', 'hytti_rivi', 'laituri'));

commit;
