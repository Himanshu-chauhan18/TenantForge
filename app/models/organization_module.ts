import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Module from '#models/module'

export default class OrganizationModule extends BaseModel {
  static table = 'organization_module_configs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare moduleId: number

  @column()
  declare enabled: boolean

  @column({
    prepare: (v: Array<{ id: number; enabled: boolean }>) => JSON.stringify(v ?? []),
    consume: (v: string | Array<{ id: number; enabled: boolean }>) =>
      typeof v === 'string' ? JSON.parse(v) : (v ?? []),
  })
  declare addonIds: Array<{ id: number; enabled: boolean }>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Module)
  declare module: BelongsTo<typeof Module>
}
