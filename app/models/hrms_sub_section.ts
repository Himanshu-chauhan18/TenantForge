import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import HrmsSection from '#models/hrms_section'

export default class HrmsSubSection extends BaseModel {
  static table = 'hrms_sub_sections'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare sectionId: number | null

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => HrmsSection, { foreignKey: 'sectionId' })
  declare section: BelongsTo<typeof HrmsSection>
}
