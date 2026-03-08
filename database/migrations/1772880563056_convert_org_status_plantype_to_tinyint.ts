import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Converts organizations.status  → TINYINT  (0=inactive, 1=active, 2=expired)
 * Converts organizations.plan_type → TINYINT (0=trial,    1=premium)
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      // 1. Add temp columns next to the originals
      await db.rawQuery(`
        ALTER TABLE organizations
          ADD COLUMN status_new   TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER status,
          ADD COLUMN plan_type_new TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER plan_type
      `)

      // 2. Populate from enum string values
      await db.rawQuery(`
        UPDATE organizations SET
          status_new    = CASE status    WHEN 'inactive' THEN 0 WHEN 'active' THEN 1 WHEN 'expired' THEN 2 ELSE 1 END,
          plan_type_new = CASE plan_type WHEN 'trial'    THEN 0 WHEN 'premium' THEN 1                ELSE 0 END
      `)

      // 3. Drop old enum columns
      await db.rawQuery(`ALTER TABLE organizations DROP COLUMN status, DROP COLUMN plan_type`)

      // 4. Rename temp columns to original names
      await db.rawQuery(`
        ALTER TABLE organizations
          CHANGE COLUMN status_new    status    TINYINT UNSIGNED NOT NULL DEFAULT 1,
          CHANGE COLUMN plan_type_new plan_type TINYINT UNSIGNED NOT NULL DEFAULT 0
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      // 1. Add temp enum columns
      await db.rawQuery(`
        ALTER TABLE organizations
          ADD COLUMN status_old    ENUM('active','inactive','expired') NOT NULL DEFAULT 'active' AFTER status,
          ADD COLUMN plan_type_old ENUM('trial','premium')             NOT NULL DEFAULT 'trial'  AFTER plan_type
      `)

      // 2. Convert integers back to strings
      await db.rawQuery(`
        UPDATE organizations SET
          status_old    = CASE status    WHEN 0 THEN 'inactive' WHEN 1 THEN 'active' WHEN 2 THEN 'expired' ELSE 'active' END,
          plan_type_old = CASE plan_type WHEN 0 THEN 'trial'    WHEN 1 THEN 'premium'                      ELSE 'trial'  END
      `)

      // 3. Drop tinyint columns
      await db.rawQuery(`ALTER TABLE organizations DROP COLUMN status, DROP COLUMN plan_type`)

      // 4. Rename old columns back to original names
      await db.rawQuery(`
        ALTER TABLE organizations
          CHANGE COLUMN status_old    status    ENUM('active','inactive','expired') NOT NULL DEFAULT 'active',
          CHANGE COLUMN plan_type_old plan_type ENUM('trial','premium')             NOT NULL DEFAULT 'trial'
      `)
    })
  }
}
