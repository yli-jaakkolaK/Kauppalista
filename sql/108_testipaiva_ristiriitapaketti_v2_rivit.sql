-- Adds test rows to the "Testipäivä to 16.7." checklist (ks. sql/036) for
-- Ristiriitapaketti v2 (2026-08-06, ks. muistiinpanot.md "Ristiriitapaketti
-- v2") — house testing convention.
--
-- Idempotentti — appends only new rows, never resets already-checked rows.
--
-- Run this in the Supabase SQL Editor after sql/105-107.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_first_row_name text := 'Asetukset → 👶 Lapset: lisää testilapsi, aseta ikä+nukkumaanmeno, tarkista että "Tallenna" toimii ja lapsi näkyy listassa';
begin
  select id into v_list_id from lists where name = 'Testipäivä to 16.7.';
  if v_list_id is null then
    raise exception 'Listaa "Testipäivä to 16.7." ei löytynyt — aja sql/036 ensin.';
  end if;

  if exists (select 1 from tuotteet where list_id = v_list_id and nimi = v_first_row_name) then
    return;
  end if;

  select coalesce(max(sort_order), 0) into v_max_sort from tuotteet where list_id = v_list_id;

  insert into tuotteet (list_id, nimi, sort_order, tehty, is_header) values
    (v_list_id, 'OSA AJ · Ristiriitapaketti v2 (2026-08-06)', v_max_sort + 10, false, true),
    (v_list_id, v_first_row_name, v_max_sort + 20, false, false),
    (v_list_id, 'Viikkopohja: aseta testilapselle Ma-Pe klo 08:15-15:30 -koulupäivä, jätä La-Su tyhjäksi — tarkista Table Editorista ettei viikonlopulle synny lapsi_viikkopohja-riviä', v_max_sort + 30, false, false),
    (v_list_id, 'Perustapaus (attention): lisää kaksi käsin luotua kalenteritapahtumaa samalle arkipäivälle klo 17-19 väliltä ilman tunnistetta (ei henkilo, ei syote_id) — tarkista että päivälle ilmestyy ⚠️ (lapsi hoivaikkunassa iltapäivällä)', v_max_sort + 40, false, false),
    (v_list_id, 'Sama tapaus mutta koulupäivän KESKELLÄ (esim. klo 10-11) — tarkista ettei ⚠️ ilmesty (lapsi koulussa, ei hoivaikkunassa)', v_max_sort + 50, false, false),
    (v_list_id, 'kattaa_lapset: avaa jompikumpi päällekkäinen tapahtuma, ⋯ → "👶 Ketkä lapset katettu", täppää testilapsi, Tallenna — tarkista että ⚠️ katoaa samalta illan päällekkäisyydeltä', v_max_sort + 60, false, false),
    (v_list_id, 'Ikäsoftaus: aseta testilapselle ika_yksin_illassa nykyistä ikää pienemmäksi — tarkista että sama ilta-ajan päällekkäisyys ei enää laukaise ⚠️:ää ollenkaan', v_max_sort + 70, false, false),
    (v_list_id, 'Päiväpoikkeus: luo lapselle "kotona koko päivän" -poikkeus tulevalle arkipäivälle, luo sille päivälle kaksi tunnistamatonta tapahtumaa koulupäivän KESKELLE (esim. klo 10-11) — tarkista että ⚠️ NYT ilmestyy (poikkeus voittaa viikkopohjan)', v_max_sort + 80, false, false),
    (v_list_id, 'FULL-taso koskematta: luo kaksi päällekkäistä tapahtumaa samalle henkilölle (tunnistettu syöte) koulupäivän keskelle — tarkista että ⚠️ ilmestyy TÄSTÄKIN riippumatta lapsista/kellonajasta (full ei koskaan riipu lapsista)', v_max_sort + 90, false, false),
    (v_list_id, 'Siirtymäpuskuri: luo kaksi peräkkäistä (ei päällekkäistä) tapahtumaa 0 min välein — tarkista ettei mitään tapahdu oletuksella, sitten nosta siirtymapuskuri_min Asetuksista isoksi (esim. 60) ja tarkista että ⚠️ nyt ilmestyy', v_max_sort + 100, false, false),
    (v_list_id, 'Huolilippu tapahtuma-ankkurilla: avaa mikä tahansa tapahtuma, ⋯ → "🚩 Merkitse huoli tähän", valitse väri — tarkista Table Editorista että paivan_huolet-riville tallentui sekä pvm ETTÄ kalenteri_tapahtuma_id', v_max_sort + 110, false, false),
    (v_list_id, 'REGRESSIO: tarkista ettei onkoRauhoitusIkkunassa() (Hytin rutiinipäällekkäisyyksien vaimennus, rauhoitus_alku/rauhoitus_loppu) muuttunut — sillä ei ole mitään tekemistä lasten kanssa', v_max_sort + 120, false, false);
end $$;
