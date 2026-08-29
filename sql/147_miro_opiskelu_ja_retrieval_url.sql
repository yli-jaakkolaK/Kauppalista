-- Miro-taulujen kokonaisuudistus (2026-08-29, Katrin oma 3-taulu-jako):
--   Taulu 1 "Opiskelutaulu" — yksi iso taulu, kurssilla oma Frame, aiheella
--     oma alue Framen sisällä. Kaikki priming+encoding(+overlearning)
--     -muokkaukset ("elävä muistiinpano").
--   Taulu 2 "Retrieval-taulu" — pysyy tyhjänä lähtötilanteessa, avautuu
--     retrievalissa, siivotaan käsin seuraavaa kertaa varten.
--   Taulu 3 "Retrieval-arkisto" — puhdasta Miro-työtä, EI integraatiota
--     Satamaan ollenkaan.
--
-- Tämä KORVAA aiemman OAuth/Frame-automaation kokonaan (api/miro.js
-- poistettu, ks. myös script.js:n paivitaOpintoTehtavaMiroKoukku) — se jäi
-- Katrin oman kertaluonteisen Miro-app-asennusvaiheen (developers.miro.com,
-- Client ID/Secret) taakse eikä koskaan valmistunut. Uusi malli on
-- huomattavasti yksinkertaisempi: kaksi käsin syötettävää linkkiä per aihe,
-- sama "napauta lisätäksesi linkki" -kaava kuin aihe.materiaali-kentällä jo
-- ennestään.
--
-- miro_opiskeluurl: linkki Taulu 1:n oikeaan Frameen/alueeseen tälle
--   aiheelle. Näkyy priming/encoding/overlearning-vaiheissa.
-- miro_retrievalurl: linkki Taulu 2:een — käytännössä SAMA arvo kaikilla
--   aiheilla (yksi jaettu tyhjä harjoitustaulu), mutta silti oma kenttä per
--   aihe yksinkertaisuuden vuoksi (ei erillistä "yhteinen asetus" -reittiä).
--   Näkyy retrieval-vaiheessa.
--
-- VANHAT Miro-sarakkeet (opinto_kurssit.miro_frame_id,
-- opinto_aiheet.miro_retrieval_frame_id/_kierros) ja asetukset-rivit
-- (miro_board_a_id/_b_id) sekä miro_tokens-taulu JÄTETTY KOSKEMATTA tässä
-- migraatiossa (ei pudoteta mitään pyytämättä) — ne ovat nyt vain
-- käyttämätöntä dataa, voidaan siivota erikseen jos/kun halutaan.
--
-- Idempotentti (add column if not exists). Ajettu jo suoraan MCP:n kautta
-- 29.8.2026 - tämä tiedosto on historiakirjaus (ks. sql/138:n vastaava malli).

begin;

alter table opinto_aiheet add column if not exists miro_opiskeluurl text;
alter table opinto_aiheet add column if not exists miro_retrievalurl text;

commit;
