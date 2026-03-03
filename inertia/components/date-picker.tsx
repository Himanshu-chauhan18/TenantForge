import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'

const CAL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const CAL_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function fmtDate(d: Date) { return d.toISOString().slice(0, 10) }

export function DatePicker({ value, onChange, min, max, placeholder }: {
  value: string
  onChange: (v: string) => void
  min?: string
  max?: string
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const [viewYear, setViewYear] = useState(0)
  const [viewMonth, setViewMonth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const today = fmtDate(new Date())

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  function handleToggle() {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropUp(window.innerHeight - rect.bottom < 340)
    }
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (open) {
      const base = value ? new Date(value + 'T00:00:00') : new Date()
      setViewYear(base.getFullYear())
      setViewMonth(base.getMonth())
    }
  }, [open])

  function formatDisplay(v: string) {
    if (!v) return ''
    const d = new Date(v + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
  function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay() }

  function isDisabled(dateStr: string) {
    if (min && dateStr < min) return true
    if (max && dateStr > max) return true
    return false
  }

  function selectDay(day: number) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (!isDisabled(dateStr)) { onChange(dateStr); setOpen(false) }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDay(viewYear, viewMonth)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="fi"
        onClick={handleToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', minHeight: 36 }}
      >
        <Calendar size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} />
        <span style={{ flex: 1, color: value ? 'var(--text1)' : 'var(--text4)', fontSize: '.82rem' }}>
          {value ? formatDisplay(value) : (placeholder || 'Select date…')}
        </span>
        {value ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4 }}
          >
            <X size={12} />
          </button>
        ) : (
          <ChevronDown size={13} style={{ color: 'var(--text3)', flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute',
          ...(dropUp ? { bottom: 'calc(100% + 5px)' } : { top: 'calc(100% + 5px)' }),
          left: 0, zIndex: 400,
          background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 14,
          boxShadow: '0 12px 40px rgba(0,0,0,.16)', padding: '14px 12px', width: '100%', minWidth: 260,
          animation: 'calIn .15s ease',
        }}>
          {/* Month / Year header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button type="button" onClick={prevMonth}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, transition: 'background .15s' }}>
              <ChevronLeft size={13} />
            </button>
            <span style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--text1)', letterSpacing: '.01em' }}>
              {CAL_MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, transition: 'background .15s' }}>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Weekday labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {CAL_DAYS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '.64rem', color: 'var(--text3)', fontWeight: 700, padding: '2px 0' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`_${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isSel = dateStr === value
              const isToday = dateStr === today
              const disabled = isDisabled(dateStr)
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  style={{
                    textAlign: 'center', fontSize: '.78rem', padding: '6px 2px', border: 'none',
                    borderRadius: 7,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: isSel ? 'var(--p)' : isToday ? 'var(--p-lt)' : 'transparent',
                    color: isSel ? '#fff' : disabled ? 'var(--text4)' : isToday ? 'var(--p)' : 'var(--text1)',
                    fontWeight: isSel || isToday ? 700 : 400,
                    transition: 'background .12s, color .12s',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer shortcuts */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => { onChange(today); setOpen(false) }}
              style={{ flex: 1, fontSize: '.72rem', color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', cursor: 'pointer', borderRadius: 6, padding: '4px 8px', fontWeight: 600 }}>
              Today
            </button>
            {value && (
              <button type="button" onClick={() => { onChange(''); setOpen(false) }}
                style={{ flex: 1, fontSize: '.72rem', color: 'var(--text3)', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: 6, padding: '4px 8px' }}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
