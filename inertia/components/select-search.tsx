import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search, Check, X } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  sub?: string
}

interface DropPos {
  top?: number
  bottom?: number
  left: number
  width: number
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
  const [open, setOpen]       = useState(false)
  const [search, setSearch]   = useState('')
  const [dropPos, setDropPos] = useState<DropPos | null>(null)

  // ref for the trigger wrapper; dropdownRef for the portal'd dropdown
  const ref         = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click — check BOTH the trigger AND the portal dropdown
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const inTrigger  = ref.current?.contains(e.target as Node)
      const inDropdown = dropdownRef.current?.contains(e.target as Node)
      if (!inTrigger && !inDropdown) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Close on scroll or resize to prevent stale positioning
  // Skip if the scroll happened inside the dropdown itself
  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return
      setOpen(false); setSearch('')
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  function handleOpen() {
    if (!open && ref.current) {
      const rect       = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dropH      = 280
      if (spaceBelow < dropH && rect.top > dropH) {
        setDropPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width })
      } else {
        setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
      }
    }
    setOpen((o) => !o)
    setSearch('')
  }

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options
  const selected = options.find((o) => o.value === value)

  const dropdown = open && dropPos ? (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropPos.top,
        bottom: dropPos.bottom,
        left: dropPos.left,
        width: dropPos.width,
        minWidth: 180,
        zIndex: 99999,
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 10,
        boxShadow: '0 8px 28px rgba(0,0,0,.14)',
        padding: 4,
        animation: 'calIn .13s ease',
        overflow: 'hidden',
      }}
      onWheel={(e) => e.stopPropagation()}
    >
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
          <button
            type="button"
            style={{ fontSize: '.72rem', color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => { onChange(''); setOpen(false) }}
          >
            <X size={11} /> Clear
          </button>
        </div>
      )}
    </div>
  ) : null

  return (
    <div ref={ref} className="combo-wrap">
      <button
        type="button"
        className="fi"
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'left' }}
        onClick={handleOpen}
      >
        <span style={{ flex: 1, color: selected ? 'var(--text1)' : 'var(--text4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={13} style={{ flexShrink: 0, color: 'var(--text3)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  )
}
