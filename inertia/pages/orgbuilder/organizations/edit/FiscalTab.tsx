import { DataTable } from '~/components/data-table'
import type { Org } from './types'
import { fiscalColumns } from './data'

interface Props { org: Org }

export function FiscalTab({ org }: Props) {
  return (
    <div className="card">
      <DataTable
        data={org.fiscalYears || []}
        columns={fiscalColumns}
        rowKey={(fy) => fy.id}
        hideToolbar
        emptyTitle="No Fiscal Years"
        emptyDesc="No fiscal years configured."
        clientPageSize={10}
      />
    </div>
  )
}
