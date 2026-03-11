import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import OrganizationUser from '#models/organization_user'
import Organization from '#models/organization'

/**
 * HRMS auth middleware — protects all /hrms routes.
 * Session key: hrms_session → { employeeId, orgId }
 * Redirects unauthenticated users to /hrms/login.
 */
export default class HrmsAuthMiddleware {
  redirectTo = '/login'

  async handle(ctx: HttpContext, next: NextFn) {
    const session = ctx.session.get('hrms_session') as { employeeId: number; orgId: number } | undefined

    if (!session?.employeeId || !session?.orgId) {
      return ctx.response.redirect(this.redirectTo)
    }

    const employee = await OrganizationUser.query()
      .where('id', session.employeeId)
      .where('org_id', session.orgId)
      .where('is_active', true)
      .first()

    if (!employee) {
      ctx.session.forget('hrms_session')
      return ctx.response.redirect(this.redirectTo)
    }

    const org = await Organization.query()
      .where('id', session.orgId)
      .whereNull('deleted_at')
      .first()

    if (!org) {
      ctx.session.forget('hrms_session')
      return ctx.response.redirect(this.redirectTo)
    }

    // Attach to ctx for use in controllers / middleware downstream
    ctx.hrmsEmployee = employee
    ctx.hrmsOrg = org

    return next()
  }
}

// Extend HttpContext with HRMS properties
declare module '@adonisjs/core/http' {
  interface HttpContext {
    hrmsEmployee: OrganizationUser
    hrmsOrg: Organization
  }
}
