-- Kalenterisilta aikaistettu (2026-07-20, Katrin speksitarkennus, ks.
-- muistiinpanot.md "Kalenterisilta aikaistettu"). Ankkuriehdokkaan oma
-- "➕ Lisää kalenteriin" -nappi ei näy ennen kuin ehdokas itse tulee
-- näkyviin (visible_from, ks. sql/067/Bugi 28) — "hetki"-tyypin ehdokkaalle
-- tämä voi tarkoittaa lähelle kohdehetkeä asti, jolloin ajanvaraus saadaan
-- kalenteriin liian myöhään ja käyttäjän oma konteksti on jo kadonnut.
--
-- ai_hetki_ehdotus (jsonb, nullable): {content, date, time} kirjoitetaan
-- murun OMALLE riville HETI kun heti-luokittelu (Siri-reitti, api/laituri-
-- add.js) tai yöajo (api/aly-nightly.js) tunnistaa "hetken" — riippumaton
-- ankkuriehdokkaan omasta visible_from-viiveestä, näkyy Laiturissa
-- välittömästi (ks. script.js piirraHetkiSiltaKortti()). LISÄYS aikaiseen
-- siltaan, EI korvaa ankkuriehdokasta — se toimii yhä muistutuksena
-- kohdepäivänä ennallaan.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table laituri add column if not exists ai_hetki_ehdotus jsonb;

commit;
