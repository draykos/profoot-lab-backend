# Tipo test

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/tipo-test/content-types/tipo-test/schema.json` (+ factory `controllers/routes/services`)
- UID: `api::tipo-test.tipo-test` · tabella `tipi_test` · `draftAndPublish: false`
- Entry title nel backoffice: `nome` (primo campo string, scelto in automatico da Strapi)

## Scopo

Catalogo dei tipi di test fisico, gestito dall'admin. Ogni misurazione (`test-fisico`) punta a un
tipo, da cui prende nome, unità di misura e direzione di miglioramento. Nuovi tipi si aggiungono dal
Content Manager, senza modifiche di codice né deploy.

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `nome` | string | sì | "Squat jump" — nome mostrato in admin e app |
| `codice` | uid (da `nome`) | sì, unico | `squat_jump` — chiave stabile usata dall'API (`/api/test-fisico/me?tipo=squat_jump`); non cambiarlo dopo l'uso |
| `unita` | enumeration `cm`, `s`, `m` | sì | |
| `direzioneMigliora` | enumeration `su`, `giu` | sì | `giu` = un valore più basso è meglio (sprint) |
| `testFisici` | relation oneToMany → `api::test-fisico.test-fisico` | no | inverso di `test-fisico.tipoTest` |

## Seed

`bootstrap()` (`ensureTipiTest` in `src/index.ts`) crea a ogni avvio i tipi di default **mancanti**
(per `codice`); quelli già presenti non vengono toccati, quindi si possono rinominare dall'admin.

| codice | nome | unità | direzione |
| --- | --- | --- | --- |
| `squat_jump` | Squat jump | cm | su |
| `cmj` | CMJ | cm | su |
| `sprint_20m` | Sprint 20 m | s | giù |
| `sprint_30m` | Sprint 30 m | s | giù |
| `yoyo_ir1` | Yo-Yo IR1 | m | su |
| `illinois` | Illinois agility | s | giù |

Nota: un tipo di default eliminato dall'admin viene ricreato al riavvio successivo.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `find`, `findOne` | sì — catalogo condiviso, sola lettura. Necessario anche perché `tipoTest` sopravviva alla sanitizzazione dell'output di `GET /api/test-fisico/me` |
| `create`, `update`, `delete` | no |

Seedati in `bootstrap()` (`ATLETA_ACTIONS` in `src/index.ts`). Il ruolo Public non ha accesso.

## Changelog

- **2026-11-22** — creato il catalogo, sostituisce l'enum `tipo` di `test-fisico` (vedi
  [test-fisico.md](test-fisico.md)). Seed dei 6 tipi esistenti in `bootstrap()`.
