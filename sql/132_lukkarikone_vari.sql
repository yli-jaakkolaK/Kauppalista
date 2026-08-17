-- Lukkarikone (luennot) saa saman punaisen kuin Katrin oma kalenteri-
-- identiteetti (Katrin ohje 17.8.2026: "sama punainen mun luennoille").
-- Aiemmin väritön (vari NULL) — Lukkarikone on hytti-scopen syöte eikä
-- sql/061:n identiteettivärimigraatio koskenut sitä (ks. sen kommentti:
-- "Hytti-scopen opiskelu-/työsyötteet EIVÄT muutu").
--
-- Tämä EI muuta Itslearningia eikä Juhan Oma-syötettä — ne pysyvät
-- värittöminä / oman aiheensa mukaisina, ei osa tätä henkilöidentiteetti-
-- järjestelmää.
--
-- Idempotentti (plain UPDATE, turvallinen ajaa uudelleen). Ajettu jo
-- suoraan MCP:n kautta 17.8.2026 — tämä tiedosto on historiakirjaus.

begin;

update kalenteri_syotteet set vari = '#D32F2F' where name = 'Lukkarikone';

commit;
