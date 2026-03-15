import { useState, useEffect, useRef } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { toast, Toaster } from 'sonner'
import {
  Users, Building2, Clock, ChevronDown, ChevronRight, ChevronLeft,
  Moon, Sun, Bell, LogOut, Zap, Settings, GitBranch, Shield,
  X, LayoutGrid, Calendar, DollarSign, Layers, FileText, Briefcase,
} from 'lucide-react'

interface HrmsPermEntry { view: boolean; add: boolean; edit: boolean; delete: boolean }

interface HrmsUser {
  id: number
  fullName: string
  email: string
  employeeCode: string | null
  profileId: number | null
  profileName: string
  hasProfile: boolean
  permissions: Record<string, HrmsPermEntry>      // module-level: { [moduleKey]: perm }
  addonPermissions: Record<string, HrmsPermEntry> // addon-level:  { [addonId]: perm }  keyed by addon ID string
  addonNameIndex: Record<string, string>          // addonName → addonId string, for sidebar perm lookups
  moduleOrder: string[]                           // module keys sorted by DB sortOrder
  initials: string
  org: { id: number; orgId: string; name: string; logo: string | null }
}

interface SharedProps {
  hrmsUser?: HrmsUser
  flash?: { success?: string; error?: string; errors?: Record<string, string>; toasts?: string[] }
}

interface SettingsGroup {
  group: string
  items: { label: string; href: string; perm?: string }[]
}

interface SidebarItem {
  label: string
  icon: React.ReactNode
  href?: string
  perm?: string  // addon name required to view this item
  children?: { label: string; href: string; perm?: string }[]
  groups?: SettingsGroup[]
}

/* ── module definitions ───────────────────────────────────────────────────── */
type ModuleKey = 'self' | 'organization' | 'employee' | 'attendance' | 'leave' | 'payroll'

const MODULE_META: Record<ModuleKey, { label: string; icon: React.ReactNode; color: string; defaultPath: string }> = {
  self:         { label: 'Self Service', icon: <LayoutGrid  size={14} />, color: '#4F46E5', defaultPath: '/hrms/self-service' },
  organization: { label: 'Organization', icon: <Building2   size={14} />, color: '#0D9488', defaultPath: '/hrms/organization/company' },
  employee:     { label: 'Employee',     icon: <Users       size={14} />, color: '#7C3AED', defaultPath: '/hrms/employee' },
  attendance:   { label: 'Attendance',   icon: <Clock       size={14} />, color: '#D97706', defaultPath: '/hrms/attendance' },
  leave:        { label: 'Leave',        icon: <Calendar    size={14} />, color: '#16A34A', defaultPath: '/hrms/leave' },
  payroll:      { label: 'Payroll',      icon: <DollarSign  size={14} />, color: '#2563EB', defaultPath: '/hrms/payroll' },
}

const ORG_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  {
    group: 'MAIN MENU',
    items: [
      { label: 'Company',             icon: <Building2 size={16} />, href: '/hrms/organization/company', perm: 'Settings - Company' },
      { label: 'Roles & Permissions', icon: <Shield    size={16} />, href: '/hrms/organization/roles',   perm: 'Roles & Permissions' },
    ],
  },
  {
    group: 'CONFIGURATION',
    items: [
      { label: 'Manage Hierarchy', icon: <GitBranch size={16} />, href: '/hrms/organization/hierarchy', perm: 'Settings - Hierarchy' },
    ],
  },
]

/* ── settings panel sections ──────────────────────────────────────────────── */
interface SettingsPanelItem { label: string; href: string; perm?: string }
interface SettingsPanelGroup { group: string; items: SettingsPanelItem[] }
interface SettingsPanelSection {
  section: string
  icon: React.ReactNode
  color: string
  groups: SettingsPanelGroup[]
}

