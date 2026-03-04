import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // ═══════════════════════════════════════════════════════════════════
    // organization_modules
    //   module_key (string) → module_id (INT FK)
    //   + addon_ids JSON column (replaces the organization_addons table)
    // ═══════════════════════════════════════════════════════════════════

    // 1. Add nullable module_id
    this.schema.alterTable('organization_modules', (table) => {
      table.integer('module_id').unsigned().nullable().after('org_id')
    })

    // 2. Add addon_ids JSON column (empty array by default)
    this.schema.alterTable('organization_modules', (table) => {
      table.json('addon_ids').notNullable().defaultTo('[]').after('module_id')
    })

    // 3. Populate module_id from the modules table via module_key
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE organization_modules om
        INNER JOIN modules m ON m.key = om.module_key
        SET om.module_id = m.id
      `)
    })

    // 4. Migrate addon data: for each (org_id, module_id) row collect all
    //    addon IDs from organization_addons (joined via module_key + addon_key)
    //    and store them as a JSON array.
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE organization_modules om
        INNER JOIN (
          SELECT
            oa.org_id,
            m.id AS module_id,
            JSON_ARRAYAGG(ma.id ORDER BY ma.id) AS ids
          FROM organization_addons oa
          INNER JOIN modules       m  ON m.key        = oa.module_key
          INNER JOIN module_addons ma ON ma.module_id  = m.id
                                     AND ma.name       = oa.addon_key
          WHERE oa.enabled = 1
          GROUP BY oa.org_id, m.id
        ) grouped
          ON grouped.org_id    = om.org_id
         AND grouped.module_id = om.module_id
        SET om.addon_ids = grouped.ids
      `)
    })

    // 5. Add new unique [org_id, module_id] (also backs the org_id FK)
    this.schema.alterTable('organization_modules', (table) => {
      table.unique(['org_id', 'module_id'], {
        indexName: 'organization_modules_org_id_module_id_unique',
      })
    })

    // 6. Drop old unique [org_id, module_key]
    this.schema.alterTable('organization_modules', (table) => {
      table.dropUnique(
        ['org_id', 'module_key'],
        'organization_modules_org_id_module_key_unique'
      )
    })

    // 7. Make module_id NOT NULL, add FK, then drop module_key
    this.defer(async (db) => {
      await db.rawQuery(
        'ALTER TABLE organization_modules MODIFY COLUMN module_id INT UNSIGNED NOT NULL'
      )
      await db.rawQuery(`
        ALTER TABLE organization_modules
        ADD CONSTRAINT fk_org_modules_module_id
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE RESTRICT
      `)
      await db.rawQuery('ALTER TABLE organization_modules DROP COLUMN module_key')
    })

    // ═══════════════════════════════════════════════════════════════════
    // Drop organization_addons — addon data now lives in org_modules.addon_ids
    // ═══════════════════════════════════════════════════════════════════
    this.schema.dropTableIfExists('organization_addons')
  }

  async down() {
    // ───────────────────────────────────────────────────────────────────
    // Recreate organization_addons and populate from addon_ids JSON
    // ───────────────────────────────────────────────────────────────────

    this.schema.createTable('organization_addons', (table) => {
      table.increments('id').notNullable()
      table
        .integer('org_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table.string('module_key', 50).notNullable().defaultTo('')
      table.string('addon_key', 100).notNullable()
      table.boolean('enabled').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.index(['org_id', 'module_key'], 'organization_addons_org_module_idx')
      table.unique(['org_id', 'module_key', 'addon_key'])
    })

    this.defer(async (db) => {
      // Expand addon_ids JSON back into individual rows
      await db.rawQuery(`
        INSERT INTO organization_addons (org_id, module_key, addon_key, enabled, created_at)
        SELECT
          om.org_id,
          m.key    AS module_key,
          ma.name  AS addon_key,
          1        AS enabled,
          NOW()    AS created_at
        FROM organization_modules om
        INNER JOIN modules       m  ON m.id       = om.module_id
        INNER JOIN module_addons ma ON ma.module_id = m.id
        CROSS JOIN JSON_TABLE(
          om.addon_ids,
          '$[*]' COLUMNS (addon_id INT PATH '$')
        ) AS jt
        WHERE jt.addon_id = ma.id
          AND JSON_LENGTH(om.addon_ids) > 0
      `)
    })

    // ───────────────────────────────────────────────────────────────────
    // Revert organization_modules: module_id → module_key, drop addon_ids
    // ───────────────────────────────────────────────────────────────────

    // 1. Restore module_key column
    this.schema.alterTable('organization_modules', (table) => {
      table.string('module_key', 50).nullable().after('org_id')
    })

    // 2. Repopulate module_key from modules table
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE organization_modules om
        INNER JOIN modules m ON m.id = om.module_id
        SET om.module_key = m.key
      `)
    })

    // 3. Make module_key NOT NULL
    this.defer(async (db) => {
      await db.rawQuery(
        'ALTER TABLE organization_modules MODIFY COLUMN module_key VARCHAR(50) NOT NULL'
      )
    })

    // 4. Restore old unique [org_id, module_key]
    this.schema.alterTable('organization_modules', (table) => {
      table.unique(['org_id', 'module_key'], {
        indexName: 'organization_modules_org_id_module_key_unique',
      })
    })

    // 5. Drop FK, new unique, addon_ids column, module_id column
    this.defer(async (db) => {
      await db.rawQuery(
        'ALTER TABLE organization_modules DROP FOREIGN KEY fk_org_modules_module_id'
      )
      await db.rawQuery(
        'ALTER TABLE organization_modules DROP INDEX organization_modules_org_id_module_id_unique'
      )
      await db.rawQuery('ALTER TABLE organization_modules DROP COLUMN addon_ids')
      await db.rawQuery('ALTER TABLE organization_modules DROP COLUMN module_id')
    })
  }
}
