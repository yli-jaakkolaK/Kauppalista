-- Arkkitehtuurimuutos: "yksi totuus, kaksi ikkunaa". iPhonen Kalenteri ja
-- Sataman kalenteri näyttävät AINA saman datan — Satama ei enää piilota
-- synkattuja tapahtumia hyväksyntäjonoon (kalenteri_odottavat, käytöstä
-- poistuva, EI pudoteta tällä migraatiolla — jätetty inertiksi turvaksi).
-- Kaikki synkatut tapahtumat menevät suoraan kalenteri_tapahtumat-tauluun.
-- Toisen käyttäjän lisäämät saavat "uusi"-merkinnän kunnes KUITTAA — kuittaus
-- tarkoittaa "nähty", ei hyväksyntää, eikä koskaan poista tapahtumaa.
--
-- kalenteri_tekijat: data-ohjattu (Table Editor -täytettävä) kartta
-- ICS-tapahtuman ORGANIZER-kentästä (tai muusta tekijätunnisteesta, jos
-- ORGANIZER ei ole käytettävissä jaetuissa iCloud-kalentereissa — ks.
-- muistiinpanot.md "Tekijän tunnistus") Satama-käyttäjän user_id:hen. Jos
-- tapahtuman organizeria ei löydy tästä kartasta, jätetään kalenteri_
-- tapahtumat.user_id NULLiksi — silloin tapahtuma näkyy "uutena" KAIKILLE
-- käyttäjille (turvallinen oletus, ei tarvitse tekijätietoa toimiakseen).
--
-- kalenteri_kuittaukset: per-käyttäjä loki siitä mitkä tapahtumat on nähty.
-- Tapahtuma on "uusi minulle" jos sen ical_uid EI ole tässä taulussa oman
-- user_id:n kohdalla JA tapahtuman user_id (jos tunnettu) EI ole minä itse.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table kalenteri_tekijat (
  organizer_tunniste text primary key,
  user_id uuid not null references auth.users(id)
);

alter table kalenteri_tekijat enable row level security;
create policy "kalenteri_tekijat_select" on kalenteri_tekijat for all using (auth.uid() is not null);

create table kalenteri_kuittaukset (
  id bigint generated always as identity primary key,
  ical_uid text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  kuitattu_at timestamptz not null default now(),
  unique (ical_uid, user_id)
);

alter table kalenteri_kuittaukset enable row level security;
create policy "kalenteri_kuittaukset_select_own" on kalenteri_kuittaukset for select using (user_id = auth.uid());
create policy "kalenteri_kuittaukset_insert_own" on kalenteri_kuittaukset for insert with check (user_id = auth.uid());
-- update-policy tarvitaan koska frontend käyttää upsertia (samaa tapahtumaa
-- voi kuitata "uudelleen" jos rivi on jo olemassa) — ilman tätä upsertin
-- ON CONFLICT DO UPDATE -haara torjuttaisiin RLS:ssä (sama syy kuin
-- push_tilaukset-taulun update-policyllä, ks. sql/015_push_tilaukset.sql).
create policy "kalenteri_kuittaukset_update_own" on kalenteri_kuittaukset for update using (user_id = auth.uid()) with check (user_id = auth.uid());

commit;
