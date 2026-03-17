import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Modal } from '~/components/modal'
import { SelectSearch } from '~/components/select-search'
import {
  ReactFlow, Background, BackgroundVariant, Controls,
  useNodesState, useEdgesState, Handle, Position, MarkerType,
  useReactFlow, ReactFlowProvider,
  type Node, type Edge, type NodeProps, type OnNodeDrag,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Building2, Layers, Filter, Settings2, Printer, Download,
  UserPlus, Pencil, Unlink, Save, AlertTriangle, User,
  Plus, Minus, Maximize2, Minimize2, Target, Move, Network, Users,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Employee {
  id: number
  fullName: string
  employeeCode: string | null
  divisionId: number | null
  departmentId: number | null
  designationId: number | null
  reportingToId: number | null
  designationName: string | null
  departmentName: string | null
}
interface Division   { id: number; code: string; name: string }
interface Department { id: number; code: string; name: string }
interface Props { employees: Employee[]; divisions: Division[]; departments: Department[] }

// ── Chart constants ────────────────────────────────────────────────────────────

const NODE_W   = 242
const CARD_H   = 88
const BTN_R    = 14
const BTN_TOP  = CARD_H + 6
const V_GAP    = 84
const H_GAP    = 48

const AVATAR_COLORS = [
  '#0D9488','#7C3AED','#0284C7','#D97706','#E11D48',
  '#059669','#DC2626','#2563EB','#9333EA','#0891B2',
]
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length] }
function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

interface MoveConfirm { empId: number; empName: string; targetId: number; targetName: string }

// ── Layout builder ─────────────────────────────────────────────────────────────

