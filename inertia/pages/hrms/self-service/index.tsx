import { usePage } from '@inertiajs/react'
import {
  User, FileText, Clock, Calendar, DollarSign,
  Award, MessageSquare, TrendingUp, Shield, Users,
  LayoutGrid,
} from 'lucide-react'

interface HrmsUser {
  fullName: string
  initials: string
  profileName: string
  employeeCode: string | null
  org: { name: string }
}

const MODULES = [
  { icon: <User size={20} />,          label: 'My Profile',        sub: 'Personal info & documents',   color: '#4F46E5' },
  { icon: <FileText size={20} />,      label: 'Leave Management',  sub: 'Apply & track leaves',         color: '#0D9488' },
  { icon: <Clock size={20} />,         label: 'Attendance',        sub: 'Logs & regularization',        color: '#D97706' },
  { icon: <DollarSign size={20} />,    label: 'Payroll',           sub: 'Payslips & salary details',    color: '#059669' },
  { icon: <Calendar size={20} />,      label: 'My Schedule',       sub: 'Shifts & work calendar',       color: '#7C3AED' },
  { icon: <Award size={20} />,         label: 'Performance',       sub: 'Goals & appraisals',           color: '#DC2626' },
  { icon: <MessageSquare size={20} />, label: 'HR Requests',       sub: 'Raise & track requests',       color: '#2563EB' },
  { icon: <TrendingUp size={20} />,    label: 'Learning & Growth', sub: 'Training & certifications',    color: '#EA580C' },
  { icon: <Shield size={20} />,        label: 'Benefits',          sub: 'Insurance & perks',            color: '#0891B2' },
  { icon: <Users size={20} />,         label: 'My Team',           sub: 'Colleagues & org chart',       color: '#9333EA' },
]

export default function SelfServicePage() {
  const { props } = usePage<any>()
  const hrmsUser: HrmsUser | undefined = (props as any).hrmsUser

  return (
    <>
      <style>{`
        .ss-hero {
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          border-radius: 16px; padding: 28px 26px; margin-bottom: 22px;
          position: relative; overflow: hidden;
        }
        .ss-hero::before {
          content: ''; position: absolute; top: -50px; right: -30px;
          width: 220px; height: 220px; border-radius: 50%;
          background: rgba(255,255,255,.07); pointer-events: none;
        }
        .ss-hero::after {
          content: ''; position: absolute; bottom: -70px; right: 80px;
          width: 160px; height: 160px; border-radius: 50%;
          background: rgba(255,255,255,.05); pointer-events: none;
        }
        .ss-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 11px; border-radius: 20px; margin-bottom: 10px;
          background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.25);
          font-size: .66rem; font-weight: 700; color: #fff;
          letter-spacing: .07em; text-transform: uppercase;
        }
        .ss-greeting { font-size: .82rem; color: rgba(255,255,255,.7); margin-bottom: 4px; }
        .ss-name {
          font-family: var(--fd); font-size: 1.55rem; font-weight: 900;
          color: #fff; line-height: 1.2; margin-bottom: 6px;
        }
        .ss-sub { font-size: .8rem; color: rgba(255,255,255,.68); line-height: 1.5; }

        .ss-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
          gap: 12px; margin-bottom: 20px;
        }
        .ss-card {
          padding: 18px 15px 16px; border-radius: 13px;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 11px;
          transition: border-color .18s, box-shadow .18s, transform .18s;
          position: relative; overflow: hidden; cursor: default;
        }
        .ss-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.07); }
        .ss-card-icon {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
        }
        .ss-card-label { font-weight: 700; font-size: .83rem; color: var(--text1); }
        .ss-card-sub   { font-size: .69rem; color: var(--text3); margin-top: -5px; line-height: 1.4; }
        .ss-cs-badge {
          position: absolute; top: 9px; right: 9px;
          font-size: .52rem; font-weight: 800; letter-spacing: .05em;
          text-transform: uppercase; padding: 2px 6px; border-radius: 20px;
          background: var(--bg2); border: 1px solid var(--border); color: var(--text4);
        }
        .ss-footer {
          padding: 16px 18px; border-radius: 13px;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; align-items: center; gap: 14px;
        }
        .ss-footer-icon {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(79,70,229,.12), rgba(124,58,237,.06));
          border: 1px solid rgba(79,70,229,.2);
          display: flex; align-items: center; justify-content: center; color: #4F46E5;
        }
      `}</style>

      {/* hero */}
      <div className="ss-hero">
        <div className="ss-badge"><LayoutGrid size={10} /> Self Service</div>
        <div className="ss-greeting">Welcome back,</div>
        <div className="ss-name">{hrmsUser?.fullName ?? 'Employee'}</div>
        <div className="ss-sub">
          {hrmsUser?.profileName ?? 'Staff'}
          {hrmsUser?.employeeCode ? ` · ${hrmsUser.employeeCode}` : ''}
          {hrmsUser?.org?.name ? ` · ${hrmsUser.org.name}` : ''}
        </div>
      </div>

      {/* module grid */}
      <div className="ss-grid">
        {MODULES.map((m) => (
          <div key={m.label} className="ss-card">
            <span className="ss-cs-badge">Soon</span>
            <div className="ss-card-icon" style={{ background: `${m.color}18`, border: `1px solid ${m.color}30`, color: m.color }}>
              {m.icon}
            </div>
            <div>
              <div className="ss-card-label">{m.label}</div>
              <div className="ss-card-sub">{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* notice */}
      <div className="ss-footer">
        <div className="ss-footer-icon"><LayoutGrid size={20} /></div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text1)', marginBottom: 3 }}>
            Self Service Portal — Under Development
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text3)', lineHeight: 1.6 }}>
            All self-service features are under active development and will be enabled progressively.
            Use the <strong>Organization</strong> module to configure your workspace settings.
          </div>
        </div>
      </div>
    </>
  )
}
