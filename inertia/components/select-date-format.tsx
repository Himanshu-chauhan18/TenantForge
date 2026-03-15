import { DATE_FORMATS } from '~/data/org-options'

export function SelectDateFormat({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 2 }}>
      {DATE_FORMATS.map((f) => {
        const sel = value === f.value
        return (
          <div
            key={f.value}
            onClick={() => onChange(f.value)}
            style={{
              flex: '1 0 0', minWidth: 0,
              padding: '8px 10px', borderRadius: 9, cursor: 'pointer', userSelect: 'none',
              border: `1.5px solid ${sel ? 'var(--p)' : 'var(--border)'}`,
              background: sel ? 'var(--p-lt)' : 'var(--surface)',
              transition: 'border-color .15s, background .15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${sel ? 'var(--p)' : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color .15s' }}>
              {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--p)' }} />}
            </div>
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: sel ? 'var(--p)' : 'var(--text1)', fontFamily: 'monospace', letterSpacing: '.02em', whiteSpace: 'nowrap' }}>{f.value}</span>
            <span style={{ fontSize: '.63rem', color: sel ? 'var(--p)' : 'var(--text3)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{f.example}</span>
          </div>
        )
      })}
    </div>
  )
}
