import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Plus, X, Trash2, Edit2, Eye, FileText, Mail, Award, Briefcase, AlertCircle } from 'lucide-react'

interface Template {
  id: number
  name: string
  type: string
  description: string | null
  content: string | null
  isActive: boolean
}

interface Props {
  templates: Template[]
}

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  offer_letter:        { label: 'Offer Letter',        icon: <FileText size={13} />, color: '#0D9488', bg: 'rgba(13,148,136,.12)' },
  appointment_letter:  { label: 'Appointment Letter',  icon: <Briefcase size={13} />, color: '#7C3AED', bg: 'rgba(124,58,237,.12)' },
  experience_letter:   { label: 'Experience Letter',   icon: <Award size={13} />,    color: '#D97706', bg: 'rgba(217,119,6,.12)' },
  relieving_letter:    { label: 'Relieving Letter',    icon: <FileText size={13} />, color: '#059669', bg: 'rgba(5,150,105,.12)' },
  warning_letter:      { label: 'Warning Letter',      icon: <AlertCircle size={13} />, color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
  appraisal_letter:    { label: 'Appraisal Letter',    icon: <Award size={13} />,    color: '#0284C7', bg: 'rgba(2,132,199,.12)' },
  email:               { label: 'Email Template',      icon: <Mail size={13} />,     color: '#7C3AED', bg: 'rgba(124,58,237,.12)' },
  other:               { label: 'Other',               icon: <FileText size={13} />, color: '#8b95a1', bg: 'rgba(107,114,128,.12)' },
}

const TYPE_OPTIONS = Object.entries(TYPE_META).map(([value, m]) => ({ value, label: m.label }))

const FILTER_TABS = [{ key: 'all', label: 'All' }, ...TYPE_OPTIONS.map((t) => ({ key: t.value, label: t.label }))]

interface FormState { name: string; type: string; description: string; content: string }
const EMPTY_FORM: FormState = { name: '', type: 'offer_letter', description: '', content: '' }

