-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit KUUDELLE kertyneelle kokonaisuudelle (2026-07-17–18, ks.
-- muistiinpanot.md): Aikavalitsin-korjaus, Ankkurireitit toiselle,
-- Laukaisusana+Siri, Ristiriitapaketin jäljellä olevat kohdat, Ehdotusten
-- vastaanotto (vaatii Juha-session) ja Bugi 27 (vaatii yön yli). EI toista
-- koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit eivät saa
-- nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä ole,
-- lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/063:n jälkeen.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Aikavalitsimen KELLONAIKA-tila: aseta "huomenna klo 9:00" yhdellä datetime-local-rullalla, muistutus asettuu oikeaksi absoluuttiseksi ajaksi';
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
    (v_list_id, 'OSA N · Aikavalitsin (korjattu 2026-07-17)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Aikavalitsimen PIKA-tila: aseta 0 pv / 10 h / 13 min kolmella rullalla, muistutus laskeutuu oikein yhdistettynä ("10 h 13 min")', v_max_sort + 30, false, false),

    (v_list_id, 'OSA O · Ankkurireitit toiselle (2026-07-18)', v_max_sort + 40, false, true),
    (v_list_id, 'Uuden ankkurin lisäysvaiheessa valitse "Juhalle" → ilmestyy Juhan ehdokaslistaan, EI omaan Ankkurit-listaan', v_max_sort + 50, false, false),
    (v_list_id, 'Olemassa olevan oman ankkurin ⋯-valikko → "Ehdota Juhalle" → sama tarkistus, oma ankkuri säilyy koskemattomana', v_max_sort + 60, false, false),

    (v_list_id, 'OSA P · Laukaisusana + Siri (2026-07-18)', v_max_sort + 70, false, true),
    (v_list_id, 'Kirjoita Laituriin "Juhalle: osta laturi" → päätyy Juhan ehdokkaaksi tekstillä "osta laturi", EI omaksi muruksi', v_max_sort + 80, false, false),
    (v_list_id, 'Kirjoita Laituriin "juttelin Juhalle eilen" (nimi tekstin SISÄLLÄ) → EI laukaise mitään, jää tavalliseksi omaksi muruksi', v_max_sort + 90, false, false),
    (v_list_id, 'Sanele Sirillä "laita Juhalle: X" (oma Shortcut rakennettuna) → X päätyy Juhan ehdokkaaksi', v_max_sort + 100, false, false),

    (v_list_id, 'OSA Q · Ristiriitapaketti, jäljellä olevat kohdat (2026-07-17)', v_max_sort + 110, false, true),
    (v_list_id, '"Keskusteltu ✓" → merkki rauhoittuu MOLEMMILLA laitteilla ilman sivun päivitystä (realtime)', v_max_sort + 120, false, false),
    (v_list_id, 'Lisää uusi päällekkäisyys jo kuitatulle päivälle → merkki herää punaiseksi uudelleen', v_max_sort + 130, false, false),
    (v_list_id, 'Bugi 25 -uusintatesti: perhetyöpuhelu + henkilökohtainen harjoittelu samaan aikaan → luokittuu NYT punaiseksi (ei enää "huomaa"-tasolle)', v_max_sort + 140, false, false),
    (v_list_id, 'Vakavuusluokat + omistajamerkit erottuvat silmällä (K/J/P-kirjaimet, full vs. attention selvästi eri ilme)', v_max_sort + 150, false, false),

    (v_list_id, 'OSA R · Ehdotusten vastaanotto (kahden käyttäjän testi)', v_max_sort + 160, false, true),
    (v_list_id, 'Juha hylkää tavallisen 💬-ehdotuksen → Katri EI näe hylkäystä mitenkään (ei ilmoitusta, ei tilatietoa)', v_max_sort + 170, false, false),
    (v_list_id, 'Ristiriidasta lähetetyllä keskustelulaji-ehdotuksella EI ole hylkäysvaihtoehtoa lainkaan, vain "Keskusteltu ✓" ja "Siirrä ⏭"', v_max_sort + 180, false, false),

    (v_list_id, 'OSA S · Bugi 27, hylätty äly-ehdotus (vaatii yön yli)', v_max_sort + 190, false, true),
    (v_list_id, 'Hylätty (× tai Kumoa) "huomenna"-tyyppinen äly-ehdotus EI nouse uudelleen seuraavana aamuna (sql/063 ajettu ensin)', v_max_sort + 200, false, false);
end $$;
