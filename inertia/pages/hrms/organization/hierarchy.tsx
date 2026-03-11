import { useState, useCallback } from 'react'
import { useForm, router } from '@inertiajs/react'
import {
  GitBranch, Plus, Pencil, Trash2, ChevronRight,
  ChevronDown, User, Layers, Save, AlertTriangle,
} from 'lucide-react'
import { Modal } from '~/components/modal'

// ── Types ───────────────────────────────────────────────────────────────────────

interface Employee {
  id: number
  fullName: string
  employeeCode: string | null
}

interface HierarchyNode {
  id: number
  title: string
  department?: string | null
  parentId?: number | null
  employeeId?: number | null
  sortOrder?: number
  employee?: { fullName: string; employeeCode?: string | null } | null
  children?: HierarchyNode[]
}

interface Props {
  nodes: HierarchyNode[]
  employees: Employee[]
}

// ── Node form shape ──────────────────────────────────────────────────────────────

interface NodeForm {
  title: string
  department: string
  parentId: string
  employeeId: string
  sortOrder: string
}

// ── Build tree from flat list ────────────────────────────────────────────────────

function buildTree(nodes: HierarchyNode[]): HierarchyNode[] {
  const map = new Map<number, HierarchyNode & { children: HierarchyNode[] }>()
  nodes.forEach((n) => map.set(n.id, { ...n, children: [] }))

  const roots: HierarchyNode[] = []
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  // Sort by sortOrder within each level
  const sortChildren = (list: HierarchyNode[]) => {
    list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    list.forEach((n) => n.children && sortChildren(n.children))
  }
  sortChildren(roots)

  return roots
}

// ── Connector lines constants ────────────────────────────────────────────────────

const CONNECTOR_COLOR = 'var(--border2)'

// ── Single Node Card ─────────────────────────────────────────────────────────────

