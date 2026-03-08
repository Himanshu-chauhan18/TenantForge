import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  footer?: React.ReactNode
  /** Icon shown in header */
  icon?: React.ReactNode
  /** Controls icon bg/text colour */
  variant?: 'default' | 'danger' | 'warning'
}

/**
 * Reusable modal with smooth CSS-driven animation.
 *
 * Always stays mounted — the `open` prop toggles the CSS `open` class which
 * drives all transitions via the existing .ov / .modal CSS rules.
 * No JS timers or RAF needed, so rapid open/close cycles never cause glitches.
 */
export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  icon,
  variant = 'default',
}: ModalProps) {
  // Escape key closes the modal
  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [open, onClose])

  const sizeClass = size === 'sm' ? ' modal-sm' : size === 'lg' ? ' modal-lg' : ''

  const iconBg =
    variant === 'danger'  ? 'var(--danger-lt)' :
    variant === 'warning' ? 'var(--warn-lt)'   : 'var(--p-lt)'
  const iconColor =
    variant === 'danger'  ? 'var(--danger)' :
    variant === 'warning' ? 'var(--warn)'   : 'var(--p)'

  return (
    <>
      {/* Backdrop — purely visual (blur + dim), no pointer-events handling */}
      <div className={`ov${open ? ' open' : ''}`} />

      {/*
        Centering container — clicking the empty area around the modal closes it.
        The modal itself stops propagation so inner clicks don't bubble here.
      */}
      <div
        className={`ov${open ? ' open' : ''}`}
        style={{
          zIndex: 1001,
          background: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none' as any,
        }}
        onClick={onClose}
      >
        <div
          className={`modal${sizeClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mh">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {icon && (
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: iconBg, color: iconColor,
                }}>
                  {icon}
                </div>
              )}
              <span className="mt">{title}</span>
            </div>
            <button className="xbtn" onClick={onClose} type="button">
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="mb">{children}</div>

          {/* Footer */}
          {footer && <div className="mf">{footer}</div>}
        </div>
      </div>
    </>
  )
}
