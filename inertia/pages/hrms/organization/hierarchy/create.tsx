import { useState, useMemo } from 'react'
import { useForm, Link } from '@inertiajs/react'
import {
  Building2, Layers, Users, Check, ChevronRight,
  ArrowLeft, Network, Save, User, Hash,
} from 'lucide-react'
import { SelectSearch } from '~/components/select-search'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Division    { id: number; code: string; name: string }
interface Department  { id: number; code: string; name: string }
interface Employee    { id: number; fullName: string; employeeCode: string | null; divisionId: number | null }

interface HierarchyNode {
  id: number; title: string; department?: string | null
  parentId?: number | null; sortOrder?: number
}

interface Props {
  divisions:   Division[]
  departments: Department[]
  nodes:       HierarchyNode[]
  employees:   Employee[]
}

interface FormData {
  title: string; department: string; parentId: string; employeeId: string; sortOrder: string; divisionId: string
}

// ── Step metadata ─────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Select Division',    desc: 'Choose the business unit' },
  { num: 2, label: 'Select Department',  desc: 'Choose the functional area' },
  { num: 3, label: 'Node Details',       desc: 'Configure the hierarchy node' },
]

// ── Color palette ─────────────────────────────────────────────────────────────

const COLORS = ['#0D9488','#7C3AED','#0284C7','#D97706','#E11D48','#059669','#2563EB','#9333EA']
function pickColor(s: string): string {
  let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ step, maxStep, onJump }: { step: number; maxStep: number; onJump: (n: number) => void }) {
  return (
    <div className="stepper-wrap">
      <div className="stepper">
        {STEPS.map((s) => {
          const state     = step > s.num ? 'done' : step === s.num ? 'active' : ''
          const clickable = s.num !== step && s.num <= maxStep
          return (
            <div key={s.num} className={`step-item ${state}`}
              onClick={() => clickable && onJump(s.num)}
              style={{ cursor: clickable ? 'pointer' : 'default' }}>
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

// ── Selection Card ────────────────────────────────────────────────────────────

function SelectCard({
  selected, onClick, icon, title, subtitle, color,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle?: string
  color: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', borderRadius: 13, textAlign: 'left',
        border: `1.5px solid ${selected ? color : 'var(--border)'}`,
        background: selected
          ? `linear-gradient(135deg, ${color}10, ${color}06)`
          : 'var(--surface)',
        boxShadow: selected
          ? `0 0 0 3px ${color}20, 0 2px 12px ${color}14`
          : '0 1px 4px rgba(0,0,0,.05)',
        cursor: 'pointer', transition: 'border-color .15s, box-shadow .15s',
        width: '100%', position: 'relative',
      }}
    >
      {/* Selected check */}
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 20, height: 20, borderRadius: '50%',
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={11} color="#fff" strokeWidth={3} />
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 11, flexShrink: 0,
        background: selected ? color + '20' : 'var(--bg2)',
        border: `1.5px solid ${selected ? color + '35' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: selected ? color : 'var(--text4)',
        transition: 'background .15s, border-color .15s, color .15s',
      }}>
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: '.88rem',
          color: selected ? color : 'var(--text1)',
          lineHeight: 1.3, marginBottom: 2,
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '.72rem', color: 'var(--text4)', fontWeight: 500 }}>
            {subtitle}
          </div>
        )}
      </div>
    </button>
  )
}

// ── Step 3: Node details form ─────────────────────────────────────────────────

function NodeDetailsForm({
  data, setData, errors,
  nodes, employees, filteredEmployees,
}: {
  data: FormData
  setData: (k: keyof FormData, v: string) => void
  errors: Partial<Record<keyof FormData, string>>
  nodes: HierarchyNode[]
  employees: Employee[]
  filteredEmployees: Employee[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div className="fg">
        <label className="flbl">
          <Hash size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle', color:'var(--p)' }} />
          Node Title <span className="req">*</span>
        </label>
        <input
          className="fi"
          type="text"
          value={data.title}
          onChange={(e) => setData('title', e.target.value)}
          placeholder="e.g. Head of Engineering, HR Manager"
          autoFocus
        />
        {errors.title && <span className="fg-err">{errors.title}</span>}
        <span className="fg-hint">The role or position name for this hierarchy node</span>
      </div>

      {/* Department (pre-filled, still editable) */}
      <div className="fg">
        <label className="flbl">
          <Layers size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle', color:'var(--p)' }} />
          Department / Unit
        </label>
        <input
          className="fi"
          type="text"
          value={data.department}
          onChange={(e) => setData('department', e.target.value)}
          placeholder="Pre-filled from your department selection"
        />
        {errors.department && <span className="fg-err">{errors.department}</span>}
        <span className="fg-hint">Editable — pre-filled from your Step 2 selection</span>
      </div>

      {/* Parent + Sort */}
      <div className="g2">
        <div className="fg">
          <label className="flbl">
            <Network size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle', color:'var(--p)' }} />
            Reports To (Parent)
          </label>
          <SelectSearch
            value={data.parentId}
            onChange={(v) => setData('parentId', v)}
            placeholder="Root level (top of chart)"
            options={nodes.map((n) => ({
              value: String(n.id),
              label: n.title,
              sub: n.department ?? undefined,
            }))}
          />
          {errors.parentId && <span className="fg-err">{errors.parentId}</span>}
          <span className="fg-hint">Leave blank to make this a root node</span>
        </div>
        <div className="fg">
          <label className="flbl">Sort Order</label>
          <input
            className="fi"
            type="number"
            min={0}
            value={data.sortOrder}
            onChange={(e) => setData('sortOrder', e.target.value)}
            placeholder="0"
          />
          {errors.sortOrder && <span className="fg-err">{errors.sortOrder}</span>}
          <span className="fg-hint">Lower numbers appear first</span>
        </div>
      </div>

      {/* Employee */}
      <div className="fg">
        <label className="flbl">
          <User size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle', color:'var(--p)' }} />
          Assign Employee (Head of this node)
        </label>
        <SelectSearch
          value={data.employeeId}
          onChange={(v) => setData('employeeId', v)}
          placeholder="Not assigned"
          options={[
            ...filteredEmployees.map((e) => ({
              value: String(e.id),
              label: e.fullName,
              sub: e.employeeCode ? `${e.employeeCode} · this division` : 'this division',
            })),
            ...employees
              .filter((e) => !filteredEmployees.find((fe) => fe.id === e.id))
              .map((e) => ({
                value: String(e.id),
                label: e.fullName,
                sub: e.employeeCode ?? undefined,
              })),
          ]}
        />
        {errors.employeeId && <span className="fg-err">{errors.employeeId}</span>}
        <span className="fg-hint">Optional — employees from your selected division are listed first</span>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HierarchyCreatePage({ divisions, departments, nodes, employees }: Props) {
  const [step,            setStep]            = useState(1)
  const [maxStep,         setMaxStep]         = useState(1)
  const [selectedDiv,     setSelectedDiv]     = useState<Division | null>(null)
  const [selectedDept,    setSelectedDept]    = useState<Department | null>(null)

  const { data, setData, post, processing, errors } = useForm<FormData>({
    title: '', department: '', parentId: '', employeeId: '', sortOrder: '0', divisionId: '',
  })

  // Employees filtered by selected division
  const filteredEmployees = useMemo(
    () => selectedDiv ? employees.filter((e) => e.divisionId === selectedDiv.id) : [],
    [selectedDiv, employees]
  )

  function goToStep(n: number) {
    setStep(n)
    if (n > maxStep) setMaxStep(n)
  }

  function handleDivisionSelect(div: Division) {
    setSelectedDiv(div)
  }

  function handleDivisionNext() {
    if (!selectedDiv) return
    setData('divisionId', String(selectedDiv.id))
    goToStep(2)
  }

  function handleDepartmentSelect(dept: Department) {
    setSelectedDept(dept)
  }

  function handleDepartmentNext() {
    if (!selectedDept) return
    // Pre-fill department field
    setData('department', selectedDept.name)
    goToStep(3)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/hrms/organization/hierarchy')
  }

  return (
    <>
      {/* Page Header */}
      <div className="ph">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/hrms/organization/hierarchy"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer', flexShrink: 0 }}
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="ph-title">Add Hierarchy Node</div>
            <div className="ph-sub" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>Organization Hierarchy</span>
              <ChevronRight size={11} style={{ color: 'var(--text4)' }} />
              <span>Create Node</span>
              {selectedDiv && (
                <>
                  <ChevronRight size={11} style={{ color: 'var(--text4)' }} />
                  <span style={{ color: 'var(--p)', fontWeight: 600 }}>{selectedDiv.name}</span>
                </>
              )}
              {selectedDept && (
                <>
                  <ChevronRight size={11} style={{ color: 'var(--text4)' }} />
                  <span style={{ color: 'var(--p)', fontWeight: 600 }}>{selectedDept.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <Stepper step={step} maxStep={maxStep} onJump={goToStep} />

      {/* ── Step 1: Select Division ── */}
      {step === 1 && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-h">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)' }}>
                  <Building2 size={13} />
                </div>
                Select Division
              </div>
              <div className="card-sub">Choose the business unit this hierarchy node belongs to</div>
            </div>
            {selectedDiv && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 9, background: 'var(--p-lt)', border: '1px solid var(--p-mid)' }}>
                <Check size={12} style={{ color: 'var(--p)' }} />
                <span style={{ fontSize: '.78rem', color: 'var(--p)', fontWeight: 700 }}>{selectedDiv.name}</span>
              </div>
            )}
          </div>
          <div className="card-b">
            {divisions.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Building2 size={28} style={{ color: 'var(--text4)', marginBottom: 10 }} />
                <div style={{ fontSize: '.85rem', color: 'var(--text3)', marginBottom: 12 }}>No active divisions found</div>
                <Link href="/hrms/organization/settings/divisions" className="btn btn-outline-p btn-sm">
                  Create a Division
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                {divisions.map((div) => {
                  const color = pickColor(div.name)
                  return (
                    <SelectCard
                      key={div.id}
                      selected={selectedDiv?.id === div.id}
                      onClick={() => handleDivisionSelect(div)}
                      icon={<Building2 size={17} />}
                      title={div.name}
                      subtitle={div.code}
                      color={color}
                    />
                  )
                })}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-p"
                onClick={handleDivisionNext}
                disabled={!selectedDiv}
              >
                Next: Select Department
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Select Department ── */}
      {step === 2 && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-h">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)' }}>
                  <Layers size={13} />
                </div>
                Select Department
              </div>
              <div className="card-sub">
                Choose the functional area within <strong>{selectedDiv?.name}</strong>
              </div>
            </div>
            {selectedDept && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 9, background: 'var(--p-lt)', border: '1px solid var(--p-mid)' }}>
                <Check size={12} style={{ color: 'var(--p)' }} />
                <span style={{ fontSize: '.78rem', color: 'var(--p)', fontWeight: 700 }}>{selectedDept.name}</span>
              </div>
            )}
          </div>
          <div className="card-b">
            {departments.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Layers size={28} style={{ color: 'var(--text4)', marginBottom: 10 }} />
                <div style={{ fontSize: '.85rem', color: 'var(--text3)', marginBottom: 12 }}>No active departments found</div>
                <Link href="/hrms/organization/settings/departments" className="btn btn-outline-p btn-sm">
                  Create a Department
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {departments.map((dept) => {
                  const color = pickColor(dept.name)
                  return (
                    <SelectCard
                      key={dept.id}
                      selected={selectedDept?.id === dept.id}
                      onClick={() => handleDepartmentSelect(dept)}
                      icon={<Layers size={17} />}
                      title={dept.name}
                      subtitle={dept.code}
                      color={color}
                    />
                  )
                })}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-ghost" onClick={() => goToStep(1)}>
                <ArrowLeft size={14} /> Back
              </button>
              <button type="button" className="btn btn-p" onClick={handleDepartmentNext} disabled={!selectedDept}>
                Next: Node Details <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Node Details ── */}
      {step === 3 && (
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
          {/* Form card */}
          <div className="card">
            <div className="card-h">
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)' }}>
                    <Network size={13} />
                  </div>
                  Configure Node
                </div>
                <div className="card-sub">Fill in the details for this hierarchy node</div>
              </div>
            </div>
            <div className="card-b">
              <form id="create-node-form" onSubmit={handleSubmit}>
                <NodeDetailsForm
                  data={data}
                  setData={setData}
                  errors={errors}
                  nodes={nodes}
                  employees={employees}
                  filteredEmployees={filteredEmployees}
                />
              </form>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => goToStep(2)}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button type="submit" form="create-node-form" className="btn btn-p" disabled={processing}>
                  <Save size={14} />
                  {processing ? 'Creating…' : 'Create Hierarchy Node'}
                </button>
              </div>
            </div>
          </div>

          {/* Context summary sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Selection summary */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Your Selections</div>
              </div>
              <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Division */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)', flexShrink: 0 }}>
                    <Building2 size={13} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.68rem', color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 1 }}>Division</div>
                    <div style={{ fontWeight: 700, fontSize: '.83rem', color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedDiv?.name}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text4)' }}>{selectedDiv?.code}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--border)' }} />
                {/* Department */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)', flexShrink: 0 }}>
                    <Layers size={13} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.68rem', color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 1 }}>Department</div>
                    <div style={{ fontWeight: 700, fontSize: '.83rem', color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedDept?.name}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text4)' }}>{selectedDept?.code}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--border)' }} />
                {/* Employees available */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(13,148,136,.1)', border: '1px solid rgba(13,148,136,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488', flexShrink: 0 }}>
                    <Users size={13} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 1 }}>Available Employees</div>
                    <div style={{ fontWeight: 700, fontSize: '.83rem', color: 'var(--text1)' }}>
                      {filteredEmployees.length} from this division
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing hierarchy */}
            {nodes.length > 0 && (
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Existing Nodes</div>
                </div>
                <div style={{ padding: '10px 12px', maxHeight: 280, overflowY: 'auto' }}>
                  {nodes.slice(0, 12).map((n) => (
                    <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 6px', borderRadius: 8, marginBottom: 2 }}>
                      {n.parentId && <ChevronRight size={11} style={{ color: 'var(--text4)', flexShrink: 0, marginLeft: 8 }} />}
                      {!n.parentId && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--p)', flexShrink: 0, marginLeft: 2, marginRight: 5 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                        {n.department && <div style={{ fontSize: '.66rem', color: 'var(--text4)' }}>{n.department}</div>}
                      </div>
                    </div>
                  ))}
                  {nodes.length > 12 && (
                    <div style={{ padding: '6px', fontSize: '.7rem', color: 'var(--text4)', textAlign: 'center' }}>+{nodes.length - 12} more</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
