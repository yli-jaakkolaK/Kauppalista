-- Adds test rows to the "Testipäivä to 16.7." checklist (ks. sql/036) for
-- the Couple Time proposal feature (2026-08-04, ks. muistiinpanot.md
-- "Parisuhdeaika-ehdotus") — house testing convention (ks. COPILOT.md
-- "Uusi testattava toiminnallisuus").
--
-- Does NOT repeat the whole list (like sql/036 does once) — idempotent,
-- appends only new rows, never resets already-checked rows.
--
-- Run this in the Supabase SQL Editor after sql/090.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_first_row_name text := 'Aseta Kuormavahdin raja väliaikaisesti isoksi (esim. 20) ja poista/siirrä huomisen kalenteritapahtumat, jotta huominen on varmasti "rauhallinen" — odota seuraava ~5 min cron-kierros, tarkista että molemmille käyttäjille ilmestyy sama "💞 Parisuhdeaikaa <pvm> klo 19:30?" -ehdotus Ehdotukset-osioon';
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
    (v_list_id, 'OSA AG · Parisuhdeaika-ehdotus (2026-08-04)', v_max_sort + 10, false, true),
    (v_list_id, v_first_row_name, v_max_sort + 20, false, false),
    (v_list_id, 'Molemmilla käyttäjillä: paina "💞 Hyväksy" — tarkista että vahvistusdialogi avautuu ensin ("Hyväksytäänkö...") ja ettei mitään tapahdu jos painaa Peruuta', v_max_sort + 30, false, false),
    (v_list_id, 'Kun VAIN toinen on hyväksynyt: tarkista että hänen rivinsä muuttuu tekstiksi "...odotetaan kumppanin hyväksyntää" eikä Hyväksy-nappia enää näy, vain "× Peru"', v_max_sort + 40, false, false),
    (v_list_id, 'Kun TOINENKIN hyväksyy: tarkista että HÄNELLE ilmestyy "🎉 Molemmat hyväksyivät..." -kortti jossa on aito "➕ Lisää kalenteriin" -linkki — napauta sitä ja tarkista että Applen oma "lisää tapahtuma" -näkymä avautuu esitäytettynä (sama Kalenterisilta-mekanismi kuin muistutuksissa)', v_max_sort + 50, false, false),
    (v_list_id, 'Tarkista molemmilta käyttäjiltä että ehdotus on kadonnut Ehdotukset-osiosta hyväksynnän jälkeen (ei jää roikkumaan)', v_max_sort + 60, false, false),
    (v_list_id, 'REGRESSIO: tarkista ettei "Huominen näyttää rauhalliselta" (kevyt_paiva) -ehdotus estynyt tai käyttäytynyt oudosti tämän rinnalla — molemmat ehdotukset voivat olla auki yhtä aikaa', v_max_sort + 70, false, false),
    (v_list_id, 'Uusi kierros: aseta Kuormavahdin raja takaisin (esim. 5), luo uusi rauhallinen huominen -tilanne, odota ehdotus — paina TOISELLA käyttäjällä "× Ei sovi", vahvista dialogissa — tarkista että ehdotus katoaa MOLEMMILTA käyttäjiltä välittömästi eikä uutta ehdotusta tule ennen kuin rauhallinen päivä tunnistetaan taas (ei heti seuraavalla cron-kierroksella jos huominen on yhä rauhallinen — max yksi kerrallaan koskee vain PENDING-tilaa, joten tarkista tarkalleen mikä käytös on: uusi ehdotus voi syntyä heti jos ehto täyttyy uudelleen — kirjaa mitä oikeasti tapahtuu)', v_max_sort + 80, false, false),
    (v_list_id, 'Kuormavahti-kohdennus: varmista testillä (Table Editorista kalenteritapahtumia lisäämällä/poistamalla) ettei ehdotettu klo 19:30-20:30 -ikkuna koskaan osu päivälle jolla on jo tapahtuma tuolla kellonajalla, EIKÄ päivälle jolla kellonaikamenoja on Kuormavahdin rajan verran tai enemmän', v_max_sort + 90, false, false);
end $$;
