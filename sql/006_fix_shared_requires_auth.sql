-- KORJAUS: "shared"-näkyvyys ei vaatinut kirjautumista, joten kuka tahansa
-- anon-avaimella (joka on julkinen, näkyy selaimen lähdekoodissa) pystyi
-- lukemaan kaikki jaetut listat ilman Google-kirjautumista. Yksityiset listat
-- olivat jo turvassa (owner_id/list_members vaativat oikean auth.uid()-täsmäyksen),
-- mutta "jaettu" tarkoitti vahingossa "julkinen koko internetille".
--
-- Korjaus: jaettu-näkyvyys vaatii nyt AINA että pyytäjä on kirjautunut
-- (auth.uid() is not null), ei vain että rivi on merkitty jaetuksi.
--
-- Aja tämä KOKONAAN Supabasen SQL Editorissa migraatioiden 003 ja 005 jälkeen.

begin;

drop policy if exists "lists_select" on lists;
create policy "lists_select" on lists for select using (
  owner_id = auth.uid()
  or (auth.uid() is not null and visibility = 'shared')
  or is_list_member(id)
);

drop policy if exists "tuotteet_all" on tuotteet;
create policy "tuotteet_all" on tuotteet for all using (
  owns_list(list_id)
  or (auth.uid() is not null and list_visibility(list_id) = 'shared')
  or is_list_member(list_id)
);

drop policy if exists "events_select" on events;
create policy "events_select" on events for select using (
  (list_id is null and user_id = auth.uid())
  or owns_list(list_id)
  or (auth.uid() is not null and list_visibility(list_id) = 'shared')
  or is_list_member(list_id)
);

commit;
