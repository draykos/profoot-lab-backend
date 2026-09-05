# Content-type da creare — Profoot-Lab backend

Questa cartella traccia il **modello dati Strapi** da costruire per alimentare le schermate del
frontend (`profoot-lab-frontend`). Oggi il backend è un'installazione Strapi vuota: `src/api/` non
contiene nulla.

**Un file per content-type.** Ogni file parte come proposta e viene **arricchito man mano che il
content-type viene effettivamente creato** (schema finale, UID reali, permessi configurati,
decisioni prese). Tenere aggiornata la colonna *Stato* qui sotto e il *Changelog* in fondo a ogni
file.

## Legenda stato

| Icona | Significato |
| --- | --- |
| 📝 | Da creare — solo proposta in questo doc |
| 🚧 | In corso — schema parziale creato in Strapi |
| ✅ | Creato — schema completo, permessi e relazioni configurati |

## Elenco content-type

| # | Content-type | File | Kind | Stato | Schermate frontend alimentate |
| --- | --- | --- | --- | --- | --- |
| 1 | Atleta | [atleta.md](atleta.md) | collection | ✅ | `/profile`, header di ogni schermata, `/` |
| 2 | Squadra | [squadra.md](squadra.md) | collection | ✅ | `/matches`, `/profile` |
| 3 | Allenamento | [allenamento.md](allenamento.md) | collection | ✅ | `/training`, `/` (video del giorno) |
| 4 | Piano alimentare | [piano-alimentare.md](piano-alimentare.md) | collection | ✅ | `/diet`, `/` (riepilogo kcal) |
| 5 | Test fisico | [test-fisico.md](test-fisico.md) | collection | ✅ | `/test` |
| 6 | Infortunio | [infortunio.md](infortunio.md) | collection | ✅ | `/body`, `/` (alert corpo) |
| 7 | Partita | [partita.md](partita.md) | collection | ✅ | `/matches`, `/` (prossima partita) |
| 8 | Modulo mental coach | [modulo-mental-coach.md](modulo-mental-coach.md) | collection | ✅ | `/mental` |
| 9 | Highlight | [highlight.md](highlight.md) | collection | ✅ | `/highlights` |
| 10 | Membro staff | [membro-staff.md](membro-staff.md) | collection | 📝 (opzionale) | `/training`, `/mental` (attribuzioni) |

La **dashboard** (`/`) non ha un content-type dedicato: è un'aggregazione di *Allenamento* (di oggi),
*Partita* (prossima) e *Infortunio* (stato attivo). Vedi note in fondo.

## Decisioni trasversali

### 1. Convenzione di naming — ⚠️ DA DECIDERE

I file qui usano **nomi e campi in italiano** (`atleta`, `dataNascita`, `gravita`), coerenti con il
ruolo `Atleta` già creato e con la lingua di default del frontend. Alternativa: API in inglese
(`athlete`, `birthDate`) come da convenzione Strapi. **Scegliere una volta e applicare ovunque prima
di creare il primo content-type.** Gli UID indicati (`api::atleta.atleta`) vanno adeguati di
conseguenza.

### 2. Isolamento dei dati per atleta

Strapi **non ha row-level security**. Dare a un ruolo il permesso `find` su un content-type espone
**tutte** le righe. Per i dati privati del singolo atleta (`piano-alimentare`, `test-fisico`,
`infortunio`, `highlight`, e il profilo `atleta`) serve **una delle seguenti**:

