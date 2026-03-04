import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Renames organization_modules → org_module_configs.
 * The table stores per-org module assignments AND their addon_ids JSON config,
 * so "module_configs" is more accurate than just "modules".
 */
export default class extends BaseSchema {
  async up() {
    await this.defer(async (db) => {
      await db.rawQuery('RENAME TABLE organization_modules TO org_module_configs')
    })
  }

  async down() {
    await this.defer(async (db) => {
      await db.rawQuery('RENAME TABLE org_module_configs TO organization_modules')
    })
  }
}
