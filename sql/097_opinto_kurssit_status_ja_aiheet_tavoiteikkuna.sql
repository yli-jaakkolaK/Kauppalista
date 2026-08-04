-- Kurssiradan laajennus siltasolmumallia varten (2026-08-05, ks.
-- muistiinpanot.md "Siltasolmut" — korvaa 2026-08-04:n taitosolmut-
-- ensimmäisen version, ks. sql/095/096 yläkommentit).
--
-- opinto_kurssit.status: sama aktiivinen/arkistoitu-malli kuin hytti_kortit
-- (sql/016). Tarvitaan koska siltatunnistus lukee VAIN aktiivisten kurssien
-- materiaalin ("kun kurssilista muuttuu, lue kaikki aktiiviset yhtenä
-- nippuna") — ilman tätä ei ole tapaa tietää mitkä kurssit ovat "sillä
-- hetkellä käynnissä".
--
-- opinto_aiheet.tavoiteikkuna: sama pehmeä yhden-kentän deadline kuin
-- taitosolmuilla jo on (sql/092) — ilman tätä esim. "elokuu — algebra"
-- jäisi pelkäksi tekstiksi eikä vaikuttaisi mihinkään painotukseen (Katrin
-- oma huomio: "näyttää tallessa olevalta mutta on vain koristetta").
--
-- kurssi_kiireellisyys_paivia: kynnys jonka sisällä/ohi ALOITTAMATON
-- kurssitehtävä saa TASO 1 -kovan etusijan siltaehdotuksiin nähden
-- (laskeOpintoPaivanAskeleet-moottorin kaksitasoinen valinta, script.js).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table opinto_kurssit add column if not exists status text not null default 'aktiivinen'
  check (status in ('aktiivinen', 'arkistoitu'));

alter table opinto_aiheet add column if not exists tavoiteikkuna date;

insert into asetukset (key, value) values
  ('kurssi_kiireellisyys_paivia', '3')
on conflict (key) do nothing;

commit;
