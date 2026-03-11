import { usePage, Link } from '@inertiajs/react'
import { DateTime } from 'luxon'
import {
  Users, GitBranch, Layers, Award, LayoutDashboard,
  Building2, Settings, Shield, ChevronRight,
  UserPlus, BarChart2, CalendarCheck, Clock,
} from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────────

interface HrmsUser {
  id: number
  fullName: string
  email: string
  employeeCode: string | null
  profileName: string
  initials: string
  org: { id: number; orgId: string; name: string; logo: string | null }
}

interface Stats {
  employees: number
  divisions: number
  departments: number
  designations: number
}

interface Props {
  stats: Stats
}

// ── StatCard ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number
  stripe: 'teal' | 'emerald' | 'amber' | 'purple'
  ico: React.ReactNode
  href?: string
  sub?: string
}

function StatCard({ label, value, stripe, ico, href, sub }: StatCardProps) {
  const content = (
    <div className="scard">
      <div className={`scard-stripe ${stripe}`} />
      <div className="scard-h">
        <div className={`scard-ico ${stripe}`}>{ico}</div>
      </div>
      <div className="scard-val">{value.toLocaleString()}</div>
      <div className="scard-lbl">{label}</div>
      {sub && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '.67rem', color: 'var(--text3)' }}>{sub}</span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
        {content}
      </Link>
    )
  }
  return content
}

// ── QuickLink ───────────────────────────────────────────────────────────────────

