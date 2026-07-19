-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Sinnikäs muistutus" -ominaisuuden jäljiltä (2026-07-19, ks.
-- muistiinpanot.md) — talon pysyvän testirivikäytännön mukaisesti (ks.
-- COPILOT.md "Uusi testattava toiminnallisuus").
--
-- HUOM prompti-/ajastustestaukseen: sinnikäs muistutus riippuu OIKEASTA
-- kellonajasta kuluvasta ajasta (cron käy läpi ~5 min välein) — ei voi
-- todeta napauttamalla, vaatii todellisen ~1h odotuksen tai lyhyemmän
-- testi-ikkunan (esim. 30 min/2× tiheydellä testiä varten, jotta koko
-- sarja nähdään ~15 min sisällä).
--
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/075:n jälkeen (075 luo
-- persistent/window_minutes/frequency/sent_count/acked_at-sarakkeet joita
-- nämä testit koskevat).

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Aseta muistutus 30 min päähän, kytke "🔁 Sinnikäs" päälle ikkuna=30min/tiheys=2× — odota, pitäisi tulla 2 pushia ~15 min välein (ensimmäinen heti, koska ikkuna alkaa jo nyt)';
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
    (v_list_id, 'OSA Z · Sinnikäs muistutus (2026-07-19)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Napauta "✓ Hoidettu" ensimmäisen pushin jälkeen — TARKISTA ettei toista pushia tule ollenkaan (kuittaus lopettaa sarjan)', v_max_sort + 30, false, false),
    (v_list_id, 'Aseta TAVALLINEN muistutus (ei sinnikäs-täppää) — tarkista että tulee TÄSMÄLLEEN yksi push kuten ennen (regressiotesti, ei kahta eikä nollaa)', v_max_sort + 40, false, false),
    (v_list_id, 'Aseta muistutus jolla SEKÄ 🎒 Valmistaudu ETTÄ 🔁 Sinnikäs päällä — tarkista että valmistautumis-tönäisy tulee tasan KERRAN normaalisti, EI tärähdyssarjana (vain varsinainen muistutus on sinnikäs)', v_max_sort + 50, false, false),
    (v_list_id, 'Aseta sinnikäs muistutus mutta ÄLÄ kuittaa ollenkaan — odota kohdehetken ohi, tarkista ettei pusheja tule enää sen jälkeen (ikkunan loppu pysäyttää sarjan ilman kuittaustakin)', v_max_sort + 60, false, false);
end $$;
