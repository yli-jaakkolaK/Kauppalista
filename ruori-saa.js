// === RUORI: SÄÄ-SEGMENTTI (2026-08-11, Ruori-speksi §2) === Open-Meteo
// api/saa.js:n kautta (palvelin välimuistittaa 30 min, ei suoraa selainkutsua
// — ks. api/saa.js:n kommentti). Piilottaa koko segmentin virhetilanteessa:
// "vanhan datan näyttäminen tuoreena on pahempi virhe kuin sään puuttuminen"
// (§2.2) — paketin mahdollista vanha_data-varakenttää ei koskaan renderöidä
// täältä tuoreena datana.
// Yhdistetyt "virallisen näköiset" säämerkit (2026-08-18, Katrin palaute:
// aiempi versio piirsi 2-3 ERILLISTÄ pientä kuvaketta rinnakkain samaan
// soluun — esim. aurinko+pilvi+pisara omina 15px-merkkeinään — mikä ei
// näyttänyt keneltäkään tunnetulta säämerkiltä, vain sekavalta pikselikasalta.
// Jokainen WMO-koodiryhmä saa nyt YHDEN koostetun kuvakkeen samassa
// 24x24-viewBoxissa (aurinko pilven takaa kurkistaen, pilvi+viiva-sade,
// pilvi+hiutale, pilvi+salama) — sama rakenne kuin tunnetuilla sääpalveluilla
// (yr.no, Apple Sää, Ilmatieteenlaitos), ei enää oma sommittelu.
// Värit "virallisten" säämerkkien tapaan (2026-08-18, Katrin palaute:
// aiempi versio oli tasan yksivärinen currentColor-ääriviiva joka ei
// näyttänyt oikealta säämerkiltä — oikeat sääpalvelut käyttävät aina väriä,
// aurinko keltainen/kultainen, pilvi harmaa, sade/lumi sininen, salama
// meripihka). CSS-muuttujina (ei kiinteitä hex-arvoja) jotta tumma teema
// mukautuu automaattisesti kuten muukin sovellus — ei uusia värejä, samat
// jaetut tokenit kuin muualla.
//
// SIIRRETTY OMAKSI TIEDOSTOKSEEN (2026-08-30, script.js:n pilkkomisen askel
// 2, ks. muistin project_scriptjs_split_plan) — pelkkä fyysinen siirto, ei
// sisällöllistä muutosta. Nimettiin ensin saa-widget.js:ksi (ettei sekoitu
// palvelinpuolen api/saa.js:ään), UUDELLEENNIMETTY ruori-saa.js:ksi
// 2026-08-31: Katrin loyto, "widget" tiedostonimessa on tunnettu
// mainosestolistojen (EasyList ym.) sokea suodatuspätterni — tiedosto
// jai lataamatta hanen selaimessaan JOKA kerta riippumatta cache/SW-
// tilasta (sailyi jopa taydellisen "clear site data" -tyhjennyksen yli),
// mika nakyi konsolissa "lataaRuoriSaa is not defined" -virheena.
const SAA_VARI_AURINKO = 'var(--sinappi)';
const SAA_VARI_PILVI = 'var(--vaimea)';
const SAA_VARI_SADE = 'var(--syvanne)';
const SAA_VARI_SALAMA = 'var(--huomio)';
const SAA_IKONIT = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="' + SAA_VARI_AURINKO + '" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.6" fill="' + SAA_VARI_AURINKO + '" fill-opacity=".18"/><path d="M12 1.5v2.4M12 20.1v2.4M4.5 4.5l1.7 1.7M17.8 17.8l1.7 1.7M1.5 12h2.4M20.1 12h2.4M4.5 19.5l1.7-1.7M17.8 6.2l1.7-1.7"/></svg>',
  cloud: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 19a4.5 4.5 0 0 1-.4-8.98A5.5 5.5 0 0 1 16.8 9.1 4 4 0 0 1 16.5 19h-10z"/></svg>',
  partlycloudy: '<svg viewBox="0 0 24 24"><g fill="' + SAA_VARI_AURINKO + '" fill-opacity=".18" stroke="' + SAA_VARI_AURINKO + '" stroke-width="1.8" stroke-linecap="round"><circle cx="16.2" cy="7.3" r="3"/><path d="M16.2 1.8v1.6M21.4 4.1l-1.2 1.2M23 7.3h-1.6M19.4 11l-1.3-1.3" fill="none"/></g><path fill="' + SAA_VARI_PILVI + '" d="M6.5 19a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 9.4 3.8 3.8 0 0 1 15.6 19H6.5z"/></svg>',
  fog: '<svg viewBox="0 0 24 24" stroke="' + SAA_VARI_PILVI + '" stroke-width="2" stroke-linecap="round" fill="none"><path d="M3 7.5h18M3 12h18M3 16.5h13"/></svg>',
  drizzle: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 16a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 6.4 3.8 3.8 0 0 1 15.6 16H6.5z"/><g stroke="' + SAA_VARI_SADE + '" stroke-width="1.8" stroke-linecap="round"><path d="M8.5 19.5v1.7M13.5 19.5v1.7"/></g></svg>',
  rain: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 15a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 5.4 3.8 3.8 0 0 1 15.6 15H6.5z"/><g stroke="' + SAA_VARI_SADE + '" stroke-width="1.8" stroke-linecap="round"><path d="M7.5 18l-1.2 3.2M12 18l-1.2 3.2M16.5 18l-1.2 3.2"/></g></svg>',
  rainshower: '<svg viewBox="0 0 24 24"><g fill="' + SAA_VARI_AURINKO + '" fill-opacity=".18" stroke="' + SAA_VARI_AURINKO + '" stroke-width="1.8" stroke-linecap="round"><circle cx="16.2" cy="6.8" r="2.6"/><path d="M16.2 1.9v1.4M20.7 3.9l-1.1 1.1M22.1 6.8h-1.4M18.9 10.1l-1.2-1.2" fill="none"/></g><path fill="' + SAA_VARI_PILVI + '" d="M6 16a4.1 4.1 0 0 1-.4-8.18A5.1 5.1 0 0 1 15.1 6.3 3.6 3.6 0 0 1 14.8 16H6z"/><g stroke="' + SAA_VARI_SADE + '" stroke-width="1.8" stroke-linecap="round"><path d="M8 19l-1 2.7M14 19l-1 2.7"/></g></svg>',
  snow: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 15a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 5.4 3.8 3.8 0 0 1 15.6 15H6.5z"/><g stroke="' + SAA_VARI_SADE + '" stroke-width="1.6" stroke-linecap="round"><path d="M8 18.2v3.4M6.5 20l3-1.8M6.5 18.2l3 1.8M15 18.2v3.4M13.5 20l3-1.8M13.5 18.2l3 1.8"/></g></svg>',
  thunder: '<svg viewBox="0 0 24 24"><path fill="' + SAA_VARI_PILVI + '" d="M6.5 14a4.3 4.3 0 0 1-.4-8.58A5.3 5.3 0 0 1 15.9 4.4 3.8 3.8 0 0 1 15.6 14H6.5z"/><path fill="' + SAA_VARI_SALAMA + '" d="M13.5 12.5l-5 6.5h3.3l-.6 4.3 5-6.8h-3.3l.6-4z"/></svg>',
  // Tuuli (2026-08-11, Katrin pyyntö) — ei omaa leimasinta eikä numeroa,
  // vain kuvake sääkuvakkeen vierellä sinä tuntina kun tuulee. "tuuli" on
  // ohut kaksirivinen versio, "tuuliKova" paksumpi + väritetty --vaara:lla
  // (span-wrapperin kautta) jotta tosi kova tuuli erottuu MYÖS muodosta,
  // ei vain väristä.
  tuuli: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 9h12.5a2.8 2.8 0 1 0-2.3-4.4"/><path d="M3 15h15a2.8 2.8 0 1 1-2.3 4.4"/></svg>',
  tuuliKova: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M2 7h13a3.2 3.2 0 1 0-2.6-5"/><path d="M2 12.5h18"/><path d="M2 18h14a3.2 3.2 0 1 1-2.6 5"/></svg>',
};
const TUULI_KYNNYS = 30;
const TUULI_KOVA_KYNNYS = 50;
// Tuulikuvake sääkuvakkeen viereen sille tunnille jona tuulee (ei numero,
// ei omaa leimasinta) — normaali versio kynnyksen ylittyessä, paksumpi ja
// --vaara-punainen versio kun tuuli on tosi kova.
function saaTuuliIkoni(nopeus) {
  if (typeof nopeus !== 'number') return '';
  if (nopeus >= TUULI_KOVA_KYNNYS) return '<span style="color:var(--vaara)">' + SAA_IKONIT.tuuliKova + '</span>';
  if (nopeus >= TUULI_KYNNYS) return SAA_IKONIT.tuuli;
  return '';
}

