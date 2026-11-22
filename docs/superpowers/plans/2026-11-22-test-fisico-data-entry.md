# Test fisico — catalogo tipi + pagina admin di inserimento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed `tipo` enum of `test-fisico` with an admin-managed `tipo-test` catalog and add a backoffice page to browse (by athlete + test type, date-filterable, newest first) and add test measurements.

**Architecture:** New Strapi collection type `api::tipo-test.tipo-test`, seeded idempotently in `bootstrap()`. `test-fisico` gets a `tipoTest` manyToOne relation instead of `tipo`/`unita`/`direzioneMigliora`; the `me` endpoint filters by `tipoTest.codice` and populates it. A custom admin page registered with `app.addMenuLink` in `src/admin/app.tsx` reads and creates entries through the Content Manager admin API (`/content-manager/collection-types/...`) with `useFetchClient`, so admin RBAC applies.

**Tech Stack:** Strapi 5.52.2 (TypeScript), React 18, `@strapi/strapi/admin` (`useFetchClient`, `useNotification`, `Layouts`, `Page`), `@strapi/design-system`, `@strapi/icons`. Postgres locally.

**Spec:** `docs/superpowers/specs/2026-11-22-test-fisico-data-entry-design.md`

## Global Constraints

- Branch: `feat/test-fisico-catalogo` (already created from `develop`). Conventional Commits, each ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Code comments in English; UI copy and `docs/` in Italian.
- No new dependencies.
- No test framework exists in this repo: verification is by running local Strapi (`npm run develop`, port 1337) and calling the API / using the admin. Stop local Strapi before any branch switch.
- `test_fisici` is empty locally and in production: no data migration — remove `tipo`, `unita`, `direzioneMigliora` directly.
- Don't weaken permissions: Atleta role keeps only `api::test-fisico.test-fisico.me`; nothing new is made public.
- `npm run lint` must pass.

## Review Focus

1. **Value typed with a decimal comma** (`42,5`): admins are Italian; expect it to be accepted as 42.5, not rejected or saved as 42 → Task 3 step "decimal comma".
2. **Athlete + type with no measurements**: expect an empty-state message, not a blank table or an error → Task 3.
3. **Only one date bound set, or "dal" after "al"**: one bound filters on that side only; inverted range shows the empty state (no crash) → Task 3.
4. **Changing athlete or type after a filtered view**: table reloads for the new pair; the period filter stays; the entry form keeps its date → Task 3.
5. **Admin role without `create` on Test fisico**: "Aggiungi" shows the API error as a notification and the typed value is kept → Task 3.

---

### Task 1: `tipo-test` catalog content-type + seed

**Files:**
- Create: `src/api/tipo-test/content-types/tipo-test/schema.json`
- Create: `src/api/tipo-test/controllers/tipo-test.ts`, `src/api/tipo-test/routes/tipo-test.ts`, `src/api/tipo-test/services/tipo-test.ts` (core factories, same shape as `src/api/test-fisico/*`)
- Modify: `src/index.ts` (add `ensureTipiTest`, call it in `bootstrap` after `ensureAtletaPermissions`)
- Create: `docs/content-types/tipo-test.md`; Modify: `docs/content-types/README.md` (index row + changelog line)

**Interfaces:**
- Produces: UID `api::tipo-test.tipo-test`, table `tipi_test`, attributes `nome` (string, required), `codice` (uid, `targetField: "nome"`, required — Strapi uid is unique), `unita` (enumeration `cm`,`s`,`m`, required), `direzioneMigliora` (enumeration `su`,`giu`, required), `testFisici` (relation oneToMany → `api::test-fisico.test-fisico`, `mappedBy: "tipoTest"` — add this attribute in Task 2 together with its inverse, so the schema is valid at every commit). `draftAndPublish: false`. Entry title `nome` is automatic (first string field).

