import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
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
    'dashboard': { paramsTuple?: []; params?: {} }
    'api.orgs.search': { paramsTuple?: []; params?: {} }
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
    'organizations.logo.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.superAdmin.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'masters.modules.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'masters.addons.store': { paramsTuple?: []; params?: {} }
    'masters.addons.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'masters.addons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
  }
  GET: {
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
    'dashboard': { paramsTuple?: []; params?: {} }
    'api.orgs.search': { paramsTuple?: []; params?: {} }
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
  }
  HEAD: {
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
    'dashboard': { paramsTuple?: []; params?: {} }
    'api.orgs.search': { paramsTuple?: []; params?: {} }
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
  }
  POST: {
    'auth.login.store': { paramsTuple?: []; params?: {} }
    'auth.totp.verify.store': { paramsTuple?: []; params?: {} }
    'auth.totp.setup.store': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'organizations.store': { paramsTuple?: []; params?: {} }
    'organizations.bulk': { paramsTuple?: []; params?: {} }
    'organizations.logo.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.users.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.users.bulk': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.profiles.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.store': { paramsTuple?: []; params?: {} }
    'leads.bulk': { paramsTuple?: []; params?: {} }
    'masters.modules.store': { paramsTuple?: []; params?: {} }
    'masters.addons.store': { paramsTuple?: []; params?: {} }
    'settings.users.store': { paramsTuple?: []; params?: {} }
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
  }
  DELETE: {
    'organizations.profiles.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'profileId': ParamValue} }
    'organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'masters.modules.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'masters.addons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.totp.disable': { paramsTuple?: []; params?: {} }
  }
  OPTIONS: {
  }
  PATCH: {
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}