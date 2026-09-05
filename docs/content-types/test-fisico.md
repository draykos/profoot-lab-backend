# Test fisico

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/test-fisico/content-types/test-fisico/schema.json` (+ factory
  `controllers/routes/services`)
- UID: `api::test-fisico.test-fisico` · tabella `test_fisici` · `draftAndPublish: false`
- Tabelle DB verificate: `test_fisici`, `test_fisici_atleta_lnk`
- **Decisione presa:** `tipo` come **enum fisso** (non content-type `tipo-test` separato) — coerente
  con l'approccio "parti semplice" del resto del modello
- `direzioneMigliora` incluso come campo esplicito e opzionale, come da proposta

## Endpoint creato

`GET /api/test-fisico/me[?tipo=squat_jump]` — stesso pattern di `allenamento.me`: risolve l'atleta
via `strapi.service('api::atleta.atleta').findForUser(userId)`, filtra per `atleta.id`, ordina per
`data` **ascendente** (comodo per il grafico trend). `tipo` è un filtro opzionale sull'enum; nessun
altro filtro/populate accettato dal client.

Permessi seedati in `bootstrap()`: solo `api::test-fisico.test-fisico.me` per il ruolo Atleta —
niente `find`/`findOne` (dato privato).

Verificato: `GET /api/test-fisici` e `GET /api/test-fisico/me` senza token → `403` ✅.

## ⚠️ Stesso incidente di `allenamento`

Anche qui il dev server è andato giù per la finestra transitoria tra la creazione dello schema
(riferisce `atleta.testFisici` via `inversedBy`) e l'aggiunta del lato opposto su `atleta`. Stessa
diagnosi, stesso fix (riavvio manuale), nessun errore di compilazione reale. Vale lo stesso per i
prossimi content-type con relazione verso `atleta`.

---

## Scopo

Singola misurazione di un test di valutazione fisica. Più misurazioni nel tempo per lo stesso tipo
di test compongono il trend mostrato nel grafico.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/test.tsx`:
  - card in evidenza: "Squat Jump" 48,5 cm, serie storica `[42.1, 43.8, 45.0, 44.2, 46.5, 47.1, 48.5]`
    su mesi Mar–Set, delta "+12% vs prec."
  - righe: CMJ Jump 52,1 cm (+3%, 2 giorni fa), Sprint 20m 2,88 s (5 gg), Sprint 30m 4,12 s (5 gg),
    Yo-Yo IR1 2.240 m (12 gg), Illinois Test 15,4 s (18 gg)
- unità viste: `cm`, `s`, `m`

## UID e kind

- UID previsto: `api::test-fisico.test-fisico`
- Kind: `collectionType`
- Draft & Publish: **off**

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `atleta` | relation manyToOne → `api::atleta.atleta` | sì | |
| `tipo` | enumeration | sì | `squat_jump`, `cmj`, `sprint_20m`, `sprint_30m`, `yoyo_ir1`, `illinois` (estendibile) |
| `valore` | decimal | sì | |
| `unita` | enumeration | sì | `cm`, `s`, `m` — deducibile da `tipo`, ma esplicito è più robusto |
| `data` | date | sì | ordina il trend |
| `note` | text | no | |
| `direzioneMigliora` | enumeration | no | `su` / `giu` — se un valore più basso è meglio (sprint); in alternativa dedotto da `tipo` |

Il "delta vs prec." e la percentuale sono **calcolati** confrontando le due misurazioni più recenti
dello stesso `tipo` per lo stesso `atleta` — non memorizzati.

## Alternativa: catalogo `tipo-test`

Invece dell'enum, un content-type `api::tipo-test.tipo-test` con `nome`, `unita`,
`direzioneMigliora`, `descrizione`. Più flessibile se lo staff aggiunge test spesso. Proposta:
**enum** per partire, migrazione a content-type se serve.

## Relazioni

- `atleta` → manyToOne
- eventuale `tipoTest` → manyToOne (se si sceglie il catalogo)

## Isolamento

**Privato.** Solo le misurazioni del proprio `atleta`. Serve controller/policy che filtra per
`atleta.user.id`; il grafico trend è una query `find` ordinata per `data` **già filtrata**.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `find`, `findOne` | sì — **con policy di ownership** (il trend richiede `find`) |
| `create`, `update`, `delete` | no |

## Decisioni aperte

- Enum `tipo` vs content-type `tipo-test`.
- `direzioneMigliora` esplicito o derivato.
- Serve un raggruppamento "sessione di test" (una data, molti test insieme) per la UI? Oggi il mock
  li tratta come righe indipendenti.
- Valori di riferimento/benchmark per ruolo da mostrare come confronto?

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `test.tsx`.
- **2026-09-05** — creato lo schema `api::test-fisico.test-fisico` (decisione chiusa: enum `tipo`
  fisso). Creato l'endpoint `me` (con filtro opzionale `?tipo=`) e seedato il permesso per il ruolo
  Atleta.
