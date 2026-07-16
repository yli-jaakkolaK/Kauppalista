-- Lisää "tiivisrasia" Kauppalistalle (2026-07-16, ks. muistiinpanot.md
-- "Ruoka-moduulin konsepti" -osion "Kasvislauta"-täydennys). Hankinta-aie on
-- roikkunut kuukausia — laakea tiivisrasia mahdollistaa leikattujen
-- vihannesten säilytyksen pari päivää, yksi leikkuukerta kattaa kaksi
-- kasvislautaa. EI ODOTA Ruoka-moduulia, lisätään suoraan nyt.
--
-- Idempotentti: lisää vain jos rivi ei ole jo listalla.
--
-- Aja tämä Supabasen SQL Editorissa.

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
begin
  select id into v_list_id from lists where name = 'Kauppalista';
  if v_list_id is null then
    raise exception 'Listaa "Kauppalista" ei löytynyt.';
  end if;

  if exists (select 1 from tuotteet where list_id = v_list_id and nimi = 'Laakea tiivisrasia (kasvislautaa varten)' and tehty = false) then
    return;
  end if;

  select coalesce(max(sort_order), 0) into v_max_sort from tuotteet where list_id = v_list_id;

  insert into tuotteet (list_id, nimi, sort_order, tehty, is_header) values
    (v_list_id, 'Laakea tiivisrasia (kasvislautaa varten)', v_max_sort + 10, false, false);
end $$;
