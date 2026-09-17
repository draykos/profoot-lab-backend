# Atleta

**Stato:** ✅ Creato — schema, endpoint `me`, permessi Atleta seedati, relazioni `squadra` e
`allenamenti` collegate

## Schema reale creato

- File: `src/api/atleta/content-types/atleta/schema.json` (+ `controllers/routes/services` factory)
- UID: `api::atleta.atleta` · tabella `atleti` · `draftAndPublish: false`
- Tabelle DB verificate: `atleti`, `atleti_user_lnk`
- `/api/atleti` risponde 404 finché non si assegnano i permessi al ruolo (atteso e voluto)

### Campi effettivi

| Campo | Tipo | Vincoli | Differenze vs proposta |
| --- | --- | --- | --- |
| `user` | relation oneToOne → `plugin::users-permissions.user` | **one-way**, non `required` | `required` non ancora forzato: dipende dal flusso di creazione (vedi decisioni aperte) |
| `nome` | string | required | — |
| `cognome` | string | required | — |
| `nomeCompleto` | string | **required** | ✅ aggiunto il 2026-09-07: compilato **a mano** (nessun hook), è l'**Entry title** dell'atleta — il valore mostrato e cercato nelle tendine di relazione degli altri content-type |
| `dataNascita` | date | — | — |
| `ruolo` | enumeration | `portiere` \| `difensore` \| `centrocampista` \| `attaccante` | enum piatto (deciso) |
| `altezzaCm` | integer | min 100 / max 250 | aggiunta validazione |
| `pesoKg` | decimal | min 30 / max 150 | aggiunta validazione |
| `piedePreferito` | enumeration | `destro` \| `sinistro` \| `ambidestro` | — |
| `numeroMaglia` | integer | min 1 / max 99 | — |
| `proStatus` | boolean | default `true` | — |
| `avatar` | media single | solo `images` | — |
| `squadra` | relation manyToOne → `api::squadra.squadra` | — | ✅ collegata il 2026-09-05, bidirezionale (`squadra.atleti`) |
| `allenamenti` | relation oneToMany → `api::allenamento.allenamento` | — | ✅ reverse della relazione required su `allenamento` (piano per singolo atleta) |
| `testFisici` | relation oneToMany → `api::test-fisico.test-fisico` | — | ✅ reverse della relazione su `test-fisico` |
| `infortuni` | relation oneToMany → `api::infortunio.infortunio` | — | ✅ reverse della relazione su `infortunio` |
| `pianiAlimentari` | relation oneToMany → `api::piano-alimentare.piano-alimentare` | — | ✅ reverse della relazione su `piano-alimentare` |
| `highlights` | relation oneToMany → `api::highlight.highlight` | — | ✅ reverse della relazione su `highlight` |
| `videoCoach` | relation oneToMany → `api::video-coach.video-coach` | — | ✅ reverse della relazione su `video-coach` (aggiunta il 2026-09-07) |

### Entry title = `nomeCompleto` (2026-09-07)

Nelle tendine di relazione l'admin Strapi mostra e cerca **un solo campo** del target (`mainField`) e
non sa concatenare `nome` + `cognome`. Scelta: campo dedicato **`nomeCompleto`** (string, required),
compilato a mano dallo staff alla creazione dell'atleta. Nessun lifecycle hook.

**Impostato il 2026-09-07** via update diretto su `strapi_core_store_settings` (config admin, non
schema — **non versionabile su file**, va rifatto se si resetta il DB):

- `api::atleta.atleta` → `settings.mainField` = `nomeCompleto`, `settings.defaultSortBy` =
  `nomeCompleto`
- `allenamento`, `test-fisico`, `infortunio`, `piano-alimentare`, `highlight`, `video-coach`
  → `metadatas.atleta.edit.mainField` = `nomeCompleto`
  (fatto su `modulo-mental-coach` prima della rinomina — **da rifare su `video-coach`**)

