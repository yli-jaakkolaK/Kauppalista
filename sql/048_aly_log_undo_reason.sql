-- BUGIKORJAUS (2026-07-17, ks. muistiinpanot.md "Äly-loki on umpikuja"):
-- "Mitä äly on tehnyt" -loki näytti rauenneen ehdotuksen yliviivattuna,
-- mutta ei kertonut MIKSI se katosi (raukesi hiljaa reagoimattomana vai
-- käyttäjä itse peruutti sen) eikä muistuttanut että lähdemuru on yhä
-- Laiturissa nostettavissa. Lisää sarakkeen joka kertoo TARKALLEEN kumman
-- kolmesta undone_at-laukaisijasta kyseessä: 'expired' (yöajo, hiljainen
-- raukeaminen), 'dismissed' (ehdokaskortin ×), 'manual' (Asetusten Kumoa-
-- nappi). Vanhat, ennen tätä sarketta syntyneet rivit jäävät NULL:iksi —
-- käyttöliittymä näyttää niille yleisen "Kumottu"-tekstin.

begin;
alter table aly_log add column if not exists undo_reason text;
commit;
