import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { DateTime } from 'luxon'
import { router } from '@inertiajs/react'
import {
  UserCheck, Plus, Search, Pencil, Trash2, X,
  RefreshCw, SlidersHorizontal, ChevronDown,
  AlertTriangle, Mail, Phone, Building2, CheckCircle2,
} from 'lucide-react'
import { DataTable, FixedDropdown } from '~/components/data-table'
import type { DTColumn, DTPagination, VisibilityState } from '~/components/data-table'
import { Modal } from '~/components/modal'
import { SelectSearch } from '~/components/select-search'
import type { SelectOption } from '~/components/select-search'

// ── Constants ──────────────────────────────────────────────────────────────────

const OWNERS_COLS_KEY = 'tf-lead-owners-cols-v1'
const ASSIGN_COLS_KEY = 'tf-assignments-cols-v1'
const PP_OPTIONS      = [10, 25, 50, 100]
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const TABS = [
  { key: 'owners',      label: 'Lead Owners' },
  { key: 'assignments', label: 'Assignments' },
]

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeadOwner {
  id: number
  name: string
  email: string
  phone: string | null
  designation: string | null
  status: 'active' | 'inactive'
  createdAt: string
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

interface Assignment {
  id: number
  orgId: string
  name: string
  leadOwnerId: number | null
  status: 'active' | 'inactive' | 'expired'
  planType: 'trial' | 'premium'
  createdAt: string
}

interface Props {
  owners: { data: LeadOwner[]; meta: PaginationMeta }
  assignments: Assignment[]
}

type BulkConfirm = { op: 'activate' | 'deactivate'; count: number } | null

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(val: string | null | undefined): string {
  if (!val || val.startsWith('0000')) return '—'
  const dt = DateTime.fromISO(val.includes('T') ? val : val.replace(' ', 'T'))
  return dt.isValid ? dt.toFormat('dd MMM yyyy') : '—'
}

function emptyForm() {
  return { name: '', email: '', phone: '', designation: '', status: 'active' as const }
}

// ── Lead Owner Form ───────────────────────────────────────────────────────────

function LeadOwnerForm({
  form, onChange, errors,
}: {
  form: ReturnType<typeof emptyForm>
  onChange: (f: ReturnType<typeof emptyForm>) => void
  errors: Record<string, string>
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="fg">
        <label>Full Name <span className="req">*</span></label>
        <input className="fi" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} placeholder="e.g. Rahul Sharma" />
        {errors.name && <div className="err-msg">{errors.name}</div>}
      </div>
      <div className="fg">
        <label>Email <span className="req">*</span></label>
        <input className="fi" type="email" value={form.email} onChange={(e) => onChange({ ...form, email: e.target.value })} placeholder="e.g. rahul@company.com" />
        {errors.email && <div className="err-msg">{errors.email}</div>}
      </div>
      <div className="fg col2">
        <div className="fg">
          <label>Phone</label>
          <input className="fi" value={form.phone} onChange={(e) => onChange({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
        </div>
        <div className="fg">
          <label>Designation</label>
          <input className="fi" value={form.designation} onChange={(e) => onChange({ ...form, designation: e.target.value })} placeholder="e.g. Sales Manager" />
        </div>
      </div>
      <div className="fg">
        <label>Status</label>
        <SelectSearch
          value={form.status}
          onChange={(v) => onChange({ ...form, status: (v || 'active') as 'active' | 'inactive' })}
          options={STATUS_OPTIONS}
          placeholder="Select status…"
        />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeadsIndex({ owners, assignments }: Props) {

  // ── URL / tab ─────────────────────────────────────────────────────────────
  const urlObj     = new URL(window.location.href)
  const currentTab = (urlObj.searchParams.get('tab') || 'owners') as 'owners' | 'assignments'

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

  function handleTab(key: string) {
    setSelected([])
    router.get('/orgbuilder/leads', { tab: key }, { preserveState: true, replace: true })
  }

  // ── Server-side state ─────────────────────────────────────────────────────
  const currentSearch  = urlObj.searchParams.get('search')   || ''
  const currentSortBy  = urlObj.searchParams.get('sort_by')  || 'created_at'
  const currentSortDir = urlObj.searchParams.get('sort_dir') || 'desc'

  const [search,    setSearch]    = useState(currentSearch)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const off1 = router.on('start',  () => setIsLoading(true))
    const off2 = router.on('finish', () => setIsLoading(false))
    return () => { off1(); off2() }
  }, [])

  function navigate(params: Record<string, string | number | undefined>) {
    const merged: Record<string, string | number | undefined> = {
      tab: currentTab, search: currentSearch, page: 1,
      sort_by: currentSortBy, sort_dir: currentSortDir, per_page: owners.meta.perPage,
      ...params,
    }
    const p: Record<string, string> = {}
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) p[k] = String(v)
    })
    router.get('/orgbuilder/leads', p, { preserveState: true, replace: true })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ search, page: 1 })
  }

  // ── Column visibility ──────────────────────────────────────────────────────
  const [ownerColVis, setOwnerColVis] = useState<VisibilityState>(() => {
    try { const s = localStorage.getItem(OWNERS_COLS_KEY); if (s) return JSON.parse(s) } catch {}
    return {}
  })
  const [assignColVis, setAssignColVis] = useState<VisibilityState>(() => {
    try { const s = localStorage.getItem(ASSIGN_COLS_KEY); if (s) return JSON.parse(s) } catch {}
    return {}
  })
  useEffect(() => { try { localStorage.setItem(OWNERS_COLS_KEY, JSON.stringify(ownerColVis)) } catch {} }, [ownerColVis])
  useEffect(() => { try { localStorage.setItem(ASSIGN_COLS_KEY, JSON.stringify(assignColVis)) } catch {} }, [assignColVis])

  // ── Toolbar dropdowns ──────────────────────────────────────────────────────
  const [ppOpen,           setPpOpen]           = useState(false)
  const [colVisOpen,       setColVisOpen]       = useState(false)
  const [assignColVisOpen, setAssignColVisOpen] = useState(false)
  const [assignPpOpen,     setAssignPpOpen]     = useState(false)
  const [assignPerPage,    setAssignPerPage]    = useState(10)
  const ppBtnRef           = useRef<HTMLButtonElement>(null)
  const colVisBtnRef       = useRef<HTMLButtonElement>(null)
  const assignColVisBtnRef = useRef<HTMLButtonElement>(null)
  const assignPpBtnRef     = useRef<HTMLButtonElement>(null)

  // ── Selection + bulk ───────────────────────────────────────────────────────
  const [selected,    setSelected]    = useState<number[]>([])
  const [bulkConfirm, setBulkConfirm] = useState<BulkConfirm>(null)

  function handleBulkDirect(op: 'activate' | 'deactivate') {
    if (!selected.length) return
    router.post('/orgbuilder/leads/bulk', { ids: selected, operation: op }, {
      onSuccess: () => { setSelected([]); setBulkConfirm(null) },
    })
  }

  // ── Assignment client search ───────────────────────────────────────────────
  const [assignSearch, setAssignSearch] = useState('')

  // ── CRUD modals ────────────────────────────────────────────────────────────
  const [addOpen,      setAddOpen]      = useState(false)
  const [editOpen,     setEditOpen]     = useState(false)
  const [deleteOpen,   setDeleteOpen]   = useState(false)
  const [editTarget,   setEditTarget]   = useState<LeadOwner | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LeadOwner | null>(null)
  const [addForm,      setAddForm]      = useState(emptyForm())
  const [editForm,     setEditForm]     = useState(emptyForm())
  const [formErrors,   setFormErrors]   = useState<Record<string, string>>({})
  const [processing,   setProcessing]   = useState(false)

  function validateForm(f: ReturnType<typeof emptyForm>) {
    const e: Record<string, string> = {}
    if (!f.name.trim())  e.name  = 'Required'
    if (!f.email.trim()) e.email = 'Required'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  function handleAdd() {
    if (!validateForm(addForm)) return
    setProcessing(true)
    router.post('/orgbuilder/leads', {
      name: addForm.name.trim(), email: addForm.email.trim(),
      phone: addForm.phone.trim() || null,
      designation: addForm.designation.trim() || null,
      status: addForm.status,
    }, {
      onSuccess: () => { setAddOpen(false); setAddForm(emptyForm()) },
      onFinish:  () => setProcessing(false),
    })
  }

  function handleEdit() {
    if (!editTarget || !validateForm(editForm)) return
    setProcessing(true)
    router.put(`/orgbuilder/leads/${editTarget.id}`, {
      name: editForm.name.trim(), email: editForm.email.trim(),
      phone: editForm.phone.trim() || null,
      designation: editForm.designation.trim() || null,
      status: editForm.status,
    }, {
      onSuccess: () => { setEditOpen(false); setEditTarget(null) },
      onFinish:  () => setProcessing(false),
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    setProcessing(true)
    router.delete(`/orgbuilder/leads/${deleteTarget.id}`, {
      onSuccess: () => { setDeleteOpen(false); setDeleteTarget(null) },
      onFinish:  () => setProcessing(false),
    })
  }

  // ── Owner columns ──────────────────────────────────────────────────────────
  const ownerCols: DTColumn<LeadOwner>[] = [
    {
      key: 'name', label: 'Name', sortKey: 'name', pinned: true, minWidth: 200,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'var(--p-lt)', color: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.68rem' }}>
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)', lineHeight: 1.3 }}>{row.name}</div>
            {row.designation && <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginTop: 1 }}>{row.designation}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'email', label: 'Email', sortable: false,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: 'var(--text2)' }}>
          <Mail size={12} style={{ flexShrink: 0, color: 'var(--text4)' }} />
          {row.email}
        </div>
      ),
    },
    {
      key: 'phone', label: 'Phone', sortable: false,
      render: (row) => row.phone
        ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: 'var(--text2)' }}><Phone size={12} style={{ flexShrink: 0, color: 'var(--text4)' }} />{row.phone}</div>
        : <span style={{ color: 'var(--text4)', fontSize: '.8rem' }}>—</span>,
    },
    {
      key: 'status', label: 'Status', sortable: false,
      render: (row) => (
        <span className={`bdg ${row.status === 'active' ? 'bdg-green' : 'bdg-gray'}`}>
          <span className="bdg-dot" />
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'orgsAssigned', label: 'Orgs Assigned', sortable: false,
      render: (row) => {
        const count = assignments.filter((a) => a.leadOwnerId === row.id).length
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: 'var(--text2)' }}>
            <Building2 size={12} style={{ color: 'var(--text4)' }} />{count}
          </div>
        )
      },
    },
    {
      key: 'createdAt', label: 'Created', sortKey: 'created_at',
      render: (row) => <span style={{ fontSize: '.8rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{fmtDate(row.createdAt)}</span>,
    },
    {
      key: 'actions', label: 'Actions', sortable: false, pinned: true, width: 110,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => { setEditTarget(row); setEditForm({ name: row.name, email: row.email, phone: row.phone || '', designation: row.designation || '', status: row.status }); setFormErrors({}); setEditOpen(true) }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer', transition: 'var(--t)' }}
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => { setDeleteTarget(row); setDeleteOpen(true) }}
            style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 6px', borderRadius: 7, color: 'var(--text3)', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', transition: 'var(--t)' }}
            onMouseEnter={(e) => { ;(e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#fecaca'; ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,.06)' }}
            onMouseLeave={(e) => { ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text3)'; ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  // ── Assignment columns ─────────────────────────────────────────────────────
  const assignCols: DTColumn<Assignment>[] = [
    {
      key: 'name', label: 'Organization', pinned: true, minWidth: 200,
      render: (row) => (
        <a href={`/orgbuilder/organizations/${row.id}`} style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--p)', lineHeight: 1.3 }}>{row.name}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text3)', fontFamily: 'monospace', marginTop: 1 }}>{row.orgId}</div>
        </a>
      ),
    },
    {
      key: 'leadOwner', label: 'Lead Owner', sortable: false,
      render: (row) => {
        const owner = owners.data.find((o) => o.id === row.leadOwnerId)
        return owner ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: 'var(--p-lt)', color: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.6rem' }}>
              {owner.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text1)', lineHeight: 1.3 }}>{owner.name}</div>
              {owner.designation && <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginTop: 1 }}>{owner.designation}</div>}
            </div>
          </div>
        ) : <span style={{ color: 'var(--text4)', fontSize: '.8rem' }}>—</span>
      },
    },
    {
      key: 'planType', label: 'Plan', sortable: false,
      render: (row) => (
        <span className={`bdg ${row.planType === 'premium' ? 'bdg-green' : 'bdg-blue'}`}>
          <span className="bdg-dot" />
          {row.planType === 'premium' ? 'Paid' : 'Trial'}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', sortable: false,
      render: (row) => (
        <span className={`bdg ${row.status === 'active' ? 'bdg-green' : row.status === 'expired' ? 'bdg-red' : 'bdg-gray'}`}>
          <span className="bdg-dot" />
          {row.status === 'active' ? 'Active' : row.status === 'expired' ? 'Expired' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Assigned On',
      render: (row) => <span style={{ fontSize: '.8rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{fmtDate(row.createdAt)}</span>,
    },
  ]

  const filteredAssignments = assignSearch
    ? assignments.filter((a) => {
        const owner = owners.data.find((o) => o.id === a.leadOwnerId)
        const q = assignSearch.toLowerCase()
        return a.name.toLowerCase().includes(q) || a.orgId.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false)
      })
    : assignments

  const ownerPagination: DTPagination = {
    total: owners.meta.total, perPage: owners.meta.perPage,
    currentPage: owners.meta.currentPage, lastPage: owners.meta.lastPage,
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Leads &amp; Owners</div>
          <div className="ph-sub">Manage lead owners and view their organization assignments</div>
        </div>
        {currentTab === 'owners' && (
          <button className="btn btn-p" onClick={() => { setAddForm(emptyForm()); setFormErrors({}); setAddOpen(true) }}>
            <Plus size={14} /> Add Lead Owner
          </button>
        )}
      </div>

      <div className="card">

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="tab-bar">
          <div ref={tabSegRef} className="tab-seg">
            <div style={{ position: 'absolute', top: 3, bottom: 3, left: slider.left, width: slider.width, background: 'var(--surface)', borderRadius: 7, boxShadow: '0 1px 4px rgba(0,0,0,.1)', transition: slider.ready ? 'left .22s cubic-bezier(.4,0,.2,1), width .22s cubic-bezier(.4,0,.2,1)' : 'none', opacity: slider.ready ? 1 : 0, pointerEvents: 'none', zIndex: 0 }} />
            {TABS.map((t) => (
              <button key={t.key} ref={(el) => { tabBtnRefs.current[t.key] = el }} className={`tab-btn${currentTab === t.key ? ' active' : ''}`} onClick={() => handleTab(t.key)}>
                {t.label}
                <span style={{ fontSize: '.62rem', fontWeight: 700, background: currentTab === t.key ? 'var(--p-lt)' : 'var(--bg2)', color: currentTab === t.key ? 'var(--p)' : 'var(--text4)', borderRadius: 10, padding: '1px 7px', marginLeft: 3 }}>
                  {t.key === 'owners' ? owners.meta.total : assignments.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Bulk action bar (owners only) ─────────────────────────── */}
        {currentTab === 'owners' && (
          <div className={`bulk-bar${selected.length > 0 ? ' open' : ''}`}>
            <div style={{ background: 'linear-gradient(90deg, var(--p), var(--p-dk))', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '.8rem', marginRight: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 20, padding: '1px 8px', fontSize: '.76rem' }}>{selected.length}</span>
                selected
              </span>
              <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }} onClick={() => setBulkConfirm({ op: 'activate', count: selected.length })}>
                <CheckCircle2 size={12} /> Activate
              </button>
              <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }} onClick={() => setBulkConfirm({ op: 'deactivate', count: selected.length })}>
                <X size={12} /> Deactivate
              </button>
              <button style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px 6px', display: 'flex', marginLeft: 'auto' }} onClick={() => setSelected([])} title="Clear selection">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Owners toolbar ─────────────────────────────────────────── */}
        {currentTab === 'owners' && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 180, maxWidth: 300 }}>
              <div className="sb-inp" style={{ width: '100%' }}>
                <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or designation…" />
                {search && <button type="button" onClick={() => { setSearch(''); navigate({ search: '', page: 1 }) }}><X size={12} style={{ color: 'var(--text3)' }} /></button>}
              </div>
            </form>
            <button ref={colVisBtnRef} className="btn btn-ghost" onClick={() => setColVisOpen((v) => !v)} style={{ height: 36, padding: '0 12px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${colVisOpen ? 'var(--p)' : 'var(--border)'}`, color: colVisOpen ? 'var(--p)' : undefined, background: colVisOpen ? 'var(--p-lt)' : undefined }}>
              <SlidersHorizontal size={13} /> Columns
            </button>
            <button className="btn btn-ghost" title="Refresh" onClick={() => router.reload()} style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }}>
              <RefreshCw size={13} style={{ transition: 'transform .4s', transform: isLoading ? 'rotate(360deg)' : 'none' }} />
            </button>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 500 }}>Per page:</span>
              <button ref={ppBtnRef} className="btn btn-ghost" onClick={() => setPpOpen((v) => !v)} style={{ height: 36, padding: '0 10px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${ppOpen ? 'var(--p)' : 'var(--border)'}`, color: ppOpen ? 'var(--p)' : undefined, background: ppOpen ? 'var(--p-lt)' : undefined }}>
                {owners.meta.perPage}
                <ChevronDown size={12} style={{ color: 'var(--text3)', transform: ppOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
            </div>
          </div>
        )}

        {/* ── Assignments toolbar ─────────────────────────────────────── */}
        {currentTab === 'assignments' && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 300 }}>
              <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <input value={assignSearch} onChange={(e) => setAssignSearch(e.target.value)} placeholder="Search org name, ID or owner…" />
              {assignSearch && <button type="button" onClick={() => setAssignSearch('')}><X size={12} style={{ color: 'var(--text3)' }} /></button>}
            </div>
            <button ref={assignColVisBtnRef} className="btn btn-ghost" onClick={() => setAssignColVisOpen((v) => !v)} style={{ height: 36, padding: '0 12px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${assignColVisOpen ? 'var(--p)' : 'var(--border)'}`, color: assignColVisOpen ? 'var(--p)' : undefined, background: assignColVisOpen ? 'var(--p-lt)' : undefined }}>
              <SlidersHorizontal size={13} /> Columns
            </button>
            <button className="btn btn-ghost" title="Refresh" onClick={() => router.reload()} style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }}>
              <RefreshCw size={13} style={{ transition: 'transform .4s', transform: isLoading ? 'rotate(360deg)' : 'none' }} />
            </button>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 500 }}>Per page:</span>
              <button ref={assignPpBtnRef} className="btn btn-ghost" onClick={() => setAssignPpOpen((v) => !v)} style={{ height: 36, padding: '0 10px', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${assignPpOpen ? 'var(--p)' : 'var(--border)'}`, color: assignPpOpen ? 'var(--p)' : undefined, background: assignPpOpen ? 'var(--p-lt)' : undefined }}>
                {assignPerPage}
                <ChevronDown size={12} style={{ color: 'var(--text3)', transform: assignPpOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
            </div>
          </div>
        )}

        {/* ── Owners DataTable ────────────────────────────────────────── */}
        {currentTab === 'owners' && (
          <DataTable<LeadOwner>
            data={owners.data} columns={ownerCols} rowKey={(r) => r.id}
            pagination={ownerPagination}
            sortBy={currentSortBy} sortDir={currentSortDir as 'asc' | 'desc'}
            onSort={(key, dir) => navigate({ sort_by: key, sort_dir: dir })}
            onPage={(page) => navigate({ page })}
            onPerPage={(n) => navigate({ per_page: n, page: 1 })}
            selected={selected} onSelect={(ids) => setSelected(ids as number[])}
            hideToolbar loading={isLoading} noun="leads"
            columnVisibility={ownerColVis} onColumnVisibilityChange={setOwnerColVis}
            emptyIcon={<UserCheck size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
            emptyTitle="No lead owners yet" emptyDesc="Add your first lead owner to assign to organizations."
            emptyAction={
              <button className="btn btn-p btn-sm" onClick={() => { setAddForm(emptyForm()); setFormErrors({}); setAddOpen(true) }}>
                <Plus size={13} /> Add Lead Owner
              </button>
            }
          />
        )}

        {/* ── Assignments DataTable ───────────────────────────────────── */}
        {currentTab === 'assignments' && (
          <DataTable<Assignment>
            key={assignPerPage}
            data={filteredAssignments} columns={assignCols} rowKey={(r) => r.id}
            clientPageSize={assignPerPage} hideToolbar
            columnVisibility={assignColVis} onColumnVisibilityChange={setAssignColVis}
            emptyIcon={<Building2 size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
            emptyTitle="No assignments found" emptyDesc="Organizations with a lead owner assigned will appear here."
          />
        )}
      </div>

      {/* ── Per-page dropdown ────────────────────────────────────────────── */}
      <FixedDropdown anchorRef={ppBtnRef} open={ppOpen} onClose={() => setPpOpen(false)} minWidth={110} align="right" noPadding>
        {PP_OPTIONS.map((n) => (
          <button key={n} onClick={() => { navigate({ per_page: n, page: 1 }); setPpOpen(false) }}
            style={{ display: 'block', width: '100%', padding: '8px 14px', fontSize: '.8rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: n === owners.meta.perPage ? 'var(--p)' : 'var(--text1)', fontWeight: n === owners.meta.perPage ? 700 : 400 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            {n} rows
          </button>
        ))}
      </FixedDropdown>

      {/* ── Assignments per-page dropdown ───────────────────────────────── */}
      <FixedDropdown anchorRef={assignPpBtnRef} open={assignPpOpen} onClose={() => setAssignPpOpen(false)} minWidth={110} align="right" noPadding>
        {PP_OPTIONS.map((n) => (
          <button key={n} onClick={() => { setAssignPerPage(n); setAssignPpOpen(false) }}
            style={{ display: 'block', width: '100%', padding: '8px 14px', fontSize: '.8rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: n === assignPerPage ? 'var(--p)' : 'var(--text1)', fontWeight: n === assignPerPage ? 700 : 400 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            {n} rows
          </button>
        ))}
      </FixedDropdown>

      {/* ── Owners column visibility ─────────────────────────────────────── */}
      <FixedDropdown anchorRef={colVisBtnRef} open={colVisOpen} onClose={() => setColVisOpen(false)} minWidth={180} align="right" noPadding>
        <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Toggle Columns</div>
        </div>
        {ownerCols.filter((c) => !c.pinned && c.key !== 'actions').map((col) => {
          const visible = ownerColVis[col.key] !== false
          return (
            <button key={col.key} onClick={() => setOwnerColVis((v) => ({ ...v, [col.key]: !visible }))}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 14px', fontSize: '.8rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text1)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, border: `1.5px solid ${visible ? 'var(--p)' : 'var(--border)'}`, background: visible ? 'var(--p)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {visible && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>}
              </div>
              {col.label}
            </button>
          )
        })}
      </FixedDropdown>

      {/* ── Assignments column visibility ────────────────────────────────── */}
      <FixedDropdown anchorRef={assignColVisBtnRef} open={assignColVisOpen} onClose={() => setAssignColVisOpen(false)} minWidth={180} align="right" noPadding>
        <div style={{ padding: '10px 14px 6px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Toggle Columns</div>
        </div>
        {assignCols.filter((c) => !c.pinned).map((col) => {
          const visible = assignColVis[col.key] !== false
          return (
            <button key={col.key} onClick={() => setAssignColVis((v) => ({ ...v, [col.key]: !visible }))}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 14px', fontSize: '.8rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text1)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, border: `1.5px solid ${visible ? 'var(--p)' : 'var(--border)'}`, background: visible ? 'var(--p)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {visible && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>}
              </div>
              {col.label}
            </button>
          )
        })}
      </FixedDropdown>

      {/* ── Add Modal ─────────────────────────────────────────────────────── */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Lead Owner" icon={<UserCheck size={16} />}
        footer={<div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn btn-p" disabled={processing} onClick={handleAdd}>{processing ? 'Saving…' : 'Add Owner'}</button></div>}
      >
        <LeadOwnerForm form={addForm} onChange={setAddForm} errors={formErrors} />
      </Modal>

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Lead Owner" icon={<Pencil size={16} />}
        footer={<div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><button className="btn btn-ghost" onClick={() => setEditOpen(false)}>Cancel</button><button className="btn btn-p" disabled={processing} onClick={handleEdit}>{processing ? 'Saving…' : 'Save Changes'}</button></div>}
      >
        <LeadOwnerForm form={editForm} onChange={setEditForm} errors={formErrors} />
      </Modal>

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Lead Owner" variant="danger" icon={<Trash2 size={15} />} size="sm"
        footer={<><button className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>Cancel</button><button className="btn btn-danger" disabled={processing} onClick={handleDelete}><Trash2 size={13} /> Delete</button></>}
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action <strong>cannot be undone</strong> and organizations assigned to this owner will lose their lead owner reference.
        </p>
      </Modal>

      {/* ── Bulk Confirm ──────────────────────────────────────────────────── */}
      <Modal
        open={bulkConfirm !== null} onClose={() => setBulkConfirm(null)}
        title={bulkConfirm?.op === 'activate' ? 'Activate Lead Owners' : 'Deactivate Lead Owners'}
        size="sm"
        icon={bulkConfirm?.op === 'activate' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
        variant={bulkConfirm?.op === 'activate' ? 'default' : 'warning'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setBulkConfirm(null)}>Cancel</button>
            <button className={`btn ${bulkConfirm?.op === 'activate' ? 'btn-p' : 'btn-warn'}`} onClick={() => bulkConfirm && handleBulkDirect(bulkConfirm.op)}>
              {bulkConfirm?.op === 'activate' ? <><CheckCircle2 size={13} /> Activate</> : <><X size={13} /> Deactivate</>}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.6 }}>
          {bulkConfirm?.op === 'activate'
            ? <>Activate <strong>{bulkConfirm.count}</strong> lead owner{bulkConfirm.count !== 1 ? 's' : ''}?</>
            : <>Deactivate <strong>{bulkConfirm?.count}</strong> lead owner{bulkConfirm?.count !== 1 ? 's' : ''}? They will no longer appear in the lead owner dropdown.</>}
        </p>
      </Modal>
    </>
  )
}
