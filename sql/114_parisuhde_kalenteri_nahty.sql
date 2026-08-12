-- Parisuhdeaika: kalenterisillan "nähty"-seuranta (2026-08-11, Katrin
-- löytämä bugi) — kun molemmat hyväksyvät, api/parisuhdeaika-hyvaksy.js
-- palautti kalenterilinkin AINOASTAAN sille käyttäjälle jonka hyväksyntä
-- sattui olemaan JÄLKIMMÄINEN (ks. mutual-tarkistus). Se joka hyväksyi
-- ENSIN ei koskaan nähnyt "vie kalenteriin" -korttia, koska rivi suljettiin
-- (is_candidate=false, done=true) heti eikä sitä enää haettu ehdokaslistaan.
--
-- parisuhde_kalenteri_nahty: TÄMÄN käyttäjän oman rivin oma lippu — onko
-- hän jo nähnyt/kuitannut kalenterisilta-kortin. false oletuksena kaikille
-- (myös vanhoille riveille — turvallinen, korkeintaan joku vanha jo-hoidettu
-- ehdotus näyttää kortin kerran uudelleen, ei tietoturva-/datariski).
-- api/parisuhdeaika-hyvaksy.js merkitsee HYVÄKSYJÄN oman rivin heti nähdyksi
-- (hän näkee kortin saman tien), kumppanin rivi jää false:ksi kunnes
-- script.js:n naytaOdottavatParisuhdeaikaKalenterit() näyttää sen hänelle
-- seuraavalla etusivun latauksella ja merkitsee sen silloin nähdyksi
-- (käyttäjän oma rivi, RLS sallii suoraan selaimesta).
--
-- Puhtaasti lisäävä, ei backfill-tarvetta (oletusarvo kattaa kaikki rivit).
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table ankkurit add column if not exists parisuhde_kalenteri_nahty boolean not null default false;

commit;
