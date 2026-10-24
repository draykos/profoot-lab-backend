# Calendario partite

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/calendario-partite/content-types/calendario-partite/schema.json` (+ factory
  `controllers/routes/services`) e `src/components/calendario/partita.json`
- UID: `api::calendario-partite.calendario-partite` · tabella `calendari_partite` ·
  `draftAndPublish: false`
- Component: `calendario.partita`, `repeatable: true` sul campo `partite` — stesso schema di
  backoffice di `piano-alimentare` (scegli l'atleta, poi aggiungi l'elenco delle partite)
- **Un solo calendario per atleta**: relazione `oneToOne` ↔ `atleta.calendarioPartite`
- Sostituisce il vecchio catalogo condiviso `api::partita.partita` (vedi [partita.md](partita.md))

## Endpoint creato

`GET /api/calendario-partite/me` — stesso pattern degli altri privati: risolve l'atleta via
`findForUser`, prende il suo calendario, popola `partite` e le **ordina per `dataOra` crescente**
lato server (i component ripetibili mantengono l'ordine di inserimento in admin, non cronologico).

Risposta: `{ data: Partita[] }` — direttamente l'array delle partite, non il documento calendario.
Atleta senza calendario → `{ data: [] }`. **Ritorna tutte le partite**, anche quelle già giocate:
la "prossima partita" (prima con `dataOra >= now()`) la sceglie il client.

**Niente campo `stato`** (rimosso il 2026-10-24): lo stato si ricava dalla data — `dataOra` passata
= giocata, futura = in programma. Le partite rinviate non sono gestite.

Permessi seedati in `bootstrap()`: solo `api::calendario-partite.calendario-partite.me`.

## Scopo

Calendario partite del singolo atleta: avversari, data/ora, stadio, competizione. Alimenta
`/matches` e la card "prossima partita" in dashboard.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/matches.tsx` — array `upcoming`: `home`, `away`, `date`, `time`
  ("20:45"), `venue` ("San Siro"), `comp` ("Serie A", "Champions"); la prima è "Prossima partita"
- `profoot-lab-frontend/src/routes/index.tsx` — "Milano FC vs Roma", "Domenica • 15:30 • San Siro"

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `atleta` | relation oneToOne → `api::atleta.atleta` | sì (di fatto) | un calendario per atleta |
| `partite` | component repeatable `calendario.partita` | no | il calendario cresce nel tempo |

### Component `calendario.partita`

| Campo | Tipo | Obbligatorio | Note |
| --- | --- | --- | --- |
| `squadraCasa` | string | no | testo libero |
| `squadraTrasferta` | string | no | testo libero |
| `dataOra` | datetime | sì | il frontend deriva giorno + ora |
| `stadio` | string | no | |
| `competizione` | enumeration | no | `serie_a`, `champions`, `coppa_italia`, `amichevole` |
| `golCasa` | integer ≥ 0 | no | per partite giocate |
| `golTrasferta` | integer ≥ 0 | no | |

## Isolamento

**Privato.** Ogni atleta vede solo il proprio calendario, tramite `me`.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `me` (custom) | sì — self-scoped |
| `find`, `findOne`, `create`, `update`, `delete` | no — mai aperti |

## Decisioni aperte

- Tracciare convocazione / disponibilità / minutaggio del singolo atleta per partita?
- `competizione` enum vs content-type `competizione` con logo e stagione.
- Serve la nozione di "stagione"? (oggi un unico calendario che cresce nel tempo)

## Changelog

- **2026-10-24** — creato `api::calendario-partite.calendario-partite` con il component
  `calendario.partita` (stessi campi della vecchia `partita`), relazione `oneToOne` con `atleta`,
  endpoint `me` e permesso seedato. Rimossi il content-type condiviso `partita` e la relazione
  `highlight.partita` che lo referenziava.
- **2026-10-24** — rimosso il campo `stato` (`in_programma`/`giocata`/`rinviata`) dal component
  `calendario.partita`: lo stato si ricava da `dataOra` (passata = giocata, futura = in
  programma) e le rinviate non si considerano. La colonna `stato` di
  `components_calendario_partite` viene eliminata da Strapi al primo avvio.
