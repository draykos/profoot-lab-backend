# Modulo mental coach

**Stato:** ✅ Creato

## Schema reale creato

- File: `src/api/modulo-mental-coach/content-types/modulo-mental-coach/schema.json` (+ factory
  `controllers/routes/services`)
- UID: `api::modulo-mental-coach.modulo-mental-coach` · tabella `moduli_mental_coach` ·
  `draftAndPublish: true`
- **Nessuna relazione con `atleta`** (catalogo condiviso, come da proposta) — primo content-type di
  questo giro senza il rischio noto di crash da relazione bidirezionale: reload pulito al primo colpo
- `audio`/`video`/`copertina` come media upload (non URL esterno), `trascrizione` come richtext
- Permessi Atleta seedati in `bootstrap()`: `find`, `findOne` (nessun endpoint `me` necessario, è
  condiviso)

Verificato: `GET /api/moduli-mental-coach` senza token → `403` ✅.

---

## Scopo

Contenuto guidato di preparazione mentale (respirazione, visualizzazione, recupero). La sezione
frontend è ancora "in arrivo" ma mostra già un'anteprima di moduli.

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/mental.tsx`:
  - `m1` "Respirazione 4-7-8" — "5 min · Pre-partita"
  - `m2` "Visualizzazione dell'azione" — "8 min · Focus"
  - `m3` "Recupero mentale notturno" — "12 min · Sonno"
  - stato UI: "Sezione in fase di sviluppo — presto disponibile"
- categorie viste: Pre-partita, Focus, Sonno

## UID e kind

- UID previsto: `api::modulo-mental-coach.modulo-mental-coach`
- Kind: `collectionType`
- Draft & Publish: **on**

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `titolo` | string | sì | |
| `descrizione` | text | no | |
| `categoria` | enumeration | sì | `pre_partita`, `focus`, `sonno`, `stress`, `recupero` (estendibile) |
| `durataMinuti` | integer | no | "5 min" |
| `audio` | media (single) **oppure** `audioUrl` string | no | contenuto principale probabile |
| `video` | media (single) **oppure** `videoUrl` string | no | alternativa all'audio |
| `copertina` | media (single, images) | no | |
| `trascrizione` | richtext | no | testo della sessione |
| `ordine` | integer | no | ordinamento nell'elenco |

## Assegnazione

Prima versione: **catalogo condiviso**. In futuro eventuale `percorso-mentale` (sequenza di moduli
assegnata a un atleta dallo staff).

## Relazioni

- eventuale `autore` → `api::membro-staff.membro-staff` (opzionale)

## Isolamento

**Condiviso.**

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `find`, `findOne` | sì |
| `create`, `update`, `delete` | no |

## Decisioni aperte

- Contenuto principale: audio, video o entrambi? Upload vs URL esterno.
- Serve tracciare completamento / preferiti / streak dell'atleta?
- Percorsi guidati (sequenze) o solo moduli singoli?
- La sezione resta "coming soon" nel frontend finché non ci sono N moduli pubblicati?

## Changelog

- **2026-09-04** — proposta iniziale dai mock di `mental.tsx`.
- **2026-09-05** — creato lo schema `api::modulo-mental-coach.modulo-mental-coach` come catalogo
  condiviso (nessuna relazione con `atleta`). Seedati i permessi `find`/`findOne` per il ruolo
  Atleta.
