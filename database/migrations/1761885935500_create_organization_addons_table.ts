import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_addons'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('org_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table.string('addon_key', 100).notNullable()
      table.boolean('enabled').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.unique(['org_id', 'addon_key'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
