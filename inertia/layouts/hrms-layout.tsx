import { useState, useEffect } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { toast, Toaster } from 'sonner'
import {
  LayoutDashboard, Users, Building2, Clock, ChevronDown, ChevronRight,
  Menu, X, Moon, Sun, Bell, LogOut, Zap, Settings, GitBranch, Shield,
} from 'lucide-react'

interface HrmsUser {
  id: number
  fullName: string
  email: string
  employeeCode: string | null
  profileId: number | null
  profileName: string
  initials: string
  org: { id: number; orgId: string; name: string; logo: string | null }
}

interface SharedProps {
  hrmsUser?: HrmsUser
  flash?: { success?: string; error?: string; errors?: Record<string, string>; toasts?: string[] }
}

interface SidebarItem {
  label: string
  icon: React.ReactNode
  href?: string
  children?: { label: string; href: string }[]
}

/* ── module definitions ───────────────────────────────────────────────────── */
type ModuleKey = 'organization' | 'employee' | 'attendance'

const MODULE_META: Record<ModuleKey, { label: string; icon: React.ReactNode; color: string; defaultPath: string }> = {
  organization: { label: 'Organization', icon: <Building2 size={14} />, color: '#0D9488', defaultPath: '/hrms/organization/company' },
  employee:     { label: 'Employee',     icon: <Users    size={14} />, color: '#7C3AED', defaultPath: '/hrms/employee' },
  attendance:   { label: 'Attendance',   icon: <Clock    size={14} />, color: '#D97706', defaultPath: '/hrms/attendance' },
}

const ORG_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  {
    group: 'MAIN MENU',
    items: [
      { label: 'Company',             icon: <Building2 size={15} />, href: '/hrms/organization/company' },
      { label: 'Roles & Permissions', icon: <Shield    size={15} />, href: '/hrms/organization/roles' },
    ],
  },
  {
    group: 'CONFIGURATION',
    items: [
      { label: 'Manage Hierarchy', icon: <GitBranch size={15} />, href: '/hrms/organization/hierarchy' },
      {
        label: 'Settings',
        icon: <Settings size={15} />,
        children: [
          { label: 'Company Documents', href: '/hrms/organization/settings/documents' },
          { label: 'Divisions',         href: '/hrms/organization/settings/divisions' },
          { label: 'Departments',       href: '/hrms/organization/settings/departments' },
          { label: 'Designations',      href: '/hrms/organization/settings/designations' },
          { label: 'Locations',         href: '/hrms/organization/settings/locations' },
          { label: 'Grades',            href: '/hrms/organization/settings/grades' },
          { label: 'Fiscal Year',       href: '/hrms/organization/settings/fiscal-year' },
          { label: 'Holidays',          href: '/hrms/organization/settings/holidays' },
          { label: 'Alerts',            href: '/hrms/organization/settings/alerts' },
          { label: 'Notifications',     href: '/hrms/organization/settings/notifications' },
          { label: 'Approvals',         href: '/hrms/organization/settings/approvals' },
          { label: 'Notice Period',     href: '/hrms/organization/settings/notice-period' },
          { label: 'Sub Departments',   href: '/hrms/organization/settings/sub-departments' },
          { label: 'Sections',          href: '/hrms/organization/settings/sections' },
          { label: 'Sub Sections',      href: '/hrms/organization/settings/sub-sections' },
          { label: 'Checklists',        href: '/hrms/organization/settings/checklists' },
          { label: 'Templates',         href: '/hrms/organization/settings/templates' },
        ],
      },
    ],
  },
]

const EMPLOYEE_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  {
    group: 'MAIN MENU',
    items: [
      { label: 'Employee Directory', icon: <Users size={15} />, href: '/hrms/employee' },
    ],
  },
]

const ATTENDANCE_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  {
    group: 'MAIN MENU',
    items: [
      { label: 'Attendance', icon: <Clock size={15} />, href: '/hrms/attendance' },
    ],
  },
]

function getSidebarForModule(mod: ModuleKey) {
  if (mod === 'organization') return ORG_SIDEBAR
  if (mod === 'employee')     return EMPLOYEE_SIDEBAR
  return ATTENDANCE_SIDEBAR
}

