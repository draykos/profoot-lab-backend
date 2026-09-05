/**
 * Custom route: GET /api/atleta/me
 *
 * Path deliberatamente diverso da `/api/atleti/:id` (rotta core, plurale) per evitare qualunque
 * ambiguità di matching tra i due router.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/atleta/me',
      handler: 'atleta.me',
      config: {
        policies: [],
      },
    },
  ],
};
