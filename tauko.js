// Taukolista (sql/152, 2026-08-31) — Katrin muistelema Sung/PACER-
// keskustelu "Hytti V5" (kysymykset 146-158), ei koskaan tallennettu
// mihinkään repon dokumenttiin ennen tätä — teoreettinen perusta
// sung-metodi.md §21:ssa (Lepo ja palautuminen). Ensimmäinen vaihe
// (Katrin oma valinta: "Taukolista first") kolmesta/neljästä osasta —
// push-pohjainen 30-45min-rytmimuistutus, kalenteriin etukäteen
// suunnitellut isot palautumisankkurit, ja 2h-paikallaanolo-/punaisen-
// päivän-muistutukset odottavat vielä.
//
// Malli: satunnaisarvonta joka painottaa pisimpään ehdottamatta ollutta
// (viimeksi_ehdotettu_at), EI tekoälyä ("Satama pulls from without AI").
// "Tein tämän" on pelkkä täppäys (tauko_kirjaukset), ei kestoa — Katrin
// oma päätös: "a tick that a break was taken is enough, no minutes".

let taukoNykyinenEhdotus = null;

async function haeSeuraavaTaukoehdotus() {
  const { data, error } = await db.from('taukolista').select('id, teksti, viimeksi_ehdotettu_at')
    .eq('owner_id', currentUserId).order('viimeksi_ehdotettu_at', { ascending: true, nullsFirst: true });
  if (error) {
    console.error('Taukolistan haku epäonnistui:', error);
    return null;
  }
  if (!data || data.length === 0) return null;
  // Arvotaan pisimpään ehdottamattomien joukosta (puolet listasta, väh. 1)
  // — painottaa vaihtelua ilman monimutkaista pisteytystä.
  const ehdokkaat = data.slice(0, Math.max(1, Math.ceil(data.length / 2)));
  return ehdokkaat[Math.floor(Math.random() * ehdokkaat.length)];
}

async function piirraTaukoEhdotus() {
  const teksti = document.getElementById('tauko-ehdotus-teksti');
  const tyhjaSelite = document.getElementById('tauko-tyhja-selite');
  const toiminnot = document.querySelectorAll('#tauko-toinen-btn, #tauko-tein-btn');
  teksti.textContent = 'Haetaan ehdotusta...';
  taukoNykyinenEhdotus = await haeSeuraavaTaukoehdotus();
  if (!taukoNykyinenEhdotus) {
    teksti.style.display = 'none';
    tyhjaSelite.style.display = 'block';
    toiminnot.forEach(function(b) { b.style.display = 'none'; });
    return;
  }
  teksti.style.display = 'block';
  tyhjaSelite.style.display = 'none';
  toiminnot.forEach(function(b) { b.style.display = ''; });
  teksti.textContent = taukoNykyinenEhdotus.teksti;
  db.from('taukolista').update({ viimeksi_ehdotettu_at: new Date().toISOString() }).eq('id', taukoNykyinenEhdotus.id)
    .then(function(res) { if (res.error) console.error('Taukoehdotuksen ajan päivitys epäonnistui:', res.error); });
}

document.getElementById('tauko-avaa-btn').addEventListener('click', function() {
  document.getElementById('tauko-overlay').style.display = 'flex';
  piirraTaukoEhdotus();
});

document.getElementById('tauko-toinen-btn').addEventListener('click', piirraTaukoEhdotus);

document.getElementById('tauko-tein-btn').addEventListener('click', async function() {
  if (!taukoNykyinenEhdotus) return;
  const { error } = await db.from('tauko_kirjaukset').insert({ owner_id: currentUserId, taukolista_id: taukoNykyinenEhdotus.id });
  if (ilmoitaKirjoitusvirheesta(error, 'Tauon kirjaus')) return;
  naytaIlmoitus('☕ Hyvä, tauko kirjattu');
  document.getElementById('tauko-overlay').style.display = 'none';
});

document.getElementById('tauko-sulje-btn').addEventListener('click', function() {
  document.getElementById('tauko-overlay').style.display = 'none';
});
