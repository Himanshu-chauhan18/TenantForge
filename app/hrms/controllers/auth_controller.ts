import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import OrganizationUser from '#models/organization_user'
import Organization from '#models/organization'
import { hrmsLoginValidator } from '#hrms/validators/auth_validator'

export default class HrmsAuthController {
  async showLogin({ inertia, session, response }: HttpContext) {
    const existing = session.get('hrms_session')
    if (existing?.employeeId) return response.redirect('/hrms/dashboard')
    return inertia.render('hrms/auth/login')
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
      return inertia.render('hrms/auth/login', { authError: 'Your account has been deactivated. Please contact HR.' })
    }

    const passwordMatch = await hash.verify(employee.passwordHash, data.password)
    if (!passwordMatch) {
      return inertia.render('hrms/auth/login', { authError: 'Invalid email address or password.' })
    }

    // Verify the employee's org is active
    const org = await Organization.query()
      .where('id', employee.orgId)
      .whereNull('deleted_at')
      .first()

    if (!org || org.status !== 'active') {
      return inertia.render('hrms/auth/login', { authError: 'Your organization account is inactive or expired. Contact your administrator.' })
    }

    // Store HRMS session
    session.put('hrms_session', { employeeId: employee.id, orgId: org.id })
    return response.redirect('/hrms/dashboard')
  }

  async logout({ session, response }: HttpContext) {
    session.forget('hrms_session')
    return response.redirect('/login')
  }
}
