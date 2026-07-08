-- Tuki useammalle CalDAV-tilille kalenterisyötteissä. Havainto testistä:
-- kaikki perheen tapahtumat eivät ole jaetussa kalenterissa — osa elää
-- Juhan henkilökohtaisissa kalentereissa, joita Katrin iCloud-tunnukset
-- eivät näe. account_key kertoo MINKÄ tilin tunnuksilla syöte haetaan —
-- itse salasanat pysyvät Vercelin ympäristömuuttujissa, tauluun tulee vain
-- viittausavain ('katri'/'juha'), ei koskaan mitään salaista.
--
-- api/caldav-sync.js:ssä uusi TILIT-map yhdistää account_key-arvon oikeaan
-- ympäristömuuttujapariin (ICLOUD_USERNAME/ICLOUD_APP_PASSWORD = katri,
-- ICLOUD_USERNAME_JUHA/ICLOUD_APP_PASSWORD_JUHA = juha).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

-- Kaikki olemassa olevat rivit (jos joku ehdittiin lisätä testiksi) saavat
-- oletuksena 'katri', koska ne on tähän asti haettu vain sillä tilillä.
alter table kalenteri_syotteet add column account_key text not null default 'katri'
  check (account_key in ('katri', 'juha'));

commit;
