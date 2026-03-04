import OrganizationRepository, { type OrgCreateData, type OrgFilters } from '#repositories/organization_repository'
import OrganizationUser from '#models/organization_user'
import hash from '@adonisjs/core/services/hash'

export default class OrganizationService {
  private repo = new OrganizationRepository()

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
    const org = await this.repo.create({ ...step1, modules })

    // Create super admin user for org
    const passwordHash = await hash.make(superAdmin.password)
    await OrganizationUser.create({
      orgId: org.id,
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
