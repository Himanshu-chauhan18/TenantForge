import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import {
  Building2, MapPin, Globe, Calendar, Shield, ArrowLeft, Check,
} from 'lucide-react'

interface Org {
  id: number
  org_id: string
  name: string
  company_size: string | null
  industry: string | null
  website: string | null
  about: string | null
  gst_no: string | null
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
}

interface Props {
  org: Org
  users: Array<{ id: number; email: string; full_name?: string }>
  flash?: { success?: string; errors?: Record<string, string> }
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance & Banking', 'Education', 'Manufacturing',
  'Retail & E-commerce', 'Real Estate', 'Hospitality', 'Logistics & Transport',
  'Media & Entertainment', 'Legal', 'Non-profit', 'Government', 'Other',
]
const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London',
  'Europe/Paris', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Australia/Sydney', 'Pacific/Auckland',
]
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD']
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']
const TIME_FORMATS = ['12h', '24h']
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+']
const STATUSES = ['active', 'inactive', 'expired'] as const

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

export default function EditOrganization({ org, users, flash }: Props) {
  const [processing, setProcessing] = useState(false)

  const [name, setName] = useState(org.name)
  const [companySize, setCompanySize] = useState(org.company_size || '')
  const [industry, setIndustry] = useState(org.industry || '')
  const [website, setWebsite] = useState(org.website || '')
  const [about, setAbout] = useState(org.about || '')
  const [gstNo, setGstNo] = useState(org.gst_no || '')
  const [fiscalName, setFiscalName] = useState(org.fiscal_name || '')
  const [fiscalStart, setFiscalStart] = useState(org.fiscal_start ? org.fiscal_start.split('T')[0] : '')
  const [fiscalEnd, setFiscalEnd] = useState(org.fiscal_end ? org.fiscal_end.split('T')[0] : '')
  const [country, setCountry] = useState(org.country || '')
  const [city, setCity] = useState(org.city || '')
  const [phone, setPhone] = useState(org.phone || '')
  const [email, setEmail] = useState(org.email || '')
  const [address, setAddress] = useState(org.address || '')
  const [leadOwnerId, setLeadOwnerId] = useState(org.lead_owner_id ? String(org.lead_owner_id) : '')
  const [currency, setCurrency] = useState(org.currency)
  const [timezone, setTimezone] = useState(org.timezone)
  const [dateFormat, setDateFormat] = useState(org.date_format)
  const [timeFormat, setTimeFormat] = useState(org.time_format)
  const [planType, setPlanType] = useState<'trial' | 'premium'>(org.plan_type)
  const [userLimit, setUserLimit] = useState(org.user_limit)
  const [planStart, setPlanStart] = useState(org.plan_start ? org.plan_start.split('T')[0] : '')
  const [planEnd, setPlanEnd] = useState(org.plan_end ? org.plan_end.split('T')[0] : '')
  const [status, setStatus] = useState(org.status)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { alert('Organization name is required.'); return }
    setProcessing(true)
    router.put(`/organizations/${org.id}`, {
      name, company_size: companySize, industry, website, about, gst_no: gstNo,
      fiscal_name: fiscalName, fiscal_start: fiscalStart || undefined, fiscal_end: fiscalEnd || undefined,
      country, city, phone, email, address,
      lead_owner_id: leadOwnerId || undefined,
      currency, timezone, date_format: dateFormat, time_format: timeFormat,
      plan_type: planType, user_limit: userLimit, status,
      plan_start: planStart || undefined, plan_end: planEnd || undefined,
    }, {
      onFinish: () => setProcessing(false),
    })
  }

  return (
    <>
      <div className="ph">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/organizations/${org.id}`} className="ibtn">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="ph-title">Edit Organization</div>
            <div className="ph-sub">{org.org_id} · {org.name}</div>
          </div>
        </div>
        <div className="ph-right">
          <Link href={`/organizations/${org.id}`} className="btn btn-ghost btn-sm">Cancel</Link>
          <button className="btn btn-p" onClick={handleSubmit} disabled={processing}>
            <Check size={14} /> {processing ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {flash?.errors && Object.values(flash.errors).map((e, i) => (
        <div key={i} className="alert alert-danger">{e}</div>
      ))}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-b">

            {/* Company Details */}
            <div className="fs">
              <SectionHead icon={<Building2 size={15} />} title="Company Details" />
              <div className="g2">
                <div className="fg col2">
                  <label>Organization Name <span className="req">*</span></label>
                  <input className="fi" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="fg">
                  <label>Company Size</label>
                  <select className="fi fi-sel" value={companySize} onChange={(e) => setCompanySize(e.target.value)}>
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Industry</label>
                  <select className="fi fi-sel" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Website</label>
                  <input className="fi" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
                <div className="fg">
                  <label>GST Number</label>
                  <input className="fi" value={gstNo} onChange={(e) => setGstNo(e.target.value)} />
                </div>
                <div className="fg col2">
                  <label>About</label>
                  <textarea className="fi" rows={3} value={about} onChange={(e) => setAbout(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Fiscal Year */}
            <div className="fs">
              <SectionHead icon={<Calendar size={15} />} title="Fiscal Year" />
              <div className="g3">
                <div className="fg">
                  <label>Fiscal Year Name</label>
                  <input className="fi" value={fiscalName} onChange={(e) => setFiscalName(e.target.value)} />
                </div>
                <div className="fg">
                  <label>Start Date</label>
                  <input type="date" className="fi" value={fiscalStart} onChange={(e) => setFiscalStart(e.target.value)} />
                </div>
                <div className="fg">
                  <label>End Date</label>
                  <input type="date" className="fi" value={fiscalEnd} onChange={(e) => setFiscalEnd(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="fs">
              <SectionHead icon={<MapPin size={15} />} title="Contact Details" />
              <div className="g2">
                <div className="fg">
                  <label>Country</label>
                  <input className="fi" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div className="fg">
                  <label>City</label>
                  <input className="fi" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="fg">
                  <label>Phone</label>
                  <input className="fi" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="fg">
                  <label>Email</label>
                  <input type="email" className="fi" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="fg col2">
                  <label>Address</label>
                  <textarea className="fi" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <div className="fg col2">
                  <label>Lead Owner</label>
                  <select className="fi fi-sel" value={leadOwnerId} onChange={(e) => setLeadOwnerId(e.target.value)}>
                    <option value="">No lead owner</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Locale */}
            <div className="fs">
              <SectionHead icon={<Globe size={15} />} title="Locale Settings" />
              <div className="g2">
                <div className="fg">
                  <label>Currency</label>
                  <select className="fi fi-sel" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Timezone</label>
                  <select className="fi fi-sel" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Date Format</label>
                  <select className="fi fi-sel" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                    {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Time Format</label>
                  <select className="fi fi-sel" value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)}>
                    {TIME_FORMATS.map((f) => <option key={f} value={f}>{f === '12h' ? '12-hour (AM/PM)' : '24-hour'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="fs">
              <SectionHead icon={<Shield size={15} />} title="Plan & Status" />
              <div className="g2">
                <div className="fg col2">
                  <label>Plan Type</label>
                  <div className="radio-g">
                    <label className={`rc ${planType === 'trial' ? 'on' : ''}`} style={{ cursor: 'pointer' }}>
                      <input type="radio" name="plan_type" value="trial" checked={planType === 'trial'} onChange={() => setPlanType('trial')} />
                      <div className="rc-dot" />
                      <div><div className="rc-title">Trial</div><div className="rc-desc">Free trial period</div></div>
                    </label>
                    <label className={`rc ${planType === 'premium' ? 'on' : ''}`} style={{ cursor: 'pointer' }}>
                      <input type="radio" name="plan_type" value="premium" checked={planType === 'premium'} onChange={() => setPlanType('premium')} />
                      <div className="rc-dot" />
                      <div><div className="rc-title">Premium</div><div className="rc-desc">Paid subscription</div></div>
                    </label>
                  </div>
                </div>
                <div className="fg">
                  <label>Status</label>
                  <select className="fi fi-sel" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>User Limit</label>
                  <input type="number" className="fi" min={1} value={userLimit} onChange={(e) => setUserLimit(Number(e.target.value))} />
                </div>
                <div className="fg">
                  <label>Plan Start Date</label>
                  <input type="date" className="fi" value={planStart} onChange={(e) => setPlanStart(e.target.value)} />
                </div>
                <div className="fg">
                  <label>Plan End Date</label>
                  <input type="date" className="fi" value={planEnd} onChange={(e) => setPlanEnd(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Link href={`/organizations/${org.id}`} className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-p" disabled={processing}>
                <Check size={14} /> {processing ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
