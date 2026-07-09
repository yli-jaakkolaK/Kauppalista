-- Yleinen avain-arvo-asetustaulu — EI vain Kuormavahdille, tarkoitettu
-- uudelleenkäytettäväksi jatkossa muuallakin (esim. tulevat sääajat,
-- ankkurirajat). "Data ei koodia" -periaate: uusi asetus on Table Editor
-- -rivinlisäys, ei koodimuutos.
--
-- value on aina text — koodi tulkitsee sen tarvittavaan muotoon (esim.
-- parseInt kuormavahdin rajalle). Ei tarvitse erillisiä sarakkeita eri
-- tietotyypeille tässä mittakaavassa.
--
-- Ensimmäinen avain: paivan_menoraja = kuinka monta kellonaikaan sidottua
-- tapahtumaa yhdellä päivällä pitää olla ennen kuin Kuormavahti näyttää
-- merkin agendassa/viikkonäkymässä, ks. muistiinpanot.md "Kuormavahti"-osio.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table asetukset (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table asetukset enable row level security;
create policy "asetukset_all" on asetukset for all using (auth.uid() is not null);

insert into asetukset (key, value) values ('paivan_menoraja', '5')
on conflict (key) do nothing;

commit;
