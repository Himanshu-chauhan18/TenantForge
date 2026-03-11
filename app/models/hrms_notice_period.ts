import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import HrmsDesignation from '#models/hrms_designation'

export default class HrmsNoticePeriod extends BaseModel {
  static table = 'hrms_notice_periods'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare designationId: number | null

  @column()
  declare designationName: string | null

  @column()
  declare noticeDays: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => HrmsDesignation, { foreignKey: 'designationId' })
  declare designation: BelongsTo<typeof HrmsDesignation>
}
