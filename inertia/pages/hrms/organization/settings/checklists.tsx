import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Plus, X, Trash2, Edit2, ClipboardList, UserCheck, UserX, List, Check } from 'lucide-react'

interface Checklist {
  id: number
  name: string
  type: 'onboarding' | 'offboarding' | 'general'
  description: string | null
  items: string[]
  isActive: boolean
}

interface Props {
  checklists: Checklist[]
}

const TYPE_META = {
  onboarding:  { label: 'Onboarding',  icon: <UserCheck size={14} />, color: '#0D9488', bg: 'rgba(13,148,136,.12)' },
  offboarding: { label: 'Offboarding', icon: <UserX size={14} />,    color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
  general:     { label: 'General',     icon: <List size={14} />,     color: '#7C3AED', bg: 'rgba(124,58,237,.12)' },
}

type TypeKey = keyof typeof TYPE_META

const TABS: { key: 'all' | TypeKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'offboarding', label: 'Offboarding' },
  { key: 'general', label: 'General' },
]

interface FormState {
  name: string
  type: TypeKey
  description: string
  items: string[]
}

const EMPTY_FORM: FormState = { name: '', type: 'general', description: '', items: [] }

export default function HrmsChecklists({ checklists }: Props) {
  const [tab, setTab]         = useState<'all' | TypeKey>('all')
  const [modal, setModal]     = useState<'add' | 'edit' | 'delete' | null>(null)
  const [editId, setEditId]   = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm]       = useState<FormState>(EMPTY_FORM)
  const [newItem, setNewItem] = useState('')
  const [saving, setSaving]   = useState(false)

  const visible = tab === 'all' ? checklists : checklists.filter((c) => c.type === tab)

  function openAdd() {
    setForm(EMPTY_FORM)
    setNewItem('')
    setModal('add')
  }

  function openEdit(c: Checklist) {
    setEditId(c.id)
    setForm({ name: c.name, type: c.type, description: c.description ?? '', items: [...c.items] })
    setNewItem('')
    setModal('edit')
  }

  function openDelete(id: number) {
    setDeleteId(id)
    setModal('delete')
  }

  function closeModal() {
    setModal(null)
    setEditId(null)
    setDeleteId(null)
    setSaving(false)
  }

  function addItem() {
    if (!newItem.trim()) return
    setForm((f) => ({ ...f, items: [...f.items, newItem.trim()] }))
    setNewItem('')
  }

  function removeItem(idx: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  function save() {
    setSaving(true)
    const payload = { name: form.name, type: form.type, description: form.description || undefined, items: form.items }
    if (modal === 'add') {
      router.post('/hrms/organization/settings/checklists', payload, {
        onFinish: closeModal,
      })
    } else {
      router.put(`/hrms/organization/settings/checklists/${editId}`, payload, {
        onFinish: closeModal,
      })
    }
  }

  function confirmDelete() {
    setSaving(true)
    router.delete(`/hrms/organization/settings/checklists/${deleteId}`, { onFinish: closeModal })
  }

  const isOpen = modal === 'add' || modal === 'edit'

  return (
    <div>
      {/* Header */}
      <div className="ph">
        <div>
          <div className="ph-title">Checklists</div>
          <div className="ph-sub">Manage onboarding, offboarding, and general checklists</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}><Plus size={14} /> Add Checklist</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-row" style={{ marginBottom: 18, display: 'inline-flex' }}>
        {TABS.map((t) => (
          <button key={t.key} className={`tab${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
            <span style={{ marginLeft: 6, fontSize: '.6rem', background: 'var(--bg2)', borderRadius: 20, padding: '1px 6px', color: 'var(--text3)', fontWeight: 700 }}>
              {t.key === 'all' ? checklists.length : checklists.filter((c) => c.type === t.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <ClipboardList size={36} style={{ color: 'var(--text4)', marginBottom: 12 }} />
          <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>No checklists found</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text4)', marginBottom: 16 }}>Create a checklist to standardize your HR processes.</div>
          <button className="btn btn-p btn-sm" onClick={openAdd}><Plus size={13} /> Add Checklist</button>
        </div>
      ) : (
        <div className="g3" style={{ alignItems: 'start' }}>
          {visible.map((c) => {
            const meta = TYPE_META[c.type]
            return (
              <div key={c.id} className="card" style={{ position: 'relative', overflow: 'visible' }}>
                <div style={{ height: 3, background: meta.color, borderRadius: '14px 14px 0 0' }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {meta.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text1)', lineHeight: 1.3 }}>{c.name}</div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '.63rem', fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: meta.bg, color: meta.color }}>
                          {meta.icon} {meta.label}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="xbtn" onClick={() => openEdit(c)} title="Edit"><Edit2 size={13} /></button>
                      <button className="xbtn" onClick={() => openDelete(c.id)} title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                    </div>
                  </div>

                  {c.description && (
                    <p style={{ fontSize: '.73rem', color: 'var(--text3)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.description}
                    </p>
                  )}

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                    <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                      {c.items.length} item{c.items.length !== 1 ? 's' : ''}
                    </div>
                    {c.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.73rem', color: 'var(--text2)', marginBottom: 3 }}>
                        <Check size={10} style={{ color: meta.color, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</span>
                      </div>
                    ))}
                    {c.items.length > 3 && (
                      <div style={{ fontSize: '.68rem', color: 'var(--text4)', marginTop: 4 }}>+{c.items.length - 3} more items</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <div className={`ov${isOpen ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal modal-lg" style={{ maxWidth: 580 }}>
          <div className="mh">
            <span className="mt">{modal === 'add' ? 'Add Checklist' : 'Edit Checklist'}</span>
            <button className="xbtn" onClick={closeModal}><X size={16} /></button>
          </div>
          <div className="mb" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="fg">
              <label>Checklist Name <span className="req">*</span></label>
              <input className="fi" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. New Hire Onboarding Checklist" />
            </div>

            <div className="fg">
              <label>Type <span className="req">*</span></label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(Object.keys(TYPE_META) as TypeKey[]).map((key) => {
                  const meta = TYPE_META[key]
                  const sel = form.type === key
                  return (
                    <div
                      key={key}
                      onClick={() => setForm((f) => ({ ...f, type: key }))}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${sel ? meta.color : 'var(--border)'}`, background: sel ? meta.bg : 'var(--surface)', cursor: 'pointer', transition: 'all .15s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, color: sel ? meta.color : 'var(--text3)' }}>
                        {meta.icon}
                        <span style={{ fontSize: '.78rem', fontWeight: 700 }}>{meta.label}</span>
                      </div>
                      <div style={{ fontSize: '.65rem', color: sel ? meta.color : 'var(--text4)' }}>
                        {key === 'onboarding' ? 'New employee join process' : key === 'offboarding' ? 'Employee exit process' : 'General purpose checklist'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="fg">
              <label>Description</label>
              <textarea className="fi" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of this checklist..." style={{ resize: 'vertical' }} />
            </div>

            <div className="fg">
              <label>Checklist Items</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="fi"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
                  placeholder="Type an item and press Enter or click Add"
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-outline-p btn-sm" onClick={addItem}><Plus size={13} /> Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {form.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                    <Check size={12} style={{ color: 'var(--p)', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '.78rem', color: 'var(--text1)' }}>{item}</span>
                    <button type="button" className="xbtn" onClick={() => removeItem(idx)} style={{ width: 22, height: 22, flexShrink: 0 }}><X size={11} /></button>
                  </div>
                ))}
                {form.items.length === 0 && <div style={{ fontSize: '.72rem', color: 'var(--text4)', padding: '8px 0' }}>No items added yet. Add items above.</div>}
              </div>
            </div>
          </div>
          <div className="mf">
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-p" onClick={save} disabled={saving || !form.name.trim()}>
              {saving ? 'Saving…' : modal === 'add' ? 'Create Checklist' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      <div className={`ov${modal === 'delete' ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal modal-sm">
          <div className="mh"><span className="mt">Delete Checklist</span><button className="xbtn" onClick={closeModal}><X size={16} /></button></div>
          <div className="mb">
            <div className="alert alert-danger"><Trash2 size={15} />This will permanently delete the checklist and all its items. This cannot be undone.</div>
          </div>
          <div className="mf">
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
