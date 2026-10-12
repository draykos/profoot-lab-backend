# Piano alimentare

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/piano-alimentare/content-types/piano-alimentare/schema.json` (+ factory
  `controllers/routes/services`) e `src/components/dieta/pasto.json`
- UID: `api::piano-alimentare.piano-alimentare` · tabella `piani_alimentari` · `draftAndPublish: false`
- Component: `dieta.pasto`, `repeatable: true` sul campo `pasti` — **decisione presa: component**,
  come da proposta (niente content-type `pasto` separato)
- Tabelle DB verificate: `piani_alimentari`, `piani_alimentari_atleta_lnk`,
  `piani_alimentari_cmps` (join table del component), `components_dieta_pasti`
- `pasti` **non `required`** a livello di schema (un piano può nascere senza pasti e crescere dopo)
- **Nessun target memorizzato** (2026-10-12): rimossi `obiettivoKcal`, `targetCarboidratiG`,
  `targetProteineG`, `targetGrassiG`. Kcal e macro totali mostrati in UI sono la **somma dei
  relativi valori dei pasti**, calcolata lato frontend.

## Endpoint creato

`GET /api/piano-alimentare/me` — stesso pattern degli altri privati: risolve l'atleta via
`findForUser`, filtra per `atleta.id`, ordina per `validoDal` decrescente, fa `populate` del component `pasti` e, annidato, di `giorni`. **Ritorna tutti i piani**,
non solo quello "attivo": la logica per stabilire qual è il piano corrente (uno solo alla volta vs
piani per giorno-tipo — decisione ancora aperta sotto) resta al client per ora. Permessi seedati in
`bootstrap()`: solo `api::piano-alimentare.piano-alimentare.me`.

Verificato: `GET /api/piani-alimentari` e `GET /api/piano-alimentare/me` senza token → `403` ✅.

## Scopo

Piano nutrizionale giornaliero dell'atleta: obiettivo calorico, macro e lista pasti con orari.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/diet.tsx` — array `meals`: `time` ("07:30"), tipo
  (`breakfast`/`snack`/`lunch`/`pre`/`dinner`), `dishKey` (descrizione piatto), `kcal`,
  `macros {c, p, f}` in grammi, `active`
- header: "Fabbisogno oggi" (somma kcal dei pasti = 2450), "Obiettivo" 2500, barre macro
  Carbo 267g / Proteine 129g / Grassi 66g
- `profoot-lab-frontend/src/routes/index.tsx` — "Dieta • 5 pasti • 2.450 kcal"

## UID e kind

- UID previsto: `api::piano-alimentare.piano-alimentare`
- Kind: `collectionType`
- Draft & Publish: **off** (valutare)

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `atleta` | relation manyToOne → `api::atleta.atleta` | sì | |
| `validoDal` | date | sì | un piano attivo per data |
| `validoAl` | date | no | null = ancora valido |
| `note` | text | no | |
| `pasti` | component repeatable `dieta.pasto` | sì | vedi sotto |

### Component `dieta.pasto`

| Campo | Tipo | Obbligatorio | Note |
| --- | --- | --- | --- |
| `orario` | time | sì | "07:30" |
| `tipo` | enumeration | sì | `colazione`, `spuntino`, `pranzo`, `pre_allenamento`, `cena` |
| `descrizione` | text | sì | "Porridge d'avena, mirtilli, mandorle" |
| `kcal` | integer | sì | |
| `carboidratiG` | integer | no | |
| `proteineG` | integer | no | |
| `grassiG` | integer | no | |
| `giorni` | component `dieta.giorni-settimana` (non ripetibile) | no | giorni della settimana tipo in cui il pasto si ripete; assente = tutti i giorni |

### Component `dieta.giorni-settimana`

Sette boolean `lun`, `mar`, `mer`, `gio`, `ven`, `sab`, `dom` (tutti `required`, default `true`): nel
backoffice appaiono come una fila di toggle. Strapi non ha un campo multi-select nativo, da qui il
component al posto di un enum multiplo.

**Settimana tipo:** il piano è una settimana che si ripete per tutto il periodo `validoDal`–`validoAl`;
ogni pasto indica in quali giorni compare. Per un giorno con menu alternativi (es. due pranzi diversi)
si inseriscono più pasti con lo stesso `tipo` e giorni complementari. Il frontend mostra oggi + i 6
giorni successivi, filtrando i pasti per giorno della settimana.

`fabbisognoKcal` e i totali macro mostrati in UI = somma di `pasti[].kcal` / `carboidratiG` /
`proteineG` / `grassiG` → calcolati lato frontend, non memorizzati.

## Relazioni

- `atleta` → manyToOne

## Isolamento

**Privato.** Solo il piano del proprio `atleta`. Esporre via `/users/me` populate o `findOne` con
policy di ownership; mai `find` aperto.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `me` (custom) | sì — self-scoped, sostituisce `findOne` |
| `find`, `findOne`, `create`, `update`, `delete` | no — mai aperti |

## Decisioni aperte

- Un solo piano attivo per volta, o piani diversi per giorno-tipo (giorno partita / riposo /
  doppia seduta)? **Ancora aperto** — per ora `me` ritorna tutti i piani, la scelta è del client.
- ~~`pasti` come component vs content-type separato~~ — **chiuso: component** (2026-09-05).
- ~~Target macro memorizzati o derivati dalla somma dei pasti?~~ — **chiuso: derivati** dalla somma
  dei pasti, lato frontend (2026-10-12).
- L'atleta segna i pasti come consumati? (serve stato per-pasto per-giorno → non un component
  statico)

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `diet.tsx`.
- **2026-09-05** — creato lo schema `api::piano-alimentare.piano-alimentare` e il component
  `dieta.pasto` (decisione chiusa: component, non content-type separato). Creato l'endpoint `me` e
  seedato il permesso per il ruolo Atleta.
- **2026-10-12** — rimossi `obiettivoKcal`, `targetCarboidratiG`, `targetProteineG`,
  `targetGrassiG`: i totali sono la somma dei pasti, calcolata dal frontend. L'endpoint `me` ora fa
  `populate` di `pasti` (prima i pasti non venivano restituiti).
- **2026-10-12** — aggiunto il component `dieta.giorni-settimana` (campo `giorni` su `dieta.pasto`):
  il piano diventa una settimana tipo ripetuta. Pasti senza `giorni` valgono per tutti i giorni.
  L'endpoint `me` popola `pasti.giorni`.
