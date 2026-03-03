import { useState, useRef, useEffect } from 'react'
import { Link, router } from '@inertiajs/react'
import {
  Building2, Plus, Search, Filter, Download, ChevronDown,
  MoreHorizontal, Eye, Pencil, Trash2, CheckSquare, X,
  ChevronLeft, ChevronRight, Users, RefreshCw,
} from 'lucide-react'

interface Org {
  id: number
  org_id: string
  name: string
  plan_type: 'trial' | 'premium'
  status: 'active' | 'inactive' | 'expired'
  user_limit: number
  plan_start: string | null
  plan_end: string | null
  created_at: string
  is_archived: boolean
  lead_owner: { id: number; full_name?: string; email: string } | null
}

interface Meta {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

interface OrgsData {
  data: Org[]
  meta: Meta
}

interface User {
  id: number
  email: string
  full_name?: string
}

interface Props {
  orgs: OrgsData
  users: User[]
  flash?: { success?: string; errors?: Record<string, string> }
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'trial', label: 'Trial' },
  { key: 'unsubscribed', label: 'Unsubscribed' },
  { key: 'exceeds', label: 'Exceeds Limit' },
  { key: 'archived', label: 'Archived' },
]

const BULK_OPS = [
  { key: 'activate', label: 'Set Active' },
  { key: 'deactivate', label: 'Set Inactive' },
  { key: 'archive', label: 'Archive' },
  { key: 'unarchive', label: 'Unarchive' },
  { key: 'delete', label: 'Delete', danger: true },
]

