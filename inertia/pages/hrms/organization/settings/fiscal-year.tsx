import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { DataTable } from '~/components/data-table'
import type { DTColumn, VisibilityState } from '~/components/data-table'

const COLS_KEY = 'hrms-fiscal-year-cols-v1'

interface FiscalYear {
  id: number
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
}

interface Props {
  fiscalYears: FiscalYear[]
}

function fmtDate(raw: string | null): string {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function calcDuration(start: string, end: string): string {
  if (!start || !end) return '—'
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '—'
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1
  if (months <= 0) return '—'
  return months >= 12 && months % 12 === 0 ? `${months / 12} yr` : `${months} mo`
}

const COLUMNS: DTColumn<FiscalYear>[] = [
  {
    key: 'name',
    label: 'Fiscal Year',
    pinned: true,
    minWidth: 200,
    render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: row.isActive ? 'var(--p-lt)' : 'var(--bg2)',
          border: `1px solid ${row.isActive ? 'var(--p-mid)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CalendarDays size={15} style={{ color: row.isActive ? 'var(--p)' : 'var(--text4)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)', lineHeight: 1.3 }}>{row.name}</div>
          <div style={{ fontSize: '.7rem', color: 'var(--text3)' }}>{calcDuration(row.startDate, row.endDate)}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'startDate',
    label: 'Start Date',
    render: (row) => (
      <span style={{ fontSize: '.8rem', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmtDate(row.startDate)}</span>
    ),
  },
  {
    key: 'endDate',
    label: 'End Date',
    render: (row) => (
      <span style={{ fontSize: '.8rem', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmtDate(row.endDate)}</span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    render: (row) => (
      <span className={`bdg ${row.isActive ? 'bdg-green' : 'bdg-gray'}`}>
        <span className="bdg-dot" />
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created',
    defaultHidden: true,
    render: (row) => (
      <span style={{ fontSize: '.8rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{fmtDate(row.createdAt)}</span>
    ),
  },
]

export default function FiscalYearPage({ fiscalYears }: Props) {
  const [colVis, setColVis] = useState<VisibilityState>({})

  return (
    <>
      <div className="ph">
        <div>
          <div className="ph-title">Fiscal Years</div>
          <div className="ph-sub">Fiscal year periods configured for your organization</div>
        </div>
      </div>

      <div className="card">
        <DataTable<FiscalYear>
          data={fiscalYears}
          columns={COLUMNS}
          rowKey={(r) => r.id}
          clientPageSize={25}
          storageKey={COLS_KEY}
          noun="fiscal year"
          columnVisibility={colVis}
          onColumnVisibilityChange={setColVis}
          emptyIcon={<CalendarDays size={38} style={{ opacity: .18, color: 'var(--text3)' }} />}
          emptyTitle="No fiscal years found"
          emptyDesc="No fiscal year records have been configured for this organization."
        />
      </div>
    </>
  )
}
