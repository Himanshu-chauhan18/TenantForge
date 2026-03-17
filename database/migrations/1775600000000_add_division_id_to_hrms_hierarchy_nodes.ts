import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'hrms_hierarchy_nodes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('division_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('hrms_divisions')
        .onDelete('set null')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('division_id')
    })
  }
}
