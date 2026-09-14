# Video Coach

**Stato:** ✅ Creato · 🔄 rivisto il 2026-09-14

> Ex **"Modulo mental coach"**. Rinominato in `video-coach` (UID, tabella, rotte, relazione) il
> 2026-09-07: "modulo" non descriveva più "un video al giorno". Vedi Changelog.
>
> **2026-09-14 — revert lato frontend:** la sezione `/mental` (placeholder "in arrivo") resta
> nell'app e **non** è stata sostituita da questa entità. I video di `video-coach` sono mostrati
> in `/training` (video del giorno + storico), oltre che nella card home. Lo schema, l'endpoint
> `me` e i permessi restano quelli descritti in questo file — solo la schermata di destinazione nel
> frontend è cambiata. Vedi Changelog.

## Schema reale creato

- File: `src/api/video-coach/content-types/video-coach/schema.json` (+ factory
  `controllers/routes/services`)
- UID: `api::video-coach.video-coach` · tabella `video_coach` · `draftAndPublish: true`
- **Relazione con `atleta`** (manyToOne) ↔ `atleta.videoCoach` (oneToMany): il video coach è
  **per utente**, un video al giorno per ogni atleta. Non è un catalogo condiviso.
- `video` è l'**URL** del video sull'hosting esterno (`string`, obbligatorio, con validazione
  regex `^https?://[^\s]+$` — deve iniziare con `http://` o `https://` e non contenere spazi).
- `data` (`date`, obbligatorio): giorno del video. Il client deriva "Oggi"/"Ieri".
- `copertina` resta un media upload (immagini), opzionale.

## Endpoint creato

`GET /api/video-coach/me` — `src/api/video-coach/controllers/video-coach.ts` +
`src/api/video-coach/routes/video-coach-me.ts`. Stesso pattern di `allenamento.me` /
`test-fisico.me`: risolve l'atleta dall'utente autenticato via
`strapi.service('api::atleta.atleta').findForUser(userId)`, filtra per `atleta.id`, ordina per `data`
**discendente** (il video di oggi in cima), popola `copertina`, **limitato ai 15 più recenti**
(`limit: 15` fisso lato server, Document Service API — non richiedibile dal client). Nessun altro
filtro/populate/limite accettato dal client.

Permessi seedati in `bootstrap()`: solo `api::video-coach.video-coach.me` per il ruolo Atleta —
**niente `find`/`findOne`** (dato privato per atleta).

## Pulizia post-rinomina (verificata il 2026-09-07)

Avviato Strapi 5.52 dopo la rinomina, controllato lo stato:

- **Permessi orfani**: Strapi ha rimosso da solo `api::modulo-mental-coach.*` da `up_permissions` al
  boot; `bootstrap()` ha seedato `api::video-coach.video-coach.me`. ✅
- **Config content-manager orfana**: la riga `…::api::modulo-mental-coach.modulo-mental-coach` è
  stata rimossa da Strapi; creata quella nuova per `video-coach`. ✅
