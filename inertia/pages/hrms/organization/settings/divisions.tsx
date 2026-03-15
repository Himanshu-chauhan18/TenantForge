import { useState } from 'react'
import { router } from '@inertiajs/react'
import {
  Building2, Plus, Check, X, Trash2, Pencil,
  Search, RefreshCw, Globe, Clock, Users, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { DataTable } from '~/components/data-table'
import type { DTColumn, VisibilityState } from '~/components/data-table'
import { Modal } from '~/components/modal'
import { CountrySelect } from '~/components/country-select'
import { CitySelect } from '~/components/city-select'
import { PhoneInput } from '~/components/phone-input'
import { SelectCurrency } from '~/components/select-currency'
import { SelectTimezone } from '~/components/select-timezone'
import { SelectDateFormat } from '~/components/select-date-format'
import { AssignEmployeeModal } from '~/components/assign-employee-modal'
import type { AssignEmployee } from '~/components/assign-employee-modal'
import type { CountryOption } from '~/components/country-select'
import type { CityOption } from '~/components/city-select'

const COLS_KEY = 'hrms-divisions-cols-v1'

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
  legalEmployeeId: string | null
  bankName: string | null
  bankAgentCode: string | null
  bankAccountNo: string | null
  ifscCode: string | null
  establishmentNo: string | null
  address: string | null
  dateFormat: string | null
  timeFormat: string | null
  isActive: boolean
}

interface Employee {
  id: number
  fullName: string
  employeeCode: string | null
  divisionId: number | null
  designationId: number | null
  departmentId: number | null
  locationId: number | null
  gradeId: number | null
}

interface Lookup { id: number; name: string }

interface Props {
  divisions: Division[]
  employees: Employee[]
  departments: Lookup[]
  designations: Lookup[]
  locations: Lookup[]
  grades: Lookup[]
}

interface FormState {
  name: string; shortName: string
  country: string; city: string
  contactPerson: string; contactPhone: string; email: string; address: string
  legalEmployeeId: string; establishmentNo: string
  bankName: string; bankAgentCode: string; bankAccountNo: string; ifscCode: string
  currency: string; dateFormat: string; timezone: string; timeFormat: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Division Info',    desc: 'Code, name & location' },
  { num: 2, label: 'Contact Details',  desc: 'Person, phone & address' },
  { num: 3, label: 'Banking & Locale', desc: 'Bank info & locale' },
]

const EMPTY: FormState = {
  name: '', shortName: '',
  country: '', city: '',
  contactPerson: '', contactPhone: '', email: '', address: '',
  legalEmployeeId: '', establishmentNo: '',
  bankName: '', bankAgentCode: '', bankAccountNo: '', ifscCode: '',
  currency: '', dateFormat: '', timezone: '', timeFormat: '',
}

const TIME_FORMATS = [{ v: '12h', l: '12-Hour (AM/PM)' }, { v: '24h', l: '24-Hour' }]

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseFirstTimezone(tz: string): string {
  try { const a = JSON.parse(tz); return Array.isArray(a) && a[0]?.zoneName ? a[0].zoneName : '' } catch { return tz || '' }
}

