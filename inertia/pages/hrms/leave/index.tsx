import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  FileText, TrendingUp, Users, Bell, Settings,
} from 'lucide-react'

const FEATURES = [
  { icon: <FileText size={20} />,     label: 'Apply Leave',         sub: 'Submit leave requests online' },
  { icon: <Clock size={20} />,        label: 'Leave Balance',       sub: 'Track available leave days' },
  { icon: <CheckCircle size={20} />,  label: 'Approval Workflow',   sub: 'Manager approval & notifications' },
  { icon: <Calendar size={20} />,     label: 'Leave Calendar',      sub: 'Team leave overview' },
  { icon: <XCircle size={20} />,      label: 'Cancel / Revoke',     sub: 'Manage pending requests' },
  { icon: <AlertCircle size={20} />,  label: 'Leave Encashment',    sub: 'Convert leaves to pay' },
  { icon: <TrendingUp size={20} />,   label: 'Leave Reports',       sub: 'Analytics & utilization trends' },
  { icon: <Users size={20} />,        label: 'Team Overview',       sub: 'Who\'s on leave today' },
  { icon: <Bell size={20} />,         label: 'Reminders',           sub: 'Auto alerts & expiry notices' },
  { icon: <Settings size={20} />,     label: 'Leave Policies',      sub: 'Configure types & entitlements' },
]

const COLOR = '#16A34A'

export default function LeavePage() {
  return (
    <>
      <style>{`
        .lv-hero {
          background: linear-gradient(135deg, #16A34A 0%, #059669 100%);
          border-radius: 16px; padding: 28px 26px; margin-bottom: 22px;
          position: relative; overflow: hidden;
        }
        .lv-hero::before {
          content: ''; position: absolute; top: -50px; right: -30px;
          width: 220px; height: 220px; border-radius: 50%;
          background: rgba(255,255,255,.07); pointer-events: none;
        }
        .lv-hero::after {
          content: ''; position: absolute; bottom: -70px; right: 80px;
          width: 160px; height: 160px; border-radius: 50%;
          background: rgba(255,255,255,.05); pointer-events: none;
        }
        .lv-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 11px; border-radius: 20px; margin-bottom: 10px;
          background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.25);
          font-size: .66rem; font-weight: 700; color: #fff;
          letter-spacing: .07em; text-transform: uppercase;
        }
        .lv-title {
          font-family: var(--fd); font-size: 1.55rem; font-weight: 900;
          color: #fff; line-height: 1.2; margin-bottom: 8px;
        }
        .lv-sub { font-size: .8rem; color: rgba(255,255,255,.72); line-height: 1.55; max-width: 480px; }

        .lv-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
          gap: 12px; margin-bottom: 20px;
        }
        .lv-card {
          padding: 18px 15px 16px; border-radius: 13px;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 11px;
          transition: transform .18s, box-shadow .18s; position: relative; cursor: default;
        }
        .lv-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.07); }
        .lv-card-icon {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          background: #16A34A18; border: 1px solid #16A34A30; color: #16A34A;
        }
        .lv-card-label { font-weight: 700; font-size: .83rem; color: var(--text1); }
        .lv-card-sub   { font-size: .69rem; color: var(--text3); margin-top: -5px; line-height: 1.4; }
        .lv-cs {
          position: absolute; top: 9px; right: 9px;
          font-size: .52rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
          padding: 2px 6px; border-radius: 20px;
          background: var(--bg2); border: 1px solid var(--border); color: var(--text4);
        }
        .lv-footer {
          padding: 16px 18px; border-radius: 13px;
          background: var(--surface); border: 1px solid var(--border);
          display: flex; align-items: center; gap: 14px;
        }
        .lv-footer-icon {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
          background: #16A34A14; border: 1px solid #16A34A28;
          display: flex; align-items: center; justify-content: center; color: #16A34A;
        }
      `}</style>

      <div className="lv-hero">
        <div className="lv-badge"><Calendar size={10} /> Leave Management</div>
        <div className="lv-title">Leave Management</div>
        <div className="lv-sub">
          Apply, track, and manage employee leaves with policy-driven approval workflows,
          balance tracking, and real-time team calendars.
        </div>
      </div>

      <div className="lv-grid">
        {FEATURES.map((f) => (
          <div key={f.label} className="lv-card">
            <span className="lv-cs">Soon</span>
            <div className="lv-card-icon">{f.icon}</div>
            <div>
              <div className="lv-card-label">{f.label}</div>
              <div className="lv-card-sub">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="lv-footer">
        <div className="lv-footer-icon"><Calendar size={20} /></div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '.86rem', color: 'var(--text1)', marginBottom: 3 }}>
            Leave Management — Under Development
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--text3)', lineHeight: 1.6 }}>
            The full leave management module with policy configuration, approval workflows,
            and analytics is actively being built. Configure leave types in the
            <strong> Organization → Settings</strong> module first.
          </div>
        </div>
      </div>
    </>
  )
}
