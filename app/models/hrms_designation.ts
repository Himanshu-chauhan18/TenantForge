import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class HrmsDesignation extends BaseModel {
  static table = 'hrms_designations'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare jobDescription: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
