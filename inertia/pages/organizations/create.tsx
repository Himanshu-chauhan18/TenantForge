import { useState } from 'react'
import { router } from '@inertiajs/react'
import {
  Building2, MapPin, Settings2, User, ChevronRight, ChevronLeft,
  Check, Globe, Calendar, Shield, Eye, EyeOff, Copy, RefreshCw, Mail, Lock, Minus, Plus,
} from 'lucide-react'
import { SelectSearch } from '~/components/select-search'
import { DatePicker, fmtDate } from '~/components/date-picker'
import { RadioGroup } from '~/components/radio-group'
import { Checkbox } from '~/components/checkbox'
import { Toggle } from '~/components/toggle'
import { CountrySelect, type CountryOption } from '~/components/country-select'
import { CitySelect, type CityOption } from '~/components/city-select'

// ─── helpers ──────────────────────────────────────────────────────────────────
function fiscalDefaults() {
  const today = new Date()
  const m = today.getMonth() + 1
  const y = today.getFullYear()
  const fyStart = m >= 4 ? y : y - 1
  const fyEnd = fyStart + 1
  return {
    name: `FY ${fyStart}-${String(fyEnd).slice(2)}`,
    start: `${fyStart}-04-01`,
    end: `${fyEnd}-03-31`,
  }
}

function planDateDefaults() {
  const today = new Date()
  const end = new Date(today)
  end.setDate(end.getDate() + 15)
  return { start: fmtDate(today), end: fmtDate(end) }
}

const fyDef = fiscalDefaults()
const planDef = planDateDefaults()

function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const digit = '0123456789'
  const special = '!@#$%^&*'
  const all = upper + lower + digit + special
  const arr = new Uint8Array(12)
  crypto.getRandomValues(arr)
  let pwd = upper[arr[0] % upper.length] + lower[arr[1] % lower.length]
    + digit[arr[2] % digit.length] + special[arr[3] % special.length]
  for (let i = 4; i < 12; i++) pwd += all[arr[i] % all.length]
  return pwd.split('').sort(() => Math.random() - 0.5).join('')
}

// ─── types ────────────────────────────────────────────────────────────────────
interface UserOption { id: number; email: string; full_name?: string }
interface OrgOption { id: number; name: string; orgId: string }
interface Props {
  users: UserOption[]
  organizations: OrgOption[]
  flash?: { success?: string; errors?: Record<string, string> }
}

// ─── static data ──────────────────────────────────────────────────────────────
const MODULES = [
  { key: 'employee', label: 'Employee', desc: 'Manage employees, profiles, documents', locked: true,
    addons: ['Employee Self Service', 'Document Management', 'Onboarding Workflow'] },
  { key: 'organization', label: 'Organization', desc: 'Organization structure, branches, departments', locked: true,
    addons: ['Branch Management', 'Department Structure', 'Role Management'] },
  { key: 'attendance', label: 'Attendance', desc: 'Track daily attendance, shifts, overtime',
    addons: ['Biometric Integration', 'Geo-fencing', 'Shift Management', 'Overtime Tracking'] },
  { key: 'leave', label: 'Leave', desc: 'Leave requests, approvals, policies', disabled: true,
    addons: ['Leave Encashment', 'Comp Off', 'Holiday Calendar'] },
  { key: 'payroll', label: 'Payroll', desc: 'Salary processing, payslips, compliance', disabled: true,
    addons: ['Tax Computation', 'PF & ESI', 'Payslip Generation', 'Bank Transfer'] },
  { key: 'performance', label: 'Performance', desc: 'KPIs, appraisals, goals', disabled: true,
    addons: ['360 Feedback', 'Goal Tracking', 'Appraisal Cycles'] },
]

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance & Banking', 'Education', 'Manufacturing',
  'Retail & E-commerce', 'Real Estate', 'Hospitality', 'Logistics & Transport',
  'Media & Entertainment', 'Legal', 'Non-profit', 'Government', 'Other',
]

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+']

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
]

