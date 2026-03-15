import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const DashboardController = () => import('#orgbuilder/controllers/dashboard_controller')
const OrganizationController = () => import('#orgbuilder/controllers/organization_controller')
const OrganizationProfileController = () => import('#orgbuilder/controllers/organization_profile_controller')
const LeadOwnerController = () => import('#orgbuilder/controllers/lead_owner_controller')
const MastersController = () => import('#orgbuilder/controllers/masters_controller')
const SettingsController = () => import('#orgbuilder/controllers/settings_controller')

export default function orgbuilderRoutes() {
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
          router.get('/check-email', [OrganizationController, 'checkOrgEmail']).as('organizations.checkEmail')
          router.get('/check-phone', [OrganizationController, 'checkOrgPhone']).as('organizations.checkPhone')
          router.get('/check-admin-phone', [OrganizationController, 'checkAdminPhone']).as('organizations.checkAdminPhone')
          router.get('/:id', [OrganizationController, 'show']).as('organizations.show')
          router.get('/:id/edit', [OrganizationController, 'edit']).as('organizations.edit')
          router.put('/:id', [OrganizationController, 'update']).as('organizations.update')
          router.put('/:id/super-admin', [OrganizationController, 'updateSuperAdmin']).as('organizations.superAdmin.update')
          router.post('/:id/super-admin/reset-password', [OrganizationController, 'resetSuperAdminPassword']).as('organizations.superAdmin.resetPassword')
          router.post('/:id/super-admin/impersonate', [OrganizationController, 'impersonateSuperAdmin']).as('organizations.superAdmin.impersonate')
          router.put('/:id/modules', [OrganizationController, 'updateModules']).as('organizations.modules.update')
          router.post('/:id/users', [OrganizationController, 'storeUser']).as('organizations.users.store')
          router.put('/:id/users/:userId', [OrganizationController, 'updateUser']).as('organizations.users.update')
          router.post('/:id/users/bulk', [OrganizationController, 'bulkUsers']).as('organizations.users.bulk')
          router.post('/:id/users/:userId/impersonate', [OrganizationController, 'impersonateUser']).as('organizations.users.impersonate')
          router.get('/:id/profiles', [OrganizationProfileController, 'index']).as('organizations.profiles.index')
          router.post('/:id/profiles', [OrganizationProfileController, 'store']).as('organizations.profiles.store')
          router.put('/:id/profiles/:profileId', [OrganizationProfileController, 'update']).as('organizations.profiles.update')
          router.delete('/:id/profiles/:profileId', [OrganizationProfileController, 'destroy']).as('organizations.profiles.destroy')
          router.put('/:id/profiles/:profileId/permissions', [OrganizationProfileController, 'updatePermissions']).as('organizations.profiles.permissions.update')
          router.delete('/:id', [OrganizationController, 'destroy']).as('organizations.destroy')
        })
        .prefix('organizations')

      // Lead Owners
      router
        .group(() => {
          router.get('/', [LeadOwnerController, 'index']).as('leads.index')
          router.post('/', [LeadOwnerController, 'store']).as('leads.store')
          router.post('/bulk', [LeadOwnerController, 'bulk']).as('leads.bulk')
          router.put('/:id', [LeadOwnerController, 'update']).as('leads.update')
          router.delete('/:id', [LeadOwnerController, 'destroy']).as('leads.destroy')
        })
        .prefix('leads')

      // Masters
      router
        .group(() => {
          router.get('/', [MastersController, 'index']).as('masters.index')
          router.post('/modules', [MastersController, 'storeModule']).as('masters.modules.store')
          router.put('/modules/:id', [MastersController, 'updateModule']).as('masters.modules.update')
          router.post('/addons', [MastersController, 'storeAddon']).as('masters.addons.store')
          router.put('/addons/:id', [MastersController, 'updateAddon']).as('masters.addons.update')
        })
        .prefix('masters')

      // Settings
      router
        .group(() => {
          router.get('/', [SettingsController, 'index']).as('settings.index')
          router.put('/profile', [SettingsController, 'updateProfile']).as('settings.profile.update')
          router.put('/password', [SettingsController, 'changePassword']).as('settings.password.update')
          router.delete('/totp', [SettingsController, 'disableTotp']).as('settings.totp.disable')
          router.put('/platform', [SettingsController, 'updatePlatform']).as('settings.platform.update')
          router.put('/org-defaults', [SettingsController, 'updateOrgDefaults']).as('settings.orgDefaults.update')
          router.post('/users', [SettingsController, 'storeUser']).as('settings.users.store')
          router.put('/users/:id', [SettingsController, 'updateUser']).as('settings.users.update')
          router.put('/users/:id/toggle', [SettingsController, 'toggleUser']).as('settings.users.toggle')
          router.put('/users/:id/reset-password', [SettingsController, 'resetUserPassword']).as('settings.users.resetPassword')
        })
        .prefix('settings')

      // Catch-all
      router.any('*', ({ response }) => response.redirect('/orgbuilder/dashboard'))
    })
    .prefix('orgbuilder')
    .use(middleware.auth())
}
