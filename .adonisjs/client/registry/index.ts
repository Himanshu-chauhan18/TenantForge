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
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
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
  'organizations.destroy': {
    methods: ["DELETE"],
    pattern: '/organizations/:id',
    tokens: [{"old":"/organizations/:id","type":0,"val":"organizations","end":""},{"old":"/organizations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['organizations.destroy']['types'],
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
