import type { Core } from '@strapi/strapi';

/**
 * Azioni content-api da garantire al ruolo Atleta (`plugin::users-permissions.role.type ===
 * 'atleta'`). Idempotente: gira a ogni avvio, crea solo i permessi mancanti.
 *
 * Vedi profoot-lab-backend/docs/content-types/README.md § "Permessi ruolo Atleta" per la logica:
 * solo azioni self-scoped (`me`) o read-only su cataloghi condivisi, mai `find` aperto su dati
 * privati per-atleta.
 */
const ATLETA_ROLE_TYPE = 'atleta';

const ATLETA_ACTIONS = [
  'plugin::users-permissions.user.me',
  'api::atleta.atleta.me',
  // partita: calendario condiviso, sola lettura (vedi docs/content-types/partita.md)
  'api::partita.partita.find',
  'api::partita.partita.findOne',
  // allenamento: piano per singolo atleta, dato privato — solo l'azione self-scoped `me`,
  // mai `find`/`findOne` aperti (vedi docs/content-types/allenamento.md)
  'api::allenamento.allenamento.me',
  // test-fisico: storico misurazioni per singolo atleta, dato privato — solo `me`
  // (vedi docs/content-types/test-fisico.md)
  'api::test-fisico.test-fisico.me',
  // infortunio: dato sanitario per singolo atleta, privato — solo `me`
  // (vedi docs/content-types/infortunio.md)
  'api::infortunio.infortunio.me',
  // piano-alimentare: dato privato per singolo atleta — solo `me`
  // (vedi docs/content-types/piano-alimentare.md)
  'api::piano-alimentare.piano-alimentare.me',
  // highlight: dato privato per singolo atleta — solo `me`
  // (vedi docs/content-types/highlight.md)
  'api::highlight.highlight.me',
  // video-coach: video coach per singolo atleta (uno al giorno), dato privato —
  // solo l'azione self-scoped `me` (vedi docs/content-types/video-coach.md)
  'api::video-coach.video-coach.me',
];

async function ensureAtletaPermissions({ strapi }: { strapi: Core.Strapi }) {
  const role = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: ATLETA_ROLE_TYPE } });

  if (!role) {
    strapi.log.warn(
      `[bootstrap] Ruolo "${ATLETA_ROLE_TYPE}" non trovato: salto il seed dei permessi.`,
    );
    return;
  }

  for (const action of ATLETA_ACTIONS) {
    const existing = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: role.id } });

    if (!existing) {
      await strapi.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      });
      strapi.log.info(`[bootstrap] Permesso "${action}" assegnato al ruolo Atleta.`);
    }
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureAtletaPermissions({ strapi });
  },
};
