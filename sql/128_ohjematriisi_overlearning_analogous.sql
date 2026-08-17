-- Taydentaa ohjematriisin puuttuvan overlearning/analogous-rivin.
-- sql/122:n kommentti totesi etta Sung ei maarittele taman yhdistelman
-- menettelya, vain etta se on olemassa ("[A] molemmat") -- rivi jatettiin
-- tarkoituksella seedaamatta silloin, ei arvattu sisaltoa.
--
-- Katri paatteli sisallon 17.8.2026 suoraan Sungin omista periaatteista
-- (ei suora lainaus, lahde='A' kuten reference-rivikin sql/125:ssa):
--
--   1. Overlearning = meno hieman aiheen ulkopuolelle / korkeammalle
--      vaatimustasolle kuin pakko (Sungin oma maaritelma overlearningille).
--   2. Analogisen aineksen prosessi ON kritiikki, ei muistaminen (sung-
--      metodi.md: analogous-tyypin tyoskentely on vertailua, ei toistoa)
--      -- joten "enemman kuin tarpeeksi" ei voi tarkoittaa toistoa taalla,
--      toisin kuin conceptual/procedural-tyypeissa.
--   3. Ainoa jaljelle jaava suunta on analogian laadun kolme ulottuvuutta
--      -- kattavuus, yksinkertaisuus, tarkkuus -- jotka sung-metodi.md §7
--      saannossa 10 nimeaa erikseen vaikeaksi tasapainottaa. Rajakohtien
--      tunteminen tasmallisesti ON se sujuvuus jota overlearningin pitaa
--      tuottaa.
--
-- Aja tama Supabasen SQL Editorissa.

begin;

insert into ohjematriisi (pero_vaihe, pacer_tyyppi, kierros_numero, ohje, lahde, sort_order) values
('overlearning', 'analogous', null,
 'Ota analogia jonka jo tiedät toimivan, ja työnnä sitä pidemmälle: laajenna se kattamaan useampia aiheen käsitteitä menettämättä yksinkertaisuutta tai tarkkuutta, ja jatka kunnes osaat sanoa täsmälleen missä kohtaa se hajoaa ja miksi. Sitten rakenna sille kilpailija toisesta lähdemaailmasta ja katso kumpi kestää paremmin.',
 'A', 2);

commit;
