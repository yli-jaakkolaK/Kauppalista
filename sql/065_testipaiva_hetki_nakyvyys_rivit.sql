-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Ankkuri nousee liian aikaisin kaukaiselle hetkelle"
-- -bugikorjauksen (2026-07-18, ks. muistiinpanot.md, api/aly-nightly.js
-- laskeHetkiNakyvyys()) testausta varten — talon uuden pysyvän käytännön
-- mukaisesti (ks. COPILOT.md "Uusi testattava toiminnallisuus"). EI toista
-- koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit eivät saa
-- nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä ole,
-- lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/064:n jälkeen.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Kirjoita Laituriin tuleva "hetki" ~3 vk päähän (esim. "hammaslääkäri 6.8. klo 14") → EI nouse ankkuriehdokkaaksi seuraavana yönä';
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
    (v_list_id, 'OSA T · Hetki-ankkurin näkyvyys (Bugi 28, 2026-07-18)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Sama kaukainen hetki nousee vasta kohdepäivän aamuna (odota tai testaa lyhyemmällä esimerkillä, esim. huomenna)', v_max_sort + 30, false, false),
    (v_list_id, 'Ikkuna-tyyppinen takaraja-asia (esim. "osta liput 24.7. mennessä") nousee EDELLEEN heti kuten ennenkin, EI viivästy', v_max_sort + 40, false, false),
    (v_list_id, 'Katrin kaksi olemassa olevaa 6.8.-todiste-ehdokasta ovat KOSKEMATTOMINA (ei poistettu/muutettu tämän korjauksen yhteydessä)', v_max_sort + 50, false, false);
end $$;
