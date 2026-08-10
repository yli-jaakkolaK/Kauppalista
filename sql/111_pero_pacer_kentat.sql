-- PERO/PACER-akselien erottelu opinto_aiheet-taululla (2026-08-10, ks.
-- HYTTI_SPEKSI.md §7.4 ja CODE_vaihe1_vastaukset.md kysymys 1) — auditissa
-- löytyi että nykyinen `vaihe`-sarake (priming/encoding/retrieval/reference/
-- yllapito) sekoitti kaksi eri akselia: koodikommentit kutsuivat sitä
-- "PACER-vaihetilaksi" vaikka arvot ovat oikeasti PERO (vaiheistus).
--
-- pero_vaihe: priming/encoding/reference/retrieval/overlearning — PUHDAS
-- vaiheistus, ei enää "yllapito"-arvoa. sung-metodi.md §3 (9.8. päätös):
-- "yllapito" ei ollut oma vaihe vaan välistetty kertaus (SIR) joka kuuluu
-- retrievalin sisään. overlearning on UUSI, vapaaehtoinen, retrievalin
-- jälkeinen syvennysvaihe — EI yllapidon seuraaja, ei mitään migroidu
-- sinne automaattisesti.
--
-- kertausjonossa: ERILLINEN tila johon sr_next_review/sr_interval_index
-- kiinnittyvät sen jälkeen kun kiinteä kertaustaulukko (OPINTO_SR_VALIT_PV,
-- script.js) on käyty läpi — vastaa täsmälleen entistä "vaihe='yllapito'"
-- -hetkeä, mutta lippuna eikä vaihearvona, koska nämä ovat kaksi
-- riippumatonta asiaa (sung-metodi.md §3: "solmu voi olla valmis ja silti
-- olla kertausjonossa").
--
-- pacer_paatyyppi + pacer_sivutyyppi: KAKSI kenttää, ei yksi (sung-metodi.md
-- §2, 9.8. päätös) — solmulla on päätyyppi ja valinnainen sivutyyppi alusta
-- asti, vaikka V1 käyttää vain päätyyppiä. Jälkikäteen lisääminen olisi
-- turha migraatio. Sallitut arvot kaikki viisi PACER-tyyppiä (procedural/
-- analogous/conceptual/evidence/reference) vaikka V1:n UI tarjoaa
-- käyttäjälle vain kolme ensimmäistä — evidence/reference varataan.
--
-- Vanha `vaihe`-sarake POISTETAAN opinto_aiheet-taulusta tämän migraation
-- lopuksi ("kaikella on yksi koti" — ei kahta rinnakkaista esitystä samasta
-- tilasta). HUOM: taitosolmut.vaihe JA opinto_sessiot.vaihe EIVÄT muutu
-- tässä — sillat pysyvät vanhalla mallilla (yllapito mukaan lukien) kunnes
-- ne käsitellään Vaihe 5:ssä (HYTTI_SPEKSI.md §13), ei kosketa nyt.
-- opinto_sessiot.vaihe-sarakkeen check-rajoitetta LAAJENNETAAN sallimaan
-- 'overlearning' LISÄKSI (ei korvaten 'yllapito':a, koska taitosolmut
-- kirjoittaa yhä sen arvon samaan jaettuun sarakkeeseen istunnon alkaessa).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table opinto_aiheet add column if not exists pero_vaihe text;
alter table opinto_aiheet add column if not exists kertausjonossa boolean not null default false;
alter table opinto_aiheet add column if not exists pacer_paatyyppi text;
alter table opinto_aiheet add column if not exists pacer_sivutyyppi text;

-- Backfill vanhasta vaihe-sarakkeesta: yllapito -> retrieval + kertausjonossa,
-- kaikki muut arvot kopioituvat sellaisenaan (sama sanasto priming/encoding/
-- retrieval/reference kummallakin puolella).
update opinto_aiheet set pero_vaihe = 'retrieval', kertausjonossa = true where vaihe = 'yllapito';
update opinto_aiheet set pero_vaihe = vaihe where vaihe is not null and vaihe <> 'yllapito';
update opinto_aiheet set pero_vaihe = 'priming' where pero_vaihe is null;

alter table opinto_aiheet alter column pero_vaihe set not null;
alter table opinto_aiheet alter column pero_vaihe set default 'priming';
alter table opinto_aiheet add constraint opinto_aiheet_pero_vaihe_check
  check (pero_vaihe in ('priming', 'encoding', 'reference', 'retrieval', 'overlearning'));
alter table opinto_aiheet add constraint opinto_aiheet_pacer_paatyyppi_check
  check (pacer_paatyyppi is null or pacer_paatyyppi in ('procedural', 'analogous', 'conceptual', 'evidence', 'reference'));
alter table opinto_aiheet add constraint opinto_aiheet_pacer_sivutyyppi_check
  check (pacer_sivutyyppi is null or pacer_sivutyyppi in ('procedural', 'analogous', 'conceptual', 'evidence', 'reference'));

-- Vanha vaihe-sarake poistuu opinto_aiheet:lta - koodi ei enää lue/kirjoita
-- sitä tälle taululle (ks. script.js-muutokset samassa erässä). taitosolmut.vaihe
-- ja opinto_sessiot.vaihe EIVÄT ole tämä sarake, eivät poistu.
alter table opinto_aiheet drop column vaihe;

-- opinto_sessiot.vaihe kirjaa istunnon alkaessa JOKO opinto_aiheet.pero_vaihe:n
-- TAI taitosolmut.vaihe:n arvon (script.js: aloitaOpintoSessio) - sarake on
-- jaettu molemmille, joten sen pitää sallia molempien sanastojen liitto.
alter table opinto_sessiot drop constraint if exists opinto_sessiot_vaihe_check;
alter table opinto_sessiot add constraint opinto_sessiot_vaihe_check
  check (vaihe in ('priming', 'encoding', 'retrieval', 'reference', 'yllapito', 'overlearning'));

commit;
