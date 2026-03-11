import { useState, useLayoutEffect, useRef } from 'react'
import { useForm } from '@inertiajs/react'
import {
  Phone, Globe, MapPin, DollarSign, Clock,
  Calendar, Hash, Info, Save, Mail,
} from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────────

interface Props {
  company: Record<string, any>
}

// ── Tab definitions ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'info',    label: 'Company Info' },
  { key: 'contact', label: 'Contact Details' },
  { key: 'locale',  label: 'Locale Settings' },
]

// ── Field component ──────────────────────────────────────────────────────────────

function Field({
  label, required, hint, error, children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="fg">
      <label>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {children}
      {error  && <span className="fg-err">{error}</span>}
      {hint   && !error && <span className="fg-hint">{hint}</span>}
    </div>
  )
}

// ── Company Info Tab ─────────────────────────────────────────────────────────────

function CompanyInfoTab({ company }: { company: Record<string, any> }) {
  const { data, setData, put, processing, errors } = useForm({
    name:        company.name        ?? '',
    about:       company.about       ?? '',
    industry:    company.industry    ?? '',
    companySize: company.companySize ?? '',
    website:     company.website     ?? '',
    gstNo:       company.gstNo       ?? '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put('/hrms/organization/company')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="g2" style={{ marginBottom: 14 }}>
        <Field label="Company Name" required error={errors.name}>
          <input
            className="fi"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            placeholder="Acme Corp Ltd."
          />
        </Field>

        <Field label="Industry" hint="e.g. Technology, Healthcare, Finance" error={errors.industry}>
          <select
            className="fi fi-sel"
            value={data.industry}
            onChange={(e) => setData('industry', e.target.value)}
          >
            <option value="">Select industry</option>
            {[
              'Technology', 'Healthcare', 'Finance & Banking', 'Manufacturing',
              'Retail & E-commerce', 'Education', 'Real Estate', 'Hospitality',
              'Logistics & Supply Chain', 'Media & Entertainment', 'Consulting',
              'Agriculture', 'Construction', 'Energy & Utilities', 'Other',
            ].map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </Field>

        <Field label="Company Size" hint="Approximate headcount range" error={errors.companySize}>
          <select
            className="fi fi-sel"
            value={data.companySize}
            onChange={(e) => setData('companySize', e.target.value)}
          >
            <option value="">Select size</option>
            {['1–10', '11–50', '51–200', '201–500', '501–1000', '1001–5000', '5000+'].map((s) => (
              <option key={s} value={s}>{s} employees</option>
            ))}
          </select>
        </Field>

        <Field label="Website" hint="Full URL including https://" error={errors.website}>
          <div style={{ position: 'relative' }}>
            <Globe size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} />
            <input
              className="fi"
              style={{ paddingLeft: 32 }}
              type="url"
              value={data.website}
              onChange={(e) => setData('website', e.target.value)}
              placeholder="https://company.com"
            />
          </div>
        </Field>

        <Field label="GST Number" hint="15-digit GSTIN if applicable" error={errors.gstNo}>
          <div style={{ position: 'relative' }}>
            <Hash size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} />
            <input
              className="fi"
              style={{ paddingLeft: 32, textTransform: 'uppercase', letterSpacing: '.04em' }}
              type="text"
              value={data.gstNo}
              onChange={(e) => setData('gstNo', e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
          </div>
        </Field>
      </div>

      <Field label="About the Company" hint="Brief description of the organization" error={errors.about}>
        <textarea
          className="fi"
          rows={4}
          style={{ resize: 'vertical', lineHeight: 1.6 }}
          value={data.about}
          onChange={(e) => setData('about', e.target.value)}
          placeholder="We are a leading provider of..."
        />
      </Field>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button type="submit" className="btn btn-p" disabled={processing}>
          <Save size={14} />
          {processing ? 'Saving…' : 'Save Company Info'}
        </button>
      </div>
    </form>
  )
}

// ── Contact Details Tab ──────────────────────────────────────────────────────────

function ContactDetailsTab({ company }: { company: Record<string, any> }) {
  const { data, setData, put, processing, errors } = useForm({
    phone:   company.phone   ?? '',
    email:   company.email   ?? '',
    country: company.country ?? '',
    city:    company.city    ?? '',
    address: company.address ?? '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put('/hrms/organization/company')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="g2" style={{ marginBottom: 14 }}>
        <Field label="Phone Number" error={errors.phone}>
          <div style={{ position: 'relative' }}>
            <Phone size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} />
            <input
              className="fi"
              style={{ paddingLeft: 32 }}
              type="tel"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </Field>

        <Field label="Company Email" hint="Official contact email address" error={errors.email}>
          <div style={{ position: 'relative' }}>
            <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} />
            <input
              className="fi"
              style={{ paddingLeft: 32 }}
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder="contact@company.com"
            />
          </div>
        </Field>

        <Field label="Country" error={errors.country}>
          <div style={{ position: 'relative' }}>
            <MapPin size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} />
            <input
              className="fi"
              style={{ paddingLeft: 32 }}
              type="text"
              value={data.country}
              onChange={(e) => setData('country', e.target.value)}
              placeholder="India"
            />
          </div>
        </Field>

        <Field label="City" error={errors.city}>
          <input
            className="fi"
            type="text"
            value={data.city}
            onChange={(e) => setData('city', e.target.value)}
            placeholder="Mumbai"
          />
        </Field>
      </div>

      <Field label="Full Address" hint="Street address, area, state, PIN" error={errors.address}>
        <textarea
          className="fi"
          rows={3}
          style={{ resize: 'vertical', lineHeight: 1.6 }}
          value={data.address}
          onChange={(e) => setData('address', e.target.value)}
          placeholder="123, Business Park, Andheri East, Mumbai - 400069"
        />
      </Field>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button type="submit" className="btn btn-p" disabled={processing}>
          <Save size={14} />
          {processing ? 'Saving…' : 'Save Contact Details'}
        </button>
      </div>
    </form>
  )
}

