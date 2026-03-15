import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { router } from '@inertiajs/react'
import {
  CalendarDays, Plus, Edit2, Trash2, X, Check, Search, RefreshCw,
  ChevronDown, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { Modal } from '~/components/modal'
import { DatePicker } from '~/components/date-picker'
import { Checkbox } from '~/components/checkbox'
import { SelectSearch } from '~/components/select-search'

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

// ── Multi-select component (portal-based to avoid modal overflow clipping) ────

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
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const selectedItems = options.filter((o) => selected.includes(o.id))

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  function openDrop() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setOpen(true)
  }

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        className="fi"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', minHeight: 36, height: 'auto', padding: '6px 10px' }}
        onClick={() => open ? setOpen(false) : openDrop()}
      >
        <span style={{ fontSize: '.82rem', color: selectedItems.length ? 'var(--text1)' : 'var(--text4)', display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1, textAlign: 'left' }}>
          {selectedItems.length === 0
            ? placeholder
            : selectedItems.map((item) => (
              <span key={item.id} className="bx bx-teal" style={{ fontSize: '.68rem' }}>{item.name}</span>
            ))
          }
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text3)', flexShrink: 0, marginLeft: 4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && dropPos && createPortal(
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.15)', maxHeight: 200, overflowY: 'auto' }}>
            {options.length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: '.78rem', color: 'var(--text4)' }}>No options available</div>
            )}
            {options.map((opt) => (
              <div key={opt.id} style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', borderBottom: '1px solid var(--border)' }}>
                <Checkbox checked={selected.includes(opt.id)} onChange={() => toggle(opt.id)}>
                  {opt.name}
                </Checkbox>
                <code style={{ fontSize: '.68rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', color: 'var(--text3)', marginLeft: 'auto' }}>{opt.code}</code>
              </div>
            ))}
          </div>
        </>,
        document.body
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

  const [toggleTarget, setToggleTarget]         = useState<Holiday | null>(null)
  const [toggleProcessing, setToggleProcessing] = useState(false)

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

  // ── Toggle ─────────────────────────────────────────────────────────────────
  function handleToggle() {
    if (!toggleTarget) return
    setToggleProcessing(true)
    router.patch(`/hrms/organization/settings/holidays/${toggleTarget.id}/toggle`, {}, {
      onSuccess: () => { setToggleTarget(null) },
      onFinish:  () => setToggleProcessing(false),
    })
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
          <div style={{ width: 130 }}>
            <SelectSearch
              value={yearFilter === 'all' ? 'all' : String(yearFilter)}
              onChange={(v) => setYearFilter(v === 'all' ? 'all' : Number(v))}
              options={[
                { value: 'all', label: 'All Years' },
                ...availableYears.map((y) => ({ value: String(y), label: String(y) })),
              ]}
              placeholder="All Years"
            />
          </div>
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
                      <Th style={{ width: 140 }}>Actions</Th>
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
                              onClick={() => setToggleTarget(h)}
                              title={h.isActive ? 'Deactivate' : 'Activate'}
                              style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: h.isActive ? 'var(--teal-lt)' : 'var(--bg2)', border: h.isActive ? '1px solid rgba(20,184,166,.2)' : '1px solid var(--border)', color: h.isActive ? 'var(--teal)' : 'var(--text3)', cursor: 'pointer' }}
                            >
                              {h.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
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
          {/* Row 1: Name + Date */}
          <div className="g2">
            <div className="fg">
              <label>Holiday Name <span className="req">*</span></label>
              <input className="fi" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Republic Day" autoFocus />
              {errors.name && <div className="fg-err">{errors.name}</div>}
            </div>
            <div className="fg">
              <label>Date <span className="req">*</span></label>
              <DatePicker value={form.date} onChange={(v) => setField('date', v)} placeholder="Select date…" />
              {errors.date && <div className="fg-err">{errors.date}</div>}
            </div>
          </div>

          {/* Row 2: Description (full width) */}
          <div className="fg">
            <label>Description</label>
            <textarea className="fi" value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Optional notes…" rows={2} style={{ resize: 'vertical' }} />
          </div>

          {/* Row 3: Type + Apply On */}
          <div className="g2">
            <div className="fg">
              <label>Type</label>
              <div style={{ display: 'flex', alignItems: 'center', height: 36, paddingLeft: 2 }}>
                <Checkbox checked={form.isFlexi} onChange={() => setField('isFlexi', !form.isFlexi)}>
                  Flexi Holiday
                </Checkbox>
              </div>
              <div className="fg-hint">Uncheck for a fixed (mandatory) holiday.</div>
            </div>
            <div className="fg">
              <label>Apply On <span className="req">*</span></label>
              <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 9, padding: 3, gap: 2, border: '1px solid var(--border)', height: 36 }}>
                {(['division', 'location', 'both'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setField('applyTo', v)}
                    style={{
                      flex: 1, borderRadius: 7, border: 'none', cursor: 'pointer',
                      fontSize: '.78rem', fontWeight: 600, transition: 'all .15s',
                      background: form.applyTo === v ? 'var(--surface)' : 'transparent',
                      color: form.applyTo === v ? 'var(--text1)' : 'var(--text3)',
                      boxShadow: form.applyTo === v ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                    }}
                  >
                    {v === 'division' ? 'Division' : v === 'location' ? 'Location' : 'Both'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Divisions + Locations (side-by-side when both) */}
          <div className={form.applyTo === 'both' ? 'g2' : undefined}>
            {(form.applyTo === 'division' || form.applyTo === 'both') && (
              <div className="fg">
                <label>Divisions <span className="req">*</span></label>
                <MultiSelect options={divisions} selected={form.divisionIds} onChange={(ids) => setField('divisionIds', ids)} placeholder="Select divisions…" />
                {errors.divisionIds && <div className="fg-err">{errors.divisionIds}</div>}
              </div>
            )}
            {(form.applyTo === 'location' || form.applyTo === 'both') && (
              <div className="fg">
                <label>Locations <span className="req">*</span></label>
                <MultiSelect options={locations} selected={form.locationIds} onChange={(ids) => setField('locationIds', ids)} placeholder="Select locations…" />
                {errors.locationIds && <div className="fg-err">{errors.locationIds}</div>}
              </div>
            )}
          </div>
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

      {/* ════════ TOGGLE MODAL ════════ */}
      <Modal
        open={toggleTarget !== null}
        onClose={() => setToggleTarget(null)}
        title={toggleTarget?.isActive ? 'Deactivate Holiday' : 'Activate Holiday'}
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
            ? <>Are you sure you want to deactivate <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.name}</strong>? It will no longer appear as active.</>
            : <>Activate <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.name}</strong>? It will be marked as active.</>
          }
        </p>
      </Modal>
    </>
  )
}
