/**
 * video-coach controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::video-coach.video-coach', ({ strapi }) => ({
  /**
   * GET /api/video-coach/me
   *
   * Video coach assegnati all'atleta collegato all'utente autenticato, dal più recente (c'è un
   * video al giorno), limitati agli ultimi 15 (limit fisso lato server — Document Service API,
   * non la query REST `pagination[limit]`, quindi non richiedibile dal client). Il contenuto è
   * per singolo atleta: nessun filtro/populate/limite arbitrario accettato dal client, lo scoping
   * è sempre sull'atleta della richiesta corrente (per questo il ruolo Atleta non ha `find`/
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

    const videoCoach = await strapi.documents('api::video-coach.video-coach').findMany({
      filters: { atleta: { id: atleta.id } },
      sort: { data: 'desc' },
      populate: { copertina: true },
      limit: 15,
    });

    const contentType = strapi.contentType('api::video-coach.video-coach');
    const sanitized = await strapi.contentAPI.sanitize.output(videoCoach, contentType, {
      auth: ctx.state.auth,
    });

    ctx.body = { data: sanitized };
  },
}));
