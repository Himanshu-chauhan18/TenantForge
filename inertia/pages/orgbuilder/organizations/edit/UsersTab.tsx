import { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react'
import {
  Users, Plus, Search, X, Filter, SlidersHorizontal,
  RefreshCw, Pencil, QrCode, LogIn, Activity, CheckCircle2,
  UserX, ChevronDown, Download, Eye, EyeOff, ShieldCheck, Lock,
} from 'lucide-react'
import { router } from '@inertiajs/react'
import QRCode from 'qrcode'
import { DataTable, FixedDropdown } from '~/components/data-table'
import type { DTColumn, VisibilityState } from '~/components/data-table'
import { Modal } from '~/components/modal'
import { SelectSearch } from '~/components/select-search'
import { DatePicker } from '~/components/date-picker'
import { Checkbox } from '~/components/checkbox'
import { PhoneInput } from '~/components/phone-input'
import type { CountryOption } from '~/components/country-select'
import type { Org, OrgUser } from './types'
import { safeDate, avColor, initials } from './data'
import { RolesTab } from './RolesTab'

// ── Constants ─────────────────────────────────────────────────────────────────

const USER_TABS = [
  { key: 'list',  label: 'User List' },
  { key: 'roles', label: 'Roles & Profiles' },
]

const COLS_KEY    = 'tf-org-users-cols-v1'
const PP_OPTIONS  = [10, 25, 50, 100]

type BulkConfirm = { op: 'activate' | 'deactivate'; count: number } | null

interface Props { org: Org }

// ── Blank form ─────────────────────────────────────────────────────────────────

/** Generates next sequential employee code: EMP00001, EMP00002, … */
function nextEmployeeCode(users: { employeeCode: string | null }[]): string {
  let max = 0
  for (const u of users) {
    const m = u.employeeCode?.match(/^EMP(\d+)$/i)
    if (m) { const n = parseInt(m[1], 10); if (n > max) max = n }
  }
  return `EMP${String(max + 1).padStart(5, '0')}`
}

const BLANK_FORM = {
  fullName: '', companyEmail: '', password: '',
  employeeCode: '', phone: '', gender: '',
  dateOfBirth: '', sendWelcomeMail: false, isActive: true,
  profileId: '',
}

// ── Root component ─────────────────────────────────────────────────────────────

export function UsersTab({ org }: Props) {
  const [subTab, setSubTab] = useState<'list' | 'roles'>('list')

  const tabSegRef  = useRef<HTMLDivElement>(null)
  const tabBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [slider, setSlider] = useState({ left: 0, width: 0, ready: false })
  useLayoutEffect(() => {
    const seg = tabSegRef.current
    const btn = tabBtnRefs.current[subTab]
    if (!seg || !btn) return
    const sr = seg.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setSlider({ left: br.left - sr.left, width: br.width, ready: true })
  }, [subTab])

  return (
    <div className="card">
      {/* ── Inner sub-tab bar ── */}
      <div className="tab-bar" style={{ borderTop: 'none' }}>
        <div ref={tabSegRef} className="tab-seg">
          <div style={{
            position: 'absolute', top: 3, bottom: 3,
            left: slider.left, width: slider.width,
            background: 'var(--surface)', borderRadius: 7,
            boxShadow: '0 1px 4px rgba(0,0,0,.1)',
            transition: slider.ready ? 'left .22s cubic-bezier(.4,0,.2,1), width .22s cubic-bezier(.4,0,.2,1)' : 'none',
            opacity: slider.ready ? 1 : 0,
            pointerEvents: 'none', zIndex: 0,
          }} />
          {USER_TABS.map((t) => (
            <button
              key={t.key}
              ref={(el) => { tabBtnRefs.current[t.key] = el }}
              className={`tab-btn${subTab === t.key ? ' active' : ''}`}
              onClick={() => setSubTab(t.key as 'list' | 'roles')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {subTab === 'list'  && <UserListTab org={org} />}
      {subTab === 'roles' && <RolesTab org={org} />}
    </div>
  )
}

// ── User List Tab ─────────────────────────────────────────────────────────────

function UserListTab({ org }: { org: Org }) {
  const users    = org.orgUsers || []
  const profiles = org.profiles || []

  // Org country (for phone prefix)
  const [orgCountry, setOrgCountry] = useState<CountryOption | null>(null)
  useEffect(() => {
    if (!org.country) return
    fetch(`/api/countries?search=${encodeURIComponent(org.country)}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: CountryOption[]) => {
        const match = data.find((c) => c.name.toLowerCase() === org.country!.toLowerCase())
        if (match) setOrgCountry(match)
      })
      .catch(() => {})
  }, [org.country])

  // Loading
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const rmStart  = router.on('start',  () => setIsLoading(true))
    const rmFinish = router.on('finish', () => setIsLoading(false))
    return () => { rmStart(); rmFinish() }
  }, [])

  // Search & filter
  const [search,       setSearch]       = useState('')
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterProfile, setFilterProfile] = useState('')

  // Per-page
  const [perPage,    setPerPage]    = useState(10)
  const [ppOpen,     setPpOpen]     = useState(false)
  const ppBtnRef = useRef<HTMLButtonElement>(null)

  // Column visibility
  const [colVis,     setColVis]     = useState<VisibilityState>(() => {
    try { const s = localStorage.getItem(COLS_KEY); if (s) return JSON.parse(s) } catch {}
    return {}
  })
  const [colVisOpen, setColVisOpen] = useState(false)

  // Selection & bulk
  const [selected,    setSelected]    = useState<number[]>([])
  const [bulkConfirm, setBulkConfirm] = useState<BulkConfirm>(null)

  // Add User
  const [addOpen,   setAddOpen]   = useState(false)
  const [addForm,   setAddForm]   = useState(BLANK_FORM)
  const [showAddPw, setShowAddPw] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  // Edit User
  const [editUser,    setEditUser]    = useState<OrgUser | null>(null)
  const [editForm,    setEditForm]    = useState({ ...BLANK_FORM, password: '' })
  const [showEditPw,  setShowEditPw]  = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  // QR (single)
  const [qrUser,    setQrUser]    = useState<OrgUser | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  // QR (bulk)
  const [bulkQrOpen,    setBulkQrOpen]    = useState(false)
  const [bulkQrUrls,    setBulkQrUrls]    = useState<{ user: OrgUser; url: string }[]>([])
  const [bulkQrLoading, setBulkQrLoading] = useState(false)

  const filterBtnRef = useRef<HTMLButtonElement>(null)
  const colVisBtnRef = useRef<HTMLButtonElement>(null)

  // ── Generate single QR ────────────────────────────────────────────────────

  useEffect(() => {
    if (!qrUser) { setQrDataUrl(null); return }
    setQrLoading(true)
    const payload = JSON.stringify({ userId: qrUser.id, email: qrUser.companyEmail, code: qrUser.employeeCode || '' })
    QRCode.toDataURL(payload, { width: 240, margin: 2, color: { dark: '#18181b', light: '#ffffff' } })
      .then((url) => { setQrDataUrl(url); setQrLoading(false) })
      .catch(() => { setQrDataUrl(null); setQrLoading(false) })
  }, [qrUser])

  // ── Generate bulk QR ──────────────────────────────────────────────────────

  async function openBulkQr() {
    const targets = selected.length > 0 ? users.filter((u) => selected.includes(u.id)) : filtered
    if (!targets.length) return
    setBulkQrLoading(true)
    setBulkQrOpen(true)
    const results = await Promise.all(
      targets.map(async (u) => {
        const payload = JSON.stringify({ userId: u.id, email: u.companyEmail, code: u.employeeCode || '' })
        const url = await QRCode.toDataURL(payload, { width: 180, margin: 2, color: { dark: '#18181b', light: '#ffffff' } })
        return { user: u, url }
      })
    )
    setBulkQrUrls(results)
    setBulkQrLoading(false)
  }

  // ── Filtered data ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (filterStatus === 'active'   && !u.isActive) return false
      if (filterStatus === 'inactive' && u.isActive)  return false
      if (filterProfile && String(u.profileId) !== filterProfile) return false
      if (!q) return true
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.companyEmail.toLowerCase().includes(q) ||
        (u.employeeCode || '').toLowerCase().includes(q)
      )
    })
  }, [users, search, filterStatus, filterProfile])

  const activeFilterCount = [filterStatus, filterProfile].filter(Boolean).length
  const hasActiveFilters  = activeFilterCount > 0
  function clearFilters() { setFilterStatus(''); setFilterProfile('') }

  // ── Profile options ───────────────────────────────────────────────────────

  const profileOptions = [
    { value: '', label: 'All Profiles' },
    ...profiles.map((p) => ({ value: String(p.id), label: p.name })),
  ]

  function profileLabel(u: OrgUser): string | null {
    if (!u.profileId) return null
    return profiles.find((p) => p.id === u.profileId)?.name ?? null
  }

  // ── Save col visibility ────────────────────────────────────────────────────

  function saveColVis(next: VisibilityState) {
    setColVis(next)
    try { localStorage.setItem(COLS_KEY, JSON.stringify(next)) } catch {}
  }

  // ── Add User ──────────────────────────────────────────────────────────────

  function openAddUser() {
    setAddForm({ ...BLANK_FORM, employeeCode: nextEmployeeCode(users) })
    setAddOpen(true)
  }

  function handleAddUser() {
    if (!addForm.fullName.trim() || !addForm.companyEmail.trim() || !addForm.password.trim()) return
    setAddLoading(true)
    router.post(`/orgbuilder/organizations/${org.id}/users`, {
      fullName:        addForm.fullName.trim(),
      companyEmail:    addForm.companyEmail.trim(),
      password:        addForm.password,
      employeeCode:    addForm.employeeCode.trim() || undefined,
      phone:           addForm.phone.trim() || undefined,
      gender:          addForm.gender || undefined,
      dateOfBirth:     addForm.dateOfBirth || undefined,
      sendWelcomeMail: addForm.sendWelcomeMail,
      isActive:        addForm.isActive,
      profileId:       addForm.profileId || undefined,
    }, {
      onSuccess: () => { setAddOpen(false); setAddForm(BLANK_FORM); setAddLoading(false) },
      onError:   () => setAddLoading(false),
    })
  }

  // ── Edit User ─────────────────────────────────────────────────────────────

  function openEditUser(u: OrgUser) {
    setEditUser(u)
    setEditForm({
      fullName:        u.fullName,
      companyEmail:    u.companyEmail,
      password:        '',
      employeeCode:    u.employeeCode || '',
      phone:           u.phone || '',
      gender:          u.gender || '',
      dateOfBirth:     u.dateOfBirth || '',
      sendWelcomeMail: false,
      isActive:        u.isActive,
      profileId:       u.profileId ? String(u.profileId) : '',
    })
    setShowEditPw(false)
  }

  function handleEditUser() {
    if (!editUser || !editForm.fullName.trim()) return
    setEditLoading(true)
    router.put(`/orgbuilder/organizations/${org.id}/users/${editUser.id}`, {
      fullName:     editForm.fullName.trim(),
      employeeCode: editForm.employeeCode || undefined,
      phone:        editForm.phone.trim() || undefined,
      gender:       editForm.gender || undefined,
      dateOfBirth:  editForm.dateOfBirth || undefined,
      isActive:     editForm.isActive,
      password:     editForm.password.trim() || undefined,
      profileId:    editForm.profileId || undefined,
    }, {
      onSuccess: () => { setEditUser(null); setEditLoading(false) },
      onError:   () => setEditLoading(false),
    })
  }

  // ── Login as user (impersonation) ─────────────────────────────────────────

  async function loginAsUser(userId: number) {
    const xsrf = decodeURIComponent(document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? '')
    const res = await fetch(`/orgbuilder/organizations/${org.id}/users/${userId}/impersonate`, {
      method: 'POST',
      headers: { 'X-XSRF-TOKEN': xsrf, 'Accept': 'application/json' },
    })
    if (!res.ok) return
    const { redirectUrl } = await res.json()
    window.open(redirectUrl, '_blank')
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────

  function handleBulkDirect(op: 'activate' | 'deactivate') {
    if (!selected.length) return
    router.post(`/orgbuilder/organizations/${org.id}/users/bulk`, { ids: selected, operation: op }, {
      onSuccess: () => { setSelected([]); setBulkConfirm(null) },
      onError:   () => setBulkConfirm(null),
    })
  }

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: DTColumn<OrgUser>[] = [
    {
      key: 'user', label: 'User', pinned: true, minWidth: 200,
      render: (u) => {
        const [fg, bg] = avColor(u.fullName)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: bg, color: fg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.66rem', fontWeight: 800,
            }}>
              {initials(u.fullName)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)', lineHeight: 1.3 }}>{u.fullName}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>{u.companyEmail}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'employeeCode', label: 'Employee Code',
      render: (u) => u.employeeCode
        ? <span className="bx bx-gray bx-no-dot" style={{ fontFamily: 'monospace', fontSize: '.78rem' }}>{u.employeeCode}</span>
        : <span style={{ color: 'var(--text4)' }}>—</span>,
    },
    {
      key: 'roleProfile', label: 'Role / Profile', sortable: false,
      render: (u) => {
        const label = profileLabel(u)
        return label
          ? <span className="bdg bdg-blue" style={{ fontSize: '.72rem' }}><ShieldCheck size={10} style={{ marginRight: 3 }} />{label}</span>
          : <span style={{ fontSize: '.75rem', color: 'var(--text4)', fontStyle: 'italic' }}>Not assigned</span>
      },
    },
    {
      key: 'department', label: 'Department', sortable: false,
      render: () => <span style={{ fontSize: '.75rem', color: 'var(--text4)', fontStyle: 'italic' }}>Not assigned</span>,
    },
    {
      key: 'joined', label: 'Joined', sortable: false,
      render: (u) => <span style={{ fontSize: '.8rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{safeDate(u.createdAt)}</span>,
    },
    {
      key: 'status', label: 'Status', sortable: false,
      render: (u) => (
        <span className={`bdg ${u.isActive ? 'bdg-green' : 'bdg-gray'}`}>
          <span className="bdg-dot" />
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions', sortable: false, pinned: true, width: 128,
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button
            title="Edit user"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer', transition: 'var(--t)' }}
            onClick={() => openEditUser(u)}
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            title="Generate QR"
            style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 6px', borderRadius: 7, color: 'var(--text3)', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', transition: 'var(--t)' }}
            onClick={() => setQrUser(u)}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#6366f1'; b.style.borderColor = '#c7d2fe'; b.style.background = '#eef2ff' }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--text3)'; b.style.borderColor = 'var(--border)'; b.style.background = 'transparent' }}
          >
            <QrCode size={13} />
          </button>
          <button
            title="Direct login"
            style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 6px', borderRadius: 7, color: 'var(--text3)', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', transition: 'var(--t)' }}
            onClick={() => loginAsUser(u.id)}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#10b981'; b.style.borderColor = '#a7f3d0'; b.style.background = '#ecfdf5' }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'var(--text3)'; b.style.borderColor = 'var(--border)'; b.style.background = 'transparent' }}
          >
            <LogIn size={13} />
          </button>
        </div>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Header ── */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text2)' }}>
          {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </span>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-p btn-sm"
          style={{ height: 34, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => { setShowAddPw(false); openAddUser() }}
        >
          <Plus size={13} /> Add User
        </button>
      </div>

      {/* ── Bulk action bar ── */}
      <div className={`bulk-bar${selected.length > 0 ? ' open' : ''}`}>
        <div style={{
          background: 'linear-gradient(90deg, var(--p), var(--p-dk))',
          padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '.8rem', marginRight: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 20, padding: '1px 8px', fontSize: '.76rem' }}>{selected.length}</span>
            selected
          </span>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}
            onClick={() => setBulkConfirm({ op: 'activate', count: selected.length })}>
            <CheckCircle2 size={12} /> Activate
          </button>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}
            onClick={() => setBulkConfirm({ op: 'deactivate', count: selected.length })}>
            <UserX size={12} /> Deactivate
          </button>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}
            onClick={openBulkQr}>
            <QrCode size={12} /> Generate QR
          </button>
          <button
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px 6px', display: 'flex', marginLeft: 'auto' }}
            onClick={() => setSelected([])} title="Clear selection"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div className="sb-inp" style={{ flex: 1, minWidth: 160, maxWidth: 280 }}>
          <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or code…" />
          {search && <button type="button" onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--text3)' }} /></button>}
        </div>
        <button
          ref={filterBtnRef}
          className="btn btn-ghost"
          onClick={() => setFilterOpen((v) => !v)}
          style={{ height: 36, padding: '0 14px', fontSize: '.8rem', border: `1px solid ${hasActiveFilters ? 'var(--p)' : 'var(--border)'}`, color: hasActiveFilters ? 'var(--p)' : undefined, background: hasActiveFilters ? 'var(--p-lt)' : undefined }}
        >
          <Filter size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 17, height: 17, background: 'var(--p)', color: '#fff', borderRadius: '50%', fontSize: '.6rem', fontWeight: 800, lineHeight: 1 }}>
              {activeFilterCount}
            </span>
          )}
        </button>
        <button
          ref={colVisBtnRef}
          className="btn btn-ghost"
          onClick={() => setColVisOpen((v) => !v)}
          style={{ height: 36, padding: '0 12px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${colVisOpen ? 'var(--p)' : 'var(--border)'}`, color: colVisOpen ? 'var(--p)' : undefined, background: colVisOpen ? 'var(--p-lt)' : undefined }}
        >
          <SlidersHorizontal size={13} /> Columns
        </button>
        <button
          className="btn btn-ghost" title="Refresh" onClick={() => router.reload()}
          style={{ height: 36, padding: '0 12px', fontSize: '.8rem', border: '1px solid var(--border)' }}
        >
          <RefreshCw size={13} style={{ transition: 'transform .4s', transform: isLoading ? 'rotate(360deg)' : 'none' }} />
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 500 }}>Per page:</span>
          <button
            ref={ppBtnRef}
            className="btn btn-ghost"
            onClick={() => setPpOpen((v) => !v)}
            style={{ height: 36, padding: '0 10px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${ppOpen ? 'var(--p)' : 'var(--border)'}`, color: ppOpen ? 'var(--p)' : undefined, background: ppOpen ? 'var(--p-lt)' : undefined }}
          >
            {perPage}
            <ChevronDown size={12} style={{ color: 'var(--text3)', transform: ppOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>
        </div>
      </div>

      {/* ── DataTable ── */}
      <DataTable<OrgUser>
        data={filtered}
        columns={columns}
        rowKey={(u) => u.id}
        selected={selected}
        onSelect={(ids) => setSelected(ids as number[])}
        hideToolbar
        loading={isLoading}
        clientPageSize={perPage}
        columnVisibility={colVis}
        onColumnVisibilityChange={(vis) => saveColVis(vis as VisibilityState)}
        emptyIcon={<Users size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
        emptyTitle="No users found"
        emptyDesc="Try adjusting your search or filters."
        noun="users"
      />

      {/* ── Filter panel ── */}
      <FixedDropdown anchorRef={filterBtnRef} open={filterOpen} onClose={() => setFilterOpen(false)} minWidth={270} align="left" noPadding>
        <div style={{ width: 270 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--text1)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={13} style={{ color: 'var(--p)' }} /> Filters
            </div>
            {hasActiveFilters && <button onClick={clearFilters} style={{ fontSize: '.72rem', color: 'var(--p)', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none', padding: '2px 6px', borderRadius: 5 }}>Reset all</button>}
          </div>
          <div style={{ padding: '14px 16px 0' }}>
            <div className="fg" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Activity size={11} /> Status
              </label>
              <SelectSearch value={filterStatus} onChange={setFilterStatus} options={[{ value: '', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} placeholder="All statuses" />
            </div>
            <div className="fg" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <ShieldCheck size={11} /> Profile
              </label>
              <SelectSearch value={filterProfile} onChange={setFilterProfile} options={profileOptions} placeholder="All profiles" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 14px', marginTop: 4, borderTop: '1px solid var(--border)' }}>
            <button onClick={() => { clearFilters(); setFilterOpen(false) }} style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none', padding: '6px 4px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text1)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
            >Clear all</button>
            <button className="btn btn-p btn-sm" style={{ minWidth: 90 }} onClick={() => setFilterOpen(false)}>Apply</button>
          </div>
        </div>
      </FixedDropdown>

      {/* ── Columns dropdown ── */}
      <FixedDropdown anchorRef={colVisBtnRef} open={colVisOpen} onClose={() => setColVisOpen(false)} minWidth={192} align="right">
        <div style={{ padding: '8px 12px 6px', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
          Toggle columns
        </div>
        {columns.filter((c) => !c.pinned).map((c) => {
          const on = colVis[c.key] !== false
          return (
            <button key={c.key} className="drop-item" style={{ padding: '7px 12px' }}
              onClick={() => saveColVis(on ? { ...colVis, [c.key]: false } : (() => { const n = { ...colVis }; delete n[c.key]; return n })())}
            >
              <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${on ? 'var(--p)' : 'var(--border2)'}`, background: on ? 'var(--p)' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s, border-color .15s' }}>
                {on && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </span>
              {c.label}
            </button>
          )
        })}
      </FixedDropdown>

      {/* ── Per-page dropdown ── */}
      <FixedDropdown anchorRef={ppBtnRef} open={ppOpen} onClose={() => setPpOpen(false)} minWidth={140} align="right">
        <div style={{ padding: '8px 12px 6px', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
          Rows per page
        </div>
        {PP_OPTIONS.map((n) => {
          const active = n === perPage
          return (
            <button key={n} className="drop-item" style={{ padding: '7px 12px', color: active ? 'var(--p)' : undefined, fontWeight: active ? 700 : undefined }}
              onClick={() => { setPpOpen(false); setPerPage(n) }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `1.5px solid ${active ? 'var(--p)' : 'var(--border2)'}`, background: active ? 'var(--p)' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {active && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </span>
              {n} rows
            </button>
          )
        })}
      </FixedDropdown>

      {/* ═══════════════════════════════
          ADD USER MODAL
      ═══════════════════════════════ */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add User"
        size="md"
        icon={<Plus size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn btn-p" disabled={addLoading || !addForm.fullName.trim() || !addForm.companyEmail.trim() || !addForm.password.trim()} onClick={handleAddUser}>
              {addLoading ? 'Adding…' : <><Plus size={13} /> Add User</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label>Full Name <span className="req">*</span></label>
              <input className="fi" value={addForm.fullName} onChange={(e) => setAddForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="e.g. Ravi Kumar" />
            </div>
            <div className="fg">
              <label>Company Email <span className="req">*</span></label>
              <input className="fi" type="email" value={addForm.companyEmail} onChange={(e) => setAddForm((f) => ({ ...f, companyEmail: e.target.value }))} placeholder="ravi@acme.com" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label>Employee Code</label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none', zIndex: 1 }} />
                <input className="fi" value={addForm.employeeCode} readOnly style={{ paddingLeft: 30, background: 'var(--bg)', color: 'var(--text2)', cursor: 'not-allowed', fontFamily: 'monospace', letterSpacing: '.08em', fontWeight: 700 }} />
              </div>
              <div className="fg-hint">Auto-generated · sequential · read-only</div>
            </div>
            <div className="fg">
              <label>Password <span className="req">*</span></label>
              <div style={{ position: 'relative' }}>
                <input className="fi" type={showAddPw ? 'text' : 'password'} value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" style={{ paddingRight: 38 }} />
                <button type="button" onClick={() => setShowAddPw((v) => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}>
                  {showAddPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label>Profile / Role</label>
              <SelectSearch
                value={addForm.profileId}
                onChange={(v) => setAddForm((f) => ({ ...f, profileId: v }))}
                options={[{ value: '', label: 'No profile' }, ...profiles.map((p) => ({ value: String(p.id), label: p.name }))]}
                placeholder="Select profile"
              />
            </div>
            <div className="fg">
              <label>Gender</label>
              <SelectSearch value={addForm.gender} onChange={(v) => setAddForm((f) => ({ ...f, gender: v }))}
                options={[{ value: '', label: 'Not specified' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
                placeholder="Select gender"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label>Phone</label>
              <PhoneInput value={addForm.phone} onChange={(v) => setAddForm((f) => ({ ...f, phone: v }))} phonecode={orgCountry?.phonecode} emoji={orgCountry?.emoji} />
            </div>
            <div className="fg">
              <label>Date of Birth</label>
              <DatePicker value={addForm.dateOfBirth} onChange={(v) => setAddForm((f) => ({ ...f, dateOfBirth: v }))} placeholder="Select date of birth" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Checkbox checked={addForm.isActive} onChange={() => setAddForm((f) => ({ ...f, isActive: !f.isActive }))}>Active</Checkbox>
            <Checkbox checked={addForm.sendWelcomeMail} onChange={() => setAddForm((f) => ({ ...f, sendWelcomeMail: !f.sendWelcomeMail }))}>Send welcome email</Checkbox>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════
          EDIT USER MODAL
      ═══════════════════════════════ */}
      <Modal
        open={editUser !== null}
        onClose={() => setEditUser(null)}
        title="Edit User"
        size="md"
        icon={<Pencil size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
            <button className="btn btn-p" disabled={editLoading || !editForm.fullName.trim()} onClick={handleEditUser}>
              {editLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label>Employee Code</label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none', zIndex: 1 }} />
                <input className="fi" value={editForm.employeeCode} readOnly style={{ paddingLeft: 30, background: 'var(--bg)', color: 'var(--text2)', cursor: 'not-allowed', fontFamily: 'monospace', letterSpacing: '.08em', fontWeight: 700 }} />
              </div>
              <div className="fg-hint">Read-only · assigned at creation</div>
            </div>
            <div className="fg">
              <label>Full Name <span className="req">*</span></label>
              <input className="fi" value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label>Company Email</label>
              <input className="fi" value={editForm.companyEmail} disabled style={{ opacity: .6, cursor: 'not-allowed' }} />
            </div>
            <div className="fg">
              <label>New Password <span style={{ fontSize: '.7rem', color: 'var(--text4)' }}>(blank = unchanged)</span></label>
              <div style={{ position: 'relative' }}>
                <input className="fi" type={showEditPw ? 'text' : 'password'} value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} placeholder="New password…" style={{ paddingRight: 38 }} />
                <button type="button" onClick={() => setShowEditPw((v) => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}>
                  {showEditPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label>Profile / Role</label>
              <SelectSearch
                value={editForm.profileId}
                onChange={(v) => setEditForm((f) => ({ ...f, profileId: v }))}
                options={[{ value: '', label: 'No profile' }, ...profiles.map((p) => ({ value: String(p.id), label: p.name }))]}
                placeholder="Select profile"
              />
            </div>
            <div className="fg">
              <label>Gender</label>
              <SelectSearch value={editForm.gender} onChange={(v) => setEditForm((f) => ({ ...f, gender: v }))}
                options={[{ value: '', label: 'Not specified' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
                placeholder="Select gender"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fg">
              <label>Phone</label>
              <PhoneInput value={editForm.phone} onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))} phonecode={orgCountry?.phonecode} emoji={orgCountry?.emoji} />
            </div>
            <div className="fg">
              <label>Date of Birth</label>
              <DatePicker value={editForm.dateOfBirth} onChange={(v) => setEditForm((f) => ({ ...f, dateOfBirth: v }))} placeholder="Select date of birth" />
            </div>
          </div>
          <Checkbox checked={editForm.isActive} onChange={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}>Active</Checkbox>
        </div>
      </Modal>

      {/* ═══════════════════════════════
          SINGLE QR MODAL (enhanced)
      ═══════════════════════════════ */}
      <Modal
        open={qrUser !== null}
        onClose={() => setQrUser(null)}
        title="User QR Code"
        size="sm"
        icon={<QrCode size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setQrUser(null)}>Close</button>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`qr-${qrUser?.employeeCode || qrUser?.id}.png`}
                className="btn btn-p"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <Download size={13} /> Download PNG
              </a>
            )}
          </>
        }
      >
        {qrUser && (
          <div>
            {/* User info banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg2)', borderRadius: 10, marginBottom: 20, border: '1px solid var(--border)' }}>
              {(() => {
                const [fg, bg] = avColor(qrUser.fullName)
                return (
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 800, flexShrink: 0 }}>
                    {initials(qrUser.fullName)}
                  </div>
                )
              })()}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text1)' }}>{qrUser.fullName}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 2 }}>{qrUser.companyEmail}</div>
                {qrUser.employeeCode && (
                  <span className="bx bx-gray bx-no-dot" style={{ fontFamily: 'monospace', fontSize: '.7rem', marginTop: 4, display: 'inline-block' }}>{qrUser.employeeCode}</span>
                )}
              </div>
            </div>

            {/* QR area */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {qrLoading ? (
                <div style={{ width: 240, height: 240, background: 'var(--bg2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '.8rem', color: 'var(--text4)' }}>Generating…</span>
                </div>
              ) : qrDataUrl ? (
                <div style={{ padding: 12, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.1)', border: '1px solid var(--border)' }}>
                  <img src={qrDataUrl} alt="QR Code" style={{ width: 216, height: 216, display: 'block', imageRendering: 'pixelated' }} />
                </div>
              ) : (
                <div style={{ width: 240, height: 240, background: 'var(--bg2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '.8rem', color: '#ef4444' }}>Failed to generate QR.</span>
                </div>
              )}
              <span style={{ fontSize: '.72rem', color: 'var(--text4)', textAlign: 'center' }}>
                Scan to identify this user in the system
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════
          BULK QR MODAL
      ═══════════════════════════════ */}
      <Modal
        open={bulkQrOpen}
        onClose={() => { setBulkQrOpen(false); setBulkQrUrls([]) }}
        title={bulkQrLoading ? 'Generating QR Codes…' : `QR Codes — ${bulkQrUrls.length} user${bulkQrUrls.length !== 1 ? 's' : ''}`}
        size="md"
        icon={<QrCode size={15} />}
        footer={
          <button className="btn btn-ghost" onClick={() => { setBulkQrOpen(false); setBulkQrUrls([]) }}>Close</button>
        }
      >
        {bulkQrLoading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <QrCode size={36} style={{ color: 'var(--text4)', opacity: .4, margin: '0 auto 12px' }} />
            <div style={{ fontSize: '.82rem', color: 'var(--text4)' }}>Generating QR codes…</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, maxHeight: 460, overflowY: 'auto', padding: 4 }}>
            {bulkQrUrls.map(({ user, url }) => {
              const [fg, bg] = avColor(user.fullName)
              return (
                <div key={user.id} style={{ textAlign: 'center', padding: '14px 10px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ padding: 8, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                    <img src={url} alt="QR" style={{ width: 120, height: 120, imageRendering: 'pixelated', display: 'block' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.55rem', fontWeight: 800, flexShrink: 0 }}>
                      {initials(user.fullName)}
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{user.fullName}</div>
                      {user.employeeCode && <div style={{ fontSize: '.66rem', color: 'var(--text3)', fontFamily: 'monospace' }}>{user.employeeCode}</div>}
                    </div>
                  </div>
                  <a
                    href={url}
                    download={`qr-${user.employeeCode || user.id}.png`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.7rem', color: 'var(--p)', textDecoration: 'none', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--p-lt)', border: '1px solid var(--p-mid)' }}
                  >
                    <Download size={10} /> Download
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════
          BULK CONFIRM MODAL
      ═══════════════════════════════ */}
      <Modal
        open={bulkConfirm !== null}
        onClose={() => setBulkConfirm(null)}
        title={bulkConfirm?.op === 'activate' ? 'Activate Users' : 'Deactivate Users'}
        size="sm"
        icon={bulkConfirm?.op === 'activate' ? <CheckCircle2 size={15} /> : <UserX size={15} />}
        variant={bulkConfirm?.op === 'activate' ? 'default' : 'warning'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setBulkConfirm(null)}>Cancel</button>
            <button
              className={`btn ${bulkConfirm?.op === 'activate' ? 'btn-p' : 'btn-warn'}`}
              onClick={() => bulkConfirm && handleBulkDirect(bulkConfirm.op)}
            >
              {bulkConfirm?.op === 'activate'
                ? <><CheckCircle2 size={13} /> Activate</>
                : <><UserX size={13} /> Deactivate</>}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
          {bulkConfirm?.op === 'activate'
            ? <>Activate <strong style={{ color: 'var(--text1)' }}>{bulkConfirm?.count}</strong> user{bulkConfirm?.count !== 1 ? 's' : ''}? They will regain access to this organization.</>
            : <>Deactivate <strong style={{ color: 'var(--text1)' }}>{bulkConfirm?.count}</strong> user{bulkConfirm?.count !== 1 ? 's' : ''}? They will lose access until reactivated.</>
          }
        </p>
      </Modal>
    </>
  )
}
