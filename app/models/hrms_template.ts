import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class HrmsTemplate extends BaseModel {
  static table = 'hrms_templates'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare name: string

  @column()
  declare type: 'offer_letter' | 'appointment_letter' | 'experience_letter' | 'relieving_letter' | 'warning_letter' | 'appraisal_letter' | 'email' | 'other'

  @column()
  declare content: string | null

  @column()
  declare description: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
