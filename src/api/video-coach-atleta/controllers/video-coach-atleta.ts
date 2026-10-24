/**
 * video-coach-atleta controller
 */

import { factories } from '@strapi/strapi';
import { resolveThumbnailUrl } from '../../../utils/bunny-stream';

export default factories.createCoreController(
  'api::video-coach-atleta.video-coach-atleta',
  ({ strapi }) => ({
    /**
     * GET /api/video-coach/me
     *
     * Videos from the video coach of the athlete linked to the authenticated user (one entry per
     * athlete, videos as a repeatable component), most recent `data` first, capped at the latest
     * 15 server-side. Per-athlete content: no client filters/populate/limits are accepted and
     * scoping is always on the current request's athlete (which is why the Atleta role has no
     * `find`/`findOne` on this content-type, only this action). The response is a flat array of
     * videos, the same shape as before the move to one entry per athlete.
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

      const videoCoach = await strapi
        .documents('api::video-coach-atleta.video-coach-atleta')
        .findFirst({
          filters: { atleta: { id: atleta.id } },
          populate: ['video'],
        });

      const contentType = strapi.contentType('api::video-coach-atleta.video-coach-atleta');
      const sanitized = (await strapi.contentAPI.sanitize.output(videoCoach, contentType, {
        auth: ctx.state.auth,
      })) as { video?: { data: string; video: string }[] } | null;

      // Repeatable components keep the order they were entered in the admin: sort and cap here.
      const videos = [...(sanitized?.video ?? [])]
        .sort((a, b) => b.data.localeCompare(a.data))
        .slice(0, 15);

      // `thumbnail` is not a stored attribute: it's resolved from Bunny Stream on every response
      // (cached), since the thumbnail file name can change when a custom one is set in Bunny.
      const data = await Promise.all(
        videos.map(async (v) => ({
          ...v,
          thumbnail: await resolveThumbnailUrl(v.video, strapi.log),
        })),
      );

      ctx.body = { data };
    },
  }),
);
