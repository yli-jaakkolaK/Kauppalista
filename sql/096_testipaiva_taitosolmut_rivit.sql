-- Adds test rows to the "Testipäivä to 16.7." checklist (ks. sql/036) for
-- Taitosolmut + Huolilippu (2026-08-04, ks. muistiinpanot.md "Taitosolmut" /
-- "Huolilippu") — house testing convention (ks. COPILOT.md/KONSEPTIKIRJA.md
-- OSA 5 kohta 7, "apin lista on se todellinen testauskäyttöliittymä").
--
-- Idempotentti — appends only new rows, never resets already-checked rows.
--
-- Run this in the Supabase SQL Editor after sql/092-095.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_first_row_name text := 'Hytti → Taitosolmut: avaa lista, tarkista että sql/095:n tuomat solmut (esim. "muuttujat", "Functions") näkyvät nimineen ja lähdeteksteineen';
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
    (v_list_id, 'OSA AH · Taitosolmut + Huolilippu (2026-08-04)', v_max_sort + 10, false, true),
    (v_list_id, v_first_row_name, v_max_sort + 20, false, false),
    (v_list_id, 'Luo uusi taitosolmu käsin ("+"-kentästä) — tarkista että se ilmestyy listaan ja avautuu napauttamalla', v_max_sort + 30, false, false),
    (v_list_id, 'AND-portti: avaa "koodausprojektin toteutus" -solmu, tarkista Tarvitsee-listasta että siinä on kymmeniä rivejä (osien 1-13 taidot, EI 4.1/10.4-työkalusolmuja) — tarkista ettei se tarjoudu Tänään-osiossa (vielä liian moni esitieto priming-tilassa)', v_max_sort + 40, false, false),
    (v_list_id, 'Vaihda YKSI koodauskurssin taito (esim. "muuttujat") encoding-tilaan vaihe-valikosta — tarkista ettei tämä YKSIN vielä riitä avaamaan koodausprojektia (AND vaatii KAIKKI)', v_max_sort + 50, false, false),
    (v_list_id, 'Elokuun matikkasolmut (Quadratic equations ym. 6kpl): tarkista ettei niiden välillä ole "Tarvitsee"-kaaria toisiinsa (rinnakkaisia, ei peräkkäisiä)', v_max_sort + 60, false, false),
    (v_list_id, '"Functions"-solmu: tarkista Liittyy-listasta että se yhdistyy Exponential functions / Intro to logarithms / Sine / Cosine / Tangent -solmuihin, JA ettei tämä liittyy-yhteys vaikuta mihinkään tarjontaan (Tänään-osio ei koske Functionsia pelkän liittyy-kaaren perusteella)', v_max_sort + 70, false, false),
    (v_list_id, 'Tänään opiskelussa -osio: tarkista että se voi näyttää SEKÄ opinto_aiheet- ETTÄ taitosolmu-tyyppisiä askeleita samaan aikaan (jos molempia on tarjolla), ja että "✓ Tehty" etenee PACER-vaihetta oikein kummallakin tyypillä', v_max_sort + 80, false, false),
    (v_list_id, 'Käsitekartta: avaa taitosolmu, valitse eri värejä ja piirrä, kokeile kumia, lisää "Tt"-napilla tekstilaatikko ja kirjoita siihen, raahaa laatikko toiseen kohtaan, paina "Tallenna käsitekartta" — sulje ja avaa solmu uudelleen, tarkista että piirros JA tekstilaatikot palautuvat oikeisiin kohtiin', v_max_sort + 90, false, false),
    (v_list_id, 'Käsitekartta puhelimella: tarkista sormella piirto ja tekstilaatikon raahaus toimivat kosketuksella (ei vain hiirellä)', v_max_sort + 100, false, false),
    (v_list_id, 'Huolilippu: merkitse huoli 🔴 huomiselle päivälle, avaa Hytti uudelleen — tarkista ettei "Tänään opiskelussa" -osio näytä enää kevyttä opintoa täysin ilman rajoitusta jos kuormaraja muuten olisi ylittynyt (vertaa käytöstä ennen/jälkeen merkinnän)', v_max_sort + 110, false, false),
    (v_list_id, 'Asetukset → Kuormavahti: tarkista että "Huolilippu: paino josta..." -kentät näkyvät ja tallentuvat (vaihda arvo, avaa Asetukset uudelleen, tarkista että uusi arvo säilyi)', v_max_sort + 120, false, false),
    (v_list_id, 'REGRESSIO: tarkista että vanha Opintopolku (opinto_kurssit/opinto_aiheet, "🗺️ Kartta") toimii ennallaan taitosolmujen rinnalla — ei kaksinkertaisia askelia, ei rikkoutunutta kurssinäkymää', v_max_sort + 130, false, false);
end $$;