const SETTINGS_PANEL_SECTIONS: SettingsPanelSection[] = [
  {
    section: 'Organization & Settings',
    icon: <Building2 size={13} />,
    color: '#0D9488',
    groups: [
      {
        group: 'General',
        items: [
          { label: 'Company',             href: '/hrms/organization/company',    perm: 'Settings - Company' },
          { label: 'Roles & Permissions', href: '/hrms/organization/roles',      perm: 'Roles & Permissions' },
          { label: 'Manage Hierarchy',    href: '/hrms/organization/hierarchy',  perm: 'Settings - Hierarchy' },
        ],
      },
      {
        group: 'Structure',
        items: [
          { label: 'Divisions',       href: '/hrms/organization/settings/divisions',       perm: 'Settings - Divisions' },
          { label: 'Departments',     href: '/hrms/organization/settings/departments',     perm: 'Settings - Departments' },
          { label: 'Sub Departments', href: '/hrms/organization/settings/sub-departments', perm: 'Settings - Sub Department' },
          { label: 'Sections',        href: '/hrms/organization/settings/sections',        perm: 'Settings - Section' },
          { label: 'Sub Sections',    href: '/hrms/organization/settings/sub-sections',    perm: 'Settings - Sub Section' },
        ],
      },
      {
        group: 'Workforce',
        items: [
          { label: 'Designations', href: '/hrms/organization/settings/designations', perm: 'Settings - Designations' },
          { label: 'Grades',       href: '/hrms/organization/settings/grades',       perm: 'Settings - Grades' },
          { label: 'Locations',    href: '/hrms/organization/settings/locations',    perm: 'Settings - Locations' },
        ],
      },
      {
        group: 'Policy',
        items: [
          { label: 'Holidays',      href: '/hrms/organization/settings/holidays',      perm: 'Settings - Holidays' },
          { label: 'Notice Period', href: '/hrms/organization/settings/notice-period', perm: 'Settings - Notice Period' },
          { label: 'Approvals',     href: '/hrms/organization/settings/approvals',     perm: 'Settings - Approvals' },
        ],
      },
      {
        group: 'Documents',
        items: [
          { label: 'Company Documents', href: '/hrms/organization/settings/documents',  perm: 'Settings - Company Documents' },
          { label: 'Checklists',        href: '/hrms/organization/settings/checklists', perm: 'Settings - Checklists' },
          { label: 'Templates',         href: '/hrms/organization/settings/templates',  perm: 'Settings - Templates' },
        ],
      },
      {
        group: 'System',
        items: [
          { label: 'Fiscal Year',   href: '/hrms/organization/settings/fiscal-year',   perm: 'Settings - Fiscal Year' },
          { label: 'Alerts',        href: '/hrms/organization/settings/alerts',         perm: 'Settings - Alerts' },
          { label: 'Notifications', href: '/hrms/organization/settings/notifications',  perm: 'Settings - Notifications' },
        ],
      },
    ],
  },
  {
    section: 'Employee Settings',
    icon: <Users size={13} />,
    color: '#2563EB',
    groups: [
      {
        group: 'Configuration',
        items: [
          { label: 'Employment Types',    href: '/hrms/employee/settings/employment-types' },
          { label: 'Employee Categories', href: '/hrms/employee/settings/categories' },
          { label: 'Probation Policies',  href: '/hrms/employee/settings/probation' },
        ],
      },
      {
        group: 'Fields & Documents',
        items: [
          { label: 'Custom Fields',   href: '/hrms/employee/settings/custom-fields' },
          { label: 'Document Types',  href: '/hrms/employee/settings/document-types' },
          { label: 'Checklist Items', href: '/hrms/employee/settings/checklist-items' },
        ],
      },
    ],
  },
  {
    section: 'Attendance Settings',
    icon: <Clock size={13} />,
    color: '#D97706',
    groups: [
      {
        group: 'Scheduling',
        items: [
          { label: 'Shifts',          href: '/hrms/attendance/settings/shifts' },
          { label: 'Work Schedules',  href: '/hrms/attendance/settings/work-schedules' },
          { label: 'Work Calendars',  href: '/hrms/attendance/settings/work-calendars' },
        ],
      },
      {
        group: 'Policy',
        items: [
          { label: 'Attendance Policies', href: '/hrms/attendance/settings/policies' },
          { label: 'Overtime Rules',      href: '/hrms/attendance/settings/overtime' },
          { label: 'Late & Regularize',   href: '/hrms/attendance/settings/late-rules' },
        ],
      },
    ],
  },
]

const SELF_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  {
    group: 'SELF SERVICE',
    items: [
      { label: 'Self Service', icon: <LayoutGrid size={16} />, href: '/hrms/self-service' },
    ],
  },
]

const LEAVE_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  { group: 'LEAVE', items: [{ label: 'Leave Management', icon: <Calendar size={16} />, href: '/hrms/leave' }] },
]

const PAYROLL_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  { group: 'PAYROLL', items: [{ label: 'Payroll', icon: <DollarSign size={16} />, href: '/hrms/payroll' }] },
]

const EMPLOYEE_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  { group: 'MAIN MENU', items: [{ label: 'Employee Directory', icon: <Users size={16} />, href: '/hrms/employee' }] },
]

const ATTENDANCE_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  { group: 'MAIN MENU', items: [{ label: 'Attendance', icon: <Clock size={16} />, href: '/hrms/attendance' }] },
]

