import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_modules'

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
      table.string('module_key', 50).notNullable()
      table.boolean('enabled').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.unique(['org_id', 'module_key'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
