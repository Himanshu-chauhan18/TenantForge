import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { DateTime } from 'luxon'

const CAL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const CAL_DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function fmtDate(d: Date) { return DateTime.fromJSDate(d).toISODate()! }

interface CalPos {
  top?: number
  bottom?: number
  left: number
  width: number
}

export function DatePicker({ value, onChange, min, max, placeholder }: {
  value: string
  onChange: (v: string) => void
  min?: string
  max?: string
  placeholder?: string
}) {
  const [open, setOpen]             = useState(false)
  const [calPos, setCalPos]         = useState<CalPos | null>(null)
  const [viewYear, setViewYear]     = useState(0)
  const [viewMonth, setViewMonth]   = useState(0)
  const [viewMode, setViewMode]     = useState<'month' | 'year'>('month')
  const [yearRangeStart, setYearRangeStart] = useState(0)

  // ref for the trigger; calRef for the portal calendar
  const ref    = useRef<HTMLDivElement>(null)
  const calRef = useRef<HTMLDivElement>(null)
  const today  = DateTime.now().toISODate()!

  // Close on outside click — check BOTH the trigger AND the portal calendar
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const inTrigger = ref.current?.contains(e.target as Node)
      const inCal     = calRef.current?.contains(e.target as Node)
      if (!inTrigger && !inCal) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Close on scroll/resize to prevent stale positioning
  // Skip if the scroll happened inside the calendar itself
  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (calRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  function handleToggle() {
    if (!open && ref.current) {
      const rect       = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const calH       = 340
      if (spaceBelow < calH && rect.top > calH) {
        setCalPos({ bottom: window.innerHeight - rect.top + 5, left: rect.left, width: rect.width })
      } else {
        setCalPos({ top: rect.bottom + 5, left: rect.left, width: rect.width })
      }
    }
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (open) {
      const base = value ? DateTime.fromISO(value) : DateTime.now()
      const y    = base.year
      setViewYear(y)
      setViewMonth(base.month - 1)  // Luxon months 1-based → 0-based for view
      setViewMode('month')
      setYearRangeStart(Math.floor(y / 12) * 12)
    }
  }, [open])

  function formatDisplay(v: string) {
    if (!v) return ''
    return DateTime.fromISO(v).toFormat('dd MMM yyyy')
  }

  function getDaysInMonth(y: number, m: number) { return DateTime.local(y, m + 1, 1).daysInMonth! }
  function getFirstDay(y: number, m: number) {
    const wd = DateTime.local(y, m + 1, 1).weekday  // 1=Mon…7=Sun
    return wd === 7 ? 0 : wd                          // → 0=Sun,1=Mon…6=Sat
  }

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
  function selectYear(y: number) { setViewYear(y); setViewMode('month') }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay    = getFirstDay(viewYear, viewMonth)
  const years       = Array.from({ length: 12 }, (_, i) => yearRangeStart + i)

  const calendar = open && calPos ? (
    <div
      ref={calRef}
      style={{
        position: 'fixed',
        top: calPos.top,
        bottom: calPos.bottom,
        left: calPos.left,
        zIndex: 99999,
        width: Math.max(calPos.width, 260),
        minWidth: 260,
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,.18)',
        padding: '14px 12px',
        animation: 'calIn .15s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        {viewMode === 'month' ? (
          <>
            <button type="button" onClick={prevMonth}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
              <ChevronLeft size={13} />
            </button>
            <button type="button" onClick={() => setViewMode('year')}
              style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--text1)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', padding: '3px 10px' }}>
              {CAL_MONTHS[viewMonth]} {viewYear}
            </button>
            <button type="button" onClick={nextMonth}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
              <ChevronRight size={13} />
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setYearRangeStart((s) => s - 12)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
              <ChevronLeft size={13} />
            </button>
            <button type="button" onClick={() => setViewMode('month')}
              style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--p)', background: 'var(--p-lt)', border: '1px solid var(--p-mid)', borderRadius: 7, cursor: 'pointer', padding: '3px 10px' }}>
              {yearRangeStart} – {yearRangeStart + 11}
            </button>
            <button type="button" onClick={() => setYearRangeStart((s) => s + 12)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
              <ChevronRight size={13} />
            </button>
          </>
        )}
      </div>

      {viewMode === 'year' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {years.map((y) => {
            const isCur = y === viewYear
            const isNow = y === DateTime.now().year
            return (
              <button key={y} type="button" onClick={() => selectYear(y)}
                style={{ padding: '7px 4px', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: '.78rem', fontWeight: isCur ? 700 : isNow ? 600 : 400, background: isCur ? 'var(--p)' : isNow ? 'var(--p-lt)' : 'transparent', color: isCur ? '#fff' : isNow ? 'var(--p)' : 'var(--text1)', transition: 'background .12s, color .12s' }}>
                {y}
              </button>
            )
          })}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {CAL_DAYS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '.64rem', color: 'var(--text3)', fontWeight: 700, padding: '2px 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`_${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day      = i + 1
              const dateStr  = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isSel    = dateStr === value
              const isToday  = dateStr === today
              const disabled = isDisabled(dateStr)
              return (
                <button key={day} type="button" disabled={disabled} onClick={() => selectDay(day)}
                  style={{ textAlign: 'center', fontSize: '.78rem', padding: '6px 2px', border: 'none', borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer', background: isSel ? 'var(--p)' : isToday ? 'var(--p-lt)' : 'transparent', color: isSel ? '#fff' : disabled ? 'var(--text4)' : isToday ? 'var(--p)' : 'var(--text1)', fontWeight: isSel || isToday ? 700 : 400, transition: 'background .12s, color .12s' }}>
                  {day}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Footer */}
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
  ) : null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="fi"
        onClick={handleToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', height: 36, padding: '0 10px' }}
      >
        <Calendar size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} />
        <span style={{ flex: 1, color: value ? 'var(--text1)' : 'var(--text4)', fontSize: '.82rem' }}>
          {value ? formatDisplay(value) : (placeholder || 'Select date…')}
        </span>
        {value ? (
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4 }}>
            <X size={12} />
          </button>
        ) : (
          <ChevronDown size={13} style={{ color: 'var(--text3)', flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
        )}
      </div>

      {typeof document !== 'undefined' && createPortal(calendar, document.body)}
    </div>
  )
}
