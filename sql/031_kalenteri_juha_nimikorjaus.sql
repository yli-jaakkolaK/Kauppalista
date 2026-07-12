-- Juhan tilin kalentereiden nimikorjaus (2026-07-12). Selvitetty
-- `?listaa=juha`-diagnostiikalla + puhelimista käsin varmistettuna:
--
-- 1) Jaettu perhekalenteri näkyy Juhan iCloud-tilillä ERI näyttönimellä
--    kuin Katrin tilillä ("Yhteinen kalenteri", ei "Perhekalenteri") —
--    tunniste on CalDAV:in TARKKA näyttönimi kirjain kirjaimelta (ks.
--    sql/014 yläkommentti), joten sql/030:n rivi ei koskaan löytänyt
--    kalenteria, synkka-JSON:issa virhe "Kalenteria Perhekalenteri ei
--    löytynyt iCloud-tilitä". Korjataan UPDATElla, ei uudella rivillä,
--    koska kyseessä on SAMA syöte, vain väärä tunniste.
--
-- 2) Juhan tilillä oli KAKSI kalenteria nimellä "Juha" (jaettu + hänen oma
--    yksityisensä) — tunniste-pohjainen haku olisi ollut moniselitteinen
--    kummalle tarkoitettu. Juha nimesi yksityisen kalenterinsa iCloudissa
--    uudelleen "Oma"-nimiseksi (varmistettu `?listaa=juha`:lla: "Juha" ja
--    "Oma" näkyvät nyt erillisinä, kumpikin kerran). Näin sql/030:n
--    olemassa oleva 'Juha'-rivi osuu jatkossa yksiselitteisesti jaettuun,
--    ja tämä migraatio lisää UUDEN rivin 'Oma'-kalenterille — sieltä
--    tulevat todennäköisesti ne perjantain "kadonneet" Juhan omat menot.
--
-- 3) Ei toimenpiteitä: Juhan tililtä poistettiin tarkoituksella vanha
--    tupla-jaettu kalenteri ("Katri Rantanen" -niminen jäänne). Jos synkka
--    on ehtinyt tuoda siitä jotain aiemmin, peilisääntö (siivoaPoistetut(),
--    api/caldav-sync.js) siivoaa ne pois normaalisti seuraavalla
--    synkkauskerralla — ei vaadi erillistä SQL-siivousta.
--
-- PERIAATE JATKOA VARTEN (kirjattu myös muistiinpanot.md:hen): jos
-- nimipohjainen tunniste törmää tulevaisuudessa taas tuplanimeen tai
-- väärään nimeen, ENSISIJAINEN korjaus on nimetä kalenteri selkeäksi
-- iCloudissa (kuten tässä) ja päivittää tunniste vastaamaan — EI koodata
-- ohitusta/erikoistapausta api/caldav-sync.js:ään ellei se ole aidosti
-- pakollista. Sama "data ei koodia" -periaate kuin muuallakin.
--
-- Idempotentti: UPDATE osuu vain jos vanha tunniste on vielä olemassa
-- (no-op toisella ajokerralla), INSERT käyttää samaa on conflict do nothing
-- -kaavaa kuin sql/019/030.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

update kalenteri_syotteet
set tunniste = 'Yhteinen kalenteri', name = 'Yhteinen kalenteri (Juhan tili)'
where account_key = 'juha' and tunniste = 'Perhekalenteri';

insert into kalenteri_syotteet (name, tyyppi, tunniste, mode, account_key, henkilo, enabled) values
  ('Oma (Juhan tili)', 'icloud', 'Oma', 'taysi', 'juha', 'juha', true)
on conflict (tunniste, account_key) do nothing;

commit;
