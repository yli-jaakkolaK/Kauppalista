-- Siirtää Asetusten "💡 Vinkit" -osion 9 staattista vinkkiä (aiemmin suoraan
-- index.html:ssä, ks. muistiinpanot.md "Oma Hytti"/Asetukset-osio) omaan
-- `ohjeet`-tauluun, jotta uuden vinkin voi lisätä Table Editorista ilman
-- koodimuutosta. Tämä on JUURI SE taulu jonka muistiinpanot.md ennakoi jo
-- aiemmin ("kun Ohjebanneri-järjestelmä joskus rakennetaan, sama sisältö
-- siirtyy ohjeet-tauluun") — Ohjebanneri (section_key/title/kuittaukset,
-- EI TOTEUTETTU) voi myöhemmin LAAJENTAA tätä taulua uusilla nullable-
-- sarakkeilla, ei tarvitse omaa rinnakkaista taulua nyt.
--
-- Samalla lisätty UUSI vinkki (10.), löydös joka selitti Juhan "satunnaisesti
-- toimivan" kalenterijaon: jos iPhonen oletuskalenteri ei ole Perhekalenteri,
-- pikaisesti lisätyt menot menevät väärään (yksityiseen) kalenteriin eivätkä
-- koskaan päädy Satamaan.
--
-- Idempotentti: uniikki-rajoite `content`-sarakkeessa + on conflict do
-- nothing, sama malli kuin sql/019:ssä.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists ohjeet (
  id bigint generated always as identity primary key,
  content text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table ohjeet enable row level security;

drop policy if exists ohjeet_all on ohjeet;
create policy ohjeet_all on ohjeet for all using (auth.uid() is not null);

insert into ohjeet (content, sort_order) values
  ('Kirjoita rivin alkuun # → siitä tulee väliotsikko (esim. "# Maanantai")', 10),
  ('Napauta väliotsikkoa → uudet rivit menevät sen alle', 20),
  ('Pitkä painallus rivistä → raahaa järjestystä (toimii listoissa, ankkureissa, ruudukossa)', 30),
  ('⚓-napista rivi nousee päivän Ankkureihin etusivulle — ja irtoaa samasta napista', 40),
  ('Listan 🔒-napin takaa: näkyvyys (vihreä kytkin = näkyy molemmille) ja siirto Varastoon/Muistilappuihin', 50),
  ('Jos listan nimessä on "pakkauslista", täpät tyhjenevät itsestään kun kaikki on pakattu — valmiina seuraavaan reissuun', 60),
  ('Sano Sirille: "lisää kauppalistaan maito" — toimii vaikka appi olisi kiinni', 70),
  ('Silmänapista näet ostetut/tehdyt aikaleimoineen', 80),
  ('Uusi lista syntyy aina yksityisenä — mikään ei näy toiselle ennen kuin itse jaat', 90),
  ('Tarkista että iPhonen oletuskalenteri on Perhekalenteri (Asetukset → Kalenteri → Oletuskalenteri) — muuten pikaisesti lisätyt menot karkaavat Sataman ulottumattomiin.', 100)
on conflict (content) do nothing;

commit;
