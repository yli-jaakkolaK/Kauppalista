-- "Keskusteluehdotuksen erityissääntö" (2026-07-17, ks. muistiinpanot.md
-- "💬-ehdotuksen elinkaari"): ristiriidasta lähetetty keskusteluehdotus on
-- ERI LAJI kuin tavallinen 💬-delegointiehdotus ("osta liput") — sillä ei
-- ole hylkäysvaihtoehtoa (keskustelupyyntöä ei voi ohittaa hiljaa), vain
-- "Keskusteltu ✓" (kuittaa myös kalenterin ristiriitalipun) tai "Siirrä ⏭".
--
-- Nämä kaksi saraketta säilyttävät VIITTEEN lähderistiriitaan (päivä +
-- tapahtumajoukon allekirjoitus, sama muoto kuin
-- kalenteri_ristiriita_kuittaukset.event_date/tapahtuma_avaimet) — script.js
-- päättelee näiden LÄSNÄOLOSTA onko ankkuri "keskustelulaji" vai tavallinen
-- ehdotus, ei mistään erillisestä lippusarakkeesta.
--
-- Idempotentti (add column if not exists).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table ankkurit add column if not exists ristiriita_pvm date;
alter table ankkurit add column if not exists ristiriita_avain text;

commit;