- **Tabelle orfane**: `moduli_mental_coach` / `moduli_mental_coach_atleta_lnk` **droppate da Strapi**
  (con l'entry di test "Squat Video", persa — dato di prova). Nuove: `video_coach`,
  `video_coach_atleta_lnk`. ✅
- **`mainField` relazione atleta**: la nuova config di `video-coach` era tornata a `nome` — rimessa a
  `nomeCompleto` via `strapi_core_store_settings`. ✅ (richiede riavvio per essere visibile in admin)

## ⚠️ Relazione bidirezionale verso `atleta`

Come per `allenamento` e `test-fisico`, l'aggiunta di `atleta.videoCoach` (lato opposto) e
`video-coach.atleta` avviene in due scritture di file separate: possibile finestra transitoria in cui
il watcher ricarica uno schema prima dell'altro e il dev server va giù. Fix: riavvio manuale.

---

## Scopo

Un video di preparazione mentale al giorno, assegnato dallo staff al singolo atleta (respirazione,
visualizzazione, recupero, gestione dello stress). **La sezione `/mental` resta un placeholder
work-in-progress** (non consuma questa entità); i video sono mostrati in `/training`.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/training.tsx` — video di oggi in evidenza + storico ultimi 7
  giorni idonei, player in modale. Sezione reale dal 2026-09-14 — vedi lo spec di design nel repo
  frontend per il dettaglio di UI/copy aggiornati
- `profoot-lab-frontend/src/routes/index.tsx` — card "video del giorno" in home
- `profoot-lab-frontend/src/routes/mental.tsx` — placeholder "Mental coach", invariato, non legato
  a questa entità
- categorie viste: Pre-partita, Focus, Sonno

## UID e kind

- UID: `api::video-coach.video-coach`
- Kind: `collectionType`
- Draft & Publish: **on** (contenuto curato dallo staff)

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `atleta` | relation manyToOne → `api::atleta.atleta` | sì (di fatto) | `inversedBy: videoCoach`; lo scoping è sempre per atleta |
| `titolo` | string | sì | "Respirazione 4-7-8" |
| `categoria` | enumeration | no | `pre_partita`, `focus`, `sonno`, `stress`, `recupero` (estendibile) |
| `durataMinuti` | integer | no | "5 min" |
| `data` | date | sì | giorno del video; un video al giorno per atleta |
| `video` | string | sì | **URL** del video (hosting esterno). Validazione regex `^https?://[^\s]+$` |
| `copertina` | media (single, images) | no | |

### Storia dei campi

- Prima versione (come "Modulo mental coach"): `descrizione`, `trascrizione`, `ordine`, `audio`,
  `video` come media. Tutti rimossi il 2026-09-07.
- `video`: media → **URL** (`string` + regex `^https?://[^\s]+$`). (Breve parentesi 2026-09-07 in cui
  era stato pensato come GUID senza validazione, poi tornato a URL validato.)
- `ordine` sostituito dall'ordinamento per `data`.

## Assegnazione

**Per singolo atleta.** Un video al giorno per atleta, assegnato dallo staff.

## Relazioni

- `atleta` → manyToOne (lato opposto `atleta.videoCoach`)
- eventuale `autore` → `api::membro-staff.membro-staff` (opzionale, non creato)

## Isolamento

**Privato.** Solo i video del proprio `atleta`, serviti da `GET /api/video-coach/me` con scoping lato
server. Niente `find`/`findOne` per il ruolo Atleta.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `me` (`api::video-coach.video-coach.me`) | sì |
| `find`, `findOne` | no |
| `create`, `update`, `delete` | no |

## Decisioni aperte

- Vincolo di unicità `(atleta, data)` — un solo video per giorno per atleta. Strapi non fa unique
  composto nativamente: validazione in un lifecycle hook `beforeCreate`/`beforeUpdate` se serve.
- `categoria` / `durataMinuti` tenuti opzionali dai mock — confermare che servano davvero.
- Serve tracciare completamento / preferiti / streak dell'atleta?
- ~~La sezione resta "coming soon" nel frontend finché non ci sono video pubblicati per l'atleta?~~
  — **chiuso: sezione reale, con empty state dedicato**, vedi
  `profoot-lab-frontend/docs/superpowers/specs/2026-09-14-video-coach-design.md` (2026-09-14).

## Changelog

- **2026-09-14** — **revert lato frontend**: `/mental` ripristinata come placeholder
  work-in-progress (identica alla versione pre-2026-09-14); la sezione `/video-coach` è stata
  rimossa e i video di questa entità sono ora mostrati in `/training` (video di oggi + storico) e
  nella card "video del giorno" in home. Nessuna modifica allo schema/endpoint/permessi. Durante
  la verifica: le 3 righe di test in `video_coach` avevano tutte `data` nel futuro (15/16
  settembre contro un "oggi" del 14) — per questo non comparivano né in home né altrove, per
  design (`visibleVideos` non mostra mai video futuri). Non è un bug applicativo: correggere le
  date dal pannello admin di Strapi per vederle comparire.
- **2026-09-04** — proposta iniziale dai mock di `mental.tsx` (come "Modulo mental coach").
- **2026-09-05** — creato lo schema `api::modulo-mental-coach.modulo-mental-coach` come catalogo
  condiviso.
- **2026-09-07** — **revisione**: da catalogo condiviso a per-atleta, un video al giorno. Rimossi
  `descrizione`, `trascrizione`, `ordine`, `audio`; aggiunti `data` e relazione `atleta`; creato
  l'endpoint `me`.
- **2026-09-07** — **rinomina** `modulo-mental-coach` → `video-coach` (UID, tabella `video_coach`,
  rotte, relazione `atleta.videoCoach`, permesso `bootstrap`). Doc rinominato da
  `modulo-mental-coach.md`. Pulizia orfani (permessi, config content-manager, tabelle) e re-set del
  `mainField` di `atleta` su `video-coach` gestiti in automatico da Strapi al boot / via core store.
- **2026-09-07** — `video` è un **URL con validazione** (`string`, required, regex
  `^https?://[^\s]+$`). Va richiesta a schema, quindi solo un riavvio del dev server per applicarla.
- **2026-09-14** — implementata la sezione frontend reale (`/video-coach`, ex `/mental`): video del
  giorno in home, lista degli ultimi 7 video idonei (oggi o passati, mai futuri), player in una
  modale Bunny Stream. Endpoint `me` limitato ai 15 risultati più recenti (`limit: 15`, Document
  Service API). Vedi lo spec di design nel repo frontend.
