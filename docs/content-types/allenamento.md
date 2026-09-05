# Allenamento

**Stato:** ✅ Creato

## Decisione presa (2026-09-05)

**Il piano è per singolo atleta** (non condiviso, non per squadra). Di conseguenza:

- relazione `atleta` (manyToOne, required) invece di nessuna relazione
- content-type **privato**, non condiviso — cambia rispetto alla proposta originale sotto
- niente `find`/`findOne` per il ruolo Atleta: solo l'azione self-scoped `me`, stesso pattern di
  `atleta.me`

## Schema reale creato

- File: `src/api/allenamento/content-types/allenamento/schema.json` (+ factory
  `controllers/routes/services`)
- UID: `api::allenamento.allenamento` · tabella `allenamenti` · `draftAndPublish: true`
- Tabelle DB verificate: `allenamenti`, `allenamenti_atleta_lnk`
- Relazione bidirezionale: `allenamento.atleta` (manyToOne, required) ↔ `atleta.allenamenti`
  (oneToMany)
- `video`/`copertina` come media (non URL esterno): `video` limitato a `videos`, `copertina` a
  `images`
- `coach` **omesso**: dipende da `api::membro-staff.membro-staff`, non ancora creato (content-type
  opzionale, bassa priorità)

## Endpoint creato

`GET /api/allenamento/me` — `src/api/allenamento/controllers/allenamento.ts` +
`src/api/allenamento/routes/allenamento-me.ts`. Risolve l'`atleta` dall'utente autenticato tramite
il nuovo service condiviso `strapi.service('api::atleta.atleta').findForUser(userId)` (introdotto
qui, riusato da `atleta.me`; lo riuseranno anche `test-fisico`, `infortunio`, `piano-alimentare`,
`highlight`), poi ritorna tutti i suoi allenamenti ordinati per `data` decrescente con `video` e
`copertina` popolati. Nessun filtro/populate arbitrario accettato dal client.

Permessi seedati in `bootstrap()`: solo `api::allenamento.allenamento.me` per il ruolo Atleta.

Verificato: `GET /api/allenamenti` e `GET /api/allenamento/me` senza token → `403` ✅. Non ancora
testato con un JWT reale (nessun allenamento di test creato).

## ⚠️ Incidente in corso d'opera

Il dev server è andato giù durante l'applicazione di questo content-type — non per un errore di
compilazione (il riavvio pulito è filato liscio), ma quasi certamente per una finestra transitoria
in cui il watcher ha ricaricato lo schema di `allenamento` (che referenzia `atleta.allenamenti` via
`inversedBy`) **prima** che il file `atleta/schema.json` fosse aggiornato con il lato opposto della
relazione — le due modifiche sono avvenute in due scritture separate. Individuato dal consueto
health-check, il server è stato riavviato manualmente e da lì è ripartito pulito. Per i prossimi
content-type con relazioni bidirezionali, valutare di scrivere entrambi i lati nello stesso
istante/commit dei file per ridurre la finestra di rischio (non completamente eliminabile con
scritture di file separate).

---

## Scopo

Sessione video di allenamento assegnata per un giorno. Il frontend mostra il video di oggi in
evidenza + i giorni precedenti (ultima settimana), e lo stesso "video di oggi" appare in dashboard.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/training.tsx` — array `week`: `dayNum`, `dateLabel`, titolo, tag,
  `duration` ("12 min"), `intensity` (`high`/`med`/`low`), `thumb`, `isToday`
- `profoot-lab-frontend/src/routes/index.tsx` — "Video del giorno", "Squat esplosivi 4×6",
  "Forza • 12 min • con Coach Marco"
- tag visti nei mock: Forza, Attivazione, Defaticamento, Velocità, Core, Condizionamento, Recupero

## UID e kind

- UID previsto: `api::allenamento.allenamento`
- Kind: `collectionType`
- Draft & Publish: **on** (contenuto curato dallo staff)

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `titolo` | string | sì | "Squat esplosivi 4×6" |
| `descrizione` | text | no | |
| `categoria` | enumeration | sì | `forza`, `attivazione`, `defaticamento`, `velocita`, `core`, `condizionamento`, `recupero` |
| `durataMinuti` | integer | no | il mock mostra "12 min" |
| `intensita` | enumeration | no | `alta`, `media`, `bassa` |
| `data` | date | sì | giorno di assegnazione; il frontend deriva "Oggi"/"Ieri" |
| `video` | media (single) **oppure** `videoUrl` string | sì | valutare hosting esterno per file grandi |
| `copertina` | media (single, images) | no | `thumb` nel mock |
| `coach` | relation manyToOne → `api::membro-staff.membro-staff` | no | "con Coach Marco" — vedi [membro-staff.md](membro-staff.md) |

## Assegnazione — ⚠️ DA DECIDERE

Il piano di allenamento è **uguale per tutti** o **per singolo atleta / squadra**?

- **Uguale per tutti** → nessuna relazione, catalogo condiviso, query per `data`.
- **Per squadra** → `squadra` relation manyToOne.
- **Per atleta** → `atleta` relation, oppure split in due content-type:
  `libreria-esercizio` (asset riusabile) + `allenamento` (data + atleta + riferimento all'esercizio).

Finché non è chiaro, si parte con **catalogo condiviso per `data`**.

## Relazioni

- `coach` → manyToOne (opzionale)
- eventuale `squadra` / `atleta` a seconda della decisione sopra

## Isolamento

**Condiviso** nella prima versione. Diventa **privato** se si passa all'assegnazione per atleta.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `find`, `findOne` | sì |
| `create`, `update`, `delete` | no |

## Decisioni aperte

- Assegnazione condivisa / per squadra / per atleta (vedi sopra).
- `video` upload vs `videoUrl` esterno.
- Serve tracciare "completato" dall'atleta? (in tal caso serve un content-type
  `completamento-allenamento` o un campo su relazione)
- La settimana mostrata: sempre ultimi 7 giorni o una "settimana di programma" con range esplicito?

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `training.tsx` e `index.tsx`.
- **2026-09-05** — decisione chiusa: piano **per singolo atleta**. Creato lo schema
  `api::allenamento.allenamento`, l'endpoint `me` e il service condiviso `findForUser` su `atleta`.
  Seedato il permesso `me` per il ruolo Atleta.
