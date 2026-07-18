-- RLS-/yksityisyysauditointi (AUDITOINTIPYYNTÖ 2/4, 2026-07-19/20, ks.
-- muistiinpanot.md "RLS-/yksityisyysauditointi" täydelle raportille). Käytiin
-- läpi JOKAINEN taulu ja policy sql/001–071:stä rivi riviltä. Viisi löydöstä,
-- korjataan tässä migraatiossa (RLS/skeema-tason korjaukset — kaksi erillistä
-- APP-KOODI-tason löydöstä, api/caldav-sync.js:n autentikoimattomat reitit ja
-- api/laituri-add.js:n spooffausriski, EIVÄT ole tässä migraatiossa, ks.
-- muistiinpanot.md-raportti, odottavat Katrin päätöstä koska koskettavat
-- tuotannossa toimivia cron-/Shortcut-kutsujia).
--
-- KRIITTISIN LÖYDÖS (#1): kalenteri_syotteet/kalenteri_tapahtumat select-
-- policy oli jo oikein rajattu hytti-omistajalle (sql/053/055), mutta
-- insert/update/delete-policyt olivat jääneet löysälle "auth.uid() is not
-- null" -tasolle (sql/027/053) — kuka tahansa kirjautunut olisi voinut
-- PÄIVITTÄÄ toisen hytti-syötteen nakyvyys='perheelle':ksi ja siten
-- paljastaa koko syötteen + sen tapahtumat itselleen, select-rajoituksesta
-- huolimatta. Tämä rikkoi juuri sitä "Hytin sisältö ei saa vuotaa millään
-- reitillä" -invarianttia jonka Juha on nimennyt ehdottomaksi vaatimukseksi.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

-- 1) KRIITTINEN — kalenteri_syotteet: sama omistajuusrajaus insert/update/
-- deleteen kuin select-policyssa jo on (sql/055).
drop policy if exists "kalenteri_syotteet_insert" on kalenteri_syotteet;
drop policy if exists "kalenteri_syotteet_update" on kalenteri_syotteet;
drop policy if exists "kalenteri_syotteet_delete" on kalenteri_syotteet;

create policy "kalenteri_syotteet_insert" on kalenteri_syotteet for insert with check (
  scope != 'hytti'
  or nakyvyys = 'perheelle'
  or exists (
    select 1 from hytti_omistajat o
    where o.henkilo = kalenteri_syotteet.henkilo and o.user_id = auth.uid()
  )
);

create policy "kalenteri_syotteet_update" on kalenteri_syotteet for update using (
  scope != 'hytti'
  or nakyvyys = 'perheelle'
  or exists (
    select 1 from hytti_omistajat o
    where o.henkilo = kalenteri_syotteet.henkilo and o.user_id = auth.uid()
  )
) with check (
  scope != 'hytti'
  or nakyvyys = 'perheelle'
  or exists (
    select 1 from hytti_omistajat o
    where o.henkilo = kalenteri_syotteet.henkilo and o.user_id = auth.uid()
  )
);

create policy "kalenteri_syotteet_delete" on kalenteri_syotteet for delete using (
  scope != 'hytti'
  or nakyvyys = 'perheelle'
  or exists (
    select 1 from hytti_omistajat o
    where o.henkilo = kalenteri_syotteet.henkilo and o.user_id = auth.uid()
  )
);

-- 2) VAKAVA — kalenteri_tapahtumat: sama omistajuusrajaus insert/update/
-- deleteen kuin select-policyssa jo on (sql/055) — muuten kuka tahansa
-- kirjautunut olisi voinut sokkona päivittää/poistaa/lisätä rivejä joita ei
-- itse edes näe (esim. arvata id ja poistaa toisen hytti-scopen tapahtuman).
drop policy if exists "kalenteri_tapahtumat_insert" on kalenteri_tapahtumat;
drop policy if exists "kalenteri_tapahtumat_update" on kalenteri_tapahtumat;
drop policy if exists "kalenteri_tapahtumat_delete" on kalenteri_tapahtumat;

