# Membro staff

**Stato:** 📝 Da creare — **opzionale**

## Scopo

Anagrafica dello staff tecnico citato nei contenuti (coach di un video, autore di un modulo mental
coach). Utile solo per attribuire e mostrare "con Coach Marco".

## Schermate / mock di riferimento

- `profoot-lab-frontend/src/routes/index.tsx` — "con Coach Marco"
- `profoot-lab-frontend/src/routes/i18n.tsx` (namespace `home`) — "Coach Marco"
- nessuna schermata dedicata; compare solo come attribuzione

## UID e kind

- UID previsto: `api::membro-staff.membro-staff`
- Kind: `collectionType`
- Draft & Publish: **off**

## Campi

| Campo | Tipo Strapi | Obbligatorio | Note |
| --- | --- | --- | --- |
| `nome` | string | sì | |
| `ruolo` | enumeration | sì | `preparatore_atletico`, `allenatore`, `nutrizionista`, `mental_coach`, `fisioterapista`, `medico` |
| `foto` | media (single, images) | no | |
| `bio` | text | no | |
| `user` | relation oneToOne → `plugin::users-permissions.user` | no | solo se lo staff accede all'app |

## Relazioni

- reverse da `api::allenamento.allenamento` (`coach`)
- reverse da `api::modulo-mental-coach.modulo-mental-coach` (`autore`)

## Isolamento

**Condiviso** (sola lettura per l'atleta).

## Permessi ruolo Atleta

| Azione | Abilitare |
| --- | --- |
| `find`, `findOne` | sì (se il frontend mostra schede staff) |
| `create`, `update`, `delete` | no |

## Decisioni aperte

- Serve davvero, o basta un campo `coach` string su `allenamento`? Per la v1 probabilmente **una
  stringa basta**; introdurre il content-type quando si vuole una scheda staff con foto/bio.
- Lo staff avrà un proprio accesso all'app (ruolo U&P separato) o resta solo back-office Strapi?

## Changelog

- **2026-09-04** — proposta iniziale (opzionale) dai riferimenti "Coach Marco" nei mock.
