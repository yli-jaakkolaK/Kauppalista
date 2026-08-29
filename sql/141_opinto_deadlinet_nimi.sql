-- opinto_deadlinet (kurssin kokeet/palautukset) sai vain pvm+tyyppi-parin,
-- ei mitään tapaa nimetä MITÄ palautusta/koetta rivi tarkoittaa - Katrin
-- huomio 29.8.2026 kahta oikeaa kurssia lisätessä: "as i'm adding home
-- works i can't write any title to it. it should not be mandatory, but
-- would be nice if those could be named." Valinnainen (nullable) - vanha
-- käytös (pelkkä "Koe"/"Palautus" + päivä) säilyy ennallaan kun nimeä ei
-- anneta, ks. script.js:n lataaOpintoKurssinDeadlinet().
--
-- Idempotentti (add column if not exists). Ajettu jo suoraan MCP:n kautta
-- 29.8.2026 - tämä tiedosto on historiakirjaus (ks. sql/138:n vastaava malli).

begin;

alter table opinto_deadlinet add column if not exists nimi text;

commit;
