import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_profiles'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_default').notNullable().defaultTo(false).after('data_access')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_default')
    })
  }
}
