/**
 * Custom route: GET /api/highlight/me
 *
 * Path deliberatamente diverso da `/api/highlights/:id` (rotta core, plurale) — stesso pattern
 * degli altri endpoint `me` privati per-atleta.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/highlight/me',
      handler: 'highlight.me',
      config: {
        policies: [],
      },
    },
  ],
};
