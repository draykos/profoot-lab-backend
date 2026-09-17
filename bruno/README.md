# Bruno collection — Profoot-Lab backend

Collection [Bruno](https://www.usebruno.com/) per investigare le API dello Strapi di produzione
(`https://profoot-lab-backend.onrender.com`).

## Uso

1. Apri questa cartella (`profoot-lab-backend/bruno`) in Bruno come collection.
2. Seleziona l'environment **Production** in alto a destra.
3. Esegui `Auth/Login (atleta1)` — salva il JWT nella variabile di sessione `token` (non persistita
   su disco). Tutte le altre richieste ereditano l'auth bearer dalla collection.
4. Esegui le altre richieste, organizzate una cartella per content-type.

## Note

- Le entità private (`Atleta`, `Allenamenti`, `Test fisici`, `Infortuni`, `Piano alimentare`,
  `Highlight`, `Video coach`) espongono solo un endpoint custom `/me`, scoping automatico
  sull'atleta autenticato — non hanno una rotta REST plurale accessibile dal ruolo Atleta.
- `Squadre` e `Partite` sono cataloghi condivisi: espongono le rotte REST standard (`find`/`findOne`).
- `membro-staff` non è ancora stato creato in Strapi (vedi
  `../docs/content-types/README.md`), quindi non ha una cartella qui — aggiungerla quando esisterà.
