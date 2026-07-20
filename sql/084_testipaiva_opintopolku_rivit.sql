-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Opintopolku VAIHE 1" -ominaisuuden jäljiltä (2026-07-21, ks.
-- muistiinpanot.md "Opintopolku") — talon pysyvän testirivikäytännön
-- mukaisesti (ks. COPILOT.md "Uusi testattava toiminnallisuus").
--
-- HUOM: Opintopolku on YKSITYINEN (owner_id-RLS, sama malli kuin Hytti
-- muutenkin) — testaa omalla tilillä, ei tarvitse kahta tiliä paitsi
-- regressiokohdassa (varmista ettei toinen käyttäjä näe toisen kursseja).
--
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/083:n jälkeen (083 luo
-- opinto_kurssit/opinto_aiheet/opinto_deadlinet-taulut).

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Avaa Oma Hytti — tarkista että uusi "📚 Opinnot" -osio näkyy Korttien alla, "🗺️ Kartta" -linkki oikeassa yläkulmassa';
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
    (v_list_id, 'OSA AD · Opintopolku VAIHE 1 (2026-07-21)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Lisää uusi kurssi (esim. "Testikurssi") — tarkista se ilmestyy listaan ja avautuu omaan näkymäänsä napautettaessa', v_max_sort + 30, false, false),
    (v_list_id, 'Kurssin sisällä: kirjoita "Materiaali"-kenttään linkki/teksti, paina "Tallenna materiaali" — sulje ja avaa kurssi uudelleen, tarkista teksti säilyi', v_max_sort + 40, false, false),
    (v_list_id, 'Lisää 2-3 aihetta kurssille — tarkista että jokaisella on vaihevalitsin (oletus "Aloittamatta") ja että vaihtaminen tallentuu (sulje/avaa kurssi uudelleen)', v_max_sort + 50, false, false),
    (v_list_id, 'Lisää kurssille yksi deadline (esim. "Koe" + päivämäärä) — tarkista se näkyy Deadlinet-listassa oikein muotoiltuna', v_max_sort + 60, false, false),
    (v_list_id, 'Aseta yksi aihe vaiheeseen "Hallussa" tai "Ylläpidossa", yksi "Opiskelussa"/"Kertauksessa", yksi "Aloittamatta" jättäen — avaa "🗺️ Kartta" Hytin yläkulmasta, tarkista että kurssin palkki näyttää KOLME väriosuutta (kulta=hallussa, meripihka=työn alla, harmaa=edessä) oikeassa suhteessa', v_max_sort + 70, false, false),
    (v_list_id, 'Tarkista että kartassa näkyy myös lähin tuleva deadline kurssin alla ("📅 Lähin: ...")', v_max_sort + 80, false, false),
    (v_list_id, 'Poista testikurssi kokonaan (🗑-nappi) — tarkista Table Editorista että sekä opinto_kurssit- ETTÄ sen opinto_aiheet-/opinto_deadlinet-rivit katosivat (cascade)', v_max_sort + 90, false, false),
    (v_list_id, 'REGRESSIO kahdella tilillä: kirjaudu toisella tilillä (Juha) — tarkista ettei Katrin kursseja näy siellä ollenkaan (yksityinen, sama periaate kuin Hytin kortit)', v_max_sort + 100, false, false),
    (v_list_id, 'EI TÄSSÄ VAIHEESSA: vaiheen automaattinen eteneminen, spaced repetition -muistutukset, arjen "tänään opiskelet" -ohjaava ikkuna — nämä ovat Vaihe 2, tietoinen rajaus, ei bugi jos puuttuvat', v_max_sort + 110, false, false);
end $$;
