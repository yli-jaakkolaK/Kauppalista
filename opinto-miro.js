// Miro-liittymät Hytin opinto-osiossa: kurssitason "yhdistämis"-linkit
// (Exam A/B + yleiskäyttöiset yhteysalueet) ja aihekohtainen Miro-koukku
// (Taulu 1/2 -iframe). SIIRRETTY OMAKSI TIEDOSTOKSEEN (2026-08-30,
// script.js:n pilkkomisen askel 4, ks. muistin project_scriptjs_split_plan)
// — pelkkä fyysinen siirto kahdesta erillisestä script.js:n kohdasta, ei
// sisällöllistä muutosta. Nimetty opinto-miro.js:ksi (ei miro.js) selvyyden
// vuoksi, vaikka vanha api/miro.js (OAuth-automaatio) on jo poistettu
// aiemmin tässä projektissa.
//
// Molemmat funktiot käyttävät script.js:ssä määriteltyjä globaaleja
// (currentOpintoKurssi, currentOpintoAihe, db, ilmoitaKirjoitusvirheesta,
// onkoTaitosolmu) samalla tavalla kuin ennenkin — nämä toimivat
// riippumatta siitä missä <script>-tagissa tämä tiedosto ladataan, koska
// funktioiden RUNGOT suoritetaan vasta myöhemmin (kurssi-/tehtävänäkymää
// avattaessa), ei heti latautuessa. Kaksi ulkoista kutsupaikkaa
// script.js:ssä (avaaOpintoKurssi, avaaOpintoTehtava) toimivat samasta
// syystä.

// Kurssitason "yhdistämis"-Miro-alueet (2026-08-29, Katrin pyyntö) — EI sido
// yhteenkään yksittäiseen aiheeseen, koska nämä nimenomaan yhdistelevät
// useaa aihetta (esim. "Exam A" = topics 1-5 mixed to form connections).
// Sama napauta-lisää/muokkaa-kaava kuin muillakin Miro-linkeillä, mutta
// napin OMA teksti kertoo onko linkki jo asetettu (🔗 vs ➕🔗, sama merkki-
// kaava kuin aihe.materiaali-napilla).
function piirraOpintoKurssinYhteysLinkit() {
  const kurssi = currentOpintoKurssi;
  ['a', 'b'].forEach(function(kirjain) {
    const kentta = 'miro_exam_' + kirjain + '_url';
    const btn = document.getElementById('opinto-kurssi-exam-' + kirjain + '-btn');
    const url = kurssi[kentta];
    btn.textContent = (url ? '🔗' : '➕🔗') + ' Exam ' + kirjain.toUpperCase() + ': yhteydet';
    // Jos linkki on jo asetettu, napautus AVAA sen suoraan (napin pääkäyttö-
    // tarkoitus) — muokkaus/lisäys vain kun sitä ei vielä ole, sama kaava
    // kuin aihe.materiaali-napilla mutta ei pakota prompt-dialogia joka
    // kerta kun linkki on jo kunnossa.
    btn.onclick = url
      ? function() { window.open(url, '_blank', 'noopener'); }
      : function() {
          const uusi = prompt('Miro-linkki — Exam ' + kirjain.toUpperCase() + ' yhteydet:', '');
          if (uusi === null) return;
          const arvo = uusi.trim() || null;
          db.from('opinto_kurssit').update({ [kentta]: arvo }).eq('id', kurssi.id).then(function(res) {
            if (ilmoitaKirjoitusvirheesta(res.error, 'Miro-linkin tallennus')) return;
            kurssi[kentta] = arvo;
            piirraOpintoKurssinYhteysLinkit();
          });
        };
  });
}

// Yleiskäyttöiset kurssitason "yhdistämis"-alueet (sql/150, 2026-08-26) —
// N kappaletta per kurssi, toisin kuin kiinteä kaksipaikkainen Exam A/B
// (yllä), koska esim. Math Roadmapilla on neljä klusteria (Precalculus/
// Calculus/Applied Mathematics/Statistics) eikä yhtään oikeaa tenttiä.
// Sama avaa-tai-kysy-promptilla-kaava kuin Exam A/B -napeissa.
async function piirraOpintoKurssinYhteysalueet() {
  const kurssi = currentOpintoKurssi;
  const cont = document.getElementById('opinto-kurssi-yhteysalueet');
  const res = await db.from('opinto_yhteysalueet').select('id, nimi, miro_url').eq('kurssi_id', kurssi.id).order('sort_order');
  if (res.error || !res.data || res.data.length === 0) {
    cont.innerHTML = '';
    return;
  }
  cont.innerHTML = '';
  res.data.forEach(function(alue) {
    const btn = document.createElement('button');
    btn.className = 'dialog-btn dialog-btn-cancel';
    btn.textContent = (alue.miro_url ? '🔗 ' : '➕🔗 ') + alue.nimi;
    btn.onclick = alue.miro_url
      ? function() { window.open(alue.miro_url, '_blank', 'noopener'); }
      : function() {
          const uusi = prompt('Miro-linkki — ' + alue.nimi + ':', '');
          if (uusi === null) return;
          const arvo = uusi.trim() || null;
          db.from('opinto_yhteysalueet').update({ miro_url: arvo }).eq('id', alue.id).then(function(r) {
            if (ilmoitaKirjoitusvirheesta(r.error, 'Miro-linkin tallennus')) return;
            alue.miro_url = arvo;
            piirraOpintoKurssinYhteysalueet();
          });
        };
    cont.appendChild(btn);
  });
}

