-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit KONSEPTIKIRJA.md 4.10b:n TASO 2 -ominaisuuksien jäljiltä
-- (2026-07-21, ks. muistiinpanot.md "Laiturin luote" / "Keskusteluteema
-- Varastossa" / "Vahdittu lepo Varastossa") — talon pysyvän testirivikäytännön
-- mukaisesti (ks. COPILOT.md "Uusi testattava toiminnallisuus").
--
-- HUOM: useat näistä (luote, kevyen päivän ehdotus, vahdittu lepo) vaativat
-- OIKEAN AJAN KULUMISEN (14 vrk oletusraja) — ei todeta yhdellä istunnolla.
-- Testirivit ohjeistavat säätämään rajan tilapäisesti pieneksi (esim. 0 pv)
-- jotta toiminta nähdään heti, sitten palauttamaan se ennalleen.
--
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/081:n jälkeen (081 luo list_type/
-- sovittu_linja/priority/vahdittu_raja_paivia-sarakkeet + laituri.teema_id).

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Avaa Varasto, valitse yläpalkista "🧵 Teema", luo uusi teema (esim. "Testi-teema") — tarkista että se ilmestyy Varasto-listalle 🧵-etuliitteellä ja avautuu OMAAN näkymäänsä (ei tavalliseen listanäkymään)';
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
    (v_list_id, 'OSA AC · TASO 2: Luote + Keskusteluteema + Vahdittu lepo (2026-07-21)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Teeman sisällä: aseta "Sovittu linja" (esim. "Ruutuaika 1h arkisin") — tarkista että se näkyy kiinnitettynä laatikkona yläreunassa päivämäärän kanssa. Päivitä se UUDELLEEN toisella tekstillä — tarkista Laiturin puolelta (tai Table Editorista laituri-taulusta) että VANHA linja tallentui uutena rivinä teemaan ("Sovittu (aiempi linja): ...")', v_max_sort + 30, false, false),
    (v_list_id, 'Teeman sisällä: vaihda "Nostoherkkyys" Tavallinen→Painava — tarkista Table Editorista että lists.priority päivittyi', v_max_sort + 40, false, false),
    (v_list_id, 'Avaa Laituri, lisää uusi muru, siirrä se ⋯-valikon "🧵➜ Siirrä teemaan" -kohdasta testiteemaan — tarkista että muru KATOAA Laiturin aktiivisesta näkymästä JA ilmestyy teeman sisään (jatkorivit pysyvät mukana jos niitä oli)', v_max_sort + 50, false, false),
    (v_list_id, 'Teeman sisällä painike "↩" murun kohdalla — tarkista että muru palaa näkyviin Laiturin aktiiviseen listaan', v_max_sort + 60, false, false),
    (v_list_id, 'Poista testiteema kokonaan (🗑-nappi teeman yläpalkissa) — tarkista että vahvistusdialogi kertoo KUINKA MONTA murua katoaa mukana (ei vain "0 asiaa"), ja että Table Editorista sekä lists- että laituri-rivit (ja niiden jatkorivit) katosivat pysyvästi', v_max_sort + 70, false, false),
    (v_list_id, 'Avaa Varasto, valitse "⏳ Vahdittu", luo uusi vahdittu-lista (esim. "Testi-vahti") — avaa se, aseta "Nouse ehdokkaaksi" -raja väliaikaisesti 0 päivään, lisää yksi rivi — odota ~5-10 min (cron-kierros) ja tarkista Table Editorista (ankkurit-taulu) että syntyi ehdokas source=''vahdittu'' MOLEMMILLE käyttäjille (Katri+Juha)', v_max_sort + 80, false, false),
    (v_list_id, 'Palauta Vahditun rajaksi järkevä arvo (esim. 14) testin jälkeen ettei se jää turhaan herkäksi', v_max_sort + 90, false, false),
    (v_list_id, 'Avaa Laituri — jos yli 14 vrk vanhoja muruja tai teemoja on olemassa, tarkista että "🌊 Luote (N)" -linkki näkyy haun yläpuolella. Napauta sitä, käy läpi muutama kohde: murulle kolme nappia (Anna olla / Arkistoi / Ankkuriin), teemalle kaksi (Anna olla / Avaa teema) — tarkista että "Avaa teema" navigoi oikeaan teemaan ja sulkee luoteen', v_max_sort + 100, false, false),
    (v_list_id, 'EI TESTATTAVISSA napauttamalla, vain kirjattu: "Kevyen päivän ehdotus" (2d) — jos huomiselle ei ole yhtään kellonaikamenoa kalenterissa JA yksikään aiempi ehdotus ei ole vielä pending, seuraavan cron-ajon pitäisi luoda YKSI ankkuriehdokas (source=''kevyt_paiva'') painavimmalle/vanhimmalle avoimelle teemalle — tarkistettavissa vasta oikean kevyen päivän kohdalla Table Editorista', v_max_sort + 110, false, false),
    (v_list_id, 'REGRESSIO: tarkista että normaalit Varasto-/Muistilaput-listat toimivat täysin ennallaan (luonti, raahaus, ✎/× -napit) — TASO 2 ei saa vaikuttaa list_type=''normal''-riveihin mitenkään', v_max_sort + 120, false, false);
end $$;
