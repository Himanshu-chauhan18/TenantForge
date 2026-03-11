import { useForm, usePage } from '@inertiajs/react'
import { CalendarDays, Info, AlertTriangle } from 'lucide-react'

interface Props {
  company: Record<string, any>
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function calcDuration(start: string, end: string): string {
  if (!start || !end) return '—'
  const sIdx = MONTHS.indexOf(start)
  const eIdx = MONTHS.indexOf(end)
  if (sIdx < 0 || eIdx < 0) return '—'
  const months = sIdx <= eIdx ? eIdx - sIdx + 1 : 12 - sIdx + eIdx + 1
  return `${months} month${months !== 1 ? 's' : ''}`
}

export default function HrmsFiscalYear({ company }: Props) {
  const page = usePage<any>()
  const flash = page.props?.flash as any

  const { data, setData, put, processing, errors } = useForm({
    fiscalName: company.fiscal_name ?? '',
    fiscalStart: company.fiscal_start ?? 'April',
    fiscalEnd: company.fiscal_end ?? 'March',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put('/hrms/organization/company')
  }

  const duration = calcDuration(data.fiscalStart, data.fiscalEnd)

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">Fiscal Year Settings</div>
          <div className="ph-sub">Define the fiscal year period for your organization</div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Current fiscal year info card */}
        <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#0D9488,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarDays size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 4 }}>Current Fiscal Year</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text1)', fontFamily: 'var(--fd)' }}>
              {company.fiscal_name || company.name + ' FY'}
            </div>
            <div style={{ fontSize: '.78rem', color: 'var(--text3)', marginTop: 2 }}>
              {company.fiscal_start || 'April'} — {company.fiscal_end || 'March'} &nbsp;·&nbsp;
              <span style={{ color: 'var(--p)', fontWeight: 600 }}>{calcDuration(company.fiscal_start || 'April', company.fiscal_end || 'March')}</span>
            </div>
          </div>
        </div>

        {/* Update form */}
        <div className="card" style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text1)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={15} color="var(--p)" /> Update Fiscal Year
          </div>

          {flash?.success && (
            <div className="alert alert-success" style={{ marginBottom: 16 }}>{flash.success}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Fiscal Name */}
            <div className="fg">
              <label htmlFor="fiscalName">Fiscal Year Name <span className="req">*</span></label>
              <input
                id="fiscalName"
                type="text"
                className="fi"
                placeholder="e.g. FY 2024-25"
                value={data.fiscalName}
                onChange={(e) => setData('fiscalName', e.target.value)}
                required
              />
              {errors.fiscalName && <span className="fg-err">{errors.fiscalName}</span>}
              <span className="fg-hint">A label for this fiscal year period</span>
            </div>

            {/* Start & End */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="fg">
                <label htmlFor="fiscalStart">Start Month <span className="req">*</span></label>
                <select
                  id="fiscalStart"
                  className="fi"
                  value={data.fiscalStart}
                  onChange={(e) => setData('fiscalStart', e.target.value)}
                  required
                >
                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                </select>
                {errors.fiscalStart && <span className="fg-err">{errors.fiscalStart}</span>}
              </div>
              <div className="fg">
                <label htmlFor="fiscalEnd">End Month <span className="req">*</span></label>
                <select
                  id="fiscalEnd"
                  className="fi"
                  value={data.fiscalEnd}
                  onChange={(e) => setData('fiscalEnd', e.target.value)}
                  required
                >
                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                </select>
                {errors.fiscalEnd && <span className="fg-err">{errors.fiscalEnd}</span>}
              </div>
            </div>

            {/* Duration preview */}
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(13,148,136,.08)', border: '1px solid rgba(13,148,136,.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CalendarDays size={15} color="#0D9488" />
              <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}>
                Duration: <strong style={{ color: '#0D9488' }}>{duration}</strong>
                {data.fiscalName && <> &nbsp;·&nbsp; <strong>{data.fiscalName}</strong></>}
              </span>
            </div>

            {/* Warning */}
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(217,119,6,.08)', border: '1px solid rgba(217,119,6,.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: '.76rem', color: 'var(--text3)', lineHeight: 1.6 }}>
                Changing the fiscal year may affect payroll calculations, attendance cycles, and reporting periods. Ensure all stakeholders are informed before updating.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-p" disabled={processing}>
                {processing ? 'Saving…' : 'Save Fiscal Year'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
