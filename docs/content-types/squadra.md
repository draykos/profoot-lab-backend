# Squadra

**Stato:** ❌ Rimosso (2026-09-18) — content-type eliminato, i campi che la referenziavano sono
diventati stringhe libere. Vedi Changelog in fondo per i dettagli; il resto di questo file è storico.

## Schema reale creato (storico, rimosso il 2026-09-18)

- File: `src/api/squadra/content-types/squadra/schema.json` (+ factory `controllers/routes/services`)
- UID: `api::squadra.squadra` · tabella `squadre` · `draftAndPublish: false`
- Tabelle DB verificate: `squadre`, `atleti_squadra_lnk`
- Relazione bidirezionale con `atleta`: `atleta.squadra` (manyToOne) ↔ `squadra.atleti` (oneToMany)
- Permessi Atleta seedati in `bootstrap()`: `find`, `findOne` (catalogo condiviso, come da design)
- `GET /api/squadre` senza token → `403` (Public correttamente escluso) ✅

Nessuna differenza rispetto alla proposta originale sotto: tutti i campi creati come pianificato.

---

## Scopo

Anagrafica delle squadre: quella dell'atleta e le avversarie nel calendario partite.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/matches.tsx` — `home`/`away` come stringhe ("Milano FC", "Torino",
  "Napoli", "PSG", "Bologna"), `venue` ("San Siro", "Maradona", "Dall'Ara")
- `profoot-lab-frontend/src/routes/profile.tsx` — "Milano FC" nel ruolo
- `TeamBadge` genera le iniziali dal nome (nessun logo nel mock)

## UID e kind

- UID previsto: `api::squadra.squadra`
- Kind: `collectionType`
- Draft & Publish: **off**

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `nome` | string | sì | unico |
| `nomeBreve` | string | no | per badge/UI compatta |
| `logo` | media (single, images) | no | fallback: iniziali |
| `citta` | string | no | |
| `stadio` | string | no | usato come `venue` quando gioca in casa |
| `isMiaSquadra` | boolean | no | marca la squadra dell'atleta/club proprietario dell'app |

## Relazioni

- reverse da `api::atleta.atleta` (`squadra`)
- reverse da `api::partita.partita` (`squadraCasa`, `squadraTrasferta`)

## Isolamento

**Condiviso.** Catalogo pubblico per gli utenti autenticati.

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `find`, `findOne` | sì |
| `create`, `update`, `delete` | no |

## Decisioni aperte

~~Serve davvero come content-type, o le partite possono tenere `squadraCasa`/`squadraTrasferta` come
semplici stringhe finché non c'è un logo da mostrare?~~ — **chiuso: rimosso, vedi Changelog.**

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `matches.tsx`.
- **2026-09-05** — creato lo schema `api::squadra.squadra`, collegata la relazione con `atleta`
  (era rimandata), seedati i permessi di lettura per il ruolo Atleta.
- **2026-09-18** — **rimosso.** L'unico campo effettivamente consumato dal frontend era `nome`
  (via `atleta.squadra` in `/profile`); `partita.squadraCasa`/`squadraTrasferta` e
  `highlight.avversario` non erano ancora collegati a nessuna schermata reale (mock ancora a
  stringhe). Dati in DB trascurabili (1 riga in `squadre`, 0 collegamenti reali). Le tre relazioni
  sono state sostituite da campi `string` liberi sui content-type che le usavano — vedi
  [atleta.md](atleta.md), [partita.md](partita.md), [highlight.md](highlight.md). Content-type
  `squadra` eliminato (`src/api/squadra/`), permessi rimossi dal seed in `src/index.ts`. Tabelle
  DB orfane (`squadre`, `atleti_squadra_lnk`, `partite_squadra_casa_lnk`,
  `partite_squadra_trasferta_lnk`, `highlights_avversario_lnk`) e permessi orfani in
  `up_permissions` da pulire a mano (stesso pattern già seguito per `modulo-mental-coach`).
