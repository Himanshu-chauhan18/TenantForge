interface PhoneInputProps {
  value: string
  onChange: (v: string) => void
  phonecode?: string | null
  emoji?: string | null
}

export function PhoneInput({ value, onChange, phonecode, emoji }: PhoneInputProps) {
  const raw = phonecode ? phonecode.split('-')[0].split(' ')[0].replace(/[^0-9]/g, '') : ''
  const code = raw ? `+${raw}` : ''
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid var(--border)', borderRadius: 9, overflow: 'hidden', background: 'var(--surface)', transition: 'border-color .15s' }}>
      {code && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', background: 'var(--bg)', borderRight: '1.5px solid var(--border)', flexShrink: 0, fontSize: '.82rem', color: 'var(--text2)', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 60 }}>
          {emoji && <span style={{ fontSize: '1rem', lineHeight: 1 }}>{emoji}</span>}
          {code}
        </div>
      )}
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={code ? 'Phone number' : '+91 98765 43210'}
        style={{ flex: 1, padding: '0 12px', background: 'transparent', border: 'none', outline: 'none', fontSize: '.82rem', color: 'var(--text1)', height: 37 }}
      />
    </div>
  )
}
