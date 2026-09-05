/**
 * allenamento controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::allenamento.allenamento', ({ strapi }) => ({
  /**
   * GET /api/allenamento/me
   *
   * Allenamenti assegnati all'atleta collegato all'utente autenticato, dal più recente. Il piano
   * è per singolo atleta: nessun filtro/populate arbitrario accettato dal client, lo scoping è
   * sempre sull'atleta della richiesta corrente (per questo il ruolo Atleta non ha `find`/
   * `findOne` su questo content-type, solo questa azione).
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

    const allenamenti = await strapi.documents('api::allenamento.allenamento').findMany({
      filters: { atleta: { id: atleta.id } },
      sort: { data: 'desc' },
      populate: { video: true, copertina: true },
    });

    const contentType = strapi.contentType('api::allenamento.allenamento');
    const sanitized = await strapi.contentAPI.sanitize.output(allenamenti, contentType, {
      auth: ctx.state.auth,
    });

    ctx.body = { data: sanitized };
  },
}));
