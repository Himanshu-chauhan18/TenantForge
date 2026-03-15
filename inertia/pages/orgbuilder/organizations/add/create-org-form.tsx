import { useState, useEffect, useRef } from 'react'
import { DateTime } from 'luxon'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import {
  Building2, MapPin, Settings2, User, ChevronRight, ChevronLeft,
  Check, Globe, Calendar, Shield, Eye, EyeOff, Copy, RefreshCw, Mail, Lock, Minus, Plus, Upload,
  X, Sparkles, Puzzle,
} from 'lucide-react'
import { SelectSearch } from '~/components/select-search'
import { SelectCurrency } from '~/components/select-currency'
import { SelectTimezone } from '~/components/select-timezone'
import { SelectDateFormat } from '~/components/select-date-format'
import { DatePicker } from '~/components/date-picker'
import { RadioGroup } from '~/components/radio-group'
import { Checkbox } from '~/components/checkbox'
import { Toggle } from '~/components/toggle'
import { CountrySelect, type CountryOption } from '~/components/country-select'
import { CitySelect, type CityOption } from '~/components/city-select'
import { PhoneInput } from '~/components/phone-input'
import { SectionHead } from '~/components/section-head'
import { INDUSTRIES, COMPANY_SIZES } from '~/data/org-options'

// ─── helpers ──────────────────────────────────────────────────────────────────
function fiscalDefaults() {
  const now = DateTime.now()
  const m = now.month
  const y = now.year
  const fyStart = m >= 4 ? y : y - 1
  const fyEnd = fyStart + 1
  return {
    name: `FY ${fyStart}-${String(fyEnd).slice(2)}`,
    start: `${fyStart}-04-01`,
    end: `${fyEnd}-03-31`,
  }
}

function planDateDefaults() {
  return {
    start: DateTime.now().toISODate()!,
    end:   DateTime.now().plus({ days: 15 }).toISODate()!,
  }
}

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

// ─── addon grouping helpers ────────────────────────────────────────────────────
function getAddonGroup(name: string): string {
  if (name.startsWith('Settings -')) return 'Settings'
  if (name.startsWith('Employee Document -')) return 'Documents'
  return 'Core'
}

export function groupAddonItems(addons: ModuleAddonOption[]): { label: string; items: ModuleAddonOption[] }[] {
  const ORDER = ['Core', 'Documents', 'Settings']
  const map: Record<string, ModuleAddonOption[]> = {}
  for (const a of addons) {
    const g = getAddonGroup(a.name)
    ;(map[g] ??= []).push(a)
  }
  return ORDER.filter((g) => map[g]?.length).map((g) => ({ label: g, items: map[g] }))
}

// ─── types ────────────────────────────────────────────────────────────────────
export interface UserOption { id: number; email: string; full_name?: string }
export interface LeadOwnerOption { id: number; name: string; email: string; designation?: string | null }
export interface OrgOption { id: number; name: string; orgId: string }
export interface ModuleAddonOption { id: number; name: string; type: 'default' | 'custom' | 'advance' }
export interface ModuleOption {
  id: number
  key: string
  label: string
  description: string | null
  isMandatory: boolean
  isComingSoon: boolean
  sortOrder: number
  addons: ModuleAddonOption[]
}

// ─── Req (required asterisk) ──────────────────────────────────────────────────
const Req = () => <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>

