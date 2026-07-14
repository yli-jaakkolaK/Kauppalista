-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit keskiviikon (17.7.) löydösten uusintatestausta varten. EI
-- toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun (sort_order = nykyinen max + 10, 20, ...).
--
-- Aja tämä Supabasen SQL Editorissa.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Muistutus-ehdotus kirjoittaa oikeasti muistutukset-tauluun (ei "kalenteriin")';
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
    (v_list_id, 'OSA H · Keskiviikon löydökset (17.7.)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Laiturin ⚓-oikotie nostaa murun ankkuriksi ilman sijoitusta', v_max_sort + 30, false, false),
    (v_list_id, '↺ palauttaa sijoitetun murun sijoittamattomaksi', v_max_sort + 40, false, false),
    (v_list_id, 'Äly-loki näyttää tilan (aktiivinen/otettu/tehty/rauennut/kumottu) + linkin Laituriin', v_max_sort + 50, false, false),
    (v_list_id, '✨-ehdokas erottuu etusivulla (kulta katkoviivakehys, ei vain himmeys)', v_max_sort + 60, false, false),
    (v_list_id, 'Ankkurin tekstin napautus avaa muokkauksen', v_max_sort + 70, false, false),
    (v_list_id, 'Laiturin muru ja ✨-ehdotuskortti eivät katkea kesken tekstin', v_max_sort + 80, false, false);
end $$;
