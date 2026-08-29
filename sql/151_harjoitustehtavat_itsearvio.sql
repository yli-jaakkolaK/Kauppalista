-- Itsearviointi Harjoittele-korttiin (2026-08-30) — puuttuva signaali
-- havaittu tarkistuskierroksella: pacer_vaihe_nyt etenee VAIN paljastus-
-- määrällä ("kuinka moneen on oikeasti tartuttu", Katrin oma tietoinen
-- valinta, ks. script.js:n tarkistaVaiheenEteneminen-kommentti) - ei mitään
-- signaalia siitä osasiko opiskelija tehtävän. Tämä EI muuta etenemis-
-- logiikkaa (se jätetään koskemattomaksi, tietoinen aiempi päätös) - lisää
-- vain rinnakkaisen, vapaaehtoisen "✅ Osasin / ❌ En osannut" -itsearvion
-- joka näkyy Harjoittele-korttina tarkkuuslukemana ilman että se vaikuttaa
-- vaiheen etenemiseen mitenkään.
--
-- Ajettu jo suoraan MCP:n kautta 30.8.2026 - tämä tiedosto on
-- historiakirjaus (ks. sql/138:n vastaava malli).

begin;

alter table harjoitustehtavat add column if not exists itse_arvioitu_oikein boolean;

commit;
