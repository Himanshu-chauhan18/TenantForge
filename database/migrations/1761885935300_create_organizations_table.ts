import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organizations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('org_id', 20).notNullable().unique()
      table.string('name', 255).notNullable()
      table.string('slug', 255).nullable().unique()
      table.string('logo', 500).nullable()

      // Company details
      table
        .enum('company_size', ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
        .nullable()
      table.string('industry', 100).nullable()
      table.string('website', 500).nullable()
      table.text('about').nullable()
      table.string('gst_no', 50).nullable()
      table.integer('parent_org_id').unsigned().nullable().references('id').inTable('organizations')

      // Fiscal year
      table.string('fiscal_name', 100).nullable()
      table.date('fiscal_start').nullable()
      table.date('fiscal_end').nullable()

      // Contact details
      table.string('country', 100).nullable()
      table.string('city', 100).nullable()
      table.string('phone', 30).nullable()
      table.string('email', 254).nullable()
      table.text('address').nullable()
      table
        .integer('lead_owner_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      // Locale
      table.string('currency', 10).defaultTo('INR')
      table.string('timezone', 60).defaultTo('Asia/Kolkata')
      table
        .enum('date_format', ['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy/mm/dd', 'dd-mm-yyyy', 'mm-dd-yyyy', 'yyyy-mm-dd'])
        .defaultTo('dd/mm/yyyy')
      table.enum('time_format', ['12', '24']).defaultTo('12')

      // Plan
      table.enum('plan_type', ['trial', 'premium']).defaultTo('trial')
      table.integer('user_limit').unsigned().defaultTo(10)
      table.date('plan_start').nullable()
      table.date('plan_end').nullable()

      // Status
      table.enum('status', ['active', 'inactive', 'expired']).defaultTo('active')
      table.boolean('is_archived').defaultTo(false)
      table.timestamp('deleted_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
