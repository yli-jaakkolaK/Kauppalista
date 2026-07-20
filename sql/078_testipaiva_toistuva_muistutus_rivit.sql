-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Toistuva muistutus" -ominaisuuden jäljiltä (2026-07-19/20,
-- ks. muistiinpanot.md) — talon pysyvän testirivikäytännön mukaisesti (ks.
-- COPILOT.md "Uusi testattava toiminnallisuus").
--
-- HUOM prompti-/ajastustestaukseen: laskentalogiikka (mikä on "seuraava
-- kerta") on VERIFIOITU Node-simulaatiolla (DST-siirtymä 25.10. mukaan
-- lukien) ja mock-integraatiotestillä, EI oikealla ~5 min cron-ajolla eikä
-- oikealla laitteella yli päivien. Näistä riveistä osa vaatii siis oikean
-- kellonajan kulumisen (esim. tunti-intervalli) todentaakseen todellisen
-- lähetyksen — muut voi tarkistaa heti tallennuksen jälkeen katsomalla että
-- "seuraava: ..." -teksti mini-listassa täsmää odotettuun.
--
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/077:n jälkeen (077 luo
-- recurring/recurrence_type/weekdays/interval_n/interval_unit/time_of_day/
-- ends_at-sarakkeet joita nämä testit koskevat).

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Aseta 🔁 Toistuva -muistutus, tyyppi Viikonpäivät: valitse TI + TO, klo 08:00 — tarkista mini-listasta että "seuraava: ..." näyttää lähimmän tulevan ti/to klo 8:n (ei tätä hetkeä varhaisempaa)';
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
    (v_list_id, 'OSA AA · Toistuva muistutus (2026-07-19/20)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Odota ti/to klo 8:n laukaisu — TARKISTA että push tulee JA että rivi EI katoa listasta (sent_at pysyy nullina), ja "seuraava" on hypännyt oikeaan seuraavaan päivään', v_max_sort + 30, false, false),
    (v_list_id, 'ÄLÄ kuittaa mitenkään (ei kuittaus-UI:ta ole) — tarkista että toinenkin (ti/to) laukeaa ajallaan ilman mitään toimenpidettä välissä (jatkuvuus toimii ilman ackia)', v_max_sort + 40, false, false),
    (v_list_id, 'Aseta 🔁 Toistuva, tyyppi Väliajoin: joka 1 TUNTIA (ei kellonaikaa valittavissa) — odota tunti, tarkista että laukeaa täsmälleen kerran (ei kahdesti, ei nollaa)', v_max_sort + 50, false, false),
    (v_list_id, 'Aseta 🔁 Toistuva, tyyppi Väliajoin: joka 1 vuotta, kellonaika mikä tahansa, PÄIVÄMÄÄRÄ menneisyydessä olevaksi kellonajaksi tänään (esim. 5 min sitten) — tarkista että "seuraava" näyttää ENSI VUODEN saman päivän, ei tätä hetkeä', v_max_sort + 60, false, false),
    (v_list_id, 'Aseta SEKÄ 🔁 Toistuva ETTÄ 🎒 Valmistaudu (30 min) samalle muistutukselle — kun päärivi laukeaa, tarkista että valmistaudu-tönäisy siirtyy 30 min uuden "seuraava"-hetken eteen JA nollautuu uudelleen aktiiviseksi (ei jää odottamaan vanhaa hetkeä)', v_max_sort + 70, false, false),
    (v_list_id, 'Avaa muistutuspaneeli ja kytke "🔁 Toistuva" päälle — TARKISTA että "🔁 Sinnikäs" -rivi katoaa näkyvistä (yhdistelmä ei ole tuettu, piilotus riittää estoksi)', v_max_sort + 80, false, false),
    (v_list_id, 'Poista toistuva muistutus (×-nappi) — tarkista ettei enää tule uusia pusheja tältä riviltä (poisto lopettaa säännön kokonaan), ja mahdollinen liitetty valmistaudu-rivi katoaa mukana (cascade)', v_max_sort + 90, false, false),
    (v_list_id, 'REGRESSIO: aseta tavallinen kertaluontoinen JA erikseen sinnikäs muistutus samaan aikaan toistuvien rinnalla — tarkista että kaikki kolme lajia toimivat itsenäisesti ristikontaminoimatta toisiaan', v_max_sort + 100, false, false);
end $$;
