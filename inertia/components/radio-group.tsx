export interface RadioOption {
  value: string
  label: string
  desc?: string
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string
  value: string
  onChange: (v: string) => void
  options: RadioOption[]
}) {
  return (
    <div className="radio-g">
      {options.map((o) => (
        <label key={o.value} className={`rc ${value === o.value ? 'on' : ''}`} style={{ cursor: 'pointer' }}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <div className="rc-dot" />
          <div>
            <div className="rc-title">{o.label}</div>
            {o.desc && <div className="rc-desc">{o.desc}</div>}
          </div>
        </label>
      ))}
    </div>
  )
}
