/**
 * Custom route: GET /api/video-coach/me
 *
 * Kept at `/video-coach/me` (the path the app already calls) after the move to the
 * `video-coach-atleta` content-type; distinct from the core route `/api/video-coach-atleti/:id`.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/video-coach/me',
      handler: 'video-coach-atleta.me',
      config: {
        policies: [],
      },
    },
  ],
};
