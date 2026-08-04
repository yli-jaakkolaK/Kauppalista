-- Taitosolmujen data-tuonti: koodauskurssi (Python Programming MOOC 2026) +
-- matikkarata (Khan Academy) (2026-08-04, ks. hytti_matikka_taidot.md ja
-- hytti_koodauskurssi_taidot.md, käyttäjän toimittamat lähdetiedostot).
--
-- TIETOISET RAJAUKSET tuonnissa (kirjattu ettei niitä tarvitse arvata
-- myöhemmin):
--  - EI 'opettaa'-kaaria — kurssin osa on `lahde`-tekstikenttä solmulla,
--    ei oma entiteetti (ks. sql/092 yläkommentti).
--  - 'tarvitsee'-kaaria tuodaan VAIN eksplisiittisesti mainittu tapaus:
--    koodausprojekti (osa 14) tarvitsee kaikki osien 1-13 KÄSITTEELLISET
--    taidot (ei työkalu-/harjoitussolmuja 4.1 ja 10.4, koodauskurssi-
--    tiedoston oma huomio). Koska AND-portti on tiukka, muita tarvitsee-
--    kaaria EI arvattu — lisää käsin jos oikea käyttö osoittaa tarpeen.
--  - Elokuun kuusi matikka-aihetta ovat TIETOISESTI ilman tarvitsee-kaaria
--    toisiinsa (rinnakkaisia, ei peräkkäisiä — käyttäjän oma korjaus
--    tuontivaiheeseen).
--  - 'liittyy'-kaaret: "Tietorakenteet"-kokoava käsite (koodaus, YHDISTÄÄ
--    listat/sanakirjat/monikot) ja "Functions"-risteyssolmu (matikka,
--    YHDISTÄÄ eksponentit/logaritmit/trigonometriset funktiot) — molemmat
--    eksplisiittisesti pyydetty lähdetiedostoissa.
--  - Huhtikuun 2027 kertauskuukaudelle EI luotu omaa solmua (lähdetiedoston
--    oma huomio: "ei ole oma taito vaan tilamerkintä" aiemmille) — kun
--    Eksponentit/Logaritmit/Funktiot etenevät retrieval/yllapito-vaiheeseen
--    normaalisti moottorin kautta, huhtikuun kertaustarve hoituu samaa
--    reittiä ilman erillistä rakennetta.
--  - Kaikille koodaussolmuille tavoiteikkuna = NULL (kurssi on omaan tahtiin,
--    ei kuukausisidontaa lähdetiedostossa) — moottori antaa tälle saman
--    pienen tasapainopainon kuin deadlinettomille opinto_aiheille.
--
-- Idempotentti: koko lohko ohitetaan jos ensimmäinen koodaussolmu on jo
-- olemassa tälle omistajalle.
--
-- Aja tämä Supabasen SQL Editorissa sql/092:n jälkeen.

begin;

do $$
declare
  v_owner uuid;
