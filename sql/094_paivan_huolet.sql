-- Huolilippu Kuormavahdissa (2026-08-04, ks. muistiinpanot.md "Huolilippu").
-- OMA, ERI mekanismi kuin ristiriitapaketin päällekkäisyysmerkki (sql/024,
-- analysoiPaivanRistiriidat script.js:ssä) — se on lennossa laskettu kahden
-- kalenterin ajallinen päällekkäisyys, tekstienum 'full'/'attention'/'none',
-- punainen väri varattu YKSINOMAAN sille. Tämä on tallennettu, ennakoiva
-- kuormamerkintä ("tiedän että tästä tulee kuormaa vaikka kalenteri näyttää
-- rauhalliselta") — eri kenttä, eri taulu, EI käytä punaista, EI kosketa
-- ristiriitapaketin koodiin mitenkään.
--
-- vakavuus 1-4 (🟡🟠🔴🏴 UI:ssa, väriasteikko VAIN tälle merkille — emoji-
-- kuvaus on sovelluskoodissa, ei tietokannassa). pvm = päivä jota huoli
-- koskee (voi olla mennyt tai tuleva — vaikutus on KAKSISUUNTAINEN, ei vain
-- eteenpäin kuten opintoDeadlinePaino).
--
-- Kynnysarvot asetukset-taulussa (sama "data ei koodia" -periaate kuin
-- paivan_menoraja) jotta niitä voi säätää oikean käytön perusteella ilman
-- koodimuutosta — ensimmäiset arvot ovat parhaita arvauksia, ei mitattua
-- dataa (ks. script.js:n opintoPaivanKuorma-laajennus laskentakaavalle).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists paivan_huolet (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  pvm date not null,
  vakavuus int not null check (vakavuus between 1 and 4),
  created_at timestamptz not null default now()
);

alter table paivan_huolet enable row level security;

drop policy if exists "paivan_huolet_all" on paivan_huolet;
create policy "paivan_huolet_all" on paivan_huolet for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

insert into asetukset (key, value) values
  ('huoli_keski_kynnys', '10'),
  ('huoli_raskas_kynnys', '30')
on conflict (key) do nothing;

commit;
