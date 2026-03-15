import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  Clock, Plus, Check, Trash2, Pencil, Search, RefreshCw, X,
  ToggleLeft, ToggleRight, AlertCircle,
} from 'lucide-react'
import { Modal } from '~/components/modal'
import { DataTable, type DTColumn } from '~/components/data-table'
import { SelectSearch, type SelectOption } from '~/components/select-search'

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

function daysLabel(n: number): string {
  return `${n} day${n !== 1 ? 's' : ''}`
}

function getLabel(np: NoticePeriod): string {
  return np.designationName ?? np.designation?.name ?? 'Default (All Designations)'
}

// ── Columns ───────────────────────────────────────────────────────────────────

function buildColumns(
  onEdit: (np: NoticePeriod) => void,
  onDelete: (np: NoticePeriod) => void,
  onToggle: (np: NoticePeriod) => void,
): DTColumn<NoticePeriod>[] {
  return [
    {
      key: 'designation',
      label: 'Designation',
      pinned: true,
      render: (np) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: np.designationId ? 'var(--p-lt)' : 'var(--bg2)', border: `1px solid ${np.designationId ? 'var(--p-mid)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {np.designationId
              ? <Clock size={12} style={{ color: 'var(--p)' }} />
              : <AlertCircle size={12} style={{ color: 'var(--text3)' }} />
            }
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '.83rem' }}>{getLabel(np)}</div>
            {!np.designationId && (
              <div style={{ fontSize: '.71rem', color: 'var(--text4)' }}>Applies to all designations</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'noticeDays',
      label: 'Notice Period',
      width: 160,
      render: (np) => (
        <span className="bx bx-teal" style={{ fontSize: '.83rem', fontWeight: 700 }}>
          {daysLabel(np.noticeDays)}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      width: 110,
      align: 'center',
      render: (np) => (
        <span className={`bx ${np.isActive ? 'bx-teal' : 'bx-gray'}`}>
          {np.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 140,
      pinned: true,
      render: (np) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => onEdit(np)}
            title="Edit"
            style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', color: 'var(--p)', cursor: 'pointer' }}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onToggle(np)}
            title={np.isActive ? 'Deactivate' : 'Activate'}
            style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: np.isActive ? 'var(--teal-lt)' : 'var(--bg2)', border: `1px solid ${np.isActive ? 'rgba(20,184,166,.2)' : 'var(--border)'}`, color: np.isActive ? 'var(--teal)' : 'var(--text3)', cursor: 'pointer' }}
          >
            {np.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button
            onClick={() => onDelete(np)}
            title="Delete"
            style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--danger-lt)', border: '1px solid rgba(220,38,38,.15)', color: 'var(--danger)', cursor: 'pointer' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]
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

  const [toggleTarget, setToggleTarget]         = useState<NoticePeriod | null>(null)
  const [toggleProcessing, setToggleProcessing] = useState(false)

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
  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/notice-period/${deleteTarget.id}`, {
      onSuccess: () => { setDeleteOpen(false); setDeleteTarget(null) },
      onFinish:  () => setDeleteProcessing(false),
    })
  }

  // ── Toggle ─────────────────────────────────────────────────────────────────
  function handleToggle() {
    if (!toggleTarget) return
    setToggleProcessing(true)
    router.patch(`/hrms/organization/settings/notice-period/${toggleTarget.id}/toggle`, {}, {
      onSuccess: () => { setToggleTarget(null) },
      onFinish:  () => setToggleProcessing(false),
    })
  }

  const desigOptions: SelectOption[] = [
    { value: '', label: 'Default (All Designations)' },
    ...designations.map((d) => ({ value: String(d.id), label: d.name, sub: d.code })),
  ]

  const columns = buildColumns(openEdit, (np) => { setDeleteTarget(np); setDeleteOpen(true) }, setToggleTarget)

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

        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(np) => np.id}
          noun="notice periods"
          emptyIcon={<Clock size={36} style={{ opacity: .15, color: 'var(--text3)' }} />}
          emptyTitle="No notice periods configured"
          emptyDesc="Configure notice periods per designation."
        />
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
            <SelectSearch
              value={desigId}
              onChange={setDesigId}
              options={desigOptions}
              placeholder="Default (All Designations)"
            />
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

      {/* ════════ TOGGLE MODAL ════════ */}
      <Modal
        open={toggleTarget !== null}
        onClose={() => setToggleTarget(null)}
        title={toggleTarget?.isActive ? 'Deactivate Notice Period' : 'Activate Notice Period'}
        size="sm"
        variant={toggleTarget?.isActive ? 'danger' : undefined}
        icon={toggleTarget?.isActive ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setToggleTarget(null)}>Cancel</button>
            <button
              className={`btn ${toggleTarget?.isActive ? 'btn-danger' : 'btn-p'}`}
              disabled={toggleProcessing}
              onClick={handleToggle}
            >
              {toggleProcessing ? 'Saving…' : toggleTarget?.isActive ? 'Yes, Deactivate' : 'Yes, Activate'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>
          {toggleTarget?.isActive
            ? <>Deactivate the notice period for <strong style={{ color: 'var(--text1)' }}>{toggleTarget ? getLabel(toggleTarget) : ''}</strong>? It will be marked inactive.</>
            : <>Activate the notice period for <strong style={{ color: 'var(--text1)' }}>{toggleTarget ? getLabel(toggleTarget) : ''}</strong>? It will be marked active.</>
          }
        </p>
      </Modal>
    </>
  )
}
