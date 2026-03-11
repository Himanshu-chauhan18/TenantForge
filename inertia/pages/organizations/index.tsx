import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { DateTime } from 'luxon'
import { router } from '@inertiajs/react'
import {
  Building2, Plus, Search, Download,
  Pencil, Trash2, X, RefreshCw, Filter, Users, MapPin, Globe,
  SlidersHorizontal, ChevronDown, AlertTriangle, CheckCircle2, Archive, ArchiveRestore,
  Activity,
} from 'lucide-react'
import { Link } from '@inertiajs/react'
import { SelectSearch } from '~/components/select-search'
import { DatePicker } from '~/components/date-picker'
import { DataTable, FixedDropdown } from '~/components/data-table'
import type { DTColumn, DTPagination, VisibilityState } from '~/components/data-table'
import { Modal } from '~/components/modal'

const COLS_STORAGE_KEY = 'tf-org-cols-v3'
const PP_OPTIONS = [10, 25, 50, 100]

// ── Types ─────────────────────────────────────────────────────────────────────

interface Org {
  id: number
  orgId: string
  name: string
  planType: 'trial' | 'premium'
  status: 'active' | 'inactive' | 'expired'
  userLimit: number
  userCount: number
  logo: string | null
  planStart: string | null
  planEnd: string | null
  createdAt: string
  isArchived: boolean
  country?: string
  city?: string
  leadOwner: { id: number; name: string; email: string; designation?: string | null } | null
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

interface OrgsData {
  data: Org[]
  meta: PaginationMeta
}

interface LeadOwner {
  id: number
  name: string
  email: string
  designation?: string | null
}

export interface Props {
  orgs: OrgsData
  leadOwners: LeadOwner[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(val: string | null | undefined): string {
  if (!val || val.startsWith('0000')) return '—'
  const dt = DateTime.fromISO(val.includes('T') ? val : val + 'T00:00:00')
  return dt.isValid ? dt.toFormat('dd MMM yyyy') : '—'
}

function isExpired(planEnd: string | null): boolean {
  if (!planEnd || planEnd.startsWith('0000')) return false
  const dt = DateTime.fromISO(planEnd.includes('T') ? planEnd : planEnd + 'T00:00:00')
  return dt.isValid && dt < DateTime.now()
}

function isNearExpiry(planEnd: string | null): boolean {
  if (!planEnd || planEnd.startsWith('0000')) return false
  const dt = DateTime.fromISO(planEnd.includes('T') ? planEnd : planEnd + 'T00:00:00')
  if (!dt.isValid) return false
  const diff = dt.diff(DateTime.now(), 'milliseconds').milliseconds
  return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

const AV_COLORS: [string, string][] = [
  ['#6366f1', '#e0e7ff'], ['#0ea5e9', '#e0f2fe'], ['#10b981', '#d1fae5'],
  ['#f59e0b', '#fef3c7'], ['#ef4444', '#fee2e2'], ['#8b5cf6', '#ede9fe'],
  ['#ec4899', '#fce7f3'],
]
function avColor(name: string): [string, string] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AV_COLORS[h % AV_COLORS.length]
}
function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all',          label: 'All' },
  { key: 'paid',         label: 'Paid' },
  { key: 'trial',        label: 'Trial' },
  { key: 'unsubscribed', label: 'Unsubscribed' },
  { key: 'expired',      label: 'Expired' },
  { key: 'near_expiry',  label: 'Near Expiry' },
  { key: 'archived',     label: 'Archived' },
]

type BulkModal   = 'extend_plan' | 'extend_user_limit' | 'assign_lead' | null
type BulkConfirm = { op: 'activate' | 'deactivate' | 'archive' | 'unarchive'; count: number } | null

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrganizationsIndex({ orgs, leadOwners }: Props) {
  const { data: rows, meta } = orgs

  const url = new URL(window.location.href)
  const currentTab         = url.searchParams.get('tab')           || 'all'
  const currentSearch      = url.searchParams.get('search')         || ''
  const currentLeadOwner   = url.searchParams.get('lead_owner_id')  || ''
  const currentStatus      = url.searchParams.get('status')         || ''
  const currentCountry     = url.searchParams.get('country')        || ''
  const currentCity        = url.searchParams.get('city')           || ''
  const currentCreatedFrom = url.searchParams.get('created_from')   || ''
  const currentCreatedTo   = url.searchParams.get('created_to')     || ''
  const currentSortBy      = url.searchParams.get('sort_by')        || 'created_at'
  const currentSortDir     = url.searchParams.get('sort_dir')       || 'desc'

  const [search, setSearch]             = useState(currentSearch)
  const [selected, setSelected]         = useState<number[]>([])
  const [filterOpen, setFilterOpen]     = useState(false)
  const [deleteConfirm,   setDeleteConfirm]   = useState<number | null>(null)
  const [unarchiveConfirm, setUnarchiveConfirm] = useState<number | null>(null)
  const [bulkModal, setBulkModal]       = useState<BulkModal>(null)
  const [bulkConfirm, setBulkConfirm]   = useState<BulkConfirm>(null)
  const [extendDate, setExtendDate]     = useState('')
  const [extendLimit, setExtendLimit]   = useState('')
  const [assignLeadId, setAssignLeadId] = useState('')
  const [isLoading, setIsLoading]       = useState(false)

  // Filter panel local state
  const [filterLeadOwner, setFilterLeadOwner] = useState(currentLeadOwner)
  const [filterStatus,    setFilterStatus]    = useState(currentStatus)
  const [filterCountry,   setFilterCountry]   = useState(currentCountry)
  const [filterCity,      setFilterCity]       = useState(currentCity)

  const filterBtnRef = useRef<HTMLButtonElement>(null)

  // Track Inertia navigation for shimmer
  useEffect(() => {
    const removeStart  = router.on('start',  () => setIsLoading(true))
    const removeFinish = router.on('finish', () => setIsLoading(false))
    return () => { removeStart(); removeFinish() }
  }, [])

  // Column visibility (controlled — persisted here so we can render dropdown in page toolbar)
  const [colVis, setColVis] = useState<VisibilityState>(() => {
    try {
      const s = localStorage.getItem(COLS_STORAGE_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return {}
  })
  useEffect(() => {
    try { localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(colVis)) } catch {}
  }, [colVis])

  // Per-page and columns dropdown state (in page toolbar)
  const [ppOpen, setPpOpen]         = useState(false)
  const [colVisOpen, setColVisOpen] = useState(false)
  const ppBtnRef     = useRef<HTMLButtonElement>(null)
  const colVisBtnRef = useRef<HTMLButtonElement>(null)

  // Tab slider
  const tabSegRef  = useRef<HTMLDivElement>(null)
  const tabBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [slider, setSlider] = useState({ left: 0, width: 0, ready: false })
  useLayoutEffect(() => {
    const seg = tabSegRef.current
    const btn = tabBtnRefs.current[currentTab]
    if (!seg || !btn) return
    const sr = seg.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setSlider({ left: br.left - sr.left, width: br.width, ready: true })
  }, [currentTab])

  // Sync local filter state whenever URL params change (e.g. after tab switch, bulk op redirect)
  useEffect(() => { setSearch(currentSearch) }, [currentSearch])
  useEffect(() => {
    setFilterLeadOwner(currentLeadOwner)
    setFilterStatus(currentStatus)
    setFilterCountry(currentCountry)
    setFilterCity(currentCity)
  }, [currentLeadOwner, currentStatus, currentCountry, currentCity])

  // ── Navigation ──────────────────────────────────────────────────────
  function navigate(params: Record<string, string | number | undefined>) {
    const merged: Record<string, string | number | undefined> = {
      tab:          currentTab,
      search:       currentSearch,
      page:         1,
      lead_owner_id: currentLeadOwner,
      status:       currentStatus,
      country:      currentCountry,
      city:         currentCity,
      created_from: currentCreatedFrom,
      created_to:   currentCreatedTo,
      sort_by:      currentSortBy,
      sort_dir:     currentSortDir,
      per_page:     meta.perPage,
      ...params,
    }
    const p: Record<string, string> = {}
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) p[k] = String(v)
    })
    router.get('/organizations', p, { preserveState: true, replace: true })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ search, page: 1 })
  }

  function handleTab(key: string) {
    setSelected([])
    navigate({ tab: key, search: '', lead_owner_id: '', status: '', country: '', city: '', created_from: '', created_to: '', page: 1 })
  }

  function handleFromChange(val: string) { navigate({ created_from: val, page: 1 }) }
  function handleToChange(val: string)   { navigate({ created_to: val,   page: 1 }) }

  function applyFilters() {
    navigate({ lead_owner_id: filterLeadOwner, status: filterStatus, country: filterCountry, city: filterCity, page: 1 })
    setFilterOpen(false)
  }

  function clearFilters() {
    setFilterLeadOwner(''); setFilterStatus(''); setFilterCountry(''); setFilterCity('')
    navigate({ lead_owner_id: '', status: '', country: '', city: '', page: 1 })
    setFilterOpen(false)
  }

  const hasActiveFilters  = !!(currentLeadOwner || currentStatus || currentCountry || currentCity)
  const activeFilterCount = [currentLeadOwner, currentStatus, currentCountry, currentCity].filter(Boolean).length

  // ── Export CSV — computed as a plain href so no JS runs on click ──────
  const exportUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (currentTab)         params.set('tab',          currentTab)
    if (currentSearch)      params.set('search',        currentSearch)
    if (currentLeadOwner)   params.set('lead_owner_id', currentLeadOwner)
    if (currentCountry)     params.set('country',       currentCountry)
    if (currentCity)        params.set('city',          currentCity)
    if (currentCreatedFrom) params.set('created_from',  currentCreatedFrom)
    if (currentCreatedTo)   params.set('created_to',    currentCreatedTo)
    return `/organizations/export?${params.toString()}`
  }, [currentTab, currentSearch, currentLeadOwner, currentCountry, currentCity, currentCreatedFrom, currentCreatedTo])

  // ── Bulk operations ────────────────────────────────────────────────────────
  function handleBulkDirect(op: string) {
    if (!selected.length) return
    router.post('/organizations/bulk', { ids: selected, operation: op }, {
      onSuccess: () => { setSelected([]); setBulkConfirm(null) },
    })
  }

  function submitExtendPlan() {
    if (!extendDate) return
    router.post('/organizations/bulk', { ids: selected, operation: 'extend_plan', payload: { planEnd: extendDate } }, {
      onSuccess: () => { setSelected([]); setBulkModal(null); setExtendDate('') },
    })
  }

  function submitExtendLimit() {
    const n = parseInt(extendLimit, 10)
    if (!n || n < 1) return
    router.post('/organizations/bulk', { ids: selected, operation: 'extend_user_limit', payload: { userLimit: n } }, {
      onSuccess: () => { setSelected([]); setBulkModal(null); setExtendLimit('') },
    })
  }

  function submitAssignLead() {
    if (!assignLeadId) return
    router.post('/organizations/bulk', { ids: selected, operation: 'assign_lead', payload: { leadOwnerId: Number(assignLeadId) } }, {
      onSuccess: () => { setSelected([]); setBulkModal(null); setAssignLeadId('') },
    })
  }

  function handleDelete(id: number) {
    router.delete(`/organizations/${id}`)
    setDeleteConfirm(null)
  }

  const pagination: DTPagination = {
    total:       meta.total,
    perPage:     meta.perPage,
    currentPage: meta.currentPage,
    lastPage:    meta.lastPage,
  }

  const leadOwnerOptions = [
    { value: '', label: 'All Lead Owners' },
    ...leadOwners.map((o) => ({ value: String(o.id), label: o.name, sub: o.designation || o.email })),
  ]

  // ── Column definitions ─────────────────────────────────────────────────────
  const columns: DTColumn<Org>[] = [
    {
      key: 'name',
      label: 'Organization',
      pinned: true,
      sortKey: 'name',
      minWidth: 220,
      render: (org) => {
        const [fg, bg] = avColor(org.name)
        return (
          <Link href={`/organizations/${org.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            {org.logo ? (
              <img
                src={`/${org.logo}`}
                alt={org.name}
                style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, objectFit: 'cover', border: '1px solid var(--border)' }}
              />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: bg, color: fg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.68rem', fontWeight: 800,
              }}>
                {initials(org.name)}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)', lineHeight: 1.3 }}>{org.name}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>{org.orgId}</div>
            </div>
          </Link>
        )
      },
    },
    {
      key: 'plan',
      label: 'Plan',
      sortable: false,
      render: (org) => (
        <span className={`bdg ${org.planType === 'premium' ? 'bdg-green' : 'bdg-blue'}`}>
          <span className="bdg-dot" />
          {org.planType === 'premium' ? 'Paid' : 'Trial'}
        </span>
      ),
    },
    {
      key: 'users',
      label: 'Users / Limit',
      sortable: false,
      minWidth: 130,
      render: (org) => {
        const count = Number(org.userCount ?? 0)
        const pct   = org.userLimit > 0 ? Math.min(100, Math.round((count / org.userLimit) * 100)) : 0
        const over  = count > org.userLimit
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={11} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 72 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: '.72rem', fontWeight: 600, color: over ? '#ef4444' : 'var(--text2)' }}>
                  {count} / {org.userLimit}
                </span>
                <span style={{ fontSize: '.66rem', color: 'var(--text3)' }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, width: `${pct}%`,
                  background: over ? '#ef4444' : pct > 80 ? '#f59e0b' : 'var(--p)',
                  transition: 'width .3s',
                }} />
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'planStart',
      label: 'Plan Start',
      sortKey: 'plan_start',
      render: (org) => <span style={{ fontSize: '.8rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{fmtDate(org.planStart)}</span>,
    },
    {
      key: 'planEnd',
      label: 'Plan End',
      sortKey: 'plan_end',
      render: (org) => {
        const expired = isExpired(org.planEnd)
        const near    = isNearExpiry(org.planEnd)
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '.8rem', color: expired ? '#ef4444' : near ? '#f59e0b' : 'var(--text3)', fontWeight: (expired || near) ? 600 : undefined }}>
              {fmtDate(org.planEnd)}
            </span>
            {near    && <span className="bdg bdg-yellow" style={{ padding: '1px 6px', fontSize: '.6rem' }}>Soon</span>}
            {expired && <span className="bdg bdg-red"    style={{ padding: '1px 6px', fontSize: '.6rem' }}>Expired</span>}
          </span>
        )
      },
    },
    {
      key: 'leadOwner',
      label: 'Lead Owner',
      sortable: false,
      render: (org) => {
        if (!org.leadOwner) return <span style={{ color: 'var(--text4)', fontSize: '.8rem' }}>—</span>
        const name = org.leadOwner.name || org.leadOwner.email
        const [fg, bg] = avColor(name)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 800, flexShrink: 0 }}>
              {initials(name)}
            </div>
            <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{name}</span>
          </div>
        )
      },
    },
    {
      key: 'country',
      label: 'Country',
      sortable: false,
      render: (org) => org.country
        ? <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{org.country}</span>
        : <span style={{ color: 'var(--text4)', fontSize: '.8rem' }}>—</span>,
    },
    {
      key: 'city',
      label: 'City',
      sortable: false,
      render: (org) => org.city
        ? <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{org.city}</span>
        : <span style={{ color: 'var(--text4)', fontSize: '.8rem' }}>—</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      render: (org) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <span className={`bdg ${org.status === 'active' ? 'bdg-green' : org.status === 'expired' ? 'bdg-red' : 'bdg-gray'}`}>
            <span className="bdg-dot" />
            {org.status === 'active' ? 'Active' : org.status === 'expired' ? 'Expired' : 'Inactive'}
          </span>
          {!!org.isArchived && (
            <span className="bdg bdg-yellow">Archived</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortKey: 'created_at',
      render: (org) => <span style={{ fontSize: '.8rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{fmtDate(org.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      pinned: true,
      width: 90,
      render: (org) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {org.isArchived ? (
            <button
              title="Unarchive"
              onClick={() => setUnarchiveConfirm(org.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600,
                color: '#d97706', background: '#fef3c7',
                border: '1px solid #fde68a', cursor: 'pointer',
                transition: 'var(--t)',
              }}
            >
              <ArchiveRestore size={11} /> Unarchive
            </button>
          ) : (
            <Link
              href={`/organizations/${org.id}/edit`}
              title="Edit"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600,
                color: 'var(--p)', background: 'var(--p-lt)',
                border: '1px solid var(--p-mid)', textDecoration: 'none',
                transition: 'var(--t)',
              }}
            >
              <Pencil size={11} /> Edit
            </Link>
          )}
          <button
            onClick={() => setDeleteConfirm(org.id)}
            title="Delete"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '5px 6px', borderRadius: 7,
              color: 'var(--text3)', background: 'transparent',
              border: '1px solid var(--border)', cursor: 'pointer',
              transition: 'var(--t)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = '#ef4444'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#fecaca'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.06)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Page header ── */}
      <div className="ph">
        <div>
          <div className="ph-title">Organizations</div>
          <div className="ph-sub">{meta.total.toLocaleString()} total organizations</div>
        </div>
        <div className="ph-right">
          {/* Export CSV — plain anchor so no JS runs; avoids any repaint/flicker */}
          <a
            href={exportUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', height: 36, padding: '0 14px', textDecoration: 'none' }}
          >
            <Download size={13} />
            Export CSV
          </a>
          {/* Add Organization */}
          <Link
            href="/organizations/create"
            className="btn btn-p"
            style={{ height: 36, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px' }}
          >
            <Plus size={14} />
            Add Organization
          </Link>
        </div>
      </div>

      <div className="card">

        {/* ── Tabs ── */}
        <div className="tab-bar">
          <div ref={tabSegRef} className="tab-seg">
            {/* Sliding indicator */}
            <div style={{
              position: 'absolute',
              top: 3, bottom: 3,
              left: slider.left,
              width: slider.width,
              background: 'var(--surface)',
              borderRadius: 7,
              boxShadow: '0 1px 4px rgba(0,0,0,.1)',
              transition: slider.ready ? 'left .22s cubic-bezier(.4,0,.2,1), width .22s cubic-bezier(.4,0,.2,1)' : 'none',
              opacity: slider.ready ? 1 : 0,
              pointerEvents: 'none',
              zIndex: 0,
            }} />

            {TABS.map((t) => {
              const isActive = currentTab === t.key
              const accentColor =
                t.key === 'expired'     ? '#ef4444' :
                t.key === 'near_expiry' ? '#f59e0b' : undefined
              return (
                <button
                  key={t.key}
                  ref={(el) => { tabBtnRefs.current[t.key] = el }}
                  className={`tab-btn${isActive ? ' active' : ''}`}
                  style={accentColor ? { color: isActive ? accentColor : accentColor } : undefined}
                  onClick={() => handleTab(t.key)}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Bulk action bar (animated slide) ── */}
        <div className={`bulk-bar${selected.length > 0 ? ' open' : ''}`}>
          <div style={{
            background: 'linear-gradient(90deg, var(--p), var(--p-dk))',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '.8rem', marginRight: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 20, padding: '1px 8px', fontSize: '.76rem' }}>
                {selected.length}
              </span>
              selected
            </span>

            {([
              ['Extend Plan',  () => setBulkModal('extend_plan')],
              ['Set Limit',    () => setBulkModal('extend_user_limit')],
              ['Assign Lead',  () => setBulkModal('assign_lead')],
            ] as [string, () => void][]).map(([label, action]) => (
              <button
                key={label}
                className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,.18)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', backdropFilter: 'none' }}
                onClick={action}
              >
                {label}
              </button>
            ))}

            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)', margin: '0 4px', flexShrink: 0 }} />

            <button
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}
              onClick={() => setBulkConfirm({ op: 'activate', count: selected.length })}
            >
              <CheckCircle2 size={12} /> Activate
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}
              onClick={() => setBulkConfirm({ op: 'deactivate', count: selected.length })}
            >
              <X size={12} /> Deactivate
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}
              onClick={() => setBulkConfirm({ op: 'archive', count: selected.length })}
            >
              <Archive size={12} /> Archive
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}
              onClick={() => setBulkConfirm({ op: 'unarchive', count: selected.length })}
            >
              <ArchiveRestore size={12} /> Unarchive
            </button>

            <button
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px 6px', display: 'flex', marginLeft: 'auto' }}
              onClick={() => setSelected([])}
              title="Clear selection"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

          {/* Created From */}
          <div style={{ minWidth: 130, maxWidth: 150, height: 36 }}>
            <DatePicker
              value={currentCreatedFrom}
              onChange={handleFromChange}
              placeholder="From date"
              max={currentCreatedTo || undefined}
            />
          </div>

          {/* Created To */}
          <div style={{ minWidth: 130, maxWidth: 150, height: 36 }}>
            <DatePicker
              value={currentCreatedTo}
              onChange={handleToChange}
              placeholder="To date"
              min={currentCreatedFrom || undefined}
            />
          </div>

          {/* Clear date range */}
          {(currentCreatedFrom || currentCreatedTo) && (
            <button
              className="ibtn"
              title="Clear date range"
              onClick={() => navigate({ created_from: '', created_to: '', page: 1 })}
              style={{ border: '1px solid var(--border)', color: 'var(--text3)' }}
            >
              <X size={13} />
            </button>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 160, maxWidth: 260 }}>
            <div className="sb-inp" style={{ width: '100%' }}>
              <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or org ID…"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(''); navigate({ search: '', page: 1 }) }}>
                  <X size={12} style={{ color: 'var(--text3)' }} />
                </button>
              )}
            </div>
          </form>

          {/* Filters */}
          <button
            ref={filterBtnRef}
            className="btn btn-ghost"
            onClick={() => setFilterOpen((v) => !v)}
            style={{
              height: 36, padding: '0 14px', fontSize: '.8rem',
              border: `1px solid ${hasActiveFilters ? 'var(--p)' : 'var(--border)'}`,
              color: hasActiveFilters ? 'var(--p)' : undefined,
              background: hasActiveFilters ? 'var(--p-lt)' : undefined,
            }}
          >
            <Filter size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 17, height: 17, background: 'var(--p)', color: '#fff',
                borderRadius: '50%', fontSize: '.6rem', fontWeight: 800, lineHeight: 1,
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Columns toggle */}
          <button
            ref={colVisBtnRef}
            className="btn btn-ghost"
            onClick={() => setColVisOpen((v) => !v)}
            style={{
              height: 36, padding: '0 12px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 6,
              border: `1px solid ${colVisOpen ? 'var(--p)' : 'var(--border)'}`,
              color: colVisOpen ? 'var(--p)' : undefined,
              background: colVisOpen ? 'var(--p-lt)' : undefined,
            }}
          >
            <SlidersHorizontal size={13} />
            Columns
          </button>

          {/* Refresh */}
          <button
            className="btn btn-ghost"
            title="Refresh"
            onClick={() => router.reload()}
            style={{
              height: 36, padding: '0 12px', fontSize: '.8rem', border: '1px solid var(--border)',
              transition: 'var(--t)',
            }}
          >
            <RefreshCw size={13} style={{ transition: 'transform .4s', transform: isLoading ? 'rotate(360deg)' : 'none' }} />
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Per page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 500 }}>Per page:</span>
            <button
              ref={ppBtnRef}
              className="btn btn-ghost"
              onClick={() => setPpOpen((v) => !v)}
              style={{
                height: 36, padding: '0 10px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 5,
                border: `1px solid ${ppOpen ? 'var(--p)' : 'var(--border)'}`,
                color: ppOpen ? 'var(--p)' : undefined,
                background: ppOpen ? 'var(--p-lt)' : undefined,
              }}
            >
              {meta.perPage}
              <ChevronDown size={12} style={{ color: 'var(--text3)', transform: ppOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
          </div>
        </div>

        {/* ── DataTable ── */}
        <DataTable<Org>
          data={rows}
          columns={columns}
          rowKey={(r) => r.id}
          pagination={pagination}
          sortBy={currentSortBy}
          sortDir={currentSortDir as 'asc' | 'desc'}
          onSort={(key, dir) => navigate({ sort_by: key, sort_dir: dir })}
          onPage={(page) => navigate({ page })}
          onPerPage={(n) => navigate({ per_page: n })}
          selected={selected}
          onSelect={(ids) => setSelected(ids as number[])}
          hideToolbar
          loading={isLoading}
          columnVisibility={colVis}
          onColumnVisibilityChange={setColVis}
          rowHighlight={(org) => !!org.isArchived}
          emptyIcon={<Building2 size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
          emptyTitle="No organizations found"
          emptyDesc="Try adjusting your filters or search query."
          emptyAction={
            <Link href="/organizations/create" className="btn btn-p btn-sm" style={{ display: 'inline-flex' }}>
              <Plus size={13} /> Add Organization
            </Link>
          }
        />
      </div>

      {/* ── Filter panel ── */}
      <FixedDropdown anchorRef={filterBtnRef} open={filterOpen} onClose={() => setFilterOpen(false)} minWidth={300} align="left" noPadding>
        <div style={{ width: 300 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--text1)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={13} style={{ color: 'var(--p)' }} />
              Filters
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} style={{ fontSize: '.72rem', color: 'var(--p)', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none', padding: '2px 6px', borderRadius: 5 }}>
                Reset all
              </button>
            )}
          </div>

          {/* Fields */}
          <div style={{ padding: '14px 16px 0' }}>
            <div className="fg" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Users size={11} /> Lead Owner
              </label>
              <SelectSearch value={filterLeadOwner} onChange={setFilterLeadOwner} options={leadOwnerOptions} placeholder="All lead owners" />
            </div>

            <div className="fg" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Activity size={11} /> Status
              </label>
              <SelectSearch
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: '',         label: 'All Statuses' },
                  { value: 'active',   label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'expired',  label: 'Expired' },
                ]}
                placeholder="All statuses"
              />
            </div>

            <div className="fg" style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Globe size={11} /> Country
              </label>
              <input className="fi" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} placeholder="Filter by country…" />
            </div>

            <div className="fg">
              <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <MapPin size={11} /> City
              </label>
              <input className="fi" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} placeholder="Filter by city…" />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 14px', marginTop: 12, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={clearFilters}
              style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none', padding: '6px 4px', transition: 'color .15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text1)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
            >
              Clear all
            </button>
            <button className="btn btn-p btn-sm" style={{ minWidth: 100 }} onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      </FixedDropdown>

      {/* ── Delete confirmation modal ── */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Organization"
        size="sm"
        icon={<Trash2 size={15} />}
        variant="danger"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => deleteConfirm !== null && handleDelete(deleteConfirm)}>
              <Trash2 size={13} /> Delete
            </button>
          </>
        }
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
          Are you sure you want to delete this organization? This action <strong>cannot be undone</strong> and all associated data will be permanently removed.
        </p>
      </Modal>

      {/* ── Unarchive confirmation modal ── */}
      <Modal
        open={unarchiveConfirm !== null}
        onClose={() => setUnarchiveConfirm(null)}
        title="Unarchive Organization"
        size="sm"
        icon={<ArchiveRestore size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setUnarchiveConfirm(null)}>Cancel</button>
            <button
              className="btn btn-p"
              onClick={() => {
                if (unarchiveConfirm !== null) {
                  router.post('/organizations/bulk', { ids: [unarchiveConfirm], operation: 'unarchive' })
                  setUnarchiveConfirm(null)
                }
              }}
            >
              <ArchiveRestore size={13} /> Unarchive
            </button>
          </>
        }
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
          Are you sure you want to unarchive this organization? It will appear in active views again.
        </p>
      </Modal>

      {/* ── Extend Plan modal ── */}
      <Modal
        open={bulkModal === 'extend_plan'}
        onClose={() => setBulkModal(null)}
        title="Extend Plan End Date"
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setBulkModal(null)}>Cancel</button>
            <button className="btn btn-p" disabled={!extendDate} onClick={submitExtendPlan}>Apply</button>
          </>
        }
      >
        <p style={{ fontSize: '.82rem', color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
          Set a new plan end date for <strong style={{ color: 'var(--text1)' }}>{selected.length}</strong> organization{selected.length !== 1 ? 's' : ''}.
        </p>
        <div className="fg">
          <label>New Plan End Date <span className="req">*</span></label>
          <DatePicker value={extendDate} onChange={setExtendDate} placeholder="Select end date" min={DateTime.now().toISODate()!} />
        </div>
      </Modal>

      {/* ── Set User Limit modal ── */}
      <Modal
        open={bulkModal === 'extend_user_limit'}
        onClose={() => setBulkModal(null)}
        title="Set User Limit"
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setBulkModal(null)}>Cancel</button>
            <button className="btn btn-p" disabled={!extendLimit || parseInt(extendLimit) < 1} onClick={submitExtendLimit}>Apply</button>
          </>
        }
      >
        <p style={{ fontSize: '.82rem', color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
          Set a new user limit for <strong style={{ color: 'var(--text1)' }}>{selected.length}</strong> organization{selected.length !== 1 ? 's' : ''}.
        </p>
        <div className="fg">
          <label>User Limit <span className="req">*</span></label>
          <input type="number" className="fi" value={extendLimit} min={1} placeholder="e.g. 50" onChange={(e) => setExtendLimit(e.target.value)} />
        </div>
      </Modal>

      {/* ── Assign Lead modal ── */}
      <Modal
        open={bulkModal === 'assign_lead'}
        onClose={() => setBulkModal(null)}
        title="Assign Lead Owner"
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setBulkModal(null)}>Cancel</button>
            <button className="btn btn-p" disabled={!assignLeadId} onClick={submitAssignLead}>Apply</button>
          </>
        }
      >
        <p style={{ fontSize: '.82rem', color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
          Assign a lead owner to <strong style={{ color: 'var(--text1)' }}>{selected.length}</strong> organization{selected.length !== 1 ? 's' : ''}.
        </p>
        <div className="fg">
          <label>Lead Owner <span className="req">*</span></label>
          <SelectSearch
            value={assignLeadId}
            onChange={setAssignLeadId}
            options={leadOwners.map((o) => ({ value: String(o.id), label: o.name, sub: o.designation || o.email }))}
            placeholder="Select lead owner…"
          />
        </div>
      </Modal>

      {/* ── Activate / Deactivate / Archive confirmation modal ── */}
      <Modal
        open={bulkConfirm !== null}
        onClose={() => setBulkConfirm(null)}
        title={
          bulkConfirm?.op === 'activate'   ? 'Activate Organizations' :
          bulkConfirm?.op === 'deactivate' ? 'Deactivate Organizations' :
          bulkConfirm?.op === 'unarchive'  ? 'Unarchive Organizations' :
          'Archive Organizations'
        }
        size="sm"
        icon={
          bulkConfirm?.op === 'activate'   ? <CheckCircle2 size={15} /> :
          bulkConfirm?.op === 'archive'    ? <Archive size={15} /> :
          bulkConfirm?.op === 'unarchive'  ? <ArchiveRestore size={15} /> :
          <AlertTriangle size={15} />
        }
        variant={
          bulkConfirm?.op === 'activate'  ? 'default' :
          bulkConfirm?.op === 'unarchive' ? 'default' :
          'warning'
        }
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setBulkConfirm(null)}>Cancel</button>
            <button
              className={`btn ${(bulkConfirm?.op === 'activate' || bulkConfirm?.op === 'unarchive') ? 'btn-p' : 'btn-warn'}`}
              onClick={() => bulkConfirm && handleBulkDirect(bulkConfirm.op)}
            >
              {bulkConfirm?.op === 'activate'   ? <><CheckCircle2 size={13} /> Activate</> :
               bulkConfirm?.op === 'deactivate' ? <><X size={13} /> Deactivate</> :
               bulkConfirm?.op === 'unarchive'  ? <><ArchiveRestore size={13} /> Unarchive</> :
               <><Archive size={13} /> Archive</>}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
          {bulkConfirm?.op === 'activate' && <>You are about to <strong>activate</strong> <strong style={{ color: 'var(--text1)' }}>{bulkConfirm.count}</strong> organization{bulkConfirm.count !== 1 ? 's' : ''}. They will become accessible to their members.</>}
          {bulkConfirm?.op === 'deactivate' && <>You are about to <strong>deactivate</strong> <strong style={{ color: 'var(--text1)' }}>{bulkConfirm.count}</strong> organization{bulkConfirm.count !== 1 ? 's' : ''}. Members will lose access until reactivated.</>}
          {bulkConfirm?.op === 'archive' && <>You are about to <strong>archive</strong> <strong style={{ color: 'var(--text1)' }}>{bulkConfirm.count}</strong> organization{bulkConfirm.count !== 1 ? 's' : ''}. Archived organizations are hidden from active views but can be restored.</>}
          {bulkConfirm?.op === 'unarchive' && <>You are about to <strong>unarchive</strong> <strong style={{ color: 'var(--text1)' }}>{bulkConfirm.count}</strong> organization{bulkConfirm.count !== 1 ? 's' : ''}. They will appear in active views again.</>}
        </p>
      </Modal>

      {/* ── Columns dropdown ── */}
      <FixedDropdown anchorRef={colVisBtnRef} open={colVisOpen} onClose={() => setColVisOpen(false)} minWidth={192} align="right">
        <div style={{ padding: '8px 12px 6px', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
          Toggle columns
        </div>
        {columns.filter((c) => !c.pinned).map((c) => {
          const on = colVis[c.key] !== false
          return (
            <button
              key={c.key}
              className="drop-item"
              style={{ padding: '7px 12px' }}
              onClick={() => setColVis((prev) => {
                if (!on) { const next = { ...prev }; delete next[c.key]; return next }
                return { ...prev, [c.key]: false }
              })}
            >
              <span style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: `1.5px solid ${on ? 'var(--p)' : 'var(--border2)'}`,
                background: on ? 'var(--p)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s, border-color .15s',
              }}>
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
          const active = n === meta.perPage
          return (
            <button
              key={n}
              className="drop-item"
              style={{ padding: '7px 12px', color: active ? 'var(--p)' : undefined, fontWeight: active ? 700 : undefined }}
              onClick={() => { setPpOpen(false); navigate({ per_page: n }) }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: `1.5px solid ${active ? 'var(--p)' : 'var(--border2)'}`,
                background: active ? 'var(--p)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s, border-color .15s',
              }}>
                {active && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </span>
              {n} rows
            </button>
          )
        })}
      </FixedDropdown>
    </>
  )
}