begin
  select user_id into v_owner from hytti_omistajat where henkilo = 'katri';
  if v_owner is null then
    raise exception 'hytti_omistajat-taulusta ei löytynyt riviä henkilo=''katri'' - aja sql/027 ensin.';
  end if;

  if exists (select 1 from taitosolmut where owner_id = v_owner and name = 'ohjelman peruskulku, tulostus') then
    return;
  end if;

  -- === KOODAUSKURSSI: Introduction to Programming (osat 1-7) ===
  insert into taitosolmut (owner_id, name, lahde) values
    (v_owner, 'ohjelman peruskulku, tulostus', 'Intro to Programming, osa 1.1'),
    (v_owner, 'syötteen lukeminen', 'Intro to Programming, osa 1.2'),
    (v_owner, 'muuttujat', 'Intro to Programming, osa 1.3'),
    (v_owner, 'aritmeettiset operaatiot', 'Intro to Programming, osa 1.4'),
    (v_owner, 'ehtolauseet', 'Intro to Programming, osa 1.5'),
    (v_owner, 'ohjelmoinnin peruskäsitteet', 'Intro to Programming, osa 2.1'),
    (v_owner, 'haarautuvat ehtolauseet', 'Intro to Programming, osa 2.2'),
    (v_owner, 'yhdistetyt ehdot (and/or/not)', 'Intro to Programming, osa 2.3'),
    (v_owner, 'silmukat (perusmuoto)', 'Intro to Programming, osa 2.4'),
    (v_owner, 'ehdolliset silmukat', 'Intro to Programming, osa 3.1'),
    (v_owner, 'merkkijonot', 'Intro to Programming, osa 3.2'),
    (v_owner, 'sisäkkäiset silmukat', 'Intro to Programming, osa 3.3'),
    (v_owner, 'funktion määrittely', 'Intro to Programming, osa 3.4'),
    (v_owner, 'kehitysympäristö ja debuggaus (työkalu)', 'Intro to Programming, osa 4.1'),
    (v_owner, 'funktion parametrit ja paluuarvot', 'Intro to Programming, osa 4.2'),
    (v_owner, 'listat', 'Intro to Programming, osa 4.3'),
    (v_owner, 'for-silmukka listan yli', 'Intro to Programming, osa 4.4'),
    (v_owner, 'tulosteen muotoilu', 'Intro to Programming, osa 4.5'),
    (v_owner, 'merkkijonot ja listat yhdessä', 'Intro to Programming, osa 4.6'),
    (v_owner, 'listan metodit', 'Intro to Programming, osa 5.1'),
    (v_owner, 'viittaukset (muuttuva vs muuttumaton data)', 'Intro to Programming, osa 5.2'),
    (v_owner, 'sanakirjat (avain-arvo-rakenne)', 'Intro to Programming, osa 5.3'),
    (v_owner, 'monikot', 'Intro to Programming, osa 5.4'),
    (v_owner, 'tiedoston lukeminen', 'Intro to Programming, osa 6.1'),
    (v_owner, 'tiedoston kirjoittaminen', 'Intro to Programming, osa 6.2'),
    (v_owner, 'virheenkäsittely (try/except)', 'Intro to Programming, osa 6.3'),
    (v_owner, 'muuttujan näkyvyysalue', 'Intro to Programming, osa 6.4'),
    (v_owner, 'moduulit ja niiden tuonti', 'Intro to Programming, osa 7.1'),
    (v_owner, 'satunnaisuus', 'Intro to Programming, osa 7.2'),
    (v_owner, 'aika ja päivämäärä', 'Intro to Programming, osa 7.3'),
    (v_owner, 'datankäsittely', 'Intro to Programming, osa 7.4'),
    (v_owner, 'oman moduulin kirjoittaminen', 'Intro to Programming, osa 7.5'),
    (v_owner, 'kielen lisäominaisuudet', 'Intro to Programming, osa 7.6');

  -- === KOODAUSKURSSI: Advanced Course in Programming (osat 8-14) ===
  insert into taitosolmut (owner_id, name, lahde) values
    (v_owner, 'oliot ja metodit', 'Advanced Course in Programming, osa 8.1'),
    (v_owner, 'luokka olion pohjana', 'Advanced Course in Programming, osa 8.2'),
    (v_owner, 'luokan määrittely', 'Advanced Course in Programming, osa 8.3'),
    (v_owner, 'metodin määrittely', 'Advanced Course in Programming, osa 8.4'),
    (v_owner, 'luokkien käyttöesimerkit', 'Advanced Course in Programming, osa 8.5'),
    (v_owner, 'olioviittaukset', 'Advanced Course in Programming, osa 9.1'),
    (v_owner, 'olio toisen olion attribuuttina (kompositio)', 'Advanced Course in Programming, osa 9.2'),
    (v_owner, 'kapselointi', 'Advanced Course in Programming, osa 9.3'),
    (v_owner, 'metodien näkyvyys', 'Advanced Course in Programming, osa 9.4'),
    (v_owner, 'luokkamuuttujat', 'Advanced Course in Programming, osa 9.5'),
    (v_owner, 'laajemmat luokkaesimerkit', 'Advanced Course in Programming, osa 9.6'),
    (v_owner, 'periytyminen', 'Advanced Course in Programming, osa 10.1'),
    (v_owner, 'näkyvyysmääreet', 'Advanced Course in Programming, osa 10.2'),
    (v_owner, 'olio-ohjelmoinnin tekniikat', 'Advanced Course in Programming, osa 10.3'),
    (v_owner, 'sovelluksen rakentaminen (soveltava, harjoitus)', 'Advanced Course in Programming, osa 10.4'),
    (v_owner, 'listakomprehensio', 'Advanced Course in Programming, osa 11.1'),
    (v_owner, 'komprehensiot laajemmin', 'Advanced Course in Programming, osa 11.2'),
    (v_owner, 'rekursio', 'Advanced Course in Programming, osa 11.3'),
    (v_owner, 'rekursion soveltaminen', 'Advanced Course in Programming, osa 11.4'),
    (v_owner, 'funktio parametrina (korkeamman kertaluvun funktiot)', 'Advanced Course in Programming, osa 12.1'),
    (v_owner, 'generaattorit', 'Advanced Course in Programming, osa 12.2'),
    (v_owner, 'funktionaalinen ohjelmointi', 'Advanced Course in Programming, osa 12.3'),
    (v_owner, 'säännölliset lausekkeet', 'Advanced Course in Programming, osa 12.4'),
    (v_owner, 'pygame-kirjaston perusteet', 'Advanced Course in Programming, osa 13.1'),
    (v_owner, 'animaatio', 'Advanced Course in Programming, osa 13.2'),
    (v_owner, 'tapahtumankäsittely', 'Advanced Course in Programming, osa 13.3'),
    (v_owner, 'pygamen jatkotekniikat', 'Advanced Course in Programming, osa 13.4'),
    (v_owner, 'koodausprojektin toteutus', 'Advanced Course in Programming, osa 14 (projektityö)'),
    (v_owner, 'Tietorakenteet (kokoava käsite)', 'Kokoaa: listat + sanakirjat + monikot, ei suora kurssin osa');

  -- tarvitsee-kaaret: koodausprojekti (14) tarvitsee kaikki käsitteelliset
  -- taidot osista 1-13 (EI 4.1/10.4-työkalusolmuja, EI itse Tietorakenteet-
  -- hubia joka on liittyy-tyyppinen kooste, ei erillinen opittava taito).
  insert into taito_kaaret (owner_id, from_id, to_id, tyyppi)
  select v_owner, p.id, s.id, 'tarvitsee'
  from taitosolmut p, taitosolmut s
  where p.owner_id = v_owner and p.name = 'koodausprojektin toteutus'
    and s.owner_id = v_owner
    and s.name not in (
      'koodausprojektin toteutus',
      'kehitysympäristö ja debuggaus (työkalu)',
      'sovelluksen rakentaminen (soveltava, harjoitus)',
      'Tietorakenteet (kokoava käsite)'
    )
    and (s.lahde like 'Intro to Programming%' or s.lahde like 'Advanced Course in Programming%');

  -- liittyy-kaaret: Tietorakenteet-hubi (kartan lukua varten, EI portille)
  insert into taito_kaaret (owner_id, from_id, to_id, tyyppi)
  select v_owner, h.id, s.id, 'liittyy'
  from taitosolmut h, taitosolmut s
  where h.owner_id = v_owner and h.name = 'Tietorakenteet (kokoava käsite)'
    and s.owner_id = v_owner and s.name in ('listat', 'sanakirjat (avain-arvo-rakenne)', 'monikot');

  -- === MATIKKARATA: Khan Academy, kuukausi-ikkunoin ===
  -- Elokuu 2026 — TIETOISESTI EI tarvitse-kaaria näiden kuuden välillä
  -- (rinnakkaisia osa-alueita, käyttäjän oma korjaus tuontivaiheeseen).
  insert into taitosolmut (owner_id, name, lahde, linkki, tavoiteikkuna) values
    (v_owner, 'Quadratic equations', 'Algebra 2 – Elokuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-08-31'),
    (v_owner, 'Factoring quadratics', 'Algebra 2 – Elokuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-08-31'),
    (v_owner, 'Quadratic formula', 'Algebra 2 – Elokuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-08-31'),
    (v_owner, 'Graphing quadratics', 'Algebra 2 – Elokuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-08-31'),
    (v_owner, 'Systems of equations', 'Algebra 2 – Elokuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-08-31'),
    (v_owner, 'Exponential growth and decay', 'Algebra 2 – Elokuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-08-31');

  -- Syyskuu 2026 — Functions (risteyssolmu, liittyy-kaaret alempana)
  insert into taitosolmut (owner_id, name, lahde, linkki, tavoiteikkuna) values
    (v_owner, 'Functions', 'Algebra 1 (Functions) – Syyskuu 2026', 'https://www.khanacademy.org/math/algebra', '2026-09-30'),
    (v_owner, 'Domain and range', 'Algebra 1 (Functions) – Syyskuu 2026', 'https://www.khanacademy.org/math/algebra', '2026-09-30'),
    (v_owner, 'Function notation', 'Algebra 1 (Functions) – Syyskuu 2026', 'https://www.khanacademy.org/math/algebra', '2026-09-30'),
    (v_owner, 'Function transformations', 'Algebra 1 (Functions) – Syyskuu 2026', 'https://www.khanacademy.org/math/algebra', '2026-09-30'),
    (v_owner, 'Inverse functions', 'Algebra 1 (Functions) – Syyskuu 2026', 'https://www.khanacademy.org/math/algebra', '2026-09-30');

  -- Lokakuu 2026 — Eksponentit
  insert into taitosolmut (owner_id, name, lahde, linkki, tavoiteikkuna) values
    (v_owner, 'Exponential functions', 'Algebra 2 – Lokakuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-10-31'),
    (v_owner, 'Growth and decay', 'Algebra 2 – Lokakuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-10-31'),
    (v_owner, 'Exponential equations', 'Algebra 2 – Lokakuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-10-31');

  -- Marraskuu 2026 — Logaritmit
  insert into taitosolmut (owner_id, name, lahde, linkki, tavoiteikkuna) values
    (v_owner, 'Intro to logarithms', 'Algebra 2 – Marraskuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-11-30'),
    (v_owner, 'Logarithm properties', 'Algebra 2 – Marraskuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-11-30'),
    (v_owner, 'Solving logarithmic equations', 'Algebra 2 – Marraskuu 2026', 'https://www.khanacademy.org/math/algebra2', '2026-11-30');

  -- Joulukuu 2026 — Trigonometrian perusteet
  insert into taitosolmut (owner_id, name, lahde, linkki, tavoiteikkuna) values
    (v_owner, 'Unit circle', 'Trigonometry – Joulukuu 2026', 'https://www.khanacademy.org/math/trigonometry', '2026-12-31'),
    (v_owner, 'Radians', 'Trigonometry – Joulukuu 2026', 'https://www.khanacademy.org/math/trigonometry', '2026-12-31'),
    (v_owner, 'Sine', 'Trigonometry – Joulukuu 2026', 'https://www.khanacademy.org/math/trigonometry', '2026-12-31'),
    (v_owner, 'Cosine', 'Trigonometry – Joulukuu 2026', 'https://www.khanacademy.org/math/trigonometry', '2026-12-31'),
    (v_owner, 'Tangent', 'Trigonometry – Joulukuu 2026', 'https://www.khanacademy.org/math/trigonometry', '2026-12-31');

  -- Tammikuu 2027 — Trigonometrian jatko
  insert into taitosolmut (owner_id, name, lahde, linkki, tavoiteikkuna) values
    (v_owner, 'Trigonometric equations', 'Trigonometry – Tammikuu 2027', 'https://www.khanacademy.org/math/trigonometry', '2027-01-31'),
    (v_owner, 'Law of sines', 'Trigonometry – Tammikuu 2027', 'https://www.khanacademy.org/math/trigonometry', '2027-01-31'),
    (v_owner, 'Law of cosines', 'Trigonometry – Tammikuu 2027', 'https://www.khanacademy.org/math/trigonometry', '2027-01-31');

  -- Helmikuu 2027 — Vectors
  insert into taitosolmut (owner_id, name, lahde, linkki, tavoiteikkuna) values
    (v_owner, 'Vectors', 'Linear algebra – Helmikuu 2027', 'https://www.khanacademy.org/math/linear-algebra', '2027-02-28'),
    (v_owner, 'Magnitude', 'Linear algebra – Helmikuu 2027', 'https://www.khanacademy.org/math/linear-algebra', '2027-02-28'),
    (v_owner, 'Direction', 'Linear algebra – Helmikuu 2027', 'https://www.khanacademy.org/math/linear-algebra', '2027-02-28');

  -- Maaliskuu 2027 — Matrices
  insert into taitosolmut (owner_id, name, lahde, linkki, tavoiteikkuna) values
    (v_owner, 'Matrix basics', 'Linear algebra – Maaliskuu 2027', 'https://www.khanacademy.org/math/linear-algebra', '2027-03-31'),
    (v_owner, 'Matrix operations', 'Linear algebra – Maaliskuu 2027', 'https://www.khanacademy.org/math/linear-algebra', '2027-03-31');

  -- Huhtikuu 2027: EI omaa solmua, ks. yläkommentti.

  -- Kesä 2027 — Precalculus-valmistelu
  insert into taitosolmut (owner_id, name, lahde, linkki, tavoiteikkuna) values
    (v_owner, 'Limits intuition', 'Get Ready for Precalculus/AP Calc – Kesä 2027', 'https://www.khanacademy.org/math/get-ready-for-ap-calc', '2027-07-31'),
    (v_owner, 'Rate of change', 'Get Ready for Precalculus/AP Calc – Kesä 2027', 'https://www.khanacademy.org/math/get-ready-for-ap-calc', '2027-07-31'),
    (v_owner, 'Function behavior', 'Get Ready for Precalculus/AP Calc – Kesä 2027', 'https://www.khanacademy.org/math/get-ready-for-ap-calc', '2027-07-31');

  -- liittyy-kaaret: Functions-risteyssolmu yhdistää eksponentit/logaritmit/
  -- trigonometriset funktiot (lähdetiedoston oma huomio, kartan lukua varten,
  -- EI portille).
  insert into taito_kaaret (owner_id, from_id, to_id, tyyppi)
  select v_owner, f.id, s.id, 'liittyy'
  from taitosolmut f, taitosolmut s
  where f.owner_id = v_owner and f.name = 'Functions'
    and s.owner_id = v_owner
    and s.name in ('Exponential functions', 'Intro to logarithms', 'Sine', 'Cosine', 'Tangent');
end $$;

commit;
