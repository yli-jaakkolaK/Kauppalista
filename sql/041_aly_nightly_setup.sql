-- E3-keskiportaan V1 "äly toimii, ihminen valvoo" — perusasetukset.
--
-- 1. Kytkin datana: aly_yoajo ('on'/'off') asetukset-taulussa, jotta yöajo
--    voidaan sammuttaa ilman koodimuutosta jos käytös yllättää. Oletus
--    'on'. Viimeisimmän ajon aikaleimaa (aly_yoajo_last_run) EI siemennetä
--    tässä — se luodaan lennossa api/aly-nightly.js:n ensimmäisellä
--    ajokerralla (puuttuva rivi tulkitaan "ei koskaan ajettu" -tilaksi).
--
-- 2. ankkurit.is_candidate: erottaa älyn ehdottamat ankkuriehdokkaat
--    käyttäjän omista/käsin valituista ankkureista. Ehdokas (true) EI
--    lasketa mukaan etusivun "3 tärkeintä" -rajaan eikä näy tavallisten
--    ankkurien joukossa — se näytetään erikseen ✨-merkillä niiden ALLA,
--    kunnes käyttäjä joko ottaa sen omakseen (false), täppää tehdyksi,
--    tai poistaa sen. Turvallinen lisäys olemassa olevaan tauluun — ei
--    CHECK-rajoitetta `source`-sarakkeessa, joten source='aly' toimii jo
--    ilman skeemamuutosta.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

insert into asetukset (key, value) values ('aly_yoajo', 'on')
on conflict (key) do nothing;

alter table ankkurit add column if not exists is_candidate boolean not null default false;

commit;
