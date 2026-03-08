import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type PermEntry = { v: 0 | 1; a: 0 | 1; e: 0 | 1; d: 0 | 1 }

/**
 * Keys: "module" for module-level perm, or module_addon.id (as string) for addon-level perm.
 * Example: { "module": {v,a,e,d}, "42": {v,a,e,d}, "58": {v,a,e,d} }
 */
export type PermissionsJson = Record<string, PermEntry>

export default class OrganizationProfilePermission extends BaseModel {
  static table = 'organization_profile_permissions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare profileId: number

  /** FK to modules.id (INT UNSIGNED). */
  @column()
  declare moduleId: number

  @column({
    prepare: (v: PermissionsJson) => JSON.stringify(v),
    consume: (v: string | PermissionsJson) => (typeof v === 'string' ? JSON.parse(v) : v) as PermissionsJson,
  })
  declare permissions: PermissionsJson

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