function buildLayout(employees: Employee[], collapsedIds: Set<number>) {
  const byId = new Map(employees.map((e) => [e.id, e]))

  // Build children map using reportingToId
  const childrenOf = new Map<number | null, number[]>()
  employees.forEach((e) => {
    const pid = e.reportingToId && byId.has(e.reportingToId) ? e.reportingToId : null
    if (!childrenOf.has(pid)) childrenOf.set(pid, [])
    childrenOf.get(pid)!.push(e.id)
  })
  // Sort children alphabetically
  childrenOf.forEach((arr) => arr.sort((a, b) => (byId.get(a)?.fullName ?? '').localeCompare(byId.get(b)?.fullName ?? '')))

  // Hidden nodes (collapsed subtrees)
  const hiddenIds = new Set<number>()
  function markHidden(id: number) {
    ;(childrenOf.get(id) ?? []).forEach((c) => { hiddenIds.add(c); markHidden(c) })
  }
  collapsedIds.forEach((id) => markHidden(id))

  // Subtree width calculation
  const swOf = new Map<number, number>()
  function sw(id: number): number {
    if (collapsedIds.has(id)) { swOf.set(id, NODE_W); return NODE_W }
    const ch = (childrenOf.get(id) ?? []).filter((c) => !hiddenIds.has(c))
    if (!ch.length) { swOf.set(id, NODE_W); return NODE_W }
    const total = ch.reduce((s, c) => s + sw(c), 0) + H_GAP * (ch.length - 1)
    const w = Math.max(NODE_W, total); swOf.set(id, w); return w
  }
  ;(childrenOf.get(null) ?? []).forEach((r) => sw(r))

  // Position assignment
  const posOf = new Map<number, { x: number; y: number }>()
  function place(id: number, cx: number, y: number) {
    posOf.set(id, { x: cx - NODE_W / 2, y })
    if (collapsedIds.has(id)) return
    const ch = (childrenOf.get(id) ?? []).filter((c) => !hiddenIds.has(c))
    if (!ch.length) return
    const total = ch.reduce((s, c) => s + (swOf.get(c) ?? NODE_W), 0) + H_GAP * (ch.length - 1)
    let x = cx - total / 2
    ch.forEach((c) => { const w = swOf.get(c) ?? NODE_W; place(c, x + w / 2, y + CARD_H + V_GAP); x += w + H_GAP })
  }
  const roots = childrenOf.get(null) ?? []
  let rx = 0
  roots.forEach((r) => { const w = swOf.get(r) ?? NODE_W; place(r, rx + w / 2, 0); rx += w + H_GAP * 2 })

  const visible = employees.filter((e) => !hiddenIds.has(e.id))

  const rfNodes: Node[] = visible.map((e) => ({
    id: String(e.id),
    type: 'org',
    position: posOf.get(e.id) ?? { x: 0, y: 0 },
    data: {
      emp: e,
      hasChildren: (childrenOf.get(e.id) ?? []).filter((c) => !hiddenIds.has(c)).length > 0,
      isCollapsed: collapsedIds.has(e.id),
      isDropTarget: false,
      modifyMode: false,
      onToggle: () => {},
      onAddSub: () => {},
      onSetReporting: () => {},
      onDetach: () => {},
    },
    width: NODE_W,
    height: CARD_H + BTN_R * 2 + 10,
    draggable: true,
    selectable: false,
  }))

  const rfEdges: Edge[] = visible
    .filter((e) => e.reportingToId != null && byId.has(e.reportingToId) && !hiddenIds.has(e.reportingToId))
    .map((e) => ({
      id: `e${e.reportingToId}-${e.id}`,
      source: String(e.reportingToId),
      target: String(e.id),
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'step',
      style: { stroke: '#d1d5db', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#d1d5db', width: 12, height: 12 },
    }))

  return { rfNodes, rfEdges, posOf, childrenOf }
}

function getDescendantIds(empId: number, childrenOf: Map<number | null, number[]>): Set<number> {
  const result = new Set<number>()
  const stack = [empId]
  while (stack.length) {
    const cur = stack.pop()!
    ;(childrenOf.get(cur) ?? []).forEach((c) => { result.add(c); stack.push(c) })
  }
  return result
}

// ── Org Node Card ─────────────────────────────────────────────────────────────

interface OrgNodeData extends Record<string, unknown> {
  emp: Employee
  hasChildren: boolean
  isCollapsed: boolean
  isDropTarget: boolean
  modifyMode: boolean
  onToggle: (id: number) => void
  onAddSub: (emp: Employee) => void
  onSetReporting: (emp: Employee) => void
  onDetach: (emp: Employee) => void
}

const OrgNode = memo(function OrgNode({ data }: NodeProps) {
  const d = data as OrgNodeData
  const { emp, hasChildren, isCollapsed, isDropTarget, modifyMode } = d
  const [hovered, setHovered] = useState(false)
  const color = avatarColor(emp.id)
  const abbr  = initials(emp.fullName)

  return (
    <div
      style={{ width: NODE_W, position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle id="top" type="target" position={Position.Top}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1, top: 0 }} />

      {/* Card */}
      <div style={{
        width: NODE_W, height: CARD_H,
        background: isDropTarget
          ? `linear-gradient(135deg,${color}14,${color}07)`
          : hovered ? 'var(--bg2, #f9fafb)' : 'var(--surface, #fff)',
        border: `1.5px solid ${isDropTarget ? color : hovered ? color + '60' : 'rgba(0,0,0,.1)'}`,
        borderRadius: 14,
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px',
        boxShadow: hovered
          ? `0 4px 20px rgba(0,0,0,.1), 0 0 0 3px ${color}18`
          : '0 2px 10px rgba(0,0,0,.07)',
        position: 'relative', overflow: 'hidden',
        transition: 'box-shadow .18s, border-color .18s, background .18s',
      }}>
        {/* Color left bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color, borderRadius: '14px 0 0 14px' }} />

        {/* Avatar */}
        <div style={{ paddingLeft: 8, flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: color + '1c', border: `2px solid ${color}38`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, fontWeight: 700, fontSize: '.9rem',
          }}>
            {abbr}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: '.86rem', color: 'var(--text1)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {emp.fullName}
          </div>
          {emp.designationName && (
            <div style={{
              fontSize: '.7rem', color, fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2,
            }}>
              {emp.designationName}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'nowrap' }}>
            {emp.departmentName && (
              <span style={{
                fontSize: '.64rem', color: 'var(--text3)',
                background: 'var(--bg2)', padding: '1px 6px', borderRadius: 20,
                border: '1px solid var(--border)', whiteSpace: 'nowrap',
                maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {emp.departmentName}
              </span>
            )}
            {emp.employeeCode && (
              <span style={{ fontSize: '.62rem', color: 'var(--text4)', whiteSpace: 'nowrap' }}>
                {emp.employeeCode}
              </span>
            )}
          </div>
        </div>

        {/* Hover modify actions */}
        {modifyMode && hovered && (
          <div style={{
            position: 'absolute', top: 6, right: 8,
            display: 'flex', gap: 4, zIndex: 20,
          }}>
            <button
              type="button"
              onMouseDown={(e) => { e.stopPropagation(); d.onAddSub(emp) }}
              title="Add subordinate"
              style={actionBtnStyle('#0D9488')}
            >
              <UserPlus size={11} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.stopPropagation(); d.onSetReporting(emp) }}
              title="Change reporting manager"
              style={actionBtnStyle('#2563EB')}
            >
              <Pencil size={11} />
            </button>
            {emp.reportingToId && (
              <button
                type="button"
                onMouseDown={(e) => { e.stopPropagation(); d.onDetach(emp) }}
                title="Detach from hierarchy"
                style={actionBtnStyle('#ef4444')}
              >
                <Unlink size={11} />
              </button>
            )}
          </div>
        )}
      </div>

      <Handle id="bottom" type="source" position={Position.Bottom}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1, bottom: 0 }} />

      {/* Collapse toggle */}
      {hasChildren && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); d.onToggle(emp.id) }}
          style={{
            position: 'absolute', top: BTN_TOP, left: '50%', transform: 'translateX(-50%)',
            width: BTN_R * 2, height: BTN_R * 2, borderRadius: '50%',
            background: color, border: '2.5px solid #fff',
            boxShadow: `0 2px 10px ${color}55`,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10, padding: 0,
          }}
        >
          {isCollapsed ? <Plus size={11} strokeWidth={2.5} /> : <Minus size={11} strokeWidth={2.5} />}
        </button>
      )}
    </div>
  )
})

