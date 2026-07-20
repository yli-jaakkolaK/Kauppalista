-- Toistuva muistutus (2026-07-19, ks. muistiinpanot.md "Toistuva muistutus"
-- / KONSEPTIKIRJA.md 4.8) — neljäs ja viimeinen muistutuslaji: yksi SÄÄNTÖ,
-- loputtomasti eri kertoja. VASTAKKAINEN kuittaussemantiikka Sinnikkääseen
-- (sql/075) nähden — älä sekoita: sinnikäs = yksi asia, monta yritystä,
-- kuittaus TAPPAA sarjan. Toistuva = yksi sääntö, kuittaus (jos sellaista
-- edes on) koskee VAIN toteutunutta kertaa, sääntö elää ja laskee itse
-- seuraavan kertansa. Tästä syystä toistuvalla EI ole acked_at-kenttää eikä
-- kuittaus-UI:ta ollenkaan — rivi etenee automaattisesti joka lähetyksellä
-- (ks. api/muistutukset-laheta.js), ja lopettaminen tapahtuu VAIN poistamalla
-- rivi tai saavuttamalla ends_at.
--
-- remind_at TOIMII TÄSSÄ "next_fire_at":na — se pidetään aina SEURAAVAN
-- laukaisun ajankohtana ja päivitetään atomisesti (remind_at-CAS) joka
-- onnistuneen lähetyksen jälkeen. sent_at pysyy NULLINA koko säännön eliniän
-- (rivi näkyy siis aina "aktiivisena" muistutuspaneelin listassa, kuten
-- sinnikkäänkin sent_count-vaiheessa) — sent_at asetetaan VASTA kun sääntö
-- PÄÄTTYY (ends_at saavutettu tai laskentavirhe).
--
-- recurring (boolean, oletus false): onko tämä toistuva sääntö.
-- recurrence_type: 'weekday' (viikonpäivät+kellonaika) tai 'interval'
-- (joka N tuntia/päivää/viikkoa/kuukautta/vuotta + kellonaika, paitsi
-- tunti-intervallilla ei kellonaikaa — puhdas kesto).
-- weekdays: ISO-viikonpäivät (1=ma..7=su) taulukkona, VAIN recurrence_type
-- 'weekday':lle.
-- interval_n + interval_unit: VAIN recurrence_type 'interval':lle.
-- time_of_day: 'HH:MM', kaikille paitsi tunti-intervallille.
-- ends_at: valinnainen loppumishetki — jos asetettu ja seuraava laskettu
-- kerta olisi tämän jälkeen, sääntö päättyy (sent_at asetetaan) sitä
-- kertaa lähettämättä.
--
-- Kaikki uudet sarakkeet valinnaisia/oletusarvoisia — ei vaikuta olemassa
-- oleviin kertaluontoisiin, valmistautumis- tai sinnikäs-riveihin mitenkään
-- (recurring=false oletuksena, sama käytös kuin ennen tätä migraatiota).
--
-- Toistuva + sinnikäs -yhdistelmä EI ole tuettu tässä erässä (tietoinen
-- rajaus, ks. muistiinpanot.md) — UI estää tämän jo (Sinnikäs-täppä piilossa
-- kun Toistuva on päällä), tämä migraatio ei lisää tietokantatason estoa
-- koska UI on ainoa syöttöreitti näille sarakkeille.
--
-- Aja tämä Supabasen SQL Editorissa sql/075:n jälkeen.

begin;

alter table muistutukset add column if not exists recurring boolean not null default false;
alter table muistutukset add column if not exists recurrence_type text check (recurrence_type in ('weekday', 'interval'));
alter table muistutukset add column if not exists weekdays int[];
alter table muistutukset add column if not exists interval_n int;
alter table muistutukset add column if not exists interval_unit text check (interval_unit in ('hour', 'day', 'week', 'month', 'year'));
alter table muistutukset add column if not exists time_of_day text;
alter table muistutukset add column if not exists ends_at timestamptz;

commit;
