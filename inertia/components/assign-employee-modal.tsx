import { useState, useEffect, useRef } from 'react'
import { Search, X, Check, Users } from 'lucide-react'
import { Modal } from '~/components/modal'
import { SelectSearch } from '~/components/select-search'
import { Checkbox } from '~/components/checkbox'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lookup { id: number; name: string }

export interface AssignEmployee {
  id: number
  fullName: string
  employeeCode: string | null
  designationId: number | null
  departmentId: number | null
  locationId: number | null
  gradeId: number | null
  /** Pre-computed from whichever FK field is relevant (divisionId / departmentId / subDepartmentId …) */
  currentAssignmentId: number | null
}

interface Props {
  open: boolean
  onClose: () => void
  title: string
  /** ID of the entity currently being assigned to — used to detect "assigned elsewhere" */
  targetId: number | null
  employees: AssignEmployee[]
  /** Employee IDs that should be pre-selected when the modal opens */
  initialSelected: number[]
  onSave: (selectedIds: number[]) => void
  saving?: boolean
  /** Lookup list for the "↗ Name" badge shown on employees assigned to a different entity */
  entityList?: Lookup[]
  designations?: Lookup[]
  departments?: Lookup[]
  locations?: Lookup[]
  grades?: Lookup[]
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AssignEmployeeModal({
  open, onClose, title, targetId, employees, initialSelected,
  onSave, saving = false,
  entityList = [],
  designations = [], departments = [], locations = [], grades = [],
}: Props) {
  const [selected,    setSelected]    = useState<number[]>([])
  const [empSearch,   setEmpSearch]   = useState('')
  const [filterDesig, setFilterDesig] = useState('')
  const [filterDept,  setFilterDept]  = useState('')
  const [filterLoc,   setFilterLoc]   = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [visibleCount, setVisibleCount] = useState(20)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset state every time the modal opens
  useEffect(() => {
    if (open) {
      setSelected(initialSelected)
      setEmpSearch('')
      setFilterDesig('')
      setFilterDept('')
      setFilterLoc('')
      setFilterGrade('')
      setVisibleCount(20)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredEmps = employees.filter((e) => {
    const q = empSearch.toLowerCase()
    return (
      (!empSearch || e.fullName.toLowerCase().includes(q) || (e.employeeCode ?? '').toLowerCase().includes(q)) &&
      (!filterDesig || String(e.designationId) === filterDesig) &&
      (!filterDept  || String(e.departmentId)  === filterDept)  &&
      (!filterLoc   || String(e.locationId)    === filterLoc)   &&
      (!filterGrade || String(e.gradeId)       === filterGrade)
    )
  })

  const visibleEmps = filteredEmps.slice(0, visibleCount)

  function handleScroll() {
    const el = listRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      setVisibleCount((c) => Math.min(c + 20, filteredEmps.length))
    }
  }

  function reset(v: string, setter: (v: string) => void) {
    setter(v); setVisibleCount(20)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      icon={<Users size={15} />}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: '.76rem', color: 'var(--text3)' }}>
            {selected.length} employee{selected.length !== 1 ? 's' : ''} selected
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-p" onClick={() => onSave(selected)} disabled={saving}>
              {saving ? 'Saving…' : <><Check size={13} /> Save Assignment</>}
            </button>
          </div>
        </div>
      }
    >
      <div style={{ margin: '-24px' }}>

        {/* ── Bulk bar ── */}
        <div className={`bulk-bar${selected.length > 0 ? ' open' : ''}`}>
          <div style={{ background: 'linear-gradient(90deg, var(--p), var(--p-dk))', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.18)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}
              onClick={() => setSelected(filteredEmps.map((e) => e.id))}>
              Select All
            </button>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.2)' }}
              onClick={() => setSelected([])}>
              Deselect All
            </button>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 20, padding: '1px 8px', fontSize: '.76rem' }}>{selected.length}</span>
              selected
            </span>
          </div>
        </div>

        {/* ── Search + Filters ── */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="sb-inp" style={{ flex: 1, minWidth: 150 }}>
            <Search size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input value={empSearch} onChange={(e) => reset(e.target.value, setEmpSearch)} placeholder="Search employees…" />
            {empSearch && (
              <button type="button" onClick={() => reset('', setEmpSearch)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <X size={12} style={{ color: 'var(--text3)' }} />
              </button>
            )}
          </div>
          {designations.length > 0 && <div style={{ width: 148, flexShrink: 0 }}><SelectSearch value={filterDesig} onChange={(v) => reset(v, setFilterDesig)} options={[{ value: '', label: 'Designation' }, ...designations.map((d) => ({ value: String(d.id), label: d.name }))]} placeholder="Designation" /></div>}
          {departments.length > 0  && <div style={{ width: 148, flexShrink: 0 }}><SelectSearch value={filterDept}  onChange={(v) => reset(v, setFilterDept)}  options={[{ value: '', label: 'Department' },  ...departments.map((d) => ({ value: String(d.id), label: d.name }))]}  placeholder="Department"  /></div>}
          {locations.length > 0    && <div style={{ width: 148, flexShrink: 0 }}><SelectSearch value={filterLoc}   onChange={(v) => reset(v, setFilterLoc)}   options={[{ value: '', label: 'Location' },    ...locations.map((d) => ({ value: String(d.id), label: d.name }))]}    placeholder="Location"    /></div>}
          {grades.length > 0       && <div style={{ width: 148, flexShrink: 0 }}><SelectSearch value={filterGrade} onChange={(v) => reset(v, setFilterGrade)} options={[{ value: '', label: 'Grade' },       ...grades.map((d) => ({ value: String(d.id), label: d.name }))]}       placeholder="Grade"       /></div>}
        </div>

        {/* ── Employee list ── */}
        <div ref={listRef} onScroll={handleScroll} style={{ maxHeight: 380, overflowY: 'auto', padding: '0 16px' }}>
          {visibleEmps.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text3)', fontSize: '.82rem' }}>
              {empSearch || filterDesig || filterDept || filterLoc || filterGrade
                ? 'No employees match your filters.'
                : 'No active employees in this organisation.'}
            </div>
          ) : (
            <>
              {visibleEmps.map((e) => {
                const checked = selected.includes(e.id)
                const desig = designations.find((d) => d.id === e.designationId)
                const otherEntity = e.currentAssignmentId && targetId && e.currentAssignmentId !== targetId
                  ? entityList.find((d) => d.id === e.currentAssignmentId)
                  : null
                return (
                  <Checkbox
                    key={e.id}
                    checked={checked}
                    onChange={() => setSelected((prev) => checked ? prev.filter((x) => x !== e.id) : [...prev, e.id])}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '.72rem', fontWeight: 700, color: 'var(--p)' }}>
                        {e.fullName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.fullName}</div>
                        {desig && <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 1 }}>{desig.name}</div>}
                      </div>
                      {otherEntity && (
                        <span
                          title={`Currently in ${otherEntity.name} — selecting will move them here`}
                          style={{ fontSize: '.64rem', fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(217,119,6,.1)', color: 'var(--warn)', border: '1px solid rgba(217,119,6,.2)', flexShrink: 0, whiteSpace: 'nowrap', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          ↗ {otherEntity.name}
                        </span>
                      )}
                      {e.employeeCode && (
                        <code style={{ fontSize: '.68rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', color: 'var(--text3)', fontFamily: 'monospace', flexShrink: 0 }}>
                          {e.employeeCode}
                        </code>
                      )}
                    </div>
                  </Checkbox>
                )
              })}
              {visibleCount < filteredEmps.length && (
                <div style={{ padding: '10px 0', textAlign: 'center', fontSize: '.74rem', color: 'var(--text4)' }}>
                  Showing {visibleCount} of {filteredEmps.length} — scroll for more
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </Modal>
  )
}
