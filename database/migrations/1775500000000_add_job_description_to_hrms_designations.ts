import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'hrms_designations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('job_description').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('job_description')
    })
  }
}