function NodeCard({
  node,
  depth,
  allNodes,
  onEdit,
  onDelete,
  isLast,
}: {
  node: HierarchyNode
  depth: number
  allNodes: HierarchyNode[]
  onEdit: (node: HierarchyNode) => void
  onDelete: (node: HierarchyNode) => void
  isLast: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  const depthColors = [
    { accent: '#0D9488', bg: 'rgba(13,148,136,.06)', border: 'rgba(13,148,136,.2)' },
    { accent: '#7C3AED', bg: 'rgba(124,58,237,.06)', border: 'rgba(124,58,237,.2)' },
    { accent: '#0284C7', bg: 'rgba(2,132,199,.06)',  border: 'rgba(2,132,199,.2)' },
    { accent: '#D97706', bg: 'rgba(217,119,6,.06)',  border: 'rgba(217,119,6,.2)' },
    { accent: '#E11D48', bg: 'rgba(225,29,72,.06)',  border: 'rgba(225,29,72,.2)' },
  ]
  const dc = depthColors[Math.min(depth, depthColors.length - 1)]

  return (
    <div style={{ position: 'relative' }}>
      {/* Vertical connector from parent */}
      {depth > 0 && (
        <>
          {/* Vertical line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: -28,
            width: 1,
            height: isLast ? 22 : '100%',
            background: CONNECTOR_COLOR,
          }} />
          {/* Horizontal elbow */}
          <div style={{
            position: 'absolute',
            top: 22,
            left: -28,
            width: 20,
            height: 1,
            background: CONNECTOR_COLOR,
          }} />
        </>
      )}

      {/* Node card */}
      <div style={{
        display: 'flex', alignItems: 'stretch', gap: 0,
        marginBottom: hasChildren && !collapsed ? 0 : 8,
      }}>
        {/* Collapse toggle */}
        {hasChildren && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, flexShrink: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text4)', padding: 0,
            }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed
              ? <ChevronRight size={14} />
              : <ChevronDown size={14} />
            }
          </button>
        )}
        {!hasChildren && <div style={{ width: 28, flexShrink: 0 }} />}

        {/* Main card body */}
        <div style={{
          flex: 1,
          background: dc.bg,
          border: `1px solid ${dc.border}`,
          borderRadius: 11,
          overflow: 'hidden',
          transition: 'box-shadow .15s, border-color .15s',
        }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = `0 4px 16px ${dc.accent}18`
            el.style.borderColor = dc.accent + '40'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.boxShadow = ''
            el.style.borderColor = dc.border
          }}
        >
          {/* Depth stripe */}
          <div style={{ height: 2, background: dc.accent }} />

          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', gap: 10 }}>
            {/* Icon */}
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: dc.accent + '16', border: `1px solid ${dc.accent}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: dc.accent,
            }}>
              {depth === 0 ? <Layers size={15} /> : <GitBranch size={15} />}
            </div>

            {/* Title + metadata */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '.88rem', fontWeight: 800, color: 'var(--text1)', marginBottom: 2 }}>
                {node.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {node.department && (
                  <span className="bx bx-teal bx-no-dot" style={{ fontSize: '.62rem' }}>
                    {node.department}
                  </span>
                )}
                {node.employee && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: '.65rem', color: 'var(--text3)', fontWeight: 600,
                  }}>
                    <User size={11} style={{ flexShrink: 0 }} />
                    {node.employee.fullName}
                    {node.employee.employeeCode && (
                      <span style={{ color: 'var(--text4)', letterSpacing: '.04em' }}>
                        ({node.employee.employeeCode})
                      </span>
                    )}
                  </span>
                )}
                {node.sortOrder !== undefined && node.sortOrder !== null && (
                  <span style={{ fontSize: '.62rem', color: 'var(--text4)' }}>
                    Order: {node.sortOrder}
                  </span>
                )}
              </div>
            </div>

            {/* Children count */}
            {hasChildren && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 20, flexShrink: 0,
                background: dc.accent + '12', border: `1px solid ${dc.accent}20`,
                fontSize: '.65rem', fontWeight: 700, color: dc.accent,
              }}>
                {node.children!.length} {node.children!.length === 1 ? 'child' : 'children'}
              </span>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              <button
                type="button"
                className="ibtn"
                title="Edit node"
                onClick={() => onEdit(node)}
                style={{ width: 30, height: 30, borderRadius: 7 }}
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                className="ibtn"
                title="Delete node"
                onClick={() => onDelete(node)}
                style={{ width: 30, height: 30, borderRadius: 7, color: 'var(--danger)' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div style={{ paddingLeft: 28, marginTop: 6, marginBottom: 8, position: 'relative' }}>
          {/* Continuous vertical line for children group */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 27,
            width: 1,
            height: '100%',
            background: CONNECTOR_COLOR,
            pointerEvents: 'none',
          }} />
          {node.children!.map((child, i) => (
            <NodeCard
              key={child.id}
              node={child}
              depth={depth + 1}
              allNodes={allNodes}
              onEdit={onEdit}
              onDelete={onDelete}
              isLast={i === node.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Node Modal ────────────────────────────────────────────────────────────────────

function NodeModal({
  open,
  onClose,
  editing,
  allNodes,
  employees,
  processing,
  data,
  setData,
  errors,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  editing: HierarchyNode | null
  allNodes: HierarchyNode[]
  employees: Employee[]
  processing: boolean
  data: NodeForm
  setData: (key: keyof NodeForm, value: string) => void
  errors: Partial<Record<keyof NodeForm, string>>
  onSubmit: (e: React.FormEvent) => void
}) {
  // Exclude self and descendants from parent options
  function getDescendantIds(nodeId: number, nodes: HierarchyNode[]): Set<number> {
    const ids = new Set<number>([nodeId])
    const queue = [nodeId]
    while (queue.length > 0) {
      const cur = queue.shift()!
      nodes.filter((n) => n.parentId === cur).forEach((n) => {
        ids.add(n.id)
        queue.push(n.id)
      })
    }
    return ids
  }

  const excluded = editing ? getDescendantIds(editing.id, allNodes) : new Set<number>()
  const parentOptions = allNodes.filter((n) => !excluded.has(n.id))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Node' : 'Add Node'}
      icon={<GitBranch size={15} />}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-p"
            disabled={processing}
            onClick={onSubmit as any}
            form="node-form"
          >
            <Save size={13} />
            {processing ? 'Saving…' : editing ? 'Update Node' : 'Add Node'}
          </button>
        </>
      }
    >
      <form id="node-form" onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="fg">
          <label>Node Title <span className="req">*</span></label>
          <input
            className="fi"
            type="text"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            placeholder="e.g. Engineering Division, HR Department"
            autoFocus
          />
          {errors.title && <span className="fg-err">{errors.title}</span>}
        </div>

        <div className="fg">
          <label>Department / Unit Name</label>
          <input
            className="fi"
            type="text"
            value={data.department}
            onChange={(e) => setData('department', e.target.value)}
            placeholder="e.g. Engineering, Human Resources"
          />
          {errors.department && <span className="fg-err">{errors.department}</span>}
          <span className="fg-hint">Optional — the functional unit this node belongs to</span>
        </div>

        <div className="g2">
          <div className="fg">
            <label>Parent Node</label>
            <select
              className="fi fi-sel"
              value={data.parentId}
              onChange={(e) => setData('parentId', e.target.value)}
            >
              <option value="">Root level (no parent)</option>
              {parentOptions.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
            {errors.parentId && <span className="fg-err">{errors.parentId}</span>}
          </div>

          <div className="fg">
            <label>Sort Order</label>
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

        <div className="fg">
          <label>Assign Employee (Head of node)</label>
          <select
            className="fi fi-sel"
            value={data.employeeId}
            onChange={(e) => setData('employeeId', e.target.value)}
          >
            <option value="">Not assigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}{emp.employeeCode ? ` (${emp.employeeCode})` : ''}
              </option>
            ))}
          </select>
          {errors.employeeId && <span className="fg-err">{errors.employeeId}</span>}
          <span className="fg-hint">Optionally assign an employee as the head of this unit</span>
        </div>
      </form>
    </Modal>
  )
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────────

function DeleteModal({
  open,
  onClose,
  node,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  node: HierarchyNode | null
  onConfirm: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Node"
      size="sm"
      icon={<Trash2 size={15} />}
      variant="danger"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <Trash2 size={13} /> Delete
          </button>
        </>
      }
    >
      <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 10 }}>
        Are you sure you want to delete <strong>{node?.title}</strong>?
      </p>
      <div className="alert alert-warn" style={{ marginBottom: 0 }}>
        <AlertTriangle size={14} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '.78rem' }}>
          All child nodes under this node may also be affected. This action cannot be undone.
        </span>
      </div>
    </Modal>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function HierarchyPage({ nodes, employees }: Props) {
  const tree = buildTree(nodes)

  const [addOpen,    setAddOpen]    = useState(false)
  const [editNode,   setEditNode]   = useState<HierarchyNode | null>(null)
  const [deleteNode, setDeleteNode] = useState<HierarchyNode | null>(null)

  const { data, setData, post, put, processing, errors, reset } = useForm<NodeForm>({
    title:      '',
    department: '',
    parentId:   '',
    employeeId: '',
    sortOrder:  '0',
  })

  const openAdd = useCallback(() => {
    reset()
    setEditNode(null)
    setAddOpen(true)
  }, [reset])

  const openEdit = useCallback((node: HierarchyNode) => {
    setData({
      title:      node.title ?? '',
      department: node.department ?? '',
      parentId:   node.parentId ? String(node.parentId) : '',
      employeeId: node.employeeId ? String(node.employeeId) : '',
      sortOrder:  node.sortOrder !== undefined ? String(node.sortOrder) : '0',
    })
    setEditNode(node)
    setAddOpen(true)
  }, [setData])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (editNode) {
      put(`/hrms/organization/hierarchy/${editNode.id}`, {
        onSuccess: () => { setAddOpen(false); setEditNode(null) },
      })
    } else {
      post('/hrms/organization/hierarchy', {
        onSuccess: () => { setAddOpen(false); reset() },
      })
    }
  }, [editNode, put, post, reset])

  const handleDelete = useCallback(() => {
    if (!deleteNode) return
    router.delete(`/hrms/organization/hierarchy/${deleteNode.id}`, {
      onSuccess: () => setDeleteNode(null),
    })
  }, [deleteNode])

  return (
    <>
      {/* ── Page Header ── */}
      <div className="ph">
        <div>
          <div className="ph-title">Organization Hierarchy</div>
          <div className="ph-sub">
            Visual tree of your organizational structure — divisions, departments, and reporting lines
          </div>
        </div>
        <div className="ph-right">
          <button className="btn btn-p" onClick={openAdd}>
            <Plus size={14} /> Add Node
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Nodes',   value: nodes.length,                                                         color: '#0D9488' },
          { label: 'Root Nodes',    value: nodes.filter((n) => !n.parentId).length,                              color: '#7C3AED' },
          { label: 'With Employee', value: nodes.filter((n) => n.employeeId !== null && n.employeeId !== undefined).length, color: '#059669' },
        ].map((s) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '.95rem', fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: '.68rem', color: 'var(--text3)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tree ── */}
      {tree.length === 0 ? (
        <div className="card">
          <div style={{
            padding: '64px 24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, var(--p-lt), var(--s-lt))',
              border: '1px solid var(--p-mid)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)',
            }}>
              <GitBranch size={30} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text1)', marginBottom: 8 }}>
                No hierarchy defined yet
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--text3)', maxWidth: 320, lineHeight: 1.65, marginBottom: 20 }}>
                Start building your organizational structure by adding the first node — typically a division or top-level department.
              </div>
              <button className="btn btn-p" onClick={openAdd}>
                <Plus size={14} /> Add First Node
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--p)', boxShadow: '0 0 0 3px var(--p-ring)', flexShrink: 0 }} />
                Organizational Tree
              </div>
              <div className="card-sub">Click the arrows to expand or collapse branches</div>
            </div>
            <button className="btn btn-outline-p btn-sm" onClick={openAdd}>
              <Plus size={13} /> Add Node
            </button>
          </div>
          <div className="card-b">
            <div style={{ paddingLeft: 8 }}>
              {tree.map((node, i) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  depth={0}
                  allNodes={nodes}
                  onEdit={openEdit}
                  onDelete={setDeleteNode}
                  isLast={i === tree.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      <NodeModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditNode(null) }}
        editing={editNode}
        allNodes={nodes}
        employees={employees}
        processing={processing}
        data={data}
        setData={(k, v) => setData(k, v)}
        errors={errors}
        onSubmit={handleSubmit}
      />

      {/* ── Delete Confirm Modal ── */}
      <DeleteModal
        open={deleteNode !== null}
        onClose={() => setDeleteNode(null)}
        node={deleteNode}
        onConfirm={handleDelete}
      />
    </>
  )
}
