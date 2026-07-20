-- Opintopolku VAIHE 1 (2026-07-21, ks. KONSEPTIKIRJA.md 4.11 — HUOM: 4.11
-- puuttuu tästä repon KONSEPTIKIRJA.md:stä kirjoitushetkellä, tämä migraatio
-- rakennettu suoraan Katrin chat-pyynnön verbatim-spesifikaatiosta, ks.
-- muistiinpanot.md "Opintopolku" -osio täydelle kuvaukselle ja huomiolle
-- että 4.11 pitää vielä kirjoittaa konseptikirjaan).
--
-- Uusi yksityinen opiskelumoduuli Oman Hytin sisällä — SAMA "vain omistaja
-- näkee" -RLS-periaate kuin hytti_kortit/hytti_rivit (sql/016), EI
-- Katri-kohtaista kovakoodausta: kuka tahansa kirjautunut käyttäjä saa oman
-- opintopolkunsa, aivan kuten Hytti muutenkin on jo per-käyttäjä.
--
-- Kolme uutta taulua, ei sekoiteta hytti_kortit/hytti_rivit-rakenteeseen
-- (PACER-vaihetila + deadline-malli eroaa riittävästi geneerisestä
-- muistiinpano/tehtävä-rivistä, sama peruste kuin Toistuva muistutus/
-- Keskusteluteema saivat omat taulunsa aiemmin):
--
-- opinto_kurssit: yksi rivi = yksi kurssi. materiaali on VAIN kevyt teksti-/
--   linkkikenttä (Taso 1 -rajaus, ks. Katrin oma huomio "älä rakenna raskasta
--   tiedostovarastoa vaiheessa 1") — ei tiedostonlatausinfraa.
-- opinto_aiheet: kuuluu kurssiin, PACER-vaihetila enumina (priming = oletus,
--   ei vielä kosketettu; encoding/retrieval = aktiivista työtä; reference =
--   arkistotieto; yllapito = kertausvaiheessa). VAIHE 1:ssä käsin vaihdettava,
--   EI automaattista etenemistä (moottori on Vaihe 2).
-- opinto_deadlinet: kuuluu JOKO kurssiin ETTÄ aiheeseen (ei molempiin, ei
--   ei-kumpaakaan — check-rajoite pakottaa täsmälleen yhden). tyyppi koe/
--   palautus. Talletetaan Vaihe 1:ssä, HYÖDYNNETÄÄN vasta Vaihe 2:ssa
--   (kolmen voiman moottori/ohjaava ikkuna).
--
-- Aja tämä Supabasen SQL Editorissa.

begin;

create table if not exists opinto_kurssit (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  materiaali text,
  sort_order double precision not null default extract(epoch from clock_timestamp()),
  created_at timestamptz not null default now()
);

create table if not exists opinto_aiheet (
  id bigint generated always as identity primary key,
  kurssi_id bigint not null references opinto_kurssit(id) on delete cascade,
  name text not null,
  vaihe text not null default 'priming' check (vaihe in ('priming', 'encoding', 'retrieval', 'reference', 'yllapito')),
  sort_order double precision not null default extract(epoch from clock_timestamp()),
  created_at timestamptz not null default now()
);

create table if not exists opinto_deadlinet (
  id bigint generated always as identity primary key,
  kurssi_id bigint references opinto_kurssit(id) on delete cascade,
  aihe_id bigint references opinto_aiheet(id) on delete cascade,
  pvm date not null,
  tyyppi text not null check (tyyppi in ('koe', 'palautus')),
  created_at timestamptz not null default now(),
  constraint opinto_deadlinet_tasmalleen_yksi check (
    ((kurssi_id is not null)::int + (aihe_id is not null)::int) = 1
  )
);

alter table opinto_kurssit enable row level security;
alter table opinto_aiheet enable row level security;
alter table opinto_deadlinet enable row level security;

drop policy if exists "opinto_kurssit_all" on opinto_kurssit;
create policy "opinto_kurssit_all" on opinto_kurssit for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- aiheet eivät kanna omaa owner_id:tä — omistajuus tulee aina kurssin kautta
-- (sama malli kuin hytti_rivit, ks. sql/016).
drop policy if exists "opinto_aiheet_all" on opinto_aiheet;
create policy "opinto_aiheet_all" on opinto_aiheet for all
  using (exists (select 1 from opinto_kurssit k where k.id = opinto_aiheet.kurssi_id and k.owner_id = auth.uid()))
  with check (exists (select 1 from opinto_kurssit k where k.id = opinto_aiheet.kurssi_id and k.owner_id = auth.uid()));

-- deadlinet: omistajuus tulee JOMMANKUMMAN vanhemman (kurssi TAI aihe) kautta.
drop policy if exists "opinto_deadlinet_all" on opinto_deadlinet;
create policy "opinto_deadlinet_all" on opinto_deadlinet for all
  using (
    exists (select 1 from opinto_kurssit k where k.id = opinto_deadlinet.kurssi_id and k.owner_id = auth.uid())
    or exists (select 1 from opinto_aiheet a join opinto_kurssit k on k.id = a.kurssi_id where a.id = opinto_deadlinet.aihe_id and k.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from opinto_kurssit k where k.id = opinto_deadlinet.kurssi_id and k.owner_id = auth.uid())
    or exists (select 1 from opinto_aiheet a join opinto_kurssit k on k.id = a.kurssi_id where a.id = opinto_deadlinet.aihe_id and k.owner_id = auth.uid())
  );

commit;
