-- Muistutukset v1: henkilökohtainen push-muistutus listan riville,
-- kalenteritapahtumalle tai ankkurille. Rakentuu valmiin push-infran päälle
-- (sql/015_push_tilaukset.sql) — tämä taulu vain KERTOO milloin ja mitä
-- lähetetään, itse lähetys on api/muistutukset-laheta.js.
--
-- source_ref on TEXT (ei FK) koska sama taulu palvelee kolmea eri lähdetaulua
-- (tuotteet/kalenteri_tapahtumat/ankkurit) — sama malli kuin ankkurit-taulun
-- omassa source/source_ref-parissa. content on TEKSTIKOPIO asetushetkellä,
-- jotta push toimii vaikka alkuperäinen rivi muuttuisi/katoaisi sillä välin.
--
-- Kohteen poisto siivoaa sen muistutukset SOVELLUSKOODISTA käsin (ei
-- kannan tason cascadea, koska source_ref ei ole oikea FK) — ks.
-- poistaTuote()/piirraKalenteriRivi()/lataaAnkkurit() script.js:ssä.
-- Tunnettu rajoitus: kokonaisen LISTAN poisto (poistaLista()) poistaa sen
-- tuotteet-rivit suoraan list_id:n perusteella koskematta muistutukset-
-- tauluun — harvinainen reunatapaus, ei ratkaistu V1:ssä.
--
-- Ei update-policya: muistutusta ei muokata, poisto+uusi riittää (EI V1:EEN,
-- ks. muistiinpanot.md "Muistutukset"-osio). sent_at asetetaan AINOASTAAN
-- palvelimelta service_role-avaimella (ohittaa RLS:n), ei koskaan selaimesta.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table muistutukset (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('rivi', 'kalenteri', 'ankkuri')),
  source_ref text not null,
  content text not null,
  remind_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table muistutukset enable row level security;

create policy "muistutukset_select_own" on muistutukset for select using (user_id = auth.uid());
create policy "muistutukset_insert_own" on muistutukset for insert with check (user_id = auth.uid());
create policy "muistutukset_delete_own" on muistutukset for delete using (user_id = auth.uid());

commit;
