# Test fisico — catalogo tipi + pagina admin di inserimento

**Data:** 2026-11-22 · **Repo:** `profoot-lab-backend` · **Stato:** design da approvare · **Branch:** `feat/test-fisico-catalogo`

## Perché

Il data entry dei test fisici dal Content Manager standard è scomodo: per ogni misurazione bisogna
riscegliere atleta e tipo, e non si vede a colpo d'occhio lo storico di quella coppia. Inoltre i
tipi di test oggi sono un enum fisso (`squat_jump`, `cmj`, `sprint_20m`, …) ma "saranno molti di
più": ogni tipo nuovo richiederebbe una modifica di codice e un deploy.

Successo = l'admin sceglie atleta + tipo una volta, vede lo storico dal più recente, filtra per
periodo e aggiunge una misurazione inserendo solo data, valore e note.

## Obiettivi

1. Catalogo dei tipi di test gestito dall'admin (content-type `tipo-test`), con unità e direzione di
   miglioramento definite una volta per tipo.
2. Pagina admin "Inserimento test fisici" (voce nel menu laterale del backoffice).
3. L'endpoint `GET /api/test-fisico/me` continua a funzionare, filtrando sul catalogo.

## Non-obiettivi

- Modifica ed eliminazione di misurazioni dalla pagina custom: restano nel Content Manager standard
  (link "Modifica" per riga).
- Grafici, statistiche, confronti tra atleti nella pagina admin.
- Collegare il frontend (la schermata test è ancora un mockup): fuori da questo lavoro.

## Anti-obiettivi

- Nessun bypass dei permessi admin: la pagina deve rispettare il ruolo RBAC di chi la usa (se un
  ruolo non può creare test fisici, non deve poterlo fare nemmeno da qui).
- Niente dipendenza dagli interni non documentati del Content Manager (iniezioni nella lista
  standard), che si romperebbero agli aggiornamenti di Strapi.

## Approcci considerati

