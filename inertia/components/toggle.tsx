export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange() }}
      style={{
        flexShrink: 0,
        width: 40, height: 22, borderRadius: 11,
        background: checked ? 'var(--p)' : 'var(--border)',
        border: 'none', padding: 0,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background .2s',
        outline: 'none',
        display: 'flex', alignItems: 'center',
      }}
    >
      <span style={{
        display: 'block',
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 21 : 3,
        transition: 'left .2s',
        boxShadow: '0 1px 4px rgba(0,0,0,.22)',
      }} />
    </button>
  )
}
