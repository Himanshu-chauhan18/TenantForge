import { useState } from 'react'
import { router } from '@inertiajs/react'
import { MapPin, Plus, Check, X, Trash2, Pencil, Search, RefreshCw, Globe, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import { DataTable } from '~/components/data-table'
import type { DTColumn, VisibilityState } from '~/components/data-table'
import { Modal } from '~/components/modal'
import { CountrySelect } from '~/components/country-select'
import type { CountryOption } from '~/components/country-select'
import { CitySelect } from '~/components/city-select'
import type { CityOption } from '~/components/city-select'
import { AssignEmployeeModal } from '~/components/assign-employee-modal'
import type { AssignEmployee } from '~/components/assign-employee-modal'

const COLS_KEY = 'hrms-locations-cols-v1'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Location {
  id: number
  code: string
  name: string
  country: string
  city: string
  address: string
  landmark: string | null
  zipCode: string | null
  isActive: boolean
}

interface Employee {
  id: number
  fullName: string
  employeeCode: string | null
  locationId: number | null
  designationId: number | null
  departmentId: number | null
  gradeId: number | null
}

interface Lookup { id: number; name: string }

interface Props {
  locations:    Location[]
  employees:    Employee[]
  designations: Lookup[]
  departments:  Lookup[]
  grades:       Lookup[]
}

// ── Form state ────────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', country: '', city: '', address: '', landmark: '', zipCode: '' }
type FormState  = typeof EMPTY_FORM
type FormErrors = Partial<Record<keyof FormState, string>>

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeNextCode(list: Location[]): string {
  if (!list.length) return 'LOC0001'
  const max = list.reduce((m, l) => {
    const n = parseInt(l.code.replace('LOC', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `LOC${String(max + 1).padStart(4, '0')}`
}

// ── Columns ───────────────────────────────────────────────────────────────────

const buildColumns = (
  onEdit: (l: Location) => void,
  onDelete: (l: Location) => void,
  onAssign: (l: Location) => void,
  onToggle: (l: Location) => void,
  assignedCounts: Record<number, number>,
): DTColumn<Location>[] => [
  {
    key: 'code',
    label: 'Code',
    width: 110,
    render: (l) => (
      <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text3)', fontFamily: 'monospace' }}>
        {l.code}
      </code>
    ),
  },
  {
    key: 'name',
    label: 'Location',
    pinned: true,
    minWidth: 200,
    render: (l) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'var(--info-lt)', border: '1px solid rgba(2,132,199,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MapPin size={14} style={{ color: 'var(--info)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)' }}>{l.name}</div>
          {l.address && <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginTop: 1 }}>{l.address}</div>}
        </div>
      </div>
    ),
  },
  {
    key: 'country',
    label: 'Country',
    sortable: false,
    width: 140,
    render: (l) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Globe size={12} style={{ color: 'var(--text4)', flexShrink: 0 }} />
        <span style={{ fontSize: '.82rem' }}>{l.country}</span>
      </div>
    ),
  },
  {
    key: 'city',
    label: 'City',
    sortable: false,
    width: 120,
    render: (l) => <span style={{ fontSize: '.82rem' }}>{l.city}</span>,
  },
  {
    key: 'zipCode',
    label: 'ZIP',
    sortable: false,
    width: 90,
    render: (l) => l.zipCode
      ? <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', color: 'var(--text2)', fontFamily: 'monospace' }}>{l.zipCode}</code>
      : <span style={{ color: 'var(--text4)' }}>—</span>,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    width: 110,
    render: (l) => (
      <span className={`bdg ${l.isActive ? 'bdg-green' : 'bdg-gray'}`}>
        <span className="bdg-dot" />{l.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    pinned: true,
    width: 175,
    render: (l) => {
      const cnt = assignedCounts[l.id] ?? 0
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onAssign(l)} title="Assign Employees"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--s)', background: 'var(--s-lt)', border: '1px solid rgba(5,150,105,.2)', cursor: 'pointer' }}
          >
            <Users size={11} /> Assign
          </button>
          <button
            onClick={() => onEdit(l)} title="Edit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer' }}
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => onToggle(l)}
            title={l.isActive ? 'Deactivate' : 'Activate'}
            style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 6px', borderRadius: 7, color: l.isActive ? '#f59e0b' : 'var(--s)', background: l.isActive ? 'rgba(245,158,11,.07)' : 'var(--s-lt)', border: `1px solid ${l.isActive ? 'rgba(245,158,11,.3)' : 'rgba(5,150,105,.2)'}`, cursor: 'pointer' }}
          >
            {l.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
          </button>
          <button
            onClick={() => onDelete(l)}
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LocationsPage({ locations, employees, designations, departments, grades }: Props) {
  const [search,  setSearch]  = useState('')
  const [colVis,  setColVis]  = useState<VisibilityState>({})
  const [loading, setLoading] = useState(false)

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState<Location | null>(null)
  const [form,        setForm]        = useState<FormState>({ ...EMPTY_FORM })
  const [errors,      setErrors]      = useState<FormErrors>({})
  const [processing,  setProcessing]  = useState(false)

  // Country/city picker objects (null = not yet re-selected, use form string)
  const [countryObj, setCountryObj] = useState<CountryOption | null>(null)
  const [cityObj,    setCityObj]    = useState<CityOption | null>(null)

  const [deleteTarget,     setDeleteTarget]     = useState<Location | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [toggleTarget,     setToggleTarget]     = useState<Location | null>(null)
  const [toggleProcessing, setToggleProcessing] = useState(false)

  const [assignTarget,     setAssignTarget]     = useState<Location | null>(null)
  const [assignProcessing, setAssignProcessing] = useState(false)

  const filtered = search
    ? locations.filter((l) => {
        const q = search.toLowerCase()
        return (
          l.name.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q) ||
          l.country.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          (l.zipCode ?? '').toLowerCase().includes(q)
        )
      })
    : locations

  const assignedCounts = employees.reduce<Record<number, number>>((acc, e) => {
    if (e.locationId) acc[e.locationId] = (acc[e.locationId] ?? 0) + 1
    return acc
  }, {})

  function openAssign(l: Location) { setAssignTarget(l) }

  function handleAssignSubmit(ids: number[]) {
    if (!assignTarget) return
    setAssignProcessing(true)
    router.post(`/hrms/organization/settings/locations/${assignTarget.id}/assign`, { employeeIds: ids }, {
      onSuccess: () => setAssignTarget(null),
      onFinish:  () => setAssignProcessing(false),
    })
  }

  const assignEmps: AssignEmployee[] = employees.map((e) => ({
    id:                  e.id,
    fullName:            e.fullName,
    employeeCode:        e.employeeCode,
    designationId:       e.designationId,
    departmentId:        e.departmentId,
    locationId:          e.locationId,
    gradeId:             e.gradeId,
    currentAssignmentId: e.locationId,
  }))

  const columns  = buildColumns(openEdit, (l) => setDeleteTarget(l), openAssign, (l) => setToggleTarget(l), assignedCounts)
  const nextCode = computeNextCode(locations)

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function openAdd() {
    setEditTarget(null)
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setCountryObj(null)
    setCityObj(null)
    setModalOpen(true)
  }

  function openEdit(l: Location) {
    setEditTarget(l)
    setForm({ name: l.name, country: l.country, city: l.city, address: l.address, landmark: l.landmark ?? '', zipCode: l.zipCode ?? '' })
    setErrors({})
    setCountryObj(null)
    setCityObj(null)
    setModalOpen(true)
  }

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.name.trim())    e.name    = 'Location name is required'
    if (!form.country.trim()) e.country = 'Country is required'
    if (!form.city.trim())    e.city    = 'City is required'
    if (!form.address.trim()) e.address = 'Address is required'
    return e
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setProcessing(true)
    const payload = {
      name:     form.name.trim(),
      country:  form.country.trim(),
      city:     form.city.trim(),
      address:  form.address.trim(),
      landmark: form.landmark.trim() || null,
      zipCode:  form.zipCode.trim() || null,
    }
    if (editTarget) {
      router.put(`/hrms/organization/settings/locations/${editTarget.id}`, payload, {
        onSuccess: () => setModalOpen(false),
        onError:   () => setErrors({ name: 'Failed to save. Please try again.' }),
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/locations', payload, {
        onSuccess: () => setModalOpen(false),
        onError:   () => setErrors({ name: 'Failed to save. Please try again.' }),
        onFinish:  () => setProcessing(false),
      })
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/locations/${deleteTarget.id}`, {
      onSuccess: () => setDeleteTarget(null),
      onFinish:  () => setDeleteProcessing(false),
    })
  }

  function handleToggle() {
    if (!toggleTarget) return
    setToggleProcessing(true)
    router.patch(`/hrms/organization/settings/locations/${toggleTarget.id}/toggle`, {}, {
      onSuccess: () => setToggleTarget(null),
      onFinish:  () => setToggleProcessing(false),
    })
  }

  const deleteAssignedCount = deleteTarget ? (assignedCounts[deleteTarget.id] ?? 0) : 0
  const toggleAssignedCount = toggleTarget ? (assignedCounts[toggleTarget.id] ?? 0) : 0

  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Locations</div>
          <div className="ph-sub">Manage work locations and office addresses for your organisation</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}><Plus size={14} /> Add Location</button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 300 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search locations…" />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <X size={12} style={{ color: 'var(--text3)' }} />
              </button>
            )}
          </div>
          <button className="btn btn-ghost" onClick={() => { setLoading(true); router.reload({ onFinish: () => setLoading(false) }) }} style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)' }}>
            <RefreshCw size={13} style={{ transition: 'transform .4s', transform: loading ? 'rotate(360deg)' : 'none' }} />
          </button>
          <span style={{ marginLeft: 'auto', fontSize: '.76rem', color: 'var(--text3)' }}>
            {filtered.length} location{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <DataTable<Location>
          data={filtered}
          columns={columns}
          rowKey={(r) => r.id}
          clientPageSize={25}
          storageKey={COLS_KEY}
          noun="location"
          columnVisibility={colVis}
          onColumnVisibilityChange={setColVis}
          hideToolbar
          emptyIcon={<MapPin size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
          emptyTitle={search ? 'No locations match your search' : 'No locations yet'}
          emptyDesc={search ? 'Try a different keyword.' : 'Add your first location to get started.'}
          emptyAction={!search && (
            <button className="btn btn-p btn-sm" onClick={openAdd} style={{ display: 'inline-flex' }}>
              <Plus size={13} /> Add Location
            </button>
          )}
        />
      </div>

      {/* ════ ADD / EDIT MODAL ════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Location' : 'Add Location'}
        icon={<MapPin size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
              {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create Location</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {editTarget && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <MapPin size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              <span style={{ fontSize: '.74rem', color: 'var(--text3)' }}>Code:</span>
              <code style={{ fontSize: '.74rem', color: 'var(--text2)', fontFamily: 'monospace', fontWeight: 600 }}>{editTarget.code}</code>
            </div>
          )}
          <div className="fg">
            <label>Location Name <span className="req">*</span></label>
            <input className="fi" value={form.name} onChange={field('name')} placeholder="e.g. Mumbai Head Office" autoFocus />
            {errors.name && <div className="fg-err">{errors.name}</div>}
          </div>
          <div className="g2">
            <div className="fg">
              <label>Country <span className="req">*</span></label>
              {editTarget && !countryObj && (
                <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginBottom: 4 }}>
                  Current: <strong style={{ color: 'var(--text2)' }}>{editTarget.country}</strong> — select below to change
                </div>
              )}
              <CountrySelect
                value={countryObj}
                onChange={(o) => {
                  setCountryObj(o)
                  setCityObj(null)
                  setForm((prev) => ({ ...prev, country: o?.name ?? '', city: '' }))
                }}
              />
              {errors.country && <div className="fg-err">{errors.country}</div>}
            </div>
            <div className="fg">
              <label>City <span className="req">*</span></label>
              {editTarget && !cityObj && (
                <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginBottom: 4 }}>
                  Current: <strong style={{ color: 'var(--text2)' }}>{editTarget.city}</strong> — select below to change
                </div>
              )}
              <CitySelect
                value={cityObj}
                countryId={countryObj?.id ?? null}
                onChange={(o) => {
                  setCityObj(o)
                  setForm((prev) => ({ ...prev, city: o?.name ?? '' }))
                }}
              />
              {errors.city && <div className="fg-err">{errors.city}</div>}
            </div>
          </div>
          <div className="fg">
            <label>Address <span className="req">*</span></label>
            <input className="fi" value={form.address} onChange={field('address')} placeholder="Street address, building, floor…" />
            {errors.address && <div className="fg-err">{errors.address}</div>}
          </div>
          <div className="g2">
            <div className="fg">
              <label>Landmark</label>
              <input className="fi" value={form.landmark} onChange={field('landmark')} placeholder="e.g. Near Central Mall" />
            </div>
            <div className="fg">
              <label>Zip / PIN Code</label>
              <input className="fi" value={form.zipCode} onChange={field('zipCode')} placeholder="e.g. 400001" />
            </div>
          </div>
        </div>
      </Modal>

      {/* ════ DELETE MODAL ════ */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Location"
        size="sm"
        variant="danger"
        icon={<Trash2 size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            {deleteAssignedCount === 0 && (
              <button className="btn btn-danger" disabled={deleteProcessing} onClick={handleDelete}>
                {deleteProcessing ? 'Deleting…' : 'Yes, Delete'}
              </button>
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
        title={toggleTarget?.isActive ? 'Deactivate Location' : 'Activate Location'}
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
              ? <>Are you sure you want to deactivate <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.name}</strong>? Employees cannot be assigned to inactive locations.</>
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
        initialSelected={assignTarget ? employees.filter((e) => e.locationId === assignTarget.id).map((e) => e.id) : []}
        onSave={handleAssignSubmit}
        saving={assignProcessing}
        designations={designations}
        departments={departments}
        grades={grades}
        entityList={locations.map((l) => ({ id: l.id, name: l.name }))}
      />
    </>
  )
}
