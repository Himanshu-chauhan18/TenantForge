import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('profile_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('organization_profiles')
        .onDelete('SET NULL')
        .after('org_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('profile_id')
    })
  }
}
