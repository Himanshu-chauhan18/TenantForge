import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // ── Divisions ──────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_divisions', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('code', 20).notNullable()                 // DIV0001
      table.string('name', 255).notNullable()
      table.string('short_name', 50).nullable()
      table.string('legal_employee_id', 100).nullable()
      table.string('bank_name', 255).nullable()
      table.string('bank_agent_code', 100).nullable()
      table.string('bank_account_no', 100).nullable()
      table.string('ifsc_code', 20).nullable()
      table.string('establishment_no', 100).nullable()
      // Contact details
      table.string('contact_person', 255).nullable()
      table.string('contact_phone', 20).nullable()
      table.text('address').nullable()
      table.string('email', 255).nullable()
      table.string('country', 100).nullable()
      table.string('city', 100).nullable()
      // Locale
      table.string('currency', 10).nullable()
      table.string('date_format', 30).nullable()
      table.string('timezone', 80).nullable()
      table.string('time_format', 20).nullable()
      // Documents
      table.string('letterhead_path', 500).nullable()
      table.string('signature_path', 500).nullable()
      table.string('stamp_path', 500).nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['org_id', 'code'])
    })

    // ── Locations ──────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_locations', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('code', 20).notNullable()                 // LOC0001
      table.string('name', 255).notNullable()
      table.string('country', 100).notNullable()
      table.string('city', 100).notNullable()
      table.text('address').notNullable()
      table.string('landmark', 255).nullable()
      table.string('zip_code', 20).nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['org_id', 'code'])
    })

    // ── Departments ────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_departments', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('code', 20).notNullable()                 // DEP0001
      table.string('name', 255).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['org_id', 'code'])
    })

    // ── Sub Departments ────────────────────────────────────────────────────────
    this.schema.createTable('hrms_sub_departments', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.integer('department_id').unsigned().nullable().references('id').inTable('hrms_departments').onDelete('SET NULL')
      table.string('code', 20).notNullable()
      table.string('name', 255).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['org_id', 'code'])
    })

    // ── Designations ───────────────────────────────────────────────────────────
    this.schema.createTable('hrms_designations', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('code', 20).notNullable()                 // DES0001
      table.string('name', 255).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['org_id', 'code'])
    })

    // ── Grades ─────────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_grades', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('code', 20).notNullable()                 // GRA0001
      table.string('name', 255).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['org_id', 'code'])
    })

    // ── Sections ───────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_sections', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.integer('department_id').unsigned().nullable().references('id').inTable('hrms_departments').onDelete('SET NULL')
      table.string('code', 20).notNullable()
      table.string('name', 255).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['org_id', 'code'])
    })

    // ── Sub Sections ───────────────────────────────────────────────────────────
    this.schema.createTable('hrms_sub_sections', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.integer('section_id').unsigned().nullable().references('id').inTable('hrms_sections').onDelete('SET NULL')
      table.string('code', 20).notNullable()
      table.string('name', 255).notNullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['org_id', 'code'])
    })

    // ── Holidays ───────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_holidays', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.date('date').notNullable()
      table.boolean('is_flexi').defaultTo(false)
      table.text('description').nullable()
      table.enum('apply_to', ['division', 'location', 'both']).defaultTo('both')
      table.specificType('division_ids', 'json').nullable()   // array of division IDs
      table.specificType('location_ids', 'json').nullable()   // array of location IDs
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // ── Notice Periods ─────────────────────────────────────────────────────────
    this.schema.createTable('hrms_notice_periods', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.integer('designation_id').unsigned().nullable().references('id').inTable('hrms_designations').onDelete('SET NULL')
      table.string('designation_name', 255).nullable()        // snapshot if designation deleted
      table.integer('notice_days').notNullable().defaultTo(30)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // ── Approvals ──────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_approvals', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('module_name', 100).notNullable()
      table.enum('approval_type', ['resignation', 'termination', 'personal_requisition', 'leave', 'expense', 'other']).notNullable()
      table.enum('based_on', ['designation', 'division']).notNullable()
      table.integer('reference_id').unsigned().nullable()     // designation_id or division_id
      table.string('reference_name', 255).nullable()          // snapshot
      table.integer('escalation_period_days').defaultTo(3)
      table.boolean('send_mail_on_escalation').defaultTo(true)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // ── Company Documents ──────────────────────────────────────────────────────
    this.schema.createTable('hrms_company_documents', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.string('document_type', 100).nullable()           // e.g. "Certificate", "Policy", "Contract"
      table.string('file_path', 500).nullable()
      table.text('description').nullable()
      table.boolean('is_mandatory').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // ── Checklists ─────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_checklists', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.enum('type', ['onboarding', 'offboarding', 'general']).defaultTo('general')
      table.text('description').nullable()
      table.specificType('items', 'json').nullable()           // array of checklist items
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // ── Templates ──────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_templates', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.enum('type', ['offer_letter', 'appointment_letter', 'experience_letter', 'relieving_letter', 'warning_letter', 'appraisal_letter', 'email', 'other']).notNullable().defaultTo('other')
      table.text('content').nullable()                        // HTML/rich text template
      table.text('description').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // ── Hierarchy ──────────────────────────────────────────────────────────────
    this.schema.createTable('hrms_hierarchy_nodes', (table) => {
      table.increments('id')
      table.integer('org_id').unsigned().notNullable().references('id').inTable('organizations').onDelete('CASCADE')
      table.integer('parent_id').unsigned().nullable().references('id').inTable('hrms_hierarchy_nodes').onDelete('SET NULL')
      table.string('title', 255).notNullable()                // Role/position title
      table.string('department', 255).nullable()
      table.integer('employee_id').unsigned().nullable().references('id').inTable('organization_users').onDelete('SET NULL')
      table.integer('sort_order').defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTableIfExists('hrms_hierarchy_nodes')
    this.schema.dropTableIfExists('hrms_templates')
    this.schema.dropTableIfExists('hrms_checklists')
    this.schema.dropTableIfExists('hrms_company_documents')
    this.schema.dropTableIfExists('hrms_approvals')
    this.schema.dropTableIfExists('hrms_notice_periods')
    this.schema.dropTableIfExists('hrms_holidays')
    this.schema.dropTableIfExists('hrms_sub_sections')
    this.schema.dropTableIfExists('hrms_sections')
    this.schema.dropTableIfExists('hrms_grades')
    this.schema.dropTableIfExists('hrms_designations')
    this.schema.dropTableIfExists('hrms_sub_departments')
    this.schema.dropTableIfExists('hrms_departments')
    this.schema.dropTableIfExists('hrms_locations')
    this.schema.dropTableIfExists('hrms_divisions')
  }
}