// ── Locale Settings Tab ──────────────────────────────────────────────────────────

function LocaleSettingsTab({ company }: { company: Record<string, any> }) {
  const { data, setData, put, processing, errors } = useForm({
    currency:    company.currency    ?? '',
    timezone:    company.timezone    ?? '',
    dateFormat:  company.dateFormat  ?? '',
    timeFormat:  company.timeFormat  ?? '',
    fiscalName:  company.fiscalName  ?? '',
    fiscalStart: company.fiscalStart ?? '',
    fiscalEnd:   company.fiscalEnd   ?? '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put('/hrms/organization/company')
  }

  const TIMEZONES = [
    'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Dubai',
    'Asia/Singapore', 'Australia/Sydney',
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="g2" style={{ marginBottom: 14 }}>
        <Field label="Currency" hint="Default currency for payroll & expenses" error={errors.currency}>
          <div style={{ position: 'relative' }}>
            <DollarSign size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} />
            <select
              className="fi fi-sel"
              style={{ paddingLeft: 32 }}
              value={data.currency}
              onChange={(e) => setData('currency', e.target.value)}
            >
              <option value="">Select currency</option>
              {[
                { code: 'INR', label: 'Indian Rupee (₹)' },
                { code: 'USD', label: 'US Dollar ($)' },
                { code: 'EUR', label: 'Euro (€)' },
                { code: 'GBP', label: 'British Pound (£)' },
                { code: 'AED', label: 'UAE Dirham (د.إ)' },
                { code: 'SGD', label: 'Singapore Dollar (S$)' },
              ].map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </Field>

        <Field label="Timezone" error={errors.timezone}>
          <div style={{ position: 'relative' }}>
            <Clock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} />
            <select
              className="fi fi-sel"
              style={{ paddingLeft: 32 }}
              value={data.timezone}
              onChange={(e) => setData('timezone', e.target.value)}
            >
              <option value="">Select timezone</option>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </Field>

        <Field label="Date Format" error={errors.dateFormat}>
          <select
            className="fi fi-sel"
            value={data.dateFormat}
            onChange={(e) => setData('dateFormat', e.target.value)}
          >
            <option value="">Select date format</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY (31-12-2025)</option>
            <option value="DD MMM YYYY">DD MMM YYYY (31 Dec 2025)</option>
          </select>
        </Field>

        <Field label="Time Format" error={errors.timeFormat}>
          <select
            className="fi fi-sel"
            value={data.timeFormat}
            onChange={(e) => setData('timeFormat', e.target.value)}
          >
            <option value="">Select time format</option>
            <option value="12h">12-hour (2:30 PM)</option>
            <option value="24h">24-hour (14:30)</option>
          </select>
        </Field>

        <Field label="Fiscal Year Name" hint="e.g. FY 2025-26" error={errors.fiscalName}>
          <div style={{ position: 'relative' }}>
            <Calendar size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)', pointerEvents: 'none' }} />
            <input
              className="fi"
              style={{ paddingLeft: 32 }}
              type="text"
              value={data.fiscalName}
              onChange={(e) => setData('fiscalName', e.target.value)}
              placeholder="FY 2025-26"
            />
          </div>
        </Field>
      </div>

      <div className="g2" style={{ marginBottom: 14 }}>
        <Field label="Fiscal Year Start" error={errors.fiscalStart}>
          <input
            className="fi"
            type="date"
            value={data.fiscalStart}
            onChange={(e) => setData('fiscalStart', e.target.value)}
          />
        </Field>

        <Field label="Fiscal Year End" error={errors.fiscalEnd}>
          <input
            className="fi"
            type="date"
            value={data.fiscalEnd}
            onChange={(e) => setData('fiscalEnd', e.target.value)}
          />
        </Field>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button type="submit" className="btn btn-p" disabled={processing}>
          <Save size={14} />
          {processing ? 'Saving…' : 'Save Locale Settings'}
        </button>
      </div>
    </form>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function CompanyPage({ company }: Props) {
  const [activeTab, setActiveTab] = useState('info')

  // Sliding tab indicator
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

  const orgInitials = (company.name as string)?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <>
      {/* ── Page Header ── */}
      <div className="ph">
        <div>
          <div className="ph-title">Company Profile</div>
          <div className="ph-sub">Manage your organization's information, contact details, and regional settings</div>
        </div>
      </div>

      {/* ── Company Identity Card ── */}
      <div className="card" style={{ marginBottom: 18 }}>
        {/* Gradient hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--p) 0%, var(--s) 100%)',
          padding: '22px 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Logo placeholder */}
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                style={{ width: 56, height: 56, borderRadius: 14, border: '2px solid rgba(255,255,255,.3)', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                background: 'rgba(255,255,255,.22)', border: '2px solid rgba(255,255,255,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--fd)', fontSize: '1.1rem', fontWeight: 800, color: '#fff',
              }}>
                {orgInitials}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                {company.name || 'Company Name'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {[
                  company.orgId,
                  company.industry,
                  company.city && company.country ? `${company.city}, ${company.country}` : (company.city || company.country),
                ].filter(Boolean).map((pill, i) => (
                  <span key={i} style={{
                    padding: '4px 11px', borderRadius: 20,
                    background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.25)',
                    fontSize: '.72rem', fontWeight: 600, color: '#fff',
                  }}>
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            {company.website && (
              <a
                href={company.website} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.25)',
                  color: '#fff', fontSize: '.74rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0,
                }}
              >
                <Globe size={12} /> Visit
              </a>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="tab-bar" style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div ref={tabSegRef} className="tab-seg" style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 3, bottom: 3,
              left: slider.left, width: slider.width,
              background: 'var(--surface)', borderRadius: 7,
              boxShadow: '0 1px 4px rgba(0,0,0,.1)',
              transition: slider.ready ? 'left .22s cubic-bezier(.4,0,.2,1), width .22s cubic-bezier(.4,0,.2,1)' : 'none',
              opacity: slider.ready ? 1 : 0,
              pointerEvents: 'none', zIndex: 0,
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

      {/* ── Tab Content ── */}
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-title">
              {activeTab === 'info'    && 'Company Information'}
              {activeTab === 'contact' && 'Contact Details'}
              {activeTab === 'locale'  && 'Locale & Regional Settings'}
            </div>
            <div className="card-sub">
              {activeTab === 'info'    && 'Basic company profile and identity details'}
              {activeTab === 'contact' && 'Phone, email, and address information'}
              {activeTab === 'locale'  && 'Currency, timezone, date formats, and fiscal year'}
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            background: 'var(--p-lt)', border: '1px solid var(--p-mid)',
            fontSize: '.67rem', fontWeight: 700, color: 'var(--p)',
          }}>
            <Info size={11} />
            Changes apply to all modules
          </div>
        </div>
        <div className="card-b">
          {activeTab === 'info'    && <CompanyInfoTab company={company} />}
          {activeTab === 'contact' && <ContactDetailsTab company={company} />}
          {activeTab === 'locale'  && <LocaleSettingsTab company={company} />}
        </div>
      </div>
    </>
  )
}