create policy "kalenteri_tapahtumat_insert" on kalenteri_tapahtumat for insert with check (
  syote_id is null
  or not exists (
    select 1 from kalenteri_syotteet s where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti'
  )
  or exists (
    select 1 from kalenteri_syotteet s
    join hytti_omistajat o on o.henkilo = s.henkilo
    where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti' and o.user_id = auth.uid()
  )
  or exists (
    select 1 from kalenteri_syotteet s
    where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti' and s.nakyvyys = 'perheelle'
  )
);

create policy "kalenteri_tapahtumat_update" on kalenteri_tapahtumat for update using (
  syote_id is null
  or not exists (
    select 1 from kalenteri_syotteet s where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti'
  )
  or exists (
    select 1 from kalenteri_syotteet s
    join hytti_omistajat o on o.henkilo = s.henkilo
    where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti' and o.user_id = auth.uid()
  )
  or exists (
    select 1 from kalenteri_syotteet s
    where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti' and s.nakyvyys = 'perheelle'
  )
) with check (
  syote_id is null
  or not exists (
    select 1 from kalenteri_syotteet s where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti'
  )
  or exists (
    select 1 from kalenteri_syotteet s
    join hytti_omistajat o on o.henkilo = s.henkilo
    where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti' and o.user_id = auth.uid()
  )
  or exists (
    select 1 from kalenteri_syotteet s
    where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti' and s.nakyvyys = 'perheelle'
  )
);

create policy "kalenteri_tapahtumat_delete" on kalenteri_tapahtumat for delete using (
  syote_id is null
  or not exists (
    select 1 from kalenteri_syotteet s where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti'
  )
  or exists (
    select 1 from kalenteri_syotteet s
    join hytti_omistajat o on o.henkilo = s.henkilo
    where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti' and o.user_id = auth.uid()
  )
  or exists (
    select 1 from kalenteri_syotteet s
    where s.id = kalenteri_tapahtumat.syote_id and s.scope = 'hytti' and s.nakyvyys = 'perheelle'
  )
);

-- 3) KOHTALAINEN — kalenteri_tekijat: vanha policy oli nimetty "..._select"
-- mutta deklaroitu "for all", eli päästi minkä tahansa kirjautuneen
-- muokkaamaan/poistamaan organizer->käyttäjä-karttaa. Taulua kirjoittaa
-- todellisuudessa VAIN api/caldav-sync.js service-role-avaimella (ohittaa
-- RLS:n kokonaan) — client-käyttäjälle ei ole mitään laillista
-- kirjoitustarvetta, vain luku (vahvistettu grepillä koko koodikannasta).
drop policy if exists "kalenteri_tekijat_select" on kalenteri_tekijat;
create policy "kalenteri_tekijat_select" on kalenteri_tekijat for select using (auth.uid() is not null);

-- 4) MATALA — events: insert oli "with check (true)" (sql/003, ei koskaan
-- muutettu vaikka select/delete kiristettiin sql/006/039:ssä) — kuka tahansa
-- kirjautunut sai kirjoittaa tapahtumalokirivin mille tahansa list_id:lle,
-- myös listalle jota ei itse näe. Sama näkyvyysrajaus kuin select/delete.
drop policy if exists "events_insert" on events;
create policy "events_insert" on events for insert with check (
  (list_id is null and user_id = auth.uid())
  or owns_list(list_id)
  or (auth.uid() is not null and list_visibility(list_id) = 'shared')
  or is_list_member(list_id)
);

-- 5) MATALA — kalenteri_odottavat: käytöstä poistunut hyväksyntäjono
-- (ks. sql/020/021/022 — tyhjennetty ja lakkautettu jo 2026-07-13/14),
-- vahvistettu grepillä ettei mikään koodi enää lue/kirjoita sitä. Jätetty
-- tähän asti paikoilleen "inertiksi turvaksi", mutta avoin for-all-policy
-- dead-koodin päällä on tarpeeton riski ilman mitään hyötyä — pudotetaan.
drop table if exists kalenteri_odottavat;

commit;
