-- KORJAUS migraatioon 003: lists- ja list_members-taulujen RLS-policyt
-- viittasivat suoraan toisiinsa (EXISTS-alikyselyillä), mikä aiheutti
-- Postgresin "infinite recursion detected in policy" -virheen (42P17) —
-- käytännössä kaikki kyselyt lists/tuotteet/events-tauluihin epäonnistuivat.
--
-- Korjaus: SECURITY DEFINER -apufunktiot, joiden sisäiset kyselyt ohittavat
-- RLS:n (koska funktio ajetaan taulujen omistajan oikeuksin), jolloin
-- rekursiokehä katkeaa. Tämä on Supabasen/Postgresin vakiotapa tähän ongelmaan.
--
-- Aja tämä KOKONAAN Supabasen SQL Editorissa migraation 003 jälkeen.

begin;

create or replace function is_list_member(p_list_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from list_members where list_id = p_list_id and user_id = auth.uid()
  );
$$;

create or replace function owns_list(p_list_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from lists where id = p_list_id and owner_id = auth.uid()
  );
$$;

create or replace function list_visibility(p_list_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select visibility from lists where id = p_list_id;
$$;

drop policy if exists "lists_select" on lists;
create policy "lists_select" on lists for select using (
  owner_id = auth.uid()
  or visibility = 'shared'
  or is_list_member(id)
);

drop policy if exists "tuotteet_all" on tuotteet;
create policy "tuotteet_all" on tuotteet for all using (
  owns_list(list_id) or list_visibility(list_id) = 'shared' or is_list_member(list_id)
);

drop policy if exists "events_select" on events;
create policy "events_select" on events for select using (
  (list_id is null and user_id = auth.uid())
  or owns_list(list_id) or list_visibility(list_id) = 'shared' or is_list_member(list_id)
);

drop policy if exists "list_members_select" on list_members;
create policy "list_members_select" on list_members for select using (
  user_id = auth.uid() or owns_list(list_id)
);

drop policy if exists "list_members_insert" on list_members;
create policy "list_members_insert" on list_members for insert with check (owns_list(list_id));

drop policy if exists "list_members_delete" on list_members;
create policy "list_members_delete" on list_members for delete using (owns_list(list_id));

commit;
