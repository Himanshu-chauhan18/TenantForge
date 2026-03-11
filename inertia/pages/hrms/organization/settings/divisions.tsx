import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  Building2, Plus, Edit2, Trash2, X, Check, Search, RefreshCw,
  MapPin, Phone, Mail, Globe, DollarSign, Clock, ChevronRight,
} from 'lucide-react'
import { Modal } from '~/components/modal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Division {
  id: number
  code: string
  name: string
  shortName: string | null
  contactPerson: string | null
  contactPhone: string | null
  email: string | null
  country: string | null
  city: string | null
  currency: string | null
  timezone: string | null
  isActive: boolean
}

interface Props {
  divisions: Division[]
}

// ── Form defaults ─────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  // Step 1 – Division Details
  name: '',
  shortName: '',
  legalEmployeeId: '',
  bankName: '',
  bankAgentCode: '',
  bankAccountNo: '',
  ifscCode: '',
  establishmentNo: '',
  // Step 2 – Contact Details
  contactPerson: '',
  contactPhone: '',
  address: '',
  email: '',
  country: '',
  city: '',
  // Step 3 – Locale
  currency: '',
  dateFormat: '',
  timezone: '',
  timeFormat: '',
}

type FormState = typeof EMPTY_FORM

type FormErrors = Partial<Record<keyof FormState, string>>

// ── Step config ───────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Division Details', desc: 'Name, bank & legal info' },
  { num: 2, label: 'Contact Details', desc: 'Person, address & email' },
  { num: 3, label: 'Locale',          desc: 'Currency & time settings' },
]

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
        <Building2 size={40} />
      </div>
      <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
        {search ? 'No divisions match your search' : 'No divisions yet'}
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--text4)' }}>
        {search ? 'Try a different keyword.' : 'Add your first division to get started.'}
      </div>
    </div>
  )
}

// ── Stepper component ─────────────────────────────────────────────────────────