- una **policy** / middleware che forza `filters[atleta][user][id] = ctx.state.user.id`;
- un **controller custom** che sovrascrive `find`/`findOne`;
- servire tutto tramite `GET /api/users/me?populate=...` (l'atleta legge solo il proprio grafo).

Per i **cataloghi condivisi** (`modulo-mental-coach`, `partita`, `squadra`) il permesso
`find`/`findOne` semplice è sufficiente.

Ogni file indica nella sezione *Isolamento* se il content-type è privato o condiviso.

**Implementazione concreta (dal 2026-09-05):** i content-type privati non ricevono `find`/`findOne`
per il ruolo Atleta — solo un'azione custom self-scoped `me` (`GET /api/<content-type>/me`) che
risolve l'atleta dall'utente autenticato via `strapi.service('api::atleta.atleta').findForUser(userId)`
e filtra lato server. `allenamento` è il primo caso reale (il piano è per singolo atleta, non
condiviso); lo stesso pattern si applica quando si creano `test-fisico`, `infortunio`,
`piano-alimentare`, `highlight`.

### 3. Relazione con l'utente

`atleta` è una **collection separata** con relazione **1‑1** verso
`plugin::users-permissions.user` (campo `user`). Non si aggiungono campi di dominio direttamente
all'entità utente: l'utente resta solo per auth. Tutti gli altri content-type privati puntano ad
`atleta`, non a `user`.

### 4. Draft & Publish

- **Attivo** per i cataloghi curati dallo staff: `allenamento`, `modulo-mental-coach`, `highlight`.
- **Disattivo** per i dati-misura e i record clinici, dove non ha senso una bozza: `test-fisico`,
  `infortunio`, `piano-alimentare` (valutare).

### 5. Media

Immagini/video passano dal plugin `upload` (config in `config/plugins.ts`: SVG ed eseguibili
vietati). I campi media nei file sotto usano il tipo `media` (single o multiple). Per i video lunghi
valutare un campo `url` verso un hosting esterno invece dell'upload diretto.

### 6. i18n

Il frontend ha `it` (default) ed `en` ma **tutte le stringhe UI sono statiche** in
`src/lib/i18n.tsx`. Il contenuto redazionale (titoli video, descrizioni moduli) per ora si assume
**solo italiano**. Attivare la localizzazione Strapi (`i18n`) sui content-type di catalogo solo se
serve davvero il bilingue sui contenuti.

### 7. Permessi ruolo Atleta

Ogni file elenca le azioni da spuntare per il ruolo **Atleta** (Settings → Users & Permissions →
Roles → Atleta). Regola generale: solo `find` + `findOne`, mai `create`/`update`/`delete` (UI
read-only), salvo eccezioni annotate.

## Ordine di implementazione consigliato

1. `atleta` (+ relazione con user) — base per tutto il resto
2. `squadra` — referenziata da `atleta` e `partita`
3. `partita` — semplice, nessun dato privato
4. `allenamento` — sblocca `/training` e il video del giorno in dashboard
5. `test-fisico` — sblocca `/test`
6. `infortunio` — sblocca `/body` e l'alert in dashboard
7. `piano-alimentare` — sblocca `/diet`
8. `highlight` — sblocca `/highlights`
9. `modulo-mental-coach` — sblocca `/mental`
10. `membro-staff` — opzionale, rifinitura attribuzioni

## Changelog

- **2026-09-04** — creata la sezione docs con le 10 proposte di content-type derivate dalle
  schermate mock del frontend.
- **2026-09-04** — naming **italiano** confermato. Creato lo schema di `atleta`
  (`api::atleta.atleta`); resta da fare permessi + policy + endpoint `me`.
- **2026-09-05** — chiuse le decisioni aperte di `atleta` (vedi changelog del file). Creati
  l'endpoint `atleta.me` e il seed permessi in `bootstrap()`. Creato `squadra`
  (`api::squadra.squadra`) e collegata la relazione `atleta.squadra` ↔ `squadra.atleti`. Creato
  `partita` (`api::partita.partita`) con relazioni verso `squadra` per casa/trasferta. Deciso: il
  piano di allenamento è **per singolo atleta**; creato `allenamento` (`api::allenamento.allenamento`)
  come content-type privato con endpoint `me`, e il service condiviso `atleta.findForUser` per gli
  endpoint `me` futuri. Creato `test-fisico` (`api::test-fisico.test-fisico`, enum `tipo` fisso)
  con lo stesso pattern. Creato `infortunio` (`api::infortunio.infortunio`, enum `zona` fisso a 17
  valori), stesso pattern, permessi ancora più stretti trattandosi di dato sanitario. Creato
  `piano-alimentare` (`api::piano-alimentare.piano-alimentare`) con il component `dieta.pasto`.
  Creato `highlight` (`api::highlight.highlight`, `avversario` come relazione verso `squadra`).
  Creato `modulo-mental-coach` come catalogo condiviso, senza relazione con `atleta`.

  **9 content-type su 10 completati.** Resta solo `membro-staff` (opzionale, da valutare se serve
  davvero o se un campo stringa basta — vedi il file).
