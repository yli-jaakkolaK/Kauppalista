-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uuden rivin Rivien UI-remontin (2026-07-16) uusintatestausta varten.
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — torstaina jo
-- täpätyt rivit eivät saa nollautua. Idempotentti: lisää rivin vain jos
-- sitä ei vielä ole, lisätään listan loppuun (sort_order = nykyinen max + 10/20).
--
-- Aja tämä Supabasen SQL Editorissa.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_rivi_nimi text := 'Pakkauslistan pisimmät rivit + Kalenterin/Hytin pitkä rivi luettavissa (ei "tyyny…")';
begin
  select id into v_list_id from lists where name = 'Testipäivä to 16.7.';
  if v_list_id is null then
    raise exception 'Listaa "Testipäivä to 16.7." ei löytynyt — aja sql/036 ensin.';
  end if;

  if exists (select 1 from tuotteet where list_id = v_list_id and nimi = v_rivi_nimi) then
    return;
  end if;

  select coalesce(max(sort_order), 0) into v_max_sort from tuotteet where list_id = v_list_id;

  insert into tuotteet (list_id, nimi, sort_order, tehty, is_header) values
    (v_list_id, 'OSA G · Rivien UI-remontti (16.7.)', v_max_sort + 10, false, true),
    (v_list_id, v_rivi_nimi, v_max_sort + 20, false, false);
end $$;
