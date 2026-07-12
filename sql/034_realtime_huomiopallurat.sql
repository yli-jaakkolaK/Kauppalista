-- Ottaa Supabase Realtime -replikoinnin käyttöön Huomiopallurat-ominaisuuden
-- (2026-07-13) tarvitsemille tauluille: laituri, kalenteri_tapahtumat,
-- kalenteri_kuittaukset. Ilman tätä script.js:n uudet realtime-kanavat
-- (laituriRealtimeChannel, kalenteriPalluraChannel) eivät koskaan laukea —
-- Supabase Realtime vaatii että taulu on lisätty `supabase_realtime`
-- -julkaisuun (sama vaatimus kuin `tuotteet`-taululla, ks. muistiinpanot.md
-- "Sanasto"; tuotteet-taulun replikointi tehtiin aikanaan käsin dashboardista
-- ENNEN kuin "kaikki data/asetukset migraationa" -periaate kirjattiin —
-- tästä eteenpäin tämäkin asennusvaihe hoidetaan aina migraationa).
--
-- Idempotentti: tarkistaa pg_publication_tables-näkymästä onko taulu jo
-- julkaisussa ennen ALTER PUBLICATION -kutsua, joten ajaminen uudelleen ei
-- kaadu "already member of publication" -virheeseen.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

do $$
declare
  taulu text;
begin
  foreach taulu in array array['laituri', 'kalenteri_tapahtumat', 'kalenteri_kuittaukset']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = taulu
    ) then
      execute format('alter publication supabase_realtime add table public.%I', taulu);
    end if;
  end loop;
end $$;

commit;