function actionBtnStyle(color: string): React.CSSProperties {
  return {
    width: 24, height: 24, borderRadius: 7, border: 'none',
    background: color + '18', color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    boxShadow: `0 1px 4px ${color}30`,
  }
}

const NODE_TYPES = { org: OrgNode }

// ── Chart Canvas ───────────────────────────────────────────────────────────────

function ChartInner({
  employees, modifyMode,
  onAddSub, onSetReporting, onDetach,
}: {
  employees: Employee[]
  modifyMode: boolean
  onAddSub: (emp: Employee) => void
  onSetReporting: (emp: Employee) => void
  onDetach: (emp: Employee) => void
}) {
  const { fitView } = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [collapsedIds, setCollapsedIds] = useState(new Set<number>())
  const [moveConfirm, setMoveConfirm] = useState<MoveConfirm | null>(null)
  const [moveOpen, setMoveOpen] = useState(false)

  const { rfNodes: layoutNodes, rfEdges, posOf, childrenOf } = useMemo(
    () => buildLayout(employees, collapsedIds),
    [employees, collapsedIds]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges)

  useEffect(() => { setNodes(layoutNodes) }, [layoutNodes, setNodes])
  useEffect(() => { setEdges(rfEdges) }, [rfEdges, setEdges])

  const toggleCollapse = useCallback((id: number) => {
    setCollapsedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }, [])

  // Inject callbacks into every node's data
  useEffect(() => {
    setNodes((nds) => nds.map((n) => ({
      ...n,
      data: { ...n.data, modifyMode, onToggle: toggleCollapse, onAddSub, onSetReporting, onDetach },
    })))
  }, [modifyMode, toggleCollapse, onAddSub, onSetReporting, onDetach, setNodes])

  // Drag-to-reparent
  const dropTargetId = useRef<string | null>(null)

  const onNodeDrag: OnNodeDrag = useCallback((_e, dn) => {
    const cx = dn.position.x + NODE_W / 2, cy = dn.position.y + CARD_H / 2
    let found: string | null = null
    for (const n of nodes) {
      if (n.id === dn.id) continue
      if (cx >= n.position.x && cx <= n.position.x + NODE_W && cy >= n.position.y && cy <= n.position.y + CARD_H) {
        found = n.id; break
      }
    }
    if (found !== dropTargetId.current) {
      dropTargetId.current = found
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isDropTarget: n.id === found } })))
    }
  }, [nodes, setNodes])

  const onNodeDragStop: OnNodeDrag = useCallback((_e, dn) => {
    const cx = dn.position.x + NODE_W / 2, cy = dn.position.y + CARD_H / 2
    let targetNode: Node | null = null
    for (const n of nodes) {
      if (n.id === dn.id) continue
      if (cx >= n.position.x && cx <= n.position.x + NODE_W && cy >= n.position.y && cy <= n.position.y + CARD_H) {
        targetNode = n; break
      }
    }
    dropTargetId.current = null
    setNodes((nds) => nds.map((n) => {
      const snap = posOf.get(Number(n.id))
      return { ...n, position: snap ?? n.position, data: { ...n.data, isDropTarget: false } }
    }))
    if (!targetNode) return
    const dId = Number(dn.id), tId = Number(targetNode.id)
    const dEmp = employees.find((e) => e.id === dId)
    const tEmp = employees.find((e) => e.id === tId)
    if (!dEmp || !tEmp) return
    const descendants = getDescendantIds(dId, childrenOf)
    if (descendants.has(tId) || dEmp.reportingToId === tId) return
    setMoveConfirm({ empId: dId, empName: dEmp.fullName, targetId: tId, targetName: tEmp.fullName })
    setMoveOpen(true)
  }, [nodes, setNodes, employees, posOf, childrenOf])

  const handleMove = useCallback(() => {
    if (!moveConfirm) return
    router.patch(
      `/hrms/organization/hierarchy/${moveConfirm.empId}/reporting`,
      { reportingToId: moveConfirm.targetId },
      { onSuccess: () => { setMoveOpen(false); setMoveConfirm(null) } }
    )
  }, [moveConfirm])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current; if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    else document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
  }, [])

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        style={{
          height: isFullscreen ? '100vh' : 'calc(100vh - 230px)',
          minHeight: 520,
          borderRadius: isFullscreen ? 0 : 14,
          overflow: 'hidden',
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          position: 'relative',
        }}
      >
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          nodeTypes={NODE_TYPES}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          fitView fitViewOptions={{ padding: 0.22, maxZoom: 1 }}
          minZoom={0.06} maxZoom={2}
          nodesDraggable nodesConnectable={false} elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
          deleteKeyCode={null}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="rgba(0,0,0,.1)" />

          {/* Toolbar overlay */}
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: 6 }}>
            <ChartBtn onClick={() => fitView({ padding: 0.22, duration: 400 })}>
              <Target size={13} /> Center
            </ChartBtn>
            <ChartBtn onClick={() => setCollapsedIds(new Set())}>
              <Plus size={13} /> Expand All
            </ChartBtn>
            <ChartBtn onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </ChartBtn>
          </div>

          <Controls showInteractive={false} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }} />
        </ReactFlow>
      </div>

      {/* Move confirm modal */}
      <Modal
        open={moveOpen}
        onClose={() => { setMoveOpen(false); setMoveConfirm(null) }}
        title="Move Employee"
        size="sm"
        icon={<Move size={15} />}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => { setMoveOpen(false); setMoveConfirm(null) }}>Cancel</button>
            <button className="btn btn-p" onClick={handleMove}><Move size={13} /> Confirm</button>
          </div>
        }
      >
        {moveConfirm && (
          <div style={{ padding: '4px 0' }}>
            <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 12 }}>
              Set <strong>{moveConfirm.empName}</strong>'s reporting manager to <strong>{moveConfirm.targetName}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', borderRadius: 9, alignItems: 'center' }}>
              <Network size={13} style={{ color: 'var(--p)', flexShrink: 0 }} />
              <span style={{ fontSize: '.78rem', color: 'var(--text2)' }}>Subordinates will move along with them.</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

function ChartBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 13px', borderRadius: 8,
        background: 'var(--surface)', color: 'var(--text2)',
        border: '1.5px solid var(--border)',
        cursor: 'pointer', fontSize: '.74rem', fontWeight: 700,
        boxShadow: '0 1px 4px rgba(0,0,0,.08)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg2)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
    >
      {children}
    </button>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function HierarchyPage({ employees, divisions, departments }: Props) {
  // Filter
  const [filterDiv,  setFilterDiv]  = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [applied,    setApplied]    = useState(false)
  const [modifyMode, setModifyMode] = useState(false)

  // Modals
  const [reportingFor,   setReportingFor]   = useState<Employee | null>(null)
  const [detachFor,      setDetachFor]       = useState<Employee | null>(null)
  const [assignSubFor,   setAssignSubFor]    = useState<Employee | null>(null)
  const [newReportingId, setNewReportingId]  = useState('')
  const [newSubId,       setNewSubId]        = useState('')

  // Departments filtered to selected division's employees
  const divisionDepts = useMemo(() => {
    if (!filterDiv) return []
    const deptIds = new Set(
      employees
        .filter((e) => e.divisionId === Number(filterDiv) && e.departmentId)
        .map((e) => e.departmentId as number)
    )
    return departments.filter((d) => deptIds.has(d.id))
  }, [filterDiv, employees, departments])

  // Filtered employees for the canvas
  const filteredEmployees = useMemo(() => {
    if (!applied || !filterDiv) return []
    return employees.filter((e) => {
      if (e.divisionId !== Number(filterDiv)) return false
      if (filterDept && e.departmentId !== Number(filterDept)) return false
      return true
    })
  }, [applied, filterDiv, filterDept, employees])

  function applyFilter() {
    if (!filterDiv) return
    setApplied(true)
    setModifyMode(false)
  }

  function handleDownload() {
    const filteredIds = new Set(filteredEmployees.map((e) => e.id))
    const rows = [['Employee Code', 'Name', 'Designation', 'Department', 'Reports To']]
    filteredEmployees.forEach((emp) => {
      const mgr = emp.reportingToId && filteredIds.has(emp.reportingToId)
        ? employees.find((e) => e.id === emp.reportingToId) : null
      rows.push([
        emp.employeeCode ?? '',
        emp.fullName,
        emp.designationName ?? '',
        emp.departmentName ?? '',
        mgr?.fullName ?? '',
      ])
    })
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hierarchy-${divisions.find((d) => String(d.id) === filterDiv)?.name ?? 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Stable modal openers (passed into chart)
  const handleSetReporting = useCallback((emp: Employee) => { setReportingFor(emp); setNewReportingId('') }, [])
  const handleDetach        = useCallback((emp: Employee) => { setDetachFor(emp) }, [])
  const handleAssignSub     = useCallback((emp: Employee) => { setAssignSubFor(emp); setNewSubId('') }, [])

  function confirmSetReporting() {
    if (!reportingFor || !newReportingId) return
    router.patch(
      `/hrms/organization/hierarchy/${reportingFor.id}/reporting`,
      { reportingToId: newReportingId },
      { onSuccess: () => { setReportingFor(null); setNewReportingId('') } }
    )
  }

  function confirmDetach() {
    if (!detachFor) return
    router.patch(
      `/hrms/organization/hierarchy/${detachFor.id}/reporting`,
      { reportingToId: '' },
      { onSuccess: () => setDetachFor(null) }
    )
  }

  function confirmAssignSub() {
    if (!assignSubFor || !newSubId) return
    router.patch(
      `/hrms/organization/hierarchy/${newSubId}/reporting`,
      { reportingToId: String(assignSubFor.id) },
      { onSuccess: () => { setAssignSubFor(null); setNewSubId('') } }
    )
  }

  const selectedDiv  = divisions.find((d) => String(d.id) === filterDiv)
  const hasResults   = applied && filteredEmployees.length > 0

  return (
    <>
      {/* Print styles */}
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* ── Page Header ── */}
      <div className="ph no-print">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div className="ph-title">Organization Hierarchy</div>
            <div className="ph-sub">Drag cards to reparent · auto-built from employee reporting relationships</div>
          </div>
          {hasResults && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
                <Printer size={14} /> Print
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleDownload}>
                <Download size={14} /> Export CSV
              </button>
              <button
                type="button"
                className={`btn btn-sm ${modifyMode ? 'btn-p' : 'btn-outline-p'}`}
                onClick={() => setModifyMode((m) => !m)}
              >
                <Settings2 size={14} />
                {modifyMode ? 'Exit Modify' : 'Modify'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="card no-print" style={{ marginBottom: 14 }}>
        <div className="card-b">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="flbl">
                <Building2 size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle', color: 'var(--p)' }} />
                Division <span className="req">*</span>
              </label>
              <SelectSearch
                value={filterDiv}
                onChange={(v) => { setFilterDiv(v); setFilterDept(''); setApplied(false) }}
                placeholder="Select division…"
                options={divisions.map((d) => ({ value: String(d.id), label: d.name, sub: d.code }))}
              />
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="flbl">
                <Layers size={12} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle', color: 'var(--p)' }} />
                Department <span style={{ color: 'var(--text4)', fontWeight: 400 }}>(optional)</span>
              </label>
              <SelectSearch
                value={filterDept}
                onChange={(v) => { setFilterDept(v); setApplied(false) }}
                placeholder={filterDiv ? 'All departments' : 'Select division first'}
                options={divisionDepts.map((d) => ({ value: String(d.id), label: d.name, sub: d.code }))}
              />
            </div>
            <button
              type="button"
              className="btn btn-p"
              onClick={applyFilter}
              disabled={!filterDiv}
              style={{ height: 38 }}
            >
              <Filter size={14} /> Apply
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty states ── */}
      {!applied && (
        <div className="card" style={{ padding: '72px 24px', textAlign: 'center' }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'var(--p-lt)', border: '1.5px solid var(--p-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--p)',
          }}>
            <Network size={30} />
          </div>
          <div style={{ fontSize: '.96rem', fontWeight: 700, color: 'var(--text1)', marginBottom: 8 }}>
            Select a division to view hierarchy
          </div>
          <div style={{ fontSize: '.8rem', color: 'var(--text4)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
            The org chart is auto-built from employee profiles using their reporting relationships.
            Pick a division — and optionally a department — then click Apply.
          </div>
        </div>
      )}

      {applied && filteredEmployees.length === 0 && (
        <div className="card" style={{ padding: '72px 24px', textAlign: 'center' }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'var(--bg2)', border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--text4)',
          }}>
            <Users size={30} />
          </div>
          <div style={{ fontSize: '.96rem', fontWeight: 700, color: 'var(--text1)', marginBottom: 8 }}>
            No employees found
          </div>
          <div style={{ fontSize: '.8rem', color: 'var(--text4)' }}>
            No active employees in this division{filterDept ? ' / department' : ''}.
          </div>
        </div>
      )}

      {/* ── Chart info bar + canvas ── */}
      {hasResults && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Info bar */}
          <div style={{
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--text1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={14} style={{ color: 'var(--p)' }} />
                {selectedDiv?.name}
                {filterDept && (
                  <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: '.78rem' }}>
                    › {departments.find((d) => String(d.id) === filterDept)?.name}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '.7rem', color: 'var(--text4)',
                background: 'var(--surface)', padding: '2px 8px', borderRadius: 20,
                border: '1px solid var(--border)',
              }}>
                {filteredEmployees.length} employees
              </span>
              {modifyMode && (
                <span style={{
                  fontSize: '.7rem', fontWeight: 700,
                  color: 'var(--warn)', background: 'var(--warn-lt)',
                  padding: '2px 8px', borderRadius: 20, border: '1px solid var(--warn)',
                }}>
                  Modify Mode — Hover cards to edit
                </span>
              )}
            </div>
            {modifyMode && (
              <div style={{ fontSize: '.72rem', color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserPlus size={11} style={{ color: '#0D9488' }} /> Add sub
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Pencil size={11} style={{ color: '#2563EB' }} /> Change reporting
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Unlink size={11} style={{ color: '#ef4444' }} /> Detach
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Move size={11} style={{ color: 'var(--text3)' }} /> Drag to reparent
                </span>
              </div>
            )}
          </div>

          {/* React Flow canvas */}
          <ReactFlowProvider>
            <ChartInner
              employees={filteredEmployees}
              modifyMode={modifyMode}
              onAddSub={handleAssignSub}
              onSetReporting={handleSetReporting}
              onDetach={handleDetach}
            />
          </ReactFlowProvider>
        </div>
      )}

      {/* ── Modal: Change Reporting Manager ── */}
      <Modal
        open={!!reportingFor}
        onClose={() => { setReportingFor(null); setNewReportingId('') }}
        title="Change Reporting Manager"
        size="sm"
        icon={<Pencil size={14} />}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => { setReportingFor(null); setNewReportingId('') }}>Cancel</button>
            <button type="button" className="btn btn-p" onClick={confirmSetReporting} disabled={!newReportingId}>
              <Save size={14} /> Update
            </button>
          </div>
        }
      >
        {reportingFor && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', background: 'var(--bg2)', borderRadius: 10,
              border: '1px solid var(--border)', marginBottom: 18,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: avatarColor(reportingFor.id) + '20',
                border: `2px solid ${avatarColor(reportingFor.id)}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '.8rem', color: avatarColor(reportingFor.id),
              }}>
                {initials(reportingFor.fullName)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text1)' }}>{reportingFor.fullName}</div>
                {reportingFor.designationName && (
                  <div style={{ fontSize: '.72rem', color: 'var(--p)' }}>{reportingFor.designationName}</div>
                )}
              </div>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="flbl">New Reporting Manager</label>
              <SelectSearch
                value={newReportingId}
                onChange={setNewReportingId}
                placeholder="Search and select…"
                options={employees
                  .filter((e) => e.id !== reportingFor.id)
                  .map((e) => ({
                    value: String(e.id),
                    label: e.fullName,
                    sub: [e.designationName, e.employeeCode].filter(Boolean).join(' · ') || undefined,
                  }))}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal: Detach ── */}
      <Modal
        open={!!detachFor}
        onClose={() => setDetachFor(null)}
        title="Remove from Hierarchy"
        size="sm"
        icon={<Unlink size={14} />}
        variant="danger"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setDetachFor(null)}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={confirmDetach}>
              <Unlink size={14} /> Remove
            </button>
          </div>
        }
      >
        {detachFor && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <AlertTriangle size={20} style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--text1)', marginBottom: 6 }}>
                Remove <strong>{detachFor.fullName}</strong> from the reporting structure?
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--text3)', lineHeight: 1.55 }}>
                Their reporting manager will be cleared. Their subordinates remain but will become root-level nodes.
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal: Assign Subordinate ── */}
      <Modal
        open={!!assignSubFor}
        onClose={() => { setAssignSubFor(null); setNewSubId('') }}
        title="Add Subordinate"
        size="sm"
        icon={<UserPlus size={14} />}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => { setAssignSubFor(null); setNewSubId('') }}>Cancel</button>
            <button type="button" className="btn btn-p" onClick={confirmAssignSub} disabled={!newSubId}>
              <UserPlus size={14} /> Assign
            </button>
          </div>
        }
      >
        {assignSubFor && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', background: 'var(--bg2)', borderRadius: 10,
              border: '1px solid var(--border)', marginBottom: 18,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: avatarColor(assignSubFor.id) + '20',
                border: `2px solid ${avatarColor(assignSubFor.id)}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '.8rem', color: avatarColor(assignSubFor.id),
              }}>
                {initials(assignSubFor.fullName)}
              </div>
              <div>
                <div style={{ fontSize: '.72rem', color: 'var(--text4)', marginBottom: 2 }}>Adding subordinate under</div>
                <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text1)' }}>{assignSubFor.fullName}</div>
                {assignSubFor.designationName && (
                  <div style={{ fontSize: '.72rem', color: 'var(--p)' }}>{assignSubFor.designationName}</div>
                )}
              </div>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="flbl">Select Employee</label>
              <SelectSearch
                value={newSubId}
                onChange={setNewSubId}
                placeholder="Search and select employee…"
                options={employees
                  .filter((e) => e.id !== assignSubFor.id)
                  .map((e) => ({
                    value: String(e.id),
                    label: e.fullName,
                    sub: [e.designationName, e.employeeCode].filter(Boolean).join(' · ') || undefined,
                  }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
