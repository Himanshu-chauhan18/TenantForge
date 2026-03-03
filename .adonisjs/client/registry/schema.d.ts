/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['showLogin']>>>
    }
  }
  'auth.login.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth_validator').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth_validator').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
    }
  }
  'auth.google': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['googleRedirect']>>>
    }
  }
  'auth.google.callback': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['googleCallback']>>>
    }
  }
  'auth.totp.verify': {
    methods: ["GET","HEAD"]
    pattern: '/auth/totp/verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['showTotpVerify']>>>
    }
  }
  'auth.totp.verify.store': {
    methods: ["POST"]
    pattern: '/auth/totp/verify'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth_validator').totpVerifyValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth_validator').totpVerifyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['totpVerify']>>>
    }
  }
  'auth.totp.setup': {
    methods: ["GET","HEAD"]
    pattern: '/auth/totp/setup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['totpSetup']>>>
    }
  }
  'auth.totp.setup.store': {
    methods: ["POST"]
    pattern: '/auth/totp/setup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth_validator').totpEnableValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth_validator').totpEnableValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['totpEnable']>>>
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'api.countries': {
    methods: ["GET","HEAD"]
    pattern: '/api/countries'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/location_controller').default['countries']>>>
    }
  }
  'api.cities': {
    methods: ["GET","HEAD"]
    pattern: '/api/cities'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/location_controller').default['cities']>>>
    }
  }
  'api.currencies': {
    methods: ["GET","HEAD"]
    pattern: '/api/currencies'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/location_controller').default['currencies']>>>
    }
  }
  'api.timezones': {
    methods: ["GET","HEAD"]
    pattern: '/api/timezones'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/location_controller').default['timezones']>>>
    }
  }
  'api.modules': {
    methods: ["GET","HEAD"]
    pattern: '/api/modules'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/location_controller').default['modules']>>>
    }
  }
  'dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
    }
  }
  'organizations.index': {
    methods: ["GET","HEAD"]
    pattern: '/organizations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['index']>>>
    }
  }
  'organizations.create': {
    methods: ["GET","HEAD"]
    pattern: '/organizations/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['create']>>>
    }
  }
  'organizations.store': {
    methods: ["POST"]
    pattern: '/organizations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization_validator').organizationStep1Validator)>|InferInput<(typeof import('#validators/organization_validator').organizationModulesValidator)>|InferInput<(typeof import('#validators/organization_validator').organizationSuperAdminValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/organization_validator').organizationStep1Validator)>|InferInput<(typeof import('#validators/organization_validator').organizationModulesValidator)>|InferInput<(typeof import('#validators/organization_validator').organizationSuperAdminValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['store']>>>
    }
  }
  'organizations.bulk': {
    methods: ["POST"]
    pattern: '/organizations/bulk'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization_validator').bulkOperationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/organization_validator').bulkOperationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['bulk']>>>
    }
  }
  'organizations.export': {
    methods: ["GET","HEAD"]
    pattern: '/organizations/export'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['exportCsv']>>>
    }
  }
  'organizations.show': {
    methods: ["GET","HEAD"]
    pattern: '/organizations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['show']>>>
    }
  }
  'organizations.edit': {
    methods: ["GET","HEAD"]
    pattern: '/organizations/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['edit']>>>
    }
  }
  'organizations.update': {
    methods: ["PUT"]
    pattern: '/organizations/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization_validator').organizationStep1Validator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/organization_validator').organizationStep1Validator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['update']>>>
    }
  }
  'organizations.destroy': {
    methods: ["DELETE"]
    pattern: '/organizations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['destroy']>>>
    }
  }
}
