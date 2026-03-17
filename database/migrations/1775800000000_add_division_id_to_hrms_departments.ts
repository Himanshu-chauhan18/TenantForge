import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('hrms_departments', (table) => {
      table
        .integer('division_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('hrms_divisions')
        .onDelete('SET NULL')
        .after('org_id')
    })
  }

  async down() {
    this.schema.alterTable('hrms_departments', (table) => {
      table.dropForeign(['division_id'])
      table.dropColumn('division_id')
    })
  }
}
