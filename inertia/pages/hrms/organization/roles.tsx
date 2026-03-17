import { useState } from 'react'
import { router } from '@inertiajs/react'
import {
  ShieldCheck, Plus, Pencil, Trash2,
  Globe, User, Users, Settings,
  Search, X, RefreshCw, Lock,
} from 'lucide-react'
import { DataTable } from '~/components/data-table'
import type { DTColumn, VisibilityState } from '~/components/data-table'
import { Modal } from '~/components/modal'
import { SelectSearch } from '~/components/select-search'

const COLS_KEY = 'hrms-roles-cols-v1'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  id:            number
  name:          string
  description:   string | null
  dataAccess:    'all' | 'organization' | 'self' | 'custom'
  isDefault:     boolean
  employeeCount: number
}

interface OrgModule {
  enabled:  boolean
  addonIds: Array<{ id: number; enabled: boolean }>
  module:   { id: number; key: string; label: string; sortOrder: number; addons: any[] }
}

interface Props {
  profiles:   Profile[]
  orgModules: OrgModule[]
  canEdit:    boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DATA_ACCESS_OPTS = [
  { value: 'all',          label: 'All Data',     desc: 'Access to all organisation data' },
  { value: 'organization', label: 'Organisation',  desc: 'Access to own org data only' },
  { value: 'self',         label: 'Self Only',     desc: 'Access to own records only' },
  { value: 'custom',       label: 'Custom',        desc: 'Custom data scope' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function profileColor(name: string): [string, string] {
  const pre: Record<string, [string, string]> = {
    'Super Admin': ['#6366f1', '#eef2ff'], 'HR Admin': ['#0ea5e9', '#e0f2fe'],
    'Manager':     ['#10b981', '#d1fae5'], 'Employee': ['#f59e0b', '#fef3c7'],
  }
  if (pre[name]) return pre[name]
  const pool: [string, string][] = [
    ['#8b5cf6', '#ede9fe'], ['#ec4899', '#fce7f3'],
    ['#0D9488', '#ccfbf1'], ['#f97316', '#ffedd5'], ['#ef4444', '#fee2e2'],
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return pool[h % pool.length]
}

// ── DataAccess badge ──────────────────────────────────────────────────────────

function DataAccessBadge({ access }: { access: string }) {
  const cls: Record<string, string> = {
    all: 'bx bx-teal', organization: 'bx bx-sky', self: 'bx bx-purple', custom: 'bx bx-amber',
  }
  const lbl: Record<string, string> = {
    all: 'All Data', organization: 'Organisation', self: 'Self Only', custom: 'Custom',
  }
  return <span className={cls[access] ?? 'bx bx-gray'}>{lbl[access] ?? access}</span>
}

// ── DataAccess info box ───────────────────────────────────────────────────────

function DataAccessInfo({ value }: { value: string }) {
  const icons: Record<string, React.ReactNode> = {
    all: <Globe size={13} />, organization: <Users size={13} />, self: <User size={13} />, custom: <Settings size={13} />,
  }
  const descs: Record<string, string> = {
    all:          'This role can see and manage all data across the entire organisation.',
    organization: 'This role can see and manage data scoped to the organisation only.',
    self:         'This role can only see and manage their own personal data.',
    custom:       'Custom data scope — configure granular access rules manually.',
  }
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 11px', background: 'var(--p-lt)', borderRadius: 8, border: '1px solid var(--p-mid)' }}>
      <span style={{ color: 'var(--p)', flexShrink: 0, marginTop: 1 }}>{icons[value]}</span>
      <span style={{ fontSize: '.74rem', color: 'var(--text2)', lineHeight: 1.5 }}>{descs[value]}</span>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RolesPage({ profiles, orgModules, canEdit }: Props) {
  const [search,  setSearch]  = useState('')
  const [colVis,  setColVis]  = useState<VisibilityState>({})
  const [loading, setLoading] = useState(false)

  // Add modal
  const [addOpen,    setAddOpen]    = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addForm,    setAddForm]    = useState({ name: '', description: '', dataAccess: 'self' as Profile['dataAccess'] })

  // Edit modal
  const [editTarget,  setEditTarget]  = useState<Profile | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm,    setEditForm]    = useState({ name: '', description: '', dataAccess: 'self' as Profile['dataAccess'] })

  // Delete modal
  const [deleteTarget,  setDeleteTarget]  = useState<Profile | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filtered = search
    ? profiles.filter((p) => {
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
      })
    : profiles

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: DTColumn<Profile>[] = [
    {
      key: 'name',
      label: 'Role',
      pinned: true,
      minWidth: 220,
      render: (p) => {
        const [fg, bg] = profileColor(p.name)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={14} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)' }}>{p.name}</span>
                {p.isDefault && (
                  <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'var(--sky-lt)', color: 'var(--sky)', border: '1px solid rgba(3,105,161,.15)' }}>
                    Default
                  </span>
                )}
              </div>
              {p.description && (
                <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginTop: 1, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.description}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'dataAccess',
      label: 'Data Access',
      width: 140,
      render: (p) => <DataAccessBadge access={p.dataAccess} />,
    },
    {
      key: 'employees',
      label: 'Employees',
      width: 110,
      sortable: false,
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Users size={12} style={{ color: 'var(--text4)' }} />
          <span style={{ fontSize: '.8rem', color: 'var(--text2)', fontWeight: 600 }}>{p.employeeCount}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      pinned: true,
      width: canEdit ? 210 : 140,
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Permissions — navigate to dedicated page */}
          <button
            onClick={() => router.visit(`/hrms/organization/roles/${p.id}/permissions`)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)' }}
          >
            <Lock size={11} /> Permissions
          </button>

          {canEdit && (
            <>
              <button
                onClick={() => { setEditForm({ name: p.name, description: p.description ?? '', dataAccess: p.dataAccess }); setEditTarget(p) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--s)', background: 'var(--s-lt)', border: '1px solid rgba(5,150,105,.2)', cursor: 'pointer' }}
              >
                <Pencil size={11} /> Edit
              </button>
              <button
                onClick={() => setDeleteTarget(p)}
                disabled={p.isDefault}
                title={p.isDefault ? 'Default roles cannot be deleted' : `Delete ${p.name}`}
                style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 7px', borderRadius: 7, color: 'var(--text3)', background: 'transparent', border: '1px solid var(--border)', cursor: p.isDefault ? 'not-allowed' : 'pointer', opacity: p.isDefault ? .4 : 1 }}
                onMouseEnter={(e) => { if (!p.isDefault) { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.background = 'rgba(239,68,68,.06)' } }}
                onMouseLeave={(e) => { if (!p.isDefault) { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' } }}
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  function handleAdd() {
    if (!addForm.name.trim()) return
    setAddLoading(true)
    router.post('/hrms/organization/roles', {
      name:        addForm.name.trim(),
      description: addForm.description.trim() || undefined,
      dataAccess:  addForm.dataAccess,
    }, {
      onSuccess: () => { setAddOpen(false); setAddForm({ name: '', description: '', dataAccess: 'self' }); setAddLoading(false) },
      onError:   () => setAddLoading(false),
    })
  }

  function handleEdit() {
    if (!editTarget || !editForm.name.trim()) return
    setEditLoading(true)
    router.put(`/hrms/organization/roles/${editTarget.id}`, {
      name:        editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      dataAccess:  editForm.dataAccess,
    }, {
      onSuccess: () => { setEditTarget(null); setEditLoading(false) },
      onError:   () => setEditLoading(false),
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    router.delete(`/hrms/organization/roles/${deleteTarget.id}`, {
      onSuccess: () => { setDeleteTarget(null); setDeleteLoading(false) },
      onError:   () => setDeleteLoading(false),
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Page Header ── */}
      <div className="ph">
        <div>
          <div className="ph-title">Roles &amp; Permissions</div>
          <div className="ph-sub">Manage access roles and feature permissions for your organisation</div>
        </div>
        <div className="ph-right">
          {canEdit && (
            <button className="btn btn-p" onClick={() => setAddOpen(true)}>
              <Plus size={14} /> Add Role
            </button>
          )}
        </div>
      </div>

      {/* ── Summary row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Total Roles',       value: profiles.length,                                    color: '#0D9488', ico: <ShieldCheck size={16} /> },
          { label: 'Employees Covered', value: profiles.reduce((s, p) => s + p.employeeCount, 0),  color: '#7C3AED', ico: <Users       size={16} /> },
          { label: 'Modules Enabled',   value: orgModules.filter((m) => m.enabled).length,         color: '#0284C7', ico: <Lock        size={16} /> },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: stat.color + '14', border: `1px solid ${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              {stat.ico}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text1)', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--text3)', marginTop: 3, fontWeight: 600 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── DataTable card ── */}
      <div className="card">
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 300 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles…" />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <X size={12} style={{ color: 'var(--text3)' }} />
              </button>
            )}
          </div>
          <button className="btn btn-ghost" onClick={() => { setLoading(true); router.reload({ onFinish: () => setLoading(false) }) }} style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }}>
            <RefreshCw size={13} style={{ transition: 'transform .4s', transform: loading ? 'rotate(360deg)' : 'none' }} />
          </button>
          <span style={{ marginLeft: 'auto', fontSize: '.76rem', color: 'var(--text3)' }}>
            {filtered.length} role{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <DataTable<Profile>
          data={filtered}
          columns={columns}
          rowKey={(r) => r.id}
          clientPageSize={25}
          storageKey={COLS_KEY}
          noun="role"
          columnVisibility={colVis}
          onColumnVisibilityChange={setColVis}
          hideToolbar
          emptyIcon={<ShieldCheck size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
          emptyTitle={search ? 'No roles match your search' : 'No roles yet'}
          emptyDesc={search ? 'Try a different keyword.' : 'Add your first role to get started.'}
          emptyAction={!search && canEdit && (
            <button className="btn btn-p btn-sm" onClick={() => setAddOpen(true)} style={{ display: 'inline-flex' }}>
              <Plus size={13} /> Add Role
            </button>
          )}
        />
      </div>

      {/* ── ADD MODAL ── */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Role"
        size="sm"
        icon={<ShieldCheck size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn btn-p" disabled={addLoading || !addForm.name.trim()} onClick={handleAdd}>
              {addLoading ? 'Creating…' : <><Plus size={13} /> Create Role</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Role Name <span className="req">*</span></label>
            <input className="fi" value={addForm.name} autoFocus
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. HR Manager" />
          </div>
          <div className="fg">
            <label>Description</label>
            <input className="fi" value={addForm.description}
              onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description…" />
          </div>
          <div className="fg">
            <label>Data Access</label>
            <SelectSearch
              value={addForm.dataAccess}
              onChange={(v) => setAddForm((f) => ({ ...f, dataAccess: v as Profile['dataAccess'] }))}
              options={DATA_ACCESS_OPTS.map((o) => ({ value: o.value, label: o.label, sub: o.desc }))}
              placeholder="Select data access"
            />
          </div>
          <DataAccessInfo value={addForm.dataAccess} />
        </div>
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Role"
        size="sm"
        icon={<Pencil size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditTarget(null)}>Cancel</button>
            <button className="btn btn-p" disabled={editLoading || !editForm.name.trim()} onClick={handleEdit}>
              {editLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Role Name <span className="req">*</span></label>
            <input className="fi" value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Description</label>
            <input className="fi" value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Data Access</label>
            <SelectSearch
              value={editForm.dataAccess}
              onChange={(v) => setEditForm((f) => ({ ...f, dataAccess: v as Profile['dataAccess'] }))}
              options={DATA_ACCESS_OPTS.map((o) => ({ value: o.value, label: o.label, sub: o.desc }))}
              placeholder="Select data access"
            />
          </div>
          <DataAccessInfo value={editForm.dataAccess} />
        </div>
      </Modal>

      {/* ── DELETE MODAL ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Role"
        size="sm"
        variant="danger"
        icon={<Trash2 size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" disabled={deleteLoading} onClick={handleDelete}>
              {deleteLoading ? 'Deleting…' : <><Trash2 size={13} /> Delete Role</>}
            </button>
          </>
        }
      >
        {deleteTarget && (
          deleteTarget.employeeCount > 0 ? (
            <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>
              <strong style={{ color: '#ef4444' }}>Cannot delete</strong> — <strong>{deleteTarget.employeeCount}</strong> employee{deleteTarget.employeeCount !== 1 ? 's are' : ' is'} assigned to <strong style={{ color: 'var(--text1)' }}>{deleteTarget.name}</strong>. Reassign them first.
            </p>
          ) : (
            <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>
              Delete role <strong style={{ color: 'var(--text1)' }}>{deleteTarget.name}</strong>? All permissions for this role will be permanently removed. This cannot be undone.
            </p>
          )
        )}
      </Modal>
    </>
  )
}
