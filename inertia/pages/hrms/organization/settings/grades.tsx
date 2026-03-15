import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Award, Plus, Check, X, Trash2, Pencil, Search, RefreshCw, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import { DataTable } from '~/components/data-table'
import type { DTColumn, VisibilityState } from '~/components/data-table'
import { Modal } from '~/components/modal'
import { AssignEmployeeModal } from '~/components/assign-employee-modal'
import type { AssignEmployee } from '~/components/assign-employee-modal'

const COLS_KEY = 'hrms-grades-cols-v1'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Grade {
  id: number
  code: string
  name: string
  isActive: boolean
}

interface Employee {
  id: number
  fullName: string
  employeeCode: string | null
  gradeId: number | null
  designationId: number | null
  departmentId: number | null
  locationId: number | null
}

interface Lookup { id: number; name: string }

interface Props {
  grades:       Grade[]
  employees:    Employee[]
  designations: Lookup[]
  departments:  Lookup[]
  locations:    Lookup[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeNextCode(list: Grade[]): string {
  if (!list.length) return 'GRA0001'
  const max = list.reduce((m, g) => {
    const n = parseInt(g.code.replace('GRA', ''), 10)
    return isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `GRA${String(max + 1).padStart(4, '0')}`
}

const GRADE_COLORS = [
  { bg: 'var(--p-lt)',      border: 'var(--p-mid)',             color: 'var(--p)'      },
  { bg: 'var(--s-lt)',      border: 'rgba(5,150,105,.18)',      color: 'var(--s)'      },
  { bg: 'var(--warn-lt)',   border: 'rgba(217,119,6,.18)',      color: 'var(--warn)'   },
  { bg: 'var(--purple-lt)', border: 'rgba(124,58,237,.18)',     color: 'var(--purple)' },
  { bg: 'var(--sky-lt)',    border: 'rgba(3,105,161,.18)',      color: 'var(--sky)'    },
  { bg: 'var(--rose-lt)',   border: 'rgba(225,29,72,.18)',      color: 'var(--rose)'   },
]

// ── Columns ───────────────────────────────────────────────────────────────────

const buildColumns = (
  onEdit: (g: Grade) => void,
  onDelete: (g: Grade) => void,
  onAssign: (g: Grade) => void,
  onToggle: (g: Grade) => void,
  assignedCounts: Record<number, number>,
  grades: Grade[],
): DTColumn<Grade>[] => [
  {
    key: 'code',
    label: 'Code',
    width: 110,
    render: (g) => (
      <code style={{ fontSize: '.72rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text3)', fontFamily: 'monospace' }}>
        {g.code}
      </code>
    ),
  },
  {
    key: 'name',
    label: 'Grade',
    pinned: true,
    minWidth: 200,
    render: (g) => {
      const idx = grades.findIndex((x) => x.id === g.id)
      const clr = GRADE_COLORS[(idx < 0 ? 0 : idx) % GRADE_COLORS.length]
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: clr.bg, border: `1px solid ${clr.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={14} style={{ color: clr.color }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)' }}>{g.name}</span>
        </div>
      )
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    width: 110,
    render: (g) => (
      <span className={`bdg ${g.isActive ? 'bdg-green' : 'bdg-gray'}`}>
        <span className="bdg-dot" />{g.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    pinned: true,
    width: 175,
    render: (g) => {
      const cnt = assignedCounts[g.id] ?? 0
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onAssign(g)} title="Assign Employees"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--s)', background: 'var(--s-lt)', border: '1px solid rgba(5,150,105,.2)', cursor: 'pointer' }}
          >
            <Users size={11} /> Assign
          </button>
          <button
            onClick={() => onEdit(g)} title="Edit"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600, color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer' }}
          >
            <Pencil size={11} /> Edit
          </button>
          <button
            onClick={() => onToggle(g)}
            title={g.isActive ? 'Deactivate' : 'Activate'}
            style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 6px', borderRadius: 7, color: g.isActive ? '#f59e0b' : 'var(--s)', background: g.isActive ? 'rgba(245,158,11,.07)' : 'var(--s-lt)', border: `1px solid ${g.isActive ? 'rgba(245,158,11,.3)' : 'rgba(5,150,105,.2)'}`, cursor: 'pointer' }}
          >
            {g.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
          </button>
          <button
            onClick={() => onDelete(g)}
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

export default function GradesPage({ grades, employees, designations, departments, locations }: Props) {
  const [search,  setSearch]  = useState('')
  const [colVis,  setColVis]  = useState<VisibilityState>({})
  const [loading, setLoading] = useState(false)

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState<Grade | null>(null)
  const [name,        setName]        = useState('')
  const [nameError,   setNameError]   = useState('')
  const [processing,  setProcessing]  = useState(false)

  const [deleteTarget,     setDeleteTarget]     = useState<Grade | null>(null)
  const [deleteProcessing, setDeleteProcessing] = useState(false)

  const [toggleTarget,     setToggleTarget]     = useState<Grade | null>(null)
  const [toggleProcessing, setToggleProcessing] = useState(false)

  const [assignTarget,     setAssignTarget]     = useState<Grade | null>(null)
  const [assignProcessing, setAssignProcessing] = useState(false)

  const filtered = search
    ? grades.filter((g) => {
        const q = search.toLowerCase()
        return g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q)
      })
    : grades

  const assignedCounts = employees.reduce<Record<number, number>>((acc, e) => {
    if (e.gradeId) acc[e.gradeId] = (acc[e.gradeId] ?? 0) + 1
    return acc
  }, {})

  function openAssign(g: Grade) { setAssignTarget(g) }

  function handleAssignSubmit(ids: number[]) {
    if (!assignTarget) return
    setAssignProcessing(true)
    router.post(`/hrms/organization/settings/grades/${assignTarget.id}/assign`, { employeeIds: ids }, {
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
    currentAssignmentId: e.gradeId,
  }))

  const columns  = buildColumns(openEdit, (g) => setDeleteTarget(g), openAssign, (g) => setToggleTarget(g), assignedCounts, grades)
  const nextCode = computeNextCode(grades)

  function openAdd() {
    setEditTarget(null)
    setName('')
    setNameError('')
    setModalOpen(true)
  }

  function openEdit(g: Grade) {
    setEditTarget(g)
    setName(g.name)
    setNameError('')
    setModalOpen(true)
  }

  function handleSubmit() {
    if (!name.trim()) { setNameError('Grade name is required'); return }
    setNameError('')
    setProcessing(true)
    if (editTarget) {
      router.put(`/hrms/organization/settings/grades/${editTarget.id}`, { name: name.trim() }, {
        onSuccess: () => setModalOpen(false),
        onError:   () => setNameError('Failed to save. Please try again.'),
        onFinish:  () => setProcessing(false),
      })
    } else {
      router.post('/hrms/organization/settings/grades', { name: name.trim() }, {
        onSuccess: () => setModalOpen(false),
        onError:   () => setNameError('Failed to save. Please try again.'),
        onFinish:  () => setProcessing(false),
      })
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleteProcessing(true)
    router.delete(`/hrms/organization/settings/grades/${deleteTarget.id}`, {
      onSuccess: () => setDeleteTarget(null),
      onFinish:  () => setDeleteProcessing(false),
    })
  }

  function handleToggle() {
    if (!toggleTarget) return
    setToggleProcessing(true)
    router.patch(`/hrms/organization/settings/grades/${toggleTarget.id}/toggle`, {}, {
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
          <div className="ph-title">Grades</div>
          <div className="ph-sub">Manage employee grade levels and pay scales for your organisation</div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}><Plus size={14} /> Add Grade</button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 180, maxWidth: 300 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search grades…" />
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
            {filtered.length} grade{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <DataTable<Grade>
          data={filtered}
          columns={columns}
          rowKey={(r) => r.id}
          clientPageSize={25}
          storageKey={COLS_KEY}
          noun="grade"
          columnVisibility={colVis}
          onColumnVisibilityChange={setColVis}
          hideToolbar
          emptyIcon={<Award size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
          emptyTitle={search ? 'No grades match your search' : 'No grades yet'}
          emptyDesc={search ? 'Try a different keyword.' : 'Add your first grade to get started.'}
          emptyAction={!search && (
            <button className="btn btn-p btn-sm" onClick={openAdd} style={{ display: 'inline-flex' }}>
              <Plus size={13} /> Add Grade
            </button>
          )}
        />
      </div>

      {/* ════ ADD / EDIT MODAL ════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Grade' : 'Add Grade'}
        size="sm"
        icon={<Award size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
              {processing ? 'Saving…' : editTarget ? <><Check size={13} /> Save Changes</> : <><Plus size={13} /> Create Grade</>}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Grade Code</label>
            <input className="fi" value={editTarget ? editTarget.code : nextCode} readOnly style={{ background: 'var(--bg2)', color: 'var(--text3)', cursor: 'default', fontFamily: 'monospace', fontWeight: 600 }} />
          </div>
          <div className="fg">
            <label>Grade Name <span className="req">*</span></label>
            <input className="fi" value={name} onChange={(e) => { setName(e.target.value); setNameError('') }} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }} placeholder="e.g. Grade A – Senior Level" autoFocus />
            {nameError && <div className="fg-err">{nameError}</div>}
          </div>
        </div>
      </Modal>

      {/* ════ DELETE MODAL ════ */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Grade"
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
        title={toggleTarget?.isActive ? 'Deactivate Grade' : 'Activate Grade'}
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
              ? <>Are you sure you want to deactivate <strong style={{ color: 'var(--text1)' }}>{toggleTarget?.name}</strong>? Employees cannot be assigned to inactive grades.</>
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
        initialSelected={assignTarget ? employees.filter((e) => e.gradeId === assignTarget.id).map((e) => e.id) : []}
        onSave={handleAssignSubmit}
        saving={assignProcessing}
        designations={designations}
        departments={departments}
        locations={locations}
        entityList={grades.map((g) => ({ id: g.id, name: g.name }))}
      />
    </>
  )
}