export default function HrmsTemplates({ templates }: Props) {
  const [filter, setFilter]       = useState('all')
  const [modal, setModal]         = useState<'add' | 'edit' | 'delete' | 'preview' | null>(null)
  const [editId, setEditId]       = useState<number | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [previewItem, setPreviewItem] = useState<Template | null>(null)
  const [form, setForm]           = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const visible = filter === 'all' ? templates : templates.filter((t) => t.type === filter)

  function openAdd() { setForm(EMPTY_FORM); setModal('add') }
  function openEdit(t: Template) { setEditId(t.id); setForm({ name: t.name, type: t.type, description: t.description ?? '', content: t.content ?? '' }); setModal('edit') }
  function openDelete(id: number) { setDeleteId(id); setModal('delete') }
  function openPreview(t: Template) { setPreviewItem(t); setModal('preview') }
  function closeModal() { setModal(null); setEditId(null); setDeleteId(null); setSaving(false) }

  function save() {
    setSaving(true)
    const payload = { name: form.name, type: form.type, description: form.description || undefined, content: form.content || undefined }
    if (modal === 'add') {
      router.post('/hrms/organization/settings/templates', payload, { onFinish: closeModal })
    } else {
      router.put(`/hrms/organization/settings/templates/${editId}`, payload, { onFinish: closeModal })
    }
  }

  function confirmDelete() {
    setSaving(true)
    router.delete(`/hrms/organization/settings/templates/${deleteId}`, { onFinish: closeModal })
  }

  const isOpen = modal === 'add' || modal === 'edit'

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">Letter & Email Templates</div>
          <div className="ph-sub">Manage reusable templates for HR letters and communications</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}><Plus size={14} /> Add Template</button>
        </div>
      </div>

      {/* Type filter tabs */}
      <div style={{ overflowX: 'auto', marginBottom: 18 }}>
        <div className="tab-row" style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
          {FILTER_TABS.slice(0, 5).map((t) => (
            <button key={t.key} className={`tab${filter === t.key ? ' on' : ''}`} onClick={() => setFilter(t.key)}>
              {t.label}
            </button>
          ))}
          <button className={`tab${!FILTER_TABS.slice(0, 5).some((t) => t.key === filter) && filter !== 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>More</button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <FileText size={36} style={{ color: 'var(--text4)', marginBottom: 12 }} />
          <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>No templates found</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text4)', marginBottom: 16 }}>Create letter and email templates for your HR processes.</div>
          <button className="btn btn-p btn-sm" onClick={openAdd}><Plus size={13} /> Add Template</button>
        </div>
      ) : (
        <div className="g3" style={{ alignItems: 'start' }}>
          {visible.map((t) => {
            const meta = TYPE_META[t.type] ?? TYPE_META.other
            return (
              <div key={t.id} className="card" style={{ cursor: 'default' }}>
                <div style={{ height: 3, background: meta.color, borderRadius: '14px 14px 0 0' }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text1)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '.62rem', fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: meta.bg, color: meta.color, marginTop: 3 }}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  {t.description && (
                    <p style={{ fontSize: '.72rem', color: 'var(--text3)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {t.description}
                    </p>
                  )}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-xs" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openPreview(t)}>
                      <Eye size={12} /> Preview
                    </button>
                    <button className="btn btn-ghost btn-xs" onClick={() => openEdit(t)}><Edit2 size={12} /></button>
                    <button className="btn btn-xs" style={{ background: 'var(--danger-lt)', color: 'var(--danger)', border: 'none' }} onClick={() => openDelete(t.id)}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <div className={`ov${isOpen ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal modal-lg">
          <div className="mh">
            <span className="mt">{modal === 'add' ? 'Add Template' : 'Edit Template'}</span>
            <button className="xbtn" onClick={closeModal}><X size={16} /></button>
          </div>
          <div className="mb" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="g2">
              <div className="fg">
                <label>Template Name <span className="req">*</span></label>
                <input className="fi" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Standard Offer Letter" />
              </div>
              <div className="fg">
                <label>Template Type <span className="req">*</span></label>
                <select className="fi fi-sel" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="fg">
              <label>Description</label>
              <textarea className="fi" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of when to use this template..." style={{ resize: 'vertical' }} />
            </div>
            <div className="fg">
              <label>Template Content</label>
              <span className="fg-hint">Use {`{employee_name}`}, {`{company_name}`}, {`{designation}`}, {`{date}`} as placeholders.</span>
              <textarea
                className="fi"
                rows={12}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your template content here..."
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '.8rem' }}
              />
            </div>
          </div>
          <div className="mf">
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-p" onClick={save} disabled={saving || !form.name.trim()}>
              {saving ? 'Saving…' : modal === 'add' ? 'Create Template' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <div className={`ov${modal === 'preview' ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal modal-lg">
          <div className="mh">
            <div>
              <span className="mt">{previewItem?.name}</span>
              {previewItem && (
                <span style={{ marginLeft: 10, fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: (TYPE_META[previewItem.type] ?? TYPE_META.other).bg, color: (TYPE_META[previewItem.type] ?? TYPE_META.other).color }}>
                  {(TYPE_META[previewItem.type] ?? TYPE_META.other).label}
                </span>
              )}
            </div>
            <button className="xbtn" onClick={closeModal}><X size={16} /></button>
          </div>
          <div className="mb">
            {previewItem?.description && (
              <p style={{ fontSize: '.76rem', color: 'var(--text3)', marginBottom: 16, fontStyle: 'italic' }}>{previewItem.description}</p>
            )}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', minHeight: 200, fontFamily: 'Georgia, serif', fontSize: '.85rem', lineHeight: 1.8, color: 'var(--text1)', whiteSpace: 'pre-wrap' }}>
              {previewItem?.content || <span style={{ color: 'var(--text4)', fontStyle: 'italic' }}>No content added yet.</span>}
            </div>
          </div>
          <div className="mf">
            <button className="btn btn-ghost" onClick={closeModal}>Close</button>
            <button className="btn btn-p" onClick={() => { closeModal(); previewItem && openEdit(previewItem) }}><Edit2 size={13} /> Edit Template</button>
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      <div className={`ov${modal === 'delete' ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal modal-sm">
          <div className="mh"><span className="mt">Delete Template</span><button className="xbtn" onClick={closeModal}><X size={16} /></button></div>
          <div className="mb"><div className="alert alert-danger"><Trash2 size={15} />This template will be permanently deleted and cannot be recovered.</div></div>
          <div className="mf">
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
