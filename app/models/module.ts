import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ModuleAddon from '#models/module_addon'

export default class Module extends BaseModel {
  static table = 'modules'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare label: string

  @column()
  declare description: string | null

  @column()
  declare isMandatory: boolean

  @column()
  declare isActive: boolean

  @column()
  declare isComingSoon: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => ModuleAddon)
  declare addons: HasMany<typeof ModuleAddon>
}
