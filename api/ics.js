// Kalenterisilta-korjaus (2026-07-21, Katrin testilöydös oikealla asennetulla
// iOS-PWA:lla, ks. muistiinpanot.md "Kalenterisilta"): edellinen tekniikka
// (data:text/calendar-URI avattuna suoraan selaimessa) avasi vain tyhjän
// valkoisen sivun asennetussa PWA:ssa — ei Applen tapahtumanäkymää, ei
// virhettä. Perinteisesti luotettavin reitti iOS Safarin/PWA:n natiiviin
// .ics-käsittelyyn on palvelimen palauttama oikea Content-Type: text/calendar
// -vastaus, jonka WebKit tunnistaa MIME-tyypistä (ei data:-skeeman sisällöstä)
// ja avaa omaan "Lisää tapahtuma" -näkymäänsä.
//
// Ei tietokantayhteyttä, ei autentikointia — puhdas muotoilufunktio jolle
// annetaan tapahtuman tiedot suoraan query-parametreina (script.js tuntee ne
// jo, ei tarvitse hakea mitään uudelleen). Sama .ics-sisältö jonka
// script.js aiemmin rakensi itse (ks. sen entinen rakennaIcsTapahtuma()).

function icsEscape(teksti) {
  return String(teksti).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

// "YYYYMMDDTHHMMSS" .ics-muotoon — Date-oliota käytetään PELKKÄNÄ
// vuorokaudenylityksen laskurina (getUTC*-metodit, ei todellinen UTC-hetki),
// koska pvm+aika on jo Europe/Helsinki-seinäkelloaikaa (ks. DTSTART/DTEND;TZID
// alla) eikä ajokoneen omaa aikavyöhykettä saa päästää sotkemaan laskua.
function muotoileIcsAika(d) {
  const pad = function(n) { return String(n).padStart(2, '0'); };
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00';
}

// Kellonaika jäädytetty jo kirjoitushetkellä (ks. design-periaate "Suhteellinen
// aika jäädytetään kirjoitushetkeen") — tämä vain muotoilee sen .ics-kentiksi.
// Kesto oletetaan 1h (ei tiedetä todellista kestoa) — käyttäjä säätää sen
// itse Applen omassa näkymässä ennen Lisää-napin painamista. Loppuaika
// LASKETAAN Date-aritmetiikalla (ei modulo+sama-päivä-oletuksella) jotta
// puolenyön ylittävä tapahtuma (esim. 23:30) saa DTEND:n OIKEALLE
// seuraavalle päivälle sen sijaan että loppu näyttäisi olevan ennen alkua.
function rakennaIcsTapahtuma(otsikko, pvm, aika) {
  const pvmOsat = pvm.split('-').map(function(s) { return parseInt(s, 10); });
  const aikaOsat = aika.split(':').map(function(s) { return parseInt(s, 10); });
  const alku = new Date(Date.UTC(pvmOsat[0], pvmOsat[1] - 1, pvmOsat[2], aikaOsat[0], aikaOsat[1], 0));
  const loppu = new Date(alku.getTime() + 60 * 60 * 1000);
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = 'satama-' + Date.now() + '-' + Math.random().toString(36).slice(2) + '@kauppalista-nine.vercel.app';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Satama//Kalenterisilta//FI',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + dtstamp,
    'DTSTART;TZID=Europe/Helsinki:' + muotoileIcsAika(alku),
    'DTEND;TZID=Europe/Helsinki:' + muotoileIcsAika(loppu),
    'SUMMARY:' + icsEscape(otsikko),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

const VALID_ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_TIME = /^\d{2}:\d{2}(:\d{2})?$/;

module.exports = async function handler(req, res) {
  const { otsikko, pvm, aika } = req.query || {};
  if (!otsikko || !pvm || !aika) {
    return res.status(400).send('Puuttuvia parametreja (otsikko/pvm/aika vaaditaan).');
  }
  if (!VALID_ISO_DATE.test(pvm) || !VALID_TIME.test(aika)) {
    return res.status(400).send('Virheellinen päivämäärä tai kellonaika.');
  }

  const ics = rakennaIcsTapahtuma(String(otsikko), pvm, aika);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  return res.status(200).send(ics);
};