const SETTINGS_SIDEBAR: { group?: string; items: SidebarItem[] }[] = [
  {
    group: 'ORGANIZATION',
    items: [
      { label: 'Company',             icon: <Building2 size={16} />, href: '/hrms/organization/company',    perm: 'Settings - Company' },
      { label: 'Roles & Permissions', icon: <Shield    size={16} />, href: '/hrms/organization/roles',      perm: 'Roles & Permissions' },
      { label: 'Manage Hierarchy',    icon: <GitBranch size={16} />, href: '/hrms/organization/hierarchy',  perm: 'Settings - Hierarchy' },
      {
        label: 'Structure',
        icon: <Layers size={16} />,
        children: [
          { label: 'Divisions',       href: '/hrms/organization/settings/divisions',       perm: 'Settings - Divisions' },
          { label: 'Departments',     href: '/hrms/organization/settings/departments',     perm: 'Settings - Departments' },
          { label: 'Sub Departments', href: '/hrms/organization/settings/sub-departments', perm: 'Settings - Sub Department' },
          { label: 'Sections',        href: '/hrms/organization/settings/sections',        perm: 'Settings - Section' },
          { label: 'Sub Sections',    href: '/hrms/organization/settings/sub-sections',    perm: 'Settings - Sub Section' },
        ],
      },
      {
        label: 'Workforce',
        icon: <Users size={16} />,
        children: [
          { label: 'Designations', href: '/hrms/organization/settings/designations', perm: 'Settings - Designations' },
          { label: 'Grades',       href: '/hrms/organization/settings/grades',       perm: 'Settings - Grades' },
          { label: 'Locations',    href: '/hrms/organization/settings/locations',    perm: 'Settings - Locations' },
        ],
      },
      {
        label: 'Policy',
        icon: <Shield size={16} />,
        children: [
          { label: 'Holidays',      href: '/hrms/organization/settings/holidays',      perm: 'Settings - Holidays' },
          { label: 'Notice Period', href: '/hrms/organization/settings/notice-period', perm: 'Settings - Notice Period' },
          { label: 'Approvals',     href: '/hrms/organization/settings/approvals',     perm: 'Settings - Approvals' },
        ],
      },
      {
        label: 'Documents',
        icon: <FileText size={16} />,
        children: [
          { label: 'Company Documents', href: '/hrms/organization/settings/documents',  perm: 'Settings - Company Documents' },
          { label: 'Checklists',        href: '/hrms/organization/settings/checklists', perm: 'Settings - Checklists' },
          { label: 'Templates',         href: '/hrms/organization/settings/templates',  perm: 'Settings - Templates' },
        ],
      },
      {
        label: 'System',
        icon: <Settings size={16} />,
        children: [
          { label: 'Fiscal Year',   href: '/hrms/organization/settings/fiscal-year',   perm: 'Settings - Fiscal Year' },
          { label: 'Alerts',        href: '/hrms/organization/settings/alerts',         perm: 'Settings - Alerts' },
          { label: 'Notifications', href: '/hrms/organization/settings/notifications',  perm: 'Settings - Notifications' },
        ],
      },
    ],
  },
  {
    group: 'EMPLOYEE',
    items: [
      { label: 'Employment Types',    icon: <Briefcase size={16} />, href: '/hrms/employee/settings/employment-types' },
      { label: 'Employee Categories', icon: <Users     size={16} />, href: '/hrms/employee/settings/categories' },
      { label: 'Probation Policies',  icon: <FileText  size={16} />, href: '/hrms/employee/settings/probation' },
      { label: 'Custom Fields',       icon: <Layers    size={16} />, href: '/hrms/employee/settings/custom-fields' },
      { label: 'Document Types',      icon: <FileText  size={16} />, href: '/hrms/employee/settings/document-types' },
    ],
  },
  {
    group: 'ATTENDANCE',
    items: [
      { label: 'Shifts',              icon: <Clock     size={16} />, href: '/hrms/attendance/settings/shifts' },
      { label: 'Work Schedules',      icon: <Calendar  size={16} />, href: '/hrms/attendance/settings/work-schedules' },
      { label: 'Attendance Policies', icon: <Shield    size={16} />, href: '/hrms/attendance/settings/policies' },
      { label: 'Overtime Rules',      icon: <Clock     size={16} />, href: '/hrms/attendance/settings/overtime' },
    ],
  },
]

function isSettingsPath(url: string): boolean {
  return url.startsWith('/hrms/organization') ||
    url.startsWith('/hrms/employee/settings') ||
    url.startsWith('/hrms/attendance/settings') ||
    url.startsWith('/hrms/leave/settings') ||
    url.startsWith('/hrms/payroll/settings')
}

function getSidebarForModule(mod: ModuleKey, url: string) {
  if (isSettingsPath(url)) {
    if (url.startsWith('/hrms/employee/settings'))   return SETTINGS_SIDEBAR.filter((g) => g.group === 'EMPLOYEE')
    if (url.startsWith('/hrms/attendance/settings')) return SETTINGS_SIDEBAR.filter((g) => g.group === 'ATTENDANCE')
    if (url.startsWith('/hrms/leave/settings'))      return SETTINGS_SIDEBAR.filter((g) => g.group === 'LEAVE')
    if (url.startsWith('/hrms/payroll/settings'))    return SETTINGS_SIDEBAR.filter((g) => g.group === 'PAYROLL')
    return SETTINGS_SIDEBAR.filter((g) => g.group === 'ORGANIZATION')
  }
  if (mod === 'self')     return SELF_SIDEBAR
  if (mod === 'employee') return EMPLOYEE_SIDEBAR
  if (mod === 'leave')    return LEAVE_SIDEBAR
  if (mod === 'payroll')  return PAYROLL_SIDEBAR
  return ATTENDANCE_SIDEBAR
}

function getModuleFromPath(url: string): ModuleKey {
  if (url.startsWith('/hrms/self-service')) return 'self'
  if (url.startsWith('/hrms/employee'))     return 'employee'
  if (url.startsWith('/hrms/attendance'))   return 'attendance'
  if (url.startsWith('/hrms/leave'))        return 'leave'
  if (url.startsWith('/hrms/payroll'))      return 'payroll'
  if (url.startsWith('/hrms/organization') || url.startsWith('/hrms/dashboard')) return 'organization'
  return 'self'
}

