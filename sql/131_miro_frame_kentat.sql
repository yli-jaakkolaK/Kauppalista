-- Miro Frame-kentät (2026-08-17, §10.1) — Board A/B (sql/130, asetukset-
-- taulun miro_board_a_id/miro_board_b_id) ovat nyt olemassa, seuraava
-- askel on Frame per kurssi (Board A) ja Frame per retrieval-kierros
-- (Board B).
--
-- opinto_kurssit.miro_frame_id: YKSI Frame per kurssi Board A:lla, luodaan
-- kerran (kurssin luonnissa tai ensimmäisen solmun encoding-avauksessa),
-- pysyy koko kurssin ajan — "kukin solmu avautuu siitä kohdasta jota on
-- tarkoitus työstää" samalla jaetulla Framella, ei omaa Framea per solmu.
--
-- opinto_aiheet.miro_retrieval_frame_id + miro_retrieval_frame_kierros:
-- Board B:n Frame on per KIERROS, ei per solmu — "jokainen kierros alkaa
-- täysin tyhjältä". Koska kierrosta ei ole omana rivinään (vain laskuri
-- opinto_aiheet.retrieval_kierrokset), näillä kahdella kentällä muistetaan
-- MILLE kierrosnumerolle nykyinen tallennettu frame_id kuuluu — jos
-- retrieval_kierrokset on edennyt sen ohi kun Tehtävänäkymä seuraavan
-- kerran avataan, vanha frame_id ei enää täsmää ja uusi luodaan.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table opinto_kurssit add column if not exists miro_frame_id text;
alter table opinto_aiheet add column if not exists miro_retrieval_frame_id text;
alter table opinto_aiheet add column if not exists miro_retrieval_frame_kierros int;

commit;
