-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Ristiriitapaketin" (2026-07-17, ks. muistiinpanot.md) uusinta-
-- testausta varten. EI toista koko listaa uudelleen (kuten sql/036 tekee) —
-- jo täpätyt rivit eivät saa nollautua. Idempotentti: lisää rivit vain jos
-- niitä ei vielä ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/059:n jälkeen.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Perusmerkki: Katri ja Juha sama kellonaika eri tapahtumissa → punainen "päällekkäin"-lippu';
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
    (v_list_id, 'OSA M · Ristiriitapaketti (kahden käyttäjän testi, 2026-07-17)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Perusmerkki ei-portti: eri kellonaika (ei päällekkäin) → ei merkkiä lainkaan', v_max_sort + 30, false, false),
    (v_list_id, 'Lippu: napauta punaista "päällekkäin"-merkkiä → vahvistus näyttää kumman tahansa henkilön menon otsikon+ajan', v_max_sort + 40, false, false),
    (v_list_id, '"Keskusteltu ✓" → merkki muuttuu kultaiseksi ohuemmaksi "keskusteltu"-merkiksi molemmilla käyttäjillä (realtime)', v_max_sort + 50, false, false),
    (v_list_id, 'Kuitatulle päivälle lisätään KOLMAS päällekkäinen tapahtuma → merkki herää punaiseksi uudelleen', v_max_sort + 60, false, false),
    (v_list_id, 'Vakavuusluokat: saman henkilön kaksi omaa menoa päällekkäin → kevyt "huomaa"-merkki, EI punainen eikä napautettava', v_max_sort + 70, false, false),
    (v_list_id, 'Vakavuusluokat: kahden ERI henkilön menot päällekkäin → punainen "päällekkäin" (ei enää "ei_koskaan"-poissulkua)', v_max_sort + 80, false, false),
    (v_list_id, 'Etusivun Kalenteri-laatan pallura kasvaa kun kuittaamaton punainen ristiriita ilmestyy (ilman että Kalenteria avataan)', v_max_sort + 90, false, false),
    (v_list_id, 'Pallura pienenee/sammuu heti kun ristiriita kuitataan tai poistuu', v_max_sort + 100, false, false),
    (v_list_id, 'Kuukausinäkymän piste: täytetty punainen (kuittaamaton) vs. kultainen rengas (kuitattu) vs. pieni ambripiste (huomio)', v_max_sort + 110, false, false);
end $$;
