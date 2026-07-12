-- Täyttää "Telttaretken pakkauslista" -listan (luotu tyhjänä sql/010:ssä)
-- oikealla sisällöllä. Rivit peräisin Katrin varhaisesta Claude-luonnoksesta
-- (ei koskaan päätynyt tiedostoksi koneelle, annettu nyt suoraan tekstinä).
--
-- Skeemakorjaus (sama tarkistus kuin sql/036:ssa): luonnos oletti
-- `tuotteet(nimi, tehty, list_id)` — TÄSMÄÄ oikeaan skeemaan tällä kertaa,
-- lisätty vain puuttuvat `is_header`/`sort_order`.
--
-- Idempotentti TOISIN kuin sql/036: tämä EI poista/korvaa mitään — täyttää
-- rivit VAIN jos lista on tällä hetkellä tyhjä (0 riviä). Jos Katri on jo
-- ehtinyt lisätä jotain käsin appista, migraatio ei koske niihin eikä
-- duplikoi mitään — turvallinen ajaa uudelleen vahingossakin.
--
-- Aja tämä Supabasen SQL Editorissa.

do $$
declare
  v_list_id uuid;
  v_existing_count int;
  v_sort double precision := 0;
  r text;
  rivit text[] := array[
    '# Yhteiset varusteet',
    'Teltta',
    'Kaaret',
    'Kiilat',
    'Pressu?',
    'Folio',
    '3x patjat',
    'Makuualusta',
    'Lampaankarva',
    'Rebekan makuupussi',
    'Jamielin makuupussi',
    'Aikuisten makuupussit x 2',
    'Juomapullot x 4',
    '10 l vettä',
    'Trangia',
    'Kaasu',
    'Tulitikut',
    'Kauha/lasta',
    'Lautaset',
    'Mukit',
    'Aterimet (luhat)',
    'Öljy',
    'Tiskisieni/-aine',
    'Vessapaperi',
    'Roskapussirulla',
    'Hyttyspuikko/myrkky?',
    'Punkkikarkoite?',
    'Aurinkorasva',
    'EA-pussukka',
    'Otsalamppu',
    'Ohut makuualusta eteiseen',
    'Ulkopeli/pelikortit',
    'Pyykkinaru',
    'Ruokatermari',
    '# Jamiel',
    'Jamiel: saappaat',
    'Jamiel: sadevaatteet',
    'Jamiel: hammasharja/tahna',
    'Jamiel: alusvaatteet',
    'Jamiel: fleece + huppari',
    'Jamiel: ohut takki',
    'Jamiel: 2 paitaa',
    'Jamiel: sukat',
    'Jamiel: ulkoiluhousut',
    'Jamiel: uikkarit ja pyyhe',
    'Jamiel: hattu',
    '# Rebekka',
    'Rebekka: saappaat',
    'Rebekka: sadevaatteet',
    'Rebekka: hammasharja/tahna',
    'Rebekka: alusvaatteet',
    'Rebekka: fleece ja ohut takki',
    'Rebekka: paita/mekko',
    'Rebekka: sukat',
    'Rebekka: villasukat',
    'Rebekka: ulkoiluhousut',
    'Rebekka: uikkarit ja pyyhe',
    'Rebekka: hattu',
    '# Katri',
    'Katri: saappaat/sadevaatteet',
    'Katri: hammasharja/tahna',
    'Katri: alusvaatteet',
    'Katri: fleece ja ohut takki',
    'Katri: paita',
    'Katri: ulkoiluhousut',
    'Katri: uikkarit ja pyyhe',
    'Katri: hattu',
    'Katri: pipo',
    'Katri: silmäsuoja',
    'Katri: kuulosuojaimet/korvatulpat',
    'Katri: villasukat',
    '# Juha',
    'Juha: saappaat/sadevaatteet',
    'Juha: hammasharja/tahna',
    'Juha: alusvaatteet',
    'Juha: fleece ja ohut takki',
    'Juha: paita',
    'Juha: ulkoiluhousut',
    'Juha: uikkarit ja pyyhe',
    'Juha: hattu',
    '# Ruoka',
    'Ruoka: pussimuusi',
    'Ruoka: lihapullat jäisenä',
    'Ruoka: gluteeniton makaroni',
    'Ruoka: tonnikalapurkit',
    'Ruoka: kananmunia',
    'Ruoka: vesimeloni',
    'Ruoka: banaani',
    'Ruoka: leipää',
    'Ruoka: puurohiutaleita',
    'Ruoka: mehua',
    'Ruoka: suklaabanaani',
    'Ruoka: rusinarasioita/pähkinöitä'
  ];
begin
  select id into v_list_id from lists where name = 'Telttaretken pakkauslista' and category = 'varasto';

  if v_list_id is null then
    raise exception 'Listaa "Telttaretken pakkauslista" (category=varasto) ei löytynyt — aja sql/010_varasto.sql ensin';
  end if;

  select count(*) into v_existing_count from tuotteet where list_id = v_list_id;

  if v_existing_count > 0 then
    raise notice 'Listalla on jo % riviä — ei täytetä uudelleen (idempotentti, olemassa olevaa sisältöä ei kosketa)', v_existing_count;
  else
    foreach r in array rivit loop
      v_sort := v_sort + 10;
      insert into tuotteet (list_id, nimi, sort_order, tehty, is_header)
      values (v_list_id, ltrim(r, '# '), v_sort, false, r like '#%');
    end loop;
  end if;
end $$;