// Miro-taulut (uudelleensuunniteltu 2026-08-29, Katrin oma 3-taulu-jako —
// korvaa KOKONAAN aiemman OAuth/Frame-automaation, joka jäi Katrin oman
// Miro-asennusvaiheen taakse eikä koskaan valmistunut, ks. api/miro.js
// [poistettu tässä muutoksessa] ja sql/147):
//   Taulu 1 "Opiskelutaulu" — yksi iso taulu, kurssilla oma Frame, aiheella
//     oma alue Framen sisällä. Kaikki priming+encoding(+overlearning)
//     -muokkaukset. "Elävä muistiinpano", kasvaa ajan myötä.
//   Taulu 2 "Retrieval-taulu" — pysyy tyhjänä lähtötilanteessa, avautuu
//     retrievalissa, siivotaan käsin seuraavaa kertaa varten (ei automaatiota).
//   Taulu 3 "Retrieval-arkisto" — puhdasta Miro-työtä, EI integraatiota.
// Satama tallentaa vain kaksi käsin syötettävää URL-kenttää per aihe
// (opinto_aiheet.miro_opiskeluurl / .miro_retrievalurl, sql/147) — sama
// kevyt "napauta lisätäksesi linkki" -kaava kuin aihe.materiaali-kentällä.
async function paivitaOpintoTehtavaMiroKoukku() {
  const aihe = currentOpintoAihe;
  const kehys = document.getElementById('opinto-tehtava-miro-koukku');
  // Taulu 1/2 ovat kurssikohtaisia (opinto_aiheet-rivejä) — silloilla ei ole
  // kumpaakaan URL-kenttää, piilotetaan aina.
  if (onkoTaitosolmu(aihe)) { kehys.style.display = 'none'; kehys.innerHTML = ''; return; }
  const vaihe = aihe.pero_vaihe;
  let kentta, otsikko;
  if (vaihe === 'priming' || vaihe === 'encoding' || vaihe === 'overlearning') {
    kentta = 'miro_opiskeluurl';
    otsikko = 'Opiskelutaulu (Taulu 1)';
  } else if (vaihe === 'retrieval') {
    kentta = 'miro_retrievalurl';
    otsikko = 'Retrieval-taulu (Taulu 2)';
  } else {
    kehys.style.display = 'none';
    kehys.innerHTML = '';
    return;
  }

  kehys.style.display = 'block';
  kehys.innerHTML = '';

  function avaaLinkinMuokkaus(nykyinenUrl) {
    const uusi = prompt('Miro-linkki — ' + otsikko + ':', nykyinenUrl || '');
    if (uusi === null) return;
    const arvo = uusi.trim() || null;
    db.from('opinto_aiheet').update({ [kentta]: arvo }).eq('id', aihe.id).then(function(res) {
      if (ilmoitaKirjoitusvirheesta(res.error, 'Miro-linkin tallennus')) return;
      aihe[kentta] = arvo;
      if (currentOpintoAihe === aihe) paivitaOpintoTehtavaMiroKoukku();
    });
  }

  // Kurssitason varalinkki (2026-08-29, Katrin huomio: kurssilla on oma
  // Frame Taulu 1:ssä RIIPPUMATTA siitä onko sillä vielä yhtään ainettakaan,
  // ks. sql/148) — VAIN miro_opiskeluurl:lle, retrieval-taulu on joka
  // tapauksessa sama kaikille eikä tarvitse kurssikohtaista oletusta. Haetaan
  // AINA tuoreena aihe.kurssi_id:n perusteella (ei currentOpintoKurssi-
  // globaalia, joka voi olla eri kurssi jos tehtävänäkymä avattiin suoraan
  // Nyt-tabin kortista kurssisivun kautta navigoimatta). Muokkaus kirjoittaa
  // AINA aiheen omaan kenttään (luo tarkemman ohituksen tästä eteenpäin),
  // ei koskaan kurssin kenttään.
  let kurssinOletusarvo = null;
  if (kentta === 'miro_opiskeluurl' && !aihe[kentta] && aihe.kurssi_id) {
    const { data: kurssi } = await db.from('opinto_kurssit').select('miro_opiskeluurl').eq('id', aihe.kurssi_id).maybeSingle();
    kurssinOletusarvo = kurssi ? kurssi.miro_opiskeluurl : null;
    if (currentOpintoAihe !== aihe) return; // navigoitu pois odottaessa
  }
  const url = aihe[kentta] || kurssinOletusarvo;
  if (!url) {
    const lisaaBtn = document.createElement('button');
    lisaaBtn.className = 'link-btn';
    lisaaBtn.textContent = '➕ Lisää Miro-linkki (' + otsikko + ')';
    lisaaBtn.addEventListener('click', function() { avaaLinkinMuokkaus(null); });
    kehys.appendChild(lisaaBtn);
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.className = 'opinto-miro-iframe';
  iframe.src = url;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'fullscreen');
  iframe.setAttribute('allowfullscreen', '');
  kehys.appendChild(iframe);

  const rivi = document.createElement('div');
  rivi.className = 'opinto-miro-toiminnot';
  const avaaLinkki = document.createElement('a');
  avaaLinkki.href = url;
  avaaLinkki.target = '_blank';
  avaaLinkki.rel = 'noopener';
  avaaLinkki.className = 'selite';
  avaaLinkki.textContent = 'Avaa Miro uudessa välilehdessä ↗';
  rivi.appendChild(avaaLinkki);

  const muokkaaBtn = document.createElement('button');
  muokkaaBtn.className = 'link-btn';
  muokkaaBtn.textContent = '✎';
  muokkaaBtn.title = 'Muokkaa Miro-linkkiä (' + otsikko + ')';
  muokkaaBtn.addEventListener('click', function() { avaaLinkinMuokkaus(url); });
  rivi.appendChild(muokkaaBtn);
  kehys.appendChild(rivi);
}
