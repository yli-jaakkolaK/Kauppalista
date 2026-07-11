-- ICS-syötekoneiston perhe/hytti-erottelu (2026-07-11 lopullinen speksi, ks.
-- muistiinpanot.md "Hytti v1 + opiskelulaajennus + ICS-syötekoneisto").
--
-- kalenteri_syotteet.scope ('perhe'/'hytti', oletus 'perhe' — olemassa olevat
-- rivit migroituvat automaattisesti perheeksi, PG:n "fast default" täyttää
-- kaikki nykyiset rivit ilman erillistä UPDATE-lausetta). 'hytti'-scopen
-- syötteen tapahtumat kuuluvat YHDELLE henkilölle (opiskelu/työ), eivät
-- koskaan perheen yhteiseen agendaan/kuittausjonoon/Kuormavahtiin.
--
-- HUOM: EI lisätty erillistä 'owner'-saraketta jota alkuperäinen speksi
-- hahmotteli — kalenteri_syotteet.henkilo (sql/024, Ristiriitamerkki) kattaa
-- saman tarpeen jo täydellisesti ("kenen henkilökohtainen kalenteri tämä on"),
-- uusi sarake olisi ollut suora duplikaatti. Hytti-scopen syötteelle
-- asetetaan siis vain henkilo='katri'/'juha' kuten muillekin henkilökohtaisille
-- syötteille, EI mitään uutta.
--
-- *** YKSITYISYYS TIETOKANTATASOLLA, EI VAIN KÄYTTÖLIITTYMÄSSÄ ***
-- kalenteri_tapahtumat-taulun ainoa aiempi policy ("kalenteri_all", sql/012)
-- päästää KENET TAHANSA kirjautuneen näkemään KAIKKI rivit — toimi hyvin kun
-- kaikki data oli perheen yhteistä, mutta 'hytti'-scopen opiskelu-/työdata
-- ON TARKOITETTU TÄYSIN YKSITYISEKSI (sama periaate kuin hytti_kortit/
-- hytti_rivit-tauluilla). Ilman RLS-korjausta Juha voisi teknisesti nähdä
-- Katrin kurssiaikataulun suoralla Supabase-kyselyllä vaikka käyttöliittymä
-- ei sitä koskaan näyttäisi — sama riski jota vartaan muualla (esim.
-- push_tilaukset, muistutukset). Korjattu jakamalla vanha "for all" -policy
-- erillisiksi select/insert/update/delete-policyiksi, joista VAIN select on
-- rajattu: rivi näkyy jos (a) sillä ei ole syote_id:tä (käsin lisätty perheen
-- tapahtuma), TAI (b) sen syote ei ole scope='hytti' (tavallinen perhesyöte),
-- TAI (c) syote ON hytti-scopessa JA auth.uid() vastaa sen henkilo-arvoa
-- hytti_omistajat-kartan kautta.
--
-- hytti_omistajat: kevyt henkilo->user_id-kartta (sama "data ei koodia"
-- -periaate kuin kalenteri_tekijat). Katrin oma rivi täytetty valmiiksi
-- (tunnettu UUID, ks. sql/003). JUHAN RIVI PUUTTUU — lisää Table Editorista
-- kun Juhan oma auth-tunniste on käsillä (Supabase → Authentication → Users),
-- ks. PALUU.md kohta 3. Ilman Juhan riviä hänen oma tuleva hytti-syötteensä
-- (kirjattu myöhemmäksi, ks. muistiinpanot.md) ei toimisi — Katrin oma
-- Itslearning/Lukkarikone toimii jo tämän migraation jälkeen ilman lisätoimia.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table kalenteri_syotteet add column if not exists scope text not null default 'perhe'
  check (scope in ('perhe', 'hytti'));

create table if not exists hytti_omistajat (
  henkilo text primary key check (henkilo in ('katri', 'juha')),
  user_id uuid not null references auth.users(id)
);

alter table hytti_omistajat enable row level security;
create policy "hytti_omistajat_select" on hytti_omistajat for select using (auth.uid() is not null);

insert into hytti_omistajat (henkilo, user_id) values
  ('katri', 'd646881e-0ab8-4351-aae1-3e92678c8432')
on conflict (henkilo) do nothing;

drop policy if exists "kalenteri_all" on kalenteri_tapahtumat;

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
);

create policy "kalenteri_tapahtumat_insert" on kalenteri_tapahtumat for insert with check (auth.uid() is not null);
create policy "kalenteri_tapahtumat_update" on kalenteri_tapahtumat for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "kalenteri_tapahtumat_delete" on kalenteri_tapahtumat for delete using (auth.uid() is not null);

commit;
