-- Sinnikäs muistutus / "tärähdyssarja" (2026-07-19, ks. muistiinpanot.md
-- "Sinnikäs muistutus" / KONSEPTIKIRJA.md 4.8) — kolmas muistutuslaji
-- kerta- ja valmistautumis-muistutusten (sql/066) rinnalle. Tarve:
-- aamutohinassa yksi pörinä katoaa (kädet saippuassa, lapsi huutaa) — sama
-- muistutus toistuu tiheästi rajatun ikkunan ajan ennen kohdehetkeä, kunnes
-- käyttäjä kuittaa tai kohdehetki (remind_at) ohitetaan.
--
-- persistent (boolean, oletus false): onko tämä sinnikäs. Kun true,
-- window_minutes+frequency määrittävät tärähdysten aikataulun — remind_at
-- on KOHDEHETKI (esim. "lähtö 8:00"), ei ensimmäisen tärähdyksen aika.
-- Ensimmäinen tärähdys lähtee (remind_at - window_minutes), seuraavat
-- window_minutes/frequency-minuutin välein, viimeinen ennen remind_at:ia.
--
-- sent_count: kuinka monta tärähdystä on jo lähetetty tälle riville — EI
-- sama kuin kertaluontoisen muistutuksen sent_at (joka pysyy NULLINA koko
-- sinnikkään ikkunan ajan, jotta rivi näkyy yhä aktiivisena
-- muistutuspaneelin listassa). sent_at asetetaan VASTA kun sarja PÄÄTTYY
-- (kuitattu TAI kohdehetki ohitettu TAI kaikki tärähdykset lähetetty) —
-- silloin rivi käyttäytyy identtisesti kertaluontoisen muistutuksen kanssa
-- (katoaa aktiivisesta listasta, ei enää cron-käsittelyä).
--
-- acked_at: käyttäjän eksplisiittinen "✓ Hoidettu" -kuittaus (apista).
-- Tarkistetaan ENNEN jokaista lähetystä (ks. api/muistutukset-laheta.js) —
-- kuittaus lopettaa sarjan HETI riippumatta jäljellä olevasta ikkunasta.
--
-- Kaikki neljä uutta saraketta ovat valinnaisia/oletusarvoisia — ei vaikuta
-- olemassa oleviin kertaluontoisiin tai valmistautumis-riveihin mitenkään
-- (persistent=false oletuksena, sama käytös kuin ennen tätä migraatiota).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table muistutukset add column if not exists persistent boolean not null default false;
alter table muistutukset add column if not exists window_minutes int;
alter table muistutukset add column if not exists frequency int;
alter table muistutukset add column if not exists sent_count int not null default 0;
alter table muistutukset add column if not exists acked_at timestamptz;

commit;
