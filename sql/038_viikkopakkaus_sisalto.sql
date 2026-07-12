-- Täyttää "Viikon reissun pakkauslista" -listan (luotu tyhjänä sql/010:ssä)
-- oikealla sisällöllä. Rivit peräisin Katrin varhaisesta Claude-luonnoksesta.
--
-- *** NIMIHUOMAUTUS: Katrin viestissä tämän listan otsikoksi annettiin
-- "Viikon pakkauslista leirikeskukseen" — ERI TEKSTI kuin tietokannassa jo
-- olevan listan nimi "Viikon reissun pakkauslista" (sql/010). Koska tehtävä
-- oli TÄYTTÄÄ olemassa oleva tyhjä lista (ei luoda uutta), tämä migraatio
-- hakee listan sen OIKEALLA/tallennetulla nimellä. Jos Katri haluaa
-- kuvaavamman nimen "Viikon pakkauslista leirikeskukseen" käyttöön, se on
-- oma pieni erillinen UPDATE-migraationsa (tai nimen voi vaihtaa suoraan
-- sovelluksesta ✎-napilla) — EI tehty tässä automaattisesti, koska
-- nimenvaihto ei ollut eksplisiittinen pyyntö. ***
--
-- Idempotentti kuten sql/037: täyttää rivit VAIN jos lista on tyhjä, ei
-- koske olemassa olevaan sisältöön eikä duplikoi mitään.
--
-- Aja tämä Supabasen SQL Editorissa.

do $$
declare
  v_list_id uuid;
  v_existing_count int;
  v_sort double precision := 0;
  r text;
  rivit text[] := array[
    'Lakana',
    'Pussilakana',
    'Tyynyliina',
    'Käsipyyhe',
    'Uikkarit + uimakengät/sukat/pyyhe',
    'Kuravaatteet',
    '2 paitaa',
    'Tunika',
    'Mekko',
    'Lääkkeet',
    'Dödö',
    'Korvatulpat',
    'Pampulla',
    'Hiusharja',
    'Kuulosuojaimet',
    'Silmälappu',
    '2 housut',
    'Ulkohousut',
    'Vedenpitävä takki',
    'Hattu + hanskat',
    'Villasukat',
    'Villapaita',
    'Neuletakki',
    'Kuukuppi',
    '2 menkkapikkarit',
    '4 tavalliset pikkarit',
    'Pyykkipussi',
    'Vihko + kynä + Raamattu',
    'Maalaus-/piirtämisvälineet',
    'Juomapullo',
    'Sisäkengät',
    'Retkipatja + viltti',
    'Sateenvarjo',
    'Heijastin',
    'Nenäliina',
    'Shampoo + hoitoaine + saippua',
    'Särkylääke',
    'Hammasharja + tahna'
  ];
begin
  select id into v_list_id from lists where name = 'Viikon reissun pakkauslista' and category = 'varasto';

  if v_list_id is null then
    raise exception 'Listaa "Viikon reissun pakkauslista" (category=varasto) ei löytynyt — aja sql/010_varasto.sql ensin. (Huom: jos lista on ehditty nimetä uudelleen appista, tarkista nykyinen nimi ja päivitä tämä migraatio vastaamaan.)';
  end if;

  select count(*) into v_existing_count from tuotteet where list_id = v_list_id;

  if v_existing_count > 0 then
    raise notice 'Listalla on jo % riviä — ei täytetä uudelleen (idempotentti, olemassa olevaa sisältöä ei kosketa)', v_existing_count;
  else
    foreach r in array rivit loop
      v_sort := v_sort + 10;
      insert into tuotteet (list_id, nimi, sort_order, tehty, is_header)
      values (v_list_id, r, v_sort, false, false);
    end loop;
  end if;
end $$;
