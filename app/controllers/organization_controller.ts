import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import OrganizationService from '#services/organization_service'
import UserRepository from '#repositories/user_repository'
import Organization from '#models/organization'
import {
  organizationStep1Validator,
  organizationModulesValidator,
  organizationSuperAdminValidator,
  bulkOperationValidator,
} from '#validators/organization_validator'

const orgService = new OrganizationService()
const userRepo = new UserRepository()

export default class OrganizationController {
  async index({ request, inertia }: HttpContext) {
    const qs = request.qs()
    const orgs = await orgService.list({
      search: qs.search,
      tab: qs.tab,
      status: qs.status,
      leadOwnerId: qs.lead_owner_id ? Number(qs.lead_owner_id) : undefined,
      page: qs.page ? Number(qs.page) : 1,
      perPage: qs.per_page ? Number(qs.per_page) : 15,
      sortBy: qs.sort_by || 'created_at',
      sortDir: qs.sort_dir || 'desc',
    })

    const users = await userRepo.list()

    return inertia.render('organizations/index', {
      orgs: orgs.serialize(),
      users: users.map((u) => u.serialize()),
    })
  }

  async create({ inertia }: HttpContext) {
    const users = await userRepo.list()
    const parentOrgs = await Organization.query()
      .whereNull('deleted_at')
      .where('is_archived', false)
      .select('id', 'name', 'org_id')
      .orderBy('name', 'asc')
    return inertia.render('organizations/create', {
      users: users.map((u) => u.serialize()),
      organizations: parentOrgs.map((o) => ({ id: o.id, name: o.name, orgId: o.orgId })),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const step1 = await request.validateUsing(organizationStep1Validator)
    const { modules } = await request.validateUsing(organizationModulesValidator)
    const superAdmin = await request.validateUsing(organizationSuperAdminValidator)

    // Handle optional logo file upload
    let logoPath: string | undefined
    const logoFile = request.file('logo', { size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })
    if (logoFile && logoFile.isValid) {
      await logoFile.move(app.publicPath('uploads/logos'))
      logoPath = `uploads/logos/${logoFile.fileName}`
    }

    try {
      const org = await orgService.create({ ...step1, logo: logoPath } as any, modules, superAdmin as any)
      session.flash('success', `Organization "${org.name}" created successfully!`)
      return response.redirect().toRoute('organizations.index')
    } catch (error) {
      const msg: string = error.message || ''
      const CODE_MAP: Record<string, string> = {
        DUPLICATE_ORG_EMAIL: 'An organization with this email already exists. Use a different email.',
        DUPLICATE_ORG_PHONE: 'An organization with this phone number already exists. Use a different phone number.',
        DUPLICATE_ADMIN_EMAIL: 'This super admin email is already registered in another organization.',
        DUPLICATE_ADMIN_PHONE: 'This super admin phone number is already registered in another organization.',
      }
      const codes = msg.split(',')
      const toasts = codes.map((c) => CODE_MAP[c]).filter(Boolean)

      if (toasts.length > 0) {
        session.flash('flashToasts', JSON.stringify(toasts))
      } else if (msg.includes('Duplicate entry') && msg.includes('company_email')) {
        session.flash('flashToasts', JSON.stringify(['This super admin email is already registered in another organization.']))
      } else if (msg.includes('Duplicate entry') && msg.includes('org_id')) {
        session.flash('flashToasts', JSON.stringify(['Organization ID conflict. Please try again.']))
      } else if (msg.includes('Duplicate entry')) {
        session.flash('flashToasts', JSON.stringify(['A duplicate record already exists. Please check your inputs.']))
      } else {
        session.flash('flashToasts', JSON.stringify(['Failed to create organization. Please try again.']))
      }
      return response.redirect().back()
    }
  }

  async show({ params, inertia, response }: HttpContext) {
    const org = await orgService.getDetail(Number(params.id))
    if (!org) {
      return response.status(404).send('Organization not found')
    }
    const users = await userRepo.list()
    return inertia.render('organizations/show', {
      org: org.serialize(),
      users: users.map((u) => u.serialize()),
    })
  }

  async edit({ params, inertia, response }: HttpContext) {
    const org = await orgService.getDetail(Number(params.id))
    if (!org) {
      return response.status(404).send('Organization not found')
    }
    const users = await userRepo.list()
    return inertia.render('organizations/edit', {
      org: org.serialize(),
      users: users.map((u) => u.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const data = await request.validateUsing(organizationStep1Validator)
    try {
      const org = await orgService.update(Number(params.id), data as any)
      session.flash('success', 'Organization updated successfully!')
      return response.redirect().toRoute('organizations.show', { id: org.id })
    } catch (error) {
      session.flash('errors', { update: error.message || 'Failed to update organization.' })
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    await orgService.delete(Number(params.id))
    session.flash('success', 'Organization deleted successfully.')
    return response.redirect().toRoute('organizations.index')
  }

  async bulk({ request, response, session }: HttpContext) {
    const { ids, operation, payload } = await request.validateUsing(bulkOperationValidator)
    await orgService.bulkOperation(ids, operation, payload as any)
    session.flash('success', `Bulk operation "${operation}" completed for ${ids.length} organization(s).`)
    return response.redirect().back()
  }

  async exportCsv({ request, response }: HttpContext) {
    const qs = request.qs()
    const orgs = await orgService.list({
      search: qs.search,
      tab: qs.tab,
      status: qs.status,
      perPage: 10000,
    })

    const serialized = orgs.serialize()
    const rows = serialized.data as any[]

    const headers = ['Org ID', 'Name', 'Plan', 'Status', 'User Limit', 'Plan Start', 'Plan End', 'Created']
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        [r.org_id, r.name, r.plan_type, r.status, r.user_limit, r.plan_start, r.plan_end, r.created_at].join(',')
      ),
    ].join('\n')

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', 'attachment; filename="organizations.csv"')
    return response.send(csv)
  }
}
