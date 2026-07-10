-- Päällekkäisyysmerkki (ristiriitalippu): kaksi kellonaikaan sidottua
-- tapahtumaa menevät päällekkäin samana päivänä. Kolmiportainen merkkikieli
-- (ks. muistiinpanot.md "Kalenterin merkkikieli"): PUNAINEN on varattu
-- YKSINOMAAN tälle merkille, koska se on ainoa aidosti MAHDOTON tilanne
-- (ei voi olla kahdessa paikassa yhtä aikaa) — ei koskaan kuormalle.
--
-- Vakavuusluokittelu vaatii tietävänsä KENEN kalenterista tapahtuma tuli:
--   henkilo = NULL   -> jaettu perhekalenteri (esim. "Perhekalenteri")
--   henkilo = 'katri'/'juha' -> henkilön OMA henkilökohtainen kalenteri
-- Ilman tätä saraketta koodi joutuisi vertailemaan kalenterin NIMEÄ
-- ("Perhekalenteri" merkkijonona) mikä olisi hauras ja kovakoodattu.
--
-- Olemassa olevat 3 syöterivia (sql/019) päivitetään samalla: "Perhekalenteri"
-- jää NULLiksi (perhe), "Katri"/"Juha" saavat oman henkilo-arvonsa.
--
-- Rauhoitettu ikkuna (kouluvuoden arkipäivinä klo 9-15 kalentereiden VÄLISET
-- päällekkäisyydet eivät sytytä punaista, koska perhe on luonnostaan hajallaan)
-- on KOKONAAN dataa yleisessä asetukset-taulussa (sql/023) — ei mitään
-- kovakoodattua, käyttäjä säätää Table Editorista. Kentät (myös loma-ajat)
-- lisätään valmiiksi vaikka loma-ajat-lista alkaa tyhjänä; täytetään
-- vuosittain käsin toistaiseksi (ks. muistiinpanot.md "Ristiriitamerkki" ja
-- "Loma-aikojen täyttö" -osiot automaation myöhemmistä vaiheista).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table kalenteri_syotteet add column if not exists henkilo text
  check (henkilo in ('katri', 'juha'));

update kalenteri_syotteet set henkilo = 'katri' where tunniste = 'Katri' and account_key = 'katri';
update kalenteri_syotteet set henkilo = 'juha' where tunniste = 'Juha' and account_key = 'katri';
-- "Perhekalenteri" jää henkilo = NULL (jaettu, ei kenenkään henkilökohtainen).

insert into asetukset (key, value) values
  ('ristiriita_kausi_alkaa', '08-01'),   -- MM-DD, kouluvuoden alku
  ('ristiriita_kausi_loppuu', '05-31'),  -- MM-DD, kouluvuoden loppu (kausi kiertää vuodenvaihteen yli)
  ('ristiriita_viikonpaivat', '1,2,3,4,5'), -- ISO-viikonpäivät (1=maanantai...7=sunnuntai), oletus ma-pe
  ('ristiriita_klo_alkaa', '09:00'),
  ('ristiriita_klo_loppuu', '15:00'),
  ('ristiriita_loma_valit', '[]')        -- JSON-lista {"alku":"VVVV-KK-PP","loppu":"VVVV-KK-PP"} -pareja, täytetään käsin vuosittain
on conflict (key) do nothing;

commit;
