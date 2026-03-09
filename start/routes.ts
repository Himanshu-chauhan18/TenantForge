import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import orgbuilderRoutes from '#start/routes/orgbuilder'
import hrmsRoutes from '#start/routes/hrms'

const AuthController = () => import('#controllers/auth_controller')
const LocationController = () => import('#controllers/location_controller')
const LeadOwnerController = () => import('#orgbuilder/controllers/lead_owner_controller')
const OrganizationController = () => import('#orgbuilder/controllers/organization_controller')

// Root redirect
router.on('/').redirectToPath('/orgbuilder/dashboard')

// Auth routes (guest only)
router
  .group(() => {
    router.get('login', [AuthController, 'showLogin']).as('auth.login')
    router.post('login', [AuthController, 'login']).as('auth.login.store')
    router.get('auth/google', [AuthController, 'googleRedirect']).as('auth.google')
    router.get('auth/google/callback', [AuthController, 'googleCallback']).as('auth.google.callback')
  })
  .use(middleware.guest())

// TOTP routes
router.get('auth/totp/verify', [AuthController, 'showTotpVerify']).as('auth.totp.verify')
router.post('auth/totp/verify', [AuthController, 'totpVerify']).as('auth.totp.verify.store')
router.get('auth/totp/setup', [AuthController, 'totpSetup']).as('auth.totp.setup')
router.post('auth/totp/setup', [AuthController, 'totpEnable']).as('auth.totp.setup.store')

// Logout
router.post('logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())

// Location API (public)
router.get('/api/countries', [LocationController, 'countries']).as('api.countries')
router.get('/api/cities', [LocationController, 'cities']).as('api.cities')
router.get('/api/currencies', [LocationController, 'currencies']).as('api.currencies')
router.get('/api/timezones', [LocationController, 'timezones']).as('api.timezones')
router.get('/api/modules', [LocationController, 'modules']).as('api.modules')
router.get('/api/lead-owners', [LeadOwnerController, 'apiList']).as('api.lead_owners')

// Authenticated APIs (no module prefix — shared path)
router.get('/api/orgs/search', [OrganizationController, 'searchOrgs']).as('api.orgs.search').use(middleware.auth())

// Module routes
orgbuilderRoutes()
hrmsRoutes()
