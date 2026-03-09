import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import LeadOwner from '#models/lead_owner'
import OrganizationModule from '#models/organization_module'
import OrganizationUser from '#models/organization_user'
import OrganizationProfile from '#models/organization_profile'
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

  @column({
    prepare: (v: 'trial' | 'premium') => (v === 'premium' ? 1 : 0),
    consume: (v: number | string) => (typeof v === 'string' ? v : v === 1 ? 'premium' : 'trial') as 'trial' | 'premium',
  })
  declare planType: 'trial' | 'premium'

  @column()
  declare userLimit: number

  @column()
  declare planStart: string | null

  @column()
  declare planEnd: string | null

  @column({
    prepare: (v: 'active' | 'inactive' | 'expired') =>
      v === 'inactive' ? 0 : v === 'expired' ? 2 : 1,
    consume: (v: number | string) => {
      if (typeof v === 'string') return v as 'active' | 'inactive' | 'expired'
      return (v === 0 ? 'inactive' : v === 2 ? 'expired' : 'active') as 'active' | 'inactive' | 'expired'
    },
  })
  declare status: 'active' | 'inactive' | 'expired'

  @column()
  declare isArchived: boolean

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => LeadOwner, { foreignKey: 'leadOwnerId' })
  declare leadOwner: BelongsTo<typeof LeadOwner>

  @hasMany(() => OrganizationModule, { foreignKey: 'orgId' })
  declare modules: HasMany<typeof OrganizationModule>

  @hasMany(() => OrganizationUser, { foreignKey: 'orgId' })
  declare orgUsers: HasMany<typeof OrganizationUser>

  @hasMany(() => OrganizationProfile, { foreignKey: 'orgId' })
  declare profiles: HasMany<typeof OrganizationProfile>

  @hasMany(() => FiscalYear, { foreignKey: 'orgId' })
  declare fiscalYears: HasMany<typeof FiscalYear>

  get isExpired(): boolean {
    if (!this.planEnd) return false
    return DateTime.fromISO(this.planEnd) < DateTime.now()
  }

  get daysUntilExpiry(): number | null {
    if (!this.planEnd) return null
    return Math.ceil(DateTime.fromISO(this.planEnd).diff(DateTime.now(), 'days').days)
  }
}
