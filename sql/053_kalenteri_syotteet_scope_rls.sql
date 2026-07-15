-- BUGIKORJAUS (2026-07-15, ks. muistiinpanot.md "Hytti-scopen tapahtumat
-- eivät näy missään" -tutkinta): sql/027 kiristi `kalenteri_tapahtumat`-
-- taulun RLS:ää niin ettei hytti-scopen TAPAHTUMIA näe kukaan muu kuin
-- omistaja — mutta unohti `kalenteri_syotteet`-taulun itsensä. Sen ainoa
-- policy ("kalenteri_syotteet_all", sql/014) päästää KENET TAHANSA
-- kirjautuneen näkemään KAIKKI syöte-RIVIT (nimi, tyyppi, scope, henkilo,
-- tunniste — ei itse .ics-linkin/tokenin arvoa, se pysyy vain Vercelin
-- ympäristömuuttujassa, mutta ITSE YMPÄRISTÖMUUTTUJAN NIMI ja se että
-- kyseinen henkilö ylipäätään opiskelee/käyttää tiettyä palvelua PALJASTUU).
-- Sama "tarkista KAIKKI NELJÄ policya" -luonnevirhe kuin Bugi 1:ssä (events-
-- taulun puuttuva delete-policy) — tällä kertaa löydettynä ETUKÄTEEN ennen
-- vahinkoa, koska Juhan oma Oma-kalenterin hytti-scope on rakenteilla.
--
-- Korjaus: jaetaan "kalenteri_syotteet_all" erillisiksi policyiksi, joista
-- VAIN select rajataan — sama malli kuin sql/027:n kalenteri_tapahtumat-
-- korjauksessa. hytti-scopen syöte näkyy VAIN omistajalleen
-- (hytti_omistajat-kartan kautta), perhe-scopen syötteet näkyvät kaikille
-- kuten ennenkin.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

drop policy if exists "kalenteri_syotteet_all" on kalenteri_syotteet;

create policy "kalenteri_syotteet_select" on kalenteri_syotteet for select using (
  scope != 'hytti'
  or exists (
    select 1 from hytti_omistajat o
    where o.henkilo = kalenteri_syotteet.henkilo and o.user_id = auth.uid()
  )
);

create policy "kalenteri_syotteet_insert" on kalenteri_syotteet for insert with check (auth.uid() is not null);
create policy "kalenteri_syotteet_update" on kalenteri_syotteet for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "kalenteri_syotteet_delete" on kalenteri_syotteet for delete using (auth.uid() is not null);

commit;
