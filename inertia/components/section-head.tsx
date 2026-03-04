interface SectionHeadProps {
  icon: React.ReactNode
  title: string
  sub?: string
}

export function SectionHead({ icon, title, sub }: SectionHeadProps) {
  return (
    <div className="sec-head">
      <div className="sec-icon" style={{ background: 'var(--p-lt)', color: 'var(--p)' }}>{icon}</div>
      <div>
        <div className="sec-title">{title}</div>
        {sub && <div className="sec-sub">{sub}</div>}
      </div>
    </div>
  )
}
