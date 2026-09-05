/**
 * highlight controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::highlight.highlight', ({ strapi }) => ({
  /**
   * GET /api/highlight/me[?inEvidenza=true]
   *
   * Clip dell'atleta collegato all'utente autenticato, dalla più recente (`data` decrescente).
   * Filtro opzionale `inEvidenza` per isolare la "top clip"; nessun altro filtro/populate
   * arbitrario accettato dal client.
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

    const { inEvidenza } = ctx.query as { inEvidenza?: string };
    const filters: Record<string, unknown> = { atleta: { id: atleta.id } };
    if (inEvidenza === 'true' || inEvidenza === 'false') {
      filters.inEvidenza = inEvidenza === 'true';
    }

    const highlights = await strapi.documents('api::highlight.highlight').findMany({
      filters,
      sort: { data: 'desc' },
      populate: { copertina: true, clip: true, avversario: true },
    });

    const contentType = strapi.contentType('api::highlight.highlight');
    const sanitized = await strapi.contentAPI.sanitize.output(highlights, contentType, {
      auth: ctx.state.auth,
    });

    ctx.body = { data: sanitized };
  },
}));
