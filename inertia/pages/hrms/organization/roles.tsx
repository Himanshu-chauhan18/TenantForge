import { useState } from 'react'
import { Shield, ChevronDown, ChevronUp, CheckCircle2, Users, Lock } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────────

interface Permission {
  module: string
  view: boolean
  add: boolean
  edit: boolean
  delete: boolean
}

interface Profile {
  id: number
  name: string
  description: string
  dataAccess: string
  permissions: Permission[]
}

interface Props {
  profiles: Profile[]
}

// ── DataAccess badge ─────────────────────────────────────────────────────────────

function DataAccessBadge({ access }: { access: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    all:        { cls: 'bx bx-teal',   label: 'All Data' },
    own:        { cls: 'bx bx-purple', label: 'Own Only' },
    department: { cls: 'bx bx-sky',    label: 'Department' },
    division:   { cls: 'bx bx-amber',  label: 'Division' },
    none:       { cls: 'bx bx-gray',   label: 'No Access' },
  }
  const cfg = map[access?.toLowerCase()] ?? { cls: 'bx bx-gray', label: access ?? 'Unknown' }
  return <span className={cfg.cls}>{cfg.label}</span>
}

// ── Permission icon ──────────────────────────────────────────────────────────────

function PermIcon({ value }: { value: boolean }) {
  if (value) return <CheckCircle2 size={15} style={{ color: '#059669' }} />
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

// ── Permission Grid ──────────────────────────────────────────────────────────────

function PermissionsGrid({ permissions }: { permissions: Permission[] }) {
  if (!permissions || permissions.length === 0) {
    return (
      <div style={{ padding: '18px', textAlign: 'center', color: 'var(--text4)', fontSize: '.78rem' }}>
        No permission rules defined for this role.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="perm-table">
        <thead>
          <tr>
            <th style={{ minWidth: 160 }}>Module</th>
            <th style={{ width: 80 }}>View</th>
            <th style={{ width: 80 }}>Add</th>
            <th style={{ width: 80 }}>Edit</th>
            <th style={{ width: 80 }}>Delete</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm.module}>
              <td style={{ fontWeight: 600, color: 'var(--text1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: perm.view ? 'var(--p)' : 'var(--border2)',
                    flexShrink: 0,
                  }} />
                  {perm.module}
                </div>
              </td>
              <td><PermIcon value={perm.view} /></td>
              <td><PermIcon value={perm.add} /></td>
              <td><PermIcon value={perm.edit} /></td>
              <td><PermIcon value={perm.delete} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Profile Card ─────────────────────────────────────────────────────────────────

function ProfileCard({ profile, index }: { profile: Profile; index: number }) {
  const [expanded, setExpanded] = useState(false)

  const colors = ['#0D9488', '#7C3AED', '#0284C7', '#D97706', '#E11D48', '#059669']
  const accent = colors[index % colors.length]

  const totalPerms = profile.permissions?.length ?? 0
  const fullAccess = profile.permissions?.filter((p) => p.view && p.add && p.edit && p.delete).length ?? 0
  const viewOnly   = profile.permissions?.filter((p) => p.view && !p.add && !p.edit && !p.delete).length ?? 0

  return (
    <div
      className="card"
      style={{
        marginBottom: 12,
        borderLeft: `3px solid ${accent}`,
        transition: 'box-shadow .15s',
      }}
    >
      {/* Card header */}
      <div
        className="card-h"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          {/* Avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: `${accent}14`, border: `1.5px solid ${accent}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent,
          }}>
            <Shield size={18} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--fd)', fontSize: '.9rem', fontWeight: 800, color: 'var(--text1)',
              }}>
                {profile.name}
              </span>
              <DataAccessBadge access={profile.dataAccess} />
            </div>
            {profile.description && (
              <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 3 }}>
                {profile.description}
              </div>
            )}
          </div>

          {/* Stats pills */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center', marginRight: 12 }}>
            {totalPerms > 0 && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '.77rem', fontWeight: 800, color: 'var(--text1)' }}>{totalPerms}</div>
                  <div style={{ fontSize: '.6rem', color: 'var(--text4)' }}>Modules</div>
                </div>
                <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '.77rem', fontWeight: 800, color: '#059669' }}>{fullAccess}</div>
                  <div style={{ fontSize: '.6rem', color: 'var(--text4)' }}>Full</div>
                </div>
                <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '.77rem', fontWeight: 800, color: '#0284C7' }}>{viewOnly}</div>
                  <div style={{ fontSize: '.6rem', color: 'var(--text4)' }}>View Only</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 8, flexShrink: 0,
            background: expanded ? 'var(--p-lt)' : 'var(--bg2)',
            border: `1px solid ${expanded ? 'var(--p-mid)' : 'var(--border)'}`,
            color: expanded ? 'var(--p)' : 'var(--text3)',
            fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
          }}
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide' : 'View Permissions'}
        </button>
      </div>

      {/* Expandable permissions grid */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <PermissionsGrid permissions={profile.permissions} />
        </div>
      )}
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      padding: '60px 24px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'linear-gradient(135deg, var(--p-lt), var(--s-lt))',
        border: '1px solid var(--p-mid)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--p)',
      }}>
        <Lock size={26} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1rem', fontWeight: 800, color: 'var(--text1)', marginBottom: 6 }}>
          No Roles Defined
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--text3)', maxWidth: 280, lineHeight: 1.65 }}>
          Roles and permissions are configured by your OrgBuilder administrator.
          Contact your platform admin to set up access control.
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function RolesPage({ profiles }: Props) {
  const [search, setSearch] = useState('')

  const filtered = profiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalModules = profiles.reduce((s, p) => s + (p.permissions?.length ?? 0), 0)

  return (
    <>
      {/* ── Page Header ── */}
      <div className="ph">
        <div>
          <div className="ph-title">Roles & Permissions</div>
          <div className="ph-sub">
            View access control roles configured for your organization
          </div>
        </div>
        <div className="ph-right">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
            borderRadius: 20, background: 'var(--purple-lt)', border: '1px solid rgba(124,58,237,.2)',
            fontSize: '.7rem', fontWeight: 700, color: 'var(--purple)',
          }}>
            <Shield size={12} />
            Read Only
          </div>
        </div>
      </div>

      {/* ── Summary Row ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18,
      }}>
        {[
          { label: 'Total Roles',       value: profiles.length, color: '#0D9488', ico: <Shield size={16} /> },
          { label: 'Employees Covered', value: profiles.reduce((s, p) => s + ((p as any).employeeCount ?? 0), 0), color: '#7C3AED', ico: <Users size={16} /> },
          { label: 'Module Rules',      value: totalModules,    color: '#0284C7', ico: <Lock size={16} /> },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: '14px 18px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: stat.color + '14', border: `1px solid ${stat.color}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color,
            }}>
              {stat.ico}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text1)', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '.68rem', color: 'var(--text3)', marginTop: 3, fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search toolbar ── */}
      {profiles.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="sb-inp" style={{ maxWidth: 320 }}>
            <Shield size={14} style={{ color: 'var(--text4)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search roles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text4)', display: 'flex', padding: 0 }}
                onClick={() => setSearch('')}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Roles list ── */}
      {filtered.length === 0 ? (
        profiles.length === 0 ? (
          <div className="card"><EmptyState /></div>
        ) : (
          <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: '.82rem' }}>
            No roles match your search.
          </div>
        )
      ) : (
        <div>
          {filtered.map((profile, i) => (
            <ProfileCard key={profile.id} profile={profile} index={i} />
          ))}
        </div>
      )}

      {/* ── Info notice ── */}
      <div className="alert alert-info" style={{ marginTop: 18 }}>
        <Shield size={15} style={{ flexShrink: 0 }} />
        <span>
          Roles are managed by your OrgBuilder platform administrator.
          To modify permissions or create new roles, contact your system admin.
        </span>
      </div>
    </>
  )
}

