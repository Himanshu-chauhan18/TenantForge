import { Bell, Calendar, Clock, UserCheck, FileText, Gift, AlertCircle, Zap } from 'lucide-react'

const PLANNED_ALERTS = [
  { icon: <Calendar size={15} />, title: 'Contract Expiry Alerts', desc: 'Get notified before employee contracts expire', color: '#D97706', bg: 'rgba(217,119,6,.1)' },
  { icon: <Clock size={15} />, title: 'Probation End Reminders', desc: 'Automated reminders when probation periods end', color: '#0284C7', bg: 'rgba(2,132,199,.1)' },
  { icon: <Gift size={15} />, title: 'Birthday & Work Anniversary', desc: 'Celebrate employee milestones automatically', color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },
  { icon: <UserCheck size={15} />, title: 'Document Expiry Alerts', desc: 'Alerts for expiring employee documents (visa, certifications)', color: '#EF4444', bg: 'rgba(239,68,68,.1)' },
  { icon: <FileText size={15} />, title: 'Policy Acknowledgement', desc: 'Remind employees to acknowledge policy updates', color: '#059669', bg: 'rgba(5,150,105,.1)' },
  { icon: <AlertCircle size={15} />, title: 'Compliance Deadlines', desc: 'Track and alert on statutory compliance deadlines', color: '#DC2626', bg: 'rgba(220,38,38,.1)' },
]

export default function HrmsAlerts() {
  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">Alerts Configuration</div>
          <div className="ph-sub">Configure automated HR alerts and reminders</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', paddingTop: 24 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ padding: '48px 40px 32px', background: 'linear-gradient(135deg, var(--p-lt) 0%, var(--s-lt) 100%)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,var(--p),var(--s))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(13,148,136,.3)' }}>
              <Bell size={32} color="#fff" />
            </div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text1)', marginBottom: 10 }}>
              Alert Notifications Coming Soon
            </div>
            <p style={{ fontSize: '.84rem', color: 'var(--text3)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 20px' }}>
              We're building a powerful alert system that will keep your HR team proactively informed about important dates, document expirations, and compliance deadlines.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, background: 'rgba(13,148,136,.15)', border: '1px solid rgba(13,148,136,.25)', fontSize: '.72rem', fontWeight: 700, color: 'var(--p)' }}>
              <Zap size={12} /> In Development
            </div>
          </div>

          <div style={{ padding: '28px 32px 36px' }}>
            <div style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 16 }}>
              Planned Alert Types
            </div>
            <div className="g2">
              {PLANNED_ALERTS.map((alert) => (
                <div key={alert.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', opacity: .7 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: alert.bg, color: alert.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {alert.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text1)', marginBottom: 2 }}>{alert.title}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)', lineHeight: 1.4 }}>{alert.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
