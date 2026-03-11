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
  'api.lead_owners': {
    methods: ["GET","HEAD"]
    pattern: '/api/lead-owners'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lead_owner_controller').default['apiList']>>>
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
  'api.orgs.search': {
    methods: ["GET","HEAD"]
    pattern: '/api/orgs/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['searchOrgs']>>>
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
  'organizations.checkEmail': {
    methods: ["GET","HEAD"]
    pattern: '/organizations/check-email'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['checkOrgEmail']>>>
    }
  }
  'organizations.checkPhone': {
    methods: ["GET","HEAD"]
    pattern: '/organizations/check-phone'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['checkOrgPhone']>>>
    }
  }
  'organizations.checkAdminPhone': {
    methods: ["GET","HEAD"]
    pattern: '/organizations/check-admin-phone'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['checkAdminPhone']>>>
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
  'organizations.logo.update': {
    methods: ["POST"]
    pattern: '/organizations/:id/logo'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['updateLogo']>>>
    }
  }
  'organizations.superAdmin.update': {
    methods: ["PUT"]
    pattern: '/organizations/:id/super-admin'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['updateSuperAdmin']>>>
    }
  }
  'organizations.modules.update': {
    methods: ["PUT"]
    pattern: '/organizations/:id/modules'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization_validator').updateModulesValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/organization_validator').updateModulesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['updateModules']>>>
    }
  }
  'organizations.users.store': {
    methods: ["POST"]
    pattern: '/organizations/:id/users'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['storeUser']>>>
    }
  }
  'organizations.users.update': {
    methods: ["PUT"]
    pattern: '/organizations/:id/users/:userId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; userId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['updateUser']>>>
    }
  }
  'organizations.users.bulk': {
    methods: ["POST"]
    pattern: '/organizations/:id/users/bulk'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['bulkUsers']>>>
    }
  }
  'organizations.profiles.index': {
    methods: ["GET","HEAD"]
    pattern: '/organizations/:id/profiles'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_profile_controller').default['index']>>>
    }
  }
  'organizations.profiles.store': {
    methods: ["POST"]
    pattern: '/organizations/:id/profiles'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_profile_controller').default['store']>>>
    }
  }
  'organizations.profiles.update': {
    methods: ["PUT"]
    pattern: '/organizations/:id/profiles/:profileId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; profileId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_profile_controller').default['update']>>>
    }
  }
  'organizations.profiles.destroy': {
    methods: ["DELETE"]
    pattern: '/organizations/:id/profiles/:profileId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; profileId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_profile_controller').default['destroy']>>>
    }
  }
  'organizations.profiles.permissions.update': {
    methods: ["PUT"]
    pattern: '/organizations/:id/profiles/:profileId/permissions'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; profileId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_profile_controller').default['updatePermissions']>>>
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
  'leads.index': {
    methods: ["GET","HEAD"]
    pattern: '/leads'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lead_owner_controller').default['index']>>>
    }
  }
  'leads.store': {
    methods: ["POST"]
    pattern: '/leads'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/lead_owner_validator').leadOwnerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/lead_owner_validator').leadOwnerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lead_owner_controller').default['store']>>>
    }
  }
  'leads.bulk': {
    methods: ["POST"]
    pattern: '/leads/bulk'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lead_owner_controller').default['bulk']>>>
    }
  }
  'leads.update': {
    methods: ["PUT"]
    pattern: '/leads/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/lead_owner_validator').leadOwnerValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/lead_owner_validator').leadOwnerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lead_owner_controller').default['update']>>>
    }
  }
  'leads.destroy': {
    methods: ["DELETE"]
    pattern: '/leads/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lead_owner_controller').default['destroy']>>>
    }
  }
  'masters.index': {
    methods: ["GET","HEAD"]
    pattern: '/masters'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/masters_controller').default['index']>>>
    }
  }
  'masters.modules.store': {
    methods: ["POST"]
    pattern: '/masters/modules'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/masters_controller').default['storeModule']>>>
    }
  }
  'masters.modules.update': {
    methods: ["PUT"]
    pattern: '/masters/modules/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/masters_controller').default['updateModule']>>>
    }
  }
  'masters.modules.destroy': {
    methods: ["DELETE"]
    pattern: '/masters/modules/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/masters_controller').default['destroyModule']>>>
    }
  }
  'masters.addons.store': {
    methods: ["POST"]
    pattern: '/masters/addons'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/masters_controller').default['storeAddon']>>>
    }
  }
  'masters.addons.update': {
    methods: ["PUT"]
    pattern: '/masters/addons/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/masters_controller').default['updateAddon']>>>
    }
  }
  'masters.addons.destroy': {
    methods: ["DELETE"]
    pattern: '/masters/addons/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/masters_controller').default['destroyAddon']>>>
    }
  }
  'settings.index': {
    methods: ["GET","HEAD"]
    pattern: '/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['index']>>>
    }
  }
  'settings.profile.update': {
    methods: ["PUT"]
    pattern: '/settings/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateProfile']>>>
    }
  }
  'settings.password.update': {
    methods: ["PUT"]
    pattern: '/settings/password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['changePassword']>>>
    }
  }
  'settings.totp.disable': {
    methods: ["DELETE"]
    pattern: '/settings/totp'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['disableTotp']>>>
    }
  }
  'settings.platform.update': {
    methods: ["PUT"]
    pattern: '/settings/platform'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updatePlatform']>>>
    }
  }
  'settings.orgDefaults.update': {
    methods: ["PUT"]
    pattern: '/settings/org-defaults'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateOrgDefaults']>>>
    }
  }
  'settings.users.store': {
    methods: ["POST"]
    pattern: '/settings/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['storeUser']>>>
    }
  }
  'settings.users.update': {
    methods: ["PUT"]
    pattern: '/settings/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateUser']>>>
    }
  }
  'settings.users.toggle': {
    methods: ["PUT"]
    pattern: '/settings/users/:id/toggle'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['toggleUser']>>>
    }
  }
  'settings.users.resetPassword': {
    methods: ["PUT"]
    pattern: '/settings/users/:id/reset-password'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['resetUserPassword']>>>
    }
  }
}