- [ ] **Step 1:** Create the schema (without `testFisici`) and the three core factory files.
- [ ] **Step 2:** In `src/index.ts` add `const TIPI_TEST_SEED` with exactly these rows and `async function ensureTipiTest({ strapi })` that creates via `strapi.documents('api::tipo-test.tipo-test').create` only the `codice` values not already present (idempotent, logs each creation):

  | codice | nome | unita | direzioneMigliora |
  |---|---|---|---|
  | squat_jump | Squat jump | cm | su |
  | cmj | CMJ | cm | su |
  | sprint_20m | Sprint 20 m | s | giu |
  | sprint_30m | Sprint 30 m | s | giu |
  | yoyo_ir1 | Yo-Yo IR1 | m | su |
  | illinois | Illinois agility | s | giu |

- [ ] **Step 3: Verify** — `npm run develop`; log shows 6 `[bootstrap]` creations; restart → no creations. Query local DB: `SELECT codice, nome, unita, direzione_migliora FROM tipi_test ORDER BY codice` → 6 rows as above.
- [ ] **Step 4:** Write `docs/content-types/tipo-test.md` (same sections as other files: Stato, Schema reale, Scopo, Campi, Seed, Permessi — none for Atleta, arrives populated via `test-fisico/me`, Changelog) and add the index row in `README.md`.
- [ ] **Step 5:** `npm run lint` passes. Commit: `feat(tipo-test): add test type catalog with seeded defaults`.

### Task 2: `test-fisico` uses the catalog; `me` endpoint updated

**Files:**
- Modify: `src/api/test-fisico/content-types/test-fisico/schema.json`
- Modify: `src/api/tipo-test/content-types/tipo-test/schema.json` (add `testFisici`)
- Modify: `src/api/test-fisico/controllers/test-fisico.ts` (`me`)
- Modify: `docs/content-types/test-fisico.md`, `docs/content-types/README.md` (changelog line)
- Regenerated: `types/generated/contentTypes.d.ts`

**Interfaces:**
- Consumes: `api::tipo-test.tipo-test` with `codice` (Task 1).
- Produces: `test-fisico` attributes `atleta`, `tipoTest` (relation manyToOne → `api::tipo-test.tipo-test`, `inversedBy: "testFisici"`), `valore` (decimal, required), `data` (date, required), `note` (text). `GET /api/test-fisico/me[?tipo=<codice>]` → `{ data: TestFisico[] }` sorted by `data` asc, each item with `tipoTest: { nome, codice, unita, direzioneMigliora }`.

- [ ] **Step 1:** Edit both schemas (remove `tipo`, `unita`, `direzioneMigliora`; add the relation pair).
- [ ] **Step 2:** In `me`: filter `tipo` → `filters.tipoTest = { codice: tipo }`; add `populate: { tipoTest: { fields: ['nome', 'codice', 'unita', 'direzioneMigliora'] } }`; update the JSDoc (English) to say `tipo` is a catalog `codice`.
- [ ] **Step 3: Verify** — restart Strapi (schema sync drops the 3 columns, adds the link table; no errors). In the admin create two Test fisico for the test athlete (`atleta1@fake.com`, see `bruno/Auth/Login (atleta1).bru`): Squat jump 40 on 2026-10-01, CMJ 45 on 2026-10-15. Log in via `POST /api/auth/local`, then:
  - `GET /api/test-fisico/me` → 2 items, ascending by `data`, each with `tipoTest.codice` and `tipoTest.unita`.
  - `GET /api/test-fisico/me?tipo=cmj` → only the CMJ item.
  - `GET /api/test-fisico/me?tipo=inesistente` → `data: []`.
  - Without token → 403.
- [ ] **Step 4:** Update `docs/content-types/test-fisico.md`: decision enum → catalog closed (2026-11-22), real schema, endpoint (`?tipo=` = `codice`, populated `tipoTest`), remove "Alternativa: catalogo" as open, changelog entry.
- [ ] **Step 5:** `npm run lint`. Commit (schemas, controller, generated types, docs): `feat(test-fisico): replace tipo enum with tipo-test relation`.

### Task 3: Admin page "Inserimento test fisici"

**Files:**
- Modify: `src/admin/app.tsx` (`register(app)` → `app.addMenuLink`)
- Create: `src/admin/pages/InserimentoTest/index.tsx` (page: selectors, form, table)
- Create: `src/admin/pages/InserimentoTest/api.ts` (Content Manager calls)

