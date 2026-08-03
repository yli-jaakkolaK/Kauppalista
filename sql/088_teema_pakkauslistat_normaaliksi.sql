-- Kaksi pakkauslistaa (telttaretki + viikon reissu) on vahingossa luotu
-- list_type='teema' -tyyppisenä Varaston puolelta, jolloin ne näkyvät
-- Keskusteluteema-näkymänä (EI tuotteet-rivejä, ei täppäystä, ks. sql/081) —
-- käyttökelvoton pakkauslistalle. Korjaus: VAIN list_type 'teema' → 'normal'
-- (tavallinen täppäyslista). Category EI muutu — listat pysyvät Varastossa
-- (Katrin täsmennys 2026-08-03: "listat" tarkoitti listatyyppiä, ei
-- kategorian vaihtoa Muistilappuihin — pakkauslista sopii Varastoon,
-- KONSEPTIKIRJA.md periaate 7 "Varastossa lista nukkuu").
--
-- Nimet EIVÄT ole varmoja (listan nimi katkeaa UI:n omasta bugista, ks.
-- script.js lataaListatNakymaan-korjaus samassa erässä) — ilike-haku
-- väljillä avainsanoilla, ei tarkalla nimellä.
--
-- TURVATARKISTUS ennen siirtoa: jos jompaankumpaan listaan on jo siirretty
-- laituri-murujen sisältöä (teema_id viittaa siihen), pelkkä list_type-vaihto
-- tekisi siitä tavoittamattoman (teema-view ei enää aukea sille listalle,
-- mutta se ei myöskään näy tavallisena tuotteet-täppäyslistana). Silloin
-- migraatio PYSÄHTYY exceptioniin sen sijaan että hiljaa hylkäisi sisältöä —
-- vaatii silloin käsin tarkistuksen ennen jatkoa (turvainvariantti).
--
-- Aja tämä Supabasen SQL Editorissa. Tarkista ENSIN alla oleva SELECT mitä
-- rivejä tämä osuisi, ja vasta sitten aja DO-lohko (begin/commit).

-- 1) TARKISTA ENSIN (aja erikseen, lue tulos läpi ennen jatkoa):
-- select id, name, category, list_type from lists
--   where list_type = 'teema'
--   and (name ilike '%telttaretk%' or name ilike '%pakkaus%' or name ilike '%viikon reissu%' or name ilike '%reissu%');

begin;

do $$
declare
  v_osuma record;
  v_muru_maara int;
begin
  for v_osuma in
    select id, name from lists
    where list_type = 'teema'
      and (name ilike '%telttaretk%' or name ilike '%pakkaus%' or name ilike '%viikon reissu%' or name ilike '%reissu%')
  loop
    select count(*) into v_muru_maara from laituri where teema_id = v_osuma.id;
    if v_muru_maara > 0 then
      raise exception 'Lista "%" (id %) sisältää % Laiturista siirrettyä murua — list_type-vaihto tekisi ne tavoittamattomiksi. Tarkista käsin ennen migraatiota (esim. siirrä murujen sisältö tuotteet-riveiksi ensin).', v_osuma.name, v_osuma.id, v_muru_maara;
    end if;

    update lists set list_type = 'normal' where id = v_osuma.id;
    raise notice 'Muutettu tavalliseksi listaksi: % (id %)', v_osuma.name, v_osuma.id;
  end loop;
end $$;

commit;
