/**
 * piano-alimentare controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::piano-alimentare.piano-alimentare',
  ({ strapi }) => ({
    /**
     * GET /api/piano-alimentare/me
     *
     * Piani alimentari dell'atleta collegato all'utente autenticato, dal più recente
     * (`validoDal` decrescente). Ritorna tutti i piani, non solo quello "attivo": la logica per
     * decidere qual è il piano corrente (più piani per giorno-tipo? uno solo alla volta?) non è
     * ancora decisa — vedi docs/content-types/piano-alimentare.md — quindi la scelta resta al
     * client per ora.
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

      const piani = await strapi.documents('api::piano-alimentare.piano-alimentare').findMany({
        filters: { atleta: { id: atleta.id } },
        sort: { validoDal: 'desc' },
      });

      const contentType = strapi.contentType('api::piano-alimentare.piano-alimentare');
      const sanitized = await strapi.contentAPI.sanitize.output(piani, contentType, {
        auth: ctx.state.auth,
      });

      ctx.body = { data: sanitized };
    },
  })
);
