-- Korjaa sql/119:n mallin (Katrin täsmennys 2026-08-16): auto-AI-kutsu EI ole
-- toistuva viikkotarkistus vaan PER KURSSI -kertaluontoinen eskalaatio —
-- "1 viikko kurssin lisäyksestä, tapahtuu korkeintaan kerran per kurssi
-- (esim. 4 kurssia -> korkeintaan 4 ajoa, ei toistuvaa kelloa). Muina
-- aikoina pelkkä muistutus UI:ssa, EI AI-kutsua."
--
-- sql/119:n asetukset-avain `sillat_viimeisin_tarkistus` (globaali kello)
-- jää KÄYTTÄMÄTTÄ tästä eteenpäin — ei poisteta (harmiton, ei aiheuta
-- ristiriitaa), korvataan tällä per-kurssi-sarakkeella. `sillat_auto_paivia`
-- pysyy käytössä sellaisenaan, sovelletaan nyt kunkin kurssin OMAAN
-- created_at:iin globaalin kellon sijaan.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

-- NULL = ei vielä koskaan mukana yhdessäkään siltahaussa (käsin tai auto).
-- Jokainen onnistunut haku (mikä tahansa kolmesta: Nyt-välilehden globaali,
-- kurssisivun kontekstinen, tai auto-eskalaatio) kattaa AINA kaikki
-- aktiiviset kurssit yhtä aikaa (silta on määritelmällisesti usean kurssin
-- yhteinen), joten se merkitään KAIKILLE aktiivisille kursseille kerralla.
alter table opinto_kurssit add column if not exists silta_katsottu_at timestamptz;

commit;
