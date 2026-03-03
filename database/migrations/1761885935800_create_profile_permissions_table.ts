import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profile_permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('profile_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('user_profiles')
        .onDelete('CASCADE')
      table.string('module_key', 50).notNullable()
      table.string('feature_key', 100).notNullable()
      table.boolean('can_view').defaultTo(false)
      table.boolean('can_add').defaultTo(false)
      table.boolean('can_edit').defaultTo(false)
      table.boolean('can_delete').defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.unique(['profile_id', 'module_key', 'feature_key'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
