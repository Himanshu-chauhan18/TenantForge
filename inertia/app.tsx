import './css/app.css'
import { ReactElement } from 'react'
import { client } from './client'
import AppLayout from '~/layouts/app-layout'
import { Data } from '@generated/data'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

const appName = import.meta.env.VITE_APP_NAME || 'TenantForge'

const AUTH_PAGES = ['auth/login', 'auth/totp-setup', 'auth/totp-verify']

createInertiaApp({
  title: (title) => (title ? `${title} – TenantForge` : 'TenantForge'),
  resolve: (name) => {
    return resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob('./pages/**/*.tsx'),
      (page: ReactElement<Data.SharedProps>) => {
        if (AUTH_PAGES.includes(name)) {
          return page
        }
        return <AppLayout>{page}</AppLayout>
      }
    )
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
