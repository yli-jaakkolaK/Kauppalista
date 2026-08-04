-- Siivoaa vanhan taitosolmut-tuonnin joka todennäköisesti ehti ajaa ennen
-- kuin sql/095 muutettiin no-op-stubiksi 2026-08-05 (ks. sql/095:n
-- yläkommentti) — jos sql/095:n ALKUPERÄINEN versio (95 taitosolmua) ajettiin
-- Supabasessa ENNEN tätä korjausta, stub-muunnos ei enää poista jo
-- kirjoitettua dataa, koska migraatiotiedoston sisällön muutos ei vaikuta
-- takautuvasti jo suoritettuun ajoon.
--
-- Turvallinen ajaa RIIPPUMATTA nykytilasta: jos taitosolmut on jo tyhjä,
-- tämä ei tee mitään (DELETE 0 riviä). CASCADE-viittaukset (taito_kaaret,
-- taitosolmu_viittaukset, opinto_paivan_askeleet.taitosolmu_id, opinto_
-- sessiot.taitosolmu_id) siivoutuvat automaattisesti mukana (ks. sql/092/
-- 093/098/099 "on delete cascade" -määrittelyt) — ei tarvitse poistaa niitä
-- erikseen.
--
-- Uuden mallin mukaan taitosolmut TÄYTYY olla tyhjä kunnes AI-avusteinen
-- siltatunnistus (script.js: etsiSiltoja()) löytää ja käyttäjä hyväksyy
-- aidot sillat — ei ole olemassa mitään legitiimiä dataa joka pitäisi
-- säilyttää tässä vaiheessa.
--
-- Aja tämä Supabasen SQL Editorissa milloin vain (ei riipu ajojärjestyksestä
-- muiden migraatioiden kanssa).

begin;

delete from taitosolmut
where owner_id = (select user_id from hytti_omistajat where henkilo = 'katri');

commit;
