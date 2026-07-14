-- Ankkuriarkkitehtuuri "jokaisella ankkurilla on koti" (2026-07-14, ks.
-- muistiinpanot.md "Ankkuriarkkitehtuuri"): käsin kirjoitettu ankkuri
-- (source='manual') OLI itse sisältö — sen lasku (⚓ pois) tuhosi sisällön
-- pysyvästi, koska mitään kotia ei ollut minne palata. Uusi käyttöliittymä
-- (script.js) luo tästä eteenpäin AINA taustalla murun Laituriin ja nostaa
-- SEN sijasta suoraan sisältöä. Tämä migraatio siirtää OLEMASSA OLEVAT
-- 'manual'-ankkurit samaan malliin: luo jokaiselle murun Laituriin (sama
-- sisältö, sama omistaja) ja päivittää ankkurin source/source_ref
-- osoittamaan sinne — sisältö EI KATOA eikä KAKSINKERTAISTU, `content`
-- pysyy ankkurilla ennallaan (kopio, sama periaate kuin muillakin lähteillä).
--
-- Idempotentti: WHERE source='manual' ei enää täsmää toisella ajokerralla,
-- koska source on jo vaihtunut 'laituri':ksi.
--
-- Aja tämä Supabasen SQL Editorissa.

do $$
declare
  r record;
  v_muru_id bigint;
  v_maara integer := 0;
begin
  for r in select id, content, user_id from ankkurit where source = 'manual' loop
    insert into laituri (content, user_id, status)
    values (r.content, r.user_id, 'uusi')
    returning id into v_muru_id;

    update ankkurit set source = 'laituri', source_ref = v_muru_id::text
    where id = r.id;

    raise notice 'Migroitu ankkuri id=% -> uusi laituri-muru id=%', r.id, v_muru_id;
    v_maara := v_maara + 1;
  end loop;

  raise notice 'Migroitu % käsin luotua ankkuria Laituri-pohjaiseksi.', v_maara;
end $$;