function buildBreadcrumbs(url: string): { label: string; href: string; isSettings?: boolean }[] {
  const parts = url.split('/').filter(Boolean)

  // ── settings paths: independent root, no "Self Service" parent ────────────
  if (parts[1] === 'organization') {
    const crumbs: { label: string; href: string; isSettings?: boolean }[] = [
      { label: 'Settings', href: '/hrms/organization/company', isSettings: true },
    ]
    if      (parts[2] === 'company')   crumbs.push({ label: 'Company', href: url })
    else if (parts[2] === 'roles')     crumbs.push({ label: 'Roles & Permissions', href: url })
    else if (parts[2] === 'hierarchy') crumbs.push({ label: 'Manage Hierarchy', href: url })
    else if (parts[2] === 'settings' && parts[3])
      crumbs.push({ label: parts[3].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), href: url })
    return crumbs
  }
  if (parts[1] === 'employee' && parts[2] === 'settings') {
    const crumbs: { label: string; href: string; isSettings?: boolean }[] = [
      { label: 'Settings', href: '/hrms/organization/company', isSettings: true },
      { label: 'Employee', href: '/hrms/employee/settings/employment-types' },
    ]
    if (parts[3]) crumbs.push({ label: parts[3].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), href: url })
    return crumbs
  }
  if (parts[1] === 'attendance' && parts[2] === 'settings') {
    const crumbs: { label: string; href: string; isSettings?: boolean }[] = [
      { label: 'Settings', href: '/hrms/organization/company', isSettings: true },
      { label: 'Attendance', href: '/hrms/attendance/settings/shifts' },
    ]
    if (parts[3]) crumbs.push({ label: parts[3].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), href: url })
    return crumbs
  }

  // ── module paths: Self Service parent ─────────────────────────────────────
  const crumbs: { label: string; href: string }[] = [{ label: 'Self Service', href: '/hrms/self-service' }]
  if (parts[1] === 'dashboard')   crumbs.push({ label: 'Dashboard',  href: '/hrms/dashboard' })
  else if (parts[1] === 'employee')   crumbs.push({ label: 'Employee',   href: '/hrms/employee' })
  else if (parts[1] === 'attendance') crumbs.push({ label: 'Attendance', href: '/hrms/attendance' })
  else if (parts[1] === 'leave')      crumbs.push({ label: 'Leave',      href: '/hrms/leave' })
  else if (parts[1] === 'payroll')    crumbs.push({ label: 'Payroll',    href: '/hrms/payroll' })
  return crumbs
}

