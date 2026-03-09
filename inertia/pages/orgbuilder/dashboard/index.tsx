import { useState, useMemo } from 'react'
import { DateTime } from 'luxon'
import { Link, usePage, router } from '@inertiajs/react'
import {
  Building2, Users, CreditCard, Clock, AlertTriangle, Archive,
  UserCheck, BarChart2, Activity, TrendingUp, TrendingDown,
  XCircle, ChevronRight, Zap, Sparkles, RefreshCw,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Label,
} from 'recharts'

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashStats {
  total: number
  paidOrgs: number
  trialOrgs: number
  paidActive: number
  paidExpired: number
  paidNearExpiry: number
  trialActive: number
  trialExpired: number
  trialNearExpiry: number
  nearExpiry: number
  inactive: number
  archived: number
  archivedPaid: number
  archivedTrial: number
  totalUsers: number
  avgUsersPerOrg: number
  totalGrowth: number
  paidGrowth: number
  trialGrowth: number
  usersGrowth: number
  monthlyData: { month: string; paid: number; trial: number; total: number }[]
  recentOrgs: any[]
}

// ── StatCard ───────────────────────────────────────────────────────────────────

function StatCard({
  label, value, accentColor, ico, growth, foot, href, progressPct, progressColor,
}: {
  label: string
  value: number | string
  accentColor: string
  ico: React.ReactNode
  growth?: number
  foot?: { label: string; value: number | string; color?: string }[]
  href?: string
  progressPct?: number
  progressColor?: string
}) {
  const inner = (
    <div style={{
      background: `linear-gradient(145deg, var(--surface) 0%, ${accentColor}09 100%)`,
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      padding: '16px 18px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform .15s, box-shadow .15s, border-color .15s',
      cursor: href ? 'pointer' : 'default',
      height: '100%',
    }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = `0 8px 28px ${accentColor}20`
        el.style.borderColor = accentColor + '60'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = ''
        el.style.boxShadow = ''
        el.style.borderColor = accentColor + '22'
      }}
    >
      {/* Top accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor, borderRadius: '14px 14px 0 0' }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6, marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accentColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, flexShrink: 0 }}>
          {ico}
        </div>
        {growth !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: '.68rem', fontWeight: 700,
            padding: '3px 8px', borderRadius: 20,
            background: growth >= 0 ? 'rgba(5,150,105,.1)' : 'rgba(220,38,38,.1)',
            color: growth >= 0 ? '#059669' : '#DC2626',
          }}>
            {growth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {growth >= 0 ? '+' : ''}{growth}%
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ fontFamily: 'var(--fd)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text1)', lineHeight: 1, marginBottom: 4 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: '.73rem', fontWeight: 600, color: 'var(--text2)' }}>{label}</div>

      {/* Progress bar */}
      {progressPct !== undefined && (
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 4, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(progressPct, 100)}%`, background: progressColor || accentColor, borderRadius: 4, transition: 'width .5s ease' }} />
          </div>
        </div>
      )}

      {/* Footer */}
      {foot && (
        <div style={{ display: 'flex', gap: 0, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          {foot.map((f, i) => (
            <div key={f.label} style={{ flex: 1, textAlign: 'center', borderRight: i < foot.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: '.82rem', fontWeight: 800, color: f.color || 'var(--text1)' }}>
                {typeof f.value === 'number' ? f.value.toLocaleString() : f.value}
              </div>
              <div style={{ fontSize: '.62rem', color: 'var(--text3)', marginTop: 1 }}>{f.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (href) return <Link href={href} style={{ display: 'block', textDecoration: 'none', height: '100%' }}>{inner}</Link>
  return inner
}

// ── QuickAction ────────────────────────────────────────────────────────────────

function QuickAction({ label, desc, ico, accent, href }: {
  label: string; desc: string; ico: React.ReactNode; accent: string; href?: string
}) {
  const style: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
    transition: 'transform .15s, box-shadow .15s, border-color .15s',
    cursor: 'pointer',
  }
  const enter = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement
    el.style.transform = 'translateY(-2px)'
    el.style.boxShadow = '0 6px 20px rgba(0,0,0,.08)'
    el.style.borderColor = accent + '80'
  }
  const leave = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement
    el.style.transform = ''
    el.style.boxShadow = ''
    el.style.borderColor = 'var(--border)'
  }

  const inner = (
    <>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `linear-gradient(135deg, ${accent}25, ${accent}12)`,
        border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent, flexShrink: 0,
      }}>
        {ico}
      </div>
      <div>
        <div style={{ fontSize: '.83rem', fontWeight: 700, color: 'var(--text1)', lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: '.67rem', color: 'var(--text3)', marginTop: 2 }}>{desc}</div>
      </div>
    </>
  )

  if (href) return <Link href={href} style={style} onMouseEnter={enter} onMouseLeave={leave}>{inner}</Link>
  return <div style={style} onMouseEnter={enter} onMouseLeave={leave}>{inner}</div>
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '.78rem', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
      <div style={{ fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text3)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: 'var(--text1)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Dashboard({ stats }: { stats: DashStats }) {
  const { props: shared } = usePage<any>()
  const user = (shared as any)?.user
  const [chartView, setChartView] = useState<'monthly' | 'quarterly'>('monthly')
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    setRefreshing(true)
    router.reload({ onFinish: () => setRefreshing(false) })
  }

  const greeting = (() => {
    const h = DateTime.now().hour
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const dateStr = DateTime.now().setLocale('en-IN').toLocaleString({
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const quarterlyData = useMemo(() => {
    const data = stats.monthlyData || []
    const result: { month: string; paid: number; trial: number; total: number }[] = []
    for (let i = 0; i < data.length; i += 3) {
      const slice = data.slice(i, Math.min(i + 3, data.length))
      result.push({
        month: `Q${Math.floor(i / 3) + 1}`,
        paid:  slice.reduce((s, d) => s + d.paid, 0),
        trial: slice.reduce((s, d) => s + d.trial, 0),
        total: slice.reduce((s, d) => s + d.total, 0),
      })
    }
    return result
  }, [stats.monthlyData])

  const chartData = chartView === 'monthly' ? (stats.monthlyData || []) : quarterlyData

  const pieData = [
    { name: 'Active Paid',  value: stats.paidActive  || 0, color: '#0D9488' },
    { name: 'Trial Active', value: stats.trialActive || 0, color: '#059669' },
    { name: 'Expired',      value: (stats.paidExpired || 0) + (stats.trialExpired || 0), color: '#EF4444' },
    { name: 'Unsubscribed', value: stats.inactive || 0, color: '#8b95a1' },
  ].filter((d) => d.value > 0)
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0)
  const recentOrgs = stats.recentOrgs || []

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {greeting}, {user?.fullName?.split(' ')[0] || 'Admin'} 👋
          </div>
          <div style={{ fontSize: '.76rem', color: 'var(--text3)', marginTop: 5 }}>
            Overview of your organizations — {dateStr}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-ghost btn-sm"
          style={{ gap: 6, borderRadius: 10, opacity: refreshing ? .6 : 1 }}
          title="Refresh dashboard"
        >
          <RefreshCw size={13} style={{ transition: 'transform .5s', transform: refreshing ? 'rotate(360deg)' : 'none' }} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Near-expiry alert ── */}
      {(stats.nearExpiry || 0) > 0 && (
        <div className="alert alert-warn" style={{ marginBottom: 18 }}>
          <AlertTriangle size={15} />
          <strong>{stats.nearExpiry}</strong> organization{stats.nearExpiry !== 1 ? 's' : ''} expiring within 7 days.{' '}
          <Link href="/orgbuilder/organizations?near_expiry=1" style={{ fontWeight: 700, color: 'var(--warn)', textDecoration: 'underline', marginLeft: 4 }}>
            View all
          </Link>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="g4" style={{ marginBottom: 18 }}>
        <QuickAction label="Add Organization" desc="Onboard new client"    ico={<Building2 size={17} />} accent="#0D9488" href="/orgbuilder/organizations/create" />
        <QuickAction label="Extend Plan"       desc="Manage subscriptions" ico={<CreditCard size={17} />} accent="#7C3AED" href="/orgbuilder/organizations" />
        <QuickAction label="Assign Lead"       desc="Route to owner"       ico={<UserCheck size={17} />}  accent="#0284C7" href="/orgbuilder/leads" />
        <QuickAction label="View Analytics"    desc="Charts & insights"    ico={<BarChart2 size={17} />}  accent="#D97706" href="/orgbuilder/organizations" />
      </div>

      {/* ── Stats Row 1 (4 cards) ── */}
      <div className="stats-g" style={{ marginBottom: 14 }}>
        <StatCard
          label="Total Organizations"
          value={stats.total || 0}
          accentColor="#0D9488"
          ico={<Building2 size={17} />}
          growth={stats.totalGrowth}
          href="/orgbuilder/organizations"
          foot={[
            { label: 'Subscribed',   value: stats.paidOrgs || 0,  color: '#0D9488' },
            { label: 'Unsubscribed', value: stats.inactive || 0, color: '#8b95a1' },
          ]}
        />
        <StatCard
          label="Paid Organizations"
          value={stats.paidOrgs || 0}
          accentColor="#059669"
          ico={<CreditCard size={17} />}
          growth={stats.paidGrowth}
          href="/orgbuilder/organizations?tab=paid"
          foot={[
            { label: 'Active',   value: stats.paidActive    || 0, color: '#059669' },
            { label: 'Expired',  value: stats.paidExpired   || 0, color: '#EF4444' },
            { label: 'Near Exp', value: stats.paidNearExpiry || 0, color: '#D97706' },
          ]}
        />
        <StatCard
          label="Trial Organizations"
          value={stats.trialOrgs || 0}
          accentColor="#F59E0B"
          ico={<Clock size={17} />}
          growth={stats.trialGrowth}
          href="/orgbuilder/organizations?tab=trial"
          foot={[
            { label: 'Active',   value: stats.trialActive    || 0, color: '#059669' },
            { label: 'Expired',  value: stats.trialExpired   || 0, color: '#EF4444' },
            { label: 'Near Exp', value: stats.trialNearExpiry || 0, color: '#D97706' },
          ]}
        />
        <StatCard
          label="Total Users"
          value={stats.totalUsers || 0}
          accentColor="#7C3AED"
          ico={<Users size={17} />}
          growth={stats.usersGrowth}
          foot={[
            { label: 'Avg/Org', value: stats.avgUsersPerOrg || 0 },
          ]}
        />
      </div>

      {/* ── Compact Secondary Stats ── */}
      <div style={{ marginBottom: 22, overflow: 'hidden', borderRadius: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {(() => {
          const nearExpiryPct  = stats.total ? Math.round(((stats.nearExpiry  || 0) / stats.total) * 100) : 0
          const inactivePct    = stats.total ? Math.round(((stats.inactive    || 0) / stats.total) * 100) : 0
          const archivedPct    = stats.total ? Math.round(((stats.archived    || 0) / stats.total) * 100) : 0

          return [
            {
              label: 'Near Expiry', value: stats.nearExpiry || 0,
              accent: '#E11D48', ico: <AlertTriangle size={16} />,
              href: '/orgbuilder/organizations?near_expiry=1',
              pct: nearExpiryPct, barColor: '#D97706',
              sub: `${nearExpiryPct}% of total orgs`,
              bg: 'linear-gradient(145deg, var(--surface) 0%, rgba(225,29,72,.07) 100%)',
              border: 'rgba(225,29,72,.2)',
              glow: 'rgba(225,29,72,.12)',
            },
            {
              label: 'Inactive', value: stats.inactive || 0,
              accent: '#0284C7', ico: <XCircle size={16} />,
              href: '/orgbuilder/organizations?tab=unsubscribed',
              pct: inactivePct, barColor: '#EF4444',
              sub: `${inactivePct}% of total orgs`,
              bg: 'linear-gradient(145deg, var(--surface) 0%, rgba(2,132,199,.07) 100%)',
              border: 'rgba(2,132,199,.2)',
              glow: 'rgba(2,132,199,.12)',
            },
            {
              label: 'Archived', value: stats.archived || 0,
              accent: '#7C3AED', ico: <Archive size={16} />,
              href: '/orgbuilder/organizations?tab=archived',
              pct: archivedPct, barColor: '#7C3AED',
              sub: `${stats.archivedPaid || 0} paid · ${stats.archivedTrial || 0} trial`,
              bg: 'linear-gradient(145deg, var(--surface) 0%, rgba(124,58,237,.07) 100%)',
              border: 'rgba(124,58,237,.2)',
              glow: 'rgba(124,58,237,.12)',
            },
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{
              display: 'block', textDecoration: 'none',
              padding: '18px 20px', borderRadius: 16,
              background: item.bg,
              border: `1px solid ${item.border}`,
              position: 'relative', overflow: 'hidden',
              transition: 'transform .15s, box-shadow .15s',
            }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = `0 8px 28px ${item.glow}`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = ''
                el.style.boxShadow = ''
              }}
            >
              {/* Decorative corner glow */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${item.accent}12`, pointerEvents: 'none' }} />

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: `${item.accent}18`,
                    border: `1px solid ${item.accent}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.accent, flexShrink: 0,
                  }}>
                    {item.ico}
                  </div>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text3)', letterSpacing: '.01em' }}>{item.label}</span>
                </div>
                {item.pct > 0 ? (
                  <span style={{
                    fontSize: '.63rem', fontWeight: 800, color: item.barColor,
                    padding: '3px 8px', borderRadius: 20,
                    background: `${item.barColor}15`,
                    border: `1px solid ${item.barColor}30`,
                  }}>
                    {item.pct}%
                  </span>
                ) : (
                  <span style={{ fontSize: '.63rem', color: 'var(--text4)' }}>0%</span>
                )}
              </div>

              {/* Value */}
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text1)', lineHeight: 1, marginBottom: 12 }}>
                {item.value.toLocaleString()}
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ height: 5, background: 'var(--bg2)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(item.pct, 100)}%`,
                    background: `linear-gradient(90deg, ${item.barColor}cc, ${item.barColor})`,
                    borderRadius: 5, transition: 'width .6s ease',
                    boxShadow: `0 0 6px ${item.barColor}60`,
                  }} />
                </div>
              </div>

              <div style={{ fontSize: '.66rem', color: 'var(--text4)' }}>{item.sub}</div>
            </Link>
          ))
        })()}
      </div>

      {/* ── Charts ── */}
      <div className="g2" style={{ marginBottom: 18 }}>

        {/* Area chart — Organization Growth */}
        <div className="card" style={{ background: 'linear-gradient(160deg, var(--surface) 0%, rgba(13,148,136,.04) 100%)', border: '1px solid rgba(13,148,136,.15)' }}>
          <div className="card-h">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0D9488', boxShadow: '0 0 0 3px rgba(13,148,136,.2)', flexShrink: 0 }} />
                Organization Growth
              </div>
              <div className="card-sub">New onboardings — last 12 months</div>
            </div>
            <div className="tab-row">
              <button className={`tab${chartView === 'monthly'   ? ' on' : ''}`} onClick={() => setChartView('monthly')}>Monthly</button>
              <button className={`tab${chartView === 'quarterly' ? ' on' : ''}`} onClick={() => setChartView('quarterly')}>Quarterly</button>
            </div>
          </div>
          <div className="card-b" style={{ paddingTop: 14 }}>
            {chartData.length > 0 ? (
              <>
                {/* Summary pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  {(() => {
                    const totalPaid  = chartData.reduce((s, d) => s + d.paid, 0)
                    const totalTrial = chartData.reduce((s, d) => s + d.trial, 0)
                    const grandTotal = totalPaid + totalTrial
                    return [
                      { label: 'Paid',  value: totalPaid,  color: '#0D9488', bg: 'rgba(13,148,136,.08)',  border: 'rgba(13,148,136,.2)' },
                      { label: 'Trial', value: totalTrial, color: '#F59E0B', bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.2)' },
                      { label: 'Total', value: grandTotal, color: '#6366F1', bg: 'rgba(99,102,241,.08)',  border: 'rgba(99,102,241,.2)' },
                    ].map((s) => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                        <span style={{ fontSize: '.67rem', fontWeight: 700 }}>
                          <span style={{ color: s.color }}>{s.value}</span>
                          <span style={{ color: 'var(--text4)', marginLeft: 3 }}>{s.label}</span>
                        </span>
                      </div>
                    ))
                  })()}
                </div>
                <ResponsiveContainer width="100%" height={195}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0D9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="trialGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} wrapperStyle={{ background: 'none', border: 'none', boxShadow: 'none', outline: 'none', padding: 0 }} cursor={{ stroke: 'rgba(13,148,136,.3)', strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="paid"  name="Paid Orgs"  stroke="#0D9488" strokeWidth={2.5} fill="url(#paidGrad)"  dot={false} activeDot={{ r: 6, fill: '#0D9488', stroke: '#fff', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="trial" name="Trial Orgs" stroke="#F59E0B" strokeWidth={2}   strokeDasharray="6 4" fill="url(#trialGrad)" dot={false} activeDot={{ r: 6, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <EmptyState icon={<BarChart2 size={28} />} text="No data yet. Add your first organization to see growth charts." />
            )}
          </div>
        </div>

        {/* Donut chart — Plan Distribution */}
        <div className="card" style={{ background: 'linear-gradient(160deg, var(--surface) 0%, rgba(124,58,237,.04) 100%)', border: '1px solid rgba(124,58,237,.15)' }}>
          <div className="card-h">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED', boxShadow: '0 0 0 3px rgba(124,58,237,.2)', flexShrink: 0 }} />
                Plan Distribution
              </div>
              <div className="card-sub">By subscription type</div>
            </div>
            {pieTotal > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 20, background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)' }}>
                <span style={{ fontSize: '.73rem', fontWeight: 800, color: '#7C3AED' }}>{pieTotal}</span>
                <span style={{ fontSize: '.65rem', color: 'var(--text4)', fontWeight: 600 }}>orgs</span>
              </div>
            )}
          </div>
          <div className="card-b">
            {pieData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flexShrink: 0 }}>
                  <PieChart width={168} height={168}>
                    <Pie
                      data={pieData} cx={84} cy={84}
                      innerRadius={54} outerRadius={76}
                      dataKey="value" paddingAngle={3}
                      startAngle={90} endAngle={-270}
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={i} fill={entry.color}
                          stroke="transparent"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.15))', cursor: 'pointer', outline: 'none' }}
                        />
                      ))}
                      <Label
                        content={({ viewBox }: any) => {
                          const { cx, cy } = viewBox
                          return (
                            <g>
                              <text x={cx} y={cy - 9} textAnchor="middle" style={{ fontSize: '1.2rem', fontWeight: 800, fill: 'var(--text1)', fontFamily: 'Sora, sans-serif' }}>
                                {(stats.paidActive || 0).toLocaleString()}
                              </text>
                              <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: '.56rem', fill: '#7A9794', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                                PAID ACTIVE
                              </text>
                            </g>
                          )
                        }}
                      />
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}
                      formatter={(value: any, name: any) => [`${value} orgs`, name]}
                    />
                  </PieChart>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pieData.map((item) => {
                    const pct = pieTotal > 0 ? Math.round((item.value / pieTotal) * 100) : 0
                    return (
                      <div key={item.name} style={{
                        padding: '8px 10px', borderRadius: 10,
                        background: `${item.color}08`, border: `1px solid ${item.color}20`,
                        transition: 'transform .12s, box-shadow .12s',
                        cursor: 'default',
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateX(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `2px 0 0 ${item.color} inset` }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: '.71rem', color: 'var(--text2)', fontWeight: 600 }}>{item.name}</span>
                          <span style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--text1)' }}>{item.value.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ flex: 1, height: 4, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 4, transition: 'width .5s ease' }} />
                          </div>
                          <span style={{ fontSize: '.65rem', color: item.color, fontWeight: 700, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <EmptyState icon={<Activity size={28} />} text="No organizations yet." />
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orgs + Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>

        {/* Recent Organizations */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-title">Recent Organizations</div>
              <div className="card-sub">Latest onboarded clients</div>
            </div>
            <Link href="/orgbuilder/organizations" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="tw">
            <table className="dt">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Users</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div style={{ padding: '32px 0', textAlign: 'center' }}>
                        <Building2 size={28} style={{ color: 'var(--text4)', margin: '0 auto 8px' }} />
                        <div style={{ fontSize: '.8rem', color: 'var(--text4)' }}>
                          No organizations yet.{' '}
                          <Link href="/orgbuilder/organizations/create" style={{ color: 'var(--p)', fontWeight: 700 }}>Add your first →</Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrgs.slice(0, 5).map((org: any) => (
                    <tr key={org.id}>
                      <td>
                        <Link href={`/orgbuilder/organizations/${org.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--p-lt)', border: '1px solid var(--p-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, color: 'var(--p)', flexShrink: 0 }}>
                            {org.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '.81rem', fontWeight: 700, color: 'var(--text1)' }}>{org.name}</div>
                            <div style={{ fontSize: '.67rem', color: 'var(--text3)' }}>{org.orgId}{org.city ? ` · ${org.city}` : ''}</div>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 9px', borderRadius: 20, fontSize: '.67rem', fontWeight: 800,
                          background: org.planType === 'premium' ? 'rgba(13,148,136,.1)' : 'rgba(14,165,233,.1)',
                          color: org.planType === 'premium' ? '#0D9488' : '#0369A1',
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                          {org.planType === 'premium' ? 'Premium' : 'Trial'}
                        </span>
                      </td>
                      <td style={{ minWidth: 90 }}>
                        {(() => {
                          const used = Number(org.userCount ?? 0)
                          const limit = Number(org.userLimit ?? 0)
                          const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
                          const barColor = pct >= 100 ? '#EF4444' : pct >= 80 ? '#D97706' : '#0D9488'
                          return (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                                <span style={{ fontSize: '.76rem', fontWeight: 800, color: 'var(--text1)' }}>{used}</span>
                                <span style={{ fontSize: '.66rem', color: 'var(--text4)' }}>/{limit}</span>
                              </div>
                              <div style={{ height: 3, background: 'var(--bg2)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width .4s ease' }} />
                              </div>
                            </>
                          )
                        })()}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 9px', borderRadius: 20, fontSize: '.67rem', fontWeight: 800,
                          background: org.status === 'active' ? 'rgba(5,150,105,.1)' : org.status === 'expired' ? 'rgba(239,68,68,.1)' : 'rgba(107,114,128,.1)',
                          color: org.status === 'active' ? '#059669' : org.status === 'expired' ? '#EF4444' : '#8b95a1',
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                          {org.status === 'active' ? 'Active' : org.status === 'expired' ? 'Expired' : org.status === 'inactive' ? 'Inactive' : org.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-title">Recent Activity</div>
              <div className="card-sub">System events &amp; changes</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)', fontSize: '.65rem', fontWeight: 700, color: '#7C3AED' }}>
              <Sparkles size={10} />
              Soon
            </div>
          </div>
          <div style={{ padding: '32px 18px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(124,58,237,.15), rgba(124,58,237,.05))',
              border: '1px solid rgba(124,58,237,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={26} style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <div style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--text1)', marginBottom: 6 }}>Coming Soon</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text3)', maxWidth: 200, lineHeight: 1.6 }}>
                Real-time activity tracking and audit logs are under development.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 220 }}>
              {['Organization changes', 'User logins', 'Plan updates'].map((item) => (
                <div key={item} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 10,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  opacity: .5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text4)', flexShrink: 0 }} />
                  <span style={{ fontSize: '.71rem', color: 'var(--text3)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text4)' }}>
      <div style={{ opacity: .5 }}>{icon}</div>
      <div style={{ fontSize: '.8rem', textAlign: 'center', maxWidth: 240 }}>{text}</div>
    </div>
  )
}
