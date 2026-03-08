/**
 * DataTable — generic, accessible table built on TanStack React Table v8.
 *
 * Modes
 *   Server-side : pass `pagination` prop + `onPage / onSort / onPerPage` callbacks.
 *                 Data for the current page comes from the server; this component renders it.
 *   Client-side : omit `pagination`. TanStack handles sorting & pagination internally.
 *
 * Overflow / dropdown fix
 *   All floating panels (per-page, column-visibility) use `position: fixed` with
 *   viewport-relative coordinates so they escape .card { overflow: clip }.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table'
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  SlidersHorizontal, ChevronUp, ChevronDown,
} from 'lucide-react'

// ─── Public types (used by consumers) ────────────────────────────────────────

export interface DTColumn<T = any> {
  key: string
  label: string
  /** DB/sort column name sent to server (defaults to `key`) */
  sortKey?: string
  /** Cannot be hidden via column-visibility toggle */
  pinned?: boolean
  /** Hidden by default; user can show via toggle */
  defaultHidden?: boolean
  minWidth?: number
  width?: number | string
  render?: (row: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
  /** Explicit override; otherwise sortable when sortKey is set (server) or always (client) */
  sortable?: boolean
}

export interface DTPagination {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export interface DataTableProps<T = any> {
  data: T[]
  columns: DTColumn<T>[]
  rowKey: (row: T) => string | number

  // ── Server-side ─────────────────────────────────────────────────────────
  pagination?: DTPagination
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string, dir: 'asc' | 'desc') => void
  onPage?: (page: number) => void
  onPerPage?: (n: number) => void

  // ── Client-side ─────────────────────────────────────────────────────────
  clientPageSize?: number

  // ── Selection ────────────────────────────────────────────────────────────
  selected?: (string | number)[]
  onSelect?: (ids: (string | number)[]) => void

  // ── Config ───────────────────────────────────────────────────────────────
  storageKey?: string
  loading?: boolean
  perPageOptions?: number[]
  rowHighlight?: (row: T) => boolean
  emptyIcon?: React.ReactNode
  emptyTitle?: string
  emptyDesc?: string
  emptyAction?: React.ReactNode
  hideToolbar?: boolean
  hideFooter?: boolean
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: React.Dispatch<React.SetStateAction<VisibilityState>>
  /** Label used in "Showing X-Y of Z {noun}" — defaults to 'organizations' */
  noun?: string
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const DEFAULT_PP = [10, 25, 50, 100]

function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function pageRange(current: number, last: number): (number | '…')[] {
  if (last <= 1) return [1]
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  if (current > 3) out.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) out.push(i)
  if (current < last - 2) out.push('…')
  out.push(last)
  return out
}

export type { VisibilityState }

// ─── FixedDropdown ────────────────────────────────────────────────────────────
// Renders at viewport-absolute position so it escapes any overflow:clip parent.

interface FixedDropdownProps {
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
  align?: 'left' | 'right'
  minWidth?: number
  noPadding?: boolean
  children: React.ReactNode
}

