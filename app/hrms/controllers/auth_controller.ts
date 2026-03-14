import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import OrganizationUser from '#models/organization_user'
import Organization from '#models/organization'
import { hrmsLoginValidator } from '#hrms/validators/auth_validator'

// Re-export types for consumers that previously imported from here
export type { HrmsPermEntry, HrmsAddonPermissions, HrmsAddonNameIndex, HrmsPermissions } from '#hrms/utils/build_permissions'

export default class HrmsAuthController {
  async checkIdentifier({ request, response }: HttpContext) {
    const raw = (request.input('identifier', '') as string).trim()
    const id = raw.toLowerCase()
    const employee = await OrganizationUser.query()
      .where((q) => {
        q.where('company_email', id).orWhere('phone', raw)
      })
      .first()
    return response.json({ exists: !!employee })
  }

  async showLogin({ inertia, session, response }: HttpContext) {
    const existing = session.get('hrms_session')
    if (existing?.employeeId) return response.redirect('/hrms/self-service')
    return inertia.render('hrms/auth/login', {})
  }

  async login({ request, response, session, inertia }: HttpContext) {
    const data = await request.validateUsing(hrmsLoginValidator)

    // Find employee by company email OR phone (across all orgs)
    const id = data.identifier.toLowerCase()
    const employee = await OrganizationUser.query()
      .where((q) => {
        q.where('company_email', id).orWhere('phone', data.identifier)
      })
      .first()

    if (!employee) {
      return inertia.render('hrms/auth/login', { authError: 'Invalid email address or password.' })
    }

    if (!employee.isActive) {
      return inertia.render('hrms/auth/login', { authError: 'Temporarily unable to sign in. Please contact your HR administrator.' })
    }

    const passwordMatch = await hash.verify(employee.passwordHash, data.password)
    if (!passwordMatch) {
      return inertia.render('hrms/auth/login', { authError: 'Invalid email address or password.' })
    }

    // Verify the employee's org exists, is active, and the plan has not expired
    const org = await Organization.query()
      .where('id', employee.orgId)
      .whereNull('deleted_at')
      .first()

    if (!org || org.status !== 'active' || org.isExpired) {
      return inertia.render('hrms/auth/login', { authError: 'Temporarily unable to sign in. Please contact your HR administrator.' })
    }

    // Session only stores identity — permissions are rebuilt fresh on every request in hrmsAuth middleware
    session.put('hrms_session', {
      employeeId: employee.id,
      orgId:      org.id,
    })

    return response.redirect('/hrms/self-service')
  }

  async logout({ session, response }: HttpContext) {
    session.forget('hrms_session')
    return response.redirect('/login')
  }
}
