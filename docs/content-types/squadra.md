# Squadra

**Stato:** ✅ Creato — schema, relazione con `atleta`, permessi Atleta seedati

## Schema reale creato

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

- Serve davvero come content-type, o le partite possono tenere `squadraCasa`/`squadraTrasferta` come
  semplici stringhe finché non c'è un logo da mostrare? (Il mock usa stringhe.)
- Se l'app è mono-club, `isMiaSquadra` può bastare; con più club servirà un livello `club`.

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `matches.tsx`.
- **2026-09-05** — creato lo schema `api::squadra.squadra`, collegata la relazione con `atleta`
  (era rimandata), seedati i permessi di lettura per il ruolo Atleta.
