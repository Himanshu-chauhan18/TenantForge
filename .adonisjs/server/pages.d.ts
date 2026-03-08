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
    'dashboard/index': ExtractProps<(typeof import('../../inertia/pages/dashboard/index.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'leads/index': ExtractProps<(typeof import('../../inertia/pages/leads/index.tsx'))['default']>
    'organizations/create': ExtractProps<(typeof import('../../inertia/pages/organizations/create.tsx'))['default']>
    'organizations/edit': ExtractProps<(typeof import('../../inertia/pages/organizations/edit.tsx'))['default']>
    'organizations/edit/BillingTab': ExtractProps<(typeof import('../../inertia/pages/organizations/edit/BillingTab.tsx'))['default']>
    'organizations/edit/data': ExtractProps<(typeof import('../../inertia/pages/organizations/edit/data.tsx'))['default']>
    'organizations/edit/FiscalTab': ExtractProps<(typeof import('../../inertia/pages/organizations/edit/FiscalTab.tsx'))['default']>
    'organizations/edit/ModulesTab': ExtractProps<(typeof import('../../inertia/pages/organizations/edit/ModulesTab.tsx'))['default']>
    'organizations/edit/OverviewTab': ExtractProps<(typeof import('../../inertia/pages/organizations/edit/OverviewTab.tsx'))['default']>
    'organizations/edit/types': ExtractProps<(typeof import('../../inertia/pages/organizations/edit/types.ts'))['default']>
    'organizations/edit/UsersTab': ExtractProps<(typeof import('../../inertia/pages/organizations/edit/UsersTab.tsx'))['default']>
    'organizations/index': ExtractProps<(typeof import('../../inertia/pages/organizations/index.tsx'))['default']>
  }
}
