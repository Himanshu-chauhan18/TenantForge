import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import {
  MapPin, Plus, Edit2, Trash2, X, Check, Search, RefreshCw,
  Globe,
} from 'lucide-react'
import { Modal } from '~/components/modal'

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

interface Props {
  locations: Location[]
}

// ── Form defaults ─────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name:     '',
  country:  '',
  city:     '',
  address:  '',
  landmark: '',
  zipCode:  '',
}

type FormState  = typeof EMPTY_FORM
type FormErrors = Partial<Record<keyof FormState, string>>

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
        <MapPin size={40} />
      </div>
      <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
        {search ? 'No locations match your search' : 'No locations yet'}
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--text4)' }}>
        {search ? 'Try a different keyword.' : 'Add your first location to get started.'}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LocationsPage({ locations }: Props) {
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<Location | null>(null)
  const [form, setForm]             = useState<FormState>({ ...EMPTY_FORM })
  const [errors, setErrors]         = useState<FormErrors>({})
  const [processing, setProcessing] = useState(false)

  const [deleteOpen, setDeleteOpen]               = useState(false)
  const [deleteTarget, setDeleteTarget]           = useState<Location | null>(null)
  const [deleteProcessing, setDeleteProcessing]   = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const off1 = router.on('start',  () => setIsLoading(true))
    const off2 = router.on('finish', () => setIsLoading(false))
    return () => { off1(); off2() }
  }, [])

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = locations.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.name.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      l.country.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      (l.zipCode ?? '').toLowerCase().includes(q)
    )
  })

  // ── Open modals ────────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null)
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(l: Location) {
    setEditTarget(l)
    setForm({
      name:     l.name,
      country:  l.country,
      city:     l.city,
      address:  l.address,
      landmark: l.landmark ?? '',
      zipCode:  l.zipCode ?? '',
    })
    setErrors({})
    setModalOpen(true)
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.name.trim())    e.name    = 'Location name is required'
    if (!form.country.trim()) e.country = 'Country is required'
    if (!form.city.trim())    e.city    = 'City is required'
    if (!form.address.trim()) e.address = 'Address is required'
    return e
  }

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
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
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/locations', payload, {
        onSuccess: () => { setModalOpen(false) },
        onFinish:  () => setProcessing(false),
      })
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function openDelete(l: Location) {
    setDeleteTarget(l)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/locations/${deleteTarget.id}`, {
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
          <div className="ph-title">Locations</div>
          <div className="ph-sub">Manage work locations and office addresses for your organisation</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}>
            <Plus size={14} /> Add Location
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        {/* Toolbar */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 320 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search locations…" />
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
            {filtered.length} location{filtered.length !== 1 ? 's' : ''}
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
                  <Th>Country</Th>
                  <Th>City</Th>
                  <Th>Zip Code</Th>
                  <Th style={{ textAlign: 'center' }}>Status</Th>
                  <Th style={{ width: 100 }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <Td>
                      <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text2)', fontFamily: 'monospace' }}>
                        {l.code}
                      </code>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--info-lt)', border: '1px solid rgba(2,132,199,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <MapPin size={13} style={{ color: 'var(--info)' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text1)', fontSize: '.83rem' }}>{l.name}</div>
                          {l.address && <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginTop: 1 }}>{l.address}</div>}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Globe size={12} style={{ color: 'var(--text4)', flexShrink: 0 }} />
                        <span>{l.country}</span>
                      </div>
                    </Td>
                    <Td>{l.city}</Td>
                    <Td>
                      {l.zipCode ? (
                        <code style={{ fontSize: '.75rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', color: 'var(--text2)', fontFamily: 'monospace' }}>
                          {l.zipCode}
                        </code>
                      ) : <span style={{ color: 'var(--text4)' }}>—</span>}
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span className={`bx ${l.isActive ? 'bx-teal' : 'bx-gray'}`}>
                        {l.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => openEdit(l)}
                          title="Edit"
                          style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', color: 'var(--p)', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => openDelete(l)}
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
        title={editTarget ? 'Edit Location' : 'Add Location'}
        icon={<MapPin size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
              {processing
                ? 'Saving…'
                : editTarget
                  ? <><Check size={13} /> Save Changes</>
                  : <><Plus size={13} /> Create Location</>
              }
            </button>
          </>
        }
      >
        {editTarget && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 16 }}>
            <MapPin size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <span style={{ fontSize: '.74rem', color: 'var(--text3)' }}>Code:</span>
            <code style={{ fontSize: '.74rem', color: 'var(--text2)', fontFamily: 'monospace', fontWeight: 600 }}>{editTarget.code}</code>
            <span style={{ fontSize: '.68rem', color: 'var(--text4)', marginLeft: 4 }}>(auto-generated, read-only)</span>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Location Name <span className="req">*</span></label>
            <input className="fi" value={form.name} onChange={field('name')} placeholder="e.g. Mumbai Head Office" autoFocus />
            {errors.name && <div className="fg-err">{errors.name}</div>}
          </div>
          <div className="g2">
            <div className="fg">
              <label>Country <span className="req">*</span></label>
              <input className="fi" value={form.country} onChange={field('country')} placeholder="e.g. India" />
              {errors.country && <div className="fg-err">{errors.country}</div>}
            </div>
            <div className="fg">
              <label>City <span className="req">*</span></label>
              <input className="fi" value={form.city} onChange={field('city')} placeholder="e.g. Mumbai" />
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

      {/* ════════ DELETE MODAL ════════ */}
      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        title="Delete Location"
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
          Are you sure you want to delete location{' '}
          <strong style={{ color: 'var(--text1)' }}>{deleteTarget?.name}</strong>
          {deleteTarget?.code && (
            <> (<code style={{ fontSize: '.78rem', background: 'var(--bg2)', padding: '1px 6px', borderRadius: 4 }}>{deleteTarget.code}</code>)</>
          )}
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}
