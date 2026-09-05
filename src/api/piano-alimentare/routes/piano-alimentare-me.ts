/**
 * Custom route: GET /api/piano-alimentare/me
 *
 * Path deliberatamente diverso da `/api/piani-alimentari/:id` (rotta core, plurale) — stesso
 * pattern di `/api/atleta/me`, `/api/allenamento/me`, `/api/test-fisico/me`, `/api/infortunio/me`.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/piano-alimentare/me',
      handler: 'piano-alimentare.me',
      config: {
        policies: [],
      },
    },
  ],
};
