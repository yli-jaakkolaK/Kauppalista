-- Geneerinen kalenterisyöte-arkkitehtuuri: yksi yleinen syötekoneisto, ei
-- erillisiä himmeleitä per kalenteri. Uusi kalenteri lisätään Table
-- Editorista rivinä kalenteri_syotteet-tauluun, EI koodimuutoksena — tärkeää
-- koska kehityskone palautuu 23.7.2026, sen jälkeen jatketaan vain
-- Copilotilla eikä enää koodata uusia hardkoodattuja kalenterinimiä.
--
-- Kaksi syötetyyppiä (tyyppi-sarake), toteutettu api/caldav-sync.js:ssä:
--   'icloud'   -> tunniste on CalDAV-kalenterin TARKKA näyttönimi iCloudissa
--                 (esim. "Yhteinen"). Haetaan yhdellä yhteisellä Apple-tilillä
--                 Vercelin ympäristömuuttujista (ICLOUD_USERNAME/ICLOUD_APP_PASSWORD).
--   'ics_url'  -> tunniste on julkaistun .ics-tiedoston https-osoite, haetaan
--                 suoraan HTTP GET:llä, ei vaadi kirjautumista. Tätä varten
--                 voi testata koko putken ilman oikeaa työkalenteria: luo
--                 testikalenteri, julkaise se, lisää sen ICS-linkki tähän
--                 tauluun mode='vain_varattu'.
--
-- Kaksi tilaa (mode-sarake):
--   'taysi'        -> koko tapahtuma (nimi, aika) menee hyväksyntäjonoon
--                     (kalenteri_odottavat), ei koskaan suoraan läpi —
--                     yksinkertaisuuden vuoksi EI organizer-pohjaista
--                     automaattihyväksyntää tässä versiossa (voisi lisätä
--                     myöhemmin omana mode-arvonaan jos tarvetta, ei nyt).
--   'vain_varattu' -> KAIKKI paitsi alku/loppuaika riisutaan JO TUONNISSA
--                     (api/caldav-sync.js:ssä, ei tässä SQL:ssä) — nimi,
--                     paikka, osallistujat eivät koskaan päädy tietokantaan
--                     asti. Menee suoraan kalenteri_tapahtumat-tauluun
--                     tekstillä "🔒 Varattu HH–HH", ohittaa hyväksyntäjonon
--                     kokonaan koska mitään hyväksyttävää ei ole.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table kalenteri_syotteet (
  id bigint generated always as identity primary key,
  name text not null,
  tyyppi text not null, -- 'icloud' / 'ics_url'
  tunniste text not null, -- CalDAV-näyttönimi TAI ics-url, ks. yllä
  mode text not null default 'taysi', -- 'taysi' / 'vain_varattu'
  vari text, -- hex-väri agendan värimerkintään, esim '#9B7FD4'. Jos null, käytetään CSS:n oletusväriä.
  enabled boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

alter table kalenteri_syotteet enable row level security;

create policy "kalenteri_syotteet_all" on kalenteri_syotteet for all using (auth.uid() is not null);

-- Mistä syötteestä tapahtuma tuli. NULL = käsin lisätty Satamassa suoraan.
alter table kalenteri_tapahtumat add column if not exists syote_id bigint references kalenteri_syotteet(id);

-- iCalendarin UID — yleinen iCal-formaatin kenttä, ei icloud-spesifinen,
-- käytössä sekä CalDAV- että ics_url-syötteillä. Estää saman tapahtuman
-- tuonnin kahdesti. Toistuvan tapahtuman yksittäisellä esiintymällä on
-- tämä sama UID + '#' + esiintymän oma alkuhetki (ks. api/caldav-sync.js).
alter table kalenteri_tapahtumat add column if not exists ical_uid text unique;

-- Tarvitaan vain_varattu-tilan "🔒 Varattu 18–20" -näytölle.
alter table kalenteri_tapahtumat add column if not exists event_end_time time;

-- Hyväksyntää odottavat (tai hylätyt) tapahtumat taysi-tilan syötteiltä.
-- Pidetään erillään kalenteri_tapahtumat-taulusta, jottei tarvinnut koskea
-- mihinkään jo toimivaan agendan hakulogiikkaan (lataaKalenteri() script.js:ssä
-- suodattaa aina vain kalenteri_tapahtumat-taulua, ei tätä).
create table kalenteri_odottavat (
  id bigint generated always as identity primary key,
  ical_uid text not null unique,
  syote_id bigint not null references kalenteri_syotteet(id),
  title text not null,
  event_date date not null,
  event_time time,
  event_end_time time,
  status text not null default 'odottaa', -- 'odottaa' / 'hylatty'. EI poisteta hylättynäkään,
                                           -- muuten sama tapahtuma tuotaisiin seuraavassa
                                           -- synkkauksessa uudelleen (ical_uid pysyy tiedossa).
  created_at timestamptz not null default now()
);

alter table kalenteri_odottavat enable row level security;

create policy "kalenteri_odottavat_all" on kalenteri_odottavat for all using (auth.uid() is not null);

commit;
