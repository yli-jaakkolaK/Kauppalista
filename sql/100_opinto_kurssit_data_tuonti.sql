-- Kurssien oikea tuonti opinto_kurssit/opinto_aiheet-radalle (2026-08-05,
-- ks. muistiinpanot.md "Siltasolmut" — korvaa sql/095:n taitosolmu-tuonnin,
-- ks. sen yläkommentti). Sama sisältö kuin alkuperäisissä lähdetiedostoissa
-- (hytti_koodauskurssi_taidot.md, hytti_matikka_taidot.md), nyt oikeassa
-- paikassa: normaali kurssitehtävärata, EI taitosolmuina.
--
-- POIS JÄTETTY TIETOISESTI (Katrin rajaus 2026-08-05, ei vielä aktiivisia):
-- Advanced Course in Programming (osat 8-14), Linear algebra (Helmikuu-
-- Maaliskuu 2027), Get Ready for Precalculus (Kesä 2027). Lisätään myöhemmin
-- samalla AI-avusteisella tuontivirralla kun ne oikeasti tulevat ajankohtaisiksi.
-- Huhtikuun 2027 kertauskuukaudelle ei omaa riviä (lähdetiedoston oma huomio:
-- "ei ole oma taito vaan tilamerkintä" aiemmille — hoituu normaalilla PACER/
-- SR-kierrolla kun Eksponentit/Logaritmit/Funktiot etenevät sinne asti).
--
-- materiaali-kenttä on kevyt TOC-tyylinen tiivistelmä per kurssi — sama
-- sisältö toimii sekä ihmisen omana muistina ETTÄ tulevan siltatunnistuksen
-- (AI lukee kaikkien aktiivisten kurssien materiaalin yhtenä nippuna) syötteenä.
--
-- opinto_kurssit.status käyttää saraketason oletusarvoa 'aktiivinen' (sql/097)
-- — ei tarvitse asettaa erikseen.
--
-- Aja tämä Supabasen SQL Editorissa sql/097:n jälkeen.

begin;

do $$
declare
  v_owner uuid;
  v_intro_id bigint;
  v_alg2_id bigint;
  v_alg1_id bigint;
  v_trig_id bigint;