function getModuleFromPath(url: string): ModuleKey {
  if (url.startsWith('/hrms/employee'))   return 'employee'
  if (url.startsWith('/hrms/attendance')) return 'attendance'
  return 'organization'
}

/* ── breadcrumb builder ───────────────────────────────────────────────────── */
function buildBreadcrumbs(url: string) {
  const crumbs: { label: string; href: string }[] = [{ label: 'Home', href: '/hrms/dashboard' }]
  const parts = url.split('/').filter(Boolean)
  if (parts[1] === 'dashboard') {
    crumbs.push({ label: 'Dashboard', href: '/hrms/dashboard' })
  } else if (parts[1] === 'organization') {
    crumbs.push({ label: 'Organization', href: '/hrms/organization/company' })
    if      (parts[2] === 'company')    crumbs.push({ label: 'Company', href: url })
    else if (parts[2] === 'roles')      crumbs.push({ label: 'Roles & Permissions', href: url })
    else if (parts[2] === 'hierarchy')  crumbs.push({ label: 'Manage Hierarchy', href: url })
    else if (parts[2] === 'settings' && parts[3]) {
      crumbs.push({ label: 'Settings', href: '/hrms/organization/settings/divisions' })
      crumbs.push({ label: parts[3].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), href: url })
    }
  } else if (parts[1] === 'employee') {
    crumbs.push({ label: 'Employee', href: '/hrms/employee' })
  } else if (parts[1] === 'attendance') {
    crumbs.push({ label: 'Attendance', href: '/hrms/attendance' })
  }
  return crumbs
}

