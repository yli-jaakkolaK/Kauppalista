-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Murun säie" -ominaisuuden jäljiltä (2026-07-20/21, ks.
-- muistiinpanot.md "Murun säie") — talon pysyvän testirivikäytännön
-- mukaisesti (ks. COPILOT.md "Uusi testattava toiminnallisuus").
--
-- HUOM: herätyspäivän todentaminen kokonaisuudessaan (ankkuriehdokkaan
-- nousu oikeana päivänä) vaatii oikean vuorokauden vaihtumisen, ei voi
-- todeta napauttamalla — testirivi ohjeistaa asettamaan herätyksen
-- MENNEEKSI päiväksi jotta ehdokas nousee HETI tarkistettavaksi ilman odotusta.
--
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/079:n jälkeen (079 luo
-- laituri_jatkorivit-taulun jota nämä testit koskevat).

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Avaa Laituri, lisää uusi ajatus (esim. "Lapsen koulujuttu — kesken jäi keskustelu ruutuajasta") — avaa sen ⋯-valikko, tarkista että "🧵 Jatka säiettä" on listassa';
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
    (v_list_id, 'OSA AB · Murun säie (2026-07-20/21)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Klikkaa "Jatka säiettä", kirjoita jokin jatkoteksti ilman herätystä, paina Tallenna — tarkista että jatkorivi ilmestyy murun ALLE listaan sisennettynä ("↳ ...")', v_max_sort + 30, false, false),
    (v_list_id, 'Lisää TOINEN jatkorivi samalle murulle, tällä kertaa kytke "Muistuta" päälle ja valitse herätyspäiväksi EILINEN (menneisyys) — tarkista Table Editorista (ankkurit-taulu) että syntyi uusi rivi source=''jatkorivi'', is_candidate=true, visible_from menneisyydessä', v_max_sort + 40, false, false),
    (v_list_id, 'Avaa etusivu — koska visible_from on menneisyydessä, murun herätysehdokkaan pitäisi näkyä Ankkurit-ehdotuksissa tekstillä "... — oletteko palanneet?"', v_max_sort + 50, false, false),
    (v_list_id, 'Poista koko testimuru (×-nappi Laiturissa) — tarkista Table Editorista että sekä laituri_jatkorivit-rivit ETTÄ source=''jatkorivi''-ankkuriehdokas katosivat mukana (cascade + erillinen siivous)', v_max_sort + 60, false, false),
    (v_list_id, 'REGRESSIO: tarkista että murun tavalliset toiminnot (⚓ ankkurointi, → sijoitus, 🗄 arkistointi, ✨ ehdotus) toimivat ennallaan säikeellisellä murulla', v_max_sort + 70, false, false),
    (v_list_id, 'EI TESTATTAVISSA napauttamalla, vain kirjattu: äly-yöajon pitäisi seuraavana yönä lukea murun VIIMEISINTÄ jatkoriviä sen "tilana" (luokittelun pohjana), ei alkuperäistä murutekstiä — tarkistettavissa vasta yöajon jälkeen Table Editorista (aly_evaluated.content pitäisi täsmätä viimeisimpään jatkoriviin, ei alkuperäiseen muruun)', v_max_sort + 80, false, false);
end $$;
