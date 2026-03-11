import {
  DollarSign, FileText, Calculator, CreditCard,
  TrendingUp, Shield, Clock, Users, Settings, Download,
} from 'lucide-react'

const FEATURES = [
  { icon: <DollarSign size={20} />,  label: 'Salary Processing',  sub: 'Automated monthly payroll runs' },
  { icon: <FileText size={20} />,    label: 'Payslips',           sub: 'Digital payslip generation & delivery' },
  { icon: <Calculator size={20} />,  label: 'Tax Computation',    sub: 'TDS, PF, ESI auto-calculation' },
  { icon: <CreditCard size={20} />,  label: 'Bank Transfers',     sub: 'Direct salary disbursement' },
  { icon: <TrendingUp size={20} />,  label: 'Payroll Reports',    sub: 'MIS reports & audit trails' },
  { icon: <Shield size={20} />,      label: 'Compliance',         sub: 'PF, ESI, PT statutory filings' },
  { icon: <Clock size={20} />,       label: 'Arrears & Advances', sub: 'Manage salary adjustments' },
  { icon: <Users size={20} />,       label: 'CTC Structuring',    sub: 'Component-wise salary setup' },
  { icon: <Download size={20} />,    label: 'Form 16 / Form 24Q', sub: 'Year-end tax documents' },
  { icon: <Settings size={20} />,    label: 'Payroll Settings',   sub: 'Configure pay components & cycles' },
]

export default function PayrollPage() {
  return (
    <>
      <style>{`
        .pr-hero {
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          border-radius: 16px; padding: 28px 26px; margin-bottom: 22px;
          position: relative; overflow: hidden;
        }
        .pr-hero::before {
          content: ''; position: absolute; top: -50px; right: -30px;
          width: 220px; height: 220px; border-radius: 50%;
          background: rgba(255,255,255,.07); pointer-events: none;
        }
        .pr-hero::after {
          content: ''; position: absolute; bottom: -70px; right: 80px;
          width: 160px; height: 160px; border-radius: 50%;
          background: rgba(255,255,255,.05); pointer-events: none;
        }
        .pr-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 11px; border-radius: 20px; margin-bottom: 10px;
          background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.25);
          font-size: .66rem; font-weight: 700; color: #fff;
          letter-spacing: .07em; text-transform: uppercase;
        }
        .pr-title {
          font-family: var(--fd); font-size: 1.55rem; font-weight: 900;
          color: #fff; line-height: 1.2; margin-bottom: 8px;
        }
        .pr-sub { font-size: .8rem; color: rgba(255,255,255,.72); line-height: 1.55; max-width: 480px; }

        .pr-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
          gap: 12px; margin-bottom: 20px;
        }
        .pr-card {
          padding: 18px 15px 16px; border-radius: 13px;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 11px;
          transition: transform .18s, box-shadow .18s; position: relative; cursor: default;
        }
        .pr-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.07); }
        .pr-card-icon {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          background: #2563EB18; border: 1px solid #2563EB30; color: #2563EB;
        }
        .pr-card-label { font-weight: 700; font-size: .83rem; color: var(--text1); }
        .pr-card-sub   { font-size: .69rem; color: var(--text3); margin-top: -5px; line-height: 1.4; }
        .pr-cs {
          position: absolute; top: 9px; right: 9px;
          font-size: .52rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
          padding: 2px 6px; border-radius: 20px;
          background: var(--bg2); border: 1px solid var(--border); color: var(--text4);
        }
        .pr-footer {
          padding: 16px 18px; border-radius: 13px;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; align-items: center; gap: 14px;
        }
        .pr-footer-icon {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
          background: #2563EB14; border: 1px solid #2563EB28;
          display: flex; align-items: center; justify-content: center; color: #2563EB;
        }
      `}</style>

      <div className="pr-hero">
        <div className="pr-badge"><DollarSign size={10} /> Payroll</div>
        <div className="pr-title">Payroll Management</div>
        <div className="pr-sub">
          End-to-end payroll processing with statutory compliance, automated tax computation,
          digital payslips, and direct bank disbursement.
        </div>
      </div>

      <div className="pr-grid">
        {FEATURES.map((f) => (
          <div key={f.label} className="pr-card">
            <span className="pr-cs">Soon</span>
            <div className="pr-card-icon">{f.icon}</div>
            <div>
              <div className="pr-card-label">{f.label}</div>
              <div className="pr-card-sub">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pr-footer">
        <div className="pr-footer-icon"><DollarSign size={20} /></div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text1)', marginBottom: 3 }}>
            Payroll Management — Under Development
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text3)', lineHeight: 1.6 }}>
            Complete payroll automation with statutory filings (PF, ESI, TDS) and Form 16
            generation is under active development. Set up <strong>Grades & Designations</strong> in
            Organization Settings to prepare for payroll configuration.
          </div>
        </div>
      </div>
    </>
  )
}
