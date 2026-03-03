import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check, X } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  sub?: string
}

export function SelectSearch({
  value,
  onChange,
  options,
  placeholder = 'Select...',
}: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setSearch('')
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options
  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="combo-wrap">
      <button
        type="button"
        className="fi"
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'left' }}
        onClick={() => { setOpen((o) => !o); setSearch('') }}
      >
        <span style={{ flex: 1, color: selected ? 'var(--text1)' : 'var(--text4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                style={{ paddingLeft: 18, color: 'var(--text1)', width: '100%', fontSize: '.82rem', background: 'none', border: 'none', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div className="combo-empty">No results found</div>
            ) : (
              filtered.map((o) => {
                const isSel = value === o.value
                return (
                  <div
                    key={o.value}
                    className="combo-option"
                    data-selected={String(isSel)}
                    onClick={() => { onChange(o.value); setOpen(false); setSearch('') }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div>{o.label}</div>
                      {o.sub && <div style={{ fontSize: '.68rem', color: isSel ? 'var(--p)' : 'var(--text3)' }}>{o.sub}</div>}
                    </div>
                    {isSel && <Check size={13} style={{ flexShrink: 0, color: 'var(--p)' }} />}
                  </div>
                )
              })
            )}
          </div>

          {value && (
            <div style={{ padding: '5px 8px', borderTop: '1px solid var(--border)' }}>
              <button type="button"
                style={{ fontSize: '.72rem', color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => { onChange(''); setOpen(false) }}
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
