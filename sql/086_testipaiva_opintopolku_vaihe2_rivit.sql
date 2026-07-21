-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Opintopolku VAIHE 2" -moottorin jäljiltä (2026-07-21, ks.
-- muistiinpanot.md "Opintopolku VAIHE 2") — talon pysyvän testirivikäytännön
-- mukaisesti (ks. COPILOT.md "Uusi testattava toiminnallisuus").
--
-- HUOM: moottorin TODELLINEN tarjonta (mikä aihe nousee minäkin päivänä) on
-- vaikea todentaa yhdellä istunnolla ilman oikeaa dataa monelta kurssilta —
-- puhdas laskentalogiikka on jo verifioitu Node-testillä (deadline-
-- priorisointi, kuormavaikutus, PACER-järjestys, SR-eteneminen, ks.
-- muistiinpanot.md), näiden testirivien tarkoitus on todentaa UI+tallennus
-- OIKEALLA Supabase-datalla, ei moottorin "oikeaa" valintaa sinänsä.
--
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/085:n jälkeen (085 luo
-- sr_interval_index/sr_next_review-sarakkeet + opinto_paivan_askeleet-taulun).

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Varmista että sinulla on Opintopolussa vähintään yksi kurssi jolla on 2-3 aihetta ERI PACER-vaiheissa (ks. OSA AD) — avaa Oma Hytti, tarkista että "🎯 Tänään opiskelussa" -osio ilmestyy Tehtävien YLÄPUOLELLE 1-2 kortilla';
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
    (v_list_id, 'OSA AE · Opintopolku VAIHE 2: kolmen voiman moottori (2026-07-21)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Sulje Hytti ja avaa se UUDELLEEN samana päivänä — tarkista IDEMPOTENSSI: samat 1-2 askelta pysyvät samoina, ei uusia/tuplaehdotuksia (tarkista Table Editorista opinto_paivan_askeleet — täsmälleen yksi rivi per aihe per päivä)', v_max_sort + 30, false, false),
    (v_list_id, 'Paina "Näytä ohje" jommallakummalla kortilla — tarkista että avautuu vaiheeseen sopiva ohjeteksti (esim. encoding = käsitekartta-ohje)', v_max_sort + 40, false, false),
    (v_list_id, 'Paina "En ehtinyt" toisella kortilla — tarkista kortti muuttuu "Ohitettu tänään" -tilaan JA Table Editorista ettei aiheen vaihe/sr_interval_index/sr_next_review muuttunut ollenkaan (ei rangaistusta)', v_max_sort + 50, false, false),
    (v_list_id, 'Paina "✓ Tehty" toisella kortilla — jos aihe oli "priming", tarkista Table Editorista että vaihe vaihtui "encoding":iin. Jos aihe oli "encoding", tarkista vaihe→"retrieval" JA sr_next_review asettui huomiseksi', v_max_sort + 60, false, false),
    (v_list_id, 'Aseta yksi aihe manuaalisesti "retrieval"-vaiheeseen ja sr_next_review MENNEEKSI päiväksi (Table Editorista) — avaa Hytti uudelleen (toisena päivänä TAI poistamalla tämän päivän opinto_paivan_askeleet-rivit ensin) — tarkista että aihe nousee ehdokkaaksi (SR-päivä koittanut)', v_max_sort + 70, false, false),
    (v_list_id, 'Aseta sama aihe sr_next_review HUOMISEKSI (tulevaisuuteen) ja poista tämän päivän askel-rivit — tarkista ettei aihe nouse (PACER/SR-ajastus kunnioitettu, ei ehdoteta liian aikaisin)', v_max_sort + 80, false, false),
    (v_list_id, 'EI HELPOSTI TESTATTAVISSA napauttamalla, vain kirjattu (vaatii oikean kalenteridatan): raskaana päivänä (≥5 kellonaikamenoa, ks. Kuormavahdin raja) moottorin pitäisi tarjota VAIN 1 askel ja suosia retrieval/ylläpito-tyyppistä kevyttä työtä uuden encoding-työn sijaan — testattavissa lisäämällä oikeasti 5+ kalenteritapahtumaa huomiselle ja poistamalla päivän askel-rivit uudelleenlaskennan pakottamiseksi', v_max_sort + 90, false, false),
    (v_list_id, 'REGRESSIO: tarkista että Opintopolku VAIHE 1:n toiminnot (kurssin luonti, materiaali, deadlinet, kokonaiskartta) toimivat täysin ennallaan moottorin rinnalla', v_max_sort + 100, false, false);
end $$;
