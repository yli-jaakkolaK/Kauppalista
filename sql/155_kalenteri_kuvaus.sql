-- Kalenteritapahtuman kuvaus (iCalin DESCRIPTION-kenttä), tallennetaan VAIN
-- 'taysi'-tilan syötteille (vain_varattu-tila ei koskaan tallenna mitään
-- yksityiskohtaa, ks. varattuTapahtumaksi() caldav-sync.js:ssä). Käyttö:
-- viikkonäkymän tietolehti näyttää esim. opintoryhmän (PINFOS26B), jos
-- Lukkarikoneen .ics-syöte sisältää sen kuvauskentässä.
--
-- Vain sarakkeen lisäys olemassa olevaan tauluun — olemassa olevat rivit
-- saavat arvon null kunnes seuraava synkka kirjoittaa kuvauksen. Ei uutta
-- taulua, joten Supabasen uusi GRANT-vaatimus (2026-10-30) ei koske tätä.
--
-- AJETTAVA ENNEN kuin caldav-sync.js:n kuvausta kirjoittava versio otetaan
-- käyttöön, muuten synkan upsert yrittäisi kirjoittaa olematonta saraketta.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table kalenteri_tapahtumat add column if not exists description text;

commit;
