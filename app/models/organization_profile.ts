import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import OrganizationProfilePermission from '#models/organization_profile_permission'

export default class OrganizationProfile extends BaseModel {
  static table = 'organization_profiles'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  // DB stores 0=all 1=organization 2=self 3=custom; prepare/consume map to/from string
  @column({
    prepare: (v: string) => ({ all: 0, organization: 1, self: 2, custom: 3 }[v] ?? 2),
    consume: (v: number) => (['all', 'organization', 'self', 'custom'][v] ?? 'self') as 'all' | 'organization' | 'self' | 'custom',
  })
  declare dataAccess: 'all' | 'organization' | 'self' | 'custom'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => OrganizationProfilePermission, { foreignKey: 'profileId' })
  declare permissions: HasMany<typeof OrganizationProfilePermission>
}
