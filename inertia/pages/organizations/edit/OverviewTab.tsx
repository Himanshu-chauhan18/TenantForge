import React, { useState, useEffect, useRef } from 'react'
import { DateTime } from 'luxon'
import { router } from '@inertiajs/react'
import {
  Building2, MapPin, Globe, Shield,
  Users, Clock, Layers,
  Edit3, Save, X,
  LogIn, Phone, Mail,
} from 'lucide-react'
import { toast } from 'sonner'
import { SelectSearch } from '~/components/select-search'
import { CountrySelect, type CountryOption } from '~/components/country-select'
import { CitySelect, type CityOption } from '~/components/city-select'
import { PhoneInput } from '~/components/phone-input'
import { DatePicker } from '~/components/date-picker'
import { INDUSTRIES, COMPANY_SIZES, DATE_FORMATS } from '~/data/org-options'
import type { Org, LeadOwnerOption } from './types'
import { safeDate, avColor, initials } from './data'

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, mono, accent, full }: {
  label: string; value?: string | null; mono?: boolean; accent?: string; full?: boolean
}) {
  return (
    <div style={full ? { gridColumn: '1/-1' } : undefined}>
      <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontSize: '.81rem', fontWeight: 600, lineHeight: 1.4,
        color: value ? (accent || 'var(--text1)') : 'var(--text4)',
        fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all',
      }}>
        {value || '—'}
      </div>
    </div>
  )
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  icon, iconBg, iconColor, title, sub,
  editing, processing,
  onEdit, onSave, onCancel,
  children, editChildren,
}: {
  icon: React.ReactElement; iconBg: string; iconColor: string; title: string; sub?: string
  editing: boolean; processing: boolean
  onEdit: () => void; onSave: () => void; onCancel: () => void
  children: React.ReactNode; editChildren: React.ReactNode
}) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-h" style={{ gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {React.cloneElement(icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, { size: 13, style: { color: iconColor } })}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '.8rem', color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            {sub && <div style={{ fontSize: '.67rem', color: 'var(--text3)', marginTop: 1 }}>{sub}</div>}
          </div>
        </div>
        {!editing ? (
          <button className="btn btn-xs btn-ghost" onClick={onEdit} style={{ flexShrink: 0 }}>
            <Edit3 size={11} /> Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            <button className="btn btn-xs btn-ghost" onClick={onCancel}><X size={11} /> Cancel</button>
            <button className="btn btn-xs btn-p" disabled={processing} onClick={onSave}>
              <Save size={11} /> {processing ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>
      <div className="card-b" style={{ flex: 1 }}>
        {!editing ? children : editChildren}
      </div>
    </div>
  )
}

// ─── StatBar ──────────────────────────────────────────────────────────────────

function StatBar({
  icon, iconBg, iconColor, label, label2, pct, barColor, value,
}: {
  icon: React.ReactElement; iconBg: string; iconColor: string; label: string; label2?: string
  pct: number; barColor: string; value: React.ReactNode
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {React.cloneElement(icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, { size: 12, style: { color: iconColor } })}
          </div>
          <div>
            <div style={{ fontSize: '.73rem', fontWeight: 700, color: 'var(--text2)', lineHeight: 1.2 }}>{label}</div>
            {label2 && <div style={{ fontSize: '.62rem', color: 'var(--text4)', lineHeight: 1.2 }}>{label2}</div>}
          </div>
        </div>
        <div style={{ fontSize: '.78rem', fontWeight: 800, color: 'var(--text1)', whiteSpace: 'nowrap' }}>
          {value}
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: 'var(--bg2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, width: `${Math.max(pct, pct > 0 ? 3 : 0)}%`, background: barColor, transition: 'width .4s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  )
}

// ─── OverviewTab ──────────────────────────────────────────────────────────────

interface Props {
  org: Org
  leadOwners: LeadOwnerOption[]
}

export function OverviewTab({ org, leadOwners }: Props) {
  // ── Section edit states ──
  const [editingCompany, setEditingCompany] = useState(false)
  const [editingContact, setEditingContact] = useState(false)
  const [editingLocale,  setEditingLocale]  = useState(false)
  const [editingAdmin,   setEditingAdmin]   = useState(false)
  const [procCompany, setProcCompany] = useState(false)
  const [procContact, setProcContact] = useState(false)
  const [procLocale,  setProcLocale]  = useState(false)
  const [procAdmin,   setProcAdmin]   = useState(false)
  const [procReset,   setProcReset]   = useState(false)

  // ── Company form state ──
  const [dName,        setDName]        = useState(org.name)
  const [dIndustry,    setDIndustry]    = useState(org.industry || '')
  const [dCompanySize, setDCompanySize] = useState(org.companySize || '')
  const [dWebsite,     setDWebsite]     = useState(org.website || '')
  const [dGstNo,       setDGstNo]       = useState(org.gstNo || '')
  const [dAbout,       setDAbout]       = useState(org.about || '')
  const [dStatus,      setDStatus]      = useState<'active' | 'inactive' | 'expired'>(org.status)

  // ── Contact form state ──
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null)
  const [selectedCity,    setSelectedCity]    = useState<CityOption | null>(null)
  const initCountryRef = useRef<CountryOption | null>(null)
  const initCityRef    = useRef<CityOption | null>(null)
  const [dPhone,       setDPhone]       = useState(org.phone || '')
  const [dEmail,       setDEmail]       = useState(org.email || '')
  const [dAddress,     setDAddress]     = useState(org.address || '')
  const [dLeadOwnerId, setDLeadOwnerId] = useState(org.leadOwnerId ? String(org.leadOwnerId) : '')

  // ── Locale form state ──
  const [dCurrency,   setDCurrency]   = useState(org.currency || 'INR')
  const [dTimezone,   setDTimezone]   = useState(org.timezone || 'Asia/Kolkata')
  const [dDateFormat, setDDateFormat] = useState(() => {
    const stored = org.dateFormat || ''
    const match  = DATE_FORMATS.find((f) => f.value.toLowerCase() === stored.toLowerCase())
    return match ? match.value : 'DD/MM/YYYY'
  })
  const [dTimeFormat, setDTimeFormat] = useState(org.timeFormat || '12')

  // ── API option lists ──
  const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string; sub: string }[]>([])
  const [timezoneOptions, setTimezoneOptions] = useState<{ value: string; label: string }[]>([])

  // ── Super admin form state ──
  const superAdmin = (org.orgUsers || [])[0] ?? null
  const [aName,   setAName]   = useState(superAdmin?.fullName || '')
  const [aCode,   setACode]   = useState(superAdmin?.employeeCode || '')
  const [aPhone,  setAPhone]  = useState(superAdmin?.phone || '')
  const [aGender, setAGender] = useState(superAdmin?.gender || '')
  const [aDob,    setADob]    = useState(() => {
    const dob = superAdmin?.dateOfBirth || ''
    if (!dob) return ''
    return dob.includes('T') ? dob.slice(0, 10) : dob
  })

  // ── Fetch currencies & timezones ──
  useEffect(() => {
    fetch('/api/currencies')
      .then((r) => r.ok ? r.json() : [])
      .then((data: { code: string; name: string; symbol: string }[]) =>
        setCurrencyOptions(data.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}`, sub: c.symbol })))
      ).catch(() => {})
    fetch('/api/timezones')
      .then((r) => r.ok ? r.json() : [])
      .then((data: { value: string; label: string }[]) => setTimezoneOptions(data))
      .catch(() => {})
  }, [])

  // ── Pre-populate country/city selects ──
  useEffect(() => {
    if (!org.country) return
    fetch(`/api/countries?search=${encodeURIComponent(org.country)}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: CountryOption[]) => {
        const match = data.find((c) => c.name.toLowerCase() === org.country!.toLowerCase())
        if (!match) return
        setSelectedCountry(match)
        initCountryRef.current = match
        if (!org.city) return
        fetch(`/api/cities?country_id=${match.id}&search=${encodeURIComponent(org.city)}`)
          .then((r) => r.ok ? r.json() : [])
          .then((cities: CityOption[]) => {
            const cm = cities.find((c) => c.name.toLowerCase() === org.city!.toLowerCase())
            if (cm) { setSelectedCity(cm); initCityRef.current = cm }
          }).catch(() => {})
      }).catch(() => {})
  }, [])

  // ── Derived values ──
  const now         = DateTime.now()
  const planEndDt   = org.planEnd ? DateTime.fromISO(org.planEnd.includes('T') ? org.planEnd : org.planEnd + 'T00:00:00') : null
  const planStartDt = org.planStart ? DateTime.fromISO(org.planStart.includes('T') ? org.planStart : org.planStart + 'T00:00:00') : null
  const daysLeft      = planEndDt?.isValid ? Math.ceil(planEndDt.diff(now, 'days').days) : null
  const isNearExpiry  = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7
  const isExpired     = daysLeft !== null && daysLeft < 0
  const enabledModules = (org.modules || []).filter((m) => m.enabled)
  const userCount      = (org.orgUsers || []).length
  const userPct = org.userLimit > 0 ? Math.min(100, Math.round((userCount / org.userLimit) * 100)) : 0
  const modPct  = (org.modules || []).length > 0
    ? Math.round((enabledModules.length / (org.modules || []).length) * 100)
    : 0
  const planPct = (planStartDt?.isValid && planEndDt?.isValid && planEndDt > planStartDt)
    ? Math.min(100, Math.max(0, Math.round((now.diff(planStartDt, 'milliseconds').milliseconds / planEndDt.diff(planStartDt, 'milliseconds').milliseconds) * 100)))
    : 0
  const planBarColor = isExpired || planPct >= 90 ? '#ef4444' : planPct >= 70 ? '#f59e0b' : 'var(--p)'
  const userBarColor = userCount > org.userLimit ? '#ef4444' : userPct > 80 ? '#f59e0b' : '#0ea5e9'

  // ── Option arrays ──
  const leadOwnerOptions = leadOwners.map((o) => ({ value: String(o.id), label: o.name, sub: o.designation || o.email }))
  const sizeOptions      = COMPANY_SIZES.map((s) => ({ value: s, label: `${s} employees` }))
  const industryOptions  = INDUSTRIES.map((i) => ({ value: i, label: i }))
  const dateFormatOptions = DATE_FORMATS.map((f) => ({ value: f.value, label: `${f.value}  (e.g. ${f.example})` }))
  const timeFormatOptions = [
    { value: '12', label: '12-hour  (e.g. 1:30 PM)' },
    { value: '24', label: '24-hour  (e.g. 13:30)' },
  ]
  const genderOptions = [
    { value: 'male',   label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other',  label: 'Other' },
  ]

  // ── Base fields sent with every org update ──
  const baseFields = { planType: org.planType, userLimit: org.userLimit }

  // ── Save functions ──
  function saveCompany() {
    if (!dName.trim()) { toast.error('Organization name is required.'); return }
    setProcCompany(true)
    router.put(`/organizations/${org.id}`, {
      name: dName, industry: dIndustry || null, companySize: dCompanySize || null,
      website: dWebsite || null, gstNo: dGstNo || null, about: dAbout || null,
      status: dStatus, ...baseFields,
    }, {
      onSuccess: () => { setEditingCompany(false); toast.success('Company details updated.') },
      onError:   () => toast.error('Failed to update company details. Please try again.'),
      onFinish:  () => setProcCompany(false),
    })
  }

  async function saveContact() {
    if (!dPhone.trim()) { toast.error('Phone is required.'); return }
    if (!dEmail.trim()) { toast.error('Email is required.'); return }
    const checks = await Promise.all([
      dEmail !== org.email
        ? fetch(`/organizations/check-email?email=${encodeURIComponent(dEmail)}&excludeId=${org.id}`).then((r) => r.json())
        : Promise.resolve({ exists: false }),
      dPhone !== org.phone
        ? fetch(`/organizations/check-phone?phone=${encodeURIComponent(dPhone)}&excludeId=${org.id}`).then((r) => r.json())
        : Promise.resolve({ exists: false }),
    ])
    if (checks[0].exists) { toast.error('An organization with this email already exists.'); return }
    if (checks[1].exists) { toast.error('An organization with this phone number already exists.'); return }
    setProcContact(true)
    router.put(`/organizations/${org.id}`, {
      name: org.name,
      country: selectedCountry?.name || org.country || null,
      city: selectedCity?.name || org.city || null,
      phone: dPhone, email: dEmail, address: dAddress || null,
      leadOwnerId: dLeadOwnerId ? Number(dLeadOwnerId) : null,
      status: org.status, ...baseFields,
    }, {
      onSuccess: () => { setEditingContact(false); toast.success('Location & contact updated.') },
      onError:   () => toast.error('Failed to update location & contact. Please try again.'),
      onFinish:  () => setProcContact(false),
    })
  }

  function saveLocale() {
    if (!dCurrency)   { toast.error('Currency is required.'); return }
    if (!dTimezone)   { toast.error('Timezone is required.'); return }
    if (!dDateFormat) { toast.error('Date format is required.'); return }
    if (!dTimeFormat) { toast.error('Time format is required.'); return }
    setProcLocale(true)
    router.put(`/organizations/${org.id}`, {
      name: org.name, currency: dCurrency, timezone: dTimezone,
      dateFormat: dDateFormat, timeFormat: dTimeFormat,
      status: org.status, ...baseFields,
    }, {
      onSuccess: () => { setEditingLocale(false); toast.success('Locale settings updated.') },
      onError:   () => toast.error('Failed to update locale settings. Please try again.'),
      onFinish:  () => setProcLocale(false),
    })
  }

  async function saveAdmin() {
    if (!aName.trim() || !superAdmin) return
    if (aPhone && aPhone !== superAdmin.phone) {
      const check = await fetch(`/organizations/check-admin-phone?phone=${encodeURIComponent(aPhone)}&excludeUserId=${superAdmin.id}`).then((r) => r.json())
      if (check.exists) { toast.error('A super admin with this phone number already exists.'); return }
    }
    setProcAdmin(true)
    router.put(`/organizations/${org.id}/super-admin`, {
      fullName: aName, employeeCode: aCode || null, phone: aPhone || null,
      gender: aGender || null, dateOfBirth: aDob || null,
    }, {
      onSuccess: () => { setEditingAdmin(false); toast.success('Super admin updated.') },
      onError:   () => toast.error('Failed to update super admin. Please try again.'),
      onFinish:  () => setProcAdmin(false),
    })
  }

  function handleResetPassword() {
    if (!superAdmin) return
    setProcReset(true)
    router.post(`/organizations/${org.id}/super-admin/reset-password`, {}, {
      onSuccess: () => toast.success('Password reset link sent to super admin email.'),
      onError:   () => toast.error('Failed to send password reset. Please try again.'),
      onFinish:  () => setProcReset(false),
    })
  }

  // ── Cancel functions ──
  function cancelCompany() {
    setDName(org.name); setDIndustry(org.industry || ''); setDCompanySize(org.companySize || '')
    setDWebsite(org.website || ''); setDGstNo(org.gstNo || ''); setDAbout(org.about || '')
    setDStatus(org.status)
    setEditingCompany(false)
  }
  function cancelContact() {
    setSelectedCountry(initCountryRef.current); setSelectedCity(initCityRef.current)
    setDPhone(org.phone || ''); setDEmail(org.email || ''); setDAddress(org.address || '')
    setDLeadOwnerId(org.leadOwnerId ? String(org.leadOwnerId) : '')
    setEditingContact(false)
  }
  function cancelLocale() {
    setDCurrency(org.currency || 'INR'); setDTimezone(org.timezone || 'Asia/Kolkata')
    const stored = org.dateFormat || ''
    const match = DATE_FORMATS.find((f) => f.value.toLowerCase() === stored.toLowerCase())
    setDDateFormat(match ? match.value : 'DD/MM/YYYY')
    setDTimeFormat(org.timeFormat || '12')
    setEditingLocale(false)
  }
  function cancelAdmin() {
    setAName(superAdmin?.fullName || ''); setACode(superAdmin?.employeeCode || '')
    setAPhone(superAdmin?.phone || ''); setAGender(superAdmin?.gender || '')
    const dob = superAdmin?.dateOfBirth || ''
    setADob(dob.includes('T') ? dob.slice(0, 10) : dob)
    setEditingAdmin(false)
  }

  return (
    <>
      {/* Row 1 — 3 equal section cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>

        {/* ── Company Details ── */}
        <SectionCard
          icon={<Building2 />} iconBg="var(--p-lt)" iconColor="var(--p)"
          title="Company Details" sub="Basic company info"
          editing={editingCompany} processing={procCompany}
          onEdit={() => setEditingCompany(true)} onSave={saveCompany} onCancel={cancelCompany}
          editChildren={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="fg">
                <label>Organization Name <span className="req">*</span></label>
                <input className="fi" value={dName} onChange={(e) => setDName(e.target.value)} placeholder="Acme Corp" />
              </div>
              <div className="fg">
                <label>Industry</label>
                <SelectSearch value={dIndustry} onChange={setDIndustry} options={industryOptions} placeholder="Select industry…" />
              </div>
              <div className="fg">
                <label>Company Size</label>
                <SelectSearch value={dCompanySize} onChange={setDCompanySize} options={sizeOptions} placeholder="Select size…" />
              </div>
              <div className="fg">
                <label>Website</label>
                <input className="fi" value={dWebsite} onChange={(e) => setDWebsite(e.target.value)} placeholder="https://example.com" />
              </div>
              <div className="fg">
                <label>GST Number</label>
                <input className="fi" value={dGstNo} onChange={(e) => setDGstNo(e.target.value)} placeholder="29ABCDE1234F1Z5" />
              </div>
              <div className="fg">
                <label>About</label>
                <textarea className="fi" rows={3} value={dAbout} onChange={(e) => setDAbout(e.target.value)} placeholder="Brief description…" style={{ resize: 'vertical' }} />
              </div>
              <div className="fg">
                <label>Status</label>
                <SelectSearch
                  value={dStatus}
                  onChange={(val) => { if (val) setDStatus(val as 'active' | 'inactive' | 'expired') }}
                  options={[
                    { value: 'active',   label: 'Active',   sub: 'Organization is operational' },
                    { value: 'inactive', label: 'Inactive', sub: 'Access suspended' },
                    { value: 'expired',  label: 'Expired',  sub: 'Plan has expired' },
                  ]}
                  placeholder="Select status…"
                />
              </div>
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 14px', marginBottom: 14 }}>
            <Field label="Org ID" value={org.orgId} mono full />
            <Field label="Name" value={org.name} />
            <Field label="Industry" value={org.industry} />
            <Field label="Company Size" value={org.companySize ? `${org.companySize} employees` : null} />
            <Field label="Website" value={org.website?.replace(/^https?:\/\//, '')} accent="var(--p)" />
            <Field label="GST Number" value={org.gstNo} mono />
            {org.about && <Field label="About" value={org.about} full />}
          </div>
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginRight: 4 }}>
              Status
            </div>
            <span className={`bx ${org.status === 'active' ? 'bx-green' : org.status === 'expired' ? 'bx-red' : 'bx-gray'}`}>
              {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
            </span>
            {!!org.isArchived && <span className="bx bx-yellow">Archived</span>}
          </div>
        </SectionCard>

        {/* ── Location & Contact ── */}
        <SectionCard
          icon={<MapPin />} iconBg="rgba(239,68,68,.1)" iconColor="#ef4444"
          title="Location & Contact" sub="Address and contact info"
          editing={editingContact} processing={procContact}
          onEdit={() => setEditingContact(true)} onSave={saveContact} onCancel={cancelContact}
          editChildren={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="fg">
                <label>Country <span className="req">*</span></label>
                <CountrySelect value={selectedCountry} onChange={(o) => { setSelectedCountry(o); setSelectedCity(null) }} />
              </div>
              <div className="fg">
                <label>City <span className="req">*</span></label>
                <CitySelect value={selectedCity} onChange={setSelectedCity} countryId={selectedCountry?.id ?? null} />
              </div>
              <div className="fg">
                <label>Phone <span className="req">*</span></label>
                <PhoneInput value={dPhone} onChange={setDPhone} phonecode={selectedCountry?.phonecode} emoji={selectedCountry?.emoji} />
              </div>
              <div className="fg">
                <label>Email <span className="req">*</span></label>
                <input type="email" className="fi" value={dEmail} onChange={(e) => setDEmail(e.target.value)} placeholder="contact@company.com" />
              </div>
              <div className="fg">
                <label>Lead Owner <span className="req">*</span></label>
                <SelectSearch value={dLeadOwnerId} onChange={setDLeadOwnerId} options={leadOwnerOptions} placeholder="Select lead owner…" />
              </div>
              <div className="fg">
                <label>Address</label>
                <textarea className="fi" rows={3} value={dAddress} onChange={(e) => setDAddress(e.target.value)} placeholder="Full address…" style={{ resize: 'vertical' }} />
              </div>
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 14px' }}>
            <Field label="Country" value={org.country} />
            <Field label="City" value={org.city} />
            <Field label="Phone" value={org.phone} />
            <Field label="Email" value={org.email} />
            <Field label="Lead Owner" value={org.leadOwner ? (org.leadOwner.name || org.leadOwner.email) : null} full />
            {org.address && <Field label="Address" value={org.address} full />}
          </div>
        </SectionCard>

        {/* ── Locale Settings ── */}
        <SectionCard
          icon={<Globe />} iconBg="rgba(14,165,233,.1)" iconColor="#0ea5e9"
          title="Locale Settings" sub="Currency, timezone & formats"
          editing={editingLocale} processing={procLocale}
          onEdit={() => setEditingLocale(true)} onSave={saveLocale} onCancel={cancelLocale}
          editChildren={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="fg">
                <label>Currency <span className="req">*</span></label>
                <SelectSearch
                  value={dCurrency}
                  onChange={setDCurrency}
                  options={currencyOptions.length > 0 ? currencyOptions : [{ value: dCurrency, label: dCurrency, sub: '' }]}
                  placeholder="Select currency…"
                />
              </div>
              <div className="fg">
                <label>Timezone <span className="req">*</span></label>
                <SelectSearch
                  value={dTimezone}
                  onChange={setDTimezone}
                  options={timezoneOptions.length > 0 ? timezoneOptions : [{ value: dTimezone, label: dTimezone }]}
                  placeholder="Select timezone…"
                />
              </div>
              <div className="fg">
                <label>Date Format <span className="req">*</span></label>
                <SelectSearch value={dDateFormat} onChange={setDDateFormat} options={dateFormatOptions} placeholder="Select date format…" />
              </div>
              <div className="fg">
                <label>Time Format <span className="req">*</span></label>
                <SelectSearch value={dTimeFormat} onChange={setDTimeFormat} options={timeFormatOptions} placeholder="Select time format…" />
              </div>
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 14px' }}>
            <Field label="Currency" value={org.currency} />
            <Field label="Timezone" value={org.timezone} />
            <Field label="Date Format" value={(org.dateFormat || 'dd/mm/yyyy').toUpperCase()} mono />
            <Field label="Time Format" value={(org.timeFormat || '12').startsWith('24') ? '24-hour' : '12-hour'} />
          </div>
        </SectionCard>
      </div>

      {/* Row 2 — Super Admin + Quick Stats */}
      <div className="g2" style={{ alignItems: 'stretch', marginBottom: 16 }}>

        {/* ── Super Admin Card ── */}
        <div className="card">
          <div className="card-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--purple-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={13} style={{ color: 'var(--purple)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.8rem', color: 'var(--text1)' }}>Super Admin</div>
                <div style={{ fontSize: '.67rem', color: 'var(--text3)', marginTop: 1 }}>Organization administrator</div>
              </div>
            </div>
            {superAdmin && (
              !editingAdmin ? (
                <button className="btn btn-xs btn-ghost" onClick={() => setEditingAdmin(true)}>
                  <Edit3 size={11} /> Edit
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 5 }}>
                  <button className="btn btn-xs btn-ghost" onClick={cancelAdmin}><X size={11} /> Cancel</button>
                  <button className="btn btn-xs btn-p" disabled={procAdmin} onClick={saveAdmin}>
                    <Save size={11} /> {procAdmin ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )
            )}
          </div>

          <div className="card-b">
            {!superAdmin ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text4)', fontSize: '.82rem' }}>
                No super admin found.
              </div>
            ) : !editingAdmin ? (
              <>
                {/* Avatar + Name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  {(() => {
                    const [fg, bg] = avColor(superAdmin.fullName)
                    return (
                      <div style={{ width: 50, height: 50, borderRadius: 13, flexShrink: 0, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.95rem', fontWeight: 800, border: `2px solid ${fg}22` }}>
                        {initials(superAdmin.fullName)}
                      </div>
                    )
                  })()}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--text1)', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {superAdmin.fullName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      {superAdmin.employeeCode && (
                        <span style={{ fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--text3)', fontWeight: 600 }}>{superAdmin.employeeCode}</span>
                      )}
                      {superAdmin.employeeCode && <span style={{ color: 'var(--border2)' }}>·</span>}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 20, fontSize: '.63rem', fontWeight: 700, background: 'var(--purple-lt)', color: 'var(--purple)', border: '1px solid rgba(124,58,237,.15)' }}>
                        <Shield size={9} /> Super Admin
                      </span>
                    </div>
                  </div>
                  <button
                    disabled
                    title="Direct login — coming soon"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, padding: '6px 11px', borderRadius: 8, fontSize: '.71rem', fontWeight: 600, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text4)', cursor: 'not-allowed' }}
                  >
                    <LogIn size={12} /> Login
                  </button>
                </div>

                {/* Contact rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { icon: <Mail />, label: 'Email', value: superAdmin.companyEmail },
                    { icon: <Phone />, label: 'Phone', value: superAdmin.phone || '—' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--p-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {React.cloneElement(icon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, { size: 12, style: { color: 'var(--p)' } })}
                      </div>
                      <div>
                        <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: '.81rem', fontWeight: 600, color: value === '—' ? 'var(--text4)' : 'var(--text1)' }}>{value}</div>
                      </div>
                    </div>
                  ))}
                  {(superAdmin.gender || superAdmin.dateOfBirth) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', paddingTop: 6 }}>
                      {superAdmin.gender && (
                        <div>
                          <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 2 }}>Gender</div>
                          <div style={{ fontSize: '.81rem', fontWeight: 600, color: 'var(--text1)' }}>
                            {superAdmin.gender.charAt(0).toUpperCase() + superAdmin.gender.slice(1)}
                          </div>
                        </div>
                      )}
                      {superAdmin.dateOfBirth && (
                        <div>
                          <div style={{ fontSize: '.59rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text4)', marginBottom: 2 }}>Date of Birth</div>
                          <div style={{ fontSize: '.81rem', fontWeight: 600, color: 'var(--text1)' }}>{safeDate(superAdmin.dateOfBirth)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ paddingTop: 12, marginTop: 4, borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-xs btn-ghost" disabled={procReset} onClick={handleResetPassword} style={{ fontSize: '.72rem' }}>
                    {procReset ? 'Sending…' : 'Send Password Reset'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fg">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Employee Code
                    <span style={{ fontSize: '.63rem', color: 'var(--text4)', fontWeight: 400, background: 'var(--bg)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: 4 }}>auto-assigned</span>
                  </label>
                  <input className="fi" value={aCode} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div className="fg">
                  <label>Full Name <span className="req">*</span></label>
                  <input className="fi" value={aName} onChange={(e) => setAName(e.target.value)} placeholder="e.g. Vikram Patel" />
                </div>
                <div className="fg">
                  <label>Phone <span className="req">*</span></label>
                  <PhoneInput value={aPhone} onChange={setAPhone} phonecode={selectedCountry?.phonecode} emoji={selectedCountry?.emoji} />
                </div>
                <div className="fg">
                  <label>Gender</label>
                  <SelectSearch value={aGender} onChange={setAGender} options={genderOptions} placeholder="Select gender…" />
                </div>
                <div className="fg">
                  <label>Date of Birth</label>
                  <DatePicker value={aDob} onChange={setADob} placeholder="Select date of birth…" max={DateTime.now().toISODate()!} />
                </div>
                <div className="fg">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Email
                    <span style={{ fontSize: '.63rem', color: 'var(--text4)', fontWeight: 400, background: 'var(--bg)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: 4 }}>read-only</span>
                  </label>
                  <input className="fi" value={superAdmin.companyEmail} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Stats Card ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Quick Stats</div>
            <span style={{ fontSize: '.67rem', color: 'var(--text3)', fontWeight: 500 }}>
              {safeDate(org.planStart)} – {safeDate(org.planEnd)}
            </span>
          </div>
          <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StatBar
              icon={<Users />}
              iconBg="rgba(14,165,233,.12)" iconColor="#0ea5e9"
              label="Users" label2="registered / allowed"
              pct={userPct} barColor={userBarColor}
              value={
                <span style={{ color: userCount > org.userLimit ? '#ef4444' : 'var(--text1)' }}>
                  {userCount} <span style={{ color: 'var(--text3)', fontWeight: 600 }}>/ {org.userLimit}</span>
                </span>
              }
            />
            <StatBar
              icon={<Layers />}
              iconBg="rgba(5,150,105,.1)" iconColor="var(--s)"
              label="Modules" label2="enabled / total"
              pct={modPct} barColor="var(--s)"
              value={
                <span>
                  {enabledModules.length} <span style={{ color: 'var(--text3)', fontWeight: 600 }}>/ {(org.modules || []).length}</span>
                </span>
              }
            />
            <StatBar
              icon={<Clock />}
              iconBg={isExpired ? 'var(--danger-lt)' : isNearExpiry ? 'var(--warn-lt)' : 'var(--p-lt)'}
              iconColor={isExpired ? 'var(--danger)' : isNearExpiry ? 'var(--warn)' : 'var(--p)'}
              label="Plan Duration" label2="time consumed"
              pct={planPct} barColor={planBarColor}
              value={
                <span style={{ color: isExpired ? '#ef4444' : isNearExpiry ? '#f59e0b' : 'var(--text1)' }}>
                  {daysLeft === null
                    ? '—'
                    : isExpired
                      ? `Expired ${Math.abs(daysLeft)}d ago`
                      : daysLeft === 0
                        ? 'Expires today'
                        : `${daysLeft}d left`}
                </span>
              }
            />
            <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className={`bx ${org.planType === 'premium' ? 'bx-teal' : 'bx-sky'}`}>
                  {org.planType === 'premium' ? 'Premium' : 'Trial'}
                </span>
                <span className={`bx ${org.status === 'active' ? 'bx-green' : org.status === 'expired' ? 'bx-red' : 'bx-gray'}`}>
                  {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                </span>
                {!!org.isArchived && <span className="bx bx-yellow">Archived</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
