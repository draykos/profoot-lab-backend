# Partita

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/partita/content-types/partita/schema.json` (+ factory `controllers/routes/services`)
- UID: `api::partita.partita` · tabella `partite` · `draftAndPublish: false`
- Tabelle DB verificate: `partite`
- **Decisione presa (rivista il 2026-09-18):** `squadraCasa`/`squadraTrasferta` sono campi
  **`string`** liberi. Erano relazioni manyToOne verso `api::squadra.squadra` dal 2026-09-05, ma
  quel content-type è stato rimosso (vedi [squadra.md](squadra.md) → Changelog) perché non ancora
  consumato da nessuna schermata reale.
- `competizione` ed `stato` come enum, come da proposta.
- Permessi Atleta seedati in `bootstrap()`: `find`, `findOne` (calendario condiviso)
- `GET /api/partite` senza token → `403` ✅

---

## Scopo

Incontro del calendario: avversari, data/ora, stadio, competizione. Alimenta il calendario partite e
la card "prossima partita" in dashboard.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/matches.tsx` — array `upcoming`: `home`, `away`, `date`, `time`
  ("20:45"), `venue` ("San Siro"), `comp` ("Serie A", "Champions"); la prima è "Prossima partita"
- `profoot-lab-frontend/src/routes/index.tsx` — "Milano FC vs Roma", "Domenica • 15:30 • San Siro"

## UID e kind

- UID previsto: `api::partita.partita`
- Kind: `collectionType`
- Draft & Publish: **off**

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `squadraCasa` | string | sì | coerente col mock (`matches.tsx`), che usa già stringhe |
| `squadraTrasferta` | string | sì | |
| `dataOra` | datetime | sì | il frontend deriva giorno + ora |
| `stadio` | string | no | se assente, usa `squadraCasa.stadio` |
| `competizione` | enumeration | no | `serie_a`, `champions`, `coppa_italia`, `amichevole` (estendibile) o string |
| `stato` | enumeration | no | `in_programma`, `giocata`, `rinviata` |
| `golCasa` | integer | no | per partite giocate (fuori scope mock attuale) |
| `golTrasferta` | integer | no | |

"Prossima partita" = prima `partita` con `dataOra >= now()` ordinata per `dataOra`.

## Relazioni

- nessuna (`squadraCasa`/`squadraTrasferta` sono campi `string`, vedi sopra)

## Isolamento

**Condiviso.** Calendario visibile a tutti gli utenti autenticati. (In futuro: `convocazione`
per-atleta con minutaggio previsto/effettivo.)

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `find`, `findOne` | sì |
| `create`, `update`, `delete` | no |

## Decisioni aperte

- Tracciare convocazione / disponibilità / minutaggio del singolo atleta per partita?
- `competizione` enum vs content-type `competizione` con logo e stagione.
- Serve la nozione di "stagione"?

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `matches.tsx` e `index.tsx`.
- **2026-09-05** — creato lo schema `api::partita.partita`. Decisione chiusa: relazioni verso
  `squadra` invece di stringhe libere. Seedati i permessi di lettura per il ruolo Atleta.
- **2026-09-18** — decisione ribaltata: `squadraCasa`/`squadraTrasferta` tornano a essere **stringhe
  libere**. Il content-type `squadra` è stato rimosso (mai consumato da `/matches`, ancora mock a
  stringhe) — vedi [squadra.md](squadra.md) → Changelog.
