-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit Laiturin ketjun koti-mekanismin ja "ei tarvitse näkyä
-- Laiturissa" -täpän jäljiltä (2026-08-03, ks. KONSEPTIKIRJA.md 7b/7c,
-- sql/087/088) — talon pysyvän testirivikäytännön mukaisesti (ks.
-- COPILOT.md "Uusi testattava toiminnallisuus").
--
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä ole,
-- lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/087:n JA sql/088:n jälkeen.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Laiturissa: kirjoita uusi muru, avaa sen ⋯-valikko, valitse "🏠 Aseta koti" ja aseta koti mihin tahansa listaan/teemaan/Vahdittuun/Hytin korttiin — tarkista rivin meta-rivillä lukee "🏠 koti: <nimi>"';
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
    (v_list_id, 'OSA AF · Laiturin ketjun koti + kotiin-valuminen (2026-08-03)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Sen jälkeen "🧵 Jatka säiettä" samalle murulle kahdesti peräkkäin — tarkista että Laiturissa näkyy VAIN uusin jatkorivi otsikkona (ei muru itse, ei ensimmäinen jatkorivi), ja avaa koti (teema/lista) — vanhemmat segmentit näkyvät siellä oikeassa aikajärjestyksessä', v_max_sort + 30, false, false),
    (v_list_id, 'Kirjoita UUSI muru ILMAN kotia, jatka säiettä 3 kertaa — tarkista että 4. jatkorivin yritys torjutaan viestillä "valitse ensin koti" JA kirjoittamasi teksti säilyy tekstikentässä (ei häviä)', v_max_sort + 40, false, false),
    (v_list_id, 'Saman testin jälkeen aseta koti torjutulle murulle ⋯-valikosta — tarkista että ketjun jatkaminen onnistuu heti sen jälkeen ja vanhat 3 säiettä valuvat kotiin kerralla', v_max_sort + 50, false, false),
    (v_list_id, 'Laiturin rivin ⋯-valikosta "🙈 Ei tarvitse näkyä Laiturissa" — tarkista rivi katoaa Laiturin aktiivisesta listasta ja ilmestyy uuteen "🙈 Piilotetut (N)" -osioon listan alla, josta ↺-napilla saa sen takaisin näkyviin', v_max_sort + 60, false, false),
    (v_list_id, 'Asetukset → 🛟 Laituri: täppää jokin kohde (esim. yksi Muistilappu-lista) piilotus-listalta, aseta sitten Laiturin rivin kodiksi TÄSMÄLLEEN tuo kohde — tarkista että rivi piiloutuu Laiturista AUTOMAATTISESTI heti kodin asettamisen yhteydessä (ei erillistä piilotusta tarvita)', v_max_sort + 70, false, false),
    (v_list_id, 'Varastossa: avaa jompikumpi pakkauslista (telttaretki/viikon reissu, ks. sql/088) — tarkista että se avautuu NYT tavallisena täppäyslistana (ei enää Keskusteluteema-näkymänä) ja rivien lisäys/täppäys toimii normaalisti', v_max_sort + 80, false, false),
    (v_list_id, 'Muistilapuissa ja Varastossa: tarkista että pitkä listan nimi rivittyy kokonaan näkyviin (ei katkea ellipsillä eikä jää yksiriviseksi) — koskee erityisesti listoja joiden nimi on pidempi kuin näytön leveys', v_max_sort + 90, false, false),
    (v_list_id, 'Laiturin rivin "→ Sijoita listalle tai Hyttiin" -valikossa: tarkista ettei Keskusteluteema-tyyppisiä (🧵) listoja enää tarjota vaihtoehtona (ne ovat vain "🏠 Aseta koti" -valikossa)', v_max_sort + 100, false, false),
    (v_list_id, 'Asetukset → ⚓ Ankkurit: aseta "Näytä etusivulla enintään" arvoksi 0 ja palaa etusivulle — tarkista ettei yksikään ankkuri näy oletuksena mutta "+ N muuta odottaa — näytä kaikki" -linkki toimii edelleen; aseta sitten takaisin esim. 3:een', v_max_sort + 110, false, false);
end $$;
