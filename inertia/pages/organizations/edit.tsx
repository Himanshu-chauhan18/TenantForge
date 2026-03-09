import { useState, useRef, useLayoutEffect } from 'react'
import { DateTime } from 'luxon'
import { Link, router } from '@inertiajs/react'
import { ArrowLeft, ExternalLink, Trash2, AlertTriangle } from 'lucide-react'
import { Modal } from '~/components/modal'
import type { Org, LeadOwnerOption } from './edit/types'
import { TABS, safeDate } from './edit/data'
import { OverviewTab } from './edit/OverviewTab'
import { BillingTab } from './edit/BillingTab'
import { UsersTab } from './edit/UsersTab'
import { ModulesTab } from './edit/ModulesTab'
import { FiscalTab } from './edit/FiscalTab'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  org: Org
  leadOwners: LeadOwnerOption[]
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditOrganization({ org, leadOwners }: Props) {
  const [activeTab,     setActiveTab]     = useState('overview')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // ── Tab slider (matches org datatable tab UI) ──
  const tabSegRef  = useRef<HTMLDivElement>(null)
  const tabBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [slider, setSlider] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    const seg = tabSegRef.current
    const btn = tabBtnRefs.current[activeTab]
    if (!seg || !btn) return
    const sr = seg.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    setSlider({ left: br.left - sr.left, width: br.width, ready: true })
  }, [activeTab])

  // ── Derived values for alerts (page-level) ──
  const planEndDt    = org.planEnd ? DateTime.fromISO(org.planEnd.includes('T') ? org.planEnd : org.planEnd + 'T00:00:00') : null
  const daysLeft     = planEndDt?.isValid ? Math.ceil(planEndDt.diff(DateTime.now(), 'days').days) : null
  const isNearExpiry = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7
  const isExpired    = daysLeft !== null && daysLeft < 0

  function handleDelete() {
    router.delete(`/organizations/${org.id}`)
    setDeleteConfirm(false)
  }

  return (
    <>
      {/* ── Alerts ── */}
      {isNearExpiry && (
        <div className="alert alert-warn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} />
          Plan expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>. Contact the organization to renew.
        </div>
      )}
      {isExpired && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} />
          Plan expired <strong>{Math.abs(daysLeft!)} day{Math.abs(daysLeft!) !== 1 ? 's' : ''} ago</strong>.
        </div>
      )}

      {/* ── Page header ── */}
      <div className="ph">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/organizations" className="ibtn"><ArrowLeft size={16} /></Link>
          <div>
            <div className="ph-title">{org.name}</div>
            <div className="ph-sub">{org.orgId} · Created {safeDate(org.createdAt)}</div>
          </div>
        </div>
        <div className="ph-right">
          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* ── Hero gradient card + tab bar ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        {/* Gradient hero */}
        <div style={{ background: 'linear-gradient(135deg, var(--p) 0%, var(--s) 100%)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -30, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 110, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, position: 'relative' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,.25)', border: '2px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--fd)', flexShrink: 0 }}>
              {org.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>{org.name}</div>
              <div style={{ fontSize: '.76rem', color: 'rgba(255,255,255,.8)', marginBottom: 10 }}>
                {org.orgId}{org.industry && ` · ${org.industry}`}{org.website && ` · ${org.website.replace(/^https?:\/\//, '')}`}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {[
                  org.planType === 'premium' ? 'Premium' : 'Trial',
                  org.status.charAt(0).toUpperCase() + org.status.slice(1),
                  ...(org.city || org.country ? [[org.city, org.country].filter(Boolean).join(', ')] : []),
                  ...(org.leadOwner ? [`Lead: ${org.leadOwner.name || org.leadOwner.email}`] : []),
                  ...(org.isArchived ? ['Archived'] : []),
                ].map((pill, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,.2)', fontSize: '.72rem', fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            {org.website && (
              <a href={org.website} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 8, background: 'rgba(255,255,255,.18)', color: '#fff', fontSize: '.75rem', fontWeight: 600, border: '1px solid rgba(255,255,255,.25)', textDecoration: 'none', flexShrink: 0 }}>
                <ExternalLink size={12} /> Visit
              </a>
            )}
          </div>
        </div>

        {/* Tab bar — same style as org datatable */}
        <div className="tab-bar">
          <div ref={tabSegRef} className="tab-seg">
            {/* Sliding indicator */}
            <div style={{
              position: 'absolute',
              top: 3, bottom: 3,
              left: slider.left,
              width: slider.width,
              background: 'var(--surface)',
              borderRadius: 7,
              boxShadow: '0 1px 4px rgba(0,0,0,.1)',
              transition: slider.ready ? 'left .22s cubic-bezier(.4,0,.2,1), width .22s cubic-bezier(.4,0,.2,1)' : 'none',
              opacity: slider.ready ? 1 : 0,
              pointerEvents: 'none',
              zIndex: 0,
            }} />
            {TABS.map((t) => (
              <button
                key={t.key}
                ref={(el) => { tabBtnRefs.current[t.key] = el }}
                className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'overview' && <OverviewTab org={org} leadOwners={leadOwners} />}
      {activeTab === 'plan'     && <BillingTab org={org} />}
      {activeTab === 'users'    && <UsersTab org={org} />}
      {activeTab === 'modules'  && <ModulesTab org={org} />}
      {activeTab === 'fiscal'   && <FiscalTab org={org} />}

      {/* ── Delete confirmation modal ── */}
      <Modal
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Delete Organization"
        size="sm"
        icon={<Trash2 size={15} />}
        variant="danger"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={13} /> Delete</button>
          </>
        }
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 10 }}>
          Are you sure you want to delete <strong>{org.name}</strong>?
        </p>
        <p style={{ fontSize: '.78rem', color: 'var(--text3)', lineHeight: 1.6 }}>
          This will permanently delete the organization and all associated data. This action <strong>cannot be undone</strong>.
        </p>
      </Modal>
    </>
  )
}
