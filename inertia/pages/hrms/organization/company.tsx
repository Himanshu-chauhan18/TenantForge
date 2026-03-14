import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useForm } from '@inertiajs/react'
import { Globe, Hash, Save, Info } from 'lucide-react'
import { CountrySelect, type CountryOption } from '~/components/country-select'
import { CitySelect, type CityOption } from '~/components/city-select'
import { SelectSearch, type SelectOption } from '~/components/select-search'
import { RadioGroup } from '~/components/radio-group'

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

// ── Static option lists ──────────────────────────────────────────────────────────

const INDUSTRY_OPTIONS: SelectOption[] = [
  'Technology', 'Healthcare', 'Finance & Banking', 'Manufacturing',
  'Retail & E-commerce', 'Education', 'Real Estate', 'Hospitality',
  'Logistics & Supply Chain', 'Media & Entertainment', 'Consulting',
  'Agriculture', 'Construction', 'Energy & Utilities', 'Other',
].map((v) => ({ value: v, label: v }))

const SIZE_OPTIONS: SelectOption[] = [
  { value: '1–10',     label: '1–10 employees' },
  { value: '11–50',    label: '11–50 employees' },
  { value: '51–200',   label: '51–200 employees' },
  { value: '201–500',  label: '201–500 employees' },
  { value: '501–1000', label: '501–1000 employees' },
  { value: '1001–5000',label: '1001–5000 employees' },
  { value: '5000+',    label: '5000+ employees' },
]

const CURRENCY_OPTIONS: SelectOption[] = [
  { value: 'INR', label: 'Indian Rupee',      sub: '₹' },
  { value: 'USD', label: 'US Dollar',         sub: '$' },
  { value: 'EUR', label: 'Euro',              sub: '€' },
  { value: 'GBP', label: 'British Pound',     sub: '£' },
  { value: 'AED', label: 'UAE Dirham',        sub: 'د.إ' },
  { value: 'SGD', label: 'Singapore Dollar',  sub: 'S$' },
  { value: 'JPY', label: 'Japanese Yen',      sub: '¥' },
  { value: 'CAD', label: 'Canadian Dollar',   sub: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', sub: 'A$' },
  { value: 'CHF', label: 'Swiss Franc',       sub: 'Fr' },
]

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'Asia/Kolkata',        label: 'Asia/Kolkata',        sub: 'IST (UTC+5:30)' },
  { value: 'UTC',                 label: 'UTC',                 sub: 'Coordinated Universal Time' },
  { value: 'America/New_York',    label: 'America/New_York',    sub: 'EST/EDT' },
  { value: 'America/Chicago',     label: 'America/Chicago',     sub: 'CST/CDT' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles', sub: 'PST/PDT' },
  { value: 'Europe/London',       label: 'Europe/London',       sub: 'GMT/BST' },
  { value: 'Europe/Paris',        label: 'Europe/Paris',        sub: 'CET/CEST' },
  { value: 'Europe/Berlin',       label: 'Europe/Berlin',       sub: 'CET/CEST' },
  { value: 'Asia/Dubai',          label: 'Asia/Dubai',          sub: 'GST (UTC+4)' },
  { value: 'Asia/Tokyo',          label: 'Asia/Tokyo',          sub: 'JST (UTC+9)' },
  { value: 'Asia/Singapore',      label: 'Asia/Singapore',      sub: 'SGT (UTC+8)' },
  { value: 'Asia/Shanghai',       label: 'Asia/Shanghai',       sub: 'CST (UTC+8)' },
  { value: 'Australia/Sydney',    label: 'Australia/Sydney',    sub: 'AEST/AEDT' },
]

