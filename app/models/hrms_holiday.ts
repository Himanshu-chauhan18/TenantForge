import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class HrmsHoliday extends BaseModel {
  static table = 'hrms_holidays'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare name: string

  @column()
  declare date: string

  @column()
  declare isFlexi: boolean

  @column()
  declare description: string | null

  @column()
  declare applyTo: 'division' | 'location' | 'both'

  @column({
    consume: (v: string | null) => { try { return v ? JSON.parse(v) : [] } catch { return [] } },
    prepare: (v: number[] | null) => JSON.stringify(v ?? []),
  })
  declare divisionIds: number[]

  @column({
    consume: (v: string | null) => { try { return v ? JSON.parse(v) : [] } catch { return [] } },
    prepare: (v: number[] | null) => JSON.stringify(v ?? []),
  })
  declare locationIds: number[]

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
