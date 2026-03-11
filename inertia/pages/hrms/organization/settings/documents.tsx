import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  FileText, Plus, Edit2, Trash2, Check,
  ShieldCheck, FileCheck, FileBadge, CreditCard, BarChart2, File,
} from 'lucide-react'
import { Modal } from '~/components/modal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Document {
  id: number
  name: string
  documentType: string | null
  description: string | null
  isMandatory: boolean
  isActive: boolean
}

interface Props {
  documents: Document[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  'Certificate',
  'Policy',
  'Contract',
  'Identity',
  'Financial',
  'Other',
] as const

type DocType = typeof DOC_TYPES[number]

const DOC_TYPE_META: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Certificate': { color: 'var(--s)',      bg: 'var(--s-lt)',      border: 'rgba(5,150,105,.2)',   icon: <FileBadge    size={16} /> },
  'Policy':      { color: 'var(--p)',      bg: 'var(--p-lt)',      border: 'var(--p-mid)',          icon: <ShieldCheck  size={16} /> },
  'Contract':    { color: 'var(--purple)', bg: 'var(--purple-lt)', border: 'rgba(124,58,237,.2)',  icon: <FileCheck    size={16} /> },
  'Identity':    { color: 'var(--sky)',    bg: 'var(--sky-lt)',    border: 'rgba(3,105,161,.2)',   icon: <CreditCard   size={16} /> },
  'Financial':   { color: 'var(--warn)',   bg: 'var(--warn-lt)',   border: 'rgba(217,119,6,.2)',   icon: <BarChart2    size={16} /> },
  'Other':       { color: 'var(--text3)',  bg: 'var(--bg2)',       border: 'var(--border)',         icon: <File         size={16} /> },
}

function getTypeMeta(type: string | null) {
  return DOC_TYPE_META[type ?? 'Other'] ?? DOC_TYPE_META['Other']
}

function defaultForm() {
  return {
    name:         '',
    documentType: 'Other' as DocType,
    description:  '',
    isMandatory:  false,
  }
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <div style={{ opacity: .15, color: 'var(--text3)', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
        <FileText size={48} />
      </div>
      <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
        No documents configured
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--text4)' }}>
        Add company documents, policies, and certificates.
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DocumentsPage({ documents }: Props) {
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<Document | null>(null)
  const [form, setForm]             = useState(defaultForm())
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  const [deleteOpen, setDeleteOpen]             = useState(false)
  const [deleteTarget, setDeleteTarget]         = useState<Document | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const off1 = router.on('start',  () => setIsLoading(true))
    const off2 = router.on('finish', () => setIsLoading(false))
    return () => { off1(); off2() }
  }, [])

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

  function openEdit(d: Document) {
    setEditTarget(d)
    setForm({
      name:         d.name,
      documentType: (DOC_TYPES.includes(d.documentType as DocType) ? d.documentType : 'Other') as DocType,
      description:  d.description ?? '',
      isMandatory:  d.isMandatory,
    })
    setErrors({})
    setModalOpen(true)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Document name is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setProcessing(true)
    const payload = {
      name:         form.name.trim(),
      documentType: form.documentType,
      description:  form.description.trim() || null,
      isMandatory:  form.isMandatory,
    }
    if (editTarget) {
      router.put(`/hrms/organization/settings/documents/${editTarget.id}`, payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/documents', payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function openDelete(d: Document) {
    setDeleteTarget(d)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/documents/${deleteTarget.id}`, {
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
          <div className="ph-title">Company Documents</div>
          <div className="ph-sub">Manage document types, policies, and required employee paperwork</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}>
            <Plus size={14} /> Add Document
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',     value: documents.length,                            cls: 'bx-teal' },
          { label: 'Mandatory', value: documents.filter((d) => d.isMandatory).length, cls: 'bx-red' },
          { label: 'Optional',  value: documents.filter((d) => !d.isMandatory).length, cls: 'bx-gray' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 120px' }}>
            <span className={`bx ${s.cls}`} style={{ fontSize: '1.1rem', fontWeight: 800, padding: '6px 12px' }}>{s.value}</span>
            <span style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      {documents.length === 0 ? (
        <div className="card"><EmptyState /></div>
      ) : (
        <div className="g3" style={{ gap: 14 }}>
          {documents.map((d) => {
            const meta = getTypeMeta(d.documentType)
            return (
              <div
                key={d.id}
                className="card"
                style={{ padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}
              >
                {/* Icon + name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: meta.color }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text1)', fontSize: '.88rem', lineHeight: 1.3, wordBreak: 'break-word' }}>{d.name}</div>
                    {d.description && (
                      <div style={{ fontSize: '.74rem', color: 'var(--text4)', marginTop: 3, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {d.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {d.documentType && (
                    <span className="bx bx-purple" style={{ fontSize: '.7rem' }}>{d.documentType}</span>
                  )}
                  {d.isMandatory && (
                    <span className="bx bx-red" style={{ fontSize: '.7rem' }}>Mandatory</span>
                  )}
                  <span className={`bx ${d.isActive ? 'bx-teal' : 'bx-gray'}`} style={{ fontSize: '.7rem' }}>
                    {d.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <button
                    onClick={() => openEdit(d)}
                    title="Edit"
                    style={{ flex: 1, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', color: 'var(--p)', cursor: 'pointer', fontSize: '.76rem', fontWeight: 600 }}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => openDelete(d)}
                    title="Delete"
                    style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--danger-lt)', border: '1px solid rgba(220,38,38,.15)', color: 'var(--danger)', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ════════ ADD / EDIT MODAL ════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Document' : 'Add Document'}
        size="sm"
        icon={<FileText size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
              {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create Document</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name */}
          <div className="fg">
            <label>Document Name <span className="req">*</span></label>
            <input className="fi" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Employment Contract" autoFocus />
            {errors.name && <div className="fg-err">{errors.name}</div>}
          </div>

          {/* Document Type */}
          <div className="fg">
            <label>Document Type</label>
            <select className="fi" value={form.documentType} onChange={(e) => setField('documentType', e.target.value as DocType)}>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="fg">
            <label>Description</label>
            <textarea className="fi" value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Brief description of this document" rows={3} style={{ resize: 'vertical' }} />
          </div>

          {/* Mandatory toggle */}
          <div className="fg">
            <label>Mandatory</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {([true, false] as const).map((val) => {
                const active = form.isMandatory === val
                return (
                  <label key={String(val)} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '7px 14px', borderRadius: 8, border: `1px solid ${active ? (val ? 'rgba(220,38,38,.35)' : 'var(--border)') : 'var(--border)'}`, background: active ? (val ? 'var(--danger-lt)' : 'var(--bg2)') : 'var(--bg2)', flex: 1 }}>
                    <input type="radio" name="isMandatory" checked={active} onChange={() => setField('isMandatory', val)} style={{ accentColor: 'var(--p)' }} />
                    <span style={{ fontSize: '.82rem', fontWeight: 600, color: active ? (val ? 'var(--danger)' : 'var(--text2)') : 'var(--text2)' }}>{val ? 'Mandatory' : 'Optional'}</span>
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
        title="Delete Document"
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
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text1)' }}>{deleteTarget?.name}</strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}
