-- Juhan CalDAV-tilin syöterivit (sovittu aiemmin, ks. muistiinpanot.md
-- "Kalenterisyötteet"-osio) — sama kolme kalenteria kuin Katrin tilillä jo
-- on (sql/019: Perhekalenteri/Juha/Katri), mutta haettuna Juhan OMILLA
-- tunnuksilla (account_key='juha'). ICLOUD_USERNAME_JUHA/ICLOUD_APP_PASSWORD_JUHA
-- ovat jo Vercelin ympäristömuuttujissa (ei uutta konfigurointia).
--
-- TARKISTA ENNEN AJOA: `GET /api/caldav-sync?listaa=juha` palauttaa Juhan
-- tilin kalentereiden TARKAT näyttönimet — täsmää ne tähän tunniste-
-- sarakkeeseen kirjain kirjaimelta ennen ajoa, sama varotoimi kuin
-- Katrin tilillä aikanaan (sql/019:n yläkommentti).
--
-- henkilo asetettu KALENTERIN IDENTITEETIN mukaan, ei account_keyn mukaan —
-- sama looginen kalenteri pysyy samana riippumatta kumman tilin kautta se
-- haetaan: "Perhekalenteri" pysyy jaettuna (henkilo NULL), "Juha"/"Katri"
-- saavat henkilönsä. Sama luokittelu kuin Katrin tilin riveillä (sql/024).
--
-- UID-DUPLIKAATTISUOJA KAHDEN TILIN VÄLILLÄ — tarkistettu lukemalla koodi,
-- EI muutettu mitään (mekanismi oli jo olemassa, kirjoitettu yhtä syötettä
-- varten mutta toimii identtisesti monelle): ical_uid tulee suoraan
-- iCalendarin omasta UID-kentästä (event.uid, api/caldav-sync.js) — EI
-- koskaan sisällä syote- tai account-kohtaista lisäystä. Jaettu iCloud-
-- kalenteri (esim. "Perhekalenteri") tuottaa siis TÄSMÄLLEEN saman UID:n
-- riippumatta kumman tilin tunnuksilla se haetaan. Koska kalenteri_tapahtumat.
-- ical_uid on UNIQUE ja kirjoitus käyttää `on_conflict=ical_uid` +
-- `Prefer: resolution=merge-duplicates`, sama tapahtuma kirjoittuu Satamaan
-- VAIN KERRAN vaikka se tulisi sisään kahden eri syötteen (kahden eri
-- tilin) kautta samalla synkkauskerralla.
-- Tunnettu, harmiton vivahde: koska molemmat tilit synkkautuvat
-- rinnakkain (Promise.allSettled), jaetun kalenterin tapahtuman rivin
-- syote_id (ja siten agendassa näkyvä väripallo) voi "vaihtua" kumman
-- tilin synkka sattuu kirjoittamaan viimeisenä — ei vaikuta tapahtuman
-- sisältöön (otsikko/aika pysyvät identtisinä kummaltakin tililtä), vain
-- kosmeettiseen värivalintaan satunnaisissa tapauksissa.
--
-- VAATII: sql/017 (account_key-sarake), sql/019 (uniikki-rajoite
-- tunniste+account_key), sql/024 (henkilo-sarake) AJETTU ENSIN.
--
-- Idempotentti (sama on conflict do nothing -kaava kuin sql/019).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

insert into kalenteri_syotteet (name, tyyppi, tunniste, mode, account_key, henkilo, enabled) values
  ('Perhekalenteri (Juhan tili)', 'icloud', 'Perhekalenteri', 'taysi', 'juha', null, true),
  ('Juha (Juhan tili)', 'icloud', 'Juha', 'taysi', 'juha', 'juha', true),
  ('Katri (Juhan tilin kautta)', 'icloud', 'Katri', 'taysi', 'juha', 'katri', true)
on conflict (tunniste, account_key) do nothing;

commit;
