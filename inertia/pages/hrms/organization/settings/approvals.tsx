import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  GitBranch, Plus, Check, Trash2, Pencil, Search, RefreshCw, X,
  Mail, MailX, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { Modal } from '~/components/modal'
import { DataTable, type DTColumn } from '~/components/data-table'
import { SelectSearch, type SelectOption } from '~/components/select-search'
import { Checkbox } from '~/components/checkbox'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Approval {
  id: number
  moduleName: string
  approvalType: string
  basedOn: 'designation' | 'division'
  referenceId: number | null
  referenceName: string | null
  escalationPeriodDays: number
  sendMailOnEscalation: boolean
  isActive: boolean
}

interface Designation { id: number; name: string }
interface Division    { id: number; name: string }

interface Props {
  approvals:    Approval[]
  designations: Designation[]
  divisions:    Division[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const APPROVAL_TYPES = [
  'Resignation',
  'Termination',
  'Personal Requisition',
  'Leave',
  'Expense',
  'Other',
] as const

type ApprovalType = typeof APPROVAL_TYPES[number]

const APPROVAL_TYPE_COLOR: Record<string, string> = {
  'Resignation':           'bx-red',
  'Termination':           'bx-red',
  'Personal Requisition':  'bx-purple',
  'Leave':                 'bx-teal',
  'Expense':               'bx-amber',
  'Other':                 'bx-gray',
}

// ── Default form state ────────────────────────────────────────────────────────

function defaultForm() {
  return {
    moduleName:           '',
    approvalType:         'Leave' as ApprovalType,
    basedOn:              'designation' as 'designation' | 'division',
    referenceId:          '' as string,
    escalationPeriodDays: '3',
    sendMailOnEscalation: false,
  }
}

// ── Columns ───────────────────────────────────────────────────────────────────

function buildColumns(
  onEdit: (a: Approval) => void,
  onDelete: (a: Approval) => void,
  onToggle: (a: Approval) => void,
): DTColumn<Approval>[] {
  return [
    {
      key: 'moduleName',
      label: 'Module',
      pinned: true,
      render: (a) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GitBranch size={12} style={{ color: 'var(--p)' }} />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '.83rem' }}>{a.moduleName}</span>
        </div>
      ),
    },
    {
      key: 'approvalType',
      label: 'Approval Type',
      width: 180,
      render: (a) => (
        <span className={`bx ${APPROVAL_TYPE_COLOR[a.approvalType] ?? 'bx-gray'}`}>
          {a.approvalType}
        </span>
      ),
    },
    {
      key: 'basedOn',
      label: 'Based On',
      width: 120,
      render: (a) => (
        <span className={`bx ${a.basedOn === 'designation' ? 'bx-purple' : 'bx-green'}`}>
          {a.basedOn === 'designation' ? 'Designation' : 'Division'}
        </span>
      ),
    },
    {
      key: 'referenceName',
      label: 'Reference',
      width: 160,
      render: (a) => (
        <span style={{ fontSize: '.8rem', color: a.referenceName ? 'var(--text1)' : 'var(--text4)', fontWeight: a.referenceName ? 600 : 400 }}>
          {a.referenceName ?? '—'}
        </span>
      ),
    },
    {
      key: 'escalationPeriodDays',
      label: 'Escalation',
      width: 120,
      align: 'center',
      render: (a) => (
        <span className="bx bx-amber" style={{ fontSize: '.8rem' }}>
          {a.escalationPeriodDays} day{a.escalationPeriodDays !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'sendMailOnEscalation',
      label: 'Mail',
      width: 70,
      align: 'center',
      render: (a) => (
        a.sendMailOnEscalation
          ? <Mail size={15} style={{ color: 'var(--p)', margin: '0 auto' }} />
          : <MailX size={15} style={{ color: 'var(--text4)', margin: '0 auto' }} />
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      width: 100,
      align: 'center',
      render: (a) => (
        <span className={`bx ${a.isActive ? 'bx-teal' : 'bx-gray'}`}>
          {a.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 140,
      pinned: true,
      render: (a) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => onEdit(a)}
            title="Edit"
            style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', color: 'var(--p)', cursor: 'pointer' }}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onToggle(a)}
            title={a.isActive ? 'Deactivate' : 'Activate'}
            style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.isActive ? 'var(--teal-lt)' : 'var(--bg2)', border: `1px solid ${a.isActive ? 'rgba(20,184,166,.2)' : 'var(--border)'}`, color: a.isActive ? 'var(--teal)' : 'var(--text3)', cursor: 'pointer' }}
          >
            {a.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button
            onClick={() => onDelete(a)}
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

export default function ApprovalsPage({ approvals, designations, divisions }: Props) {
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<Approval | null>(null)
  const [form, setForm]             = useState(defaultForm())
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  const [deleteOpen, setDeleteOpen]             = useState(false)
  const [deleteTarget, setDeleteTarget]         = useState<Approval | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [toggleTarget, setToggleTarget]         = useState<Approval | null>(null)
  const [toggleProcessing, setToggleProcessing] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const off1 = router.on('start',  () => setIsLoading(true))
    const off2 = router.on('finish', () => setIsLoading(false))
    return () => { off1(); off2() }
  }, [])

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = approvals.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.moduleName.toLowerCase().includes(q) ||
      a.approvalType.toLowerCase().includes(q) ||
      (a.referenceName ?? '').toLowerCase().includes(q)
    )
  })

