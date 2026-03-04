import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import {
  Building2, MapPin, Globe, Phone, Mail, Calendar, Shield,
  Users, Settings2, ChevronRight, Edit3, Trash2, Check,
  Clock, AlertTriangle, User, Key, Activity, Layers,
  ArrowLeft, ExternalLink, MoreHorizontal, X,
} from 'lucide-react'

interface OrgModule {
  id: number
  module_id: number
  enabled: boolean
  addon_ids: Array<{ id: number; enabled: boolean }>
  module: { id: number; key: string; label: string; addons: Array<{ id: number; name: string; type: string }> }
}

interface OrgUser {
  id: number
  employee_code: string
  full_name: string
  gender: string
  phone: string
  company_email: string
  is_active: boolean
  created_at: string
}

interface FiscalYear {
  id: number
  name: string
  start_date: string
  end_date: string
  is_active: boolean
}

interface LeadOwner {
  id: number
  email: string
  full_name?: string
}

interface Org {
  id: number
  org_id: string
  name: string
  slug: string
  logo: string | null
  company_size: string | null
  industry: string | null
  website: string | null
  about: string | null
  gst_no: string | null
  parent_org_id: number | null
  fiscal_name: string | null
  fiscal_start: string | null
  fiscal_end: string | null
  country: string | null
  city: string | null
  phone: string | null
  email: string | null
  address: string | null
  lead_owner_id: number | null
  currency: string
  timezone: string
  date_format: string
  time_format: string
  plan_type: 'trial' | 'premium'
  user_limit: number
  plan_start: string | null
  plan_end: string | null
  status: 'active' | 'inactive' | 'expired'
  is_archived: boolean
  created_at: string
  updated_at: string
  lead_owner: LeadOwner | null
  modules: OrgModule[]
  org_users: OrgUser[]
  fiscal_years: FiscalYear[]
}

interface Props {
  org: Org
  users: Array<{ id: number; email: string; full_name?: string }>
  flash?: { success?: string; errors?: Record<string, string> }
}

function InfoRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
      <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text4)' }}>{label}</div>
      <div style={{ fontSize: '.82rem', color: 'var(--text1)', fontWeight: 600, fontFamily: mono ? 'var(--fd)' : undefined }}>{value}</div>
    </div>
  )
}

