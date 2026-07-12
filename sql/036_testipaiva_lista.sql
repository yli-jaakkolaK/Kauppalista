-- Testipäivä to 16.7. -tarkistuslista Muistilappuihin (jaettu, Katri+Juha
-- yhdessä torstaina). Idempotentti: poistaa ensin mahdollisen aiemman
-- samannimisen listan rivit+listan ja luo puhtaan uudelleen — turvallista
-- ajaa uudelleen jos sanamuotoja pitää joskus korjata.
--
-- KORJATTU oikeaa skeemaa vasten Katrin SQL Editor -luonnoksesta:
-- - taulu on `tuotteet`, EI `list_items` (list_items ei ole olemassa
--   tässä projektissa — rivit elävät aina tuotteet-taulussa, ks.
--   sql/001_multilist_and_events.sql)
-- - "tehty täpätty" -sarake on `tehty`, EI `done`
-- - `lists.type` on AINA 'checklist' (kiinteä arvo koko sovelluksessa) —
--   Muistilaput/Varasto-ero tulee ERI sarakkeesta, `category`
--   ('muistilaput'/'varasto', ks. sql/010_varasto.sql), ei type:sta
-- - lisätty owner_id + visibility='shared', sama malli kuin muillakin
--   jaetuilla esimerkkilistoilla (sql/010) — ilman visibility='shared'
--   lista olisi oletuksena yksityinen eikä Juha näkisi sitä torstaina
--
-- Aja tämä Supabasen SQL Editorissa.

do $$
declare
  v_list_id uuid;
  v_sort double precision := 0;
  r text;
  rivit text[] := array[
    '# OSA 0 · Aloitus',
    'Versiot samat molemmilla, väh. 49 (Asetukset)',
    'Vinkit näkyvät + 10. vinkki oletuskalenterista',
    '# OSA A · Katri soolo: muistutukset',
    'Rivin kello: 5 min, appi kiinni, push saapuu',
    'Kaksi muistutusta samalle riville, molemmat tulevat',
    'Poisto ×:stä ennen aikaa: push EI tule',
    'Kalenteritapahtuman pikanappi 1 h ennen: näkyy asetettuna',
    'Ankkurin kello toimii',
    '# OSA A · Katri soolo: hytti',
    'Oma Hytti aukeaa, tyhjätilaohje näkyy',
    'Lukkarikoneen 201 näkyvät hytissä, EIVÄT jonossa',
    'Projektikurssi-kortti: rivit + 2 tehtävää, kooste näyttää päivinä',
    'Ankkurinosto ja kello hytin rivistä toimivat',
    '# OSA A · Katri soolo: äly + uudet',
    'Laiturin tähti: ehdotus ilmestyy, osuiko?',
    'Sopii avaa dialogin esitäytettynä, Ei sulkee siististi',
    'Mikään ei siirtynyt ilman omaa OK:ta',
    'Luo kopio: täpät nollattuina, alkuperäinen koskematon',
    'Monivalinta + Kauppalistalle kopioi valitut',
    '# OSA B · Juhan kanssa: push + peilikuva',
    'Juha: Salli ilmoitukset, testinappi toimii',
    'Push saapuu Juhan SULJETTUUN puhelimeen',
    'Katrin iCal-lisäys näkyy Juhalla uusi-tagilla',
    'Juhan Kuittaa kaikki siivoaa',
    'Katrin muokkaus päivittyy ja poisto katoaa Juhalla',
    'Juhan muistutus tulee vain Juhalle',
    '# OSA C · Yksityisyys (tärkeimmät!)',
    'Juha EI näe Katrin Lukkarikonetta missään',
    'Juhan hytti aukeaa tyhjänä, kortit eivät näy ristiin',
    'Juhan Oma-kalenterin meno EI näy Katrille',
    'Ankkurit henkilökohtaiset molemmilla',
    '# OSA D · Pallurat',
    'Juhan lisäys sytyttää Katrin Kalenteri-laatan palluran',
    'Kuittaus sammuttaa palluran',
    'Laituri-pallura toiselle, ei itselle',
    'PWA-kuvakkeen numero seuraa summaa',
    '# OSA E · Pikaregressiot',
    'Siri-lisäys näkyy molemmilla',
    'Jaetun listan muutos päivittyy realtimena',
    '# OSA F · Kuormavahti-uusinta',
    'Pilleri näkyy agendassa, viikossa JA kuukaudessa',
    'Luettavissa ulkona auringossa käsivarren mitalta',
    'Menoraja 5-3 lisää merkkejä, palauta 5',
    '# Lopuksi',
    'VIAT Laiturista Claudelle, korjauslista Codelle',
    'Jos A+B+C läpi: ristiriitapaketti Codelle!',
    'Kahvi + ääneen: me rakennettiin tämä itse'
  ];
begin
  -- Poista mahdollinen vanha versio (idempotenssi) — SAMASSA järjestyksessä
  -- kuin script.js:n poistaLista(): tuotteet JA events ennen listaa itseään,
  -- muuten `lists`-rivin poisto kaatuisi FK-rajoitteeseen jos listaa on
  -- ehditty käyttää appista (esim. täppäys kirjoittaa events-rivin).
  delete from tuotteet where list_id in (select id from lists where name = 'Testipäivä to 16.7.');
  delete from events where list_id in (select id from lists where name = 'Testipäivä to 16.7.');
  delete from lists where name = 'Testipäivä to 16.7.';

  -- Luo lista: jaettu (Juhakin näkee/käyttää torstaina), Muistilaput-kategoriassa
  insert into lists (name, type, owner_id, visibility, category)
  values ('Testipäivä to 16.7.', 'checklist', 'd646881e-0ab8-4351-aae1-3e92678c8432', 'shared', 'muistilaput')
  returning id into v_list_id;

  foreach r in array rivit loop
    v_sort := v_sort + 10;
    insert into tuotteet (list_id, nimi, sort_order, tehty, is_header)
    values (v_list_id, ltrim(r, '# '), v_sort, false, r like '#%');
  end loop;
end $$;
