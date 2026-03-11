import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'hrms.login': { paramsTuple?: []; params?: {} }
    'hrms.login.submit': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.login.store': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'auth.google.callback': { paramsTuple?: []; params?: {} }
    'auth.totp.verify': { paramsTuple?: []; params?: {} }
    'auth.totp.verify.store': { paramsTuple?: []; params?: {} }
    'auth.totp.setup': { paramsTuple?: []; params?: {} }
    'auth.totp.setup.store': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'api.countries': { paramsTuple?: []; params?: {} }
    'api.cities': { paramsTuple?: []; params?: {} }
    'api.currencies': { paramsTuple?: []; params?: {} }
    'api.timezones': { paramsTuple?: []; params?: {} }
    'api.modules': { paramsTuple?: []; params?: {} }
    'api.lead_owners': { paramsTuple?: []; params?: {} }
    'api.orgs.search': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.create': { paramsTuple?: []; params?: {} }
    'organizations.store': { paramsTuple?: []; params?: {} }
    'organizations.bulk': { paramsTuple?: []; params?: {} }
    'organizations.export': { paramsTuple?: []; params?: {} }
    'organizations.checkEmail': { paramsTuple?: []; params?: {} }
    'organizations.checkPhone': { paramsTuple?: []; params?: {} }
    'organizations.checkAdminPhone': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.superAdmin.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.superAdmin.resetPassword': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.modules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.users.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.users.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'userId': ParamValue} }
    'organizations.users.bulk': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.profiles.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.profiles.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.profiles.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'profileId': ParamValue} }
    'organizations.profiles.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'profileId': ParamValue} }
    'organizations.profiles.permissions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'profileId': ParamValue} }
    'organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.index': { paramsTuple?: []; params?: {} }
    'leads.store': { paramsTuple?: []; params?: {} }
    'leads.bulk': { paramsTuple?: []; params?: {} }
    'leads.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'masters.index': { paramsTuple?: []; params?: {} }
    'masters.modules.store': { paramsTuple?: []; params?: {} }
    'masters.modules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'masters.addons.store': { paramsTuple?: []; params?: {} }
    'masters.addons.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'settings.profile.update': { paramsTuple?: []; params?: {} }
    'settings.password.update': { paramsTuple?: []; params?: {} }
    'settings.totp.disable': { paramsTuple?: []; params?: {} }
    'settings.platform.update': { paramsTuple?: []; params?: {} }
    'settings.orgDefaults.update': { paramsTuple?: []; params?: {} }
    'settings.users.store': { paramsTuple?: []; params?: {} }
    'settings.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.users.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.users.resetPassword': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.logout': { paramsTuple?: []; params?: {} }
    'hrms.self-service': { paramsTuple?: []; params?: {} }
    'hrms.leave': { paramsTuple?: []; params?: {} }
    'hrms.payroll': { paramsTuple?: []; params?: {} }
    'hrms.dashboard': { paramsTuple?: []; params?: {} }
    'hrms.org.company': { paramsTuple?: []; params?: {} }
    'hrms.org.company.update': { paramsTuple?: []; params?: {} }
    'hrms.org.roles': { paramsTuple?: []; params?: {} }
    'hrms.org.hierarchy': { paramsTuple?: []; params?: {} }
    'hrms.org.hierarchy.store': { paramsTuple?: []; params?: {} }
    'hrms.org.hierarchy.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.org.hierarchy.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.divisions': { paramsTuple?: []; params?: {} }
    'hrms.divisions.store': { paramsTuple?: []; params?: {} }
    'hrms.divisions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.divisions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.locations': { paramsTuple?: []; params?: {} }
    'hrms.locations.store': { paramsTuple?: []; params?: {} }
    'hrms.locations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.locations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.departments': { paramsTuple?: []; params?: {} }
    'hrms.departments.store': { paramsTuple?: []; params?: {} }
    'hrms.departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sub-departments': { paramsTuple?: []; params?: {} }
    'hrms.sub-departments.store': { paramsTuple?: []; params?: {} }
    'hrms.sub-departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sub-departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.designations': { paramsTuple?: []; params?: {} }
    'hrms.designations.store': { paramsTuple?: []; params?: {} }
    'hrms.designations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.designations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.grades': { paramsTuple?: []; params?: {} }
    'hrms.grades.store': { paramsTuple?: []; params?: {} }
    'hrms.grades.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.grades.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sections': { paramsTuple?: []; params?: {} }
    'hrms.sections.store': { paramsTuple?: []; params?: {} }
    'hrms.sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sub-sections': { paramsTuple?: []; params?: {} }
    'hrms.sub-sections.store': { paramsTuple?: []; params?: {} }
    'hrms.sub-sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sub-sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.holidays': { paramsTuple?: []; params?: {} }
    'hrms.holidays.store': { paramsTuple?: []; params?: {} }
    'hrms.holidays.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.holidays.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.notice-period': { paramsTuple?: []; params?: {} }
    'hrms.notice-period.store': { paramsTuple?: []; params?: {} }
    'hrms.notice-period.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.notice-period.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.approvals': { paramsTuple?: []; params?: {} }
    'hrms.approvals.store': { paramsTuple?: []; params?: {} }
    'hrms.approvals.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.approvals.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.documents': { paramsTuple?: []; params?: {} }
    'hrms.documents.store': { paramsTuple?: []; params?: {} }
    'hrms.documents.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.documents.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.checklists': { paramsTuple?: []; params?: {} }
    'hrms.checklists.store': { paramsTuple?: []; params?: {} }
    'hrms.checklists.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.checklists.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.templates': { paramsTuple?: []; params?: {} }
    'hrms.templates.store': { paramsTuple?: []; params?: {} }
    'hrms.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.alerts': { paramsTuple?: []; params?: {} }
    'hrms.notifications': { paramsTuple?: []; params?: {} }
    'hrms.fiscal-year': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'hrms.login': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'auth.google.callback': { paramsTuple?: []; params?: {} }
    'auth.totp.verify': { paramsTuple?: []; params?: {} }
    'auth.totp.setup': { paramsTuple?: []; params?: {} }
    'api.countries': { paramsTuple?: []; params?: {} }
    'api.cities': { paramsTuple?: []; params?: {} }
    'api.currencies': { paramsTuple?: []; params?: {} }
    'api.timezones': { paramsTuple?: []; params?: {} }
    'api.modules': { paramsTuple?: []; params?: {} }
    'api.lead_owners': { paramsTuple?: []; params?: {} }
    'api.orgs.search': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.create': { paramsTuple?: []; params?: {} }
    'organizations.export': { paramsTuple?: []; params?: {} }
    'organizations.checkEmail': { paramsTuple?: []; params?: {} }
    'organizations.checkPhone': { paramsTuple?: []; params?: {} }
    'organizations.checkAdminPhone': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.profiles.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.index': { paramsTuple?: []; params?: {} }
    'masters.index': { paramsTuple?: []; params?: {} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'hrms.self-service': { paramsTuple?: []; params?: {} }
    'hrms.leave': { paramsTuple?: []; params?: {} }
    'hrms.payroll': { paramsTuple?: []; params?: {} }
    'hrms.dashboard': { paramsTuple?: []; params?: {} }
    'hrms.org.company': { paramsTuple?: []; params?: {} }
    'hrms.org.roles': { paramsTuple?: []; params?: {} }
    'hrms.org.hierarchy': { paramsTuple?: []; params?: {} }
    'hrms.divisions': { paramsTuple?: []; params?: {} }
    'hrms.locations': { paramsTuple?: []; params?: {} }
    'hrms.departments': { paramsTuple?: []; params?: {} }
    'hrms.sub-departments': { paramsTuple?: []; params?: {} }
    'hrms.designations': { paramsTuple?: []; params?: {} }
    'hrms.grades': { paramsTuple?: []; params?: {} }
    'hrms.sections': { paramsTuple?: []; params?: {} }
    'hrms.sub-sections': { paramsTuple?: []; params?: {} }
    'hrms.holidays': { paramsTuple?: []; params?: {} }
    'hrms.notice-period': { paramsTuple?: []; params?: {} }
    'hrms.approvals': { paramsTuple?: []; params?: {} }
    'hrms.documents': { paramsTuple?: []; params?: {} }
    'hrms.checklists': { paramsTuple?: []; params?: {} }
    'hrms.templates': { paramsTuple?: []; params?: {} }
    'hrms.alerts': { paramsTuple?: []; params?: {} }
    'hrms.notifications': { paramsTuple?: []; params?: {} }
    'hrms.fiscal-year': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'hrms.login': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'auth.google.callback': { paramsTuple?: []; params?: {} }
    'auth.totp.verify': { paramsTuple?: []; params?: {} }
    'auth.totp.setup': { paramsTuple?: []; params?: {} }
    'api.countries': { paramsTuple?: []; params?: {} }
    'api.cities': { paramsTuple?: []; params?: {} }
    'api.currencies': { paramsTuple?: []; params?: {} }
    'api.timezones': { paramsTuple?: []; params?: {} }
    'api.modules': { paramsTuple?: []; params?: {} }
    'api.lead_owners': { paramsTuple?: []; params?: {} }
    'api.orgs.search': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.create': { paramsTuple?: []; params?: {} }
    'organizations.export': { paramsTuple?: []; params?: {} }
    'organizations.checkEmail': { paramsTuple?: []; params?: {} }
    'organizations.checkPhone': { paramsTuple?: []; params?: {} }
    'organizations.checkAdminPhone': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.profiles.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.index': { paramsTuple?: []; params?: {} }
    'masters.index': { paramsTuple?: []; params?: {} }
    'settings.index': { paramsTuple?: []; params?: {} }
    'hrms.self-service': { paramsTuple?: []; params?: {} }
    'hrms.leave': { paramsTuple?: []; params?: {} }
    'hrms.payroll': { paramsTuple?: []; params?: {} }
    'hrms.dashboard': { paramsTuple?: []; params?: {} }
    'hrms.org.company': { paramsTuple?: []; params?: {} }
    'hrms.org.roles': { paramsTuple?: []; params?: {} }
    'hrms.org.hierarchy': { paramsTuple?: []; params?: {} }
    'hrms.divisions': { paramsTuple?: []; params?: {} }
    'hrms.locations': { paramsTuple?: []; params?: {} }
    'hrms.departments': { paramsTuple?: []; params?: {} }
    'hrms.sub-departments': { paramsTuple?: []; params?: {} }
    'hrms.designations': { paramsTuple?: []; params?: {} }
    'hrms.grades': { paramsTuple?: []; params?: {} }
    'hrms.sections': { paramsTuple?: []; params?: {} }
    'hrms.sub-sections': { paramsTuple?: []; params?: {} }
    'hrms.holidays': { paramsTuple?: []; params?: {} }
    'hrms.notice-period': { paramsTuple?: []; params?: {} }
    'hrms.approvals': { paramsTuple?: []; params?: {} }
    'hrms.documents': { paramsTuple?: []; params?: {} }
    'hrms.checklists': { paramsTuple?: []; params?: {} }
    'hrms.templates': { paramsTuple?: []; params?: {} }
    'hrms.alerts': { paramsTuple?: []; params?: {} }
    'hrms.notifications': { paramsTuple?: []; params?: {} }
    'hrms.fiscal-year': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'hrms.login.submit': { paramsTuple?: []; params?: {} }
    'auth.login.store': { paramsTuple?: []; params?: {} }
    'auth.totp.verify.store': { paramsTuple?: []; params?: {} }
    'auth.totp.setup.store': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'organizations.store': { paramsTuple?: []; params?: {} }
    'organizations.bulk': { paramsTuple?: []; params?: {} }
    'organizations.superAdmin.resetPassword': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.users.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.users.bulk': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.profiles.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.store': { paramsTuple?: []; params?: {} }
    'leads.bulk': { paramsTuple?: []; params?: {} }
    'masters.modules.store': { paramsTuple?: []; params?: {} }
    'masters.addons.store': { paramsTuple?: []; params?: {} }
    'settings.users.store': { paramsTuple?: []; params?: {} }
    'hrms.logout': { paramsTuple?: []; params?: {} }
    'hrms.org.hierarchy.store': { paramsTuple?: []; params?: {} }
    'hrms.divisions.store': { paramsTuple?: []; params?: {} }
    'hrms.locations.store': { paramsTuple?: []; params?: {} }
    'hrms.departments.store': { paramsTuple?: []; params?: {} }
    'hrms.sub-departments.store': { paramsTuple?: []; params?: {} }
    'hrms.designations.store': { paramsTuple?: []; params?: {} }
    'hrms.grades.store': { paramsTuple?: []; params?: {} }
    'hrms.sections.store': { paramsTuple?: []; params?: {} }
    'hrms.sub-sections.store': { paramsTuple?: []; params?: {} }
    'hrms.holidays.store': { paramsTuple?: []; params?: {} }
    'hrms.notice-period.store': { paramsTuple?: []; params?: {} }
    'hrms.approvals.store': { paramsTuple?: []; params?: {} }
    'hrms.documents.store': { paramsTuple?: []; params?: {} }
    'hrms.checklists.store': { paramsTuple?: []; params?: {} }
    'hrms.templates.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.superAdmin.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.modules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.users.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'userId': ParamValue} }
    'organizations.profiles.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'profileId': ParamValue} }
    'organizations.profiles.permissions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'profileId': ParamValue} }
    'leads.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'masters.modules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'masters.addons.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.profile.update': { paramsTuple?: []; params?: {} }
    'settings.password.update': { paramsTuple?: []; params?: {} }
    'settings.platform.update': { paramsTuple?: []; params?: {} }
    'settings.orgDefaults.update': { paramsTuple?: []; params?: {} }
    'settings.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.users.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.users.resetPassword': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.org.company.update': { paramsTuple?: []; params?: {} }
    'hrms.org.hierarchy.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.divisions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.locations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sub-departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.designations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.grades.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sub-sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.holidays.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.notice-period.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.approvals.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.documents.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.checklists.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'organizations.profiles.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'profileId': ParamValue} }
    'organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.totp.disable': { paramsTuple?: []; params?: {} }
    'hrms.org.hierarchy.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.divisions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.locations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sub-departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.designations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.grades.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.sub-sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.holidays.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.notice-period.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.approvals.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.documents.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.checklists.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'hrms.templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  OPTIONS: {
  }
  PATCH: {
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}