function computeNextCode(divisions: Division[]): string {
  if (!divisions.length) return 'DIV0001'
  const max = divisions.reduce((m, d) => {
    const n = parseInt(d.code.replace('DIV', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `DIV${String(max + 1).padStart(4, '0')}`
}

// ── Columns ───────────────────────────────────────────────────────────────────

const buildColumns = (
  onEdit: (d: Division) => void,
  onDelete: (d: Division) => void,
  onAssign: (d: Division) => void,
  onToggle: (d: Division) => void,
  assignedCounts: Record<number, number>,
): DTColumn<Division>[] => [
  {
    key: 'code',
    label: 'Code',
    width: 90,
    render: (d) => (
      <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text3)', fontFamily: 'monospace' }}>
        {d.code}
      </code>
    ),
  },
  {
    key: 'name',
    label: 'Division',
    pinned: true,
    minWidth: 200,
    render: (d) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={14} style={{ color: 'var(--p)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)', lineHeight: 1.3 }}>{d.name}</div>
          {d.shortName && <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>{d.shortName}</div>}
        </div>
      </div>
    ),
  },
  {
    key: 'location',
    label: 'Location',
    sortable: false,
    render: (d) => (d.country || d.city)
      ? <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Globe size={12} style={{ color: 'var(--text4)', flexShrink: 0 }} />
          <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{[d.city, d.country].filter(Boolean).join(', ')}</span>
        </div>
      : <span style={{ color: 'var(--text4)', fontSize: '.8rem' }}>—</span>,
  },
  {
    key: 'contact',
    label: 'Contact',
    sortable: false,
    render: (d) => d.contactPerson
      ? <div>
          <div style={{ fontWeight: 500, fontSize: '.8rem', color: 'var(--text1)' }}>{d.contactPerson}</div>
          {d.contactPhone && <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginTop: 1 }}>{d.contactPhone}</div>}
        </div>
      : <span style={{ color: 'var(--text4)', fontSize: '.8rem' }}>—</span>,
  },
  {
    key: 'currency',
    label: 'Currency',
    sortable: false,
    defaultHidden: true,
    render: (d) => d.currency
      ? <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{d.currency}</span>
      : <span style={{ color: 'var(--text4)', fontSize: '.8rem' }}>—</span>,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    render: (d) => (
      <span className={`bdg ${d.isActive ? 'bdg-green' : 'bdg-gray'}`}>
        <span className="bdg-dot" />{d.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    pinned: true,
    width: 175,
    render: (d) => {
      const cnt = assignedCounts[d.id] ?? 0
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onAssign(d)} title="Assign Employees"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--s)', background: 'var(--s-lt)', border: '1px solid rgba(5,150,105,.2)', cursor: 'pointer' }}
          >
            <Users size={11} /> Assign
          </button>
          <button
            onClick={() => onEdit(d)} title="Edit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer' }}
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => onToggle(d)}
            title={d.isActive ? 'Deactivate' : 'Activate'}
            style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 6px', borderRadius: 7, color: d.isActive ? '#f59e0b' : 'var(--s)', background: d.isActive ? 'rgba(245,158,11,.07)' : 'var(--s-lt)', border: `1px solid ${d.isActive ? 'rgba(245,158,11,.3)' : 'rgba(5,150,105,.2)'}`, cursor: 'pointer' }}
          >
            {d.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
          </button>
          <button
            onClick={() => onDelete(d)}
            title={cnt > 0 ? `${cnt} employee${cnt !== 1 ? 's' : ''} assigned` : 'Delete'}
            style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 6px', borderRadius: 7, color: 'var(--text3)', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.background = 'rgba(239,68,68,.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    },
  },
]

// ── StepHeader ────────────────────────────────────────────────────────────────

function StepHeader({ step, maxStep, onStepClick }: { step: number; maxStep: number; onStepClick: (n: number) => void }) {
  return (
    <div className="stepper-wrap">
      <div className="stepper">
        {STEPS.map((s) => {
          const state     = step > s.num ? 'done' : step === s.num ? 'active' : ''
          const clickable = s.num !== step && s.num <= maxStep
          return (
            <div
              key={s.num}
              className={`step-item ${state}`}
              onClick={() => clickable && onStepClick(s.num)}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
              title={clickable ? `Go to step ${s.num}` : undefined}
            >
              <div className="step-n-row">
                <div className="step-circle">
                  {step > s.num ? <Check size={12} /> : s.num}
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

// ── Main component ────────────────────────────────────────────────────────────

export default function DivisionsPage({ divisions, employees, departments, designations, locations, grades }: Props) {
  const [search,  setSearch]  = useState('')
  const [colVis,  setColVis]  = useState<VisibilityState>({})
  const [loading, setLoading] = useState(false)

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState<Division | null>(null)
  const [step,        setStep]        = useState(1)
  const [stepKey,     setStepKey]     = useState(0)
  const [maxStep,     setMaxStep]     = useState(1)
  const [form,        setForm]        = useState<FormState>({ ...EMPTY })
  const [errors,      setErrors]      = useState<Partial<Record<keyof FormState, string>>>({})
  const [processing,  setProcessing]  = useState(false)
  const [countryObj,  setCountryObj]  = useState<CountryOption | null>(null)
  const [cityObj,     setCityObj]     = useState<CityOption | null>(null)

  const [deleteTarget,     setDeleteTarget]     = useState<Division | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [toggleTarget,     setToggleTarget]     = useState<Division | null>(null)
  const [toggleProcessing, setToggleProcessing] = useState(false)

  const [assignTarget,     setAssignTarget]     = useState<Division | null>(null)
  const [assignProcessing, setAssignProcessing] = useState(false)

  const filtered = search
    ? divisions.filter((d) => {
        const q = search.toLowerCase()
        return (
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          (d.shortName ?? '').toLowerCase().includes(q) ||
          (d.country ?? '').toLowerCase().includes(q) ||
          (d.city ?? '').toLowerCase().includes(q)
        )
      })
    : divisions

  function openAssign(d: Division) { setAssignTarget(d) }

  function handleAssignSubmit(ids: number[]) {
    if (!assignTarget) return
    setAssignProcessing(true)
    router.post(`/hrms/organization/settings/divisions/${assignTarget.id}/assign`, { employeeIds: ids }, {
      onSuccess: () => setAssignTarget(null),
      onFinish:  () => setAssignProcessing(false),
    })
  }

  const assignEmps: AssignEmployee[] = employees.map((e) => ({ ...e, currentAssignmentId: e.divisionId }))

  const assignedCounts = employees.reduce<Record<number, number>>((acc, e) => {
    if (e.divisionId) acc[e.divisionId] = (acc[e.divisionId] ?? 0) + 1
    return acc
  }, {})

  function handleToggle() {
    if (!toggleTarget) return
    setToggleProcessing(true)
    router.patch(`/hrms/organization/settings/divisions/${toggleTarget.id}/toggle`, {}, {
      onSuccess: () => setToggleTarget(null),
      onFinish:  () => setToggleProcessing(false),
    })
  }

  const deleteAssignedCount = deleteTarget ? (assignedCounts[deleteTarget.id] ?? 0) : 0
  const toggleAssignedCount = toggleTarget ? (assignedCounts[toggleTarget.id] ?? 0) : 0

  const columns = buildColumns(openEdit, (d) => setDeleteTarget(d), openAssign, (d) => setToggleTarget(d), assignedCounts)
  const nextCode = computeNextCode(divisions)

  function openAdd() {
    setEditTarget(null); setForm({ ...EMPTY }); setCountryObj(null); setCityObj(null)
    setErrors({}); setStep(1); setMaxStep(1); setStepKey((k) => k + 1); setModalOpen(true)
  }

  async function openEdit(d: Division) {
    setEditTarget(d)
    setForm({
      name: d.name, shortName: d.shortName ?? '', country: d.country ?? '', city: d.city ?? '',
      contactPerson: d.contactPerson ?? '', contactPhone: d.contactPhone ?? '', email: d.email ?? '', address: d.address ?? '',
      legalEmployeeId: d.legalEmployeeId ?? '', establishmentNo: d.establishmentNo ?? '',
      bankName: d.bankName ?? '', bankAgentCode: d.bankAgentCode ?? '', bankAccountNo: d.bankAccountNo ?? '', ifscCode: d.ifscCode ?? '',
      currency: d.currency ?? '', dateFormat: d.dateFormat ?? '', timezone: d.timezone ?? '', timeFormat: d.timeFormat ?? '',
    })
    setCountryObj(null); setCityObj(null); setErrors({}); setStep(1); setMaxStep(3); setStepKey((k) => k + 1); setModalOpen(true)
    if (d.country) {
      try {
        const res = await fetch(`/api/countries?search=${encodeURIComponent(d.country)}`)
        if (res.ok) {
          const list: CountryOption[] = await res.json()
          const match = list.find((c) => c.name.toLowerCase() === d.country!.toLowerCase()) ?? list[0] ?? null
          if (match) {
            setCountryObj(match)
            if (d.city) {
              const cres = await fetch(`/api/cities?country_id=${match.id}&search=${encodeURIComponent(d.city)}`)
              if (cres.ok) {
                const cities: CityOption[] = await cres.json()
                setCityObj(cities.find((c) => c.name.toLowerCase() === d.city!.toLowerCase()) ?? cities[0] ?? null)
              }
            }
          }
        }
      } catch {}
    }
  }

  function handleCountryChange(c: CountryOption | null) {
    setCountryObj(c); setCityObj(null)
    if (c) setForm((prev) => ({ ...prev, currency: c.currency ?? prev.currency, timezone: parseFirstTimezone(c.timezone) || prev.timezone, dateFormat: prev.dateFormat || 'DD/MM/YYYY', timeFormat: prev.timeFormat || '12h' }))
    setErrors((prev) => ({ ...prev, country: undefined, city: undefined }))
  }

  function f(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function validateStep1() {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'Division name is required'
    if (!countryObj && !form.country.trim()) e.country = 'Country is required'
    if (!cityObj && !form.city.trim()) e.city = 'City is required'
    return e
  }

  function validateStep3() {
    const e: typeof errors = {}
    if (!form.currency.trim())   e.currency   = 'Currency is required'
    if (!form.timezone.trim())   e.timezone   = 'Timezone is required'
    if (!form.dateFormat.trim()) e.dateFormat = 'Date format is required'
    if (!form.timeFormat.trim()) e.timeFormat = 'Time format is required'
    return e
  }

  function goToStep(n: number) { setErrors({}); setStep(n); setStepKey((k) => k + 1) }

  function handleNext() {
    if (step === 1) { const e = validateStep1(); if (Object.keys(e).length) { setErrors(e); return } }
    const next = Math.min(step + 1, 3)
    setErrors({}); setMaxStep((m) => Math.max(m, next)); setStep(next); setStepKey((k) => k + 1)
  }

  function handleBack() { setErrors({}); setStep((s) => Math.max(s - 1, 1)); setStepKey((k) => k + 1) }

  function handleSubmit() {
    const e1 = validateStep1(); if (Object.keys(e1).length) { setStep(1); setStepKey((k) => k + 1); setErrors(e1); return }
    const e3 = validateStep3(); if (Object.keys(e3).length) { setErrors(e3); return }
    const payload = {
      name: form.name.trim() || undefined, shortName: form.shortName.trim() || undefined,
      contactPerson: form.contactPerson.trim() || undefined, contactPhone: form.contactPhone.trim() || undefined,
      email: form.email.trim() || undefined, address: form.address.trim() || undefined,
      country: countryObj ? countryObj.name : (form.country || undefined),
      city:    cityObj    ? cityObj.name   : (form.city     || undefined),
      legalEmployeeId: form.legalEmployeeId.trim() || undefined, establishmentNo: form.establishmentNo.trim() || undefined,
      bankName: form.bankName.trim() || undefined, bankAgentCode: form.bankAgentCode.trim() || undefined,
      bankAccountNo: form.bankAccountNo.trim() || undefined, ifscCode: form.ifscCode.trim() || undefined,
      currency: form.currency.trim() || undefined, dateFormat: form.dateFormat.trim() || undefined,
      timezone: form.timezone.trim() || undefined, timeFormat: form.timeFormat.trim() || undefined,
    }
    setProcessing(true)
    if (editTarget) {
      router.put(`/hrms/organization/settings/divisions/${editTarget.id}`, payload, { onSuccess: () => setModalOpen(false), onError: (err) => setErrors(err as any), onFinish: () => setProcessing(false) })
    } else {
      router.post('/hrms/organization/settings/divisions', payload, { onSuccess: () => setModalOpen(false), onError: (err) => setErrors(err as any), onFinish: () => setProcessing(false) })
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/divisions/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null), onFinish: () => setDeleteProcessing(false) })
  }

  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Divisions</div>
          <div className="ph-sub">Manage organisation divisions, their contact info and locale settings</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}><Plus size={14} /> Add Division</button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 300 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search divisions…" />
            {search && <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={12} style={{ color: 'var(--text3)' }} /></button>}
          </div>
          <button className="btn btn-ghost" onClick={() => { setLoading(true); router.reload({ onFinish: () => setLoading(false) }) }} style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }}>
            <RefreshCw size={13} style={{ transition: 'transform .4s', transform: loading ? 'rotate(360deg)' : 'none' }} />
          </button>
          <span style={{ marginLeft: 'auto', fontSize: '.76rem', color: 'var(--text3)' }}>{filtered.length} division{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <DataTable<Division>
          data={filtered} columns={columns} rowKey={(r) => r.id} clientPageSize={25}
          storageKey={COLS_KEY} noun="division" columnVisibility={colVis} onColumnVisibilityChange={setColVis} hideToolbar
          emptyIcon={<Building2 size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
          emptyTitle={search ? 'No divisions match your search' : 'No divisions yet'}
          emptyDesc={search ? 'Try a different keyword.' : 'Add your first division to get started.'}
          emptyAction={!search && <button className="btn btn-p btn-sm" onClick={openAdd} style={{ display: 'inline-flex' }}><Plus size={13} /> Add Division</button>}
        />
      </div>

      {/* ════ ADD / EDIT MODAL ════ */}
      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? `Edit Division — ${editTarget.code}` : 'Add Division'}
        size="lg" icon={<Building2 size={15} />}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>{step > 1 && <button className="btn btn-ghost" type="button" onClick={handleBack}>← Back</button>}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              {step < 3
                ? <button className="btn btn-p" type="button" onClick={handleNext}>Next →</button>
                : <button className="btn btn-p" type="button" onClick={handleSubmit} disabled={processing}>
                    {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create Division</>}
                  </button>
              }
            </div>
          </div>
        }
      >
        <style>{`@keyframes divStepIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.div-step-card{animation:divStepIn .22s cubic-bezier(.4,0,.2,1) forwards}`}</style>
        <div style={{ padding: '4px 0 0' }}><StepHeader step={step} maxStep={maxStep} onStepClick={goToStep} /></div>
        <div style={{ padding: '0 24px 20px' }}>
          {step === 1 && (
            <div key={stepKey} className="div-step-card">
              <div className="g3" style={{ marginBottom: 14 }}>
                <div className="fg">
                  <label>Division Code</label>
                  <input className="fi" value={editTarget ? editTarget.code : nextCode} readOnly style={{ background: 'var(--bg2)', color: 'var(--text3)', cursor: 'default', fontFamily: 'monospace', fontWeight: 600 }} />
                </div>
                <div className="fg">
                  <label>Division Name <span className="req">*</span></label>
                  <input className="fi" value={form.name} onChange={f('name')} placeholder="e.g. North Region Division" autoFocus />
                  {errors.name && <div className="fg-err">{errors.name}</div>}
                </div>
                <div className="fg">
                  <label>Short Name</label>
                  <input className="fi" value={form.shortName} onChange={f('shortName')} placeholder="e.g. NRD" />
                </div>
              </div>
              <div className="g2">
                <div className="fg">
                  <label><Globe size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Country <span className="req">*</span></label>
                  <CountrySelect value={countryObj} onChange={handleCountryChange} />
                  {errors.country && <div className="fg-err">{errors.country}</div>}
                </div>
                <div className="fg">
                  <label>City <span className="req">*</span></label>
                  <CitySelect value={cityObj} onChange={(v) => { setCityObj(v); setErrors((p) => ({ ...p, city: undefined })) }} countryId={countryObj?.id ?? null} />
                  {errors.city && <div className="fg-err">{errors.city}</div>}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div key={stepKey} className="div-step-card">
              <div className="g3" style={{ marginBottom: 14 }}>
                <div className="fg"><label>Contact Person</label><input className="fi" value={form.contactPerson} onChange={f('contactPerson')} placeholder="e.g. Rajesh Kumar" /></div>
                <div className="fg">
                  <label>Phone</label>
                  <PhoneInput value={form.contactPhone} onChange={(v) => setForm((p) => ({ ...p, contactPhone: v }))} phonecode={countryObj?.phonecode} emoji={countryObj?.emoji} />
                </div>
                <div className="fg">
                  <label>Email</label>
                  <input className="fi" value={form.email} onChange={f('email')} placeholder="division@company.com" type="email" />
                  {errors.email && <div className="fg-err">{errors.email}</div>}
                </div>
              </div>
              <div className="fg">
                <label>Address</label>
                <textarea className="fi" value={form.address} onChange={f('address')} placeholder="Street address, floor, suite…" rows={3} style={{ resize: 'vertical', lineHeight: 1.5 }} />
              </div>
            </div>
          )}
          {step === 3 && (
            <div key={stepKey} className="div-step-card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Globe size={11} /> Locale {countryObj && <span style={{ fontSize: '.6rem', color: 'var(--p)', fontWeight: 600 }}>auto-filled</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="fg">
                      <label>Currency <span className="req">*</span></label>
                      <SelectCurrency value={form.currency} onChange={(v) => { setForm((p) => ({ ...p, currency: v })); setErrors((p) => ({ ...p, currency: undefined })) }} country={countryObj} />
                      {errors.currency && <div className="fg-err">{errors.currency}</div>}
                    </div>
                    <div className="fg">
                      <label><Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Timezone <span className="req">*</span></label>
                      <SelectTimezone value={form.timezone} onChange={(v) => { setForm((p) => ({ ...p, timezone: v })); setErrors((p) => ({ ...p, timezone: undefined })) }} country={countryObj} />
                      {errors.timezone && <div className="fg-err">{errors.timezone}</div>}
                    </div>
                    <div className="fg">
                      <label>Date Format <span className="req">*</span></label>
                      <SelectDateFormat value={form.dateFormat} onChange={(v) => { setForm((p) => ({ ...p, dateFormat: v })); setErrors((p) => ({ ...p, dateFormat: undefined })) }} />
                      {errors.dateFormat && <div className="fg-err">{errors.dateFormat}</div>}
                    </div>
                    <div className="fg">
                      <label>Time Format <span className="req">*</span></label>
                      <select className="fi fi-sel" value={form.timeFormat} onChange={f('timeFormat')}><option value="">Select…</option>{TIME_FORMATS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}</select>
                      {errors.timeFormat && <div className="fg-err">{errors.timeFormat}</div>}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Banking & Legal</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="fg"><label>Bank Name</label><input className="fi" value={form.bankName} onChange={f('bankName')} placeholder="e.g. State Bank" /></div>
                    <div className="fg"><label>Bank Account No.</label><input className="fi" value={form.bankAccountNo} onChange={f('bankAccountNo')} placeholder="Account number" /></div>
                    <div className="fg"><label>IFSC Code</label><input className="fi" value={form.ifscCode} onChange={f('ifscCode')} placeholder="e.g. SBIN0001234" /></div>
                    <div className="fg"><label>Legal Employee ID</label><input className="fi" value={form.legalEmployeeId} onChange={f('legalEmployeeId')} placeholder="Optional" /></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ════ DELETE MODAL ════ */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Division" size="sm" variant="danger" icon={<Trash2 size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            {deleteAssignedCount === 0 && (
              <button className="btn btn-danger" disabled={deleteProcessing} onClick={handleDelete}>{deleteProcessing ? 'Deleting…' : 'Yes, Delete'}</button>
            )}
          </>
        }
      >
        {deleteAssignedCount > 0 ? (
          <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>
            <strong style={{ color: '#ef4444' }}>Cannot delete</strong> — <strong>{deleteAssignedCount}</strong> employee{deleteAssignedCount !== 1 ? 's are' : ' is'} currently assigned to <strong style={{ color: 'var(--text1)' }}>{deleteTarget?.name}</strong>. Unassign them first before deleting.
          </p>
        ) : (
          <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text1)' }}>{deleteTarget?.name}</strong>
            {deleteTarget?.code && <> (<code style={{ fontSize: '.78rem', background: 'var(--bg2)', padding: '1px 6px', borderRadius: 4 }}>{deleteTarget.code}</code>)</>}?{' '}
            This action cannot be undone.
          </p>
        )}
      </Modal>

      {/* ════ TOGGLE MODAL ════ */}
      <Modal
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        title={toggleTarget?.isActive ? 'Deactivate Division' : 'Activate Division'}
        size="sm"
        variant={toggleTarget?.isActive && toggleAssignedCount === 0 ? 'danger' : undefined}
        icon={toggleTarget?.isActive ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setToggleTarget(null)}>Cancel</button>
            {(toggleTarget && (!toggleTarget.isActive || toggleAssignedCount === 0)) && (
              <button
                className={toggleTarget.isActive ? 'btn btn-danger' : 'btn btn-p'}
                disabled={toggleProcessing}
                onClick={handleToggle}
              >
                {toggleProcessing ? 'Saving…' : toggleTarget.isActive ? <><ToggleLeft size={13} /> Deactivate</> : <><ToggleRight size={13} /> Activate</>}
              </button>
            )}
          </>
        }
      >
        {toggleAssignedCount > 0 && toggleTarget?.isActive ? (
          <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>
            <strong style={{ color: '#ef4444' }}>Cannot deactivate</strong> — <strong>{toggleAssignedCount}</strong> employee{toggleAssignedCount !== 1 ? 's are' : ' is'} currently assigned to <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.name}</strong>. Unassign them first.
          </p>
        ) : (
          <p style={{ fontSize: '.85rem', color: 'var(--text2)', lineHeight: 1.65 }}>
            {toggleTarget?.isActive
              ? <>Are you sure you want to deactivate <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.name}</strong>? Employees cannot be assigned to inactive divisions.</>
              : <>Activate <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.name}</strong>? It will be available for employee assignments.</>
            }
          </p>
        )}
      </Modal>

      {/* ════ ASSIGN EMPLOYEES MODAL ════ */}
      <AssignEmployeeModal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={assignTarget ? `Assign Employees — ${assignTarget.name}` : 'Assign Employees'}
        targetId={assignTarget?.id ?? null}
        employees={assignEmps}
        initialSelected={assignTarget ? employees.filter((e) => e.divisionId === assignTarget.id).map((e) => e.id) : []}
        onSave={handleAssignSubmit}
        saving={assignProcessing}
        designations={designations}
        departments={departments}
        locations={locations}
        grades={grades}
        entityList={divisions.map((d) => ({ id: d.id, name: d.name }))}
      />
    </>
  )
}
