/**
 * test-fisico controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::test-fisico.test-fisico', ({ strapi }) => ({
  /**
   * GET /api/test-fisico/me[?tipo=squat_jump]
   *
   * Storico dei test fisici dell'atleta collegato all'utente autenticato, dal più vecchio al più
   * recente (comodo per il grafico trend). `tipo` è un filtro opzionale sull'enum; qualunque altro
   * filtro/populate del client viene ignorato — lo scoping è sempre sull'atleta della richiesta.
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
      filters.tipo = tipo;
    }

    const testFisici = await strapi.documents('api::test-fisico.test-fisico').findMany({
      filters,
      sort: { data: 'asc' },
    });

    const contentType = strapi.contentType('api::test-fisico.test-fisico');
    const sanitized = await strapi.contentAPI.sanitize.output(testFisici, contentType, {
      auth: ctx.state.auth,
    });

    ctx.body = { data: sanitized };
  },
}));
