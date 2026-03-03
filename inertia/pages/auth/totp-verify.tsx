import { useState, useRef, useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import { ShieldCheck, AlertCircle } from 'lucide-react'

export default function TotpVerify() {
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
    if (next.every(d => d) && next.join('').length === 6) {
      setTimeout(() => post('/auth/totp/verify'), 100)
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const next = pasted.split('')
      setDigits(next)
      setData('token', pasted)
      refs[5].current?.focus()
    }
    e.preventDefault()
  }

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, var(--p), var(--s))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} color="white" />
          </div>
        </div>

        <div className="auth-title" style={{ textAlign: 'center' }}>Two-factor verification</div>
        <div className="auth-sub" style={{ textAlign: 'center' }}>Enter the 6-digit code from your authenticator app</div>

        {totpError && (
          <div className="alert alert-danger" style={{ textAlign: 'left' }}>
            <AlertCircle size={15} />
            {totpError}
          </div>
        )}

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
          onClick={() => post('/auth/totp/verify')}
        >
          {processing ? 'Verifying…' : 'Verify code'}
        </button>

        <div style={{ marginTop: 16, fontSize: '.72rem', color: 'var(--text3)' }}>
          <a href="/login" style={{ color: 'var(--p)', fontWeight: 700 }}>← Back to login</a>
        </div>
      </div>
    </div>
  )
}
