-- Kurssitason "yhdistämis"-Miro-alueet (2026-08-29, Katrin pyyntö) — nämä
-- EIVÄT sido yhteenkään yksittäiseen aiheeseen, koska ne nimenomaan
-- yhdistelevät useaa aihetta (esim. Katrin oma kuvaus: "exam A materials
-- and all of the topics 1-5 mixed to form connections"). Kysyttiin
-- suoraan Katrilta mihin tämä pitäisi tallentaa (AskUserQuestion) —
-- vastaus: kurssitason kenttä, ei per-aihe.
--
-- miro_exam_a_url: Exam A -alue (kattaa topics 1-5).
-- miro_exam_b_url: Exam B -alue (kattaa topics 6-10) — varattu, ei vielä
--   arvoa kun tämä migraatio ajettiin.
--
-- UI: kurssinäkymän kaksi nappia (🔗/➕🔗 Exam A/B: yhteydet, ks.
-- script.js:n piirraOpintoKurssinYhteysLinkit) — jos linkki on asetettu,
-- napautus avaa sen suoraan uuteen välilehteen; muuten kysyy sen promptilla.
--
-- Idempotentti (add column if not exists). Ajettu jo suoraan MCP:n kautta
-- 29.8.2026 - tämä tiedosto on historiakirjaus (ks. sql/138:n vastaava malli).

begin;

alter table opinto_kurssit add column if not exists miro_exam_a_url text;
alter table opinto_kurssit add column if not exists miro_exam_b_url text;

commit;
