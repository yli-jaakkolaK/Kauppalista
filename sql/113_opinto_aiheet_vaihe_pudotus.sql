-- Vanhan opinto_aiheet.vaihe-sarakkeen pudotus (2026-08-11) — ERILLINEN,
-- PERUUTTAMATON jatko sql/111:lle. ÄLÄ AJA TÄTÄ ennen kuin olet ajanut
-- sql/111:n tarkistuskyselyn ja lukumäärät (vanhat_yllapito_rivit vs.
-- uudet_kertausjonossa) TÄSMÄÄVÄT. Jos et ole vielä varma, pysähdy tähän.
--
-- Miksi erillään: ensimmäinen versio sql/111:stä teki backfillin JA
-- pudotuksen samassa transaktiossa — peruuttamaton askel ennen kuin kukaan
-- oli nähnyt todistetta että backfill oikeasti onnistui. Katri huomasi
-- tämän ennen kuin migraatiota oli ajettu ("montako yllapito-riviä oli, ja
-- ovatko ne nyt retrieval + kertausjonossa? jos ne katosivat, kertausjono
-- on tyhjä eikä sitä huomaa ennen kuin jokin ei ilmesty"). Tämä tiedosto
-- on se turvallisempi kaksivaiheinen malli.
--
-- Koodi (script.js) ei enää lue/kirjoita opinto_aiheet.vaihe-saraketta
-- lainkaan sql/111:n JS-muutosten jälkeen — pudotus on siis puhtaasti
-- siivousta ("kaikella on yksi koti"), ei mitään joka rikkoisi sovellusta,
-- kunhan sql/111:n backfill on jo todennettu oikeaksi.
--
-- taitosolmut.vaihe EI ole tämä sarake, ei koske tätä pudotusta.
--
-- Aja tämä Supabasen SQL Editorissa VASTA sql/111:n tarkistuksen jälkeen.

begin;

alter table opinto_aiheet drop column vaihe;

commit;
