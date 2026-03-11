import './css/app.css'
import { ReactElement } from 'react'
import { client } from './client'
import AppLayout from '~/layouts/app-layout'
import HrmsLayout from '~/layouts/hrms-layout'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@adonisjs/inertia/react'

// Pages that render without any layout
const AUTH_PAGES = ['auth/login', 'auth/signup', 'auth/totp-setup', 'auth/totp-verify']

// HRMS pages that render without layout (their own full-page auth)
const HRMS_AUTH_PAGES = ['hrms/auth/login']

// Eagerly load all pages — gives us direct module access to set layouts
const pages = import.meta.glob('./pages/**/*.tsx', { eager: true })

createInertiaApp({
  title: (title) => (title ? `${title} – TenantForge` : 'TenantForge'),
  resolve: (name) => {
    const page: any = pages[`./pages/${name}.tsx`]

    if (!page) {
      throw new Error(`Inertia page not found: ${name}`)
    }

    // No layout for auth pages (full-page standalone)
    if (HRMS_AUTH_PAGES.includes(name) || AUTH_PAGES.includes(name)) {
      page.default.layout = undefined
      return page
    }

    // HRMS pages → HRMS layout
    if (name.startsWith('hrms/')) {
      page.default.layout = (children: ReactElement) => <HrmsLayout>{children}</HrmsLayout>
    } else {
      // OrgBuilder and everything else → AppLayout
      page.default.layout = (children: ReactElement) => <AppLayout>{children}</AppLayout>
    }

    return page
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <App {...props} />
      </TuyauProvider>
    )
  },
  progress: {
    color: '#0D9488',
  },
})