  // ── Field setter ───────────────────────────────────────────────────────────
  function setField<K extends keyof ReturnType<typeof defaultForm>>(key: K, value: ReturnType<typeof defaultForm>[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  // ── Open modals ────────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setForm(defaultForm())
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(a: Approval) {
    setEditTarget(a)
    setForm({
      moduleName:           a.moduleName,
      approvalType:         (APPROVAL_TYPES.includes(a.approvalType as ApprovalType) ? a.approvalType : 'Other') as ApprovalType,
      basedOn:              a.basedOn,
      referenceId:          a.referenceId !== null ? String(a.referenceId) : '',
      escalationPeriodDays: String(a.escalationPeriodDays),
      sendMailOnEscalation: a.sendMailOnEscalation,
    })
    setErrors({})
    setModalOpen(true)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    const e: Record<string, string> = {}
    if (!form.moduleName.trim()) e.moduleName = 'Module name is required'
    const days = parseInt(form.escalationPeriodDays, 10)
    if (isNaN(days) || days < 0) e.escalationPeriodDays = 'Enter a valid number of days'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setProcessing(true)
    const payload = {
      moduleName:           form.moduleName.trim(),
      approvalType:         form.approvalType,
      basedOn:              form.basedOn,
      referenceId:          form.referenceId ? Number(form.referenceId) : null,
      escalationPeriodDays: days,
      sendMailOnEscalation: form.sendMailOnEscalation,
    }
    if (editTarget) {
      router.put(`/hrms/organization/settings/approvals/${editTarget.id}`, payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/approvals', payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/approvals/${deleteTarget.id}`, {
      onSuccess: () => { setDeleteOpen(false); setDeleteTarget(null) },
      onFinish:  () => setDeleteProcessing(false),
    })
  }

  // ── Toggle ─────────────────────────────────────────────────────────────────
  function handleToggle() {
    if (!toggleTarget) return
    setToggleProcessing(true)
    router.patch(`/hrms/organization/settings/approvals/${toggleTarget.id}/toggle`, {}, {
      onSuccess: () => { setToggleTarget(null) },
      onFinish:  () => setToggleProcessing(false),
    })
  }

  const refOptions: SelectOption[] = form.basedOn === 'designation'
    ? [{ value: '', label: '— None —' }, ...designations.map((d) => ({ value: String(d.id), label: d.name }))]
    : [{ value: '', label: '— None —' }, ...divisions.map((d) => ({ value: String(d.id), label: d.name }))]

  const columns = buildColumns(openEdit, (a) => { setDeleteTarget(a); setDeleteOpen(true) }, setToggleTarget)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">Approval Workflows</div>
          <div className="ph-sub">Define escalation rules and approval chains for HR modules</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}>
            <Plus size={14} /> Add Workflow
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        {/* Toolbar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 320 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workflows…" />
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
            {filtered.length} workflow{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(a) => a.id}
          noun="workflows"
          emptyIcon={<GitBranch size={36} style={{ opacity: .15, color: 'var(--text3)' }} />}
          emptyTitle="No approval workflows defined"
          emptyDesc="Define approval workflows for HR modules."
        />
      </div>

      {/* ════════ ADD / EDIT MODAL ════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Approval Workflow' : 'Add Approval Workflow'}
        size="md"
        icon={<GitBranch size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
              {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create Workflow</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Row 1: Module Name + Approval Type */}
          <div className="g2">
            <div className="fg">
              <label>Module Name <span className="req">*</span></label>
              <input className="fi" value={form.moduleName} onChange={(e) => setField('moduleName', e.target.value)} placeholder="e.g. HRMS Leave Management" autoFocus />
              {errors.moduleName && <div className="fg-err">{errors.moduleName}</div>}
            </div>
            <div className="fg">
              <label>Approval Type <span className="req">*</span></label>
              <SelectSearch
                value={form.approvalType}
                onChange={(v) => setField('approvalType', v as ApprovalType)}
                options={APPROVAL_TYPES.map((t) => ({ value: t, label: t }))}
                placeholder="Select type…"
              />
            </div>
          </div>

          {/* Row 2: Based On + Reference */}
          <div className="g2">
            <div className="fg">
              <label>Based On <span className="req">*</span></label>
              <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 9, padding: 3, gap: 2, border: '1px solid var(--border)', height: 36 }}>
                {(['designation', 'division'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setField('basedOn', v); setField('referenceId', '') }}
                    style={{
                      flex: 1, borderRadius: 7, border: 'none', cursor: 'pointer',
                      fontSize: '.78rem', fontWeight: 600, transition: 'all .15s',
                      background: form.basedOn === v ? 'var(--surface)' : 'transparent',
                      color: form.basedOn === v ? 'var(--text1)' : 'var(--text3)',
                      boxShadow: form.basedOn === v ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                    }}
                  >
                    {v === 'designation' ? 'Designation' : 'Division'}
                  </button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label>{form.basedOn === 'designation' ? 'Designation' : 'Division'}</label>
              <SelectSearch
                value={form.referenceId}
                onChange={(v) => setField('referenceId', v)}
                options={refOptions}
                placeholder="— None —"
              />
            </div>
          </div>

          {/* Row 3: Escalation Period + Send Mail */}
          <div className="g2">
            <div className="fg">
              <label>Escalation Period (days) <span className="req">*</span></label>
              <input type="number" className="fi" value={form.escalationPeriodDays} onChange={(e) => setField('escalationPeriodDays', e.target.value)} min={0} placeholder="e.g. 3" />
              {errors.escalationPeriodDays && <div className="fg-err">{errors.escalationPeriodDays}</div>}
              <div className="fg-hint">Days before escalation triggers.</div>
            </div>
            <div className="fg">
              <label style={{ visibility: 'hidden' }}>_</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Checkbox checked={form.sendMailOnEscalation} onChange={() => setField('sendMailOnEscalation', !form.sendMailOnEscalation)}>
                  Send mail on escalation
                </Checkbox>
                <div className="fg-hint">Notify approver by email when escalation expires.</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ════════ DELETE MODAL ════════ */}
      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        title="Delete Approval Workflow"
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
          Are you sure you want to delete the approval workflow for{' '}
          <strong style={{ color: 'var(--text1)' }}>{deleteTarget?.moduleName}</strong>
          {deleteTarget && ` (${deleteTarget.approvalType})`}? This action cannot be undone.
        </p>
      </Modal>

      {/* ════════ TOGGLE MODAL ════════ */}
      <Modal
        open={toggleTarget !== null}
        onClose={() => setToggleTarget(null)}
        title={toggleTarget?.isActive ? 'Deactivate Workflow' : 'Activate Workflow'}
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
            ? <>Deactivate approval workflow <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.moduleName}</strong>? It will be marked inactive.</>
            : <>Activate approval workflow <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.moduleName}</strong>? It will be marked active.</>
          }
        </p>
      </Modal>
    </>
  )
}
