import React, { useState, useMemo, memo, useRef, useEffect, useCallback, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { router } from '@inertiajs/react'
import { SelectSearch } from '~/components/select-search'
import {
  ReactFlow, Background, BackgroundVariant, Controls,
  useNodesState, useEdgesState, Handle, Position, MarkerType,
  useReactFlow, ReactFlowProvider,
  type Node, type Edge, type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Minus, Plus, Maximize2, Minimize2, Target, Building2, User,
  ChevronUp, Users, Pencil, Trash2, UserPlus,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrgEmployee {
  id: number
  fullName: string
  employeeCode: string | null
  designationName: string | null
  departmentName: string | null
  reportingToId: number | null
}
interface Department { id: number; code: string; name: string }
interface Division   { id: number; code: string; name: string }
type PanelMode = 'child' | 'parent' | 'sibling' | 'edit'
interface PanelState { mode: PanelMode; employee: OrgEmployee; triggerRect: DOMRect }
interface Props {
  employees:    OrgEmployee[]
  allEmployees: OrgEmployee[]
  departments:  Department[]
  division:     Division | null
  divisionId:   number
  departmentId: number | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NODE_W  = 240
const CARD_H  = 88
const BTN_R   = 13
const BTN_TOP = CARD_H + 5
const V_GAP   = 80
const H_GAP   = 40
const EB      = 20
const EB2     = EB / 2

const COLORS = [
  '#0D9488','#7C3AED','#0284C7','#D97706','#E11D48',
  '#059669','#DC2626','#2563EB','#9333EA','#0891B2',
]
function nodeColor(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}
function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

// ── Layout ────────────────────────────────────────────────────────────────────

function buildLayout(employees: OrgEmployee[], collapsedIds: Set<number>) {
  const empById = new Map(employees.map((e) => [e.id, e]))

  const childrenOf = new Map<number | null, number[]>()
  employees.forEach((e) => {
    const pid = (e.reportingToId != null && empById.has(e.reportingToId)) ? e.reportingToId : null
    if (!childrenOf.has(pid)) childrenOf.set(pid, [])
    childrenOf.get(pid)!.push(e.id)
  })
  childrenOf.forEach((arr) => arr.sort((a, b) =>
    (empById.get(a)?.fullName ?? '').localeCompare(empById.get(b)?.fullName ?? '')
  ))

  const hiddenIds = new Set<number>()
  function markHidden(id: number) {
    ;(childrenOf.get(id) ?? []).forEach((c) => { hiddenIds.add(c); markHidden(c) })
  }
  collapsedIds.forEach((id) => markHidden(id))

  const swOf = new Map<number, number>()
  function sw(id: number): number {
    if (collapsedIds.has(id)) { swOf.set(id, NODE_W); return NODE_W }
    const ch = (childrenOf.get(id) ?? []).filter((c) => !hiddenIds.has(c))
    if (!ch.length) { swOf.set(id, NODE_W); return NODE_W }
    const total = ch.reduce((s, c) => s + sw(c), 0) + H_GAP * (ch.length - 1)
    const w = Math.max(NODE_W, total); swOf.set(id, w); return w
  }
  ;(childrenOf.get(null) ?? []).forEach((r) => sw(r))

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
  // Centre the whole tree around x = 0 so root(s) never drift when collapsing
  const roots = childrenOf.get(null) ?? []
  const totalRootW = roots.reduce((s, r) => s + (swOf.get(r) ?? NODE_W), 0)
                   + H_GAP * 2 * Math.max(0, roots.length - 1)
  let rx = -totalRootW / 2
  roots.forEach((r) => { const w = swOf.get(r) ?? NODE_W; place(r, rx + w / 2, 0); rx += w + H_GAP * 2 })

  const visible = employees.filter((e) => !hiddenIds.has(e.id))
  const baseNodes: Node[] = visible.map((e) => ({
    id: String(e.id), type: 'org',
    position: posOf.get(e.id) ?? { x: 0, y: 0 },
    data: {
      employee: e,
      hasChildren: (childrenOf.get(e.id) ?? []).length > 0,
      isCollapsed: collapsedIds.has(e.id),
      modifyMode: false, isHovered: false,
      onToggle: () => {}, onAddChild: () => {}, onAddParent: () => {},
      onAddSibling: () => {}, onEdit: () => {}, onDelete: () => {},
    },
    width: NODE_W, height: CARD_H + BTN_R * 2 + 10,
    draggable: false, selectable: false,
  }))

  const layoutEdges: Edge[] = visible
    .filter((e) => {
      const pid = (e.reportingToId != null && empById.has(e.reportingToId)) ? e.reportingToId : null
      return pid !== null && !hiddenIds.has(pid)
    })
    .map((e) => ({
      id: `e${e.reportingToId}-${e.id}`,
      source: String(e.reportingToId), target: String(e.id),
      sourceHandle: 'bottom', targetHandle: 'top', type: 'step',
      style: { stroke: '#d1d5db', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#d1d5db', width: 12, height: 12 },
    }))

  return { baseNodes, layoutEdges }
}

// ── Hierarchy Panel ───────────────────────────────────────────────────────────

const PANEL_TITLES: Record<PanelMode, string> = {
  child:   'Add Subordinate',
  parent:  'Set Manager',
  sibling: 'Add Colleague',
  edit:    'Change Manager',
}
const PANEL_DESCS: Record<PanelMode, (name: string) => string> = {
  child:   (n) => `Select an employee who will report to ${n}`,
  parent:  (n) => `Select the manager for ${n}`,
  sibling: (n) => `Select an employee to be a colleague of ${n}`,
  edit:    (n) => `Select a new manager for ${n}`,
}
const PANEL_ACCENT: Record<PanelMode, string> = {
  child: '#0D9488', parent: '#7C3AED', sibling: '#2563EB', edit: '#D97706',
}

function HierarchyPanel({
  state, allEmployees, divisionId, onClose,
}: {
  state: PanelState
  allEmployees: OrgEmployee[]
  divisionId: number
  onClose: () => void
}) {
  const { mode, employee, triggerRect } = state
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)
  const [isClosing, setIsClosing]   = useState(false)
  const accent = PANEL_ACCENT[mode]

  function handleClose() {
    setIsClosing(true)
    setTimeout(() => onClose(), 200)
  }

  const PW = 300, PH = 220
  const vw = window.innerWidth, vh = window.innerHeight
  let left = triggerRect.left, top = triggerRect.bottom + 8
  if (left + PW > vw - 8) left = Math.max(8, vw - PW - 8)
  if (top + PH > vh - 8) top = Math.max(8, triggerRect.top - PH - 8)

  const options = allEmployees
    .filter((e) => e.id !== employee.id)
    .map((e) => ({ value: String(e.id), label: e.fullName, sub: e.designationName ?? e.departmentName ?? '' }))

  function submit() {
    if (!selectedId) return
    setProcessing(true)
    let targetId: number
    let newReportingToId: number | null
    if (mode === 'child') {
      targetId = selectedId; newReportingToId = employee.id
    } else if (mode === 'parent' || mode === 'edit') {
      targetId = employee.id; newReportingToId = selectedId
    } else {
      targetId = selectedId; newReportingToId = employee.reportingToId
    }
    router.patch(
      `/hrms/organization/hierarchy/${targetId}/set-parent`,
      { reportingToId: newReportingToId, divisionId },
      { onFinish: () => setProcessing(false) }
    )
  }

  return createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={handleClose} />
      <div style={{
        position: 'fixed', left, top, width: PW, zIndex: 1000,
        background: 'var(--surface)', border: '1.5px solid var(--border)',
        borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,.18)', overflow: 'hidden',
        animation: `${isClosing ? 'hpanel-out' : 'hpanel-in'} 0.2s cubic-bezier(0.4,0,0.2,1) forwards`,
        transformOrigin: 'top center',
      }}>
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid var(--border)',
          background: accent + '0d',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.82rem', color: accent }}>{PANEL_TITLES[mode]}</div>
            <div style={{ fontSize: '.68rem', color: 'var(--text4)', marginTop: 1 }}>
              {PANEL_DESCS[mode](employee.fullName)}
            </div>
          </div>
          <button type="button" onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text4)', padding: 2 }}>✕</button>
        </div>
        <div style={{ padding: '12px 14px 14px' }}>
          <SelectSearch
            options={options}
            value={selectedId !== null ? String(selectedId) : ''}
            onChange={(v) => setSelectedId(v ? Number(v) : null)}
            placeholder="Search employee…"
          />
          <button type="button" disabled={!selectedId || processing} onClick={submit}
            style={{
              marginTop: 10, width: '100%', height: 32, borderRadius: 8,
              background: accent, color: '#fff', border: 'none',
              fontWeight: 700, fontSize: '.76rem', cursor: 'pointer',
              opacity: (!selectedId || processing) ? .5 : 1,
            }}>
            {processing ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

// ── Org Node Card ─────────────────────────────────────────────────────────────

interface OrgNodeData extends Record<string, unknown> {
  employee: OrgEmployee
  hasChildren: boolean; isCollapsed: boolean; modifyMode: boolean; isHovered: boolean; isExiting: boolean
  onToggle:     (id: number) => void
  onAddChild:   (e: OrgEmployee, r: DOMRect) => void
  onAddParent:  (e: OrgEmployee, r: DOMRect) => void
  onAddSibling: (e: OrgEmployee, r: DOMRect) => void
  onEdit:       (e: OrgEmployee, r: DOMRect) => void
  onDelete:     (e: OrgEmployee) => void
}

function EdgeBtn({ icon, btnColor, title, posStyle, onClick }: {
  icon: ReactNode; btnColor: string; title: string
  posStyle: CSSProperties
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      type="button" title={title} className="nodrag"
      onClick={(e) => { e.stopPropagation(); onClick(e) }}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', width: EB, height: EB, borderRadius: '50%',
        background: btnColor + '18', border: `1.5px solid ${btnColor}55`,
        color: btnColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, zIndex: 30,
        boxShadow: `0 2px 8px ${btnColor}30`, ...posStyle,
      }}
    >{icon}</button>
  )
}

const OrgNode = memo(function OrgNode({ data }: NodeProps) {
  const d = data as OrgNodeData
  const { employee, hasChildren, isCollapsed, modifyMode, isHovered, isExiting } = d

  // Mount animation — starts hidden, fades in on first frame
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const color = nodeColor(employee.fullName)
  const abbr  = initials(employee.fullName)
  const showActions = modifyMode && isHovered

  const nodeOpacity  = isExiting ? 0 : mounted ? 1 : 0
  const nodeScale    = isExiting ? 0.88 : mounted ? 1 : 0.88

  return (
    <div style={{
      width: NODE_W, position: 'relative',
      opacity: nodeOpacity,
      transform: `scale(${nodeScale})`,
      transformOrigin: 'center top',
      transition: 'opacity 0.24s ease, transform 0.24s ease',
    }}>
      <Handle id="top" type="target" position={Position.Top}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1, top: 0 }} />

      {/* Card */}
      <div style={{
        width: NODE_W, height: CARD_H,
        background: isHovered ? 'var(--bg2)' : 'var(--surface)',
        border: `1.5px solid ${isHovered ? color + '70' : 'rgba(0,0,0,.08)'}`,
        borderRadius: 14,
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px',
        boxShadow: isHovered ? `0 0 0 3px ${color}18` : 'none',
        position: 'relative',
        transition: 'box-shadow .18s, border-color .18s, background .15s',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color, borderRadius: '14px 0 0 14px' }} />

        <div style={{ paddingLeft: 8, flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: color + '1e', border: `2px solid ${color}38`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, fontWeight: 700, fontSize: '.9rem',
          }}>
            {abbr || <User size={16} color={color} />}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {employee.fullName}
          </div>
          {employee.designationName && (
            <div style={{ fontSize: '.7rem', color, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {employee.designationName}
            </div>
          )}
          {employee.departmentName && (
            <span style={{
              display: 'inline-block', marginTop: 3,
              fontSize: '.63rem', color: 'var(--text3)',
              background: 'var(--bg2)', padding: '1px 6px', borderRadius: 20,
              border: '1px solid var(--border)',
              whiteSpace: 'nowrap', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {employee.departmentName}
            </span>
          )}
        </div>

        {/* Action buttons — shown on modify mode + hover */}
        {showActions && <>
          <EdgeBtn icon={<ChevronUp size={11} />} btnColor="#7C3AED" title="Set Manager"
            posStyle={{ top: -EB2, left: NODE_W / 2 - EB2 }}
            onClick={(e) => d.onAddParent(employee, (e.currentTarget as HTMLButtonElement).getBoundingClientRect())}
          />
          <EdgeBtn icon={<Trash2 size={10} />} btnColor="#ef4444" title="Remove from hierarchy"
            posStyle={{ top: 7, right: 7 }}
            onClick={() => d.onDelete(employee)}
          />
          <EdgeBtn icon={<Users size={10} />} btnColor="#2563EB" title="Add Colleague"
            posStyle={{ top: CARD_H / 2 - EB2, right: -EB2 }}
            onClick={(e) => d.onAddSibling(employee, (e.currentTarget as HTMLButtonElement).getBoundingClientRect())}
          />
          <EdgeBtn icon={<Users size={10} />} btnColor="#2563EB" title="Add Colleague"
            posStyle={{ top: CARD_H / 2 - EB2, left: -EB2 }}
            onClick={(e) => d.onAddSibling(employee, (e.currentTarget as HTMLButtonElement).getBoundingClientRect())}
          />
          <EdgeBtn icon={<UserPlus size={10} />} btnColor="#0D9488" title="Add Subordinate"
            posStyle={{ top: CARD_H - EB2, left: NODE_W / 2 - EB2 }}
            onClick={(e) => d.onAddChild(employee, (e.currentTarget as HTMLButtonElement).getBoundingClientRect())}
          />
          <EdgeBtn icon={<Pencil size={10} />} btnColor="#D97706" title="Change Manager"
            posStyle={{ bottom: 7, right: 7 }}
            onClick={(e) => d.onEdit(employee, (e.currentTarget as HTMLButtonElement).getBoundingClientRect())}
          />
        </>}
      </div>

      <Handle id="bottom" type="source" position={Position.Bottom}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1, bottom: 0 }} />

      {/* Collapse/expand — only shown outside modify mode */}
      {hasChildren && !modifyMode && (
        <button
          type="button" className="nodrag"
          onClick={(e) => { e.stopPropagation(); d.onToggle(employee.id) }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute', top: BTN_TOP, left: '50%', transform: 'translateX(-50%)',
            width: BTN_R * 2, height: BTN_R * 2, borderRadius: '50%',
            background: color, border: '2.5px solid var(--surface)',
            boxShadow: `0 2px 10px ${color}50`,
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

const NODE_TYPES = { org: OrgNode }

// ── Canvas button ─────────────────────────────────────────────────────────────

function CanvasBtn({ onClick, children, active }: { onClick: () => void; children: ReactNode; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} style={{
      height: 28, padding: '0 10px', borderRadius: 8, fontSize: '.72rem', fontWeight: 600,
      color: active ? '#fff' : 'var(--text2)',
      background: active ? 'var(--p)' : 'var(--surface)',
      border: active ? '1px solid var(--p)' : '1px solid var(--border)',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    }}>{children}</button>
  )
}

// ── Delete confirmation ───────────────────────────────────────────────────────

function DeleteConfirm({ employee, divisionId, onClose }: {
  employee: OrgEmployee; divisionId: number; onClose: () => void
}) {
  const [processing, setProcessing] = useState(false)
  const [isClosing, setIsClosing]   = useState(false)

  function handleClose() {
    setIsClosing(true)
    setTimeout(() => onClose(), 200)
  }

  function confirm() {
    setProcessing(true)
    router.patch(
      `/hrms/organization/hierarchy/${employee.id}/set-parent`,
      { reportingToId: null, divisionId },
      { onFinish: () => { setProcessing(false); onClose() } }
    )
  }

  return createPortal(
    <>
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000,
          animation: `${isClosing ? 'overlay-out' : 'overlay-in'} 0.2s ease forwards`,
        }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        width: 340, background: 'var(--surface)', borderRadius: 14,
        border: '1.5px solid var(--border)', boxShadow: '0 16px 48px rgba(0,0,0,.22)',
        padding: '22px 24px', zIndex: 1001,
        animation: `${isClosing ? 'dialog-out' : 'dialog-in'} 0.2s cubic-bezier(0.4,0,0.2,1) forwards`,
      }}>
        <div style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--text1)', marginBottom: 8 }}>
          Remove from hierarchy?
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--text3)', marginBottom: 18, lineHeight: 1.5 }}>
          <strong>{employee.fullName}</strong> will be detached from their manager.
          Their direct reports will become root nodes.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={handleClose}
            style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', fontSize: '.78rem', cursor: 'pointer', color: 'var(--text2)' }}>
            Cancel
          </button>
          <button type="button" onClick={confirm} disabled={processing}
            style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', opacity: processing ? .6 : 1 }}>
            {processing ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

// ── Chart canvas ──────────────────────────────────────────────────────────────

function ChartCanvas({
  employees, allEmployees, divisionId, modifyMode,
}: {
  employees: OrgEmployee[]; allEmployees: OrgEmployee[]
  divisionId: number; modifyMode: boolean
}) {
  const { fitView } = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // ── Collapse state lives here — no window globals needed ──────────────────
  const [collapsedIds, setCollapsedIds] = useState(new Set<number>())
  const [exitingIds,   setExitingIds]   = useState(new Set<number>())
  const [hoveredId,    setHoveredId]    = useState<string | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [panel,        setPanel]        = useState<PanelState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OrgEmployee | null>(null)

  // ── Stable callbacks ──────────────────────────────────────────────────────
  const onToggle = useCallback((id: number) => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)

    if (collapsedIds.has(id)) {
      // Expanding: clear any pending exit, show nodes immediately (they get mount animation)
      setExitingIds(new Set())
      setCollapsedIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    } else {
      // Collapsing: collect visible descendants → mark exiting → animate out → collapse
      const empById  = new Map(employees.map((e) => [e.id, e]))
      const childOf  = new Map<number, number[]>()
      employees.forEach((e) => {
        const pid = e.reportingToId != null && empById.has(e.reportingToId) ? e.reportingToId : null
        if (pid !== null) {
          if (!childOf.has(pid)) childOf.set(pid, [])
          childOf.get(pid)!.push(e.id)
        }
      })
      const toExit = new Set<number>()
      function collectDescendants(nid: number) {
        for (const c of childOf.get(nid) ?? []) {
          toExit.add(c)
          if (!collapsedIds.has(c)) collectDescendants(c)
        }
      }
      collectDescendants(id)

      setExitingIds(toExit)
      exitTimerRef.current = setTimeout(() => {
        setCollapsedIds((prev) => { const n = new Set(prev); n.add(id); return n })
        setExitingIds(new Set())
        exitTimerRef.current = null
      }, 260)
    }
  }, [collapsedIds, employees])
  const onAddChild   = useCallback((e: OrgEmployee, r: DOMRect) => setPanel({ mode: 'child',   employee: e, triggerRect: r }), [])
  const onAddParent  = useCallback((e: OrgEmployee, r: DOMRect) => setPanel({ mode: 'parent',  employee: e, triggerRect: r }), [])
  const onAddSibling = useCallback((e: OrgEmployee, r: DOMRect) => setPanel({ mode: 'sibling', employee: e, triggerRect: r }), [])
  const onEdit       = useCallback((e: OrgEmployee, r: DOMRect) => setPanel({ mode: 'edit',    employee: e, triggerRect: r }), [])
  const onDelete     = useCallback((e: OrgEmployee) => setDeleteTarget(e), [])

  // ── Build layout ──────────────────────────────────────────────────────────
  const { baseNodes, layoutEdges } = useMemo(
    () => buildLayout(employees, collapsedIds),
    [employees, collapsedIds]
  )

  // Clean up timer on unmount
  useEffect(() => () => { if (exitTimerRef.current) clearTimeout(exitTimerRef.current) }, [])

  // ── Inject callbacks + hover + exit state into nodes ─────────────────────
  const fullNodes = useMemo(() => baseNodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      modifyMode,
      isHovered:  n.id === hoveredId,
      isExiting:  exitingIds.has(Number(n.id)),
      onToggle, onAddChild, onAddParent, onAddSibling, onEdit, onDelete,
    },
  })), [baseNodes, modifyMode, hoveredId, exitingIds, onToggle, onAddChild, onAddParent, onAddSibling, onEdit, onDelete])

  const [nodes, setNodes, onNodesChange] = useNodesState(fullNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges)

  // Sync external layout changes into ReactFlow state
  useEffect(() => { setNodes(fullNodes) }, [fullNodes, setNodes])
  useEffect(() => { setEdges(layoutEdges) }, [layoutEdges, setEdges])

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current; if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => {})
    else document.exitFullscreen().catch(() => {})
  }, [])

  function handleDownload() {
    const empMap = new Map(employees.map((e) => [e.id, e]))
    const rows = [['Name', 'Employee Code', 'Designation', 'Department', 'Reports To']]
    employees.forEach((e) => {
      const mgr = e.reportingToId ? empMap.get(e.reportingToId) : null
      rows.push([e.fullName, e.employeeCode ?? '', e.designationName ?? '', e.departmentName ?? '', mgr?.fullName ?? ''])
    })
    const csv  = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'hierarchy.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div ref={containerRef} style={{
        height: isFullscreen ? '100vh' : 'calc(100vh - 60px)',
        borderRadius: isFullscreen ? 0 : 14,
        overflow: 'hidden', border: '1.5px solid var(--border)',
        background: 'var(--surface)', position: 'relative',
      }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onNodeMouseEnter={(_, node) => setHoveredId(node.id)}
          onNodeMouseLeave={() => setHoveredId(null)}
          nodeTypes={NODE_TYPES}
          fitView fitViewOptions={{ padding: 0.22, maxZoom: 1 }}
          minZoom={0.06} maxZoom={2}
          nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
          deleteKeyCode={null}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="rgba(0,0,0,.1)" />
          <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: 6 }}>
            <CanvasBtn onClick={() => fitView({ padding: 0.22, duration: 400 })}>
              <Target size={12} /> Center
            </CanvasBtn>
            <CanvasBtn onClick={() => {
              if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
              setExitingIds(new Set())
              setCollapsedIds(new Set())
            }}>
              <Plus size={12} /> Expand All
            </CanvasBtn>
            <CanvasBtn onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </CanvasBtn>
            <CanvasBtn onClick={handleDownload}>Export CSV</CanvasBtn>
          </div>
          {modifyMode && (
            <div style={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              zIndex: 10, background: '#f59e0b18', border: '1px solid #f59e0b40',
              borderRadius: 8, padding: '5px 14px', fontSize: '.7rem', fontWeight: 600, color: '#b45309',
            }}>
              Modify mode — hover cards to manage reporting relationships
            </div>
          )}
          <Controls showInteractive={false} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }} />
        </ReactFlow>
      </div>

      {panel && (
        <HierarchyPanel
          state={panel}
          allEmployees={allEmployees}
          divisionId={divisionId}
          onClose={() => setPanel(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          employee={deleteTarget}
          divisionId={divisionId}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HierarchyChartPage({
  employees, allEmployees, departments, division, divisionId, departmentId,
}: Props) {
  const [modifyMode, setModifyMode] = useState(false)

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; overflow: hidden; }

        /* ── Smooth node repositioning on collapse/expand ── */
        .react-flow__node { transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease; }
        .react-flow__edge { transition: opacity 0.2s ease; }

        /* ── HierarchyPanel ── */
        @keyframes hpanel-in  { from { opacity:0; transform:scale(.94) translateY(-6px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes hpanel-out { from { opacity:1; transform:scale(1)   translateY(0);    } to { opacity:0; transform:scale(.94) translateY(-6px); } }

        /* ── DeleteConfirm overlay ── */
        @keyframes overlay-in  { from { opacity:0; } to { opacity:1; } }
        @keyframes overlay-out { from { opacity:1; } to { opacity:0; } }

        /* ── DeleteConfirm dialog ── */
        @keyframes dialog-in  { from { opacity:0; transform:translate(-50%,-48%) scale(.95); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        @keyframes dialog-out { from { opacity:1; transform:translate(-50%,-50%) scale(1);   } to { opacity:0; transform:translate(-50%,-52%) scale(.95); } }
      `}</style>

      {/* ── Toolbar ── */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        <button type="button" onClick={() => { window.location.href = '/hrms/organization/hierarchy' }}
          style={{
            height: 30, padding: '0 12px', borderRadius: 8, fontSize: '.76rem', fontWeight: 600,
            color: 'var(--text2)', background: 'var(--bg2)', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>← Back</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <Building2 size={16} style={{ color: 'var(--p)', flexShrink: 0 }} />
          <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {division?.name ?? 'Hierarchy'}
            {departmentId && departments.find((d) => d.id === departmentId) && (
              <span style={{ fontWeight: 400, color: 'var(--text4)', marginLeft: 6, fontSize: '.78rem' }}>
                › {departments.find((d) => d.id === departmentId)?.name}
              </span>
            )}
          </div>
          <span style={{ fontSize: '.66rem', color: 'var(--text4)', background: 'var(--bg2)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)', fontWeight: 400, flexShrink: 0 }}>
            {employees.length} member{employees.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Department filter pills */}
        {departments.length > 1 && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap' }}>
            {[{ id: null, name: 'All' }, ...departments].map((dept) => {
              const active = dept.id === null ? !departmentId : departmentId === dept.id
              return (
                <a key={dept.id ?? 'all'}
                  href={dept.id ? `/hrms/organization/hierarchy/chart?divisionId=${divisionId}&departmentId=${dept.id}` : `/hrms/organization/hierarchy/chart?divisionId=${divisionId}`}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600,
                    textDecoration: 'none', cursor: 'pointer',
                    background: active ? 'var(--p)' : 'var(--bg2)',
                    color: active ? '#fff' : 'var(--text3)',
                    border: active ? '1px solid var(--p)' : '1px solid var(--border)',
                  }}
                >{dept.name}</a>
              )
            })}
          </div>
        )}

        {/* Modify toggle */}
        <button type="button" onClick={() => setModifyMode((m) => !m)}
          style={{
            height: 30, padding: '0 12px', borderRadius: 8, fontSize: '.76rem', fontWeight: 700,
            background: modifyMode ? 'var(--p)' : 'var(--bg2)',
            color: modifyMode ? '#fff' : 'var(--text2)',
            border: modifyMode ? '1px solid var(--p)' : '1px solid var(--border)',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
          }}>
          <Pencil size={12} /> {modifyMode ? 'Exit Modify' : 'Modify'}
        </button>
      </div>

      {employees.length === 0 ? (
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <Building2 size={36} style={{ color: 'var(--text4)', margin: '0 auto 16px' }} />
          <div style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--text1)', marginBottom: 8 }}>
            No employees in this division
          </div>
          <div style={{ fontSize: '.8rem', color: 'var(--text4)' }}>
            Assign employees to <strong>{division?.name}</strong> to see the org chart.
          </div>
        </div>
      ) : (
        <ReactFlowProvider>
          <ChartCanvas
            employees={employees}
            allEmployees={allEmployees}
            divisionId={divisionId}
            modifyMode={modifyMode}
          />
        </ReactFlowProvider>
      )}
    </>
  )
}
