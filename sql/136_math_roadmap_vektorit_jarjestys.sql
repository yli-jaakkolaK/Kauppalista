-- Math Roadmap -kurssin (opinto_kurssit id 2) sort_order-järjestys
-- uudelleenjärjestetty Vectors-tavoitteen ympärille (Katrin pyyntö
-- 2026-08-18/19: "my plan was start math from vectors and go backward
-- what skills do i need to master vectors and then at the same time doing
-- practice problems as i drill").
--
-- Alkuperäinen sort_order oli Cowork/Claude-chatista tuotu geneerinen
-- oppikirjajärjestys (Quadratics -> Systems -> Exponential -> Functions ->
-- Right triangle trig -> Logarithms -> Unit circle -> Law of sines ->
-- Vectors -> ...), joka blokkasi Vectorsin taakse KAIKKI 8 edeltävää
-- aihetta sort_order-portin (2026-08-18 rakennettu, ks. muistiinpanot.md
-- "Opiskelumoottori kunnioittaa kurssin sisäistä sort_order-järjestystä")
-- kautta, vaikka osa niistä (Quadratics, Exponential functions,
-- Logarithms) ei ole matemaattisesti Vectorsin esitieto lainkaan.
--
-- Uusi järjestys (matemaattinen perustelu):
--   1. Right triangle trigonometry — SUORA esitieto: vektorin komponentit
--      lasketaan cos/sin-kaavoilla
--   2. Unit circle & radians — laajentaa trigonometrian kaikkiin
--      kvadrantteihin, tarvitaan yleiselle suuntakulmalle
--   3. Systems of equations — tarvitaan usean vektorin/voiman ongelmissa
--      (jo encoding-vaiheessa, edistys säilyy)
--   4. Functions (domain/range/composition/inverses) — yleinen algebrallinen
--      kypsyys, lievä esitieto
--   5. Vectors — TAVOITE
--   6. Law of sines & cosines — luonteva jatko heti Vectorsin jälkeen
--      (ei-suorakulmaisten vektorien yhteenlasku), ei tiukka esitieto
--   7. Matrices — seuraava iso aihe, rakentuu vektorikäsitteen päälle
--   8-10. Quadratics / Exponential functions / Logarithms — EI Vectorsin
--      esitietoja, siirretty Vectors+Matrices-klusterin jälkeen, ennen
--      kalkyyliosuutta (Limits ja eteenpäin, koskematta)
--
-- Idempotentti (plain UPDATE, turvallinen ajaa uudelleen). Ajettu jo
-- suoraan MCP:n kautta 2026-08-18 — tämä tiedosto on historiakirjaus.

begin;

update opinto_aiheet set sort_order = 1785185050 where id = 96;  -- Right triangle trigonometry
update opinto_aiheet set sort_order = 1785185100 where id = 98;  -- Unit circle & radians
update opinto_aiheet set sort_order = 1785185150 where id = 4;   -- Systems of equations
update opinto_aiheet set sort_order = 1785185200 where id = 95;  -- Functions (domain, range, composition, inverses)
update opinto_aiheet set sort_order = 1785185250 where id = 100; -- Vectors
update opinto_aiheet set sort_order = 1785185300 where id = 99;  -- Law of sines & cosines
update opinto_aiheet set sort_order = 1785185350 where id = 101; -- Matrices
update opinto_aiheet set sort_order = 1785185400 where id = 3;   -- Quadratics
update opinto_aiheet set sort_order = 1785185450 where id = 5;   -- Exponential functions
update opinto_aiheet set sort_order = 1785185500 where id = 97;  -- Logarithms

commit;
