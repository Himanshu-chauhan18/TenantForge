import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class ProfilePermission extends BaseModel {
  static table = 'profile_permissions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare profileId: number

  @column()
  declare moduleKey: string

  @column()
  declare featureKey: string

  @column()
  declare canView: boolean

  @column()
  declare canAdd: boolean

  @column()
  declare canEdit: boolean

  @column()
  declare canDelete: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
