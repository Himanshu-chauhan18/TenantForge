import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import OrganizationUser from '#models/organization_user'

export default class HrmsHierarchyNode extends BaseModel {
  static table = 'hrms_hierarchy_nodes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: number

  @column()
  declare parentId: number | null

  @column()
  declare title: string

  @column()
  declare department: string | null

  @column()
  declare employeeId: number | null

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => OrganizationUser, { foreignKey: 'employeeId' })
  declare employee: BelongsTo<typeof OrganizationUser>

  @hasMany(() => HrmsHierarchyNode, { foreignKey: 'parentId' })
  declare children: HasMany<typeof HrmsHierarchyNode>

  @belongsTo(() => HrmsHierarchyNode, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof HrmsHierarchyNode>
}
