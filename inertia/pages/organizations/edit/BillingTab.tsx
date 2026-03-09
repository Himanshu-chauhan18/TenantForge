import { useState } from 'react'
import { DateTime } from 'luxon'
import { router } from '@inertiajs/react'
import { Users, Clock, AlertTriangle, Sparkles, Save } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable } from '~/components/data-table'
import { Modal } from '~/components/modal'
import { DatePicker } from '~/components/date-picker'
import { SelectSearch } from '~/components/select-search'
import type { Org, BillingRecord } from './types'
import { safeDate, billingColumns } from './data'

interface Props { org: Org }

export function BillingTab({ org }: Props) {
  // ── Modal visibility ──
  const [showExtend,      setShowExtend]      = useState(false)
  const [showForceExpire, setShowForceExpire] = useState(false)
  const [showUpgrade,     setShowUpgrade]     = useState(false)

  // ── Modal form state ──
  const [extendDate,      setExtendDate]      = useState('')
  const [upgradeLimit,    setUpgradeLimit]    = useState(String(org.userLimit))
  const [upgradePlanType, setUpgradePlanType] = useState<'trial' | 'premium'>(org.planType)

  // ── Processing state ──
  const [procExtend,  setProcExtend]  = useState(false)
  const [procExpire,  setProcExpire]  = useState(false)
  const [procUpgrade, setProcUpgrade] = useState(false)

  // ── Derived values ──
  const planEndDt    = org.planEnd ? DateTime.fromISO(org.planEnd.includes('T') ? org.planEnd : org.planEnd + 'T00:00:00') : null
  const daysLeft     = planEndDt?.isValid ? Math.ceil(planEndDt.diff(DateTime.now(), 'days').days) : null
  const isNearExpiry = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7
  const isExpired    = daysLeft !== null && daysLeft < 0
  const userCount    = (org.orgUsers || []).length
  const userPct      = org.userLimit > 0 ? Math.min(100, Math.round((userCount / org.userLimit) * 100)) : 0
  const userBarColor = userCount > org.userLimit ? '#ef4444' : userPct > 80 ? '#f59e0b' : '#0ea5e9'

  // ── Handlers ──
  function handleExtend() {
    if (!extendDate) { toast.error('Please select a new end date.'); return }
    setProcExtend(true)
    router.put(`/organizations/${org.id}`, {
      name: org.name, planEnd: extendDate, status: org.status,
      planType: org.planType, userLimit: org.userLimit,
    }, {
      onSuccess: () => { setShowExtend(false); toast.success('Plan extended successfully.') },
      onError:   () => toast.error('Failed to extend plan. Please try again.'),
      onFinish:  () => setProcExtend(false),
    })
  }

  function handleForceExpire() {
    setProcExpire(true)
    router.put(`/organizations/${org.id}`, {
      name: org.name, status: 'expired', planType: org.planType, userLimit: org.userLimit,
    }, {
      onSuccess: () => { setShowForceExpire(false); toast.success('Plan marked as expired.') },
      onError:   () => toast.error('Failed to expire plan. Please try again.'),
      onFinish:  () => setProcExpire(false),
    })
  }

  function handleUpgrade() {
    const limit = Number(upgradeLimit)
    if (!limit || limit < 1) { toast.error('User limit must be at least 1.'); return }
    setProcUpgrade(true)
    router.put(`/organizations/${org.id}`, {
      name: org.name, planType: upgradePlanType, userLimit: limit, status: org.status,
    }, {
      onSuccess: () => { setShowUpgrade(false); toast.success('Plan updated successfully.') },
      onError:   () => toast.error('Failed to update plan. Please try again.'),
      onFinish:  () => setProcUpgrade(false),
    })
  }

  return (
    <>
      <div className="g2" style={{ alignItems: 'stretch', marginBottom: 16 }}>

        {/* ── Current Plan card ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Current Plan</div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                className="btn btn-sm"
                style={{ border: '1.5px solid var(--s)', color: 'var(--s)', background: 'transparent', borderRadius: 7, padding: '4px 11px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => { setUpgradePlanType(org.planType); setUpgradeLimit(String(org.userLimit)); setShowUpgrade(true) }}
              >
                Upgrade/Downgrade
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setExtendDate(org.planEnd ? (org.planEnd.includes('T') ? org.planEnd.slice(0, 10) : org.planEnd) : '')
                  setShowExtend(true)
                }}
              >
                Extend
              </button>
              <button
                className="btn btn-sm"
                style={{ border: '1.5px solid var(--danger)', color: 'var(--danger)', background: 'transparent', borderRadius: 7, padding: '4px 11px', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setShowForceExpire(true)}
              >
                Force Expire
              </button>
            </div>
          </div>
          <div className="card-b">
            {/* Row 1: PLAN, START DATE, END DATE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', background: 'var(--bg)' }}>
                <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 7 }}>Plan</div>
                <span className={`bx ${org.planType === 'premium' ? 'bx-teal' : 'bx-sky'}`}>
                  {org.planType === 'premium' ? 'Premium' : 'Trial'}
                </span>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', background: 'var(--bg)' }}>
                <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 7 }}>Start Date</div>
                <div style={{ fontSize: '.92rem', fontWeight: 700, color: 'var(--text1)' }}>{safeDate(org.planStart)}</div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', background: 'var(--bg)' }}>
                <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 7 }}>End Date</div>
                <div style={{ fontSize: '.92rem', fontWeight: 700, color: isExpired ? 'var(--danger)' : isNearExpiry ? 'var(--warn)' : 'var(--text1)' }}>
                  {safeDate(org.planEnd)}
                </div>
              </div>
            </div>

            {/* Row 2: USER LIMIT, CURRENT USERS, MRR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', background: 'var(--bg)' }}>
                <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 7 }}>User Limit</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text1)' }}>{org.userLimit}</div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', background: 'var(--bg)' }}>
                <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 7 }}>Current Users</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: userCount > org.userLimit ? 'var(--danger)' : userPct > 80 ? 'var(--warn)' : 'var(--text1)' }}>
                  {userCount}
                  <span style={{ fontSize: '.76rem', fontWeight: 600, marginLeft: 4, color: userCount > org.userLimit ? 'var(--danger)' : userPct > 80 ? 'var(--warn)' : 'var(--text3)' }}>
                    ({userPct}%)
                  </span>
                </div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', background: 'var(--bg)' }}>
                <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 7 }}>MRR</div>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text4)', fontStyle: 'italic' }}>Coming soon</div>
              </div>
            </div>

            {/* User Utilization bar */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: userCount > org.userLimit ? 'var(--danger-lt)' : userPct > 80 ? 'var(--warn-lt)' : 'rgba(14,165,233,.12)',
                  }}>
                    <Users size={13} style={{ color: userBarColor }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text2)', lineHeight: 1.2 }}>User Utilization</div>
                    <div style={{ fontSize: '.63rem', color: 'var(--text4)', lineHeight: 1.2 }}>active users vs. seat limit</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.88rem', fontWeight: 800, lineHeight: 1.2, color: userCount > org.userLimit ? 'var(--danger)' : userPct > 80 ? 'var(--warn)' : 'var(--text1)' }}>
                    {userCount} <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text3)' }}>/ {org.userLimit}</span>
                  </div>
                  <div style={{ fontSize: '.68rem', fontWeight: 700, lineHeight: 1.2, color: userCount > org.userLimit ? 'var(--danger)' : userPct > 80 ? 'var(--warn)' : 'var(--text3)' }}>
                    {userPct}%
                  </div>
                </div>
              </div>
              <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${Math.max(userPct, userPct > 0 ? 2 : 0)}%`, background: userBarColor, transition: 'width .4s cubic-bezier(.4,0,.2,1)' }} />
              </div>
              {userCount > org.userLimit && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, fontSize: '.7rem', fontWeight: 600, color: 'var(--danger)' }}>
                  <AlertTriangle size={11} /> Over limit by {userCount - org.userLimit} user{userCount - org.userLimit !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Billing History card ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Billing History</div>
            <button className="btn btn-ghost btn-sm" disabled>Export</button>
          </div>
          <DataTable<BillingRecord>
            data={[]}
            columns={billingColumns}
            rowKey={(r) => r.id}
            hideToolbar
            hideFooter
            emptyTitle="Coming Soon"
            emptyDesc="Billing history will be available here."
          />
        </div>
      </div>

      {/* ── Extend Plan modal ── */}
      <Modal
        open={showExtend}
        onClose={() => setShowExtend(false)}
        title="Extend Plan"
        size="sm"
        icon={<Clock size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowExtend(false)}>Cancel</button>
            <button className="btn btn-p" disabled={procExtend} onClick={handleExtend}>
              <Save size={13} /> {procExtend ? 'Saving…' : 'Extend Plan'}
            </button>
          </>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: '.84rem', color: 'var(--text2)', marginBottom: 14 }}>
            Set a new end date for <strong>{org.name}</strong>. The plan will be active until this date.
          </p>
          <div className="fg">
            <label>New End Date <span className="req">*</span></label>
            <DatePicker
              value={extendDate}
              onChange={setExtendDate}
              placeholder="Select new end date…"
              min={DateTime.now().toISODate()!}
            />
          </div>
        </div>
      </Modal>

      {/* ── Force Expire modal ── */}
      <Modal
        open={showForceExpire}
        onClose={() => setShowForceExpire(false)}
        title="Force Expire Plan"
        size="sm"
        icon={<AlertTriangle size={15} />}
        variant="danger"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowForceExpire(false)}>Cancel</button>
            <button className="btn btn-danger" disabled={procExpire} onClick={handleForceExpire}>
              {procExpire ? 'Processing…' : 'Force Expire'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '.85rem', color: 'var(--text2)', marginBottom: 10 }}>
          Are you sure you want to force expire the plan for <strong>{org.name}</strong>?
        </p>
        <p style={{ fontSize: '.78rem', color: 'var(--text3)', lineHeight: 1.6 }}>
          This will immediately set the organization's status to <strong>Expired</strong>. The organization will lose access until the plan is renewed.
        </p>
      </Modal>

      {/* ── Upgrade/Downgrade modal ── */}
      <Modal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Change Plan"
        size="sm"
        icon={<Sparkles size={15} />}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowUpgrade(false)}>Cancel</button>
            <button className="btn btn-p" disabled={procUpgrade} onClick={handleUpgrade}>
              <Save size={13} /> {procUpgrade ? 'Saving…' : 'Update Plan'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg">
            <label>Plan Type <span className="req">*</span></label>
            <SelectSearch
              value={upgradePlanType}
              onChange={(v) => { if (v) setUpgradePlanType(v as 'trial' | 'premium') }}
              options={[
                { value: 'trial',   label: 'Trial',   sub: 'Limited period evaluation plan' },
                { value: 'premium', label: 'Premium', sub: 'Full access paid plan' },
              ]}
              placeholder="Select plan type…"
            />
          </div>
          <div className="fg">
            <label>User Limit <span className="req">*</span></label>
            <input
              type="number"
              className="fi"
              min={1}
              max={100000}
              value={upgradeLimit}
              onChange={(e) => setUpgradeLimit(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
