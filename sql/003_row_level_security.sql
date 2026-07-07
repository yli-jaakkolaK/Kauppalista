-- Näkyvyysmalli: yksityinen (vain omistaja) vs jaettu (koko perhe, tällä hetkellä
-- Katri + Juha). Uusi lista syntyy AINA yksityisenä (visibility-sarakkeen
-- oletusarvo) — jakaminen on aina tietoinen, erillinen teko listan asetuksista.
--
-- Kolmansien osapuolten kutsuminen (list_members + kutsulinkki) EI ole osa
-- tätä migraatiota — taulu on jo olemassa myöhempää varten, mutta sille ei
-- rakenneta UI:ta tai funktioita nyt.
--
-- Aja tämä KOKONAAN Supabasen SQL Editorissa.
--
-- ENNEN AJAMISTA (Siri-integraatio):
--   1. Supabase Dashboard -> Project Settings -> API -> "service_role"-avain
--   2. Vercel-projektin ympäristömuuttuja SUPABASE_SERVICE_KEY (Production + Preview)
--   3. Redeploy (Vercel tekee automaattisesti kun api/add.js on jo päivitetty)
-- Ilman tätä Siri-lisäykset epäonnistuvat heti kun RLS kytkeytyy päälle.

begin;

alter table lists add column visibility text not null default 'private'
  check (visibility in ('private', 'shared'));

-- Backfill: kaikki NYKYISET listat (Kauppalista, Siivouslista, Vuosikello)
-- jaetuiksi + omistajaksi Katri, jotta mikään olemassa oleva lista ei katoa
-- Juhalta sillä hetkellä kun RLS kytkeytyy päälle.
update lists
set visibility = 'shared',
    owner_id = coalesce(owner_id, 'd646881e-0ab8-4351-aae1-3e92678c8432')
where true;

alter table lists enable row level security;
alter table tuotteet enable row level security;
alter table events enable row level security;
alter table list_members enable row level security;

-- lists: näet omat, jaetut, ja ne joissa olet jäsenenä (list_members varalle myöhempää varten)
create policy "lists_select" on lists for select using (
  owner_id = auth.uid()
  or visibility = 'shared'
  or exists (select 1 from list_members lm where lm.list_id = lists.id and lm.user_id = auth.uid())
);

create policy "lists_insert" on lists for insert with check (owner_id = auth.uid());

-- vain omistaja hallinnoi listaa itseään (nimi, näkyvyys, poisto)
create policy "lists_update" on lists for update using (owner_id = auth.uid());
create policy "lists_delete" on lists for delete using (owner_id = auth.uid());

-- tuotteet: kuka tahansa joka näkee listan saa myös lisätä/täpätä/muokata/poistaa rivejä
create policy "tuotteet_all" on tuotteet for all using (
  exists (
    select 1 from lists l
    where l.id = tuotteet.list_id
    and (
      l.owner_id = auth.uid()
      or l.visibility = 'shared'
      or exists (select 1 from list_members lm where lm.list_id = l.id and lm.user_id = auth.uid())
    )
  )
);

-- events: sama näkyvyysperiaate; list_id null -tapahtumat (esim. listan poisto) vain kirjaajalleen
create policy "events_select" on events for select using (
  (list_id is null and user_id = auth.uid())
  or exists (
    select 1 from lists l
    where l.id = events.list_id
    and (
      l.owner_id = auth.uid()
      or l.visibility = 'shared'
      or exists (select 1 from list_members lm where lm.list_id = l.id and lm.user_id = auth.uid())
    )
  )
);
create policy "events_insert" on events for insert with check (true);

-- list_members: valmiina myöhempää kolmansien osapuolten jakamista varten (ei vielä UI:ta)
create policy "list_members_select" on list_members for select using (
  user_id = auth.uid()
  or exists (select 1 from lists l where l.id = list_members.list_id and l.owner_id = auth.uid())
);
create policy "list_members_insert" on list_members for insert with check (
  exists (select 1 from lists l where l.id = list_members.list_id and l.owner_id = auth.uid())
);
create policy "list_members_delete" on list_members for delete using (
  exists (select 1 from lists l where l.id = list_members.list_id and l.owner_id = auth.uid())
);

commit;
