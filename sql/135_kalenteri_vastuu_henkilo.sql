-- "Kuka hoitaa tämän" -yliajo yksittäiselle kalenteritapahtumalle (Katrin
-- pyyntö 18.8.2026: "is there a way to mark in satama who is going where" —
-- esimerkki: "Aamos kylässä" ja "Suunnistus Pääskyvuori" menevät päällekkäin
-- perhekalenterissa (henkilo=null, molemmilla), mutta Katri on kotona toisen
-- lapsen kanssa ja Juha viemässä toista suunnistukseen — ei todellinen
-- ristiriita, vain kaksi eri ihmistä hoitamassa eri asiaa samaan aikaan.
--
-- Oma sarake suoraan kalenteri_tapahtumat-tauluun (EI erillinen sivutaulu,
-- vrt. kalenteri_kuittaukset) — turvallista koska CalDAV-synkka
-- (api/_lib/caldav-sync.js, on_conflict=ical_uid + resolution=merge-
-- duplicates) päivittää vain PAYLOADISSA mukana olevat sarakkeet, ei
-- koskaan koko riviä — tämä sarake ei ole synkan payloadissa, säilyy siis
-- synkkauksen yli.
--
-- Arvo on henkilo-tunniste ('katri'/'juha', sama kirjainmuoto kuin
-- kalenteri_syotteet.henkilo) tai NULL (ei yliajoa, syötteen oma henkilo
-- pätee kuten ennenkin). Käytetään script.js:ssä paallekkaisyysVakavuus():ssä
-- (eri vastuuhenkilö molemmilla puolilla -> ei ristiriitaa) ja
-- "oma kuorma" -suodattimissa (opintoPaivanKuorma, piirraNytLoki,
-- naytaHuomisenEsikatselu).

begin;

alter table kalenteri_tapahtumat add column if not exists vastuu_henkilo text;

commit;
