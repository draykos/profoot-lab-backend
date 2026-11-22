/**
 * test-fisico controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::test-fisico.test-fisico', ({ strapi }) => ({
  /**
   * GET /api/test-fisico/me[?tipo=squat_jump]
   *
   * Physical test history of the athlete linked to the authenticated user, oldest first (handy
   * for the trend chart). `tipo` is an optional filter on the `codice` of the test type catalog
   * (`api::tipo-test.tipo-test`); each item comes with its `tipoTest` populated (name, code, unit,
   * improvement direction). Any other client filter/populate is ignored — scoping is always on
   * the requesting athlete.
   */
  async me(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized();
    }

    const atleta = await strapi.service('api::atleta.atleta').findForUser(userId);
    if (!atleta) {
      return ctx.notFound('Nessun profilo atleta collegato a questo utente');
    }

    const { tipo } = ctx.query as { tipo?: string };
    const filters: Record<string, unknown> = { atleta: { id: atleta.id } };
    if (typeof tipo === 'string' && tipo.length > 0) {
      filters.tipoTest = { codice: tipo };
    }

    const testFisici = await strapi.documents('api::test-fisico.test-fisico').findMany({
      filters,
      sort: { data: 'asc' },
      populate: { tipoTest: { fields: ['nome', 'codice', 'unita', 'direzioneMigliora'] } },
    });

    const contentType = strapi.contentType('api::test-fisico.test-fisico');
    const sanitized = await strapi.contentAPI.sanitize.output(testFisici, contentType, {
      auth: ctx.state.auth,
    });

    ctx.body = { data: sanitized };
  },
}));
