import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class HrmsApproval extends BaseModel {
  static table = 'hrms_approvals'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare moduleName: string

  @column()
  declare approvalType: 'resignation' | 'termination' | 'personal_requisition' | 'leave' | 'expense' | 'other'

  @column()
  declare basedOn: 'designation' | 'division'

  @column()
  declare referenceId: number | null

  @column()
  declare referenceName: string | null

  @column()
  declare escalationPeriodDays: number

  @column()
  declare sendMailOnEscalation: boolean

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
