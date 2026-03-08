import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * 1. organization_profiles.data_access
 *    Previous partial migrations left behind data_access_old (varchar) and
 *    data_access_new (tinyint, values 0-3 already correct).
 *    This migration: drops both temp columns and renames data_access_new → data_access
 *    as INT UNSIGNED with the proper comment.
 *
 * 2. organization_profile_permissions.org_id
 *    Adds org_id INT UNSIGNED (FK → organizations.id ON DELETE CASCADE) so that
 *    permissions can be queried directly by org without joining through profiles.
 */
export default class extends BaseSchema {
  async up() {
    // ── 1. Fix organization_profiles.data_access ──────────────────────────────

    // All checks via schema.raw so they run on the same DB connection as the DDL

    // Drop data_access_old if present (leftover from failed rollback)
    const [oldColRows] = await this.schema.raw(`
      SELECT 1 AS cnt FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'organization_profiles'
        AND COLUMN_NAME = 'data_access_old'
    `)
    if ((oldColRows as any[]).length > 0) {
      await this.schema.raw(`ALTER TABLE organization_profiles DROP COLUMN data_access_old`)
    }

    // Check data_access_new (values already correct 0-3)
    const [newColRows] = await this.schema.raw(`
      SELECT COLUMN_TYPE FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'organization_profiles'
        AND COLUMN_NAME = 'data_access_new'
    `)
    const [daColRows] = await this.schema.raw(`
      SELECT COLUMN_TYPE FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'organization_profiles'
        AND COLUMN_NAME = 'data_access'
    `)

    if ((newColRows as any[]).length > 0) {
      // data_access_new exists with correct 0-3 values → rename to data_access
      if ((daColRows as any[]).length > 0) {
        // Stale data_access column also present — drop it first
        await this.schema.raw(`ALTER TABLE organization_profiles DROP COLUMN data_access`)
      }
      await this.schema.raw(`
        ALTER TABLE organization_profiles
          CHANGE COLUMN data_access_new data_access
          INT UNSIGNED NOT NULL DEFAULT 2
          COMMENT '0=all 1=organization 2=self 3=custom'
          AFTER description
      `)
    } else if ((daColRows as any[]).length > 0) {
      const currentType = String((daColRows as any[])[0]?.COLUMN_TYPE ?? '')
      if (!currentType.startsWith('int')) {
        // Wrong type — convert to INT UNSIGNED
        await this.schema.raw(`
          ALTER TABLE organization_profiles
            MODIFY COLUMN data_access INT UNSIGNED NOT NULL DEFAULT 2
            COMMENT '0=all 1=organization 2=self 3=custom'
        `)
      }
    }

    // ── 2. Add org_id to organization_profile_permissions ────────────────────
    const [orgIdColRows] = await this.schema.raw(`
      SELECT 1 AS cnt FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME  = 'organization_profile_permissions'
        AND COLUMN_NAME = 'org_id'
    `)

    if ((orgIdColRows as any[]).length === 0) {
      // Add nullable first so existing rows aren't rejected
      await this.schema.raw(`
        ALTER TABLE organization_profile_permissions
          ADD COLUMN org_id INT UNSIGNED NULL AFTER id
      `)

      // Populate from profile → org relationship
      await this.schema.raw(`
        UPDATE organization_profile_permissions opp
        JOIN   organization_profiles op ON op.id = opp.profile_id
        SET    opp.org_id = op.org_id
      `)

      // Enforce NOT NULL, add FK and index
      await this.schema.raw(`
        ALTER TABLE organization_profile_permissions
          MODIFY COLUMN org_id INT UNSIGNED NOT NULL,
          ADD CONSTRAINT fk_opp_org FOREIGN KEY (org_id)
            REFERENCES organizations (id) ON DELETE CASCADE,
          ADD KEY idx_opp_org_id (org_id)
      `)
    }
  }

  async down() {
    // Remove org_id
    const [orgIdColRows] = await this.schema.raw(`
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME  = 'organization_profile_permissions'
        AND COLUMN_NAME = 'org_id'
    `)
    if ((orgIdColRows as any[]).length > 0) {
      await this.schema.raw(`
        ALTER TABLE organization_profile_permissions
          DROP FOREIGN KEY fk_opp_org,
          DROP KEY         idx_opp_org_id,
          DROP COLUMN      org_id
      `)
    }

    // Rename data_access back to data_access_new
    const [daColRows] = await this.schema.raw(`
      SELECT COLUMN_TYPE FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'organization_profiles'
        AND COLUMN_NAME = 'data_access'
    `)
    if (String((daColRows as any[])[0]?.COLUMN_TYPE ?? '').startsWith('int')) {
      await this.schema.raw(`
        ALTER TABLE organization_profiles
          CHANGE COLUMN data_access data_access_new TINYINT UNSIGNED NOT NULL DEFAULT 2
      `)
    }
  }
}
