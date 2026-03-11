import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'auth/totp-setup': ExtractProps<(typeof import('../../inertia/pages/auth/totp-setup.tsx'))['default']>
    'auth/totp-verify': ExtractProps<(typeof import('../../inertia/pages/auth/totp-verify.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'hrms/auth/login': ExtractProps<(typeof import('../../inertia/pages/hrms/auth/login.tsx'))['default']>
    'hrms/dashboard/index': ExtractProps<(typeof import('../../inertia/pages/hrms/dashboard/index.tsx'))['default']>
    'hrms/employee/index': ExtractProps<(typeof import('../../inertia/pages/hrms/employee/index.tsx'))['default']>
    'hrms/organization/company': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/company.tsx'))['default']>
    'hrms/organization/hierarchy': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/hierarchy.tsx'))['default']>
    'hrms/organization/roles': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/roles.tsx'))['default']>
    'hrms/organization/settings/alerts': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/alerts.tsx'))['default']>
    'hrms/organization/settings/approvals': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/approvals.tsx'))['default']>
    'hrms/organization/settings/checklists': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/checklists.tsx'))['default']>
    'hrms/organization/settings/departments': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/departments.tsx'))['default']>
    'hrms/organization/settings/designations': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/designations.tsx'))['default']>
    'hrms/organization/settings/divisions': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/divisions.tsx'))['default']>
    'hrms/organization/settings/documents': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/documents.tsx'))['default']>
    'hrms/organization/settings/fiscal-year': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/fiscal-year.tsx'))['default']>
    'hrms/organization/settings/grades': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/grades.tsx'))['default']>
    'hrms/organization/settings/holidays': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/holidays.tsx'))['default']>
    'hrms/organization/settings/locations': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/locations.tsx'))['default']>
    'hrms/organization/settings/notice-period': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/notice-period.tsx'))['default']>
    'hrms/organization/settings/notifications': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/notifications.tsx'))['default']>
    'hrms/organization/settings/sections': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/sections.tsx'))['default']>
    'hrms/organization/settings/sub-departments': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/sub-departments.tsx'))['default']>
    'hrms/organization/settings/sub-sections': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/sub-sections.tsx'))['default']>
    'hrms/organization/settings/templates': ExtractProps<(typeof import('../../inertia/pages/hrms/organization/settings/templates.tsx'))['default']>
    'orgbuilder/dashboard/index': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/dashboard/index.tsx'))['default']>
    'orgbuilder/leads/index': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/leads/index.tsx'))['default']>
    'orgbuilder/masters/index': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/masters/index.tsx'))['default']>
    'orgbuilder/organizations/add/create-org-form': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/add/create-org-form.tsx'))['default']>
    'orgbuilder/organizations/add/create-org-modal': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/add/create-org-modal.tsx'))['default']>
    'orgbuilder/organizations/create': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/create.tsx'))['default']>
    'orgbuilder/organizations/edit': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/edit.tsx'))['default']>
    'orgbuilder/organizations/edit/BillingTab': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/edit/BillingTab.tsx'))['default']>
    'orgbuilder/organizations/edit/data': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/edit/data.tsx'))['default']>
    'orgbuilder/organizations/edit/FiscalTab': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/edit/FiscalTab.tsx'))['default']>
    'orgbuilder/organizations/edit/ModulesTab': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/edit/ModulesTab.tsx'))['default']>
    'orgbuilder/organizations/edit/OverviewTab': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/edit/OverviewTab.tsx'))['default']>
    'orgbuilder/organizations/edit/RolesTab': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/edit/RolesTab.tsx'))['default']>
    'orgbuilder/organizations/edit/types': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/edit/types.ts'))['default']>
    'orgbuilder/organizations/edit/UsersTab': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/edit/UsersTab.tsx'))['default']>
    'orgbuilder/organizations/index': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/organizations/index.tsx'))['default']>
    'orgbuilder/settings/index': ExtractProps<(typeof import('../../inertia/pages/orgbuilder/settings/index.tsx'))['default']>
    'hrms/self-service/index': ExtractProps<(typeof import('../../inertia/pages/hrms/self-service/index.tsx'))['default']>
    'hrms/leave/index': ExtractProps<(typeof import('../../inertia/pages/hrms/leave/index.tsx'))['default']>
    'hrms/payroll/index': ExtractProps<(typeof import('../../inertia/pages/hrms/payroll/index.tsx'))['default']>
  }
}
