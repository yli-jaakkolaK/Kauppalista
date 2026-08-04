-- Lisäasetukset kahdelle 2026-08-05 rakennetulle Hytti-ominaisuudelle (ks.
-- muistiinpanot.md "Lähes-reaaliaikainen täydennys + häivytys" ja
-- "Aikaikkuna"):
--
-- tehdyn_nakyvyys_maara: tehty/ohitettu-kortti pysyy Tänään-listalla
-- näkyvissä kunnes tämän verran UUSIA askelia on tullut sen jälkeen samana
-- päivänä (ei häviä heti napin painalluksesta).
--
-- kesto_<vaihe>_min: kiinteät PACER-vaihekestot (minuutteina) aikaikkuna-
-- suodatukselle ("minulla on 15 minuuttia") — väliratkaisu ennen kuin
-- session-lokista (sql/099) on kertynyt oikeaa dataa kalibrointiin.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

insert into asetukset (key, value) values
  ('tehdyn_nakyvyys_maara', '3'),
  ('kesto_priming_min', '15'),
  ('kesto_encoding_min', '45'),
  ('kesto_retrieval_min', '20'),
  ('kesto_reference_min', '5'),
  ('kesto_yllapito_min', '10')
on conflict (key) do nothing;

commit;
