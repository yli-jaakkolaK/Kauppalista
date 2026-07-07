-- Oma sisäinen kalenteri: päivä/viikko/kuukausinäkymät. Ei ulkoista
-- synkronointia (iCloud/Google) tässä vaiheessa — voidaan lisätä myöhemmin
-- samaan tauluun (esim. external_id-sarake tunnistamaan synkatut tapahtumat).
--
-- event_date/event_time (ei timestamptz) koska kyseessä on yksinkertainen
-- perheen kalenteri, ei aikavyöhykkeiden yli toimiva järjestelmä.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table kalenteri_tapahtumat (
  id bigint generated always as identity primary key,
  title text not null,
  event_date date not null,
  event_time time,
  user_id uuid,
  created_at timestamptz not null default now()
);

alter table kalenteri_tapahtumat enable row level security;

create policy "kalenteri_all" on kalenteri_tapahtumat for all using (auth.uid() is not null);

commit;
