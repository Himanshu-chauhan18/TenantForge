import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import hash from '@adonisjs/core/services/hash'
import OrganizationService from '#orgbuilder/services/organization_service'
import OrganizationRepository from '#orgbuilder/repositories/organization_repository'
import LeadOwnerRepository from '#orgbuilder/repositories/lead_owner_repository'
import Organization from '#models/organization'
import OrganizationUser from '#models/organization_user'
import {
  organizationStep1Validator,
  organizationModulesValidator,
  organizationSuperAdminValidator,
  bulkOperationValidator,
  updateModulesValidator,
} from '#orgbuilder/validators/organization_validator'

const orgService = new OrganizationService()
const leadOwnerRepo = new LeadOwnerRepository()

export default class OrganizationController {
  async index({ request, inertia }: HttpContext) {
    const qs = request.qs()
    const orgs = await orgService.list({
      search: qs.search,
      tab: qs.tab,
      status: qs.status,
      leadOwnerId: qs.lead_owner_id ? Number(qs.lead_owner_id) : undefined,
      country: qs.country,
      city: qs.city,
      createdFrom: qs.created_from,
      createdTo: qs.created_to,
      page: qs.page ? Number(qs.page) : 1,
      perPage: qs.per_page ? Math.min(Number(qs.per_page), 500) : 10,
      sortBy: qs.sort_by || 'created_at',
      sortDir: qs.sort_dir || 'desc',
    })

    const [leadOwners] = await Promise.all([leadOwnerRepo.list()])

    // Serialize rows — CamelCaseNamingStrategy makes model fields camelCase.
    // $extras (user_count subquery) are excluded from serialize() by default, so inject manually.
    const orgRows = orgs.all()
    const serialized = orgs.serialize()

    // Build meta directly from paginator instance properties to avoid naming-strategy ambiguity
    // (serialized.meta keys vary by naming strategy; paginator properties are always stable).
    const meta = {
      total: orgs.total,
      perPage: orgs.perPage,
      currentPage: orgs.currentPage,
      lastPage: orgs.lastPage,
    }

    // @ts-ignore - inertia page type inference issue
    return inertia.render('orgbuilder/organizations/index', {
      orgs: {
        data: serialized.data.map((row: any, i: number) => ({
          ...row,
          userCount: Number(orgRows[i]?.$extras?.user_count ?? 0),
        })),
        meta,
      },
      leadOwners: leadOwners.map((o) => o.serialize()),
    })
  }

