import { useState, useEffect, useRef } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { toast, Toaster } from 'sonner'
import {
  LayoutDashboard,
  Building2,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  X,
  Menu,
  ChevronRight,
  UserCheck,
} from 'lucide-react'

interface SharedProps {
  user?: {
    id: number
    fullName: string | null
    email: string
    initials: string
  }
  flash?: { success?: string; error?: string; toasts?: string[] }
}

interface NavItem {
  label: string
  icon: React.ReactNode
  href?: string
  routeName?: string
  children?: { label: string; href: string; routeName?: string }[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={16} />,
    href: '/dashboard',
    routeName: 'dashboard',
  },
  {
    label: 'Organizations',
    icon: <Building2 size={16} />,
    href: '/organizations',
    routeName: 'organizations.index',
  },
  {
    label: 'Leads & Owners',
    icon: <UserCheck size={16} />,
    href: '/leads',
    routeName: 'leads.index',
  },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { url, props } = usePage<{ props: SharedProps } & any>()
  const shared = props as SharedProps
  const user = shared?.user
  const flash = shared?.flash

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tf-theme') as 'light' | 'dark') || 'light'
    }
    return 'light'
  })

  const [openNav, setOpenNav] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobSidebar, setMobSidebar] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tf-theme', theme)
  }, [theme])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [searchOpen])

  // Drive toasts from usePage() flash so they fire reliably on every navigation,
  // including same-page redirects (e.g. form POST → back() → same URL).
  useEffect(() => {
    if (flash?.success) toast.success(flash.success)
    if (flash?.error)   toast.error(flash.error)
    flash?.toasts?.forEach((msg: string) => toast.error(msg))
  }, [flash])

  const isActive = (item: NavItem) => {
    if (item.href && url.startsWith(item.href)) return true
    return false
  }

  const breadcrumbs = (() => {
    const parts = url.split('/').filter(Boolean)
    const crumbs = [{ label: 'Home', href: '/dashboard' }]
    if (parts[0] === 'dashboard') crumbs.push({ label: 'Dashboard', href: '/dashboard' })
    if (parts[0] === 'organizations') {
      crumbs.push({ label: 'Organizations', href: '/organizations' })
      if (parts[1] === 'create') crumbs.push({ label: 'Add Organization', href: '/organizations/create' })
      else if (parts[1]) crumbs.push({ label: 'Detail', href: url })
    }
    if (parts[0] === 'leads') crumbs.push({ label: 'Leads & Owners', href: '/leads' })
    return crumbs
  })()

  const logout = () => {
    router.post('/logout')
  }

  return (
    <>
      <div className="shell">
        {/* Sidebar */}
        <aside className={`sidebar${mobSidebar ? ' mob-open' : ''}`}>
          {/* Brand */}
          <div className="brand">
            <div className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="brand-name">TenantForge</div>
              <div className="brand-tag">Organization Builder</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="sb-scroll">
            <div className="sb-label">Main Menu</div>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item)
              const expanded = openNav === item.label

              if (item.children) {
                return (
                  <div key={item.label}>
                    <div
                      className={`sb-item${active ? ' active' : ''}`}
                      onClick={() => setOpenNav(expanded ? null : item.label)}
                    >
                      <span className="sb-icon">{item.icon}</span>
                      {item.label}
                      <ChevronDown
                        size={12}
                        className={`chevron${expanded ? ' open' : ''}`}
                      />
                    </div>
                    <div className={`sb-sub${expanded || active ? ' open' : ''}`}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`sb-sub-item${url === child.href ? ' active' : ''}`}
                        >
                          <span className="sb-sub-dot" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={`sb-item${active ? ' active' : ''}`}
                >
                  <span className="sb-icon">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* User pill */}
          {user && (
            <div className="sb-footer">
              <div className="user-pill">
                <div className="av">{user.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="u-name truncate">{user.fullName || user.email}</div>
                  <div className="u-role">Administrator</div>
                </div>
                <button onClick={logout} className="ibtn" title="Logout">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main area */}
        <div className="main">
          {/* Navbar */}
          <header className="navbar">
            <button className="ibtn" style={{ display: 'none' }} onClick={() => setMobSidebar(!mobSidebar)}>
              <Menu size={16} />
            </button>

            {/* Breadcrumb */}
            <nav className="bc">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {i > 0 && <ChevronRight size={12} className="bc-sep" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="bc-item cur">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="bc-item">{crumb.label}</Link>
                  )}
                </span>
              ))}
            </nav>

            <div className="nav-right">
              {/* Search */}
              <button className="ibtn" onClick={() => setSearchOpen(true)} title="Search (Ctrl+K)">
                <Search size={16} />
              </button>

              {/* Notifications */}
              <button className={`ibtn nd`} onClick={() => setDrawerOpen(true)} title="Notifications">
                <Bell size={16} />
              </button>

              {/* Theme toggle */}
              <button
                className="theme-btn"
                onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                title="Toggle theme"
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>

              {/* User avatar */}
              {user && (
                <div className="av" style={{ cursor: 'pointer' }} title={user.email}>
                  {user.initials}
                </div>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="content">
            {children}
          </main>
        </div>
      </div>

      {/* Search Modal */}
      <div className={`ov${searchOpen ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}>
        <div className="modal" style={{ maxWidth: 580 }}>
          <div className="search-inp-wrap">
            <Search size={18} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input
              ref={searchRef}
              placeholder="Search organizations, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span style={{ fontSize: '.68rem', color: 'var(--text4)', background: 'var(--bg2)', padding: '2px 8px', borderRadius: 6, flexShrink: 0 }}>ESC</span>
          </div>
          <div className="mb" style={{ minHeight: 200 }}>
            {!searchQuery && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text4)', fontSize: '.8rem' }}>
                Search by organization name, ID, or lead owner...
              </div>
            )}
            {searchQuery && (
              <div className="search-res-group">
                <div className="search-res-lbl">Quick Actions</div>
                <Link href="/organizations/create" className="search-item" onClick={() => setSearchOpen(false)}>
                  <div className="av" style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--p-lt)', color: 'var(--p)' }}>
                    <Building2 size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)' }}>Add Organization</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)' }}>Create a new organization</div>
                  </div>
                </Link>
                <Link href={`/organizations?search=${searchQuery}`} className="search-item" onClick={() => setSearchOpen(false)}>
                  <div className="av" style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg2)', color: 'var(--text3)' }}>
                    <Search size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)' }}>Search for "{searchQuery}"</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)' }}>Browse all results</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        gap={8}
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontSize: '.82rem',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,.16)',
            padding: '12px 16px',
          },
        }}
      />

      {/* Notifications Drawer */}
      <div className={`dov${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="dh">
          <span style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '.92rem' }}>Notifications</span>
          <button className="xbtn" onClick={() => setDrawerOpen(false)}><X size={16} /></button>
        </div>
        <div className="db">
          <div className="ni unread">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--p-lt)', color: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={14} />
              </div>
              <div>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text1)', lineHeight: 1.4 }}>
                  Welcome to TenantForge!
                </div>
                <div style={{ fontSize: '.68rem', color: 'var(--text3)', marginTop: 3 }}>Get started by adding your first organization.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
