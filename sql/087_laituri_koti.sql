-- Laiturin ketjun kotiin-valuminen + "ei tarvitse näkyä Laiturissa" -täppä
-- (2026-08-03, ks. KONSEPTIKIRJA.md 7b/7c, muistiinpanot.md "Laituri-threadin
-- nykyinen suunnanote").
--
-- BUGIKORJAUS 7b: vanha "Siirrä teemaan" (avaaTeemaValikko, teema_id) siirsi
-- KOKO ketjun (muru + kaikki jatkorivit) Laiturista kerralla — liian raju,
-- ei vastaa speksiä "Laiturissa näkyy aina vain ketjun uusin osa". teema_id
-- JÄÄ ennalleen (vanhat, jo siirretyt murut pysyvät koskemattomina, ei
-- takautuvaa muutosta) — UUSI mekanismi (koti_tyyppi/koti_kohde_id) korvaa
-- sen JATKOSSA tehtäville kotivalinnoille.
--
-- Malli: koti on KEVYT OSOITIN murulle, EI välitön siirto. Kun uusi jatkorivi
-- tallentuu murulle jolla on jo koti, EDELLINEN uusin segmentti (muru oma
-- teksti TAI edellinen jatkorivi) KIRJOITETAAN kotiin kohteen OMALLA
-- olemassa olevalla kirjoitusreitillä (teema → uusi laituri-rivi teema_id:llä,
-- sama "Sovittu linja vanha arvo valuu historiaan" -kaava kuin script.js:ssä;
-- lista/vahdittu → tuotteet-rivi, sama kaava kuin suoritaSijoitus(); hytti →
-- hytti_rivit-rivi, sama kaava) ja merkitään VASTA SEN JÄLKEEN "valunut_kotiin"
-- (Vahvistus seuraa todellisuutta -periaate: ei koskaan merkitä valuneeksi
-- ennen kuin kohdekirjoitus on VARMISTETTU onnistuneeksi). Alkuperäinen
-- muru-rivi ja jatkorivi-rivit EIVÄT KOSKAAN POISTU (turvainvariantti) —
-- valuminen on aina KOPIO kotiin, "valunut_kotiin" vain ohjaa mitä Laiturin
-- näkymä enää näyttää headlinena.
--
-- koti_kohde_id on TEKSTINÄ koska kohde on polymorfinen: lists.id on uuid
-- (teema/lista/vahdittu), hytti_kortit.id on bigint (hytti) — ei yhtä
-- yhteistä FK-tyyppiä, sama "ei suoraa FK:ta polymorfiselle viittaukselle"
-- -ratkaisu kuin laituri.placed_where (tekstinä) käyttää jo nimelle.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table laituri add column if not exists koti_tyyppi text
  check (koti_tyyppi in ('teema', 'lista', 'vahdittu', 'hytti'));
alter table laituri add column if not exists koti_kohde_id text;
alter table laituri add column if not exists koti_kohde_nimi text;
alter table laituri add column if not exists koti_segmentti_valunut boolean not null default false;

-- 7c: kertaluontoinen "ei tarvitse näkyä Laiturissa" -täppä murulle/säikeelle.
-- Turvainvariantti: rivi EI poistu, EI arkistoidu — vain suodatetaan pois
-- Laiturin AKTIIVISESTA näkymästä (sama "tila, ei poisto" -periaate kuin
-- arkistoinnilla, mutta ERI mekanismi, ei tulkita "käsitellyksi").
alter table laituri add column if not exists piilota_laiturista boolean not null default false;

alter table laituri_jatkorivit add column if not exists valunut_kotiin boolean not null default false;

commit;
