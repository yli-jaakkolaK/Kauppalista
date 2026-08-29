// OpenStax "College Physics for AP® Courses 2e" -osioiden URL-kartta
// (2026-08-29, Katrin build brief "Practice Problem Generator"). Kirja on
// vapaasti luettavissa osoitteessa openstax.org — TÄMÄ ON KOKONAAN korvaava
// ratkaisu 255MB/~1800-sivuisen PDF:n käsittelylle: ei PDF:ää, ei
// paikallista tiedostoa, vain suorat web-osoitteet joita haetaan tarpeen
// mukaan ja välimuistoidaan (opinto_aiheet.openstax_cache).
//
// Slugit on TARKISTETTU oikeilta sivuilta (ei arvattu) 2026-08-29 — jokainen
// alla oleva osoite on käyty läpi joko suoraan tai edellinen/seuraava-
// linkkiketjun kautta naapurisivulta. Kattaa tarkasti ne luvut/osiot jotka
// esiintyvät fysiikan kurssin (opinto_kurssit id=9) aiheiden otsikoissa.
const OSIO_SLUGIT = {
  '2.1': '2-1-displacement',
  '2.2': '2-2-vectors-scalars-and-coordinate-systems',
  '2.3': '2-3-time-velocity-and-speed',
  '2.4': '2-4-acceleration',
  '2.5': '2-5-motion-equations-for-constant-acceleration-in-one-dimension',
  '2.6': '2-6-problem-solving-basics-for-one-dimensional-kinematics',
  '3.1': '3-1-kinematics-in-two-dimensions-an-introduction',
  '3.2': '3-2-vector-addition-and-subtraction-graphical-methods',
  '3.3': '3-3-vector-addition-and-subtraction-analytical-methods',
  '3.4': '3-4-projectile-motion',
  '3.5': '3-5-addition-of-velocities',
  '4.1': '4-1-development-of-force-concept',
  '4.2': '4-2-newtons-first-law-of-motion-inertia',
  '4.3': '4-3-newtons-second-law-of-motion-concept-of-a-system',
  '4.4': '4-4-newtons-third-law-of-motion-symmetry-in-forces',
  '4.5': '4-5-normal-tension-and-other-examples-of-forces',
  '4.6': '4-6-problem-solving-strategies',
  '4.7': '4-7-further-applications-of-newtons-laws-of-motion',
  '5.1': '5-1-friction',
  '7.1': '7-1-work-the-scientific-definition',
  '7.2': '7-2-kinetic-energy-and-the-work-energy-theorem',
  '7.3': '7-3-gravitational-potential-energy',
  '7.6': '7-6-conservation-of-energy',
  '7.7': '7-7-power',
  '8.1': '8-1-linear-momentum-and-force',
  '8.2': '8-2-impulse',
  '8.3': '8-3-conservation-of-momentum',
  '8.4': '8-4-elastic-collisions-in-one-dimension',
  '8.5': '8-5-inelastic-collisions-in-one-dimension',
  '13.1': '13-1-temperature',
  '13.2': '13-2-thermal-expansion-of-solids-and-liquids',
  '14.1': '14-1-heat',
  '14.2': '14-2-temperature-change-and-heat-capacity',
  '14.4': '14-4-heat-transfer-methods',
  '14.5': '14-5-conduction',
  '14.6': '14-6-convection',
  '14.7': '14-7-radiation',
  '24.3': '24-3-the-electromagnetic-spectrum',
};

const OSIO_BASE_URL = 'https://openstax.org/books/college-physics-ap-courses-2e/pages/';

// Poimii tekstin näkyvissä olevasta OpenStax-sivusta. Ei ulkoista riippuvuutta
// selaimeen/JS-suoritukseen — sivu on palvelinpuolella jo valmiiksi
// tekstimuodossa (tarkistettu 2026-08-29), joten pelkkä fetch + html-to-text
// riittää. Palauttaa null jos osiota ei löydy kartasta tai haku epäonnistuu
// (kutsuja päättää mitä silloin tehdään — ei koskaan heitä poikkeusta).
async function haeOpenstaxOsio(osio) {
  const slug = OSIO_SLUGIT[osio];
  if (!slug) return null;
  return haeJaSiistiOpenstaxSivu(OSIO_BASE_URL + slug);
}

// Luvun lopun "Problems & Exercises" / "Test Prep for AP® Courses" -sivut
// (2026-08-29, Katrin pyyntö: näitä saa käyttää generaattorin pohjana, kunhan
// tehtäviä ei kopioida sellaisenaan samoin luvuin — ks. luo-harjoitustehtava.js
// promptin ohjeistus). Slugimuoto tarkistettu luvulle 4, sama kaava pätee
// muillekin — jos jokin luku poikkeaa, haku epäonnistuu siististi (null)
// eikä riko mitään.
async function haeLuvunHarjoitussivut(luku) {
  const [tehtavat, testiprep] = await Promise.all([
    haeJaSiistiOpenstaxSivu(OSIO_BASE_URL + luku + '-problems-exercises'),
    haeJaSiistiOpenstaxSivu(OSIO_BASE_URL + luku + '-test-prep-for-ap-r-courses'),
  ]);
  return [tehtavat, testiprep].filter(Boolean).join('\n\n');
}

async function haeJaSiistiOpenstaxSivu(url) {
  try {
    const { convert } = require('html-to-text');
    const res = await fetch(url);
    if (!res.ok) return null;
    const html = await res.text();
    const teksti = convert(html, {
      selectors: [
        { selector: 'script', format: 'skip' },
        { selector: 'style', format: 'skip' },
        { selector: 'nav', format: 'skip' },
        { selector: 'header', format: 'skip' },
        { selector: 'footer', format: 'skip' },
        { selector: 'img', format: 'skip' },
        { selector: 'a', options: { ignoreHref: true } },
      ],
      wordwrap: false,
    });
    return siistiRajat(teksti);
  } catch (e) {
    console.error('[openstax-osiot] Haku epäonnistui:', url, e.message);
    return null;
  }
}

// OpenStax-sivun raaka teksti sisältää alussa navigaatio-/hakuroskaa ja
// lopussa sitaattiohjeen — molemmat rajataan pois tunnetuista, joka sivulla
// toistuvista merkeistä. Pituuskatto varmistaa ettei yksikään osio turhaan
// paisuta promptia (ei tarvetta täydelle tarkkuudelle, riittää konteksti).
function siistiRajat(teksti) {
  let tulos = teksti;
  const alku = tulos.indexOf('LEARNING OBJECTIVES');
  if (alku !== -1) tulos = tulos.slice(alku);
  const loppuHaku = tulos.search(/How to cite|Authors:|Book URL:/);
  if (loppuHaku !== -1) tulos = tulos.slice(0, loppuHaku);
  return tulos.trim().slice(0, 8000);
}

module.exports = { OSIO_SLUGIT, haeOpenstaxOsio, haeLuvunHarjoitussivut };
