import { Link } from '@inertiajs/react'
import {
  Building2, Users, TrendingUp, TrendingDown, Archive,
  CreditCard, Clock, AlertTriangle, CheckCircle, XCircle,
  BarChart2, Activity,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'

interface DashStats {
  total: number
  subscribed: number
  unsubscribed: number
  archived: number
  trialActive: number
  trialExpired: number
  premiumActive: number
  premiumExpired: number
  nearExpiry: number
  totalUsers: number
  monthlyData: { month: string; count: number }[]
  recentOrgs: any[]
}

interface DashboardProps {
  stats: DashStats
}

function StatCard({
  label, value, sub, stripe, ico, icoColor, foot,
  href,
}: {
  label: string
  value: number | string
  sub?: string
  stripe: string
  ico: React.ReactNode
  icoColor: string
  foot?: { label: string; value: number | string }[]
  href?: string
}) {
  const inner = (
    <div className="scard">
      <div className={`scard-stripe ${stripe}`} />
      <div className="scard-h">
        <div className={`scard-ico ${icoColor}`}>{ico}</div>
      </div>
      <div className="scard-val">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="scard-lbl">{label}</div>
      {sub && <div style={{ fontSize: '.68rem', color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
      {foot && (
        <div className="scard-foot">
          {foot.map((f) => (
            <div key={f.label} className="scard-fi">
              <div className="scard-fv">{typeof f.value === 'number' ? f.value.toLocaleString() : f.value}</div>
              <div className="scard-fl">{f.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (href) return <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>{inner}</Link>
  return inner
}

const COLORS = ['#0D9488', '#059669', '#D97706', '#DC2626']

export default function Dashboard({ stats }: DashboardProps) {
  const pieData = [
    { name: 'Trial Active', value: stats.trialActive },
    { name: 'Premium Active', value: stats.premiumActive },
    { name: 'Trial Expired', value: stats.trialExpired },
    { name: 'Premium Expired', value: stats.premiumExpired },
  ].filter((d) => d.value > 0)

  const monthlyChartData = stats.monthlyData.map((d) => ({
    month: d.month,
    Orgs: Number(d.count),
  }))

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      {/* Page header */}
      <div className="ph">
        <div>
          <div className="ph-title">Dashboard</div>
          <div className="ph-sub">{today}</div>
        </div>
        <div className="ph-right">
          <Link href="/organizations/create" className="btn btn-p">
            <Building2 size={15} />
            Add Organization
          </Link>
        </div>
      </div>

      {/* Near-expiry alert */}
      {stats.nearExpiry > 0 && (
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>
          <AlertTriangle size={15} />
          <strong>{stats.nearExpiry}</strong> organization{stats.nearExpiry !== 1 ? 's' : ''} expiring within 7 days.
          <Link href="/organizations?status=active" style={{ marginLeft: 8, fontWeight: 700, color: 'var(--warn)', textDecoration: 'underline' }}>View all</Link>
        </div>
      )}

      {/* Row 1 – Overview */}
      <div className="stats-g">
        <StatCard
          label="Total Organizations"
          value={stats.total}
          stripe="teal"
          ico={<Building2 size={16} />}
          icoColor="teal"
          href="/organizations"
          foot={[
            { label: 'Subscribed', value: stats.subscribed },
            { label: 'Unsubscribed', value: stats.unsubscribed },
          ]}
        />
        <StatCard
          label="Active Subscriptions"
          value={stats.subscribed}
          stripe="emerald"
          ico={<CheckCircle size={16} />}
          icoColor="emerald"
          href="/organizations?tab=paid"
        />
        <StatCard
          label="Unsubscribed"
          value={stats.unsubscribed}
          stripe="amber"
          ico={<XCircle size={16} />}
          icoColor="amber"
          href="/organizations?tab=unsubscribed"
        />
        <StatCard
          label="Archived"
          value={stats.archived}
          stripe="purple"
          ico={<Archive size={16} />}
          icoColor="purple"
          href="/organizations?tab=archived"
          foot={[
            { label: 'Total', value: stats.archived },
          ]}
        />
      </div>

      {/* Row 2 – Trial vs Premium */}
      <div className="stats-g">
        <StatCard
          label="Trial Organizations"
          value={stats.trialActive}
          sub="Currently active"
          stripe="sky"
          ico={<Clock size={16} />}
          icoColor="sky"
          href="/organizations?tab=trial"
          foot={[
            { label: 'Active', value: stats.trialActive },
            { label: 'Expired', value: stats.trialExpired },
          ]}
        />
        <StatCard
          label="Premium Organizations"
          value={stats.premiumActive}
          sub="Currently active"
          stripe="teal"
          ico={<CreditCard size={16} />}
          icoColor="teal"
          href="/organizations?tab=paid"
          foot={[
            { label: 'Active', value: stats.premiumActive },
            { label: 'Expired', value: stats.premiumExpired },
          ]}
        />
        <StatCard
          label="Near Expiry"
          value={stats.nearExpiry}
          sub="Expiring in ≤ 7 days"
          stripe="rose"
          ico={<AlertTriangle size={16} />}
          icoColor="rose"
          href="/organizations?near_expiry=1"
        />
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          sub="Across all organizations"
          stripe="emerald"
          ico={<Users size={16} />}
          icoColor="emerald"
        />
      </div>

      {/* Charts row */}
      <div className="g2" style={{ marginBottom: 20 }}>
        {/* Line chart */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-title">Organization Growth</div>
              <div className="card-sub">Monthly registrations (last 12 months)</div>
            </div>
            <BarChart2 size={16} style={{ color: 'var(--text3)' }} />
          </div>
          <div className="card-b">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text3)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="Orgs" stroke="#0D9488" strokeWidth={2.5} dot={{ fill: '#0D9488', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)', fontSize: '.82rem' }}>
                No data yet. Add your first organization to see growth charts.
              </div>
            )}
          </div>
        </div>

        {/* Donut chart */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-title">Plan Distribution</div>
              <div className="card-sub">Organizations by plan type & status</div>
            </div>
            <Activity size={16} style={{ color: 'var(--text3)' }} />
          </div>
          <div className="card-b">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)', fontSize: '.82rem' }}>
                No organizations yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Organizations */}
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-title">Recent Organizations</div>
            <div className="card-sub">Latest 10 added organizations</div>
          </div>
          <Link href="/organizations" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        <div className="tw">
          <table className="dt">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Users</th>
                <th>Lead Owner</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text4)', padding: '28px 14px' }}>
                    No organizations yet.{' '}
                    <Link href="/organizations/create" style={{ color: 'var(--p)', fontWeight: 700 }}>Add your first →</Link>
                  </td>
                </tr>
              ) : (
                stats.recentOrgs.map((org: any) => (
                  <tr key={org.id}>
                    <td>
                      <Link href={`/organizations/${org.id}`} className="org-r" style={{ display: 'flex' }}>
                        <div className="org-av">{org.name.slice(0, 2).toUpperCase()}</div>
                        <div>
                          <div className="org-n">{org.name}</div>
                          <div className="org-d">{org.org_id}</div>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span className={`bx ${org.plan_type === 'premium' ? 'bx-teal' : 'bx-sky'}`}>
                        {org.plan_type === 'premium' ? 'Premium' : 'Trial'}
                      </span>
                    </td>
                    <td>
                      <span className={`bx ${org.status === 'active' ? 'bx-green' : org.status === 'expired' ? 'bx-red' : 'bx-gray'}`}>
                        {org.status}
                      </span>
                    </td>
                    <td>{org.user_limit} max</td>
                    <td style={{ color: 'var(--text3)' }}>
                      {org.lead_owner?.full_name || org.lead_owner?.email || '—'}
                    </td>
                    <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {org.created_at ? new Date(org.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
