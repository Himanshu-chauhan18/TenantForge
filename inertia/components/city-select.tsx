import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check, X, Loader2 } from 'lucide-react'

export interface CityOption {
  id: number
  name: string
  countryId: number
  countryCode: string
}

export function CitySelect({
  value,
  onChange,
  countryId,
}: {
  value: CityOption | null
  onChange: (o: CityOption | null) => void
  countryId: number | null
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<CityOption[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const disabled = !countryId

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => { setOptions([]); setSearch(''); setOpen(false) }, [countryId])

  useEffect(() => {
    if (open && countryId) { setSearch(''); setOptions([]); load('') }
  }, [open])

  async function load(q: string) {
    if (!countryId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cities?country_id=${countryId}&search=${encodeURIComponent(q)}`)
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
        disabled={disabled}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .55 : 1, textAlign: 'left' }}
        onClick={() => { if (!disabled) setOpen((o) => !o) }}
      >
        <span style={{ flex: 1, color: value ? 'var(--text1)' : 'var(--text4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value ? value.name : (disabled ? 'Select country first' : 'Select city…')}
        </span>
        <ChevronDown size={13} style={{ flexShrink: 0, color: 'var(--text3)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && !disabled && (
        <div className="combo-options" style={{ zIndex: 300, boxShadow: '0 8px 28px rgba(0,0,0,.12)' }}>
          <div className="combo-search">
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search city…"
                style={{ paddingLeft: 18, width: '100%', fontSize: '.82rem', background: 'none', border: 'none', outline: 'none', color: 'var(--text1)' }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {loading ? (
              <div className="combo-empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Loading cities…
              </div>
            ) : options.length === 0 ? (
              <div className="combo-empty">No cities found</div>
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
                    <span style={{ flex: 1 }}>{c.name}</span>
                    {isSel && <Check size={13} style={{ color: 'var(--p)', flexShrink: 0 }} />}
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
                <X size={11} /> Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
