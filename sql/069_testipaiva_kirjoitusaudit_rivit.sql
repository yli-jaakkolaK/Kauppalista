-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Kirjoituspolkujen auditoinnin" (2026-07-19, ks. muistiinpanot.md)
-- jäljiltä — talon pysyvän testirivikäytännön mukaisesti (ks. COPILOT.md
-- "Uusi testattava toiminnallisuus"). Tämä erä koski VIRHEENKÄSITTELYÄ
-- (~50 kirjoituspaikkaa script.js:ssä + api/-funktioissa) — normaali,
-- ONNISTUNUT käyttö ei saa näyttää MITÄÄN muutosta, vain epäonnistuneen
-- kirjoituksen käytös muuttui (nyt näkyvä virhe, ei hiljainen nieleminen).
-- Testirivit ovat siksi SMOKE-TESTI: varmista ettei tavallinen käyttö
-- rikkoutunut, ei yritä keinotekoisesti simuloida jokaista virhepolkua.
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/068:n jälkeen.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Lisää tuote Kauppalistalle normaalisti — toimii kuten ennen, ei uutta ilmoitusta onnistuessa';
begin
  select id into v_list_id from lists where name = 'Testipäivä to 16.7.';
  if v_list_id is null then
    raise exception 'Listaa "Testipäivä to 16.7." ei löytynyt — aja sql/036 ensin.';
  end if;

  if exists (select 1 from tuotteet where list_id = v_list_id and nimi = v_ensimmainen_rivi_nimi) then
    return;
  end if;

  select coalesce(max(sort_order), 0) into v_max_sort from tuotteet where list_id = v_list_id;

  insert into tuotteet (list_id, nimi, sort_order, tehty, is_header) values
    (v_list_id, 'OSA W · Kirjoituspolkujen auditointi (smoke-testi, 2026-07-19)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Kirjoita ajatus Laituriin normaalisti — tallentuu ja tyhjentää kentän kuten ennen', v_max_sort + 30, false, false),
    (v_list_id, 'Luo uusi Hytin kortti + rivi normaalisti — toimii kuten ennen', v_max_sort + 40, false, false),
    (v_list_id, 'Täppää/irrota ankkuri normaalisti — toimii kuten ennen, ei ylimääräisiä ilmoituksia', v_max_sort + 50, false, false),
    (v_list_id, 'Poista lista jolla on tapahtumahistoriaa — toimii kuten ennen (deleteList-malli koskematon)', v_max_sort + 60, false, false),
    (v_list_id, 'Kalenterin "Kuittaa kaikki" normaalilla kuittausjonolla — toimii kuten ennen', v_max_sort + 70, false, false),
    (v_list_id, 'Kytke laite lentotilaan, lisää Kauppalistalle tuote, kytke verkko takaisin → tuote synkkautuu automaattisesti kuten ennen (offline-jono)', v_max_sort + 80, false, false),
    (v_list_id, 'Jos jokin näistä EPÄONNISTUU oikeasti (esim. huono verkko kesken kirjoituksen): pitäisi nyt näkyä selkeä suomenkielinen ilmoitus ruudulla, ei hiljainen "ei mitään tapahtunut" -tunne', v_max_sort + 90, false, false);
end $$;
