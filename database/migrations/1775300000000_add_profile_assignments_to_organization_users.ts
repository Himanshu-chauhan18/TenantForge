import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('designation_id').unsigned().nullable().references('id').inTable('hrms_designations').onDelete('set null')
      table.integer('location_id').unsigned().nullable().references('id').inTable('hrms_locations').onDelete('set null')
      table.integer('grade_id').unsigned().nullable().references('id').inTable('hrms_grades').onDelete('set null')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('designation_id')
      table.dropColumn('location_id')
      table.dropColumn('grade_id')
    })
  }
}
