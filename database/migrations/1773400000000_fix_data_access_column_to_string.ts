import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * The data_access column on organization_profiles was stored as INT UNSIGNED (0-3),
 * but the Lucid column prepare callback maps 'all' → 0, which is falsy.
 * Lucid omits falsy prepared values from INSERT statements, so MySQL used the
 * column DEFAULT (2 = self) for every profile regardless of intent.
 *
 * Fix: change the column to VARCHAR(20) and store the string value directly.
 * Existing rows are corrected by profile name heuristic (all currently store 2).
 */
export default class extends BaseSchema {
  async up() {
    // Change column type from INT to VARCHAR
    await this.schema.raw(`
      ALTER TABLE organization_profiles
        MODIFY COLUMN data_access VARCHAR(20) NOT NULL DEFAULT 'self'
        COMMENT 'Values: all, organization, self, custom'
    `)

    // Fix existing rows — all currently have the wrong integer-as-string value.
    // Correct by profile name (these are the seeded defaults).
    await this.schema.raw(`
      UPDATE organization_profiles
      SET data_access = CASE name
        WHEN 'Super Admin' THEN 'all'
        WHEN 'HR Admin'    THEN 'organization'
        WHEN 'Manager'     THEN 'organization'
        ELSE 'self'
      END
      WHERE data_access IN ('0','1','2','3')
    `)
  }

  async down() {
    // Revert to INT mapping
    await this.schema.raw(`
      UPDATE organization_profiles
      SET data_access = CASE data_access
        WHEN 'all'          THEN '0'
        WHEN 'organization' THEN '1'
        WHEN 'self'         THEN '2'
        WHEN 'custom'       THEN '3'
        ELSE '2'
      END
    `)
    await this.schema.raw(`
      ALTER TABLE organization_profiles
        MODIFY COLUMN data_access INT UNSIGNED NOT NULL DEFAULT 2
        COMMENT '0=all 1=organization 2=self 3=custom'
    `)
  }
}
