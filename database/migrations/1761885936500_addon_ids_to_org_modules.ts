import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Adds addon_ids JSON column to organization_modules and drops the
 * organization_addons table. Each entry is { id: number, enabled: boolean }
 * so individual addons can be enabled/disabled without losing assignment.
 *
 * Assumes the DB is in the state after migration 1761885936400:
 *   - organization_modules  has module_id FK (no addon_ids yet)
 *   - organization_addons   has addon_id FK  (still exists)
 */
export default class extends BaseSchema {
  async up() {
    await this.defer(async (db) => {
      // 1. Add addon_ids as nullable JSON first (MySQL requires this pattern
      //    for NOT NULL JSON — set data, then flip to NOT NULL)
      await db.rawQuery(`
        ALTER TABLE organization_modules
        ADD COLUMN addon_ids JSON NULL AFTER enabled
      `)

      // 2. Initialize every row with an empty array
      await db.rawQuery(`
        UPDATE organization_modules
        SET addon_ids = '[]'
        WHERE addon_ids IS NULL
      `)

      // 3. Migrate enabled/disabled state from organization_addons.
      //    Each addon becomes { "id": <addon_id>, "enabled": true/false }.
      //    Join via module_addons.module_id to match against org_modules.module_id.
      await db.rawQuery(`
        UPDATE organization_modules om
        INNER JOIN (
          SELECT
            oa.org_id,
            ma.module_id,
            JSON_ARRAYAGG(
              JSON_OBJECT('id', oa.addon_id, 'enabled', IF(oa.enabled, TRUE, FALSE))
            ) AS addons
          FROM organization_addons oa
          INNER JOIN module_addons ma ON ma.id = oa.addon_id
          GROUP BY oa.org_id, ma.module_id
        ) grouped
          ON grouped.org_id    = om.org_id
         AND grouped.module_id = om.module_id
        SET om.addon_ids = grouped.addons
      `)

      // 4. Make the column NOT NULL now that every row has data
      await db.rawQuery(`
        ALTER TABLE organization_modules
        MODIFY COLUMN addon_ids JSON NOT NULL
      `)

      // 5. Drop organization_addons — data lives in org_modules.addon_ids now
      await db.rawQuery(`DROP TABLE IF EXISTS organization_addons`)
    })
  }

  async down() {
    await this.defer(async (db) => {
      // 1. Recreate organization_addons
      await db.rawQuery(`
        CREATE TABLE IF NOT EXISTS organization_addons (
          id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
          org_id    INT UNSIGNED NOT NULL,
          addon_id  INT UNSIGNED NOT NULL,
          enabled   TINYINT(1)   NOT NULL DEFAULT 1,
          created_at TIMESTAMP   NOT NULL,
          PRIMARY KEY (id),
          UNIQUE KEY organization_addons_org_id_addon_id_unique (org_id, addon_id),
          CONSTRAINT fk_oa_org_id   FOREIGN KEY (org_id)   REFERENCES organizations(id)   ON DELETE CASCADE,
          CONSTRAINT fk_oa_addon_id FOREIGN KEY (addon_id) REFERENCES module_addons(id)   ON DELETE RESTRICT
        )
      `)

      // 2. Expand addon_ids JSON back into individual rows
      await db.rawQuery(`
        INSERT INTO organization_addons (org_id, addon_id, enabled, created_at)
        SELECT
          om.org_id,
          jt.id       AS addon_id,
          jt.enabled  AS enabled,
          NOW()
        FROM organization_modules om
        CROSS JOIN JSON_TABLE(
          om.addon_ids,
          '$[*]' COLUMNS (
            id      INT  PATH '$.id',
            enabled BOOL PATH '$.enabled'
          )
        ) AS jt
        WHERE JSON_LENGTH(om.addon_ids) > 0
      `)

      // 3. Drop the addon_ids column from organization_modules
      await db.rawQuery(`
        ALTER TABLE organization_modules DROP COLUMN addon_ids
      `)
    })
  }
}
