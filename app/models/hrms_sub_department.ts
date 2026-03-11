import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import HrmsDepartment from '#models/hrms_department'

export default class HrmsSubDepartment extends BaseModel {
  static table = 'hrms_sub_departments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare departmentId: number | null

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => HrmsDepartment, { foreignKey: 'departmentId' })
  declare department: BelongsTo<typeof HrmsDepartment>
}
