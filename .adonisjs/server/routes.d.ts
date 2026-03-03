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
    'dashboard': { paramsTuple?: []; params?: {} }
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.create': { paramsTuple?: []; params?: {} }
    'organizations.store': { paramsTuple?: []; params?: {} }
    'organizations.bulk': { paramsTuple?: []; params?: {} }
    'organizations.export': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'auth.google.callback': { paramsTuple?: []; params?: {} }
    'auth.totp.verify': { paramsTuple?: []; params?: {} }
    'auth.totp.setup': { paramsTuple?: []; params?: {} }
    'api.countries': { paramsTuple?: []; params?: {} }
    'api.cities': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.create': { paramsTuple?: []; params?: {} }
    'organizations.export': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.google': { paramsTuple?: []; params?: {} }
    'auth.google.callback': { paramsTuple?: []; params?: {} }
    'auth.totp.verify': { paramsTuple?: []; params?: {} }
    'auth.totp.setup': { paramsTuple?: []; params?: {} }
    'api.countries': { paramsTuple?: []; params?: {} }
    'api.cities': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.create': { paramsTuple?: []; params?: {} }
    'organizations.export': { paramsTuple?: []; params?: {} }
    'organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.login.store': { paramsTuple?: []; params?: {} }
    'auth.totp.verify.store': { paramsTuple?: []; params?: {} }
    'auth.totp.setup.store': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'organizations.store': { paramsTuple?: []; params?: {} }
    'organizations.bulk': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}