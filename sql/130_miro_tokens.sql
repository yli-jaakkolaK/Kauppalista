-- Miro OAuth-tokenien pysyvä säilytyspaikka (2026-08-17). Miron
-- refresh_token KIERTYY (rotate) joka käytöllä — vanha mitätöityy heti kun
-- uusi on annettu — joten staattiset Vercel-ympäristömuuttujat eivät riitä
-- pitkän aikavälin säilytykseen, palvelinfunktion pitää voida KIRJOITTAA
-- tuore pari joka kerta kun se päivittää tokenin.
--
-- EI sama malli kuin asetukset-taulu (RLS auki kaikille kirjautuneille) —
-- tämä on TARKOITUKSELLA RLS päällä ILMAN YHTÄÄN policya authenticated/anon-
-- rooleille, joten VAIN service-role-avain (jota kaikki api/_lib-funktiot jo
-- käyttävät SUPABASE_SERVICE_KEY:na) pääsee tähän käsiksi. Kumpikaan
-- kirjautunut käyttäjä (Katri/Juha) ei näe näitä millään client-kyselyllä.
--
-- Yksi kiinteä rivi (id=1) riittää — yhdellä Satama-asennuksella on yksi
-- Miro-yhteys, ei per-käyttäjä.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists miro_tokens (
  id int primary key default 1,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint miro_tokens_singleton check (id = 1)
);

alter table miro_tokens enable row level security;
-- Tarkoituksella EI YHTÄÄN policya — RLS päällä + policyn puute = kaikki
-- authenticated/anon-kyselyt hylätään automaattisesti, vain service-role
-- (RLS-ohitus per Supabasen oma malli) pääsee läpi.

commit;
