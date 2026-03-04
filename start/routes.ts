import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const OrganizationController = () => import('#controllers/organization_controller')
const LocationController = () => import('#controllers/location_controller')

// Root redirect
router.on('/').redirectToPath('/dashboard')

// Auth routes (guest only)
router
  .group(() => {
    router.get('login', [AuthController, 'showLogin']).as('auth.login')
    router.post('login', [AuthController, 'login']).as('auth.login.store')
    router.get('auth/google', [AuthController, 'googleRedirect']).as('auth.google')
    router.get('auth/google/callback', [AuthController, 'googleCallback']).as('auth.google.callback')
  })
  .use(middleware.guest())

// TOTP verify (no auth required - just session pending)
router.get('auth/totp/verify', [AuthController, 'showTotpVerify']).as('auth.totp.verify')
router.post('auth/totp/verify', [AuthController, 'totpVerify']).as('auth.totp.verify.store')

// TOTP setup (requires being logged in via Google before TOTP confirmed)
router
  .get('auth/totp/setup', [AuthController, 'totpSetup'])
  .as('auth.totp.setup')
  .use(middleware.auth())
router.post('auth/totp/setup', [AuthController, 'totpEnable']).as('auth.totp.setup.store').use(middleware.auth())

// Logout
router.post('logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())

// Location API (public - used by dropdowns on create/edit forms)
router.get('/api/countries', [LocationController, 'countries']).as('api.countries')
router.get('/api/cities', [LocationController, 'cities']).as('api.cities')
router.get('/api/currencies', [LocationController, 'currencies']).as('api.currencies')
router.get('/api/timezones', [LocationController, 'timezones']).as('api.timezones')
router.get('/api/modules', [LocationController, 'modules']).as('api.modules')

// Authenticated routes
router
  .group(() => {
    // Dashboard
    router.get('dashboard', [DashboardController, 'index']).as('dashboard')

    // Organizations
    router
      .group(() => {
        router.get('/', [OrganizationController, 'index']).as('organizations.index')
        router.get('/create', [OrganizationController, 'create']).as('organizations.create')
        router.post('/', [OrganizationController, 'store']).as('organizations.store')
        router.post('/bulk', [OrganizationController, 'bulk']).as('organizations.bulk')
        router.get('/export', [OrganizationController, 'exportCsv']).as('organizations.export')
        router.get('/:id', [OrganizationController, 'show']).as('organizations.show')
        router.get('/:id/edit', [OrganizationController, 'edit']).as('organizations.edit')
        router.put('/:id', [OrganizationController, 'update']).as('organizations.update')
        router.delete('/:id', [OrganizationController, 'destroy']).as('organizations.destroy')
      })
      .prefix('organizations')
  })
  .use(middleware.auth())
