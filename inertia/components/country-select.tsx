import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check, X, Loader2 } from 'lucide-react'

export interface CountryOption {
  id: number
  name: string
  iso2: string | null
  currency: string | null
  currencyName: string | null
  currencySymbol: string | null
  timezone: string
  emoji: string | null
  phonecode: string | null
}

export function CountrySelect({
  value,
  onChange,
}: {
  value: CountryOption | null
  onChange: (o: CountryOption | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<CountryOption[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => {
    if (open) { setSearch(''); setOptions([]); load('') }
  }, [open])

  async function load(q: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/countries?search=${encodeURIComponent(q)}`)
      if (res.ok) setOptions(await res.json())
    } catch {}
    setLoading(false)
  }

  function handleSearch(q: string) {
    setSearch(q)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => load(q), 300)
  }

  return (
    <div ref={ref} className="combo-wrap">
      <button
        type="button"
        className="fi"
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'left' }}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? (
          <>
            <span style={{ fontSize: '1.05rem', lineHeight: 1, flexShrink: 0 }}>{value.emoji || '🌍'}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.name}</span>
            {value.iso2 && (
              <span style={{ fontSize: '.68rem', background: 'var(--bg)', color: 'var(--text3)', padding: '1px 6px', borderRadius: 4, flexShrink: 0, border: '1px solid var(--border)' }}>
                {value.iso2}
              </span>
            )}
          </>
        ) : (
          <span style={{ flex: 1, color: 'var(--text4)' }}>Select country…</span>
        )}
        <ChevronDown size={13} style={{ flexShrink: 0, color: 'var(--text3)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div className="combo-options" style={{ zIndex: 300, boxShadow: '0 8px 28px rgba(0,0,0,.12)' }}>
          <div className="combo-search">
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search country…"
                style={{ paddingLeft: 18, width: '100%', fontSize: '.82rem', background: 'none', border: 'none', outline: 'none', color: 'var(--text1)' }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 252, overflowY: 'auto' }}>
            {loading ? (
              <div className="combo-empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Loading countries…
              </div>
            ) : options.length === 0 ? (
              <div className="combo-empty">No countries found</div>
            ) : (
              options.map((c) => {
                const isSel = value?.id === c.id
                return (
                  <div
                    key={c.id}
                    className="combo-option"
                    data-selected={String(isSel)}
                    onClick={() => { onChange(c); setOpen(false); setSearch('') }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
                      <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{c.emoji || '🌍'}</span>
                      <span style={{ flex: 1 }}>{c.name}</span>
                      {c.currency && <span style={{ fontSize: '.7rem', color: isSel ? 'var(--p)' : 'var(--text4)', flexShrink: 0 }}>{c.currency}</span>}
                    </div>
                    {isSel && <Check size={13} style={{ color: 'var(--p)', flexShrink: 0, marginLeft: 6 }} />}
                  </div>
                )
              })
            )}
          </div>

          {value && (
            <div style={{ padding: '5px 8px', borderTop: '1px solid var(--border)' }}>
              <button type="button"
                style={{ fontSize: '.72rem', color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => { onChange(null); setOpen(false) }}
              >
                <X size={11} /> Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
