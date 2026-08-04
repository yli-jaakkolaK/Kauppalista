-- Korjaa tehdyn_nakyvyys_maara-asetuksen oletusarvon 0:ksi (2026-08-06,
-- Katrin oikean käytön korjaus: "jos teen yhden asian ja merkkaan sen,
-- saa antaa heti seuraavan siihen tilalle" — ei jäädä odottamaan kolmea
-- uutta askelta ennen häivytystä, ks. muistiinpanot.md). sql/103 loi
-- tämän jo arvolla '3' — tämä päivittää OLEMASSA OLEVAN rivin, koska
-- sql/103:n oma "on conflict do nothing" ei enää koskisi jo asetettuun
-- riviin vaikka sen tiedoston oma oletusarvo muutettiin samassa erässä.
--
-- Ei vaikuta jos olet jo itse säätänyt tämän Asetukset-näkymästä toiseen
-- arvoon (WHERE-ehto koskee vain vielä oletusarvossa '3' olevaa riviä).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

update asetukset set value = '0' where key = 'tehdyn_nakyvyys_maara' and value = '3';

commit;