const DATE_FORMAT_OPTIONS: SelectOption[] = [
  { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY', sub: '31/12/2025' },
  { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY', sub: '12/31/2025' },
  { value: 'yyyy/mm/dd', label: 'YYYY/MM/DD', sub: '2025/12/31' },
  { value: 'dd-mm-yyyy', label: 'DD-MM-YYYY', sub: '31-12-2025' },
  { value: 'mm-dd-yyyy', label: 'MM-DD-YYYY', sub: '12-31-2025' },
  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD', sub: '2025-12-31' },
]

const TIME_FORMAT_OPTIONS = [
  { value: '12', label: '12-hour', desc: 'e.g. 2:30 PM' },
  { value: '24', label: '24-hour', desc: 'e.g. 14:30' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────────

// Normalise a raw DB value to the canonical option value via case-insensitive
// lookup.  Returns the option's own .value (correctly cased) when found, or the
// original raw string when no option matches.
function matchOption(options: SelectOption[], raw: string): string {
  if (!raw) return ''
  const exact = options.find((o) => o.value === raw)
  if (exact) return exact.value
  const ci = options.find((o) => o.value.toLowerCase() === raw.toLowerCase())
  return ci ? ci.value : raw
}

// Map every reasonable stored variant of the time-format flag to '12' or '24'
// (matching the DB ENUM values exactly).
function normalizeTimeFormat(raw: string): string {
  if (!raw) return '12'
  const v = raw.toLowerCase().replace(/[^0-9a-z]/g, '')  // strip dashes/spaces
  if (v.includes('24') || v === 'h24') return '24'
  return '12'  // '12h', '12hour', 'h12', '12', anything else → 12h default
}

// Ensures the currently-stored value always appears in the options list so
// SelectSearch can display it even if it doesn't match any predefined entry.
function withCurrent(options: SelectOption[], value: string): SelectOption[] {
  if (!value || options.some((o) => o.value === value)) return options
  return [{ value, label: value }, ...options]
}

// ── Field component ──────────────────────────────────────────────────────────────

function Field({
  label, required, hint, error, children, className,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`fg${className ? ` ${className}` : ''}`}>
      <label>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {children}
      {error && <span className="fg-err">{error}</span>}
      {hint && !error && <span className="fg-hint">{hint}</span>}
    </div>
  )
}

// ── Company Info Tab ─────────────────────────────────────────────────────────────

function CompanyInfoTab({ company }: { company: Record<string, any> }) {
  const { data, setData, put, processing, errors } = useForm({
    name:        String(company.name        || ''),
    about:       String(company.about       || ''),
    industry:    String(company.industry    || ''),
    companySize: String(company.companySize || ''),
    website:     String(company.website     || ''),
    gstNo:       String(company.gstNo       || ''),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put('/hrms/organization/company')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="g3" style={{ marginBottom: 14 }}>
        <Field label="Company Name" required error={errors.name}>
          <input
            className="fi"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            placeholder="Acme Corp Ltd."
          />
        </Field>

        <Field label="Industry" hint="e.g. Technology, Healthcare" error={errors.industry}>
          <SelectSearch
            value={data.industry}
            onChange={(v) => setData('industry', v)}
            options={withCurrent(INDUSTRY_OPTIONS, data.industry)}
            placeholder="Select industry…"
          />
        </Field>

        <Field label="Company Size" hint="Approximate headcount range" error={errors.companySize}>
          <SelectSearch
            value={data.companySize}
            onChange={(v) => setData('companySize', v)}
            options={withCurrent(SIZE_OPTIONS, data.companySize)}
            placeholder="Select size…"
          />
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
    phone:   String(company.phone   || ''),
    email:   String(company.email   || ''),
    country: String(company.country || ''),
    city:    String(company.city    || ''),
    address: String(company.address || ''),
    pincode: String(company.pincode || ''),
  })

  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null)
  const [selectedCity,    setSelectedCity]    = useState<CityOption | null>(null)

  // Pre-populate CountrySelect from the saved string value on mount
  useEffect(() => {
    const savedCountry = company.country as string
    if (!savedCountry) return
    fetch(`/api/countries?search=${encodeURIComponent(savedCountry)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: CountryOption[]) => {
        const match = list.find(
          (c) => c.name.toLowerCase() === savedCountry.toLowerCase()
        )
        if (match) setSelectedCountry(match)
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-populate CitySelect once the country object is available
  useEffect(() => {
    const savedCity = company.city as string
    if (!selectedCountry || !savedCity) return
    fetch(`/api/cities?country_id=${selectedCountry.id}&search=${encodeURIComponent(savedCity)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: CityOption[]) => {
        const match = list.find(
          (c) => c.name.toLowerCase() === savedCity.toLowerCase()
        )
        if (match) setSelectedCity(match)
      })
      .catch(() => {})
  }, [selectedCountry]) // eslint-disable-line react-hooks/exhaustive-deps

  const isIndia = data.country.toLowerCase().trim() === 'india'

  function handleCountryChange(o: CountryOption | null) {
    setSelectedCountry(o)
    setSelectedCity(null)
    setData((d) => ({ ...d, country: o?.name ?? '', city: '', pincode: '' }))
  }

  function handleCityChange(o: CityOption | null) {
    setSelectedCity(o)
    setData('city', o?.name ?? '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put('/hrms/organization/company')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="g3" style={{ marginBottom: 14 }}>
        <Field label="Phone Number" error={errors.phone}>
          <input
            className="fi"
            type="tel"
            value={data.phone}
            onChange={(e) => setData('phone', e.target.value)}
            placeholder="+91 98765 43210"
          />
        </Field>

        <Field label="Company Email" hint="Official contact email address" error={errors.email}>
          <input
            className="fi"
            type="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            placeholder="contact@company.com"
          />
        </Field>

        <Field label="Country" error={errors.country}>
          <CountrySelect
            value={selectedCountry}
            onChange={handleCountryChange}
          />
        </Field>

        <Field label="City" error={errors.city}>
          <CitySelect
            value={selectedCity}
            onChange={handleCityChange}
            countryId={selectedCountry?.id ?? null}
          />
        </Field>

        {isIndia && (
          <Field label="PIN Code" hint="6-digit Indian postal code" error={errors.pincode}>
            <input
              className="fi"
              type="text"
              inputMode="numeric"
              value={data.pincode}
              onChange={(e) => setData('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="400069"
              maxLength={6}
            />
          </Field>
        )}
      </div>

      <Field label="Full Address" hint="Street address, area, state" error={errors.address}>
        <textarea
          className="fi"
          rows={3}
          style={{ resize: 'vertical', lineHeight: 1.6 }}
          value={data.address}
          onChange={(e) => setData('address', e.target.value)}
          placeholder="123, Business Park, Andheri East, Mumbai"
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
    currency:   matchOption(CURRENCY_OPTIONS,     String(company.currency   || '')),
    timezone:   matchOption(TIMEZONE_OPTIONS,     String(company.timezone   || '')),
    dateFormat: matchOption(DATE_FORMAT_OPTIONS,  String(company.dateFormat || '')),
    timeFormat: normalizeTimeFormat(String(company.timeFormat || '')),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put('/hrms/organization/company')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="g3" style={{ marginBottom: 14 }}>
        <Field label="Currency" hint="Default for payroll & expenses" error={errors.currency}>
          <SelectSearch
            value={data.currency}
            onChange={(v) => setData('currency', v)}
            options={withCurrent(CURRENCY_OPTIONS, data.currency)}
            placeholder="Select currency…"
          />
        </Field>

        <Field label="Timezone" error={errors.timezone}>
          <SelectSearch
            value={data.timezone}
            onChange={(v) => setData('timezone', v)}
            options={withCurrent(TIMEZONE_OPTIONS, data.timezone)}
            placeholder="Select timezone…"
          />
        </Field>

        <Field label="Date Format" error={errors.dateFormat}>
          <SelectSearch
            value={data.dateFormat}
            onChange={(v) => setData('dateFormat', v)}
            options={withCurrent(DATE_FORMAT_OPTIONS, data.dateFormat)}
            placeholder="Select date format…"
          />
        </Field>
      </div>

      <Field label="Time Format" hint="How time is displayed across the system" error={errors.timeFormat}>
        <div style={{ paddingTop: 6 }}>
          <RadioGroup
            name="timeFormat"
            value={data.timeFormat}
            onChange={(v) => setData('timeFormat', v)}
            options={TIME_FORMAT_OPTIONS}
          />
        </div>
      </Field>

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
                  company.city && company.country
                    ? `${company.city}, ${company.country}`
                    : (company.city || company.country),
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
              {activeTab === 'locale'  && 'Currency, timezone, and date/time format'}
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
          {activeTab === 'info'    && <CompanyInfoTab    company={company} />}
          {activeTab === 'contact' && <ContactDetailsTab company={company} />}
          {activeTab === 'locale'  && <LocaleSettingsTab company={company} />}
        </div>
      </div>
    </>
  )
}
