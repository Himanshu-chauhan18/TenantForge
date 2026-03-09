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
  }
}
