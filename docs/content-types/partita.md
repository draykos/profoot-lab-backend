# Partita

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/partita/content-types/partita/schema.json` (+ factory `controllers/routes/services`)
- UID: `api::partita.partita` · tabella `partite` · `draftAndPublish: false`
- Tabelle DB verificate: `partite`, `partite_squadra_casa_lnk`, `partite_squadra_trasferta_lnk`
- **Decisione presa:** `squadraCasa`/`squadraTrasferta` sono **relazioni** manyToOne one-way verso
  `api::squadra.squadra` (non stringhe) — coerente con l'aver già creato `squadra`. Nessuna relazione
  inversa su `squadra` (niente `partiteCasa`/`partiteTrasferta`): si può aggiungere se servirà
  interrogare "tutte le partite di una squadra".
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
| `squadraCasa` | relation manyToOne → `api::squadra.squadra` **oppure** string | sì | il mock usa stringhe |
| `squadraTrasferta` | relation manyToOne → `api::squadra.squadra` **oppure** string | sì | |
| `dataOra` | datetime | sì | il frontend deriva giorno + ora |
| `stadio` | string | no | se assente, usa `squadraCasa.stadio` |
| `competizione` | enumeration | no | `serie_a`, `champions`, `coppa_italia`, `amichevole` (estendibile) o string |
| `stato` | enumeration | no | `in_programma`, `giocata`, `rinviata` |
| `golCasa` | integer | no | per partite giocate (fuori scope mock attuale) |
| `golTrasferta` | integer | no | |

"Prossima partita" = prima `partita` con `dataOra >= now()` ordinata per `dataOra`.

## Relazioni

- `squadraCasa`, `squadraTrasferta` → manyToOne (se si adotta [squadra.md](squadra.md))

## Isolamento

**Condiviso.** Calendario visibile a tutti gli utenti autenticati. (In futuro: `convocazione`
per-atleta con minutaggio previsto/effettivo.)

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `find`, `findOne` | sì |
| `create`, `update`, `delete` | no |

## Decisioni aperte

- Relazioni `squadra` o stringhe libere per casa/trasferta? (dipende da [squadra.md](squadra.md))
- Tracciare convocazione / disponibilità / minutaggio del singolo atleta per partita?
- `competizione` enum vs content-type `competizione` con logo e stagione.
- Serve la nozione di "stagione"?

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `matches.tsx` e `index.tsx`.
- **2026-09-05** — creato lo schema `api::partita.partita`. Decisione chiusa: relazioni verso
  `squadra` invece di stringhe libere. Seedati i permessi di lettura per il ruolo Atleta.
