-- Kurssitason Miro-linkki (2026-08-29, Katrin huomio: "siellä ei
-- pitäisikään olla mitään [aiheita], mutta kai voit yhdistää oikeisiin
-- kursseihin linkin niin että avaa sivun oikeasta kohdasta?") — kurssilla
-- on oma Frame Taulu 1:ssä RIIPPUMATTA siitä onko sille vielä lisätty
-- yhtään aihetta. opinto_aiheet.miro_opiskeluurl (sql/147) toimii
-- tarkempana OHITUKSENA per aihe kun sellainen halutaan (esim. jos aiheelle
-- on oma alue Framen sisällä); tämä on kurssin oma oletusarvo jota
-- script.js:n paivitaOpintoTehtavaMiroKoukku käyttää kun aiheella itsellään
-- ei ole omaa arvoa.
--
-- Idempotentti (add column if not exists). Ajettu jo suoraan MCP:n kautta
-- 29.8.2026 - tämä tiedosto on historiakirjaus (ks. sql/138:n vastaava malli).

begin;

alter table opinto_kurssit add column if not exists miro_opiskeluurl text;

commit;