  async create({ inertia }: HttpContext) {
    const [leadOwners, parentOrgs] = await Promise.all([
      leadOwnerRepo.list(),
      Organization.query()
        .whereNull('deleted_at')
        .where('is_archived', false)
        .select('id', 'name', 'org_id')
        .orderBy('name', 'asc'),
    ])
    // @ts-ignore - inertia page type inference issue
    return inertia.render('orgbuilder/organizations/create', {
      leadOwners: leadOwners.map((o) => o.serialize()),
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
      // console.error('[OrgStore] create failed:', error)
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
    const [org, leadOwners] = await Promise.all([
      orgService.getDetail(Number(params.id)),
      leadOwnerRepo.list(),
    ])
    if (!org) {
      return response.status(404).send('Organization not found')
    }
    // @ts-ignore - inertia page type inference issue
    return inertia.render('orgbuilder/organizations/edit', {
      org: org.serialize(),
      leadOwners: leadOwners.map((o) => o.serialize()),
    })
  }

  async edit({ params, inertia, response }: HttpContext) {
    const [org, leadOwners] = await Promise.all([
      orgService.getDetail(Number(params.id)),
      leadOwnerRepo.list(),
    ])
    if (!org) {
      return response.status(404).send('Organization not found')
    }
    // @ts-ignore - inertia page type inference issue
    return inertia.render('orgbuilder/organizations/edit', {
      org: org.serialize(),
      leadOwners: leadOwners.map((o) => o.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const data = await request.validateUsing(organizationStep1Validator)
    try {
      const org = await orgService.update(Number(params.id), data as any)
      session.flash('success', 'Organization updated successfully!')
      return response.redirect().toRoute('organizations.edit', { id: org.id })
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

  async updateModules({ params, request, response, session }: HttpContext) {
    const { modules } = await request.validateUsing(updateModulesValidator)
    await orgService.updateModules(
      Number(params.id),
      modules as { moduleId: number; enabled: boolean; addonIds: number[] }[]
    )
    session.flash('success', 'Modules updated successfully!')
    return response.redirect().back()
  }

  async bulk({ request, response, session }: HttpContext) {
    const { ids, operation, payload } = await request.validateUsing(bulkOperationValidator)
    await orgService.bulkOperation(ids, operation, payload as any)
    session.flash('success', `Bulk operation "${operation}" completed for ${ids.length} organization(s).`)
    return response.redirect().back()
  }

  async updateSuperAdmin({ params, request, response, session }: HttpContext) {
    const { fullName, employeeCode, phone, gender, dateOfBirth } = request.only([
      'fullName', 'employeeCode', 'phone', 'gender', 'dateOfBirth',
    ])

    const user = await OrganizationUser.query()
      .where('org_id', params.id)
      .orderBy('id', 'asc')
      .first()

    if (!user) {
      session.flash('flashToasts', JSON.stringify(['Super admin not found for this organization.']))
      return response.redirect().back()
    }

    if (fullName) user.fullName = String(fullName).trim()
    user.employeeCode = employeeCode ? String(employeeCode).trim() : null
    user.phone = phone ? String(phone).trim() : null
    user.gender = gender && ['male', 'female', 'other'].includes(gender)
      ? (gender as 'male' | 'female' | 'other')
      : null
    user.dateOfBirth = dateOfBirth ? String(dateOfBirth) : null
    await user.save()

    session.flash('success', 'Super admin updated successfully!')
    return response.redirect().back()
  }

  // ── POST /organizations/:id/super-admin/reset-password ─────────────────────
  async resetSuperAdminPassword({ params, response, session }: HttpContext) {
    const user = await OrganizationUser.query()
      .where('org_id', params.id)
      .orderBy('id', 'asc')
      .first()

    if (!user) {
      session.flash('error', 'Super admin not found for this organization.')
      return response.redirect().back()
    }

    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '1!'
    user.passwordHash = await hash.make(newPassword)
    await user.save()

    session.flash('success', `Password reset! New temporary password: ${newPassword}`)
    return response.redirect().back()
  }

  // ── GET /api/orgs/search ───────────────────────────────────────────────────
  async searchOrgs({ request, response }: HttpContext) {
    const q = String(request.qs().q || '').trim()
    if (!q) return response.json([])

    const numericId = Number.isInteger(Number(q)) && Number(q) > 0 ? Number(q) : null

    const query = Organization.query()
      .whereNull('deleted_at')
      .where((b) => {
        b.where('name', 'like', `%${q}%`)
          .orWhere('org_id', 'like', `%${q}%`)
        if (numericId) b.orWhere('id', numericId)
      })
      .orderBy('name', 'asc')
      .limit(8)

    const orgs = await query
    return response.json(orgs.map((o) => ({
      id:       o.id,
      orgId:    o.orgId,
      name:     o.name,
      status:   o.status,
      planType: o.planType,
      country:  o.country,
      city:     o.city,
    })))
  }

  async checkOrgEmail({ request, response }: HttpContext) {
    const email = String(request.qs().email || '')
    const excludeId = Number(request.qs().excludeId)
    if (!email || !excludeId) return response.json({ exists: false })
    const orgRepo = new OrganizationRepository()
    const exists = await orgRepo.emailExistsExcluding(email, excludeId)
    return response.json({ exists })
  }

  async checkOrgPhone({ request, response }: HttpContext) {
    const phone = String(request.qs().phone || '')
    const excludeId = Number(request.qs().excludeId)
    if (!phone || !excludeId) return response.json({ exists: false })
    const orgRepo = new OrganizationRepository()
    const exists = await orgRepo.phoneExistsExcluding(phone, excludeId)
    return response.json({ exists })
  }

  async checkAdminPhone({ request, response }: HttpContext) {
    const phone = String(request.qs().phone || '')
    const excludeUserId = Number(request.qs().excludeUserId)
    if (!phone || !excludeUserId) return response.json({ exists: false })
    const found = await OrganizationUser.query().where('phone', phone).whereNot('id', excludeUserId).first()
    return response.json({ exists: !!found })
  }

  async exportCsv({ request, response }: HttpContext) {
    const qs = request.qs()
    const orgs = await orgService.list({
      search: qs.search,
      tab: qs.tab,
      status: qs.status,
      leadOwnerId: qs.lead_owner_id ? Number(qs.lead_owner_id) : undefined,
      country: qs.country,
      city: qs.city,
      createdFrom: qs.created_from,
      createdTo: qs.created_to,
      perPage: 2000,
    })

    const serialized = orgs.serialize()
    const rows = serialized.data as any[]

    const { DateTime } = await import('luxon')
    function fmtDate(val: string | null | undefined): string {
      if (!val) return ''
      const dt = DateTime.fromISO(val)
      return dt.isValid ? dt.toFormat('dd MMM yyyy') : ''
    }

    function escapeCsv(val: unknown): string {
      const s = val == null ? '' : String(val)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    // CamelCaseNamingStrategy serialises columns as camelCase
    const headers = ['Org ID', 'Name', 'Plan', 'Status', 'User Limit', 'Plan Start', 'Plan End', 'Country', 'City', 'Created']
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.orgId,
          r.name,
          r.planType,
          r.status,
          r.userLimit,
          fmtDate(r.planStart),
          fmtDate(r.planEnd),
          r.country,
          r.city,
          fmtDate(r.createdAt),
        ].map(escapeCsv).join(',')
      ),
    ].join('\n')

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header('Content-Disposition', 'attachment; filename="organizations.csv"')
    return response.send(csv)
  }

  async storeUser({ params, request, response, session }: HttpContext) {
    const { fullName, companyEmail, password, employeeCode, phone, gender, dateOfBirth, sendWelcomeMail, isActive, profileId } =
      request.only(['fullName', 'companyEmail', 'password', 'employeeCode', 'phone', 'gender', 'dateOfBirth', 'sendWelcomeMail', 'isActive', 'profileId'])

    if (!fullName || !companyEmail || !password) {
      session.flash('flashToasts', JSON.stringify(['Name, email, and password are required.']))
      return response.redirect().back()
    }

    const exists = await OrganizationUser.query().where('company_email', String(companyEmail).trim().toLowerCase()).first()
    if (exists) {
      session.flash('flashToasts', JSON.stringify(['This email is already registered in an organization.']))
      return response.redirect().back()
    }

    const passwordHash = await hash.make(String(password))
    await OrganizationUser.create({
      orgId: Number(params.id),
      profileId: profileId ? Number(profileId) : null,
      fullName: String(fullName).trim(),
      companyEmail: String(companyEmail).trim().toLowerCase(),
      passwordHash,
      employeeCode: employeeCode ? String(employeeCode).trim() : null,
      phone: phone ? String(phone).trim() : null,
      gender: gender && ['male', 'female', 'other'].includes(gender) ? (gender as 'male' | 'female' | 'other') : null,
      dateOfBirth: dateOfBirth ? String(dateOfBirth) : null,
      sendWelcomeMail: sendWelcomeMail === true || sendWelcomeMail === 'true' || sendWelcomeMail === '1',
      isActive: isActive !== false && isActive !== 'false' && isActive !== '0',
    })

    session.flash('success', `User "${String(fullName).trim()}" added successfully!`)
    return response.redirect().back()
  }

  async updateUser({ params, request, response, session }: HttpContext) {
    const { fullName, employeeCode, phone, gender, dateOfBirth, isActive, password, profileId } =
      request.only(['fullName', 'employeeCode', 'phone', 'gender', 'dateOfBirth', 'isActive', 'password', 'profileId'])

    const user = await OrganizationUser.query()
      .where('id', params.userId)
      .where('org_id', params.id)
      .first()

    if (!user) {
      session.flash('flashToasts', JSON.stringify(['User not found.']))
      return response.redirect().back()
    }

    if (fullName) user.fullName = String(fullName).trim()
    user.profileId = profileId ? Number(profileId) : null
    user.employeeCode = employeeCode ? String(employeeCode).trim() : null
    user.phone = phone ? String(phone).trim() : null
    user.gender = gender && ['male', 'female', 'other'].includes(gender)
      ? (gender as 'male' | 'female' | 'other')
      : null
    user.dateOfBirth = dateOfBirth ? String(dateOfBirth) : null
    user.isActive = isActive !== false && isActive !== 'false' && isActive !== '0'

    if (password && String(password).trim()) {
      user.passwordHash = await hash.make(String(password).trim())
    }

    await user.save()
    session.flash('success', 'User updated successfully!')
    return response.redirect().back()
  }

  async bulkUsers({ params, request, response, session }: HttpContext) {
    const { ids: rawIds, operation } = request.only(['ids', 'operation'])
    const ids = Array.isArray(rawIds) ? rawIds.slice(0, 500) : []
    if (!ids.length) {
      session.flash('flashToasts', JSON.stringify(['No users selected.']))
      return response.redirect().back()
    }
    const orgId = Number(params.id)
    if (operation === 'activate') {
      await OrganizationUser.query().whereIn('id', ids).where('org_id', orgId).update({ isActive: true })
      session.flash('success', `${ids.length} user(s) activated.`)
    } else if (operation === 'deactivate') {
      await OrganizationUser.query().whereIn('id', ids).where('org_id', orgId).update({ isActive: false })
      session.flash('success', `${ids.length} user(s) deactivated.`)
    } else {
      session.flash('flashToasts', JSON.stringify(['Unknown operation.']))
    }
    return response.redirect().back()
  }
}