// WMO-säätunnus -> YKSI koostettu kuvake (Ruori-speksi §2.3, uudistettu
// 2026-08-18). Aiemmin tämä palautti 1-3 erillistä kuvakeavainta jotka
// aseteltiin rinnakkain — nyt jokainen WMO-ryhmä vastaa suoraan yhtä
// SAA_IKONIT-avainta, koska yhdistelmä on jo piirretty kuvakkeen sisään.
function saaIkoniAvainKoodille(koodi) {
  if (koodi === 0) return 'sun';
  if (koodi === 1 || koodi === 2) return 'partlycloudy';
  if (koodi === 3) return 'cloud';
  if (koodi === 45 || koodi === 48) return 'fog';
  if (koodi >= 51 && koodi <= 57) return 'drizzle';
  if (koodi >= 61 && koodi <= 67) return 'rain';
  if ((koodi >= 71 && koodi <= 77) || (koodi >= 85 && koodi <= 86)) return 'snow';
  if (koodi >= 80 && koodi <= 82) return 'rainshower';
  if (koodi >= 95 && koodi <= 99) return 'thunder';
  return 'cloud';
}
// Sadetodennäköisyyden kynnys — 19 -> 20 (2026-08-18, Katrin pyyntö: "if
// there is 20% or more propability of rain mark it") — sama kynnys sekä
// sadeprosentin näyttämiselle tuntiriveillä ETTÄ ikonin pudotukselle
// sadekuvakkeesta pilviseen vastineeseen alla (2026-08-11, elävä testaus:
// koodi voi teknisesti tarkoittaa "tihkua" mutta jos todennäköisyys on
// silti pieni tälle nimenomaiselle tunnille, sadekuvake harhaanjohtaa) —
// YKSI kynnys, ei kaksi hieman eri arvoa. Aurinkoiset sadekuvakkeet
// (rainshower) tippuvat kirkkaan-pilvisen (partlycloudy) puolelle,
// lumi/ukkonen tavalliseen pilveen — ei koskaan jää sadetta kuvaavaksi
// ilman riittävää todennäköisyyttä.
const SAA_SADE_KYNNYS = 20;
const SAA_SADEIKONI_LASKEUTUU = { drizzle: 'cloud', rain: 'cloud', snow: 'cloud', thunder: 'cloud', rainshower: 'partlycloudy' };
function saaIkoniHtml(koodi, sade) {
  let avain = saaIkoniAvainKoodille(koodi);
  if (typeof sade === 'number' && sade < SAA_SADE_KYNNYS && SAA_SADEIKONI_LASKEUTUU[avain]) {
    avain = SAA_SADEIKONI_LASKEUTUU[avain];
  }
  return SAA_IKONIT[avain];
}
function pyoristaKymmeneen(n) { return Math.round(n / 10) * 10; }

