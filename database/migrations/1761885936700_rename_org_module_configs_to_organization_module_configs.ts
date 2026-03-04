import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.defer(async (db) => {
      await db.rawQuery('RENAME TABLE org_module_configs TO organization_module_configs')
    })
  }

  async down() {
    await this.defer(async (db) => {
      await db.rawQuery('RENAME TABLE organization_module_configs TO org_module_configs')
    })
  }
}
