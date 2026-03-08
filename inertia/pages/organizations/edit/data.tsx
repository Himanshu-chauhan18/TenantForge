// ─── Static data, helpers, and column definitions for the Edit page ──────────

import { type DTColumn } from '~/components/data-table'
import type { BillingRecord, FiscalYear } from './types'

// ── Date helper ───────────────────────────────────────────────────────────────

export function safeDate(val: string | null | undefined): string {
  if (!val) return '—'
  const s = val.includes('T') ? val : val + 'T00:00:00'
  const d = new Date(s)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Avatar helpers ────────────────────────────────────────────────────────────

export const AV_COLORS: [string, string][] = [
  ['#6366f1', '#e0e7ff'], ['#0ea5e9', '#e0f2fe'], ['#10b981', '#d1fae5'],
  ['#f59e0b', '#fef3c7'], ['#ef4444', '#fee2e2'], ['#8b5cf6', '#ede9fe'],
  ['#ec4899', '#fce7f3'],
]

export function avColor(name: string): [string, string] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AV_COLORS[h % AV_COLORS.length]
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// ── Tab definitions ───────────────────────────────────────────────────────────

export const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'plan',     label: 'Plan & Billing' },
  { key: 'users',    label: 'Users & Access' },
  { key: 'modules',  label: 'Modules & Add-ons' },
  { key: 'fiscal',   label: 'Fiscal Years' },
]

// ── Billing History columns ───────────────────────────────────────────────────

export const billingColumns: DTColumn<BillingRecord>[] = [
  {
    key: 'period',
    label: 'Period',
    pinned: true,
    render: (r) => <span style={{ fontSize: '.84rem', fontWeight: 600 }}>{r.period}</span>,
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (r) => <span style={{ fontSize: '.84rem', fontWeight: 700 }}>{r.amount}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (r) => <span className="bx bx-green">{r.status}</span>,
  },
]

// ── Fiscal Year columns ───────────────────────────────────────────────────────

export const fiscalColumns: DTColumn<FiscalYear>[] = [
  {
    key: 'name',
    label: 'Name',
    pinned: true,
    render: (fy) => <span style={{ fontWeight: 600, fontSize: '.84rem' }}>{fy.name}</span>,
  },
  {
    key: 'startDate',
    label: 'Start Date',
    render: (fy) => <span style={{ color: 'var(--text2)', fontSize: '.82rem' }}>{safeDate(fy.startDate)}</span>,
  },
  {
    key: 'endDate',
    label: 'End Date',
    render: (fy) => <span style={{ color: 'var(--text2)', fontSize: '.82rem' }}>{safeDate(fy.endDate)}</span>,
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (fy) => (
      <span className={`bx ${fy.isActive ? 'bx-green' : 'bx-gray'}`}>
        {fy.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]
