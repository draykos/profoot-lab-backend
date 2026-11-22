# Test fisico

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/test-fisico/content-types/test-fisico/schema.json` (+ factory
  `controllers/routes/services`)
- UID: `api::test-fisico.test-fisico` · tabella `test_fisici` · `draftAndPublish: false`
- Tabelle DB verificate: `test_fisici`, `test_fisici_atleta_lnk`, `test_fisici_tipo_test_lnk`
- **Decisione presa (2026-11-22):** il tipo di test è una relazione `tipoTest` verso il catalogo
  [`tipo-test`](tipo-test.md) (sostituisce l'enum fisso `tipo` del 2026-09-05). `unita` e
  `direzioneMigliora` sono proprietà del tipo, non più della singola misurazione.
- Inserimento dal backoffice: pagina admin "Inserimento test" (vedi
  `docs/superpowers/specs/2026-11-22-test-fisico-data-entry-design.md`).

## Endpoint creato

`GET /api/test-fisico/me[?tipo=squat_jump]` — stesso pattern di `allenamento.me`: risolve l'atleta
via `strapi.service('api::atleta.atleta').findForUser(userId)`, filtra per `atleta.id`, ordina per
`data` **ascendente** (comodo per il grafico trend). `tipo` è un filtro opzionale sul **`codice`**
del catalogo (`tipoTest.codice`); nessun altro filtro/populate accettato dal client. Ogni elemento
ha `tipoTest` popolato con `nome`, `codice`, `unita`, `direzioneMigliora`.

Permessi seedati in `bootstrap()`: `api::test-fisico.test-fisico.me` per il ruolo Atleta — niente
`find`/`findOne` (dato privato). In più `find`/`findOne` sul catalogo `tipo-test` (dato condiviso):
senza, la sanitizzazione dell'output toglie `tipoTest` dalla risposta di `me`.

Verificato: `GET /api/test-fisici` e `GET /api/test-fisico/me` senza token → `403` ✅.
Verificato 2026-11-22 (locale): `me` con token → misurazioni con `tipoTest` popolato; `?tipo=cmj` →
solo CMJ; `?tipo=inesistente` → `[]` ✅.

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
| `tipoTest` | relation manyToOne → `api::tipo-test.tipo-test` | sì (imposto dalla pagina admin) | nome, unità e direzione di miglioramento vengono dal tipo |
| `valore` | decimal | sì | nell'unità del tipo |
| `data` | date | sì | ordina il trend |
| `note` | text | no | |

Il "delta vs prec." e la percentuale sono **calcolati** confrontando le due misurazioni più recenti
dello stesso `tipoTest` per lo stesso `atleta` — non memorizzati.

## Relazioni

- `atleta` → manyToOne
- `tipoTest` → manyToOne verso `tipo-test` (inverso `tipo-test.testFisici`)

## Isolamento

**Privato.** Solo le misurazioni del proprio `atleta`. Serve controller/policy che filtra per
`atleta.user.id`; il grafico trend è una query `find` ordinata per `data` **già filtrata**.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `find`, `findOne` | sì — **con policy di ownership** (il trend richiede `find`) |
| `create`, `update`, `delete` | no |

## Decisioni aperte

- ~~Enum `tipo` vs content-type `tipo-test`~~ — **chiuso: catalogo** (2026-11-22).
- ~~`direzioneMigliora` esplicito o derivato~~ — **chiuso: dal tipo di test** (2026-11-22).
- Serve un raggruppamento "sessione di test" (una data, molti test insieme) per la UI? Oggi il mock
  li tratta come righe indipendenti.
- Valori di riferimento/benchmark per ruolo da mostrare come confronto?

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `test.tsx`.
- **2026-09-05** — creato lo schema `api::test-fisico.test-fisico` (decisione chiusa: enum `tipo`
  fisso). Creato l'endpoint `me` (con filtro opzionale `?tipo=`) e seedato il permesso per il ruolo
  Atleta.
- **2026-11-22** — l'enum `tipo` diventa la relazione `tipoTest` verso il nuovo catalogo
  [`tipo-test`](tipo-test.md); rimossi `tipo`, `unita`, `direzioneMigliora` (nessun dato in locale né
  in produzione, nessuna migration). `me`: `?tipo=` filtra su `tipoTest.codice` e `tipoTest` è
  popolato; aggiunto al ruolo Atleta `find`/`findOne` sul catalogo.