begin
  select user_id into v_owner from hytti_omistajat where henkilo = 'katri';
  if v_owner is null then
    raise exception 'hytti_omistajat-taulusta ei löytynyt riviä henkilo=''katri'' - aja sql/027 ensin.';
  end if;

  if exists (select 1 from opinto_kurssit where owner_id = v_owner and name = 'Introduction to Programming') then
    return;
  end if;

  -- === Introduction to Programming (osat 1-7) ===
  insert into opinto_kurssit (owner_id, name, materiaali) values (
    v_owner, 'Introduction to Programming',
    'Python Programming MOOC 2026, Helsingin yliopisto — https://programming-26.mooc.fi/ (BSCS1001, 5 op). ' ||
    'Osa 1 Getting started: peruskulku, tulostus, syöte, muuttujat, aritmetiikka, ehtolauseet. ' ||
    'Osa 2 Ohjelmoinnin peruskäsitteet: haarautuvat/yhdistetyt ehdot, silmukat. ' ||
    'Osa 3: ehdolliset/sisäkkäiset silmukat, merkkijonot, funktion määrittely. ' ||
    'Osa 4: kehitysympäristö, funktion parametrit/paluuarvot, listat, for-silmukka, tulosteen muotoilu. ' ||
    'Osa 5: listan metodit, viittaukset, sanakirjat, monikot. ' ||
    'Osa 6: tiedostot (luku/kirjoitus), virheenkäsittely, näkyvyysalue. ' ||
    'Osa 7: moduulit, satunnaisuus, aika/päivämäärä, datankäsittely, oma moduuli.'
  ) returning id into v_intro_id;

  insert into opinto_aiheet (kurssi_id, name) values
    (v_intro_id, '1.1 ohjelman peruskulku, tulostus'),
    (v_intro_id, '1.2 syötteen lukeminen'),
    (v_intro_id, '1.3 muuttujat'),
    (v_intro_id, '1.4 aritmeettiset operaatiot'),
    (v_intro_id, '1.5 ehtolauseet'),
    (v_intro_id, '2.1 ohjelmoinnin peruskäsitteet'),
    (v_intro_id, '2.2 haarautuvat ehtolauseet'),
    (v_intro_id, '2.3 yhdistetyt ehdot (and/or/not)'),
    (v_intro_id, '2.4 silmukat (perusmuoto)'),
    (v_intro_id, '3.1 ehdolliset silmukat'),
    (v_intro_id, '3.2 merkkijonot'),
    (v_intro_id, '3.3 sisäkkäiset silmukat'),
    (v_intro_id, '3.4 funktion määrittely'),
    (v_intro_id, '4.1 kehitysympäristö ja debuggaus'),
    (v_intro_id, '4.2 funktion parametrit ja paluuarvot'),
    (v_intro_id, '4.3 listat'),
    (v_intro_id, '4.4 for-silmukka listan yli'),
    (v_intro_id, '4.5 tulosteen muotoilu'),
    (v_intro_id, '4.6 merkkijonot ja listat yhdessä'),
    (v_intro_id, '5.1 listan metodit'),
    (v_intro_id, '5.2 viittaukset'),
    (v_intro_id, '5.3 sanakirjat'),
    (v_intro_id, '5.4 monikot'),
    (v_intro_id, '6.1 tiedoston lukeminen'),
    (v_intro_id, '6.2 tiedoston kirjoittaminen'),
    (v_intro_id, '6.3 virheenkäsittely (try/except)'),
    (v_intro_id, '6.4 muuttujan näkyvyysalue'),
    (v_intro_id, '7.1 moduulit ja niiden tuonti'),
    (v_intro_id, '7.2 satunnaisuus'),
    (v_intro_id, '7.3 aika ja päivämäärä'),
    (v_intro_id, '7.4 datankäsittely'),
    (v_intro_id, '7.5 oman moduulin kirjoittaminen'),
    (v_intro_id, '7.6 kielen lisäominaisuudet');

  -- === Algebra 2 (Elokuu + Lokakuu + Marraskuu 2026) ===
  insert into opinto_kurssit (owner_id, name, materiaali) values (
    v_owner, 'Algebra 2',
    'Khan Academy — https://www.khanacademy.org/math/algebra2. ' ||
    'Elokuu: toisen asteen yhtälöt (quadratics), tekijöihinjako, ratkaisukaava, kuvaajat, yhtälöryhmät, eksponentiaalinen kasvu/väheneminen. ' ||
    'Lokakuu: eksponenttifunktiot, kasvu/väheneminen, eksponenttiyhtälöt. ' ||
    'Marraskuu: logaritmin peruskäsite, logaritmin ominaisuudet, logaritmiyhtälöiden ratkaisu.'
  ) returning id into v_alg2_id;

  insert into opinto_aiheet (kurssi_id, name, tavoiteikkuna) values
    (v_alg2_id, 'Quadratic equations', '2026-08-31'),
    (v_alg2_id, 'Factoring quadratics', '2026-08-31'),
    (v_alg2_id, 'Quadratic formula', '2026-08-31'),
    (v_alg2_id, 'Graphing quadratics', '2026-08-31'),
    (v_alg2_id, 'Systems of equations', '2026-08-31'),
    (v_alg2_id, 'Exponential growth and decay', '2026-08-31'),
    (v_alg2_id, 'Exponential functions', '2026-10-31'),
    (v_alg2_id, 'Growth and decay', '2026-10-31'),
    (v_alg2_id, 'Exponential equations', '2026-10-31'),
    (v_alg2_id, 'Intro to logarithms', '2026-11-30'),
    (v_alg2_id, 'Logarithm properties', '2026-11-30'),
    (v_alg2_id, 'Solving logarithmic equations', '2026-11-30');

  -- === Algebra 1 (Functions) — Syyskuu 2026 ===
  insert into opinto_kurssit (owner_id, name, materiaali) values (
    v_owner, 'Algebra 1 (Functions)',
    'Khan Academy — https://www.khanacademy.org/math/algebra. Functions-yksikkö: funktion käsite, määrittely-/arvojoukko, funktiomerkintä, funktion muunnokset, käänteisfunktiot. ' ||
    'Rakenteellisesti keskeisin yksittäinen solmu koko matikkaradalla — sekä eksponentit että logaritmit että trigonometriset funktiot ovat funktion käsitteen erikoistapauksia.'
  ) returning id into v_alg1_id;

  insert into opinto_aiheet (kurssi_id, name, tavoiteikkuna) values
    (v_alg1_id, 'Functions', '2026-09-30'),
    (v_alg1_id, 'Domain and range', '2026-09-30'),
    (v_alg1_id, 'Function notation', '2026-09-30'),
    (v_alg1_id, 'Function transformations', '2026-09-30'),
    (v_alg1_id, 'Inverse functions', '2026-09-30');

  -- === Trigonometry (Joulukuu 2026 + Tammikuu 2027) ===
  insert into opinto_kurssit (owner_id, name, materiaali) values (
    v_owner, 'Trigonometry',
    'Khan Academy — https://www.khanacademy.org/math/trigonometry. ' ||
    'Joulukuu: yksikköympyrä, radiaanit, sini, kosini, tangentti (kurssin oma järjestys jatkuu Pythagorean identity + erikoiskulmien arvot ennen sinilause/kosinilause-osiota — luonnollinen tauon paikka). ' ||
    'Tammikuu: trigonometriset yhtälöt, sinilause, kosinilause.'
  ) returning id into v_trig_id;

  insert into opinto_aiheet (kurssi_id, name, tavoiteikkuna) values
    (v_trig_id, 'Unit circle', '2026-12-31'),
    (v_trig_id, 'Radians', '2026-12-31'),
    (v_trig_id, 'Sine', '2026-12-31'),
    (v_trig_id, 'Cosine', '2026-12-31'),
    (v_trig_id, 'Tangent', '2026-12-31'),
    (v_trig_id, 'Trigonometric equations', '2027-01-31'),
    (v_trig_id, 'Law of sines', '2027-01-31'),
    (v_trig_id, 'Law of cosines', '2027-01-31');
end $$;

commit;