// ─── StepHeader ───────────────────────────────────────────────────────────────
function StepHeader({
  currentStep,
  maxStep,
  onStepClick,
}: {
  currentStep: number
  maxStep: number
  onStepClick: (n: number) => void
}) {
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
          const clickable = s.n !== currentStep && s.n <= maxStep
          return (
            <div
              key={s.n}
              className={`step-item ${state}`}
              onClick={() => clickable && onStepClick(s.n)}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
              title={clickable ? `Go to step ${s.n}` : undefined}
            >
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface CreateOrgFormProps {
  leadOwners: LeadOwnerOption[]
  organizations: OrgOption[]
}

// ─── Main Form Component ──────────────────────────────────────────────────────
export function CreateOrgForm({ leadOwners, organizations }: CreateOrgFormProps) {
  const fyDef = fiscalDefaults()
  const planDef = planDateDefaults()

  const [step, setStep] = useState(1)
  const [stepKey, setStepKey] = useState(0)
  const [maxStep, setMaxStep] = useState(1)
  const [errs, setErrs] = useState<Record<string, string>>({})

  // Company details
  const [name, setName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [parentOrgId, setParentOrgId] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [about, setAbout] = useState('')
  const [gstNo, setGstNo] = useState('')

  // Fiscal year
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

  // Locale
  const [currency, setCurrency] = useState('INR')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [timeFormat, setTimeFormat] = useState('24h')

  // Plan
  const [planType, setPlanType] = useState<'trial' | 'premium'>('trial')
  const [userLimit, setUserLimit] = useState(10)
  const [planStart, setPlanStart] = useState(planDef.start)
  const [planEnd, setPlanEnd] = useState(planDef.end)

  // Modules
  const [modules, setModules] = useState<ModuleOption[]>([])
  const [modulesLoading, setModulesLoading] = useState(true)
  const modulesInitialized = useRef(false)
  const [enabledModules, setEnabledModules] = useState<number[]>([])
  const [enabledAddons, setEnabledAddons] = useState<Record<number, number[]>>({})
  const [addonModal, setAddonModal] = useState<ModuleOption | null>(null)
  const [modalTab, setModalTab] = useState<'custom' | 'advance'>('custom')
  const [closedGroups, setClosedGroups] = useState<Set<string>>(new Set())
  const [modalAnimOut, setModalAnimOut] = useState(false)
  const [closedModalGroups, setClosedModalGroups] = useState<Set<string>>(new Set())

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

  useEffect(() => {
    // Default country to India
    fetch('/api/countries?search=India')
      .then((r) => r.ok ? r.json() : [])
      .then((data: CountryOption[]) => {
        const india = data.find((c) => c.iso2 === 'IN') ?? data[0]
        if (india) {
          setSelectedCountry(india)
          if (india.currency) setCurrency(india.currency)
          if (india.timezone) setTimezone(india.timezone)
        }
      })
      .catch(() => {})
    fetch('/api/modules')
      .then((r) => r.ok ? r.json() : [])
      .then((data: ModuleOption[]) => {
        setModules(data)
        if (!modulesInitialized.current) {
          modulesInitialized.current = true
          setEnabledModules(data.filter((m) => m.isMandatory).map((m) => m.id))
          const initAddons: Record<number, number[]> = {}
          data.filter((m) => m.isMandatory).forEach((m) => {
            initAddons[m.id] = m.addons.filter((a) => a.type === 'default').map((a) => a.id)
          })
          setEnabledAddons(initAddons)
        }
      })
      .catch(() => {})
      .finally(() => setModulesLoading(false))
  }, [])

  function goToStep(n: number) {
    setStep(n)
    setStepKey((k) => k + 1)
    setMaxStep((prev) => Math.max(prev, n))
  }

  function handleCountryChange(option: CountryOption | null) {
    setSelectedCountry(option)
    setSelectedCity(null)
    if (option) {
      if (option.currency) setCurrency(option.currency)
      if (option.timezone) setTimezone(option.timezone)
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

  function toggleModule(id: number, locked?: boolean) {
    if (locked) return
    setEnabledModules((prev) => {
      if (prev.includes(id)) return prev.filter((k) => k !== id)
      const mod = modules.find((m) => m.id === id)
      if (mod) {
        const defaults = mod.addons.filter((a) => a.type === 'default').map((a) => a.id)
        setEnabledAddons((p) => ({ ...p, [id]: defaults }))
      }
      return [...prev, id]
    })
  }

  function toggleAddon(moduleId: number, addonId: number) {
    setEnabledAddons((prev) => {
      const cur = prev[moduleId] || []
      return { ...prev, [moduleId]: cur.includes(addonId) ? cur.filter((a) => a !== addonId) : [...cur, addonId] }
    })
  }

  function closeModal() {
    setModalAnimOut(true)
    setTimeout(() => { setAddonModal(null); setModalAnimOut(false) }, 190)
  }

  function handleSubmit() {
    if (!validateStep3()) return
    const mods = enabledModules.map((moduleId) => ({ moduleId, addonIds: enabledAddons[moduleId] || [] }))
    setProcessing(true)
    router.post('/orgbuilder/organizations', {
      name,
      logo: logoFile || undefined,
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
      modules: mods,
      employeeCode: employeeCode || undefined,
      fullName,
      gender: gender || undefined,
      adminPhone: adminPhone || undefined,
      dateOfBirth: dob || undefined,
      companyEmail,
      password,
      sendWelcomeMail,
    }, {
      onFinish: () => setProcessing(false),
      onError: (errors) => {
        const entries = Object.entries(errors)
        if (entries.length > 0) {
          const [field, msg] = entries[0]
          toast.error(String(msg))
          if (['companyEmail', 'fullName', 'password', 'adminPhone'].includes(field)) {
            goToStep(3)
          } else if (['name', 'fiscalName', 'fiscalStart', 'fiscalEnd', 'country', 'city', 'phone', 'email', 'leadOwner', 'planStart', 'planEnd'].includes(field)) {
            goToStep(1)
          }
        }
      },
    })
  }

  // Build option arrays
  const leadOwnerOptions = leadOwners.map((o) => ({ value: String(o.id), label: o.name, sub: o.designation || o.email }))
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
        .logo-preview-overlay { opacity: 0; transition: opacity .2s; }
        .logo-preview-wrap:hover .logo-preview-overlay { opacity: 1; }
        .modal-tab-btn { padding: 8px 16px; border: none; background: transparent; cursor: pointer; font-size: .78rem; font-weight: 600; color: var(--text3); border-bottom: 2px solid transparent; transition: color .15s, border-color .15s; }
        .modal-tab-btn.active { color: var(--p); border-bottom-color: var(--p); }
        .addon-item { display: flex; align-items: flex-start; gap: 10; padding: 10px 12px; border-radius: 9px; cursor: pointer; transition: background .12s; }
        .addon-item:hover { background: var(--bg); }
        .extra-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px 3px 9px; border-radius: 20px; font-size: .68rem; font-weight: 600; background: var(--p-lt); color: var(--p); border: 1px solid var(--p-mid); }
        .extra-chip button { display: flex; align-items: center; background: none; border: none; cursor: pointer; color: var(--p); padding: 0; opacity: .7; }
        .extra-chip button:hover { opacity: 1; }
        .advance-chip { background: var(--s-lt, #f0fdf4); color: var(--s); border-color: var(--s-mid, #bbf7d0); }
        .acc-hd { display: flex; align-items: center; gap: 8px; padding: 10px 14px 10px 12px; cursor: pointer; user-select: none; transition: background .15s, border-left-color .15s; border-left: 2.5px solid transparent; }
        .acc-hd:hover { background: var(--bg); }
        .acc-hd.open { background: var(--p-lt); border-left-color: var(--p); }
        .acc-body { overflow: hidden; transition: max-height .3s cubic-bezier(0.4,0,0.2,1); }
        .cs-preview { padding: 10px 14px 14px; border-top: 1px solid var(--border); }
        .cs-addon-row { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 6px; pointer-events: none; }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to   { opacity: 0; transform: scale(.94) translateY(8px); }
        }
        @keyframes backdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes backdropOut { from { opacity: 1 } to { opacity: 0 } }
        .addon-modal { animation: modalIn .24s cubic-bezier(0.34,1.2,0.64,1) forwards; }
        .addon-modal-out { animation: modalOut .18s ease forwards; }
        .modal-backdrop { animation: backdropIn .2s ease forwards; }
        .modal-backdrop-out { animation: backdropOut .18s ease forwards; }
        .modal-addon-item { display: flex; align-items: center; gap: 10px; padding: 9px 18px 9px 22px; cursor: pointer; transition: background .12s; }
        .modal-addon-item:hover { background: var(--bg); }
        .mod-inactive-hint { border-top: 1px solid var(--border); padding: 10px 16px; background: var(--bg); }
      `}</style>

      <StepHeader currentStep={step} maxStep={maxStep} onStepClick={goToStep} />

      {/* ═══════════════════ STEP 1 ═══════════════════ */}
      {step === 1 && (
        <div key={stepKey} className="card step-card">
          <div className="card-b">

            {/* Company Details */}
            <div className="fs">
              <SectionHead icon={<Building2 size={15} />} title="Company Details" sub="Basic information about the organization" />
              <div className="g2">
                {/* Logo Uploader */}
                <div className="fg col2">
                  <label>Organization Logo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div
                      className="logo-preview-wrap"
                      onClick={() => logoInputRef.current?.click()}
                      style={{
                        width: 92, height: 92, borderRadius: 18, flexShrink: 0, cursor: 'pointer',
                        border: `2px dashed ${logoPreview ? 'var(--p)' : 'var(--border2)'}`,
                        background: logoPreview ? 'transparent' : 'var(--bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', position: 'relative', transition: 'border-color .2s, box-shadow .2s',
                        boxShadow: logoPreview ? '0 4px 16px rgba(0,0,0,.12)' : 'none',
                      }}
                    >
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div
                            className="logo-preview-overlay"
                            style={{
                              position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16,
                            }}
                          >
                            <Upload size={20} style={{ color: '#fff' }} />
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                          {name.trim() ? (
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--p)', lineHeight: 1, letterSpacing: '-.02em' }}>
                              {name.trim().charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <Building2 size={24} style={{ color: 'var(--text4)' }} />
                          )}
                          <span style={{ fontSize: '.56rem', color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Logo</span>
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px',
                          background: 'var(--p-lt)', border: '1.5px solid var(--p-mid)', borderRadius: 8,
                          cursor: 'pointer', fontSize: '.78rem', fontWeight: 600, color: 'var(--p)',
                          transition: 'background .15s', marginBottom: 6,
                        }}
                      >
                        <Upload size={13} />
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </button>
                      <div className="fg-hint">PNG, JPG or WebP · Max 5 MB</div>
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={() => { setLogoFile(null); setLogoPreview(''); if (logoInputRef.current) logoInputRef.current.value = '' }}
                          style={{ display: 'inline-block', marginTop: 4, fontSize: '.7rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setLogoFile(file)
                        const reader = new FileReader()
                        reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
                        reader.readAsDataURL(file)
                      }}
                    />
                  </div>
                </div>

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
                  <SelectSearch value={leadOwnerId} onChange={(v) => { setLeadOwnerId(v); clearErr('leadOwner') }} options={leadOwnerOptions} placeholder={leadOwnerOptions.length === 0 ? 'No lead owners available' : 'Select lead owner…'} />
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
                  <SelectCurrency value={currency} onChange={setCurrency} country={selectedCountry} />
                </div>

                <div className="fg">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Timezone <Req />
                    {autoFilledTimezone && (
                      <span className="bx bx-teal bx-no-dot" style={{ fontSize: '.62rem' }}>Auto-filled</span>
                    )}
                  </label>
                  <SelectTimezone value={timezone} onChange={setTimezone} country={selectedCountry} />
                </div>

                <div className="fg col2">
                  <label>Date Format <Req /></label>
                  <SelectDateFormat value={dateFormat} onChange={setDateFormat} />
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
              {modulesLoading ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px 0', color: 'var(--text3)', fontSize: '.82rem' }}>
                  Loading modules…
                </div>
              ) : modules.map((mod) => {
                const isEnabled = enabledModules.includes(mod.id)
                const enabledAddonList = enabledAddons[mod.id] || []

                const defaultAddons = mod.addons.filter((a) => a.type === 'default')
                const customAddons = mod.addons.filter((a) => a.type === 'custom')
                const advanceAddons = mod.addons.filter((a) => a.type === 'advance')
                const defaultGroups = groupAddonItems(defaultAddons)

                const extraAddons = enabledAddonList.filter(
                  (id) => mod.addons.find((a) => a.id === id)?.type !== 'default'
                )

                return (
                  <div key={mod.id} className={`mod-card ${isEnabled ? 'enabled' : ''}`}>
                    <div className={`mod-head ${isEnabled ? 'enabled' : ''}`}>
                      <div className="mod-ico" style={{
                        background: isEnabled ? 'var(--p)' : mod.isComingSoon ? 'var(--bg)' : 'var(--border)',
                        color: isEnabled ? '#fff' : mod.isComingSoon ? 'var(--text4)' : 'var(--text3)',
                      }}>
                        <Building2 size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="mod-title" style={{ color: mod.isComingSoon ? 'var(--text3)' : undefined }}>{mod.label}</div>
                        <div className="mod-sub">{mod.description}</div>
                      </div>
                      {mod.isMandatory ? (
                        <span className="bx bx-teal bx-no-dot">Required</span>
                      ) : mod.isComingSoon ? (
                        <span className="bx bx-gray bx-no-dot">Coming Soon</span>
                      ) : (
                        <Toggle checked={isEnabled} onChange={() => toggleModule(mod.id, mod.isMandatory)} />
                      )}
                    </div>

                    {(mod.isComingSoon && mod.addons.length > 0) ? (
                      <div className="cs-preview">
                        <div style={{ fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text4)', marginBottom: 10 }}>
                          Features Preview
                        </div>
                        {groupAddonItems(mod.addons).map((grp) => (
                          <div key={grp.label} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--text4)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ display: 'inline-block', width: 16, height: 1.5, background: 'var(--border)', borderRadius: 1 }} />
                              {grp.label}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {grp.items.map((a) => (
                                <div key={a.id} className="cs-addon-row" style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  padding: '3px 9px 3px 7px', borderRadius: 20,
                                  background: 'var(--bg)', border: '1px solid var(--border)',
                                  opacity: .55,
                                }}>
                                  <div style={{ width: 12, height: 12, borderRadius: 3, border: '1.5px solid var(--border2)', flexShrink: 0 }} />
                                  <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{a.name}</span>
                                  {a.type !== 'default' && (
                                    <span style={{ fontSize: '.58rem', fontWeight: 700, background: a.type === 'advance' ? 'var(--s-lt, #f0fdf4)' : 'var(--p-lt)', color: a.type === 'advance' ? 'var(--s)' : 'var(--p)', borderRadius: 20, padding: '1px 5px' }}>
                                      {a.type}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : ''}

                    {(!isEnabled && !mod.isComingSoon && mod.addons.length > 0) ? (
                      <div className="mod-inactive-hint">
                        <div style={{ fontSize: '.78rem', color: 'var(--text3)', fontWeight: 500 }}>
                          Enable this module to configure <strong style={{ color: 'var(--text2)', fontWeight: 700 }}>{mod.addons.length} add-ons</strong>
                        </div>
                      </div>
                    ) : ''}

                    {isEnabled && (
                      <div className="mod-addons" style={{ padding: 0 }}>
                        {defaultGroups.map((grp, gi) => {
                          const groupKey = `${mod.id}:${grp.label}`
                          const isOpen = !closedGroups.has(groupKey)
                          const grpChecked = grp.items.filter((a) => enabledAddonList.includes(a.id)).length
                          const grpTotal = grp.items.length
                          const allGrpSel = grpChecked === grpTotal
                          const someGrpSel = grpChecked > 0 && grpChecked < grpTotal
                          const grpPct = grpTotal > 0 ? Math.round((grpChecked / grpTotal) * 100) : 0
                          const hasMore = gi < defaultGroups.length - 1 || extraAddons.length > 0 || customAddons.length > 0 || advanceAddons.length > 0

                          return (
                            <div key={grp.label} style={{ borderBottom: hasMore ? '1px solid var(--border)' : 'none' }}>
                              <div
                                className={`acc-hd${isOpen ? ' open' : ''}`}
                                onClick={() => setClosedGroups((prev) => {
                                  const n = new Set(prev)
                                  n.has(groupKey) ? n.delete(groupKey) : n.add(groupKey)
                                  return n
                                })}
                              >
                                <ChevronRight
                                  size={12}
                                  style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .22s', color: isOpen ? 'var(--p)' : 'var(--text4)', flexShrink: 0 }}
                                />
                                <span style={{ fontSize: '.72rem', fontWeight: 700, color: isOpen ? 'var(--text1)' : 'var(--text2)', flex: 1, letterSpacing: '.01em' }}>{grp.label}</span>
                                <div style={{ width: 72, height: 4, borderRadius: 999, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                                  <div style={{ height: '100%', borderRadius: 999, background: grpPct === 100 ? 'var(--s)' : 'var(--p)', width: `${grpPct}%`, transition: 'width .3s ease' }} />
                                </div>
                                {grpChecked > 0 && (
                                  <span style={{ fontSize: '.64rem', fontWeight: 700, color: grpChecked === grpTotal ? 'var(--s)' : 'var(--p)', minWidth: 36, textAlign: 'right' }}>
                                    {grpChecked}/{grpTotal}
                                  </span>
                                )}
                                <label
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ display: 'flex', alignItems: 'center', marginLeft: 6, cursor: 'pointer' }}
                                >
                                  <input
                                    type="checkbox"
                                    className="ck"
                                    checked={allGrpSel}
                                    ref={(el) => { if (el) el.indeterminate = someGrpSel }}
                                    onChange={() => {
                                      const ids = grp.items.map((a) => a.id)
                                      setEnabledAddons((prev) => {
                                        const cur = prev[mod.id] || []
                                        const rest = cur.filter((n) => !ids.includes(n))
                                        return { ...prev, [mod.id]: allGrpSel ? rest : [...rest, ...ids] }
                                      })
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </label>
                              </div>
                              <div
                                className="acc-body"
                                style={{ maxHeight: isOpen ? `${grp.items.length * 44}px` : 0 }}
                              >
                                <div style={{ padding: '2px 6px 6px' }}>
                                  {grp.items.map((addon) => (
                                    <Checkbox
                                      key={addon.id}
                                      checked={enabledAddonList.includes(addon.id)}
                                      onChange={() => toggleAddon(mod.id, addon.id)}
                                    >
                                      {addon.name}
                                    </Checkbox>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {extraAddons.length > 0 && (
                          <div style={{ padding: '8px 14px', borderTop: defaultGroups.length > 0 ? '1px solid var(--border)' : undefined }}>
                            <div style={{ fontSize: '.64rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                              Additional Add-ons
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {extraAddons.map((addonId) => {
                                const addon = mod.addons.find((a) => a.id === addonId)!
                                const isAdv = addon.type === 'advance'
                                return (
                                  <span key={addonId} className={`extra-chip${isAdv ? ' advance-chip' : ''}`}>
                                    {isAdv ? <Sparkles size={10} /> : <Puzzle size={10} />}
                                    {addon.name}
                                    <button type="button" onClick={() => toggleAddon(mod.id, addonId)}>
                                      <X size={10} />
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {(customAddons.length > 0 || advanceAddons.length > 0) && (
                          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
                            <button
                              type="button"
                              onClick={() => { setAddonModal(mod); setModalTab(customAddons.length > 0 ? 'custom' : 'advance') }}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                                background: 'var(--bg)', border: '1.5px dashed var(--border2)', borderRadius: 7,
                                cursor: 'pointer', fontSize: '.74rem', fontWeight: 600, color: 'var(--text2)',
                                transition: 'border-color .15s, color .15s',
                              }}
                            >
                              <Plus size={12} style={{ color: 'var(--p)' }} />
                              Add More Add-ons
                              {extraAddons.length > 0 && (
                                <span style={{ background: 'var(--p)', color: '#fff', borderRadius: 20, fontSize: '.62rem', padding: '1px 6px', fontWeight: 700 }}>
                                  {extraAddons.length}
                                </span>
                              )}
                            </button>
                          </div>
                        )}
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
                  placeholder="Full Name" />
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

            {/* ── Review Summary ── */}
            <div style={{ marginBottom: 20, borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, var(--p-lt), var(--bg))', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, var(--p), var(--s))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={13} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.85rem', color: 'var(--text1)', fontFamily: 'var(--fd)', lineHeight: 1.2 }}>Review & Confirm</div>
                  <div style={{ fontSize: '.67rem', color: 'var(--text3)' }}>Check all details before creating the organization</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '14px 16px', borderRight: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 8 }}>Organization</div>
                  <div style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--text1)', marginBottom: 4 }}>{name || <span style={{ color: 'var(--text4)', fontWeight: 400 }}>—</span>}</div>
                  {(industry || companySize) && (
                    <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginBottom: 3 }}>
                      {[industry, companySize].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  {selectedCountry && (
                    <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginBottom: 3 }}>
                      {selectedCountry.emoji} {selectedCountry.name}{selectedCity ? `, ${selectedCity.name}` : ''}
                    </div>
                  )}
                  {email && <div style={{ fontSize: '.71rem', color: 'var(--text3)', marginBottom: 2 }}>{email}</div>}
                  {phone && <div style={{ fontSize: '.71rem', color: 'var(--text3)', marginBottom: 2 }}>{phone}</div>}
                  {parentOrgId && (
                    <div style={{ marginTop: 6, fontSize: '.68rem', color: 'var(--text4)', background: 'var(--bg2)', padding: '2px 7px', borderRadius: 5, display: 'inline-block', border: '1px solid var(--border)' }}>
                      Under: {organizations.find(o => String(o.id) === parentOrgId)?.name}
                    </div>
                  )}
                  {leadOwnerId && (
                    <div style={{ marginTop: 6, fontSize: '.68rem', color: 'var(--text4)' }}>
                      Lead: {leadOwners.find(o => String(o.id) === leadOwnerId)?.name || '—'}
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 8 }}>Plan & Settings</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <span className={`bx ${planType === 'premium' ? 'bx-purple' : 'bx-teal'} bx-no-dot`} style={{ fontSize: '.7rem' }}>
                      {planType === 'premium' ? 'Premium' : 'Trial'}
                    </span>
                    <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text1)' }}>{userLimit} users</span>
                  </div>
                  {planStart && planEnd && (
                    <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} style={{ flexShrink: 0 }} />
                      {planStart} → {planEnd}
                    </div>
                  )}
                  {fiscalName && (
                    <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginBottom: 3 }}>
                      FY: {fiscalName} ({fiscalStart} → {fiscalEnd})
                    </div>
                  )}
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {[currency, timezone, dateFormat].filter(Boolean).map((v) => (
                      <span key={v} style={{ fontSize: '.65rem', color: 'var(--text3)', background: 'var(--bg2)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>{v}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 8 }}>
                  Modules ({enabledModules.length})
                </div>
                {enabledModules.length === 0 ? (
                  <div style={{ fontSize: '.75rem', color: 'var(--text4)' }}>No modules selected</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {enabledModules.map((modId) => {
                      const mod = modules.find((m) => m.id === modId)
                      if (!mod) return null
                      return (
                        <span key={modId} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, color: 'var(--text1)' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: mod.isMandatory ? 'var(--p)' : 'var(--s)', flexShrink: 0 }} />
                          {mod.label}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 16px', background: 'var(--bg)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', flexShrink: 0 }}>Super Admin</div>
                <div style={{ width: 1, height: 12, background: 'var(--border)' }} />
                <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text1)' }}>{fullName || <span style={{ color: 'var(--text4)', fontWeight: 400 }}>Name not set</span>}</span>
                {companyEmail && <span style={{ fontSize: '.74rem', color: 'var(--text3)' }}>{companyEmail}</span>}
                {adminPhone && <span style={{ fontSize: '.74rem', color: 'var(--text3)' }}>{adminPhone}</span>}
                {sendWelcomeMail && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: '.7rem', color: 'var(--p)', fontWeight: 600 }}>
                    <Mail size={11} />
                    Welcome email will be sent
                  </div>
                )}
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

      {/* ═══════════════════ ADD-ONS MODAL ═══════════════════ */}
      {addonModal && (() => {
        const mod = addonModal
        const customAddons = mod.addons.filter((a) => a.type === 'custom')
        const advanceAddons = mod.addons.filter((a) => a.type === 'advance')
        const activeList = modalTab === 'custom' ? customAddons : advanceAddons
        const activeGroups = groupAddonItems(activeList)
        const enabledAddonList = enabledAddons[mod.id] || []
        const extraSelectedCount = enabledAddonList.filter((id) => mod.addons.find((a) => a.id === id && a.type !== 'default')).length

        return (
          <div
            className={modalAnimOut ? 'modal-backdrop-out' : 'modal-backdrop'}
            style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.48)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '20px 16px' }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
          >
            <div
              className={`addon-modal${modalAnimOut ? ' addon-modal-out' : ''}`}
              style={{
                background: 'var(--surface)', width: '100%', maxWidth: 560,
                maxHeight: '86vh', display: 'flex', flexDirection: 'column',
                overflow: 'hidden', borderRadius: 18,
                boxShadow: '0 24px 60px rgba(0,0,0,.28)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ padding: '4px 22px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text1)', marginBottom: 3, letterSpacing: '-.01em' }}>
                    {mod.label} — Add-ons
                  </div>
                  <div style={{ fontSize: '.74rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {extraSelectedCount > 0 ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--p-lt)', color: 'var(--p)', borderRadius: 20, padding: '2px 9px', fontWeight: 700, fontSize: '.68rem' }}>
                        <Check size={10} /> {extraSelectedCount} selected
                      </span>
                    ) : (
                      'Select optional features to enable'
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flexShrink: 0, transition: 'background .12s' }}
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0, padding: '0 10px' }}>
                {customAddons.length > 0 && (
                  <button type="button" className={`modal-tab-btn${modalTab === 'custom' ? ' active' : ''}`} onClick={() => setModalTab('custom')}>
                    <Puzzle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
                    Custom
                    <span style={{ marginLeft: 6, background: modalTab === 'custom' ? 'var(--p)' : 'var(--border)', color: modalTab === 'custom' ? '#fff' : 'var(--text3)', borderRadius: 20, fontSize: '.6rem', padding: '1px 7px', fontWeight: 700 }}>
                      {customAddons.length}
                    </span>
                  </button>
                )}
                {advanceAddons.length > 0 && (
                  <button type="button" className={`modal-tab-btn${modalTab === 'advance' ? ' active' : ''}`} onClick={() => setModalTab('advance')}>
                    <Sparkles size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
                    Advanced
                    <span style={{ marginLeft: 6, background: modalTab === 'advance' ? 'var(--s)' : 'var(--border)', color: modalTab === 'advance' ? '#fff' : 'var(--text3)', borderRadius: 20, fontSize: '.6rem', padding: '1px 7px', fontWeight: 700 }}>
                      {advanceAddons.length}
                    </span>
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text4)', fontSize: '.82rem' }}>
                    No add-ons available
                  </div>
                ) : (
                  activeGroups.map((grp) => {
                    const mgKey = `${mod.id}:${modalTab}:${grp.label}`
                    const isGrpOpen = !closedModalGroups.has(mgKey)
                    const grpSel = grp.items.filter((a) => enabledAddonList.includes(a.id)).length
                    const allGrpSel = grpSel === grp.items.length
                    const someGrpSel = grpSel > 0 && grpSel < grp.items.length

                    return (
                      <div key={grp.label} style={{ borderBottom: '1px solid var(--border)' }}>
                        <div
                          className={`acc-hd${isGrpOpen ? ' open' : ''}`}
                          style={{ padding: '11px 18px 11px 14px' }}
                          onClick={() => setClosedModalGroups((prev) => {
                            const n = new Set(prev)
                            n.has(mgKey) ? n.delete(mgKey) : n.add(mgKey)
                            return n
                          })}
                        >
                          <ChevronRight size={12} style={{ transform: isGrpOpen ? 'rotate(90deg)' : 'none', transition: 'transform .22s', color: isGrpOpen ? 'var(--p)' : 'var(--text4)', flexShrink: 0 }} />
                          <span style={{ fontSize: '.76rem', fontWeight: 700, color: isGrpOpen ? 'var(--text1)' : 'var(--text2)', flex: 1, letterSpacing: '.01em' }}>{grp.label}</span>
                          {grpSel > 0 && (
                            <span style={{ fontSize: '.62rem', fontWeight: 700, background: 'var(--p-lt)', color: 'var(--p)', borderRadius: 20, padding: '2px 8px', marginRight: 8 }}>
                              {grpSel}/{grp.items.length}
                            </span>
                          )}
                          <label onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              className="ck"
                              checked={allGrpSel}
                              ref={(el) => { if (el) el.indeterminate = someGrpSel }}
                              onChange={() => {
                                const ids = grp.items.map((a) => a.id)
                                setEnabledAddons((prev) => {
                                  const cur = prev[mod.id] || []
                                  const rest = cur.filter((n) => !ids.includes(n))
                                  return { ...prev, [mod.id]: allGrpSel ? rest : [...rest, ...ids] }
                                })
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{ cursor: 'pointer' }}
                            />
                          </label>
                        </div>
                        <div className="acc-body" style={{ maxHeight: isGrpOpen ? `${grp.items.length * 52}px` : 0 }}>
                          {grp.items.map((addon) => {
                            const checked = enabledAddonList.includes(addon.id)
                            return (
                              <label key={addon.id} className="modal-addon-item">
                                <input
                                  type="checkbox"
                                  className="ck"
                                  checked={checked}
                                  onChange={() => toggleAddon(mod.id, addon.id)}
                                  style={{ cursor: 'pointer', flexShrink: 0 }}
                                />
                                <span style={{ flex: 1, fontSize: '.82rem', fontWeight: checked ? 600 : 500, color: checked ? 'var(--text1)' : 'var(--text2)', transition: 'color .12s' }}>
                                  {addon.name}
                                </span>
                                {checked && <Check size={13} style={{ color: 'var(--p)', flexShrink: 0 }} />}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', flexShrink: 0 }}>
                <div style={{ fontSize: '.74rem', color: 'var(--text3)' }}>
                  {extraSelectedCount > 0
                    ? <span style={{ color: 'var(--text1)', fontWeight: 600 }}>{extraSelectedCount} optional add-on{extraSelectedCount > 1 ? 's' : ''} enabled</span>
                    : 'No optional add-ons selected'
                  }
                </div>
                <button type="button" className="btn btn-p" style={{ cursor: 'pointer' }} onClick={closeModal}>
                  <Check size={13} /> Done
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
