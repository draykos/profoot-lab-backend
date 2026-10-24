/**
 * calendario-partite controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::calendario-partite.calendario-partite',
  ({ strapi }) => ({
    /**
     * GET /api/calendario-partite/me
     *
     * Matches of the athlete linked to the authenticated user, taken from their calendar (one
     * per athlete) and sorted by `dataOra` ascending. Returns every match, including those already
     * played: picking the "next match" (first with `dataOra >= now`) is left to the client.
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

      const calendario = await strapi
        .documents('api::calendario-partite.calendario-partite')
        .findFirst({
          filters: { atleta: { id: atleta.id } },
          populate: ['partite'],
        });

      const contentType = strapi.contentType('api::calendario-partite.calendario-partite');
      const sanitized = (await strapi.contentAPI.sanitize.output(calendario, contentType, {
        auth: ctx.state.auth,
      })) as { partite?: { dataOra: string }[] } | null;

      // Repeatable components keep the order they were entered in the admin, which is not
      // necessarily chronological: sort them here so the client gets a ready-to-use calendar.
      const partite = [...(sanitized?.partite ?? [])].sort(
        (a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime(),
      );

      ctx.body = { data: partite };
    },
  }),
);
