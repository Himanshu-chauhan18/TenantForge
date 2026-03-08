/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    login: typeof routes['auth.login'] & {
      store: typeof routes['auth.login.store']
    }
    google: typeof routes['auth.google'] & {
      callback: typeof routes['auth.google.callback']
    }
    totp: {
      verify: typeof routes['auth.totp.verify'] & {
        store: typeof routes['auth.totp.verify.store']
      }
      setup: typeof routes['auth.totp.setup'] & {
        store: typeof routes['auth.totp.setup.store']
      }
    }
    logout: typeof routes['auth.logout']
  }
  api: {
    countries: typeof routes['api.countries']
    cities: typeof routes['api.cities']
    currencies: typeof routes['api.currencies']
    timezones: typeof routes['api.timezones']
    modules: typeof routes['api.modules']
    leadOwners: typeof routes['api.lead_owners']
    orgs: {
      search: typeof routes['api.orgs.search']
    }
  }
  dashboard: typeof routes['dashboard']
  organizations: {
    index: typeof routes['organizations.index']
    create: typeof routes['organizations.create']
    store: typeof routes['organizations.store']
    bulk: typeof routes['organizations.bulk']
    export: typeof routes['organizations.export']
    checkEmail: typeof routes['organizations.checkEmail']
    checkPhone: typeof routes['organizations.checkPhone']
    checkAdminPhone: typeof routes['organizations.checkAdminPhone']
    show: typeof routes['organizations.show']
    edit: typeof routes['organizations.edit']
    update: typeof routes['organizations.update']
    superAdmin: {
      update: typeof routes['organizations.superAdmin.update']
    }
    modules: {
      update: typeof routes['organizations.modules.update']
    }
    users: {
      store: typeof routes['organizations.users.store']
      update: typeof routes['organizations.users.update']
      bulk: typeof routes['organizations.users.bulk']
    }
    profiles: {
      index: typeof routes['organizations.profiles.index']
      store: typeof routes['organizations.profiles.store']
      update: typeof routes['organizations.profiles.update']
      destroy: typeof routes['organizations.profiles.destroy']
      permissions: {
        update: typeof routes['organizations.profiles.permissions.update']
      }
    }
    destroy: typeof routes['organizations.destroy']
  }
  leads: {
    index: typeof routes['leads.index']
    store: typeof routes['leads.store']
    bulk: typeof routes['leads.bulk']
    update: typeof routes['leads.update']
    destroy: typeof routes['leads.destroy']
  }
  masters: {
    index: typeof routes['masters.index']
    modules: {
      store: typeof routes['masters.modules.store']
      update: typeof routes['masters.modules.update']
    }
    addons: {
      store: typeof routes['masters.addons.store']
      update: typeof routes['masters.addons.update']
    }
  }
  settings: {
    index: typeof routes['settings.index']
    profile: {
      update: typeof routes['settings.profile.update']
    }
    password: {
      update: typeof routes['settings.password.update']
    }
    totp: {
      disable: typeof routes['settings.totp.disable']
    }
    platform: {
      update: typeof routes['settings.platform.update']
    }
    orgDefaults: {
      update: typeof routes['settings.orgDefaults.update']
    }
    users: {
      store: typeof routes['settings.users.store']
      update: typeof routes['settings.users.update']
      toggle: typeof routes['settings.users.toggle']
      resetPassword: typeof routes['settings.users.resetPassword']
    }
  }
}
