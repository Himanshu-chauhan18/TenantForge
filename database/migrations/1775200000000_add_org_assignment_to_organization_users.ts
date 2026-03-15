import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('division_id').unsigned().nullable().references('id').inTable('hrms_divisions').onDelete('set null')
      table.integer('department_id').unsigned().nullable().references('id').inTable('hrms_departments').onDelete('set null')
      table.integer('sub_department_id').unsigned().nullable().references('id').inTable('hrms_sub_departments').onDelete('set null')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('division_id')
      table.dropColumn('department_id')
      table.dropColumn('sub_department_id')
    })
  }
}
