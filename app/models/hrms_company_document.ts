import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class HrmsCompanyDocument extends BaseModel {
  static table = 'hrms_company_documents'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare name: string

  @column()
  declare documentType: string | null

  @column()
  declare filePath: string | null

  @column()
  declare description: string | null

  @column()
  declare isMandatory: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
