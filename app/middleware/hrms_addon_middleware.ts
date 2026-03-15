import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Guards HRMS routes by addon name.
 * Must run after hrmsAuth() so ctx.hrmsPermissions is already populated.
 *
 * - GET          → requires view
 * - POST         → requires add
 * - PUT / PATCH  → requires edit
 * - DELETE       → requires delete
 *
 * Usage in routes:
 *   router.group(() => { ... }).use(middleware.hrmsAddon('Settings - Divisions'))
 */
export default class HrmsAddonMiddleware {
  async handle(ctx: HttpContext, next: NextFn, addonName: string) {
    const { addonNameIndex, addonPermissions } = ctx.hrmsPermissions
    const addonId = addonNameIndex[addonName]

    if (addonId) {
      const perm = addonPermissions[addonId]
      if (perm) {
        const method  = ctx.request.method().toUpperCase()
        let allowed   = false
        if      (method === 'GET')    allowed = perm.view
        else if (method === 'POST')   allowed = perm.add
        else if (method === 'PUT')    allowed = perm.edit
        else if (method === 'PATCH')  allowed = perm.edit
        else if (method === 'DELETE') allowed = perm.delete
        else                          allowed = perm.view

        if (allowed) return next()
      }
    }

    // Access denied — redirect to dashboard with flash message
    ctx.session.flash('error', 'You do not have permission to access this page.')
    return ctx.response.redirect('/hrms/dashboard')
  }
}
