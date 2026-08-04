-- Ristiriitapaketti v2, osa 2 (2026-08-06, ks. muistiinpanot.md
-- "Ristiriitapaketti v2"): kattaa_lapset-kenttä kalenteritapahtumaan +
-- kolme uutta säädettävää kynnysarvoa.
--
-- kattaa_lapset: jsonb-taulukko lapset.id-arvoista (esim. [1,2]). Tyhjä/null
-- = ei kata ketään. Kolme käyttötapausta samalla kentällä (Katrin oma
-- rajaus "yksi kenttä, kolme käyttötapausta, ei erillisiä mekanismeja"):
-- oma meno jossa lapsi mukana, toisen hoitajan hakeva tapahtuma, tai lapsi
-- pärjää yksin ilman että kukaan vie häntä minnekään.
--
-- siirtymapuskuri_min: lisätään tapahtuman molempiin päihin ENNEN
--   päällekkäisyyslaskentaa (onkoAjallisestiPaallekkainen).
-- min_paallekkainen_min: tätä lyhyempi päällekkäisyys ei laukaise mitään
--   ristiriitatasoa ollenkaan.
-- yksin_hetkittain_raja_min: ks. ika_yksin_hetkittain-lasten softaus
--   (lapset.ika_yksin_hetkittain) — tätä lyhyempi hoivatarve-ikkuna ei
--   laukaise ristiriitaa vaikka lapsi muuten tarvitsisi valvontaa.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table kalenteri_tapahtumat add column if not exists kattaa_lapset jsonb;

insert into asetukset (key, value) values
  ('siirtymapuskuri_min', '30'),
  ('min_paallekkainen_min', '15'),
  ('yksin_hetkittain_raja_min', '90')
on conflict (key) do nothing;

commit;
