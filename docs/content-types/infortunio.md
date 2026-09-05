# Infortunio

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/infortunio/content-types/infortunio/schema.json` (+ factory
  `controllers/routes/services`)
- UID: `api::infortunio.infortunio` · tabella `infortuni` · `draftAndPublish: false`
- Tabelle DB verificate: `infortuni`, `infortuni_atleta_lnk`
- **Decisione presa:** `zona` come **enum di 17 zone anatomiche predefinite**, side-agnostiche
  (il lato è nel campo `lato` separato): `testa_collo`, `spalla`, `gomito`, `polso_mano`, `torace`,
  `addome`, `lombare`, `anca`, `flessore_anca`, `adduttori`, `quadricipite`, `ischiocrurale`,
  `ginocchio`, `polpaccio`, `tendine_achilleo`, `caviglia`, `piede`. Le 5 zone del mock rientrano
  tutte (`flessore_anca`, `caviglia`, `spalla`, `ischiocrurale`, `lombare`).
- `posizioneTop`/`posizioneLeft` **restano per-infortunio** (non derivate da `zona`) — vedi
  decisioni ancora aperte sotto, indipendente dalla scelta sull'enum.
- `stato` con `default: "attivo"`.

## Endpoint creato

`GET /api/infortunio/me[?stato=attivo]` — stesso pattern degli altri privati: risolve l'atleta via
`findForUser`, filtra per `atleta.id`, ordina per `dataInsorgenza` decrescente. Filtro opzionale
`stato`. Permessi seedati in `bootstrap()`: solo `api::infortunio.infortunio.me` — **nessun**
`find`/`findOne`, anche più giustificato qui trattandosi di dato sanitario.

Verificato: `GET /api/infortuni` e `GET /api/infortunio/me` senza token → `403` ✅.

## ⚠️ Stesso incidente noto (relazione bidirezionale con `atleta`)

Vedi [allenamento.md](allenamento.md) e [test-fisico.md](test-fisico.md) — stessa finestra di
reload transitoria, stesso fix (riavvio manuale), nessun errore reale nel codice.

## Scopo

Zona anatomica con un problema fisico (attivo, in recupero o risolto), posizionata sulla mappa
corporea front/retro, con nota clinica e indicazioni. Alimenta la mappa corporea e l'alert in
dashboard.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/body.tsx` — array `zones`:
  - `nameKey` ("Flessore sinistro", "Caviglia destra", "Spalla destra", "Ischiocrurale destro",
    "Zona lombare")
  - `noteKey` (es. "Recidiva lieve. Evita carichi esplosivi per 5 giorni.")
  - `view`: `front` | `back`
  - `top` / `left`: percentuali di posizione sul pin della mappa ("58%", "42%")
  - `severity`: `alert` | `warn` | `ok`
  - `statusKey`: `active` | `recovering` | `resolved`
  - `date`: "12/03/2024"
- `profoot-lab-frontend/src/routes/index.tsx` — "Alert corpo: Flessore sinistro" /
  "Recidiva lieve • Evita carichi esplosivi" (= infortunio con `stato` attivo)

## UID e kind

- UID previsto: `api::infortunio.infortunio`
- Kind: `collectionType`
- Draft & Publish: **off**

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `atleta` | relation manyToOne → `api::atleta.atleta` | sì | |
| `zona` | string | sì | "Flessore sinistro"; valutare enum di zone anatomiche |
| `lato` | enumeration | no | `sinistro`, `destro`, `centrale` |
| `vista` | enumeration | sì | `fronte`, `retro` — su quale immagine mostrare il pin |
| `posizioneTop` | decimal | sì | percentuale 0–100 |
| `posizioneLeft` | decimal | sì | percentuale 0–100 |
| `gravita` | enumeration | sì | `alert` (grave/attivo), `warn` (attenzione), `ok` (risolto) — guida il colore |
| `stato` | enumeration | sì | `attivo`, `in_recupero`, `risolto` |
| `diagnosi` | string | no | "Distorsione grado I" |
| `indicazioni` | text | no | testo mostrato nel dettaglio |
| `dataInsorgenza` | date | sì | `date` nel mock |
| `dataRisoluzione` | date | no | valorizzata quando `stato = risolto` |

`gravita` e `stato` sono correlati ma non identici (il mock li tiene separati: `severity` guida il
colore, `statusKey` l'etichetta). Valutare se derivare `gravita` da `stato` + un flag.

## Relazioni

- `atleta` → manyToOne

## Isolamento

**Privato — dato sensibile (salute).** Solo gli infortuni del proprio `atleta`. `find` filtrato per
ownership obbligatorio; considerare accesso anche per lo staff medico (ruolo dedicato in futuro).

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `me` (custom) | sì — self-scoped, sostituisce `find`/`findOne` |
| `find`, `findOne`, `create`, `update`, `delete` | no — mai aperti; gestito dallo staff medico |

## Decisioni aperte

- ~~`zona` libera vs enum~~ — **chiuso: enum di 17 zone anatomiche predefinite** (2026-09-05).
- `posizioneTop/Left` per infortunio, oppure coordinate fisse per `zona` (l'atleta non le sposta)?
  Se fisse, meglio un content-type/enum `zona-anatomica` con le coordinate. **Ancora aperto** —
  per ora restano per-infortunio.
- Serve una storia clinica per infortunio (più aggiornamenti nel tempo)? In tal caso content-type
  figlio `aggiornamento-infortunio`.
- Dato sanitario: verificare requisiti privacy/consenso prima di persistere diagnosi.

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `body.tsx` e `index.tsx`.
- **2026-09-05** — creato lo schema `api::infortunio.infortunio` (decisione chiusa: enum `zona`
  fisso, 17 valori). Creato l'endpoint `me` (con filtro opzionale `?stato=`) e seedato il permesso
  per il ruolo Atleta.
