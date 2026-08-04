-- Adds test rows to the "Testipäivä to 16.7." checklist (ks. sql/036) for
-- Siltasolmut + kaksitasoinen moottori + session-loki (2026-08-05, ks.
-- muistiinpanot.md "Siltasolmut") — korvaa sql/096:n vanhentuneet OSA AH
-- -rivit (ks. sql/096 yläkommentti), house testing convention.
--
-- Idempotentti — appends only new rows, never resets already-checked rows.
--
-- Run this in the Supabase SQL Editor after sql/097-100.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_first_row_name text := 'Hytti → Opinnot: tarkista että sql/100:n tuomat kurssit (Introduction to Programming, Algebra 2, Algebra 1 (Functions), Trigonometry) näkyvät kurssilistalla aiheineen — EI enää mitään "taitosolmuja" listassa (Taitosolmut-osio on tyhjä kunnes sillat tunnistetaan)';
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
    (v_list_id, 'OSA AI · Siltasolmut + kaksitasoinen moottori + session-loki (2026-08-05)', v_max_sort + 10, false, true),
    (v_list_id, v_first_row_name, v_max_sort + 20, false, false),
    (v_list_id, 'Pehmeä tavoiteikkuna: avaa Algebra 2 -kurssi, tarkista että Elokuun 6 aihetta näyttävät tavoiteikkunan (28.8.2026) ja että ne nousevat Tänään-osioon herkemmin kuin Lokakuun/Marraskuun aiheet (kauempana tavoiteikkunasta)', v_max_sort + 30, false, false),
    (v_list_id, 'TASO 1 -kova etusija: luo Table Editorista opinto_deadlinet-rivi jollekin Introduction to Programming -aiheelle 1-2 päivän päähän (tyyppi koe/palautus), jätä aihe priming-tilaan — tarkista että se ilmestyy Tänään-osioon VARMASTI (ei riipu kuormasta/muusta pisteytyksestä)', v_max_sort + 40, false, false),
    (v_list_id, 'Kurssin aktiivinen/arkistoitu-tila: arkistoi Table Editorista jokin kurssi (status=''arkistoitu''), tarkista ettei sen aiheet enää ilmesty Tänään-osioon eivätkä osallistu moottorin laskentaan', v_max_sort + 50, false, false),
    (v_list_id, 'Session-loki: avaa jokin aihe, paina ▶ Aloita, odota hetki, paina ⏸ Lopeta — tarkista ettei kaksi peräkkäistä ▶ Aloita-painallusta samalle TAI eri kohteelle onnistu ennen kuin edellinen on lopetettu (yksi kesken oleva istunto per käyttäjä)', v_max_sort + 60, false, false),
    (v_list_id, 'Session-loki järkevyystarkistus: aseta Asetuksista sessio_jarkevyys_tunnit väliaikaisesti pieneksi (esim. 0), käynnistä ja lopeta istunto — tarkista että kysymys "kesti oikeasti näin kauan?" ilmestyy mutta EI estä tallennusta jos vastaa kyllä', v_max_sort + 70, false, false),
    (v_list_id, 'Siltatunnistus (manuaalinen, ennen kuin AI-vaihe on rakennettu käyttöliittymään): kirjoita Table Editorista taitosolmut-riville testisilta + taitosolmu_viittaukset-rivi joka osoittaa kahteen eri kurssin aiheeseen, joista toisella on lähellä oleva deadline — tarkista että silta NOUSEE Tänään-osioon kun toinen viittaava aihe on encoding-vaiheessa (ikkuna auki) ja LASKEE pois kun kaikki viittaavat deadlinet ovat menneet ohi puskurin verran', v_max_sort + 80, false, false),
    (v_list_id, 'Kiireellisyyden leviäminen: lisää tarvitsee-kaari kahden taitosolmun välille (A tarvitsee B:tä), anna A:lle korkea silta-paino (lähellä oleva viittaava deadline) — tarkista että B:n pisteet nousevat vaikka B:llä itsellään ei olisi lähellä olevaa viittausta, ja ettei tämä riko AND-porttia (B pitää silti olla oma PACER-vaiheeltaan tarjottavissa)', v_max_sort + 90, false, false),
    (v_list_id, 'Asetukset → Kuormavahti: tarkista että kaikki neljä uutta kenttää (kurssi_kiireellisyys_paivia, silta_puskuri_paivia, silta_leviamissyvyys, sessio_jarkevyys_tunnit) näkyvät, tallentuvat ja säilyvät sivun uudelleenlatauksen jälkeen', v_max_sort + 100, false, false),
    (v_list_id, 'REGRESSIO: tarkista ettei vanha kuormavahti/huolilippu-logiikka (sql/094) rikkoutunut tämän moottorimuutoksen myötä — merkitse huoli lähelle tätä päivää, tarkista että kuormataso nousee kuten ennenkin', v_max_sort + 110, false, false);
end $$;
