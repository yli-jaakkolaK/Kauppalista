-- BUGIKORJAUS (2026-07-13): Laituri-pallura sytytti uudelleen JOKA
-- avauksella jo kertaalleen nähdyn mutta yhä sijoittamattoman rivin takia
-- — pallura oli sidottu "sijoittamatta"-tilaan, ei "nähty"-tilaan, mikä
-- rikkoo Laiturin omaa periaatetta ("asiat odottavat häpeättä ja hälyttä").
--
-- Tämä taulu tallentaa kunkin käyttäjän VIIMEISIMMÄN Laiturin avaushetken —
-- kevyin KESTÄVÄ ratkaisu (per-käyttäjä tietokantarivi, ei laitekohtainen
-- localStorage, joten säilyy PWA:n uudelleenasennuksen tai puhelimen
-- vaihdon yli). Yksi rivi per käyttäjä, päivitetään upsertilla joka kerta
-- kun Laituri avataan (`merkitseLaituriNahdyksi()`, script.js).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists laituri_nahty (
  user_id uuid primary key references auth.users(id),
  viimeksi_avattu timestamptz not null default now()
);

alter table laituri_nahty enable row level security;

drop policy if exists "laituri_nahty_select" on laituri_nahty;
create policy "laituri_nahty_select" on laituri_nahty for select using (user_id = auth.uid());

drop policy if exists "laituri_nahty_insert" on laituri_nahty;
create policy "laituri_nahty_insert" on laituri_nahty for insert with check (user_id = auth.uid());

-- Upsert (.upsert({...}, {onConflict:'user_id'})) vaatii AINA erillisen
-- update-policyn insert-policyn lisäksi, muuten ON CONFLICT DO UPDATE
-- -haara hylätään hiljaa RLS:n takia — sama opittu asia jo ankkurit/
-- muistutukset-tauluista tässä projektissa.
drop policy if exists "laituri_nahty_update" on laituri_nahty;
create policy "laituri_nahty_update" on laituri_nahty for update using (user_id = auth.uid());

commit;
