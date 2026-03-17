import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('reporting_to_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('organization_users')
        .onDelete('set null')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reporting_to_id')
    })
  }
}
