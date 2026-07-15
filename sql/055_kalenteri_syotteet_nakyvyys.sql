-- Hytti-scopen syötekohtainen näkyvyysasetus (Katrin 2026-07-16 linjaus,
-- "Kalenterin kerrosarkkitehtuuri" -viesti): osa hytti-scopen (opiskelu/työ)
-- syötteistä on hyödyllistä perheen suunnittelutietoa (esim. Lukkarikone —
-- "Katri koulussa koko päivän" vaikuttaa perheen arkeen), osa on täysin
-- yksityistä (Juhan/Katrin oma "Oma"-kalenteri). Sama scope='hytti' ei siis
-- enää yksin ratkaise näkyvyyttä toiselle käyttäjälle — uusi nakyvyys-sarake
-- ratkaisee sen PER SYÖTE.
--
-- Oletus 'vain_omistajalle' (turvallisempi, ei muuta nykyistä käytöstä
-- millekään syötteelle ellei erikseen sallita). Lukkarikone päivitetään
-- 'perheelle':ksi tässä samassa migraatiossa Katrin eksplisiittisen ohjeen
-- mukaan. Itslearning JÄTETÄÄN 'vain_omistajalle':ksi (koulun viesti-/
-- tehtäväalusta, ei sama "perheen suunnittelutieto" -luonne kuin
-- lukujärjestyksellä) — voi muuttaa myöhemmin jos Katri niin päättää.
--
-- Aja tämä Supabasen SQL Editorissa sql/053:n jälkeen.

begin;

alter table kalenteri_syotteet add column if not exists nakyvyys text not null default 'vain_omistajalle'
  check (nakyvyys in ('perheelle', 'vain_omistajalle'));

update kalenteri_syotteet set nakyvyys = 'perheelle' where name = 'Lukkarikone';

-- kalenteri_tapahtumat: laajennetaan sql/027:n select-policya kolmannella
-- ehdolla — rivi näkyy myös jos sen syöte on scope='hytti' JA nakyvyys='perheelle',
-- riippumatta katsojan omasta henkilo-tunnisteesta (kenelle tahansa kirjautuneelle,
-- kuten jaettu perhekalenterikin).
drop policy if exists "kalenteri_tapahtumat_select" on kalenteri_tapahtumat;

create policy "kalenteri_tapahtumat_select" on kalenteri_tapahtumat for select using (
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

-- kalenteri_syotteet: sama laajennus sql/053:n select-policyyn — feedin oma
-- rivi (nimi, väri, scope, henkilo) näkyy myös jos nakyvyys='perheelle'.
drop policy if exists "kalenteri_syotteet_select" on kalenteri_syotteet;

create policy "kalenteri_syotteet_select" on kalenteri_syotteet for select using (
  scope != 'hytti'
  or nakyvyys = 'perheelle'
  or exists (
    select 1 from hytti_omistajat o
    where o.henkilo = kalenteri_syotteet.henkilo and o.user_id = auth.uid()
  )
);

commit;
