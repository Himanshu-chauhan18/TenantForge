import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Prevents authenticated HRMS employees from accessing the login page.
 */
export default class HrmsGuestMiddleware {
  redirectTo = '/hrms/dashboard'

  async handle(ctx: HttpContext, next: NextFn) {
    const session = ctx.session.get('hrms_session') as { employeeId: number } | undefined

    if (session?.employeeId) {
      return ctx.response.redirect(this.redirectTo)
    }

    return next()
  }
}
