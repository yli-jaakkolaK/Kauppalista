-- Lisää Juhan rivin hytti_omistajat-tauluun (2026-07-13) — puuttui, koska
-- sql/027 loi VAIN Katrin rivin (tunnettu UUID etukäteen, ks. sql/003) ja
-- jätti Juhan rivin Katrin lisättäväksi Table Editorista myöhemmin. Tämä
-- migraatio hakee Juhan auth-tunnisteen `auth.users`-taulusta SÄHKÖPOSTILLA
-- — EI vaadi kenenkään kopioimaan UUID:ta käsin mistään.
--
-- Ilman tätä riviä Juhan "Oma"-kalenteri (scope='hytti', sql/032) ei näkyisi
-- hänelle MISSÄÄN, ei edes omassa Hytissään — RLS-policy
-- (kalenteri_tapahtumat_select, sql/027) ei löytäisi vastaavuutta
-- henkilo='juha':lle.
--
-- Turvatarkistus: jos sähköpostia ei löydy auth.users-taulusta (esim.
-- kirjoitusvirhe), migraatio KAATUU SELKEÄÄN VIRHEESEEN sen sijaan että
-- hiljaa lisäisi nolla riviä.
--
-- Idempotentti (on conflict do nothing hytti_omistajat.henkilo-primary keyllä).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

do $$
begin
  if not exists (select 1 from auth.users where email = 'ylijaakkolaj@gmail.com') then
    raise exception 'Sähköpostiosoitetta ylijaakkolaj@gmail.com ei löytynyt auth.users-taulusta - tarkista kirjoitusasu tai onko Juha kirjautunut Satamaan ainakin kerran';
  end if;
end $$;

insert into hytti_omistajat (henkilo, user_id)
select 'juha', id from auth.users where email = 'ylijaakkolaj@gmail.com'
on conflict (henkilo) do nothing;

commit;
