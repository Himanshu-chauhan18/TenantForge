import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  Clock, Plus, Edit2, Trash2, X, Check, Search, RefreshCw, AlertCircle,
} from 'lucide-react'
import { Modal } from '~/components/modal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface NoticePeriod {
  id: number
  designationId: number | null
  designationName: string | null
  noticeDays: number
  isActive: boolean
  designation?: { name: string }
}

interface Designation { id: number; name: string; code: string }

interface Props {
  noticePeriods: NoticePeriod[]
  designations: Designation[]
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
        <Clock size={40} />
      </div>
      <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
        {search ? 'No notice periods match your search' : 'No notice periods configured'}
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--text4)' }}>
        {search ? 'Try a different keyword.' : 'Configure notice periods per designation.'}
      </div>
    </div>
  )
}

function daysLabel(n: number): string {
  return `${n} day${n !== 1 ? 's' : ''}`
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NoticePeriodPage({ noticePeriods, designations }: Props) {
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<NoticePeriod | null>(null)
  const [desigId, setDesigId]       = useState<string>('')
  const [noticeDays, setNoticeDays] = useState<string>('')
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  const [deleteOpen, setDeleteOpen]             = useState(false)
  const [deleteTarget, setDeleteTarget]         = useState<NoticePeriod | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const off1 = router.on('start',  () => setIsLoading(true))
    const off2 = router.on('finish', () => setIsLoading(false))
    return () => { off1(); off2() }
  }, [])

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = noticePeriods.filter((np) => {
    if (!search) return true
    const q = search.toLowerCase()
    const label = np.designationName ?? np.designation?.name ?? 'default'
    return label.toLowerCase().includes(q)
  })

  // ── Open modals ────────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setDesigId('')
    setNoticeDays('')
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(np: NoticePeriod) {
    setEditTarget(np)
    setDesigId(np.designationId !== null ? String(np.designationId) : '')
    setNoticeDays(String(np.noticeDays))
    setErrors({})
    setModalOpen(true)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    const e: Record<string, string> = {}
    const days = parseInt(noticeDays, 10)
    if (!noticeDays || isNaN(days) || days < 1) e.noticeDays = 'Enter a valid number of days (≥ 1)'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setProcessing(true)
    const payload = {
      designationId: desigId ? Number(desigId) : null,
      noticeDays:    days,
    }
    if (editTarget) {
      router.put(`/hrms/organization/settings/notice-period/${editTarget.id}`, payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/notice-period', payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function openDelete(np: NoticePeriod) {
    setDeleteTarget(np)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/notice-period/${deleteTarget.id}`, {
      onSuccess: () => { setDeleteOpen(false); setDeleteTarget(null) },
      onFinish:  () => setDeleteProcessing(false),
    })
  }

  function getLabel(np: NoticePeriod): string {
    return np.designationName ?? np.designation?.name ?? 'Default (All Designations)'
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">Notice Period</div>
          <div className="ph-sub">Configure notice period requirements per designation</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}>
            <Plus size={14} /> Add Notice Period
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        {/* Toolbar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 320 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by designation…" />
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
            {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'}
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
                  <Th>Designation</Th>
                  <Th style={{ width: 180 }}>Notice Period</Th>
                  <Th style={{ textAlign: 'center', width: 110 }}>Status</Th>
                  <Th style={{ width: 100 }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((np) => (
                  <tr key={np.id}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: np.designationId ? 'var(--p-lt)' : 'var(--bg2)', border: `1px solid ${np.designationId ? 'var(--p-mid)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {np.designationId
                            ? <Clock size={12} style={{ color: 'var(--p)' }} />
                            : <AlertCircle size={12} style={{ color: 'var(--text3)' }} />
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '.83rem' }}>
                            {getLabel(np)}
                          </div>
                          {!np.designationId && (
                            <div style={{ fontSize: '.71rem', color: 'var(--text4)' }}>Applies to all designations</div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="bx bx-teal" style={{ fontSize: '.83rem', fontWeight: 700 }}>
                        {daysLabel(np.noticeDays)}
                      </span>
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span className={`bx ${np.isActive ? 'bx-teal' : 'bx-gray'}`}>
                        {np.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => openEdit(np)}
                          title="Edit"
                          style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', color: 'var(--p)', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(np)}
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
        title={editTarget ? 'Edit Notice Period' : 'Add Notice Period'}
        size="sm"
        icon={<Clock size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
              {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Designation</label>
            <select
              className="fi"
              value={desigId}
              onChange={(e) => setDesigId(e.target.value)}
            >
              <option value="">Default (All Designations)</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
            <div className="fg-hint">Leave blank to apply as default for all designations.</div>
          </div>

          <div className="fg">
            <label>Notice Period (days) <span className="req">*</span></label>
            <input
              type="number"
              className="fi"
              value={noticeDays}
              onChange={(e) => { setNoticeDays(e.target.value); setErrors((err) => { const n = { ...err }; delete n.noticeDays; return n }) }}
              placeholder="e.g. 30"
              min={1}
              autoFocus
            />
            {errors.noticeDays && <div className="fg-err">{errors.noticeDays}</div>}
          </div>
        </div>
      </Modal>

      {/* ════════ DELETE MODAL ════════ */}
      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        title="Delete Notice Period"
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
          Are you sure you want to delete the notice period for{' '}
          <strong style={{ color: 'var(--text1)' }}>
            {deleteTarget ? getLabel(deleteTarget) : ''}
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}
