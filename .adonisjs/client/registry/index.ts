/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.login.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login.store']['types'],
  },
  'auth.google': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google',
    tokens: [{"old":"/auth/google","type":0,"val":"auth","end":""},{"old":"/auth/google","type":0,"val":"google","end":""}],
    types: placeholder as Registry['auth.google']['types'],
  },
  'auth.google.callback': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google/callback',
    tokens: [{"old":"/auth/google/callback","type":0,"val":"auth","end":""},{"old":"/auth/google/callback","type":0,"val":"google","end":""},{"old":"/auth/google/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.google.callback']['types'],
  },
  'auth.totp.verify': {
    methods: ["GET","HEAD"],
    pattern: '/auth/totp/verify',
    tokens: [{"old":"/auth/totp/verify","type":0,"val":"auth","end":""},{"old":"/auth/totp/verify","type":0,"val":"totp","end":""},{"old":"/auth/totp/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['auth.totp.verify']['types'],
  },
  'auth.totp.verify.store': {
    methods: ["POST"],
    pattern: '/auth/totp/verify',
    tokens: [{"old":"/auth/totp/verify","type":0,"val":"auth","end":""},{"old":"/auth/totp/verify","type":0,"val":"totp","end":""},{"old":"/auth/totp/verify","type":0,"val":"verify","end":""}],
    types: placeholder as Registry['auth.totp.verify.store']['types'],
  },
  'auth.totp.setup': {
    methods: ["GET","HEAD"],
    pattern: '/auth/totp/setup',
    tokens: [{"old":"/auth/totp/setup","type":0,"val":"auth","end":""},{"old":"/auth/totp/setup","type":0,"val":"totp","end":""},{"old":"/auth/totp/setup","type":0,"val":"setup","end":""}],
    types: placeholder as Registry['auth.totp.setup']['types'],
  },
  'auth.totp.setup.store': {
    methods: ["POST"],
    pattern: '/auth/totp/setup',
    tokens: [{"old":"/auth/totp/setup","type":0,"val":"auth","end":""},{"old":"/auth/totp/setup","type":0,"val":"totp","end":""},{"old":"/auth/totp/setup","type":0,"val":"setup","end":""}],
    types: placeholder as Registry['auth.totp.setup.store']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'api.countries': {
    methods: ["GET","HEAD"],
    pattern: '/api/countries',
    tokens: [{"old":"/api/countries","type":0,"val":"api","end":""},{"old":"/api/countries","type":0,"val":"countries","end":""}],
    types: placeholder as Registry['api.countries']['types'],
  },
  'api.cities': {
    methods: ["GET","HEAD"],
    pattern: '/api/cities',
    tokens: [{"old":"/api/cities","type":0,"val":"api","end":""},{"old":"/api/cities","type":0,"val":"cities","end":""}],
    types: placeholder as Registry['api.cities']['types'],
  },
  'api.currencies': {
    methods: ["GET","HEAD"],
    pattern: '/api/currencies',
    tokens: [{"old":"/api/currencies","type":0,"val":"api","end":""},{"old":"/api/currencies","type":0,"val":"currencies","end":""}],
    types: placeholder as Registry['api.currencies']['types'],
  },
  'api.timezones': {
    methods: ["GET","HEAD"],
    pattern: '/api/timezones',
    tokens: [{"old":"/api/timezones","type":0,"val":"api","end":""},{"old":"/api/timezones","type":0,"val":"timezones","end":""}],
    types: placeholder as Registry['api.timezones']['types'],
  },
  'api.modules': {
    methods: ["GET","HEAD"],
    pattern: '/api/modules',
    tokens: [{"old":"/api/modules","type":0,"val":"api","end":""},{"old":"/api/modules","type":0,"val":"modules","end":""}],
    types: placeholder as Registry['api.modules']['types'],
  },
  'api.lead_owners': {
    methods: ["GET","HEAD"],
    pattern: '/api/lead-owners',
    tokens: [{"old":"/api/lead-owners","type":0,"val":"api","end":""},{"old":"/api/lead-owners","type":0,"val":"lead-owners","end":""}],
    types: placeholder as Registry['api.lead_owners']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'api.orgs.search': {
    methods: ["GET","HEAD"],
    pattern: '/api/orgs/search',
    tokens: [{"old":"/api/orgs/search","type":0,"val":"api","end":""},{"old":"/api/orgs/search","type":0,"val":"orgs","end":""},{"old":"/api/orgs/search","type":0,"val":"search","end":""}],
    types: placeholder as Registry['api.orgs.search']['types'],
  },
  'organizations.index': {
    methods: ["GET","HEAD"],
    pattern: '/organizations',
    tokens: [{"old":"/organizations","type":0,"val":"organizations","end":""}],
    types: placeholder as Registry['organizations.index']['types'],
  },
  'organizations.create': {
    methods: ["GET","HEAD"],
    pattern: '/organizations/create',
    tokens: [{"old":"/organizations/create","type":0,"val":"organizations","end":""},{"old":"/organizations/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['organizations.create']['types'],
  },
  'organizations.store': {
    methods: ["POST"],
    pattern: '/organizations',
    tokens: [{"old":"/organizations","type":0,"val":"organizations","end":""}],
    types: placeholder as Registry['organizations.store']['types'],
  },
  'organizations.bulk': {
    methods: ["POST"],
    pattern: '/organizations/bulk',
    tokens: [{"old":"/organizations/bulk","type":0,"val":"organizations","end":""},{"old":"/organizations/bulk","type":0,"val":"bulk","end":""}],
    types: placeholder as Registry['organizations.bulk']['types'],
  },
  'organizations.export': {
    methods: ["GET","HEAD"],
    pattern: '/organizations/export',
    tokens: [{"old":"/organizations/export","type":0,"val":"organizations","end":""},{"old":"/organizations/export","type":0,"val":"export","end":""}],
    types: placeholder as Registry['organizations.export']['types'],
  },
  'organizations.checkEmail': {
    methods: ["GET","HEAD"],
    pattern: '/organizations/check-email',
    tokens: [{"old":"/organizations/check-email","type":0,"val":"organizations","end":""},{"old":"/organizations/check-email","type":0,"val":"check-email","end":""}],
    types: placeholder as Registry['organizations.checkEmail']['types'],
  },
  'organizations.checkPhone': {
    methods: ["GET","HEAD"],
    pattern: '/organizations/check-phone',
    tokens: [{"old":"/organizations/check-phone","type":0,"val":"organizations","end":""},{"old":"/organizations/check-phone","type":0,"val":"check-phone","end":""}],
    types: placeholder as Registry['organizations.checkPhone']['types'],
  },
  'organizations.checkAdminPhone': {
    methods: ["GET","HEAD"],
    pattern: '/organizations/check-admin-phone',
    tokens: [{"old":"/organizations/check-admin-phone","type":0,"val":"organizations","end":""},{"old":"/organizations/check-admin-phone","type":0,"val":"check-admin-phone","end":""}],
    types: placeholder as Registry['organizations.checkAdminPhone']['types'],
  },
  'organizations.show': {
    methods: ["GET","HEAD"],
    pattern: '/organizations/:id',
    tokens: [{"old":"/organizations/:id","type":0,"val":"organizations","end":""},{"old":"/organizations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['organizations.show']['types'],
  },
  'organizations.edit': {
    methods: ["GET","HEAD"],
    pattern: '/organizations/:id/edit',
    tokens: [{"old":"/organizations/:id/edit","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/edit","type":1,"val":"id","end":""},{"old":"/organizations/:id/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['organizations.edit']['types'],
  },
  'organizations.update': {
    methods: ["PUT"],
    pattern: '/organizations/:id',
    tokens: [{"old":"/organizations/:id","type":0,"val":"organizations","end":""},{"old":"/organizations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['organizations.update']['types'],
  },
  'organizations.logo.update': {
    methods: ["POST"],
    pattern: '/organizations/:id/logo',
    tokens: [{"old":"/organizations/:id/logo","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/logo","type":1,"val":"id","end":""},{"old":"/organizations/:id/logo","type":0,"val":"logo","end":""}],
    types: placeholder as Registry['organizations.logo.update']['types'],
  },
  'organizations.superAdmin.update': {
    methods: ["PUT"],
    pattern: '/organizations/:id/super-admin',
    tokens: [{"old":"/organizations/:id/super-admin","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/super-admin","type":1,"val":"id","end":""},{"old":"/organizations/:id/super-admin","type":0,"val":"super-admin","end":""}],
    types: placeholder as Registry['organizations.superAdmin.update']['types'],
  },
  'organizations.modules.update': {
    methods: ["PUT"],
    pattern: '/organizations/:id/modules',
    tokens: [{"old":"/organizations/:id/modules","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/modules","type":1,"val":"id","end":""},{"old":"/organizations/:id/modules","type":0,"val":"modules","end":""}],
    types: placeholder as Registry['organizations.modules.update']['types'],
  },
  'organizations.users.store': {
    methods: ["POST"],
    pattern: '/organizations/:id/users',
    tokens: [{"old":"/organizations/:id/users","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/users","type":1,"val":"id","end":""},{"old":"/organizations/:id/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['organizations.users.store']['types'],
  },
  'organizations.users.update': {
    methods: ["PUT"],
    pattern: '/organizations/:id/users/:userId',
    tokens: [{"old":"/organizations/:id/users/:userId","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/users/:userId","type":1,"val":"id","end":""},{"old":"/organizations/:id/users/:userId","type":0,"val":"users","end":""},{"old":"/organizations/:id/users/:userId","type":1,"val":"userId","end":""}],
    types: placeholder as Registry['organizations.users.update']['types'],
  },
  'organizations.users.bulk': {
    methods: ["POST"],
    pattern: '/organizations/:id/users/bulk',
    tokens: [{"old":"/organizations/:id/users/bulk","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/users/bulk","type":1,"val":"id","end":""},{"old":"/organizations/:id/users/bulk","type":0,"val":"users","end":""},{"old":"/organizations/:id/users/bulk","type":0,"val":"bulk","end":""}],
    types: placeholder as Registry['organizations.users.bulk']['types'],
  },
  'organizations.profiles.index': {
    methods: ["GET","HEAD"],
    pattern: '/organizations/:id/profiles',
    tokens: [{"old":"/organizations/:id/profiles","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/profiles","type":1,"val":"id","end":""},{"old":"/organizations/:id/profiles","type":0,"val":"profiles","end":""}],
    types: placeholder as Registry['organizations.profiles.index']['types'],
  },
  'organizations.profiles.store': {
    methods: ["POST"],
    pattern: '/organizations/:id/profiles',
    tokens: [{"old":"/organizations/:id/profiles","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/profiles","type":1,"val":"id","end":""},{"old":"/organizations/:id/profiles","type":0,"val":"profiles","end":""}],
    types: placeholder as Registry['organizations.profiles.store']['types'],
  },
  'organizations.profiles.update': {
    methods: ["PUT"],
    pattern: '/organizations/:id/profiles/:profileId',
    tokens: [{"old":"/organizations/:id/profiles/:profileId","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/profiles/:profileId","type":1,"val":"id","end":""},{"old":"/organizations/:id/profiles/:profileId","type":0,"val":"profiles","end":""},{"old":"/organizations/:id/profiles/:profileId","type":1,"val":"profileId","end":""}],
    types: placeholder as Registry['organizations.profiles.update']['types'],
  },
  'organizations.profiles.destroy': {
    methods: ["DELETE"],
    pattern: '/organizations/:id/profiles/:profileId',
    tokens: [{"old":"/organizations/:id/profiles/:profileId","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/profiles/:profileId","type":1,"val":"id","end":""},{"old":"/organizations/:id/profiles/:profileId","type":0,"val":"profiles","end":""},{"old":"/organizations/:id/profiles/:profileId","type":1,"val":"profileId","end":""}],
    types: placeholder as Registry['organizations.profiles.destroy']['types'],
  },
  'organizations.profiles.permissions.update': {
    methods: ["PUT"],
    pattern: '/organizations/:id/profiles/:profileId/permissions',
    tokens: [{"old":"/organizations/:id/profiles/:profileId/permissions","type":0,"val":"organizations","end":""},{"old":"/organizations/:id/profiles/:profileId/permissions","type":1,"val":"id","end":""},{"old":"/organizations/:id/profiles/:profileId/permissions","type":0,"val":"profiles","end":""},{"old":"/organizations/:id/profiles/:profileId/permissions","type":1,"val":"profileId","end":""},{"old":"/organizations/:id/profiles/:profileId/permissions","type":0,"val":"permissions","end":""}],
    types: placeholder as Registry['organizations.profiles.permissions.update']['types'],
  },
  'organizations.destroy': {
    methods: ["DELETE"],
    pattern: '/organizations/:id',
    tokens: [{"old":"/organizations/:id","type":0,"val":"organizations","end":""},{"old":"/organizations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['organizations.destroy']['types'],
  },
  'leads.index': {
    methods: ["GET","HEAD"],
    pattern: '/leads',
    tokens: [{"old":"/leads","type":0,"val":"leads","end":""}],
    types: placeholder as Registry['leads.index']['types'],
  },
  'leads.store': {
    methods: ["POST"],
    pattern: '/leads',
    tokens: [{"old":"/leads","type":0,"val":"leads","end":""}],
    types: placeholder as Registry['leads.store']['types'],
  },
  'leads.bulk': {
    methods: ["POST"],
    pattern: '/leads/bulk',
    tokens: [{"old":"/leads/bulk","type":0,"val":"leads","end":""},{"old":"/leads/bulk","type":0,"val":"bulk","end":""}],
    types: placeholder as Registry['leads.bulk']['types'],
  },
  'leads.update': {
    methods: ["PUT"],
    pattern: '/leads/:id',
    tokens: [{"old":"/leads/:id","type":0,"val":"leads","end":""},{"old":"/leads/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['leads.update']['types'],
  },
  'leads.destroy': {
    methods: ["DELETE"],
    pattern: '/leads/:id',
    tokens: [{"old":"/leads/:id","type":0,"val":"leads","end":""},{"old":"/leads/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['leads.destroy']['types'],
  },
  'masters.index': {
    methods: ["GET","HEAD"],
    pattern: '/masters',
    tokens: [{"old":"/masters","type":0,"val":"masters","end":""}],
    types: placeholder as Registry['masters.index']['types'],
  },
  'masters.modules.store': {
    methods: ["POST"],
    pattern: '/masters/modules',
    tokens: [{"old":"/masters/modules","type":0,"val":"masters","end":""},{"old":"/masters/modules","type":0,"val":"modules","end":""}],
    types: placeholder as Registry['masters.modules.store']['types'],
  },
  'masters.modules.update': {
    methods: ["PUT"],
    pattern: '/masters/modules/:id',
    tokens: [{"old":"/masters/modules/:id","type":0,"val":"masters","end":""},{"old":"/masters/modules/:id","type":0,"val":"modules","end":""},{"old":"/masters/modules/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['masters.modules.update']['types'],
  },
  'masters.modules.destroy': {
    methods: ["DELETE"],
    pattern: '/masters/modules/:id',
    tokens: [{"old":"/masters/modules/:id","type":0,"val":"masters","end":""},{"old":"/masters/modules/:id","type":0,"val":"modules","end":""},{"old":"/masters/modules/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['masters.modules.destroy']['types'],
  },
  'masters.addons.store': {
    methods: ["POST"],
    pattern: '/masters/addons',
    tokens: [{"old":"/masters/addons","type":0,"val":"masters","end":""},{"old":"/masters/addons","type":0,"val":"addons","end":""}],
    types: placeholder as Registry['masters.addons.store']['types'],
  },
  'masters.addons.update': {
    methods: ["PUT"],
    pattern: '/masters/addons/:id',
    tokens: [{"old":"/masters/addons/:id","type":0,"val":"masters","end":""},{"old":"/masters/addons/:id","type":0,"val":"addons","end":""},{"old":"/masters/addons/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['masters.addons.update']['types'],
  },
  'masters.addons.destroy': {
    methods: ["DELETE"],
    pattern: '/masters/addons/:id',
    tokens: [{"old":"/masters/addons/:id","type":0,"val":"masters","end":""},{"old":"/masters/addons/:id","type":0,"val":"addons","end":""},{"old":"/masters/addons/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['masters.addons.destroy']['types'],
  },
  'settings.index': {
    methods: ["GET","HEAD"],
    pattern: '/settings',
    tokens: [{"old":"/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['settings.index']['types'],
  },
  'settings.profile.update': {
    methods: ["PUT"],
    pattern: '/settings/profile',
    tokens: [{"old":"/settings/profile","type":0,"val":"settings","end":""},{"old":"/settings/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['settings.profile.update']['types'],
  },
  'settings.password.update': {
    methods: ["PUT"],
    pattern: '/settings/password',
    tokens: [{"old":"/settings/password","type":0,"val":"settings","end":""},{"old":"/settings/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['settings.password.update']['types'],
  },
  'settings.totp.disable': {
    methods: ["DELETE"],
    pattern: '/settings/totp',
    tokens: [{"old":"/settings/totp","type":0,"val":"settings","end":""},{"old":"/settings/totp","type":0,"val":"totp","end":""}],
    types: placeholder as Registry['settings.totp.disable']['types'],
  },
  'settings.platform.update': {
    methods: ["PUT"],
    pattern: '/settings/platform',
    tokens: [{"old":"/settings/platform","type":0,"val":"settings","end":""},{"old":"/settings/platform","type":0,"val":"platform","end":""}],
    types: placeholder as Registry['settings.platform.update']['types'],
  },
  'settings.orgDefaults.update': {
    methods: ["PUT"],
    pattern: '/settings/org-defaults',
    tokens: [{"old":"/settings/org-defaults","type":0,"val":"settings","end":""},{"old":"/settings/org-defaults","type":0,"val":"org-defaults","end":""}],
    types: placeholder as Registry['settings.orgDefaults.update']['types'],
  },
  'settings.users.store': {
    methods: ["POST"],
    pattern: '/settings/users',
    tokens: [{"old":"/settings/users","type":0,"val":"settings","end":""},{"old":"/settings/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['settings.users.store']['types'],
  },
  'settings.users.update': {
    methods: ["PUT"],
    pattern: '/settings/users/:id',
    tokens: [{"old":"/settings/users/:id","type":0,"val":"settings","end":""},{"old":"/settings/users/:id","type":0,"val":"users","end":""},{"old":"/settings/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['settings.users.update']['types'],
  },
  'settings.users.toggle': {
    methods: ["PUT"],
    pattern: '/settings/users/:id/toggle',
    tokens: [{"old":"/settings/users/:id/toggle","type":0,"val":"settings","end":""},{"old":"/settings/users/:id/toggle","type":0,"val":"users","end":""},{"old":"/settings/users/:id/toggle","type":1,"val":"id","end":""},{"old":"/settings/users/:id/toggle","type":0,"val":"toggle","end":""}],
    types: placeholder as Registry['settings.users.toggle']['types'],
  },
  'settings.users.resetPassword': {
    methods: ["PUT"],
    pattern: '/settings/users/:id/reset-password',
    tokens: [{"old":"/settings/users/:id/reset-password","type":0,"val":"settings","end":""},{"old":"/settings/users/:id/reset-password","type":0,"val":"users","end":""},{"old":"/settings/users/:id/reset-password","type":1,"val":"id","end":""},{"old":"/settings/users/:id/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['settings.users.resetPassword']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
