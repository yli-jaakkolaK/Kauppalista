-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit kahdelle 2026-07-18 rakennetulle ominaisuudelle:
-- Valmistautumisvaihe muistutuksille (sql/066) ja Kalenterisilta (sql/067) —
-- talon pysyvän testirivikäytännön mukaisesti (ks. COPILOT.md "Uusi
-- testattava toiminnallisuus"). EI toista koko listaa uudelleen (kuten
-- sql/036 tekee) — jo täpätyt rivit eivät saa nollautua. Idempotentti:
-- lisää rivit vain jos niitä ei vielä ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/067:n jälkeen.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Aseta muistutus listariville/murulle, kytke "🎒 Valmistaudu 30 min ennen" päälle → syntyy KAKSI muistutusta';
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
    (v_list_id, 'OSA U · Valmistautumisvaihe muistutuksille (2026-07-18)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Valmistautumis-tönäisyn teksti alkaa "🎒 Valmistaudu: ..." ja saapuu ENNEN varsinaista muistutusta', v_max_sort + 30, false, false),
    (v_list_id, 'Poista päämuistutus (× muistutuspaneelin listasta) → valmistautumis-tönäisy katoaa AUTOMAATTISESTI mukana', v_max_sort + 40, false, false),
    (v_list_id, '"🎒 Valmistaudu" -valintaruutu on OLETUKSENA pois päältä joka kerta kun muistutuspaneeli avataan uudelleen', v_max_sort + 50, false, false),

    (v_list_id, 'OSA V · Kalenterisilta (2026-07-18)', v_max_sort + 60, false, true),
    (v_list_id, '✨-ehdokkaalla jolla on selkeä aika+aihe näkyy "➕ Lisää kalenteriin" -nappi ehdokaskortilla', v_max_sort + 70, false, false),
    (v_list_id, 'Napautus avaa (tai yrittää avata) iOS:n oman uuden tapahtuman -näkymän esitäytettynä otsikolla+ajalla', v_max_sort + 80, false, false),
    (v_list_id, '💬-ihmisehdotuksella EI näy "➕ Lisää kalenteriin" -nappia lainkaan (ei ajankohtaa tallennettuna)', v_max_sort + 90, false, false),
    (v_list_id, 'Applen kautta lisätty tapahtuma ilmestyy takaisin Sataman Kalenteriin ~5 min sisällä (normaali kalenterisynkka)', v_max_sort + 100, false, false);
end $$;
