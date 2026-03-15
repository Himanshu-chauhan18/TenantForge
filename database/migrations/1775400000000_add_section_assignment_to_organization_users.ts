import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('section_id').unsigned().nullable().references('id').inTable('hrms_sections').onDelete('set null')
      table.integer('sub_section_id').unsigned().nullable().references('id').inTable('hrms_sub_sections').onDelete('set null')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('section_id')
      table.dropColumn('sub_section_id')
    })
  }
}
