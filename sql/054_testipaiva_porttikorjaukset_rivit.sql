-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit kahden porttikorjauksen ("KAKSI PORTTIKORJAUSTA", 2026-07-16)
-- uusintatestausta varten: (1) toistolukko, (2) hytti-scopen tapahtumien
-- näkyvyys pääkalenterissa. EI toista koko listaa uudelleen (kuten sql/036
-- tekee) — jo täpätyt rivit eivät saa nollautua. Idempotentti: lisää rivit
-- vain jos niitä ei vielä ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Ikkuna-asia ei nouse useammin kuin kerran per kalenteripäivä (seuraa vähintään kahta yöajoa)';
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
    (v_list_id, 'OSA J · Kaksi porttikorjausta (16.7.)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Ikkuna-asian poisto kesken päivän hiljentää loppupäivän, seuraava aamu saa nostaa uudelleen', v_max_sort + 30, false, false),
    (v_list_id, 'Katri selaa Kalenterissa syyskuuhun: Lukkarikone-luennot näkyvät agendassa/viikossa/kuukaudessa', v_max_sort + 40, false, false),
    (v_list_id, 'Hytti-scopen tapahtuma EI näy kuittausjonossa eikä Kuormavahdin menolaskurissa', v_max_sort + 50, false, false),
    (v_list_id, 'Juha selaa samaan syyskuun ajankohtaan: Katrin hytti-luennot EIVÄT näy hänellä', v_max_sort + 60, false, false),
    (v_list_id, 'Hytin oman kortin 7 pv -kalenteri toimii ennallaan (ei muuttunut tässä korjauksessa)', v_max_sort + 70, false, false);
end $$;
