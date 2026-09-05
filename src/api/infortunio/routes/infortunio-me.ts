/**
 * Custom route: GET /api/infortunio/me
 *
 * Path deliberatamente diverso da `/api/infortuni/:id` (rotta core, plurale) — stesso pattern
 * di `/api/atleta/me`, `/api/allenamento/me`, `/api/test-fisico/me`.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/infortunio/me',
      handler: 'infortunio.me',
      config: {
        policies: [],
      },
    },
  ],
};
