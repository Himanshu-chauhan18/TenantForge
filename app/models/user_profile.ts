import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ProfilePermission from '#models/profile_permission'

export default class UserProfile extends BaseModel {
  static table = 'user_profiles'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare dataAccess: 'all' | 'organization' | 'self' | 'custom'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => ProfilePermission, { foreignKey: 'profileId' })
  declare permissions: HasMany<typeof ProfilePermission>
}
