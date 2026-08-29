-- Harjoittele-kortin PACER-vaihe ei ole enää käsin valittavissa napeista
-- (2026-08-29, Katrin pyyntö: "the student never sees or touches it") —
-- luetaan suoraan tästä sarakkeesta. Oletusarvo 'encoding' vastaa aiemman
-- käsivalitsimen oletusta (Laskeminen). Automaattinen eteneminen (montako
-- tehtävää per vaihe ennen seuraavaan siirtymistä) on oma, tässä ei vielä
-- rakennettu palanen.
--
-- Idempotentti (add column if not exists). Ajettu jo suoraan MCP:n kautta
-- 29.8.2026 - tämä tiedosto on historiakirjaus (ks. sql/138:n vastaava malli).

begin;

alter table opinto_aiheet add column if not exists pacer_vaihe_nyt text not null default 'encoding'
  check (pacer_vaihe_nyt in ('priming','encoding','retrieval','connection'));

commit;