function Stepper({ step, maxDone }: { step: number; maxDone: number }) {
  return (
    <div className="stepper-wrap">
      <div className="stepper">
        {STEPS.map((s) => {
          const isDone   = s.num < step || (s.num < maxDone + 1 && s.num < step)
          const isActive = s.num === step
          const cls      = `step-item${isDone ? ' done' : isActive ? ' active' : ''}`
          return (
            <div key={s.num} className={cls}>
              <div className="step-n-row">
                <div className="step-circle">
                  {isDone ? <Check size={12} /> : s.num}
                </div>
                <div className="step-step-lbl">Step {s.num}</div>
              </div>
              <div className="step-title">{s.label}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteModal({
  open,
  target,
  processing,
  onClose,
  onConfirm,
}: {
  open: boolean
  target: Division | null
  processing: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Division"
      size="sm"
      variant="danger"
      icon={<Trash2 size={15} />}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" disabled={processing} onClick={onConfirm}>
            {processing ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </>
      }
    >
      <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>
        Are you sure you want to delete division{' '}
        <strong style={{ color: 'var(--text1)' }}>{target?.name}</strong>
        {target?.code && (
          <> (<code style={{ fontSize: '.78rem', background: 'var(--bg2)', padding: '1px 6px', borderRadius: 4 }}>{target.code}</code>)</>
        )}
        ? This action cannot be undone.
      </p>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DivisionsPage({ divisions }: Props) {
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<Division | null>(null)
  const [step, setStep]             = useState(1)
  const [maxDone, setMaxDone]       = useState(0)
  const [form, setForm]             = useState<FormState>({ ...EMPTY_FORM })
  const [errors, setErrors]         = useState<FormErrors>({})
  const [processing, setProcessing] = useState(false)

  const [deleteOpen, setDeleteOpen]       = useState(false)
  const [deleteTarget, setDeleteTarget]   = useState<Division | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const off1 = router.on('start',  () => setIsLoading(true))
    const off2 = router.on('finish', () => setIsLoading(false))
    return () => { off1(); off2() }
  }, [])

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = divisions.filter((d) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      (d.shortName ?? '').toLowerCase().includes(q) ||
      (d.contactPerson ?? '').toLowerCase().includes(q) ||
      (d.city ?? '').toLowerCase().includes(q) ||
      (d.country ?? '').toLowerCase().includes(q)
    )
  })

  // ── Open add modal ─────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setStep(1)
    setMaxDone(0)
    setModalOpen(true)
  }

  // ── Open edit modal ────────────────────────────────────────────────────────
  function openEdit(d: Division) {
    setEditTarget(d)
    setForm({
      name:            d.name,
      shortName:       d.shortName ?? '',
      legalEmployeeId: '',
      bankName:        '',
      bankAgentCode:   '',
      bankAccountNo:   '',
      ifscCode:        '',
      establishmentNo: '',
      contactPerson:   d.contactPerson ?? '',
      contactPhone:    d.contactPhone ?? '',
      address:         '',
      email:           d.email ?? '',
      country:         d.country ?? '',
      city:            d.city ?? '',
      currency:        d.currency ?? '',
      dateFormat:      '',
      timezone:        d.timezone ?? '',
      timeFormat:      '',
    })
    setErrors({})
    setStep(1)
    setMaxDone(3)
    setModalOpen(true)
  }

  // ── Validation per step ────────────────────────────────────────────────────
  function validateStep(s: number): FormErrors {
    const e: FormErrors = {}
    if (s === 1) {
      if (!form.name.trim()) e.name = 'Division name is required'
    }
    if (s === 2) {
      if (!form.contactPerson.trim()) e.contactPerson = 'Contact person is required'
      if (!form.contactPhone.trim())  e.contactPhone  = 'Contact phone is required'
      if (!form.email.trim())         e.email         = 'Email is required'
      if (!form.country.trim())       e.country       = 'Country is required'
      if (!form.city.trim())          e.city          = 'City is required'
    }
    return e
  }

  function handleNext() {
    const e = validateStep(step)
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setMaxDone((prev) => Math.max(prev, step))
    setStep((prev) => Math.min(prev + 1, 3))
  }

  function handleBack() {
    setErrors({})
    setStep((prev) => Math.max(prev - 1, 1))
  }

  function f(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    // Validate all required fields across all steps
    const allErrors: FormErrors = {}
    if (!form.name.trim())          allErrors.name          = 'Division name is required'
    if (!form.contactPerson.trim()) allErrors.contactPerson = 'Contact person is required'
    if (!form.contactPhone.trim())  allErrors.contactPhone  = 'Contact phone is required'
    if (!form.email.trim())         allErrors.email         = 'Email is required'
    if (!form.country.trim())       allErrors.country       = 'Country is required'
    if (!form.city.trim())          allErrors.city          = 'City is required'
    if (Object.keys(allErrors).length > 0) { setErrors(allErrors); return }

    setProcessing(true)
    const payload = {
      name:            form.name.trim(),
      shortName:       form.shortName.trim() || null,
      legalEmployeeId: form.legalEmployeeId.trim() || null,
      bankName:        form.bankName.trim() || null,
      bankAgentCode:   form.bankAgentCode.trim() || null,
      bankAccountNo:   form.bankAccountNo.trim() || null,
      ifscCode:        form.ifscCode.trim() || null,
      establishmentNo: form.establishmentNo.trim() || null,
      contactPerson:   form.contactPerson.trim(),
      contactPhone:    form.contactPhone.trim(),
      address:         form.address.trim() || null,
      email:           form.email.trim(),
      country:         form.country.trim(),
      city:            form.city.trim(),
      currency:        form.currency.trim() || null,
      dateFormat:      form.dateFormat.trim() || null,
      timezone:        form.timezone.trim() || null,
      timeFormat:      form.timeFormat.trim() || null,
    }

    if (editTarget) {
      router.put(`/hrms/organization/settings/divisions/${editTarget.id}`, payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/divisions', payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function openDelete(d: Division) {
    setDeleteTarget(d)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/divisions/${deleteTarget.id}`, {
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
          <div className="ph-title">Divisions</div>
          <div className="ph-sub">Manage organisation divisions, their contact info and locale settings</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}>
            <Plus size={14} /> Add Division
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        {/* Toolbar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 320 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search divisions…" />
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
            {filtered.length} division{filtered.length !== 1 ? 's' : ''}
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
                  <Th>Code</Th>
                  <Th>Name</Th>
                  <Th>Short Name</Th>
                  <Th>Contact Person</Th>
                  <Th>Location</Th>
                  <Th>Currency</Th>
                  <Th style={{ textAlign: 'center' }}>Status</Th>
                  <Th style={{ width: 100 }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <Td>
                      <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text2)', fontFamily: 'monospace' }}>
                        {d.code}
                      </code>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Building2 size={13} style={{ color: 'var(--p)' }} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '.83rem' }}>{d.name}</span>
                      </div>
                    </Td>
                    <Td>
                      <span style={{ color: 'var(--text3)' }}>{d.shortName || <span style={{ color: 'var(--text4)' }}>—</span>}</span>
                    </Td>
                    <Td>
                      {d.contactPerson ? (
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text1)', fontSize: '.8rem' }}>{d.contactPerson}</div>
                          {d.contactPhone && <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginTop: 1 }}>{d.contactPhone}</div>}
                        </div>
                      ) : <span style={{ color: 'var(--text4)' }}>—</span>}
                    </Td>
                    <Td>
                      {(d.city || d.country) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <MapPin size={12} style={{ color: 'var(--text4)', flexShrink: 0 }} />
                          <span>{[d.city, d.country].filter(Boolean).join(', ')}</span>
                        </div>
                      ) : <span style={{ color: 'var(--text4)' }}>—</span>}
                    </Td>
                    <Td>
                      {d.currency ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <DollarSign size={11} style={{ color: 'var(--text4)', flexShrink: 0 }} />
                          <span>{d.currency}</span>
                        </div>
                      ) : <span style={{ color: 'var(--text4)' }}>—</span>}
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span className={`bx ${d.isActive ? 'bx-teal' : 'bx-gray'}`}>
                        {d.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => openEdit(d)}
                          title="Edit"
                          style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', color: 'var(--p)', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(d)}
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
      <div className={`ov${modalOpen ? ' open' : ''}`} />
      <div
        className={`ov${modalOpen ? ' open' : ''}`}
        style={{ zIndex: 1001, background: 'transparent', backdropFilter: 'none', WebkitBackdropFilter: 'none' as any }}
        onClick={() => setModalOpen(false)}
      >
        <div
          className="modal"
          style={{ maxWidth: 860, width: '92%' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="mh">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-lt)', color: 'var(--p)' }}>
                <Building2 size={15} />
              </div>
              <span className="mt">{editTarget ? 'Edit Division' : 'Add Division'}</span>
              {editTarget && (
                <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 8px', color: 'var(--text3)', fontFamily: 'monospace', marginLeft: 4 }}>
                  {editTarget.code}
                </code>
              )}
            </div>
            <button className="xbtn" onClick={() => setModalOpen(false)} type="button">
              <X size={14} />
            </button>
          </div>

          {/* Modal body */}
          <div className="mb" style={{ padding: '20px 24px' }}>
            <Stepper step={step} maxDone={maxDone} />

            {/* ── Step 1: Division Details ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: 'var(--p)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: '.85rem', color: 'var(--text1)' }}>Division Details</span>
                </div>
                <div className="g2">
                  <div className="fg col2">
                    <label>Division Name <span className="req">*</span></label>
                    <input className="fi" value={form.name} onChange={f('name')} placeholder="e.g. North Region Division" autoFocus />
                    {errors.name && <div className="fg-err">{errors.name}</div>}
                  </div>
                  <div className="fg">
                    <label>Short Name</label>
                    <input className="fi" value={form.shortName} onChange={f('shortName')} placeholder="e.g. NRD" />
                  </div>
                  <div className="fg">
                    <label>Legal Employee ID</label>
                    <input className="fi" value={form.legalEmployeeId} onChange={f('legalEmployeeId')} placeholder="e.g. EMP-LEGAL-001" />
                  </div>
                  <div className="fg">
                    <label>Establishment No.</label>
                    <input className="fi" value={form.establishmentNo} onChange={f('establishmentNo')} placeholder="e.g. EST123456" />
                  </div>
                  <div className="fg">
                    <label>Bank Name</label>
                    <input className="fi" value={form.bankName} onChange={f('bankName')} placeholder="e.g. State Bank of India" />
                  </div>
                  <div className="fg">
                    <label>Bank Agent Code</label>
                    <input className="fi" value={form.bankAgentCode} onChange={f('bankAgentCode')} placeholder="e.g. AGT-001" />
                  </div>
                  <div className="fg">
                    <label>Bank Account No.</label>
                    <input className="fi" value={form.bankAccountNo} onChange={f('bankAccountNo')} placeholder="e.g. 1234567890" />
                  </div>
                  <div className="fg">
                    <label>IFSC Code</label>
                    <input className="fi" value={form.ifscCode} onChange={f('ifscCode')} placeholder="e.g. SBIN0001234" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Contact Details ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: 'var(--p)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: '.85rem', color: 'var(--text1)' }}>Contact Details</span>
                </div>
                <div className="g2">
                  <div className="fg">
                    <label><Phone size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Contact Person <span className="req">*</span></label>
                    <input className="fi" value={form.contactPerson} onChange={f('contactPerson')} placeholder="e.g. Rajesh Kumar" autoFocus />
                    {errors.contactPerson && <div className="fg-err">{errors.contactPerson}</div>}
                  </div>
                  <div className="fg">
                    <label>Contact Phone <span className="req">*</span></label>
                    <input className="fi" value={form.contactPhone} onChange={f('contactPhone')} placeholder="e.g. +91 98765 43210" type="tel" />
                    {errors.contactPhone && <div className="fg-err">{errors.contactPhone}</div>}
                  </div>
                  <div className="fg col2">
                    <label><Mail size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Email <span className="req">*</span></label>
                    <input className="fi" value={form.email} onChange={f('email')} placeholder="e.g. division@company.com" type="email" />
                    {errors.email && <div className="fg-err">{errors.email}</div>}
                  </div>
                  <div className="fg col2">
                    <label>Address</label>
                    <input className="fi" value={form.address} onChange={f('address')} placeholder="Street address, floor, suite…" />
                  </div>
                  <div className="fg">
                    <label><Globe size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Country <span className="req">*</span></label>
                    <input className="fi" value={form.country} onChange={f('country')} placeholder="e.g. India" />
                    {errors.country && <div className="fg-err">{errors.country}</div>}
                  </div>
                  <div className="fg">
                    <label><MapPin size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />City <span className="req">*</span></label>
                    <input className="fi" value={form.city} onChange={f('city')} placeholder="e.g. Mumbai" />
                    {errors.city && <div className="fg-err">{errors.city}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Locale ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: 'var(--p)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--fd)', fontWeight: 700, fontSize: '.85rem', color: 'var(--text1)' }}>Locale Settings</span>
                </div>
                <div className="g2">
                  <div className="fg">
                    <label><DollarSign size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Currency</label>
                    <select className="fi fi-sel" value={form.currency} onChange={f('currency')}>
                      <option value="">Select currency…</option>
                      <option value="INR">INR – Indian Rupee</option>
                      <option value="USD">USD – US Dollar</option>
                      <option value="EUR">EUR – Euro</option>
                      <option value="GBP">GBP – British Pound</option>
                      <option value="AED">AED – UAE Dirham</option>
                      <option value="SGD">SGD – Singapore Dollar</option>
                      <option value="AUD">AUD – Australian Dollar</option>
                      <option value="CAD">CAD – Canadian Dollar</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Date Format</label>
                    <select className="fi fi-sel" value={form.dateFormat} onChange={f('dateFormat')}>
                      <option value="">Select format…</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label><Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Timezone</label>
                    <select className="fi fi-sel" value={form.timezone} onChange={f('timezone')}>
                      <option value="">Select timezone…</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                      <option value="UTC">UTC +0:00</option>
                      <option value="America/New_York">America/New_York (ET)</option>
                      <option value="America/Chicago">America/Chicago (CT)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT +8)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Time Format</label>
                    <select className="fi fi-sel" value={form.timeFormat} onChange={f('timeFormat')}>
                      <option value="">Select format…</option>
                      <option value="12h">12-Hour (AM/PM)</option>
                      <option value="24h">24-Hour</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal footer */}
          <div className="mf" style={{ justifyContent: 'space-between' }}>
            <div>
              {step > 1 && (
                <button className="btn btn-ghost" onClick={handleBack}>
                  ← Back
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              {step < 3 ? (
                <button className="btn btn-p" onClick={handleNext}>
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
                  {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create Division</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════ DELETE MODAL ════════ */}
      <DeleteModal
        open={deleteOpen}
        target={deleteTarget}
        processing={deleteProcessing}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
      />
    </>
  )
}
