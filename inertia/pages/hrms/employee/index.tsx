import { Users, UserPlus, FileText, Award, Clock, BarChart2, Shield, Zap } from 'lucide-react'

const FEATURES = [
  { icon: <UserPlus size={18} />, title: 'Employee Onboarding', desc: 'Streamlined onboarding workflows with document collection, checklist management, and automated welcome emails', color: '#7C3AED', bg: 'rgba(124,58,237,.12)' },
  { icon: <FileText size={18} />, title: 'Employee Profiles', desc: 'Comprehensive employee profiles with personal info, employment history, skills, documents, and org hierarchy', color: '#0D9488', bg: 'rgba(13,148,136,.12)' },
  { icon: <Award size={18} />, title: 'Performance Management', desc: 'Set goals, conduct appraisals, track KPIs, and manage performance reviews with 360° feedback', color: '#D97706', bg: 'rgba(217,119,6,.12)' },
  { icon: <Clock size={18} />, title: 'Leave Management', desc: 'Apply, approve, and track leave requests with accrual policies, calendar view, and conflict detection', color: '#0284C7', bg: 'rgba(2,132,199,.12)' },
  { icon: <BarChart2 size={18} />, title: 'HR Analytics', desc: 'Headcount trends, attrition analysis, department breakdowns, and custom reporting dashboards', color: '#DB2777', bg: 'rgba(219,39,119,.12)' },
  { icon: <Shield size={18} />, title: 'Role & Access Control', desc: 'Granular permissions by role, department, and grade — manage who sees what across the system', color: '#059669', bg: 'rgba(5,150,105,.12)' },
]

export default function HrmsEmployeeIndex() {
  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1040 0%, #2d1b69 40%, #3b2088 70%, #1e1040 100%)',
        padding: '64px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(219,39,119,.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg,#7C3AED,#DB2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(124,58,237,.4)' }}>
            <Users size={36} color="#fff" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: 'rgba(124,58,237,.25)', border: '1px solid rgba(124,58,237,.4)', fontSize: '.72rem', fontWeight: 700, color: '#c4b5fd', marginBottom: 20, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            <Zap size={11} /> In Development
          </div>

          <h1 style={{ fontFamily: 'var(--fd)', fontSize: '2.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Employee Module
            <br />
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Coming Soon
            </span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem', lineHeight: 1.8, maxWidth: 500, margin: '0 auto' }}>
            We're building a powerful employee management suite that covers the entire employee lifecycle — from onboarding to offboarding, with full HR operations in between.
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 10 }}>
            What's Coming
          </div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text1)' }}>
            Planned Features
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ padding: '20px 20px', opacity: .88, transition: 'opacity .15s' }}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.opacity = '.88'}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                {f.icon}
              </div>
              <div style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--text1)', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: '.74rem', color: 'var(--text3)', lineHeight: 1.65 }}>{f.desc}</div>
              <div style={{ marginTop: 14, display: 'inline-block', fontSize: '.62rem', fontWeight: 700, color: f.color, background: f.bg, padding: '2px 10px', borderRadius: 10 }}>Soon</div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ marginTop: 48, textAlign: 'center', padding: '24px 32px', borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.8rem', color: 'var(--text3)', lineHeight: 1.7 }}>
            The Employee module is actively being developed. Organization settings you configure now (departments, designations, grades, locations, etc.) will be used directly when the Employee module goes live.
          </div>
        </div>
      </div>
    </div>
  )
}