/* ── layout ───────────────────────────────────────────────────────────────── */
export default function HrmsLayout({ children }: { children: React.ReactNode }) {
  const { url, props } = usePage<any>()
  const shared   = props as SharedProps
  const hrmsUser = shared?.hrmsUser
  const flash    = shared?.flash

  const [theme, setTheme]             = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('tf-theme') as 'light' | 'dark') || 'light' : 'light'
  )
  const [activeModule,  setActiveModule]  = useState<ModuleKey>(() => getModuleFromPath(url))
  const [openGroup,     setOpenGroup]     = useState<string | null>(null)
  const [sbCollapsed,   setSbCollapsed]   = useState(false)
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [settingsOpen,  setSettingsOpen]  = useState(false)
  const settingsPanelRef = useRef<HTMLDivElement>(null)
  const settingsBtnRef   = useRef<HTMLButtonElement>(null)

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

  // Close settings panel on Escape or click outside
  useEffect(() => {
    if (!settingsOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSettingsOpen(false) }
    const handleClick = (e: MouseEvent) => {
      if (
        settingsPanelRef.current && !settingsPanelRef.current.contains(e.target as Node) &&
        settingsBtnRef.current  && !settingsBtnRef.current.contains(e.target as Node)
      ) setSettingsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [settingsOpen])

  // Close settings panel on navigation
  useEffect(() => { setSettingsOpen(false) }, [url])

  const isOnSettingsPath = isSettingsPath(url)
  const sidebarGroups    = getSidebarForModule(activeModule, url)
  const breadcrumbs      = buildBreadcrumbs(url)
  const currentPage      = breadcrumbs[breadcrumbs.length - 1]?.label ?? ''
  const addonPerms     = hrmsUser?.addonPermissions ?? {}  // keyed by addon ID string
  const addonNameIndex = hrmsUser?.addonNameIndex   ?? {}  // addonName → addonId string

  // Returns true when the employee is allowed to view this sidebar item.
  // perm = undefined means the item requires no permission.
  // Lookup: addonName → addonId (via addonNameIndex) → check addonPermissions[id].view
  const canSee = (perm: string | undefined) => {
    if (perm === undefined) return true
    const addonId = addonNameIndex[perm]
    if (!addonId) return false
    return addonPerms[addonId]?.view === true
  }

  const isActive      = (href: string) => url === href || url.startsWith(href + '/')
  const isChildActive = (ch: { href: string }[]) => ch.some((c) => isActive(c.href))
  const isGroupsActive = (gs: SettingsGroup[]) => gs.some((g) => g.items.some((c) => isActive(c.href)))

  function switchModule(mod: ModuleKey) {
    setActiveModule(mod)
    router.visit(MODULE_META[mod].defaultPath)
  }

  const logout = () => router.post('/hrms/logout')

  /* expanded sidebar width */
  const SB_W = 260
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
  const panelLeft = isMobile ? 0 : sbCollapsed ? 58 : SB_W

  return (
    <>
      <style>{`
        /* ── sidebar base ── */
        .hf-sidebar {
          width: ${SB_W}px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; flex-shrink: 0;
          position: relative; z-index: 100;
          transition: width .24s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
        }

        /* make sb-text/sb-icon inline-block so width/max-width actually work */
        .hf-sidebar .sb-text { display: inline-block; }
        .hf-sidebar .sb-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 16px !important; height: 16px !important; flex-shrink: 0;
        }

        /* ── brand org card ── */
        .sb-org-card {
          padding: 14px 12px 10px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(13,148,136,.06) 0%, transparent 100%);
          flex-shrink: 0;
        }
        .sb-org-row { display: flex; align-items: center; gap: 10px; }
        .sb-org-avatar {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--p) 0%, var(--s) 100%);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: .82rem; color: #fff; font-family: var(--fd);
          box-shadow: 0 3px 10px rgba(13,148,136,.28); border: 1.5px solid rgba(255,255,255,.18);
          flex-shrink: 0;
        }
        .sb-org-meta { flex: 1; min-width: 0; overflow: hidden; }
        .sb-org-name {
          font-family: var(--fd); font-weight: 800; font-size: .87rem;
          color: var(--text1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .sb-org-id {
          display: inline-flex; align-items: center; gap: 3px; margin-top: 3px;
          padding: 1px 7px; border-radius: 20px;
          background: var(--p-lt); border: 1px solid var(--p-mid);
          font-size: .6rem; font-weight: 700; color: var(--p); font-family: var(--fd);
          letter-spacing: .04em; white-space: nowrap;
        }
        /* collapsed: hide org meta, center avatar */
        .hf-sidebar.sb-col .sb-org-card { padding: 12px 0; }
        .hf-sidebar.sb-col .sb-org-row  { justify-content: center; gap: 0; }
        .hf-sidebar.sb-col .sb-org-meta { max-width: 0; overflow: hidden; opacity: 0; flex: 0 0 0% !important; min-width: 0 !important; }
        .sb-org-meta { transition: max-width .24s, opacity .2s; }

        /* desktop collapsed */
        .hf-sidebar.sb-col { width: 58px; }
        .hf-sidebar.sb-col .sb-text {
          opacity: 0; max-width: 0; overflow: hidden; white-space: nowrap;
          transition: opacity .2s, max-width .2s;
        }
        .hf-sidebar.sb-col .sb-label {
          opacity: 0; max-height: 0; padding: 0 !important; overflow: hidden;
        }
        .hf-sidebar.sb-col .chevron       { opacity: 0; max-width: 0; overflow: hidden; margin-left: 0 !important; }
        .hf-sidebar.sb-col .sb-sub        { display: none !important; }

        /* settings sidebar group label (ORGANIZATION / EMPLOYEE / ATTENDANCE) */
        .sb-settings-group-label {
          font-size: .59rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
          padding: 12px 8px 5px;
          display: flex; align-items: center; gap: 6px;
        }
        .sb-settings-group-label .sgl-pip {
          width: 3px; height: 14px; border-radius: 2px; flex-shrink: 0;
        }
        .sgl-org  { color: #0D9488; }
        .sgl-pip-org  { background: #0D9488; }
        .sgl-emp  { color: #2563EB; }
        .sgl-pip-emp  { background: #2563EB; }
        .sgl-att  { color: #D97706; }
        .sgl-pip-att  { background: #D97706; }

        /* settings sub-group headers */
        .sb-sub-group {
          font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
          color: var(--text4); padding: 8px 12px 3px 14px;
          display: flex; align-items: center; gap: 5px;
        }
        .sb-sub-group::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }
        .sb-sub-group:first-child { padding-top: 4px; }
        .hf-sidebar.sb-col .sb-item       { justify-content: center; padding: 9px 0 !important; gap: 0 !important; width: 100%; }
        .hf-sidebar.sb-col .sb-icon       { width: 20px !important; height: 20px !important; opacity: 1; margin: 0 !important; flex-shrink: 0; }
        .hf-sidebar.sb-col .sb-scroll     { padding: 10px 0 !important; }
        .hf-sidebar.sb-col .sb-col-toggle { left: 50%; transform: translateX(-50%); }
        .sb-text   { transition: opacity .2s, max-width .2s; white-space: nowrap; overflow: hidden; }
        .sb-label  { transition: opacity .18s, max-height .18s, padding .18s; }
        .chevron   { transition: transform .2s, opacity .2s, max-width .2s; }

        /* desktop collapse toggle button */
        .sb-col-toggle {
          position: absolute; bottom: 56px; left: ${SB_W - 16}px;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 10; color: var(--text3);
          transition: left .24s cubic-bezier(.4,0,.2,1), transform .24s, background .15s, color .15s, box-shadow .15s;
          box-shadow: 0 1px 4px rgba(0,0,0,.12);
        }
        .sb-col-toggle:hover { background: var(--p-lt); color: var(--p); box-shadow: 0 2px 8px rgba(13,148,136,.2); }

        /* mobile: sidebar hidden, no hamburger */
        @media (max-width: 768px) {
          .hf-sidebar { display: none !important; }
          .sb-col-toggle { display: none !important; }
        }

        /* ── module tabs ── */
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
        .bc-a   { font-size: .73rem; color: var(--text3); font-weight: 500; transition: color .15s; }
        .bc-a:hover { color: var(--p); }
        .bc-cur { font-size: .73rem; color: var(--text1); font-weight: 700; }
        .bc-div { color: var(--border2); flex-shrink: 0; }
        .bc-badge {
          margin-left: auto; font-size: .65rem; font-weight: 700;
          color: var(--p); letter-spacing: .04em; text-transform: uppercase;
          padding: 2px 9px; border-radius: 20px;
          background: var(--p-lt); border: 1px solid var(--p-mid);
        }

        /* ── settings panel ── */
        .sp-overlay {
          position: fixed; top: 58px; right: 0; bottom: 0;
          z-index: 399; background: transparent;
        }
        .sp-panel {
          position: fixed; top: 58px; right: 0;
          z-index: 400; background: var(--surface);
          border-bottom: 1px solid var(--border);
          transform-origin: top center;
          transition: transform .22s cubic-bezier(.4,0,.2,1), opacity .2s;
          overflow: hidden;
        }
        .sp-panel.sp-open  { transform: scaleY(1); opacity: 1; pointer-events: all; }
        .sp-panel.sp-close { transform: scaleY(0); opacity: 0; pointer-events: none; }
        .sp-inner {
          padding: 16px 24px 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        /* section block */
        .sp-section {
          padding: 12px 16px 16px;
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        /* last two sections sit side-by-side in col 2 — no right border on last col */
        .sp-section:nth-child(odd):last-child { border-right: none; grid-column: span 2; }
        .sp-section:last-child { border-bottom: none; border-right: none; }
        .sp-section:nth-last-child(2) { border-bottom: none; }
        .sp-section-header {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 10px; padding: 5px 9px; border-radius: 8px;
          font-family: var(--fd); font-weight: 800; font-size: .75rem;
          letter-spacing: .03em;
        }
        .sp-section-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
        }
        /* groups in 2-col grid within each section */
        .sp-groups {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
          align-items: start;
        }
        .sp-group { display: flex; flex-direction: column; gap: 1px; }
        .sp-group-label {
          font-size: .57rem; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
          color: var(--text4); padding: 0 0 4px 6px;
        }
        .sp-link {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 8px; border-radius: 6px;
          font-size: .78rem; font-weight: 500; color: var(--text2);
          text-decoration: none; white-space: nowrap;
          transition: background .12s, color .12s;
        }
        .sp-link:hover { color: var(--text1); background: var(--bg2); }
        .sp-link.sp-active { font-weight: 700; }
        .sp-link-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--border2); flex-shrink: 0;
          transition: background .12s;
        }
        .sp-link:hover .sp-link-dot { background: var(--text3); }
        /* settings trigger pill */
        .settings-trigger {
          display: flex; align-items: center; gap: 6px;
          height: 34px; padding: 0 12px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg2);
          cursor: pointer; font-family: inherit;
          font-size: .78rem; font-weight: 600; color: var(--text2);
          transition: background .15s, color .15s, border-color .15s, box-shadow .15s;
          white-space: nowrap;
        }
        .settings-trigger:hover {
          background: var(--surface); color: var(--text1);
          border-color: var(--border2);
        }
        .settings-trigger.st-active {
          background: var(--p-lt); color: var(--p);
          border-color: var(--p-mid);
        }
        .settings-trigger .st-icon {
          display: flex; align-items: center;
          transition: transform .3s cubic-bezier(.4,0,.2,1);
        }
        .settings-trigger.st-active .st-icon,
        .settings-trigger:hover .st-icon { transform: rotate(45deg); }
        @media (max-width: 640px) { .settings-trigger .st-label { display: none; } .settings-trigger { padding: 0 9px; } }

        /* col 1 = Organization (spans rows), col 2 = Employee+Attendance stacked */
        .sp-section.sp-org  { grid-column: 1; grid-row: 1 / span 2; border-right: 1px solid var(--border); border-bottom: none; }
        .sp-section.sp-emp  { grid-column: 2; grid-row: 1; border-right: none; }
        .sp-section.sp-att  { grid-column: 2; grid-row: 2; border-right: none; border-top: 1px solid var(--border); border-bottom: none; }

        @media (max-width: 768px) {
          .sp-inner { grid-template-columns: 1fr; }
          .sp-section.sp-org, .sp-section.sp-emp, .sp-section.sp-att {
            grid-column: 1; grid-row: auto;
            border-right: none; border-top: none; border-bottom: 1px solid var(--border);
          }
          .sp-section.sp-att { border-bottom: none; }
          .sp-groups { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
        }

        /* ── responsive navbar ── */
        @media (max-width: 1100px) {
          .mod-tab .mod-lbl { display: none; }
          .mod-tab { padding: 7px 10px; }
        }
        @media (max-width: 768px) {
          .bc-badge { display: none; }
          .bc-bar   { padding: 0 14px; }
          .nav-user-pill { display: none !important; }
        }
        @media (max-width: 480px) {
          .mod-tabs { gap: 1px; padding: 2px; }
          .mod-tab  { padding: 6px 8px; }
          .navbar   { padding: 0 10px !important; gap: 6px !important; }
          .bc-bar   { display: none; }
        }
      `}</style>

      <div className="shell">

        {/* ═══════════════════════════════════ SIDEBAR ══════════════════════════ */}
        <aside className={`hf-sidebar${sbCollapsed ? ' sb-col' : ''}`}>

          {/* org identity card */}
          <div className="sb-org-card">
            <div className="sb-org-row">
              <div className="sb-org-avatar">
                {hrmsUser?.org?.name ? hrmsUser.org.name.slice(0, 2).toUpperCase() : 'HR'}
              </div>
              <div className="sb-org-meta">
                <div className="sb-org-name">{hrmsUser?.org?.name ?? 'HRMS'}</div>
                <div className="sb-org-id">{hrmsUser?.org?.orgId ?? '—'}</div>
              </div>
            </div>
          </div>

          {/* nav links */}
          <div className="sb-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {sidebarGroups.map((group) => {
              // Determine if this is a settings-mode colored group
              const sglKey = group.group === 'ORGANIZATION' ? 'org' : group.group === 'EMPLOYEE' ? 'emp' : group.group === 'ATTENDANCE' ? 'att' : null
              return (
              <div key={group.group ?? 'g'}>
                {group.group && (
                  sglKey && isOnSettingsPath ? (
                    <div className={`sb-settings-group-label sb-label sgl-${sglKey}`}>
                      <span className={`sgl-pip sgl-pip-${sglKey}`} />
                      <span className="sb-text">{group.group}</span>
                    </div>
                  ) : (
                    <div className="sb-label" style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', padding: '10px 8px 4px' }}>
                      <span className="sb-text">{group.group}</span>
                    </div>
                  )
                )}
                {group.items.map((item) => {
                  // grouped dropdown (e.g. Settings) — filter sub-groups and items by addon perm
                  if (item.groups) {
                    const visibleGroups = item.groups
                      .map((sg) => ({ ...sg, items: sg.items.filter((c) => canSee(c.perm)) }))
                      .filter((sg) => sg.items.length > 0)
                    if (visibleGroups.length === 0) return null
                    const childActive = isGroupsActive(visibleGroups)
                    const expanded    = openGroup === item.label || childActive
                    return (
                      <div key={item.label}>
                        <div
                          className={`sb-item${childActive ? ' active' : ''}`}
                          onClick={() => !sbCollapsed && setOpenGroup(expanded ? null : item.label)}
                          style={{ cursor: 'pointer' }}
                          title={sbCollapsed ? item.label : undefined}
                        >
                          <span className="sb-icon">{item.icon}</span>
                          <span className="sb-text">{item.label}</span>
                          <ChevronDown size={12} className={`chevron${expanded ? ' open' : ''}`} style={{ marginLeft: 'auto' }} />
                        </div>
                        <div className={`sb-sub${expanded && !sbCollapsed ? ' open' : ''}`} style={{ maxHeight: expanded && !sbCollapsed ? 1200 : 0 }}>
                          {visibleGroups.map((sg) => (
                            <div key={sg.group}>
                              <div className="sb-sub-group">{sg.group}</div>
                              {sg.items.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`sb-sub-item${isActive(child.href) ? ' active' : ''}`}
                                >
                                  <span className="sb-sub-dot" />
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  // flat dropdown — filter children by addon perm
                  if (item.children) {
                    const visibleChildren = item.children.filter((c) => canSee(c.perm))
                    if (visibleChildren.length === 0) return null
                    const childActive = isChildActive(visibleChildren)
                    const expanded    = openGroup === item.label || childActive
                    return (
                      <div key={item.label}>
                        <div
                          className={`sb-item${childActive ? ' active' : ''}`}
                          onClick={() => !sbCollapsed && setOpenGroup(expanded ? null : item.label)}
                          style={{ cursor: 'pointer' }}
                          title={sbCollapsed ? item.label : undefined}
                        >
                          <span className="sb-icon">{item.icon}</span>
                          <span className="sb-text">{item.label}</span>
                          <ChevronDown size={12} className={`chevron${expanded ? ' open' : ''}`} style={{ marginLeft: 'auto' }} />
                        </div>
                        <div className={`sb-sub${expanded && !sbCollapsed ? ' open' : ''}`} style={{ maxHeight: expanded && !sbCollapsed ? 700 : 0 }}>
                          {visibleChildren.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`sb-sub-item${isActive(child.href) ? ' active' : ''}`}
                            >
                              <span className="sb-sub-dot" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  // simple link — check item-level perm
                  if (!canSee(item.perm)) return null
                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={`sb-item${isActive(item.href!) ? ' active' : ''}`}
                      title={sbCollapsed ? item.label : undefined}
                    >
                      <span className="sb-icon">{item.icon}</span>
                      <span className="sb-text">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )})}
          </div>

          {/* footer: sign out */}
          <div style={{ padding: '8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <button
              onClick={logout}
              title={sbCollapsed ? 'Sign out' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: sbCollapsed ? '9px 0' : '9px 12px', justifyContent: sbCollapsed ? 'center' : 'flex-start', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: 9, fontSize: '.78rem', fontWeight: 600, color: 'var(--text3)', fontFamily: 'inherit', transition: 'background .15s, color .15s, border-color .15s, padding .24s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,.07)'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <LogOut size={14} style={{ flexShrink: 0 }} />
              <span className="sb-text">Sign out</span>
            </button>
          </div>

          {/* desktop collapse toggle */}
          <button
            className="sb-col-toggle"
            onClick={() => setSbCollapsed(!sbCollapsed)}
            title={sbCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ left: sbCollapsed ? '50%' : `${SB_W - 16}px`, transform: sbCollapsed ? 'translateX(-50%)' : 'translateX(-50%)' }}
          >
            <ChevronLeft size={12} style={{ transform: sbCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform .24s' }} />
          </button>
        </aside>


        {/* ═══════════════════════════════════ MAIN ═════════════════════════════ */}
        <div className="main">

          {/* navbar */}
          <header className="navbar" style={{ gap: 10 }}>

            {/* centered module tabs — filtered by the employee's role permissions */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <nav className="mod-tabs">
                {(['self' as ModuleKey, ...(hrmsUser?.moduleOrder ?? []).filter((k): k is ModuleKey => k !== 'self' && k !== 'organization' && k in MODULE_META)])
                  .filter((mod) => {
                    if (mod === 'self') return true
                    return hrmsUser?.permissions[mod]?.view === true
                  })
                  .map((mod) => {
                    const meta = MODULE_META[mod]
                    return (
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
                    )
                  })}
              </nav>
            </div>

            {/* right actions */}
            <div className="nav-right">
              <button
                ref={settingsBtnRef}
                className={`settings-trigger${(settingsOpen || isOnSettingsPath) ? ' st-active' : ''}`}
                onClick={() => setSettingsOpen((o) => !o)}
                title="Settings"
              >
                <span className="st-icon"><Settings size={14} /></span>
                <span className="st-label">Settings</span>
              </button>
              <button className="ibtn" onClick={() => setDrawerOpen(true)} title="Notifications">
                <Bell size={16} />
              </button>
              <button className="theme-btn" onClick={() => setTheme((t) => t === 'light' ? 'dark' : 'light')} title="Toggle theme">
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>
              {hrmsUser && (
                <div className="nav-user-pill" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
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

          {/* breadcrumb bar */}
          <div className="bc-bar">
            {isOnSettingsPath ? (
              <Link href="/hrms/organization/company" className="bc-a" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--p)' }}>
                <Settings size={12} />&nbsp;Settings
              </Link>
            ) : (
              <Link href="/hrms/self-service" className="bc-a" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <LayoutGrid size={12} />&nbsp;Self Service
              </Link>
            )}
            {breadcrumbs.slice(1).map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 2
              return (
                <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ChevronRight size={11} className="bc-div" />
                  {isLast
                    ? <span className="bc-cur">{crumb.label}</span>
                    : <Link href={crumb.href} className="bc-a">{crumb.label}</Link>
                  }
                </span>
              )
            })}
            {currentPage && <span className="bc-badge">{currentPage}</span>}
          </div>

          <main className="content">{children}</main>
        </div>
      </div>

      {/* ═══════════════════════ SETTINGS PANEL ══════════════════════════════ */}
      {settingsOpen && <div className="sp-overlay" style={{ left: panelLeft }} onClick={() => setSettingsOpen(false)} />}
      <div ref={settingsPanelRef} className={`sp-panel ${settingsOpen ? 'sp-open' : 'sp-close'}`} style={{ left: panelLeft }}>
        <div className="sp-inner">
          {SETTINGS_PANEL_SECTIONS.map((section, si) => {
            const visibleGroups = section.groups
              .map((g) => ({ ...g, items: g.items.filter((it) => canSee(it.perm)) }))
              .filter((g) => g.items.length > 0)
            if (visibleGroups.length === 0) return null
            const sectionCls = si === 0 ? 'sp-org' : si === 1 ? 'sp-emp' : 'sp-att'
            return (
              <div key={section.section} className={`sp-section ${sectionCls}`}>
                {/* section header with module color */}
                <div
                  className="sp-section-header"
                  style={{ background: `${section.color}10`, color: section.color }}
                >
                  <span
                    className="sp-section-badge"
                    style={{ background: `${section.color}20` }}
                  >
                    {section.icon}
                  </span>
                  {section.section}
                </div>
                {/* groups */}
                <div className="sp-groups">
                  {visibleGroups.map((g) => (
                    <div key={g.group} className="sp-group">
                      <div className="sp-group-label">{g.group}</div>
                      {g.items.map((it) => (
                        <Link
                          key={it.href}
                          href={it.href}
                          className={`sp-link${isActive(it.href) ? ' sp-active' : ''}`}
                          style={isActive(it.href) ? { background: `${section.color}12`, color: section.color } : undefined}
                          onClick={() => setSettingsOpen(false)}
                        >
                          <span
                            className="sp-link-dot"
                            style={isActive(it.href) ? { background: section.color } : undefined}
                          />
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Toaster position="top-right" richColors closeButton duration={4000} gap={8}
        toastOptions={{ style: { borderRadius: '12px', fontSize: '.82rem', fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,.16)', padding: '12px 16px' } }}
      />

      {/* notifications drawer */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,18,.25)', backdropFilter: 'blur(3px)', zIndex: 890, opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'all' : 'none', transition: 'opacity .22s' }} onClick={() => setDrawerOpen(false)} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, background: 'var(--surface)', borderLeft: '1px solid var(--border)', zIndex: 900, transform: drawerOpen ? 'none' : 'translateX(100%)', transition: 'transform .28s cubic-bezier(.4,0,.2,1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={15} style={{ color: 'var(--text2)' }} />
            <span style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '.92rem' }}>Notifications</span>
          </div>
          <button className="ibtn" onClick={() => setDrawerOpen(false)}><X size={16} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,rgba(13,148,136,.15),rgba(13,148,136,.05))', border: '1px solid rgba(13,148,136,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={26} style={{ color: 'var(--p)' }} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text1)', marginBottom: 6 }}>Coming Soon</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text3)', lineHeight: 1.6 }}>HR notifications, alerts, and approvals coming in the next release.</div>
          </div>
        </div>
      </div>
    </>
  )
}
