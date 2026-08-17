-- Korjaa sql/122:n ohjematriisi-seed sung-metodi.md:n 17.8.2026-uudelleen-
-- kirjoituksen mukaiseksi (ks. myos "Sataman opiskelumoottori -
-- rakennusjarjestys" -dokumentin lisays 17.8.2026, "sung-metodi.md on
-- korvattu kokonaan").
--
-- sql/122:ssa oli kaksi asiasisaltovirhetta jotka uusi lahde nimeaa
-- eksplisiittisesti korjauksiksi (§27):
--
-- 1. PERO-vaiheen "reference" ohje kuvasi sen vaarin karttaan tehtavana
--    tarkennuksena. Oikea kehys: parkkipaikka - pikkuyksityiskohdat
--    (PACER-tietotyyppien R/E-aines: vakiot, nimet, luvut, konkreettiset
--    esimerkit) siirretaan POIS paakartalta omaan varastoon, ei kirjata
--    karttaan (sung-metodi.md §5 R/E-tyypit "varastoi + kertaa", §27).
--    Tarkkaa askel-askeleelta-sanamuotoa ei ole lahteessa (§26, tunnustettu
--    aukko) - tama rivi on siksi merkitty lahde='A' (oma synteesi), ei 'S'.
-- 2. Encoding/conceptual-rivi viittasi vaarin kirjoitettuun "GRINDE"-
--    lyhenteeseen. Oikea on GRIND, kuusi askelta: Grouping, Relational,
--    Interconnected, Nonverbal, Directional, Emphasized (§10, §27 - vanha
--    "Reflective"-tulkinta ei perustunut mihinkaan lahteeseen).
--
-- Samalla tarkennettu priming (§12, kolme askelta: hahmota maasto / tee
-- arvioita ja hypoteeseja / valmistele tuleva itsesi) ja encoding/
-- procedural+analogous (§5) sanatarkemmiksi - vanhat rivit olivat liian
-- karsittuja lyhennelmia, uusi lahde antaa tarkemman sanamuodon.
--
-- Retrieval- ja overlearning-rivit EIVAT muutu - ne pohjautuvat
-- rakennusjarjestys-dokumentin omaan B3-taulukkoon, joka ei muuttunut.
--
-- lahde-sarakkeen CHECK laajennetaan 'P':lla ja 'X':lla koska uusi lahde
-- laajentaa merkintatavat nelaan ([S]/[A]/[P]/[X], §-alku) - ei viela
-- kaytossa tassa seedissa mutta skeeman pitaa sallia se jatkossa.
--
-- Aja tama Supabasen SQL Editorissa.

begin;

alter table ohjematriisi drop constraint if exists ohjematriisi_lahde_check;
alter table ohjematriisi add constraint ohjematriisi_lahde_check
  check (lahde in ('S', 'A', 'P', 'X'));

delete from ohjematriisi where pero_vaihe in ('priming', 'encoding', 'reference');

insert into ohjematriisi (pero_vaihe, pacer_tyyppi, kierros_numero, ohje, lahde, sort_order) values

-- === PRIMING — sama kaikille tyypeille (sung-metodi.md §12, kolme askelta) ===
('priming', null, null,
 'Hahmota maasto: käy kaikki lähteet rinnakkain (älä yksi kerrallaan) ja skimmaa otsikot, väliotsikot, lihavoinnit ja tärkeät kuvat — loput ohitat tietoisesti. Merkitse samalla mistä lähteestä löytyy minkätasoista tietoa.',
 'S', 0),
('priming', null, null,
 'Tee arvioita ja hypoteeseja: vertaa ideoita keskenään, arvioi kuinka tärkeä jokin vaikutussuhde on. Nämä ovat hypoteeseja, ei varmuuksia — keskity siihen miten aiheesta kannattaa ajatella, älä siihen mitä pitää muistaa.',
 'S', 1),
('priming', null, null,
 'Valmistele tuleva itsesi: kirjoita kysymyksiä kohdista jotka vaikuttivat monimutkaisilta (kenttä alla), ja etsi aktiivisesti kohtia jotka eivät tunnu järkeviltä.',
 'S', 2),

-- === ENCODING (sung-metodi.md §5, §10, §23) ===
('encoding', 'conceptual', null,
 'BHS:n viisi askelta: kerää avainsanat ja termistö yhteen → rajattu kysely käsitteiden välisistä suhteista ja tärkeydestä ("miksi tämä on tärkeää?") → sama kysely chunkien välisiin suhteisiin + tiukka priorisointi → esitä suhteet epälineaarisesti ja visuaalisesti GRINDillä (Grouping, Relational, Interconnected, Nonverbal, Directional, Emphasized) → toista kysely ja erota irralliset yksityiskohdat omaan Reference-varastoon.',
 'S', 0),
('encoding', 'procedural', null,
 'Sovella todellisuudessa niin aikaisin kuin mahdollista. Jos et voi harjoitella juuri nyt, älä kuluta tätä materiaalia — siirry muuhun tai odota, älä yritä muistaa sitä sillä välin.',
 'S', 1),
('encoding', 'analogous', null,
 'Tutki analogiaa: Miltä osin nämä ovat samanlaisia? Miltä osin erilaisia? Missä tilanteessa analogia lakkaa toimimasta? Onko parempaa analogiaa, tai voiko tätä laajentaa?',
 'S', 2),

-- === REFERENCE — parkkipaikka, ei tyyppikohtainen (sung-metodi.md §5 R/E, §27) ===
('reference', null, null,
 'Tämä on parkkipaikka, ei kartan tarkennus. Siirrä pikkuyksityiskohdat (vakiot, nimet, luvut, muuttujaluettelot, konkreettiset esimerkit ja todisteet) pois pääkartalta omaan varastoon. Älä käytä encoding-aikaa niiden ulkoaopetteluun — kertaus tapahtuu myöhemmin suorana faktapalautuksena, esim. flashcardeilla.',
 'A', 0);

commit;
