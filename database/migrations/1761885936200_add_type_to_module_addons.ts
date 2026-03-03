import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'module_addons'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('type', ['default', 'custom', 'advance'])
        .notNullable()
        .defaultTo('default')
        .after('name')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('type')
    })
  }
}
