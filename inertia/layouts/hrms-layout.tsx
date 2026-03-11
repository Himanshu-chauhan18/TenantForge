import { useState, useEffect, useCallback } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { toast, Toaster } from 'sonner'
import {
  LayoutDashboard, Users, Building2, CalendarCheck, Clock, DollarSign, TrendingUp,
  ChevronDown, ChevronRight, Menu, X, Moon, Sun, Bell, LogOut, User, Zap,
  Settings, Layers, GitBranch, MapPin, Briefcase, Award, BookOpen,
  ClipboardList, FileText, AlertCircle, Mail, Shield, Timer,
  FolderTree, Slice, Layers2,
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

// ── Module definitions ─────────────────────────────────────────────────────────
type ModuleKey = 'organization' | 'employee' | 'attendance'

const MODULE_META: Record<ModuleKey, { label: string; icon: React.ReactNode; color: string }> = {
  organization: { label: 'Organization', icon: <Building2 size={15} />, color: '#0D9488' },
  employee:     { label: 'Employee',     icon: <Users size={15} />,     color: '#7C3AED' },
  attendance:   { label: 'Attendance',   icon: <Clock size={15} />,     color: '#D97706' },
}

const ORG_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  {
    group: 'MAIN MENU',
    items: [
      { label: 'Company',           icon: <Building2 size={15} />,    href: '/hrms/organization/company' },
      { label: 'Roles & Permissions', icon: <Shield size={15} />,    href: '/hrms/organization/roles' },
    ],
  },
  {
    group: 'CONFIGURATION',
    items: [
      { label: 'Manage Hierarchy',  icon: <GitBranch size={15} />,    href: '/hrms/organization/hierarchy' },
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
  if (mod === 'employee') return EMPLOYEE_SIDEBAR
  return ATTENDANCE_SIDEBAR
}

function getModuleFromPath(url: string): ModuleKey {
  if (url.startsWith('/hrms/organization') || url.startsWith('/hrms/dashboard')) return 'organization'
  if (url.startsWith('/hrms/employee')) return 'employee'
  if (url.startsWith('/hrms/attendance')) return 'attendance'
  return 'organization'
}

export default function HrmsLayout({ children }: { children: React.ReactNode }) {
  const { url, props } = usePage<any>()
  const shared = props as SharedProps
  const hrmsUser = shared?.hrmsUser
  const flash = shared?.flash

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tf-theme') as 'light' | 'dark') || 'light'
    }
    return 'light'
  })

  const [activeModule, setActiveModule] = useState<ModuleKey>(() => getModuleFromPath(url))
  const [openGroup, setOpenGroup] = useState<string | null>('Settings')
  const [mobSidebar, setMobSidebar] = useState(false)
  const [modulePickerOpen, setModulePickerOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tf-theme', theme)
  }, [theme])

  useEffect(() => {
    setActiveModule(getModuleFromPath(url))
  }, [url])

  useEffect(() => {
    if (flash?.success) toast.success(flash.success)
    if (flash?.error)   toast.error(flash.error)
    flash?.toasts?.forEach((m) => toast.error(m))
  }, [flash])

  const sidebarGroups = getSidebarForModule(activeModule)

  const isActive = (href: string) => url === href || url.startsWith(href + '/')
  const isChildActive = (children: { href: string }[]) => children.some((c) => isActive(c.href))

  const logout = () => router.post('/hrms/logout')

  // breadcrumbs
  const breadcrumbs = (() => {
    const parts = url.split('/').filter(Boolean)
    const crumbs: { label: string; href: string }[] = [{ label: 'Home', href: '/hrms/dashboard' }]
    if (parts[1] === 'dashboard') crumbs.push({ label: 'Dashboard', href: '/hrms/dashboard' })
    if (parts[1] === 'organization') {
      crumbs.push({ label: 'Organization', href: '/hrms/organization/company' })
      if (parts[2] === 'company') crumbs.push({ label: 'Company', href: url })
      else if (parts[2] === 'roles') crumbs.push({ label: 'Roles & Permissions', href: url })
      else if (parts[2] === 'hierarchy') crumbs.push({ label: 'Manage Hierarchy', href: url })
      else if (parts[2] === 'settings' && parts[3]) {
        crumbs.push({ label: 'Settings', href: '/hrms/organization/settings/divisions' })
        crumbs.push({ label: parts[3].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), href: url })
      }
    }
    if (parts[1] === 'employee') crumbs.push({ label: 'Employee', href: '/hrms/employee' })
    return crumbs
  })()

  return (
    <>
      <div className="shell">
        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <aside className={`sidebar${mobSidebar ? ' mob-open' : ''}`} style={{ width: 260, position: 'relative' }}>
          {/* Brand / Org identity */}
          <div className="brand" style={{ flexDirection: 'column', alignItems: 'flex-start', height: 'auto', padding: '14px 16px', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0D9488,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '.82rem', flexShrink: 0, fontFamily: 'var(--fd)' }}>
                {hrmsUser?.org?.name ? hrmsUser.org.name.slice(0, 2).toUpperCase() : 'HR'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '.88rem', color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {hrmsUser?.org?.name ?? 'HRMS'}
                </div>
                <div style={{ fontSize: '.62rem', color: 'var(--text4)', fontWeight: 600, letterSpacing: '.04em' }}>
                  {hrmsUser?.org?.orgId ?? '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Module switcher */}
          <div style={{ padding: '10px 10px 0' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setModulePickerOpen(!modulePickerOpen)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 9,
                  background: 'var(--p-lt)', border: '1.5px solid var(--p-mid)',
                  color: 'var(--p)', fontFamily: 'inherit', cursor: 'pointer',
                  fontSize: '.79rem', fontWeight: 700,
                }}
              >
                <span style={{ color: MODULE_META[activeModule].color }}>{MODULE_META[activeModule].icon}</span>
                {MODULE_META[activeModule].label}
                <ChevronDown size={12} style={{ marginLeft: 'auto', opacity: .6, transition: 'transform .2s', transform: modulePickerOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {modulePickerOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, zIndex: 200 }}>
                  {(Object.keys(MODULE_META) as ModuleKey[]).map((mod) => {
                    const meta = MODULE_META[mod]
                    const isCurrentMod = mod === activeModule
                    return (
                      <button
                        key={mod}
                        onClick={() => {
                          setActiveModule(mod)
                          setModulePickerOpen(false)
                          const defaultPaths: Record<ModuleKey, string> = {
                            organization: '/hrms/organization/company',
                            employee: '/hrms/employee',
                            attendance: '/hrms/attendance',
                          }
                          router.visit(defaultPaths[mod])
                        }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 10px', borderRadius: 7,
                          background: isCurrentMod ? 'var(--p-lt)' : 'transparent',
                          border: 'none', cursor: 'pointer', color: isCurrentMod ? 'var(--p)' : 'var(--text2)',
                          fontFamily: 'inherit', fontSize: '.8rem', fontWeight: isCurrentMod ? 700 : 500,
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ color: meta.color }}>{meta.icon}</span>
                        {meta.label}
                        {isCurrentMod && <span style={{ marginLeft: 'auto', fontSize: '.6rem', fontWeight: 800, color: 'var(--p)', background: 'var(--p-mid)', padding: '1px 6px', borderRadius: 10 }}>Active</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Nav links */}
          <div className="sb-scroll" style={{ marginTop: 8 }}>
            {/* Dashboard always shown */}
            <Link href="/hrms/dashboard" className={`sb-item${url === '/hrms/dashboard' || url === '/hrms' ? ' active' : ''}`}>
              <span className="sb-icon"><LayoutDashboard size={15} /></span>
              Dashboard
            </Link>

            {sidebarGroups.map((group) => (
              <div key={group.group ?? 'default'}>
                {group.group && <div className="sb-label">{group.group}</div>}
                {group.items.map((item) => {
                  if (item.children) {
                    const childActive = isChildActive(item.children)
                    const expanded = openGroup === item.label || childActive
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
                        <div className={`sb-sub${expanded ? ' open' : ''}`} style={{ maxHeight: expanded ? 600 : 0 }}>
                          {item.children.map((child) => (
                            <Link key={child.href} href={child.href} className={`sb-sub-item${isActive(child.href) ? ' active' : ''}`}>
                              <span className="sb-sub-dot" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <Link key={item.href} href={item.href!} className={`sb-item${isActive(item.href!) ? ' active' : ''}`}>
                      <span className="sb-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>

          {/* User footer */}
          {hrmsUser && (
            <div className="sb-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,var(--p),var(--s))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.72rem', flexShrink: 0, fontFamily: 'var(--fd)' }}>
                  {hrmsUser.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.79rem', fontWeight: 700, color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {hrmsUser.fullName}
                  </div>
                  <div style={{ fontSize: '.63rem', color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                    {hrmsUser.profileName}
                  </div>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '2px 4px' }} />
              <button
                onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, fontSize: '.78rem', fontWeight: 600, color: 'var(--text3)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)' }}
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          )}
        </aside>

        {/* ── Main area ────────────────────────────────────────────────────────── */}
        <div className="main">
          <header className="navbar">
            <button className="ibtn" onClick={() => setMobSidebar(!mobSidebar)} style={{ display: 'flex' }}>
              <Menu size={16} />
            </button>

            <nav className="bc" style={{ flex: 1 }}>
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {i > 0 && <ChevronRight size={12} className="bc-sep" />}
                  {i === breadcrumbs.length - 1
                    ? <span className="bc-item cur">{crumb.label}</span>
                    : <Link href={crumb.href} className="bc-item">{crumb.label}</Link>}
                </span>
              ))}
            </nav>

            <div className="nav-right">
              <button className={`ibtn nd`} onClick={() => setDrawerOpen(true)} title="Notifications">
                <Bell size={16} />
              </button>
              <button className="theme-btn" onClick={() => setTheme((t) => t === 'light' ? 'dark' : 'light')} title="Toggle theme">
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

          <main className="content">{children}</main>
        </div>
      </div>

      <Toaster position="top-right" richColors closeButton duration={4000} gap={8}
        toastOptions={{ style: { borderRadius: '12px', fontSize: '.82rem', fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,.16)', padding: '12px 16px' } }}
      />

      {/* Notifications Drawer */}
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
