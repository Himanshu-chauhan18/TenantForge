import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Converts lead_owners.status from ENUM('active','inactive')
 * to TINYINT: 0 = inactive, 1 = active
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      // Add a temp tinyint column
      await db.rawQuery(`
        ALTER TABLE lead_owners
          ADD COLUMN status_int TINYINT NOT NULL DEFAULT 1 AFTER status
      `)

      // Copy values: active → 1, inactive → 0
      await db.rawQuery(`
        UPDATE lead_owners SET status_int = CASE
          WHEN status = 'active'   THEN 1
          WHEN status = 'inactive' THEN 0
          ELSE 1
        END
      `)

      // Drop the old enum column
      await db.rawQuery(`ALTER TABLE lead_owners DROP COLUMN status`)

      // Rename the temp column to status
      await db.rawQuery(`
        ALTER TABLE lead_owners
          CHANGE COLUMN status_int status TINYINT NOT NULL DEFAULT 1
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE lead_owners
          ADD COLUMN status_old ENUM('active','inactive') NOT NULL DEFAULT 'active' AFTER status
      `)

      await db.rawQuery(`
        UPDATE lead_owners SET status_old = CASE
          WHEN status = 1 THEN 'active'
          WHEN status = 0 THEN 'inactive'
          ELSE 'active'
        END
      `)

      await db.rawQuery(`ALTER TABLE lead_owners DROP COLUMN status`)

      await db.rawQuery(`
        ALTER TABLE lead_owners
          CHANGE COLUMN status_old status ENUM('active','inactive') NOT NULL DEFAULT 'active'
      `)
    })
  }
}
