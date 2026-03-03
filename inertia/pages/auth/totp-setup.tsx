import { useState, useRef, useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import { QrCode, AlertCircle, CheckCircle } from 'lucide-react'

interface TotpSetupProps {
  qrCode: string
  secret: string
}

export default function TotpSetup({ qrCode, secret }: TotpSetupProps) {
  const page = usePage<any>()
  const flash = page.props?.flash as any
  const totpError = flash?.errors?.totp

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  const { post, processing, setData } = useForm({ token: '' })

  useEffect(() => { refs[0].current?.focus() }, [])

  const handleDigit = (idx: number, val: string) => {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = v
    setDigits(next)
    setData('token', next.join(''))
    if (v && idx < 5) refs[idx + 1].current?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) refs[idx - 1].current?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      setData('token', pasted)
      refs[5].current?.focus()
    }
    e.preventDefault()
  }

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--p), var(--s))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={26} color="white" />
          </div>
        </div>

        <div className="auth-title" style={{ textAlign: 'center' }}>Set up two-factor auth</div>
        <div className="auth-sub" style={{ textAlign: 'center', marginBottom: 20 }}>Scan the QR code with Google Authenticator or any TOTP app</div>

        {totpError && (
          <div className="alert alert-danger">
            <AlertCircle size={15} />
            {totpError}
          </div>
        )}

        {/* Steps */}
        <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--p)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>1</div>
            <div>
              <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)', marginBottom: 2 }}>Install Google Authenticator</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Download from App Store or Google Play</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--p)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>2</div>
            <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)' }}>Scan this QR code</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
              <img src={qrCode} alt="TOTP QR Code" style={{ width: 160, height: 160 }} />
            </div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: '.68rem', color: 'var(--text3)', marginBottom: 4 }}>Or enter manually:</div>
            <div style={{ fontFamily: 'monospace', fontSize: '.78rem', background: 'var(--surface)', padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', letterSpacing: '.1em', color: 'var(--text1)', wordBreak: 'break-all' as const }}>
              {secret}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--p)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>3</div>
            <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text1)' }}>Enter the 6-digit code below</div>
          </div>
        </div>

        <div className="totp-input" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="totp-digit"
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        <button
          className="btn btn-p"
          style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }}
          disabled={processing || digits.join('').length < 6}
          onClick={() => post('/auth/totp/setup')}
        >
          {processing ? 'Enabling…' : 'Enable two-factor auth'}
        </button>
      </div>
    </div>
  )
}
