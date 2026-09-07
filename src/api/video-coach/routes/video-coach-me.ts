/**
 * Custom route: GET /api/video-coach/me
 *
 * Path deliberatamente diverso da `/api/video-coaches/:id` (rotta core, plurale) — stesso pattern
 * di `/api/atleta/me`, `/api/allenamento/me` e `/api/test-fisico/me`.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/video-coach/me',
      handler: 'video-coach.me',
      config: {
        policies: [],
      },
    },
  ],
};
