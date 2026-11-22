# Admin — sezione "Profoot Lab" con sottomenu

**Data:** 2026-11-22 · **Repo:** `profoot-lab-backend` · **Stato:** implementato (2026-11-22) ·
**Branch:** `feat/admin-profoot-lab-section`

## Perché

Raggruppare in un'unica voce del backoffice tutto ciò che riguarda Profoot Lab: gli strumenti su
misura (oggi "Aggiungi test fisico") e i contenuti gestiti dall'admin, invece di avere voci sparse
nella barra laterale.

## Obiettivi

- Una sola voce nella barra laterale, **"Profoot Lab"**, con un'icona ispirata al favicon del
  frontend (scarpino che calcia un pallone).
- Una sezione con **sottomenu stile "Impostazioni"** (componente `SubNav` esportato da
  `@strapi/strapi/admin`), con due gruppi:
  - **Strumenti** — pagine custom che restano dentro la sezione. Oggi: "Aggiungi test fisico".
  - **Contenuti** — link alle liste del Content Manager dei content-type di Profoot Lab: Atleti,
    Calendario partite, Highlight, Infortuni, Piani alimentari, Test fisici, Tipi di test,
    Video Coach. Esclusi quelli di Strapi (User).
- Cliccando "Profoot Lab" si apre **direttamente la prima sottopagina** ("Aggiungi test fisico").

## Non-obiettivi

- Liste/schede dei contenuti dentro la sezione: i link portano al Content Manager e **si esce dalla
  sezione** (limite noto di Strapi, accettato).
- Nascondere altre voci del menu (eventualmente via ruoli in *Impostazioni → Ruoli*, separato).

## Approcci considerati

| | Approccio | Scelta |
|---|---|---|
| A | Sezione con sottomenu misto: strumenti interni + link al Content Manager | ✅ scelto |
| B | Rifare liste e schede dei contenuti dentro la sezione | ✗ — reimplementa il Content Manager, molto lavoro e manutenzione |
| C | Solo permessi per ruolo per ripulire il menu, nessuna sezione | ✗ — non dà il punto di ingresso unico voluto |

## Design

- **Voce di menu:** `app.addMenuLink` in `src/admin/app.tsx` con `to: 'profoot-lab'`, label
  "Profoot Lab", icona SVG custom (`src/admin/icons/`, monocolore `currentColor`, viewBox 32×32,
  come `Dumbbell.tsx` che viene sostituita). Sostituisce la voce "Aggiungi Test Fisico".
- **Layout della sezione:** componente che rende `SubNav` a sinistra e la sottopagina a destra
  (route annidate sotto `/admin/profoot-lab/*`). `/admin/profoot-lab` reindirizza a
  `/admin/profoot-lab/test-fisici`.
- **Sottopagine (Strumenti):** "Aggiungi test fisico" → `/admin/profoot-lab/test-fisici`, è la
  pagina esistente (`src/admin/pages/InserimentoTest`) senza modifiche di comportamento.
- **Link (Contenuti):** puntano a `/admin/content-manager/collection-types/<uid>`; l'elenco è una
  costante nel codice (aggiornarla quando si aggiunge/rimuove un content-type).
- **Vecchio indirizzo** `/admin/inserimento-test` → reindirizza alla nuova sottopagina.
- **Permessi:** la voce è visibile a chi può leggere Test fisico nel Content Manager (come oggi);
  i link ai contenuti portano a pagine che applicano già i permessi del ruolo.
- **Icona:** pallone da calcio a contorno (variante **C**), scelta dall'utente dopo aver scartato lo
  scarpino. Disegnata solo con `<path>` pieni: il menu di Strapi ricolora le icone su hover/attivo
  con una regola CSS `svg path { fill }` e passa `fill` come nome di colore del tema
  (`src/admin/icons/ProfootLab.tsx`).

## Lasciato al builder

- Struttura dei file della sezione in `src/admin/pages/` e uso esatto di `SubNav` (verificare
  l'API dei sotto-componenti in `@strapi/admin` 5.52).
- Testi esatti delle etichette dei link.

## Verifica

Lint, controllo tipi admin, `npm run build`; nel browser (login dell'utente): voce con icona nuova,
apertura diretta su "Aggiungi test fisico", sottomenu con i due gruppi, link ai contenuti
funzionanti, vecchio indirizzo reindirizzato.
