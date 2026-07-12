-- E3-keskiportaan V1 "äly toimii, ihminen valvoo" — kaksi uutta taulua.
-- Nimet ja sarakkeet englanniksi (uusi koodi/skeema, talon säännön
-- mukaisesti, ks. COPILOT.md "Koodikieli") — kummallakaan taululla ei ole
-- historiallista suomenkielistä nimeä säilytettävänä.
--
-- aly_log: "Mitä äly on tehnyt" -näkymän tietolähde (Asetukset). Yksi rivi
-- per yöajon tekemä ankkuriehdotus. undone_at asetetaan kun ehdotus
-- puretaan (käyttäjän oma "poista"-nappi ehdokaskortilta, Asetusten
-- "Kumoa"-nappi, TAI seuraavan yöajon automaattinen raukeaminen) — kaikki
-- kolme tarkoittavat samaa: älyn lisäämä ankkuririvi on poistettu. Rivit
-- EIVÄT KOSKAAN poistu itse — loki on pysyvä historia.
--
-- aly_evaluated: puhtaasti sisäinen kirjanpito yöajolle, EI KOSKAAN
-- luettu/kirjoitettu asiakaspuolelta — merkitsee minkä Laiturin murujen on
-- todettu EIVÄT viittaa mihinkään päivämäärään (ei osumaa), jottei samaa
-- murua kysytä äly-putkelta joka yö uudelleen. Murut JOTKA TUOTTIVAT
-- ehdokkaan EIVÄT päädy tähän tauluun — jos ehdotus myöhemmin puretaan,
-- sama muru on taas vapaa uudelleenarvioitavaksi seuraavana yönä (jos yhä
-- ajankohtainen). Ei RLS-policyja lainkaan — vain service_role (yöajon
-- Vercel-funktio) koskee tähän tauluun, mikä on tarkoituksellista, ei unohdus.
--
-- TURVAINVARIANTTI: kumpikaan taulu EI KOSKETA `laituri`-tauluun mitenkään
-- — ei UPDATE, ei DELETE. Murut pysyvät koskemattomina.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists aly_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  action text not null,
  description text not null,
  source_ref text,
  anchor_id bigint references ankkurit(id) on delete set null,
  created_at timestamptz not null default now(),
  undone_at timestamptz
);

alter table aly_log enable row level security;

drop policy if exists "aly_log_select_own" on aly_log;
create policy "aly_log_select_own" on aly_log for select using (user_id = auth.uid());

drop policy if exists "aly_log_insert_own" on aly_log;
create policy "aly_log_insert_own" on aly_log for insert with check (user_id = auth.uid());

-- Tarvitaan koska "Kumoa"-nappi asettaa undone_at:n suoraan käyttäjän
-- omasta selaimesta (ei palvelinreitin kautta) — sama upsert/update-policy
-- -opittu asia kuin muillakin tauluilla tässä projektissa.
drop policy if exists "aly_log_update_own" on aly_log;
create policy "aly_log_update_own" on aly_log for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists aly_evaluated (
  laituri_id bigint primary key references laituri(id) on delete cascade,
  evaluated_at timestamptz not null default now()
);

alter table aly_evaluated enable row level security;
-- Ei policyja tarkoituksella — vain service_role (RLS:n ohittava
-- palvelinavain) saa koskaan koskea tähän tauluun.

commit;
