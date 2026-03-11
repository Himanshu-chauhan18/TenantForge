import { Mail, Smartphone, Bell, Webhook, MessageSquare, Zap } from 'lucide-react'

const PLANNED_NOTIFICATIONS = [
  { icon: <Mail size={15} />, title: 'Email Notifications', desc: 'Send automated emails on HR events like onboarding, approvals, and alerts', color: '#0D9488', bg: 'rgba(13,148,136,.1)' },
  { icon: <Smartphone size={15} />, title: 'SMS Notifications', desc: 'SMS alerts for critical HR updates and urgent notifications', color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },
  { icon: <Bell size={15} />, title: 'In-App Notifications', desc: 'Real-time in-app notifications for employees and HR managers', color: '#D97706', bg: 'rgba(217,119,6,.1)' },
  { icon: <Webhook size={15} />, title: 'Webhook Integrations', desc: 'Push events to external systems via webhooks (Slack, Teams, etc.)', color: '#0284C7', bg: 'rgba(2,132,199,.1)' },
  { icon: <MessageSquare size={15} />, title: 'WhatsApp & Messaging', desc: 'Send notifications via WhatsApp and other messaging platforms', color: '#059669', bg: 'rgba(5,150,105,.1)' },
]

export default function HrmsNotifications() {
  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-title">Notifications Configuration</div>
          <div className="ph-sub">Configure notification channels and delivery preferences</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', paddingTop: 24 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ padding: '48px 40px 32px', background: 'linear-gradient(135deg, rgba(124,58,237,.08) 0%, rgba(124,58,237,.04) 100%)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#7C3AED,#DB2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(124,58,237,.3)' }}>
              <Bell size={32} color="#fff" />
            </div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text1)', marginBottom: 10 }}>
              Notification Channels Coming Soon
            </div>
            <p style={{ fontSize: '.84rem', color: 'var(--text3)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 20px' }}>
              We're building a comprehensive notification system that allows you to configure multiple delivery channels with fine-grained control over what gets sent, when, and to whom.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', fontSize: '.72rem', fontWeight: 700, color: '#7C3AED' }}>
              <Zap size={12} /> In Development
            </div>
          </div>

          <div style={{ padding: '28px 32px 36px' }}>
            <div style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 16 }}>
              Planned Notification Channels
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PLANNED_NOTIFICATIONS.map((n) => (
                <div key={n.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', opacity: .7 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: n.bg, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {n.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: '.71rem', color: 'var(--text3)' }}>{n.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '.62rem', fontWeight: 700, color: '#7C3AED', background: 'rgba(124,58,237,.1)', padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>Soon</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
