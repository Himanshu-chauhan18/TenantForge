import { Users } from 'lucide-react'
import type { Org } from './types'
import { safeDate } from './data'

interface Props { org: Org }

export function UsersTab({ org }: Props) {
  return (
    <div className="card">
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-p btn-sm" disabled><Users size={12} /> Add User (coming soon)</button>
      </div>
      <div className="tw">
        <table className="dt">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Code</th><th>Phone</th><th>Status</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {(org.orgUsers || []).length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text4)', fontSize: '.82rem' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              (org.orgUsers || []).map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="av" style={{ width: 28, height: 28, fontSize: '.65rem' }}>
                        {u.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700 }}>{u.fullName}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text3)' }}>{u.companyEmail}</td>
                  <td>
                    {u.employeeCode
                      ? <span className="bx bx-gray bx-no-dot" style={{ fontFamily: 'monospace' }}>{u.employeeCode}</span>
                      : <span style={{ color: 'var(--text4)' }}>—</span>
                    }
                  </td>
                  <td style={{ color: 'var(--text3)' }}>{u.phone || '—'}</td>
                  <td>
                    <span className={`bx ${u.isActive ? 'bx-green' : 'bx-gray'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap', fontSize: '.8rem' }}>
                    {safeDate(u.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
