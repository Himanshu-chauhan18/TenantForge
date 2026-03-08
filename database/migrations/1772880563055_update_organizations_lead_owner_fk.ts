import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organizations'

  async up() {
    this.defer(async (db) => {
      // Drop the old FK that pointed lead_owner_id → users.id
      await db.rawQuery(`
        ALTER TABLE organizations
          DROP FOREIGN KEY organizations_lead_owner_id_foreign
      `)

      // Add the correct FK pointing lead_owner_id → lead_owners.id
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
