import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  GitBranch, Plus, Edit2, Trash2, X, Check, Search, RefreshCw, Mail, MailX,
} from 'lucide-react'
import { Modal } from '~/components/modal'

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
        <GitBranch size={40} />
      </div>
      <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
        {search ? 'No approval workflows match your search' : 'No approval workflows defined'}
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--text4)' }}>
        {search ? 'Try a different keyword.' : 'Define approval workflows for HR modules.'}
      </div>
    </div>
  )
}

function defaultForm() {
  return {
    moduleName:          '',
    approvalType:        'Leave' as ApprovalType,
    basedOn:             'designation' as 'designation' | 'division',
    referenceId:         '' as string,
    escalationPeriodDays: '3',
    sendMailOnEscalation: false,
  }
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
  function openDelete(a: Approval) {
    setDeleteTarget(a)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/approvals/${deleteTarget.id}`, {
      onSuccess: () => { setDeleteOpen(false); setDeleteTarget(null) },
      onFinish:  () => setDeleteProcessing(false),
    })
  }

  const refOptions = form.basedOn === 'designation' ? designations : divisions

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

        {/* Table */}
        <div className="tw">
          {filtered.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <table className="dt">
              <thead>
                <tr>
                  <Th>Module</Th>
                  <Th style={{ width: 180 }}>Approval Type</Th>
                  <Th style={{ width: 120 }}>Based On</Th>
                  <Th style={{ width: 180 }}>Reference</Th>
                  <Th style={{ width: 130, textAlign: 'center' }}>Escalation</Th>
                  <Th style={{ width: 80, textAlign: 'center' }}>Mail</Th>
                  <Th style={{ width: 100 }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <GitBranch size={12} style={{ color: 'var(--p)' }} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '.83rem' }}>{a.moduleName}</span>
                      </div>
                    </Td>
                    <Td>
                      <span className={`bx ${APPROVAL_TYPE_COLOR[a.approvalType] ?? 'bx-gray'}`}>
                        {a.approvalType}
                      </span>
                    </Td>
                    <Td>
                      <span className={`bx ${a.basedOn === 'designation' ? 'bx-purple' : 'bx-green'}`}>
                        {a.basedOn === 'designation' ? 'Designation' : 'Division'}
                      </span>
                    </Td>
                    <Td>
                      <span style={{ fontSize: '.8rem', color: a.referenceName ? 'var(--text1)' : 'var(--text4)', fontWeight: a.referenceName ? 600 : 400 }}>
                        {a.referenceName ?? '—'}
                      </span>
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span className="bx bx-amber" style={{ fontSize: '.8rem' }}>
                        {a.escalationPeriodDays} day{a.escalationPeriodDays !== 1 ? 's' : ''}
                      </span>
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      {a.sendMailOnEscalation
                        ? <Mail size={15} style={{ color: 'var(--p)', margin: '0 auto' }} />
                        : <MailX size={15} style={{ color: 'var(--text4)', margin: '0 auto' }} />
                      }
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => openEdit(a)}
                          title="Edit"
                          style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', color: 'var(--p)', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(a)}
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
          {/* Module name */}
          <div className="fg">
            <label>Module Name <span className="req">*</span></label>
            <input
              className="fi"
              value={form.moduleName}
              onChange={(e) => setField('moduleName', e.target.value)}
              placeholder="e.g. HRMS Leave Management"
              autoFocus
            />
            {errors.moduleName && <div className="fg-err">{errors.moduleName}</div>}
          </div>

          {/* Approval type */}
          <div className="fg">
            <label>Approval Type <span className="req">*</span></label>
            <select className="fi" value={form.approvalType} onChange={(e) => setField('approvalType', e.target.value as ApprovalType)}>
              {APPROVAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Based On */}
          <div className="fg">
            <label>Based On <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['designation', 'division'] as const).map((opt) => {
                const active = form.basedOn === opt
                return (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '7px 14px', borderRadius: 8, border: `1px solid ${active ? 'var(--p-mid)' : 'var(--border)'}`, background: active ? 'var(--p-lt)' : 'var(--bg2)', flex: 1 }}>
                    <input
                      type="radio"
                      name="basedOn"
                      checked={active}
                      onChange={() => { setField('basedOn', opt); setField('referenceId', '') }}
                      style={{ accentColor: 'var(--p)' }}
                    />
                    <span style={{ fontSize: '.82rem', fontWeight: 600, color: active ? 'var(--p)' : 'var(--text2)', textTransform: 'capitalize' }}>{opt}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Reference select */}
          <div className="fg">
            <label>{form.basedOn === 'designation' ? 'Designation' : 'Division'}</label>
            <select className="fi" value={form.referenceId} onChange={(e) => setField('referenceId', e.target.value)}>
              <option value="">— None —</option>
              {refOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          {/* Escalation period */}
          <div className="fg">
            <label>Escalation Period (days) <span className="req">*</span></label>
            <input
              type="number"
              className="fi"
              value={form.escalationPeriodDays}
              onChange={(e) => setField('escalationPeriodDays', e.target.value)}
              min={0}
              placeholder="e.g. 3"
            />
            {errors.escalationPeriodDays && <div className="fg-err">{errors.escalationPeriodDays}</div>}
            <div className="fg-hint">Number of days before the approval is escalated.</div>
          </div>

          {/* Send mail on escalation */}
          <div className="fg">
            <label>Send Mail on Escalation</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {([true, false] as const).map((val) => {
                const active = form.sendMailOnEscalation === val
                return (
                  <label key={String(val)} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '7px 14px', borderRadius: 8, border: `1px solid ${active ? 'var(--p-mid)' : 'var(--border)'}`, background: active ? 'var(--p-lt)' : 'var(--bg2)', flex: 1 }}>
                    <input type="radio" name="sendMail" checked={active} onChange={() => setField('sendMailOnEscalation', val)} style={{ accentColor: 'var(--p)' }} />
                    <span style={{ fontSize: '.82rem', fontWeight: 600, color: active ? 'var(--p)' : 'var(--text2)' }}>{val ? 'Yes' : 'No'}</span>
                  </label>
                )
              })}
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
    </>
  )
}
