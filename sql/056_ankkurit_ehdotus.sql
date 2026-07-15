-- Ankkurin ehdottaminen toiselle (2026-07-16, kirjattu speksiksi ja
-- toteutettu Katrin pyynnöstä samana päivänä — ks. muistiinpanot.md
-- "Ankkurin ehdottaminen toiselle"). Tosielämän tarve Juhalta: "voitko
-- laittaa mun ankkureihin että X" — delegointi perheen sisällä.
--
-- Malli: sama ehdokasmekanismi kuin E3:n ✨-ehdotuksilla (ankkurit.is_candidate,
-- ks. sql/041), mutta lähde on toinen IHMINEN, ei äly. Kaksi uutta saraketta:
-- proposed_by (kuka ehdotti) ja visible_from ("siirrä myöhemmäksi" -reaktion
-- uusi nousupäivä, null = näkyy heti).
--
-- Turvasäännöt (ks. muistiinpanot.md täydelle perustelulle):
--  - kukaan ei kirjoita suoraan toisen "oikeaan" ankkuriin, vain CANDIDATE-
--    rivinä joka jää kokonaan vastaanottajan hallintaan
--  - ehdottaja ei saa mitään erillistä luku/kirjoitusoikeutta lähetetyn
--    ehdotuksen tilaan jälkikäteen — hylkäys ei koskaan raportoidu hänelle
--  - kohde rajataan hytti_omistajat-karttaan tunnettuihin perheenjäseniin,
--    ei mielivaltaiseen UUID:hen
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table ankkurit add column if not exists proposed_by uuid references auth.users(id);
alter table ankkurit add column if not exists visible_from timestamptz;

create policy "ankkurit_insert_ehdotus" on ankkurit for insert with check (
  is_candidate = true
  and source = 'ehdotus'
  and proposed_by = auth.uid()
  and user_id != auth.uid()
  and exists (select 1 from hytti_omistajat o where o.user_id = ankkurit.user_id)
);

commit;
