import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import OrganizationProfile from '#models/organization_profile'

export default class OrganizationUser extends BaseModel {
  static table = 'organization_users'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare profileId: number | null

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
  declare divisionId: number | null

  @column()
  declare departmentId: number | null

  @column()
  declare subDepartmentId: number | null

  @column()
  declare designationId: number | null

  @column()
  declare locationId: number | null

  @column()
  declare gradeId: number | null

  @column()
  declare sectionId: number | null

  @column()
  declare subSectionId: number | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => OrganizationProfile, { foreignKey: 'profileId' })
  declare profile: BelongsTo<typeof OrganizationProfile>
}
