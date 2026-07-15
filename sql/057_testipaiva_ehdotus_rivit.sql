-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Ankkurin ehdottaminen toiselle" -ominaisuuden (2026-07-16,
-- ks. muistiinpanot.md) uusintatestausta varten. Vaatii KAHDEN käyttäjän
-- session (Katri + Juha) — ei voi todeta yksin. EI toista koko listaa
-- uudelleen (kuten sql/036 tekee) — jo täpätyt rivit eivät saa nollautua.
-- Idempotentti: lisää rivit vain jos niitä ei vielä ole, lisätään listan
-- loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/056:n jälkeen.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Juha kirjoittaa Laituriin oman ajatuksen ja napauttaa 💬 "Ehdota Katrille"';
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
    (v_list_id, 'OSA L · Ankkurin ehdottaminen toiselle (kahden käyttäjän testi)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Katrin ankkureissa näkyy uusi ehdokas "💬 Juha: ..." katkoviivakehyksessä, oma pallura kasvaa', v_max_sort + 30, false, false),
    (v_list_id, 'Katri: ⚓ hyväksyy ehdotuksen → siitä tulee tavallinen oma ankkuri', v_max_sort + 40, false, false),
    (v_list_id, 'Juhan alkuperäinen muru on edelleen koskemattomana hänen Laiturissaan (ei kadonnut/liikkunut)', v_max_sort + 50, false, false),
    (v_list_id, 'Toinen ehdotus: Katri ⏭ siirtää sen 1 päivän päähän → katoaa listalta, palaa huomenna', v_max_sort + 60, false, false),
    (v_list_id, 'Kolmas ehdotus: Katri × hylkää sen → katoaa jäljettömiin, Juhalle EI näy mitään ilmoitusta hylkäyksestä', v_max_sort + 70, false, false),
    (v_list_id, 'Juha ei näe missään kohtaa omaa ehdotustaan enää lähetyksen jälkeen (ei tilanseurantaa)', v_max_sort + 80, false, false);
end $$;
