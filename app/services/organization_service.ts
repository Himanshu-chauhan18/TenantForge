import OrganizationRepository, { type OrgCreateData, type OrgFilters } from '#repositories/organization_repository'
import OrganizationUser from '#models/organization_user'
import OrganizationProfile from '#models/organization_profile'
import OrganizationProfilePermission from '#models/organization_profile_permission'
import type { PermissionsJson } from '#models/organization_profile_permission'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'

// ── Default profile definitions ───────────────────────────────────────────────
type Perm = { canView: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean }
const FULL: Perm      = { canView: true,  canAdd: true,  canEdit: true,  canDelete: true  }
const WRITE: Perm     = { canView: true,  canAdd: true,  canEdit: true,  canDelete: false }
const VIEW: Perm      = { canView: true,  canAdd: false, canEdit: false, canDelete: false }
const NO_ACCESS: Perm = { canView: false, canAdd: false, canEdit: false, canDelete: false }

function toEntry(p: Perm): PermissionsJson[string] {
  return { v: p.canView ? 1 : 0, a: p.canAdd ? 1 : 0, e: p.canEdit ? 1 : 0, d: p.canDelete ? 1 : 0 }
}

const MODULE_KEYS = ['organization', 'employee', 'attendance', 'leave', 'payroll', 'performance'] as const
type ModuleKey = typeof MODULE_KEYS[number]

const DEFAULT_PROFILES = [
  {
    name: 'Super Admin',
    description: 'Full access to all modules and settings',
    dataAccess: 'all' as const,
    permissions: { organization: FULL, employee: FULL, attendance: FULL, leave: FULL, payroll: FULL, performance: FULL } as Record<ModuleKey, Perm>,
  },
  {
    name: 'HR Admin',
    description: 'Manages human resources and employee data',
    dataAccess: 'organization' as const,
    permissions: { organization: WRITE, employee: FULL, attendance: WRITE, leave: FULL, payroll: WRITE, performance: VIEW } as Record<ModuleKey, Perm>,
  },
  {
    name: 'Manager',
    description: 'Team and project management access',
    dataAccess: 'organization' as const,
    permissions: { organization: VIEW, employee: VIEW, attendance: WRITE, leave: WRITE, payroll: NO_ACCESS, performance: WRITE } as Record<ModuleKey, Perm>,
  },
  {
    name: 'User',
    description: 'Standard employee access',
    dataAccess: 'self' as const,
    permissions: { organization: NO_ACCESS, employee: VIEW, attendance: VIEW, leave: WRITE, payroll: VIEW, performance: VIEW } as Record<ModuleKey, Perm>,
  },
]

export default class OrganizationService {
  private repo = new OrganizationRepository()

  // ── Seed 4 default profiles + permissions for a newly created org ────────────
  // Returns the created "Super Admin" profile so the caller can assign it to the
  // org's super admin user.
  private async seedDefaultProfiles(orgId: number): Promise<OrganizationProfile> {
    // Build moduleKey → moduleId map (only for keys that exist in the DB)
    const moduleRows = await db.from('modules').select('id', 'key').whereIn('key', [...MODULE_KEYS])
    const moduleIdByKey: Record<string, number> = {}
    for (const row of moduleRows) moduleIdByKey[row.key] = row.id

    let superAdminProfile!: OrganizationProfile

    for (const def of DEFAULT_PROFILES) {
      const profile = await OrganizationProfile.create({
        orgId,
        name: def.name,
        description: def.description,
        dataAccess: def.dataAccess,
      })

      if (def.name === 'Super Admin') superAdminProfile = profile

      const perms = MODULE_KEYS
        .filter((key) => moduleIdByKey[key] !== undefined)
        .map((key) => ({
          orgId,
          profileId: profile.id,
          moduleId:  moduleIdByKey[key],
          permissions: { module: toEntry(def.permissions[key] ?? NO_ACCESS) } as PermissionsJson,
        }))

      if (perms.length > 0) {
        await OrganizationProfilePermission.createMany(perms)
      }
    }

    return superAdminProfile
  }

  async list(filters: OrgFilters) {
    return this.repo.paginate(filters)
  }

  async create(
    step1: OrgCreateData,
    modules: { moduleId: number; addonIds: number[] }[] | undefined,
    superAdmin: {
      employeeCode?: string | null
      fullName: string
      gender?: string | null
      adminPhone?: string | null
      dateOfBirth?: string | null
      companyEmail: string
      password: string
      sendWelcomeMail?: boolean | null
    }
  ) {
    // Collect ALL duplicate errors before any DB write
    const dupErrors: string[] = []

    if (step1.email && await this.repo.emailExists(step1.email)) dupErrors.push('DUPLICATE_ORG_EMAIL')
    if (step1.phone && await this.repo.phoneExists(step1.phone)) dupErrors.push('DUPLICATE_ORG_PHONE')
    if (await OrganizationUser.findBy('company_email', superAdmin.companyEmail)) dupErrors.push('DUPLICATE_ADMIN_EMAIL')
    if (superAdmin.adminPhone && await OrganizationUser.findBy('phone', superAdmin.adminPhone)) dupErrors.push('DUPLICATE_ADMIN_PHONE')

    if (dupErrors.length > 0) throw new Error(dupErrors.join(','))

    const org = await this.repo.create({ ...step1, modules })

    // Seed default profiles + permissions, get back the Super Admin profile
    const superAdminProfile = await this.seedDefaultProfiles(org.id)

    // Create super admin user for org, assigned to the Super Admin profile
    const passwordHash = await hash.make(superAdmin.password)
    await OrganizationUser.create({
      orgId: org.id,
      profileId: superAdminProfile.id,
      employeeCode: superAdmin.employeeCode ?? undefined,
      fullName: superAdmin.fullName,
      gender: (superAdmin.gender as 'male' | 'female' | 'other') ?? undefined,
      phone: superAdmin.adminPhone ?? undefined,
      dateOfBirth: superAdmin.dateOfBirth ?? undefined,
      companyEmail: superAdmin.companyEmail,
      passwordHash,
      sendWelcomeMail: superAdmin.sendWelcomeMail ?? false,
      isActive: true,
    })

    return org
  }

  async getDetail(id: number) {
    return this.repo.findById(id)
  }

  async update(id: number, data: Partial<OrgCreateData>) {
    return this.repo.update(id, data)
  }

  async updateModules(orgId: number, modules: { moduleId: number; enabled: boolean; addonIds: number[] }[]) {
    return this.repo.updateModules(orgId, modules)
  }

  async delete(id: number) {
    return this.repo.softDelete(id)
  }

  async bulkOperation(ids: number[], operation: string, payload?: Record<string, unknown>) {
    return this.repo.bulkOperation(ids, operation, payload)
  }

  async getDashboardStats() {
    return this.repo.getDashboardStats()
  }
}
