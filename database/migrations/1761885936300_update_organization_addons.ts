import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_addons'

  async up() {
    // Step 1: Add module_key column
    this.schema.alterTable(this.tableName, (table) => {
      table.string('module_key', 50).notNullable().defaultTo('').after('org_id')
    })

    // Step 2: Add (org_id, module_key) index FIRST.
    // MySQL requires the FK column org_id to always have a backing index.
    // By adding this index before dropping the old unique, MySQL can use it
    // as the FK backing index, allowing us to safely drop the unique below.
    this.schema.alterTable(this.tableName, (table) => {
      table.index(['org_id', 'module_key'], 'organization_addons_org_module_idx')
    })

    // Step 3: Now safe to drop the old unique constraint
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['org_id', 'addon_key'])
    })

    // Step 4: Add the new composite unique constraint
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['org_id', 'module_key', 'addon_key'])
    })
  }

  async down() {
    // Step 1: Drop new unique, add back old unique (becomes FK backing index again)
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['org_id', 'module_key', 'addon_key'])
      table.unique(['org_id', 'addon_key'])
    })

    // Step 2: Now safe to drop the (org_id, module_key) index
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['org_id', 'module_key'], 'organization_addons_org_module_idx')
    })

    // Step 3: Drop the column
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('module_key')
    })
  }
}