export function FixedDropdown({ anchorRef, open, onClose, align = 'right', minWidth = 160, noPadding = false, children }: FixedDropdownProps) {
  const [pos, setPos] = useState<{ top: number; side: number } | null>(null)
  const [localOpen, setLocalOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (anchorRef.current) {
        const r = anchorRef.current.getBoundingClientRect()
        setPos({ top: r.bottom + 6, side: align === 'right' ? window.innerWidth - r.right : r.left })
      }
      setLocalOpen(true)
    } else {
      timerRef.current = setTimeout(() => setLocalOpen(false), 130)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [open, align, anchorRef])

  if (!localOpen || !pos) return null

  const style: React.CSSProperties = {
    position: 'fixed',
    top: pos.top,
    zIndex: 9999,
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 12,
    boxShadow: '0 10px 36px rgba(0,0,0,.15)',
    padding: noPadding ? 0 : '6px 4px',
    minWidth,
    overflow: 'hidden',
  }
  if (align === 'right') style.right = pos.side
  else style.left = pos.side

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose} />
      <div style={style} className={`fd-panel${!open ? ' fd-out' : ''}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </>
  )
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<T = any>({
  data,
  columns: colDefs,
  rowKey,
  pagination,
  sortBy: extSortBy,
  sortDir: extSortDir,
  onSort,
  onPage,
  onPerPage,
  clientPageSize = 10,
  selected,
  onSelect,
  storageKey,
  loading = false,
  perPageOptions = DEFAULT_PP,
  rowHighlight,
  emptyIcon,
  emptyTitle = 'No results found',
  emptyDesc = 'Try adjusting your filters.',
  emptyAction,
  hideToolbar = false,
  hideFooter = false,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange: onColumnVisibilityChangeProp,
  noun = 'organizations',
}: DataTableProps<T>) {
  const isServer = !!pagination
  const isColVisControlled = columnVisibilityProp !== undefined

  // ── Sort key map (TanStack column id → actual server sort key) ────────────
  const sortKeyMap = useMemo(() => {
    const m: Record<string, string> = {}
    colDefs.forEach((c) => { m[c.key] = c.sortKey ?? c.key })
    return m
  }, [colDefs])

  // ── Column visibility (persisted; or controlled externally) ───────────────
  const [internalColVis, setInternalColVis] = useState<VisibilityState>(() => {
    if (storageKey) {
      try {
        const s = localStorage.getItem(storageKey)
        if (s) return JSON.parse(s)
      } catch {}
    }
    const v: VisibilityState = {}
    colDefs.forEach((c) => { if (c.defaultHidden) v[c.key] = false })
    return v
  })
  const colVis    = isColVisControlled ? columnVisibilityProp! : internalColVis
  const setColVis = isColVisControlled ? (onColumnVisibilityChangeProp ?? setInternalColVis) : setInternalColVis
  useEffect(() => {
    if (!storageKey || isColVisControlled) return
    try { localStorage.setItem(storageKey, JSON.stringify(internalColVis)) } catch {}
  }, [internalColVis, storageKey, isColVisControlled])

  // ── Sorting state ─────────────────────────────────────────────────────────
  const initSorting = (): SortingState => {
    if (!extSortBy) return []
    const col = colDefs.find((c) => (c.sortKey ?? c.key) === extSortBy)
    return [{ id: col?.key ?? extSortBy, desc: extSortDir === 'desc' }]
  }
  const [sorting, setSorting] = useState<SortingState>(initSorting)

  // Keep sorting in sync when URL params change
  useEffect(() => {
    if (!isServer) return
    const col = colDefs.find((c) => (c.sortKey ?? c.key) === extSortBy)
    setSorting(extSortBy ? [{ id: col?.key ?? extSortBy, desc: extSortDir === 'desc' }] : [])
  }, [extSortBy, extSortDir]) // eslint-disable-line

  // ── Row selection ─────────────────────────────────────────────────────────
  const controlled = selected !== undefined && onSelect !== undefined
  const [intSel, setIntSel] = useState<RowSelectionState>({})

  const rowSel: RowSelectionState = controlled
    ? Object.fromEntries((selected ?? []).map((id) => [String(id), true]))
    : intSel

  function handleSelChange(updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) {
    const next = typeof updater === 'function' ? updater(rowSel) : updater
    if (controlled) {
      const ids = Object.keys(next).filter((k) => next[k])
      // Preserve original type (number vs string)
      const sample = data.length ? rowKey(data[0]) : ''
      onSelect!(typeof sample === 'number' ? ids.map(Number) : ids)
    } else {
      setIntSel(next)
    }
  }

  // ── Pagination state ──────────────────────────────────────────────────────
  const [clientPag, setClientPag] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: clientPageSize,
  })

  const pagState: PaginationState = isServer
    ? { pageIndex: Math.max(0, safeNum(pagination?.currentPage, 1) - 1), pageSize: safeNum(pagination?.perPage, 10) }
    : clientPag

  // ── TanStack column definitions ───────────────────────────────────────────
  const tanCols = useMemo<ColumnDef<T, any>[]>(() => [
    // Checkbox column — only when selection is enabled
    ...(controlled ? [{
      id: '__sel__',
      enableSorting: false,
      enableHiding: false,
      size: 40,
      header: ({ table }: any) => (
        <input
          type="checkbox"
          className="ck"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el: HTMLInputElement | null) => { if (el) el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected() }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }: any) => (
        <input
          type="checkbox"
          className="ck"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    } as ColumnDef<T, any>] : []),
    // Data columns
    ...colDefs.map((col): ColumnDef<T, any> => ({
      id: col.key,
      accessorKey: col.key,
      enableSorting: col.sortable !== false,
      enableHiding: !col.pinned,
      size: typeof col.width === 'number' ? col.width : undefined,
      minSize: col.minWidth,
      header: col.label,
      cell: col.render
        ? ({ row }) => col.render!(row.original, row.index)
        : ({ row }) => String((row.original as any)[col.key] ?? '—'),
    })),
  ], [colDefs])

  // ── Table instance ────────────────────────────────────────────────────────
  const table = useReactTable<T>({
    data,
    columns: tanCols,
    state: {
      sorting,
      pagination: pagState,
      columnVisibility: colVis,
      rowSelection: rowSel,
    },
    getRowId: (row) => String(rowKey(row)),
    enableRowSelection: true,
    manualPagination: isServer,
    manualSorting: isServer,
    rowCount: isServer ? safeNum(pagination?.total) : undefined,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(next)
      if (isServer) {
        if (next.length > 0) {
          const { id, desc } = next[0]
          onSort?.(sortKeyMap[id] ?? id, desc ? 'desc' : 'asc')
        } else {
          onSort?.('created_at', 'desc')
        }
      }
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagState) : updater
      if (isServer) {
        if (next.pageSize !== pagState.pageSize) {
          onPerPage?.(next.pageSize)
        } else {
          onPage?.(next.pageIndex + 1)
        }
      } else {
        setClientPag(next)
      }
    },
    onColumnVisibilityChange: setColVis,
    onRowSelectionChange: handleSelChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // ── Derived pagination display values ─────────────────────────────────────
  const totalRows = isServer ? safeNum(pagination?.total) : data.length
  const perPage   = pagState.pageSize
  const curPage   = pagState.pageIndex + 1
  // Compute lastPage: prefer explicit value, fall back to computing from total/perPage
  const lastPage  = isServer
    ? (safeNum(pagination?.lastPage) || Math.max(1, Math.ceil(safeNum(pagination?.total) / Math.max(1, perPage))))
    : Math.max(1, table.getPageCount())
  const startRow  = totalRows === 0 ? 0 : (curPage - 1) * perPage + 1
  const endRow    = Math.min(curPage * perPage, totalRows)
  const pages     = pageRange(curPage, lastPage)

  // ── Floating dropdown state ───────────────────────────────────────────────
  const [ppOpen, setPpOpen]       = useState(false)
  const [colVisOpen, setColVisOpen] = useState(false)
  const ppBtnRef     = useRef<HTMLButtonElement>(null)
  const colVisBtnRef = useRef<HTMLButtonElement>(null)

  // ── Visible header groups & rows ─────────────────────────────────────────
  const headerGroups = table.getHeaderGroups()
  const rows = table.getRowModel().rows

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={`dt-wrap${loading ? ' dt-loading' : ''}`}>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      {!hideToolbar && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, padding: '8px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          {/* Left: Column-visibility trigger */}
          <div>
            {colDefs.some((c) => !c.pinned) && (
              <button
                ref={colVisBtnRef}
                type="button"
                onClick={() => setColVisOpen((v) => !v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  height: 32, padding: '0 12px', borderRadius: 8,
                  border: `1px solid ${colVisOpen ? 'var(--p)' : 'var(--border)'}`,
                  background: colVisOpen ? 'var(--p-lt)' : 'var(--surface)',
                  color: colVisOpen ? 'var(--p)' : 'var(--text2)',
                  fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--t)',
                }}
              >
                <SlidersHorizontal size={13} />
                Columns
              </button>
            )}
          </div>

          {/* Right: Per-page trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 500 }}>Per page:</span>
            <button
              ref={ppBtnRef}
              type="button"
              onClick={() => setPpOpen((v) => !v)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                height: 32, padding: '0 10px', borderRadius: 8,
                border: `1px solid ${ppOpen ? 'var(--p)' : 'var(--border)'}`,
                background: ppOpen ? 'var(--p-lt)' : 'var(--surface)',
                color: ppOpen ? 'var(--p)' : 'var(--text2)',
                fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--t)',
              }}
            >
              {perPage}
              <ChevronDown size={12} style={{ color: 'var(--text3)', transform: ppOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
          </div>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="tw" style={{ flex: 1 }}>
        <table className="dt">
          <thead>
            {headerGroups.map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const col = colDefs.find((c) => c.key === header.id)
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      style={{
                        width: header.id === '__sel__' ? 40 : col?.width,
                        minWidth: col?.minWidth,
                        textAlign: col?.align ?? 'left',
                        cursor: canSort ? 'pointer' : undefined,
                        userSelect: canSort ? 'none' : undefined,
                        paddingRight: header.id === '__sel__' ? 4 : undefined,
                      }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      {header.isPlaceholder ? null : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span style={{
                              display: 'inline-flex', flexDirection: 'column',
                              opacity: sorted ? 1 : 0.25, marginLeft: 2,
                            }}>
                              <ChevronUp size={9} style={{ color: sorted === 'asc' ? 'var(--p)' : undefined, marginBottom: -2 }} />
                              <ChevronDown size={9} style={{ color: sorted === 'desc' ? 'var(--p)' : undefined }} />
                            </span>
                          )}
                        </span>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk${i}`} className="dt-skeleton">
                  {headerGroups[0]?.headers.map((h) => (
                    <td key={h.id} style={{ padding: '13px 14px' }}>&nbsp;</td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headerGroups[0]?.headers.length ?? 1}
                  style={{ textAlign: 'center', padding: '60px 16px' }}
                >
                  {emptyIcon && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      {emptyIcon}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, color: 'var(--text3)', fontSize: '.9rem', marginBottom: 6 }}>
                    {emptyTitle}
                  </div>
                  {emptyDesc && (
                    <div style={{ fontSize: '.8rem', color: 'var(--text4)', marginBottom: emptyAction ? 16 : 0 }}>
                      {emptyDesc}
                    </div>
                  )}
                  {emptyAction && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {emptyAction}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const highlighted = rowHighlight?.(row.original)
                return (
                  <tr
                    key={row.id}
                    style={{
                      background: row.getIsSelected()
                        ? 'var(--p-lt)'
                        : highlighted
                        ? 'var(--warn-lt)'
                        : undefined,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const col = colDefs.find((c) => c.key === cell.column.id)
                      return (
                        <td
                          key={cell.id}
                          className={col?.className}
                          style={{
                            textAlign: col?.align ?? 'left',
                            minWidth: col?.minWidth,
                            paddingRight: cell.column.id === '__sel__' ? 4 : undefined,
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      {!hideFooter && <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderTop: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 8, flexShrink: 0,
      }}>
        {/* Left: count + page info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            fontSize: '.73rem', color: 'var(--text3)',
            background: 'var(--bg2)', borderRadius: 7, padding: '4px 10px',
            border: '1px solid var(--border)',
          }}>
            {totalRows === 0 ? (
              'No results'
            ) : (
              <>
                Showing{' '}
                <strong style={{ color: 'var(--p)' }}>{startRow}-{endRow}</strong>
                {' '}of{' '}
                <strong style={{ color: 'var(--text1)' }}>{totalRows.toLocaleString()}</strong>
                {' '}{noun}
              </>
            )}
          </div>
          {lastPage > 1 && (
            <span style={{
              fontSize: '.72rem', color: 'var(--text3)',
              background: 'var(--bg2)', borderRadius: 7, padding: '4px 10px',
              border: '1px solid var(--border)',
            }}>
              Page <strong style={{ color: 'var(--text2)' }}>{curPage}</strong> of <strong style={{ color: 'var(--text2)' }}>{lastPage}</strong>
            </span>
          )}
        </div>

        {/* Right: pagination buttons — always visible so user can see nav state */}
        <div className="pg">
          <button
            className="pgb"
            disabled={curPage <= 1}
            onClick={() => isServer ? onPage?.(1) : table.setPageIndex(0)}
          >
            <ChevronsLeft size={11} /> First
          </button>
          <button
            className="pgb"
            disabled={curPage <= 1}
            onClick={() => isServer ? onPage?.(curPage - 1) : table.previousPage()}
          >
            <ChevronLeft size={11} /> Prev
          </button>

          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} style={{ padding: '0 3px', color: 'var(--text3)', fontSize: '.75rem', lineHeight: '30px' }}>…</span>
            ) : (
              <button
                key={p}
                className={`pgb${p === curPage ? ' on' : ''}`}
                onClick={() => isServer ? onPage?.(p as number) : table.setPageIndex((p as number) - 1)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="pgb"
            disabled={curPage >= lastPage}
            onClick={() => isServer ? onPage?.(curPage + 1) : table.nextPage()}
          >
            Next <ChevronRight size={11} />
          </button>
          <button
            className="pgb"
            disabled={curPage >= lastPage}
            onClick={() => isServer ? onPage?.(lastPage) : table.setPageIndex(lastPage - 1)}
          >
            Last <ChevronsRight size={11} />
          </button>
        </div>
      </div>}

      {/* ── Per-page dropdown (fixed) ─────────────────────────────────────── */}
      <FixedDropdown anchorRef={ppBtnRef} open={ppOpen} onClose={() => setPpOpen(false)} minWidth={140} align="right">
        <div style={{ padding: '8px 12px 6px', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
          Rows per page
        </div>
        {perPageOptions.map((n) => {
          const active = n === perPage
          return (
            <button
              key={n}
              className="drop-item"
              style={{ color: active ? 'var(--p)' : undefined, fontWeight: active ? 700 : undefined, padding: '7px 12px' }}
              onClick={() => {
                setPpOpen(false)
                if (isServer) {
                  onPerPage?.(n)
                } else {
                  table.setPageSize(n)
                }
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: `1.5px solid ${active ? 'var(--p)' : 'var(--border2)'}`,
                background: active ? 'var(--p)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s, border-color .15s',
              }}>
                {active && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </span>
              {n} rows
            </button>
          )
        })}
      </FixedDropdown>

      {/* ── Column visibility dropdown (fixed) ───────────────────────────── */}
      <FixedDropdown anchorRef={colVisBtnRef} open={colVisOpen} onClose={() => setColVisOpen(false)} minWidth={192} align="left">
        <div style={{ padding: '8px 12px 6px', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text3)', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
          Toggle columns
        </div>
        {table.getAllLeafColumns()
          .filter((col) => col.id !== '__sel__' && col.getCanHide())
          .map((col) => {
            const on = col.getIsVisible()
            return (
              <button
                key={col.id}
                className="drop-item"
                onClick={() => col.toggleVisibility()}
                style={{ padding: '7px 12px' }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${on ? 'var(--p)' : 'var(--border2)'}`,
                  background: on ? 'var(--p)' : 'transparent',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background .15s, border-color .15s',
                }}>
                  {on && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                </span>
                {String(col.columnDef.header ?? col.id)}
              </button>
            )
          })}
      </FixedDropdown>
    </div>
  )
}
