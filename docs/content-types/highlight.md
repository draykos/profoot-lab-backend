# Highlight

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/highlight/content-types/highlight/schema.json` (+ factory
  `controllers/routes/services`)
- UID: `api::highlight.highlight` · tabella `highlights` · `draftAndPublish: true`
- Tabelle DB verificate: `highlights`, `highlights_atleta_lnk`, `highlights_avversario_lnk`,
  `highlights_partita_lnk`
- **Decisione presa:** `avversario` come **relazione** verso `api::squadra.squadra` (non stringa) —
  coerente con la stessa scelta fatta per `partita.squadraCasa`/`squadraTrasferta`
- `clip` come **media** (non URL esterno), `required: true`, limitato a `videos`

## Endpoint creato

`GET /api/highlight/me[?inEvidenza=true|false]` — stesso pattern degli altri privati: risolve
l'atleta via `findForUser`, filtra per `atleta.id`, ordina per `data` decrescente, popola
`copertina`/`clip`/`avversario`. Filtro opzionale `inEvidenza` per isolare la "top clip". Permessi
seedati in `bootstrap()`: solo `api::highlight.highlight.me`.

Verificato: `GET /api/highlights` e `GET /api/highlight/me` senza token → `403` ✅.

## Scopo

Clip video dell'atleta dalle partite: gol, assist, azioni difensive.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/highlights.tsx` — array `clips`: titolo ("Gol di destro vs Roma"),
  `date` ("18 feb"), `dur` ("0:24"), `cover` (immagine)
- la prima clip è la "Top clip" in evidenza

## UID e kind

- UID previsto: `api::highlight.highlight`
- Kind: `collectionType`
- Draft & Publish: **on**

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `atleta` | relation manyToOne → `api::atleta.atleta` | sì | |
| `titolo` | string | sì | "Gol di destro vs Roma" |
| `data` | date | sì | |
| `durataSecondi` | integer | no | il mock mostra "0:24" |
| `tipo` | enumeration | no | `gol`, `assist`, `azione_difensiva`, `dribbling`, `parata` |
| `avversario` | string **oppure** relation → `api::squadra.squadra` | no | "vs Roma" |
| `partita` | relation manyToOne → `api::partita.partita` | no | collega la clip alla partita |
| `copertina` | media (single, images) | no | `cover` nel mock |
| `clip` | media (single) **oppure** `clipUrl` string | sì | |
| `inEvidenza` | boolean | no | forza la "Top clip"; altrimenti la più recente |

## Relazioni

- `atleta` → manyToOne
- `partita` → manyToOne (opzionale)
- `avversario` → manyToOne su `squadra` (opzionale)

## Isolamento

**Privato.** Ogni atleta vede solo le proprie clip. `find` filtrato per ownership.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `me` (custom) | sì — self-scoped, sostituisce `find`/`findOne` |
| `find`, `findOne`, `create`, `update`, `delete` | no — mai aperti |

## Decisioni aperte

- L'atleta può condividere una clip (link pubblico temporaneo)? Il mock ha un'icona play ma nessun
  share.
- ~~`avversario` stringa vs relazione~~ — **chiuso: relazione** verso `squadra` (2026-09-05).
- Le clip sono caricate dallo staff o generate da un sistema di video analysis esterno?

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `highlights.tsx`.
- **2026-09-05** — creato lo schema `api::highlight.highlight` (decisione chiusa: `avversario`
  come relazione). Creato l'endpoint `me` (con filtro opzionale `?inEvidenza=`) e seedato il
  permesso per il ruolo Atleta.
