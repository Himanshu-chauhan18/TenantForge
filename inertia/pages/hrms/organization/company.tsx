import { useState, useEffect, useLayoutEffect, useRef, memo } from 'react'
import { useForm } from '@inertiajs/react'
import { Globe, Hash, Save, Info, Phone } from 'lucide-react'
import { CountrySelect, type CountryOption } from '~/components/country-select'
import { CitySelect, type CityOption } from '~/components/city-select'
import { SelectSearch } from '~/components/select-search'
import { SelectCurrency } from '~/components/select-currency'
import { SelectTimezone } from '~/components/select-timezone'
import { SelectDateFormat } from '~/components/select-date-format'
import { SelectTimeFormat } from '~/components/select-time-format'
import { INDUSTRIES, COMPANY_SIZES, DATE_FORMATS } from '~/data/org-options'

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

// ── Option lists from shared data ────────────────────────────────────────────────

const INDUSTRY_OPTIONS = INDUSTRIES.map((v) => ({ value: v, label: v }))
const SIZE_OPTIONS      = COMPANY_SIZES.map((v) => ({ value: v, label: `${v} employees` }))

// ── Helpers ──────────────────────────────────────────────────────────────────────

// Ensure a stored value always appears in the list (handles DB values that don't
// match a canonical option after data migration / option-list changes).
function withCurrent<T extends { value: string; label: string }>(options: T[], value: string): T[] {
  if (!value || options.some((o) => o.value === value)) return options
  return [{ ...options[0], value, label: value } as T, ...options]
}

// Map stored timeFormat variants to '12h' | '24h' (values SelectTimeFormat expects).
function normalizeTimeFormat(raw: string): string {
  if (!raw) return '12h'
  const v = raw.toLowerCase().replace(/[^0-9a-z]/g, '')
  return v.includes('24') || v === 'h24' ? '24h' : '12h'
}

