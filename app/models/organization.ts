import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'
import OrganizationModule from '#models/organization_module'
import OrganizationUser from '#models/organization_user'
import UserProfile from '#models/user_profile'
import FiscalYear from '#models/fiscal_year'

export default class Organization extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: string

  @column()
  declare name: string

  @column()
  declare slug: string | null

  @column()
  declare logo: string | null

  @column()
  declare companySize: string | null

  @column()
  declare industry: string | null

  @column()
  declare website: string | null

  @column()
  declare about: string | null

  @column()
  declare gstNo: string | null

  @column()
  declare parentOrgId: number | null

  @column()
  declare fiscalName: string | null

  @column()
  declare fiscalStart: string | null

  @column()
  declare fiscalEnd: string | null

  @column()
  declare country: string | null

  @column()
  declare city: string | null

  @column()
  declare phone: string | null

  @column()
  declare email: string | null

  @column()
  declare address: string | null

  @column()
  declare leadOwnerId: number | null

  @column()
  declare currency: string

  @column()
  declare timezone: string

  @column()
  declare dateFormat: string

  @column()
  declare timeFormat: string

  @column()
  declare planType: 'trial' | 'premium'

  @column()
  declare userLimit: number

  @column()
  declare planStart: string | null

  @column()
  declare planEnd: string | null

  @column()
  declare status: 'active' | 'inactive' | 'expired'

  @column()
  declare isArchived: boolean

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'leadOwnerId' })
  declare leadOwner: BelongsTo<typeof User>

  @hasMany(() => OrganizationModule, { foreignKey: 'orgId' })
  declare modules: HasMany<typeof OrganizationModule>

  @hasMany(() => OrganizationUser, { foreignKey: 'orgId' })
  declare orgUsers: HasMany<typeof OrganizationUser>

  @hasMany(() => UserProfile, { foreignKey: 'orgId' })
  declare userProfiles: HasMany<typeof UserProfile>

  @hasMany(() => FiscalYear, { foreignKey: 'orgId' })
  declare fiscalYears: HasMany<typeof FiscalYear>

  get isExpired(): boolean {
    if (!this.planEnd) return false
    return new Date(this.planEnd) < new Date()
  }

  get daysUntilExpiry(): number | null {
    if (!this.planEnd) return null
    const diff = new Date(this.planEnd).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
}
