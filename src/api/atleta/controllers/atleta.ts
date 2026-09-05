/**
 * atleta controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::atleta.atleta', ({ strapi }) => ({
  /**
   * GET /api/atleta/me
   *
   * Profilo dell'atleta collegato all'utente autenticato. Non accetta filtri dal client:
   * l'unico scoping possibile è sull'utente della richiesta corrente, quindi non serve una
   * policy di ownership separata — a differenza di `find`/`findOne`, che restano senza
   * permessi per il ruolo Atleta.
   */
  async me(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized();
    }

    const found = await strapi.service('api::atleta.atleta').findForUser(userId);

    if (!found) {
      return ctx.notFound('Nessun profilo atleta collegato a questo utente');
    }

    // `findForUser` è condiviso con gli altri endpoint `me` e non popola nulla; qui recuperiamo
    // l'avatar con una seconda query mirata invece di appesantire il service comune.
    const atleta = await strapi.documents('api::atleta.atleta').findOne({
      documentId: found.documentId,
      populate: { avatar: true },
    });

    // Niente `this.sanitizeOutput`/`this.transformResponse`: con la firma a oggetto del
    // factory il typing di `this` non è affidabile (vedi TS2722). Si passa dal livello
    // contentAPI, che è completamente tipato.
    const contentType = strapi.contentType('api::atleta.atleta');
    const sanitized = await strapi.contentAPI.sanitize.output(atleta, contentType, {
      auth: ctx.state.auth,
    });

    ctx.body = { data: sanitized };
  },
}));
