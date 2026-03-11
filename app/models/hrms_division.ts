import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class HrmsDivision extends BaseModel {
  static table = 'hrms_divisions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare shortName: string | null

  @column()
  declare legalEmployeeId: string | null

  @column()
  declare bankName: string | null

  @column()
  declare bankAgentCode: string | null

  @column()
  declare bankAccountNo: string | null

  @column()
  declare ifscCode: string | null

  @column()
  declare establishmentNo: string | null

  // Contact details
  @column()
  declare contactPerson: string | null

  @column()
  declare contactPhone: string | null

  @column()
  declare address: string | null

  @column()
  declare email: string | null

  @column()
  declare country: string | null

  @column()
  declare city: string | null

  // Locale
  @column()
  declare currency: string | null

  @column()
  declare dateFormat: string | null

  @column()
  declare timezone: string | null

  @column()
  declare timeFormat: string | null

  // Documents
  @column()
  declare letterheadPath: string | null

  @column()
  declare signaturePath: string | null

  @column()
  declare stampPath: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