// Case-insensitive match against DATE_FORMATS; falls back to first format.
function matchDateFormat(raw: string): string {
  if (!raw) return DATE_FORMATS[0].value
  const exact = DATE_FORMATS.find((f) => f.value === raw)
  if (exact) return exact.value
  const ci = DATE_FORMATS.find((f) => f.value.toLowerCase() === raw.toLowerCase())
  return ci ? ci.value : DATE_FORMATS[0].value
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

const ContactDetailsTab = memo(function ContactDetailsTab({
  company,
  selectedCountry,
  selectedCity,
  onCountryChange,
  onCityChange,
}: {
  company: Record<string, any>
  selectedCountry: CountryOption | null
  selectedCity: CityOption | null
  onCountryChange: (o: CountryOption | null) => void
  onCityChange: (o: CityOption | null) => void
}) {
  const { data, setData, put, processing, errors, setError, clearErrors } = useForm({
    phone:   String(company.phone   || ''),
    email:   String(company.email   || ''),
    country: String(company.country || ''),
    city:    String(company.city    || ''),
    address: String(company.address || ''),
    pincode: String(company.pincode || ''),
  })

  function handleCountryChange(o: CountryOption | null) {
    onCountryChange(o)
    onCityChange(null)
    clearErrors('country')
    setData((d) => ({ ...d, country: o?.name ?? '', city: '', pincode: '' }))
  }

  function handleCityChange(o: CityOption | null) {
    onCityChange(o)
    clearErrors('city')
    setData('city', o?.name ?? '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Client-side required validation
    let valid = true
    if (!data.country.trim()) { setError('country', 'Country is required.'); valid = false }
    if (!data.city.trim())    { setError('city',    'City is required.');    valid = false }
    if (!data.phone.trim())   { setError('phone',   'Phone is required.');   valid = false }
    if (!data.email.trim())   { setError('email',   'Email is required.');   valid = false }
    if (!valid) return
    put('/hrms/organization/company')
  }

  // Phone prefix derived from selected country
  const phonePrefix = selectedCountry
    ? `${selectedCountry.emoji}  +${selectedCountry.phonecode}`
    : null

  return (
    <form onSubmit={handleSubmit}>
      <div className="g3" style={{ marginBottom: 14 }}>

        {/* Country */}
        <Field label="Country" required error={errors.country}>
          <CountrySelect
            value={selectedCountry}
            onChange={handleCountryChange}
          />
        </Field>

        {/* City */}
        <Field label="City" required error={errors.city}>
          <CitySelect
            value={selectedCity}
            onChange={handleCityChange}
            countryId={selectedCountry?.id ?? null}
          />
        </Field>

        {/* Phone with country prefix */}
        <Field label="Phone Number" required error={errors.phone}>
          <div className="fi" style={{ display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
              padding: '0 10px', alignSelf: 'stretch',
              background: 'var(--bg2)',
              borderRight: '1.5px solid var(--border)',
              fontSize: '.8rem', fontWeight: 600, color: 'var(--text2)',
              whiteSpace: 'nowrap',
            }}>
              {phonePrefix ?? <Phone size={13} style={{ color: 'var(--text4)' }} />}
            </div>
            <input
              style={{
                flex: 1, padding: '9px 12px',
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: '.82rem', color: 'var(--text1)',
              }}
              type="tel"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              placeholder={selectedCountry ? '98765 43210' : '+1 555 000 0000'}
            />
          </div>
        </Field>

        {/* Email */}
        <Field label="Company Email" required hint="Official contact email address" error={errors.email}>
          <input
            className="fi"
            type="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            placeholder="contact@company.com"
          />
        </Field>

        {/* Postal code — shown for all countries */}
        <Field label="Postal / PIN Code" error={errors.pincode}>
          <input
            className="fi"
            type="text"
            inputMode="numeric"
            value={data.pincode}
            onChange={(e) => setData('pincode', e.target.value)}
            placeholder="e.g. 400069"
            maxLength={10}
          />
        </Field>
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
})

// ── Locale Settings Tab ──────────────────────────────────────────────────────────

const LocaleSettingsTab = memo(function LocaleSettingsTab({
  company,
  selectedCountry,
}: {
  company: Record<string, any>
  selectedCountry: CountryOption | null
}) {
  const { data, setData, put, processing, errors, setError, clearErrors } = useForm({
    currency:   String(company.currency   || ''),
    timezone:   String(company.timezone   || ''),
    dateFormat: matchDateFormat(String(company.dateFormat || '')),
    timeFormat: normalizeTimeFormat(String(company.timeFormat || '')),
  })

  // When country changes and it has a single currency, auto-select it
  useEffect(() => {
    if (selectedCountry?.currency) {
      setData('currency', selectedCountry.currency)
      clearErrors('currency')
    }
  }, [selectedCountry?.currency]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Client-side required validation
    let valid = true
    if (!data.currency.trim())   { setError('currency',   'Currency is required.');    valid = false }
    if (!data.timezone.trim())   { setError('timezone',   'Timezone is required.');    valid = false }
    if (!data.dateFormat.trim()) { setError('dateFormat', 'Date format is required.'); valid = false }
    if (!data.timeFormat.trim()) { setError('timeFormat', 'Time format is required.'); valid = false }
    if (!valid) return
    put('/hrms/organization/company')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="g3" style={{ marginBottom: 20 }}>

        {/* Currency — scoped to selected country */}
        <Field label="Currency" required hint="Default for payroll & expenses" error={errors.currency}>
          <SelectCurrency
            value={data.currency}
            onChange={(v) => { setData('currency', v); clearErrors('currency') }}
            country={selectedCountry}
          />
        </Field>

        {/* Timezone — scoped to selected country */}
        <Field label="Timezone" required error={errors.timezone}>
          <SelectTimezone
            value={data.timezone}
            onChange={(v) => { setData('timezone', v); clearErrors('timezone') }}
            country={selectedCountry}
          />
        </Field>
      </div>

      {/* Date Format — card-style picker */}
      <Field label="Date Format" required error={errors.dateFormat}>
        <div style={{ marginTop: 6 }}>
          <SelectDateFormat
            value={data.dateFormat}
            onChange={(v) => { setData('dateFormat', v); clearErrors('dateFormat') }}
          />
        </div>
      </Field>

      {/* Time Format — card-style picker */}
      <Field label="Time Format" required hint="How time is displayed across the system" error={errors.timeFormat} className="mt-3">
        <div style={{ marginTop: 6 }}>
          <SelectTimeFormat
            value={data.timeFormat}
            onChange={(v) => { setData('timeFormat', v); clearErrors('timeFormat') }}
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
})

// ── Main Component ──────────────────────────────────────────────────────────────

export default function CompanyPage({ company }: Props) {
  const [activeTab, setActiveTab] = useState('info')

  // Shared country/city state — needed by both Contact tab (pickers) and
  // Locale tab (for scoping currency & timezone to the selected country).
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null)
  const [selectedCity,    setSelectedCity]    = useState<CityOption    | null>(null)

  // Pre-populate country from saved value on mount
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

  // Pre-populate city once country is resolved
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
          {activeTab === 'info' && (
            <CompanyInfoTab company={company} />
          )}
          {activeTab === 'contact' && (
            <ContactDetailsTab
              company={company}
              selectedCountry={selectedCountry}
              selectedCity={selectedCity}
              onCountryChange={setSelectedCountry}
              onCityChange={setSelectedCity}
            />
          )}
          {activeTab === 'locale' && (
            <LocaleSettingsTab
              company={company}
              selectedCountry={selectedCountry}
            />
          )}
        </div>
      </div>
    </>
  )
}
