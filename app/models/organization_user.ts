import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class OrganizationUser extends BaseModel {
  static table = 'organization_users'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare employeeCode: string | null

  @column()
  declare fullName: string

  @column()
  declare gender: 'male' | 'female' | 'other' | null

  @column()
  declare phone: string | null

  @column()
  declare dateOfBirth: string | null

  @column()
  declare companyEmail: string

  @column({ serializeAs: null })
  declare passwordHash: string

  @column()
  declare sendWelcomeMail: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
