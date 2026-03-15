import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Blocks, Plus, Check, X, Trash2, Pencil, Search, RefreshCw, LayoutGrid, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import { DataTable } from '~/components/data-table'
import type { DTColumn, VisibilityState } from '~/components/data-table'
import { Modal } from '~/components/modal'
import { SelectSearch } from '~/components/select-search'
import { AssignEmployeeModal } from '~/components/assign-employee-modal'
import type { AssignEmployee } from '~/components/assign-employee-modal'

const COLS_KEY = 'hrms-sub-sections-cols-v1'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubSection {
  id: number
  code: string
  name: string
  sectionId: number | null
  isActive: boolean
  section?: { id: number; name: string; code: string } | null
}

interface Section { id: number; name: string; code: string }

interface Employee {
  id: number
  fullName: string
  employeeCode: string | null
  subSectionId: number | null
  designationId: number | null
  departmentId: number | null
  locationId: number | null
  gradeId: number | null
}

interface Lookup { id: number; name: string }

interface Props {
  subSections:  SubSection[]
  sections:     Section[]
  employees:    Employee[]
  designations: Lookup[]
  locations:    Lookup[]
  grades:       Lookup[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeNextCode(list: SubSection[]): string {
  if (!list.length) return 'SSEC0001'
  const max = list.reduce((m, s) => {
    const n = parseInt(s.code.replace('SSEC', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `SSEC${String(max + 1).padStart(4, '0')}`
}

// ── Columns ───────────────────────────────────────────────────────────────────

const buildColumns = (
  onEdit: (s: SubSection) => void,
  onDelete: (s: SubSection) => void,
  onAssign: (s: SubSection) => void,
  onToggle: (s: SubSection) => void,
  assignedCounts: Record<number, number>,
): DTColumn<SubSection>[] => [
  {
    key: 'code',
    label: 'Code',
    width: 120,
    render: (s) => (
      <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text3)', fontFamily: 'monospace' }}>
        {s.code}
      </code>
    ),
  },
  {
    key: 'name',
    label: 'Sub-Section',
    pinned: true,
    minWidth: 200,
    render: (s) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'var(--warn-lt)', border: '1px solid rgba(217,119,6,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Blocks size={14} style={{ color: 'var(--warn)' }} />
        </div>
        <span style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)' }}>{s.name}</span>
      </div>
    ),
  },
  {
    key: 'section',
    label: 'Parent Section',
    sortable: false,
    minWidth: 160,
    render: (s) => s.section?.name
      ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--sky-lt)', border: '1px solid rgba(3,105,161,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LayoutGrid size={10} style={{ color: 'var(--sky)' }} />
          </div>
          <span style={{ fontSize: '.8rem', color: 'var(--text2)', fontWeight: 500 }}>{s.section.name}</span>
        </div>
      )
      : <span style={{ color: 'var(--text4)', fontSize: '.8rem' }}>—</span>,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    width: 110,
    render: (s) => (
      <span className={`bdg ${s.isActive ? 'bdg-green' : 'bdg-gray'}`}>
        <span className="bdg-dot" />{s.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    pinned: true,
    width: 175,
    render: (s) => {
      const cnt = assignedCounts[s.id] ?? 0
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onAssign(s)} title="Assign Employees"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--s)', background: 'var(--s-lt)', border: '1px solid rgba(5,150,105,.2)', cursor: 'pointer' }}
          >
            <Users size={11} /> Assign
          </button>
          <button
            onClick={() => onEdit(s)} title="Edit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer' }}
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => onToggle(s)}
            title={s.isActive ? 'Deactivate' : 'Activate'}
            style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 6px', borderRadius: 7, color: s.isActive ? '#f59e0b' : 'var(--s)', background: s.isActive ? 'rgba(245,158,11,.07)' : 'var(--s-lt)', border: `1px solid ${s.isActive ? 'rgba(245,158,11,.3)' : 'rgba(5,150,105,.2)'}`, cursor: 'pointer' }}
          >
            {s.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
          </button>
          <button
            onClick={() => onDelete(s)}
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

export default function SubSectionsPage({ subSections, sections, employees, designations, locations, grades }: Props) {
  const [search,  setSearch]  = useState('')
  const [colVis,  setColVis]  = useState<VisibilityState>({})
  const [loading, setLoading] = useState(false)

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState<SubSection | null>(null)
  const [name,        setName]        = useState('')
  const [sectionId,   setSectionId]   = useState('')
  const [nameError,   setNameError]   = useState('')
  const [processing,  setProcessing]  = useState(false)

  const [deleteTarget,     setDeleteTarget]     = useState<SubSection | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [toggleTarget,     setToggleTarget]     = useState<SubSection | null>(null)
  const [toggleProcessing, setToggleProcessing] = useState(false)

  const [assignTarget,     setAssignTarget]     = useState<SubSection | null>(null)
  const [assignProcessing, setAssignProcessing] = useState(false)

  const filtered = search
    ? subSections.filter((s) => {
        const q = search.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          (s.section?.name ?? '').toLowerCase().includes(q)
        )
      })
    : subSections

  const assignedCounts = employees.reduce<Record<number, number>>((acc, e) => {
    if (e.subSectionId) acc[e.subSectionId] = (acc[e.subSectionId] ?? 0) + 1
    return acc
  }, {})

  function openAssign(s: SubSection) { setAssignTarget(s) }

  function handleAssignSubmit(ids: number[]) {
    if (!assignTarget) return
    setAssignProcessing(true)
    router.post(`/hrms/organization/settings/sub-sections/${assignTarget.id}/assign`, { employeeIds: ids }, {
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
    currentAssignmentId: e.subSectionId,
  }))

  const columns  = buildColumns(openEdit, (s) => setDeleteTarget(s), openAssign, (s) => setToggleTarget(s), assignedCounts)
  const nextCode = computeNextCode(subSections)

  function openAdd() {
    setEditTarget(null)
    setName('')
    setSectionId('')
    setNameError('')
    setModalOpen(true)
  }

  function openEdit(s: SubSection) {
    setEditTarget(s)
    setName(s.name)
    setSectionId(s.sectionId !== null ? String(s.sectionId) : '')
    setNameError('')
    setModalOpen(true)
  }

  function handleSubmit() {
    if (!name.trim()) { setNameError('Sub-section name is required'); return }
    setNameError('')
    setProcessing(true)
    const payload = {
      name:      name.trim(),
      sectionId: sectionId ? Number(sectionId) : null,
    }
    if (editTarget) {
      router.put(`/hrms/organization/settings/sub-sections/${editTarget.id}`, payload, {
        onSuccess: () => setModalOpen(false),
        onError:   () => setNameError('Failed to save. Please try again.'),
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/sub-sections', payload, {
        onSuccess: () => setModalOpen(false),
        onError:   () => setNameError('Failed to save. Please try again.'),
        onFinish:  () => setProcessing(false),
      })
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/sub-sections/${deleteTarget.id}`, {
      onSuccess: () => setDeleteTarget(null),
      onFinish:  () => setDeleteProcessing(false),
    })
  }

  function handleToggle() {
    if (!toggleTarget) return
    setToggleProcessing(true)
    router.patch(`/hrms/organization/settings/sub-sections/${toggleTarget.id}/toggle`, {}, {
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
          <div className="ph-title">Sub-Sections</div>
          <div className="ph-sub">Manage sub-sections nested within sections for detailed team structure</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}><Plus size={14} /> Add Sub-Section</button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 300 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sub-sections…" />
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
            {filtered.length} sub-section{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <DataTable<SubSection>
          data={filtered}
          columns={columns}
          rowKey={(r) => r.id}
          clientPageSize={25}
          storageKey={COLS_KEY}
          noun="sub-section"
          columnVisibility={colVis}
          onColumnVisibilityChange={setColVis}
          hideToolbar
          emptyIcon={<Blocks size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
          emptyTitle={search ? 'No sub-sections match your search' : 'No sub-sections yet'}
          emptyDesc={search ? 'Try a different keyword.' : 'Add sub-sections to group teams within sections.'}
          emptyAction={!search && (
            <button className="btn btn-p btn-sm" onClick={openAdd} style={{ display: 'inline-flex' }}>
              <Plus size={13} /> Add Sub-Section
            </button>
          )}
        />
      </div>

      {/* ════ ADD / EDIT MODAL ════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Sub-Section' : 'Add Sub-Section'}
        size="sm"
        icon={<Blocks size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
              {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create Sub-Section</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Sub-Section Code</label>
            <input className="fi" value={editTarget ? editTarget.code : nextCode} readOnly style={{ background: 'var(--bg2)', color: 'var(--text3)', cursor: 'default', fontFamily: 'monospace', fontWeight: 600 }} />
          </div>
          <div className="fg">
            <label>Sub-Section Name <span className="req">*</span></label>
            <input className="fi" value={name} onChange={(e) => { setName(e.target.value); setNameError('') }} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }} placeholder="e.g. Vendor Payments" autoFocus />
            {nameError && <div className="fg-err">{nameError}</div>}
          </div>
          <div className="fg">
            <label>Parent Section</label>
            <SelectSearch
              value={sectionId}
              onChange={setSectionId}
              options={[
                { value: '', label: '— None —' },
                ...sections.map((s) => ({ value: String(s.id), label: `${s.name} (${s.code})` })),
              ]}
              placeholder="Select section…"
            />
            <div className="fg-hint">Optionally link this sub-section to a parent section.</div>
          </div>
        </div>
      </Modal>

      {/* ════ DELETE MODAL ════ */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Sub-Section"
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
        title={toggleTarget?.isActive ? 'Deactivate Sub-Section' : 'Activate Sub-Section'}
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
              ? <>Are you sure you want to deactivate <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.name}</strong>? Employees cannot be assigned to inactive sub-sections.</>
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
        initialSelected={assignTarget ? employees.filter((e) => e.subSectionId === assignTarget.id).map((e) => e.id) : []}
        onSave={handleAssignSubmit}
        saving={assignProcessing}
        designations={designations}
        departments={[]}
        locations={locations}
        grades={grades}
        entityList={subSections.map((s) => ({ id: s.id, name: s.name }))}
      />
    </>
  )
}
