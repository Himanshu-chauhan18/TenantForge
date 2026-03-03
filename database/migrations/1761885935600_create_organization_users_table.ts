import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('org_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table.string('employee_code', 50).nullable()
      table.string('full_name', 255).notNullable()
      table.enum('gender', ['male', 'female', 'other']).nullable()
      table.string('phone', 30).nullable()
      table.date('date_of_birth').nullable()
      table.string('company_email', 254).notNullable().unique()
      table.string('password_hash', 255).notNullable()
      table.boolean('send_welcome_mail').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
