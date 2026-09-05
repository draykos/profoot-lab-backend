/**
 * infortunio controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::infortunio.infortunio', ({ strapi }) => ({
  /**
   * GET /api/infortunio/me[?stato=attivo]
   *
   * Storico infortuni dell'atleta collegato all'utente autenticato, dal più recente
   * (`dataInsorgenza` decrescente). Dato sanitario: nessun filtro/populate arbitrario accettato
   * dal client oltre al filtro opzionale `stato`; lo scoping è sempre sull'atleta della richiesta.
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

    const { stato } = ctx.query as { stato?: string };
    const filters: Record<string, unknown> = { atleta: { id: atleta.id } };
    if (typeof stato === 'string' && stato.length > 0) {
      filters.stato = stato;
    }

    const infortuni = await strapi.documents('api::infortunio.infortunio').findMany({
      filters,
      sort: { dataInsorgenza: 'desc' },
    });

    const contentType = strapi.contentType('api::infortunio.infortunio');
    const sanitized = await strapi.contentAPI.sanitize.output(infortuni, contentType, {
      auth: ctx.state.auth,
    });

    ctx.body = { data: sanitized };
  },
}));
