'use strict';

/**
 * Backfill for the new required `titolo` attribute of `api::piano-alimentare.piano-alimentare`.
 *
 * Strapi runs user migrations BEFORE syncing the schema, so on the first boot after this change
 * the `titolo` column does not exist yet: we create it here (same type Strapi would create for a
 * `string` attribute), then give every existing row a placeholder title for the admins to fix by
 * hand. The following schema sync finds the column already in place and leaves it alone.
 *
 * Runs once per database (tracked in `strapi_migrations`).
 */
const TABLE = 'piani_alimentari';
const COLUMN = 'titolo';
const PLACEHOLDER = 'Dieta 1';

module.exports = {
  async up(knex) {
    // Fresh database: the table will be created by the schema sync, nothing to backfill.
    if (!(await knex.schema.hasTable(TABLE))) return;

    if (!(await knex.schema.hasColumn(TABLE, COLUMN))) {
      await knex.schema.alterTable(TABLE, (table) => {
        table.string(COLUMN, 255);
      });
    }

    await knex(TABLE)
      .where((qb) => qb.whereNull(COLUMN).orWhere(COLUMN, ''))
      .update({ [COLUMN]: PLACEHOLDER });
  },

  async down() {
    // Not reversible: the column belongs to the content-type schema.
  },
};
