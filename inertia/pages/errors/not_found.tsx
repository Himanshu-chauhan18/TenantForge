import { Link } from '@inertiajs/react'
import { Compass, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'var(--p-lt)', border: '1px solid var(--p-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
        }}>
          <Compass size={36} style={{ color: 'var(--p)' }} />
        </div>

        {/* 404 */}
        <div style={{
          fontFamily: 'var(--fd)', fontSize: '5rem', fontWeight: 900,
          color: 'var(--p)', lineHeight: 1, marginBottom: 12,
          background: 'linear-gradient(135deg, var(--p), var(--s))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          404
        </div>

        <div style={{ fontFamily: 'var(--fd)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text1)', marginBottom: 10 }}>
          Page not found
        </div>
        <p style={{ fontSize: '.88rem', color: 'var(--text3)', lineHeight: 1.7, marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved.<br />
          Check the URL or navigate back to a known page.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <Link href="/orgbuilder/dashboard" className="btn btn-p">
            <Home size={14} /> Dashboard
          </Link>
        </div>

        {/* Brand */}
        <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, var(--p), var(--s))',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--fd)', fontWeight: 800, fontSize: '.85rem', color: 'var(--text2)' }}>TenantForge</span>
        </div>
      </div>
    </div>
  )
}