export default function OrganizationsIndex({ orgs, users, flash }: Props) {
  const [selected, setSelected] = useState<number[]>([])
  const [bulkOpen, setBulkOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [rowMenuOpen, setRowMenuOpen] = useState<number | null>(null)
  const bulkRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  // Read current filters from URL
  const url = new URL(window.location.href)
  const currentTab = url.searchParams.get('tab') || 'all'
  const currentSearch = url.searchParams.get('search') || ''
  const currentPage = Number(url.searchParams.get('page') || 1)
  const currentLeadOwner = url.searchParams.get('lead_owner_id') || ''
  const currentSortBy = url.searchParams.get('sort_by') || 'created_at'
  const currentSortDir = url.searchParams.get('sort_dir') || 'desc'

  const [search, setSearch] = useState(currentSearch)

  const { data: rows, meta } = orgs

  useEffect(() => {
    function closeMenus(e: MouseEvent) {
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) setBulkOpen(false)
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
      setRowMenuOpen(null)
    }
    document.addEventListener('mousedown', closeMenus)
    return () => document.removeEventListener('mousedown', closeMenus)
  }, [])

  function navigate(params: Record<string, string | number | undefined>) {
    const p: Record<string, string> = {}
    const merged = { tab: currentTab, search: currentSearch, page: '1', lead_owner_id: currentLeadOwner, sort_by: currentSortBy, sort_dir: currentSortDir, ...params }
    Object.entries(merged).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) p[k] = String(v) })
    router.get('/organizations', p, { preserveState: true, replace: true })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({ search, page: 1 })
  }

  function handleTab(key: string) {
    setSelected([])
    navigate({ tab: key, search: '', page: 1 })
  }

  function handleSort(col: string) {
    const dir = currentSortBy === col && currentSortDir === 'asc' ? 'desc' : 'asc'
    navigate({ sort_by: col, sort_dir: dir })
  }

  function toggleAll() {
    setSelected(selected.length === rows.length ? [] : rows.map((r) => r.id))
  }

  function toggleRow(id: number) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  function handleBulk(operation: string) {
    if (selected.length === 0) return
    if (operation === 'delete' && !confirm(`Delete ${selected.length} organization(s)? This cannot be undone.`)) return
    router.post('/organizations/bulk', { ids: selected, operation }, {
      onSuccess: () => setSelected([]),
    })
    setBulkOpen(false)
  }

  function handleDelete(id: number) {
    router.delete(`/organizations/${id}`)
    setDeleteConfirm(null)
  }

  function handleExport() {
    const p = new URLSearchParams({ tab: currentTab, search: currentSearch })
    window.open(`/organizations/export?${p}`, '_blank')
  }

  const sortIcon = (col: string) => {
    if (currentSortBy !== col) return <span style={{ opacity: .2 }}>↕</span>
    return currentSortDir === 'asc' ? <span style={{ color: 'var(--p)' }}>↑</span> : <span style={{ color: 'var(--p)' }}>↓</span>
  }

  const pct = (org: Org) => {
    // no current user count in this list view; just show limit
    return 0
  }

  return (
    <>
      {/* Flash */}
      {flash?.success && (
        <div className="alert alert-success">{flash.success}</div>
      )}
      {flash?.errors && Object.values(flash.errors).map((e, i) => (
        <div key={i} className="alert alert-danger">{e}</div>
      ))}

      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">Organizations</div>
          <div className="ph-sub">{meta.total.toLocaleString()} total organizations</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>
            <Download size={13} /> Export CSV
          </button>
          <Link href="/organizations/create" className="btn btn-p">
            <Plus size={14} /> Add Organization
          </Link>
        </div>
      </div>

      <div className="card">
        {/* Tabs */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <div className="tab-row" style={{ display: 'inline-flex' }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`tab ${currentTab === t.key ? 'on' : ''}`}
                onClick={() => handleTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', flex: '1', minWidth: 180, maxWidth: 320 }}>
            <div className="sb-inp" style={{ flex: 1 }}>
              <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations…"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(''); navigate({ search: '', page: 1 }) }}>
                  <X size={12} style={{ color: 'var(--text3)' }} />
                </button>
              )}
            </div>
          </form>

          {/* Lead owner filter */}
          <select
            className="fb fi-sel"
            style={{ height: 36, paddingTop: 0, paddingBottom: 0 }}
            value={currentLeadOwner}
            onChange={(e) => navigate({ lead_owner_id: e.target.value, page: 1 })}
          >
            <option value="">All Lead Owners</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
            ))}
          </select>

          {/* Refresh */}
          <button className="ibtn" title="Refresh" onClick={() => router.reload()}>
            <RefreshCw size={14} />
          </button>

          {/* Bulk actions */}
          {selected.length > 0 && (
            <div className="relative" ref={bulkRef} style={{ marginLeft: 'auto' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setBulkOpen(!bulkOpen)}>
                <CheckSquare size={13} />
                {selected.length} selected
                <ChevronDown size={12} />
              </button>
              <div className={`drop-menu ${bulkOpen ? 'open' : ''}`} style={{ right: 0, top: '100%', marginTop: 4 }}>
                {BULK_OPS.map((op) => (
                  <button
                    key={op.key}
                    className={`drop-item ${op.danger ? 'danger' : ''}`}
                    onClick={() => handleBulk(op.key)}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="tw">
          <table className="dt">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    className="ck"
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: 'inherit' }} onClick={() => handleSort('name')}>
                    Organization {sortIcon('name')}
                  </button>
                </th>
                <th>Plan</th>
                <th>Status</th>
                <th>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: 'inherit' }} onClick={() => handleSort('user_limit')}>
                    User Limit {sortIcon('user_limit')}
                  </button>
                </th>
                <th>Lead Owner</th>
                <th>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: 'inherit' }} onClick={() => handleSort('plan_end')}>
                    Plan End {sortIcon('plan_end')}
                  </button>
                </th>
                <th>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', color: 'inherit' }} onClick={() => handleSort('created_at')}>
                    Created {sortIcon('created_at')}
                  </button>
                </th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px 14px', color: 'var(--text4)' }}>
                    <Building2 size={28} style={{ display: 'block', margin: '0 auto 10px', opacity: .3 }} />
                    No organizations found.{' '}
                    <Link href="/organizations/create" style={{ color: 'var(--p)', fontWeight: 700 }}>Add the first one →</Link>
                  </td>
                </tr>
              ) : (
                rows.map((org) => {
                  const isSelected = selected.includes(org.id)
                  const isMenuOpen = rowMenuOpen === org.id
                  return (
                    <tr key={org.id} style={{ background: isSelected ? 'var(--p-lt)' : undefined }}>
                      <td>
                        <input type="checkbox" className="ck" checked={isSelected} onChange={() => toggleRow(org.id)} />
                      </td>
                      <td>
                        <Link href={`/organizations/${org.id}`} className="org-r">
                          <div className="org-av">{org.name.slice(0, 2).toUpperCase()}</div>
                          <div>
                            <div className="org-n">{org.name}</div>
                            <div className="org-d">{org.org_id}</div>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <span className={`bx ${org.plan_type === 'premium' ? 'bx-teal' : 'bx-sky'}`}>
                          {org.plan_type === 'premium' ? 'Premium' : 'Trial'}
                        </span>
                      </td>
                      <td>
                        <span className={`bx ${org.status === 'active' ? 'bx-green' : org.status === 'expired' ? 'bx-red' : 'bx-gray'}`}>
                          {org.status}
                        </span>
                        {org.is_archived && <span className="bx bx-amber" style={{ marginLeft: 4 }}>Archived</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Users size={11} style={{ color: 'var(--text3)' }} />
                          <span>{org.user_limit}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text3)' }}>
                        {org.lead_owner ? (org.lead_owner.full_name || org.lead_owner.email) : '—'}
                      </td>
                      <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {org.plan_end ? new Date(org.plan_end).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {new Date(org.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div className="relative">
                          <button className="ibtn" onClick={() => setRowMenuOpen(isMenuOpen ? null : org.id)}>
                            <MoreHorizontal size={15} />
                          </button>
                          <div className={`drop-menu ${isMenuOpen ? 'open' : ''}`} style={{ right: 0, top: '100%', marginTop: 4 }}>
                            <Link href={`/organizations/${org.id}`} className="drop-item">
                              <Eye size={13} /> View
                            </Link>
                            <Link href={`/organizations/${org.id}/edit`} className="drop-item">
                              <Pencil size={13} /> Edit
                            </Link>
                            <div className="drop-sep" />
                            <button
                              className="drop-item danger"
                              onClick={() => setDeleteConfirm(org.id)}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.73rem', color: 'var(--text3)' }}>
              Page {meta.current_page} of {meta.last_page} &middot; {meta.total.toLocaleString()} total
            </div>
            <div className="pg">
              <button
                className="pgb"
                disabled={meta.current_page <= 1}
                onClick={() => navigate({ page: meta.current_page - 1 })}
              >
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => {
                const p = meta.last_page <= 7 ? i + 1 : Math.max(1, meta.current_page - 3) + i
                if (p > meta.last_page) return null
                return (
                  <button
                    key={p}
                    className={`pgb ${p === meta.current_page ? 'on' : ''}`}
                    onClick={() => navigate({ page: p })}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                className="pgb"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => navigate({ page: meta.current_page + 1 })}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm !== null && (
        <>
          <div className="ov open" onClick={() => setDeleteConfirm(null)} />
          <div className="ov open" style={{ zIndex: 1001 }}>
            <div className="modal modal-sm">
              <div className="mh">
                <div className="mt">Delete Organization</div>
                <button className="xbtn" onClick={() => setDeleteConfirm(null)}><X size={14} /></button>
              </div>
              <div className="mb">
                <p style={{ fontSize: '.85rem', color: 'var(--text2)' }}>
                  Are you sure you want to delete this organization? This action cannot be undone.
                </p>
              </div>
              <div className="mf">
                <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
