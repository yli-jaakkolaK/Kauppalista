-- Opiskelumoottori OSA A0 (ks. "Sataman opiskelumoottori — rakennusjärjestys",
-- 17.8.2026) — ohjematriisi vaihe x tietotyyppi x kierrosnumero, seedidatana.
-- EI koodia/enumeja tälle sisällölle (sung-metodi.md §8: "Datavetoisuus.
-- Vaiheet, tietotyypit ja ohjematriisi ovat rivejä tauluissa, eivät enumeja
-- koodissa. Uusi kehys on uusi rivijoukko, ei purkutyö.").
--
-- Sisältö on KOPIOITU sung-metodi.md:stä (§6 Ohjematriisi, §3 Reference-
-- toteutus, ja rakennusjärjestys-dokumentin B3 Retrieval-kierrostaulukosta)
-- SANATARKASTI — ei kirjoitettu uudelleen omin sanoin, koska
-- "sisältöpäätöksiä ei muuteta ilman erillistä keskustelua — ne perustuvat
-- lähdemateriaaliin, eivät mielipiteeseen" (rakennusjärjestys-dokumentin
-- oma sääntö). lahde-sarake on KENTTÄ, ei tekstiä ohjeen sisällä (sung-
-- metodi.md §8, eksplisiittinen arkkitehtuuripäätös).
--
-- pacer_tyyppi NULL = koskee kaikkia tyyppejä (priming, reference — ks.
-- sung-metodi.md: priming on "sama kaikille tyypeille", reference on yksi
-- yhteinen periaate joka pätee riippumatta tyypistä).
-- kierros_numero NULL = ei kierrosriippuvainen (kaikki paitsi retrieval).
-- Retrieval: 3 kierrosta per tyyppi (B3-taulukko), kierros >3 toistaa
-- kierroksen 3 ohjeen sovelluspuolella (ei erillistä riviä per kierros —
-- "kierroksia saa palauttaa lisää" jos asia on yhä oppimatta, sung-metodi.md §7).
--
-- v1 tukee vain P(rocedural)/A(nalogous)/C(onceptual) -tyyppejä (sung-
-- metodi.md §2, "Sataman v1:ssä tuetaan vain P, A ja C" — päätös 8.8.2026).
-- Evidence/Reference-TYYPPEJÄ (PACER-tietotyyppejä, ei sekoiteta PERO-
-- vaiheeseen "Reference") ei siis seedata.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists ohjematriisi (
  id bigint generated always as identity primary key,
  pero_vaihe text not null check (pero_vaihe in ('priming', 'encoding', 'reference', 'retrieval', 'overlearning')),
  pacer_tyyppi text check (pacer_tyyppi in ('procedural', 'analogous', 'conceptual')),
  kierros_numero int,
  ohje text not null,
  lahde text not null check (lahde in ('S', 'A')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint ohjematriisi_kierros_vain_retrievalille check (
    kierros_numero is null or pero_vaihe = 'retrieval'
  )
);

alter table ohjematriisi enable row level security;
-- Sama tietopohja kaikille kirjautuneille, ei owner_id — sovelluksen oma
-- ohjesisältö, ei käyttäjädataa (sama luonne kuin design-tokenit).
drop policy if exists "ohjematriisi_select" on ohjematriisi;
create policy "ohjematriisi_select" on ohjematriisi for select using (auth.uid() is not null);

-- Idempotentti seed: tyhjennä ja täytä uudelleen jos migraatio ajetaan
-- uudelleen (sisältö on sovelluksen oma tietopohja, ei käyttäjän kirjoittamaa
-- dataa — turvainvariantti ei koske tätä, sama periaate kuin design-tokenien
-- päivityksellä).
delete from ohjematriisi;

insert into ohjematriisi (pero_vaihe, pacer_tyyppi, kierros_numero, ohje, lahde, sort_order) values

-- === PRIMING — sama kaikille tyypeille (sung-metodi.md §6) ===
('priming', null, null, 'Säädä tuntemustaso ennen kuin selaat mitään.', 'A', 0),
('priming', null, null, 'Selaa materiaalin rakenne läpi lukematta.', 'S', 1),
('priming', null, null, 'Kirjoita 3 kysymystä joihin haluat vastauksen.', 'A', 2),

-- === ENCODING (sung-metodi.md §6) ===
('encoding', 'conceptual', null,
 'BHS:n viisi askelta: kerää termit → kysele suhteita ja tärkeyttä → muodosta ryhmät → priorisoi suhteet → piirrä ei-lineaarisesti symbolein. Tarkista GRINDEllä.',
 'S', 0),
('encoding', 'procedural', null,
 'Käy ensin läpi useita valmiiksi ratkaistuja esimerkkejä ja selitä itsellesi miksi kukin askel tehdään. Kirjoita sitten oma toimiva esimerkki. Piirrä lopuksi haarat kartaksi.',
 'S', 1),
('encoding', 'analogous', null,
 'Kirjoita analogia auki ja etsi kolme kohtaa joissa se pettää.',
 'S', 2),

-- === REFERENCE — yksi yhteinen periaate, ei tyyppikohtainen (sung-metodi.md §3/§6) ===
('reference', null, null,
 'Kokoa encoding-vaiheen tuotoksesta se muoto johon palaat myöhemmin — ei sanatarkkaa kopiointia, jäsennelty ja käsitelty muoto. Ei erillinen muistiinpano vaan tarkennuksia olemassa olevaan käsitekarttaan: yksityiskohdat kiinnittyvät siihen käsitteeseen jota ne tukevat.',
 'S', 0),

-- === RETRIEVAL — kierrosnumeroittain (rakennusjärjestys-dokumentti B3,
-- pohjautuu sung-metodi.md §6:n tyyppikohtaisiin retrieval-kuvauksiin) ===
('retrieval', 'conceptual', 1, 'Tyhjä sivu. Piirrä kartta muistista ilman materiaalia. Korjaa vasta sitten materiaalia vasten eri värillä.', 'S', 0),
('retrieval', 'conceptual', 2, 'Selitä ääneen ilman karttaa.', 'A', 1),
('retrieval', 'conceptual', 3, 'Vertaa kahta käsitettä.', 'A', 2),
('retrieval', 'procedural', 1, 'Ratkaise yksi tehtävä ilman muistiinpanoja ja ilman tekoälyä.', 'A', 3),
('retrieval', 'procedural', 2, 'Erilainen tehtävä samasta asiasta.', 'A', 4),
('retrieval', 'procedural', 3, 'Selitä miksi menetelmä toimii.', 'A', 5),
('retrieval', 'analogous', 1, 'Rakenna analogia uudestaan muistista.', 'A', 6),
('retrieval', 'analogous', 2, 'Missä se hajoaa?', 'A', 7),
('retrieval', 'analogous', 3, 'Rakenna parempi.', 'A', 8),

-- === OVERLEARNING — vapaaehtoinen, ei valmiuskriteeri (sung-metodi.md §6) ===
('overlearning', 'conceptual', null, 'Piirrä ydinrakenne muistista ja laajenna sitä oman ajattelun suuntaan.', 'A', 0),
('overlearning', 'procedural', null, 'Ratkaise tehtävä joka on vaikeampi kuin kurssin vaatimustaso.', 'A', 1);
-- Analogous-overlearning EI määritelty lähteessä ("`[A]` molemmat — Sung
-- antaa määritelmän muttei menettelyä", sung-metodi.md §6) — ei seedattu,
-- sovellus näyttää yleisen "vapaaehtoinen syventävä vaihe" -tekstin jos
-- rivi puuttuu, ei arvata sisältöä.

commit;
