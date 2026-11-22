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
  // video-coach-atleta: one video coach per athlete (one video a day), private data —
  // only the self-scoped `me` action (see docs/content-types/video-coach.md)
  'api::video-coach-atleta.video-coach-atleta.me',
  // calendario-partite: one match calendar per athlete, private data — only `me`
  // (see docs/content-types/calendario-partite.md)
  'api::calendario-partite.calendario-partite.me',
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

/**
 * Default entries of the test type catalog (`api::tipo-test.tipo-test`). Idempotent: only the
 * `codice` values not yet present are created, so admins can rename or edit seeded types freely.
 * See docs/content-types/tipo-test.md.
 */
const TIPI_TEST_SEED = [
  { codice: 'squat_jump', nome: 'Squat jump', unita: 'cm', direzioneMigliora: 'su' },
  { codice: 'cmj', nome: 'CMJ', unita: 'cm', direzioneMigliora: 'su' },
  { codice: 'sprint_20m', nome: 'Sprint 20 m', unita: 's', direzioneMigliora: 'giu' },
  { codice: 'sprint_30m', nome: 'Sprint 30 m', unita: 's', direzioneMigliora: 'giu' },
  { codice: 'yoyo_ir1', nome: 'Yo-Yo IR1', unita: 'm', direzioneMigliora: 'su' },
  { codice: 'illinois', nome: 'Illinois agility', unita: 's', direzioneMigliora: 'giu' },
] as const;

async function ensureTipiTest({ strapi }: { strapi: Core.Strapi }) {
  const tipiTest = strapi.documents('api::tipo-test.tipo-test');
  const existing = await tipiTest.findMany({ fields: ['codice'] });
  const existingCodici = new Set(existing.map((tipo) => tipo.codice));

  for (const tipo of TIPI_TEST_SEED) {
    if (existingCodici.has(tipo.codice)) continue;
    await tipiTest.create({ data: { ...tipo } });
    strapi.log.info(`[bootstrap] Tipo test "${tipo.codice}" creato.`);
  }
}

/**
 * Admin "Entry title" (content-manager `mainField`) to enforce per content-type. The view
 * configuration lives in the database, not in code, so we set it at boot to have it applied on
 * every environment (including production) without manual steps in the admin.
 *
 * Only overrides the `documentId` fallback Strapi picks when a type has no string field: if an
 * admin later chooses a different title from "Configure the view", that choice is preserved.
 */
const ENTRY_TITLES: Record<string, string> = {
  'api::piano-alimentare.piano-alimentare': 'titolo',
};

async function ensureEntryTitles({ strapi }: { strapi: Core.Strapi }) {
  const contentTypes = strapi.plugin('content-manager').service('content-types');

  for (const [uid, mainField] of Object.entries(ENTRY_TITLES)) {
    const contentType = strapi.contentTypes[uid as keyof typeof strapi.contentTypes];
    if (!contentType) continue;

    const configuration = await contentTypes.findConfiguration(contentType);
    if (configuration?.settings?.mainField !== 'documentId') continue;

    await contentTypes.updateConfiguration(contentType, {
      ...configuration,
      settings: { ...configuration.settings, mainField },
    });
    strapi.log.info(`[bootstrap] Entry title of "${uid}" set to "${mainField}".`);
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
    await ensureTipiTest({ strapi });
    await ensureEntryTitles({ strapi });
  },
};
