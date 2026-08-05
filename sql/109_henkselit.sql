-- Henkselit (2026-08-05, ks. muistiinpanot.md "Henkselit") — per-vanhempi
-- "olen poissa laskuista" -aikaikkuna. Vaikuttaa hoivaikkuna-/
-- ristiriitalogiikkaan (script.js: henkselitPaallekkaisyys), Kuormavahti/
-- Hytti-kytkentään (laskeOpintoPaivanAskeleet-esto), ja piirtyy
-- kalenterin kaikkiin kolmeen näkymään omana visuaalisena tasona.
--
-- Jaettu perheen data, SAMA RLS-malli kuin lapset (sql/105) — ei
-- owner_id-rajausta, auth.uid() is not null riittää kaikkiin neljään
-- operaatioon. Tietoinen valinta: kumpikaan puoliso ei ole "omistaja" tässä
-- mielessä, vaikka merkitsijä käytännössä aina merkitsee vain itsensä
-- (script.js:n asetus-UI ei tarjoa henkilövalitsinta, hakee omaa henkiloa
-- hytti_omistajat-taulusta kuten jo tehdään toisen käyttäjän puolella,
-- ks. paivitaHenkiloKartta()).
--
-- alkaa/paattyy ovat timestamptz (ei date+time erikseen) koska merkintä voi
-- ulottua yli puolenyön (esim. 22:00-> seuraavan päivän 00:00) ja koska
-- ajastettu automaattipoisto (api/muistutukset-laheta.js, sama 5 min
-- cron-kadenssi kuin muillakin deterministisillä TASO 2 -tarkistuksilla,
-- ei uutta cron-job.org-rekisteröintiä) vertaa suoraan `now()`:iin.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists henkselit (
  id bigint generated always as identity primary key,
  henkilo text not null check (henkilo in ('katri', 'juha')),
  alkaa timestamptz not null,
  paattyy timestamptz not null,
  created_at timestamptz not null default now(),
  constraint henkselit_jarjestys check (alkaa < paattyy)
);
create index if not exists henkselit_aikavali_idx on henkselit (alkaa, paattyy);

alter table henkselit enable row level security;

create policy "henkselit_select" on henkselit for select using (auth.uid() is not null);
create policy "henkselit_insert" on henkselit for insert with check (auth.uid() is not null);
create policy "henkselit_update" on henkselit for update using (auth.uid() is not null);
create policy "henkselit_delete" on henkselit for delete using (auth.uid() is not null);

commit;