function QuickLink({
  label, desc, ico, accent, href,
}: {
  label: string; desc: string; ico: React.ReactNode; accent: string; href: string
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 16px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        textDecoration: 'none',
        transition: 'transform .15s, box-shadow .15s, border-color .15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = `0 6px 20px rgba(0,0,0,.08)`
        el.style.borderColor = accent + '70'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = ''
        el.style.boxShadow = ''
        el.style.borderColor = 'var(--border)'
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `linear-gradient(135deg, ${accent}22, ${accent}10)`,
        border: `1px solid ${accent}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent,
      }}>
        {ico}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: '.67rem', color: 'var(--text3)' }}>{desc}</div>
      </div>
      <ChevronRight size={14} style={{ color: 'var(--text4)', flexShrink: 0 }} />
    </Link>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function HrmsDashboard({ stats }: Props) {
  const { props: shared } = usePage<any>()
  const hrmsUser = (shared as any)?.hrmsUser as HrmsUser | undefined

  const greeting = (() => {
    const h = DateTime.now().hour
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const dateStr = DateTime.now().setLocale('en-IN').toLocaleString({
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const orgName = hrmsUser?.org?.name ?? 'Your Organization'

  return (
    <>
      {/* ── Welcome Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--p) 0%, var(--s) 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 22,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 120, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{
                fontFamily: 'var(--fd)', fontSize: '1.45rem', fontWeight: 800,
                color: '#fff', marginBottom: 6, lineHeight: 1.2,
              }}>
                {greeting}, {hrmsUser?.fullName?.split(' ')[0] ?? 'Employee'}
              </div>
              <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.75)', marginBottom: 14 }}>
                {dateStr}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 20,
                  background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.25)',
                  fontSize: '.74rem', fontWeight: 700, color: '#fff',
                }}>
                  <Building2 size={13} />
                  {orgName}
                </span>
                {hrmsUser?.org?.orgId && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 20,
                    background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)',
                    fontSize: '.7rem', fontWeight: 600, color: 'rgba(255,255,255,.85)',
                    letterSpacing: '.05em',
                  }}>
                    {hrmsUser.org.orgId}
                  </span>
                )}
                {hrmsUser?.profileName && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 20,
                    background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)',
                    fontSize: '.7rem', fontWeight: 600, color: 'rgba(255,255,255,.85)',
                  }}>
                    {hrmsUser.profileName}
                  </span>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'rgba(255,255,255,.22)', border: '2px solid rgba(255,255,255,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--fd)', fontSize: '1.1rem', fontWeight: 800, color: '#fff',
            }}>
              {hrmsUser?.initials ?? '??'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-g" style={{ marginBottom: 22 }}>
        <StatCard
          label="Total Employees"
          value={stats.employees}
          stripe="teal"
          ico={<Users size={17} />}
          href="/hrms/employee/directory"
          sub="Active workforce"
        />
        <StatCard
          label="Divisions"
          value={stats.divisions}
          stripe="emerald"
          ico={<Layers size={17} />}
          href="/hrms/organization/hierarchy"
          sub="Business units"
        />
        <StatCard
          label="Departments"
          value={stats.departments}
          stripe="amber"
          ico={<GitBranch size={17} />}
          href="/hrms/organization/hierarchy"
          sub="Functional teams"
        />
        <StatCard
          label="Designations"
          value={stats.designations}
          stripe="purple"
          ico={<Award size={17} />}
          href="/hrms/organization/settings/designations"
          sub="Job titles defined"
        />
      </div>

      {/* ── Quick Links + Recent Activity ── */}
      <div className="g2" style={{ marginBottom: 18 }}>

        {/* Quick Links */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--p)', boxShadow: '0 0 0 3px var(--p-ring)', flexShrink: 0 }} />
                Quick Actions
              </div>
              <div className="card-sub">Navigate to key sections</div>
            </div>
          </div>
          <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <QuickLink
              label="Add Employee"
              desc="Onboard a new team member"
              ico={<UserPlus size={16} />}
              accent="#0D9488"
              href="/hrms/employee/create"
            />
            <QuickLink
              label="Manage Hierarchy"
              desc="Divisions, departments & reporting"
              ico={<GitBranch size={16} />}
              accent="#059669"
              href="/hrms/organization/hierarchy"
            />
            <QuickLink
              label="Company Profile"
              desc="Update company details & branding"
              ico={<Building2 size={16} />}
              accent="#0284C7"
              href="/hrms/organization/company"
            />
            <QuickLink
              label="Roles & Permissions"
              desc="View access control settings"
              ico={<Shield size={16} />}
              accent="#7C3AED"
              href="/hrms/organization/roles"
            />
            <QuickLink
              label="Organization Settings"
              desc="Documents, designations & more"
              ico={<Settings size={16} />}
              accent="#D97706"
              href="/hrms/organization/settings/documents"
            />
          </div>
        </div>

        {/* Overview Panel */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED', boxShadow: '0 0 0 3px rgba(124,58,237,.2)', flexShrink: 0 }} />
                HRMS Overview
              </div>
              <div className="card-sub">Organization at a glance</div>
            </div>
          </div>
          <div className="card-b">
            {/* Org summary */}
            <div style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, var(--p-lt) 0%, var(--s-lt) 100%)',
              border: '1px solid var(--p-mid)',
              borderRadius: 12,
              marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={18} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: '.92rem', fontWeight: 800, color: 'var(--text1)' }}>
                    {orgName}
                  </div>
                  {hrmsUser?.org?.orgId && (
                    <div style={{ fontSize: '.67rem', color: 'var(--text3)', marginTop: 1, letterSpacing: '.04em' }}>
                      ID: {hrmsUser.org.orgId}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Module tiles */}
            {[
              { label: 'Employee Module',    href: '/hrms/employee/directory', ico: <Users size={15} />,         color: '#0D9488', desc: `${stats.employees} employees` },
              { label: 'Org Hierarchy',       href: '/hrms/organization/hierarchy', ico: <GitBranch size={15} />, color: '#059669', desc: `${stats.divisions} div · ${stats.departments} dept` },
              { label: 'Attendance',          href: '#',                             ico: <CalendarCheck size={15} />, color: '#D97706', desc: 'Coming soon' },
              { label: 'Analytics',           href: '#',                             ico: <BarChart2 size={15} />,  color: '#7C3AED', desc: 'Coming soon' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  textDecoration: 'none',
                  marginBottom: 8,
                  transition: 'border-color .15s, background .15s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = item.color + '50'
                  el.style.background = item.color + '06'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border)'
                  el.style.background = 'var(--surface)'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: item.color + '14', border: `1px solid ${item.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color,
                }}>
                  {item.ico}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.79rem', fontWeight: 700, color: 'var(--text1)' }}>{item.label}</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text3)', marginTop: 1 }}>{item.desc}</div>
                </div>
                <ChevronRight size={13} style={{ color: 'var(--text4)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── System Status ── */}
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-title">System Modules</div>
            <div className="card-sub">HRMS module availability</div>
          </div>
        </div>
        <div className="card-b">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Organization',  ico: <Building2 size={16} />,    status: 'active',  color: '#0D9488', href: '/hrms/organization/company' },
              { label: 'Employee',      ico: <Users size={16} />,         status: 'active',  color: '#7C3AED', href: '/hrms/employee/directory' },
              { label: 'Attendance',    ico: <Clock size={16} />,         status: 'soon',    color: '#D97706', href: '#' },
              { label: 'Payroll',       ico: <LayoutDashboard size={16} />, status: 'soon',  color: '#E11D48', href: '#' },
            ].map((mod) => (
              <Link
                key={mod.label}
                href={mod.href}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 8, padding: '16px 12px', borderRadius: 12,
                  border: `1px solid ${mod.status === 'active' ? mod.color + '30' : 'var(--border)'}`,
                  background: mod.status === 'active' ? mod.color + '06' : 'var(--bg2)',
                  textDecoration: 'none',
                  transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseEnter={(e) => {
                  if (mod.status !== 'active') return
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = `0 6px 20px ${mod.color}20`
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = ''
                  el.style.boxShadow = ''
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: mod.status === 'active' ? mod.color + '16' : 'var(--border)',
                  border: `1px solid ${mod.status === 'active' ? mod.color + '25' : 'var(--border2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: mod.status === 'active' ? mod.color : 'var(--text4)',
                }}>
                  {mod.ico}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '.76rem', fontWeight: 700, color: mod.status === 'active' ? 'var(--text1)' : 'var(--text3)', marginBottom: 4 }}>
                    {mod.label}
                  </div>
                  <span className={`bx ${mod.status === 'active' ? 'bx-teal' : 'bx-gray'}`} style={{ fontSize: '.6rem' }}>
                    {mod.status === 'active' ? 'Active' : 'Coming Soon'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
