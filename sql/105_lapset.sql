-- Ristiriitapaketti v2, osa 1: lapsiprofiilit + viikkopohja + lukuvuosi-
-- jaksot + päiväpoikkeus (2026-08-06, ks. muistiinpanot.md "Ristiriita-
-- paketti v2"). Korvaa vanhan LITTEÄN, kaikille lapsille yhteisen
-- "rauhoitettu ikkuna" -mallin (kausi+viikonpäivät+lomalista+klo 9-15,
-- sql/024) lapsikohtaisella, todellisilla hoitoajoilla lasketulla mallilla.
-- Vanha `onkoRauhoitusIkkunassa()` (Hytin rutiinipäällekkäisyyksien
-- vaimennus, `rauhoitus_alku`/`rauhoitus_loppu`) EI kosketa tätä — täysin
-- eri mekanismi, ei liity lapsiin ollenkaan.
--
-- Jaettu perheen data (molemmat käyttäjät näkevät/muokkaavat kokonaan) —
-- SAMA RLS-malli kuin laituri (sql/004): ei owner_id-rajausta, vain
-- auth.uid() is not null kaikille neljälle operaatiolle.
--
-- lapset: syntymapäivä (ikä lasketaan, ei tallenneta erikseen — pysyy
--   ajan tasalla automaattisesti). hoitopaikka_tyyppi on kevyt informatiivinen
--   kenttä (ei suoraan käytössä laskennassa — viikkopohja on totuuden lähde
--   ajoista, hoitopaikka_tyyppi vain kertoo MIKSI). Kolme ikäkynnystä +
--   nukkumaanmeno + tarvitsee_valvontaa ovat KAIKKI valinnaisia (null =
--   kynnystä ei sovelleta, turvallisin oletus on tulkita täysi tarve
--   valvonnalle kunnes toisin kerrotaan).
--
-- lapsi_viikkopohja: kellonajat per viikonpäivä (0=su...6=la, JS:n
--   Date.getDay()-numerointi — HUOM tämä on ERI numerointi kuin
--   ristiriita_viikonpaivat-asetuksen 1=ma...7=su, koska viikkopohja
--   luetaan suoraan JS:n omalla getDay()-arvolla eikä sitä muunneta,
--   yksinkertaisempi kuin pitää kahta numerointia synkassa käsin).
--
-- lukuvuosijaksot: lapsikohtainen (päiväkoti/koulu eri lomat). tyyppi=
--   'koulussa' on oletusjakso normaaliajalle (ei pakollinen käyttää — jos
--   mitään jaksoa ei löydy kyseiselle päivälle, viikkopohja pätee
--   sellaisenaan) — muut kolme tyyppiä (loma/suunnittelupaiva/arkipyha)
--   ohittavat viikkopohjan kokonaan, koko päivä kotona.
--
-- lapsi_paivapoikkeus: kertaluontoinen, yksi päivä. tyyppi 'mukautettu'
--   käyttää alkaa/paattyy-kenttiä (poissaoloikkuna sille päivälle, korvaa
--   viikkopohjan) — 'kotona'/'poissa' eivät käytä niitä ollenkaan (koko
--   päivä toiseen suuntaan). Prioriteetti laskennassa: paivapoikkeus >
--   lukuvuosijakso > viikkopohja (ks. script.js:n haeHoivaikkunat()).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists lapset (
  id bigint generated always as identity primary key,
  nimi text not null,
  syntymapaiva date,
  hoitopaikka_tyyppi text check (hoitopaikka_tyyppi in ('koulu', 'paivakoti', 'kotona')),
  ika_yksin_hetkittain int,
  ika_iltaan_asti int,
  ika_yksin_illassa int,
  nukkumaanmeno time not null default '20:30',
  tarvitsee_valvontaa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists lapsi_viikkopohja (
  id bigint generated always as identity primary key,
  lapsi_id bigint not null references lapset(id) on delete cascade,
  viikonpaiva int not null check (viikonpaiva between 0 and 6),
  alkaa time not null,
  paattyy time not null,
  unique (lapsi_id, viikonpaiva)
);

create table if not exists lukuvuosijaksot (
  id bigint generated always as identity primary key,
  lapsi_id bigint not null references lapset(id) on delete cascade,
  alkaa date not null,
  paattyy date not null,
  tyyppi text not null check (tyyppi in ('koulussa', 'loma', 'suunnittelupaiva', 'arkipyha')),
  constraint lukuvuosijaksot_jarjestys check (alkaa <= paattyy)
);
create index if not exists lukuvuosijaksot_lapsi_idx on lukuvuosijaksot (lapsi_id);

create table if not exists lapsi_paivapoikkeus (
  id bigint generated always as identity primary key,
  lapsi_id bigint not null references lapset(id) on delete cascade,
  paiva date not null,
  tyyppi text not null check (tyyppi in ('kotona', 'poissa', 'mukautettu')),
  alkaa time,
  paattyy time,
  huomio text,
  created_at timestamptz not null default now(),
  unique (lapsi_id, paiva)
);

alter table lapset enable row level security;
alter table lapsi_viikkopohja enable row level security;
alter table lukuvuosijaksot enable row level security;
alter table lapsi_paivapoikkeus enable row level security;

create policy "lapset_select" on lapset for select using (auth.uid() is not null);
create policy "lapset_insert" on lapset for insert with check (auth.uid() is not null);
create policy "lapset_update" on lapset for update using (auth.uid() is not null);
create policy "lapset_delete" on lapset for delete using (auth.uid() is not null);

create policy "lapsi_viikkopohja_select" on lapsi_viikkopohja for select using (auth.uid() is not null);
create policy "lapsi_viikkopohja_insert" on lapsi_viikkopohja for insert with check (auth.uid() is not null);
create policy "lapsi_viikkopohja_update" on lapsi_viikkopohja for update using (auth.uid() is not null);
create policy "lapsi_viikkopohja_delete" on lapsi_viikkopohja for delete using (auth.uid() is not null);

create policy "lukuvuosijaksot_select" on lukuvuosijaksot for select using (auth.uid() is not null);
create policy "lukuvuosijaksot_insert" on lukuvuosijaksot for insert with check (auth.uid() is not null);
create policy "lukuvuosijaksot_update" on lukuvuosijaksot for update using (auth.uid() is not null);
create policy "lukuvuosijaksot_delete" on lukuvuosijaksot for delete using (auth.uid() is not null);

create policy "lapsi_paivapoikkeus_select" on lapsi_paivapoikkeus for select using (auth.uid() is not null);
create policy "lapsi_paivapoikkeus_insert" on lapsi_paivapoikkeus for insert with check (auth.uid() is not null);
create policy "lapsi_paivapoikkeus_update" on lapsi_paivapoikkeus for update using (auth.uid() is not null);
create policy "lapsi_paivapoikkeus_delete" on lapsi_paivapoikkeus for delete using (auth.uid() is not null);

commit;
