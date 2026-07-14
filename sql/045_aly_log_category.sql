-- E3-yöajo: "hetki vs. ikkuna" -erottelu (ks. muistiinpanot.md, tarkentaa
-- 2026-07-16 aamun "vain kerran" -korjausta). Äly luokittelee jokaisen
-- osuman kahteen lajiin:
-- - 'hetki' = yksittäinen ajankohta ("hammaslääkäri ti klo 15") — nousee
--   VAIN KERRAN, raukeaa pysyvästi jos reagoimatta (hiljaisuus = vastaus).
-- - 'ikkuna' = takaraja jota kohti kuljetaan ("osta liput 24.7. mennessä")
--   — saa nousta uudelleen kerran päivässä takarajaan asti.
-- Epävarma laji käsitellään aina 'hetki':nä (varovaisempi vaihtoehto).
--
-- Tallennetaan `aly_log`-riville (luotu ehdotushetkellä) — yöajon
-- raukeamisvaihe lukee tämän päättääkseen merkitäänkö muru pysyvästi
-- käsitellyksi (hetki, tai ikkuna jonka takaraja on ohi) vai jätetäänkö
-- se avoimeksi huomiselle (ikkuna, takaraja ei vielä ohi).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table aly_log add column if not exists category text;
alter table aly_log add column if not exists deadline date;

commit;
