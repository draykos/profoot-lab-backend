/**
 * Custom route: GET /api/test-fisico/me
 *
 * Path deliberatamente diverso da `/api/test-fisici/:id` (rotta core, plurale) — stesso pattern
 * di `/api/atleta/me` e `/api/allenamento/me`.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/test-fisico/me',
      handler: 'test-fisico.me',
      config: {
        policies: [],
      },
    },
  ],
};