// SATAMA_SPEKSI.md §16.5c kohta 4 (2026-08-16): "näytä viimeisin tunnettu
// arvo yhteyskatkolla, piilota vain jos ei koskaan ollut arvoa TAI
// edellisenkin hakeminen epäonnistui" — UUDISTETTU 2026-08-31, Katrin
// palaute: "it's better to show weather an hour ago than hide it
// complitely when there is error in network". Vanha versio sieti vain
// YHDEN ohimenevän katkon puhtaasti muistivaraisilla lipuilla (nollautuivat
// joka sivulatauksella, eivät siis auttaneet jos ITSE lataus epäonnistui
// ensimmäisenä yrityksenä). Nyt viimeisin ONNISTUNUT haku tallennetaan
// localStorageen aikaleimalla — epäonnistuessa näytetään SE (leimattuna
// "N min/h sitten", ei koskaan tuoreena esitettynä — säilyttää Ruori-
// speksin §15.2 alkuperäisen periaatteen "ei valehdella tuoreudesta"),
// piilotus vain jos ei ole MITÄÄN talletettua dataa lainkaan.
const SAA_VIIMEISIN_KEY = 'kauppalista_saa_viimeisin';

// Piirtää sään annetusta datasta (tuore TAI välimuistista) — palauttaa
// true jos jotain näytettävää löytyi (tälle päivälle osuvia tunteja),
// false jos data ei kelpaa (esim. välimuistissa eri päivän tunnit).
function piirraRuoriSaaSisalto(saa) {
  const tunnit = saa.hourly.time;

  // Koko päivä klo 1-23 (2026-08-11, Katrin pyyntö), ei enää vain
  // seuraavat muutama tunti. Merkkijonovertailu, ei new Date(t) — Open-
  // Meteon paikallisaikaleimat ("2026-08-11T14:00") eivät sisällä
  // aikavyöhykettä, ja new Date() tulkitsisi ne selaimen omalla
  // paikallisajalla, mikä on hauras jos se joskus poikkeaa Suomen ajasta.
  const tanaanIso = paivamaaraISO(new Date());
  const nytTunti = new Date().getHours();
  const nakyvat = [];
  let nykyIdx = -1;
  tunnit.forEach(function(t, i) {
    if (t.slice(0, 10) !== tanaanIso) return;
    const tunti = parseInt(t.slice(11, 13), 10);
    if (tunti < 1 || tunti > 23) return;
    if (tunti === nytTunti) nykyIdx = nakyvat.length;
    nakyvat.push(i);
  });
  if (nakyvat.length === 0) return false;
  const nykyAnkkuri = Math.max(nykyIdx, 0);

  const nykyinenLampo = saa.current && typeof saa.current.apparent_temperature === 'number'
    ? saa.current.apparent_temperature
    : saa.hourly.apparent_temperature[nakyvat[nykyAnkkuri]];
  document.getElementById('ruori-saa-lampo').textContent = Math.round(nykyinenLampo) + '°';

  const maxSadeTod = nakyvat.slice(nykyAnkkuri, nykyAnkkuri + 4).reduce(function(max, i) {
    return Math.max(max, saa.hourly.precipitation_probability[i] || 0);
  }, 0);
  const tagit = [];
  if (maxSadeTod >= 40) tagit.push('Sateenvarjo');
  if (nykyinenLampo <= 0) tagit.push('Hattu');
  if (nykyinenLampo >= 25) tagit.push('Aurinkolasit');
  // Tuuli EI ole tässä leimana eikä numerona (Katrin pyyntö) — ks.
  // saaTuuliIkoni() tuntirivin renderöinnissä alempana, kuvake sään
  // vierellä sinä tuntina jona tuulee.
  const tagitEl = document.getElementById('ruori-saa-tagit');
  tagitEl.innerHTML = '';
  tagit.forEach(function(teksti, i) {
    const span = document.createElement('span');
    span.className = 'saa-tagi';
    span.textContent = teksti;
    span.style.transform = 'rotate(' + (-4 + i * 3.5) + 'deg)';
    tagitEl.appendChild(span);
  });

  const tunnitEl = document.getElementById('ruori-saa-tunnit');
  tunnitEl.innerHTML = nakyvat.map(function(i, idx) {
    const sade = saa.hourly.precipitation_probability[i];
    const tuuli = saa.hourly.wind_speed_10m ? saa.hourly.wind_speed_10m[i] : undefined;
    // Tuntukohtainen "tuntuu kuin" -lukema (2026-08-18, Katrin pyyntö) —
    // sama apparent_temperature-sarja jota jo käytetään yläosan isolle
    // lukemalle, nyt myös jokaisella tunnilla erikseen, ei vain nyt-hetkellä.
    const tuntuu = saa.hourly.apparent_temperature ? saa.hourly.apparent_temperature[i] : undefined;
    return '<div class="saa-tunti' + (idx === nykyIdx ? ' saa-tunti-nyt' : '') + '">'
      + '<span class="saa-tunti-aika">' + tunnit[i].slice(11, 13) + '</span>'
      + '<span class="saa-tunti-ikoni">' + saaIkoniHtml(saa.hourly.weather_code[i], sade) + saaTuuliIkoni(tuuli) + '</span>'
      + '<span class="saa-tunti-lampo">' + (typeof tuntuu === 'number' ? Math.round(tuntuu) + '°' : '') + '</span>'
      + '<span class="saa-tunti-sade">' + (sade >= SAA_SADE_KYNNYS ? pyoristaKymmeneen(sade) + '%' : '') + '</span>'
      + '</div>';
  }).join('');
  if (nykyIdx >= 0) {
    const nykySolu = tunnitEl.children[nykyIdx];
    if (nykySolu) nykySolu.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
  return true;
}

function saaIanTeksti(haettuMs) {
  const minuuttia = Math.round((Date.now() - haettuMs) / 60000);
  if (minuuttia < 1) return 'juuri nyt';
  if (minuuttia < 60) return minuuttia + ' min sitten';
  return Math.round(minuuttia / 60) + ' h sitten';
}

async function lataaRuoriSaa() {
  const segmentti = document.getElementById('ruori-saa-segmentti');
  const vanhaEl = document.getElementById('ruori-saa-vanha');

  try {
    const { data: sessioData } = await db.auth.getSession();
    const token = sessioData.session ? sessioData.session.access_token : null;
    if (!token) throw new Error('Ei kirjautunut');
    const vastaus = await fetch('/api/saa', { headers: { Authorization: 'Bearer ' + token } });
    const paketti = await vastaus.json();
    if (!vastaus.ok || !paketti.data) throw new Error(paketti.error || 'Säädatan haku epäonnistui');
    if (!piirraRuoriSaaSisalto(paketti.data)) throw new Error('Ei tunteja näytettäväksi');

    try { localStorage.setItem(SAA_VIIMEISIN_KEY, JSON.stringify({ haettu: Date.now(), saa: paketti.data })); } catch (e) { /* täynnä tms, jatketaan silti */ }
    vanhaEl.style.display = 'none';
    segmentti.style.display = 'block';
  } catch (e) {
    console.error('Ruorin säädatan haku epäonnistui:', e.message);
    let vanhin = null;
    try { vanhin = JSON.parse(localStorage.getItem(SAA_VIIMEISIN_KEY) || 'null'); } catch (e2) { /* korruptoitunut, ei näytettävää */ }
    if (vanhin && piirraRuoriSaaSisalto(vanhin.saa)) {
      vanhaEl.textContent = 'Päivitetty ' + saaIanTeksti(vanhin.haettu);
      vanhaEl.style.display = 'block';
      segmentti.style.display = 'block';
    } else {
      segmentti.style.display = 'none';
    }
  }
}
