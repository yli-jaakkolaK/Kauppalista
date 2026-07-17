-- BUGIKORJAUS (2026-07-17, Bugi 27 — "Hetki-muru nousee joka aamu",
-- kolmas ilmentymä): sql/042 jätti aly_evaluated-taulun tarkoituksella
-- ilman RLS-policyja ("EI KOSKAAN luettu/kirjoitettu asiakaspuolelta") —
-- vain yöajon (api/aly-nightly.js, service_role) piti koskaan kirjoittaa
-- sinne. Tämä jätti aukon: kun käyttäjä HYLKÄSI (× ehdokaskortilla TAI
-- "Kumoa" Asetusten Äly-lokista) koneen ehdottaman ankkurin, koodi poisti
-- pelkän ankkuririvin eikä koskaan merkinnyt lähdemurua käsitellyksi —
-- vain yöajon OMA hiljainen raukeaminen teki niin (sql/044:n Bugi 22
-- -korjaus). Koska "huomenna"-tyyppinen hetki on jäädytetty absoluuttiseksi
-- päiväksi kirjoitushetkellä, se saattoi olla sama kalenteripäivä vielä
-- hylkäyshetkellä ("ei vielä mennyt ohi" -tarkistus vertaa päivä-tason
-- tarkkuudella) — muru pääsi siis TAKAISIN arvioitavaksi seuraavana yönä
-- ja saattoi nousta uudelleen, joskus useana peräkkäisenä aamuna ennen
-- kuin päivä lopulta ehti mennä ohi ja pysäyttää sen.
--
-- KORJAUS (script.js): käyttäjän oma hylkäys ON vastaus siinä missä
-- yöajon hiljainen raukeaminenkin — molemmat merkitsevät murun nyt
-- KÄSITELLYKSI HETI, ei vasta yöajon kautta. Tämä vaatii asiakaspuolelle
-- tarkkaan rajatun kirjoitusoikeuden: VAIN oman laituri-rivinsä
-- aly_evaluated-merkintään, ei mitään muuta (ei lukuoikeutta, ei toisen
-- käyttäjän riviin koskemista) — sama "tiukasti rajattu poikkeus"
-- -periaate kuin ankkurit_insert_ehdotus-policyssa (sql/056).
--
-- Idempotentti (drop+create policy).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

drop policy if exists "aly_evaluated_insert_own" on aly_evaluated;
create policy "aly_evaluated_insert_own" on aly_evaluated for insert
  with check (
    exists (select 1 from laituri where laituri.id = aly_evaluated.laituri_id and laituri.user_id = auth.uid())
  );

drop policy if exists "aly_evaluated_update_own" on aly_evaluated;
create policy "aly_evaluated_update_own" on aly_evaluated for update
  using (
    exists (select 1 from laituri where laituri.id = aly_evaluated.laituri_id and laituri.user_id = auth.uid())
  )
  with check (
    exists (select 1 from laituri where laituri.id = aly_evaluated.laituri_id and laituri.user_id = auth.uid())
  );

-- Ei select-policya tarkoituksella — asiakas ei koskaan LUE tätä taulua,
-- vain kirjoittaa oman hylkäyksensä (upsert laituri_id:n mukaan).

commit;
