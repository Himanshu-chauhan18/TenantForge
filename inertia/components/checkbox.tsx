import type { ReactNode } from 'react'

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  children,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <label className="mod-addon-item" style={{ cursor: disabled ? 'default' : 'pointer' }}>
      <input
        type="checkbox"
        className="ck"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      />
      <span>{children}</span>
    </label>
  )
}
