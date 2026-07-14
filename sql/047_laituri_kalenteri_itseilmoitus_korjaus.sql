-- BUGIKORJAUS (2026-07-17, ks. muistiinpanot.md "Kalenteri-sijoitus ei
-- kirjoita mitään"): Laiturin äly-avustaja tarjosi aiemmin "kalenteriin
-- (päivämäärällinen asia)" -kohteena, jonka hyväksyminen ("Sopii") vain
-- MERKITSI murun sijoitetuksi (`status='sijoitettu', placed_where='kalenteriin...'`)
-- kirjoittamatta mitään minnekään — Satamalla ei ole eikä ole koskaan ollut
-- kalenterikirjoituspolkua (ei omaan kalenterinäkymään, ei tietenkään
-- iCloudiin, ks. "Kalenterisyötteet"-osio: synkka on VAIN luku-suuntainen).
--
-- DIAGNOOSI: koska kirjoituspolkua ei koskaan ollut, EI OLE MITÄÄN toista
-- taulua/riviä tarkistettavaksi — tämä ITSE ON diagnoosin tulos. Rivi jonka
-- `placed_where` viittaa kalenteriin on aina väärä merkintä, ei koskaan
-- oikea, riippumatta sisällöstä.
--
-- KORJAUS: palautetaan KAIKKI tällä (nyt poistetulla) kohteella sijoitetuksi
-- merkityt Laiturin rivit sijoittamattomiksi — ei vain Katrin yhtä
-- testimurua ("huomenna ti testi"), koska sama virhe koskee jokaista riviä
-- joka on koskaan hyväksynyt tämän kohteen. Rivi itse (`content`) EI KOSKAAN
-- kosketa — sama turvainvariantti kuin E3:ssa.
--
-- Aja tämä Supabasen SQL Editorissa. Idempotentti (WHERE-ehto ei enää
-- täsmää toisella ajokerralla, koska status on jo palautunut).

do $$
declare
  r record;
  v_maara integer := 0;
begin
  for r in
    select id, content, placed_where
    from laituri
    where status = 'sijoitettu' and placed_where ilike '%kalenter%'
  loop
    raise notice 'Palautetaan sijoittamattomaksi: id=%, sisältö="%", oli merkitty="%"', r.id, r.content, r.placed_where;
    v_maara := v_maara + 1;
  end loop;

  update laituri
  set status = 'uusi', placed_where = null
  where status = 'sijoitettu' and placed_where ilike '%kalenter%';

  raise notice 'Palautettu % riviä sijoittamattomaksi.', v_maara;
end $$;
