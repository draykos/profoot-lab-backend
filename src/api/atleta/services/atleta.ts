/**
 * atleta service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::atleta.atleta', ({ strapi }) => ({
  /**
   * Trova l'atleta collegato a uno user id, o `null` se non esiste. Punto unico riusato dagli
   * endpoint `me` degli altri content-type privati per-atleta (allenamento, test-fisico,
   * infortunio, piano-alimentare, highlight, ...) per evitare di duplicare la query in ogni
   * controller.
   */
  async findForUser(userId: number | string) {
    const [atleta] = await strapi.documents('api::atleta.atleta').findMany({
      filters: { user: { id: userId } },
      limit: 1,
    });
    return atleta ?? null;
  },
}));
