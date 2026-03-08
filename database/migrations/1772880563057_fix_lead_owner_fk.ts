import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Drops the stale FK from organizations.lead_owner_id → users.id
 * and replaces it with the correct FK → lead_owners.id
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      // Drop the old FK that pointed to users.id
      await db.rawQuery(`
        ALTER TABLE organizations
          DROP FOREIGN KEY organizations_lead_owner_id_foreign
      `)

      // Add the correct FK pointing to lead_owners.id
      await db.rawQuery(`
        ALTER TABLE organizations
          ADD CONSTRAINT organizations_lead_owner_id_foreign
            FOREIGN KEY (lead_owner_id) REFERENCES lead_owners (id) ON DELETE SET NULL
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE organizations
          DROP FOREIGN KEY organizations_lead_owner_id_foreign
      `)

      await db.rawQuery(`
        ALTER TABLE organizations
          ADD CONSTRAINT organizations_lead_owner_id_foreign
            FOREIGN KEY (lead_owner_id) REFERENCES users (id) ON DELETE SET NULL
      `)
    })
  }
}