/* ── layout component ─────────────────────────────────────────────────────── */
export default function HrmsLayout({ children }: { children: React.ReactNode }) {
  const { url, props } = usePage<any>()
  const shared   = props as SharedProps
  const hrmsUser = shared?.hrmsUser
  const flash    = shared?.flash

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tf-theme') as 'light' | 'dark') || 'light'
    }
    return 'light'
  })

  const [activeModule, setActiveModule] = useState<ModuleKey>(() => getModuleFromPath(url))
  const [openGroup,    setOpenGroup]    = useState<string | null>('Settings')
  const [mobSidebar,   setMobSidebar]   = useState(false)
  const [drawerOpen,   setDrawerOpen]   = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tf-theme', theme)
  }, [theme])

  useEffect(() => { setActiveModule(getModuleFromPath(url)) }, [url])

  useEffect(() => {
    if (flash?.success) toast.success(flash.success)
    if (flash?.error)   toast.error(flash.error)
    flash?.toasts?.forEach((m) => toast.error(m))
  }, [flash])

  const sidebarGroups = getSidebarForModule(activeModule)
  const breadcrumbs   = buildBreadcrumbs(url)
  const currentPage   = breadcrumbs[breadcrumbs.length - 1]?.label ?? ''

  const isActive      = (href: string) => url === href || url.startsWith(href + '/')
  const isChildActive = (ch: { href: string }[]) => ch.some((c) => isActive(c.href))

  function switchModule(mod: ModuleKey) {
    setActiveModule(mod)
    setMobSidebar(false)
    router.visit(MODULE_META[mod].defaultPath)
  }

  const logout = () => router.post('/hrms/logout')

  return (
    <>
      <style>{`
        /* ── module tabs in navbar ── */
        .mod-tabs {
          display: flex; align-items: center; gap: 2px;
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 10px; padding: 3px;
        }
        .mod-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 6px 16px; border-radius: 7px; border: none;
          cursor: pointer; font-size: .79rem; font-weight: 600;
          color: var(--text2); background: transparent;
          font-family: inherit; white-space: nowrap;
          transition: background .15s, color .15s, box-shadow .15s;
        }
        .mod-tab:hover { color: var(--text1); background: var(--surface); }
        .mod-tab.mt-active {
          background: var(--surface); font-weight: 700;
          box-shadow: 0 1px 5px rgba(0,0,0,.1);
        }
        .mod-tab .mt-ic { display: flex; opacity: .65; transition: opacity .15s; }
        .mod-tab.mt-active .mt-ic, .mod-tab:hover .mt-ic { opacity: 1; }

        /* ── breadcrumb bar ── */
        .bc-bar {
          height: 38px; display: flex; align-items: center; gap: 5px;
          padding: 0 22px; flex-shrink: 0;
          background: var(--bg2); border-bottom: 1px solid var(--border);
          position: relative;
        }
        .bc-bar::before {
          content: ''; position: absolute; left: 0; top: 6px; bottom: 6px;
          width: 3px; border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, var(--p), var(--s));
        }
        .bc-a { font-size: .73rem; color: var(--text3); font-weight: 500; transition: color .15s; }
        .bc-a:hover { color: var(--p); }
        .bc-cur { font-size: .73rem; color: var(--text1); font-weight: 700; }
        .bc-divider { color: var(--border2); flex-shrink: 0; }
        .bc-badge {
          margin-left: auto; font-size: .65rem; font-weight: 700;
          color: var(--p); letter-spacing: .04em; text-transform: uppercase;
          padding: 2px 9px; border-radius: 20px;
          background: var(--p-lt); border: 1px solid var(--p-mid);
        }

        /* ── sidebar brand ── */
        .sb-brand {
          padding: 11px 14px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        }
        .sb-brand-logo {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--p), var(--s));
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: .72rem; color: #fff; font-family: var(--fd);
        }

        /* ── responsive ── */
        @media (max-width: 1024px) {
          .mod-tab .mod-lbl { display: none; }
          .mod-tab { padding: 6px 10px; }
        }
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .sidebar.mob-open { display: flex; position: fixed; inset-y: 0; left: 0; z-index: 500; }
          .bc-badge { display: none; }
        }
      `}</style>

      <div className="shell">

        {/* ═══════════════════════════════════════════════════════
            SIDEBAR — org brand + module nav (no module switcher)
        ════════════════════════════════════════════════════════ */}
        <aside className={`sidebar${mobSidebar ? ' mob-open' : ''}`} style={{ width: 232 }}>

          {/* org brand */}
          <div className="sb-brand">
            <div className="sb-brand-logo">
              {hrmsUser?.org?.name ? hrmsUser.org.name.slice(0, 2).toUpperCase() : 'HR'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '.84rem', color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {hrmsUser?.org?.name ?? 'HRMS'}
              </div>
              <div style={{ fontSize: '.6rem', color: 'var(--text4)', fontWeight: 600 }}>
                {hrmsUser?.org?.orgId ?? '—'}
              </div>
            </div>
            <button className="ibtn" onClick={() => setMobSidebar(false)} style={{ flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>

          {/* nav links */}
          <div className="sb-scroll">

            {/* dashboard — always */}
            <Link
              href="/hrms/dashboard"
              className={`sb-item${url === '/hrms/dashboard' || url === '/hrms' ? ' active' : ''}`}
              onClick={() => setMobSidebar(false)}
            >
              <span className="sb-icon"><LayoutDashboard size={15} /></span>
              Dashboard
            </Link>

            {sidebarGroups.map((group) => (
              <div key={group.group ?? 'g'}>
                {group.group && <div className="sb-label">{group.group}</div>}
                {group.items.map((item) => {
                  if (item.children) {
                    const childActive = isChildActive(item.children)
                    const expanded    = openGroup === item.label || childActive
                    return (
                      <div key={item.label}>
                        <div
                          className={`sb-item${childActive ? ' active' : ''}`}
                          onClick={() => setOpenGroup(expanded ? null : item.label)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="sb-icon">{item.icon}</span>
                          {item.label}
                          <ChevronDown size={11} className={`chevron${expanded ? ' open' : ''}`} />
                        </div>
                        <div className={`sb-sub${expanded ? ' open' : ''}`} style={{ maxHeight: expanded ? 700 : 0 }}>
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`sb-sub-item${isActive(child.href) ? ' active' : ''}`}
                              onClick={() => setMobSidebar(false)}
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
                      key={item.href}
                      href={item.href!}
                      className={`sb-item${isActive(item.href!) ? ' active' : ''}`}
                      onClick={() => setMobSidebar(false)}
                    >
                      <span className="sb-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>

          {/* user footer */}
          {hrmsUser && (
            <div className="sb-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,var(--p),var(--s))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.7rem', flexShrink: 0, fontFamily: 'var(--fd)' }}>
                  {hrmsUser.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.77rem', fontWeight: 700, color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {hrmsUser.fullName}
                  </div>
                  <div style={{ fontSize: '.61rem', color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                    {hrmsUser.profileName}
                  </div>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '2px 4px' }} />
              <button
                onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, fontSize: '.77rem', fontWeight: 600, color: 'var(--text3)', fontFamily: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,.08)'; e.currentTarget.style.color = '#EF4444' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent';          e.currentTarget.style.color = 'var(--text3)' }}
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </aside>

        {/* mobile overlay */}
        {mobSidebar && (
          <div
            onClick={() => setMobSidebar(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 490, backdropFilter: 'blur(2px)' }}
          />
        )}

        {/* ═══════════════════════════════════════════════════════
            MAIN AREA
        ════════════════════════════════════════════════════════ */}
        <div className="main">

          {/* ── Navbar with module tabs ── */}
          <header className="navbar" style={{ gap: 10 }}>

            {/* hamburger */}
            <button className="ibtn" onClick={() => setMobSidebar(!mobSidebar)}>
              <Menu size={16} />
            </button>

            {/* module tabs — centered */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <nav className="mod-tabs">
                {(Object.entries(MODULE_META) as [ModuleKey, (typeof MODULE_META)[ModuleKey]][]).map(([mod, meta]) => (
                  <button
                    key={mod}
                    className={`mod-tab${activeModule === mod ? ' mt-active' : ''}`}
                    onClick={() => switchModule(mod)}
                  >
                    <span className="mt-ic" style={{ color: activeModule === mod ? meta.color : undefined }}>
                      {meta.icon}
                    </span>
                    <span className="mod-lbl" style={{ color: activeModule === mod ? meta.color : undefined }}>
                      {meta.label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* right actions */}
            <div className="nav-right">
              <button className="ibtn" onClick={() => setDrawerOpen(true)} title="Notifications">
                <Bell size={16} />
              </button>
              <button
                className="theme-btn"
                onClick={() => setTheme((t) => t === 'light' ? 'dark' : 'light')}
                title="Toggle theme"
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>
              {hrmsUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,var(--p),var(--s))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 800, fontFamily: 'var(--fd)' }}>
                    {hrmsUser.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: '.73rem', fontWeight: 700, color: 'var(--text1)', lineHeight: 1.2 }}>{hrmsUser.fullName}</div>
                    <div style={{ fontSize: '.6rem', color: 'var(--text4)' }}>{hrmsUser.org.orgId}</div>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* ── Breadcrumb bar (below navbar, above content) ── */}
          <div className="bc-bar">
            <Link href="/hrms/dashboard" className="bc-a" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <LayoutDashboard size={12} /> Home
            </Link>
            {breadcrumbs.slice(1).map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 2
              return (
                <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ChevronRight size={11} className="bc-divider" />
                  {isLast
                    ? <span className="bc-cur">{crumb.label}</span>
                    : <Link href={crumb.href} className="bc-a">{crumb.label}</Link>
                  }
                </span>
              )
            })}
            {currentPage && <span className="bc-badge">{currentPage}</span>}
          </div>

          {/* ── Page content ── */}
          <main className="content">{children}</main>
        </div>
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        gap={8}
        toastOptions={{ style: { borderRadius: '12px', fontSize: '.82rem', fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,.16)', padding: '12px 16px' } }}
      />

      {/* ── Notifications Drawer ── */}
      <div className={`dov${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="dh">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={15} style={{ color: 'var(--text2)' }} />
            <span style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '.92rem' }}>Notifications</span>
          </div>
          <button className="xbtn" onClick={() => setDrawerOpen(false)}><X size={16} /></button>
        </div>
        <div className="db">
          <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,rgba(13,148,136,.15),rgba(13,148,136,.05))', border: '1px solid rgba(13,148,136,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={26} style={{ color: 'var(--p)' }} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text1)', marginBottom: 6 }}>Coming Soon</div>
              <div style={{ fontSize: '.76rem', color: 'var(--text3)', lineHeight: 1.6 }}>HR notifications, alerts, and approvals are coming in the next release.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
