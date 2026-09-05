/**
 * Custom route: GET /api/allenamento/me
 *
 * Path deliberatamente diverso da `/api/allenamenti/:id` (rotta core, plurale) — stesso pattern
 * di `/api/atleta/me`.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/allenamento/me',
      handler: 'allenamento.me',
      config: {
        policies: [],
      },
    },
  ],
};
