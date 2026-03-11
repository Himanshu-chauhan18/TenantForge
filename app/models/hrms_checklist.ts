import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class HrmsChecklist extends BaseModel {
  static table = 'hrms_checklists'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare name: string

  @column()
  declare type: 'onboarding' | 'offboarding' | 'general'

  @column()
  declare description: string | null

  @column({
    consume: (v: string | null) => { try { return v ? JSON.parse(v) : [] } catch { return [] } },
    prepare: (v: string[] | null) => JSON.stringify(v ?? []),
  })
  declare items: string[]

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
