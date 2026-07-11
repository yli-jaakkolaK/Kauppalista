-- Ankkurit henkilökohtaisiksi (2026-07-11). Tähän asti ankkurit-taulu oli
-- KÄYTÄNNÖSSÄ yhteinen: RLS-policy ("ankkurit_all") päästi kenet tahansa
-- kirjautuneen näkemään/muokkaamaan KAIKKIA rivejä, eikä etusivun/kalenterin
-- kyselyt suodattaneet omistajan mukaan. Tämä esti Juhaa aloittamasta
-- Sataman oikeaa käyttöä — hänen ⚓-nostonsa olisivat sotkeneet Katrin
-- päivän agendan ja päinvastoin. Irrotettu tarkoituksella "odottavasta
-- paketista" (ankkurin lähetys toiselle, ristiriitalipun ehdokkaat) —
-- täysin erillinen, ei riipu kesken olevista kalenteritesteistä.
--
-- user_id-sarake ON JO OLEMASSA (sql/009) — vaihdaAnkkurointiYleinen() ja
-- etusivun manuaalilisäys ovat jo pitkään kirjoittaneet sen oikein (script.js
-- asettaa sen jokaisessa insertissä). Vika oli VAIN lukupuolella (kyselyt
-- eivät suodattaneet) ja RLS:ssä (policy ei rajoittanut). Puuttuvat/NULL-
-- rivit (varhaiset testirivit ennen kuin user_id-kirjoitus lisättiin koodiin)
-- backfillataan Katrin tunnisteelle, koska kaikki tähänastinen käyttö on
-- ollut Katrin.
--
-- EI kosketa (pysyvät odottavassa paketissa, rakentuvat tämän päälle
-- myöhemmin): ankkurin lähetys toiselle käyttäjälle ("Katrilta" + push),
-- ristiriitalipun automaattiehdokkaat (source='ristiriita').
--
-- service_role (Vercel-funktiot, tulevat "moottorit") ohittaa RLS:n aina
-- kuten muillakin tauluilla — ei vaadi erillistä policya.
--
-- Idempotentti — turvallinen ajaa uudelleen.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

update ankkurit set user_id = 'd646881e-0ab8-4351-aae1-3e92678c8432' where user_id is null;

alter table ankkurit alter column user_id set not null;

alter table ankkurit drop constraint if exists ankkurit_user_id_fkey;
alter table ankkurit add constraint ankkurit_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

drop policy if exists "ankkurit_all" on ankkurit;
drop policy if exists "ankkurit_select_own" on ankkurit;
drop policy if exists "ankkurit_insert_own" on ankkurit;
drop policy if exists "ankkurit_update_own" on ankkurit;
drop policy if exists "ankkurit_delete_own" on ankkurit;

create policy "ankkurit_select_own" on ankkurit for select using (user_id = auth.uid());
create policy "ankkurit_insert_own" on ankkurit for insert with check (user_id = auth.uid());
create policy "ankkurit_update_own" on ankkurit for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ankkurit_delete_own" on ankkurit for delete using (user_id = auth.uid());

commit;