function SectionHead({ icon, title, sub, action }: { icon: React.ReactNode; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="sec-head" style={{ marginBottom: 16 }}>
      <div className="sec-icon" style={{ background: 'var(--p-lt)', color: 'var(--p)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div className="sec-title">{title}</div>
        {sub && <div className="sec-sub">{sub}</div>}
      </div>
      {action}
    </div>
  )
}

export default function ShowOrganization({ org, users, flash }: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'profiles' | 'fiscal'>('users')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const daysLeft = org.plan_end
    ? Math.ceil((new Date(org.plan_end).getTime() - Date.now()) / 86400000)
    : null

  const isNearExpiry = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7
  const isExpired = daysLeft !== null && daysLeft < 0

  function handleDelete() {
    router.delete(`/organizations/${org.id}`)
    setDeleteConfirm(false)
  }

  const enabledOrgModules = org.modules.filter((m) => m.enabled)

  return (
    <>
      {/* Flash */}
      {flash?.success && <div className="alert alert-success">{flash.success}</div>}
      {flash?.errors && Object.values(flash.errors).map((e, i) => (
        <div key={i} className="alert alert-danger">{e}</div>
      ))}

      {/* Page header */}
      <div className="ph">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/organizations" className="ibtn">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="ph-title">{org.name}</div>
            <div className="ph-sub">{org.org_id} · Created {new Date(org.created_at).toLocaleDateString('en-IN')}</div>
          </div>
        </div>
        <div className="ph-right">
          <Link href={`/organizations/${org.id}/edit`} className="btn btn-ghost btn-sm">
            <Edit3 size={13} /> Edit
          </Link>
          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* Alerts */}
      {isNearExpiry && (
        <div className="alert alert-warn">
          <AlertTriangle size={15} />
          Plan expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
          Contact the organization to renew their plan.
        </div>
      )}
      {isExpired && (
        <div className="alert alert-danger">
          <AlertTriangle size={15} />
          Plan expired <strong>{Math.abs(daysLeft!)} day{Math.abs(daysLeft!) !== 1 ? 's' : ''} ago</strong>.
        </div>
      )}

      {/* ---- Hero gradient header ---- */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--p) 0%, var(--s) 100%)', padding: '28px 24px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, position: 'relative' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,.18)', border: '2px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--fd)', flexShrink: 0 }}>
              {org.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>{org.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span style={{ background: 'rgba(255,255,255,.18)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700 }}>
                  {org.org_id}
                </span>
                <span style={{ background: 'rgba(255,255,255,.18)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700 }}>
                  {org.plan_type === 'premium' ? 'Premium' : 'Trial'}
                </span>
                <span style={{
                  background: org.status === 'active' ? 'rgba(255,255,255,.25)' : 'rgba(220,38,38,.3)',
                  color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700
                }}>
                  {org.status}
                </span>
                {org.is_archived && (
                  <span style={{ background: 'rgba(0,0,0,.2)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: '.68rem', fontWeight: 700 }}>Archived</span>
                )}
              </div>
              {org.about && (
                <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.8)', marginTop: 8, maxWidth: 600 }}>{org.about}</div>
              )}
            </div>
          </div>

          {/* Meta pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 18, position: 'relative' }}>
            {org.industry && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.85)', fontSize: '.74rem' }}>
                <Layers size={12} /> {org.industry}
              </div>
            )}
            {org.company_size && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.85)', fontSize: '.74rem' }}>
                <Users size={12} /> {org.company_size} employees
              </div>
            )}
            {(org.city || org.country) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.85)', fontSize: '.74rem' }}>
                <MapPin size={12} /> {[org.city, org.country].filter(Boolean).join(', ')}
              </div>
            )}
            {org.website && (
              <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.85)', fontSize: '.74rem' }}>
                <Globe size={12} /> {org.website.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="g2" style={{ alignItems: 'start', marginBottom: 16 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Plan Details Card */}
          <div className="card">
            <div className="card-h">
              <div>
                <div className="card-title">Plan Details</div>
                <div className="card-sub">Subscription & usage</div>
              </div>
              <span className={`bx ${org.plan_type === 'premium' ? 'bx-teal' : 'bx-sky'}`}>
                {org.plan_type === 'premium' ? 'Premium' : 'Trial'}
              </span>
            </div>
            <div className="card-b">
              <div className="g2" style={{ marginBottom: 14 }}>
                <InfoRow label="Plan Start" value={org.plan_start ? new Date(org.plan_start).toLocaleDateString('en-IN') : '—'} />
                <InfoRow label="Plan End" value={org.plan_end ? new Date(org.plan_end).toLocaleDateString('en-IN') : '—'} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '.73rem', color: 'var(--text3)', fontWeight: 700 }}>User Limit</span>
                  <span style={{ fontSize: '.73rem', fontWeight: 800 }}>
                    — / {org.user_limit}
                  </span>
                </div>
                <div className="usage-bar">
                  <div className="usage-fill good" style={{ width: '0%' }} />
                </div>
              </div>

              {daysLeft !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', color: isExpired ? 'var(--danger)' : isNearExpiry ? 'var(--warn)' : 'var(--text3)', fontWeight: 600 }}>
                  <Clock size={12} />
                  {isExpired ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
                </div>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="card">
            <div className="card-h">
              <div className="card-title">Contact Details</div>
            </div>
            <div className="card-b">
              {org.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '.8rem', color: 'var(--text2)' }}>
                  <Mail size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} /> {org.email}
                </div>
              )}
              {org.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '.8rem', color: 'var(--text2)' }}>
                  <Phone size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} /> {org.phone}
                </div>
              )}
              {(org.city || org.country) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '.8rem', color: 'var(--text2)' }}>
                  <MapPin size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} /> {[org.city, org.country].filter(Boolean).join(', ')}
                </div>
              )}
              {org.address && (
                <div style={{ fontSize: '.78rem', color: 'var(--text3)', lineHeight: 1.6 }}>{org.address}</div>
              )}
              {!org.email && !org.phone && !org.city && !org.address && (
                <div style={{ fontSize: '.8rem', color: 'var(--text4)' }}>No contact details</div>
              )}
            </div>
          </div>

          {/* Locale Settings */}
          <div className="card">
            <div className="card-h">
              <div className="card-title">Locale Settings</div>
            </div>
            <div className="card-b">
              <div className="g2">
                <InfoRow label="Currency" value={org.currency} />
                <InfoRow label="Timezone" value={org.timezone} />
                <InfoRow label="Date Format" value={org.date_format} />
                <InfoRow label="Time Format" value={org.time_format} />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="card">
            <div className="card-h">
              <div className="card-title">Company Details</div>
            </div>
            <div className="card-b">
              <InfoRow label="GST Number" value={org.gst_no} mono />
              <InfoRow label="Industry" value={org.industry} />
              <InfoRow label="Company Size" value={org.company_size ? `${org.company_size} employees` : null} />
              <InfoRow label="Fiscal Year" value={org.fiscal_name} />
              {org.fiscal_start && org.fiscal_end && (
                <InfoRow label="Fiscal Period" value={`${new Date(org.fiscal_start).toLocaleDateString('en-IN')} – ${new Date(org.fiscal_end).toLocaleDateString('en-IN')}`} />
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Lead Owner */}
          {org.lead_owner && (
            <div className="card">
              <div className="card-h">
                <div className="card-title">Lead Owner</div>
              </div>
              <div className="card-b">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="av av-lg av-sq" style={{ flexShrink: 0 }}>
                    {(org.lead_owner.full_name || org.lead_owner.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{org.lead_owner.full_name || org.lead_owner.email}</div>
                    <div style={{ fontSize: '.73rem', color: 'var(--text3)' }}>{org.lead_owner.email}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modules & Add-ons */}
          <div className="card">
            <div className="card-h">
              <div>
                <div className="card-title">Modules & Add-ons</div>
                <div className="card-sub">{enabledOrgModules.length} module{enabledOrgModules.length !== 1 ? 's' : ''} enabled</div>
              </div>
              <Link href={`/organizations/${org.id}/edit`} className="btn btn-ghost btn-xs">
                <Edit3 size={11} /> Edit
              </Link>
            </div>
            <div className="card-b" style={{ padding: 0 }}>
              {enabledOrgModules.map((orgMod) => {
                const enabledAddons = orgMod.module.addons.filter((a) =>
                  orgMod.addon_ids.some((ai) => ai.id === a.id && ai.enabled)
                )
                return (
                  <div key={orgMod.module_id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--p-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={12} style={{ color: 'var(--p)' }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '.8rem', color: 'var(--text1)' }}>{orgMod.module.label}</span>
                      <span className="bx bx-green bx-no-dot" style={{ marginLeft: 'auto' }}>Active</span>
                    </div>
                    {enabledAddons.length > 0 && (
                      <div style={{ paddingLeft: 30, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {enabledAddons.map((a) => (
                          <span key={a.id} className="bx bx-teal bx-no-dot" style={{ fontSize: '.64rem' }}>
                            <Check size={9} />
                            {a.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {enabledAddons.length === 0 && (
                      <div style={{ paddingLeft: 30, fontSize: '.74rem', color: 'var(--text4)' }}>No add-ons enabled</div>
                    )}
                  </div>
                )
              })}
              {enabledOrgModules.length === 0 && (
                <div style={{ padding: '16px', fontSize: '.8rem', color: 'var(--text4)', textAlign: 'center' }}>No modules enabled</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users, Profiles & Fiscal Years tabs */}
      <div className="card">
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <div className="tab-row" style={{ display: 'inline-flex' }}>
            <button className={`tab ${activeTab === 'users' ? 'on' : ''}`} onClick={() => setActiveTab('users')}>
              <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
              Users ({org.org_users.length})
            </button>
            <button className={`tab ${activeTab === 'fiscal' ? 'on' : ''}`} onClick={() => setActiveTab('fiscal')}>
              <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
              Fiscal Years ({org.fiscal_years.length})
            </button>
            <button className={`tab ${activeTab === 'profiles' ? 'on' : ''}`} onClick={() => setActiveTab('profiles')}>
              <Shield size={12} style={{ display: 'inline', marginRight: 4 }} />
              Privilege Profiles
            </button>
          </div>
        </div>

        {/* Users tab */}
        {activeTab === 'users' && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-p btn-sm" disabled>
                <User size={12} /> Add User (coming soon)
              </button>
            </div>
            <div className="tw">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Code</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {org.org_users.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: 'var(--text4)' }}>
                        No users yet. Add the first super admin user.
                      </td>
                    </tr>
                  ) : (
                    org.org_users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="av" style={{ width: 28, height: 28, fontSize: '.65rem' }}>
                              {u.full_name.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 700 }}>{u.full_name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text3)' }}>{u.company_email}</td>
                        <td>
                          {u.employee_code ? <span className="bx bx-gray bx-no-dot">{u.employee_code}</span> : '—'}
                        </td>
                        <td style={{ color: 'var(--text3)' }}>{u.phone || '—'}</td>
                        <td>
                          <span className={`bx ${u.is_active ? 'bx-green' : 'bx-gray'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                          {new Date(u.created_at).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fiscal Years tab */}
        {activeTab === 'fiscal' && (
          <div className="tw">
            <table className="dt">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {org.fiscal_years.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '28px', color: 'var(--text4)' }}>
                      No fiscal years configured.
                    </td>
                  </tr>
                ) : (
                  org.fiscal_years.map((fy) => (
                    <tr key={fy.id}>
                      <td style={{ fontWeight: 600 }}>{fy.name}</td>
                      <td>{new Date(fy.start_date).toLocaleDateString('en-IN')}</td>
                      <td>{new Date(fy.end_date).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={`bx ${fy.is_active ? 'bx-green' : 'bx-gray'}`}>
                          {fy.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Profiles tab */}
        {activeTab === 'profiles' && (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text4)', fontSize: '.82rem' }}>
            <Shield size={28} style={{ display: 'block', margin: '0 auto 10px', opacity: .3 }} />
            User privilege profiles coming soon.
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="ov open" style={{ zIndex: 1001 }}>
          <div className="modal modal-sm">
            <div className="mh">
              <div className="mt">Delete Organization</div>
              <button className="xbtn" onClick={() => setDeleteConfirm(false)}><X size={14} /></button>
            </div>
            <div className="mb">
              <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 12 }}>
                Are you sure you want to delete <strong>{org.name}</strong>?
              </p>
              <p style={{ fontSize: '.78rem', color: 'var(--text3)' }}>
                This will permanently delete the organization and all associated data. This cannot be undone.
              </p>
            </div>
            <div className="mf">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
