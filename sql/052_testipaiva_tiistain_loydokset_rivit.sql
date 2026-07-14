-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit tiistain (14.7.) löydösten + ilta-kiilan uusintatestausta
-- varten. EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo
-- täpätyt rivit eivät saa nollautua. Idempotentti: lisää rivit vain jos
-- niitä ei vielä ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Ankkurin lasku (⚓ pois) ei koskaan poista sisältöä, vain nostaa pois';
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
    (v_list_id, 'OSA I · Tiistain löydökset + ilta-kiila (14.7.)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, '5s kumottava toast näkyy jokaisesta ankkurin poistosta, Kumoa toimii', v_max_sort + 30, false, false),
    (v_list_id, 'Uusi käsin luotu ankkuri: lasku laskee sen Laituriin, ei tuhoa', v_max_sort + 40, false, false),
    (v_list_id, 'Ankkurin ⏰ ja ⚓ eivät enää sekoitu keskenään (kokeile useasti)', v_max_sort + 50, false, false),
    (v_list_id, 'Pitkä ankkuri ("vastaa Piispanristin sahalle...") rivittyy, ei katkea', v_max_sort + 60, false, false),
    (v_list_id, 'Muistutuspaneelissa lukee Aseta + Peruuta, ei enää Sulje', v_max_sort + 70, false, false),
    (v_list_id, 'Ankkurin muistutus säilyy laskun jälkeen (seuraa kotiin, ei katoa)', v_max_sort + 80, false, false),
    (v_list_id, 'Muistutus toimii ja tulee perille push-ilmoituksena (KIILA-vahvistus)', v_max_sort + 90, false, false);
end $$;
