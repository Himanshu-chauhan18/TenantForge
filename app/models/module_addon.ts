import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Module from '#models/module'

export default class ModuleAddon extends BaseModel {
  static table = 'module_addons'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare moduleId: number

  @column()
  declare name: string

  @column()
  declare type: 'default' | 'custom' | 'advance'

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Module)
  declare module: BelongsTo<typeof Module>
}
