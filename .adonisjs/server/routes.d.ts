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
    'organizations.modules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.index': { paramsTuple?: []; params?: {} }
    'leads.store': { paramsTuple?: []; params?: {} }
    'leads.bulk': { paramsTuple?: []; params?: {} }
    'leads.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.create': { paramsTuple?: []; params?: {} }
    'organizations.export': { paramsTuple?: []; params?: {} }
    'organizations.checkEmail': { paramsTuple?: []; params?: {} }
    'organizations.checkPhone': { paramsTuple?: []; params?: {} }
    'organizations.checkAdminPhone': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.index': { paramsTuple?: []; params?: {} }
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
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.create': { paramsTuple?: []; params?: {} }
    'organizations.export': { paramsTuple?: []; params?: {} }
    'organizations.checkEmail': { paramsTuple?: []; params?: {} }
    'organizations.checkPhone': { paramsTuple?: []; params?: {} }
    'organizations.checkAdminPhone': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.login.store': { paramsTuple?: []; params?: {} }
    'auth.totp.verify.store': { paramsTuple?: []; params?: {} }
    'auth.totp.setup.store': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'organizations.store': { paramsTuple?: []; params?: {} }
    'organizations.bulk': { paramsTuple?: []; params?: {} }
    'leads.store': { paramsTuple?: []; params?: {} }
    'leads.bulk': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.superAdmin.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.modules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'leads.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  OPTIONS: {
  }
  PATCH: {
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}