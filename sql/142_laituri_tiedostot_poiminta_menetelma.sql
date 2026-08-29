-- Tallentaa MITEN liitetiedoston teksti poimittiin ("paikallinen" =
-- pdf-parse ilman tekoälyä, "anthropic" = Claude luki dokumentin) —
-- Katrin pyyntö 2026-08-29: pdf-poiminta muuttui oletuksena AINA
-- paikalliseksi (kustannustehokkain, ei automaattista API-kutsua), ja
-- käyttäjä voi erikseen pyytää tekoälyn parannusta jälkikäteen kun
-- haluaa/kun saldoa on. Tämä sarake kertoo UI:lle (script.js) milloin
-- "✨ Paranna tekoälyllä" -valikkokohta kannattaa näyttää (vain silloin
-- kun tulos on vielä paikallinen, ei enää kun tekoäly on jo parantanut sen).
--
-- Idempotentti (add column if not exists). Ajettu jo suoraan MCP:n kautta
-- 29.8.2026 - tämä tiedosto on historiakirjaus (ks. sql/138:n vastaava malli).

begin;

alter table laituri_tiedostot add column if not exists poiminta_menetelma text;

commit;
