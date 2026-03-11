import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const HrmsAuthController = () => import('#hrms/controllers/auth_controller')
const HrmsDashboardController = () => import('#hrms/controllers/dashboard_controller')
const HrmsSelfServiceController = () => import('#hrms/controllers/self_service_controller')
const HrmsLeaveController      = () => import('#hrms/controllers/leave_controller')
const HrmsPayrollController    = () => import('#hrms/controllers/payroll_controller')
const HrmsCompanyController    = () => import('#hrms/controllers/company_controller')
const HrmsRolesController = () => import('#hrms/controllers/roles_controller')
const HrmsHierarchyController = () => import('#hrms/controllers/hierarchy_controller')
const HrmsSettingsController = () => import('#hrms/controllers/settings_controller')

export default function hrmsRoutes() {
  // Login routes moved to start/routes.ts at /login (root level)

  router.post('/hrms/logout', [HrmsAuthController, 'logout']).as('hrms.logout')

  router
    .group(() => {
      router.get('/self-service', [HrmsSelfServiceController, 'index']).as('hrms.self-service')
      router.get('/leave',       [HrmsLeaveController,       'index']).as('hrms.leave')
      router.get('/payroll',     [HrmsPayrollController,     'index']).as('hrms.payroll')
      router.get('/dashboard', [HrmsDashboardController, 'index']).as('hrms.dashboard')

      router.get('/organization/company', [HrmsCompanyController, 'show']).as('hrms.org.company')
      router.put('/organization/company', [HrmsCompanyController, 'update']).as('hrms.org.company.update')

      router.get('/organization/roles', [HrmsRolesController, 'index']).as('hrms.org.roles')

      router.get('/organization/hierarchy', [HrmsHierarchyController, 'index']).as('hrms.org.hierarchy')
      router.post('/organization/hierarchy', [HrmsHierarchyController, 'store']).as('hrms.org.hierarchy.store')
      router.put('/organization/hierarchy/:id', [HrmsHierarchyController, 'update']).as('hrms.org.hierarchy.update')
      router.delete('/organization/hierarchy/:id', [HrmsHierarchyController, 'destroy']).as('hrms.org.hierarchy.destroy')

      router.get('/organization/settings/divisions', [HrmsSettingsController, 'divisionsIndex']).as('hrms.divisions')
      router.post('/organization/settings/divisions', [HrmsSettingsController, 'divisionsStore']).as('hrms.divisions.store')
      router.put('/organization/settings/divisions/:id', [HrmsSettingsController, 'divisionsUpdate']).as('hrms.divisions.update')
      router.delete('/organization/settings/divisions/:id', [HrmsSettingsController, 'divisionsDestroy']).as('hrms.divisions.destroy')

      router.get('/organization/settings/locations', [HrmsSettingsController, 'locationsIndex']).as('hrms.locations')
      router.post('/organization/settings/locations', [HrmsSettingsController, 'locationsStore']).as('hrms.locations.store')
      router.put('/organization/settings/locations/:id', [HrmsSettingsController, 'locationsUpdate']).as('hrms.locations.update')
      router.delete('/organization/settings/locations/:id', [HrmsSettingsController, 'locationsDestroy']).as('hrms.locations.destroy')

      router.get('/organization/settings/departments', [HrmsSettingsController, 'departmentsIndex']).as('hrms.departments')
      router.post('/organization/settings/departments', [HrmsSettingsController, 'departmentsStore']).as('hrms.departments.store')
      router.put('/organization/settings/departments/:id', [HrmsSettingsController, 'departmentsUpdate']).as('hrms.departments.update')
      router.delete('/organization/settings/departments/:id', [HrmsSettingsController, 'departmentsDestroy']).as('hrms.departments.destroy')

      router.get('/organization/settings/sub-departments', [HrmsSettingsController, 'subDepartmentsIndex']).as('hrms.sub-departments')
      router.post('/organization/settings/sub-departments', [HrmsSettingsController, 'subDepartmentsStore']).as('hrms.sub-departments.store')
      router.put('/organization/settings/sub-departments/:id', [HrmsSettingsController, 'subDepartmentsUpdate']).as('hrms.sub-departments.update')
      router.delete('/organization/settings/sub-departments/:id', [HrmsSettingsController, 'subDepartmentsDestroy']).as('hrms.sub-departments.destroy')

      router.get('/organization/settings/designations', [HrmsSettingsController, 'designationsIndex']).as('hrms.designations')
      router.post('/organization/settings/designations', [HrmsSettingsController, 'designationsStore']).as('hrms.designations.store')
      router.put('/organization/settings/designations/:id', [HrmsSettingsController, 'designationsUpdate']).as('hrms.designations.update')
      router.delete('/organization/settings/designations/:id', [HrmsSettingsController, 'designationsDestroy']).as('hrms.designations.destroy')

      router.get('/organization/settings/grades', [HrmsSettingsController, 'gradesIndex']).as('hrms.grades')
      router.post('/organization/settings/grades', [HrmsSettingsController, 'gradesStore']).as('hrms.grades.store')
      router.put('/organization/settings/grades/:id', [HrmsSettingsController, 'gradesUpdate']).as('hrms.grades.update')
      router.delete('/organization/settings/grades/:id', [HrmsSettingsController, 'gradesDestroy']).as('hrms.grades.destroy')

      router.get('/organization/settings/sections', [HrmsSettingsController, 'sectionsIndex']).as('hrms.sections')
      router.post('/organization/settings/sections', [HrmsSettingsController, 'sectionsStore']).as('hrms.sections.store')
      router.put('/organization/settings/sections/:id', [HrmsSettingsController, 'sectionsUpdate']).as('hrms.sections.update')
      router.delete('/organization/settings/sections/:id', [HrmsSettingsController, 'sectionsDestroy']).as('hrms.sections.destroy')

      router.get('/organization/settings/sub-sections', [HrmsSettingsController, 'subSectionsIndex']).as('hrms.sub-sections')
      router.post('/organization/settings/sub-sections', [HrmsSettingsController, 'subSectionsStore']).as('hrms.sub-sections.store')
      router.put('/organization/settings/sub-sections/:id', [HrmsSettingsController, 'subSectionsUpdate']).as('hrms.sub-sections.update')
      router.delete('/organization/settings/sub-sections/:id', [HrmsSettingsController, 'subSectionsDestroy']).as('hrms.sub-sections.destroy')

      router.get('/organization/settings/holidays', [HrmsSettingsController, 'holidaysIndex']).as('hrms.holidays')
      router.post('/organization/settings/holidays', [HrmsSettingsController, 'holidaysStore']).as('hrms.holidays.store')
      router.put('/organization/settings/holidays/:id', [HrmsSettingsController, 'holidaysUpdate']).as('hrms.holidays.update')
      router.delete('/organization/settings/holidays/:id', [HrmsSettingsController, 'holidaysDestroy']).as('hrms.holidays.destroy')

      router.get('/organization/settings/notice-period', [HrmsSettingsController, 'noticePeriodIndex']).as('hrms.notice-period')
      router.post('/organization/settings/notice-period', [HrmsSettingsController, 'noticePeriodStore']).as('hrms.notice-period.store')
      router.put('/organization/settings/notice-period/:id', [HrmsSettingsController, 'noticePeriodUpdate']).as('hrms.notice-period.update')
      router.delete('/organization/settings/notice-period/:id', [HrmsSettingsController, 'noticePeriodDestroy']).as('hrms.notice-period.destroy')

      router.get('/organization/settings/approvals', [HrmsSettingsController, 'approvalsIndex']).as('hrms.approvals')
      router.post('/organization/settings/approvals', [HrmsSettingsController, 'approvalsStore']).as('hrms.approvals.store')
      router.put('/organization/settings/approvals/:id', [HrmsSettingsController, 'approvalsUpdate']).as('hrms.approvals.update')
      router.delete('/organization/settings/approvals/:id', [HrmsSettingsController, 'approvalsDestroy']).as('hrms.approvals.destroy')

      router.get('/organization/settings/documents', [HrmsSettingsController, 'documentsIndex']).as('hrms.documents')
      router.post('/organization/settings/documents', [HrmsSettingsController, 'documentsStore']).as('hrms.documents.store')
      router.put('/organization/settings/documents/:id', [HrmsSettingsController, 'documentsUpdate']).as('hrms.documents.update')
      router.delete('/organization/settings/documents/:id', [HrmsSettingsController, 'documentsDestroy']).as('hrms.documents.destroy')

      router.get('/organization/settings/checklists', [HrmsSettingsController, 'checklistsIndex']).as('hrms.checklists')
      router.post('/organization/settings/checklists', [HrmsSettingsController, 'checklistsStore']).as('hrms.checklists.store')
      router.put('/organization/settings/checklists/:id', [HrmsSettingsController, 'checklistsUpdate']).as('hrms.checklists.update')
      router.delete('/organization/settings/checklists/:id', [HrmsSettingsController, 'checklistsDestroy']).as('hrms.checklists.destroy')

      router.get('/organization/settings/templates', [HrmsSettingsController, 'templatesIndex']).as('hrms.templates')
      router.post('/organization/settings/templates', [HrmsSettingsController, 'templatesStore']).as('hrms.templates.store')
      router.put('/organization/settings/templates/:id', [HrmsSettingsController, 'templatesUpdate']).as('hrms.templates.update')
      router.delete('/organization/settings/templates/:id', [HrmsSettingsController, 'templatesDestroy']).as('hrms.templates.destroy')

      router.get('/organization/settings/alerts', [HrmsSettingsController, 'alertsIndex']).as('hrms.alerts')
      router.get('/organization/settings/notifications', [HrmsSettingsController, 'notificationsIndex']).as('hrms.notifications')
      router.get('/organization/settings/fiscal-year', [HrmsSettingsController, 'fiscalYearIndex']).as('hrms.fiscal-year')

      router.get('/*', ({ response }) => response.redirect('/hrms/self-service'))
    })
    .prefix('/hrms')
    .use(middleware.hrmsAuth())
}
