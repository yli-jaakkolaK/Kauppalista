// Tekoälykehote (SATAMA_SPEKSI.md §7.6, "harjoitustehtävien kolmas lähde":
// kurssin omat tehtävät -> ulkoiset lähteet -> Sataman koostama kopioitava
// prompti ulkoiselle tekoälylle. Ei API-kutsua, ei maksa mitään — spec sanoi
// tämän olevan rivi kannassa per (tyyppi, vaihe); rakennettu tässä JS-
// funktiona saman lopputuloksen, koska koko promptipohja-sisältö täytyi
// joka tapauksessa kirjoittaa nyt ensimmäistä kertaa eikä yksittäisten
// rivien muokkaus vaadi tietokantaa — helpompi säätää suoraan koodista
// Katrin palautteen mukaan. Siirto omaksi tauluksi on mahdollista myöhemmin
// ilman rakennemuutosta jos tarve tulee.
//
// 2026-08-18, Katrin pyyntö: "it should give me copy paste prompt i can
// give ai phrased so that right level of challenge appears from the start
// not 8th grade trigonometry or precalculus" — kalibrointi tulee
// opinto_kurssit.taso_kuvaus-kentästä (uusi, sql/137), EI arvata. Matikka-
// merkintä pakotetaan LaTeXiksi (§7.6:n 17.8.2026-huomio: vapaamuotoinen
// pyyntö "käytä tavallista matikkamerkintää" ei ole luotettava, rakenteel-
// linen $...$-pyyntö on).
//
// SIIRRETTY OMAKSI TIEDOSTOKSEEN (2026-08-30, script.js:n pilkkomisen askel
// 5, ks. muistin project_scriptjs_split_plan) — täysin itsenäinen: yksi
// nappi + yksi puhdas prompti-rakennusfunktio, ei yhtään ulkoista
// kutsupaikkaa script.js:n puolella (tarkistettu grepillä ennen siirtoa).
const OPINTO_AI_VAIHEOHJE = {
  priming: 'Give me ONLY a big-picture overview (5-10 minutes worth) — no deep detail yet. Explain what this topic is about, how it connects to things I likely already know (analogies), and 2-3 questions I should keep in mind once I study it properly later. If you find yourself explaining concepts in precise detail, you have gone too deep — stay at the surface.',
  encoding: 'Teach me this topic properly and thoroughly, building real structural understanding — not a shallow summary. Use concrete examples, connect it to related concepts, and check my understanding by asking me questions as we go instead of just lecturing at me.',
  retrieval: 'I need to drill this with real practice problems, not another explanation. Give me one practice problem at a time at the calibrated difficulty below. After I answer, tell me if I am right, explain any mistake clearly, then give me the next problem — increase difficulty gradually as I get things right.',
  reference: 'Quiz me briefly on the key facts/definitions of this topic, flashcard-style — short, direct questions, one at a time, no long explanations unless I get one wrong.',
  overlearning: 'I already know the basics of this topic well. Give me a genuinely challenging problem or extension that pushes past the standard level — something that would stretch someone who has already mastered the fundamentals.',
};
function rakennaOpintoAiPrompti(aihe, kurssiNimi, kurssiTasoKuvaus) {
  const vaiheohje = OPINTO_AI_VAIHEOHJE[aihe.pero_vaihe] || 'Help me study this topic at a level appropriate for where I am with it.';
  const tasoteksti = kurssiTasoKuvaus
    ? 'Calibrate the difficulty EXACTLY to this level, described by me: "' + kurssiTasoKuvaus + '". Do not default to a generic middle/high-school-basic level, and do not default to full rigorous university/proof-level treatment either — match precisely what is described above.'
    : 'Calibrate to a reasonable intermediate self-study level — ask me what my background is first rather than guessing.';
  return 'Topic: "' + aihe.name + '"' + (kurssiNimi ? ' (course: ' + kurssiNimi + ')' : '') + '\n\n'
    + vaiheohje + '\n\n'
    + tasoteksti + '\n\n'
    + 'If you need to write any mathematical notation, write it in LaTeX using $...$ for inline and $$...$$ for display equations — not plain-text/code notation like x**2 or sqrt(x). This is a strict formatting requirement, not a style preference.';
}
document.getElementById('opinto-tehtava-ai-prompti-btn').addEventListener('click', async function() {
  const aihe = currentOpintoAihe;
  if (!aihe) return;
  let kurssiNimi = null;
  let kurssiTasoKuvaus = null;
  if (aihe.kurssi_id) {
    const { data: kurssi, error } = await db.from('opinto_kurssit').select('name, taso_kuvaus').eq('id', aihe.kurssi_id).maybeSingle();
    if (error) console.error('Kurssin tasokuvauksen haku tekoälykehotetta varten epäonnistui:', error);
    else if (kurssi) { kurssiNimi = kurssi.name; kurssiTasoKuvaus = kurssi.taso_kuvaus; }
  }
  const prompti = rakennaOpintoAiPrompti(aihe, kurssiNimi, kurssiTasoKuvaus);
  try {
    await navigator.clipboard.writeText(prompti);
    naytaIlmoitus('Kehote kopioitu — liitä se tekoälylle');
  } catch (e) {
    console.error('Tekoälykehotteen kopiointi leikepöydälle epäonnistui:', e);
    naytaIlmoitus('Kopiointi epäonnistui — kokeile uudelleen');
  }
});
