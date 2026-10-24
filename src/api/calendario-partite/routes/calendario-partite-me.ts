/**
 * Custom route: GET /api/calendario-partite/me
 *
 * Path deliberately different from `/api/calendari-partite/:id` (core route, plural) — same
 * pattern as `/api/atleta/me`, `/api/piano-alimentare/me`, `/api/allenamento/me`.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/calendario-partite/me',
      handler: 'calendario-partite.me',
      config: {
        policies: [],
      },
    },
  ],
};
