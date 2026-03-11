/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  hrms: {
    login: typeof routes['hrms.login'] & {
      submit: typeof routes['hrms.login.submit']
    }
    logout: typeof routes['hrms.logout']
    selfService: typeof routes['hrms.self-service']
    dashboard: typeof routes['hrms.dashboard']
    org: {
      company: typeof routes['hrms.org.company'] & {
        update: typeof routes['hrms.org.company.update']
      }
      roles: typeof routes['hrms.org.roles']
      hierarchy: typeof routes['hrms.org.hierarchy'] & {
        store: typeof routes['hrms.org.hierarchy.store']
        update: typeof routes['hrms.org.hierarchy.update']
        destroy: typeof routes['hrms.org.hierarchy.destroy']
      }
    }
    divisions: typeof routes['hrms.divisions'] & {
      store: typeof routes['hrms.divisions.store']
      update: typeof routes['hrms.divisions.update']
      destroy: typeof routes['hrms.divisions.destroy']
    }
    locations: typeof routes['hrms.locations'] & {
      store: typeof routes['hrms.locations.store']
      update: typeof routes['hrms.locations.update']
      destroy: typeof routes['hrms.locations.destroy']
    }
    departments: typeof routes['hrms.departments'] & {
      store: typeof routes['hrms.departments.store']
      update: typeof routes['hrms.departments.update']
      destroy: typeof routes['hrms.departments.destroy']
    }
    subDepartments: typeof routes['hrms.sub-departments'] & {
      store: typeof routes['hrms.sub-departments.store']
      update: typeof routes['hrms.sub-departments.update']
      destroy: typeof routes['hrms.sub-departments.destroy']
    }
    designations: typeof routes['hrms.designations'] & {
      store: typeof routes['hrms.designations.store']
      update: typeof routes['hrms.designations.update']
      destroy: typeof routes['hrms.designations.destroy']
    }
    grades: typeof routes['hrms.grades'] & {
      store: typeof routes['hrms.grades.store']
      update: typeof routes['hrms.grades.update']
      destroy: typeof routes['hrms.grades.destroy']
    }
    sections: typeof routes['hrms.sections'] & {
      store: typeof routes['hrms.sections.store']
      update: typeof routes['hrms.sections.update']
      destroy: typeof routes['hrms.sections.destroy']
    }
    subSections: typeof routes['hrms.sub-sections'] & {
      store: typeof routes['hrms.sub-sections.store']
      update: typeof routes['hrms.sub-sections.update']
      destroy: typeof routes['hrms.sub-sections.destroy']
    }
    holidays: typeof routes['hrms.holidays'] & {
      store: typeof routes['hrms.holidays.store']
      update: typeof routes['hrms.holidays.update']
      destroy: typeof routes['hrms.holidays.destroy']
    }
    noticePeriod: typeof routes['hrms.notice-period'] & {
      store: typeof routes['hrms.notice-period.store']
      update: typeof routes['hrms.notice-period.update']
      destroy: typeof routes['hrms.notice-period.destroy']
    }
    approvals: typeof routes['hrms.approvals'] & {
      store: typeof routes['hrms.approvals.store']
      update: typeof routes['hrms.approvals.update']
      destroy: typeof routes['hrms.approvals.destroy']
    }
    documents: typeof routes['hrms.documents'] & {
      store: typeof routes['hrms.documents.store']
      update: typeof routes['hrms.documents.update']
      destroy: typeof routes['hrms.documents.destroy']
    }
    checklists: typeof routes['hrms.checklists'] & {
      store: typeof routes['hrms.checklists.store']
      update: typeof routes['hrms.checklists.update']
      destroy: typeof routes['hrms.checklists.destroy']
    }
    templates: typeof routes['hrms.templates'] & {
      store: typeof routes['hrms.templates.store']
      update: typeof routes['hrms.templates.update']
      destroy: typeof routes['hrms.templates.destroy']
    }
    alerts: typeof routes['hrms.alerts']
    notifications: typeof routes['hrms.notifications']
    fiscalYear: typeof routes['hrms.fiscal-year']
  }
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
      resetPassword: typeof routes['organizations.superAdmin.resetPassword']
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