| | Approccio | Pro | Contro |
|---|---|---|---|
| **A ✅ scelto** | Pagina admin in `src/admin/app.tsx` (`app.addMenuLink`) che usa le API admin del Content Manager (`/content-manager/collection-types/...`) via `useFetchClient` | Nessuna rotta server nuova; filtri, sort e create già supportati; RBAC admin applicato automaticamente | La pagina dipende dal formato di quelle API (stabili ma interne all'admin) |
| B | Plugin locale (`src/plugins/...`) con pagina + rotte admin proprie | Controllo totale, logica server dedicata | Più codice; permessi da gestire a mano; non serve oggi |
| C | Personalizzare la lista standard con injection zones | Nessuna pagina nuova | Fragile, legato agli interni dell'admin |

Scelto **A** dall'utente: percorso più corto, nessun requisito oggi richiede logica server dedicata.

## Modello dati

### Nuovo content-type `api::tipo-test.tipo-test` (collectionType, `draftAndPublish: false`)

| Campo | Tipo | Obbligatorio | Note |
|---|---|---|---|
| `nome` | string | sì | "Squat jump" — Entry title nel backoffice |
| `codice` | uid | sì, unique | `squat_jump` — chiave stabile per l'API (`?tipo=squat_jump`); generato da `nome` |
| `unita` | enumeration `cm`, `s`, `m` | sì | estendibile in futuro |
| `direzioneMigliora` | enumeration `su`, `giu` | sì | `giu` = valore più basso è meglio (sprint) |
| `testFisici` | relation oneToMany → `test-fisico` (mappedBy `tipoTest`) | no | |

Seed iniziale dei 6 tipi esistenti (`squat_jump` cm su, `cmj` cm su, `sprint_20m` s giù,
`sprint_30m` s giù, `yoyo_ir1` m su, `illinois` s giù) — vedi "Lasciato al builder" per il come.

### `api::test-fisico.test-fisico` (modifiche)

- **Rimossi:** `tipo` (enum), `unita`, `direzioneMigliora` → ora derivano da `tipoTest`.
- **Aggiunto:** `tipoTest` relation manyToOne → `tipo-test` (inversedBy `testFisici`), obbligatoria a
  livello di pagina custom (le relation in Strapi non hanno `required` affidabile).
- Restano: `atleta`, `valore` (decimal, required), `data` (date, required), `note` (text).
- Entry title: aggiungere un modo leggibile di identificarli nella lista standard è fuori scope; la
  lista standard mostra già colonne atleta/tipo/data se configurate.

### Endpoint `GET /api/test-fisico/me[?tipo=<codice>]`

- Il filtro `tipo` diventa `filters.tipoTest.codice = tipo`.
- `populate` di `tipoTest` (campi `nome`, `codice`, `unita`, `direzioneMigliora`) così il client ha
  unità e direzione senza seconda chiamata.
- Ordine invariato: `data` ascendente (per il grafico trend).
- Permessi ruolo Atleta: invariati (`test-fisico.me`). Il catalogo non serve esporlo separatamente
  perché arriva popolato; nessun nuovo permesso pubblico.

## Pagina admin "Inserimento test fisici"

```
Inserimento test fisici
[Atleta ▾ Carlo Rossi]   [Tipo test ▾ Squat jump (cm, ↑ meglio)]

Nuova misurazione:  [data 22/11/2026] [valore ____ cm] [note ______] [Aggiungi]

Periodo: [dal __/__/____] [al __/__/____]
| Data       | Valore  | Note        |           |
| 15/11/2026 | 42,5 cm | dopo riposo | Modifica →|
| 01/11/2026 | 41,0 cm |             | Modifica →|
```

- **Voce di menu** nel backoffice, registrata in `src/admin/app.tsx` (`register` → `addMenuLink`),
  componente pagina in `src/admin/` (lazy import).
- **Select Atleta:** elenco atleti (nome visualizzato come nel Content Manager), con ricerca.
- **Select Tipo test:** elenco del catalogo; mostra unità e direzione accanto al nome.
- **Tabella:** visibile solo con atleta + tipo scelti; misurazioni di quella coppia ordinate per
  `data` **discendente**; colonne data (formato italiano), valore + unità, note, link "Modifica" che
  apre la scheda standard del test nel Content Manager.
- **Filtro periodo:** "dal" / "al" sulla `data`, entrambi opzionali, applicati lato API
  (`$gte` / `$lte`).
- **Inserimento:** data (default oggi), valore (obbligatorio, decimale), note. "Aggiungi" crea il
  test collegato ad atleta + tipo selezionati, poi ricarica la tabella e svuota valore/note.
  Errori di validazione o permessi mostrati come notifica admin.
- **Paginazione:** se la coppia supera una pagina (es. 50 righe), paginare; in pratica gli elenchi
  sono corti.
- **Permessi:** usa le API admin del Content Manager con il token dell'admin loggato → RBAC
  applicato da Strapi. Se il ruolo non ha `create` su Test fisico, "Aggiungi" fallisce con errore
  mostrato (nessun controllo preventivo richiesto).
- **Lingua:** testi della pagina in italiano (l'admin è in italiano di default). Commenti nel codice in inglese.
- **UI:** componenti del design system di Strapi (`@strapi/design-system`), già disponibili
  nell'admin — nessuna dipendenza nuova.

## Vincoli

- Strapi 5.52.2, React 18, TypeScript.
- `src/admin/app.tsx` (italiano di default) è in `develop` dal merge locale del 2026-11-22; il lavoro
  parte dal branch `feat/test-fisico-catalogo`, creato da quel `develop`.
- Workflow git del progetto: branch da `develop`, Conventional Commits, merge in `develop`.
- Dati esistenti: `test_fisici` è **vuota sia in locale sia in produzione** (verificato 2026-11-22,
  produzione confermata dall'utente) → nessuna migration: `tipo`, `unita`, `direzioneMigliora` si
  rimuovono direttamente dallo schema.
- Aggiornare `docs/content-types/test-fisico.md` (decisione enum → catalogo, schema reale,
  endpoint, changelog), creare `docs/content-types/tipo-test.md` e aggiornare l'indice
  `docs/content-types/README.md`.
- `bunfig`/supply-chain: non si aggiungono dipendenze.

## Lasciato al builder

- Come fare il seed dei 6 tipi: in `bootstrap()` idempotente (crea solo i codici mancanti) — scelta
  consigliata, coerente con il seed dei permessi già presente in `src/index.ts`.
- Struttura dei file della pagina in `src/admin/` e gestione dello stato (fetch semplice con
  `useFetchClient`, niente librerie nuove).
- Formato esatto delle chiamate al Content Manager (filtri su relation per `documentId`, body di
  creazione con `connect`) — verificarlo sull'admin 5.52 osservando le richieste del Content Manager.
- Testo/label precisi della pagina.

## Domande aperte

Nessuna.
