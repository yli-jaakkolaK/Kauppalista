-- Ristiriitapaketti v2, osa 3 (2026-08-06): huolilippu (sql/094) saa
-- valinnaisen tapahtuma-ankkurin PÄIVÄMÄÄRÄN LISÄKSI, ei sijasta (Katrin
-- eksplisiittinen rajaus: "joskus huoli on paha aavistus ilman tiettyä
-- merkintää, joskus se kiinnittyy täsmälleen tiettyyn tapahtumaan —
-- kumpikin pitää toimia"). `pvm` pysyy pakollisena/pääasiallisena kenttänä
-- (kaikki laskenta, ks. huolienPaivanPaino() script.js:ssä, käyttää yhä
-- sitä) — `kalenteri_tapahtuma_id` on VAIN visuaalinen/kontekstuaalinen
-- lisäys (mihin kalenteririviin huoli kiinnittyy näytöllä), ei muuta
-- kuormalaskentaa mitenkään.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table paivan_huolet add column if not exists kalenteri_tapahtuma_id bigint references kalenteri_tapahtumat(id) on delete set null;

commit;
