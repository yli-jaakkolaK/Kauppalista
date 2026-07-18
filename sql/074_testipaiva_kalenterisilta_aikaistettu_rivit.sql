-- Lisää testipäivän tarkistuslistalle ("Testipäivä to 16.7.", ks. sql/036)
-- uudet rivit "Kalenterisilta aikaistettu" -korjauksen jäljiltä (2026-07-20,
-- Katrin speksitarkennus, ks. muistiinpanot.md) — talon pysyvän
-- testirivikäytännön mukaisesti (ks. COPILOT.md "Uusi testattava
-- toiminnallisuus").
--
-- HUOM prompti-testaukseen: sama rajoitus kuin sql/071:ssä — ei laukea
-- käsin kirjoitetusta murusta sovelluksen UI:ssa, riippuu yöajosta TAI
-- Siri-murun heti-luokittelusta. Testaajan pitää itse kirjata muru ja
-- tarkistaa tulos joko heti (Siri-reitti) tai seuraavana päivänä (yöajo).
--
-- EI toista koko listaa uudelleen (kuten sql/036 tekee) — jo täpätyt rivit
-- eivät saa nollautua. Idempotentti: lisää rivit vain jos niitä ei vielä
-- ole, lisätään listan loppuun.
--
-- Aja tämä Supabasen SQL Editorissa sql/073:n jälkeen (073 luo
-- ai_hetki_ehdotus-sarakkeen jota nämä testit koskevat).

do $$
declare
  v_list_id uuid;
  v_max_sort double precision;
  v_ensimmainen_rivi_nimi text := 'Sanele Shortcutilla "laita [oma nimesi tarpeeton, kirjoita vain] kampaaja huomenna klo 13" — n. minuutin sisällä Laiturin murulla pitäisi näkyä "🕐 <pvm> klo 13:00" + [➕ Lisää kalenteriin] -nappi HETI, EI vasta seuraavana päivänä';
begin
  select id into v_list_id from lists where name = 'Testipäivä to 16.7.';
  if v_list_id is null then
    raise exception 'Listaa "Testipäivä to 16.7." ei löytynyt — aja sql/036 ensin.';
  end if;

  if exists (select 1 from tuotteet where list_id = v_list_id and nimi = v_ensimmainen_rivi_nimi) then
    return;
  end if;

  select coalesce(max(sort_order), 0) into v_max_sort from tuotteet where list_id = v_list_id;

  insert into tuotteet (list_id, nimi, sort_order, tehty, is_header) values
    (v_list_id, 'OSA Y · Kalenterisilta aikaistettu (2026-07-20)', v_max_sort + 10, false, true),
    (v_list_id, v_ensimmainen_rivi_nimi, v_max_sort + 20, false, false),
    (v_list_id, 'Napauta [➕ Lisää kalenteriin] murun kyljestä — aukeaako Applen esitäytetty "uusi tapahtuma" -näkymä oikealla otsikolla/päivällä/ajalla (sama tarkistus kuin Kalenterisillan alkuperäisellä testillä)', v_max_sort + 30, false, false),
    (v_list_id, 'Kirjoita Laituriin käsin "soita neuvolaan ma" (ilman kellonaikaa) — seuraavana päivänä pitäisi näkyä "🕐 <pvm>" -merkintä ILMAN ➕-nappia (ei kellonaikaa, ei .ics-tapahtumaa)', v_max_sort + 40, false, false),
    (v_list_id, 'Tarkista että sama muru saa AIEMMIN nähdyn hetki-ehdokkaan (⚓/muistutus) Ankkureihin normaalisti kohdepäivänä — aikaistettu silta on LISÄYS, ei korvaa vanhaa muistutusta', v_max_sort + 50, false, false);
end $$;