const TIMEZONES = [
  { value: 'UTC', label: 'UTC — Coordinated Universal Time' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata — IST (UTC+5:30)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi — PKT (UTC+5:00)' },
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka — BST (UTC+6:00)' },
  { value: 'Asia/Colombo', label: 'Asia/Colombo — SLST (UTC+5:30)' },
  { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu — NPT (UTC+5:45)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok — ICT (UTC+7:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore — SGT (UTC+8:00)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong — HKT (UTC+8:00)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai — CST (UTC+8:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo — JST (UTC+9:00)' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul — KST (UTC+9:00)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai — GST (UTC+4:00)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh — AST (UTC+3:00)' },
  { value: 'Asia/Kuwait', label: 'Asia/Kuwait — AST (UTC+3:00)' },
  { value: 'Asia/Bahrain', label: 'Asia/Bahrain — AST (UTC+3:00)' },
  { value: 'Asia/Qatar', label: 'Asia/Qatar — AST (UTC+3:00)' },
  { value: 'Asia/Muscat', label: 'Asia/Muscat — GST (UTC+4:00)' },
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta — WIB (UTC+7:00)' },
  { value: 'Asia/Manila', label: 'Asia/Manila — PHT (UTC+8:00)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur — MYT (UTC+8:00)' },
  { value: 'Asia/Taipei', label: 'Asia/Taipei — CST (UTC+8:00)' },
  { value: 'Asia/Tehran', label: 'Asia/Tehran — IRST (UTC+3:30)' },
  { value: 'Asia/Almaty', label: 'Asia/Almaty — ALMT (UTC+6:00)' },
  { value: 'Europe/London', label: 'Europe/London — GMT/BST' },
  { value: 'Europe/Paris', label: 'Europe/Paris — CET (UTC+1:00)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin — CET (UTC+1:00)' },
  { value: 'Europe/Rome', label: 'Europe/Rome — CET (UTC+1:00)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid — CET (UTC+1:00)' },
  { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam — CET (UTC+1:00)' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow — MSK (UTC+3:00)' },
  { value: 'Europe/Istanbul', label: 'Europe/Istanbul — TRT (UTC+3:00)' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo — EET (UTC+2:00)' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos — WAT (UTC+1:00)' },
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi — EAT (UTC+3:00)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg — SAST (UTC+2:00)' },
  { value: 'America/New_York', label: 'America/New_York — EST/EDT' },
  { value: 'America/Chicago', label: 'America/Chicago — CST/CDT' },
  { value: 'America/Denver', label: 'America/Denver — MST/MDT' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles — PST/PDT' },
  { value: 'America/Toronto', label: 'America/Toronto — EST/EDT' },
  { value: 'America/Mexico_City', label: 'America/Mexico_City — CST/CDT' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo — BRT (UTC-3:00)' },
  { value: 'America/Buenos_Aires', label: 'America/Buenos_Aires — ART (UTC-3:00)' },
  { value: 'America/Bogota', label: 'America/Bogota — COT (UTC-5:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney — AEDT' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne — AEDT' },
  { value: 'Australia/Perth', label: 'Australia/Perth — AWST (UTC+8:00)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland — NZST (UTC+12:00)' },
  { value: 'Pacific/Fiji', label: 'Pacific/Fiji — FJT (UTC+12:00)' },
]

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', example: '31/12/2025' },
  { value: 'MM/DD/YYYY', example: '12/31/2025' },
  { value: 'YYYY/MM/DD', example: '2025/12/31' },
  { value: 'DD-MM-YYYY', example: '31-12-2025' },
  { value: 'MM-DD-YYYY', example: '12-31-2025' },
  { value: 'YYYY-MM-DD', example: '2025-12-31' },
]

// ─── PhoneInput (country code prefix) ────────────────────────────────────────
function PhoneInput({ value, onChange, phonecode, emoji }: { value: string; onChange: (v: string) => void; phonecode?: string | null; emoji?: string | null }) {
  const raw = phonecode ? phonecode.split('-')[0].split(' ')[0].replace(/[^0-9]/g, '') : ''
  const code = raw ? `+${raw}` : ''
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid var(--border)', borderRadius: 9, overflow: 'hidden', background: 'var(--surface)', transition: 'border-color .15s' }}>
      {code && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', background: 'var(--bg)', borderRight: '1.5px solid var(--border)', flexShrink: 0, fontSize: '.82rem', color: 'var(--text2)', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 60 }}>
          {emoji && <span style={{ fontSize: '1rem', lineHeight: 1 }}>{emoji}</span>}
          {code}
        </div>
      )}
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={code ? 'Phone number' : '+91 98765 43210'}
        style={{ flex: 1, padding: '0 12px', background: 'transparent', border: 'none', outline: 'none', fontSize: '.82rem', color: 'var(--text1)', height: 37 }}
      />
    </div>
  )
}

// ─── SectionHead ──────────────────────────────────────────────────────────────
function SectionHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="sec-head">
      <div className="sec-icon" style={{ background: 'var(--p-lt)', color: 'var(--p)' }}>{icon}</div>
      <div>
        <div className="sec-title">{title}</div>
        {sub && <div className="sec-sub">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Req (required asterisk) ──────────────────────────────────────────────────
const Req = () => <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>

// ─── StepHeader ───────────────────────────────────────────────────────────────
function StepHeader({ currentStep }: { currentStep: number }) {
  const steps = [
    { n: 1, label: 'Company Info', desc: 'Details, contact & plan' },
    { n: 2, label: 'Modules', desc: 'Enable features' },
    { n: 3, label: 'Super Admin', desc: 'First admin user' },
  ]
  return (
    <div className="stepper-wrap">
      <div className="stepper">
        {steps.map((s) => {
          const state = currentStep > s.n ? 'done' : currentStep === s.n ? 'active' : ''
          return (
            <div key={s.n} className={`step-item ${state}`}>
              <div className="step-n-row">
                <div className="step-circle">
                  {currentStep > s.n ? <Check size={12} /> : s.n}
                </div>
                <div className="step-step-lbl">Step {s.n}</div>
              </div>
              <div className="step-title">{s.label}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CreateOrganization({ users, organizations, flash }: Props) {
  const [step, setStep] = useState(1)
  const [stepKey, setStepKey] = useState(0)
  const [errs, setErrs] = useState<Record<string, string>>({})

  // Company details
  const [name, setName] = useState('')
  const [parentOrgId, setParentOrgId] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [about, setAbout] = useState('')
  const [gstNo, setGstNo] = useState('')

  // Fiscal year (pre-filled)
  const [fiscalName, setFiscalName] = useState(fyDef.name)
  const [fiscalStart, setFiscalStart] = useState(fyDef.start)
  const [fiscalEnd, setFiscalEnd] = useState(fyDef.end)

  // Contact
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null)
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [leadOwnerId, setLeadOwnerId] = useState('')

  // Locale (auto-filled from country)
  const [currency, setCurrency] = useState('INR')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [timeFormat, setTimeFormat] = useState('12h')

  // Plan (pre-filled with today + 15 days)
  const [planType, setPlanType] = useState<'trial' | 'premium'>('trial')
  const [userLimit, setUserLimit] = useState(10)
  const [planStart, setPlanStart] = useState(planDef.start)
  const [planEnd, setPlanEnd] = useState(planDef.end)

  // Modules
  const [enabledModules, setEnabledModules] = useState<string[]>(['employee', 'organization'])
  const [enabledAddons, setEnabledAddons] = useState<Record<string, string[]>>({})

  // Super admin
  const [employeeCode] = useState('EMP00001')
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [dob, setDob] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [password, setPassword] = useState(() => generatePassword())
  const [showPassword, setShowPassword] = useState(true)
  const [sendWelcomeMail, setSendWelcomeMail] = useState(false)

  const [processing, setProcessing] = useState(false)

  function goToStep(n: number) {
    setStep(n)
    setStepKey((k) => k + 1)
  }

  function handleCountryChange(option: CountryOption | null) {
    setSelectedCountry(option)
    setSelectedCity(null)
    if (option) {
      if (option.currency) setCurrency(option.currency)
      if (option.timezone) {
        const found = TIMEZONES.find((t) => t.value === option.timezone)
        if (found) setTimezone(option.timezone)
      }
    }
  }

  function clearErr(field: string) { if (errs[field]) setErrs((p) => { const n = { ...p }; delete n[field]; return n }) }

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Required'
    if (!fiscalName.trim()) e.fiscalName = 'Required'
    if (!fiscalStart) e.fiscalStart = 'Required'
    if (!fiscalEnd) e.fiscalEnd = 'Required'
    if (!selectedCountry) e.country = 'Required'
    if (!selectedCity) e.city = 'Required'
    if (!phone.trim()) e.phone = 'Required'
    if (!email.trim()) e.email = 'Required'
    if (!leadOwnerId) e.leadOwner = 'Required'
    if (!planStart) e.planStart = 'Required'
    if (!planEnd) e.planEnd = 'Required'
    setErrs(e)
    if (Object.keys(e).length) {
      setTimeout(() => {
        const el = document.querySelector('[data-err]')
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return false
    }
    return true
  }

  function validateStep3() {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = 'Required'
    if (!companyEmail.trim()) e.companyEmail = 'Required'
    if (!password.trim()) e.password = 'Required'
    if (!adminPhone.trim()) e.adminPhone = 'Required'
    setErrs(e)
    if (Object.keys(e).length) return false
    return true
  }

  function toggleModule(key: string, locked?: boolean) {
    if (locked) return
    setEnabledModules((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }
  function toggleAddon(moduleKey: string, addon: string) {
    setEnabledAddons((prev) => {
      const cur = prev[moduleKey] || []
      return { ...prev, [moduleKey]: cur.includes(addon) ? cur.filter((a) => a !== addon) : [...cur, addon] }
    })
  }

  function handleSubmit() {
    if (!validateStep3()) return
    const modules = enabledModules.map((key) => ({ key, addons: enabledAddons[key] || [] }))
    setProcessing(true)
    router.post('/organizations', {
      name,
      parentOrgId: parentOrgId ? Number(parentOrgId) : undefined,
      companySize: companySize || undefined,
      industry: industry || undefined,
      website: website || undefined,
      about: about || undefined,
      gstNo: gstNo || undefined,
      fiscalName: fiscalName || undefined,
      fiscalStart: fiscalStart || undefined,
      fiscalEnd: fiscalEnd || undefined,
      country: selectedCountry?.name || undefined,
      city: selectedCity?.name || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      leadOwnerId: leadOwnerId ? Number(leadOwnerId) : undefined,
      currency,
      timezone,
      dateFormat,
      timeFormat,
      planType,
      userLimit,
      planStart: planStart || undefined,
      planEnd: planEnd || undefined,
      modules,
      employeeCode: employeeCode || undefined,
      fullName,
      gender: gender || undefined,
      adminPhone: adminPhone || undefined,
      dateOfBirth: dob || undefined,
      companyEmail,
      password,
      sendWelcomeMail,
    }, { onFinish: () => setProcessing(false) })
  }

  // Build option arrays for SelectSearch
  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name}`,
    sub: c.symbol,
  }))
  const timezoneOptions = TIMEZONES.map((t) => ({ value: t.value, label: t.label }))
  const userOptions = users.map((u) => ({ value: String(u.id), label: u.full_name || u.email, sub: u.email }))
  const orgOptions = organizations.map((o) => ({ value: String(o.id), label: o.name, sub: o.orgId }))
  const sizeOptions = COMPANY_SIZES.map((s) => ({ value: s, label: `${s} employees` }))
  const industryOptions = INDUSTRIES.map((i) => ({ value: i, label: i }))
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ]

  const autoFilledCurrency = selectedCountry?.currency === currency && !!selectedCountry
  const autoFilledTimezone = selectedCountry?.timezone === timezone && !!selectedCountry

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes calIn {
          from { opacity: 0; transform: translateY(-6px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .step-card { animation: stepIn .22s cubic-bezier(0.4,0,0.2,1) forwards; }
        .fi-err { border-color: var(--danger) !important; }
        .err-msg { font-size: .68rem; color: var(--danger); margin-top: 3px; }
      `}</style>

      <div className="ph">
        <div>
          <div className="ph-title">Add Organization</div>
          <div className="ph-sub">Create a new tenant organization — fill in company info, enable modules, and set up the super admin</div>
        </div>
      </div>

      {flash?.errors && Object.values(flash.errors).map((e, i) => (
        <div key={i} className="alert alert-danger">{e}</div>
      ))}

      <StepHeader currentStep={step} />

      {/* ═══════════════════ STEP 1 ═══════════════════ */}
      {step === 1 && (
        <div key={stepKey} className="card step-card">
          <div className="card-b">

            {/* Company Details */}
            <div className="fs">
              <SectionHead icon={<Building2 size={15} />} title="Company Details" sub="Basic information about the organization" />
              <div className="g2">
                <div className="fg" data-err={errs.name ? '' : undefined}>
                  <label>Organization Name <Req /></label>
                  <input className={`fi${errs.name ? ' fi-err' : ''}`} value={name}
                    onChange={(e) => { setName(e.target.value); clearErr('name') }}
                    placeholder="Acme Corp Ltd." />
                  {errs.name && <div className="err-msg">{errs.name}</div>}
                </div>

                <div className="fg">
                  <label>Parent Company</label>
                  <SelectSearch
                    value={parentOrgId}
                    onChange={setParentOrgId}
                    options={orgOptions}
                    placeholder={orgOptions.length === 0 ? 'No organizations available' : 'Select parent company…'}
                  />
                  <div className="fg-hint">Leave empty for a top-level organization</div>
                </div>

                <div className="fg">
                  <label>Company Size</label>
                  <SelectSearch value={companySize} onChange={setCompanySize} options={sizeOptions} placeholder="Select company size…" />
                </div>

                <div className="fg">
                  <label>Industry</label>
                  <SelectSearch value={industry} onChange={setIndustry} options={industryOptions} placeholder="Select industry…" />
                </div>

                <div className="fg">
                  <label>Website</label>
                  <input className="fi" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
                </div>

                <div className="fg">
                  <label>GST Number</label>
                  <input className="fi" value={gstNo} onChange={(e) => setGstNo(e.target.value)} placeholder="29ABCDE1234F1Z5" />
                </div>

                <div className="fg col2">
                  <label>About</label>
                  <textarea className="fi" rows={3} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Brief description of the organization…" style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Fiscal Year */}
            <div className="fs">
              <SectionHead icon={<Calendar size={15} />} title="Fiscal Year" sub="Pre-filled with the current April–March fiscal year" />
              <div className="g3">
                <div className="fg" data-err={errs.fiscalName ? '' : undefined}>
                  <label>Fiscal Year Name <Req /></label>
                  <input className={`fi${errs.fiscalName ? ' fi-err' : ''}`} value={fiscalName}
                    onChange={(e) => { setFiscalName(e.target.value); clearErr('fiscalName') }}
                    placeholder="FY 2025-26" />
                  {errs.fiscalName && <div className="err-msg">{errs.fiscalName}</div>}
                </div>
                <div className="fg" data-err={errs.fiscalStart ? '' : undefined}>
                  <label>Start Date <Req /></label>
                  <DatePicker value={fiscalStart} onChange={(v) => { setFiscalStart(v); clearErr('fiscalStart') }} placeholder="Pick start date" />
                  {errs.fiscalStart && <div className="err-msg">{errs.fiscalStart}</div>}
                </div>
                <div className="fg" data-err={errs.fiscalEnd ? '' : undefined}>
                  <label>End Date <Req /></label>
                  <DatePicker value={fiscalEnd} onChange={(v) => { setFiscalEnd(v); clearErr('fiscalEnd') }} min={fiscalStart} placeholder="Pick end date" />
                  {errs.fiscalEnd && <div className="err-msg">{errs.fiscalEnd}</div>}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="fs">
              <SectionHead icon={<MapPin size={15} />} title="Contact Details" sub="Location and contact information" />
              <div className="g2">
                <div className="fg" data-err={errs.country ? '' : undefined}>
                  <label>Country <Req /></label>
                  <CountrySelect value={selectedCountry} onChange={(o) => { handleCountryChange(o); clearErr('country') }} />
                  {errs.country
                    ? <div className="err-msg">{errs.country}</div>
                    : selectedCountry && (
                      <div className="fg-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={10} style={{ color: 'var(--s)' }} />
                        Auto-filled currency &amp; timezone from {selectedCountry.name}
                      </div>
                    )}
                </div>

                <div className="fg" data-err={errs.city ? '' : undefined}>
                  <label>City <Req /></label>
                  <CitySelect value={selectedCity} onChange={(o) => { setSelectedCity(o); clearErr('city') }} countryId={selectedCountry?.id ?? null} />
                  {errs.city && <div className="err-msg">{errs.city}</div>}
                </div>

                <div className="fg" data-err={errs.phone ? '' : undefined}>
                  <label>Phone <Req /></label>
                  <PhoneInput value={phone} onChange={(v) => { setPhone(v); clearErr('phone') }} phonecode={selectedCountry?.phonecode} emoji={selectedCountry?.emoji} />
                  {errs.phone && <div className="err-msg">{errs.phone}</div>}
                </div>

                <div className="fg" data-err={errs.email ? '' : undefined}>
                  <label>Email <Req /></label>
                  <input type="email" className={`fi${errs.email ? ' fi-err' : ''}`} value={email}
                    onChange={(e) => { setEmail(e.target.value); clearErr('email') }}
                    placeholder="contact@company.com" />
                  {errs.email && <div className="err-msg">{errs.email}</div>}
                </div>

                <div className="fg col2">
                  <label>Address</label>
                  <textarea className="fi" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full mailing address…" style={{ resize: 'vertical' }} />
                </div>

                <div className="fg col2" data-err={errs.leadOwner ? '' : undefined}>
                  <label>Lead Owner <Req /></label>
                  <SelectSearch value={leadOwnerId} onChange={(v) => { setLeadOwnerId(v); clearErr('leadOwner') }} options={userOptions} placeholder={userOptions.length === 0 ? 'No users available' : 'Select lead owner…'} />
                  {errs.leadOwner && <div className="err-msg">{errs.leadOwner}</div>}
                </div>
              </div>
            </div>

            {/* Locale Settings */}
            <div className="fs">
              <SectionHead icon={<Globe size={15} />} title="Locale Settings" sub="Currency and timezone are auto-filled when you select a country" />
              <div className="g2">
                <div className="fg">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Currency <Req />
                    {autoFilledCurrency && (
                      <span className="bx bx-teal bx-no-dot" style={{ fontSize: '.62rem' }}>Auto-filled</span>
                    )}
                  </label>
                  <SelectSearch value={currency} onChange={setCurrency} options={currencyOptions} placeholder="Select currency…" />
                </div>

                <div className="fg">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Timezone <Req />
                    {autoFilledTimezone && (
                      <span className="bx bx-teal bx-no-dot" style={{ fontSize: '.62rem' }}>Auto-filled</span>
                    )}
                  </label>
                  <SelectSearch value={timezone} onChange={setTimezone} options={timezoneOptions} placeholder="Select timezone…" />
                </div>

                <div className="fg col2">
                  <label>Date Format <Req /></label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 2 }}>
                    {DATE_FORMATS.map((f) => {
                      const sel = dateFormat === f.value
                      return (
                        <div
                          key={f.value}
                          onClick={() => setDateFormat(f.value)}
                          style={{
                            flex: '1 0 0', minWidth: 0,
                            padding: '8px 10px', borderRadius: 9, cursor: 'pointer', userSelect: 'none',
                            border: `1.5px solid ${sel ? 'var(--p)' : 'var(--border)'}`,
                            background: sel ? 'var(--p-lt)' : 'var(--surface)',
                            transition: 'border-color .15s, background .15s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          }}
                        >
                          <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${sel ? 'var(--p)' : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color .15s' }}>
                            {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--p)' }} />}
                          </div>
                          <span style={{ fontSize: '.72rem', fontWeight: 700, color: sel ? 'var(--p)' : 'var(--text1)', fontFamily: 'monospace', letterSpacing: '.02em', whiteSpace: 'nowrap' }}>{f.value}</span>
                          <span style={{ fontSize: '.63rem', color: sel ? 'var(--p)' : 'var(--text3)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{f.example}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="fg">
                  <label>Time Format <Req /></label>
                  <RadioGroup
                    name="time_format"
                    value={timeFormat}
                    onChange={setTimeFormat}
                    options={[
                      { value: '12h', label: '12-hour', desc: 'e.g. 02:30 PM' },
                      { value: '24h', label: '24-hour', desc: 'e.g. 14:30' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="fs">
              <SectionHead icon={<Shield size={15} />} title="Plan Details" sub="Plan start is today; trial ends 15 days from now by default" />
              <div className="g2">
                <div className="fg col2">
                  <label>Plan Type <Req /></label>
                  <RadioGroup
                    name="plan_type"
                    value={planType}
                    onChange={(v) => setPlanType(v as 'trial' | 'premium')}
                    options={[
                      { value: 'trial', label: 'Trial', desc: 'Free trial period' },
                      { value: 'premium', label: 'Premium', desc: 'Paid subscription' },
                    ]}
                  />
                </div>

                <div className="fg col2">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', gap: 16 }}>
                    <div className="fg">
                      <label>User Limit <Req /></label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 9, overflow: 'hidden', background: 'var(--surface)', height: 37 }}>
                        <button type="button" onClick={() => setUserLimit(Math.max(1, userLimit - 1))}
                          style={{ width: 38, height: '100%', background: 'var(--bg)', border: 'none', borderRight: '1.5px solid var(--border)', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .12s' }}>
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          value={userLimit}
                          onChange={(e) => setUserLimit(Math.max(1, Number(e.target.value) || 1))}
                          style={{ flex: 1, textAlign: 'center', border: 'none', background: 'transparent', outline: 'none', fontSize: '.9rem', fontWeight: 700, color: 'var(--text1)' }}
                        />
                        <button type="button" onClick={() => setUserLimit(userLimit + 1)}
                          style={{ width: 38, height: '100%', background: 'var(--bg)', border: 'none', borderLeft: '1.5px solid var(--border)', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .12s' }}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="fg-hint">Max users allowed</div>
                    </div>

                    <div className="fg" data-err={errs.planStart ? '' : undefined}>
                      <label>Plan Start Date <Req /></label>
                      <DatePicker value={planStart} onChange={(v) => { setPlanStart(v); clearErr('planStart') }} placeholder="Pick start date" />
                      {errs.planStart && <div className="err-msg">{errs.planStart}</div>}
                    </div>

                    <div className="fg" data-err={errs.planEnd ? '' : undefined}>
                      <label>Plan End Date <Req /></label>
                      <DatePicker value={planEnd} onChange={(v) => { setPlanEnd(v); clearErr('planEnd') }} min={planStart} placeholder="Pick end date" />
                      {errs.planEnd && <div className="err-msg">{errs.planEnd}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-p" style={{ cursor: 'pointer' }} onClick={() => { if (validateStep1()) goToStep(2) }}>
                Next: Modules <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ STEP 2 ═══════════════════ */}
      {step === 2 && (
        <div key={stepKey} className="card step-card">
          <div className="card-b">
            <SectionHead icon={<Settings2 size={15} />} title="Modules & Add-ons" sub="Enable the modules this organization will use" />

            <div className="g2" style={{ marginBottom: 24 }}>
              {MODULES.map((mod) => {
                const isEnabled = enabledModules.includes(mod.key)
                const enabledAddonList = enabledAddons[mod.key] || []
                const totalAddons = mod.addons.length
                const checkedCount = enabledAddonList.length
                const allSelected = totalAddons > 0 && checkedCount === totalAddons
                const someSelected = checkedCount > 0 && checkedCount < totalAddons
                const pct = totalAddons > 0 ? Math.round((checkedCount / totalAddons) * 100) : 0

                function toggleAllAddons() {
                  setEnabledAddons((prev) => ({
                    ...prev,
                    [mod.key]: allSelected ? [] : [...mod.addons],
                  }))
                }

                return (
                  <div key={mod.key} className={`mod-card ${isEnabled ? 'enabled' : ''}`} style={{ opacity: mod.disabled ? .5 : 1 }}>
                    <div className={`mod-head ${isEnabled ? 'enabled' : ''}`}>
                      <div className="mod-ico" style={{ background: isEnabled ? 'var(--p)' : 'var(--border)', color: isEnabled ? '#fff' : 'var(--text3)' }}>
                        <Building2 size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="mod-title">{mod.label}</div>
                        <div className="mod-sub">{mod.desc}</div>
                      </div>
                      {mod.locked ? (
                        <span className="bx bx-teal bx-no-dot">Required</span>
                      ) : mod.disabled ? (
                        <span className="bx bx-gray bx-no-dot">Coming Soon</span>
                      ) : (
                        <Toggle checked={isEnabled} onChange={() => toggleModule(mod.key, mod.locked)} />
                      )}
                    </div>

                    {isEnabled && totalAddons > 0 && (
                      <div className="mod-addons" style={{ padding: 0 }}>
                        {/* ── progress + select-all header ── */}
                        <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
                              <input
                                type="checkbox"
                                className="ck"
                                checked={allSelected}
                                ref={(el) => { if (el) el.indeterminate = someSelected }}
                                onChange={toggleAllAddons}
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text2)' }}>Select all</span>
                            </label>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{
                                fontSize: '.7rem', fontWeight: 700, letterSpacing: '.02em',
                                color: checkedCount === totalAddons ? 'var(--s)' : checkedCount > 0 ? 'var(--p)' : 'var(--text4)',
                              }}>
                                {checkedCount}/{totalAddons}
                              </span>
                              <span style={{ fontSize: '.64rem', color: 'var(--text3)' }}>add-ons</span>
                            </div>
                          </div>

                          {/* progress bar */}
                          <div style={{ height: 5, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 999,
                              background: pct === 100 ? 'var(--s)' : 'var(--p)',
                              width: `${pct}%`,
                              transition: 'width .25s ease, background .25s ease',
                            }} />
                          </div>
                        </div>

                        {/* addon items */}
                        <div style={{ padding: '4px 6px 6px' }}>
                          {mod.addons.map((addon) => {
                            const addonEnabled = enabledAddonList.includes(addon)
                            return (
                              <Checkbox
                                key={addon}
                                checked={addonEnabled}
                                onChange={() => toggleAddon(mod.key, addon)}
                              >
                                {addon}
                              </Checkbox>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" style={{ cursor: 'pointer' }} onClick={() => goToStep(1)}><ChevronLeft size={14} /> Back</button>
              <button className="btn btn-p" style={{ cursor: 'pointer' }} onClick={() => goToStep(3)}>Next: Super Admin <ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ STEP 3 ═══════════════════ */}
      {step === 3 && (
        <div key={stepKey} className="card step-card">
          <div className="card-b">
            <SectionHead icon={<User size={15} />} title="Super Admin" sub="Create the first admin user for this organization" />

            <div className="g2" style={{ marginBottom: 24 }}>
              <div className="fg">
                <label>Employee Code</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none', zIndex: 1 }} />
                  <input
                    className="fi"
                    value={employeeCode}
                    readOnly
                    style={{ paddingLeft: 30, background: 'var(--bg)', color: 'var(--text2)', cursor: 'not-allowed', fontFamily: 'monospace', letterSpacing: '.08em', fontWeight: 700 }}
                  />
                </div>
                <div className="fg-hint">Auto-generated · sequential · read-only</div>
              </div>

              <div className="fg" data-err={errs.fullName ? '' : undefined}>
                <label>Full Name <Req /></label>
                <input className={`fi${errs.fullName ? ' fi-err' : ''}`} value={fullName}
                  onChange={(e) => { setFullName(e.target.value); clearErr('fullName') }}
                  placeholder="John Doe" />
                {errs.fullName && <div className="err-msg">{errs.fullName}</div>}
              </div>

              <div className="fg">
                <label>Gender</label>
                <SelectSearch value={gender} onChange={setGender} options={genderOptions} placeholder="Select gender…" />
              </div>

              <div className="fg" data-err={errs.adminPhone ? '' : undefined}>
                <label>Phone <Req /></label>
                <PhoneInput value={adminPhone} onChange={(v) => { setAdminPhone(v); clearErr('adminPhone') }} phonecode={selectedCountry?.phonecode} emoji={selectedCountry?.emoji} />
                {errs.adminPhone && <div className="err-msg">{errs.adminPhone}</div>}
              </div>

              <div className="fg">
                <label>Date of Birth</label>
                <DatePicker value={dob} onChange={setDob} placeholder="Pick date of birth" />
              </div>

              <div className="fg" />

              <div className="fg" data-err={errs.companyEmail ? '' : undefined}>
                <label>Email <Req /></label>
                <input type="email" className={`fi${errs.companyEmail ? ' fi-err' : ''}`} value={companyEmail}
                  onChange={(e) => { setCompanyEmail(e.target.value); clearErr('companyEmail') }}
                  placeholder="admin@company.com" />
                {errs.companyEmail && <div className="err-msg">{errs.companyEmail}</div>}
              </div>

              <div className="fg" data-err={errs.password ? '' : undefined}>
                <label>Password <Req /></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`fi${errs.password ? ' fi-err' : ''}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearErr('password') }}
                    style={{ paddingRight: 96, fontFamily: showPassword ? 'monospace' : undefined, letterSpacing: showPassword ? '.04em' : undefined }}
                  />
                  <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                    <button type="button" tabIndex={-1}
                      onClick={() => navigator.clipboard?.writeText(password)}
                      title="Copy password"
                      style={{ padding: '4px 5px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', borderRadius: 4 }}>
                      <Copy size={13} />
                    </button>
                    <button type="button" tabIndex={-1}
                      onClick={() => setPassword(generatePassword())}
                      title="Regenerate"
                      style={{ padding: '4px 5px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', borderRadius: 4 }}>
                      <RefreshCw size={13} />
                    </button>
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      title={showPassword ? 'Hide' : 'Show'}
                      style={{ padding: '4px 5px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', borderRadius: 4 }}>
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                {errs.password
                  ? <div className="err-msg">{errs.password}</div>
                  : <div className="fg-hint">Auto-generated · click <RefreshCw size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> to regenerate or edit manually</div>
                }
              </div>

              <div className="fg col2">
                <div
                  onClick={() => setSendWelcomeMail((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, border: `1.5px solid ${sendWelcomeMail ? 'var(--p)' : 'var(--border)'}`, cursor: 'pointer', transition: 'border-color .2s', userSelect: 'none' }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: sendWelcomeMail ? 'var(--p-lt)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .2s' }}>
                    <Mail size={17} style={{ color: sendWelcomeMail ? 'var(--p)' : 'var(--text3)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--text1)', marginBottom: 2 }}>Send Welcome Email</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Send login credentials and a welcome message to the super admin's email address</div>
                  </div>
                  <Toggle checked={sendWelcomeMail} onChange={() => setSendWelcomeMail((v) => !v)} />
                </div>
              </div>
            </div>

            {/* Summary card */}
            <div className="card" style={{ marginBottom: 20, border: '1.5px dashed var(--border)' }}>
              <div className="card-h">
                <div className="card-title">Summary</div>
              </div>
              <div className="card-b">
                <div className="g2">
                  <div>
                    <div style={{ fontSize: '.66rem', color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>Organization</div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{name || '—'}</div>
                    <div style={{ fontSize: '.74rem', color: 'var(--text3)' }}>
                      {planType === 'premium' ? 'Premium' : 'Trial'} · {userLimit} users
                      {selectedCountry && ` · ${selectedCountry.emoji || ''} ${selectedCountry.name}`}
                    </div>
                    {parentOrgId && (
                      <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: 3 }}>
                        Parent: {organizations.find(o => String(o.id) === parentOrgId)?.name}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '.66rem', color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>Modules</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {enabledModules.map((m) => (
                        <span key={m} className="bx bx-teal">{m}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: '.72rem', color: 'var(--text3)' }}>
                      {currency} · {timezone.split('/').pop()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" style={{ cursor: 'pointer' }} onClick={() => goToStep(2)}><ChevronLeft size={14} /> Back</button>
              <button className="btn btn-p" style={{ cursor: 'pointer' }} onClick={handleSubmit} disabled={processing}>
                <Check size={14} />
                {processing ? 'Creating…' : 'Create Organization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
