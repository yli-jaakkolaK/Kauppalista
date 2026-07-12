-- BUGIKORJAUS (2026-07-13): "Poista lista" ei tehnyt mitään näkyvää —
-- vahvistusdialogi kysyi, käyttäjä hyväksyi, mutta lista ei koskaan
-- kadonnut. Toistettavissa MILLÄ TAHANSA listalla jolla on edes yksi
-- events-rivi (esim. listan luontihetkellä kirjattu 'created'-tapahtuma —
-- eli käytännössä JOKAISELLA appin kautta luodulla listalla).
--
-- JUURISYY: `events`-taululla on RLS päällä (sql/003) mutta EI KOSKAAN ole
-- ollut delete-policya — vain events_select (003/005/006) ja events_insert
-- (003). `script.js`:n `poistaLista()` poistaa oikeassa FK-turvallisessa
-- järjestyksessä (tuotteet -> events -> lists), mutta events-poisto
-- HILJAA EI POISTANUT YHTÄÄN RIVIÄ (RLS suodattaa rivit puuttuvan policyn
-- takia, ei virhettä, vain 0 riviä poistuu). Sen jälkeen `lists`-rivin
-- poisto KAATUU foreign key -rajoitteeseen (events.list_id viittaa yhä
-- olemassa olevaan listaan) — TÄMÄ virhe kyllä tulee Supabasesta, mutta
-- script.js vain `console.error`:si sen eikä koskaan näyttänyt käyttäjälle
-- mitään. Käyttäjän näkökulmasta: "ei tapahdu mitään", ei koskaan syytä.
--
-- KORJAUS TÄSSÄ TIEDOSTOSSA: lisää puuttuva events_delete-policy, SAMALLA
-- näkyvyysehdolla kuin events_select (owns_list/list_visibility/
-- is_list_member -apufunktiot, ks. sql/005) — kuka tahansa joka näkee
-- listan (omistaja, jaettu, tai jäsen) saa myös poistaa sen tapahtumat,
-- sama periaate kuin tuotteet_all-policyssa jo on tuotteille.
--
-- SOVELLUSKOODIN puoli (poistaLista() lopettaa nyt AINA selkokieliseen
-- virheeseen jos jokin vaihe epäonnistuu, ei enää hiljaa jatka) on
-- korjattu ERIKSEEN script.js:ään, ei tässä SQL-tiedostossa.
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

drop policy if exists "events_delete" on events;
create policy "events_delete" on events for delete using (
  (list_id is null and user_id = auth.uid())
  or owns_list(list_id)
  or (auth.uid() is not null and list_visibility(list_id) = 'shared')
  or is_list_member(list_id)
);

commit;