In alternativa si rifà da Content Manager → *Configure the view*. Dopo la modifica serve un **riavvio
del dev server** per svuotare la cache del core store.

### Service condiviso `findForUser`

`src/api/atleta/services/atleta.ts` espone `findForUser(userId)`: risolve l'`atleta` collegato a uno
user id, o `null`. È il punto unico riusato da ogni endpoint `me` dei content-type privati
per-atleta (`atleta.me` stesso, `allenamento.me`, e in futuro `test-fisico`, `infortunio`,
`piano-alimentare`, `highlight`) per evitare di duplicare la query in ogni controller.

---

## Scopo

Profilo del calciatore. Estende l'utente di autenticazione con i dati anagrafici, antropometrici e
sportivi, e fa da hub per tutti i dati privati (test, infortuni, dieta, highlight).

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/profile.tsx` — nome, cognome, data di nascita, altezza, peso,
  ruolo, "Pro Status", avatar con iniziali
- `profoot-lab-frontend/src/routes/index.tsx` — saluto "Ciao, Luca"
- header di ogni schermata via `AppShell`
- mock attuale: hardcoded "Luca Bianchi", "Attaccante • Milano FC", 184 cm, 78,2 kg, 14 marzo 2001

## UID e kind

- UID previsto: `api::atleta.atleta`
- Kind: `collectionType`
- Draft & Publish: **off**

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `user` | relation oneToOne → `plugin::users-permissions.user` | sì | chiave di collegamento con l'auth; `private` in API |
| `nome` | string | sì | |
| `cognome` | string | sì | |
| `dataNascita` | date | no | schermata profilo |
| `ruolo` | enumeration | no | `portiere`, `difensore`, `centrocampista`, `attaccante` (valutare granularità: terzino, ala…) |
| `altezzaCm` | integer | no | |
| `pesoKg` | decimal | no | il mock mostra 78,2 |
| `proStatus` | boolean | no | badge "Pro Status"; default `true` |
| `avatar` | media (single, images) | no | se assente il frontend usa le iniziali |
| `squadra` | relation manyToOne → `api::squadra.squadra` | no | vedi [squadra.md](squadra.md) |
| `numeroMaglia` | integer | no | opzionale |
| `piedePreferito` | enumeration | no | `destro`, `sinistro`, `ambidestro` |

## Relazioni

- `user` ← 1‑1 con `plugin::users-permissions.user`
- `squadra` → manyToOne
- reverse (definite dagli altri content-type): `testFisici`, `infortuni`, `pianiAlimentari`,
  `highlights`, `videoCoach`, eventuali `allenamenti`

## Isolamento

**Privato.** L'atleta deve vedere **solo sé stesso**. Non dare `find` sulla collection: esporre il
profilo via `GET /api/users/me?populate=atleta....` oppure via `findOne` filtrato per
`user.id === ctx.state.user.id`.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `findOne` | sì — solo con policy di ownership |
| `update` | valutare — se l'atleta può correggere peso/avatar da solo |
| `find`, `create`, `delete` | no |

Necessario anche `plugin::users-permissions.user.me` (già assegnato ad *Authenticated*, va aggiunto
ad *Atleta*).

## Decisioni aperte

- L'atleta può **modificare** qualcosa del proprio profilo (es. `pesoKg`, `avatar`) o è tutto
  gestito dallo staff?
- `ruolo`: enum piatto o due livelli (reparto + ruolo specifico)?
- Serve `dataNascita` completa o basta l'anno? (privacy)
- Creazione atleta: lo staff crea prima l'utente U&P e poi l'`atleta`, oppure un hook crea
  automaticamente l'`atleta` alla creazione dell'utente?

## Decisioni chiuse (2026-09-05)

- `user` **resta non `required`** a livello di schema, per ora — nessun vincolo forzato.
- **Nessun lifecycle hook** che crea `atleta` alla creazione dell'utente — creazione manuale
  separata (staff crea prima l'utente U&P, poi l'`atleta`, poi li collega).
- **L'atleta non può modificare il proprio profilo per ora** — solo lettura (`me`), niente `update`.
  Nessuna policy di ownership per `update` quindi: la scelta di design (esporre solo `me`, mai
  `find`/`findOne` aperti) copre già l'isolamento in lettura senza bisogno di una policy dedicata.

## Endpoint creato

`GET /api/atleta/me` (autenticato) — `src/api/atleta/controllers/atleta.ts` +
`src/api/atleta/routes/atleta-me.ts`. Filtra per `user.id` lato server (nessun filtro accettato dal
client), popola `avatar` e `squadra` (solo campo `nome`), sanitizza con
`strapi.contentAPI.sanitize.output`. 404 se l'utente non ha un `atleta` collegato. Path scelto
apposta diverso da `/api/atleti/:id` per non competere con la rotta core.

Permessi seedati in `bootstrap()` (`src/index.ts`, idempotente, gira a ogni avvio):
`plugin::users-permissions.user.me` e `api::atleta.atleta.me` sul ruolo `atleta`. Verificato via
query diretta su `up_permissions`: presenti insieme a `changePassword`/`logout` (questi ultimi
aggiunti a mano dall'utente nel frattempo).

Verificato: `GET /api/atleta/me` senza token → `403 Forbidden` (corretto: il ruolo Public non ha il
permesso). Non ancora testato con un JWT reale (nessun `atleta` collegato a `Test1` al momento).

## Prossimi passi

1. ~~Aggiungere la relazione `squadra`~~ — fatto il 2026-09-05, vedi [squadra.md](squadra.md).
2. Creare un `atleta` di test collegato a `Test1` e verificare `me` end-to-end con un JWT reale.
3. Rivalutare `update` self-service quando servirà davvero.

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `profile.tsx`.
- **2026-09-04** — creato lo schema `api::atleta.atleta` (naming IT confermato). Deciso: enum `ruolo`
  piatto, validazioni min/max su altezza/peso, `avatar` single image. Rimandati: relazione `squadra`,
  `user` `required`, endpoint `me`, policy di ownership, seed permessi.
- **2026-09-05** — collegata la relazione `allenamenti` (reverse di `allenamento.atleta`) e
  aggiunto il service condiviso `findForUser`, riusato da `allenamento.me`.
- **2026-09-07** — aggiunto il campo `nomeCompleto` (string, **required**, compilato a mano) come
  Entry title dell'atleta, usato nelle ricerche delle tendine di relazione degli altri content-type.
  `mainField` / `defaultSortBy` impostati su `nomeCompleto` sul content-type `atleta` e
  `metadatas.atleta.edit.mainField` sui 6 content-type che referenziano `atleta` — via update diretto
  su `strapi_core_store_settings` (config admin, non su file). Il record di test esistente era già
  stato cancellato. Richiede un riavvio del dev server.
- **2026-09-05** — chiuse le decisioni rimandate (vedi sopra). Creato l'endpoint `GET /api/atleta/me`
  e il seed permessi in `bootstrap()`. Bug in corso d'opera: `this.sanitizeOutput`/
  `this.transformResponse` nella firma a oggetto del controller danno errore TS
  (`TS2532`/`TS2722`, "possibly undefined") — risolto passando da
  `strapi.contentAPI.sanitize.output` invece che dai metodi ereditati dal core controller. L'errore
  di compilazione ha fatto cadere temporaneamente il dev server; è stato individuato e corretto, il
  server è tornato su da solo (autoReload) senza bisogno di restart manuale.
- **2026-09-14** — `GET /api/atleta/me` ora popola anche `squadra` (solo `nome`) oltre ad `avatar`,
  per la pagina profilo del frontend (ruolo + squadra). Collegata `/profile` ai dati reali.
