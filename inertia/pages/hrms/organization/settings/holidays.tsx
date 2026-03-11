import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  CalendarDays, Plus, Edit2, Trash2, X, Check, Search, RefreshCw,
  ChevronDown,
} from 'lucide-react'
import { Modal } from '~/components/modal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Holiday {
  id: number
  name: string
  date: string
  isFlexi: boolean
  description: string | null
  applyTo: 'division' | 'location' | 'both'
  divisionIds: number[]
  locationIds: number[]
  isActive: boolean
}

interface Division { id: number; name: string; code: string }
interface Location { id: number; name: string; code: string }

interface Props {
  holidays: Holiday[]
  divisions: Division[]
  locations: Location[]
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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getMonth(dateStr: string): number {
  return new Date(dateStr).getMonth()
}

function getYear(dateStr: string): number {
  return new Date(dateStr).getFullYear()
}

function EmptyState({ search }: { search: string }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ opacity: .15, color: 'var(--text3)', marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
        <CalendarDays size={40} />
      </div>
      <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
        {search ? 'No holidays match your search' : 'No holidays yet'}
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--text4)' }}>
        {search ? 'Try a different keyword.' : 'Add your first holiday to get started.'}
      </div>
    </div>
  )
}

// ── Multi-select component ────────────────────────────────────────────────────

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: { id: number; name: string; code: string }[]
  selected: number[]
  onChange: (ids: number[]) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const selectedItems = options.filter((o) => selected.includes(o.id))

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="fi"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', minHeight: 36, height: 'auto', padding: '6px 10px' }}
        onClick={() => setOpen((p) => !p)}
      >
        <span style={{ fontSize: '.82rem', color: selectedItems.length ? 'var(--text1)' : 'var(--text4)', display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1, textAlign: 'left' }}>
          {selectedItems.length === 0
            ? placeholder
            : selectedItems.map((item) => (
              <span
                key={item.id}
                className="bx bx-teal"
                style={{ fontSize: '.68rem' }}
              >
                {item.name}
              </span>
            ))
          }
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text3)', flexShrink: 0, marginLeft: 4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.1)', maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
          {options.length === 0 && (
            <div style={{ padding: '10px 12px', fontSize: '.78rem', color: 'var(--text4)' }}>No options available</div>
          )}
          {options.map((opt) => (
            <label
              key={opt.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', fontSize: '.82rem', color: 'var(--text1)', borderBottom: '1px solid var(--border)' }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => toggle(opt.id)}
                style={{ accentColor: 'var(--p)' }}
              />
              <span>{opt.name}</span>
              <code style={{ fontSize: '.68rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', color: 'var(--text3)', marginLeft: 'auto' }}>{opt.code}</code>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Default form state ────────────────────────────────────────────────────────

function defaultForm() {
  return {
    name: '',
    date: '',
    isFlexi: false,
    description: '',
    applyTo: 'both' as 'division' | 'location' | 'both',
    divisionIds: [] as number[],
    locationIds: [] as number[],
  }
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HolidaysPage({ holidays, divisions, locations }: Props) {
  const [search, setSearch]         = useState('')
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<Holiday | null>(null)
  const [form, setForm]             = useState(defaultForm())
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)

  const [deleteOpen, setDeleteOpen]             = useState(false)
  const [deleteTarget, setDeleteTarget]         = useState<Holiday | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const off1 = router.on('start',  () => setIsLoading(true))
    const off2 = router.on('finish', () => setIsLoading(false))
    return () => { off1(); off2() }
  }, [])

  // ── Available years ────────────────────────────────────────────────────────
  const availableYears = [...new Set(holidays.map((h) => getYear(h.date)))].sort((a, b) => b - a)

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = holidays.filter((h) => {
    if (yearFilter !== 'all' && getYear(h.date) !== yearFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return h.name.toLowerCase().includes(q)
  })

  // ── Group by month ─────────────────────────────────────────────────────────
  const grouped: Record<number, Holiday[]> = {}
  for (const h of filtered) {
    const m = getMonth(h.date)
    if (!grouped[m]) grouped[m] = []
    grouped[m].push(h)
  }
  const monthsPresent = Object.keys(grouped).map(Number).sort((a, b) => a - b)

  // ── Summary ────────────────────────────────────────────────────────────────
  const totalCount = filtered.length
  const flexiCount = filtered.filter((h) => h.isFlexi).length
  const fixedCount = totalCount - flexiCount

  // ── Open modals ────────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setForm(defaultForm())
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(h: Holiday) {
    setEditTarget(h)
    setForm({
      name: h.name,
      date: h.date,
      isFlexi: h.isFlexi,
      description: h.description ?? '',
      applyTo: h.applyTo,
      divisionIds: h.divisionIds,
      locationIds: h.locationIds,
    })
    setErrors({})
    setModalOpen(true)
  }

  function setField<K extends keyof ReturnType<typeof defaultForm>>(key: K, value: ReturnType<typeof defaultForm>[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())  e.name = 'Holiday name is required'
    if (!form.date)         e.date = 'Date is required'
    if (form.applyTo !== 'location' && form.divisionIds.length === 0) e.divisionIds = 'Select at least one division'
    if (form.applyTo !== 'division' && form.locationIds.length === 0) e.locationIds = 'Select at least one location'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (!validate()) return
    setProcessing(true)
    const payload = {
      name:        form.name.trim(),
      date:        form.date,
      isFlexi:     form.isFlexi,
      description: form.description.trim() || null,
      applyTo:     form.applyTo,
      divisionIds: form.divisionIds,
      locationIds: form.locationIds,
    }
    if (editTarget) {
      router.put(`/hrms/organization/settings/holidays/${editTarget.id}`, payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/holidays', payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function openDelete(h: Holiday) {
    setDeleteTarget(h)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/holidays/${deleteTarget.id}`, {
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
          <div className="ph-title">Holiday Calendar</div>
          <div className="ph-sub">Manage public holidays, optional leaves, and flexi holidays</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}>
            <Plus size={14} /> Add Holiday
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Holidays', value: totalCount, cls: 'bx-teal' },
          { label: 'Fixed Holidays', value: fixedCount, cls: 'bx-purple' },
          { label: 'Flexi Holidays', value: flexiCount, cls: 'bx-amber' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 140px' }}>
            <span className={`bx ${s.cls}`} style={{ fontSize: '1.1rem', fontWeight: 800, padding: '6px 12px' }}>{s.value}</span>
            <span style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="card">
        {/* Toolbar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 280 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search holidays…" />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <X size={12} style={{ color: 'var(--text3)' }} />
              </button>
            )}
          </div>
          {/* Year filter */}
          <select
            className="fi"
            value={yearFilter === 'all' ? 'all' : String(yearFilter)}
            onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ width: 120, height: 36 }}
          >
            <option value="all">All Years</option>
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-ghost" title="Refresh" onClick={() => router.reload()} style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }}>
            <RefreshCw size={13} style={{ transition: 'transform .4s', transform: isLoading ? 'rotate(360deg)' : 'none' }} />
          </button>
        </div>

        {/* Grouped by month */}
        {filtered.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          monthsPresent.map((month) => (
            <div key={month}>
              {/* Month header */}
              <div style={{ padding: '8px 14px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarDays size={13} style={{ color: 'var(--text3)' }} />
                <span style={{ fontSize: '.73rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)' }}>
                  {MONTH_NAMES[month]}
                </span>
                <span className="bx bx-gray" style={{ fontSize: '.68rem' }}>{grouped[month].length}</span>
              </div>
              <div className="tw">
                <table className="dt">
                  <thead>
                    <tr>
                      <Th>Name</Th>
                      <Th style={{ width: 140 }}>Date</Th>
                      <Th style={{ width: 100, textAlign: 'center' }}>Type</Th>
                      <Th style={{ width: 120, textAlign: 'center' }}>Apply To</Th>
                      <Th style={{ width: 160 }}>Scope</Th>
                      <Th style={{ width: 100 }}>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[month].map((h) => (
                      <tr key={h.id}>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: h.isFlexi ? 'var(--warn-lt)' : 'var(--p-lt)', border: `1px solid ${h.isFlexi ? 'rgba(217,119,6,.18)' : 'var(--p-mid)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <CalendarDays size={12} style={{ color: h.isFlexi ? 'var(--warn)' : 'var(--p)' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '.83rem' }}>{h.name}</div>
                              {h.description && <div style={{ fontSize: '.72rem', color: 'var(--text4)', marginTop: 1 }}>{h.description}</div>}
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}>{formatDate(h.date)}</span>
                        </Td>
                        <Td style={{ textAlign: 'center' }}>
                          <span className={`bx ${h.isFlexi ? 'bx-amber' : 'bx-purple'}`}>
                            {h.isFlexi ? 'Flexi' : 'Fixed'}
                          </span>
                        </Td>
                        <Td style={{ textAlign: 'center' }}>
                          <span className={`bx ${h.applyTo === 'both' ? 'bx-teal' : h.applyTo === 'division' ? 'bx-green' : 'bx-purple'}`}>
                            {h.applyTo === 'both' ? 'Both' : h.applyTo === 'division' ? 'Division' : 'Location'}
                          </span>
                        </Td>
                        <Td>
                          <div style={{ fontSize: '.75rem', color: 'var(--text3)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {(h.applyTo === 'division' || h.applyTo === 'both') && h.divisionIds.length > 0 && (
                              <span>{h.divisionIds.length} division{h.divisionIds.length !== 1 ? 's' : ''}</span>
                            )}
                            {(h.applyTo === 'location' || h.applyTo === 'both') && h.locationIds.length > 0 && (
                              <span>{h.locationIds.length} location{h.locationIds.length !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <button
                              onClick={() => openEdit(h)}
                              title="Edit"
                              style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', color: 'var(--p)', cursor: 'pointer' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => openDelete(h)}
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* ════════ ADD / EDIT MODAL ════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Holiday' : 'Add Holiday'}
        size="md"
        icon={<CalendarDays size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
              {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create Holiday</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name */}
          <div className="fg">
            <label>Holiday Name <span className="req">*</span></label>
            <input className="fi" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Republic Day" autoFocus />
            {errors.name && <div className="fg-err">{errors.name}</div>}
          </div>

          {/* Date */}
          <div className="fg">
            <label>Date <span className="req">*</span></label>
            <input type="date" className="fi" value={form.date} onChange={(e) => setField('date', e.target.value)} />
            {errors.date && <div className="fg-err">{errors.date}</div>}
          </div>

          {/* Flexi toggle */}
          <div className="fg">
            <label>Holiday Type</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['false', 'true'] as const).map((val) => {
                const isFlexi = val === 'true'
                const active  = form.isFlexi === isFlexi
                return (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '7px 14px', borderRadius: 8, border: `1px solid ${active ? (isFlexi ? 'rgba(217,119,6,.4)' : 'var(--p-mid)') : 'var(--border)'}`, background: active ? (isFlexi ? 'var(--warn-lt)' : 'var(--p-lt)') : 'var(--bg2)', flex: 1 }}>
                    <input type="radio" name="isFlexi" checked={active} onChange={() => setField('isFlexi', isFlexi)} style={{ accentColor: 'var(--p)' }} />
                    <span style={{ fontSize: '.82rem', fontWeight: 600, color: active ? (isFlexi ? 'var(--warn)' : 'var(--p)') : 'var(--text2)' }}>
                      {isFlexi ? 'Flexi Holiday' : 'Fixed Holiday'}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div className="fg">
            <label>Description</label>
            <textarea className="fi" value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Optional notes about this holiday" rows={2} style={{ resize: 'vertical' }} />
          </div>

          {/* Apply To */}
          <div className="fg">
            <label>Apply On <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(
                [
                  { value: 'division', label: 'Division Only' },
                  { value: 'location', label: 'Location Only' },
                  { value: 'both',     label: 'Both' },
                ] as const
              ).map((opt) => {
                const active = form.applyTo === opt.value
                return (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, border: `1px solid ${active ? 'var(--p-mid)' : 'var(--border)'}`, background: active ? 'var(--p-lt)' : 'var(--bg2)', flex: 1 }}>
                    <input type="radio" name="applyTo" checked={active} onChange={() => setField('applyTo', opt.value)} style={{ accentColor: 'var(--p)' }} />
                    <span style={{ fontSize: '.8rem', fontWeight: 600, color: active ? 'var(--p)' : 'var(--text2)' }}>{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Division multi-select */}
          {(form.applyTo === 'division' || form.applyTo === 'both') && (
            <div className="fg">
              <label>Divisions <span className="req">*</span></label>
              <MultiSelect
                options={divisions}
                selected={form.divisionIds}
                onChange={(ids) => setField('divisionIds', ids)}
                placeholder="Select divisions…"
              />
              {errors.divisionIds && <div className="fg-err">{errors.divisionIds}</div>}
            </div>
          )}

          {/* Location multi-select */}
          {(form.applyTo === 'location' || form.applyTo === 'both') && (
            <div className="fg">
              <label>Locations <span className="req">*</span></label>
              <MultiSelect
                options={locations}
                selected={form.locationIds}
                onChange={(ids) => setField('locationIds', ids)}
                placeholder="Select locations…"
              />
              {errors.locationIds && <div className="fg-err">{errors.locationIds}</div>}
            </div>
          )}
        </div>
      </Modal>

      {/* ════════ DELETE MODAL ════════ */}
      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        title="Delete Holiday"
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
          Are you sure you want to delete holiday{' '}
          <strong style={{ color: 'var(--text1)' }}>{deleteTarget?.name}</strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}
