-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Laiturin äly-lajittelun" ("Yksi luukku" erä 1, ks.
-- muistiinpanot.md) ja "Murun arkistoinnin" jäljiltä — talon pysyvän
-- testirivikäytännön mukaisesti (ks. COPILOT.md "Uusi testattava
-- toiminnallisuus"). Molemmat jakavat saman laituri.status-tilakoneiston
-- (sql/070), testataan siksi samassa erässä.
--
-- HUOM prompti-testaukseen: äly-luokittelun kolmea testitapausryhmää
-- (kauppa/hetki/ei-osumaa) EI VOI tarkistaa napauttamalla — ne riippuvat
-- yöajosta TAI Siri-murun heti-luokittelusta (kumpikaan ei laukea käsin
-- kirjoitetusta murusta sovelluksen UI:ssa). Rivit alla ohjaavat testaajan
-- kirjaamaan vastaavat murut Laituriin ja tarkistamaan tuloksen SEURAAVANA
-- päivänä (tai heti jos testataan Siri-reitin kautta) — ei ole olemassa
-- nopeampaa, aidosti kirjoittavaa tapaa varmistaa tätä.
--
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/070:n jälkeen (070 luo
-- ai_kauppa_ehdotus-sarakkeen ja arkistoitu-tilan joita nämä testit koskevat).

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Kirjoita Laituriin "maito" — seuraavana päivänä (tai heti Siri-reitin kautta) pitäisi ilmestyä ehdotus "Näyttää kauppatavaralta → Siirrä Kauppalistalle"';
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
    (v_list_id, 'OSA X · Laiturin äly-lajittelu + murun arkistointi (2026-07-19)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Hyväksy kauppaehdotus ("Siirrä Kauppalistalle") — tuotteet ilmestyvät oikeasti Kauppalistalle, muru merkitään sijoitetuksi Laiturissa (ei katoa)', v_max_sort + 30, false, false),
    (v_list_id, 'Kirjoita Laituriin "kampaaja huomenna klo 13" — seuraavana päivänä pitäisi ilmestyä hetki-ehdokas Ankkureihin (ei kauppaehdotusta)', v_max_sort + 40, false, false),
    (v_list_id, 'Kirjoita Laituriin "muista kysyä äidiltä se resepti" — EI PITÄISI tuottaa mitään ehdotusta, jää Laituriin tavallisena murun', v_max_sort + 50, false, false),
    (v_list_id, 'Sanele Shortcutilla "laita Juhalle vie roskat" (ilman kaksoispistettä) — pitäisi mennä suoraan Juhan ehdotukseksi, EI äly-lajitteluun', v_max_sort + 60, false, false),
    (v_list_id, 'Napauta jonkin Laiturin murun ⋯-valikkoa ja valitse "🗄 Arkistoi" — muru katoaa aktiivisesta listasta heti', v_max_sort + 70, false, false),
    (v_list_id, 'Avaa Laiturin "Arkisto"-linkki — juuri arkistoitu muru näkyy siellä luettavana', v_max_sort + 80, false, false),
    (v_list_id, 'Palauta muru arkistosta (↺) — ilmestyy takaisin aktiiviseen Laituriin sijoittamattomana', v_max_sort + 90, false, false);
end $$;
