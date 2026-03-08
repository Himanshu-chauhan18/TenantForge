import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Rename user_profiles → organization_profiles
    await this.db.rawQuery('RENAME TABLE user_profiles TO organization_profiles')
    // Rename profile_permissions → organization_profile_permissions
    // The FK from profile_permissions.profile_id → user_profiles.id is maintained by MySQL
    // after renaming (constraint still works, just references the renamed table)
    await this.db.rawQuery('RENAME TABLE profile_permissions TO organization_profile_permissions')
  }

  async down() {
    await this.db.rawQuery('RENAME TABLE organization_profiles TO user_profiles')
    await this.db.rawQuery('RENAME TABLE organization_profile_permissions TO profile_permissions')
  }
}