**Interfaces:**
- Consumes: UIDs `api::atleta.atleta` (label `nomeCompleto`), `api::tipo-test.tipo-test`, `api::test-fisico.test-fisico` and their fields from Tasks 1–2.
- Produces, in `api.ts` (each takes the `get`/`post` from `useFetchClient()`):
  - `listAtleti(get): Promise<{ documentId: string; nomeCompleto: string }[]>` — sorted by `nomeCompleto`, all pages.
  - `listTipiTest(get): Promise<{ documentId: string; nome: string; codice: string; unita: 'cm'|'s'|'m'; direzioneMigliora: 'su'|'giu' }[]>` — sorted by `nome`.
  - `listMisurazioni(get, { atletaId: string; tipoTestId: string; dal?: string; al?: string; page: number }): Promise<{ results: { documentId: string; data: string; valore: number; note: string | null }[]; pagination: { page: number; pageCount: number } }>` — `GET /content-manager/collection-types/api::test-fisico.test-fisico` with filters on `atleta.documentId`, `tipoTest.documentId`, `data` `$gte`/`$lte` (only those given), `sort=data:DESC`, `pageSize=50`.
  - `createMisurazione(post, { atletaId; tipoTestId; data: string; valore: number; note?: string }): Promise<void>` — `POST /content-manager/collection-types/api::test-fisico.test-fisico`, relations as `{ connect: [{ documentId }] }`.
  - Before writing these, open the Content Manager in the browser and read the network requests it makes for list-with-filters and create, and match that exact query/body format.

- [ ] **Step 1:** `register(app)`: keep the language default, then `app.addMenuLink({ to: 'inserimento-test', icon: <a @strapi/icons icon, e.g. Clipboard>, intlLabel: { id: 'inserimento-test.menu', defaultMessage: 'Inserimento test' }, permissions: [{ action: 'plugin::content-manager.explorer.read', subject: 'api::test-fisico.test-fisico' }], Component: () => import('./pages/InserimentoTest') })`.
- [ ] **Step 2:** Implement `api.ts` with the signatures above.
- [ ] **Step 3:** Implement the page per the spec sketch, with `Layouts.Header` title "Inserimento test fisici" and design-system components:
  - two comboboxes **Atleta** / **Tipo test** (type option label: `"{nome} ({unita}, ↑ meglio|↓ meglio)"`);
  - until both are chosen: hint text "Seleziona atleta e tipo di test"; form and table hidden;
  - form: Data (DatePicker, default today), Valore (required; label shows the unit), Note; button **Aggiungi**;
  - **decimal comma**: parse `valore` replacing `,` with `.`; invalid number → inline field error, no request;
  - on success: success notification "Misurazione aggiunta", clear Valore and Note, keep Data, reload table;
  - on API error: danger notification with the API message, keep the typed values;
  - period filter **Dal** / **Al** (DatePickers, each clearable) → refetch;
  - table columns Data (`dd/MM/yyyy` via `Intl.DateTimeFormat('it-IT')`), Valore (`it-IT` number + unit), Note, link "Modifica" to `/admin/content-manager/collection-types/api::test-fisico.test-fisico/{documentId}`;
  - empty result: "Nessuna misurazione per questo periodo";
  - pagination controls only when `pageCount > 1`;
  - changing athlete or type: reset page to 1, keep Dal/Al, refetch.
- [ ] **Step 4: Verify in the browser** (preview `backend-dev`, admin login by the user): menu entry visible; with the Task 2 data, Carlo + Squat jump shows 1 row; add `42,5` on today's date → row at the top shows `42,5 cm`; Dal = today hides the older row; Dal after Al → empty state; switch type to CMJ → its own rows, filter kept; no console errors.
- [ ] **Step 5:** `npm run lint`; `npm run build` succeeds (admin compiles). Commit: `feat(admin): add test-fisico data-entry page`.

### Task 4: Wrap-up

- [ ] **Step 1:** Spec status → "implementato" with date; final check that `docs/content-types/test-fisico.md`, `tipo-test.md`, `README.md` match the final schema.
- [ ] **Step 2:** Commit `docs(test-fisico): mark data-entry design as implemented`. Do not merge into `develop` or push without the user's go-ahead.
