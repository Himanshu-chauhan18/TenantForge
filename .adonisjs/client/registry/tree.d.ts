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
  }
  dashboard: typeof routes['dashboard']
  organizations: {
    index: typeof routes['organizations.index']
    create: typeof routes['organizations.create']
    store: typeof routes['organizations.store']
    bulk: typeof routes['organizations.bulk']
    export: typeof routes['organizations.export']
    show: typeof routes['organizations.show']
    edit: typeof routes['organizations.edit']
    update: typeof routes['organizations.update']
    destroy: typeof routes['organizations.destroy']
  }
}
