import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class LeadOwner extends BaseModel {
  static table = 'lead_owners'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare phone: string | null

  @column()
  declare designation: string | null

  @column({
    prepare: (v: 'active' | 'inactive') => (v === 'active' ? 1 : 0),
    consume: (v: number | string) =>
      (typeof v === 'string' ? v : v === 1 ? 'active' : 'inactive') as 'active' | 'inactive',
  })
  declare status: 'active' | 'inactive'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
