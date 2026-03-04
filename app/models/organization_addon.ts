import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ModuleAddon from '#models/module_addon'

export default class OrganizationAddon extends BaseModel {
  static table = 'organization_addons'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare addonId: number

  @column()
  declare enabled: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => ModuleAddon, { foreignKey: 'addonId' })
  declare addon: BelongsTo<typeof ModuleAddon>
}
