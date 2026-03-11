import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class HrmsLocation extends BaseModel {
  static table = 'hrms_locations'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare country: string

  @column()
  declare city: string

  @column()
  declare address: string

  @column()
  declare landmark: string | null

  @column()
  declare zipCode: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
