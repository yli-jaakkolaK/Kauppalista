-- SATAMA_SPEKSI.md §16.5c kohta 4: "piilota_laiturista asetetaan HETI kun
-- kohde tunnetaan (sama malli kuin teema/lista/vahdittu/hytti jo tekevät) —
-- kurssimateriaali ei tällä hetkellä tee näin, korjataan yhtenäiseksi."
--
-- Seuraus: kurssimateriaali katoaa Laiturista HETI kun se tuodaan "+ Lisää
-- materiaalia" -kautta, EI vasta kun äly on jäsentänyt sen ja Katri
-- hyväksynyt jaon. Kurssisivun oma odottaa/käsitelty-tila (KONSEPTIKIRJA.md
-- 4.12 -sukuinen, rakennettu 2026-08-16 samassa istunnossa) EI siis enää voi
-- lainata piilota_laiturista:aa tilanmerkkinä — se olisi aina "käsitelty"
-- heti insertistä lähtien, väärä lukema. Oma erillinen kenttä tälle.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

alter table laituri add column if not exists materiaali_kasitelty boolean not null default false;

commit;
