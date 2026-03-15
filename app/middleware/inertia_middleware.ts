import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import UserTransformer from '#transformers/user_transformer'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    /**
     * The share method is called everytime an Inertia page is rendered. In
     * certain cases, a page may get rendered before the session middleware
     * or the auth middleware are executed. For example: During a 404 request.
     *
     * In that case, we must always assume that HttpContext is not fully hydrated
     * with all the properties
     */
    const { session, auth } = ctx as Partial<HttpContext>

    /**
     * Fetching the first error from the flash messages
     */
    const errorsBag = session?.flashMessages.get('errorsBag') ?? {}
    const error: string | undefined = Object.keys(errorsBag)
      .filter((code) => code !== 'E_VALIDATION_ERROR')
      .map((code) => errorsBag[code])[0]

    /**
     * Data shared with all Inertia pages. Make sure you are using
     * transformers for rich data-types like Models.
     */
    const successMsg = session?.flashMessages.get('success')
    const flashErrors = session?.flashMessages.get('errors') ?? {}
    // Also pick up manual session.flash('error', msg) set by controllers
    const manualError = session?.flashMessages.get('error')
    // Multiple toast messages (e.g. multiple duplicate errors at once)
    const rawFlashToasts = session?.flashMessages.get('flashToasts')
    let flashToasts: string[] = []
    try { if (rawFlashToasts) flashToasts = JSON.parse(rawFlashToasts) } catch {}

    // HRMS employee shared props (loaded only when present on ctx)
    const hrmsEmployee    = (ctx as any).hrmsEmployee
    const hrmsOrg         = (ctx as any).hrmsOrg
    const hrmsPermissions = (ctx as any).hrmsPermissions

    let hrmsUser: Record<string, unknown> | undefined
    if (hrmsEmployee && hrmsOrg) {
      // Permissions rebuilt fresh each request in hrmsAuth middleware — always up to date
      const profileName      = hrmsPermissions?.profileName      ?? 'Employee'
      const permissions      = hrmsPermissions?.permissions      ?? {}
      const addonPermissions = hrmsPermissions?.addonPermissions ?? {}
      const addonNameIndex   = hrmsPermissions?.addonNameIndex   ?? {}
      const hasProfile       = hrmsPermissions?.hasProfile       ?? !!hrmsEmployee.profileId
      const moduleOrder      = hrmsPermissions?.moduleOrder      ?? []

      hrmsUser = {
        id:           hrmsEmployee.id,
        fullName:     hrmsEmployee.fullName,
        email:        hrmsEmployee.companyEmail,
        employeeCode: hrmsEmployee.employeeCode,
        profileId:    hrmsEmployee.profileId,
        profileName,
        hasProfile,
        permissions,
        addonPermissions,
        addonNameIndex,
        moduleOrder,
        initials: hrmsEmployee.fullName
          ? hrmsEmployee.fullName.trim().split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
          : hrmsEmployee.companyEmail.slice(0, 2).toUpperCase(),
        org: {
          id:    hrmsOrg.id,
          orgId: hrmsOrg.orgId,
          name:  hrmsOrg.name,
          logo:  hrmsOrg.logo,
        },
      }
    }

    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      flash: ctx.inertia.always({
        error: error || (typeof manualError === 'string' ? manualError : undefined),
        success: typeof successMsg === 'string' ? successMsg : undefined,
        errors: flashErrors,
        toasts: flashToasts.length > 0 ? flashToasts : undefined,
      }),
      user: ctx.inertia.always(
        // Don't leak OrgBuilder user into HRMS pages
        ctx.request.url().startsWith('/hrms') || ctx.request.url() === '/login'
          ? undefined
          : auth?.user ? UserTransformer.transform(auth.user) : undefined
      ),
      hrmsUser: ctx.inertia.always(hrmsUser as any),
    }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)

    const output = await next()
    this.dispose(ctx)

    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>
  export interface SharedProps extends MiddlewareSharedProps {}
}
