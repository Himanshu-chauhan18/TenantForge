import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'modules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('key', 50).notNullable().unique()
      table.string('label', 100).notNullable()
      table.string('description', 500).nullable()
      table.boolean('is_mandatory').defaultTo(false).notNullable()
      table.boolean('is_active').defaultTo(true).notNullable()
      table.boolean('is_coming_soon').defaultTo(false).notNullable()
      table.integer('sort_order').defaultTo(0).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
