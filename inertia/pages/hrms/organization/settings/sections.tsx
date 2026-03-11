import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  LayoutGrid, Plus, Edit2, Trash2, X, Check, Search, RefreshCw,
} from 'lucide-react'
import { Modal } from '~/components/modal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Section {
  id: number
  code: string
  name: string
  departmentId: number | null
  isActive: boolean
  department?: { name: string }
}

interface Department { id: number; name: string; code: string }

interface Props {
  sections:    Section[]
  departments: Department[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Th({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', whiteSpace: 'nowrap', background: 'var(--bg2)', ...style }}>
      {children}
    </th>
  )
}

function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '11px 14px', verticalAlign: 'middle', fontSize: '.82rem', color: 'var(--text2)', borderBottom: '1px solid var(--border)', ...style }}>
      {children}
    </td>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ opacity: .15, color: 'var(--text3)', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
        <LayoutGrid size={40} />
      </div>
      <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
        {search ? 'No sections match your search' : 'No sections yet'}
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--text4)' }}>
        {search ? 'Try a different keyword.' : 'Add sections to further organise departments.'}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SectionsPage({ sections, departments }: Props) {
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<Section | null>(null)
  const [name, setName]             = useState('')
  const [deptId, setDeptId]         = useState<string>('')
  const [nameError, setNameError]   = useState('')
  const [processing, setProcessing] = useState(false)

  const [deleteOpen, setDeleteOpen]             = useState(false)
  const [deleteTarget, setDeleteTarget]         = useState<Section | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const off1 = router.on('start',  () => setIsLoading(true))
    const off2 = router.on('finish', () => setIsLoading(false))
    return () => { off1(); off2() }
  }, [])

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = sections.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.department?.name ?? '').toLowerCase().includes(q)
    )
  })

  // ── Open modals ────────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setName('')
    setDeptId('')
    setNameError('')
    setModalOpen(true)
  }

  function openEdit(s: Section) {
    setEditTarget(s)
    setName(s.name)
    setDeptId(s.departmentId !== null ? String(s.departmentId) : '')
    setNameError('')
    setModalOpen(true)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (!name.trim()) { setNameError('Section name is required'); return }
    setNameError('')
    setProcessing(true)
    const payload = {
      name:         name.trim(),
      departmentId: deptId ? Number(deptId) : null,
    }
    if (editTarget) {
      router.put(`/hrms/organization/settings/sections/${editTarget.id}`, payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/sections', payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function openDelete(s: Section) {
    setDeleteTarget(s)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/sections/${deleteTarget.id}`, {
      onSuccess: () => { setDeleteOpen(false); setDeleteTarget(null) },
      onFinish:  () => setDeleteProcessing(false),
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">Sections</div>
          <div className="ph-sub">Manage sections within departments for fine-grained organisation</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}>
            <Plus size={14} /> Add Section
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        {/* Toolbar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 320 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sections…" />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <X size={12} style={{ color: 'var(--text3)' }} />
              </button>
            )}
          </div>
          <button className="btn btn-ghost" title="Refresh" onClick={() => router.reload()} style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }}>
            <RefreshCw size={13} style={{ transition: 'transform .4s', transform: isLoading ? 'rotate(360deg)' : 'none' }} />
          </button>
          <div style={{ marginLeft: 'auto', fontSize: '.76rem', color: 'var(--text3)' }}>
            {filtered.length} section{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div className="tw">
          {filtered.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <table className="dt">
              <thead>
                <tr>
                  <Th style={{ width: 140 }}>Code</Th>
                  <Th>Name</Th>
                  <Th style={{ width: 200 }}>Department</Th>
                  <Th style={{ textAlign: 'center', width: 110 }}>Status</Th>
                  <Th style={{ width: 100 }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <Td>
                      <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text2)', fontFamily: 'monospace' }}>
                        {s.code}
                      </code>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--sky-lt)', border: '1px solid rgba(3,105,161,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <LayoutGrid size={12} style={{ color: 'var(--sky)' }} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '.83rem' }}>{s.name}</span>
                      </div>
                    </Td>
                    <Td>
                      {s.department?.name
                        ? <span className="bx bx-purple" style={{ fontSize: '.75rem' }}>{s.department.name}</span>
                        : <span style={{ color: 'var(--text4)', fontSize: '.78rem' }}>—</span>
                      }
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span className={`bx ${s.isActive ? 'bx-teal' : 'bx-gray'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => openEdit(s)}
                          title="Edit"
                          style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', color: 'var(--p)', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(s)}
                          title="Delete"
                          style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--danger-lt)', border: '1px solid rgba(220,38,38,.15)', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ════════ ADD / EDIT MODAL ════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Section' : 'Add Section'}
        size="sm"
        icon={<LayoutGrid size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
              {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create Section</>}
            </button>
          </>
        }
      >
        {editTarget && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 16 }}>
            <LayoutGrid size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <span style={{ fontSize: '.74rem', color: 'var(--text3)' }}>Code:</span>
            <code style={{ fontSize: '.74rem', color: 'var(--text2)', fontFamily: 'monospace', fontWeight: 600 }}>{editTarget.code}</code>
            <span style={{ fontSize: '.68rem', color: 'var(--text4)', marginLeft: 4 }}>(auto-generated, read-only)</span>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Section Name <span className="req">*</span></label>
            <input
              className="fi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              placeholder="e.g. Accounts Payable"
              autoFocus
            />
            {nameError && <div className="fg-err">{nameError}</div>}
          </div>
          <div className="fg">
            <label>Department</label>
            <select className="fi" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
              <option value="">— None —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
            <div className="fg-hint">Optionally link this section to a parent department.</div>
          </div>
        </div>
      </Modal>

      {/* ════════ DELETE MODAL ════════ */}
      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        title="Delete Section"
        size="sm"
        variant="danger"
        icon={<Trash2 size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => { setDeleteOpen(false); setDeleteTarget(null) }}>Cancel</button>
            <button className="btn btn-danger" disabled={deleteProcessing} onClick={handleDelete}>
              {deleteProcessing ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>
          Are you sure you want to delete section{' '}
          <strong style={{ color: 'var(--text1)' }}>{deleteTarget?.name}</strong>
          {deleteTarget?.code && (
            <> (<code style={{ fontSize: '.78rem', background: 'var(--bg2)', padding: '1px 6px', borderRadius: 4 }}>{deleteTarget.code}</code>)</>
          )}
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}
